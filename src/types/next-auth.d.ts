import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      companyId: string | null;
      mustChangePassword: boolean;
      managedServices: string[];
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    companyId: string | null;
    mustChangePassword: boolean;
    managedServices: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    id: string;
    companyId: string | null;
    mustChangePassword: boolean;
    managedServices: string[];
  }
}
