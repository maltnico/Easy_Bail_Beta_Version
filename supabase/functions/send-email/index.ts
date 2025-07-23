// Supabase Edge Function pour l'envoi d'emails
import { createTransport } from "npm:nodemailer@6.9.9";
import { SMTPTransport } from "npm:nodemailer@6.9.9/lib/smtp-transport";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Gérer les requêtes OPTIONS (CORS preflight)
  if (req.method === "OPTIONS") {
    console.log("Requête OPTIONS reçue (CORS preflight)");
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Vérifier que la méthode est POST
  if (req.method !== "POST") {
    console.log(`Méthode non autorisée: ${req.method}`);
    return new Response(
      JSON.stringify({ error: "Méthode non autorisée" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Récupérer et valider les données de la requête
    const requestData = await req.json();
    console.log("Requête reçue:", JSON.stringify(requestData, null, 2).substring(0, 500) + "...");
    
    // Vérifier que la configuration est présente
    if (!requestData.config) {
      console.log("Configuration du serveur mail manquante");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Configuration du serveur mail manquante"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { config } = requestData;

    // Vérifier que les champs de configuration essentiels sont présents
    if (!config.host || !config.port || !config.username || !config.password) {
      console.log("Configuration incomplète:", {
        hostMissing: !config.host,
        portMissing: !config.port,
        usernameMissing: !config.username,
        passwordMissing: !config.password
      });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Configuration incomplète - host, port, username et password sont requis",
          missingFields: {
            host: !config.host,
            port: !config.port,
            username: !config.username,
            password: !config.password
          }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Configuration SMTP: ${config.host}:${config.port}, secure: ${config.secure}, user: ${config.username}`);
    
    // Configurer le transporteur SMTP
    const transporter = createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure || false,
      auth: {
        user: config.username,
        pass: config.password,
      },
      tls: {
        // Nécessaire pour certains serveurs SMTP
        rejectUnauthorized: false,
      },
    } as SMTPTransport.Options);

    // Si c'est une demande de vérification de connexion
    if (requestData.action === 'verify') {
      console.log("Vérification de la connexion SMTP");
      try {
        // Vérifier la connexion SMTP
        const verified = await transporter.verify();
        
        if (verified) {
          console.log("Connexion au serveur SMTP réussie");
          return new Response(
            JSON.stringify({ 
              success: true,
              message: "Connexion au serveur SMTP réussie"
            }),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        } else {
          console.log("Échec de la vérification de la connexion SMTP");
          return new Response(
            JSON.stringify({ 
              success: false,
              error: "Échec de la vérification de la connexion SMTP"
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      } catch (verifyError) {
        console.error("Erreur lors de la vérification SMTP:", 
          verifyError instanceof Error ? verifyError.message : "Erreur inconnue");
        return new Response(
          JSON.stringify({ 
            success: false,
            error: "Erreur de connexion au serveur SMTP",
            details: verifyError instanceof Error ? verifyError.message : "Erreur inconnue"
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Pour l'envoi d'emails, vérifier les champs supplémentaires
    const { emailOptions } = requestData;
    
    if (!emailOptions || !emailOptions.to || !emailOptions.subject || (!emailOptions.text && !emailOptions.html)) {
      console.log("Données d'email incomplètes:", {
        toMissing: !emailOptions?.to,
        subjectMissing: !emailOptions?.subject,
        contentMissing: !emailOptions?.text && !emailOptions?.html
      });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Données d'email incomplètes - destinataire, sujet et contenu sont requis",
          missingFields: {
            to: !emailOptions?.to,
            subject: !emailOptions?.subject,
            content: !emailOptions?.text && !emailOptions?.html
          }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Préparation de l'envoi d'email à ${typeof emailOptions.to === 'string' ? emailOptions.to : emailOptions.to.join(', ')}`);
    console.log(`Sujet: ${emailOptions.subject.substring(0, 50)}${emailOptions.subject.length > 50 ? '...' : ''}`);
    
    // Préparer les options d'email
    const mailOptions = {
      from: config.from || config.username,
      to: emailOptions.to,
      cc: emailOptions.cc,
      bcc: emailOptions.bcc,
      subject: emailOptions.subject,
      text: emailOptions.text,
      html: emailOptions.html,
      replyTo: config.replyTo || config.from || config.username,
      attachments: emailOptions.attachments || [],
    };

    // Envoyer l'email
    console.log("Envoi de l'email en cours...");
    
    // Vérifier si des pièces jointes sont présentes
    if (emailOptions.attachments && emailOptions.attachments.length > 0) {
      console.log(`Envoi avec ${emailOptions.attachments.length} pièce(s) jointe(s)`);
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log("Email envoyé avec succès:", info.messageId);

    // Retourner le résultat
    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: info.messageId,
        response: info.response
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    // Gérer les erreurs
    console.error("Erreur lors du traitement de la requête:", 
      error instanceof Error ? error.message : "Erreur inconnue");
    
    if (error instanceof Error) {
      console.error("Stack:", error.stack);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue lors du traitement de la requête",
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
