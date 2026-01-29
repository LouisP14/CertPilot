"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ArrowLeft, Camera, Loader2, Trash2, Upload, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface EmployeeFormProps {
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    photo: string | null;
    employeeId: string;
    position: string;
    department: string;
    site: string | null;
    team: string | null;
    hourlyCost: number | null;
    contractType: string | null;
    workingHoursPerDay: number | null;
    managerId: string | null;
    managerEmail: string | null;
    medicalCheckupDate: Date | null;
  };
  employees?: { id: string; firstName: string; lastName: string }[];
}

export default function NewEmployeePage() {
  const [employees, setEmployees] = useState<
    { id: string; firstName: string; lastName: string }[]
  >([]);

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await fetch("/api/employees");
        if (response.ok) {
          const data = await response.json();
          setEmployees(data);
        }
      } catch (error) {
        console.error("Erreur chargement employés:", error);
      }
    };
    loadEmployees();
  }, []);

  return <EmployeeForm employees={employees} />;
}

export function EmployeeForm({ employee, employees = [] }: EmployeeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    employee?.photo || null,
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Référentiels
  const [functions, setFunctions] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [sites, setSites] = useState<string[]>([]);
  const [teams, setTeams] = useState<string[]>([]);

  useEffect(() => {
    // Charger les référentiels
    const loadReferences = async () => {
      try {
        const [funcRes, servRes, siteRes, teamRes] = await Promise.all([
          fetch("/api/references?type=FUNCTION"),
          fetch("/api/references?type=SERVICE"),
          fetch("/api/references?type=SITE"),
          fetch("/api/references?type=TEAM"),
        ]);

        if (funcRes.ok) {
          const data = await funcRes.json();
          setFunctions(data.map((r: { value: string }) => r.value));
        }
        if (servRes.ok) {
          const data = await servRes.json();
          setServices(data.map((r: { value: string }) => r.value));
        }
        if (siteRes.ok) {
          const data = await siteRes.json();
          setSites(data.map((r: { value: string }) => r.value));
        }
        if (teamRes.ok) {
          const data = await teamRes.json();
          setTeams(data.map((r: { value: string }) => r.value));
        }
      } catch (error) {
        console.error("Erreur chargement références:", error);
      }
    };
    loadReferences();
  }, []);

  const [formData, setFormData] = useState({
    firstName: employee?.firstName || "",
    lastName: employee?.lastName || "",
    email: employee?.email || "",
    employeeId: employee?.employeeId || "",
    position: employee?.position || "",
    department: employee?.department || "",
    site: employee?.site || "",
    team: employee?.team || "",
    hourlyCost: employee?.hourlyCost?.toString() || "",
    contractType: employee?.contractType || "",
    workingHoursPerDay: employee?.workingHoursPerDay?.toString() || "7",
    managerId: employee?.managerId || "",
    managerEmail: employee?.managerEmail || "",
    medicalCheckupDate: employee?.medicalCheckupDate
      ? new Date(employee.medicalCheckupDate).toISOString().split("T")[0]
      : "",
    photo: employee?.photo || "",
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Format non supporté. Utilisez JPG, PNG ou WebP.");
        return;
      }
      // Vérifier la taille (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Le fichier est trop volumineux (max 5MB)");
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormData((prev) => ({ ...prev, photo: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadPhoto = async (employeeId: string): Promise<string | null> => {
    if (!photoFile) return formData.photo || null;

    setUploadingPhoto(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("photo", photoFile);
      uploadFormData.append("employeeId", employeeId);

      const response = await fetch("/api/upload/photo", {
        method: "POST",
        body: uploadFormData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de l'upload");
      }

      const data = await response.json();
      return data.url;
    } catch (err) {
      console.error("Photo upload error:", err);
      throw err;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Si c'est une création, on crée d'abord l'employé puis on upload la photo
      // Si c'est une mise à jour, on upload la photo d'abord
      let photoUrl = formData.photo;

      if (employee && photoFile) {
        // Mode édition : upload la photo d'abord
        photoUrl = (await uploadPhoto(employee.id)) || "";
      }

      const url = employee ? `/api/employees/${employee.id}` : "/api/employees";
      const dataToSend = { ...formData, photo: photoUrl };

      const response = await fetch(url, {
        method: employee ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Une erreur est survenue");
      }

      const data = await response.json();

      // Si c'est une création et qu'on a une photo, on l'upload maintenant
      if (!employee && photoFile) {
        const newPhotoUrl = await uploadPhoto(data.id);
        if (newPhotoUrl) {
          // Mettre à jour l'employé avec la photo
          await fetch(`/api/employees/${data.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...dataToSend, photo: newPhotoUrl }),
          });
        }
      }

      router.push(`/dashboard/employees/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDelete = async () => {
    if (!employee) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      router.push("/dashboard/employees");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la suppression",
      );
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/employees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {employee ? "Modifier l'employé" : "Nouvel employé"}
          </h1>
          <p className="text-gray-500">
            {employee
              ? "Modifier les informations de l'employé"
              : "Créer un nouveau passeport formation"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Photo de profil */}
              <div className="space-y-2">
                <Label>Photo de profil</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {photoPreview ? (
                      <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-blue-200">
                        <Image
                          src={photoPreview}
                          alt="Photo de profil"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="photo-upload"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                      >
                        {uploadingPhoto ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        {photoPreview
                          ? "Changer la photo"
                          : "Ajouter une photo"}
                      </Button>
                      {photoPreview && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={removePhoto}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Supprimer
                        </Button>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      JPG, PNG ou WebP. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId">Matricule *</Label>
                <Input
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Informations professionnelles */}
          <Card>
            <CardHeader>
              <CardTitle>Informations professionnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="position">Fonction *</Label>
                <Select
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Sélectionner une fonction --</option>
                  {functions.map((func) => (
                    <option key={func} value={func}>
                      {func}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Service *</Label>
                <Select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Sélectionner un service --</option>
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Site et Équipe */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="site">Site</Label>
                  <Select
                    id="site"
                    name="site"
                    value={formData.site}
                    onChange={handleChange}
                  >
                    <option value="">-- Sélectionner un site --</option>
                    {sites.map((site) => (
                      <option key={site} value={site}>
                        {site}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team">Équipe</Label>
                  <Select
                    id="team"
                    name="team"
                    value={formData.team}
                    onChange={handleChange}
                  >
                    <option value="">-- Sélectionner une équipe --</option>
                    {teams.map((team) => (
                      <option key={team} value={team}>
                        {team}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Données RH/Planification */}
              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                <h4 className="mb-3 text-sm font-medium text-blue-900">
                  Données de planification
                </h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="contractType">Type de contrat</Label>
                    <Select
                      id="contractType"
                      name="contractType"
                      value={formData.contractType}
                      onChange={handleChange}
                    >
                      <option value="">-- Sélectionner --</option>
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Intérim">Intérim</option>
                      <option value="Apprentissage">Apprentissage</option>
                      <option value="Stage">Stage</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyCost">Coût horaire (€/h)</Label>
                    <Input
                      id="hourlyCost"
                      name="hourlyCost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.hourlyCost}
                      onChange={handleChange}
                      placeholder="Ex: 35.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workingHoursPerDay">Heures/jour</Label>
                    <Input
                      id="workingHoursPerDay"
                      name="workingHoursPerDay"
                      type="number"
                      step="0.5"
                      min="1"
                      max="12"
                      value={formData.workingHoursPerDay}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="managerId">Manager</Label>
                <Select
                  id="managerId"
                  name="managerId"
                  value={formData.managerId}
                  onChange={handleChange}
                >
                  <option value="">-- Aucun manager --</option>
                  {employees
                    .filter((e) => e.id !== employee?.id)
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.lastName} {e.firstName}
                      </option>
                    ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="managerEmail">Email du manager</Label>
                <Input
                  id="managerEmail"
                  name="managerEmail"
                  type="email"
                  value={formData.managerEmail}
                  onChange={handleChange}
                  placeholder="Pour recevoir les alertes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicalCheckupDate">Date visite médicale</Label>
                <Input
                  id="medicalCheckupDate"
                  name="medicalCheckupDate"
                  type="date"
                  value={formData.medicalCheckupDate}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-between">
          {employee ? (
            <Button
              type="button"
              variant="outline"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer l'employé
            </Button>
          ) : (
            <div></div>
          )}
          <div className="flex gap-4">
            <Link href="/dashboard/employees">
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : employee ? (
                "Mettre à jour"
              ) : (
                "Créer l'employé"
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Dialog de confirmation de suppression */}
      {employee && (
        <ConfirmDialog
          open={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Supprimer l'employé"
          message={`Êtes-vous sûr de vouloir supprimer ${employee.firstName} ${employee.lastName} ? Cette action supprimera également tous ses certificats et ne peut pas être annulée.`}
          confirmText={deleting ? "Suppression..." : "Supprimer"}
          variant="danger"
        />
      )}
    </div>
  );
}

