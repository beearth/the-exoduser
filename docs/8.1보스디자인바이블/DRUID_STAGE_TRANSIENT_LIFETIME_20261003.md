# source27 — 스테이지 전환 드루이드 ORB 수명 정본

보스 공격 배열은 새 스테이지에서 정리한다는 기존 `initStage` 규칙에 독립 ORB와 세 타이머가 빠져 있었다. Claude BOSS0418(c3fc0d83) 후보와 BOSS0424(428caa92) 정적 대조를 root가 실제 원문 함수로 재현해 양판에 최소 적용했다. 사용자 신고의 보스 사망 후 맵 초기화 해결 native 인수는 별도이며, 이 수명 수정으로 대체하지 않는다.


## 2026-10-03 source27 — 새 스테이지의 드루이드 공격 상태 초기화

| 정확 key / 적용 위치 | 현재 값·동작 | 보존 경계 |
|---|---|---|
| `G._druidOrbs` / 일반 `initStage(si)`의 기존 보스 패턴 정리 끝 | 새 빈 배열 `[]` | 이전 스테이지 ORB 객체는 수정·재사용하지 않음. 현 스테이지 ORB producer/접촉/피해/수명 코드 불변 |
| `G._druidOrbT` | 0 | 이후 실제 tick에서 다시 증가. 기존 110f/3발/6.8 frame 속도 불변 |
| `G._druidParryT` | 0 | 이전 스테이지 Q 리듬탄 누적 시간만 제거. 주기·수량·피해·Q/E 규칙 불변 |
| `G._druidParryVolley` | 0 | 이전 웨이브 번호 제거. 이후 기존 발사 시 다시 증가 |
| 양판 코드 | `G._lavaField=null;G._gwPillar=null;` 뒤 각70B 추가 | `_enterBossArena`·retry field 복귀에 이미 있는 네 초기화와 동일. 새 helper·전역정리·삭제0 |
| 다른 분기 | bosstest early-return는 기존 arena 초기화 위임 유지 | 사망 대기/부활 중 clear 추가0. HP50%/180f·si3 피날레·field snapshot46key·save schema·P/INV·플레이어 VFX 불변 |
| 검수 | 원본16개 중4PASS/12FAIL → 후보18PASS → 생산18+기존필드50+사망음향36=104PASS | 실제 전체 initStage 및 실제 ORB tick 원문 실행. 맵/적 생성·render/audio는 대역; 원본/후보 정상stage 전체G/P/events 동일. native·전체맵/청취 인수 아님 |
| Mac / 진행 | source27 코드 checkpoint 시점에는 새 앱 포장 전이었음(후속 현재 포장은 아래 표) | source26/3401은 이전 코드의 실제 숲1·일반 사망 retry·inventory 이력 보존. 이번 CUA 관측은 맥 잠금으로 중단, 사용자 해제 질문 대기. 보스/4지역/획득장착/저장재로드 미인수 |

정본·정확 SHA·대역/fixture·§23 보고는 `docs/8.1보스디자인바이블/DRUID_STAGE_TRANSIENT_LIFETIME_20261003.md`를 따른다. 기존 source14 복귀 정리와 source26 음악 예외 계약은 유지하며 이전 문단은 해당 시점 이력이다. native 보스 사망 시 문/몬스터 진행 보존의 완료 선언이 아니다.

## 실제 원문 재현과 범위

| 항목 | 정확 근거 |
|---|---|
| 전체 초기화 | inline JS AST에서 실제 `initStage` 전체를 추출·호출. stage0/1/3/100(상한34), 기존 bosstest=3 early branch, 생성 오류 동일 Error 전파 확인 |
| ORB 소비 | 실제 `(G.stage===0||G.stage===3)&&G.bossAlive` 블록의 이동/발사/접촉/수명 원문 전체 실행. 초기화 뒤 fixture에서 bossAlive=true/참조null/iframes0/동일좌표를 사용하여 원본 이전 ORB 피해100→수정0 확인 |
| 도달 한계 | 위 guard/좌표/무적 해제는 상태 fixture이며 자연 플레이에서 누출을 관측한 근거가 아님. 원본 전체맵 생성 함수는 실행하지 않음 |
| 정상 동등 | seeded RNG(.125)와 신선한 ORB=[]/타이머0에서 원본·후보 전체 initStage의 G/P/events 동일. 현 스테이지 ORB 접촉 피해100/중독+3/속박80 및 소멸 기존 원문 동작 보존 |
| generation 대역 | genFromTemplate/genGauntlet·맵/적 생성·region/스폰·캐시·조명·background. 함수의 일반 초기화 제어와 실제 ORB 내부 상태는 원문, 외부 render/audio/충돌 query sinks는 대역 |
| 독립 수정 검증 | 양판에서 추가된 네 초기화70B를 역치환하면 source26 전체 원문 byte-exact. tick/producer/renderer·index·BGM·Q/E·snapshot/save 코드 변경0 |
| 회귀 검사 | `test/stageOrbLifetime.test.cjs` 새16 source검사 + owner baseline 비교2. `test/bossRespawnFieldState.test.cjs`50·`test/deathAudioProgress.test.cjs`36 함께 생산104PASS. 양판 JS12/importmap2 구문 검수 포함 |
| 증거 루트 | `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/root-stage-orb-source27/` — before/baseline-tap/candidate-tap/production-tests/keyword/후속checkpoint 영수증 |

## 정확 파일 핀

| 파일 | bytes | SHA256 |
|---|---|---|
| `game.html` | 4034850 | `d91c1d9489749fc6cbe410293fa2288d487a7c9c7bb28567233a0af92c6ffc2a` |
| `game-easy-test.html` | 3912519 | `1360a1c0185f549f34f204f946b5c808529ffde86e919214f92aa679960865d6` |
| `index.html` | 342119 | `1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7` |
| `test/stageOrbLifetime.test.cjs` | 7199 | `870c4a4cc11ffe8238890b6087d444565786d989d147b00f92543af95fe62f87` |

## MAP PRODUCTION REPORT (§23)

| 항목 | 이번 보고 |
|---|---|
| STAGE | CH1-1/새 일반 스테이지의 전투 transient 수명. 맵 가이드v0.9 전체 선행 읽음. LOCK/SSOT와 현행 남→북/4지역/보스문 계약 유지 |
| MASTER | silhouette/regions/main route/side spaces 변경0. 생성 fixture로 실제 전체 geometry를 검수했다고 주장하지 않음 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH 및 major holes 변경0 |
| LARGE | source assets/composites/overlap/repeated silhouette 변경0 |
| MEDIUM | connections/remaining holes 변경0 |
| GROUND | shadow/contamination/structure integration 변경0 |
| PLAYABLE | arena/travel/breathing/threat 배치 변경0. 새 stage에서 이전 ORB 피해/속박 차단만 source 검수. 실제 전투 가독성 미인수 |
| LANDMARK | primary/secondary/tertiary 변경0 |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 새 검사0. 기존 전체 MAP-020 RETOUCH 유지 |
| TECH QA | 실제 상태 초기화/ORB tick 및 인접 field retry source104PASS. route/collision/pageerror/404/seam/loading/performance native 새검수0 |
| FILES | root 완료소유 코드2+test1+관련 docs11=14. 타인67·manager4·사용자23WIP·기존 게임/세이브 범위 제외 |
| GIT | 이14 exactscope 코드+docs를 함께 root checkpoint. 정확 commit/push/remoteSHA는 같은 증거 루트 후속 영수증. 다른 완료 후보를 자동 포함하지 않음 |
| VISUAL VERDICT | RETOUCH — 기존 맵 판정 유지, 이번 수정 새 시각 인수0 |
| NEXT PASS | 맥 잠금 해제 후 같은 현재 소스 별도 앱에서 CH1 전투·획득·장착/4지역/보스문·보스 사망/부활/retry 진행보존·실저장·청취·시각 검수 |

생산 적용은 완료된 코드 변경의 근거이며 완제품 건수는 아니다. 새 스테이지 전환만 수정하므로 보스 사망 대기 중 잔류 공격의 정책은 변경하지 않는다. 삭제·cleanup·권한/인증·설치·결제·게시·새팀·새채팅0, oldapp/oldsave 재입력0.


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
