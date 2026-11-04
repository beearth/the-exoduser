# K1 도구 이식성 — 중단 / 미완료

- 기준 `origin/unity/main` = `7958690091b70829598ad4185162955d069250bb`.
- 브랜치 `codex/unity-tools-portable-20261104`. Unity 실행0, Core·금지 소유 파일 변경0.
- **동일 검사 2회 실패 규칙으로 중단했다.** 공용 헬퍼/회귀 테스트 후보만 보존하며 기존 러너는 연결하지 않았다. 병합 가능 또는 도구 이식성 완료로 판정하면 안 된다.

## 실패 근거

명령: `node --test unity/Tools/_shared/toolpaths.test.cjs`.

| 실행 | 결과 | 근거 |
|---|---|---|
| 1 | 1개 테스트 실패 | 구현 전 RED: `shared toolpaths implementation is required` assertion. 헬퍼 파일이 없음을 확인 |
| 2 | 1개 테스트 실패 | 구현 후 `toolpaths.test.cjs:12`: PATH 탐색 반환값 `.../first/dotnet.EXE`, 기대값 `.../first/dotnet.exe`의 대소문자 문자열 불일치 |

원인: `toolpaths.cjs`의 PATH 후보는 PATHEXT `.EXE`를 그대로 붙인다. Windows 파일 접근은 성공했지만 반환 문자열이 테스트 fixture의 소문자 확장자와 다르다. 실제 실행 파일 선택 오류인지와 별개로, 문자열 계약/경로 정규화 방침이 확정되지 않았다. 뒤쪽 Python 탐색·임시 global.json 정책 assertion들은 두 번째 실행에서 도달하지 않았으므로 미확인이다. 이 원인을 수정하거나 세 번째 검사를 실행하지 않았다.

## 변경 전 대표 실행

증거 폴더 `I:/EXODUSER-Storage/codex-takeover/k1-tools-portable-20261105/`.

| 명령 | 관측 | 로그 |
|---|---|---|
| `node unity/Tools/combat-impact-tests/run.cjs --pure` | C# **914 checks, 0 failures**. 기존 러너가 `--pure`를 해석하지 않아 아트 검사도 실행, sparse 대상 밖 `Blood_FBF_4x4_matte.png` 누락으로 최종 exit1 | `combat-before.log` |
| resource-oracle, `--source game.html --dependency-root G:/exoduser` 및 기준 SHA 인자 | export-contract1/0, 빌드 오류0, **530건 / 불일치0 / Config-Player 불일치0**, exit0 | `resource-before.log`, `resource-before.json` |

resource-oracle 첫 시도는 dependency-root를 자기 worktree로 지정하여 Acorn 미설치 오류가 났다. 기존 `G:/exoduser/node_modules/acorn`을 읽기 전용으로 지정한 두 번째 시도는 통과했다. 새 패키지 설치는 하지 않았다. resource-oracle의 기존 생성 폴더는 같은 고정 경로를 사용했다.

resource-oracle 재현 인자:

```text
node unity/Tools/resource-oracle/run.cjs --source game.html --out I:/EXODUSER-Storage/codex-takeover/k1-tools-portable-20261105/resource --web-commit 7958690091b70829598ad4185162955d069250bb --core-commit 7958690091b70829598ad4185162955d069250bb --dependency-root G:/exoduser
```

## 보존한 후보 / 남은 일

- 신규 `_shared/toolpaths.cjs`: EXO_DOTNET/PATH/기존 경로, EXO_PYTHON/PATH python3/python/기존 경로 탐색 후보. 경로 미발견 메시지 및 동기 실행 래퍼, 선택 SDK의 csc/ref pack 경로 후보.
- EXO_DOTNET_ROLLFORWARD=1 처리 후보는 원본 global.json을 쓰지 않고 임시 폴더에 복사한 정책만 latestPatch로 바꾸도록 작성했다. 해당 assertion에 도달하지 못했으므로 실제 동작 미검증이다. 원본 global.json 변경0.
- 사용 계약과 미완료 상태는 `unity/Tools/_shared/README.md`. 기존 러너의 하드코딩 경로는 아직 유지된다.
- 다음 담당이 경로 문자열 비교 계약을 결정하고 재개해야 한다. 그 뒤 run.cjs/run-ki.cjs/runner.cjs 등 연결, 기존 `--pure` 처리 확인, 대표 2러너 전후 결과 수·출력 비교, 임시 정책의 실제 .NET 실행·정리·원본 불변 확인이 필요하다.
- 기존 Windows 동작·출력 무변경과 Mac/Linux 실행은 확인하지 못했다. Core·HP·피해를 수정하여 검사 결과를 맞추면 안 된다.

기존 파일 줄 끝은 보존하며 새 후보/보고서는 LF다. 확인한 생성 빌드 DLL/PDB와 자기 worktree의 테스트 산출물은 제거하고 핵심 로그/JSON만 남긴다. 커밋/push/원격 일치 확인 후 자기 worktree를 삭제한다.
