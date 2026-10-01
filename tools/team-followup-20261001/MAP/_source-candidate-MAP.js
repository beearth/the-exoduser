/* MAP-020 M5 주머니 보행 fixture — 접근→진입→이탈, 읽기전용 관측.
   전제: stage0(CH1-1), 기본 B, 게임 포커스·일시정지 아님. 약 9.7초 실시간 소요.
   충돌/맵(G.map·collision) 쓰기 0. 정지캡처/경계앵커 덤프 없음. */
(function(){'use strict';
  if(typeof G==='undefined'||typeof P==='undefined'||typeof T==='undefined'){console.error('M5FIX: G/P/T 심볼 없음 — 실게임 전제 미충족');return;}
  if(G.stage!==0)console.warn('M5FIX: stage0 아님 →',G.stage);

  // 읽기전용 타일 분류기(documentTile 규약: 1=벽) + 게임 isW 있으면 참고 병기
  const tile=(wx,wy)=>[Math.floor(wx/T),Math.floor(wy/T)];
  const wallTile=(wx,wy)=>{const[tx,ty]=tile(wx,wy),r=G.map&&G.map[ty];return !(r&&r[tx]===0);};
  const gIsW=(typeof isW==='function')?((wx,wy)=>{try{return !!isW(wx,wy);}catch(e){return null;}}):(()=>null);

  // 좌표 계약 감사(읽기): 문서7000,6900 vs 베이크환산 vs 접근점
  const b2w=b=>b*1000/1024;
  const coordAudit={
    document:{world:[7000,6900],tile:tile(7000,6900),wallTile:wallTile(7000,6900),gameIsW:gIsW(7000,6900)},
    bakeConv:{world:[b2w(7000),b2w(6900)],tile:tile(b2w(7000),b2w(6900)),wallTile:wallTile(b2w(7000),b2w(6900)),gameIsW:gIsW(b2w(7000),b2w(6900))},
    approach:{world:[6660,6140],tile:tile(6660,6140),wallTile:wallTile(6660,6140),gameIsW:gIsW(6660,6140)}
  };

  // 원본맵 보존 시그니처(읽기): 포켓 주변 타일창 체크섬 전후 비교
  const win={x0:150,y0:150,x1:178,y1:178};
  const sig=()=>{let h=2166136261>>>0;for(let ty=win.y0;ty<=win.y1;ty++){const r=G.map[ty]||[];for(let tx=win.x0;tx<=win.x1;tx++){h=Math.imul(h^((r[tx]|0)+1),16777619)>>>0;}}return h>>>0;};
  const mapRef=G.map, sigBefore=sig();

  // 입력(게임 K[]+KeyboardEvent 경로) — 게임플레이/바인드 변경 없음
  const Kg=(typeof K!=='undefined')?K:null;
  const hold=(c,on)=>{if(Kg)Kg[c]=on;document.dispatchEvent(new KeyboardEvent(on?'keydown':'keyup',{code:c,key:c,bubbles:true}));};
  const relAll=()=>['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].forEach(c=>hold(c,false));

  // 샘플러: 50ms, 중단조건=키유지 중 Δ<0.5px가 5표본(≈250ms) 연속=막힘
  const EPS=0.5,FLAT=5;
  const leg=(name,code,maxMs,dir)=>new Promise(res=>{
    const pr={N:[0,-20],S:[0,20],E:[20,0],W:[-20,0]}[dir]||[0,0];
    const t0=performance.now(),S=[];let flat=0,last=null,blockedAt=null;
    hold(code,true);
    const id=setInterval(()=>{
      const t=performance.now()-t0;
      S.push({t:Math.round(t),x:P.x,y:P.y,camx:G.cam.x,camy:G.cam.y,held:Kg?!!Kg[code]:null,
        hp:P.hp,pState:(P._anim||P.state||null),paused:!!G.paused,
        wallAhead:wallTile(P.x+pr[0],P.y+pr[1]),gameWallAhead:gIsW(P.x+pr[0],P.y+pr[1]),mapSame:(G.map===mapRef)});
      if(last&&Math.hypot(P.x-last.x,P.y-last.y)<EPS){if(++flat>=FLAT&&!blockedAt)blockedAt={x:P.x,y:P.y,t:Math.round(t)};}else flat=0;
      last={x:P.x,y:P.y};
      if(t>=maxMs){clearInterval(id);hold(code,false);res({name,code,dir,maxMs,blockedAt,endPos:{x:P.x,y:P.y},samples:S});}
    },50);
  });

  (async()=>{
    relAll();
    const setupFrom={x:P.x,y:P.y};
    // SETUP(검수 PASS 아님): 검증된 비벽 접근점으로 1회 배치. 충돌/맵 미변경.
    if(!coordAudit.approach.wallTile){P.x=6660;P.y=6140;}
    const legs=[];
    legs.push(await leg('A_enter_south','KeyS',2500,'S'));  // 진입: 포켓 남진 → 막힌 남측 정지 기대 ~y6304
    legs.push(await leg('B_inside_north','KeyW',1500,'N')); // 내부 북상(입구) ~y6137
    legs.push(await leg('C_entry_east','KeyD',800,'E'));    // 입구 동측 개구 ~x6746
    legs.push(await leg('D_block_south2','KeyS',2500,'S')); // 동측 남진 → 곡선 남측벽 정지 기대 ~y6223
    legs.push(await leg('E_exit_north','KeyW',1200,'N'));   // 이탈(북)
    legs.push(await leg('E2_exit_west','KeyA',1200,'W'));   // 이탈(서) 개활지 복귀
    relAll();
    const out={fixture:'MAP020-M5-walk',stage:G.stage,T,viewWorld:[typeof VW!=='undefined'?VW:null,typeof VH!=='undefined'?VH:null],
      coordAudit,setupFrom,mapUnchanged:(G.map===mapRef&&sig()===sigBefore),mapSig:{before:sigBefore,after:sig()},legs};
    console.log('M5FIX_RESULT_JSON\n'+JSON.stringify(out));
    window._m5fix=out; // 총괄이 콘솔 JSON을 출력폴더에 저장(파일 쓰기는 fixture가 하지 않음)
  })();
})();
