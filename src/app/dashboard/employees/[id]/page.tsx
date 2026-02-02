import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompanyFilter } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Edit,
  FileSignature,
  FileText,
  QrCode,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddCertificateDialog } from "./add-certificate-dialog";
import { CertificatesTable } from "./certificates-table";
import { SignatureStatus } from "./signature-status";

async function getEmployee(id: string) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      photo: true,
      employeeId: true,
      position: true,
      department: true,
      site: true,
      team: true,
      medicalCheckupDate: true,
      managerEmail: true,
      createdAt: true,
      qrToken: true,
      manager: {
        select: { id: true, firstName: true, lastName: true },
      },
      certificates: {
        where: { isArchived: false },
        include: {
          formationType: {
            select: {
              id: true,
              name: true,
              category: true,
              defaultValidityMonths: true,
            },
          },
        },
        orderBy: { expiryDate: "asc" },
      },
    },
  });

  return employee;
}

async function getFormationTypes() {
  const companyFilter = await getCompanyFilter();
  return prisma.formationType.findMany({
    where: { isActive: true, ...companyFilter },
    orderBy: { name: "asc" },
  });
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [employee, formationTypes] = await Promise.all([
    getEmployee(id),
    getFormationTypes(),
  ]);

  if (!employee) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/employees">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {employee.lastName} {employee.firstName}
            </h1>
            <p className="text-gray-500">{employee.position}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/p/${employee.qrToken}`} target="_blank">
            <Button variant="outline">
              <QrCode className="mr-2 h-4 w-4" />
              Voir le passeport
            </Button>
          </Link>
          <Link href={`/dashboard/employees/${employee.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Employee Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              {employee.photo ? (
                <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-blue-100">
                  <Image
                    src={employee.photo}
                    alt={`${employee.firstName} ${employee.lastName}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-600">
                  {employee.firstName[0]}
                  {employee.lastName[0]}
                </div>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Matricule</span>
                <Badge variant="secondary">{employee.employeeId}</Badge>
              </div>
              {employee.email && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span>{employee.email}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Professional Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Informations professionnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Fonction</span>
              <span className="font-medium">{employee.position}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Service</span>
              <span>{employee.department}</span>
            </div>
            {employee.manager && (
              <div className="flex justify-between">
                <span className="text-gray-500">Manager</span>
                <Link
                  href={`/dashboard/employees/${employee.manager.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {employee.manager.lastName} {employee.manager.firstName}
                </Link>
              </div>
            )}
            {employee.managerEmail && (
              <div className="flex justify-between">
                <span className="text-gray-500">Email manager</span>
                <span>{employee.managerEmail}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medical Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Suivi médical
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Visite médicale</span>
              <span>{formatDate(employee.medicalCheckupDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Créé le</span>
              <span>{formatDate(employee.createdAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Signature électronique */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Signature électronique du passeport
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SignatureStatus
            employeeId={employee.id}
            employeeEmail={employee.email}
            employeeName={`${employee.firstName} ${employee.lastName}`}
            managerEmail={employee.managerEmail}
            managerName={
              employee.manager
                ? `${employee.manager.firstName} ${employee.manager.lastName}`
                : undefined
            }
          />
        </CardContent>
      </Card>

      {/* Certificates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Formations & Habilitations ({employee.certificates.length})
          </CardTitle>
          <AddCertificateDialog
            employeeId={employee.id}
            formationTypes={formationTypes}
          />
        </CardHeader>
        <CardContent>
          {employee.certificates.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <p>Aucune formation enregistrée.</p>
            </div>
          ) : (
            <CertificatesTable
              certificates={employee.certificates}
              employeeId={employee.id}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
