# 툴 숙달 실습 — 스캔 고목을 게임 자산으로 끝까지 한 번 (2026-11-05, Mac)

입력: Poly Haven `dead_tree_trunk_02`(CC0, https://polyhaven.com/a/dead_tree_trunk_02). 지금 쓰는 전경 로그의 원본이라 같은 나무로 비교할 수 있다. 도구: Blender 4.5.15 LTS(headless), Unity 6000.6.7f1 Mac. 재현: [`tools/teardown/tm_pipeline.py`](../../../tools/teardown/tm_pipeline.py), 설정 전체: [`tm-settings-20261105.json`](tm-settings-20261105.json).

## 판정 (CTO, 11-05)

파이프라인 완주 PASS, **리토폴로지 단계 미달(쿼드 아님)**. 규칙대로 방법을 바꿔 Instant Meshes로 다시 시도한다. 설치는 사용자 승인 대기 중이다.

## 결과

| 항목 | 지금 쓰는 전경 로그 | 실습판 `A2_TM_Log` | 비고 |
|---|---|---|---|
| 삼각형 | 45,719 | **7,992** / 3,996 / 1,998 (LOD 3단) | ×0.175 |
| Unity 정점(LOD0) | 27,151 | **4,158** | 게임 로그 값 |
| 텍스처 | BC·N·ARM 각 2048² | BC·N 2048×1024, ARM 1024×512 | 추정 상한 16.7MB → 6.3MB (1B/px, 밉 포함) |
| 형태 오차(원본→LOD0) | 측정 안 함 | RMS 3.08mm, 최대 20.32mm | 표면 샘플 2만 점 |

**34° 게임 화면 판정:** [전](img/tm-import-before.png) · [후](img/tm-import-after.png). 3배 크롭에서도 실루엣과 분위기가 거의 같다. 로그 영역 평균 픽셀 차이 3.03/255, 나머지 화면 0.07/255. 눈에 띄는 차이는 얇은 가장자리와 바닥 쪽 수염이끼의 위치 정도이다. 다만 **이 비교는 좁은 범위이다:** 어두운 그늘 톤에서 한 지점, 한 각도만 봤다.

## 단계별 기록

| 단계 | 시도·설정 | 결과 | 전·후 |
|---|---|---|---|
| 리토폴로지 | **Quadriflow 2회 실패:** 복셀 재구성 후 비다양체 간선·정점 0, 방향 불일치 0인데도 "manifold가 아니다"로 거부. 법선 재계산 후에도 같음. 원인 미상. **대안:** 복셀 1.2cm → Decimate(Collapse) → 원본에 Shrinkwrap | 7,998△ | [전](img/tm-retopo-before.png) · [후](img/tm-retopo-after.png), 형태 [전](img/tm-retopo-shape-before.png) · [후](img/tm-retopo-shape-after.png) |
| UV | **1회 실패:** 얇은 삼각형이 큰 UV 면적을 차지해 패킹이 줄고 끝부분이 번짐. **수정:** 얇은 면 제거, 바닥 심은 경로 탐색, 양끝 5% 고리 심, Minimum Stretch, 섬별 밀도 고정, 직접 패킹. 심은 스크립트로 지정했고 사람이 그린 것은 아니다 | 섬 4개, 사용률 56%. **밀도 중앙값 454px/m(p5 244, p95 586), 목표 512 미달** | [전](img/tm-uv-before.png) · [후](img/tm-uv-after.png) |
| 베이크 | Cycles CPU, 고폴리→저폴리, 케이지 3cm, 광선 10cm, 여백 16px. Normal·BaseColor 2048×1024(8샘플), AO(256샘플)·Rough 1024×512. ARM = R:AO G:Rough B:0 | 고폴리와 거의 구분 안 됨 | 노멀 [전](img/tm-bake-before.png) · [후](img/tm-bake-after.png), 색 [원본](img/tm-bake-color-before.png) · [실습판](img/tm-bake-color-after.png) |
| LOD | Decimate Collapse ×0.5 사슬, UV·텍스처 공유. 원본 대비 RMS 1.48mm(LOD1), 2.50mm(LOD2) | 7,992 / 3,996 / 1,998 | [LOD0](img/tm-lod-before.png) · [LOD1](img/tm-lod-mid.png) · [LOD2](img/tm-lod-after.png) |
| 반입 | `Art/map/a2/tm/`. 메타는 기존 로그에서 복사해 GUID만 교체, `A2GroundCoverImporter`에 경로 추가(GetVersion 7). 실행 인자 `--a2-tm-log`일 때만 교체, **기본 동작 불변** | LODGroup 3단 자동 생성, CS 오류 0, 예외 0 | [전체 전](img/tm-import-full-before.png) · [전체 후](img/tm-import-full-after.png) |

## 게임이 그린 LOD

| 항목 | 값 | 출처 |
|---|---|---|
| 실제 렌더러 상태 | **LOD0 True**, LOD1 False, LOD2 False | `Renderer.isVisible`, 시작 지점 1프레임 |
| LOD Group 전환값 | .25 / .125 / .01 (Unity 자동값, 제안한 .5/.2/.01 아님) | `GetLODs()` |
| LOD Group 크기 | 4.051 → 월드 6.89u (배율 1.7) | `LODGroup.size` |
| 카메라 거리 | 13.38u, FOV 46.95° | 런타임 |
| 상대 높이 | .593 | 6.89 ÷ (2 × 13.38 × tan 23.47°) |
| 품질 설정 | Ultra, lodBias 2 | `QualitySettings` |
| 전환 거리(계산) | LOD1 약 63u, LOD2 약 127u | 위 값으로 계산, 실측 아님 |

따라서 위 34° 비교는 **지금 로그 대 실습판 LOD0** 비교이다. LOD1·LOD2는 게임 화면에서 판정하지 않았다. 측정 코드는 임시였고 커밋하지 않았다.

## 거목 검은 점 — 종결

**뒤집힌 면 후보, 게임 재현 0. 추가 조치 없이 종결한다.**

- 게임 화면(1920×1080, 34°), 플레이어 위치 (20, -63.4), `A2 外곽 -1/2/3`(RF3_Ancient_Tree_A) 몸통 3배 크롭에서 보이지 않았다: [크롭](img/tm-blackdot-game-3x.png), [Blender 렌더](img/tm-blackdot-render.png). 범위는 한 그루, 한 각도이다.
- 잔점·디더링이 아니다. Blender 광선 검사에서 검은 점 3곳은 모두 면법선이 카메라 반대쪽이었고(내적 -0.60~-0.93, 정상 지점 +0.94), 2곳은 같은 크기의 면보다 UV 면적이 큰 소수 면이었다.
- 원인은 후보 단계로 남긴다. 다른 그루·각도에서 구멍으로 보이면 그때 다시 연다.

## 이번에 새로 나온 사실

- **1-1 씬에 거목이 542그루 배치되어 있다:** Ancient_Tree_A 256 + B 286 (`필드-렌더러.txt`), 그루당 19,888△로 합계 약 **1,078만△, LOD 없음.** 합계는 배치 기준이고 화면에 그려지는 수는 아니다. 시작 지점 한 프레임에서 `isVisible`인 거목은 55그루(약 109만△)였고, 이 값은 그림자 카메라를 포함한다. 이전 프로파일의 약 1,500만△와 어떤 관계인지는 재지 않았다.
- 실제 1-1에서 가까운 큰 나무 대부분은 Hollow이고, 거목은 외곽·원경에 주로 쓰인다.

## 한계

- **Quadriflow·Instant Meshes를 쓰지 못했으므로 쿼드 리토폴로지가 아니다.** 지시의 "리토폴로지" 대신 복셀+Decimate이고, 얇은 나뭇결 흐름을 따르는 토폴로지는 아니다. Instant Meshes는 설치 승인이 필요해 시도하지 않았다.
- 텍셀 밀도 512px/m 미달(중앙값 454). 배치 배율(1.7×) 적용 시 더 낮다. 다만 플레이 화면 기준(75px/u)은 크게 넘는다.
- FPS는 재지 않았다. 지면 접합 코드가 실행 중 법선을 다시 계산하므로 UV 심에 경계가 생길 수 있는데, 이번 각도에서는 바닥 심이 안 보인다.
- 원본의 색을 그대로 구웠고 조형·재채색을 하지 않았다. **"우리 것으로 만드는" 단계는 아직 안 했다.**
- 단계 소요 시간은 이 환경의 시계를 신뢰할 수 없어 적지 않았다.
- `tm-uv-after.png`는 폭 1024로 축소했다. 나머지 이미지는 1x이고, `*-3x.png`는 최근접 3배 확대이다.
