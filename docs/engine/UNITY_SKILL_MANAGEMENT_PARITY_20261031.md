# 스킬 관리·선택 저장의 웹 대조 — 2026-10-31

상태: **제품 Core·스킬창 연결 후보 / 실제 Player·영상·공통·바탕화면 미완료**. 현재 실행·저장 소유9개를 대상으로 한다. 실제 원문 SKILL_LIST55개 전체 이식·합체 제단·드래그·일괄 강화·추천 자동 완료를 뜻하지 않는다.

추가 웹 실측: 현재 origin/main HTML과 SHA256가 같은3344 로컬 페이지의 실제 DOM에서 관리 버튼11개를 조작해 수치가 모두 일치했다(`web-management-current/웹-스킬관리-실제DOM.json`). 강타·얼음보주 재학습, 리셋 취소·확인, 가시덫 숫자2 장착, 무료 합체 양쪽 강화·감소를 확인했다. 단 참조 이미지1개404와 브라우저 종료 실패 때문에 실행 전체는 FAIL이며 Unity 실제 UI 통과 증거가 아니다. 사슬 초기 모체charge/구슬2개가 chargeBoost1 학습 후 모체chargeBoost/구슬6개로 바뀌는 실제 화면도 보존했다. 현재 Native의 고정 초기48정의가 전체55개 상태를 표현한다고 보지 않는다. 사슬충돌의9Core·Native4호출부·메타데이터57정의·명시적 사슬3단계QA는 작업 브랜치 후보로 반영했다. 현재 소유9종이며 실제 UI/새 저장3단계는 미검증이다.

## 실행 계약

| ID | 한글명 | 습득 SP | 원문 악의 원값 | 실제 악의 ceil(원값×.5) | 창 장착 위치 |
|---|---|---:|---:|---:|---|
| kiSlash | 기검참 | 10 | 0 | 0 | LMB |
| fireball | 악의구 | 10 | 0 | 0 | 마법/RMB 입력(창 의미 E) |
| spikeTrap | 가시덫 | 10 | 80 | 40 | 1~4 |
| giantSlam | 지옥강타1 | 10 | 120 | 60 | Space |
| holyDome | 회복의 영역 | 10 | 90 | 45 | F |
| iceOrb | 얼음보주 | 10 | 100 | 50 | Ctrl 또는 원문 장착 함수가 허용하는1~4 |
| maliceSwipe | 불꽃칼날 모체 | 10 | 80 | 40 | E 입력(창 의미 RMB) |
| shieldThrow | 불꽃칼날 합체 구성원 | 10 | 80 | 40 | 독립 장착 없음 |
| chargeBoost | 사슬기동:충돌 | 10 | 100 | 50 | 학습 레벨이 Shift를 강화, 독립 장착 없음 |

기존 무료 시작 지급은 그대로다. 표의 습득은 리셋 뒤 재학습 경로이며, 실제 원문 `_skCtx`·`_skLearnUp`·`skill-forge.js canEquip/equip`에서 읽는다. UI의 키 표시에는 실제 재지정 키를 사용한다. 표시 메타데이터의 upSp5를 실행 강화 비용으로 사용하지 않는다.

| 함수/동작 | 현재 수치·순서 |
|---|---|
| `LearnSkill`/`CanLearnSkill` | 미습득·SP≥10·실제 악의 충족. SP10/악의 차감 뒤 Lv1. 기검 Config 레벨도1. Space/F는 해당 빈 슬롯만, 가시덫/얼음보주는 빈1~4에 자동 배정. 얼음보주 학습만으로 Ctrl을 덮어쓰지 않음 |
| 일반 강화 | 기존 SP1, 최대20, 플레이어 레벨 잠금 min(20,floor(LV/50)+1) 유지 |
| `LowerSkillLevel` | 일반은 Lv>1에서1감소·SP1환급. 기본 합체 구성원은 min(두 레벨)의 이전 단계로 모두 낮춤. 낮아진 단계≥9이면 SP6, 아니면 SP2환급. 상위 구성원 레벨을 임의 보존하는 방식으로 바꾸지 않음 |
| `ResetSkill` 확인 취소 | 레벨·SP·악의·슬롯 변경0 |
| 일반 리셋 | 환급 SP=10+Lv−1. 기검참/악의구/가시덫은 습득 SP10을 빼고 Lv1 유지, 나머지는 Lv0. 배정된 숫자/궁극기 슬롯을 비우고 대상 Ctrl이면 ghostWalk 폴백. 악의 환급0 |
| 기본 합체 리셋 | min(두 레벨)−1단계를 각 구성원에서 뺌. 단계 i=1..min−1마다 i≥9이면 SP6, 그 외 SP2환급. min≤1은 무변경. 무료 기본 합체 유지 |
| `EquipSkill`/`CanEquipSkill` | 표의 위치·학습 조건만 허용. 숫자 슬롯 장착은 해당 ID의 다른 숫자 슬롯을 먼저 비움. Ctrl 장착은 숫자 슬롯을 임의 제거하지 않음(실제 웹 함수 순서) |
| `NativeSkills` | 강화+/감소/습득/장착 성공에서 `RequestCombatSave`. 리셋은 확인·취소 모달, Enter 확인/Esc 취소. 리셋 후 선택 구슬을 유지해 같은 정보판에서 재학습 가능. 기존 저장 간격30초/5초 유지 |

## 선택값 저장 보존

원문 dbRestore 함수 범위의 Ctrl 유효성은 `ghostWalk`, `iceOrb`, `timeWarp` 후보 또는 습득 레벨≥1이면 보존하고 그 외는 ghostWalk다. 이는 전체 진입 결과와 구분한다. 데모62511~62513은 로드 뒤 얼음보주를 보장하고 **미습득 Ctrl만** iceOrb로 보정한다. 일반 캐릭터 진입62814~62821은 기본 스킬을 보장하고 **항상** Ctrl iceOrb로 배정한다. 로컬 테스트64336~64349의 새 캐릭터 분기와도 혼동하지 않는다. 현재 Native 로드 후 `ApplyLoadedStarterSkillDefaults(savedSkills,!BuildFlavor.Current.DemoMode)`가 두 제품 분기를 적용한다. 기존 선택 보존48검사는 dbRestore/Codec 수준이며 전체 진입을 통과했다고 보고하지 않는다.

궁극기 슬롯은 저장의 습득 레벨≥1인 선택을 보존하고 `CaptureSkills`에서 실제 `Skills.UltSlot`을 전달한다. 미이식이지만 습득된 Ctrl 선택은 별도 보존값으로 캡처한다. 시스템의 실행 기본 배정 때문에 미소유 저장을 지우지 않으며, 사용자가 Ctrl 장착·현재 고정 스킬 리셋을 명시적으로 실행하면 보존값을 해제한다. 이 호환 정책은 미소유 데이터 보존을 위한 예외이며, 전체 웹 진입의 실행 선택과 저장 원문을 구분한다. 미소유 레벨·실행기를 새로 활성화하지 않는다. 미소유 skills·숫자 슬롯·미래 키는 기존 Raw/Codec 경로로 보존한다.

`RestoreSkills`는 원문의 기존 저장 마이그레이션대로 가시덫/지옥강타/회복의 영역을 최소1로 보장한다. 숫자 슬롯의 얼음보주를 제거하고, 잘못 배치된 영역·Space 스킬을 복구한 뒤 지옥강타/가시덫을 해당 빈 슬롯에 자동 배정한다. 미소유 Raw 슬롯 위치는 예약해 새 자동배정으로 덮어쓰지 않는다. 회복의 영역은 비어 있다고 임의 F 자동배정하지 않는다(원문 자동배정 제외 목록).

E 활성값을 maliceSwipe로 정규화하는 것은 원문 `_ensureBaseWingStrike`와 같으므로 유지한다. 앞선 조사에서 가능성으로 제시한 E 선택 소실을 결함으로 확정하지 않는다. 신규 캐릭터의 기본 Ctrl iceOrb 지급과 기존 저장의 ghostWalk 폴백은 구분한다.

| 실제 원문/제품 회귀 | 수정 전 | 현재 제품 Core |
|---|---:|---:|
| 강화 감소560조건 | 390차이 | 0 |
| 확인/취소·일반/합체 리셋576조건 | 232차이 | 0 |
| 재학습648조건 | 288차이 | 0 |
| 13슬롯 장착416조건 | 32차이 | 0 |
| Codec 복호→Simulation 복원→캡처→부호48조건 | 40차이 | 0 |
| 복원 슬롯144례×복원/데모2단계288검사 | 복원114례·데모144례 차이 | 0 |
| 복원 슬롯144례×복원/데모/일반3단계432검사 | 앞선288 RED에서 확장, 일반 진입 원문 추가 | 0 |
| 일반 진입 기본 보정 뒤 미소유 선택48례 | 18차이 | 0 |
| 미소유 선택의 보존/사용자 장착/리셋54검사 | 앞선18 RED의 편집 경계 확장 | 0 |

원문 HTML SHA256은 `38e5b2ce0f35d4d9303457211e7d4107e611c3f9a13f011039b09a8a51c33706`이다. 원문 함수·조건 블록을 그대로 실행한 I: 회귀이며 실제 UI 마우스·손조작·재기동 저장 증거와 구분한다. 근거: `I:/EXODUSER-Storage/demo-art/gameplay-parity/skill-management-product-r2/`, `skill-equip-product/`, `save-skill-boundary-product/` 및 대응 RED 폴더. 첫 제품 관리 실행은 원문 JSON 파일명 오기로 실행 전 실패했으며 수치 실패나 통과로 합산하지 않는다.

추가 근거는 `restored-slots-red/`, `restored-slots-product/`, `restored-slots-all-modes-product/`, `save-native-foreign-red/`, `save-native-foreign-product/`, `save-native-explicit-choice/`다. `Tools/SkillManagementCheck.cs`는 `--unity-skill-management-check -skill-phase write|read|verify`에서만 실행한다. 세 프로세스에 같은 명시적 격리 sandbox를 지정하며, 실제 자기 숨은 창의 WM 마우스 이벤트→기존 IMGUI에서 강화·리셋 취소/확인·재학습·번호슬롯 이동·Ctrl 재장착·실제 저장·두 번의 새 프로세스 복원을 검사한다. 전역 포인터/SendInput은 사용하지 않는다. 초기 SP40/악의1000, write 최종SP40/악의890·가시덫2번, read 재학습/재배정 후SP40/악의840·가시덫1번을 verify에서 재확인한다. 현재 실제 실행 전이다.

## 종료 지연의 별도 조사

02d268a81 입력의 새 정식 빌드/동일 M1 def19879는23/23·시작1,350틱/표시49검사는0이다. 그러나 이동540 결과 생성 뒤 공식 종료가2회 실패했고, 같은 EXE에 `-force-gfx-direct`만 추가한 진단도 실패했다. 상시 렌더 플래그 변경을 채택하지 않는다. 다른 보스 후보 M1에서도 같은 종료 지연이 보고되어 원인을 현재 스킬 표시 코드 하나로 단정하지 않는다. `Input Shutdown` 이후 종료 지연은 과거6000.4.8f1의 `CodeReloadManager destroyed` 이후 접근 위반과 같은 결함으로 취급하지 않는다.

`--unity-shutdown-trace`는 명시적 격리 QA에서만 `종료-경계.tsv`를 쓴다. Player 캡처/가상 장치 반환, 기존 미디어 정리, Quit 요청, 저장 종료 콜백, 표시/오디오 Dispose, managed 종료 이벤트의 완료 지점을 기록한다. 종료 방식·강제 종료·대기시간을 바꾸지 않으며 일반 실행에는 파일 IO가 없다. 이 진단 코드를 추가한 새 빌드는 아직 실행 전이다.

현재 모든 GP GPU/인코딩 작업은 중단했고, 공식 자기 잠금·예약을 반환했다. 실패 실행의 종료 중 Windows 핸들 잔존을 정상 정리로 보고하지 않는다. 실제 Player 종료·전체 대조·영상이 통과하기 전 READY/공통/Desktop 반영은 보류한다.


## 현재 오프라인 회귀와 실행 대기

최종 설치 Unity 참조 독립 컴파일 Core/Runtime 오류0(기존 경고2/17). 관리 변경 뒤 현재 Core로 다시 실행한 save oracle2604/0·skill oracle13216/0, 시작스킬1350·이동540·기검1040·구르기80·적전투900·Q쿨다운20·E경계14 모두0, 기존 SkillSim107/0이다. 의미 있는 새 데이터/원문 회귀와 실제 Player 증거는 구분한다. 근거 management-final-independent-compile, management-product-gates, management-source-oracle, management-legacy-skill-sim. 새 관리 UI 검수기의 최초 독립 컴파일은 private Running setter 접근2건으로 실패했고 기존 접근 제한을 보존한 검수 전용 reflection으로 수정해 오류0을 확인했다.

미습득 정보판은 원문과 같이 습득 버튼만 표시하며 강화 감소·리셋 버튼을 숨긴다. 기존 부분 후보의 수치/영상은 새 소스의 실제 Player 합격 증거로 재사용하지 않는다. 종료 지연은 현재 Native 한 후보와 독립 보스 후보에서도 보고됐다. WCT 읽기는 자기 종료중3개 모두 단일 blocked 노드/순환false였으나 원인 객체는 식별하지 못했다. 권한 토큰/드라이버/시스템 설정/종료 방식 변경0, 새 상시 gfx 플래그 채택0이다. 다음 정상 실행 경계에서 기존 고정 EXE의 GPU batch 대조1회로 숨은 창 경로와 구분할 계획이며 아직 실행하지 않았다.


## 2026-10-31 종료 실패 로그의 공유 읽기

`Read-RunLogShared`는 자기 Editor/Player 로그를 Open/Read·FileShare.ReadWrite·UTF-8 BOM 감지로 읽는다. 기존 writer가 열린 상태의 ReadAllText 공유 위반 때문에 종료 실패 영수증 생성까지 중단되는 문제를 분리한다. 파일 쓰기·권한 변경·새 실행·종료 방식은 바꾸지 않으며 성공 조건을 완화하지 않는다. 시간초과/비정상 종료/사용자창/세이브 변경은 기존 그대로 실패이며, 로그를 읽었다고 Player 정상 종료가 되지 않는다.

쓰기 핸들을 유지한 독립 대조군은 기존 읽기 실패→현재 공유 읽기 통과였다. 실제 과거 실패 로그 f3ea160c를 새 실행 없이 재조회했고, 합성 시간초과/잔존 입력의 Finish-Guarded 결과가 ok=false·timedOut=true·exit=-1·잔존1임을 I: 전용 selftest 폴더에서 확인했다. 합성 결과는 전역 unity-jobs/done에 만들지 않았으며 실제 Player/GPU 검수로 세지 않는다. 근거 I:/EXODUSER-Storage/demo-art/gameplay-parity/player-log-share-red, player-log-share-green, player-log-timeout-verdict.

별도로 05:43 GPU batch 시작은 OS PowerShell Operational4100에서 Start-Process Access is denied로 확인됐다. Player 생성0·빈 로그이며 이 reader 수정으로 실행 거부가 해결되는 것은 아니다. 권한 변경·다른 실행 API/경로 재시도는 하지 않는다. 해당 시도는 엔진 batch 동작 판정에 사용할 수 없고, 기존 Native InputShutdown 이후 종료 지연과 구분한다. 근거 combat-final-r2/배치-시작실패-OS이벤트.json·배치-시작후-프로세스.json.

GPU 파서에는 별도로 기존 결함을 정정했다. 파일이 없거나 Renderer 이름이 없으면 메모만 남기고 extraOk=true였던2조건을 false로 바꿨다. 실제 현재 Cmd-Player 파서 블록만 추출한4대조군(파일없음/이름없음/Null/이름있음)은2실패→0이다. 실제 GPU 실행이 아니며, 기존처럼 Null GPU·시간초과·비정상 종료는 실패다. 근거 player-gpu-parser-red/green.


## 2026-10-31 새 정식 빌드의 실제 종료 판정

edf 입력 새정식빌드 d0ade204 컴파일0, 같은 M1 549945c8 단계23/23이지만 공식전체는 ok=false/timedOut=true/exit-1이다. 종료전 메인→HIDInput 대기, 관리코드 OnApplicationQuit/OnDestroy 및 표시/효과음/HUD Dispose 완료를 계측했다. 종료성공·실제관리UI3프로세스·공통/Desktop 검수는 미완료다. 외부 I:진단래퍼의 exit손실 오판은 공식JSON으로 교정·이력보존했고, 상세는 UNITY_HID_SHUTDOWN_DIAGNOSIS_20261031.md다.

사슬 선택 activeChargeSk·장비 bonusChargeStock·사망 재충전·제단 모체의 현재 세부 계약과 실제 검수 대기 항목은 [사슬충돌 후속](UNITY_CHARGEBOOST_PARITY_20261031.md)을 따른다. NativeGame.CombatSave 호출부까지 함께 인수해야 한다. 기본 charge/parry 정보판은 레벨·습득/강화 버튼을 표시하지 않는다.
