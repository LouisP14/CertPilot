"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Reference {
  id: string;
  type: string;
  value: string;
  isActive: boolean;
  sortOrder: number;
}

interface ReferenceManagerProps {
  type: "FUNCTION" | "SERVICE" | "SITE" | "TEAM";
  label: string;
  placeholder: string;
}

export function ReferenceManager({
  type,
  label,
  placeholder,
}: ReferenceManagerProps) {
  const [references, setReferences] = useState<Reference[]>([]);
  const [newValue, setNewValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    value: string;
  } | null>(null);

  useEffect(() => {
    fetchReferences();
  }, [type]);

  // Recharger quand le menu s'ouvre
  useEffect(() => {
    if (isOpen) {
      fetchReferences();
    }
  }, [isOpen]);

  const fetchReferences = async () => {
    try {
      const response = await fetch(`/api/references?type=${type}`);
      if (response.ok) {
        const data = await response.json();
        setReferences(data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newValue.trim()) return;

    setSaving(true);
    try {
      const response = await fetch("/api/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value: newValue.trim() }),
      });

      if (response.ok) {
        toast.success("Ajouté", `${label} ajouté avec succès`);
        setNewValue("");
        await fetchReferences();
      } else {
        const error = await response.json();
        toast.error("Erreur", error.error || "Erreur lors de l'ajout");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur", "Une erreur est survenue");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, value: string) => {
    setDeleteConfirm({ id, value });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await fetch(`/api/references?id=${deleteConfirm.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Supprimé", `${label} supprimé avec succès`);
        setDeleteConfirm(null);
        await fetchReferences();
      } else {
        toast.error("Erreur", "Erreur lors de la suppression");
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur", "Une erreur est survenue");
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Chargement...</div>;
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">{label}s</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {references.length}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Content */}
      {isOpen && (
        <div className="p-4 space-y-4 bg-gray-50/50">
          {references.length === 0 ? (
            <p className="text-sm text-gray-500 italic">
              Aucun {label.toLowerCase()} défini
            </p>
          ) : (
            <div className="space-y-2">
              {references.map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center justify-between p-2 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium">{ref.value}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(ref.id, ref.value)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t">
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={placeholder}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
            />
            <Button
              onClick={handleAdd}
              disabled={!newValue.trim() || saving}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteConfirm?.value}" ?`}
        confirmText="Supprimer"
        variant="danger"
      />
    </div>
  );
}

