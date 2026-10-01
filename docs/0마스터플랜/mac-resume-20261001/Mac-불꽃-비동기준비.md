# QA-WARM-FIRE-02 불꽃 이미지 준비

판정: **본편의 좁은 비동기 연결 구현 및 픽셀·준비 경로 확인. 정상 처치 회귀·전체 성능 인수는 미완료. 독립 예약 검토8개와 URL-query 포함 root17개는 후속 인수.** easy/패키지 미적용. 입력 HEAD `fe85bb0866b895b91adf82da54dfe48bb7f89f7f`, 실제 GPU/게임 측정 SHA256 `1fc7ac9a31eb516535bda52d300f1958bf5240f5620afbd4038d4ba7b36ecff5`. 이후 게임 변경은 context-loss 주석의 three→explicitly targeted 정정뿐이며 실행문 동일.

## 계약

| 항목 | 현재 값·동작 |
|---|---|
| 신규 대상 | 동일 원점·로드 완료 HTMLImageElement `/assets/vfx/fire_burst_radial.webp`, 3584×1728 = 6,193,152px |
| 우선순위 | 기존 magic_burst/void_black/peace_shield 3장의 현 컨텍스트 캐시 또는 non-stale 예약이 모두 있어야 fire 예약 허용 |
| 늦은 수집 | 일반 큐 수집 뒤 `_queueWarmFireAsync()`가 최대80개 중 fire를 한 번 재검사. 누락·예산거절 primary의 몫을 선점하지 않음 |
| URL | primary는 현재 literal 경로의 절대 URL로 확인. 쿼리 변형만 있으면 보수적으로 fire 비동기 제출을 생략하고 기존 warm 폴백 유지 |
| 예산 | 시드32,204,920 + primary23,285,760 + fire6,193,152 = 61,683,832 / 64,000,000px. 잔여2,316,168px |
| 수명 | 기존 job/context/bitmap close 경로 공유. 동시 fetch/decode2, decoded+inflight 예약4, 선택적 warm 대기2000ms, 큐80 모두 유지 |
| 폴백 | API 부재·예산 부족·실패·타임아웃은 원래 동기 warm. 실제 첫 draw `_getTex`는 변경하지 않음 |
| 보존 | 에셋·해상도·필터·알파·전투·수치·저장·RNG·품질·시드22·학습96·특수 warm3종 유지 |

논리 RGBA 약246.74MB이며 실제 VRAM/프로세스 메모리 측정값이 아니다. 예약 기준을 늘리지 않았다. 현재 literal `fire_burst`는 등록과 준비 목록에서 확인되며 이번 전투에서 실제 불꽃 화면 사용을 증명하지 않았다.

## 검증 근거

| 검사 | 결과 | 해석 한계 |
|---|---|---|
| 실제 M5 Pro ANGLE Metal GPU fixture | 24,772,608 RGBA바이트 전수 차이0·max0, LINEAR/CLAMP, GL error0, 동일Texture 채택 | 순차 warm-cache 진단. 전체FPS A/B 아님 |
| fixture 비용 | 직접 Image107.7ms / bitmap10.3ms / 별도decode wall118.6ms / 캐시 첫 채택0.0ms | 비동기 준비 자체 비용이 없어지지 않음 |
| 실제 게임의 fire warm | 이전146.9ms → 이번0.0ms(타이머 해상도), 호출 전 ready/cache 존재 | 서로 다른 실행 조건. 전체 성능 개선율 산출 금지 |
| 실제 게임의 별도 bitmap 업로드 | 73.7ms | fixture10.3ms보다 큼. 이 비용을 제외하거나 무끊김으로 표현하지 않음 |
| primary 우선순위 | 기존3장과 fire 모두 ready, 최종61,683,832px, busy0·queue0 | 장기 메모리·실제 context loss 전투 검수 아님 |
| 관측기 | 4개 wrapper, 정상 입력 전 모두 원복 | 상세 호출/drop 수는 원자료 summary 참조 |
| 정상 입력 | 연습 건너뛰기·W·좌클릭 drag·우클릭. 약24.45초 관측 뒤 HP0 자연사·0처치 | 게임 강제 상태 변경0. 처치·스킬 가시성 회귀 완료로 인수하지 않음 |
| 회귀 | 관련69개 PASS, guard·inline6 PASS(앞선 실행). 주석/fixture 출력폴더 정정 후 필요한 재검사 별도 로그 | 독립 QA 후속8개 PASS, URL query 보강17개 PASS; 자세한 정정은 후속 영수증 |

관측 warm/업로드는 모두 정상 전투 입력 전 연습 상태에서 발생했다. G.on=true만으로 전투 중 업로드라고 분류하지 않는다. 정상 전투 시작 스냅샷37576.8ms, 종료62029.7ms는 페이지 시각이며 정확한 사망 시각은 미계측. viewport1352×666/DPR2, CPU profiler/GPU timer OFF. 상세 없는 Object 콘솔 오류가 기준/fixture/게임에 있어 오류0 판정은 하지 않는다. 종료 후 about:blank, 3340 격리 서버/세이브·PC3333 보존.

실측과 정상 처치 재검사 사이에 기존6팀 VS Code 입력 복구를 위한 사용자 포커스 조치가 대기 중이므로 새 게임·창 전환을 중단했다. 코드 체크포인트는 릴리스 승인이나 전체 전투 검수 완료가 아니다.

[요약 원자료](warm-fire-evidence/summary.json) · [관측·GPU·화면·검사 원자료](warm-fire-evidence/raw-and-screenshots.zip).

## MAP PRODUCTION REPORT

STAGE CH1-1 시작/전투 QA. geometry/충돌/아트/배치 변경0. 기존8뷰 전체 미검수. TECH QA는 위 픽셀·수명·준비 호출 범위. **VISUAL VERDICT: RETOUCH**. 다음 게이트는 정상 처치 회귀 및 별도 업로드73.7ms의 예산 영향 분석이다.
