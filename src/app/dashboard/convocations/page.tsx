"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { useConfirm } from "@/hooks/use-confirm";
import jsPDF from "jspdf";
import {
  Calendar,
  Clock,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Plus,
  Search,
  Send,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Formation {
  id: string;
  name: string;
  category: string | null;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  department: string | null;
}

interface Convocation {
  id: string;
  formationId: string;
  formationName: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  employees: { id: string; name: string; email: string | null }[];
  status: "draft" | "sent" | "completed";
  notes: string;
  createdAt: string;
}

export default function ConvocationsPage() {
  const searchParams = useSearchParams();
  const formationParam = searchParams.get("formation");
  const employeeParam = searchParams.get("employee");
  const { confirm, ConfirmDialog } = useConfirm();

  const [formations, setFormations] = useState<Formation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [convocations, setConvocations] = useState<Convocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [companyName, setCompanyName] = useState("Entreprise");

  // Formulaire nouvelle convocation
  const [formData, setFormData] = useState({
    formationId: "",
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "17:00",
    location: "",
    notes: "",
    selectedEmployees: [] as string[],
  });

  // Charger les données au montage
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les convocations existantes
        const convocsResponse = await fetch("/api/convocations");
        if (convocsResponse.ok) {
          const convocsData = await convocsResponse.json();
          setConvocations(convocsData);
        }

        // Charger les données du formulaire (formations et employés)
        const formDataResponse = await fetch("/api/convocations/form-data");
        if (formDataResponse.ok) {
          const formData = await formDataResponse.json();
          setFormations(formData.formations);
          setEmployees(formData.employees);
          if (formData.companyName) {
            setCompanyName(formData.companyName);
          }
        }

        // Si un paramètre formation est passé dans l'URL, ouvrir le formulaire
        if (formationParam || employeeParam) {
          setFormData((prev) => ({
            ...prev,
            formationId: formationParam || prev.formationId,
            selectedEmployees: employeeParam
              ? [employeeParam]
              : prev.selectedEmployees,
          }));
          setShowNewForm(true);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [formationParam, employeeParam]);

  const filteredConvocations = convocations.filter((conv) => {
    const matchesSearch =
      conv.formationName.toLowerCase().includes(search.toLowerCase()) ||
      conv.employees.some((e) =>
        e.name.toLowerCase().includes(search.toLowerCase()),
      );
    const matchesStatus = !filterStatus || conv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Convocation["status"]) => {
    switch (status) {
      case "draft":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            <FileText className="mr-1 h-3 w-3" />
            Brouillon
          </Badge>
        );
      case "sent":
        return (
          <Badge className="bg-blue-100 text-blue-700">
            <Send className="mr-1 h-3 w-3" />
            Envoyée
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700">
            <Mail className="mr-1 h-3 w-3" />
            Clôturée
          </Badge>
        );
    }
  };

  const [sendingId, setSendingId] = useState<string | null>(null);

  const handleSendConvocation = async (id: string) => {
    const convocation = convocations.find((c) => c.id === id);
    if (!convocation) return;

    setSendingId(id);

    try {
      // Générer le PDF
      const pdfBase64 = generateConvocationPDF(
        convocation.formationName,
        convocation.startDate,
        convocation.endDate,
        convocation.startTime,
        convocation.endTime,
        convocation.location,
        convocation.notes,
        convocation.employees,
      );

      // Envoyer les emails
      const response = await fetch("/api/convocations/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          convocationId: convocation.id, // Pour mettre à jour le statut
          formationName: convocation.formationName,
          startDate: convocation.startDate,
          endDate: convocation.endDate,
          startTime: convocation.startTime,
          endTime: convocation.endTime,
          location: convocation.location,
          notes: convocation.notes,
          employees: convocation.employees,
          pdfBase64,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Recharger les convocations
        const reloadResponse = await fetch("/api/convocations");
        if (reloadResponse.ok) {
          const convocs = await reloadResponse.json();
          setConvocations(convocs);
        }
        toast.success(
          "Convocations envoyées !",
          result.message || "Les emails ont été envoyés avec succès",
        );
      } else {
        const error = await response.json();
        toast.error(
          "Erreur d'envoi",
          error.error || "Impossible d'envoyer les convocations",
        );
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur", "Une erreur est survenue lors de l'envoi");
    } finally {
      setSendingId(null);
    }
  };

  const handleDeleteConvocation = async (id: string) => {
    const confirmed = await confirm({
      title: "Supprimer la convocation",
      message: "Êtes-vous sûr de vouloir supprimer cette convocation ?",
      confirmText: "Supprimer",
      variant: "danger",
    });

    if (confirmed) {
      try {
        const response = await fetch(`/api/convocations?id=${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setConvocations((prev) => prev.filter((c) => c.id !== id));
          toast.success(
            "Convocation supprimée",
            "La convocation a été supprimée avec succès",
          );
        } else {
          toast.error("Erreur", "Impossible de supprimer la convocation");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        toast.error("Erreur", "Une erreur est survenue lors de la suppression");
      }
    }
  };

  const handleEmployeeToggle = (employeeId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedEmployees: prev.selectedEmployees.includes(employeeId)
        ? prev.selectedEmployees.filter((id) => id !== employeeId)
        : [...prev.selectedEmployees, employeeId],
    }));
  };

  // Couleurs de la charte graphique
  const COLORS = {
    primary: { r: 23, g: 59, b: 86 }, // #173B56
    primaryDark: { r: 15, g: 42, b: 61 }, // #0f2a3d
    emerald: { r: 16, g: 185, b: 129 }, // #10B981
    slate700: { r: 51, g: 65, b: 85 }, // #334155
    slate500: { r: 100, g: 116, b: 139 }, // #64748b
    slate300: { r: 203, g: 213, b: 225 }, // #cbd5e1
    slate100: { r: 241, g: 245, b: 249 }, // #f1f5f9
    white: { r: 255, g: 255, b: 255 },
    red: { r: 185, g: 28, b: 28 }, // #b91c1c
  };

  // Générer le PDF de convocation - Design professionnel
  const generateConvocationPDF = (
    formationName: string,
    startDate: string,
    endDate: string,
    startTime: string,
    endTime: string,
    location: string,
    notes: string,
    employeesList: { name: string; email: string | null }[],
  ): string => {
    const doc = new jsPDF();
    const pageWidth = 210;
    const margin = 25;
    const contentWidth = pageWidth - margin * 2;
    const now = new Date();
    const generationDate = now.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const generationTime = now.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Format date helper
    const formatDate = (dateStr: string) =>
      new Date(dateStr).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    // ========================================
    // HEADER - Bandeau entreprise
    // ========================================
    doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.rect(0, 0, pageWidth, 45, "F");

    // Nom entreprise
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(companyName, margin, 25);

    // Date d'emission
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Emis le ${generationDate}`, margin, 35);

    // Logo CertPilot
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("CertPilot", pageWidth - margin, 28, { align: "right" });

    // ========================================
    // TITRE - Convocation
    // ========================================
    let y = 65;

    doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("CONVOCATION", pageWidth / 2, y, { align: "center" });

    // Sous-titre
    y += 10;
    doc.setTextColor(COLORS.slate500.r, COLORS.slate500.g, COLORS.slate500.b);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Formation professionnelle", pageWidth / 2, y, {
      align: "center",
    });

    // ========================================
    // DESTINATAIRE
    // ========================================
    y += 20;

    doc.setTextColor(COLORS.slate500.r, COLORS.slate500.g, COLORS.slate500.b);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("A l'attention de :", margin, y);

    y += 8;
    doc.setTextColor(COLORS.slate700.r, COLORS.slate700.g, COLORS.slate700.b);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");

    employeesList.forEach((emp, index) => {
      if (index < 4) {
        doc.text(emp.name, margin, y);
        y += 7;
      } else if (index === 4) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(
          `et ${employeesList.length - 4} autre(s) participant(s)`,
          margin,
          y,
        );
        y += 7;
      }
    });

    // ========================================
    // NOM DE LA FORMATION - Encadre
    // ========================================
    y += 10;
    const formationBoxY = y;
    const formationBoxHeight = 30;

    // Fond
    doc.setFillColor(COLORS.slate100.r, COLORS.slate100.g, COLORS.slate100.b);
    doc.roundedRect(
      margin,
      formationBoxY,
      contentWidth,
      formationBoxHeight,
      4,
      4,
      "F",
    );

    // Bordure gauche emerald
    doc.setFillColor(COLORS.emerald.r, COLORS.emerald.g, COLORS.emerald.b);
    doc.rect(margin, formationBoxY, 4, formationBoxHeight, "F");

    // Texte formation
    doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");

    // Wrap le texte si trop long
    const formationLines = doc.splitTextToSize(
      formationName.toUpperCase(),
      contentWidth - 20,
    );
    const formationTextY =
      formationBoxY +
      formationBoxHeight / 2 +
      (formationLines.length > 1 ? -3 : 2);
    doc.text(formationLines, margin + 12, formationTextY);

    // ========================================
    // DETAILS - Date, Horaires, Lieu
    // ========================================
    y = formationBoxY + formationBoxHeight + 20;

    const dateText =
      startDate === endDate
        ? formatDate(startDate)
        : `Du ${formatDate(startDate)} au ${formatDate(endDate)}`;

    const details = [
      { label: "Date", value: dateText },
      { label: "Horaires", value: `${startTime} - ${endTime}` },
      { label: "Lieu", value: location },
    ];

    details.forEach((detail) => {
      // Label
      doc.setTextColor(COLORS.slate500.r, COLORS.slate500.g, COLORS.slate500.b);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(detail.label, margin, y);

      // Valeur
      y += 6;
      doc.setTextColor(COLORS.slate700.r, COLORS.slate700.g, COLORS.slate700.b);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(detail.value, margin, y);

      y += 14;
    });

    // ========================================
    // NOTES (si presentes)
    // ========================================
    if (notes && notes.trim()) {
      y += 5;

      // Label
      doc.setTextColor(COLORS.slate500.r, COLORS.slate500.g, COLORS.slate500.b);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Informations complementaires", margin, y);

      // Contenu
      y += 6;
      doc.setTextColor(COLORS.slate700.r, COLORS.slate700.g, COLORS.slate700.b);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const notesLines = doc.splitTextToSize(notes, contentWidth);
      doc.text(notesLines.slice(0, 3), margin, y);
      y += notesLines.slice(0, 3).length * 5 + 10;
    }

    // ========================================
    // MESSAGE IMPORTANT
    // ========================================
    y = Math.max(y + 10, 230);

    doc.setFillColor(254, 226, 226); // red-100
    doc.roundedRect(margin, y, contentWidth, 20, 3, 3, "F");

    doc.setTextColor(COLORS.red.r, COLORS.red.g, COLORS.red.b);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(
      "Toute absence doit etre dument justifiee aupres du service RH.",
      margin + 8,
      y + 12,
    );

    // ========================================
    // FOOTER
    // ========================================
    const footerY = 280;

    // Ligne
    doc.setDrawColor(COLORS.slate300.r, COLORS.slate300.g, COLORS.slate300.b);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    // Texte footer
    doc.setTextColor(COLORS.slate500.r, COLORS.slate500.g, COLORS.slate500.b);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Document genere automatiquement le ${generationDate} a ${generationTime} - ${companyName}`,
      pageWidth / 2,
      footerY + 8,
      { align: "center" },
    );

    return doc.output("datauristring").split(",")[1];
  };

  const handleCreateConvocation = async (asDraft: boolean) => {
    if (
      !formData.formationId ||
      !formData.startDate ||
      !formData.location ||
      formData.selectedEmployees.length === 0
    ) {
      toast.warning(
        "Champs manquants",
        "Veuillez remplir tous les champs obligatoires",
      );
      return;
    }

    const formation = formations.find((f) => f.id === formData.formationId);
    const selectedEmps = employees.filter((e) =>
      formData.selectedEmployees.includes(e.id),
    );

    const employeeData = selectedEmps.map((e) => ({
      id: e.id,
      name: `${e.lastName.toUpperCase()} ${e.firstName}`,
      email: e.email,
    }));

    const newConvocation: Convocation = {
      id: Date.now().toString(),
      formationId: formData.formationId,
      formationName: formation?.name || "",
      startDate: formData.startDate,
      endDate: formData.endDate || formData.startDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location,
      notes: formData.notes,
      employees: employeeData,
      status: asDraft ? "draft" : "sent",
      createdAt: new Date().toISOString().split("T")[0],
    };

    if (!asDraft) {
      // Générer le PDF et envoyer par email
      setSending(true);
      try {
        const pdfBase64 = generateConvocationPDF(
          formation?.name || "",
          formData.startDate,
          formData.endDate || formData.startDate,
          formData.startTime,
          formData.endTime,
          formData.location,
          formData.notes,
          employeeData,
        );

        const response = await fetch("/api/convocations/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formationName: formation?.name || "",
            startDate: formData.startDate,
            endDate: formData.endDate || formData.startDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
            location: formData.location,
            notes: formData.notes,
            employees: employeeData,
            pdfBase64,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          // Recharger les convocations depuis la base de données
          const reloadResponse = await fetch("/api/convocations");
          if (reloadResponse.ok) {
            const convocs = await reloadResponse.json();
            setConvocations(convocs);
          }
          setShowNewForm(false);
          resetForm();
          setSending(false);
          toast.success(
            "Convocations envoyées !",
            result.message || "Les emails ont été envoyés avec succès",
          );
          return;
        } else {
          const error = await response.json();
          toast.error(
            "Erreur d'envoi",
            error.error || "Impossible d'envoyer les convocations",
          );
        }
      } catch (error) {
        console.error("Erreur:", error);
        toast.error(
          "Erreur d'envoi",
          "Une erreur est survenue lors de l'envoi des convocations",
        );
      } finally {
        setSending(false);
      }
    } else {
      // Enregistrer en tant que brouillon
      try {
        const response = await fetch("/api/convocations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            formationId: formData.formationId,
            formationName: formation?.name || "",
            startDate: formData.startDate,
            endDate: formData.endDate || formData.startDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
            location: formData.location,
            notes: formData.notes,
            employees: employeeData,
            status: "draft",
          }),
        });

        if (response.ok) {
          // Recharger les convocations
          const reloadResponse = await fetch("/api/convocations");
          if (reloadResponse.ok) {
            const convocs = await reloadResponse.json();
            setConvocations(convocs);
          }
          setShowNewForm(false);
          resetForm();
          toast.success(
            "Brouillon enregistré",
            "La convocation a été enregistrée en tant que brouillon",
          );
        } else {
          toast.error("Erreur", "Impossible d'enregistrer le brouillon");
        }
      } catch (error) {
        console.error("Erreur:", error);
        toast.error(
          "Erreur",
          "Une erreur est survenue lors de l'enregistrement",
        );
      }
    }
  };

  const resetForm = () => {
    setFormData({
      formationId: "",
      startDate: "",
      endDate: "",
      startTime: "09:00",
      endTime: "17:00",
      location: "",
      notes: "",
      selectedEmployees: [],
    });
    setEmployeeSearch("");
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Convocations</h1>
          <p className="text-gray-600">
            Gérer les convocations aux sessions de formation
          </p>
        </div>
        <Button onClick={() => setShowNewForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle convocation
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{convocations.length}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-100 p-2">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {convocations.filter((c) => c.status === "draft").length}
                </p>
                <p className="text-sm text-gray-500">Brouillons</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Send className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {convocations.filter((c) => c.status === "sent").length}
                </p>
                <p className="text-sm text-gray-500">Envoyées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <Mail className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {convocations.filter((c) => c.status === "completed").length}
                </p>
                <p className="text-sm text-gray-500">Clôturées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher par formation ou participant..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                <option value="draft">Brouillons</option>
                <option value="sent">Envoyées</option>
                <option value="completed">Clôturées</option>
              </Select>
            </div>
            {(search || filterStatus) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setFilterStatus("");
                }}
              >
                <X className="mr-1 h-4 w-4" />
                Réinitialiser
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des convocations */}
      <div className="space-y-4">
        {filteredConvocations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-4 text-gray-500">
                {convocations.length === 0
                  ? "Aucune convocation créée"
                  : "Aucune convocation ne correspond aux filtres"}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowNewForm(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer une convocation
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredConvocations.map((convocation) => (
            <Card key={convocation.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {convocation.formationName}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Créée le{" "}
                      {new Date(convocation.createdAt).toLocaleDateString(
                        "fr-FR",
                      )}
                    </p>
                  </div>
                  {getStatusBadge(convocation.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Date de début */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-500">Du </span>
                      <span className="font-medium">
                        {new Date(convocation.startDate).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                  {/* Date de fin */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-500">Au </span>
                      <span className="font-medium">
                        {new Date(convocation.endDate).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                  {/* Horaires */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>
                      {convocation.startTime} - {convocation.endTime}
                    </span>
                  </div>
                  {/* Lieu */}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{convocation.location}</span>
                  </div>
                </div>

                {/* Notes */}
                {convocation.notes && (
                  <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                    {convocation.notes}
                  </div>
                )}

                {/* Participants */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Users className="h-4 w-4" />
                    <span>Participants ({convocation.employees.length})</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {convocation.employees.map((emp) => (
                      <Badge
                        key={emp.id}
                        variant="secondary"
                        className="bg-gray-100"
                      >
                        <User className="mr-1 h-3 w-3" />
                        {emp.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex justify-end gap-2">
                  {convocation.status === "draft" && (
                    <Button
                      size="sm"
                      onClick={() => handleSendConvocation(convocation.id)}
                      disabled={sendingId === convocation.id}
                    >
                      {sendingId === convocation.id ? (
                        <>
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Envoyer
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteConvocation(convocation.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal Nouvelle convocation */}
      {showNewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Nouvelle convocation</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowNewForm(false);
                    resetForm();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formation */}
              <div className="space-y-2">
                <Label htmlFor="formation">Formation *</Label>
                <Select
                  id="formation"
                  value={formData.formationId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      formationId: e.target.value,
                    }))
                  }
                >
                  <option value="">Sélectionner une formation...</option>
                  {formations.map((formation) => (
                    <option key={formation.id} value={formation.id}>
                      {formation.name}
                      {formation.category ? ` (${formation.category})` : ""}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Dates */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Date de début *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Date de fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    min={formData.startDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Horaires */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Heure de début *</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={formData.startTime.split(":")[0]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startTime: `${e.target.value}:${prev.startTime.split(":")[1]}`,
                        }))
                      }
                      className="w-20"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, "0")}>
                          {i.toString().padStart(2, "0")}
                        </option>
                      ))}
                    </Select>
                    <span className="text-lg font-medium">:</span>
                    <Select
                      value={formData.startTime.split(":")[1]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          startTime: `${prev.startTime.split(":")[0]}:${e.target.value}`,
                        }))
                      }
                      className="w-20"
                    >
                      {["00", "15", "30", "45"].map((min) => (
                        <option key={min} value={min}>
                          {min}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Heure de fin *</Label>
                  <div className="flex items-center gap-2">
                    <Select
                      value={formData.endTime.split(":")[0]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          endTime: `${e.target.value}:${prev.endTime.split(":")[1]}`,
                        }))
                      }
                      className="w-20"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i.toString().padStart(2, "0")}>
                          {i.toString().padStart(2, "0")}
                        </option>
                      ))}
                    </Select>
                    <span className="text-lg font-medium">:</span>
                    <Select
                      value={formData.endTime.split(":")[1]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          endTime: `${prev.endTime.split(":")[0]}:${e.target.value}`,
                        }))
                      }
                      className="w-20"
                    >
                      {["00", "15", "30", "45"].map((min) => (
                        <option key={min} value={min}>
                          {min}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              {/* Lieu */}
              <div className="space-y-2">
                <Label htmlFor="location">Lieu *</Label>
                <Input
                  id="location"
                  placeholder="Ex: Salle de formation A, Centre externe..."
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Participants */}
              <div className="space-y-2">
                <Label>
                  Participants * ({formData.selectedEmployees.length}{" "}
                  sélectionné(s))
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Rechercher un employé..."
                    className="pl-10"
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                  />
                </div>
                <div className="min-h-[60px] max-h-48 overflow-y-auto rounded-lg border p-2">
                  {employees.length === 0 ? (
                    <p className="p-4 text-center text-gray-500">
                      Aucun employé disponible
                    </p>
                  ) : (
                    (() => {
                      const filteredEmployees = employees.filter(
                        (emp) =>
                          emp.firstName
                            .toLowerCase()
                            .includes(employeeSearch.toLowerCase()) ||
                          emp.lastName
                            .toLowerCase()
                            .includes(employeeSearch.toLowerCase()) ||
                          (emp.department &&
                            emp.department
                              .toLowerCase()
                              .includes(employeeSearch.toLowerCase())),
                      );
                      if (filteredEmployees.length === 0) {
                        return (
                          <p className="p-4 text-center text-gray-500">
                            Aucun employé trouvé pour &quot;{employeeSearch}
                            &quot;
                          </p>
                        );
                      }
                      return filteredEmployees.map((employee) => (
                        <label
                          key={employee.id}
                          className="flex cursor-pointer items-center gap-3 rounded p-2 hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={formData.selectedEmployees.includes(
                              employee.id,
                            )}
                            onChange={() => handleEmployeeToggle(employee.id)}
                          />
                          <div className="flex-1">
                            <span className="font-medium">
                              {employee.lastName.toUpperCase()}{" "}
                              {employee.firstName}
                            </span>
                            {employee.department && (
                              <span className="ml-2 text-sm text-gray-500">
                                ({employee.department})
                              </span>
                            )}
                          </div>
                          {employee.email && (
                            <span className="text-xs text-gray-400">
                              {employee.email}
                            </span>
                          )}
                        </label>
                      ));
                    })()
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes / Instructions</Label>
                <textarea
                  id="notes"
                  className="w-full rounded-lg border p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                  placeholder="Instructions particulières pour les participants..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewForm(false);
                    resetForm();
                  }}
                  disabled={sending}
                >
                  Annuler
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCreateConvocation(true)}
                  disabled={sending}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Enregistrer brouillon
                </Button>
                <Button
                  onClick={() => handleCreateConvocation(false)}
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Créer et envoyer
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
}

