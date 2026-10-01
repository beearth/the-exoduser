# DRAW-LONG-FRAME-ATTRIBUTION — UIUX

## 범위·수신·자료

사용자 최신 배정·AGENTS·총괄18.40·HUD 텍스트/숨은DOM/Mac텍스트아틀라스/비동기 텍스처 프리워밍 SSOT를 읽고 중복 확인했다. UIUX draw-attribution-task 이외 분석 산출 없음. 첫 Read 명령 UTC2026-10-01T14:50:45Z, 실제 원자료/관련 소스 읽기 완료14:51:30Z 이전. 정확한 메시지 수신 초는 UNKNOWN. 첫 Edit는 전용 영수증·분석기·회귀 생성 apply_patch 성공,14:51:30Z 이후~14:53:04Z 이전이다.

root가 게임탭·profiler를 종료했다는 사용자 인계를 따랐다. 이번 세션은 원자료읽기·작은오프라인분석만 수행했다. 소유 draw-attribution-*만 작성, 원자료/생산/공유docs/Git/권한/outbound queue/게임/브라우저/서버/빌드/이미지/새세션/하위에이전트 변경·실행0.

이번 자료는 **9처치의 새 표본**이다. support/normal-combat의15처치·draw129.8ms와 다른 기록이며 같은 사건/개선 전후라고 단정하지 않는다. 기존Chrome프로필·새origin·캐시UNKNOWN·요청1ms CPU profiler+loop/update/draw3wrapper+PerformanceObserver·측정오버헤드UNKNOWN이다. 이전 경량 표본을 대체하지 않는다.

## 시간축 정렬과 불확실성

분석식 `performance.now_ms = (profile_monotonic_us - NavigationStart_seconds*1e6)/1000`을 적용했다. 임의 UTC/epoch 변환이나 중앙값 보정은 하지 않았다.

| 대조 | 실제값(ms) | 판정 |
|---|---:|---|
| NavigationStart | 816904.114954초 | 전후 동일 |
| Performance Timestamp 변환 | 34665.821 | Runtime.evaluate 전후34659.600~34670.200 안 |
| anchor bracket 폭 | 10.600 | 명령실행 bracket이지 CPU샘플 정확도 보증 아님 |
| profile 시작 변환 | 47677.764 | profileBefore47673.400~profileAfter47908.300 안 |
| profile 끝 변환 | 75108.919 | stopMetrics Timestamp75151.183보다 앞 |
| profile 전체길이 | 27431.155 | 관측25,021.200ms와 달리 준비/종료도 포함 |
| samples/timeDeltas | 18325/18325 | 실제delta 최소0.001ms·최대220.698ms; 요청1ms 균일샘플 아님 |
| 누적 delta 미포함 끝 | 0.494 | 주 추정에서 별도 미귀속 tail |

주 분석은 sample endpoint의 timeDelta를 직전구간에 배분하고 draw창과 교집합 길이만 합산한다. 실제 엔진이 그 함수에서 그만큼 순수계산했다는 뜻이 아니다. forward-hold 대안과 anchor residual bracket(-6.221/+4.379ms) 이동을 민감도 분석으로 함께 출력했다. 이 이동값은 실측 시계오차를 확정하거나 보정한 값이 아니다.

## 두 긴 draw 귀속

| loop | draw performance.now 구간 | wrapper duration | 처치 | 최상위 sampled leaf | 주 배분 추정 |
|---|---|---:|---|---|---:|
| 210 | 55887.400~56001.600 | 114.200ms | 5→5 | getImageData / _tintHolyDome | 111.029ms |
| 686 | 71976.000~72075.000 | 99.000ms | 9→9 | getImageData / membrane | 91.387ms |

전체 호출 스택은 다음과 같다. wrapper/eval URL은 빈 문자열이고 해당 실행원문과 로컬파일 일치가 증명되지 않아 임의 URL/줄을 붙이지 않았다. 아래 JS줄번호는 profile 0-based를1-based로 변환한 함수 시작점이며 실제 getImageData 호출 줄과 구분한다. native leaf의 lineNumber=-1은 null로 남겼다.

1. `(root) → wrappedLoop(eval line63) → loop(game.html:59653) → wrapped(eval line48) → draw(game.html:49862) → drawP(game.html:53533) → _physicalImpactSheet(game.html:8539) → _tintHolyDome(game.html:8737) → native getImageData`.
2. `(root) → wrappedLoop(eval line63) → loop(game.html:59653) → wrapped(eval line48) → draw(game.html:49862) → draw(ch1-living-detail.js:331) → atlas(:312) → paint(:173) → membrane(:120) → native getImageData`.

실제 URL은 `http://qa-draw-attribution-20261001.localhost:3340/game.html?webgpu=0`와 같은origin의 `ch1-living-detail.js?v=20260929-87`이다. 전체519노드의 URL·scriptId·line0/line1·column0·조상스택·현재로컬소스SHA·시작줄텍스트를 분석JSON에 기록했다.

### 증거 있는 결론

- 첫 경로: `_physicalImpactSheet`는 이미지객체 WeakMap 캐시 miss 때 `_tintHolyDome`을 실행한다. 실제 source의 `_tintHolyDome`이 캔버스2개 생성·원이미지draw·getImageData·RGBA변환·putImageData를 동기 수행한다. `drawP`에서 physical impact 표시 시 이 경로가 호출된다. **이 invocation의 파생시트 캐시 miss 경로가 draw 안에서 실행됐다는 근거**가 있다. 정확한 이미지객체/파일/차원은 profile만으로 미확정이다.
- 둘째 경로: `draw→atlas→paint→membrane`에서 재료캐시 miss 생성과 실제320×320 getImageData가 실행됐다. membrane의 루프는 원본 픽셀을 읽어 윤곽 alpha를 보정하고 캐시를 등록한다. 코드주석의 “never during draw”와 달리 lazy 생성은 draw 아래에서 실행될 수 있으며 이번 실제 스택이 그 경로를 포착했다. variant/wet/atlas ID는 미캡처다.
- 두 draw창의 주 추정에서 HUD/UI-helper·text·DOM-api 표본은 없었다. **이번 두 스파이크를 HUD/텍스트/DOM으로 귀속할 근거는 없다.** 비샘플 호출까지 없었다는 뜻은 아니다.
- 둘째 창의 약1.154ms `_glFlush→_flush` 표본은 draw의 형제 스택이고 주 배분 경계와 겹친다. 이것을 동기draw 내부 GPU병목으로 단정하지 않는다. GC1.506ms와 program0.061ms도 경계/런타임 추정이다.
- forward 추정의 getImageData는109.791/91.415ms, bracket 이동 민감도의 주 leaf는104.808~110.035/85.553~91.387ms다. 수치는 달라도 두 readback 경로가 우세한 귀속은 유지했다.

**getImageData 아래 내부가 CPU변환·native처리·GPU동기대기 중 어느 비중인지 분해하지 못했다.** 동기draw wrapper는 CPU측 호출구간 측정이지 GPU완료시간이 아니다. JS 루프/브라우저 native/driver/GPU대기 시간을 완전분해했다고 보고하지 않는다.

## 전체 표본과 UI/문자/이미지 구분

profile 전체27.431초의 배분 결과다. 다음은 서로 배타적인 **스택문맥 분류**이며 작업 전체CPU측정/함수별 정확시간이 아니다. text 스택 아래 texImage2D는 text로, HUD helper 아래API는 선행분류 우선순위에 따라 하나의 범주에만 들어간다. inclusive 조상값과 self leaf값을 따로 기록했고 합산하지 않는다.

| 범주 | 추정ms | 의미 |
|---|---:|---|
| Canvas-pixel-read/write | 202.630 | 실제2개 getImageData leaf가 대부분 |
| text | 45.433 | measureText 및 fillText/텍스트업로드 문맥. 긴2창 주증거 없음 |
| HUD/UI-helper | 113.180 | _hset/_hudPulse/_skCdSet 등 helper문맥; 읽기/쓰기 내부비용 분해 불가 |
| DOM-api | 12.034 | 실제 querySelector(All)/getElementById 표본. 긴2창 없음 |
| Canvas/image-api | 106.322 | 이미지/restore 등 Canvas문맥 |
| GL-call-path | 159.634 | texImage2D/flush 등 호출문맥; GPU완료시간 아님 |
| other-JS/unresolved | 1427.845 | draw/update/캐시생성 등 남은JS |
| runtime/unresolved | 25363.583 | idle23053.500·program2253.929·GC 등. 이를 활성CPU시간으로 합산하지 않음 |

## 최소 수정 후보 — 아직 적용/성능검증 아님

| 후보 | 근거·최소 방향 | 미확정/검수 게이트 |
|---|---|---|
| PHYSICAL_DERIVED_PREPARE | 실제 사용 Image객체가 load된 준비 단계에서 기존 `_physicalImpactSheet` 결과를1회 준비하여 draw miss를 피하는 후보. WeakMap identity를 보존하며 다른 새Image로 워밍하지 않음 | 정확 asset·로드경계·메모리·같은픽셀·실제warm/cold 교차 검수 필요. 단순 GL tex prewarm은 Canvas 파생시트 생성을 대신하지 않음 |
| MEMBRANE_PREPARE | stage readiness의 작은 준비 작업에서 실제 필요한 membrane/atlas variant만 기존 생성식을 재사용해 준비하는 후보. draw중 첫 생성과 getImageData를 분리 | 실제variant계약·캐시인덱스·예산/대기시간·같은RGBA·최초진입 검수 필요. 무조건 전variant 생성/화질하향/픽셀처리삭제는 제안하지 않음 |

관측된 경로는 확인했지만 개선율·재발빈도·GPU원인은 미확정이다. 후보는 **설계/다음 독립 검수 제안**이고 이번에 생산 코드·게임동작을 바꾼 것은 아니다. 기존 TEXTURE_ASYNC_PREWARM과 HUD캐시 수정은 별도이며 재발/무효로 선언하지 않는다.

## 재실행·검사·해시

최종검사/완료기록 UTC14:55:16Z. 동일 원자료부터 재실행 결과JSON의 SHA도 동일해 결정적 replay를 확인했다. 분석JSON SHA `b0d36a0a1748215ca8669ab9be0be3bf26a6ce7c1fd63bbb494cd978ed3c1526`.

`node tools/team-followup-20261001/UIUX/draw-attribution-analyze.mjs`는 root4원자료를 읽어 NavigationStart/Runtime bracket 검증→18325 interval→긴2창/전체519stack→현재소스/원자료전후SHA 대조→소유 분석JSON을 생성한다. 출력 `draw-attribution-analysis.json`, 요약 `draw-attribution-summary.json`. `node --test tools/team-followup-20261001/UIUX/draw-attribution-analyze.test.mjs` **5PASS/0FAIL**, exit0. 시간축/샘플교집합/잘못된clock/범주/실제호출 검사를 수행했다. 구문검사 exit0. 원자료읽기 분석실패 없음.

| root 원자료 | SHA256 |
|---|---|
| raw.json | a50e25e3cc50492d90b819126a98653bd3c80738985e663785442aeee986a4e2 |
| profile.cpuprofile | 71e15813b68a8235ae264a6eb359e0e5e79de622f984bf9907e6cfd365ae27ba |
| clock.json | 1337ff447a77a84652b99baa55e07c21db13694a17d0724064670308f801302d |
| preflight.json | 3acddb3b8290a328ad26866f3aa948479818562abb17affcf41b0b480e8c5c7b |

game.html 현재 로컬 SHA `8ebc3b7b52a651c1a3bc5e8c285b00d186c6dacc18429ada7499781acc72b0b9`는 root preflight와 일치한다. ch1-living-detail.js 현재 로컬 SHA는 `e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640`다. 후자를 포함한 다른 URL의 브라우저 로딩 바이트와 현재 로컬의 동일성은 별도로 UNKNOWN이며 소스 추정을 실행 중 변수 실측과 혼동하지 않는다.

docs 전체 관련키워드 검색은 `draw-attribution-doc-matches.txt`에 보존했다. 공유SSOT/총괄18.40은 수정하지 않았으며 root가 이번 새표본/한계를 별도 반영한다. CPU/GPU trace·정확필드캡처·비계측대조와 실제 최소후보 검수는 새 승인 범위로 남는다.
