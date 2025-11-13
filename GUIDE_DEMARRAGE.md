# 🚀 Guide de Démarrage - Presence Reunion

## Étape 1: Authentification Convex (À FAIRE UNE SEULE FOIS)

### Sur VOTRE ordinateur, ouvrez un terminal et exécutez:

```bash
# Naviguez vers le dossier du projet
cd presence-reunion

# Connectez-vous à Convex (ouvrira un navigateur)
npx convex login

# Sélectionnez votre deployment: gregarious-gnat-103
```

Cela va:
1. Ouvrir une page web pour vous connecter
2. Sauvegarder vos credentials
3. Vous permettre d'utiliser le deployment "gregarious-gnat-103"

## Étape 2: Lancer l'Application

Une fois authentifié, utilisez le script de démarrage:

```bash
npm run start:all
```

Ou manuellement dans 2 terminaux différents:

### Terminal 1: Convex
```bash
npx convex dev
```

### Terminal 2: Next.js
```bash
npm run dev
```

## Étape 3: Accéder à l'Application

Ouvrez votre navigateur sur: **http://localhost:3000**

## 🎯 Résumé Rapide

1. **Une seule fois**: `npx convex login`
2. **À chaque démarrage**: `npm run start:all`
3. **Ouvrir**: http://localhost:3000

## ❓ Problèmes?

- Si Convex ne se connecte pas → Vérifiez que vous êtes bien authentifié
- Si l'app ne se charge pas → Attendez que Convex soit bien démarré (terminal 1)
- Si vous voyez des erreurs → Vérifiez que les 2 terminaux sont actifs

## 📧 Variables d'Environnement

Le fichier `.env.local` est déjà configuré avec:
```
CONVEX_DEPLOYMENT=dev:gregarious-gnat-103
NEXT_PUBLIC_CONVEX_URL=https://gregarious-gnat-103.convex.cloud
```

Pas besoin de le modifier!
