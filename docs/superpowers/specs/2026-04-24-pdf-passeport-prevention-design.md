# PDF Passeport de Prévention — Design

## Objectif

Générer un rapport PDF professionnel consolidant l'état des obligations Passeport de Prévention d'une entreprise — à la fois :
- **Aperçu pré-déclaration** : permet à la Direction de valider le contenu avant dépôt du CSV sur moncompteformation.gouv.fr
- **Archive post-déclaration** : document classable prouvant ce qui a été déclaré et quand
- **Document de conformité audit / inspection** : état global de la conformité PP, historique, employés bloqués

Complément au CSV officiel ADF déjà existant (format machine — non lisible), le PDF couvre les usages lecture humaine.

En parallèle, enrichir le "Rapport complet" existant d'une page dédiée PP pour donner de la visibilité sur le sujet dans le rapport global.

## Contexte

- Section Passeport de Prévention présente dans [src/app/dashboard/export/view.tsx](../../src/app/dashboard/export/view.tsx) (composant `PasseportPreventionExport`)
- Route CSV déjà en place : [src/app/api/export/passeport-prevention/route.ts](../../src/app/api/export/passeport-prevention/route.ts) — expose aussi `?stats=1` pour les 4 compteurs
- 5 types de PDF existent : `full_report`, `alerts`, `calendar`, `coverage_formations`, `coverage_services` dans [src/app/api/export/pdf-data/route.ts](../../src/app/api/export/pdf-data/route.ts)
- Fonctions de rendu jsPDF dans [src/lib/pdf-export.ts](../../src/lib/pdf-export.ts) avec charte graphique établie (palette `COLORS`, `drawModernHeader`)
- Cadre réglementaire : décret n° 2025-748, obligation depuis 16/03/2026, pleine application 01/10/2026

## Prérequis : ajouter le SIRET sur `Company`

Aujourd'hui le modèle `Company` ne stocke pas le SIRET des entreprises clientes. Or :
- Le CSV officiel ADF exige la colonne `SIRET_EMPLOYEUR` — actuellement laissée vide (`""`) dans [route.ts:263](../../src/app/api/export/passeport-prevention/route.ts#L263). Risque de rejet au dépôt sur moncompteformation.gouv.fr à partir du 01/10/2026 (pleine application).
- Le PDF audit a plus de valeur avec le SIRET sur la couverture (identification légale standard de tout document RH français).

**Changements à apporter** (inclus dans le scope de cette feature) :

1. **Migration Prisma** — ajouter `siret String?` sur le modèle `Company` (nullable : les clients existants n'en ont pas, on ne veut pas les bloquer)
2. **Settings entreprise** — ajouter un champ "SIRET" dans `src/app/dashboard/settings/settings-forms.tsx` (composant `CompanyForm`), avec validation format 14 chiffres
3. **API settings** — `src/app/api/settings/company/route.ts` accepte et sauvegarde `siret`
4. **Validation SIRET** — nouveau fichier `src/lib/siret.ts` :
   - `isValidSiret(value: string): boolean` : exactement 14 chiffres après suppression des espaces
   - `formatSiret(value: string): string` : affichage formaté `123 456 789 00012` (groupes 3/3/3/5)
   - **Pas de contrôle Luhn** — les SIRETs de La Poste et certaines entités dérogent au Luhn, on évite les faux négatifs
5. **CSV officiel** — `src/app/api/export/passeport-prevention/route.ts` remplit désormais `SIRET_EMPLOYEUR` avec `company.siret` (ou `""` si non renseigné, comportement actuel fallback)
6. **PDF Passeport Prévention** — affiche le SIRET en couverture page 1 (voir ci-dessous). Si non renseigné : mention "SIRET non renseigné — à compléter dans Paramètres > Entreprise" en jaune d'alerte
7. **Pas d'impact** sur le rapport complet existant (le SIRET pourra être ajouté plus tard à sa page de couverture — hors scope immédiat)

## Structure du PDF Passeport Prévention (standalone)

7 pages fixes, générées dans cet ordre :

### Page 1 — Couverture + synthèse

- Header visuel style CertPilot (fond `COLORS.primary`, bande accent `COLORS.accent`, badge entreprise)
- Titre : "Rapport Passeport de Prévention"
- Sous-titre : période (ex: "Année 2026" ou "Année 2026 — T2 (avril - juin)")
- Bloc infos entreprise : nom entreprise + SIRET formaté (`123 456 789 00012`) + date de génération
  - Si SIRET non renseigné → affichage en jaune alerte : "SIRET non renseigné — à compléter dans Paramètres > Entreprise avant le prochain dépôt officiel"
- **4 compteurs en cartes** (mêmes labels que l'UI pour cohérence) : À déclarer (prêtes) / Déjà déclarées / En attente (NIR manquant) / Total concernées
- **Indicateur de conformité PP** : `declared / totalConcerned * 100` — barre de progression colorée (vert ≥ 80%, orange ≥ 50%, rouge < 50%)
- Footer page 1 : mention "Document généré automatiquement par CertPilot"

### Page 2 — À déclarer (prêtes)

- En-tête de section : "Formations à déclarer" + compteur
- Sous-titre : "Ces formations sont prêtes à être déclarées sur moncompteformation.gouv.fr"
- **Tableau** : Employé | Service | Formation | Date d'obtention | NIR (masqué)
- Trié par date d'obtention croissante (priorité aux plus anciennes)
- **NIR masqué** : format `1 85 04 ** *** **` — garde sexe/année/mois, masque département/commune/ordre/clé
- Si 0 formations : encadré "Aucune formation en attente de déclaration sur cette période"

> Note : la colonne "Date limite de déclaration" a été envisagée mais retirée — le texte réglementaire (décret 2025-748) ne fixe pas de délai précis formation → déclaration exploitable sans vérification juridique supplémentaire. À rouvrir si besoin confirmé par un conseil juridique.

### Page 3 — Déjà déclarées sur la période

- En-tête de section : "Déclarations effectuées"
- Sous-titre : "X déclaration(s) déposée(s) sur la période"
- **Groupé par `ppDeclarationRef`** (champ du modèle `Certificate`, = un batch de dépôt CSV) :
  - Titre de groupe : `exp_YYYY-MM-DDT...` — déposé le JJ/MM/AAAA — N formations
  - Tableau interne : Employé | Formation | Date d'obtention
- Si 0 : encadré "Aucune déclaration effectuée sur cette période"

### Page 4 — Bloquées (NIR manquant)

- En-tête de section rouge : "Formations bloquées — NIR manquant"
- Sous-titre : "Action RH requise : compléter la fiche employé avec le NIR pour permettre la déclaration"
- **Tableau** : Employé | Service | Formation | Date d'obtention | Action
- Colonne Action : "Renseigner le NIR dans la fiche employé"
- Si 0 : encadré vert "Aucune formation bloquée — toutes les fiches employés concernées sont complètes"

### Page 5 — Historique complet des déclarations

- En-tête de section : "Historique des déclarations"
- Sous-titre : "Toutes les déclarations effectuées depuis l'activation du module (non filtré par la période sélectionnée)"
- **Tableau synthétique** : Référence | Date de dépôt | Période déclarée | Nb formations | Statut
- Colonne Statut : "Active" si au moins une formation n'a pas été archivée depuis, sinon "Archivée"
- Limité aux 50 dernières déclarations (pagination typographique) — mention "Historique complet disponible dans CertPilot"
- Si 0 : encadré "Aucune déclaration historique"

### Page 6 — Stats par service

- En-tête de section : "Conformité PP par service"
- Sous-titre : "Répartition des formations concernées par département"
- **Tableau** : Service | Nb employés | Formations concernées PP | Déclarées | Bloquées NIR | Taux de déclaration
- Couleur conditionnelle sur Taux : vert ≥ 80%, orange ≥ 50%, rouge < 50%
- Trié par taux croissant (critiques en premier)
- **Page masquée** si : aucun département renseigné dans l'entreprise OU `totalConcerned === 0` (pas de formations PP concernées sur la période)

### Page 7 — Cadre réglementaire

- Encadré pédagogique fixe (non généré dynamiquement) :
  - Décret n° 2025-748 du 8 août 2025
  - Obligation employeur depuis le 16 mars 2026
  - Pleine application au 1er octobre 2026
  - Portail officiel de dépôt : prevention.moncompteformation.gouv.fr
  - Format requis : CSV UTF-8, séparateur `|` (ADF v. 27/02/2026)
  - Rappel RGPD : ce rapport contient des données personnelles — diffusion restreinte

## Section PP dans le Rapport complet

Nouvelle page insérée **entre la page 3 "Alertes prioritaires" et les pages "Détail complet"** → devient la page 4.

Contenu :
- En-tête de section : "Passeport de Prévention"
- Sous-titre : "État des obligations de déclaration (année en cours)"
- **Les 4 compteurs + % conformité** (mêmes cartes que page 1 du PDF standalone, en plus compact)
- **Tableau "À déclarer"** limité à top 10 si > 20, sinon tous : Employé | Service | Formation | Date d'obtention
- **Tableau "Bloqués NIR"** : Employé | Service | Formation
- Footer de page : "Pour le détail complet, générer le rapport Passeport Prévention dédié depuis Import / Export"

Si `totalConcerned === 0` → **page masquée** (l'entreprise n'a pas encore de formations concernées PP, pas la peine de polluer le rapport).

## Architecture technique

### API : extension de `/api/export/pdf-data/route.ts`

**Nouveau cas `type === "passeport_prevention"`** — accepte `year` et `trimestre` :

```typescript
// Pseudo-code
if (type === "passeport_prevention") {
  const dateFilter = parseDateFilter(year, trimestre); // réutilise la fonction de passeport-prevention/route.ts (à extraire dans un util partagé)

  const [certs, history, employees, company] = await Promise.all([
    // Certificats concernés sur la période, avec employé + formationType
    prisma.certificate.findMany({
      where: {
        isArchived: false,
        employee: { companyId, isActive: true },
        formationType: { isConcernedPP: true },
        ...(dateFilter && { obtainedDate: dateFilter }),
      },
      include: { employee: {...}, formationType: {...} },
      orderBy: { obtainedDate: "asc" },
    }),
    // Historique global (sans filtre période) : certificats déjà déclarés, groupés côté serveur par ppDeclarationRef
    // NB : logique identique à l'endpoint existant /api/export/passeport-prevention/history — factoriser dans un helper partagé
    prisma.certificate.findMany({
      where: { employee: { companyId }, formationType: { isConcernedPP: true }, ppDeclaredAt: { not: null }, ppDeclarationRef: { not: null } },
      select: { ppDeclarationRef: true, ppDeclaredAt: true, id: true, isArchived: true, /* + infos employé/formation */ },
      orderBy: { ppDeclaredAt: "desc" },
    }),
    // Employés actifs pour stats par service (département)
    prisma.employee.findMany({
      where: { companyId, isActive: true },
      select: { id: true, department: true, nir: true, /* ... */ },
    }),
    prisma.company.findUnique({ where: { id: companyId }, select: { name: true, siret: true } }),
  ]);

  // Agréger : séparer prêtes / bloquées NIR / déjà déclarées
  // Calculer stats par service
  // Retourner JSON prêt à consommer par le client
}
```

**Format de retour** :

```typescript
{
  companyName: string | null,
  companySiret: string | null,  // brut, 14 chiffres ou null si non renseigné
  period: { year: string, trimestre: string | null, label: string },
  counters: {
    totalConcerned: number,
    exportable: number,
    alreadyDeclared: number,
    skipped: number,  // NIR manquant
  },
  ready: Array<{ employeeName, department, formationName, obtainedDate, nirMasked }>,
  declared: Array<{ ppDeclarationRef, declaredAt, items: Array<{ employeeName, formationName, obtainedDate }> }>,
  blocked: Array<{ employeeName, department, formationName, obtainedDate }>,
  history: Array<{ ppDeclarationRef, declaredAt, count, activeCount, archivedCount, status: "active" | "archived" }>,
  byService: Array<{ department, totalEmployees, totalConcerned, declared, blocked, rate }>,
}
```

**Extension du `type === "full_report"`** — ajouter un sous-objet `passeportPrevention` au retour existant :

```typescript
{
  employees: [...], // inchangé
  companyName: ..., // inchangé
  passeportPrevention: {
    counters: { ... },
    topReady: Array<...>,  // top 10 ou tous si ≤ 20
    blocked: Array<...>,
  } | null,  // null si l'entreprise n'a aucune formation PP concernée
}
```

Par économie de requêtes, réutiliser les données `employees` déjà chargées et filtrer côté serveur (pas de nouvelle requête Prisma si possible).

**Permissions** : MANAGER en lecture seule, renvoyer 403 pour `passeport_prevention` (cohérent avec le CSV). `full_report` reste accessible à tous les rôles authentifiés.

**Audit** : `createAuditLog` avec `action: "EXPORT"`, `entityType: "CERTIFICATE"`, description "Export PDF Passeport Prévention — N formation(s) concernée(s) sur période {year}/{trimestre}".

### Utilitaire NIR — nouveau fichier `src/lib/nir.ts`

```typescript
// Masque un NIR : "185041234567890" → "1 85 04 ** *** **"
export function maskNir(nir: string | null | undefined): string {
  if (!nir) return "";
  const cleaned = nir.replace(/\s/g, "");
  if (cleaned.length < 6) return "*** masqué ***";
  const sexe = cleaned[0];
  const annee = cleaned.substring(1, 3);
  const mois = cleaned.substring(3, 5);
  return `${sexe} ${annee} ${mois} ** *** **`;
}
```

Appliqué côté serveur (dans la route API) avant sérialisation — le NIR complet ne quitte jamais le backend pour les PDFs.

### Extraction de `parseDateFilter`

Fonction actuellement privée dans `src/app/api/export/passeport-prevention/route.ts`. À déplacer dans `src/lib/passeport-prevention-period.ts` pour réutilisation par la route `pdf-data`. Signature et comportement inchangés.

### Client : extension de `src/lib/pdf-export.ts`

**Nouvelle fonction** :

```typescript
export function exportPasseportPreventionToPDF(
  data: PasseportPreventionPdfData,  // type à définir
  companyName?: string,
): void
```

- Suit le pattern des autres fonctions `exportXxxToPDF` — crée un `jsPDF`, utilise `drawModernHeader`, `COLORS`, `autoTable`
- Une fonction helper par page (`drawPpPageReady`, `drawPpPageDeclared`, `drawPpPageBlocked`, `drawPpPageHistory`, `drawPpPageByService`, `drawPpPageRegulatory`)
- Nom de fichier : `rapport-passeport-prevention-2026-T2-2026-04-24.pdf` (avec trimestre) ou `rapport-passeport-prevention-2026-2026-04-24.pdf` (année complète)

**Modification de `exportFullReportToPDF`** :
- Après la page 3 "Alertes prioritaires" et avant la page détail, ajouter un appel `drawFullReportPpSection(doc, data.passeportPrevention, ...)` si `data.passeportPrevention !== null`
- Fonction helper locale, réutilise les mêmes couleurs et patterns que les autres sections
- Pas de modification des autres pages du rapport complet

### UI : `src/app/dashboard/export/view.tsx`

Dans le composant `PasseportPreventionExport` :
- Ajouter un bouton secondaire "Télécharger le rapport PDF" en dessous du bouton vert CSV existant, pleine largeur
- Style : bouton outline (fond blanc, bordure slate-300) avec icône `FileText`, cohérent avec la section Export PDF existante
- Disabled state : `loadingPdf` pendant la génération
- Reprend les valeurs `year` et `trimestre` du state local existant
- Handler `handleExportPasseportPreventionPDF` : fetch `/api/export/pdf-data?type=passeport_prevention&year=...&trimestre=...` puis appelle `exportPasseportPreventionToPDF`
- Erreurs : toast d'erreur si 403 (MANAGER) ou 500

**Aucun changement** dans le dropdown "Type de rapport" de la section Export PDF — le rapport complet bénéficie de la nouvelle section automatiquement.

## Cas limites et erreurs

| Cas | Comportement |
|---|---|
| Entreprise avec 0 formations concernées PP | PDF généré, pages 2-6 affichent des messages vides explicites, page 7 Cadre réglementaire quand même présente |
| Aucun département renseigné | Page 6 "Stats par service" masquée |
| Aucun employé n'a de NIR | Page 2 vide, page 4 remplie avec tous les employés — comportement normal |
| MANAGER tente de générer | 403 côté API, toast d'erreur côté UI |
| Aucune donnée dans `full_report` pour PP | Section PP du rapport complet masquée (pas de page 4 ajoutée) |
| Historique > 50 déclarations | Affiche les 50 dernières + mention "Historique complet disponible dans CertPilot" |
| Employé actif lors de la déclaration, devenu inactif depuis | Inclus dans l'historique (page 5) avec son état figé à la date de déclaration |

## Tests

Pas de tests unitaires sur le rendu jsPDF (visuel, non critique, couverture difficile).

**Tests manuels avant démo** (checklist à exécuter sur l'environnement de dev avec données de test) :
1. Entreprise totalement vide → PDF généré sans crash, tous les encadrés vides affichés
2. Entreprise avec 3 formations concernées (2 prêtes, 1 bloquée NIR) → pages 1-4 correctement remplies, page 5 vide, page 6 si département
3. Entreprise avec historique de déclarations → pages 3 et 5 remplies
4. Rapport complet avec données PP → nouvelle page 4 présente et correctement formatée
5. Rapport complet sans données PP → pas de page 4, structure existante intacte
6. Compte MANAGER → bouton PDF disabled/caché, accès API 403
7. NIR affiché dans le PDF : vérifier format masqué `1 85 04 ** *** **`
8. **SIRET renseigné** dans Paramètres → affiché formaté en page 1 du PDF et présent dans le CSV officiel (colonne `SIRET_EMPLOYEUR`)
9. **SIRET vide** dans Paramètres → alerte jaune sur PDF page 1, CSV avec colonne `SIRET_EMPLOYEUR` vide (comportement fallback)
10. **SIRET invalide** (ex: 13 chiffres ou lettres) → rejet côté client ET côté API avec message d'erreur clair

## Fichiers modifiés

- **Créés** :
  - `src/lib/nir.ts` — utilitaire `maskNir`
  - `src/lib/siret.ts` — utilitaires `isValidSiret` et `formatSiret`
  - `src/lib/passeport-prevention-period.ts` — `parseDateFilter` extrait
  - `prisma/migrations/{timestamp}_add_company_siret/migration.sql` — ajout champ `siret` sur Company
- **Modifiés** :
  - `prisma/schema.prisma` — ajout `siret String?` sur `Company`
  - `src/app/dashboard/settings/settings-forms.tsx` — input SIRET dans `CompanyForm`, validation côté client
  - `src/app/api/settings/company/route.ts` — accepte et sauvegarde `siret` (validation côté serveur via `isValidSiret`)
  - `src/app/api/export/pdf-data/route.ts` — nouveau cas `type=passeport_prevention`, extension de `full_report`
  - `src/app/api/export/passeport-prevention/route.ts` — import depuis le nouvel util `passeport-prevention-period.ts`, remplissage de `SIRET_EMPLOYEUR` avec `company.siret`
  - `src/lib/pdf-export.ts` — nouvelle fonction `exportPasseportPreventionToPDF`, modification de `exportFullReportToPDF`
  - `src/app/dashboard/export/view.tsx` — nouveau bouton dans `PasseportPreventionExport`

## Hors scope

- Génération PDF côté serveur (on reste côté client avec jsPDF pour cohérence avec les autres exports)
- Envoi automatique du PDF par email
- Signature électronique du PDF
- Export au format ODF ou autre
- Historique étendu > 50 déclarations (pagination PDF)
- Personnalisation de la charte graphique par entreprise
- Affichage du SIRET sur la couverture du Rapport complet existant (à faire séparément si besoin — le champ `siret` sera disponible en base après cette feature)
- Contrôle de clé Luhn sur le SIRET (trop restrictif, faux négatifs connus sur certaines entités comme La Poste)
- Récupération automatique du SIRET via API INSEE/Sirene (saisie manuelle uniquement dans cette itération)