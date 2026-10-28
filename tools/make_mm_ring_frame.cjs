// 실버 헬 미니맵 틀(2026-10-28): 로고 O자리 "눈 고리"(M1)를 미니맵 테두리로. 166px 틀의 4배(664px) RGBA PNG.
// 사용: NODE_PATH=... node tools/make_mm_ring_frame.cjs img/mm_frame_ring_20261028.png
const sharp=require('sharp');const out=process.argv[2]||'img/mm_frame_ring_20261028.png';
const S=664,C=S/2,R=268;
let spikes='';const N=32;
for(let i=0;i<N;i++){const a=i/N*Math.PI*2-Math.PI/2,big=i%2===0,L=big?46:26,w=big?14:9;
 const x=C+Math.cos(a)*(R+6),y=C+Math.sin(a)*(R+6),tx=C+Math.cos(a)*(R+6+L),ty=C+Math.sin(a)*(R+6+L),px=-Math.sin(a)*w/2,py=Math.cos(a)*w/2;
 spikes+=`<path d="M${x+px} ${y+py}L${tx} ${ty}L${x-px} ${y-py}Z" fill="url(#chrome)" stroke="#000" stroke-width="2"/>`;}
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
<defs>
 <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f5f2"/><stop offset=".3" stop-color="#c9c7c3"/><stop offset=".5" stop-color="#4f5352"/><stop offset=".64" stop-color="#c9c7c3"/><stop offset="1" stop-color="#8a8b88"/></linearGradient>
 <radialGradient id="bezel" cx="50%" cy="50%" r="50%"><stop offset=".86" stop-color="#0d0d0f" stop-opacity="0"/><stop offset=".9" stop-color="#0d0d0f" stop-opacity=".9"/><stop offset="1" stop-color="#0d0d0f" stop-opacity=".9"/></radialGradient>
</defs>
${spikes}
<circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="#000" stroke-width="26"/>
<circle cx="${C}" cy="${C}" r="${R}" fill="none" stroke="url(#chrome)" stroke-width="16"/>
<circle cx="${C}" cy="${C}" r="${R-14}" fill="none" stroke="#000" stroke-width="5"/>
<circle cx="${C}" cy="${C}" r="${R-17}" fill="none" stroke="#c9c7c3" stroke-opacity=".35" stroke-width="2.5"/>
<circle cx="${C}" cy="${C}" r="${R+12}" fill="none" stroke="#c9c7c3" stroke-opacity=".25" stroke-width="2"/>
<path d="M${C} ${C-R-30}L${C+15} ${C-R-6}L${C} ${C-R+18}L${C-15} ${C-R-6}Z" fill="#c21a10" stroke="#f6f5f2" stroke-width="3"/>
</svg>`;
sharp(Buffer.from(svg)).png({compressionLevel:9}).toFile(out).then(i=>console.log(out,i.width+'x'+i.height));
