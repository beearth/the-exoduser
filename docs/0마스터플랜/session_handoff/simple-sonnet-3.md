# 단순작업3(Sonnet) 인계 — 2026-10-27 (C04-ORACLE PASS, C04-ORACLE-2 조사 완료·추출 전, 컨텍스트 305K)

- Sonnet 5.5 / 맵 총괄 전속 구현·추출·캡처 담당. 모든 응답 한국어. 세션 id는 시작 때 확인(이전 `local_b8b2b4c2-…`, 현재 세션은 전체총괄이 시작).
- 소속·연결: 맵 총괄 `local_9d17d95b-239c-4254-8bef-555b6c5e16e8`(명세·판정) · 디자인총괄 `local_eb8a8577-c0e4-4a9f-b628-fac0c8549dbf` · 맥북 총괄 `local_f25393ea-f5e3-45f1-80fa-c16e9daa4c6c` · 유니티 전체 총괄 `local_a65bb55a-bb3e-4c4a-a93d-412fc163bd80` · CTO `local_7072229c-70cf-4fdf-ab35-c3c59e683d53` · 단순작업4 `local_ee476d71-fea4-4528-8bbd-a09b9f527ba2`. 보스전 총괄은 `list_sessions`에서 "보스전 총괄" 제목으로 찾는다.

## 규칙 변화 (10-27)
- 엔진 줄기 분리: main=H5, Unity=`unity/main`, Godot=`godot/main`. `codex/unity-mac-20261024` 퇴역. 작업 브랜치는 `unity/main`으로만 병합(main 금지). 병합은 맵 총괄·맥북 총괄이 정한다.
- M1 "1-1 한 판 완주" 최우선. 3D 비주얼(TOXIC·LIFE1-R·MESHY-0·R2-G*)은 M1 뒤 F03로 보류(명세 파일 유지). MESHY-0은 사용자가 이 세션에 직접 "진행해"라고 하기 전까지 금지.
- 총괄 자율 결정: 명세 안 세부 선택은 내가 정하고 보고에 적는다. 새 방향·유료·배포·영구삭제만 묻는다.
- 금지: git `add -A`·stash·reset·rebase·force. rebase가 막히면 임시 worktree에서 `git checkout --detach origin/<브랜치>` 후 `cherry-pick`으로 다시 올린다.

## 끝난 단위
- **PAINTGROUND-R**(3D 지면·덩어리): 최종 `5108c7098`, 브랜치 `claude/unity-pc-map3d-20261026`, **unity/main에 병합하지 않고 그대로 둔다**(맵 총괄 결정). 그 worktree `E:/exoduser-wt/pc-unity-map3d`의 `FirstPlayable.unity` 재임포트 변경·미추적 파일은 커밋도 되돌리기도 하지 않는다.
- **HQ 기획서 두 줄 복구**: main `0f5ebed03`.
- **C04-ORACLE**(C04-1·2·4 웹 정답): 브랜치 `claude/unity-pc-c04-oracle-20261027` `2b6426971`(PASS). worktree `E:/exoduser-wt/pc-c04-oracle`. 공지 main `bd97c6044`, unity/main `0c2422283`.
  - 파일: `tools/c04-oracle/{extract,compare,selftest}.mjs`, `docs/engine/c04_oracle/{ch1_1_walk,ch1_1_rooms,ch1_1_reach,ch1_1_spawns}.json·ch1_1_collision.png·source_receipt.json·README.md`.
  - 방법: origin/main 커밋본 game.html·maps_data.js를 Playwright route로 끼워 headless Chrome(음소거)에서 `G._cutsceneDone=true; if(!P)P=mkP(); G.stage=0; initStage(0)` 호출. 서버 3333은 정적 서빙만(안 끈다). node는 `C:/nvm4w/nodejs/node.exe`, playwright는 `G:/exoduser/node_modules`에서 `createRequire`.
  - 수치: 걷기 19,538 / 막힘 20,462 / 부분막힘 286 / START (100,185) / EXIT (99,7)(100,7)(101,7) 도달 / 소환굴 14 / 초기 적 14~18. 보스 게이트 (99~101,5)는 `boss_gate_col`로 막힘.

## 지금 할 일: C04-ORACLE-2 (명세 `E:/exoduser-wt/_out/c04-oracle/SPEC2.md`) — 컨텍스트 305K에서 비움
- C04-3(클리어·게이트 규칙) + C04-5(보스 아레나 좌표). 산출 `ch1_1_progress.json`·`ch1_1_run.json`·`ch1_1_boss.json`, compare.mjs 입력 확장(progress·boss), README 절 추가(+ §1·§4의 etype29 설명 정정), 보드 §2.0 oracle 줄 갱신, INBOX main·unity/main, 보스전 총괄에 `ch1_1_boss.json` 경로 전달.
- **진행 상태: 웹 코드 읽기 끝, 추출 스크립트 아직 없음.** 읽은 규칙·함수·줄 번호·구현 계획은 oracle 브랜치 `docs/engine/c04_oracle/ORACLE2_NOTES_wip.md`(커밋 `75abaebc2`)에 전부 있다. 새로 다 읽지 말고 그 메모를 따라 `tools/c04-oracle/extract-progress.mjs`부터 만든다.
- 이미 끝난 정리: 임시 worktree `pc-c04-notice-main`·`-unity` 삭제 완료(reparse 0, force 없음). 새 공지용 worktree를 만들면 끝나고 같은 방법으로 지운다(`checkout --detach origin/main` → 편집 → commit → 막히면 `cherry-pick`으로 최신 원격 위에 다시 → push → reparse 확인 → `git worktree remove`; `tools/guard.baseline.json`이 pre-commit으로 바뀌어 있으면 `git checkout -- tools/guard.baseline.json` 후 삭제).
- 핵심 요약: 1-1 EXIT 열림 = 4지역 클리어(지역 kills/total+문지기보너스 ≥0.8, 앵글러 생존 아님) **그리고** 앵글러 4마리 처치(`_fbDone`) → `_bossUnlocked` → 출구 타일(99~101,7) 밟으면 아레나 로딩(`_enterBossArena`). 보스 게이트 (99~101,5)는 1-1에서 열리지 않는다. 아레나 128×108 원형, 진입 (64,103), 보스 (64,54), 출구는 보스 사망 뒤 위쪽 벽에 뚫림.

## 재개 후 첫 행동
1. 이 문서와 MEMORY.md를 읽는다. `git -C E:/exoduser-wt/pc-c04-oracle status --short`, tip 확인.
2. `get_usage(self)`를 CTO에 1줄 보고(200K 이상이면 비우기 실패).
3. SPEC2 §6 보고 형식으로 진행.
