# A03/A04 Mac 인수 단계·근거 연결 — 2026-10-27

> 저장소 배포본. `qa-contract/`와 `.patch` 이름은 PC 보관 영수증의 정확한 파일명이며 이 네 문서 커밋에는 로그·패치 원본을 포함하지 않는다. 저장소 내 기존 문서는 상대경로로 표시한다.


이 문서는 UI 담당의 [인수 지침](./a03-a04-mac-handoff.md)와 QA의 [독립 감사](./a03-a04-mac-handoff-audit.md)를 함께 읽기 위한 운영 색인이다. 제품 변경이나 새 PASS 판정은 없다.

## 고정 소스·적용 경계

- PC 원격: `codex/ui-resume-player-20261026`의 **`97227ceb7c4a33becd2fe55d4ab1712dc8013182`**를 `ls-remote`로 확인했다. Runtime tree는 QA 감사의 `8376905b93fc0df4170c9ecc67acb47577990f99`다. UI 인수 표의 본문 파일 12개는 PC 격리 소스와 해당 원격 blob의 바이트가 같다([인수 지침](./a03-a04-mac-handoff.md), [21경로 감사 JSON](./a03-a04-mac-source-audit.json)).
- 로고 PNG 세 개의 기존 `.meta`는 PC 격리 소스/원격에서 **GUID 동일·바이트 상이**다. 기존 Mac `.meta`의 importer 설정과 GUID를 먼저 확인하고 덮어쓰지 않는다. 신규 JSON·C#에 필요한 `.meta`만 개별 확인한다.
- Mac `58dbec328…`의 격리 Editor 직렬화 IO 50/50+45/45·별도 프로세스 exit 0·개인 파일 0은 **총괄 인수 보고**다. 이 PC 체크아웃에서 Mac HEAD/INDEX/WORK와 그 object를 독립 확인한 결과가 아니다. Mac 현재 소스와 PC 후보의 readonly preflight, 담당 소유 조정, 최소 hunk 적용 전에는 Mac 통합 완료 0이다.

## 후보별 단계

| 단위 | 제품 후보·원격 근거 | PC 정적 검수 | 해당 고정 입력 컴파일 | Player·실입력·저장 | Mac 인수/배포 |
|---|---|---|---|---|---|
| A03 패치 노트 라벨 | `fb1183f114888795ffee371b4313f7350e00eba4`, 최종 `NativeLobby.PatchNotes.cs` SHA-256 `31486351…` | `qa-contract/patchnote-label-comparison.json`: 29언어×3=87/87 | **`qa-contract/a03-labels-compile.json`**: Unity import·compile exit 0/errors 0 | PC Player GUI·입력 0; 패치 본문은 KO/EN 원본 범위 | Mac 최소 delta 검토 전, 배포 0 |
| A04 생성·삭제 라벨/확인창 | 교정 최종 `a8b37273595a1dd1c31adca740be3aabbcdc90fc`; JSON SHA-256 `423A5689…`, 삭제 C# `0EAE97E9…` | `qa-contract/a04-dialog-label-comparison.json`: 29×14=406/406; UI 삭제 로직 본문 불변 | **`qa-contract/a04-delete-compile.json`**: 새 입력 import·compile exit 0/errors 0 | PC Player GUI·마우스/키보드·개인 저장 IO 0 | Mac 최소 delta 검토 전, 배포 0 |
| A04 시각 선택 라벨 | `2ca42e6c8ff6e2490ac9e690a697db57cb1dba85`; JSON SHA-256 `4383FE4C…`, C# `A7F5F354…` | `qa-contract/a04-visual-label-comparison.json`: 29×42=1,218/1,218; `a04-visual-unchanged.json`: 캐릭터 배열·미디어 초기화 바이트 불변 | **`qa-contract/a04-visual-compile.json`**: 새 입력 import·compile exit 0/errors 0 | PC Player GUI·입력 0; 긴 번역·glyph·RTL 시각 HOLD | Mac 최소 delta 검토 전, 배포 0 |

`qa-contract/patchnotes-compile.json`은 **이전** A03 모듈 SHA `B0D51076…`의 영수증이다. 최종 다국어 A03 입력에는 `a03-labels-compile.json`을 사용한다. 최초 A04 `a1541…`의 402/406과 그 컴파일도 교정 후 `a8b372…` 또는 시각 선택 `2ca42…`의 PASS로 옮기지 않는다. 이 정정은 QA 감사의 `a03-a04-mac-handoff-audit.md`와 같다.

## 명시적 제외·다음 소유

- **제외:** 불투명한 `cin_title_logo.png` 및 구형 로고 후보; `NativeLobby.CharacterPresentation.content-parity.HOLD.patch`와 `visual_select_labels.content-parity.HOLD.patch`; PC 공유 PC 체크아웃의 untracked 디자인 문서·타 팀 WIP·raw 타이틀/개인 세이브. 콘텐츠 7곳은 9월 웹 문구와 10월 사용자 확정 디자인이 충돌해 제품 적용 0이다(`a04-content-parity-hold.md`).
- **Mac 담당 다음 단계:** 실제 Mac HEAD/INDEX/WORK·소유권과 ar/ATG·누적 19패치·build label을 읽기 전용 대조한 뒤 기존 함수와 최소 hunk만 검토한다. 신규 파일 `.meta` GUID를 확인하고 Mac 고유 코드를 보존한다. whole branch merge·파일 전체 덮어쓰기는 인수 절차가 아니다.
- **QA 담당 다음 단계:** [독립 감사](./a03-a04-mac-handoff-audit.md)의 21경로 감사와 제외 목록을 Mac preflight에 전달한다. Dota 2와 과거 QA Player 창이 함께 열린 읽기 전용 조회 1회에서는 안전한 전경을 확정하지 못했으므로 PC GUI·입력은 HOLD다. 실제 Player 화면/저장 테스트는 안전한 격리 조건에서 별도로 기록한다.
- **백업 담당:** 이번 인수 색인은 PC 운영 영수증이다. 기존 정적·컴파일 결과를 다시 Git 커밋하지 않는다. Mac 적용·통합·배포 완료는 현재 어느 영수증도 증명하지 않는다.

## 01:11 KST Mac 읽기 전용 preflight 보고

Mac 담당의 완료 보고에 따르면 PC 원격 `97227ceb7…`을 현 Mac 소스와 읽기 전용 대조했다. A03 패치 노트 partial·JSON과 로비 호출, A04 라벨 자산·생성·삭제·시각 선택 변경은 함께 검토해야 컴파일 의존성이 맞는다. PC `NativeLobby.cs` 전체 인수는 Mac ar overlay·build label 연결을 잃으므로 불가하다. Mac 담당은 최소 적용 순서와 충돌 구역을 자신의 WORK_BOARD에 문서로 남기고 `e804c3935aa99086785733888418e5c143ede0e2` 푸시를 보고했다. **Mac 제품 코드 적용·merge·Editor·Player·빌드는 0**이다. PC 보관 handoff 문서는 해당 Mac 보고 시점에 원격 소스에 없었으므로 Mac의 수신·합의로 기록하지 않는다. 이 Mac 결과는 담당 보고이며 이 PC 체크아웃에서 Mac 현재 파일을 직접 대조한 결과는 아니다.
