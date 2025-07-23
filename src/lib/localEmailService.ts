import { MailConfig, EmailOptions, EmailResult, VerifyResult } from './mailService';

// Clés de stockage local
const STORAGE_KEYS = {
  MAIL_CONFIG: 'easybail_mail_config',
  EMAIL_TEMPLATES: 'easybail_email_templates',
  EMAIL_QUEUE: 'easybail_email_queue',
  SENT_EMAILS: 'easybail_sent_emails'
};

// Interface pour les emails en file d'attente
interface QueuedEmail {
  id: string;
  options: EmailOptions;
  createdAt: Date;
  attempts: number;
  lastAttempt?: Date;
  error?: string;
}

// Interface pour les emails envoyés
interface SentEmail {
  id: string;
  to: string | string[];
  subject: string;
  sentAt: Date;
  success: boolean;
  error?: string;
}

/**
 * Service pour gérer les emails en mode hors ligne
 */
class LocalEmailService {
  private config: MailConfig | null = null;
  private emailQueue: QueuedEmail[] = [];
  private sentEmails: SentEmail[] = [];
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialise le service en chargeant les données depuis localStorage
   */
  private initialize(): void {
    try {
      // Charger la configuration
      const configJson = localStorage.getItem(STORAGE_KEYS.MAIL_CONFIG);
      if (configJson) {
        this.config = JSON.parse(configJson);
      }

      // Charger la file d'attente
      const queueJson = localStorage.getItem(STORAGE_KEYS.EMAIL_QUEUE);
      if (queueJson) {
        const parsedQueue = JSON.parse(queueJson);
        this.emailQueue = parsedQueue.map((email: any) => ({
          ...email,
          createdAt: new Date(email.createdAt),
          lastAttempt: email.lastAttempt ? new Date(email.lastAttempt) : undefined
        }));
      }

      // Charger l'historique des emails envoyés
      const sentJson = localStorage.getItem(STORAGE_KEYS.SENT_EMAILS);
      if (sentJson) {
        const parsedSent = JSON.parse(sentJson);
        this.sentEmails = parsedSent.map((email: any) => ({
          ...email,
          sentAt: new Date(email.sentAt)
        }));
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du service email local:', error);
    }
  }

  /**
   * Sauvegarde les données dans localStorage
   */
  private saveData(): void {
    try {
      // Sauvegarder la configuration
      if (this.config) {
        localStorage.setItem(STORAGE_KEYS.MAIL_CONFIG, JSON.stringify(this.config));
      }

      // Sauvegarder la file d'attente
      localStorage.setItem(STORAGE_KEYS.EMAIL_QUEUE, JSON.stringify(this.emailQueue));

      // Sauvegarder l'historique des emails envoyés
      localStorage.setItem(STORAGE_KEYS.SENT_EMAILS, JSON.stringify(this.sentEmails));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données email:', error);
    }
  }

  /**
   * Vérifie si le service est configuré
   */
  isConfigured(): boolean {
    return !!this.config && this.config.enabled;
  }

  /**
   * Récupère la configuration actuelle
   */
  getConfig(): MailConfig | null {
    return this.config;
  }

  /**
   * Sauvegarde la configuration
   */
  saveConfig(config: MailConfig): boolean {
    try {
      this.config = config;
      this.saveData();
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration mail:', error);
      return false;
    }
  }

  /**
   * Vérifie la connexion au serveur SMTP (simulation en mode local)
   */
  async verifyConnection(): Promise<VerifyResult> {
    if (!this.config) {
      return {
        success: false,
        error: 'Configuration mail non trouvée'
      };
    }

    if (!this.config.enabled) {
      return {
        success: false,
        error: 'Le service mail n\'est pas activé'
      };
    }

    // En mode local, on simule une vérification réussie
    return {
      success: true,
      message: 'Connexion simulée en mode local'
    };
  }

  /**
   * Ajoute un email à la file d'attente
   */
  async queueEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      if (!this.config) {
        return {
          success: false,
          error: 'Configuration mail non trouvée'
        };
      }

      if (!this.config.enabled) {
        return {
          success: false,
          error: 'Le service mail n\'est pas activé'
        };
      }

      // Créer un nouvel email en file d'attente
      const queuedEmail: QueuedEmail = {
        id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        options,
        createdAt: new Date(),
        attempts: 0
      };

      // Ajouter à la file d'attente
      this.emailQueue.push(queuedEmail);
      this.saveData();

      return {
        success: true,
        messageId: queuedEmail.id,
        message: 'Email ajouté à la file d\'attente locale'
      };
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'email à la file d\'attente:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Envoie un email (en mode local, ajoute à la file d'attente)
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    return this.queueEmail(options);
  }

  /**
   * Envoie un email de test
   */
  async sendTestEmail(to: string): Promise<EmailResult> {
    return this.sendEmail({
      to,
      subject: 'Email de test (mode local)',
      text: 'Ceci est un email de test envoyé depuis votre application de gestion locative en mode local.',
      html: '<p>Ceci est un email de test envoyé depuis votre application de gestion locative en mode local.</p>'
    });
  }

  /**
   * Récupère la file d'attente des emails
   */
  getEmailQueue(): QueuedEmail[] {
    return this.emailQueue;
  }

  /**
   * Récupère l'historique des emails envoyés
   */
  getSentEmails(): SentEmail[] {
    return this.sentEmails;
  }

  /**
   * Simule l'envoi des emails en file d'attente
   * En mode local, marque simplement les emails comme "envoyés"
   */
  async processEmailQueue(): Promise<number> {
    if (!this.config || !this.config.enabled) {
      return 0;
    }

    let processedCount = 0;

    // Traiter chaque email de la file d'attente
    for (const email of [...this.emailQueue]) {
      try {
        // Simuler l'envoi
        const success = Math.random() > 0.1; // 90% de chance de succès

        // Mettre à jour les tentatives
        email.attempts += 1;
        email.lastAttempt = new Date();

        if (success) {
          // Ajouter à l'historique des emails envoyés
          this.sentEmails.push({
            id: email.id,
            to: email.options.to,
            subject: email.options.subject,
            sentAt: new Date(),
            success: true
          });

          // Retirer de la file d'attente
          this.emailQueue = this.emailQueue.filter(e => e.id !== email.id);
          processedCount++;
        } else {
          // Échec de l'envoi
          email.error = 'Échec simulé de l\'envoi en mode local';
          
          // Si trop de tentatives, abandonner
          if (email.attempts >= 3) {
            // Ajouter à l'historique des emails envoyés (échec)
            this.sentEmails.push({
              id: email.id,
              to: email.options.to,
              subject: email.options.subject,
              sentAt: new Date(),
              success: false,
              error: 'Nombre maximum de tentatives atteint'
            });

            // Retirer de la file d'attente
            this.emailQueue = this.emailQueue.filter(e => e.id !== email.id);
          }
        }
      } catch (error) {
        console.error(`Erreur lors du traitement de l'email ${email.id}:`, error);
        email.error = error instanceof Error ? error.message : 'Erreur inconnue';
      }
    }

    // Sauvegarder les modifications
    this.saveData();

    return processedCount;
  }

  /**
   * Vide la file d'attente des emails
   */
  clearEmailQueue(): void {
    this.emailQueue = [];
    this.saveData();
  }

  /**
   * Vide l'historique des emails envoyés
   */
  clearSentEmails(): void {
    this.sentEmails = [];
    this.saveData();
  }
}

// Exporter une instance unique
export const localEmailService = new LocalEmailService();
