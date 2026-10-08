/* CH1-1 border foreground (깊이 슬라이스 2차, MAP-003+MAP-004 — 2026-10-01, 팀장 RETOUCH 반영 v2).
   구운 64청크는 그대로 두고(뒤 레이어), 같은 좌표·같은 원본·같은 밝기로 경계 나무·군락을
   런타임 스프라이트로 한 번 더 그린다. 굽기에서 tree_fade가 경계에서 바로 잘라낸 수관을,
   **경계 polygon에서 안쪽 BAND px까지만 드리우는 '가장자리 띠'**로 복원한다(지붕 금지 — G2).
   재굽기·master·geometry·충돌 변경 없음. 시각 전용.
   - 띠 마스크: polygon 밖 = 알파 1, 안쪽은 경계 거리 d의 smoothstep으로 감쇠해 BAND에서 0.
     인스턴스별 1회 사전 굽기 + 알파 bbox 크롭(텍스처 절약). 경계 polygon 53점은 layout.js와
     동일 값을 내장(테스트로 일치 잠금).
   - 전경(fg): 항상 엔티티 위 / 분할(split): 플레이어가 밑동(anchorY=ty×40)보다 북쪽일 때만 위.
   - 가림: 수관 영역과 겹치면 알파 .5 lerp + 플레이어 고스트 α.75(1차 _dsDrawPlayerGhost 재사용,
     프레임당 1회 — 1차 자체 나무 값 .62/.55는 불변). 밑동·뿌리 쪽 겹침은 가리지 않음. 적 고스트 없음.
   - GPU 프록시는 CSS filter 무시 → 밝기(.9/.70)·좌우반전·띠 마스크 전부 오프스크린 사전 굽기.
   굽기 계약(tmp/ch1_rotforest90_bake_patch.py): 나무 한 변 round(410×scale) bake px·기준점 가로
   중앙/세로 74%·×.9 / 군락 폭 width bake px·세로 72%·×.70·flip / bake px=값×8192/200, 월드=bake×1000/1024. */
(function(root){
  'use strict';
  const DEFAULT_ON=true; // 2026-10-01 맵 팀장 판정 PASS(v2 띠 170px) → 기본 ON (2차만 끄기 ?borderFg=0 / 켜기 ?borderFg=1 / 런타임 G._borderFg)
  const SIZE=8192,GRID=200,B2W=1000/1024,MAX_DRAWS=12;
  const BAND=170;          // 경계 안쪽으로 드리우는 띠 깊이(월드 px, smoothstep 0 지점) — 팀장 지시 140~200 범위에서 확정
  const MASS_W=2048,MASS_H=1152;
  const FADE_MIN=.5,FADE_K=.22;   // 가림 시 띠 알파 .5 (2차 전용 — 1차 나무는 .62 유지)
  const GHOST_A=.75;              // 2차 전경 아래 플레이어 고스트 알파 (1차 .55 유지)
  const P_HW=40,P_HEAD=96,P_FOOT=28;
  // ── 경계 polygon 53점 (layout.js boundary와 동일 — 타일 단위, 테스트 잠금) ──
  const BOUNDARY=[[88,2],[88,18],[74,29],[58,34],[37,33],[29,44],[31,59],[40,66],[52,70],[53,77],[40,80],[26,91],[28,107],[40,114],[53,118],[62,126],[58,137],[40,140],[28,147],[30,157],[43,163],[58,167],[72,174],[81,183],[85,192],[96,197],[109,197],[120,190],[125,181],[137,168],[151,161],[169,156],[179,143],[178,134],[161,128],[143,127],[134,121],[139,113],[160,110],[175,105],[180,93],[172,84],[151,79],[145,72],[154,63],[174,59],[181,48],[177,35],[162,30],[142,33],[126,28],[113,18],[112,2]];
  const BPTS=BOUNDARY.map(function(p){return[p[0]*40,p[1]*40]}); // 월드 px
  function pip(x,y){ // polygon 안(=걸을 수 있는 영역 쪽)인가
    let inside=false;
    for(let i=0,j=BPTS.length-1;i<BPTS.length;j=i++){
      const a=BPTS[i],b=BPTS[j];
      if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
    }
    return inside;
  }
  function distB(x,y){ // 경계까지 최단 거리(월드 px)
    let m=Infinity;
    for(let i=0,j=BPTS.length-1;i<BPTS.length;j=i++){
      const ax=BPTS[i][0],ay=BPTS[i][1],bx=BPTS[j][0],by=BPTS[j][1];
      const dx=bx-ax,dy=by-ay,L=dx*dx+dy*dy;
      let t=L?((x-ax)*dx+(y-ay)*dy)/L:0;t=t<0?0:t>1?1:t;
      const ex=ax+dx*t-x,ey=ay+dy*t-y,dd=ex*ex+ey*ey;
      if(dd<m)m=dd;
    }
    return Math.sqrt(m);
  }
  function bandAlpha(wx,wy){ // polygon 밖=1, 안쪽은 BAND까지 smoothstep 감쇠
    if(!pip(wx,wy))return 1;
    const t=Math.min(1,distB(wx,wy)/BAND);
    return 1-t*t*(3-2*t);
  }
  // ── placements.json 발췌 (index=배열 순서, 테스트가 json과 일치를 잠근다) ──
  // 분류: MAP_IMPROVEMENT_PROJECT §8.4 + 착수 확인 수정 — 인너 나무 T1 T10 T31~T35는
  // 베이크 완전 소거+무충돌로 보류(MAP-003b). 띠 규칙은 대·소 인스턴스에 동일 적용(균일 규칙이 이음매·일관성에 유리).
  // 98차(2026-10-08): 변형 1..12·좌우반전 추가 — 나무 본체는 ch1-rot-trees.js가 그리고(흔들림·깜빡임),
  // 여기서는 같은 흔들림의 띠 사본을 Ch1RotTrees.drawTreeBand로 위에 얹는다(모듈 없으면 자체 정지 텍스처 폴백).
  const TREES=[ // [idx, tx, ty, variant, scale, mode, flip]
    [3,179,101,1,3.4,'fg',1],
    [4,158,159,11,3.0,'fg',0],
    [5,122,187,6,3.2,'fg',1],
    [13,29,121,8,1.15,'fg',1],
    [16,46,172,11,1.1,'fg',1],
    [18,79,192,5,1.3,'fg',0],
    [19,122,196,8,1.15,'fg',0],
    [20,138,177,4,1.3,'fg',1],
    [24,176,115,10,1.3,'fg',0],
  ];
  const MASSES=[ // [idx, tx, ty, variant, width, flip, mode]
    [1,31,125,2,2150,0,'split'],
    [2,178,82,2,2050,1,'split'],
    [3,162,124,1,2150,1,'split'],
    [5,175,172,2,2200,1,'fg'],
  ];
  function layout(){
    const list=[];
    for(const[idx,tx,ty,variant,scale,mode,flip]of TREES){
      const side=Math.round(410*scale);
      const bx=Math.round(tx*SIZE/GRID-side/2),by=Math.round(ty*SIZE/GRID-side*.74);
      list.push({id:'T'+idx,idx:idx,kind:'tree',variant:variant,flip:!!flip,mode:mode,bakeW:side,bakeH:side,
        x:bx*B2W,y:by*B2W,w:side*B2W,h:side*B2W,anchorY:ty*40,
        canopyB:by*B2W+side*B2W*.60,a:1,tex:null,cx:0,cy:0,cw:0,ch:0});
    }
    for(const[idx,tx,ty,variant,width,flip,mode]of MASSES){
      const h=Math.round(width*MASS_H/MASS_W);
      const bx=Math.round(tx*SIZE/GRID-width/2),by=Math.round(ty*SIZE/GRID-h*.72);
      list.push({id:'M'+idx,kind:'mass',variant:variant,flip:!!flip,mode:mode,bakeW:width,bakeH:h,
        x:bx*B2W,y:by*B2W,w:width*B2W,h:h*B2W,anchorY:ty*40,
        canopyB:by*B2W+h*B2W*.58,a:1,tex:null,cx:0,cy:0,cw:0,ch:0});
    }
    return list;
  }
  const INSTANCES=layout();
  // ── 텍스처: 인스턴스별 1회 사전 굽기(밝기·반전·띠 마스크·bbox 크롭) — 3ms 유휴 슬라이스 분할
  //    (86차 유휴 캐시 계약·ch1-forest-sway와 동일 패턴: 준비 전에는 안 그림 → 첫 프레임 히치 없음) ──
  const imgCache=new Map();
  let instPx=0,builds=0,sliceMsMax=0,lastDrawsBack=0,lastDrawsFront=0,ghostFrames=0;
  const queue=[];let scheduled=false,bandHooked=false;
  function cv(w,h){const c=root.document.createElement('canvas');c.width=w;c.height=h;return c;}
  function src(it){
    return it.kind==='tree'
      ?'assets/map/ch1/collision/rotforest_tree_'+(it.variant<10?'0':'')+it.variant+'.png?v=20261008-rotforest-98'
      :'assets/map/ch1/production_finish/outer90_sources/rotforest_mass_0'+it.variant+'.png';
  }
  function img(it){
    const s=src(it);
    let i=imgCache.get(s);
    if(!i){i=new Image();i.decoding='async';i.src=s;imgCache.set(s,i);}
    return i;
  }
  function*buildJob(it){
    const i=img(it),bw=it.bakeW,bh=it.bakeH;
    if(it.kind==='mass'&&(i.naturalWidth!==MASS_W||i.naturalHeight!==MASS_H))
      root.console?.warn('[CH1 border-fg] mass source size mismatch',i.naturalWidth,i.naturalHeight);
    const full=cv(bw,bh),fc=full.getContext('2d');
    fc.imageSmoothingEnabled=true;
    if(it.flip){fc.save();fc.translate(bw,0);fc.scale(-1,1);fc.drawImage(i,0,0,bw,bh);fc.restore();}
    else fc.drawImage(i,0,0,bw,bh);
    yield;
    // 저해상(8px 격자) 띠 마스크 — BAND 감쇠는 저주파라 bilinear 보간으로 충분
    const MS=8,mw2=Math.ceil(bw/MS)+1,mh2=Math.ceil(bh/MS)+1;
    const band=new Float32Array(mw2*mh2);
    for(let my=0;my<mh2;my++){
      const wy=it.y+my*MS*B2W;
      for(let mi=0;mi<mw2;mi++)band[my*mw2+mi]=bandAlpha(it.x+mi*MS*B2W,wy);
      if((my&7)===7)yield;
    }
    const image=fc.getImageData(0,0,bw,bh);yield;
    // 픽셀 루프(행 단위 yield): 밝기 ×.9/.70(굽기 스크립트와 동일 선형 배율) + 띠 알파 + bbox
    const d=image.data,bMul=it.kind==='tree'?.9:.70;
    let l=bw,t2=bh,r=-1,btm=-1;
    for(let y=0;y<bh;y++){
      const fy=y/MS,y0=Math.min(mh2-1,~~fy),y1=Math.min(mh2-1,y0+1),ty=fy-y0;
      for(let x=0;x<bw;x++){
        const k=(y*bw+x)*4,a0=d[k+3];
        if(!a0)continue;
        const fx=x/MS,x0=Math.min(mw2-1,~~fx),x1=Math.min(mw2-1,x0+1),tx=fx-x0;
        const m=(band[y0*mw2+x0]*(1-tx)+band[y0*mw2+x1]*tx)*(1-ty)+(band[y1*mw2+x0]*(1-tx)+band[y1*mw2+x1]*tx)*ty;
        const a=a0*m;
        if(a<6){d[k+3]=0;continue;}
        d[k]=d[k]*bMul;d[k+1]=d[k+1]*bMul;d[k+2]=d[k+2]*bMul;d[k+3]=a;
        if(x<l)l=x;if(x>r)r=x;if(y<t2)t2=y;if(y>btm)btm=y;
      }
      if((y&31)===31)yield;
    }
    if(r<l){it.tex=false;it.job=null;return;}
    fc.putImageData(image,0,0);yield;
    l=Math.max(0,l-3);t2=Math.max(0,t2-3);r=Math.min(bw-1,r+4);btm=Math.min(bh-1,btm+4);
    const cw=r-l+1,ch=btm-t2+1,out=cv(cw,ch);
    out.getContext('2d').drawImage(full,l,t2,cw,ch,0,0,cw,ch);
    out._glVer=1;
    it.tex=out;it.cx=l;it.cy=t2;it.cw=cw;it.ch=ch;it.job=null;
    instPx+=cw*ch;builds++;
  }
  function schedule(){
    if(scheduled||!queue.length)return;
    scheduled=true;
    if(typeof root.requestIdleCallback==='function')root.requestIdleCallback(pump,{timeout:200});
    else root.setTimeout(function(){pump(null)},8);
  }
  function pump(deadline){
    scheduled=false;
    const start=root.performance.now();
    do{
      const it=queue[0];if(!it)break;
      try{
        const s0=root.performance.now();
        const step=it.job.next();
        const ms=root.performance.now()-s0;if(ms>sliceMsMax)sliceMsMax=ms;
        if(step.done)queue.shift();
      }catch(err){it.tex=false;it.job=null;queue.shift();root.console?.warn('[CH1 border-fg] build fail',it.id,err);}
    }while(queue.length&&root.performance.now()-start<3&&(!deadline||deadline.timeRemaining()>1));
    if(queue.length)schedule();
  }
  function instTex(it){
    if(it.tex===false)return null; // 빌드 실패/전부 투명 — 재시도 없음
    if(it.tex)return it.tex;
    if(!it.job){
      const i=img(it);
      if(!i.complete||!(i.naturalWidth>1))return null;
      it.job=buildJob(it);queue.push(it);schedule();
    }
    return null; // 준비 전에는 안 그림 (구운 배경이 그대로 보임 — 폴백 자연)
  }
  // ── 게이트: ?depthSlice=0 이면 1·2차 모두 꺼짐, ?borderFg=0/1 은 2차만 ──
  let urlFlag=null;
  function flag(g){
    if(urlFlag===null){
      const s=(root.location&&root.location.search)||'';
      urlFlag=/[?&]borderFg=0/.test(s)?false:(/[?&]borderFg=1/.test(s)?true:DEFAULT_ON);
    }
    return g&&g._borderFg!==undefined?!!g._borderFg:urlFlag;
  }
  function enabled(g){
    if(!g||g.stage!==0||g._bossArena||!flag(g))return false;
    try{if(typeof _dsEnabled==='function'&&!_dsEnabled())return false}catch(e){return false}
    return true;
  }
  function overlapsCanopy(it,p){
    return p.x+P_HW>it.x&&p.x-P_HW<it.x+it.w&&p.y+P_FOOT>it.y&&p.y-P_HEAD<it.canopyB;
  }
  // 적이 띠(수관 영역) 아래에 서 있으면 그 항목도 .5 — 띠 아래 몹 가독 확보 (팀장 지시 5항, 촬영 판정 결과 추가)
  function enemyUnderCanopy(it){
    const list=typeof ens!=='undefined'?ens:null;
    if(!list)return false;
    for(let i=0;i<list.length;i++){
      const e=list[i];
      if(!e||!e.alive)continue;
      const r=e.r||14;
      if(e.x+r>it.x&&e.x-r<it.x+it.w&&e.y+r*.4>it.y&&e.y-r*2<it.canopyB)return true;
    }
    return false;
  }
  function pass(ctx,g,now,VW,VH,front){
    let draws=0,hit=0;
    if(!enabled(g))return 0;
    const p=typeof P!=='undefined'?P:null,cam=g.cam;
    if(!p||!cam)return 0;
    const zoom=Math.max(.3,g._edZoom||g._camZoom||1);
    const left=cam.x-VW/(2*zoom)-8,right=cam.x+VW/(2*zoom)+8,top=cam.y-VH/(2*zoom)-8,bottom=cam.y+VH/(2*zoom)+8;
    const prev=ctx.globalAlpha;
    for(let i=0;i<INSTANCES.length;i++){
      const it=INSTANCES[i];
      const isFront=it.mode==='fg'||p.y<it.anchorY;
      if(isFront!==front)continue;
      if(it.x>right||it.x+it.w<left||it.y>bottom||it.y+it.h<top)continue;
      const rot=it.kind==='tree'&&root.Ch1RotTrees?root.Ch1RotTrees:null;
      if(rot&&!bandHooked){rot.setBandFn(bandAlpha);bandHooked=true;}
      const t=rot?null:instTex(it);
      if(!rot&&!t)continue;
      if(front){
        const pHit=overlapsCanopy(it,p);
        const target=(pHit||enemyUnderCanopy(it))?FADE_MIN:1;
        if(pHit)hit=1; // 고스트는 플레이어 가림에만
        let a=it.a;a+=(target-a)*FADE_K;if(Math.abs(target-a)<.01)a=target;it.a=a;
        ctx.globalAlpha=a;
      }else{it.a=1;ctx.globalAlpha=1;}
      if(rot){if(!rot.drawTreeBand(ctx,it.idx,now,ctx.globalAlpha))continue;}
      else ctx.drawImage(t,it.x+it.cx*B2W,it.y+it.cy*B2W,it.cw*B2W,it.ch*B2W);
      if(++draws>=MAX_DRAWS)break;
    }
    ctx.globalAlpha=prev;
    if(front&&hit&&typeof _dsDrawPlayerGhost==='function'){_dsDrawPlayerGhost(GHOST_A);ghostFrames++;}
    return draws;
  }
  function drawBack(ctx,g,now,VW,VH){lastDrawsBack=pass(ctx,g,now,VW,VH,false);return lastDrawsBack;}
  function drawFront(ctx,g,now,VW,VH){lastDrawsFront=pass(ctx,g,now,VW,VH,true);return lastDrawsFront;}
  function qa(){
    return{instances:INSTANCES.length,builds:builds,pending:queue.length,texBytes:instPx*4,
      sliceMsMax:Math.round(sliceMsMax*10)/10,band:BAND,
      lastDrawsBack:lastDrawsBack,lastDrawsFront:lastDrawsFront,ghostFrames:ghostFrames,flag:urlFlag,defaultOn:DEFAULT_ON};
  }
  root.Ch1BorderForeground=Object.freeze({drawBack:drawBack,drawFront:drawFront,qa:qa,
    _layout:function(){return INSTANCES},_trees:TREES,_masses:MASSES,_boundary:BOUNDARY,
    _enabled:enabled,_overlapsCanopy:overlapsCanopy,_enemyUnderCanopy:enemyUnderCanopy,
    _bandAlpha:bandAlpha,_pip:pip,_distB:distB,_band:BAND});
})(globalThis);
