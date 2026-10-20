# MAPLOOK-SHADOW — 화면 비교 자료 준비

작업 `maplook-shadow` / 브랜치 `codex/maplook-shadow-mac-20261020`. 이 자료는 사용자 요청에 따른 **화면 비교 자료 준비**이며 맵 룩 최종 시각 승인이나 PoE2·No Rest 목표 달성 선언이 아니다. 시작 공터에 실제 액터를 비교용으로 배치한 1920×1080 실창 검수이며 자연 전투/전체맵 검수와 구분한다.

## 기준과 경계

최초 fetch `origin/main=a00893ad9b93750d7ce70b90f5bd501b578daccb`이며 필수 기준 ad497089c의 후손임을 검사했다. 별도 의존 병합0. R=/Users/fordeargamers/Projects/exoduser-migration-20261001의 HEAD dd49171c·기존 branch·tracked INDEX/WORK를 보존한다. 새 worktree는 --no-checkout 후 godot/docs/tools/test와 필요한 root 파일만 sparse checkout했다. 원로그 L=`~/exoduser-wt/_out/maplook-shadow/`.

선행 MAP_LOOK_GODOT_PASS1_20261020.md·native_map_look.gd MODULES·CLAUDE 작업물 퀄리티·디자인 절·AGENTS/맵 제작 가이드/공통 UI 디자인 언어를 읽었다. 게임 UI/문자·원화 생성0이다. 기존 native_map_look의 선택 정책에 따라 일반 실행은 ON, SceneTree 하니스는 기본 OFF다. 새 module 경로가 기존 MODULES에 이미 있으므로 공용 연결 변경0이다.

자체 제품 경로는 `scripts/maplook/actor_contact_shadows.gd`와 `assets/vfx/maplook_actor_shadow.gdshader`(엔진 UID 포함)뿐이다. 새 테스트 `tests/test_maplook_shadow.gd`와 보고서/허용 CHANGELOG 절만 추가한다. main/native_map_look/world/native_screen_lighting/data/map_look_ch1.json 및 다른 공용 파일0줄, 원본 이미지·기존 texture/material/visible/z 변경0, gameplay map/전체 G 변경0이다. 보호 tracked3202파일은 SHA 대조0차이이며 최종 receipt에 보존한다.

## 기존 그림자 조사와 새 표현

| 기존 경로 | 확인·처리 |
| --- | --- |
| port_modules/character_clip/player_shadow.gd | 원문 player blob/ellipse 절차 표현·NW 광원 SE shift. 기본2D player.gd에는 이 노드를 설치하지 않음 |
| scripts/native_perspective_view.gd:674–735 | player_shadow geometry/blob을 ActualSourcePlayerGroundShadow MeshInstance3D로 소비. 활성 원근 snapshot ready이면 새2D 모듈 전체 표시 생략. 기존3D 노드 무수정 |
| scripts/player.gd:get_native_projection_metadata | source/display anchor·현재 frame/offset/flip/scale로 계산한 world_foot을 읽음. 이미지 투명 테두리나 actor origin으로 임의 대체하지 않음 |
| scripts/enemy.gd 및 melee/archer/tank·상속 소비자 | Sprite body/walk·체력/방어/charge 도형은 있으나 현재2D 발밑 shadow draw가 없음. 적 group 중 같은 world 하위만 관측 |
| actor 하위 기존 shadow 노드 | visible CanvasItem의 shadow 이름 또는 player_shadow script이면 새 표시 생략. 숨긴 기존 shadow는 생략 근거에서 제외. 기존 노드를 끄지 않음 |

새 module은 `static install(world: Node2D, map_data: Dictionary, player: Node2D) -> Node2D`와 `get_snapshot()`을 제공한다. 중복 install은 같은 자기 노드를 반환하고 world/player 누락은 null이다. 모든 MeshInstance2D는 자기 overlay 하위이며 기존 actor 하위로 붙이지 않는다. 절대 z=-2004로 바닥 데칼(-2005)보다 위·actor 최저(-2000)보다 아래에 둔다.

| 항목 | 표시 전용 값/동작 |
| --- | --- |
| 접지 | 기준 타원 radius24×9, 중심 alpha .42, 부드러운 smoothstep/power 소멸 |
| 투사 | NW 고정 광원의 SE 방향[13,9], 길이축 radius32/가로축9, alpha .22. contact/cast의 max union으로 겹친 중심 이중 농도 방지 |
| 색/표면 | RGB .018/.015/.025, unshaded normal alpha 합성. Quad144×88, 새 bitmap/텍스처 파일0 |
| 개체 크기 | radius/22를 .75..2.1로 clamp. source foot에서 화면 y−2 접지 bias, 월드 방향 고정 |
| 적 발 위치 | 현재 sprite region/frame의 alpha>.18, 폭2.5%/최소3pixel 이상인 마지막 행을 읽어 transparent padding 제외. frame/texture별 좌표 cache, flip/offset/scale/world transform 소비 |
| 생명주기 | group scan .2초, 위치/hidden/dead·페이드 매 frame. source body/actor alpha를 자기 node에만 소비. 죽음/숨김은 즉시 자기 표시 해제, free·그룹 이탈·다른world reparent는 자기 기록/노드 정리 |
| 상태/난수 | shared RNG/clock·시뮬레이션 writer·물리 노드0. 절차 shader는 TIME/RNG 불사용. 별도 RNG도 필요 없음 |

중복 감지는 현재 조사한 실제 owner와 명시 shadow 노드 기준이다. 이름/계약도 없이 다른 script의 custom _draw에 숨겨진 미래 그림자를 자동 의미 분석하는 보장은 없다. 적의 바닥은 현재 그림의 불투명 발 경계이며 실제 지형 높이/점프/물리 접촉을 새로 도입하지 않는다. 그림자 방향은 요청한 월드 북서광 기준으로 고정하며 개별 PointLight 위치에 따른 동적 투사는 아니다.

## 기술 검사와 OFF 보존

매 Godot 실행 전 지정 pgrep/wc를 L/process-gate.jsonl에 기록하고 2이상이면30초씩 대기했다. 타 Godot 종료0, 자기 엔진 순차 실행이다. 원 Godot4.7.2와 자기 이전 IT-05 cache를 APFS clone한 별도 캐시만 사용한다. 신규 격리 EXODUSER-maplook-shadow-Isolated-20261020, 기존 회귀는 각 파일 상수 격리명 그대로다. override는 실행마다 작성/finally0byte이며 원 project.godot0줄이다.

| L prefix | 실제 결과 | 경계 |
| --- | --- | --- |
| import | exit0·ERROR0 | 새 엔진 UID3 생성 |
| new-final |35단정/0실패, exit0·ERROR0 | 신규 headless. 이전 new도35/0, 수치 중복 합산0 |
| camera-diagnostic |41단정/0실패, exit0·ERROR0 | 최종 실제 GUI 전후·고정 바닥 GPU 검산, Apple M5 Pro/OpenGL Compatibility |
| maplook |16단정/0실패 | 기본OFF/명시ON·기존맵룩 계약 |
| contracts-final |5그룹/실패단정0 | 기본 상한240 조건 복구, exit0·stderr0 |
| lighting / hud / pets |12/0 ·36/0 ·20/0 | 각 전체 suite·SKIP0·exit0, 하니스 기본OFF |
| spawn |6그룹298/0·SKIP0 | 기존 소환굴 suite, 기본OFF |
| starter |5그룹148/0 | 실제 Main source starter, 기본OFF |
| polish-final |115/0·SKIP0·exit0 | 원문 CSS 포함 전체 UI suite. 종료 렌더/리소스 누수 ERROR20은 별도 보존 |
| polish-no-module-baseline |115/0·exit0, ERROR20 동일 | 자기 module을 L로 잠시 옮겨 같은 원본 Main/test 조건 비교 후 finally 복원. 단정그룹/실패/SKIP 동일·stderr byte동일 |

초기 contracts는 launcher의 --max-fps60 때문에 pause_capture 한 단정이 실패했다(4그룹 통과/1실패). 제품 코드를 바꾸지 않고 잘못 붙인 cap 인자를 제거한 기본 조건에서 contracts-final5/0을 얻었다. 초기 polish는 sparse에서 game.html이 빠져 원문 CSS8단정 실패(115건/8실패). 필요한 game.html만 sparse 추가해 HEAD 원문 SHA4d911cdd…와 byte동일 확인 후115/0이다. 초기 실패·명령·stderr를 삭제하거나 PASS로 치환하지 않았다.

기존 Camera2D interpolation 경고, HUD/펫 ObjectDB2와 소환굴 ObjectDB8 누수 경고는 원 stderr에 남았다. UI polish의 렌더/리소스 누수 ERROR20(그 중 stderr17)·CanvasItem RID20 경고는 모듈 없는 baseline에서도 동일하며 신규 코드가 고쳤다고 주장하지 않는다. 모든 신규 실행 SCRIPT ERROR/ERROR0, 기존 polish의 종료 누수 ERROR와 suite 단정 결과를 구분한다. 전체 전투 FPS·PC 실행/배포는 미검수다.

신규 검사는 실제 Main 기본OFF에서 NativeMapLook/새overlay가 둘 다 없음을 확인한다. 새 모듈을 직접 설치한 전후 기존 CanvasItem texture/material/visible/z/modulate 전체 목록, JSON.stringify(map_data), 전체 current G를 비교해 동일함을 검사했다. 공유 RNG seed 전후 다음 randf도 동일했다. actual player source anchor, alpha padding/flip, 움직임, 사망/숨김, dynamic add/reparent, install idempotence, 기존 visible/hidden shadow와 원근뷰 생략을 검사한다. ON에서는 기존 MODULES가 자기 경로를 자동 설치하는 것을 확인한다. OFF에서 module 실행·노드 생성0이며 기존 회귀 결과와 함께 변경 없음의 근거로 남긴다.

## 화면 비교

최종 검수 원본은 **L/camera-diagnostic/**다. 초기 camera/·camera-final/와 방향 실패 camera-audit/도 이력 그대로 보존했다. 초기 scene 비교의 단순 pixel delta는 기존 grain·펫 움직임도 포함하므로, 최종 검사에서는 이를 PASS 근거로 쓰지 않는다.

| 산출물(모두 L/camera-diagnostic/ 하위) | 크기 / 관찰 |
| --- | --- |
| full_before.png / full_after.png | 실제 viewport 각각1920×1080. ON 맵 룩을 유지한 채 새 shadow만 전후. 기존 분위기와 HUD를 덮는 큰 새 표면 없음 |
| comparison_full_left_before_right_after.png |3840×1080, 좌전/우후의 원크기 blit. 전체 맵 승인 시트가 아닌 동일 시작 공터의 국소 비교 |
| crop1_before_1x.png / crop1_after_1x.png | 각256², 플레이어 발. 발밑 타원과 SE 연장, 전투 실루엣을 덮지 않는 약한 농도 |
| crop2_before_1x.png / crop2_after_1x.png | 각256², ch1_start_eye_mass_01. 큰 몸체 아래 국소 접지. 전체 몸 너비를 덮는 검은 판을 만들지 않음 |
| crop3_before_1x.png / crop3_after_1x.png | 각256², ch1_initial_015. 작은 근접 적 발의 투명 여백 제외·약한 접지. 발과 바닥을 구분하는 정도의 변화 |
| comparison_crop1_1x_left_before_right_after.png ~ comparison_crop3_1x_left_before_right_after.png | 각각512×256, 좌전/우후·확대/축소0. 세 장 모두 직접 확인 |
| gpu_material_audit.png |256×128, 같은 실제 material을 고정 회색 바닥에서 검산하는 별도 절차 fixture. 게임 화면으로 위장하지 않음 |
| capture.json | viewport/map-look=on·기존 실제 actor10개/own shadow10개/크롭 좌표·픽셀 차이. 자연 encounter가 아닌 표시 배치임을 명시 |

접지 고정 바닥 audit은 중심 r=.298, NW/NE/SW=.498, SE=.467을 얻었다. 평평한 바닥의 접지 어두워짐/SE 방향/범위 밖 투명/접지 가장자리 fade를 각각 실제 GPU로 확인했다. 초기 camera-audit는41단정 중 방향1실패였다. QuadMesh UV.y와 2D 남쪽 +y가 반대여서 shader에서 y축만 보정했으며, 기대 방향을 바꾸지 않고 최종41/0을 얻었다. 실패 원로그·PNG와 보정 전후 파일들을 모두 보존한다. 새 표현은 정지 비교에서 약한 접지를 보탠다. 밀집 전투·걸음 중 보간·다른 광원/지형/챕터의 시각 인수는 미검수이므로 전체 목표 승인으로 승격하지 않는다.

캡처 하니스만 실제 Main을 멈추고 source actor를 시작 공터에 배치하며 spawn fade를 표시 상태로 준비했다. 제품 모듈은 actor 위치/속성 쓰기0이다. 모든 전후 이미지에서 NativeMapLook은 ON이며 새 overlay.visible만 OFF→ON이다. left=before/right=after의 비교 이미지는 viewport 픽셀을 그대로 blit한 1배율이며 이미지 생성·보정·샤프닝0이다. 기존 나무 shader의 TIME은 연속 렌더되므로 경계 밖 전체 픽셀까지 동시 프레임 동일성을 주장하지 않는다.

## MAP PRODUCTION REPORT — §23

```text
STAGE: MAPLOOK-SHADOW / 화면 비교 자료 준비
MASTER: 기존 CH1-1 경로/지역/공간 불변; 새 geometry·spawn·clear0
OUTER MASS/LARGE/MEDIUM: 기존 map look 표현을 참조만 함. 원화·소품·연결부 변경0
GROUND: actor 접지 타원+SE 부드러운 투사, 절대z -2004, 자체 node/shader만
PLAYABLE: 실제 Player/적 표시 비교. 자연 적군 전투·투사체/패링/루팅 종주 미검수
LANDMARK: 새 landmark/가림0
CAMERA QA: START 전체1920×1080+player/대형적/다른적 1x크롭3곳 전후
           다른7stage camera는 이번 actor overlay 단위에서 미실행
TECH QA: 신규/기존 실제 수치는 위 표. 브라우저 pageerror/404는 대상 외 미확인
         물리/동선 입력·G·기존 render property 보존, 성능 정식benchmark 미실행
FILES: stage-owned module/shader/UID·신규 test/UID·report, concurrent CHANGELOG 허용절
       unrelated/common code0줄
GIT: 자기 Mac branch 정상 commit/push·원격일치·DONE 뒤 자기WT/cache제거
VISUAL VERDICT: RETOUCH — 국소 접지 비교 자료. 전체 맵 목표/전투 가독성 최종 인수 아님
NEXT PASS: 총괄의 전후 화면 인수와 실제 전투 밀집/이동 환경 확인
```

자기 branch push와 원격 SHA 일치 후 L/DONE.txt·submission-receipt.json에 실제 branch/SHA/수치를 쓴다. 자기 worktree/cache를 제거하고 branch·원로그·전체/크롭/비교 이미지와 보고서 사본을 L/review에 보존한다. R 상태·실제 제거 결과는 cleanup-receipt.json에 기록한다. main push·force·git add -A·hook 우회·배포0이다.
