# 2026-10-02 Mac 앱 실물 실행 검수

## 현재 확인
97db3f1a 기준 7,918개 입력을 실제 app.nw에 포함한 arm64 앱을 생성했다. 생성 증거는 outputs/team-review-20261002/mac-app/execute-result.json이다. 최초 PID8841은 NSAlert modal에서 대기했고 서버3381/profile이 없었다. 경고 본문은 확보되지 않아 원인 메시지 자체는 UNKNOWN이다.

생성 앱 package.json의 `--user-data-dir="/무공백/절대경로"`에서 인자 내부 literal double quote만 제거했다. 원 manifest는 launch-original-package.json에 보존했다. 부모 mkdir·보안 flag·서명·quarantine 변경 없이, 종료에 반응하지 않던 본인 테스트 PID만 종료 후 다시 실행하자 profile 생성·127.0.0.1:3381 LISTEN·네이티브 NW.js 로비가 확인됐다(16:39:44Z). 사용자 기존 Chrome 게임/프로필/세이브는 조작하지 않았다. crashpad의 초기 기본 metadata 경로 사용이 관측되어 모든 NW 내부 로그까지 고유 job으로 격리됐다고 주장하지 않는다.

BUILD가 동일 오류의 재발 방지를 packager에 반영했다. 공백 없는 절대 프로필을 따옴표 없는 토큰으로 생성하고 공백·단/쌍따옴표·제어문자·DEL 경로는 PLAN BLOCKED한다. 미검수된 공백 경로 지원을 주장하지 않는다. root가 코드 diff와 43회귀 PASS를 확인했다. 생산 게임 코드는 변경하지 않았다. 실행 앱은 현재 수동 파생 수정본이며 새 빌더 결과의 실물 검수는 별도 기록한다.

## 네이티브 검수 진행
- 로비 입장, 세계관 영상과 한국어 자막, 데모 로비, 전사 캐릭터 생성 UI를 확인했다.
- 격리 프로필에서 MacTest 이름으로 생성 절차를 진행했다. demo의 실제 진입 URL은 `game.html?test=1&slot=demo&demo=1&story=warrior-v21`이다. 일반 캐릭터 슬롯의 영속성으로 확대하지 않는다.
- 전사 이야기 재생 및 화면 클릭/Enter로 다음 대사 진행 후 game.html 에셋 로딩 완료까지 확인했다. 설정·게임플레이·저장·재실행은 아직 검수 중이다.
- 캐릭터 선택의 비디오 요소에서 네이티브 AX에 “미디어를 재생할 수 없습니다”가 나타났다. 원인/코덱 단정0, 전체 미디어 품질 PASS 아님.

## UIUX 카드 소멸
실제 추출 렌더러의 새 후보 host에서 본편/easy × KO/EN × 실제 CSS off/on 8조합을 브라우저로 검수했다. Enter/Space 상세 진입 → 실제 Tab → 장착 버튼 → hover 종료 → 재렌더 카드 복귀 → 카드 삭제 시 invClose → 닫기 후 실제 opener 복귀 모두 확인했다. 상세 텍스트 선택/렌더 구조는 판본마다 달라 Tab 횟수는 본편2/easy1이다. CSS on의 inline hidden/computed visible은 별도로 기록했으며 아이템 소멸 초점은 올바르게 복귀한다. 증거 uiux-native-matrix.json. DOM 기능 후보를 인수하지만 전체 게임 화면·물리패드·생산 통합 인수는 아직 아니다.

## 다른 팀 제출의 root 확인
MAP cleanup24 + root before2/after2, SKILL thunderStake23, ENEMY boundary8, ART preview13, BALANCE save-inflight29는 앞 검수에서 확인했다. 이번에는 QA busy-save7, BALANCE unload25, ITEM U-D17 24그룹, ART engine-parity24, ENEMY 순서 fixture, ANIM 부활 reachability 모델을 root가 재실행했다. 함수/모델검사를 실제 게임 성능·시각 PASS로 대체하지 않는다. 생산 미적용 후보는 그대로다.

QA는 busy 저장이 끝난 뒤 보류분을 다시500ms 디바운스하는 잔여 유실창을 발견했다. 기존 BALANCE에 immediate-drain 한 건을 배정했다. BUILD 프로필 영구수정도 기존 세션에서 수행했다. 새 세션/하위 에이전트0.

## 팀 현황의 증거 정정
팀별 실제 수신/Read/Write/최종 응답은 기존 Claude JSONL과 공식 read_thread 결과에서 대조했다. MAP 등 일부 소유 receipt의 미래 시각 및 30a204… HEAD는 현재 사실로 인수하지 않았다. 기존 행은 해시별 history JSON에 보존하고 TEAM_UTILIZATION_20261001.json을 실제 사건시각/현재 과제 단위로 갱신했다. 완료·검수대기는 가동으로 세지 않는다. SOUND는 접근 차단으로 미전달 상태 유지. 현재 원격SHA는 갱신 시 실제 ls-remote 결과/시각을 따른다.


## 후속 패키지·잠금 게이트 (2026-10-01T16:47:21.604Z)
프로필 영구수정은 원격 179813c2ebdd8e52e564d4183240968c1442e477와 정확히 대조했다. 해당 빌더로 고유 job abf57f41-ebe0-4393-852f-0522f5750f9a / loopback3382 / 새profile·save의 실제 앱을 생성했다. 7918입력·런타임·출력 대조 후 2026-10-01T16:46:24.764Z PACKAGED_NOT_RUNTIME_ACCEPTED 반환. 새 앱 자체는 아직 실행하지 않았다. config delta/result/log는 profile-fixed-build-*이며 큰 원입력 config는 기존 커밋본을 참조한다. 첫 앱의 수동 수정·테스트 profile은 보존했다.

첫 앱은 game.html 에셋 로딩을 마치고 네메시아 도입 장면을 실제 표시했다. 그 직후 화면 제어 도구가 Mac 잠금 및 자동 해제 실패를 반환했다. 사용자에게 직접 잠금 해제를 요청했으며 잠금 우회·설정 변경·다른 입력 경로 시도0. 실전 HUD/설정/저장복원/재실행 검수는 **잠금 해제 대기**, 완료로 세지 않는다. 첫 앱 3381 프로세스와 테스트 프로필은 보존했다.

BALANCE immediate-drain은 기존 세션 완료 후 root 독립17PASS를 확인했다. 일반500ms는 그대로, 보류분 완료 뒤 재디바운스만 제거하는 미적용 후보다. dispatch/ACK/persist 구분과 실제 종료 보장 없음 유지. 생산 수정0. 원팀 산출의 원시 시각 주장은 정정 근거와 구분하여 보존한다.

16:48:30Z 현황: 완료제출/통합대기9, BUILD 캐릭터미디어 후속은 실제Read·receipt 작성 후 공식 latest turn interrupted(원인미확정), SOUND 접근차단/미전달1. BUILD를 실행중으로 세지 않으며 동일 과제를 재전송하지 않았다. 프로필 수정43검사/원격보존은 그 이전 완료 작업이다.


## 소스 통합 후속과 BUILD 완료 정정

BUILD 미디어 진단의 공식 turn 완료16:49:38Z를 확인했으므로 위16:48:30Z interrupted는 당시 중간 상태로만 보존한다. 파일 누락/복사손상 근거는 없지만 native media.error 원인은 미확정이다.
UIUX는 17:01:02Z 완료·HTML 소유권 반환 후 root 생산 추출23검사/전체승인 byte 검수와 원격66998de7d0c2f25a1261825ec52957cc0464e983를 확인했다. 이후에만 BALANCE 저장 통합을 전달했다. ITEM 실제 소스 어댑터13그룹은 비활성 검토용으로 원격375aa9e4에 보존했다. 현재 소스 통합과 이전 두 패키지 앱은 버전이 다르며 앱 실행 완료로 표시하지 않는다. 상세 PRODUCTION-INTEGRATION-20261002.md.

## 2026-10-02 확정3수정 포함 최신 실제 Mac 후보

현재 실제앱 b3f52d84-90e5-4eca-ac38-bc2a874a0f43은 source checkpoint7ccb72c0의SOUND/ITEM/캐릭터입장취소 세 수정을모두포함한다. fresh execute1·내부verify1 exit0, main ce171131…/easy8c7d8208…/index1dd28cab… 실앱사본동일·7918입력/340runtime exact·8253regular+5symlink/7043802009B. 고유port3385·절대profile/save·bundleID를확인했고현재user-state미생성. 기존c927 dd333 snapshot·user23·기존앱/세이브보존, download/install/서명/기동0. 실제native·CH1-1 연결6단계/화면/청취/저장인수는미완료이며Mac잠금해제질문은이미남겨두었다. 소스freeze는사본확인후해제하며팀별독립후속작업과감독종료복구는계속한다.

[새 실제 후보·정확SHA·기동/검수Gate](../../../13출시·마케팅/MAC_CH1_LATEST3_CANDIDATE_20261002.md)가현행앱기준이다. 이전c927/runtime/partialfixture보고서는그시점snapshot으로보존하며source/모델PASS를제품/nativePASS로확대하지않는다. 관련docs전체rg1회47행/15문서분류를근거로현재Master/build/runtime정본·root기록과새보고서를동기화했다.


### 2026-10-02 최신 source4 Mac 후보 생성

97bb3ef9-fff2-4761-9841-e5a24a953847 앱은 codeca7e0bb0/원격backup e764ed33의 네sourcefix를포함한다. main e462f234…/easy68fa8e17…/index1dd28cab… 원문·stage·실앱동일, inputs7918/비파생7916/runtime334+메타6 exact. freshplan1/execute1 exit0/내부verify1/readinventory1, 별도verifier/재빌드0. regular8253+symlink5/7043803133B, 고유port3386/profile-save. 기존앱·user23·원자료·cache보존. 최종receipt743842ae…/20421B, configcdf9ba83…/3428980B. sourcefreeze는사본생성완료로해제한다. 실제앱기동/6단계플레이/visual/청취/영속save는0으로활성목표는미완료다. [현재후보정확계약](../../../13출시·마케팅/MAC_CH1_SOURCE4_CANDIDATE_20261002.md). 함께보존한BOSS철회/BALANCEGPnav원자료2는제품적용0이며readiness dee37149… exact2다. 감독단일오더전담/총괄생산·검수·Git 역할을유지한다.


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
