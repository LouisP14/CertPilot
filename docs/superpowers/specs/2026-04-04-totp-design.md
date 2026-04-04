# TOTP (Authentification à deux facteurs) — Spec

**Date :** 2026-04-04
**Scope :** Compte ADMIN uniquement, optionnel, activable/désactivable depuis les Paramètres
**Récupération :** Aucune (désactivation manuelle via DB si téléphone perdu)

---

## 1. Dépendances

```bash
npm install otplib qrcode
npm install --save-dev @types/qrcode
```

- `otplib` — génération de secret TOTP + vérification de codes (RFC 6238)
- `qrcode` — génération de QR code en base64 pour affichage dans le navigateur

---

## 2. Schéma Prisma

Deux champs ajoutés au modèle `User` :

```prisma
totpSecret  String?          // secret TOTP, null si non configuré
totpEnabled Boolean @default(false)
```

Mise à jour via `prisma db push`.

---

## 3. Routes API

### `POST /api/auth/totp/setup`
- Auth requise (session ADMIN)
- Génère un nouveau secret via `authenticator.generateSecret()` (otplib)
- Construit l'URI otpauth pour le QR code : `otpauth://totp/CertPilot:<email>?secret=<secret>&issuer=CertPilot`
- Génère le QR code en base64 via `qrcode.toDataURL(uri)`
- **Ne stocke pas encore le secret en DB** (pas encore activé)
- Retourne `{ secret, qrCode }` — le secret en clair est affiché une seule fois

### `POST /api/auth/totp/enable`
- Auth requise (session ADMIN)
- Body : `{ secret, code }` — le secret généré à l'étape setup + le code 6 chiffres saisi
- Vérifie le code via `authenticator.verify({ token: code, secret })`
- Si valide : met à jour `totpSecret = secret, totpEnabled = true` en DB
- Audit trail : action `UPDATE` / entité `USER` — "TOTP activé"
- Retourne `{ success: true }`

### `POST /api/auth/totp/disable`
- Auth requise (session ADMIN)
- Body : `{ code }` — code 6 chiffres de confirmation
- Récupère le `totpSecret` en DB, vérifie le code
- Si valide : met à jour `totpSecret = null, totpEnabled = false`
- Audit trail : action `UPDATE` / entité `USER` — "TOTP désactivé"
- Retourne `{ success: true }`

---

## 4. Flux de connexion (auth.ts)

Le provider `credentials` accepte un champ optionnel `totpCode` :

```ts
credentials: {
  email: { label: "Email", type: "email" },
  password: { label: "Mot de passe", type: "password" },
  totpCode: { label: "Code TOTP", type: "text" },  // nouveau
}
```

Logique dans `authorize()` après validation email/password :

| Situation | Comportement |
|-----------|-------------|
| `totpEnabled = false` | Retourne l'utilisateur normalement (inchangé) |
| `totpEnabled = true` + pas de `totpCode` | `throw new Error("TOTP_REQUIRED")` |
| `totpEnabled = true` + `totpCode` invalide | `throw new Error("TOTP_INVALID")` |
| `totpEnabled = true` + `totpCode` valide | Retourne l'utilisateur |

---

## 5. Page de login (login/page.tsx)

Ajout d'une étape conditionnelle via un state `step: "credentials" | "totp"` :

- **Étape 1** (`credentials`) : formulaire email + password actuel, inchangé
- Si l'erreur retournée est `"TOTP_REQUIRED"` → passe en étape `"totp"`
- **Étape 2** (`totp`) :
  - Affiche un champ code 6 chiffres (input numérique, autoFocus)
  - Bouton "Vérifier"
  - Le submit re-appelle `signIn()` avec email + password (mémorisés en state) + totpCode
  - Si erreur `"TOTP_INVALID"` → message "Code incorrect, réessayez"
  - Lien "← Retour" pour revenir à l'étape 1

---

## 6. UI Paramètres (nouveau composant totp-settings.tsx)

Ajouté dans l'accordéon Paramètres, section "Sécurité" (ou nouvel accordéon dédié).

**État désactivé :**
- Badge gris "Désactivé"
- Bouton "Activer la double authentification"
- Clic → appel `/api/auth/totp/setup` → affiche :
  - QR code à scanner (image base64)
  - Le secret en clair (pour saisie manuelle)
  - Champ code 6 chiffres
  - Bouton "Confirmer l'activation"
  - Submit → `/api/auth/totp/enable`

**État activé :**
- Badge vert "Actif"
- Bouton "Désactiver"
- Clic → affiche champ code de confirmation
- Submit → `/api/auth/totp/disable`

---

## 7. Audit Trail

| Action | Description enregistrée |
|--------|------------------------|
| Activation TOTP | `UPDATE` / `USER` — "Double authentification activée" |
| Désactivation TOTP | `UPDATE` / `USER` — "Double authentification désactivée" |

---

## 8. Sécurité

- Le secret TOTP est stocké en clair en DB (PostgreSQL Railway — accès restreint). Pas de chiffrement additionnel pour cette v1.
- Le QR code n'est généré qu'à la demande et jamais persisté côté serveur.
- La fenêtre de tolérance otplib : ±1 pas de 30 secondes (défaut otplib, couvre les décalages d'horloge normaux).
- Pas de codes de secours en v1 — perte du téléphone = contact support → désactivation DB.
