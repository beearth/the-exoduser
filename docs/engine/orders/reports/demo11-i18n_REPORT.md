# DEMO11-i18n — 1-1 데모 UI KO/EN 점검

**PARTIAL — main 범위 수정·검증, 미병합 화면은 목록만.** 기준은 fetch/ls-remote가 일치한 origin/main `0138c5bb9188d27cee10cb1a901d075092ddb88f`다. 미병합 화면/코드 merge0. 특히 설정50 `07c2dad4`, 인벤토리23b `0fd59ed6`, 종료38 `5ff66f32`가 main에 없으므로 설정 UI 클릭과 인벤토리·종료 캡처를 완료로 주장하지 않는다. 다른 화면 branch의 본문도 반입/실행하지 않았다. 브랜치 `codex/demo11-i18n-20261021`.

전수 KO 키·모든 발생 위치/행·영어·수정 전 번역 경로·영어 누락·등록/번호 상태는 **[문자열 표(CSV)](demo11-i18n_STRINGS.csv)** 521행에 기록했다. `scope=main`/동적 표시 경계 209행과 미병합 후보312행을 구분한다. ① `hardcoded_before=True`, ② `en_missing_before=True`, ③ `registry_before=missing/unnumbered`로 필터하면 요구한 세 목록을 볼 수 있다. 미병합의 `UNVERIFIED`/`candidate`는 실행으로 판정하지 않은 후보이며 실제 결함이라고 단정하지 않는다. 각 branch SHA·파일·후보 수는 [manifest](demo11-i18n_MANIFEST.json)에 고정했다.

집계는 KO 표시 키와 그 EN 쌍을 기준으로 한다. `EXODUSER`/`IRON COVENANT` 고유명, HP/MP/SP/Lv.·키 코드·숫자/시간/기호는 언어 중립 표기로 보존한다. 사용자 이름·producer가 넘긴 동적 값, 내부 reason/소스 경로/snapshot 진단 문자열은 고정 UI 키와 구분하며 임의 번역/생성을 하지 않는다. 영어 전용 기술 표기를 새 한국어 문장으로 바꾸는 작업은 하지 않았다.

| 화면 | main 판정·처리 / 미병합 참조 |
|---|---|
| 로비·이름 생성·삭제 확인 | main `native_demo_lobby_screen.gd`의 기존 bridge KO/EN 쌍을 공통 KO 키로 연결. 열린 화면 언어 변경을 반영하고 이름/선택/모달 유지. 04b `2665f02d` 디자인 후속은 목록만 |
| 캐릭터 생성·서사 | main 로비의 이름 입력 + 기존 Main character 선택 UI만 수정. player의 고정 이름은 표시에서만 번역. 07 `5d07f978` entry / 08 `fa55755d` story UI는 목록만. 사용자 작성 이름은 번역하지 않음 |
| 인트로 | main key-guide 4컷 KO/EN, 키보드/패드 행·힌트·버튼 모두 catalog 키 소비. 기존 영문 누락 방향키 더블탭/스틱 보완. 입력 판정·타이밍·음성 파일 불변 |
| 일시정지·설정 | main HUD pause/debug 표시와 S10 bridge만 대상. 09 `dc9f34ea` pause / 50 `07c2dad4` 설정·pause UI는 목록만. 실제 설정 드롭다운 실행 미확인; main 검증은 같은 TranslationServer locale 변경 접점 사용 |
| 대장간·작업대 | main27 WORDS·선택 장비 이름·열린 패널 재번역 연결. 원본 EN에도 없던 녹슨 검/Rusty Sword·나무 견갑/Wooden Pauldrons·낡은 머리띠/Worn Headband는 표시 alias만 추가. 29 `ff7d85c3` 작업대/거래는 목록만 |
| 분해·인벤토리·성장 | 28 `c4f92cde`, 23b `0fd59ed6`, 19ui `c6f9989b` 각각 목록만. 원래 `_DEMO_MODE`/가용성·거래·공유창고·SP/AP/State 내용 변경0 |
| HUD·레슨 | main `hud.gd`와 레슨의 UI 생성/_render 문구·배열 조회만 번역. 단독 줄·서식은 번역 후 기존 값 대입. 기존 숨김 개발 오버레이도 번역하되 가시성 변경0. HUD42 `4f1f5208` 후속은 목록만. 레슨 입력/패링/피해/상태전이/목표/시간 코드 불변 |
| 로딩·준비 UI | Main의 SOURCE_BOOT_EN_LABELS 3개와 source_prepare_start_map_view_owner의 TEXT_KO/EN1개는 기존 OPT.lang/_L 경로 참조·번호 보완만. producer·startup 계약 변경0. 이를 전체 source `_T` provider 설치로 간주하지 않음 |
| 데모 종료 | 38 `5ff66f32`의 native_demo_end_view가 main에 없음. 종료31/37 경로도 반입하지 않음. 요구된 종료 화면 캡처는 NOT_READY |

`native_demo_ui_i18n.gd`는 KO 원문 키→EN을 한 번 읽어 캐시한다. 기존 main 표시 리터럴 **189키·204회**(UI6파일+읽기 전용 준비 producer1)와 동적 이름/서식 경계5개를 합쳐 **194키**다. 직접 무번역 경로105키를 연결했고, 기존 영어가 없던57키와 실제 표시 장비명3개를 채웠다. 133개는 기존 번역 재사용, 60개 새 영문, 1개 기존 접미사의 이름 매개변수 서식이다. 미등록99·등록됐지만 무번호50을 No.3338–3486으로 보완하고 기존 No.45개를 재사용했다. No.3334의 “EN 없음” 항목은 실제 EN으로 고쳤다.

영어 출처는 `game.html` `_EN`(G6315 이후)·`_EN_PFX`/`_EN_BASE`(G8638–8650), 기존 `localization-data.js`의 UI EN·기존 화면 쌍·번역 목록을 우선 사용했다. source EN2773키/접두47/기본형24는 원본과 exact 대조했다. 장비명 조합 fallback은 G8656–8664처럼 마지막 공백으로 접두/기본형을 찾는다. 명칭·아이템 레코드/플레이어 이름 자체를 바꾸지 않고, 모르는 입력/producer 데이터는 추측하지 않는다. 29언어 번역·모든 본편 데이터 이름의 완성 인수는 아니다.

열린 화면의 정적 Label/Button은 번역 변경 알림을 받는 자식 binding으로 갱신한다. 빈 동적 label은 기존 owner가 갱신한다. 인트로/로비/대장간/HUD/레슨은 번역 알림에서 표시 갱신만 defer한다. JSON/역색인은 최초1회 계산하며 새 `_process/_physics_process/advance`와 목록 생성 API0. 기존 HUD/레슨 tick의 text lookup은 캐시 조회만 하며 새 클럭·RNG·설정/저장 writer0이다.

| 검증·변경 경계 | 결과 |
|---|---|
| 신규 | **735/0**, ERROR0·기존 Camera2D WARNING1. 194키 KO/EN/비KO EN fallback, 실제 열린 로비/입력 보존, 인트로4컷 키보드/패드, 실제 Main 대장간·HUD·레슨·캐릭터 선택 표시/tooltip. 레슨은 실제 설치 owner의 UI만 명시 구성하고 practice/성공을 발생시키지 않음. 언어 전환으로 레슨 단계/판정·INV·악의·RNG 불변 |
| 실패 이력 | new-01 **690/8**. 원본 EN에도 없는 장비명3개, 추출 경계에 빠진 BASIC_LABELS 4개/그 재사용 subtitle1개를 실제 label 검사로 발견. 해당 UI 데이터와 추출 범위를 보완하고 누락된 뒤쪽 STEP_TIPS/로딩·준비 키까지 다시 조사해 new-02 735/0. 기대값·검사 완화0. 실패 원문 보존 |
| 원본 EN | Node **3/0**: 전체 source EN2773키·prefix47·base24 exact. G SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 원본 game/index/기존 translation source 변경0 |
| 관련 기존 회귀 | **2,187/0** = lobby52 + forge1918 + HUD36 + polish115 + lesson66. 최종5종 ERROR0(기존 Camera2D WARNING은 main 실행에서1). HUD 첫36/0은 종료 ERROR1/ObjectDB2라 FAIL로 기록; 실패 suite만 verbose 재실행(hud-02)해36/0·ERROR0. 수정 전 main 전체 tracked Godot 파일의 작은 읽기 전용 mirror에서도36/0 뒤 같은 ERROR1/ObjectDB2, verbose에서 drop_common.mp3 AudioStreamPlaybackMP3/AudioStreamMP3 잔류를 확인했다. 선재 오디오 종료 정리 타이밍으로 분류하며 수정0. baseline-manifest/원로그 보존; symlink mirror는 검증 뒤 제거. 각 파일 상수 userdir·`--language ko`, 최종 코드에서 관련5종 각1회. 새 UI 검증은 전환 결과 자체를 검사하며 실제 설정50 화면 클릭으로 대체 주장하지 않음 |
| 영어 캡처 | capture-02 **8/0**, 1920×1080 full3장+원배율 crop3장. 요청한 로비는 자체 육안 PASS/맥북총괄 눈 검수 대기. 인트로·대장간 보조 화면도 잘림/넘침 없음. capture-01은 수치6/0이어도 인트로가 지도 표시 계층 아래여서 비어 있었으므로 시각 FAIL로 보존했다. 캡처 fixture만 실제 CanvasLayer 위에 구성하고 가시성/alpha/패널 bounds 단정을 추가, 대장간 crop도 실제 frame rect로 교정. 제품 표시 계층 변경0. 요청 로비1종 +1x crop. 인벤토리·종료2종은 main 미병합으로 미실행. 인트로/대장간 추가 영어 캡처는 보조 자료이며 빠진 두 화면의 대체물이 아님. 시각 검수는 실제 이미지 확인 후 판정하며 자동 테스트로 대신하지 않음 |
| 공용 줄 범위 | `hud.gd` 2, 111–112, 116, 121, 224, 226, 245, 248, 256, 264, 274, 276, 278, 280, 286, 304, 306, 313, 317, 323, 330, 340–341, 345–347, 350, 353, 355, 473, 503, 549, 622, 626, 645, 649, 1173–1175 **+40/-36**; `main.gd` 2, 1501, 1617, 1621, 1624, 1626, 1630, 1658, 1662, 1664, 1695, 1717, 3059–3068 **+22/-10**; `native_demo_lobby_screen.gd` 2, 9, 31–32, 44, 65, 73, 186–189 **+11/-5**; `native_forge_panel.gd` 2, 74, 141, 148, 192, 253–255 **+8/-5**; `native_intro_key_guide_panel.gd` 2, 189, 203, 217, 246, 665–669 **+10/-2**; `native_parry_lesson_flow.gd` 3, 148, 828, 930, 933, 1012, 1016, 1038, 1073–1075, 1125–1126, 1129–1130, 1132–1134, 1139, 1141–1143, 1146–1148, 1151, 1153–1155, 1157–1159, 1200–1202 **+35/-30**. 변경은 표시 문자열·언어 알림·표시 binding만. State/Player/World·전투 Q/E/이동/패링/방패/분노/피해/저장·번역 원본·공용 export 도구0행. 레슨 notification의 기존 PREDELETE 수명 정리는 보존 |
| 번역·격리·제출 | 번역 목록은 CRLF 유지(단독LF0), 기존 본문은 No.3334 한 행 외 byte 보존 + 번호 절 추가. 신규 EXODUSER-demo11-i18n-Isolated-20261021, 기존은 각 상수·실제 사용자 폴더 접근0. 매 Godot 전 지정 pgrep 2이상이면30초 대기. 정상 hook·경로지정 stage·자기 branch push/remote SHA·DONE 후 자기 WT 제거. R HEAD/INDEX/WORK 불변은 외부 receipt |

재현: `python3 godot/tools/audit_demo11_i18n.py --revision=<main SHA> --output=<파일>`은 주석/셰이더/진단 snapshot을 제외한 명시 UI 표시 범위를 추출한다. GDScript 전체 AST/실행 도달성 증명은 아니며, 실제 열린 노드 검사를 병행했다. 동적 사용자 이름·숫자·producer 데이터는 코드 리터럴과 구분한다. CSV의 미병합 행은 후보 리스트일 뿐 실행 PASS가 아니다. EN exact 도구는 Node+acorn이 필요하다. 이번에는 R의 기존 node_modules를 읽기 전용 symlink로 연결했고 설치/수정0이다. 실제 Node 경로로 `godot/tools/export_demo11_i18n_source_en.mjs --game=game.html --catalog=godot/data/demo11_ui_i18n.json --output=<UTF-8 파일>`을 실행한다. 원로그·최종 SHA/원격 일치·캡처·완료 receipt: `~/exoduser-wt/_out/demo11-i18n/`.
