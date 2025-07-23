import { supabase } from './supabase';
import { GeneratedDocument, DocumentTemplate } from '../types/documents';
import { documentTemplates } from './documentTemplates';
import { localDocumentStorage } from './localDocumentStorage';

// Fonction pour générer un UUID valide
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class DocumentStorage {
  private bucketName = 'documents';
  private bucketInitialized = false;
  
  // Get current user ID
  private async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
  
  // Initialize the bucket
  private async initializeBucket(): Promise<boolean> {
    if (this.bucketInitialized) {
      return true;
    }
    
    try {
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && 
                                  !supabaseUrl.includes('your-project-id') && 
                                  !supabaseAnonKey.includes('your-anon-key');
      
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured. Using localStorage fallback.');
        return false;
      }
      
      // Call the create-bucket function once
      try {
        const createBucketUrl = `${supabaseUrl}/functions/v1/create-bucket`;
        const response = await fetch(createBucketUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Bucket creation result:', result);
          this.bucketInitialized = true;
          return true;
        } else {
          console.warn('Failed to call create-bucket function:', response.status);
          return false;
        }
      } catch (createBucketError) {
        console.warn('Error calling create-bucket function:', createBucketError);
        return false;
      }
      
      // Try to create the bucket (this will fail silently if it already exists)
      try {
        const { error: createError } = await supabase.storage.createBucket(this.bucketName, {
          public: false,
          allowedMimeTypes: ['application/json', 'text/html', 'application/pdf'],
          fileSizeLimit: 10485760 // 10MB
        });
        
        if (createError && !createError.message.includes('already exists')) {
          console.warn('Error creating bucket:', createError);
        }
      } catch (createError) {
        console.warn('Error creating bucket:', createError);
      }
      
      // Test if we can access the bucket
      const { error: testError } = await supabase.storage
        .from(this.bucketName)
        .list('', { limit: 1 });
      
      if (testError) {
        console.warn('Could not access bucket:', testError);
        return false;
      }
      
      this.bucketInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing bucket:', error);
      return false;
    }
  }

  // Sauvegarder un document généré
  async saveDocument(document: GeneratedDocument): Promise<GeneratedDocument> {
    try {
      // Try to initialize Supabase bucket first
      const bucketReady = await this.initializeBucket();
      
      if (bucketReady) {
        // Try to save to Supabase with PDF data
        try {
          const userId = await this.getCurrentUserId();
          if (!userId) {
            throw new Error('User not authenticated');
          }
          
          // Create a copy without PDF data for Supabase to avoid payload too large error
          const documentForSupabase = { ...document };
          if (documentForSupabase.metadata.pdfData) {
            documentForSupabase.metadata = { ...documentForSupabase.metadata };
            delete documentForSupabase.metadata.pdfData;
          }
          
          const documentData = JSON.stringify(documentForSupabase);
          const fileName = `${userId}/${document.id}.json`;
          
          const { error } = await supabase.storage
            .from(this.bucketName)
            .upload(fileName, documentData, {
              contentType: 'application/json',
              upsert: true
            });
          
          if (!error) {
            console.log('Document saved to Supabase successfully');
            // Also save to localStorage as backup
            await localDocumentStorage.saveDocument(document);
            return document;
          } else {
            console.warn('Failed to save to Supabase:', error);
          }
        } catch (supabaseError) {
          console.warn('Error saving to Supabase:', supabaseError);
        }
      }
      
      // Fallback to localStorage but remove PDF data to prevent quota issues
      console.warn('Falling back to localStorage for document storage');
      const documentForLocalStorage = { ...document };
      
      // Remove large PDF data from metadata to prevent quota exceeded error
      if (documentForLocalStorage.metadata.pdfData) {
        delete documentForLocalStorage.metadata.pdfData;
        console.warn('PDF data removed from document to fit in localStorage');
      }
      
      return await localDocumentStorage.saveDocument(documentForLocalStorage);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du document dans Supabase:', error);
      console.warn('Falling back to localStorage for document storage');
      
      // Remove PDF data before saving to localStorage
      const documentForLocalStorage = { ...document };
      if (documentForLocalStorage.metadata.pdfData) {
        delete documentForLocalStorage.metadata.pdfData;
        console.warn('PDF data removed from document to fit in localStorage');
      }
      
      return await localDocumentStorage.saveDocument(documentForLocalStorage);
    }
  }
  
  // Fallback method to save document to localStorage
  private saveDocumentToLocalStorage(document: GeneratedDocument): Promise<GeneratedDocument> {
    try {
      const STORAGE_KEY = 'easybail_documents';
      
      // Initialize storage if needed
      if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      }
      
      // Get existing documents
      const documentsJson = localStorage.getItem(STORAGE_KEY);
      const documents = documentsJson ? JSON.parse(documentsJson) : [];
      
      // Find if document already exists
      const existingIndex = documents.findIndex((d: any) => d.id === document.id);
      
      if (existingIndex >= 0) {
        documents[existingIndex] = document;
      } else {
        documents.push(document);
      }
      
      // Save updated documents
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
      
      return Promise.resolve(document);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du document:', error);
      throw error;
    }
  }

  // Récupérer tous les documents
  async getDocumentsList(): Promise<GeneratedDocument[]> {
    try {
      // Try to get from Supabase first
      const bucketReady = await this.initializeBucket();
      
      if (bucketReady) {
        try {
          const userId = await this.getCurrentUserId();
          if (!userId) {
            throw new Error('User not authenticated');
          }
          
          const { data: files, error } = await supabase.storage
            .from(this.bucketName)
            .list(userId, { limit: 100 });
          
          if (!error && files) {
            const documents: GeneratedDocument[] = [];
            
            for (const file of files) {
              if (file.name.endsWith('.json')) {
                try {
                  const { data: fileData } = await supabase.storage
                    .from(this.bucketName)
                    .download(`${userId}/${file.name}`);
                  
                  if (fileData) {
                    const text = await fileData.text();
                    const document = JSON.parse(text);
                    
                    // Convert dates
                    document.createdAt = new Date(document.createdAt);
                    document.updatedAt = new Date(document.updatedAt);
                    if (document.signedAt) document.signedAt = new Date(document.signedAt);
                    if (document.expiresAt) document.expiresAt = new Date(document.expiresAt);
                    
                    documents.push(document);
                  }
                } catch (parseError) {
                  console.warn('Error parsing document file:', parseError);
                }
              }
            }
            
            console.log('Documents loaded from Supabase successfully');
            return documents;
          }
        } catch (supabaseError) {
          console.warn('Error loading from Supabase:', supabaseError);
        }
      }
      
      // Fallback to localStorage
      console.warn('Falling back to localStorage for document retrieval');
      return this.getDocumentsFromLocalStorage();
    } catch (error) {
      console.error('Error in getDocumentsList:', error);
      // Fallback to localStorage
      return this.getDocumentsFromLocalStorage();
    }
  }

  // Fallback method to get documents from localStorage
  private getDocumentsFromLocalStorage(): Promise<GeneratedDocument[]> {
    try {
      return localDocumentStorage.getDocumentsList();
    } catch (error) {
      console.error('Error loading documents from localStorage:', error);
      return Promise.resolve([]);
      }
  }

  // Récupérer un document par ID
  async getDocument(id: string): Promise<GeneratedDocument | null> {
    try {
      // Try to get from Supabase first
      const bucketReady = await this.initializeBucket();
      
      if (bucketReady) {
        try {
          const userId = await this.getCurrentUserId();
          if (!userId) {
            console.warn('User not authenticated, falling back to localStorage');
            return this.getDocumentFromLocalStorage(id);
          }
          
          const { data: fileData } = await supabase.storage
            .from(this.bucketName)
            .download(`${userId}/${id}.json`);
          
          if (fileData) {
            const text = await fileData.text();
            const document = JSON.parse(text);
            
            // Convert dates
            document.createdAt = new Date(document.createdAt);
            document.updatedAt = new Date(document.updatedAt);
            if (document.signedAt) document.signedAt = new Date(document.signedAt);
            if (document.expiresAt) document.expiresAt = new Date(document.expiresAt);
            
            return document;
          }
        } catch (supabaseError) {
          console.warn('Error loading document from Supabase:', supabaseError);
        }
      }
      
      // Fallback to localStorage
      return await localDocumentStorage.getDocument(id);
    } catch (error) {
      console.error('Erreur lors de la récupération du document:', error);
      return null;
    }
  }
  

  // Récupérer les documents par bien
  async getDocumentsByProperty(propertyId: string): Promise<GeneratedDocument[]> {
    try {
      // Try Supabase first, then fallback to localStorage
      try {
        const documents = await this.getDocumentsList();
        return documents.filter(doc => doc.propertyId === propertyId);
      } catch (error) {
        return await localDocumentStorage.getDocumentsByProperty(propertyId);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des documents par bien:', error);
      return [];
    }
  }

  // Récupérer les documents par locataire
  async getDocumentsByTenant(tenantId: string): Promise<GeneratedDocument[]> {
    try {
      // Try Supabase first, then fallback to localStorage
      try {
        const documents = await this.getDocumentsList();
        return documents.filter(doc => doc.tenantId === tenantId);
      } catch (error) {
        return await localDocumentStorage.getDocumentsByTenant(tenantId);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des documents par locataire:', error);
      return [];
    }
  }

  // Mettre à jour le statut d'un document
  async updateDocumentStatus(id: string, status: GeneratedDocument['status']): Promise<GeneratedDocument> {
    try {
      // Try Supabase first, then fallback to localStorage
      try {
        // Get the document first
        const document = await this.getDocument(id);
        
        if (!document) {
          throw new Error('Document non trouvé');
        }
        
        // Mettre à jour le statut
        document.status = status;
        document.updatedAt = new Date();
        
        if (status === 'signed') {
          document.signedAt = new Date();
        }
        
        // Save the updated document
        await this.saveDocument(document);
        
        return document;
      } catch (error) {
        return await localDocumentStorage.updateDocumentStatus(id, status);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut du document:', error);
      throw error;
    }
  }

  // Supprimer un document
  async deleteDocument(id: string): Promise<void> {
    try {
      // Try to delete from Supabase first
      const bucketReady = await this.initializeBucket();
      
      if (bucketReady) {
        try {
          const userId = await this.getCurrentUserId();
          if (!userId) {
            throw new Error('User not authenticated');
          }
          
          const { error } = await supabase.storage
            .from(this.bucketName)
            .remove([`${userId}/${id}.json`]);
          
          if (!error) {
            console.log('Document deleted from Supabase successfully');
            return;
          } else {
            console.warn('Failed to delete from Supabase:', error);
          }
        } catch (supabaseError) {
          console.warn('Error deleting from Supabase:', supabaseError);
        }
      }
      
      // Fallback to localStorage
      console.warn('Falling back to localStorage for document deletion');
      await localDocumentStorage.deleteDocument(id);
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      throw error;
    }
  }

  // Récupérer les templates disponibles
  async getTemplates(): Promise<DocumentTemplate[]> {
    return documentTemplates;
  }

  // Rechercher des documents
  async searchDocuments(query: string): Promise<GeneratedDocument[]> {
    try {
      // Try Supabase first, then fallback to localStorage
      try {
        const documents = await this.getDocumentsList();
        const lowercaseQuery = query.toLowerCase();
        
        return documents.filter(doc => 
          doc.name.toLowerCase().includes(lowercaseQuery) ||
          doc.type.toLowerCase().includes(lowercaseQuery) ||
          doc.content.toLowerCase().includes(lowercaseQuery)
        );
      } catch (error) {
        return await localDocumentStorage.searchDocuments(query);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de documents:', error);
      return [];
    }
  }

  // Obtenir les statistiques des documents
  async getDocumentStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    recent: number;
  }> {
    try {
      // Try Supabase first, then fallback to localStorage
      try {
        const documents = await this.getDocumentsList();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const stats = {
          total: documents.length,
          byStatus: {} as Record<string, number>,
          byType: {} as Record<string, number>,
          recent: documents.filter(doc => doc.createdAt > oneWeekAgo).length
        };
        
        documents.forEach(doc => {
          stats.byStatus[doc.status] = (stats.byStatus[doc.status] || 0) + 1;
          stats.byType[doc.type] = (stats.byType[doc.type] || 0) + 1;
        });
        
        return stats;
      } catch (error) {
        const localStats = await localDocumentStorage.getDocumentStats();
        return {
          total: localStats.total,
          byStatus: localStats.byStatus,
          byType: localStats.byType,
          recent: localStats.recent
        };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        total: 0,
        byStatus: {},
        byType: {},
        recent: 0
      };
    }
  }

  // Obtenir l'URL publique d'un document (pour le partage)
  async getPublicUrl(id: string): Promise<string | null> {
    try {
      // Pour le stockage local, on ne peut pas créer d'URL publique
      // On pourrait implémenter une solution avec Blob URLs si nécessaire
      console.warn('getPublicUrl n\'est pas disponible en mode stockage local');
      return null;
    } catch (error) {
      console.error('Erreur lors de la génération de l\'URL publique:', error);
      return null;
    }
  }
}

export const documentStorage = new DocumentStorage();
