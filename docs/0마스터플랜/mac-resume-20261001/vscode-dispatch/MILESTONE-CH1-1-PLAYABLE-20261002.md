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
