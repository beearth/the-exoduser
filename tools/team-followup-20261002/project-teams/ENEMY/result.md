# ENEMY — telegraph-cancel-boundary 결과 (2026-10-02)

양쪽 생산 HTML의 실제 함수 원문을 추출하여 **취소/사망 경계 4분류·5개 시나리오를 각각 재현(총 10 REPRODUCED)**했다. 정상 경계와 인메모리 최소 후보 검사는 **76 PASS / 0 FAIL**이다. 생산 적용·게임 실행·실전 판정은 0이다.

## 수신·소유권·검수

| 항목 | 실제 근거 |
|---|---|
| 최신 지시 | 총괄 소유 task.md 전부 읽음. 작업 폴더 /Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/project-teams/ENEMY/ 만 사용 |
| HEAD | 시작 96610b6546a31e882962470ea1f2164ce94edca6; 최종 31454dfa49c90bac77351273fc32f0c1eb937928. 공유 체크아웃의 타 담당 체크포인트 진행을 관찰했으며 본인 Git쓰기0. 보호 생산5파일/총괄 task SHA는 시작값과 동일. 이번 원격 조회는 하지 않음 |
| 수신/Read | 03:43:50Z clock 관찰 시 이미 메시지 수신·task Read 완료. 정확한 메시지 transport 시각은 없음; evidence에서 관찰시각/완료상한을 명시 |
| 중복 확인 | 기존 ddbd64be 원세션 마지막 실제 user는 2026-10-01T16:27:35.735Z의 roundrobin-order-effects. 새 과제 로그 없음. UI/숨은 큐의 현재 상태는 미관찰 |
| 실제 검수 명령 | /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --check /Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/project-teams/ENEMY/checks.mjs 및 같은 node로 checks.mjs 실행 |
| 최종 원문 검사 | 2026-10-02T03:48:10.906Z → 2026-10-02T03:48:21.593Z, exit 0. 그룹 76 PASS·기대 반례 10 REPRODUCED |
| 초기 검사기 수정 | 첫 67 PASS/10 REPRODUCED/5 FAIL은 wrapper의 sp 누락 4건과 easy에 없는 harpoon guard 가정 1건. 생산 결함으로 집계하지 않음. 원 실패 정보는 evidence.json에 보존 |
| 후보 검토 보강 | _cancelProjCharge에 interrupt 인수를 명시하여 일반 차징의 정상 완료 정리와 상태이상 취소를 분리. 동시 eShootWind 정상 완료 회귀도 양쪽 original/candidate PASS |
| 변경 누적 | 시작 24, 중간 45, 보고서 조립 전 48, 완료 52. 타 팀 병행 변경을 포함한 공유 체크아웃 관찰값이며 본인 증가량이 아님 |

## 실제 계약·원문 대조표

| source ID / 한글명 | 기존 수치·공식 | 적용 위치(본편 / 쉬운판) | 확인한 원문·판정 |
|---|---|---|---|
| G._shotWarnings / 예약 예고 | t=60f; world===ens; 요청 frame/소유자/속성/blackBean 묶음. 본편은 parryClass도 비교. r=(e.r 또는12)+같은 owner/world 링 수×8 | _emitEnemyShot 18920 / 18017, _tickEnemyShotWarnings 18934 / 18030 | 살아 있던 요청의 death/stunned>0/_frozen>0/world 변경은 취소. 정상 단일 경로 PASS. 후보는 요청 생명상태 dead의 동일성만 추가 |
| eShootWind / 특수 사격 준비 | st2=60f; st2-=sp; 완료 때 _swFire(), _swFire=null, _swChargeEl=null, s=idle | updateE 37206 / 36009; 완료 case 39180 / 37979 | 스턴·빙결 branch가 일반 _projChargeT만 지워 특수 콜백은 살아남음. 중단 후 추출 완료 case가 기존 콜백을 다시 실행하는 반례 재현 |
| _projChargeT / 일반 차징 | 시작60f; 매 updateE에서 -=sp; 0 이하에서 _fireChargedProj; _commit=true | _tickProjCharge 19006 / 18094, _cancelProjCharge 18975 / 18066 | 단독 스턴·빙결 취소 PASS. _hitStun과 빙결 동시에는 early-return이 먼저여서 차징 취소가 그 호출에서 빠짐 |
| _hitStun / 피격 경직 | 일반8f/엘리트4f/보스0; main loop에서 -=sp; updateE early-return | 본편 hurtE 40996, updateE 37238 / 쉬운판 updateE 36041 | 단독 경직은 AI 스킵이며 generic 차징을 보존. 후보도 단독 경직 정책을 바꾸지 않고 동시 stunned/frozen일 때만 interrupt 정리 |
| _telegraphT / 일반 windup 링 | 20f; updateE 앞에서 -=sp, _telegraphR=e.r+20 | 본편 updateE 37209 / 쉬운판 updateE 36012 | _hitStun=5에서 20→19, AI는 반환. 일반 근접 예고의 전면 취소 정책으로 확대하지 않음 |
| dead / 의도된 사망탄 | 요청 당시 !e.alive로 dead 고정; 60f; 사망 위치 고정; world 교체는 취소 | _spawnBossProjectile 16107 / 15222 → _emitEnemyShot | hurtE의 alive=false 후 사망탄 경로(본편 etype29/55/59)도 이 wrapper로 들어감. hurtE 전체는 실행하지 않고 발사 wrapper/큐 경계를 실제 추출 실행 |
| eChargeWind/eCharge / 논타겟 돌진 커밋 | 동물형 예고90f; 락=(_chgAimMax 또는60)×.755; eCharge 전환시 _chgDur; 기존 수치 불변 | 본편 case39140 / 쉬운판37939; chain stun guard 양쪽, harpoon guard 본편 | 원문 case/면역 guard 보존. _cancelProjCharge 호출이 돌진 상태·st2를 바꾸지 않음을 확인. 발사/포이즈/티켓 함수 SHA·본문 불변 |

## 재현된 경계와 미적용 후보

| ID | 원문 반례(양쪽) | 후보 결과 | 적용 제안 |
|---|---|---|---|
| TCB-01 특수 예고 취소 누락 | s=eShootWind/st2=1/_swFire 유효 상태에서 stunned=10 또는 frozen=2. updateE는 반환하지만 콜백 보존. 상태 해제 후 실제 완료 case 실행시 1발 | _swFire=null·_swChargeEl=null·s=idle·st2=0, 이전 콜백 발사0 | _cancelProjCharge(e,interrupt)에서 interrupt일 때만 특수 예고 정리. stunned/frozen 두 caller가 true 전달 |
| TCB-02 경직 선행 반환 | _hitStun=5/frozen=10/_projChargeT=30에서 updateE 뒤에도 30. 이 호출의 취소 누락/지연을 재현; freeze 전체 수명 중 탈출 여부는 별도 | 동시 stun/freeze이면 generic·special 정리, 단독 hitStun은 기존 동작 보존 | 경직 early-return 안에서 실제 stunned/frozen일 때만 _cancelProjCharge(e,true) |
| TCB-03 생전 예약/사망탄 혼합 | 같은 owner/frame/world/el/blackBean에서 생전 요청→alive=false→사망탄 요청. 원 큐 링1개, dead=false에 합쳐져 60f 후 둘 다 취소(0발) | 두 링으로 분리. 생전 요청 취소, 의도된 사망탄 1발(dmg18)만 방출 | list.find에 w.dead===!e.alive 추가. 기존 속성·본편 parryClass 조건 보존 |
| TCB-04 사망탄 즉시 경로 오인 | alive=false/s=eShootWind/st2=0/_swChargeEl=props.el인 사망 요청이 즉시발사 조건을 통과하여 60f 예고 없이 1발 | 59f까지0, +1f에서1; 정상 alive 완료샷은 즉시발사 유지 | 즉시 eShootWind 조건에 e.alive 추가 |

이 반례들은 원문 함수에 주어진 엔티티/요청 상태에서 확정된 결과다. 정상 플레이에서 TCB-03/04 상태가 발생하는 빈도·전체 hurtE의 재진입 경로는 실전 Gate다. TCB-01 해제 후 검사는 실제 eShootWind case와 실제 st2 감소문을 분리 실행했으며 updateE 전체 후반을 실행했다는 뜻이 아니다.

아래 diff는 **미적용**이다. task.md 외 산출물 3개 제한 때문에 별도 candidate.patch를 만들지 않고 result/evidence 안에 보관했다. checks.mjs는 디스크 생산소스를 읽어 이 치환을 메모리에서만 검수한다.

```diff
--- a/game.html
+++ b/game.html
@@ -18923,1 +18923,1 @@
-  if(e.s==='eShootWind'&&e.st2<=0&&e._swChargeEl===props.el&&!props.blackBean){props._commit=true;return spawnProj(props)}
+  if(e.alive&&e.s==='eShootWind'&&e.st2<=0&&e._swChargeEl===props.el&&!props.blackBean){props._commit=true;return spawnProj(props)}
@@ -18926,1 +18926,1 @@
-  let w=list.find(w=>w.owner===e&&w.frame===_gameFrame&&w.world===ens&&w.el===props.el&&w.blackBean===!!props.blackBean&&w.parryClass===_parryClass);
+  let w=list.find(w=>w.owner===e&&w.dead===!e.alive&&w.frame===_gameFrame&&w.world===ens&&w.el===props.el&&w.blackBean===!!props.blackBean&&w.parryClass===_parryClass);
@@ -18975,1 +18975,1 @@
-function _cancelProjCharge(e){e._projChargeT=0;e._projChargeCol=null;e._projChargeBean=null;e._projChargeParryClass=null}
+function _cancelProjCharge(e,interrupt){e._projChargeT=0;e._projChargeCol=null;e._projChargeBean=null;e._projChargeParryClass=null;if(interrupt&&e.s==='eShootWind'){e._swFire=null;e._swChargeEl=null;e.s='idle';e.st2=0}}
@@ -37238,1 +37238,1 @@
-  if(e._hitStun>0)return; // 피격 경직: AI 스킵
+  if(e._hitStun>0){if(e.stunned>0||e._frozen>0)_cancelProjCharge(e,true);return;} // 피격 경직: AI 스킵
@@ -37240,1 +37240,1 @@
-    _cancelProjCharge(e);
+    _cancelProjCharge(e,true);
@@ -37267,1 +37267,1 @@
-    _cancelProjCharge(e);
+    _cancelProjCharge(e,true);

--- a/game-easy-test.html
+++ b/game-easy-test.html
@@ -18020,1 +18020,1 @@
-  if(e.s==='eShootWind'&&e.st2<=0&&e._swChargeEl===props.el&&!props.blackBean){props._commit=true;return spawnProj(props)}
+  if(e.alive&&e.s==='eShootWind'&&e.st2<=0&&e._swChargeEl===props.el&&!props.blackBean){props._commit=true;return spawnProj(props)}
@@ -18022,1 +18022,1 @@
-  let w=list.find(w=>w.owner===e&&w.frame===_gameFrame&&w.world===ens&&w.el===props.el&&w.blackBean===!!props.blackBean);
+  let w=list.find(w=>w.owner===e&&w.dead===!e.alive&&w.frame===_gameFrame&&w.world===ens&&w.el===props.el&&w.blackBean===!!props.blackBean);
@@ -18066,1 +18066,1 @@
-function _cancelProjCharge(e){e._projChargeT=0;e._projChargeCol=null;e._projChargeBean=null}
+function _cancelProjCharge(e,interrupt){e._projChargeT=0;e._projChargeCol=null;e._projChargeBean=null;if(interrupt&&e.s==='eShootWind'){e._swFire=null;e._swChargeEl=null;e.s='idle';e.st2=0}}
@@ -36041,1 +36041,1 @@
-  if(e._hitStun>0)return; // 피격 경직: AI 스킵
+  if(e._hitStun>0){if(e.stunned>0||e._frozen>0)_cancelProjCharge(e,true);return;} // 피격 경직: AI 스킵
@@ -36043,1 +36043,1 @@
-    _cancelProjCharge(e);
+    _cancelProjCharge(e,true);
@@ -36070,1 +36070,1 @@
-    _cancelProjCharge(e);
+    _cancelProjCharge(e,true);
```

## docs 전체 검색과 총괄 동기화안

코드 산출 후 rg -n '_swFire|_cancelProjCharge|_hitStun|_shotWarnings|사망탄|논타겟 커밋|스턴/빙결만 취소|예고 취소' docs 검색: 38개 매칭 / 13개 문서. 전체 파일별 건수와 관련 원문은 evidence.json에 있다. 생산 미적용이므로 공유 SSOT를 후보 동작으로 먼저 바꾸지 않았다. 보호 2_3 및 과거 이력은 수정0이다.

| 문서 / 위치 | 생산 인수와 함께 반영할 정확한 계약안 |
|---|---|
| docs/8.0몬스터디자인/몬스터_공격시스템.md 352·360~362, 378 | 일반/특수 차징은 발사 전 stunned>0 또는 frozen>0에서 취소. 특수 취소는 _swFire=null, _swChargeEl=null, s=idle, st2=0. _hitStun 단독은 AI 정지이며 새로운 취소 조건 아님. _cancelProjCharge(e,interrupt)의 true는 상태이상 취소 caller만 전달; 일반 완료 caller는 생략 |
| 같은 문서 668·673 및 docs/9적ai패턴디자인/9_적AI패턴디자인.md 314·319 | 링 묶음 키에 요청시 생명상태(dead)를 추가. 본편은 기존 parryClass 비교를 별도로 기록하고 쉬운판에는 없음. 살아있던 요청의 사망 취소와 이미 죽은 소유자의 60f 사망탄은 분리. 즉시 완료 eShootWind 방출은 e.alive인 요청만 가능 |
| docs/9적ai패턴디자인/9_적AI패턴디자인.md 33 | 완료 콜백/색 정리에 더해 스턴·빙결의 특수 준비 취소 필드를 같은 표에 기록. 시간60f와 완료된 정상 발사 보장은 불변 |
| docs/9적ai패턴디자인/ENEMY_AI_TEAM_MASTER.md 244 및 새 작업대장 행 | 기존 stunned/_hitStun/_frozen 전체를 한꺼번에 “예고 취소”로 적은 문장을 경로별로 정정. _hitStun 단독 AI 정지, stunned/frozen 차징 취소, 사망 예약 취소·의도 사망탄 유지, 돌진 커밋 보호를 구분. TCB-01~04 source 후보 검수/생산 미적용/실전 대기를 기록 |

## 남은 Gate와 인계

| 단계 | 상태 / 담당 |
|---|---|
| 원문 fixture | 완료. checks.mjs 재실행 가능; acorn은 기존 node_modules 의존성 사용·설치0. git apply --check --unidiff-zero - 읽기전용 검사 exit0; 양쪽 12라인 미적용 diff 현재 소스에 적용 가능한지 확인 |
| 후보 인수 | 총괄 독립 실행·현재 source SHA/정확 diff·기존 함수 소유권 확인 대기. 양쪽 합계12개 원문 라인만 변경하는 제안 |
| 생산/docs 체크포인트 | 총괄이 복구 지점 확인 후 code+위 docs를 순차 인수. 이 팀 Git쓰기0 |
| 실제 게임 | QA 단독 슬롯에서 특수 차징 피격/스턴/빙결/사망·동일tick 사망탄·돌진 커밋 검수. 빈도·시각·패키지 완료는 미판정 |
| 검사 한계 | spawnProj/geometry/particles/render 대상은 명시된 stub. 실제 GPU 픽셀·게임 루프·전체 hurtE·패링 성공 동작·FPS/성능 향상은 검사하지 않음 |

소유 산출은 checks.mjs, result.md, evidence.json 총3개다. task.md·원담당 prefix·공유 생산/서버/에셋/기존 test/공용 인덱스를 편집하지 않았다. 새 세션·하위에이전트·UI·서버·게임·빌드·설치·자동화 변경0. 다음 일감을 생성하지 않고 이 한 건을 인계한다.
