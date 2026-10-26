# Unity MAP3D 수직 슬라이스 (START 화면) — 2026-10-26

세션: 단순작업3 (Sonnet 5.5) · 브랜치 `claude/unity-pc-map3d-20261026` · 커밋 없음(총괄 검수 후)

## 범위
START 화면(초점 4020,7420 · 1920×1080 · Godot 카메라 pitch .85 / distance 1400)을 실제 지오메트리로 구성.

| 항목 | 구현 |
|---|---|
| 지면 | 8px 격자(127,512 정점)를 floor_v01b 높이로 변위(걷는 구역 ±1.5px, 바깥 벽 구역 최대 약 20px) |
| 재질 레이어 | L0 floor_v01b, L1 mass_v01. splat = `SourceMap.CanMove(x,y,15)` 부호거리 마스크(10px 셀) + fBm 노이즈, 높이 기반 블렌드 |
| 반복 숨김 | 2스케일(1.0× / 0.37× 17° 회전), ±8% 월드 노이즈 틴트, 원본 청크 색 macro 틴트 |
| 외곽 덩어리 | 절차 OBJ 메시 4종 5개 배치(mass_01~04), 트리플래너 mass_v01, 수직 스트레치 ≤1.5(≈380px 상한) |
| 뿌리 | root_01~03 튜브 3개 |
| 조명 | 키 라이트 `(-1000,500,-1000)` 낮은 각도 + 그림자 ON, 포인트 라이트 3개 추가(슬라이스 전용 임의값) + 기존 12개 |
| 안개/AO | 지수 안개, 덩어리 밑 접촉 AO 타원(Look3DBlob) |
| 플레이어 | 기존 빌보드 + 발밑 blob |

## 검증 (Win64 Player, `--unity-world3d-slice`)
- 체크 5/5 PASS: Built-in 파이프라인, 덩어리 ≥3, 뿌리 ≥2, 발자국 24샘플 CanMove 위반 0, 키 그림자 ON.
- 배치 8개: mass_01 (3620,8000), mass_02 (5600,6860), mass_03 (2630,7040), mass_04 (4790,7790), mass_03 (3170,7520), root_01 (3110,7520), root_02 (4880,7610), root_03 (2600,6890).
- FPS 30초(3600프레임): 평균 119.993 / 최저 1초 119.901 / 최저 순간 106.105 / 최장 프레임 9.425ms.
- 충돌 오버레이(`unity-slice-collision.png`): 10px 셀 빨강=이동불가, 덩어리 배치가 빨강 영역 안에 있음을 확인.

## 한계 (사실 그대로)
- 웹 START 참조에는 인트로 룬 오버레이가 포함됨. Godot C/D 는 덩어리 3/51개뿐.
- 거칠기 맵 미사용(diffuse-only). 추가 포인트 라이트 3개·키 고도는 슬라이스용 임의값.
- 덩어리 OBJ 는 simple-sonnet-4 의 절차 생성기 산출물(v2/v3 교체 미적용).
- 지면 톤 ×0.85, 키/앰비언트 보정 ×1.525/×1.44 는 경험적 보정(SetCalibration 토글).
- 디자인 판정은 스크린샷 기준 "기능+지오메트리 확인, 톤 최종 판정은 총괄/사용자".

## 산출물
`E:/exoduser-wt/_out/map3d-slice/capture3/` (unity-slice.png, -collision, -noshadow, -nolights, -debug-mask, fps json),
`sheets3/` (3분할 비교, 1x 크롭 2종).

---

# RETOUCH (S2-1 4레이어 지면 + 조명 대비) — 2026-10-26 같은 날 2차

전체총괄 판정 RETOUCH("바닥이 평평·단조, 조명 밋밋") 대응. 커밋 없음.

## 변경 요약
| 항목 | 이전 | RETOUCH |
|---|---|---|
| 지면 레이어 | 2 (floor_v01b, mass_v01) | 4 (v01b 기본 / v02b 마른 피 구역 / v03b 뿌리 구역 / mass_v01 전이), 높이 블렌드(`h*0.55 + 스플랫`) |
| 텍스처 입력 | albedo + normal + height 개별 | albedo + 패킹 `*_nhr.png`(R=normal.x, G=normal.y, B=height, A=roughness), 생성기 `unity/Tools/map3d/pack_ground_textures.py` |
| 스플랫 마스크 | R = 부호거리 | R 부호거리 / G 마른 피 구역 / B 뿌리 구역 (SourceMap.CanMove 부호거리 + 시드 고정 PerlinNoise, `SliceGrade.cs ZoneBlood/ZoneRoot`). 산출 PNG `capture*/unity-slice-splat-mask.png`, 디버그 `unity-slice-debug-splat.png` (R 피·G 뿌리·B mass) |
| 반복 숨김 | 2스케일(1.0×/0.37×·17°) | + 도메인 워프(저주파 노이즈 ±75px), 스케일 혼합비 공간 가변(0.22~0.60), 타일 900→1250px, ±10%+±4% 월드 틴트, 레이어별 UV 오프셋 |
| roughness | 미사용 | 약한 키 라이트 하이라이트(`L3D_Spec`, 부드러움=`(0.95-r)/0.27`, 계수 0.30) |
| 바닥 기복 | ±1.5px | + 저주파 기복 진폭 30(≈±10px)·파장 420px, 경계(부호거리 30~170)·초점 130~430px 반경 밖에서만, 법선도 기울임. 렌더 전용(충돌 없음) |
| 데칼 | 없음 | blood 9 / bone 5 / root 10 = 24개, 시드 20261033, 경계(부호거리~130)·광원 근처 가중, 최소 간격 200px, 플레이어 140px 제외, 무작위 회전·스케일·좌우반전·가로 0.75~1.25 신축. 16×16 격자 쿼드로 바닥 기복을 따라감 + 어두운 접지 알파(알파 mip3 블러) |
| key | (-1000,500,-1000) 고도 19.5° 중성 | (-1000,760,-1000) 고도 28.2° **따뜻한 키** (1.00,0.80,0.60)×0.72, 차가운 fill (0.26,0.38,0.66)×1.6(방향 (800,520,1000)), 낮은 앰비언트 (0.34,0.40,0.56)×0.95, 키 그림자 강도 0.85 |
| 광원 웅덩이 | 약함 | 포인트 스탬프 이득 5.5, 랩 0.55(`_L3D_Pool`), 슬라이스 전용 추가 광원 4개로 확대(3430,7330 r480 따뜻 / 4640,7540 r460 붉음 / 3700,7750 r300 녹색 / 4260,7770 r430 따뜻) — 원본 12개 표에 없는 임의값 |
| 접촉 AO | 타원 1개 알파 0.72 ×2.6 | 알파 0.92, ×3.4 + 코어 ×2.2 추가, mass 셰이더 접지 어둡기 0.38→0.20·높이 70→110, 바닥 쪽 경계 AO(부호거리 -30~170에서 0.40→1.0) |
| 거리 안개 | 지수(.00006) | + 높이·거리 안개(밀도 .00042, 시작 1300px, 높이 감쇠 .0035, 따뜻한 재색 (0.26,0.19,0.16) 강도 .85) — 화면 위쪽 대기 원근 |
| 포스트 | LOOK-001 | + 비네트 0.42(내반경 .30) + 중앙 리프트 0.10 + 대비 ×1.06 (슬라이스 전용, `NativePerspectiveWorldPost`) |

## 원인 발견: 바닥에 그림자가 안 떨어졌던 이유
이전 슬라이스는 바닥이 그림자를 받지 않았다(그림자는 mass 자기 자신에만). 바닥 셰이더에 `ShadowCaster` 패스가 없으면 Built-in 전방향 스크린스페이스 그림자의 깊이 패스에 바닥이 빠져 수신 계산이 틀어진다. 바닥에 변위를 그대로 반영한 `ShadowCaster` 패스를 추가하고 바닥 렌더러를 `ShadowCastingMode.On`으로 바꿔 해결(그림자 수신: mass·플레이어 빌보드·뿌리 그림자가 바닥에 떨어짐). 자기 그림자 아크네는 1x 크롭에서 보이지 않음.

## 측정
- 체크 5/5 PASS, 발자국 위반 0, 배치 8개(변경 없음), 데칼 24, key 고도 28.25°.
- 텍스처 샘플: 바닥 정점 3 + 프래그먼트 17(마스크1, 매크로2, albedo 7, nhr 7) / mass 6(삼축 albedo3+normal3) / 데칼 3 + 그림자 캐스터.
- 30초 FPS(3600프레임): 평균 119.994 / 최저 1초 119.906 / 최저 순간 110.996 / 최장 프레임 9.009ms (이전 슬라이스: 119.993 / 119.901 / 106.105 / 9.425).
- 화면 평균 RGB ≈ (42,27,22), 중앙(700~1250,400~700) ≈ (58,39,32), 좌우 가장자리 150px ≈ (20,12,10) — 중앙이 가장자리보다 약 3배 밝음.

## 한계·솔직한 기록
- Godot C 와 비교하면 Unity RETOUCH 가 더 따뜻하고 채도가 높다(Godot C 는 차가운 회갈색). 요청한 색온도 대비 방향이지만 Godot 와 동일하지는 않음.
- 피 데칼 별 모양이 눈에 띄게 반복된다(텍스처 1종, 회전·신축으로 완화). 뼈 데칼은 작은 고리 문양처럼 보인다. 메시/데칼 추가 생성은 사용자 결정 뒤.
- 플레이어 빌보드가 그림자를 바닥에 드리운다(발 blob 과 함께). 의도한 사양은 blob 이었으므로 판단 필요.
- 추가 광원 4개·키/fill 색·haze 값은 슬라이스 판정용 임의값(원본 데이터 없음).
- 새 PNG 메타(.meta)는 Unity 임포트 설정(mip on·aniso 8, nhr 은 sRGB off·무압축)을 직접 작성. 작업 트리의 기존 CharacterSelect 등 수백 개 `.meta` 가 Unity 6000.6.7f1 임포트로 확장 직렬화된 상태(내가 되돌리지 않음, 보고 대상).

---

# 에셋 출처 (맥북 총괄 기록, 2026-10-26)

모든 원본·로그·판정 자료는 저장소 밖 `E:/exoduser-wt/_out/ai3d-trial/gpt/`(HANDOFF.md, `*.json`=프롬프트·usage)와 `E:/exoduser-wt/_out/map3d-mass/`에 있다. 사용자 승인 경로: "지피티 api로해"(2026-10-26).

| 저장소 파일 (`Resources/Art/map3d/`) | 생성 | 입력·참조 | 후처리 |
|---|---|---|---|
| `floor_v01b.png` | OpenAI `gpt-image-2.5-sunburst`, `/v1/images/edits`, 1024², medium (단순작업4) | CH1 바닥 `skin_material_generated.png` 참조 | 톤 보정(평균 RGB 83,68,64 = 기존 CH1-1 바닥), `floor_v01.json` |
| `floor_v02b.png` (마른 피 구역) | 같은 모델 `/v1/images/edits` | `floor_v01b.png` 참조 | 반 타일 오프셋 4방향 이음새 블렌드, 70퍼센타일 톤 맞춤, `floor_v02.json` |
| `floor_v03b.png` (뿌리 구역) | 같은 모델 `/v1/images/edits` | `floor_v01b.png` 참조 | 톤 맞춤, `floor_v03.json` |
| `mass_v01.png` | 같은 모델 `/v1/images/edits` | `assets/map/ch1/production_finish/outer66_sources/rotten_mass_generated.png` 참조 | 톤 보정, `mass_v01.json` |
| `decal_blood/bone/root.png` | 같은 모델 `/v1/images/generations`, `background:"transparent"` | 참조 없음 | `_b` 톤 보정본 채택, `decal_*.json` |
| `*_nhr.png`, `mass_v01_normal.png`, `decal_*_nrm.png` | 스크립트 파생(생성 비용 0) | 위 albedo | `derive_maps.py`(height=루미넌스 대역통과, normal=래핑 중앙차분, roughness=0.88−루미넌스 편차) → `unity/Tools/map3d/pack_ground_textures.py` (R,G=normal.xy, B=height, A=roughness) |
| `mesh/mass_01~04.obj`, `mesh/root_01~03.obj` | 절차 생성 Python(`gen_mass.py`·`gen_mass2.py`·`gen_mass3.py`, 시드 고정, 단순작업4) | 없음 | — |

- 이미지 생성 비용: HANDOFF 기준 누적 약 $0.133 (7장, 재시도 없음).
- 커밋 제외: `floor_v01b_normal.png`·`floor_v01b_height.png`·`mass_v01_height.png`(런타임 미참조 — `Resources/`에 두면 빌드에 포함되므로 다음 단계에서 `Resources` 밖으로 옮긴다), 6000.6.7f1 재import로 바뀐 기존 `.meta` 수백 개·`FirstPlayable.unity` 재직렬화(내용 변경 없음).

## 총괄 판정 (직접 본 결과)

- 1920×1080 전체·1x 크롭 확인: 바닥 그림자 수신·4레이어·광원 웅덩이·외곽 mass 입체감 확인, 점 노이즈 없음. 이전 슬라이스 대비 "평평·단조" 해소 → **슬라이스 v1으로 커밋**.
- 남은 차이(다음 단계): ① 피 데칼이 같은 별 모양으로 반복(텍스처 1종) ② 기본 바닥 물결 무늬가 모래 결처럼 읽힘 ③ Godot C보다 따뜻·밝음(색온도 판정은 사용자) ④ 플레이어 빌보드 그림자 사양 결정 ⑤ 추가 광원 4개·키/fill 값은 원본 데이터 없는 슬라이스 전용 임의값.
