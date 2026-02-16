# Registre des traitements (interne)

## 1) Gestion des comptes utilisateurs

- Finalité: authentification, gestion des accès
- Base légale: exécution du contrat
- Données: nom, email, rôle, logs de connexion
- Durée: durée du contrat + 12 mois pour logs de sécurité
- Mesures: hash mot de passe, contrôle d'accès, audit

## 2) Gestion des employés et habilitations

- Finalité: suivi réglementaire des habilitations/formations
- Base légale: obligation légale employeur / intérêt légitime
- Données: identité, poste, service, certificats, dates d'expiration
- Données potentiellement sensibles: informations liées au suivi médical selon usage client
- Durée: selon politique client + contrat
- Mesures: isolation par entreprise, rôles, sauvegarde, audit trail

## 3) Alertes et convocations

- Finalité: envoi de rappels d'expiration et convocations
- Base légale: exécution du contrat
- Données: email admin, nom/prénom employé, formation, date
- Sous-traitants: fournisseur email transactionnel
- Durée: logs d'envoi selon politique interne

## 4) Export et reporting

- Finalité: portabilité et contrôle interne client
- Base légale: exécution du contrat
- Données: datasets employés/formations/validités
- Mesures: accès authentifié, filtrage companyId, traçabilité

## Gouvernance

- Responsable produit conformité: À compléter
- Contact RGPD: contact@certpilot.eu
- Dernière revue: 16/02/2026
