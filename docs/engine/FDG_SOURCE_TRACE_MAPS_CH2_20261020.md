# 2장 6에리어 원본 추적·이식 순서안 — 2026-10-20

작업 `trace-maps-ch2` / 브랜치 `codex/trace-maps-ch2-20261020`. **원본 추적·이식 설계 문서이며 제품 구현·플레이·시각 인수 완료가 아니다.** 1장과 같은 selector→generator→snapshot→순수 계약→standalone World→진행 연결 파이프라인을 사용한다. 공통 알고리즘·CH1 전용 제작 수치는 복제하지 않고 §0의 1장 문서와 결과를 참조한다. 이번 코드 수정·Godot 실행은0이다.

| 기준 | 고정 값 / 경계 |
| --- | --- |
| fetch origin/main / 분기 HEAD | e556b617190c325ca39f5add04357f5dea5ca87e |
| game.html | 65,692행 / SHA256 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4 |
| WT / 원로그 L | ~/exoduser-wt/trace-maps-ch2 / ~/exoduser-wt/_out/trace-maps-ch2/ |
| 허용 변경 | 이 문서1개 + docs/CHANGELOG_SYNC.md 최상단 절. 원본·Godot·테스트·에셋·설계 SSOT 수정0 |
| 보호 | R branch/HEAD/INDEX/작업 파일, 공용 main/world/player/hud, P2-006a, Q/E, docs/2_3, 저장 형식·사용자 데이터 |
| 관측 해석 | Node 원본 발췌 VM·Git 객체 정적 대조만. 브라우저 initStage/적·보스/충돌 종주·Godot/PC/시각/FPS는 미확인 |

## 0. 선행 문서·1장 재사용 범위

요청한 `origin/main:docs/engine/FDG_SOURCE_TRACE_MAPS_CH1_20261020.md`는 위 fetch main에 **없다**. 게시된 추적 브랜치의 동일 경로를 읽었다. CH1-04 원격 ref도 조사 시 없으므로 결과를 만들어 채우지 않는다. CH1-01~03은 main 미병합 후보이며 아래 커밋/실제 파일과 보고서 범위를 참조한다. 이번 문서 브랜치는 CH1 후보를 병합하지 않고 최신 main에서 분기했다.

| 자료·고정 원격 SHA | 실제 확인 / 재사용 |
| --- | --- |
| trace-maps-ch1 / 668cfdedf62dd4758057c4c16ea185fffa0c424f | [1장 추적 문서](https://github.com/beearth/the-exoduser/blob/668cfdedf62dd4758057c4c16ea185fffa0c424f/docs/engine/FDG_SOURCE_TRACE_MAPS_CH1_20261020.md) §1.2 공통 생성/충돌, §1.4 전환/클리어, §3 파이프라인, §4 이식 단위, §5 공용 접점 |
| CH1-01 / 677b86fa2e4afcfd7ee6e3d4ef4d7f18e7834152 | export_ch1_area_source.mjs·si0.json·순수 producer/검사. stage0 snapshot과 제품 map의 차이를 분리하는 형식 재사용 |
| CH1-02 / d0f7eaf4875ec2c2649a1e724e01a528769665cd | 보고서와 자산 동기화 도구 확인. 승인된8필드/92PNG/청크·충돌 보존, 실제 World 검증과 source snapshot 검증을 분리. CH2로 CH1 청크64/hill/나무 배치를 복사하지 않음 |
| CH1-03 / aada9b28b066cfb1c23487c6c0a8036e18fba3f7 | 실제 exporter·stage1_contract·Node 검사와 보고서 읽음. buildAreaSnapshot은0/1만 지원. 원 AST→selector→genFromTemplate→정확 START→regionInit, source SHA/행·undefined mask·NOT_OBSERVED 계약 재사용 |
| CH1-04 / 원격 미게시 | standalone World/실효 배치·충돌·렌더·전환 결과 미확인. CH1-03 보고서가 후속 대상으로 명시. 이 존재를 가정하여 CH2 runtime 완료를 선언하지 않음 |
| _MAP_SSOT_INDEX / 제작 GUIDE / REGION_CLEAR_GATE / MAP_RUNTIME_ARCHITECTURE | 최신 이력 우선, MASTER→OUTER MASS→MEDIUM→GROUND→PLAYABLE→LANDMARK→SMALL→CAMERA→TECH. 자동 검산과 시각 판정 분리. 200² 필드/4분면/별도 보스 아레나 구분 |
| 맵디테일 / 맵구성_지옥전체 / EXODUSER_MAP_BIBLE_v3 (1) | 2장6에리어 콘셉트·이름·환경 목표와 실제 selector/맵 입력 비교. 옛 에리어 크기·맵 타입을 현행 코드로 승격하지 않음 |
| docs/1전체그래픽세팅/1전체그래픽세팅_MASTER.md / 맵_화면효과_전수조사.md | 벌레굴 palette·fog/조명 공통 구조 참조. 옛 지옥명/행 번호/토치 설명과 실제 활성 gate를 구분 |
| FDG_GODOT_CUSTOM_STRATEGY_20261020.md:77~89 | 최신 사용자 결정: 맵 그림·조명·생동감은 Godot 직접 제작 가능. 충돌·동선·스폰·지역의 원본 게임플레이 계약은 유지. 표현의 픽셀 복제를 이식 완료 조건으로 새로 강요하지 않음 |

## 1. 최신 원본 행 번호 전수 추적

이 절의 G는 고정 main `game.html`, M은 `maps_data.js`다. 공통 helper 본문은 1장 §1.2/1.4를 참조하며 아래는 CH2 입력·분기·호출 경계를 빠짐없이 나눈 색인이다. `source-index.json`에 AST 함수 전체 본문·정확 시작/끝 행과 CH2 관련 발생 행을 남겼다.

### 1.1 장·에리어·지형 선택 경로

| ID | 원본 행 | 계약 / 1장과 다른 부분 |
| --- | --- | --- |
| S01 | G:16631~16711 | T40, CHAPTER_STAGES hell1/startSi4/stages6 → si4~9·floor0~5. STG 표시는 벌레굴1~6구역, monLv200, 물리(EL.P) theme. 보스는 아래6개. _FIELD_FACE는si4만, _DUNGEON_SPEC에si4~9없음 |
| S02 | G:16643~16648,3463~3477 | 기본 demo는si0 클리어 종료. query stage/mapTest/editor/QA가 실제si4 부트를 보장하지 않음. 테스트 gate와 정식 진행을 분리 |
| S03 | G:29549~29559,29762~29927; M:6~55 | STAGES mw/mh200. 개별 FIXED_MAPS[4..9] 또는 과거 grid가 있어도 기본 selector는 FIXED_MAPS[0] clone. 공통 rooms6/corridors5/features3/corridorSpawns2/hand hole9·player marker1은1장 S11 참조 |
| S04 | G:17988~18117,18196~18201 | si4에만 _CH2S4 IIFE와 compose4(hand1,dense1,lm[],mega[]) 존재. compose5~9 엔트리 없음. hand105·22점w30/authoredWidth1 경로·empty3. 아래 전수표 |
| S05 | G:29928~30007 | 기존 RLE/disk/seg 사용. _buildWalkPathRLE :29997~30007에서 authoredWidth면 w=max(18,30)=30/r15, 시작disk r+3·끝r+4. 일반 minimum70으로 넓히지 않음 |
| S06 | G:30042~30085 | 200² FIXED_MAPS[0] clone. si4는 path RLE,9개 hole은 path22점 보간/좌표clamp8..191. si5~9는 [1,40000] editor floor와 mkRng(si*7919+17) 지터/clamp18..182. 기본clone에다 CH1 polygon을 새로 덧씌우지 않음 |
| S07 | G:30135~30147,30218~30694 | plate/특수dungeon 우선검사 후 기본clone→genFromTemplate. 원 RLE의1→runtime0, 그 외→벽1. boss room/pillar/type4/게이트/출구/굴 후보 처리까지 실행한 최종 map은 초기path mask와 다름 |
| S08 | G:31533~31569,31573~31608 | initStage actor/상태 정리→selector→generator→start room 바닥탐색(r1..29)→(tile+.5)*40. RLE 맵은 일반 room/corridor·최소80보완·근접hole삭제 비실행. CH1 시작중형2마리는si0전용이라 CH2에 추가하지 않음 |

### 1.2 6에리어의 실제 생성 데이터

기존 CH1-03 exporter의 관측용 harness를 L에 복사하여 지원 입력·CH2 선언 선택만 넓혔다. 제품 exporter는 수정하지 않았다. 원본 함수 본문/상수/분기 문자열 변경0, DOM/initStage/initMapObjects/mkEn 실행0. 기본 빈 URL로 selector→genFromTemplate→원 START 발췌→원 _regionInit을 실행했다. Math.random만 seed20261020 LCG(imul1664525+1013904223, uint32/2³²)로 고정했다. mkRng 원함수는 그대로다.

아래 값은 **발췌 VM 생성 결과**다. initMapObjects 후 최종 object/collider, 자연 부트 타이머·실제 전투/문지기 생존은 미확인. 모든 에리어 grid200×200/T40/40,000타일/START world[4020,7420]이다.

| 에리어 / 보스 | 지형 / raw hand | 타일0/1/2/3/4 개수 | 게이트 metadata y / 출구 y | 굴수 / 분모 / NW·NE·SW·SE | timer RNG회 |
| --- | --- | --- | --- | --- | --- |
| 2-1 / si4 / 벌레 수호자 | path22 /105 | 10722 / 28395 / 3 / 0 / 880 | 31 / 33 | 11 / 900 / 250,200,300,150 | 11 |
| 2-2 / si5 / 점액 괴수 | 기본floor /미정의 | 38986 / 36 / 3 / 0 / 975 | 5 / 7 | 11 / 900 / 250,300,250,100 | 12 |
| 2-3 / si6 / 기생충 모체 | 기본floor /미정의 | 38986 / 36 / 3 / 0 / 975 | 5 / 7 | 14 / 1100 / 250,300,350,200 | 14 |
| 2-4 / si7 / 거대 알주머니 | 기본floor /미정의 | 38986 / 36 / 3 / 0 / 975 | 5 / 7 | 14 / 1100 / 250,300,350,200 | 14 |
| 2-5 / si8 / 살벽의 군주 | 기본floor /미정의 | 38986 / 36 / 3 / 0 / 975 | 5 / 7 | 12 / 900 / 150,300,250,200 | 13 |
| 2-6 / si9 / 여왕 구더기 | 기본floor /미정의 | 38986 / 36 / 3 / 0 / 975 | 5 / 7 | 11 / 850 / 150,200,350,150 | 12 |

모든 게이트/출구 x는99/100/101이다. si4에는 gate metadata y31이 있어도 code3 타일은0개다. si5~9도 code3은0이다. 임의로 게이트3칸을 칠하지 않는다. si4 tile byte SHA256은 `4e965948e59fed49b7de6c2936ca24aa774e858532a7e22780d72519050eb3c8`, si5~9 공통은 `5b40eb67c1aa3fd6ad407f9af06db91f549456bcd9c7d91ed31265c5a3a3b87e`다. 같은 지형 해시라도 소환굴·지역 분모·보스는 다르다. raw hand 미정의는 빈 배열이 아니다(L의 undefined_paths=/hand_props_raw).

#### si4 경로와 구역

G:18198의 path는 `w:30,authoredWidth:1,pts:[[100,190],[100,178],[90,168],[78,158],[68,148],[76,138],[94,136],[118,132],[150,128],[118,132],[104,120],[88,108],[72,98],[88,88],[112,88],[92,80],[76,68],[72,56],[88,46],[108,42],[116,32],[100,18]]`다. 반복 [118,132]는 동측 dead end 왕복이며 정리/중복제거 금지. empty3은(.50,.93,r480),(.50,.05,r420),(.39,.73,r480). empty는 합성/배치 여백이며 새 충돌체가 아니다.

raw zone13개는 **한 에리어 안의 저작 구역**이며 6에리어·전투4분면과 다르다. backfill9/boundary50/landmark18/detail6/mask4/filler12/seam6=105. CH_DECO 선언상 충돌 후보51·비충돌54, mega참조17. 이것은 실제 runtime collider 총수(시스템 포함)가 아니다.

#### si4 명시 배치105개 전수표

원본 G:17991~18117의 back.concat(o) 순서다. tile은 입력이며 effective world는 G:26059~26074의 _nearFloor 검색 뒤 +.5/T40. role은 runtime으로 전달되지만 **zone·overlap은 현재 hand loader에서 전달하지 않는다**(region만 별도 전달). 아래 absent rot/overlap은 원래 키 부재로 보존한다.

| 순서 | id | tile x/y | role / zone | rot / overlap | 원본 행 |
| --- | --- | --- | --- | --- | --- |
| 0 | m_c2skinHookL | 84/40 | backfill/top_chamber | 350/0.16 | G:17998 |
| 1 | m_c2skinHookR | 125/42 | backfill/top_chamber | 12/0.14 | G:17998 |
| 2 | m_c2skinRibArc | 70/76 | backfill/central_bridge | 344/0.18 | G:18001 |
| 3 | m_c2skinDepthArch | 108/82 | backfill/central_bridge | 16/0.13 | G:18001 |
| 4 | m_c2backHive | 112/70 | backfill/central_right_recess | 8/0.16 | G:18006 |
| 5 | m_c2skinWebArc | 160/132 | backfill/east_pocket_belt | 168/0.15 | G:18009 |
| 6 | m_c2backRidgeR | 154/127 | backfill/east_pocket_belt | 18/0.12 | G:18009 |
| 7 | m_c2backRidgeL | 62/164 | backfill/lower_chamber_belt | 352/0.12 | G:18012 |
| 8 | m_c2skinJawArc | 120/164 | backfill/lower_chamber_belt | 10/0.17 | G:18012 |
| 9 | m_c2ridgeL | 77/182 | boundary/entrance | —/— | G:18016 |
| 10 | m_c2ridgeR | 123/182 | boundary/entrance | —/— | G:18016 |
| 11 | m_c2p2 | 82/178 | boundary/entrance | —/— | G:18017 |
| 12 | m_c2p2 | 118/178 | boundary/entrance | —/— | G:18017 |
| 13 | m_c2webp | 76/165 | boundary/entrance | —/— | G:18017 |
| 14 | m_c2webpf | 108/165 | boundary/entrance | —/— | G:18017 |
| 15 | m_c2p1b | 74/174 | boundary/entrance | —/— | G:18017 |
| 16 | m_c2p2 | 84/188 | landmark/entrance | —/— | G:18020 |
| 17 | m_c2p2 | 116/188 | landmark/entrance | —/— | G:18020 |
| 18 | m_c2chitin | 84/180 | detail/entrance | —/— | G:18022 |
| 19 | m_c2curveL | 54/158 | boundary/lower_tunnel | —/— | G:18026 |
| 20 | m_c2p1 | 52/160 | boundary/lower_tunnel | —/— | G:18026 |
| 21 | m_c2webpf | 104/160 | boundary/lower_tunnel | —/— | G:18026 |
| 22 | m_c2p2 | 50/146 | boundary/lower_tunnel | —/— | G:18027 |
| 23 | m_c2p1b | 106/145 | boundary/lower_tunnel | —/— | G:18027 |
| 24 | m_c2webp | 100/152 | landmark/lower_tunnel | —/— | G:18029 |
| 25 | m_c2larva | 70/160 | detail/lower_tunnel | —/— | G:18030 |
| 26 | m_c2hiveWall | 44/145 | boundary/egg_plaza | —/— | G:18034 |
| 27 | m_c2curveR | 124/145 | boundary/egg_plaza | —/— | G:18034 |
| 28 | m_c2p1 | 45/150 | boundary/egg_plaza | —/— | G:18034 |
| 29 | m_c2webpf | 122/153 | boundary/egg_plaza | —/— | G:18034 |
| 30 | m_c2p1b | 70/132 | boundary/egg_plaza | —/— | G:18035 |
| 31 | m_c2webp | 118/122 | boundary/egg_plaza | —/— | G:18035 |
| 32 | m_c2p2 | 72/152 | landmark/egg_plaza | —/— | G:18038 |
| 33 | m_c2p2 | 64/146 | landmark/egg_plaza | —/— | G:18038 |
| 34 | m_c2p2 | 70/140 | landmark/egg_plaza | —/— | G:18038 |
| 35 | m_c2p2 | 68/132 | landmark/egg_plaza | —/— | G:18038 |
| 36 | m_c2hive | 114/154 | landmark/egg_plaza | —/— | G:18039 |
| 37 | m_c2glow | 68/150 | detail/egg_plaza | —/— | G:18041 |
| 38 | m_c2ridgeR | 164/129 | boundary/east_dead_end | —/— | G:18045 |
| 39 | m_c2p1 | 150/112 | boundary/east_dead_end | —/— | G:18045 |
| 40 | m_c2webp | 168/122 | boundary/east_dead_end | —/— | G:18045 |
| 41 | m_c2p1b | 168/138 | boundary/east_dead_end | —/— | G:18046 |
| 42 | m_c2webpf | 154/144 | boundary/east_dead_end | —/— | G:18046 |
| 43 | m_c2p2 | 170/130 | boundary/east_dead_end | —/— | G:18046 |
| 44 | m_c2webp | 160/120 | landmark/east_dead_end | —/— | G:18048 |
| 45 | m_c2eye | 150/128 | detail/east_dead_end | —/— | G:18049 |
| 46 | m_c2slimeCliff | 54/94 | boundary/slime_hollow | —/— | G:18053 |
| 47 | m_c2curveR | 118/90 | boundary/slime_hollow | —/— | G:18053 |
| 48 | m_c2ridgeL | 68/78 | boundary/slime_hollow | —/— | G:18053 |
| 49 | m_c2p1b | 56/80 | boundary/slime_hollow | —/— | G:18054 |
| 50 | m_c2webpf | 58/68 | boundary/slime_hollow | —/— | G:18054 |
| 51 | m_c2p1 | 112/72 | boundary/slime_hollow | —/— | G:18054 |
| 52 | m_c2webp | 116/98 | boundary/slime_hollow | —/— | G:18054 |
| 53 | m_c2pit | 64/90 | landmark/slime_hollow | —/— | G:18057 |
| 54 | m_c2pit | 72/82 | landmark/slime_hollow | —/— | G:18057 |
| 55 | m_c2pit | 78/92 | landmark/slime_hollow | —/— | G:18057 |
| 56 | m_c2hive | 69/88 | landmark/slime_hollow | —/— | G:18057 |
| 57 | m_c2mush | 68/104 | detail/slime_hollow | —/— | G:18059 |
| 58 | m_c2curveL | 52/66 | boundary/bent_tunnel | —/— | G:18063 |
| 59 | m_c2chitinArch | 104/74 | boundary/bent_tunnel | —/— | G:18063 |
| 60 | m_c2ridgeL | 49/55 | boundary/bent_tunnel | —/— | G:18063 |
| 61 | m_c2p1 | 52/72 | boundary/bent_tunnel | —/— | G:18063 |
| 62 | m_c2webpf | 106/74 | boundary/bent_tunnel | —/— | G:18063 |
| 63 | m_c2webp | 50/62 | landmark/bent_tunnel | —/— | G:18065 |
| 64 | m_c2glow | 72/60 | detail/bent_tunnel | —/— | G:18066 |
| 65 | m_c2deepHive | 62/48 | boundary/deep_cave | —/— | G:18070 |
| 66 | m_c2curveL | 88/28 | boundary/deep_cave | —/— | G:18070 |
| 67 | m_c2ridgeR | 132/28 | boundary/deep_cave | —/— | G:18070 |
| 68 | m_c2p1b | 60/58 | boundary/deep_cave | —/— | G:18071 |
| 69 | m_c2webp | 120/58 | boundary/deep_cave | —/— | G:18071 |
| 70 | m_c2p2 | 60/38 | boundary/deep_cave | —/— | G:18071 |
| 71 | m_c2hive | 82/42 | landmark/deep_cave | —/— | G:18074 |
| 72 | m_c2hive | 118/45 | landmark/deep_cave | —/— | G:18074 |
| 73 | m_c2floorpatch | 89/14 | mask/boss_gate | —/— | G:18080 |
| 74 | m_c2floorpatch | 109/14 | mask/boss_gate | —/— | G:18080 |
| 75 | m_c2floorpatch | 89/22 | mask/boss_gate | —/— | G:18080 |
| 76 | m_c2floorpatch | 109/22 | mask/boss_gate | —/— | G:18080 |
| 77 | m_c2exitFrame | 100/20 | boundary/boss_gate | —/— | G:18083 |
| 78 | m_c2brokenMega | 127/16 | boundary/boss_gate | —/— | G:18083 |
| 79 | m_c2webpf | 91/14 | boundary/boss_gate | —/— | G:18083 |
| 80 | m_c2webp | 111/14 | boundary/boss_gate | —/— | G:18083 |
| 81 | m_c2webp | 91/24 | boundary/boss_gate | —/— | G:18084 |
| 82 | m_c2webpf | 111/24 | boundary/boss_gate | —/— | G:18084 |
| 83 | m_c2p1 | 83/24 | boundary/boss_gate | —/— | G:18084 |
| 84 | m_c2p1b | 130/24 | boundary/boss_gate | —/— | G:18084 |
| 85 | m_c2hive | 82/28 | landmark/boss_gate | —/— | G:18087 |
| 86 | m_c2hive | 118/28 | landmark/boss_gate | —/— | G:18087 |
| 87 | m_c2midRidgeL | 68/44 | filler/top_chamber | 348/— | G:18093 |
| 88 | m_c2midRidgeR | 132/44 | filler/top_chamber | 14/— | G:18093 |
| 89 | m_c2midJaw | 118/58 | filler/top_chamber | 22/— | G:18093 |
| 90 | m_c2seamEgg | 128/48 | seam/top_chamber | 8/— | G:18096 |
| 91 | m_c2midRib | 60/84 | filler/central_bridge | 342/— | G:18099 |
| 92 | m_c2midRidgeL | 68/68 | filler/central_bridge | 16/— | G:18099 |
| 93 | m_c2midJaw | 112/84 | filler/central_bridge | 352/— | G:18099 |
| 94 | m_c2seamChitin | 106/74 | seam/central_bridge | 340/— | G:18102 |
| 95 | m_c2seamEgg | 112/82 | seam/central_bridge | 352/— | G:18102 |
| 96 | m_c2midRidgeR | 132/142 | filler/east_pocket_belt | 18/— | G:18105 |
| 97 | m_c2midHive | 150/136 | filler/east_pocket_belt | 348/— | G:18105 |
| 98 | m_c2midJaw | 164/140 | filler/east_pocket_belt | 342/— | G:18105 |
| 99 | m_c2seamEgg | 154/132 | seam/east_pocket_belt | 8/— | G:18108 |
| 100 | m_c2midRidgeL | 56/172 | filler/lower_chamber_belt | 352/— | G:18111 |
| 101 | m_c2midRib | 78/174 | filler/lower_chamber_belt | 8/— | G:18111 |
| 102 | m_c2midRidgeR | 118/172 | filler/lower_chamber_belt | 15/— | G:18111 |
| 103 | m_c2seamChitin | 74/174 | seam/lower_chamber_belt | 10/— | G:18114 |
| 104 | m_c2seamEgg | 114/168 | seam/lower_chamber_belt | 352/— | G:18114 |

#### 원본 생성 후 소환굴73개 전수표

아래 px·size·room·count는 G:30042~30085,30486~30626,31029~31030의 실행값이다. 후보 순서·벽위 재배치·11×11 floor밀도/거리 제거·path보완을 모두 적용한 뒤다. timer 값은 seed 관측일 뿐 자연 부트 증거가 아니므로 표에서 제외했다. room=-1은 복도 후보 메타이며 실제 방 포함 여부로 재분류하지 않는다.

**si4 — 2-1**

| 순서 | x / y (px) | size | room | 원본 수량 |
| --- | --- | --- | --- | --- |
| 0 | 3540/6700 | 0.5 | 1 | 100 |
| 1 | 2780/5860 | 0.3 | 1 | 50 |
| 2 | 4060/5380 | 0.5 | 1 | 100 |
| 3 | 5500/5180 | 0.3 | 1 | 50 |
| 4 | 3860/4580 | 0.5 | 1 | 100 |
| 5 | 3260/3700 | 0.5 | 1 | 100 |
| 6 | 3940/3300 | 0.3 | 1 | 50 |
| 7 | 2900/2340 | 0.5 | 1 | 100 |
| 8 | 4260/1700 | 0.8 | 1 | 100 |
| 9 | 3780/6220 | 0.3 | 1 | 50 |
| 10 | 4820/1900 | 0.8 | 1 | 100 |

**si5 — 2-2**

| 순서 | x / y (px) | size | room | 원본 수량 |
| --- | --- | --- | --- | --- |
| 0 | 2820/6380 | 0.5 | 1 | 100 |
| 1 | 5060/5900 | 0.3 | 1 | 50 |
| 2 | 2020/4900 | 0.5 | 1 | 100 |
| 3 | 3660/3980 | 0.5 | 1 | 100 |
| 4 | 5860/2780 | 0.5 | 1 | 100 |
| 5 | 2300/2180 | 0.3 | 1 | 50 |
| 6 | 5220/1260 | 0.5 | 1 | 100 |
| 7 | 3780/6220 | 0.3 | 1 | 50 |
| 8 | 3060/3420 | 0.55 | 1 | 100 |
| 9 | 4820/1900 | 0.8 | 1 | 100 |
| 10 | 4020/5540 | 0.3 | -1 | 50 |

**si6 — 2-3**

| 순서 | x / y (px) | size | room | 원본 수량 |
| --- | --- | --- | --- | --- |
| 0 | 2380/6940 | 0.5 | 1 | 100 |
| 1 | 5180/6100 | 0.3 | 1 | 50 |
| 2 | 1620/5020 | 0.5 | 1 | 100 |
| 3 | 6060/5900 | 0.3 | 1 | 50 |
| 4 | 3220/4340 | 0.5 | 1 | 100 |
| 5 | 5700/3740 | 0.5 | 1 | 100 |
| 6 | 2900/2060 | 0.3 | 1 | 50 |
| 7 | 5100/1700 | 0.5 | 1 | 100 |
| 8 | 3420/1220 | 0.8 | 1 | 100 |
| 9 | 3780/6220 | 0.3 | 1 | 50 |
| 10 | 3060/3420 | 0.55 | 1 | 100 |
| 11 | 4820/2140 | 0.8 | 1 | 100 |
| 12 | 4020/5540 | 0.3 | -1 | 50 |
| 13 | 4020/4140 | 0.3 | -1 | 50 |

**si7 — 2-4**

| 순서 | x / y (px) | size | room | 원본 수량 |
| --- | --- | --- | --- | --- |
| 0 | 3260/6740 | 0.5 | 1 | 100 |
| 1 | 5900/7020 | 0.3 | 1 | 50 |
| 2 | 2660/4940 | 0.5 | 1 | 100 |
| 3 | 5020/5580 | 0.3 | 1 | 50 |
| 4 | 3260/4900 | 0.5 | 1 | 100 |
| 5 | 5900/3700 | 0.5 | 1 | 100 |
| 6 | 1820/2940 | 0.3 | 1 | 50 |
| 7 | 6220/1980 | 0.5 | 1 | 100 |
| 8 | 3860/1500 | 0.8 | 1 | 100 |
| 9 | 3780/6220 | 0.3 | 1 | 50 |
| 10 | 3060/3420 | 0.55 | 1 | 100 |
| 11 | 4820/1900 | 0.8 | 1 | 100 |
| 12 | 4020/5540 | 0.3 | -1 | 50 |
| 13 | 4020/4140 | 0.3 | -1 | 50 |

**si8 — 2-5**

| 순서 | x / y (px) | size | room | 원본 수량 |
| --- | --- | --- | --- | --- |
| 0 | 2420/6260 | 0.5 | 1 | 100 |
| 1 | 4980/5700 | 0.3 | 1 | 50 |
| 2 | 5940/5340 | 0.3 | 1 | 50 |
| 3 | 3740/4740 | 0.5 | 1 | 100 |
| 4 | 4580/2940 | 0.5 | 1 | 100 |
| 5 | 2140/2180 | 0.3 | 1 | 50 |
| 6 | 5580/1940 | 0.5 | 1 | 100 |
| 7 | 3780/6220 | 0.3 | 1 | 50 |
| 8 | 3060/3420 | 0.55 | 1 | 100 |
| 9 | 4820/1900 | 0.8 | 1 | 100 |
| 10 | 4020/5540 | 0.3 | -1 | 50 |
| 11 | 4020/4140 | 0.3 | -1 | 50 |

**si9 — 2-6**

| 순서 | x / y (px) | size | room | 원본 수량 |
| --- | --- | --- | --- | --- |
| 0 | 3500/7060 | 0.5 | 1 | 100 |
| 1 | 5540/5820 | 0.3 | 1 | 50 |
| 2 | 2780/5420 | 0.5 | 1 | 100 |
| 3 | 5180/5140 | 0.3 | 1 | 50 |
| 4 | 3860/4220 | 0.5 | 1 | 100 |
| 5 | 5660/2940 | 0.5 | 1 | 100 |
| 6 | 2900/2220 | 0.3 | 1 | 50 |
| 7 | 4940/1900 | 0.5 | 1 | 100 |
| 8 | 3780/6220 | 0.3 | 1 | 50 |
| 9 | 3060/3420 | 0.55 | 1 | 100 |
| 10 | 4020/5540 | 0.3 | -1 | 50 |

### 1.3 오브젝트 생성·충돌·등록 메타

공통 initMapObjects·isW/canMv 본문은 1장 §1.2 G10~G16 참조. CH2 고유 차이는 아래와 같다.

| 원본 위치 | CH2에서 반드시 지킬 계약 |
| --- | --- |
| G:17487,17519~17805 | 퇴역ID Set·CH_DECO 장별 카탈로그. CH2 테이블은17638~17698,47개. m_c2web/m_c2seamWeb 퇴역, 큰 prop_webp와 wall_skin_web_arc는 별개이므로 삭제하지 않음 |
| G:18392~18426,18427~18488 | 초기 OBJ_META77개는1장 §1.5 참조. 별도CH2 테이블을 existing dict에 in-place merge. sz/light/large/mega·JS truthy col/prev·alpha undefined/명시0 구분. 등록 raw와 실효메타·onload 처리 완료는 별도 |
| G:25735~25878 | editor기존obj필터, 소환굴/START/boss 근접 collider 제외→grid200→floorAt0/4→nearFloor r1..9. 자동 lore/HP3breakable과 시스템 오브젝트 때문에 hand105를 최종 MAP_OBJS 전체수로 쓰지 않음 |
| G:25914~26058 | hand/dense compose4는 자동대형/mega/scatter 경로 차단. compose5~9 부재는 장별 일반 자동배치 fallback. 최종 MAP_OBJS/실효 충돌 수 미관측,0이라고 채우지 않음 |
| G:26059~26081 | raw순서→_nearFloor→(tile+.5)*T. dense overlap skip우회/noGrid1. role/region·정규화rot 전달. scale 전달 gate는si0 또는10~13이므로 CH2에 임의scale 이식금지. zone/overlap 소실을 문서에서 복원된 runtime 필드로 위장하지 않음 |
| G:26430~26472 | hell0/1 벽눈 자동 배치는hand+dense4에서 차단,si5~9는조건부 가능. editor복원→renderLayer/y 정렬. 따라서 si4의 CH1 카탈로그 원본을 로드했다고 CH1 장식을 추가하지 않음 |
| G:31682~31712 | colObjs prefilter는identity/length 변경시 rebuild. retired/noCol 제외. colParts 회전사각/ellipse/circle, meta colW/H/Sz×scale, colOy 별도+1회, strict < 경계. isW bounds/tile1→CH1hill→bonewall→props, canMv4모서리. CH1 hill는stage0/비arena전용: si4에 언덕 복사금지 |

#### CH2 _CH_DECO[1]47개 등록 전수표

각 등록의 원문 필드 전체를 남긴다. 아래 asset root는 `assets/map/ch2/`, 기본dir=floor_objects, dir='.'는root다.47등록→중복제외 원화29개. main의 모든 source path가 존재하고 `godot/`를 앞에 붙인 대응 파일과 **Git blob29종 모두 동일**(등록47건 대조). PNG 로딩/alpha/피벗/시각 인수는 미확인. 전체 에셋 재복사·원본가공·추가생성은 이 추적의 작업이 아니다.

| 순서 / 행 | 등록 원문 |
| --- | --- |
| 0 / G:17639 | `{id:'m_c2p1',file:'prop_a.png',sz:380,large:1,dir:'collision',col:1,colSz:70,keepAR:1}` |
| 1 / G:17640 | `{id:'m_c2p1b',file:'prop_a.png',sz:320,large:1,dir:'collision',col:1,colSz:58,keepAR:1,flip:1}` |
| 2 / G:17641 | `{id:'m_c2p2',file:'prop_b.png',sz:360,large:1,dir:'collision',col:1,colSz:62,keepAR:1}` |
| 3 / G:17642 | `{id:'m_c2hive',file:'prop_hive.png',sz:360,large:1,dir:'collision',col:1,colSz:90,keepAR:1}` |
| 4 / G:17643 | `{id:'m_c2webp',file:'prop_webp.png',sz:340,large:1,dir:'collision',col:1,colSz:55,keepAR:1}` |
| 5 / G:17644 | `{id:'m_c2webpf',file:'prop_webp.png',sz:340,large:1,dir:'collision',col:1,colSz:55,keepAR:1,flip:1}` |
| 6 / G:17645 | `{id:'m_c2pit',file:'pit_bugs.png',sz:200,large:1,dir:'collision',col:1,collision:1,colSz:80}` |
| 7 / G:17646 | `{id:'m_c2chitin',file:'chitin_debris.png',sz:56,scatter:1}` |
| 8 / G:17647 | `{id:'m_c2larva',file:'larva.png',sz:52,scatter:1}` |
| 9 / G:17648 | `{id:'m_c2mini',file:'minibug.png',sz:36,scatter:1}` |
| 10 / G:17650 | `{id:'m_c2mush',file:'toxic_mushroom.png',sz:56,light:1}` |
| 11 / G:17651 | `{id:'m_c2glow',file:'mushroom_glow_01.png',sz:44,light:1,scatter:1}` |
| 12 / G:17652 | `{id:'m_c2eye',file:'eye_mushroom.png',sz:52,scatter:1}` |
| 13 / G:17653 | `{id:'m_c2edgeS',file:'wall_edge_tile.png',sz:860,large:1,dir:'.',col:1,colSz:70,keepAR:1}` |
| 14 / G:17654 | `{id:'m_c2edgeSf',file:'wall_edge_tile.png',sz:860,large:1,dir:'.',col:1,colSz:70,keepAR:1,flip:1}` |
| 15 / G:17655 | `{id:'m_c2edge',file:'wall_edge_tile.png',sz:1100,large:1,dir:'.',col:1,colSz:70,keepAR:1}` |
| 16 / G:17656 | `{id:'m_c2edgef',file:'wall_edge_tile.png',sz:1100,large:1,dir:'.',col:1,colSz:70,keepAR:1,flip:1}` |
| 17 / G:17657 | `{id:'m_c2edgeL',file:'wall_edge_tile.png',sz:1320,large:1,dir:'.',col:1,colSz:70,keepAR:1}` |
| 18 / G:17658 | `{id:'m_c2edgeLf',file:'wall_edge_tile.png',sz:1320,large:1,dir:'.',col:1,colSz:70,keepAR:1,flip:1}` |
| 19 / G:17660 | `{id:'m_c2curveL',file:'wall_curve_l.png',sz:1500,large:1,mega:1,dir:'mega',keepAR:1}` |
| 20 / G:17661 | `{id:'m_c2curveR',file:'wall_curve_r.png',sz:1500,large:1,mega:1,dir:'mega',keepAR:1}` |
| 21 / G:17662 | `{id:'m_c2brokenMega',file:'wall_broken_mega.png',sz:1250,large:1,mega:1,dir:'mega',keepAR:1}` |
| 22 / G:17663 | `{id:'m_c2hiveWall',file:'hive_wall_mega.png',sz:1480,large:1,mega:1,dir:'mega',keepAR:1}` |
| 23 / G:17664 | `{id:'m_c2slimeCliff',file:'slime_cliff.png',sz:1350,large:1,mega:1,dir:'mega',keepAR:1}` |
| 24 / G:17665 | `{id:'m_c2chitinArch',file:'chitin_arch.png',sz:1400,large:1,mega:1,dir:'mega',keepAR:1}` |
| 25 / G:17666 | `{id:'m_c2deepHive',file:'deep_hive.png',sz:1450,large:1,mega:1,dir:'mega',keepAR:1}` |
| 26 / G:17667 | `{id:'m_c2exitFrame',file:'exit_organic_frame.png',sz:1500,large:1,mega:1,dir:'mega',keepAR:1}` |
| 27 / G:17668 | `{id:'m_c2ridgeL',file:'wall_ridge_l.png',sz:1600,large:1,mega:1,dir:'mega',keepAR:1}` |
| 28 / G:17669 | `{id:'m_c2ridgeR',file:'wall_ridge_r.png',sz:1600,large:1,mega:1,dir:'mega',keepAR:1}` |
| 29 / G:17670 | `{id:'m_c2floorpatch',file:'ground.png',sz:280,dir:'.',authoredOnly:1}` |
| 30 / G:17672 | `{id:'m_c2backRidgeL',file:'wall_ridge_l.png',sz:1050,dir:'mega',keepAR:1,sharedAtlas:1,authoredOnly:1,alpha:.68}` |
| 31 / G:17673 | `{id:'m_c2backRidgeR',file:'wall_ridge_r.png',sz:1050,dir:'mega',keepAR:1,sharedAtlas:1,authoredOnly:1,alpha:.68}` |
| 32 / G:17674 | `{id:'m_c2backJaw',file:'wall_broken_mega.png',sz:940,dir:'mega',keepAR:1,sharedAtlas:1,authoredOnly:1,alpha:.65}` |
| 33 / G:17675 | `{id:'m_c2backHive',file:'hive_wall_mega.png',sz:980,dir:'mega',keepAR:1,sharedAtlas:1,authoredOnly:1,alpha:.72}` |
| 34 / G:17677 | `{id:'m_c2skinHookL',file:'wall_skin_hook_l.png',sz:1100,dir:'mega',keepAR:1,authoredOnly:1,alpha:.68}` |
| 35 / G:17678 | `{id:'m_c2skinHookR',file:'wall_skin_hook_r.png',sz:1100,dir:'mega',keepAR:1,authoredOnly:1,alpha:.68}` |
| 36 / G:17679 | `{id:'m_c2skinRibArc',file:'wall_skin_rib_arc.png',sz:1120,dir:'mega',keepAR:1,authoredOnly:1,alpha:.68}` |
| 37 / G:17680 | `{id:'m_c2skinWebArc',file:'wall_skin_web_arc.png',sz:1080,dir:'mega',keepAR:1,authoredOnly:1,alpha:.68}` |
| 38 / G:17681 | `{id:'m_c2skinJawArc',file:'wall_skin_jaw_arc.png',sz:1100,dir:'mega',keepAR:1,authoredOnly:1,alpha:.68}` |
| 39 / G:17682 | `{id:'m_c2skinDepthArch',file:'wall_skin_depth_arch.png',sz:1120,dir:'mega',keepAR:1,authoredOnly:1,alpha:.68}` |
| 40 / G:17684 | `{id:'m_c2midRidgeL',file:'wall_ridge_l.png',sz:900,dir:'mega',keepAR:1,sharedAtlas:1,authoredOnly:1}` |
| 41 / G:17685 | `{id:'m_c2midRidgeR',file:'wall_ridge_r.png',sz:900,dir:'mega',keepAR:1,sharedAtlas:1,authoredOnly:1}` |
| 42 / G:17686 | `{id:'m_c2midJaw',file:'wall_broken_mega.png',sz:860,dir:'mega',keepAR:1,sharedAtlas:1,authoredOnly:1}` |
| 43 / G:17687 | `{id:'m_c2midRib',file:'chitin_arch.png',sz:880,dir:'mega',keepAR:1,sharedAtlas:1,authoredOnly:1}` |
| 44 / G:17688 | `{id:'m_c2midHive',file:'hive_wall_mega.png',sz:820,dir:'mega',keepAR:1,sharedAtlas:1,authoredOnly:1}` |
| 45 / G:17690 | `{id:'m_c2seamChitin',file:'chitin_debris.png',sz:220,keepAR:1,authoredOnly:1}` |
| 46 / G:17691 | `{id:'m_c2seamEgg',file:'prop_hive.png',sz:320,dir:'collision',keepAR:1,hardAlpha:1,authoredOnly:1}` |

### 1.4 스폰·전환·클리어 조건

공통 전환 알고리즘은1장 §1.4 F01~F12 참조. CH2 분기와 구체 입력은 아래에서 고정한다.

| ID / 원본 행 | CH2 계약과 미확인 경계 |
| --- | --- |
| F01 / G:31389~31516,31573~31608 | RLE6맵은room/corridor 적 자동배치·최소80 보완 비실행. 초기 actor를0명이라고 단정하지 않음: 문지기·호위/웨이브 등 별도경로 존재.500px안전반경은actor대상. 근접hole삭제는!G._isTileRLE gate라 이6맵에서 적용되지 않음 |
| F02 / G:31029~31030,35636~35693 | S<=.3:50/M<=.5:100/L:100. stage0 할인8/15를CH2에 재사용금지. 시작120프레임 차단→거리²<4,000,000 트리거→다음 루프delay90→interval trunc(900/total),alive>=700이면CD30. 반경120+random300+size150/30회→spiral<20→굴중심fallback,canMv와별개 isW(...,true). 진행곡선/CD·생성실패시_spawned증가·reviveIframes15·완료굴제거는공통P3 owner |
| F03 / G:30969~31022 | HELL_SPAWN[1]31개 [etype,weight],_HELL_CDF 사용. 50%ranged가중선택,나머지최대12회nonrangedCDF/fallback2. _RANGED_ET 공통. rollEl:EL.P편향.40 후 [P,F,I,D,L,H]균등추가. CH1 start exclusion·정확50/50 별도분기를si4에적용하지 않음 |
| F04 / G:31609~31655 | START barrier300틱/r280. hell1 문지기etype39,el=STG.be,HP4/ATK2/r1.4/poise80/dropTier3,호위4..6·wave8..12. 실제생성은 후보tile===0 조건. 발췌타일상si4 후보[4020,1380]/tile0;si5~9 후보[4020,340]/tile4이므로 그조건거절. 실제mkEn는이번미실행. 문지기를강제로살리거나tile4를0으로바꾸지않음 |
| F05 / G:60688~60732,60766~60780;31555~31655 | grid200²이므로4분면일반방위명. CH1 앵글러fbIdx매칭은si0만이라CH2 전부fbIdx=-1·_regionFbAlive=false. total은굴수량합,kill은home좌표우선/ib제외,문지기10%는gate분면만. ratio>=.8−1e−9+latch,빈지역조용히clear. 시각 zone13과혼용금지 |
| F06 / G:41868~41921 | 지역4/4면bossUnlocked;si0 _fbDone 조건은CH2에요구하지않음. 지역없는소형맵만전역80%+문지기10%fallback. 출구tile밟음+bossAlive+비arena+unlock→bossLoadPhase1. 네지역clear를stageCleared로대체금지 |
| F07 / G:30697~30814 | hell1 _BOSS_ARENA_TYPE=1:128×108 직사각대성당(기둥없음),원/타원아님. entry64/103,boss64/54,exit64/1. field백업·잔존적kill합산·actor/obj/holes정리→arena교체. SI9만별도grid방이라는설계를현재원본과혼동금지 |
| F08 / G:41784~41856,41918~42022 | fade50→namecard130→fade50→entry100틱 공통. 보스죽음후출구열기→출구밟아stageCleared/SP+10/clear결과. 전투패턴·승리효과는적/보스담당. arena입장·보스사망·stageclear 세상태분리 |
| F09 / G:30149~30215,41857~41867 | zone포탈tile6/상태저장·복원공통. 기본CH2 clone은_zones=null:존포탈존재를si4~9에리어간전환완료로읽지않음. 저장형식보호 |
| F10 / G:43896,3987,4208~4219,31669 | nextStage:공통현장정리후si4→5→6→7→8→9,장끝9→다음startSi10. initStage→G.on→BGM.stageKey. hell2 key/2장_벌레굴/hell2_insect.mp3(수동OPT track이면다른곡가능). 데모si0종료gate는그대로. 새세이브/부트stage변조없음 |
| F11 / G:42024~42118 | 시간/점수/등급·clearRecords공통. `_clearParTime(total)=round(90+total*2.5)` 등은맵작업재구현대상아님. 실제기록저장·복원은SAVE담당/보호 |

HELL_SPAWN[1]의 정확 배열(G:30972~30973)은 `[[0,6],[1,5],[2,10],[3,15],[4,5],[5,8],[6,4],[7,7],[8,3],[9,2],[10,3],[11,6],[12,8],[13,7],[14,4],[15,3],[16,6],[17,3],[18,2],[19,1],[30,14],[31,6],[32,4],[33,10],[34,3],[35,6],[36,6],[37,3],[38,2],[39,2],[47,14]]`다. 자동 스폰의 수치 입력 근거이며31종 공격 구현 완료를 뜻하지 않는다.

### 1.5 환경 연출·충돌과 독립인 표현

CH1 production64청크·living/sway/face/rot-trees/moat/foreground/boundary는1장 전용 gate를 참조만 한다. CH2에 그 데이터를 복사하지 않는다. 아래는 원본 표현의 추적이며 후속 Godot의 그림·조명 방식은 최신 전략§8에 따라 별도 제작할 수 있다.

| ID / G 행 | 현행 CH2 표현·호출·미확인 |
| --- | --- |
| E01 /11200~11237,11958~11975,26521~26529 | skull_wall_tile/wall_edge_tile/벽눈이미지 등록,gt_ch2 ground.png. compose4에는vista/plate/paint없음,5~9compose없음. 등록됐다는이유로vista/plate활성취급금지 |
| E02 /11265~11301 | si4 soilEdgeA=1/soft-floor edge=false. 바닥40px검정격자노출방지. si5~9는이si4특례없음 |
| E03 /11408~11425 | _traceCh2AuthoredFloor:si4 path22의시각유기곡선,폭(w+4)*T/반경17*T에sin요철. 타일mask생성r15와동일충돌도형아님 |
| E04 /11426~11489 | 시각stains10/veins6·경계그림자/normal-side곡선. 주석대로hazard/랜드마크/authorobj아님. 얼룩보고감속writer추가금지 |
| E05 /11490~11517,11915~11947 | si4 _fillPathBg groundtile반복→검정alpha.68→halo→rim. halo폭w+10/w+7,blurT*2.4;rim3층두께T*6.4/T*4.5/T*.34. 충돌tile수정없음 |
| E06 /26861~26872,27008,27042~27053,27199,27605~27641 | full/stream/cache경로에서authored floortrace·detail소비,si4per-cell wallart/검정wallfillskip. legacy다른분기존재와실활성구분. 전체캐시흐름은1장§1.4 E04참조 |
| E07 /25735~26472,26475~26484,26567~26580,27218~27225 | CH2색w#2e3018/f#0e1008/ac#aacc44. 일반타일저alpha녹색stain·장별벽면. hand소품renderLayer/y정렬. rawzone13를4분면색으로변환하지않음 |
| E08 /25619~25731,26430~26448 | initTorchLights·initSwayObjects·_initEyes·initGlowObjects는 초기 return으로 비활성. initWallEyes는 hell3 전용(CH2 아님). MAP_OBJS 벽눈 자동 배치는 si4 hand+dense에서 차단, si5~9는 조건부다. 이미지 등록이 추적·깜빡임 실행 완료를 뜻하지 않는다 |
| E09 /4358~4365,4653~4730,8689,8975…,55215~55387 | 공통fog/포인트라이트/화면후처리. torch darkAlpha0,OPT/quality/postfx gate. 주석상옛지옥명색배열을2장새palette와혼합금지. 실제효과/FPS/오디오·이미지준비는미확인 |
| E10 /18236~18277 | 보스게이트/포탈배열의CH2는CH1 boss_gate.png·boss_portal_1.webp 경로를임시재사용(추후교체주석). 원본참조그대로기록. 새CH2문그림제작/교체는이번범위밖 |

## 2. docs와 최신 원본의 불일치·상태 차이

설계 문서는 바꾸지 않고 차이만 보고한다. “미확인”은 실행/소비자를 확인하지 못한 상태이며, 추측으로 수치나 제품 기능을 보충하지 않는다.

| docs 위치 | 기록 / 목표 | 현행 원본·조사 결과 | 후속 처리 |
| --- | --- | --- | --- |
| EXODUSER_MAP_BIBLE_v3 (1).md:94~110 | 6에리어·250/300/300/350/350/300²;vert/horiz/grid | 6개수는일치. G30042~30085는모두200²,si4path·5~9기본floor. 정식명은벌레굴1~6구역 | 옛크기·맵타입으로새지형을생성하지않음. 목표재설계는별도배정 |
| 같은문서:112~117 | 점액50%감속·알파괴2~3구더기·맥박벽·기생충벽트랩 | CH2메타/hand/loader에해당환경writer연결미발견. 시각stains는hazard아님(G11426). 실제맵트랩발동/원인별효과는미확인 | 감속/파괴/소환authority를상상해추가금지. 적·환경소유별도추적 |
| 같은문서:131~145 | 에리어3/4미니보스,여왕타원·점액아레나 | STG는각6에리어별보스명존재. genBossArena의hell1은모든si4~9에서직사각type1/128×108 | 보스별아레나를새grid나타원으로바꾸지않음. 공격은보스담당 |
| CH2_WEB_RETIREMENT_PASS42.md:42~51 | 109→105/충돌51·mega17/22점w30·4퇴역id | raw등록·좌표·역할수는일치. runtime총107/collider52는과거보고실측이며이번미실행. URLstage4로stage0부트관측기록존재 | 시각관람·runtime수치는새검증으로재사용금지. 정확si4identity확인필수 |
| 같은문서:49 및여러CH1이력 | CH1 living module 버전/늪·버블이력 | CH1모듈현재이력을CH2연출버전으로읽을수없음. CH2의전용맥박/기포실제소비는미확인 | 장별gate확인후별도관측. 과거CH1캡처로CH2시각PASS금지 |
| REGION_CLEAR_GATE_20260930.md:3~32 | 큰맵4/4·문지기지역10% | 공통계약일치. CH2fbIdx=-1. si5~9문지기후보tile4라spawn조건거절(발췌VM),전역80%로단순대체불가 | 문지기항상존재·10%항상획득가정금지. 관측차이는소유담당판단에인계 |
| 1전체그래픽세팅_MASTER.md:133~140 | 벌레굴 w#2e3018/f#0e1008/ac#aacc44 | G16681/26477의 CH2 palette 일치. 옛 지옥명 조명 테이블도 별도로 남아 있음 | 일치 항목도 명시. 다른 장 색/개선 목표를 CH2 원본값으로 덮지 않음 |
| 맵_화면효과_전수조사.md:72~129 | 토치어둠설명·옛지옥명·120442/133962등옛행 | 현재HTML65692행. 현행G8689darkAlpha0/55233조건으로torchpass생략,54행상단갱신은그사실기록. 본문과행번호는과거이력 | 구행을현행인용하지않고G4653~4730/55215~55387로추적 |
| MAP_RUNTIME_ARCHITECTURE/맵디테일/SSOT index의CH1제작이력 | CH1외곽53점/64청크/언덕·생체디테일 | CH2si4는22점path/105hand/별도mega시각구조. 공통runtime구조만재사용가능 | CH1수치·성능·접합검수를CH2로전이하지않음 |
| 최신Godot전략§8:89 | 표현은Godot직접제작,게임플레이원본보존 | 이문서는충돌/동선/스폰/지역·실제원본표현의근거분리. 원본같은픽셀/조명수단강제없음 | 시각목표LOCK·제작게이트와source동등성검사별도 |

## 3. Godot 의존(1장 파이프라인)과 빠진 소비자

### 3.1 이미 존재하는 것과 연결 경계

| 파일 / 상태 | 재사용 / 빠진 것 |
| --- | --- |
| main의godot/tools/export_world.mjs:1~15 | CH1-1 승인template→제품map.json/에셋추출. 기본R·증거경로가있으므로CH2원본추적에서실행하지않음. CH2로제품map.json자동교체금지 |
| main의engine/fdg/map-source-adapter.js:140~173,291~296,486~501 | Studio/sourceScene어댑터는CH1_1_PRODUCTION/version20260916/stage0만인식. CH2snapshot넣어성공처리할수없음. CPUpreview를GodotWorld로해석하지않음 |
| CH1-03의export_ch1_area_source.mjs:30~94,95~149 | buildAreaSnapshot0/1·captureJSON/undefined mask·정확AST closure와START/region관측재사용. CH2의stage4지원·CH2선언/schema/CLI보호미구현. source-only데이터와runtime연결분리 |
| main의godot/scripts/world.gd:22,905~954,3127~3242 | 고정res://data/map.json부트·buildcollision/pointquery/can_move·props. CH2메타와이미지카탈로그도존재하지만stage별tile/hand/전환권위설치와동일하지않음. 독립CH2맵입력수명/충돌/전환소비자미확인 |
| main의godot/assets/map/ch2/·world.gd CH2메타/이미지등록 | 원화29개/참조47건이main에존재하며대응Godotblob전부동일. 자산부재로오보하지않음. 실제load/trim/pivot/rect/alpha·mega시각/충돌·품질은별도검수 |
| main의godot/scripts/native_spawn_hole_system.gd:37,214,333,435,518 | STAGE=0고정·소환수168/etype0경로등P3-002스코프. source의CH2총900/1100/850을상수변경만으로연결금지. CH2적factory·31종/실제owner·RNG/분모/수명인수필요 |
| main의godot/scripts/native_regions.gd:59~106,143~159,243~261 | 공통spawn_hole_count/4분면/지역명/장타이틀은이미구현. stage4_data와실제현재G/world/굴/kill/문지기연결검수는미확인. P3-003 owner를복제하지않음 |
| CH1-04 결과미게시 | standalone World/효과·시각/collider owner인수미확인. 기존CH1-03 READY=source_snapshot_only/runtime_bound=false/full_stage_ready=false다. CH2runtime이이를전제로완료될수없음 |
| 새로필요한것 | CH2source snapshot·stage4순수계약,현재G/맵선택과독립World의stageidentity,실효hand배치/콜리더/동선검수,CH2적/보스스폰,4분면→문→arena→clear→next전환·정리. 표현은Godot제작담당의LOCK/게이트별검수. 저장/부트전체변경은별도 |

### 3.2 이번 실제 검산·원로그

L/source-audit.mjs는 원격 CH1-03 도구를 관측용으로 재사용했다. 변경점은 stage4~9를 허용하고 compose4/_CH2S4/CH_DECO[1] 선택·미정의hand포착·OUT출력/관측용schema를 지정한 harness뿐이다. 원본 game 함수/분기/계산은 그대로이며 제품 코드로 제출하지 않는다. CH1 layout를 VM에 읽어도 stage4~9 selector는그값을사용하지않는다. 기존acorn은R node_modules에서읽기만했다.

source-audit/replay 각각 exit0·stderr0. 정적·발췌 VM **176검산·0차이**: 6개 snapshot의 전체 반복 일치, 6개 타일 길이, 6개 굴 합계, 6개 지역 합계, 105개 배치의 원문 tuple, 47개 등록의 원본/Godot blob을 대조했다. 독립 게임 테스트 PASS 수치가 아니며 Godot·브라우저는 실행0이다. Node 발췌 관측 실행은 모두 성공했다. L/area-summary.json, si4~9.json, replay/, catalog-audit.json, source-index.json, audit-checks.json 및 stdout/stderr에 보존했다. 문서 교정 스크립트는 stdin 인코딩 오류로1회 실패했으나 파일 쓰기 전에 종료했다. apply_patch로 교정했고 해당 오류는 doc-edit-01.stderr.log에 기록했다.

L/si4~9.json은해당원본출처/함수행·SHA·timerseed소비·undefined mask를담은관측artifact이며제품에설치하지않았다. 최종_MAP_OBJS/prop_colliders/effective_prop_positions는NOT_OBSERVED다. oldruntime107개/52collider·캡처나CH1PASS수치를이번실측으로세지않는다.

기존CH1-03 보고의맵Node9실패(culling fixture1/adapter pending2/Image없는지역VM6),Main stage0 actor10/미이식158·full_fieldboss_combat=false 등은기존보고범위다. 이번재실행/원인수정없음. 사용자전달선재원문 “로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)”도재검증하지않았다.

## 4. 에리어 단위 작은 이식 순서안

아래는 **후속 배정안**이며 이번에 구현하지 않았다. 각source계약→독립소비자검수→제품진행연결순서를유지한다. 1장source exporter/consumer 소유자와경로인수를확정한뒤자기브랜치에서진행한다. CH1-04 미확인·공용권위미인수부분은runtime단위의BLOCKED사유이며수치위조나새중복owner로우회하지않는다.

### 4.1 1번 CH2-01 — si4 읽기 전용 원본 snapshot·순수 계약 (구현 지시서)

목표: 원본si4의게임플레이데이터를1장과동일한추출·검증파이프라인에태우고, 아직runtime에연결되지않은source snapshot으로명확히반환한다. CH2전체맵/전투/환경완성을목표로부풀리지않는다.

| 항목 | 구현 지시 |
| --- | --- |
| 선행 / 기준 | fetch최신main의gameSHA/행재확인. CH1-03 aada9b28(main미포함)이필수도구의존:병합된main또는인수된CH1-03후속tip에서분기하고계보명시. 도구경로소유자인CH1담당인수필수. CH1-04없어도source-only는가능,새runtimeowner설치금지 |
| 파일 | 동일pipeline인godot/tools/export_ch1_area_source.mjs의stage4추가만좁게인수. 신규godot/data/ch2_map_source/si4.json, godot/port_modules/ch2_map_source/stage4_contract.gd, test/fdgCh2Stage4Source.test.mjs, godot/tests/test_ch2_01_stage4_source.gd(엔진생성UID만). stage0/1data·producer·제품map.json/PNG0줄. 도구인수불가면동일추출기를복제하지말고BLOCKED |
| 원문 추출 | G16631~16711,CH2S4=17991~18117,compose4=18197~18201,CH_DECO[1]=17638~17698/OBJ_META초기77. M6~55. exactASTline/end/SHA;원함수selector/genFromTemplate/START/regionInit·기존carving/RLE/mkRng/_spawnHoleCount/_cacheExitCenterclosure재사용. 원문분기·값치환/stub없음 |
| 기존도구의 확장 위치 | CH1-03파일:30지원stage검사,85~90의compose/deco선택,101~107rawhand/catalog,환경refs·sourcegeometry분기,147~149반환schema,157~190CLI출력보호. stage0/1기존결과/CLI거부의미보존,stage0wrapper는0전용유지. stage4일때만별도CH2schema/테이블. CH1baked_manifest/hill를CH2정보로붙이지않음 |
| CLI | 후속API:node godot/tools/export_ch1_area_source.mjs <latest-WT-root> <explicit-output-json> --stage 4 --seed 20261020. 기존0/1계약유지. stage2/3/5~9·이상seed·다른stage파일·제품map.json·symlink출력은생성전거부. sourceRoot필수/기본R없음. PNG·저장·서버·브라우저쓰기0 |
| snapshot | schema exoduser.ch2-area-source.v1/stage4; source{actual main_sha,extraction_head,gameSHA,파일SHA,function line/end/SHA,selection}; grid200/200/40;tiles40000/tileSHA,rooms6,STARTtile[100,185]/world[4020,7420],gate3@y31/exit3@y33/exitcenter[100,33],path22/w30/authoredWidth1/초기RLE,rawhand105/CH2deco47/초기meta77,굴11/총900/지역[250,200,300,150],generationseed/소비11회/undefined_paths |
| 미관측 필드 | scope{runtime_bound:false,visual_verified:false,save_access:0,init_map_objects_executed:false};final_MAP_OBJS/effectivepositions/prop_colliders=NOT_OBSERVED. raw콜리전선언51/mega17와실제Collider수구분. 원undefined/absent/nullmask,JS빈배열truthy·키순서보존 |
| 순수 계약 API | read_area(raw:Variant)->Dictionary/validate_area(raw:Variant)->Dictionary. READY는value=동일snapshot참조/scope=source_snapshot_only/full_stage_ready=false. NOT_READY는reason/raw동일참조·최상위value없음. stage4외/길이/타입/순서/합계/해시/출처부족을거절. 입력수정·load/노드·RNG/clock·저장쓰기0 |
| Node 핵심검사 | 독립최신source AST와재추출대조. 전체tileSHA4e9659…/counts10722,28395,3,0,880;START/rooms/게이트metadata/code3=0. path중복포인트/105배치전체필드·순서/퇴역0·등록47·굴11좌표순서/900·분면250/200/300/150. 두번seed고정동일. timer를자연부트값으로단정금지. 손상단정음성검출·stage출력guard·원본/제품map/PNG불변 |
| Godot 핵심검사(후속만) | test_ch2_01_stage4_source.gd:JSON동일데이터·순서·참조·반복/입력불변. wrongstage/null/누락source SHA/tiles39999/굴중복·수량/지역합·rawhand순서손상은NOT_READY. Main/Worldinstantiate0. 최종collision/렌더없는dataREADY를full_stage_ready로바꾸지않음 |
| 격리 / 후속실행 | EXODUSER-ch2-01-Isolated-20261020. 향후Godot실행전사용자pgrep/wc>=2면30초대기. 실행마다override→finally0byte,원본4.7.2만. 명령:Godot --headless --path "$WT/godot" --script res://tests/test_ch2_01_stage4_source.gd. 이번문서작업에서는실행하지않음 |
| 회귀 / 완료경계 | 후속Node --test 신규+CH1stage0/1 source·자산검사,Godot순수CH1계약/일반test_contracts는기존격리상수준수. 변경없는runtimesuite수치재집계불필요. 공용접점/실제World변경0인source완료로만보고. 로비8/맵9선재실패원문보존. sourceSHA바뀌면그에맞춰기대값재관측,통과를위해원본값변경금지 |

### 4.2 2번 CH2-02 — si4 독립 World·동선/충돌·Godot 표현 인수

CH2-01과 CH1-04의 실제 소비자/맵 입력·리소스 수명 계약을 먼저 인수한다. 신규예정 `native_ch2_area_world.gd`, `native_ch2_area_resources.gd`, `ch2_area_preview.tscn`, `test_ch2_02_stage4_world.gd`에서명시snapshot입력을받고기존Main/world/hud/player는1차0줄. 이미있는CH2원화29개를전체재복사하지않으며새표현은Godot전략§8/MASTER LOCK에따라제작한다.

raw105의nearFloor·rotation/pivot·시각mega와51충돌후보를원문계약으로실효화하여START→전투공간→SIDE/DEADEND→EXIT동선·4모서리/strict경계·게이트접근을검수한다. 최종obj/collider수는이단계에서관측하고source raw수로대체하지않는다. zone/overlap은원본이runtime에미전달한다는사실을보존한다. CH1hill/64청크·stage0actor를복제하지않는다. region/spawn전투owner미인수면sourcepreview로만끝내고제품시뮬레이션READY를반환하지않는다. 시각판정은START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT8뷰와접합·로딩·충돌보존검수로별도수행한다.

### 4.3 3번 CH2-03 — si5 / 2-2 source와독립소비 (두작업으로분리)

source부터같은exporter를stage5로넓혀`ch2_map_source/si5.json`·`stage5_contract.gd`·stage별Node/Godot순수검사를추가한다. 첫범위는defaultfloor/SHA5b40…/hand미정의/굴11·900/지역250,300,250,100/보스점액괴수. 실제분모·목적지·스폰데이터가si4와다름을검사한다. 다음독립소비단위에서자동compose/벽눈/lore·breakable의실효배치·충돌을원문순서로관측한다. “점액동굴300²/50%감속”목표를자동구현하지않는다.

### 4.4 4번 CH2-04 — si6 / 2-3 source와독립소비 (분리)

신규si6.json/stage6_contract·전용검사. 기본지형같음/SHA5b40…,굴14·1100/분면250,300,350,200/기생충모체. 시각·충돌소비는검수된CH2독립World계약재사용. 문서의벽기생충트랩은맵/적authority추적전구현금지. 보스패턴은별도담당.

### 4.5 5번 CH2-05 — si7 / 2-4 source와독립소비 (분리)

신규si7.json/stage7_contract·전용검사. 기본지형같음/굴14·1100/분면250,300,350,200/거대알주머니. si6과같은합계여도굴좌표순서를복사하지않는다. 알prop파괴/구더기2~3스폰은인수된원본writer없으면미확인으로유지. 자동배치실효값은독립소비단계에서관측한다.

### 4.6 6번 CH2-06 — si8 / 2-5 source와독립소비 (분리)

신규si8.json/stage8_contract·전용검사. 기본지형같음/굴12·900/분면150,300,250,200/살벽의군주. 현재원본에없는350²horiz/맥박벽지형을새source로창작하지않는다. 직접Godot표현제작은별도LOCK/게이트에서게임플레이데이터보존검수와분리한다.

### 4.7 7번 CH2-07 — si9 / 2-6 source와독립소비 (분리)

신규si9.json/stage9_contract·전용검사. 기본지형같음/굴11·850/분면150,200,350,150/여왕구더기(isHellBoss=true). 필드와hell1공통128×108직사각arena를별도입력으로검사한다. “여왕의방300²grid/타원점액”목표를현원본으로위장하지않는다. 적·보스factory/공격담당에실제API인수요청,현재없으면미확인.

### 4.8 8번 CH2-08 — 제품6에리어진행·소환/지역·보스아레나연결 (반드시작게재배정)

각source/독립소비검수가끝난후실제G/P/World·스폰·적factory·지역·보스소유를총괄이인수해야한다. CH1-04후속제품전환과동일수명/정리계약재사용. (a)stage4진입및자원정리, (b)4분면·굴/kill·문지기, (c)보스입장/사망/출구, (d)4→5~9→10전환을별도단위로분리한다. main/world/hud/player/state를무단수정하거나P3stage0상수만바꾸어맵완료로처리금지. 새맵만있는데actor전투/보스상태를가짜READY로채우지않는다. 세이브/복원/스킵/로비/데모해제는별도소유·배정이다.

## 5. 공용 파일 접점 목록 (이번 각0줄)

| 파일 / 현재 지점 | 후속 접점 / 보호 |
| --- | --- |
| godot/tools/export_ch1_area_source.mjs (CH1-03 후보):30~94,101~149,157~190 | 같은source pipeline의stage/deco/compose·schema·출력guard확장. 현재main없음/CH1소유인수필수. 원함수재작성·우회도구복제금지 |
| godot/tools/export_world.mjs:1~15 / engine/fdg/map-source-adapter.js:140~173,486~501 | 승인stage0제품/Studio어댑터와CH2snapshot은다름. 무조건재출력/map.json교체금지 |
| godot/scripts/world.gd:22,905~954,1039,3127~3242 | 고정맵로딩/리소스게시·collision/is_world_blocked/can_move/props. stage별입력identity/지형교체·청크/Texture정리는World소유인수후 |
| godot/scripts/main.gd / native_source_new_run_state.gd | 실제현재G/P·scene부트/owner·초기화단일성·보스전환/보상·nextStage소유. 이번줄수0,맵배정으로권위획득했다고가정금지 |
| godot/scripts/native_spawn_hole_system.gd:37,214,333,435,476~518 | stage0소환굴owner/배치·RNG/actor등록·분모. stage4~9실스폰은적factory·실제writer인수후. 타담당처치보상/P2-006a파일읽기전용 |
| godot/scripts/native_regions.gd:59~118,143~159,243~261 / hud.gd | 기존4분면상태/kill귀속/게이트/지역표시·타이틀재사용. CH1앵글러마커를CH2에추가하지않음. 새HUD/분모writer중복금지 |
| godot/scripts/player.gd / 적·보스 actor/factory | 맵전환위치/바라보기/충돌·canMv·이동권위,etype39문지기/6보스. 전투수치/Q/E재작성금지 |
| godot/data/map.json / assets/map/ch2 / world메타·이미지 | stage0제품map불변. CH229source/Godotblob동일함을이유로실효맵완료주장금지. 원본원화/저장수정0 |
| game.html / maps_data.js / root환경JS / docs/4.1·1전체그래픽 | oracle·고정행/해시참조만. 게임플레이불일치표를기존SSOT자동수정으로해결하지않음 |
| SAVE/LOBBY·진행·오디오담당 | clearRecords·nextStage·장해금·재시작·BGM실제권위. 형식·사용자데이터·docs/2_3보호. 이번대상아님 |

## 6. 미확인·중단 경계와 제출 검수

- Godot실행0,브라우저/실창관람0,제품코드·원본·테스트·에셋수정0. 제품기능·PC반영·6에리어플레이가능·충돌종주·시각품질·성능완료는미확인이다.
- CH1-04원격결과미확인,CH1후보main통합미확인,CH2runtime소비자/권위인수미확인. source데이터·등록파일존재·176검산을그완료증거로삼지않는다.
- 맵표현직접제작정책은충돌·동선·스폰·지역원본보존을취소하지않는다. 반대로source원본그림을추적했다고Godot표현수단을고정하지않는다.
- 자기worktree는사용자지정--no-checkout후no-cone sparse로문자문서/원본JS/필요Godot텍스트만약29MiB배치. 대용량웹원화·엔진importcache배치0. R source/INDEX/branch/head는불변,fetch/ref와worktree관리메타데이터만사용했다.
- 커밋은이문서와CHANGELOG_SYNC맨위절만경로지정stage. 정상pre-commit우회0,mainpush/force/git add -A0. 자기브랜치push→원격SHA대조→L/DONE.txt→자기worktree제거,branch/원로그/최종문서사본유지. 최종SHA/검산수치·삭제여부는L의submission-receipt.json/cleanup-receipt.json에기록한다.

### MAP PRODUCTION REPORT — §23 / 추적 문서 단위

```text
STAGE: CH2 si4~9 / source trace and port design only
MASTER: si4 path22/role7/zone13·6에리어·4전투분면을분리. si5~9기본필드관측
OUTER MASS: si4 mega17의시각벽과tile충돌분리,새제작0/전체화면미검수
LARGE: 등록47/원화29·rawhand105,원본/Godotblob동일. 새에셋0
MEDIUM: backfill9/filler12/seam6,퇴역web제외. 실제접합·가림미검수
GROUND: 유기floor/halo/rim·stains10/veins6원본호출추적,Godot제작0
PLAYABLE: seed고정6맵40000tile/굴73/원본분모·지역추적. 종주/전투미실행
LANDMARK: rawlandmark18/mask4포함,실효위치/collider/높이NOT_OBSERVED
CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT미실행
TECH QA: Node정적/원문발췌VM176검산0차이,브라우저/Godot0,시각PASS주장0
FILES: 이새문서1개+CHANGELOG_SYNC최상단절만. 공용/타담당/제품0줄
GIT: latestmain기준자기branch비강제push,원격일치/DONE후자기WT제거
VISUAL VERDICT: 미확인 — 추적문서,런타임시각인수대상미제작/미실행
NEXT PASS: CH1추출도구소유인수후CH2-01의si4source snapshot/순수계약부터
```

### 문서 독자 검토

후속구현자가이문서만읽어도si4의정확원본·만들파일·선행계보·CLI/출력거부·핵심단정·미관측항목·권위중단지점을알수있도록§4.1에모았다. si5~9를옛설계대로새지형으로만들거나raw수를실효충돌수로오독하지않도록§1.2/§2에구체수치와범위를분리했다. 원본행과artifact값이바뀌면다음작업의최신main에서재추적한다.
