# QA-006 — 추천 순서 기대값 수정·얼음보주 종료 오류 비교

## 판정

| 대상 | 최신 main 재현 | 분류 / 조치 |
| --- | --- | --- |
| 추천 순서 1실패 | 재현: Node 1test/0pass/1fail, exit1, 실제15 ≠ 기대14 | **선재한 낡은 기대값**. 테스트만 원본·설계의 15단계로 수정. 제품 수정0 |
| 얼음보주 최초 종료 오류 | 이번 main 3회와 SK-S05 3회 모두 미재현. 각각 22단정/실패0·exit0·stderr ERROR0 | **원인 및 선재/회귀 판정 보류(미확인)**. 최초 실패를 해결/PASS로 바꾸지 않음. 하니스·제품 모두 수정0 |

추천 실패 수정은 완료했으나 QA-006 전체 해결 완료는 아니다. 얼음보주 최초 ObjectDB/resource 종료 실패는 열린 진단 항목으로 남긴다. 이번 제한된 clean 표본만으로 main에서 절대 발생하지 않는다거나 SK-S05가 만든 회귀라고 판정할 수 없다.

## 기준·격리·변경 범위

- fetch 후 고정 main: `e556b617190c325ca39f5add04357f5dea5ca87e`.
- 비교 SK-S05: `ee419a6c883d253e76771d223c8e5f912bd8faf7`. QA 브랜치는 `codex/qa-006-20261020`, main에서 분기. SK-S05 브랜치 수정0.
- 두 worktree 모두 `worktree add --no-checkout` 후 sparse-checkout. 웹 대형 에셋 폴더는 받지 않았다. 엔진 import 파생물은 커밋 제외.
- 실제 Godot 4.7.2: `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`. 매 실행 전 지정 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l` 검사, 2 이상이면 30초씩 대기하는 runner 사용. 실행 이력은 `process-gate.jsonl`.
- 기존 얼음보주 상수 `EXODUSER-P2005D-Isolated-20261020` 그대로 사용. 새 제품 테스트 없음. import만 `EXODUSER-qa-006-Isolated-20261020`. 실행별 override 복원, 기존 사용자 저장 영역을 시험용으로 사용하지 않음.
- 변경 파일은 `test/skillRecommendationOrder.test.js`, 이 보고서, 허용된 `docs/CHANGELOG_SYNC.md` 세 개. 공용 제품 파일·`native_skill_slots.gd`·설계 docs 0줄. 시작 시 보존한 game.html/Godot tracked 335경로 SHA256 모두 동일(`protected-verify.json`).
- R의 기준은 branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, tracked INDEX/WORK 각각 clean. 최종 별도 대조. R checkout/reset/merge 없음.

## 추천 순서 원본 근거와 수정

main `game.html:44094–44110`은 SKILL_REC_PATH 15개다. `docs/2_1 스킬관리+합체시스템+자원/추천빌드_SKILL_REC_PATH.md:15–29,50–51`도 같은 순서를 규정한다. 원본/설계는 읽기만 했다.

| 항목 | 낡은 검사 | 최신 원본 |
| --- | --- | --- |
| 총 단계 | 14 | 15 |
| 첫 합체 | boneStorm | pillarSpike(44095), boneStorm은2번(44096) |
| 전격의창 | 2번 | 3번(44097), thunderStake/bladeDash/iceStorm |
| 폭풍+얼음 | 9번 | 10번(44104) |
| 마지막 | 14번 | giantSlam2가14번(44108), chainSlash/dimRush가15번(44109) |

원본 선언 배열만 추출·평가하고 독립 고정 기대값과 대조한다. KO 단계명, 순서, 모든 skills 배열, fuse/null, pick을 15개 전체 deepEqual로 확인한다. KO/EN 번호1..15 연속성과 pillarSpike→boneStorm→thunderGhost 순서 검사도 유지한다. 단순히 배열 길이에 기대값을 맞추는 동적 검사로 약화하지 않았다.

- 수정 전 `main-recommend-before.*`: 1/1 실패, exit1. 실패 원문 보존.
- 수정 후 `main-recommend-after.*`: 1/1 통과, exit0.
- 저장소 밖 복제 fixture에서 첫 단계 삭제·3번 iceStorm 누락·첫 fuse 변조·pick 삭제·마지막 번호 변조를 적용한 5건 모두 실패로 검출(exit1). `recommend-mutations.json`, `mutation-*.out/.err`. 검출 성공은 원본 테스트 PASS 수에 합산하지 않는다.

## 얼음보주 최초 실패와 현재 실측

과거 `_out/sk-s05/mainqa-test_p2005d_ice_orb.meta.json`은 22단정/실패0·exit0이지만 **ObjectDB 2인스턴스 누수 경고와 resource 1개 ERROR로 전체 실패**다. 후속 verbose clean 실행은 그 실패를 대체하지 않는다. 과거 실행 파일과 최신 main 얼음보주 테스트의 SHA256은 모두 `7f9c27b1f60af4b6d8f2c093a05943e7af8be121f5946d482e8c23f9938cd892`로 동일하다.

| 실행 로그 접두사 | runtime / 하니스 | 옵션 | 단정/실패 | exit / ERROR / ObjectDB 경고 |
| --- | --- | --- | --- | --- |
| main-ice-before-01 | main / 기존 tracked 테스트 | verbose | 22/0 | 0 / 0 / 0 |
| main-ice-before-02 | main / 동일 | 보통 | 22/0 | 0 / 0 / 0 |
| main-ice-before-03 | main / 동일 | verbose | 22/0 | 0 / 0 / 0 |
| sk-ice-before-01 | SK-S05 / main과 byte 동일 외부 복사본 | verbose | 22/0 | 0 / 0 / 0 |
| sk-ice-before-02 | SK-S05 / 동일 | 보통 | 22/0 | 0 / 0 / 0 |
| sk-ice-before-03 | SK-S05 / 동일 | 보통 | 22/0 | 0 / 0 / 0 |

모두 group3개, skip0, 강제 actor 위치1, fallback false. MP 비용50, base408·조각122·칼날8·쿨1200, 프리즌 immunity120 등 관측값 동일. 각 실행 Camera2D 물리 보간 경고1건은 원문 보존. main 66/0과 SK-S05 66/0은 이번 실행 수치이며 최초 실패가 해결됐다는 수치가 아니다. 최초 실패와 SK-S05 보통 실행의 stdout SHA256도 동일하고 종료 stderr만 다르다.

main과 SK-S05의 제품 전체가 동일한 것은 아니다. Main 부트가 읽는 UI/플레이어/이펙트 등 파일 차이가 있으므로 그 차이를 SK-S05 변경으로 귀속하지 않는다. SK-S05 자체 commit은 새 fixture core·새 테스트·docs만 추가했다. verbose 리소스 목록에서 `skill_management_source/` 로딩은 관측되지 않았고 실제 Main 연결도 없다. 이것은 해당 core를 원인으로 지목할 근거가 없다는 증거이며 모든 간접 영향을 배제하는 증명은 아니다(`runtime-loaded-resources.json`).

### 원인 후보·미확인과 다음 진단 단위

- 하니스는 `godot/tests/test_p2005d_ice_orb.gd:42–50,58–63`에서 마지막 await 복귀 뒤 Main을 즉시 free하고 같은 함수에서 quit한다. 종료 시점의 비동기 상태가 후보지만 **잔존 객체 class/resource 경로를 확보하지 못했으므로 하니스 결함 판정은 미확인**이다. 대기 프레임 추가가 실제 원인을 해결한다는 근거도 없어 적용하지 않았다.
- 제품 결함이라는 근거 역시 미확인. 제품 수정안 확정/제품 코드 수정0. headless number_atlas 경로는 producer의 early return을 확인했으나 이것만으로 다른 비동기 자원의 무결성을 주장하지 않는다.
- 다음 진단은 동일 main/SK pin·동일 하니스·지정 격리 이름을 유지하고 verbose에서 최초 종료 누수의 객체 class/Script 경로를 확보하는 작은 단위다. 재현 시 원본 로그를 보존하고 해당 resource의 생성/해제 주체로 분류한다. 하니스 보정은 기존22단정/group/seed/임계값을 유지해 검증하고, 제품 소유 누수라면 수정 제안만 제출한다. 현재 증거로 SK-S05 브랜치를 바꾸지 않는다.

## 통합 결정 목록 — SK-S06 중지

| id | 상태 | 필요한 결정 / 경계 |
| --- | --- | --- |
| SK-S06 | **PENDING_INTEGRATION_DECISION / STOPPED** | 추적 문서184행: `native_source_new_run_state.gd`의 비보호 skills/SP/mats/slots writer 권위, `main.gd` configure 접점 소유·최소 범위 결정 필요. native_skill_slots.gd·보호 Q/E·저장 writer 변경0. 구현 시작하지 않음 |

사용자 지시대로 이 보고서와 외부 `integration-decisions.json`에 목록을 기록했다. 공용 WORK_BOARD/State/main 파일을 수정하지 않는다.

## 제출·보존

원로그: `/Users/fordeargamers/exoduser-wt/_out/qa-006/`. 실행별 stdout/stderr/engine.log/meta, baseline 실패, mutation 실패, gate, 보호 해시, import·cache 근거를 함께 보존한다. Godot import main/SK 각1회 exit0·stderr ERROR0. 이전 캐시 재사용 내역은 `cache-reuse.json`; 실제 각 pin으로 import 후 비교했다.

관련 실행 범위는 요청된 추천 검사와 얼음보주 비교다. 전체 Node/Godot/로비 회귀·PC·GUI 플레이 검수는 실행하지 않았다. 추천 검사 변경은 제품 실행 경로를 바꾸지 않는다. 정상 docs-sync/pre-commit을 사용하며 우회 환경변수/--no-verify 없음. 자기 QA 브랜치만 비강제 push하고 원격 SHA 일치 확인 후 DONE을 기록하고 두 자기 worktree를 제거한다. 제출 SHA/원격 검증/최종 R 대조/정리 결과는 외부 DONE 및 Git 로그를 기준으로 확인한다.
