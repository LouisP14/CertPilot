import nodemailer from "nodemailer";

// Configuration du transporteur SMTP
// OVH Zimbra: utiliser port 465 avec secure=true, ou port 587 avec secure=false
const smtpPort = parseInt(process.env.SMTP_PORT || "465");
const smtpSecure =
  process.env.SMTP_SECURE === "false" ? false : smtpPort === 465;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "ssl0.ovh.net",
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  connectionTimeout: 10000, // 10 secondes pour la connexion
  greetingTimeout: 10000,
  socketTimeout: 30000, // 30 secondes pour les opérations
  tls: {
    rejectUnauthorized: false, // Accepter les certificats auto-signés
  },
});

// Vérifier la connexion SMTP au démarrage (optionnel)
transporter
  .verify()
  .then(() => {
    console.log("✅ SMTP connecté:", process.env.SMTP_HOST, "port", smtpPort);
  })
  .catch((err) => {
    console.error("❌ SMTP erreur:", err.message);
  });

// Email 1 : Confirmation de demande de contact
export async function sendContactConfirmation(params: {
  to: string;
  contactName: string;
  companyName: string;
  plan: string;
}) {
  const { to, contactName, companyName, plan } = params;

  const planNames: Record<string, string> = {
    starter: "Starter (199€/mois)",
    business: "Business (349€/mois)",
    enterprise: "Enterprise (599€/mois)",
    corporate: "Corporate (1199€/mois)",
  };

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "CertPilot"}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: "Demande reçue - CertPilot",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .info-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Demande bien reçue !</h1>
          </div>
          <div class="content">
            <p>Bonjour ${contactName},</p>
            
            <p>Nous avons bien reçu votre demande de démonstration pour <strong>${companyName}</strong>.</p>
            
            <div class="info-box">
              <strong>📦 Offre sélectionnée :</strong> ${planNames[plan] || plan}
            </div>
            
            <p>Notre équipe commerciale va étudier votre demande et vous recontactera dans les <strong>24 heures</strong> pour :</p>
            
            <ul>
              <li>✅ Répondre à vos questions</li>
              <li>📊 Planifier une démonstration personnalisée</li>
              <li>🔗 Vous envoyer votre lien de paiement sécurisé</li>
            </ul>
            
            <p>En attendant, n'hésitez pas à consulter notre site pour en savoir plus sur CertPilot.</p>
            
            <a href="https://www.certpilot.eu" class="button">Découvrir CertPilot</a>
            
            <p style="margin-top: 30px;">À très bientôt,<br><strong>L'équipe CertPilot</strong></p>
          </div>
          <div class="footer">
            <p>CertPilot - Gestion des habilitations et formations réglementaires</p>
            <p>Ce mail a été envoyé à ${to}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Bonjour ${contactName},

Nous avons bien reçu votre demande de démonstration pour ${companyName}.

Offre sélectionnée : ${planNames[plan] || plan}

Notre équipe commerciale va étudier votre demande et vous recontactera dans les 24 heures.

À très bientôt,
L'équipe CertPilot
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Email 2 : Envoi du lien de paiement Stripe
export async function sendPaymentLink(params: {
  to: string;
  contactName: string;
  companyName: string;
  plan: string;
  paymentUrl: string;
}) {
  const { to, contactName, companyName, plan, paymentUrl } = params;

  const planNames: Record<string, string> = {
    starter: "Starter - 199€/mois",
    business: "Business - 349€/mois",
    enterprise: "Enterprise - 599€/mois",
    corporate: "Corporate - 1199€/mois",
  };

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "CertPilot"}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: `Votre lien de paiement CertPilot - ${companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 16px; }
          .info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
          .price-box { background: #f0fdf4; border: 2px solid #10b981; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
          .price { font-size: 32px; font-weight: bold; color: #10b981; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Votre lien de paiement</h1>
          </div>
          <div class="content">
            <p>Bonjour ${contactName},</p>
            
            <p>Suite à notre échange, voici votre lien de paiement sécurisé pour <strong>${companyName}</strong>.</p>
            
            <div class="price-box">
              <div style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">Offre sélectionnée</div>
              <div style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 10px;">${planNames[plan]}</div>
              <div class="price">${plan === "starter" ? "199" : plan === "business" ? "349" : plan === "enterprise" ? "599" : "1199"}€<span style="font-size: 16px;">/mois</span></div>
            </div>
            
            <div style="text-align: center;">
              <a href="${paymentUrl}" class="button">🔒 Procéder au paiement</a>
            </div>
            
            <div class="info-box">
              <strong>ℹ️ Informations importantes :</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Paiement 100% sécurisé via Stripe</li>
                <li>Facturation mensuelle</li>
                <li>Résiliation possible à tout moment</li>
                <li>Vos identifiants vous seront envoyés automatiquement après paiement</li>
              </ul>
            </div>
            
            <p>Une fois le paiement effectué, votre compte sera <strong>activé instantanément</strong> et vous recevrez vos identifiants de connexion par email.</p>
            
            <p>Des questions ? N'hésitez pas à nous contacter !</p>
            
            <p style="margin-top: 30px;">Cordialement,<br><strong>L'équipe CertPilot</strong></p>
          </div>
          <div class="footer">
            <p>CertPilot - Gestion des habilitations et formations réglementaires</p>
            <p>Ce mail a été envoyé à ${to}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Bonjour ${contactName},

Suite à notre échange, voici votre lien de paiement sécurisé pour ${companyName}.

Offre : ${planNames[plan]}

Lien de paiement : ${paymentUrl}

Une fois le paiement effectué, votre compte sera activé instantanément et vous recevrez vos identifiants de connexion par email.

Cordialement,
L'équipe CertPilot
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Email 3 : Bienvenue + Identifiants après paiement
export async function sendWelcomeEmail(params: {
  to: string;
  contactName: string;
  companyName: string;
  plan: string;
  tempPassword: string;
}) {
  const { to, contactName, companyName, plan, tempPassword } = params;

  const planNames: Record<string, string> = {
    starter: "Starter",
    business: "Business",
    enterprise: "Enterprise",
    corporate: "Corporate",
  };

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || "CertPilot"}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: `🎉 Bienvenue sur CertPilot - Vos identifiants`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; font-size: 16px; }
          .credentials-box { background: #f0fdf4; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .credential-item { margin: 15px 0; padding: 10px; background: white; border-radius: 4px; }
          .credential-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
          .credential-value { font-size: 16px; font-weight: bold; color: #1f2937; margin-top: 5px; font-family: monospace; }
          .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .steps { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎉 Bienvenue sur CertPilot !</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Votre compte est activé</p>
          </div>
          <div class="content">
            <p>Bonjour ${contactName},</p>
            
            <p>Félicitations ! Votre abonnement <strong>${planNames[plan]}</strong> est maintenant actif pour <strong>${companyName}</strong>.</p>
            
            <div class="credentials-box">
              <h3 style="margin-top: 0; color: #10b981;">🔐 Vos identifiants de connexion</h3>
              
              <div class="credential-item">
                <div class="credential-label">Email</div>
                <div class="credential-value">${to}</div>
              </div>
              
              <div class="credential-item">
                <div class="credential-label">Mot de passe temporaire</div>
                <div class="credential-value">${tempPassword}</div>
              </div>
            </div>
            
            <div class="warning-box">
              <strong>⚠️ Important :</strong> Vous devrez changer ce mot de passe lors de votre première connexion pour des raisons de sécurité.
            </div>
            
            <div class="steps">
              <h3 style="margin-top: 0;">📋 Premiers pas</h3>
              <ol style="margin: 0; padding-left: 20px;">
                <li style="margin: 10px 0;"><strong>Connectez-vous</strong> avec vos identifiants ci-dessus</li>
                <li style="margin: 10px 0;"><strong>Changez votre mot de passe</strong> (obligatoire à la première connexion)</li>
                <li style="margin: 10px 0;"><strong>Configurez votre entreprise</strong> et ajoutez vos collaborateurs</li>
                <li style="margin: 10px 0;"><strong>Commencez à gérer</strong> vos formations et habilitations !</li>
              </ol>
            </div>
            
            <div style="text-align: center;">
              <a href="https://www.certpilot.eu/login" class="button">🚀 Se connecter maintenant</a>
            </div>
            
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              Besoin d'aide ? Notre équipe est à votre disposition pour vous accompagner dans la prise en main de CertPilot.
            </p>
            
            <p style="margin-top: 30px;">Excellente gestion avec CertPilot ! 🎓<br><strong>L'équipe CertPilot</strong></p>
          </div>
          <div class="footer">
            <p>CertPilot - Gestion des habilitations et formations réglementaires</p>
            <p><a href="https://www.certpilot.eu" style="color: #3b82f6; text-decoration: none;">www.certpilot.eu</a></p>
            <p>Ce mail a été envoyé à ${to}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Bienvenue sur CertPilot !

Bonjour ${contactName},

Félicitations ! Votre abonnement ${planNames[plan]} est maintenant actif pour ${companyName}.

VOS IDENTIFIANTS DE CONNEXION
================================
Email : ${to}
Mot de passe temporaire : ${tempPassword}

⚠️ IMPORTANT : Vous devrez changer ce mot de passe lors de votre première connexion.

PREMIERS PAS
============
1. Connectez-vous avec vos identifiants ci-dessus
2. Changez votre mot de passe (obligatoire)
3. Configurez votre entreprise et ajoutez vos collaborateurs
4. Commencez à gérer vos formations et habilitations !

Lien de connexion : https://www.certpilot.eu/login

Besoin d'aide ? Notre équipe est à votre disposition.

Excellente gestion avec CertPilot !
L'équipe CertPilot
www.certpilot.eu
    `,
  };

  await transporter.sendMail(mailOptions);
}
