# Mac A15 Game 탭 캐릭터 선택(로비) 연결 판정 — 2026-10-27

## 기준과 결론

| 항목 | 웹 `main` `2ede62fa3` | Unity `9bc0c1c18`와 현재 `d8f874a34` | 판정 |
|---|---|---|---|
| 설정 Game 로비 버튼 | `game.html:2904` `toLobbyBtn2` → `goToLobby()` (`63675–63686`) | 이 판정 시점의 Game 탭은 미지원 안내만 표시. 이후 2026-10-27 전체 화면 버튼만 연결됨 | 로비 기능 미연결 |
| 로비 화면 전환 | 사망 대화 중단, 사망이면 HP/ST/MP/방패 복구·idle, DB 준비 시 `await dbSave()`, 그 뒤 `/?lobby=1` (`demo=1` 가능) | 일시정지 메인의 `ReturnLobby` → `NativeGame.ApplyPauseCommand`: Running 중지·메뉴 유지·사운드/메뉴 reset·`lobby.ShowLobby()` | 화면 복귀 경로는 있음 |
| 진행 저장 | 웹 `dbSave()`는 선택 캐릭터의 진행 데이터 저장 시도. 예외는 기록하고 로비 이동은 계속한다. `goToLobby` 호출 전까지 기다린다. | `NativeLobby.CharacterStore`는 이름·슬롯·선택만 저장하고 `CharacterPersistenceNote`가 전투 진행 미저장을 명시. `NativeGame.SettingsPersistence`는 설정/키/v2의 저장만 담당 | 전투 진행 보존 계약 없음 |
| 사망 복구 저장 | 웹은 자원·상태를 바꾼 다음 저장 시도 | Unity `ReturnLobby`는 사망 자원 상태를 저장하거나 복구하지 않음 | 재진입 저장 경계 없음 |

고정된 PC UI 원문 대응표 `FDG_SOURCE_TRACE_SETTINGS_20261020.md`의 `toLobbyBtn2` 행도 버튼과 핸들러 위치를 가리킨다. 최신 웹 `main`에서 동작을 다시 읽었고, Unity 시작점 `9bc0c1c18`과 현재 제품의 두 경로는 동일하다. 웹 또한 저장 실패 시 로비 이동을 계속하므로 저장 **성공 보장**이라고 해석하지 않는다. Unity의 현재 `ReturnLobby`를 Game 탭에 바로 연결하면 전투 진행이 보존된다는 웹 버튼의 기대를 충족하지 못한다.

## 인수에 필요한 최소 계약

1. 선택 캐릭터별 전투 진행 snapshot의 스키마·저장 위치·로드/마이그레이션 정책을 저장 owner가 확정한다. 현재 이름·슬롯 roster와 설정 v2는 그 저장소를 대신하지 않는다.
2. 로비 복귀 호출 시 사망 상태의 자원/idle 복구를 포함해 snapshot 저장 시도를 완료한 다음 기존 `ReturnLobby` 화면 전환을 실행한다. 저장 실패 처리와 UI 안내를 명시한다. 개인 roster·설정 v2/unknown·`cinSeen`을 덮어쓰지 않는다.
3. 격리 Player에서 Game 탭 버튼 → 실제 로비 → 같은 캐릭터 재입장 뒤 진행 복원, 사망 복귀, 저장 실패, 설정 unknown 보존을 검증한다. 로비 표시만으로 완료 판정하지 않는다.

이번 판정은 소스 대조다. **제품 파일 수정 0, 빌드 0, Player 실행 0.** PC 소유 키 목록 글꼴·긴 행 제안 패치도 미적용이다. Game 탭의 기존 미지원 안내를 유지한다.

후속 상태: 위 문장은 당시 로비 기능 판정이다. 현행 Game 탭에는 기존 Display와 상태·콜백·설정 v2 저장을 공유하는 **전체 화면** 버튼이 있다. `toLobbyBtn2`의 전투 진행 저장 계약은 여전히 없어 로비 버튼은 연결하지 않았다. [Game 전체 화면 실제 Player 검수](UNITY_MAC_A15_4TAB_20261027.md#2026-10-27-game-탭-전체-화면-버튼-후속).

## 줄기 및 복구점

INBOX `693b66f00` `docs/engine/orders/PC_TO_MAC_INBOX_20261021.md:172–182`의 사용자 결정에 따라 Unity 줄기는 `unity/main`이다. 이번 확인 시 원격 `unity/main` = `d8f874a34ad088603ba6c76ac41e9b709b63a470`, 동결한 예전 원격 `codex/unity-mac-20261024` = `412124ef5efa73611bf0d33dd211074e4d10132e`; 웹 `main`과 Godot에는 Unity 작업을 병합하지 않는다.
