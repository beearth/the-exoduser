# DEMO11-04 — 실제 로컬 5슬롯 요청 UI

로컬 저장 adapter의 실제 IO 결과를 읽어 5슬롯 목록·새 전사 metadata 생성·선택 데이터 전달·삭제 확인 UI를 구현했다. **화면 비교 자료 준비 / 맥북총괄 눈 검수 대기**다. 상태 문구는 실제 기록 생성/확인과 이어하기 준비 중을 표시한다. 이어하기는 선택 슬롯 payload를 넘기는 호출까지만이며 Player 복원·게임 진입 성공을 표시하지 않는다.

최신 RETOUCH: **52/0**, hell 본문·Cinzel 제목·#dfd6c2·제목/아트 분리. 아래 RETOUCH 절과 최신 캡처 경로를 참조한다.

| 기준·범위 | 구현·원본 근거 |
|---|---|
| 기준·의존 | origin/main **8dbbf2b0e699c36a93ca5cf41a2f3408be6da2c4** + DEMO11-05 **f2889355e42828780d902ac1546211f5da56f627** 정상 merge **61d4d92e10f371724ee5e33d4eea21ccf764b3a9**. rebase/force0, 다른 미병합 코드 반입0 |
| 재사용 | demo_local_storage actual host IO·lock·commit receipt와 source_slot_reader strict JSON/consume_list_response metadata fallback을 그대로 호출했다. 둘 모두0줄. 기준 main의 SV-LOBBY-VIEW/S10은 추적·후보 파일 계약만 있어 그 후보 native_save_slot_menu/native_settings_lobby_bridge에 명시 로컬 구현. 기존 구현이 있었다고 주장하지 않음 |
| 원본 | index.html3486–3552의5고정슬롯·로컬metadata fallback, 3446–3452의 name/ts/charIdx 생성, 3593–3610의 확인/삭제 후 목록 갱신, 3512–3520의 metadata/player 분기. game.html62111–62173의 데모 key 경계를 참조. 이어하기 활성/game key 교환은 복원 담당 DEMO11-06 이후이며 이번에는 쓰지 않음 |
| 요청·실패 | 목록은 실제5키 snapshot이 모두 읽힌 뒤 교체. 실패를 빈 목록으로 대체0. 생성/삭제는 실제 settled/ok receipt + 재읽기 뒤 반영. 새 metadata는 정확한 serialized UTF-8 원문 readback으로 확인하고 재파싱된 실제 payload를 emit. 삭제는 확인 당시 raw와 writer lock 획득 후 raw를 재대조해 변경 슬롯 보호. 실패·취소·손상은 성공으로 세지 않음 |
| 요청 API / 진입 | 별도 씬 **res://scenes/demo_lobby.tscn**. `new_game_requested(slot,data)`와 `continue_requested(slot,data)`를 소비자가 연결한다. metadata-only start는 new 신호, player 객체가 있는 슬롯은 continue 신호; 이것만으로 완전한 유효 save/복원 성공 판정하지 않음. 일반 Main 부팅/프로젝트 main_scene 자동 교체0. 기본 실제 사용자 namespace에서는 adapter가 IO 전에 거절 |
| 화면·인계 | Hell Gothic 흑철/뼈색/금빛선/적색 버튼·NativeUIFont. 원본 로비 배경/선대 portrait/문장3개 SHA256 동일 사본, 새 이미지/이모지0. 원본 abyss.webp는 PNG 데이터여서 사본 확장자만 png. 웹 VIEW2 대신 native5행, 이름 입력 index848 maxlength8. 선대 장식은 선택 캐릭터 외형 완료가 아님. 명시 KO/EN·기타 EN 폴백, 키보드/패드 장치 관측 subset, 설정 저장/29언어 완료/전체 패드 인수0. UI문구23쌍을 번역대상_전체목록에 등록 |
| 공용 변경 줄 | **Main0 / State0 / Player0 / World0 / HUD0 / project.godot0**. 보호 전투/피해/이동/QE/방패/맵/저장 adapter·schema0. 자기 새 controller/view/bridge·씬/테스트/기존원화 사본 및 관련 docs만. 자체 틱 함수/목록 생성 API0. 성능 벤치·Performance 지표 사용0 |

## 검증

| 실행 | 단정/실패 또는 결과 | exit / ERROR / ObjectDB 누수 / resource 잔류 |
|---|---|---|
| import-01 | import 실패 | 0 / 3 / 0 / 0 |
| import-02 | import 정상 | 0 / 0 / 0 / 0 |
| new-01 | parse 실패 / 검사 미실행 | 0 / 2 / 0 / 0 |
| new-02 | 46 / 11 | 1 / 0 / 0 / 0 |
| new-03 | 46 / 0 | 0 / 0 / 0 / 0 |
| new-04 | 48 / 0 (기존46+화면2) | 0 / 0 / 0 / 0 |
| storage | 79 / 0 | 0 / 0 / 0 / 0 |
| slot-reader | 5,952 / 0 | 0 / 0 / 0 / 0 |
| capture-01 | 1920×1080 / 시각 RETOUCH | 0 / 0 / 0 / 0 |
| capture-02 | parse 실패 / 자기 PID TERM | -15 / 3 / 0 / 0 |
| capture-03 | 1920×1080×2 + 1x크롭2 | 0 / 0 / 0 / 0 |
| capture-04 (상태 문구 정리 최종) | 1920×1080×2 + 1x크롭2 | 0 / 0 / 0 / 0 |


최초 import-01은 source .webp의 실제 PNG 형식으로 ERROR3을 검출했다. byte 변환 없이 확장자만 바꿔 import-02를 검증했다. 신규 new-01은 타입 추론 parse 오류로 검사를 실행하지 못했다. new-02는46검사/11실패를 보존한다: 제품의 정수 timestamp와 JSON binary64 carrier의 Dictionary 비교가 생성 readback을 거부했고 후속 생성/전달도 실패했다. 제품은 serialized raw byte 비교로 강화하고 실제 재읽은 parsed data만 emit하도록 수정했다. 하니스는 JS Number와 같은 숫자의 Godot int/float 표현을 허용하되 bool·필드 개수·키 존재·모든 중첩 값·배열 길이를 그대로 검사한다. 기존46단정·기대값을 유지한 new-03은46/0이다. 첫 화면에서 texture minimum 크기와 Lv.3.0 표시 문제를 검출한 뒤 새 UI 검사2개를 추가해 new-04 **48/0**을 확인했다. capture-02의 들여쓰기 오류는 자기 capture PID만 TERM으로 종료/override 정리했고 로그를 보존했다. 최종 관련 기존 회귀는 각각1회, 합계 **6,031/0**이다. 실패한 신규만 재실행하며 최초 실패를 최신 통과 합계에 가산하지 않는다.

신규 검수는 **EXODUSER-demo11-04-Isolated-20261021**의 실제 파일 IO와 씬 control 신호를 쓴다. 자연 플레이 save나 외부 OS 키보드/마우스 전 과정 인수라고 주장하지 않는다. 삭제 취소·확인 후 교체 방어·외부 writer lock·디렉터리 유실/복구가 핵심 장애 경계다. 실제 사용자 저장 폴더의 읽기/쓰기/생성0이며 기존 회귀는 각 파일 상수 이름이다. 매 Godot 실행 전 지정 pgrep으로2이상일 때30초 대기하고 override는 매회 finally0byte로 비운다. stdout/stderr/verbose 로그는 외부 파일, 요약/실패 줄만 확인했다.

## 화면 자료와 남은 연결

목록 `~/exoduser-wt/_out/demo11-04/captures/01-list-1920x1080.png`, 삭제 확인 `02-delete-confirm-1920x1080.png`를 실제 렌더링 창의 viewport에서 저장했다. 각각 **1920×1080**, 1x 크롭은 `01-list-crop-1x.png`(**800×230**)와 `02-delete-crop-1x.png`(**860×430**)다. 색/배치·겹침을 열어 확인했고 **맥북총괄 눈 검수 대기**로 남긴다. 첫 과대 문장 화면은 `captures-initial-retouch/`에 보존했다. 전체 Godot12회/30초 gate 대기15회, 최신 신규/관련회귀/최종 capture는 ERROR·누수·resource0. 초기 실패/시각 RETOUCH는 최신 통과로 소급하지 않는다.

캡처는 격리 디렉터리에 adapter로 기록한 명시 fixture(재의 맹세 Lv3·stage0 및 metadata-only 먼지의 순례자)를 실제 UI가 다시 읽은 화면이다. 이름·레벨은 QA fixture이며 자연 저장·복원 증거가 아니다. 원본 에셋 byte 검증은 assets.json, 번역 키는 translation-texts.json, 보호 hash는 protected-inputs.json, 각 실행 JSON과 stdout/stderr는 `~/exoduser-wt/_out/demo11-04/`에 있다.

DEMO11-06이 실제 payload를 소비하는 restore/activate coordinator·new-game 부팅을 인수해야 한다. 이번 UI 신호를 실제 플레이 시작·복원 완료로 표시하지 않는다. 기존 active save 복귀 동기화/legacy 단일키 migration·온라인/Steam 인증·캐릭터 선택/서사·공유창고는 미연결이며 별도 owner 범위다. 저장 adapter의 단일키 rename 원자성/내구성·플랫폼 제한도 그대로 상속한다. 최종 SHA·remote 일치·수치는 DONE.txt, 자기 worktree 제거와 R불변은 cleanup-verification.json에 기록한다.


## 2026-10-21 맥북총괄 RETOUCH 재제출

기존 branch codex/demo11-04-20261021의026a2e00 위에 fetch 최신 main **969c194e6e912128f29b3058982c113c5feecccf**을 정상 merge한 **e20fbaf6b89dd89a6f71d30ac24e8b1c28704943** 기준이다. ‘같은 브랜치’ 지시를 공통 새 branch명보다 우선했고 worktree는 요청한 demo11-21fix 경로를 재사용했다. 먼저 drop branch **72e602d1** push·remote 일치를 확인한 다음 수행했다. 이 UI branch에 미병합 drop branch를 추가 반입하지 않았다.

본문·슬롯/동작 버튼·이름 입력을 hell400 명조, 제목을 hell_title700 Cinzel 계열로 바꾸고 기본 글자를 #dfd6c2로 맞췄다. 왼쪽 아트를 y290 아래 600×560으로 배치해 EXODUSER/지옥의 길 제목 모두 아트 바깥 위에 둔다. native_demo_lobby_screen.gd25/64/72/95/121의5행만 치환, Main/State/Player/전투/IO owner0줄·이미지 byte0변경·신규 텍스트0·목록 생성 API0.

기존48단정 유지+폰트/영역4단정으로 **52/0**, 관련 UI 스위트 **1회** 실행했다. 슬롯/이름입력 hell font chain, 제목 Cinzel chain과 실제 제목 rect의 art y290 이전 종료를 검사한다. UI import·스위트·실창 capture **3회 모두 exit0/ERROR0/ObjectDB0/resource0**이다. 이번 RETOUCH gate30초 대기10회, 각 override 종료0byte. 앞의 Godot12회 표는 이전026a2e00 제출의 이력이며 이번3회를 중복 합산하지 않는다. 기존 저장 adapter/slot-reader는 무변경으로 재실행하지 않았다. 기존48개 검사를 줄이지 않았다.

자료: `~/exoduser-wt/_out/demo11-21fix/captures/01-list-1920x1080.png`, `02-delete-confirm-1920x1080.png`; `01-list-crop-1x.png`, `02-delete-crop-1x.png`, **03-title-art-crop-1x.png**. 이전 화면은 _out/demo11-04/captures/에 그대로 보존했다. 실제 렌더링 viewport를 재캡처하며 새 자연 save/복원·OS 수동 플레이 검수와 구분한다. **화면 비교 자료 준비 / 맥북총괄 재검수 대기**다.
