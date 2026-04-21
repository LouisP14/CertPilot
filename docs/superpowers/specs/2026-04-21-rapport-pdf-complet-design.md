# Rapport PDF Complet v2 — Design

## Objectif

Transformer le rapport PDF "Rapport des Passeports Formation" en un document professionnel à 4 parties, cohérent avec la charte CertPilot (bleu #173B56, vert emerald #10B981), utilisable par la Direction, les RH opérationnels et lors d'audits/inspections.

## Structure du document

### Page 1 — Couverture (inchangée)
- Fond #173B56, bande verte accent
- CertPilot en haut à gauche, badge "Rapport officiel" en haut à droite
- Titre "Rapport des Passeports Formation"
- Nom entreprise + date de génération
- 4 cartes stats : Employés / Formations actives / Expirent ce mois / Expirées

### Page 2 — Tableau de bord

**Indicateur global centré :**
- Libellé "Taux de conformité global"
- Valeur en grand (ex: 78%)
- Barre de progression horizontale colorée : vert ≥80%, orange ≥50%, rouge <50%
- Sous-titre : "X formations valides sur Y"

**Tableau conformité par département :**
- Colonnes : Service | Nb employés | Formations valides | Expirant bientôt | Expirées | Taux %
- Couleur conditionnelle sur la colonne Taux : vert ≥80%, orange ≥50%, rouge <50%
- Trié par taux croissant (les plus critiques en premier)
- Si aucun département renseigné : masquer ce tableau

### Page 3 — Alertes prioritaires

**Section 1 — Formations expirées (fond rouge léger)**
- Sous-titre : "X formation(s) nécessitent une action immédiate"
- Tableau : Employé | Service | Formation | Date expiration | Jours de retard
- Colonne "Jours de retard" en rouge gras (valeur absolue)
- Si 0 formations expirées : afficher un message "Aucune formation expirée"

**Section 2 — Expirent dans 30 jours (fond orange léger)**
- Sous-titre : "X formation(s) à renouveler prochainement"
- Tableau : Employé | Service | Formation | Date expiration | Jours restants
- Colonne "Jours restants" en orange gras
- Si 0 : afficher "Aucune formation n'expire dans les 30 prochains jours"

### Pages suivantes — Détail complet

Tableau existant amélioré avec 3 nouvelles colonnes :
- **Site** : site de l'employé (après Service)
- **Organisme** : organisme de formation du certificat (après Validité)
- **Jours restants** : entier (négatif si expiré), coloré rouge/orange/vert (après Organisme)
- Colonne Statut maintenue à la fin

## Architecture technique

### Fonction modifiée : `exportFullReportToPDF` dans `src/lib/pdf-export.ts`

**Type étendu pour `employees` :**
```typescript
employees: {
  firstName: string;
  lastName: string;
  position: string;
  department: string | null;
  site: string | null;           // NOUVEAU
  certificates: {
    formationType: { name: string; category: string | null };
    obtainedDate: Date | null;
    expiryDate: Date | null;
    organism: string | null;     // NOUVEAU
  }[];
}[]
```

**Données calculées côté client (pas de nouvelle requête API) :**
- Taux de conformité global = (certs valides / total certs) * 100
- Conformité par département = groupement depuis employees[]
- Alertes expirées = filtre certs où expiryDate < now
- Alertes 30j = filtre certs où 0 <= daysLeft <= 30

### Route `/api/export/pdf-data` (type=full_report)

Déjà prête — retourne tous les champs scalaires des employees et certificates via Prisma `include`. Il suffit d'étendre le type TypeScript dans `exportFullReportToPDF`.

## Charte graphique

- **Couleurs** : primary #173B56, accent emerald #10B981, warning amber #F59E0B, danger red #EF4444
- **Police** : Helvetica (jsPDF natif), caractères Latin-1 uniquement — pas de guillemets courbes, pas de tirets longs
- **En-têtes de section** : fond coloré (#173B56 ou teinte rouge/orange selon section), texte blanc
- **Tableaux** : alternance de lignes gris clair, en-têtes #173B56 blanc
- **Pas d'emojis, pas de caractères spéciaux Unicode**

## Fichiers modifiés

- `src/lib/pdf-export.ts` : fonction `exportFullReportToPDF` réécrite (pages 2, 3, et colonnes page 4+)
- Aucun autre fichier — les données sont déjà disponibles