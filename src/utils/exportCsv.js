import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAllSales } from '../database/db';

/**
 * Génère un fichier CSV de l'historique des ventes (s'ouvre nativement
 * dans Excel, Google Sheets, LibreOffice...) et ouvre le menu de partage
 * natif pour l'enregistrer ou l'envoyer.
 */
export async function exportSalesToCsv(storeId) {
  const sales = await getAllSales(storeId);

  const header = 'Date;Produits;Sous-total;Remise;Total;Client;Points\n';
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
  const fileUri = FileSystem.cacheDirectory + `ventes_${Date.now()}.csv`;

  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Exporter les ventes' });
  }

  return fileUri;
}
