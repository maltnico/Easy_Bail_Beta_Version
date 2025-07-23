import { supabase } from './supabase';
import { GeneratedDocument, DocumentTemplate } from '../types/documents';
import { documentTemplates } from './documentTemplates';
import { activityService } from './activityService';

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
        
        if (createError) {
          // Only warn if it's not the "already exists" error
          const errorMessage = (createError as any)?.message || '';
          if (!errorMessage.includes('already exists')) {
            console.warn('Error creating bucket:', createError);
          }
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
      // Sauvegarder d'abord dans la table documents de Supabase
      await this.saveToDatabase(document);
      
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
            return document;
          } else {
            console.warn('Failed to save to Supabase:', error);
          }
        } catch (supabaseError) {
          console.warn('Error saving to Supabase:', supabaseError);
        }
      }
      
      // Fallback to localStorage
      console.warn('Falling back to localStorage for document storage');
      return await this.saveDocumentToLocalStorage(document);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du document:', error);
      // Final fallback to localStorage
      return await this.saveDocumentToLocalStorage(document);
    }
  }
  
  // Nouvelle méthode pour sauvegarder dans la table documents
  private async saveToDatabase(document: GeneratedDocument): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error('Utilisateur non connecté');
      }

      // Préparer les données pour la table documents
      const documentData = {
        id: document.id,
        user_id: userData.user.id,
        property_id: document.propertyId || null,
        tenant_id: document.tenantId || null,
        name: document.name,
        type: document.type,
        content: document.content,
        status: document.status,
        metadata: JSON.stringify({
          ...document.metadata,
          templateId: document.templateId,
          signatures: document.signatures
        }),
        signed_at: document.signedAt?.toISOString() || null,
        expires_at: document.expiresAt?.toISOString() || null
      };

      // Vérifier si le document existe déjà
      const { data: existingDoc } = await supabase
        .from('documents')
        .select('id')
        .eq('id', document.id)
        .single();

      if (existingDoc) {
        // Mettre à jour le document existant
        const { error } = await supabase
          .from('documents')
          .update(documentData)
          .eq('id', document.id);
        
        if (error) throw error;
      } else {
        // Insérer un nouveau document
        const { error } = await supabase
          .from('documents')
          .insert(documentData);
        
        if (error) throw error;
      }

      // Log activity
      try {
        await activityService.addActivity({
          type: 'document',
          action: existingDoc ? 'updated' : 'created',
          title: `Document ${existingDoc ? 'mis à jour' : 'créé'}`,
          description: document.name,
          entityId: document.id,
          entityType: 'document',
          entityName: document.name,
          userId: userData.user.id,
          metadata: {
            type: document.type,
            status: document.status
          },
          priority: 'medium',
          category: 'success'
        });
      } catch (activityError) {
        console.warn('Could not log document activity:', activityError);
      }
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde en base de données:', error);
      // Ne pas faire échouer complètement, continuer avec le stockage local
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
      // Essayer d'abord de récupérer depuis la base de données
      const documentsFromDB = await this.getDocumentsFromDatabase();
      if (documentsFromDB.length > 0) {
        return documentsFromDB;
      }
      
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

  // Nouvelle méthode pour récupérer depuis la base de données
  private async getDocumentsFromDatabase(): Promise<GeneratedDocument[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return [];
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convertir les données de la base vers le format GeneratedDocument
      return (data || []).map(doc => {
        const metadata = typeof doc.metadata === 'string' 
          ? JSON.parse(doc.metadata) 
          : doc.metadata || {};
        
        return {
          id: doc.id,
          templateId: metadata.templateId || '',
          userId: doc.user_id,
          name: doc.name,
          type: doc.type as any,
          status: doc.status as any,
          propertyId: doc.property_id,
          tenantId: doc.tenant_id,
          data: {},
          content: doc.content,
          signatures: metadata.signatures || [],
          createdAt: new Date(doc.created_at),
          updatedAt: new Date(doc.updated_at),
          signedAt: doc.signed_at ? new Date(doc.signed_at) : undefined,
          expiresAt: doc.expires_at ? new Date(doc.expires_at) : undefined,
          metadata: {
            version: metadata.version || '1.0',
            generatedBy: metadata.generatedBy || 'EasyBail Document Generator',
            legalFramework: metadata.legalFramework || '',
            pdfData: metadata.pdfData
          }
        } as GeneratedDocument;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération depuis la base de données:', error);
      return [];
    }
  }

  // Fallback method to get documents from localStorage
  private getDocumentsFromLocalStorage(): Promise<GeneratedDocument[]> {
    try {
      const STORAGE_KEY = 'easybail_documents';
      const documentsJson = localStorage.getItem(STORAGE_KEY);
      
      if (!documentsJson) {
        return Promise.resolve([]);
      }
      
      const documents = JSON.parse(documentsJson);
      
      // Convert date strings back to Date objects
      const convertedDocuments = documents.map((doc: any) => ({
        ...doc,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
        signedAt: doc.signedAt ? new Date(doc.signedAt) : undefined,
        expiresAt: doc.expiresAt ? new Date(doc.expiresAt) : undefined
      }));
      
      return Promise.resolve(convertedDocuments);
    } catch (error) {
      console.error('Error loading documents from localStorage:', error);
      return Promise.resolve([]);
    }
  }

  // Get single document from localStorage
  private async getDocumentFromLocalStorage(id: string): Promise<GeneratedDocument | null> {
    try {
      const documents = await this.getDocumentsFromLocalStorage();
      return documents.find(doc => doc.id === id) || null;
    } catch (error) {
      console.error('Error getting document from localStorage:', error);
      return null;
    }
  }

  // Récupérer un document par ID
  async getDocument(id: string): Promise<GeneratedDocument | null> {
    try {
      // Essayer d'abord depuis la base de données
      const docFromDB = await this.getDocumentFromDatabase(id);
      if (docFromDB) {
        return docFromDB;
      }
      
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
      return await this.getDocumentFromLocalStorage(id);
    } catch (error) {
      console.error('Erreur lors de la récupération du document:', error);
      return null;
    }
  }
  
  // Nouvelle méthode pour récupérer un document depuis la base
  private async getDocumentFromDatabase(id: string): Promise<GeneratedDocument | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return null;
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .eq('user_id', userData.user.id)
        .single();

      if (error) throw error;
      if (!data) return null;

      const metadata = typeof data.metadata === 'string' 
        ? JSON.parse(data.metadata) 
        : data.metadata || {};
      
      return {
        id: data.id,
        templateId: metadata.templateId || '',
        userId: data.user_id,
        name: data.name,
        type: data.type as any,
        status: data.status as any,
        propertyId: data.property_id,
        tenantId: data.tenant_id,
        data: {},
        content: data.content,
        signatures: metadata.signatures || [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        signedAt: data.signed_at ? new Date(data.signed_at) : undefined,
        expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
        metadata: {
          version: metadata.version || '1.0',
          generatedBy: metadata.generatedBy || 'EasyBail Document Generator',
          legalFramework: metadata.legalFramework || '',
          pdfData: metadata.pdfData
        }
      } as GeneratedDocument;
    } catch (error) {
      console.error('Erreur lors de la récupération du document depuis la base:', error);
      return null;
    }
  }

  // Récupérer les documents par bien
  async getDocumentsByProperty(propertyId: string): Promise<GeneratedDocument[]> {
    try {
      const documents = await this.getDocumentsList();
      return documents.filter(doc => doc.propertyId === propertyId);
    } catch (error) {
      console.error('Erreur lors de la récupération des documents par bien:', error);
      return [];
    }
  }

  // Récupérer les documents par locataire
  async getDocumentsByTenant(tenantId: string): Promise<GeneratedDocument[]> {
    try {
      const documents = await this.getDocumentsList();
      return documents.filter(doc => doc.tenantId === tenantId);
    } catch (error) {
      console.error('Erreur lors de la récupération des documents par locataire:', error);
      return [];
    }
  }

  // Mettre à jour le statut d'un document
  async updateDocumentStatus(id: string, status: GeneratedDocument['status']): Promise<GeneratedDocument> {
    try {
      // Mettre à jour d'abord en base de données
      await this.updateDocumentStatusInDatabase(id, status);
      
      // Get the document first
      const document = await this.getDocument(id);
      
      if (!document) {
        throw new Error('Document non trouvé');
      }
      
      // Mettre à jour le statut
      document.status = status;
      document.updatedAt = new Date();
      
      if (status === 'received') {
        document.signedAt = new Date();
      }
      
      // Save the updated document
      await this.saveDocument(document);
      
      return document;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut du document:', error);
      throw error;
    }
  }

  // Nouvelle méthode pour mettre à jour le statut en base
  private async updateDocumentStatusInDatabase(id: string, status: GeneratedDocument['status']): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return;
      }

      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'signed') {
        updateData.signed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userData.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut en base:', error);
    }
  }

  // Supprimer un document
  async deleteDocument(id: string): Promise<void> {
    try {
      // Supprimer d'abord de la base de données
      await this.deleteDocumentFromDatabase(id);
      
      // Try to delete from Supabase first
      const bucketReady = await this.initializeBucket();
      
      if (bucketReady) {
        try {
          const userId = await this.getCurrentUserId();
          if (userId) {
            const { error } = await supabase.storage
              .from(this.bucketName)
              .remove([`${userId}/${id}.json`]);
            
            if (!error) {
              console.log('Document deleted from Supabase successfully');
            } else {
              console.warn('Failed to delete from Supabase:', error);
            }
          }
        } catch (supabaseError) {
          console.warn('Error deleting from Supabase:', supabaseError);
        }
      }
      
      // Always try to delete from localStorage as well
      await this.deleteDocumentFromLocalStorage(id);
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      throw error;
    }
  }

  // Nouvelle méthode pour supprimer de la base
  private async deleteDocumentFromDatabase(id: string): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return;
      }

      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .eq('user_id', userData.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression du document en base:', error);
    }
  }

  // Delete document from localStorage
  private async deleteDocumentFromLocalStorage(id: string): Promise<void> {
    try {
      const STORAGE_KEY = 'easybail_documents';
      const documentsJson = localStorage.getItem(STORAGE_KEY);
      
      if (documentsJson) {
        const documents = JSON.parse(documentsJson);
        const filteredDocuments = documents.filter((doc: any) => doc.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDocuments));
      }
    } catch (error) {
      console.error('Error deleting document from localStorage:', error);
    }
  }

  // Récupérer les templates disponibles
  async getTemplates(): Promise<DocumentTemplate[]> {
    return documentTemplates;
  }

  // Rechercher des documents
  async searchDocuments(query: string): Promise<GeneratedDocument[]> {
    try {
      const documents = await this.getDocumentsList();
      const lowercaseQuery = query.toLowerCase();
      
      return documents.filter(doc => 
        doc.name.toLowerCase().includes(lowercaseQuery) ||
        doc.type.toLowerCase().includes(lowercaseQuery) ||
        doc.content.toLowerCase().includes(lowercaseQuery)
      );
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
      // Try Supabase first
      const bucketReady = await this.initializeBucket();
      
      if (bucketReady) {
        try {
          const userId = await this.getCurrentUserId();
          if (userId) {
            const { data } = await supabase.storage
              .from(this.bucketName)
              .createSignedUrl(`${userId}/${id}.json`, 3600); // 1 hour expiry
            
            if (data?.signedUrl) {
              return data.signedUrl;
            }
          }
        } catch (supabaseError) {
          console.warn('Error getting public URL from Supabase:', supabaseError);
        }
      }
      
      // Pour le stockage local, on ne peut pas créer d'URL publique
      console.warn('getPublicUrl n\'est pas disponible en mode stockage local pour le document:', id);
      return null;
    } catch (error) {
      console.error('Erreur lors de la génération de l\'URL publique:', error);
      return null;
    }
  }
}

export const documentStorage = new DocumentStorage();