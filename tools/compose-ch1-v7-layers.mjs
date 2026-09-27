import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
const dir = 'assets/map/ch1/';
const base = 'rottenwood_living_hell_v6.png';
const source = 'rottenwood_living_hell_v7_source.png';
const regions = [
  {id:'ground',label:'피부 지면 변화',points:'600,550 1360,450 1520,900 1450,1450 1220,1960 700,1950 490,1400 500,900'},
  {id:'left',label:'괴사 구덩이',points:'0,520 410,500 630,800 600,1320 470,1730 0,1850'},
  {id:'right',label:'쓰러진 생체 고목',points:'1630,350 2048,300 2048,1900 1660,1790 1470,1400 1490,850'},
  {id:'north',label:'북문 동맥 조직',points:'590,0 1470,0 1510,430 1240,590 800,590 560,350'}
];
const pixels = await sharp(dir+source).removeAlpha().raw().toBuffer();
const layers=[];
for(const r of regions){
  const mask=await sharp(Buffer.from(`<svg width="2048" height="2048" xmlns="http://www.w3.org/2000/svg"><rect width="2048" height="2048" fill="black"/><polygon points="${r.points}" fill="white"/></svg>`)).blur(20).greyscale().removeAlpha().raw().toBuffer();
  const rgba=Buffer.alloc(2048*2048*4);
  for(let i=0;i<mask.length;i++){rgba[i*4]=pixels[i*3];rgba[i*4+1]=pixels[i*3+1];rgba[i*4+2]=pixels[i*3+2];rgba[i*4+3]=mask[i]<2?0:mask[i];}
  const file=`rottenwood_living_hell_v7_${r.id}_layer.png`;
  await sharp(rgba,{raw:{width:2048,height:2048,channels:4}}).png().toFile(dir+file);
  layers.push(file);
}
await sharp(dir+base).composite(layers.map(file=>({input:dir+file,blend:'over'}))).png().toFile(dir+'rottenwood_living_hell_v7.png');
await writeFile(dir+'rottenwood_living_hell_v7_layers.json',JSON.stringify({base,source,width:2048,height:2048,blend:'source-over',blurSigma:20,alphaBelow2Zeroed:true,regions,layers},null,2));
await writeFile(dir+'rottenwood_living_hell_v7_layers.svg',`<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="2048" height="2048">${[base,...layers].map((file,i)=>`<g inkscape:groupmode="layer" inkscape:label="${i?regions[i-1].label:'v6 원본'}" id="layer${i}"><image href="${file}" width="2048" height="2048"/></g>`).join('')}</svg>`);
await writeFile(dir+'rottenwood_living_hell_v7_review.html',`<!doctype html><html lang="ko"><meta charset="utf-8"><title>생체숲 v7 구역 레이어</title><style>body{margin:0;background:#151216;color:#e4d8d8;font:16px system-ui}header{position:sticky;top:0;z-index:5;background:#221e25;padding:15px;display:flex;gap:20px;flex-wrap:wrap}.map{position:relative;max-width:1600px;margin:auto}img{width:100%;display:block}.overlay{position:absolute;inset:0}a{color:#e0b590}</style><header><strong>생체숲 v7</strong>${regions.map((r,i)=>`<label><input type="checkbox" checked data-layer="${i}">${r.label}</label>`).join('')}<a href="rottenwood_living_hell_v7.png">합성본</a></header><div class="map"><img src="${base}" alt="v6 원본">${layers.map((f,i)=>`<img id="layer${i}" class="overlay" src="${f}" alt="${regions[i].label}">`).join('')}</div><script>document.querySelectorAll('input[data-layer]').forEach(input=>input.addEventListener('change',()=>{document.getElementById('layer'+input.dataset.layer).style.display=input.checked?'block':'none'}));</script></html>`);
console.log('Saved four region layers, composite, metadata, SVG and comparison page.');
