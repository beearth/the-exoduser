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
