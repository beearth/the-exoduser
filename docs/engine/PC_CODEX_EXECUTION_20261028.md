# PC Codex CLI 실행 계약 (2026-10-28)

| 항목 | 현재 값·위치 |
|---|---|
| 실행기 | `unity/Tools/devtools/exo-codex.ps1`, Windows PowerShell 5.1 |
| 명령 | `run`, `status [-Last 20]`, `show -Run <실행 폴더>` |
| 허용 워크트리 | `E:\exoduser-wt\<폴더>` 또는 `G:\exoduser-wt\<폴더>`의 Git 최상위. 사용자 메인 `G:\exoduser` 금지 |
| 브리프·이름 | 비어 있지 않은 파일, 이름 정규식 `[a-z0-9-]{1,40}` |
| 실행 | `codex exec -C <워크트리> -s workspace-write -c notify=[] -o <result.md> [--model <id>] <prompt.md를 읽으라는 짧은 인수>`; stdin은 빈 파일로 닫음 |
| 자원 게이트 | 커밋 여유 기본 4GB 이상, `unity-jobs\HALT` 부재, 워크트리당 1건, PC 전체 기본 3건 |
| 타임아웃 | 기본 90분, 해당 실행기가 띄운 프로세스의 생성 시각·부모 연결을 확인해 자손만 종료 |
| 기록 | `I:\EXODUSER-Storage\codex-runs\<yyyyMMdd-HHmmss>_<Name>\`의 브리프·프롬프트·로그·결과·메타·Git 변경 파일 |
| 담당 | Codex는 커밋 금지. 개발툴 총괄이 diff 검수 후 경로 지정 커밋 |

상세 명령 예와 종료 코드 0~6은 [개발툴 README](../../unity/Tools/devtools/README.md)의 `Codex 실행(exo-codex.ps1)` 절에 있다. DryRun은 실행 기록까지만 만들고 Codex를 띄우지 않는다. 실행 로그·diff와 독립적인 Unity Player 검증은 별개의 근거다.

## 10-28 인수 검수

| 근거 | 결과 | 범위 |
|---|---|---|
| `unity/Tools/devtools/selftest/exo-codex-tests.ps1` | 종료 0, 구문·입력 거부·숨김 CLI 버전 조회·DryRun·잠금·동시 상한·백그라운드 DryRun 통과 | 실행기 자체 검사. 실제 Codex 작업·타임아웃·Unity 실행 미검증 |
| `I:\EXODUSER-Storage\codex-runs\20261028-220413_selftest-e2e\meta.json` | **종료 코드 1**. `result.md`와 시험 파일 생성만 확인 | CLI 로그에 PowerShell 시작 거부·명령 오류가 있어 종단 시험 성공으로 판정하지 않음 |
| `codex/pc-devtools-tools-20261028` `33ef33763` | Unity 도구·README를 별도 브랜치에 커밋·원격 push(`465bb875e` 최초 인수, 뒤이어 정리 도구 보정 2건) | `unity/main` 미병합, 실제 Codex 작업 안정성 미확인 |

원본 미커밋 작업은 `E:\exoduser-wt\pc-unity-devtools-codex`에 보존했다. 인수 브랜치의 출처가 원본 워크트리임을 커밋 본문에 기록했다.
