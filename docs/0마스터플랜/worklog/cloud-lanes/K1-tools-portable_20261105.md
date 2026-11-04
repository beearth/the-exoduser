# K1 도구 이식성 — 재개 완료

- 시작 `da2850cafa3d87d1e0b87ca188a0192e1cfa6e9b`, 기존 `codex/unity-tools-portable-20261104`에서 이어서 작업했다. Core/웹 대조 기준은 `7958690091b70829598ad4185162955d069250bb`로 동일하다.
- **허용 범위의 소스 이식·Windows 대표 실행 기준 충족.** Core·HP·피해·게임 표현·global.json 변경0, Unity 실행0. Mac/Linux와 전체 러너 실실행은 미확인이다.
- G0: 기존 무창 러너의 인자/출력/SDK 정책을 기준으로 탐색만 공통화한다. 첫 실물/합격 기준은 대표 러너 C#914/0·자원530/0, 중단 기준은 의도된 RED를 제외한 실제 실패2회다(CTO 재개 판단).

## 변경과 근거

| 항목 | 구현 / 파일:줄 |
|---|---|
| 탐색 | `unity/Tools/_shared/toolpaths.cjs:4`: EXO_DOTNET → PATH dotnet → 기존 경로. EXO_PYTHON → PATH python3 → PATH python → 기존 경로. override 미발견 시 다음 후보 |
| 미발견 | `toolpaths.cjs:21`·`:22`·`:67`: `건너뜀(경로 없음)` 명시. SDK/참조팩이 없는 설치도 건너뜀. 건너뜀은 PASS가 아님 |
| SDK/참조팩 | `toolpaths.cjs:30`: 선택한 실제 dotnet 루트 기준. 기존 고정 8.0.301/8.0.6이 설치돼 있으면 유지, 없으면 같은 주버전 내 설치 항목 사용. combat-impact의 최신 버전 선택은 유지 |
| 임시 정책 | `toolpaths.cjs:43`: EXO_DOTNET_ROLLFORWARD=1에서만 임시 global.json 사본에 latestPatch. 원본/프로젝트 유지, SDK 탐색 cwd만 임시 경로. 프로젝트 경로 절대화·인접 NuGet.Config 보존·finally 정리 |
| 실제 연결 | `combat-impact-tests/run.cjs:7`·`:28`, run-ki.cjs, `resource-oracle/run.cjs:10`·`:11` 및 나머지 러너. spawn 옵션·인자·timeout·출력 경로 유지 |
| pure | `combat-impact-tests/run.cjs:32`: 요청된 --pure는 C#만 실행. 기본 Python 아트 검사는 유지 |
| 경로 회귀 | `_shared/toolpaths.test.cjs:3`: Windows 정규화+소문자 비교, 실제 파일·버전, 임시 SDK 정책의 실제 빌드/실행·원본 바이트 보존 |

하드코딩이 있던 **42개 .cjs**를 연결했다(21개 runner.cjs와 21개 run/보조 러너). 파일별 목록은 첨부 로그에 있다. 소유권 금지인 `unity/Tools/oracle-sweep/run.cjs`는 수정하지 않았다. 이 파일의 하드코딩은 남으며 Mac 담당 후속 연결이 필요하다. 그 외 대상 .cjs의 기존 설치 경로는 공용 fallback에만 남는다.

## 실제 검증

| 검사 | 변경 전 → 변경 후 | 증거 |
|---|---|---|
| combat-impact run.cjs --pure | **C#914/0 → 914/0**, 변경 후 exit0 | Core 경고를 포함한 C# 출력 문자열 완전 일치. combat-before.log·combat-after.log |
| resource-oracle | **530건/불일치0 → 530건/불일치0**, exit0 | 결과 JSON 객체 전체 deepEqual. Config-Player·자원별 불일치0 |
| 공용 헬퍼 | **3테스트 / 실패0** | 탐색/미발견, 실제 버전, 임시 정책을 사용한 실제 .NET 빌드·DLL 실행. toolpaths.log |
| 문법 | **44스크립트 통과** | 연결42 + 헬퍼/테스트2. node --check·parity.json |
| 소유/줄 끝 | Core·금지 파일·global.json 변경0 | 기존 러너 각 줄의 CR 수 비교. import 줄 외 원래 LF/CRLF 유지. CHANGELOG CRLF 유지 |

선택 파일과 실제 버전: .NET `C:/Program Files/dotnet/dotnet.EXE` → **10.0.400**, Python `C:/Users/심도진/AppData/Local/Python/bin/python3.EXE` → **Python 3.14.3**. resource-oracle 원본 global.json은 기존 8.0.301/disable 그대로다. 임시 정책 실검사는 8.0.300/disable 원본을 유지하고 latestPatch 사본으로 net8 빌드·실행에 성공했다.

변경 전 combat-impact는 --pure를 해석하지 않아 C#914/0 뒤 아트 PNG 누락으로 최종 exit1이었다. 이번 전후 비교는 사용자 지정 C# 범위다. 기본 아트 모드는 실실행하지 않았다. resource-oracle은 --dependency-root G:/exoduser로 기존 Acorn 설치를 읽기만 했다. 새 설치/원본 저장소 수정은 없다. 실행 시간·테스트 timing 같은 가변 로그를 고정값으로 주장하지 않는다.

재개 후 Windows/Linux PATH 형식을 섞은 fixture가 실제 실패1회를 냈고 해당 OS에서만 실행하도록 고친 뒤 통과했다. 최초 의도된 RED는 CTO 판단대로 실패 횟수에서 제외했다. 수정 없이 실패한 검사를 다시 실행하지 않았다.

## 로그와 재현

- Git 첨부: [핵심 로그·대상 목록](reports/K1-tools-portable_20261105.log).
- 전체 로컬 근거: `I:/EXODUSER-Storage/codex-takeover/k1-tools-portable-20261105/`의 before/after 로그·toolpaths.log·parity.json·runner-scope.json·자원 JSON/로그. 확인한 생성 DLL/중간 빌드는 정리하고 로그/JSON을 남긴다.
- [공용 헬퍼 사용법](../../../../unity/Tools/_shared/README.md). 임시 SDK 정책은 기본 꺼짐이다.

```text
node unity/Tools/combat-impact-tests/run.cjs --pure
node unity/Tools/resource-oracle/run.cjs --source game.html --out I:/EXODUSER-Storage/codex-takeover/k1-tools-portable-20261105/resource --web-commit 7958690091b70829598ad4185162955d069250bb --core-commit 7958690091b70829598ad4185162955d069250bb --dependency-root G:/exoduser
node --test unity/Tools/_shared/toolpaths.test.cjs
```

범위는 Windows 대표 2러너와 공용 계약/문법 검사다. Mac/Linux 네이티브 실행, 전체42개 스위트, Python 아트 실실행, 제외 oracle-sweep는 미확인이다. 지정 브랜치 push·원격 일치 확인 후 자기 worktree를 삭제하고 다음 배정을 기다린다.
