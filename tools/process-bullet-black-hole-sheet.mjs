import sharp from 'sharp';
import { resolve } from 'node:path';

const input = resolve(process.argv[2] || 'assets/vfx/bullet_black_hole_sheet.png');
const output = resolve(process.argv[3] || input);
const width = 2048;
const height = 1024;

const { data, info } = await sharp(input)
  .resize(width, height, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const rgba = Buffer.alloc(width * height * 4);
const clampByte = (value) => Math.max(0, Math.min(255, Math.round(value)));

for (let src = 0, dst = 0; src < data.length; src += info.channels, dst += 4) {
  const r = data[src];
  const g = data[src + 1];
  const b = data[src + 2];
  const hi = Math.max(r, g, b);
  const lo = Math.min(r, g, b);
  const chroma = hi - lo;
  const luminance = (r + g + b) / 3;

  // Image API가 투명 대신 구워 넣은 흰/회색 체크무늬를 제거한다.
  // 채도가 높은 용암광과 저명도 검은 코어는 동시에 보존한다.
  const colorAlpha = clampByte((chroma - 8) * 4.2);
  const darkAlpha = clampByte((208 - luminance) * 3.8);
  let alpha = Math.max(colorAlpha, darkAlpha);
  if (luminance > 210 && chroma < 22) alpha = 0;
  if (alpha < 10) alpha = 0;

  // 밝은 체크무늬의 중성 성분을 줄여 가장자리의 흰 프린지를 억제한다.
  const neutralSpill = luminance > 70 ? lo * 0.72 : 0;
  rgba[dst] = alpha ? clampByte(r - neutralSpill) : 0;
  rgba[dst + 1] = alpha ? clampByte(g - neutralSpill) : 0;
  rgba[dst + 2] = alpha ? clampByte(b - neutralSpill) : 0;
  rgba[dst + 3] = alpha;
}

await sharp(rgba, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(output);

console.log(`normalized ${input} -> ${output} (${width}x${height}, RGBA)`);
