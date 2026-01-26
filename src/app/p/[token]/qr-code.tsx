"use client";

import { Printer } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useRef } from "react";

interface QRCodeDisplayProps {
  token: string;
  employeeName?: string;
}

export default function QRCodeDisplay({
  token,
  employeeName,
}: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const printCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const url = `${window.location.origin}/p/${token}`;
      QRCode.toCanvas(canvasRef.current, url, {
        width: 128,
        margin: 2,
        color: {
          dark: "#1e40af",
          light: "#ffffff",
        },
      });
    }
    // Créer une version plus grande pour l'impression
    if (printCanvasRef.current) {
      const url = `${window.location.origin}/p/${token}`;
      QRCode.toCanvas(printCanvasRef.current, url, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
    }
  }, [token]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && printCanvasRef.current) {
      const qrDataUrl = printCanvasRef.current.toDataURL("image/png");
      const url = `${window.location.origin}/p/${token}`;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - ${employeeName || "Passeport Formation"}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              @page {
                size: A4;
                margin: 15mm;
              }
              html, body {
                width: 100%;
                height: 100%;
              }
              body {
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
                background: white;
              }
              .container {
                text-align: center;
                padding: 30px;
                border: 3px solid #1e40af;
                border-radius: 16px;
                background: white;
                max-width: 350px;
                page-break-inside: avoid;
              }
              .title {
                font-size: 18px;
                font-weight: bold;
                color: #1e40af;
                margin-bottom: 12px;
                letter-spacing: 2px;
              }
              .name {
                font-size: 20px;
                font-weight: bold;
                color: #111827;
                margin-bottom: 20px;
              }
              .qr-code {
                display: block;
                margin: 0 auto 20px;
                max-width: 100%;
                height: auto;
              }
              .url {
                font-size: 11px;
                color: #6b7280;
                word-break: break-all;
                max-width: 280px;
                margin: 0 auto;
              }
              .footer {
                margin-top: 15px;
                font-size: 12px;
                color: #6b7280;
              }
              @media print {
                body {
                  print-color-adjust: exact;
                  -webkit-print-color-adjust: exact;
                }
                .container {
                  border-color: #1e40af !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="title">PASSEPORT FORMATION</div>
              ${employeeName ? `<div class="name">${employeeName}</div>` : ""}
              <img src="${qrDataUrl}" alt="QR Code" class="qr-code" width="250" height="250" />
              <div class="url">${url}</div>
              <div class="footer">Scanner pour accéder au passeport</div>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 100);
                window.onafterprint = function() {
                  window.close();
                };
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="rounded-lg border-2 border-blue-100 p-2">
        <canvas ref={canvasRef} />
      </div>
      {/* Canvas caché pour l'impression */}
      <canvas ref={printCanvasRef} className="hidden" />
      <button
        onClick={handlePrint}
        className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
      >
        <Printer className="h-4 w-4" />
        Imprimer le QR Code
      </button>
    </div>
  );
}
