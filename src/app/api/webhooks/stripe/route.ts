import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Générer un mot de passe aléatoire
function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// POST - Webhook Stripe
export async function POST(request: NextRequest) {
  if (!stripe) {
    console.error("Webhook: Stripe non configuré");
    return NextResponse.json(
      { error: "Stripe non configuré" },
      { status: 500 },
    );
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    console.error("Webhook: Signature manquante");
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  console.log("Webhook reçu:", event.type);

  // Traiter les événements
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaid(invoice);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancelled(subscription);
      break;
    }

    default:
      console.log(`Événement non géré: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

// Traiter un checkout réussi
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("Checkout completed:", session.id);

  const metadata = session.metadata || {};
  const { contactRequestId, plan, companyName, contactName, employeeLimit } =
    metadata;
  const customerEmail = session.customer_email;
  const stripeCustomerId = session.customer as string;
  const stripeSubscriptionId = session.subscription as string;

  if (!customerEmail) {
    console.error("Email client manquant");
    return;
  }

  // Vérifier si l'utilisateur existe déjà
  const existingUser = await prisma.user.findUnique({
    where: { email: customerEmail.toLowerCase() },
  });

  if (existingUser) {
    console.log("Utilisateur existe déjà:", customerEmail);

    // Mettre à jour l'abonnement de la company existante
    if (existingUser.companyId) {
      await prisma.company.update({
        where: { id: existingUser.companyId },
        data: {
          subscriptionStatus: "ACTIVE",
          subscriptionPlan: plan,
          stripeCustomerId,
          stripeSubscriptionId,
          employeeLimit: parseInt(employeeLimit || "50"),
          trialEndsAt: null,
        },
      });
    }
    return;
  }

  // Créer le compte client
  const tempPassword = generatePassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  // Créer la company
  const company = await prisma.company.create({
    data: {
      name: companyName || customerEmail.split("@")[0],
      subscriptionStatus: "ACTIVE",
      subscriptionPlan: plan,
      stripeCustomerId,
      stripeSubscriptionId,
      employeeLimit: parseInt(employeeLimit || "50"),
      trialEndsAt: null,
    },
  });

  // Créer l'utilisateur
  const user = await prisma.user.create({
    data: {
      email: customerEmail.toLowerCase(),
      password: hashedPassword,
      name: contactName || customerEmail.split("@")[0],
      role: "ADMIN",
      companyId: company.id,
      mustChangePassword: true,
    },
  });

  console.log("Compte créé:", user.email, "Company:", company.id);

  // Mettre à jour la demande de contact si elle existe
  if (contactRequestId) {
    await prisma.contactRequest
      .update({
        where: { id: contactRequestId },
        data: { status: "CONVERTED" },
      })
      .catch(() => {
        console.log("ContactRequest non trouvé:", contactRequestId);
      });
  }

  // Envoyer email de bienvenue avec les identifiants
  try {
    const { sendWelcomeEmail } = await import("@/lib/email");
    await sendWelcomeEmail({
      to: customerEmail,
      contactName: contactName || customerEmail.split("@")[0],
      companyName: companyName || customerEmail.split("@")[0],
      plan: plan?.toLowerCase() || "starter",
      tempPassword: tempPassword,
    });
    console.log("Email de bienvenue envoyé à:", customerEmail);
  } catch (emailError) {
    console.error("Erreur envoi email bienvenue:", emailError);
  }

  // Log pour le debug
  console.log("=== NOUVEAU CLIENT ===");
  console.log("Email:", customerEmail);
  console.log("Mot de passe temporaire:", tempPassword);
  console.log("Plan:", plan);
  console.log("======================");
}

// Traiter une facture payée (renouvellement)
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log("Facture payée:", invoice.id);

  // Récupérer le subscription_id depuis les lignes de facture
  const subscriptionId = invoice.lines?.data?.[0]?.subscription as
    | string
    | null;
  if (!subscriptionId) return;

  // Mettre à jour le statut de l'abonnement
  const company = await prisma.company.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (company) {
    await prisma.company.update({
      where: { id: company.id },
      data: { subscriptionStatus: "ACTIVE" },
    });
    console.log("Abonnement renouvelé pour:", company.name);
  }
}

// Traiter un échec de paiement
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log("Paiement échoué:", invoice.id);

  // Récupérer le subscription_id depuis les lignes de facture
  const subscriptionId = invoice.lines?.data?.[0]?.subscription as
    | string
    | null;
  if (!subscriptionId) return;

  const company = await prisma.company.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (company) {
    // Marquer comme en attente (pas encore expiré)
    await prisma.company.update({
      where: { id: company.id },
      data: { subscriptionStatus: "EXPIRED" },
    });
    console.log("Paiement échoué pour:", company.name);

    // TODO: Envoyer email de relance
  }
}

// Traiter une annulation d'abonnement
async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  console.log("Abonnement annulé:", subscription.id);

  const company = await prisma.company.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (company) {
    await prisma.company.update({
      where: { id: company.id },
      data: { subscriptionStatus: "CANCELLED" },
    });
    console.log("Abonnement annulé pour:", company.name);
  }
}
