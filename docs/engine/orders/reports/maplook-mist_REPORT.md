# MAPLOOK-MIST — 화면 비교 자료 준비

작업ID `maplook-mist`, 브랜치 `codex/maplook-mist-mac-20261020`. 상태는 **화면 비교 자료 준비**이며 최종 디자인 승인이나 맵 전체 품질 승인을 뜻하지 않는다. 낮은 월드 안개 2층·실제 PointLight2D 착색·실창 비교·기본 OFF 회귀 대조 자료를 제출한다.

## 기준·소유 범위

- fetch 후 origin/main `ad497089c7955d3e344e1488e5286e9b0ddd9092`에서 `worktree add --no-checkout` → sparse-checkout으로 godot/docs/CLAUDE/AGENTS/훅 등 필요한 경로만 받았다. 폰트 회귀에 필요한 game.html도 이후 원본 그대로 추가했다.
- 선행 판독: `MAP_LOOK_GODOT_PASS1_20261020.md`, native_map_look.gd의 MODULES/install 계약, CLAUDE.md의 작업물 퀄리티·디자인, UI Foundation/Composition, 맵 제작 가이드 v0.9 전체·맵디테일 현행.
- 제품은 신규 `godot/scripts/maplook/ground_mist.gd`와 `godot/assets/vfx/maplook_ground_mist.gdshader` 및 자기 UID만. 신규 계약 테스트·실창 캡처 테스트(각 UID), 본 보고서와 CHANGELOG_SYNC 절을 더한다.
- main.gd/native_map_look.gd/world.gd/native_screen_lighting.gd/data/map_look_ch1.json·다른 담당 파일 변경0. 기존 노드의 texture/material/visible/z 변경0. 기존 native_map_look의 자동 MODULES 발견으로 ON 때만 설치된다.
- R `/Users/fordeargamers/Projects/exoduser-migration-20261001`의 HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`·브랜치·tracked INDEX/WORK 보존. main push·force·add -A·훅 우회0.

## 구현·수치

| 항목 | 현재 계약/설계 |
|---|---|
| API | static install(world: Node2D, map_data: Dictionary, player: Node2D) -> Node2D, get_snapshot(). world 자식 MaplookGroundMist. 같은 자기 노드 재설치는 재사용해 안개 누적0 |
| 두 층 | LowFolds / UpperWisps. opacity .12/.07, 시차 .025/.065, noise scale .0032/.0045, flow (5,-1.2)/(-3.2,1.4) world px/s |
| 높이·가독성 | 자기 z=-2300/-1800, 바닥 청크(-3000) 위·액터/소품 아래. 기존 z 변경0. 중앙에 별도 전면 안개를 얹지 않음 |
| 월드 부착 | 고정 월드 청크·world 좌표 noise/mask. 카메라가 움직여도 mesh anchor는 그대로이며 두 noise phase에만 다른 시차를 적용. SCREEN_UV/screen texture/CanvasLayer 사용0 |
| 밀도 | 경계에서80→620px로 옅어짐. 중심 기본 .02, 외곽 최대 .78. m_ctree*·m_c1tree 밑동100→420px에 최대 .65. 경계/나무 실제 map_data를 읽기만 함 |
| 절차 mask | 경계 타일좌표×tile_size, props는 원본 world pixel 위치. bounds margin512, R8 96×96=9216bytes. PNG/AI 새 자산0, 메모리에서만 생성 |
| 광원 수신 | 자기 MeshInstance2D.light_mask=1, 기본 shaded canvas shader의 light()에서 실제 LIGHT_COLOR·LIGHT_ENERGY·광원 texture를 받아 .8 scattering. 가짜 조명 근접 RGB 계산이나 추가 광원0 |
| 청크 | 최대1024px 청크로 분할해 먼 광원이 한 거대 receiver에 모두 붙는 것을 피함. 현재 CH1은2층/144 quads/공유 material2·mask1, 자기 총 노드147. 뷰 밖 청크는 엔진 culling |
| 공유 RNG | 자기 RandomNumberGenerator, seed20261020으로 층 위상만 생성. 설치/갱신에 공유 RNG 사용0. GPU noise는 절차 hash이며 공유 gameplay RNG와 무관 |
| 화면 안개와 합성 | NativeFog2D/NativeFogGL·환경광·비네트는 읽거나 변경하지 않음. 추가 alpha 설계 상한: 경계 .14308944, 중앙 .00379664(각 noise 최대1일 때, 8bit mask 양자화 약0.00007 이내 오차 별도). 실제 noise는 더 옅음 |
| 수명/실패 | world와 함께 자기 자식 해제. 잘못된/퇴화 boundary·tile은 설치 거부, 실제 State/충돌/스폰/입력/저장 접근0. 동적 맵 교체/다른 장 미검수 |

이 숫자는 새 표시 전용 아트 튜닝이며 원본 게임 수치라고 주장하지 않는다. CanvasItem의 실제 light 함수는 [Godot 공식 shader 문서](https://docs.godotengine.org/en/stable/tutorials/shaders/shader_reference/canvas_item_shader.html)를 확인했고, 실제 광원 착색은 아래 별도 렌더 fixture로 검증했다. get_snapshot은 레이어/청크·seed·mask hash·경계/숲 앵커 수·opacity/시차/z·이론 alpha·screen_overlay_modified=false를 반환한다.

## 실창 화면 자료 — 원본 경로

최종 경로: `~/exoduser-wt/_out/maplook-mist/visual-final/`. macOS 실제 창 renderer, 1920×1080 viewport. Main 메타 native_map_look="on". **양쪽 모두 맵 룩 ON·기존 화면 안개 ON**, 자기 mist.visible만 바꾼 전후다. 720×540 crop을 확대/축소 없이 나란히 놓아 비교 이미지1440×540을 만들었다. before는 왼쪽, after는 오른쪽.

| 장면 | 전체 before / after | 1x crop·나란히 비교 | 직접 본 범위 |
|---|---|---|---|
| START (4020,7420) | start_before.png / start_after.png | start_crop_before_1x.png / start_crop_after_1x.png / start_comparison_1x.png | 중앙 바닥 무늬·플레이어 윤곽을 유지, 경계 쪽 낮은 안개 |
| CAMP (1900,4180) | camp_before.png / camp_after.png | camp_crop_before_1x.png / camp_crop_after_1x.png / camp_comparison_1x.png | 따뜻한 모닥불 영역·주변 숲 가장자리, 바닥을 덮는 흰 막 없음 |
| FOREST (1800,2200) | forest_before.png / forest_after.png | forest_crop_before_1x.png / forest_crop_after_1x.png / forest_comparison_1x.png | 고치·부패 숲 가장자리와 중앙 대비·플레이어 판독 |
| ATTACK 추가 | attack_before.png / attack_after.png | attack_crop_before_1x.png / attack_crop_after_1x.png / attack_comparison_1x.png | 실제 request_attack 승인 후8 physics frame의 swing/recover. 기검참 밝은 날·붉은 망토 판독 |

capture_report.json에 실제 player_screen=(960,540) 네 장면을 단정해 잘못된 카메라 위치 자료를 거절한다. Main의 pose/CPU clock을 멈추고 camera smoothing/interpolation을 꺼서 비교했다. **기존 shader TIME을 전역 정지하는 API는 이 엔진에서 없어서 배경 셰이더의 미세한 시간차까지 bitwise 동일하다고 주장하지 않는다.** 자기 안개는 별도 visual_time 고정. 이 캡처는 실제 Main 렌더를 쓰는 표시 fixture이며 정상 플레이·밀집 적/투사체 전투 전 과정의 증거는 아니다. 컴퓨터 제어의 Godot UI 접근은 도구에서 허용되지 않아 사용하지 않았고, Godot 자체 실제 창 renderer의 viewport 이미지를 사용했다.

### 핵심: 안개 자체가 빛을 받는지 검증

같은 실창 프로세스의 512×512 SubViewport에 **안개만** lit geometry로 넣었다(밑에 빛 받는 바닥 없음). 실제 PointLight2D의 색/위치만 바꾼 probe_unlit.png / probe_warm.png / probe_cool.png / probe_far.png를 저장했다. 중앙192² 영역을2px 간격으로 읽은 평균 RGB 변화:

| 조건 | RGB delta 또는 오차 | 판정 |
|---|---|---|
| 붉은 PointLight2D | (.03875585, .00747678, .00191158) | R 증가, R>B×1.5 |
| 푸른 PointLight2D | (.00026052, .00747678, .04640580) | B 증가, B>R×1.5 |
| 같은 광원을2000px 이동 | unlit 평균과 오차0 | 근접 착색이 사라짐 |

Main 전후 image 차이만으로 광원 반응을 판정하지 않는다. 이 probe는 조명된 바닥 뒤에 반투명 막을 놓은 가짜 fog나 screen tint를 통과시키지 않는다. 자체 shader를 임시 unshaded로 바꾸면18검사 중 색상 검사2개가 실패(exit1), ERROR/ObjectDB/resource0이었다. 원로그 negative-lit-summary.json과 검수 shader 원복 byte 일치를 보존했다.

## 자동 검사·기본 OFF 회귀 대조

신규 test_maplook_ground_mist: **73/0**, headless verbose ERROR/ObjectDB/resource0. 입력 map deep snapshot·기존 Sprite texture/material/visible/z·공유 RNG·경계/숲 밀도·2층/시차·고정 월드 anchor·seed mask 반복·재설치/퇴화 거부·실제 Main 기본 OFF 미설치/기존 lightmap 유지·ON 자동 설치·기존 screen fog 유지·map 불변을 검사한다.

기존 test_map_look: **16/0**, verbose ERROR/ObjectDB/resource0. 최종 실창 capture 테스트: **18/0**, exit0·ERROR/ObjectDB/resource0. Camera2D interpolation 기존 WARNING1은 각 Main 실행 원문에 보존했다. import exit0/ERROR0, 성능 PASS 횟수에 합산하지 않는다.

기본 OFF 대조는 자기 GD/shader/UID4개를 원로그에 임시 보관해 **파일 자체가 없는 부모 기준**을 실행한 다음 byte 그대로 복원해 같은 기존 회귀를 실행했다. 각 파일의 USERDIR/ISOLATED_DIRECTORY 상수·전체 그룹을 사용했다. 테스트 수정/조건 축소/skip0. 아래는 game.html 경로를 보완한 최종 수치다.

| 기존 전체 회귀 | 기준 → 신규 파일 있는 OFF 검사/실패 | 종료 판정/보존 사항 |
|---|---|---|
| contracts | 5그룹/0 → 5그룹/0 | 양쪽 ERROR0/ObjectDB0/resource0 |
| p2003a lighting | 10/0 → 10/0 | headless 원래10검사, 양쪽 ERROR0/ObjectDB0/resource0 |
| p2002a HUD | 36/0 → 36/0 | ERROR/resource0. MP3/PlaybackMP3 선재 변동: 기준2누수→신규0 |
| p2004a pets | 20/0 → 20/0 | ERROR/resource0. 같은 오디오 변동: 기준0→신규2누수 |
| p3002 spawn holes | 298/0 → 298/0 | 양쪽 ERROR/resource0, RefCounted8누수 동일 |
| native Main starter | 148/0 → 148/0 | 양쪽 ERROR0/ObjectDB0/resource0 |
| p2007a UI polish | 115/0 → 115/0 | 양쪽 exit0이나 ERROR21·ObjectDB1·개별누수66·resource18 동일. 종료 PASS 아님 |

**기능 검사 수·실패 수·exit·ERROR·resource는7개 모두 변화0**(off-comparison-final.json). stderr 전체가 byte 동일하거나 모든 회귀의 종료가 깨끗하다는 주장은 하지 않는다. HUD/pets의 MP3 변동과 UI/소환굴의 부모 기준 잔류는 수정 금지 범위로 원문만 보존했다. UI ERROR는 detached node get_path20회와 resource18 잔류 ERROR1회다. 현재 maplook 코드가 기본 OFF에서 로드·설치되지 않는 점은 신규 Main 검사로 별도 확인했다.

### 실패/기각 자료와 하니스 보완

- unit-01: import가 다른 Godot 때문에 대기 중인데 테스트를 먼저 실행해 미import texture로 Main 로딩 ERROR15·RESULT 없음. 자기 실패 프로세스만 SIGTERM(exit -15), override0. import 종료 후 unit-02가73/0. 최초 실패를 PASS에 합산하지 않는다.
- capture-01: 숫자10/0이지만 카메라 정지 후 위치 갱신이 안 된 화면이라 시각 자료로 기각했다. capture-02는 새 camera 좌표 단정3개를 실패(exit1,13검사/3실패). idle camera callback·smoothing/interpolation·scroll 갱신 후 capture-03의3장면13/0, 최종은 공격까지18/0. 앞선 그림은 visual-01/02에 그대로 보존했다.
- 처음 baseline-ui/present-ui는 sparse 목록에 game.html이 없어 양쪽115/8. 원본을 Git sparse 경로로 추가하고 최신 main object와 동일 byte/hash를 확인한 뒤 baseline-ui-source/present-ui-source는 양쪽115/0. 기존 테스트/기대값 변경0. 이전8실패를 제품 선재 결함으로 분류하지 않았다.
- 결함 주입 및 원복 로그는 별도 보존. 임시 unshaded shader를 최종 코드로 제출하지 않는다. 기존 회귀의 선재 오류/누수는 숨기거나 검사를 약화하지 않았다.

## MAP PRODUCTION REPORT

- STAGE: CH1-1 부패 숲, 표시 전용 낮은 월드 안개. GATE4 GROUND CONNECTION/카메라 검수 범위.
- MASTER: 기존 silhouette·regions·6시→12시 동선·side spaces 변경0. 새 맵 구성 없음.
- OUTER MASS: LEFT/RIGHT/TOP/SOUTH의 기존 경계53점·숲을 따른 밀도 mask만. 구조/큰 hole 자체는 변경0.
- LARGE: 새 원화·AI 생성0. 기존 bake/props/군락·중첩·반복 silhouette 변경0.
- MEDIUM: 기존 접합을 안개로 지워 숨기지 않도록 중앙 저밀도/낮은 alpha. 구조 접합 재제작 없음.
- GROUND: 광원 색을 받는 낮은2층, opaque prop/actor보다 뒤. 기존 그림자/contamination/normal/texture 변경0.
- PLAYABLE: arena/travel/breathing/threat 공간·충돌 변경0. 캡처의 캐릭터/기검참은1x 판독. 밀집 적/다색 투사체 전체 전투 미검수.
- LANDMARK: 캠프/고치/시작 공터를 비교. 새 primary/secondary/tertiary 배치0.
- CAMERA QA: START·CAMP(LANDMARK/SIDE)·FOREST(SIDE)·공격 프레임 비교. EARLY/MAIN ARENA 전체/LATE/EXIT의 정규 camera board는 이번 범위에서 미검수.
- TECH QA: map/route/collision 불변 검사, 로딩 정상, shader ERROR0, 새 외부 URL/404 경로0. 고정 world 좌표라 청크 경계 noise/mask는 연속. 통과한 실창의 정상 렌더를 확인했으나 이동 영상의 모든 seam·정식 GPU 비용/FPS 예산은 미측정.
- FILES: 자기 GD/shader·신규 테스트2개/UID·보고서·변경로그만. concurrent/unrelated/common 변경0.
- GIT: 정상 훅·자기 branch push/원격 SHA/DONE 후 자기 worktree 제거. 배포·main merge/push0.
- **VISUAL VERDICT: RETOUCH — 화면 비교 자료 준비, 총괄 디자인 검토 대기.** 자동 검사와 광원 probe는 시각 승인/PoE2·No Rest 수준 달성 선언을 대신하지 않는다.
- NEXT PASS: 총괄 화면 선택 후 필요 시 농도/속도만 조정. 밀집 전투·투사체·카메라 이동·실제 GPU 예산 검수는 별도 범위.

## 보존·인계

원로그 `~/exoduser-wt/_out/maplook-mist/`: preflight, run.py·각 실행 out/err/json/코드 snapshot, visual-final/ 전체·1x 비교·light probe, 최초 기각 자료, OFF 부모 대조/소스 경로 보완, 자체 결함 주입, AppSupport 백업/hash, 최종 제출/정리 증거. 관련 docs 검색11행을 docs-search.txt에 보존했고 기존 PASS1 문서는 참조만 했다. Godot 총25회, 매 실제 launch 직전 count1. count2 관측 때30초씩10회 대기했다. 신규 테스트는 지정 격리 이름·기존 회귀는 파일 상수를 사용하고 override는 각 finally0byte다. AppSupport Godot68파일 백업/hash 대조·기존 파일 변경0. 최종 SHA·제출·정리 정산은 DONE.txt/submission.json에서 확인한다.
