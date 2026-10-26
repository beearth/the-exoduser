# Unity 플레이 중 검수 이름표 노출 제한 — 2026-10-26

| 항목 | 일반 실행 | --unity-ui-diagnostics 실행 |
|---|---|---|
| ActiveCharacterName | 그대로 유지 | 그대로 유지 |
| 420×50 개발 이름표 | 그리지 않음 | 이름이 있을 때 기존 위치 16,12에 그림 |
| GUI.Label 영역 | 호출 없음 | 기존 28,20 / 396×40 |
| 이름·선택·이야기·저장·전투 | 변경 없음 | 변경 없음 |

원본 game.html의 charNameHud는 display:none이다. NativeLobby.DiagnosticUiEnabled는 이미 인스턴스 초기화 때 캐시한 diagnosticPreview 값을 읽기만 한다. NativeGame.OnGUI의 기존 if에 이 조건 하나를 더했다. 자막과 하단 HUD·우상단 정보판은 변경하지 않는다.

실패 재현: 동일하게 멈춘 Player의 빈 이름/QA 이름 두 PNG에서 좌상단 310×80 영역 변화율 0.375524가 관측됐다. 일반 모드는 <0.001, 진단 모드는 >0.02가 기대값이다. 수정 후 결과는 [실행 검수 문서](UNITY_UI_RESUME_PLAYER_20261026.md)에 기록한다. 실제 OS 입력·전체 웹 UI 일치 판정은 별도다.
