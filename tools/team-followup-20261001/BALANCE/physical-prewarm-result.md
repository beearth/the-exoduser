# PHYSICAL-IMPACT-PREWARM-CANDIDATE

## 수신·실제 Read/Edit·검사

2026-10-01T14:52:43Z 수신/첫Read. 지시와 총괄18.40, VFX/성능 SSOT, 실제 `_physicalImpactSheet`/`_tintHolyDome` 및 부트 `_preloadAssets`→준비→renderer 순서·기존 epoch 계약을 읽었다. 소유 폴더에 task만 있어 중복후보 없음 확인. 첫Edit는 `physical-prewarm-receipt.json`, 다음Edit는 실제 후보 함수/하니스. 원자료 clock과 raw 구조를 읽고 세원자료 파일해시를 기록했지만 UIUX/ITEM의 원인귀속 작업을 대신 수행하지 않았다.

root가 제공한 draw114.2ms·74표본의 getImageData←tint←physicalImpactSheet←drawP 귀속은 **배정 근거**이며 이번 BALANCE가 재측정/독립 검증한 수치가 아니다. 생산코드를 추측으로 수정하지 않았다.

2026-10-01T14:54:49Z 최종 작은 검사 완료. 최초11그룹PASS 후 naturalWidth/naturalHeight 엄격확인 및 대기getter/부분등록 예외 정리2경계를1그룹 보강하여 최종12그룹PASS. 신규 실패0.

## root 통합용 실제 미적용 코드

`physical-prewarm-candidate.js`의 `_preparePhysicalImpactSheet()`는 기존 `_tvfx2Imgs['Fire_ImpactFire_Sheet.png']` 한 장만 이용한다. 아래 두 단계는 **적용 위치 안내**이며 실제 게임파일에 적용하지 않았다.

1. 함수 정의를 기존 `_physicalImpactSheet` 이후 해당 함수와 boot globals를 볼 수 있는 동일 script scope에 추가한다. `_physicalImpactSheet`/`_tintHolyDome` 본문은 그대로 둔다.
2. `_boot`의 `await _preloadAssets()` 이후, 현재 `_prepareWorldDropFx`/`_prepareWorldItemSkins` 뒤, `setBootLoading(80,...)`/`await _bootRenderer()` **이전**에 `await _preparePhysicalImpactSheet();` 1회를 추가한다. G.on 이전이고 _bootLoadActive=true인 구간이다. root가 정확한 원소스/epoch 수명과 인수 순서를 재확인한다.

| 계약 | 후보 동작 |
|---|---|
| 대상 | 기존512×512 실제 로드 이미지. 새 Image/URL 요청0, naturalWidth/naturalHeight 둘다512 필요 |
| 기존 함수/캐시 | 원 `_physicalImpactSheet(image)`를1회 호출하며 원 WeakMap 그대로 사용. 원 tint RGB/alpha/셀/전투/쉬운판 불변 |
| 재사용 | 이미 준비된 cache.get(image)를 반환대상으로 확인하여 동기가공0. 대기중 원lazy가 준비한 것도 재사용 |
| in-flight | 함수의 pending 속성에 하나의 Promise 보관. 동시에 호출하면 정확히 동일Promise. 완료finally에서 해당pending만 비움; 새 이미지캐시는 만들지 않음 |
| 취소 | G.on/!_bootLoadActive/_bootLoadKilled/epoch변경은 부트밖 skip 또는 대기/가공전 취소 |
| stale | 초기 src/currentSrc 및 객체 identity를 대기중·대기뒤·가공전에 대조. 변경되면 원lazy에 맡김. 정상load에서 currentSrc가 빈값→주소로 바뀐 경우도 보수적으로 stale skip 가능 |
| load/error | addEventListener로 기존 onload/onerror 유지. settled 가드·개별remove·timer 정리. 부분등록/getter예외도 resolve/error 기록 |
| 기다림 | 시작+250ms deadline, 최대16ms 간격 취소/상태 poll. 예산이 끝나면 listener/timer 정리·timeout. 예약/이벤트큐 지연은 선점보장하지 않음 |
| 동기가공 | 시작전 deadline확인. 시작한 원1회 동기함수는 선점불가. 끝난뒤 초과하면 prepared-over-budget 명시; **hard timeout이 아님** |
| 실패 | missing/load-failed/stale/cancelled/timeout/error/empty이면 원lazy 폴백 유지, await는settle, 무한로딩/생산캐시 강제삭제0 |

실제 remove/clear API가 던지면 errors에 기록하고 다른정리를 계속한다. API 거절로 제거하지 못한 항목을 정리완료라고 보장하지 않는다. 정상 브라우저API의 cleanup과 예외 경계는 root가 실제인수할 항목이다.

## stats

`_preparePhysicalImpactSheet.stats`는 시도별 결과다. attempts는 존재/적격 타겟1개 확인 횟수, reuses는 원캐시재사용0/1, status는 위상태, syncMs는 실제 원동기가공 호출구간, totalMs는 시작→종료, pixelBytes는 생성/재사용한512²출력 명목RGBA **1,048,576**바이트다. 오류는 errors배열. 동기가공이 없으면 syncMs0; 오류·빈출력은 pixelBytes0. pixelBytes는 추가/총 GPU메모리 실측이 아니며 재사용에서도 출력크기만 의미한다.

## 의미있는 실제 후보 실행 하니스

`physical-prewarm.test.mjs`는 **본편에서 두 원함수를 실제 추출**하여 VM에서 미적용 후보와 함께 실행한다. 원 함수 문자열을 새 계산으로 대체하지 않았다. document/Canvas/ImageData는 **synthetic CPU RGBA 대역**, 시간/대기타이머는 **fake clock**이다. 실제 이미지 로딩/브라우저픽셀/GPU/게임성능 검사가 아니다.

| 검사 | 결과 |
|---|---|
| 원helper/tint/WeakMap·동일객체·RNG0 | PASS. 첫readback1회·재호출0, 동시호출동일Promise. Math.random은throw 대역 |
| 합성512² 모든RGBA | PASS. 원tint로 생성한 synthetic262144픽셀의 RGB255/alpha 반올림 공식 전부 확인. 실제 원화pixel 동등성 인수는 남음 |
| 부트밖 | G.on/bootActive/killed에서 draw/readback0 PASS |
| 미완료이미지/load | listener2개·기존handler불변·준비후listener/timer0 PASS |
| error/크기오류/missing | 원lazy 준비없음·정상resolve PASS |
| 기다리는동안 취소/epoch | 가공0·listener/timer0 PASS |
| source/currentSrc/identity변경 | stale·가공0·cleanup PASS |
| 250ms | timeout·늦은load무효·무한timer0 PASS |
| 동기300ms fixture | prepared-over-budget/syncMs300/totalMs300 PASS. 실가공300ms 측정이 아닌 fake비용 |
| 동기가공예외 | error·sync시간기록·cache entry없음·pending해제 PASS |
| 기다리는동안 원lazy준비 | 원객체재사용·추가readback0 PASS |
| late getter/부분listener 예외 | settle/error·정리 PASS |

명령 `node --test tools/team-followup-20261001/BALANCE/physical-prewarm.test.mjs`: exit0, **12PASS/0FAIL/0SKIP**, 약229ms(하니스 wall-time). `node --check .../physical-prewarm-candidate.js` exit0. docs전체 `rg -n '_physicalImpactSheet|_tintHolyDome|Fire_ImpactFire|사전.*준비' docs/` exit0.

근거: `physical-prewarm-tests.txt` (실제helper/tint/후보해시 포함), `physical-prewarm-hashes.txt` (본편/easy·후보·root raw/profile/clock), `physical-prewarm-doc-search.txt`. 원자료수정0. SSOT 흰틴트 RGB255/alpha=max원RGB×원alpha/255 반올림과 물리4셀/12f 등 기존설계값변경0. 관련문서의 원구현설명은 정정불필요; root 채택시에만 부트준비위치·예산·상태·제약을 추가하는 인계 후보로 남긴다.

## 최종 인수 게이트

root는 실제 Fire_ImpactFire 원화/캐시512² 색·알파 전수동등, 실제 부트시간/총비용, 메모리, 실패폴백·취소 및 정상실전 전후회귀를 검수해야 한다. 이번에는 캐시첫가공을 부트로 옮기는 후보·계약검수만 완료했다. **프레임개선율/PC329ms해결/브라우저픽셀/실전성능 PASS를 주장하지 않는다**.

모든쓰기 BALANCE physical-prewarm-* 한정. 본편/easy/원helper/tint/원자료·공유docs/Git/queue·게임/브라우저/서버/대형빌드/새세션/에이전트 변경/실행0. 통합·원격체크포인트는 root 소유다.
