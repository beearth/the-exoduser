# 맥 담당자 인수 브리프 (11-05, PC 실행 담당)

사용자 지시: PC 대신 맥에서 진행한다. PC의 Codex 레인 시작이 막혀 있어 아래 일은 시작되지 않았다. 브리프는 원문 복사본이고, 충돌하면 이 문서를 따른다. 병합은 하지 않고 결과만 클라우드 CTO에게 보고한다. 클라우드 CTO 배정과 겹치면 CTO 배정이 우선이다.

## 맥에서 읽는 법

- `I:/`·`E:/`·`G:/`는 PC 경로라 맥에서 열리지 않는다. 맥 작업본·맥 Unity로 바꾼다. `exo-unity.ps1`과 `-PcException`은 쓰지 않는다.
- Codex 실행 형식과 PowerShell 절대 경로 지시는 무시한다. 금지사항(Core 수치·판정 수정, `git add -A`, force·reset·rebase·stash, `--no-verify`, 같은 검사 2회 실패 시 중단)은 그대로다.
- 맥에서는 실게임 판정용 창이 떠도 된다. 소리는 끈다. 사용자 세이브는 바꾸지 않는다.
- 브리프가 가리키는 PC 증거(`capture-1920/arena-review/`, `Player.log`, 후보 빌드, 이전 촬영)는 맥에 없다. 브리프 본문의 수치를 근거로 삼고, 필요하면 맥에서 다시 찍는다.
- 측정값에는 맥 결과라고 표기한다. PC 수치와 같은 값처럼 적지 않는다.

## 순서

| # | 브리프 | 기준 | 맥에서 할 일 |
|---|---|---|---|
| 1 | `boss-fix-a_BRIEF.md` (참고 `boss-fix-a_partial_shader.diff`) | origin/codex/unity-boss-arena-20261103 @1fa74ff82 | 은색 유령, 근평면 2D 대체 수정 |
| 2 | `boss-fix-b_BRIEF.md` | 같음 | 아레나 촬영 도구, 바닥 Y 70~80 실측 |
| 3 | `boss-fix-c_BRIEF.md` | 같음 | 리뷰 봇 7기술 커버리지 |
| 4 | `vfx-capture_BRIEF.md` ③만 | claude/unity-pc-vfx-summon-silver-20261104 @c56bc4254 | 튜토리얼 소환진 재촬영. ①은 PC에서 끝남. ②앵글러는 맥이 진행 중인 수정본으로 대체 |
| 5 | `debug-t2-harness_BRIEF.md` | 최신 origin/unity/main | Unity 없음. dotnet·node로 진행 |
| 6 | 브리프 없음 | codex/unity-map-loadprof-20261104 @f703d5b8e | 지면 192장 로드 1.0초 이하, 픽셀 차 0, B 실측 |
| 7 | 브리프 없음 | codex/unity-map-d5-20261104 @e737103ea | 바람 실측·영상·캠프·흰 사각형, 큰 카드 0.45H 이하 |
| 8 | 브리프 없음 | codex/unity-map-b5-main-20261104 @6beb20c9f | 컴파일, 3840×1080 전후 비교 |
| 9 | 브리프 없음 | 최신 origin/unity/main `--remodel3d` | 1-1 한 판: 지옥문·보스 시간, 크래시, 가장 긴 프레임(fullrun-3d 2회차 대체) |

## 맥에 넘기지 않는 것

- map-swamp ae907b822: PC에서 진행 중.
- map-keyshot 502b27dae, map-fieldbuild 532655299: 같은 검사 2회 실패. 같은 방법으로 재시도하지 않는다.
- 하드 종료 18회(850615ca1): 증상이 PC 입력 드라이버 경로라 PC 검증이 필요하다.
