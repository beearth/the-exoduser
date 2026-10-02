# SFX 샘플 시작의 동기 실패 정리 — 2026-10-02

`_playSampleNow`의 `src.start(startTime||0)` 접점만 양판 생산에 반영했다. 수정 전에는 start의 동기 throw 뒤 등록 카운터/노드가 예약 정리까지 남았다. duration 0.2초 대역의 예약은 700ms이며, 콜백을 수동 실행하면 회수되므로 **영구 누수로 판정하지 않는다**.

```js
try{src.start(startTime||0);}catch(e){_nd._dn();throw e;}
```

| id / 적용 위치 | 현행 source 계약 |
|---|---|
| 등록 순서 | `_activeNodeCnt++` → `_activeNodes.push(_nd)` → onended/timeout 연결 → start. 성공 start만 카운트를 올리는 구조가 아님 |
| 동기 start 실패 | 선택된 actual `_nd._dn` 즉시 호출 후 같은 Error 객체 rethrow. 일반 경로는 `_dn`, `pan&&Math.abs(pan)>0.05`는 `_dnP`. 해당 fixture 즉시 count/list 0, start 시도 1·stop 0 |
| 예약 정리 | `_dur=buf.duration||2`, timeout은 `(_dur+.5)*1000` = `((buf.duration||2)+.5)*1000`. 취소/재계산 없음. .2초 fixture 700ms는 실시간 측정이 아님 |
| 중복 core 회수 | 기존 `_d`가 count 감소·swap-remove·src/gain disconnect 시도를 가드. 늦은 onended/중복 timer가 다른 노드를 제거하거나 두 번 감소하지 않음 |
| panner/실패 catch | 기존 `_dnP`는 호출마다 panner.disconnect 시도 가능. src/gain은 같은 기존 try라 src.disconnect throw면 gain 시도가 생략됨. 모든 disconnect 1회/모든 자원 해제 보장은 없음 |
| 정상/dispatcher | 정상 src 반환·trace·gain/rate·timer/onended 흐름 유지. 실패가 `_sfxFrameReset`로 전달되면 큐 clear에 도달하지 않아 fixture queue 1 유지. 큐 실패 처리 변경·인수는 별도 |
| 정책/수치 | 우선순위·전체/프레임/카테고리/PROJ/HIT/STEP 상한·30ms dedup·큐·음원·호출부 변경 0. fixture ghost_laugh backend pri 9/queued pri 0, gain .8/rate1.1856/caller+pitch RNG 2는 이 입력의 source 결과이며 전 호출/가청 보장 아님 |

| 생산 파일 | 최종 SHA-256 | 1-based source 위치 |
|---|---|---|
| game.html | `068808244450ce2a7dc9fbb7ba7b7186dd295224dd4072a3d2402acd90ba8bc3` | `_playSampleNow` 11800, start catch 11837 |
| game-easy-test.html | `482ec94f53ba88639e09e113cf1fa15eba98567f6197d2cf88b399e86649bd27` | `_playSampleNow` 11204, start catch 11241 |

각 HTML 접점 1개·+33bytes, 구역 밖 원 bytes 및 앞선 boss/mortar/기존 가드 보존은 생산 영수증으로 확인했다. 영수증: `tmp/mac-migration-runtime/continued-review-20261002/sound-start-backup/receipt.json`, SHA-256 `849ac07cd2b87101e713e5e6faf8b827384058435fd5813b80f0b329866dc596`.

| 검수 | 확정 결과와 경계 |
|---|---|
| 신규 `test/audioSampleStartFailure.test.cjs` | 실제 양판 분리 source 18/18 PASS. 이전 baseline 18 중 8 PASS/10 FAIL은 이력이며 최종 PASS에 합산하지 않음 |
| 구문 | 양판 inline JS 12/importmap JSON 2 PASS |
| 실제/대역 | 실제 9함수·상수·내부 _dn/_dnP 추출. WebAudio node/bus/buffer·clock/수동 timer·voice identity·결정적 RNG는 대역 |
| 과거 전문팀 후보 | `SOUND-start-failure-0543` 결과의 productionApplied=false/priorityPolicyAdopted=false는 당시 snapshot 유지. 이번 채택은 start 동기 실패 정리 source에만 한정 |
| 미인수 | 전체 게임·native AudioContext/실제 장치 실패·실시간 timer·실제 청취·브라우저/빌드 제품 Gate, 모바일 포화·폴리포니/우선순위 설계 |
| 범위 밖 | start 이전 create/panner/connect 실패와 선행 축출 노드 복구. 기존 cleanup의 Math.max/배열 작업은 catch 밖이므로 인위적으로 손상시킨 intrinsic/배열이 throw하면 원 start 예외 보존까지 보장하지 않음; 현 source에 해당 변경은 발견되지 않았으며 이 수정의 추가 catch 없음 |

원 `result.md/evidence.json/checks.mjs`와 기존 검사는 수정·재실행하지 않았다. source PASS는 실게임/native/청취/product PASS가 아니다. 관련 정본은 [사운드](6사운드디자인.md)와 [성능](../12퍼포먼스·최적화/12퍼포먼스·최적화.md)의 2026-10-02 부록이며 기존 원문 prefix·개행을 보존했다.
