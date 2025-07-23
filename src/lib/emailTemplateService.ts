import { supabase } from './supabase';
import { mailService } from './mailService';
import { localEmailService } from './localEmailService';
import { Property, Tenant } from '../types';
import { defaultEmailTemplates } from './defaultEmailTemplates.js';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'tenant' | 'property' | 'financial' | 'administrative' | 'other';
  documentTemplateId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailData {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  content: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

class EmailTemplateService {
  private templates: EmailTemplate[] = [];
  private isLoading = false;
  private lastLoaded = 0;
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Précharger les templates par défaut si aucun n'existe
    this.initDefaultTemplates();
  }

  // Initialiser les templates par défaut si aucun n'existe
  private async initDefaultTemplates() {
    try {
      // Vérifier si un utilisateur est connecté avant d'initialiser les templates
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        // Pas d'utilisateur connecté, ignorer l'initialisation
        return;
      }
      
      const templates = await this.getTemplates();
      
      // Si aucun template n'existe, créer les templates par défaut
      if (templates.length === 0) {
        console.log('Aucun template trouvé, initialisation des templates par défaut...');
        
        for (const template of defaultEmailTemplates) {
          await this.saveTemplate(template);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des templates par défaut:', error);
    }
  }

  // Récupérer tous les templates depuis Supabase
  async getTemplatesFromDB(): Promise<EmailTemplate[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        console.warn('Utilisateur non connecté. Impossible de récupérer les templates depuis Supabase.');
        return [];
      }
      
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erreur Supabase lors de la récupération des templates:', error);
        return this.getTemplatesFromLocalStorage();
      }
      
      return (data || []).map(template => ({
        id: template.id,
        name: template.name,
        subject: template.subject,
        content: template.content,
        category: template.category as 'tenant' | 'property' | 'financial' | 'administrative' | 'other',
        createdAt: new Date(template.created_at),
        updatedAt: new Date(template.updated_at)
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des templates depuis Supabase:', error);
      
      // Final fallback if even local storage fails
      try {
        return this.getTemplatesFromLocalStorage();
      } catch (localError) {
        console.error('Erreur lors de la récupération depuis localStorage:', localError);
        return [];
      }
    }
  }

  // Récupérer les templates depuis le localStorage (fallback)
  private getTemplatesFromLocalStorage(): EmailTemplate[] {
    try {
      const storedTemplates = localStorage.getItem('easybail_email_templates');
      if (storedTemplates) {
        return JSON.parse(storedTemplates).map((template: any) => ({
          ...template,
          createdAt: new Date(template.createdAt),
          updatedAt: new Date(template.updatedAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des templates depuis localStorage:', error);
      return [];
    }
  }

  // Récupérer tous les templates (avec cache)
  async getTemplates(): Promise<EmailTemplate[]> {
    // Si les templates sont déjà chargés et le cache est valide, les retourner
    const now = Date.now();
    if (this.templates.length > 0 && now - this.lastLoaded < this.CACHE_DURATION) {
      return this.templates;
    }
    
    // Si un chargement est déjà en cours, retourner les templates actuels
    if (this.isLoading) {
      return this.templates;
    }
    
    this.isLoading = true;
    
    try {
      const templates = await this.getTemplatesFromDB();
      this.templates = templates;
      this.lastLoaded = now;
      return templates;
    } catch (error) {
      console.error('Erreur lors de la récupération des templates:', error);
      return this.templates;
    } finally {
      this.isLoading = false;
    }
  }

  // Version synchrone pour la compatibilité avec le code existant
  getTemplatesSync(): EmailTemplate[] {
    return this.templates;
  }

  // Sauvegarder un template
  async saveTemplate(template: EmailTemplate): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error('Utilisateur non connecté');
      }
      
      const isNew = !template.id || template.id.startsWith('template_');
      const now = new Date();
      
      if (isNew) {
        // Créer un nouveau template
        const { data, error } = await supabase
          .from('email_templates')
          .insert({
            user_id: userData.user.id,
            name: template.name,
            subject: template.subject,
            content: template.content,
            category: template.category
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Mettre à jour le cache
        const newTemplate: EmailTemplate = {
          id: data.id,
          name: data.name,
          subject: data.subject,
          content: data.content,
          category: data.category as any,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };
        
        this.templates.unshift(newTemplate);
      } else {
        // Mettre à jour un template existant
        const { error } = await supabase
          .from('email_templates')
          .update({
            name: template.name,
            subject: template.subject,
            content: template.content,
            category: template.category,
            updated_at: now.toISOString()
          })
          .eq('id', template.id);
        
        if (error) throw error;
        
        // Mettre à jour le cache
        const index = this.templates.findIndex(t => t.id === template.id);
        if (index >= 0) {
          this.templates[index] = {
            ...template,
            updatedAt: now
          };
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du template:', error);
      
      // Fallback to localStorage
      return this.saveTemplateToLocalStorage(template);
    }
  }

  // Sauvegarder un template dans le localStorage (fallback)
  private saveTemplateToLocalStorage(template: EmailTemplate): boolean {
    try {
      const templates = this.getTemplatesFromLocalStorage();
      const existingIndex = templates.findIndex(t => t.id === template.id);
      const now = new Date();
      
      if (existingIndex >= 0) {
        templates[existingIndex] = {
          ...template,
          updatedAt: now
        };
      } else {
        templates.push({
          ...template,
          id: template.id || `template_${Date.now()}`,
          createdAt: now,
          updatedAt: now
        });
      }
      
      localStorage.setItem('easybail_email_templates', JSON.stringify(templates));
      
      // Mettre à jour le cache
      this.templates = templates;
      this.lastLoaded = Date.now();
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du template dans localStorage:', error);
      return false;
    }
  }

  // Supprimer un template
  async deleteTemplate(templateId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);
      
      if (error) throw error;
      
      // Mettre à jour le cache
      this.templates = this.templates.filter(t => t.id !== templateId);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du template:', error);
      
      // Fallback to localStorage
      return this.deleteTemplateFromLocalStorage(templateId);
    }
  }

  // Supprimer un template du localStorage (fallback)
  private deleteTemplateFromLocalStorage(templateId: string): boolean {
    try {
      const templates = this.getTemplatesFromLocalStorage();
      const updatedTemplates = templates.filter(t => t.id !== templateId);
      localStorage.setItem('easybail_email_templates', JSON.stringify(updatedTemplates));
      
      // Mettre à jour le cache
      this.templates = updatedTemplates;
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du template dans localStorage:', error);
      return false;
    }
  }

  // Récupérer un template par ID
  async getTemplateById(templateId: string): Promise<EmailTemplate | null> {
    try {
      // Vérifier d'abord dans le cache
      const cachedTemplate = this.templates.find(t => t.id === templateId);
      if (cachedTemplate) {
        return cachedTemplate;
      }
      
      // Sinon, chercher dans la base de données
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      
      if (error) throw error;
      
      const template: EmailTemplate = {
        id: data.id,
        name: data.name,
        subject: data.subject,
        content: data.content,
        category: data.category as any,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
      
      return template;
    } catch (error) {
      console.error('Erreur lors de la récupération du template:', error);
      
      // Fallback to localStorage
      return this.getTemplateByIdFromLocalStorage(templateId);
    }
  }

  // Récupérer un template par ID depuis le localStorage (fallback)
  private getTemplateByIdFromLocalStorage(templateId: string): EmailTemplate | null {
    try {
      const templates = this.getTemplatesFromLocalStorage();
      return templates.find(t => t.id === templateId) || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du template depuis localStorage:', error);
      return null;
    }
  }

  // Récupérer les templates par catégorie
  async getTemplatesByCategory(category: string): Promise<EmailTemplate[]> {
    try {
      const templates = await this.getTemplates();
      return templates.filter(t => t.category === category);
    } catch (error) {
      console.error('Erreur lors de la récupération des templates par catégorie:', error);
      return [];
    }
  }

  // Traiter un template avec des données
  processTemplate(templateId: string, data: Record<string, any>): { subject: string, content: string } | null {
    try {
      if (!templateId) {
        console.error('Erreur: templateId est undefined ou null');
        return null;
      }
      
      // Chercher le template
      let template = this.templates.find(t => t.id === templateId);
      
      // Si le template n'est pas trouvé dans le cache, essayer de le charger
      if (!template) {
        console.warn(`Template ${templateId} non trouvé dans le cache, tentative de chargement...`);
        
        // Essayer de charger le template depuis le localStorage (fallback)
        const localTemplates = this.getTemplatesFromLocalStorage();
        template = localTemplates.find(t => t.id === templateId);
        
        if (!template) {
          console.error(`Template ${templateId} introuvable dans le cache et le localStorage`);
          return null;
        }
      }
      
      let processedSubject = template.subject;
      let processedContent = '';
      
      // Traiter comme du HTML standard
      processedContent = template.content;
      
      // Remplacer les variables dans le contenu
      try {
        if (data) {
          Object.entries(data).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            processedContent = processedContent.replace(regex, String(value || ''));
          });
        } else {
          console.warn(`Aucune donnée fournie pour le template ${templateId}`);
        }
      } catch (replaceError) {
        console.error('Erreur lors du remplacement des variables dans le contenu:', replaceError);
        throw new Error(`Erreur lors du remplacement des variables dans le contenu: ${replaceError instanceof Error ? replaceError.message : 'Erreur inconnue'}`);
      }
      
      // Remplacer les variables dans le contenu
      try {
        if (data) {
          Object.entries(data).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            processedSubject = processedSubject.replace(regex, String(value || ''));
          });
        }
      } catch (replaceError) {
        console.error('Erreur lors du remplacement des variables dans le sujet:', replaceError);
        throw new Error(`Erreur lors du remplacement des variables dans le sujet: ${replaceError instanceof Error ? replaceError.message : 'Erreur inconnue'}`);
      }
      
      // Vérifier si toutes les variables ont été remplacées
      const remainingVarsContent = processedContent.match(/{{[^{}]+}}/g);
      const remainingVarsSubject = processedSubject.match(/{{[^{}]+}}/g);
      
      if (remainingVarsContent && remainingVarsContent.length > 0) {
        console.warn(`Variables non remplacées dans le contenu: ${remainingVarsContent.join(', ')}`);
      }
      
      if (remainingVarsSubject && remainingVarsSubject.length > 0) {
        console.warn(`Variables non remplacées dans le sujet: ${remainingVarsSubject.join(', ')}`);
      }
      
      return {
        subject: processedSubject,
        content: processedContent,
        documentTemplateId: template.documentTemplateId
      };
    } catch (error) {
      console.error(`Erreur lors du traitement du template ${templateId}:`, error);
      throw new Error(`Erreur lors du traitement du template: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      return null;
    }
  }

  // Envoyer un email à partir d'un template
  async sendEmailFromTemplate(
    templateId: string, 
    to: string | string[],
    data: Record<string, any>,
    options?: {
      cc?: string | string[];
      bcc?: string | string[];
      attachments?: Array<{
        filename: string;
        content: string;
        contentType: string;
      }>;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Vérifier si le service mail est configuré
      if (!mailService.isConfigured()) {
        return { 
          success: false,
          error: 'Le service mail n\'est pas configuré. Utilisation du service local.'
        };
      }
      
      // Traiter le template
      const processed = this.processTemplate(templateId, data);
      if (!processed) {
        return { 
          success: false, 
          error: 'Template non trouvé ou erreur lors du traitement' 
        };
      }
      
      // Vérifier si le contenu est un JSON (design Unlayer)
      let htmlContent = processed.content;
      
      // Générer le document PDF si un template de document est associé
      let attachments = options?.attachments || [];
      if (processed.documentTemplateId) {
        try {
          // Importer le service de stockage de documents
          const { documentStorage } = await import('./documentStorage');
          
          // Récupérer le document
          const document = await documentStorage.getDocument(processed.documentTemplateId);
          
          if (document) {
            // Utiliser le PDF pré-généré s'il existe
            if (document.metadata.pdfData) {
              const pdfContent = document.metadata.pdfData.split(',')[1];
              
              // Ajouter le PDF comme pièce jointe
              attachments.push({
                filename: `${document.name}.pdf`,
                content: pdfContent,
                contentType: 'application/pdf'
              });
              
              console.log(`Document PDF joint avec succès: ${document.name}.pdf`);
            } else {
              console.warn(`Pas de PDF pré-généré pour le document ${document.id}`);
            }
        }
        } catch (docError) {
          console.error(`Erreur lors de la récupération du document: ${docError instanceof Error ? docError.message : 'Erreur inconnue'}`);
        }
      }
      
      // Envoyer l'email
      const result = await mailService.sendEmail({
        to,
        cc: options?.cc,
        bcc: options?.bcc,
        subject: processed.subject,
        html: htmlContent,
        attachments: attachments.length > 0 ? attachments : options?.attachments
      });
      
      if (!result.success && result.error?.includes('mail n\'est pas configuré')) {
        // Si le service mail n'est pas configuré, utiliser le service local
        console.log('Service mail non configuré, utilisation du service local');
        return await localEmailService.sendEmail({
          to,
          cc: options?.cc,
          bcc: options?.bcc,
          subject: processed.subject,
          html: htmlContent,
          attachments: attachments.length > 0 ? attachments : options?.attachments
        });
      } else {
        return result;
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      
      // En cas d'erreur, essayer d'utiliser le service local
      try {
        console.log('Erreur avec le service mail principal, tentative avec le service local');
        return await localEmailService.sendEmail({
          to,
          cc: options?.cc,
          bcc: options?.bcc,
          subject: processed?.subject || 'Email sans sujet',
          html: processed?.content || 'Contenu non disponible',
          attachments: options?.attachments
        });
      } catch (localError) {
        return { 
          success: false, 
          error: `Erreur principale: ${error instanceof Error ? error.message : 'Erreur inconnue'}. Erreur locale: ${localError instanceof Error ? localError.message : 'Erreur inconnue'}` 
        };
      }
    }
  }

  // Préparer les données pour un locataire
  prepareTenantData(tenant: Tenant, property: Property): Record<string, any> {
    return {
      tenant_name: tenant ? `${tenant.firstName} ${tenant.lastName}` : '',
      tenant_email: tenant ? tenant.email : '',
      tenant_phone: tenant ? (tenant.phone || '') : '',
      property_name: property ? property.name : '',
      property_address: property ? property.address : '',
      property_type: property ? property.type : '',
      rent_amount: property ? property.rent.toString() : '0',
      charges_amount: property ? property.charges.toString() : '0',
      total_amount: property ? (property.rent + property.charges).toString() : '0',
      lease_start_date: tenant ? tenant.leaseStart.toLocaleDateString() : '',
      lease_end_date: tenant ? tenant.leaseEnd.toLocaleDateString() : '',
      month: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      current_date: new Date().toLocaleDateString('fr-FR'),
      landlord_name: 'Propriétaire', // À remplacer par les vraies données
      landlord_email: '', // À remplacer par les vraies données
      landlord_phone: '' // À remplacer par les vraies données
    };
  }
}

export const emailTemplateService = new EmailTemplateService();

// Précharger les templates au démarrage de l'application
emailTemplateService.getTemplates().catch(err => {
  console.warn('Erreur lors du préchargement des templates:', err);
});
