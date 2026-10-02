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
