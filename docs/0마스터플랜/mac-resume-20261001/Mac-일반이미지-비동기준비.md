# Mac 일반 이미지 비동기 준비 — QA-WARM-IDLE-01

판정: **측정으로 확인된 3개 일반 Image 경로 구현·검수 완료. 전체 게임 끊김 해결 판정 아님.** 입력 HEAD `0e15df0fe2dc95eb463d01f397c148bfa5466de8`, 수정 후 game.html SHA256 `7b5f5d8a145194907da9abb89f36912993b797779022fad3b389328c26209152`. 메인만 변경, easy/패키지 미적용.

## 식별과 범위

| 이미지 | 크기 / 픽셀 | 수정 전 warm 호출 | 수정 후 warm 호출 | 수정 전 비동기 상태 |
|---|---|---:|---:|---|
| `assets/vfx/vfx_magic_burst.png` | 3264×4096 / 13,369,344 |165.8ms|0.1ms|미제출·캐시 없음|
| `assets/vfx/boss/vfx_void_black.png` |2304×2304 /5,308,416|143.2ms|0.1ms|미제출·캐시 없음|
| `assets/vfx/vfx_peace_shield.png` |2400×1920 /4,608,000|105.8ms|0.0ms(타이머 해상도)|미제출·캐시 없음|

수정 전 일반 큐 인덱스65/77/79, 길이80. 세 호출 시 PM-001 busy0/wait0/upload0, 사용 예산32,204,920/64,000,000이었다. 예산 거절이 아니라 학습·시드만 연결된 제출 누락이다. 이3장 합계23,285,760px만 기존 예산 안에서 추가 제출한다. 새 세션 관측값55,490,680px(약221.96MB RGBA 논리량)이며 기존64MP 상한을 늘리지 않았다. 실제 VRAM·OS 메모리 측정값으로 해석하지 않는다.

수정 전후 slow warm은 모두 일반 입력 전 연습 화면에서 일어났다. G.on=true/G.paused=false만으로 일반 전투 표본이라 분류하지 않는다. 장비·초기 옵션·실행 순서가 달라 controlled A/B/FPS 개선율을 산출하지 않는다. 수정 후에는 해당3장 호출 전에 같은 컨텍스트 URL 캐시/크기가 모두 일치했음을 관측했다. 이후 원래 투명1px draw+flush를 유지한다.

## 최종 코드 계약

| 항목 | 구현 |
|---|---|
| 대상 | `_WQ_ASYNC_PATHS` 3개, 동일 원점의 로드 완료 HTMLImageElement만. Canvas·특수3 Symbol 경로·다른 이미지는 유지 |
| 제출 시점 | `_queueWarmImage`의80장 제한·중복 검사 통과 직후 `_warmAsyncJob` → 기존 `_texPrewarmSrc` |
| 준비 신호 | 컨텍스트별 `_texPreJobs` job의 pending → decoded → ready, 실패 failed, 복구 무효화 stale. 같은 URL 제출은 동일 job·예산1회 |
| 기다림 | optional warm만 `_waitWarmAsync`에서 최대2000ms, 기존 idle/timeout120ms 스케줄로 양보. 게임의 실제 첫 draw는 기존 동기 폴백을 유지 |
| 타임아웃 | 2000ms는 선택적 기다림 기준이며 브라우저 스케줄 지연을 포함한 엄격한 완료기한이 아님. 실패·예산거절·API 부재도 기존 warm으로 진행 |
| 병렬·큐 | 동시 fetch/decode2, decoded+inflight 예약 합계4. 기존 구현은 Q길이만 보아 동시 완료 때4 초과 가능했으므로 예약 수를 포함해 의도된 상한 유지 |
| 컨텍스트 | reset이 wait/Q/job을 무효화하고 queued bitmap을 즉시 닫음. 이전 in-flight는 busy 슬롯을 유지하다 종료 시 자기 bitmap만 닫음. 새 컨텍스트 업로드 금지 |
| GPU | `_getTex` 원문 유지, Image LINEAR/CLAMP·크기 일치 채택. 실패 업로드 texture 삭제·기존 바인딩 finally 복원 |
| 수명 | drain 성공/중복/실패 및 context 폐기에서 bitmap 정확히1회 close. 게임이 같은 URL을 먼저 썼으면 중복 업로드 없이 닫음 |
| 완료 표시 | 일반 이미지는 warm 함수가 반환한 후 GPU Set 등록. context lost 중 대상3장은 완료 표시 없이 넘겨 복구 후 재검사 가능 |
| 불변 | 시드22, 학습96,64MP, 일반 큐80, 재검사180f, 특수3종, Canvas/WebGPU/2D, 전투·저장·RNG·옵션·에셋 |

## 실제 GPU 및 게임 검수

Apple M5 Pro / ANGLE Metal / Chrome, GPU fixture는 실제 game.html의 WebGL `_getTex`, `_texAdoptBitmap`, PM-001 함수들을 추출한다.

| 이미지 | 비교한 RGBA 바이트 | 다른 바이트 | 직접 Image 업로드 | bitmap 업로드 | 캐시 첫 채택 |
|---|---:|---:|---:|---:|---:|
| magic_burst |53,477,376|0|82.6ms|21.3ms|0.2ms|
| void_black |21,233,664|0|80.0ms|15.7ms|0.0ms|
| peace_shield |18,432,000|0|60.1ms|7.7ms|0.1ms|

총93,143,040바이트 전체 RGBA 동일, 세 텍스처 모두 LINEAR/CLAMP, 동일 WebGLTexture 채택, GL 오류0. 비동기 디코드 벽시계59.1/89.5/69.1ms가 별도로 들었으며 전체 작업시간이0이 된 것은 아니다. 순차 fixture·워밍 캐시이므로 성능 개선율은 산출하지 않는다. bitmap 업로드21.3ms는 여전히 프레임 예산을 넘을 수 있다.

실제 WEBGL_lose_context fixture: decoded bitmap이 loss 후 width0으로 닫힘, stale/queue0/busy0, 복구 후 새 map·새 job·ready/GL error0. 초기 fixture의 no-op _getTex 오선택과 이벤트 안 즉시 restore 오류는 별도 기록하고 검사 도구를 수정해 재검사했다. 게임의 컨텍스트 손실 이벤트 전체를 플레이 중 강제 실행한 검수는 아니다.

새 loopback 저장 원점의 실제 게임에서 모든 대상 ready·held bitmap0·busy0·upload0 확인. 관측 wrapper3개를 정상 입력 전에 모두 원복한 뒤 WASD·좌클릭/드래그·우클릭·Q 입력. 중간 페이지시간55,133.2ms에5처치/적32/HP318.81/전경 확인, 이후 정상 피격으로 자연 사망(게임 표시24초, 최종5처치). HP·좌표·tick·처치·품질 강제 쓰기 없음. CPU profiler/GPU timer OFF. viewport1352×666/DPR2/high/res100/SSAA1/cap0/diff5. atmos2→1 자동 변화는 입력 전에 발생, 고정 조건 전체 성능 비교 아님. 저장은 기존3340 격리서버/격리 saves, PC3333·원래 Mac 체크아웃·사용자 세이브 보존. 종료 후 about:blank.

수정 전 관측 버퍼누락0, 수정 후300개/누락1. 대상3장 전후 기록은 모두 보존했으나 전체 호출 완전 수집으로 주장하지 않는다. 수정 후 다른 `fire_burst_radial.webp` warm146.9ms가 남았다. 이전 atlas·틴트/getImageData 경로도 이번 해결 범위 밖이다. 브라우저 로그의 상세 없는 Object 오류 메시지는 기준/fixture/게임에서 나타났고 게임 예외로 귀속되지 않았다. 콘솔 오류0이나 장시간 무결함 판정을 하지 않는다.

관련61테스트 PASS(실행 가능한 lifecycle8개 포함), guard PASS·inline6문법 PASS. 실제 VRAM/OS 메모리·장기 누수·전체 프레임분포·NW.js 패키지 검수는 이번 완료 범위 밖이다. 논리예산·닫기 수명·실제 게임 기능과 픽셀 동등성만 인수했다.

[세부 원자료 요약](warm-idle-evidence/summary.json) · [원자료·화면·fixture·회귀 ZIP](warm-idle-evidence/raw-and-screenshots.zip).

## MAP PRODUCTION REPORT

STAGE CH1-1 전투 QA. geometry/아트/충돌/배치 변경0. START와 정상 입력 전투·사망 화면 확인, 전체8뷰 검수 아님. TECH QA는 위61검사·실제3장 전수 픽셀·수명 검수. **VISUAL VERDICT: RETOUCH** — 맵 전체 품질 PASS 아님. NEXT PASS는 남은 불꽃/atlas 지연을 별도 식별·예산 검토 후 한 건씩 다룬다.


후속 상태: 위3장 결과는 당시 측정 이력이다. FIRE-02는 기존3장 우선예약을 유지하면서 불꽃을 추가했다. [현재4장 계약·별도73.7ms 비용·미완료 게이트](Mac-불꽃-비동기준비.md)를 따른다.
