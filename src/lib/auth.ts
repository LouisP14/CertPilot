import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[auth] Missing credentials");
          }
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        if (process.env.NODE_ENV !== "production") {
          console.log("[auth] Login attempt", {
            email,
            databaseUrl: process.env.DATABASE_URL,
          });
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: { company: true },
        });

        if (!user) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[auth] User not found", { email });
          }
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("[auth] Invalid password", { email });
          }
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          companyId: user.companyId,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session: updateData }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.companyId = user.companyId;
        token.mustChangePassword = user.mustChangePassword;
      }
      // Mettre à jour le token quand session.update() est appelé côté client
      if (trigger === "update" && updateData) {
        if (updateData.name) token.name = updateData.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.companyId = token.companyId as string | null;
        session.user.mustChangePassword = token.mustChangePassword as boolean;
        // Propager name depuis le token (mis à jour via update())
        if (token.name) session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});

// Helper pour obtenir le companyId de l'utilisateur connecté
export async function getCompanyId() {
  const session = await auth();
  if (!session?.user?.companyId) {
    throw new Error("CompanyId non trouvé dans la session");
  }
  return session.user.companyId;
}

// Helper pour obtenir le filtre de company selon le rôle de l'utilisateur
export async function getCompanyFilter() {
  const session = await auth();

  // TOUS les utilisateurs sont filtrés par companyId - pas d'exception
  // Même les SUPER_ADMIN ne voient que les données de leur entreprise
  if (session?.user?.companyId) {
    return { companyId: session.user.companyId };
  }

  // Utilisateur sans company - ne doit rien voir
  return { companyId: "no-company-access" };
}

// Helper pour vérifier si l'utilisateur a accès à une ressource
export async function checkCompanyAccess(resourceCompanyId: string | null) {
  const session = await auth();
  if (!session?.user) {
    return false;
  }

  // Les super admins ont accès à tout
  if (session.user.role === "SUPER_ADMIN") {
    return true;
  }

  return session.user.companyId === resourceCompanyId;
}
