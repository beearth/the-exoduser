# MAP11-30c — 캐릭터 축척·장면 접지·정적 바닥 디테일

기준 `7504d2c9355a52edede7ea24119e54dabd2d8f0a`, 자기 branch `codex/map11-30c-20261021`.
검수 원본·수치·SHA·원격 대조는 `~/exoduser-wt/_out/MAP11-30c/`에 보존한다.

## 축척 측정과 구현

측정은 웹의 실제 선택 전사 `img/exoduser_warrior/south.png`와 네이티브 `assets/player/south.png`의 동일 byte(SHA256 `d04c5a3e7831b4a349908a5f31361c39f9993e5fdccc5f792585bce8e601d467`)를 확인한 뒤 정면 idle frame0, alpha>32 bbox를 사용했다. 구형 `atlas_player.png` 폴백이나 주석의 29px을 현행 선택 스프라이트 측정값으로 대신하지 않았다. 웹 원본은 변경하지 않았다. 근거: `game.html` CHAR_LIST/`_applyMaskAtlas`/`_pScale=2`, `_drawDruidBoss`, `_druidFinaleFrame`; 외부 `measure.py`, `scale-measurements.json`.

| 기준 | 플레이어 높이 px | 보스 높이 px | 화면 높이 px | 플레이어/화면 | 보스/화면 |
|---|---:|---:|---:|---:|---:|
| 원본 정면 alpha bbox | 30 (y14..43) | 591 (y12..602, cell414×620) | — | — | — |
| 웹 근접, zoom .8 | 48 | 473.105 | 1080 | .044444 | .438060 |
| 이전 네이티브 .36, fallback2.5/보스fixture1 | 27 | 212.760 | 1080 | .025000 | .197000 |
| 이후 근접, zoom .8 | 48 | 473.105 | 1080 | .044444 | .438060 |
| 웹/이후 입장, 플레이어(0,800), 보스(0,0), zoom .563700169 | 33.822 | 333.362 | 1080 | .031317 | .308668 |

측정은 동일 source frame의 불투명 실루엣 투영값이다. UI·반투명 rim·그림자를 포함한 화면 bounding box가 아니다. 실제 Main의 idle 방향/프레임이 달라지면 불투명 높이도 달라진다. 이전 PC 보고의 약25/180px과 정면 alpha bbox의27/212.76px은 측정 기준을 구분한다.

| 계약 | 정확값·적용 위치 |
|---|---|
| 전사 표시 | product_detail setup에서 fallback sprite.scale가2.5일 때만2.0으로 맞춤. source 선택 프로필의2.0/1.3은 보존. actor.visual_scale·물리 반경·속도·공격 범위/전투상태 변경0 |
| 보스 표시 | `boss11_scene_actor.gd`: 실제 `_enemy` read-only directional idle view. cell414×620, scale=r×14.1/620, offset(-207,-533.2), facing index round(facing/TAU×8)+6 mod8. 빈 상태/비생존은 숨김. 전투 owner/HP/AI/저장 쓰기0 |
| 보스 표현 경계 | 새 view는 idle 방향 실루엣과 접지만 담당한다. 상태별 공격/변신 애니메이션을 새로 완성한 것이 아니다. 캡처는 같은 제품 view를 정지 fixture로 보여주며 실제 보스 owner를 spawn하거나 조작하지 않음 |
| 카메라 | ARENA_ZOOM .36→.8, TRANSITION_SECONDS1.0 유지, 먼거리 중심 가중 .85→.5(웹 midpoint). 근접≤1100에서 웹 `_druidFinaleFrame`의 r×14.1 높이, 폭max(r×9.3/2,height×.56), baseY−6, 좌우player±100, top min(base−height×.86−24,playerY−100), bottom max(base+height×.14,bossY+r+120,playerY+100) 사용 |
| 프레이밍 여백 | top min(100,H×.14), bottom min(155,H×.22), X min(100,W×.08), zoom clamp .3..8; locked Under/Erupt dive target±(r+140) 포함. 목표 center의 bottom/top 차를2×zoom으로 나눈 Y 보정. 기존 camera.offset owner를 보존하며 위치에서 offset을 빼 이중 적용 방지 |
| 공간·BOSS11 예고 | 배경 SOURCE_SCALE2.6666666667, FLOOR_EXTENT10922.6667, source .6 지면 투영, R1700·7외곽충돌원/반경90 보존. telegraph 원/부채꼴/띠는 기존 source world 수치 유지, 카메라만 함께 확대. slam1000+phase×80, slash r+player_r+300, sweep+400, spin500, grab+200, dive r+120, jump300 변경0 |

카메라를 당겨 화면의 world 범위가 좁아진다. 전체 원화를 한 화면에 모두 담는 .36 overview와 실제 전투 카메라를 동일 구도라고 주장하지 않는다. 목표 전체와 제품 입장을 나란히 보존하고 움직임 검수는 별도 .36 overview로 수행한다.

## 접지·색·바닥

| 층 | 계약 |
|---|---|
| 공유 캐릭터 shader | 기존 actor_rim 공유1개 유지. ambient_tint=(.89,.77,.81), 붉은 rim=(.62,.20,.22,.36). source alpha와 기존 vertex tint 보존, 내부 silhouette edge fwidth×1.35/기존smoothstep 유지. 캐릭터별 매틱 material 생성0 |
| 접지 | analytic128² RGBA `actor_contact.png`: RGB(24,10,19), alpha round(135×max(0,1−r²)²). 전사scale(.34,.13), source 정면 발높이20×sprite.scale.y; 일반 enemy(1.1,.42)/Y2. 보스scale(1.65,.48)/Y70. setup CanvasItemMaterial unshaded, actor 자식이라 이동 동반 |
| 디테일 원본 | 기존 `ritual_root_cracks.png` 및 기존 `prop_ice_gcrack.png`만 사용. 새 이미지 생성0. median5로 고립 픽셀을 억제한 뒤 연속 균열 alpha 보존. 원화 팔레트 #301c29..#895159 / #321b28..#88525a, alpha×.42/.32 |
| 배치 | 기존3600world 크랙을4096 floor의1350²에 대응, 픽셀(1373,1328). 안쪽3연결 fissure230×120, 원본 중심(1880,1930)/(2050,2100)/(1800,2150), 회전18/134/280도. scatter·랜덤·점/디더링/노이즈 생성0 |
| 합성 | `floor_detail.png`는 정적source 기록, `floor_30c.png`는 기존floor4096²에 정적 source-over 합성한 실제 입력. 기존floor.png 보존. runtime sampler/draw 추가0. 재현 `godot/tools/map11_30c_detail.py`(Pillow) |
| 살아 있는 층 | 기존 pod 국소UV .006/.16Hz, 입UV .018 및 sin(.55Hz)≥.72의2자세, vein .065/.16Hz, perimeter mist shader, 전경parallax .08 코드/texture 보존. 새 floor에는 이 움직임을 bake하지 않음. 정지 카메라에서는 전경시차가 정지하는 것이 정상 |
| 틱 경계 | 새 source boss reader/camera는 cached references와 source Dictionary 참조만 사용. 빈dictionary는 setup 캐시. 틱 목록 API/ResourceLoader/3D 로딩0. static source recolour·texture import는 오프라인 |

## 단회 기술 검사·성능

| 검사(각1회) | 결과 |
|---|---|
| test_map11_30b | 34/34 PASS |
| test_map11_arena_preview | 35/35 PASS |
| test_boss11_02_visual | 17/18 PASS, 이전 zoom midpoint .49 고정 기대1건FAIL. 기대식을(.7+Camera.ARENA_ZOOM)/2로 갱신, 사용자 단회 규칙에 따라 재실행0 |
| test_boss11_03_visual | 18/18 PASS, 공유 예고/카메라 진입·퇴장·offset 보존 |
| test_boss_ch1_bc08_movement | 24788 assertions/0fail,1477source cases/7791events/750RNG/152protected requests. 역사적 승인 원본1b901f12 game SHA4d911c…를 독립oracle에 전달; 현재game SHA189899…와 구분. 전투코어 변경0 |
| 성능1회 | **p95 7.738ms ≤8.33ms PASS**, p99 9.648ms, focus_lost0, validtrue,102draw/211objects |
| 측정범위 | Apple M5 Pro, Godot4.7.2 GL Compatibility,1920×1080,vsync off/max240. 실제 Player 입력600틱,관측611틱/보행1662.715px. presentation arena/authoritative product_space=field. 자연보스전·밀집전투·PC 실행 성능이 아님 |
| 변경 후 경계 | 성능 이후 보스 방향 index의+6 source remap만 보정(측정에서는 dormant여서 해당분기 미실행). 성능 재측정0. BOSS02 기대식 수정도 제품 성능과 독립 |

## 운영·인수 경계

지정 `--no-checkout` worktree/sparse set/read-tree, 최초 tracked INDEX/WORK clean 확인. R에서 시작 fetch를 실행해 FETCH_HEAD/객체 메타데이터 쓰기가 있었다. **엄격한 R 읽기전용 지시는 완전 준수하지 못했다**. R tracked WORK/INDEX/HEAD/branch 수정0이며 이후 모든 작업은 지정 worktree에서 수행했다. 인증/강제옵션/서버재시작/main push/Steam배포0.
격리 `EXODUSER-MAP11-30b-Isolated`와 각 테스트 지정 격리dir만 사용. 실제 저장 `EXODUSER-Godot-Native-First` 접근0. project.godot은 최종 원본 byte 복원. PID81277 조작0. 각 실행 전 슬롯 확인, GUI 래퍼는 동시3번째 Godot 진입 시 자기 실행만 중단하도록 감시. 최종 자기경로 stage/정상hook/비강제 push/원격 SHA 읽기 대조 후 worktree 제거; 결과는 DONE.txt.

## MAP PRODUCTION REPORT

STAGE: CH1-1 MAP11-30c.
MASTER: 기존 남START/북EXIT·R1700 combat void·region·side route 보존.
OUTER MASS: LEFT/RIGHT입나무,TOP고목/pod,SOUTH전경의 기존source·world배율 보존; 신규hole 없음.
LARGE: 기존원화/7crop/정적underlay; 새생성0, overlap/feather 변경0.
MEDIUM: 기존root/contact 연결 유지; 캐릭터 접지 추가.
GROUND: 팔레트 보정한 기존 연속균열 정적합성, 살아 있는 vein/pod/mouth/fog 별도 유지.
PLAYABLE: 이동/충돌/사거리/R1700/패턴range 보존, 카메라만 world와 함께 확대; 실제 Player 보행 단회. 자연보스전/공격애니메이션 완성 검수아님.
LANDMARK: source boss 방향 idle/입나무/teeth 유지, 캐릭터 접지·ambient/rim 통합.
CAMERA QA: START/ARENA 제품1920×1080, 근접거리(100,110), 무확대floor/mouth/actors crop, 움직임0/2초 overview. FIELD EARLY/SIDE L/R/LATE/EXIT 신규검수미실시.
TECH QA: 위 단회검사/성능, native pageerror/404 N/A. 기존 clone/feather/화면foot 대 충돌foot 차이 보존.
FILES: 자기 camera/scene/detail/rim/idle boss view/floor_30c/detail tool/capture harness/기대값/관련docs. 타팀/전투core변경0.
GIT: DONE.txt의SHA/원격읽기대조/제거결과 참조.
VISUAL VERDICT: 최종 캡처 검수 표 참조.
NEXT PASS: 자연보스전에서 공격 pose·표시foot/충돌foot·전투 가독성 확인. 기존 feather/clone은 별도 잔여.

## 캡처 확인·누적 차이표

`captures/compare_target_vs_game.png`는 목표 전체|실제Main 전투 입장(zoom .563700169), `near_melee.png`는 플레이어(100,110)/보스idle fixture 근접거리다. `floor_center_1x.png`, `mouth_tree_1x.png`, `player_boss_1x.png`, `compare_1x.png`는 확대 없는 원본 픽셀 크롭이다.

최초 Main 부모 정지 하니스의0/2초에서는 일부 region 변화가0이어서 움직임 근거로 채택하지 않았다. 제품 뷰 단독 실행에서 양쪽 pod/mouth/fog 변화를 확인한 뒤, **부모를 정지하지 않은 실제 Main**의0/2초를 다시 캡처해 `captures/motion_0s_2s.png`에 채택했다. `live_motion/motion-receipt.json`에7sprite visible=true·material·world foot·depth/실제 행렬을 보존했다. 이 검수는 성능 재측정이 아니다. 전경은 정지 카메라이므로0/2초에서 시차 정지가 정상이며 기존 .08 카메라 변위 공식은 그대로 남아 있다. 별도 독립 제품뷰 진단은 `motion-diagnostic/`, 중단된 캡처 로그도 삭제하지 않았다.

| 항목 | 이번 결과 | 잔여·판정 |
|---|---|---|
| 캐릭터 축척 | 같은 source alpha 기준 웹과 동일한 정면 player:boss:screen 비율, 입장33.822:333.362:1080/근접48:473.105:1080 | 캐릭터·전투 세계 수치 변경 없이 표시/카메라 대응. 자연보스전 동적 가독성은 별도 인수 필요 |
| 접지·조명 | player/boss soft ellipse, 공유 ambient/red rim | 기존 product_lighting이 arena 진입 때 white rim으로 덮던 uniform도 red(.62,.20,.22,.36)로 수정. 원본 sprite의 고유 픽셀·질감은 보존 |
| 바닥 1x | 원화 팔레트의 기존 연결 균열을 정적 floor에 추가, 점/디더링 생성0 | 원화 자체의 부드러운 조직 결까지 고해상도 원화로 복원한 것은 아님. 근접 큰 확대에서는 부드러움이 남아 **RETOUCH** |
| 움직임 | 실제 Main live0/2초, 독립 제품뷰의 움직임 변화 확인 | 정적 bake가 효과의 유일한 입력이 되지 않음. 기존 입은 source UV2자세이며 새로 그린 입속 프레임이 아님 |
| 장면 | 같은 source 질량·팔레트·R1700 보존, 카메라 당김 | 전투 카메라는 원화 전체보다 좁은 영역을 봄. overview의 기존 clone/직선 접합이 보일 수 있어 전체환경 완성 PASS는 아님 |
| 성능 | 유효1회p95 7.738/focus_lost0 | 이후 dormant boss 방향+6,진입rim uniform,locked state 문자열 비교식 정리만 추가. 최종byte 전체의 새 성능 표본은 사용자1회규칙에 따라 만들지 않음 |

원격30p는 인수 후 조회 시 `e8756a95…`로 전진했다. 이번 parent는 사용자 지정 `7504d2c9…`로 고정하며 새 원격30p를 임의 통합/덮어쓰기하지 않았다. 새30c ref의 사전조회는 없음(신규). 자기branch만 정상push한다.

**VISUAL VERDICT: RETOUCH.** 축척 대응·캐릭터 접지·정적 디테일·살아 있는 효과의 검수 산출물을 제출한다. 남은 원화 부드러움/기존 overview 접합/자연 전투 인수까지 완료했다고 주장하지 않는다.

실제Main live0/2초 ROI 평균RGB차(/255): west pod5.85317,west mouth.44110,east pod3.35903,east mouth.35908,vein.73082. 이는 움직임 존재 근거이며 전경의 미소 차이를 parallax 이동 근거로 사용하지 않는다. 원본은 motion-diff.json/PNG에 보존. 최종1x 눈검수에서 새 점/디더링 추가는 보이지 않았고 원화의 부드러운 결은 잔여로 남겼다.
