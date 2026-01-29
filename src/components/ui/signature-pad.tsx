"use client";

import { Button } from "@/components/ui/button";
import { Check, Eraser, Pen, Save, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SignaturePadProps {
  initialSignature?: string | null;
  onSave: (signature: string) => void;
  onClear?: () => void;
  disabled?: boolean;
}

export function SignaturePad({
  initialSignature,
  onSave,
  onClear,
  disabled,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [mode, setMode] = useState<"draw" | "upload">("draw");

  // Redimensionner le canvas pour qu'il s'adapte au conteneur
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Sauvegarder le contenu actuel
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Redimensionner le canvas
      const containerWidth = container.clientWidth - 8; // -8 pour le padding
      canvas.width = Math.max(containerWidth, 300);
      canvas.height = 150;

      // Restaurer les paramètres du contexte
      ctx.strokeStyle = "#1e3a8a";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Restaurer le contenu si possible
      if (imageData.width > 0 && imageData.height > 0) {
        ctx.putImageData(imageData, 0, 0);
      } else {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Configuration du canvas
    ctx.strokeStyle = "#1e3a8a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Charger la signature existante
    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasDrawn(true);
      };
      img.src = initialSignature;
    } else {
      // Fond blanc
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [initialSignature]);

  // Fonction pour obtenir les coordonnées ajustées au ratio du canvas
  const getCanvasCoordinates = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (disabled || mode === "upload") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    setIsSaved(false); // Réinitialiser si on redessine

    const { x, y } = getCanvasCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing || disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if ("touches" in e) {
      e.preventDefault();
    }

    const { x, y } = getCanvasCoordinates(e);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setIsSaved(false);

    // Notifier le parent que la signature a été effacée
    if (onClear) {
      onClear();
    }
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
    setIsSaved(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Redimensionner l'image pour qu'elle tienne dans le canvas
        const scale =
          Math.min(canvas.width / img.width, canvas.height / img.height) * 0.9;
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        setHasDrawn(true);
        setIsSaved(false); // Réinitialiser si on importe une nouvelle image
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      {/* Mode switcher */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "draw" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("draw")}
          disabled={disabled}
        >
          <Pen className="mr-2 h-4 w-4" />
          Dessiner
        </Button>
        <Button
          type="button"
          variant={mode === "upload" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("upload")}
          disabled={disabled}
        >
          <Upload className="mr-2 h-4 w-4" />
          Importer
        </Button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative rounded-lg border-2 border-dashed border-gray-300 bg-white p-1 w-full"
      >
        <canvas
          ref={canvasRef}
          height={150}
          className={`w-full touch-none ${disabled ? "opacity-50 cursor-not-allowed" : mode === "draw" ? "cursor-crosshair" : "cursor-default"}`}
          style={{ display: "block" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasDrawn && !disabled && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-gray-400">
            {mode === "draw"
              ? "Signez ici avec la souris ou le doigt"
              : "Importez une image de signature"}
          </div>
        )}
      </div>

      {/* Upload input (hidden) */}
      {mode === "upload" && (
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
          disabled={disabled}
        />
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearCanvas}
            disabled={disabled || !hasDrawn}
          >
            <Eraser className="mr-2 h-4 w-4" />
            Effaceur
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={disabled || !hasDrawn || isSaved}
            className={
              hasDrawn && !isSaved
                ? "animate-pulse bg-blue-600 hover:bg-blue-700"
                : isSaved
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
            }
          >
            {isSaved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Signature enregistrée ✓
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer la signature
              </>
            )}
          </Button>
        </div>

        {/* Message d'aide */}
        <div className="min-h-[24px]">
          {hasDrawn && !isSaved ? (
            <p className="text-sm text-amber-600 font-medium flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              Cliquez sur &quot;Enregistrer la signature&quot; pour valider
              votre signature
            </p>
          ) : isSaved ? (
            <p className="text-sm text-green-600 font-medium flex items-center gap-1">
              <Check className="h-4 w-4" />
              Signature prête ! Vous pouvez maintenant valider ci-dessous.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// Composant d'affichage de la signature (pour le passeport)
export function SignatureDisplay({
  signature,
  responsable,
  titre,
  date,
}: {
  signature: string;
  responsable: string;
  titre?: string;
  date?: Date;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={signature}
        alt="Signature du responsable"
        className="h-16 w-auto"
      />
      <div className="mt-1 border-t border-gray-300 pt-1">
        <p className="text-sm font-semibold text-gray-800">{responsable}</p>
        {titre && <p className="text-xs text-gray-500">{titre}</p>}
        {date && (
          <p className="text-xs text-gray-400">
            Signé le {new Date(date).toLocaleDateString("fr-FR")}
          </p>
        )}
      </div>
    </div>
  );
}
