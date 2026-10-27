# 유니티 이식 전체 총괄 인계 — 2026-10-26 22:50 KST
- 세션 id `local_a65bb55a-bb3e-4c4a-a93d-412fc163bd80` / claude-opus-5-5 / bypassPermissions / 역할: Unity 이식 100% 전체총괄(방향·우선순위·배정·사용자 보고). 직접 구현·문서 반영 금지(CTO 규칙)

## 기준 문서(SSOT)
- 100% 분모: `docs/engine/UNITY_PORT_MASTER_20261026.md` (main, 64행, 상태 0/1/2/3)
- 업무협약: `docs/engine/orders/UNITY_CLAUDE_CODEX_AGREEMENT_20261026.md` (§1 Unity 6000.6.7f1 통일, §2 소유, §5 결정, §7 3D 맵 분담)
- PC→Mac 요청: `docs/engine/orders/PC_TO_MAC_INBOX_20261021.md` — **main과 codex/unity-mac-20261024 두 곳에 동시 게시**(Codex는 자기 브랜치만 읽음) 병합 대상은 unity/main(10-27, CLAUDE.md §엔진별 버전 분리).
- 3D 맵 기획서: `docs/4.1맵디자인+설정/UNITY_MAP_HQ_PRODUCTION_PLAN_20261026.md` (§4.5 생동감 L1~L9, §4.6 Moon Studios 방식)
- 맵 아트 바이블 통합본 v2: main `fc4989628` (디자인총괄 eb8a8577, `MAP_ART_BIBLE_v2_*`). 이전 두 바이블(UNITY_MAP_ART_BIBLE / UNITY_ART_BIBLE_V1)은 대체
- 메모리: `unity-port-overall-lead.md`, `sonnet-simple-session-always-on.md`, `port-switched-to-unity-codex.md`

## 조직 (세션 id)
| 역할 | id | 전속 Sonnet |
|---|---|---|
| CTO 전체 작업 총괄 (재생성 재개 담당) | local_7072229c-70cf-4fdf-ab35-c3c59e683d53 | — |
| 맥북 총괄 (구현 명세·검수, B군 진행) | local_f25393ea-f5e3-45f1-80fa-c16e9daa4c6c | 원래 Sonnet local_f344c67e-e388-4d43-a01e-47980c6f1bbd (B07 진행 → B05 구현 → B03) |
| 디자인총괄 (유일, 시각 기준·2차 판정) | local_eb8a8577-c0e4-4a9f-b628-fac0c8549dbf | 단순작업4 local_ee476d71-fea4-4528-8bbd-a09b9f527ba2 (645K, 재생성 대상) |
| 맵 총괄 (맵 계획·판정 G1~G8) | local_9d17d95b-239c-4254-8bef-555b6c5e16e8 | 단순작업3 local_b8b2b4c2-0b81-4237-88d7-3eac922ffdb1 (700K, 재생성 대상, LIFE1→PAINTGROUND→TOXIC→M1) |
| 보스전 총괄 (A23·C01·C03) | local_a98acebe-ea98-4dda-9441-d10b1c7622ed | 단순작업2 local_f5128d34-7688-41f5-aadd-cfd69014d707 (CX-01 진행) |
| (종료) 내가 만든 디자인 세션 | local_a1efbc31-1a15-4010-a047-552782aa3c3e | 인계 완료·idle. 새 작업 주지 말 것. 보관은 사용자 결정 |
| Codex (Mac) | 직접 연락 불가 → INBOX 두 곳 | — |

## 진척 (마스터 보드 기준, 22시 무렵)
- 상태 2: A07 탭바·A08 인벤·A09 유골함·A10 보관함·A11 유물·A12 스킬·A13 능력치·A14 대장간·A16 키바인딩·A19·A20 레벨업·A21 사망·A24 구역제목·A25 툴팁·A26 빌드분기·B02·B11 자동물약·E01·E02
- 상태 1: A22 클리어·A23 보스바(이벤트 없음), MAP3D(C04/F03) 슬라이스 v2 RETOUCH
- B군: PC가 Core 구현(새 파일 Runtime/Core/Combat/, oracle로 웹 대조, 연결은 patch). B05=무기 7·석궁 3
- **Codex 병합 0건**. 최신 누적 병합 요청 = A16 포함 ★×8 `24c20a94a` + patch 18(+B11 patch 19). Codex는 아랍어 자막 우선

## 이번 대화의 확정 결정 (일부는 메모리에 이미 있음)
- UI = 웹 그대로. 정의는 웹, 상태는 Unity 값, 없으면 "미이식"(가짜 표시 금지)
- Unity 6000.6.7f1 통일(6000.4.8f1 종료 크래시 = 엔진 결함). 색공간 Gamma 유지(Linear 보류)
- 3D 맵: Godot LOOK-001 C안 기준, 아트 키워드 "음습하고 아름다운 지옥", 원본 손그림 청크 바닥 + 칠한 빛 70:30, 생동감 L1~L9, 절차 메시는 중단(임시용). 톤 판정은 눈으로(숫자 일치 ≠ 통과)
- 3D 메시 = Meshy. 사용자 확정: PC에서만 호출. PC에 MESHY_API_KEY 아직 없음(Mac MCP 잔액 4,440cr 관측). GPT 이미지 누적 약 $0.42
- CTO 규칙: 총괄 직접 작업 금지, 총괄 1명당 Sonnet 1개, 보관 금지, 내부 Opus 에이전트 대체 금지

## 사용자 답 대기
1. 웹 결함 후보 4건(키 초기화 18개만·알림 가려짐·탭 이모지·KeyY/KeyU 표기)을 웹에서도 고칠지
2. 웹 docs 2_1·14와 코드 차이 43건(B03) 동기화 작업을 돌릴지
3. CLAUDE.md DEMO/EA sed 절차가 build-target.js 방식과 달라 무효 — 고칠지
4. 바이블 통합 충돌 중 취향 항목(바닥 붉기 등)은 디자인총괄이 사용자에게 직접 묻기로 함

## 주의
- 세션 간 메시지 상한(연속 약 11회) — 단계 완료 때만 주고받기
- 권한 거부를 다른 세션으로 우회 금지. GIT_INDEX_FILE+commit-tree+push 한 줄 방식은 거부됨 → E:/exoduser-wt 임시 worktree(--detach) + 경로 지정 커밋 + non-force push, 정리 전 reparse 확인
- G: 로컬 main은 원격과 갈라져 있음(1770c2698, 3781f44e4 등 로컬 전용). 히스토리 재작성 금지
- PC 블루스크린 재시작 잦음 → 재개 후 list_sessions로 idle 세션 확인·재배정
- 영상·소리 나는 페이지를 내장 브라우저로 열지 말 것(소리 사고)
- 배정 전에 main 마스터 보드에서 미배정인지 확인(A10 중복 배정 사고)

## 재개 후 첫 행동
1. 이 문서와 MEMORY.md, 마스터 보드 main 최신본을 읽는다
2. `list_sessions`로 각 총괄·Sonnet 상태를 보고 idle이면 소속 총괄에게 배정을 요청한다
3. Codex 브랜치 최신 커밋에서 PC 병합 여부(`merge-base --is-ancestor 05c6e583b`)와 WORK_BOARD의 PC 관련 기록을 확인한다
