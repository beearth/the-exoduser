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
| 컴파일, 키보드·마우스, 초점 복구 | 실제 Editor/Player | Editor import·컴파일은 아래 별도 QA 영수증으로 0오류; Player 키보드·마우스·초점은 미검증 |

`G:/exoduser/docs` 전체 관련 키워드 검색을 수행했다. 이 문서는 후보 코드와 함께 격리 브랜치 `codex/ui-resume-player-20261026`에 백업됐다. 공유 G:의 타 팀 WIP·문서는 수정하지 않았으며 main 통합·Player 화면·시각 PASS는 별도 판정이다.

## 2026-10-26 독립 QA import·컴파일

- QA 입력 원격 `fb1183f114888795ffee371b4313f7350e00eba4`: `NativeLobby.PatchNotes.cs` SHA-256 `3148635121EA37F2BA973A8DC699C6F95512C7CF4C15E73DF6FA5D4E3C6485AC`, `patch_notes_labels.json` `BBEA905B33655A42FDA06BEFC572A55122BD25C8FCBC826AD2110C2CDCB41E85`, `.meta` `CD6737B52BD0B68F7CE3B7A6E86B730B2B673D10741492F7822F88E33D69DFE2`; 실행 전후 동일.
- 독립 웹 oracle(`I:/EXODUSER-Storage/qa/unity-ui-resume-20261026/qa-contract/patchnote-label-comparison.json`)은 29언어×3문구=87값 **STATIC_MATCH**, 차이 0. 초기 오탐 46개는 `lobby_i18n.js` 평가 누락 때문이었고 실제 HTML 로드 순서대로 추출기를 수정해 재실행했다.
- Unity 6000.6.7f1 `-batchmode -nographics -noUpm -quit` **한 번** 실행. QA 영수증 `qa-contract/a03-labels-compile.json`의 PID 53788, 종료 코드 **0**, C# 컴파일 오류 **0**. 로그에 `Compiling Scripts`, `patch_notes_labels.json` `TextScriptImporter` import, 정상 종료가 있다. Runtime C# 77개 해시는 실행 전후 동일하며 Editor lease는 해제됐다.
- 이 영수증은 JSON import와 C# 스크립트 컴파일에 한한다. 제품 Player 빌드·실제 29언어 화면·클릭/키보드·초점·긴 문구 레이아웃은 **미검증**이다. 이전 `47f911…` 빌드와 `71d544…` 정적 A01 판정을 이 후보의 Player 결과로 재사용하지 않는다.
