import { DocumentTemplate, DocumentField } from '../types/documents';

// Clé de stockage local
const TEMPLATES_STORAGE_KEY = 'easybail_document_templates';

// Champs communs réutilisables
const commonFields = {
  landlord: {
    landlordName: {
      id: 'landlordName',
      name: 'landlordName',
      label: 'Nom du bailleur',
      type: 'text' as const,
      required: true,
      placeholder: 'Jean Dupont'
    },
    landlordAddress: {
      id: 'landlordAddress',
      name: 'landlordAddress',
      label: 'Adresse du bailleur',
      type: 'textarea' as const,
      required: true,
      placeholder: '123 rue de la Paix, 75001 Paris'
    }
  },
  tenant: {
    tenantName: {
      id: 'tenantName',
      name: 'tenantName',
      label: 'Nom du locataire',
      type: 'text' as const,
      required: true,
      placeholder: 'Marie Martin'
    },
    tenantAddress: {
      id: 'tenantAddress',
      name: 'tenantAddress',
      label: 'Adresse du locataire',
      type: 'textarea' as const,
      required: true,
      placeholder: '456 avenue des Champs, 75008 Paris'
    }
  },
  property: {
    propertyAddress: {
      id: 'propertyAddress',
      name: 'propertyAddress',
      label: 'Adresse du bien',
      type: 'textarea' as const,
      required: true,
      placeholder: '15 rue de la Roquette, 75011 Paris'
    },
    propertyType: {
      id: 'propertyType',
      name: 'propertyType',
      label: 'Type de bien',
      type: 'select' as const,
      required: true,
      options: ['Appartement', 'Maison', 'Studio', 'Local commercial', 'Parking']
    },
    surface: {
      id: 'surface',
      name: 'surface',
      label: 'Surface (m²)',
      type: 'number' as const,
      required: true,
      validation: { min: 1, max: 10000 }
    },
    rooms: {
      id: 'rooms',
      name: 'rooms',
      label: 'Nombre de pièces',
      type: 'number' as const,
      required: true,
      validation: { min: 1, max: 20 }
    }
  },
  financial: {
    rent: {
      id: 'rent',
      name: 'rent',
      label: 'Loyer mensuel (€)',
      type: 'number' as const,
      required: true,
      validation: { min: 0 }
    },
    charges: {
      id: 'charges',
      name: 'charges',
      label: 'Charges mensuelles (€)',
      type: 'number' as const,
      required: false,
      validation: { min: 0 }
    },
    deposit: {
      id: 'deposit',
      name: 'deposit',
      label: 'Dépôt de garantie (€)',
      type: 'number' as const,
      required: true,
      validation: { min: 0 }
    }
  },
  dates: {
    leaseStart: {
      id: 'leaseStart',
      name: 'leaseStart',
      label: 'Date de début du bail',
      type: 'date' as const,
      required: true
    },
    leaseEnd: {
      id: 'leaseEnd',
      name: 'leaseEnd',
      label: 'Date de fin du bail',
      type: 'date' as const,
      required: false
    },
    documentDate: {
      id: 'documentDate',
      name: 'documentDate',
      label: 'Date du document',
      type: 'date' as const,
      required: true,
      defaultValue: new Date().toISOString().split('T')[0]
    }
  }
};

// Templates de documents
const defaultTemplates: DocumentTemplate[] = [
  // Contrat de bail
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Contrat de bail',
    type: 'lease',
    category: 'rental_start',
    description: 'Contrat de location conforme à la loi du 6 juillet 1989 et loi ALUR',
    isRequired: true,
    legalCompliance: ['Loi du 6 juillet 1989', 'Loi ALUR', 'Décret n°87-713', 'Code civil'],
    fields: [
      commonFields.landlord.landlordName,
      commonFields.landlord.landlordAddress,
      {
        id: 'landlordBirthDate',
        name: 'landlordBirthDate',
        label: 'Date de naissance du bailleur',
        type: 'date' as const,
        required: true
      },
      {
        id: 'landlordBirthPlace',
        name: 'landlordBirthPlace',
        label: 'Lieu de naissance du bailleur',
        type: 'text' as const,
        required: true,
        placeholder: 'Paris (75)'
      },
      commonFields.tenant.tenantName,
      commonFields.tenant.tenantAddress,
      {
        id: 'tenantBirthDate',
        name: 'tenantBirthDate',
        label: 'Date de naissance du locataire',
        type: 'date' as const,
        required: true
      },
      {
        id: 'tenantBirthPlace',
        name: 'tenantBirthPlace',
        label: 'Lieu de naissance du locataire',
        type: 'text' as const,
        required: true,
        placeholder: 'Lyon (69)'
      },
      {
        id: 'tenantProfession',
        name: 'tenantProfession',
        label: 'Profession du locataire',
        type: 'text' as const,
        required: true,
        placeholder: 'Employé(e)'
      },
      commonFields.property.propertyAddress,
      commonFields.property.propertyType,
      commonFields.property.surface,
      commonFields.property.rooms,
      {
        id: 'propertyFloor',
        name: 'propertyFloor',
        label: 'Étage',
        type: 'text' as const,
        required: false,
        placeholder: '2ème étage'
      },
      {
        id: 'propertyBuilding',
        name: 'propertyBuilding',
        label: 'Bâtiment/Escalier',
        type: 'text' as const,
        required: false,
        placeholder: 'Bâtiment A, Escalier B'
      },
      {
        id: 'propertyLot',
        name: 'propertyLot',
        label: 'Numéro de lot (copropriété)',
        type: 'text' as const,
        required: false,
        placeholder: 'Lot n°15'
      },
      {
        id: 'propertyDPE',
        name: 'propertyDPE',
        label: 'Classe énergétique (DPE)',
        type: 'select' as const,
        required: true,
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
      },
      {
        id: 'propertyGES',
        name: 'propertyGES',
        label: 'Émissions de GES',
        type: 'select' as const,
        required: true,
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
      },
      commonFields.financial.rent,
      commonFields.financial.charges,
      commonFields.financial.deposit,
      {
        id: 'chargesDetails',
        name: 'chargesDetails',
        label: 'Détail des charges',
        type: 'textarea' as const,
        required: true,
        placeholder: 'Eau froide, eau chaude, chauffage collectif, entretien parties communes, ascenseur...'
      },
      commonFields.dates.leaseStart,
      {
        id: 'leaseDuration',
        name: 'leaseDuration',
        label: 'Durée du bail',
        type: 'select' as const,
        required: true,
        options: ['3 ans (résidence principale)', '1 an (meublé)', '9 mois (étudiant)', 'Autre']
      },
      {
        id: 'furnished',
        name: 'furnished',
        label: 'Logement meublé',
        type: 'checkbox' as const,
        required: false
      },
      {
        id: 'inventoryDate',
        name: 'inventoryDate',
        label: 'Date de l\'état des lieux d\'entrée',
        type: 'date' as const,
        required: true
      },
      {
        id: 'keyHandover',
        name: 'keyHandover',
        label: 'Nombre de clés remises',
        type: 'number' as const,
        required: true,
        validation: { min: 1, max: 10 }
      },
      {
        id: 'insuranceRequired',
        name: 'insuranceRequired',
        label: 'Assurance habitation obligatoire',
        type: 'checkbox' as const,
        required: false,
        defaultValue: true
      },
      {
        id: 'guarantor',
        name: 'guarantor',
        label: 'Caution solidaire',
        type: 'checkbox' as const,
        required: false
      },
      {
        id: 'guarantorName',
        name: 'guarantorName',
        label: 'Nom de la caution',
        type: 'text' as const,
        required: false,
        dependsOn: 'guarantor',
        placeholder: 'Nom et prénom de la caution'
      },
      {
        id: 'revisionClause',
        name: 'revisionClause',
        label: 'Clause de révision annuelle',
        type: 'checkbox' as const,
        required: false,
        defaultValue: true
      },
      {
        id: 'solidarityClause',
        name: 'solidarityClause',
        label: 'Clause de solidarité (colocataires)',
        type: 'checkbox' as const,
        required: false
      }
    ],
    content: `
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4; margin: 2cm; }
        * { box-sizing: border-box; }
        .document-header { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #000; padding-bottom: 10px; page-break-inside: avoid; }
        .document-title { font-size: 18pt; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; text-align: center; page-break-after: avoid; }
        .legal-reference { font-size: 10pt; font-style: italic; margin-bottom: 20px; color: #444; page-break-inside: avoid; }
        .section-title { font-size: 14pt; font-weight: bold; margin: 20px 0 10px 0; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 5px; page-break-after: avoid; }
        .article-title { font-size: 12pt; font-weight: bold; margin: 15px 0 8px 0; text-decoration: underline; page-break-after: avoid; }
        .article-content { margin-bottom: 12px; text-align: justify; line-height: 1.5; page-break-inside: avoid; }
        .parties { margin: 20px 0; page-break-inside: avoid; }
        .party-info { margin: 12px 0; padding: 12px; border: 1px solid #ccc; background-color: #f9f9f9; border-radius: 5px; page-break-inside: avoid; }
        .signature-area { border: 1px solid #000; height: 80px; margin: 12px 0; text-align: center; padding-top: 30px; page-break-inside: avoid; }
        .signature-block { width: 45%; display: inline-block; margin: 20px 2.5%; vertical-align: top; page-break-inside: avoid; }
        .financial-table { width: 100%; border-collapse: collapse; margin: 12px 0; page-break-inside: avoid; }
        .financial-table td, .financial-table th { border: 1px solid #000; padding: 10px; text-align: left; }
        .financial-table th { background-color: #f0f0f0; font-weight: bold; }
        .financial-table tr.total { font-weight: bold; background-color: #f0f0f0; }
        .important { font-weight: bold; color: #000; }
        .legal-notice { font-size: 10pt; font-style: italic; margin: 15px 0; padding: 12px; border: 1px solid #ccc; background-color: #f9f9f9; border-radius: 5px; page-break-inside: avoid; }
        .signature-block { width: 45%; display: inline-block; margin: 20px 2.5%; vertical-align: top; page-break-inside: avoid; word-wrap: break-word; }
        .page-break { page-break-after: always; height: 0; display: block; }
        @media screen {
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
        }
      </style>
      
      <div class="document-header">
        <div class="document-title">CONTRAT DE BAIL D'HABITATION</div>
        <div class="legal-reference">
          Conforme à la loi n°89-462 du 6 juillet 1989 tendant à améliorer les rapports locatifs<br>
          et portant modification de la loi n°86-1290 du 23 décembre 1986<br>
          Loi ALUR n°2014-366 du 24 mars 2014
        </div>
      </div>
      
      <div class="section-title">DÉSIGNATION DES PARTIES</div>
      
      <div class="parties">
        <div class="party-info">
          <div class="article-title">LE BAILLEUR</div>
          <p><strong>Nom et prénom :</strong> {{landlordName}}</p>
          <p><strong>Né(e) le :</strong> {{landlordBirthDate}} <strong>à :</strong> {{landlordBirthPlace}}</p>
          <p><strong>Demeurant :</strong> {{landlordAddress}}</p>
        </div>
        
        <div class="party-info">
          <div class="article-title">LE LOCATAIRE</div>
          <p><strong>Nom et prénom :</strong> {{tenantName}}</p>
          <p><strong>Né(e) le :</strong> {{tenantBirthDate}} <strong>à :</strong> {{tenantBirthPlace}}</p>
          <p><strong>Profession :</strong> {{tenantProfession}}</p>
          <p><strong>Demeurant :</strong> {{tenantAddress}}</p>
        </div>
      </div>
      
      {{#if guarantor}}
      <div class="party-info">
        <div class="article-title">LA CAUTION SOLIDAIRE</div>
        <p><strong>Nom et prénom :</strong> {{guarantorName}}</p>
        <p><strong>Né(e) le :</strong> _________________ <strong>à :</strong> _________________</p>
        <p><strong>Demeurant :</strong> _________________</p>
      </div>
      {{/if}}
      
      <div class="section-title">ARTICLE 1 - OBJET ET DESTINATION DU BAIL</div>
      <div class="article-content">
        Le bailleur donne à bail au locataire qui accepte, un logement à usage d'<span class="important">habitation principale</span> {{#if furnished}}meublé{{/if}}, situé :
      </div>
      
      <div class="party-info">
        <p><strong>Adresse :</strong> {{propertyAddress}}</p>
        {{#if propertyFloor}}<p><strong>Étage :</strong> {{propertyFloor}}</p>{{/if}}
        {{#if propertyBuilding}}<p><strong>Bâtiment/Escalier :</strong> {{propertyBuilding}}</p>{{/if}}
        {{#if propertyLot}}<p><strong>Lot de copropriété :</strong> {{propertyLot}}</p>{{/if}}
        <p><strong>Type de logement :</strong> {{propertyType}}</p>
        <p><strong>Nombre de pièces principales :</strong> {{rooms}}</p>
        <p><strong>Surface habitable :</strong> {{surface}} m² (loi Carrez)</p>
      </div>
      
      <div class="section-title">ARTICLE 2 - DURÉE DU BAIL</div>
      <div class="article-content">
        Le présent bail est consenti pour une durée de <span class="important">{{leaseDuration}}</span>, 
        prenant effet le <span class="important">{{leaseStart}}</span>.
        <br><br>
        À défaut de congé donné par l'une ou l'autre des parties dans les conditions prévues par la loi, 
        le bail sera reconduit tacitement pour la même durée.
      </div>
      
      <div class="section-title">ARTICLE 3 - LOYER ET CHARGES</div>
      <div class="article-content">
        <table class="financial-table">
          <tr>
            <th>Désignation</th>
            <th>Montant mensuel</th>
          </tr>
          <tr>
            <td>Loyer principal</td>
            <td>{{rent}} €</td>
          </tr>
          <tr>
            <td>Charges locatives</td>
            <td>{{charges}} €</td>
          </tr>
          <tr class="total">
            <td>TOTAL</td>
            <td>{{total}} €</td>
          </tr>
        </table>
        
        <p><strong>Détail des charges :</strong> {{chargesDetails}}</p>
        
        <p>Le loyer est payable mensuellement et d'avance, le 1er de chaque mois, 
        au domicile du bailleur ou à l'adresse qu'il indiquera.</p>
        
        {{#if revisionClause}}
        <p><strong>Révision du loyer :</strong> Le loyer pourra être révisé chaque année à la date anniversaire 
        du contrat en fonction de la variation de l'indice de référence des loyers (IRL) publié par l'INSEE.</p>
        {{/if}}
      </div>
      
      <div class="section-title">ARTICLE 4 - DÉPÔT DE GARANTIE</div>
      <div class="article-content">
        <p>Il est versé ce jour par le locataire un dépôt de garantie de <span class="important">{{deposit}} €</span>, 
        correspondant à {{#if furnished}}deux mois{{else}}un mois{{/if}} de loyer hors charges.</p>
        <p>Ce dépôt ne portera pas intérêt au bénéfice du LOCATAIRE et ne sera pas révisable pendant la durée du contrat.</p>
        <p>Ce dépôt sera restitué dans un délai maximum d'<span class="important">un mois</span> à compter de la restitution des clés par le LOCATAIRE, 
        déduction faite, le cas échéant, des sommes restant dues au BAILLEUR et des sommes dont celui-ci pourrait être tenu aux lieu et place du LOCATAIRE, 
        sous réserve qu'elles soient dûment justifiées.</p>
        <p>Ce délai est porté à <span class="important">deux mois</span> lorsque l'état des lieux de sortie révèle des dégradations imputables au LOCATAIRE.</p>
      </div>

      <div class="section-title">ARTICLE 5 - ÉTAT DES LIEUX</div>
      <div class="article-content">
        Un état des lieux d'entrée sera établi le <span class="important">{{inventoryDate}}</span> 
        contradictoirement entre les parties ou par un tiers mandaté.
        <br><br>
        Un état des lieux de sortie sera établi lors de la restitution des clés dans les mêmes conditions.
        <br><br>
        <strong>Remise des clés :</strong> {{keyHandover}} clé(s) sont remises au locataire.
      </div>
      
      <div class="section-title">ARTICLE 6 - OBLIGATIONS DU LOCATAIRE</div>
      <div class="article-content">
        Le locataire s'engage notamment à :
        <ul style="list-style-type: disc; padding-left: 20px;">
          <li>Payer le loyer et les charges aux termes convenus.</li>
          <li>User paisiblement du logement suivant sa destination.</li>
          <li>Répondre des dégradations et pertes survenues pendant la durée du bail.</li>
          <li>Prendre à sa charge l'entretien courant du logement et des équipements mentionnés au contrat.</li>
          <li>Ne pas transformer les lieux sans accord écrit du bailleur.</li>
          {{#if insuranceRequired}}
          <li><span class="important">Souscrire une assurance habitation</span> et en justifier chaque année à la date anniversaire du contrat.</li>
          {{/if}}
          <li>Laisser exécuter les travaux d'amélioration des parties communes ou des parties privatives du même immeuble.</li>
          <li>Laisser visiter le logement en cas de vente ou relocation (2 heures par jour pendant les jours ouvrables).</li>
          <li>Respecter le règlement de copropriété de l'immeuble s'il existe.</li>
        </ul>
      </div>
      
      <div class="section-title">ARTICLE 7 - OBLIGATIONS DU BAILLEUR</div>
      <div class="article-content">
        Le bailleur s'engage notamment à :
        <ul style="list-style-type: disc; padding-left: 20px; margin-top: 10px; margin-bottom: 10px;">
          <li>Délivrer un logement en bon état d'usage et de réparation ainsi que les équipements mentionnés au contrat en bon état de fonctionnement.</li>
          <li>Assurer la jouissance paisible du logement et garantir le locataire contre les vices ou défauts qui en empêchent l'usage.</li>
          <li>Entretenir les locaux en état de servir à l'usage prévu par le contrat et y faire toutes les réparations nécessaires autres que locatives.</li>
          <li>Ne pas s'opposer aux aménagements réalisés par le locataire, dès lors que ceux-ci ne constituent pas une transformation de la chose louée.</li>
          <li>Remettre gratuitement une quittance au locataire qui en fait la demande.</li>
        </ul>
      </div>
      
      <div class="section-title">ARTICLE 8 - PERFORMANCE ÉNERGÉTIQUE</div>
      <div class="article-content">
        <p><strong>Classe énergétique (DPE) :</strong> {{propertyDPE}}</p>
        <p><strong>Émissions de gaz à effet de serre (GES) :</strong> {{propertyGES}}</p>
        
        <div class="legal-notice">
          Les informations sur les risques auxquels ce bien est exposé sont disponibles 
          sur le site Géorisques : www.georisques.gouv.fr
        </div>
      </div>
      
      {{#if solidarityClause}}
      <div class="section-title">ARTICLE 9 - CLAUSE DE SOLIDARITÉ</div>
      <div class="article-content">
        En cas de pluralité de locataires, ceux-ci sont tenus solidairement au paiement 
        du loyer et des charges, ainsi qu'à l'exécution de toutes les obligations du bail.
      </div>
      {{/if}}
      
      <div class="section-title">ARTICLE 10 - RÉSILIATION</div>
      <div class="article-content">
        <p><strong>Congé donné par le locataire :</strong> Le locataire peut résilier le bail à tout moment en respectant un préavis de trois mois 
        (réduit à un mois pour les logements situés en zone tendue, les logements meublés, ou en cas de mutation professionnelle, perte d'emploi, nouvel emploi consécutif à une perte d'emploi, état de santé justifiant un changement de domicile, bénéficiaire du RSA ou de l'AAH).</p>
        <p><strong>Congé donné par le bailleur :</strong> Le bailleur ne peut donner congé qu'à l'échéance du bail et uniquement pour l'un des motifs suivants : reprise du logement pour l'habiter lui-même ou y loger un proche, vente du logement, ou motif légitime et sérieux (notamment inexécution par le locataire de l'une des obligations lui incombant). Le délai de préavis est de six mois.</p>
      </div>
      
      <div class="section-title">ARTICLE 11 - CLAUSE RÉSOLUTOIRE</div>
      <div class="article-content">
        <p>Le présent contrat sera RÉSILIÉ IMMÉDIATEMENT ET DE PLEIN DROIT, c'est-à-dire sans qu'il soit besoin de faire ordonner cette résolution en justice :</p>
        <ul style="list-style-type: disc; padding-left: 20px;">
          <li>Deux mois après un commandement demeuré infructueux à défaut de paiement aux termes convenus de tout ou partie du loyer et des charges dûment justifiées.</li>
          <li>Un mois après un commandement demeuré infructueux à défaut d'assurance des risques locatifs.</li>
          <li>Un mois après un commandement demeuré infructueux en cas de non-respect de l'obligation d'user paisiblement des locaux loués.</li>
        </ul>
      </div>
      
      <div class="section-title">ARTICLE 12 - ÉLECTION DE DOMICILE</div>
      <div class="article-content">
        <p>Pour l'exécution du présent contrat, le bailleur élit domicile à son domicile et le locataire dans les lieux loués.</p>
      </div>
      
      <div class="page-break"></div>
      
      <div class="legal-notice">
        <strong>INFORMATION IMPORTANTE :</strong> Le présent contrat est soumis aux dispositions 
        de la loi n°89-462 du 6 juillet 1989. En cas de litige, les parties peuvent saisir 
        la commission départementale de conciliation avant toute saisine du tribunal judiciaire compétent.
      </div>
      
      <div style="margin-top: 50px;">
        <p><strong>Fait à :</strong> _________________________ <strong>Le :</strong> {{documentDate}}</p>
        <p><strong>En deux exemplaires originaux dont un remis à chacune des parties qui le reconnaît.</strong></p>
                
        <div style="margin-top: 30px;">
          <div class="signature-block">
            <p><strong>LE BAILLEUR</strong></p>
            <p>(Signature précédée de la mention "Lu et approuvé")</p>
            <div class="signature-area">Lu et approuvé</div>
          </div>
          <div class="signature-block">
            <p><strong>LE LOCATAIRE</strong></p>
            <p>(Signature précédée de la mention "Lu et approuvé")</p>
            <div class="signature-area">Lu et approuvé</div>
          </div>
          {{#if guarantor}}
          <div class="signature-block" style="width: 100%; margin-top: 20px;">
            <p><strong>LA CAUTION</strong></p>
            <p>(Signature précédée de la mention manuscrite "Lu et approuvé - Bon pour caution solidaire")</p>
            <div class="signature-area">Lu et approuvé - Bon pour caution solidaire</div>
          </div>
          {{/if}}
        </div>
      </div>
    `,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // État des lieux
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'État des lieux',
    type: 'inventory',
    category: 'rental_start',
    description: 'État des lieux d\'entrée ou de sortie',
    isRequired: true,
    legalCompliance: ['Loi du 6 juillet 1989', 'Décret n°2016-382'],
    fields: [
      commonFields.landlord.landlordName,
      commonFields.tenant.tenantName,
      commonFields.property.propertyAddress,
      commonFields.dates.documentDate,
      {
        id: 'inventoryType',
        name: 'inventoryType',
        label: 'Type d\'état des lieux',
        type: 'select',
        required: true,
        options: ['Entrée', 'Sortie']
      },
      {
        id: 'rooms_details',
        name: 'rooms_details',
        label: 'Détail des pièces',
        type: 'textarea',
        required: true,
        placeholder: 'Décrire l\'état de chaque pièce...'
      }
    ],
    content: `
      <div class="document-header">
        <h1>ÉTAT DES LIEUX {{inventoryType}}</h1>
        <p>Date : {{documentDate}}</p>
      </div>
      
      <div class="parties">
        <p><strong>Bailleur :</strong> {{landlordName}}</p>
        <p><strong>Locataire :</strong> {{tenantName}}</p>
        <p><strong>Bien :</strong> {{propertyAddress}}</p>
      </div>
      
      <div class="inventory-details">
        <h2>DESCRIPTION DE L'ÉTAT DU LOGEMENT :</h2>
        <div class="rooms-description">{{rooms_details}}</div>
      </div>
      
      <div class="signatures">
        <div class="signature-block">
          <p>Le Bailleur</p>
          <div class="signature-area"></div>
        </div>
        <div class="signature-block">
          <p>Le Locataire</p>
          <div class="signature-area"></div>
        </div>
      </div>
    `,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Quittance de loyer
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Quittance de loyer mensuelle',
    type: 'receipt',
    category: 'financial',
    description: 'Quittance mensuelle de loyer',
    isRequired: false,
    legalCompliance: ['Article 21 de la loi du 6 juillet 1989'],
    fields: [
      commonFields.landlord.landlordName,
      commonFields.landlord.landlordAddress,
      commonFields.tenant.tenantName,
      commonFields.property.propertyAddress,
      commonFields.financial.rent,
      commonFields.financial.charges,
      {
        id: 'period',
        name: 'period',
        label: 'Période',
        type: 'text',
        required: true,
        placeholder: 'Janvier 2024'
      },
      {
        id: 'paymentDate',
        name: 'paymentDate',
        label: 'Date de paiement',
        type: 'date',
        required: true
      }
    ],
    content: `
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4; margin: 2cm; }
        * { box-sizing: border-box; }
        .document-header { text-align: center; margin-bottom: 20px; }
        .document-title { font-size: 18pt; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; text-align: center; }
        .document-period { font-size: 14pt; margin-bottom: 20px; text-align: center; }
        .landlord-info { margin: 20px 0; }
        .receipt-content { margin: 30px 0; }
        .financial-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .financial-table td, .financial-table th { border: 1px solid #000; padding: 10px; text-align: left; }
        .financial-table tr.total { font-weight: bold; background-color: #f0f0f0; }
        .signature-area { margin-top: 50px; text-align: right; }
        .signature-block { width: 45%; display: inline-block; margin-left: auto; text-align: center; }
        .signature-line { border-top: 1px solid #000; margin-top: 50px; width: 100%; }
        .page-break { page-break-after: always; height: 0; display: block; }
      </style>
      
      <div class="document-header">
        <div class="document-title">QUITTANCE DE LOYER</div>
        <div class="document-period">Période : {{period}}</div>
      </div>
      
      <div class="landlord-info">
        <p><strong>{{landlordName}}</strong><br>{{landlordAddress}}</p>
      </div>
      
      <div class="receipt-content">
        <p>Je soussigné(e) <strong>{{landlordName}}</strong>, propriétaire du logement situé :</p>
        <p><strong>{{propertyAddress}}</strong></p>
        
        <p>Reconnais avoir reçu de <strong>{{tenantName}}</strong> la somme de <strong>{{total}} euros</strong> ({{total}} €) pour le paiement du loyer et des charges de la période <strong>{{period}}</strong>, soit :</p>
        
        <table class="financial-table">
          <tr>
            <th>Désignation</th>
            <th>Montant mensuel</th>
          </tr>
          <tr>
            <td>Loyer principal</td>
            <td>{{rent}} €</td>
          </tr>
          <tr>
            <td>Charges locatives</td>
            <td>{{charges}} €</td>
          </tr>
          <tr class="total">
            <td>TOTAL</td>
            <td>{{total}} €</td>
          </tr>
        </table>
        
        <p>Paiement effectué le : <strong>{{paymentDate}}</strong></p>
        
        <p>Pour la période de location du <strong>01/{{period}}</strong> au <strong>31/{{period}}</strong>.</p>
        
        <p>Cette quittance annule tous les reçus qui auraient pu être établis précédemment en cas de paiement partiel du montant ci-dessus.</p>
        
        <p>En conséquence, le propriétaire donne quittance, sous réserve d'encaissement, de la somme ci-dessus au locataire.</p>
      </div>
      
      <div class="signature-area">
        <p>Fait le {{documentDate}}</p>
        <div class="signature-block">
          <p>Signature du bailleur</p>
          <div class="signature-line"></div>
          <p>{{landlordName}}</p>
        </div>
      </div>
    `,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Préavis de départ
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Préavis de départ',
    type: 'notice',
    category: 'rental_end',
    description: 'Lettre de préavis du locataire',
    isRequired: false,
    legalCompliance: ['Article 15 de la loi du 6 juillet 1989'],
    fields: [
      commonFields.tenant.tenantName,
      commonFields.tenant.tenantAddress,
      commonFields.landlord.landlordName,
      commonFields.landlord.landlordAddress,
      commonFields.property.propertyAddress,
      {
        id: 'noticeDate',
        name: 'noticeDate',
        label: 'Date de remise du préavis',
        type: 'date',
        required: true
      },
      {
        id: 'departureDate',
        name: 'departureDate',
        label: 'Date de départ souhaitée',
        type: 'date',
        required: true
      }
    ],
    content: `
      <div class="letter-header">
        <div class="sender">
          {{tenantName}}<br>
          {{tenantAddress}}
        </div>
        <div class="recipient">
          {{landlordName}}<br>
          {{landlordAddress}}
        </div>
      </div>
      
      <div class="letter-content">
        <p><strong>Objet : Préavis de départ</strong></p>
        <p>Lettre recommandée avec accusé de réception</p>
        
        <p>Madame, Monsieur,</p>
        
        <p>J'ai l'honneur de vous informer que je souhaite résilier le bail du logement que j'occupe situé :</p>
        <p><strong>{{propertyAddress}}</strong></p>
        
        <p>Conformément aux dispositions de l'article 15 de la loi du 6 juillet 1989, je vous donne par la présente mon préavis de départ.</p>
        
        <p>La date de remise de ce préavis étant le {{noticeDate}}, je quitterai définitivement les lieux le {{departureDate}}.</p>
        
        <p>Je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.</p>
        
        <div class="signature">
          <p>Fait le {{documentDate}}</p>
          <div class="signature-block">
            <p>{{tenantName}}</p>
            <div class="signature-area"></div>
          </div>
        </div>
      </div>
    `,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Fonction pour initialiser les templates dans le localStorage
const initializeTemplates = (): DocumentTemplate[] => {
  const storedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
  if (!storedTemplates) {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(defaultTemplates));
    return defaultTemplates;
  }
  
  try {
    return JSON.parse(storedTemplates).map((template: any) => ({
      ...template,
      createdAt: new Date(template.createdAt),
      updatedAt: new Date(template.updatedAt)
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des templates:', error);
    return defaultTemplates;
  }
};

// Exporter les templates
export const documentTemplates = initializeTemplates();

// Fonction pour obtenir un template par ID
export const getTemplateById = (id: string): DocumentTemplate | undefined => {
  return documentTemplates.find(template => template.id === id);
};

// Fonction pour obtenir les templates par catégorie
export const getTemplatesByCategory = (category: string): DocumentTemplate[] => {
  return documentTemplates.filter(template => template.category === category);
};

// Fonction pour obtenir les templates par type
export const getTemplatesByType = (type: string): DocumentTemplate[] => {
  return documentTemplates.filter(template => template.type === type);
};

// Fonction pour sauvegarder un template
export const saveTemplate = (template: DocumentTemplate): void => {
  const index = documentTemplates.findIndex(t => t.id === template.id);
  
  if (index >= 0) {
    documentTemplates[index] = {
      ...template,
      updatedAt: new Date()
    };
  } else {
    documentTemplates.push({
      ...template,
      id: template.id || `template_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(documentTemplates));
};

// Fonction pour supprimer un template
export const deleteTemplate = (id: string): boolean => {
  const initialLength = documentTemplates.length;
  const filteredTemplates = documentTemplates.filter(template => template.id !== id);
  
  if (filteredTemplates.length < initialLength) {
    documentTemplates.length = 0;
    documentTemplates.push(...filteredTemplates);
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(documentTemplates));
    return true;
  }
  
  return false;
};
