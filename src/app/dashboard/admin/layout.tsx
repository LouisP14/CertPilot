import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Rediriger vers le dashboard si l'utilisateur n'est pas SUPER_ADMIN
  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
