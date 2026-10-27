// 실버 헬 이미지 변환기 (2026-10-28) — UI 틀 이미지의 황동·금빛 픽셀을 같은 밝기의 은빛으로 바꾼다.
// 규칙은 tools/silver_hell_remap.cjs와 같다(색상 18~65°, 채도 ≥ .08). 빨강·투명도는 그대로.
// 금속 광택을 살리려고 밝기를 128 기준으로 1.12배 대비를 준다.
// 사용: node tools/silver_hell_recolor_img.cjs 파일...  (같은 경로에 덮어씀, 원본은 Git 이력)
const sharp=require('sharp');sharp.cache(false);const fs=require('fs');const path=require('path');
const cl=v=>Math.max(0,Math.min(255,Math.round(v)));
(async()=>{for(const f of process.argv.slice(2)){
 const {data,info}=await sharp(fs.readFileSync(f)).ensureAlpha().raw().toBuffer({resolveWithObject:true});let n=0;
 for(let i=0;i<data.length;i+=4){const r=data[i],g=data[i+1],b=data[i+2];
  const mx=Math.max(r,g,b),mn=Math.min(r,g,b);if(mx===mn)continue;const l=(mx+mn)/510,d=(mx-mn)/255;const s=l>.5?d/(2-(mx+mn)/255):d/((mx+mn)/255);
  let h;if(mx===r)h=((g-b)/(mx-mn)+(g<b?6:0))*60;else if(mx===g)h=((b-r)/(mx-mn)+2)*60;else h=((r-g)/(mx-mn)+4)*60;
  // 어두운 적갈색 쇠(색상 0~18°·345° 이상, 채도 .4 미만, 명도 .25 미만)도 중성 흑철로. 밝은 진홍 빛은 그대로
  const darkRedBrown=(h<18||h>=345)&&s<0.4&&l<0.25;
  if(s<0.08||(!darkRedBrown&&(h<18||h>=65)))continue;
  const Y=(0.2126*r+0.7152*g+0.0722*b-128)*1.12+128;
  if(Y>=180){data[i]=cl(Y+3);data[i+1]=cl(Y);data[i+2]=cl(Y-6);}else{data[i]=cl(Y-2);data[i+1]=cl(Y+1);data[i+2]=cl(Y+1);}n++;}
 const ext=path.extname(f).toLowerCase();let img=sharp(data,{raw:{width:info.width,height:info.height,channels:4}});
 img=ext==='.webp'?img.webp({quality:92}):img.png({compressionLevel:9});
 const t=f+'.tmp'+ext;await img.toFile(t);fs.renameSync(t,f);console.log(f,'바뀐 픽셀',n,'/',info.width*info.height);
}})();
