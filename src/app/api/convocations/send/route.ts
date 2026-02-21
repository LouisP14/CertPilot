import { auditSendConvocation } from "@/lib/audit";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const companyId = session.user.companyId;

    const body = await request.json();
    console.log("Convocations - Body reçu:", JSON.stringify(body, null, 2));

    const {
      sessionId,
      convocationId, // ID de la convocation existante (pour mise à jour brouillon → envoyée)
      formationName,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      notes,
      employees,
      pdfBase64,
    } = body;

    // Récupérer les infos de l'entreprise
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true },
    });
    console.log("Company:", company ? company.name : "Non trouvée");

    if (!company) {
      return NextResponse.json(
        { error: "Entreprise non configurée" },
        { status: 400 },
      );
    }

    // Formater les dates
    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    const dateText =
      startDate === endDate
        ? formatDate(startDate)
        : `du ${formatDate(startDate)} au ${formatDate(endDate)}`;

    // Récupérer les emails des employés depuis la base de données (actifs uniquement)
    const employeeIds = employees.map((e: { id: string }) => e.id);
    const employeesFromDb = await prisma.employee.findMany({
      where: {
        id: { in: employeeIds },
        companyId,
        isActive: true,
      },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    // Utiliser uniquement les employés de la même entreprise
    const employeesWithEmails = employeesFromDb.map((emp) => ({
      id: emp.id,
      name: `${emp.lastName} ${emp.firstName}`,
      email: emp.email,
    }));

    if (employeesWithEmails.length === 0) {
      return NextResponse.json(
        { error: "Aucun employé valide pour cette entreprise" },
        { status: 400 },
      );
    }

    // Vérifier si Resend est configuré
    const resendConfigured = !!process.env.RESEND_API_KEY;
    console.log("Resend configuré:", resendConfigured ? "Oui" : "Non");

    let emailsSent = 0;
    const employeesWithEmail = employeesWithEmails.filter(
      (
        emp,
      ): emp is {
        id: string;
        name: string;
        email: string;
      } => typeof emp.email === "string" && emp.email.length > 0,
    );
    console.log("Employés avec email:", employeesWithEmail.length);

    if (resendConfigured && employeesWithEmail.length > 0) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const fromEmail =
        process.env.EMAIL_FROM || "CertPilot <onboarding@resend.dev>";

      // Préparer le buffer du PDF si fourni
      const pdfBuffer = pdfBase64 ? Buffer.from(pdfBase64, "base64") : null;

      // Envoyer un email à chaque employé
      const emailPromises = employeesWithEmail.map(async (employee) => {
        const emailData: {
          from: string;
          to: string;
          subject: string;
          html: string;
          attachments?: Array<{
            filename: string;
            content: Buffer;
          }>;
        } = {
          from: fromEmail,
          to: employee.email,
          subject: `Convocation - ${formationName}`,
          html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e40af;">Convocation à une formation</h2>
                <p>Bonjour ${employee.name},</p>
                <p>Vous êtes convoqué(e) à la formation suivante :</p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Formation</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${formationName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Date</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${dateText}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Horaires</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${startTime} - ${endTime}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Lieu</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${location}</td>
                  </tr>
                </table>
                ${notes ? `<p><strong>Instructions :</strong><br/>${notes.replace(/\n/g, "<br/>")}</p>` : ""}
                <p style="color: #dc2626; font-weight: bold; margin-top: 20px;">
                  Toute absence doit être dûment justifiée.
                </p>
                <p>Veuillez trouver ci-joint votre convocation officielle.</p>
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
                <p style="color: #6b7280; font-size: 12px;">
                  Ce message a été envoyé automatiquement par ${company.name}.<br/>
                  Merci de ne pas répondre à cet email.
                </p>
              </div>
            `,
        };

        // Ajouter le PDF en pièce jointe si fourni
        if (pdfBuffer) {
          emailData.attachments = [
            {
              filename: `Convocation_${formationName.replace(/[^a-zA-Z0-9]/g, "_")}_${employee.name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
              content: pdfBuffer,
            },
          ];
        }

        return resend.emails.send(emailData);
      });

      // Attendre que tous les emails soient envoyés
      await Promise.all(emailPromises);
      emailsSent = emailPromises.length;
    }

    // Marquer la session comme "convocations envoyées"
    if (sessionId) {
      const trainingSession = await prisma.trainingSession.findFirst({
        where: {
          id: sessionId,
          formationType: {
            companyId,
          },
        },
        select: { id: true },
      });

      if (trainingSession) {
        await prisma.trainingSession.update({
          where: { id: trainingSession.id },
          data: { convocationsSentAt: new Date() },
        });
      }
    }

    // Audit Trail - logger l'envoi (simplifié pour éviter les erreurs)
    try {
      const sessionInfo = `${formationName} - ${dateText}`;
      for (const employee of employeesWithEmails) {
        await auditSendConvocation(
          employee.id || "unknown",
          employee.name || "Inconnu",
          sessionInfo,
          employee.email || "(pas d'email)",
          session.user
            ? {
                id: session.user.id,
                name: session.user.name || undefined,
                email: session.user.email || undefined,
              }
            : null,
        );
      }
    } catch (auditError) {
      console.error("Erreur audit (non bloquante):", auditError);
    }

    // Message de retour
    let message = "";
    if (resendConfigured && emailsSent > 0) {
      message = `${emailsSent} email(s) envoyé(s) avec succès`;
    } else if (!resendConfigured) {
      message = `Convocations enregistrées (${employeesWithEmails.length} participant(s)). Note: Resend non configuré, emails non envoyés.`;
    } else {
      message = `Convocations enregistrées pour ${employeesWithEmails.length} participant(s) (aucun n'a d'email)`;
    }

    // Sauvegarder ou mettre à jour la convocation dans la base de données
    try {
      if (convocationId) {
        const existingConvocation = await prisma.convocation.findFirst({
          where: {
            id: convocationId,
            companyId,
          },
          select: { id: true },
        });

        if (!existingConvocation) {
          return NextResponse.json(
            { error: "Convocation introuvable pour cette entreprise" },
            { status: 404 },
          );
        }

        // Mise à jour d'une convocation existante (brouillon → envoyée)
        // D'abord supprimer les anciens attendees
        await prisma.convocationAttendee.deleteMany({
          where: { convocationId },
        });

        // Mettre à jour la convocation
        const convocation = await prisma.convocation.update({
          where: { id: convocationId },
          data: {
            formationName,
            startDate,
            endDate,
            startTime,
            endTime,
            location,
            notes: notes || "",
            status: "sent",
            attendees: {
              create: employeesWithEmails.map(
                (emp: { id: string; name: string; email: string | null }) => ({
                  employeeId: emp.id,
                  employeeName: emp.name,
                  employeeEmail: emp.email,
                }),
              ),
            },
          },
        });
        console.log("Convocation mise à jour:", convocation.id);
      } else {
        // Créer une nouvelle convocation
        const convocation = await prisma.convocation.create({
          data: {
            formationId: sessionId || formationName,
            formationName,
            startDate,
            endDate,
            startTime,
            endTime,
            location,
            notes: notes || "",
            status: "sent",
            companyId,
            attendees: {
              create: employeesWithEmails.map(
                (emp: { id: string; name: string; email: string | null }) => ({
                  employeeId: emp.id,
                  employeeName: emp.name,
                  employeeEmail: emp.email,
                }),
              ),
            },
          },
        });
        console.log("Convocation créée:", convocation.id);
      }
    } catch (dbError) {
      console.error(
        "Erreur lors de la sauvegarde de la convocation (non bloquante):",
        dbError,
      );
    }

    return NextResponse.json({
      success: true,
      message,
      emailsSent,
      resendConfigured,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi des convocations:", error);
    return NextResponse.json(
      {
        error: `Erreur lors de l'envoi des convocations: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
