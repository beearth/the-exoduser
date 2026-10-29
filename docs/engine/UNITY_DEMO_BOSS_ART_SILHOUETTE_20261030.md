# 데모 v0 드루이드 본체 메시 실루엣 1차 게이트 — 2026-10-30

범위는 `DEMO_GOAL_20261030.md`의 1-1 키샷/첫 보스 한 명이다. 기준은 `origin/main:docs/11내러티브·로어디자인/DARK_DRUID_DESIGN_LOCK.md` §4·§16의 마르고 길쭉한 저주받은 노인이다. `DEMO_ART_PIPELINE_20261030.md`의 **실루엣 선검수**를 적용한다. 기존 Meshy 본체는 사용자 판정 VISUAL FAIL이며 이 문서의 후보도 제품 에셋이 아니다.

| ID | 입력·작업 | 실측·적용 위치 | 판정 |
|---|---|---|---|
| DDB-01 원본 | 승인 비용으로 확보했던 `I:/EXODUSER-Storage/Meshy/dd_body_20261028_2202/model.glb`. SHA-256 `2651AAEB1AF39851F296630266E176740ADDB210027DEE71600A6763AC328A7B`; 원본 변경 0 | Blender 5.1.0 `G:/blander/blender.exe -b -P`, NTFS `G:/exoduser-wt/demo-art-boss`. 단일 메시 97,789정점·61,063면·UV 1개; 원본 바운드 높이 1.9042m를 검수 복사본에서 2.70m로 정규화 | 원본의 전사형 수평 어깨·흉갑·직립 다리·큰 발 확인. FAIL |
| DDB-02 실제 메시 편집 | `unity/Tools/boss/demo_druid_mesh_silhouette.py`가 GLB를 읽기 전용으로 가져와 복제한 **실제 정점**에 부위별 비선형 변형을 적용. 어깨 깃털 안쪽 이동·비대칭 하강, 상체 전굴, 흉부 전면 함몰, 팔끝 하강, 종아리·발 축소. 자동 SDF/loft 생성과 다른 메시 편집 후보 | 상부 y 전굴 최대 0.095m, 우측 어깨 하강 최대 0.105m, 흉부 함몰 최대 0.047m, 팔끝 하강 최대 0.12m. 원본/후보 모두 97,789정점·61,063면. 후보 전체 z=0–2.70m. 전체 x폭 원본 약 1.154m→후보 약 1.006m; 이 전체 폭은 뿔·장식·몸이 섞여 §4의 별도 몸통/망토 목표치 증명이 아님 | 정면 어깨 폭은 줄었으나 흉부 장갑형 V, 측면 두꺼운 깃털 덩어리, 직선 다리·큰 발이 남음. 뿔 전체 폭도 LOCK의 1.30m에 못 미침. **VISUAL FAIL** |
| DDB-03 동일 조건 비교 | `I:/EXODUSER-Storage/demo-art/boss/`의 `before_`/`after_` 정면·측면·55°·`game_size` 무채색 PNG 각 4장 | 모두 1600×900, 같은 Blender Eevee 조명·정사영 카메라·대상 크기. `game_size`는 17m 정사영 폭의 소형 화면 모사이며 **실제 게임 캡처 아님** | 실제 게임 크기 모사에서도 저주받은 마른 노인으로 읽히지 않음. 키샷/1-1 채택 금지 |
| DDB-04 편집·내보내기 | `G:/exoduser-wt/demo-art-boss/_work/dark_druid_demo_silhouette_gate.blend`에서 저장·재열기, 동일 바이트 I: 보관본 `dark_druid_demo_silhouette_gate.blend` SHA-256 `4C23B63324FB69045C07E52590B5443DF944F472EA883EF1E962B0EA9BB7CABA` | 실패 연구 GLB `dark_druid_demo_silhouette_FAIL.glb` SHA-256 `B711E67A27AB9B585246E75E5566D22076B9E1598D4302DA2828A09288355837` 생성. 오프라인 재가져오기 검증은 숨긴 원본 잔존/UV·노멀 seam 정점 수 불일치로 2회 실패; `export_import_manifest.json`에 기록 | GLB 가져오기·Unity 호환 **미검증**. 제품 `Studies`·런타임·통합 큐 반입 0 |

실루엣이 1차 게이트에서 실패했으므로 remesh/decimate, 원화 투영 텍스처, Rigify/기존 리그 호환, 예고·공격·회복 10–20초 비교, Unity 실제 게임 캡처는 진행하지 않았다. 원본 텍스처·Meshy 리그·이전 지팡이 SDF/loft 실패본은 보존했다. 키샷 조명·카메라·공용 씬/Runtime/Core·Unity 실행·빌드·바로가기·비용 지출·2장 이후 작업은 0이다.

다음 제작 조건: 기존 메시의 국소 변형만으로 갑옷형 흉부와 깃털 망토의 큰 덩어리가 해결되지 않았으므로 **형상을 직접 재조각하거나 새 표면을 수작업으로 교체**한 정면·측면·게임 크기 무채색 후보가 먼저 필요하다. 실루엣을 통과한 같은 후보에만 UV/재질, 리그, 애니메이션, Unity 실제 장면 검수를 진행한다. 신규 유료 Meshy/ludo/구매 지출은 승인 전 0이다.

## R2 — 큰 표면 직접 교체, 2026-10-30

이전 `96f66d294`의 국소 정점 변형 방법을 중단했다. `unity/Tools/boss/demo_druid_r2_surface_rebuild.py`(SHA-256 `40213662C21D07862992F2A47B0360CDDF54F419437E77EF95EF620C344E291D`)는 승인 Meshy 원본 GLB를 읽기 전용으로 가져와 가면·뿔·상부 머리의 원본 면 13,867개만 남기고, 흉갑·깃털·팔다리·부츠가 포함된 원본 면 **47,196개를 후보에서 제외**한다. 그 자리에 굽은 흉곽, 앞 두 천 패널·뒷 천 패널, 가는 양팔·양다리를 별도 쿼드 표면으로 다시 구성한다. 원본 메시·이전 `.blend`/GLB는 수정하지 않았다. 이는 기존 몸체 정점 축소나 지팡이 SDF/loft 매개변수 조정이 아닌 **표면 교체** 시험이다.

| ID | 증거 / 관찰 | 판정 |
|---|---|---|
| DDB-R2-01 원본 | `model.glb` SHA-256 `2651AAEB1AF39851F296630266E176740ADDB210027DEE71600A6763AC328A7B` 전후 동일. 이전 실패 `.blend` SHA-256 `4C23B63324FB69045C07E52590B5443DF944F472EA883EF1E962B0EA9BB7CABA` 보존 | 입력·실패 이력 보존 |
| DDB-R2-02 편집 원본 | NTFS `G:/exoduser-wt/demo-art-boss/_work/r2/dark_druid_demo_r2_surface_rebuild.blend`, 동일 바이트 I: `I:/EXODUSER-Storage/demo-art/boss/r2/dark_druid_demo_r2_surface_rebuild.blend`, SHA-256 `3A0D3CA0AD476966F0D9D0F4674A11B122605F821BB3FA8BB72C5513FA734727`. 별도 Blender 5.1.0 프로세스에서 재열기 성공: 원본 1개 + R2 편집 메시 9개 | 편집 소스 유효. 디자인 합격 근거 아님 |
| DDB-R2-03 같은 조건 이미지 | `I:/EXODUSER-Storage/demo-art/boss/r2/`의 `before_original_`·`after_r2_` 정면·측면·55°·`game_size` 각 4장. 모두 1600×900, 같은 Eevee 조명·카메라·대상 크기. `game_size`는 작은 정사영 모사이며 Unity 화면 아님 | 정면·측면·55°를 직접 비교 |
| **DDB-R2-04 제품 판정** | 흉갑 V와 큰 깃털 더미는 제거됐지만 새 흉곽은 매끈한 긴 원통, 천은 평평한 판, 팔다리·부츠는 막대처럼 보인다. 가면/머리와 몸의 연결도 부자연스럽다. DESIGN LOCK의 늙고 구부러진 저주받은 몸으로 읽히지 않는다. | **VISUAL FAIL 유지, 채택 0** |

R2 실루엣도 실패했으므로 같은 쿼드 표면 자동 구성의 숫자 조정 반복을 멈춘다. UV/원화 투영 텍스처·리그·애니메이션·GLB export/import·Unity/Player/빌드/키샷 조명·공용 씬 변경은 **0**이다. 다음에는 수작업 스컬프 또는 검증된 고품질 입력 메시/실제 3D 아티스트의 형태 저작이 필요하다. 재개 전 정면·측면·55°·게임 크기 무채색 실루엣을 같은 기준으로 통과시켜야 하며, 필요한 신규 유료 입력의 후보/가격은 별도 USER_CONFIRM 대상으로 남긴다.
