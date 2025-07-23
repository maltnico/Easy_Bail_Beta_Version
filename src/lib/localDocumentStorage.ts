import { GeneratedDocument, DocumentTemplate } from '../types/documents';

const STORAGE_KEYS = {
  DOCUMENTS: 'easybail_generated_documents',
  TEMPLATES: 'easybail_document_templates',
  SETTINGS: 'easybail_document_settings'
};

interface DocumentSettings {
  autoSave: boolean;
  maxDocuments: number;
  compressionEnabled: boolean;
}

const DEFAULT_SETTINGS: DocumentSettings = {
  autoSave: true,
  maxDocuments: 1000,
  compressionEnabled: true
};

class LocalDocumentStorage {
  private settings: DocumentSettings;

  constructor() {
    this.settings = this.loadSettings();
    this.initializeStorage();
  }

  private initializeStorage(): void {
    if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
  }

  private loadSettings(): DocumentSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      return DEFAULT_SETTINGS;
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
    }
  }

  private getDocuments(): GeneratedDocument[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (!stored) return [];
      
      const documents = JSON.parse(stored);
      if (!Array.isArray(documents)) {
        console.warn('Documents data is not an array, resetting to empty array');
        this.saveDocuments([]);
        return [];
      }
      
      return documents.map((doc: any) => ({
        ...doc,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
        signedAt: doc.signedAt ? new Date(doc.signedAt) : undefined,
        expiresAt: doc.expiresAt ? new Date(doc.expiresAt) : undefined
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      this.saveDocuments([]);
      return [];
    }
  }

  private saveDocuments(documents: GeneratedDocument[]): void {
    try {
      // Nettoyer les documents si nécessaire
      let cleanedDocuments = documents;
      
      // Limiter le nombre de documents
      if (cleanedDocuments.length > this.settings.maxDocuments) {
        cleanedDocuments = cleanedDocuments
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, this.settings.maxDocuments);
      }

      // Compresser les données si activé
      if (this.settings.compressionEnabled) {
        cleanedDocuments = cleanedDocuments.map(doc => ({
          ...doc,
          metadata: {
            ...doc.metadata,
            // Supprimer les données PDF volumineuses pour économiser l'espace
            pdfData: undefined
          }
        }));
      }

      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(cleanedDocuments));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des documents:', error);
      
      // Si l'erreur est due à un quota dépassé, essayer de nettoyer
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.cleanupStorage();
        // Réessayer avec moins de documents
        const reducedDocuments = documents.slice(0, Math.floor(documents.length / 2));
        try {
          localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(reducedDocuments));
        } catch (retryError) {
          console.error('Impossible de sauvegarder même avec moins de documents:', retryError);
        }
      }
    }
  }

  private cleanupStorage(): void {
    try {
      const documents = this.getDocuments();
      
      // Supprimer les anciens documents (plus de 6 mois)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const recentDocuments = documents.filter(doc => doc.updatedAt > sixMonthsAgo);
      
      // Garder seulement les 100 documents les plus récents
      const limitedDocuments = recentDocuments
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 100);
      
      this.saveDocuments(limitedDocuments);
      
      console.log(`Nettoyage effectué: ${documents.length - limitedDocuments.length} documents supprimés`);
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  }

  // Sauvegarder un document
  async saveDocument(document: GeneratedDocument): Promise<GeneratedDocument> {
    try {
      const documents = this.getDocuments();
      const existingIndex = documents.findIndex(d => d.id === document.id);
      
      const documentToSave = {
        ...document,
        updatedAt: new Date()
      };
      
      if (existingIndex >= 0) {
        documents[existingIndex] = documentToSave;
      } else {
        documents.unshift(documentToSave); // Ajouter au début
      }
      
      this.saveDocuments(documents);
      return documentToSave;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du document:', error);
      throw error;
    }
  }

  // Récupérer tous les documents
  async getDocumentsList(): Promise<GeneratedDocument[]> {
    return this.getDocuments();
  }

  // Récupérer un document par ID
  async getDocument(id: string): Promise<GeneratedDocument | null> {
    try {
      const documents = this.getDocuments();
      return documents.find(doc => doc.id === id) || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du document:', error);
      return null;
    }
  }

  // Récupérer les documents par bien
  async getDocumentsByProperty(propertyId: string): Promise<GeneratedDocument[]> {
    try {
      const documents = this.getDocuments();
      return documents.filter(doc => doc.propertyId === propertyId);
    } catch (error) {
      console.error('Erreur lors de la récupération des documents par bien:', error);
      return [];
    }
  }

  // Récupérer les documents par locataire
  async getDocumentsByTenant(tenantId: string): Promise<GeneratedDocument[]> {
    try {
      const documents = this.getDocuments();
      return documents.filter(doc => doc.tenantId === tenantId);
    } catch (error) {
      console.error('Erreur lors de la récupération des documents par locataire:', error);
      return [];
    }
  }

  // Mettre à jour le statut d'un document
  async updateDocumentStatus(id: string, status: GeneratedDocument['status']): Promise<GeneratedDocument> {
    try {
      const documents = this.getDocuments();
      const index = documents.findIndex(doc => doc.id === id);
      
      if (index === -1) {
        throw new Error('Document non trouvé');
      }
      
      documents[index] = {
        ...documents[index],
        status,
        updatedAt: new Date(),
        signedAt: status === 'signed' ? new Date() : documents[index].signedAt
      };
      
      this.saveDocuments(documents);
      return documents[index];
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  // Supprimer un document
  async deleteDocument(id: string): Promise<void> {
    try {
      const documents = this.getDocuments();
      const filteredDocuments = documents.filter(doc => doc.id !== id);
      this.saveDocuments(filteredDocuments);
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      throw error;
    }
  }

  // Rechercher des documents
  async searchDocuments(query: string): Promise<GeneratedDocument[]> {
    try {
      const documents = this.getDocuments();
      const lowercaseQuery = query.toLowerCase();
      
      return documents.filter(doc => 
        doc.name.toLowerCase().includes(lowercaseQuery) ||
        doc.type.toLowerCase().includes(lowercaseQuery) ||
        doc.content.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      return [];
    }
  }

  // Obtenir les statistiques des documents
  async getDocumentStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    recent: number;
    storageUsed: string;
  }> {
    try {
      const documents = this.getDocuments();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const stats = {
        total: documents.length,
        byStatus: {} as Record<string, number>,
        byType: {} as Record<string, number>,
        recent: documents.filter(doc => doc.createdAt > oneWeekAgo).length,
        storageUsed: this.getStorageUsage()
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
        recent: 0,
        storageUsed: '0 KB'
      };
    }
  }

  // Calculer l'utilisation du stockage
  private getStorageUsage(): string {
    try {
      const documentsData = localStorage.getItem(STORAGE_KEYS.DOCUMENTS) || '';
      const templatesData = localStorage.getItem(STORAGE_KEYS.TEMPLATES) || '';
      const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS) || '';
      
      const totalBytes = new Blob([documentsData + templatesData + settingsData]).size;
      
      if (totalBytes < 1024) return `${totalBytes} B`;
      if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`;
      return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
    } catch (error) {
      return '0 KB';
    }
  }

  // Exporter tous les documents
  async exportDocuments(): Promise<string> {
    try {
      const documents = this.getDocuments();
      const exportData = {
        documents,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      throw error;
    }
  }

  // Importer des documents
  async importDocuments(jsonData: string): Promise<number> {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.documents || !Array.isArray(importData.documents)) {
        throw new Error('Format d\'import invalide');
      }
      
      const existingDocuments = this.getDocuments();
      const importedDocuments = importData.documents.map((doc: any) => ({
        ...doc,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
        signedAt: doc.signedAt ? new Date(doc.signedAt) : undefined,
        expiresAt: doc.expiresAt ? new Date(doc.expiresAt) : undefined
      }));
      
      // Fusionner avec les documents existants (éviter les doublons)
      const mergedDocuments = [...existingDocuments];
      let importedCount = 0;
      
      importedDocuments.forEach((importedDoc: GeneratedDocument) => {
        const exists = mergedDocuments.find(doc => doc.id === importedDoc.id);
        if (!exists) {
          mergedDocuments.push(importedDoc);
          importedCount++;
        }
      });
      
      this.saveDocuments(mergedDocuments);
      return importedCount;
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      throw error;
    }
  }

  // Nettoyer le stockage
  async cleanup(): Promise<void> {
    this.cleanupStorage();
  }

  // Obtenir les paramètres
  getSettings(): DocumentSettings {
    return { ...this.settings };
  }

  // Mettre à jour les paramètres
  updateSettings(newSettings: Partial<DocumentSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }
}

export const localDocumentStorage = new LocalDocumentStorage();
