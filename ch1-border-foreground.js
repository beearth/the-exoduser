/* CH1-1 border foreground (깊이 슬라이스 2차, MAP-003+MAP-004 — 2026-10-01).
   구운 64청크는 그대로 두고(뒤 레이어), 같은 좌표·같은 원본·같은 밝기로 경계 나무·군락을
   런타임 스프라이트로 한 번 더 그린다. 굽기에서 tree_fade로 잘린 '걸을 수 있는 영역 쪽
   가지·수관'이 이 덧그림에서 되살아나 엔티티를 덮는 오버행이 된다.
   재굽기·master·geometry·충돌 변경 없음. 시각 전용.
   - 전경(fg): 항상 엔티티 위 — 밑동이 카메라(남)쪽 forest 안이라 플레이어가 항상 북쪽.
   - 분할(split): 1차 슬라이스와 같은 규칙 — 플레이어가 밑동(anchorY)보다 북쪽일 때만 위.
   - 가림: 수관·가지(위쪽 영역)와 겹칠 때만 알파 .62 lerp + 플레이어 고스트(1차 _dsDrawPlayerGhost 재사용,
     프레임당 1회). 밑동·뿌리 쪽(아래)과의 겹침은 가리지 않는다. 적 고스트 없음.
   - GPU 프록시는 CSS filter 무시 → 밝기(.9/.70)·좌우반전은 오프스크린 캔버스에 1회 미리 굽는다.
   굽기 계약(tmp/ch1_rotforest90_bake_patch.py와 동일): 나무 한 변 round(410×scale) bake px,
   기준점 가로 중앙·세로 74%, 밝기 ×.9 / 군락 폭 width bake px, 기준점 세로 72%, 밝기 ×.70, flip.
   bake px = 값×8192/200, 월드 = bake×1000/1024 (→ 밑동 월드 y = ty×40). */
(function(root){
  'use strict';
  const DEFAULT_ON=false; // ← 팀장 판정 후 이 한 줄만 true (2차만 끄기 ?borderFg=0 / 켜기 ?borderFg=1 / 런타임 G._borderFg)
  const SIZE=8192,GRID=200,B2W=1000/1024,MAX_DRAWS=12;
  const MASS_W=2048,MASS_H=1152; // 군락 원본 크기 (로드 시 검증)
  const FADE_MIN=.62,FADE_K=.22; // 1차 슬라이스와 동일 (약 150ms에 90% 수렴)
  const P_HW=40,P_HEAD=96,P_FOOT=28; // 1차와 동일 플레이어 AABB
  // ── placements.json 발췌 (index = 배열 순서, 테스트가 json과 일치를 잠근다) ──
  // 분류: docs/4.1맵디자인+설정/MAP_IMPROVEMENT_PROJECT.md §8.4 기반.
  // 원안 split의 인너 나무 T1 T10 T31 T32 T33 T34 T35는 2026-10-01 착수 확인에서
  // 베이크상 tree_fade로 완전 소거(화면에 없음) + 충돌 콜라이더 없음 → 복원 시 몸통 통과 모순으로 이번 패스 제외.
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
  // ── 인스턴스 사각형 (굽기 스크립트와 동일한 round 지점에서 계산) ──
  function layout(){
    const list=[];
    for(const[idx,tx,ty,variant,scale,mode]of TREES){
      const side=Math.round(410*scale);
      const bx=Math.round(tx*SIZE/GRID-side/2),by=Math.round(ty*SIZE/GRID-side*.74);
      list.push({id:'T'+idx,kind:'tree',variant:variant,mode:mode,
        x:bx*B2W,y:by*B2W,w:side*B2W,h:side*B2W,anchorY:ty*40, // 밑동 월드 y (tx·ty×40 = bake×1000/1024)
        canopyB:by*B2W+side*B2W*.60,a:1});
    }
    for(const[idx,tx,ty,variant,width,flip,mode]of MASSES){
      const h=Math.round(width*MASS_H/MASS_W);
      const bx=Math.round(tx*SIZE/GRID-width/2),by=Math.round(ty*SIZE/GRID-h*.72);
      list.push({id:'M'+idx,kind:'mass',variant:variant,flip:!!flip,mode:mode,
        x:bx*B2W,y:by*B2W,w:width*B2W,h:h*B2W,anchorY:ty*40,
        canopyB:by*B2W+h*B2W*.58,a:1});
    }
    return list;
  }
  const INSTANCES=layout();
  // ── 사전 굽기 텍스처 (variant·flip·밝기 1회) ──
  const texCache=new Map(),imgCache=new Map();
  let texPx=0,builds=0,lastDrawsBack=0,lastDrawsFront=0,ghostFrames=0;
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
  function tex(it){
    const k=key(it);
    let t=texCache.get(k);
    if(t)return t;
    const i=img(it);
    if(!i.complete||!(i.naturalWidth>1))return null;
    if(it.kind==='mass'&&(i.naturalWidth!==MASS_W||i.naturalHeight!==MASS_H))
      root.console?.warn('[CH1 border-fg] mass source size mismatch',i.naturalWidth,i.naturalHeight);
    const c=root.document.createElement('canvas');
    c.width=i.naturalWidth;c.height=i.naturalHeight;
    const x=c.getContext('2d');
    x.filter='brightness('+(it.kind==='tree'?.9:.70)+')'; // 오프스크린 실제 Canvas2D — 굽기 스크립트와 동일 배율
    if(it.flip){x.translate(c.width,0);x.scale(-1,1);}
    x.drawImage(i,0,0);
    c._glVer=1;texCache.set(k,c);texPx+=c.width*c.height;builds++;
    return c;
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
    const p=typeof P!=='undefined'?P:null,cam=g.cam; // P는 게임 전역 (전역 렉시컬 — root 프로퍼티 아님)
    if(!p||!cam)return 0;
    const zoom=Math.max(.3,g._edZoom||g._camZoom||1);
    const left=cam.x-VW/(2*zoom)-8,right=cam.x+VW/(2*zoom)+8,top=cam.y-VH/(2*zoom)-8,bottom=cam.y+VH/(2*zoom)+8;
    const prev=ctx.globalAlpha;
    for(let i=0;i<INSTANCES.length;i++){
      const it=INSTANCES[i];
      const isFront=it.mode==='fg'||p.y<it.anchorY;
      if(isFront!==front)continue;
      if(it.x>right||it.x+it.w<left||it.y>bottom||it.y+it.h<top)continue;
      const t=tex(it);
      if(!t)continue;
      if(front){
        const target=overlapsCanopy(it,p)?FADE_MIN:1;
        if(target<1)hit=1;
        let a=it.a;a+=(target-a)*FADE_K;if(Math.abs(target-a)<.01)a=target;it.a=a;
        ctx.globalAlpha=a;
      }else{it.a=1;ctx.globalAlpha=1;}
      ctx.drawImage(t,it.x,it.y,it.w,it.h);
      if(++draws>=MAX_DRAWS)break;
    }
    ctx.globalAlpha=prev;
    if(front&&hit&&typeof _dsDrawPlayerGhost==='function'){_dsDrawPlayerGhost();ghostFrames++;}
    return draws;
  }
  // 백 패스: 분할 군락이 '플레이어가 밑동보다 남쪽'일 때 — 청크 바로 위(엔티티 아래)에서 잘린 수관만 복원
  function drawBack(ctx,g,now,VW,VH){lastDrawsBack=pass(ctx,g,now,VW,VH,false);return lastDrawsBack;}
  // 프런트 패스: 전경 전체 + '플레이어가 밑동보다 북쪽'인 분할 군락 — 엔티티 위
  function drawFront(ctx,g,now,VW,VH){lastDrawsFront=pass(ctx,g,now,VW,VH,true);return lastDrawsFront;}
  function qa(){
    return{instances:INSTANCES.length,builds:builds,texBytes:texPx*4,lastDrawsBack:lastDrawsBack,
      lastDrawsFront:lastDrawsFront,ghostFrames:ghostFrames,flag:urlFlag,defaultOn:DEFAULT_ON};
  }
  root.Ch1BorderForeground=Object.freeze({drawBack:drawBack,drawFront:drawFront,qa:qa,
    _layout:function(){return INSTANCES},_trees:TREES,_masses:MASSES,_enabled:enabled,_overlapsCanopy:overlapsCanopy});
})(globalThis);
