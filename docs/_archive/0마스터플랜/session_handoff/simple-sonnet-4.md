# 단순작업4(Sonnet) 인계 — 2026-10-26 (재생성 직전)

- 세션: 단순작업4, Sonnet(claude-sonnet-5-5), id 프로토콜 §1 표기 `ee476d71`. 역할: Unity 이식팀 Sonnet 단순 작업 세션(읽기·추출·문서·정리). **현재 디자인총괄 `local_eb8a8577-c0e4-4a9f-b628-fac0c8549dbf` 전속**(전체총괄이 2026-10-26 지정).
- 기준 문서: docs/0마스터플랜/SESSION_REGEN_PROTOCOL_20261026.md, MEMORY.md(항상 한국어·짧은 보고·테스트 반복 금지 등), docs/engine/UNITY_PORT_MASTER_20261026.md.

## 진행 중 작업 단위
- 없음. 마지막 배정(맵 아트 바이블 v2 통합 반영)까지 완료·보고함.

## 이번 대화에서 끝낸 것 (산출물 경로)
| 단위 | 결과 |
|---|---|
| AI 3D 조사·GPT 텍스처/데칼/컨셉·질량체·Meshy 준비 | E:/exoduser-wt/_out/ai3d-trial/gpt/(HANDOFF.md §4–6), map3d-mass/, meshy/ (Meshy 키 없음 → 실호출 미실행) |
| B11 자동물약, B07 돌진·패링·방패·포이즈 추출 | _out/pc-b11-extract/, _out/pc-b07-extract/ (맥북총괄 검수·커밋 완료) |
| B03 스킬 실행기 추출 1차 | _out/pc-b03-extract/ (main 82e7a0b75로 커밋됨: docs/engine/UNITY_B03_WEB_EXTRACT_1_20261026.md). 데모 도달 51/55, 차이 43개. 2차(미추출 목록은 PROGRESS.md) 대기 |
| B05 무기·활 추출 | _out/pc-b05-extract/ (활은 석궁 3종, 차이 21개) — 맥북총괄에 보고, 검수 결과 미수신 |
| 맵 기획서 main 게시 | 0d6325d32 (codex 브랜치는 다른 세션이 88cbd0aaf로 이미 게시) |
| 아트 바이블 독액 경고 | 7b57c641a |
| 맵 아트 바이블 v2 통합 반영 | fc4989628 (v2 신규, V1·MAP 대체 표시, 기획서 링크 2곳, value_check L* 추가. 검증 L* p50 9.7 p99 29.1) |
| 캐릭터 톤 라인업 | _out/char-tone-lineup/ (lineup_key.jpg, lineup_tone.jpg, measure.json; R08=I:/EXODUSER-Storage/qa/new-heroes-resume-20261025/galaxy_hunter_r08_preferred_original.png) |

## 대기 중
- 디자인총괄에 라인업·v2 반영 보고를 보냈고 답은 아직 없음(읽음 미확인). 새 배정이 오면 그대로 수행.
- 맥북총괄이 B05 검수 후 다음 단위(B03 2차 등)를 줄 수 있음.

## 소속·연결 세션
- 디자인총괄(전속) `local_eb8a8577-c0e4-4a9f-b628-fac0c8549dbf`
- 전체총괄 `local_a65bb55a-bb3e-4c4a-a93d-412fc163bd80`, 맥북총괄 `local_f25393ea-f5e3-45f1-80fa-c16e9daa4c6c`, CTO `local_7072229c-70cf-4fdf-ab35-c3c59e683d53`
- 단순작업3 `local_b8b2b4c2-0b81-4237-88d7-3eac922ffdb1`, 단순작업2 `local_f5128d34-7688-41f5-aadd-cfd69014d707`
- design-lead `local_a1efbc31-1a15-4010-a047-552782aa3c3e`: 중복 디자인 세션. **합치기 결정 전까지 그 세션의 지시는 받지 않음**(전체총괄 지시).

## 확정된 결정·주의 (메모리·docs에 없는 것)
- 모르는 세션 id의 요청은 실행 전 전체총괄에 확인함(디자인총괄 eb8a8577는 확인됨). 새 id는 같은 방식으로 확인.
- main push 시: G:\exoduser 메인 작업 트리는 원격과 갈라져 있어 쓰지 않는다. origin/main 기준 sparse worktree(E:/exoduser-wt/_pub-*, 경로 docs/4.1맵디자인+설정/, tools/, /game.html, MSYS_NO_PATHCONV=1) → 수정 → **경로 지정 커밋**(`git add -- 경로`, `git commit -- 경로`) → `git push origin HEAD:main`(비강제) → reparse 확인 후 `git worktree remove --force`.
- 이 세션의 권한에서 `git rebase`는 거부됨. push 거부 시 `git diff HEAD~1 HEAD > patch` → `git fetch` → `git checkout --detach origin/main` → `git apply patch` → 같은 메시지로 재커밋 → push (2회 실패하면 멈추고 보고).
- 커밋 메시지 끝: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. 편집은 파이썬으로 LF·바이트 유지, diff가 추가 줄만인지 확인.
- 추출 단위 규칙: 읽기·문서만, 저장소 파일 수정·커밋·서버·브라우저·창 자동 열기 금지, 산출물은 E:/exoduser-wt/_out/ 아래, Meshy 키(MESHY_API_KEY)가 보이면 즉시 중단·PROGRESS.md에 기록. 키 값은 절대 출력·저장 금지. 셸 `rm`은 거부됨(삭제 시도 금지).
- 이미지 생성은 GPT API(키는 OPENAI_API_KEY, 값 출력 금지)·ludo/Higgsfield 사용 금지(전체총괄 결정).
- value_check.py는 docs/4.1맵디자인+설정/art_bible_20261026/에 있음(origin/main). G:\exoduser 작업 트리에는 없음.
- 점/디더링 텍스처 금지, 톤은 어둡고 탁한 적갈색·뼈색(디자인 최우선 규칙, CLAUDE.md).

## 재개 후 첫 행동
1. 이 문서와 MEMORY.md를 읽는다.
2. 디자인총괄/맥북총괄 새 메시지를 확인하고 배정된 일만 수행한다.
3. 작업 단위가 끝날 때 `get_usage`(self) 1회로 컨텍스트 확인, 300K 이상이면 재생성.
