# ANIMVFX — 실제 queue·draw로 부분 실패 rollback 검증 한 건

실제 checkout은 `/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. 자신의 TASK/checkout 절대경로·realpath를 확인하고 `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/COMMON.md`, AGENTS.md, 현재 총괄 담당표 및 몬스터 스킨/애니메이션/VFX SSOT를 먼저 읽는다. COMMON 계약을 적용하고 다른 담당의 공유 변경을 되돌리지 않는다. 오경로 수정·파일 삭제·이동·cleanup0이다. geometry/camera/map QA는 이번 범위에 없다.

## 이번 한 건과 이전 검수 한계

`claude-native-6/ANIMVFX/{result.md,evidence.json,checks.mjs}`와 관련 provider/foot-shadow 산출은 읽기 인수만 한다. 기존57 및 모델11그룹을 그대로 재실행·합산하지 않는다. 이전 checks의158~164는 `ensGLMode=0,rolledBack=true` 표시만 바꾸고 **실제 idle queue의 count/total/CPU buffer를 되돌리지 않는다**.170은 mode0이면 GL 출력을 강제로0으로 가정한다. 실제 `_drawEnemy8DirInstanced`는 개체 mode를 보지 않고 버킷 count를 그리므로 그 GREEN은 구현된 rollback 검증이 아니다. 이 한계를 새로운 result에서 바로잡되 이전 산출을 수정하지 않는다.

이번에는 현재 양판 **실제 `_queueEnemy8DirInstanced`와 `_drawEnemy8DirInstanced` source를 함께 실행**하고 필요한 prep의 idle→walk source 구간·2D body gate를 결합하여, idle 성공/walk 실패 뒤 **잔류 큐와 몸체 누락**을 검증한다. 현재 행/원문 SHA·상수·버킷/stride를 기록한다. 전체 게임/GL 부트0. GL API는 호출 인수와 실제 전송 버퍼 구간을 기록하는 작은 대역, `_getTex`는 준비/실패를 명시하는 대역으로 허용한다. 실제 draw 함수 대신 `mode0 ? draw0` 같은 집계 모형으로 통과를 강제하지 않는다.

최소 핵심 경계는 전역 용량 잔여1에서 마지막 이동 개체의 idle 큐 성공→walk 거절이다. 사전 큐의 count 합계와 total을 일치시키고 구별 가능한 sentinel로 기존 큐와 이번 개체를 구분한다. 실제 draw가 잔류 idle을 출력하는지 기록한 뒤, 실제 queue 상태를 복원하는 최소 rollback 또는 사전확인 후보를 **메모리 원문**으로 비교한다. 단순 mode/rolledBack 표시는 수정 후보가 아니다. 후보가 affected count/total·기존 유효 prefix와 다른 버킷/개체를 보존하고, 이 개체만 2D로 넘어가 idle/walk 합산1회가 되는지 실제 source 호출/버퍼/카운트로 검증한다. 원래 큐 성공 정상 경로도 보존해야 한다.

큐 성공 뒤 draw의 walk texture 실패는 실제 draw 함수와 실패 대역으로 별도 필수 경계만 확인한다. 큐시점 후보가 이 경계를 해결하지 못하면 그대로 FAIL/UNKNOWN을 남긴다. body `!_ensGLQueued` 가드 단독 채택을 제안하지 않는다. 자연 walk 버킷만 포화되는 합성 상태, 에셋 부재의 정당한 walk0, 실제 GPU upload/픽셀은 구분한다. 새로운4종 모델표나 대규모 군집 시각 검수로 범위를 늘리지 않는다. 발anchor UNKNOWN·corpse fade 보류·에셋/좌표/수치 변경0을 유지한다.

## 소유와 인계

허용 쓰기는 `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/ANIMVFX/`의 `result.md`, `evidence.json`, 이 실제 source 비교용 `checks.mjs` 최대3파일뿐이다. TASK/COMMON·이전 산출·생산·공유docs·기존test·저장·소유 밖 쓰기0. Git 명령/인덱스/commit/push, 서버/실게임/UI/오디오/빌드/설치/새세션/하위팀/외부메시지0. 지정 Node 사용, 검사 stdout JSON. HEAD는 직접 Git 없이 총괄의 확인된 현행 증거를 출처/시각과 함께 인수하며 없으면 UNKNOWN이다.

한국어 결과에 실제 source와 대역, queue 전/후/rollback 후 count·total·유효 버퍼·draw 호출, 기존 개체 보존, idle/walk 합산, 현행 실패·후보 결과·미해결 경계를 표로 적는다. `productionApplied=false`, `source fixture PASS ≠ GPU/runtime/visual PASS`를 명시한다. docs 전체에서 `_queueEnemy8DirInstanced|_drawEnemy8DirInstanced|_ensGLMode|rollback|부분 성공|walk`를 rg 검색하고 `몬스터_스킨_렌더링_파이프라인.md`, `몬스터_스킨_시스템.md`, `ANIMATION_VFX_TEAM_MASTER.md`에 인계할 정확한 정정 문안을 result/evidence에 남긴다. 한 건 완료 후 한국어로 보고하고 업무를 독자적으로 늘리지 않는다.
