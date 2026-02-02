# 🔑 Identifiants de Connexion - CertPilot

## ✅ Identifiants Disponibles

### 👤 Compte DEMO

- **Email:** `demo@certpilot.fr`
- **Mot de passe:** `demo123`
- **Rôle:** ADMIN (entreprise Acme Industries)
- **Accès:** Données de démonstration complètes

### 👑 Compte SUPER ADMIN (Principal)

- **Email:** `admin@passeport-formation.fr`
- **Mot de passe:** `Admin123!`
- **Rôle:** SUPER_ADMIN
- **Accès:** Accès complet à toutes les entreprises

### 👑 Compte SUPER ADMIN (Secondaire)

- **Email:** `admin@certpilot.fr`
- **Mot de passe:** `Admin123!`
- **Rôle:** SUPER_ADMIN
- **Accès:** Accès complet à toutes les entreprises

### 👔 Compte Entreprise Réelle

- **Email:** `louispoulain@aptar.com`
- **Mot de passe:** (Défini par l'utilisateur)
- **Rôle:** ADMIN (entreprise Aptar Pharma Brécey)
- **Accès:** Données de l'entreprise Aptar uniquement

---

## 🔧 Corrections Effectuées

### Problème Identifié

Les comptes SUPER_ADMIN n'avaient pas de `companyId`, ce qui causait un écran noir lors de la connexion. Le code ne gérait pas correctement le cas où un utilisateur SUPER_ADMIN (qui voit toutes les entreprises) n'avait pas de companyId associé.

### Solutions Implémentées

1. **Nouvelle fonction helper** (`getCompanyFilter()`) dans [src/lib/auth.ts](src/lib/auth.ts)
   - Retourne un filtre vide pour les SUPER_ADMIN (accès à tout)
   - Retourne un filtre par companyId pour les utilisateurs normaux
   - Retourne un filtre impossible pour les utilisateurs sans company

2. **Fichiers corrigés** avec le filtre de company approprié :
   - [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx)
   - [src/app/dashboard/employees/page.tsx](src/app/dashboard/employees/page.tsx)
   - [src/app/dashboard/employees/[id]/page.tsx](src/app/dashboard/employees/[id]/page.tsx)
   - [src/app/dashboard/employees/[id]/edit/page.tsx](src/app/dashboard/employees/[id]/edit/page.tsx)
   - [src/app/dashboard/formations/page.tsx](src/app/dashboard/formations/page.tsx)
   - [src/app/dashboard/calendar/page.tsx](src/app/dashboard/calendar/page.tsx)

### Avant

```typescript
// ❌ Ne filtrait pas correctement
const employees = await prisma.employee.findMany({
  where: { isActive: true },
});
```

### Après

```typescript
// ✅ Filtre correctement selon le rôle
const companyFilter = await getCompanyFilter();
const employees = await prisma.employee.findMany({
  where: { isActive: true, ...companyFilter },
});
```

---

## 🚀 Pour Tester

1. Accédez à : http://localhost:3000/login
2. Utilisez l'un des identifiants ci-dessus
3. Vous devriez maintenant voir le dashboard correctement

---

## 📝 Notes Importantes

- Les comptes SUPER_ADMIN voient **toutes** les données de toutes les entreprises
- Les comptes ADMIN voient uniquement les données de **leur entreprise**
- Le compte DEMO contient des données de démonstration prêtes à l'emploi
- Si vous créez un nouvel utilisateur, assurez-vous de lui attribuer un `companyId` (sauf pour les SUPER_ADMIN)

---

_Document créé le 2 février 2026_
