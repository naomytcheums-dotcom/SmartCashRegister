import { getStats, getAllSales } from '../database/db';
import { formatFCFA } from './format';
import { formatDateTime } from './formatDate';
import { computeMargin } from './margin';

// Metro (the tool that runs the app in development) automatically
// relays every console.log() made from the phone to the PC terminal in
// real time. This is used to display the dashboard and sales history
// directly in the command prompt, as requested.

const LINE = '─'.repeat(48);

export async function logDashboardToTerminal(storeId) {
  const stats = await getStats(storeId);

  console.log('\n');
  console.log(LINE);
  console.log('📊  SMARTCASHREGISTER — DASHBOARD');
  console.log(LINE);

  if (stats.totalSales === 0) {
    console.log('No sales recorded yet.');
    console.log(LINE + '\n');
    return;
  }

  console.log(`Total sales          : ${stats.totalSales}`);
  console.log(`Average basket       : ${formatFCFA(stats.avgBasket)}`);

  const allSales = await getAllSales(storeId);
  const totalMargin = allSales.reduce((sum, sale) => {
    const saleMargin = sale.items.reduce((itemSum, item) => {
      const { margin } = computeMargin(item.price, item.costPrice);
      return itemSum + margin * item.quantity;
    }, 0);
    return sum + saleMargin;
  }, 0);
  console.log(`Estimated total margin: ${formatFCFA(totalMargin)}`);

  console.log('');
  console.log('Best-selling products:');
  stats.topProducts.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name} — ${p.quantity} unit(s)`);
  });
  console.log(LINE + '\n');
}

export async function logHistoryToTerminal(storeId) {
  const sales = await getAllSales(storeId);

  console.log('\n');
  console.log(LINE);
  console.log('🧾  SMARTCASHREGISTER — SALES HISTORY');
  console.log(LINE);

  if (sales.length === 0) {
    console.log('No sales yet.');
    console.log(LINE + '\n');
    return;
  }

  sales.forEach((sale, index) => {
    const date = formatDateTime(sale.date);
    console.log(`\nSale #${sales.length - index} — ${date}`);
    sale.items.forEach((item) => {
      console.log(`   ${item.quantity}x ${item.name} — ${formatFCFA(item.price * item.quantity)}`);
    });
    if (sale.discount > 0) {
      console.log(`   Discount: -${formatFCFA(sale.discount)}`);
    }
    console.log(`   TOTAL: ${formatFCFA(sale.total)}`);
    if (sale.customer_phone) {
      console.log(`   Customer: ${sale.customer_phone} (+${sale.points_earned} pts)`);
    }
  });
  console.log('\n' + LINE + '\n');
}
