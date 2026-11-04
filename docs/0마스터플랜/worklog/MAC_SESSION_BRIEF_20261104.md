# Mac 세션 브리프 — 2026-11-04 저녁 (PC CTO 작성)

맥북에서 새로 켠 Claude Code 세션이 이 문서를 읽고 그대로 한다. 보고는 PC CTO 세션("CTO 전체 작업보고 총괄")에 한국어로 짧게 한다. 세션끼리 메시지가 안 되면 결과를 커밋 메시지와 이 폴더의 `MAC_SESSION_RESULT_20261104.md`에 남긴다.

## 0. 시작
1. 저장소를 받는다: `git fetch origin`, 그다음 `origin/unity/main`을 checkout한다(자기 worktree나 브랜치에서).
2. `CLAUDE.md`를 읽는다. Mac 몫은 Unity 빌드·실게임 테스트·판정이다(§3.4).
3. 지킬 것:
   - 창은 Mac 화면에 떠도 된다(실게임 판정용). 소리는 끈다.
   - 사용자 세이브를 바꾸지 않는다. 테스트는 QA sandbox 인자나 세이브 격리로 한다.
   - `git add -A`, force push, reset, rebase, `--no-verify`는 쓰지 않는다.
   - 로그인은 사용자가 직접 한다(Tripo 등).

## 1. 파일 전송 (PC에 없는 것) — 먼저
PC는 Tripo 서명 URL이 막혀 받을 수 없다. 아래 파일을 브랜치 `claude/mac-transfer-20261104`(origin/unity/main에서 새로 만든다)의 `transfer/20261104/` 아래에 넣고 push한다. 50MB가 넘는 파일은 올리지 말고 크기만 보고한다.

| # | 무엇 | 어디서 | 넣을 경로 |
|---|---|---|---|
| 1 | 실버테일 Tripo GLB (에셋 214c3a56…) | Tripo 내 에셋 → GLB 내보내기 | `transfer/20261104/tripo/silvertail_214c3a56.glb` |
| 2 | 아이반 몸 Tripo GLB (에셋 d381fefe…) | 같은 곳 | `transfer/20261104/tripo/ivan_body_d381fefe.glb` |
| 3 | 아이반 머리 Tripo GLB (에셋 816e7107…) | 같은 곳 | `transfer/20261104/tripo/ivan_head_816e7107.glb` |
| 4 | 전사 LOCK v2 3면 이미지 | `~/Downloads/warrior_lock_v2_front_side_back.png` (3072×1024, 4,771,355B) | `transfer/20261104/lock/warrior_lock_v2_front_side_back.png` |
| 5 | 메뉴 32:9 날개 8장 | Tripo 이미지 탭 또는 `~/Downloads` — 오른쪽 54a58350·389fc0ec·ce09284f·b0943127, 왼쪽 96c5144c·457e794b·04437f93·26871117 | `transfer/20261104/menu-wide/{right,left}/<id>.png` |

- 커밋 메시지에 파일별 크기와 SHA256을 적는다.
- push한 뒤 원격 SHA를 대조하고 결과를 보고한다.
- PC 쪽에서는 캐릭터 총괄이 1~4를, 디자인·유니티 총괄이 5를 받는다.

## 2. 실게임 판정 (빌드는 Mac에서, 소리 끔)
우선순위대로 한다. 판정마다 1920×1080과 3840×1080(가능하면) 1x 캡처를 남기고, 10초 무음 영상을 찍고, 결함 목록에 담당 총괄을 표기한다.

1. **unity/main 최신, 1-1 한 판 — 데모 v0 ②**
   - 실행 인자: `--remodel3d`
   - 로비에서 새 캐릭터로 1-1을 처음부터 드루이드 처치·클리어까지 끝까지 한다.
   - 기록: 크래시·예외, 걸린 시간, 가장 긴 멈춤(프레임), 먼 적이 보이는지.
   - 참고(PC에서 본 결함): 처치·드랍 지점의 흰 사각형, 3840 타이틀 멈춤, 로비 '새 캐릭터' 줄 끝 '0'. 이것들이 Mac에서도 나오는지 확인한다.
2. **통합 후보 3차** `claude/unity-pc-candidate-combo3-20261104` = `eb9d7d44c` (판정용, 병합하지 않는다)
   - 다음을 확인한다:
     - 제품명 'EXODUSER: HELL LORD'
     - 로비 0명·2명
     - 스테이지 클리어 위시리스트
     - 체험판 끝 화면
     - 설정 게임 탭 11행
     - BGM 실제 소리(hell1 다음 3곡 회전)
     - 재시작 뒤 언어 복원
     - 필드 진입 로딩 진행선
   - **Mac 세이브 경로 확인**: 정식판이 옛 폴더 `~/Library/Application Support/com.ForDearGamers.EXODUSER----Unity-----------------`를 그대로 쓰는지 본다. 경로만 확인하고 내용은 바꾸지 않는다.
3. **통합 미리보기 6차** `claude/unity-integration-preview6-20261104` = `7f88dfd50`
   - 실행 인자: `--remodel3d --enemy-render=rigpixel --boss-render=rigpixel`
   - 드루이드 P1~P3를 각 1x로 찍고, 적이 2D로 대체되는지(0이어야 함), fps를 본다. 판정은 보스전 총괄 몫이다.

## 3. 보고 형식
항목별로 PASS·FAIL·미확인 한 줄, 결함은 담당 총괄 표기, 캡처 경로나 커밋 SHA를 적는다. 과정은 길게 쓰지 않는다.
