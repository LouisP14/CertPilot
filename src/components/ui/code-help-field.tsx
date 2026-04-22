"use client";

import type { CodeEntry } from "@/lib/passeport-prevention-codes";
import { HelpCircle, Plus, X } from "lucide-react";
import { useState } from "react";
import { Input } from "./input";
import { Label } from "./label";

interface CodeHelpFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  codes: CodeEntry[];
  placeholder?: string;
  separator?: string; // "/" pour multi-valeurs, vide pour valeur unique
  maxLength?: number;
  description?: string;
}

export function CodeHelpField({
  id,
  label,
  value,
  onChange,
  codes,
  placeholder,
  separator = "/",
  maxLength,
  description,
}: CodeHelpFieldProps) {
  const [helpOpen, setHelpOpen] = useState(false);

  const appendCode = (code: string) => {
    if (!separator) {
      // Valeur unique : remplace
      onChange(code);
      return;
    }
    // Multi-valeurs : ajoute au bout si pas déjà présent
    const existing = value
      .split(separator)
      .map((v) => v.trim())
      .filter(Boolean);
    if (existing.includes(code)) return;
    onChange(existing.concat(code).join(separator));
  };

  const clearValue = () => onChange("");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <button
          type="button"
          onClick={() => setHelpOpen((v) => !v)}
          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
          aria-label={`Aide sur ${label}`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          {helpOpen ? "Masquer" : "Voir les codes"}
        </button>
      </div>
      <div className="relative">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={value ? "pr-8" : undefined}
        />
        {value && (
          <button
            type="button"
            onClick={clearValue}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Effacer le champ"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      {helpOpen && (
        <div className="max-h-56 overflow-y-auto rounded-lg border border-emerald-200 bg-white shadow-sm">
          <div className="sticky top-0 border-b border-emerald-100 bg-emerald-50 px-3 py-2">
            <p className="text-xs font-semibold text-emerald-800">
              Cliquez sur un code pour l&apos;ajouter
            </p>
          </div>
          <ul className="divide-y divide-gray-100">
            {codes.map((c) => {
              const isUsed = separator
                ? value.split(separator).map((v) => v.trim()).includes(c.code)
                : value === c.code;
              return (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => appendCode(c.code)}
                    disabled={isUsed}
                    className="group flex w-full items-start gap-2 px-3 py-2 text-left transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus
                      className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isUsed ? "text-gray-300" : "text-emerald-500"}`}
                    />
                    <div className="flex-1 text-xs">
                      <code className="font-mono font-semibold text-[#173B56]">
                        {c.code}
                      </code>
                      <span className="ml-2 text-gray-600">{c.label}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}