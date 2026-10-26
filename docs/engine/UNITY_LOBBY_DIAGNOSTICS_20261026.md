# Unity 로비 검수용 미리보기 분리 — 2026-10-26

현재 상태: Mac Unity 소스에 2026-10-26 일반 cherry-pick으로 통합했다. 정적 컴파일 통과, 새 Player 시각 검수 전이며 기존 실행본에는 아직 적용되지 않았다.

사용자가 요청한 원본 웹 시작 순서의 미러링을 위해, Unity에서 추가한 이름 없는 미리보기 진입 버튼과 이식 저장 범위 설명을 일반 로비에서 숨긴다. PC 제공 원본 index.html에서 `이름 없이 미리보기` / `Preview without a name` 문자열은 발견되지 않았고, Unity NativeLobby.DrawLobby에는 검수용 SelectPreview/EnterNativeTest 단축 진입이 일반 UI로 노출돼 있었다.

| 항목 | 일반 실행 | 명시적 검수 실행 |
|---|---|---|
| 옵션 | --unity-ui-diagnostics 없음 | --unity-ui-diagnostics 포함 |
| 이름 없이 미리보기 버튼 | 표시·클릭 영역 없음 | 기존 위치 1392,946 / 480×48 유지 |
| CharacterPersistenceNote 안내 | 해당 로비 하단 안내 표시 없음 | 기존 위치 1392,1000 / 480×48 유지 |
| 옵션 판정 | NativeLobby 인스턴스 초기화 시 1회 캐시 | 동일 |
| 일반 캐릭터 흐름 | 생성·이름·슬롯·선택·이야기·입장 기존 경로 유지 | 동일 |

변경 파일은 unity/Assets/Exoduser/Runtime/NativeLobby.cs다. SelectPreview/EnterNativeTest 메서드와 CLI fixture 호출은 보존한다. 세이브 읽기·쓰기, 캐릭터 저장 정책, 영상·음원·언어 목록·하단 HUD는 변경하지 않는다. 이 안내를 숨긴 것이 전투 진행 저장 이식 완료를 의미하지 않는다.

검증: 지정 부모 소스에 대한 git apply --check 통과. 원본 웹 및 Unity 코드를 직접 대조했다. 자막 글꼴 변경 위에 충돌 없이 통합했고, `NativeLobby`의 `diagnosticPreview` 조건·기존 `EnterSelectedCharacter`/`SelectPreview` 호출·우크라이나어 자막 선택식을 소스에서 확인했다. Unity 6000.6.7f1 C#9/Roslyn4.10 기존 Runtime+Editor 76소스 정적 컴파일 종료 코드 0, 오류 0, 기존 직렬화 필드 경고 18건. 일반 경로는 옵션 없을 때 해당 버튼과 안내를 그리지 않으며, 명시 옵션 경로에서만 기존 두 요소를 그린다. 새 일반 로비/검수 옵션의 실제 Player 렌더·OS 입력은 미검증이다.

2026-10-26 후속: 일반 게임의 개발 이름표도 같은 옵션으로 제한했다. [플레이 중 이름표 조건](UNITY_GAMEPLAY_BADGE_GATE_20261026.md)을 따른다. 실제 이름·슬롯·입장 API는 유지한다.
