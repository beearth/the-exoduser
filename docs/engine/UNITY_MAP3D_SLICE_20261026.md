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


---

# RETOUCH 2 (톤 Godot 기준 맞춤 · 데칼 7종 · 반복 완화) — 2026-10-26

커밋 없음. 산출: `E:/exoduser-wt/_out/map3d-slice/capture12/`(최종), `sheets12/`(웹|Godot D v2|Unity 3분할, 1x 크롭 3곳, 데칼 크롭, `ground_color_stats.txt`).

## 변경
| 항목 | RETOUCH 1 | RETOUCH 2 |
|---|---|---|
| key / fill / ambient 색 | 임의 따뜻한 key (1.0,0.80,0.60), 차가운 fill | **LOOK-001 D 원래값**: key `KeyColor`×`KeyEnergy`×캘리브레이션, fill `FillColor`·`FillSource`, ambient `AmbientColor`×`AmbientEnergy`×캘리브레이션. 슬라이스 전용으로 남은 것은 key 고도 28.2°와 광원 웅덩이 이득(5.5, 랩 .55)·haze·비네트·4개 추가 광원 |
| 바닥 albedo 톤 | ×0.85 고정 | 스크립트 측정 곱셈값 **(0.417, 0.447, 0.579)** (재생성 없음, 셰이더 `_L3D_GroundTone`, 실행 인자 `--unity-world3d-ground-tone=r,g,b`로 재조정 가능). 목표 Godot D v2 지면 평균 ±5 |
| 반복 | 도메인 워프, 가변 혼합, 타일 1250 | + **확률적 타일링**(iq 방식: 저주파 노이즈로 8개 UV 오프셋 중 선택·경계 교차 페이드, L0~L3 모든 레이어) + 두 번째 스케일 비 0.37→**0.2713**(바닥 3레이어, mass 레이어는 0.37 유지) |
| 데칼 | blood/bone/root 1종씩 (24개) | 변주 7종(출처 아래) 중 blood_drag 3, blood_drops 3, **blood_cracked 0(빼냄: 벌집 격자로 읽힘)**, bone_ribs 3 (크기 200→120), bone_skull 1 (110→66), root_branch 5, root_tangle 5 = 20개. 뼈 tint 낮춤(~0.5), root tint 낮춤(~0.75) |
| 바닥 기복 법선 | 1.0배 | 0.35배(기복은 높이 중심) — 지시 반영 |
| 플레이어 그림자 | 빌보드 실루엣 | blob 기본, 실루엣은 `PlayerSilhouetteShadow`/`--unity-world3d-silhouette-shadow` 토글 |

## 측정
- 지면 중앙(700,400,550×300) 평균 RGB: Godot D v2 (41.8,32.4,27.6) / Unity (41.3,32.2,27.8) / 채널 차 (-0.6,-0.3,+0.2) → ±5 목표 충족.
- 보고서 좌표 3곳: player-contact 차 1 이내, skin-ground R+3.5·G-2.2·B-2.7, **living-tree Unity 더 밝음(R+11.5 등)** — 좌측 추가 광원 웅덩이 근처이고 mass 아트 포함 구역이라 ±5 미충족(`ground_color_stats.txt`).
- 체크 5/5 PASS, 발자국 위반 0, 데칼 20개.
- FPS 30초(3596프레임): 평균 **119.867** / 최저 1초 116.197 / 최저 순간 20.8 / 최장 프레임 48.0ms. 평균 119 이상 목표는 충족했으나 **단발 지연 프레임이 있다**(직전 빌드 capture11 28.8ms, capture10 9.0ms, 같은 코드 계열 3초 측정 8.9ms — 원인 미확인, 재실행·분리 측정 안 함).

## 한계
- 최종 색온도는 사용자 판정. 이번 값은 "Godot 기준 맞춤"이다(Godot D v2 지면 평균).
- 바닥 물결 결(텍스처 자체 법선)은 사양대로 보류 — 여전히 모래 결처럼 읽힘.
- 확률적 타일링은 4레이어 모두에 적용해 프래그먼트 텍스처 샘플이 늘었다(L0~L3 각 albedo·nhr A스케일 2샘플씩; 총 약 25).

## 신규 데칼 7종 출처 (`Resources/Art/map3d/decal_*.png`, `*_nrm.png`)
| 파일 | 생성 | 후처리 |
|---|---|---|
| `decal_blood_drag`, `decal_blood_drops`, `decal_blood_cracked` | OpenAI `gpt-image-2.5-sunburst` `/v1/images/generations`, `background:"transparent"`, 1024² medium, 참조 없음 (단순작업4, HANDOFF §6) | 채택본 `decal2_*_b.png`: blood 채도×0.65·명도×0.78. normal=`decal2_*_b_normal_rgba.png` (루미넌스 60%+알파 블러 40% 높이맵의 래핑 중앙차분) |
| `decal_bone_ribs`, `decal_bone_skull` | 같은 모델·방식 | 채도×0.7·명도×0.88 |
| `decal_root_branch`, `decal_root_tangle` | 같은 모델·방식 | 채도×0.55·명도×0.95 |
- 프롬프트·usage: `E:/exoduser-wt/_out/ai3d-trial/gpt/decal2/` `*.json`. 비용 7장 약 $0.0997(누적 약 $0.302). 점·잔점·디더링 없음(단순작업4 1x 확인 + 슬라이스 1x 크롭 재확인; blood_drops의 방울은 의도된 형태). `decal_blood_cracked`는 슬라이스에서 미사용(파일은 저장소에 포함).
- 기존 `decal_blood/bone/root.png`(+`_nrm`)는 미참조로 남아 있음.


---

# RETOUCH 3 (데칼 스티커감 제거 · 소프트 법선) — 2026-10-26

커밋 없음. 산출: `E:/exoduser-wt/_out/map3d-slice/capture14/`(최종), `sheets14/`(Godot D v2 | Unity v1 | Unity v2 3분할, 1x 크롭 3곳, `crop_decals_unity_1x.png`, `ground_color_stats.txt`). Unity v1 = capture8(RETOUCH 1, 커밋 e64e57889).

| 항목 | 변경 |
|---|---|
| 데칼 스케일 | RETOUCH 2의 크기 × 0.5 (`DecalScale`): 뿌리 branch 190·tangle 170, 뼈 ribs 60·skull 33(캐릭터 약 40px 기준, 뼈는 무릎 높이 이하), blood drag 210·drops 260·cracked 140 (각각 ×무작위 0.7~1.3) |
| 알파 | 0.62~0.82 (지시 0.55~0.75보다 약간 높임: 0.45배·0.55~0.75에서는 거의 보이지 않아 한 단계 올림) |
| 바닥과 섞기 | 데칼 셰이더가 바닥 height(floor_v01b, 지면과 같은 워프·확률적 타일링)를 읽어 돌출부(height 0.58~0.85)에서 알파를 최대 50% 깎음, 데칼 법선에 바닥 법선(×0.25)을 더함, 데칼 색을 바닥 명도(floorLum/0.31, 0.55~1.25)에 맞춤, 뼈 tint ~0.45~0.5로 낮춤 |
| blood_cracked | 복귀(2개): 가장자리를 노이즈로 깎음(`_Erode` .8), 바닥 height가 낮은 곳에만(`_LowOnly`, height 0.34~0.58에서 사라짐) |
| 바닥 법선 | floor_v01b/v02b/v03b를 단순작업4의 `*_normal_soft.png`(섬유 결 제거)로 교체(`pack_ground_textures.py`가 있으면 우선 사용), 강도 0.42→0.5(soft 기준 ≈ 지시 "강도 1.0 기준 0.7~0.8 수준"에서 낮게 시작). mass는 기존 법선 유지 |
| 28.8ms 순간 끊김 | 원인 미확인, 재실행 확인 안 함(기록만). 이번 최종 30초: 평균 119.985, 최저 1초 119.844, 최저 순간 106.2, 최장 9.41ms로 재현 안 됨 |

한계: 소프트 법선으로 모래 알갱이 결은 사라졌지만 광원 웅덩이 안에서 물결무늬가 매끈한 소용돌이로 읽힌다(스펙·랩 라이트와 겹침). 데칼은 작아져 1x 전체 컷에서 은은하다.

## RETOUCH 2·3 총괄 판정 (맥북 총괄, 2026-10-26 — 직접 본 결과, 슬라이스 v2로 커밋)

- capture14 전체·데칼 1x 크롭 확인. 지면 중앙 평균색 Godot D v2와 채널 차 0.1/0.6/1.5(목표 ±5 달성), 하단 절단선 안 보임, 30초 평균 119.985fps. 별 모양 반복·모래 결 해소 → **슬라이스 v2 인수**.
- 남은 차이: ① 데칼이 너무 희미 — `root_tangle`·`blood_drops`는 1x 크롭에서 거의 안 보임(개수·알파 재조정 또는 제외) ② 왼쪽 가운데(대략 x300~700, y300~700) 회색 안개 띠가 우윳빛으로 떠 보임(녹색 광원·높이 안개 겹침 의심) ③ 살아 있는 나무 크롭이 Godot보다 밝음(평균 차 17.5) ④ 광원 웅덩이 안 바닥 결이 매끈한 소용돌이로 읽힘 ⑤ `blood_cracked`는 침식 처리 후에도 둥근 덩어리 — 판정 보류.
- 정리 대상(다음 단계): v1 데칼 `decal_blood/bone/root(.png,_nrm.png)`는 v2에서 참조하지 않지만 `Resources/`에 남아 빌드에 포함된다. 미참조 `floor_v01b_normal/height.png`·`mass_v01_height.png`는 커밋하지 않았다.


---

# PAINTGROUND (원본 손그림 청크 지면 + 칠한 빛 70/30 + 그림 카드 + 아트 바이블 RETOUCH 5항목) — 2026-10-26

명세 `E:/exoduser-wt/_out/pc-map3d-paintground/SPEC.md`, 아트 바이블 `docs/4.1맵디자인+설정/UNITY_ART_BIBLE_V1_20261026.md`. 베이스 `0bf374355`(LIFE1+M1 본체 커밋) 위, 커밋 없음. 산출물 `E:/exoduser-wt/_out/pc-map3d-paintground/`(원본 캡처 `map3d-slice/capture27f/`).

## 1. 청크 출처 확정 (경로·SHA-256)
슬라이스 구역(START 화면)에 걸리는 청크 12개와 전체 64개를 Unity `Resources/Art/map/production_finish/`, Godot `godot/assets/map/production_finish/`, 웹 `assets/map/ch1/production_finish/`(game.html:64 layout.js, :11614 `_CH1_START_ROOT`)에서 비교했다. **64개 전부 세 곳에서 바이트 동일**(SHA-256 일치). 따라서 Godot C가 쓰는 지면과 웹이 CH1-1에서 그리는 지면, Unity가 이미 갖고 있던 청크는 같은 원본이다.

| 청크 | SHA-256 앞 12자 | Godot 일치 | 웹 일치 |
|---|---|---|---|
| `chunk_2_5.png` | `4cd229eba8e6…` | 일치 | 일치 |
| `chunk_3_5.png` | `df2cb18b3579…` | 일치 | 일치 |
| `chunk_4_5.png` | `b5cb5e015768…` | 일치 | 일치 |
| `chunk_5_5.png` | `f19dec4ab01a…` | 일치 | 일치 |
| `chunk_2_6.png` | `612de9d5a722…` | 일치 | 일치 |
| `chunk_3_6.png` | `8c74f1a860b2…` | 일치 | 일치 |
| `chunk_4_6.png` | `39958400755e…` | 일치 | 일치 |
| `chunk_5_6.png` | `52bf20643dba…` | 일치 | 일치 |
| `chunk_2_7.png` | `845063f257ca…` | 일치 | 일치 |
| `chunk_3_7.png` | `d412d1f88dc1…` | 일치 | 일치 |
| `chunk_4_7.png` | `767908afbfa1…` | 일치 | 일치 |
| `chunk_5_7.png` | `42bfbbe76003…` | 일치 | 일치 |
(청크 메타: `ch1_map.json` chunks 64개, 각 1000×1000 월드px에 텍스처 영역 `sx,sy,sw,sh = 1,1,1024,1024`.)

## 2. 투사·혼합
- **1:1 투사**: 슬라이스 구역(3850×2100 px)의 청크를 한 번 합성한 `SlicePaintGround` 렌더텍스처(1 맵 px = 1 텍셀 = 1 유닛, 밉맵·이방성 8)를 지면이 `(px_x, h, −px_y)` 매핑으로 그대로 샘플한다. 청크 경계에 이음선 없음(1x 크롭 `crop_chunk-boundary_godotC_v1_new.png`에서 확인).
- **기본색 = 원본 청크만.** GPT 바닥 4레이어는 albedo 기여 0. 세부 법선·roughness·벽 전이 가중치에만 쓴다. 세부 법선 강도 **0.2**(`_DetailNormal`): RETOUCH 3의 0.5보다 낮춰 1x에서 모래 결·물결이 다시 읽히지 않는 선으로 정했다(원본 청크가 자체 디테일을 가짐).
- **색조**: 원본 청크 중앙 평균 (47.5,41.5,41.8)(L p50 17.2, R/G 1.14)은 회색에 가깝다. 바이블 §3은 명도 유지·색상을 붉게(옥스블러드 `#321d1c`)이므로 선형 곱 **(1.72, 1.00, 0.94)**로 이동했다(스크립트 측정: 전/후 평균색). 결과 지면 중앙 평균 (51.6,31.2,29.7), L p50 14.1(바이블 전투 바닥 12~16), R/G 1.65(목표 1.73).
- **칠한 빛 70% + 동적 30%**: `lit = lerp(1, dyn / dynRef, 0.3)`. `dynRef`(`_L3D_PaintRef`) = 평지에서 앰비언트+키·N·L+필 값(칠한 그림을 그대로 두는 수준, 상수 `PaintDynamicWeight = 0.3`). 색점광원(웅덩이)은 별도 가중(`_L3D_Pool.z = 1.0`, 이득 5.0)으로 전량 더한다 — 웅덩이까지 30%로 줄이면 빛 리듬이 사라졌기 때문(바이블 ⓪).
- 외곽 mass(`Look3DMass`)에도 같은 70/30 분리, 위쪽 칠한 빛(높이 마스크 0.85→1.5), 상아색 끝 하이라이트(위로 향한 면, 0.14), 톤 `(1.8,1.0,0.95)`(멍든 장밋빛).

## 3. 아트 바이블 §12 RETOUCH 5항목
| # | 항목 | 반영 | 실측(기록용, 판정은 눈) |
|---|---|---|---|
| ⓪ | 빛 리듬(V2) | 캐노피 고보로 그늘(지면 칠한 빛에도 곱 0.6), 웅덩이 색을 바이블 3종으로 교체(독액 `#a8a23a`계 / 진홍 `#b0281c` / 안개광 `#7a7f8c` / 어두운 독액; 이전의 주황·순녹색 제거) | 지면 중앙(700,400,550×300) L≥42 0.0%, L≤20 88.3%, p99 26.7 — 전투 바닥 L10~24 대역 안, 중앙 L30 넘는 면 0 |
| ① | 스페큘러(C3) | 하이라이트를 붉은 톤(1.0,0.5,0.4)으로 물들이고 roughness를 웅덩이·벽 기슭 0.22 / 중앙 0.72로(`wet` 마스크, §5 바닥 0.65~0.80) | 회색 광택 없음. 긴 선 모양 반사는 구현하지 못함(아래 한계) |
| ② | 바닥 기본색 | 원본 청크로 복귀(§2) | — |
| ③ | 외곽 명도(V4) | 위 mass 조정 | 외곽 몸통(mass가 바뀌는 픽셀 마스크 `unity-slice-nomass.png` 차이, 화면의 14.8%) **L p50 19.3**(목표 ≥12), 왼쪽 20.1·오른쪽 16.0, p90 35.4, p99 51.5(뼈·껍질 끝 L45~60 대역) |
| ④ | 데칼 경계 | 데칼 uv 가장자리를 0.34~0.5에서 0으로 페이드 + 기존 노이즈 침식 | 가장자리 선이 보이지 않음 |

## 4. 그림 카드 (외곽 mass 앞뒤)
원본 확정 아트만 사용(생성 0): `Resources/Art/map/props/` 웹·Godot CH1 prop(`rotforest_tree_*`, `prop_corpsetree`, `prop_s_bone`, `skull_totem`). 뿌리·지면 prop(`prop_s_root/prop_g_root`)은 위에서 내려다본 원반이라 세워 두면 떠 있는 바위처럼 읽혀 제외. 카메라를 향한 직립 카드(맵 prop과 같은 빌보드 경로: 접지·키 라이트·그림자). 카드 배치 조건: 위 화면 면적이 막힌(보행 불가) 지형 위에만 놓일 것. 배치 결과 **6장**(뒤 4·앞 2): back `rotforest_tree_05` (4990,7564) 303px; back `rotforest_tree_07` (3233,7708) 304px; back `rotforest_tree_06` (5081,7349) 285px; back `rotforest_tree_05` (5277,7179) 239px; front `prop_s_bone` (4834,7234) 111px; front `prop_s_bone` (3392,7436) 119px. 카드가 가리는 보행 가능 바닥(START 카메라 광선 투영, 알파 무시한 보수적 상한): **화면의 0.087%** (한도 3%). START 화면 안에는 앞 카드(뼈 무더기) 2장만 보이고 뒤 카드는 화면 밖 또는 가장자리다. 충돌 불변.

## 5. 측정·비교
- 비교 시트 `compare_godotC_v1_paintground.jpg`(Godot C v2 | 슬라이스 v1 capture8 | 새 결과), 1x 크롭 `crop_chunk-boundary_…`, `crop_mass-boundary_…`, `crop_player-contact_…`(각 Godot C | v1 | 새), 충돌 오버레이 `paintground_unity-slice-collision.png`, 외곽 마스크 `paintground_unity-slice-nomass.png`, 움직임 `life-seq/`.
- 체크 5/5 PASS, mass 발자국 위반 0, 풀 걸을 수 없는 위치 0.
- FPS 30초(`capture27f`, 3585프레임): 평균 **119.496**, 최저 1초 106.62(첫 1초만, 이후 구간 119.8~120), 최저 순간 9.35, 최장 프레임 106.9ms(시작 구간 지연, 이전 단위들과 같은 패턴·원인 미확인).

## 6. 직접 본 판정과 한계
- **좋아진 것**: 지면이 원본 손그림 청크(웹·Godot와 같은 그림)로 보이고 붉은 갈색(옥스블러드)이다. 타일 반복·모래 물결·회갈 진흙이 사라졌다. 청크 이음선 없음. 외곽은 멍든 장밋빛 몸통에 윗부분이 밝다.
- **아직 부족한 것**: ① 습기 — 긴 선 모양 반사는 없다(중앙 반무광만). 웅덩이 밖은 거의 말라 보인다. ② 웅덩이 — 독액·진홍 빛이 화면에서 약하게(회황·탁한 적색) 읽힌다. 독액 웅덩이는 풀 색이 먼저 보인다. ③ 외곽이 아직 임시 절차 메시라 형태가 짐승·껍질판으로 읽히며 Meshy 교체 전까지 한계. ④ 카드는 START 화면 안에서 거의 안 보인다(바닥을 가리지 않는다는 조건과 맞바꿈). ⑤ 풀 군락이 균일한 점박이로 보이는 문제(맵 총괄 지적)는 이번에 안 고쳤다(TOXIC과 함께).
- 바이블 §9 "바로 반려" 항목 점검: 회갈 진흙 아님, 외곽은 검은 덩어리 아님, 보라·주황·순녹색 없음(웅덩이 색 교체), 점·디더링 확인 못 함(1x 크롭에서 보이지 않음).
- 최종 색·판정은 디자인총괄 몫.

# PAINTGROUND-R (디자인총괄 RETOUCH 반영: 빛 웅덩이·외곽 살덩이·밝은 꼬리·접지 그림자) — 2026-10-26
원문 = 판정서 `E:/exoduser-wt/_out/design-reconcile/JUDGE_PAINTGROUND_20261026.md`, 명세 `…/pc-map3d-paintground/SPEC_R.md`, 기준 `MAP_ART_BIBLE_v2` §3·§4·§7·§9. 베이스 `db58d8c86`. 바닥 색조(`SliceGroundToneDefault`)·청크 결·충돌·풀·데칼·카드는 바꾸지 않았다(풀 군락화는 TOXIC §2.5 몫, 광원 위치를 바꿔도 풀·데칼 배치가 움직이지 않도록 광원 재배치는 `BuildLife` 뒤 `RetuneSliceLights()`에서 한다).

## 1. 바꾼 상수 (전 → 후, 이유)
| 항목 | 전 | 후 | 이유 |
|---|---|---|---|
| `SlicePoolGain` | 5.0 | **9.0** | 웅덩이가 칠한 바닥(L~14)에 곱해져 약했다(K3) |
| `SlicePoolWeight` (`_L3D_Pool.z`) | 1.0 | **2.4** | 칠한 빛 70:30 구조는 유지, 웅덩이 가중만 올림 |
| `SliceFloorOutsidePools` (`_L3D_Pool.w`, 신규) | 1.0(없음) | **0.90** | 웅덩이 밖 바닥 수준(바닥 L\*≥17을 웅덩이로 모음, 사이는 어둠, L-1) |
| `SlicePaintShadow` (`_L3D_PaintShadow.x`, 신규) | 0 | **0.5** | 키 그림자가 30% 동적 몫에만 들어가 플레이어·소품·외곽 그림자가 약했다 |
| `SliceMassBody` (`_L3D_MassTune.x`, 신규) | 텍스처×(1.8,1.0,0.95) | **0.8** | 외곽 몸통 = 살 램프(FLESH-DEEP `#3a1614`→FLESH `#6a2a26`, 뿌리는 `#1f120c`→`#3a2418`)×0.8, 텍스처는 요철 정보만 |
| `SliceMassSinew` / `Bone` / `Wet` (신규) | — | **4.0 / 6.0 / 8.0** | 능선 SINEW `#8a6a52`, 뼈 끝 BONE `#c9b394`(키 라이트를 받는 면만, 그림자 인식), FLESH-WET `#b06a5c` 긴 젖은 반사(광원 색 = 키+웅덩이) |
| 외곽 보조 | — | SINEW-SHADE `#5f4c55` 저주파 얼룩(몸통이 한 덩어리 붉은색으로 안 읽히게) | 팔레트 §3 |
| 광원 12(독액) | (3430,7330) r480 `168,162,58` | **(3400,7340) r450 `152,162,52`**(색상각 ~63°) | 독액은 좌, 40~65° |
| 광원 13(진홍) | (4640,7540) r460 | **(4680,7520) r460 `176,40,28`** | 우 |
| 광원 14 | 안개광 `#7a7f8c`(3700,7750) | **진홍 (4380,7870) r300 a0.70** | C7 차가운 광원 금지, 남쪽 벽 기슭 작은 진홍 |
| 광원 15 | 어두운 독액 (4260,7770) | **a=0(꺼짐)** | 바닥 한가운데 웅덩이 제거(사이는 어둠) |
| 플레이어 블롭 | y −0.01(바닥 변위 ±1.5에 묻힘) | **y 2.2**(`SliceBlobHeight`) | 접지 그림자가 안 보였다 |
| 플레이어 실루엣 그림자 | 꺼짐 | **슬라이스에서 켬** | 슬라이스 v1 수준의 접지 그림자 |
QA 튜닝 인자(재빌드 없이): `--unity-world3d-tune=pgain,pz,pdark,pshadow,mbody,msinew,mbone,mwet,pblob=값`.

## 2. 증거
- 폴더 `E:/exoduser-wt/_out/pc-map3d-paintground-r/`: 시트 `sheet_before_after_target.jpg`(PAINTGROUND | R | 목표 START v2) + `_small.jpg`, 1x 크롭 `crop_pool-boundary_before_after.png`·`crop_mass-floor-boundary_before_after.png`·`crop_player-foot_before_after.png`(각 이전|새), 새 컷 `paintground-r_unity-slice.png`, 충돌 오버레이 `…-collision.png`, 외곽 마스크 `…-nomass.png`, `slice.json`, `unity-slice-fps.json`.
- 빌드 `E:/exoduser-wt/_out/map3d-slice/buildR3`, 캡처 `captureR3`. 체크 5/5 PASS, mass 발자국 위반 0, 풀 928·데칼 22(이전과 같음).
- 실측(CIE L\*, 768×432, 기록용 — 판정은 눈): 바닥 중앙 40% p5/p50/p95 **4.7 / 13.0 / 19.8**, L\*≥17 **16.1%**(이전 26.8), L\*≤8 12.7%, R/G 1.71. 외곽 몸통 p50 **8.4**(이전 16.9~19.3), 왼쪽 아래 8.3, p95 42.7. 화면 전체 L\*≥50 **0.42%**(이전 0.13), 플레이어 반경 400u 안 0.014%.
- FPS 30초(3592프레임): 평균 **119.709**, 최저 1초 111.961, 최저 순간 11.14, 최장 프레임 89.8ms(시작 구간 지연, 기존과 같은 패턴).

## 3. 직접 본 판정 (자가 판정, 최종 판정은 디자인총괄)
- **좋아진 것**: ① 우측 진홍 웅덩이가 풀 사이에서 읽히고 가운데는 어둡다(1x 크롭). ② 좌하단 외곽이 분홍 사암에서 젖은 검붉은 살로 바뀌었고, 바닥보다 어둡다. 능선에 상아 힘줄·뼈 끝이 밝은 꼬리를 만든다. ③ 플레이어 발밑 우하향 그림자가 다시 읽힌다.
- **아직 부족한 것**: ① 독액 웅덩이(좌)는 여전히 풀 색이 먼저 보이고 노랑이 약하다. ② 상아 빛면이 능선 위 크림색 얼룩처럼 보이는 곳이 있다(형태가 힘줄 막이 아니라 텍스처 요철을 따라감) — Meshy/GPT 외곽 에셋 교체 때 해결. ③ 긴 선 모양 젖은 반사는 외곽에만 있고 바닥 웅덩이엔 없다. ④ 풀 군락화는 이번 단위에서 건드리지 않았다(TOXIC).

## PAINTGROUND-R 재판정 반영 (디자인총괄 2026-10-27 "경미한 RETOUCH" 3항목)
원문 `E:/exoduser-wt/_out/design-reconcile/JUDGE_PAINTGROUND_20261026.md` 하단 "PAINTGROUND-R 재판정".

| # | 판정 | 반영 (전 → 후) |
|---|---|---|
| ① | 상아 빛면이 크림 얼룩·대리석 → 능선 선(2~6px)만, 젖은 반사도 선 | `Look3DMass.shader`: 면 마스크 폐기. 선 = 릴리프 법선이 키 라이트를 면 법선보다 얼마나 더 받는가(`ridge=dot(nw,K)-dot(n,K)`)의 문턱(`SliceRidgeLo/Hi` 0.30/0.50)과 그 가장자리(`fwidth`) 1~3px. 힘줄 색 `(0.78,0.68,0.55)` 상아(주황 불씨처럼 보이던 `#8a6a52` 폐기), 뼈 `(0.88,0.80,0.68)`. 힘줄/뼈 이득 4/6 → **16/20**. 젖은 반사는 줄기를 더 가늘고 길게(x/30, z/330), 이득 8 → **4** |
| ② | 독액 웅덩이(좌)가 풀에 가림 | `Life.cs PoisonPoolClearsGrass`: (3400,7340) 반경 **230 이내 풀 0**, 400까지 점점 성기게(풀 928→**780**, 다른 풀의 난수 순서 불변). 광원 15번을 독액 코어(r190, a0.55, `152,160,48`)로 사용. 광원 12는 `152,162,52` r450 유지 |
| ③ | 전체 R/G 1.90 > 1.8, 바닥 중앙 1.71 유지 | 진홍 광원 큰 것 r460/a0.95 → **r400/a0.78**, 작은 것 r300/a0.70 → **r280/a0.30**; 외곽 살 램프 붉은 채널 낮춤(`cDeep .17,.095,.085` / `cBody .30,.165,.150`)·SINEW-SHADE 얼룩 가중 0.50·몸통 G ×1.16; 바닥 톤 R **1.72 → 1.78** |

- 새 QA 인자: `rlo, rhi, shw, bg, ca13, ca14`(기존 `--unity-world3d-tune`), 바닥 톤 `--unity-world3d-ground-tone`.
- 증거 `E:/exoduser-wt/_out/pc-map3d-paintground-r/rejudge/`(시트 `sheet_before_after_target.jpg` = R 1차 | 재판정 반영 | 목표, 1x 크롭 3, `paintground-r2_unity-slice.png`, nomass, collision, slice.json, fps). 캡처는 빌드 `R9`에 `--unity-world3d-tune=rlo=0.30,rhi=0.50,msinew=16,mbone=20` + 톤 1.78을 인자로 준 것이고, 위 값은 그 뒤 코드 상수로 굳혔다(재빌드 없이; 상수와 인자가 같은 값).
- 실측(CIE L\*, 768×432, 기록용): 전체 R/G **1.77**(1차 1.90), 바닥 중앙 **1.69**(목표 1.71, ±0.02), 바닥 중앙 p50 13.2·L\*≥17 17.1%·≤8 11.6%, 외곽 몸통 p50 7.7, 전체 L\*≥50 **0.15%**(바이블 V5 0.3~1.2% **미달**). 체크 5/5, 발자국 위반 0, 풀 780. FPS 30초(빌드 R9, 3590프레임) 평균 119.64·최저 1초 110.17·최장 프레임 86.8ms.
- 직접 본 판정: 독액 웅덩이는 한눈에 읽힌다. 상아 얼룩·차가운 회색 막은 없어졌다. **남은 약점**: ① 선만 남기면 L\*≥50이 0.15%로 V5 하한 0.3%에 못 미친다(선을 늘리면 표범무늬·지도 등고선처럼 읽혀 선택하지 않음). 밝은 꼬리는 메시 교체 후 뼈 뿔·힘줄 막 실제 형태로 채우는 것이 맞다. ② 외곽 몸통이 1차보다 무광 어두운 갈색으로 읽혀 "젖은 붉은 살" 느낌이 약해졌다(R/G 상한 때문에 붉은 채널을 낮춘 대가). ③ 선이 접힌 주름 둘레를 따라 윤곽선처럼 보여 힘줄 '막'이라기보다 균열 선 같다.
