import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
const dir = 'assets/map/ch1/';
const base = 'rottenwood_living_hell_v5.png';
const source = 'rottenwood_living_hell_v6_detail_source.png';
const regions = [
  { id: 'left', points: '20,480 290,450 470,820 520,1230 440,1760 20,1800' },
  { id: 'right', points: '1740,300 2020,300 2020,1820 1670,1760 1530,1420 1600,1060 1510,800' }
];
const layers = [];
for (const region of regions) {
  const svg = Buffer.from(`<svg width="2048" height="2048" xmlns="http://www.w3.org/2000/svg"><rect width="2048" height="2048" fill="black"/><polygon points="${region.points}" fill="white"/></svg>`);
  const mask = await sharp(svg).blur(12).greyscale().removeAlpha().raw().toBuffer();
  const pixels = await sharp(dir + source).resize(2048, 2048).removeAlpha().raw().toBuffer();
  const rgba = Buffer.alloc(2048 * 2048 * 4);
  for (let i = 0; i < mask.length; i++) {
    rgba[i * 4] = pixels[i * 3];
    rgba[i * 4 + 1] = pixels[i * 3 + 1];
    rgba[i * 4 + 2] = pixels[i * 3 + 2];
    rgba[i * 4 + 3] = mask[i] < 2 ? 0 : mask[i];
  }
  const file = `rottenwood_living_hell_v6_${region.id}_layer.png`;
  await sharp(rgba, { raw: { width: 2048, height: 2048, channels: 4 } }).png().toFile(dir + file);
  layers.push(file);
}
await sharp(dir + base).composite(layers.map(file => ({ input: dir + file, blend: 'over' }))).png().toFile(dir + 'rottenwood_living_hell_v6.png');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="2048" height="2048" viewBox="0 0 2048 2048">${[base, ...layers].map((file, index) => `<g id="layer-${index}" inkscape:groupmode="layer" inkscape:label="${index === 0 ? 'Base v5' : regions[index - 1].id + ' tree detail'}"><image href="${file}" width="2048" height="2048"/></g>`).join('')}</svg>`;
await writeFile(dir + 'rottenwood_living_hell_v6_layers.svg', svg);
await writeFile(dir + 'rottenwood_living_hell_v6_layers.json', JSON.stringify({ base, source, width: 2048, height: 2048, blend: 'source-over', blurSigma: 12, alphaBelow2Zeroed: true, regions, layers, prompt: 'rottenwood_living_hell_v6_prompt.txt' }, null, 2));
console.log('Saved two RGBA detail layers, composite, SVG and metadata.');
