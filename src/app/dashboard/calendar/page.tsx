import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { canAccessPage } from "@/lib/plan-features"
import { redirect } from "next/navigation"
import CalendarView from "./view"

export { metadata } from "./view"

export default async function CalendarPage() {
  const session = await auth()
  if (!session?.user?.companyId) redirect("/login")

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    select: { subscriptionPlan: true },
  })

  if (!canAccessPage(company?.subscriptionPlan, '/dashboard/calendar')) {
    redirect('/dashboard/upgrade?feature=calendar&required=Pro')
  }

  return <CalendarView />
}