# CH1-1 부패 생체나무 교체 88차 — 2026-09-30

## 제작 계약과 결과

사용자 최신 지시의 MagicLight Toolbox `GPT Image 2.5 sunburst`로 CH1-1 나무 원화를 다시 생성했다. 현행 콘셉트는 넓은 전투공간, 피부 같은 바닥, 꿈틀거리는 동맥, 부패한 생체나무의 음침한 살아 있는 지옥이다. 87차의 공통 피부 바닥, 53점 경계, 8구역, 8000×8000 월드, 64 배경 청크, 기존 나무 8개의 좌표·scale·충돌 크기를 보존하고 1-1의 손 배치 나무 원화만 교체했다. 중앙 전투 공터와 북쪽 출구 경로를 비워 둔다. 현행 배경 `cache/bakeVersion=20260929-floor-87`, living module `20260929-87`, retouch 22레이어는 그대로다.

## 생성·후처리·런타임

| 항목 | 현재 값 |
|---|---|
| 생성 위치/모델 | `https://magiclight.ai/toolbox/` / `GPT Image 2.5 sunburst` |
| 생성 배치 | 서로 다른 실루엣 4장; UI 표시 비용 1장당 200 points, 표시 합계 800 points. 실제 계정 차감액은 별도 검증하지 않음 |
| 제작 의도 | 속이 빈 육질 고목, 낮고 넓은 그루터기, 기울어진 고목, 부러진 아치형 고목. 건강한 잎·맑은 숲빛을 피하고 어두운 적갈색 살, 부패한 수피, 뼈 같은 뿌리로 87차 피부 바닥과 연결 |
| 후처리 | 원본 1~3은 RGB에 바둑판 배경이 베이크되어 있어 로컬 `rembg`로 배경을 제거. 4는 원본 RGBA 알파를 사용. 4종 모두 투명 픽셀 RGB 정리 후 1024×1024 RGBA PNG로 축소 |
| 최종 경로 | `assets/map/ch1/collision/sunburst_tree_01.png`~`sunburst_tree_04.png` |
| 렌더링 | `_CH_DECO[0]`에 `m_ctree13~20`, `sz:400`, `large:1`, `col:1`, `dir:'collision'`, `sharedAtlas:1`, `stageMax:0`, `authoredOnly:1`; 하드 알파 정리 없이 PNG의 부드러운 알파 유지 |
| 실패 처리 | 기존 오브젝트 이미지 로더의 이미지 부재 폴백 계약을 사용한다. 이미지 실패만을 위한 새 폴백 분기는 추가하지 않음 |
| 미사용 후보 | 이전에 생성한 Higgsfield 후보 1장은 원화로 채택하거나 게임에 연결하지 않음. 해당 작업의 별도 비용 2.75 credits |

MagicLight 생성 설정은 네 장 모두 1:1, 출력 1장, `GPT Image 2.5 sunburst`다. 아래는 각 작업의 실제 입력 프롬프트다.

| 최종 PNG / 작업 ID | 실제 입력 프롬프트 |
|---|---|
| `sunburst_tree_01.png` / `7510859471021228032` | AAA dark fantasy game asset. One hollow rotten tree for an isometric top-down hell forest. Gnarled black-brown cracked bark, deep hollow trunk, broken branches, sinewy roots merging into corpse-skin ground. Natural irregular silhouette, believable weight, subtle red veins, cold violet shadows. Intricate hand-painted material, crisp readable shape at game scale. Entire tree isolated on true transparent alpha background. No scenery, text, eyes, skulls, gold, green foliage, or cartoon style. |
| `sunburst_tree_02.png` / `7510860845385596928` | AAA dark fantasy game asset. One broad low rotten stump for an isometric top-down hell forest. Split hollow core, collapsed jagged crown, heavy asymmetrical roots crawling sideways into corpse-skin ground. Charcoal bark with burgundy sinew in cracks, cold violet occlusion, blood vessels. Rich photoreal hand-painted texture, strong readable silhouette at game scale. Entire object isolated on true transparent alpha background. No scenery, text, eyes, skulls, gold, green leaves, or cartoon style. |
| `sunburst_tree_03.png` / `7510861556630523904` | AAA dark fantasy game asset. One tall dead tree leaning sharply left for an isometric top-down hell forest. Twisted split charcoal trunk, long broken branches pointing upward, roots gripping corpse-skin ground. Hollow rotten wood, burgundy sinew in cracks, cold violet shadows, subtle red vessels. Deep material detail, asymmetrical silhouette readable at game scale. Single isolated object on transparent alpha background. No scenery, text, eyes, skulls, gold, green foliage, or cartoon style. |
| `sunburst_tree_04.png` / `7510862245217771520` | AAA dark fantasy game asset. Fused dead trunks forming a broken arch for an isometric hell forest. Unequal heights, one trunk slants right, torn limbs and hooked roots claw into corpse-skin ground. Hollow charcoal wood, deep cracks exposing burgundy sinew, cold violet shadows and red vessels. Detailed realistic hand-painted material, irregular open silhouette readable at game scale. Isolated object on transparent alpha background. No scenery, text, eyes, skulls, gold, green foliage, or cartoon style. |

## 1-1 나무 배치 SSOT

타일 좌표는 `T=40` 월드 픽셀이다. 기존 `m_ctree1/2/3/4/9/10/11/12`의 손 배치 앵커·scale·`sz/col/colSz`를 같은 행에 대응시켰다. `colSz`가 없는 마지막 두 나무도 기존과 동일하다. 기존 `m_ctree1~12` 등록과 PNG는 다른 CH1 stage를 위해 남겨 둔다.

| 새 id | 이전 id | 한글명 | PNG | 타일 x,y | 월드 중심 x,y | scale | sz / col / colSz |
|---|---|---|---:|---|---|---:|---|
| `m_ctree13` | `m_ctree1` | 남서 빈몸통 | `sunburst_tree_01.png` | 84,184 | 3380,7380 | .85 | 400 / 1 / 60 |
| `m_ctree14` | `m_ctree2` | 남서 그루터기 | `sunburst_tree_02.png` | 80,150 | 3220,6020 | 1.1 | 400 / 1 / 60 |
| `m_ctree15` | `m_ctree3` | 서측 부러진 아치 | `sunburst_tree_04.png` | 30,96 | 1220,3860 | .95 | 400 / 1 / 60 |
| `m_ctree16` | `m_ctree4` | 북서 기운 고목 | `sunburst_tree_03.png` | 80,36 | 3220,1460 | 1.15 | 400 / 1 / 60 |
| `m_ctree17` | `m_ctree9` | 북동 기운 고목 | `sunburst_tree_03.png` | 124,31 | 4980,1260 | .9 | 400 / 1 / 60 |
| `m_ctree18` | `m_ctree10` | 동측 부러진 아치 | `sunburst_tree_04.png` | 176,96 | 7060,3860 | 1.12 | 400 / 1 / 60 |
| `m_ctree19` | `m_ctree11` | 남동 그루터기 | `sunburst_tree_02.png` | 124,149 | 4980,5980 | .88 | 400 / 1 / 기존 기본값 |
| `m_ctree20` | `m_ctree12` | 남동 빈몸통 | `sunburst_tree_01.png` | 124,179 | 4980,7180 | 1.08 | 400 / 1 / 기존 기본값 |

`stageMax:0`은 오브젝트 정의 필터에서 `undefined` 여부로 비교한다. 이 조건이 있어야 0번 stage 전용 값이 falsy 취급되지 않는다. `authoredOnly:1`은 임의 scatter에서 이 나무를 제외한다. `game.html`과 `game-easy-test.html`의 8개 나무 목록은 일치한다. 테스트 페이지의 인접한 `m_fbones`와 `m_c1sroot` 좌표도 본편 1-1 손 배치에 맞췄다.

## 검수 근거와 제약

- 정적 검사: 최종 PNG 4장 모두 1024×1024 RGBA이며 투명 모서리와 불투명 본체가 존재한다. `test/ch1SunburstTrees.test.js`는 두 HTML의 ID, 원화 경로, 8개 앵커, stage 범위를 검사한다. 기존 `test/ch1HandDecor.test.js`는 87차 현행 손 배치 36개와 안전한 중앙 통로 범위를 반영한다. 두 파일의 Node 테스트 10/10 통과. `test/ch1LivingDetail.test.js`까지 함께 실행하면 총 51/51 통과. 별도 알파 회귀 `test/mapObjectAlphaSanitization.test.js`와 새 나무 검사는 6/6 통과했다.
- 실제 게임: `http://localhost:3333/game.html?test=1&slot=demo&demo=1` 새 QA 탭에서 8개 오브젝트와 4장 PNG의 `naturalWidth=1024` 로드를 확인했다. START, 남측 전환부, 북측 접근부, 서측 캠프, 동측 제단, 중앙 랜드마크 화면을 살폈다. 나무 주위에 사각 바둑판 배경은 보이지 않고 중앙 전투 공간은 유지된다. 브라우저 오류 로그는 0건이었다.
- 충돌 계약: 실제 런타임 `_OBJ_META`의 8개 신·구 쌍에서 `sz`, `col`, `colSz`가 모두 같음을 확인했다. 좌표와 scale을 그대로 사용하므로 나무 교체가 새로운 이동 금지 영역을 설계상 추가하지 않는다. 전 구간 수동 이동·장시간 전투·부하 성능은 이번에 측정하지 않았다.
- 시각 제약: 기존 외곽의 일부 녹갈색 식생과 배경 대형 실루엣은 새 나무 원화와 재질 온도가 완전히 같지 않다. 반복되는 4종 실루엣의 세부 변주와 실제 전투 프레임 조도도 후속 검수가 필요하다.

## MAP PRODUCTION REPORT (§23)

| 항목 | 88차 판정 |
|---|---|
| STAGE | CH1-1(내부 stage 0) 원화와 손 배치 갱신. 마스터 실루엣·8구역·주 경로·측면 공간 유지 |
| MASTER | 넓은 전투공간과 6시 시작→12시 출구 축 유지. 재설계 없음 |
| OUTER MASS | 좌/우/상/남부의 기존 큰 질량과 주요 빈 공간 유지. 새 나무는 외곽·어깨 8곳에만 적용 |
| LARGE | Sunburst 4원화/8오브젝트. 기존 생체나무·배경 덩어리와 겹치는 가장자리는 화면 확인, 전체 접합은 후속 정비 |
| MEDIUM | 연결부 geometry 변경 없음. 남측 전환부와 북측 접근부 화면 확인 |
| GROUND | 87차 피부 지면과 동맥, 그림자 및 정적 합성 유지. 나무 PNG는 RGBA 합성 |
| PLAYABLE | 중앙 공터·남북 통로 유지. 나무 8쌍의 좌표·scale·충돌 메타 동일. 실플레이 전 구간 이동 검증은 남음 |
| LANDMARK | 중앙 시체나무·캠프·제단·출구 재배치 없음. 새 고목은 보조 외곽 실루엣 |
| CAMERA QA | START·EARLY/남측 전환·ARENA/중앙·SIDE L/캠프·SIDE R/제단·LANDMARK/중앙 시체나무·LATE/북측 접근·EXIT/북쪽 통로를 브라우저에서 확인. 북쪽 경로 시야 유지. 사각 배경 없음 |
| TECH QA | 새 PNG 4/4 로드, 8/8 배치, 메타 8쌍 일치, 브라우저 error 0, Node 맵·living 51/51 및 알파 회귀 6/6. 전체 64청크 재검증·장시간 성능·실입력 전투는 이 pass에서 생략 |
| FILES | stage 소유: `assets/map/ch1/collision/sunburst_tree_01~04.png`, `game.html`, `game-easy-test.html`, 2개 테스트, 이 문서와 맵 SSOT/에셋 목록/변경 기록. 동시 작업의 `docs/12퍼포먼스·최적화/COMBAT_TEXTURE_WARMUP_20260929.md`는 별도 유지 |
| GIT | 이번 작업 파일만 별도 stage/commit 대상. push·배포·패키징은 요청되지 않음 |

**VISUAL VERDICT: RETOUCH.** 교체한 1-1 나무는 기존의 독립된 해골나무보다 피부 지면과 콘셉트에 맞고 사각 배경 결함은 제거되었다. 맵 전체는 기존 외곽 식생의 녹색 잔여와 접합·반복 실루엣 때문에 시각 완료로 선언하지 않는다.

**NEXT PASS:** 기존 큰 외곽 덩어리와 새 나무의 색온도·접지·반복도를 실제 전투 화면에서 정비한다. 87차 공통 바닥을 보존하고, 생체 움직임의 미구현 범위는 구현 완료로 보고하지 않는다.
