# Presence Reunion - Application Convex

Application de gestion de présence construite avec Next.js 14 et Convex.

## 🚀 Configuration

Cette application est configurée avec Convex Development (Cloud):
- **Deployment**: gregarious-gnat-103
- **URL**: https://gregarious-gnat-103.convex.cloud

## 📦 Installation

```bash
npm install
```

## 🏃‍♂️ Développement

Pour lancer l'application en mode développement:

```bash
# Terminal 1: Lancer le serveur de développement Convex
npx convex dev

# Terminal 2: Lancer l'application Next.js
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🗂️ Structure du projet

```
presence-reunion/
├── app/                    # Application Next.js (App Router)
│   ├── components/         # Composants React
│   │   └── ConvexClientProvider.tsx
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Page d'accueil
│   └── globals.css        # Styles globaux
├── convex/                # Fonctions backend Convex
│   ├── _generated/        # Types générés automatiquement
│   ├── schema.ts          # Schéma de la base de données
│   ├── users.ts           # Queries et mutations pour les utilisateurs
│   └── messages.ts        # Queries et mutations pour les messages
├── .env.local             # Variables d'environnement
└── package.json
```

## 📊 Schéma de données

### Tables

#### `users`
- `name`: string - Nom de l'utilisateur
- `email`: string - Email de l'utilisateur (indexé)
- `createdAt`: number - Timestamp de création

#### `messages`
- `userId`: Id<"users"> - Référence à l'utilisateur
- `content`: string - Contenu du message
- `createdAt`: number - Timestamp de création

## 🔧 Fonctions Convex disponibles

### Users
- `users.list` - Récupère tous les utilisateurs
- `users.getByEmail` - Trouve un utilisateur par email
- `users.create` - Crée un nouvel utilisateur
- `users.remove` - Supprime un utilisateur

### Messages
- `messages.list` - Récupère tous les messages avec les infos utilisateur
- `messages.getByUser` - Récupère les messages d'un utilisateur
- `messages.send` - Envoie un nouveau message
- `messages.remove` - Supprime un message

## 🌟 Fonctionnalités

- ✅ Gestion des utilisateurs (création, liste)
- ✅ Système de messagerie en temps réel
- ✅ Interface utilisateur moderne et responsive
- ✅ Synchronisation temps réel avec Convex
- ✅ TypeScript pour la sécurité des types

## 🔐 Variables d'environnement

Le fichier `.env.local` contient:
```
CONVEX_DEPLOYMENT=dev:gregarious-gnat-103
NEXT_PUBLIC_CONVEX_URL=https://gregarious-gnat-103.convex.cloud
```

## 📚 Documentation

- [Documentation Convex](https://docs.convex.dev)
- [Documentation Next.js](https://nextjs.org/docs)

## 🛠️ Technologies utilisées

- **Next.js 14** - Framework React
- **Convex** - Backend en temps réel
- **TypeScript** - Typage statique
- **React** - Bibliothèque UI
