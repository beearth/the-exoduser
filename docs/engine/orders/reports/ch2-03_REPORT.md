# CH2-03 — si5 원본 snapshot·순수 계약

작업ID `ch2-03` / 브랜치 `codex/ch2-03-20261020`. **순서안 §4.3의 첫 단위인 source snapshot·읽기 전용 순수 계약 구현 및 기술 검수**다. §4.3은 source와 독립 소비를 두 작업으로 나눈다. 이번에 자동 compose/벽눈/lore/breakable·실효 충돌·독립 World를 새로 관측하거나 제품 Main/World/Player·스폰·지역·보스·전환을 연결하지 않았다. `full_stage_ready=false`, `visual_verified=false`를 유지하며 2-2 게임플레이·시각 인수를 뜻하지 않는다.

## 기준·작은 worktree·보호

| 항목 | 실제 기준 |
| --- | --- |
| fetch main / 분기 | 26c050a99a711e793a6c2413395acda09b0c1614, 사용자 최소26c050a99 조건 충족. 필요한 CH2-01/02·CH1 pipeline은 이미 main에 있어 별도 의존 병합0 |
| 작업 생성 | R에서 worktree add --no-checkout -b codex/ch2-03-20261020 ~/exoduser-wt/ch2-03 origin/main, 그 안에서 no-cone sparse set/check out |
| sparse | godot/engine/test/tools·관련 docs/원본 rootJS/JSON/HTML, 회귀 원본 CH1 PNG92·CH2 PNG29 및 필수 환경 JS만 선택. 웹 원본 assets 전체 checkout0 |
| 원본 | game.html 65,692행, SHA256 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4. 최신 fetch main과 동일 byte |
| R | /Users/fordeargamers/Projects/exoduser-migration-20261001, HEAD dd49171c5b88e211575a41f185395d6c0a14b184·기존 branch codex/mac-live-play-time-main-20261017·tracked INDEX/WORK 보존 |
| 원로그 L | ~/exoduser-wt/_out/ch2-03/; 시작/보호/원문 추출/실행 argv/stdout/stderr/override/결과·제출·정리 receipt 보존 |

기존 선정 tracked3147파일의 SHA 차이0이다. 승인된 공유 source exporter와 기존 CLI 음성검사2행 및 CHANGELOG는 별도 허용 범위로 대조한다. 공용 main/hud/world/player/native_normal_enemy_hurte/native_source_new_run_state·P2-006a·P3 소환굴/지역·Q/E·저장 형식·기존 CH1/CH2 data/producer·제품 map.json·원본 HTML/JS/PNG0줄이다. 원본 에셋은 byte/hash 참조만 하고 신규 bitmap·Godot 이송·재인코딩·새 렌더 표현0이다.

## 같은 source 파이프라인의 대상 한정 확장

| 경로 | 변경·계약 |
| --- | --- |
| godot/tools/export_ch1_area_source.mjs |30행 추가/18행 삭제. 지원stage5·CH2 분류/파일 범위·absent compose 포착·원 STG5 기술 데이터·해당 CLI guard만 확장. 기존 observer/원 함수/0·1·4 결과 의미 보존 |
| test/fdgCh2Stage4Source.test.mjs |2행 추가/2행 삭제. 이제 지원하는5를 기존 unsupported-stage 검사2곳에서 미지원10으로 대체. 기존 stage4 값·기대 데이터·cross-stage 덮어쓰기 거부 검사 무수정 |
| godot/data/ch2_map_source/si5.json |111604byte, SHA256 18bdcdbbe1ec4060fcdb10c00e7c0c9c95c2a2f5e78564efb67456145e6af246. schema exoduser.ch2-area-source.v1/stage5 |
| godot/port_modules/ch2_map_source/stage5_contract.gd |read_area/validate_area 순수 API. 기존 stage4의 CH2 catalog/meta/assets/files/rooms/chapters pin과 CH1 scalar/hash helper 재사용, 새stage5만의 값·출처·타일·굴/timer/분모·부재 mask 검사 |
| 신규 검사 |test/fdgCh2Stage5Source.test.mjs, godot/tests/test_ch2_03_stage5_source.gd와 엔진 생성 UID2. 소유 밖 자동 생성 sidecar는 L로 보존 후 제출 제외 |

공유 수정은 CH1-02 조건대로 원문 파이프라인 재추출·대상 필드 한정·맵/지역/소환굴 회귀를 적용한다. 신규 Node가 변경 전 `26c050a99:export_ch1_area_source.mjs`를 임시 UTF-8 module로 읽고 stage0/1/4 전체 결과를 깊은 비교해 내용 차이0을 확인했다. source provenance는 기록된 두 커밋의 game bytes SHA 동일성을 먼저 검사하고 main/extraction HEAD 필드만 정규화한다. stage0에 원래 없는 extraction_head를 만들지 않는다. 기존 artifact의 출처는 고쳐 쓰지 않는다.

si5 `_MAP_COMPOSE` 엔트리는 원래 없다. 실제 전체 부모 AST의 행/SHA를 `_MAP_COMPOSE.absent.5`로 기록하고, 기존 stage-local table projection에 해당 키를 넣지 않는다. `{5:{}}`나 빈 hand 배열을 원본으로 만들지 않는다. 원 selector/_cloneField11/genFromTemplate/START/_regionInit 함수 본문은 그대로 실행하며, 선택된 entry 없음 때문에 기본 `[1,40000]` floor·native jitter가 적용된다. helper에 allowAbsent를 켜는 것은 stage5뿐이고 다른 미지원 stage를 넓히지 않는다.

원 hand/path/empty/compose의 undefined는 JSON null carrier와 `undefined_paths=[/hand_props_raw,/source_path/spec,/source_path/empty,/compose_raw]`를 함께 보존한다. 이는 원래 JSON null 또는 빈 배열과 다르다. Godot 계약은 carrier/mask/키 집합·타입·순서를 검사하며 다른 의미로 수리하지 않는다.

## 최신 원문 행·관측 값

| game.html 행 / 원문 | 실제 관측 |
| --- | --- |
|14333,16633–16713 |원 EL/CHAPTER_STAGES/HELL_THEMES/HELL_BOSSES/STG construction 실행. si5 WORM NEST·벌레굴2구역·점액 괴수·monLv200·hell1/hellFloor1/chapter1·isHellBoss=false. 보스 actor/패턴 실행은 아님 |
|18118–18207 |전체 _MAP_COMPOSE 부모 AST의 key0/1/2/3/4/10/11/12/13, key5 부재 확인. CH2S4 hand105·path22를 복사하지 않음 |
|29556–29559,30042–30085 |FIXED_MAPS[0] clone/200²/T40, 원 mkRng(5*7919+17) 지터·clamp18..182. source-path spec/empty 없음, 초기 floorRLE[1,40000] |
|30218–30694 |원 generator 후 tile40000,0/1/2/3/4=38986/36/3/0/975. tile byte SHA5b40eb67c1aa3fd6ad407f9af06db91f549456bcd9c7d91ed31265c5a3a3b87e |
|30335–30442,31564–31566 |rooms6, STARTtile[100,185]/world[4020,7420], gate metadata x99..101/y5·exit3개 y7·center[100,7] (world4020/300). gate metadata가 있어도 code3타일0. si4의 y31/33과 구분 |
|30486–30626,31029–31030 |최종굴11/총900. stage0 할인/분모168 또는 si4 좌표 목록 복사0. 원 수량·순서·room/count·alive0·timer 유지 |
|60697–60718 |native _regionInit 분모 NW250/NE300/SW250/SE100. si4의250/200/300/150과 다름. 실제 지역 owner writer 설치0 |
|17638–17692,18392–18426 |CH2 raw catalog47/기초 meta77·원화29개/참조47/출처files31 동일. 기존 stage4 pin 재사용. initMapObjects 실행0이라 최종 객체·실효 충돌 NOT_OBSERVED |

seed20261020의 generator Math.random은 **12회**, final state3458361656이다. 최종11굴의 timer draw index는 `[1,2,3,4,5,6,7,9,10,11,12]`다. 독립 원 mkRng 검사에서 jitter된 수동 후보9개 중 하나가500px 간격 조건으로 timer 배정 전에 거절됨을 확인했다. 받아들인8번째 후보(draw8)는 주변 floor0가30칸 미만인 native 유효성 검사에서 최종 탈락한다. 굴 timer를11번 연속 난수로 재구성하지 않았다. 순수 계약은 선언 seed와 draw12의 산술만 재현하고 실제 RNG/clock을 진전시키지 않는다. 자연 브라우저 부트 timer 실측으로 확대하지 않는다.

READY는 `value=원 raw 동일 참조`, source_snapshot_only·source_only_stage5·runtime_bound/full_stage_ready/visual_verified=false다. NOT_READY는 reason/raw 동일 참조를 반환하고 최상위 value가 없다. runtime·실효 객체·컬라이더 NOT_OBSERVED를 빈 배열 READY로 바꾸지 않는다. 원문 title/보스명은 데이터 증거이며 실제 보스 생성·공격·문지기·출구 상호작용 연결은 미확인이다.

CLI: `node godot/tools/export_ch1_area_source.mjs <explicit-root> <explicit-json> --stage 5 --seed 20261020`. root 내에서는 ch2_map_source/si5.json만 허용하며, 기존 파일은 같은 schema/stage5만 덮어쓴다. stage4↔5 교차 덮어쓰기·제품map/다른stage·symlink조상·foreign schema·이상 stage/seed를 쓰기 전에 거부한다. Node 하니스는 node 실행 경로를 외부 인자로 받고 subprocess argv 배열을 사용한다. 출력은 UTF-8 파일 또는 join된 문자열이며 고정 OS node 경로를 제품/하니스 코드에 박지 않았다.

## 실제 검사·원로그

매 Godot 직전 지정 pgrep/wc를 L/process-gate.jsonl에 기록하고2이상이면30초 대기했다. 타 Godot 종료0·자기 엔진 순차 실행이다. 기존4.7.2와 자기 이전IT-05 cache의 새 APFS clone을 사용하며 원cache 쓰기0이다. 새 격리 EXODUSER-ch2-03-Isolated-20261020, 기존 회귀는 각 파일 상수의 격리명을 유지했다. override를 실행마다 작성하고 finally0byte로 비웠다.

| L prefix | 실제 결과 | 범위 |
| --- | --- | --- |
| extract |exit0 |원 snapshot111604byte. 원문/기존제품/PNG 변경0 |
| new-node-verified |10통과/0실패/0SKIP·exit0 |최종 Node. 원 AST·STG/부재·전체tile·jitter/간격/제거timer·byte·이전0/1/4 깊은 비교·CLI 거부 |
| new-godot |344단정/0실패·exit0·stderr0·ERROR0 |순수 API/동일참조/전체필드·tile·굴·출처·asset 오염 음성검사, 실제 global RNG 다음값 동일. Main0/World0/save0 |
| source-node |29통과/0실패·exit0 |기존 CH2-01 11·CH1-01/03 각9 |
| ch2-world-node |7통과/0실패·exit0 |기존 CH2-02 resource/충돌/observer/원화byte 전부 검증 |
| asset-node / pit-node |각6통과/0실패·exit0 |기존92PNG 재추출/8필드·map/기하·pit/collider 계약 |
| map-node |37건중28통과/9실패·exit1 |CH2-02 raw stdout의 실패9개 전체 이름/순서 동일. 기존culling1·adapter pending2·Image없는 regionVM6, 새실패0 |
| ch2-source-godot |362/0·exit0 |기존 CH2-01 순수 계약, stderr0·ERROR0 |
| ch1-source/stage1-godot |63/0·75/0·각exit0 |기존 CH1-01/03 순수 계약, stderr0·ERROR0 |
| ch1-environment-godot |189/0·exit0 |기존 CH1-02 실제 정적 World, ERROR0 |
| ch2-world-godot |894/0·exit0 |기존 si4 World·40000물리센터/union·isW/canMv10998각/LOS400 mismatch0, ERROR0 |
| contracts-godot |5그룹/실패단정0·exit0 |기존 전체계약·기본 실행상한 유지, stderr0·ERROR0 |
| spawn-godot |6그룹298/0·SKIP0·exit0 |실제 GUI renderer, ERROR0 |
| regions-godot |43/0·exit0 |실제 GUI renderer, ERROR0 |

신규·기존 모든 Godot 실행의 SCRIPT ERROR/ERROR는0이다. 기존 Camera2D interpolation 경고와 P3002 ObjectDB8 누수 경고는 원 stderr에 남겼다. P3002 actors_registered10/unported_spawns158·P3003 full_fieldboss_combat=false·CH1-02 source-image 등록4개 NOT_READY도 바꾸지 않았다. stage4 World 회귀 oracle은 buildResources 결과 중 queries/LOS만 외부 JSON에 UTF-8으로 썼으며 기존 pin resource manifest를 재출력하지 않았다.

신규 최초 Node는8통과/2실패, 두 번째는9통과/1실패였다. 신규 비교 helper가 stage0에 원래 없는 extraction_head를 Git ref로 읽은 문제와, jitter 수동 후보를 native500px 간격 검사 전 상태로 최종굴에 비교한 검사 가정이 원인이었다. stage0 부재 필드 처리와 원 간격/주변 바닥 조건을 검사에 반영했고 제품 원문·관측 snapshot 값은 바꾸지 않았다. L/new-node·new-node-final 로그를 그대로 보존하고 최종 new-node-verified10/0만 결과로 센다. 초기 map-failure 비교 parser는 과거 receipt의 괄호가 생략된 이름과 비교해 불일치했으나, 양쪽 raw stdout의 전체 이름으로 다시 비교해 동일함을 기록했다.

보호 원문·기존3147파일은 모두 같은 SHA다. 사용자 전달 선재 원문 “로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)”는 이번 재실행/수정 없이 기록만 한다. 시각/FPS/PC/자연전투 검수는 새 단위에서 수행하지 않았다. stage4 World 회귀를 si5 플레이 가능 증거로 사용하지 않는다.

## MAP PRODUCTION REPORT — §23

```text
STAGE: CH2-03 / si5 source snapshot + pure contract only
MASTER: 원본 defaultfloor/굴11·900/4분면250·300·250·100·목적지y7 보존
OUTER MASS: 새로운 질량/경계/충돌 제작0, 원 자동배치 소비 미관측
LARGE: CH2 기존47참조/29PNG byte 참조만, 원화편집·Godot표현 추가0
MEDIUM: compose5/hand/path undefined 보존, si4 접합부/대형prop 복제0
GROUND: 원 초기floor RLE와최종40000tile 별도, 시각바닥·조명 제작0
PLAYABLE: source/순수 계약만. Main/World/실P/굴·지역·적·보스/전환 미연결
LANDMARK: 최종 lore/breakable/벽눈·실효충돌 NOT_OBSERVED
CAMERA QA: si5 신규8뷰 미실행. source 단위로 시각 인수 주장0
TECH QA: Node10/0·Godot344/0, 기존맵/원화/순수/지역/굴 회귀 기록
         브라우저 pageerror/404·GPU시각/FPS·PC는미확인
FILES: 공유exporter stage5 대상확장·기존CLI음성2행, 신규data/contract/tests/UID2/docs
       공용6/P2-006a/P3/기존map/원본/PNG0줄
GIT: 자기branch 정상commit/push, 원격일치/DONE뒤 자기WT/cache제거. 배포0
VISUAL VERDICT: FAIL — si5 시각 검수 미실행. 관측된 화면 결함 판정은 아님
NEXT PASS: 별도 si5 독립소비 배정에서 자동compose/벽눈/lore/breakable·실효충돌 관측
           Main/공용 연결은 소유권·통합권위 인수 없이 구현하지 않음
```

자기branch만 정상 push하고 원격 SHA를 읽어 일치 확인 후 L/DONE.txt·submission-receipt.json에 실제 branch/SHA/수치를 쓴다. 자기 sparse worktree·임시 cache만 제거하며 branch·원로그·snapshot/계약/보고서 사본을 L/review에 남긴다. 실제 R 보존과 제거 결과는 cleanup-receipt.json에 기록한다. main push·force·git add -A·hook 우회0이다. 후속 독립 소비/CH2-04는 이번에 착수하지 않는다.
