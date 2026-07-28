import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAllSales } from '../database/db';

/**
 * Generates a CSV file of the sales history (opens natively in Excel,
 * Google Sheets, LibreOffice...) and opens the native share menu to
 * save or send it.
 */
export async function exportSalesToCsv(storeId) {
  const sales = await getAllSales(storeId);

  const header = 'Date;Products;Subtotal;Discount;Total;Customer;Points\n';
  const rows = sales.map((sale) => {
    const itemsStr = sale.items.map((i) => `${i.quantity}x ${i.name}`).join(', ');
    const date = new Date(sale.date).toISOString();
    return [
      date,
      `"${itemsStr}"`,
      sale.subtotal,
      sale.discount,
      sale.total,
      sale.customer_phone || '',
      sale.points_earned || 0,
    ].join(';');
  });

  const csvContent = header + rows.join('\n');
  const fileUri = FileSystem.cacheDirectory + `sales_${Date.now()}.csv`;

  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Export sales' });
  }

  return fileUri;
}
