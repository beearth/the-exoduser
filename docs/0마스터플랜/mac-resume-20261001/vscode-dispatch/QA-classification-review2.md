# QA 분류 인수 반려 — 실제 재현 2건 보강

기존 QA T1에서 이 한 건만 이어간다. 새 게임 release 없음. 기존 소유권·원자료·생산·Git 보호 유지. 앞 분류 보강의 완료를 새 실측 시작으로 해석하지 않는다.

총괄이 현재 combat-timeline 원자료를 임시 사본에서만 변형해 다음 두 오탐을 재현했다. 실제 원자료에는 변경0.

1. environment.profiler=false, seed=1, variant='arbitrary'만 추가(실제 대조 표본·내내 고정 증거·SHA 검증 없음)하면 `--mode=comparison` exit0/comparisonEligible=true. CMP4가 `present>=2`를 비교 입증으로 간주한다. 4/4 존재로 바꾸는 것만으로 해결하지 말 것: 임의 메타데이터 존재는 실제 대조/조건 불변 증명이 아니다.
2. 위 사본에서 profiler를 지우고 gpuTiming=false만 두어도 CMP3=true/전체true. gpuTiming 기록은 CPU profiler off 증명이 아니다. 명시적 boolean false만 off 기록으로 인정하고 true·profile 블록·잘못된 타입·상충 기록·미기록을 구분한다.

안전한 최소 수정: 단일 raw의 구조/기록 완결성과 실제 A/B 비교 인수를 분리한다. 단일 raw만 읽는 현재 CLI가 대조 표본을 검증하지 못한다면 `comparisonEligible`을 true로 승격하지 않아도 된다. 조건 미입증은 unknown(명백한 불일치는 false), comparison 모드는 exit1. 고정된 seed/maxload 문자열 등을 추가해 PASS를 만들지 않는다. 대조 표본 SHA·환경·계측·시나리오·옵션 변화 이력을 실제 검증하는 기능은 별도 범위이며 이번에 임의 대조 증명을 만들지 않는다. 단일 정상 첫 처치 관측도 진단/기준 후보로 보존할 수 있고, A/B 적격 PASS를 강요하지 않는다.

합성 양성 fixture는 구조/메타 계약의 테스트 성공과 실제 comparisonEligible=true를 분리한다. 합성 fixture가 실제 실측 인수로 오인되지 않게 결과 필드·출력·계획을 정정한다. 위 두 오탐, profiler 문자열/상충 타입, 실제 대조 부재, 최종 옵션 부재·품질 변화의 회귀를 추가하고 CLI exit를 확인한다. deprecated `VALID` 이력은 명확히 과거로 표시한다. result/receipt를 갱신하고 한국어로 보고한다.
