# CH1-1 외곽 생체나무 군락 가독성 — 96차 (2026-09-30)

> **98차(2026-10-08)로 변경:** 나무 36그루는 더 이상 굽지 않는다(헤일로만). 림라이트·글린트·밝기 변주·tree_fade는 `ch1-rot-trees.js`가 런타임에 같은 수식으로 재현. placements 행은 `[tx,ty,variant(1..12),scale,flip]`. 현행: [CH1_ROTTEN_FOREST_RUNTIME_TREES_PASS98_20261008.md](CH1_ROTTEN_FOREST_RUNTIME_TREES_PASS98_20261008.md).

## 목적과 범위

95차 RETOUCH 잔여 항목 "외곽 군락이 어두운 장면에서 서로 뭉쳐 읽힌다"를 해소한다. 전투 바닥을 밝히지 않고, 어두운 지옥 팔레트 안에서 실루엣 개별 분리만 만든다. 53점 경계·8구역·RLE geometry·충돌·64청크(1026², core1024/bleed1)·89차 흔들림 계약·95차 `floor_transition93` 시각 전이는 전부 유지한다. 신규 원화 생성 없음(기존 Sunburst 원화의 절차적 가공만, 크레딧 0).

## 제작 값

| ID | 파일·적용 위치 | 값·역할 |
|---|---|---|
| FEAT-96 | `outer90_sources/features.json` | 원화 좌표계 얼굴 앵커 SSOT(version `20260930-rotforest-96`). tree_01~04(1024²)·mass_01~02(2048×1152)의 eye/mouth/tumor 앵커 43개(eye 17, mouth 8, tumor 18), 항목=kind·cx·cy·rx·ry. 1x 오버레이 시트(`tmp/feat_check_*.jpg`)로 전 앵커 육안 대조 |
| BAKE-96 | `tmp/ch1_rotforest96_bake_patch.py` → `outer90_sources/outer90_patch.png` | base93 master에서 90차와 동일한 색 보정(그레이딩 행렬·fade·strength .83)·배치·좌표로 patch 재베이크. 추가: ① 대기 안개 헤일로 — 각 군락 뒤 dilate13/blur34/알파 .42(고정 나무는 8/20/.34)의 FOG(52,24,29) 실루엣으로 덩어리 사이 음영 간격 생성 ② 엠버 림라이트 — 알파 상단 에지(dy 6/4, blur2.2)에 RIM(178,58,30)을 mass .40/tree .55로 가산, 지옥 하늘 붉은 광 방향 ③ 대기 원근 헤이즈 — mass만 세로 그라디언트로 FOG 혼합, 북쪽열(ty82) .36→.20/중간열(ty124·125) .28→.14/남쪽열(ty172) .20→.08 ④ 눈 글린트 — features.json eye 앵커에 GLINT(196,74,38) 가우시안(σ≈1.15r, 강도 .42) ⑤ 값 분리 — 36나무 밝기 .84~.94 결정적 변주(기존 일률 .9) |
| PLACE-96 | `outer90_sources/placements.json` | version `20260930-rotforest-96`, `features` 참조 추가. 배치 좌표·36나무+6군락+1뿌리 개수 불변 |
| BUILD-96 | `tools/build_ch1_production_finish.mjs`(무수정) | 기존 빌더로 master+64청크 재생성. retouch 23레이어, bakeVersion `20260930-rotforest-96` |
| CACHE-97 | `game.html` | 생산 청크 cache key `20260930-rotforest-96`→`20260930-rotforest-97` 1문자열만 변경 |

## 확인 결과

| 확인 | 결과 |
|---|---|
| 베이크 무결성 | 95차 master 대비 변경 15,691,026px, 보호 전투 바닥(경계 300 bake px 초과 내부) 변경 **0px**, 경계측 바닥 변경 690,608px(헤일로·글린트의 경계 전이 구간). 청크 core 불일치 0, geometry hash 동일, 23레이어, 36+6+1 (`tmp/ch1_rotforest96_verify.py` PASS) |
| 1x 점 검사 | master 1x 크롭(`tmp/preview96_rim_edge_1x.png` 등 4종)에서 림·헤일로·글린트의 점/디더링/스펙클 없음. 림은 재질광, 헤이즈는 연속 안개로 읽힘 |
| 테스트 | `test/ch1ForestSway.test.js`+`test/ch1SunburstTrees.test.js` 4/4 PASS |
| 실제 게임 | msedge 1600×900 `game.html?test=1&slot=demo&demo=1`, cache97 로드, pageerror 0. 신고 위치(1766,6620)·중앙(4020,4450)·좌(1380,3860)·우(6600,3860) before/after (`captures/ch1_rotforest96/before_*.png`/`after96_*.png`)와 1x 크롭(`compare96_*_1x.png`). 신고 위치 서측 벽: 단일 검정 덩어리 → 눈·아가리 개별 얼굴이 희미한 엠버로 분리. 숲 흔들림 mean 0.018ms/max 0.30ms(95차 0.016/0.5와 동일 수준) |

## MAP PRODUCTION REPORT (§23)

| 항목 | 판정 |
|---|---|
| STAGE / MASTER | CH1-1 8192²/world8000². 53점 경계·8구역·6시 시작→12시 출구 보존 |
| OUTER MASS | 6군락+36나무 배치 불변. 군락별 헤이즈 깊이 3단·헤일로 간격·림라이트로 실루엣 개별 분리 |
| LARGE | mass 2종에 대기 원근(북쪽 더 멀리)·엠버 림·눈 글린트. 뭉침 해소 |
| MEDIUM | 36나무 밝기 .84~.94 변주 + 개별 헤일로. 원화 4종 반복감 완화 |
| GROUND | 전투 바닥 변경 0px. 색 보정·시각 전이 95차와 동일 수식 |
| PLAYABLE | 충돌·스폰·통로 변경 0. 새 collider 0 |
| LANDMARK | 중앙 랜드마크·캠프·제단 불변. 외곽 눈 글린트는 위협 실루엣 강화 |
| CAMERA QA | 4개 QA 카메라 before/after+1x 크롭. 어두운 장면에서 눈·입이 희미한 엠버로 읽히고 실루엣 층 분리. 전투 바닥 밝기 불변 |
| TECH QA | core mismatch 0·geometry hash 동일·보호 바닥 0·4/4 테스트·pageerror 0·sway max 0.30ms |
| FILES | features.json(신규)·placements.json·outer90_patch.png·master/64청크/composition/preview·retouch-layers.json·game.html cache key·bake/verify 스크립트(tmp)·docs. 타 세션 파일 불포함 |
| GIT / RELEASE | 경로 지정 스테이징·로컬 커밋+push. deploy·NW.js 패키징 없음. **provenance**: 96차 재베이크 에셋(master·청크·outer90_patch·placements/features/retouch/composition)은 동시 세션 커밋 `29b5a0623`(art(intro): redo cut 06)에 번들 흡수됨 — 해당 커밋의 production_finish 변경분의 저자는 이 96차 작업이다. history rewrite 없이 사실만 기록(CLAUDE.md §동시 세션 규칙 5). game.html cache key와 docs는 본 커밋에 포함 |

**VISUAL VERDICT: RETOUCH (맵 리드 재검 확정, 2026-10-01).** 제작자 1차 판정은 PASS였으나, 맵 리드가 1600×900 플레이 화면 before/after 평균 절대차로 재검한 결과 left 4.02/right 2.96/reported 3.72 vs 변경 없는 center 3.97 — **플레이 화면에서는 노이즈 수준으로 비지각**. master/1x 크롭에서는 분리가 읽히지만 인게임 다크니스가 이를 소거한다. 결정: **베이크 기반 가독성 튜닝은 여기서 종료**, 근본 원인은 draw order(2.5D 깊이 패스, `DEPTH_2_5D_BENCHMARK_20260930.md`)에서 해결한다. 광원 방향 기록: 96차 림라이트=북쪽, 플레이어 셰이딩=좌상단(충돌 인지, 깊이 패스에서 통일 예정). 97차 애니메이션은 별도 문서.
