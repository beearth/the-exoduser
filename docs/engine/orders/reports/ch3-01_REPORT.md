# CH3-01 — si10 원본 snapshot·읽기 전용 계약

## 판정·기준

**CH3-01 source-only 구현 완료.** CH1/CH2의 단일 추출기에 si10만 확장하고 실제 JSON·순수 계약·Node/Godot 검사를 추가했다. Main/World/State 연결이 필요하지 않아 이 단위의 BLOCKED는 없다. READY는 source_snapshot_only이며 runtime_bound/full_stage_ready/visual_verified=false다. 실제 CH3 이동·적·보스·전환·MAP-LOOK 시각/성능 완료가 아니다. 다음 CH3-02에는 착수하지 않았다.

| 기준 | 실제 확인 |
|---|---|
| 최신 main | fetch 0119f3048a459a458ba142d98f68126b8e281be1, 요구 ce141573e 이상 ancestor 확인 |
| 의존 / 분기 | main 미포함 CH2-01 4013102a82c9ddc3bd7d0f75ba0159438f86d93f 끝에서 codex/ch3-01-20261020 분기. CH1-03 aada9b28/CH1-01/02 계보 포함 |
| main 통합 | 정상 merge 007f4667552e511a3a78c4c59e1de9c8b4a50a68. 코드 충돌0, CHANGELOG 상단만 양쪽 이력 보존. 최신 main 내부의 선재 marker 문구는 main 원문 suffix로 보존·임의 정리0(merge-changelog-preservation.json) |
| 원본·설계 | game.html SHA256 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4. trace-maps-ch3 2eafd158 §4.1 및 기존 CH1/CH2 구현 형식 재사용 |
| 환경 | worktree add --no-checkout + 필요한 sparse 경로. L=~/exoduser-wt/_out/ch3-01/ |
| R | /Users/fordeargamers/Projects/exoduser-migration-20261001, HEAD dd49171c5b88e211575a41f185395d6c0a14b184, branch codex/mac-live-play-time-main-20261017, tracked INDEX/WORK clean 시작·종료 대조 |

## 구현·원본 계약

| 파일 | 실제 변경·소비 |
|---|---|
| godot/tools/export_ch1_area_source.mjs | 기존 stage0/1/4 유지, stage10 분기 **36추가/15삭제**. _HELLWINTER10/compose10/장3+사용cross 메타·basin/RLE·원 regionInit 결과·byte 참조/schema/CLI guard 확장. stage10은 끊긴 symlink도 쓰기 전에 거절 |
| godot/data/ch3_map_source/si10.json | exoduser.ch3-area-source.v1. source.main_sha=0119f304/extraction_head=007f4667 구분, 원 AST symbol59의 행/끝/SHA·input43파일 SHA. grid/START/북문·raw/굴/지역·generation/scope 실제 데이터 |
| godot/port_modules/ch3_map_source/stage10_contract.gd | 신규 RefCounted. 기존 CH1 수치/타입/해시 helper와 CH2 Shared.same 재사용. read_area/validate_area는 동일 raw 참조 반환, IO/Node/RNG/clock/State/저장쓰기0. 전체타일·출처·메타/순서·분모·지역·timer·scope 오염 거절 |
| test/fdgCh3Stage10Source.test.mjs | 독립 원문 AST/IIFE/basin helper·전체 grid·배치/crop/colParts·원화bytes·timer·지역·출처·기존0/1/4 전부 재추출 깊은 비교·CLI 쓰기 전 실패 검사 11건 |
| godot/tests/test_ch3_01_stage10_source.gd | 실제 OS userdir·JSON·동일참조/반복/불변, 전체 배치346/등록61/asset66/symbol59 각각 오염·colParts opening/pivot·빈SW·부재scale·타일/순서·timer·허위runtime 주장 검사 641단정 |
| UID2 / docs | Godot가 생성한 신규 contract/test UID2만 포함. 이 보고서와 CHANGELOG_SYNC 상단 절, 총9경로 |

맵 공유 변경은 사용자 허용 범위의 **단일 source exporter**뿐이다. 제품 map.json/기존 snapshot·계약·공용6·P3 owner 변경0. CH1-02의 map 필드/PNG 승격 예외는 사용할 필요가 없었으며, 해당 기존 파이프라인 재추출·8필드 제한 검사와 맵/지역/소환굴 회귀를 실행했다. CH3 입력으로 기존 제품맵을 덮어쓰지 않았다.

| 항목 | 최신 main game.html 근거·실제 값 |
|---|---|
| 생성 |16633–16713/30008–30034/30042–30085/30135–30147/30218–30694. FIXED_MAPS[0] clone→si10 basin→genFromTemplate, 기본 빈 URL 경로 |
| grid / START |200×200/T40·타일40000, tile0/1/2/3/4=25364/14329/3/3/301. byte SHA1a585fa2fe597e1413c370d55bd1f300134f3428f8008eec2aaaf538c0d74cee. START tile100,185→world4020,7420(G31564–31566) |
| basin / 북문 |G18203 cx100/cy100/rx90/ry88/gateX100/gateY5/gateW12. 초기RLE738숫자/369쌍/coverage40000. G30441 재작성 후 gate99..101/y5 code3=3·exit99..101/y7. 초기RLE와 최종grid 구분 |
| raw / 메타 |G17816–17950 raw346, G17693–17758 등록61, 초기77(G18392–18426), CH1 cross cage_gate/sword_pile/hang_cage/obelisk/bone_arch5. wall I36/L2/END4/GATE2·raw충돌선언후보102는 실효콜리더수가 아님 |
| 원화 |장3 61참조/35파일+cross5/5파일=66참조/40파일, ground_hellwinter1까지41고유원화. game/maps_data 포함source.files43. source/godot 대응bytes 동일, Image/decode/전체scene closure·GPU/시각 인수 증거는 아님 |
| 굴 / 지역 |G30486–30626/31030/60697–60718:7굴·650, NW100/NE300/SW0/SE250, 원 _regionInit의 SW초기clear/fbIdx전부−1. 실효obj/콜리더 NOT_OBSERVED |
| timer |seed20261020/LCG draw7/final1183075769. timer600+state/2³²×60 순수산술 검증. 자연부트 RNG 실측이나 runtime timer 고정 정책 아님 |

READY는 value=원snapshot 동일 참조/scope=source_snapshot_only이며, NOT_READY는 reason/raw 동일 참조·최상위 value 없음이다. 입력을 수리·변조하지 않는다. 실제 source bytes는 Node가 읽어 대조하고 순수 계약은 고정 선언 pin/형식을 검사한다. source.main_sha는 이번 고정 최신main, extraction_head는 추출 당시 HEAD다. 원본이 바뀌면 재추출·재인수하며 기대값만 임의 완화하지 않는다.

CLI: `node godot/tools/export_ch1_area_source.mjs <explicit-source-root> <explicit-output-json> --stage 10 --seed 20261020`. root 안은 godot/data/ch3_map_source/si10.json만 허용, 밖은 명시 JSON·이미 있는 파일은 CH3 schema/stage10만 허용. 지원0/1/4/10 외·이상seed·제품map/다른stage/타schema·symlink(끊긴 link 포함)는 쓰기 전 거절한다. 기본 R/이미지 출력·원본/사용자 저장쓰기0.

## 검증·선재 실패 보존

L/run.py는 **매 Godot 직전** 지정 pgrep/wc를 기록했다. import 직전count2에서30초대기→count1 재확인, 나머지도1에서 실행했다. 엔진 순차 실행·타인 프로세스 종료0. 실행마다 격리 override 작성 후 finally0byte. 신규 EXODUSER-ch3-01-Isolated-20261020, 기존은 각 파일 상수 userdir(contracts는 상수가 없어 신규격리), 원본 Godot4.7.2 사용.

| 로그 prefix | 실제 결과 | 범위·한계 |
|---|---|---|
| extract |exit0/stderr0 |원 AST→si10 JSON, 원본·제품map/PNG 변경0 |
| new-node |11통과/0실패/0SKIP, exit0/stderr0 |독립 원문·byte·CLI·기존0/1/4 깊은 비교 |
| new-godot-final |641단정/0실패, exit0/stderr0/ERROR0 |Main0/World0/saveIO0. 앞선 pure-project도641/0이나 중복 합산0 |
| source-regression-node |29통과/0실패/0SKIP, exit0/stderr0 |기존 CH1-01/03+CH2-01 |
| ch1-assets-node / pit-node |각6통과/0실패, exit0/stderr0 |기존 CH1-02 재추출/8필드·92PNG/geometry/collider 보존 / pit계약 |
| map-node |37건 중28통과/9실패, exit1/stderr0 |이전 CH2-01 원로그와 9실패 이름·순서 동일. 신규실패0, 실패suite를 PASS로 합산하지 않음 |
| ch3-layout-node |28건 중27통과/1실패, exit1/stderr0 |full-map editor zoom expands map-object culling to the visible world bounds. 최신main0119f304 game/test/package 동일bytes 확인·별도control 실행도27/1로 동일 |
| ch1-01 / ch1-03 / ch2-01 |63/0 /75/0 /362/0, 각exit0/stderr0/ERROR0 |기존 순수계약 |
| ch1-02 |189단정/0실패, exit0/stderr0/ERROR0 |실제stage0 정적World·Main0. 신규시각/캡처 인수 아님 |
| contracts |전체5그룹/실패단정0/only=[], exit0/stderr0/ERROR0 |전체회귀 |
| p3002 |6그룹298단정/0실패/0SKIP, exit0/ERROR0 |GUI 실제renderer. actors_registered10/unported_spawns158·기존 Camera2D/종료ObjectDB8 누수 보존 |
| p3003 |43단정/0실패, exit0/ERROR0 |core/display/actual, 기존 Camera2D 경고/full_fieldboss_combat=false 유지 |
| import |exit0/stderr0/ERROR0 |자기APFS cache clone의 정상 cache reimport 수행. 원화/제품PNG 변환·저장/교체0. 자동sidecar200(.uid165/.import35)은 OUT 보존·제출제외, 자기신규UID2만 제출 |

맵9실패는 culling fixture1/adapter pending2/Image 없는 지역VM6이며 map-failure-comparison.json에 전 이름/순서를 남겼다. CH3layout1실패는 최신main 최소control 재실행으로 확인했고 ch3-layout-failure-comparison.json이 근거다. 로비 전체는 실행하지 않았고 전달된 로비8실패를 재판정하지 않았다. 선재 실패/누수/미이식 적을 수정·제외·skip·기대값완화하지 않았다.

신규 Node/Godot suite의 실제 실패는 없었다. 준비 중 main CHANGELOG 선재 marker를 만나 Git stage2/3 원문 suffix 보존 방식으로 병합했다. 회귀 준비의 asset receipt list 접근과 과거 잘린 실패요약 비교 초안을 교정했으며, 실제 실행 결과를 실패에서 통과로 바꾸지 않았다. 최종 비교는 원 stdout의 정확 이름·순서를 사용한다.

## 보존·제출·한계

구현 전 materialized tracked2332파일 SHA 대조: **공유 source exporter 외2331파일 byte 동일**. 추가checkout 원본도 tracked diff0. 기존 제품map/원본HTML/JS/PNG·공용6·P3/CH1/CH2 계약/snapshot 변경0. docs 관련 검색214행은 L/docs-keyword-search.txt. 원본 에셋은 byte 참조만이며 원화 생성·가공·제품복사0. 기존 CH1-02 회귀가 쓰는 외부 임시 재추출은 원본 byte 복사 범위이고 제품 승격0이다.

정확9경로만 stage, ignore된 신규 Godot test/UID는 그2경로만 지정 force-add. 정상 docs-sync/pre-commit 훅·자기branch 비강제push·원격SHA대조→L/DONE.txt→자기worktree 제거. main push/force push/rebase/git add -A/훅우회0. 원로그·snapshot/보고서 사본·branch 유지, 최종 SHA/정리/R 대조는 DONE/submission.json 참조. 자기pure-project/cache는 검수 후 정리하며 타인cache/WT 변경0.

## MAP PRODUCTION REPORT — 제작 GUIDE §23

```text
STAGE: CH3-01 / si10 source snapshot and pure contract only
MASTER: basin/START/gate/raw346/굴7·650/4분면 보존, 새레벨 설계0
OUTER MASS/LARGE/MEDIUM: wallkit·colParts와표현mass분리, 신규asset/composite/접합제작0
GROUND: 초기RLE/최종grid분리, Godot요철/광원/안개제작0
PLAYABLE/LANDMARK: source계약만. 실효placement/collider/actualPlayer·적·지역·문·보스·전환 미연결
CAMERA QA: 신규8카메라·전투·성능·PC 인수 미실시
TECH QA: 신규Node11/0·Godot641/0, 기존source/맵/지역/굴/계약 회귀 원로그
         mapNode9·CH3layout1 선재실패, Camera/ObjectDB 경고 보존
FILES: 공유추출기stage10+신규data/contract/tests/UID2+관련docs
GIT: 정상훅·자기branch push·원격일치→DONE→자기WT제거·R불변
VISUAL VERDICT: NOT_OBSERVED / 미확인 — 시각PASS 주장 없음
NEXT PASS: CH3-02는 별도 배정·실효배치/독립소비자·MAP-LOOK 인수 필요
```
