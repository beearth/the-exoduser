// RECOVERY-QA-1405 — blackBean 직접치사→die 와 _bossLoadPhase ticker 상호작용 (frame-order 충실 모델)
// 실게임/브라우저/native 아님 — source의 update() 프레임 내 '호출 순서'와 '실제 가드'만 모델링한다.
// 목적: phase1(load) 중 유일한 hurtP-우회 치사경로(blackBean 직접 P.hp-=, L32202)가 발동하면
//        die()의 P.s='fallen'을 phase ticker(L40425)의 무조건 P.s='idle'가 덮어써 사망상태가 취소되고,
//        로드 완료(phase→0) 후에야 사망이 확정되는지 — stale 로딩이 재도전/보스방 진입을 막는지 대조.
//
// 실제 소스 핀(이번 턴 읽음, game.html SHA는 result에 기록):
//  - update() 프레임 내 순서: [L31745 die-check] → [L32202 blackBean 직접차감 + die()] → [L40425 phase ticker]
//  - L41991 hurtP: if(_bossLoadPhase>0)return  (일반 피해 동결) — blackBean 직접차감은 이 게이트 밖
//  - L32202: const _bkD=...; if(!P._ioActive&&P.iframes<=0)P.hp-=_bkD;  (clamp 없음)  …  if(P.hp<=0)die();
//  - L40425 ticker: if(_bossLoadPhase>0){ P.s='idle'; P.st2=0; ... phase 1→2(_enterBossArena, iframes=90)→3→4→0 }
//  - L42282 die(): if(P.s==='fallen'||P.s==='dead')return; else P.hp=0;P.s='fallen';P.iframes=9999;P.st2=300
//  - player-act(L30945-32260): _bossLoadPhase 가드 없음 (bash 입력 phase1 중에도 진입 가능)
//  - gate-step(L40534): 처리 조건 _bossLoadPhase<=0  (stale phase>0면 재진입/게이트 차단)

const FADE1=50; // phase1 길이(프레임)
function dieCall(P){ if(P.s==='fallen'||P.s==='dead')return; P.hp=0;P.s='fallen';P.iframes=9999;P.st2=300; }

// 한 프레임 모델 (update 순서 그대로)
function frame(G,P,{bashBlackBeanThisFrame=false, blackBeanInRange=false, bkD=9999}={}){
  // [L31745] die-check (프레임 머리쪽 상태틱)
  if(P.hp<=0 && P.s!=='fallen' && P.s!=='dead') dieCall(P);
  // [L32202] blackBean 직접치사 — player-act에 phase 가드 없음. iframes<=0 && !io 일 때만.
  if(bashBlackBeanThisFrame && blackBeanInRange && !P._ioActive && P.iframes<=0){
    P.hp-=bkD;                       // clamp 없음 (hurtP 아님 → phase 동결 밖)
    if(P.hp<=0) dieCall(P);          // L32209 명시 die()
  }
  // [L40425] phase ticker — _bossLoadPhase>0 면 P.s='idle' 무조건 강제 + phase 진행
  if(G._bossLoadPhase>0){
    P.s='idle'; P.st2=0;             // ← fallen 을 idle 로 덮어씀
    G._bossLoadT++;
    if(G._bossLoadPhase===1){ if(G._bossLoadT>=FADE1){G._bossLoadPhase=2;G._bossLoadT=0;P.iframes=90;/*_enterBossArena*/} }
    else if(G._bossLoadPhase===2){ if(G._bossLoadT>=130){G._bossLoadPhase=3;G._bossLoadT=0} }
    else if(G._bossLoadPhase===3){ if(G._bossLoadT>=50){G._bossLoadPhase=4;G._bossLoadT=0} }
    else if(G._bossLoadPhase===4){ if(G._bossLoadT>=100){G._bossLoadPhase=0;G._bossLoadT=0} }
  }
}
const canStepGate=G=>G._bossLoadPhase<=0; // L40534 재진입/게이트 전제

const R=[];
// ── 시나리오 A: phase1 중 blackBean 치사 발동 (iframes<=0) ──
{
  const G={_bossLoadPhase:1,_bossLoadT:0}, P={hp:100,s:'idle',st2:0,iframes:0,_ioActive:false};
  // phase1 1틱째에 bash+blackBean 치사
  frame(G,P,{bashBlackBeanThisFrame:true, blackBeanInRange:true, bkD:9999});
  const afterKillFrame={hp:P.hp, s:P.s, phase:G._bossLoadPhase};   // hp<=0 인데 ticker가 s='idle'로 덮음?
  // 로드 끝까지 진행 (더 이상 blackBean 없음; iframes=90 로 치사 불가)
  let oscillations=0, guard=0;
  while(G._bossLoadPhase>0 && guard++<2000){
    const wasFallen=P.s==='fallen';
    frame(G,P,{});
    if(P.hp<=0 && !wasFallen && P.s==='idle') oscillations++; // die→idle 반복 흔적
  }
  // 로드 완료 후 1틱 (ticker 없음 → die-check 로 fallen 확정)
  frame(G,P,{});
  R.push({id:'A-phase1-blackBean-kill',
    killFrame:afterKillFrame,
    afterLoad:{hp:P.hp,s:P.s,phase:G._bossLoadPhase},
    gateReenterable:canStepGate(G),
    observed:`치사직후 hp=${afterKillFrame.hp} s=${afterKillFrame.s}(ticker가 fallen→idle 덮음=${afterKillFrame.s==='idle'}) | 로드중 die/idle 반복=${oscillations}회 | 로드완료 후 hp=${P.hp} s=${P.s}(사망 확정=${P.s==='fallen'}) | 게이트 재진입가능(phase<=0)=${canStepGate(G)}`});
}
// ── 시나리오 B (정상 대조): phase1 중 iframes>0 (아레나 진입 후) → blackBean 치사 불가 ──
{
  const G={_bossLoadPhase:1,_bossLoadT:0}, P={hp:100,s:'idle',st2:0,iframes:90,_ioActive:false};
  // 매 틱 bash 시도하지만 iframes>0 → 직접차감 가드 차단
  let guard=0; while(G._bossLoadPhase>0 && guard++<2000){ frame(G,P,{bashBlackBeanThisFrame:true,blackBeanInRange:true,bkD:9999}); }
  frame(G,P,{});
  R.push({id:'B-normal-iframes-protected', observed:`iframes>0 → 직접차감 차단, hp=${P.hp} s=${P.s} phase=${G._bossLoadPhase} 생존=${P.hp>0}`, gateOk:canStepGate(G)});
}
// ── 시나리오 C (정상 대조): blackBean 없음 → 로드 정상 완료, 생존 입장 ──
{
  const G={_bossLoadPhase:1,_bossLoadT:0}, P={hp:100,s:'idle',st2:0,iframes:0,_ioActive:false};
  let guard=0; while(G._bossLoadPhase>0 && guard++<2000){ frame(G,P,{}); }
  R.push({id:'C-normal-no-blackBean', observed:`로드 완료 phase=${G._bossLoadPhase} hp=${P.hp} s=${P.s} 생존=${P.hp>0}`, gateOk:canStepGate(G)});
}

console.log(JSON.stringify({
  model:'update() frame-order (L31745 die-check → L32202 blackBean 직접차감+die → L40425 ticker P.s=idle 강제)',
  reproCondition:'phase1(field fadeout, iframes<=0) 중 blackBean 투사체 사거리+bash — blackBean은 Q전용 패링레슨이라 CH1-1 보스게이트와 공존 여부는 native 미확인',
  checks:R,
},null,2));
