# CH1-1 실제 플레이 통합 마일스톤 — 2026-10-02

목표는 **같은 로컬 후보 빌드에서 CH1-1 시작→전투·획득→보스 게이트→보스전 사망→부활→재도전이 끊기지 않는 시연 경로**다. 현재 승인된 콘텐츠·수치·규칙으로 이 경로를 완성하고, 실제 플레이 근거를 남긴다. 보스 처치/클리어 경계도 기존 계약과 일치하는지 확인한다. 팀별 조사·보고서 개수는 playable 완료가 아니다.

기준은 [총괄 마스터 §13](../../PROJECT_MANAGEMENT_MASTER.md#13-투자-검토용-빌드-품질-목표와-아침-회의)의 투자 검토용 플레이 빌드다. 이 문서는 작업 목표·인수 기준이며 새 콘텐츠·밸런스·저장 규칙을 확정하지 않는다. 달성 시각·완성 빌드·AAA/투자 성과는 미리 선언하지 않는다.

## 우선 결과 3개

| 우선 | 끝내야 할 결과 | 인수 조건·주 담당 |
|---|---|---|
| 1 | 사망·게이트·필드 상태·기존 저장 경로가 진행을 막지 않음 | BOSS/QA/BUILD 중심. 게이트 개방 전후와 보스전 사망·필드 부활·재도전의 상태가 현행 SSOT와 일치하고, 기존 저장/재진입의 진행 경계가 보존됨. 새 schema·사용자 세이브 변경0 |
| 2 | 실제 공격·입력·피격·처치·획득·장비 선택이 연결됨 | SKILL/ENEMY/ANIMVFX/UIUX/ITEM/BALANCE/SOUND. 입력 취소·자원 차감·아이템 identity·표시·효과·소리의 실제 흐름을 같은 후보에서 확인 |
| 3 | CH1-1 길과 전투가 읽히고 기존 서사·가이드·데모가 연결됨 | MAP/ART/STORY/QUESTNPC/MARKETING 및 BUILD. 실제 카메라의 길/전조/피드백과 기존 소개·재도전·데모 반환 경로를 확인하고 로컬 시연 후보를 인수. 설치·게시0 |

## 운영·소유

- 기존 전문팀15 그대로 유지: Codex7(UIUX/ITEM/BUILD/BALANCE/SOUND/QUESTNPC/MARKETING), Claude8(ART/MAP/SKILL/QA/ENEMY/ANIMVFX/BOSS/STORY). 총괄1+전문15+작업감독1=17역할이며 새 팀·세션을 만들지 않는다.
- 각 전문팀은 기존 TASK/COMMON의 소유 폴더에서 **이번 목표에 필요한 실제 소스 patch/채택 가능한 후보 또는 게임플레이·에셋 산출물 한 건**을 만든다. 반복 검색·기존 통과검사 재실행·보고서만 추가한 결과로 진척을 대신하지 않는다. 필요 검사와 근거는 그 산출물을 인수하기 위해 수행한다.
- 공용 `game.html`/`game-easy-test.html` 반영, 관련 docs 동기화, 소유 범위 Git/원격 checkpoint는 총괄이 순차 인수한다. 팀은 공용 source·타인WIP를 덮지 않고 후보와 실제 소유 구간을 인계한다. 독립 작업은 다른 팀 source 통합을 기다리며 멈추지 않는다.
- 완료하면 남은 의존성을 인계하고 같은 목표의 다음 독립 미완료 한 건을 계속한다. 다음 일상 작업마다 사용자 확인을 기다리지 않는다. 작업감독5분 회복 점검은 정체·의존성 조정 수단이며 다음 작업 착수의 허가 대기가 아니다. 공식 배정/수신·Read/완료 확인은 기존 작업감독이 맡는다.
- 총괄 인계 시점 자율연속 실제 Read는13/15이며 MAP은 큐 대기, ENEMY는 classifier `[Auto-Mode Bypass]` 거절/API 재시도 문제를 보존한 BLOCKED다. 이 기록은15팀 착수·완료 증거가 아니다. 거절된 정책 경로를 새 문서/새 세션/변형 명령으로 재시도하거나 우회하지 않는다.

## 15팀의 이번 산출물과 인수

| 팀 / 공급자 | 유용한 산출물 한 건 | 담당 후보·소유 초점 | 인수 기준 | 의존성 |
|---|---|---|---|---|
| QA / Claude | 동일 후보의 아래6단계 실제 플레이 증거와 첫 진행 결함 재현 | 기존 격리된 실행환경의 경로·상태·영상/관측 근거. 실제 사용자 세이브 변경0 | 빌드/소스 SHA, 조건, 단계별 관측·중단 이유를 기록. fixture를 실제 플레이로 표시0 | BUILD 후보 + 총괄 source 통합, MAP/BOSS 경로 |
| BUILD / Codex | 기존 승인 Mac 입력·runtime을 사용한 로컬 시연 후보와 exact 입력/출력 manifest | 기존 Mac packager/runtime closure·helper pin 후보. 설치/서명/게시 완료 선언0 | 직접 HTML 의존 누락 없이 실제 입력·helper·출력 SHA 연결. plan-only를 실제 앱/기동 PASS로 표시0 | 총괄 인수된 source/docs와 QA의 단일 실행 슬롯 |
| BOSS / Claude | CH1-1 사망/부활/재도전의 상태 보존 접점 후보 또는 실제 관측 산출 | 기존 gate/unlock·field/arena 복귀·boss retry/clear 경계. 새 보스/규칙0 | 개방 게이트와 필드 진행이 현행 복원 계약대로 유지됨; 자원·EXP·death/time 정책은 SSOT 그대로 | QA 실제 경로, MAP 기존 구조, 총괄 순차 반영 |
| MAP / Claude | 기존 CH1-1 route/camera의 실제 시연 증거 또는 좁은 가독성 후보 | 승인된 CH1-1 길·전투 공간·카메라/가림. 기존 LOCK·배치 계약 보존 | 공통 맵 가이드/SSOT 순서 적용, §23 보고·실제 VISUAL VERDICT. source PASS로 visual 대체0 | 실행 큐 해소, QA 동일 후보, ART 기존 환경 |
| ART / Claude | 기존 환경 에셋을 사용한 길·전투·실루엣 가독성 산출 | CH1-1 승인 생체 지옥 팔레트와 현재 에셋. 신규 캐릭터 생성/콘셉트 변경0 | 실제 카메라 비교에서 길/적/전조가 읽히는 근거; 임의 geometry·LOCK 변경0 | MAP route와 QA 실제 화면 |
| SKILL / Claude | 현재 CH1-1 입력 release/cancel의 실제 연결 후보 한 건 | 기존 스킬·키보드/패드/blur 취소 lifecycle. 이미 채택된 취소 guard 중복검사0 | 정상 발사와 취소의 자원/쿨다운/효과가 기존 규칙에 일치; 소스·대역·실입력 범위 구분 | UIUX 입력, BALANCE 현행 값, QA 실제 입력 |
| ENEMY / Claude | 기존 CH1 적 상태의 독립 소스 후보 한 건; 허용 경로가 없으면 BLOCKED 의존성 인계 | 기존 spawn/aggro/attack/death 상태. 어택 티켓/새 AI 규칙0 | 허용된 근거로만 상태·멈춤 결함을 인수. 현재 거절/API 실패를 삭제·성공으로 치환0, 실행 우회0 | 정책상 가능한 기존 경로, QA 실제 전투, BOSS 경계 |
| ANIMVFX / Claude | 기존 명중/전조/효과 수명의 실제 연결 산출 | 현재 hit/telegraph/lifetime 후보. queue-only/body-skip 미채택 Gate 보존 | source-sink 호출을 가시 픽셀·완전 몸 렌더 PASS로 확대0; 실제 화면에서 누락/잔류 여부 관측 | ENEMY/SKILL source, ART 에셋, QA 화면 |
| UIUX / Codex | HUD→인벤토리→스킬→복귀 실제 흐름 후보 한 건 | 기존 입력·초점·카드 수명/표시. 이미 채택한 minus guards 반복0 | 실제 조작에서 중복 소비·옛 callback·반환 초점 문제 재현/해결범위 명시; 대역 focus는 native PASS 아님 | ITEM/SKILL 데이터, QA 실입력 |
| ITEM / Codex | 전투 획득→가방→장착의 identity/자원 일관성 후보 | 기존 동일 장착 인스턴스 전승 후보 등 current loot/equip 접점. D13 미채택 schema 유지 | 소유/결정 총량·강화·악의 차감·정상 교체를 실제 source와 연결. alias의 정상 UI 도달은 별도 확인 | UIUX caller, BALANCE 수치, QA 획득/장착 |
| BALANCE / Codex | 현행 강화·자원 입력의 유한성/정상 차감 후보 | 기존 nonfinite AI 강화 후보 및 현재 구현 값. 새 공식·리밸런싱0 | 기존 수치·거절 조건·정상 trace/표시 정확 대조; VM timeout/대역을 실제 UI 재현과 구분 | ITEM 강화, UIUX 표시, 총괄 SSOT 동기화 |
| SOUND / Codex | 현재 타격/처치/보스 사운드의 실제 연결·청취 산출 또는 다음 좁은 오류 후보 | 채택된 queue finally 이후 feedback/수명. 이미 통과한 start/flush 검사 반복0 | 호출·배치 정리와 실제 청취를 분리. 실패 tail 폐기/동일Error가 실제 loop·RAF 회복을 보장한다는 선언0 | SKILL/ENEMY/BOSS 트리거, QA 단일 실행 슬롯 |
| STORY / Claude | 승인된 소개·첫 보스·재도전 lifecycle의 실제 wiring 후보 | 기존 대사/intro/중단·복귀. character text·새 서사 변경0 | 시작/중단/재진입에서 기존 cue가 빠지거나 중복되지 않는 실제 연결 근거 | BOSS/QA 경로, 기존 intro 자원 |
| QUESTNPC / Codex | 기존 진행/펫 가이드의 one-shot·중복/CD 연결 후보 | 현재 firstItem/urgent/mapQA 등 기존 helper·caller. 새 퀘스트/대사0 | helper 수락과 실제 DOM 발화 완료를 분리, 중복·CD·후속분기 계약 유지. 기존 통과fixture 반복0 | ITEM 획득, STORY/BOSS 진행, QA 실제 경로 |
| MARKETING / Codex | 현행 로컬 데모 반환·CTA·시연 설명 후보 | 기존 demo route/copy 및 확인된 주장. 외부 서비스/Steam 게시0 | 실제 시연 범위만 설명. source 경로/로컬 app ID 검증을 외부 상품 존재·성공 게시로 확대0 | BUILD 실제 후보, STORY/UIUX 로컬 흐름, QA 증거 |

## QA 실제 경로 6단계

| 단계 | 실제로 관측할 경로 | 남길 근거 |
|---|---|---|
| 1 | 기존 로비/캐릭터 선택에서 CH1-1 시작 | 후보 빌드·소스/입력 manifest SHA, 실행 조건, 진입/입력 상태 |
| 2 | 기존 적과 전투→처치→아이템 획득→가방/장착 | 입력·자원·명중/사망 표시·청취·아이템 identity. 단계별 source/실제 증거 구분 |
| 3 | 기존 진행으로 보스 게이트 개방·보스전 진입 | gate/unlock, 필드 적/오브젝트/진행 상태 기준값. 임의 새 조건/규칙0 |
| 4 | 보스전에서 플레이어 사망·기존 중단/복귀 경계 | 사망 직전과 이후 상태·자원/진행 관측. 보스 처치/클리어 분기는 별도 실제 관측 여부 표시 |
| 5 | 기존 부활 경로로 필드 복귀 | 개방 gate와 보존 대상 필드 상태가 SSOT대로 유지됨. EXP/자원/사망횟수/시간은 현행 계약, 임의 되감기0 |
| 6 | 보스 재진입·재도전 및 기존 반환/저장·재진입 경계 | 같은 후보에서 연결 성공/실패. 기존 격리 저장의 확인 여부를 명시하고 사용자 세이브/새 schema 변경0 |

실측 중 게임·빌드·인코딩·대형 에셋 작업은 기존 단일 실행 슬롯으로 조정한다. 실제 실행이 막히면 어느 단계/의존성이 BLOCKED인지 남기고 독립 소스·자원 작업을 계속한다. 같은 조건에서 의미 없는 반복 측정을 늘리지 않는다.

## 마일스톤 완료 판단

| 인수 층 | 필요한 증거 | 현재 판단 |
|---|---|---|
| source/docs | 실제 생산 접점·좁은 의미회귀·수치/이름/계약 SSOT·소유 범위 원격 checkpoint | 기존 인수된 boss 사망/필드복원 source와 SOUND `72fe` 큐 정리는 출발점. 전체 경로 완료 아님 |
| 로컬 빌드 | exact input/runtime/helper/output SHA와 실제 실행 가능한 기존 Mac 후보 | 새 완료/기동 시각 선언0. BUILD/QA 실제 산출로 판정 |
| 연결된 실제 플레이 | 위6단계가 같은 후보에서 진행되고 결함/중단/재도전 상태가 기록됨 | 미인수. 일부 source fixture PASS를 이 Gate로 대체0 |
| 화면·청취 | 실제 카메라/전투 가독성·입력·UI·효과·청취, MAP §23 실제 판정 | 미인수. source-sink·합성 GL/DOM/오디오 대역을 실게임/native/visual PASS로 표시0 |

진척은 팀별 `산출물 경로 → 제출 → source 인수/미채택 → 실제 플레이·화면·청취 인수/미검수 → 다음 독립 한 건`으로 보고한다. 완성되지 않은 단계에는 BLOCKED/미인수와 원인을 남긴다. 완료 후보/보고서 보존 커밋과 실제 게임 구현 완료를 합산하지 않는다.

## 기존 SSOT·보호 범위

- [팀 연속 진행](../../TEAM_CONTINUATION_POLICY_20261001.md), [맵 SSOT 읽기 순서](../../../4.1맵디자인+설정/_MAP_SSOT_INDEX.md), [맵 제작 가이드](../../../4.1맵디자인+설정/EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md)를 따르며 MAP 담당은 가이드를 처음부터 끝까지 읽는다.
- [CH1-1 보스 사망·진행 복원](../../../4.1맵디자인+설정/CH1-1_BOSS_RESPAWN_PROGRESS_20261002.md), [SOUND 배치 종료 계약](../../../6사운드디자인/SOUND_FRAME_QUEUE_EXCEPTION_FINALIZATION_20261002.md) 및 각 시스템의 현재 SSOT/LOCK이 source 인수 범위를 정한다. 해당 보고서의 역사 SHA·검사 결과는 당시 snapshot이다.
- 보호 `2_3 돌진+패링+방패시스템`·기존 LOCK·맵 geometry/배치·승인 콘텐츠·공식/수치·저장 호환은 임의 변경하지 않는다. 새 콘텐츠/규칙/리밸런싱/팀/설치/게시·사용자 세이브 변경0. 기존 TASK 소유 제한과 정책 거절을 이 목표 문서로 해제하지 않는다.

공식 배정·운영 상태·총괄 마스터/CHANGELOG/CONTINUOUS 기록은 총괄과 기존 작업감독의 별도 소유다. 이 문서는 목표와 인수 기준만 새로 추가한다.


### 2026-10-02 source4 Mac 후보 생성 시점 관측

97bb3ef9-fff2-4761-9841-e5a24a953847 앱은 codeca7e0bb0/원격backup e764ed33의 네sourcefix를포함한다. main e462f234…/easy68fa8e17…/index1dd28cab… 원문·stage·실앱동일, inputs7918/비파생7916/runtime334+메타6 exact. freshplan1/execute1 exit0/내부verify1/readinventory1, 별도verifier/재빌드0. regular8253+symlink5/7043803133B, 고유port3386/profile-save. 기존앱·user23·원자료·cache보존. 최종receipt743842ae…/20421B, configcdf9ba83…/3428980B. sourcefreeze는사본생성완료로해제한다. 생성 당시 실제앱기동/6단계플레이/visual/청취/영속save는0이었다. 후속 현행 native 부분 관측은 아래 2026-10-03 현행 절을 따른다. [현재후보정확계약](../../../13출시·마케팅/MAC_CH1_SOURCE4_CANDIDATE_20261002.md). 함께보존한BOSS철회/BALANCEGPnav원자료2는제품적용0이며readiness dee37149… exact2다. 감독단일오더전담/총괄생산·검수·Git 역할을유지한다.


### 2026-10-03 최신 오더 분담과 연속 실행

사용자가 완료 뒤 팀들이 계속 대기하는 문제를 지적하며 관리 담당 추가를 요청했다. 기존 감독의 업무를 둘로 나누며, 전문 제작팀15와 기존 Claude 실행세션8은 유지한다. 이 절이 이전 17역할 및 전문15팀 단일 송신 문구보다 우선한다.

| 담당 | 현행 소유 |
|---|---|
| 원총괄 | 생산 통합·정본 docs 동기화·의미 검수·Mac 앱·Git 원격 보존 |
| 기존 EXODUSER 작업감독 `01a0fb1e-4ec3-7dd3-bba2-f87518e881fa` | Codex7 UIUX/ITEM/BUILD/BALANCE/SOUND/QUESTNPC/MARKETING의 유일 오더 송신. 기존 STATE/LOG 소유 유지 |
| 새 EXODUSER Claude 오더 담당 `01a0fd2d-8a6f-7f01-b2da-70119654cffe` | Claude8 ART/MAP/SKILL/QA/ENEMY/ANIMVFX/BOSS/STORY의 유일 오더 송신. `supervisor/claude-orders/SUPERVISOR_STATE.json`·`SUPERVISOR_LOG.md`만 별도 소유 |
| 역할 집계 | 관리3+전문15=18. 새 제작팀·Claude 실행세션·resume 복제0 |
| 인계 | 기존 감독은 2026-10-02T15:12:50~51Z native1512 송신5 이후 추가 Claude 송신0을 공식 ACK. 원총괄이 새 담당에게 송신 소유 활성 메시지를 전달. 진행중1512·미소비 큐 재송신0 |
| 완료 뒤 | 승인된 다음 독립 실제 코드·콘텐츠 작업을 즉시 이어간다. 상세 생산 검수는 원총괄로 인계하며, 통합·다른 팀 완료·새 epoch 대기를 팀 전체 종료 조건으로 삼지 않는다 |
| 관리 회차 | 먼저 담당7/8의 실제 상태를 확인하고 종료·입력대기만 복구한다. 회차3분 내 종료/5분 점검 설정, 미준수 시 실제 누락 기록. 수신·Read·새 turn의 유용한 tool·완료를 구분하며 설정만으로 무지연이나 준수를 선언하지 않는다 |
| 보존 | 실제 Changes80부터 정확 완료 소유만 checkpoint/100전 새 산출 중단. 파일 여유가 없어도 승인된 출력 없는 독립 조사를 이어갈 수 있다. 제출 원자료 불변·반복당 최대3산출·기존 소유권 유지 |
| 남은 예외 | ART/MAP 기존 큐 미소비는 입력 필요이며 현재 착수 근거0. ENEMY 정책 읽기 Auto-Mode Bypass 자동 승인 거절은 우회0. 원총괄 앱3386 QA 독점·사용자 게임/세이브/옛 앱 보존 |

자동화3의 공식 tool 저장 후 실제 TOML의 name/prompt/status/주기/target/kind가 요청값과 모두 일치했다. `exoduser`는 기존 이름·ACTIVE5분·기존 감독 대상을 유지하며 Codex7 범위로 갱신, 새 `exoduser-claude8`은 EXODUSER Claude8 오더 점검/ACTIVE5분/새 담당 대상, `exoduser-mac`은 기존 이름·ACTIVE1분·원총괄 대상/18역할 통합 범위다. 알림 정책 변경0. TOML SHA는 각각 bfd845b459ac7fa499ba0b0b6836e302f0ad6432d735648581a2347ab51cbe24, e3379051b29343bbf7891428da505cbee1dff79578a57ac84b783c6502e719aa, 2f0576016b0c7073d834d8f678a1c1c9230adab8b902881e19a58c7078a9335c. 실제 다음 회차의 송신·Read·도구 실행은 별도 확인한다.

CH1-1 실제6단계·화면·청취 완료 기준과 source4 후보97bb3ef9의 입력은 유지한다. 이번 변경은 오더 분담·복구 운영이며 플레이 인수0이다.


## 2026-10-03 source4 후보의 실제 HTTP·합성 서버 저장 인수

| 항목 | 현행 결과와 인수 경계 |
|---|---|
| 고정 후보 | job97bb3ef9-fff2-4761-9841-e5a24a953847, 코드ca7e0bb0의 네 수정 포함. 같은 앱의 node-main.js를 표준 Node24.15.0 CLI로2회 실행; HTTP-only 관측 시점 새 NW.js GUI 기동0 |
| 실HTTP | 페이지3개 GET bytes/SHA exact, index HEAD length342119/body0, 선언 assets/lobby/11_loop.wav Range206/64B exact. 파일 응답만이며 오디오 decode/청취0 |
| 합성 저장 | slots[]·mats0 read, 숨김 _qa97bb_http_probe POST→실디스크312B JSON→load→own 서버 재시작→load exact·slots[]. 최초10+후속2=12독립PASS; 원10재실행0 |
| 잔존·종료 | ownPID40186/40912 SIGTERM exit-15·terminal, 마지막 LISTEN없음/SO_REUSEADDR bind free. QA파일1·app.nw/oauth-debug.log258B 유지, profile0/shared mats파일0/삭제0 |
| 원 관측 오류 | 최초 receipt success=false/Errno48은 종료 후 plain bind TIME_WAIT 메타오류. 원문 보존, 실제 서버10검수 실패로 확대0; 추가2와 종료 관측은 별도 restart-receipt |
| 정상 DEMO | main index.html?demo=1→game.html?test=1&slot=demo&demo=1→_startDemoNew/DEMO dbSave의 hellsave_demo localStorage. 이번 server-only 합성 저장은 실제 플레이 dbSave·DEMO localStorage 인수0 |
| 보스 사망 Gate | 정상 same-page retry는 기존 field restore 뒤 DEMO 저장. 해금 전 초기화/페이지 재입장 재생성 계약은 그대로이며 실제 사망→버튼→복원·native6단계/화면/청취는 미인수 |
| 보존 | source core5·protected64 exact, 기존 게임/세이브/앱/타인 WIP 보존. 생성 당시8253regular/5symlink/7043803133B는 snapshot이며 후속log1과 구분 |

서버 검수는 실제 제품 후보의 전제 검증이며 게임 목표 완료 건수는 증가하지 않는다. 두 오더 담당은 Codex7/Claude8 단일 송신을 유지한다. 실제 회차3분·점검5분 초과를 각각 기록했으므로 설정만으로 주기 준수·무지연을 주장하지 않는다. 이 서버검수 당시 UI 잠금해제 질문은 pending이었다. 후속16:54:50Z AX·화면 관측으로 그 대기는 해소됐으며 이후 실제 입력 차단과 구분한다. 중복 잠금해제 질문/GUI 우회0. 상세 후보 검수와 완료 원자료 보존은 총괄 소유 범위에서 이어간다.

[실HTTP·합성 저장 정확 보고서](../../../13출시·마케팅/MAC_CH1_SOURCE4_HTTP_SAVE_20261003.md). 같은 후보의 normal 연결6단계 실제입력 Gate는 계속 남는다.


## 2026-10-03 source5 인수 이력·source4 native 부분 진행

| 경계 | 실제 결과 |
|---|---|
| production source5 | 양판 gameConfirm 첫 줄 `if(_gcResolve)return Promise.resolve(false);` 각47B. 첫 확인 보존/새요청false. main4028953B/fd4e55dfefad0985870dc3f6dc1633793dad22e48ddb336dda881cdd4edbfe17; easy3906400B/db6019a1027464695fcc20b509db05f301eaf23ccc517a70ff8aedeadb61529c |
| source5 인수 당시 검사 | 신규reentry12/12PASS+정상순차4/4동일, 총20contexts. baseline12FAIL은 별도prototype. executableJS12/importmapJSON2 구문1회. 기존28검사 반복0 |
| native source4 | 물리 core5 고정인97bb 앱/PID48587/3386에서 정상새캐릭터맥검수→INTRO/안내→실습→정상skip→CH1-1필드 실제복귀. 실습W이동/dash 관측; 이동체크미완료/성공배지0 |
| 현재 입력 경계 | 16:54:50Z 후속 AX·화면 읽기 성공으로 이전 잠금해제 대기는 해소. 일반 필드 사망(0처치/HP0·몬스터 투사체)을 관측했으며 보스사망은 아님. 이후 Code 좌표/스크롤 입력은 noWindowsAvailable로 실패했고 키보드 포커스 전달도 미확인; 현재 OS잠금 재발로 단정0. 기존앱/게임상태 유지, source4앱에 source5가드 포함0 |
| 남은 목표 | 정상전투·획득/장착·4지역게이트·보스사망/부활·기존필드/보스문보존·재도전·청취·게임save/reload·전체8카메라 미검수, goal active/완료0 |
| native 저장 | 고유profile/정상새캐릭터생성 관측. own `_sharedMats.json`31B/악의999 생성도 관측했으나 player 전체save/reload 성공으로 확대0. 숨김합성QA312B보존 |
| 오더 운영 | 관리3+전문15=18. Codex7/Claude8 유일오더담당2명의 actual 후속송신·새source착수 인계. ACTIVE5/5분·총괄1분 설정은 무지연/주기준수 보증이 아님. GUI대기/거절보류를 전팀active로 보고0 |
| 보존 | source2/test1/관련docs9=12정확경로 checkpoint. 감독STATE/LOG·타인WIP·사용자23·source4앱 실물·보호2_3 유지. source/원자료 보존을 게임목표 완료건수로 계산0 |

[source5 정확계약](../../../2_7%20인벤토리+장비시스템/INVENTORY_JUNK_CONFIRM_REVALIDATION_20261002.md), [native 부분보고](../../../13출시·마케팅/MAC_CH1_SOURCE4_NATIVE_PARTIAL_20261003.md).


## 2026-10-03 후속 상태 정정·매일9시 보고

원격 source5 `bb0012354032d34f2a72aedb5681cbe79f7b47fe` 보존 완료.16:54:50Z 일반 필드 사망(0처치/HP0·몬스터 투사체)을 관측했으며 이전 잠금해제 대기는 해소됐지만 실제 GUI 입력 전달은 미확인이다. 정상 부활 버튼 시도는 복귀를 확인하지 못해 성공0, 보스사망/기존필드 보존·native6 목표는 미완료다. ART 기존 큐는17:01:55Z 소비됐지만17:05:23Z 직접 사용자지시 요구로 종료/source0; MAP 큐는 미소비다. QA·ANIM의 새 유용source와 STORY·BOSS의 실제 종료/후속은 단일 담당이 기록하며 전팀동시active로 계산하지 않는다. ENEMY·SKILL의 Auto-Mode Bypass 거절목적 우회0.

공식 `exoduser-9` heartbeat는 Asia/Seoul 매일09:00 원총괄의 한국어 HTML 작업·디자인 보고를 연결 Gmail 본인(`me`)에게 발송하도록 ACTIVE 저장/읽기 대조했다. 같은날 Sent 제목으로 중복을 막고 send_email 성공/messageID로만 실제발송을 판정한다. 예약설정 완료/즉시 시험메일0이며 실제첫발송은 미래 실행이다. 현재 사용자에게 ART 일반작업메뉴 Esc·MAP 최신본문/입력칸 선택만 요청했다. 설정만으로 무지연·5분준수를 주장하지 않으며 타인WIP/감독STATE·LOG를 변경하지 않는다. 정확 현행표는 PROJECT_MANAGEMENT_MASTER의 같은날 운영 정정을 따른다.


## 2026-10-03 source6 — 사망 혈흔 준비 목록

| 경계 | 정확 현재 값 / 근거 |
|---|---|
| production main | 4028973B / `1e4591caea739887ce749492db4ea72547292f583fba1f8e4fcafe88071f8bb8` |
| production easy | 3906420B / `17f490d5d5e38b0fac39085578115acd4b35e48263e84dd542b9a2f298e3ccf5` |
| index | 342119B / `1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7` 불변 |
| 실제 반영 | ANIM 완료 후보 중 실제 소비 `death_blood`만 양판 기존 준비 selector에 각20B 추가. `death_smoke` 소비0/미채택. source5 gameConfirm519B/함수SHA c058a9e17835372bbb9fad878f670bf814b4fef9eb945d9f11bfafb233ddbbd2 유지 |
| 검수 | 기존 combatTextureWarmup4/4PASS·양판 executableJS12/importmapJSON2 구문1회PASS·source5 전체 역치환exact. 준비 큐80/버퍼120/180f/유휴1장 및 혈흔 frame·blend·전투 수치 불변 |
| 실물 / 미검수 | 기존97bb/PID48587/3386 source4앱은 그대로이며 source5·6 포함0. native CH1-1 연결6단계·보스사망/부활 보존·재도전·청취·첫 처치 성능 개선 미검수. source 변경 건수와 playable 완료를 구분 |
| 최신 GUI 근거 | 본 회차 Code AX 요청에서 도구가 Mac 잠금을 명시적으로 확인. 이전 noWindowsAvailable 원인UNKNOWN 이력은 보존하되 현재 잠금 상태는 확인됨. 기존 잠금해제 질문은 대기 중이며 중복 질문0 |
| Claude 운영 | 담당 실제17:39 관측: QA/STORY 새 source 기록, BOSS 기존 CH1 후보 인계 수신. ART 직접 입력 대기·MAP 기존 큐 미소비. SKILL/ENEMY 감독STATE 읽기와 ANIM `_b3r` 생성/load/resize 소스 읽기 자동검토 거절은 보류. 전체8동시active로 계산0 |
| 보존 범위 | source2+관련docs10=12경로. root 예약13 이내, 새 전문팀 credit0. 감독STATE/LOG·타인WIP·사용자게임/세이브·보호2_3·고정앱 실물 변경0. 커밋/원격 성공은 별도 receipt의 exact SHA로만 판정 |

상세 준비 계약은 `docs/12퍼포먼스·최적화/COMBAT_TEXTURE_WARMUP_20260929.md`의 source6 보충을 따른다. 자동검토 거절 목적은 다른 도구·세션·대리 읽기로 수행하지 않는다.


## 2026-10-03 source6 최신 물리 시험 앱 생성

공식 새 job `3dd1813f-7e53-4987-acb4-03df340810a5`/port3387에 production source6(main4028973B/1e4591ca…·easy3906420B/17f490d5…·index342119B/1dd28cab…)를 고정했다. freshplan1→actualexecute1/내부verify1 exit0, 실제 source3 원문·stage·app exact, main/helper4 실행비트·arm64·plist 확인. regular8253+symlink5/7043803267B, 신규profile/save는 고유job 절대경로이며 user-state 미생성. 새download/install/sign/GUI기동/서버기동0, 기존97bb core5/own악의save31B·config/cache/사용자게임-save 보존. final receipt2842B/SHA297e8d1a254da30e5032dcf58648474c5c7cb5d734caf1a4585d22ec86f4852b는 ignored ch1-source6-build 경로에 있다.

패키지생성은 native6 완료가 아니다. Mac 잠금/기존해제질문 대기이며 정상전투·획득/장착·게이트·보스사망/부활·기존필드와열린보스방보존·재도전·실청취·player-save재시작·전체8카메라 미검수. 고정 source4 정상필드 부분관측을 새앱 검수로 확대0. 양판 스냅샷을 확보해 포장용 source freeze 해제. 실제 source와 runtime계약/정확fullSHA는 `docs/13출시·마케팅/MAC_CH1_SOURCE6_CANDIDATE_20261003.md`를 따른다.


## 2026-10-03 source7 레벨업·예약 투자 자원 갱신

| 총괄 결과 | 현재 인수 단계 | 남은 게이트 |
|---|---|---|
| source7 레벨 자원 | 양판 `addExp` 최종최대치갱신/현재자원보존과 본편예약투자보존 최소3곳 실제반영. 본편4029344B/e255bfd…/easy3906611B/11e0d9… | 신규 생산 회귀17/17 PASS·정본동기화 완료, Git스코프영수증 진행, [정확 계약](../../../14밸런스+수치테이블/LEVEL_UP_RESOURCE_REFRESH_20261003.md) |
| source6 Mac 앱 | root97bb 구앱정상Quit후새3dd1813f/3387실행. 정상로비·전사·이야기·안내·practiceSkip·CH1필드/공격637·XP2관측 | 보스방개방/보스사망·부활·재도전/장착/청취/저장재실행/8카메라미완. [부분실플레이](../../../13출시·마케팅/MAC_CH1_SOURCE6_NATIVE_PARTIAL_20261003.md) |
| 입력·팀운영 | 실제native입력진행뒤Mac잠금재발. Claude7개새업무source성공확인,ART로컬USER입력Gate유지 | 거절목적우회0,현재잠금해제요청중복0. 과거착수를현재8전체busy로계산0 |

production source7와 실행앱source6은구분하며, 원자료/검사보고/새앱생성을게임전체완료건수로합산하지 않는다. 팀신규credit0. root예약16을 소스2/test1/docs13 실제16경로에 모두 소비했으며 rootFutureRemaining0. checkpoint 전 actual87/worst95(QUEST2+STORY1+external5); 소비한16 중복가산0. 실제80부터완료본스코프checkpoint/100전새산출중단. 기존67보호파일byte보존·공유index/사용자세이브불변.


## 2026-10-03 source8 Claude ENEMY 특수 탄막 취소 실제 통합

| 결과 | 현재 인수 | 미완 경계 |
|---|---|---|
| 실제 production | Claude ENEMY 완료de1e281f…의 stun/freeze guard를 source7에 재기준화. 양판 각152B, main794d2927…/easy2ee66501… | [정확 recipe·핀·회귀](../../../9적ai패턴디자인/SPECIAL_SHOT_CANCELLATION_20261003.md); 신규 회귀22/22 PASS, Git 영수증 진행 |
| 보존·native | source7 자원 수정 함수 SHA/일반 helper·수치·포이즈·Q 전용 패링·타인 WIP 보존 | 실제 앱 source6/3387, Mac잠금해제 대기. 보스방·사망/부활/재도전·장착/청취/저장·8카메라미완 |

root상한14경로(소스2/test1/docs11)를 모두 소비했으며 rootFutureRemaining0. checkpoint 전 actual85/worst93(QUEST2+STORY1+external5), 완료본14경로만 checkpoint한다. 소비경로를actual에 옮기고 남은예약에서 빼며 중복가산0; 전문팀 새file credit0. 코드 후보/회귀를 게임전체완료로 계산하지 않는다.

## 2026-10-03 source8 최신 Mac 물리 포장·정상 도입 기동

| 현재 결과 | 정확 범위 | 인수 경계 |
|---|---|---|
| 새 source8 앱 | source/원격 `2e3edc320fa38562c0d65b52cdec825b63981a40`, job `96bf549c-5f0e-445b-84b4-a2a461a0747b` /3388. main4029496/easy3906763/index342119 원문·stage·app3 exact | default execute1/internal verify1, 입력7918/runtime340, regular8253+link5/7043804133B. PACKAGED_NOT_RUNTIME_ACCEPTED; extra7918 SHA0/재빌드0/download·install·sign0 |
| 보존·격리 | source4/source6 core/config/ownMats 포함15 pin exact, source6 ownMats33B 유지. 새 고유 절대profile/save/bundleID·loopback3388 | 19:00 물리검증과19:03:42 정상 Quit 뒤 새 user-state 부재; launch후 격리 상태 생성과 시점 분리. 포장 freeze 해제; source변경0 |
| 실제 native 부분 | source6 첫 Quit 뒤 getAX 관측 시 새 Renderer6276/3387 로비 재관측(내부 재기동 이유·인과 미확정), 두 번째 정상 Quit 후 old88947 gone·3387 noListener·protected15 exact. source8 exact앱 정상기동1, Renderer7154/3388 LISTEN·GETslots ok empty, 정상 entry/audio title/anykey→월드인트로(root 전달) | 실제 청취0/보스방·사망·부활·재도전·장착·player저장재실행·8카메라0; native6/제품완료0 |

source6 부활버튼 입력 반영 미확인과 coordinate noWindowsAvailable의 원인은 UNKNOWN이며 정적 버튼 결함으로 확정하지 않는다. 메뉴 열림은 실제 확인됐고 옛18:25 Maclocked 관측과 현재 원인을 구분한다. 기존 unlock 질문 재질문0. source7 기존17/17·source8 기존22/22 검수근거 재사용/이번재실행0; 원자료·구보고서·과거앱 관측을 새제품 건수로 합산0. [정확full64·파생node/package·실물/초기native 증거](../../../13출시·마케팅/MAC_CH1_SOURCE8_CANDIDATE_20261003.md).

- Claude3 기존 실제작업 확인과 idle4 원총괄 구체목표 확정을 구분하며, 정식 과제 전달과 actualsource 확인을 따로 기록한다.
- idle4의 기존 BOSS summon finally70f /ENEMY+ANIM 표시전용 wind timer·helper /MAP 로드실패1회 재시도는 메모리후보·production 미적용/신규file credit0이다.
- ART localhuman·기존3 deny 목적hold·우회0/역할18 유지. root예약 docs6만 소비: root제공 actual71→예상77/rootremaining0/worst85 basis, 소비중복0. 기존5 backup/EOL·prefix byte보존 append, WIP67·Git/index·GUI·shared STATE/LOG 쓰기0; 소스+docs 원격확인은 root 별도.

## 2026-10-03 source8 후속 정상 캐릭터·전사 이야기 부분 관측

root의 후속 실제 입력에서 월드 인트로 자연종료→DEMO 환영/입장→정상 전사 선택→이름 `맥검수8` 생성 UI→전사 이야기의 실제 자막·영상 재생을 관측했다. 개별 char-preview AX의 `미디어를 재생할 수 없습니다.`와 전사 story 영상의 실제 재생을 구분하며 전체 codec 불가로 확대하지 않는다. `02-warrior-story.png`는 589090B/SHA `6d2922a79c7a12256d94c7e853805ed21e22e1a50b133431358ddeaaf206604a`이며 ignored `tmp/mac-migration-runtime/continued-review-20261003/source8-native-play/`에 있다.

이야기 다음 버튼50이 자연 전환 중 사라져 stale 오류1이 발생했고 root가 새 AX를 취득해 정정했다. 게임 코드 오류 확정0이며 이야기 A 단축키1 뒤 AX 변화0, 그 이후 입장은 아직 인수하지 않았다. 실제 음향 청취0/보스방·사망·부활·재도전·장착·player 저장재실행·8카메라0/연결6단계 미완을 유지한다. 포장 상태 **PACKAGED_NOT_RUNTIME_ACCEPTED**와 [정확 물리·부분 native 보고](../../../13출시·마케팅/MAC_CH1_SOURCE8_CANDIDATE_20261003.md)를 유지하며 이 후속 관측은 문서 담당의 새 GUI 검사가 아니다. root예약6 범위·71→77예상/rootremaining0/worst85 basis는 변하지 않는다.

## 2026-10-03 source10 최신 Mac 물리 포장·정상 초기 기동 — 실게임 인수 대기

| 최신 경계 | root 실제 결과 / 未인수 |
|---|---|
| 고정 입력 | checkpoint/원격 `0538cf32b35cbcdae2da7453f27059ae1ea4c411`, main4029803/a0eab60f…·easy3907070/ebaacc36…·index342119/1dd28cab… 원문=stage=app exact. 기존 생산28/28·12JS+2JSON 근거 재사용/이번 재실행0 |
| 새 실제 앱 | job `9b0d6558-50e9-4333-a735-eff40ae8fc56` /loopback3389. fresh plan1/default execute1/공식 내부 verify, exit0/stdout951B/stderr0/fixtureOnly false/packageCreated true. **PACKAGED_NOT_RUNTIME_ACCEPTED** |
| 실물·격리 | inputs7918/runtime340, regular8253+link5/7043804747B. 서버3389/saveRoot 외 역치환 exact·stagepackage plan exact·apppackage 공식 product_string1차이, main+helper4 arm64/0755/runtimeSHA exact. UTC20:39:22 물리 영수증 시점 새user-state absent/portfree |
| 검수 경계·보존 | root 최초 inspection assertion3은 기대product_string·실제helper경로·rename 가정 정정이며 gamefail/재빌드 아님. 기존 cached NW0.111.2 arm64/nw-builder4.17.10/원앱·profile-save 보존, 새download/install/auth/permission/sign0·추가7918/구8253 감사0·전역source변경0 |
| source8 후속 | 정상 guide→practiceSkip→CH1 Lv1·0/32 표시 필드, 조사 중 idle 일반필드 투사체 사망/0처치. 보스 사망0. 정상 Cmd-Q 뒤 CUA runningfalse/PID7118gone/3388noListener(root 전달). screen05 916050B/e365220a… |
| source10 정상 초기 기동 | root exact앱 CUA launch1→3389/index.html?demo=1→Enter→world intro 영상 실제 재생/AX World intro. UTC20:40:26 Renderer36721 IPv4loopback3389 LISTEN·GETslots ok[], ownprofile/saveRoot 생성. 기동 전 user-state 부재와 시점 분리 |
| 저장·제품 Gate | DEMO hellsave_demo→로비 활성 hellsave_demo_i 병합 계약. backend slots empty만으로 저장 실패 판정0. source10 초기기동/인트로 부분관측만; 캐릭터등록·필드·연결6단계·보스 사망/부활·재도전·장착·실청취·player저장재실행·8카메라 未인수/PASS0 |

root `ch1-source10-build/physical-receipt.json`3996B/SHA `440724315b1ce93e0cc8bdf055442a2062a1fb27d389c6ac87358099ff09fe5f`를 재사용한다. 기존source8/6의 날짜별 원문·검수 건수는 보존하며 이번 source10로 치환하지 않는다.

[source10 고정full64·정확 파생·포장 영수증·후속 source8 이력](../../../13출시·마케팅/MAC_CH1_SOURCE10_CANDIDATE_20261003.md)을 따른다. root 예약4를 실제 직렬 적용(actual71→75/max83 기준), 기존3 prefix/EOL·보호67/WIP·운영STATE/LOG 보존. 문서 담당 tracked/Git/앱/서버 쓰기0이며 root가 직렬 적용하고 후속GUI는 별도 시점 append한다.

## 총괄 직렬 적용 및 초기 인트로 후속 관측

| 항목 | 직접 관측·범위 |
|---|---|
| source10 인트로 후속 | 총괄 CUA의 새 화면에서 영상이 자연 종료한 뒤 한국어 `데모버전에 오신 것을 환영합니다` / `데모버전 입장하기` 정상 UI를 확인. 아직 캐릭터·필드·보스전 완료0 |
| 초기 기동 영수증 | `boot-observation.json` 836B / SHA `09eab0ea6f75084171c0d030bd5cb42db732581e62644882a2208dbd60d8dba5`; UTC20:40:26Z의 launch·World intro·loopback3389 및 새 job 상태 생성 |
| 후속 화면 | `source10-native-play/02-demo-welcome.png` 584948B / SHA `8d420aff65e2a35b6228c619e44b9651d05ffa3fbae64e2b45b27fa29779142e`; 현재 동일 source10 앱 정상 UI, 실청취 미인수 |
| 문서 적용 시점 | UTC `2026-10-02T20:46:23.274640+00:00`; 직전 NUL `--untracked-files=all` 실제71 + 예약4 + 외부8 = 최대83. 이번4 적용 시 실제75/예약0/최대83, 완료소유4만 별도 checkpoint. protected67 exact·기존3 prefix/EOL 보존 |
| 검수 상태 | **PACKAGED_NOT_RUNTIME_ACCEPTED**. 영상 종료를 native6·combat·장착·보스방 개방·boss death/revive·saveRestart·visual PASS로 확대0 |


## 2026-10-03 source11 실제 별도 Mac 앱 — native 잠금 대기

source11 코드 checkpoint `efb3bb7e02a9ab161e92d9ff3da7229b4cf884cd`의 원격 exact 후 기존 selector7918/runtime340를 유지한 공식 PLAN/기본 EXECUTE exit0로 고유 앱 job `2a937fde-3322-492f-bef4-32dfa78a1d69`/3390을 생성했다. 상태는 `PACKAGED_NOT_RUNTIME_ACCEPTED`/fixtureOnlyfalse이다. source3 원문=stage=app, 파생 node/package, main+helper4의 arm64/0755/runtime/plist를 좁게 확인했고 전기동 user-state 부재·3390 free를 기록했다. physical receipt12299B/SHA `1b1c2bf34824d35bffd4bbf9ff22323f8fc9c72616be0e7506064fd876ee8e76`.

실제 CUA Mac잠금 오류로 oldsource10 Quit도 미전달, 사용자 unlock 요청 대기다. 기존 own3389 설정 정지·profile/save를 보존하고 새앱 기동은 아직 하지 않았다. source10 동일 캐릭터/장비 재실행 복원은 부분 인수이며 source11 난이도 재실행·처치/획득·보스방 개방/보스 사망 후 맵 보존/재도전·청취/visual은 미완료다. 상세 핀·artifact·미인수 경계는 `docs/13출시·마케팅/MAC_CH1_SOURCE11_CANDIDATE_20261003.md`에 정리한다. 정확root4(new1/existing3)만 완료 checkpoint하며 새 팀·설치·승인 우회·세이브 직접수정0.


## 2026-10-03 source11 실제 기동·동일 앱 난이도 재실행 인수

이전 잠금 대기 절은 당시 시점의 이력이다. 이번 정상 입력·Quit 관찰로 Mac 잠금 대기는 해소됐으며 source11 앱은 실제 기동·재기동했다. 전체 제품 상태는 계속 `PACKAGED_NOT_RUNTIME_ACCEPTED`이며 설정 재실행 1경로만 실제 부분 인수한다.

| 항목 | 직접 관측·완료 경계 |
|---|---|
| 고정 앱/소스 | job `2a937fde-3322-492f-bef4-32dfa78a1d69`, loopback3390, code checkpoint `efb3bb7e02a9ab161e92d9ff3da7229b4cf884cd`; 앱·source3 변경 없음 |
| 정상 생성·시작 | 한국어 로비→전사 `맥검수열하나` 신규 생성→이야기/시작 안내→정상 연습 건너뛰기→CH1-1 Lv1·XP0/15·지역0/32·악의1000. 최초 HP557/557·MP306/306·SP282/282·CP1689는 관측값이며 새 기본 수치 정책이 아님 |
| 종료 전 설정 | ESC 설정 난이도 슬라이더5·일반. 정상 캐릭터 선택(로비)으로 저장하고 캐릭터 카드 확인 |
| 정상 종료 | 동일 앱 Cmd-Q 후 UTC2026-10-02T21:31:02.561051+00:00에3390 noListener 확인. 강제 kill·사용자 게임 조작0 |
| 같은 앱 재실행 | 동일 앱 정상 실행→저장된 `맥검수열하나` 선택→입장→ESC. 난이도 슬라이더5와 실제 화면 `일반` 유지. **신규5→저장→종료→재실행5 PASS**, source10의5→10 오류 경로 해소 |
| 화면 증거 | ignored `source11-native-play/04-after-restart-difficulty-visible.png` / 660153B / SHA `94e361b58643eb7321a32bb2504312eedd558c23e8bdf59f57bcd0065334d953`. 02/03은 설정 시스템 섹션 화면이며 화면상 난이도 항목 증거로 확대0 |
| 관측 영수증 | ignored `root-source11-native-resume/native-restart-observation.json` / 1316B / SHA `e8de494846a014b3da9212a2203040ac5edf7f14cecd1363d269d97bbf315119` |
| 아직 미인수 | source11 실제 처치·획득·장비/가방 재실행 값·필드 앵글러4·보스방 개방·CH1 보스 사망 후 맵/몬스터 보존·재도전·실청취·8카메라 visual. 설정 PASS를 native6·보스 coregoal 완료로 확대0 |

실제 후속 관측 기록4개만 갱신한다. 기존 앱/profile/save·보호67·타인WIP·감독 소유STATE/LOG를 보존하며 이전 검사·패키지 전수감사 반복0.


## 2026-10-03 source15 최신 Mac 패키지 — 실제 플레이 미인수

최신 제작본은 job `a1488887-2fbf-48e0-b006-7b28b4c19976` / 격리3391 / source `050a227600116f13d8cd4443ef342ea270e321c4`다. 이전 dated source4/source8/source11 앱·지문·부분 native 기록은 당시의 보존 이력이며, 최신 **포장** pointer는 [source15 정확 계약](../../../13출시·마케팅/MAC_CH1_SOURCE15_CANDIDATE_20261003.md)이다. 최근 실제 플레이 관측은 source11/3390 보고에 남아 있다.

| 항목 | 이번 실제 결과 |
|---|---|
| 제작 | UTC2026-10-02T23:08:05.173Z, 신규 plan1/execute1, PACKAGED_NOT_RUNTIME_ACCEPTED·fixtureOnly=false·packageCreated=true |
| 입력/런타임 | 기존7918 selector와 공식 cached0.111.2 arm64/runtime340 재사용; 새 source15 main/Easy·index의 source=stage=app3 exact |
| 실물 | 비파생7916/파생 node-main·package/실행파일+helper4 검증; 후속 물리 영수증19113B·SHA bb51f0e1cad3e7755dd0916fb6848a601ab7c94ae4b9c7394c017062b5cad180 |
| 제작 보존 | ignored 사본에서 시작 output 삭제·실패 job 삭제만 제거·빈 고유소유 output 검사; 공유 builder 불변/삭제0 |
| Native | Maclocked AX 읽기 UTC23:10:05/input0·새 앱 기동0·새 profile/save 미생성. source11 앱/save 보존, 보스방·사망·부활·재도전 등 연결 검수 미완 |
| 문서/Git | docs전체554행/47문서 검색·날짜별 역사 보존, own6만 동기화/타인67와 감독 STATE/LOG4 보존; 완료 own6만 원격 checkpoint |

source15 생산 장비 해제 검증48/48은 기존 실제 코드 결과이며 이번 제작 때 재실행0이다. 최신 패키지 생성과 전문7팀의 새 코드 조사 착수를 게임 연결 완료로 계산하지 않는다. Mac 잠금 질문은 기존 질문을 유지한다.

## 2026-10-03 source16 현행 Mac 패키지 — 실물 확인, 플레이 미인수

현행 포장본은 장비 원자적 자원 갱신을 포함한 source `8883c59cb18e4c1bd3ad5cb83911fbe07242df12`, job `00072ed5-e133-4c61-9c39-59dd6271c0d5`, 격리 포트3392다. 앞선 날짜별 source15/3391·source11/3390 기록은 해당 버전의 보존 이력이다. 현행 생산 코드와 포장본은 이 시점 source16이며, source17 천공쇄기 메모리 후보는 포함하지 않는다.

| 항목 | 실제 확인 |
|---|---|
| 제작 | UTC2026-10-02T23:49:39.066Z, execute1·내부 plan1, 별도 plan/재빌드0. PACKAGED_NOT_RUNTIME_ACCEPTED·fixtureOnly=false·packageCreated=true |
| 사본 | 입력7918 중 비파생 payload7916의 새 stage/app 각1회 SHA·경로 검수 PASS. main/Easy/index 원본=stage=app3 exact |
| 파생·실행 | node-main·package 파생2 exact, node-main 전체 역치환으로 원본 복원. arm64 MachO 실행 파일5 SHA·0755·plist ID exact. 기존 공식 cached NW.js0.111.2/arm64/runtime340 재사용 |
| 증거 | physical-receipt.json 21238B·SHA c6787f69c3caee2730a29258e344fa39098baf92f08d022427881ad006690f97; 옛7918 inventory·옛검사·추가 build/API 재실행0 |
| 보존 | 고유 owner UUID/dev-ino 유지·cleanup/delete0. source11/15 기존 앱 존재·plist ID 확인. 사용자 이전59376baf/08cac1ce 앱은 정확 경로 미확보로 보존 확인 UNKNOWN, 변경0 |
| 실제 플레이 | source15 정상 새전사→CH1 LV1/지역0/32→보스방 이전 일반 필드0처치 사망은 별도 부분 이력. 이후 Maclocked 관측으로 부활 입력0. 새 source16 앱 기동/GUI/native0·새 profile/save 미생성 |
| 남은 인수 | 새 앱의 전투·획득·장착·4지역 정화·보스방 개방·보스 사망/부활/재도전·실저장·시각/청취는 미완. 장비 actual-source47/47은 이미 완료한 코드 검증이며 이 패키지 검수에서 재실행0 |
| 문서·Git | 관련 docs 전체440행/46경로 검색, 날짜별 역사와 관리자STATE/LOG4 보존. 완료한 root docs6만 scoped checkpoint·원격 정확SHA 대조, 보호 타인67 보존 |

[현행 포장본 상세 계약](../../../13출시·마케팅/MAC_CH1_SOURCE16_CANDIDATE_20261003.md).

## 2026-10-03 source17 현행 Mac 패키지와 정상 부활 부분 관찰

현행 생산 code source17(천공쇄기 필드 타격 수정)의 체크포인트는 `84e122699c0bbfcf5a3e7a84eff0d87bb9369b45`다. 새 패키지는 이후 메일 기록을 포함한 입력 Git `411c049db8b97ba0eafbe5e81cda4306b1325461`, job `7aa83459-0b98-44c1-a7d5-35903d9acbee`, 포트3393이다. source16/3392와 source15/3391 패키지는 이전 버전으로 보존한다. 과거 Maclocked 관측은 이력이며 최신 source15 정상 부활 입력은 실제로 동작했다.

| 항목 | 실제 근거·완료 경계 |
|---|---|
| 새 제작 | UTC2026-10-03T00:19:06.104Z; root execute1·내부 plan1·별도 plan0, PACKAGED_NOT_RUNTIME_ACCEPTED·fixtureOnly=false·packageCreated=true |
| 입력·사본 | selector7918/runtime340 재사용·main/Easy핀2 갱신. 새 stage/app 비파생7916 각1회 SHA·커버리지 일치, source3=stage3=app3 exact |
| 실행 계약 | 파생bootstrap2 exact·node-main 전체역치환 원본복원, arm64 MachO 실행5 SHA·실행권한·bundle plist exact; 새 owner UUID/dev-ino 유지 |
| 실물 영수증 | physical-receipt.json 22233B / SHA256 `dd0c95f0d3b97192be783f97201b66e1fbaca345c3675cf4923235ac35ff529f`; 새 패키지 실물 확인이며 실제 플레이 PASS가 아님 |
| 코드 검증 | source17 actual-source20/20·fixture0 및 JS12/JSON2는 앞선84e1226 코드 검증. 이번 패키지에서 반복 실행0. source16 장비47/47·source15 해제48 검사를 새 플레이 증거로 계산0 |
| 정상 부활 부분 | 별도 own source15/3391에서 사망 버튼 “다시 일어서라”로 정상 일반필드 부활. 실제 화면 HP565/565·MP394/394·SP226/226·LV1·EXP0/15·지역0/32·SW물13M, 이후 Settings 일시정지. 난이도 표시는 일반(5) |
| 관찰 한계 | source15 living pixel timer00:00·AX stale00:18은 구분하고 pixels 우선. 보스방 이전 일반 사망/부활이므로 보스 사망 맵·몹 보존 회귀 검증이 아님. screenshot 저장 fs미정의1은 캡처·UI 성공 후 발생, 기존 버퍼 import 복구로 보존 |
| 새 앱 인수 | source17 앱 GUI기동/native/시각/청취0, 신규 profile/save 미생성. 같은 source17의 전투→획득→장착→4지역→보스 사망/부활→재도전·실저장·청취는 아직 미완 |
| 보존·동기화 | 기존source11/15/16 앱 존재·plist ID 유지·사용자 앱/세이브 변경0. 과거 사용자59376baf/08cac1ce 정확 앱 경로는 UNKNOWN. docs 전체 1470행/179경로 검색 후 현행 root6만 추가, 보호67/관리자4/기존 WIP 보존 |

[현행 source17 포장본 계약](../../../13출시·마케팅/MAC_CH1_SOURCE17_CANDIDATE_20261003.md).

### source17 포장 기록 이후 실제 정상 기동 관찰

2026-10-03 KST 새3393 source17 앱을 정상 실행해 `index.html?demo=1` 타이틀과 “아무 키나 눌러 계속”, 입장 버튼·한국어 선택 표시를 실제 화면/AX로 확인했다. 위 표의 GUI0·profile 미생성은 포장 검수 시점의 역사다. 새 관찰은 정상 타이틀 기동만 인수하며 CH1 전투·보스·저장·청취 완료가 아니다. 증거는 `tmp/mac-migration-runtime/continued-review-20261003/source17-native-play/startup-receipt.json` 및 `01-normal-startup.png`다. 사용자 기존 앱/세이브 조작0.

### 2026-10-03 source17 정상 CH1 전투·드롭·장착 부분 검수

동일 source17/3393 별도 앱에서 정상 데모 로비→신규 전사 `맥검수열일곱`→캐릭터 이야기→안내/실습→CH1 필드를 실제 입력으로 진행했다. 이 관찰이 위 정상 타이틀 기동만 인수한 기록 이후의 최신 상태다. 생산 코드 변경0·외부 게임 상태 주입0이며 일반 난이도5를 유지했다.

| 실제 항목 | 관찰값·완료 경계 |
|---|---|
| 정상 전투 | 첫 시도는0처치 투사체 사망. 정상 부활 이후 처치0→4→15→18, LV1→2, EXP3/20, 최대콤보14 관찰. 남서 물 진입과0/53→18/53 처치 표시를 확인했으나 지역 클리어는 미완 |
| 드롭 획득 | 실제 R 입력 뒤 `일반 낡은 망토 획득!` toast, 가방10→12. 일반필드 두 번째 사망과 정상 “다시 일어서라” 이후 LV2·EXP3/20·악의13066·가방12·장비 보존 관찰 |
| 정상 장착 | 실제 획득 망토 DEF20/ST33/HP44/회피쿨다운−11.23%를 장착. 이전 망토 DEF21/ST44/HP17/회피쿨다운−7.28%는 가방으로 교체되며 총12개 유지 |
| 장비 자원 부분 | 장착 후 pixels HP543/575로 현재HP543 유지·MP468/468·SP291/291로 새상한 clamp. source16의 실게임 단일 조건 부분 증거이며 장비 전체 회귀 PASS가 아님 |
| 비교 표시 문제 | 장착 전 CP1841·미리보기−20, 실제장착 CP1834(−7), 역비교+19. 미리보기와 실제 차이가 불일치하므로 비교 UX 인수 미완·Codex UIUX에 소유 후속 인계. 새 수치 설계/수정은 아직0 |
| AX와 pixels | 장착 직후 field AX에는 HP543/543·SP302/302·CP1841이 남았지만 pixels는 HP543/575·SP291/291·CP1834. 이 구간은 pixels를 실제 관찰 기준으로 사용하며 stale AX 값을 현행 게임값으로 기록하지 않음 |
| 실패·남은 검수 |18처치 이후 중독/화상/투사체로 일반필드 사망. 보스방 이전 일반사망이며 보스전 사망 맵/문/몹 보존을 입증하지 않음. 동일후보4지역 클리어→보스방 개방→보스 사망/부활→재도전, 실제 저장 재로드·청취·시연 완주는 아직 미완 |
| 보존·증거 | 사용자 기존 게임/세이브 조작0·새 후보 Settings 일시정지. 04-normal-combat-west.png는 이름과 달리 첫 일반필드 사망 증거이며 전투 PASS로 계산0. 코드/기존검사 반복0. 근거 normal-play-receipt.json 5434B / SHA256 `dcbc2be6cf93ef57af5f328fcd74a9f42ed2710c1d5acc59bf467d986eaa91f0` 및 source17-native-play/02~12 PNG |
| 문서 범위 | docs 전체 관련검색 496행/116경로. 생산값 변경0이므로 과거 이력/확정 수식은 보존하고 현행 native 인수6문서에 이 관찰만 추가. 보호67와 관리자 STATE/LOG4를 편집하지 않음 |

검사 보고서와 부분 플레이 관찰을 게임 완성 건수로 계산하지 않는다. CH1-1 끊김 없는 시연 목표는 계속 진행 중이다.


## 2026-10-03 source19 Mac 격리 검수 앱 — 포장 확인 / 실제 플레이 미인수

source18 투사체 kbMult 초기화와 source19 실제 장착 CP 미리보기·정렬 수정을 함께 담은 새 Mac 실행본이다. 코드/문서 원격 보존 source commit은 9dabfedeb5e095525d5d4c9c3f3c122b7ecab79b; 과거 source17/3393의 실제 LV2·18처치·망토장착 부분 검수와 별개의 후보다.

| 항목 | 실제 포장 검수 결과 / 남은 경계 |
|---|---|
| 앱 | /Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-9cc552c5-3e13-41d6-886a-bc941952b474/package/EXODUSER-9cc552c5-3e13-41d6-886a-bc941952b474.app |
| 고유 식별 | job 9cc552c5-3e13-41d6-886a-bc941952b474 / bundle com.exoduser.mac.9cc552c5-3e13-41d6-886a-bc941952b474 / port3394. 기존 source11/3390·source15/3391·source16/3392·source17/3393 앱 및 profile/save 존재와 앱 plist ID만 읽어 대조, 사용자 내용 읽기/변경0 |
| 코드3 | game.html: 4031343B / SHA256 83b8db65f0f9abdf4f227c44101d7f6e6fe4cb573891af4ba5fc3896a00be11c<br>game-easy-test.html: 3908622B / SHA256 bb9c147435d39ef07bd8eae56fb7c667138e03a3a0c93cb7a7c95435e128a735<br>index.html: 342119B / SHA256 1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7 |
| 정확 복사 | 입력7918 중 파생 package.json/node-main.js 2개 제외7916파일, stage와 앱에서 각 SHA256 전수 대조1회. 한 사본 6645483913B. source→stage→app의 코드3은 byte-exact |
| 파생 서버 | 원본 node-main.js에서 PORT3333→3394·SAVE_DIR→새 고유 job/user-state/saves만 변경. 전체 역변환은 원본과 정확히 일치. 기존 server/PC/사용자 세이브 조작0 |
| 파생 실행 설정 | main=http://127.0.0.1:3394/index.html?demo=1, node-remote는3394 loopback2개, profile는 고유 job/user-state/profile. 원본 package.json 변경0. 앱만 product_string에 고유 ID 추가 |
| 런타임 | 기존 NW.js0.111.2 arm64/Chromium148.0.7778.97/내장Node26.0.0 재사용. 실제 main+helper4 실행파일의 runtime SHA·실행모드·Mach-O arm64·plist executable/ID5개 검증. 설치/다운로드0 |
| 저장/실행 | 2026-10-03 01:46 UTC source19 고유 앱을 최초 정상 기동하고 demo 타이틀 화면·AX와 전용 서버 HTTP200을 확인. GUI 키/클릭·캐릭터 생성·저장/재개·게임 전체 native 인수0. 최초 포장 당시 profile/saves 미생성 기록은 당시 이력 |
| source 회귀 | source19 CP14/14 PASS·원본 source18 0/14 PASS, 양판12JS+2JSON 문법 PASS. 실제 함수를 isolated VM에서 사용했고 DOM/오디오/저장 I/O는 fixture. source18의8검사는 당시 원격 checkpoint 근거로 보존·이번에 반복0 |
| 불변/미완료 | 보호67·관리자 STATE/LOG4·source17 paused 검수게임/세이브 보존. Mac 잠금해제 답변 대기. source19 정상 시작→전투/획득/장착→4지역/보스문 개방→보스사망/부활→재도전·저장 재개·시각·청취는 미완 |
| 실제 의미 | 장비 교체 예상 CP가 최종 HP/MP/ST·강화이전·결정전승·비용/레벨 거절을 반영하도록 수정한 코드가 새 실행본에 들어갔음을 확인. 실게임의 동일 망토−20 대 실제−7 오차가 source19 화면에서도 해소됐다는 주장은 아직0 |
| 근거 | tmp/mac-migration-runtime/continued-review-20261003/ch1-source19-build/{preflight.json,execute-result.json,physical-receipt.json}. physical receipt 22968B / SHA256 4bd34c823ac31917f5244e3a52f0bdd752ebbefc73c6eb6eed6956ec6800f8f1. 새 입력7918/런타임340 검증은 기존 no-cleanup adapter 실행1회, 실패 새job 삭제0 |

원래 사용자 앱 UUID59376baf/08cac1ce의 정확 경로는 과거 인수 자료에 없어 이번 보존 대조는 UNKNOWN이다. 해당 앱/프로필/세이브를 찾아 추측하거나 조작하지 않았다. 포장만 완료한 후보를 CH1-1 게임 시연 완료로 계산하지 않는다.


## 2026-10-03 source19 실제 기동 — 타이틀·전용 서버 확인

| 항목 | 이번 실제 관측 / 남은 검수 |
|---|---|
| 고유 앱·서버 | 기존 검수 package job9cc552c5-3e13-41d6-886a-bc941952b474 / bundle com.exoduser.mac.9cc552c5-3e13-41d6-886a-bc941952b474 / port3394. 공식 cua.getApp(exact app path)으로 최초 background 기동, 설치·새 빌드·원본 실행 설정 변경0 |
| 실제 화면 | 127.0.0.1:3394/index.html?demo=1, HELL: EXODUSER의 타이틀 이미지와 ‘아무 키나 눌러 계속’ 표시를 AX+2704×1696 JPEG에서 확인. 앱 기동 성공이며 게임 진입·전투·CP 수정 화면 검증은 아님 |
| HTTP | index.html?demo=1·game.html·game-easy-test.html·/api/slots 모두200. 본편4031343B/83b8db65f0f9abdf4f227c44101d7f6e6fe4cb573891af4ba5fc3896a00be11c, Easy3908622B/bb9c147435d39ef07bd8eae56fb7c667138e03a3a0c93cb7a7c95435e128a735, index342119B/1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7. 두 게임 HTTP 응답은 현재 source와 byte-exact |
| 슬롯 API 경계 | /api/slots는 {"ok":true,"slots":[]} 반환. 새 고유 서버의 빈 파일 슬롯이며 demo localStorage 저장 성공/실패 또는 기존 사용자 슬롯 초기화 근거로 사용0 |
| 입력·보존 | GUI 키·클릭 입력0, 캐릭터 생성0, Mac 잠금해제 확인0. 타이틀 screenshot을 잠금해제 증거로 간주0. source17 검수게임/기존 앱·세이브 조작0 |
| 미완 GATE | 정상 새 캐릭터 시작→전투·획득·장착→4지역/보스문 개방→보스전 사망·부활→재도전·저장 재개/CP 실제 화면/청취는 미완. source17 부분 플레이와 source19 타이틀만을 합산해 같은후보 전체 인수로 계산0 |
| 근거 | tmp/mac-migration-runtime/continued-review-20261003/source19-native-play/{01-title-ax.txt,01-title.jpg,startup-receipt.json}. JPEG SHA2567d8c821254a88118f955e3e00ec8bad8000fdc9c14b1a4888d644ab62773958f, AX SHA2566b8af2c9fd3cd3cede6bbf8118bbd4ae4a53e09566b98e8b22345ce9f74fc042. HTTP 실제 관측01:46:25 UTC |
| 이번 고유 user-state metadata | source19 전용 profile·saves 디렉터리 생성 확인. 디렉터리 존재만 조회했고 내부 사용자/세이브 내용 변경0. 슬롯0은 위 신규 서버 관측 |


## 2026-10-03 source20 Mac 실행본 — 포장·정상 타이틀 기동

| 항목 | 현행 상태 |
|---|---|
| 후보 | job 63a5fffc-613c-4e30-a7c7-5ead3506e3b9 / port3395 / source commit 7d8b6b0236cdb504d90924dab4b30f9401dbb0ed. source20 뇌전창+source19 CP+source18 넉백 수정 포함. 기존 앱/세이브 보존 |
| 확인 | frozen7918/런타임340 실행1회, payload7916 stage/app 정확 복사, bootstrap2·arm64실행파일5 확인. 새 앱 실제 타이틀·전용HTTP4개200, 응답source3 byte-exact |
| 남은 검수 | 입력 잠금해제 확인 대기; 새캐릭터·전투/획득·4지역/보스문·보스사망/부활·재도전·CP화면·저장/청취 미완. 기존검사 반복0·GUI입력0·사용자게임/세이브조작0 |

자세한 앱·저장경로·코드 SHA·physical/native 영수증은 [source20 후보 계약](../../../13출시·마케팅/MAC_CH1_SOURCE20_CANDIDATE_20261003.md)를 따른다. source19와 source17 관측은 각각 당시 이력으로 보존한다.


## 2026-10-03 source21 미개봉 상자 축출 수정

| 항목 | 현재 계약 |
|---|---|
| 적용 | 양판 _wiPush/GC rank에 미개봉·미소비 chest Infinity 우선순위 추가. 다른 비장비−1/장비rarity/20상한/swap 순서 유지, 모든항목chest이면 기존첫인덱스fallback으로20수렴 |
| 의미·경계 | 드롭20개 때문에 아직 열지 않은 상자가 먼저 사라지는 경로 수정. 열린/소비상자 및 개봉보상은 기존축출 적용. 생성3~5개 전체바닥보존/직접가방지급 보장0, 보상/RNG/픽업·저장공식 변경0 |
| 검수 | 신규10PASS/원본6PASS4FAIL·보스복귀34PASS·양판AST JS12/JSON2·별도본편syntax1PASS. fixture 원문실행 범위이며 source21 앱3396 포장·타이틀·HTTP200 확인, 실제 native/저장·시각·청취 인수0. 기존source20/3395·사용자게임/세이브 보존 |

자세한 코드·정상경계·대역/실패 한계는 [아이템 현행 source21 계약](../../../7아이템디자인/exoduser-item-system-full.md)을 따른다.


## 2026-10-03 source21 Mac 실행본 — 포장·정상 타이틀 기동

| 항목 | 현행 상태 |
|---|---|
| 후보 | job b4a3cf03-34d2-45ea-b2a7-a08bf94ca7d2 / port3396 / source commit 97d5079b513bebce747899c734dadafd607af95e. source21 미개봉상자+source20 뇌전창+source19 CP+source18 넉백 수정 포함. 기존 앱/세이브 보존 |
| 확인 | frozen7918/런타임340 실행1회, payload7916 stage/app 정확 복사, bootstrap2·arm64실행파일5 확인. 새 앱 실제 타이틀·전용HTTP4개200, 응답source3 byte-exact |
| 남은 검수 | 입력 잠금해제 확인 대기; 새캐릭터·전투/획득·4지역/보스문·보스사망/부활·재도전·CP화면·저장/청취 미완. 기존검사 반복0·GUI입력0·사용자게임/세이브조작0 |

자세한 앱·저장경로·코드 SHA·physical/native 영수증은 [source21 후보 계약](../../../13출시·마케팅/MAC_CH1_SOURCE21_CANDIDATE_20261003.md)를 따른다. source19와 source17 관측은 각각 당시 이력으로 보존한다.


## 2026-10-03 source22 — 열린 펫 조작 안내 동기화

| 항목 | 현행 계약 |
|---|---|
| 표시 | Shift·쉬프트/R은 실제 패드 재지정에 맞춰 표시. 열린 입력 모드 안내와 가시덫 슬롯0~3 변경도 리프에서 갱신. 기본 매핑·원문/번역키/전투 수치는 유지 |
| 대사 | 양쪽 HTML의 현재·후발 sourceTxt 보존. 언어 변경은 현재 페이드/초상화/타이머/사운드를 재시작하지 않음. DOM 자식이 있는 노드 교체 금지 |
| 검수/잔여 | 새14 source PASS(원본2 PASS/12 FAIL), production 대사·구문26 PASS. source22 Mac 앱3397의 물리 패키지·실제 타이틀·HTTP200 확인. 실제 같은 후보 CH1-1 플레이·화면·청취 인수는 미완료 |

정확한 지원 토큰·버튼·캐시·슬롯·제약은 [펫 시스템 source22 계약](../../../2_4%20펫시스템/2_4%20펫시스템.md)을 따른다. 이전 고정 버튼표는 기본 매핑 기준이며, 카탈로그의 1번은 원문 키다.


## 2026-10-03 source22 Mac 실행본 — 포장·타이틀·HTTP 확인

| 항목 | 현행 확인 상태 |
|---|---|
| 후보 | job 9170d8a4-2ede-48d8-a758-20fc5e8b3193 / port3397 / 코드 checkpoint 9cab599f1f297133577b42e45ca001c34c255f96. source22 펫 조작 안내·fade 보존 포함 |
| 확인 | 입력7918/런타임340 execute1회, payload7916 stage/app SHA exact, bootstrap2·arm64 실행파일5. 새 앱 타이틀 AX/JPEG2704×1696·HTTP4개200·정적 응답source3 exact |
| 미완 | GUI입력0·캐릭터0·잠금해제 답변 대기. 동일 후보 CH1-1 정상시작/전투·획득·장착/4지역·보스문/보스 사망·부활/재도전·저장/청취 인수 미완 |
| 보존 | 기존7검수 앱·사용자게임/세이브 입력0. 보호67·관리자4 보존. 기존 source 검사 반복0 |

상세 경로·SHA·인수 경계는 [source22 Mac 후보](../../../13출시·마케팅/MAC_CH1_SOURCE22_CANDIDATE_20261003.md)를 따른다. 이전 source21/3396 및 source17 부분 플레이는 당시 이력으로 보존한다.


## 2026-10-03 source23 — 보스 착지·탄막 전조 범위 동기화

| 상태 / 적용 위치 | 현재 표시값 | 실제 판정·보존 경계 |
|---|---|---|
| `bossJump` 바닥 fill/stroke | `e.jumpX,e.jumpY` 중심 반경300px 고정. 이전30~60px 및 후보300×진행도는 미사용 | 착지 즉시 피해 `dst(P,e)<300`·atk×1.8·무적/돌진 예외 유지. 충돌 없는 경로에서 목표=실착지 중심. 벽막힘 시 실제 `e.x/e.y`와 목표의 기존 괴리는 미해결 |
| `bossFanWind` arc·오브 각도 | `π×(.7+e._bossPhase×.06)`, 페이즈0~4에서126/136.8/147.6/158.4/169.2도 | 실제 발사 `fanW`와 동일식. 방향 표시 길이 `120+stage×3`은 사거리 표시가 아님. 탄 수·RNG·피해·수명·유도 불변 |
| 검수 / 적용 | 양판 각각 draw3접점만 수정, 역치환 source22 byte-exact. 신규8 PASS(원본4 PASS/4 FAIL); 실제 분기·기존 회귀 포함12 PASS | canvas는 호출 기록 대역이며 native·화면·GPU·시각 최종 인수 아님. source23 앱3398 포장·타이틀·HTTP 확인; source22/3397 앱은 기존 코드 보존 |

상세 수치·실제 분기·한계·§23 보고는 [source23 전조 계약](../../../5.1임펙트디자인/CH1_BOSS_LANDING_FAN_TELEGRAPH_20261003.md)을 따른다. 피해·패링·타이밍·맵 geometry·카메라·기존 앱/세이브는 변경하지 않았다.


## 2026-10-03 source23 Mac 실행본 — 전조 수정 포함·타이틀 확인

| 항목 | 현행 확인 상태 |
|---|---|
| 후보 | job f70852a9-594f-4de4-9313-bd28af78f80e / port3398 / 코드 checkpoint 216035ab68a86f673f63560112d6b683f1695104. 보스 jump300px/fan실발사각 및 이전 source22 수정 포함 |
| 확인 | 입력7918/기존runtime340 execute1회. payload7916 stage/app각SHA exact, 파생bootstrap2·arm64실행파일5. 실제 타이틀AX/JPEG2704×1696·전용HTTP4개200·응답source3 exact |
| 미완 | GUI입력0·새캐릭터0·잠금해제 새답변 대기. 동일후보 CH1-1 정상시작/전투·획득·장착/4지역·보스문/사망·부활/재도전·저장/청취/전투화면 인수 미완 |
| 보존 | source22/3397 등 기존8검수 앱·사용자게임/세이브 입력0, 보호67/관리자4보존. 실제 기존 source검사 반복0 |

정확한 앱·저장경로·SHA·인수 경계는 [source23 Mac 후보](../../../13출시·마케팅/MAC_CH1_SOURCE23_CANDIDATE_20261003.md)를 따른다. 이전 source22 타이틀과 source17 부분 플레이는 당시 이력이다.


## 2026-10-03 source24 — 클리어 콤보 기록 오염 수정

| 항목 | 현행 상태 |
|---|---|
| 생산 적용 | 본편/Easy 각+112B. `G._sStats.comboMax` 초기0/처치 최대값 기록, 현재 클리어 점수·배지·통계만 사용. `G.comboMax` 캐릭터 저장 최고·HUD·사망 표시 및 기존 베스트 기록 유지 |
| 수명 | 새 stage 초기화는0, 보스 field capture/restore와 해금 완료 CH1 복귀는 현재 최대콤보/사망 횟수 유지. 새 저장 필드·기존 기록 마이그레이션 없음 |
| 검증 | 신규10 source PASS(최종 원본2PASS/8FAIL), 기존 점수6·필드복귀34 포함 생산50PASS. 양판 inline JS12/importmap2 구문 파싱 포함; 대역 검증≠native 플레이/화면/청취 인수 |
| 문서·보존 | 관련키워드 docs 전체 검색42행, 관련 정본8개 동기화. source23/3398 앱 및 사용자 게임·세이브 유지. 실제 Mac6단계 인수 미완 |

정확한 데이터·수식·기록 경계는 [클리어 결과 source24 정본](../../../2게임디자인레벨디자인/클리어결과_점수랭크_20260930.md)과 `test/stageComboResult.test.cjs`를 따른다. BOSS0312 원문 완료ID `b0bd8bf4-5b98-48d6-8dff-28806fb30e9e`를 root가 검수하여 저장 최고를 지우지 않는 분리를 선택했다. 타 팀 후보·보고서를 제품 반영 완료로 계산하지 않는다.


## 2026-10-03 source24 Mac 실행본 — 현재 스테이지 콤보 수정 포함·타이틀 확인

| 항목 | 현행 확인 상태 |
|---|---|
| 후보 | job ecc7b214-401e-4dfe-b310-090d30a03e50 / port3399 / 코드 checkpoint 9f9adc11ed36330cca8fc750ab94300a6f084054. 현재 스테이지 최대콤보를 클리어 점수·배지·통계에 사용하고 캐릭터 저장 최고 기록 보존 |
| 확인 | 입력7918/기존runtime340 execute1회. payload7916 stage/app각SHA exact(복사당6645489253B), 파생bootstrap2·arm64실행파일5. 실제 타이틀AX/JPEG2704×1696·전용HTTP4개200·정적응답source3 exact |
| 미완 | GUI입력0·새캐릭터0·잠금해제 새답변 대기. 동일후보 CH1-1 정상시작/전투·획득·장착/4지역·보스문/사망·부활/재도전·저장/청취/전투화면 인수 미완 |
| 보존 | source23/3398 포함 기존9검수 앱의 존재/Info.plist ID와 profile/save 메타만 대조. 사용자 게임·세이브 입력0, 보호67/관리자4보존. 원래 사용자 앱59376baf/08cac1ce의 정확경로는 미확인. 기존 source검사 반복0 |

정확한 앱·프로필·저장경로·SHA·인수 경계는 [source24 Mac 후보](../../../13출시·마케팅/MAC_CH1_SOURCE24_CANDIDATE_20261003.md)를 따른다. source23 타이틀 및 source17 부분 플레이는 당시 이력이며 이번 같은후보 플레이 완료 증거로 합산하지 않는다.


## 2026-10-03 source25 — 사망·부활의 오디오 오류 격리

| 접점 | 현행 계약 |
|---|---|
| player | `die`의 궁극기 unmute·빔/방패 정지·사망/1회부활 음성과 `_fallenResolve`의 부활음·사망음·BGM fade/600ms 예약 callback 각각 오디오 예외를 기록하고 후속 게임 처리를 계속한다. 사망 판정300f·자원·확률·EXP30%·저장 변경0 |
| monster / boss | `deathFX`의 직접 사망음 블록만 catch하여 기존 파티클/혈흔을 후속 실행한다. 일반 보스180f 폴백의 부활음/확정사망음 catch. 부활HP50%/포인트10·55f숨김/40f VFX 보존; si3 전용 피날레 설정 변경0 |
| actual loop | 첫 `_sfxFrameReset` 호출의 catch로 update/draw/다음RAF까지 이어진다. 하위 `_playSampleNow`의 같은Error 전파와 dispatcher finally의 배치 폐기를 변경하지 않는다. context획득은 기존 finally 전이므로 그 실패 때 queue잔류 정책도 보존 |
| 검증 | 원본 공통36검사2PASS/34FAIL → 후보38PASS(정상동등2추가) → 생산38+기존field복귀34=72PASS. 양판 정상7시나리오 및 실제loop185콜백/184물리틱 state/events/RNG 대조. DOM·음향·clock·RAF/update 소비 대역이며 기기 청취/native완주 아님 |
| 적용/보존 | 양판 각12정확치환/+858B; 역치환으로source24원본전체exact. index/backend/flush함수·save·Q/E·보호2_3 불변. source25앱3400 포장·타이틀·HTTP 확인. source24앱3399는 이전 코드로 보존. 보스사망/부활/재도전·청취/저장/화면 인수는아직미완 |

정본: [사망·부활 오류 격리](../../../6사운드디자인/SOUND_DEATH_REVIVE_PROGRESS_20261003.md). 이전 source 검수와 앱 이력은 당시 결과로 보존한다. lazydecode pending 정리·음원복구/다른피격·입력caller 예외는 이번 범위 밖이며 모든 오디오 장애가 해결됐다고 판정하지 않는다.


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


## 2026-10-03 source26 — 재도전의 BGM 실패와 진행 분리

| id / 소비자 | 현재 오류 경계와 후속 처리 |
|---|---|
| R01 / `initStage` 마지막 스테이지 음악 | `try{BGM.play(BGM.stageKey(si));}catch(e){console.error("[BGM] stage start",e);}`. stageKey/play 동기 오류를 기록하고 함수 정상 반환. 앞선 맵 생성/캐시/조명 예외는 catch하지 않음 |
| R02 / `retryBtn.onclick` 필드·arena 복귀 음악 | 기존 컷신 보류 조건 그대로, 그 조건을 통과한 음악 호출만 catch/`[BGM] field retry` 기록. 공통 자원/idle/iframes300·화톳불300f/r280→최종스탯/완충→HUD/QS→G.on=true→준비된DB 저장 계속 |
| 진행·저장 | 기존 EXP30% 정수 손실·46-key 필드/열린 보스문/적 HP·지역/현재 P·INV·통계 보존. 해금 전 일반재시작 유지. dbSave 본문/schema/API 변경0; 저장 예외는 그대로 reject |
| 검수 | 신규16 원본4PASS/12FAIL→후보 신규16+기존34=50PASS. 생산50+기존음향36=86PASS. 실제 전체 retry handler·capture/restore 실행, 일반 initStage는 기존 생성대역 뒤 실제 마지막 음악 statement만 실행. 전체맵/native/기기청취·실저장 검수 아님 |
| 적용 경계 | 본편/Easy 각2호출부·+104B, 역치환source25전체exact. BGM 본체/stop/Promise·backend·음량·곡선택/RNG·공식·Q/E·보호2_3 불변. source26 앱3401 포장·타이틀·입력 전달 확인. source25 앱3400은 이전 코드로 보존; native 완주/청취/실세이브 인수 미완 |

정본은 `docs/6사운드디자인/SOUND_RETRY_PROGRESS_20261003.md`다. source25 사망·부활72PASS와 포장·타이틀 기록은 당시 인수 이력이며 이번 실제 Mac 사망/재도전 완료로 합산하지 않는다.


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


## 2026-10-03 source28 — 보스 재도전의 이전 전투 지속 피해 정리

| id / 적용 경계 | 현재 정확 계약 |
|---|---|
| DOT01 / `retryBtn.onclick`의 일반 arena→field 및 해금 CH1 field 복귀 | 기존 `if(_fieldRetry)` 뒤에 `P.poison=0;P._rbPoison=[];P._rbBurn=[];` 추가. 본편/Easy 각44B. 사망 후 자원 완충 전에 이전 전투의 세 지속 피해만 제거 |
| 제외 / 기존 분기 | `_retryDruidFinale()`가 먼저 처리하는 si3 직접 보스 재도전 및 해금 전 일반 `initStage`는 변경0. field-only 기존 디버프·버프·1회효과 정리 블록은 그대로 |
| arena 플레이어 보존 | `_webSlow/_trapSlowT/_freezeSlow/burnT`, `_ioActive/_ioT`, `_altAtk/_altDef/_altSpd`, `_lastStandUsed/_reviveOnceUsed`는 기존대로 보존. 전체 field-only 블록을 arena로 이동하지 않음 |
| 피해/시간 공식 | `P.poison`은 idle tick에서 `sp*.02` 감소, 기존 중독 피해 `~~(P.mhp*.008)` 유지. `_rbPoison/_rbBurn`의 producer t600f·tick30f·총량/20·최대10중첩 불변. 일반 전투의 독 부여·소비·소멸 변경0 |
| 진행·저장 | 기존46 field key, 적/시체 HP와 원 참조·지역·열린 보스문·아이템·현재 INV/EXP·시간/사망 통계 보존. EXP30% 정수 손실·iframes300·화톳불300f/r280·최종 applyStats→완충→DB 저장 순서 유지. save schema/API 변경0 |
| 검증 | 실제 전체 retry/capture/restore+전체 hurtP+AST 원문 DOT3분기/iframes 감소 실행. 원본68검사54PASS/14FAIL→후보68PASS→생산 관련3파일89PASS. 신규18개 중 정상 전투6control 유지; 새sp1/2 재도전12개는 이전 지속 피해를 차단 |
| 검증 한계 | 필드/장비·pet/visual/audio/DB/stat 재산정은 fixture 또는 경계 대역. 전체 game loop·native·실저장·청취·시각 완주 검수 아님. 실제 시연 앱3402는 source27이며 source28을 포함하지 않음 |

원자료는 `tmp/mac-migration-runtime/continued-review-20261003/source28-retry-dot/`의 원본 백업·baseline/candidate/production 기록이다. 수정 전에는 부활 무적300f 동안 timer만 감소한 뒤 잔여 독/화상이 HP 또는 쉴드를 다시 깎았다. 이번 수정은 해당 복귀 시 지속 피해만 끊으며 새 생애의 정상 전투 DOT는 그대로 작동한다. 보호2_3·Q 전용 magic 패링·E 불가·어택티켓 금지는 변경하지 않았다.

### 같은 후보 실제 플레이의 현재 경계

source27 앱3402에서 DEMO 전사 `맥검수이십칠`을 정상 생성하고 전체 전사 영상을 자연 완료하여 자동 생성된 game URL로 진입했다. Return으로 네메시아와 헥터/디로이 대사가 진행된 뒤 맥이 다시 잠겨 입력이 중단됐다. 앱·캐릭터는 보존했고 잠금 해제 질문은 대기다. source27의 이 부분 플레이를 source28 검수로 합산하지 않는다. 장착/전투/획득·4지역/보스문·보스 사망/부활/재입장·실저장/청취/시각 완주는 여전히 미인수다.

클로드 오더 담당은 05:00:37 UTC에 기존7팀의 새TASK 수신·첫 성공 source를 확인했다. ART1은 assistant의 직접 입력 요구로 목적 보류이며 사용자 중단 지시로 기록하지 않는다. 검토/착수 건수를 제품 완성 건수로 계산하지 않는다.


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


## 2026-10-03 source29 — 스킬창 입력 표기 동기화

source27 정상 Mac 스킬창의 칼등[RMB]·마법[E] 표시는 실제 설정 E=shield/우클릭=beam과 반대였다. 같은 구 상수가 본편/Easy의 renderSkillPanel 미니바에 남아 있었으며 아래 표시만 수정했다.

| 정확 대상 | 기존 표기 | 현재 표시·동작 |
|---|---|---|
| `renderSkillPanel`의 `_slotDefs` / `id:'rmb'` | 고정 RMB | `keyName(BINDS.shield,true)` / 기본 E, 사용자 primary binding 재지정 시 그 키 이름. 레거시 id rmb·maliceSwipe 선택·openSkSlotPop('rmb') 유지 |
| `_slotDefs` / `id:'magic'` | 고정 E | `keyName(BINDS.beam,true)` / 기본 KO 우클릭·EN RMB, 사용자 primary binding 재지정 시 그 키 이름. 기존 magic 선택·popup 그대로 |
| 미니바 키캡·title | 잘못된 고정 키가 두 곳에 표시 | 같은 `sd.key`를 두 leaf/title에 사용. 13슬롯·아이콘·순서·callback 보존. 기존 KBM 참조 바를 유지하도록 forceKbm=true; 패드 주입/설정 변경0 |
| `SKILL_LIST.fireball` KO/EN 설명 | [기본: E] / [Default: E] | [기본: 우클릭] / [Default: RMB]. 악의구 이름·크기·넉백·비용·배율·레벨·해금·기능 변경0 |
| `SKILL_LIST.omniBeam` KO/EN 설명 | [고정: E] / [Fixed: E] | [기본: 우클릭] / [Default: RMB]. 리바인딩 가능한 기본키를 고정키라 부르지 않음. 숫자·스킬 기능 변경0 |
| `SKILL_LIST.blueShot` KO/EN 설명 | [고정: E, Lv300 해금] / [Fixed: E, unlock Lv300] | [기본: 우클릭, Lv300 해금] / [Default: RMB, unlock Lv300]. Lv300·50발·5초·비용·CD·스킬 데이터 유지 |
| 검수 경계 | 원본 KO/EN 기본 및 사용자 재지정 표시 실패 | 실제 keyName·미니바 원문 블록 실행, DOM/popup/localization 경계 대역. 6입력 조건×본편/Easy=12경계에서 표시 정상, 13슬롯 및 모든 선택 callback·나머지 슬롯 동등. 실제 native·전체 renderSkillPanel 실행·패드 장치·픽셀 인수 아님 |
| 보존 | 보호2_3·Q-only magic/E불가·어택티켓 금지 | 실제 input dispatch·BINDS/BINDS2 저장/마이그레이션·전투·자원·진행·세이브 수정0. 양판 전체 역치환 원본 exact, 수정3종을 제외한 SKILL_LIST 전체 값 동등 |

source28 고유앱3403은 이번 라벨 수정 전 코드다. 실제 launch1/live PID44852, HTTP source3 exact·api/slots200 빈 목록을 관측했으나 맥 잠금으로 native 입력0. 창 관측 오류를 앱 종료로 해석하지 않고 재실행하지 않았다. 잠금 해제 질문 pending이며 열린 보스방·몬스터 보존·획득·보스 사망/부활/재입장·실저장·청취·완주 목표는 미완료다. 이 수정은 신규 앱 제작/실제 플레이 완료가 아니다.

코드 byte 증가: game.html +76B, game-easy-test.html +76B. 원본 백업·실행 근거는 `tmp/mac-migration-runtime/continued-review-20261003/source29-skill-input-labels/`에 보존한다.


## 2026-10-03 source29 Mac — 최신 파일 후보, native 입력 대기

이 절은 이전 source28 포장 기록 이후의 현재 파일 인계다. 최신 앱 후보는 **source29 / PACKAGED_NOT_RUNTIME_ACCEPTED**이며, 이전 후보의 실제 플레이를 새 후보의 인수로 합산하지 않는다.

| 항목 | 이번 실제 근거와 남은 검수 |
|---|---|
| 입력 / job / port | `3948b102db4c353822e6a706067224f72df36c48` / `e771c364-291e-4c7a-b983-1a7496d505aa` / 3404 |
| 포함 수정 | 스킬 미니바 칼등·마법 키를 현재 BINDS.shield/beam에서 읽음, 기본 마법3종 KO/EN의 구 E 설명 교정. 본편/Easy 각+76B. 기존 source28 DOT 초기화·source27 드루이드 초기화 포함 |
| 실제 파일 검수 | frozen7918 입력/runtime340 재사용, 새 job execute1회. stage/app payload7916 각각 전체SHA 일치, source3 exact, bootstrap2 전체 역치환 exact. arm64 실행파일5·plist 확인. 이번 소스 검증/포장을 native PASS로 승격하지 않음 |
| 물리 영수증 | `tmp/mac-migration-runtime/continued-review-20261003/ch1-source29-build/physical-receipt.json` 33957B / SHA256 `0fff1798d98fb924110dfe7000df48d5919c6d0de19d9f6c630bd7e48522d589` |
| source29 실제 기동 | launch0/native입력0. 새 전용 profile/saveRoot는 아직 미생성. 정상 플레이·보스 사망/부활·열린 보스문/몬스터 보존·획득·저장 재실행·청취·카메라 인수 미완료 |
| source28 기동 후속 | CUA getApp1회로 실제 main PID44852 실행. HTTP index/game/Easy3가 포장 source3와 exact, api/slots200 빈 목록. 창 관측은 Mac 잠금으로 실패했고 재실행0/native입력0. 이 상태는 이전 launch0 표 이후의 후속이며 파일 포장·실기 검수와 구분 |
| 기존 실행본 보존 | 이전14 검수앱의 존재/plist ID·profile/save metadata 확인, 내용 hash/수정0. 원사용자 앱 정확 경로 UNKNOWN 유지. source27 장착4/일반retry/첫처치1의 부분 플레이는 과거 관찰로 보존 |

source29 원문 검수는 실제 keyName·미니바 원문 블록을 DOM/popup/localization 경계 대역으로 실행한 12조건이다. 13슬롯과 모든 선택 callback 동등, 양판8치환 전체 역복원 exact, inline script/importmap 구문 통과. 숫자·전투·진행·세이브·input dispatch 변경0. Mac 잠금 해제 질문은 대기 중이며, 동일 최신 후보에서 실제 CH1-1 시작→전투/획득→4지역/보스문→보스 사망/부활→재입장·진행 보존을 검수하는 목표는 계속 미완료다.


## 2026-10-03 source29 실제 새 전사·영상·INTRO 후속 관측

앞선 source29 launch0/전용 저장경로 미생성 표는 포장 당시의 이력이다. 현재는 같은 후보를 정상 기동해 새 전사를 생성했고, 게임 INTRO까지 도달했다. 전체 플레이 인수는 미완료다.

| 현재 관측 | 실제 근거·한계 |
|---|---|
| 같은 최신 후보 | 입력 `3948b102db4c353822e6a706067224f72df36c48`, 파일 checkpoint `b5de8b38c25ebabb19ce4de751e876e0fb865f26`, job `e771c364-291e-4c7a-b983-1a7496d505aa`, port3404. 새 기동1회/main52515 live |
| 정상 생성·영상 | 타이틀 Enter→세계관 영상→DEMO 로비→전사 맥검수이십구 정상 생성→전사 이야기 영상 실제 렌더→자동 game URL→네메시아 INTRO. 새 전용 profile/saveRoot 생성, 원사용자 저장경로 조회·수정0 |
| 현재 입력 정체 | 네메시아 “그 아이의 목마를 보니 망자도 정신이 드는가 보구나”. Return/Z/ESC·AX 이미지 클릭·창 Raise/HTML focus 뒤 화면 불변. 좌표 입력은 noWindowsAvailable. 현재 앱 목록에는 잠금 오류가 없어 이전 잠금을 현재 원인으로 단정0 |
| 검수 한계 | 정상 UI 생성·영상·INTRO 부분 관측. 같은source29 전투/실제 아이템 획득/4지역/열린 보스문/보스 사망·부활·재입장·필드 보존/저장 재실행/실청취/카메라 미인수. source27 부분 플레이 합산0 |
| 증거 보존 | `tmp/mac-migration-runtime/continued-review-20261003/source29-native-play/progress-receipt.json` 2410B / SHA256 `b219532fae9640aedf1d17f986104acd924651e11374e480dd1a69a3f2562fb8`. 실제 screenshot2와 기존 startup receipt 분리 보존 |

게임 state 주입·리로드·추가 앱 기동·생산 코드 변경0. 실제 입력 전달 복구 후 같은 앱의 정상 진행을 이어간다. 상세 입력·영상·일반 진행 경계는 `docs/13출시·마케팅/MAC_CH1_SOURCE27_CANDIDATE_20261003.md`의 source29 후속 표를 따른다.


## 2026-10-03 source30 — 공격 진행 코드 반영 / 기존source29 native 대기

| 단계 | 실제 상태 |
|---|---|
| source 통합 | SOUND0617의 일반 LMB slash·fireBow 활/석궁 발사음 예외 격리 두 경계 양판반영. 각+194B, 피해/소모·회복 상태·기검참 불변 |
| 코드 검증 | 변경전26PASS/8FAIL → 후보34PASS → 실제생산39PASS(신규34+기존피해/기검참소리5), inlineJS12/importmap2 및 역치환 전체exact. source fixture·실제분기 실행이며 native 인수 아님 |
| 현재실행 | source29/e771c364/3404/main52515 기존격리앱 유지. 현재앱에source30 미포함/새빌드·재실행0. 정상Space 후AX불변·목마대사, 실제화면 기준 클릭 noWindowsAvailable |
| 최종목표 | 같은후보 정상입장→전투·획득/장착→4지역/보스문→보스사망·부활→재도전 및 열린보스문/기존필드몬스터 보존, 실청취·화면·저장재실행 미인수 유지 |

[정확한 경계·수치·검수·팀 완료ID](../../../6사운드디자인/SOUND_BASIC_ATTACK_PROGRESS_20261003.md). 총괄의 실제생산 코드진척이며 새 게임플레이 완료건수는 아니다. 원사용자 앱·게임·세이브·타인WIP·보호설계 보존, 전문팀 송신은 각오더담당만 소유한다.


## 2026-10-04 root97bb/3386 — 일반 전투 후속, 보스 완주 미인수

같은 기존 격리 캐릭터 `맥검수`의 정상 입장·일반 전투25처치 이력/최대콤보18·Lv2·전투 보상 증가·불꽃 석궁 장착(CP1630→1707)·일반 사망/부활을 실제 CUA 화면과 AX로 확인했다. 부활 뒤 현행 처치는0/32이며 이전25처치를 게이트 진척으로 합산하지 않는다. 기본 난이도(슬라이더5/일반)로 정상 UI에서 조정했고, 게임/패키지·사용자 세이브 직접 수정0이다.

4지역 각80%/앵글러 사망·보스문 개방·보스 사망/부활/재도전·열린 문/몬스터 보존·장비 드롭별 획득·저장 재실행·실청취·전체 맵 시각 인수는 미완료다. 포장 game/moat가 현재 소스 SHA와 달라 최신 제단 내벽 검수로도 계산하지 않는다. 신규 빌드/앱 기동0. [정확한 후보 핀·UI 수치·부분 MAP PRODUCTION REPORT](../../../13출시·마케팅/MAC_CH1_SOURCE4_NATIVE_PARTIAL_20261003.md)의 해당 날짜 후속 절을 따른다. VISUAL VERDICT: RETOUCH.


## 2026-10-04 root97bb/3386 — 실제 새 허리띠 획득·장착 후속

앞 절의25처치·Lv2·드롭 출처 미확인은 당시 이력이다. 같은 source4 격리 앱에서 후속 일반 전투→가방10→14/300 및 `일반 그림자 허리띠 획득!`→정상 장착(16/16, 가방13/300, CP2005→2023)을 실제 CUA 화면/AX로 확인했다. 기존 가방의5종 장비 교체는 새 획득으로 계산하지 않는다.

Lv4까지 진행했고 일반 사망 화면 누적64처치/최대콤보19/EXP−3을 관측했다. 정상 부활 후 Lv4/EXP7/25, HP706/706, 현행 처치0/32, 악의37,240, 표시CP2040이며 같은 앱 설정 메뉴에서 일시정지 유지한다. 누적64처치를4지역 게이트 진척으로 합산0. 새 앱/빌드·리로드·게임 코드/패키지·사용자 세이브 직접 수정0.

4지역 각80%·앵글러·보스문·보스 사망/부활/재입장·열린 문/몬스터 보존·저장 재실행·실청취·전체 시각 인수는 계속 미완료다. 최신 제단 내벽이 기존 앱에 포함되지 않은 후보 경계도 유지한다. [새 획득·장착 근거/부분 MAP PRODUCTION REPORT](../../../13출시·마케팅/MAC_CH1_SOURCE4_NATIVE_PARTIAL_20261003.md)의 같은 날짜 후속 절을 따른다. VISUAL VERDICT: RETOUCH.


## 2026-10-04 root97bb/3386 — Lv5·강인2 정상 투자 후속

같은 source4 격리 앱에서 Lv5·남서22/53·최대콤보22 뒤 일반 사망 화면 누적87처치/EXP−2와 정상 부활을 관측했다. 누적87은 게이트 진척으로 합산0. 가방16/300 상태에서 정상 장비3교환(CP2050→2162→2232→2280)과 획득AP2로 강인0→2 적용/AP0·최대HP 기여600을 확인했다. 후속 필드 최대HP1465/HUD CP2610·Lv5/EXP6/28·현행0/32는 실제 관측이다.

부활 후 이동/메뉴 단축키 반응은 충분히 미확인이고, 캔버스 초점 확인 중 사용자 앱 변경이 감지되어 후속 조작을 중단했다. 이후 사용자 전환 뒤 화면을 에이전트 진척으로 계산0, 현재 일시정지 유지 주장0. 코드/패키지·새 앱/빌드·리로드·사용자 세이브 직접 수정0.

4지역 각80%·앵글러·보스문·보스 사망/부활/재도전·필드 보존·저장 재실행·실청취·전체 시각 인수는 미완료다. [정상 장비·성장 수치와 입력 한계/부분 MAP PRODUCTION REPORT](../../../13출시·마케팅/MAC_CH1_SOURCE4_NATIVE_PARTIAL_20261003.md)의 Lv5 후속 절을 따른다. VISUAL VERDICT: RETOUCH.

### 2026-10-07 ROOT-RIFT-MAIN-CHARACTER-SEED-20261007 · 부모 선택과 최초 2.5D 표시 연결

이 절은 초기 캐릭터 표시 연결의 최신 source 계약이다. 이전 핀의 child 캐릭터 전달0/host17683·world45509는 당시 이력으로 보존한다. 본편 root 진단의 미인수 상수와 public host의 초기 표시 ACK는 서로 다른 범위다.

| 항목 | 현재 구현·정확한 범위 |
|---|---|
| host source | tools/2_5d/main-rift-host.mjs 18931 B / a242f619d0a6f1bf3e8809a8f059e0979606b4356addd6f9b1e12c73cbc4f967 |
| child source | tools/2_5d-world-lab.mjs 46833 B / fbab9b30265a0b211220e0e03775249bee8385fdae26c5c30bfe691409bcb5cb |
| 실제 누락 접점 | 기존 game의 _charIdx0/1→warrior/silvertail 및 runtime readHostContext→host는 존재. 이전 host 고정 iframe URL·child 초기 select(warrior) 때문에 silvertail도 전사로 표시. 실제 현재 사용자의 live class 관측을 이 source 반례로 대신하지 않음 |
| 호스트 허용값 | contextSnapshot.character는 정확 primitive 문자열 warrior 또는 silvertail. MAIN_RIFT_HOST.characterSeedKey='main-character', characterLinkScope='initial-display-only', fullPlayerLinked=false. unknown/empty/main dark-druid는 admission 실패 |
| per-entry URL | 캡처한 context.character만 새 URL.searchParams.set('main-character',character)로 넣고 expectedCharacter/entryURL/characterAck=false를 해당 record에 보관. onLoad와poll이 동일origin·lab pathname·정확 record.entryURL href를 검사. parent P/UUID/HP/inventory/flags/좌표/facing의 query·payload 직렬화0 |
| child 초기 준비 | readInitialCharacterSeed(window.location.search)→main-character 없음이면 standalone/editor 기본warrior. present는 getAll 결과 정확1개+허용두ID만 통과, empty/duplicate/unsupported는 고정 내부오류로중단. renderer 생성 전에검사. prepareInitialCharacterDisplay가 state.selected·dropdown.value·rig visible·helper hidden·CHARACTER_RIG_CATALOG 한글명을 first ready/reset/render 전에동기화 |
| 초기 ACK | initialCharacter는 private 초기ID, initialCharacterReady는 reset/select 이후 ready·error없음·disposed아님·선택일치에따른boolean. __rift25Lab.snapshot의 own-data primitive initialCharacter/initialCharacterReady/selected를 host가 loading때읽고 ready=true일때 expectedCharacter와정확일치해야characterAck=true/active/handle을resolve. child snapshot accessor/proxy/throw는 고정 'UNKNOWN · 지옥의 틈 초기 표시 ACK 읽기 실패'로 치환·외부message/String 읽기0 |
| 재진입·변경 경계 | ACK read 이후 current record·sameContext 재확인; stale/cancelled entry가 새 entry를active로 만들지 않음. active 이후 새manual비교를강제원복0; standalone dark-druid 수동비교는기존경로. 초기ACK는계속 player 상태를동기화한다는뜻이아님 |
| 진단 범위 구분 | host.snapshot().childCharacterLinked는 current.characterAck===true만. MAIN_RIFT_HOST.fullPlayerLinked=false 유지. window.__riftMainIntegration.snapshot()의 childCharacterLinked:false/durableSaveAccepted:false/demoHubAccepted:false 등 game 자체미인수진단은실제game코드불변이므로그대로이며 host 초기표시true로대체0 |
| 그대로인 소비자 | game.html4050426/ece8c398068903caf666979b33c3e0f541043db1e58f98a65d7c68e427f74230와 main-rift-runtime.mjs7519/b93cb86f7857bd4242af8b9cc9478cceea591d03aad872bca76a5af06b471b69 byte불변. Continue/epoch/save/lease/guardedAdvance·기존5000ms/900ms·host30000ms/100ms 정책변경·재검사0. spawn5480/3740·geometry/nav/PNG/카메라·렌더기본값·발접지변경0 |
| source 최초 Gate | actual importedhost+actual child unchangedfunction/startup/API span을 VM에서호출, actualThree/catalog+통제DOM/RAF/rig/renderer/iframe/P/G ports. 최초8그룹 중4완료·29조건도달(28PASS/1FAIL)·4그룹잔여미도달/exit1. fixture의 INTERACTION_CUE_PROVENANCE/SLICE_ACCEPTANCE_PROVENANCE/SCENE_REGISTRATION_PROVENANCE 3누락→actualsnapshot참조예외→host실패/정상timer1기대FAIL. 제품결함확인0·원FAIL동결 |
| source 한정후속 | root승인으로외부fixture의실제누락imports3만공급. 이미PASS한조건재단언0/제품2코드핀변경0. 미도달 ACK·hostactive·P identity 두class각3조건+standalone/manual3+정상timer1만 새4그룹10조건PASS/FAIL0·미도달0·준비오류0/exit0. 원FAIL과합산/전체clean suite PASS선언0·old검사0 |
| source 정확근거 | worker final21003/686b31461510bf0c6cbc0f191ded0d9c32fe6118f433acd1f5376ce3449b79f8; 최초raw7624/6acc16e83e9a876f334de74077a909d873ddf105b5e183edc5ee8a6125783379; 판정1083/6107533374c9675ec4aae266fe7842a8686c7bd23813dccbde968fef7f95daa8; 한정raw3512/a62bee6ed7148a8908b8dbf7c2680362c37c8e6f4ebeda0f76b990e20bcdf9d9. source2 역변환 exact·소유doc원prefix159478·EOF1/GFM3표 |
| 새 actual Chrome | 신규 actualChrome1/context1/parent1에서 host child2를전사→실버테일순차실행(max동시1). 새2그룹12조건PASS/FAIL0/미도달0/exit0, 추가실행0. 첫원본render ordinal1과ACK전전사6draw·실버테일7draw 모두해당rig/이름/dropdown일치. host own-data ACK3/childCharacterLinked=true(initial-display-only), runtime top-level false는그대로. 각GL13program LINKtrue/getError0/contextLostfalse/canvas1036×714; source-owned timer1→close0/finaldispose0, 전체native timerqueueUNKNOWN. source17exact/P·G detachedfixture·storage{}불변/오류·404·외부·변경요청0. root·helper PNG2직접확인: 초기표시UI PASS/전체맵RETOUCH. final9034/3fa1faad6b5dda2c3ec8609f6e2d3397bbda76d908676717fe9d67bf8525546c; summary22474/41fd6c7a8d284404bff1f51fa24611d3fbd96871b1a1108df2ca9fc901ee739a; raw388349/58988832f471a8c4f5567054fc3d0b4f1428312cf59ff0892517d5daf8b743ac; 전사PNG859610/41cd4c7bdca71d80b5681de872d71933404b992745a1986c26b228fc485e16cb·실버테일PNG861337/d87d4917a92cbfc7a977798d1beeb902d6c59a386179e81c27a5201682acd995. actualgame.html/native6/fullplayer/save/audio/physicalscanout인수0·oldGUI/CPU합산0 |
| 추가 새 실제 rig 소비자 검수 | 실제character-rigs factory3(전사2독립/실버테일1)→update72호출→private setFrame/nativeThree UV matrix/geometry attributes·weightChecks 소비를신규Node1에서검수: 새7그룹93조건PASS/FAIL0/미도달0/exit0. attack frame8/phase1뒤idle·독립소유자·dispose각1, nativeTexture35의disposeevent35 확인. PNG26/metadata2exact. Image는PNG IHDR크기기반MOCK이며실RGBAdecode·GPUupload·world실행·actualGUI·본편native6·청취·save인수0. 새visual NOT ASSESSED/전체RETOUCH. 준비단계Path.write_text newline API오류1은제품도달0/Node0, root승인외부파일쓰기API만보정뒤최초제품Node1; 제품실패재시도0. final5888/39d2e931065fc9df34ab3f6f36e4687cb3ca4f85699952b8cc2ea43a5532ed04, unit16128/1258909d0e4a6686c9433e37040ae743199f7292c6bf6abedc6706a3e5454da7, raw771/2cd6bfc0430edd2a3b59ed1a6b18eabc0559e9077e0eaacae48f7f05a3be8aec. source수정권고0 |
| docs·정상보존 | 신규code후 전체rg28경로370행/raw433377/f1d85f951cb7068549f12a946c996b6db9ebfee86f65257a16eb564aecd278bc. root 관련정본24개를현재계약/범위로동기화·모든path disposition. ownerLOG와다른출시후보/맵geometry 이력4경로는원값유지. fullbyte백업→fullprefix/EOF1/GFM→정확소유code2+docs24 정상commit/push·remoteexact은 외부 main-character-seed-consumer/remote-preservation-receipt.json에서확인. foreign68·ownerSTATELOG4·heldWOLF1 소유외/stage0 |

§23 MAP PRODUCTION REPORT: MASTER=기존본편두class의지옥의틈초기표시연결. fullguide607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b/SSOT_INDEX·stageLOCK의기존정확full읽기근거적용. LARGE OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL은기존PNG/scene/nav/geometry/카메라/랜드마크/기존23보존·새배치0. CAMERA QA=새actualhost/child초기render표시범위만. TECH QA=최초sourceFAIL29도달/한정4x10과actualChrome별도영수증. VISUAL VERDICT: RETOUCH(전체맵), 새class 표시검수는전체맵선명도·해부학모션·본편native6·청취·실보상save·A급완성의인수가아님. 원화1254→8000확대/기본legacy1024mask흐림미해결.

| 새 전문 원자료·독립 후속 | 원총괄 보존·채택 경계 |
|---|---|
| ANIM motion UV 공식 raw | endda8430aa-df06-47d5-b729-ad0394de1d2e@2026-10-06T22:44:15.704Z, raw6359/a887281013d8afc85125ae4730bc5d4bb7d02fb5a826b3355b2e327b9a992972; 외부7081/4694e403a03d0e17b772e997bf10a6b08b4988cf6bf3a7b955eff4345580d2d5. 전문보고stdin8PASS는actualcharacterRigFrame+복사공식만·actualupdate/setFrame/GPU未호출. root readonly12195/8f2d1d396abab42518a3847e612025df6185b5e60a2237bcab724eb8f8b6a838에서신규source결함확정0, 실버테일walk가변crop/anchor→geometry실소비를새검수범위로분리 |
| MAP host/modal 원자료 | end70832dd3-592c-47c1-98d8-0f199c955fa5, raw4935/9f220fec67181b840ade1c00f92a470f39ebb013ba4bc13f6ef1624949f13898; 보존5665/c4a05aa52540a0201ee6a1e8751f9819aa5d0eadaf7242b9905275436ba525a6. 새공식memory후보미채택, root실행·실화면·본편인수0 |
| ANIM dialogue owner 원자료 | end53b09739-bd8c-479f-b0a4-6838041a4aec, raw6240/9b9ad0f617ddca16b5f459d4158d23de3a89b2553cca5dd83f19e845f67cfaa9; 보존6895/7f55fb6f0a265ec35d7a7b550ca629fc3a8f048d5bcaf82e433df6bfe05e1cf7. 새공식memory후보미채택, root실행·실화면·본편인수0 |
| 새 owner 업무 | Claude8 기존owner가 MAP CH1-RIFT-SCENE-OBJECT-ASSET-INTEGRITY-20261007-MAP-MEMORY와 QA CH1-LOBBY-CHARACTER-VISIBLE-BOUNDS-20261007-QA-MEMORY를각sent1/peer1/firstsource1/end0·busy로기록. ANIM CH1-RIFT-VFX-ARBITRATED-ATTACK-EMISSION-20261007-ANIMVFX-MEMORY도sent1/peer1/Read1/firstsource1/end0·busy. 수신/첫source를완료로계산0·전원가동과장0. MAP추가권한질문은이미승인된기존팀독립작업에대한전문자가질문이며실제autoapproval거절로오인0, 기존승인범위업무계속. 새raw의의미검토·후속은기존owner에게만1회인계 |
| 계속운영/보호 | 기존Claude8/Codex7만전문송신소유·root직접/중복송신0·새팀/세션0. 거절된Codex송신/ART선택/WOLF쓰기목적재시도·도구/경로/호스트/권한우회0, MAP/STORY외부쓰기·삭제피해UNKNOWN유지. WOLF거절뒤같은산출물correctedpathwrite 이력보존·추가접근/검수/실행/채택/Git0. 타인WIP/사용자save/보호2_3·Q전용magicblackBean(E불가)·어택티켓금지보존. 실제NUL80부터완료소유checkpoint/100전새산출중단. 계정주간사용률약15pp/day 목표는공유관측이며이채팅정확일별token보장·토큰태우기0. 기존단일root연속heartbeat/다른paused자동화·아침메일재개0 |


### ROOT-CH1-1-PLAYER-RIG-CONSUMER-20261007 — 본편 전사 표시 부분 연결

본편의 opt-in 표시 연결과 제한 native 이동 관측만 진척으로 기록하며 보스 개방→사망/부활/재도전 전체 마일스톤 완료로 합산하지 않는다.

정확한 scope/방향/phase/active-tick clock/발 anchor/폴백/생명주기는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다.

clock 전 native5조건 부분 PASS와 최종 clock CPU 검수는 별도 epoch다. 전체 main rig/foot/native6/A급 완료0, 현재 VISUAL VERDICT: RETOUCH.

### ROOT-CH1-1-WARRIOR-STRIKE-RIG-20261007 — 본편 전사 LMB 베기 표시 부분 연결

전사 기본LMB 베기 표시의 소스 연결만 새 단계로 기록한다. 실제 공격/보스 개방/사망·부활/재도전 마일스톤 인수는 검수 증거 대기다.

정확한 origin·atlas gate·셀·phase·anchor·미채택 상태는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다.

최종 sparse guard의 새 한정 CPU는 6조건 PASS/FAIL0/미도달0/exit0이며 최초 공격 CPU100PASS·1FAIL은 별도 보존한다. root가 인계한 동일2a052 소스의 새 main native는 Chrome/context/page 각1, 실제 LMB east/index2의4조건 PASS/FAIL0/미도달0/exit0이다. 실제 atk2 f2/phase2.5÷9/609vertices/canvas85×85/alpha>16픽셀581/GL0, 현재 owned LMB-origin1을 관측했고 wRecover에서 bodyCurrent=false, idle 복귀 owner=null을 관측했다. pageerror/httpfailure0 및 POSTmats1 차단/서버도달0이다. W setup1300ms 입력 중 xy4020,7420이 변하지 않아 이동 성공을 주장하지 않는다. root PNG 직접 판독은 main 시작 금빛FX가 몸·발을 가리고 격리 공격 그림은 보이는 상태다. VISUAL VERDICT: RETOUCH. 실제 발·native8방향·회수 rig·DS ghost·native6·audio·save는 미인수다. 이전 idle/W native5 및 clock5 CPU와 합산하지 않는다.

최초 공격 CPU는 2a052 epoch에서9그룹 도달/8그룹 완료/100조건 PASS·1FAIL/exit1이었다. native.every가 sparse hole(index8)을 건너뛰어 잘못된 배열을 허용한 반례를 원 result.json에 동결했다. 최종8a4e 소스는 i0…8 직접 for-loop와 Object.hasOwn(native,i)로 각 셀의 실재 own index를 요구한다. 최초100PASS를 재실행하지 않은 sparse 한정 후속은 6조건 PASS/FAIL0/미도달0/exit0이다. hole8·hole0·hole4·inherited-only4·own undefined8은 렌더0으로 차단했고 dense 대표 n/f4는 phase.5/anchor(0,18)/단회 렌더를 유지했다. 앞선 native4PASS는 2a052 소스의 결과이며 최종 own-index guard의 native 검수는 미실행/추가Chrome0이다. clean 전체 PASS로 합산하지 않는다.

검수 원문은 외부 ch1-main-warrior-attack-20261007/validation-receipt.json에 epoch별로 보존한다. 최종 game SHA는 8a4e83ab107ad18979f05c7ced7b02e56ee617dee0c64bd9fa3a715c519795b2, sparse 한정 원문은 9440B/637d3d33c0c3d861c3902f3da808ca07d5ffa1e8c588beefde14c4b9dcdc9f7a이다. docs 전체 무제외 관련 검색45경로 중 현재정본13을 동기화하고 역사·타모드·owner WIP·보호2_3의32경로는 그대로 보존했다.

### ROOT-CH1-NATURAL-SPAWN-VISIBILITY-20261007 — 최종 소스의 새 실화면 관측

앞선 2a052 공격4조건/금빛FX 가림과 별개로, 최종 game4058588B/8a4e83ab107ad18979f05c7ced7b02e56ee617dee0c64bd9fa3a715c519795b2에서 새1Chrome/context/page·3조건 PASS/FAIL0/미도달0/exit0을 관측했다. 기존 공격4조건·CPU100PASS1FAIL·sparse 한정6PASS를 재실행하거나 합산하지 않았다.

실제 LMB 후 W 입력 동안 document focus=true/BODY, BINDS.up=KeyW, trusted keydown/up, K/KH=true→false, frame57→137을 기록했고 P.y7420→7200.653340000013으로 이동했다. 이번 관측은 정상 이동의 한 사례이며 이전 W 무이동 원인은 여전히 UNKNOWN이다. G._bonfire.t243→0/frame57→300의 자연 종료를 기다렸으며 FX·시간·위치 강제 변경0이다. 최종 own-index guard의 정상 dense 공격 한 장면도 본편에서 도달했다. sparse/inherited 음수 경계는 CPU6조건 범위다.

root가 자연 종료 후 idle/strike PNG2를 직접 판독했다. 전사의 몸과 하단 다리·발 주변은 해당 pose에서 식별되나 평면 baked 지면·공격FX/인접 적 가림은 남는다. VISUAL VERDICT: RETOUCH. 전체 동작의 해부학적 접지·8방향·회수 rig·DS ghost·실높이·같은후보 native6·청취·실보상save·A급 인수는 미완료다. 원 source/PNG/scene/nav/세이브는 보존했고 POSTmats1은 서버 도달 전에 차단했다.

외부 원문: ch1-main-warrior-attack-20261007/natural-visibility/result.json36127B/287d70769f01f02651e9aec4a4b2911a03f6898c1125fa05649376b29acd3f53. 이 별도 관측은 기존 코드 완료18cc60d5806c8e82c0295e1bdbbb50ba89d00278에 대한 추가 증거이며 새 제품 코드 변경0이다.

### ROOT-CH1-LOBBY-OPTION-CARRY-20261007 — 로비 왕복의 명시적 2.5D 옵션 전달

마일스톤의 로비/캐릭터 선택에서 시작하는 opt-in 진입 경로를 연결했다. 소스 연결 및 통제 CPU 검수와 실제 자연 플레이/획득/보스/사망·부활/재진입 검수는 별도이며 후자는 미인수다.

정확한 전달 key·host/port·첫값/target-key 우선·미전파·원래 저장/지연 수명은 `docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md`의 동일 completion 절을 따른다.

신규 carry CPU는 실제 showCharGate/goToLobby 함수 전체를 추출한 통제 VM의 최초1회로7그룹·25복합조건 PASS25/FAIL0/미도달0/setup0/exit0이다. source2 전후 exact 및 원 working 원문 역치환 exact를 보존했다. 옵션·host/port·중복 첫값/특수문자·demo/test/normal/story·stale·활성화 실패·save await 후 이동/저장 실패 뒤 이동/죽음 복구 후 save·두 실제 함수의 통제 왕복을 확인했다. CPU 전 별도 준비 읽기의 zsh optional-wildcard 오류는 제품/CPU 실패가 아니며 최초 하니스 재실행0이다. 실제 로비→게임→로비→게임 자연 입력·실제 save ACK·전체 native6·청취는 미인수다. 기존 rig/attack CPU·native 숫자를 재집계하지 않는다. 근거는 동일 외부 폴더의 cpu-receipt.json5520B/5d404e0940578fce4e806dd2f3be6054423653a9b3732c9e1b381e3a83f187d3와 result.json32935B/54f24ec8d4751a72b19ed756cc261b91486ac7344111549f2fd13b22aa84bb1a이다.


### ROOT-CH1-LMB-RECOVERY-RIG-20261007 — 정상 LMB에서 승계한 회수 본체 표시

strike→회수의 정상 표시 승계를 새 소스 단계로 기록한다. 실제 로비부터 시작하는 전투/획득/보스/사망·부활/재도전의 플레이 인수는 미완료다.

정확한 owner phase/정상 전이 승계/특수·acceptedQ revoke/atk3 gate/회수 counter는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다.

이번 source523a recovery CPU는 실제 main 함수/전이/Q 취소와 통제 animator·side-effect port를 소비한 최초1회6그룹42복합조건 PASS42/FAIL0/미도달0/setup0/exit0다. finisher는 revoke 전이 prefix만 실행했고 실제 PNG/renderer/GPU/save는0이다. 별도 신규 native는 같은 최종 source의 실제 본편 Chrome/context/page 각1회,3조건 PASS3/FAIL0/미도달0/exit0다. 실제 LMB→wRecover/atk3 f6→7→8·phase6.5/9→7.5/9→8.5/9·owner recovery·609정점·heightLocal32·alpha>16 579픽셀·GL0와 실제 idle 복귀/owner null을 관측했다. source8/같은 map exact, pageerror/HTTP실패0, POST /api/mats1은 서버 도달 전 차단, 사용자 save 조작0·owned browser 닫힘이다. CPU42와 native3 및 기존 carry25/strike4/과거 FAIL·한정 결과를 합산하거나 재실행하지 않는다. root PNG2 직접판독은 현 east pose의 회수 몸 표시/대기 복귀만 한정 인수했다. 검기FX 몸·발 부근 가림, 회색 평면 baked 지면/배경 확대 흐림이 남으므로 VISUAL VERDICT: RETOUCH다. 해부학 발/8방향/실DS ghost/높이/전체 native6/청취/실보상save/A급은 미인수다. 근거: 외부 recovery/validation-receipt.json2702B/4fc6af74bf6ffae5140d9e1648937093cf2741735f994baaf7ab82f79daea9c2, cpu-receipt.json9965B/50b6e6e80c21ef3595cc6ab9afec37e07e9db3831eef9352c9bebb47a47723c6, native-result.json102950B/26a12f81168296c6b9b5130a69180c46f17a0b78f3e1083aa6765b97b84d09de, visual-verdict.json2514B/c78360ecf19835709c4f87d3d683c77d88b2632d3b93c9b44507ac2398a3ec91.


### ROOT-CH1-SILVERTAIL-PACKED-MAIN-20261007 — 실버테일 본편 packed 대기·보행 표시

class1 localhost/127.0.0.1:3387의 명시 ch1Three=1&ch1Rig=1(기본OFF), P.hp>0/P.s=idle/stage0·비보스·production smoothing에서만 실제 최종 native idle2/walk4/run4 48×48 셀을 빌려 표시한다. P/G/map/native animator를 실제 main에서 소비하는 표시 경로이며 기존 별도 host initial-display-only 시험과 구분한다. 루트 제품 구현만으로 게임 전투→드롭→보스→부활→저장 인수 완료를 선언하지 않는다.

| 현재 산출 | 경계 |
|---|---|
| 신규3source | factory18305/adapter20389/main4065692 bytes; 세 fullSHA는 관련 정본 참조 |
| packed 표시 | 48²·idle2/walk4/run4·actualf·phase(f+.5)/N·reference45·X0,23 |
| 보존 | 기존parent .65/_pScale·전투·이동·공격/특수/사망fallback·원PNG/save |
| 새 검수 | main15/combined한정39/native3 별도, 원실패·최종pageError1 보존/overall RETOUCH |

정확한 optional API·세 소스 핀·공통 경계는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다.

최종 source의 새 main currentness CPU3그룹15조건 PASS와 actual factory/adapter 한정 CPU9그룹39조건 PASS는 별도 epoch다. 첫 실제 main native Chrome/context/page 각1의3조건 PASS 및 trusted W 이동/대기복귀를 관측했다. 최초 CPU 오라클FAIL2개 이력과 최종 pageErrors SecurityError1을 보존하므로 전체 clean PASS로 합산하지 않는다. 이 오류는 main3check 뒤 about:blank와 무조건 classseed localStorage source상 하니스 cleanup으로 추정되지만 직접 stack/시점 귀속은 미관측이다. root PNG2 직접 판독은 몸 표시/이동만 한정 인수, 전체 VISUAL VERDICT: RETOUCH. 실제 클래스선택 UI·해부학적 발·8방향·공격/특수/사망 rig·live DS ghost·전체 native6·청취·실보상save ACK/A급은 미인수다.

최초 main VM은6그룹 중52조건 PASS 뒤 P4scope의 suspend1 기대 오라클FAIL1/후속P5·P6 두그룹 미도달/exit1이었다. 실제제품의 packed retire와 기존scope fence가 idempotent suspend2를 호출하므로 오라클한정 expected2로 정정; 별도P4/P5/P6의3그룹6조건 PASS/FAIL0/미도달0/exit0. 원52재실행0·clean58합산0·이 오라클로 인한제품수정0. 이후 읽기에서 발견한 별도currentness 접점을 최종main/adapter에서 보강했다.


| 최종 currentness 보강 | 정확 범위 |
|---|---|
| adapter live native | 같은 animator여도 own anim/f, fm의mode_direction 배열 identity/정확 count/선택 cell identity와 own crop x/y/w/h가 captured source와 같아야 publication/render를 유지 |
| main live frame | _ch1RigPackedFrameCurrent가 현재 P/map/atlas/animator와 native direction/mode/f·배열/count·selectedcell/crop을 확인. snapshot/publication을 parent blit 앞에서 검증 |
| ghost | packedOwner+packedCapture를 가진 class1 sameframe ghost는 adapter snapshot 전후 live frame 현재성을 모두 확인. 기존 canvas/matrix 단회 재사용 |
| blit 이후 | 이미 완료한 synchronous drawImage 뒤 scope/프레임 변화는 ghost publication만 retire하고 returntrue하여 legacy 본체 중복 draw를 요청하지 않음. 완료 pixel rollback이나 parent silent GPU upload 검증은 UNKNOWN |

최초 main CPU52PASS·오라클FAIL1 및 별도limited6PASS는 보강 전325e/bc6f/e1f1 epoch 이력이다. 최종525d/8de8 소스의 새 guard/combinedCPU/native 결과와 합산하거나 최초실패를 지우지 않는다. 최종 검수는 아래 별도 epoch 결과로만 인수한다.


| 새 검수 epoch | 정확 결과 / 한계 |
|---|---|
| 초기 e1f1 main VM | 6그룹 중52조건 PASS 뒤 P4scope suspend1 기대 오라클FAIL1, P5/P6 두그룹 미도달,exit1. 실제 idempotent suspend2이므로 오라클정정·제품변경0 |
| 이전 main 한정 | P4scope expected2 및 최초미도달 P5/P6만3그룹6조건 PASS/FAIL0/미도달0/exit0, 원52 재실행0/clean58합산0 |
| 최종525d main guard | 새 currentness3그룹15조건 PASS/FAIL0/미도달0/exit0. 앞선main 숫자와 별도 |
| 최종 combined 최초 | actual factory+adapter+catalog+Three11그룹 중2PASS/1FAIL/8미도달,12조건 PASS1FAIL/exit1. descriptor.direction1/update.direction1을동시에준 방향 오라클 오류, 제품변경0 |
| combined 한정 | descriptor1/update0 한 조건+최초미도달만9그룹39조건 PASS/FAIL0/미도달0/setup0/unhandled0/cleanup0/exit0. 609mesh/Three수학·통제renderer/Canvas·IHDR Image, 실제RGBAdecode/GPUupload0. 원12반복0/clean51합산0 |
| 실제main 최초 native | Chrome1/context1/page1·3조건 PASS/FAIL0/미도달0/exit0. borrowed atlas480×1136→48²셀/609정점. idle direction7(SW) alpha>16=758/GL0,run direction4(N) alpha>16=580/GL0 |
| 정상 입력/설정 경계 | trusted KeyW down/up BODY, P.y7420→7336.933640000013→idle복귀. fresh isolated localStorage classseed1 사용, 실제 class선택UI 인수0. source6/mapexact, POSTmats1 서버도달전차단/user-save0 |
| native 종료 오류 별도 | main 체크시pageerrors0, 최종pageErrors에localStorage SecurityError1. 3maincheck 뒤about:blank와source의무조건classseed localStorage상하니스cleanup추정이며직접stack/시점귀속未관측. 제품원인확정0·재시도/제품변경0. pagehide disposecounts 미관측·ownedbrowserclosed. exit0을전체browsercleanPASS로승격0 |
| root PNG2/시각 | idle-main/run-main 직접판독:실버테일몸표시/이동한정. 회색평면지면·확대배경흐림·인접FX·작고어두운실루엣이남아 VISUAL VERDICT: RETOUCH. anatomicalfoot/8dir/공격특수사망/liveDSghost/실높이/전체native6/audio/save未인수 |

원자료는 동일 외부 silvertail-packed-main/validation-receipt.json4269B/f1ac0c5fc524bb218c1f3177a2a94de27ec8452889bdd734091001b4b05b9d8b, native-result.json108953B/5483e67a4b01b5f934041e8122d7a290d53ef660c27ccd3961ea89055f771143, visual-verdict.json2319B/0df7fb371ebf9a2bb5ea6ae3ef9c52cdb5e08c8f797fa78dca3b5ae30f66ac3e다. 이전 recovery42/native3/carry25/oldUV와 새 epoch를 재집계·재실행하지 않는다.


## 2026-10-07 다크드루이드 NORMAL 본체 borrowedSheet 소비 — ROOT-CH1-DRUID-NORMAL-MAIN-20261007

| milestone 접점 | 상태 |
|---|---|
| 코드 제작 | CH1 NORMAL 다크드루이드가 native final base8/walk/attack을 같은 decode/life/source 세대의 borrowedSheet rig로 표시하는 opt-in 소비 구현 |
| main 경로 | localhost/127.0.0.1:3387·ch1Three=1&ch1Rig=1·defaultOFF,stage0 field200×200 또는bossarena128×108 |
| 그대로 보존 | 원PNG/normal150msframe/기존body3pass/전투·소모·이동·충돌·save·맵·special/deathfallback |
| 아직 미인수 | 정상 새게임→게이트 개방→보스전 승리/부활 회귀·전체 본편 플레이·native8dir·special/death·audio/save·발/전체 시각. 이번 소비 코드로 playable 완료 선언0 |

상세 API·source3 전체 핀·검수 epoch와 한계는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다. 가드 전 native/시각과 최종 가드 CPU는 별도 인수한다.

| 최종 복수보스 guard | 현재 실제 제한 |
|---|---|
| `_ch1DruidSingleBoss()` | ens의 own-data `ib===true` 멤버가2개 이상이면 Druid rig scope 전체를 거부해 해당 보스 본체를 모두 legacy로 유지한다. 한 보스만 임의 우선 표시하지 않으며 다른 player/terrain adapter의 gate를 바꾸지 않는다 |
| count 경계 | 살아 있는 보스만 세지 않는다. dead/revive pending companion도 ens에 남은 ib 멤버이면 계속 거부; 제거 후에만 단일 scope 재진입 가능. ib가 아닌 일반몹은 count에서 제외 |
| 원인/보존 | 공용 HTMLImage lease의 복수 owner starvation과 단일 Druid adapter 공유를 코드 검토로 확인해 최소범위 제한. 여러 보스 rig 동시 지원은 미구현/미인수이며 기존 전투·생성·부활·ens 구성 변경0 |

| 검수 epoch | 실제 결과와 한계 |
|---|---|
| factory 새 CPU | 최종 factory c6dd source의 실제 factory/catalog/Three 수학·609정점/12본, 통제 HTMLImageElement getter. 최초1회 7그룹36조건 PASS, FAIL/미도달/setup/unhandled/cleanup0, exit0. native image/decode/PNG/GPU/main0 |
| combined adapter 새 CPU | 최종 modules c6dd/27dd의 실제 전체 factory+adapter/catalog/Three와 통제 Image/renderer. 최초1회 6그룹15조건 PASS, FAIL/미도달/setup/unhandled0, exit0; source4 전후 exact. GPU/PNGdecode/main0 |
| main 최초 guards CPU | b0c3 source의 실제 main 함수·원 pagehide statement 추출/통제 포트. 최초 Node1회/VM13개, 11그룹31조건 PASS, FAIL/미도달/unhandled0, exit0; game 전후 exact. 최종 복수보스 가드 이전이며 구31 재실행0 |
| native 최초1회 — 가드 전 | b0c3 source 실제 Chrome1/context1/page1의 기존 bosstest=0 testbed. 3조건 PASS, FAIL/미도달0, exit0. real HTMLImage/native decode2·ready2·failure0, idle base8와 normal attack887×1774·609정점/alpha127095·206083/GL0. pageerror/HTTP4040, POSTmats1 서버 도달 전 차단/user-save0. 실제walk0 |
| 최종 복수보스 한정 CPU | dd1d 최종 source의 실제 main 함수/통제 포트, Node1회4조건 PASS, FAIL/미도달0, exit0/source exact. 단일보스 admission,두보스 legacy,owner/observer revoke,pending companion·nonboss 경계만. 구31/native3 재실행0/추가Chrome0 |
| root PNG2 / 시각 | 가드 전 idle-main/resumed-main 직접판독: 정상 idle/attack 본체만 확인. 보스상단 camera 잘림·player/label/FX 겹침·평면 baked ground가 남아 VISUAL VERDICT: RETOUCH |

factory36/combined15/main31/native3/final-limited4를 하나의 clean 전체 PASS로 합산하지 않는다. native3와 시각은 b0c3 이전 source의 한정 증거이고 최종 dd1d source의 native 인수는0이다. 기존 bosstest=0에는 player boost/pillar removal 원동작이 내장되어 있어 정상 새게임→지역/게이트/보스전 전체 진행 인수0이다. 이전 warrior/strike/recovery/Silvertail CPU·native·실패·limited/cleanup epoch도 재실행·합산하지 않는다. 실제walk/native8방향·해부학발·DSghost·특수/사망·부활·보상/저장/audio·전체 본편/native6·물리 relief/full3D는 미인수다.

최종 근거는 외부 `druid-normal-main/validation-receipt.json`5368B/`dfdda24546843f67e2aff44b71d2770a46de4267a8aa29ef1089815c758fe5e1`, `visual-verdict.json`5420B/`3f6dcc7818ffe5e7d9a110d60d3baf62e995edb8129e3aae59b55e45cd161460`, `native-result.json`56979B/`70a55e20696a1b7fd4fd0ac8a5e8cea2204d5e8463622dc44de7893828ef1c92`, `multi-boss-limited-result.json`1043B/`88dc0a15ef1278ac3e25d4032cecb8ea695d69f7ff0f12ff30bfc3d9ff34171c`다. 최초main31/native3는 b0c3,최종한정4는 dd1d로 분리한다.

외부 `druid-normal-main/remote-preservation-receipt.json`는 root가 이 completion의 정상 commit/push 뒤 exact SHA·remote를 기록하는 보존 참조다. 정본문서에 자기 commitSHA를 순환 기입하지 않으며 이 참조를 현재 push 완료로 미리 주장하지 않는다.


## 2026-10-07 CH1 드루이드 단일보스 카메라 Y 프레이밍 — ROOT-CH1-BOSS-CAMERA-Y-FRAMING-20261007

마일스톤에는 아래 카메라 단위를 별도 epoch로 기록한다. 과거 본체/패키지/lab 성과를 새 정상 플레이나 native6 인수로 재분류하지 않는다.

현행 `game.html` working은 4,082,515B / `a2fa7293ab4b14041d2d512fe7661f7b4d645f50985f6264f32c4bd15004fad2`, root owned HEAD+변경 blob은 4,082,330B / `2abd290f0deb4cb9fb0559b41d9925fdddb73e3c414c07b0a0a175a1c7cd16db`다. shared game의 타인 WIP185B를 그대로 보존한다. 이번 변경은 카메라 targetY 한 접점이며 기존 보스 시트·rig factory/adapter·원본 이미지·AI·충돌·전투·저장 수치를 바꾸지 않는다.

| 경계 | 현재 계약 |
|---|---|
| opt-in | `localhost`/`127.0.0.1`:3387의 명시적 `ch1Three=1&ch1Rig=1`; 기본 OFF, storage/schema 추가0 |
| 본편 범위 | 기존 `_ch1DruidScope()`의 stage0·smoothing·production_finish 범위 안에서 editor 아님, `G.on`, `_bossArena===true`, 현재 ens에 속한 단일 보스, NORMAL intent와 native animation/image/sheet ready일 때만 적용 |
| 시트 | slash/slam/windup 또는 DruidVolleyWind/Volley는 attack, walk는 walk, 나머지는 base8. 기존 선택 시트 ready 필요, 새 프레임 시계0 |
| 유지 | 기존 targetX, boss zoom0.80/일반1.0, dt 보간→정수화→최종 map clamp 순서 |
| 폴백 | field·si3/finale·특수 intent·dead/revive pending·복수 보스·no-opt-in·editor·소스 미준비·유효하지 않은 경계는 기존 targetY 유지 |
| 한계 | authored 본체 사각형+P.r 충돌원만 고려. 실제 alpha/플레이어 sprite/label/FX 또는 첫 보간 프레임 fit을 보장하지 않음 |

정확 수식은 `docs/8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md`의 같은 unit 절을 따른다. 다음 zoom의 authored 본체+P.r 교집합에서 `_loInteger=ceil(lo)`/`_hiInteger=floor(hi)`를 만들고 finite·양수/`0<camSpd<=1`·가로 폭 fit·`loInteger<=hiInteger`일 때만 `round(targetY)`를 이 정수 구간에 clamp하고 `_ch1CamFitY=true`로 둔다. 원래 camSpd로 Y 보간한 뒤 이 flag에서만 이전Y<targetY이면 ceil, 그 외 floor로 정수화해 target 방향의 subpixel 진행 소실을 막는다. 범위 밖·invalid·zero·정수 구간 없음은 기존 `~~`가 그대로다. 부모 translation, base8 호흡 `abs(parentMul)*2`, intro 위/아래 각 `VH*.1` 예약을 반영하고 기존 targetX·zoom0.80·보간→정수화→map clamp 순서·rig calibration·맵 LOCK은 유지한다. 새 G 상태는 추가하지 않는다.

| 검수 epoch | 실제 결과와 인수 경계 |
|---|---|
| 최초044b CPU | 최초 Node1/VM60, 7그룹36조건 PASS/FAIL0/미도달0/exit0. 이 중 한계 관측은 PASS라는 이름으로 결함을 숨기지 않음: south130 상승 정착 bottom650.4 vs intro 가용하단648, 2.4CSS clip 반례를 발견 |
| 최초044b 미인수 | 첫 보간 screenTop−166.8352 vs intro72로 238.8352CSS 침범, 초기 zoom .988의 불가능 fit도 관측. 첫 보간/zoom 진입은 최종 directional rounding 이후에도 별도 미인수 |
| 철회된2306 CPU | 최초 한정1회 PASS0/FAIL1/미도달4그룹. `1/camSpd` 여유가 intro 허용 밴드보다 커 raw midpoint fallback, top−134.8352 관측. `ceil(lo+1/camSpd)`는 현재 계약에서 철회했으며 실패 원문 보존 |
| 최종a2fa CPU | 현재a2fa source의 최초 한정 Node1/VM53, 6그룹14복합조건 PASS/FAIL0/미도달0/unhandled0/exit0. 명시30case의 방향 정수화/정착 경계만 검증; south130 양방향 cam1954에서 top72.3648/bottom640.8, 단일 정수 band1954에서는 bottom648. universal/all-frame/actual alpha fit 인수0, 원36조건 재실행0 |
| 최초044b native | Chrome/context/page 각1, 기존 bosstest0 1280×720→1600×900 resize 2조건 PASS/FAIL0/미도달0/exit0; GL0·source5 exact·pageerror/HTTP failure0. 최종 directional rounding 전 이력이며 final native로 재사용하지 않음 |
| 최초044b 관측 | authored body+P.r snapshot 첫 screenTop81.8868/bottom591.0075, 둘째9.27929/518.39929, zoom 약.8000000034. rig quadTop80.5632/11.2104는 별도 read 시점 기하, PNG 동일 drawframe 인수0 |
| 최종a2fa native | 현재a2fa source의 최초 Chrome/context/page 각1, capture fit 1조건 PASS/FAIL0/미도달0/exit0, GL0/pageerror·HTTP failure0/source5 exact. trusted S 직후 delta130.0755였으나 90frame 뒤 보스가 약108 이동하여 capture delta54.5188; 고정 south130 native 인수0. 최종 authored top75.836074/bottom584.956853, rig quadTop73.97527은 capture 시점 관측만. POST /api/mats1 서버 도달 전 차단·user save0·owned browser 닫힘; physical GPU 해제 UNKNOWN |
| 직접 PNG 이력 | 최초 PNG2에서 큰 머리 잘림 개선·본체 식별, 둘째 뿔 상단 가장자리 가까움. label/FX/플레이어 겹침·반복 어두운 baked 지면으로 전체 VISUAL VERDICT: RETOUCH. 첫 PNG intro 검정 bar와 snapshot active=false 시점차 미해결 |
| 최종 직접 PNG 판독 | root가 현재 capture PNG를 직접 확인: full antler/body 식별, 아래 player/green FX 겹침·반복 baked 지면이 남아 RETOUCH. state bar0인데 PNG 검정 bar가 남아 intro draw/state 정렬은 UNKNOWN |
| 미인수 | 고정 south130 native, 완전 alpha/전방향 fit, 첫 보간/zoom 진입, normal route, 모든 resize, anatomical foot, native6/audio/reward/save, 전체 성능 |
| fixture | 기존 bosstest0 playerboost/pillar removal 포함. 정상 진행의 보스 진입 인수0. CPU/native/visual epoch별 별도 계수, clean 합산0 |

외부 증거 디렉터리: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-boss-camera-20261007/`. 최초 `camera-cpu-final-receipt.json` 8,969B / `d68d0679bb77ed45769cf87bfe128525fe10e788ef075faefc1b1acf0eafd35c`, 원결과 `camera-cpu-result.json` 31,138B / `0f862be1ba96ec337b9e052e15995a8afd7427ee896eec0da67ea20151a37dd9`, 최초 native `native-result.json` 8,562B / `c92d3982da42549996f0c261bacf1cd1a91911d7f72b17a485ebeddfea36cc50`는 보정 전044b epoch다. 철회된 중간 코드의 `quantization-implementation-receipt.json` 1,689B / `d5683e0a66d7f33cf4ef32b65863c13270e1927d049cd70bd86c418d107c4ae5`에 inverse exact/foreign185 보존이 기록된다. 해당 `camera-quantization-limited-receipt.json`은 1,660B / `88d4179ca7739f7f5aca088ad3dc302175c2b2328ebd9a30f4f700fd0c9b580e`다. 현재 최종 `directional-round-implementation-receipt.json` 2,666B / `d1ff0383c339fc0cb1ef4610ca959a8f941332a4c0e82c4725e555815080197d`의 rs3/inverse exact/foreign185 보존을 따른다. 최초 visual `visual-verdict.json` 4,437B / `c8767f12ab4d3c5ca4ab4e2d22522ad506f04db450ba8326000779e064a96626`와 최종 검수는 epoch를 분리한다. Git 사실은 같은 디렉터리 `remote-preservation-receipt.json`의 실제 normal commit/push/원격 정확 SHA로 확정하고 자기 commit SHA는 순환 삽입하지 않는다. 검수 관측 당시 checkpoint 전이며 deploy0이다.

최종 증거는 `camera-directional-limited-receipt.json` 1,194B / `ca55b57abcb6ca8dac42b1095bc6d0068e654d702788c7f558a7975190356e66`와 원결과 `camera-directional-limited-result.json` 27,932B / `eec9c743a15c2bbaf60aa67f95767676137927cac1a2dfe24a0b75e38f9c8f45`, `native-directional-result.json` 6,106B / `87217d74229d870ca564743d344da9dab690e11533b4e17a7ac30ac0caa2ee18`, `validation-receipt.json` 4,176B / `44b3be782d4c962d6bf2fcfefc3c7f7b4ef36d137e5ebd0ea63a8dc3e048521d`, `visual-verdict-final.json` 5,811B / `acf4a2165bb087d736815370ed1e55cca7485b73fe92f610d1b253d18411af2f`로 각각 보존한다. 최초044b36조건/native2조건·철회2306 FAIL1·현재a2fa CPU14/native1은 clean 전체 PASS로 합산하지 않는다.


## 2026-10-07 CH1 카메라 zoom과 마우스 조준 소비 — ROOT-CH1-CAMERA-MOUSE-AIM-20261007

플레이 가능 마일스톤에 새 input consumer를 별도 단위로 기록한다. 이전 camera·body·패키지·lab 결과를 새 mouse aim 검수로 재사용하지 않는다.

현재 `game.html` working은 4,084,115B / `b3439a539397e73dcc929d565f172a720facdb282b654e741b9f495e8fc6e6f3`, root owned HEAD+변경 blob은 4,083,930B / `ae8244039d7ecc7383fc96076d7ad7bf9e17d7044330d8c0737a333240130073`다. 원래 타인 WIP185B를 보존한다. 이번 단위는 카메라를 바꾸는 대신 입력 좌표가 실제 현재 zoom을 소비하게 한다. camera framing·zoom 보간·시트·애니메이션·전투·AI·충돌·저장 수치는 변경하지 않는다.

전역 `_setMousePosition`의 finite client/rect/raw 위치 guard와 CH1 opt-in의 zoom 역변환은 적용 범위가 다르다. 범위 밖 valid raw/finale 수식은 유지하며, 새 CH1 scope만 current rect+저장 clientXY를 현재 `G._camZoom||1` positive finite 값으로 재투영한다(.3 cap 없음). scoped point 계산 완료 후에만 원자 게시하고 `_set`은 boolean을 반환한다. 일반 mousemove/mousedown의 facing은 true일 때만, 패드 해제 첫 이동은 기존 `_gpClearAll()` 뒤 scoped `_set` 성공 시만 추가 갱신한다. 정확 표/수식은 `docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md`의 같은 unit 절을 따른다.

| 검수 | 현재 상태/경계 |
|---|---|
| 신규 CPU | 현재b343 source의 신규 actual main 함수·실제 input callbacks VM 검수: 최초 Node1/VM24/DOM rect141, 7그룹28복합조건 PASS/FAIL0/미도달0/exit0. 통제 DOM/gamepad 경계이며 실제 GPU/하드웨어 gamepad 인수와 구분 |
| 신규 native | 현재b343 source의 최초 실제 main bosstest0 Chrome/context/page 각1, 3조건 PASS/FAIL0/미도달0/exit0. 동일 trusted mousemove의 effective point/facing 오차0; 같은 이벤트의 legacy 각도 오차는 −.3038275023834693rad. resize1280×720→1600×900에서 새 mousemove0·point 오차0·저장 facing 유지, trusted W 이동 중 저장 facing 유지. source5 exact·GL0·pageerror/HTTP failure0. POST /api/mats1 서버 도달 전 차단·user save0·owned browser 닫힘 |
| visual | root가 실제 PNG1을 직접 판독: Druid antler/body 식별, 아래 작은 player·green FX 겹침과 반복 평면 baked 지면 남음. VISUAL VERDICT: RETOUCH. 그림의 보스 alpha 지점에 실제 공격이 적중한다는 pixel target hit 인수는 아님 |
| 이력 분리 | 이전 AIM read-only 계획의 구현0은 작성 당시 상태다. 현재 구현은 위 source핀과 실제 검수로 판단하며 옛 camera14/native1/105검색·공식원문 보존을 새 성과로 재실행/합산하지 않음 |
| 미인수 | 하드웨어 GP·arena exit 잔여 zoom의 native·normal route·boss lifecycle·shake/round/interpolation/alpha alignment·performance·native6/audio/reward/save. controlled CPU의 GP/arena exit 케이스를 실제 native 인수로 승격하지 않음 |

외부 증거 디렉터리는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-camera-aim-20261007/`이다. `implementation-receipt.json` 4,493B / `045a27500ee5504a75440a7d913359badd5a0c72ed885352a8072bd5d9423c86`의 exact replacements/inverse exact/foreign185 보존을 따른다. Git 사실은 같은 디렉터리 `remote-preservation-receipt.json`의 실제 normal commit/push/원격 정확 SHA를 참조하고 자기 commit SHA는 순환 삽입하지 않는다. 검수 epoch checkpoint 전·deploy0이다.

최종 `aim-cpu-receipt.json` 1,124B / `f4a25b7ae304f8c4665d9f7f821ced2f89e23fbdeb8f168ae661cd39056b6c7c`, `native-result.json` 12,782B / `451a9070a4177502675978364ae877263d32ed7f6ba4e33ba98f216fa8dcf901`, `validation-receipt.json` 1,994B / `be8dc72efa2c1b886df9683a6f89ca7a4667ffd8fd9f05f9235c0d825ccf490e`, `visual-verdict.json` 4,764B / `22108e6e5e55733b0a4c83150f6ed31a791d3ce07900c29f85a94d8c740c593a`를 각각 보존한다. CPU28과 native3은 별도 검수이며 clean 전체 조건으로 합산하지 않는다. 0707 공식 raw6와 다음 retry 계획도 별도 원자료로, 이번 AIM 제품 인수에 합산하지 않는다.


## 2026-10-07 사망 메뉴의 재도전 1회 소비 — ROOT-CH1-RETRY-MENU-CONSUMER-20261007

플레이 가능 마일스톤에는 현재 retry 메뉴 소비를 별도 제품 단위로 기록한다. 과거 패키지/음향/field 검사와 새 입력 인수를 합산하지 않는다.

현재 `game.html` working은 4,084,755B / `7e4002066c089e2a0d3fc6a6d2af5499d75aa4a3e677b08e4d10c9552f5080ec`, root owned HEAD+변경 blob은 4,084,570B / `8ba1a816d1a656d646f2967edc0431c087075d73b6bbedb75532d2aa0756402a`다. shared game의 타인 WIP185B를 보존한다. 변경은 현재 사망 메뉴가 첫 재시도 입력을 동기 소비하는 UI 접점이다. 기존 본문·EXP·field snapshot·자원·음악·save schema/API/backend를 변경하지 않는다.

현재 connected retryBtn의 named onclick selfidentity와 connected death.on·replay off·P.dead·!G.on을 먼저 검사한다. 통과하면 외부 게임 helper 전에 death.on을 동기 제거하고 death 하위 focus만 blur하고 settings.on일 때만 기존 closePanel('settings')로 그 패널과 pause를 해제한 뒤 invalidate와 기존 본문을 실행한다. OPT/다른 panel은 유지하며 closeAllPanels0이다. repeat Enter/NumpadEnter/Space만 preventDefault+stopPropagation; 첫 입력/Tab/패드 click은 유지한다. `_retryBusy`/finally/새 state는 없으므로 저장 pending 중 새 실제 사망은 그 메뉴의 guard가 성립하면 독립 재시도한다. await 이후 UI mutation0, backend의 늦은 save 효과 UNKNOWN. 정확 표/순서는 `docs/2_5 부활+에너지쉴드시스템/RESPAWN_RESOURCE_RESET.md`의 같은 unit 절을 따른다.

| 검수 | 현재 상태/경계 |
|---|---|
| 이전4249 CPU | 최초 Node1/VM21, 8그룹35복합조건 PASS/FAIL0/미도달0/unhandled0/exit0. 이 source 뒤 settings pause 반례를 추가 보정했으므로 최종7e4002 전체 PASS로 승격하지 않음. 재실행0 |
| 최종7e4002 CPU | 최종7e400 source의 settings 한정 최초 Node1/VM3, 3그룹6조건 PASS/FAIL0/미도달0/unhandled0/exit0. 실제 전체 final handler+기존 closePanel을 추출하되 새 settings 소비만 검증; normal init/stats/refill/finale/QS는 통제 ports·_dbReady=false. 이전4249 35조건은 재실행하지 않았으며 clean41/최종전체PASS로 합산하지 않음 |
| 신규 native | 최종7e400 source 최초 Chrome/context/page 각1: normal field 실제 적 피해10회→frame1109 HP0/P.dead/G.on false/death.on true의 자연사망 N1 PASS1. trusted Escape로 settings.on/G.paused true 관측은 재도전 전조건이다. trusted Tab40회에도 BODY에서 retryBtn 초점 미도달: phase/setupFAIL1·conditionFAIL0·N2/N3未도달2·exit1. 실제 retry activation/소비·settings closure·pause release·부활·재도전 후 이동·저장 미인수, 재실행0/추가Chrome0 |
| visual | root가 death/first-failure PNG를 직접 판독: 중앙 “부활 불가 1s” countdown과 설정/사망 패널 겹침으로 RETOUCH. death.on snapshot은 retry 버튼이 visible/focusable이라는 증거가 아니며 Tab 미도달의 원인 UNKNOWN. 실제 재도전/전체 visual PASS 인수0 |
| 브라우저 전 준비실패 | 최초 --root-ack 누락으로 CLI guard exit1/Chrome0/조건0/제품FAIL0. 원자료 보존 후 기존 root GO를 명시 인자로 공급한 실행이 위 최초 브라우저1회; 준비오류를 native condition FAIL이나 제품 suite 재시도로 합산하지 않음 |
| 네트워크/GL/저장 | pageerror0/HTTP failure0이나 의도적 external font 차단3·intro media abort3는 별도 관측이다. GL=`UNKNOWN_NO_RENDERER_WRAPPING_OR_NEW_CONTEXT`로 실GL0 주장0. synthetic mats2는 서버 도달0, 실save0·durable ACK 미인수, physical GPU 해제 UNKNOWN |
| 이력 | 이전 source별 retry/EXP/field46key/자원/음향 PASS는 해당 epoch 이력으로 보존. 이전 AIM28/native3/search51과 camera검사를 이번 메뉴 소비 성과로 재실행/합산하지 않음 |
| 미인수 | 실제 retry activation/repeat guard/settings closure/pause release·부활/완충/재도전 후 이동·pending 실save 중 다음사망 생애·boss death/열린문·정상 route 전체/native6·audio/reward/durable save·backend 늦은 save 효과·시각 전체 PASS. N1은 자연 필드사망만이며 boss 사망/native6로 승격하지 않음 |

외부 증거 디렉터리는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-retry-menu-20261007/`이다. 이전 `implementation-receipt.json` 1,914B / `2491d197877b441d5703306b3ccf4a9c1b289d6d001ab2910f18c1a05310d909`와 `retry-cpu-receipt.json` 4,373B / `05082a5cef7fef3d8848d57e652567c5452a1fd3f74b896a2d19c515ba8ceae4`는4249 source 이력이다. 현재 `implementation-final-receipt.json` 2,737B / `781b5167f12c6f855cffd63998982e878799a345ee065c77eca5d3c8bdafeec6`의 exact2치환/inverse exact/foreign185 보존을 따른다. Git 사실은 같은 디렉터리 `remote-preservation-receipt.json`의 실제 normal commit/push/원격 정확 SHA를 참조하며 자기 commit SHA를 순환 삽입하지 않는다. 이 증거 epoch는 checkpoint 전이며 deploy0이다.

최종 settings 한정 원문 `settings-receipt.json` 4,178B / `f2c077c5c7a57faa3df8e9c095f549f52eecd6bb6ec772434b0965cf31c80a9d`와 `settings-result.json` 7,267B / `812f248743b349671f522578d074d2ed459fcf596a74f66c2ec7a3c9fc0550d6`, 실제 native `native-retry-result.json` 133,977B / `b2dee048ac3e347415e7437c7df68daf8014e39ff8ca48677e7ba414bc780d55`, 브라우저 전 `native-cli-preflight-failure.json` 438B / `bc42a5c8fdea6b50bb73e4ec0e82949abade971f8bd16e508d2fe95b9f137d4a`, `validation-receipt.json` 6,019B / `3a367fd511c8819cbe74c2f2d75fa77c25ed4be3f820b7ee496d0f3b9f4d7978`, `visual-verdict.json` 5,268B / `e56ffe0466fd799cc972ff2cf63d883018170ff1604a3b5126fb930ea8af6aa7`를 별도로 보존한다. 새 editor N3 기대거절 원문 `codex-editor-import-official-manifest.json` 502B / `316193c436db197ec40a28b0e80dae5035b8e1718cde5debf01114ea123c6712`는 root가 미채택 보존한 자료이며 필수 hunk0·이번제품/검수채택0이다.


## 2026-10-07 사망 메뉴의 키보드 초점 — ROOT-CH1-DEATH-KEYBOARD-FOCUS-20261007

플레이 가능 이정표에 사망 메뉴의 키보드 초점 접점을 기록한다. 이번 구현의 검수와 전체 CH1 플레이 완료는 별도다.

현재 본편 `game.html`은 4,086,254B / `82262b4215e0dba0b1bfdef825b499e302ff3dd81b4b060d323475ea2b86444d`이고, 총괄 소유 변경만 담은 파일은 4,086,069B / `900e8683eddaa7caac72e1685cdbd2f13603aa457dc7e82ac69a82025e7fdc56`다. 본편의 다른 담당 변경185B를 보존한다. 새 변경은 `_handleDeathMenuKeyboard(e)`와 기존 window `keydown` 연결1곳, 기존 `keyup` 끝의 Space 연결1곳이다. 쉬운판과 기존 재도전 본문·자원·저장 순서는 변경하지 않는다.

사망 메뉴에서 Tab·Shift+Tab으로 현재 보이는 활성 버튼만 순환한다. 유효한 Enter·NumpadEnter·Space는 브라우저의 기본 버튼 클릭에 맡기며 직접 `.click()`을 호출하지 않는다. 재생 중이거나 분리·교체·숨김·비활성 상태가 된 버튼의 기본 활성화는 막는다. Space는 keyup에서도 다시 검사한다. 정확한 대상·제외 조건은 `docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md`의 이 절을 따른다.

이전 `ROOT-CH1-RETRY-MENU-CONSUMER-20261007` 절은 당시 소스의 이력으로 보존한다. 그 절의 “Tab 유지”는 이전 재도전 소비 변경의 범위를 뜻하며, 현재 사망 메뉴의 Tab 순환에는 이 새 절을 적용한다. 이전 검수 횟수와 이번 결과를 합산하지 않는다.

| 새 검수 | 이번 범위의 결과 |
|---|---|
| 한정 CPU | 최종82262에서 Node1·VM52, 실제 helper+전체 keydown/keyup·통제DOM. 7그룹·55조건 통과/실패0·미도달0·exit0 |
| 실제 브라우저 | 최초 Chrome/context/page 각1, 새2조건 통과/실패0·미도달0·준비 실패0·exit0. Tab1 초점→Enter 기본click→death/settings 닫힘·pause 해제→W 2프레임 이동·키 해제 |
| 오류·저장 | 소스3개 전후 정확 일치, pageerror0·HTTP실패0. 의도적 글꼴 차단3·intro 중단3 별도. GL UNKNOWN. synthetic matsPOST2 서버 도달 전 차단, 실제 서버 변경0·실저장 ACK0 |
| 시각 판정·한계 | 파란 재도전 초점 표시 식별. 재도전 직후 사망 화면 전환과 HUD·금빛FX 겹침으로 RETOUCH. 안정된 전환 종료 미인수. Space keyup·Shift+Tab·리플레이/로비·보스방/전체 native6·음향·실저장은 별도 미인수 |

자연사망은 이번 브라우저 검수의 준비 조건이며 이전 자연사망 성과를 다시 합산하지 않는다. 44c9 준비 구현은 실행0이고, 이전 재도전 검사와 이번 CPU·브라우저 결과도 합산하지 않는다. 브라우저 전 메타데이터 준비 오류1회는 Chrome0·제품 실패0으로 분리한다. 추가 검수 실행·자동 재시도는 없다.

정확한 소스·구현·검수 원자료와 정상 커밋·push·원격 SHA는 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-death-keyboard-focus-20261007`의 `implementation-final-receipt.json`, 최종 `validation-receipt.json`·`visual-verdict.json` 및 `remote-preservation-receipt.json`을 참조한다. 문서 작성 시점의 계획을 원격 보존 완료로 표시하지 않는다.
