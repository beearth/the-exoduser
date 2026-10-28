// RM-3 P0 탑뷰 스케치: 웹 1-3 걷기 격자 위에 plan_rm3.json 요소를 그린다.
// 출력 = tools/rm3/ch1_3_plan_topview.svg (+ --png 이면 같은 이름 .png, headless Chrome 스크린샷)
// 사용: node tools/rm3/sketch.mjs [--png]
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(here, '../../unity/Assets/Exoduser/Remodel/CH1_3/Data');
const W = JSON.parse(fs.readFileSync(path.join(DATA, 'ch1_3_walk.json'), 'utf8'));
const R = JSON.parse(fs.readFileSync(path.join(DATA, 'ch1_3_rooms.json'), 'utf8'));
const S = JSON.parse(fs.readFileSync(path.join(DATA, 'ch1_3_spawns.json'), 'utf8'));
const I = JSON.parse(fs.readFileSync(path.join(DATA, 'ch1_3_blocked_islands.json'), 'utf8'));
const PL = JSON.parse(fs.readFileSync(path.join(here, 'plan_rm3.json'), 'utf8'));
const K = 5, PAD = 12, N = W.N, M = W.M, SZ = (N + PAD * 2) * K;
const X = t => (t + PAD) * K, Y = t => (t + PAD) * K;
const o = [];
o.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${SZ}" height="${SZ + 150}" viewBox="0 0 ${SZ} ${SZ + 150}" font-family="Malgun Gothic, sans-serif">`);
o.push(`<rect width="100%" height="100%" fill="#0d0b0a"/>`);
// 격자 밖 띠
o.push(`<defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#3a2a22" stroke-width="3"/></pattern></defs>`);
o.push(`<rect x="0" y="0" width="${SZ}" height="${SZ}" fill="url(#hatch)"/>`);
// 걷기 격자
o.push(`<rect x="${X(0)}" y="${Y(0)}" width="${N * K}" height="${M * K}" fill="#2a3a26"/>`);
for (let y = 0; y < M; y++) { const row = W.rows[y]; let x = 0; while (x < N) { if (row[x] === '1') { let e = x; while (e < N && row[e] === '1') e++; o.push(`<rect x="${X(x)}" y="${Y(y)}" width="${(e - x) * K}" height="${K}" fill="#120c0a"/>`); x = e; } else x++; } }
o.push(`<rect x="${X(0)}" y="${Y(0)}" width="${N * K}" height="${M * K}" fill="none" stroke="#a49373" stroke-width="2"/>`);
// 방
for (const r of R.runtimeRooms) o.push(`<rect x="${X(r.x)}" y="${Y(r.y)}" width="${r.w * K}" height="${r.h * K}" fill="none" stroke="#5a7a8a" stroke-dasharray="4 3" stroke-width="1.5"/><text x="${X(r.x) + 3}" y="${Y(r.y) + 12}" fill="#7a9aaa" font-size="11">${r.type}</text>`);
// 독성 강(격자 밖)
o.push(`<rect x="${X(-7)}" y="${Y(20)}" width="${6 * K}" height="${180 * K}" fill="#4a3a0c" opacity=".9"/><rect x="${X(200)}" y="${Y(40)}" width="${6 * K}" height="${160 * K}" fill="#4a3a0c" opacity=".9"/>`);
o.push(`<text x="${X(-2.5)}" y="${Y(150)}" fill="#dfd6c2" font-size="12" transform="rotate(-90 ${X(-2.5)} ${Y(150)})">TR-W 독성 강 남→북</text>`);
o.push(`<text x="${X(202)}" y="${Y(90)}" fill="#dfd6c2" font-size="12" transform="rotate(90 ${X(202)} ${Y(90)})">TR-E 독성 강 남→북</text>`);
// 북쪽 장벽 띠
o.push(`<rect x="${X(40)}" y="${Y(-11)}" width="${120 * K}" height="${10 * K}" fill="#3a2418" stroke="#6b5a48"/><text x="${X(62)}" y="${Y(-4.5)}" fill="#dfd6c2" font-size="13">LM5 북쪽 버섯 장벽(키 큰 실루엣, 높이 제한 없음)</text>`);
o.push(`<text x="${X(55)}" y="${Y(207)}" fill="#c08070" font-size="12">남쪽 띠 = 카메라 쪽 → 0.9u 이하</text>`);
// 섬 외곽·번호
for (const s of I.islands) { const [x0, y0, x1, y1] = s.bbox; if (s.size >= 21) o.push(`<text x="${X(x1) + 3}" y="${Y(y0) + 8}" fill="#8a7a6a" font-size="9">${s.id}</text>`); }
// 랜드마크
const lmColor = '#dfd6c2';
for (const L of PL.landmarks) {
  const ids = L.island !== undefined ? [L.island] : (L.islands || []);
  for (const id of ids) { const s = I.islands.find(q => q.id === id); const [x0, y0, x1, y1] = s.bbox; o.push(`<rect x="${X(x0) - 3}" y="${Y(y0) - 3}" width="${(x1 - x0 + 1) * K + 6}" height="${(y1 - y0 + 1) * K + 6}" fill="none" stroke="${lmColor}" stroke-width="2"/>`); }
  for (const id of ids) { const s = I.islands.find(q => q.id === id); o.push(`<text x="${X(s.bbox[0])}" y="${Y(s.bbox[1]) - 6}" fill="${lmColor}" font-size="12" font-weight="bold">${L.id}</text>`); }
}
o.push(`<text x="${X(48)}" y="${Y(80)}" fill="${lmColor}" font-size="11">짐승 굴(입구 북향)·빈 둥지</text>`);
o.push(`<text x="${X(107)}" y="${Y(127)}" fill="${lmColor}" font-size="11">버섯 군락 심장</text>`);
// 독액 웅덩이
for (const p of PL.toxic.pools) o.push(`<circle cx="${X(p.center[0])}" cy="${Y(p.center[1])}" r="${p.rTiles * K}" fill="#4a3a0c" stroke="#a8a23a" stroke-width="1.5"/>`);
// 빛 웅덩이
for (const p of PL.lightPools.hell) o.push(`<circle cx="${X(p.at[0])}" cy="${Y(p.at[1])}" r="${p.r / 40 * K}" fill="#b0281c" fill-opacity=".22" stroke="#b0281c" stroke-width="1.5"/><text x="${X(p.at[0]) - 6}" y="${Y(p.at[1]) + 4}" fill="#e06050" font-size="10">H${p.id.split('_').pop()}</text>`);
for (const p of PL.lightPools.toxic) o.push(`<circle cx="${X(p.at[0])}" cy="${Y(p.at[1])}" r="${p.r / 40 * K}" fill="none" stroke="#a8a23a" stroke-dasharray="3 2" stroke-width="1.5"/>`);
for (const p of PL.lightPools.shafts) o.push(`<path d="M${X(p.at[0]) - 6},${Y(p.at[1]) - 18} L${X(p.at[0]) + 6},${Y(p.at[1]) - 18} L${X(p.at[0]) + 3},${Y(p.at[1])} L${X(p.at[0]) - 3},${Y(p.at[1])} Z" fill="#5a1410" stroke="#b0281c"/>`);
// 동선·W8 끌린 자국
o.push(`<polyline points="${PL.route.map(([x, y]) => X(x) + ',' + Y(y)).join(' ')}" fill="none" stroke="#a49373" stroke-width="2" stroke-dasharray="8 5" opacity=".8"/>`);
const drag = PL.w8.find(w => w.id === 'W8-1');
o.push(`<polyline points="${drag.path.map(([x, y]) => X(x) + ',' + Y(y)).join(' ')}" fill="none" stroke="#6e1e18" stroke-width="3" stroke-dasharray="2 4"/>`);
// 소환굴·시작·출구
for (const h of S.holesRuntime) o.push(`<rect x="${X(h.tx) - 3}" y="${Y(h.ty) - 3}" width="6" height="6" fill="#e0b040"/>`);
o.push(`<circle cx="${X(R.start[0] + .5)}" cy="${Y(R.start[1] + .5)}" r="6" fill="#5080ff"/><text x="${X(R.start[0]) + 9}" y="${Y(R.start[1]) + 5}" fill="#8aa8ff" font-size="12">START</text>`);
for (const [x, y] of R.exit.tiles) o.push(`<rect x="${X(x)}" y="${Y(y)}" width="${K}" height="${K}" fill="#ffffff"/>`);
o.push(`<text x="${X(104)}" y="${Y(8)}" fill="#ffffff" font-size="11">EXIT·보스문</text>`);
// 범례
const ly = SZ + 18; let lx = 12;
const leg = [['#2a3a26', '걷기 칸(웹 정답)'], ['#120c0a', '막힘 칸(충돌물 47·섬 50)'], ['url(#hatch)', '격자 밖 띠'], ['#4a3a0c', '독액(강·고리 웅덩이)'], ['#b0281c', '진홍 빛 웅덩이 H1~10'], ['#e0b040', '소환굴 13'], ['#6e1e18', 'W8 끌려간 자국']];
for (const [c, t] of leg) { o.push(`<rect x="${lx}" y="${ly}" width="14" height="14" fill="${c}" stroke="#a49373"/><text x="${lx + 20}" y="${ly + 12}" fill="#dfd6c2" font-size="12">${t}</text>`); lx += 20 + t.length * 11 + 18; }
o.push(`<text x="12" y="${ly + 42}" fill="#dfd6c2" font-size="13">RM-3 1-3 P0 배치 계획 탑뷰 — 웹 origin/main ${JSON.parse(fs.readFileSync(path.join(DATA, 'ch1_3_source_receipt.json'), 'utf8')).mainSha.slice(0, 9)} si=2, 200×200(1칸=40px=0.4u). 테두리선 = 걷기 격자 경계(격자 끝까지 걷기).</text>`);
o.push(`<text x="12" y="${ly + 62}" fill="#c08070" font-size="12">섬 50개 전부 북쪽 16칸 안에 걷기 칸 → 카메라 쪽(높이 0.9u 상한). 키 큰 버섯은 격자 밖 북·서·동 띠에만. 섬 번호 = ch1_3_blocked_islands.json id</text>`);
o.push(`<text x="12" y="${ly + 82}" fill="#8a7a6a" font-size="12">흰 테두리 = 랜드마크 섬(LM1 굴·LM2 심장·LM3 버섯 고리·LM4 눈버섯), 노란 원 = 독액 고리 웅덩이, 붉은 사다리꼴 = 붉은 빛줄기, 회색 점선 = 주 동선</text>`);
o.push('</svg>');
const svgPath = path.join(here, 'ch1_3_plan_topview.svg');
fs.writeFileSync(svgPath, o.join('\n'));
console.log('svg', svgPath, SZ);
if (process.argv.includes('--png')) {
  const { chromium } = createRequire('G:/exoduser/package.json')('playwright');
  const b = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--mute-audio'] });
  const p = await b.newPage({ viewport: { width: SZ, height: SZ + 150 } });
  await p.setContent(`<html><body style="margin:0;background:#0d0b0a">${o.join('\n')}</body></html>`);
  const pngPath = svgPath.replace(/\.svg$/, '.png');
  await p.screenshot({ path: pngPath, fullPage: true });
  console.log('png', pngPath);
  await Promise.race([b.close().catch(() => {}), new Promise(r => setTimeout(r, 5000))]);
  process.exit(0);
}
