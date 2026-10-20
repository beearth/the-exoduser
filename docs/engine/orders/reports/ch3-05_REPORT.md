# CH3-05 — si13 / 3-4 원본·독립 소비자

## 1. 결과·의존·검수 경계

si13 원본 snapshot·순수 계약·독립 fixture 소비자 구현. **기능 검증 완료, 시각 판정 RETOUCH.** 제품 World·Main·State·실제 Player/적·보스·굴/지역 진행/저장/전환 연결0, full_stage_ready=false다. 봉인괴수 시각 prop는 실제 보스 actor가 아니다. 별도 아레나는 원문 생성/출구 geometry 검증만 하며 실제 보스 처치/아레나 진입을 수행하지 않는다.

| 항목 | 실제 값 |
|---|---|
| 작업 / branch | ch3-05 / codex/ch3-05-20261020 |
| 고정 의존 / 분기 | CH3-04 **36d3f123c7d154438e86bcac6e1810380bc53313** 끝에서 분기. CH3-03 provenance 수정9af85131cf343db82a5367d391e1d6934a4fa9aa 포함 |
| fetch main | 56c939fb010cb29d8ff262442339e11a68634817. 이후 공유 origin/main ref가 전진했으나 game bytes 동일. 최신main 일괄merge는 사용자 지정 후속 통합에 남김, 이번 merge/rebase0 |
| 원본 | 최신 main과 동일한 game.html 65692행 / SHA256 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4 |
| source JSON | 180056 byte / e539a33172a4738cb8f0aaa0456984872f4a910a419f859049f6dbca5c2e95c1 |
| resource JSON | RE180056 byte / REe539a33172a4738cb8f0aaa0456984872f4a910a419f859049f6dbca5c2e95c1 |
| artifact 출처 | source.main_sha=3886513f591bbff642a7a8cf622ccbbcbc6cc6f9 / extraction_head=36d3f123c7d154438e86bcac6e1810380bc53313. 원문 내용 검증 뒤 출처 차이만 검사에서 정규화, artifact 출처 덮어쓰기0 |
| 참고 / 원로그 | CH3 추적 §4.5·CH3-04·CH2-04 파이프라인·MAP-LOOK/제작 GUIDE v0.9. ~/exoduser-wt/_out/ch3-05/ |

CH3-04의 provenance 결함은 이미 선행 수정된 상태다. 이번 관련 source-node는 **79/0**(기존72+si12독립7), 신규 si13은 **8/0**이다. main6d의 CH3 test 부재와 map9 선재 실패를 혼동하지 않는다.

## 2. 파일·파이프라인·공용 변경

| 신규 경로 | 역할 |
|---|---|
| godot/tools/export_ch3_stage13_source.mjs | 기존 admitted VM observer를 재사용하는 단계 전용 adapter. stage11은 원 선언/함수 bootstrap만 공급, target G/P/MAP_OBJS/exit·전용 관측 RNG 초기화 후 원 _ICE13/compose13/selector/gen/START/regionInit 실행. 별도 arena 원문도 관측 |
| godot/tools/export_ch3_stage13_resources.mjs | 같은 target VM을 이어 원 metadata merge/occ-foot/initMapObjects/원 충돌 함수 관측. 기존 rectangle helper 읽기 재사용 |
| godot/data/ch3_map_source/si13.json / si13_resources.json | 전필드·40000 타일·raw/실효배치·굴/지역·자산 bytes·f64 collider·별도 아레나 before/after 증거 |
| godot/port_modules/ch3_map_source/stage13_contract.gd (+UID) | read_area/validate_area 순수 API. 같은 CH3 meta/catalog/rooms·CH1 scalar/hash 재사용. null+undefined mask·출처 pin·전데이터·13draw/12timer·별도 arena 엄격 검증 |
| godot/scripts/native_ch3_stage13_area_resources.gd (+UID) | readonly source 계약·manifest SHA·전체 bundle·원 texture bytes/size 검증 |
| godot/scripts/native_ch3_stage13_area_world.gd (+UID) | CH3-02 fixture subclass로 analytic collision/index·props·tile Physics·BFS/swept 이동 재사용. 자신만의 ready/defaultfloor/표시광, 제품 World 인스턴스0 |
| godot/scenes/ch3_stage13_area_preview.tscn | 지정 격리에서만 설치하는 standalone scene |
| test/fdgCh3Stage13World.test.mjs | 8검사: 원문/독립 native reference·byte/render metadata·query/f64·output guard·공유 불변·별도 원문 arena |
| godot/tests/test_ch3_05_stage13_source.gd / test_ch3_05_stage13_world.gd (+UID2) | 순수 오염/seed·실제 fixture/Physics/query/8뷰/왕복 검증 |

**기존 공용 도구 `export_ch1_area_source.mjs` 0추가/0삭제, `export_ch2_area_resources.mjs` 0추가/0삭제.** 기타 기존 source/resource 도구·Main·world·State·공용6·P3·다른 담당 파일도0줄이다. 신규 si13 파일16개와 보고서/CHANGELOG2개만 제출한다. 원본 bitmap 생성·변환·재인코딩·제품 자산 복사0, 기존 Godot 참조의 byte 일치만 확인한다.

독립 native reference는 고정8366ba8d의 공유 도구를 UTF-8 임시 module로 읽어 admission/선택 expression 인덱스만 si13으로 바꿔 **bootstrap 없이 원 si13을 처음부터 실행**한다. 원 game 함수/입력/기대값은 수정하지 않는다. 필드 결과 전수 및 별도 resource reference의 bundle/isW·canMv6870각/LOS400 차이0이다. source.pipeline은 bootstrap11/target13·target reset·bootstrap 결과의 target 전용0/shared0을 명시한다.

아레나 검증은 원 genBossArena(13)를 같은 VM에서 호출하고 before를 capture, G를 임시 arena geometry carrier로 바꿔 원 exit geometry branch만 실행한 뒤 **finally 원 field G 복원**이다. cache/VFX/kill/factory/실제 전환을 stub 호출로 꾸미지 않는다. 별도 fresh VM에서도 원 함수/원 exit branch를 독립 실행해 결과를 비교한다. fixture는 여전히 200² 필드를 소비한다.

Node 경로는 하니스 --node-bin 인자, stdout/stderr 및 증거 JSON은 UTF-8 임시/외부 파일이다. 새 Godot는 명시 --alternate/--oracle를 읽으며 OS.execute 출력 첫 조각 사용0이다. 모든 Godot argv에 --node-bin을 넘긴다. writer는 자기 si13 JSON만, 외부 oracle만 허용하며 다른 stage/공용·foreign schema·symlink/조상 junction은 쓰기 전 거절한다.

## 3. 최신 main 원문 계약·추적

G는 위 동일 game SHA의 행이다. source.symbols에 정확 범위·SHA를 기록했다.

| 원문 / 위치 | 실제 입력·결과 |
|---|---|
| G17813–17814,17964–17968 /18206 | _ICE13 raw20=고정 군집10+원 local seeded 장식10. scale 부재11/rot 부재20, catalog61/base77/cross0. 고목114,156→성소86,100→봉인괴수108,46. 부재 키 보충0 |
| G16668–16676,30042–30085,30135–30147 | dungeon spec 자체 부재(null carrier+undefined_paths /selector_evidence/dungeon_spec), is_dungeon/face=false. 기본200²/T40/editorRLE[1,40000]. si10 basin·CH2 path 복사0 |
| G30218–30694 /31564–31566 | tile0/1/2/3/4=38986/36/3/0/975, SHA5b40eb67c1aa3fd6ad407f9af06db91f549456bcd9c7d91ed31265c5a3a3b87e. START4020,7420→EXIT4020,300. gate metadata3@y5(tile0), exit3@y7(tile2) |
| G16697–16713 /31617–31620 | STG13 지옥의 겨울4구역·얼음 속 봉인 괴물·be2/monLv300/hell2/hellFloor3/chapter2/**isHellBoss=true**. 문지기 후보100,8 tile4·요구0 거절 입력, mkEn 실제 실행0 |
| G30486–30626,31029–31030,60697–60718 | 최종12굴/950, NW150/NE300/SW350/SE150 모두cleared=false/fbIdx-1. 관측 RNG13draw/final2962398007, 남은 timer 인덱스0..7,9..12(0기준). 유효성 제거 굴의 draw도 보존, 12번 연속 난수로 재작성하지 않음 |
| G18486,18501–18504,25735–26472 | 원 metadata merge/occ-foot/initMapObjects. 최종21=hand20+비가시 gate1, hand 이동/생략0, altar/lore0. init RNG 추가1회 |
| G31685–31687,31711–31712,31672–31681 | analytic9=원9/타원0/rect0(gate 포함). f64 strict </JS truncation/반경4모서리·LOS16px 유지, prop Physics 노드가 아님 |
| tile Physics / 원 자산 | tile1 36개/4 rectangles. catalog61참조/35 원파일+ground1, 실제 texture12. 원 sprite keepAR/scale/pivot/rotation/flip/alpha·crop 유무 보존, 현 hand crop0 |
| G30697–30747 | **별도128×108 십자형** 원 arena. entry64,103/boss64,54/exit64,1. before13824 tile·SHAeb4fcbd7b527d2efb2ed36c7b80251d26fca10d7178dc0edbe031887e1da8033. entry/boss 룬 경계 포함 원 함수 전수 |
| G41841–41850 | before exit x63..65/y1 벽1 → isolated opening 후0, 변경3칸만. center exit 메타1개. after SHAff053d6379f81d2337b6377da1c94b23ed663f157131ab69b017570ee630a354. 실제 boss death/owner 진입 미실행 |

순수 계약은 IO/RNG/clock/Node/State를 사용하지 않고 입력 동일참조 READY를 돌려준다. 오염은 value 없는 NOT_READY/reason/raw다. main/extraction은 hex40 형식, 원 game/files/symbols·전체 내용은 exact pin, 해당 기록 commit의 실제 game bytes 검증은 Node 책임이다. source 조건 미충족을 임의 수리하거나 고정 live ref만으로 alternate seed를 거절하지 않는다.

| docs 대조 | 원문/이번 처리 |
|---|---|
| MASTER BIBLE의300² Grid/봉인의 방 | 현 원200² 필드 + 별도128×108 십자 아레나와 불일치. 이번 계약을 옛 규격으로 변경0 |
| MAP BIBLE·보스 명칭/Canonical Mapping | 장보스명/si13은 일치, 시각 prop와 actor readiness는 구분 |
| 맵오브젝트_에셋목록 stage13 raw20/8·군집 좌표 | 실제 hand20·visible col props8 + hidden gate1=총9. 원 고목/성소/봉인괴수 앵커 일치 |
| FEATURE INVENTORY MAP-13/BOSS-13 제품 consumer 없음 | 이번은 독립 source/fixture만. 제품 World/factory 미연결 상태 유지, 이 문서가 제품 플레이 가능 주장으로 대체하지 않음 |

## 4. 실제 검사·실패·경고

| 검사 | 실제 결과 |
|---|---|
| stage13-node-final | **8/0**, SKIP0·exit0 |
| source-node | **79/0**, SKIP0·exit0(기존72+si12 7) |
| map-node / map-main6d | **각37중28통과/9실패**, exit1. 이번에도 main6d lightweight archive 대조군 직접 재실행, 실패 이름/순서9개 동일 |
| source-godot | **411/0**, exit0·stderr0·ERROR0. 전필드/arena 오염·순수 API·동일 참조·global RNG 불변·실제 seed0/max 증거 |
| camera8 | 실제 GUI Apple M5 Pro / OpenGL3, **809/0**·ERROR0. texture12·tile Physics40000·질의·route·8뷰+OFF1 |
| 기존 순수 / 정적 Godot | CH1-01 63/0·CH1-02 189/0·CH1-03 75/0·CH2-01 362/0·CH3-01 641/0·CH3-03 385/0·CH3-04 source393/0 |
| 기존 독립 World | CH3-02 2713/0·CH3-04 448/0. 각각 source isW/canMv16806·6774각/LOS400 차이0, tile union/Physics40000 차이0 |
| contracts / GUI 굴·지역 | contracts5그룹/실패0, P3002 298/0·SKIP0, P3003 43/0 |
| 기존 Godot 합계 | 5610단정/0실패 + contracts5그룹. 신규411+809와 분리, 중복합산0 |

map9는 culling1·adapter pending2·Image 없는 region VM6이며 CH3 provenance 결함과 구분한다. 원문 stdout/stderr·map-*.failures.json을 보존했다. 신규 Node 최초7/1은 독립 arena 하니스에서 SI_TO_HELL 선언 의존 TOTAL_STAGES를 빠뜨린 검사 오류였다. 원 stage-index 선언 블록/상수들을 실행해8/0이 됐고 제품/원본문체/기대값 수정0이다. 사용자 제공 로비8실패는 별도 이력으로 실행/수정0이다.

기존 Camera2D interpolation 경고와 P3002 ObjectDB8 종료 누수 경고는 그대로 남았다. GPU 신규 stderr337byte는 Camera2D 경고이며 SCRIPT ERROR/ERROR0이다. P3002 actor10/unported158·P3003 full_fieldboss_combat=false/kill hook·굴 finalization 미연결·CH1-02 source-image4 NOT_READY도 유지했다. 신규 원문 계층 검사에 가짜 PASS·dummy 보스/전투 삽입0이다.

## 5. 8뷰·1x 크롭·시각 판정

captures/에 START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT **각1920×1080**과 ARENA_LOOK_OFF를 저장했다. START320²·LANDMARK400×440·LATE400×440·EXIT400×320의 **1x 크롭4개**는 원 화면 pixel crop이며 resize=false다. 9개 원화면과4개 크롭을 모두 직접 확인했다. 좌표/크기/원본·크롭 SHA는 capture-crops.json에 기록했으며 QA PNG는 Git 밖에만 둔다. ARENA라는 카메라 이름은 field 중앙 비교 지점이고 별도 boss arena가 아니다.

| view 중심 tile | 실제 관측 |
|---|---|
| START100,185 +1x | 반복 바닥만 넓게 보임. 전진 방향·공간 위계·환경 mass 부족, RETOUCH |
| EARLY114,156 | 원 tree·crystals·debris·장식. 밝은 청색 소품과 검은 반복바닥의 톤 차이·접지/군집 연결 부족 |
| ARENA100,100 | 서편 원 ritual 원판과 sealshrine·cage가 왼쪽에 읽힘. 오른쪽 넓은 빈 면, 군집이 독립 스티커처럼 보임 |
| SIDE_L81,90 | cage 주위 보라색 테두리·지면 접합과 성소 일부 화면 밖 잘림 확인. 완성된 외곽 mass 아님 |
| SIDE_R118,164 | tree/debris 주위의 성긴 배치·반복 바닥. 소품 간 시각적 연결 부족 |
| LANDMARK86,100 +1x | sealshrine와 ritual 원판의 원래 중첩·pivot 확인. 지면 요철/접지와 밝은 청색 톤·원판의 경계 보완 필요 |
| LATE108,46 +1x | 봉인괴수 실루엣과 원 frozen cell 내부 괴수는 읽힘. 검은/보라 경계·밑동 접지·주변 군집 빈 면 보완. 실제 보스 actor/AI 미실행 |
| EXIT100,7 +1x | 북쪽 world 밖 검은 공백, 목적지 fixture3칸/diamond. 제품 portal/문 연출·전환 아님 |
| ARENA_LOOK_OFF | ambient/부분광/contact shadow ON/OFF 차이 확인. 전체 shader 제거·실제 전투 광원/성능 검사로 확대0 |

표시는 원 ground PNG를 world8k repeat mesh/기존 lit shader(bump2.8)에 참조하고 ambient(.48,.5,.54)·부분광4(이동 fixture1+실제 tree/sealshrine/sealbeast3)·contact shadow8을 설치했다. 메모리 GradientTexture2D는 표시용 마스크이며 원본 bitmap 생성/변환이 아니다. 원 sprite/앵커/콜리더/스폰을 변경해 표현 문제를 숨기지 않았다. source CSS/filter/edge pixel parity=false다.

실제 차등 검증은 **isW6870/canMv6870/LOS400 차이0/0/0**, tile union/실제 Physics center40000 차이0이다. JSON numeric carrier와 다른884개 좌표 입력은 원 IEEE754 f64 LE로 비교했다. 반경12 BFS179점·4px swept fixture로 START→EXIT 및 왕복358점 통과, 제품 전환0이다. 카메라만 옮긴 각 촬영점에 실제 Player가 종주한 것으로 보고하지 않는다. 짧은 fixture sweep90frame/375.976ms는 combat FPS·게임 성능 인수 근거가 아니다.

**VISUAL VERDICT: RETOUCH.** 반복 지면·성긴 군집·톤/테두리·접지·북쪽 경계·실제 collision 기둥의 시각 가독성은 표현 후속 검수가 필요하다. 원문/독립 기능 인수와 제품 gameplay·PoE2/No Rest급 환경 완성 판정은 분리한다.

## 6. 보호·실행·제출

- --no-checkout+sparse로 필요한 경로만 materialize, 최초 index=HEAD tree 확인. 최초2615 tracked 중 CHANGELOG 외2614개는 byte 동일, 기존 변경은 CHANGELOG 맨 위 절뿐이다. 보호 검사는 docs 변경 전2615개 전부 동일도 확인했다. 최신main merge/force/reset/rebase/main push0.
- Godot 매 실행 지정 pgrep/wc, count2이상30초 대기. 각 파일 상수 격리·신규 EXODUSER-ch3-05-Isolated-20261020, override 매회 작성/finally0byte. 타 Godot 종료0.
- APFS private Godot cache 사본·R node_modules 읽기 symlink만 사용. Godot 자동 sidecar228개는 OUT/generated-sidecars로 옮겨 자기 UID5만 제출했다. 빈 override/자기 node_modules symlink도 제거했다.
- docs 전체 키워드 검색은 docs-search.log. 명시 경로 stage·정상 docs-sync/pre-commit·whitespace 검사 후 자기branch 정상 push/원격 SHA 일치→DONE→자기WT 제거. 원로그/보고서 사본/branch는 보존, 실제 제출·정리는 submission.json/DONE.txt가 근거다.

## MAP PRODUCTION REPORT — GUIDE §23

```text
STAGE: CH3-05 / si13 standalone source consumer, 제품 World/Main/State 미연결
MASTER: 원 default200 field·원20 hand·12굴950·지역150/300/350/150
        START4020/7420 → EXIT4020/300, 새 route/빙판/절벽 설계0
OUTER MASS: 원 군집/입력 보존, 성긴 지면/북쪽 경계·기둥 시각 대응 미인수
LARGE: 원 tree/sealshrine/sealbeast byte 참조, 새 composite/배치 수리0
MEDIUM: sprite20·원 pivot/scale/layer·contact shadow8, 접지/연결 RETOUCH
GROUND: 원 defaultfloor repeat·기존 lit shader·광원4, gameplay 타일 불변
PLAYABLE: radius12 fixture179점/왕복358, Player·적/보스/굴/지역/전환 미연결
LANDMARK: 고목114/156 → 성소86/100 → 봉인괴수108/46
          별도 arena128x108/3폭출구는 원문 geometry 검증만, 제품 설치0
CAMERA QA: 8뷰1920x1080+OFF1+1x크롭4 직접 확인, RETOUCH
TECH QA: Node8/0·순수Godot411/0·GPU809/0, query6870각/LOS400·Physics40000 차이0
         기존 source79/0·map9는 이번 main6d 대조군 동일, 기존Godot5610/0+contracts5
         native12 texture/ERROR0·시각seam RETOUCH·웹pageerror/404 해당없음/미실행
         fixture sweep은 combat FPS/실게임 성능 완료 주장이 아님
FILES: si13 신규16+docs2, shared source/resource·World/Main/State/타담당0
GIT: CH3-04 36d3f123 의존·자기branch 정상push/SHA/DONE 후 자기WT 제거
VISUAL VERDICT: RETOUCH
NEXT PASS: 총괄 원격/화면 인수 및 사용자 지정 최신main 일괄merge 후 재검증
           CH3-06 Main/State/전투·아레나 통합은 소유자 인수 전 HOLD, 착수0
```
