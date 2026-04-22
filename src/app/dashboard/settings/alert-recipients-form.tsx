"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export interface AlertRecipientAdmin {
  id: string;
  name: string;
  email: string;
  receivesHabilitationAlerts: boolean;
  receivesPPAlerts: boolean;
}

interface AlertRecipientsFormProps {
  admins: AlertRecipientAdmin[];
  companyAdminEmail: string | null;
}

export function AlertRecipientsForm({
  admins,
  companyAdminEmail,
}: AlertRecipientsFormProps) {
  const router = useRouter();
  const [rows, setRows] = useState<AlertRecipientAdmin[]>(admins);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const togglePref = (
    userId: string,
    key: "receivesHabilitationAlerts" | "receivesPPAlerts",
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.id === userId ? { ...r, [key]: !r[key] } : r)),
    );
  };

  const habRecipients = rows.filter((r) => r.receivesHabilitationAlerts);
  const ppRecipients = rows.filter((r) => r.receivesPPAlerts);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/settings/alert-recipients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: rows.map((r) => ({
            userId: r.id,
            receivesHabilitationAlerts: r.receivesHabilitationAlerts,
            receivesPPAlerts: r.receivesPPAlerts,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Une erreur est survenue");
      }

      setSuccess(true);
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Aucun administrateur actif dans la société. Les alertes seront envoyées
        uniquement à l&apos;email administrateur de l&apos;entreprise
        {companyAdminEmail ? (
          <>
            {" "}(<strong>{companyAdminEmail}</strong>).
          </>
        ) : (
          <> (aucun configuré).</>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        Cochez les administrateurs qui doivent recevoir chaque type d&apos;alerte
        par email. Si aucun admin n&apos;est coché pour un type, l&apos;alerte
        sera envoyée à l&apos;email administrateur de l&apos;entreprise
        {companyAdminEmail ? (
          <>
            {" "}(<strong>{companyAdminEmail}</strong>)
          </>
        ) : null}
        .
      </p>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
              <th className="px-4 py-3">Administrateur</th>
              <th className="px-4 py-3 text-center">
                Alertes habilitations
                <div className="mt-0.5 text-[10px] font-normal normal-case text-gray-500">
                  Expiration à J-90/60/30/7
                </div>
              </th>
              <th className="px-4 py-3 text-center">
                Rappels Passeport Prévention
                <div className="mt-0.5 text-[10px] font-normal normal-case text-gray-500">
                  Déclarations à effectuer
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {rows.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{admin.name}</div>
                  <div className="text-xs text-gray-500">{admin.email}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={admin.receivesHabilitationAlerts}
                    onChange={() =>
                      togglePref(admin.id, "receivesHabilitationAlerts")
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label={`Alertes habilitations pour ${admin.name}`}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={admin.receivesPPAlerts}
                    onChange={() => togglePref(admin.id, "receivesPPAlerts")}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label={`Rappels PP pour ${admin.name}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
          Alertes habilitations : {habRecipients.length}{" "}
          {habRecipients.length <= 1 ? "destinataire" : "destinataires"}
        </span>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
          Rappels PP : {ppRecipients.length}{" "}
          {ppRecipients.length <= 1 ? "destinataire" : "destinataires"}
        </span>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-600">
          ✓ Enregistré avec succès
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enregistrement...
          </>
        ) : (
          "Enregistrer"
        )}
      </Button>
    </form>
  );
}