# 임펙트 총괄 VFX 인계 — 2026-10-28 10:20 KST

- 세션 id `local_da9cd0e7-37a8-4d5d-9ab6-090f7f9eb8ad` / Opus / 역할: 이펙트 일관성 디자인·총괄. 명세·1x 판정만 하고 구현은 Sonnet(vfx-simple)에게 맡긴다.
- SSOT: `docs/5.1임펙트디자인/VFX_LEAD_MASTER_20261026.md`(§2 기준·§6 백로그·§7 기록), Unity 명세 `docs/5.1임펙트디자인/UNITY_RM1_VFX_SPEC_20261027.md` v2.1 **§7 마지막 행(746269dae)이 오늘 결정 전부**.
- 완료 정의(사용자, CTO 10-28): `docs/engine/UNITY_DONE_BUILD_PLAYTEST_RULE_20261028.md` 6단계 — ① 최신 unity/main 합친 상태 플레이어 빌드 오류 0(영수증을 병합 요청에 첨부) ② 병합(유니티 총괄) ③ 통합 빌드 ④ 실제 GPU 스모크 ⑤ unity-latest ⑥ 총괄이 실제 빌드 1x 판정. 에디터 캡처 = 비교 시안일 뿐.
- 메모리: `vfx-lead-role.md`, `leads-autonomous-decisions.md`, `usage-budget-rules.md`
- 재생성 사유: 컨텍스트 238K(200K 초과, CTO 기준 즉시 재생성).

## 진행 중

| 단위 | 상태 | 다음 |
|---|---|---|
| unity/main `8d34eb653` 빌드 검증 | **PASS** — 오류 0, m1-check 18/18, 유니티 총괄 전달 완료 | 끝 |
| 통합 VFX 구현 | vfx-simple에 지시 완료(10:1x): 새 브랜치 `claude/unity-pc-vfx-rm1-int-20261028` = 로컬 poison 브랜치 `c1f8f769b`(V0 + 독 폭발 + unity/main 26a11fd2f)에서, worktree `E:/exoduser-wt/pc-unity-vfx-int`, Library는 poison worktree에서 /XJ 복사. 할 일: 기검참(VFX Graph 안 속도 방향 조각·스트립, 2회 실패 시만 C# 쿼드/Trail), `KiSlashVfxView.Bind/Handle`, 좌표 어댑터 `VfxWorld.ToWorld`, partial `NativeGame.VfxCheck.cs`(`--unity-vfx-check`: 독 A·B, 기검참 1·2·3타·충전 tier, 2/4/6/12/21틱, 1920×1080 + 1x 크롭) | Unity 없는 단계 끝나면 보고 → 에디터 임포트·RM_Sandbox 비교 캡처 순번을 유니티 총괄에게 요청 → 1x 1차 판정 |
| 독 폭발 A/B | 생성기 단계 끝(로컬 `6b4b8a380`, 병합 `c1f8f769b`, Unity 미실행). 에이전트 종료, vfx-simple이 이어받음. Unity 임포트 위험 목록은 커밋 6b4b8a380 메시지·명세 §7 | RM-INT 1단계 뒤 순번(유니티 총괄이 알림) |
| RM-INT 연결 | RM-INT 세션 `local_b01f8fea-01cc-4c3d-b238-14752c64cb47`(unity-m1-sonnet)에 연결 줄 목록 + **Core 좌표→3D 월드 변환 함수 공개 요청** 보냄. 회신 대기 | 함수 이름 오면 vfx-simple에 전달(VfxWorld가 그것을 부르게) → VFX 새 파일 먼저 병합 요청(① 영수증) → RM-INT가 연결 줄 |
| Gamma 대 Linear UI 쌍 | Unity 없는 준비 끝(`E:/exoduser-wt/_out/vfx-rm1/shared_render/gamma_vs_linear/`, 7쌍·표본 76, gvl.py). 표본 위치 총괄 확인 OK | 순번 = Hero Light(UCH-03f) 뒤. 유니티 총괄 신호 → vfx-simple "지금 시작" |
| 드루이드 텔레그래프 | 미착수 | 기검참 다음 |
| 웹 VFX-02 5·6묶음, VFX-13→11 | 보류(`G:/exoduser-wt/_vfx2_b56/SPEC.md`, `_vfx1311_out`) | 독 폭발 뒤 |

## Unity 실행 규칙 (유니티 총괄 순번표)
- 모든 Unity 실행은 띄우기 전에 유니티 총괄에게 순번을 받고 한 줄 통보. 개발툴 총괄 요청이 최우선.
- 현재 순번(10:0x): HUD → unity-latest 통합 빌드 → DBT 재현 → RM-INT 1단계 → VFX② 독 폭발 → O-1 → 사운드 → … → UCH-03f Hero Light → VFX① Gamma → RM-3/2/4 → VFX③ 기검참(준비되면 재조정).
- 조건: 실행 중 Unity 0개 + 커밋 여유 20GB 이상(새 Library 빌드는 30GB 이상, 아니면 Library 복사). 측정: `Get-Process EXODUSER-Unity,Unity | Where-Object { -not $_.HasExited }`, `Win32_OperatingSystem.FreeVirtualMemory`.
- 다른 세션 Unity 종료 금지. 신호 주고받는 사이 슬롯을 뺏기면 실행 측이 직접 대기 루프로 기다렸다 바로 시작(최대 120분)하는 방식 허용.

## 연결 세션
- vfx-simple `local_e856ee78-5785-4edd-8775-cb36ae3b0713`(Sonnet). 새 일 전 get_usage, 100K 넘으면 인계 갱신 후 비움.
- 상위: CTO `local_7072229c-…`, 유니티 총괄 `local_59ad835c-2e92-44a5-bebf-0f0223217ae0`. 개발툴 총괄 `local_55f5cfd6-056d-48d3-aa2e-1724ecf3f3c1`(빌드 로그 셰이더 못 찾음 7줄 제보함). RM-1 맵 `local_82ed6674-…`(독 폭발 B 컷 대기).
- 다른 세션 메시지로 시작된 턴에서는 새 세션을 못 만든다 → 백그라운드 에이전트 1개로 대신.

## 금지·주의
- Core·판정·수치 변경 금지. NativeGame 기존 파일 수정 금지(RM-INT 몫). main에 Unity 코드 금지. game.html 메인 트리 편집 금지.
- `git add -A`·rebase·force push 금지. docs 반영은 E: 임시 worktree(`_vfxlead_docs`)에서 커밋 → 거절되면 format-patch + `git am` 루프로 비강제 push → worktree remove.
- 점·디더링 금지. 유료 생성은 사용자 확인. 창 자동 열기·서버 재시작 금지. 같은 이유 2회 실패면 멈춤. 서브에이전트 1개.

## 재개 후 첫 행동
1. get_usage(self). vfx-simple 보고·RM-INT 회신·유니티 총괄 순번 알림이 와 있으면 처리.
2. RM-INT 좌표 함수 이름 → vfx-simple 전달.
3. vfx-simple의 Unity 없는 단계 보고 → 검토 → 순번 요청.
