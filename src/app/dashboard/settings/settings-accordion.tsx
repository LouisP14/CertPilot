"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bell,
  Building,
  CalendarCog,
  ChevronDown,
  ShieldCheck,
  TrendingUp,
  Users,
  UserCog,
} from "lucide-react";
import { useState } from "react";
import {
  AlertRecipientAdmin,
  AlertRecipientsForm,
} from "./alert-recipients-form";
import { ReferenceManager } from "./reference-manager";
import {
  AlertForm,
  CompanyForm,
  PlanningConstraintsForm,
  PriorityForm,
} from "./settings-forms";
import { TotpSettings } from "./totp-settings";
import { UsersManager } from "./users-manager";

interface SettingsAccordionProps {
  company: {
    id: string;
    name: string;
    adminEmail: string | null;
    siret: string | null;
    alertThresholds: string;
    priorityThresholds: string;
    notifyEmployee: boolean;
    notifyManager: boolean;
  } | null;
  availableServices: string[];
  totpEnabled: boolean;
  adminUsers: AlertRecipientAdmin[];
}

export function SettingsAccordion({
  company,
  availableServices,
  totpEnabled,
  adminUsers,
}: SettingsAccordionProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    company: true,
    alerts: false,
    recipients: false,
    priority: false,
    planning: false,
    references: false,
    users: false,
    totp: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600">Configuration de l&apos;application</p>
      </div>

      <div className="space-y-4">
        {/* Company Info */}
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection("company")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                <div>
                  <CardTitle>Informations entreprise</CardTitle>
                  <CardDescription className="mt-1">
                    Ces informations apparaissent sur les passeports
                  </CardDescription>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  openSections.company ? "rotate-180" : ""
                }`}
              />
            </div>
          </CardHeader>
          {openSections.company && (
            <CardContent className="pt-0">
              <CompanyForm
                company={
                  company
                    ? {
                        id: company.id,
                        name: company.name,
                        adminEmail: company.adminEmail,
                        siret: company.siret,
                      }
                    : null
                }
              />
            </CardContent>
          )}
        </Card>

        {/* Alert Settings */}
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection("alerts")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-600" />
                <div>
                  <CardTitle>Configuration des alertes</CardTitle>
                  <CardDescription className="mt-1">
                    Définissez quand les alertes sont envoyées avant expiration
                  </CardDescription>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  openSections.alerts ? "rotate-180" : ""
                }`}
              />
            </div>
          </CardHeader>
          {openSections.alerts && (
            <CardContent className="pt-0">
              <AlertForm
                alertThresholds={company?.alertThresholds || "90,60,30,7"}
                notifyEmployee={company?.notifyEmployee ?? false}
                notifyManager={company?.notifyManager ?? false}
              />
            </CardContent>
          )}
        </Card>

        {/* Alert Recipients */}
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection("recipients")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-emerald-600" />
                <div>
                  <CardTitle>Destinataires des alertes</CardTitle>
                  <CardDescription className="mt-1">
                    Choisissez quels administrateurs reçoivent les alertes
                    habilitations et les rappels Passeport Prévention
                  </CardDescription>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  openSections.recipients ? "rotate-180" : ""
                }`}
              />
            </div>
          </CardHeader>
          {openSections.recipients && (
            <CardContent className="pt-0">
              <AlertRecipientsForm
                admins={adminUsers}
                companyAdminEmail={company?.adminEmail ?? null}
              />
            </CardContent>
          )}
        </Card>

        {/* Priority Thresholds */}
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection("priority")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <div>
                  <CardTitle>Seuils de priorité des besoins</CardTitle>
                  <CardDescription className="mt-1">
                    Définissez à partir de combien de jours un besoin devient
                    Critique, Urgent ou Normal
                  </CardDescription>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  openSections.priority ? "rotate-180" : ""
                }`}
              />
            </div>
          </CardHeader>
          {openSections.priority && (
            <CardContent className="pt-0">
              <PriorityForm
                priorityThresholds={company?.priorityThresholds || "7,30,60"}
              />
            </CardContent>
          )}
        </Card>

        {/* Planning Constraints */}
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection("planning")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCog className="h-5 w-5 text-emerald-600" />
                <div>
                  <CardTitle>Contraintes de planification</CardTitle>
                  <CardDescription className="mt-1">
                    Définissez les limites pour la planification automatique des
                    formations
                  </CardDescription>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  openSections.planning ? "rotate-180" : ""
                }`}
              />
            </div>
          </CardHeader>
          {openSections.planning && (
            <CardContent className="pt-0">
              <PlanningConstraintsForm />
            </CardContent>
          )}
        </Card>

        {/* Reference Data Management */}
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection("references")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <CardTitle>Gestion du personnel</CardTitle>
                  <CardDescription className="mt-1">
                    Gérez les fonctions, services, sites et équipes de votre
                    entreprise
                  </CardDescription>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  openSections.references ? "rotate-180" : ""
                }`}
              />
            </div>
          </CardHeader>
          {openSections.references && (
            <CardContent className="pt-0">
              <div className="space-y-3">
                <ReferenceManager
                  type="FUNCTION"
                  label="Fonction"
                  placeholder="Ex: Technicien, Chef d'équipe..."
                />
                <ReferenceManager
                  type="SERVICE"
                  label="Service"
                  placeholder="Ex: Maintenance, Production..."
                />
                <ReferenceManager
                  type="SITE"
                  label="Site"
                  placeholder="Ex: Rouen, Paris, Lyon..."
                />
                <ReferenceManager
                  type="TEAM"
                  label="Équipe"
                  placeholder="Ex: Équipe A, Équipe Nuit..."
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Users / Managers Management */}
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection("users")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-indigo-600" />
                <div>
                  <CardTitle>Utilisateurs</CardTitle>
                  <CardDescription className="mt-1">
                    Gérez les accès managers de votre entreprise
                  </CardDescription>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  openSections.users ? "rotate-180" : ""
                }`}
              />
            </div>
          </CardHeader>
          {openSections.users && (
            <CardContent className="pt-0">
              <UsersManager availableServices={availableServices} />
            </CardContent>
          )}
        </Card>

        {/* Sécurité - Double authentification */}
        <Card>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection("totp")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-violet-600" />
                <div>
                  <CardTitle>Double authentification (2FA)</CardTitle>
                  <CardDescription className="mt-1">
                    Renforcez la sécurité de votre compte avec un code TOTP
                  </CardDescription>
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-500 transition-transform ${
                  openSections.totp ? "rotate-180" : ""
                }`}
              />
            </div>
          </CardHeader>
          {openSections.totp && (
            <CardContent className="pt-0">
              <TotpSettings totpEnabled={totpEnabled} />
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
