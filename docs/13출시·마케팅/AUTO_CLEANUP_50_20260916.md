# 변경 파일50개 자동 정리 — 2026-09-16

> 2026-09-27 현행 운영: 사용자 요청으로 `ExoduserAutoCleanup50` 예약 작업 삭제 완료. 1분 주기 및 로그온 자동 실행은 해제되었다. 터미널 창 깜빡임·작업 방해로 자동 재등록하지 않는다. 아래 도구·임계값은 수동 실행 시에만 적용하며 과거 등록 기록은 이 지시를 대체하지 않는다.

사용자 지시: 변경 파일이50개 이상 쌓이지 않도록 자동 정리한다. 정리는 기존 작업을 로컬 Git 커밋으로 보존하는 동작이다. 검수·백업 파일은 아래 즉시 제외 규칙으로 처리하고, 실제 소스의50개 자동 커밋은 별도 동작이다. 기존 로컬 백업/검수 폴더 제외 정책은 `SOURCE_CONTROL_HYGIENE_20260916.md`를 따른다.

| 항목 | 현행 계약 |
|---|---|
| 실행 | `tools/auto-cleanup.cjs`; `auto_commit.ps1`은 자기 위치의 저장소에서 고정 Node 경로로 실행 |
| Node | `C:\nvm4w\nodejs\node.exe`, 없으면 `G:\NODE.JS\node.exe` |
| 검수 즉시 제외 | `.gitignore`의 `/output/*_review_*/`, `/output/**/backups/`, `originals/`, `before/`, `profiles/`, `captures/` 및 `/output/**/*.log`. 새 날짜 폴더도 생성 즉시 제외하며50개/60초 조건을 기다리지 않음. 기존 추적 파일은 계속 추적 |
| 임계값 | `DEFAULT_THRESHOLD=50`; `git status --porcelain=v1 --no-renames -z --untracked-files=all`의 파일 수 기준.49개 이하 보류 |
| 정지 시간 | `DEFAULT_QUIET_MS=60000`. 파일 상태·경로·크기·mtimeNs와 HEAD가60초간 같아야 실행. 변경 시 다시 대기 |
| 예약 작업 | `ExoduserAutoCleanup50` 삭제됨(2026-09-27). 1분 주기 및 로그온 자동 실행 없음 |
| 등록 도구 | `tools/install-auto-sync-task.ps1`은 과거 설치 도구로 보존. 사용자 재요청 없이 실행·재등록 금지 |
| 실행 환경 | 자동 실행 해제. 필요 시 명시적으로 수동 검사 |
| 검증 | 변경된 JS/CJS/MJS 및 HTML 인라인 JS를 acorn으로 파싱. 변경된 `test/*.test.[cm]js` 실행. 각 외부 명령 제한120초. CRLF 허용 후행 공백 검사 |
| 문서 조건 | docs 외 파일 변경 시 관련 docs 문서와 `docs/CHANGELOG_SYNC.md` 모두 수정되어 있어야 자동 커밋. 의미/수치의 완전 동기화는 작성자가 수행해야 하며 자동 도구가 이를 추론하지 않음 |
| 보류 | 이미 스테이징된 작업, 병합/리베이스/체리픽/리버트 진행, detached HEAD, 기존 index.lock, 검증 실패, 검증 도중 파일/HEAD 변경 |
| 동시 작업 | 공유 index.lock을 직접 배타적으로 획득한 뒤 별도 임시 인덱스에서 스테이징·커밋. 성공하면 준비된 인덱스를 공유 인덱스로 교체. 기존 타 작업 잠금은 제거하지 않음 |
| 커밋 | `auto: local checkpoint (N changed files)`. 기존 Git 커밋 훅을 실행. 실패 시 원래 공유 인덱스/HEAD/작업 파일 유지 |
| 보존 | 파일 삭제·롤백·자동 push 없음. 커밋 중 새 편집은 작업트리에 남으며 다음 검사 대상 |
| 실행 기록 | `tmp/auto-cleanup/state.json`, `events.jsonl`. 로그1MiB 초과 시 직전 로그1개 보관. `index.before`는 마지막 공유 인덱스 백업 |
| 비정상 중단 | 커밋 후 인덱스 교체가 실패하면 복구용 인덱스/잠금을 보존하고 blocked 기록. 강제 종료 시에는 Git 상태 확인 후 복구해야 함 |
| 기존 자동화 | G:\hell 대상3시간 주기 커밋+push 스크립트를 현행 저장소용 로컬 커밋 실행기로 교체. 다른 저장소의 예약 작업은 변경하지 않음 |
| 검증 | 실제 임시 Git 저장소6회귀:49/50 임계·60초 대기·성공 커밋, 타 작업 스테이징, 문서/구문 실패, 편집 경합, 외부 Git 잠금, 커밋 훅 실패 시 보존 |

## 사용·점검

```powershell
# 자동 설치/갱신 금지: 2026-09-27 사용자 요청으로 예약 작업 삭제
# 수동1회 검사 (50개/60초 조건 동일)
powershell -ExecutionPolicy Bypass -File auto_commit.ps1
# 최근 결과
Get-Content tmp/auto-cleanup/state.json
# 예약 작업 상태
Get-ScheduledTask -TaskName ExoduserAutoCleanup50
# 조회 시 작업 없음이 정상이며 자동 복구하지 않는다.
```

1분 주기 검사와 편집 정지·검증을 거치므로 파일이 한 번에 대량 생성되거나 편집이 계속되면 잠시50개를 넘을 수 있다. 강제로 파일을 숨기거나 삭제해서 개수를 맞추지 않는다.

등록 확인: 2026-09-16 Windows 예약 작업 등록 및 최초 실행 성공. `state.json`에 below-threshold 기록 확인.
