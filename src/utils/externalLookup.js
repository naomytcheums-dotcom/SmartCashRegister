/**
 * Recherche un produit dans Open Food Facts — une base de données
 * mondiale, gratuite et ouverte, qui référence des millions de vrais
 * produits du quotidien par code-barres (sans clé API nécessaire).
 *
 * C'est ce qui permet à l'app de reconnaître QUASIMENT N'IMPORTE QUEL
 * produit du commerce, même s'il n'a jamais été ajouté manuellement à
 * ton propre catalogue local.
 *
 * Le prix et le stock restent toujours saisis par toi ensuite (aucune
 * base publique ne connaît le prix pratiqué dans TON magasin).
 */
export async function lookupProductExternally(barcode) {
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );
    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      return null;
    }

    const p = data.product;
    return {
      name: p.product_name || p.product_name_fr || p.generic_name || '',
      description: p.generic_name || p.categories || '',
      weight: p.quantity || '',
      image: p.image_front_url || p.image_url || '',
    };
  } catch (e) {
    // Pas de connexion, ou API indisponible : on retombe simplement sur
    // le flux "produit inconnu" classique, sans planter le scan.
    return null;
  }
}
