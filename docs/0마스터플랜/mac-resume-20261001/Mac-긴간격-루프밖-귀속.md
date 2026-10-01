# Mac 긴 간격 시간축 귀속 — 2026-10-01

**확인:** 앞선109.8ms는 첫 처치 순간이 아니라 첫 공격 전이었다. 별도 정상 진단에서는 게임 루프 밖 `_warmupNext`가130.7/135.6/131.0ms 실행된 세 건을 브라우저가 직접 귀속했다. 해당 구간 CPU 표본은 `_warmImageGpu → drawImage → _getTex → texImage2D` 호출 스택을 지지한다. 과거109.8ms의 원인을 이 자료로 소급 확정하지 않는다. 생산 수정0·전체 성능 해결 미판정.

## 기존 경량 run2의 정확한 시점

| 기록 | performance.now 기준ms | 의미 |
|---|---:|---|
| 첫 정상 W |147217.6|처치0, HP572, 적5|
| 최대draw 시작 간격 |147453.3→147563.1|109.8ms, 입력+235.7→345.5ms|
| 직전draw / 다음draw |0.5 / 0.4|그 사이109.3ms는 기존 자료만으로 귀속 불가|
| 첫 canvas 공격 |147713.2|최대 간격이 끝난 뒤150.1ms|
| 첫 처치 관측 |152490.3|최대 간격 종료보다4927.2ms 뒤|
| 처치0→1 인접 상태 |152449.1→152490.3|41.2ms 관측 경계, 정확한 kill 함수 시각은 미수집|
| 해당draw |152482.3→152490.2|7.9ms, 직전draw 시작과33.8ms 간격|
| 전체 최대draw 호출 |154833.5→154922.1|88.6ms, 처치 관측+2343.2ms의 별도 사건|

109.8ms 양 끝 주변 입력·옵션·focus 이벤트0, 두 상태 모두 처치0/적5/전경이었다. 이 값은 넓게 정의했던 입력→첫처치+1.5초 창에 포함됐을 뿐 첫 처치 정지로 볼 근거가 없다. 기존 전체/구간 통계 자체는 바뀌지 않는다.

## 별도 진단 한 회

입력 `b988771019f2520a1d33560f178655b143d1a1a2`, game SHA `593a7a9d84c78402f04c50c94ae169e237e49751ad58d8640e78e672850728f2`. 실행 전후 로컬/HTTP 일치. 기존 Chrome152의 새원점 qa-gap-attribution-20261001.localhost:3340, WebGL, DPR2/viewport1352×666/canvas동일. 별도 프로필 아님. high/res100/SSAA1/cap0/parts100/diff5, atmos2→1은 입력 전에 발생했다. 앞선run2 viewport1352×610/parts80과도 달라 비교에 쓸 수 없다.

정상 안내→연습 건너뛰기→native W/클릭/짧은drag로 실행했다. 초기 로딩 중 Escape가 설정을 열어 정상 닫은 뒤 로딩 완료를 확인했다. 옵션 변경은 하지 않았다. HP586→0, 처치0, 마지막 ens.length38, 입력 이후15.216초 자연사. 25초 목표 미충족이며 첫 처치 재현 실패를 숨기지 않는다. 최대 반복1회 계획에 따라 추가 반복하지 않았다.

loop/update/draw 통과래퍼3개와 독립rAF/상태·입력, PerformanceObserver longtask/long-animation-frame 상세scripts를 기록했다. CPU sampling 요청1000μs를 별도로 켰다. 프레임별 screenshot/CDP polling은 하지 않았지만 입력 묶음 뒤 AX 확인이 있었으며 외부 도구/일상OS 부하까지 통제하지 못했다. 다른 게임·소켓테스트·빌드·인코딩0. 강제HP/품질/적수/처치/좌표/틱 변경0. 이전 경량 자료는 CPU profiler-off이며 이번은 profiler-on이다. 오버헤드가 측정되지 않아 시간 증감 비교 금지.

## 긴 loop 시작 간격 분해

각 행은 `시작간격 = 직전loop 경과 + 그 종료→다음loop 진입`으로 계산했다. CPU 사용시간·GPU 실행시간이 아니라 동기 대기를 포함한 경과시간이다.

| loop | 시작 간격 | 직전loop | update합 | draw | loop 밖 | 브라우저 직접 귀속 |
|---|---:|---:|---:|---:|---:|---|
|184→185|139.2|1.5|1.1|0.4|137.7|IdleRequestCallback `_warmupNext`135.6ms|
|193→194|132.9|1.3|0.8|0.3|131.6|IdleRequestCallback `_warmupNext`131.0ms|
|171→172|132.7|1.4|0.9|0.5|131.3|IdleRequestCallback `_warmupNext`130.7ms|
|401→402|105.7|104.7|1.3|103.3|1.0|게임loop callback104.7ms; 아래 별도draw|
|166→167|73.7|1.3|0.6|0.6|72.4|scripts[]; 원인 미확정|
|486→487|68.4|2.5|1.5|0.8|65.9|scripts[]; 원인 미확정|
|319→320|65.5|1.7|1.1|0.4|63.8|scripts[]; 원인 미확정|

위 세 `_warmupNext`는 각각36524.8/36958.7/37254.0ms에서 시작했다. `sourceFunctionName`, local sourceURL, `IdleRequestCallback`과 해당130/135/131ms longtask가 일치한다. 따라서 이번의 루프 밖 큰 지연은 일반 워밍업 callback 안으로 귀속할 수 있다. 프레임 밖/유휴 callback이라고 프레임을 막지 않는 것은 아니다. 현재 `_scheduleWarmupNext`는 이미 requestIdleCallback(timeout120)으로1장씩 제출하지만 한 장의 동기 작업 자체는 잘게 나뉘지 않는다.

CPU 표본은 위 범위를 포함하는 보수적 시계 구간에서 `_warmupNext → _warmImageGpu → drawImage → _getTex → texImage2D`가 반복된다. 실제 이미지URL·치수·queue index는 수집하지 않아 어느 에셋 세 장인지, decode/upload/GPU backpressure 중 각각 몇ms인지는 미확정이다. 광범위 에셋 축소나 품질 저하는 근거가 없다.

별도 draw103.3ms(43664.5→43767.8)는 `drawP → _physicalImpactSheet → _tintHolyDome → getImageData` 표본과 겹친다. 소스에서 `_physicalImpactSheet`는 WeakMap 미스 때만 흰색 시트를 만든다. 프로파일 시계 불확실성을 포함한 상관이므로 readback만103.3ms라고 주장하지 않는다. 이번 처치0/아이템0이므로 시체/아이템 드롭의 첫처치 문제로 분류할 수 없다.

## 통계·시계·정리

입력후478loop/478draw/901update, skip0/dropped0. draw 간격 p95 37.6/p99 74.0/max139.2ms, >50ms7/477·>100ms4/477. update호출 최대5.9ms, draw호출 최대103.3ms. draw호출률31.41Hz는 표시FPS가 아니다. 이전run2와 표본/계측/viewport/옵션/장비/교전이 달라 개선율 산출 금지.

CDP 시작 전/후 pageNow31699.8/31960.3으로 프로파일 시작 시계 매핑의 불확실성은260.5ms다. 스택 표본 분석은 이 전체 가능범위를 포함했으며 중앙값으로 정렬하거나 샘플수를 CPUms로 환산하지 않았다. 프로파일32.546초/23435표본에는 입력 전과 관측 종료후 tail이 포함된다. 분석대상은 명시된 입력 구간이다. long-animation-frame은 페이지 performance 시계의 직접 귀속이므로 이 프로파일 매핑 불확실성과 분리한다.

관측은 자연사에 자동 종료, loop/update/draw 복구true, 청소오류0. Profiler.stop/disable 후 원자료 저장, 실제 종료 화면 저장 및 about:blank로 게임 종료. 원래Mac 체크아웃·PC3333·사용자세이브·정규화22경로·공용인덱스 보존. 새팀/채팅0.

[재현가능 귀속 결과](gap-attribution-evidence/attribution.json) · [통계](gap-attribution-evidence/summary.json) · [해시/정리](gap-attribution-evidence/verification.json) · [raw·프로파일·시계·실제화면·사용관측기 ZIP](gap-attribution-evidence/raw-profile-and-screen.zip). 분석도구 `tools/qa/analyze-gap-attribution.py`, 기존 분석도구와 독립적으로 간격 분해 합계·입력/처치 순서 불변조건을 검사했다. 관측기 회귀5/5.

## 좁은 수정 후보와 다음 회귀 기준

후보 QA-WARM-IDLE-01은 **일반 Image 워밍업 항목을 기존 PM-001 비동기 Blob 디코드·URL 텍스처 캐시와 연계**하는 것이다. 변경소유는 `_queueWarmImage/_warmupNext`와 PM-001 준비 완료/실패 통지 계약에 한정하고, 특수 Symbol3종·Canvas·WebGPU/2D·필터·알파·큐80/버퍼120·전투/저장/RNG를 보존한다. 이미캐시됨은 즉시 진행하고, URL·크기 일치/동일컨텍스트 업로드를 확인한 뒤 실제 warm 완료로 표시한다. 실패·미지원·시간상한에는 기존 동기 폴백을 유지하며 queue 교착·무한 대기는 금지한다. 현재 PM-001은 완료 통지 없이void를 반환하므로 한 줄 호출 추가만으로 해결되지 않는다.

구현 전 다음 게이트가 필요하다: 문제 일반 Image의 실제URL/크기/index와 기존 PM-001 입장거부·예산·ready 상태를 좁게 수집한다. 현재 실제 에셋 정체가 없으므로 목록 전체를 확장하거나64MP 예산을 늘리는 생산 변경을 하지 않았다. 재실측은 목적 없는 반복이 아니라 이 입력 식별만을 위한 다음 게이트로 남긴다.

회귀 기준: URL동일/객체상이·크기불일치·중복큐·fetch/decode/upload 실패·timeout·컨텍스트손실/복구·전투가먼저사용·cap80/예산64MP/동시2/대기4 유지·bitmap close 정확1회·기존1px draw/flush 의미·특수항목/Canvas 경로. 실제 확인된 에셋의 GPU RGBA 전수0diff, 로딩증가/메모리/동일전투첫사용과 계측off 재검증 후에만 생산 채택한다. Idle deadline 조정만으로130ms원자호출을 해결했다고 하지 않는다. `_physicalImpactSheet`는 별도 후보로 혼합하지 않는다.
