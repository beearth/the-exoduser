# ANIMVFX — UI03 병행 후속 원문

> 읽기 전용 분석/후보 코드. 총괄의 별도 적용·검사 전에는 실행/채택 완료가 아니다. 후속 정정이 앞선 문구보다 우선한다.

## 2026-10-01T06:07:27.903Z

독립 하니스 후보를 실제 함수명으로 정확히 작성하기 위해, 아직 미확인한 이름(메인 루프·fps캡·`_acc`·`ens`)을 확인하겠습니다.

## 2026-10-01T06:10:17.814Z

확인 완료했습니다. 실제 현재 함수·변수명(`loop(timestamp)` 59462, 고정스텝 `while(_acc>=PHYS_STEP){…_gameTime+=PHYS_STEP;update()}` 59539, `PHYS_STEP=1000/60` 58309, `OPT.fpsCap`/`_fpsCapInterval` 59468, `update()` 30583, `_prepEnemyInstanced` GL 플래시 루프 5192–5213, `draw()` 2D 사망소거 50624·2D 블록 51587, 전역 `ens` 15783, `hurtE`의 `_hitFlash=6/4` 40717/40699, 부활 `_reviveTimer`/`alive=true` 32930–32978·`_reviveDruidFinale` 16115·`_spawnGhoul` 32975, GL 가동지표 `_dbgEnsGL`/`_ens8GLTotal`/`_ensWarmDone`/`_bootLoadActive`)을 근거로 **관측 전용 하니스 후보**를 작성합니다.

핵심 설계 결정:
- **게임 코드 미변경**: `update`/`loop`를 래핑하지 않습니다(이들은 어휘적 전역 바인딩이라 `window.update` 재할당으로 내부 호출을 가로채지 못함 — §9 `owner[key]` 함정). 대신 **독립 rAF**로 page 프레임을, **`_gameTime` 증분(÷PHYS_STEP)**으로 고정 update tick을 각각 센다 → 두 레이트 분리 관측.
- **게임 객체 비오염**: 적 객체에 추적 속성을 쓰지 않고 `WeakMap`에 이전 상태 보관.
- **cap 미설정**: `OPT.fpsCap`을 **읽기만** 한다(60제한은 운영자가 인게임 옵션 `optFps`로 설정, 고주사율은 cap=0+고주사율 디스플레이). 하니스는 cap을 바꾸지 않음.
- **정규 GL 유효성 게이트**: `visible && !_bootLoadActive && _ensWarmDone && (_ens8GLTotal>0||_dbgEns8GL>0)`일 때만 `glValid=true`(강제부팅 거짓검증 차단, §9).

```js
/* =====================================================================
 * hfObs — 피격 플래시 관측 전용 하니스 후보 (ANIMVFX 20261001-UI03)
 * 대상: /game.html (정규 GL60/고주사율/부활 첫 프레임)
 * 사용: 정규 풀부팅된 game.html의 "페이지 콘솔"에 붙여넣기(전역 어휘 바인딩 공유).
 * 성격: READ-ONLY 관측. 게임 값/동작 변경·게임 구동·파일 변경 없음.
 * ===================================================================== */
(function(){
  if (window.__hfObs && window.__hfObs._running){
    console.warn('[hfObs] 이미 실행 중 — __hfObs.stop() 먼저'); return window.__hfObs;
  }
  // --- 전역은 let/const 어휘 바인딩이라 window에 없음 → typeof 가드로 안전 읽기 ---
  const safe=(fn,d)=>{try{const v=fn();return v===undefined?d:v}catch(_){return d}};
  const PS   = safe(()=>PHYS_STEP, 1000/60);          // 고정 update 스텝(=1000/60)
  const gEns = ()=>safe(()=>ens, null);               // 전역 적 배열(15783)
  const gGT  = ()=>safe(()=>_gameTime, 0);            // 고정 update 누적시간(59540)
  const gCap = ()=>safe(()=>(OPT&&OPT.fpsCap)|0, 0);  // 0=무제한(고주사율), 60=cap60
  const glState=()=>({
    vis:         document.visibilityState,
    hidden:      document.hidden,
    bootActive:  safe(()=>_bootLoadActive, undefined),
    warmDone:    safe(()=>_ensWarmDone,   undefined),
    dbgEnsGL:    safe(()=>_dbgEnsGL,      undefined), // GL draw 시간(5215)
    dbgEns8GL:   safe(()=>_dbgEns8GL,     undefined), // 8dir GL 그린 수(5215)
    ens8GLTotal: safe(()=>_ens8GLTotal,   undefined), // GL 인스턴싱 누계
    fpsCapItv:   safe(()=>_fpsCapInterval, undefined) // 1000/fpsCap(59469)
  });
  const isGLValid=g => g.vis==='visible' && !g.hidden &&
                       g.bootActive===false && g.warmDone===true &&
                       (((g.ens8GLTotal|0)>0) || ((g.dbgEns8GL|0)>0));

  const CAP_REC=60000;                 // 링버퍼(메모리 포화 방지)
  const recs=[]; let dropped=0;
  const push=r=>{ if(recs.length>=CAP_REC){recs.shift();dropped++;} recs.push(r); };
  const seen=new WeakMap(); let nextId=1;        // 적 객체→{id,이전상태} (객체 비오염)
  let raf=0, rafIdx=0, startPn=0, prevGT=0, autoTo=0;

  function snapOf(e){
    let s=seen.get(e);
    if(!s){ s={id:nextId++, hf:(e._hitFlash||0), alive:(e.alive!==false), rev:(e._reviveTimer||0)}; seen.set(e,s); }
    return s;
  }

  function frame(){
    rafIdx++;
    const pn=performance.now();
    const gt=gGT();
    const tick=Math.round(gt/PS);                 // 고정 update tick 인덱스
    const ticksSince=prevGT?Math.round((gt-prevGT)/PS):0; // 이 rAF 사이 돈 update 수(cap/고주사율 비교 핵심)
    prevGT=gt;
    const cap=gCap();
    const g=glState();
    const glValid=isGLValid(g);
    const arr=gEns();
    if(arr){
      for(let i=0;i<arr.length;i++){
        const e=arr[i]; if(!e) continue;
        const hf=e._hitFlash||0;
        const alive=(e.alive!==false);
        const rev=e._reviveTimer||0;
        const s=snapOf(e);
        // 관심 대상: 플래시 보유/직전보유, 사망/직전사망, 부활대기 — 전이(→0) 포착 위해 직전상태도 포함
        const interesting = hf>0||s.hf>0||!alive||s.alive===false||rev>0||s.rev>0;
        if(!interesting){ s.hf=hf; s.alive=alive; s.rev=rev; continue; }
        const ev=[];
        if(hf>s.hf && s.hf===0)       ev.push('flash_set');    // hurtE 최초 세팅(=6/4)
        else if(hf>s.hf)              ev.push('flash_reset');  // 연타 재세팅(누적X)
        else if(hf<s.hf && hf>0)      ev.push('flash_decay');  // 고정스텝 update 감쇠
        else if(hf===0 && s.hf>0)     ev.push('flash_clear');  // 0 도달(감쇠/사망소거)
        if(s.alive!==false && !alive) ev.push('death');        // alive true→false
        if(s.alive===false && alive)  ev.push('revive');       // 부활 첫 프레임(여기서 hf==0 기대)
        if(s.rev===0 && rev>0)        ev.push('revive_pending');
        push({
          raf:rafIdx, tick, ticksSince, pn:+pn.toFixed(3), cap, glValid,
          id:s.id, eIdx:i, etype:e.etype, ib:!!e.ib,
          hf, ensGLMode:(e._ensGLMode|0), ensGLQueued:(e._ensGLQueued|0),
          alive, reviveTimer:rev, deaths:(e.deaths|0), ev
        });
        s.hf=hf; s.alive=alive; s.rev=rev;
      }
    }
    if(window.__hfObs._running) raf=requestAnimationFrame(frame);
  }

  const O={
    _running:false, records:recs,
    meta:{physStep:PS, note:'관측 전용; 게임 값/동작 변경 없음'},
    start(opts){
      opts=opts||{};
      if(this._running) return this;
      recs.length=0; dropped=0; rafIdx=0; nextId=1; prevGT=gGT();
      startPn=performance.now(); this._running=true;
      this.meta.startedAt=new Date().toISOString();
      this.meta.capAtStart=gCap(); this.meta.glAtStart=glState();
      this.meta.glValidAtStart=isGLValid(this.meta.glAtStart);
      raf=requestAnimationFrame(frame);
      if(opts.autostopMs){ autoTo=setTimeout(()=>this.stop(), opts.autostopMs); }
      if(!this.meta.glValidAtStart)
        console.warn('[hfObs] 주의: 정규 GL 아님(glValid=false) — 강제부팅/백그라운드/워밍업미완. 이 상태 표본은 검수 무효.');
      console.log('[hfObs] start cap=',this.meta.capAtStart,'glValid=',this.meta.glValidAtStart,this.meta.glAtStart);
      return this;
    },
    stop(){
      if(!this._running) return this.summary();
      this._running=false; if(raf)cancelAnimationFrame(raf); raf=0;
      if(autoTo){clearTimeout(autoTo);autoTo=0;}
      console.log('[hfObs] stop records=',recs.length,'dropped=',dropped);
      return this.summary();
    },
    summary(){
      // id별 flash_set/reset → flash_clear 구간을 실시간(ms)·update tick·page rAF로 적분
      const byId={}; for(const r of recs){ (byId[r.id]||(byId[r.id]=[])).push(r); }
      const lifetimes=[];
      for(const id in byId){
        let open=null;
        for(const r of byId[id]){
          if(r.ev.includes('flash_set')||r.ev.includes('flash_reset'))
            open={pn:r.pn,tick:r.tick,raf:r.raf,cap:r.cap,glValid:r.glValid};
          if(open && r.ev.includes('flash_clear')){
            lifetimes.push({id:+id, cap:open.cap, glValid:open.glValid,
              ms:+(r.pn-open.pn).toFixed(2),     // 실시간 수명(기대 ≈100ms, cap 무관)
              updateTicks:r.tick-open.tick,      // 고정 update tick 수(기대 ≈6)
              pageRafs:r.raf-open.raf,            // page 프레임 수(cap60≈6, 240Hz≈24)
              endedBy:r.ev.includes('death')?'death':'decay'});
            open=null;
          }
        }
      }
      const reviveFirstFrame=recs.filter(r=>r.ev.includes('revive'))
        .map(r=>({id:r.id, hfAtReviveFirstFrame:r.hf, tick:r.tick, pass:r.hf===0}));
      const deaths=recs.filter(r=>r.ev.includes('death'))
        .map(r=>({id:r.id, hfAtDeath:r.hf, tick:r.tick, clearedSameFrame:r.hf===0}));
      return {
        startedAt:this.meta.startedAt, physStep:PS,
        capAtStart:this.meta.capAtStart, glValidAtStart:this.meta.glValidAtStart,
        totalRecords:recs.length, dropped,
        flashLifetimes:lifetimes, reviveFirstFrame, deaths,
        expect:{ realtimeMs:'≈100ms (cap0/cap60/고주사율 모두 수렴)',
                 updateTicks:'≈6 (sp=1, slowmo시 ↑)',
                 pageRafs:'cap60≈6, 240Hz≈24 (레이트 의존 — 수명 판정 금지)',
                 reviveFirstFrame:'pass=true (hf=0)', deathClear:'clearedSameFrame=true' },
        hint:'ms=실시간(performance.now), updateTicks=고정60Hz, pageRafs=디스플레이레이트. '+
             '수명은 반드시 ms로 판정(프레임 수로 판정 금지 — §10 REHIT 오표기 원인). glValid=false 표본 제외.'
      };
    },
    dump(){ return JSON.parse(JSON.stringify(recs)); }   // JSON 저장/반출용 스냅샷
  };
  window.__hfObs=O;
  console.log('[hfObs] 로드 완료 — __hfObs.start({autostopMs:20000}) · __hfObs.stop() · __hfObs.summary() · __hfObs.dump()');
  return O;
})();
```

### 관측 시나리오 매핑(동작수치 변경 없이 운영자 조작만)
- **정규 GL60**: 인게임 옵션에서 FPS 제한 60(`optFps`) 설정 → `start()` → CH1 GL 몹(`ensGLMode=1`) 단발 피격 → `flashLifetimes[].ms≈100 / updateTicks≈6 / pageRafs≈6`.
- **고주사율(cap0)**: 고주사율 디스플레이 + FPS 무제한(cap=0) → 동일 피격 → `ms≈100 / updateTicks≈6 / pageRafs≈24`. **cap60과 ms 일치, pageRafs만 다름** = 주사율 독립 확인(§11 발견1 해소).
- **연타**: 동일 몹 연속 피격 → `flash_reset` 기록, hf 누적 없음(매회 6 재세팅) 확인.
- **사망**: 피격 직후 처치 → `deaths[].clearedSameFrame=true`(50624 소거) 확인.
- **부활 첫 프레임**: `_reviveTimer` 경과 후 본모습(32978)/드루이드(16115)/보스(32943) 부활 또는 구울(32975, 신규 객체) → `reviveFirstFrame[].pass=true`(hf=0) 확인(§11 발견2 해소). 구울은 신규 객체라 기본 hf=0.

### 미실행·제약 (준수 사항)
1. **본 답변은 코드 설계 산출물만**이며, 하니스를 **실행하지 않았고** 게임도 구동하지 않았습니다. 수치·판정은 전부 소스 정적 대조 기반 기대값이며 **실측 주장 아님**.
2. 하니스는 **읽기 전용**입니다 — 적 객체·`OPT.fpsCap`·`_hitFlash` 등 **게임 값/동작을 변경하지 않습니다**(cap은 읽기만, 추적 상태는 WeakMap 보관).
3. **파일 변경 없음** — 저장소에 기록하지 않았습니다. 사용 시 운영자가 **정규 풀부팅된 `game.html` 페이지 콘솔**에 붙여넣습니다(easy-test 아님 — 해당 파일은 §직전검토대로 §11 미포함 구버전).
4. **main/easy 동기화·세이브·PC·보안/신뢰 변경 없음**, 새 팀·세션 개설 없음.
5. 실제 채택·캡처·요약 반출은 **QA 실행 창 인수 + 총괄 순차 배정** 하에 수행되어야 하며, `glValid=false` 표본과 "프레임 수 기반 수명 판정"은 무효 처리해야 합니다(§10 도구 오표기 재발 방지).

UI03 독립 하니스 후보 1건 설계를 완료합니다. 추가 실행은 배정 대기 상태로 종료합니다.
