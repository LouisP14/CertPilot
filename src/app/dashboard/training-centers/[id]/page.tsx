"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Clock,
  Edit,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Plus,
  Star,
  Trash2,
  Truck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface FormationType {
  id: string;
  name: string;
  category: string | null;
  service: string | null;
  durationHours: number;
  durationDays: number;
  estimatedCostPerPerson: number | null;
  estimatedCostPerSession: number | null;
}

interface Offering {
  id: string;
  formationTypeId: string;
  formationType: FormationType;
  pricePerPerson: number;
  pricePerSession: number | null;
  minParticipants: number;
  maxParticipants: number;
  durationHours: number | null;
  durationDays: number | null;
  availableModes: string;
  certificationCode: string | null;
  isOPCOEligible: boolean;
  isActive: boolean;
}

interface TrainingCenter {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  isPartner: boolean;
  discountPercent: number | null;
  hasOwnPremises: boolean;
  canTravel: boolean;
  rating: number | null;
}

export default function TrainingCenterDetailPage() {
  const params = useParams();
  const centerId = params.id as string;

  const [center, setCenter] = useState<TrainingCenter | null>(null);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [formationTypes, setFormationTypes] = useState<FormationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOfferingForm, setShowOfferingForm] = useState(false);
  const [editingOffering, setEditingOffering] = useState<Offering | null>(null);
  const [saving, setSaving] = useState(false);

  const [offeringForm, setOfferingForm] = useState({
    formationTypeId: "",
    pricePerPerson: "",
    pricePerSession: "",
    minParticipants: "1",
    maxParticipants: "12",
    durationHours: "",
    durationDays: "",
    availableModes: "PRESENTIEL",
    certificationCode: "",
    isOPCOEligible: true,
    isActive: true,
  });

  const fetchData = async () => {
    try {
      const [centerRes, offeringsRes, formationsRes] = await Promise.all([
        fetch(`/api/training-centers/${centerId}`),
        fetch(`/api/training-centers/${centerId}/offerings`),
        fetch("/api/formation-types"),
      ]);

      if (centerRes.ok) {
        setCenter(await centerRes.json());
      }
      if (offeringsRes.ok) {
        setOfferings(await offeringsRes.json());
      }
      if (formationsRes.ok) {
        setFormationTypes(await formationsRes.json());
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerId]);

  const handleSubmitOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingOffering
        ? `/api/training-centers/${centerId}/offerings/${editingOffering.id}`
        : `/api/training-centers/${centerId}/offerings`;

      const response = await fetch(url, {
        method: editingOffering ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offeringForm),
      });

      if (response.ok) {
        toast.success(
          editingOffering ? "Offre modifiée" : "Offre créée",
          "L'offre de formation a été enregistrée avec succès",
        );
        fetchData();
        resetOfferingForm();
      } else {
        const data = await response.json();
        toast.error(
          "Erreur d'enregistrement",
          data.error || "Impossible d'enregistrer l'offre",
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(
        "Erreur d'enregistrement",
        "Une erreur est survenue lors de l'enregistrement",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditOffering = (offering: Offering) => {
    setEditingOffering(offering);
    setOfferingForm({
      formationTypeId: offering.formationTypeId,
      pricePerPerson: offering.pricePerPerson.toString(),
      pricePerSession: offering.pricePerSession?.toString() || "",
      minParticipants: offering.minParticipants.toString(),
      maxParticipants: offering.maxParticipants.toString(),
      durationHours: offering.durationHours?.toString() || "",
      durationDays: offering.durationDays?.toString() || "",
      availableModes: offering.availableModes,
      certificationCode: offering.certificationCode || "",
      isOPCOEligible: offering.isOPCOEligible,
      isActive: offering.isActive,
    });
    setShowOfferingForm(true);
  };

  const handleDeleteOffering = async (offeringId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) return;

    try {
      const response = await fetch(
        `/api/training-centers/${centerId}/offerings/${offeringId}`,
        { method: "DELETE" },
      );
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const resetOfferingForm = () => {
    setShowOfferingForm(false);
    setEditingOffering(null);
    setOfferingForm({
      formationTypeId: "",
      pricePerPerson: "",
      pricePerSession: "",
      minParticipants: "1",
      maxParticipants: "12",
      durationHours: "",
      durationDays: "",
      availableModes: "PRESENTIEL",
      certificationCode: "",
      isOPCOEligible: true,
      isActive: true,
    });
  };

  // Formations disponibles (non encore ajoutées)
  const availableFormations = formationTypes.filter(
    (ft) =>
      ft.id !== editingOffering?.formationTypeId &&
      !offerings.some((o) => o.formationTypeId === ft.id),
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!center) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-4 text-gray-500">Centre non trouvé</p>
        <Link href="/dashboard/training-centers">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux centres
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/training-centers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {center.name}
              </h1>
              {center.isPartner && (
                <Badge className="bg-yellow-100 text-yellow-700">
                  <Star className="mr-1 h-3 w-3" />
                  Partenaire
                </Badge>
              )}
            </div>
            {center.code && (
              <p className="text-gray-500">Code: {center.code}</p>
            )}
          </div>
        </div>
      </div>

      {/* Info du centre */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-emerald-100 p-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium">Adresse</p>
                {center.address && (
                  <p className="text-gray-600">{center.address}</p>
                )}
                <p className="text-gray-600">
                  {center.postalCode} {center.city}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium">Contact</p>
                {center.contactName && (
                  <p className="text-gray-600">{center.contactName}</p>
                )}
                {center.contactEmail && (
                  <a
                    href={`mailto:${center.contactEmail}`}
                    className="text-emerald-600 hover:underline"
                  >
                    {center.contactEmail}
                  </a>
                )}
                {center.contactPhone && (
                  <p className="text-gray-600">{center.contactPhone}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium">Capacités</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {center.hasOwnPremises && (
                    <Badge variant="secondary" className="text-xs">
                      Locaux propres
                    </Badge>
                  )}
                  {center.canTravel && (
                    <Badge variant="secondary" className="text-xs">
                      <Truck className="mr-1 h-3 w-3" />
                      Intra
                    </Badge>
                  )}
                  {center.discountPercent && (
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      -{center.discountPercent}%
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offres de formation */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-emerald-600" />
            Offres de formation ({offerings.length})
          </CardTitle>
          <Button onClick={() => setShowOfferingForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une offre
          </Button>
        </CardHeader>
        <CardContent>
          {offerings.length === 0 ? (
            <div className="py-12 text-center">
              <GraduationCap className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">
                Aucune offre de formation configurée
              </p>
              <p className="text-sm text-gray-400">
                Ajoutez les formations proposées par ce centre avec leurs tarifs
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowOfferingForm(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une offre
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {offerings.map((offering) => (
                <div
                  key={offering.id}
                  className={`rounded-lg border p-4 ${
                    offering.isActive ? "bg-white" : "bg-gray-50 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {offering.formationType.name}
                        </h4>
                        {offering.formationType.category && (
                          <Badge variant="secondary" className="text-xs">
                            {offering.formationType.category}
                          </Badge>
                        )}
                        {!offering.isActive && (
                          <Badge className="bg-gray-200 text-gray-600 text-xs">
                            Inactif
                          </Badge>
                        )}
                        {offering.isOPCOEligible && (
                          <Badge className="bg-blue-100 text-blue-700 text-xs">
                            OPCO
                          </Badge>
                        )}
                      </div>
                      {offering.formationType.service && (
                        <p className="text-sm text-gray-500">
                          Service: {offering.formationType.service}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        {/* Prix INTER */}
                        <div className="flex items-center gap-1 rounded bg-emerald-50 px-2 py-1">
                          <span className="text-xs font-medium text-emerald-800">
                            INTER
                          </span>
                          <span className="font-semibold text-emerald-700">
                            {offering.pricePerPerson.toLocaleString("fr-FR")} €
                          </span>
                          <span className="text-gray-500">/pers.</span>
                        </div>

                        {/* Prix INTRA */}
                        {offering.pricePerSession && (
                          <div className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1">
                            <span className="text-xs font-medium text-blue-800">
                              INTRA
                            </span>
                            <span className="font-semibold text-blue-700">
                              {offering.pricePerSession.toLocaleString("fr-FR")}{" "}
                              €
                            </span>
                            <span className="text-gray-500">/session</span>
                          </div>
                        )}

                        {/* Durée */}
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="h-4 w-4" />
                          {offering.durationDays ||
                            offering.formationType.durationDays}{" "}
                          jour(s)
                          {(offering.durationHours ||
                            offering.formationType.durationHours) && (
                            <span className="text-gray-400">
                              (
                              {offering.durationHours ||
                                offering.formationType.durationHours}
                              h)
                            </span>
                          )}
                        </div>

                        {/* Participants */}
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="h-4 w-4" />
                          {offering.minParticipants}-{offering.maxParticipants}{" "}
                          pers.
                        </div>

                        {/* Modes */}
                        <div className="flex items-center gap-1">
                          {offering.availableModes.split(",").map((mode) => (
                            <Badge
                              key={mode}
                              variant="secondary"
                              className="text-xs"
                            >
                              {mode.trim() === "PRESENTIEL"
                                ? "Présentiel"
                                : mode.trim() === "DISTANCIEL"
                                  ? "Distanciel"
                                  : "Mixte"}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditOffering(offering)}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteOffering(offering.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Formulaire Offre */}
      {showOfferingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingOffering
                    ? "Modifier l'offre"
                    : "Nouvelle offre de formation"}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={resetOfferingForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitOffering} className="space-y-4">
                {/* Type de formation */}
                <div className="space-y-2">
                  <Label htmlFor="formationTypeId">Formation *</Label>
                  {editingOffering ? (
                    <div className="rounded-lg border bg-gray-50 p-3">
                      <p className="font-medium">
                        {editingOffering.formationType.name}
                      </p>
                      {editingOffering.formationType.category && (
                        <p className="text-sm text-gray-500">
                          {editingOffering.formationType.category}
                        </p>
                      )}
                    </div>
                  ) : (
                    <select
                      id="formationTypeId"
                      className="w-full rounded-lg border p-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      value={offeringForm.formationTypeId}
                      onChange={(e) =>
                        setOfferingForm({
                          ...offeringForm,
                          formationTypeId: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Sélectionner une formation</option>
                      {availableFormations.map((ft) => (
                        <option key={ft.id} value={ft.id}>
                          {ft.name}
                          {ft.category ? ` (${ft.category})` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                  {availableFormations.length === 0 && !editingOffering && (
                    <p className="text-sm text-amber-600">
                      Toutes les formations sont déjà configurées pour ce
                      centre.
                    </p>
                  )}
                </div>

                {/* Prix */}
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <h4 className="mb-3 font-medium text-emerald-900">
                    Tarification
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="pricePerPerson">
                        Prix INTER (€/personne) *
                      </Label>
                      <Input
                        id="pricePerPerson"
                        type="number"
                        step="0.01"
                        min="0"
                        value={offeringForm.pricePerPerson}
                        onChange={(e) =>
                          setOfferingForm({
                            ...offeringForm,
                            pricePerPerson: e.target.value,
                          })
                        }
                        required
                        placeholder="Ex: 450"
                      />
                      <p className="text-xs text-gray-500">
                        📍 Formation chez le centre, employés de plusieurs
                        entreprises
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pricePerSession">
                        Prix INTRA (€/session)
                      </Label>
                      <Input
                        id="pricePerSession"
                        type="number"
                        step="0.01"
                        min="0"
                        value={offeringForm.pricePerSession}
                        onChange={(e) =>
                          setOfferingForm({
                            ...offeringForm,
                            pricePerSession: e.target.value,
                          })
                        }
                        placeholder="Ex: 3500"
                      />
                      <p className="text-xs text-gray-500">
                        🏢 Formateur chez vous, forfait pour le groupe entier
                      </p>
                    </div>
                  </div>
                </div>

                {/* Durée et participants */}
                <div className="grid gap-4 sm:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="durationDays">Durée (jours)</Label>
                    <Input
                      id="durationDays"
                      type="number"
                      min="1"
                      value={offeringForm.durationDays}
                      onChange={(e) =>
                        setOfferingForm({
                          ...offeringForm,
                          durationDays: e.target.value,
                        })
                      }
                      placeholder="Auto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="durationHours">Durée (heures)</Label>
                    <Input
                      id="durationHours"
                      type="number"
                      step="0.5"
                      min="0"
                      value={offeringForm.durationHours}
                      onChange={(e) =>
                        setOfferingForm({
                          ...offeringForm,
                          durationHours: e.target.value,
                        })
                      }
                      placeholder="Auto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minParticipants">Min. participants</Label>
                    <Input
                      id="minParticipants"
                      type="number"
                      min="1"
                      value={offeringForm.minParticipants}
                      onChange={(e) =>
                        setOfferingForm({
                          ...offeringForm,
                          minParticipants: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max. participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      min="1"
                      value={offeringForm.maxParticipants}
                      onChange={(e) =>
                        setOfferingForm({
                          ...offeringForm,
                          maxParticipants: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Modes de formation */}
                <div className="space-y-2">
                  <Label>Modes disponibles</Label>
                  <div className="flex gap-4">
                    {[
                      { value: "PRESENTIEL", label: "Présentiel" },
                      { value: "DISTANCIEL", label: "Distanciel" },
                      { value: "MIXTE", label: "Mixte" },
                    ].map((mode) => (
                      <label
                        key={mode.value}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="checkbox"
                          checked={offeringForm.availableModes
                            .split(",")
                            .map((m) => m.trim())
                            .includes(mode.value)}
                          onChange={(e) => {
                            const current = offeringForm.availableModes
                              .split(",")
                              .map((m) => m.trim())
                              .filter((m) => m);
                            if (e.target.checked) {
                              setOfferingForm({
                                ...offeringForm,
                                availableModes: [...current, mode.value].join(
                                  ",",
                                ),
                              });
                            } else {
                              setOfferingForm({
                                ...offeringForm,
                                availableModes: current
                                  .filter((m) => m !== mode.value)
                                  .join(","),
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{mode.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Certification et OPCO */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="certificationCode">
                      Code certification
                    </Label>
                    <Input
                      id="certificationCode"
                      value={offeringForm.certificationCode}
                      onChange={(e) =>
                        setOfferingForm({
                          ...offeringForm,
                          certificationCode: e.target.value,
                        })
                      }
                      placeholder="Ex: RNCP1234"
                    />
                  </div>
                  <div className="flex items-end gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={offeringForm.isOPCOEligible}
                        onChange={(e) =>
                          setOfferingForm({
                            ...offeringForm,
                            isOPCOEligible: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Éligible OPCO</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={offeringForm.isActive}
                        onChange={(e) =>
                          setOfferingForm({
                            ...offeringForm,
                            isActive: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Offre active</span>
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetOfferingForm}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : editingOffering ? (
                      "Mettre à jour"
                    ) : (
                      "Ajouter l'offre"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
