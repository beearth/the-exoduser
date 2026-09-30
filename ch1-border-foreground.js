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
  const DEFAULT_ON=false; // ← 팀장 판정 후 이 한 줄만 true (2차만 끄기 ?borderFg=0 / 켜기 ?borderFg=1 / 런타임 G._borderFg)
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
  const TREES=[ // [idx, tx, ty, variant, scale, mode]
    [3,179,101,4,3.4,'fg'],
    [4,158,159,2,3.0,'fg'],
    [5,122,187,3,3.2,'fg'],
    [13,29,121,2,1.15,'fg'],
    [16,46,172,2,1.1,'fg'],
    [18,79,192,1,1.3,'fg'],
    [19,122,196,2,1.15,'fg'],
    [20,138,177,3,1.3,'fg'],
    [24,176,115,1,1.3,'fg'],
  ];
  const MASSES=[ // [idx, tx, ty, variant, width, flip, mode]
    [1,31,125,2,2150,0,'split'],
    [2,178,82,2,2050,1,'split'],
    [3,162,124,1,2150,1,'split'],
    [5,175,172,2,2200,1,'fg'],
  ];
  function layout(){
    const list=[];
    for(const[idx,tx,ty,variant,scale,mode]of TREES){
      const side=Math.round(410*scale);
      const bx=Math.round(tx*SIZE/GRID-side/2),by=Math.round(ty*SIZE/GRID-side*.74);
      list.push({id:'T'+idx,kind:'tree',variant:variant,mode:mode,bakeW:side,bakeH:side,
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
  // ── 텍스처: (1) variant·flip 중간 소스(밝기·반전) → (2) 인스턴스별 띠 마스크+bbox 크롭 ──
  const baseCache=new Map(),imgCache=new Map();
  let instPx=0,basePx=0,builds=0,buildMsMax=0,lastDrawsBack=0,lastDrawsFront=0,ghostFrames=0;
  function cv(w,h){const c=root.document.createElement('canvas');c.width=w;c.height=h;return c;}
  function src(it){
    return it.kind==='tree'
      ?'assets/map/ch1/collision/rotforest_tree_0'+it.variant+'.png'
      :'assets/map/ch1/production_finish/outer90_sources/rotforest_mass_0'+it.variant+'.png';
  }
  function key(it){return it.kind+it.variant+(it.flip?'f':'')}
  function img(it){
    const s=src(it);
    let i=imgCache.get(s);
    if(!i){i=new Image();i.decoding='async';i.src=s;imgCache.set(s,i);}
    return i;
  }
  function baseTex(it){
    const k=key(it);
    let t=baseCache.get(k);
    if(t)return t;
    const i=img(it);
    if(!i.complete||!(i.naturalWidth>1))return null;
    if(it.kind==='mass'&&(i.naturalWidth!==MASS_W||i.naturalHeight!==MASS_H))
      root.console?.warn('[CH1 border-fg] mass source size mismatch',i.naturalWidth,i.naturalHeight);
    const c=cv(i.naturalWidth,i.naturalHeight),x=c.getContext('2d');
    x.filter='brightness('+(it.kind==='tree'?.9:.70)+')'; // 오프스크린 실제 Canvas2D
    if(it.flip){x.translate(c.width,0);x.scale(-1,1);}
    x.drawImage(i,0,0);
    baseCache.set(k,c);basePx+=c.width*c.height;
    return c;
  }
  function freeBaseIfDone(k){
    for(const it of INSTANCES)if(key(it)===k&&!it.tex)return;
    const c=baseCache.get(k);
    if(c){basePx-=c.width*c.height;baseCache.delete(k);}
  }
  function instTex(it){
    if(it.tex)return it.tex===false?null:it.tex;
    const base=baseTex(it);
    if(!base)return null;
    const t0=root.performance.now();
    const bw=it.bakeW,bh=it.bakeH;
    const full=cv(bw,bh),fc=full.getContext('2d');
    fc.imageSmoothingEnabled=true;fc.drawImage(base,0,0,bw,bh);
    // 띠 마스크 — 1/4 해상도로 계산 후 확대 적용 (BAND 감쇠는 저주파라 충분)
    const MS=4,mw=Math.ceil(bw/MS),mh=Math.ceil(bh/MS);
    const mc=cv(mw,mh),mx=mc.getContext('2d');
    const id=mx.createImageData(mw,mh),d=id.data;
    for(let my=0;my<mh;my++){
      const wy=it.y+(my+.5)*MS*B2W;
      for(let mi=0;mi<mw;mi++){
        const wx=it.x+(mi+.5)*MS*B2W;
        const k4=(my*mw+mi)*4;
        d[k4]=d[k4+1]=d[k4+2]=255;d[k4+3]=Math.round(bandAlpha(wx,wy)*255);
      }
    }
    mx.putImageData(id,0,0);
    fc.globalCompositeOperation='destination-in';
    fc.imageSmoothingEnabled=true;
    fc.drawImage(mc,0,0,bw,bh);
    fc.globalCompositeOperation='source-over';
    // 알파 bbox 크롭 (2px 걸음 스캔 + 3px 여유)
    const px=fc.getImageData(0,0,bw,bh).data;
    let l=bw,t2=bh,r=-1,b=-1;
    for(let y=0;y<bh;y+=2)for(let x=0;x<bw;x+=2){
      if(px[(y*bw+x)*4+3]>5){if(x<l)l=x;if(x>r)r=x;if(y<t2)t2=y;if(y>b)b=y;}
    }
    if(r<l||b<t2){it.tex=false;freeBaseIfDone(key(it));return null;}
    l=Math.max(0,l-3);t2=Math.max(0,t2-3);r=Math.min(bw-1,r+4);b=Math.min(bh-1,b+4);
    const cw=r-l+1,ch=b-t2+1;
    const out=cv(cw,ch);
    out.getContext('2d').drawImage(full,l,t2,cw,ch,0,0,cw,ch);
    out._glVer=1;
    it.tex=out;it.cx=l;it.cy=t2;it.cw=cw;it.ch=ch;
    instPx+=cw*ch;builds++;
    const ms=root.performance.now()-t0;if(ms>buildMsMax)buildMsMax=ms;
    freeBaseIfDone(key(it));
    return out;
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
      const t=instTex(it);
      if(!t)continue;
      if(front){
        const target=overlapsCanopy(it,p)?FADE_MIN:1;
        if(target<1)hit=1;
        let a=it.a;a+=(target-a)*FADE_K;if(Math.abs(target-a)<.01)a=target;it.a=a;
        ctx.globalAlpha=a;
      }else{it.a=1;ctx.globalAlpha=1;}
      ctx.drawImage(t,it.x+it.cx*B2W,it.y+it.cy*B2W,it.cw*B2W,it.ch*B2W);
      if(++draws>=MAX_DRAWS)break;
    }
    ctx.globalAlpha=prev;
    if(front&&hit&&typeof _dsDrawPlayerGhost==='function'){_dsDrawPlayerGhost(GHOST_A);ghostFrames++;}
    return draws;
  }
  function drawBack(ctx,g,now,VW,VH){lastDrawsBack=pass(ctx,g,now,VW,VH,false);return lastDrawsBack;}
  function drawFront(ctx,g,now,VW,VH){lastDrawsFront=pass(ctx,g,now,VW,VH,true);return lastDrawsFront;}
  function qa(){
    return{instances:INSTANCES.length,builds:builds,texBytes:(instPx+basePx)*4,instBytes:instPx*4,
      baseBytes:basePx*4,buildMsMax:Math.round(buildMsMax*10)/10,band:BAND,
      lastDrawsBack:lastDrawsBack,lastDrawsFront:lastDrawsFront,ghostFrames:ghostFrames,flag:urlFlag,defaultOn:DEFAULT_ON};
  }
  root.Ch1BorderForeground=Object.freeze({drawBack:drawBack,drawFront:drawFront,qa:qa,
    _layout:function(){return INSTANCES},_trees:TREES,_masses:MASSES,_boundary:BOUNDARY,
    _enabled:enabled,_overlapsCanopy:overlapsCanopy,_bandAlpha:bandAlpha,_pip:pip,_distB:distB,_band:BAND});
})(globalThis);
