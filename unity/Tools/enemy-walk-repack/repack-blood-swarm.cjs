#!/usr/bin/env node
// Repack the existing blood_swarm walk originals into skin 0 only.
// Usage: node repack-blood-swarm.cjs <source img root> <atlas img root> <Unity enemy art root> <sharp module path>
const fs = require('node:fs');
const path = require('node:path');

const [sourceRoot, atlasRoot, unityRoot, sharpPath] = process.argv.slice(2);
if (!sourceRoot || !atlasRoot || !unityRoot || !sharpPath) {
  throw new Error('Expected source img root, atlas img root, Unity enemy art root, and sharp module path');
}
const sharp = require(sharpPath);
const directions = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];
const cell = 256;

function alphaCount(buf) {
  let count = 0;
  for (let i = 3; i < buf.length; i += 4) if (buf[i] !== 0) count++;
  return count;
}

async function rgba(file) {
  return sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
}

async function main() {
  const staged = [];
  for (const direction of directions) {
    const name = `atlas_ch1_8dir_walk_${direction.replaceAll('-', '_')}.png`;
    const sourceAtlas = path.join(atlasRoot, name);
    const unityAtlas = path.join(unityRoot, name);
    const original = fs.readFileSync(sourceAtlas);
    if (!original.equals(fs.readFileSync(unityAtlas))) throw new Error(`${name}: source/Unity atlas mismatch`);
    const { data, info } = await rgba(sourceAtlas);
    if (info.width !== 8192 || info.height !== 1280 || info.channels !== 4) throw new Error(`${name}: unexpected geometry`);
    const rowBytes = info.width * 4;
    const old = Buffer.from(data);
    const frames = [];
    for (let i = 0; i < 4; i++) {
      const frame = path.join(sourceRoot, 'ch1_8dir', 'blood_swarm', 'walk', direction, `frame_${String(i).padStart(3, '0')}.png`);
      const result = await sharp(frame).resize(cell, cell).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      if (result.info.width !== cell || result.info.height !== cell || result.info.channels !== 4 || alphaCount(result.data) === 0) throw new Error(`${frame}: invalid frame`);
      frames.push(result.data);
    }
    const before = [];
    for (let index = 0; index < 4; index++) {
      const pixels = Buffer.alloc(cell * cell * 4);
      for (let y = 0; y < cell; y++) old.copy(pixels, y * cell * 4, y * rowBytes + index * cell * 4, y * rowBytes + (index + 1) * cell * 4);
      before.push(pixels);
    }
    if (alphaCount(before[0]) === 0 || alphaCount(before[1]) === 0 || alphaCount(before[2]) === 0 || alphaCount(before[3]) !== 0) throw new Error(`${name}: expected 0,1,3,blank layout not found`);
    // The already packed frame 003 is retained bit-for-bit, changing only cell 2 and 3.
    for (let index = 2; index < 4; index++) {
      const src = index === 2 ? frames[2] : before[2];
      for (let y = 0; y < cell; y++) src.copy(data, y * rowBytes + index * cell * 4, y * cell * 4, (y + 1) * cell * 4);
    }
    const output = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png({ compressionLevel: 9 }).toBuffer();
    staged.push({ name, sourceAtlas, unityAtlas, output, counts: [0, 1, 2, 3].map(i => i < 2 ? alphaCount(before[i]) : alphaCount(i === 2 ? frames[2] : before[2])) });
  }
  for (const item of staged) {
    fs.writeFileSync(item.sourceAtlas, item.output);
    fs.writeFileSync(item.unityAtlas, item.output);
    process.stdout.write(`${item.name} ${item.counts.join(',')}\n`);
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
