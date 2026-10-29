# 작업 매뉴얼 — 지옥의 길 (2026-10-29)

> 대상: Claude 전 세션(CTO·총괄)과 Codex 전 작업. 일을 받으면 이 순서대로 한다.
> 화면 결과물의 품질 판정은 [WORK_QUALITY_STANDARD_20261029.md](WORK_QUALITY_STANDARD_20261029.md), 상위 목표는 [AAA_QUALITY_STANDARD_20260927.md](AAA_QUALITY_STANDARD_20260927.md)를 따른다.
> 규칙의 원문은 루트 `CLAUDE.md`와 메모리 `MEMORY.md`에 있다. 이 문서는 그 규칙을 **작업 순서**로 묶은 것이다. 둘이 다르면 CLAUDE.md가 우선이고, 이 문서를 고친다.
> 사용자 지시(10-29): "작업 매뉴얼이 있어야겠다 진짜".

---

## 1. 모든 작업 공통 — 시작 5단계

| # | 할 일 | 확인 방법 |
|---|---|---|
| 1 | `CLAUDE.md`와 `MEMORY.md`를 읽고, 관련 상세 메모리를 실제로 연다 | 동결·인용 금지 표시가 있으면 다시 계산하지 말고 저장분을 쓴다 |
| 2 | 해당 분야 SSOT 문서를 읽는다 | CLAUDE.md "작업별 필수 문서" 표 |
| 3 | 어느 엔진 줄기인지 정한다 | H5 = `main`, Unity = `unity/main`, Godot = 동결(`godot/main`) |
| 4 | 작업 공간을 정한다 | §2 표 |
| 5 | 디스크·메모리 여유를 본다 | E 30GB 이상(Unity), 큰 산출물은 `I:\EXODUSER-Storage\`, C 드라이브 금지 |

화면에 보이는 일이면 여기에 하나를 더한다. **레퍼런스 이미지를 직접 열고, 품질 기준 §2의 분해표를 채운다.**

## 2. 작업 공간

| 작업 | 위치 | 주의 |
|---|---|---|
| `game.html`·`index.html`·`lang_*.js` | `G:\exoduser`(main 체크아웃)에서만 | game.html은 브랜치를 나누지 않는다. 동시 세션은 game.html 외 파일만 |
| docs만 | `G:\exoduser-wt\<이름>` sparse 워크트리(`docs/...` + `tools`) | `tools`가 없으면 pre-commit guard가 실패한다 |
| Unity | `E:\exoduser-wt\<이름>` sparse(`unity`, `docs/engine`) | 전체 체크아웃은 하나에 14~18GB라 금지. 웹 파일은 `git show origin/main:<경로>`로 읽는다 |
| 산출물(빌드·캡처·로그) | `I:\EXODUSER-Storage\<주제>\` | 시안처럼 사용자에게 보여 줄 것은 `G:\exoduser\tmp\design-review\<날짜_주제>\` |

## 3. 작업 종류별 흐름

### 3.1 H5(웹) 기능·수치·UI 수정
1. 관련 docs를 읽는다(스킬→2_1, 밸런스→14, UI→3.1 …).
2. `G:\exoduser`에서 고친다. DOM 안전 규칙을 지킨다(부모 innerHTML·textContent 교체 금지, 리프 노드만).
3. 게임에 보이는 텍스트를 추가했으면 `번역대상_전체목록.md`에 등록하고, 28개 `lang_*.js` 전부에 전파한다.
4. 서버를 연다: `C:\nvm4w\nodejs\node.exe server.cjs`(3333). python http.server는 금지.
5. 1600×900 화면을 캡처해 1x로 판정한다(품질 기준 §3).
6. `grep`으로 docs 전체에서 관련 수치·이름을 찾아 코드와 100% 맞춘다.
7. 커밋은 `git commit -- <내 경로들>`로만 한다(코드와 docs를 같이). 그다음 push.
8. 배포가 필요하면 CLAUDE.md "DEMO/EA 동기화" 명령 전체를 실행한다.

### 3.2 Unity 작업
1. `origin/unity/main`에서 sparse 워크트리와 작업 브랜치를 만든다.
2. 게임 규칙은 Core(`Runtime/Core`, 웹 oracle 검증)를 정답으로 쓰고, 표현은 Unity 도구(URP·Cinemachine·VFX Graph 등)로 만든다. UI는 웹 그대로.
3. 컴파일 0 오류 → 관련 oracle 불일치 0.
4. `unity/Tools/devtools/exo-unity.ps1`로 Win 빌드를 만들고 무창·무음·세이브 격리 스모크를 돌린다(m1 동선).
5. 바뀐 장면을 1600×900으로 캡처하고 **웹 같은 장면과 나란히** 비교한다.
6. 영수증(빌드 run id·스모크 결과·비교 캡처 경로·한 줄 판정)을 `I:\EXODUSER-Storage\codex-takeover\MERGE_QUEUE.md`에 올린다.
7. 통합 담당이 영수증을 확인하고 바로 `unity/main`에 병합한다(비강제). 화면이 "다듬기 필요"여도 기능 회귀가 없으면 병합하고, 다듬기는 다음 커밋에서 한다.
8. `I:\EXODUSER-Storage\unity-latest\update_unity_latest.ps1`로 바탕화면 `지옥의 길 (Unity)` 빌드를 갱신한다. **사용자가 바로 열어 볼 수 있어야 완료**다.

### 3.3 아트·AI 이미지
1. `docs/17게임아트팀/ART_TEAM_MASTER.md`와 해당 캐릭터 DESIGN LOCK을 읽고, 고정 사양을 프롬프트에 그대로 넣는다.
2. 서비스 순서: MagicLight Toolbox(맵 오브젝트는 Seedream 5.0 Pro, 고정 캐릭터는 GPT 이미지) → 잔액이 부족하면 Higgsfield. **새 유료 지출과 승인 상한 초과는 사용자 사전 승인**이 필요하다.
3. 1x 확대로 잔점·점묘·디더링·반짝이 점이 없는지 확인한다. 악역도 매력적인 얼굴, 피는 어둡고 탁한 적갈색, 아이템은 소재색을 다양하게(보라 제한).
4. 게임 화면 안에 넣어 레퍼런스·기존 에셋과 나란히 비교한다.
5. ART_TEAM_MASTER의 현황표·로그·백로그를 갱신한다.

### 3.4 VFX
- 판정 캡처에 **적 탄막이 겹친 장면**을 반드시 넣는다. 탄이 또렷한지가 1순위다.
- Unity는 웹과 밝기·크기를 1:1로 맞춘다. 새 색 시안을 먼저 내지 않는다.

### 3.5 사운드
- 후보 생성은 ElevenLabs(크레딧 여유 있음)로 한다. **최종 선택은 사용자가 귀로** 한다. 장면 설명과 동작 화면을 함께 제시하고, 수치는 불량 후보를 걸러 내는 데만 쓴다.

### 3.6 맵
- 기준 이미지 옆에서 1x 눈 판정한다. 평균색 같은 수치 일치로 통과시키지 않는다. 데칼이 안 보이면 반려한다.
- 가장자리가 직선으로 잘리거나 검게 끊기지 않게 한다.

### 3.7 보스·캐릭터 움직임
- 움직임은 영상이나 연속 프레임으로 판정한다(No Rest for the Wicked의 무게감 기준). 정지 PNG로 동작을 통과시키지 않는다.

### 3.8 스토리·번역
- 번역은 전수조사 → 넘버링 목록 → 순서대로 → 100% 후 검수 → 28개 lang 전파 순서로 한다. 확인을 묻지 않고 자동으로 끝까지 처리한다.

### 3.9 Steam 업데이트
- 매일 09:00 KST에 최대 1회. 버전은 `release-version.json`의 PATCH를 +1. 한·영 패치노트가 필수이고, 커밋된 HEAD로 빌드한다.
- **Set Live와 패치노트 게시는 사용자 확인 후** 한다. 상세는 `docs/13출시·마케팅/STEAM_UPDATE_RULES.md`.

## 4. Codex에 일 시키기

### 4.1 브리프 파일 (반드시 파일로)
```
# Codex 브리프: <이름>
먼저 I:\EXODUSER-Storage\codex-takeover\COMMON_RULES.md 와
origin/main docs/0마스터플랜/WORK_MANUAL_20261029.md, WORK_QUALITY_STANDARD_20261029.md 를 읽는다.
- 워크트리: E:\exoduser-wt\codex-<이름> (sparse)
- 기준 문서: <SSOT 경로>
- 할 일: <순서대로, 완료 조건 포함>
- 금지: unity/main 직접 병합(통합 담당 외), game.html 브랜치 편집, 유료 지출, 삭제, 배포
- 끝: <REPORT.md 경로>, 영수증은 MERGE_QUEUE.md
```

### 4.2 실행 방법
| 목적 | 방법 |
|---|---|
| Codex 앱 목록에 보이게 | ASCII 한 줄 ps1(`codex -s danger-full-access -a never -C '<워크트리>' 'Read <brief.md> and follow it ...'`)을 Claude의 `run_in_terminal`로 실행하거나, 사용자가 앱 새 채팅에 한 줄로 넣는다 |
| 백그라운드(목록에 안 보임) | `codex exec ... </dev/null` 또는 `unity/Tools/devtools/exo-codex.ps1 run` |
| 이미 있는 채팅에 후속 지시 | `codex queue --thread <id> --message "<내용>"` 다음에 `codex resume <id>`로 다시 연다. **열어 둔 채 놀고 있는 창은 큐를 받지 않는다.** id는 `~/.codex/sessions/<날짜>/` 최근 rollout 파일명에서 찾는다 |

- 창이 일을 시작했는지 확인하기 전에는 닫지 않는다(10-29 두 번 실수).
- PC 전체에서 Unity는 동시에 1개만 돈다. 실행기 잠금이 처리한다.

## 5. Git

- `git add -A` 금지. `git commit -- <경로>`로 내 파일만 커밋한다.
- 강제 push·reset --hard·rebase로 공유 이력을 다시 쓰지 않는다. 거절되면 fetch 후 merge한다.
- `git stash` 금지(저장소 전체가 공유해서 남의 stash가 섞인다).
- `git gc`·`repack`·`prune` 금지(10-27 팩 손상 이력).
- 커밋 메시지 끝에 작성자 줄을 붙인다. Claude는 `Co-Authored-By: Claude …`, Codex는 `Co-Authored-By: Codex (PC) …`.
- 남의 미커밋 작업이 필요하면 원본은 건드리지 않고 복사한 뒤, 출처를 커밋 메시지에 적는다.

## 6. 실행·디스크·프로세스

- 자동 실행은 화면 없이, 소리 없이 한다(브라우저 headless+mute, Unity batchmode·숨은 데스크톱·AudioListener 0). 창·보조 모니터를 띄우지 않는다.
- 산출물을 start/explorer로 열지 않고 경로만 보고한다.
- 백그라운드에서 `python -`처럼 stdin을 기다리는 명령 금지. 스크립트는 파일로 넘긴다.
- 끝난 Unity 플레이어가 "종료됨"인데도 남아 폴더를 잡는 일이 있다. 그러면 폴더를 교체하지 말고 바로가기 대상을 바꾼 뒤, 재부팅 후 정리한다.
- Playwright·브라우저 임시 프로필은 쓰고 나서 지운다.

## 7. 판정·완료·보고

| 상태 | 뜻 |
|---|---|
| 완료 | 기능 동작 + 디자인 톤 일치 + 1x 가독성 + (Unity) 바로가기 빌드에 반영 |
| 기능만 완료, 디자인 미검수 | 화면 판정·비교 이미지가 없음 |
| 병합만 됨 / 빌드 미확인 | 사용자가 열어 볼 빌드가 없음 |

- 보고에는 브랜치·SHA, 검증 근거(빌드 run·스모크·oracle), 비교 이미지 경로, 남은 일, 사용자 확인 항목을 넣는다.
- 총괄 보고는 CTO 한 곳으로 보낸다. 사소한 진행 알림은 보내지 않는다.
- 사용자에게 묻는 것은 새 방향, 유료 지출, Steam Set Live·외부 게시·배포, 되돌릴 수 없는 삭제뿐이다. 나머지는 담당이 정하고 결과만 보고한다. 같은 질문을 반복하지 않는다.
- 확인 항목은 `USER_CONFIRM.md`, 결함은 `FINDINGS.md`에 한 줄씩 추가만 한다(덮어쓰기 금지).

## 8. 자주 난 사고와 대응

| 사고 | 대응 |
|---|---|
| 같은 파일을 한 줄로 읽고 쓰다가 0바이트가 됨 | 임시 파일에 쓰고 os.replace로 바꾼다. 소실되면 `~/.claude/file-history`에서 복구 |
| 인덱스에 남이 올려 둔 파일이 같이 커밋됨 | `git commit -- <경로>` |
| 부분 hunk 커밋으로 game.html이 깨진 채 배포됨 | push 전에 `git show HEAD:game.html` 문법 검사 |
| robocopy·worktree remove가 junction을 따라가 원본까지 지움 | `/XJ`를 쓰고, 이동·삭제 전에 reparse point를 전수조사한다 |
| Temp에 REPL 로그 162GB가 쌓임 | 백그라운드 `python -` 금지 |
| Unity 후보 20개가 판정 대기로 병합 0 | 영수증 게이트(§3.2-6·7). 판정은 만든 쪽이 캡처로 직접 한다 |
| 바탕화면 빌드가 최신이 아님 | 병합할 때마다 update_unity_latest.ps1 실행. 실패하면 바로가기 대상을 최신 빌드로 바꾼다 |
| 레퍼런스를 줬는데 닮지 않음 | 품질 기준 §2 분해표, §3 나란히 비교. 큰 차이가 0이 될 때까지 제출하지 않는다 |
