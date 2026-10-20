# DEMO11-21 — 기존 드랍 제품의 journal→실제 INV 자연 연결

기존 P2-006a/b를 재사용해 Main 부팅 시 바닥 드랍 어댑터를 설치하고, 실제 State journal→R 입력→실제 INV.bag 반입을 연결했다. 새 표시·아이템 생성식·별도 INV를 만들지 않았다. 신규 24단정/0실패, 직접 관련 기존 3개 스위트 36단정/0실패다.

## 기준·의존·공용 범위

| 항목 | 근거·변경 범위 |
|---|---|
| 작업 / 브랜치 | demo11-21 / codex/demo11-21-20261021 |
| 시작 기준 | fetch/ls-remote로 확인한 origin/main 0105159934d0c2a8b167bd51518dca1e0fafe50a |
| gap 기준 | [61ab71be DEMO11-21/D27](https://github.com/beearth/the-exoduser/blob/61ab71be/docs/engine/DEMO11_COMPLETION_GAP_20261021.md), D26 처치 journal과 D28 일반 장비 UI를 구분. 원래 표의 선행02/03과 제품 인수 확인부터 수행 |
| 실제 tree 차이 / 회수 | 작업판의 main병합 표기와 달리 원격 main에는 native_world_drops/pickup 함수·P2 테스트가 없었다. 원격 수락 제품 P2-006a 48f0d8e7874ba0a7ca7c4e1897c9b799d8a03ce6, P2-006b e69fe44469a773e594bfe4c4b7ed1400877fc5e6을 확인해 자기 브랜치에 정상 merge. 코드 변경 경로는 Main/State/드랍 제품뿐이며 보호 전투·맵 코드 변화0 |
| 의존 merge | P2-006a merge928a27f5c9722363974307db6e5415e0313f1326, P2-006b merge 45bbce3c89a2ba1ddabdc2bec1cb67955f9eb130. 문서 추가 충돌은 main 기존 내용 보존+제품 절/행 추가. 드랍 표시 add/add는 P2-006b 제출 byte 그대로 채택 |
| Main 공용 | godot/scripts/main.gd **252–257 추가6행**, 기존 줄 삭제0: 기존 NativeWorldDrops 생성/World 자식 설치/configure. 다른 Main 분기 수정0 |
| State 공용 | godot/scripts/native_source_new_run_state.gd **432 추가1행**, **565–566 추가2행**, **584–659 추가76행**, 기존 줄 삭제0: 런타임 serial/픽 확정/실제 _inventory.bag 반입. 모두 기존 P2-006a 제품의 추가분. 보호 피해 경로 변경0 |
| 표시 보존 / 자기 추가 | native_world_drops.gd는 e69fe444와 byte 동일. 새 제품 표시·셰이더·에셋 생성0. 의존 merge 뒤 자기 코드는 실제 Main/Input 통합 테스트+UID와 기존 world/pickup 하니스의 종료 대기 각2행뿐이며 제품 재작성0 |
| 보호 / R | Player 이동·돌진·사슬·전격이동·Q/E·방패·분노·hurtE/hurtP·docs/2_3·월드 맵 지형/배치·웹 원본·저장 형식 변경0. R의 HEAD dd49171c5b88e211575a41f185395d6c0a14b184/branch codex/mac-live-play-time-main-20261017/tracked INDEX·WORK 보존 |

## 원본·실제 경로

원본 game.html SHA256은 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4다. G32002–32034 rollDrop→G16721 journal의 20개 제한→G32935–32941 R 프레스의 화면 안 등급/거리 선택→G16411–16424 일반 장비 INV.bag 반입을 기존 제품이 소비한다. 빈 장착 칸이 있어도 자동 장착하지 않고 _gx/_gy/_pickT를 기록한다. 실패하면 journal은 유지한다. 성공 후 picked/제거는 G32940/34385의 기존 제품 방식이다. 10열·120행/알려진 장비2×2는 G15830–15834/16180–16208의 fresh BAG_MAX300 경계다. 임의 총 bag hard cap을 새로 넣지 않았다.

새 테스트는 실제 main.tscn을 부팅한다. production roll_drop에 명시 RNG fixture를 주입해 만든 일반 장비 record를 실제 보상 owner로 append하고, Input.parse_input_event의 R 이벤트를 실제 SceneTree에 흘린다. 어댑터 private pickup 함수를 직접 호출하지 않는다. journal item과 INV.bag item의 동일 객체, provider.current_inventory와 실제 INV/가방의 동일성, 좌표/시간, 자동장착 없음, 입력 전 자동습득 없음, 성공 후 제거와 중복 습득 차단을 검사했다. 외부 owner의 journal 쓰기도 거부한다. HP/피해/RNG를 강제로 조작한 처치를 자연 처치라고 세지 않았으며 이동·전투 필드 강제 변경0이다. 이것은 **journal 경계부터의 실제 연결 검수**이며 새 자연 처치·실창 키보드·화면 품질 PASS는 아니다.

유골 도감·첫 유골함 지급은 기존 제품의 unported 거부를 보존했다. crystal/stone 즉시 보상 가방과 일반 장비 floor record를 중복 지급하지 않는다. 일반 equip/unequip·인벤 UI·자동정렬·영구 저장·레슨/펫 통합은 해당 다음 단위 소유로 남긴다. 실제 드랍 표시의 기존 RETOUCH 판정도 바꾸지 않는다.

## 실행 결과

| 실행(관련 테스트, 실패한 스위트만 재실행) | 실제 수치 | exit / ERROR / ObjectDB / resource 잔류 | 초 |
|---|---|---|---:|
| new-01(최초 종료 실패) | 24단정/0실패, 종료 검수 실패 | 0 / 1 / 4 / 2 | 8.104 |
| p2006a-world(최초 종료 실패) | 18단정/0실패, 종료 검수 실패 | 0 / 1 / 7 / 3 | 8.270 |
| import-01 | import | 0 / 0 / 0 / 0 | 12.912 |
| new-02 | 24단정 / 0실패 | 0 / 0 / 0 / 0 | 8.561 |
| p2006a-world-02 | 18단정 / 0실패 | 0 / 0 / 0 / 0 | 8.456 |
| p2006a-pickup | 17단정 / 0실패 | 0 / 0 / 0 / 0 | 8.255 |
| p2006b-render | 1단정 / 0실패 | 0 / 0 / 0 / 0 | 8.088 |

최초 new-01은 기능 24/0이었으나 드랍·획득 MP3의 playback 2개+stream 2개(ObjectDB4)/리소스2개가 종료에 남아 실패 처리했다. 제품은 이미 stop/stream=null을 수행하므로 새 하니스만 Main free 뒤 0.25초 오디오 믹싱 스레드 정리 대기를 추가했다. 음향·단정24개를 유지한 new-02 재실행은 ERROR/ObjectDB/resource0이다. 기존 world도 18/0 뒤 같은 Audio MP3 3개·ObjectDB7이 남아 실패했다. world/pickup의 종료 하니스에 같은 0.25초 대기만 추가했고 검사18/17을 유지했다. world는 실패 후1회 재실행, pickup/render는 각1회다. 최초 로그·소유자 진단을 모두 보존하며 최초 PASS를 합산하지 않았다.

Godot 4.7.2 headless --verbose 총 7회(종료 실패2+정상5). 새 테스트는 EXODUSER-demo11-21-Isolated-20261021, 기존 world/pickup은 EXODUSER-P2006A-Isolated-20261020, render는 EXODUSER-P2006B-Render-Isolated-20261020을 그대로 사용했다. 지정 pgrep으로 실행 직전 count<2를 확인했고 2 이상일 때 30초씩 9회 대기했다. override는 매 run 설정 후 finally에서 0byte로 비웠다. 출력은 외부 파일에 리다이렉트하고 RESULT/FAIL/ERROR만 좁혀 확인했다. 관련 테스트 외의 전투·전체 회귀를 추가하지 않았다.

원로그·제품 회수/merge·공용 행 범위·보호 파일/에셋 byte·R/실제 user dir 검증은 ~/exoduser-wt/_out/demo11-21/에 보관한다. 정상 훅·정확한 경로 staging·자기 브랜치 push·원격 SHA 일치·DONE 후 자기 worktree를 제거한다. 이 브랜치가 실제 원격 main에 반영됐다고 주장하지 않는다. 최종 SHA·원격·정리는 submission.json/DONE.txt/cleanup-verification.json에 기록한다.

## 2026-10-21 성능 수정 후속 통합

기존 제출 2ef59364 뒤 origin/main **8dbbf2b0e699c36a93ca5cf41a2f3408be6da2c4**(aa1eaea5a 포함)을 같은 브랜치로 정상 merge했다. merge SHA는 **11a617f5c22981b3ccd95ba67289c2409a86a72c**다. CHANGELOG 충돌은 양쪽 추가 절을 보존했다. rebase·force0, 자체 제품 코드 변경0행이다. PC Main/회복/QE 변경은 main 이력으로 반입했다.

GODOT_METHOD_LIST_TICK_COST_20261021.md를 읽고 드랍 _physics_process→감지/줍기, State journal/INV·현재 소유권 검증, production drop source와 신규 테스트를 점검했다. 네 파일에 get_method_list/get_property_list/get_signal_list 호출은 **0개**다. 이 단위의 Main 설치는 _ready에만 있다. PC의 QE/회복 3곳은 has_method 검증을 유지하며 script/class+method별 정적 _METHOD_ARITY_CACHE miss 때만 목록을 생성한다. 추가 캐시 수정은 필요하지 않았다. 정적 검토와 기능 회귀만 수행했으며 로컬 FPS/성능 개선 실측은 미확인이다. 성능 검증이 필요할 때는 물리 N틱 고정 벽시계 벤치를 사용한다.

관련 스위트 각각 **1회**: followup-new **24/0**, world **18/0**, pickup **17/0**, render **1/0**(기존 합계36/0). 검사·기대값·격리 이름 무변경. import 포함5회 모두 --verbose exit0·ERROR0·ObjectDB 누수0·resource 잔류0, override 종료0byte다. import 전 Godot2개로 30초씩2회 대기했으며 매 실행 gate를 통과했다. Performance 지표 사용0. 외부 followup-* 로그와 followup-results.json에 보존하고 기존 실패 로그는 유지했다. 최종 새 SHA는 기존 DONE.txt에 추가한다.


## 2026-10-21 owner 해제 수명 수정

PC starter_state148/0 뒤 pending draw의 previously-freed ERROR2건 제보를 반영했다. 기존 branch에서 mainac3764bfe를 merge하고 드랍 adapter owner tree_exiting 비활성화·draw/input/physics/snapshot 유효성 guard를 추가했다. Main/State/전투0줄, 기존 검사·기대값 유지. [수명 수정·최종 검증](demo11-21fix_REPORT.md), 원로그 _out/demo11-21fix/. 앞의 제한된 회귀 결과를 starter 종료 수명 전체 검수로 간주하지 않는다.
