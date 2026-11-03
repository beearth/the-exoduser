# 임펙트 총괄 VFX 인계 — 2026-10-28 10:20 KST

## Codex 인수 갱신 — 2026-10-28 22:51 KST

- 전용 작업 트리 `E:/exoduser-wt/codex-vfx`, 브랜치 `codex/pc-vfx-rm1-int-20261028`, 커밋·원격 SHA `919fd0597714e2544a8ceb3905aedfa57442ff56`. 시작점은 독 폭발 `c1f8f769b`이고 원격 `unity/main` `b0f9a0c52`를 비강제 병합했다. Core와 기존 `NativeGame.cs`는 수정하지 않았다.
- 기검참 VFX Graph(코어·속도 방향 조각·투사체별 스트립), `KiSlashVfxView`, 3타 그을음 데칼, `VfxWorld`, 독 브리지 좌표 경유, 새 `NativeGame.VfxCheck.cs`를 작성했다. 상세 수치·파일·검증 경계는 `docs/5.1임펙트디자인/UNITY_RM1_VFX_IMPLEMENTATION_20261028.md`.
- 정적 근거: 그래프 생성 2회 동일 SHA256, YAML 183문서·노출 속성 8개·구조 오류 0, Roslyn 구문 오류 0(`nostdlib` 검사), `git diff --cached --check` 통과. **Unity 임포트·컴파일·에디터 캡처·Player 빌드·GPU 스모크·1x 판정은 미실행.** 이 시점에 타인 Unity PID 7068이 실행 중이고 사용 가능 메모리 18.9GB라 순번 조건에 미달했다.
- RM-INT 좌표 API 이름은 인계에 이미 확정됨. `RemodelWorld`가 아직 `origin/unity/main`에 없어 `VfxWorld`는 임시 XZ 변환 한 곳만 사용한다. RM-INT 브랜치를 VFX에 직접 병합하지 않는다. 병합 대상이 아니라 **통합 검증 대기 후보**로 `MERGE_QUEUE.md`에 기록한다. 적 독 탄 중첩 1x 캡처와 웹 기준 비교는 필수 남은 게이트다.
- 아래 10:20 표·세션 재개 절차는 당시 이력이다. 다음 실제 행동: RM-INT 1단계의 `unity/main` 병합 확인 → 최신 줄기 병합·좌표 어댑터 교체 → Unity 실행 순번/메모리 확보 → 임포트·빌드 영수증·RM-1 1x 캡처 → 통합 담당에 검증 후보 전달.

- 세션 id `local_da9cd0e7-37a8-4d5d-9ab6-090f7f9eb8ad` / Opus / 역할: 이펙트 일관성 디자인·총괄. 명세·1x 판정만 하고 구현은 Sonnet(vfx-simple)에게 맡긴다.
- SSOT: `docs/5.1임펙트디자인/VFX_LEAD_MASTER_20261026.md`(§2 기준·§6 백로그·§7 기록), Unity 명세 `docs/5.1임펙트디자인/UNITY_RM1_VFX_SPEC_20261027.md` v2.1 **§7 마지막 행(746269dae)이 오늘 결정 전부**.
- 완료 정의(사용자, CTO 10-28): `docs/engine/UNITY_DONE_BUILD_PLAYTEST_RULE_20261028.md` 6단계 — ① 최신 unity/main 합친 상태 플레이어 빌드 오류 0(영수증을 병합 요청에 첨부) ② 병합(유니티 총괄) ③ 통합 빌드 ④ 실제 GPU 스모크 ⑤ unity-latest ⑥ 총괄이 실제 빌드 1x 판정. 에디터 캡처 = 비교 시안일 뿐.
- 메모리: `vfx-lead-role.md`, `leads-autonomous-decisions.md`, `usage-budget-rules.md`
- 재생성 사유: 컨텍스트 238K(200K 초과, CTO 기준 즉시 재생성).

## 진행 중

| 단위 | 상태 | 다음 |
|---|---|---|
| unity/main `8d34eb653` 빌드 검증 | **PASS** — 오류 0, m1-check 18/18, 유니티 총괄 전달 완료 | 끝 |
| 통합 VFX 구현 | Codex 후보 `919fd0597` 원격 보존. 그래프·뷰·좌표·검수 partial 작성, Unity 미실행 | RM-INT 선행 병합 뒤 좌표 연결·Unity 컴파일·캡처·1x 판정 |
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

## 추가 (10:3x, 비우기 직전)
- **RM-INT 좌표 API 확정**: 브랜치 `claude/unity-pc-rm-int-20261028` `6f2497a01`, `Runtime/NativeRemodel3D.cs`(Exoduser.UnityPort). `RemodelWorld.ToWorld(x,y)`(x=px/100, z=−py/100, y=지형 높이)·`ToWorld(x,y,height)`·`GroundHeight`·`GroundNormal`·`ToCore`·`Active`. 3D 카메라 = `NativeGame.Remodel3DCamera`(Camera.main은 2D 논리 카메라와 태그 겹침). 순서 합의: RemodelWorld가 RM-INT 1단계 병합으로 unity/main에 먼저 → VFX가 unity/main 합쳐 VfxWorld를 RemodelWorld로 바꾼 뒤 병합 요청 → RM-INT가 연결 줄(1~5). VFX 브랜치에 RM-INT 브랜치 merge 금지. VFX 클래스가 unity/main에 들어가면 RM-INT(`local_b01f8fea-01cc-4c3d-b238-14752c64cb47`)에 알린다.
- **vfx-simple 상태**: 컨텍스트 283K로 새 작업 미착수. 인계 `session_handoff/vfx-simple.md` 로컬 커밋 `2e5620685`(sparse worktree `G:/exoduser-wt/_vfxhandoff`) — 좌표 API 문단을 새 커밋으로 덧붙여 push하라고 지시함(전달 대기). **재개 후 확인**: origin/main에 vfx-simple.md 갱신이 올라왔는지 → 올라왔으면 vfx-simple을 비우게(방식 A: 그 세션이 스스로 `clear_session` self) 하고 재개 지시(통합 브랜치·기검참·VfxCheck, 인계 문서 기준). 안 올라왔으면 push부터 다시 지시.
