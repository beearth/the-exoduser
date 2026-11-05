# 툴 숙달 실습 — 스캔 고목을 게임 자산으로 끝까지 한 번 (2026-11-05, Mac)

입력: Poly Haven `dead_tree_trunk_02`(CC0, https://polyhaven.com/a/dead_tree_trunk_02). 지금 쓰는 전경 로그의 원본이라 같은 나무로 비교할 수 있다. 도구: Blender 4.5.15 LTS(headless), Unity 6000.6.7f1 Mac. 재현: [`tools/teardown/tm_pipeline.py`](../../../tools/teardown/tm_pipeline.py), 설정 전체: [`tm-settings-20261105.json`](tm-settings-20261105.json).

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

## 거목 검은 점 — 게임 재현 여부

- **게임 화면(1920×1080, 34°)에서는 재현되지 않았다.** 플레이어 위치 (20, -63.4)에서 `A2 外곽 -1/2/3`(RF3_Ancient_Tree_A) 몸통을 3배로 크롭했다: [크롭](img/tm-blackdot-game-3x.png), [Blender 렌더](img/tm-blackdot-render.png). **한 그루를 한 각도에서 본 결과이다.**
- 잔점·디더링이 아니므로 "점 금지" 규칙 대상으로 보이지는 않는다. Blender 광선 검사에서 검은 점 3곳은 모두 **면법선이 카메라 반대쪽**이었고(내적 -0.60~-0.93, 정상 지점 +0.94), 2곳은 같은 크기의 면보다 UV 면적이 큰 소수 면이었다. 즉 뒤집힌 면 후보이다. Unity는 뒷면을 그리지 않으므로 나타난다면 검은 점보다 구멍일 수 있으나, **원인은 후보 단계이고 게임에서 확인한 적은 없다.**

## 이번에 새로 나온 사실

- **1-1 씬에 거목이 542그루 배치되어 있다:** Ancient_Tree_A 256 + B 286 (`필드-렌더러.txt`), 그루당 19,888△로 합계 약 **1,078만△, LOD 없음.** 합계는 배치 기준이고 화면에 그려지는 수는 아니다. 이전 프로파일의 약 1,500만△와 어떤 관계인지는 재지 않았다.
- 실제 1-1에서 가까운 큰 나무 대부분은 Hollow이고, 거목은 외곽·원경에 주로 쓰인다.

## 한계

- **Quadriflow·Instant Meshes를 쓰지 못했으므로 쿼드 리토폴로지가 아니다.** 지시의 "리토폴로지" 대신 복셀+Decimate이고, 얇은 나뭇결 흐름을 따르는 토폴로지는 아니다. Instant Meshes는 설치 승인이 필요해 시도하지 않았다.
- 텍셀 밀도 512px/m 미달(중앙값 454). 배치 배율(1.7×) 적용 시 더 낮다. 다만 플레이 화면 기준(75px/u)은 크게 넘는다.
- **어느 LOD가 그려졌는지 확인하지 않았다.** LODGroup 전환 값은 Unity 자동값이고 제안한 .5/.2/.01을 넣지 않았다.
- FPS는 재지 않았다. 지면 접합 코드가 실행 중 법선을 다시 계산하므로 UV 심에 경계가 생길 수 있는데, 이번 각도에서는 바닥 심이 안 보인다.
- 원본의 색을 그대로 구웠고 조형·재채색을 하지 않았다. **"우리 것으로 만드는" 단계는 아직 안 했다.**
- 단계 소요 시간은 이 환경의 시계를 신뢰할 수 없어 적지 않았다.
- `tm-uv-after.png`는 폭 1024로 축소했다. 나머지 이미지는 1x이고, `*-3x.png`는 최근접 3배 확대이다.
