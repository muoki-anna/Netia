export default async function run(page) {
  const pbHits = [];
  page.on('request', (r) => {
    if (r.url().includes(':8090/api/collections/store_')) pbHits.push(r.url());
  });

  await page.goto('http://localhost:3000/store');
  await page.waitForTimeout(3500);

  const text = await page.evaluate(() => document.body.innerText);
  return {
    errorShown: /Error loading products|Failed to load/i.test(text),
    priceCount: (text.match(/KSh\s?[\d,]+/g) || []).length,
    sampleTitles: (text.match(/[A-Z][a-zA-Z' ]{5,40} Seedling|Sukuma|Managu|Courgette|Terere/g) || []).slice(0, 6),
    pbCatalogueRequests: pbHits.length,
  };
}
