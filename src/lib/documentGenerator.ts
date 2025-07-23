import { DocumentTemplate, GeneratedDocument, DocumentGenerationOptions, DocumentField } from '../types/documents';
import { documentTemplates, getTemplateById } from './documentTemplates';
import { Property, Tenant } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Fonction pour générer un UUID valide
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class DocumentGenerator {
  private generateId(): string {
    return generateUUID();
  }

  // Compiler le template avec les données
  private compileTemplate(template: string, data: Record<string, any>): string {
    let compiled = template;
    
    // Ajouter les styles pour la gestion multipage et l'impression
    compiled = compiled.replace('<style>', `<style>
      @page {
        size: A4;
        margin: 15mm;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          font-size: 12pt;
          line-height: 1.4;
        }
        .page-break {
          page-break-after: always;
          break-after: page;
          height: 0;
          display: block;
          border: none;
        }
        .signature-area {
          page-break-inside: avoid;
        }
        .signature-block {
          page-break-inside: avoid;
        }
        .financial-table {
          page-break-inside: avoid;
        }
        .legal-notice {
          page-break-inside: avoid;
        }
      }
      /* Styles pour la prévisualisation des sauts de page */
      .page-break {
        border-top: 1px dashed #ccc;
        margin: 20px 0;
        position: relative;
      }
      .page-break::before {
        content: "Saut de page";
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        background: #f0f0f0;
        padding: 0 10px;
        font-size: 10px;
        color: #999;
      }
    `);

    // Remplacer les variables simples {{variable}}
    compiled = compiled.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });

    // Gérer les conditions {{#if variable}}...{{/if}}
    compiled = compiled.replace(/\{\{#if (\w+)\}\}(.*?)\{\{\/if\}\}/gs, (match, key, content) => {
      return data[key] ? content : '';
    });

    // Calculer les totaux automatiquement
    if (data.rent && data.charges) {
      data.total = (parseFloat(data.rent) + parseFloat(data.charges)).toFixed(2);
      compiled = compiled.replace(/\{\{total\}\}/g, data.total);
    }

    // Ajouter des sauts de page aux endroits appropriés
    compiled = this.addPageBreaks(compiled);

    return compiled;
  }

  // Ajouter des sauts de page aux endroits appropriés
  private addPageBreaks(html: string): string {
    // Ajouter des sauts de page après certains articles
    // Utiliser des points de rupture plus précis pour éviter les pages blanches
    const breakPoints = [
      'ARTICLE 5 - ÉTAT DES LIEUX</div>',
      'ARTICLE 8 - PERFORMANCE ÉNERGÉTIQUE</div>',
      'ARTICLE 11 - CLAUSE RÉSOLUTOIRE</div>'
    ];

    let result = html;
    breakPoints.forEach(breakPoint => {
      const breakPointEnd = result.indexOf(breakPoint) + breakPoint.length;
      if (breakPointEnd > breakPoint.length) {
        result = result.substring(0, breakPointEnd) + 
                '\n<div class="page-break"></div>\n' + 
                result.substring(breakPointEnd);
      }
    });

    // Ajouter des attributs pour éviter les coupures inappropriées
    result = result.replace(/<div class="party-info">/g, '<div class="party-info" style="page-break-inside: avoid;">');
    result = result.replace(/<div class="article-content">/g, '<div class="article-content" style="page-break-inside: avoid;">');
    result = result.replace(/<div class="signature-block">/g, '<div class="signature-block" style="page-break-inside: avoid;">');
    result = result.replace(/<table class="financial-table">/g, '<table class="financial-table" style="page-break-inside: avoid;">');
    
    return result;
  }

  // Valider les données du formulaire
  private validateData(fields: DocumentField[], data: Record<string, any>): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    fields.forEach(field => {
      const value = data[field.name];

      // Vérifier les champs requis
      if (field.required && (!value || value === '')) {
        errors[field.name] = `${field.label} est requis`;
        return;
      }

      // Validation spécifique par type
      if (value && field.validation) {
        const validation = field.validation;

        if (field.type === 'number') {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            errors[field.name] = `${field.label} doit être un nombre valide`;
          } else {
            if (validation.min !== undefined && numValue < validation.min) {
              errors[field.name] = `${field.label} doit être supérieur ou égal à ${validation.min}`;
            }
            if (validation.max !== undefined && numValue > validation.max) {
              errors[field.name] = `${field.label} doit être inférieur ou égal à ${validation.max}`;
            }
          }
        }

        if (field.type === 'text' && validation.pattern) {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(value)) {
            errors[field.name] = validation.message || `${field.label} n'est pas au bon format`;
          }
        }
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Pré-remplir les données avec les informations du bien et du locataire
  private prefillData(template: DocumentTemplate, property?: Property, tenant?: Tenant): Record<string, any> {
    const data: Record<string, any> = {};

    if (property) {
      data.propertyAddress = property.address;
      data.propertyType = this.getPropertyTypeLabel(property.type);
      data.surface = property.surface;
      data.rooms = property.rooms;
      data.rent = property.rent;
      data.charges = property.charges;
    }

    if (tenant) {
      data.tenantName = `${tenant.firstName} ${tenant.lastName}`;
      data.tenantAddress = ''; // À remplir par l'utilisateur
      data.leaseStart = tenant.leaseStart.toISOString().split('T')[0];
      data.leaseEnd = tenant.leaseEnd.toISOString().split('T')[0];
      data.deposit = tenant.deposit;
    }

    // Données par défaut
    data.documentDate = new Date().toISOString().split('T')[0];
    data.landlordName = ''; // À remplir par l'utilisateur
    data.landlordAddress = ''; // À remplir par l'utilisateur

    return data;
  }

  private getPropertyTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'apartment': 'Appartement',
      'house': 'Maison',
      'studio': 'Studio',
      'parking': 'Parking',
      'commercial': 'Local commercial'
    };
    return labels[type] || type;
  }

  // Générer un PDF à partir d'un template
  async generatePDF(templateId: string, data: any = {}): Promise<string | null> {
    try {
      // Trouver le template
      const template = getTemplateById(templateId);
      if (!template) {
        console.error('Template non trouvé:', templateId);
        return null;
      }
      
      // Générer le document HTML
      const document = await this.generateDocument({
        templateId,
        data,
        userId: 'local-user'
      });
      
      if (!document) {
        console.error('Impossible de générer le document HTML');
        return null;
      }

      // Convertir le HTML en PDF
      return await this.convertHtmlToPdf(document.content);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      return null;
    }
  }

  // Convertir du HTML en PDF
  private async convertHtmlToPdf(htmlContent: string): Promise<string | null> {
    try {
      // Créer un élément temporaire pour le rendu
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '210mm'; // Format A4
      tempDiv.style.padding = '20mm';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.4';
      
      document.body.appendChild(tempDiv);

      // Convertir en canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Nettoyer l'élément temporaire
      document.body.removeChild(tempDiv);

      // Créer le PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calculer les dimensions pour s'adapter à la page A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      // Centrer l'image sur la page
      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      
      // Retourner le PDF en base64
      const pdfBase64 = pdf.output('datauristring');
      return pdfBase64.split(',')[1]; // Extraire seulement la partie base64
    } catch (error) {
      console.error('Erreur lors de la conversion HTML vers PDF:', error);
      return null;
    }
  }

  // Générer un document
  async generateDocument(options: DocumentGenerationOptions): Promise<GeneratedDocument> {
    const template = getTemplateById(options.templateId);
    if (!template) {
      throw new Error(`Template non trouvé: ${options.templateId}`);
    }

    // Valider les données
    const validation = this.validateData(template.fields, options.data);
    if (!validation.isValid) {
      throw new Error(`Données invalides: ${Object.values(validation.errors).join(', ')}`);
    }

    // Compiler le template
    const content = this.compileTemplate(template.content, options.data);

    // Créer le document généré
    const document: GeneratedDocument = {
      id: this.generateId(),
      templateId: template.id,
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      type: template.type,
      status: 'draft',
      propertyId: options.propertyId,
      tenantId: options.tenantId,
      userId: options.userId,
      data: options.data,
      content,
      signatures: options.signers?.map(signer => ({
        id: this.generateId(),
        signerName: signer.name,
        signerEmail: signer.email,
        signerRole: signer.role
      })) || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        version: '1.0',
        generatedBy: 'EasyBail Document Generator',
        legalFramework: template.legalCompliance.join(', ')
      }
    };

    return document;
  }

  // Pré-visualiser un document
  async previewDocument(templateId: string, data: Record<string, any>): Promise<string> {
    const template = getTemplateById(templateId);
    if (!template) {
      throw new Error('Template non trouvé');
    }

    return this.compileTemplate(template.content, data);
  }

  // Obtenir les données pré-remplies pour un template
  getPrefillData(templateId: string, property?: Property, tenant?: Tenant): Record<string, any> {
    const template = getTemplateById(templateId);
    if (!template) {
      return {};
    }

    return this.prefillData(template, property, tenant);
  }

  // Valider les données d'un formulaire
  validateFormData(templateId: string, data: Record<string, any>): { isValid: boolean; errors: Record<string, string> } {
    const template = getTemplateById(templateId);
    if (!template) {
      return { isValid: false, errors: { template: 'Template non trouvé' } };
    }

    return this.validateData(template.fields, data);
  }
}
export const documentGenerator = new DocumentGenerator();
