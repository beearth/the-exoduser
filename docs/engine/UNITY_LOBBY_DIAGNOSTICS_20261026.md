# Unity 로비 검수용 미리보기 분리 — 2026-10-26

현재 상태: 총괄 작성 후보. Mac 통합·정적 컴파일·실제 Player 시각 검수 전이며 기존 실행본에는 아직 적용되지 않았다.

사용자가 요청한 원본 웹 시작 순서의 미러링을 위해, Unity에서 추가한 이름 없는 미리보기 진입 버튼과 이식 저장 범위 설명을 일반 로비에서 숨긴다. PC 제공 원본 index.html에서 `이름 없이 미리보기` / `Preview without a name` 문자열은 발견되지 않았고, Unity NativeLobby.DrawLobby에는 검수용 SelectPreview/EnterNativeTest 단축 진입이 일반 UI로 노출돼 있었다.

| 항목 | 일반 실행 | 명시적 검수 실행 |
|---|---|---|
| 옵션 | --unity-ui-diagnostics 없음 | --unity-ui-diagnostics 포함 |
| 이름 없이 미리보기 버튼 | 표시·클릭 영역 없음 | 기존 위치 1392,946 / 480×48 유지 |
| CharacterPersistenceNote 안내 | 해당 로비 하단 안내 표시 없음 | 기존 위치 1392,1000 / 480×48 유지 |
| 옵션 판정 | NativeLobby 인스턴스 초기화 시 1회 캐시 | 동일 |
| 일반 캐릭터 흐름 | 생성·이름·슬롯·선택·이야기·입장 기존 경로 유지 | 동일 |

변경 파일은 unity/Assets/Exoduser/Runtime/NativeLobby.cs다. SelectPreview/EnterNativeTest 메서드와 CLI fixture 호출은 보존한다. 세이브 읽기·쓰기, 캐릭터 저장 정책, 영상·음원·언어 목록·하단 HUD는 변경하지 않는다. 이 안내를 숨긴 것이 전투 진행 저장 이식 완료를 의미하지 않는다.

검증: 지정 부모 소스에 대한 git apply --check 통과. 원본 웹 및 Unity 코드를 직접 대조했다. Mac의 자막 글꼴 담당 변경과 같은 파일을 공유하므로 병합 시 두 변경을 모두 보존해야 한다. 새 일반 로비/검수 옵션의 렌더·입력 및 컴파일은 Mac 인수 담당자가 기록한다.
