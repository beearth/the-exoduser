// GLB(LOD2) -> Resources/Art/map/a2/hellrot/<name>.bytes. Flat material colours become vertex colours.
// layout: int32 vertexCount, int32 indexCount, float32 pos[3v], float32 nor[3v], uint8 rgba[4v] (rgb = sqrt(linear), a = smoothness), int32 idx[i]
const fs = require('fs'), path = require('path');
const [src, dst] = process.argv.slice(2);
fs.mkdirSync(dst, { recursive: true });
for (const f of fs.readdirSync(src).filter(n => n.endsWith('.glb') && !n.startsWith('hang_membrane'))) {
  const b = fs.readFileSync(path.join(src, f));
  const jl = b.readUInt32LE(12);
  const j = JSON.parse(b.slice(20, 20 + jl).toString());
  const bin = b.slice(20 + jl + 8);
  const read = ai => {
    const a = j.accessors[ai], v = j.bufferViews[a.bufferView];
    if (v.byteStride) throw Error('stride');
    const o = (v.byteOffset || 0) + (a.byteOffset || 0);
    const n = a.count * { SCALAR: 1, VEC3: 3 }[a.type];
    const at = bytes => bin.buffer.slice(bin.byteOffset + o, bin.byteOffset + o + n * bytes);
    if (a.componentType === 5126) return Array.from(new Float32Array(at(4)));
    if (a.componentType === 5123) return Array.from(new Uint16Array(at(2)));
    if (a.componentType === 5125) return Array.from(new Uint32Array(at(4)));
    throw Error('type');
  };
  const mesh = j.meshes.find(m => m.name.endsWith('_LOD2'));
  const P = [], N = [], C = [], I = [];
  for (const p of mesh.primitives) {
    const pos = read(p.attributes.POSITION), nor = read(p.attributes.NORMAL), idx = read(p.indices), base = P.length / 3;
    const m = j.materials[p.material].pbrMetallicRoughness, c = m.baseColorFactor, sm = 1 - (m.roughnessFactor ?? 0.8);
    P.push(...pos); N.push(...nor);
    for (let k = 0; k < pos.length / 3; k++) C.push(Math.round(Math.sqrt(c[0]) * 255), Math.round(Math.sqrt(c[1]) * 255), Math.round(Math.sqrt(c[2]) * 255), Math.round(sm * 255));
    for (const i of idx) I.push(base + i);
  }
  const v = P.length / 3, out = Buffer.alloc(8 + v * 28 + I.length * 4);
  let o = 0;
  out.writeInt32LE(v, o); o += 4; out.writeInt32LE(I.length, o); o += 4;
  for (const x of P) { out.writeFloatLE(x, o); o += 4; }
  for (const x of N) { out.writeFloatLE(x, o); o += 4; }
  for (const x of C) { out.writeUInt8(x, o); o += 1; }
  for (const x of I) { out.writeInt32LE(x, o); o += 4; }
  fs.writeFileSync(path.join(dst, f.replace('.glb', '.bytes')), out);
  console.log(f, 'v', v, 'tri', I.length / 3);
}
