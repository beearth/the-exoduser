# MO 현재 기준 — 영웅 idle·walk·attack1 (2026-11-05, Mac)

새 파이프라인과 비교할 "현재" 기준 영상과 채점표다. 게임 코드·자산은 바꾸지 않았다.

## 결론

기준은 둘이다(CTO 결정). **스프라이트**는 기본 출하 경로로 사용자가 보는 화면이고, **rigpixel**(`--hero-render=rigpixel`)은 새 파이프라인의 비교 대상이다. 스프라이트 채점은 이 문서 아래쪽, rigpixel 채점은 [rigpixel 절](#rigpixel-기준)에 있다.

| 경로 | idle ○/× | walk ○/× | attack1 ○/× |
|---|---|---|---|
| 스프라이트 | 4 / 1 | 1 / 5 | 2 / 4 |
| rigpixel | 4 / 1 | 2 / 3 (보류 1) | 3 / 3 |

- **두 경로 모두 합격 기준에 못 미친다.** attack1의 예비동작은 아래 D-MO-2 결정 전까지 "Core 제약"으로 표기하고 나머지 6항목으로 채점했다.
- **기본 공격에는 Core 상의 예비동작 틱이 없다.** 입력 다음 바로 `wSwing`이다. **Core 제안 D-MO-2**(사용자 결정 대기): [MOTION_PIPELINE](../MOTION_PIPELINE_20261105.md).
- **스프라이트 공격의 48px→80px→48px 교체는 결함으로 기록하되 고치지 않는다(동결).**

## 촬영 조건

| 항목 | 값 |
|---|---|
| 빌드 | `unity/main` `a1ee5666c` + 커밋하지 않은 촬영 코드 ([사본](../../../../tools/teardown/mo_local_probe.cs.txt)) |
| 인자 | `--remodel3d --local-motion --unity-mute -nosound --unity-qa-sandbox …` (`--hero-render` 없음) |
| 진입 | 키샷과 같은 프리뷰 경로(`SelectPreview`→`EnterTest`). **새 캐릭터 생성 경로가 아니다** |
| 위치·카메라 | 1-1 다리 4200:7460, 피치 34°, 거리 16.5u, FOV 46.9453° (실행 중 읽은 값) |
| 진행 | 1프레임 = Core 1틱, 60fps 고정(`Time.captureFramerate`), 가상 키보드·마우스 입력 |
| 입력 | idle 없음 / walk 동·서·북·남 각 130틱 후 20틱 정지 / attack1 120틱마다 좌클릭 6틱 |
| 적·자원 | 적 제거, HP·기력·마나 매 틱 채움 |

**실행 방식의 한계:** 창이 뜨는 실행이다(소리는 끔). 공용 실행기는 PC용이라 Mac 키샷과 같은 방식으로 돌렸다.

## 산출물

| 동작 | 영상 (10초, 무음) | 1x 정지 컷 | 전체 화면 | 연속 프레임 (3틱 간격) |
|---|---|---|---|---|
| idle | [idle.mp4](idle.mp4) | [1x](still-idle-1x.png) | [1920](still-idle-1920.png) | [39틱 간격](idle.png) |
| walk | [walk.mp4](walk.mp4) | [1x](still-walk-1x.png) | [1920](still-walk-1920.png) | [동쪽](walk-right.png), [정지·반전](walk-transition.png), [북쪽](walk-north.png) |
| attack1 | [attack1.mp4](attack1.mp4) | [1x](still-attack1-1x.png) | [1920](still-attack1-1920.png) | [0~45틱](attack1-f0-44.png) |

틱별 상태·위치: [motion-log.csv](motion-log.csv). 영상 인코딩은 Blender(H.264, 60fps)로 했다.

## 지금 영웅이 그려지는 방식 (코드, `NativeGame.cs:442-446`)

| 동작 | 그림 | 프레임 결정 | 실제 재생 |
|---|---|---|---|
| idle | 48px, 2프레임 | `TickCount/48 % 2` | 0.8초마다 교체 |
| walk | 48px, 8프레임 | `2 + 이동거리/32 % 8` | 2.72px/틱 기준 약 11.8틱마다 교체(약 5fps), 한 주기 약 1.57초 |
| attack1 | 80px 시트 `attack-bat-v1` | `NativeHeroSpriteMotion.Frame` | `wSwing` 5틱 → `wRecover` 34틱 → idle |

리그 영웅(`heroView`)은 `--legacy-models` 또는 `--hero-render=rigpixel`일 때만 만들어진다(`NativeGame.cs:238`, `NativeHd2D.Enabled`). 이번 촬영에서 `heroView`는 없었다. `motion-log.csv`의 `motion` 열이 모두 `none`인 이유이다.

## 채점표

○ = 문제 없음, × = 문제 있음, - = 해당 없음. "Core 타이밍"은 코드 기준 잠정값이고, 클라우드 MO 세션의 타이밍 표가 나오면 다시 대조한다.

| 항목 | idle | 근거 | walk | 근거 | attack1 | 근거 |
|---|---|---|---|---|---|---|
| 예비동작 | - | | × | 정지 프레임에서 바로 달리기 프레임 | Core 제약 | Core에 틱이 없음. 입력 직후 `wSwing`이고 첫 화면부터 칼을 휘두름 |
| 무게 이동 | × | 2프레임 교체뿐, 체중 이동 없음 | × | 약 5fps 8프레임, 1x에서 상체 오르내림이 거의 안 보임 | × | 휘두른 뒤 몸이 앞으로 쏠린 채 정지 |
| 팔로스루 | - | | - | | × | 칼·망토가 약 16틱 같은 그림으로 멈춤, 이어서 다음 그림으로 교체 |
| 발 미끄러짐 | ○ | 위치 변화 없음 | × | 그림 교체는 이동 거리에 비례하지만 1x에서 발이 구분되지 않아 미끄러지듯 보임. **접지를 수치로 재지 않았다** | ○ | 공격 중 위치 변화 없음 (x 4200.00 고정) |
| 전환 끊김 | ○ | 전환 없음 | × | 정지·방향 반전 때 보간 없이 그림 교체 | × | 39틱에 idle로 한 번에 교체 |
| Core 타이밍 불일치 | ○ | 표시가 틱에서 직접 계산됨 | ○ | 표시가 Core 이동 거리에서 계산됨 | ○ | 표시가 상태·남은 틱에서 직접 계산됨 |
| 포즈 어색 | ○ | 칼을 내린 대기 자세로 읽힘 | × | 북쪽 이동은 망토만 보여 판자처럼 읽힘 | × | **공격 때 영웅이 갑자기 커지고 선명해짐**(80px 시트와 48px 시트가 섞임). 0~45틱 그림의 36→39틱 |
| **○ 개수** | **4** | | **1** | | **2** | |

## 판정의 한계

- **움직이는 영상을 실시간으로 보고 판정하지 않았다.** 3틱 간격 연속 프레임, 틱 로그, 코드로 판정했다. 영상 자체는 재생 시간(10초)과 해상도(1080p)만 확인했다. 최종 판정은 사용자가 영상을 보고 해야 한다.
- **프리뷰 경로로 찍었다.** 새 캐릭터 경로에서 무기·공격 속도가 다르면 공격 틱이 달라질 수 있다. 확인하지 않았다.
- walk의 동쪽 구간은 다리 밖 물 위를 지나간다. 맵 충돌이 막지 않는 경로이고, 물에 잠기는 표현은 없다.
- 공격은 첫 타만 120틱마다 눌렀다. 연속 콤보는 찍지 않았다.

## rigpixel 기준

같은 빌드, 같은 입력, 같은 위치에 `--hero-render=rigpixel`만 더했다. 실행 중 `rigPixelHero.Ready=True`를 확인했다. Core 상태 전환은 스프라이트와 같다(`wSwing` 5틱 → `wRecover` 34틱 → idle).

**진입 경로:** 검증된 새 캐릭터 경로(`RigPixelReviewEntry`)를 먼저 시도했으나 `RigPixel real warrior creation failed`로 실패해(페이지 Title, 3D 미활성), 스프라이트와 같은 프리뷰 경로로 찍었다. 실패 원인은 조사하지 않았다. 촬영 코드가 일반 시작 흐름 위에서 돌아서 생긴 문제인지, 그 경로 자체의 문제인지 구분되지 않았다.

| 동작 | 영상 (10초, 무음) | 1x 정지 컷 | 전체 화면 | 연속 프레임 (3틱 간격) |
|---|---|---|---|---|
| idle | [idle.mp4](rigpixel/idle.mp4) | [1x](rigpixel/still-idle-1x.png) | [1920](rigpixel/still-idle-1920.png) | [39틱 간격](rigpixel/idle.png) |
| walk | [walk.mp4](rigpixel/walk.mp4) | [1x](rigpixel/still-walk-1x.png) | [1920](rigpixel/still-walk-1920.png) | [동쪽](rigpixel/walk-right.png), [정지·반전](rigpixel/walk-transition.png), [북쪽](rigpixel/walk-north.png) |
| attack1 | [attack1.mp4](rigpixel/attack1.mp4) | [1x](rigpixel/still-attack1-1x.png) | [1920](rigpixel/still-attack1-1920.png) | [0~45틱](rigpixel/attack1-f0-44.png) |

틱별 로그: [motion-log.csv](rigpixel/motion-log.csv). 이 경로는 `motion` 열에 `Idle/Run/Swing/Recover`가 기록된다.

| 항목 | idle | 근거 | walk | 근거 | attack1 | 근거 |
|---|---|---|---|---|---|---|
| 예비동작 | - | | × | Core 이동이 첫 틱부터 전속력(2.72px/틱), 출발 전 준비 자세 없음 | Core 제약 | Core에 틱이 없음 |
| 무게 이동 | × | 39틱 간격 프레임에 몸 변화가 거의 없음 | ○ | 무릎을 굽히고 몸을 숙여 진행 방향으로 쏠림 | × | 발을 딛지 않고 선 채 팔만 움직임 |
| 팔로스루 | - | | - | | × | 칼을 뻗은 뒤 약 18틱 천천히 흐를 뿐 몸은 따라가지 않음 |
| 발 미끄러짐 | ○ | 위치 변화 없음 | 보류 | 다리가 걷기 주기로 움직이지만 접지를 수치로 재지 않았고, 프레임만으로 판정 불가 | ○ | 위치 변화 없음 |
| 전환 끊김 | ○ | 전환 없음 | × | 방향 반전 때 약 9틱 안에 칼이 크게 휘돌아감 | ○ | 39틱 idle 전환에 눈에 띄는 튐 없음 |
| Core 타이밍 불일치 | ○ | Idle 유지. 첫 틱의 Run 1틱은 촬영 코드가 위치를 옮긴 영향으로 보임 | ○ | Run/Idle 전환이 입력 구간과 일치(130, 150, 280…) | ○ | Swing 0~4틱, Recover 5~38틱, Idle 39틱이 Core와 일치 |
| 포즈 어색 | ○ | 대기 자세로 읽힘 | × | 웅크린 자세가 과하고 칼이 넓은 판처럼 보임 | × | 회복 중 27~33틱에 칼이 넓게 보이다 가늘게 바뀌며 형태가 튀어 보임 |
| **○ 개수** | **4** | | **2** | | **3** | |

**스프라이트와 비교:** 프레임 수가 끊기는 문제와 공격 때 크기가 튀는 문제는 rigpixel에 없다. 대신 웅크린 달리기와 칼 형태가 새로운 문제다.

**동작 외 결함 (관찰만, 고치지 않음):**
- 동쪽 이동 중 난간을 지날 때 망토 조각이 몸에서 떨어져 보인다 ([walk-right](rigpixel/walk-right.png) 아래 줄 왼쪽).
- 북쪽 이동 후반에 머리가 반투명해지고 망토에 대각선 무늬가 생긴다 ([walk-north](rigpixel/walk-north.png) 아래 줄). 가림 처리와의 관계는 확인하지 않았다.

한계는 스프라이트와 같다. 영상을 실시간으로 보고 판정하지 않았고, 프리뷰 경로이며, 공격은 첫 타만 찍었다.

## 파이프라인 도구 확인 (설치 안 함)

| 도구 | 상태 | 비고 |
|---|---|---|
| Blender Rigify | **내장, 설치 불필요** | 4.5.15에서 `preferences.addon_enable`로 켜고, 사람 메타리그(본 159개)에서 `pose.rigify_generate` 성공. `addon_utils.enable`은 `default_set=False`일 때 오류가 나므로 쓰지 않는다 |
| Rokoko 리타깃 애드온 | **미설치, 설치 필요** | 공식 안내상 리타깃은 무료, zip 설치. Blender 4.5 지원을 명시한 자료는 찾지 못함 |
| Move 전용 리타깃 애드온 | **없음** | Move AI 문서는 타사 도구를 쓰라고 안내, Blender 4 이상 요구 |

출처: [Rokoko 설치](https://support.rokoko.com/hc/en-us/articles/4410463492241-Install-the-Blender-plugin), [Rokoko 리타깃](https://support.rokoko.com/hc/en-us/articles/4410463481489), [Rokoko GitHub](https://github.com/Rokoko/rokoko-studio-live-blender), [Move AI 문서](https://docs.move.ai/knowledge/blender-retargeting-move-one-animations).
