/**
 * One-time migration: pull the product catalogue from Hostinger's e-commerce
 * API and store it in the project's own PocketBase database
 * (`store_products` + `store_variants`). Re-running is safe — existing
 * records are matched by `external_id` and updated in place.
 *
 * Usage:  node src/scripts/seed-store-from-hostinger.js
 */
import { pocketbaseClient } from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const HOSTINGER_API_URL = 'https://api-ecommerce.hostinger.com';
const HOSTINGER_STORE_ID = 'store_01KYADH7HDTSMS26BGN749ND24';

async function fetchHostingerProducts() {
	const products = [];
	let offset = 0;

	for (;;) {
		const response = await fetch(
			`${HOSTINGER_API_URL}/store/${HOSTINGER_STORE_ID}/products?limit=50&offset=${offset}`,
		);
		if (!response.ok) {
			throw new Error(`Hostinger API returned ${response.status}`);
		}
		const data = await response.json();
		products.push(...(data.products ?? []));
		if (!data.products?.length || products.length >= (data.count ?? 0)) break;
		offset += data.products.length;
	}

	return products;
}

async function upsertVariant(productId, variant, index) {
	const payload = {
		product: productId,
		external_id: variant.id ?? '',
		title: variant.title ?? '',
		sku: variant.sku ?? '',
		price_in_cents: variant.prices?.[0]?.amount ?? 0,
		sale_price_in_cents: variant.prices?.[0]?.sale_amount ?? null,
		currency: variant.prices?.[0]?.currency_code ?? 'eur',
		manage_inventory: Boolean(variant.manage_inventory),
		inventory_quantity: variant.inventory_quantity ?? null,
		image_url: variant.image_url ?? '',
		sort_order: index,
	};

	try {
		const existing = await pocketbaseClient.collection('store_variants').getFirstListItem(
			pocketbaseClient.filter('external_id = {:id}', { id: payload.external_id }),
		);
		await pocketbaseClient.collection('store_variants').update(existing.id, payload);
	} catch {
		await pocketbaseClient.collection('store_variants').create(payload);
	}
}

async function upsertProduct(product) {
	const payload = {
		external_id: product.id ?? '',
		title: product.title ?? '',
		subtitle: product.subtitle ?? '',
		slug: product.slug ?? '',
		ribbon_text: product.ribbon_text ?? '',
		description: product.description ?? '',
		thumbnail_url: product.thumbnail ?? '',
		images: JSON.stringify(
			(product.images ?? []).map((img) => ({ url: img?.url ?? '', order: img?.order ?? 0, type: img?.type ?? '' })),
		),
		options: JSON.stringify(product.options ?? []),
		collections: JSON.stringify(
			(product.product_collections ?? []).map((c) => c?.collection_id ?? ''),
		),
		additional_info: JSON.stringify(product.additional_info ?? []),
		type: product.type?.value ?? 'physical',
		purchasable: Boolean(product.purchasable),
		sort_order: product.order ?? 0,
	};

	let record;
	try {
		record = await pocketbaseClient.collection('store_products').getFirstListItem(
			pocketbaseClient.filter('external_id = {:id}', { id: payload.external_id }),
		);
		record = await pocketbaseClient.collection('store_products').update(record.id, payload);
	} catch {
		record = await pocketbaseClient.collection('store_products').create(payload);
	}

	for (const [index, variant] of (product.variants ?? []).entries()) {
		await upsertVariant(record.id, variant, index);
	}
}

async function main() {
	// Give the shared client a moment to finish its PocketBase health check.
	await new Promise((r) => setTimeout(r, 3000));

	logger.info('Fetching catalogue from Hostinger…');
	const products = await fetchHostingerProducts();
	logger.info(`Fetched ${products.length} products. Migrating to PocketBase…`);

	for (const product of products) {
		try {
			await upsertProduct(product);
			logger.info(`Migrated: ${product.title}`);
		} catch (err) {
			logger.error(`Failed to migrate "${product.title}":`, err?.message ?? err);
		}
	}

	logger.info('Migration complete.');
}

main().catch((err) => {
	logger.error('Migration failed:', err);
	process.exit(1);
});
