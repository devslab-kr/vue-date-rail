import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFile(path.join(root, file));
const text = async (file) => (await read(file)).toString('utf8');
const sha256 = async (file) => createHash('sha256').update(await read(file)).digest('hex');
const listFiles = async (directory) => {
  const entries = await readdir(path.join(root, directory), { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const child = path.posix.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(child) : [child];
  }));
  return files.flat();
};

const o06Assets = {
  'apple-touch-icon.png': '44fec55184d432bda5ba89cf552708cedd60ad31ecf7e8cdad3a512c7ff07934',
  'checksums.txt': '883ff023f5d7d97af187e6ad2d4d3ef9252b3b93ca5723ad3d91563eb0cb0308',
  'favicon.ico': 'de71433cf0229e8992987ecfa46c0ced692c9c35cc5dcc32da48355d29fa3682',
  'favicon.svg': '72d2460d25b7afc9095d8c10e3302ce24729d416a6ea17aee11215edd331b2c6',
  'glyph-color.svg': '72d2460d25b7afc9095d8c10e3302ce24729d416a6ea17aee11215edd331b2c6',
  'glyph-monochrome.svg': '19894c205b78edd5d1f6a14d1ce6a37a583e7e0d89b28b793cf0b2d914acae34',
  'glyph-reversed.svg': '753cf71041f52f9b165198b6568fec8478392dcd83c54be750791e8185facdc0',
  'lockup-endorsed.svg': '13db1d078744488ef93006992d28e1afa87bb40ecf31bc767e4c3850d640c4c6',
  'lockup.svg': 'a8fc1623bace56b5a58a476ee09e952e2d64e5866cf2a36aa7d2eb9e5fb4e80b',
  'maskable-192.png': '45e84a171c6769e542557f39fe07ba784caf3d4da606f1410f76369df5a6d0ee',
  'maskable-512.png': 'b1b17b8fca6586067ebbb2a3340156d19a3dd23903249db7c99fd3baaf482cb2',
  'og.png': 'ec8d8dfbad01d95b00f7560cfd6ede5612c814c5792727d21e55236c7eceff88',
  'pwa-192.png': '880d1520196cb4c54ef96e0699a843515ca3dc1e64cc7735eeb0f9acaa19083a',
  'pwa-512.png': '9de68daa0b24fb543f4c9ab63012960216b8cb352f576b2b990a4b27afbea59d',
  'readme-header.png': '5bd63639d2b5d18aa6dcb21fc63413ac7a2ef0c11aa1fb98e77b221fff1bd754',
  'wordmark.svg': '6a12b8c8e4212380176701f909bce1e81fb4b80769fe38fc9d5a7b942643f81e',
  'icons/icon-16.png': '52eee8658866a0e4048ecf359d16d3fa6ef046418725af1487bae490d67ab7ab',
  'icons/icon-180.png': '44fec55184d432bda5ba89cf552708cedd60ad31ecf7e8cdad3a512c7ff07934',
  'icons/icon-192.png': '880d1520196cb4c54ef96e0699a843515ca3dc1e64cc7735eeb0f9acaa19083a',
  'icons/icon-32.png': 'fb1b5016115cc8ddbaea58c85420ccb99060a2dbfb076a1f81e5140bc23485b9',
  'icons/icon-48.png': '382325955bfcf432056111a9411bdb71cfcdfa96ab6f3a4166ce7fab991bcbcb',
  'icons/icon-512.png': '9de68daa0b24fb543f4c9ab63012960216b8cb352f576b2b990a4b27afbea59d',
};

for (const [asset, expected] of Object.entries(o06Assets)) {
  assert.equal(await sha256(`docs/assets/brand/${asset}`), expected, `docs O06 asset hash: ${asset}`);
}
assert.deepEqual(
  (await listFiles('docs/assets/brand')).sort(),
  Object.keys(o06Assets).map((asset) => `docs/assets/brand/${asset}`).sort(),
  'docs vendors exactly the O06 asset inventory',
);

for (const asset of ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'og.png']) {
  assert.equal(await sha256(`demo/public/${asset}`), o06Assets[asset], `demo O06 asset hash: ${asset}`);
}

const [readme, readmeKo, index, app] = await Promise.all([
  text('README.md'),
  text('README.ko.md'),
  text('demo/index.html'),
  text('demo/App.vue'),
]);

for (const content of [readme, readmeKo]) {
  assert.match(content, /docs\/assets\/brand\/readme-header\.png/, 'README keeps the O06 header asset');
  assert.match(content, /https:\/\/devslab\.kr\/brand\/open-source\//, 'README links to the canonical OSS brand guide');
}

assert.match(index, /\/favicon\.svg/, 'demo supplies the O06 favicon');
assert.match(index, /\/apple-touch-icon\.png/, 'demo supplies the O06 Apple touch icon');
assert.match(index, /\/og\.png/, 'demo supplies the O06 social image');
assert.match(index, /property="og:image" content="\/og\.png"/, 'demo uses the local O06 OG image');
assert.match(index, /property="og:locale" content="en_US"/, 'demo has English social metadata');
assert.match(index, /name="twitter:card" content="summary_large_image"/, 'demo has a large social card');
assert.match(app, /class="demo hero-atmosphere"/, 'atmosphere is scoped to the demo shell');
assert.match(app, /data-atmosphere="oss"/, 'demo shell declares the OSS atmosphere');
assert.match(app, /hero-atmosphere__glow/, 'demo renders an inert atmosphere layer');
assert.match(app, /https:\/\/devslab\.kr\/brand\/open-source\//, 'demo exposes the canonical OSS identity');

assert.equal(await sha256('src/components/DateRail.vue'), 'cb74477d11e1f552b653145ae68cf862816644f845d47b3f3ebf3de720d2a5fc', 'DateRail --vdr-* contract is unchanged');
assert.equal(await sha256('src/components/MonthRail.vue'), 'aa62a7e017a44058fdb91db1dc4595b38abf49ab6dda481ca3206bf30d416d7a', 'MonthRail --vdr-* contract is unchanged');
assert.doesNotMatch(index, /--vdr-/, 'brand metadata must not depend on component tokens');

console.log('O06 brand contract passed');
