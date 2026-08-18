const {createCanvas}=require('canvas');
const fs=require('fs');
const path=require('path');

const OUT='G:/exoduser/docs/4.1맵디자인+설정/compose_ch1';
fs.mkdirSync(OUT,{recursive:true});

const MAP=8000;
const T=40;
const W=900,H=1040;
const PAD=70,BOARD=760;
const FONT='"Malgun Gothic","Noto Sans KR",sans-serif';

const STAGES={
  0:{
    title:'1-1 숲 입구',
    line:'주인공은 용해골 하나. 멀리 뼈만 지평선',
    empty:[{x:.50,y:.88,r:480,name:'시작 비움'},{x:.50,y:.14,r:420,name:'문 비움'}],
    keep:[{x:.50,y:.50,rx:1500,ry:900,name:'3D 용해골',fill:'#6a5a48'},{x:.68,y:.86,r:600,name:'2D 해골',fill:'#8a7a62'}],
    mega:[{x:.84,y:.22,r:700,name:'뿔난 거대뼈'}],
    trees:'sparse'
  },
  1:{
    title:'1-2 뒤틀린 숲길',
    line:'길은 비운다. 나무·예배당은 길 옆',
    empty:[{x:.50,y:.88,r:480,name:'시작 비움'},{x:.50,y:.14,r:420,name:'문 비움'}],
    lane:{x:.50,w:.14,name:'남북 길'},
    lm:[{x:.36,y:.42,r:280,name:'눈나무'},{x:.64,y:.40,r:250,name:'눈나무'},{x:.34,y:.56,r:220,name:'눈나무'}],
    mega:[{x:.28,y:.26,r:440,name:'무너진 예배당'}],
    trees:'sides'
  },
  2:{
    title:'1-3 괴기 군락',
    line:'소품은 섬 안에. 가운데 흙은 비움',
    empty:[{x:.50,y:.88,r:420,name:'시작 비움'},{x:.50,y:.14,r:380,name:'문 비움'},{x:.50,y:.48,r:700,name:'중앙 비움'}],
    groves:[{x:.28,y:.35,r:900,name:'군락 A'},{x:.72,y:.38,r:900,name:'군락 B'},{x:.50,y:.62,r:800,name:'군락 C'}],
    lm:[{x:.72,y:.38,r:200,name:'오각진'},{x:.74,y:.42,r:190,name:'눈나무'},{x:.50,y:.62,r:260,name:'살점덩어리'}],
    mega:[{x:.28,y:.35,r:490,name:'거대석두'}],
    trees:'grove'
  },
  3:{
    title:'1-4 기생수의 둥지',
    line:'가운데 광장. 북에 왕좌만. 문은 비움',
    empty:[{x:.50,y:.52,r:1200,name:'중앙 광장'},{x:.50,y:.88,r:400,name:'시작 비움'},{x:.50,y:.12,r:400,name:'문 비움'}],
    rim:.22,
    lm:[{x:.50,y:.30,r:200,name:'왕좌'},{x:.22,y:.32,r:180,name:'뼈아치'},{x:.78,y:.32,r:160,name:'살점아구리'}],
    mega:[],
    trees:'rim'
  }
};

function nx(x){return PAD+x*BOARD}
function ny(y){return PAD+y*BOARD}
function nr(r){return r/MAP*BOARD}

function drawOne(si){
  const S=STAGES[si];
  const c=createCanvas(W,H);
  const g=c.getContext('2d');
  g.fillStyle='#14110e';g.fillRect(0,0,W,H);
  g.fillStyle='#1c1814';g.fillRect(PAD-8,PAD-8,BOARD+16,BOARD+16);
  g.strokeStyle='#3a3228';g.lineWidth=2;g.strokeRect(PAD-8,PAD-8,BOARD+16,BOARD+16);

  // grid 10%
  g.strokeStyle='rgba(180,150,90,.08)';g.lineWidth=1;
  for(let i=0;i<=10;i++){
    const p=PAD+i*BOARD/10;
    g.beginPath();g.moveTo(p,PAD);g.lineTo(p,PAD+BOARD);g.stroke();
    g.beginPath();g.moveTo(PAD,p);g.lineTo(PAD+BOARD,p);g.stroke();
  }
  g.strokeStyle='rgba(180,150,90,.18)';
  g.beginPath();g.moveTo(nx(.5),PAD);g.lineTo(nx(.5),PAD+BOARD);g.stroke();
  g.beginPath();g.moveTo(PAD,ny(.5));g.lineTo(PAD+BOARD,ny(.5));g.stroke();

  // rim band
  if(S.rim){
    g.save();
    g.beginPath();g.rect(PAD,PAD,BOARD,BOARD);
    const cx=nx(.5),cy=ny(.5),rr=nr((.5-S.rim)*MAP);
    g.arc(cx,cy,rr,0,Math.PI*2,true);
    g.clip('evenodd');
    g.fillStyle='rgba(90,50,40,.22)';g.fillRect(PAD,PAD,BOARD,BOARD);
    g.restore();
    g.strokeStyle='rgba(180,90,70,.45)';g.setLineDash([6,5]);
    g.beginPath();g.arc(nx(.5),ny(.5),nr((.5-S.rim)*MAP),0,Math.PI*2);g.stroke();
    g.setLineDash([]);
  }

  if(S.groves){
    for(const gv of S.groves){
      g.fillStyle='rgba(70,90,40,.18)';
      g.beginPath();g.arc(nx(gv.x),ny(gv.y),nr(gv.r),0,Math.PI*2);g.fill();
      g.strokeStyle='rgba(140,160,70,.45)';g.setLineDash([5,4]);
      g.beginPath();g.arc(nx(gv.x),ny(gv.y),nr(gv.r),0,Math.PI*2);g.stroke();
      g.setLineDash([]);
    }
  }

  if(S.lane){
    const x0=nx(S.lane.x-S.lane.w/2),xw=S.lane.w*BOARD;
    g.fillStyle='rgba(200,180,120,.10)';
    g.fillRect(x0,PAD,xw,BOARD);
    g.strokeStyle='rgba(220,190,110,.4)';g.setLineDash([4,4]);
    g.strokeRect(x0,PAD,xw,BOARD);g.setLineDash([]);
  }

  if(S.trees==='sides'){
    g.fillStyle='rgba(50,70,40,.35)';
    for(let i=0;i<28;i++){
      const side=i<14?-1:1;
      const x=.50+side*(.16+.08*((i%7)/7));
      const y=.22+(i%14)*(.055);
      if(y<.18||y>.82)continue;
      g.beginPath();g.arc(nx(x),ny(y),5+i%3,0,Math.PI*2);g.fill();
    }
  }else if(S.trees==='sparse'){
    g.fillStyle='rgba(50,70,40,.3)';
    const pts=[[.12,.22],[.88,.2],[.1,.6],[.9,.58],[.14,.38],[.86,.7],[.08,.8]];
    for(const[x,y] of pts){g.beginPath();g.arc(nx(x),ny(y),6,0,Math.PI*2);g.fill()}
  }else if(S.trees==='grove'&&S.groves){
    g.fillStyle='rgba(50,70,40,.28)';
    for(const gv of S.groves){
      for(let i=0;i<8;i++){
        const a=i/8*Math.PI*2,rr=.035;
        g.beginPath();g.arc(nx(gv.x+Math.cos(a)*rr*2),ny(gv.y+Math.sin(a)*rr*2),5,0,Math.PI*2);g.fill();
      }
    }
  }else if(S.trees==='rim'){
    g.fillStyle='rgba(70,40,40,.4)';
    for(let i=0;i<36;i++){
      const a=i/36*Math.PI*2,rad=.42;
      g.beginPath();g.arc(nx(.5+Math.cos(a)*rad),ny(.5+Math.sin(a)*rad),6,0,Math.PI*2);g.fill();
    }
  }

  function oval(o,fill,stroke){
    g.fillStyle=fill;g.strokeStyle=stroke;g.lineWidth=2;
    g.beginPath();
    if(o.rx)g.ellipse(nx(o.x),ny(o.y),nr(o.rx),nr(o.ry),0,0,Math.PI*2);
    else g.arc(nx(o.x),ny(o.y),nr(o.r),0,Math.PI*2);
    g.fill();g.stroke();
  }

  if(S.empty){
    for(const e of S.empty){
      g.fillStyle='rgba(40,80,90,.12)';
      g.beginPath();g.arc(nx(e.x),ny(e.y),nr(e.r),0,Math.PI*2);g.fill();
      g.strokeStyle='rgba(80,160,170,.5)';g.setLineDash([3,3]);g.lineWidth=1.5;
      g.beginPath();g.arc(nx(e.x),ny(e.y),nr(e.r),0,Math.PI*2);g.stroke();
      g.setLineDash([]);
    }
  }

  if(S.keep){
    for(const k of S.keep)oval(k,k.fill||'#6a5a48','#c4b08a');
  }
  if(S.mega){
    for(const m of S.mega)oval(m,'rgba(160,70,50,.55)','#e07050');
  }
  if(S.lm){
    for(const m of S.lm)oval(m,'rgba(90,120,70,.55)','#b4d080');
  }

  // start / gate
  g.fillStyle='#44cc88';g.beginPath();g.arc(nx(.5),ny(.90),9,0,Math.PI*2);g.fill();
  g.fillStyle='#cc4444';g.beginPath();g.arc(nx(.5),ny(.10),9,0,Math.PI*2);g.fill();
  g.fillStyle='#e8dcc0';g.font='bold 13px '+FONT;g.textAlign='center';
  g.fillText('6시 시작',nx(.5),ny(.90)+22);
  g.fillText('12시 보스문',nx(.5),ny(.10)-14);

  // labels
  g.font='11px '+FONT;g.textAlign='center';g.fillStyle='#f0e6d0';
  const labs=[...(S.keep||[]),...(S.mega||[]),...(S.lm||[])];
  for(const o of labs){
    g.fillText(o.name,nx(o.x),ny(o.y)+4);
  }

  // compass
  g.fillStyle='#c4b08a';g.font='bold 16px '+FONT;
  g.fillText('N',nx(.5),PAD-18);
  g.strokeStyle='#c4b08a';g.beginPath();g.moveTo(nx(.5),PAD-8);g.lineTo(nx(.5),PAD+6);g.stroke();

  // title
  g.textAlign='left';g.fillStyle='#f2e6c8';g.font='bold 22px '+FONT;
  g.fillText(S.title,PAD,PAD+BOARD+36);
  g.fillStyle='#b8a888';g.font='14px '+FONT;
  g.fillText(S.line,PAD,PAD+BOARD+58);
  g.fillStyle='#7a7060';g.font='12px '+FONT;
  g.fillText('200×200 타일  /  8000×8000px  /  설계도  ·  미니맵',PAD,PAD+BOARD+78);
  g.fillText('주황=메가(멀리서 보임)  녹=장면 소품  청점선=비움  갈=용해골',PAD,PAD+BOARD+96);

  const file=path.join(OUT,`blueprint_${si+1}-${si+1===1?'1':si+1}.png`.replace('blueprint_1-1','blueprint_1-1').replace('blueprint_2-2','blueprint_1-2').replace('blueprint_3-3','blueprint_1-3').replace('blueprint_4-4','blueprint_1-4'));
  const names=['blueprint_1-1.png','blueprint_1-2.png','blueprint_1-3.png','blueprint_1-4.png'];
  const dest=path.join(OUT,names[si]);
  fs.writeFileSync(dest,c.toBuffer('image/png'));
  return dest;
}

function drawAtlas(){
  const names=['blueprint_1-1.png','blueprint_1-2.png','blueprint_1-3.png','blueprint_1-4.png'];
  const imgs=names.map(n=>{
    const {loadImage}=require('canvas');
    return loadImage(path.join(OUT,n));
  });
  return Promise.all(imgs).then(loaded=>{
    const c=createCanvas(1840,2140);
    const g=c.getContext('2d');
    g.fillStyle='#0e0c0a';g.fillRect(0,0,1840,2140);
    g.fillStyle='#f2e6c8';g.font='bold 28px '+FONT;
    g.fillText('1장 썩은 숲  —  평원 설계도 (미니맵)',40,48);
    g.fillStyle='#8a8070';g.font='16px '+FONT;
    g.fillText('남=시작  북=보스문  ·  한 구역 = 한 장면  ·  여백이 길이다',40,76);
    loaded.forEach((im,i)=>{
      const x=20+(i%2)*910,y=100+Math.floor(i/2)*1010;
      g.drawImage(im,x,y,900,1000);
    });
    const dest=path.join(OUT,'blueprint_ch1_atlas.png');
    fs.writeFileSync(dest,c.toBuffer('image/png'));
    return dest;
  });
}

const files=[];
for(let i=0;i<4;i++)files.push(drawOne(i));
drawAtlas().then(a=>{
  console.log(files.join('\n'));
  console.log(a);
});
