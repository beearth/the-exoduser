// BOSS — CH1-1 retryBtn.onclick 상태보존 원자성 경계 모델 (epoch capacity-after-6a39b828-1212)
// 실행은 아래 로직을 `node /dev/stdin`로 수행했고(result.md에 원 stdout 보존) 저장 시 재실행하지 않는다.
// 지정 Node: /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node checks.mjs
//
// 대역(band): 실제 game.html retryBtn.onclick(현행 61444-61498 / 계약 retry 61441·field-branch 61449,
//   easy 59779/59787)의 '제어 순서'만 모델링한다. 상태필드는 STUB. restore/safePt/buildMapCache 의
//   실게임 throw 도달성은 환경대역(미증명). 정상 경로(throw 없음) 동작은 현행과 등가임을 함께 확인한다.
//
// 관측된 현행 순서(실제 소스 읽기):
//   61445: $('death').remove('on')  ← 오버레이 해제(복원 전)
//   61457-64: ens/MAP_OBJS/투사체/보스상태 배열 대량 clear
//   61465: _restoreBossFieldState(b)  ← throwable
//   61472-74: safePt(...)            ← throwable
//   61479: buildMapCache()           ← throwable
//   61495: G.on=true (+HUD on)       ← 맨 끝
//   핸들러에 try/catch 없음(async).

function currentRetry(throwInRestore){
  const S={overlayOn:true,arraysCleared:false,fieldRestored:false,gOn:false,hudOn:false,err:null};
  try{
    S.overlayOn=false;                 // death off (복원 전)
    S.arraysCleared=true;              // 배열 대량 clear
    if(throwInRestore) throw new TypeError('BAND restore/safePt/buildMapCache throw');
    S.fieldRestored=true;              // _restoreBossFieldState
    S.hudOn=true; S.gOn=true;          // HUD on, G.on=true (마지막)
  }catch(e){ S.err=String(e.message); } // 현재 핸들러엔 catch 없음 → 실제론 unhandled; 모델은 결과상태만 캡처
  return S;
}
// 후보 B: 복원 실패 시 기존 안전경로 initStage(G.stage)로 degrade (복구가능). 진행보존 vs 전체재시작은 root Gate.
function guardedRetry(throwInRestore){
  const S={overlayOn:true,arraysCleared:false,fieldRestored:false,gOn:false,hudOn:false,fellBack:false,err:null};
  try{
    S.arraysCleared=true;
    if(throwInRestore) throw new TypeError('BAND restore throw');
    S.fieldRestored=true;
  }catch(e){ S.err=String(e.message); S.fellBack=true; S.fieldRestored=true; /* initStage=전체 재생성=복구가능 */ }
  finally{ S.overlayOn=false; S.hudOn=true; S.gOn=true; } // 성공/폴백 모두 플레이가능 상태로 종료
  return S;
}

let P=0,F=0; const ck=(n,c,d)=>{(c?P++:F++);console.log(`  [${c?'PASS':'FAIL'}] ${n}${d?' — '+d:''}`);};
// 정상(throw 없음): 둘 다 플레이가능 등가
{const a=currentRetry(false),b=guardedRetry(false);
 ck('정상 current: 복원+gOn', a.fieldRestored&&a.gOn&&!a.overlayOn);
 ck('정상 guarded 등가(폴백 없음)', b.fieldRestored&&b.gOn&&!b.overlayOn&&!b.fellBack);}
// throw: current STUCK / guarded 복구
{const a=currentRetry(true),b=guardedRetry(true);
 ck('DEFECT current: overlay off+배열clear+gOn=false → STUCK(진행 차단)', !a.overlayOn&&a.arraysCleared&&!a.gOn&&!a.fieldRestored, 'err='+a.err);
 ck('CANDIDATE(B) guarded: 폴백 initStage로 gOn=true 복구', b.gOn&&b.fellBack&&b.fieldRestored, 'err='+b.err);}
console.log(`\n== MODEL: ${P} PASS / ${F} FAIL ==`);
process.exit(F?1:0);
