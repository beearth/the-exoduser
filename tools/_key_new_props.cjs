const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = String.raw`C:\Users\심도진\.grok\sessions\G%3A%5Cexoduser\01a009da-d382-7c90-8996-81419509dc55\images`;
const jobs = [
  {src:'29.jpg', dest: String.raw`G:\exoduser\assets\map\ch1\collision\prop_idol.png`},
  {src:'30.jpg', dest: String.raw`G:\exoduser\assets\map\ch1\collision\prop_lantern.png`},
  {src:'31.jpg', dest: String.raw`G:\exoduser\assets\map\ch1\collision\prop_wagon.png`},
  {src:'32.jpg', dest: String.raw`G:\exoduser\assets\map\ch3\collision\prop_iceshrine.png`},
  {src:'33.jpg', dest: String.raw`G:\exoduser\assets\map\ch2\collision\prop_hive.png`},
  {src:'34.jpg', dest: String.raw`G:\exoduser\assets\map\ch4\collision\prop_brazier.png`},
  {src:'35.jpg', dest: String.raw`G:\exoduser\assets\map\ch5\collision\prop_banner.png`},
  {src:'36.jpg', dest: String.raw`G:\exoduser\assets\map\ch1\collision\prop_well.png`},
  {src:'37.jpg', dest: String.raw`G:\exoduser\assets\map\ch1\collision\prop_rib.png`},
  {src:'38.jpg', dest: String.raw`G:\exoduser\assets\map\ch3\collision\prop_icecage.png`},
  {src:'39.jpg', dest: String.raw`G:\exoduser\assets\map\ch6\collision\prop_eyetotem.png`},
  {src:'40.jpg', dest: String.raw`G:\exoduser\assets\map\ch7\collision\prop_gargoyle.png`},
  {src:'41.jpg', dest: String.raw`G:\exoduser\assets\map\ch2\collision\prop_webp.png`},
];

function magScore(r, g, b) {
  const dr = 255 - r, dg = g - 0, db = 255 - b;
  const dist = Math.sqrt(dr * dr + dg * dg + db * db);
  return 1 - Math.min(1, dist / 300);
}

async function keyOne(job) {
  const input = path.join(SRC, job.src);
  const {data, info} = await sharp(input).ensureAlpha().raw().toBuffer({resolveWithObject: true});
  const w = info.width, h = info.height;
  const d = new Uint8ClampedArray(data);

  for (let i = 0; i < d.length; i += 4) {
    const s = magScore(d[i], d[i + 1], d[i + 2]);
    if (s > 0.58) d[i + 3] = 0;
    else if (s > 0.38) d[i + 3] = Math.round(d[i + 3] * (1 - (s - 0.38) / 0.20));
  }

  for (let pass = 0; pass < 3; pass++) {
    const copy = new Uint8ClampedArray(d);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = (y * w + x) * 4;
        if (copy[i + 3] === 0) continue;
        const s = magScore(copy[i], copy[i + 1], copy[i + 2]);
        if (s < 0.22) continue;
        let near0 = false;
        for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
          if (copy[((y + dy) * w + (x + dx)) * 4 + 3] < 16) { near0 = true; break; }
        }
        if (near0) d[i + 3] = Math.round(d[i + 3] * Math.max(0, 1 - (s - 0.18) * 2.2));
      }
    }
  }

  let minX = w, minY = h, maxX = 0, maxY = 0, opaque = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > 24) {
        opaque++;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  const pad = 10;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);
  const cw = maxX - minX + 1, ch = maxY - minY + 1;
  const cropped = Buffer.alloc(cw * ch * 4);
  for (let y = 0; y < ch; y++) {
    cropped.set(d.subarray(((minY + y) * w + minX) * 4, ((minY + y) * w + minX + cw) * 4), y * cw * 4);
  }

  fs.mkdirSync(path.dirname(job.dest), {recursive: true});
  await sharp(cropped, {raw: {width: cw, height: ch, channels: 4}}).png().toFile(job.dest);
  const sample = cropped[(Math.floor(ch / 2) * cw + 4) * 4 + 3];
  console.log(path.basename(job.dest), cw + 'x' + ch, 'opaque', opaque, 'edgeA', sample);
}

(async () => {
  for (const job of jobs) await keyOne(job);
})().catch(e => { console.error(e); process.exit(1); });
