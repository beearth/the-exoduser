# P2-006b PC — 드랍 후속 화면·LMB 원인 검수

**부분 완료 / 검수 대기 / VISUAL VERDICT: RETOUCH.** 기능 검사와 화면 동등성은 별개다.
브랜치 `codex/p2-006b-pc-20261020`, 작업 폴더 `G:/exoduser-wt/codex-p2-006b`.
시작 HEAD `b933b2da55e9bc7a29a41cd7d7093d437ce334cf`; 본 폴더·사용자 서버3333·실제 세이브 변경0.

## ① 원본 근거·판정

| 항목 | 이 worktree 원본 game.html | 관측·조치 |
|---|---|---|
| 스킨 크기·샘플링 | 51736, 52591–52593 | 34px, imageSmoothingEnabled=false. Native 명시 누락을 NEAREST 1줄로 보완 |
| 등급 빔 | 27824–27829, 52582–52588 | 등급0~5→tier[0,2,3,4,5,6], 60×160, ADD, alpha .46+sin(now/400+x)×.05. 수치 그대로 |
| 라벨·등급색 | 52579–52594 | 장비 이름 라벨 없음. 같은 스킨을 RARITY_C로 다시 칠하지 않음. 무라벨/일반 무빔을 결함으로 오인해 추가하지 않음 |
| 바운스 | 52485 | sin(now/300+x)×3. 3시점 native/web 좌표 크롭 및 원본 계산값 보존 |
| 사망 임팩트 | 25196, 34617 | life1, sp/60×.8 감소. 75틱 경계 이후 관측 |
| 붉은 death_blood | 19679, 54581–54582 | 16프레임·frameTime4, 렌더 프레임 기준. 121 물리틱만으로 안 끝난 최초 캡처를 보존하고 종료 카운트0까지 기다림 |
| LMB | 44118, 44134, 44900–44904 | SKILL_ICONS에 weapon 없음. 기존 test_p2006a_visual.gd:41의 activeLMBSk='weapon' 주입이 빈 칸 원인. 공격 중만이 아니라 idle에도 빈 칸. kiSlash 복원 시 즉시 아이콘 복귀 |
| 그림자 | 52593 | 원본 alpha .9·blur6·offsetY2, A 포트 .55 오프셋 실루엣 근사 잔존. 정확 동등성 미완 |

## 선행 누락·정상 보존

지정 main b933b2da5에는 `native_world_drops.gd`, A 테스트·에셋·보고서가 없었다.
`ab90bdc21`은 이름은 merge지만 부모1개·WORK_BOARD 1파일만 수정한 커밋이며 실제 A 소스를 포함하지 않았다.
승인된 제출본 957e07eb1/e04854243/48f0d8e78을 **이 브랜치에만 cherry-pick**:
`319b4a21e` / `eb0cb0877` / `dba6931eb`. main merge/push·본 폴더 변경 없음.
2_7와 CHANGELOG 충돌은 DOC-SYNC·P3와 A 양쪽 내용을 모두 남겼다. 원본 WIP·타 팀 코드는 가져오지 않았다.
원본 에셋189개는 현재 worktree 원경로·대상·A manifest의 SHA-256 **189/189 일치**.
`asset-readback.json`에 결과·경로·해시 보존. 신규 제작·AI 생성·에셋 편집 없음.

## ② 변경 파일·공용 줄 수

| 구분 | 변경 |
|---|---|
| A 선행분 | 승인된 390파일 구현·189에셋 및 import·기존 테스트·관련 docs(eb0cb0877) |
| B 제품 코드 | native_world_drops.gd의 configure에 texture_filter=NEAREST **+1/-0줄** |
| B 전용 검수 | test_p2006b_lmb.gd, test_p2006b_drop_render.gd, visual_p2006b_lmb.gd, visual_p2006b_drops.gd |
| 문서 | WORK_BOARD, 7아이템, CHANGELOG_SYNC, 본 보고서 |
| 공용 파일 | A 선행 main.gd **+6/-0**, native_source_new_run_state.gd **+79/-0**. B 추가변경은 둘 다0. hud/world/player/native_normal_enemy_hurte 모두0 |

Q/E·레슨·2_3·세이브 형식 수정0. 기존 guard.baseline의 hook 변경은 소유 제외·미커밋.
`override.cfg`는 회차마다 격리 설정 후 비웠으며 커밋하지 않는다.

## ③ 실행·수치·원로그

엔진 `G:/godot-engine/4.7.2/Godot_v4.7.2-stable_win64_console.exe`, v4.7.2.stable.official.ed1daf0bf.
로그 루트 **`G:/exoduser-wt/_out/P2-006b-pc/`**.
제공 헬퍼 `run_godot_tests.sh <본worktree>/godot <로그폴더> <test>:<userdir>` 사용.
각 spec의 상수 userdir 우선. 새 Main 검사도 모두 EXODUSER-P2006B-*-Isolated-20261020 격리.
새 A 에셋 import1회 exit0·stderr0(`import.out.log/err.log`).

| 검사 | 결과 | 로그 폴더 |
|---|---|---|
| test_p2006b_lmb | 6/0, ERROR0; kiSlash→weapon idle→공격→idle→원 선택 복원 | lmb-baseline(b933 기준) |
| test_p2006a_world_drops | 18/0, 종료 resource4/ObjectDB8 누수 별도 | prerequisite-regression(A 선행 반영 뒤) |
| test_p2006a_pickup_contract | 17/0, ERROR0 | prerequisite-regression |
| test_p2002a_hud | 36/0, ERROR0 | prerequisite-regression |
| test_p2005a_start_skills | 27/0, ERROR0 | prerequisite-regression |
| test_p2006b_drop_render RED | 1/1, 실제 filter0(부모상속), 기대NEAREST1 | render-red |
| test_p2006b_drop_render GREEN | 1/0, 실제 filter1 | render-green |

위 검사는 서로 다른 변경 경계의 결과이며 단일 최종 빌드 전체 PASS로 합산하지 않는다.
Camera2D 경고는 잔존한다. 종료 누수는 숨기거나 제품 피해·오디오 경로를 바꾸지 않고 QA-002 연계 잔여로 기록한다.

### 실제 렌더 캡처·픽셀 근거

- 명령: `node .../_out/P2-006b-pc/run-drops-visual.cjs` → 지정 엔진 `--path <worktree>/godot --resolution 1920x1080 --position 0,0 --script res://tests/visual_p2006b_drops.gd`.
- `visual-drops-final/observations.json`: 실제 public request_attack 7회, 자연 드랍 **일반 불꽃 바지**, 강제 피해/드랍RNG0. 위치·방향·공격 선택 테스트 개입16회이므로 정상 무개입 플레이 인수 아님.
- 121 물리틱 + 추가48 렌더프레임 후 blood_anims/di/impacts/hit_vfx/gore/corpses 모두0. 영구/장기 stain1은 지우지 않았다. 화면 실제 앵커 **(1028.6985,539.3125)**.
- `comparison-final/crops/native-natural-afterfx-0-{native,web}-1x.png`: 원본 viewport에서 좌상단(964,359), **112×208**, 리사이즈0. 별도 `natural-native-left-web-right-1x.png`는 두 크롭을 그대로 나란히 배치. 원본 일반 장비 모양이 사망 애니메이션 없이 판독됨.
- `rarities-native-top-web-bottom-1x.png`: 6등급 열, Native 위/Web 아래. 동일 자연 아이템 복제의 rarity만0~5로 바꾼 **명시 preview fixture6개**이며 자연 고등급 드랍 증거가 아님. 각각 실제 화면 앵커에서112×208 크롭, 3시점 개별 PNG 보존.
- 웹 비교: `web-compare.cjs`의 격리 Chromium1920×1080·DPR1. 모든 요청을 본 worktree 파일로 route.fulfill하여 서버 요청0. 원본 테스트 부팅 후 같은 item/x/y·카메라·시간을 투영; 컷신 canvas 숨김·빈 전투 배열은 테스트 설정이다. 동일 자연 웹 처치·전체 장면 픽셀 일치를 주장하지 않는다. pageerror0.
- 일반은 양쪽 빔영역 색픽셀0. 고급~유니크의 빔 색/형태는 대응하나 Native가 더 어둡다. 동일 probe(크롭 내 x56,y20,w17,h125, chroma>25) 평균RGB: 등급1 **64.48/73.54**, 등급4 **72.74/83.34**, 등급5 **54.91/64.31**(Native/Web). 배경·후처리 포함값이지 독립 빔 알파·원인 확정치가 아니다. 원본 alpha를 임의 증폭하지 않았다.
- `visual-lmb` GPU viewport와 `crops/native-*-1x.png`: 실제 icon rect(946.5,963.7,27.9,35.1), 크롭(943,960,36,44). 웹 슬롯 실제rect(943.8,994.2,33.3,40.5), 원배율35×42. kiSlash는 양쪽 그림 존재·weapon은 양쪽 빈 칸. HUD 폰트·세로 좌표 차이는 별도 미완.
- Native Computer Use가 자기 창을 식별했지만 **“Computer Use was not approved to use 2-stable_win64”**로 거부했다. 우회하지 않았으며 산출물은 실제 AMD GPU 창의 viewport readback이지 OS 창 캡처가 아니다. 수동 R 검수 미확인. 자기 검수 프로세스는 정상 종료했다.

최초 visual-drops(121틱만)와 visual-drops-afterfx(필터 수정 전), RED 로그를 덮어쓰지 않고 보존했다.

## ④ 커밋·원격

B 구현·보고 커밋은 이 문서 작성 뒤 확정하여 최종 응답으로 전달한다. 선행 복구점은 dba6931eb.
원격 main 시작 관측 b933b2da5, 종료 전 재조회19a713578(타 팀 문서 반영). 두 tree 모두 A 모듈 부재를 확인했으며 어느 main ref에도 쓰지 않았다. 자기 브랜치만 push한다. main/PC/Mac 전체 동기화 완료 아님.

## ⑤ 남은 것·총괄 인계

- **RETOUCH**: 전체 장면의 밝기·안개·그림자/blur 동등성, HUD 기준 좌표·폰트 차이. 밝기 보정을 드랍 alpha에 곱하는 가짜 수정은 하지 않았다. 표시 담당·조명/HUD 담당과 후속 원인 분리가 필요하다.
- 그림자 원본 .9/blur6과 A 근사 .55/오프셋의 차이를 보존한다. 원본 미지원 효과를 구현 완료로 보고하지 않는다.
- OS 창 캡처·수동 R·양쪽 자연 처치의 완전히 동일한 장면은 미검증. 원본 범위의 라벨 없음·일반 무빔을 유지한다.
- A 유골 습득·인벤 창·정렬·영구저장 미이식은 그대로다. QA-002는 종료 누수 후속 소유자이며 이 작업이 해결했다고 주장하지 않는다.
- 총괄은 A 구현이 빠진 원격 main의 정상 인수를 별도로 확인해야 한다. 이 브랜치의 A 선행분과 B 1줄을 구분하여 검수·통합한다.
