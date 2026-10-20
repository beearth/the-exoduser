> 2026-10-21 MAP11-14 현행 보충: [랜드마크·관문·제품 접합 보고](MAP11_LANDMARK_GATE_20261021.md). Main 필드는 G3/G4 RGBA로 교체, 제품zoom.70/offset(0,-180), 실제player 가림/짧은fade 연결. arena의 곡선 이중선 균열은 불규칙RGBA15fragment로 대체했다. 아래 원 검수 수치/프리뷰 상태는 해당 차수 이력이며 전체 자연전투·시각 승인 주장이 아니다.

# MAP11-07 — 1-1 필드 G1 mass·4지역 회색 blockout

> 2026-10-21 맥북총괄 G1 눈 검수: **구조 PASS(임시 승인)**. 남쪽 기상→중앙 전투면→서 큰 가시 바위/동 독액 웅덩이→북중부 시체나무+제단→보스문 흐름 인수. 큰 랜드마크 실루엣/가림은 아트 단계에서 재검수한다. 단일 외곽 띠의 깊이는 MAP11-09 BACK/MID/FRONT로 조립해 별도 G2 검수를 받는다. 아래 최초 제출 당시 RETOUCH/대기 표기는 이 승인 이전 기록이다. [G2 보고서](MAP11_OUTER_ASSEMBLY_G2_20261021.md).


STATUS=REVIEW_PENDING. **G1 공간·동선/스케일 눈 검수 대기, VISUAL VERDICT=RETOUCH**. `scenes/maps/map11/field_preview.tscn` 독립 씬이며 제품 Main/World/State/factory·PC MAP11-03 카메라에는 연결하지 않았다. 기준 최신main `0138c5bb9188d27cee10cb1a901d075092ddb88f` + MAP11-02 `6bcc483d282c44f46d328f5f683fe27df0a8dd14` merge=`8bb1ed5f87c2fa0bb087c85ef23a1567b5f1ba79`. 설계서 b085407d의 MAP11-07과 카메라8장면 표(실문서 §4.1, 사용자 지시 §3.1 지칭)를 따랐다. 원본 웹 map 좌표/타일망/베이크를 복제0, 새 hand-authored polygon이다.

**보스룸 인수 메모(기록만)**: MAP11-01c 1ec7b7f3는 사용자 판정 **방향 PASS / 공간·형태·조명 구조 임시 승인 / 아트 proof 대기**다. 남은 케이블 같은 균열, 벽가 배우 가림, 매끈한 기본면은 현재 수정하지 않았다. D03 원화 생성은 사용자 브라우저 연결 후 맥북총괄이 기존2프롬프트로 진행할 예정이며 이번 생성0이다. 본 제출은 필드 G1이며 보스룸 아트를 인수 완료로 바꾸지 않는다.

instance=`map11.field`, revision=1, localY아래+/world단위, namespace=`map11.field`, region **0 NW / 1 NE / 2 SW / 3 SE**. 바깥은region−1, 공유 경계는작은ID 우선. 필드와 `map11.arena`는 별도 context다. 다음 ID의 prefix는 모두 `map11.field.`이며 실제 Node 경로는 `Markers/{Marker}`다.

| 8장면·안정 anchor | Marker / local 위치 / role | mass·동선 검수 의도 |
|---|---|---|
| 01 START / `start` | Start / (0,3700) / player_start / region2 | 남쪽 기상터, 뒤쪽 외곽 mass와 넓은 앞 시야. 적/학습 시스템은 미연결 |
| 02 EARLY / `early` | Early / (−500,2550) / path_waypoint / region2 | 낮고 누운 줄기 proxy를 왼쪽에, 반대쪽 열린 전투면. 이 낮은 proxy는 시각 전용이며 collider로 위장0 |
| 03 MAIN ARENA / `main` | MainArena / (0,1300) / combat_center / region2 | 무장애물 원 **R1600/단축3200**, 큰 세로 구조물0. 원은 전투 여백 표시이지 원형방/벽이 아님 |
| 04 SIDE LEFT / `west` | West / (−3500,−450) / path_waypoint / region0 | 높은 마른 심재 mass, 서고리. `west_lower`(−2600,1350)↔west↔`west_upper`(−2450,−2000)로 북쪽에 재합류 |
| 05 SIDE RIGHT / `east` | East / (3800,−100) / path_waypoint / region1 | 낮은 습윤 mass·시각 전용 얕은 pool(실제 hazard0), 높이/명도/폭이 서측과 다름. `east_lower`(3000,1700)↔east↔`east_upper`(2500,−1900) |
| 06 LANDMARK / `landmark` | Landmark / (−250,−2100) / landmark / region0 | **D01 북중부 갈라진 시체나무 + 낮은 심장 제단 한 묶음**. proxy foot: tree(−250,−2700)/altar(−250,−2320), 앞 전투면 보존. 850높이 gray fork이며 최종 나무 아트 아님 |
| 07 LATE / `late` | Late / (1000,−3100) / path_waypoint / region1 | 북쪽 접근 mass의 압박·다시 확장, `landmark_east`(500,−2150)로 제단 옆을 돌아 연결 |
| 08 EXIT / `gate` | Gate / (0,−3750) / gate / region0 | 북쪽 문틀 proxy·시각 opening1000. `return`=Return(500,−3500)/gate_return/region1은 **필드 복귀 context용**, arena.entry/return과 좌표를 공유하지 않음. 실제 gate 개폐/전이/클리어 writer0 |

주요 graph는 Start→Early→Main, Main↔서고리↔Landmark와 Main↔동고리↔Landmark, Main↔Landmark, Landmark→LandmarkEast→Late→Gate 및 Late↔Return이다. **14anchor/15bidirectional route, 독립 cycle수 E−V+1=2**. 중앙 직선 통과만으로 필드 전체4지역을 순회했다고 카운트하지 않는다. kill/spawn 정책은 기존 owner 소유로 그대로 미연결이다.

| 기술·G1 검수 | 결과·제약 |
|---|---|
| 크기·폭 | 최종bounds **(−4250,−4200), 9050×8250**. 기준1920×1080/zoom.75: W2560/H1440, 약3.54W×5.73H. 초기9550폭 타원형으로 읽히는 윤곽은 동측·북서·남측 들여쓰기로 수정. MAIN 단축3200≥1.2W3072. 이동연결 시작목표.35W896 대비 서고리 y−550 단면약1768/동고리 y100 약1347, 문틀 시각opening1000. **선택 단면의 계산이며 전 구간 최소폭 보증 아님**. 전 저작 route는96반경 agent sweep으로 검증(설계용 보수 fixture, 제품 최대 enemy 반경 확정 아님) |
| 실제 기본 이동 | `player.gd:94` 기본156을 읽기 전용 기준으로 사용, r15/기존48px RGBA·visualscale2.5의 독립 CharacterBody. 최종윤곽 **49/0**: 실제 move_and_collide **12003회**, 각≤2.6=156/60 world step으로 서·동 순환/문·복귀 4지역을 통과. 거리**31178.31**, 거리/156 이론199.861s, 고정step수/60=**200.05s**. 테스트는 빠른 step replay이며 실제199초 벽시계 플레이 영상으로 주장0. 최단 저작 직행route 거리계산9027.36/156=57.868s(전투 제외) |
| compiler 재사용·회귀 | 기존 StageRecipe/공통 compiler의 anchor·solids·route/BFS·snapshot/hash·revision lifecycle를 재사용. base geometry/region 부분을 override hook으로 분리(+50/−35), revision adapter +1/−0하고 field subclass만 simple polygon/4region 분할·circle solid·LOS/연속sweep 확장. geometry같은 Resource에서 실제Physics outer segments/원형4solid 생성. 초기compiler **41/0**, 이후 윤곽 변경은 최종scene compile+실이동49/0으로 검수. Arena 기존 **54/0**, malformed schema 기존 **3/0** 각각1회·원 테스트 byte불변. 첫 preload 문법오류 ERROR3(test-01)는 보존하고 실패후 test-02만 재실행. 최종/회귀 ERROR·WARNING0 |
| occlusion | mass foot.y를z로 정렬(동률 player 우선), **최초 캐시한 15개 proxy/시각rect**만 순회. 플레이어/머리 뒤를 가리는 foreground는 전체mass+그림자alpha.15로 fade, 뒤쪽이면1로 복구. 별도 물리/LOS는 그대로. 실제 위치(−250,−3000)에서합법성·가림/복구를검사했고 10_occlusion1x도 저장. 01c의벽가문제를수정했다는주장0, 필드부터적용 |
| 캡처·눈 검수 | **01~08 8장면** 각1920×1080 + literal1x crop, 09전체윤곽/10가림QA 각동일해상도·1x 보충(총10+10). crop좌표/zoom JSON·PNG SHA manifest·BOARD.html. 기준zoom.75, Landmark는전체나무/앞공터를맞춰.66, overview.105; viewport/줌으로geometry를재생성0. 독립 검수 camera뿐이며 PC 제품 camera수정0. 실제8장면+1x 확인, gray proxy라 반복/접합/재질/최종전투 가독성은후속 |
| 120fps 예산 벤치1회 | 8주요뷰를75tick씩 도는 고정**600physics tick@60Hz/warm120**, **9.999356s/13118render/평균1311.88fps/p95≤1.84ms/p99≤2.34ms**, 평균draw19.72. M5Pro24GB/1080p/OpenGL compatibility/uncapped·vsyncOFF. **gray+독립body 기준선**이며 제품AI/탄/아트·전체게임/PC FPS 보장0. 목표8.33ms·맵CPU1.25ms/GPU3ms, 실제GPU timer없음. tick경로get_method_list/get_script_method_list/get_children/keys/경로목록생성API0; clip/triangulation/BFS/hash는준비단계에서만실행 |
| 변경·보호 | Mac소유 `stage_provider.gd`의geometry/region hook 재구성·`stage_revision_adapter.gd` field에서legacy boss metric반환거부1줄, 새field4개(source3+tres)/scene/test. **제품Main/State/World/factory/Player/hud/카메라controller/저장/game.html·원본자산0줄**, 다른담당0. Arena mw128/mh108/T40의 원본 effect extent는 유지, field를이값/옛타일격자로위장0. 필드 effect metric=ZERO→legacy요청false, 실제보스는arena provider로전환해야함 |
| 실행·인계 | 신규 EXODUSER-map11-07-Isolated-20261021, 기존2suite는파일상수 EXODUSER-map11-02-Isolated-20261021. 매Godotpgrep≥2면30초대기, override실행마다설정후0byte, 실제사용자저장0. 아트생성/서비스호출0. UI는hell/Cinzel공급자·뼈색/흑철/금헤어라인 재사용, 신규KO문구 번역대상목록에등록(제품다국어바인딩아님). 자기branch정상push/remoteSHA/DONE후자기WT제거·R불변 |

`field_recipe.tres`와 `field_provider.gd`를 compile한 뒤 기존 revision adapter로 명시 bind한다. preview의 `runtime_ready`는 실제 독립owner가 연결된 **질의 context**이며 제품 State·spawn/kill ledger/AI가 연결된 상태는 아니다. capability field_regions/polygon_boundary는 제공하지만 spawn_policy/일반flow는 제공하지 않는다. 실패하면 content_valid=false/NOT_READY, missing anchor는NOT_FOUND, owner/instance/revision 해제는 기존adapter가거부한다. 제품전이는DEMO11-37·지역ledger는DEMO11-43인수 후 연결할 사항이다.

```text
================= MAP PRODUCTION REPORT (§23) =================
STAGE: CH1-1 FIELD G1, bossroom 임시승인 뒤 첫 gray blockout
MASTER: 비대칭 polygon, 4지역, 남쪽기상→두고리→북중부D01→보스문;
        side spaces=서고리/동고리·북접근; 자유공간=주전투/이동/숨돌림 역할
OUTER MASS: LEFT/RIGHT/TOP/SOUTH=연속2단gray mass·들여쓴윤곽;
            major holes=G1구조검수대기, 최종숲아트아님
LARGE: 코드gray proxy만/아트생성0; 반복mass·기둥느낌은G2아트검수대상
MEDIUM: 연결은polygon/명시route, 제작용root/조직연결asset은아직없음
GROUND: gray4지역+전투여백/낮은시각pool; 재질·오염·환경광최종미제작
PLAYABLE: 독립기본이동·sweep/LOS/두고리/4지역·96clearance/실step49검사;
          전투가독성=아트·적·탄동시제품검수미실시
LANDMARK: D01split corpse tree+낮은heart altar 한묶음, 보조=서dry/동wet,
          tertiary=기상/보스문, 정상아트인수로승격0
CAMERA QA: START/EARLY/MAIN ARENA/SIDE LEFT/SIDE RIGHT/LANDMARK/LATE/EXIT
           8장면+전체/가림QA·1x 확인, 맥북총괄G1눈검수대기
TECH QA: route/actualphysics/coverage/occlusion/회귀 위수치;
         pageerror/404=웹사용0, seam=graypolygon, 성능=단1회gray기준선
FILES: stage-owned=map11 provider·field leaf/scene/test·관련docs/번역/CHANGELOG;
       concurrent/unrelated=0, source웹맵복제0
GIT: 경로지정stage·정상훅·자기branchpush/remoteSHA·DONE후자기WT제거;
     mainpush/force/rebase/deploy=0
VISUAL VERDICT: RETOUCH — G1공간/스케일 검수대기, 아트완료PASS아님
NEXT PASS: G1mass·두고리·D01·8뷰 시각인수 후 field아트/배치단계;
           필드State/스폰/보스문전이/실전카메라는각owner가별도인수
```
