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
  'apple-touch-icon.png': 'c075285b7b7b797ebf843d7737e1deda96732156814f0a54a1560dea38f51c0c',
  'checksums.txt': '3c2a0e53d3add793a4d9e16e9dcc217c15e422ac43fee1c3c2d98fc7bdd8c7cb',
  'favicon.ico': '3b2371f367acdc17578a3c215fa1b5b026480a572fade2e6af7f7a0d20b5e0c9',
  'favicon.svg': '59c388e4d8e2004b4b01870d9334af01b052edccdafd95de766615e1b9809bb9',
  'glyph-color.svg': '59c388e4d8e2004b4b01870d9334af01b052edccdafd95de766615e1b9809bb9',
  'glyph-dark.svg': '73ffd1526cf04a611f48970713c38538b87b283e13936116090a72977525c530',
  'glyph-monochrome.svg': 'c044de3c0b9c89412c30212ffce6c0e9c7df47cd1e91d140d096bc4c780d4bd3',
  'glyph-reversed.svg': '609e978174a6a6936757a8a000c285a82b107f6ba4944a2c4e6a75846c4cf3d4',
  'lockup-endorsed.svg': 'd338d9e234df917c7b2bcafbfda51b6e434dc11233fb507d99ea19a08b9a4cfb',
  'lockup.svg': 'fc608c538bbbc93c9bab0f4f9b2c35da26ec46721b774a0bcfc90df87192e895',
  'maskable-192.png': '0cdbb85d04dfa5fe8a620509f80e109ea5aa53695a9920fc2af923acbef43521',
  'maskable-512.png': '1f453ff83c2b390c1b83f45dac47382c8c4e3ab1e5ca216b903f94e12b2661e9',
  'og.png': '28a7d67a1e2c6f3c7abb08a4b8bfdba4cc915fc87ec2839d32a9a93d39324fa8',
  'pwa-192.png': '94652be03f7343ab3dc546a8eca8f2d1452a0ba3b6e9173ef618b7a64306171e',
  'pwa-512.png': '4994a8621cbf8b0d27420fa551c5262d7fe92c183050f63b4ee49f95ba8fee8b',
  'readme-header.png': '0de216cf74675dd41a183a10353acac669b454052b64fa94b88db6220af753e8',
  'wordmark.svg': '6a12b8c8e4212380176701f909bce1e81fb4b80769fe38fc9d5a7b942643f81e',
  'icons/icon-16.png': '990dcbba213d3976fe1cee4becf2b997e9d77817b3076ef3e4ff82ea8ebca9d8',
  'icons/icon-180.png': 'c075285b7b7b797ebf843d7737e1deda96732156814f0a54a1560dea38f51c0c',
  'icons/icon-192.png': '94652be03f7343ab3dc546a8eca8f2d1452a0ba3b6e9173ef618b7a64306171e',
  'icons/icon-32.png': '39b70712c3a97b7fb83bc15f555a7bd3efd21e7a726820702e70713a5104d2ee',
  'icons/icon-48.png': 'e28255281a00108297f92c1db3bfe7fe5624dbdf84246aa38356252d230c4fb7',
  'icons/icon-512.png': '4994a8621cbf8b0d27420fa551c5262d7fe92c183050f63b4ee49f95ba8fee8b',
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
