# 2026-10-02 AI 강화 저장 인수와 Mac 앱 준비

## 생산 인수
본편과 easy의 `_doAiEnhance`에 실제 소비 `res.used>0`일 때 `dbSaveNow()`를 부르는 한 줄씩만 추가했다. 성공·실패 모두 500ms 저장을 예약하고 무시도는 예약하지 않는다. 비용·확률·RNG·효과는 그대로다. root의 실제 추출 저장/복원 회귀32 PASS와 QA 독립10 PASS, 각 파일 inline 스크립트6개 구문검사를 통과했다. QA10은 이 기록 직전 root가 다시 실행했다.

500ms 이전 종료, 이미 진행 중인 저장에 겹친 요청의 유실, demo의 별도 복원 정책까지 해결한 변경은 아니다. BALANCE save-inflight 후보29검사는 제출 완료이고 아직 생산 인수 전이다.

## UIUX 실제 브라우저 인수
native-focus 후보의 .js import와 실제 inventory-space.css 연결을 확인했다. 본편/한국어에서 Enter·Space로 상세 초점 이동, Tab으로 행동 버튼 진입, hover 종료 시 초점 유지, 재렌더 후 새 카드 복귀를 확인했다. 그러나 카드에 초점이 있는 상태에서 fixture 아이템을 삭제하면 activeElement가 BODY로 떨어진다. CSS on에서는 inline hidden과 computed visible도 다르다. 후보 전체 인수와 생산 적용은 보류한다. easy/영어/패드/전체 게임 CSS 검수는 완료하지 않았다. JSON과 스크린샷: outputs/team-review-20261002/persistence/uiux-native-focus.*. 사용자 게임 탭은 보존했다.

## BUILD
공식 NW.js 0.111.2 osx-arm64 ZIP을 별도 runtime 폴더에 확보했다. 공식 체크섬 efda00a9f91353be1b78b7b38ab6fab12b5871c50e5648c6632fb44059da33f8과 일치하고 arm64 Mach-O를 확인했다. 이는 실행 엔진 확보이며 EXODUSER .app 완성이 아니다.

BUILD의 읽기 전용 스캔은 입력7925파일/6701632473bytes, 런타임340개를 기록했다. HTML 두 파일은 이번 체크포인트 대상이다. LFS 포인터3경로, 제작 provenance ZIP 보호 거부5경로, 출력 폴더 미생성 및 동적 참조 검수 게이트가 남았다. 원본을 삭제하거나 보호 규칙을 완화하지 않는다. 필수 실행 참조와 제작 원본을 구분한 입력 명세 확정 후 앱을 만든다. 실제 앱 빌드·실행0.

## 팀 인수 및 상태
- QA: persistence 독립10 PASS root 확인 완료.
- ITEM: browser-csp 제출 완료. root native 진단에서 Codex overlay의 shadow style과 시작 시 CSP 위반이 함께 관측됐다. 호스트 자체 inline style은 발견되지 않았다. 원인을 확정하거나 CSP를 완화하지 않는다.
- UIUX: native 후보 제출 완료, root 반례로 생산 인수 보류.
- BUILD: package-ready 스캔 및 후속 분기 검수 진행 기록 확인. notLoaded 표시를 작업 완료나 실행중으로 대체하지 않는다.
- BALANCE: AI29 원본 반례 인수, 생산32+QA10 PASS. busy-save29 후보는 독립 인수 전.
- ART: 기존 observer46+canonical11 체크 인수. wa24-preview 새 제출 완료, native 시각 인수 전.
- MAP: 이전 lifecycle22 검사 통과에도 root 초기숨김·clearInterval 재시도 실패 반례2개 발견. cleanup-retry 수정 제출 완료, root 재인수 전.
- SKILL: hellRay 이후 thunderStake 자원 확인 후보 제출 완료, 아직 생산 반영 전.
- ENEMY: 기존 roundrobin9 검사 통과에도 음수/signed32 반례 발견. roundrobin-boundary 새 후보 제출 완료, 아직 생산 반영 전.
- ANIMVFX: sparse gate의 누락 draws 반례 보강 검수 완료. flash-transition 기존 세션 Read/조사 확인, 완료 미확인.
- SOUND: 기존 S-11-HOWL 완료 상태 보존. 다음 과제는 접근 제한으로 미전달이며 우회하지 않았다.

UIUX/BUILD에 이번 새 발견의 후속 메시지를 공식 도구로 보내려 했으나 active writer 오류로 전달되지 않았다. 수신·착수로 기록하지 않으며 중복 전송하지 않았다. 나머지 원세션 실제 Read/Edit 기록은 claude-final.json, 직전 네 Codex 수신 기록은 codex-dispatch.json을 따른다. 새 팀·세션은 만들지 않았다.

## 다음 실행 순서
1. 이번 생산 수정과 필수 회귀·docs를 원격 체크포인트로 보존한다.
2. Mac 앱 입력에서 LFS 원본/제작 ZIP의 실행 의존성을 판정하고 완전한 입력 명세를 만든다.
3. UIUX 카드 소멸 초점 반례를 수정·재검수한 뒤 생산 적용을 결정한다.
4. busy-save 후보와 각 완료팀 제출은 함수별 원문·실제 회귀를 대조한 후 순차 인수한다.


## 2026-10-03 source20 뇌전창 확정·취소·장면 정리

| 항목 | 현행 연결 |
|---|---|
| MP / aim | thunderStake click 시 MP<50이면 안내·취소, MP/stock/recharge/설치 효과 보존. 성공 비용50/stock1/rech720 유지. _clearHeldInput의 blur/hidden에서 _tsAiming=false, visible 및 기존 설치물 유지 |
| scene4 | _enterBossArena·일반 initStage·_fallenResolve 실제사망·retryBtn field복원분기에 G._thunderStakes=null;P._tsAiming=false. 네번째는 _refillRespawnResources 본문이 아님. 자동 부활 성공·field46key·기존 몬스터/문/아이템·자원 완충 공식 변경0 |
| 수치 / UI 경계 | 현재 maxT=900+(Lv−1)×30f, 충전720f/5stock(Lv10≥6), MP50/1000px/arc20f/0.0875. pDotDur로 창 수명 연장0. 기존 화면 desc의600px/10초는 아직 잔류하며 실제 값과 구분, 번역 후속 필요 |
| 검수 / 미완 | 신규12PASS(원본4PASS8FAIL)·focus20PASS·실제 boss helper/callback 회귀34PASS(새4/기존30). 정상4control 동등·fixture 오류0. source20 격리앱3395 포장·타이틀·전용HTTP200 확인. 실제 Mac 게임6단계/시각/청취/저장 인수는 미완 |

정확한 수치·소스 경계·원본 영수증은 [뇌전창 현행 계약](<../../../2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md>)의 source20 표를 따른다. 이전 source별 계약/미적용 후보는 당시 이력으로 보존한다.


## 2026-10-03 source21 Mac 실행본 — 포장·정상 타이틀 기동

| 항목 | 현행 상태 |
|---|---|
| 후보 | job b4a3cf03-34d2-45ea-b2a7-a08bf94ca7d2 / port3396 / source commit 97d5079b513bebce747899c734dadafd607af95e. source21 미개봉상자+source20 뇌전창+source19 CP+source18 넉백 수정 포함. 기존 앱/세이브 보존 |
| 확인 | frozen7918/런타임340 실행1회, payload7916 stage/app 정확 복사, bootstrap2·arm64실행파일5 확인. 새 앱 실제 타이틀·전용HTTP4개200, 응답source3 byte-exact |
| 남은 검수 | 입력 잠금해제 확인 대기; 새캐릭터·전투/획득·4지역/보스문·보스사망/부활·재도전·CP화면·저장/청취 미완. 기존검사 반복0·GUI입력0·사용자게임/세이브조작0 |

자세한 앱·저장경로·코드 SHA·physical/native 영수증은 [source21 후보 계약](../../../13출시·마케팅/MAC_CH1_SOURCE21_CANDIDATE_20261003.md)를 따른다. source19와 source17 관측은 각각 당시 이력으로 보존한다.


## 2026-10-03 source22 Mac 실행본 — 포장·타이틀·HTTP 확인

| 항목 | 현행 확인 상태 |
|---|---|
| 후보 | job 9170d8a4-2ede-48d8-a758-20fc5e8b3193 / port3397 / 코드 checkpoint 9cab599f1f297133577b42e45ca001c34c255f96. source22 펫 조작 안내·fade 보존 포함 |
| 확인 | 입력7918/런타임340 execute1회, payload7916 stage/app SHA exact, bootstrap2·arm64 실행파일5. 새 앱 타이틀 AX/JPEG2704×1696·HTTP4개200·정적 응답source3 exact |
| 미완 | GUI입력0·캐릭터0·잠금해제 답변 대기. 동일 후보 CH1-1 정상시작/전투·획득·장착/4지역·보스문/보스 사망·부활/재도전·저장/청취 인수 미완 |
| 보존 | 기존7검수 앱·사용자게임/세이브 입력0. 보호67·관리자4 보존. 기존 source 검사 반복0 |

상세 경로·SHA·인수 경계는 [source22 Mac 후보](../../../13출시·마케팅/MAC_CH1_SOURCE22_CANDIDATE_20261003.md)를 따른다. 이전 source21/3396 및 source17 부분 플레이는 당시 이력으로 보존한다.


## 2026-10-03 source23 Mac 실행본 — 전조 수정 포함·타이틀 확인

| 항목 | 현행 확인 상태 |
|---|---|
| 후보 | job f70852a9-594f-4de4-9313-bd28af78f80e / port3398 / 코드 checkpoint 216035ab68a86f673f63560112d6b683f1695104. 보스 jump300px/fan실발사각 및 이전 source22 수정 포함 |
| 확인 | 입력7918/기존runtime340 execute1회. payload7916 stage/app각SHA exact, 파생bootstrap2·arm64실행파일5. 실제 타이틀AX/JPEG2704×1696·전용HTTP4개200·응답source3 exact |
| 미완 | GUI입력0·새캐릭터0·잠금해제 새답변 대기. 동일후보 CH1-1 정상시작/전투·획득·장착/4지역·보스문/사망·부활/재도전·저장/청취/전투화면 인수 미완 |
| 보존 | source22/3397 등 기존8검수 앱·사용자게임/세이브 입력0, 보호67/관리자4보존. 실제 기존 source검사 반복0 |

정확한 앱·저장경로·SHA·인수 경계는 [source23 Mac 후보](../../../13출시·마케팅/MAC_CH1_SOURCE23_CANDIDATE_20261003.md)를 따른다. 이전 source22 타이틀과 source17 부분 플레이는 당시 이력이다.


## 2026-10-03 source24 Mac 실행본 — 현재 스테이지 콤보 수정 포함·타이틀 확인

| 항목 | 현행 확인 상태 |
|---|---|
| 후보 | job ecc7b214-401e-4dfe-b310-090d30a03e50 / port3399 / 코드 checkpoint 9f9adc11ed36330cca8fc750ab94300a6f084054. 현재 스테이지 최대콤보를 클리어 점수·배지·통계에 사용하고 캐릭터 저장 최고 기록 보존 |
| 확인 | 입력7918/기존runtime340 execute1회. payload7916 stage/app각SHA exact(복사당6645489253B), 파생bootstrap2·arm64실행파일5. 실제 타이틀AX/JPEG2704×1696·전용HTTP4개200·정적응답source3 exact |
| 미완 | GUI입력0·새캐릭터0·잠금해제 새답변 대기. 동일후보 CH1-1 정상시작/전투·획득·장착/4지역·보스문/사망·부활/재도전·저장/청취/전투화면 인수 미완 |
| 보존 | source23/3398 포함 기존9검수 앱의 존재/Info.plist ID와 profile/save 메타만 대조. 사용자 게임·세이브 입력0, 보호67/관리자4보존. 원래 사용자 앱59376baf/08cac1ce의 정확경로는 미확인. 기존 source검사 반복0 |

정확한 앱·프로필·저장경로·SHA·인수 경계는 [source24 Mac 후보](../../../13출시·마케팅/MAC_CH1_SOURCE24_CANDIDATE_20261003.md)를 따른다. source23 타이틀 및 source17 부분 플레이는 당시 이력이며 이번 같은후보 플레이 완료 증거로 합산하지 않는다.


## 2026-10-03 source25 Mac 실행본 — 사망·부활 오디오 오류 격리 포함

| 항목 | 이번 확인 범위 |
|---|---|
| 코드/후보 | `b9c1a2e6559fd907c6ba0b72b8a5f6d19b9f88b5` / job `a05224ef-0b57-4b87-ab0a-fba20aeb2a45` / port3400. die·fallenResolve·deathFX 및 실제loop의 음향예외 격리 포함 |
| 포장/기동 | 입력7918/기존runtime340/execute1회. payload7916 stage/app각SHA exact, 복사당6645490969B. 파생bootstrap2·arm64실행파일5. 실제 타이틀AX/JPEG2704×1696·HTTP4×200/정적3원문exact |
| 이전 검수 | source25 생산검사72PASS는 당시source검수이며 이번 포장단계test반복0. source24 콤보와 이전 필드복귀 수정 포함 |
| 실제 입력 | macOS ioreg의 `CGSSessionScreenIsLocked=true` 읽기확인. GUI입력0/새캐릭터0/잠금해제 새회신 대기. 인증·잠금 우회0 |
| 남은 목표 | 같은후보 CH1-1 시작·전투/획득/장착·4지역/보스문·사망/부활/재도전·저장/청취/visual 미인수. QA의retry BGM예외 후보는별도root실제handler검수/채택대기이며이번앱에포함했다고주장하지않음 |
| 보존 | source24/3399 포함기존10검수앱 존재/plist ID와profile/save 메타만대조. 사용자게임·세이브입력0/보호67/manager4 보존. 원래사용자앱59376baf/08cac1ce 정확경로UNKNOWN |

정확한 경로·SHA·검수 경계는 [source25 Mac 후보](../../../13출시·마케팅/MAC_CH1_SOURCE25_CANDIDATE_20261003.md)를 따른다. source24 타이틀·source17 부분플레이를 이번 같은후보 완주 근거로 합산하지 않는다.


## 2026-10-03 source26 Mac 실행본 — 재도전 음악 오류 격리 포함

| 항목 | 이번 확인 범위 |
|---|---|
| source/실행본 | `d7cff1fb9ef030acfc837041f0ccea93756b4b54` / job `c3902d79-03c0-4c25-9e66-a43226d10288` / port3401. initStage 마지막·field/arena retry의 BGM 동기 오류 격리2caller 포함 |
| 포장/기동 | 입력7918/runtime340 재사용·execute1회, payload7916 stage/app 각SHA exact·복사당6645491177B. bootstrap2 exact/arm64실행파일5. 실제title AX/JPEG2704×1696·HTTP4×200/정적3현재원문exact |
| 입력 변화 | 처음ioreg locktrue였으나 현재flag없음/console·loginDone=true 확인. 새앱Return1 정상전달→world intro 진행. 인증·잠금해제시도0. stale9click는노드수명오류/전달0이며새화면AX로교정 |
| 검수 한계 | source86PASS는당시코드검수/이번포장test반복0. 캐릭터/CH1시작·전투/획득/장착·4지역/보스문·사망/부활/재도전·정상저장재로드/청취/visual 완주 미인수. 타이틀·인트로를그완료로합산하지않음 |
| 보존 | source25/3400 포함기존11검수앱 존재/ID/profile·save메타만대조. 옛전체재인벤토리/세이브내용읽기·입력0, source25는이새2caller미포함의이전본. 원사용자앱59376baf/08cac1ce 정확경로UNKNOWN/추측제어0 |

정확한 경로·SHA·증거와실제플레이 Gate는 `docs/13출시·마케팅/MAC_CH1_SOURCE26_CANDIDATE_20261003.md`를 따른다. 옛source17 부분플레이와source25 타이틀을이번같은후보완주근거로합치지않는다.


## 2026-10-03 source27 Mac 별도 후보 — 포장/파일 검수 완료, 실제 기동 미실시

| 항목 | 현재 정확 상태 |
|---|---|
| 생산 코드 / job | `3c7dc6ab1cb0bc68cc3b969e27d06204fbe0f97f` / `953a5489-91eb-4d43-9c18-f05454ad27a7` / port3402. 일반 initStage 드루이드 ORB=[]/타이머3=0 각70B 포함 |
| 실제 포장 | frozen7918 입력/runtime340 재사용, 새job execute1회. stage/app payload7916 각각 전체SHA·coverage exact, 복사당6645491317B. source3 byte-exact/bootstrap2 역치환 exact/runtimearm64 실행파일5·plist ID 확인 |
| 증거 | physical 영수증31761B / SHA256 `94bcf7fe6ba1af2b39476511bc691b06b54c920ac636c8216f053ea638da385e` |
| 실제 기동 | 새앱 launch0/HTTP0/GUI입력0, profile/saveRoot 아직 존재하지 않음. CUA의 source26 화면 조회는 Mac 잠금으로 실패, 해제 질문 pending. 인증·잠금 우회0 |
| 인수 경계 | 생산104PASS는 이전 코드 검수이며 이번 포장 test반복0. 같은source27 CH1 시작·전투/획득/장착·4지역/보스문·보스 사망/부활/retry 진행보존·실저장·청취·시각 미인수 |
| 이전 실행본 | source26/3401 포함기존12검수앱 존재/plist ID/profile-save metadata만 확인. 내용hash·입력0. source26의 숲1·일반 사망retry·inventory는 이전 후보의 부분 플레이 이력이며 source27완주로 합산0 |
| 보존 | 기존67WIP/manager4/사용자23변경·원래게임/세이브 보존. 사용자 원래앱59376baf/08cac1ce 정확경로UNKNOWN/추측제어0. 삭제·cleanup·설치·새팀·새채팅0 |

앞선 source27 코드 checkpoint에서 “아직 포장하지 않음”은 당시 단계의 이력이다. 현재 실행 가능한 파일 후보는 준비됐으며 실제 Mac 플레이 인수는 대기다. 정확 앱/프로필·저장경로와 원문SHA는 `docs/13출시·마케팅/MAC_CH1_SOURCE27_CANDIDATE_20261003.md`를 따른다. source26 음악 예외·source14 field복귀·46key 진행 보존 계약은 그대로 포함한다.


## 2026-10-03 source28 Mac 파일 후보 / source27 실제 플레이 후속

이 절은 이전 포장·잠금 대기 이후의 상태다. 이전 날짜별 기록은 당시 이력으로 보존한다.

| 항목 | 확인한 상태와 남은 검수 |
|---|---|
| 최신 파일 후보 | source28 / job `2242869e-903a-4917-a38c-e0f6c02ff47c` / port3403 / 입력 커밋 `f376e3ce9c3524fa7874078c6738e1e5ab8a1e5b` / **PACKAGED_NOT_RUNTIME_ACCEPTED** |
| 포함 코드 | field 복귀의 `P.poison=0;P._rbPoison=[];P._rbBurn=[];` 양판 각44B 및 이전 initStage 드루이드 초기화. 생산89PASS는 경계 대역 포함 코드 검수 이력이며 실제 앱 완주 증거가 아님 |
| 실제 파일 검수 | frozen7918 입력 중 bootstrap2 파생. stage/app payload7916 각각 전체SHA 일치, source3 exact, bootstrap2 전체 역치환 exact, arm64 실행파일5와 plist ID 확인. 재빌드·검사 반복0 |
| source28 실제 플레이 | launch0/native입력0. 물리 검수 시 새 profile/saveRoot 미생성. 전투·보스 사망/부활·열린 문/몬스터 보존·실저장·청취·카메라 인수 미완료 |
| source27 실제 장착/일반retry | 정상 전사 시작→연습 건너뛰기→CH1 첫 필드. 장착4건 후 CP1857. 일반 사망→다시 일어서라로 HP549/549 MP376/376 SP279/279 및 장비 유지 확인 |
| source27 마지막 관찰 | 첫 처치1/32, EXP2/15, 악의997, 시간55초, HP0. Controls 설정 화면에서 대기. 앞선 완충 관찰을 현재 생존으로 계산하지 않음. 아이템 줍기·4지역·보스 해금/사망 미인수 |
| 보존 | source27 포함 기존13 검수앱 존재/Info.plist ID 확인. 기존 profile/save 내용 변경0. 원사용자 앱 정확 위치 UNKNOWN; 전체 원본hash 보존 검증으로 확대0 |
| 물리 영수증 | `tmp/mac-migration-runtime/continued-review-20261003/ch1-source28-build/physical-receipt.json` 32859B / SHA256 `2b677de448db516036e2d32069f5b326e5aec535104f7db0072c57b5d21e5bda` |

파생 port3403·격리 user-state는 원본 서버3333·저장 schema 변경이 아니다. source27 부분 플레이를 source28 제품 인수로 합산하지 않는다. 상세 successor 경로·SHA·장착 표는 `docs/13출시·마케팅/MAC_CH1_SOURCE27_CANDIDATE_20261003.md`의 후속 기록을 따른다.

DEMO 시작/일반retry 관찰은 저장 재실행 검수가 아니다. 기존 세이브 내용 수정0.
