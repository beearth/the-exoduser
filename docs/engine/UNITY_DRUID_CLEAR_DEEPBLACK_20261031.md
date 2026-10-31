# 드루이드 처치 후 정지 조사와 광택 블랙 탄막 — 2026-10-31

사용자 직접 요청 `user-druid-clear-deepblack-20261031` 및 확정 범위 “Q와 E 모두 패링할 수 없는 탄만 광택 딥 블랙”의 최소 후보다. WASD와 ESC 모두 응답하지 않았다는 추가 확인을 반영한다. 이전 미채택 스킬 16종과 분리한다. **처치 후 정지는 현재 CPU 검사에서 미재현이며 해결 완료가 아니다. 표시 후보도 실제 Player·Desktop 검수가 남아 있다.**

## 기준과 보존

| 항목 | 확인값·범위 |
|---|---|
| 사용자 원본 | `G:/exoduser-wt/codex-latest-desktop`, `14cc014d05cef9adc333c9f1a4c15b25040500d8`, 읽기 전용 |
| 사용자 실행본 | `I:/EXODUSER-Storage/demo-art/latest-desktop/build_new/EXODUSER-Unity.exe`, `-force-d3d11 --remodel3d` |
| Runtime SHA-256 | `4671345cf2c80632c2319a220d462303f92d1bd3d577f74e7ba9bda0851bd748` |
| Core SHA-256 | `51b7ae0699b5aa041d5c02160fad61f78003e26d8aab02876206f0fb7d1c84bc` |
| 소유 작업본 기준 | `a5ff550499b61697753ac2f091c6cfe61c78cf16`, 시작 INDEX 0. 타인 `tools/guard.baseline.json` 보존 |
| 분리 가능한 입력 | 변경 전 `NativeBossView.cs`, `NativeDruidArt.cs`는 사용자 원본과 바이트 동일. 해당 두 파일과 신규 DruidProjectileAppearance/NativeGame.DruidClearDiagnostics의 총 4파일을 사용자 원본에 적용. 현재 표시 소스 36b4a74c1, 설치 Unity 참조 컴파일 오류 0. 원본 Runtime tracked 변경 0을 08:03 UTC 재확인 |
| 금지 범위 | Core 수정 0, Q/E 판정 수정 0, 저장 수정 0, 일시정지·임팩트 담당 파일 수정 0. 기존 스킬 16종의 전체 브랜치 통합 금지 |

## 원인 조사

| 경로 | 실제 함수 CPU 결과 | 한계 |
|---|---|---|
| 기본 드루이드 | 사용자 Core DLL의 `HurtEnemy`·부활·`StageFlow` 실행. 최종 처치/출구 개방 1159틱, 실제 충돌 이동 후 클리어 2719틱 | 피해량·생존을 통제한 원인 분리 검사이며 자연 플레이가 아님 |
| 리모델 드루이드 | 같은 사용자 DLL, 리모델만 명시. 최종 처치/출구 개방 799틱, 이동 후 클리어 2359틱 | 통제된 검사. 일반 `--remodel3d`만으로 리모델 전투 플래그가 켜지는 것은 아님 |
| 호스트·레벨업 | 사용자 원본의 `FixedUpdate`, `StageFlowPump`, `OnLevelledUp` 본문을 추출해 실행. 두 모드 모두 `Running=true`, 결과 패널 표시, 레벨업 표시 1회, 출구 SP +10 1회 | Unity·실제 UI·저장 경계는 명시적 스텁. GPU·포커스·OS 입력·실제 저장 완료를 증명하지 않음 |
| 플레이어 부활·사망 | 저체력에서 실제 `HurtPlayer`로 fallen 진입. 300틱 대기 동안 Running 유지, 성공은 idle/HP100/Running=true, 실패는 dead/HP0/Running=false | 첫 전HP 검사에서는 기존 한방캡으로 stagger여서 검사 전제가 실패. 저체력 전제만 수정했으며 프로덕션 피해 규칙 수정 0 |
| 사용자 스크린샷 | 원본을 직접 열어 확인·I: 보존. 보스 바가 없는 정지 장면만으로 죽음·정지 원인을 확정하지 않음 | 단일 정지 이미지로 틱/Running/포커스/마지막 예외 판단 불가 |
| 초기 사용자 로그 | 실행 경로가 일치하는 04:11 UTC 로그 사본 보존. 예외 기록 없음 | 최초 정지 순간과 동일 실행인지 미확정. 이후 새 종료 크래시 기록은 아래와 분리 |

출구 규칙은 `BossDefeated → ExitOpened → 출구 타일 이동 → StageCleared`다. 처치 직후 자동 클리어로 바꾸거나 Running을 강제로 재개하는 우회 수정은 하지 않았다. 실제 정지 순간의 호스트·렌더·포커스 관측이 다음 진단에 필요하다. 다른 active 담당의 일시정지 파일은 보존한다.

## 표시 대상과 보호 계약

초기 후보 c1dc47021 및 진단 포함 5fd9bdab9의 색상 범위는 **기각·정정**한다. 반사 불가만으로 패링 불가라고 분류한 것이 원인이다. 기존 두 커밋만 제품에 인수하지 않는다.

| 실제 분류 | 사용자 DLL 전체 충돌 결과 | 정정 표시 |
|---|---|---|
| 별도 DruidBoss.Orbs | Q/E 접촉 패링 모두 성공 | 기존 녹색 24프레임 클립 복원 |
| 기본·리모델 physical/magic/forbidden 독탄 | TryReflect 이후 일반 HurtPlayer 훅에서 Q/E 패링 보상 발생 | 기존 녹색 유지. remodel 또는 forbidden만으로 검게 선택하지 않음 |
| blackBean | resolver는 Q 전용/E 반사 불가지만 일반 피해 훅에서 E 패링 보상도 발생 | 기존 표시 유지. 확정 설계와 현재 바이너리의 불일치는 별도 인계, Core 수정 0 |
| DruidPoison이면서 Web인 적대 이동탄 | 일반 피해 훅을 우회. 기본 모드는 실제 class가 forbidden일 때, 리모델은 TryReflect 금지일 때만 Q/E 모두 불가 | 광택 딥 블랙 후보. 명시 magic/physical 기본 모드는 제외 |
| 혼합 특수탄 BlackBean/TitanEye/BwBean/GbBean | 별도 반사 분기 존재 | 보수적으로 제외 |
| 비활성·아군·지뢰·다른 적 탄 | 이번 대상 아님 | 기존 표시 유지 |

UseDeepBlack는 표시 전용 읽기이며 Col/ParryClass/Friendly/좌표/속도/피해/수명/충돌 반경 쓰기 0이다. **현행 사용자 DLL의 자연 AI 생성 표본에서는 DruidPoison+Web가 관측되지 않았다.** 따라서 이 보수적 후보를 적용해도 현재 드루이드에서 새 블랙 탄이 나타난다고 보장하지 않으며, 사용자 요청의 실전 색 구분 완료로 보고하지 않는다. 실제 생성되는 패링 불가 탄의 계약 확인 또는 별도 허용된 판정 정정이 필요하다. 현재 보호 지시 때문에 임의로 판정을 바꾸거나 다른 담당의 일반 Web 렌더를 확장하지 않는다.

## 표시 수치

| 항목 | 값·적용 위치 |
|---|---|
| 텍스처 | 런타임 절차 생성 RGBA32 128×128, Bilinear, Clamp, 프레임별 캐시 16개. 새 외부 이미지 생성 없음 |
| 구면 몸체 | 정규화 좌표 -1..1, 반경 .78, 중심 기본색 (5+10nz, 6+11nz, 9+14nz), 가장자리 회색 반사 `65×(1−nz)^3` |
| 광택 | 법선·광원 내적 `max(0,−.42nx+.48ny+.77nz)^64`, 강도 `.92+.08cos(프레임×π/8)`, RGB 가산 220/225/230 |
| 몸체 알파 | `min(1,(.78−r)×128)`를 RGBA8로 변환 |
| 바깥 연무 | RGB 56/59/66, 반경 .78~.98, 최대 알파 .18, `sin(각도×9−위상+r×30)` 변화. 녹색 발광 없음 |
| 독탄 크기·시계 | 기존 `(Mine 또는 ElemBall ? 240 : clamp(Sz×24,96,180))×(physical ? 2 : 1)` 유지. `floor(nowMs/70)%16` |
| 별도 구체 크기·시계 | 기존 `R×2.4×2` 유지. 기존 녹색 클립 24프레임, 시계 `T×(300/7)/60` 유지 |

## 검증과 전달 경계

| 검사 | 결과·한계 |
|---|---|
| 이전 표시 검사 | 초기 resolver/픽셀 16검사 및 AI 관측 20검사는 당시 후보만 검증. 전체 충돌의 패링 불가를 증명하지 못했으므로 범위 합격 근거로 철회 |
| 실제 전체 충돌 | 사용자 Core DLL에서 normal/remodel의 physical/magic/blackBean/forbidden Q/E 및 별도 Orbs/Web, 총 22관측. Vx=0/X+40/Sz2, Player.Radius15의 확장 반경 접촉 샘플. 일반 반경25 밖·패링 확장75 안이며 일반 반경 내 피해 표본으로 소급하지 않음. 별도 Orbs는X+30/R26로일반 반경41 안. 상태·패링창·위치·HP를 통제했으며 손플레이 아님 |
| 범위 회귀 RED | 사용자 확인에 맞춘 11검사 중 초기 후보 6실패. 별도 Orbs의 녹색 복원도 검사. 기존07:19:02 UTC 도구응답을 분류-RED2-기존도구출력회수.json으로 회수했으며 재실행0. 최초stdout파일은GREEN과경로를공유해덮였으므로원파일복원으로부르지않음 |
| 범위 회귀 GREEN | 실제 전체 충돌 결과에 기반한 분류 및 명시 class/혼합 특수탄 경계 15검사, 실패 0 |
| 추가 이동 경계 | Vx=-6 및 Web 명시 class/혼합 특수탄 추가 하니스는 SDK10의 NuGet path1 오류와 NETSDK1060으로 2회 실패해 해당 단위 중단. 이 결과를 게임 실패나 추가 이동 검사 통과로 세지 않음 |
| 호스트 흐름 | 사용자 DLL·실제 호스트 함수의 처치/출구/클리어와 fallen 성공/실패 4경로 통과. 저장 4건 읽기 전용 복원 통과. 검기탭/충전반복/E/마법/혼합 5공격 경로 최종처치→클리어 단회 통과 |
| 강타 단독 | 12000틱/7시전은 실제 치명피해 후 7회 부활하여 최종처치 미도달. 틱 진행·idle·좌표 유한. 정지로 세지 않음 |
| 컴파일 | 사용자 원본 Runtime + 표시 3파일/진단 1파일, 사용자 Core51b 그대로 설치 Unity C# 참조 컴파일. 정식 Unity 빌드와 구별 |
| 검수 패키지 | I: 독립 사본만 Runtime 1개 대체/PDB 1개 추가. 나머지 원본 211파일 유지. 범위 정정 전 Runtime1c6e6d09는 HOLD |
| 실제 게임 | 우리 원본 M1은 공식 슬롯 대기2회 종료, 실제Player0. 새 후보 Player/자연 처치/1x/Desktop 미검증. 정지 원인 미확정, VISUAL VERDICT: RETOUCH |
| 후보 직접 확인 | 실제 Pixel 출력 16프레임 CPU PNG에서 어두운 몸체·작은 광택·중성 윤곽 직접 확인. 실제 게임 화면이 아님 |

실제 영수증·원자료: I:/EXODUSER-Storage/demo-art/gameplay-parity/druid-clear-deepblack-20261031/REPORT.md. 전체 브랜치 통합 금지. 최소 범위의 누적 패치만 검토하며 기존 16스킬은 포함하지 않는다.

## 별도 진단 관측 추가

단일 정지 이미지와 일치하는 직전 상태가 없어, 후속 실제 실행의 일반 Player 로그에 `[드루이드 흐름]` 관측을 추가한다. 이 관측은 정지 수정이 아니며 블랙 표시 커밋과 별도로 인수한다. `NativeGame.cs`, 일시정지·임팩트 담당 파일, Core는 변경하지 않는다.

| 항목 | 계약 |
|---|---|
| 연결 | 기존 소유 `NativeBossView.Update`에서 `EnsureDruidClearDiagnostics` 호출. 기존 NativeGame 객체에 코루틴 1개만 시작. 새 게임 객체·외부 감시 프로세스·작업자·관리 자동화 없음 |
| 관측 주기 | unscaled 0.5초. 아레나 밖에서는 로그 없음. 상태 변화 즉시 다음 관측에 기록하며, 동일 상태는 보스 생존 중 10초·사망/부활 대기/틱 정지 중 2초 간격 |
| 틱 정지 | 마지막 관측된 Core 틱 변경 이후 unscaled 2초 이상. 메뉴/포커스/패널/M1 여부와 함께 기록하며 정상 일시정지와 오류를 임의로 동일시하지 않음 |
| 호스트 | 프레임·Core 틱·마지막 완료 UpdateViews의 renderedTick(viewTick)·플레이어 현재 X/Y·unscaled 시간·timeScale, Running·gameFocused·Application.isFocused, 메뉴·프런트엔드 차단·인벤토리/스킬/능력치/강화 패널, M1 여부 |
| 진행 | 플레이어 상태·HP/최대HP·레벨, Stage.Enabled·LoadPhase·BossAlive, 실제 보스 Alive/HP/상태·ReviveTimer·SinkDruid, 출구 수·StageCleared·결과 패널 표시 |
| 로그 제한 | HP1 이하 진입/해제는 상태 변화로 기록. 일반 보스 HP 감소와 공격 자세마다 새 로그를 만들지 않음. 플레이어 이름·저장 내용·키 입력을 기록하지 않음 |
| 보호 | 게임 입력·Running·timeScale·단계·캐릭터·저장 상태 쓰기 0. 로그는 Unity의 기존 로그 경로를 사용하며 QA는 공식 실행기의 I: 로그로 격리 |
| CPU 검사 | 실제 관측 함수에 Unity 스케줄러/UI 경계만 스텁. 비활성 객체 제외·단일 코루틴·필드 무로그·Core 전후 동일·정상 진행 제한·호스트 정지/틱 정지·출구 기록 등 기존 11검사 실패 0. 뷰 관측 확장은 기존 코드에서 14검사 중3실패→추가 후14검사 실패0 |
| 한계 | Unity 메인 스레드 전체가 막히면 관측 코루틴도 실행되지 않는다. 이때는 마지막 로그 이후 중단을 기록 근거로 남기며, 위 관측만으로 원인을 확정하지 않음. 실제 Player 로그는 아직 미검증 |

## 후속 실행 증거와 별도 인계

| 항목 | 확인값·한계 |
|---|---|
| 직전 최소 표시·관측(범위 정정 시점) | 소스36b4a74c1a788da40c101f8dcf30a45ec14fb2ef. 정확 4입력 SHA를 보존한 Runtime4ece426fa5bfc1387ef087f3fe1b946e85e00345575d789640c3d4822083e0d0. 사용자 Core51b 유지. 공식 Unity 새 빌드가 아닌 독립 C# 검수 사본 |
| 공식 원본 M1 | 1차06:24:17→07:04:23 UTC(40분), 2차07:07:07.518→09:07:28.572 UTC(120분), 모두 공식FIFO슬롯획득전종료1·우리Player시작0. 사용자2실패중단지시로세번째요청0. 09:07:54 UTC 자기예약만반환, 타인6예약SHA동일 |
| 새 사용자 종료 크래시 | 같은 제품 경로. 덤프 PID30032, 시작06:56:39 UTC(15:56:39 KST), 충돌07:00:19 UTC(16:00:19 KST). Physics cleanup/Input Shutdown 뒤 UnityPlayer.dll+UIAutomationCore 스택. 최초 정지 캡처보다 뒤에 시작한 별도 실행이며 처치 정지 원인으로 확정하지 않음 |
| Windows 교차 근거 | Application Error1000, 07:00:20 UTC c0000005 및07:00:24 UTC c000041d. PID0x7550=30032, UnityPlayer offset0x10d1432로 덤프와 일치 |
| 원자료 보존 | REPORT 경로 아래 사용자-종료크래시-070018에 Player.log/덤프/구조화 이벤트. 덤프 원본·사본 SHA de1ff34203c05070aad84adc200a809ae3e5a169d3a7a2e736462ea0ba9196b6. 기존 일시정지 담당이 증거 인수, 실제 원인 수정 완료로 합산하지 않음 |
| CPU 경계 | StageFlowSyncViews의 출구 아레나 Rebuild/텍스처 업로드, 실제 저장 IO, OS 입력·포커스는 CPU 호스트 스텁 검증으로 대체하지 않음. 우리 실제 Player 미실행·검수단위2회실패중단 |
| 별도 Core 후속 | HD2D 담당이 미적용 2단계 6Core 후보에서 HurtProjectile/HurtOptions.Projectile을 시험한다는 인계를 받음. 우리 제품·Core 수정0/인수0. 새 Core 공식 채택 시 실제 생성탄 Q/E와 표시 범위를 다시 검증하며 구Core51b의15/22 관측을 새 후보에 소급하지 않음 |

## 화면 갱신 관측 확장

Core tick이 진행해도 UpdateViews가 완료되지 않으면 화면이 멈춰 보일 수 있으므로, 기존 로그에 viewTick과 현재 Player.X/Y를 읽어 기록한다. renderedTick은 기존 NativeGame의 마지막 뷰 갱신 표식이며 이번 코드가 쓰거나 강제로 맞추지 않는다. 좌표·viewTick은 상태변화 키에 넣지 않아 이동할 때마다 로그가 늘지 않는다. 입력 성공이나 렌더 정지를 이 숫자 하나로 단정하지 않고 호스트·패널·포커스·Core tick과 나란히 판단한다.

| 검사 | 결과 |
|---|---|
| RED | 실제 관측 소스와 사용자 Core51b를 연결. 기존11검사는 유지되고 렌더틱/좌표/코어와뷰의독립기록3검사만실패: 14검사3실패 |
| GREEN | 같은 실제 소스에 읽기 출력2곳만추가, 14검사0실패. Core 전후동일·단일코루틴·기존로그제한보존 |
| 현재 컴파일 | 사용자14cc 원본+동일4입력/사용자Core51b, 설치참조컴파일오류0·Unity시작0. Runtime ebfeb4418d472e053c00af6770fff4647cb1c6003104f442ce277d6759c4f748 |
| 보호 | NativeGame.cs/일시정지/임팩트/Core 수정0. 시뮬레이션·renderedTick·플레이어좌표쓰기0. 기존4입력컴파일범위유지 |
| 한계 | 실제 Player로그와사용자멈춤원인미검증. 추가이동SDK2실패중단은별도단위로유지하며새관측GREEN을그실패에소급하지않음 |

## 실행 중단 경계 인계

사용자 지시의 실패2회중단을 적용했다. 두 차례 모두 공식 슬롯 획득 전 종료했으므로 게임 동작 실패나 정지 재현으로 세지 않는다. 우리 Unity/Player 시작0, 타인 잠금·프로세스변경0, 사용자제품 Runtime4671345c/Core51b7ae06 및 EXE9806abde 유지. 공식 unreserve로 자기 gameplay-parity 예약만 반환했고 기존 타인6예약의SHA는전후동일하다.

정지원인미확정·수정완료0, 자연AI에서블랙대상미관측, 실제Player/1x/웹Unity영상/공통인수/Desktop갱신미완료다. 독립 C# 검수패키지를정식Unity빌드나전달완료로사용하지않는다. 현재소유branch전체통합은16스킬을끼워넣으므로금지하며, 기존통합담당의승인범위에서최신7경로누적패치만인수해야한다. 원본14cc checkout은읽기전용참조이므로우리담당이수정하지않았다. 같은실행즉시재요청없이공식자원반환·중앙인수경계의후속지시를기다린다.

최종근거는REPORT및최종-중단경계-영수증.json, current-product-m1-wait2.실행.json, resource-return.실행.json이다.

## 동일 사용자 답변 answer-1 적용 대조와 관측 소유 경계

확정 증상은 **이동과 ESC 메뉴 모두 응답하지 않음**이다. 메뉴가 열리는 Resume-only로 축소하지 않는다. 확정 블랙 대상은 **Q/E 모두 패링 불가인 탄만**이며, 접촉 패링·흡수·유도 반사의 결과를 구분한다. c1단독채택금지/Orbs녹색복원/분류15검사0실패는이미36b4에반영돼있다. 현재4소스는7ed59 컴파일입력과동일하며, 이번답변수신으로기존검수나Player를반복하지않는다.

아래 줄은 읽기전용 사용자14cc의 NativeGame.cs 기준이며, 공유 함수에 새 관측 훅을 적용했다는 뜻이 아니다. 현재 관측만으로 아래 미검증 항목을 통과 처리하지 않는다.

| 구분 | 현재 확보한 관측 | 남은 실제 위치 확인과 소유 경계 |
|---|---|---|
| Main Update(167행) | Unity frame/Running/focus/패널/좌표 샘플 | frame은NativeGame.Update의진입·정상복귀증거가아님. UpdateSettingsPersistence/UpdateCombatSave 뒤·프런트엔드/포커스가드·패널/ESC처리전후를분리할필요. NativeGame.cs공유구역은기존담당인수전편집0 |
| OnGUI(408행) | 메뉴·결과패널의논리Active 상태 | 실제OnGUI호출·Event유형·조기반환경로·메뉴Draw/ApplyPauseCommand전후는현재로그에없음. Active=true만으로메뉴가그려지거나ESC가전달됐다고주장0 |
| FixedUpdate(226행) | Core tick/플레이어상태/호스트가드일부 | Tick은StepInput fixture로도진행하므로FixedUpdate진입증거로소급0. practiceScripted/Running/focus/lobby/Simulation가드와AimWorld→실제키조회→Tick→StageFlowPump→DispatchFeedback를구분할필요 |
| 입력 폴링(230행이후) | 현재로그는키입력을읽거나기록하지않음 | 기존WASD x/y와ESC/패널명령의조회결과·실제조회단계도달여부를소유담당에서관측해야함. 추가입력조회로기존단축평가순서·입력소비를바꾸지않음 |
| 장시간 전투·최종처치 | 0.5초샘플의BossAlive/HP/Revive/Sink/출구/클리어 | 샘플은같은프레임의정지직전지점을보장하지않음. 처치전후Core Tick/이벤트소비/뷰갱신의단계경계와Main/OnGUI/Fixed의진입·복귀를함께확인할필요. 직접치명타/무적/AI-off fixture로사용자장시간증상해결선언0 |

공유훅의검토안은진단전용진입/복귀표식과기존poll결과읽기이며, Running/timeScale/PlayerDown/피해/Q-E/저장값쓰기·예외삼키기·강제복귀를포함하지않는다. 현재검수패키지에는이공유훅이미적용이다. 기존일시정지/임팩트담당과중앙인수경계에관측공백을인계하고, 이답변을새실행·추가예약또는두실패중단해제지시로해석하지않는다.
