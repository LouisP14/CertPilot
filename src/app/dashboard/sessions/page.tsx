import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { canAccessPage } from "@/lib/plan-features"
import { redirect } from "next/navigation"
import SessionsView from "./view"

export default async function SessionsPage() {
  const session = await auth()
  if (!session?.user?.companyId) redirect("/login")

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { subscriptionPlan: true },
  })

  if (!canAccessPage(company?.subscriptionPlan, '/dashboard/sessions')) {
    redirect('/dashboard/upgrade?feature=sessions&required=Pro')
  }

  return <SessionsView />
}