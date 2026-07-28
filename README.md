# 🛒 SmartCashRegister

A smart mobile checkout app built with **React Native (Expo)**.
Scan a barcode, recognize the product — even if it was never added to
the catalog before — check out, print a receipt, track sales.

## ✨ Features

| Feature | Detail |
|---|---|
| 📷 Barcode scan | EAN-13, EAN-8, UPC-A, QR, Code128 via the camera |
| 🌍 Worldwide product recognition | If a scanned product isn't in the local catalog, the app queries [Open Food Facts](https://world.openfoodfacts.org) (a public database of millions of products) to auto-fill name, photo, and weight |
| 🔊 Scan feedback | Beep sound + vibration on every successful scan |
| 🛍️ Cart | Adjustable quantities, discount by % or fixed amount |
| 🧾 Receipt | Summary, shareable PDF export |
| 🎁 Loyalty | Points accumulated per customer (phone number) |
| 📸 Product photos | Gallery or camera, directly from the app |
| ⚠️ Stock alert | Automatic banner when a product is running low |
| 📊 Dashboard | Total sales, average basket, top products |
| 📤 CSV export | Sales history exportable, opens in Excel/Google Sheets |
| 🏬 Multi-store | Switch between multiple shops, each with its own isolated catalog/stock/history |
| 💰 Suppliers & margins | Supplier + cost price per product, total margin automatically computed in the dashboard |
| 🌍 Bilingual | English (default) / French, switchable in one tap |
| 💾 100% offline | Local SQLite database — works without an internet connection (except for worldwide product recognition) |

## 🏗️ Architecture

```
App.js                    → entry point: DB init, providers, navigation
src/database/db.js        → SQLite layer (schema, queries, demo seed)
src/context/
  CartContext.js            → global cart state (Context API + hooks)
  StoreContext.js            → currently selected store (multi-store support)
src/i18n/                 → translations (EN/FR) + language context
src/navigation/            → navigation stack (React Navigation)
src/screens/                → one file per screen (Home, Scan, Cart, Ticket, AddProduct)
src/utils/
  cartMath.js                → PURE cart calculations (subtotal, discount, total) — tested
  loyalty.js                  → loyalty points calculation — tested
  margin.js                    → product margin calculation — tested
  format.js / formatDate.js   → reliable currency/date formatting, no Intl dependency
  externalLookup.js            → calls the Open Food Facts API
  terminalReports.js           → dashboard/history printed to the dev terminal
  exportCsv.js                 → sales CSV generation + sharing
  sound.js                     → plays the scan beep
__tests__/                  → Jest unit tests (pure functions)
```

### Technical choices and why

- **Local SQLite instead of a remote backend**: the app needs to work in
  areas with unstable connectivity (target context: small shops). The
  trade-off: no multi-device sync for now (see *Roadmap* below for the
  planned architecture).
- **Business logic extracted into pure functions** (`src/utils/`) rather
  than mixed into React components: this makes it unit-testable without
  mounting a component or a simulator — see `__tests__/`.
- **No `toLocaleString()`** for amounts/dates: its behavior varies
  depending on the phone's JS engine (Hermes doesn't always have full
  `Intl` support), which can produce unexpected formatting. Formatting is
  therefore done manually (`format.js`, `formatDate.js`), guaranteeing
  identical results across all devices.
- **Dashboard/history in the terminal rather than in the app**: a
  deliberate choice for this project — Metro (Expo's dev tool)
  automatically relays `console.log()` calls from the phone to the PC
  terminal. This keeps the mobile app focused on checkout, while
  analytics run on the dev "backoffice" side.

## 🧪 Tests

26 unit tests on critical business logic (cart calculations, discounts,
loyalty points, margins, formatting):

```bash
npm test
```

## 🚀 Getting started

```bash
npm install
npx expo install expo-print expo-sharing expo-av expo-image-picker expo-haptics expo-file-system
npx expo install --fix
npx expo start --lan
```

Scan the QR code with the **Expo Go** app (Android/iOS).

> Camera scanning and worldwide product recognition don't work in a
> simulator without a camera/network — test on a real device.

## 🗺️ Roadmap / future improvements

These directions were studied, and the current architecture was
designed not to block them, but they weren't implemented in this
version in order to stay focused on a solid, well-tested core product:

- **Multi-device cloud sync** — the app is currently offline-first
  (local SQLite). To sync across multiple phones/registers, the planned
  architecture would be: a lightweight backend (Supabase/Firebase), a
  local `sync_queue` table that logs offline changes, and background
  synchronization once the connection is back (an "offline-first with
  eventual consistency" pattern).
- **Multi-user authentication** — a login screen with role management
  (admin/cashier) per store.
- **Home screen widget** (quick access to scan) — not achievable with
  Expo Go alone: it requires a native *dev build* (EAS Build) with
  native Android (Kotlin) / iOS (Swift) code, outside the scope of an
  MVP testable via Expo Go.
- **Dark mode**, advanced animations (Reanimated/Lottie).

## 📸 Screenshots

*(to add: launch the app, take a screenshot of the home screen, the scan
flow, and the receipt, and drop them here — or record a 10-15 second GIF
of the full scan → cart → checkout flow, it's worth more than a wall of
text on a GitHub page)*

## 🛠️ Tech stack

React Native · Expo (SDK 54) · SQLite (expo-sqlite) · React Navigation ·
Jest · Open Food Facts API
