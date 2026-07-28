import * as SQLite from 'expo-sqlite';
import { computePointsEarned } from '../utils/loyalty';

let db;

/**
 * Ouvre (ou crée) la base SQLite locale et crée les tables si besoin :
 * - stores : magasins (multi-boutique)
 * - products : catalogue (avec description, poids, image, prix d'achat) — par magasin
 * - suppliers : fournisseurs (nom, téléphone)
 * - customers : programme de fidélité (téléphone → points cumulés)
 * - sales : historique des ventes — par magasin
 */
export async function initDatabase() {
  db = await SQLite.openDatabaseAsync('smartcash_v4.db');

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      phone TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL DEFAULT 1,
      barcode TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      weight TEXT,
      image TEXT,
      price REAL NOT NULL,
      cost_price REAL NOT NULL DEFAULT 0,
      supplier_id INTEGER,
      stock INTEGER NOT NULL,
      UNIQUE(store_id, barcode)
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      points INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL DEFAULT 1,
      date TEXT NOT NULL,
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      customer_phone TEXT,
      points_earned INTEGER NOT NULL DEFAULT 0
    );
  `);

  const storeCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM stores');
  if (storeCount.count === 0) {
    await seedStores();
  }

  const row = await db.getFirstAsync('SELECT COUNT(*) as count FROM products');
  if (row.count === 0) {
    await seedProducts();
  }

  return db;
}

async function seedStores() {
  // Deux magasins de démo pour illustrer le multi-boutique.
  await db.runAsync('INSERT INTO stores (name) VALUES (?)', ['Boutique Douala Centre']);
  await db.runAsync('INSERT INTO stores (name) VALUES (?)', ['Boutique Akwa']);
}

async function seedProducts() {
  const supplierResult = await db.runAsync('INSERT INTO suppliers (name, phone) VALUES (?, ?)', [
    'Grossiste Central SARL',
    '6XX XXX XXX',
  ]);
  const supplierId = supplierResult.lastInsertRowId;

  const sample = [
    {
      barcode: '3017620422003',
      name: 'Nutella 400g',
      description: 'Pâte à tartiner chocolat-noisette',
      weight: '400 g',
      image: 'https://placehold.co/300x300/8B4513/ffffff?text=Nutella',
      price: 2500,
      costPrice: 1800,
      stock: 20,
    },
    {
      barcode: '5449000000996',
      name: 'Coca-Cola 33cl',
      description: 'Boisson gazeuse rafraîchissante',
      weight: '33 cl',
      image: 'https://placehold.co/300x300/D2001F/ffffff?text=Coca-Cola',
      price: 500,
      costPrice: 320,
      stock: 50,
    },
    {
      barcode: '7622210449283',
      name: 'Biscuits Oreo',
      description: 'Biscuits sablés fourrés à la crème vanille',
      weight: '154 g',
      image: 'https://placehold.co/300x300/1a1a1a/ffffff?text=Oreo',
      price: 800,
      costPrice: 550,
      stock: 30,
    },
    {
      barcode: '8712100849969',
      name: 'Lait Nido 400g',
      description: 'Lait en poudre enrichi en vitamines',
      weight: '400 g',
      image: 'https://placehold.co/300x300/003a70/ffffff?text=Nido',
      price: 3200,
      costPrice: 2400,
      stock: 15,
    },
    {
      barcode: '6111242112395',
      name: 'Pain de mie',
      description: 'Pain de mie tranché, format familial',
      weight: '500 g',
      image: 'https://placehold.co/300x300/e8b04b/ffffff?text=Pain',
      price: 1000,
      costPrice: 650,
      stock: 25,
    },
  ];

  for (const p of sample) {
    // store_id = 1 : les produits de démo appartiennent au premier magasin
    // ("Boutique Douala Centre"). Le second magasin démarre avec un
    // catalogue vide, à remplir via "Ajouter un produit".
    await db.runAsync(
      'INSERT INTO products (store_id, barcode, name, description, weight, image, price, cost_price, supplier_id, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [1, p.barcode, p.name, p.description, p.weight, p.image, p.price, p.costPrice, supplierId, p.stock]
    );
  }
}

// ---------- Magasins ----------

export async function getAllStores() {
  return await db.getAllAsync('SELECT * FROM stores ORDER BY id');
}

// ---------- Fournisseurs ----------

export async function getAllSuppliers() {
  return await db.getAllAsync('SELECT * FROM suppliers ORDER BY name');
}

/**
 * Retrouve un fournisseur par nom, ou le crée s'il n'existe pas encore.
 * Permet de saisir un fournisseur en texte libre depuis "Ajouter un
 * produit" sans avoir besoin d'un écran de gestion séparé.
 */
export async function getOrCreateSupplier(name) {
  if (!name || !name.trim()) return null;
  const trimmed = name.trim();
  const existing = await db.getFirstAsync('SELECT * FROM suppliers WHERE name = ?', [trimmed]);
  if (existing) return existing.id;
  const result = await db.runAsync('INSERT INTO suppliers (name) VALUES (?)', [trimmed]);
  return result.lastInsertRowId;
}

// ---------- Produits ----------

export async function getProductByBarcode(barcode, storeId) {
  return await db.getFirstAsync(
    `SELECT products.*, suppliers.name AS supplier_name
     FROM products
     LEFT JOIN suppliers ON suppliers.id = products.supplier_id
     WHERE barcode = ? AND store_id = ?`,
    [barcode, storeId]
  );
}

export async function getAllProducts(storeId) {
  return await db.getAllAsync(
    `SELECT products.*, suppliers.name AS supplier_name
     FROM products
     LEFT JOIN suppliers ON suppliers.id = products.supplier_id
     WHERE store_id = ?
     ORDER BY products.name`,
    [storeId]
  );
}

export async function getLowStockProducts(storeId, threshold = 5) {
  return await db.getAllAsync(
    'SELECT * FROM products WHERE store_id = ? AND stock <= ? ORDER BY stock ASC',
    [storeId, threshold]
  );
}

export async function decrementStock(id, quantity) {
  await db.runAsync('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, id]);
}

export async function addProduct({
  storeId,
  barcode,
  name,
  description,
  weight,
  image,
  price,
  costPrice,
  supplierName,
  stock,
}) {
  const supplierId = await getOrCreateSupplier(supplierName);
  await db.runAsync(
    'INSERT INTO products (store_id, barcode, name, description, weight, image, price, cost_price, supplier_id, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [storeId, barcode, name, description || '', weight || '', image || '', price, costPrice || 0, supplierId, stock]
  );
}

// ---------- Fidélité ----------
// Le calcul des points (computePointsEarned) est dans src/utils/loyalty.js,
// pour rester testable indépendamment de la base de données.

export async function addPointsToCustomer(phone, points) {
  if (!phone) return null;
  const existing = await db.getFirstAsync('SELECT * FROM customers WHERE phone = ?', [phone]);
  if (existing) {
    await db.runAsync('UPDATE customers SET points = points + ? WHERE phone = ?', [
      points,
      phone,
    ]);
  } else {
    await db.runAsync('INSERT INTO customers (phone, points) VALUES (?, ?)', [phone, points]);
  }
  return await db.getFirstAsync('SELECT * FROM customers WHERE phone = ?', [phone]);
}

// ---------- Ventes (historique + stats + export) ----------

export async function recordSale({
  storeId,
  items,
  subtotal,
  discount,
  total,
  customerPhone,
  pointsEarned,
}) {
  const date = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO sales (store_id, date, items_json, subtotal, discount, total, customer_phone, points_earned) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [storeId, date, JSON.stringify(items), subtotal, discount, total, customerPhone || null, pointsEarned || 0]
  );
}

export async function getAllSales(storeId) {
  const rows = await db.getAllAsync('SELECT * FROM sales WHERE store_id = ? ORDER BY date DESC', [
    storeId,
  ]);
  return rows.map((r) => ({ ...r, items: JSON.parse(r.items_json) }));
}

export async function getStats(storeId) {
  const sales = await getAllSales(storeId);

  if (sales.length === 0) {
    return { totalSales: 0, avgBasket: 0, topProducts: [] };
  }

  const totalSales = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const avgBasket = totalRevenue / totalSales;

  const productCounts = {};
  for (const sale of sales) {
    for (const item of sale.items) {
      if (!productCounts[item.name]) {
        productCounts[item.name] = 0;
      }
      productCounts[item.name] += item.quantity;
    }
  }

  const topProducts = Object.entries(productCounts)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return { totalSales, avgBasket, topProducts };
}

export function getDb() {
  return db;
}
