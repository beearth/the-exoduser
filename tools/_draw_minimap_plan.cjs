const {createCanvas,loadImage}=require('canvas');
const fs=require('fs');
const path=require('path');

const SRC='G:/exoduser/assets/map/_blueprint/_src';
const OUT='G:/exoduser/assets/map/_blueprint';
fs.mkdirSync(SRC,{recursive:true});

const COPY={
  soil:'G:/exoduser/assets/map/ch1/ground_dark_soil.png',
  dragon:'G:/exoduser/img/map_dragon_skeleton.png',
  dragon3:'G:/exoduser/img/map_dragon_3d.png',
  ribs:'G:/exoduser/assets/map/ch1/collision/mega_ribs.png',
  head:'G:/exoduser/assets/map/ch1/collision/mega_head.png',
  chapel:'G:/exoduser/assets/map/ch1/collision/mega_chapel.png',
  statue:'G:/exoduser/assets/map/ch1/collision/mega_statue.png',
  eyetree:'G:/exoduser/assets/map/ch1/collision/eye_tree.png',
  flesh:'G:/exoduser/assets/map/ch1/collision/flesh_ball.png',
  penta:'G:/exoduser/assets/map/ch1/collision/penta_circle.png',
  throne:'G:/exoduser/assets/map/ch1/collision/throne.png',
  arch:'G:/exoduser/assets/map/ch1/collision/bone_arch.png',
  maw:'G:/exoduser/assets/map/ch1/collision/flesh_maw.png',
  tree:'G:/exoduser/assets/map/ch1/collision/cursed_tree_01.png'
};
for(const[k,p] of Object.entries(COPY)){
  const dest=path.join(SRC,k+path.extname(p));
  fs.copyFileSync(p,dest);
}

const SZ=1024, MAP=8000;
function px(n){return n/MAP*SZ}
function wx(x){return x*SZ}
function wy(y){return y*SZ}

async function tileSoil(g,img){
  const tw=256;
  for(let y=0;y<SZ;y+=tw)for(let x=0;x<SZ;x+=tw)g.drawImage(img,x,y,tw,tw);
}

function stamp(g,img,x,y,worldSz){
  if(!img)return;
  const w=px(worldSz);
  const ar=img.height/img.width;
  const h=w*ar;
  g.drawImage(img,wx(x)-w/2,wy(y)-h/2,w,h);
}

function treeRing(g,img,cx,cy,rad,n,sz){
  for(let i=0;i<n;i++){
    const a=i/n*Math.PI*2+(i%3)*0.2;
    const r=rad*(0.82+0.16*(i%4)/4);
    stamp(g,img,cx+Math.cos(a)*r,cy+Math.sin(a)*r,sz);
  }
}

async function draw(si,I){
  const c=createCanvas(SZ+280,SZ+80);
  const g=c.getContext('2d');
  g.fillStyle='#0a0807';g.fillRect(0,0,c.width,c.height);
  g.save();g.translate(16,40);
  tileSoil(g,I.soil);

  const title=['1-1 숲 입구','1-2 뒤틀린 숲길','1-3 괴기 군락','1-4 기생수의 둥지'][si];
  const line=['용해골이 벌판을 먹는다','길은 비우고 양옆에 나무','세 섬, 가운데 흙','가운데 광장, 북에 왕좌'][si];

  if(si===0){
    stamp(g,I.dragon,.50,.50,3000);
    stamp(g,I.dragon,.70,.86,900);
    stamp(g,I.ribs,.84,.22,1500);
    [[.10,.20],[.90,.18],[.08,.62],[.92,.58],[.12,.40],[.88,.72]].forEach(([x,y])=>stamp(g,I.tree,x,y,380));
  }
  if(si===1){
    g.fillStyle='rgba(20,14,10,.45)';
    g.fillRect(wx(.43),0,wx(.14),SZ);
    for(let i=0;i<16;i++){
      const y=.16+i*.045;
      stamp(g,I.tree,.30+(i%3)*0.03,y,340+ (i%2)*40);
      stamp(g,I.tree,.68-(i%3)*0.03,y,340+ (i%2)*40);
    }
    stamp(g,I.chapel,.28,.26,900);
    stamp(g,I.eyetree,.36,.42,620);
    stamp(g,I.eyetree,.64,.40,560);
    stamp(g,I.eyetree,.34,.56,500);
  }
  if(si===2){
    for(let i=0;i<8;i++){
      const a=i/8*Math.PI*2;
      stamp(g,I.tree,.28+Math.cos(a)*.07,.35+Math.sin(a)*.07,300);
      stamp(g,I.tree,.72+Math.cos(a)*.07,.38+Math.sin(a)*.07,300);
      stamp(g,I.tree,.50+Math.cos(a)*.07,.62+Math.sin(a)*.07,300);
    }
    stamp(g,I.head,.28,.35,1100);
    stamp(g,I.penta,.72,.38,520);
    stamp(g,I.eyetree,.74,.42,480);
    stamp(g,I.flesh,.50,.62,640);
  }
  if(si===3){
    g.save();
    g.beginPath();g.rect(0,0,SZ,SZ);
    g.arc(wx(.5),wy(.52),px(1200),0,Math.PI*2,true);
    g.clip('evenodd');
    treeRing(g,I.tree,.50,.50,.40,28,420);
    treeRing(g,I.tree,.50,.50,.46,18,360);
    g.restore();
    stamp(g,I.throne,.50,.30,620);
    stamp(g,I.arch,.22,.32,520);
    stamp(g,I.maw,.78,.32,480);
  }

  // start / gate
  g.fillStyle='#3dcc7a';g.beginPath();g.arc(wx(.5),wy(.90),10,0,Math.PI*2);g.fill();
  g.fillStyle='#fff';g.beginPath();g.moveTo(wx(.5),wy(.90)-16);g.lineTo(wx(.5)-8,wy(.90)-4);g.lineTo(wx(.5)+8,wy(.90)-4);g.closePath();g.fill();
  g.fillStyle='#cc3333';g.fillRect(wx(.5)-18,wy(.10)-8,36,14);

  // vignette
  const vg=g.createRadialGradient(SZ/2,SZ/2,SZ*.35,SZ/2,SZ/2,SZ*.72);
  vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.45)');
  g.fillStyle=vg;g.fillRect(0,0,SZ,SZ);
  g.strokeStyle='#3a3228';g.lineWidth=4;g.strokeRect(2,2,SZ-4,SZ-4);
  g.restore();

  g.fillStyle='#e8dcc0';g.font='bold 22px "Malgun Gothic"';
  g.fillText(title,16,28);
  g.fillStyle='#9a8c78';g.font='14px "Malgun Gothic"';
  g.fillText(line,220,26);
  g.fillStyle='#c4b08a';g.font='bold 16px "Malgun Gothic"';
  g.fillText('N',16+SZ/2-6,36);

  g.fillStyle='#c8bca8';g.font='13px "Malgun Gothic"';
  const legend=[
    '초록 점 = 6시 시작',
    '빨간 막대 = 12시 보스문',
    '큰 실루엣 = 메가/장면',
    '빈 흙이 길이다'
  ];
  legend.forEach((t,i)=>g.fillText(t,SZ+32,80+i*28));

  const dest=path.join(OUT,'minimap_1-'+(si+1)+'.png');
  fs.writeFileSync(dest,c.toBuffer('image/png'));
  return dest;
}

(async()=>{
  const I={};
  for(const k of Object.keys(COPY)){
    const p=path.join(SRC,k+path.extname(COPY[k]));
    try{I[k]=await loadImage(p)}catch(e){console.warn('skip',k,e.message)}
  }
  for(let i=0;i<4;i++)console.log(await draw(i,I));
  const names=[1,2,3,4].map(n=>path.join(OUT,'minimap_1-'+n+'.png'));
  const {createCanvas:cc}=require('canvas');
  const atlas=cc(2100,2180);
  const ag=atlas.getContext('2d');
  ag.fillStyle='#0a0807';ag.fillRect(0,0,2100,2180);
  ag.fillStyle='#e8dcc0';ag.font='bold 28px "Malgun Gothic"';
  ag.fillText('1장 평원 미니맵 설계도',24,40);
  for(let i=0;i<4;i++){
    const im=await loadImage(names[i]);
    ag.drawImage(im,20+(i%2)*1040,70+Math.floor(i/2)*1050,1020,1020);
  }
  fs.writeFileSync(path.join(OUT,'minimap_ch1_atlas.png'),atlas.toBuffer('image/png'));
  console.log('atlas');
})().catch(e=>{console.error(e);process.exit(1)});
