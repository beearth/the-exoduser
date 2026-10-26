# PC→Mac A03/A04 선별 인수 패키지 독립 감사 — 2026-10-27

> 저장소 배포본. `qa-contract/`와 `.patch` 이름은 PC 보관 영수증의 정확한 파일명이며 이 네 문서 커밋에는 로그·패치 원본을 포함하지 않는다. 저장소 내 기존 문서는 상대경로로 표시한다.


## 원격·로컬 고정 근거

- `origin/codex/ui-resume-player-20261026` = `97227ceb7c4a33becd2fe55d4ab1712dc8013182` (`ls-remote`). 그 커밋의 `unity/Assets/Exoduser/Runtime` Git tree = `8376905b93fc0df4170c9ecc67acb47577990f99`.
- `a03-a04-mac-source-audit.json`이 21개 관련 경로를 원격 Git blob과 PC 격리 현장 바이트로 대조했다. 모든 비 `.meta` 파일은 byte 일치하고 모든 `.meta` GUID는 일치한다. A03/A04 주요 모듈·라벨 JSON 및 실제 사용하는 `title_logo.png`/`enter_art.png`/`brand_logo.png`가 이 범위에 있다.
- 기존 로고 PNG 세 개의 `.meta`는 **원격/PC 격리 소스 바이트가 다르지만 GUID는 동일**하다: `title_logo.png.meta`, `enter_art.png.meta`, `brand_logo.png.meta`. 인수 문서의 “기존 `.meta` 교체 금지”를 유지해야 한다. Mac의 실제 GUID·importer 설정은 여기서 보지 않았다.
- 최종 `NativeLobby.cs`는 `title_logo`와 `enter_art`를 참조하고 `cin_title_logo`는 참조하지 않는다. 불투명한 `cin_title_logo.png`는 원격 트리에 남아 있지만 인수 문서의 적용 목록에서 제외된다. 웹 matte 변환 뒤 기존 title/ENTER PNG와 RGBA 픽셀 차이 0이라는 근거는 `frontend-contract-result.json`이다. 구 `47f911…`의 불투명 타이틀 연결과 당시 빌드를 최종 화면 PASS로 취급하지 않는다.
- 7곳 웹 초안 콘텐츠 치환용 `*.content-parity.HOLD.patch` 두 파일은 PC 보관 검토 후보로 남고 이번 원격 인수 목록에 없다. 웹 9월 표시와 10월 디자인 lock의 충돌은 `a04-content-parity-hold.md`의 HOLD로 유지한다. PC 공유 PC 체크아웃의 다른 WIP를 패키지 대상으로 삼지 않는다.

## 인수 문서의 정정 필요 지점

| 지점 | 독립 확인 | 필요한 표기 |
|---|---|---|
| 범위 개수·`.meta` | 인수 문서는 작성 중 처음에 대상 **13개**라고 썼으나 최종 표의 `.meta` 제외 **12개**로 정정됐다. 별도 `.meta`까지 byte 동일하다는 뜻은 아니다. 기존 아트 `.meta` 세 개는 GUID가 같고 바이트가 다르다. | 현 12개 표기를 유지하고, 기존 아트 `.meta`는 교체 금지로 별도 분류. |
| A03 새 입력 컴파일 | 인수 문서의 `patchnotes-compile.json`은 이전 `NativeLobby.PatchNotes.cs` SHA `B0D51076…`에 대한 영수증이다. 최종 다국어 모듈 SHA `31486351…`의 근거는 QA `qa-contract/a03-labels-compile.json`이다. | 최종 모듈의 import·compile 영수증을 정확히 인용. |
| A04 후속 입력 컴파일 | 최초 `a1541…`와 교정 `a8b372…`, 시각 선택 `2ca42…`는 서로 다른 입력이다. | 교정 삭제 `qa-contract/a04-delete-compile.json`, 시각 선택 `qa-contract/a04-visual-compile.json`을 각 SHA와 함께 인용. 최초 후보의 컴파일을 후속 후보에 옮기지 않음. |

## 판정 경계

- **PC 정적/컴파일 인수 가능:** A03 29언어×3라벨 87/87, A04 생성·삭제 29×14=406/406, 시각 선택 29×42=1,218/1,218. 각 최종 입력의 Unity Editor import·C# 컴파일 exit 0/errors 0은 위 QA 영수증에 별도로 있다. 캐릭터 배열·미디어 초기화 불변은 `a04-visual-unchanged.json`이 부모 대비 바이트로 확인했다.
- **미완료:** PC Player의 실제 화면·OS 입력·생성/삭제 저장 IO는 검수되지 않았다. Mac 실제 HEAD/INDEX/WORK, 통합 diff, 컴파일, Player/GUI, 기존 ar ATG/19패치/build label과 로컬 예외의 현행 상태는 이 PC 감사에서 미확인이다. 인수 문서의 보존 지침은 타당한 통합 조건이며 완료 증거는 아니다.
- 데스크톱 읽기 전용 상태 조회 1회에서 Dota 2와 과거 `build-a01-a03-corrected`의 `EXODUSER Settings QA` 창이 함께 열려 있었다. 어느 창이 안전한 전경인지 확인할 근거가 없어 추가 캡처·입력·Player 재기동 없이 GUI 검수를 HOLD로 유지했다. 개인 파일 접근 0.
