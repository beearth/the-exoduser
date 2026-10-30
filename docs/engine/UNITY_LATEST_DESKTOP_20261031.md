# 최신 바탕화면 Unity 통합 후보 — 2026-10-31

상태: 소스 통합 후보 / 실행 안전 HOLD / 제품 전달 미완료.

| 항목 | 실제 확인 결과 |
|---|---|
| 작업 지시 | I:/EXODUSER-Storage/codex-takeover/latest-desktop-brief.md |
| 작업본 | G:/exoduser-wt/codex-latest-desktop |
| 전용 브랜치 | codex/pc-latest-desktop-20261031 |
| 원격 공통 입력 | 0ced574ef082bcef1e6969a329b91e5454d49574 (착수 fetch 후 확인) |
| A2 입력 | 4be1de16f69b84eddb6bb6262accec1220fe209f |
| 병합 | 비강제 --no-ff, 충돌 0. 기존 INDEX/WORK 및 대상 미추적 0 확인 후 수행 |
| 병합 입력 동일성 | 문서 추가 전 전체 tree 081dede698eaaadfb89f5e7616e096d59ea60161, A2 tip 전체 tree와 동일 |
| 기존 검증 통과 범위 | 진입10c49850f·악의구f27c9d1f9·UI b0f04fb4d·중심앵커018ce33f2·MCP/오디오 b9491cf58는 모두 공통 입력 조상. 같은 브랜치를 중복 병합하지 않음 |
| 제외 | 새 보스/영웅 3D FAIL·NOT_READY 브랜치, gameplay-parity 미검증 최신, 캐릭터 선택 FAIL, R6 HOLD. A2 추가 diff에 새 보스/영웅 3D 모델 없음. NativeDruidBody 변경은 기존 스프라이트 표시 배율 |
| 보호 범위 | 공통 입력 대비 Core·Packages 추가 변경 0. 타인 작업본/세이브/실행창/예약/잠금 조작 0 |
| 소스 공백 검사 | 선행 A2 입력의 Unity 재질·meta 공백 경고 314곳으로 diff --check 종료2. 원본 바이트 보존, PASS로 기록하지 않음 |
| 실행기 | Node 독립 실행 경로로 기존 exo-unity.ps1 status 정상 실행. 터미널 도구 자체 CreateProcessW os5와 분리 |
| 실행 안전 | status 커밋 여유2.7GB/98GB. 작업본 Library 없음으로 Editor 필요20GB. Player 필요10GB. CIM에 종료 대기 Player15개와 기존 HOLD PID43348·5272·31104 잔존 |
| 안전 정본 | UNITY_KEYSHOT_A2_20261030.md의 08:32KST 신규 PC 실행 금지. 메모리 회복·잠금 반환·HasExited만으로 해제하지 않음 |
| 컴파일/Win빌드/M1 | 현재 통합 후보 모두 미실행. 기존 A2의 내용23/23·timeout/정상종료FAIL 영수증을 새 후보 PASS로 재사용하지 않음 |
| 실제 진입90초/숲 캡처 | 현재 후보 미수집. 원화 대비 큰 형태·원근·물가/수면 잔여 결함은 A2 기존 FAIL 유지 |
| 바탕화면 | 사용자 Desktop에서 지정 일반/숲 미리보기 lnk 모두 부재. 생성·삭제·교체0. 이전 대상은 기존 통합 영수증에만 있으며 현재 링크 대상으로 단정하지 않음 |
| 이후 사용자 실행 인자 | 검증 통과 후 -force-d3d11 --remodel3d --unity-a2-forest. A2 플래그는 숲 표시용이며 진입 생략을 하지 않음. quick-start·QA·촬영 인자는 일반 링크에서 제외 |
| 원격 반영 경계 | 전용 후보 브랜치 백업만. unity/main·사용자 실행본 반영 금지 상태 유지 |

필수 재개 조건은 기존 종료 대기 및 HID 종료 안전이 해소된 직접 증거와 안전 메모리 여유다. 그 뒤 현재 소스 고정 → exo-unity Win64 오류0 빌드 → 같은 바이너리 정상종료 M1 → 진입90초 및 숲 실제 캡처/1x → 기본 링크 백업·생성/교체와 속성/바이너리 readback → 최신 원격 재대조·정상 unity/main 반영 순으로 진행한다. 현재 단계에서는 새 예약·GPU·반복 종료진단·권한/드라이버/장치 변경을 하지 않는다.

실제 영수증: I:/EXODUSER-Storage/demo-art/latest-desktop/REPORT.md 및 통합-사전검수.json. 이 문서는 완료 영수증이 아니다.
