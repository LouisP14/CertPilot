import QRCode from "qrcode";
import { Resend } from "resend";

// Client Resend - créé seulement si la clé API est présente
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Adresse d'envoi depuis le domaine vérifié certpilot.eu
const FROM_EMAIL = process.env.EMAIL_FROM || "CertPilot <contact@certpilot.eu>";

function getAppBaseUrl() {
  const base =
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://www.certpilot.eu";
  return base.replace(/\/$/, "");
}

// Helper pour vérifier si l'envoi d'emails est disponible
export function isEmailEnabled() {
  return resend !== null;
}

// Helper pour envoyer un email de manière sécurisée
async function sendEmail(
  params: Parameters<typeof Resend.prototype.emails.send>[0],
) {
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY non configuré - email non envoyé:",
      params.to,
    );
    return { data: null, error: { message: "Email non configuré" } };
  }
  const result = await resend.emails.send(params);
  if (result.error) {
    console.error(
      `[email] Échec envoi à ${params.to} (sujet: ${params.subject}):`,
      result.error,
    );
  } else {
    console.log(
      `[email] Email envoyé à ${params.to} (sujet: ${params.subject}) - ID: ${result.data?.id}`,
    );
  }
  return result;
}

// Email : Vérification d'email lors de l'inscription
export async function sendVerificationEmail(params: {
  to: string;
  name: string;
  token: string;
}) {
  const { to, name, token } = params;
  const link = `${getAppBaseUrl()}/verify-email?token=${token}`;

  await sendEmail({
    from: FROM_EMAIL,
    to,
    subject: "Confirmez votre email - CertPilot",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #173B56 0%, #1e4a6b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">CertPilot</h1>
        </div>
        <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px; color: #333;">Bonjour ${name},</p>
          <p style="color: #555;">Merci de vous être inscrit sur CertPilot. Pour activer votre compte et démarrer votre essai gratuit de 14 jours, confirmez votre adresse email :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="display: inline-block; background: #059669; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px;">Confirmer mon email</a>
          </div>
          <p style="color: #888; font-size: 13px;">Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.</p>
        </div>
        <div style="background: #f9fafb; padding: 15px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="color: #888; font-size: 12px; margin: 0;">CertPilot - Gestion des formations et habilitations</p>
        </div>
      </div>
    `,
    text: `Bonjour ${name},\n\nConfirmez votre email pour activer votre compte CertPilot :\n${link}\n\nCe lien expire dans 24 heures.\n\nL'équipe CertPilot`,
  });
}

// Emails onboarding trial
const ONBOARDING_EMAILS: Record<
  number,
  { subject: string; getHtml: (name: string, appUrl: string) => string }
> = {
  1: {
    subject: "Bienvenue sur CertPilot - Par où commencer ?",
    getHtml: (name, appUrl) => `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#173B56,#1e4a6b);padding:30px;text-align:center;border-radius:10px 10px 0 0;">
          <h1 style="color:white;margin:0;">CertPilot</h1>
        </div>
        <div style="padding:30px;border:1px solid #e5e7eb;border-top:none;">
          <p>Bonjour ${name},</p>
          <p>Bienvenue sur CertPilot ! Voici <strong>3 étapes</strong> pour être opérationnel en 15 minutes :</p>
          <ol style="line-height:2;">
            <li><strong>Importez vos employés</strong> — via Excel ou manuellement</li>
            <li><strong>Ajoutez leurs habilitations</strong> — CACES, SST, électriques...</li>
            <li><strong>Configurez vos alertes</strong> — 30, 60 ou 90 jours avant expiration</li>
          </ol>
          <div style="text-align:center;margin:25px 0;">
            <a href="${appUrl}/dashboard" style="background:#059669;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Accéder à mon tableau de bord</a>
          </div>
          <p style="color:#888;font-size:13px;">Besoin d'aide ? Répondez simplement à cet email.</p>
        </div>
      </div>`,
  },
  2: {
    subject: "Astuce CertPilot : importez vos données en 2 clics",
    getHtml: (name, appUrl) => `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#173B56,#1e4a6b);padding:30px;text-align:center;border-radius:10px 10px 0 0;">
          <h1 style="color:white;margin:0;">CertPilot</h1>
        </div>
        <div style="padding:30px;border:1px solid #e5e7eb;border-top:none;">
          <p>Bonjour ${name},</p>
          <p>Saviez-vous que vous pouvez <strong>importer tous vos employés et habilitations</strong> depuis un fichier Excel ?</p>
          <p>Fini la saisie manuelle. En quelques clics :</p>
          <ul style="line-height:2;">
            <li>Téléchargez le modèle Excel depuis l'onglet Import/Export</li>
            <li>Remplissez-le avec vos données</li>
            <li>Importez — CertPilot fait le reste</li>
          </ul>
          <div style="text-align:center;margin:25px 0;">
            <a href="${appUrl}/dashboard/export" style="background:#059669;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Importer mes données</a>
          </div>
        </div>
      </div>`,
  },
  3: {
    subject: "Vos habilitations expirent-elles bientôt ?",
    getHtml: (name, appUrl) => `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#173B56,#1e4a6b);padding:30px;text-align:center;border-radius:10px 10px 0 0;">
          <h1 style="color:white;margin:0;">CertPilot</h1>
        </div>
        <div style="padding:30px;border:1px solid #e5e7eb;border-top:none;">
          <p>Bonjour ${name},</p>
          <p>CertPilot surveille automatiquement les dates d'expiration de vos habilitations et vous alerte avant qu'il ne soit trop tard.</p>
          <p><strong>Ce que nos clients évitent grâce aux alertes :</strong></p>
          <ul style="line-height:2;">
            <li>Arrêts de chantier pour CACES expirés</li>
            <li>Sanctions lors des audits DREAL</li>
            <li>Non-conformité aux obligations SST</li>
          </ul>
          <p>Vérifiez dès maintenant l'état de vos habilitations :</p>
          <div style="text-align:center;margin:25px 0;">
            <a href="${appUrl}/dashboard" style="background:#059669;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Voir mon tableau de bord</a>
          </div>
        </div>
      </div>`,
  },
  4: {
    subject: "Plus que 2 jours d'essai - Passez au plan payant",
    getHtml: (name, appUrl) => `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#173B56,#1e4a6b);padding:30px;text-align:center;border-radius:10px 10px 0 0;">
          <h1 style="color:white;margin:0;">CertPilot</h1>
        </div>
        <div style="padding:30px;border:1px solid #e5e7eb;border-top:none;">
          <p>Bonjour ${name},</p>
          <p>Votre essai gratuit CertPilot touche à sa fin. Pour continuer à bénéficier de :</p>
          <ul style="line-height:2;">
            <li>Alertes automatiques d'expiration</li>
            <li>Passeport formation PDF avec QR code</li>
            <li>Convocations automatiques</li>
            <li>Signature électronique</li>
          </ul>
          <p><strong>Choisissez votre plan dès maintenant</strong> — à partir de 49€/mois :</p>
          <div style="text-align:center;margin:25px 0;">
            <a href="${appUrl}/trial-expired" style="background:#059669;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Choisir mon plan</a>
          </div>
          <p style="color:#888;font-size:13px;">Des questions ? Répondez simplement à cet email, nous sommes là pour vous aider.</p>
        </div>
      </div>`,
  },
};

export async function sendOnboardingEmail(params: {
  to: string;
  name: string;
  step: number;
}) {
  const { to, name, step } = params;
  const template = ONBOARDING_EMAILS[step];
  if (!template) return;

  const appUrl = getAppBaseUrl();

  await sendEmail({
    from: FROM_EMAIL,
    to,
    subject: template.subject,
    html: template.getHtml(name, appUrl),
  });
}

// Email 1 : Confirmation de demande de contact
export async function sendContactConfirmation(params: {
  to: string;
  contactName: string;
  companyName: string;
  plan: string;
}) {
  const { to, contactName, companyName, plan } = params;

  const planNames: Record<string, string> = {
    starter: "Starter (49€/mois)",
    pro: "Pro (149€/mois)",
    business: "Business (349€/mois)",
    enterprise: "Enterprise (sur devis)",
  };

  await sendEmail({
    from: FROM_EMAIL,
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
  });
}

// Email 1b : Notification admin - Nouvelle demande de contact
export async function sendNewContactNotification(params: {
  contactName: string;
  companyName: string;
  email: string;
  phone?: string | null;
  employeeCount?: string | null;
  plan?: string | null;
  message?: string | null;
}) {
  const {
    contactName,
    companyName,
    email,
    phone,
    employeeCount,
    plan,
    message,
  } = params;
  const adminEmail =
    process.env.ADMIN_NOTIFICATION_EMAIL || "contact@certpilot.eu";

  const planNames: Record<string, string> = {
    starter: "Starter (1-20 employés) - 49€/mois",
    pro: "Pro (21-100 employés) - 149€/mois",
    business: "Business (101-300 employés) - 349€/mois",
    enterprise: "Enterprise (300+ employés) - sur devis",
  };

  const baseUrl = getAppBaseUrl();

  await sendEmail({
    from: FROM_EMAIL,
    to: adminEmail,
    subject: `🔔 Nouvelle demande de devis - ${companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #173B56 0%, #1e4d6e 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .info-table td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
          .info-table td:first-child { font-weight: bold; color: #6b7280; width: 140px; }
          .highlight { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Nouvelle demande de devis</h1>
          </div>
          <div class="content">
            <div class="highlight">
              <strong>⚡ Action requise :</strong> Un prospect souhaite une démonstration de CertPilot.
            </div>
            
            <table class="info-table">
              <tr><td>👤 Contact</td><td><strong>${contactName}</strong></td></tr>
              <tr><td>🏢 Entreprise</td><td><strong>${companyName}</strong></td></tr>
              <tr><td>📧 Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
              ${phone ? `<tr><td>📞 Téléphone</td><td><a href="tel:${phone}">${phone}</a></td></tr>` : ""}
              ${employeeCount ? `<tr><td>👥 Effectif</td><td>${employeeCount} employés</td></tr>` : ""}
              ${plan ? `<tr><td>📦 Offre</td><td><strong>${planNames[plan] || plan}</strong></td></tr>` : ""}
            </table>
            
            ${message ? `<p><strong>💬 Message :</strong></p><p style="background: #f9fafb; padding: 15px; border-radius: 6px; font-style: italic;">${message}</p>` : ""}
            
            <a href="${baseUrl}/dashboard/admin" class="button">Voir dans le tableau de bord</a>
            
            <p style="color: #6b7280; font-size: 13px;">Un email de confirmation a été automatiquement envoyé au prospect.</p>
          </div>
          <div class="footer">
            <p>CertPilot - Notification automatique</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Nouvelle demande de devis CertPilot

Contact : ${contactName}
Entreprise : ${companyName}
Email : ${email}
${phone ? `Téléphone : ${phone}` : ""}
${employeeCount ? `Effectif : ${employeeCount} employés` : ""}
${plan ? `Offre : ${planNames[plan] || plan}` : ""}
${message ? `Message : ${message}` : ""}

Voir dans le tableau de bord : ${baseUrl}/dashboard/admin
    `,
  });
}

// Email 2 : Envoi du lien de paiement Stripe
export async function sendPaymentLink(params: {
  to: string;
  contactName: string;
  companyName: string;
  plan: string;
  billing?: "monthly" | "annual";
  paymentUrl: string;
}) {
  const {
    to,
    contactName,
    companyName,
    plan,
    billing = "monthly",
    paymentUrl,
  } = params;
  const isAnnual = billing === "annual";

  const monthlyPrices: Record<string, number> = {
    starter: 49,
    pro: 149,
    business: 349,
  };
  const annualPrices: Record<string, number> = {
    starter: 490,
    pro: 1490,
    business: 3490,
  };
  const planLabels: Record<string, string> = {
    starter: "Starter",
    pro: "Pro",
    business: "Business",
  };

  const price = isAnnual ? annualPrices[plan] : monthlyPrices[plan];
  const priceLabel = isAnnual
    ? `${price}€/an <span style="font-size:13px;color:#6b7280;">(${Math.round(price / 12)}€/mois facturés annuellement)</span>`
    : `${price}€<span style="font-size:16px;">/mois</span>`;
  const billingLabel = isAnnual
    ? "Facturation annuelle (économisez 17%)"
    : "Facturation mensuelle";
  const planDisplayName = `${planLabels[plan] ?? plan} - ${isAnnual ? `${price}€/an` : `${price}€/mois`}`;

  await sendEmail({
    from: FROM_EMAIL,
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
              <div style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 10px;">${planDisplayName}</div>
              <div class="price">${priceLabel}</div>
            </div>
            <div style="text-align: center;">
              <a href="${paymentUrl}" class="button">🔒 Procéder au paiement</a>
            </div>
            <div class="info-box">
              <strong>ℹ️ Informations importantes :</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Paiement 100% sécurisé via Stripe</li>
                <li>${billingLabel}</li>
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

Offre : ${planDisplayName}

Lien de paiement : ${paymentUrl}

Une fois le paiement effectué, votre compte sera activé instantanément et vous recevrez vos identifiants de connexion par email.

Cordialement,
L'équipe CertPilot
    `,
  });
}

// Email : Lien de signature pour l'employé
export async function sendEmployeeSignatureLink(params: {
  to: string;
  employeeName: string;
  token: string;
  expiresAt: Date;
}) {
  const { to, employeeName, token, expiresAt } = params;
  const link = `${getAppBaseUrl()}/sign/employee/${token}`;

  await sendEmail({
    from: FROM_EMAIL,
    to,
    subject: "Signature requise - Passeport Formation",
    html: `
      <p>Bonjour ${employeeName},</p>
      <p>Votre passeport formation est prêt à être signé.</p>
      <p>
        <a href="${link}">Cliquez ici pour signer électroniquement</a>
      </p>
      <p>Ce lien expire le ${expiresAt.toLocaleDateString("fr-FR")}.</p>
      <p>Cordialement,<br><strong>L'équipe CertPilot</strong></p>
    `,
    text: `Bonjour ${employeeName},

Votre passeport formation est prêt à être signé.
Lien : ${link}
Ce lien expire le ${expiresAt.toLocaleDateString("fr-FR")}.

Cordialement,
L'équipe CertPilot`,
  });
}

// Email : Lien de contre-signature pour le responsable
export async function sendManagerSignatureLink(params: {
  to: string;
  managerName?: string | null;
  employeeName: string;
  token: string;
  expiresAt: Date;
}) {
  const { to, managerName, employeeName, token, expiresAt } = params;
  const link = `${getAppBaseUrl()}/sign/manager/${token}`;

  await sendEmail({
    from: FROM_EMAIL,
    to,
    subject: `Contre-signature requise - Passeport ${employeeName}`,
    html: `
      <p>Bonjour${managerName ? ` ${managerName}` : ""},</p>
      <p>${employeeName} a signé son passeport formation.</p>
      <p>
        <a href="${link}">Cliquez ici pour contre-signer</a>
      </p>
      <p>Ce lien expire le ${expiresAt.toLocaleDateString("fr-FR")}.</p>
      <p>Cordialement,<br><strong>L'équipe CertPilot</strong></p>
    `,
    text: `Bonjour${managerName ? ` ${managerName}` : ""},

${employeeName} a signé son passeport formation.
Lien : ${link}
Ce lien expire le ${expiresAt.toLocaleDateString("fr-FR")}.

Cordialement,
L'équipe CertPilot`,
  });
}

// Email : Alertes habilitations (utilisé par le cron)
type AlertEmailItem = {
  employeeName: string;
  formationName: string;
  daysLeft: number;
  department: string;
  site: string | null;
};

function buildAlertEmailHtml(params: {
  companyName: string;
  groupedAlerts: Record<string, AlertEmailItem[]>;
}) {
  const { companyName, groupedAlerts } = params;

  let html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #f8fafc;">
      <div style="background: linear-gradient(135deg, #173B56 0%, #1e4a6b 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🔔 Alertes Habilitations</h1>
        <p style="color: #e2e8f0; margin: 10px 0 0 0;">CertPilot - ${new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      <div style="padding: 30px;">
        <p style="color: #475569; font-size: 16px; margin-bottom: 20px;">Bonjour,<br><br>Voici le récapitulatif des habilitations nécessitant votre attention :</p>
  `;

  if (groupedAlerts.EXPIRED) {
    html += `
      <div style="margin-bottom: 25px;">
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 15px;">
          <h3 style="color: #dc2626; margin: 0 0 5px 0;">❌ Expirées (${groupedAlerts.EXPIRED.length})</h3>
          <p style="color: #991b1b; margin: 0; font-size: 14px;">Ces habilitations sont déjà expirées !</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: #fef2f2;">
              <th style="padding: 12px; text-align: left; color: #991b1b; font-size: 13px;">Employé</th>
              <th style="padding: 12px; text-align: left; color: #991b1b; font-size: 13px;">Formation</th>
              <th style="padding: 12px; text-align: left; color: #991b1b; font-size: 13px;">Service</th>
              <th style="padding: 12px; text-align: center; color: #991b1b; font-size: 13px;">Expiré depuis</th>
            </tr>
          </thead>
          <tbody>
            ${groupedAlerts.EXPIRED.map(
              (item) => `
                <tr style="border-top: 1px solid #fee2e2;">
                  <td style="padding: 12px; color: #1f2937;">${item.employeeName}</td>
                  <td style="padding: 12px; color: #1f2937;">${item.formationName}</td>
                  <td style="padding: 12px; color: #6b7280;">${item.department}${item.site ? ` - ${item.site}` : ""}</td>
                  <td style="padding: 12px; text-align: center;"><span style="background: #dc2626; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px;">${Math.abs(item.daysLeft)} jour(s)</span></td>
                </tr>
              `,
            ).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  const sortedThresholds = Object.keys(groupedAlerts)
    .filter((key) => key !== "EXPIRED")
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  for (const thresholdKey of sortedThresholds) {
    const days = parseInt(thresholdKey, 10);
    const alerts = groupedAlerts[thresholdKey];

    let bgColor = "#eff6ff";
    let borderColor = "#3b82f6";
    let textColor = "#1e40af";
    let badgeColor = "#3b82f6";

    if (days <= 7) {
      bgColor = "#fef3c7";
      borderColor = "#f59e0b";
      textColor = "#92400e";
      badgeColor = "#f59e0b";
    } else if (days <= 30) {
      bgColor = "#fef9c3";
      borderColor = "#eab308";
      textColor = "#854d0e";
      badgeColor = "#eab308";
    } else if (days <= 60) {
      bgColor = "#ecfdf5";
      borderColor = "#10b981";
      textColor = "#065f46";
      badgeColor = "#10b981";
    }

    html += `
      <div style="margin-bottom: 25px;">
        <div style="background: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 15px;">
          <h3 style="color: ${textColor}; margin: 0 0 5px 0;">⚠️ Expire dans ${days} jours ou moins (${alerts.length})</h3>
        </div>
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: #f8fafc;">
              <th style="padding: 12px; text-align: left; color: #475569; font-size: 13px;">Employé</th>
              <th style="padding: 12px; text-align: left; color: #475569; font-size: 13px;">Formation</th>
              <th style="padding: 12px; text-align: left; color: #475569; font-size: 13px;">Service</th>
              <th style="padding: 12px; text-align: center; color: #475569; font-size: 13px;">Jours restants</th>
            </tr>
          </thead>
          <tbody>
            ${alerts
              .map(
                (item) => `
                  <tr style="border-top: 1px solid #e5e7eb;">
                    <td style="padding: 12px; color: #1f2937;">${item.employeeName}</td>
                    <td style="padding: 12px; color: #1f2937;">${item.formationName}</td>
                    <td style="padding: 12px; color: #6b7280;">${item.department}${item.site ? ` - ${item.site}` : ""}</td>
                    <td style="padding: 12px; text-align: center;"><span style="background: ${badgeColor}; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px;">${item.daysLeft} jour(s)</span></td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || "https://www.certpilot.eu";
  html += `
        <div style="margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 8px; text-align: center;">
          <p style="color: #64748b; margin: 0 0 15px 0; font-size: 14px;">Accédez au tableau de bord pour planifier les recyclages</p>
          <a href="${appUrl}/dashboard" style="display: inline-block; background: #173B56; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">📋 Voir le tableau de bord</a>
        </div>
      </div>
      <div style="background: #173B56; padding: 20px; text-align: center;">
        <p style="color: #94a3b8; margin: 0; font-size: 12px;">Cet email a été envoyé automatiquement par CertPilot<br>${companyName}</p>
      </div>
    </div>
  `;

  return html;
}

export async function sendAlertEmail(params: {
  to: string;
  companyName: string;
  alertCount: number;
  groupedAlerts: Record<string, AlertEmailItem[]>;
}) {
  const { to, companyName, alertCount, groupedAlerts } = params;
  return sendEmail({
    from: FROM_EMAIL,
    to,
    subject: `🔔 Alertes Habilitations - ${alertCount} habilitation(s) à surveiller`,
    html: buildAlertEmailHtml({ companyName, groupedAlerts }),
  });
}

// Email 3 : Bienvenue + Identifiants après paiement
// Email : Notification de rejet de passeport à l'employé
export async function sendPassportRejectedEmail(params: {
  to: string;
  employeeName: string;
  rejectionReason: string;
  managerName: string;
}) {
  const { to, employeeName, rejectionReason, managerName } = params;
  const appUrl = getAppBaseUrl();

  await sendEmail({
    from: FROM_EMAIL,
    to,
    subject: "Passeport Formation — Signature refusée",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #173B56 0%, #1e4a6b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Passeport Formation</h1>
          <p style="color: #e2e8f0; margin: 8px 0 0 0;">Notification de rejet</p>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Bonjour ${employeeName},</p>
          <p>Votre responsable <strong>${managerName}</strong> a refusé de signer votre passeport formation.</p>
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 0 8px 8px 0; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b;"><strong>Motif du refus :</strong></p>
            <p style="margin: 8px 0 0 0; color: #1f2937;">${rejectionReason}</p>
          </div>
          <p>Veuillez contacter votre service RH pour régulariser votre situation.</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${appUrl}/dashboard" style="display: inline-block; padding: 12px 24px; background: #173B56; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">Accéder au tableau de bord</a>
          </div>
          <p style="margin-top: 30px;">Cordialement,<br><strong>L'équipe CertPilot</strong></p>
        </div>
        <div style="background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px;">
          <p style="margin: 0;">CertPilot — Gestion des habilitations et formations réglementaires</p>
        </div>
      </div>
    `,
    text: `Bonjour ${employeeName},

Votre responsable ${managerName} a refusé de signer votre passeport formation.

Motif du refus : ${rejectionReason}

Veuillez contacter votre service RH pour régulariser votre situation.

Cordialement,
L'équipe CertPilot`,
  });
}

// Email : Confirmation de validation de passeport à l'employé
export async function sendPassportValidatedEmail(params: {
  to: string;
  employeeName: string;
  managerName: string;
  qrToken?: string;
}) {
  const { to, employeeName, managerName, qrToken } = params;
  const appUrl = getAppBaseUrl();

  let qrCodeHtml = "";
  let qrCodeText = "";

  if (qrToken) {
    const passportUrl = `${appUrl}/p/${qrToken}`;
    try {
      const qrDataUrl = await QRCode.toDataURL(passportUrl, { width: 200, margin: 2 });
      qrCodeHtml = `
        <div style="text-align: center; margin: 25px 0;">
          <p style="color: #475569; margin-bottom: 12px;">Scannez ce QR code pour consulter votre passeport à tout moment :</p>
          <img src="${qrDataUrl}" alt="QR Code passeport" width="180" height="180" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px;" />
          <p style="margin-top: 10px; font-size: 12px; color: #94a3b8;">Ou accédez directement via ce lien :<br><a href="${passportUrl}" style="color: #173B56;">${passportUrl}</a></p>
        </div>
      `;
      qrCodeText = `\nConsultez votre passeport : ${passportUrl}\n`;
    } catch {
      qrCodeText = `\nConsultez votre passeport : ${passportUrl}\n`;
    }
  }

  await sendEmail({
    from: FROM_EMAIL,
    to,
    subject: "✅ Passeport Formation — Validé et signé",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #173B56 0%, #1e4a6b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">Passeport Formation</h1>
          <p style="color: #e2e8f0; margin: 8px 0 0 0;">Validation confirmée</p>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Bonjour ${employeeName},</p>
          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; border-radius: 0 8px 8px 0; margin: 20px 0;">
            <p style="margin: 0; color: #065f46; font-size: 16px;"><strong>✅ Votre passeport formation a été validé !</strong></p>
            <p style="margin: 8px 0 0 0; color: #047857;">Signé par : ${managerName}</p>
          </div>
          <p>Votre passeport formation est désormais complet et signé.</p>
          ${qrCodeHtml}
          <p style="margin-top: 30px;">Cordialement,<br><strong>L'équipe CertPilot</strong></p>
        </div>
        <div style="background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px;">
          <p style="margin: 0;">CertPilot — Gestion des habilitations et formations réglementaires</p>
        </div>
      </div>
    `,
    text: `Bonjour ${employeeName},

Votre passeport formation a été validé et signé par ${managerName}.
${qrCodeText}
Cordialement,
L'équipe CertPilot`,
  });
}

// Email : Relance paiement échoué (Stripe)
export async function sendPaymentFailedEmail(params: {
  to: string;
  companyName: string;
}) {
  const { to, companyName } = params;
  const appUrl = getAppBaseUrl();

  await sendEmail({
    from: FROM_EMAIL,
    to,
    subject: "⚠️ CertPilot — Échec de paiement",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #173B56 0%, #1e4a6b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 22px;">CertPilot</h1>
          <p style="color: #e2e8f0; margin: 8px 0 0 0;">Notification de paiement</p>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Bonjour,</p>
          <p>Nous n'avons pas pu débiter le paiement de votre abonnement CertPilot pour <strong>${companyName}</strong>.</p>
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 0 8px 8px 0; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>⚠️ Action requise :</strong></p>
            <p style="margin: 8px 0 0 0; color: #78350f;">Votre accès pourrait être suspendu si le paiement n'est pas régularisé rapidement. Veuillez mettre à jour votre moyen de paiement.</p>
          </div>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${appUrl}/dashboard/settings" style="display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">Mettre à jour mon paiement</a>
          </div>
          <p>Si vous avez des questions, contactez-nous à <a href="mailto:contact@certpilot.eu" style="color: #173B56;">contact@certpilot.eu</a>.</p>
          <p style="margin-top: 30px;">Cordialement,<br><strong>L'équipe CertPilot</strong></p>
        </div>
        <div style="background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 10px 10px;">
          <p style="margin: 0;">CertPilot — Gestion des habilitations et formations réglementaires</p>
        </div>
      </div>
    `,
    text: `Bonjour,

Nous n'avons pas pu débiter le paiement de votre abonnement CertPilot pour ${companyName}.

Votre accès pourrait être suspendu si le paiement n'est pas régularisé rapidement.

Mettez à jour votre moyen de paiement : ${appUrl}/dashboard/settings

Pour toute question : contact@certpilot.eu

Cordialement,
L'équipe CertPilot`,
  });
}

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
    pro: "Pro",
    business: "Business",
    enterprise: "Enterprise",
  };

  await sendEmail({
    from: FROM_EMAIL,
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
  });
}
