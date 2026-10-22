> 2026-10-22 인트로 현행 갱신: [PARITY-INTRO-01](PARITY_INTRO_01_20261022.md). 생성 직후 warrior → Main 첫 진입 INTRO를 분리하고 합본 제품 참조를 끊었다. 영상 HOLD/캡처 제한은 해당 문서를 따른다.

# DEMO11-07 — 로비 char0 생성·active·INTRO 경계

진입점은 기존 DEMO11-04 `res://scenes/demo_lobby.tscn`이다. 프로젝트 기본 main_scene/DEMO11-01 실행 권위는 바꾸지 않는다. 보통 실행에서는 생성 성공 신호를 구독하고, 기존 custom SceneTree 회귀는 이전 요청 UI 동작을 유지한다. 새 하니스만 `native_lobby_entry_enabled=true`를 명시한다.

원본 index.html:2909–2910의 이름 2–8 UTF-16 단위·금지 문자 `< > " ' & / \`, :3199–3231 CHAR_VISUALS의 char0 공개/나머지4 잠금, :3402–3424 저장 성공 뒤 스토리, :3447–3450 name/ts/charIdx, :3488–3519 active/game 교환, :4340–4349 입장을 참조한다. 이름/잠금 정책은 생성 전에 검사하고 실제 저장 성공은 기존 Menu/DEMO11-05 adapter의 receipt·readback만 인정한다. 이미 생성된 기록의 입장 재시도는 기록을 다시 생성하지 않는다.

`native_demo_lobby_entry.gd`는 기존 Menu/`source_slot_reader` 메타 reader의 actual rows를 소비한다. char0 metadata-only 기록은 실제 `hellsave_demo_active` 저장·재읽기 뒤 Main을 만든다. 신규 기록은 player가 없으므로 game save로 복사하지 않는다(원본 remove 분기의 key가 이미 없는 경우). 미동기화 `hellsave_demo`가 있으면 덮어쓰지 않고 동기화 owner를 요구한다. Player가 있는 저장은 DEMO11-06의 복원 책임이므로 기존 continue 요청 접점으로 남긴다. 복원 완료나 전투 재개를 가장하지 않는다. 새 키·마이그레이션·서버 호출은 없다.

Main은 pending 입장에서 인트로를 미리 만들지 않는다. active가 확인된 owner의 packet만 받아 기존 `_character_picker`/`_on_native_character_selected`/character reader 인터페이스로 char0을 적용한다. 이동·피해·패링·방패·분노 구현에는 쓰지 않는다. 그 다음에만 DEMO11-08 owner를 시작한다. 중복 요청과 입장 후 늦은 rollback은 active를 변경하지 않는다. 입장 실패 시 새 기록은 보존하며 active는 자기 값인 경우에만 이전 값으로 복귀를 시도한다.

`game.cutsceneDone`은 원본 game.html:62914/62977·:62144 직렬화 경계를 따른다. 저장 읽기에서 이미 true이면 영화 재생을 건너뛰고 기존 기상 4컷 owner로 인계한다. 이 단위의 metadata-only 신규 흐름에는 저장된 Player 전투 상태 복원 의미가 없다. 미완이면 INTRO가 끝나거나 skip된 뒤 기존 State의 `_cutsceneDone`만 true로 기록한다. State는 실제 자기 Main의 입장/완료 receipt만 받는다. 완료 전에 온 callback·타 owner는 거절한다. 기존 collector가 이 필드를 직렬화하며, 이번 변경이 부분 game save를 새로 만들거나 슬롯에 game 필드를 추가하지 않는다. 취소/오류만으로 완료 flag를 쓰지 않는다.

Hell Gothic 표면·폰트는 DEMO11-04의 helper/게임 토큰을 재사용한다. 이름 입력도 hell 명조·뼈색·금선·붉은 선택색이다. 신규 표시 문구는 번역 전체 목록에 등록했다. 실제 viewport 캡처2장과 1x crop은 `_out/demo11-07/captures/`에 있다. 관련 검증·공용 파일별 줄 범위는 [보고서](orders/reports/demo11-07_REPORT.md)에 기록한다.

## 2026-10-21 LOBBY-01 화면 개편

기존 단순 이름 폼과 비활성 텍스트 버튼 5개는 전사 대형 원화·소개·5인 초상 카드로 대체했다. 첫 빈 슬롯의 새로하기 강조·초기 포커스, 이름 Enter 제출, 잠금 장식과 생성 화면 초점 격리를 적용했다. 저장/active/인트로 경계·이름 검증 정책은 이 문서의 DEMO11-07 계약 그대로다. [화면·에셋·입력 상세](LOBBY_01_20261021.md).
