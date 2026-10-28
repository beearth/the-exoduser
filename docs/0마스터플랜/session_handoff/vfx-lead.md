# 임펙트 총괄 VFX 인계 — 2026-10-28 03:15 KST

- 세션 id `local_da9cd0e7-37a8-4d5d-9ab6-090f7f9eb8ad` / Opus / 역할: 이펙트 일관성 디자인·총괄. 명세·1x 판정만 하고, 구현은 Sonnet에게 맡긴다.
- SSOT
  - `docs/5.1임펙트디자인/VFX_LEAD_MASTER_20261026.md` (§2 기준·§6 백로그·§7 기록)
  - Unity: `docs/5.1임펙트디자인/UNITY_RM1_VFX_SPEC_20261027.md` (v2.1, §3 대상 4종, §5 순서, §7 기록)
- 메모리: `vfx-lead-role.md`, `leads-autonomous-decisions.md`, `usage-budget-rules.md`
- 재생성 사유: 컨텍스트 315K로 200K를 넘어 즉시 재생성(CTO 10-28 기준 100K/200K).

## 진행 중 작업 단위

| 단위 | 단계 | 남은 일 | 위치 |
|---|---|---|---|
| VFX-RM1 V0 | **조건부 PASS**. `d5943d1c4`(브랜치 `claude/unity-pc-vfx-rm1-20261027`, worktree `E:/exoduser-wt/pc-unity-vfx-rm1`) | 서브그래프(VFXS_*)가 실제로 동작하는지는 기검참에서 판정 | `_out/vfx-rm1/v0_decal`, `v0_bubble` |
| 공유 렌더 | **unity/main 병합 완료**: `0840fc1ef`→`2f41eddf2`, `0ebc103c0`(Linear)→`8d34eb653` | ① `8d34eb653` 빌드 검증 1회(유니티 총괄 요청) ② Gamma 대 Linear UI 한 쌍 — **웹 대조는 포트 3341**(UI 세션이 origin/main으로 띄운 서버. 3333 작업본은 147커밋 뒤처진 옛 화면이라 무효) | `E:/exoduser-wt/_out/vfx-rm1/shared_render/` |
| 기검참(명세 §3.1) | 미착수 | vfx-simple이 맡는다. **VfxBridge.cs는 고치지 않고 새 뷰 파일로 연결** | `_out/vfx-rm1/kislash/` |
| 독 폭발 A/B(§3.2) | 에이전트가 세션 종료와 함께 중단됨. 브랜치 `claude/unity-pc-vfx-poison-20261028`(로컬 전용, `5d96f16db`)는 unity/main merge 상태, worktree `E:/exoduser-wt/pc-unity-vfx-poison-c`, 작업물 없음 | 재배정. 파일 분리 규칙: `gen_vfx_poison.py`, `VFX_PoisonBurst.vfx`, VfxBridge의 독 블록만, `Editor/VfxRm1PoisonCapture.cs`. **RM-1 맵 세션이 변형 B(악의구) 「독 스킬 터진 프레임」을 기다린다** | `_out/vfx-rm1/poison/` |
| 웹 VFX-02 5·6묶음 | 에이전트 중단. 후보 일부가 `G:/exoduser-wt/_vfx2_b56/sheets/`(b5 v1·v2·g16 raw, b6 v1 raw)에 있음 | 명세 `G:/exoduser-wt/_vfx2_b56/SPEC.md` 그대로 재개 → 1x 판정 → 반영 | 같은 폴더 |
| 웹 VFX-13→VFX-11 | 에이전트 중단(CTO 감축). 중간 산출물 `G:/exoduser-wt/_vfx1311_out` | 앞의 작업이 끝난 뒤 재개(Opus 권장). 절차는 `G:/exoduser-wt/_vfx12/SPEC.md`와 같다 | — |
| 드루이드 텔레그래프 데칼 | 공유 렌더 병합으로 착수 가능 | 기검참 다음. 4번 가시 뿌리는 직선 Line(`_Shape 2`)만 | — |

## 실행 조건 (CTO 10-28 공통 규칙, 필수)
- Unity 에디터·batch·빌드·플레이어는 **PC 전체에서 동시에 1개만** 실행한다. 진행 조건은 두 가지다.
  - 커밋 여유(`Win32_OperatingSystem.FreeVirtualMemory`) **20GB 이상**
  - 실제로 실행 중인 Unity **0개** — `Get-Process EXODUSER-Unity,Unity | Where-Object { -not $_.HasExited }`
  - 이미 죽은 EXODUSER-Unity 6개(PID 16000·42964·55684·59020·69200·75328)는 개수에서 뺀다. 재부팅 전까지 메모리를 붙잡고 있다.
  - 마지막 측정(03:0x)은 커밋 여유 12.1GB로 미달이었다. 재부팅이 필요할 수 있다.
- 병렬 서브에이전트는 **1개만** 쓴다(CTO 10-28 최신 지시, 주간 사용량 61% → 하루 약 8%p 페이스).
- 작업 단위가 끝날 때마다 `get_usage(self)`를 확인한다. 100K를 넘으면 재생성, 200K를 넘으면 즉시 재생성한다. vfx-simple에도 같은 기준을 적용한다.
- 실행본·Playwright·Chrome은 끝나는 즉시 자기 것을 끈다.

## 대기 중
- 유니티 총괄(`local_59ad835c-2e92-44a5-bebf-0f0223217ae0`): ① 빌드 검증 결과 ② Gamma 대 Linear UI 쌍 결과를 기다린다(차이가 있으면 UI 세션 cfdcb6da에 배정). Sandbox가 어두운 문제는 RM-0 세션이 재조정 중이다.
- vfx-simple: 대기 중이다(메모리 조건 미달). 재개 지시 순서는 빌드 검증 → UI 쌍(3341) → 기검참.

## 연결 세션
- vfx-simple `local_e856ee78-5785-4edd-8775-cb36ae3b0713` (Sonnet, 인계 문서 `session_handoff/vfx-simple.md`). 컨텍스트가 클 수 있으니 새 일을 맡기기 전에 `get_usage`로 확인하고, 필요하면 방식 B로 비운다.
- 상위: CTO `local_7072229c-70cf-4fdf-ab35-c3c59e683d53`, 유니티 총괄 `local_59ad835c-…`
- 참여 총괄: 캐릭터 총괄 `local_7de36273…`(Hero Light 브랜치 `claude/unity-pc-herolight-20261028`, 공유 렌더 다음 병합), 보스전 총괄 `local_a98acebe…`, 맵 총괄 `local_9d17d95b…`, 디자인총괄 `local_eb8a8577…`
- 이 세션은 다른 세션의 메시지로 시작된 턴에서는 새 세션을 만들 수 없다. 그럴 때는 백그라운드 에이전트(Agent 도구)로 대신한다.

## 이번에 확정된 판정·결정 (docs 기록 `d45d0a4c9`)
- 공유 렌더 1x: 1-1 M1 PASS. RM_Sandbox 밝기 중앙값 23.7 → 1.3(후처리) → 4.7(+Linear). RM0-LIGHT Volume을 다시 보정해야 한다.
- PC_High와 Mac_Balanced 캡처가 같은 이유: 파이프라인은 실제로 바뀌었고, 차이는 블록 그림자 영역에만 있다(vfx-simple 1b).
- 신설 팔레트 제안(5·6묶음 반영 때 §2.2에 추가)
  - 바람: `#ece6da`/`#8e8a80`/`#24221e`, 채도 ≤0.15
  - 자연: `#d6e6d0`/`#547c48`/`#1a2616`, 100~112°, 76~95° 금지
  - `Nature_*`가 적 전용이면 적 독 행을 쓴다

## 금지·주의
- Core·판정·수치 변경 금지. main에 Unity 코드 금지. 메인 트리 game.html 편집 금지(임시 worktree에서 치환 스크립트로).
- `git add -A`·rebase·force push 금지. docs 반영은 E: 임시 worktree에서 `git am` 루프로 비강제 push한다(G:에서는 worktree 생성이 실패한 적 있음).
- 점·디더링 금지. 유료 생성은 사용자 확인 후. 서버 재시작·창 자동 열기 금지. 같은 이유 2회 실패면 멈춘다.

## 재개 후 첫 행동
1. 커밋 여유와 실행 중인 Unity 개수를 측정한다. 조건이 맞으면 vfx-simple에 빌드 검증(`8d34eb653`)을 지시한다.
2. 서브에이전트 1개 슬롯은 독 폭발 A/B를 먼저 재배정한다(RM-1이 기다림). Unity가 필요 없는 단계부터 시작한다.
3. 웹 5·6묶음은 독 폭발이 끝난 뒤 재개한다.
