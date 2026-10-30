# 데모 v0 전사 3D 런타임 — 2026-10-30

전사 LOCK은 `origin/main:docs/11내러티브·로어디자인/WARRIOR_DESIGN_LOCK.md`, 제작 현황은 `UNITY_CHARACTER_BOARD_20261027.md`를 따른다. **현재 R4 지옥강타 접점 FAIL 발견으로 전달 확정 철회·R5 재작업 중**이다. 기능29/M123·일반모션 RETOUCH가 이 결함을 상쇄하지 않는다. 자기 R4 링크를 SHA 확인 후 이전 검증 skill-fix 링크로 동일byte 복구했고, Core 변경 없이 즉발 접점 계약으로 보정한다. 아래 R4 전달 표는 당시 이력이다.

| 항목 | 소유·현재 값 |
|---|---|
| 작업본 | `G:/exoduser-wt/codex-hero`, `codex/pc-hero-quality-20261030`, 시작 `10c49850f85dca6365cbf67b8067e6fa749b026d` |
| 자산 인수 | `I:/exoduser-wt/pc-unity-char/unity/Assets/Exoduser/`의 Warrior·CapeSpring·기존 캐릭터 셰이더 45개, 동일 바이트·SHA 불일치 0. 원본에는 쓰지 않음 |
| 인수 근거 | `I:/EXODUSER-Storage/demo-art/hero/asset-transfer.json` |
| 런타임 프리팹 | `Resources/Characters/Warrior.prefab`; `HeroSetup.Prepare`가 기존 프리팹에서 구성. 본체는 URP Lit 기반 `HeroIronContrast.shadergraph`, 대검은 URP/Lit. 기존 PBR 맵은 그대로 사용 |
| 게임 연결 | `ResetRun`에서 한 번 만들고 `UpdateViews`에서 `NativeHeroView.Sync` 호출. 로드 성공 시 기존 플레이어 SpriteRenderer를 숨김, 누락 시 기존 스프라이트 폴백 |
| 망토 재설정 | 새 Simulation·2D/3D 바닥 기준 전환·앵커2u 초과 이동 시 CapeSpring 입자 재설정. 이전 장소의 천이 새 시작점으로 늘어지는 상태를 막음 |
| 발 본 진단 | FootError는 모델 로컬 발 본 높이에서0.055u를 뺀 진단값. 메시 발바닥·지면 관통의 실측 PASS가 아니며 실제 프레임으로 함께 판정 |
| 3D 필드 | Core 픽셀→`NativeRemodel3D.Point`, yaw=`atan2(cos(Facing),-sin(Facing))`, 모델 배율 0.87. R1 0.90/10.57%, R2 0.81/8.36%, R3 0.81/7.98%의 실제 스킨·천 실측을 보존하며 화면 높이8~10% 안에 여유를 주는 R3 수정 후보 |
| 기존 2D 아레나 | 같은 Core 발밑 앵커, 모델 앞쪽 깊이 -3, 바닥 기준 X 회전 -35도, 배율 0.80. R3fix M1 원본에서0.65가 약7% 높이로 작게 읽혀 보강. 아레나 자체의 3D화는 별도 |
| 보조광 | 전사 layer30·렌더링 마스크3, Point 전사 마스크2. 중성 `(1,.97,.94)` 강도6 범위5, 차가운 가장자리 `(.62,.75,.86)` 강도1.6 범위4. 그림자 없는 보조광이며 주광·카메라·Core는 변경하지 않음 |
| 재질 보강 | 본체 normal강도0.35·smoothness0.68, 대검 normal강도0.55·smoothness0.75. 전사 전용 그래프는 `albedo *= 1 - 0.75*sqrt(metallicMap.R)`: 금속 마스크0인 피부·천의 원본 색을 보존하고 금속만0.25~1배로 낮춘다. 기존 PBR·노멀·직접광·그림자는 유지, 기존 풀 림 발광 연결은0. 원본 ShaderGraph·비트맵 수정/새 생성0. R4 현재1x 제작자·독립 판정은 RETOUCH |
| 모션 | `NativeHeroMotion.Sync(Simulation,bool)`, 실행순서90→기존 `CapeSpring`100. 상세 상태·타이밍·수치는 `UNITY_HERO_MOTION_20261030.md` |
| 실제 Player 검수 | `--unity-hero-review -output <고유경로>`·필수 `--unity-qa-sandbox`. 대기60·방향160(8방향×20틱)·달리기90·구르기36·대검3타180·검기3타180·E충전강타120·시전90·보조시전60·패링45·피격45·사망90틱, 2틱마다 1600×900 PNG. 적 AI/자연 소환을 끄고 이동 충돌을 유지한 제어 검수. E 두 번째 입력을70틱 누른 뒤 해제하며 Charge/Bash/BashRecover를 해당 구간에서 검사. heroReviewActive는 이 fixture의 사망/일시정지 메뉴 그리기만 분리하며 일반 실행은 불변. 피격은 HurtPlayer(80), 사망은 별도 상태주입이므로 자연 플레이로 세지 않음 |
| 기존 수정 보존 | 이동·조준 `ef75f883e`는 시작 HEAD의 조상. Core 파일 변경0 |
| 빌드 준비 파생 입력 | Unity 첫 임포트/빌드 준비로 생긴 자기64개 밖 변경522개는 `r2/import-meta.json`에 경로·SHA·diff를 보존. 메타만이 아니라 생성 Main씬·URP 프리필터·guard 기준도 포함한다. 자동 인수/일괄스테이징/원복하지 않으며 자기64개 WORK 변경0을 별도로 검사 |

## 제작자가 직접 본 자료와 현재 차이

- 전사 확정 원화 `G:/exoduser/assets/charselect/warrior_cut.png`: 짧은 흑발·평범한 눈·둥근 겹침 견갑·흑철 판금·암적색 찢긴 천·대검을 대조했다.
- 노레위 `I:/EXODUSER-Storage/codex-takeover/quality-reference-20261030/screenshots/nrftw-02.jpg` 및 `launch-heavy-timeline.jpg`를 직접 열었다. 원화의 얼굴/장비를 복제하지 않고, 작은 화면상 크기에서도 분리되는 재질·실루엣, 공격 전후의 무게 이동을 참고한다. 연속 프레임은 12fps 표본이며 해당 게임의 판정 틱을 추정하지 않는다.
- 기존 `demo-art/character/warrior-r1/after_front.png`·`after_game.png`는 Blender 근사 렌더로만 봤다. 해당 R1 shape key는 이번 후보에 자동 채택하지 않는다. 검수 대상은 기존 전용 망토 뼈가 있는 프리팹이다.
- 최초 결함: 런타임 전사 Resources 프리팹이 없어 게임에서 3D 영웅을 읽을 수 없었다. `resource-contract.cjs` 실행으로 실제 누락을 확인했다. 인게임 캡처 뒤 파지·발밑·망토·8~10% 화면 높이를 보정한다.

## 검수와 완료 경계

검수의 검기3타는 공격을130틱 누른 뒤 해제해 실제 충전3타를 발사하며, 해당 구간의 Swing 1/2/3과 충전 종료를 각각 확인한다. 달리기 뒤 메뉴12프레임 동안 Core틱·손발 본 위치 정지 오차0.0001u 미만을 검사한다(망토 물리 정지 검사는 아님). 대기30틱에서는 실제 BakeMesh 정점을 카메라로 투영해 화면 높이8~10%를 확인하고, 각 PNG의 발밑 화면좌표를 JSON에 기록한다. 전사 자산 검증은 Humanoid·스킨·대검소켓·CapeSpring·셰이더에 더해 표현 Sync 전후 Player JSON·TickCount·SkillCastCount 동일 여부로 Core 비변경을 검사한다.

검수 종료 시 기존 로비 미디어·피드백 사운드를 닫고0.8초 배출 후 종료한다. 정상 종료·사용자 세이브·잔여 프로세스는 공용 실행기 영수증으로 확인한다.

R3 수정 검수부터 `Time.captureDeltaTime=1/60`을 이 전용 fixture에만 설정한다. Core1틱/그림1프레임과 천 물리의 시간 간격을 맞추어 PNG 기록 속도에 따른 천 높이 차이를 줄인다. 일반 플레이·M1에는 적용하지 않고, 크기8~10% 임계와 전체 스킨 정점 측정은 유지한다.

필수 순서: Unity 임포트/아바타·메시·무기·천 검증 → 실제 Player 비교 영상/연속 프레임과 1600×900·1x → 필수 빌드/oracle/m1 → MERGE_QUEUE 영수증 → 통합 담당의 `unity/main` 병합·통합 빌드·바탕화면 갱신. 기능 통과를 디자인 통과로 바꾸지 않는다. 현재 판정·실행ID·결함은 검수 후 이 절에 기록한다.

| 검증 | 근거·현재 범위 |
|---|---|
| 순수 모션 타이밍 | R1 `motion-tests/out/green-final.log` 169검사, R2 `green-r2.log` 174검사, R3 `green-r3.log` 231검사 통과·C# 오류/경고0. 사망군 전환·E접점·복귀 envelope·틱 정지·구르기 tuck 및 명시적 체중 이동 경계 회귀 포함 |
| 실제 Core 시퀀스 | `capture-tests/capture-receipt.json`, 996틱·17검사 통과·오류0. 기존 Core 미사용변수 경고2는 별도. Unity/IK/충돌 증거가 아님 |
| Unity 임포트·표현 경계 | `995071d3`, 6000.6.7f1, 컴파일 오류없음·exit0·USER_SAVE변경0, `HERO_RESOURCE_AVATAR_SKIN_WEAPON_CAPE_PASS`. 실제 리소스·Humanoid·무기·망토·셰이더 및 Sync의 Player/Core 비변경 통과. 라이선스 토큰 갱신 오류 로그1이 있으나 기존 라이선스로 작업 정상 종료 |
| 최초 Unity 실행 | `b3d23370`은 첫 자산 스캔 뒤 HeroCapture 파일을 추가한 시점 문제로 CS0103. 파일 구성을 마친 뒤 `995071d3` 갱신에서 해소. 성공·실패 로그를 구분해 보존 |
| Player/시각 | 최종 R4 기능29/29·M1 23/23·시각RETOUCH. 이전 후보 실패와 재작업은 아래에 분리 보존. 에디터 자산 계약 통과를 실게임 디자인 완료로 세지 않음 |

## R1 실제 Player 판정과 재작업 이력

- 소스 `e0b279059b7880036643439cfb339f73309645b8`, 빌드 `e58c27ec` Succeeded·오류0. 실제 D3D11 RX9070XT 검수 `895ade06`은 exit2(크기 검사1건 실패)·창/잔여/USER_SAVE변경0, 499PNG. `r1/review/hero-review.json`.
- 화면 높이10.57%로8~10% 계약 초과. 구르기는 팔·다리를 편 공중제비여서 **동작 FAIL**, 무릎을 접은 tuck과 발목 IK로 재작업한다. 첫 사망 구간은 실제 메뉴가 몸을 가렸으므로 **시각 미검증**이며 상태 관측 성공을 시각 통과로 세지 않는다.
- `원화-노레위-Player-동일크기.png`, 대검/달리기/구르기/E강타/시전/사망 1x 판을 제작자가 직접 봤다. 대검 파지·3타 구분·천 지연은 확인했으나 몸통 대비가 약하고 미세 하이라이트가 많아 RETOUCH. 중성 보조광과 normal/smoothness를 위 R2 후보로 보강한다. 같은 핵심 결함을 같은 방법으로 두 후보 FAIL이면 제작 방법을 바꾼다.
- 일시정지 중 손발 본 오차0·실제 3타·E 충전/타격/회복·강타3단계·피격/사망 상태·스프라이트 숨김은 통과했다. 이것을 디자인 완료로 올리지 않는다. 후보 R1은 병합하지 않는다.
- 정확 R1 Player Core DLL `b2acc2413ce81d21ffc21d3fa0618438b1ed44586fd0e74152b0c9714b571189`에서 입력17+검기93+돌진/패링187165=187275검사 불일치0. `player-core-tests/manifest.json`에 Program/입력/DLL SHA·반사 어댑터 기록. 스킬 oracle는 오래된 JSON으로 중단, 구르기 독립 oracle는 내부 API 접근으로 미실행이며 전체 PASS로 묶지 않음.

## R2 실제 Player와 R3 보강

- R2 소스 `014a9aea3122a555190f76e62fac19ae24472ba2`, 빌드 `ee52ba8d` 오류0·정상exit0, 실제 Player `5e44e22c`는29/29·8.36%·정지 오차0, 무창/잔여/USER_SAVE변경0. Core DLL은 위 정확 검증 DLL과 같은 SHA여서187275검사를 재사용한다. 에디터 로그의 토큰 갱신 오류는 기존 라이선스로 정상 완료한 기록과 구분한다.
- `r2/`의12개 동작1x 판·원화/노레위 동일크기·실제19초 모션/3초 비교 영상을 생성했다. 제작자와 독립 검토자가 구르기의 tuck·기립 및 메뉴 없는 사망 유지,8방향 전사 정체성을 직접 확인했다. 작은 화면에서 눈 색 세부는 미검증이다. 밝고 균일한 회색 갑옷과 약한 공격 체중 이동은 **RETOUCH**로 남겨 전체 게임용 아트PASS로 올리지 않았다.
- 같은 빌드 M1 `e6adec16`은 정상exit0·창/잔여/USER_SAVE변경0. 이 입력의 기능 검수를 R3 새 런타임의 통과로 대신하지 않는다.
- R3 담당은 전사 제작자다. 위 금속 마스크 그래프와 골반5~9cm·몸통20~24도 명시적 체중 키를 적용했다. R2 구르기·Core 판정·손/칼 접점은 유지한다. 준비 검수 `802888fb`에서 실제 프리팹·Humanoid·스킨·대검·천·셰이더/Core 경계를 통과했다. 다음 산출물은 R3 정식빌드와 실제Player 1x/영상/M1이다.
- 최초 R3 `d0cba6fe5`/빌드 `d23c246f`는 Succeeded 출력이어도 GPU 셰이더 오류7건이 있어 **FAIL·미채택**이다. 실제 Player `75062bbc`도7.98% 크기로 exit2, 창/잔여/세이브변경0. 제작자가 그래프 ID를 오인해 색 대신 NormalTS에 연결한 결함과 생성 HLSL의 비ASCII 식별자를 확인했다. 의미명 기반 계약 검사에서 RED 재현 후 BaseColor만 보정·원본 NormalTS/Metallic/Smoothness/Occlusion 유지·생성 식별자 ASCII로 고쳐 GREEN을 확인했다. 같은 GPU 오류가 수정 빌드에서도 반복되면 이 제작 경로를 중단한다.
- 진단2인자 API 경로 e7939f67·37aa9c6f는두 번 실패해 중단, 설치 소스의 실제4인자 경로 `0a13cc72`에서 생성 HLSL을 확보했다. 진단 helper는 제품 코드에 남기지 않는다. `r3/진단경로-중단기록.md`와 생성 소스·전체 로그를 보존했다.
- R3fix `03bcd432d`의 수정 빌드 `58ff61b8`는 첫 Editor 시작이 UsbDevicesQuery 접근위반으로 종료돼 실행기의 허용1회 재시도에서 정상 완료했다. 재시도 컴파일·GPU 셰이더 오류0, USER_SAVE변경0. 원인 확정을 하지 않으며 전역 환경/장치/캐시를 변경하지 않았다. 최초·재시도 로그는 별도 보존한다.
- 실제 Player `9fdb9230`은29/29·화면 높이9.9847%·정지오차0·창/잔여/USER_SAVE변경0. 영상 생성 뒤 M1 `c2691d68`도 정상exit0·창/잔여/USER_SAVE변경0. 제작자·독립 검토자가 재질 암부/칼 분리 및 공격 하강 개선을 확인했다. 시각 등급은 **RETOUCH**: 큰 판금 면 표현·1/2타 하체 이동·E 임팩트 파지 가림이 남는다. 핵심 구르기·사망·조형·접지의 추가FAIL은 발견하지 못했다. 독립 검토는 선택1x 프레임 기준이며 실시간 손조작/체감 완료로 확대하지 않는다.
- M1의 실제 기존2D 보스 아레나에서 전사가 작게 읽혀 위0.80 배율로 한 번 더 보강한다. Core·모션·3D 필드0.87은 유지하고 새 후보의 M1/2D 실제 화면을 확인한다. 통합/바탕화면은 그 영수증 전까지 미완료다.

## 최종 R4 검수 영수증

| 항목 | 실제 근거 |
|---|---|
| 제품 소스 | `b46c3d6c2cbad67d4af2fa6aa95a9c0e9e6c2515`, 공통 f27c9d1f9 정상조상·Core 트리 불변 |
| 정식 빌드 | `efba8711`, 컴파일·셰이더 오류0·정상exit0·USER_SAVE변경0 |
| 실제 Player | `e45fd978`, 29/29·579PNG·1600×900, 전체스킨 메시 높이9.3854%, 메뉴12프레임 손발정지 오차0 |
| 같은 빌드 M1 | `165d48f9`,23/23·실패0, D3D11/RX9070XT·정상exit0·창/잔여/USER_SAVE변경0 |
| 영상 | `r4/전사-실제Player-모션.mp4`1600×900·30fps·19.3초·579프레임, `노레위-전사-대검동작-비교.mp4`3200×900·30fps·3초·90프레임. 크기 정규화는 별도 원화/노레위/Player PNG로 대조 |
| 실제 DLL | Runtime `1427b77ea6481124bfc7ebc6917f61e3b57478adbdbd5b2986ad66dcce9cf29c`, Core `b2acc241…571189`(위 정확검증DLL과완전동일), EXE `9806abde…ea57a2` |
| 최종 시각 판정 | 제작자·독립 검토자가 현재 R4 1x 및 실제2D 아레나를 확인, **RETOUCH** 유지. 구르기·사망·전사 정체성·발밑의 추가 핵심FAIL/회귀 발견0 |
| 잔여와 담당 | 전사 제작자: 큰 판금 명암 묶음·1/2타 하체 이동·2D 발밑 대비. E강타 임팩트가 파지/견갑 일부를 가리는 문제는 VFX 담당과 후속 조율. 전체AAA·자연 사망·OS손조작·Mac·실시간 전환 체감은 이번 증거로 PASS 선언하지 않음 |
| 증거 묶음 | `I:/EXODUSER-Storage/demo-art/hero/r4/gate-evidence.json`, `검수.html`,12개1x 판, 원본 PNG·모션/비교 영상 |

최초 R4 실행기 호출은 게임 로그 없이 exit1이었다. Unity/Player잔여0을 확인했으나 원인은 미확정이다. 표준 환경은 모두 존재했으며 전역 변경0. 진단 wrapper의 잘못된 위치 인수는 명명 인수로 고쳤고, 같은 공식 exo 실행기에서 위 실제 Player/M1을 정상 완료했다. 실패 trace·빈 최초로그·환경 존재값을 보존하며 환경의 영구 복구로 적지 않는다.

## 공통 반영·실행본 채택·Desktop 전달

| 항목 | 확인한 결과 |
|---|---|
| 공통 반영 | 기존 통합 담당이 expected `f27c9d1f9`→`a62b515d66a23c59bd9f2acb60555fbb6a669e90` 정상 fast-forward·원격 SHA readback. 다른 후보/preview/WIP 변경0 |
| 입력 동일성 | 검수제품 b46c3d6c2와 채택공통 a62b515d6의 Unity tree `ca59a1d73157b1f5bac06d5d2ef85e61c1e8318e` 완전동일. 이후 차이는 이 Runtime 문서1개뿐, 자기66개 WORK/INDEX 변경0·실제 Runtime/Core/EXE SHA 동일 |
| 검수 재사용 | COMMON_RULES 동일 SHA 입력·조건의 유효검수 재사용 규칙 적용. 검증한 R4 실행본·Player/M1 채택, **새 통합 빌드와 추가 M1 반복은 실행하지 않음**. 새 실행으로 보고하지 않는다. `validated-build-adoption.json` |
| 일반 바로가기 | `C:/Users/심도진/Desktop/지옥의 길 (Unity).lnk`→`I:/EXODUSER-Storage/demo-art/hero/r4/build/EXODUSER-Unity.exe` |
| 네 속성 | Target 위EXE, Arguments `-force-d3d11 --remodel3d`, WorkingDirectory `.../hero/r4/build`, IconLocation `위EXE,0`. QA/빠른시작 인자없음 |
| 독립 확인 | 별도 PowerShell 프로세스에서 실제 링크 네 속성·Runtime/Core/EXE SHA 다시 읽어 일치. 이전 skill-fix 링크는 I:에 동일byte 백업(SHA `e90cacc1…ead33e`), 앱 자동기동0·사용자세이브쓰기0 |
| 최종 근거 | `desktop-delivery.json`·`desktop-readback.json`·`validated-build-adoption.json`, `I:/EXODUSER-Storage/codex-takeover/hero/REPORT.md`. 자기 예약은 공식 해제·새 Unity 실행0 |

이 단위의 제작·검수·공통 반영·전달 범위를 마감한다. 시각 RETOUCH와 전사/VFX 담당의 위 잔여 수정 항목, Mac·OS손조작·자연 사망/실시간 체감 미검증은 유지한다. 첫 Desktop 도구 호출은 JSON 기본인코딩 오류로 쓰기 전 실패했고 UTF-8 명시 후 정상 완료했다. 검증 실패를 누락하거나 디자인 PASS로 올리지 않는다.

## R4 최종 확정 철회·R5 즉발 접점 재설계 — 2026-10-31 KST

위 R4 마감 문구는 후속 정합 감사로 철회한다. `2_1 스킬관리+합체시스템.md`461행의 피해/VFX 분리 규정과 웹 `game.html`46604~46606·46633행의 즉시 발동/즉시 히트, Core `Simulation.Skills.cs`225~233행을 대조했다. Core는 gSlamWindup 진입 틱에 이미 피해·heavy_hit·충격파를 실행한다. R4는10틱 들어올림 뒤 약4틱에 내려치는 **약233ms 접점 지연 FAIL**이었다. 상태 이름을 예비 동작으로 해석한 제작 결함이며, 선행 피해 위험 문구나29/M123 통과로 정합 완료를 선언하지 않는다.

- 실제 R4 바로가기 SHA를 대조하고 이전 검증 skill-fix 링크를 동일byte 복구했다. `desktop-withdrawal.json`. 앱 자동기동/사용자세이브쓰기0, Git 롤백/타WIP변경0. 통합 담당과 보스/UI 담당에게 철회/후속수정 상태를 전달했다. b981 전달완료 docs는 공통에 추가 반영하지 않는다.
- 제작 단계를 시각 타임라인 계약으로 되돌려 **시전틱0=칼 아래 접점·앞 체중·피해/SFX/충격파 동시**, 기존10/10/12틱은 접점 이후 압축→반동·안정화→운반 복귀로 바꾼다. 후속 상태에서 두 번째 내려침을 만들지 않는다. Core/기간·다른 공격·구르기·루트·조준은 변경하지 않는다.
- R5 최종 순수 모션은 기존231+접점/평면/해제 신규110=341검사 통과(`motion-tests/out/green-r5-blade-release.log`), C# 오류/경고0. 접점0 RED는 `red-slam-contact.log`, 평면 보정 RED는 `red-blade-plane.log`, 해제 경계 RED는 `red-blade-release.log`로 보존했다. 실제 Player 검수 전 통과로 확대하지 않는다.
- 실제 검수에만 HP1000000·Poise100·반경15·전사X+60의 격리 EnemyState 표적1개를 둔다. 시전 첫 StepInput 뒤 피해량과 Core틱·강타파동 수를 기록하고 표적을 제거해 기존 무적/AI 억제·충돌 계약을 유지한다. 같은 EndOfFrame의 실제 무기소켓에서 `dot(-socket.up, model.up)<-0.5`·SlamWindup phase0·첫 틱 HP 감소/파동·캐시한 실제 칼끝의 모델 바닥 평면 높이±0.03m를 함께 검사한다. `slamHitTick`·`slamDamage`·`slamWaveCount`·`slamBladeUpDot`·`slamBladeTipHeight`는실제 JSON에남긴다. 상태 이름 관측이나 각도/이상적 칼길이 계산만으로 실제 접점을 대체하지 않는다.
- 대검 FBX만 Read/Write1로 해 실제 정점을 바인딩 때1회 읽는다(단일 메시 CPU사본 추가, 정확 메모리 비용은 미실측). 가장 긴 칼축 끝의 실제 정점 localPos/Transform을 캐시하고, gSlamWindup10틱에서만 우손 IK/칼 정렬→칼끝1cm 평면 보정→칼 방향 재정렬→좌손 파지 순서다. 보정은 초반25% 전량·나머지75% smoothstep 해제로 phase1에서0, 다음 반동 상태도0이라 경계 팝을 줄인다. 정상 프레임 정점읽기0, 루트/전신 이동·다른 동작/후반 상태 잠금0.
- 독립 단일시전 fixture는 정확 Core DLL `b2acc241…571189`에서11/11 통과했다. 첫 입력 tick1에 HP461 감소·gSlamWindup10/phase0·강타파동1·heavy_hit 이벤트1, 무입력 대조군 피해0·다른 투사체/장판0·표적 제거 후 정상복귀. 실제 음향 재생/소켓/팁 렌더 증거는 아니다. `slam-contact-tests/receipt.json`·`out/result.log`.
- 각 PNG 행에는 캐시된 실제 칼끝의 `bladeTipKnown`·`bladeTipHeight`도 남겨 접점 보정 해제와 후반 상태 경계의 연속성을 확인한다. 정상 게임에 기록하거나 매프레임 정점을 다시 읽지 않는다.

### R5 현재 실제 검수 — R4를 대체하는 접점 후보

| 항목 | 같은 후보의 실제 근거 |
|---|---|
| 제품 소스·빌드 | `d8adbb7442f181896490492d929923565e865b18` / `7fa69146`, 컴파일·셰이더 오류0 |
| 실제 Player | `59091cbc`,30/30·579PNG·대기 스킨 높이9.3854%, 메뉴12프레임 Core/손발 오차0 |
| 첫틱 실제 접점 | tick827 첫 입력에 피해461·파동1, 칼 상향내적−.7779413·실제 메시 칼끝 바닥 평면 높이.01019158m. `r5/review/frames/hero-0413.png`와 시전 연속1x 직접 확인 |
| 접점 보정 해제 | 압축 phase.8의.04073738m→반동 phase0의.04136556m, 관측 표본 차이.00062818m. 후반 회수에서 추가 타격을 만들지 않음 |
| 현재 영상·M1 | 실제1600×900/30fps/19.3초·579프레임 및 비교3200×900/30fps/3초·90프레임 생성 후 같은 빌드 M1 `e4bd2cc2`23/23·실패0 |
| 안전·DLL | D3D11 RX9070XT, 정상exit0·창/잔여/USER_SAVE변경0. Runtime `7a13730604be14aaea3fafce35b9df6b55b44cdc775c52b36c3497a97c1e2e56`, Core `b2acc241…571189`로 정확187275검사 재사용. 별도 접점11·순수 모션341PASS |
| 현재 판정 | 지옥강타 지연 FAIL 수정. 제작자는 실제1x·원본1600×900 및2D 아레나를 확인, 전체 **RETOUCH** 유지. 큰 판금 명암·1/2타 하체·2D 발밑 대비는 전사 담당, 임팩트 파지가림은 VFX 후속. 기능통과를 AAA/전체시각PASS로 올리지 않음 |
| 증거 | `I:/EXODUSER-Storage/demo-art/hero/r5/gate-evidence.json`·`판정.md`·`검수.html`·현재 영상과1x 판. R4 전달/철회 원본 영수증은 `r4/delivery-history/`에 SHA와 함께 보존 |

공통 통합과 Desktop 재전달은 위 검수와 별도 영수증에서 확인한다. 실제 음향은 무음 정책으로 듣지 않았고, 독립 Core의 같은 틱 heavy_hit1 이벤트만 확인했다. 자연 사망·OS손조작·Mac·경사 전체접지·장시간 플레이는 미검증이다.
