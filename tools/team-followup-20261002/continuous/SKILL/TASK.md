# SKILL — blur 취소 후보의 실제 발사·차감 대조 한 건

실제 checkout은 `/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. 시작 전에 자신의 TASK/checkout realpath와 `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/COMMON.md`를 확인하고 COMMON, AGENTS.md, 현재 총괄 담당표 및 해당 스킬·자원·저장 SSOT를 읽는다. 공유 checkout의 타인 변경을 되돌리지 않는다. 파일 삭제·이동·임의 cleanup·오경로 수정0이다.

## 이번 한 건

`claude-native-6/SKILL/{result.md,evidence.json,checks.mjs}`를 읽어 C0 정상 release1PASS, MM-B1 blur·MM-B1b 취소소실2재현을 인수만 한다. 기존142 비용검사와 이 세 기존 검사 그대로의 반복·합산0이다. 이전 하니스는 `fireMaliceMortar` 호출 probe만 실행했고 **후보 A의 source 실행 비교나 실제 차감 보존을 검증하지 않았다**. 이번 과제는 그 빈칸 하나를 메운다.

현재 양판 `_clearHeldInput`, blur 등록, mortar aim/charge/release 블록과 실제 `fireMaliceMortar`·필요한 `mpCost/useMp` 등 최소 의존성을 디스크에서 추출한다. 전체 게임 사본/부트0. 현재 P의 전역 선언·초기 null 상태와 각 fragment가 참조하는 변수 경계를 확인하고 원문 행/SHA를 남긴다. 이전 행12877/12273,35217/34022,43770은 탐색 힌트일 뿐 현행값으로 추측하지 않는다.

최소 후보는 기존 P guard 안에서 **`P._mmAiming=false;P._mmCharging=false` 두 플래그를 취소**하는 것으로 제한한다. 입력 배열 초기화·beam/dash/cutscene 상태·거리/키·MP식·쿨다운·합체·RNG는 바꾸지 않는다. 후보는 checks 안의 메모리 원문 변환뿐이며 생산 적용0이다.

충전 홀드1F→blur 등록 대상 `_clearHeldInput`→다음 aim update의 동일 입력을 현행과 후보에 실행한다. 현행 ghost-fire 도달 및 실제 MP/쿨다운/bomb/음향 호출 효과, 후보 무발사·MP 무차감·새 bomb/쿨다운/음향/RNG 추가0을 비교한다. **정상 사용자 keyup은 양쪽에서 동일한 발사·실제 원래 차감·쿨다운·합체 분기 효과·호출/RNG 순서**를 유지해야 한다. probe에서 비용을 가짜 대입해 차감 검증으로 부르지 않는다. 실제 발사·차감 의존성을 실행하지 못한 항목은 UNKNOWN으로 남기고 근거를 명시한다. 현재 소스가 이미 수정됐거나 같은 새 비교가 인수돼 있으면 변경 사실을 보고하고 완료 검사 재실행0으로 인수한다.

실제 keyup 엣지로 입력 모델을 교체하거나 die/revive/패드/스테이지/maliceStorm까지 고치지 않는다. alt-tab hidden rAF·pause·death/revive·pad 전환·stage 이월은 기존 UNKNOWN을 유지한다. 단일 update/합성 blur를 실게임 focus 타이밍 인수로 확대하지 않는다. 정상/blur 한 비교 과제 외 시나리오를 늘리지 않는다.

## 소유와 인계

허용 쓰기는 `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/SKILL/`의 `result.md`, `evidence.json` 두 개와 이 의미 있는 비교용 `checks.mjs` 한 개뿐이다. TASK/COMMON·기존 산출·생산·공유docs·기존test·저장·소유 밖 쓰기0. Git 명령/인덱스/commit/push, 서버/실게임/UI/오디오/빌드/설치/새세션/하위팀/외부메시지0. 지정 Node를 쓰고 검사 출력은 stdout JSON뿐이다. HEAD는 직접 Git 없이 총괄의 확인된 현행 증거를 출처/시각과 함께 인수하며 없으면 UNKNOWN이다.

한국어 결과에는 입력·기대·관찰·MP/쿨다운/bomb/호출/RNG·source/대역·실제 P 경계·PASS/FAIL/UNKNOWN을 표로 적는다. `productionApplied=false`, `source fixture PASS ≠ runtime/visual/청취 PASS`를 명시한다. docs 전체에서 `_clearHeldInput|maliceMortar|_mmAiming|_mmCharging|blur|포커스|useMp`를 rg 검색하고 `2_1 스킬관리+합체시스템.md` 조작 계약과 `SKILL03_설치확정_자원검수_20261001.md` 등에 반영할 정확한 문안·미검수 경계를 result/evidence로 총괄에게 인계한다. 이 한 건 완료 후 한국어로 보고하고 다음 업무를 독자적으로 늘리지 않는다.
