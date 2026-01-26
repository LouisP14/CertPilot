import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { ToastContainer } from "@/components/ui/toast";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

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

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar userRole={session.user?.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={session.user} />
        <main className="flex-1 overflow-auto bg-slate-50 p-6">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}
