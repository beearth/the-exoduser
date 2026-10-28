// 실버 헬 눈 고리 문장(M1, 2026-10-28): 로비 오른쪽 판·메뉴 창 워터마크용. 옛 장미창(img/ui/blackiron/sigil.png)이
// 연꽃 만다라처럼 읽혀 게임과 안 어울린다는 사용자 지적 → 로고 O자리(바깥 가시 고리 + 안쪽 이빨 + 세로 눈동자)를 크게 그린다.
// 점·잔점 장식 없음. 2048px RGBA PNG.
// 사용: NODE_PATH=G:/exoduser/node_modules node tools/make_eye_crest.cjs img/ui/silver_hell/eye_crest_20261028.png
const sharp=require('sharp');const out=process.argv[2]||'img/ui/silver_hell/eye_crest_20261028.png';
const S=2048,C=S/2;
const f=v=>v.toFixed(1);
const pt=(a,r)=>[C+Math.cos(a)*r,C+Math.sin(a)*r];
// 바깥(또는 안쪽)으로 뻗은 가시 하나: 밑변 반폭 w, 길이 L
function spike(a,r0,L,w,fill){const [x,y]=pt(a,r0),[tx,ty]=pt(a,r0+L);const px=-Math.sin(a)*w,py=Math.cos(a)*w;
 return `<path d="M${f(x+px)} ${f(y+py)}L${f(tx)} ${f(ty)}L${f(x-px)} ${f(y-py)}Z" fill="${fill}" stroke="#000" stroke-width="4"/>`;}
const ring=(r,w,stroke,op=1)=>`<circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-opacity="${op}"/>`;
let g='';
// 1) 바깥 가시 고리: 큰 가시 12 + 작은 가시 24, 동서남북은 더 길게
for(let i=0;i<36;i++){const a=i/36*Math.PI*2-Math.PI/2,big=i%3===0,card=i%9===0;
 g+=spike(a,872,card?150:big?96:52,card?26:big?20:12,'url(#chrome)');}
// 2) 바깥 테: 굵은 크롬 + 안팎 헤어라인
g+=ring(868,40,'#000')+ring(868,28,'url(#chromeR)')+ring(846,3,'#e6e3dc',.35)+ring(892,3,'#e6e3dc',.25);
// 3) 바깥 테 안쪽으로 향한 이빨 48개(로고 O 안쪽 가시)
for(let i=0;i<48;i++){const a=(i+.5)/48*Math.PI*2-Math.PI/2;g+=spike(a,842,-(i%2?70:110),i%2?11:16,'url(#chrome)');}
// 4) 가운데 테
g+=ring(700,22,'#000')+ring(700,13,'url(#chromeR)')+ring(684,2.5,'#e6e3dc',.3);
// 5) 가운데 테에서 눈을 향해 안으로 뻗은 가시 36개(로고 O 안쪽 가시처럼 눈을 둘러싼다) — 길이 3단
for(let i=0;i<48;i++){const a=(i+.5)/48*Math.PI*2-Math.PI/2,k=i%3;g+=spike(a,690,-(k===0?170:k===1?120:90),k===0?17:12,'url(#chrome)');}
// 홍채를 감싸는 가는 이중 테(가운데 빈 띠를 정리)
g+=ring(410,3,'#c9c7c3',.45)+ring(430,2,'#c9c7c3',.25);
// 6) 홍채: 가는 방사선(핏줄 대신 선), 테두리
let veins='';for(let i=0;i<72;i++){const a=i/72*Math.PI*2,r1=i%2?250:210,[x0,y0]=pt(a,150),[x1,y1]=pt(a,r1);
 veins+=`<path d="M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}" stroke="${i%2?'#7a1410':'#c21a10'}" stroke-opacity="${i%2?.55:.75}" stroke-width="${i%2?2:3}"/>`;}
g+=`<circle cx="${C}" cy="${C}" r="330" fill="url(#iris)"/>`+veins+ring(330,20,'#000')+ring(330,11,'url(#chromeR)');
// 홍채 안쪽 이빨 24개
for(let i=0;i<24;i++){const a=(i+.5)/24*Math.PI*2-Math.PI/2;g+=spike(a,318,-52,10,'url(#chrome)');}
// 7) 세로 눈동자(마름모 슬릿) — 지옥의 눈 진홍, 크롬 테
const ph=250,pw=64;
g+=`<path d="M${C} ${C-ph}C${C+pw*.55} ${C-ph*.45} ${C+pw} ${C-ph*.12} ${C+pw} ${C}C${C+pw} ${C+ph*.12} ${C+pw*.55} ${C+ph*.45} ${C} ${C+ph}C${C-pw*.55} ${C+ph*.45} ${C-pw} ${C+ph*.12} ${C-pw} ${C}C${C-pw} ${C-ph*.12} ${C-pw*.55} ${C-ph*.45} ${C} ${C-ph}Z" fill="url(#pupil)" stroke="#000" stroke-width="10"/>`;
g+=`<path d="M${C} ${C-ph+18}C${C+pw*.45} ${C-ph*.42} ${C+pw-12} ${C-ph*.1} ${C+pw-12} ${C}" fill="none" stroke="#f6f5f2" stroke-opacity=".55" stroke-width="4"/>`;
// 가운데 세로 틈(파충류 눈)
g+=`<path d="M${C} ${C-ph+40}C${C+10} ${C-90} ${C+12} ${C+90} ${C} ${C+ph-40}C${C-12} ${C+90} ${C-10} ${C-90} ${C} ${C-ph+40}Z" fill="#050304"/>`;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
<defs>
 <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f5f2"/><stop offset=".3" stop-color="#c9c7c3"/><stop offset=".5" stop-color="#4f5352"/><stop offset=".64" stop-color="#c9c7c3"/><stop offset="1" stop-color="#8a8b88"/></linearGradient>
 <linearGradient id="chromeR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f5f2"/><stop offset=".25" stop-color="#9b9e9e"/><stop offset=".5" stop-color="#e6e3dc"/><stop offset=".75" stop-color="#4f5352"/><stop offset="1" stop-color="#c9c7c3"/></linearGradient>
 <radialGradient id="iris" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#3a0806"/><stop offset=".55" stop-color="#1a0605"/><stop offset="1" stop-color="#0b0b0d"/></radialGradient>
 <radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset=".7" stop-color="#c21a10" stop-opacity=".22"/><stop offset="1" stop-color="#c21a10" stop-opacity="0"/></radialGradient>
 <linearGradient id="pupil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a1410"/><stop offset=".5" stop-color="#c21a10"/><stop offset="1" stop-color="#5c0f0b"/></linearGradient>
</defs>
${g}
</svg>`;
require('fs').mkdirSync(require('path').dirname(out),{recursive:true});
sharp(Buffer.from(svg)).png({compressionLevel:9}).toFile(out).then(i=>console.log(out,i.width+'x'+i.height,i.size));
