# 드루이드 처치 후 정지 조사와 광택 블랙 탄막 — 2026-10-31

사용자 직접 요청 `user-druid-clear-deepblack-20261031` 및 추가 지시 “광택이 있는 블랙탄막”의 최소 패치다. 이전 미채택 스킬 16종과 분리한다. **처치 후 정지는 현재 CPU 검사에서 미재현이며 해결 완료가 아니다. 표시 후보도 실제 Player·Desktop 검수가 남아 있다.**

## 기준과 보존

| 항목 | 확인값·범위 |
|---|---|
| 사용자 원본 | `G:/exoduser-wt/codex-latest-desktop`, `14cc014d05cef9adc333c9f1a4c15b25040500d8`, 읽기 전용 |
| 사용자 실행본 | `I:/EXODUSER-Storage/demo-art/latest-desktop/build_new/EXODUSER-Unity.exe`, `-force-d3d11 --remodel3d` |
| Runtime SHA-256 | `4671345cf2c80632c2319a220d462303f92d1bd3d577f74e7ba9bda0851bd748` |
| Core SHA-256 | `51b7ae0699b5aa041d5c02160fad61f78003e26d8aab02876206f0fb7d1c84bc` |
| 소유 작업본 기준 | `a5ff550499b61697753ac2f091c6cfe61c78cf16`, 시작 INDEX 0. 타인 `tools/guard.baseline.json` 보존 |
| 분리 가능한 입력 | 변경 전 `NativeBossView.cs`, `NativeDruidArt.cs`는 사용자 원본과 바이트 동일. 해당 두 파일과 신규 `DruidProjectileAppearance.cs`만 사용자 원본에 적용하여 설치 Unity 참조로 컴파일 오류 0 |
| 금지 범위 | Core 수정 0, Q/E 판정 수정 0, 저장 수정 0, 일시정지·임팩트 담당 파일 수정 0. 기존 스킬 16종의 전체 브랜치 통합 금지 |

## 원인 조사

| 경로 | 실제 함수 CPU 결과 | 한계 |
|---|---|---|
| 기본 드루이드 | 사용자 Core DLL의 `HurtEnemy`·부활·`StageFlow` 실행. 최종 처치/출구 개방 1159틱, 실제 충돌 이동 후 클리어 2719틱 | 피해량·생존을 통제한 원인 분리 검사이며 자연 플레이가 아님 |
| 리모델 드루이드 | 같은 사용자 DLL, 리모델만 명시. 최종 처치/출구 개방 799틱, 이동 후 클리어 2359틱 | 통제된 검사. 일반 `--remodel3d`만으로 리모델 전투 플래그가 켜지는 것은 아님 |
| 호스트·레벨업 | 사용자 원본의 `FixedUpdate`, `StageFlowPump`, `OnLevelledUp` 본문을 추출해 실행. 두 모드 모두 `Running=true`, 결과 패널 표시, 레벨업 표시 1회, 출구 SP +10 1회 | Unity·실제 UI·저장 경계는 명시적 스텁. GPU·포커스·OS 입력·실제 저장 완료를 증명하지 않음 |
| 플레이어 부활·사망 | 저체력에서 실제 `HurtPlayer`로 fallen 진입. 300틱 대기 동안 Running 유지, 성공은 idle/HP100/Running=true, 실패는 dead/HP0/Running=false | 첫 전HP 검사에서는 기존 한방캡으로 stagger여서 검사 전제가 실패. 저체력 전제만 수정했으며 프로덕션 피해 규칙 수정 0 |
| 사용자 스크린샷 | 원본을 직접 열어 확인·I: 보존. 보스 바가 없는 정지 장면만으로 죽음·정지 원인을 확정하지 않음 | 단일 정지 이미지로 틱/Running/포커스/마지막 예외 판단 불가 |
| 사용자 로그 | 실행 경로가 일치하는 기존 Player.log 사본 보존. 예외 기록 없음 | 로그 수정시각이 요청 전이므로 해당 정지 순간의 무예외 증거로 재사용 불가 |

출구 규칙은 `BossDefeated → ExitOpened → 출구 타일 이동 → StageCleared`다. 처치 직후 자동 클리어로 바꾸거나 Running을 강제로 재개하는 우회 수정은 하지 않았다. 실제 정지 순간의 호스트·렌더·포커스 관측이 다음 진단에 필요하다. 다른 active 담당의 일시정지 파일은 보존한다.

## 표시 대상과 보호 계약

| 실제 분류 | 이전 표시 | 이번 표시 | 판정 |
|---|---|---|---|
| `DruidBoss.Orbs` | 녹색 구체 클립 | 광택 딥 블랙 | 110틱마다 3개, 속도 6.8, 반경 26. 유도 반사 없이 접촉 폭발. 접촉 패링의 제자리 폭발·피해 방지는 그대로 |
| 리모델 적대 독포자 투사체 | 녹색 PoisonShot | 광택 딥 블랙 | 기존 `DruidBoss.TryReflect`의 리모델 반사 금지 유지 |
| 기본 독탄의 `forbidden` | 녹색 PoisonShot | 광택 딥 블랙 | `ParryRules.ProjectileParryClass`의 명시 class 우선순위 그대로 읽음 |
| 기본 물리/E, 마법/Q 독탄 | 녹색 PoisonShot | 유지 | 모든 녹색탄의 일괄 변환 아님 |
| `blackBean` / 명시 `magic` | 기존 표시 | 유지 | Q만 반사, E 불가. 이름이 blackBean이라는 이유로 반사 불가로 오분류하지 않음 |
| 아군·지뢰·다른 적 탄 | 기존 표시 | 유지 | 이번 대상에서 제외 |

`DruidProjectileAppearance.UseDeepBlack`는 표시 전용 읽기다. 투사체 `Col`, `ParryClass`, `Friendly`, 좌표·속도·피해·수명·충돌 반경을 쓰지 않는다. `ElemBall`이어도 명시 `magic`이면 기본 모드의 블랙 대상에서 제외한다.

## 표시 수치

| 항목 | 값·적용 위치 |
|---|---|
| 텍스처 | 런타임 절차 생성 RGBA32 128×128, Bilinear, Clamp, 프레임별 캐시 16개. 새 외부 이미지 생성 없음 |
| 구면 몸체 | 정규화 좌표 -1..1, 반경 .78, 중심 기본색 (5+10nz, 6+11nz, 9+14nz), 가장자리 회색 반사 `65×(1−nz)^3` |
| 광택 | 법선·광원 내적 `max(0,−.42nx+.48ny+.77nz)^64`, 강도 `.92+.08cos(프레임×π/8)`, RGB 가산 220/225/230 |
| 몸체 알파 | `min(1,(.78−r)×128)`를 RGBA8로 변환 |
| 바깥 연무 | RGB 56/59/66, 반경 .78~.98, 최대 알파 .18, `sin(각도×9−위상+r×30)` 변화. 녹색 발광 없음 |
| 독탄 크기·시계 | 기존 `(Mine 또는 ElemBall ? 240 : clamp(Sz×24,96,180))×(physical ? 2 : 1)` 유지. `floor(nowMs/70)%16` |
| 별도 구체 크기·시계 | 기존 `R×2.4×2` 유지. 기존 시계 `T×(300/7)/60`을 블랙 16프레임에 순환 |

## 검증과 전달 경계

| 검사 | 결과 |
|---|---|
| 분류·판정 RED | 정책 미구현 상태에서 11검사 중 9실패. 기존 실제 Q/E 판정 2검사는 통과 |
| 사용자 DLL 호환 수정 | 자체 브랜치에만 있는 대형 에너지 필드 참조를 제거. 사용자 Core DLL에 없는 기능을 끼워 넣지 않음 |
| 분류·광택 GREEN | 16검사, 실패 0. 실제 blackBean Q 반사/E 금지, 명시 class 우선순위, 어두운 중심·작은 광택·녹색 픽셀 없음 |
| 최소 Runtime 컴파일 | 사용자 원본 전체 Runtime + 표시 3파일, 사용자 Core DLL 그대로. 설치 Unity C# 참조 컴파일 오류 0. Unity 프로세스 시작 0 |
| 실제 게임 | 새 Player·M1·자연 처치·1x·Desktop 미검증. VISUAL VERDICT: RETOUCH |
| 후보 직접 확인 | 실제 `Pixel` 출력 16프레임을 CPU PNG로 직접 열람. 어두운 몸체·좁은 광택·중성 윤곽 확인. 셀별 y축을 Unity 텍스처 방향에 맞춤. 실제 게임 화면으로 세지 않음 |
| 후속 | 기존 공식 실행 순번과 저장 격리를 충족한 동일 후보에서 정지 재현 및 블랙 탄의 실전 식별 검수. 일시정지 원인으로 좁혀지면 기존 담당에게 증거 인계 |

실제 영수증·원자료: `I:/EXODUSER-Storage/demo-art/gameplay-parity/druid-clear-deepblack-20261031/REPORT.md`.

## 별도 진단 관측 추가

단일 정지 이미지와 일치하는 직전 상태가 없어, 후속 실제 실행의 일반 Player 로그에 `[드루이드 흐름]` 관측을 추가한다. 이 관측은 정지 수정이 아니며 블랙 표시 커밋과 별도로 인수한다. `NativeGame.cs`, 일시정지·임팩트 담당 파일, Core는 변경하지 않는다.

| 항목 | 계약 |
|---|---|
| 연결 | 기존 소유 `NativeBossView.Update`에서 `EnsureDruidClearDiagnostics` 호출. 기존 NativeGame 객체에 코루틴 1개만 시작. 새 게임 객체·외부 감시 프로세스·작업자·관리 자동화 없음 |
| 관측 주기 | unscaled 0.5초. 아레나 밖에서는 로그 없음. 상태 변화 즉시 다음 관측에 기록하며, 동일 상태는 보스 생존 중 10초·사망/부활 대기/틱 정지 중 2초 간격 |
| 틱 정지 | 마지막 관측된 Core 틱 변경 이후 unscaled 2초 이상. 메뉴/포커스/패널/M1 여부와 함께 기록하며 정상 일시정지와 오류를 임의로 동일시하지 않음 |
| 호스트 | 프레임·Core 틱·unscaled 시간·timeScale, Running·gameFocused·Application.isFocused, 메뉴·프런트엔드 차단·인벤토리/스킬/능력치/강화 패널, M1 여부 |
| 진행 | 플레이어 상태·HP/최대HP·레벨, Stage.Enabled·LoadPhase·BossAlive, 실제 보스 Alive/HP/상태·ReviveTimer·SinkDruid, 출구 수·StageCleared·결과 패널 표시 |
| 로그 제한 | HP1 이하 진입/해제는 상태 변화로 기록. 일반 보스 HP 감소와 공격 자세마다 새 로그를 만들지 않음. 플레이어 이름·저장 내용·키 입력을 기록하지 않음 |
| 보호 | 게임 입력·Running·timeScale·단계·캐릭터·저장 상태 쓰기 0. 로그는 Unity의 기존 로그 경로를 사용하며 QA는 공식 실행기의 I: 로그로 격리 |
| CPU 검사 | 실제 관측 함수에 Unity 스케줄러/UI 경계만 스텁. 비활성 객체 제외·단일 코루틴·필드 무로그·Core 전후 동일·정상 진행 제한·호스트 정지/틱 정지·출구 기록 등 11검사 실패 0 |
| 한계 | Unity 메인 스레드 전체가 막히면 관측 코루틴도 실행되지 않는다. 이때는 마지막 로그 이후 중단을 기록 근거로 남기며, 위 관측만으로 원인을 확정하지 않음. 실제 Player 로그는 아직 미검증 |
