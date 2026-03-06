import { describe, expect, it } from "vitest";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("should allow requests within limit", () => {
    const key = `test-allow-${Date.now()}`;
    const result = rateLimit(key, { limit: 3, windowSeconds: 60 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("should track count across multiple calls", () => {
    const key = `test-track-${Date.now()}`;
    rateLimit(key, { limit: 3, windowSeconds: 60 });
    rateLimit(key, { limit: 3, windowSeconds: 60 });
    const result = rateLimit(key, { limit: 3, windowSeconds: 60 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("should reject requests over the limit", () => {
    const key = `test-reject-${Date.now()}`;
    rateLimit(key, { limit: 2, windowSeconds: 60 });
    rateLimit(key, { limit: 2, windowSeconds: 60 });
    const result = rateLimit(key, { limit: 2, windowSeconds: 60 });
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should use different counters for different keys", () => {
    const key1 = `test-key1-${Date.now()}`;
    const key2 = `test-key2-${Date.now()}`;
    rateLimit(key1, { limit: 1, windowSeconds: 60 });
    rateLimit(key1, { limit: 1, windowSeconds: 60 });
    const result = rateLimit(key2, { limit: 1, windowSeconds: 60 });
    expect(result.success).toBe(true);
  });
});

describe("getClientIp", () => {
  it("should return x-forwarded-for IP", () => {
    const request = new Request("http://localhost", {
      headers: { "x-forwarded-for": "192.168.1.1, 10.0.0.1" },
    });
    expect(getClientIp(request)).toBe("192.168.1.1");
  });

  it("should return x-real-ip if no forwarded header", () => {
    const request = new Request("http://localhost", {
      headers: { "x-real-ip": "10.0.0.1" },
    });
    expect(getClientIp(request)).toBe("10.0.0.1");
  });

  it("should return 'unknown' when no IP headers", () => {
    const request = new Request("http://localhost");
    expect(getClientIp(request)).toBe("unknown");
  });
});
