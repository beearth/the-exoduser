# PC-LINEAR1 보고 — Linear 색공간 전환 검증 (2026-10-26, 단순작업2)

검증만 했습니다. 원본 worktree·브랜치는 수정·커밋하지 않았습니다. 임시 worktree `E:/exoduser-wt/pc-linear1`(detached `b1b1d859b`, patch 12개 적용: U04B → U08×2 → U05 → A07B×2 → A13 → A14 → A20 → MAP3D_S1 → S2_0 → S2_2, Unity 6000.6.7f1, D3D12)에서만 ProjectSettings와 코드를 바꿨습니다.

## 결론 (먼저)

1. **MAP3D 보정 상수(ambient ×1.44·key ×1.525)의 원인은 색공간이 아니다.** 보정을 끈 상태로 Linear 빌드를 Godot D와 비교하면 Gamma 빌드(보정 없음)와 거의 같고(보고서 좌표 크롭 3곳 평균 절대 색차이 6.66 vs 6.86), Gamma + 보정(2.59)보다 멀다. MAP3D 셰이더(`Look3DLit`, `Look3DPost`)가 이미 `UNITY_COLORSPACE_GAMMA` 분기로 Godot식 선형 계산을 직접 하고 있어서, 프로젝트 색공간을 Linear로 바꿔도 결과가 같다(같은 장면 Gamma↔Linear 평균 차이 0.34~0.42). 밝기 차이의 원인은 Godot 쪽에서 찾아야 한다. "Linear로 바꾸면 보정이 필요 없다"는 기대는 맞지 않았다.
2. **Linear 전환은 UI에서 실제로 색을 깨뜨리고, 고칠 수 있다.** 그냥 전환하면 HUD 구슬이 허옇게 뜨고 슬롯바가 어둡게 변한다(영역 평균 차이 10~15, p95 50~70). 원인 두 곳을 파일 2개에 시험 적용하자 영역 평균 차이가 1.1~1.5로 내려갔다. 인벤토리·스킬 패널은 별도 수정 없이 자동으로 거의 같다(평균 0.2~0.4). 남는 차이는 IMGUI 글자(안티앨리어싱)와 가산 블렌드 효과다.
3. **웹 원본과의 거리는 Gamma나 Linear나 같다**(HUD/인벤토리/스킬 전체 평균 차이 17.9 vs 18.4, 7.33 vs 7.37, 5.51 vs 5.64 — 장면 내용 차이가 지배). 웹 일치를 위해 Linear로 갈 이유는 없고, Linear의 이득은 MAP3D·PBR 계열 확장 쪽이다.
4. **발견한 함정**: `Assets/Exoduser/Editor/PortVerification.cs:133`이 빌드할 때마다 `PlayerSettings.colorSpace=ColorSpace.Gamma`를 강제하고 `ProjectSettings.asset`에도 다시 쓴다. `m_ActiveColorSpace`만 1로 바꾼 첫 "Linear" 빌드가 사실은 Gamma였다(캡처 receipt `colorSpace: Gamma`로 발견, 폐기). 전환할 때 이 줄도 같이 바꿔야 한다.

권고: **조건부 전환 가능**. 전환 시 PC/Codex 작업 순서는 아래 §5.

## 1. 측정 환경

| 항목 | 값 |
|---|---|
| 빌드 | Gamma 1회(`gamma/build`), Linear 1회(`linear/build`), 같은 커밋·같은 patch, 둘 다 errors 0. Linear 쪽은 `m_ActiveColorSpace=1` + PortVerification 줄 수정(임시 worktree) |
| 실험 빌드 | Linear + 시험 수정 A·B(`linear_ab/build`), errors 0 |
| 폐기 | `linear_failed_gamma_dup/` — PortVerification이 Gamma로 되돌린 빌드(참고용 보존) |
| 캡처 | 1920×1080 창, (5120,0) NOACTIVATE, 240초 제한, 같은 스모크를 세 빌드에 동일 인자로 실행(HUD `--unity-hud-smoke`, 인벤토리 `--unity-inventory-smoke`, 스킬 `--unity-skill-smoke`, KiSlash `--unity-smoke`, MAP3D `--unity-world3d-capture`) |
| 측정 | `diff_all.py`: 픽셀별 RGB 절대차의 채널 평균 → 평균/p95/최대(0~255). 결과 `ui_diff.json` |
| MAP3D | `-nomass`(Godot D가 mass 3/51만 만든 점을 같은 조건으로), 크롭 3곳 = `player-contact (800,440,1120,696)`, `living-tree (160,320,544,704)`, `skin-ground (1120,560,1504,816)` (MAP3D S2 보고서 좌표) |

## 2. UI — Gamma vs Linear (같은 장면)

"전체" 평균은 화면 대부분이 같아 작게 나온다. 영역(구슬·슬롯바)과 글자(밝기 170 초과 픽셀)에서 차이가 드러난다. 괄호는 평균/p95/최대.

| 장면 | 전체 (Linear) | 구슬 좌 | 구슬 우 | 슬롯바 | 글자 | 전체 (Linear+시험수정) | 구슬 좌 | 구슬 우 | 슬롯바 |
|---|---|---|---|---|---|---|---|---|---|
| HUD full | 1.17/1.3/77 | 15.3/62/63 | 15.2/68/70 | 9.9/52/77 | 23.8 | **0.35**/1.0/69 | **1.2**/3.3/48 | **1.1**/3.3/62 | **1.5**/3.3/69 |
| HUD partial | 1.07/1.3/77 | 12.9 | 12.7 | 9.6 | 24.2 | 0.36 | — | — | — |
| HUD empty | 0.96/1.3/77 | 10.5 | 9.7 | 9.3 | 26.7 | 0.38 | — | — | — |
| 스킬 화면 1080p | 0.35/1.3/68 | (패널 0.23) | | | 4.0 | 같음(수정 대상 아님) | | | |
| 스킬 720p LMB | 0.87/2.7/68 | | | | 5.3 | 같음 | | | |
| 인벤토리 default | 0.60/1.3/73 | (패널 0.43) | | | 16.4 | 같음 | | | |
| 인벤토리 equipment | 0.51/1.0/73 | (패널 0.35) | | | 14.6 | 같음 | | | |
| 인벤토리 bag | 0.50/1.0/73 | (패널 0.35) | | | 14.3 | 같음 | | | |
| HUD + 기검참 차지(720p) | 1.22/1.7/81 | | | | 21.4 | 0.43/1.0/167 | | | |
| 기검참 charge | 1.26/1.7/114 | | | | 23.8 | 0.46/1.3/196 | | | |
| 기검참 release | 2.18/12.7/88 | | | | 14.7 | 1.37/6.3/88 | | | |
| 기검참 impact | 1.23/2.0/70 | | | | 17.3 | 0.41/1.3/67 | | | |

해석:
- **HudOrb(구슬)**: `HudOrb.shader`가 웹 sRGB 값을 그대로 `Graphics.Blit`로 sRGB RenderTexture에 쓴다. Linear에서는 그 값이 선형으로 취급돼 한 번 더 인코딩되어 허옇게 보인다(스크린샷: `cmp/hud_dock_crop1x.jpg`).
- **슬롯바**: `NativeHud.BuildLabelCleanBar()`가 RT→`ReadPixels`로 만든 런타임 `Texture2D`(sRGB 취급)가 Linear에서 이중 디코드되어 어두워진다(같은 스크린샷).
- **인벤토리·스킬 패널**: 임포트한 PNG는 Unity가 sRGB 디코드→선형 블렌드→sRGB 인코드를 자동 처리해 그대로다.
- **글자 영역 차이(평균 14~27)**: IMGUI 글자는 안티앨리어싱 coverage를 선형 공간에서 섞어서 밝은 글자가 어두운 바탕에서 **얇고 흐리게** 보인다(Gamma 대비). 인벤토리 글자 2배 확대에서 확인(우측 Linear가 더 가늘고 어두움). 이번 시험 수정으로는 해결되지 않았다.
- **기검참 release의 차이(평균 9.7 중심 영역)**: 두 빌드의 슬래시 프레임 타이밍이 달라 모양이 조금 다르다(스모크가 실시간 기반). 색 차이가 아니라 애니메이션 위상 차이로 보이며, 흰 가산 블렌드가 포화돼 색은 거의 같다. 가산 블렌드(KiSlashAdditive의 `Blend One One`)는 선형에서 더해지므로 밝은 영역 가장자리가 웹(감마 합성)과 다르게 보일 수 있다. 이번에는 시각 차이를 확인하지 못했다.

## 3. UI — 웹 원본과의 차이 (Gamma vs Linear 각각)

| 장면(웹 기준) | 구분 | Gamma | Linear | Linear+시험수정 |
|---|---|---|---|---|
| `11_field_hud` | 전체 평균/p95 | 17.9/41.0 | 18.4/42.7 | 18.0/41.3 |
| | 구슬 좌 | 33.0/108 | 41.5/117 | 33.7/109 |
| | 구슬 우 | 42.1/110 | 50.4/136 | 42.3/110 |
| | 슬롯바 | 28.0/99.7 | 28.2/93.3 | 27.5/95.0 |
| `inventory` | 전체 | 7.33/30.3 | 7.37/31.0 | 7.37/31.0 |
| `web_skill_3d` | 전체 | 5.51/27.7 | 5.64/28.0 | 5.64/28.0 |

장면 내용(월드·값·무작위 롤)이 달라 웹 대비 절대값은 크지만, Gamma와 시험 수정 Linear의 차이는 구슬 ±1 이내. 즉 **수정하면 Linear도 Gamma만큼 웹에 가깝다**. 수정 전 Linear는 구슬에서 8~9 더 멀다.

## 4. MAP3D — 보정 끈 상태로 Godot D와 비교

Godot D 대비 평균 절대 색차이(0~255), `-nomass`:

| 빌드 | 보정 | player-contact | living-tree | skin-ground | 평균(3곳) | 전체 |
|---|---|---|---|---|---|---|
| Gamma | 있음(기본) | 2.22 | 3.04 | 2.50 | **2.59** | 5.09 |
| Gamma | 없음 | 7.42 | 6.08 | 7.09 | 6.86 | 8.80 |
| Linear | 있음 | 2.39 | 3.31 | 2.63 | 2.78 | 5.21 |
| Linear | **없음** | 7.16 | 6.02 | 6.81 | **6.66** | 8.59 |

평균 색(R,G,B): Godot D skin-ground (41.2, 31.6, 26.6) / Gamma+보정 (41.2, 33.1, 28.6) / Gamma 보정없음 (31.8, 25.2, 21.6) / Linear 보정없음 (32.2, 25.5, 21.9). 같은 장면 Gamma↔Linear 평균 차이 0.34(보정 없음)~0.42(보정). 사전 예상("Linear + 보정 없음이 Gamma + 보정과 비슷하거나 더 가까움")은 **틀렸다**.

이유: `Look3DLit`/`Look3DPost`가 입력을 선형으로 디코드해 직접 조명을 계산하고 `UNITY_COLORSPACE_GAMMA`일 때만 출력을 sRGB로 직접 인코드한다. Linear에서는 프레임버퍼가 인코드하므로 두 경로는 수학적으로 같다. 따라서 보정 상수는 **여전히 Godot와의 미확인 차이**(밝기 ×1.44/×1.525)이며 색공간 전환으로 사라지지 않는다. 보정은 유지해야 한다.

비교 이미지: `cmp/map3d_godotD_gammaCal_linearPlain.jpg`(Godot D | Gamma+보정 | Linear 무보정), 크롭 `cmp/map3d_crop_player-contact|living-tree|skin-ground.jpg`(Godot D | Gamma+보정 | Gamma 무보정 | Linear 무보정).

## 5. UI 색 보정 방법 3가지 시험 결과

시험 diff: `experiments_AB_and_buildscript.patch`(임시 worktree에서만, 원본 미반영).

| 방법 | 시험 위치 | 결과 | 비고 |
|---|---|---|---|
| (a) 셰이더 하드코드 색 sRGB→linear | `Resources/Shaders/HudOrb.shader`: 반환 색 4곳에 `GammaToLinearSpace`(Gamma일 땐 그대로, `UNITY_COLORSPACE_GAMMA` 분기) | 구슬 좌/우 평균 15.3/15.2 → **1.2/1.1**, p95 62→3.3 | 효과 확실. 같은 문제가 `KiSlashInk`·`KiSlashAdditive`·`Look3DBlob`·`Look3DOverlay`에 있을 수 있음(미시험) |
| (b) 런타임 텍스처·RT sRGB 플래그 | `Runtime/NativeHud.cs` `BuildLabelCleanBar`: `new Texture2D(…, linear: activeColorSpace==Linear)` 1곳 | 슬롯바 평균 9.9 → **1.5**, p95 52→3.3 | 임포트 sRGB 플래그는 건드리지 않음(PNG는 자동 정상). 같은 패턴(런타임 생성 텍스처·ReadPixels)은 `NativeHudPresentation.cs`, `NativeInventoryWebLayout.cs` 등에 있음 |
| (c) IMGUI 자동 처리 범위 | 코드 변경 없음(측정만) | 임포트 PNG·GUI.color 계열은 자동으로 정상(인벤토리·스킬 패널 평균 0.2~0.4). **글자**는 선형 블렌드로 얇아지고(글자 영역 평균 14~27), 이 차이는 IMGUI 안에서 고치기 어렵다 | 글자는 폰트 두께·알파 보정을 글자별로 하거나 다른 글자 시스템을 써야 함 |

시험 수정으로 HUD 전체 평균 1.17 → 0.35(전체 평균 기준 70% 감소). 남은 최대 69는 구슬 테두리·슬롯 라벨 글자 가장자리.

## 6. FieldLighting·로비

- **FieldLighting(2D 경로 조명)**: 이 커밋에 `NativeFieldLighting`이 없다(`codex/unity-map-light-01` 미병합) → **대상 없음**. 병합되면 `saturate(l.w*.85)` 조명 스탬프가 Linear에서 어떻게 보이는지 다시 재야 한다(CPU 색 스탬프 텍스처의 sRGB 플래그와 가산 합성이 위험 요소).
- **로비·시작 화면·영상(`NativeLobbyVideo` RT)**: 이번 측정 범위 밖(미측정). 영상 텍스처의 sRGB 처리와 로비 UI가 Linear에서 같은지 별도 확인이 필요.

## 7. 전환 시 필요한 작업과 순서 (추정)

규모 추정: 셰이더 7개 중 `UNITY_COLORSPACE_GAMMA` 분기가 없는 것 4개(KiSlashAdditive, KiSlashInk, Look3DBlob, Look3DOverlay), 런타임 `new Texture2D(` 파일 15개, RT/ReadPixels 파일 6개, `GUI.color` 사용 파일 22개(자동 처리라 대부분 무수정 예상). 직접 고칠 곳은 대략 셰이더 4~5개 + 런타임 텍스처 생성 5~8곳 + `PortVerification` 1줄 = **파일 10~15개, 줄 수 수십 줄** 수준.

1. (Codex 동의 후) `ProjectSettings.asset` `m_ActiveColorSpace: 1` + `PortVerification.cs:133`을 `Linear`로. **같은 커밋에서 같이.**
2. HudOrb `GammaToLinearSpace`·NativeHud 런타임 텍스처 linear 플래그(이번 시험 diff 그대로 사용 가능).
3. 나머지 셰이더 4개(KiSlash 2종, Look3DBlob/Overlay) 색 상수와 가산 블렌드 확인, 런타임 텍스처 생성부(`NativeHudPresentation`, `NativeInventoryWebLayout` 등) 점검.
4. 로비·영상·FieldLighting 병합 후 재측정, 회귀 스모크 전체(`verify-*`, 캡처 비교).
5. IMGUI 글자 얇아짐은 허용 범위인지 디자인 판정(인벤토리·HUD 글자 가독성).
6. MAP3D 보정 상수는 유지(`SetCalibration(true)`).

## 8. 위험

- **글자 외관 변화**: IMGUI 글자가 전체적으로 얇고 흐려진다(HUD·인벤토리 모두). 시험으로 막지 못함 — 가독성 결정 필요.
- **수정 누락 위험**: 셰이더·런타임 텍스처 중 이번에 안 본 곳은 Gamma에서만 맞을 수 있다. 전환 커밋 전에 장면별 diff를 다시 돌려야 한다.
- **가산 블렌드**: 선형 가산이라 웹(감마 합성)과 밝은 가장자리가 다를 수 있다.
- **영상·로비·FieldLighting 미측정**.
- 전환 효과는 MAP3D 보정 근거를 해결하지 못하므로, "전환 = 보정 제거" 기대로 일정을 잡으면 안 된다.

## 9. 산출물

- `E:/exoduser-wt/_out/pc-linear1/REPORT.md`(이 문서), `ui_diff.json`(전 수치), `experiments_AB_and_buildscript.patch`
- 캡처: `gamma|linear|linear_ab/caps/{hud,inv,skill,ki,w3d}/`, 폐기 빌드 `linear_failed_gamma_dup/`
- 비교 이미지 `cmp/`: `hud_full|inventory_default|skill_1080p_web_gamma_linear.jpg`(웹 | Gamma | Linear | Linear+수정), `hud_dock_crop1x.jpg`, `kislash_release_gamma_linear.jpg`, `map3d_godotD_gammaCal_linearPlain.jpg`, `map3d_crop_*.jpg`(`_tmp_*.png` 두 개는 작업 중 임시 파일, 무시)
- 스크립트: `cap_all.ps1`, `diff_all.py`, `make_cmp.py`
