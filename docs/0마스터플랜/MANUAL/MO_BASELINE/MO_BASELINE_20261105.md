# MO 현재 기준 — 영웅 idle·walk·attack1 (2026-11-05, Mac)

새 파이프라인과 비교할 "현재" 기준 영상과 채점표다. 게임 코드·자산은 바꾸지 않았다.

## 결론

- **채점: idle ○ 3 / × 2, walk ○ 1 / × 5, attack1 ○ 2 / × 5.** 합격 기준(7항목 중 ○ 6개)에 세 동작 모두 못 미친다.
- **기본 실행의 영웅은 리그가 아니라 2D 스프라이트 시트다.** 리그 영웅은 옵션을 줘야 나온다. 브리프 §3은 리그 경로를 전제하므로, 어느 쪽을 "현재"로 볼지 확인이 필요하다.
- **기본 공격에는 Core 상의 예비동작 틱이 없다.** 입력 다음 바로 `wSwing`이다. Core 변경 없이 예비동작을 넣을 자리가 없으므로, 브리프 §0 금지와 부딪힌다.

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
| 예비동작 | - | | × | 정지 프레임에서 바로 달리기 프레임 | × | Core에 틱이 없음. 입력 직후 `wSwing`이고 첫 화면부터 칼을 휘두름 |
| 무게 이동 | × | 2프레임 교체뿐, 체중 이동 없음 | × | 약 5fps 8프레임, 1x에서 상체 오르내림이 거의 안 보임 | × | 휘두른 뒤 몸이 앞으로 쏠린 채 정지 |
| 팔로스루 | - | | - | | × | 칼·망토가 약 16틱 같은 그림으로 멈춤, 이어서 다음 그림으로 교체 |
| 발 미끄러짐 | ○ | 위치 변화 없음 | × | 그림 교체는 이동 거리에 비례하지만 1x에서 발이 구분되지 않아 미끄러지듯 보임. **접지를 수치로 재지 않았다** | ○ | 공격 중 위치 변화 없음 (x 4200.00 고정) |
| 전환 끊김 | ○ | 전환 없음 | × | 정지·방향 반전 때 보간 없이 그림 교체 | × | 39틱에 idle로 한 번에 교체 |
| Core 타이밍 불일치 | ○ | 표시가 틱에서 직접 계산됨 | ○ | 표시가 Core 이동 거리에서 계산됨 | ○ | 표시가 상태·남은 틱에서 직접 계산됨 |
| 포즈 어색 | ○ | 칼을 내린 대기 자세로 읽힘 | × | 북쪽 이동은 망토만 보여 판자처럼 읽힘 | × | **공격 때 영웅이 갑자기 커지고 선명해짐**(80px 시트와 48px 시트가 섞임). 0~45틱 그림의 36→39틱 |
| **○ 개수** | **3** | | **1** | | **2** | |

## 판정의 한계

- **움직이는 영상을 실시간으로 보고 판정하지 않았다.** 3틱 간격 연속 프레임, 틱 로그, 코드로 판정했다. 영상 자체는 재생 시간(10초)과 해상도(1080p)만 확인했다. 최종 판정은 사용자가 영상을 보고 해야 한다.
- **프리뷰 경로로 찍었다.** 새 캐릭터 경로에서 무기·공격 속도가 다르면 공격 틱이 달라질 수 있다. 확인하지 않았다.
- walk의 동쪽 구간은 다리 밖 물 위를 지나간다. 맵 충돌이 막지 않는 경로이고, 물에 잠기는 표현은 없다.
- 공격은 첫 타만 120틱마다 눌렀다. 연속 콤보는 찍지 않았다.

## 파이프라인 도구 확인 (설치 안 함)

| 도구 | 상태 | 비고 |
|---|---|---|
| Blender Rigify | **내장, 설치 불필요** | 4.5.15에서 `preferences.addon_enable`로 켜고, 사람 메타리그(본 159개)에서 `pose.rigify_generate` 성공. `addon_utils.enable`은 `default_set=False`일 때 오류가 나므로 쓰지 않는다 |
| Rokoko 리타깃 애드온 | **미설치, 설치 필요** | 공식 안내상 리타깃은 무료, zip 설치. Blender 4.5 지원을 명시한 자료는 찾지 못함 |
| Move 전용 리타깃 애드온 | **없음** | Move AI 문서는 타사 도구를 쓰라고 안내, Blender 4 이상 요구 |

출처: [Rokoko 설치](https://support.rokoko.com/hc/en-us/articles/4410463492241-Install-the-Blender-plugin), [Rokoko 리타깃](https://support.rokoko.com/hc/en-us/articles/4410463481489), [Rokoko GitHub](https://github.com/Rokoko/rokoko-studio-live-blender), [Move AI 문서](https://docs.move.ai/knowledge/blender-retargeting-move-one-animations).
