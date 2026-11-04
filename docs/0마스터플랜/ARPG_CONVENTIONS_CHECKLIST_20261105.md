# 탑다운 ARPG 공통 관례 체크리스트 — 현재 Unity 상태 (2026-11-05)

- 작성: 클라우드 레인 M1(docs만, 코드 무수정). 기준 커밋 origin/unity/main `7958690`.
- 왜: 사용자 지적(11-04) "게임 개발에도 다 매뉴얼이 있을 텐데, 거대 나무가 캐릭터 가리면 투명 처리 같은 것도 AI가 모르냐." CLAUDE.md 4.1 "공통 관례(가림 투명화 등)는 사용자가 짚기 전에 넣는다"를 지키지 못했다. 다시는 하나씩 짚지 않게 목록으로 고정한다.
- 쓰는 법: 화면·전투·UI 작업의 **G0 브리프에서 이 표의 해당 분야 행을 먼저 확인**하고, 자기 작업이 닿는 행을 "있음·이번에 넣음·뺌(이유)"로 적는다([작업 매뉴얼 v4](WORK_MANUAL_20261029.md) §2 G0). 작업이 끝나면 이 표의 상태·근거 칸을 고친다.
- 공통성 기준: Diablo 3·Diablo 4·Path of Exile 2·No Rest for the Wicked·Last Epoch·Grim Dawn 중 **3편 이상이 공통으로 가진 것만** 넣었다. 한 게임만의 기능은 뺐다.
- **증거 경계:** 레퍼런스 게임의 공통성은 장르 지식(기억)으로 정리했고, 이번 레인에서 레퍼런스 영상·캡처를 직접 열지 않았다. 품질 기준 §2-1에 따라 각 항목을 구현하는 작업자는 착수 때 해당 장면을 직접 열어 확인한다. "현재 상태"는 코드 grep·정독 근거이며 실게임 화면 확인이 아니다(화면 판정은 Mac). 공개 매뉴얼(XAG·GAG·GDC·Unity URP·Game UI Database) 항목별 근거는 §2.
- 표기: 상태 = 있음 / 부분 / 없음 / 미확인. 필요도 = 필수(데모 v0 1-1 한 판·키샷·첫인상에 직접 보임) / 권장 / 나중. 경로는 `unity/Assets/Exoduser/Runtime/` 기준.
- 우리 게임 제약(관례보다 위): 1-1 원근 카메라 LOCK(피치 34°, 먼 적이 보여야 함), 점 금지(디더링·점묘 0), 실버 헬 색 토큰, Core 수치·판정 불변.

## 0. 데모 v0 필수인데 없음·부분 — 우선순위

| 순위 | 항목 | 상태 | 왜 먼저인가 | 다음 산출물 |
|---|---|---|---|---|
| 1 | B1 가리는 오브젝트 페이드(나무·덤불·통나무) | **없음** | 사용자가 직접 짚은 항목. 원근 34°에서 남쪽 고목·덤불이 영웅을 덮는다. 지금은 전경 소품을 플레이 영역 밖(z≤-80.05)에 두는 배치 회피뿐 | 카메라→영웅 사이 렌더러만 매끈한 알파 페이드(디더 컷아웃 금지). 먼 적 가림 0 확인 캡처 |
| 2 | B2 가려진 영웅 실루엣 | **없음** | B1이 못 덮는 큰 지형·구조물 뒤에서 영웅 위치를 잃는다 | 가려진 부분만 은빛(`--sv-lt`) 단색 실루엣. 점 금지 준수 |
| 3 | D1 일반 타격 히트스톱 | **부분** | Core가 일반 타격·처치 히트스톱을 계산(`Core/EnemyHurt.Body.cs:129` 5프레임, `Core/EnemyHurt.DeathTail.cs:140` 12프레임)하지만 Runtime이 읽는 곳은 패링뿐(`NativeGame.MeleeParry.cs:30`). 타격감 핵심 | Core 값을 표현층에 노출·연결(값은 Core 그대로). 영상 판정 |
| 4 | H2 엘리트 표시 | **없음** | 1-1에 엘리트가 있다(게이트 수호자 elite 3, `Core/Simulation.StartMobs.cs:9`). 화면에서 일반 적과 구분 안 됨 | 엘리트 이름·어픽스 표·테두리 색(실버 헬 토큰) |
| 5 | G1 전리품 바닥 이름표 | **없음** | 빛기둥만 있다(`NativeGame.WorldDrops.cs:9,21`). 무엇이 떨어졌는지 읽히지 않음. 획득 토스트는 한국어 고정 문자열(`NativeGame.WorldDrops.cs:136,143`) → 번역 누락 | 등급색 이름표 + 표시 키(Alt) + 이름 겹침 회피. 토스트 번역 등록 |
| 6 | F3 물약 칸·개수 HUD | **미확인→없음 추정** | Core 물약(`PotionState`)·자동 물약 설정은 있으나 HUD 파일(`NativeHud*.cs`)에서 물약 칸·개수 그리기를 찾지 못함 | 웹 정본 HUD의 물약 표시와 대조해 확정 |
| 7 | F4 버프·디버프 아이콘 | **없음** | 영웅 상태는 스킬바 위 글자 한 줄 자리뿐(`NativeHudPresentation.cs:7`). 보스바에만 상태 칩이 있음(`NativeBossBar.cs` 머리 주석) | 남은 시간 표시 아이콘 줄 |
| 8 | E2 일반 적 범위 공격 바닥 예고 | **부분** | 적 리그에 Tell(예비동작) 상태는 있다(`NativeEnemyRigPolicy.cs:3`). 바닥 텔레그래프는 드루이드 전용(`NativeDruidTelegraphView.cs:57,101`) | 1-1 일반 적 중 범위·원거리 공격 목록화 → 해당 공격만 바닥 예고 |
| 9 | L2 접근성 최소(자막 크기·UI 배율·색약) | **부분** | 흔들림 슬라이더·움직임 줄이기는 있다. UI 배율·글자 크기·색약 없음 | 권장이지만 Steam 데모 리뷰 단골 항목. 범위 결정 필요 |

필수 중 이미 성립(코드 기준)한 것: 원근 카메라·보스 줌(거리만), 화면 흔들림+옵션, 피해 숫자, 스킬바 쿨다운, 체력·자원 구체, 적 체력바(피격·조준 시), 보스 체력바·등장, 미니맵·목표, 지역 화살표, 로딩 전환·감시, 일시정지·설정·키 재설정, 사운드 우선순위·예고 덕킹, 쓰러짐→부활 카운트·사망 화면. 이것들도 **화면 품질은 미검증**이다.

## 1. 전체 표

### A. 카메라

| # | 관례 | 대표 구현 | 현재 상태 (근거) | 필요도 | 비고 |
|---|---|---|---|---|---|
| A1 | 고정 피치 원근(또는 준직교) 3인칭 탑다운, 영웅을 화면 중심 약간 아래 | 고정 각도 추적 카메라, 영웅 중심 lock | 있음 — Cinemachine 추적, 피치·거리·FOV는 `Resources/Data/remodel_camera`(`NativeRemodelCamera.cs:8-17`, `NativeGame.Remodel3D.cs:198-200`) | 필수 | 1-1 피치 34° LOCK. 바꾸지 않음 |
| A2 | 맵 끝에서 빈 공간이 보이지 않게 카메라 제한 | 맵 경계 클램프 | 있음 — `NativeGame.CameraClamp.cs:7-8`, 호출 `NativeGame.cs:429` | 필수 | |
| A3 | 보스전·특수 구간에서 줌 아웃(각도 유지) | 거리만 늘림 | 있음 — `NativeGame.BossView.cs:30` `BossCameraZoom`, `NativeArenaCameraLayout.cs:11` | 필수 | CLAUDE.md: 피치 두고 거리만 |
| A4 | 타격·폭발 화면 흔들림 + 옵션으로 끄기 | 감쇠 노이즈 오프셋, 설정 % | 있음 — `NativeGame.cs:428-433`(Core `ShakeAmount`×옵션), `NativeGame.SettingsOptions.cs` `OptionShakeScale`, 움직임 줄이기 시 0 | 필수 | |
| A5 | 패링·결정타 순간 짧은 밀어넣기 줌 | 카메라 스케일 펄스 | 있음 — `NativeGame.cs:490` `ParryCameraScale`, `Vfx/CombatImpactView.cs:27` | 권장 | |
| A6 | 마우스 휠 줌 | 제한된 줌 범위 | 없음 | 나중 | D3·D4는 고정, LE·GD만 허용 → 공통 아님. 34° LOCK과 충돌하므로 넣지 않는 쪽 |

### B. 가림 처리

| # | 관례 | 대표 구현 | 현재 상태 (근거) | 필요도 | 비고 |
|---|---|---|---|---|---|
| B1 | 카메라와 영웅 사이의 나무·벽·덤불을 반투명/컷아웃 | 카메라→영웅 레이·캡슐 판정 또는 화면 원형 마스크로 해당 렌더러 알파 페이드(0.2~0.3초 보간) | **없음** — 코드에 occlusion fade·cutout 처리 0건(grep `occlu|cutout|dither|silhouette`). 전경 소품을 플레이 영역 밖으로 미는 배치 회피만 있음(`NativeGame.A2Foreground.cs:31-35` `A2OutsidePlay`, z≤-80.05). 필드 안 고목·덤불(`NativeGame.A2Forest.cs`, `NativeGame.A2Bramble.cs`)은 그대로 영웅을 덮을 수 있음 | **필수** | 점 금지 때문에 흔한 디더 컷아웃(screen-door)은 쓰지 않는다 → 매끈한 알파 또는 부드러운 원형 마스크. 영웅 주변 국소 범위만 — 먼 적을 지우면 FAIL(카메라 LOCK) |
| B2 | 큰 벽 뒤 영웅(필요 시 적) 실루엣 | 깊이 테스트 반전 패스로 단색 외곽/실루엣 | **없음** | **필수**(영웅), 나중(적) | 색은 실버 헬 은빛. 빨강(`--eye`)은 쓰지 않음 |
| B3 | 가리는 큰 소품을 처음부터 카메라 쪽에 두지 않는 배치 | 레벨 디자인 규칙 | 있음(부분) — `A2OutsidePlay`(위) | 필수 | B1을 대신하지 않는다 |
| B4 | 영웅 주변 국소 조명으로 어둠 속 위치 유지 | 영웅 따라다니는 포인트·스폿 라이트 | 있음 — `NativeHeroView.cs:27-28`, `NativeGame.HellLighting.cs:59-61` | 필수 | 어둠이 먼 적을 지우면 FAIL |

### C. 가독성

| # | 관례 | 대표 구현 | 현재 상태 (근거) | 필요도 | 비고 |
|---|---|---|---|---|---|
| C1 | 영웅이 배경과 명도·채도로 분리(림라이트·발밑 그림자) | 림라이트, 접지 그림자 | 있음 — 영웅 보조광·cool edge(`NativeHeroView.cs:27-28`), 적 접지 그림자 메시(`NativeGame.A2Enemies.cs:40`) | 필수 | 화면 판정 미검증 |
| C2 | 적 탄·위험 VFX가 아군 스킬 VFX보다 먼저 읽힘 | 적 탄은 고대비·고유 색, 아군 효과 불투명도 제한 | 부분 — 보스 탄 전용 뷰(`NativeBossView.FieldBullets.cs`), 품질 기준 VFX 행이 "적 탄막을 가리지 않음"을 요구. 아군 효과 감쇠 옵션 없음 | 필수 | 밀집 전투 캡처로 판정 |
| C3 | 아군 범위 스킬의 바닥 투영(지형에 붙음) | 데칼·지형 투영 | 있음 — `NativeGroundSkillProjection.cs`, `NativeGroundSkillSurface.cs` | 필수 | |
| C4 | 마우스 아래 적 강조(외곽선·이름) | 호버 외곽선 + 상단 이름·체력 | 부분 — 조준점 근처 적 선택(`NativeGame.A2Enemies.cs:25-30` `a2TargetEnemy`)해 체력바만 표시. 외곽선·이름 없음 | 권장 | |
| C5 | 상호작용 가능 물체(문·포털·상자) 라벨/강조 | 근접 시 라벨·빛 | 부분 — 게이트 라벨(`NativeHellGateLabels.cs`, `NativeRegionHud.cs` 머리 주석의 portal label) | 권장 | |

### D. 피격 피드백

| # | 관례 | 대표 구현 | 현재 상태 (근거) | 필요도 | 비고 |
|---|---|---|---|---|---|
| D1 | 히트스톱(타격·처치 순간 수 프레임 정지) | 시뮬·애니 시간 정지 | **부분** — Core 계산: 일반 타격 5f(`Core/EnemyHurt.Body.cs:129`), 처치 4f(`Core/EnemyHurt.Death.cs:318`), 큰 처치 12f(`Core/EnemyHurt.DeathTail.cs:140`), 플레이어 스턴 5f(`Core/PlayerPoise.cs:12`). Runtime 소비는 패링 이벤트만(`NativeGame.MeleeParry.cs:30`, `Core/Simulation.PlayerCombat.cs:233`). `EnemyHurtContext.HitStop`(`Core/EnemyHurtContext.cs:97`)을 읽는 표현 코드 없음 | **필수** | Core 수치 변경 아님 — 이미 계산된 값을 표현에 연결하는 일 |
| D2 | 피격 번쩍임(적이 맞을 때 흰/색 플래시) | 머티리얼 에미션 1~3프레임 | 부분 — 적 리그 Hit 상태 동작(`NativeEnemyRigPolicy.cs:3`), 접점 VFX(`KiImpactView.cs`, `Vfx/CombatImpactView.cs`). 몸 번쩍임은 확인 못 함 | 필수 | 미확인분은 영상으로 확인 |
| D3 | 피해 숫자(색으로 종류 구분) + 옵션 | 떠오르는 숫자, 치명타 크게 | 있음 — `NativeGame.cs:462,614`(HP `#ead7ac`·쉴드 `#66ddff`), 겹침 배치 `NativeFloatingTextLayout.cs` | 필수 | 끄기 옵션은 미확인 |
| D4 | 타격음 레이어(무기+재질+처치) | 카테고리별 음원·변주 | 있음 — `NativeFeedbackAudio.cs:72-82` 분류, `NativeEnemySfxTables.cs` | 필수 | 청취 판정 필요 |
| D5 | 영웅 피격 시 화면 가장자리·HP 구체 반응 | 비네트 펄스·구체 흔들림 | 부분 — HP 구체 피격 표시 `NativeHud.cs:80-81,93` `DrawFeelHurt` | 권장 | 비네트는 먼 적을 지우지 않는 강도로만 |

### E. 예고(텔레그래프)

| # | 관례 | 대표 구현 | 현재 상태 (근거) | 필요도 | 비고 |
|---|---|---|---|---|---|
| E1 | 보스 범위 공격 바닥 예고(채워지는 원·부채꼴) | 지형 투영 데칼, 채움 진행 = 남은 시간 | 있음 — `NativeDruidTelegraphView.cs`(+`NativeGroundWarningProjection.cs`) | 필수 | VFX 타이밍 표와 Core 판정 일치 확인 |
| E2 | 일반 적 큰 공격의 바닥 예고 | 위와 같음(짧게) | 부분 — 드루이드만 바닥 예고. 일반 적은 동작 Tell만 | 필수 | 근접 일반 공격은 동작 예고만으로도 관례에 맞음. 범위·원거리만 대상 |
| E3 | 보스·엘리트 예비동작(무게 있는 윈드업) | 애니메이션 Tell 구간 | 있음 — 적 리그 `Tell/Active/Recover`(`NativeEnemyRigPolicy.cs:3`), 드루이드 별도 | 필수 | NRFTW 감각은 보스 보드에서 판정 |
| E4 | 예고 소리(시각과 동시) + 다른 소리 덕킹 | 전용 버스·사이드체인 | 있음 — Tell 버스가 EnemyHit·Ambience를 -4dB 덕킹(`NativeAudioMixer.cs:10`), 우선순위 최상 `PriTell=12`(`NativeFeedbackAudio.cs:22`) | 필수 | |
| E5 | 막을 수 없는/패링 가능 공격 색 구분 | 색·문양 구분 | 미확인 | 권장 | 무지개탄 Q 전용 패링 규칙(CLAUDE.md 7)과 묶어 표기 확인 |

### F. HUD

| # | 관례 | 대표 구현 | 현재 상태 (근거) | 필요도 | 비고 |
|---|---|---|---|---|---|
| F1 | 좌우 자원 구체(HP·자원) | 액체 셰이더 구체 | 있음 — `NativeHud.cs:40-42,136`, 배치 `NativeHudDockLayout.cs:11-28` | 필수 | |
| F2 | 하단 스킬바 + 쿨다운 스윕·남은 초 | 시계 방향 어둠 + 숫자 | 있음 — `NativeHudSkills.cs:39-48` | 필수 | |
| F3 | 물약 칸·개수·쿨다운 | 전용 칸 | 미확인 — Core `PotionState`·자동 물약 옵션 있음, HUD 그리기 못 찾음 | 필수 | 웹 정본과 대조 |
| F4 | 버프·디버프 아이콘 줄(남은 시간) | 구체 위 아이콘 열 | **없음** — 상태 글자 자리만(`NativeHudPresentation.cs:7`) | 권장 | 1-1 상태이상 수에 따라 필수로 올림 |
| F5 | 경험치 바·레벨업 연출 | 하단 얇은 바, 레벨업 배너 | 있음 — `NativeLevelUpOverlay.cs`, 바 텍스처 `NativeHud.cs:40` | 필수 | |
| F6 | 지역 이름 배너(진입 시) | 페이드 인/아웃 제목 | 있음 — `NativeAreaTitle.cs`, 지역 배너 `NativeRegionHud.cs` | 필수 | |

### G. 전리품

| # | 관례 | 대표 구현 | 현재 상태 (근거) | 필요도 | 비고 |
|---|---|---|---|---|---|
| G1 | 바닥 아이템 이름표(등급색) + 표시 키 | 월드 라벨, 겹침 정렬, Alt 토글 | **없음** — 아이콘+등급별 빛기둥만(`NativeGame.WorldDrops.cs:9,21-22`) | **필수** | |
| G2 | 등급별 빛기둥·드롭 소리 | 색 빔, 고등급 전용 음 | 있음(빔) — 위. 드롭 소리는 미확인 | 필수 | |
| G3 | 줍기 필터(등급 이하 숨김) | 설정 | 있음 — `Simulation.MinPickRarity`(`NativeGame.SettingsOptions.cs:23`) | 권장 | |
| G4 | 획득 알림 | 화면 측면 알림 | 부분 — 토스트 있음(`NativeGame.WorldDrops.cs:143`) 그러나 한국어 고정 `RarityNames`·"획득!"(`:136,143`) | 필수 | 번역대상_전체목록 미등록 의심 → 번역 레인 확인 |
| G5 | 툴팁 장비 비교 | 착용품과 나란히 | 있음 — `NativeInventoryComparison.cs` | 필수 | |

### H. 적 표시

| # | 관례 | 대표 구현 | 현재 상태 (근거) | 필요도 | 비고 |
|---|---|---|---|---|---|
| H1 | 일반 적 머리 위 작은 체력바(피격·조준 시만) | 월드→화면 바 | 있음 — 3D 경로 `NativeGame.A2Enemies.cs:42-60`(조건 `A2FieldLayout.cs:269`), 2D 경로 `NativeGame.cs:603-604` | 필수 | 2D 경로 채움색이 원색 빨강 `Color(.8f,0,0)`(`NativeGame.cs:604`) — 실버 헬 3D 경로 색과 다름 |
| H2 | 엘리트·챔피언 표시(이름·어픽스·테두리색·오라) | 이름표 + 어픽스 줄 + 색 | **없음** — Core에 `Elite`·`EliteTables`, Runtime 표시 코드 0 | **필수** | 1-1 게이트 수호자 elite 3 |
| H3 | 보스 상단 대형 체력바 + 이름 + 등장 연출 | 화면 상단 바 | 있음 — `NativeBossBar.cs`(인트로 2.0초), 대사 `NativeBossDialogue.cs` | 필수 | |
| H4 | 보스 그로기·무적 상태 표시 | 바 색·칩 | 있음 — `NativeBossBar.cs` 머리 주석(groggy/immune, status chips) | 필수 | |

### I. 미니맵·목표

| # | 관례 | 대표 구현 | 현재 상태 (근거) | 필요도 | 비고 |
|---|---|---|---|---|---|
| I1 | 코너 미니맵(지형·목표 아이콘) | 타일 렌더 + 아이콘 | 있음 — `NativeFieldHud.cs`, `NativeMinimapTiles.cs`, `NativeMinimapObjectives.cs:5`(Hole·Angler·Gate·Region) | 필수 | |
| I2 | 목표 패널(현재 할 일) | 화면 측면 퀘스트 줄 | 있음 — `NativeObjectivePanel.cs`, `NativeHellGateObjective.cs` | 필수 | |
| I3 | 화면 밖 목표 방향 화살표 | 가장자리 화살표 | 있음 — `NativeRegionHud.cs`(region arrow), 배치 `NativeRegionArrowLayout.cs` | 필수 | |
| I4 | 전체 지도 오버레이(Tab) | 반투명 전체 맵 | 미확인 | 나중 | 1-1 한 판 규모에서는 낮음 |

### J. 로딩·전환

| # | 관례 | 대표 구현 | 현재 상태 (근거) | 필요도 | 비고 |
|---|---|---|---|---|---|
| J1 | 로딩 화면(원화+팁+진행) | 큰 이미지, 팁 문구 | 있음 — `NativeScreenTransition.cs`, `NativeLoadingSelection.cs`, 팁 촬영 `NativeGame.LoadingTipCapture.cs` | 필수 | |
| J2 | 로딩 멈춤 감시·실패 복귀 | 워치독 | 있음 — `NativeScreenTransition.cs:15-17`(조립 20초/기타 12초) | 필수 | 크래시 0 목표 |
| J3 | 컷신·인트로 길게 눌러 건너뛰기 | 홀드 게이지 | 있음 — 로비 영상 hold skip(`NativeGame.LobbySmoke.cs:21` 검사 항목) | 필수 | |

### K. 일시정지·설정

| # | 관례 | 대표 구현 | 현재 상태 (근거) | 필요도 | 비고 |
|---|---|---|---|---|---|
| K1 | Esc 일시정지(시뮬 정지) + 창 포커스 잃으면 정지 | 메뉴 오버레이 | 있음 — `NativePauseMenu.cs`, `NativeGame.PauseFocus.cs` | 필수 | |
| K2 | 키 재설정(주·보조) | 대기→입력 받기 | 있음 — `NativeKeyBindList.cs:38-61` `BeginListening(action,alternate)` | 필수 | |
| K3 | 음량 분리(전체·BGM·효과) | 슬라이더 | 있음 — `NativePauseMenu.A15Web.cs:16-17`(SFX·BGM). 음성 별도 슬라이더 없음 | 필수 | |
| K4 | 그래픽 프리셋·개별 항목·FPS 제한 | 프리셋+토글 | 있음 — `NativePauseMenu.A15Web.cs:15,174`, `NativeGraphicsOptions.cs` | 필수 | |
| K5 | 화면 흔들림·움직임 줄이기 | 슬라이더·체크 | 있음 — `NativePauseMenu.A15Web.cs:19` `optReduceMotion`, `NativeOsReducedMotion.cs` | 필수 | |
| K6 | 자막(컷신·보스 대사) | 하단 자막 | 부분 — 로비 영상 자막(`NativeLobby.CharacterStory.cs:48`), 보스 대사 글자 띠(`NativeBossDialogue.cs:15-16`). 자막 크기·배경 옵션 없음 | 권장 | |
| K7 | UI 배율·글자 크기 | 슬라이더 | **없음** | 권장 | 3840×1080·작은 모니터 가독성 |
| K8 | 색약 모드 | 탄·예고 색 팔레트 교체 | **없음** | 권장 | 예고 색 구분(E5)과 함께 |
| K9 | 게임패드 | 전 메뉴·전투 지원 | 부분 — 메뉴 일부만(`NativePauseMenu.A15Web.cs:463`, `NativeLobby.UiSound.cs:26`) | 나중 | 데모 v0 범위 밖으로 둠(결정 필요 시 보고) |
| K10 | 언어 선택 | 메뉴 | 있음 — `NativeLobby.LanguageMenu.cs`, 설정 `optLang`(`NativePauseMenu.A15Web.cs:148`) | 필수 | 29개 언어 |

### L. 사운드 믹스

| # | 관례 | 대표 구현 | 현재 상태 (근거) | 필요도 | 비고 |
|---|---|---|---|---|---|
| L1 | 우선순위(예고 > 스킬 > 음성 > 피격 > 발소리 > 일반 타격 > 탄 > 환경) | 음성 수 제한·우선순위 교체 | 있음 — `NativeFeedbackAudio.cs:22-24`(Pri 12…0, Voice 풀) | 필수 | |
| L2 | 예고·중요음 시 다른 버스 덕킹 | 사이드체인 | 있음 — `NativeAudioMixer.cs:10` | 필수 | |
| L3 | 같은 소리 동시 재생 제한·변주 | 쿨다운·피치 랜덤 | 부분 — `Req.pitch`·`blend`(`NativeFeedbackAudio.cs:24`). 같은 키 동시 상한은 미확인 | 권장 | |
| L4 | 전투/비전투 BGM 전환 | 상태별 트랙·크로스페이드 | 있음 — `NativeBgmCues.cs`, `NativeGameMusic.cs` | 필수 | 청취 판정 필요 |

### M. 사망·부활

| # | 관례 | 대표 구현 | 현재 상태 (근거) | 필요도 | 비고 |
|---|---|---|---|---|---|
| M1 | 사망 순간 감속·화면 감쇠 → 사망 화면 | 슬로모, 채도 감소 | 있음 — `NativeDeathOverlay.cs:27,93,125`(fade·선택지 순차) | 필수 | |
| M2 | 쓰러짐 카운트다운·부활 선택 | 카운트·버튼 | 있음 — `NativeRevive.cs:9`(5초 fallen), `NativeRevive.DeathScreen.cs` | 필수 | |
| M3 | 부활 직후 짧은 무적·위치 안전 | i-frame | Core 소관(미확인) | 필수 | 판정은 Core 정답, 표시만 확인 |
| M4 | 사망 원인 표시 | "XX에게 사망" | 없음 — 웹에서도 Unity 쪽 기록 없음(`NativeGame.cs:275` 주석: damage-log 상태 없음) | 나중 | |

## 2. 공개 매뉴얼 근거 (2026-11-05 CTO 요청 추가)

- **확인 경계:** 이 세션 네트워크에서 `learn.microsoft.com`·`devdocs.xbox.com`·`gameaccessibilityguidelines.com`은 이름 풀이가 안 돼 본문을 열지 못했다. 아래 URL과 조항 제목은 웹 검색 결과에서 페이지가 실제로 있다는 것만 확인했다. 조항 본문 문구 대조는 **미확인**이다. 다음 작업자가 PC·Mac 브라우저로 열어 확인하고 이 표의 "본문 확인" 칸을 채운다. 링크의 언어 경로(en-us·en-gb·da-dk 등)는 검색에 나온 그대로 두었다. 같은 조항은 `/en-us/`로 바꿔도 열린다(URL 규칙 추정, 미확인).
- 공개 매뉴얼은 대부분 **접근성·렌더 구현** 근거다. 가림 투명화·히트스톱·전리품 이름표·엘리트 표시 같은 장르 관례에는 공식 조항이 없다. 이런 항목은 GDC 세션이나 레퍼런스 실물 캡처(품질 기준 §2-1)로 근거를 대고, 조항이 없다고 적는다.

### 2.1 출처 목록

| ID | 출처 | URL | 본문 확인 |
|---|---|---|---|
| X101 | XAG 101 Text display (글자 크기·줄 간격·색·사용자 조정) | https://learn.microsoft.com/da-dk/gaming/accessibility/xbox-accessibility-guidelines/101 | 미확인 |
| X102 | XAG 102 Contrast | https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102 | 미확인 |
| X103 | XAG 103 Additional channels for visual and audio cues (한 감각에만 기대지 않기) | https://learn.microsoft.com/en-gb/gaming/accessibility/xbox-accessibility-guidelines/103 | 미확인 |
| X104 | XAG 104 Subtitles and captions (자막·화자 표시·효과음) | 목록 https://learn.microsoft.com/en-us/gaming/accessibility/guidelines (개별 URL은 검색에 안 나옴) | 미확인 |
| X105 | XAG 105 Audio accessibility (음악·대사·효과·채팅 음량 분리) | https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/105 | 미확인 |
| X107 | XAG 107 Input (재설정·누르기/유지·보조 장치) | https://learn.microsoft.com/de-de/gaming/accessibility/xbox-accessibility-guidelines/107 | 미확인 |
| X114 | XAG 114 UI context (라벨·문맥 신호) | https://learn.microsoft.com/es-mx/gaming/accessibility/xbox-accessibility-guidelines/114 | 미확인 |
| X117 | XAG 117 Visual distractions and motion settings (카메라 흔들림·시야·멀미) | https://learn.microsoft.com/da-dk/gaming/accessibility/xbox-accessibility-guidelines/117 | 미확인 |
| GAG-B | Game Accessibility Guidelines 기본 단계(자막을 읽기 쉽게 표시 등) | https://gameaccessibilityguidelines.com/basic/ | 미확인 |
| GAG-V | 같은 지침의 시각 항목 "필수 정보를 색만으로 전달하지 않기" | 개별 URL 미확인. 전체 목록에서 찾아 채울 것 | 미확인 |
| GDC-D4A | GDC 2024 "Diablo IV: The Art of Open World Sanctuary"(아이소메트릭 카메라용 환경 제작·가독성) | https://gdcvault.com/play/1034222/-Diablo-IV-The-Art | 개요만(녹화는 유료 회원일 수 있음) |
| GDC-D4P | GDC "The Pillars of Hell: Achieving the Artistic Vision of Diablo IV" | https://www.gdcvault.com/play/1034608/The-Pillars-of-Hell-Achieving | 제목만 |
| U-RO | Unity URP "Render Objects로 가려진 캐릭터 실루엣 그리기"(가려진 부분용·앞 부분용 Render Objects 두 개) | https://docs.unity3d.com/6000.2/Documentation/Manual/urp/renderer-features/how-to-custom-effect-render-objects.html · URP 15: https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal%4015.0/manual/renderer-features/how-to-custom-effect-render-objects.html | 검색 요약으로 내용 확인(docs.unity3d.com은 열기 시도 안 함) |
| U-LIT | Unity URP Lit — Surface Type Transparent(배경과 섞임, 불투명 뒤 별도 패스)·Blending Mode Alpha/Premultiply·Alpha Clipping(컷아웃) | https://docs.unity3d.com/Manual/urp/lit-shader.html · https://docs.unity3d.com/6/Documentation/Manual/urp/shader-complex-lit.html | 검색 요약으로 내용 확인 |
| GUIDB | Game UI Database(화면 유형·HUD 요소로 거르는 게임 UI 캡처 DB) | https://www.gameuidatabase.com/ (존재는 소개 기사로 확인: https://creativebloq.com/3d/video-game-design/game-ui-database-20-is-the-ultimate-free-reference-tool-for-game-designers) | 미확인. D4·PoE2 화면이 있는지 검색으로 확인 못 함 |

PoE2·Last Epoch·Torchlight·No Rest for the Wicked의 GDC 세션은 검색으로 찾지 못했다(없음이 아니라 미발견). NRFTW 실물 연구는 품질 기준 §3의 기존 자료를 쓴다.

### 2.2 항목별 근거

| 항목 | 공개 매뉴얼 근거 | 조항이 없을 때의 근거 |
|---|---|---|
| A1 고정 피치 탑다운 카메라 | GDC-D4A(아이소메트릭 카메라 전제의 환경 제작) | — |
| A4·A5·K5 흔들림·밀어넣기 줌·움직임 줄이기 | X117 | — |
| B1 가림 페이드 | 구현: U-LIT(Transparent + Alpha 또는 Premultiply로 알파 페이드). Alpha Clipping은 경계가 딱딱하게 튀므로 페이드용으로 쓰지 않는다. 디더 컷아웃은 점 금지로 제외 | 관례 근거: GDC-D4A(카메라에 맞춘 디테일 배치) + 레퍼런스 캡처. **공식 조항 없음** |
| B2 가려진 영웅 실루엣 | 구현: U-RO(Unity 공식 예제가 바로 이 기능) | 관례 근거: 레퍼런스 캡처. 공식 조항 없음 |
| B3 가리는 소품 배치 | GDC-D4A | — |
| C1·C2·H1 영웅·적·탄 대비 | X102 | — |
| C4·C5·G1·H2 강조·라벨·이름표·엘리트 표시 | X114(UI 문맥·라벨) | 표시 형식은 GUIDB 캡처 |
| D1·D2 히트스톱·피격 번쩍임 | 공식 조항 없음 | 레퍼런스 영상(연속 프레임) |
| D3 피해 숫자 | 공식 조항 없음 | GUIDB |
| E1·E2·E4 바닥 예고·예고음 | X103(시각 예고와 소리를 같이 주기) | — |
| E5·K8 패링 가능 색 구분·색약 모드 | X103, GAG-V | — |
| F1~F6 HUD 구성 | 공식 조항 없음(글자 판독은 X101) | GUIDB HUD 필터 |
| I1~I3 미니맵·목표·화살표 | X114 | GUIDB |
| J1~J3 로딩·건너뛰기 | 공식 조항 없음 | GUIDB |
| K2·K9 키 재설정·게임패드 | X107 | — |
| K3·L1·L2 음량 분리·우선순위·덕킹 | X105(음량 분리, 중요한 신호가 들리게) | — |
| K6 자막 | X104, GAG-B | — |
| K7 UI 배율·글자 크기 | X101 | — |
| M1~M4 사망·부활 | 공식 조항 없음 | 레퍼런스 영상 |

## 3. 유지 규칙

- 행을 추가할 때도 3편 이상 공통 조건을 지킨다. 한 게임만의 기능은 해당 분야 SSOT의 "참고"로 둔다.
- 상태를 "있음"으로 바꾸려면 코드 근거와 함께 Mac 실게임 캡처/영상 경로를 비고에 적는다. 코드만 있으면 "있음(화면 미검증)"으로 쓴다.
- 우선순위 표(§0)는 데모 v0 4개 목표 중 무엇을 미는지로 정렬한다. 끝난 항목은 §0에서 지우고 §1 상태만 남긴다.
