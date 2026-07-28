/**
 * Looks up a product on Open Food Facts — a free, open, worldwide
 * database that references millions of real everyday products by
 * barcode (no API key required).
 *
 * This is what lets the app recognize ALMOST ANY commercial product,
 * even if it was never manually added to your own local catalog.
 *
 * Price and stock are always entered by you afterwards (no public
 * database knows the price you charge in YOUR store).
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
    // No connection, or the API is unavailable: simply fall back to
    // the classic "unknown product" flow, without crashing the scan.
    return null;
  }
}
