import type { ComponentType } from "react";

import { CookieBanner } from "@/components/cookie-banner";
import {
  ArrowRight,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  FileText,
  GraduationCap,
  Mail,
  PenTool,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-linear-to-b from-slate-50 to-white">
      {/* Cookie Consent Banner */}
      <CookieBanner />

      {/* Fond décoratif */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-125 w-200 -translate-x-1/2 rounded-full bg-linear-to-br from-emerald-100/60 to-teal-50/40 blur-3xl" />
        <div className="absolute top-96 -right-32 h-96 w-96 rounded-full bg-linear-to-br from-sky-100/50 to-blue-50/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-linear-to-tr from-emerald-50/50 to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-black tracking-tight text-[#173B56]">
              CertPilot
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#fonctionnalites"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-[#173B56]"
            >
              Fonctionnalités
            </a>
            <a
              href="#tarifs"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-[#173B56]"
            >
              Tarifs
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-slate-600 transition-colors hover:text-[#173B56]"
            >
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-slate-600 transition-colors hover:text-[#173B56] sm:block"
            >
              Connexion
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-[#173B56] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition-all hover:bg-[#1e4a6b] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173B56] focus-visible:ring-offset-2"
            >
              Demander une démo
            </Link>
          </div>
        </div>
      </header>

      <main className="relative flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-800">
                <Sparkles className="h-4 w-4" />
                Solution professionnelle B2B
              </div>

              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-[#173B56] sm:text-5xl lg:text-6xl">
                Pilotez vos{" "}
                <span className="bg-linear-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  formations
                </span>{" "}
                en toute sérénité
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                CertPilot centralise vos habilitations, automatise les alertes
                d&apos;expiration, génère les convocations et simplifie vos
                audits. La solution clé en main pour les entreprises exigeantes.
              </p>

              <div className="mt-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  Demander une démo gratuite
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 border-t border-slate-200 pt-8">
                <div>
                  <p className="text-2xl font-black text-[#173B56]">500+</p>
                  <p className="text-sm text-slate-500">Entreprises</p>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div>
                  <p className="text-2xl font-black text-[#173B56]">50k+</p>
                  <p className="text-sm text-slate-500">Habilitations</p>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div>
                  <p className="text-2xl font-black text-[#173B56]">99.9%</p>
                  <p className="text-sm text-slate-500">Disponibilité</p>
                </div>
              </div>
            </div>

            {/* Preview Dashboard */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
                <div className="flex items-center justify-between border-b border-slate-200 bg-linear-to-r from-[#173B56] to-[#1e4a6b] px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Tableau de bord
                    </p>
                    <p className="text-xs text-white/60">Suivi en temps réel</p>
                  </div>
                  <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                    En ligne
                  </span>
                </div>

                <div className="p-5">
                  <div className="grid gap-3">
                    <PreviewRow
                      icon={Users}
                      title="Employés"
                      value="142 actifs"
                      color="blue"
                    />
                    <PreviewRow
                      icon={Shield}
                      title="Habilitations"
                      value="98% conformes"
                      color="emerald"
                    />
                    <PreviewRow
                      icon={Bell}
                      title="Alertes"
                      value="3 à traiter"
                      color="amber"
                    />
                    <PreviewRow
                      icon={Calendar}
                      title="Sessions"
                      value="2 planifiées"
                      color="violet"
                    />
                  </div>
                </div>
              </div>

              {/* Floating card */}
              <div className="absolute -bottom-4 -left-4 hidden w-56 rounded-xl border border-slate-200 bg-white p-4 shadow-xl lg:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#173B56]">
                      Alerte traitée
                    </p>
                    <p className="text-xs text-slate-500">Il y a 2 min</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="fonctionnalites"
          className="border-t border-slate-200 bg-white py-20 lg:py-28"
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <p className="text-sm font-semibold text-emerald-600">
                Fonctionnalités
              </p>
              <h2 className="mt-2 text-3xl font-black text-[#173B56] sm:text-4xl">
                Tout ce dont vous avez besoin
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-600">
                Une plateforme complète pour gérer vos formations et
                habilitations, de A à Z.
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Users}
                title="Gestion des employés"
                description="Fiches complètes avec photo, poste, service et historique de formations. Passeport formation exportable en PDF."
              />
              <FeatureCard
                icon={Shield}
                title="Suivi des habilitations"
                description="Visualisez en un coup d'œil les certifications de chaque collaborateur et leur date d'expiration."
              />
              <FeatureCard
                icon={Bell}
                title="Alertes automatiques"
                description="Recevez des notifications avant l'expiration des habilitations. Seuils personnalisables."
              />
              <FeatureCard
                icon={Calendar}
                title="Planification des sessions"
                description="Organisez vos sessions de formation, gérez les inscriptions et suivez les présences."
              />
              <FeatureCard
                icon={FileText}
                title="Convocations automatiques"
                description="Générez et envoyez automatiquement les convocations par email avec toutes les informations."
              />
              <FeatureCard
                icon={PenTool}
                title="Signature électronique"
                description="Faites signer les attestations de présence directement sur tablette ou ordinateur."
              />
            </div>
          </div>
        </section>

        {/* Screenshots Showcase */}
        <section className="border-t border-slate-200 bg-linear-to-b from-slate-50 to-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <p className="text-sm font-semibold text-emerald-600">
                En images
              </p>
              <h2 className="mt-2 text-3xl font-black text-[#173B56] sm:text-4xl">
                Découvrez l&apos;interface
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-600">
                Une interface moderne, intuitive et professionnelle pour gérer
                toutes vos formations.
              </p>
            </div>

            {/* Main Dashboard Preview */}
            <div className="mt-16 relative">
              <div className="absolute -inset-4 rounded-3xl bg-linear-to-br from-emerald-500/10 to-teal-500/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs font-medium text-slate-500">
                      CertPilot - Tableau de bord
                    </span>
                  </div>
                </div>
                {/* Simulated Dashboard */}
                <MockDashboard />
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <MockFeatureCard type="passeport" />
              <MockFeatureCard type="formations" />
              <MockFeatureCard type="besoins" />
              <MockFeatureCard type="calendrier" />
              <MockFeatureCard type="centres" />
              <MockFeatureCard type="audit" />
            </div>
          </div>
        </section>

        {/* Tarifs */}
        <section
          id="tarifs"
          className="border-t border-slate-200 bg-linear-to-b from-slate-50 to-white py-20 lg:py-28"
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <p className="text-sm font-semibold text-emerald-600">Tarifs</p>
              <h2 className="mt-2 text-3xl font-black text-[#173B56] sm:text-4xl">
                Un prix adapté à votre taille
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-600">
                Toutes les fonctionnalités sont incluses. Vous ne payez
                qu&apos;en fonction du nombre d&apos;employés à gérer.
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-5xl gap-6 lg:grid-cols-4">
              <PricingCard
                name="Starter"
                price={199}
                employees="1-50"
                featured={false}
              />
              <PricingCard
                name="Business"
                price={349}
                employees="51-100"
                featured={true}
              />
              <PricingCard
                name="Enterprise"
                price={599}
                employees="101-200"
                featured={false}
              />
              <PricingCard
                name="Corporate"
                price={1199}
                employees="201-500"
                featured={false}
              />
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-slate-500">
                Plus de 500 employés ?{" "}
                <Link
                  href="/contact"
                  className="font-semibold text-[#173B56] hover:underline"
                >
                  Contactez-nous pour un devis personnalisé
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* CTA Contact */}
        <section
          id="contact"
          className="border-t border-slate-200 bg-[#173B56] py-20 lg:py-28"
        >
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-black text-white sm:text-4xl">
              Prêt à simplifier la gestion de vos formations ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
              Demandez une démonstration personnalisée et découvrez comment
              CertPilot peut transformer votre quotidien.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-sm font-semibold text-white shadow-lg transition-all hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#173B56]"
              >
                Demander une démo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center text-white/60">
              <a
                href="mailto:contact@certpilot.eu"
                className="flex items-center gap-2 transition-colors hover:text-white"
              >
                <Mail className="h-5 w-5" />
                contact@certpilot.eu
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          {/* Main footer content */}
          <div className="grid gap-8 md:grid-cols-4">
            {/* Brand */}
            <div className="md:col-span-1">
              <span className="text-lg font-black text-[#173B56]">
                CertPilot
              </span>
              <p className="mt-2 text-sm text-slate-500">
                La solution complète pour gérer les formations et habilitations
                de vos équipes.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-semibold text-[#173B56]">Navigation</h4>
              <nav className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
                <a href="#fonctionnalites" className="hover:text-[#173B56]">
                  Fonctionnalités
                </a>
                <a href="#tarifs" className="hover:text-[#173B56]">
                  Tarifs
                </a>
                <Link href="/contact" className="hover:text-[#173B56]">
                  Contact
                </Link>
                <Link href="/login" className="hover:text-[#173B56]">
                  Connexion
                </Link>
              </nav>
            </div>

            {/* Légal */}
            <div>
              <h4 className="font-semibold text-[#173B56]">
                Informations légales
              </h4>
              <nav className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
                <Link
                  href="/legal/mentions-legales"
                  className="hover:text-[#173B56]"
                >
                  Mentions légales
                </Link>
                <Link
                  href="/legal/confidentialite"
                  className="hover:text-[#173B56]"
                >
                  Politique de confidentialité
                </Link>
                <Link href="/legal/cgu" className="hover:text-[#173B56]">
                  CGU
                </Link>
                <Link href="/legal/cgv" className="hover:text-[#173B56]">
                  CGV
                </Link>
                <Link href="/legal/cookies" className="hover:text-[#173B56]">
                  Cookies
                </Link>
              </nav>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-[#173B56]">Contact</h4>
              <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
                <a
                  href="mailto:contact@certpilot.eu"
                  className="hover:text-[#173B56]"
                >
                  contact@certpilot.eu
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col items-center justify-center border-t border-slate-200 pt-8">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} CertPilot. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PreviewRow({
  icon: Icon,
  title,
  value,
  color,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  value: string;
  color: "blue" | "emerald" | "amber" | "violet";
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    amber: "bg-amber-100 text-amber-600",
    violet: "bg-violet-100 text-violet-600",
  };

  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${colorClasses[color]}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium text-slate-700">{title}</span>
      </div>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-200 hover:shadow-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[#173B56]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        {description}
      </p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  employees,
  featured,
}: {
  name: string;
  price: number;
  employees: string;
  featured: boolean;
}) {
  const yearlyPrice = Math.round(price * 10);

  return (
    <div
      className={`relative flex flex-col rounded-2xl p-6 ${
        featured
          ? "border-2 border-emerald-500 bg-white shadow-xl shadow-emerald-500/10"
          : "border border-slate-200 bg-white"
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
          Populaire
        </div>
      )}

      <h3 className="text-lg font-semibold text-[#173B56]">{name}</h3>
      <p className="mt-1 text-sm text-slate-500">{employees} employés</p>

      <div className="mt-4">
        <span className="text-4xl font-black text-[#173B56]">{price}€</span>
        <span className="text-slate-500">/mois</span>
      </div>

      <p className="mt-2 text-sm font-semibold text-emerald-700">
        {yearlyPrice}€/an
      </p>
      <p className="text-xs text-slate-500">Économisez 17% en annuel</p>

      <div className="mt-6 space-y-3">
        <IncludedFeature>Toutes les fonctionnalités</IncludedFeature>
        <IncludedFeature>Support prioritaire</IncludedFeature>
        <IncludedFeature>Mises à jour incluses</IncludedFeature>
        <IncludedFeature>Export PDF illimité</IncludedFeature>
      </div>

      <div className="mt-6 flex-1" />

      <Link
        href={`/contact?plan=${name.toLowerCase()}`}
        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
          featured
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700"
            : "border border-slate-300 bg-white text-[#173B56] hover:border-slate-400 hover:bg-slate-50"
        }`}
      >
        Demander un devis
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function IncludedFeature({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
        <Check className="h-3 w-3 text-emerald-600" />
      </div>
      <span className="text-sm text-slate-700">{children}</span>
    </div>
  );
}

// ============ MOCK COMPONENTS ============

function MockDashboard() {
  return (
    <div className="flex bg-slate-50">
      {/* Sidebar */}
      <div className="w-48 bg-[#173B56] p-4 hidden md:block">
        <div className="text-white font-bold text-lg mb-6">CertPilot</div>
        <div className="space-y-2">
          {["Dashboard", "Employés", "Formations", "Sessions", "Besoins"].map(
            (item, i) => (
              <div
                key={item}
                className={`text-sm py-2 px-3 rounded-lg ${i === 0 ? "bg-white/20 text-white" : "text-white/60"}`}
              >
                {item}
              </div>
            ),
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <h2 className="text-xl font-bold text-[#173B56] mb-4">
          Tableau de bord
        </h2>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MockStatCard icon="👥" label="Employés" value="22" color="blue" />
          <MockStatCard
            icon="📋"
            label="Formations"
            value="150"
            color="emerald"
          />
          <MockStatCard
            icon="⚠️"
            label="Expirent bientôt"
            value="12"
            color="amber"
          />
          <MockStatCard icon="❌" label="Expirées" value="45" color="red" />
        </div>

        {/* Charts row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Coverage chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#173B56] text-sm">
                Couverture par formation
              </h3>
              <span className="text-xs text-slate-500">25 formations</span>
            </div>
            <div className="space-y-3">
              <MockProgressBar label="SST" value={91} color="emerald" />
              <MockProgressBar label="Électricien BT" value={41} color="red" />
              <MockProgressBar
                label="Espaces confinés"
                value={41}
                color="red"
              />
              <MockProgressBar label="Habilitation BR" value={41} color="red" />
            </div>
          </div>

          {/* Service conformity */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#173B56] text-sm">
                Conformité par service
              </h3>
            </div>
            <div className="space-y-2">
              <MockServiceRow
                name="Maintenance"
                value="28%"
                formations={20}
                color="amber"
              />
              <MockServiceRow
                name="Production"
                value="65%"
                formations={8}
                color="emerald"
              />
              <MockServiceRow
                name="Logistique"
                value="45%"
                formations={12}
                color="amber"
              />
            </div>
          </div>
        </div>

        {/* Budget widget */}
        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-emerald-600">€</span>
            <h3 className="font-semibold text-[#173B56] text-sm">
              Suivi du Budget 2026
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full w-[18%] bg-emerald-500 rounded-full" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                18% utilisé • 9 098 € / 50 000 €
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockStatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
}) {
  const colors = {
    blue: "bg-blue-50 border-blue-100",
    emerald: "bg-emerald-50 border-emerald-100",
    amber: "bg-amber-50 border-amber-100",
    red: "bg-red-50 border-red-100",
  };
  return (
    <div
      className={`rounded-xl border p-4 ${colors[color as keyof typeof colors]}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-[#173B56]">{value}</p>
    </div>
  );
}

function MockProgressBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colors = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colors[color as keyof typeof colors]}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function MockServiceRow({
  name,
  value,
  formations,
  color,
}: {
  name: string;
  value: string;
  formations: number;
  color: string;
}) {
  const colors = {
    emerald: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    red: "text-red-600 bg-red-50",
  };
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-[#173B56]">{name}</p>
        <p className="text-xs text-slate-500">{formations} formations</p>
      </div>
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[color as keyof typeof colors]}`}
      >
        {value}
      </span>
    </div>
  );
}

function MockFeatureCard({
  type,
}: {
  type:
    | "passeport"
    | "formations"
    | "besoins"
    | "calendrier"
    | "centres"
    | "audit";
}) {
  const configs = {
    passeport: {
      title: "Passeport Formation",
      description:
        "Chaque employé dispose d'un passeport formation complet avec QR Code, signatures électroniques et historique.",
      icon: GraduationCap,
      content: <MockPasseport />,
    },
    formations: {
      title: "Catalogue des Formations",
      description:
        "Gérez votre catalogue de formations avec catégories, validités et services concernés.",
      icon: FileText,
      content: <MockFormations />,
    },
    besoins: {
      title: "Besoins de Formation",
      description:
        "Détection automatique des besoins avec priorisation et estimation des coûts.",
      icon: Bell,
      content: <MockBesoins />,
    },
    calendrier: {
      title: "Planning & Calendrier",
      description:
        "Visualisez les sessions planifiées, les expirations et les absences en un coup d'œil.",
      icon: Calendar,
      content: <MockCalendrier />,
    },
    centres: {
      title: "Centres de Formation",
      description:
        "Gérez vos partenaires, comparez les offres et négociez les meilleurs tarifs.",
      icon: Users,
      content: <MockCentres />,
    },
    audit: {
      title: "Audit Trail",
      description:
        "Traçabilité complète de toutes les actions pour vos audits de conformité.",
      icon: Shield,
      content: <MockAudit />,
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:border-emerald-200 hover:shadow-xl">
      {/* Mock UI */}
      <div className="aspect-[16/10] overflow-hidden bg-slate-50 p-3">
        {config.content}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-[#173B56]">
            {config.title}
          </h3>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {config.description}
        </p>
      </div>
    </div>
  );
}

function MockPasseport() {
  return (
    <div className="h-full bg-white rounded-lg border border-slate-200 overflow-hidden text-[10px]">
      <div className="bg-[#173B56] px-3 py-2 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-xs">PASSEPORT FORMATIONS</p>
          <p className="text-white/60 text-[8px]">
            Habilitations et autorisations
          </p>
        </div>
        <span className="text-emerald-400 text-[8px] font-bold">CertPilot</span>
      </div>
      <div className="p-3 flex gap-3">
        <div className="w-12 h-12 rounded-lg bg-[#173B56] flex items-center justify-center text-white font-bold text-sm">
          SB
        </div>
        <div className="flex-1">
          <p className="font-bold text-[#173B56]">BERNARD Sophie</p>
          <p className="text-slate-500">Technicien maintenance</p>
        </div>
        <div className="w-10 h-10 bg-slate-100 rounded border-2 border-dashed border-slate-300" />
      </div>
      <div className="px-3 pb-2">
        <p className="text-emerald-600 font-medium mb-1">
          ✓ Formations valides (5)
        </p>
        <div className="space-y-1">
          {["SST", "CACES R489", "Habilitation BR"].map((f) => (
            <div
              key={f}
              className="flex justify-between bg-slate-50 px-2 py-1 rounded"
            >
              <span className="text-slate-600">{f}</span>
              <span className="text-emerald-600 font-medium">Valide</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MockFormations() {
  return (
    <div className="h-full bg-white rounded-lg border border-slate-200 overflow-hidden text-[10px]">
      <div className="px-3 py-2 border-b border-slate-100">
        <p className="font-bold text-[#173B56] text-xs">
          Catalogue des Formations
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {[
          { name: "SST", cat: "SST", service: "Tous", validity: "24 mois" },
          {
            name: "CACES Nacelle",
            cat: "R486",
            service: "Maintenance",
            validity: "60 mois",
          },
          {
            name: "Électricien BT",
            cat: "B0S44",
            service: "Maintenance",
            validity: "36 mois",
          },
          {
            name: "Espaces confinés",
            cat: "R447",
            service: "Production",
            validity: "36 mois",
          },
        ].map((f) => (
          <div
            key={f.name}
            className="px-3 py-2 flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-[#173B56]">{f.name}</p>
              <p className="text-slate-500">{f.cat}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[8px]">
                {f.service}
              </span>
              <p className="text-slate-500 mt-0.5">{f.validity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockBesoins() {
  return (
    <div className="h-full bg-white rounded-lg border border-slate-200 overflow-hidden text-[10px]">
      <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
        <p className="font-bold text-[#173B56] text-xs">Besoins de Formation</p>
        <span className="text-amber-600 font-bold">22 détectés</span>
      </div>
      <div className="divide-y divide-slate-100">
        {[
          {
            name: "Espaces confinés",
            priority: "Critique",
            cost: "4 359 €",
            persons: 6,
          },
          {
            name: "ATEX niveau 1",
            priority: "Critique",
            cost: "2 947 €",
            persons: 4,
          },
          {
            name: "Habilitation BR",
            priority: "Urgent",
            cost: "2 280 €",
            persons: 2,
          },
        ].map((b) => (
          <div
            key={b.name}
            className="px-3 py-2 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-1 h-8 rounded-full ${b.priority === "Critique" ? "bg-red-500" : "bg-amber-500"}`}
              />
              <div>
                <p className="font-medium text-[#173B56]">{b.name}</p>
                <span
                  className={`inline-block px-1.5 py-0.5 rounded-full text-[8px] ${b.priority === "Critique" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}
                >
                  {b.priority}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#173B56]">{b.cost}</p>
              <p className="text-slate-500">{b.persons} pers.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockCalendrier() {
  return (
    <div className="h-full bg-white rounded-lg border border-slate-200 overflow-hidden text-[10px]">
      <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
        <p className="font-bold text-[#173B56] text-xs">Janvier 2026</p>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="w-2 h-2 rounded-full bg-red-500" />
        </div>
      </div>
      <div className="p-2">
        <div className="grid grid-cols-7 gap-px text-center text-[8px] text-slate-500 mb-1">
          {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px">
          {Array.from({ length: 31 }, (_, i) => {
            const day = i + 1;
            const hasEvent = [7, 15, 25, 29, 30].includes(day);
            const isToday = day === 26;
            return (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center rounded text-[9px] ${
                  isToday
                    ? "bg-blue-500 text-white font-bold"
                    : hasEvent
                      ? "bg-emerald-100 text-emerald-700 font-medium"
                      : "text-slate-600"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MockCentres() {
  return (
    <div className="h-full bg-white rounded-lg border border-slate-200 overflow-hidden text-[10px]">
      <div className="px-3 py-2 border-b border-slate-100">
        <p className="font-bold text-[#173B56] text-xs">Centres de Formation</p>
      </div>
      <div className="p-2 grid grid-cols-2 gap-2">
        {[
          { name: "AFPA Rouen", badge: "Partenaire", discount: "-15%" },
          { name: "AFTRAL", badge: "Partenaire", discount: "-8%" },
          { name: "GRETA Normandie", badge: "Partenaire", discount: "-10%" },
          { name: "CNAM", badge: "Partenaire", discount: "-20%" },
        ].map((c) => (
          <div key={c.name} className="border border-slate-200 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold text-[#173B56] truncate">{c.name}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-1 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[8px]">
                {c.badge}
              </span>
              <span className="px-1 py-0.5 rounded bg-blue-100 text-blue-700 text-[8px]">
                {c.discount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockAudit() {
  return (
    <div className="h-full bg-white rounded-lg border border-slate-200 overflow-hidden text-[10px]">
      <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
        <p className="font-bold text-[#173B56] text-xs">Audit Trail</p>
        <span className="text-slate-500">190 entrées</span>
      </div>
      <div className="divide-y divide-slate-100">
        {[
          {
            action: "Modification",
            type: "Entreprise",
            detail: "CertPilot (name)",
            time: "2 min",
            color: "blue",
          },
          {
            action: "Signature",
            type: "Signature",
            detail: "Passeport M. DAVID",
            time: "4 min",
            color: "orange",
          },
          {
            action: "Signature",
            type: "Signature",
            detail: "Passeport S. BERNARD",
            time: "5 min",
            color: "orange",
          },
          {
            action: "Modification",
            type: "Formation",
            detail: "Agent chaufferie (service)",
            time: "19 min",
            color: "blue",
          },
        ].map((a, i) => (
          <div key={i} className="px-3 py-2 flex items-center gap-2">
            <span
              className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${a.color === "blue" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}
            >
              {a.action}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[#173B56] truncate">{a.detail}</p>
            </div>
            <span className="text-slate-400 text-[8px]">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
