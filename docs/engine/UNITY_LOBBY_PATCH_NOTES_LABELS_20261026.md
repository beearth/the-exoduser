# A03 패치 노트 언어별 UI 문구 후보, 2026-10-26

## 범위와 출처

- 웹 기준: `origin/main`의 고정 커밋 `d209075ec471176ca5224d4c21c4912a3e72ed0a`, `index.html` blob `31225ee77b9cd300fc96a8414bd73f6a43db43a4`, `lobby_i18n.js` blob `cf9abdba9487e1787948137e79b97df7dd19b724`, `localization-data.js` blob `f2a5ed4edf1d65a826706c050d25c8bb843d9c62`.
- `_TL(s)`는 `ko`에서 한국어 원문을 반환하고, 그 외 언어에서는 인라인 로비 테이블 → `lobby_i18n` 병합 → `ms`의 `lobbyMs` 대체 → `ui` 덮어쓰기 순서의 결과를 읽는다. 없는 키는 영어 테이블로 폴백한다.
- Unity 후보는 `NativeLobby.PatchNotes.cs`에서 제목/닫기/빈 상태 **3개 호출 위치**만 `patch_notes_labels.json` 조회로 변경한다. 29개 언어 코드의 실제 표시 문자열은 동봉한 `patch_notes_labels.source.json`과 동일하며 Unity 자산 JSON과 구조/값이 일치한다. 말레이어는 제목과 빈 상태가 원본 영어 폴백이고 닫기는 `Tutup`이다.
- 본문 `patch_notes.json` 두 버전 `0.7.5`, `0.7.0`, 한국어/영어 본문 및 섹션·항목 순서는 기존 그대로다. `NativeLobby.cs`도 변경하지 않았다.

## 구현·검수 경계

| 대상 | 구현 위치 | 결과 |
| --- | --- | --- |
| 제목, 닫기, 빈 상태 | `NativeLobby.PatchNotes.cs` / `patch_notes_labels.json` | 웹 `_TL`의 29개 현재 언어값으로 정적 데이터 일치 |
| 비어 있거나 읽기 실패한 라벨 | 동일 C# | 데이터의 영어 행, 마지막에는 기존 `K(ko,en)`로 폴백 |
| 본문 2개 버전 | 기존 `patch_notes.json` | SHA-256 `E4EAC388FEE4D9030B5A7731B74C0BB14E5075256570FC35ED3E9B52EA1D8962`, 불변 |
| 아랍어 및 긴 언어 문구의 글꼴/방향/줄넘침 | 실제 Player UI | 미검증, 시각 판정 HOLD |
| 컴파일, 키보드·마우스, 초점 복구 | 실제 Editor/Player | 이번 후보로 미실행, QA 후속 필요 |

`G:/exoduser/docs` 전체 관련 키워드 검색은 수행했다. G: 공용 checkout의 타 팀 WIP와 문서 소유를 보존하기 위해 이 문서는 인수용 초안으로 I:에 두었다. 소유자가 후보를 받아들일 때 해당 Unity 이식 문서와 함께 정상 반영해야 한다. 제품 반영이나 시각 PASS 선언이 아니다.
