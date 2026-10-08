# CH1-1 생체나무 얼굴 개별 애니메이션 — 97차 (2026-10-01)

> **98차(2026-10-08)로 변경:** 나무 36그루의 얼굴 애니메이션은 `ch1-rot-trees.js`로 이관됐고, 이 문서의 `ch1-face-life.js`는 군락(mass) 앵커 61개(eye 28·mouth 15·tumor 18)만 그린다. 버전 `20261008-rotforest-98`. 현행: [CH1_ROTTEN_FOREST_RUNTIME_TREES_PASS98_20261008.md](CH1_ROTTEN_FOREST_RUNTIME_TREES_PASS98_20261008.md). 아래 163앵커·키 97은 당시 이력.

## 목적과 범위

95차 RETOUCH 잔여 "눈꺼풀·입·종양의 개별 애니메이션 미구현"을 런타임 오버레이로 구현한다. **베이크 재작업 없음** — 청크 픽셀·geometry·충돌·배치·96차 bakeVersion(`20260930-rotforest-96`)·cache key(`20260930-rotforest-97`)는 그대로다. 신규 이미지 생성 0장(크레딧 0) — 눈꺼풀·패치는 전부 베이크된 청크 픽셀에서 절차적으로 파생한다. 2.5D 깊이 벤치마크 지침 준수: 보행 경계에 새로 굽는 나무·프롭 없음(런타임 오버레이만).

## 구현

| ID | 파일 | 값·역할 |
|---|---|---|
| ANCHOR-97 | `outer90_sources/face-anchors.json` (생성: `tmp/ch1_rotforest97_gen_anchors.py`) | version `20260930-rotforest-97`. placements(-96)×features(-96) 변환으로 bake px 앵커 **163개**(eye 68·mouth 25·tumor 70). 필터 3종: ① 경계 fade<0.5 탈락 41 ② 상위 레이어(36나무+뿌리) 타원 25점 커버리지>22% 탈락 45 — 부분 가림 피처를 애니메이션하면 앞 가지가 함께 움직이는 오류 방지 ③ 최종 master 국소 가시성(mean L≥26, std≥7) 미달 탈락 2. bakeToWorld=1000/1024 |
| MODULE-97 | `ch1-face-life.js` (신규, `?v=20260930-97`) | sway와 동일 계약 `draw(c,g,now,chunkCache,visibleIds,chunkSize,source,width,height)`. 앵커 테이블은 마커 사이에 빌드타임 임베드(fetch 없음). 카메라 컬링(±90 world px 마진), 패치는 유휴 큐(3ms/requestIdle 200ms 타임아웃)에서 청크 이미지(1026², bleed+1)로부터 복사 제작, LRU 40, 프레임당 draw 상한 24, 프레임당 할당 0. 게임시계(now)와 performance.now()가 다른 문제는 재시도 플래그(-1)로 draw 시계에 위임. 89차 sway 결합: `displacement` 공식을 sway와 동일 유지(테스트로 잠금)하고 앵커별 maskAlpha(swayK)를 1회 계산해 dx=swayK×displacement로 패치가 흔들리는 띠를 따라감 |
| EYE-97 | 〃 | 눈꺼풀 감김: 열린 패치=베이크 복사(무이음), 감은 패치=눈 타원(1.06/1.1r) 안에 주변 수피 색 샘플(위/아래 밴드 평균)의 세로 그라디언트 + 중앙 이음선 arc. 깜빡임 110ms 감김/65ms 유지/125ms 뜸, 다음 깜빡임 2300+rand×4900ms, 14% 확률 더블 블링크(430ms). 앵커별 mulberry-계열 시드 → **비동기화**(테스트 검증). `debugBlink(i,hold)`=QA 스크린샷 보조 전용 |
| MOUTH-97 | 〃 | 턱 호흡: 방사 페더(0.62r→가장자리 0) 패치를 위 고정 세로 스케일 `1−0.07p²`(p=사인 0..1), 주기 ~5.2‑10.5s |
| TUMOR-97 | 〃 | 종양 박동: 중심 스케일 `1+0.06p²`, 주기 ~3.1‑6.3s. p² 곡선으로 쉬었다 부풀어 오르는 유기적 리듬 |
| WIRE-97 | `game.html` | `<script src="ch1-face-life.js?v=20260930-97">` + `Ch1ForestSway.draw` 직후 `Ch1FaceLife.draw` 1줄. `build-nwjs.mjs` 파일 목록에 추가. game-easy-test.html은 production 청크 미사용으로 미배선 |

## 검증

| 확인 | 결과 |
|---|---|
| 테스트 | `test/ch1FaceLife.test.js` 6건 신규: 앵커 스키마/경계·placements×features 변환 재현(±1.1px, 파이썬 banker rounding 허용)·임베드=JSON 일치·**displacement 공식 sway와 동일 잠금**·game.html 배선(스크립트/그리기 순서/청크 키)·스텁 캔버스 런타임(컬링 시 build 0, 가시 앵커만 유휴 빌드, 눈 2개 이상 깜빡임 시작 시각 불일치=비동기). 기존 ch1 4건 포함 **10/10 PASS** |
| 실게임 | msedge 1600×900 `?test=1&slot=demo&demo=1`, 신고 위치 카메라(1766,6620), pet 대사 숨김+적/투사체 제거+스폰 정지 상태 26프레임×170ms ON 버스트 vs 모듈 해제 OFF 버스트. **anchor별 국소 평균 프레임차: ON 3.2~16.9 / peak 10~49.7, OFF(=같은 사각형의 정적 대조) 2~10, 주변광 대조영역 ~3-4/peak ~8**. 플레이어 광원 안 앵커(입·종양·근접 눈)는 ON peak 34~50으로 명확, 광원 밖 어둠의 눈은 엠버 글린트가 꺼졌다 켜지는 수준의 미묘한 변화. 강제 블링크 open/closed 1x 쌍·필름스트립 `captures/ch1_rotforest96/after97_*` |
| 성능 | face draw mean 0.013~0.019ms/frame, max 0.3ms(빌드 프레임 일시 2.3ms), sway mean 0.02~0.03ms. fps median 238/ p95 204~233 (모듈 유무 동일 수준). pageerror 0, 콘솔 청크 오류 0 |
| 회귀 | sway 계약 무변(파일 미수정), 청크·master 무변(git diff 0), 충돌·스폰·HUD 무변 |

## 광원 방향 기록 (2.5D 깊이 지침)

- 96차 림라이트는 **북쪽(위)** 에서 오는 지옥 하늘광, 플레이어/몬스터 셰이딩은 **좌상단** 광 — 서로 다른 두 방향이 공존한다(충돌 인지, 깊이 패스에서 통일 결정 예정).
- 97차는 **제3의 방향을 추가하지 않았다**: 눈꺼풀 색은 국소 수피 샘플, 입/종양은 베이크 픽셀 스케일이라 방향성 광원이 없다.

## MAP PRODUCTION REPORT (§23)

| 항목 | 판정 |
|---|---|
| STAGE / MASTER | 베이크 무변(96차 그대로). 53점 경계·8구역·64청크·보호 바닥 유지 |
| OUTER MASS | 163앵커 개별 애니메이션(비동기 블링크·호흡·박동). 배치·실루엣 무변 |
| LARGE / MEDIUM | mass 2종+36나무의 가시 피처만 선별(가림·퇴색·비가시 88개 제외) |
| GROUND / PLAYABLE | 변경 0. 런타임 오버레이는 배경 위·오브젝트 아래 1콜 |
| CAMERA QA | 신고 위치 실게임 ON/OFF 버스트+강제 블링크 1x 쌍+필름스트립. 광원 안 명확/광원 밖 미묘 |
| TECH QA | 10/10 테스트·pageerror 0·draw ≤0.02ms 평균·프레임 할당 0·LRU 40·시계 혼용 버그 수정 검증 |
| FILES | `ch1-face-life.js`(신규)·`face-anchors.json`(신규)·`features.json`/`placements.json`(-96, 96차와 공유)·`game.html` 2줄·`build-nwjs.mjs` 1줄·`test/ch1FaceLife.test.js`·docs. **provenance**: game.html 배선 2줄과 build-nwjs.mjs·features/placements·초기 모듈 버전은 동시 세션 커밋(`069f598ac` 등)에 번들 흡수됨 — 해당 변경 저자는 이 97차 작업이다. history rewrite 없이 기록만 남김 |
| GIT / RELEASE | 잔여 파일 경로 지정 스테이징 커밋+push. deploy·NW.js 신규 패키징 없음 |

**VISUAL VERDICT: 애니메이션 시스템 PASS(계약·성능·비동기·무이음) / 체감 가시성 = 플레이어 광원 내 PASS, 광원 밖 어둠에서는 미묘.** 전체 맵 판정은 맵 리드의 96차 재검(플레이 화면 기준 RETOUCH — 베이크 가독성 튜닝 종료 결정)과 2.5D 깊이 패스(y-sort interleave·canopy fade)로 넘어간다. 후속 권고: 깊이 패스에서 광원 통일 시 어둠 속 눈 글린트를 라이트 패스(다크니스 오버레이 위 가산)로 승격하면 원거리 블링크도 읽힌다.
