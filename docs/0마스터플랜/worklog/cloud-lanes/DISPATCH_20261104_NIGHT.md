# DISPATCH — 11-04 밤 CTO 지시서 (PC·로컬 총괄용)

- 발신: 클라우드 CTO(session_01RpEygYGKUQUXhk8Yw9obNZ). 기준 unity/main = 이 파일이 들어간 커밋.
- 각 총괄은 **자기 절만** 한다. 먼저 `git fetch origin unity/main` 뒤 `git show origin/unity/main:<경로>`로 이 파일, `CLAUDE.md`, `docs/0마스터플랜/worklog/cloud-lanes/LANES_CLOUD.md`(공용 작업표)를 읽는다.
- 역할: **배정·병합은 CTO 한 곳**(클라우드 CTO). 총괄·PC 세션은 자기 브랜치에 commit/push까지만 하고 unity/main에 병합하지 않는다. 예외: BuildLoop의 바탕화면 실행본 교체(기존 규칙).
- **보고는 git으로 한다.** 결과를 자기 보고 브랜치 `claude/unity-pc-report-<역할>-20261104`의 `docs/0마스터플랜/worklog/cloud-lanes/reports/<역할>_20261104.md`에 커밋·push한다(맨 위에 최신 절: 시각·한 일·SHA·판정·다음 담당·막힘). 판정은 대상 브랜치@SHA를 반드시 적는다. 클라우드 CTO가 이 브랜치를 읽고 병합·재배정한다.
- 공통 금지: CLAUDE.md 그대로(`git add -A`, force·reset·rebase·stash, gc, Core 수치 변경, 공용 실행기 밖 Unity 실행, 창·소리). 같은 검사 2회 실패면 멈추고 보고.

## PC CTO (CTO 전체 작업 총괄) — 역할: PC 실행 담당
1. 코덱스 8슬롯을 비우지 않는다. `LANES.md`·각 `REPORT.md` 확인 → 끝난·멈춘 레인 재개 → 빈 슬롯은 대기열(debug-t2-harness → vfx-capture → map-b5-main 6beb20c9f 검증 → fullrun-3d 2회차).
2. `LANES.md` 현황(레인|브랜치@SHA|상태|다음)을 보고 파일에 옮겨 적는다(클라우드는 I:를 못 본다).
3. 실행본 SHA: `unity-latest/build-commit.json`, 3333 `refresh.log` 최신값을 보고.
4. 아래 총괄들에게 이 파일 자기 절을 읽으라고 전달한다(같은 계정 로컬 세션).
5. 병합은 하지 않는다. 병합 가능한 판정이 나오면 보고 파일에 "병합 요청: 브랜치@SHA, 근거"로 적는다.

## 유니티 총괄
1. combo4(`claude/unity-pc-candidate-combo4-20261104` a8618d9bf) 빌드·촬영을 끝내고 결과(스모크·크래시·로그)를 보고.
2. 공용 실행기 순번으로 L4 합본 `claude/unity-cloud-vfx-angler-combine-20261104` @ 0ac134a80 Editor 컴파일 1회. 오류 0/N, 실패면 오류 파일:줄.
3. 참고: 클라우드 L1 점검 결과 combo4 = 5개 브랜치 합과 코드 동일, 5개 모두 `--no-ff` 필요, demo-flavor 먼저(`cloud-lanes/L1-merge-ready_20261104.md`, 브랜치 claude/unity-cloud-mergeready-20261104).

## 디자인 총괄
1. 판정 대기분: combo4(a8618d9bf), modular 대검, preview 6(6229288c0), A2R(2308e2111). 같은 SHA로 PASS/RETOUCH를 내고 근거 캡처 경로(I: 경로 OK)와 결함 목록을 보고.
2. combo4 PASS면 그 줄에 "combo4 PASS → 5개 병합 가능"이라고 명시(클라우드 CTO가 바로 병합).

## 종료 멈춤 총괄 (Unity 종료 멈춤 버그 해결)
1. 하드 종료 `claude/unity-pc-quit-hardexit-20261104` @ 850615ca1 깨끗한 부팅 종료 경로 18회 결과(n/18, 좀비 수, `_zombie_alert.json` firstBootAgeHours)를 보고.
2. 18/18이면 "병합 요청"으로 적는다. 드라이버 끄기·삭제는 사용자 승인 전 금지.

## 캐릭터 총괄
1. `codex/unity-char-modular-20261104` @ a801204b7 남은 촬영(shoot4.ps1) → 결과 보고, 디자인 총괄에 판정 넘김.
2. `--hero-rig=modular` 기본값은 rigpixel과 같이 판정(바꾸지 않는다).

## 보스전 총괄
1. rig-pixel 기본값 판정은 7차로 미룬 상태(7e96e04d6). 은색 유령·근평면·아레나 어둠 Codex 수정 레인 결과를 받아 다음 미리보기 SHA와 촬영 계획을 보고.
2. preview 6(`claude/unity-integration-preview6-20261104` 6229288c0)은 회귀 확인용 — 회귀 여부 한 줄.

## 임펙트 총괄
1. `codex/unity-druid-vfx5-20261104` @ 874218da0 재빌드 → 탄막 겹친 장면 촬영 → 결과.
2. 앵글러 물 합본은 클라우드에서 만들었다: `claude/unity-cloud-vfx-angler-combine-20261104` @ 0ac134a80(FieldBullets 앵글러 분기를 Friendly 앞으로). 컴파일 통과 뒤 이 SHA로 화면 판정. 따로 합본을 다시 만들지 않는다.
3. 새 효과 제작은 계속 멈춤(사용자 결정 대기: 전문 VFX 에셋 전환).

## 맵 총괄
1. 코덱스 맵 레인(map-scale-c1·keyshot·fieldbuild·webcards·loadprof·d5·swamp) 결과 판정 → 레인별 PASS/RETOUCH와 다음 지시를 보고.
2. A2R(2308e2111) RETOUCH 보정이 map-d5·map-swamp에서 나오면 디자인 총괄로 넘긴다. 1-1 맵 ×2는 최적화·map-scale3d 뒤.

## 디버깅 총괄
1. D-U5 `claude/unity-pc-du5-speed-regen-20261104` @ 98cf59aab: PC에서 oracle 1회 → 결과(n/0). 통과면 "병합 요청".
2. 클라우드 L3 결과: oracle FAIL 10 중 남은 실제 FAIL 2(EnemyTables `Killu`→`킬루`는 클라우드 L5가 수정 중, skill-ui 13/16칸 D-U4는 담당 판단 필요). D-U4 결정 한 줄을 보고.

## 개발툴 총괄
1. BuildLoop 최근 회차(시각·SHA·스모크·UI 겹침 검사 결과)와 바탕화면 실행본 SHA를 보고.
2. I: 포화·좀비 경보가 있으면 보고.

## 사운드·스토리·스팀·최신버전 테스트 총괄
- 사운드: R5~R10은 사용자 청음 결정 대기. 새 일 없음.
- 스팀: 클라우드 L7이 데모 패키지 점검표를 만든다. 결과가 오면 검토만.
- 스토리·최신버전 테스트: 대기.
