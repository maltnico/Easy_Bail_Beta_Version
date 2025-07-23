/*
  # Insertion des modèles de documents par défaut

  1. Templates de documents
    - Contrat de bail conforme loi ALUR
    - État des lieux d'entrée/sortie
    - Quittance de loyer mensuelle
    - Préavis de départ
    - Attestation d'assurance

  2. Champs dynamiques
    - Définition des champs pour chaque template
    - Validation et contraintes
    - Valeurs par défaut

  3. Conformité légale
    - Références légales pour chaque document
    - Mise à jour automatique selon la législation
*/

-- Insérer les templates de documents par défaut
INSERT INTO document_templates (
  id,
  user_id,
  name,
  type,
  category,
  description,
  content,
  fields,
  is_required,
  is_system,
  legal_compliance
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  NULL,
  'Contrat de bail',
  'lease',
  'rental_start',
  'Contrat de location conforme à la loi du 6 juillet 1989 et loi ALUR',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Contrat de bail</title>
  <style>
    body { font-family: Times, serif; font-size: 12pt; line-height: 1.4; margin: 2cm; }
    .document-header { text-align: center; margin-bottom: 20px; border-bottom: 1px solid #000; padding-bottom: 10px; }
    .document-title { font-size: 18pt; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; }
    .legal-reference { font-size: 10pt; font-style: italic; margin-bottom: 20px; color: #444; }
    .section-title { font-size: 14pt; font-weight: bold; margin: 20px 0 10px 0; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 5px; }
    .article-title { font-size: 12pt; font-weight: bold; margin: 15px 0 8px 0; text-decoration: underline; }
    .article-content { margin-bottom: 12px; text-align: justify; line-height: 1.5; }
    .parties { margin: 20px 0; }
    .party-info { margin: 12px 0; padding: 12px; border: 1px solid #ccc; background-color: #f9f9f9; border-radius: 5px; }
    .signature-area { border: 1px solid #000; height: 80px; margin: 12px 0; text-align: center; padding-top: 30px; }
    .signature-block { width: 45%; display: inline-block; margin: 20px 2.5%; vertical-align: top; }
    .financial-table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    .financial-table td, .financial-table th { border: 1px solid #000; padding: 10px; text-align: left; }
    .financial-table th { background-color: #f0f0f0; font-weight: bold; }
    .financial-table tr.total { font-weight: bold; background-color: #f0f0f0; }
    .important { font-weight: bold; color: #000; }
    .legal-notice { font-size: 10pt; font-style: italic; margin: 15px 0; padding: 12px; border: 1px solid #ccc; background-color: #f9f9f9; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="document-header">
    <div class="document-title">CONTRAT DE BAIL D''HABITATION</div>
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
  
  <div class="section-title">ARTICLE 1 - OBJET ET DESTINATION DU BAIL</div>
  <div class="article-content">
    Le bailleur donne à bail au locataire qui accepte, un logement à usage d''<span class="important">habitation principale</span>, situé :
  </div>
  
  <div class="party-info">
    <p><strong>Adresse :</strong> {{propertyAddress}}</p>
    <p><strong>Type de logement :</strong> {{propertyType}}</p>
    <p><strong>Nombre de pièces principales :</strong> {{rooms}}</p>
    <p><strong>Surface habitable :</strong> {{surface}} m² (loi Carrez)</p>
  </div>
  
  <div class="section-title">ARTICLE 2 - DURÉE DU BAIL</div>
  <div class="article-content">
    Le présent bail est consenti pour une durée de <span class="important">{{leaseDuration}}</span>, 
    prenant effet le <span class="important">{{leaseStart}}</span>.
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
  </div>
  
  <div class="section-title">ARTICLE 4 - DÉPÔT DE GARANTIE</div>
  <div class="article-content">
    <p>Il est versé ce jour par le locataire un dépôt de garantie de <span class="important">{{deposit}} €</span>.</p>
  </div>
  
  <div style="margin-top: 50px;">
    <p><strong>Fait à :</strong> _________________________ <strong>Le :</strong> {{documentDate}}</p>
    
    <div style="margin-top: 30px;">
      <div class="signature-block">
        <p><strong>LE BAILLEUR</strong></p>
        <div class="signature-area">Lu et approuvé</div>
      </div>
      <div class="signature-block">
        <p><strong>LE LOCATAIRE</strong></p>
        <div class="signature-area">Lu et approuvé</div>
      </div>
    </div>
  </div>
</body>
</html>',
  '[
    {"id": "landlordName", "name": "landlordName", "label": "Nom du bailleur", "type": "text", "required": true, "placeholder": "Jean Dupont"},
    {"id": "landlordAddress", "name": "landlordAddress", "label": "Adresse du bailleur", "type": "textarea", "required": true},
    {"id": "landlordBirthDate", "name": "landlordBirthDate", "label": "Date de naissance du bailleur", "type": "date", "required": true},
    {"id": "landlordBirthPlace", "name": "landlordBirthPlace", "label": "Lieu de naissance du bailleur", "type": "text", "required": true},
    {"id": "tenantName", "name": "tenantName", "label": "Nom du locataire", "type": "text", "required": true},
    {"id": "tenantAddress", "name": "tenantAddress", "label": "Adresse du locataire", "type": "textarea", "required": true},
    {"id": "tenantBirthDate", "name": "tenantBirthDate", "label": "Date de naissance du locataire", "type": "date", "required": true},
    {"id": "tenantBirthPlace", "name": "tenantBirthPlace", "label": "Lieu de naissance du locataire", "type": "text", "required": true},
    {"id": "tenantProfession", "name": "tenantProfession", "label": "Profession du locataire", "type": "text", "required": true},
    {"id": "propertyAddress", "name": "propertyAddress", "label": "Adresse du bien", "type": "textarea", "required": true},
    {"id": "propertyType", "name": "propertyType", "label": "Type de bien", "type": "select", "required": true, "options": ["Appartement", "Maison", "Studio", "Local commercial", "Parking"]},
    {"id": "surface", "name": "surface", "label": "Surface (m²)", "type": "number", "required": true, "validation": {"min": 1, "max": 10000}},
    {"id": "rooms", "name": "rooms", "label": "Nombre de pièces", "type": "number", "required": true, "validation": {"min": 1, "max": 20}},
    {"id": "rent", "name": "rent", "label": "Loyer mensuel (€)", "type": "number", "required": true, "validation": {"min": 0}},
    {"id": "charges", "name": "charges", "label": "Charges mensuelles (€)", "type": "number", "required": false, "validation": {"min": 0}},
    {"id": "deposit", "name": "deposit", "label": "Dépôt de garantie (€)", "type": "number", "required": true, "validation": {"min": 0}},
    {"id": "leaseStart", "name": "leaseStart", "label": "Date de début du bail", "type": "date", "required": true},
    {"id": "leaseDuration", "name": "leaseDuration", "label": "Durée du bail", "type": "select", "required": true, "options": ["3 ans (résidence principale)", "1 an (meublé)", "9 mois (étudiant)", "Autre"]},
    {"id": "documentDate", "name": "documentDate", "label": "Date du document", "type": "date", "required": true, "defaultValue": "{{today}}"}
  ]'::jsonb,
  true,
  true,
  ARRAY['Loi du 6 juillet 1989', 'Loi ALUR', 'Décret n°87-713', 'Code civil']
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  NULL,
  'État des lieux',
  'inventory',
  'rental_start',
  'État des lieux d''entrée ou de sortie',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>État des lieux</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.4; margin: 2cm; }
    .document-header { text-align: center; margin-bottom: 20px; }
    .document-title { font-size: 18pt; font-weight: bold; margin-bottom: 10px; }
    .parties { margin: 20px 0; }
    .party-info { margin: 12px 0; padding: 12px; border: 1px solid #ccc; background-color: #f9f9f9; }
    .inventory-details { margin: 20px 0; }
    .signature-area { border: 1px solid #000; height: 60px; margin: 12px 0; text-align: center; padding-top: 20px; }
    .signature-block { width: 45%; display: inline-block; margin: 20px 2.5%; vertical-align: top; }
  </style>
</head>
<body>
  <div class="document-header">
    <h1 class="document-title">ÉTAT DES LIEUX {{inventoryType}}</h1>
    <p>Date : {{documentDate}}</p>
  </div>
  
  <div class="parties">
    <p><strong>Bailleur :</strong> {{landlordName}}</p>
    <p><strong>Locataire :</strong> {{tenantName}}</p>
    <p><strong>Bien :</strong> {{propertyAddress}}</p>
  </div>
  
  <div class="inventory-details">
    <h2>DESCRIPTION DE L''ÉTAT DU LOGEMENT :</h2>
    <div class="rooms-description">{{roomsDetails}}</div>
  </div>
  
  <div style="margin-top: 50px;">
    <div class="signature-block">
      <p><strong>Le Bailleur</strong></p>
      <div class="signature-area"></div>
    </div>
    <div class="signature-block">
      <p><strong>Le Locataire</strong></p>
      <div class="signature-area"></div>
    </div>
  </div>
</body>
</html>',
  '[
    {"id": "landlordName", "name": "landlordName", "label": "Nom du bailleur", "type": "text", "required": true},
    {"id": "tenantName", "name": "tenantName", "label": "Nom du locataire", "type": "text", "required": true},
    {"id": "propertyAddress", "name": "propertyAddress", "label": "Adresse du bien", "type": "textarea", "required": true},
    {"id": "inventoryType", "name": "inventoryType", "label": "Type d''état des lieux", "type": "select", "required": true, "options": ["Entrée", "Sortie"]},
    {"id": "roomsDetails", "name": "roomsDetails", "label": "Détail des pièces", "type": "textarea", "required": true, "placeholder": "Décrire l''état de chaque pièce..."},
    {"id": "documentDate", "name": "documentDate", "label": "Date du document", "type": "date", "required": true, "defaultValue": "{{today}}"}
  ]'::jsonb,
  true,
  true,
  ARRAY['Loi du 6 juillet 1989', 'Décret n°2016-382']
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  NULL,
  'Quittance de loyer mensuelle',
  'receipt',
  'financial',
  'Quittance mensuelle de loyer',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Quittance de loyer</title>
  <style>
    body { font-family: Times, serif; font-size: 12pt; line-height: 1.4; margin: 2cm; }
    .document-header { text-align: center; margin-bottom: 20px; }
    .document-title { font-size: 18pt; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; }
    .document-period { font-size: 14pt; margin-bottom: 20px; text-align: center; }
    .landlord-info { margin: 20px 0; }
    .receipt-content { margin: 30px 0; }
    .financial-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .financial-table td, .financial-table th { border: 1px solid #000; padding: 10px; text-align: left; }
    .financial-table tr.total { font-weight: bold; background-color: #f0f0f0; }
    .signature-area { margin-top: 50px; text-align: right; }
    .signature-block { width: 45%; display: inline-block; margin-left: auto; text-align: center; }
    .signature-line { border-top: 1px solid #000; margin-top: 50px; width: 100%; }
  </style>
</head>
<body>
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
    <p>Cette quittance annule tous les reçus qui auraient pu être établis précédemment.</p>
  </div>
  
  <div class="signature-area">
    <p>Fait le {{documentDate}}</p>
    <div class="signature-block">
      <p>Signature du bailleur</p>
      <div class="signature-line"></div>
      <p>{{landlordName}}</p>
    </div>
  </div>
</body>
</html>',
  '[
    {"id": "landlordName", "name": "landlordName", "label": "Nom du bailleur", "type": "text", "required": true},
    {"id": "landlordAddress", "name": "landlordAddress", "label": "Adresse du bailleur", "type": "textarea", "required": true},
    {"id": "tenantName", "name": "tenantName", "label": "Nom du locataire", "type": "text", "required": true},
    {"id": "propertyAddress", "name": "propertyAddress", "label": "Adresse du bien", "type": "textarea", "required": true},
    {"id": "rent", "name": "rent", "label": "Loyer mensuel (€)", "type": "number", "required": true, "validation": {"min": 0}},
    {"id": "charges", "name": "charges", "label": "Charges mensuelles (€)", "type": "number", "required": false, "validation": {"min": 0}},
    {"id": "period", "name": "period", "label": "Période", "type": "text", "required": true, "placeholder": "Janvier 2024"},
    {"id": "paymentDate", "name": "paymentDate", "label": "Date de paiement", "type": "date", "required": true},
    {"id": "documentDate", "name": "documentDate", "label": "Date du document", "type": "date", "required": true, "defaultValue": "{{today}}"}
  ]'::jsonb,
  false,
  true,
  ARRAY['Article 21 de la loi du 6 juillet 1989']
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  NULL,
  'Préavis de départ',
  'notice',
  'rental_end',
  'Lettre de préavis du locataire',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Préavis de départ</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.4; margin: 2cm; }
    .letter-header { margin-bottom: 30px; }
    .sender { margin-bottom: 20px; }
    .recipient { text-align: right; margin-bottom: 30px; }
    .letter-content { margin: 30px 0; }
    .signature { margin-top: 50px; text-align: right; }
    .signature-area { border: 1px solid #000; height: 60px; margin: 12px 0; text-align: center; padding-top: 20px; }
  </style>
</head>
<body>
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
    
    <p>J''ai l''honneur de vous informer que je souhaite résilier le bail du logement que j''occupe situé :</p>
    <p><strong>{{propertyAddress}}</strong></p>
    
    <p>Conformément aux dispositions de l''article 15 de la loi du 6 juillet 1989, je vous donne par la présente mon préavis de départ.</p>
    
    <p>La date de remise de ce préavis étant le {{noticeDate}}, je quitterai définitivement les lieux le {{departureDate}}.</p>
    
    <p>Je vous prie d''agréer, Madame, Monsieur, l''expression de mes salutations distinguées.</p>
    
    <div class="signature">
      <p>Fait le {{documentDate}}</p>
      <div class="signature-block">
        <p>{{tenantName}}</p>
        <div class="signature-area"></div>
      </div>
    </div>
  </div>
</body>
</html>',
  '[
    {"id": "tenantName", "name": "tenantName", "label": "Nom du locataire", "type": "text", "required": true},
    {"id": "tenantAddress", "name": "tenantAddress", "label": "Adresse du locataire", "type": "textarea", "required": true},
    {"id": "landlordName", "name": "landlordName", "label": "Nom du bailleur", "type": "text", "required": true},
    {"id": "landlordAddress", "name": "landlordAddress", "label": "Adresse du bailleur", "type": "textarea", "required": true},
    {"id": "propertyAddress", "name": "propertyAddress", "label": "Adresse du bien", "type": "textarea", "required": true},
    {"id": "noticeDate", "name": "noticeDate", "label": "Date de remise du préavis", "type": "date", "required": true},
    {"id": "departureDate", "name": "departureDate", "label": "Date de départ souhaitée", "type": "date", "required": true},
    {"id": "documentDate", "name": "documentDate", "label": "Date du document", "type": "date", "required": true, "defaultValue": "{{today}}"}
  ]'::jsonb,
  false,
  true,
  ARRAY['Article 15 de la loi du 6 juillet 1989']
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  NULL,
  'Attestation d''assurance habitation',
  'insurance',
  'administrative',
  'Demande d''attestation d''assurance habitation',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Demande attestation assurance</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.4; margin: 2cm; }
    .letter-header { margin-bottom: 30px; }
    .sender { margin-bottom: 20px; }
    .recipient { text-align: right; margin-bottom: 30px; }
    .letter-content { margin: 30px 0; }
    .important { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
    .signature { margin-top: 50px; text-align: right; }
  </style>
</head>
<body>
  <div class="letter-header">
    <div class="sender">
      {{landlordName}}<br>
      {{landlordAddress}}
    </div>
    <div class="recipient">
      {{tenantName}}<br>
      {{tenantAddress}}
    </div>
  </div>
  
  <div class="letter-content">
    <p><strong>Objet : Demande d''attestation d''assurance habitation</strong></p>
    
    <p>Madame, Monsieur,</p>
    
    <p>Je me permets de vous rappeler que conformément à l''article 7 de la loi du 6 juillet 1989, tout locataire est tenu de s''assurer contre les risques locatifs et de justifier de cette assurance lors de la remise des clés puis chaque année à la date d''anniversaire du contrat.</p>
    
    <div class="important">
      <p><strong>Rappel important :</strong></p>
      <p>Votre attestation d''assurance habitation arrive à échéance le {{expirationDate}}. Merci de nous faire parvenir votre nouvelle attestation avant cette date.</p>
    </div>
    
    <p>Vous pouvez nous transmettre ce document :</p>
    <ul>
      <li>Par email à l''adresse : {{landlordEmail}}</li>
      <li>Par courrier à l''adresse ci-dessus</li>
      <li>En main propre lors de votre prochaine visite</li>
    </ul>
    
    <p>Je vous remercie par avance pour votre diligence.</p>
    
    <p>Cordialement,</p>
    
    <div class="signature">
      <p>{{landlordName}}</p>
      <p>Propriétaire</p>
    </div>
  </div>
</body>
</html>',
  '[
    {"id": "landlordName", "name": "landlordName", "label": "Nom du bailleur", "type": "text", "required": true},
    {"id": "landlordAddress", "name": "landlordAddress", "label": "Adresse du bailleur", "type": "textarea", "required": true},
    {"id": "landlordEmail", "name": "landlordEmail", "label": "Email du bailleur", "type": "email", "required": true},
    {"id": "tenantName", "name": "tenantName", "label": "Nom du locataire", "type": "text", "required": true},
    {"id": "tenantAddress", "name": "tenantAddress", "label": "Adresse du locataire", "type": "textarea", "required": true},
    {"id": "propertyAddress", "name": "propertyAddress", "label": "Adresse du bien", "type": "textarea", "required": true},
    {"id": "expirationDate", "name": "expirationDate", "label": "Date d''expiration de l''assurance", "type": "date", "required": true},
    {"id": "documentDate", "name": "documentDate", "label": "Date du document", "type": "date", "required": true, "defaultValue": "{{today}}"}
  ]'::jsonb,
  false,
  true,
  ARRAY['Article 7 de la loi du 6 juillet 1989']
);
