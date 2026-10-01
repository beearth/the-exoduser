# ANIMVFX-20261002-SPARSE-CLOCK-INTEGRATION

root가 sparse8+데모2를 재실행했다. 그러나 추가 실제 반례에서 고주사율 전체 오PASS가 나와 제시 patch 인수를 보류했다. `outputs/team-review-20261001/five-owner-acceptance/counterexamples-before.json`의 ANIM-missing-middle-draw-record를 읽는다. records의 두 번째 draws만 누락해도 C5가 dD=null을0처럼 처리하고 clockMissing도 draws를 검사하지 않아 overall PASS(고주사율 인증)가 된다. 직접 classifyDecaySparse의 {dHf:1,dU:1,dD:null}도 PASS다.

소유는 실제 `ANIMVFX/animvfx_highhz_lifetime_gate.mjs`, `ANIMVFX/sparse-update-c5-gate.mjs`, 신규 `ANIMVFX/sparse-clock-*`, 이 폴더 `OWNER_IMPL_20261002-{receipt.json,result.md}`. 기존 gate를 before 사본으로 보존한 후, 검수된 구간 판정에 이 누락/비정상/역행 경계를 보강해 실제 원담당 gate에 통합한다. candidate 모듈만 추가하고 끝내지 않는다. 기존 sparse 데모의 old wrong 대조는 고정 before를 읽도록 하며 실제 owner를 새GREEN대상으로 검수한다.

모든 시작/중간/종료 record의 now/updates/draws/hf와 카운터 정수/단조 계약을 확인. 누락·null·NaN·negative/뒤로가기·초기 hidden/paused/runtimeGate=false·종료값 누락/가짜 zero event를 정상으로 보충하지 않는다. dU/dD는 유효한 두 끝점에서 정확히0임을 관측했을 때만 '진행 없음'으로 해석한다. 불완전은 UNKNOWN/REJECT, 실제 draw구동 증거만 FAIL. sparse sp0.5 정상/총량일치 오판 수정과 부활/사망 reset 계약 유지.

추가 반례 RED→GREEN·기존8+2·실raw3종 및 canonical gate 작은 회귀를 실행한다. 실제 >=90Hz 라이브 검수는 계속 UNKNOWN. 원 GL probe/productionVFX/game/easy/index/server/공유docs·타팀 수정0. 사용자 게임 입력/리로드/계측/새 게임·브라우저·서버·빌드0. Git/queue/새세션/새에이전트/권한0. 수신/Read/Edit/검사·완료시각, 기존/최종 SHA와 docs 반영안은 소유폴더만 기록.
