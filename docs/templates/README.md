# Templates commerciaux CertPilot

Modèles HTML autonomes pour générer devis et factures manuellement, le temps d'avoir un module intégré dans l'app.

## Usage

1. **Dupliquer** le template correspondant
   ```bash
   cp devis-template.html devis-2026-001-clientX.html
   cp facture-template.html facture-2026-001-clientX.html
   ```
2. **Ouvrir** le fichier dupliqué dans un éditeur de texte (VS Code, Notepad++, etc.)
3. **Remplacer** tous les champs entre `[CROCHETS]` par les vraies valeurs
4. **Ouvrir** dans un navigateur (Chrome/Firefox/Edge)
5. **Imprimer** → **Enregistrer au format PDF** (Ctrl+P → Destination : PDF)

## Champs à remplacer

### Devis — `devis-template.html`
- Numéro : `DEV-[AAAA]-[NNN]` → ex: `DEV-2026-001`
- Dates : émission + validité (typiquement +30 jours)
- Destinataire : raison sociale, contact, adresse, SIRET, email
- Lignes de prestation : désignation, période, quantité, prix HT
- Totaux HT

### Facture — `facture-template.html`
Comme le devis +
- Numéro **séquentiel unique** : `FAC-[AAAA]-[NNN]` → ex: `FAC-2026-001`
- Date d'exécution (date de la prestation, peut différer de l'émission)
- Référence au devis accepté
- Période facturée
- IBAN / BIC pour virement

## ⚠️ Règles de facturation à respecter

1. **Numérotation séquentielle obligatoire** — les numéros de facture doivent se suivre sans rupture (ex: FAC-2026-001, FAC-2026-002, FAC-2026-003). Aucune facture ne peut être supprimée : en cas d'erreur, émettre un avoir (numéro séparé : AV-2026-XXX).

2. **Registre des factures émises** — tenir un tableur/fichier récapitulatif (date, numéro, client, montant HT, statut paiement). Indispensable en cas de contrôle.

3. **Conservation** — conserver chaque facture (émise et reçue) pendant **10 ans** (obligation comptable EI).

4. **Émission dans les délais** — la facture doit être émise au moment de la livraison du service ou au plus tard à la date convenue dans le devis.

5. **Franchise en base TVA** — la mention `TVA non applicable, art. 293B du CGI` est **obligatoire** sur tous les devis et factures. Son absence peut entraîner un redressement fiscal.

## Roadmap

Quand le temps le permettra, ces templates seront remplacés par un module
intégré dans CertPilot avec :
- Numérotation automatique
- Registre persistant
- Envoi par email
- Suivi des encaissements (via Stripe pour les abonnements récurrents)
- Génération PDF serveur (actuellement côté client via jsPDF)