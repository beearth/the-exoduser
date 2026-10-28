# Mac A04 전사 5슬롯 실제 OS 검수 — 2026-10-29

기존 ARM64 Settings QA 빌드(`EXODUSER-Unity.app`, 실행 파일 SHA-256 `22a177a31717f396e47ce33334ccbab254f82508c1ade3aff2d854cc0809d1cc`)를 새 격리 경로 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A05-IO-A04-FIVE-SLOTS-20261029`에서 실행했다. `--unity-cinematic-persistence-review -output <root> --unity-qa-sandbox <root>/qa-sandbox`와 지정 `qa-output.marker`를 사용했다. 캐릭터 목록은 이 root의 `character-roster-v1`에만 생성됐다. 기존 사용자 앱 3개와 저장 경로는 건드리지 않았다.

| 순서 | 실제 UI 및 저장 결과 |
|---|---|
| 생성 | 전사 선택 → 이름 입력으로 `A04QA1`부터 `A04QA5`까지 각각 생성. 매번 격리 앱 재시작 후 표시 수가 1/5, 2/5, 3/5, 4/5, 5/5로 증가하고 해당 선택 이름이 표시됨. 저장 revision 1~5. |
| 용량 경계 | 5/5에서 `N`을 눌러도 생성 창이 열리지 않고 `슬롯 가득참 · 5 / 5`가 유지됨. |
| 취소 | 선택된 `A04QA5`에서 Backspace로 이름을 명시한 삭제 대화상자 표시. 기본 Enter와 별도 재개방 후 Escape는 모두 취소. 5/5와 목록 파일 SHA-256 `0eb0a6bca48885b23afd2776ace0b001b89f7f2101126dde8efd01e44707b7bc` 유지. |
| 확인 삭제 | 같은 이름의 대화상자에서 Tab으로 삭제 선택 후 Enter. `A04QA5`만 사라지고 4/5, `A04QA4` 선택. 저장 revision 6에 `A04QA1`~`A04QA4` 보존. |
| 용량 재사용 | 새 전사 `A04QA5B`를 생성해 5/5, revision 7. 앱 재시작 후 목록·선택 표시 복원. |
| 선택 영속성 | Up으로 `A04QA4` 선택 후 앱 재시작. 화면 5/5와 `A04QA4` 선택 복원. 최종 revision 8, `selectedIndex: 3`, 이름 5개. |

최종 목록 파일 SHA-256 `67fa35976c91adaa5cce4fac107f4f1035f5c483bbf36abf8ccc6dde607dcf5a`; 화면 증거는 QA root의 `final-restored-five-selected-fourth.jpg`(SHA-256 `59b4b51a6383dadb957727178856f271fb57df0ad61d838d8b5964f58699c59c`). 앱은 검수 후 종료했다.

CUA의 좌표 클릭은 이 Unity 창에서 `noWindowsAvailable`을 반환했다. 위 판정은 실제 OS 키보드 입력과 화면·저장 파일에 근거한다. 카드 ×의 마우스 경로와 직접 한글 IME 입력은 이 단위에서 검수하지 않았다. 전투 진행 저장과 기존 웹/Godot 세이브 이관도 이 목록 저장 범위에 포함되지 않는다. 새로운 빌드나 제품 코드 수정은 없었다.
