# Unity UI 2단계 — 진행 기록

사용자 인계: I:/EXODUSER-Storage/codex-takeover/ui-phase2-brief.md. 보고·문서는 한국어. 기준 unity/main 6a196f484.

| 순서 | 화면 | 상태 |
|---|---|---|
|1|첫 화면|1단계 인장·첫 흐름 인수, 변경 없음|
|2|메인 메뉴|기존 금속 원화·큰 붉은 주 버튼 후보 구현, 실제 검수 대기|
|3|로비·캐릭터 선택 UI|미착수, 3D 무대 타 담당 소유|
|4|튜토리얼|미착수|
|5|설정|미착수|
|6|로딩·대기|미착수|
|7|HUD|미착수|
|8|일시정지|미착수|

화면별 동일 크기·1x 비교 → 컴파일 → 무창 M1 → MERGE_QUEUE → 공통 정상 병합 → 일반 바로가기 갱신 순서. 자산 원본·다른 WIP·사용자 세이브 보존. 산출물은 I:/EXODUSER-Storage/demo-art/unity-ui/phase2/. 전체 상태 RETOUCH.

메뉴 후보1 ef16aec92: 빌드035dd81f Succeeded·compileErrors0·USER_SAVE0, 실제 GPU3bb3ce63 첫인상21/21·창0·잔여0. 직접1920 판정에서 붉은 표면이 너무 어두워 RETOUCH, 기존 name_create 재질 조합으로 후보2 재작업. 이전 후보를 최종 PASS로 소급하지 않는다.

후보2 c99bc9fc3 빌드642c2892 오류0·실제3cb4d430 첫인상21/21·창/잔여/세이브0. 1x 직접 검수에서 붉은 사각 패치 경계 결함 RETOUCH. 조합 방식을 원본의 연결된 암부 영역으로 변경했다. compose-primary.cjs는 원본1024×198·202752픽셀 중73240픽셀만 재질 변환하며 알파와 나머지 픽셀은 동일하다. 원본SHA/조합SHA는 phase2/원화합성_출처.json. 새 생성·비용0.
