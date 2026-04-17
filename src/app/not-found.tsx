import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md text-center">
        <p className="text-6xl font-bold text-[#173B56]">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">
          Page introuvable
        </h1>
        <p className="mt-2 mb-8 text-slate-600">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-[#173B56] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1e4d6e]"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
