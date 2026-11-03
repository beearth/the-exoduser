// Manual authoring tool. Changes painting choices only; never moves the original C10 anchors.
const fs = require('fs');
const path = require('path');
const resource = path.resolve(__dirname, '../unity/Assets/Exoduser/Resources');
const file = path.join(resource, 'A2R/web-assets.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const plants = data.cards.filter(card => card.kind === 'vegetation');
const palette = ['r3_fern_0', 'r3_fern_1', 'r3_fern_2', 'r4_brush_0', 'r4_brush_1', 'r4_brush_2', 'r4_brush_3']
  .map(name => 'A2R/C10/Art/' + name);
const distance = (a, b) => Math.hypot(
  Math.fround(a.x / 100) - Math.fround(b.x / 100),
  Math.fround(a.y / 100) - Math.fround(b.y / 100));
// The 0.1 mm margin covers JSON-to-float rounding before the 3.3 u runtime check.
const graph = plants.map((card, i) => plants.flatMap((other, j) =>
  i !== j && distance(card, other) < 3.3001 ? [j] : []));
if (!process.argv.includes('--check')) {
  const colors = new Map();
  const saturation = i => new Set(graph[i].map(j => colors.get(j)).filter(Boolean)).size;
  while (colors.size < plants.length) {
    const remaining = plants.map((_, i) => i).filter(i => !colors.has(i));
    remaining.sort((a, b) => saturation(b) - saturation(a) || graph[b].length - graph[a].length || plants[a].id.localeCompare(plants[b].id));
    const i = remaining[0];
    const used = new Set(graph[i].map(j => colors.get(j)));
    const family = palette.filter(asset => asset.includes(plants[i].asset.includes('r3_fern_') ? 'r3_fern_' : 'r4_brush_'));
    const choice = [plants[i].asset, ...family, ...palette].find(asset => !used.has(asset));
    if (!choice) throw new Error('Existing painting palette cannot separate this neighborhood');
    colors.set(i, choice);
  }
  plants.forEach((card, i) => { card.variationAsset = colors.get(i); });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
let duplicatePairs = 0;
plants.forEach((card, i) => {
  if (!palette.includes(card.variationAsset)) throw new Error('Missing approved painting: ' + card.id);
  for (const suffix of ['', '_normal']) {
    if (!fs.existsSync(path.join(resource, card.variationAsset + suffix + '.png'))) throw new Error('Missing original art');
  }
  for (const j of graph[i]) if (j < i && plants[j].variationAsset === card.variationAsset) duplicatePairs++;
});
if (duplicatePairs) throw new Error('Adjacent identical paintings: ' + duplicatePairs);
console.log(JSON.stringify({ plants: plants.length, adjacentSameArt: duplicatePairs, coordinatesChanged: 0, mode: process.argv.includes('--check') ? 'check' : 'author' }));
