import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

type AlertItem = {
  threshold: number;
  certificateId: string;
  employeeName: string;
  formationName: string;
  daysLeft: number;
  department: string;
  site: string | null;
};

function parseThresholds(raw: string): number[] {
  return raw
    .split(",")
    .map((value) => parseInt(value.trim(), 10))
    .filter((value) => !Number.isNaN(value) && value >= 0)
    .sort((a, b) => b - a);
}

function getAlertType(daysLeft: number, threshold: number): string {
  return daysLeft < 0 ? "EXPIRED" : `${threshold}_DAYS`;
}

function buildAlertEmailHtml(params: {
  companyName: string;
  groupedAlerts: Record<string, AlertItem[]>;
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

  html += `
        <div style="margin-top: 30px; padding: 20px; background: #f1f5f9; border-radius: 8px; text-align: center;">
          <p style="color: #64748b; margin: 0 0 15px 0; font-size: 14px;">Accédez au tableau de bord pour planifier les recyclages</p>
          <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/dashboard/formations" style="display: inline-block; background: #173B56; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">📋 Voir le tableau de bord</a>
        </div>
      </div>
      <div style="background: #173B56; padding: 20px; text-align: center;">
        <p style="color: #94a3b8; margin: 0; font-size: 12px;">Cet email a été envoyé automatiquement par CertPilot<br>${companyName}</p>
      </div>
    </div>
  `;

  return html;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const companies = await prisma.company.findMany({
      where: {
        adminEmail: { not: null },
      },
      select: {
        id: true,
        name: true,
        adminEmail: true,
        alertThresholds: true,
      },
    });

    if (companies.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Aucune entreprise avec email admin configuré",
        alertsSent: 0,
      });
    }

    const smtpConfigured = !!(
      process.env.SMTP_USER && process.env.SMTP_PASSWORD
    );
    const transporter = smtpConfigured
      ? nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: parseInt(process.env.SMTP_PORT || "587", 10),
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        })
      : null;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const today = now.toISOString().split("T")[0];
    let totalAlertsSent = 0;
    let totalAlertsPending = 0;
    let totalConvocationsClosed = 0;

    const byCompany: Array<{
      companyId: string;
      companyName: string;
      alertsReady: number;
      alertsSent: number;
      alertsPending: number;
      convocationsClosed: number;
    }> = [];

    for (const company of companies) {
      const thresholds = parseThresholds(
        company.alertThresholds || "90,60,30,7",
      );

      if (thresholds.length === 0 || !company.adminEmail) {
        byCompany.push({
          companyId: company.id,
          companyName: company.name,
          alertsReady: 0,
          alertsSent: 0,
          alertsPending: 0,
          convocationsClosed: 0,
        });
        continue;
      }

      const certificates = await prisma.certificate.findMany({
        where: {
          isArchived: false,
          expiryDate: { not: null },
          employee: {
            companyId: company.id,
          },
        },
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              department: true,
              site: true,
            },
          },
          formationType: {
            select: {
              name: true,
            },
          },
          alertLogs: {
            select: {
              alertType: true,
            },
          },
        },
      });

      const alertsToSend: AlertItem[] = [];

      for (const cert of certificates) {
        if (!cert.expiryDate) continue;

        const expiryDate = new Date(cert.expiryDate);
        expiryDate.setHours(0, 0, 0, 0);

        const daysLeft = Math.ceil(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );

        for (let index = 0; index < thresholds.length; index++) {
          const threshold = thresholds[index];
          const nextThreshold = thresholds[index + 1] ?? -999;

          if (daysLeft <= threshold && daysLeft > nextThreshold) {
            const alertType = getAlertType(daysLeft, threshold);
            const alreadySent = cert.alertLogs.some(
              (log) => log.alertType === alertType,
            );

            if (!alreadySent) {
              alertsToSend.push({
                threshold,
                certificateId: cert.id,
                employeeName: `${cert.employee.lastName} ${cert.employee.firstName}`,
                formationName: cert.formationType.name,
                daysLeft,
                department: cert.employee.department,
                site: cert.employee.site,
              });
            }
            break;
          }
        }
      }

      let alertsSentForCompany = 0;
      let alertsPendingForCompany = 0;

      if (alertsToSend.length > 0) {
        if (transporter) {
          const groupedAlerts = alertsToSend.reduce(
            (acc, alert) => {
              const key =
                alert.daysLeft < 0 ? "EXPIRED" : `${alert.threshold}_DAYS`;
              if (!acc[key]) acc[key] = [];
              acc[key].push(alert);
              return acc;
            },
            {} as Record<string, AlertItem[]>,
          );

          await transporter.sendMail({
            from: `"CertPilot - ${company.name}" <${process.env.SMTP_USER}>`,
            to: company.adminEmail,
            subject: `🔔 Alertes Habilitations - ${alertsToSend.length} habilitation(s) à surveiller`,
            html: buildAlertEmailHtml({
              companyName: company.name,
              groupedAlerts,
            }),
          });

          for (const alert of alertsToSend) {
            await prisma.alertLog.create({
              data: {
                certificateId: alert.certificateId,
                alertType: getAlertType(alert.daysLeft, alert.threshold),
                recipients: company.adminEmail,
              },
            });
          }

          await prisma.notification.create({
            data: {
              type: "FORMATION_EXPIRED",
              title: "Alertes habilitations envoyées",
              message: `${alertsToSend.length} alerte(s) envoyée(s) à ${company.adminEmail}`,
              link: "/dashboard/formations",
              companyId: company.id,
            },
          });

          alertsSentForCompany = alertsToSend.length;
          totalAlertsSent += alertsToSend.length;
        } else {
          alertsPendingForCompany = alertsToSend.length;
          totalAlertsPending += alertsToSend.length;
        }
      }

      const closedConvocations = await prisma.convocation.updateMany({
        where: {
          companyId: company.id,
          status: "sent",
          endDate: { lt: today },
        },
        data: {
          status: "completed",
        },
      });

      totalConvocationsClosed += closedConvocations.count;

      byCompany.push({
        companyId: company.id,
        companyName: company.name,
        alertsReady: alertsToSend.length,
        alertsSent: alertsSentForCompany,
        alertsPending: alertsPendingForCompany,
        convocationsClosed: closedConvocations.count,
      });
    }

    return NextResponse.json({
      success: true,
      smtpConfigured,
      message: smtpConfigured
        ? `${totalAlertsSent} alerte(s) envoyée(s)`
        : `${totalAlertsPending} alerte(s) prêtes mais SMTP non configuré`,
      alertsSent: totalAlertsSent,
      alertsPending: totalAlertsPending,
      convocationsClosed: totalConvocationsClosed,
      companiesProcessed: companies.length,
      byCompany,
    });
  } catch (error) {
    console.error("CRON check-alerts error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la vérification des alertes",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}
