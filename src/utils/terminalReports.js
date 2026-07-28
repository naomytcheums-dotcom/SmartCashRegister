import { getStats, getAllSales } from '../database/db';
import { formatFCFA } from './format';
import { formatDateTime } from './formatDate';
import { computeMargin } from './margin';

// Metro (l'outil qui fait tourner l'app en développement) relaie
// automatiquement tout console.log() fait depuis le téléphone vers le
// terminal du PC en temps réel. On s'en sert pour afficher le dashboard
// et l'historique directement dans l'invite de commande, comme demandé.

const LINE = '─'.repeat(48);

export async function logDashboardToTerminal(storeId) {
  const stats = await getStats(storeId);

  console.log('\n');
  console.log(LINE);
  console.log('📊  SMARTCASHREGISTER — TABLEAU DE BORD');
  console.log(LINE);

  if (stats.totalSales === 0) {
    console.log('Aucune vente enregistrée pour le moment.');
    console.log(LINE + '\n');
    return;
  }

  console.log(`Ventes totales      : ${stats.totalSales}`);
  console.log(`Panier moyen         : ${formatFCFA(stats.avgBasket)}`);

  const allSales = await getAllSales(storeId);
  const totalMargin = allSales.reduce((sum, sale) => {
    const saleMargin = sale.items.reduce((itemSum, item) => {
      const { margin } = computeMargin(item.price, item.costPrice);
      return itemSum + margin * item.quantity;
    }, 0);
    return sum + saleMargin;
  }, 0);
  console.log(`Marge totale estimée : ${formatFCFA(totalMargin)}`);

  console.log('');
  console.log('Produits les plus vendus :');
  stats.topProducts.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name} — ${p.quantity} unité(s)`);
  });
  console.log(LINE + '\n');
}

export async function logHistoryToTerminal(storeId) {
  const sales = await getAllSales(storeId);

  console.log('\n');
  console.log(LINE);
  console.log('🧾  SMARTCASHREGISTER — HISTORIQUE DES VENTES');
  console.log(LINE);

  if (sales.length === 0) {
    console.log('Aucune vente pour le moment.');
    console.log(LINE + '\n');
    return;
  }

  sales.forEach((sale, index) => {
    const date = formatDateTime(sale.date);
    console.log(`\nVente #${sales.length - index} — ${date}`);
    sale.items.forEach((item) => {
      console.log(`   ${item.quantity}x ${item.name} — ${formatFCFA(item.price * item.quantity)}`);
    });
    if (sale.discount > 0) {
      console.log(`   Remise : -${formatFCFA(sale.discount)}`);
    }
    console.log(`   TOTAL : ${formatFCFA(sale.total)}`);
    if (sale.customer_phone) {
      console.log(`   Client : ${sale.customer_phone} (+${sale.points_earned} pts)`);
    }
  });
  console.log('\n' + LINE + '\n');
}
