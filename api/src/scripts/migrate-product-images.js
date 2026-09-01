/**
 * One-time migration: download every Hostinger/Zyro-hosted product image
 * referenced in the `store_products` / `store_variants` records, upload it
 * into PocketBase's own file storage, and rewrite the URL fields to point
 * at the local PocketBase file API. Idempotent — skips records whose
 * images already point at PocketBase.
 *
 * Usage:  node src/scripts/migrate-product-images.js
 */
import { pocketbaseClient } from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { Readable } from 'node:stream';

const HOSTED_PATTERNS = [
	'https://images.hostinger.com/',
	'https://horizons-cdn.hostinger.com/',
	'https://cdn.zyrosite.com/',
];

const isHosted = (url) => typeof url === 'string' && HOSTED_PATTERNS.some((p) => url.startsWith(p));

async function downloadToBlob(url) {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`download failed HTTP ${response.status}`);
	const contentType = response.headers.get('content-type') || 'image/png';
	const buffer = Buffer.from(await response.arrayBuffer());
	return { blob: new Blob([buffer], { type: contentType }), ext: (contentType.split('/')[1] || 'png').split(';')[0] };
}

async function attachFile(collection, record, field, { blob, ext }) {
	const formData = new FormData();
	const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
	formData.append(field, blob, filename);
	const updated = await pocketbaseClient.collection(collection).update(record.id, formData);
	return updated;
}

function pbFileUrl(record, field, index = 0) {
	const filenames = record[`${field}`];
	const filename = Array.isArray(filenames) ? filenames[index] : filenames;
	if (!filename) return '';
	// Dev: PocketBase runs on 127.0.0.1:8090; the web dev server is on :3000,
	// so return an absolute URL to the file.
	return `http://127.0.0.1:8090/api/files/${record.collectionId}/${record.id}/${filename}`;
}

async function migrateProductImages() {
	const products = await pocketbaseClient.collection('store_products').getFullList();

	for (const product of products) {
		const updates = {};

		// --- Thumbnail: single file, dedicated request so files don't pile up.
		if (isHosted(product.thumbnail_url)) {
			try {
				const file = await downloadToBlob(product.thumbnail_url);
				const updated = await attachFile('store_products', product, 'thumbnail', file);
				updates.thumbnail_url = pbFileUrl(updated, 'thumbnail');
			} catch (err) {
				logger.error(`thumbnail failed for "${product.title}": ${err.message}`);
			}
		}

		// --- Gallery images: upload to the dedicated `gallery` field in one
		// request so the `thumbnail` field's file is never overwritten.
		if (Array.isArray(product.images) && product.images.some((img) => isHosted(img?.url))) {
			const formData = new FormData();
			const newImages = [];
			let uploaded = 0;

			for (const img of product.images) {
				if (!isHosted(img?.url)) { newImages.push(img); continue; }
				try {
					const file = await downloadToBlob(img.url);
					formData.append('gallery', file.blob, `gallery_${uploaded}.${file.ext}`);
					newImages.push({ ...img, url: `__PENDING_${uploaded}__` });
					uploaded++;
				} catch (err) {
					logger.error(`gallery image failed for "${product.title}": ${err.message}`);
					newImages.push(img); // keep original URL on failure
				}
			}

			if (uploaded > 0) {
				const updated = await pocketbaseClient.collection('store_products').update(product.id, formData);
				updates.images = newImages.map((img) => {
					const m = /^__PENDING_(\d+)__$/.exec(img.url);
					return m ? { ...img, url: pbFileUrl(updated, 'gallery', Number(m[1])) } : img;
				});
			}
		}

		if (Object.keys(updates).length > 0) {
			await pocketbaseClient.collection('store_products').update(product.id, updates);
			logger.info(`migrated images for "${product.title}"`);
		}
	}
}

async function migrateVariantImages() {
	const variants = await pocketbaseClient.collection('store_variants').getFullList();

	for (const variant of variants) {
		if (!isHosted(variant.image_url)) continue;
		try {
			const file = await downloadToBlob(variant.image_url);
			const updated = await attachFile('store_variants', variant, 'image', file);
			await pocketbaseClient.collection('store_variants').update(variant.id, {
				image_url: pbFileUrl(updated, 'image'),
			});
		} catch (err) {
			logger.error(`variant image failed (${variant.id}): ${err.message}`);
		}
	}
}

async function main() {
	await new Promise((r) => setTimeout(r, 3000));
	logger.info('Migrating product images into PocketBase file storage…');
	await migrateProductImages();
	await migrateVariantImages();
	logger.info('Image migration complete.');
}

main().catch((err) => {
	logger.error('Image migration failed:', err);
	process.exit(1);
});
