import { useState, useRef, useEffect } from "react";

// game.html 원본 데이터
const ELC=['#bbbbbb','#ff5522','#3388ff','#9933cc','#ffee00','#ffd700'];
const ELN=['물리','화염','빙결','암흑','뇌전','신성'];

// 투사체 정의 + game.html 정확한 줄번호·색상 매핑
const DEFS=[
  {id:'fire',name:'화염탄',el:1,desc:'혜성형 물방울 화염',fn:'_draw3DProj',fl:5644,
    colors:{outerFlame:{l:5650,o:'#551100',d:'외곽 화염 꼬리'},midFlame:{l:5653,o:'#cc4400',d:'중간 화염'},hotFlame:{l:5656,o:'#ff7700',d:'뜨거운 내부'},core:{l:5659,o:'#ffaa33',d:'플라즈마 코어'},tip:{l:5662,o:'#ffeeaa',d:'백열 선단'},spark:{l:5665,o:'#ffdd44',d:'불꽃 스파크'}}},
  {id:'ice',name:'빙결탄',el:2,desc:'다이아몬드 크리스탈',fn:'_draw3DProj',fl:5644,
    colors:{aura:{l:5672,o:'#224466',d:'서리 글로우'},topFace:{l:5675,o:'#66ccee',d:'밝은 면'},botFace:{l:5678,o:'#2288bb',d:'어두운 면'},innerFace:{l:5681,o:'#aaeeff',d:'내부 밝은 면'},specular:{l:5684,o:'#ddf8ff',d:'스펙큘러'}}},
  {id:'dark',name:'암흑탄',el:3,desc:'블랙홀 보이드 오브',fn:'_draw3DProj',fl:5644,
    colors:{ring:{l:5692,o:'#bb55ff',d:'사건의 지평선'},fog:{l:5695,o:'#330055',d:'외곽 보라 안개'},void_c:{l:5697,o:'#080010',d:'보이드 코어'},rim:{l:5699,o:'#9944ee',d:'림 라이트'},swirl:{l:5701,o:'#cc66ff',d:'소용돌이'},innerGlow:{l:5705,o:'#7722bb',d:'내부 글로우'},particle:{l:5708,o:'#dd88ff',d:'빨려드는 빛'}}},
  {id:'ltn',name:'뇌전탄',el:4,desc:'지그재그 볼트',fn:'_draw3DProj',fl:5644,
    colors:{outerGlow:{l:5712,o:'#ffff00',d:'외곽 글로우'},body:{l:5715,o:'#ffee00',d:'번개 본체'},core:{l:5718,o:'#ffffaa',d:'밝은 코어'},center:{l:5721,o:'#ffffff',d:'백열 중심'},spark:{l:5724,o:'#ffff88',d:'전기 방전'}}},
  {id:'holy',name:'신성탄',el:5,desc:'회전 황금 십자성',fn:'_draw3DProj',fl:5644,
    colors:{rays:{l:5733,o:'#ffdd44',d:'8방향 광휘'},darkGold:{l:5737,o:'#cc9900',d:'어두운 금'},brightGold:{l:5740,o:'#ffcc22',d:'밝은 금'},gem:{l:5743,o:'#fff8cc',d:'중심 보석'},hl:{l:5744,o:'#ffffff',d:'하이라이트'}}},
  {id:'phys',name:'물리탄',el:0,desc:'회전 정팔면체',fn:'_draw3DProj',fl:5644,
    colors:{outer:{l:5747,o:'#aaaaaa',d:'밝은 면1'},mid:{l:5749,o:'#888888',d:'어두운 면1'},inner:{l:5751,o:'#777777',d:'밝은 면2'},dark:{l:5753,o:'#555555',d:'어두운 면2'},edge:{l:5755,o:'#dddddd',d:'외곽선'},hl:{l:5757,o:'#ffffff',d:'하이라이트'}}},
  {id:'arrow',name:'화살',el:0,desc:'속성 화살촉+깃',fn:'_drawProcArrow',fl:5762,
    colors:{shaft:{l:5767,o:'#886644',d:'나무 화살대'},tipHL:{l:5772,o:'#ffffff',d:'화살촉 하이라이트'}}},
  {id:'bomb',name:'폭탄',el:1,desc:'도화선 금속구',fn:'_drawProcBomb',fl:5780,
    colors:{body:{l:5786,o:'#2a2a2a',d:'본체'},hl:{l:5788,o:'#555555',d:'3D 하이라이트'},fuse:{l:5795,o:'#886644',d:'도화선'},spark:{l:5799,o:'#ffff88',d:'불꽃'},sparkCore:{l:5800,o:'#ffffff',d:'불꽃 코어'}}},
  {id:'redbean',name:'빨간콩탄',el:1,desc:'화염구 추적탄',fn:'렌더루프(projs)',fl:19600,
    colors:{aura:{l:19608,o:'#ff0000',d:'위험 오라'},midAura:{l:19611,o:'#ff2200',d:'중간 오라'},bodyR:{l:19614,o:'#cc0000',d:'본체'},coreR:{l:19617,o:'#ff4400',d:'밝은 코어'},hot:{l:19620,o:'#ffccaa',d:'핫스팟'},tail1:{l:19624,o:'#ff0000',d:'꼬리 넓은'},tail2:{l:19626,o:'#ff4400',d:'꼬리 중간'},tail3:{l:19628,o:'#ffaa44',d:'꼬리 좁은'}}},
  {id:'blackbean',name:'녹콩(독)탄',el:3,desc:'독구슬 탄막',fn:'렌더루프(projs)',fl:19645,
    colors:{auraG:{l:19647,o:'#00cc00',d:'독기 오라'},midG:{l:19650,o:'#22aa00',d:'중간 오라'},bodyG:{l:19653,o:'#008800',d:'본체'},coreG:{l:19656,o:'#33cc00',d:'밝은 코어'},hotG:{l:19659,o:'#bbffaa',d:'핫스팟'},tailG1:{l:19663,o:'#00aa00',d:'꼬리 넓은'},tailG2:{l:19665,o:'#44cc22',d:'꼬리 중간'},tailG3:{l:19667,o:'#88ee44',d:'꼬리 좁은'}}},
  {id:'bluebean',name:'파란콩탄',el:2,desc:'유도 반사탄',fn:'렌더루프(projs)',fl:19678,
    colors:{glowB:{l:19680,o:'#006080',d:'글로우'},trailB:{l:19684,o:'#00e5ff',d:'트레일'}}},
];

function getOrig(def){const c={};for(const k in def.colors)c[k]=def.colors[k].o;return c}

// ═══ 클코 프롬프트 생성 (핵심 기능) ═══
function mkPrompt(def,colors){
  const ch=[];
  for(const k in colors){
    const m=def.colors[k];
    if(m && colors[k]!==m.o) ch.push({k,l:m.l,from:m.o,to:colors[k],d:m.d});
  }
  if(!ch.length) return null;
  let p=`game.html의 ${def.fn} 함수 (${def.fl}번째 줄 부근) 에서\n`;
  p+=`${def.name}(${def.desc})의 색상을 다음과 같이 변경해줘:\n\n`;
  for(const c of ch) p+=`${c.l}번째 줄: '${c.from}' → '${c.to}'  // ${c.d} (${c.k})\n`;
  p+=`\n다른 로직은 건드리지 말고 색상 hex 문자열만 정확히 교체해.`;
  return p;
}

// ═══ Canvas 렌더 (game.html 복제) ═══
function render(X,cx,cy,def,C,t,s){
  X.save();X.translate(cx,cy);
  const el=def.el, ang=t*.002;
  if(def.id==='fire'){X.rotate(ang);X.globalAlpha=.15;X.fillStyle=C.outerFlame;X.beginPath();X.moveTo(s*.5,0);X.quadraticCurveTo(-s*.5,-s*1.1,-s*3.5,0);X.quadraticCurveTo(-s*.5,s*1.1,s*.5,0);X.fill();X.globalAlpha=.3;X.fillStyle=C.midFlame;X.beginPath();X.moveTo(s*.5,0);X.quadraticCurveTo(-s*.3,-s*.65,-s*2.2,0);X.quadraticCurveTo(-s*.3,s*.65,s*.5,0);X.fill();X.globalAlpha=.5;X.fillStyle=C.hotFlame;X.beginPath();X.moveTo(s*.4,0);X.quadraticCurveTo(-s*.15,-s*.38,-s*1.2,0);X.quadraticCurveTo(-s*.15,s*.38,s*.4,0);X.fill();X.globalAlpha=.85;X.fillStyle=C.core;X.beginPath();X.moveTo(s*.7,0);X.quadraticCurveTo(0,-s*.55,-s*.4,0);X.quadraticCurveTo(0,s*.55,s*.7,0);X.fill();X.globalAlpha=.6;X.fillStyle=C.tip;X.beginPath();X.moveTo(s*.55,0);X.quadraticCurveTo(0,-s*.22,-s*.12,0);X.quadraticCurveTo(0,s*.22,s*.55,0);X.fill();X.globalAlpha=.4;X.fillStyle=C.spark;const ft=t*.01;X.beginPath();X.arc(Math.sin(ft)*s*.35,Math.cos(ft*1.3)*s*.45,s*.1,0,Math.PI*2);X.fill()}
  else if(def.id==='ice'){X.rotate(ang);X.globalAlpha=.1;X.fillStyle=C.aura;X.beginPath();X.moveTo(s*1.8,0);X.lineTo(0,-s*.9);X.lineTo(-s*1.3,0);X.lineTo(0,s*.9);X.closePath();X.fill();X.globalAlpha=.8;X.fillStyle=C.topFace;X.beginPath();X.moveTo(s*1.5,0);X.lineTo(0,-s*.7);X.lineTo(-s,0);X.closePath();X.fill();X.globalAlpha=.6;X.fillStyle=C.botFace;X.beginPath();X.moveTo(s*1.5,0);X.lineTo(0,s*.7);X.lineTo(-s,0);X.closePath();X.fill();X.globalAlpha=.9;X.fillStyle=C.innerFace;X.beginPath();X.moveTo(s*1.1,0);X.lineTo(0,-s*.35);X.lineTo(-s*.6,0);X.closePath();X.fill();X.globalAlpha=.5;X.fillStyle=C.specular;X.beginPath();X.arc(-s*.1,-s*.15,s*.13,0,Math.PI*2);X.fill()}
  else if(def.id==='dark'){const sw=Math.sin(t*.005);X.globalAlpha=.4;X.strokeStyle=C.ring;X.lineWidth=1.5;X.beginPath();X.ellipse(0,0,s+4,s*.35+sw*2,t*.002,0,Math.PI*2);X.stroke();X.globalAlpha=.12;X.fillStyle=C.fog;X.beginPath();X.arc(0,0,s+2,0,Math.PI*2);X.fill();X.globalAlpha=1;X.fillStyle=C.void_c;X.beginPath();X.arc(0,0,s,0,Math.PI*2);X.fill();X.globalAlpha=.6;X.strokeStyle=C.rim;X.lineWidth=1.5;X.beginPath();X.arc(0,0,s*.9,0,Math.PI*2);X.stroke();X.globalAlpha=.35;X.strokeStyle=C.swirl;X.lineWidth=1;X.beginPath();X.arc(0,0,s*.5,t*.008,t*.008+Math.PI*1.2);X.stroke();X.globalAlpha=.2;X.fillStyle=C.innerGlow;X.beginPath();X.arc(0,0,s*.35,0,Math.PI*2);X.fill();for(let i=0;i<3;i++){const pa=t*.003+Math.PI*2*i/3,pr=s*1.4+Math.sin(t*.006+i)*3;X.globalAlpha=.3;X.fillStyle=C.particle;X.beginPath();X.arc(Math.cos(pa)*pr,Math.sin(pa)*pr,1.2,0,Math.PI*2);X.fill()}}
  else if(def.id==='ltn'){X.rotate(ang);X.globalAlpha=.12;X.fillStyle=C.outerGlow;X.beginPath();X.moveTo(s*1.6,0);X.lineTo(s*.3,-s*.7);X.lineTo(s*.5,-s*.1);X.lineTo(-s*1.3,s*.35);X.lineTo(-s*.2,s*.05);X.lineTo(-s*.7,s*.6);X.closePath();X.fill();X.globalAlpha=.8;X.fillStyle=C.body;X.beginPath();X.moveTo(s*1.4,0);X.lineTo(s*.25,-s*.45);X.lineTo(s*.45,-s*.1);X.lineTo(-s*1.1,s*.25);X.lineTo(-s*.1,s*.02);X.lineTo(-s*.5,s*.4);X.closePath();X.fill();X.globalAlpha=1;X.fillStyle=C.core;X.beginPath();X.moveTo(s*.9,0);X.lineTo(s*.15,-s*.22);X.lineTo(s*.28,0);X.lineTo(-s*.65,s*.12);X.lineTo(0,0);X.lineTo(-s*.25,s*.2);X.closePath();X.fill();X.globalAlpha=.7;X.fillStyle=C.center;X.beginPath();X.arc(0,0,s*.2,0,Math.PI*2);X.fill();X.globalAlpha=.3;X.strokeStyle=C.spark;X.lineWidth=.7;for(let i=0;i<3;i++){const ba=Math.PI*2*i/3+t*.008;X.beginPath();X.moveTo(Math.cos(ba)*s*.3,Math.sin(ba)*s*.3);X.lineTo(Math.cos(ba+.4)*(s+3)+Math.sin(t*.02+i*5)*2,Math.sin(ba+.4)*(s+3)+Math.cos(t*.03+i*3)*2);X.stroke()}}
  else if(def.id==='holy'){X.rotate(t*.003);X.globalAlpha=.12;X.fillStyle=C.rays;for(let i=0;i<8;i++){const ra=Math.PI*2*i/8;X.beginPath();X.moveTo(0,0);X.lineTo(Math.cos(ra-.12)*(s+5),Math.sin(ra-.12)*(s+5));X.lineTo(Math.cos(ra+.12)*(s+5),Math.sin(ra+.12)*(s+5));X.fill()}X.globalAlpha=.9;X.fillStyle=C.darkGold;X.fillRect(-s*.3,-s*1.1,s*.6,s*2.2);X.fillRect(-s*1.1,-s*.3,s*2.2,s*.6);X.globalAlpha=1;X.fillStyle=C.brightGold;X.fillRect(-s*.15,-s*.9,s*.3,s*1.8);X.fillRect(-s*.9,-s*.15,s*1.8,s*.3);X.globalAlpha=1;X.fillStyle=C.gem;X.beginPath();X.arc(0,0,s*.3,0,Math.PI*2);X.fill();X.globalAlpha=.6;X.fillStyle=C.hl;X.beginPath();X.arc(-s*.08,-s*.1,s*.12,0,Math.PI*2);X.fill()}
  else if(def.id==='phys'){const rot=t*.003,c=Math.cos(rot);X.globalAlpha=.85;X.fillStyle=C.outer;X.beginPath();X.moveTo(0,-s*1.2);X.lineTo(s*c,0);X.lineTo(0,0);X.closePath();X.fill();X.globalAlpha=.6;X.fillStyle=C.mid;X.beginPath();X.moveTo(0,-s*1.2);X.lineTo(-s*c,0);X.lineTo(0,0);X.closePath();X.fill();X.globalAlpha=.7;X.fillStyle=C.inner;X.beginPath();X.moveTo(0,s*1.2);X.lineTo(s*c,0);X.lineTo(0,0);X.closePath();X.fill();X.globalAlpha=.5;X.fillStyle=C.dark;X.beginPath();X.moveTo(0,s*1.2);X.lineTo(-s*c,0);X.lineTo(0,0);X.closePath();X.fill();X.globalAlpha=.4;X.strokeStyle=C.edge;X.lineWidth=.7;X.beginPath();X.moveTo(0,-s*1.2);X.lineTo(s*c,0);X.lineTo(0,s*1.2);X.lineTo(-s*c,0);X.closePath();X.stroke();X.globalAlpha=.4;X.fillStyle=C.hl;X.beginPath();X.arc(-s*.15,-s*.3,s*.18,0,Math.PI*2);X.fill()}
  else if(def.id==='arrow'){const ec=ELC[el];X.rotate(ang);X.globalAlpha=.7;X.fillStyle=C.shaft;X.fillRect(-s*.9,-1,s*1.6,2);X.globalAlpha=.9;X.fillStyle=ec;X.beginPath();X.moveTo(s*1.3,0);X.lineTo(s*.35,-3.5);X.lineTo(s*.35,3.5);X.closePath();X.fill();X.globalAlpha=.45;X.fillStyle=C.tipHL;X.beginPath();X.moveTo(s*1.2,0);X.lineTo(s*.45,-1.5);X.lineTo(s*.45,0);X.closePath();X.fill();X.globalAlpha=.5;X.fillStyle=ec;X.beginPath();X.moveTo(-s*.7,0);X.lineTo(-s*1.15,-3);X.lineTo(-s*.5,0);X.closePath();X.fill();X.beginPath();X.moveTo(-s*.7,0);X.lineTo(-s*1.15,3);X.lineTo(-s*.5,0);X.closePath();X.fill()}
  else if(def.id==='bomb'){const ec=ELC[el];X.globalAlpha=.9;X.fillStyle=C.body;X.beginPath();X.arc(0,0,s,0,Math.PI*2);X.fill();X.globalAlpha=.35;X.fillStyle=C.hl;X.beginPath();X.arc(-s*.2,-s*.2,s*.6,0,Math.PI*2);X.fill();X.globalAlpha=.5;X.strokeStyle=ec;X.lineWidth=1;X.beginPath();X.arc(0,0,s*.7,0,Math.PI*2);X.stroke();X.globalAlpha=.7;X.strokeStyle=C.fuse;X.lineWidth=1.5;X.beginPath();X.moveTo(0,-s);X.quadraticCurveTo(s*.3,-s*1.3,s*.15,-s*1.4);X.stroke();const sp=.8+Math.sin(t*.008)*.2;X.globalAlpha=sp;X.fillStyle=C.spark;X.beginPath();X.arc(s*.15,-s*1.4,2,0,Math.PI*2);X.fill()}
  else if(def.id==='redbean'){const rb=s,flk=Math.sin(t/35)>.1?1:.6;X.globalAlpha=.12;X.fillStyle=C.aura;X.beginPath();X.arc(0,0,rb*3.5,0,Math.PI*2);X.fill();X.globalAlpha=.2*flk;X.fillStyle=C.midAura;X.beginPath();X.arc(0,0,rb*2.2,0,Math.PI*2);X.fill();X.globalAlpha=.85*flk;X.fillStyle=C.bodyR;X.beginPath();X.arc(0,0,rb,0,Math.PI*2);X.fill();X.globalAlpha=.9;X.fillStyle=C.coreR;X.beginPath();X.arc(0,0,rb*.6,0,Math.PI*2);X.fill();X.globalAlpha=.7*flk;X.fillStyle=C.hot;X.beginPath();X.arc(-rb*.15,-rb*.2,rb*.3,0,Math.PI*2);X.fill();X.globalAlpha=.15;X.strokeStyle=C.tail1;X.lineWidth=rb*1.8;X.beginPath();X.moveTo(0,0);X.lineTo(-21,0);X.stroke();X.globalAlpha=.25*flk;X.strokeStyle=C.tail2;X.lineWidth=rb*1.1;X.beginPath();X.moveTo(0,0);X.lineTo(-15,0);X.stroke();X.globalAlpha=.35;X.strokeStyle=C.tail3;X.lineWidth=rb*.5;X.beginPath();X.moveTo(0,0);X.lineTo(-9,0);X.stroke()}
  else if(def.id==='blackbean'){const gb=s,flk=Math.sin(t/40)>.1?1:.6;X.globalAlpha=.12;X.fillStyle=C.auraG;X.beginPath();X.arc(0,0,gb*3.5,0,Math.PI*2);X.fill();X.globalAlpha=.2*flk;X.fillStyle=C.midG;X.beginPath();X.arc(0,0,gb*2.2,0,Math.PI*2);X.fill();X.globalAlpha=.85*flk;X.fillStyle=C.bodyG;X.beginPath();X.arc(0,0,gb,0,Math.PI*2);X.fill();X.globalAlpha=.9;X.fillStyle=C.coreG;X.beginPath();X.arc(0,0,gb*.6,0,Math.PI*2);X.fill();X.globalAlpha=.6*flk;X.fillStyle=C.hotG;X.beginPath();X.arc(-gb*.15,-gb*.2,gb*.3,0,Math.PI*2);X.fill();X.globalAlpha=.15;X.strokeStyle=C.tailG1;X.lineWidth=gb*1.8;X.beginPath();X.moveTo(0,0);X.lineTo(-21,0);X.stroke();X.globalAlpha=.25*flk;X.strokeStyle=C.tailG2;X.lineWidth=gb*1.1;X.beginPath();X.moveTo(0,0);X.lineTo(-15,0);X.stroke();X.globalAlpha=.35;X.strokeStyle=C.tailG3;X.lineWidth=gb*.5;X.beginPath();X.moveTo(0,0);X.lineTo(-9,0);X.stroke()}
  else if(def.id==='bluebean'){X.globalAlpha=.15;X.fillStyle=C.glowB;X.beginPath();X.arc(0,0,s*2,0,Math.PI*2);X.fill();X.globalAlpha=.8;X.fillStyle='#00ccee';X.beginPath();X.arc(0,0,s*.8,0,Math.PI*2);X.fill();X.globalAlpha=1;X.fillStyle='#aaeeff';X.beginPath();X.arc(0,0,s*.4,0,Math.PI*2);X.fill();X.globalAlpha=.2;X.strokeStyle=C.trailB;X.lineWidth=s;X.beginPath();X.moveTo(0,0);X.lineTo(-s*4,0);X.stroke()}
  X.restore();
}

// ═══ 미니 프리뷰 ═══
function Mini({def,colors,active,onClick}){
  const ref=useRef(null),aRef=useRef(0);
  useEffect(()=>{const c=ref.current;if(!c)return;const x=c.getContext('2d');let on=true;
    const lp=t=>{if(!on)return;x.clearRect(0,0,140,80);render(x,70,40,def,colors,t,12);aRef.current=requestAnimationFrame(lp)};
    aRef.current=requestAnimationFrame(lp);return()=>{on=false;cancelAnimationFrame(aRef.current)}},[def,colors]);
  return(
    <div onClick={onClick} style={{background:'#1a1a2e',border:`2px solid ${active?'#e94560':'#2a2a44'}`,borderRadius:8,cursor:'pointer',overflow:'hidden',boxShadow:active?'0 0 12px #e9456044':'none',transition:'.15s'}}>
      <canvas ref={ref} width={140} height={80} style={{display:'block',width:'100%',height:80,background:'#08080f'}}/>
      <div style={{padding:'4px 8px',display:'flex',justifyContent:'space-between',alignItems:'center',fontFamily:'monospace',fontSize:10}}>
        <span style={{fontWeight:700,color:'#e0e0f0'}}>{def.name}</span>
        <span style={{width:8,height:8,borderRadius:'50%',background:ELC[def.el]}}/>
      </div>
    </div>
  );
}

// ═══ 큰 프리뷰 ═══
function Big({def,colors}){
  const ref=useRef(null),aRef=useRef(0);
  useEffect(()=>{const c=ref.current;if(!c)return;const x=c.getContext('2d');let on=true;
    const lp=t=>{if(!on)return;x.clearRect(0,0,460,160);
      [10,18,28].forEach((sc,i)=>{render(x,70+i*150,80,def,colors,t,sc);
        x.globalAlpha=.4;x.fillStyle='#555';x.font='9px monospace';x.textAlign='center';
        x.fillText(sc+'px',70+i*150,80+sc*2+16);x.globalAlpha=1});
      aRef.current=requestAnimationFrame(lp)};
    aRef.current=requestAnimationFrame(lp);return()=>{on=false;cancelAnimationFrame(aRef.current)}},[def,colors]);
  return <canvas ref={ref} width={460} height={160} style={{display:'block',width:'100%',height:160,background:'#08080f',borderRadius:8,border:'1px solid #2a2a44'}}/>;
}

// ═══ MAIN ═══
export default function App(){
  const[idx,setIdx]=useState(0);
  const[cs,setCs]=useState(()=>{const m={};DEFS.forEach(d=>{m[d.id]=getOrig(d)});return m});
  const[copied,setCopied]=useState(false);

  const def=DEFS[idx], colors=cs[def.id];
  const prompt=mkPrompt(def,colors);
  const hasC=!!prompt;

  const setC=(k,v)=>setCs(p=>({...p,[def.id]:{...p[def.id],[k]:v}}));
  const reset=()=>setCs(p=>({...p,[def.id]:getOrig(def)}));
  const copy=()=>{if(!prompt)return;navigator.clipboard?.writeText(prompt);setCopied(true);setTimeout(()=>setCopied(false),2000)};

  return(
    <div style={{display:'grid',gridTemplateColumns:'1fr 340px',height:'100vh',background:'#0a0a12',color:'#e0e0f0',fontFamily:'sans-serif',overflow:'hidden'}}>
      {/* 갤러리 */}
      <div style={{overflow:'auto',padding:12}}>
        <div style={{fontFamily:'monospace',fontSize:11,fontWeight:700,color:'#e94560',letterSpacing:2,marginBottom:10}}>
          ⚔ EXODUSER <span style={{color:'#64dcff'}}>PROJECTILE FORGE</span>
          <span style={{color:'#5a5a7a',fontWeight:400,fontSize:9,marginLeft:8}}>커스텀 → 클코 프롬프트</span>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:8}}>
          {DEFS.map((d,i)=><Mini key={d.id} def={d} colors={cs[d.id]} active={i===idx} onClick={()=>setIdx(i)}/>)}
        </div>
      </div>

      {/* 에디터 */}
      <div style={{background:'#12121e',borderLeft:'1px solid #2a2a44',overflow:'auto',padding:12,display:'flex',flexDirection:'column',gap:8}}>
        <Big def={def} colors={colors}/>

        <div style={{fontFamily:'monospace',fontSize:13,fontWeight:700}}>{def.name}</div>
        <div style={{fontFamily:'monospace',fontSize:9,color:'#5a5a7a'}}>
          {def.desc} · {ELN[def.el]} · {def.fn} ({def.fl}줄~)
        </div>

        {/* 색상 에디터 */}
        <div style={{fontFamily:'monospace',fontSize:10,fontWeight:700,color:'#e94560',borderBottom:'1px solid #2a2a44',paddingBottom:4}}>색상 커스텀</div>
        {Object.keys(colors).map(k=>{
          const m=def.colors[k]; if(!m)return null;
          const ch=colors[k]!==m.o;
          return(
            <div key={k} style={{display:'flex',alignItems:'center',gap:6,margin:'1px 0'}}>
              <input type="color" value={colors[k]} onChange={e=>setC(k,e.target.value)}
                style={{width:28,height:18,border:'1px solid #2a2a44',borderRadius:3,background:'#1a1a2e',cursor:'pointer',padding:0}}/>
              <span style={{fontFamily:'monospace',fontSize:9,color:ch?'#e94560':'#5a5a7a',minWidth:68,fontWeight:ch?700:400}}>{k}</span>
              <span style={{fontFamily:'monospace',fontSize:8,color:'#5a5a7a'}}>{m.d}</span>
              {ch&&<span style={{fontFamily:'monospace',fontSize:8,color:'#64dcff',marginLeft:'auto'}}>{m.o}→{colors[k]}</span>}
            </div>
          );
        })}

        {/* 버튼 */}
        <div style={{display:'flex',gap:6,marginTop:6}}>
          <button onClick={reset} style={{border:'1px solid #2a2a44',borderRadius:5,padding:'6px 12px',cursor:'pointer',fontWeight:700,fontSize:10,background:'#1a1a2e',color:'#9a9abb',fontFamily:'monospace'}}>↺ 리셋</button>
          <button onClick={copy} disabled={!hasC} style={{border:'none',borderRadius:5,padding:'6px 12px',cursor:hasC?'pointer':'default',fontWeight:700,fontSize:10,background:hasC?'#e94560':'#333',color:'#fff',fontFamily:'monospace',opacity:hasC?1:.4}}>
            {copied?'✓ 복사됨!':'📋 클코 프롬프트 복사'}
          </button>
        </div>

        {/* 프롬프트 미리보기 */}
        <div style={{fontFamily:'monospace',fontSize:10,fontWeight:700,color:hasC?'#64dcff':'#5a5a7a',borderBottom:'1px solid #2a2a44',paddingBottom:4,marginTop:4}}>
          {hasC?'⬇ 이걸 클코에 그대로 붙여넣으면 됨':'색상 바꾸면 클코 프롬프트가 자동 생성됩니다'}
        </div>
        <div onClick={hasC?copy:undefined} style={{
          background:'#0d0d1a',border:`1px solid ${hasC?'#64dcff44':'#2a2a44'}`,borderRadius:6,padding:10,
          fontFamily:'monospace',fontSize:10,color:hasC?'#64dcff':'#5a5a7a',
          maxHeight:220,overflow:'auto',whiteSpace:'pre-wrap',lineHeight:1.7,
          cursor:hasC?'pointer':'default',
        }}>
          {prompt||'// 색상을 바꾸면 여기에 클코 프롬프트가 생성됩니다\n// 예: 5650번째 줄: \'#551100\' → \'#661122\' (outerFlame)'}
        </div>
      </div>
    </div>
  );
}
