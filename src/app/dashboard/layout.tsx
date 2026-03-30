import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { TrialBanner } from "@/components/layout/trial-banner";
import { Providers } from "@/components/providers";
import { ToastContainer } from "@/components/ui/toast";
import { auth } from "@/lib/auth";
import { checkSubscription } from "@/lib/subscription";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: {
    default: "Tableau de bord",
    template: "%s | CertPilot",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Forcer le changement de mot de passe si nécessaire
  if (session.user?.mustChangePassword) {
    redirect("/change-password");
  }

  // Vérifier l'abonnement (sauf SUPER_ADMIN)
  const subscription = await checkSubscription(session.user?.companyId ?? null);

  if (
    !subscription.isActive &&
    session.user?.role !== "SUPER_ADMIN" &&
    subscription.status === "EXPIRED"
  ) {
    redirect("/trial-expired");
  }

  const showTrialBanner =
    subscription.status === "TRIAL" &&
    subscription.daysRemaining !== null &&
    session.user?.role !== "SUPER_ADMIN";

  return (
    <Providers>
      <div className="flex h-screen bg-slate-50">
        <Sidebar userRole={session.user?.role} />
        <div className="flex flex-1 flex-col overflow-hidden">
          {showTrialBanner && (
            <TrialBanner
              daysRemaining={subscription.daysRemaining!}
              trialDays={14}
            />
          )}
          <Header user={session.user} />
          <main className="flex-1 overflow-auto bg-slate-50 p-6">
            {children}
          </main>
        </div>
        <ToastContainer />
      </div>
    </Providers>
  );
}
