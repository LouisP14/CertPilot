import { createAuditLog } from "@/lib/audit";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await auth();

    if (session?.user) {
      await createAuditLog({
        userId: session.user.id,
        userName: session.user.name,
        userEmail: session.user.email,
        companyId: session.user.companyId,
        action: "LOGOUT",
        entityType: "USER",
        entityId: session.user.id,
        entityName: session.user.name || "",
        description: `Déconnexion de ${session.user.name} (${session.user.email})`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout audit error:", error);
    return NextResponse.json({ success: true });
  }
}
