"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import {
  Building2,
  Check,
  Edit,
  ExternalLink,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Star,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
  paymentTerms: string | null;
  notes: string | null;
  maxCapacity: number | null;
  hasOwnPremises: boolean;
  canTravel: boolean;
  travelCostPerKm: number | null;
  rating: number | null;
  totalSessions: number;
  _count?: { sessions: number; offerings: number };
}

export default function TrainingCentersPage() {
  const [centers, setCenters] = useState<TrainingCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCenter, setEditingCenter] = useState<TrainingCenter | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    postalCode: "",
    country: "France",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    isPartner: false,
    discountPercent: "",
    paymentTerms: "",
    notes: "",
    maxCapacity: "",
    hasOwnPremises: true,
    canTravel: false,
    travelCostPerKm: "",
  });

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const response = await fetch("/api/training-centers");
      if (response.ok) {
        const data = await response.json();
        setCenters(data);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingCenter
        ? `/api/training-centers/${editingCenter.id}`
        : "/api/training-centers";

      const response = await fetch(url, {
        method: editingCenter ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(
          editingCenter ? "Centre modifié" : "Centre créé",
          "Le centre de formation a été enregistré avec succès",
        );
        fetchCenters();
        resetForm();
      } else {
        const data = await response.json();
        toast.error(
          "Erreur d'enregistrement",
          data.error || "Impossible d'enregistrer le centre",
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

  const handleEdit = (center: TrainingCenter) => {
    setEditingCenter(center);
    setFormData({
      name: center.name,
      code: center.code || "",
      address: center.address || "",
      city: center.city || "",
      postalCode: center.postalCode || "",
      country: center.country,
      contactName: center.contactName || "",
      contactEmail: center.contactEmail || "",
      contactPhone: center.contactPhone || "",
      website: center.website || "",
      isPartner: center.isPartner,
      discountPercent: center.discountPercent?.toString() || "",
      paymentTerms: center.paymentTerms || "",
      notes: center.notes || "",
      maxCapacity: center.maxCapacity?.toString() || "",
      hasOwnPremises: center.hasOwnPremises,
      canTravel: center.canTravel,
      travelCostPerKm: center.travelCostPerKm?.toString() || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce centre ?")) return;

    try {
      const response = await fetch(`/api/training-centers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchCenters();
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCenter(null);
    setFormData({
      name: "",
      code: "",
      address: "",
      city: "",
      postalCode: "",
      country: "France",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      website: "",
      isPartner: false,
      discountPercent: "",
      paymentTerms: "",
      notes: "",
      maxCapacity: "",
      hasOwnPremises: true,
      canTravel: false,
      travelCostPerKm: "",
    });
  };

  const filteredCenters = centers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city?.toLowerCase().includes(search.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Centres de Formation
          </h1>
          <p className="text-gray-600">
            Gérer vos partenaires et organismes de formation
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau centre
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{centers.length}</p>
                <p className="text-sm text-gray-500">Centres actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {centers.filter((c) => c.isPartner).length}
                </p>
                <p className="text-sm text-gray-500">Partenaires</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {centers.filter((c) => c.canTravel).length}
                </p>
                <p className="text-sm text-gray-500">Formations intra</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Check className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {centers.reduce(
                    (acc, c) => acc + (c._count?.sessions || 0),
                    0,
                  )}
                </p>
                <p className="text-sm text-gray-500">Sessions réalisées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Rechercher par nom, ville ou code..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des centres */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCenters.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">
                {centers.length === 0
                  ? "Aucun centre de formation"
                  : "Aucun résultat"}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowForm(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un centre
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredCenters.map((center) => (
            <Card key={center.id} className="relative">
              {center.isPartner && (
                <Badge className="absolute right-3 top-3 bg-yellow-100 text-yellow-700">
                  <Star className="mr-1 h-3 w-3" />
                  Partenaire
                </Badge>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{center.name}</CardTitle>
                {center.code && (
                  <p className="text-sm text-gray-500">Code: {center.code}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Adresse */}
                {(center.city || center.address) && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                    <div>
                      {center.address && <p>{center.address}</p>}
                      <p>
                        {center.postalCode} {center.city}
                      </p>
                    </div>
                  </div>
                )}

                {/* Contact */}
                {center.contactEmail && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a
                      href={`mailto:${center.contactEmail}`}
                      className="text-emerald-600 hover:underline"
                    >
                      {center.contactEmail}
                    </a>
                  </div>
                )}
                {center.contactPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{center.contactPhone}</span>
                  </div>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {center.hasOwnPremises && (
                    <Badge variant="secondary" className="text-xs">
                      <Building2 className="mr-1 h-3 w-3" />
                      Locaux propres
                    </Badge>
                  )}
                  {center.canTravel && (
                    <Badge variant="secondary" className="text-xs">
                      <Truck className="mr-1 h-3 w-3" />
                      Intra-entreprise
                    </Badge>
                  )}
                  {center.discountPercent && (
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      -{center.discountPercent}%
                    </Badge>
                  )}
                </div>

                {/* Website */}
                {center.website && (
                  <a
                    href={center.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-emerald-600 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Voir le site web
                  </a>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Link href={`/dashboard/training-centers/${center.id}`}>
                    <Button variant="outline" size="sm">
                      <GraduationCap className="mr-1 h-3 w-3" />
                      Offres ({center._count?.offerings || 0})
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(center)}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(center.id)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal Formulaire */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingCenter
                    ? "Modifier le centre"
                    : "Nouveau centre de formation"}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Infos générales */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Code interne</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      placeholder="Ex: AFPA-76"
                    />
                  </div>
                </div>

                {/* Adresse */}
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Code postal</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) =>
                        setFormData({ ...formData, postalCode: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Pays</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="rounded-lg border p-4">
                  <h4 className="mb-3 font-medium">Contact</h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Nom du contact</Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactEmail: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Téléphone</Label>
                      <Input
                        id="contactPhone"
                        value={formData.contactPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactPhone: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="website">Site web</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* Commercial */}
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <h4 className="mb-3 font-medium text-yellow-900">
                    Informations commerciales
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isPartner"
                        checked={formData.isPartner}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isPartner: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="isPartner">Partenaire privilégié</Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountPercent">
                        Remise négociée (%)
                      </Label>
                      <Input
                        id="discountPercent"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.discountPercent}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discountPercent: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentTerms">Conditions paiement</Label>
                      <Input
                        id="paymentTerms"
                        value={formData.paymentTerms}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            paymentTerms: e.target.value,
                          })
                        }
                        placeholder="Ex: 30 jours fin de mois"
                      />
                    </div>
                  </div>
                </div>

                {/* Capacités */}
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h4 className="mb-3 font-medium text-blue-900">Capacités</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="maxCapacity">
                        Capacité max simultanée
                      </Label>
                      <Input
                        id="maxCapacity"
                        type="number"
                        min="1"
                        value={formData.maxCapacity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxCapacity: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="travelCostPerKm">
                        Coût déplacement (€/km)
                      </Label>
                      <Input
                        id="travelCostPerKm"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.travelCostPerKm}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            travelCostPerKm: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-6">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="hasOwnPremises"
                        checked={formData.hasOwnPremises}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hasOwnPremises: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="hasOwnPremises">Dispose de locaux</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="canTravel"
                        checked={formData.canTravel}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            canTravel: e.target.checked,
                          })
                        }
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="canTravel">
                        Peut se déplacer (intra)
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes internes</Label>
                  <textarea
                    id="notes"
                    className="w-full rounded-lg border p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : editingCenter ? (
                      "Mettre à jour"
                    ) : (
                      "Créer le centre"
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
