# 데모 v0 전사 3D 런타임 — 2026-10-30

전사 LOCK은 `origin/main:docs/11내러티브·로어디자인/WARRIOR_DESIGN_LOCK.md`, 제작 현황은 `UNITY_CHARACTER_BOARD_20261027.md`를 따른다. 본 단위는 기존 전사 메시·망토 본·대검을 실제 Player에 연결한다. 아래는 제작 중 계약이며, 컴파일·Player·실게임 디자인 판정은 영수증이 생기기 전까지 **미검증**이다.

| 항목 | 소유·현재 값 |
|---|---|
| 작업본 | `G:/exoduser-wt/codex-hero`, `codex/pc-hero-quality-20261030`, 시작 `10c49850f85dca6365cbf67b8067e6fa749b026d` |
| 자산 인수 | `I:/exoduser-wt/pc-unity-char/unity/Assets/Exoduser/`의 Warrior·CapeSpring·기존 캐릭터 셰이더 45개, 동일 바이트·SHA 불일치 0. 원본에는 쓰지 않음 |
| 인수 근거 | `I:/EXODUSER-Storage/demo-art/hero/asset-transfer.json` |
| 런타임 프리팹 | `Resources/Characters/Warrior.prefab`; `HeroSetup.Prepare`가 기존 프리팹에서 구성. 본체·대검은 기존 URP/Lit·기존 PBR 맵을 사용 |
| 게임 연결 | `ResetRun`에서 한 번 만들고 `UpdateViews`에서 `NativeHeroView.Sync` 호출. 로드 성공 시 기존 플레이어 SpriteRenderer를 숨김, 누락 시 기존 스프라이트 폴백 |
| 망토 재설정 | 새 Simulation·2D/3D 바닥 기준 전환·앵커2u 초과 이동 시 CapeSpring 입자 재설정. 이전 장소의 천이 새 시작점으로 늘어지는 상태를 막음 |
| 발 본 진단 | FootError는 모델 로컬 발 본 높이에서0.055u를 뺀 진단값. 메시 발바닥·지면 관통의 실측 PASS가 아니며 실제 프레임으로 함께 판정 |
| 3D 필드 | Core 픽셀→`NativeRemodel3D.Point`, yaw=`atan2(cos(Facing),-sin(Facing))`, 모델 배율 0.81. R1 실측10.57%를9.5% 목표로 조정한 화면 구도 값이며 모델 비례 보정/완료를 대신하지 않음 |
| 기존 2D 아레나 | 같은 Core 발밑 앵커, 모델 앞쪽 깊이 -3, 바닥 기준 X 회전 -35도, 배율 0.65. 아레나 자체의 3D화는 별도 |
| 보조광 | 전사 layer30·렌더링 마스크3, Point 전사 마스크2. 중성 `(1,.97,.94)` 강도6 범위5, 차가운 가장자리 `(.62,.75,.86)` 강도1.6 범위4. 그림자 없는 보조광이며 주광·카메라·Core는 변경하지 않음 |
| 재질 보강 | 기존 PBR 맵·팔레트를 유지하고 URP/Lit 본체 normal강도0.35·smoothness0.68, 대검 normal강도0.55·smoothness0.75. R1의 작은 흰 반짝임을 줄이고 판금 큰 면을 읽히게 하는 후보, R2 실제 프레임 판정 필요 |
| 모션 | `NativeHeroMotion.Sync(Simulation,bool)`, 실행순서90→기존 `CapeSpring`100. 상세 상태·타이밍·수치는 `UNITY_HERO_MOTION_20261030.md` |
| 실제 Player 검수 | `--unity-hero-review -output <고유경로>`·필수 `--unity-qa-sandbox`. 대기60·방향160(8방향×20틱)·달리기90·구르기36·대검3타180·검기3타180·E충전강타120·시전90·보조시전60·패링45·피격45·사망90틱, 2틱마다 1600×900 PNG. 적 AI/자연 소환을 끄고 이동 충돌을 유지한 제어 검수. E 두 번째 입력을70틱 누른 뒤 해제하며 Charge/Bash/BashRecover를 해당 구간에서 검사. heroReviewActive는 이 fixture의 사망/일시정지 메뉴 그리기만 분리하며 일반 실행은 불변. 피격은 HurtPlayer(80), 사망은 별도 상태주입이므로 자연 플레이로 세지 않음 |
| 기존 수정 보존 | 이동·조준 `ef75f883e`는 시작 HEAD의 조상. Core 파일 변경0 |

## 제작자가 직접 본 자료와 현재 차이

- 전사 확정 원화 `G:/exoduser/assets/charselect/warrior_cut.png`: 짧은 흑발·평범한 눈·둥근 겹침 견갑·흑철 판금·암적색 찢긴 천·대검을 대조했다.
- 노레위 `I:/EXODUSER-Storage/codex-takeover/quality-reference-20261030/screenshots/nrftw-02.jpg` 및 `launch-heavy-timeline.jpg`를 직접 열었다. 원화의 얼굴/장비를 복제하지 않고, 작은 화면상 크기에서도 분리되는 재질·실루엣, 공격 전후의 무게 이동을 참고한다. 연속 프레임은 12fps 표본이며 해당 게임의 판정 틱을 추정하지 않는다.
- 기존 `demo-art/character/warrior-r1/after_front.png`·`after_game.png`는 Blender 근사 렌더로만 봤다. 해당 R1 shape key는 이번 후보에 자동 채택하지 않는다. 검수 대상은 기존 전용 망토 뼈가 있는 프리팹이다.
- 최초 결함: 런타임 전사 Resources 프리팹이 없어 게임에서 3D 영웅을 읽을 수 없었다. `resource-contract.cjs` 실행으로 실제 누락을 확인했다. 인게임 캡처 뒤 파지·발밑·망토·8~10% 화면 높이를 보정한다.

## 검수와 완료 경계

검수의 검기3타는 공격을130틱 누른 뒤 해제해 실제 충전3타를 발사하며, 해당 구간의 Swing 1/2/3과 충전 종료를 각각 확인한다. 달리기 뒤 메뉴12프레임 동안 Core틱·손발 본 위치 정지 오차0.0001u 미만을 검사한다(망토 물리 정지 검사는 아님). 대기30틱에서는 실제 BakeMesh 정점을 카메라로 투영해 화면 높이8~10%를 확인하고, 각 PNG의 발밑 화면좌표를 JSON에 기록한다. 전사 자산 검증은 Humanoid·스킨·대검소켓·CapeSpring·셰이더에 더해 표현 Sync 전후 Player JSON·TickCount·SkillCastCount 동일 여부로 Core 비변경을 검사한다.

검수 종료 시 기존 로비 미디어·피드백 사운드를 닫고0.8초 배출 후 종료한다. 정상 종료·사용자 세이브·잔여 프로세스는 공용 실행기 영수증으로 확인한다.

필수 순서: Unity 임포트/아바타·메시·무기·천 검증 → 실제 Player 비교 영상/연속 프레임과 1600×900·1x → 필수 빌드/oracle/m1 → MERGE_QUEUE 영수증 → 통합 담당의 `unity/main` 병합·통합 빌드·바탕화면 갱신. 기능 통과를 디자인 통과로 바꾸지 않는다. 현재 판정·실행ID·결함은 검수 후 이 절에 기록한다.

| 검증 | 근거·현재 범위 |
|---|---|
| 순수 모션 타이밍 | R1 `motion-tests/out/green-final.log` 169검사, R2 `motion-tests/out/green-r2.log` 174검사 통과·C# 오류/경고0. 사망군 전환·E접점·복귀 envelope·틱 정지 및 구르기 tuck 경계 회귀 포함 |
| 실제 Core 시퀀스 | `capture-tests/capture-receipt.json`, 996틱·17검사 통과·오류0. 기존 Core 미사용변수 경고2는 별도. Unity/IK/충돌 증거가 아님 |
| Unity 임포트·표현 경계 | `995071d3`, 6000.6.7f1, 컴파일 오류없음·exit0·USER_SAVE변경0, `HERO_RESOURCE_AVATAR_SKIN_WEAPON_CAPE_PASS`. 실제 리소스·Humanoid·무기·망토·셰이더 및 Sync의 Player/Core 비변경 통과. 라이선스 토큰 갱신 오류 로그1이 있으나 기존 라이선스로 작업 정상 종료 |
| 최초 Unity 실행 | `b3d23370`은 첫 자산 스캔 뒤 HeroCapture 파일을 추가한 시점 문제로 CS0103. 파일 구성을 마친 뒤 `995071d3` 갱신에서 해소. 성공·실패 로그를 구분해 보존 |
| Player/시각 | R1은 아래 FAIL·RETOUCH, R2 실제 검수 대기. 에디터 자산 계약 통과를 실게임 디자인 완료로 세지 않음 |

## R1 실제 Player 판정 — 재작업 중

- 소스 `e0b279059b7880036643439cfb339f73309645b8`, 빌드 `e58c27ec` Succeeded·오류0. 실제 D3D11 RX9070XT 검수 `895ade06`은 exit2(크기 검사1건 실패)·창/잔여/USER_SAVE변경0, 499PNG. `r1/review/hero-review.json`.
- 화면 높이10.57%로8~10% 계약 초과. 구르기는 팔·다리를 편 공중제비여서 **동작 FAIL**, 무릎을 접은 tuck과 발목 IK로 재작업한다. 첫 사망 구간은 실제 메뉴가 몸을 가렸으므로 **시각 미검증**이며 상태 관측 성공을 시각 통과로 세지 않는다.
- `원화-노레위-Player-동일크기.png`, 대검/달리기/구르기/E강타/시전/사망 1x 판을 제작자가 직접 봤다. 대검 파지·3타 구분·천 지연은 확인했으나 몸통 대비가 약하고 미세 하이라이트가 많아 RETOUCH. 중성 보조광과 normal/smoothness를 위 R2 후보로 보강한다. 같은 핵심 결함을 같은 방법으로 두 후보 FAIL이면 제작 방법을 바꾼다.
- 일시정지 중 손발 본 오차0·실제 3타·E 충전/타격/회복·강타3단계·피격/사망 상태·스프라이트 숨김은 통과했다. 이것을 디자인 완료로 올리지 않는다. 후보 R1은 병합하지 않는다.
- 정확 R1 Player Core DLL `b2acc2413ce81d21ffc21d3fa0618438b1ed44586fd0e74152b0c9714b571189`에서 입력17+검기93+돌진/패링187165=187275검사 불일치0. `player-core-tests/manifest.json`에 Program/입력/DLL SHA·반사 어댑터 기록. 스킬 oracle는 오래된 JSON으로 중단, 구르기 독립 oracle는 내부 API 접근으로 미실행이며 전체 PASS로 묶지 않음.
