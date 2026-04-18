import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { canAccessPage } from "@/lib/plan-features"
import { redirect } from "next/navigation"
import TrainingNeedsView from "./view"

export default async function TrainingNeedsPage() {
  const session = await auth()
  if (!session?.user?.companyId) redirect("/login")

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { subscriptionPlan: true },
  })

  if (!canAccessPage(company?.subscriptionPlan, '/dashboard/training-needs')) {
    redirect('/dashboard/upgrade?feature=training-needs&required=Pro')
  }

  return <TrainingNeedsView />
}