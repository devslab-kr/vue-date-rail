import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => readFile(path.join(root, file));
const text = async (file) => (await read(file)).toString('utf8');
const sha256 = async (file) => createHash('sha256').update(await read(file)).digest('hex');
const normalizedTextHash = async (file) => createHash('sha256')
  .update((await text(file)).replace(/\r\n/g, '\n'))
  .digest('hex');
const textSha256 = async (file) => createHash('sha256')
  .update((await text(file)).replace(/\r\n/g, '\n'))
  .digest('hex');
const listFiles = async (directory) => {
  const entries = await readdir(path.join(root, directory), { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const child = path.posix.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(child) : [child];
  }));
  return files.flat();
};

const o06Assets = {
  'apple-touch-icon.png': '5ebb6304078d15d94b66a13202dec9bc68548ce18248a01329f090dfe4266b70',
  'checksums.txt': '5dffbc6ba74457d610d88ed6e6895940594f98b6602e72ed0c548a53ec861ed1',
  'favicon.ico': '84383f21a7775e78c143ac88126cfc686dd8ae1cfdba8a65a69f8deeef5696aa',
  'favicon.svg': '447305b2acb1579b94ef69c7c976a1479d402bd9e84c4360104003802a78d266',
  'glyph-color.svg': '447305b2acb1579b94ef69c7c976a1479d402bd9e84c4360104003802a78d266',
  'glyph-dark.svg': '08c9e1a07221ee08c9bff8740858498cfd166d6504a225ea32665d806486393d',
  'glyph-monochrome.svg': '8bb6742239c599c854da0a81328fde56b57948e2fd0642539d4fdb30619fd735',
  'glyph-reversed.svg': 'eb928c93307b1b32cdb5e18ae25898b5a0e4c6a7cee17d785b4280e2cc4bf521',
  'lockup-endorsed.svg': '79208208e02d3257b55b2617e2ab2f004fa47649209949db37ae16d0b1b53ce7',
  'lockup.svg': '3f9551f25d03a8d0f9bfc127a76c90feb0d83e0bd4b02ae6127c97d2d9866cad',
  'maskable-192.png': '8d7b55e0a5996c2d0c9228f8e11edf50e3eb85ee9a24e6d2615c0cfa1afd6364',
  'maskable-512.png': 'e58373bc9e69a3285017f7291dfbf6f0f4384cd49b04dd685f24298f36e4cc78',
  'og.png': '79da59126083c92a3dad3b929957412e8696c498c5f6fd2acbf67a7273f5848e',
  'pwa-192.png': '33c5161e3926240bebc2587ced0b867c747d1c07aca53d9b78842312b307b40b',
  'pwa-512.png': 'b17636a555d621b24d696044744c33673baa9a0327d33538e9f2285bc3347090',
  'readme-header.png': '06c0d68e21c67de350c101a29be85e892b6169c4d2172c0f94a10a71523dc9fa',
  'wordmark.svg': '6a12b8c8e4212380176701f909bce1e81fb4b80769fe38fc9d5a7b942643f81e',
  'icons/icon-16.png': 'd53d27f7d19508ff67aca98c6b506ac0d7d9b7b4680a76c682a31d44a8137fc8',
  'icons/icon-180.png': '5ebb6304078d15d94b66a13202dec9bc68548ce18248a01329f090dfe4266b70',
  'icons/icon-192.png': '33c5161e3926240bebc2587ced0b867c747d1c07aca53d9b78842312b307b40b',
  'icons/icon-32.png': '22ffbfeafb2c0bd144680efadf2449ccd36fa001ff315d19ded2d3c4a2f589f5',
  'icons/icon-48.png': 'b0eb8d924ef4dd9cda24a500bdc320535ce8dae54d0bb0815b0013139b5651eb',
  'icons/icon-512.png': 'b17636a555d621b24d696044744c33673baa9a0327d33538e9f2285bc3347090',
};

for (const [asset, expected] of Object.entries(o06Assets)) {
  const actual = asset === 'checksums.txt'
    ? await normalizedTextHash(`docs/assets/brand/${asset}`)
    : await sha256(`docs/assets/brand/${asset}`);
  assert.equal(actual, expected, `docs O06 asset hash: ${asset}`);
}
assert.deepEqual(
  (await listFiles('docs/assets/brand')).sort(),
  Object.keys(o06Assets).map((asset) => `docs/assets/brand/${asset}`).sort(),
  'docs vendors exactly the O06 asset inventory',
);

for (const asset of ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'og.png']) {
  assert.equal(await sha256(`demo/public/${asset}`), o06Assets[asset], `demo O06 asset hash: ${asset}`);
}

const [readme, readmeKo, index, app, packageJson, ci, pages, publish] = await Promise.all([
  text('README.md'),
  text('README.ko.md'),
  text('demo/index.html'),
  text('demo/App.vue'),
  text('package.json'),
  text('.github/workflows/ci.yml'),
  text('.github/workflows/pages.yml'),
  text('.github/workflows/publish.yml'),
]);

for (const content of [readme, readmeKo]) {
  assert.match(content, /docs\/assets\/brand\/readme-header\.png/, 'README keeps the O06 header asset');
  assert.match(content, /https:\/\/devslab\.kr\/brand\/open-source\//, 'README links to the canonical OSS brand guide');
}

assert.match(index, /\/favicon\.svg/, 'demo supplies the O06 favicon');
assert.match(index, /\/apple-touch-icon\.png/, 'demo supplies the O06 Apple touch icon');
assert.match(index, /\/og\.png/, 'demo supplies the O06 social image');
assert.match(index, /property="og:image" content="\/og\.png"/, 'demo uses the local O06 OG image');
assert.match(index, /property="og:image:alt" content="Vue Date Rail circular date rail glyph"/, 'demo describes the O06 Open Graph image');
assert.match(index, /property="og:locale" content="en_US"/, 'demo has English social metadata');
assert.match(index, /name="twitter:card" content="summary_large_image"/, 'demo has a large social card');
assert.match(index, /name="twitter:image:alt" content="Vue Date Rail circular date rail glyph"/, 'demo describes the O06 Twitter image');
assert.match(app, /class="demo hero-atmosphere"/, 'atmosphere is scoped to the demo shell');
assert.match(app, /data-atmosphere="oss"/, 'demo shell declares the OSS atmosphere');
assert.match(app, /hero-atmosphere__glow/, 'demo renders an inert atmosphere layer');
assert.match(app, /https:\/\/devslab\.kr\/brand\/open-source\//, 'demo exposes the canonical OSS identity');

assert.equal(await textSha256('src/components/DateRail.vue'), 'cdee9d7bab1f77033d7844c73a0079819923e233f09b98fc60ca12793f668e23', 'DateRail --vdr-* contract is unchanged');
assert.equal(await textSha256('src/components/MonthRail.vue'), '13a8ce74f90dead2ba5baf87b1257ca602c8e266782dc2ab714d3d1a72ce49c8', 'MonthRail --vdr-* contract is unchanged');
assert.doesNotMatch(index, /--vdr-/, 'brand metadata must not depend on component tokens');

const pkg = JSON.parse(packageJson);
const verify = pkg.scripts.verify;
assert.equal(verify, 'npm run check:brand && npm run test:run && npm run build && npm run build:types && npm run build:demo', 'verify must run the complete nonrecursive O06 contract');
assert.doesNotMatch(verify, /npm run verify/, 'verify must not recurse');
assert.equal(pkg.scripts.prepublishOnly, 'npm run verify', 'npm publishing must use the full O06 verifier');

function assertWorkflowGate(workflow, name, command) {
  const install = workflow.indexOf('run: npm ci');
  const gate = workflow.indexOf(`run: ${command}`);
  assert.ok(install >= 0 && gate > install, `${name} must run ${command} after npm ci`);
}

assertWorkflowGate(ci, 'normal CI', 'npm run verify');
assertWorkflowGate(pages, 'Pages deployment', 'npm run check:brand');
assertWorkflowGate(publish, 'npm release', 'npm run verify');

console.log('O06 brand contract passed');
