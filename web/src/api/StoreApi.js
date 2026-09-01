/**
 * Storefront API — backed by the project's own PocketBase database
 * (`store_products` + `store_variants`), NOT Hostinger's e-commerce API.
 *
 * The exported functions keep the same shapes the UI was already consuming,
 * so components need no changes beyond the checkout flow.
 */
import pocketbaseClient from '@/lib/pocketbaseClient';
import { apiServerClient } from '@/lib/apiServerClient';

export const formatCurrency = (priceInCents, currencyInfo) => {
  if (!currencyInfo || priceInCents === null || priceInCents === undefined) {
    return "";
  }

  const { code, symbol, template, decimal_digits } = currencyInfo;
  const currencyDisplay = symbol || code || "KES";
  const digits = Number.isInteger(decimal_digits) ? decimal_digits : 2;
  const amount = (priceInCents / Math.pow(10, digits)).toFixed(digits);

  if (template) {
    return template.replace("$1", amount);
  }

  return `${currencyDisplay}${amount}`;
};

const DEFAULT_CURRENCY_INFO = { code: "KES", symbol: "KSh", template: "KSh $1", decimal_digits: 2 };

const currencyInfoFor = (currency) => {
  if (!currency || currency === "KES" || currency === "eur") return DEFAULT_CURRENCY_INFO;
  return { ...DEFAULT_CURRENCY_INFO, code: currency, symbol: currency, template: `${currency} $1` };
};

const extractVariantOptions = (options) =>
  (options || []).map((opt) => ({
    id: opt?.id || "",
    option_id: opt?.option_id || "",
    variant_id: opt?.variant_id || "",
    value: opt?.value || "",
  }));

const extractProductOptions = (options) =>
  (options || []).map((opt) => ({
    id: opt?.id || "",
    title: opt?.title || "",
    values: (opt?.values || []).map((v) => ({
      id: v?.id || "",
      option_id: v?.option_id || "",
      value: v?.value || "",
    })),
  }));

const extractImages = (images) =>
  (images || []).map((img) => ({
    url: img?.url || "",
    order: img?.order || 0,
    type: img?.type || "",
  }));

const extractCollections = (collections) =>
  (collections || []).map((col) => ({
    product_id: col?.product_id || "",
    collection_id: col?.collection_id || "",
    order: col?.order || 0,
  }));

const extractAdditionalInfo = (info) =>
  (info || []).map((item) => ({
    id: item?.id || "",
    title: item?.title || "",
    content: item?.content || "",
    order: item?.order || 0,
  }));

const mapVariant = (record) => {
  const currencyInfo = currencyInfoFor(record.currency);

  return {
    id: record.id,
    title: record.title || "",
    image_url: record.image_url || null,
    sku: record.sku || null,
    price_in_cents: record.price_in_cents || 0,
    sale_price_in_cents: record.sale_price_in_cents || null,
    currency: record.currency || "KES",
    currency_info: currencyInfo,
    price_formatted: formatCurrency(record.price_in_cents || 0, currencyInfo),
    sale_price_formatted: formatCurrency(record.sale_price_in_cents || null, currencyInfo),
    manage_inventory: Boolean(record.manage_inventory),
    weight: null,
    options: extractVariantOptions(record.options),
    inventory_quantity: record.inventory_quantity ?? null,
    booking_event: null,
  };
};

const mapProduct = (record) => {
  const variants = (record.expand?.store_variants || []).map(mapVariant);
  const purchasableVariant = variants.find((v) => v.sale_price_in_cents) || variants[0] || null;
  const priceInCents = purchasableVariant
    ? purchasableVariant.sale_price_in_cents ?? purchasableVariant.price_in_cents
    : 0;

  return {
    id: record.id,
    title: record.title || "",
    subtitle: record.subtitle || "",
    ribbon_text: record.ribbon_text || "",
    description: record.description || "",
    image: record.thumbnail_url || "",
    price_in_cents: priceInCents,
    currency: purchasableVariant?.currency || "KES",
    price_formatted: formatCurrency(priceInCents, DEFAULT_CURRENCY_INFO),
    purchasable: record.purchasable !== false,
    order: record.sort_order || 0,
    site_product_selection: null,
    images: extractImages(record.images),
    options: extractProductOptions(record.options),
    variants,
    collections: extractCollections(record.collections),
    additional_info: extractAdditionalInfo(record.additional_info),
    seo_settings: null,
    type: { value: record.type || "physical" },
    custom_fields: [],
    related_products: [],
    reviews_analytics: null,
    slug: record.slug || "",
  };
};

const expandProduct = async (record) => {
  const variants = await pocketbaseClient.collection("store_variants").getFullList({
    filter: pocketbaseClient.filter("product = {:id}", { id: record.id }),
    sort: "sort_order",
  });
  return mapProduct({ ...record, expand: { store_variants: variants } });
};

// ---------------------------------------------------------------------------
// Catalogue queries
// ---------------------------------------------------------------------------

/**
 * List products. Same shape the UI consumed from Hostinger.
 */
export async function getProducts({ offset, limit, sort_by, order, type, collection_ids } = {}) {
  const filterParts = [];
  if (type) filterParts.push(`type = "${type}"`);

  const variantsPromise = pocketbaseClient.collection("store_variants").getFullList({ sort: "sort_order" });
  const productsPromise = pocketbaseClient.collection("store_products").getList(
    typeof offset === "number" ? Math.floor(offset / (limit || 50)) : 1,
    limit || 50,
    {
      sort: "sort_order",
      ...(filterParts.length ? { filter: filterParts.join(" && ") } : {}),
    },
  );

  const [variants, productsPage] = await Promise.all([variantsPromise, productsPromise]);

  const variantsByProduct = new Map();
  for (const variant of variants) {
    if (!variantsByProduct.has(variant.product)) variantsByProduct.set(variant.product, []);
    variantsByProduct.get(variant.product).push(variant);
  }

  let products = productsPage.items.map((record) =>
    mapProduct({ ...record, expand: { store_variants: variantsByProduct.get(record.id) || [] } }),
  );

  if (Array.isArray(collection_ids) && collection_ids.length > 0) {
    products = products.filter((p) =>
      p.collections.some((c) => collection_ids.includes(c.collection_id)),
    );
  }

  if (sort_by) {
    const dir = (order || "ASC").toUpperCase() === "DESC" ? -1 : 1;
    products = [...products].sort((a, b) => {
      const av = sort_by === "price" ? a.price_in_cents : a[sort_by] ?? 0;
      const bv = sort_by === "price" ? b.price_in_cents : b[sort_by] ?? 0;
      return av > bv ? dir : av < bv ? -dir : 0;
    });
  }

  return {
    count: productsPage.totalItems,
    offset: offset || 0,
    limit: limit || 50,
    products,
  };
}

/**
 * Fetch a single product by id or slug.
 */
export async function getProduct(id, { field = "id" } = {}) {
  const record =
    field === "slug"
      ? await pocketbaseClient.collection("store_products").getFirstListItem(
          pocketbaseClient.filter("slug = {:slug}", { slug: id }),
        )
      : await pocketbaseClient.collection("store_products").getOne(id);

  return expandProduct(record);
}

export async function getProductBySlug(slug) {
  return getProduct(slug, { field: "slug" });
}

/**
 * Live inventory for the given products' variants.
 * Kept for the existing call signature (`fields: 'inventory_quantity'`).
 */
export async function getProductQuantities({ product_ids = [] } = {}) {
  const filter = product_ids.map((id) => `product = "${id}"`).join(" || ");
  const variants = await pocketbaseClient.collection("store_variants").getFullList(
    filter ? { filter } : {},
  );

  return {
    variants: variants.map((v) => ({ id: v.id, inventory_quantity: v.inventory_quantity ?? null })),
  };
}

// ---------------------------------------------------------------------------
// Checkout — fully local. No Hostinger checkout session anymore.
//
// An order is created in PocketBase (`store_orders`, via the project's own
// backend, which holds the superuser credentials), then the client-side
// M-Pesa dialog drives payment through /mpesa/stkpush. On payment success
// the backend marks the order paid and the M-Pesa receipt is recorded.
// ---------------------------------------------------------------------------

/**
 * Create a pending order in `store_orders` through the backend.
 * Returns the order record.
 */
export async function createOrder({ items, customer, currency = "KES" }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cannot create an order with no items");
  }

  const variantIds = items.map((item) => item.variant_id);
  const variants = await pocketbaseClient.collection("store_variants").getFullList({
    filter: variantIds.map((id) => `id = "${id}"`).join(" || "),
  });
  const variantById = new Map(variants.map((v) => [v.id, v]));

  const itemsSnapshot = [];
  let totalInCents = 0;

  for (const item of items) {
    const variant = variantById.get(item.variant_id);
    if (!variant) {
      throw new Error(`A product in your cart is no longer available`);
    }

    const unitPrice = variant.sale_price_in_cents ?? variant.price_in_cents;
    const quantity = Math.max(1, Number(item.quantity) || 1);

    if (variant.manage_inventory && variant.inventory_quantity != null && quantity > variant.inventory_quantity) {
      throw new Error(`Not enough stock (only ${variant.inventory_quantity} left)`);
    }

    totalInCents += unitPrice * quantity;
    itemsSnapshot.push({
      variant_id: variant.id,
      product_id: variant.product,
      title: variant.title,
      unit_price_in_cents: unitPrice,
      quantity,
    });
  }

  const response = await apiServerClient.fetch("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items_snapshot: itemsSnapshot,
      total_in_cents: totalInCents,
      currency,
      customer_email: customer?.email || "",
      customer_name: customer?.name || "",
      user: customer?.external_id || null,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || `Order creation failed (HTTP ${response.status})`);
  }

  return response.json();
}
