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
