# Pricing Redesign — CertPilot

**Date :** 18 avril 2026  
**Statut :** Validé, prêt pour implémentation  
**Contexte :** Le pricing actuel ne différencie pas les features entre plans (seul le headcount change). Objectif : introduire une vraie différenciation par pages accessibles, des tranches d'employés unifiées, et un système de feature gating visible-mais-verrouillé dans le dashboard.

---

## 1. Modèle de pricing retenu

### Principe
**Feature Ladder** — chaque plan donne accès à un ensemble de pages. Le nombre d'employés ajuste le prix au sein du même plan. Pas de "mur" forcé à un seuil d'employés.

### Plans

#### STARTER — "Suivi & alertes de conformité"
Pages accessibles :
- `/dashboard` (tableau de bord principal)
- `/dashboard/employees`
- `/dashboard/formations`
- `/dashboard/settings`
- `/dashboard/profile`

Limites de compte :
- **1 administrateur** (le compte d'origine)
- Pas de gestionnaires (rôle MANAGER non disponible)

| Tranche | Mensuel | Annuel (−17%) |
|---------|---------|---------------|
| 1–50 employés | 69€/mois | 57€/mois |
| 51–150 employés | 109€/mois | 91€/mois |
| 151–300 employés | 149€/mois | 124€/mois |

#### PRO — "Automatisation & documentation"
Pages accessibles : tout Starter +
- `/dashboard/training-needs` (Besoins de formation)
- `/dashboard/sessions` (Planning & sessions)
- `/dashboard/convocations` (Gestion des convocations)
- `/dashboard/calendar` (Vue calendaire)

Limites de compte :
- **3 administrateurs maximum**
- **Gestionnaires limités à 3 services** par compte

| Tranche | Mensuel | Annuel (−17%) |
|---------|---------|---------------|
| 1–50 employés | 149€/mois | 124€/mois |
| 51–150 employés | 229€/mois | 190€/mois |
| 151–300 employés | 329€/mois | 273€/mois |

#### BUSINESS — "Pilotage & reporting avancé"
Pages accessibles : tout Pro +
- `/dashboard/training-centers` (Centres de formation)
- `/dashboard/export` (Import / Export Excel)
- `/dashboard/audit` (Audit trail)

Limites de compte :
- **Administrateurs illimités**
- **Gestionnaires illimités** (aucune limite de services)
- **Support dédié 7j/7**

| Tranche | Mensuel | Annuel (−17%) |
|---------|---------|---------------|
| 1–50 employés | 349€/mois | 290€/mois |
| 51–150 employés | 499€/mois | 414€/mois |
| 151–300 employés | 699€/mois | 580€/mois |

#### ENTERPRISE — Sur devis
- 300+ employés
- Tout Business, tarif adapté au volume
- Contact commercial uniquement — pas de souscription en ligne

### Facturation annuelle
Réduction de 17% sur le prix mensuel. Affichage par défaut en annuel sur la page pricing (ancrage psychologique du prix bas). Toggle mensuel/annuel avec badge "−17%".

### Essai gratuit
14 jours sans CB, accès niveau Business complet. Existant dans l'app, à mettre en avant sous chaque CTA de la page pricing.

---

## 2. Mapping pages → plans

| Page | Starter | Pro | Business |
|------|:-------:|:---:|:--------:|
| /dashboard | ✓ | ✓ | ✓ |
| /dashboard/employees | ✓ | ✓ | ✓ |
| /dashboard/formations | ✓ | ✓ | ✓ |
| /dashboard/settings | ✓ | ✓ | ✓ |
| /dashboard/profile | ✓ | ✓ | ✓ |
| /dashboard/training-needs | 🔒 | ✓ | ✓ |
| /dashboard/sessions | 🔒 | ✓ | ✓ |
| /dashboard/convocations | 🔒 | ✓ | ✓ |
| /dashboard/calendar | 🔒 | ✓ | ✓ |
| /dashboard/training-centers | 🔒 | 🔒 | ✓ |
| /dashboard/export | 🔒 | 🔒 | ✓ |
| /dashboard/audit | 🔒 | 🔒 | ✓ |

**Pendant l'essai :** accès complet à toutes les pages (niveau Business).

---

## 3. Comportement UX — feature gating

### Option retenue : Visible mais verrouillé
Les menus des pages inaccessibles restent visibles dans la sidebar avec un badge coloré (`PRO` ou `BUSINESS`). En cliquant, l'utilisateur arrive sur une page d'upgrade — pas une 404.

**Pourquoi :** crée du désir d'upgrade, éduque sur les features disponibles, signal commercial pour chaque clic.

### Sidebar
- Badge discret à droite du label de navigation
- Badge vert `PRO` si plan = Starter, badge violet `BUSINESS` si plan = Starter ou Pro
- Pas de cadenas géant — subtil mais visible

### Page d'upgrade (`/dashboard/upgrade`)
Paramètres en query string : `?feature=sessions&required=Pro`  
Contenu :
- Nom de la feature et ce qu'elle permet
- Plan requis
- CTA principal : "Passer en Pro" → `/pricing` ou `/contact`
- Liste secondaire des autres features du plan supérieur

---

## 4. Implémentation technique

### 4.1 Fichier central `src/lib/plan-features.ts`
Définit les pages accessibles par plan. Source de vérité unique.

```ts
export const PLAN_PAGES: Record<string, string[]> = {
  Starter: [
    '/dashboard',
    '/dashboard/employees',
    '/dashboard/formations',
    '/dashboard/settings',
    '/dashboard/profile',
  ],
  Pro: [
    // tout Starter +
    '/dashboard/training-needs',
    '/dashboard/sessions',
    '/dashboard/convocations',
    '/dashboard/calendar',
  ],
  Business: [
    // tout Pro +
    '/dashboard/training-centers',
    '/dashboard/export',
    '/dashboard/audit',
  ],
}

export function canAccessPage(plan: string, path: string): boolean {
  const allPages = [
    ...PLAN_PAGES.Starter,
    ...(plan === 'Pro' || plan === 'Business' || plan === 'Enterprise' ? PLAN_PAGES.Pro : []),
    ...(plan === 'Business' || plan === 'Enterprise' ? PLAN_PAGES.Business : []),
  ]
  return allPages.some(p => path.startsWith(p))
}

export function requiredPlanForPage(path: string): string | null {
  if (PLAN_PAGES.Business.some(p => path.startsWith(p))) return 'Business'
  if (PLAN_PAGES.Pro.some(p => path.startsWith(p))) return 'Pro'
  return null
}
```

### 4.2 Guard dans chaque page restreinte
7 pages à modifier (Server Components) :

```ts
// En haut de chaque page restreinte
const session = await auth()
const company = await getCompany(session.user.companyId)

if (!canAccessPage(company.subscriptionPlan, '/dashboard/sessions')) {
  redirect('/dashboard/upgrade?feature=sessions&required=Pro')
}
```

Pages concernées : `training-needs`, `sessions`, `convocations`, `calendar`, `training-centers`, `export`, `audit`.

### 4.3 Composant `<PlanBadge>` pour la sidebar
```tsx
// Affiche "PRO" ou "BUSINESS" si le plan actuel n'a pas accès
<PlanBadge required="Pro" current={plan} />
```

### 4.4 Page `/dashboard/upgrade/page.tsx`
Nouvelle page Next.js recevant `?feature=X&required=Y` en searchParams.

### 4.5 Mise à jour `pricing-toggle.tsx`
- Remplacer les 3 plans fixes actuels par les 3 plans avec 3 tranches chacun
- Ajouter un sélecteur de tranche (dropdown ou segmented control)
- Toggle annuel/mensuel déjà fonctionnel

### 4.6 Mise à jour `src/lib/stripe.ts`
- Créer 9 nouveaux Price IDs Stripe (3 plans × 3 tranches)
- Mettre à jour `employeeLimit` selon la tranche souscrite
- Webhook Stripe à mettre à jour pour stocker plan + tranche

### 4.7 Limites de compte par plan
Nouveau champ à ajouter sur le modèle `Company` (ou via `plan-features.ts`) :

| Plan | adminLimit | managerServiceLimit |
|------|-----------|-------------------|
| Starter | 1 | 0 (MANAGER non disponible) |
| Pro | 3 | 3 services par gestionnaire max |
| Business | illimité | illimité |
| Enterprise | illimité | illimité |

- `POST /api/users` : vérifier `adminLimit` avant création d'un MANAGER (et débloquer création d'ADMIN secondaire pour Pro/Business)
- Dashboard settings : afficher le quota utilisé ("2/3 admins")

### 4.8 Correction BudgetWidget — dashboard Starter
Le `BudgetWidget` sur `/dashboard` contient un lien `href="/dashboard/sessions"` inaccessible en Starter.  
→ Masquer le lien (ou le widget entier) si `plan === 'Starter'`.

---

## 5. Roadmap — features à construire plus tard

### Vrai audit trail légal
L'audit trail actuel est un log générique. La politique de confidentialité engage une rétention 5 ans. Sprint dédié :
- Immuabilité des logs (lecture seule même pour SUPER_ADMIN)
- Hash chaining (intégrité vérifiable)
- Format d'export structuré pour inspecteurs
- Couverture exhaustive de toutes les actions

### Multi-admin complet
Actuellement 1 seul ADMIN par company (hardcodé). Sprint dédié :
- Débloquer création d'admins secondaires (rôle ADMIN)
- Enforcer `adminLimit` par plan en base
- Enforcer limite de services par gestionnaire selon plan

---

## 5. Décisions et rationale

| Décision | Rationale |
|----------|-----------|
| Feature Ladder plutôt que Usage Limits | Plus lisible, pas de sentiment d'être bridé artificiellement |
| Page-level plutôt que feature-level | Simple à maintenir, 1 fichier de config, 7 pages à toucher |
| Visible mais verrouillé | Crée du désir d'upgrade vs cacher = perte d'opportunité |
| Import/Export en Business | Feature à forte valeur pour grandes structures, onboarding géré manuellement par admin pour Starter/Pro |
| Paliers unifiés 1-50/51-150/151-300 | Évite l'asymétrie et la collision Pro/Business des anciens paliers |
| Starter rehaussé à 69€ | Valeur perçue supérieure au prix, évite la désertification vers Pro |
| "Audit trail" conservé | Rétention 5 ans déjà engagée dans CGU, mise en conformité complète prévue |
| Multi-sites supprimé | Champ texte uniquement, aucune gestion réelle par site |
| "Convocations" sans "automatique" | Envoi déclenché manuellement, honnêteté commerciale |