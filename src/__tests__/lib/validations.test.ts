import { describe, expect, it } from "vitest";
import {
  contactRequestSchema,
  createCertificateSchema,
  createEmployeeSchema,
  parseBody,
  registerSchema,
} from "@/lib/validations";

describe("registerSchema", () => {
  it("should validate a correct registration", () => {
    const result = registerSchema.safeParse({
      email: "Test@Example.com",
      password: "password123",
      name: "John Doe",
      companyName: "ACME Inc",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@example.com"); // trimmed + lowercased
    }
  });

  it("should reject invalid email", () => {
    const result = registerSchema.safeParse({
      email: "not-an-email",
      password: "password123",
      name: "John",
      companyName: "ACME",
    });
    expect(result.success).toBe(false);
  });

  it("should reject short password", () => {
    const result = registerSchema.safeParse({
      email: "test@test.com",
      password: "short",
      name: "John",
      companyName: "ACME",
    });
    expect(result.success).toBe(false);
  });

  it("should reject missing fields", () => {
    const result = registerSchema.safeParse({
      email: "test@test.com",
    });
    expect(result.success).toBe(false);
  });
});

describe("createEmployeeSchema", () => {
  it("should validate a correct employee", () => {
    const result = createEmployeeSchema.safeParse({
      firstName: "Jean",
      lastName: "Dupont",
      employeeId: "EMP001",
      position: "Technicien",
      department: "Maintenance",
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing required fields", () => {
    const result = createEmployeeSchema.safeParse({
      firstName: "Jean",
    });
    expect(result.success).toBe(false);
  });

  it("should accept optional fields", () => {
    const result = createEmployeeSchema.safeParse({
      firstName: "Jean",
      lastName: "Dupont",
      employeeId: "EMP001",
      position: "Technicien",
      department: "Maintenance",
      email: "jean@test.com",
      site: "Paris",
      team: "A",
      hourlyCost: "25.5",
    });
    expect(result.success).toBe(true);
  });

  it("should allow empty email", () => {
    const result = createEmployeeSchema.safeParse({
      firstName: "Jean",
      lastName: "Dupont",
      employeeId: "EMP001",
      position: "Technicien",
      department: "Maintenance",
      email: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("createCertificateSchema", () => {
  it("should validate a correct certificate", () => {
    const result = createCertificateSchema.safeParse({
      employeeId: "emp123",
      formationTypeId: "ft456",
      obtainedDate: "2025-01-15",
    });
    expect(result.success).toBe(true);
  });

  it("should reject missing employeeId", () => {
    const result = createCertificateSchema.safeParse({
      formationTypeId: "ft456",
      obtainedDate: "2025-01-15",
    });
    expect(result.success).toBe(false);
  });

  it("should accept optional expiry date", () => {
    const result = createCertificateSchema.safeParse({
      employeeId: "emp123",
      formationTypeId: "ft456",
      obtainedDate: "2025-01-15",
      expiryDate: "2027-01-15",
      organism: "AFPA",
    });
    expect(result.success).toBe(true);
  });
});

describe("contactRequestSchema", () => {
  it("should validate a correct contact request", () => {
    const result = contactRequestSchema.safeParse({
      companyName: "ACME",
      contactName: "John",
      email: "John@ACME.com",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("john@acme.com");
    }
  });

  it("should reject invalid email", () => {
    const result = contactRequestSchema.safeParse({
      companyName: "ACME",
      contactName: "John",
      email: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("should accept optional fields", () => {
    const result = contactRequestSchema.safeParse({
      companyName: "ACME",
      contactName: "John",
      email: "john@acme.com",
      phone: "0612345678",
      plan: "starter",
      message: "Hello",
    });
    expect(result.success).toBe(true);
  });
});

describe("parseBody", () => {
  it("should return success with parsed data", () => {
    const result = parseBody(registerSchema, {
      email: "test@test.com",
      password: "password123",
      name: "Test",
      companyName: "ACME",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("test@test.com");
    }
  });

  it("should return error message on failure", () => {
    const result = parseBody(registerSchema, { email: "invalid" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
      expect(typeof result.error).toBe("string");
    }
  });
});
