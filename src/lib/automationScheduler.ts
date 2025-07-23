import { supabase } from './supabase';
import { automationService } from './automationService';
import { localEmailService } from './localEmailService';
import { Automation } from '../types';

/**
 * Service pour gérer les exécutions programmées des automatisations
 */
class AutomationScheduler {
  private timerId: number | null = null;
  private checkInterval = 60000; // Vérifier toutes les minutes pour le timer de vérification
  private isRunning = false;
  private lastDailyRunDate: string | null = null;

  /**
   * Démarre le planificateur d'automatisations
   */
  start(): void {
    if (this.isRunning) return;
    
    console.log('Démarrage du planificateur d\'automatisations');
    this.isRunning = true;
    
    // Vérifier si nous devons exécuter les automatisations maintenant
    this.checkDailySchedule();
    
    // Puis configurer l'intervalle
    this.timerId = window.setInterval(() => {
      this.checkDailySchedule();
    }, this.checkInterval);
  }

  /**
   * Arrête le planificateur d'automatisations
   */
  stop(): void {
    if (!this.isRunning || this.timerId === null) return;
    
    console.log('Arrêt du planificateur d\'automatisations');
    window.clearInterval(this.timerId);
    this.timerId = null;
    this.isRunning = false;
  }

  /**
   * Vérifie si c'est l'heure d'exécuter les automatisations (9h France)
   */
  private checkDailySchedule(): void {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDate = now.toISOString().split('T')[0]; // Format YYYY-MM-DD
    
    // Vérifier si nous avons déjà exécuté les automatisations aujourd'hui
    if (this.lastDailyRunDate === currentDate) {
      // Déjà exécuté aujourd'hui, ne rien faire
      return;
    }
    
    // Exécuter à 9h (heure locale)
    if (currentHour === 9) {
      console.log(`Il est 9h, exécution des automatisations programmées pour aujourd'hui (${currentDate})`);
      this.checkAndExecuteAutomations();
      this.lastDailyRunDate = currentDate;
      
      // Traiter la file d'attente des emails
      this.processEmailQueue();
    } else {
      console.log(`Il est ${currentHour}h, les automatisations seront exécutées à 9h`);
    }
  }

  /**
   * Vérifie et exécute les automatisations dues
   */
  private async checkAndExecuteAutomations(): Promise<void> {
    try {
      // Vérifier si un utilisateur est connecté
      // Note: Avec le stockage local, nous n'avons plus besoin de vérifier l'utilisateur
      
      console.log(`Vérification des automatisations dues à ${new Date().toLocaleTimeString('fr-FR')}...`);
      const now = new Date();
      
      // Récupérer les automatisations actives
      const automations = automationService.getActiveAutomations();
      
      if (automations.length === 0) {
        console.log('Aucune automatisation à exécuter pour le moment');
        return;
      }
      
      console.log(`${automations.length} automatisation(s) à exécuter`);
      
      // Exécuter chaque automatisation due
      for (const automation of automations) {
        try {
          if (automation.nextExecution <= now) {
            console.log(`Exécution de l'automatisation: ${automation.name}`);
            await automationService.executeAutomation(automation.id);
          }
        } catch (error) {
          console.error(`Erreur lors de l'exécution de l'automatisation ${automation.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des automatisations:', error);
    }
  }

  /**
   * Traite la file d'attente des emails
   */
  private async processEmailQueue(): Promise<void> {
    try {
      console.log('Traitement de la file d\'attente des emails...');
      const processedCount = await automationService.processEmailQueue();
      console.log(`${processedCount} email(s) traité(s) avec succès`);
    } catch (error) {
      console.error('Erreur lors du traitement de la file d\'attente des emails:', error);
    }
  }

  /**
   * Vérifie si le planificateur est en cours d'exécution
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Définit l'intervalle de vérification (en millisecondes)
   */
  setCheckInterval(interval: number): void {
    if (interval < 10000) {
      console.warn('L\'intervalle minimum est de 10 secondes');
      interval = 10000;
    }
    
    this.checkInterval = interval;
    
    // Redémarrer le planificateur si nécessaire
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Force l'exécution immédiate de toutes les automatisations dues
   */
  async forceCheck(): Promise<number> {
    try {
      // Récupérer les automatisations dues
      const now = new Date();
      console.log('Exécution forcée des automatisations dues...');
      const dueAutomations = automationService.getActiveAutomations();
      const dueAutomationsList = dueAutomations
        .filter(automation => automation.nextExecution <= now);
      
      let successCount = 0;
      
      for (const automation of dueAutomationsList) {
        try {
          console.log(`Exécution forcée de l'automatisation: ${automation.name}`);
          const success = await automationService.executeAutomation(automation.id);
          if (success) successCount++;
        } catch (error) {
          console.error(`Erreur lors de l'exécution forcée de l'automatisation ${automation.id}:`, error);
        }
      }
      
      // Traiter la file d'attente des emails
      await this.processEmailQueue();
      
      // Marquer comme exécuté aujourd'hui
      this.lastDailyRunDate = new Date().toISOString().split('T')[0];
      
      return successCount;
    } catch (error) {
      console.error('Erreur lors de la vérification forcée des automatisations:', error);
      return 0;
    }
  }
}

// Créer une instance singleton
export const automationScheduler = new AutomationScheduler();
