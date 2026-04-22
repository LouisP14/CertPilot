import { detectTrainingNeeds } from "@/lib/detect-training-needs";
import {
  sendAlertEmail,
  sendExpiryNotificationEmployee,
  sendExpiryNotificationManager,
  sendOnboardingEmail,
  sendPPDeclarationReminder,
  type PPReminderGroupKey,
  type PPReminderItem,
} from "@/lib/email";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Délai légal de déclaration au Passeport Prévention (décret n° 2025-748) : 6 mois
const PP_DEADLINE_DAYS = 180;

function getPPThresholdForDaysUntilDeadline(
  daysUntilDeadline: number,
): PPReminderGroupKey | null {
  if (daysUntilDeadline <= 0) return "PP_OVERDUE";
  if (daysUntilDeadline <= 7) return "PP_7_DAYS";
  if (daysUntilDeadline <= 30) return "PP_30_DAYS";
  if (daysUntilDeadline <= 60) return "PP_60_DAYS";
  return null;
}

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

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const secret =
      authHeader?.replace("Bearer ", "") ??
      new URL(request.url).searchParams.get("secret");

    if (!process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: "CRON_SECRET non configuré sur le serveur" },
        { status: 500 },
      );
    }

    if (secret !== process.env.CRON_SECRET) {
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
        notifyEmployee: true,
        notifyManager: true,
      },
    });

    if (companies.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Aucune entreprise avec email admin configuré",
        alertsSent: 0,
      });
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const today = now.toISOString().split("T")[0];
    let totalAlertsSent = 0;
    let totalConvocationsClosed = 0;

    const byCompany: Array<{
      companyId: string;
      companyName: string;
      alertsReady: number;
      alertsSent: number;
      convocationsClosed: number;
      employeeNotifsSent?: number;
      managerNotifsSent?: number;
      ppRemindersSent?: number;
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
              email: true,
              managerEmail: true,
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
              notifyType: true,
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

      if (alertsToSend.length > 0) {
        const groupedAlerts = alertsToSend.reduce(
          (acc, alert) => {
            const key =
              alert.daysLeft < 0 ? "EXPIRED" : `${alert.threshold}_DAYS`;
            if (!acc[key]) acc[key] = [];
            acc[key].push({
              employeeName: alert.employeeName,
              formationName: alert.formationName,
              daysLeft: alert.daysLeft,
              department: alert.department,
              site: alert.site,
            });
            return acc;
          },
          {} as Record<
            string,
            {
              employeeName: string;
              formationName: string;
              daysLeft: number;
              department: string;
              site: string | null;
            }[]
          >,
        );

        const { error } = await sendAlertEmail({
          to: company.adminEmail,
          companyName: company.name,
          alertCount: alertsToSend.length,
          groupedAlerts,
        });

        if (!error) {
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
              link: "/dashboard",
              companyId: company.id,
            },
          });

          alertsSentForCompany = alertsToSend.length;
          totalAlertsSent += alertsToSend.length;
        } else {
          console.error(
            `[cron/check-alerts] Erreur envoi email pour ${company.name}:`,
            error,
          );
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

      // ========== NOTIFICATIONS DIRECTES EMPLOYÉ / MANAGER ==========
      let employeeNotifsSent = 0;
      let managerNotifsSent = 0;

      if (company.notifyEmployee || company.notifyManager) {
        for (const cert of certificates) {
          if (!cert.expiryDate) continue;

          const expiryDate = new Date(cert.expiryDate);
          expiryDate.setHours(0, 0, 0, 0);
          const daysLeft = Math.ceil(
            (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          );

          // Only notify at J-7 window (daysLeft 0..7) or expired
          if (daysLeft > 7) continue;

          const alertType = daysLeft <= 0 ? "EXPIRED" : "7_DAYS";

          // Employee notification
          if (company.notifyEmployee && cert.employee.email) {
            const alreadySent = cert.alertLogs.some(
              (log) => log.alertType === alertType && log.notifyType === "EMPLOYEE",
            );
            if (!alreadySent) {
              const { error } = await sendExpiryNotificationEmployee({
                to: cert.employee.email,
                employeeFirstName: cert.employee.firstName,
                employeeLastName: cert.employee.lastName,
                formationName: cert.formationType.name,
                daysLeft,
                companyName: company.name,
              });
              if (!error) {
                await prisma.alertLog.create({
                  data: {
                    certificateId: cert.id,
                    alertType,
                    notifyType: "EMPLOYEE",
                    recipients: cert.employee.email,
                  },
                });
                employeeNotifsSent++;
              }
            }
          }

          // Manager notification
          if (company.notifyManager && cert.employee.managerEmail) {
            const alreadySent = cert.alertLogs.some(
              (log) => log.alertType === alertType && log.notifyType === "MANAGER",
            );
            if (!alreadySent) {
              const { error } = await sendExpiryNotificationManager({
                to: cert.employee.managerEmail,
                employeeFirstName: cert.employee.firstName,
                employeeLastName: cert.employee.lastName,
                employeeDepartment: cert.employee.department,
                formationName: cert.formationType.name,
                daysLeft,
                companyName: company.name,
              });
              if (!error) {
                await prisma.alertLog.create({
                  data: {
                    certificateId: cert.id,
                    alertType,
                    notifyType: "MANAGER",
                    recipients: cert.employee.managerEmail,
                  },
                });
                managerNotifsSent++;
              }
            }
          }
        }
      }

      // ========== RAPPELS DÉCLARATION PASSEPORT PRÉVENTION ==========
      // Isolé dans un try/catch : ne doit JAMAIS casser le flow d'alertes existant.
      let ppRemindersSent = 0;
      try {
        const ppCertificates = await prisma.certificate.findMany({
          where: {
            isArchived: false,
            ppDeclaredAt: null,
            formationType: { isConcernedPP: true },
            employee: { companyId: company.id },
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
            formationType: { select: { name: true } },
            alertLogs: { select: { alertType: true, notifyType: true } },
          },
        });

        const ppGrouped: Partial<Record<PPReminderGroupKey, PPReminderItem[]>> =
          {};
        const ppAlertsToLog: Array<{
          certificateId: string;
          alertType: PPReminderGroupKey;
        }> = [];

        for (const cert of ppCertificates) {
          if (!cert.obtainedDate) continue;
          const obtained = new Date(cert.obtainedDate);
          obtained.setHours(0, 0, 0, 0);
          const daysSinceObtained = Math.floor(
            (now.getTime() - obtained.getTime()) / (1000 * 60 * 60 * 24),
          );
          // Ignorer dates futures (erreur de saisie potentielle)
          if (daysSinceObtained < 0) continue;

          const daysUntilDeadline = PP_DEADLINE_DAYS - daysSinceObtained;
          const thresholdKey = getPPThresholdForDaysUntilDeadline(
            daysUntilDeadline,
          );
          if (!thresholdKey) continue;

          const alreadySent = cert.alertLogs.some(
            (log) =>
              log.alertType === thresholdKey && log.notifyType === "ADMIN",
          );
          if (alreadySent) continue;

          const item: PPReminderItem = {
            employeeName: `${cert.employee.lastName} ${cert.employee.firstName}`,
            formationName: cert.formationType.name,
            department: cert.employee.department,
            site: cert.employee.site,
            obtainedDateFormatted: obtained.toLocaleDateString("fr-FR"),
            daysUntilDeadline,
          };

          if (!ppGrouped[thresholdKey]) ppGrouped[thresholdKey] = [];
          ppGrouped[thresholdKey]!.push(item);
          ppAlertsToLog.push({
            certificateId: cert.id,
            alertType: thresholdKey,
          });
        }

        if (ppAlertsToLog.length > 0 && company.adminEmail) {
          const { error } = await sendPPDeclarationReminder({
            to: company.adminEmail,
            companyName: company.name,
            totalCount: ppAlertsToLog.length,
            groupedItems: ppGrouped,
          });

          if (!error) {
            for (const entry of ppAlertsToLog) {
              await prisma.alertLog.create({
                data: {
                  certificateId: entry.certificateId,
                  alertType: entry.alertType,
                  notifyType: "ADMIN",
                  recipients: company.adminEmail,
                },
              });
            }

            await prisma.notification.create({
              data: {
                type: "FORMATION_EXPIRED",
                title: "Rappel Passeport Prévention",
                message: `${ppAlertsToLog.length} déclaration(s) Passeport Prévention à effectuer`,
                link: "/dashboard/export",
                companyId: company.id,
              },
            });

            ppRemindersSent = ppAlertsToLog.length;
          } else {
            console.error(
              `[cron/check-alerts] Erreur envoi rappel PP pour ${company.name}:`,
              error,
            );
          }
        }
      } catch (ppError) {
        console.error(
          `[cron/check-alerts] Bloc rappel PP en échec pour ${company.name} (flow principal préservé):`,
          ppError,
        );
      }

      byCompany.push({
        companyId: company.id,
        companyName: company.name,
        alertsReady: alertsToSend.length,
        alertsSent: alertsSentForCompany,
        convocationsClosed: closedConvocations.count,
        employeeNotifsSent,
        managerNotifsSent,
        ppRemindersSent,
      });
    }

    // ========== ONBOARDING EMAILS ==========
    // Envoi séquencé : J+1 (step 1), J+3 (step 2), J+7 (step 3), J+12 (step 4)
    let onboardingEmailsSent = 0;

    const ONBOARDING_SCHEDULE: Record<number, number> = {
      1: 1,  // step 1 → après 1 jour
      2: 3,  // step 2 → après 3 jours
      3: 7,  // step 3 → après 7 jours
      4: 12, // step 4 → après 12 jours
    };

    try {
      const trialCompanies = await prisma.company.findMany({
        where: {
          subscriptionStatus: "TRIAL",
          trialEndsAt: { not: null },
          onboardingStep: { lt: 4 },
        },
        include: {
          users: {
            where: { role: "ADMIN", emailVerified: true },
            select: { email: true, name: true },
            take: 1,
          },
        },
      });

      for (const company of trialCompanies) {
        const admin = company.users[0];
        if (!admin || !company.trialEndsAt) continue;

        const daysSinceCreation = Math.floor(
          (now.getTime() - company.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        );

        const nextStep = company.onboardingStep + 1;
        const requiredDays = ONBOARDING_SCHEDULE[nextStep];

        if (requiredDays && daysSinceCreation >= requiredDays) {
          await sendOnboardingEmail({
            to: admin.email,
            name: admin.name,
            step: nextStep,
          });

          await prisma.company.update({
            where: { id: company.id },
            data: { onboardingStep: nextStep },
          });

          onboardingEmailsSent++;
        }
      }
    } catch (error) {
      console.error("CRON onboarding error:", error);
    }

    // ========== DÉTECTION AUTO DES BESOINS ==========
    let totalNeedsCreated = 0;
    let totalNeedsUpdated = 0;

    for (const company of companies) {
      try {
        const result = await detectTrainingNeeds(company.id);
        totalNeedsCreated += result.created;
        totalNeedsUpdated += result.updated;
      } catch (error) {
        console.error(`[cron] Détection besoins ${company.name}:`, error);
      }
    }

    const totalEmployeeNotifs = byCompany.reduce(
      (sum, c) => sum + (c.employeeNotifsSent ?? 0),
      0,
    );
    const totalManagerNotifs = byCompany.reduce(
      (sum, c) => sum + (c.managerNotifsSent ?? 0),
      0,
    );

    return NextResponse.json({
      success: true,
      message: `${totalAlertsSent} alerte(s) admin, ${totalEmployeeNotifs} notif(s) employé, ${totalManagerNotifs} notif(s) manager, ${onboardingEmailsSent} onboarding email(s), ${totalNeedsCreated} besoin(s) détecté(s)`,
      alertsSent: totalAlertsSent,
      employeeNotificationsSent: totalEmployeeNotifs,
      managerNotificationsSent: totalManagerNotifs,
      onboardingEmailsSent,
      trainingNeeds: { created: totalNeedsCreated, updated: totalNeedsUpdated },
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
