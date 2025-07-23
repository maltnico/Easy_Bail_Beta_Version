import { EmailTemplate } from './emailTemplateService';

// Templates d'emails par défaut
export const defaultEmailTemplates: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Template de quittance de loyer
  {
    name: "Quittance de loyer mensuelle",
    subject: "Quittance de loyer - {{month}}",
    category: "financial",
    type: "email",
    documentTemplateId: "550e8400-e29b-41d4-a716-446655440003",
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quittance de loyer - {{month}}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #4F46E5;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      padding: 20px;
      background-color: #f9f9f9;
      border-left: 1px solid #ddd;
      border-right: 1px solid #ddd;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #666;
      background-color: #f1f1f1;
      border-radius: 0 0 5px 5px;
      border: 1px solid #ddd;
    }
    .receipt {
      border: 1px solid #ddd;
      padding: 20px;
      margin: 20px 0;
      background-color: white;
      border-radius: 5px;
    }
    .receipt-header {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    .receipt-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .receipt-table th, .receipt-table td {
      border: 1px solid #ddd;
      padding: 10px;
      text-align: left;
    }
    .receipt-table th {
      background-color: #f5f5f5;
    }
    .receipt-table .total {
      font-weight: bold;
      background-color: #f5f5f5;
    }
    .button {
      display: inline-block;
      background-color: #4F46E5;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .attachment-note {
      background-color: #e8f4fd;
      border: 1px solid #b8e0fd;
      border-radius: 5px;
      padding: 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Quittance de Loyer</h1>
    <p>{{month}}</p>
  </div>
  <div class="content">
    <h2>Bonjour {{tenant_name}},</h2>
    <p>Veuillez trouver ci-dessous votre quittance de loyer pour le mois de {{month}}.</p>
    
    <div class="receipt">
      <div class="receipt-header">
        <h2>QUITTANCE DE LOYER</h2>
        <p>Période : {{month}}</p>
      </div>
      
      <p><strong>Bailleur :</strong> {{landlord_name}}</p>
      <p><strong>Locataire :</strong> {{tenant_name}}</p>
      <p><strong>Adresse du logement :</strong> {{property_address}}</p>
      
      <table class="receipt-table">
        <tr>
          <th>Désignation</th>
          <th>Montant</th>
        </tr>
        <tr>
          <td>Loyer</td>
          <td>{{rent_amount}}€</td>
        </tr>
        <tr>
          <td>Charges</td>
          <td>{{charges_amount}}€</td>
        </tr>
        <tr class="total">
          <td>Total</td>
          <td>{{total_amount}}€</td>
        </tr>
      </table>
      
      <p>Je soussigné(e), {{landlord_name}}, propriétaire du logement désigné ci-dessus, déclare avoir reçu de {{tenant_name}} la somme de {{total_amount}}€ ({{total_amount}} euros) au titre du loyer et des charges pour la période du 1er au dernier jour de {{month}}.</p>
      
      <p>Cette quittance annule tous les reçus qui auraient pu être établis pour la même période.</p>
      
      <p>Fait le {{current_date}}</p>
      
      <p><strong>{{landlord_name}}</strong><br>Signature</p>
    </div>
    
    <div class="attachment-note">
      <p><strong>Note :</strong> Vous trouverez également cette quittance en pièce jointe au format PDF pour vos archives.</p>
    </div>
    
    <p>Pour toute question concernant cette quittance, n'hésitez pas à me contacter.</p>
    
    <p>Cordialement,</p>
    <p><strong>{{landlord_name}}</strong><br>Propriétaire</p>
  </div>
  <div class="footer">
    <p>© 2025 EasyBail. Tous droits réservés.</p>
    <p>Cet email a été généré automatiquement, merci de ne pas y répondre directement.</p>
  </div>
</body>
</html>`
  },
  
  // Template de rappel de paiement
  {
    name: "Rappel de paiement",
    subject: "Rappel : Paiement du loyer {{month}}",
    category: "financial",
    type: "email",
    documentTemplateId: undefined,
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rappel : Paiement du loyer {{month}}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #F59E0B;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      padding: 20px;
      background-color: #f9f9f9;
      border-left: 1px solid #ddd;
      border-right: 1px solid #ddd;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #666;
      background-color: #f1f1f1;
      border-radius: 0 0 5px 5px;
      border: 1px solid #ddd;
    }
    .alert-box {
      background-color: #fff3cd;
      border: 1px solid #ffeeba;
      color: #856404;
      border-radius: 5px;
      padding: 15px;
      margin: 20px 0;
    }
    .payment-details {
      background-color: #e8f4fd;
      border: 1px solid #b8e0fd;
      border-radius: 5px;
      padding: 15px;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      background-color: #F59E0B;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Rappel de Paiement</h1>
  </div>
  <div class="content">
    <h2>Bonjour {{tenant_name}},</h2>
    <p>Nous vous rappelons que le paiement du loyer pour le mois de {{month}} n'a pas encore été enregistré.</p>
    
    <div class="alert-box">
      <p><strong>Détails du paiement en attente :</strong></p>
      <ul>
        <li>Loyer : {{rent_amount}}€</li>
        <li>Charges : {{charges_amount}}€</li>
        <li>Total dû : {{total_amount}}€</li>
        <li>Date d'échéance : 5 {{month}}</li>
      </ul>
    </div>
    
    <p>Si vous avez déjà effectué ce paiement, veuillez ignorer ce message et nous faire parvenir le justificatif de paiement par retour d'email.</p>
    
    <div class="payment-details">
      <p><strong>Coordonnées bancaires pour le paiement :</strong></p>
      <p>IBAN : FR76 XXXX XXXX XXXX XXXX XXXX XXX</p>
      <p>BIC : XXXXXXXX</p>
      <p>Titulaire : {{landlord_name}}</p>
      <p>Référence à indiquer : LOYER {{month}} - {{property_name}}</p>
    </div>
    
    <p>Pour toute question ou difficulté concernant ce paiement, n'hésitez pas à me contacter directement.</p>
    
    <p>Cordialement,</p>
    <p><strong>{{landlord_name}}</strong><br>Propriétaire</p>
  </div>
  <div class="footer">
    <p>© 2025 EasyBail. Tous droits réservés.</p>
    <p>Cet email a été généré automatiquement, merci de ne pas y répondre directement.</p>
  </div>
</body>
</html>`
  },
  
  // Template de rappel d'assurance habitation
  {
    name: "Rappel d'assurance habitation",
    subject: "Rappel : Attestation d'assurance habitation",
    category: "administrative",
    type: "email",
    documentTemplateId: undefined,
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rappel : Attestation d'assurance habitation</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #10B981;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      padding: 20px;
      background-color: #f9f9f9;
      border-left: 1px solid #ddd;
      border-right: 1px solid #ddd;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #666;
      background-color: #f1f1f1;
      border-radius: 0 0 5px 5px;
      border: 1px solid #ddd;
    }
    .info-box {
      background-color: #d1fae5;
      border: 1px solid #a7f3d0;
      color: #065f46;
      border-radius: 5px;
      padding: 15px;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      background-color: #10B981;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Rappel d'Assurance Habitation</h1>
  </div>
  <div class="content">
    <h2>Bonjour {{tenant_name}},</h2>
    <p>Je me permets de vous contacter concernant votre attestation d'assurance habitation pour le logement situé au :</p>
    <p><strong>{{property_address}}</strong></p>
    
    <div class="info-box">
      <p><strong>Rappel important :</strong></p>
      <p>Conformément à l'article 7 de la loi du 6 juillet 1989, tout locataire est tenu de s'assurer contre les risques locatifs (dégâts des eaux, incendie, etc.) et de justifier de cette assurance lors de la remise des clés puis chaque année à la date d'anniversaire du contrat.</p>
    </div>
    
    <p>Selon nos dossiers, votre attestation d'assurance habitation arrive à échéance prochainement ou est déjà expirée.</p>
    
    <p>Nous vous remercions de bien vouloir nous faire parvenir votre nouvelle attestation d'assurance habitation dès que possible, soit :</p>
    <ul>
      <li>Par email en réponse à ce message</li>
      <li>Par courrier à l'adresse suivante : [Votre adresse]</li>
      <li>Via votre espace locataire sur notre plateforme</li>
    </ul>
    
    <p>Pour rappel, l'absence d'assurance habitation peut constituer un motif de résiliation de bail.</p>
    
    <p>Je vous remercie pour votre compréhension et reste à votre disposition pour toute question.</p>
    
    <p>Cordialement,</p>
    <p><strong>{{landlord_name}}</strong><br>Propriétaire</p>
  </div>
  <div class="footer">
    <p>© 2025 EasyBail. Tous droits réservés.</p>
    <p>Cet email a été généré automatiquement, merci de ne pas y répondre directement.</p>
  </div>
</body>
</html>`
  },
  
  // Template de notification d'incident
  {
    name: "Notification d'incident",
    subject: "Incident signalé - {{property_name}}",
    category: "property",
    type: "email",
    documentTemplateId: undefined,
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Incident signalé - {{property_name}}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #EF4444;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      padding: 20px;
      background-color: #f9f9f9;
      border-left: 1px solid #ddd;
      border-right: 1px solid #ddd;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #666;
      background-color: #f1f1f1;
      border-radius: 0 0 5px 5px;
      border: 1px solid #ddd;
    }
    .incident-box {
      background-color: #fee2e2;
      border: 1px solid #fecaca;
      color: #991b1b;
      border-radius: 5px;
      padding: 15px;
      margin: 20px 0;
    }
    .action-box {
      background-color: #e8f4fd;
      border: 1px solid #b8e0fd;
      border-radius: 5px;
      padding: 15px;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      background-color: #EF4444;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Incident Signalé</h1>
  </div>
  <div class="content">
    <h2>Bonjour {{landlord_name}},</h2>
    <p>Un incident a été signalé concernant votre bien situé au :</p>
    <p><strong>{{property_address}}</strong></p>
    
    <div class="incident-box">
      <p><strong>Détails de l'incident :</strong></p>
      <ul>
        <li><strong>Type :</strong> {{incident_type}}</li>
        <li><strong>Date du signalement :</strong> {{incident_date}}</li>
        <li><strong>Signalé par :</strong> {{tenant_name}}</li>
        <li><strong>Description :</strong> {{incident_description}}</li>
      </ul>
    </div>
    
    <div class="action-box">
      <p><strong>Actions recommandées :</strong></p>
      <ol>
        <li>Contacter le locataire pour obtenir plus d'informations</li>
        <li>Planifier une visite pour évaluer les dégâts si nécessaire</li>
        <li>Contacter un professionnel pour les réparations</li>
        <li>Mettre à jour le statut de l'incident dans votre espace propriétaire</li>
      </ol>
    </div>
    
    <p>Pour plus de détails ou pour gérer cet incident, veuillez vous connecter à votre espace propriétaire.</p>
    
    <a href="#" class="button">Voir les détails de l'incident</a>
    
    <p>Cordialement,</p>
    <p><strong>L'équipe EasyBail</strong></p>
  </div>
  <div class="footer">
    <p>© 2025 EasyBail. Tous droits réservés.</p>
    <p>Cet email a été généré automatiquement, merci de ne pas y répondre directement.</p>
  </div>
</body>
</html>`
  },
  
  // Template de révision de loyer
  {
    name: "Révision annuelle du loyer",
    subject: "Information : Révision annuelle de votre loyer",
    category: "financial",
    type: "email",
    documentTemplateId: undefined,
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Information : Révision annuelle de votre loyer</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #8B5CF6;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      padding: 20px;
      background-color: #f9f9f9;
      border-left: 1px solid #ddd;
      border-right: 1px solid #ddd;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #666;
      background-color: #f1f1f1;
      border-radius: 0 0 5px 5px;
      border: 1px solid #ddd;
    }
    .calculation-box {
      background-color: #ede9fe;
      border: 1px solid #ddd6fe;
      color: #5b21b6;
      border-radius: 5px;
      padding: 15px;
      margin: 20px 0;
    }
    .legal-box {
      background-color: #e8f4fd;
      border: 1px solid #b8e0fd;
      border-radius: 5px;
      padding: 15px;
      margin: 20px 0;
      font-size: 0.9em;
    }
    .button {
      display: inline-block;
      background-color: #8B5CF6;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    table, th, td {
      border: 1px solid #ddd;
    }
    th, td {
      padding: 10px;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Révision Annuelle de Loyer</h1>
  </div>
  <div class="content">
    <h2>Bonjour {{tenant_name}},</h2>
    <p>Conformément aux dispositions de votre contrat de bail et à la législation en vigueur, je vous informe que le loyer de votre logement situé au :</p>
    <p><strong>{{property_address}}</strong></p>
    <p>fera l'objet d'une révision annuelle à compter du <strong>{{revision_date}}</strong>.</p>
    
    <div class="calculation-box">
      <p><strong>Calcul de la révision :</strong></p>
      <table>
        <tr>
          <td>Loyer actuel</td>
          <td>{{rent_amount}}€</td>
        </tr>
        <tr>
          <td>Indice IRL de référence (initial)</td>
          <td>{{old_index_value}}</td>
        </tr>
        <tr>
          <td>Nouvel indice IRL ({{new_index_quarter}})</td>
          <td>{{new_index_value}}</td>
        </tr>
        <tr>
          <td>Variation de l'indice</td>
          <td>{{index_variation}}%</td>
        </tr>
        <tr>
          <th>Nouveau loyer</th>
          <th>{{new_rent_amount}}€</th>
        </tr>
      </table>
    </div>
    
    <p>Cette révision représente une augmentation de <strong>{{rent_increase_amount}}€</strong> par mois.</p>
    
    <p>Le nouveau montant total mensuel à payer sera donc :</p>
    <ul>
      <li>Loyer : <strong>{{new_rent_amount}}€</strong></li>
      <li>Charges : <strong>{{charges_amount}}€</strong> (inchangées)</li>
      <li><strong>Total : {{new_total_amount}}€</strong></li>
    </ul>
    
    <div class="legal-box">
      <p><strong>Base légale :</strong></p>
      <p>Cette révision est effectuée conformément à l'article 17-1 de la loi n°89-462 du 6 juillet 1989, sur la base de l'Indice de Référence des Loyers (IRL) publié par l'INSEE.</p>
    </div>
    
    <p>Ce nouveau loyer sera applicable à partir du <strong>{{revision_date}}</strong>. Je vous remercie de bien vouloir prendre vos dispositions pour ajuster votre paiement mensuel en conséquence.</p>
    
    <p>Pour toute question concernant cette révision, n'hésitez pas à me contacter.</p>
    
    <p>Cordialement,</p>
    <p><strong>{{landlord_name}}</strong><br>Propriétaire</p>
  </div>
  <div class="footer">
    <p>© 2025 EasyBail. Tous droits réservés.</p>
    <p>Cet email a été généré automatiquement, merci de ne pas y répondre directement.</p>
  </div>
</body>
</html>`
  },
  
  // Template de fin de bail
  {
    name: "Fin de bail - Informations",
    subject: "Informations concernant la fin de votre bail",
    category: "tenant",
    type: "email",
    documentTemplateId: undefined,
    content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Informations concernant la fin de votre bail</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #3B82F6;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .content {
      padding: 20px;
      background-color: #f9f9f9;
      border-left: 1px solid #ddd;
      border-right: 1px solid #ddd;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #666;
      background-color: #f1f1f1;
      border-radius: 0 0 5px 5px;
      border: 1px solid #ddd;
    }
    .info-box {
      background-color: #dbeafe;
      border: 1px solid #bfdbfe;
      color: #1e40af;
      border-radius: 5px;
      padding: 15px;
      margin: 20px 0;
    }
    .checklist {
      background-color: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 5px;
      padding: 15px;
      margin: 20px 0;
    }
    .checklist ul {
      padding-left: 20px;
    }
    .checklist li {
      margin-bottom: 10px;
    }
    .button {
      display: inline-block;
      background-color: #3B82F6;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Fin de Bail</h1>
  </div>
  <div class="content">
    <h2>Bonjour {{tenant_name}},</h2>
    <p>Je me permets de vous contacter concernant la fin prochaine de votre bail pour le logement situé au :</p>
    <p><strong>{{property_address}}</strong></p>
    
    <div class="info-box">
      <p><strong>Informations importantes :</strong></p>
      <ul>
        <li>Date de fin du bail : <strong>{{lease_end_date}}</strong></li>
        <li>Date prévue de l'état des lieux de sortie : à convenir ensemble</li>
      </ul>
    </div>
    
    <p>Afin de préparer au mieux votre départ, voici quelques points importants à prendre en compte :</p>
    
    <div class="checklist">
      <p><strong>Checklist pour votre départ :</strong></p>
      <ul>
        <li>Résilier vos contrats (électricité, gaz, internet, etc.)</li>
        <li>Effectuer le nettoyage complet du logement</li>
        <li>Réparer les éventuels dommages mineurs</li>
        <li>Préparer tous les jeux de clés à rendre</li>
        <li>Relever les compteurs (eau, électricité, gaz)</li>
        <li>Vider entièrement le logement de vos effets personnels</li>
        <li>Prendre rendez-vous pour l'état des lieux de sortie</li>
      </ul>
    </div>
    
    <p>Je vous propose de convenir ensemble d'une date pour l'état des lieux de sortie. Merci de me communiquer vos disponibilités pour les jours précédant la fin du bail.</p>
    
    <p>Concernant votre dépôt de garantie, il vous sera restitué dans un délai d'un mois à compter de la remise des clés si l'état des lieux de sortie est conforme à l'état des lieux d'entrée, ou dans un délai de deux mois si des réparations sont nécessaires.</p>
    
    <p>N'hésitez pas à me contacter pour toute question concernant votre départ.</p>
    
    <p>Cordialement,</p>
    <p><strong>{{landlord_name}}</strong><br>Propriétaire</p>
  </div>
  <div class="footer">
    <p>© 2025 EasyBail. Tous droits réservés.</p>
    <p>Cet email a été généré automatiquement, merci de ne pas y répondre directement.</p>
  </div>
</body>
</html>`
  }
];
