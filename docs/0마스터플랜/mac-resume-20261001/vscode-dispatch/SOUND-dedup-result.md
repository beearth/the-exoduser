# SOUND HOWL 중복 최소 후보 — root 회수·정적 검수

기존 aa3ac0ed 세션에서12:23:14.159Z 수신,12:23:17.784Z 지시 Read,12:25:57.531Z 최종 답변 제출을 JSONL로 확인했다. 읽기 전용 팀이 답변으로 낸 원문·본편/easy diff·회귀 코드를 SOUND 소유 폴더에 별도 회수했다. 원 제출은 실행 결과를 주장하지 않았고 root가 직접 실행했다.

| 항목 | 결과·한계 |
|---|---|
| 원 제출 회귀 | seal 실제 한 줄 추출5검사 PASS. 전체 아레나 실행이 아님 |
| 본편/easy | seal 한 줄 내용 동일, 위치29491/28391. 각 소스 전체 SHA는 dedup-root-evidence.json |
| 원 후보 | phase2에서 seal howl만 생략. groggy/봉인 문구 보존. 본편/easy patch check PASS |
| root 독립 검토 | 원 guard가 `_bossSfx` 조회·키/피치 난수 호출까지 건너뛰는 것을 확인. 원 제출 보존 후 root diff에서 명시적 키/피치 계산을 유지하고 재생 호출만 조건 처리 |
| root16검사 | 실제 seal·입장·phase-up source fragment 실행. phase2 seal+입장2→1, phase0/undefined 인수·명시적 난수·groggy 보존, phase-up .8/120ms 유지. 두 root patch 기본 적용 검사 PASS |
| 재도전 | 함수 안에서 phase0으로 리셋하는 실제 소스 확인. 재도전 전체 함수 실행은 미실시 |

**생산 적용 보류:** `playSample` 자체도 key/volume/30ms 중복 게이트 뒤 `Math.random()`을 사용한다. root 후보는 호출 전 키/피치 난수만 보존하므로 전역 난수열·이후 전투 궤적의 완전 동등성을 입증하지 못했다. 후보에 대한21정적 검사(제출5+root16)를 전체 전투/오디오 합격으로 올리지 않는다. 내부 재생 난수·중복 시각 상태의 처리 계약과 실제 보스문/재도전/phase-up 청취가 남았다. 생산·본편/easy·음량·리소스·전투·저장 수치 변경0.

원문 `dedup-submission.md`, 원 diff `dedup-main.candidate.diff`/`dedup-easy.candidate.diff`, 보강 후보 `dedup-main.root.diff`/`dedup-easy.root.diff`, 실행 가능한 검토 `dedup-source-regression.cjs`/`dedup-root-review.cjs`, 증거 `dedup-root-evidence.json`/`dedup-root-validation.json`을 분리했다. 후보를 SSOT의 현재 구현으로 기록하지 않는다. 관련 docs 검색을 수행했고 채택 전 사운드 SSOT의 ‘정상1회’ 확정 서술은 추가하지 않았다.
