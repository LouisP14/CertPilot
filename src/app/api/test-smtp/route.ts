import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  const config = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    user: process.env.SMTP_USER,
    from: process.env.SMTP_FROM,
    hasPassword: !!process.env.SMTP_PASSWORD,
  };

  console.log("=== TEST SMTP ===");
  console.log("Config:", config);

  // Test 1: Port 465 avec SSL
  const tests = [
    { port: 465, secure: true, name: "Port 465 SSL" },
    { port: 587, secure: false, name: "Port 587 STARTTLS" },
  ];

  const results = [];

  for (const test of tests) {
    console.log(`\nTest: ${test.name}...`);
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "ssl0.ovh.net",
        port: test.port,
        secure: test.secure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        tls: {
          rejectUnauthorized: false,
        },
      });

      await transporter.verify();
      console.log(`✅ ${test.name} - SUCCÈS`);
      results.push({ test: test.name, success: true });

      // Si ça marche, envoyer un email de test
      try {
        await transporter.sendMail({
          from: `"CertPilot" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
          to: process.env.SMTP_USER, // S'envoyer à soi-même
          subject: "Test SMTP CertPilot",
          text: `Test réussi avec ${test.name} à ${new Date().toISOString()}`,
        });
        console.log(`📧 Email test envoyé avec ${test.name}`);
        results.push({ test: `${test.name} - Email envoyé`, success: true });
      } catch (emailErr) {
        const msg = emailErr instanceof Error ? emailErr.message : "Erreur";
        console.log(`❌ Email échoué: ${msg}`);
        results.push({
          test: `${test.name} - Email`,
          success: false,
          error: msg,
        });
      }

      break; // Arrêter si un test réussit
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      console.log(`❌ ${test.name} - ÉCHEC: ${msg}`);
      results.push({ test: test.name, success: false, error: msg });
    }
  }

  return NextResponse.json({
    config,
    results,
    timestamp: new Date().toISOString(),
  });
}
