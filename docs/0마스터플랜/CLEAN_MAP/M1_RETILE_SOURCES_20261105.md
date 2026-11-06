# M1 재작업 절차서 — 타일 반복·회색 지면 (출처 조사, 미적용)

상태: 조사만 했다. 코드 변경 0. Mac 판정(`claude/unity-mac-clean-map-20261105` @c535b6513)의 RETOUCH 후속이다.

**단계(CTO 지시, 한 번에 하나):**

- **M1a (워크트리 적용, 컴파일 확인 후 Mac 3x 판정 대기):** `HellGroundPBR.shader` `_A2_CLEAN_GROUND`만 변경. ① 타일 2.0u → 2.78u(3.2m÷1.152m/u) ② 틴트 (.55,.48,.36) 제거. 주광·노출은 바꾸지 않는다(M2 몫). 틴트를 뺀 원본도 표본 픽셀의 파랑 19.6%, 초록 1.8%, 빨강 0.13%가 sRGB 50 미만이다(PC 측정, 16번째 픽셀 표본). 평균은 (106,90,68). 스캔 원본 그대로이며 더 올리는 값은 출처가 없어 넣지 않았다.
- **M1b (M1a에서 반복이 여전히 보일 때만):** 아래 §1 헥스 타일링. 들어갈 때 MIT 라이선스 줄 기록, PC 프로파일 1회.

순서는 M1 → 얼룩 → M2 → M5를 유지한다. 웹 빌드는 별도로 3D 경로 전환 중이다(`WEB_BUILD/WEBGL_SIZE_TARGETS_20261105.md` §4).

표기: [원문] 원문 텍스트 확인, [요약] 페이지 요약·검색 요약으로 확인, [미검증] 원문 확인 실패, [계산]·[추론]은 출처가 아니다. 조사는 서브에이전트가 했고 원문 재대조는 하지 않았다.

## 1. 권장 절차: Mikkelsen 2022 헥스 타일링

출처: JCGT 11(2), https://jcgt.org/published/0011/03/05/paper-lowres.pdf [원문, PDF 추출]. 코드 https://github.com/mmikk/hextile-demo (MIT) [요약].

1. `st`를 2√3배하고 skew해 삼각 격자, 무게중심 w1~w3, 정점 ID를 구한다.
2. 정점마다 해시 오프셋과 선택적 회전을 준다.
3. 원본을 `SampleGrad`로 3회 샘플한다. 미분도 회전에 맞춰 변환한다.
4. `W = Dw * pow(w, g_exp)` 후 정규화한다. 색상 Dw는 휘도 기반이다.
5. 색상은 `Gain3(W, r)`을 거쳐 블렌드한다.
6. 노멀은 편미분으로 바꿔 샘플별로 되돌려 회전한 뒤 블렌드하고 `normalize(float3(-deriv.xy, 1))`로 복원한다.

출처가 있는 시작값(논문): `g_exp` 7, `g_fallOffContrast` 0.6, albedo·roughness `r` 0.75(범위 0.65~0.75), 노멀 `r` 0.5.

고른 이유: 반복 자체를 겨냥하고, 사전계산·추가 텍스처가 없으며, 코드가 HLSL이다. 다른 후보의 판단:

- 대주기 매크로: 반복을 가리는 방식이다 [추론]. 출시작 글 rFactor 2 https://www.studio-397.com/wp-content/uploads/2016/12/rF2_Terrain_Shader.pdf [원문], Marble It Up! https://marbleitup.com/2019/06/21/i-can-see-for-tiles-and-tiles/ [요약]. 지면용 수치는 공식 출처를 못 찾았다. 큰 면적이 단조로우면 다음 단계로 검토한다.
- 디테일 맵: 문서상 목적이 근접 선명도이고 반복 해법이 아니다. https://docs.unity.com/en-us/engine/current/manual/materials-and-shaders/built-in/shader-built-in-configure-properties/standard-shader-texture-maps/material-parameter-detail [요약].
- Heitz & Neyret 2018: T·T⁻¹ 중간 텍스처가 필요하고 Unity Labs 구현은 아카이브됐다. https://github.com/UnityLabs/procedural-stochastic-texturing [요약]. 논문 본문 [미검증].

한계와 비용:

- 회색 문제는 해결하지 못하고, 블렌드 대비 손실로 나빠질 수 있다 [추론]. `r`로 관리한다.
- 맵 3장이면 9회 샘플로 기존의 3배다 [계산]. Unity 문서의 WebGPU 텍스처 접근 한도 16개 https://docs.unity.com/en-us/engine/6000.3/manual/platform-specific/webgl/develop/graphics/web-gpu/limitations [요약]와 프레임 시간을 재야 한다.
- Unity Web에서 돌린 사례는 못 찾았다. 사양상 가능(GLSL ES 3.00 `textureGrad` [원문], WGSL `textureSampleGrad` [요약]) 수준이다.

## 2. 타일 주기

`forest_ground_04` 폭 3.2m(https://polyhaven.com/a/forest_ground_04 [요약]). 현재 M1은 2.0u이고 1u≈1.152m(M3 문서)라 2.3m로, 실척보다 약 1.39배 촘촘하다 [계산]. 실척은 약 2.78u다 [계산]. 게임에서의 적합성은 캡처로 정한다.

## 3. 회색 지면 — 프로젝트 사실

| 항목 | 값 | 위치 |
|---|---|---|
| 색공간 | Linear | `ProjectSettings.asset` `m_ActiveColorSpace: 1` |
| 알베도 임포트 | sRGB 켬, 1024² | `A2_ForestSoil_BaseColor.jpg.meta` |
| 원본 평균 | sRGB (106,90,68) | PC 측정(64² 축소 평균) |
| 틴트 후 평균 | sRGB 약 (80,62,39) | 셰이더 `half3(.55,.48,.36)`을 Linear에서 곱한 [계산], 평균색 기준 |
| 주광 | A2 2.4, 색 (1,.96,.90), 그림자 .65 / HellLighting 1.0, 색 (.85,.89,1) | `NativeGame.A2Forest.cs:144`, `NativeGame.HellLighting.cs:38` |
| 노출 | postExposure .55(A2Field) / .25(A2Forest·HellLighting), contrast 16, HellLighting saturation -8 | `NativeGame.A2Field.cs:49`, `NativeGame.A2Forest.cs:34`, `NativeGame.HellLighting.cs:29` |

- 최종 값은 호출 순서에 달려 있어 코드만으로 확정하지 않았다. `--a2-debug-ground` 로그와 Mac 촬영으로 확인한다.
- 비교 범위: Adobe PBR Guide Part 2 어두운 쪽 30~50 sRGB, 밝은 쪽 240 이하 https://www.adobe.com/learn/substance-3d-designer/web/the-pbr-guide-part-2 [요약]. Unity·DONTNOD 비금속 50~243 https://docs.unity3d.com/2020.1/Documentation/Manual/MaterialValidator.html [요약, Unity 6판 미검증]. 틴트 후 파랑 평균 39는 엄격한 하한 50 아래다. **틴트가 원본을 크게 어둡게 만드는 것은 확인된 사실이지만, 이것이 "회색"의 원인이라는 진단은 아니다.**
- 숲 흙의 목표 평균 albedo와 틴트 양은 출처가 없다. 임의 수치를 넣지 않고 캡처로 정한다.
- 매뉴얼 대조(초안, `origin/claude/unity-cloud-manual-draft-20261105`, unity/main 미병합): `MANUAL/02_light_fog_grade.md`에 지면 알베도·타일 수치가 없어 M1a와 수치 충돌은 없다. 다만 02의 "바탕은 좁은 색역"(:38, [추정])과 틴트 제거가 방향상 부딪힐 수 있어 Mac 판정에서 본다. `MANUAL/01_world_map.md:37~38`의 반복 기준(한 화면 같은 무늬 3번 미만, 저주파 ×0.92~1.08, 20~30m 큰 얼룩)은 [추정]·미검증이며 M1b 이후 판정 기준 후보다.

## 4. 라이선스

- Poly Haven 전 자산 CC0, 표시 불필요. https://polyhaven.com/license [요약]. 자산: `forest_ground_04`.
- 대체 후보 ambientCG CC0 1.0 https://docs.ambientcg.com/license/ [요약], Ground 037 https://ambientcg.com/view?id=Ground037 [요약]. 이끼 낀 녹색 지면이라 흙의 직접 대체는 아닐 수 있다 [추론].

## 5. 출처가 없어 캡처로 정할 값

월드 타일 주기, 헥스 크기, 회전 강도, 현재 카메라의 최종 `r`, 목표 평균 albedo, 틴트 양·색조, Web 프레임 비용, "반복이 안 보인다"의 판정 기준.

## 6. 못 찾은 것

AAA·GDC의 지형 타일링 자료, Epic 공식 문서, DONTNOD 흙 값(차트가 이미지), Burley 2019 본문. Core RP·URP 소스는 master 기준이라 6000.0 일치는 [미검증].
