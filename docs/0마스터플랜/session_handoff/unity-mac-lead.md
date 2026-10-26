# 유니티 이식 맥북 총괄 인계 — 2026-10-26 밤

- 세션: 유니티 이식 맥북 총괄 (Opus 5.5). 역할 = Unity 이식 PC 구현 **명세·검수·판단·배정**(CTO 규칙: 구현·커밋·문서 반영은 Sonnet에), 병합 요청을 Codex INBOX 두 곳에 게시.
- 상위: 유니티 이식 전체 총괄 `local_a65bb55a-bb3e-4c4a-a93d-412fc163bd80`, CTO `local_7072229c-70cf-4fdf-ab35-c3c59e683d53`.
- 메모리 상세: `unity-port-mac-supervisor-role.md`(역할·소속·규칙), `map-tone-numeric-match-not-acceptance.md`.

## 기준 문서 (SSOT)
- 진척 분모: main `docs/engine/UNITY_PORT_MASTER_20261026.md` (상태 0/1/2/3)
- Codex 전달: `docs/engine/orders/PC_TO_MAC_INBOX_20261021.md` — **main과 `codex/unity-mac-20261024` 두 곳에 같은 항목**
- 협약: main `docs/engine/orders/UNITY_CLAUDE_CODEX_AGREEMENT_20261026.md`(§2 B군 Core=PC 새 파일·연결=Codex patch, §7.1 맵 시각 2차 판정=디자인총괄)
- 맵: `docs/4.1맵디자인+설정/UNITY_MAP_BOARD_20261026.md`(맵 총괄), 기획서 `UNITY_MAP_HQ_PRODUCTION_PLAN_20261026.md`
- 추출표: `docs/engine/UNITY_B03_WEB_EXTRACT_1_20261026.md`, `UNITY_B05_WEB_EXTRACT_20261026.md`, `UNITY_B07_WEB_EXTRACT_20261026.md`, `UNITY_B11_WEB_EXTRACT_20261026.md`

## 브랜치 현황
| 브랜치 | tip | 내용 |
|---|---|---|
| `claude/unity-pc-inventory-u04-20261026` (누적, worktree `E:/exoduser-wt/pc-unity-win`) | `a48faf9ea` | UI A07~A26·A16 병합·B11. **Codex patch 19개** 순서(INBOX 최신 ★9 항목) |
| `claude/unity-pc-b07-20261026` (worktree `E:/exoduser-wt/pc-unity-a16`) | `24c20a94a` 기반 | B07 진행 중(원 Sonnet, 미커밋) |
| `claude/unity-pc-map3d-20261026` (worktree `E:/exoduser-wt/pc-unity-map3d`) | `0bf374355` | 슬라이스 v1 `e64e57889`, v2 `23451c97a`(RETOUCH), LIFE1+M1 본체 |
- patch 순서: U04B→U08×2→U05→A07B×2→A13→A14→A20→A21→A22→A23→A24→A26×2(14·15)→A16×3(16~18)→B11(19). 다음 번호는 인수 순서로 정함(파일 이름엔 번호 안 넣음).

## 진행 중 작업 단위
| 단위 | 담당 Sonnet | 단계 | 명세 |
|---|---|---|---|
| B07 돌진·패링 Core + 원본 실행 oracle | 원 Sonnet `local_f344c67e-e388-4d43-a01e-47980c6f1bbd` | 구현 중(보고 대기). **이 Sonnet 964K → 재생성 먼저, 새 일 금지** | `E:/exoduser-wt/_out/pc-b07-impl/SPEC.md` (파일은 `Runtime/Core/` 평면 — 정정 메시지 보냄) |
| PAINTGROUND → TOXIC → MESHY-0/M1 | 단순작업3(맵 총괄 전속) | PAINTGROUND 진행 | `_out/pc-map3d-paintground/SPEC.md`(§0.5 바이블 §12 RETOUCH 5항목), `_out/pc-map3d-toxic/SPEC.md`(색 = **통합 대기**) |
- 원 Sonnet 다음 대기열: B05 Core 구현 → B03(공통 규칙 명세 `_out/pc-b03-core1/SPEC.md` 재사용 가능, 단순작업2가 남긴 PROGRESS 있음).
- 문서 반영 대기열: `E:/exoduser-wt/_out/macbook-docs-queue/QUEUE.md` Q1(맵 보드 LIFE1 행 상태, 두 곳). 원 Sonnet 재생성 뒤 실행.

## 대기 중
- 원 Sonnet B07 결과 보고 → 검수(oracle 수·RED→GREEN·patch 1~19 위 적용·Codex 파일 변경 0) → 커밋은 Sonnet이 경로 지정으로 → 누적 브랜치 병합 → INBOX 두 곳.
- 디자인총괄 `local_eb8a8577-c0e4-4a9f-b628-fac0c8549dbf`(유일): 두 아트 바이블 통합본 → 나오면 **급한 Codex 통보**로 INBOX 두 곳 + 맵·보스전 총괄 공지, TOXIC 색 상수 교체. 맵 보드 §5 임시 기준(두 바이블 혼합) 확인도 eb8a8577에 받을 것(대조표 `_out/design-reconcile/COMPARE.md`).
- 맵 총괄에 미전송 답장: "LIFE1 보드 수정 = 대기열 Q1, 급하면 단순작업3이 같은 절차로 해도 됨" (메시지 상한으로 못 보냄).
- `_out/inbox-artbible-v1/`은 **보류**(구 디자인 총괄 기준, 게시 금지).

## 소속·연결 세션
- 원 Sonnet = 맥북 총괄 전속(유일하게 직접 배정). 단순작업2 `f5128d34` = 보스전 총괄 `local_a98acebe-ea98-4dda-9441-d10b1c7622ed`, 단순작업3 `b8b2b4c2` = 맵 총괄 `local_9d17d95b-239c-4254-8bef-555b6c5e16e8`, 단순작업4 `ee476d71` = 디자인총괄.
- 보드 담당: A23·C01·C03 = 보스전 총괄(반영 완료).

## 이번 대화 확정 (docs·메모리 외)
- B군 파일은 `Runtime/Core/` 평면(하위 폴더면 기존 .NET 검사 csproj 와일드카드 깨짐), Codex `Simulation` 확장은 새 partial 파일, 기존 Codex 파일은 patch만.
- 웹 결함·웹 특이 동작은 **웹 그대로** 이식(예: 떠오르는 텍스트 화이트리스트, 키 초기화 18개, `KeyY` 표기). 웹 수정은 사용자 판단(전체총괄이 올림).
- 톤 판정은 수치 일치가 아니라 기준 이미지 옆 1x 눈 판정(슬라이스 v2 실수).
- 다른 세션이 **권한 거부**로 못 한 커밋은 대신 하지 않는다.

## 금지·주의
- `git add -A` 금지, 경로 지정만. history rewrite·force push 금지. G:/exoduser main 작업 트리에서 커밋·push 금지(로컬 main은 origin과 갈라져 있음 — 임시 worktree 사용).
- Codex 소유(`NativeGame*`·`NativeHud*`·`NativePauseMenu*`·`NativeLobby*`·Simulation/기존 Core·ProjectSettings·Packages) 직접 수정 금지.
- 세션 간 메시지는 사용자 입력 없이 약 10회면 자동 정지 — 단계 끝에만 보낸다.

## 재개 후 첫 행동
1. MEMORY.md와 이 문서, `unity-port-mac-supervisor-role.md`를 읽는다.
2. 맵 총괄에 미전송 답장 1줄 보내기(위 "대기 중").
3. 원 Sonnet 재생성 완료 확인(`get_usage`) 뒤 B07 결과를 받아 검수.
