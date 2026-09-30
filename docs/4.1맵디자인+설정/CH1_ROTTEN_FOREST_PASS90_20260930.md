# CH1-1 살아 움직이는 썩은숲 90차 — 2026-09-30

> 이 문서의 `20260930-rotforest-90`/cache `91` 및 36개 배치는 90차 제작 이력이다. 현행은 [95차 경계·대형 군락·청크 흔들림 보정](CH1_ROTTEN_FOREST_BOUNDARY_PASS95_20260930.md)의 bake `20260930-rotforest-95`/cache `20260930-rotforest-96`, 36나무+6대형 군락+1뿌리다.

## 콘셉트와 범위

사용자 참조 `C:/Users/심도진/Pictures/Screenshots/스크린샷 2026-09-30 105738.png`는 넓은 피부 바닥을 검붉은 동맥과 썩은 생체나무가 포위하는 구도다. 기존 88차 원화는 눈·입·종양이 없고 89차 움직임만으로는 자연숲처럼 보인다는 사용자 피드백을 반영했다. 전투 바닥·북쪽 통로·중앙 랜드마크·53점 경계·8구역·기존 손 배치 나무 충돌 앵커는 유지했다.

## Sunburst 원화와 런타임 연결

| ID / MagicLight 작업 ID | 형태 | 1024² RGBA 런타임 경로 | 손 배치 ID |
|---|---|---|---|
| 01 / `7510882064516354048` | 한쪽 눈, 세로 이빨 입, 부은 목질과 혈관 | `assets/map/ch1/collision/rotforest_tree_01.png` | `m_ctree13`, `m_ctree20` |
| 02 / `7510883039574573056` | 넓은 턱 공동, 양쪽 눈, 종양 그루터기 | `assets/map/ch1/collision/rotforest_tree_02.png` | `m_ctree14`, `m_ctree19` |
| 03 / `7510883591851184128` | 기운 줄기, 세 눈, 부종 포드와 늘어진 막 | `assets/map/ch1/collision/rotforest_tree_03.png` | `m_ctree16`, `m_ctree17` |
| 04 / `7510884823395311616` | 붙은 두 줄기, 눈·세로 입·종양 아치 | `assets/map/ch1/collision/rotforest_tree_04.png` | `m_ctree15`, `m_ctree18` |

- 생성: `https://magiclight.ai/toolbox/`, `GPT Image 2.5 sunburst`, 1:1. 사용자 참조 스크린샷과 별도 분위기 판화 `7510881052627918848`을 참조로 사용했다. 사이트 UI의 1장 표시 가격은 200 points, 이번 판화+나무 4장 표시 합계는 1000 points다. UI 잔액 표시는 79,940이었으며 실제 차감액은 확인되지 않았다. 판화는 통째 합성 시 사각 경계·반복이 튀어 최종 배경에는 사용하지 않았다.
- 나무 프롬프트의 공통 계약: 3/4 탑다운 게임 에셋, 썩은 숯빛 수피, 붉은 근육·동맥, 자줏빛 침식, 눈·이빨·종양·부종, 피부 지면으로 이어지는 뿌리, 건강한 잎·일반 숲·문자·카툰 표정 배제. 01=눈/세로 입, 02=턱과 두 눈, 03=세 눈/늘어진 막, 04=융합 아치. 생성 원본 5장은 로컬 검수 폴더 `captures/ch1_rotforest90/*_raw.png`와 `rotforest_plate90.png`에 보존하며 패키지에는 넣지 않는다. 재생성 가능한 최종 cutout 4장과 배치 정보·retouch patch는 stage 에셋으로 보존한다.
- 원본 2048² RGB의 바둑판 배경을 `rembg`로 제거하여 1024² RGBA로 축소했다. 04의 내부 바둑판 밝은 무채색 픽셀을 추가 제거하고, 4장의 바깥 1px와 알파 8 미만 잔여를 0으로 정리했다. 원본에 실제 투명 알파가 없었으므로 자동 분할의 가장자리 잔여 가능성은 있다.
- `game.html`과 `game-easy-test.html`의 `m_ctree13~20` 파일만 교체했다. 타일 좌표 `(84,184),(80,150),(30,96),(80,36),(124,31),(176,96),(124,149),(124,179)`과 scale `.85,1.1,.95,1.15,.9,1.12,.88,1.08`, `sz:400` 및 `col:1/large:1/stageMax:0/authoredOnly:1`은 유지한다. 기존 `Ch1LivingDetail` 나무 변형 대상에 포함된다.

## 외곽 원화 베이크

| 항목 | 구현 값 |
|---|---|
| 현행 버전 | bakeVersion `20260930-rotforest-90`, `game.html` 청크 cache key `20260930-rotforest-91`, `retouch-layers.json`의 23번째 `outer90`, 8192² master + 64개 1026² 청크(core1024/bleed1) |
| 소스와 배치 | `outer90_sources/placements.json`의 비충돌 고정 36개: 큰 실루엣 6개, 연결 군락 30개. 4종을 크기·위치별로 섞고 중앙 전투공간에는 추가하지 않는다 |
| 재질 보정 | 기존 숲 RGB에서 `R'=.72R+.16G+.08B`, `G'=.39G+.13R+.13B`, `B'=.55B+.18R+.08G`를 만들고 바깥 숲에서 최대 `.83`로 혼합. 녹색과 밝은 수피를 숯빛·멍든 자주색으로 낮춘다 |
| 보호 경계 | `layout.js`의 53점 polygon을 기준으로 색 보정은 경계선 폭 180 bake px 바깥에만 적용한다. Gaussian 70px·`max(0,(soft−127)/128)`로 경계에서 0으로 감쇠한다. 생체나무는 별도의 40px 보호선/65px 감쇠로 기존 바탕 위에 뿌리와 가지가 더 깊게 겹치게 한다. 실제 보행 polygon 내부는 그대로 두고 충돌에는 쓰지 않는다 |
| 합성 | 원화 밝기 `.90`, 기본 한 변 `410×scale` bake px, x=tile 중심, y=tile 중심−`.74×side`; 미리 합친 RGBA를 1024² 단위로 기존 master RGB와 합성해 바깥 숲과 숲 경계의 나무 픽셀만 preblended RGBA patch에 기록 |
| 움직임 | 89차 `Ch1ForestSway`의 보행 뒤 약 1.05~9 tile 숲, 8띠, 최대 ±5월드픽셀. 정적 원화 전체가 고개를 흔드는 별도 프레임 애니메이션은 아니며 눈꺼풀·입·종양 개별 애니메이션도 아직 없다 |
| 보존 | `layout.js`, RLE geometry, 플레이어 시작 6시→출구 12시, 중앙 및 측면 전투공간, 기존 충돌과 stage별 나무 위치 불변 |

처음 시험한 생성 판화 전체를 좌우에 붙인 후보는 사각 테두리와 좌우 복제감 때문에 폐기했다. 두 번째 후보에서 작은 나무만 30개 배치했을 때 전체 화면에서 눈·입이 읽히지 않아 큰 실루엣 6개를 추가했다. 실제 서측 카메라에서는 큰 나무가 경계에서 직선으로 잘린 결함을 발견하여 알파를 외곽 쪽으로 흐리게 다시 베이크했다. 재베이크 뒤에도 브라우저에 같은 cache key `90`의 구 청크가 남아 직선이 보였으며, 흔들림을 런타임에서 임시로 꺼도 남았다. 청크 cache key를 `91`로 올리고 브라우저를 새로 읽힌 뒤 경계가 사라진 것을 확인했다.

## 검증

| 검증 | 결과 |
|---|---|
| 원화 | 4/4 투명 모서리와 불투명 수피 검사 통과; 손 배치 8개 위치·대상 파일 검사 통과 |
| 베이크 | 기존 생산 빌더로 master와 64청크 재생성. 이전 master 대비 변경 31,874,717px, 보호 전투 바닥 변경 0px, 청크 core 불일치 0개, geometry hash 동일, retouch 23레이어, 고정 배치 36개 (`tmp/ch1_rotforest90_verify.py`) |
| 테스트 | `C:/nvm4w/nodejs/node.exe --test test/ch1ForestSway.test.js test/ch1SunburstTrees.test.js`: 4/4 통과. 투명 알파, 8개 손 배치, 숲 전용 움직임/바닥 마스크 확인 |
| 브라우저 | `server.cjs`의 실제 본편 `game.html?test=1&slot=demo&demo=1`에서 서측·동측 생체나무, 전투 바닥, forest sway 로드 확인. cache key `91` 새 로딩 후 서측 직선 절단 해소. START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 8개 카메라를 육안 검수; 이 중 ARENA 공격 프레임은 적이 있는 실제 전투 화면, 이후 카메라 검수는 탭 안에서만 적 소환을 잠시 정지. 생산 코드·세이브에 검수용 수정 없음 |
| 로딩·비용 | Chrome 검수 중 production chunk 오류 0, 콘솔 오류·경고 0, forest sway 대기 0; 최종 표본 8,094프레임에서 평균 draw 0.017ms, 최대 0.20ms, 변위 최대 ±5 world px. 404는 청크 오류 0과 별도로 모든 요청의 전수 확인은 하지 못함 |
| 패키징 | `build-nwjs.mjs`에 `ch1-forest-sway.js` 포함. 신규 NW.js 빌드·실행은 수행하지 않았다 |

## MAP PRODUCTION REPORT

| §23 항목 | 결과 |
|---|---|
| STAGE / MASTER | CH1-1 `production_finish` 8192² / world8000²; 53점 silhouette, 8 regions, 6시 시작→12시 출구, 측면 전투공간 유지 |
| OUTER MASS | LEFT·RIGHT·TOP·SOUTH 외곽에 4종 비충돌 군락 36개. 바깥 숲 녹색을 자주빛 괴사 목질로 보정. major hole 추가 없음 |
| LARGE | 4개 Sunburst cutout과 기존 깊이 원화의 합성. 큰 실루엣 6개로 눈·입이 카메라에서 읽히게 함. 동일 형태 반복은 서로 다른 scale·방향·거리로 줄였으나 원화 4종 한계가 남음 |
| MEDIUM | 작은 30개가 큰 덩어리 사이를 잇는다. 기존 캠프/제단/늪·뿌리 연결 위치 불변. 건강한 질감 일부는 기존 깊이 원화에 잔존 |
| GROUND | 87차 피부 바닥·동맥 보존. 색 보정은 180/70px 바깥 전이, 뿌리 원화는 40/65px 별도 전이로 직선 절단을 완화한다. 보행 polygon 내부 오염 추가 없음 |
| PLAYABLE | 메인 arena·이동 통로·측면 공간·숨 돌림 공간과 위협 실루엣 분리. 신규 충돌0, 보스·몬스터 배치 변경0 |
| LANDMARK | 중앙 시체나무 primary, 캠프/제단 secondary, 북쪽 문턱 tertiary 유지. 외곽 큰 눈·입은 배경 위협 실루엣 |
| CAMERA QA | START(4020,7420)·EARLY(4020,6100)·ARENA(4020,4450)·SIDE L(1380,3860)·SIDE R(6600,3860)·LANDMARK(4020,4000)·LATE(4020,1950)·EXIT(4020,850) 확인. 서측 접합선 해소, 중앙 전투 가독성과 북쪽 통로 유지. 북쪽 일부 원화는 여전히 평범한 수피로 읽힘 |
| TECH QA | route/geometry/충돌 불변, 보호 바닥 0px 변경, 청크 core mismatch 0, 청크 로딩 오류 0, Chrome 콘솔 오류·경고 0. cache key 91로 seam 해결. 404 전수 및 신규 패키지 실행은 미검증. 숲 흔들림 평균 0.017ms/최대 0.20ms |
| FILES | stage-owned: `game.html`, `game-easy-test.html`, `assets/map/ch1/collision/rotforest_tree_01~04.png`, 생산 master/64청크/retouch/배치·원본, `test/ch1SunburstTrees.test.js`, 89차 sway 파일, 관련 docs. 다른 동시 작업 파일은 stage 제외 |
| GIT | 관련 코드·에셋·docs만 선택 stage/로컬 커밋 대상. push·deploy·새 패키징 없음 |

**VISUAL VERDICT: RETOUCH.** 카메라 근처의 눈·입·종양·부종과 어두운 생체 숲 외곽은 구현했다. 기존 깊이 원화에 남은 일반 나무 질감, 네 원화의 반복, 눈꺼풀·입·종양의 개별 움직임은 후속 시각 작업이다.

**NEXT PASS:** 후속 작업에서는 남은 일반 수피 원화를 대체하고 얼굴/종양의 국소 애니메이션을 실제 전투 프레임에서 검수한다. 1-1 전투공간·피부 바닥·북쪽 통로는 보존한다.
