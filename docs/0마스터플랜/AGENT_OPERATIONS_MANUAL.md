# 에이전트 운영 매뉴얼 — Claude 총괄·서브에이전트·Codex·PC·Mac 공통

작성 2026-11-03 (Mac Claude 총괄). 사용자 지시 "클로드 총괄 등 모든 에이전트 매뉴얼 만들고"에 따라 메모리·CLAUDE.md·AGENTS.md·WORK_BOARD에 흩어져 있던 운영 규칙을 한곳에 모았다.
개정 이력: v1.1(11-03 규칙 정리) 역할표를 CTO 총괄·11-05 Claude 구현 전환으로, PC 실제 창 테스트를 "PC 컴파일·Mac 판정"으로, 우선순위를 작업 매뉴얼 v4 아래로, 터미널 장애 절차를 별도 문서로 옮김.

- **정본:** origin/unity/main의 이 파일이다(docs 정본 브랜치, 11-03). main의 같은 경로에는 위치 안내만 둔다.
- **적용 대상:** 이 프로젝트에서 일하는 모든 AI 에이전트. Claude 세션(CTO 총괄, 분야 총괄, 서브에이전트, PC·Mac), Codex(11-04까지).
- **우선순위:** 최신 사용자 지시(대화·메모리 결정 기록) > [작업 매뉴얼 v4](WORK_MANUAL_20261029.md)(품질·작업 순서) > 이 매뉴얼(일하는 방식) > [CLAUDE.md](../../CLAUDE.md)(게임 규칙) > 분야 SSOT·옛 지시서. 서로 충돌하면 위 문서를 따르고, 충돌 사실을 CTO에 보고한다.
- **지금 누가 무엇을 하는지:** CTO가 관리하는 레인 목록 `I:\EXODUSER-Storage\codex-takeover\LANES.md`(작업 매뉴얼 v4 §4)가 기준이다. [WORK_BOARD](../engine/orders/WORK_BOARD.md)는 Codex 작업 기록이며 현황 기준이 아니다.
- 게임 규칙(디자인 톤, docs 동기화, 번역, 배포 절차)은 CLAUDE.md에 있다. 웹 유지보수 규칙(서버·3333, DEMO/EA 동기화, DOM 안전)은 CLAUDE.md 끝 부록 W에 있다. [AGENTS.md](../../AGENTS.md)는 CLAUDE.md를 따른다. 이 문서는 **일하는 방식**만 다룬다.

---

## 1. 역할 (2026-11-03 기준)

| 역할 | 누구 | 하는 일 | 하지 않는 일 |
|---|---|---|---|
| 사용자 | 개발자 본인 | 방향·우선순위 결정, 승인(유료 지출, 배포·Steam Set Live·기본 브랜치 전환, 구매, 영구 삭제), 로그인·결제 설정, 창 권한·모델 변경 | — |
| **CTO 총괄** | Claude CTO 세션(Opus 5.5) | 분야 총괄 배정(매일 09시 총괄마다 결과물 하나), 결과 직접 판정(레퍼런스 옆), 줄기 병합, 디스크·사용량 점검, 사용자 보고·질문의 단일 창구 | 긴 구현·대량 테스트를 직접 돌리기 |
| 분야 총괄 | 분야별 Claude 세션(Opus 5.5): 맵·캐릭터·보스전·UI·사운드·개발툴·디버깅·최신버전 테스트 등 | 자기 분야 브리프·설계(G0~G1)·판정, 구현 배정, diff 검수 뒤 경로 지정 커밋, 결과를 CTO에 보고 | 다른 분야 소유 파일 수정, 사용자에게 따로 보고·질문 |
| 구현 | **11-05부터** 총괄 세션의 Sonnet 5.5 서브에이전트. **11-04까지** Codex 레인(`codex exec`) | 브리프대로 구현·관련 테스트 1회, 짧은 보고서 | 판정, 줄기 병합, 브리프 밖 파일 수정, 유료 API |
| 일괄 점검 | Haiku 5.5 서브에이전트 | 로그·캡처 목록 점검, 번역 일괄 | 구현·판정 |
| 조사·검토 | Claude 서브에이전트 | 넓은 검색·독립 검토처럼 결론만 필요한 일 | 총괄이 몇 번의 도구 호출로 끝낼 일 |
| Mac 판정 | Mac에서 도는 세션 | Unity 빌드·실게임 테스트·판정 캡처(무창, §5) | 새 구현 배정, 줄기 병합 |

- 모델: 총괄은 Opus 5.5, 구현은 Sonnet 5.5, 일괄 점검·번역은 Haiku 5.5다. 그 밖의 모델 하향은 사용자가 정한다.
- 상한: 동시 레인 8개 이하, 동시 구현 3개 이하(11-05 Claude 구현 기준). 하루 사용량이 80%를 넘으면 새 실행을 멈춘다. 예산은 Claude 월 100만 원이다.

> 역할 이력: 10-20 "PC는 수동, 맥은 자동", "총괄은 클로드, 코딩은 코덱스" → 10-26 CTO 총괄 세션 신설 → 10-28 구현은 Codex(`codex exec`) → 11-03 "11-04까지 Codex, 11-05부터 Claude로만"(월 100만 원). Mac Codex 앱의 ROOT·ENGINE 스레드(옛 Codex 총괄)와 heartbeat 자동화 스레드에는 새 작업을 넣지 않는다. Claude 쪽 heavy 에이전트 위임은 서브에이전트 구현으로 바뀌었다. Codex용 [.codex/agents/heavy.toml](../../.codex/agents/heavy.toml)은 11-04까지만 쓴다.

---

## 2. 모든 에이전트 공통 원칙

### 2.1 작업 방식 — 프로젝트를 직접 수정한다 (2026-11-03 사용자 확정)
- 자기 worktree(브랜치)의 실제 파일을 직접 고친다. 되돌릴 기준은 git 커밋이다.
- "원본 보호"를 이유로 프로젝트 복사본을 만들어 그 안에서 편집하지 않는다. 11/02에 이 방식 때문에 작업 하나가 100~200GB를 쓰고 토큰도 낭비했다.
- "타인 WIP 불간섭·보존"은 **다른 세션이 쓰는 파일과 checkout**에만 해당한다. 자기 worktree는 자유롭게 고친다.

### 2.2 최신만 남긴다 — 디스크 (2026-11-02~03 사용자 지시)
- 새 빌드·후보·캡처·백업을 만들면 이전 것은 그 자리에서 지운다. 남기는 것은 최신 1개, 그리고 비교가 꼭 필요할 때만 직전 1개까지다.
- 빌드는 고정 폴더(예: `build-current`)에 덮어쓴다. 시도마다 `build-<이름>`·`rN/build` 같은 새 폴더를 만들지 않는다.
- 프로젝트 전체 복사는 금지다. 꼭 필요하면 Mac은 APFS 복제(`cp -c`)를 쓴다.
- 단계별 `before-*` 사본은 쌓지 않는다.
- **빌드는 git이 관리한다**(2026-11-03 사용자 "빌드는 항상 깃에서 관리가 되는데").
  - 빌드는 커밋에서 언제든 다시 만들 수 있다. 확인이 끝난 빌드는 남기지 않고, 보고서에는 빌드 폴더 대신 커밋 SHA를 적는다.
  - 지킬 가치가 있는 변경은 백업 사본·복사본·로컬 보관 빌드가 아니라 커밋·push로 지킨다.
  - 작업을 끝낼 때 커밋 안 된 실제 수정을 남기지 않는다.
  - 예외: 사용자가 여는 실행본(바탕화면 실행본 `I:\EXODUSER-Storage\unity-latest\build`, 후보 바로가기 대상 빌드)과 배포용 패키지(DEMO/EA/Steam 업로드본)는 지우지 않고 정해진 위치에 둔다. 후보 빌드는 레인 고정 폴더에 덮어쓰기만 한다.
- junction(`G:/exoduser-DEMO`·`G:/exoduser-ea` 등)은 이동·삭제 도구로 다루지 않는다. 이동·삭제 전에 reparse point인지 확인하고, junction을 따라가는 `robocopy /MOVE`·`git worktree remove --force`를 쓰지 않는다(10-21 원본 손실).
- worktree는 `git worktree add --no-checkout` + `sparse-checkout`으로 필요한 경로만 받는다. 끝나면 push와 원격 일치를 확인하고 자기 worktree를 제거한다.
- 작업 시작 때와 큰 산출물을 만든 뒤 남은 공간을 확인한다(Mac `df -h /System/Volumes/Data`, PC `Get-Volume`).
  - 남은 공간이 100GB 미만이면 정리부터 한다.
  - 작업 하나가 남긴 용량이 20GB를 넘으면 정리부터 한다.
- 묻지 않고 지워도 되는 것: 3일 넘은 자기 `_out` 산출물(Mac `~/exoduser-wt/_out`), 생성물(.uid/.import/override.cfg)만 남고 원격에 올라간 자기 worktree(브랜치는 유지), 업데이트·패키지 캐시, 쓰고 난 자기 Playwright·브라우저 임시 프로필.
- 지우기 전에 확인할 것: 그 경로를 쓰는 프로세스가 있는지(Mac `ps`, PC 프로세스 목록), 커밋 안 된 직접 수정이나 원격에 없는 커밋이 있는지, junction인지. 있으면 남긴다.
- 묻고 지울 것: 실행 중 앱 폴더, user-state·저장 데이터, 남의 산출물, `~/.codex`, Downloads, 배포 빌드.

### 2.3 검증·테스트 (2026-10-23 사용자 규칙)
1. 실패한 테스트를 코드 수정 없이 다시 돌리지 않는다. "3회 안정성 확인"·"각 2회 재현"도 금지다. 로그로 원인을 고친 뒤 그 테스트만 1회 돌린다.
2. 같은 테스트가 2번 실패하면 멈추고 보고한다.
3. 회귀는 바꾼 파일과 직접 관련된 스위트만 1회 돌린다. 전체 E2E는 통합 직전 1회만 한다.
4. 검증은 판정에 필요한 만큼만 한다: 빌드 1회, 스크린샷, 핵심 로그.
   - 바이트 manifest·해시 목록은 빌드마다 만들지 않는다(배포 직전이나 요청이 있을 때만). push 뒤 원격 SHA 대조와 실행본 SHA 확인은 이 제한에 들지 않는다(항상 한다).
   - 결함 주입이나 8뷰 캡처처럼 큰 검증은 그 작업에 꼭 필요할 때만 한다.
5. 테스트 PASS는 필요조건일 뿐이다. 화면에 보이는 작업은 실제 게임 캡처를 1x·3x로 레퍼런스 옆에서 눈으로 보고 판정한다(작업 매뉴얼 v4 G4).

### 2.4 토큰·비용
- 명령 출력은 파일로 보내고, 화면에는 요약(통과/실패 수)과 실패 줄만 `tail`·`grep`으로 읽는다. 큰 소스나 JSON을 통째로 출력하지 않는다.
- 보고서는 짧게 쓴다: 고친 것, 결과(스크린샷·판정), 남은 문제. 표 1~2개면 된다.
- 지시문도 짧게 쓴다. 공통 규칙은 "AGENT_OPERATIONS_MANUAL §2 준수" 한 줄로 대신한다.
- Claude 예산은 월 100만 원이다. 구독 주간 한도를 먼저 쓰고, 넘으면 사용자가 켠 추가 사용량으로 잇는다. 계획은 `I:\EXODUSER-Storage\codex-takeover\CLAUDE_TOKEN_PLAN_202611.md`. 유료 생성 지출은 `I:\EXODUSER-Storage\codex-takeover\SPEND_LOG.md`에 적는다.
- 작업 진행이 먼저다. 낭비는 줄이되 필요한 검증·어려운 작업에는 쓴다. 비용 경고는 한도가 닥친 뒤가 아니라 추세가 보일 때 미리 한다.

### 2.5 Git
- 작업 하나 = 브랜치 하나(`claude/<작업>-<날짜>`, 11-04까지 Codex는 `codex/…`). Unity 작업 브랜치는 unity/main으로만 병합하고 main으로 병합하지 않는다. 줄기 병합은 Claude 총괄만 검수 뒤에 한다.
- docs 정본은 unity/main이다. Unity 코드와 관련 docs를 한 커밋에 넣는다. main에는 웹 유지보수 코드와 그 docs만 넣는다.
- `git add -A`는 금지다. 새 파일은 `git add -- <경로>`로 올린 뒤, 자기 경로만 `git commit -- <경로…>`로 커밋한다(인덱스에 남은 남의 파일이 섞이지 않게, 09-30 78파일 번들 사고).
- 이미 push된 커밋의 history를 고쳐 쓰지 않는다(reset·rebase·force-push 금지). 잘못 묶였으면 provenance note만 남긴다. gc·repack·prune도 쓰지 않는다(10-27 팩 손상).
- docs를 바꾸면 `docs/CHANGELOG_SYNC.md`에 절을 추가한다. pre-commit `docs-sync-check`가 이를 검사하지만 PC 작업본에는 훅이 연결돼 있지 않으니 직접 지킨다. 훅을 우회하지 않는다.
- 레인을 시작할 때 브리프에 소유 파일을 적고, CTO가 LANES.md에 레인을 올린다. 다른 레인의 소유 파일은 수정하지 않는다.

### 2.6 리소스 (Mac 과부하 사고 2026-10-20)
- 동시 구현은 3개 이하, 동시 레인은 8개 이하다(작업 매뉴얼 v4 §4). 하루 사용량이 80%를 넘으면 새 실행을 멈춘다.
- Unity 실행은 공용 실행기의 순번·잠금을 따른다(PC `I:\EXODUSER-Storage\unity-jobs\bin\exo-unity.ps1`). 실행기의 최소 여유치(exo-unity 6GB·buildloop 8GB)만 대기 조건이다.
- 남은 메모리가 적으면 동시 실행 수를 줄이고 순차로 돌린다. 사용자 프로그램(Dota 등)이 켜져 있어도 멈추지 않고, 사용자 프로그램은 종료하지 않는다.
- 자동 실행은 무창·무음이다(작업 매뉴얼 v4 §7).

### 2.7 게임 화면 품질
- 개발 상태 문구("미이식", "연결 대기" 등)를 게임 화면에 띄우지 않는다. 연결되지 않은 기능은 숨긴다.
- 틱 경로(Unity `Update` 등)에서 리플렉션·목록 생성 API를 쓰지 않는다. 계약 검증은 최초 1회 계산해 캐시한다(Godot 시기 `get_method_list()` 규칙을 엔진 공통으로).
- CRLF 파일(예: `번역대상_전체목록.md`)은 줄바꿈을 보존한다.

### 2.8 도구 장애·권한 (2026-09-27·29 사용자 지시)
- 셸 하나가 시작하지 못해도 작업 전체를 멈추지 않는다. 다른 셸과 파일 도구로 이어 간다. 절차: [터미널 장애 대체 절차](TERMINAL_FAILURE_FALLBACK.md).
- 권한 거부를 다른 실행 경로로 우회하지 않는다.
- 실행하지 못한 Git 확인·커밋·테스트를 성공으로 보고하지 않고 미완료로 남긴다.

---

## 3. CTO·분야 총괄 매뉴얼

### 3.1 배정
- **11-05부터:** 구현은 자기 세션의 Sonnet 5.5 서브에이전트로 한다. 브리프는 파일로 쓰고, 서브에이전트에게 그 파일을 읽게 한다. 끝나면 총괄이 diff를 검수하고 경로 지정 커밋을 한다.
- **11-04까지 Codex:** 터미널 탭(run_in_terminal) 대신 Bash 백그라운드로 실행한다. 탭을 열 때마다 허용을 묻는 것을 사용자가 싫어한다. 브리프는 파일로 넘기고 stdin은 닫는다(`python -` 같은 stdin 대기 폭주 방지).
  ```bash
  # Mac
  cd <worktree> && codex exec -s danger-full-access --skip-git-repo-check - < <scratchpad>/<작업ID>.txt > ~/exoduser-wt/_out/<작업ID>/codex-exec.log 2>&1
  # PC
  codex exec -C <worktree> -s workspace-write -c notify=[] -o <결과.md> "$(cat <브리프.md>)" </dev/null > <로그> 2>&1
  ```
- 작업마다 새 실행을 쓴다(새 대화라 ctx 관리가 필요 없다). 순서를 기다릴 때는 같은 백그라운드 명령 안에서 until 루프를 쓴다.
- 모델·effort 기준: 간단(merge·수치 확인·표 갱신)은 낮게, 보통(지시서가 있는 구현)은 medium, 어려움(여러 파일 충돌·원인 불명 결함)은 high. 설정 변경은 사용자 승인이 필요하다.
- 여러 작업이 동시에 끝나면 검수보다 **다음 배정을 먼저** 넣는다. 검수 결과(RETOUCH)는 후속 작업으로 붙인다.
- 사용자가 자는 동안은 질문하지 않고 판단해서 진행한다. 단 삭제·배포·구매·설정 변경은 예외다.
- 분야 총괄은 사용자에게 직접 묻지 않는다. 결정이 필요하면 CTO에 보낸다(2026-10-28).

### 3.2 지시문 템플릿
```
[작업ID] <한 줄 목표>
worktree: <경로>  브랜치: claude/<작업>-<날짜>  기준 SHA: <unity/main SHA 이상>
소유 파일: <목록>  (그 밖의 파일은 수정 금지)
할 일:
1. ...
완료 기준: <측정 가능한 조건 + 필요한 캡처 1~3장>
규칙: docs/0마스터플랜/AGENT_OPERATIONS_MANUAL.md §2 전부 준수
 - 자기 worktree를 직접 수정(복사본 금지), 빌드는 build-current에 덮어쓰기, 이전 산출물 즉시 삭제
 - Core 수치·판정 수정 금지, git add -A 금지
 - 무창·무음, Unity는 공용 실행기 exo-unity.ps1만
 - 관련 테스트만 1회, 무수정 재실행 금지, 2회 실패 시 정지·보고
 - 출력은 파일로, 화면엔 요약만. 개발 상태 문구 노출 금지
 - 커밋·push는 총괄이 한다. 변경 파일 목록과 CHANGELOG_SYNC 초안을 보고에 적는다
보고: <레인 폴더>/REPORT.md (맨 위 3줄: 반영 SHA·경로 / 관문·판정 / 다음 일. 그 아래 고친 것 / 결과 / 남은 문제, 마지막 줄 END)
```

### 3.3 검수
- DONE이나 보고서만 믿지 않는다. 실제 브랜치 SHA(`git ls-remote` 또는 worktree log)와 diff를 확인한다.
- 화면 작업은 캡처를 직접 1x·3x로 레퍼런스 옆에서 본다. 미확인이면 "기능만 완료, 디자인 미검수"라고 적는다.
- 같은 작업이 두 번 RETOUCH되면 지시문 자체를 고친다(범위·완료 기준·금지사항).

### 3.4 정기 점검 (작업할 때마다)
| 항목 | 확인 방법 | 기준 |
|---|---|---|
| 디스크 | Mac `df -h /System/Volumes/Data`, PC `Get-Volume`, `_out` 폴더 수 | 100GB 미만이면 §2.2에 따라 정리 |
| 노는 구현 | 백그라운드 작업·서브에이전트 상태, LANES.md의 REPORT 갱신 시각 | 끝났으면 다음 작업 배정 |
| 사용량 | Claude 사용률(매시간), 11-04까지 Codex rollout `token_count.rate_limits.primary.used_percent` | 하루 80% 초과면 새 실행 정지, 급증 추세면 미리 보고 |
| 실행본 | `I:\EXODUSER-Storage\unity-latest\status\index.html`의 SHA | 예약 작업이 멈췄으면 그날 첫 결함 |
| 과부하 | 부하 평균, 남은 메모리, Mac `ls /Library/Logs/DiagnosticReports/panic-*` | 위험하면 동시 실행을 줄임 |

### 3.5 기록·보고
- 레인 진행은 레인 폴더의 REPORT.md에 갱신한다(작업 매뉴얼 v4 §4). Mac 작업노트는 `outputs/mac-work-notes/MAC_WORK_NOTES_<날짜>.md`(미추적)에 둔다.
- 보고는 한국어로 결과만 짧게, CTO 한 곳으로 보낸다(작업 매뉴얼 v4 §6). 끝난 것, 확인 안 된 것, 남은 것을 구분한다. 커밋만 하고 원격·실행본 반영이 안 됐으면 그렇게 적는다.

---

## 4. Codex 매뉴얼 (실행 담당, 11-04까지)

11-05부터 Codex 새 배정은 없다. 11-05에 진행 중 레인을 커밋·인계하고 닫으며, 이 절은 그 뒤 이력으로 남긴다.

1. **시작:** 지시문의 worktree·브랜치·기준 SHA를 확인한다. 남은 공간을 보고, 소유 파일이 LANES.md의 다른 레인과 겹치지 않는지 확인한다.
2. **작업:** 자기 worktree의 실제 파일을 직접 고친다. 빌드는 `build-current` 하나에 덮어쓴다. 새 산출물을 만들면 이전 것은 지운다.
3. **테스트:** §2.3을 따른다. 출력은 파일로 보내고 요약만 읽는다.
4. **마무리:**
   - 지시문이 커밋을 맡긴 경우에만 경로 지정 커밋(CHANGELOG_SYNC 포함) → push → 원격 SHA 확인. 맡기지 않았으면 변경 파일 목록만 보고한다.
   - 자기 중간 산출물 삭제. 남는 것은 보고서와 판정에 쓴 스크린샷·로그뿐이다.
   - worktree를 제거하라고 지시받았으면 제거한다.
5. **보고(REPORT.md 또는 SUMMARY.md):** 고친 것 / 결과(캡처 경로·판정) / 남은 문제 / 지운 산출물과 비운 용량. 마지막 줄은 `END`.
6. **멈출 때:** 같은 테스트 2회 실패, 소유 파일 밖의 수정이 필요할 때, 디스크가 부족한데 지울 수 있는 자기 산출물이 없을 때. 이유를 적고 멈춘다.
7. **Windows 창 숨김(2026-09-27):** `exec_command`는 `shell:'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'`, `tty:true`, `login:false`로 쓴다. 백그라운드 `Start-Process`에는 `-WindowStyle Hidden`을 붙인다. 시작에 실패하면 [터미널 장애 대체 절차](TERMINAL_FAILURE_FALLBACK.md)를 따른다. 창을 숨기려고 실행 중인 Codex·Git·사용자 터미널을 강제 종료하지 않는다.

> Mac 전역 Codex 규칙 `~/.codex/AGENTS.md`(Git 밖)에도 §2.1·§2.2가 들어 있다. 규칙을 바꾸면 이 문서와 그 파일을 함께 고친다.

---

## 5. PC와 Mac (2026-11-03)

- **PC는 Unity 컴파일까지 한다.** 공용 실행기 `exo-unity.ps1`로 에디터를 무창으로 돌려 컴파일·에디터 검사를 한다. PC에서 실제 창을 띄워 테스트하지 않는다.
- **Mac은 Unity 빌드·실게임 테스트·판정(작업 매뉴얼 v4 G4)을 한다.** 무창·무음으로 돌리고, 판정 캡처와 결과를 담당 총괄에 보낸다.
- **예외:** PC 예외는 사용자가 PC에서 직접 여는 빌드뿐이다: ① 예약 작업 `EXODUSER-Unity-BuildLoop`(30분)의 바탕화면 실행본 교체, ② 루프가 멈춘 동안 CTO가 정한 1회 수동 교체(정확한 unity/main SHA, 공용 실행기, 스모크 통과 뒤 `build-commit.json` 기록), ③ CTO가 승인한 후보 바로가기 빌드(레인 고정 폴더 하나에 덮어쓰기). 판정은 그래도 Mac에서 한다. 레인마다 시도용 빌드를 PC에서 만들지 않는다(Mac→PC 빌드 전송 경로가 정해지면 ③은 그쪽으로 옮긴다). 바탕화면 루프는 unity/main 빌드 → 무창 GPU 스모크·UI 겹침 검사 → `I:\EXODUSER-Storage\unity-latest\build` 교체 순서다.
- **동기화:** Unity는 origin/unity/main, 웹은 origin/main이 기준이다. 커밋 동일·디스크 동일·열린 실행본 최신을 따로 확인하고, 확인하지 못한 환경은 "미확인"으로 적는다.
- **웹 유지보수(main):** 서버·3333·DEMO/EA 동기화·웹 Steam 패치는 CLAUDE.md 부록 W를 따른다. 3333은 예약 작업 `EXODUSER_LatestWeb3333`이 관리하므로 끄거나 재시작하지 않고, 검수 서버는 다른 포트로 띄운다. node는 `C:\nvm4w\nodejs\node.exe` 전체 경로로 실행하고, python http.server는 쓰지 않는다.
- **Steam:** 웹 Steam과 Unity `unity-beta` 모두 업로드·Set Live·기본 브랜치 전환·패치노트 게시는 사용자 확인 뒤에 한다. 매일 09시 자동 릴리스 `EXODUSER_DailySteamRelease`는 정지했다(11-03 사용자 승인). 다시 켜지 않는다. 상세는 CLAUDE.md 10절과 [Steam 업데이트 규칙](../13출시·마케팅/STEAM_UPDATE_RULES.md).

---

## 6. 사고 기록과 교훈

| 날짜 | 사고 | 원인 | 지금 규칙 |
|---|---|---|---|
| 10-20 19:41 | Mac 커널 패닉·재부팅 | Codex 12개와 Godot 테스트를 동시에 돌려 남은 메모리가 90MB까지 떨어짐 | §2.6 동시 실행 제한 |
| 10-20 21:05 | 디스크 여유 18GB | 작업마다 전체 worktree(14GB) 생성 | §2.2 sparse worktree, 끝나면 제거 |
| 10-20 23:56 | Codex 주간 한도 4시간에 31→67% | 창 대화가 11만~36만 토큰으로 쌓임, 회귀 대량 재실행 | §2.4, §3.1 작업마다 새 실행 |
| 10-21 | 보관 폴더 원본 손실 | robocopy·worktree remove가 junction을 따라감 | §2.2 junction 확인 |
| 10-23 | PC 월 한도 소진 | 실패 테스트 반복 재실행, Opus heavy 4개 병렬 | §2.3, §2.6 동시 구현 3개 |
| 10-27 | C: Temp 로그 162GB | 백그라운드 `python -`가 stdin을 기다리며 오류 반복 | §3.1 stdin 닫기, v4 §7 |
| 10-27 | git 팩 손상 | 자동 재압축 중 16.9GB 팩 손상 | §2.5 gc·repack·prune 금지 |
| 10-28 | 테스트가 사용자 세이브를 덮어씀 | 세이브 격리 없이 Unity Player를 실행 | §2.6 공용 실행기만(세이브 격리) |
| 11-02 | 디스크 100%(남은 6.6GB) | `_out`에 시도마다 4GB 빌드·17GB 프로젝트 복사본·백업 사본이 쌓임(작업당 100~200GB). 게임 자체는 약 10GB | §2.1 직접 수정, §2.2 최신만 남김 |
| 11-03 | 웹·Unity 동시 진행으로 속도·결과 모두 부진 | 두 판을 함께 맞춤 | 새 개발은 Unity만(작업 매뉴얼 v4 §5) |

---

## 7. 관련 문서
- [작업 매뉴얼 v4](WORK_MANUAL_20261029.md): 품질 기준·작업 순서(이 문서보다 위)
- [터미널 장애 대체 절차](TERMINAL_FAILURE_FALLBACK.md)
- 레인 목록: `I:\EXODUSER-Storage\codex-takeover\LANES.md`(CTO), 토큰 계획: `I:\EXODUSER-Storage\codex-takeover\CLAUDE_TOKEN_PLAN_202611.md`
- [WORK_BOARD](../engine/orders/WORK_BOARD.md): Codex 작업 기록
- [PROJECT_MANAGEMENT_MASTER](PROJECT_MANAGEMENT_MASTER.md): 팀 등록부·이전 이력(10-30 v3 정리 이후 절은 origin/main 판에만 있다)
- 팀별 마스터: [아트](../17게임아트팀/ART_TEAM_MASTER.md), [QA·성능](../12퍼포먼스·최적화/QA_PERFORMANCE_TEAM_MASTER.md), [통합·빌드](../13출시·마케팅/INTEGRATION_BUILD_TEAM_MASTER.md), [밸런스](../14밸런스+수치테이블/BALANCE_ECONOMY_TEAM_MASTER.md), [애니메이션·VFX](../5.1임펙트디자인/ANIMATION_VFX_TEAM_MASTER.md), [아이템](../7아이템디자인/ITEM_TEAM_MASTER.md), [적 AI](../9적ai패턴디자인/ENEMY_AI_TEAM_MASTER.md)
- [Steam 업데이트 규칙](../13출시·마케팅/STEAM_UPDATE_RULES.md)
