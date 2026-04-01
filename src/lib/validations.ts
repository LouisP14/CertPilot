import { z } from "zod";

// ============================================
// Auth Schemas
// ============================================

export const registerSchema = z.object({
  email: z.string().email("Email invalide").transform((v) => v.trim().toLowerCase()),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  name: z.string().min(1, "Le nom est requis"),
  companyName: z.string().min(1, "Le nom de l'entreprise est requis"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
  newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
});

// ============================================
// Employee Schemas
// ============================================

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  employeeId: z.string().min(1, "Le matricule est requis"),
  position: z.string().min(1, "Le poste est requis"),
  department: z.string().min(1, "Le département est requis"),
  site: z.string().optional(),
  team: z.string().optional(),
  hourlyCost: z.union([z.string(), z.number()]).optional(),
  contractType: z.string().optional(),
  workingHoursPerDay: z.union([z.string(), z.number()]).optional(),
  managerId: z.string().optional(),
  managerEmail: z.string().email().optional().or(z.literal("")),
  medicalCheckupDate: z.string().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.extend({
  photo: z.string().optional(),
}).partial();

export const restoreEmployeeSchema = z.object({
  employeeId: z.string().min(1, "L'ID employé est requis"),
  restoreCertificates: z.boolean().optional(),
});

// ============================================
// Certificate Schemas
// ============================================

export const createCertificateSchema = z.object({
  employeeId: z.string().min(1, "L'employé est requis"),
  formationTypeId: z.string().min(1, "Le type de formation est requis"),
  obtainedDate: z.string().min(1, "La date d'obtention est requise"),
  expiryDate: z.string().optional(),
  organism: z.string().optional(),
  details: z.string().optional(),
});

export const updateCertificateSchema = z.object({
  formationTypeId: z.string().min(1, "Le type de formation est requis"),
  obtainedDate: z.string().min(1, "La date d'obtention est requise"),
  expiryDate: z.string().optional(),
  organism: z.string().optional(),
  details: z.string().optional(),
});

// ============================================
// Contact Request Schemas
// ============================================

export const contactRequestSchema = z.object({
  companyName: z.string().min(1, "Le nom de l'entreprise est requis"),
  contactName: z.string().min(1, "Le nom du contact est requis"),
  email: z.string().email("Email invalide").transform((v) => v.trim().toLowerCase()),
  phone: z.string().optional(),
  employeeCount: z.string().optional(),
  plan: z.string().optional(),
  message: z.string().optional(),
});

export const contactRequestPatchSchema = z.object({
  id: z.string().min(1, "ID requis"),
  status: z.string().optional(),
  notes: z.string().optional(),
});

// ============================================
// Formation Type Schemas
// ============================================

export const createFormationTypeSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  category: z.string().optional(),
  service: z.string().optional(),
  defaultValidityMonths: z.union([z.string(), z.number()]).optional(),
});

export const updateFormationTypeSchema = createFormationTypeSchema;

// ============================================
// Training Center Schemas
// ============================================

export const createTrainingCenterSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  code: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email("Email invalide").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  website: z.string().optional(),
  isPartner: z.boolean().optional(),
  discountPercent: z.union([z.string(), z.number()]).optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  maxCapacity: z.union([z.string(), z.number()]).optional(),
  hasOwnPremises: z.boolean().optional(),
  canTravel: z.boolean().optional(),
});

export const updateTrainingCenterSchema = createTrainingCenterSchema.extend({
  rating: z.union([z.string(), z.number()]).optional(),
});

// ============================================
// Training Center Offering Schemas
// ============================================

export const createOfferingSchema = z.object({
  formationTypeId: z.string().min(1, "Le type de formation est requis"),
  pricePerPerson: z.union([z.string(), z.number()]).optional(),
  pricePerSession: z.union([z.string(), z.number()]).optional(),
  minParticipants: z.union([z.string(), z.number()]).optional(),
  maxParticipants: z.union([z.string(), z.number()]).optional(),
  durationHours: z.union([z.string(), z.number()]).optional(),
  durationDays: z.union([z.string(), z.number()]).optional(),
  availableModes: z.array(z.string()).optional(),
  certificationCode: z.string().optional(),
  isOPCOEligible: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updateOfferingSchema = createOfferingSchema.omit({ formationTypeId: true });

// ============================================
// Convocation Schemas
// ============================================

const convocationEmployeeSchema = z.object({
  id: z.string(),
}).passthrough();

export const createConvocationSchema = z.object({
  formationId: z.string().optional(),
  formationName: z.string().min(1, "Le nom de la formation est requis"),
  startDate: z.string().min(1, "La date de début est requise"),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  employees: z.array(convocationEmployeeSchema).min(1, "Au moins un employé est requis"),
  status: z.string().optional(),
}).passthrough();

export const sendConvocationSchema = z.object({
  sessionId: z.string().optional(),
  convocationId: z.string().optional(),
  formationName: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  employees: z.array(convocationEmployeeSchema),
  pdfBase64: z.string().optional(),
});

// ============================================
// Settings Schemas
// ============================================

export const companySettingsSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  adminEmail: z.string().email("Email invalide").optional().or(z.literal("")),
});

export const alertSettingsSchema = z.object({
  alertThresholds: z.union([z.string(), z.array(z.number().int().min(0))]),
});

export const signatureSettingsSchema = z.object({
  signatureEnabled: z.boolean(),
  signatureImage: z.string().optional(),
  signatureResponsable: z.string().optional(),
  signatureTitre: z.string().optional(),
});

export const planningSettingsSchema = z.object({
  monthlyBudget: z.union([z.string(), z.number()]).optional(),
  quarterlyBudget: z.union([z.string(), z.number()]).optional(),
  yearlyBudget: z.union([z.string(), z.number()]).optional(),
  alertThresholdDays: z.union([z.string(), z.number()]).optional(),
  maxAbsentPerTeam: z.union([z.string(), z.number()]).optional(),
  maxAbsentPerSite: z.union([z.string(), z.number()]).optional(),
  maxAbsentPercent: z.union([z.string(), z.number()]).optional(),
  blacklistedDates: z.array(z.string()).optional(),
  allowedTrainingDays: z.array(z.string()).optional(),
  preferGroupSessions: z.boolean().optional(),
  preferIntraCompany: z.boolean().optional(),
  minDaysBeforeExpiry: z.union([z.string(), z.number()]).optional(),
});

export const prioritySettingsSchema = z.object({
  priorityThresholds: z.string().min(1, "Les seuils sont requis"),
});

// ============================================
// Session Schemas
// ============================================

export const createSessionSchema = z.object({
  formationTypeId: z.string().min(1, "Le type de formation est requis"),
  trainingCenterId: z.string().nullable().optional(),
  startDate: z.string().min(1, "La date de début est requise"),
  endDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().nullable().optional(),
  isIntraCompany: z.boolean().optional(),
  trainingMode: z.string().optional(),
  minParticipants: z.union([z.string(), z.number()]).optional(),
  maxParticipants: z.union([z.string(), z.number()]).optional(),
  trainingCost: z.union([z.string(), z.number()]).nullable().optional(),
  costPerPerson: z.union([z.string(), z.number()]).nullable().optional(),
  totalAbsenceCost: z.union([z.string(), z.number()]).nullable().optional(),
  totalCost: z.union([z.string(), z.number()]).nullable().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  employeeIds: z.array(z.string()).optional(),
  trainingNeedIds: z.array(z.string()).optional(),
});

export const updateSessionSchema = z.object({
  startDate: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  status: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  trainingCost: z.union([z.string(), z.number()]).optional(),
  convocationsSentAt: z.string().optional(),
}).passthrough();

export const checkConstraintsSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  employeeIds: z.array(z.string()).min(1, "Au moins un employé est requis"),
});

export const compareCostsSchema = z.object({
  formationTypeId: z.string().min(1, "Le type de formation est requis"),
  employeeIds: z.array(z.string()).min(1, "Au moins un employé est requis"),
});

// ============================================
// Training Needs Schemas
// ============================================

export const generateNeedsSchema = z.object({
  horizonDays: z.number().int().min(1).optional(),
});

export const updateNeedSchema = z.object({
  status: z.string().optional(),
  plannedSessionId: z.string().optional(),
});

// ============================================
// Signature Schema
// ============================================

export const initiateSignatureSchema = z.object({
  employeeId: z.string().min(1, "L'employé est requis"),
  siteManagerEmail: z.string().email("Email du manager invalide"),
  siteManagerName: z.string().min(1, "Le nom du manager est requis"),
});

// ============================================
// Profile Schema
// ============================================

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").optional(),
});

// ============================================
// Notification Schema
// ============================================

export const updateNotificationSchema = z.object({
  notificationId: z.string().optional(),
  markAllRead: z.boolean().optional(),
});

// ============================================
// Stripe Checkout Schema
// ============================================

export const stripeCheckoutSchema = z.object({
  plan: z.string().min(1, "Le plan est requis"),
  billing: z.string().optional(),
  contactRequestId: z.string().optional(),
  customerEmail: z.string().email("Email invalide").optional(),
  companyName: z.string().optional(),
  contactName: z.string().optional(),
});

// ============================================
// Email Payment Link Schema
// ============================================

export const paymentLinkSchema = z.object({
  to: z.string().email("Email invalide"),
  contactName: z.string().min(1),
  companyName: z.string().min(1),
  plan: z.string().min(1),
  billing: z.string().optional(),
  paymentUrl: z.string().url("URL invalide"),
});

// ============================================
// Admin Schemas
// ============================================

export const adminCreateClientSchema = z.object({
  companyName: z.string().min(1, "Le nom de l'entreprise est requis"),
  contactName: z.string().min(1, "Le nom du contact est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  plan: z.string().optional(),
  subscriptionMonths: z.number().int().min(1).optional(),
});

export const adminUpdateDemandeSchema = z.object({
  status: z.string().min(1, "Le statut est requis"),
  notes: z.string().optional(),
});

export const adminProspectionSchema = z.object({
  prospects: z.array(z.object({
    to: z.string().email("Email invalide"),
    firstName: z.string().min(1),
    company: z.string().min(1),
    sector: z.string().optional(),
  })).min(1, "Au moins un prospect est requis"),
});

// ============================================
// Helper to parse and return typed errors
// ============================================

export function parseBody<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues || [];
    const firstError = issues[0];
    return { success: false, error: firstError?.message || "Données invalides" };
  }
  return { success: true, data: result.data };
}
