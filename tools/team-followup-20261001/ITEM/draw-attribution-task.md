# DRAW-LONG-FRAME-ATTRIBUTION — ITEM

지원 후보 완료 뒤 다음 한 건. 최신 수신·AGENTS·총괄18.40·관련 SSOT를 읽고 중복 확인한다. 소유는 `tools/team-followup-20261001/ITEM/draw-attribution-*`뿐. root가 CPU profile 기록을 완료하고 게임 탭·profiler를 종료했다.

실제 새 원자료는 `outputs/team-review-20261001/draw-attribution/{raw.json,profile.cpuprofile,clock.json,preflight.json}`. 기존 정상자료는 support/normal-combat이며 별도 표본이다. 이번 profiler1ms 요청+loop/update/draw3wrapper+PerformanceObserver는 이전 경량표본을 대체하지 않는다. 오버헤드 미측정·캐시UNKNOWN·기존Chrome프로필. 동기 draw는 CPU계산 전용이나GPU완료시간 아님. 이번 draw최대114.2/99ms,9처치이며 이전129.8ms와 같은 사건으로 단정금지.

처치 이후 생성된 worldItems/전리품 렌더 경로 귀속. 실제 profile의 draw>50ms 두 구간, 해당 loop before/after items/kills와 스택을 대조해 _worldItemSkin/마스크/이미지/RNG 경로에 실제 증거가 있는지 확인한다.

profile timestamps는 microsecond monotonic, CDP Performance NavigationStart(second)로 performance.now축에 정렬하되 clock.json의 전후 Runtime.evaluate bracket과 직접 대조한다. sampled stack/timeDelta는 샘플 추정이며 CPU/네이티브/GPU대기 시간을 완전 분해하지 않는다. 스택의 URL·줄번호(0-based→1-based)·실제source SHA, root원자료SHA, 원자료부터 재실행 가능한 작은 분석기/결과를 남긴다. 발견한 원인과 최소수정 후보를 구분하여 한국어 보고하고 생산 파일은 수정하지 않는다. 수신·Read·검사·완료 시각 receipt를 남긴다.

게임/브라우저/서버/빌드/이미지생성·원자료수정·Git·권한변경·outbound queue·새세션/에이전트 금지. 원자료 읽기/작은 분석만 수행하며 실제 호출 근거가 없으면 미확정이라 명시한다.
