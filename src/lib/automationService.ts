import { mailService } from './mailService';
import { documentStorage } from './documentStorage';
import { localEmailService } from './localEmailService';
import { emailTemplateService } from './emailTemplateService';

class AutomationService {
  private readonly STORAGE_KEY = 'automations';

  private getAll(): Automation[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const automations = JSON.parse(stored);
      
      // Convertir les chaînes de dates en objets Date
      return automations.map((automation: any) => ({
        ...automation,
        nextExecution: automation.nextExecution ? new Date(automation.nextExecution) : null,
        lastExecution: automation.lastExecution ? new Date(automation.lastExecution) : null,
        createdAt: automation.createdAt ? new Date(automation.createdAt) : new Date(),
        updatedAt: automation.updatedAt ? new Date(automation.updatedAt) : new Date()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des automatisations:', error);
      return [];
    }
  }

  getAutomations(): Automation[] {
    return this.getAll();
  }

  getActiveAutomations(): Automation[] {
    return this.getAll().filter(automation => automation.active);
  }

  private getById(id: string): Automation | undefined {
    const automations = this.getAll();
    return automations.find(automation => automation.id === id);
  }

  createAutomation(automation: Omit<Automation, 'id' | 'createdAt' | 'updatedAt'>): Automation {
    const newAutomation: Automation = {
      ...automation,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const automations = this.getAll();
    automations.push(newAutomation);
    this.saveAll(automations);

    return newAutomation;
  }

  updateAutomation(id: string, updates: Partial<Automation>): Automation | null {
    const automations = this.getAll();
    const index = automations.findIndex(automation => automation.id === id);

    if (index === -1) {
      return null;
    }

    automations[index] = {
      ...automations[index],
      ...updates,
      updatedAt: new Date()
    };

    this.saveAll(automations);
    return automations[index];
  }

  deleteAutomation(id: string): boolean {
    const automations = this.getAll();
    const filteredAutomations = automations.filter(automation => automation.id !== id);

    if (filteredAutomations.length === automations.length) {
      return false;
    }

    this.saveAll(filteredAutomations);
    return true;
  }

  toggleAutomation(id: string): boolean {
    const automation = this.getById(id);
    if (!automation) {
      return false;
    }

    this.updateAutomation(id, { active: !automation.active });
    return true;
  }

  async executeAutomation(id: string): Promise<boolean> {
    try {
      const automation = this.getById(id);
      if (!automation || !automation.active) {
        console.log('Automatisation non trouvée ou inactive:', id);
        return false;
      }

      console.log('Exécution de l\'automatisation:', automation.name);

      // Préparer les pièces jointes si un template de document est configuré
      let attachments = [];
      
      if (automation.documentTemplateId) {
        try {
          console.log('Récupération du document pour l\'automatisation...');
          
          // Récupérer le document
          const document = await documentStorage.getDocument(automation.documentTemplateId);
          if (!document) {
            console.warn(`Document non trouvé: ${automation.documentTemplateId}. L'automatisation continuera sans pièce jointe.`);
            // Continue without attachment instead of throwing error
          }
          
          // Only process document if it exists
          if (document) {
            // Utiliser le PDF pré-généré s'il existe
            if (document.metadata && document.metadata.pdfData) {
              const pdfContent = document.metadata.pdfData.split(',')[1];
              
              attachments.push({
                filename: `${document.name}.pdf`,
                content: pdfContent,
                contentType: 'application/pdf',
                encoding: 'base64'
              });
              console.log('Document PDF ajouté en pièce jointe');
            } else {
              console.warn(`Pas de PDF disponible pour le document ${document.id}`);
            }
          }
        } catch (docError) {
          console.warn('Erreur lors de la récupération du document:', docError);
          // Continuer sans pièce jointe au lieu d'échouer toute l'automatisation
        }
      }

      // Préparer les données pour le template d'email
      let emailData = {};
      
      // Si un bien est associé, récupérer ses informations
      if (automation.propertyId) {
        try {
          // Importer dynamiquement pour éviter les dépendances circulaires
          const { propertiesApi } = await import('./properties');
          const property = await propertiesApi.getProperty(automation.propertyId);
          
          if (property) {
            emailData = {
              ...emailData,
              property_name: property.name,
              property_address: property.address,
              property_type: property.type,
              rent_amount: property.rent.toString(),
              charges_amount: property.charges.toString(),
              total_amount: (property.rent + property.charges).toString()
            };
            
            // Si le bien a un locataire, ajouter ses informations
            if (property.tenant) {
              emailData = {
                ...emailData,
                tenant_name: `${property.tenant.firstName} ${property.tenant.lastName}`,
                tenant_email: property.tenant.email,
                tenant_phone: property.tenant.phone || '',
                lease_start_date: property.tenant.leaseStart.toLocaleDateString(),
                lease_end_date: property.tenant.leaseEnd.toLocaleDateString()
              };
            }
          }
        } catch (propertyError) {
          console.warn('Erreur lors de la récupération du bien:', propertyError);
        }
      }
      
      // Ajouter la date actuelle et le mois courant
      const now = new Date();
      emailData = {
        ...emailData,
        current_date: now.toLocaleDateString(),
        month: now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        landlord_name: 'Propriétaire' // Valeur par défaut
      };

      // Traiter le template d'email si disponible
      let emailContent = automation.description || 'Automatisation exécutée';
      let emailSubject = automation.name;
      
      if (automation.emailTemplateId) {
        try {
          const processedTemplate = emailTemplateService.processTemplate(automation.emailTemplateId, emailData);
          if (processedTemplate) {
            emailSubject = processedTemplate.subject;
            emailContent = processedTemplate.content;
          }
        } catch (templateError) {
          console.warn('Erreur lors du traitement du template d\'email:', templateError);
        }
      }

      // Déterminer le destinataire (utiliser le locataire si disponible)
      const recipient = emailData.tenant_email || 'destinataire@example.com';

      // Créer les options d'email
      const emailOptions = {
        to: recipient,
        subject: emailSubject,
        html: emailContent,
        ...(attachments.length > 0 && { attachments })
      };

      // Essayer d'envoyer l'email via le service mail
      try {
        // Vérifier si le service mail est configuré
        if (mailService.getConfig()?.enabled) {
          await mailService.sendEmail(emailOptions);
        } else {
          // Sinon, utiliser le service local
          await localEmailService.sendEmail(emailOptions);
        }
      } catch (emailError) {
        console.warn('Erreur lors de l\'envoi de l\'email, utilisation du service local:', emailError);
        // En cas d'erreur, utiliser le service local comme fallback
        await localEmailService.sendEmail(emailOptions);
      }

      // Mettre à jour la date de dernière exécution
      this.updateAutomation(id, {
        lastExecution: new Date(),
        nextExecution: new Date(this.calculateNextExecution(automation.frequency))
      });

      console.log('Automatisation exécutée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'exécution de l\'automatisation:', error);
      return false;
    }
  }

  async executeAllDueAutomations(): Promise<number> {
    try {
      const now = new Date();
      const dueAutomations = this.getActiveAutomations().filter(
        automation => automation.nextExecution <= now
      );
      
      let successCount = 0;
      
      for (const automation of dueAutomations) {
        try {
          const success = await this.executeAutomation(automation.id);
          if (success) successCount++;
        } catch (error) {
          console.error(`Erreur lors de l'exécution de l'automatisation ${automation.id}:`, error);
        }
      }
      
      return successCount;
    } catch (error) {
      console.error('Erreur lors de l\'exécution des automatisations dues:', error);
      return 0;
    }
  }

  // Traiter la file d'attente des emails en mode local
  async processEmailQueue(): Promise<number> {
    try {
      return await localEmailService.processEmailQueue();
    } catch (error) {
      console.error('Erreur lors du traitement de la file d\'attente des emails:', error);
      return 0;
    }
  }

  private calculateNextExecution(frequency: string): string {
    const now = new Date();
    
    switch (frequency) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
      case 'yearly':
        now.setFullYear(now.getFullYear() + 1);
        break;
      default:
        now.setDate(now.getDate() + 1);
    }

    return now.toISOString();
  }

  private saveAll(automations: Automation[]): void {
    try {
      const automationsToSave = automations.map(automation => ({
        ...automation,
        nextExecution: automation.nextExecution instanceof Date 
          ? automation.nextExecution.toISOString() 
          : automation.nextExecution,
        lastExecution: automation.lastExecution instanceof Date 
          ? automation.lastExecution.toISOString() 
          : automation.lastExecution,
        createdAt: automation.createdAt instanceof Date 
          ? automation.createdAt.toISOString() 
          : automation.createdAt,
        updatedAt: automation.updatedAt instanceof Date 
          ? automation.updatedAt.toISOString() 
          : automation.updatedAt
      }));
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(automationsToSave));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des automatisations:', error);
      throw error;
    }
  }
}

export const automationService = new AutomationService();
