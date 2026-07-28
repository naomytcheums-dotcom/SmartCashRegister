# 🛒 SmartCashRegister

Une caisse mobile intelligente construite avec **React Native (Expo)**.
Scanne un code-barres, reconnaît le produit — même s'il n'a jamais été
ajouté au catalogue — encaisse, imprime un ticket, suit les ventes.

## ✨ Fonctionnalités

| Fonctionnalité | Détail |
|---|---|
| 📷 Scan code-barres | EAN-13, EAN-8, UPC-A, QR, Code128 via la caméra |
| 🌍 Reconnaissance produit mondiale | Si un produit scanné n'est pas dans le catalogue local, l'app interroge [Open Food Facts](https://world.openfoodfacts.org) (base de données publique de millions de produits) pour pré-remplir nom, photo et poids automatiquement |
| 🔊 Feedback scan | Bip sonore + vibration à chaque scan réussi |
| 🛍️ Panier | Quantités ajustables, remise en % ou montant fixe |
| 🧾 Ticket | Récapitulatif, export PDF partageable |
| 🎁 Fidélité | Points cumulés par client (numéro de téléphone) |
| 📸 Photos produit | Galerie ou appareil photo, directement depuis l'app |
| ⚠️ Alerte stock | Bannière automatique si un produit est presque épuisé |
| 📊 Dashboard | Ventes totales, panier moyen, top produits |
| 📤 Export CSV | Historique des ventes exportable, ouvrable dans Excel/Google Sheets |
| 🏬 Multi-magasin | Bascule entre plusieurs boutiques, chaque catalogue/stock/historique est isolé par magasin |
| 💰 Fournisseurs & marges | Fournisseur + prix d'achat par produit, marge totale calculée automatiquement dans le dashboard |
| 🌍 Bilingue | Anglais (par défaut) / Français, changement en un tap |
| 💾 100% hors-ligne | Base de données SQLite locale — fonctionne sans connexion internet (sauf pour la reconnaissance mondiale de produits) |

## 🏗️ Architecture

```
App.js                    → point d'entrée : init DB, providers, navigation
src/database/db.js        → couche SQLite (schéma, requêtes, seed de démo)
src/context/
  CartContext.js            → état global du panier (Context API + hooks)
  StoreContext.js            → magasin actuellement sélectionné (multi-boutique)
src/i18n/                 → traductions (EN/FR) + context de langue
src/navigation/            → stack de navigation (React Navigation)
src/screens/                → un fichier par écran (Home, Scan, Cart, Ticket, AddProduct)
src/utils/
  cartMath.js                → calculs panier PURS (sous-total, remise, total) — testés
  loyalty.js                  → calcul des points de fidélité — testé
  format.js / formatDate.js   → formatage devise/date fiable, sans dépendance Intl
  externalLookup.js            → appel à l'API Open Food Facts
  terminalReports.js           → dashboard/historique affichés dans le terminal dev
  exportCsv.js                 → génération + partage du CSV des ventes
  sound.js                     → lecture du bip de scan
__tests__/                  → tests unitaires Jest (fonctions pures)
```

### Choix techniques et pourquoi

- **SQLite local plutôt qu'un backend distant** : l'app doit fonctionner
  dans des zones à connexion instable (contexte visé : petits commerces).
  Le compromis : pas de synchronisation multi-appareil pour l'instant (voir
  *Roadmap* ci-dessous pour l'architecture prévue).
- **Logique métier extraite en fonctions pures** (`src/utils/`) plutôt que
  mêlée aux composants React : ça permet de la tester unitairement sans
  avoir besoin de monter un composant ou un simulateur — voir `__tests__/`.
- **Pas de `toLocaleString()`** pour les montants/dates : son comportement
  varie selon le moteur JS du téléphone (Hermes n'a pas toujours le support
  `Intl` complet), ce qui peut produire un format inattendu. Le formatage
  est donc fait manuellement (`format.js`, `formatDate.js`), avec un
  résultat garanti identique sur tous les appareils.
- **Dashboard/historique dans le terminal plutôt que dans l'app** :
  choix délibéré pour ce projet — Metro (l'outil de développement Expo)
  relaie automatiquement les `console.log()` du téléphone vers le terminal
  du PC. Ça garde l'app mobile focalisée sur l'encaissement, pendant que
  l'analyse tourne côté "backoffice" dev.

## 🧪 Tests

22 tests unitaires sur la logique métier critique (calcul du panier,
remises, points de fidélité, formatage) :

```bash
npm test
```

## 🚀 Installation

```bash
npm install
npx expo install expo-print expo-sharing expo-av expo-image-picker expo-haptics expo-file-system
npx expo install --fix
npx expo start --lan
```

Scanne le QR code avec l'app **Expo Go** (Android/iOS).

> Le scan caméra et la reconnaissance mondiale de produits ne fonctionnent
> pas dans un simulateur sans caméra/réseau — teste sur un vrai téléphone.

## 🗺️ Roadmap / améliorations futures

Ces pistes ont été étudiées et l'architecture actuelle a été pensée pour
ne pas les bloquer, mais elles n'ont pas été implémentées dans cette
version pour rester focalisé sur un cœur de produit solide et testé :

- **Synchronisation cloud multi-appareil** — l'app est actuellement
  offline-first (SQLite local). Pour synchroniser entre plusieurs
  téléphones/caisses, l'architecture prévue serait : un backend léger
  (Supabase/Firebase), une table `sync_queue` locale qui journalise les
  changements hors-ligne, et une synchronisation en arrière-plan dès que
  la connexion revient (pattern "offline-first with eventual
  consistency").
- **Authentification multi-utilisateurs** — un écran de connexion avec
  gestion de rôles (admin/caissier) par magasin.
- **Widget écran d'accueil** (accès rapide au scan) — non réalisable avec
  Expo Go seul : nécessite un *dev build* natif (EAS Build) avec du code
  natif Android (Kotlin) / iOS (Swift), hors du scope d'un MVP testable
  via Expo Go.
- **Mode sombre**, animations avancées (Reanimated/Lottie).

## 📸 Captures d'écran

*(à ajouter : lance l'app, fais une capture de l'accueil, du scan, et du
ticket, et glisse-les ici — ou enregistre un GIF de 10-15 secondes du
flux complet scan → panier → paiement, ça vaut plus qu'un long texte sur
un GitHub)*

## 🛠️ Stack technique

React Native · Expo (SDK 54) · SQLite (expo-sqlite) · React Navigation ·
Jest · API Open Food Facts

