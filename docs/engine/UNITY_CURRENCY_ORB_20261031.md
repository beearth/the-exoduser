# Unity 악의오브 최종 정정 · 2026-10-31

| 항목 | 계약·검증 |
|---|---|
| 인수 | codex-unity-currency의 기존 15개 개명 WIP를 I:/EXODUSER-Storage/demo-art/currency-rename/orb-20261031/unity/inherited에 byte 그대로 보존 후 인수 |
| 표시명 | 악의오브 / Orb of Malice. 스킬 악의구 / Malice Orb 및 내부 키·비용·수치 불변 |
| 표시 원본 | Core 피드백 문자열, Native HUD·대장간·인벤토리·스킬, Resources/Data 웹 추출 JSON 5개 |
| 원화 | Resources/Art/ui/currency/malice-orb-stage-1..4.png, 웹과 동일 byte, 256×256 RGBA, 알파 유지·밉맵 없음·bilinear·clamp·무압축 |
| 구간 | 0–999 / 1,000–14,999 / 15,000–99,999 / 100,000+ |
| 색 | 옅은 라벤더 / 중간 보라 / 짙은 보라 / 검붉은 보라. 연기·디더링·네온 없음 |
| 연결 | NativeCurrencyOrb, objective HUD 32px·대장간 32px·스킬 자원 24px. 자원 상승 프레임에서 카메라의 플레이어 좌표→HUD 오브로 620ms 합체, 동시 16개 상한 |
| 경제·세이브 | Materials 계산·변수·직렬화·Core 토큰의 비문자열 부분 보존. 획득 표현만 추가 |
| 컴파일 | Core/Runtime/Editor csc 3개 성공. 실제 Unity import·Player·M1을 대신하지 않음 |
| 캡처 | --unity-currency-orb-capture -output 지정경로. 별도 QA sandbox, 잔액 주입·AI 끔·정지 UI 4단계+대장간+합체 캡처. 자연 플레이 증거 아님 |
| 실행 | 기존 codex-currency-rename 예약 재사용. 타인 Unity·잠금·실행본을 종료하지 않음. 최종 빌드·무창 Player·M1·원격 SHA는 아래 REPORT로 확정 |

증거: I:/EXODUSER-Storage/demo-art/currency-rename/REPORT.md. 웹은 main, Unity 코드는 unity/main에만 비강제 통합. 지원 29언어 전체 UI 이식 완료로 확대하지 않는다. 기존 Unity UI가 한국어/영문만 구분하는 범위는 유지한다.
