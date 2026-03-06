import { describe, expect, it } from "vitest";
import {
  changePasswordSchema,
  createFormationTypeSchema,
  createTrainingCenterSchema,
  updateTrainingCenterSchema,
  createOfferingSchema,
  contactRequestPatchSchema,
  restoreEmployeeSchema,
  updateCertificateSchema,
  updateEmployeeSchema,
  parseBody,
} from "@/lib/validations";

describe("changePasswordSchema", () => {
  it("should validate correct password change", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "oldpass123",
      newPassword: "newpass123",
    });
    expect(result.success).toBe(true);
  });

  it("should reject short new password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "oldpass123",
      newPassword: "short",
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty current password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "",
      newPassword: "newpass123",
    });
    expect(result.success).toBe(false);
  });
});

describe("createFormationTypeSchema", () => {
  it("should validate with name only", () => {
    const result = createFormationTypeSchema.safeParse({
      name: "CACES R489",
    });
    expect(result.success).toBe(true);
  });

  it("should accept optional fields", () => {
    const result = createFormationTypeSchema.safeParse({
      name: "CACES R489",
      category: "CACES",
      service: "Logistique",
      defaultValidityMonths: 60,
    });
    expect(result.success).toBe(true);
  });

  it("should accept string defaultValidityMonths", () => {
    const result = createFormationTypeSchema.safeParse({
      name: "SST",
      defaultValidityMonths: "24",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty name", () => {
    const result = createFormationTypeSchema.safeParse({
      name: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("createTrainingCenterSchema", () => {
  it("should validate with name only", () => {
    const result = createTrainingCenterSchema.safeParse({
      name: "Centre Formation Paris",
    });
    expect(result.success).toBe(true);
  });

  it("should accept all optional fields", () => {
    const result = createTrainingCenterSchema.safeParse({
      name: "Centre Formation Paris",
      code: "CFP-01",
      address: "1 rue de la Paix",
      city: "Paris",
      postalCode: "75001",
      country: "France",
      contactName: "Jean Martin",
      contactEmail: "jean@centre.fr",
      contactPhone: "0123456789",
      website: "https://centre.fr",
      isPartner: true,
      discountPercent: 10,
      paymentTerms: "30 jours",
      notes: "Excellent centre",
      maxCapacity: 20,
      hasOwnPremises: true,
      canTravel: false,
    });
    expect(result.success).toBe(true);
  });

  it("should accept string discountPercent", () => {
    const result = createTrainingCenterSchema.safeParse({
      name: "Centre",
      discountPercent: "15.5",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid contact email", () => {
    const result = createTrainingCenterSchema.safeParse({
      name: "Centre",
      contactEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  it("should accept empty contact email", () => {
    const result = createTrainingCenterSchema.safeParse({
      name: "Centre",
      contactEmail: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateTrainingCenterSchema", () => {
  it("should accept rating as number", () => {
    const result = updateTrainingCenterSchema.safeParse({
      name: "Centre",
      rating: 4.5,
    });
    expect(result.success).toBe(true);
  });

  it("should accept rating as string", () => {
    const result = updateTrainingCenterSchema.safeParse({
      name: "Centre",
      rating: "4.5",
    });
    expect(result.success).toBe(true);
  });
});

describe("createOfferingSchema", () => {
  it("should validate with required fields", () => {
    const result = createOfferingSchema.safeParse({
      formationTypeId: "ft-123",
      pricePerPerson: 350,
    });
    expect(result.success).toBe(true);
  });

  it("should accept string prices", () => {
    const result = createOfferingSchema.safeParse({
      formationTypeId: "ft-123",
      pricePerPerson: "350",
      pricePerSession: "2500",
    });
    expect(result.success).toBe(true);
  });

  it("should accept availableModes array", () => {
    const result = createOfferingSchema.safeParse({
      formationTypeId: "ft-123",
      availableModes: ["PRESENTIEL", "DISTANCIEL"],
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty formationTypeId", () => {
    const result = createOfferingSchema.safeParse({
      formationTypeId: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("contactRequestPatchSchema", () => {
  it("should validate with id and status", () => {
    const result = contactRequestPatchSchema.safeParse({
      id: "req-123",
      status: "CONTACTED",
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing id", () => {
    const result = contactRequestPatchSchema.safeParse({
      status: "CONTACTED",
    });
    expect(result.success).toBe(false);
  });
});

describe("restoreEmployeeSchema", () => {
  it("should validate with required employeeId", () => {
    const result = restoreEmployeeSchema.safeParse({
      employeeId: "emp-123",
    });
    expect(result.success).toBe(true);
  });

  it("should accept restoreCertificates", () => {
    const result = restoreEmployeeSchema.safeParse({
      employeeId: "emp-123",
      restoreCertificates: true,
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty employeeId", () => {
    const result = restoreEmployeeSchema.safeParse({
      employeeId: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateEmployeeSchema (partial)", () => {
  it("should validate with only some fields", () => {
    const result = updateEmployeeSchema.safeParse({
      firstName: "Jean",
      lastName: "Dupont",
    });
    expect(result.success).toBe(true);
  });

  it("should validate with empty object", () => {
    const result = updateEmployeeSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should accept photo field", () => {
    const result = updateEmployeeSchema.safeParse({
      photo: "data:image/png;base64,abc123",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateCertificateSchema", () => {
  it("should validate correct data", () => {
    const result = updateCertificateSchema.safeParse({
      formationTypeId: "ft-123",
      obtainedDate: "2025-06-15",
      expiryDate: "2027-06-15",
      organism: "AFPA",
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing formationTypeId", () => {
    const result = updateCertificateSchema.safeParse({
      obtainedDate: "2025-06-15",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing obtainedDate", () => {
    const result = updateCertificateSchema.safeParse({
      formationTypeId: "ft-123",
    });
    expect(result.success).toBe(false);
  });
});

describe("parseBody edge cases", () => {
  it("should handle null input", () => {
    const result = parseBody(changePasswordSchema, null);
    expect(result.success).toBe(false);
  });

  it("should handle undefined input", () => {
    const result = parseBody(changePasswordSchema, undefined);
    expect(result.success).toBe(false);
  });

  it("should handle non-object input", () => {
    const result = parseBody(changePasswordSchema, "string");
    expect(result.success).toBe(false);
  });

  it("should handle array input", () => {
    const result = parseBody(changePasswordSchema, []);
    expect(result.success).toBe(false);
  });
});
