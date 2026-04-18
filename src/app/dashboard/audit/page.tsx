import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { canAccessPage } from "@/lib/plan-features"
import { redirect } from "next/navigation"
import AuditView from "./view"

export default async function AuditPage() {
  const session = await auth()
  if (!session?.user?.companyId) redirect("/login")

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { subscriptionPlan: true },
  })

  if (!canAccessPage(company?.subscriptionPlan, '/dashboard/audit')) {
    redirect('/dashboard/upgrade?feature=audit&required=Business')
  }

  return <AuditView />
}