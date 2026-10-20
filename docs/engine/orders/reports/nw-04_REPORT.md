# NW-04 — 상자·잔해 보상 제안과 공통 월드 반입 계산

상태: 독립 proposal 구현·원문 대조 검수. 실제 전투·Main·State·가방 연결 없음. 다음 NW-05는 공용 owner 접점이 필요해 BLOCKED로 보고하고 착수하지 않는다.

## 기준·소유 범위

- 작업ID nw-04, branch codex/nw-04-20261020.
- fetch 후 최신 origin/main 26c050a99a711e793a6c2413395acda09b0c1614에서 분기했다. 요구 하한 26c050a99 이상이다.
- NW-01 d9865e4c, NW-02 2cc27d09, NW-03 07883981 모두 위 main의 ancestor다. 미병합 선행 branch 의존 없음. WORK_BOARD 91–93행의 main 병합 기록도 확인했다.
- --no-checkout worktree add → sparse-checkout --no-cone → read-tree -mu HEAD로 godot, engine docs, game.html, 자기 oracle 및 docs-sync 도구만 받았다. 웹 이미지·오디오 원본 전체 폴더는 받지 않았다.
- 신규 world_reward_proposal/producer.gd·admission.gd, 신규 test_native_world_reward_proposal.gd, 자기 oracle, 자기 UID3개, 이 보고서와 CHANGELOG_SYNC 최상단 절만 제출한다.
- 공용6파일·기존 제품/테스트·타 담당·P2-006 표시/줍기·생성기·저장 형식·원본 변경 0줄. R의 HEAD/branch/INDEX/WORK 보존. main push·force·add -A·훅 우회 없음.

## 최신 main 원본 근거

game.html 전체 65,692행, SHA256 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4. oracle은 이 전체 hash와 고유 마커·발췌 hash를 검사하고 원문 body를 그대로 Node VM에서 실행한다.

| 원본 위치 | 구현·검증한 규칙 |
|---|---|
| G32825–32827 | caller의 pressed/portal_used bool gate. 입력·레슨 allows·pause·epoch를 이 모듈이 소비하지 않음 |
| G32829–32855 | MAP_OBJS 성공 break는 그 루프만 끝냄. 아래 chest 검사를 막는 새 gate를 만들지 않음 |
| G32855–32880 | 첫 미수거·미개봉 chest의 strict 거리<60. 열린 flag가 보상보다 먼저. 선택 배열순이며 최근접 아님. chest가 debris보다 우선 |
| G32865–32872 | 3+~~(U*3)개, 17슬롯 전체(ossuary·headband2 포함), element0–5, tier0. stage 보정·등급 strict 분기·mkItem→좌표 U2→_wiPush 순서 |
| G32875–32878 | mats +=5+~~(stage*2), addPotion(hp,2), 반환 true일 때만 상자 위치 안내, firstChest 1회 대사 |
| G32882–32911 | 첫 unpicked debris strict<50. picked 먼저. tier0/1/2 mats·개수·등급·산포40·선택적 hp1·대사 순서. 소형은 개수/물약 난수를 소비하지 않음 |
| G16721 | append→조건부 드롭사운드→cap20. 미개봉/미수거 chest Infinity, item rarity 또는0, 다른 타입−1. strict 최소 첫 tie, tail swap 뒤 resize. 전부 Infinity면 mi0 폴백 |
| G15176,14333 | 기존 source_item_catalog.SLOT_NAMES 재사용. 요소6개는 EL.P/F/I/D/L/H의0–5, EL.E6은 추첨에 없음 |
| G15894–16166 | mkItem은 기존 kill_reward/drop_item_source.gd:129의 생성기에 의존. 생성기 본문 재작성 없음 |
| G28250–28258 | 실제 HP addPotion은 hp 아이템 추가가 아니라 악의+count/true. 원문 count1/2 실행에서 +1/+2를 따로 확인 |
| G16268–16278 | playItemDropSfx의 시간 gate·오디오·내부 RNG는 외부 의존. admission은 사운드 요청 위치만 보존 |
| G32913–32952 | matched는 chest/debris 처리 성공을 뜻함. 이후 HP/산소/장비 선택 차단과 별개인 mat/potion 수거까지 막는 전체 입력 소진으로 승격하지 않음 |

발췌 SHA256:
- reward loop b46c1c77660f87eb2407bd55f97c4650a9f2cfca5e233e3e8437793a50545cb5
- _wiPush a82b9b0dbd9c17f256bfe455f6b6e8f1a361001fae5ec272243f1228994ffc37
- SLOT_NAMES 72c647f1cf345052d72ece51609e9ffd37720ac6b5d80bd51c151b0ead38e065
- HP dependency 163701ec055cecad688167bbc16b0619e8c78f4479cb4749b2b7b077bd13215a

## 독립 API·의존 계약

producer.propose(player, records, pressed, portal_used, dependencies)는 ready/matched/source_index/type/reason/commands/rng_consumed/receipts_consumed/world_items_after/mats_after/pet_tut_after/source의 12키를 반환한다. 입력은 읽기만 하고 새 worker와 깊은 사본으로 계산한다. 반복 호출이 실제 개봉을 확정하지 않으므로 실제 owner commit 전에는 동일 입력이 동일 제안을 반환한다.

- gate는 명시 bool. 비활성에서는 다른 payload를 읽지 않는다. active에서는 finite player x/y, 순서 있는 record Array를 받는다.
- 지원 record는 Dictionary/String type, 평가되는 flag는 bool/null/부재. 후보의 x/y만 finite 검증한다. chest 루프와 debris 루프의 서로 다른 picked 평가 순서도 보존한다. JS의 임의 객체·문자열 truthiness까지 지원한다고 주장하지 않는다.
- 선택 후 dependencies는 finite stage/mats/shake, bool chest3d, Dictionary pet_tut와 Array tape가 필요하다. debTier는 null/부재/false→0, finite 정수0–2만 지원한다. 미지원 값·산술 overflow·의존 부족은 명시 NR이며 부분 명령/사본 상태를 반환하지 않는다.
- tape는 실행 순서의 name/args/value/internal_rng receipt다. Math.random 외부 샘플, mkItem 결과, playItemDropSfx 의존 경계, addPotion bool 반환을 확인한다. 누락·인자 불일치·남는 receipt는 NR. 숫자 인자는 finite int/float의 정확한 수치로 비교하며 bool 숫자변환이나 epsilon 허용 없음.
- rng_consumed는 원문 바깥 Math.random의 제안 횟수다. 생성기·사운드 내부 draw는 각 receipt.internal_rng로 분리한다. 실제 공유 RNG/Callable/오디오 호출은 0회다. 실제 owner가 transactional한 RNG·생성기 수명 없이 tape를 미리 만들고 적용하는 방식은 승인하지 않았다.
- commands는 selected it reference의 flag 쓰기, 효과 호출, 외부 의존 receipt, admit를 원문 순서로 담는다. source_index는 원래 배열 index다. cap으로 해당 slot이 교체돼도 이후 좌표·보상은 retained selected reference를 사용한다.
- world_items_after는 flag와 cap을 반영한 제안 사본이다. mats_after는 이 원문 body의 직접 mats 쓰기만 포함하며 외부 addPotion의 nested mats/SFX/text를 적용한 실제 지갑 값이 아니다. pet_tut_after도 사본이다. 어떤 결과도 새 실제 owner·저장 상태가 아니다.
- 텍스트는 현재 Korean 원문/의존 fixture를 기준으로 대조했다. 실제 번역 owner와 렌더 dispatch·3D상자·펫·사운드 수명은 연결하지 않았다. 다국어 제품 동작은 미확인이다.
- admission.propose(records,incoming)는 ready/reason/world_items_after/commands의 4키다. append, sound 요청, swap_tail, resize를 반환한다. dropPreview는 사운드만 생략하며 cap을 우회하지 않는다. overflow 때만 기존 record의 rank 필드를 읽는다. 사운드는 newcomer가 즉시 축출되는 경우에도 trim 전 요청된다.
- ~~ 산술은 JS ToInt32의 부호·32bit wrap을 보존한다. 음수 fractional stage와 2^31/2^32 초과 stage를 원문 대조했다.

## 검증

최종 수치는 아래 제출 정산에 기록한다. 원로그는 ~/exoduser-wt/_out/nw-04/에 남긴다.

| 항목 | 결과 |
|---|---|
| 신규 원문 대조 | reward317 + admission51 상황, 전체 명령 순서/최종 사본/외부 receipt 비교 |
| native 방어 계약 | 139상황 및 큰 정수 재화 carrier1건, gate·flag·tier·의존 누락/순서/잔여·finite 검증·NR atomic |
| 신규 최종 | 5333/0(exit0), --verbose stderr ERROR/ObjectDB/resource0 |
| 기존 NW01 / NW02 / NW03 | 2304/0 ·1851/0 ·3060/0 |
| test_contracts | 5그룹/실패0 |
| potion_recovery / regions | 318/0 ·43/0; regions의 기존 Camera2D WARNING1 |
| p2001c_kill_rewards | 45/0(exit0), 종료 ERROR0/resource0이나 ObjectDB WARNING1·AudioStreamMP3/AudioStreamPlaybackMP3 각각1 잔류 |
| 동일 main 기준 p2001c | 신규 module/test/oracle/UID를 모두 제외한 동일26c050a99에서도45/0·동일 MP3 두 객체 누수. baseline-kill/ baseline-restoration 로그, 복구 hash 일치 |

OS.execute는 인자로 받은 절대 Node 경로를 사용하고 출력 chunk 전체를 join한다. oracle 실패·부재·빈 출력은 fail이며 skip하지 않는다. Node VM 외부 mkItem/사운드/물약은 명시 fixture다. 별도 검사에서는 기존 실제 mk_item을 private RNG로 호출해 그 결과를 receipt로 반입하며 payload를 보존한다. 브라우저/실제 NPC/실창/제품 플레이/PC 동등성 완료 근거로 세지 않는다.

초기 unit-01/02는 각각5320검사/621실패였다. JSON numeric carrier의 int/float 비교와 잘못된 native fixture 기대1건을 수정했다. unit-03은5309/4로, JS→Godot JSON decimal 변환의 좌표 마지막 bit 차이를 엄격한 receipt 비교가 검출했다. oracle의 모든 숫자를 little-endian IEEE754 binary64 hex로 전달하고 정확한 수치 비교로 바꿨다. 임계값을 바꾸거나 허용오차·skip을 추가하지 않았다. unit-04는5311/0. 최종 코드 검토에서 native int 재화도 JS Number 산술을 사용하도록 명시 float 변환하고 2^53 재화의 원문 사례 및 native int carrier 검사를 추가했다. Godot 실패 원문과 실행 당시 source snapshot을 보존한다. 최초 Node oracle의 지역변수 중복 SyntaxError도 수정 후 원문 body 변경 없이 실행했다.

결함주입 검증: 반경<= ·cap21 ·상자 rank−1 ·개봉 flag false ·debris 등급<=.2 ·slot/element RNG 역순의 6종이 각각8/87/4/330/32/16실패(exit1/5333검사)를 검출했다. 최종 confirm-mut-*는 ERROR/ObjectDB/resource0인 의도한 assertion 실패다. 모든 제품 파일을 동일 byte로 복원하고 최종 실행했다. game.html 개봉 flag를 변조한 별도 입력도 oracle이 source hash 불일치 exit1/출력0으로 거절한다.

## 다음 NW-05 — 공용 접점 필요, BLOCKED

| 필요한 실제 접점 | 최신 native 위치 / 원본 근거 | 필요한 쓰기·소유 경계 |
|---|---|---|
| 실제 R edge·포탈·pause·레슨 epoch | main.gd:898–935의 render 입력 capture/clock gate, :1181 입력; G32825–32827 | 현재 reader는 source_clock_ready=false. R 소비/portal 결과와 원문 update phase의 actual 권위가 필요. 다른 입력 경로에 임의 분기 추가0 |
| MAP_OBJS / worldItems 배열·맵 수명 | world.gd:996–1007의 frame reader/world identity, :2986 physics tick; G32829–32911 | 실제 해당 두 배열 owner·stale snapshot/scene epoch 인수 필요. 현재 get_native_world_identity는 적 배열이지 worldItems가 아님 |
| 개봉·수거 flag commit | G32859 /32886 | 선택 chest opened1쓰기 또는 debris picked1쓰기. retained reference로 보상 전 commit, 동일 입력/중복 적용 방지. native 삽입 위치/줄 수는 owner 미확인으로 미확인 |
| 공통 chest-aware admission | State native_source_new_run_state.gd:560–578; G16721 | 기존 append_native_drop_records는 처치 기록·rarity 위주이며 chest Infinity/타입−1/사운드 경계를 갖춘 실제 worldItems sink가 아님. 이번에 바꾸지 않음 |
| mats와 HP | State :175 reader, :508–517 addPotion, :314 owner gate; G32875/32890 | body 직접 mats 덧셈1쓰기, HP 의존 count2/1. reader나 가짜 owner로 우회하지 않음. 실제 G writer/현재 reward owner 필요 |
| 생성·사운드·효과·pet | kill_reward/drop_item_source.gd:129, G16268/9471/32855–32911 | P.lv/wtype default를 보존한 기존 생성기 adapter, 단일 RNG 순서·sound 내부 draw·효과 lifetime·first flag owner 인수 필요 |

표의 쓰기 수는 원문 statement 수다. 실제 native 공용 diff 예상 줄 수·정확 삽입 줄·새 배열 owner는 미확인이다. 확인된 기존 위치와 필요한 권위를 제시하고 변경0줄로 멈춘다. NW-05 실제 consumer를 별도 승인 없이 만들지 않는다.

## docs·격리·제출 정산

- NPC_WORLD §2.4/§5, ITEMS의 생성기·D18, INVENTORY·기능 목록·WORK_BOARD를 대조했다. 관련 tracked docs 전체를 Git object 기준 검색한271행은 docs-search.txt에 보존했다.
- ITEMS의 기존 D18과 일치하게 이 main에도 native_world_drops.gd와 P2-006a pickup consumer는 미발견이다. 별도 구현 SHA는 미확인. 순수 admission을 실제 월드 드롭/줍기 완료로 집계하지 않는다. 기존 docs·타 담당 기록은 수정하지 않았다.
- 모든 실제 Godot launch 직전 지정 pgrep count1을 확인했다. count2에서는30초씩 대기했다. 프로세스별 시각/수치는 process-guard.jsonl과 각 실행 JSON에 보존했다. 소유 실행은 직렬1개이며 타 작업은 중단하지 않았다.
- 모든 override.cfg는 실행마다 설치하고 finally에서0byte로 비웠다. 신규/import/contracts는 EXODUSER-nw-04-Isolated-20261020, 기존 회귀는 각 파일 USERDIR 상수다.
- import 전 Godot AppSupport의 기존68파일을 백업·hash 대조해 변경0을 확인했다. R HEAD dd49171c5b88e211575a41f185395d6c0a14b184·branch codex/mac-live-play-time-main-20261017·INDEX/WORK 빈 상태도 보존했다.
- 정상 pre-commit 검사를 거쳐 자기 branch만 비강제 push, 원격 ref SHA 일치 확인, DONE.txt 작성 후 자기 worktree만 --force 제거한다. 최종 SHA·수치·정리 결과는 보존 로그의 DONE.txt/submission.json/cleanup-verification.json에 남긴다.
