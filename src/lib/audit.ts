/**
 * Audit Trail - Système de traçabilité CertPilot
 * Enregistre toutes les actions importantes pour conformité et audit
 */

import { prisma } from "./prisma";

// Types d'actions
export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "SIGN"
  | "SEND_CONVOCATION"
  | "EXPORT_PDF"
  | "UPLOAD"
  | "LOGIN"
  | "LOGOUT"
  | "PLAN_SESSION"
  | "CANCEL_SESSION"
  | "IMPORT";

// Types d'entités
export type AuditEntityType =
  | "EMPLOYEE"
  | "CERTIFICATE"
  | "FORMATION_TYPE"
  | "TRAINING_SESSION"
  | "CONVOCATION"
  | "SIGNATURE"
  | "COMPANY"
  | "REFERENCE"
  | "USER"
  | "SETTINGS"
  | "PLANNING_CONSTRAINTS"
  | "TRAINING_CENTER"
  | "OFFERING";

export interface AuditLogInput {
  // Qui
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  companyId?: string | null;

  // Quoi
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string | null;
  entityName?: string | null;

  // Détails
  description: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;

  // Contexte (optionnel, rempli automatiquement si possible)
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Crée un log d'audit
 */
export async function createAuditLog(input: AuditLogInput) {
  try {
    let companyId = input.companyId ?? null;
    if (!companyId && (input.userId || input.userEmail)) {
      try {
        const user = await prisma.user.findUnique({
          where: input.userId
            ? { id: input.userId }
            : { email: input.userEmail as string },
          select: { companyId: true },
        });
        companyId = user?.companyId ?? null;
      } catch (lookupError) {
        console.warn("[AUDIT] Impossible de résoudre companyId:", lookupError);
      }
    }

    const log = await prisma.auditLog.create({
      data: {
        userId: input.userId,
        userName: input.userName,
        userEmail: input.userEmail,
        companyId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        entityName: input.entityName,
        description: input.description,
        oldValues: input.oldValues ? JSON.stringify(input.oldValues) : null,
        newValues: input.newValues ? JSON.stringify(input.newValues) : null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
    return log;
  } catch (error) {
    // Ne pas bloquer l'application si l'audit échoue
    console.error("[AUDIT] Erreur lors de la création du log:", error);
    return null;
  }
}

/**
 * Helper pour auditer une création
 */
export async function auditCreate(
  entityType: AuditEntityType,
  entityId: string,
  entityName: string,
  newValues: Record<string, unknown>,
  user?: {
    id?: string;
    name?: string;
    email?: string;
    companyId?: string | null;
  } | null,
) {
  return createAuditLog({
    userId: user?.id,
    userName: user?.name,
    userEmail: user?.email,
    companyId: user?.companyId,
    action: "CREATE",
    entityType,
    entityId,
    entityName,
    description: `Création de ${getEntityLabel(entityType)} : ${entityName}`,
    newValues,
  });
}

/**
 * Helper pour auditer une modification
 */
export async function auditUpdate(
  entityType: AuditEntityType,
  entityId: string,
  entityName: string,
  oldValues: Record<string, unknown>,
  newValues: Record<string, unknown>,
  user?: {
    id?: string;
    name?: string;
    email?: string;
    companyId?: string | null;
  } | null,
) {
  // Calculer les champs modifiés
  const changedFields = Object.keys(newValues).filter(
    (key) => JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key]),
  );

  return createAuditLog({
    userId: user?.id,
    userName: user?.name,
    userEmail: user?.email,
    companyId: user?.companyId,
    action: "UPDATE",
    entityType,
    entityId,
    entityName,
    description: `Modification de ${getEntityLabel(entityType)} : ${entityName} (${changedFields.join(", ")})`,
    oldValues,
    newValues,
    metadata: { changedFields },
  });
}

/**
 * Helper pour auditer une suppression
 */
export async function auditDelete(
  entityType: AuditEntityType,
  entityId: string,
  entityName: string,
  oldValues: Record<string, unknown>,
  user?: {
    id?: string;
    name?: string;
    email?: string;
    companyId?: string | null;
  } | null,
) {
  return createAuditLog({
    userId: user?.id,
    userName: user?.name,
    userEmail: user?.email,
    companyId: user?.companyId,
    action: "DELETE",
    entityType,
    entityId,
    entityName,
    description: `Suppression de ${getEntityLabel(entityType)} : ${entityName}`,
    oldValues,
  });
}

/**
 * Helper pour auditer une signature
 */
export async function auditSign(
  employeeId: string,
  entityName: string,
  signataire: string,
  typeSignature: "EMPLOYEE" | "MANAGER",
  companyId?: string | null,
) {
  return createAuditLog({
    companyId,
    action: "SIGN",
    entityType: "SIGNATURE",
    entityId: employeeId,
    entityName,
    description: `Signature ${typeSignature === "MANAGER" ? "responsable" : "employé"} : ${signataire} sur ${entityName}`,
    metadata: { signataire, typeSignature, employeeId },
  });
}

/**
 * Helper pour auditer l'envoi d'une convocation
 */
export async function auditSendConvocation(
  employeeId: string,
  employeeName: string,
  sessionInfo: string,
  email: string,
  user?: {
    id?: string;
    name?: string;
    email?: string;
    companyId?: string | null;
  } | null,
) {
  return createAuditLog({
    userId: user?.id,
    userName: user?.name,
    userEmail: user?.email,
    companyId: user?.companyId,
    action: "SEND_CONVOCATION",
    entityType: "CONVOCATION",
    entityId: employeeId,
    entityName: `Convocation ${employeeName}`,
    description: `Envoi de convocation à ${employeeName} (${email}) pour ${sessionInfo}`,
    metadata: { employeeId, email, sessionInfo },
  });
}

/**
 * Helper pour auditer un export PDF
 */
export async function auditExportPdf(
  entityType: AuditEntityType,
  entityId: string,
  entityName: string,
  user?: {
    id?: string;
    name?: string;
    email?: string;
    companyId?: string | null;
  } | null,
) {
  return createAuditLog({
    userId: user?.id,
    userName: user?.name,
    userEmail: user?.email,
    companyId: user?.companyId,
    action: "EXPORT_PDF",
    entityType,
    entityId,
    entityName,
    description: `Export PDF de ${getEntityLabel(entityType)} : ${entityName}`,
  });
}

/**
 * Helper pour auditer la planification d'une session
 */
export async function auditPlanSession(
  sessionId: string,
  formationName: string,
  sessionType: "INTER" | "INTRA",
  participants: number,
  date: string,
  user?: {
    id?: string;
    name?: string;
    email?: string;
    companyId?: string | null;
  } | null,
) {
  return createAuditLog({
    userId: user?.id,
    userName: user?.name,
    userEmail: user?.email,
    companyId: user?.companyId,
    action: "PLAN_SESSION",
    entityType: "TRAINING_SESSION",
    entityId: sessionId,
    entityName: `Session ${formationName}`,
    description: `Planification session ${sessionType} : ${formationName} (${participants} participants) le ${date}`,
    metadata: { sessionType, participants, date },
  });
}

/**
 * Récupère les logs d'audit avec filtres et pagination
 */
export async function getAuditLogs(options?: {
  entityType?: AuditEntityType;
  entityId?: string;
  action?: AuditAction;
  userId?: string;
  companyId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const {
    entityType,
    entityId,
    action,
    userId,
    companyId,
    startDate,
    endDate,
    search,
    page = 1,
    limit = 50,
  } = options || {};

  const where: Record<string, unknown> = {};

  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  if (action) where.action = action;
  if (userId) where.userId = userId;
  if (companyId) where.companyId = companyId;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) (where.createdAt as Record<string, Date>).gte = startDate;
    if (endDate) (where.createdAt as Record<string, Date>).lte = endDate;
  }

  if (search) {
    where.OR = [
      { description: { contains: search } },
      { entityName: { contains: search } },
      { userName: { contains: search } },
    ];
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs: logs.map((log) => ({
      ...log,
      oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
      newValues: log.newValues ? JSON.parse(log.newValues) : null,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Récupère l'historique d'une entité spécifique
 */
export async function getEntityHistory(
  entityType: AuditEntityType,
  entityId: string,
  companyId?: string,
) {
  const where: {
    entityType: AuditEntityType;
    entityId: string;
    companyId?: string;
  } = {
    entityType,
    entityId,
  };

  if (companyId) {
    where.companyId = companyId;
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return logs.map((log) => ({
    ...log,
    oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
    newValues: log.newValues ? JSON.parse(log.newValues) : null,
    metadata: log.metadata ? JSON.parse(log.metadata) : null,
  }));
}

/**
 * Labels français pour les types d'entités
 */
function getEntityLabel(entityType: AuditEntityType): string {
  const labels: Record<AuditEntityType, string> = {
    EMPLOYEE: "l'employé",
    CERTIFICATE: "le certificat",
    FORMATION_TYPE: "la formation",
    TRAINING_SESSION: "la session",
    CONVOCATION: "la convocation",
    SIGNATURE: "la signature",
    COMPANY: "l'entreprise",
    REFERENCE: "le référentiel",
    USER: "l'utilisateur",
    SETTINGS: "les paramètres",
    PLANNING_CONSTRAINTS: "les contraintes de planification",
    TRAINING_CENTER: "le centre de formation",
    OFFERING: "l'offre",
  };
  return labels[entityType] || entityType;
}

/**
 * Labels français pour les actions
 */
export function getActionLabel(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    CREATE: "Création",
    UPDATE: "Modification",
    DELETE: "Suppression",
    SIGN: "Signature",
    SEND_CONVOCATION: "Envoi convocation",
    EXPORT_PDF: "Export PDF",
    UPLOAD: "Upload fichier",
    LOGIN: "Connexion",
    LOGOUT: "Déconnexion",
    PLAN_SESSION: "Planification session",
    CANCEL_SESSION: "Annulation session",
    IMPORT: "Import données",
  };
  return labels[action] || action;
}

/**
 * Couleurs pour les actions (pour l'UI)
 */
export function getActionColor(action: AuditAction): string {
  const colors: Record<AuditAction, string> = {
    CREATE: "bg-green-100 text-green-800",
    UPDATE: "bg-blue-100 text-blue-800",
    DELETE: "bg-red-100 text-red-800",
    SIGN: "bg-purple-100 text-purple-800",
    SEND_CONVOCATION: "bg-indigo-100 text-indigo-800",
    EXPORT_PDF: "bg-gray-100 text-gray-800",
    UPLOAD: "bg-cyan-100 text-cyan-800",
    LOGIN: "bg-emerald-100 text-emerald-800",
    LOGOUT: "bg-amber-100 text-amber-800",
    PLAN_SESSION: "bg-teal-100 text-teal-800",
    CANCEL_SESSION: "bg-orange-100 text-orange-800",
    IMPORT: "bg-violet-100 text-violet-800",
  };
  return colors[action] || "bg-gray-100 text-gray-800";
}

/**
 * Icônes pour les types d'entités (nom Lucide)
 */
export function getEntityIcon(entityType: AuditEntityType): string {
  const icons: Record<AuditEntityType, string> = {
    EMPLOYEE: "User",
    CERTIFICATE: "Award",
    FORMATION_TYPE: "GraduationCap",
    TRAINING_SESSION: "Calendar",
    CONVOCATION: "Mail",
    SIGNATURE: "PenTool",
    COMPANY: "Building",
    REFERENCE: "List",
    USER: "UserCog",
    SETTINGS: "Settings",
    PLANNING_CONSTRAINTS: "Shield",
    TRAINING_CENTER: "Building",
    OFFERING: "FileText",
  };
  return icons[entityType] || "FileText";
}
