import fs from 'node:fs';
import assert from 'node:assert/strict';

// Read FBX AnimationStack time spans without importing or executing Unity/Blender.
const root = 'unity/Assets/Exoduser/Resources/Art/Bosses/Druid/';
const bytes = fs.readFileSync(root + 'OldmanV91.fbx');
assert.ok(bytes.subarray(0, 18).toString().startsWith('Kaydara FBX Binary'));
const wide = bytes.readUInt32LE(23) >= 7500;
const width = wide ? 8 : 4, header = width * 3 + 1;
const integer = offset => wide ? Number(bytes.readBigUInt64LE(offset)) : bytes.readUInt32LE(offset);
function node(offset) {
  const end = integer(offset);
  if (!end) return null;
  const count = integer(offset + width), length = integer(offset + width * 2), nameLength = bytes[offset + width * 3];
  const name = bytes.subarray(offset + header, offset + header + nameLength).toString();
  let cursor = offset + header + nameLength;
  const values = [];
  for (let index = 0; index < count; index++) {
    const kind = String.fromCharCode(bytes[cursor++]);
    switch (kind) {
      case 'Y': values.push(bytes.readInt16LE(cursor)); cursor += 2; break;
      case 'C': values.push(bytes[cursor++]); break;
      case 'I': values.push(bytes.readInt32LE(cursor)); cursor += 4; break;
      case 'F': values.push(bytes.readFloatLE(cursor)); cursor += 4; break;
      case 'D': values.push(bytes.readDoubleLE(cursor)); cursor += 8; break;
      case 'L': values.push(Number(bytes.readBigInt64LE(cursor))); cursor += 8; break;
      case 'S': case 'R': {
        const size = bytes.readUInt32LE(cursor); cursor += 4;
        values.push(kind === 'S' ? bytes.subarray(cursor, cursor + size).toString() : null); cursor += size; break;
      }
      default:
        assert.ok('fdlibc'.includes(kind), `FBX property ${kind}`);
        const size = bytes.readUInt32LE(cursor + 8); cursor += 12 + size; values.push(null);
    }
  }
  assert.equal(cursor, offset + header + nameLength + length);
  const children = [];
  while (cursor + header < end) {
    const child = node(cursor); if (!child) break;
    children.push(child); cursor = child.end;
  }
  return { name, values, children, end };
}
const nodes = [];
for (let offset = 27; offset + header < bytes.length;) {
  const item = node(offset); if (!item) break;
  nodes.push(item); offset = item.end;
}
const objects = nodes.find(item => item.name === 'Objects');
assert.ok(objects);
if (process.argv.includes('--inspect')) {
  console.log(JSON.stringify({ firstStack: objects.children.find(item => item.name === 'AnimationStack'),
    stackDefinition: nodes.find(item => item.name === 'Definitions').children.filter(item => item.values[0] === 'AnimationStack') }));
  process.exit(0);
}
const spans = new Map();
const definition = nodes.find(item => item.name === 'Definitions').children.find(item => item.values[0] === 'AnimationStack');
const defaults = definition.children.find(item => item.name === 'PropertyTemplate').children.find(item => item.name === 'Properties70').children;
for (const item of objects.children.filter(item => item.name === 'AnimationStack')) {
  const name = item.values[1].split('\0')[0].replace(/^AnimStack::/, '');
  const props = item.children.find(child => child.name === 'Properties70').children;
  const get = name => (props.find(prop => prop.values[0] === name) ?? defaults.find(prop => prop.values[0] === name)).values.at(-1);
  spans.set(name, (get('LocalStop') - get('LocalStart')) / 46186158000);
}
const receipt = JSON.parse(fs.readFileSync(root + 'oldman-import.json', 'utf8'));
assert.equal(spans.size, receipt.clips.length);
for (const clip of receipt.clips) {
  assert.ok(spans.has(clip.name), `FBX stack ${clip.name}`);
  assert.ok(Math.abs(spans.get(clip.name) - clip.duration) < 1e-6, `FBX duration ${clip.name}`);
}
const importer = fs.readFileSync(root + 'OldmanV91.fbx.meta', 'utf8');
assert.match(importer, /animationType: 2/);
assert.match(importer, /clipAnimations: \[\]/);
console.log(JSON.stringify({ passed: true, source: 'OldmanV91.fbx', clips: spans.size, fps: 60,
  genericImporter: true, customClipTrims: false, unityImport: 'not-run',
  durations: Object.fromEntries([...spans].map(([name, seconds]) => [name, +(seconds * 60).toFixed(5)])) }));
