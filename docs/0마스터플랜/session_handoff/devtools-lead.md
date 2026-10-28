# 개발툴 총괄 인계 — 2026-10-28 22:10 KST

- 세션 `local_55f5cfd6` (Opus). 역할: Unity 개발툴·실행 기반 총괄(명세·검수·커밋). 구현은 **Codex(`exo-codex.ps1`)** 로만(10-28 사용자 지시, Sonnet 하위 에이전트 추가 금지). 보고는 CTO(`local_7072229c`)에게만, 작업 단위 끝에 한 번.
- SSOT: main `docs/engine/UNITY_DEVTOOLS_MASTER_20261028.md`(§1 실측, §3 DT 목록, §5.1 진행 현황, §6 결정). 사고 기록도 거기 있다.

## 끝난 것 (unity/main 병합됨)
- DT-01 공용 실행기·작업 서버 `unity/Tools/devtools/exo-unity.ps1` + `Editor/DevTools/JobServer/` (상주 서버 job 6.6~7.3배 빠름, 잠금·예약 큐·HALT·USER_SAVE·창 옵션 거부·빌드 전 영상 복원).
- DT-02 MapLint `Editor/DevTools/MapLint/` (맵 총괄이 구조 판정 기준 도구로 채택. 데칼 L1 판정 대기).
- DT-03 LookDev `Editor/DevTools/LookDev/` (measure_L.py와 지표 차이 0, DARK 경고).
- DT-15 buildloop + 세이브 격리 fail-closed(`QaRunPolicy` — `Runtime/Core/Platform/`). unity-latest = 06b86008c(무창 GPU 스모크 m1 21/21).

## 진행 중 (재개 시 확인)
1. **Sonnet 하위 에이전트 3개 마무리 대기**(이 세션 안, 새 작업 금지 통보함):
   - DT-01 `claude/unity-pc-devtools-runner2-20261028` (116917c5c 시작 조건 기본값 + `player -Desktop hidden` + build 쉼표 인자 결함 + README 짧은 예시) → 끝나면 유니티 총괄에 병합 요청.
   - DT-15 `claude/unity-pc-devtools-buildloop3-20261028` (숨은 데스크톱 스모크 기본, 하네스 플레이어 정렬, requiredMedia에 `title_motion_20261028.mp4`) + **b0f9a0c52 이후 최신 unity/main 통합 빌드 → unity-latest 교체 → SHA를 유니티 총괄·보스전 총괄(local_a98acebe)·최신버전 테스트 총괄(local_fa43bff5)에 전달**.
   - DT-16 웹 인트로 진단(`claude/unity-pc-devtools-web-introdiag-20261028`, LOBBY_KEY 로그) → 결과를 유니티 총괄·simple-sonnet(local_f344c67e)에 전달. 웹 브랜치 GUID 정렬 커밋.
2. **Codex 실행 중**: 워크트리 `E:\exoduser-wt\pc-unity-devtools-codex`(브랜치 `claude/unity-pc-devtools-codex-20261028`, 미커밋). 실행 기록 `I:\EXODUSER-Storage\codex-runs\20261028-220531_worktree-clean\`.
   - 이미 만든 것(검수 끝, 미커밋): `exo-codex.ps1`·README 절·selftest. 종단 시험 `20261028-220413_selftest-e2e` 통과(커밋 안 함·잠금 정리). 결함: ExitCode 미수신(이번 실행에서 수정 중), `-Background`를 bash 파이프로 부르면 반환이 늦음, codex exec마다 meshy 등 MCP node 프로세스가 뜸(메모리) → 래퍼에서 MCP 끄는 옵션 후보.
   - 이번 실행: `exo-worktree-clean.ps1`(scan 읽기 전용 + 사람이 실행하는 apply, 링크 선제 해제, 재생성 불가 무시 파일 보호). 보호 목록 `I:\EXODUSER-Storage\worktree-clean\active.json`.
   - 끝나면: diff 검수 → `codex-e2e.txt`·`docs/engine/PC_CODEX_EXECUTION_20261028.md`는 unity 커밋에서 빼고(문서는 main으로 옮김) 경로 지정 커밋 → push → 유니티 총괄 병합 요청. scan 결과(후보·크기·회수량)를 CTO에 보고. **apply(영구 삭제)는 사용자가 직접 실행**(개발툴은 실행하지 않음).

## 웹 테스트 빌드
- 최신 미리보기(로그인 필요): https://exoduser-unity-web-test-dzze3854y-fordeargamers.vercel.app (빌드5, 175MB, WebGPU). 브랜치 `claude/unity-pc-devtools-web-20261028` 4af345fc5(병합 안 함). Production 빈 페이지·예전 미리보기는 사용자 정리 대상. 외부 배포는 사용자 사전 승인 사항.
- 남은 것: Unity 스플래시 끄기(다음 빌드), HUD 스킬 바 회색 띠(런타임, WebGPU Readback), 인트로 자동 테스트 순서(진단 결과 뒤).

## 규칙 메모
- 승인 방식(10-28): 되돌리기 쉬운 범위는 진행하고 컨펌 목록은 단위 끝에 CTO로. 먼저 승인: 유료 크레딧, 외부 배포, 되돌릴 수 없는 삭제.
- Unity 시작 조건(승인됨): 에디터 Library 있음 12GB / 없음 20GB / 플레이어 10GB, 동시 1. 자동 실행은 무창(숨은 데스크톱 또는 batchmode GPU)·무음·세이브 격리 필수.
- 사용량: Claude 주간 94%(10-28 22시), 리셋 11-01. 진행 알림 금지, 기다리는 턴 금지.
