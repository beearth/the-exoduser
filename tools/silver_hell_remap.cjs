// 실버 헬 색 변환기 (2026-10-28, docs/3.1 ui hud 디자인/DESIGN_CONCEPT_SILVER_HELL_20261028.md §3)
// 황동·갈색·금빛 뼈색(색상 18~65°, 채도 ≥ .08)을 같은 밝기의 은빛·흑철로 바꾼다.
// 빨강·주황 경고(18° 미만), 초록·파랑·보라, 무채색은 그대로 둔다.
// --keep-vivid: 채도 .6 초과 색은 보존(보석·등급 색이 섞인 파일용).
// 사용: node tools/silver_hell_remap.cjs [--keep-vivid] [--dry] 파일...
const fs=require('fs');
const args=process.argv.slice(2);const keepVivid=args.includes('--keep-vivid'),dry=args.includes('--dry');
const files=args.filter(a=>!a.startsWith('--'));
function hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?((g-b)/d+(g<b?6:0)):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60}return [h,s,l]}
const cl=v=>Math.max(0,Math.min(255,Math.round(v)));
// 밝은 색은 로고 하이라이트처럼 아주 약간 따뜻한 은빛(본문 글자 #e6e3dc), 나머지는 로고 흑철처럼 약간 차가운 회색(#4f5352)
function silver(r,g,b){const Y=0.2126*r+0.7152*g+0.0722*b;
 if(Y>=180)return [cl(Y+3),cl(Y),cl(Y-6)];
 return [cl(Y-2),cl(Y+1),cl(Y+1)];}
function convert(r,g,b){const [H,S,L]=hsl(r,g,b);
 if(S<0.08)return null;
 // 어두운 적갈색 바탕(색상 0~18°·345° 이상, 채도 .4 미만, 명도 .25 미만)도 중성 흑철로. 진홍 강조(채도 높음)는 그대로
 const darkRedBrown=(H<18||H>=345)&&S<0.4&&L<0.25;
 if(!darkRedBrown&&(H<18||H>=65))return null;
 if(keepVivid&&S>0.6)return null;
 // 주황 강조(색상 18~33°, 채도 .55 초과, 명도 .35~.85)는 상태 구분용(적용 대기·현재 단계 등)이라 은빛이 아니라 "지옥의 눈" 진홍으로
 // 단, 밝은 주황(명도 .6 초과)은 진홍으로 보내면 분홍·산호색이 되므로 은빛으로 (2026-10-28 2차)
 if(!darkRedBrown&&H<33&&S>0.55&&L>0.35&&L<=0.6)return hslToRgb(4,Math.min(S,0.78),L);
 return silver(r,g,b);}
function hslToRgb(h,s,l){h/=360;const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;const f=t=>{t<0&&(t+=1);t>1&&(t-=1);return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p};return [cl(f(h+1/3)*255),cl(f(h)*255),cl(f(h-1/3)*255)]}
const hex2=v=>v.toString(16).padStart(2,'0');
const styleOnly=args.includes('--style-only'); // HTML의 <style> 블록 안만 바꾼다(JS 속 등급·데미지 색 보호)
for(const f of files){
 const whole=fs.readFileSync(f,'utf8');let n=0;
 const rg=(args.find(a=>a.startsWith('--range='))||'').slice(8); // --range=시작줄-끝줄 (그 줄들만 바꾼다, 1부터)
 if(rg){const [a,b]=rg.split('-').map(Number);const L=whole.split('\n');const r=remapText(L.slice(a-1,b).join('\n'));
  console.log(f,`(${a}~${b}줄만) 바뀐 색`,r.n);if(!dry&&r.n){const out=[...L.slice(0,a-1),...r.out.split('\n'),...L.slice(b)].join('\n');const t=f+'.tmp';fs.writeFileSync(t,out);fs.renameSync(t,f);}continue;}
 if(styleOnly){let total=0;const out=whole.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g,(m,a,css,c)=>{const r=remapText(css);total+=r.n;return a+r.out+c;});
  console.log(f,'(style만) 바뀐 색',total);if(!dry&&total){const t=f+'.tmp';fs.writeFileSync(t,out);fs.renameSync(t,f);}continue;}
 const r=remapText(whole);n=r.n;console.log(f,'바뀐 색',n);
 if(!dry&&n){const t=f+'.tmp';fs.writeFileSync(t,r.out);fs.renameSync(t,f);}
}
function remapText(src){let n=0;
 let out=src.replace(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g,(m,h)=>{
  let full=h.length<=4?h.split('').map(c=>c+c).join(''):h;const r=parseInt(full.slice(0,2),16),g=parseInt(full.slice(2,4),16),b=parseInt(full.slice(4,6),16);
  const c=convert(r,g,b);if(!c)return m;n++;const a=full.length===8?full.slice(6):'';return '#'+c.map(hex2).join('')+a;});
 // three.js 색 상수 0xrrggbb (--hex0x일 때만)
 if(args.includes('--hex0x'))out=out.replace(/0x([0-9a-fA-F]{6})\b/g,(m,h)=>{const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);const c=convert(r,g,b);if(!c)return m;n++;return '0x'+c.map(hex2).join('');});
 // data URI 안의 %23rrggbb
 out=out.replace(/%23([0-9a-fA-F]{6})\b/g,(m,h)=>{const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);const c=convert(r,g,b);if(!c)return m;n++;return '%23'+c.map(hex2).join('');});
 out=out.replace(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g,(m,r,g,b)=>{const c=convert(+r,+g,+b);if(!c)return m;n++;return m.replace(/\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}/,'('+c.join(','));});
 return {out,n};
}
