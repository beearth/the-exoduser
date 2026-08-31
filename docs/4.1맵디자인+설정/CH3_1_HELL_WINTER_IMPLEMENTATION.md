# CH3-1 핏빛 황폐지 — HELL WINTER 구현 SSOT

> 구현 기준: `game.html` 내부 stage `si10` / 2026-08-30 CH3-1 CENTRAL DETAIL PASS
> 장 공개명: **3장 — 지옥의 겨울 (HELL WINTER)**
> 에리어명: **3-1 핏빛 황폐지**
> canonical visual reference: `C:\Users\심도진\Downloads\ChatGPT Image 2026년 8월 29일 오전 10_34_43.png`
> 내부 `hell=2`, `ch3`, `3장_얼음굴` 문자열은 에셋·음원 경로 호환용 레거시 식별자이며 공개 세계명으로 사용하지 않는다.

## 1. 시각 정체성

CH3-1은 얼음굴·설원·아름다운 겨울 판타지가 아니다. 검은 동토, 불투명한 죽은 얼음, 재, 검은 진흙, 얼어붙은 피, 고딕 요새, 처형대, 감옥, 전쟁 시체가 남은 **open-air hell wasteland**다. 일부 괴물은 죽은 자세로 얼어붙고 미세한 눈빛만 남긴다.

| 계층 | 규칙 | 금지 |
|---|---|---|
| 기본색 | near-black, charcoal, dirty gray, dead blue-gray, dirty snow white | 밝은 흰 설원, cyan, turquoise, magenta |
| 포인트 | deep blood red, dark ember orange만 국소 사용 | 오로라, 마법 수정광, 넓은 화염광 |
| 조명 | 햇빛 0, 자연광 거의 0, 재·눈보라·얼음 안개 | 밝고 깨끗한 판타지 조명 |
| 장르 판독 | 혹한에 잠긴 지옥, 죽음도 끝나지 않는 전장 | 얼음굴, 일반 설원, 수정 동굴 |

## 2. 레벨 구조

| 항목 | 현재 구현값 | 적용 위치 | 설계 의도 |
|---|---:|---|---|
| 생성 방식 | `genFromTemplate` + authored `_HELLWINTER10` | `si10` | `genGauntlet`은 폴백만 유지 |
| 맵 크기 | 200×200 tile = 8000×8000px | fixed map | 수백 마리 핵앤슬래시용 야외 대전장 |
| 전장 외곽 | basin `cx=100,cy=100,rx=90,ry=88,gateW=12` | `_MAP_COMPOSE[10]` | 타원 전장과 외곽 요새 링 |
| START | `(100,185)` | 6시 | 남쪽 부서진 지옥문으로 진입 |
| START 문 | `(100,179)`, rot `180` | `m_c3wall_gate` | 동일 모듈 회전 재사용, 중앙 개방 |
| EXIT | `x=99..101,y=7` | 12시 | 상단 중앙 목표 |
| boss gate | `x=99..101,y=5` | 12시 | exit marker와 일치 |
| EXIT 요새문 | `(100,21)`, rot `0` | `m_c3wall_gate` | 동일 모듈 회전 재사용, 중앙 개방 |
| 중앙 전투 코어 | `x=68..132,y=68..132` = 64×64 tile = 2560×2560px | 중앙 | authored 충돌 프롭 0 |
| 남북 종주축 | `x=92..108,y=23..169` | 남→북 | START→중앙→EXIT 충돌 프롭 0 |
| 북문 보장 통로 | `x=88..112,y=2..35` | `_applyHellWinterNorthGate` | EXIT 주변 검은 타일 구멍 제거·25 tile 폭 보장 |
| 밀도 | CENTER LOW / MID MEDIUM / OUTER HIGH | authored policy | 중앙 60~70% 이동·회피 공간 유지 |
| 자동 배치 | `hand:1,dense:1,lm:[],mega:[]` | `_MAP_COMPOSE[10]` | scatter·자동 landmark·mega 폴백 차단 |
| source authored | 346 | `_HELLWINTER10` | 기존 340 + 중앙 비충돌 detail ring 6 |
| runtime authored | 343 | 실제 브라우저 | basin 가장자리 보정 3 제외 |
| runtime total | 344 전체맵 / 345 플레이 QA | Central Detail Pass 실측 | system object 포함 시점 차이 |

### 2.1 MASTER PLAN / REGION

| REGION | Role | Shape / Size | Density | Main Direction / Combat | Landmark / Side Mass | Ground / Transition |
|---|---|---|---|---|---|---|
| SOUTH START FORTRESS | 입장·압축 | 남측 gate wedge, 약 24×20 tile | 외곽 HIGH / passage LOW | 북진, 전투 전 framing | START gate·tower·rampart composite | ground shadow→LOWER BREACH |
| LOWER BREACH | 초기 release·TRAVEL | y150..180 부채꼴 | MEDIUM→LOW | north / north-east 선택 | SW carcass 전경·SE cage shoulder | corpse contamination→arena floor |
| MAIN RITUAL ARENA | PRIMARY COMBAT VOID | 중앙 64×64 tile, VERY WIDE | LOW | 자유 회피·수백 적 전투 | PRIMARY ritual + 저알파 detail ring 6 | 2048 macro 동토·낮은 fissure, blocker 0 |
| WEST EXECUTION SHELF | SIDE POCKET / THREAT | x20..58 비대칭 shelf | HIGH | west offset combat | execution·chain·cage cluster | frozen blood·rubble 접지 |
| EAST PRISON TRENCH | SIDE POCKET / STORY | x148..181 세로 pocket | HIGH | east offset combat | prison 2-piece cluster | corpsefield·ground shadow |
| SOUTHWEST CARCASS FIELD | LANDMARK FOREGROUND | x20..65,y132..178 넓은 wedge | HIGH edge / LOW foreground | 우회 선택 | dominant frozen carcass | corpsefield→bone/rubble mass |
| NORTHEAST DORMANT FIELD | LATE / THREAT SPACE | x136..181,y28..72 offset shelf | MEDIUM | north-west 복귀 | dormant monster | dead ice·희박한 적색 fissure |
| NORTH EXIT FORTRESS | 압축·목표 | y8..34 fortress throat | VERY HIGH side / OPEN gate | 12시 EXIT | gate shell·tower anchors | rubble front→열린 6-tile gate |

인접 REGION은 폭·밀도·landmark·ground identity 중 최소 2개가 다르다. GLOBAL route는 SOUTH→NORTH로 유지하지만 WEST/EAST side pocket과 SW/NE offset landmark가 local direction을 분산한다. stage LOCK인 중앙 직선 종주축은 보존한다.

| EMPTY SPACE | 범위 | 역할 |
|---|---|---|
| COMBAT VOID | `x68..132,y68..132` | 대규모 적·투사체·회피를 위한 중심 공간 |
| TRAVEL SPACE | `x92..108,y23..169` | START→EXIT 보장 종주축 |
| LANDMARK FOREGROUND | SW carcass·W execution·E prison 전면 | 실루엣과 접근 방향 판독용 여백 |
| THREAT SPACE | fissure가 놓인 MID 원환 | 비충돌 적색 열 균열로 위험감만 부여 |
| BREATHING SPACE | LOWER BREACH·NW/SE shoulder 내부 | 고밀도 외곽과 PRIMARY 사이 시야 휴식 |

## 3. authored 오브젝트 수량

| id | 한글명 / 역할 | source 수량 | 적용 위치 | 충돌·표현 규칙 |
|---|---|---:|---|---|
| `m_c3hellritual` | 거대 고대 악마 의식진 | 1 | 중앙 `(100,100)`, scale `4.7` | alpha `.56`, 비충돌, 중앙 이동 허용 |
| `m_c3wall_i` | `WALL_I` 일자 성벽 | 36 | 4개 런×9, 8×8 tile connector step | scale 1 LOCK, rot 0/90/180/270 재사용 |
| `m_c3wall_l` | `WALL_L` 90° 코너 | 2 | 서 `(16,100)`, 동 `(184,100)` | 단일 ㄴ자 실루엣, 직선 벽 중첩 금지 |
| `m_c3wall_end` | `WALL_END` 노출 단면 | 4 | 외곽 보조 벽 종료 지점 | 한쪽 connector·한쪽 마감 cap |
| `m_c3wall_gate` | `WALL_GATE` 개방 성문 | 2 | EXIT `(100,21,0°)`, START `(100,179,180°)` | 양팔 collision, 중앙 passage 무충돌 |
| `m_c3hellback_mass` | BACK dark recess | 18 | 외곽 반경 84~89 tile | 기존 rampart 원본 저알파 overlap, 비충돌 `renderLayer=-4` |
| `m_c3helltower_shell` | 외곽 원형 skyline | 16 | 반경 약 84 tile 원주 | 기존 tower source 확대 재사용, 비충돌 `renderLayer=-2` |
| `m_c3hellrampart_shell` | MID full anchor | 8 | 8개 major anchor | 기존 rampart full source, 비충돌 `renderLayer=-2` |
| `m_c3hellrampart_mid_a/b` | MID 연결 구조 | 7 / 6 | full anchor 사이 | 같은 rampart의 좌·우 runtime crop, 비충돌 `renderLayer=-2` |
| `m_c3hellgate_shell` | 12시 원경 성문 | 1 | `(100,12)` | 기존 gate source 재사용, 비충돌 `renderLayer=-2` |
| `m_c3hellrubble_front_a/b` | FRONT 불규칙 edge | 7 / 7 | 외곽 playable edge | rampart 하단 runtime crop, 비충돌 `renderLayer=-1` |
| `m_c3hellsil_spire_a/b` | 상단 spire crest | 4 / 4 | TOP/RIGHT/SOUTH/LEFT tower anchor | 같은 rampart 상단 runtime crop, `sz=480/460`, 비충돌 `renderLayer=-1` |
| `m_c3hellsil_pillar` | 수직 pillar crest | 4 | 4면 서로 다른 높이 anchor | 같은 rampart runtime crop, `sz=500`, 비충돌 `renderLayer=-1` |
| `m_c3hellsil_rubble_a/b` | 붕괴 wall-end crest | 2 / 2 | SOUTH·side 붕괴 구간 | 같은 rampart 하단 crop, B만 mirror, `sz=430`, 비충돌 `renderLayer=-1` |
| `m_c3hellground_shadow` | GROUND TRANSITION | 16 | fortress foot 원환 | 기존 `gdark` 적층·runtime filter bake, 비충돌 `renderLayer=-11` |
| `m_obelisk` | 죽은 적색 의식 기둥 | 24 | 외곽 합성 구조·내측 링 | 적색은 작은 포인트만 |
| `m_hang_cage` | 매달린 철장·처형 잔해 | 24 | 외곽 합성 구조·포켓 | 중앙 금지 |
| `m_cage_gate` | 부서진 소형 지옥문 | 1 | 남동 | 보조 감옥 포켓 |
| `m_sword_pile` | 버려진 무기 더미 | 2 | 남서·북서 | 전쟁 잔해 |
| `m_bone_arch` | 거대 뼈 아치 | 2 | 북서·북측 프레임 | 종주축 바깥 |
| `m_c3hellcorpsefield` / `f` | 엉겨붙은 냉동 시체밭 | 합계 54 | MID·OUTER, 좌우반전·scale 변형 | 비충돌, 중앙 64×64 금지 |
| `m_c3fbones` | 얼어붙은 작은 뼈 | 13 | MID·OUTER 전쟁 잔해 | 비충돌 |
| `m_c3bones` | 작은 뼈 잔해 | 13 | MID·OUTER 전쟁 잔해 | 비충돌 |
| `m_c3deco` | 재·동토 잔해 | 13 | MID·OUTER 전쟁 잔해 | 비충돌 |
| `m_c3hellfissure` | 열 균열 | 18 | MID 원환·외곽 포인트 | 기존 얼음 균열을 runtime 적색 필터·회전 재사용, 비충돌 |
| `m_c3hellground_dark` | 검은 지면 mass | 12 | MID 원환 | 극저알파, `renderLayer=-10`, 비충돌 |
| `m_c3hellground_plate` | 죽은 얼음 plate | 12 | OUTER 원환 | 극저알파, `renderLayer=-10`, 비충돌 |
| `m_c3hellcenter_stain` | 중앙 얼어붙은 오염·유해 흔적 | 2 | `(84,94,.78,18°)`, `(116,108,.72,211°)` | 기존 `gdark`, alpha `.10`, `renderLayer=1`, runtime 무채색 filter, 비충돌 |
| `m_c3hellcenter_plate` | 중앙 죽은 얼음 파편층 | 2 | `(88,112,.68,54°)`, `(114,86,.62,227°)` | 기존 `gplates`, alpha `.055`, `renderLayer=1`, runtime 무채색 filter, 비충돌 |
| `m_c3hellcenter_vein` | 중앙 희미한 핏빛 균열 | 2 | `(89,98,.74,286°)`, `(111,102,.66,104°)` | 기존 `gcrack`, alpha `.11`, `renderLayer=1`, runtime deep-red filter+screen, 비충돌 |
| `m_c3hellcarcass` | 남서 거대 괴수 사체 | 1 | `(38,151)`, scale `2.1` | 충돌 `colW=220,colH=88`; `edgeErase=.08`; 죽은 자세 |
| `m_c3helldormant` | 눈만 살아 있는 동면 괴물 | 1 | `(160,47)`, scale `1.42` | 충돌 `colW=170,colH=96`; `edgeErase=.10`; 공격 자세 금지 |
| `m_c3hellexecution` | 서측 처형대·사슬 구조 | 1 | `(29,99)`, scale `1.62` | 충돌 `colW=165,colH=76`; `edgeErase=.03`; 동결 시체 포함 |
| `m_c3hellprison` | 동측 철제 감옥 군집 | 2 | `(166,101,1.48)`, `(174,112,.96)` | 충돌 `colW=145,colH=88`; `edgeErase=.03`; 겹쳐 하나의 앵커 |

수량 공식: 기존 `324` + final macro silhouette `4+4+4+2+2 = 16` + central detail `2+2+2 = 6` = **346**.

si10 authored에서는 legacy 충돌형 `m_c3hellrampart`·`m_c3helltower`를 사용하지 않고 같은 원본을 비충돌 shell variant로 재사용한다. 밝은 `m_c3sealbeast`, 녹색·자홍 `m_mega_ribs`, `m_c3corpse`, `m_c3p1/p1b/p2`, `m_c3tree`, `m_c3stalag`, `m_c3cage/c3cagef`는 사용하지 않는다. 다른 stage의 registry는 호환을 위해 보존한다.

## 4. 전용 에셋·바닥·대기

| id / 파일 | 용도 | size / collision |
|---|---|---|
| `prop_hellwinter_ritual.png` | 중앙 의식진 | `sz=380`, alpha `.56`, 비충돌, authored scale `4.7` |
| `prop_hellwinter_wall_atlas.png` → `srcRect [12,12,1111,1137]` | `WALL_I` 일자 모듈 | 원본 canvas `1254²`, trim offset `(95,66)`, `sz=520`, `colParts=[270×52@-45°]` |
| 같은 atlas → `srcRect [1135,12,618,1106]` | `WALL_L` 단일 90° 코너 | 원본 canvas `1254²`, trim offset `(323,75)`, `sz=420`, pivot `(0.27,0.5)` |
| 같은 atlas → `srcRect [1765,12,882,897]` | `WALL_END` 마감 모듈 | 원본 canvas `1254²`, trim offset `(182,174)`, `sz=520` |
| 같은 atlas → `srcRect [12,1161,1482,646]` | `WALL_GATE` 개방 모듈 | 원본 canvas `1536×1024`, trim offset `(20,229)`, `sz=650`, pivot `(0.5,0.36)` |
| `prop_hellwinter_carcass.png` | 거대 냉동 괴수 사체 | `sz=760`, runtime edge erase `.08`, 원본 PNG 무변경 |
| `prop_hellwinter_dormant.png` | 동면 괴물 | `sz=650`, runtime edge erase `.10`, 원본 PNG 무변경 |
| `prop_hellwinter_execution.png` | 처형대·사슬·동결 시체 | `sz=720` |
| `prop_hellwinter_prison.png` | 철제 감옥과 동결 수감자 | `sz=560` |
| `prop_hellwinter_gate.png` | START/EXIT 요새문 | `sz=820`, 비충돌 |
| `prop_hellwinter_corpsefield.png` | 낮은 냉동 시체밭 | `sz=400`, 비충돌, flip 변형 |
| `prop_hellwinter_tower.png` | 원형 외곽 skyline shell | authored `sz=1300`, 비충돌, alpha `.9` |
| `prop_hellwinter_rampart.png` full | BACK / MID anchor | `sz=1450/1100`, alpha `.52/.82`, layer `-4/-2`, 비충돌 |
| 같은 rampart → `[0,180,900,790]` / `[780,0,852,850]` | MID A/B 연결 구조 | `sz=1700`, alpha `.84/.86`, runtime crop, 비충돌 |
| 같은 rampart → `[0,540,900,430]` / `[720,470,912,500]` | FRONT A/B rubble edge | `sz=1200`, alpha `.86/.82`, runtime crop, 비충돌 |
| 같은 rampart → spire A `[20,20,820,380]` / spire B `[860,0,740,420]` | FINAL MACRO 상단 crest | `sz=480/460`, alpha `.68/.66`, 4/4개, 비충돌 |
| 같은 rampart → pillar `[360,250,300,650]` | FINAL MACRO 수직 crest | `sz=500`, alpha `.70`, 4개, 비충돌 |
| 같은 rampart → rubble `[0,540,900,430]` | FINAL MACRO 붕괴 crest A/B | `sz=430`, alpha `.62/.58`, B mirror, 각 2개, 비충돌 |
| `prop_hellwinter_gate.png` | 12시 원경 gate shell | authored `sz=980`, 비충돌, alpha `.92` |
| `prop_ice_gdark.png` / `prop_ice_gplates.png` | 검은 지면·죽은 얼음 원환 | `sz=620/500`, alpha `.055/.035`, 비충돌 |
| `prop_ice_gdark.png` shadow variant | fortress 접지층 | `sz=760`, alpha `.22`, grayscale/brightness `.26` bake, layer `-11`, 비충돌 |
| `prop_ice_gcrack.png` | 적색 열 균열 | `sz=430`, alpha `.24`, runtime 필터 bake, screen 합성 |
| `prop_ice_gdark.png` central variant | 의식진 위 오염·유해 흔적 | `sz=320`, alpha `.10`, layer `1`, grayscale/brightness `.46`, 2개, 비충돌 |
| `prop_ice_gplates.png` central variant | 의식진 위 죽은 얼음 파편 | `sz=280`, alpha `.055`, layer `1`, grayscale/brightness `.42`, 2개, 비충돌 |
| `prop_ice_gcrack.png` central variant | 의식진 안쪽 핏빛 균열 | `sz=260`, alpha `.11`, layer `1`, deep-red filter+screen, 2개, 비충돌 |
| `ground_hellwinter.png` | 전용 검은 동토·불투명 죽은 얼음 | `gt_hellwinter`, 2048px macro cache |

벽 runtime은 4개 독립 PNG를 직접 로드하지 않는다. 빌드 원본 4개를 alpha bbox로 tight crop해 `3072×2048` 단일 atlas에 패킹하고 `_drawMapObjectCrop()`의 source rectangle으로 추출한다. `sourceSize/trimOffset`으로 crop 전 pivot과 ground contact를 복원하며 동일 경로는 `_objImageByPath`에서 `Image` 1개로 공유한다.

| 계층 | 구현값 | 공식 / 적용 |
|---|---|---|
| 팔레트 | wall `#20262b`, floor `#080b0e`, accent `#7a201b` | near-black·charcoal·dirty ice·dying crimson |
| 안개 | `[42,46,52]` | 재·폭설의 무채색 안개 |
| 환경 암부 | `[7,9,12,.62]` | 자연광 없는 오버레이 |
| 바닥 | `gt_hellwinter` → `ground_hellwinter.png` | 원본 1장 + 3회 mirror soft-light 재조합, 2048px macro cache |
| 바닥 tone | `rgba(6,8,10,.49)` | 전역 흑색 source-over |
| 바닥 mark 빈도 | `hell===2 && (h&63)<=3` | 반복 carpet 방지, 64 tile hash 중 최대 4 |
| 얼어붙은 피 | fill `rgba(86,18,16,.28)` / stroke `rgba(132,28,22,.46)` / `lineWidth=2.4` | hash 회전 `0..2π`, 적색은 균열 포인트만 |
| 열 균열 sprite | `grayscale(1) sepia(1) saturate(7) hue-rotate(315deg) brightness(.72)` | GPU proxy가 CSS filter를 지원하지 않으므로 로드 시 Canvas에 bake 후 texture upload |
| 프롭 tone | `brightness(.46) contrast(1.34) saturate(.18)` | si10에만 dead blue-gray를 남긴 charcoal 처리 |

### Guideline v0.9 OUTER MASS 4-LAYER

| Layer | 구현 | 연결 규칙 | 판정 |
|---|---|---|---|
| BACK | rampart full 18, `sz=1450`, alpha `.52`, layer `-4` | 평균 반경을 stagger하고 인접 source footprint overlap | PASS |
| MID | full 8 + crop A 7 + crop B 6 + tower 16 + north gate 1 | full silhouette 노출을 8개 anchor로 제한, crop으로 접합 | PASS |
| FRONT | rubble crop A/B 각 7, layer `-1` | playable edge에만 배치, 방향 종속 source 회전 0 | PASS |
| GROUND TRANSITION | filtered `gdark` 16, layer `-11` | 구조물 foot와 동토 사이 shadow/contamination | PASS |

visual layer는 모두 비충돌이다. 기존 `CH3_HELLWINTER_V1` collision wall 44개와 완전히 분리되며 `_colObjs=101`은 retouch 전후 동일하다.

### FINAL MACRO OUTER SILHOUETTE / TONE

기존 collision ring·START/EXIT·중앙 64×64 core·남북 route는 고정하고, `prop_hellwinter_rampart.png` 한 장에서 spire 2종·pillar 1종·rubble 2종을 runtime crop했다. TOP/RIGHT/SOUTH/LEFT는 각 4개씩 총 16개를 기존 tower anchor에 겹쳐 서로 다른 silhouette family로 구성한다. 인스턴스 scale은 `.90~1.10`, crop base size는 `430~500`, alpha는 `.58~.70`으로 제한해 상단선만 깨며 cut baseline은 기존 collision wall 뒤에 숨긴다. `edgeErase`·신규 PNG·충돌·random scatter는 추가하지 않았다.

매크로 톤은 바닥 흑색 overlay `.46→.49`, 프롭 `brightness .48→.46`, `contrast 1.28→1.34`, `saturate 0→.18`로 조정해 완전 무채색 대신 죽은 청회색을 남겼다. ritual은 위치·크기·구조를 유지하고 alpha만 `.78→.56`으로 낮춰 30-enemy/telegraph보다 먼저 튀지 않게 했다.

### CENTRAL DETAIL PASS

외곽·랜드마크·ritual 위치/크기·collision은 고정하고, 중앙 카메라에서 의식진만 단독으로 반복 판독되던 부분에 기존 CH3 바닥 소스 3장으로 6개 저알파 detail ring을 추가했다. `gdark/gplates/gcrack`을 각각 2회씩 scale `.62~.78`, 서로 다른 회전으로 재사용하며 신규 PNG·crop·random scatter는 0이다. 모든 모듈은 `renderLayer=1`의 floor-only 비충돌이고 중앙에서 반경 `10~22` tile에만 놓인다. `x92..108` 남북 종주축은 배치 0, 64×64 중앙 코어의 authored collision/vertical prop도 0이다. central vein은 alpha `.11`, stain `.10`, plate `.055`로 제한해 player·적·탄막·AoE보다 먼저 튀지 않는다.

### LANDMARK EDGE CLEANUP PASS 1

SW 사체와 NE 동면괴물은 원본에 포함된 밝은 동토 바닥판이 fortress shell과 겹칠 때 스티커처럼 보였다. 신규 PNG나 원본 파괴 편집 대신 `_edgeEraseMapSprite(img,amount)`가 로드 시 alpha bbox 외곽을 smoothstep으로 한 번만 feather한다. 하단·좌우는 사체 `.08`, 동면괴물 `.10` 비율로 지우고, 상단 실루엣은 동일 폭의 25%만 적용해 뿔·사슬 형태를 보존한다. 좌표·scale·`colW/colH`·authored 수량은 변경하지 않았다. PASS 1에서는 처형대·감옥·벽에 `edgeErase`를 적용하지 않았다.

### LANDMARK EDGE CLEANUP PASS 2

서측 처형대 1개와 동측 2-piece 감옥 군집 1곳의 fortress 접합부에만 `edgeErase=.03`을 적용했다. 동일 helper를 재사용하며 하단·좌우 bbox의 최소 3%만 feather하고 상단은 그 폭의 25%만 적용한다. 처형대 `(29,99,1.62)`·감옥 `(166,101,1.48)/(174,112,.96)` 좌표와 `165×76`·`145×88` 충돌은 불변이다. 실제 카메라에서 구조 실루엣·사슬 끝·그림자 부유가 없음을 확인했으며, 이후 micro-cleanup은 중단한다.

### CH3 modular wall kit LOCK

| 계약 | 현행 값 | 검증 |
|---|---|---|
| kit id / connector | `CH3_HELLWINTER_V1` / `wallUnit=8` tile | 모든 모듈 동일 |
| 방향 | 에셋 복제 없음, 인스턴스 `rot=0/90/180/270` | 4방향 runtime 확인 |
| 직선 | `WALL_I` 9개씩 4런, 인접 중심 `Δx=8, Δy=8` | 이음점 32/32 collision 연속 |
| 코너 | `WALL_L` 단일 오브젝트 2개 | 코너 어깨 4/4 collision 연속, 두께 중첩 없음 |
| 게이트 | `WALL_GATE` 2개, 남쪽만 180° 회전 | 어깨 4/4 막힘, 중앙 passage 6/6 열림 |
| 충돌 공식 | module-local `colParts` offset·angle에 인스턴스 회전 합성, oriented rectangle 판정 | 기본 원/타원 폴백 금지 |
| 메타 전달 | loader가 `colParts`, pivot, `squareDraw`, `wallKit`, `wallUnit` 보존 | 게이트 기본 원형 충돌 회귀 테스트 포함 |

### IMAGE CROP / SLICE ASSET AUDIT

| 기존 원본 | 그대로 사용 | crop | rotation | mirror | composite | 판정 |
|---|---|---|---|---|---|---|
| `prop_hellwinter_rampart.png` | BACK·MID full로 사용 | **MID A/B·FRONT A/B·spire A/B·pillar·rubble A/B = 9개 crop** | **불가** — 강한 3/4 원근·방향광 | rubble B만 허용 | 4-layer fortress + 4-family crest | full 26 + crop 43 instance, 전부 비충돌 |
| `prop_hellwinter_gate.png` | 12시 원경 shell | 기둥·계단·spire 추출 가능 | **180° 불가** — 계단·정면 원근 역전 | 불가 | 북측 gate landmark | 비충돌 shell 1개로 재사용 |
| `prop_hellwinter_tower.png` | 원형 skyline | spike·pillar·rubble 추출 가능 | 제한적 | 좌우 대칭만 가능 | 16-tower perimeter | 비충돌 shell 16개로 재사용 |
| wall kit 빌드 원본 4개 | atlas 제작 원본 | **4개 tight crop** | 0/90/180/270 안전 | gate/L mirror 금지 | perimeter 1개 | runtime atlas 1장으로 통합 |
| `prop_hellwinter_corpsefield.png` | corpsefield 사용 | 필요 없음 | 제한적 | 허용 | 시체밭 군집 | runtime mirror 변형 사용 |
| carcass/execution/prison/dormant | 원본 PNG 유지, 4종만 runtime edge erase | 필요 없음 | 금지 | 금지 | prison 2-piece cluster | 비대칭 canonical landmark 유지; carcass `.08`, dormant `.10`, execution/prison `.03`, 충돌 불변 |
| `prop_ice_gcrack.png` | 열 균열 실루엣 | 필요 없음 | 회전 안전 | 제한적 | 적색 fissure 원환 + central vein 2 | runtime filter bake로 청색→적색 변환, 비충돌 |
| `prop_ice_gdark.png` / `prop_ice_gplates.png` | 지면 mass | 필요 없음 | 회전 안전 | 허용 | MID/OUTER density + central stain/plate 4 | 극저알파·비충돌 데칼 |

| 재사용 실측 항목 | 최종 값 | 범위 |
|---|---:|---|
| source images | 21 | si10 authored object unique image path; 전용 base ground 1장은 별도 |
| reused as-is | 15 | object source 21개 중 wall atlas·runtime-filter fissure·runtime-edge-erase 4종 제외 |
| cropped modules | 13 | WALL_I/L/END/GATE + rampart MID A/B + FRONT A/B + final crest 5종 |
| runtime crop modules | 13 types / 87 instances | wall 44 + MID 13 + FRONT 14 + silhouette crest 16 |
| rotated instances | 81 | 기존 75 + central detail 6, runtime authored `rot != 0` 전체 |
| mirrored instances | 30 runtime | `m_c3hellcorpsefieldf` 27 + `m_c3hellsil_rubble_b` 3; base macro mirror draw 3회 별도 |
| runtime filtered modules | 40 | fissure 18 + ground shadow 16 + central detail 6, 로드 시 Canvas bake |
| runtime edge-erased modules | 4 types / 5 instances | carcass `.08` + dormant `.10` + execution/prison `.03`, 로드 시 alpha bbox Canvas bake; 원본 PNG·충돌 불변 |
| composite landmarks | 8 | 기존 7 + central ritual/detail-ring composite 1 |
| truly new assets | 0 | 신규 원화 생성 없음; wall atlas는 기존 원본의 파생 빌드 산출물 |
| wall runtime Image objects | 1 | 4 id가 동일 atlas `Image` 참조 |
| wall atlas network request | 1 | standalone wall PNG 요청 0 |
| wall runtime PNG payload | `5,342,545 → 2,358,543 bytes` (`-55.8%`) | 독립 4파일 합계 대비 atlas 1파일 |

## 5. visual acceptance 결과

| 항목 | REFERENCE | ACTUAL | 최종 판정 |
|---|---|---|---|
| 전체 실루엣 | 원형에 가까운 타원 전장·연속 검은 요새 | collision diamond 바깥에 4개 비대칭 crest family가 inward/outward rhythm을 만들고 검은 요새 mass로 통합됨 | **PASS** |
| START | 6시 지옥문 | `(100,185)`, rot 180° 개방 모듈문 | PASS |
| EXIT | 12시 무너진 요새 | 25 tile 북문 통로·rot 0° 개방 모듈문 | PASS |
| 중앙 전투장 | 거대 룬·넓은 negative space·희박한 전투 흔적 | 64×64 tile 충돌/vertical prop 0·scale 4.7 룬 + 저알파 floor detail 6 | PASS |
| 시체 | 얼어붙은 학살지 | corpsefield 54 + 유해 39 + 사체·처형대·감옥 내부 시체 | PASS |
| 괴물 | 죽은 듯 정지, 눈만 생존 | NE 동면 괴물 1, 공격 자세 0 | PASS |
| 지옥 구조물 | 처형대·감옥·요새·사슬 | 서 처형대, 동 감옥, 북/남 gate, 외곽 링 | PASS |
| 밀도 | 중앙 낮음, 외곽 높음 | CENTER LOW / MID MEDIUM / OUTER HIGH | PASS |
| 색감·조명 | 흑회색·죽은 청회색, 적색 국소 | 평균광을 낮추고 dead blue-gray를 제한적으로 복원, charcoal 구조 대비와 국소 deep red만 유지 | **PASS** |
| 장르 판독 | 얼음맵이 아닌 지옥의 겨울 | open-air frozen hell battlefield | PASS |
| 주요 landmark | 중앙 ritual·남서 사체·외곽 처형/감옥/동면괴물 | 전체 축소에서도 각 앵커가 분리 판독됨 | PASS |
| 중앙 전투 가독성 | 넓은 negative space | 64×64 core blocker 0, 종주축 detail 0, 반경 10~22의 바닥 흔적 6만 저실루엣 유지 | PASS |
| 개별 asset seam | 구조와 바닥이 한 덩어리로 접합 | cleanup pass 1~2의 4종/5 instance만 최소 feather, 실루엣 절단·그림자 부유 0 | PASS |

### Production Guideline GATE 결과

| GATE | 결과 | 근거 |
|---|---|---|
| 1 MASTER PLAN | PASS | 8 REGION·GLOBAL/LOCAL route·5종 empty-space role 정의 |
| 2 LARGE OUTER MASS | PASS | LEFT/RIGHT/TOP/SOUTH 전부 BACK 18 + full MID 8 + tower 16 overlap |
| 3 MEDIUM CONNECTION | PASS | MID runtime crop A/B 13개, full silhouette anchor 8개로 제한 |
| 4 GROUND CONNECTION | PASS | rubble FRONT 14 + filtered ground shadow 16, sticker gap 완화 |
| 5 PLAYABLE / COMBAT | PASS | 중앙·종주축 blocker 0, 30-enemy combat readability 캡처 |
| 6 LANDMARK / CENTER | PASS | ritual PRIMARY + SW/W/E/NE secondary hierarchy 유지 |
| 7 SMALL DETAIL / STORY | PASS | corpsefield 54·유해 39·cage/obelisk + 중앙 floor detail 6; 중앙 collision/vertical 침범 0 |
| 8 FINAL CAMERA QA | **PASS** | Final Macro 6종 캡처와 `model_vs_runtime`에서 silhouette·density·landmark·전투 가독성·색/조명 순으로 재판정 |

## 6. runtime QA

| 검증 | 최종 결과 |
|---|---|
| TDD | `test/ch3HellWinterLayout.test.js` 28/28 PASS |
| server | `C:\nvm4w\nodejs\node.exe server.cjs`, port 3333 |
| boot / pageerror / 404 | boot 정상 / 0 / 0 |
| missing sprite | 0 |
| source / runtime authored | 346 / 343 |
| runtime total | 344 전체맵 / 345 플레이 QA (system object 포함 시점 차이) |
| collision objects | 101, retouch 전후 불변 |
| 중앙 blocker | 0 |
| `x92..108,y23..169` blocker | 0 |
| 직선 connector collision | 32/32 연속 |
| 코너·게이트 어깨 collision | 8/8 연속 |
| 북·남 gate passage | 6/6 무충돌 |
| 실제 키보드 종주 | PASS, 6개 구간 전부 성공 |
| 이동 시작 | `(100.5,185.5)`, `inWall=false`, `canMove=true` |
| 이동 종료 | `(100.5,11.50)`, `inWall=false`, `canMove=true` |
| 최대 50ms 이동량 | `43.41px < 50px` |
| 전체맵 | `captures/ch3_guideline_retouch_pass5/SI11_full.png` |
| 최초 actual | `captures/ch3_hell_winter_final/first_actual_before_canonical_landmarks.png` |
| 모델 비교 | `captures/ch3_guideline_retouch_pass5/model_vs_runtime.png` |
| 8-camera board | `captures/ch3_guideline_retouch_pass5/camera_qa_board.png` |
| 30-enemy 전투 가독성 | `captures/ch3_guideline_retouch_pass5/combat_readability.png`; player alive, center blocked false, pageerror/404 0 |
| landmark edge cleanup | `captures/ch3_cleanup_pass1/{carcass,dormant,SI11_full}.png`; edge bake 2/2, pageerror/404 0 |
| 구형/모듈 비교 | `captures/ch3_wall_atlas_final/legacy_vs_modular_wall.png` |
| 연결부 캡처 | `captures/ch3_wall_atlas_final/{west_corner,east_corner,north_gate,south_gate,northwest_straight}.png` |
| 최종 검증 보드 | `captures/ch3_wall_atlas_final/wall_validation_board.png` |
| asset audit 보드 | `captures/ch3_wall_atlas_final/asset_reuse_audit.png` |
| crop manifest | `tmp/ch3_wall_atlas_manifest.json` |
| 모듈 충돌·재사용 보고서 | `captures/ch3_wall_atlas_final/wall_runtime_report.json` |
| 이동 보고서 | `captures/ch3_hell_winter_final/CH3_SI10_walk_report.json` |
| gameplay 캡처 | `captures/ch3_hell_winter_si10_{center,start,exit,southwest,west_execution,east_prison,northwest,northeast}.png` |
| Cleanup Pass 2 근접 QA | `captures/ch3_cleanup_pass2/{execution,prison}.png` |
| Cleanup Pass 2 전체맵 | `captures/ch3_cleanup_pass2/SI11_full.png` |
| canonical 전체 비교 | `captures/ch3_cleanup_pass2/model_vs_runtime.png` |
| Final Macro 전체맵 | `captures/ch3_final_macro_retouch/SI11_full.png` |
| Final Macro canonical 비교 | `captures/ch3_final_macro_retouch/model_vs_runtime.png` |
| Final Macro 4면/중앙 | `captures/ch3_final_macro_retouch/{outer_LEFT,outer_RIGHT,outer_TOP,central_arena}.png` |
| Central Detail 전체맵/비교/플레이 카메라 | `captures/ch3_center_detail/{SI11_full,model_vs_runtime,central_arena}.png`; detail 6, collision 0, route intrusion 0, pageerror/404 0 |

최종 판정: **WALL SYSTEM PASS / GAMEPLAY PASS / SILHOUETTE PASS / REPETITION PASS / DENSITY PASS / LIGHTING PASS / COLOR PASS / CANONICAL COMPARISON PASS / CENTRAL DETAIL PASS / CH3-1 VISUAL FINAL PASS**. 첫 인상은 일반 얼음맵이 아니라 검은 철·현무암 요새가 죽은 청회색 동토 전장을 둘러싼 “얼어붙은 지옥 요새와 전장”으로 판독된다. 중앙은 6개 floor-only 흔적으로 정보량만 높였고 collision·종주축·ritual hierarchy는 유지했다. 기존 4종/5 instance seam feather는 유지했으며 `edgeErase`를 추가하지 않았다.
