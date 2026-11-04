# Unity 6000 URP 다크판타지 분위기 기법 카탈로그

조사일: 2026-11-05 KST. 대상은 사용자 지정 **Unity 6000.6.7f1 / URP / 원근 카메라 피치 34° / 먼 적 식별 필수**다. 이 문서는 연구 결과이며 구현·도입 승인이나 실게임 품질 판정이 아니다.

## 1. 읽는 기준과 버전 경계

- **[사실]** 6000.6.7f1 공식 릴리스 페이지와 6000.6 매뉴얼을 확인했다. 에디터 패치 번호와 개별 UPM 패키지 버전은 구분해야 한다. 이 연구에서는 대상 프로젝트의 설치 패키지·Renderer Asset·GPU·해상도·월드 단위를 확인하지 않았으므로 실제 값은 **미확인**이다. [에디터 릴리스][U01], [URP Asset 설정 항목][U02]
- **[사실]** 아래 `[사실]`은 연결한 공식 문서·저자 원문에서 확인되는 내용이다. 서드파티의 지원·성능 설명은 **제작사/저장소의 설명이라는 사실**이며 이 프로젝트에서의 동작 보증이 아니다. 아래 `[추정]`은 그 자료에 근거한 적용안·계산·시험 설계다. [Unity 기능 비교][U03], [Kronnect 제품 안내][P01], [오픈소스 README][P06]
- **[사실]** Unity 6.4에서 URP 커스텀 패스용 Compatibility Mode가 제거됐다. 따라서 6000.6 연구에 “Render Graph를 끄고 구형 패스를 사용한다”는 해결책을 적용하면 안 된다. [Unity 6.4 변경 사항][U04]
- **[사실]** 공식 6000.6 문서가 설명하는 처리 순서와 GitHub `master` 소스의 세부 구현은 증거 범위가 다르다. 아래 `master` 분석은 공개 소스 관찰이며 **6000.6.7f1 설치 패키지와의 일치 여부는 미확인**이다. 특히 미래 기능이 포함될 수 있으므로 이 소스만으로 대상 버전의 기능을 확정하지 않는다. [6000.6 색 보정 설정][U02], [공개 색 보정 소스][S01]
- **[추정]** 작업 우선순위는 **배경 라이트맵·이동체 APV → 적의 명암 분리 → 거리/높이 안개 → 제한된 광선 → 최종 색 보정**으로 둔다. 전역 노출을 내리기보다 배경의 어두운 면과 국소 조명을 설계하는 편이 먼 적 보존 목표에 적합하다. 이는 이 프로젝트용 제작 제안이며 확인된 완성 프리셋은 아니다. [간접광 저장 방식][U11], [APV 개요][U07], [톤 매핑 특성][U15]

### 기능 경계 요약

| 기법 | 확인된 기능과 역할 | 대상 적용 판단 |
|---|---|---|
| 내장 거리 안개 | **[사실]** Linear / Exponential / Exponential Squared 지원. [U03] | **[추정]** 먼 전투 영역을 덮기 전까지 약하게 사용. [U05] |
| 높이 안개 | **[사실]** URP의 내장 거리 안개와 HDRP의 Local Volumetrics는 다르다. 깊이로 월드 좌표를 복원하는 URP 예제는 제공된다. [U03][U06] | **[추정]** 커스텀 높이 합성 또는 호환 플러그인으로 분리 조사. [U06][P01] |
| 내장 볼류메트릭 | **[사실]** 6000.6 URP는 볼류메트릭 안개를 지원하지 않으며 커스텀/서드파티가 필요하다. [U16] | **[사실]** 내장 Volume의 Fog Override를 켜는 절차는 제시할 수 없음. [U16] |
| APV | **[사실]** 프로브 자동 배치와 픽셀 단위 조명을 제공한다. [U07] | **[추정]** 이동 적의 간접광 연결에 우선 검토. [U08] |
| 라이트맵 | **[사실]** 정적 표면의 미리 계산한 조명을 텍스처로 저장한다. [U10][U11] | **[추정]** 고목·벽·지면의 큰 명암을 먼저 고정. [U10] |
| 쿠키 / 림 | **[사실]** 쿠키는 조명 패턴 투사, Fresnel은 노멀과 시선 관계로 만든 효과다. [U12][U13] | **[추정]** 배경 패턴과 적 윤곽 보조를 별도로 제어. [U12][U13] |
| LUT | **[사실]** 내부 색 보정 LUT와 Color Lookup의 사용자 LUT를 구분해야 한다. [U02][U14] | **[추정]** 조명 확정 후 색감을 조율하며 검은 적의 정보 손실을 확인. [U15] |

## 2. 내장 거리 안개 — 가장 작은 구성의 깊이 분리

### 설정 절차

1. **[사실]** `Window > Rendering > Lighting > Environment`의 Fog를 켜고 Color와 Fog Mode를 설정한다. Linear는 Start/End, 지수 계열은 Density로 조정한다. End는 장면 물체를 완전히 가리는 거리이므로 전투 가시 거리와 구별한다. [Lighting 창][U05]
2. **[추정]** 최초 비교는 Linear로 시작한다. Start를 카메라에서 가까운 지면까지의 거리로 임의 지정하지 말고, 실제 플레이 카메라의 원거리 적 위치와 함께 기록한다. 관찰할 대상은 지면의 깊이감, 적의 몸통, 발밑 예고다. [거리 안개 정의][U05], [화면 투영 API][U19]
3. **[추정]** 붉은 갈색·저채도 회색 등 장면 팔레트와 연결한 안개색을 시험하되, 전역 색 필터와 동시에 변경하지 않는다. 이 색상 선택은 다크판타지 미술 제안이며 확정 RGB/HEX는 **미확인**이다. [Fog Color][U05], [Color Filter][U17]

### 수치와 비용

| 항목 | 수치 / 상태 | 해석 |
|---|---|---|
| Linear Start / End | **[사실]** 카메라 거리로 정의되는 설정. 프로젝트 적정 거리: **미확인**. [U05] | **[추정]** 먼 적이 있는 위치를 End로 쓰지 않는다. [U05] |
| 지수 Density | **[사실]** 밀도가 커질수록 안개가 짙어진다. 프로젝트 적정값: **미확인**. [U05] | **[추정]** 다른 구현의 물리 소멸계수를 이 필드에 그대로 넣지 않는다. [U05][T01] |
| GPU/CPU ms, FPS | **미확인** | **[추정]** 별도 레이마칭보다 계산 구조가 단순할 가능성은 있지만, 렌더 경로·셰이더에 따라 달라 실측 전 비용 순위를 확정하지 않는다. [U03][P06] |

- **[추정]** Linear 안개의 개념 모델을 `T = saturate((End − d)/(End − Start))`로 두면, 목표 적 위치 `d`에서 보존할 투과율로 End를 역산할 수 있다. 예를 들어 **설계자가 선택한** `Start=20`, `d=40`, `T=0.8`이면 `End=120`이다. 이는 정의에서 유도한 계산 예이며 프로젝트 권장 거리나 URP 셰이더의 정확한 깊이 좌표 구현을 확인한 값이 아니다. [Linear 정의][U05]
- **[사실]** 공통 Lighting 창 문서에는 Deferred에서 안개가 불가하다는 주석이 있지만, URP 기능표는 거리 안개를 지원한다고 표기한다. 이 공통 주석을 근거로 모든 URP Deferred/Deferred+의 지원 여부를 단정하지 않는다. **대상 Renderer 경로별 결과는 미확인**이다. [Lighting 창 주석][U05], [URP 기능표][U03]

## 3. 높이 안개 — 월드 높이, 광선 경로, 투명 오브젝트를 구별

### 방식 A: 깊이 복원 기반의 화면 합성

1. **[사실]** URP 공식 예제는 Depth Texture를 활성화하고 `SampleSceneDepth`, `ComputeWorldSpacePosition`, 역 View-Projection 행렬로 월드 좌표를 복원한다. reversed-Z와 그래픽 API의 깊이 범위를 고려한다. [월드 좌표 복원][U06]
2. **[추정]** 커스텀 Full Screen Pass에서 카메라 색과 복원 좌표를 읽어, 기준 높이 `y0` 아래/주변에 안개 가중치를 둔다. 간단한 `1−smoothstep(y0,y1,worldY)`는 표면 위치 기반의 미술용 근사이며 **시선 경로 전체를 통과한 높이 안개의 물리 적분은 아니다**. [복원 예제][U06], [투과율 적분][T01]
3. **[사실]** Full Screen Pass의 `Before Rendering Transparents`는 투명 물체 이전, `Before Rendering Post Processing`은 투명 물체 이후·후처리 이전이다. `Requirements: Depth`와 현재 카메라 색을 읽는 `Fetch Color Buffer`를 구별한다. `Requirements: Color`의 opaque 텍스처는 현재 색 버퍼와 동일하지 않다. [Full Screen Pass][U18]
4. **[추정]** 최초 검토안은 안개를 색 보정 이전에 합성하는 것이다. 투명 물체 전이라면 이후에 그려지는 물·입자·캐릭터 표현에 별도 안개 처리가 필요한지 확인한다. 투명 물체 후라도 깊이에 없는 물체의 높이를 올바르게 계산한다고 보장할 수 없다. [삽입 지점][U18], [투명체 깊이 문제][P04]

### 방식 B: 시선 경로를 적분하는 높이 매질

- **[사실]** 매질 투과율은 광선 경로의 소멸계수 적분으로 정의되며, 균일 매질에서는 Beer 법칙으로 단순해진다. [PBRT 4판][T01]
- **[추정]** 높이에 따른 소멸계수를 `σt(y)=σ0·exp(−k·(y−y0))`로 설계할 경우 `T=exp(−∫σt ds)`를 계산하는 방식이 가능하다. 지면 아래의 발산을 막는 클램프와 수평 광선의 안정적인 극한 처리도 설계해야 한다. 이 식은 연구용 매질 모델이며 Unity 내장 설정식이라고 주장하지 않는다. [투과율 원리][T01]
- **[추정]** 34°는 중앙 시선의 피치일 뿐이다. 원근 화면의 위쪽 픽셀은 중앙 광선보다 얕은 각도로 낮은 안개층을 오래 통과할 수 있다. 먼 적 머리가 안개층 위에 있더라도 카메라부터 적까지의 광선이 층을 통과할 수 있으므로, 표면 높이만으로 적 가독성을 판단하면 안 된다. [원근 절두체][U20], [경로 투과율][T01]

### 수치와 비용

| 항목 | 확인한 값 / 미확인 | 비용과 적용 |
|---|---|---|
| `y0`, `y1`, `σ0`, `k` | **미확인** — 지면 고도·캐릭터 크기·월드 단위 필요 | **[추정]** 절대 고도형은 언덕에서 두께가 달라진다. 지면 상대 높이는 추가 지형 정보가 필요하다. [U06][T01] |
| 균일 매질 계산 예 | **[추정·계산]** 설계 목표 `T≥0.7`, 경로 길이 30m라면 `σt≤−ln(0.7)/30≈0.0119m⁻¹`. 실측·권장값이 아니다. [T01] | **[추정]** 플러그인 Density 필드가 같은 단위인지 확인하기 전에는 대입하지 않는다. [P03] |
| 화면 픽셀 수 | **[추정·계산]** 1920×1080은 2,073,600, 3840×1080은 4,147,200 픽셀 | **[추정]** 같은 픽셀 셰이더면 후자는 처리 픽셀 수가 2배다. 실제 GPU 시간 2배를 뜻하지 않는다. [U18] |
| 렌더 비용 | **미확인** — ms·메모리·추가 패스 수 실측 없음 | **[사실]** Depth/Normal/Motion 등의 Requirements는 추가 패스를 요청할 수 있다. 필요한 입력만 선택한다. [U18] |

- **[추정]** 이 프로젝트에서는 전투 통로를 비우고 늪·화면 양옆·배경에 밀도를 모으는 적용안을 먼저 비교한다. 적 픽셀만 안개에서 제외하면 배경과의 연결이 끊겨 보일 수 있으므로 최종 합성에서 몸통·발·그림자를 함께 검토한다. [국소 안개/프로파일 기능][P01][P03]

## 4. 볼류메트릭 — 내장 부재와 서드파티 선택

### 4.1 URP 내장으로 가능한 범위

- **[사실]** 6000.6 URP에는 HDRP식 Local Volumetrics와 Fog Scattering가 없다. APV의 Volume, 후처리 Volume, 볼류메트릭 안개는 서로 다른 기능이다. APV를 켠다고 공기 중 광선이 자동 생성되지 않는다. [파이프라인 기능 비교][U03], [APV 개요][U07], [URP 마이그레이션 문서][U16]
- **[사실]** 따라서 내장 볼류메트릭 안개만의 설정 절차·품질 수치·성능 수치는 **해당 없음**이다. 거리 안개는 §2, 커스텀 높이 안개는 §3, 실제 레이마칭 후보는 아래와 같이 분리한다. [URP 마이그레이션 문서][U16]

### 4.2 Kronnect Volumetric Fog & Mist 2 — 넓은 국소 매질 후보

1. **[사실·제작사 안내]** 제품 페이지는 Unity 6, Render Graph, URP Forward/Forward+/Deferred를 지원한다고 설명한다. **6000.6.7f1 + 실제 설치 패키지 + 대상 플랫폼 조합은 미확인**이다. 구매·다운로드·임포트는 이 연구에서 하지 않았다. [제품 호환성 설명][P01]
2. **[사실·문서 절차]** 도입된 상태라면 Graphics와 각 Quality의 URP Asset에서 Depth Texture를 켠다. 방향광 그림자를 받을 때 Renderer의 Transparent Receive Shadows를 켠다. `Effects > Volumetric Fog & Mist 2 > Fog Volume`을 만들고 Fog Profile을 지정한다. Manager가 자동 생성된다. [설정][P02], [Quick Start][P05]
3. **[사실·문서 절차]** Downscaling·Blur·Scattering·Depth Peeling에는 Volumetric Fog 2 Render Feature가 필요하다. 투명체 대응에는 셰이더 통합이나 Depth Pre-Pass 등을 별도 구성한다. [설정][P02], [투명체 FAQ][P04]
4. **[추정]** 처음에는 통로 밖의 한정된 Volume과 주광만 사용하고, 그다음 그림자·추가광·Detail Noise를 각각 비교한다. 판매 페이지의 시각 예시를 이 프로젝트의 가독성 검증으로 취급하지 않는다. [Volume 설정][P03], [FAQ][P04]

| 수치 / 비용 | 확인 내용 |
|---|---|
| 문서 기본값 | **[사실·제작사]** Raymarch Quality: Medium, Raymarch Min Step: 0.1, Dithering: 1, Jittering: 0.5. 패키지 버전별 차이와 Min Step의 프로젝트 월드 단위 대응은 **미확인**. [P03] |
| 해상도 축소 | **[사실·제작사]** Manager Downscaling의 1.25–2.0 범위를 성능 개선용으로 설명한다. 절감 ms/비율은 **미확인**. [P03] |
| 비용 요인 | **[사실·제작사]** 샘플 품질 감소·최소 스텝 증가·다운스케일을 비용 조절 수단으로 안내한다. 투명체 Depth Peeling은 별도 기능이다. [P02][P04] |
| 먼 적 위험 | **[추정]** 축소·블러로 적 경계 주변에 안개가 번지거나 시간 노이즈가 생기는지 원본 크기에서 확인한다. Animated Noise를 켜기 전 현재 AA 구성을 확인한다. [P03] |

### 4.3 SaladGamer Volumetric Light Beam — 국소 스포트 광선 후보

1. **[사실·제작사 안내]** 이 제품은 스포트 원뿔형 광선용이며 Point/Directional 전체 안개 솔루션이 아니다. 변경 로그 2.2.9는 Unity 6.6 호환성 개선을 기록한다. 이것이 **6000.6.7f1 검증 완료를 뜻하지는 않는다**. [기능/제약][P07], [변경 로그][P08]
2. **[사실·문서 절차]** 도입 후 URP 구성을 맞추고 `Create > Light > Volumetric Light Beam > SD 또는 HD`에서 `3D Beam` 또는 `3D Beam and Spotlight`를 만든다. SD는 기능이 제한되고 HD는 볼류메트릭 그림자·쿠키 기능을 제공한다. [시작 절차][P07]
3. **[추정]** 폐허 창문·제단·횃불의 좁은 광선에만 배치하고 원거리 적의 몸통을 가로지르는 밝은 원뿔은 피한다. 전역 안개와 같은 밀도 설정이라고 취급하지 않는다. [광선 형태/범위][P09]

| 수치 / 비용 | 확인 내용 |
|---|---|
| HD 품질 예시 | **[사실·제작사]** Fast 5 steps / Balanced 10 / High 20을 문서 예시로 제시하며 Config에서 변경 가능하다. 높은 스텝은 품질과 비용을 늘린다. [P09][P10] |
| 드로콜 안내 | **[사실·제작사]** Config의 Multi-Pass 모드는 SD 광선당 2, HD 광선당 1 드로콜이라고 설명한다. 그림자·먼지·추가 기능을 포함한 장면 전체 드로콜 수는 **미확인**. [P10] |
| HD 그림자 | **[사실·제작사]** 별도 가상 카메라의 깊이 맵을 사용한다. 문서 기본 해상도 128, 깊이 16bit이며 갱신 주기를 줄여 비용을 조절할 수 있다. [P11] |
| 실제 성능 | **미확인** — 대상 GPU에서 허용할 광선 수, ms, FPS, 메모리 측정 없음. **[추정]** 광선 중첩 면적·그림자 캡처를 먼저 측정한다. [P09][P11] |

### 4.4 sinnwrig/URP-Fog-Volumes — 공개 구현 연구 후보

1. **[사실·저자 안내]** README는 single-bounce 레이마칭, 반/¼ 해상도와 깊이 인지 업샘플, Volume당 최대 32광원을 설명한다. 해상도 축소는 Temporal Rendering과 양립하지 않는다고 명시한다. [저장소 README][P06]
2. **[사실·문서 절차]** 패키지가 준비된 상태에서 Fog Volume Render Feature → FogVolume 컴포넌트 → Profile 지정 → 크기/설정 조절 순서다. 이번에는 저장소 복제·패키지 설치·샘플 수신을 하지 않았다. [저장소 README][P06]
3. **[사실·조사 한계]** README의 테스트 목록은 Unity 2022.3 등이며, APV 지원 기능 설명과 baked lighting/probes 제한 설명이 함께 있다. **6000.6 Render Graph와 APV의 정확한 동작 범위는 미확인**이다. [저장소 README][P06]
4. **[추정]** 무료 공개 코드라는 이유로 바로 채택하지 않는다. 제거된 Compatibility Mode에 의존하지 않는지 확인하는 연구 대상으로 두며, 프로젝트 실측 ms·스텝 권장값·Metal 호환성은 **미확인**으로 남긴다. [저장소 README][P06], [Render Graph 경계][U04]

### 공통 성능 모델

- **[추정]** 레이마칭 비용은 대략 `처리 픽셀 × 유효 스텝 × 광원·그림자 샘플 작업`에 영향을 받는다. 빈 구간 생략·종료 조건·업샘플·캐시·드라이버에 따라 달라지는 모델이며 제품 간 절대 성능 순위는 아니다. [샘플/품질 설명][P03][P09]
- **[추정·계산]** 가로·세로를 각각 절반으로 렌더하면 본체 픽셀 수는 ¼이다. 이는 안개 전체 GPU 비용 75% 절감을 보장하지 않는다. 반해상도에서 작은 적 경계가 손상되면 다운스케일보다 안개 범위/광원/그림자를 먼저 줄이는 편을 비교한다. [해상도 축소·업샘플 기능][P06], [품질 조절][P04]

## 5. APV — 이동 적을 공간의 간접광에 연결

### 설정 절차

1. **[사실]** 활성 Quality의 URP Asset을 열고 `Lighting > Light Probe Lighting > Light Probe System`을 Adaptive Probe Volumes로 지정한다. `GameObject > Light > Adaptive Probe Volume`으로 추가한다. [APV 사용][U08]
2. **[사실]** 베이크에 참여할 광원은 Mixed/Baked, 지오메트리는 Contribute Global Illumination을 사용한다. 프로브 조명을 받을 Mesh Renderer는 Receive Global Illumination을 Light Probes로 설정한다. [APV 사용][U08]
3. **[사실]** Lighting에서 Baked GI를 켜고 APV 탭의 Single Scene 또는 Baking Set을 구성한다. Generate Lighting 또는 드롭다운의 Bake Probe Volumes로 베이크한다. [APV 사용][U08]
4. **[추정]** Global 모드로 무조건 넓히기보다 통로·늪 경계·원거리 적 이동 구역을 포함하는 범위를 검토한다. 장면의 정적 표면에는 라이트맵을 유지하고 이동 적의 간접광은 APV로 받는 구성을 우선 비교한다. **캐릭터가 별도 RT로 합성되는 경우 그 카메라·셰이더까지 APV를 받는지는 미확인**이다. [APV 밀도/범위][U09], [간접광 저장][U11]
5. **[사실]** 어두운 얼룩과 빛샘에는 Virtual Offset·Dilation·Probe Adjustment Volume 등을 검토한다. Virtual Offset/Dilation은 베이크 처리이므로 끄더라도 런타임 성능이 개선되는 설정은 아니다. [APV 문제 해결][U21]

### 수치와 성능 비용

| 항목 | 확인된 설정 / 수치 | 비용과 판단 |
|---|---|---|
| Min/Max Probe Spacing | **[사실]** 프로브 간 최소/최대 간격이며 단위는 m. 적정값은 **미확인**. [U22] | **[추정]** 벽·고목·지면 경계에만 밀도를 높이는 방향을 검토. [U09] |
| L1 / L2 | **[사실]** L2는 더 정밀하지만 자원을 더 사용한다. 정확한 메모리 배수/ms는 **미확인**. [U02] | **[추정]** 동일 광량에서 먼 적이 유의하게 개선되는지를 보고 선택. [U07] |
| Memory Budget | **[사실]** Low/Medium/High가 있고 Estimated GPU Memory Cost를 제공한다. 이 프로젝트 MB는 **미확인**. [U02] | **[추정]** 예산 이름만으로 실제 상주 메모리를 추정하지 않는다. [U02] |
| Streaming | **[사실]** GPU 스트리밍은 CPU→GPU, Disk 스트리밍은 디스크→CPU이며 후자는 전자가 필요하다. [U23] | **[추정]** 카메라 이동 시 데이터 로딩·급격한 조명 변화도 후속 확인. [U23] |

- **[추정·계산]** 균일한 3차원 격자 가정에서 간격을 절반으로 하면 같은 부피의 프로브 수는 약 8배다. APV는 적응 배치·브릭·경계가 있어 실제 데이터 크기 8배를 보장하지 않는다. 프로브 수·베이크 시간·상주 메모리로 확인한다. [적응 밀도][U09], [APV 패널][U22]
- **[추정]** APV는 적의 얼굴에 붙는 조명도, 실시간 이동 횃불의 GI 해법도 아니다. 이동 적이 어두우면 프로브 유효성·셰이더 경로를 먼저 점검하고, 필요한 직접광/림 보조는 별도 설계한다. [베이크 절차][U08], [Mixed 광원 계산][U11]

## 6. 라이트맵 — 어두운 배경의 큰 명암과 간접광

### 설정 절차

1. **[사실]** 정적 환경 메시의 라이트맵 UV를 준비하고 필요하면 Import 설정의 Generate Lightmap UVs를 사용한다. Contribute GI와 라이트맵 지원 셰이더를 확인한다. [베이크 준비][U10]
2. **[사실]** Lighting Settings의 베이크 백엔드와 Baked GI를 정하고, 주요 광원을 Baked/Mixed로 구성한다. Mixed Baked Indirect는 직접광·동적 그림자를 실시간으로, 간접광을 베이크한다. [베이크 설정][U24], [Lighting Mode][U11]
3. **[추정]** 바닥·고목의 큰 음영으로 어두운 분위기를 먼저 만들고, 길과 적 뒤의 배경 명도를 분리한다. 이동 적을 정적 라이트맵 수신자로 취급하지 않는다. [정적/동적 구분][U10], [간접광 저장][U11]
4. **[사실]** Shadowmask는 정적 그림자 정보를 별도 텍스처에 저장하며 한 texel에 최대 4광원을 담는다. Distance Shadowmask와 Shadowmask는 실시간 그림자 적용 범위가 다르다. [Lighting Mode][U11]
5. **[추정]** 움직이는 수목이나 파괴물까지 고정 그림자로 보이게 베이크하지 않는지 검토한다. 해당 물체의 처리 방식과 Shadow Distance는 카메라에서 먼 적이 있는 영역까지 함께 살핀다. [그림자 최적화][U25]

### 수치와 성능 비용

| 항목 | 수치 / 상태 | 비용 |
|---|---|---|
| Lightmap Resolution | **[사실]** 단위 길이당 텍셀 수(texels/unit)를 지정한다. 문서는 해상도를 2배로 하면 텍셀 수가 4배가 된다고 설명한다. 프로젝트 설정값은 **미확인**. [U24] | **[추정]** 고르게 올리기보다 화면상 필요한 물체의 밀도를 우선 검토. [U10] |
| Progressive 간접 샘플 | **[사실]** 문서는 일부 야외 장면에서 128 samples가 충분할 수 있다고 설명한다. 이 프로젝트 확정값은 **미확인**. [U24] | **[사실]** 더 많은 샘플은 베이크 시간을 늘린다. Unity Compute Light Baker에서는 동일 필드/의미라고 가정하지 말고 해당 백엔드 설명을 따른다. [U24] |
| Max Bounces | **[사실]** 문서 기본값 2, 범위 0–100. 장면 적정값은 **미확인**. [U24] | **[사실]** 바운스 증가는 베이크 자원을 더 요구한다. 런타임 픽셀마다 이 바운스를 다시 추적하는 설정은 아니다. [U24][U10] |
| 텍스처 크기 효과 | **[추정·계산]** 같은 포맷·매수에서 1024²→2048²는 기본 texel 수 4배. 실제 압축·mip·Shadowmask 포함 MB는 **미확인**. [U24][U11] | **[추정]** 텍스처 메모리·샘플 대역폭을 실측해야 하며 “베이크이므로 런타임 비용 0”이라 쓰지 않는다. [U10][U11] |

- **[추정]** 작은 해상도에서 베이크 노이즈·UV 이음새·원거리 적 뒤 명도부터 확인하고, 부족한 항목만 높인다. 최종 베이크 시간·텍스처 수·MB·GPU 증분은 **미확인**이며 이 문서는 베이크를 실행하지 않았다. [베이크 품질 설정][U24]

## 7. 라이트 쿠키 — 나뭇가지·창살 패턴을 조명에 넣기

### 설정 절차

1. **[사실]** URP Asset의 고급 Lighting 설정에서 Light Cookies를 활성화할 수 있다. 추가광 쿠키는 공통 Atlas를 사용하며 해상도와 Grayscale/Color 등의 포맷을 설정한다. [URP Asset][U02]
2. **[사실]** Light의 Cookie에 텍스처를 지정한다. Directional/Spot은 2D, Point는 Cubemap이며 Area는 지원하지 않는다. Directional에는 Cookie Size/Offset이 있고 Offset으로 패턴을 이동할 수 있다. [URP Light 참조][U12]
3. **[추정]** 프로젝트에 이미 있는 적법한 패턴으로 방향광의 큰 수목 무늬 또는 Spot의 창살 무늬를 시험한다. 적이 지나가는 길 전체를 검게 자르는 강한 패턴은 줄이고, 적 전용 보조광과 배경 쿠키의 역할을 분리한다. 이번 연구에서는 텍스처를 받거나 제작하지 않았다. [쿠키 역할][U12], [Rendering Layers][U27]
4. **[사실]** Rendering Layers는 광원이 특정 Renderer만 비추게 할 수 있다. Forward 경로에서 라이트에만 사용하는 경우 문서는 성능 영향이 작다고 설명하지만 모든 경로가 같은 비용은 아니다. [Rendering Layers 원리·비용][U27]

### 수치와 성능 비용

- **[사실]** Cookie Size/Offset은 조정 가능한 설정이지만 이 장면의 적정 크기·이동 속도·Atlas 해상도는 **미확인**이다. 공식 최적화 문서는 미사용 쿠키 비활성화 또는 Atlas 해상도/포맷 축소를 안내한다. [쿠키 설정][U12], [URP 최적화][U28]
- **[추정·계산]** 동일 포맷에서 Atlas 한 변을 2배로 하면 기본 texel 저장량은 4배다. 이 계산만으로 쿠키 샘플 비용이나 총 VRAM을 산출할 수는 없다. [Atlas 설정][U02]
- **[추정]** 쿠키로 패턴이 투사돼도 그 모양의 실제 지오메트리 그림자나 공기 중 산란이 생기는 것은 아니다. 실시간 그림자·볼류메트릭까지 함께 켰을 때의 비용을 쿠키 비용과 나눠 측정한다. 프로젝트 증분 ms는 **미확인**이다. [쿠키 역할][U12], [URP 볼류메트릭 경계][U16], [그림자 비용][U25]

## 8. 림라이트 — 먼 적의 실루엣 보조

### 설정 절차

1. **[사실]** Shader Graph Fresnel Effect 노드는 World Space Normal과 View Direction을 기본 입력으로 사용하고 Power를 노출한다. 공식 생성 코드 예는 정규화한 노멀과 시선 내적으로 가장자리 가중치를 계산한다. [Shader Graph 17.6 Fresnel][U13]
2. **[추정]** Lit Graph에서 `Fresnel × 색 × 강도 × 마스크`를 Emission에 더하는 방식을 검토한다. 이는 카메라 기준 미술용 효과이며 물리적인 후방광과는 별도다. Power와 강도는 적 재질·화면 크기를 보며 결정한다. [Fresnel 원리][U13]
3. **[추정]** 발·지면 접촉부와 내부 주름까지 전부 밝아지지 않도록 마스크를 검토한다. 전신에 두꺼운 띠를 고정하기보다 머리/어깨/무기 윤곽을 남기는 방향이 이 프로젝트의 어두운 분위기에 적합할 수 있다. 확인된 미술 결과는 아니다. [Fresnel 효과][U13]
4. **[추정]** 실제 보조광 방식은 적용 범위를 Rendering Layers로 제한해 비교한다. 모든 적마다 Point Light를 추가하는 방식은 광원 중첩·그림자 비용을 늘릴 수 있으므로 재질 방식과 비용을 따로 확인한다. [Rendering Layers][U27], [추가광 최적화][U28]

### 수치와 성능 비용

| 항목 | 확인값 / 계산 | 주의 |
|---|---|---|
| Power 영향 | **[추정·계산]** `N·V=0.5`인 정규화 입력에서 `(1−N·V)^p`는 p=1/2/4일 때 0.5/0.25/0.0625. [U13] | **[추정]** 높은 p는 더 좁은 윤곽을 만들 수 있지만 “화면 1px”을 보장하지 않는다. [U13][U20] |
| 강도·색·두께 | **미확인** — HDR 색, 노출, 캐릭터 RT·최종 출력 크기에 의존 | **[추정]** Bloom 전후와 안개 합성 후를 비교한다. [U13][U17] |
| 재질 방식 비용 | **[추정]** 기존 패스 안의 연산 추가라면 별도 외곽선 패스를 피할 수 있다. 실제 컴파일 패스·GPU ms는 **미확인**. [U13] | **[추정]** 별도 실루엣 렌더·윤곽선 패스를 추가하는 경우를 같은 비용으로 세지 않는다. [U18] |
| 실제 보조광 비용 | **미확인** | **[사실]** 추가광과 그림자 수를 줄이는 것은 URP 공식 최적화 수단이다. [U28] |

- **[추정]** 픽셀 캐릭터가 저해상도 RT에서 합성된다면 월드의 림이 그 안에서 먼저 소실될 수 있다. RT 안에서 만든 효과인지, 최종 합성 후 효과인지 확인하고 최종 출력 1배 크기로 판단한다. 현재 프로젝트 합성 경로는 **미확인**이다. [해상도와 투영 관계][U20], [Full Screen Pass][U18]

## 9. 색 보정과 LUT 순서 — 작업 순서와 렌더 순서를 구분

### 9.1 공식 문서로 확인한 처리 관계

- **[사실]** URP Asset의 Grading Mode가 HDR이면 색 보정은 톤 매핑 이전, LDR이면 제한 범위 색 보정은 톤 매핑 이후다. LUT Size 기본값은 32이며 크기를 늘리면 정밀도와 잠재적인 메모리/성능 비용이 늘어난다. [URP Asset][U02]
- **[사실]** Color Adjustments의 Post Exposure는 EV 단위이며 톤 매핑 전에 적용되고 이전 HDR 효과에 영향을 주지 않는다. 따라서 이를 바꾼다고 앞 단계 Bloom 입력까지 같은 방식으로 달라진다고 가정하면 안 된다. [Color Adjustments][U17]
- **[사실]** Color Lookup은 사용자 LUT 텍스처와 Contribution을 제공한다. Neutral은 색상/채도 변화를 최소화한 범위 재매핑, ACES는 더 강한 대비와 색상/채도 변화를 가진다고 문서가 설명한다. [Color Lookup][U14], [Tonemapping][U15]
- **[추정]** 이 프로젝트의 최초 비교는 **SDR 디스플레이 출력 + HDR 내부 렌더링/Grading**을 구별해 고정하고, Neutral과 ACES에서 원거리 적의 암부가 유지되는지 살피는 방식이 적합하다. HDR 디스플레이 출력은 별도 검증 항목이며 자동으로 같은 결과라고 취급하지 않는다. [톤 매핑/HDR 출력][U15]

### 9.2 공개 소스에서 관찰한 세부 순서 — 대상 패키지 일치 미확인

| 경로 | 공개 구현에서 관찰한 SDR 처리 관계 | 증거 범위 |
|---|---|---|
| HDR Grading | **[사실·공개 소스]** Post Exposure → 내부 LogC LUT → 선택적 사용자 LUT. 내부 HDR LUT 생성에는 색 보정 뒤 톤 매핑이 포함된다. [S01][S02] | **6000.6.7f1 패키지 동일성 미확인** |
| LDR Grading | **[사실·공개 소스]** Post Exposure → 톤 매핑 → 선택적 사용자 LUT → 내부 색 보정 LUT. [S01] | **6000.6.7f1 패키지 동일성 미확인** |
| 사용자 LUT 샘플 | **[사실·공개 소스]** SDR 경로에서 sRGB 값으로 변환해 사용자 LUT를 샘플한 뒤 선형 값으로 돌아온다. [S01] | **6000.6.7f1 패키지 동일성 미확인** |

- **[추정]** “사용자 LUT는 언제나 HDR 톤 매핑보다 먼저다” 또는 “Volume Inspector에서 위아래로 옮기면 셰이더 계산 순서도 바뀐다”는 전제로 제작하지 않는다. 위 공개 구현의 차이를 고려하고 실제 패키지 코드와 프레임을 확인해야 한다. [공식 HDR/LDR 구분][U02], [공개 구현][S01][S02]

### 9.3 설정·제작 절차

1. **[추정]** 카메라 후처리·Volume 적용을 확인한 뒤, 조명과 안개를 고정한다. Grading Mode와 Tonemapping을 먼저 정하고 사용자 LUT Contribution은 0으로 둔 상태에서 노출·중간톤·암부를 조율한다. 이는 작업 순서 제안이며 엔진 내부 계산 순서를 바꾸는 절차가 아니다. [색 보정 항목][U14][U17], [톤 매핑][U15]
2. **[추정]** LUT를 제작할 때는 현재 톤 매퍼를 다시 포함해 이중 적용하지 않도록 입력/출력 변환을 명시한다. 이 연구에서는 LUT 이미지 생성·수신·임포트를 하지 않는다. [공식 모드 관계][U02], [공개 LUT 처리][S01][S02]
3. **[사실·공개 소스]** 공개 `ColorLookup.ValidateLUT`는 `높이=N`, `너비=N²`, 비-sRGB 텍스처를 검사한다. 이 검사식의 **대상 설치 패키지 일치 여부는 미확인**이다. URP 17.6 API 문서는 사용자 LUT가 2D 텍스처임을 확인해 준다. [검사 구현][S03], [17.6 API][U29]
4. **[추정·계산]** N=32의 스트립이라면 1024×32다. 도입 시 sRGB 비활성·압축/밉맵/필터 설정을 데이터 보존 관점에서 검토하되, 확인하지 않은 임포터 설정을 공식 6000.6 필수값으로 단정하지 않는다. 수학적으로 필요한 크기와 실제 텍스처 허용 조건을 나눠 확인한다. [검사 구현][S03]
5. **[추정]** LUT Contribution을 비교하면서 검은 적/어두운 지면, 붉은 예고/갈색 늪, 회색 적/안개 조합을 확인한다. 검은색으로 뭉친 정보는 LUT의 색조만 바꿔 복구할 수 있다고 가정하지 않는다. 적과 배경의 명도 분리는 조명 단계로 돌아가 수정할 수 있어야 한다. [Color Lookup][U14], [대비/노출][U17]

### 수치와 성능 비용

- **[사실]** 확인한 공식 수치는 LUT Size 기본 32다. 이 장면의 Post Exposure EV·Contrast·Saturation·LUT Contribution 적정값은 **미확인**이다. [URP Asset][U02], [Color Adjustments][U17], [Color Lookup][U14]
- **[추정·계산]** 내부 3차원 색 격자의 샘플 수는 N³이므로 32→64는 8배다. GPU 시간 8배를 의미하지 않으며 실제 포맷·재생성·샘플 대역폭은 별도다. [LUT 크기 비용][U02], [스트립 크기 검사][S03]
- **[사실]** Unity 6.5부터 색 보정·톤 매핑 등 지원 효과를 on-tile로 실행하는 경로가 안내된다. 따라서 색 보정 한 항목마다 반드시 독립된 전체화면 패스가 추가된다고 단정하지 않는다. 커스텀 안개 패스와의 병합 가능성 및 프로젝트 총 ms는 **미확인**이다. [Unity 6.5 변경 사항][U30], [Full Screen Pass][U18]

## 10. 피치 34° 탑다운에서 먼 적을 남기는 방법

### 투영·식별 기준

- **[사실]** 원근 절두체 높이는 `2·z·tan(FOVy/2)`로 계산한다. 화면상의 적 크기는 FOV·카메라 공간 깊이·실제 형태에 의존하므로 **피치 34°만으로 픽셀 크기나 최소 가시 거리를 정할 수 없다**. [절두체 공식][U20]
- **[추정]** 동작·실루엣별 식별성이 다르므로 “최소 16px면 된다” 같은 보편 임계값은 두지 않는다. 이 프로젝트 최소 적 높이(px), 대비 임계값, 허용 안개 투과율은 **미확인**이다. 적 머리·몸통·발·무기를 `WorldToScreenPoint` 등으로 투영하고 최종 화면에서 기록하는 방식을 제안한다. [화면 좌표 변환][U19], [투영 공식][U20]
- **[추정·계산]** 카메라 피치를 수평 기준 아래쪽 34°로 보고, 깊이 변화가 작다는 국소 근사에서는 수직 물체의 화면 평면상 높이 성분이 `h·cos(34°)≈0.829h`, 시선 방향 지면 길이의 성분이 `l·sin(34°)≈0.559l`이다. 원근 분모·화면 위치에 따라 달라지며 실제 적 픽셀 크기 예측값은 아니다. [원근 절두체 원리][U20]

### 적용 카탈로그

| 문제 | 설정·검토 절차 | 수치와 성능 비용 |
|---|---|---|
| 원거리 적이 안개와 섞임 | **[추정]** 최원거리 적의 몸통·발까지 시선 경로를 확인하고, 통로 밀도를 낮추거나 지역 Volume을 분리한다. 안개를 낮게 깔았다는 이유만으로 통과시키지 않는다. [T01][P03] | **미확인** — 통로 밀도/투과율. **[추정]** Volume 중첩과 처리 면적 감소를 함께 측정. [P03] |
| 검은 적과 검은 배경 | **[추정]** 적 뒤의 배경을 달리 비추고 APV의 누락·빛샘을 확인한 뒤 제한된 림/보조광을 더한다. [U07][U21][U13] | **미확인** — 최소 명도차·림 강도. **[추정]** 재질 방식과 추가광 비용을 분리. [U13][U28] |
| 고목·벽이 적을 가림 | **[추정]** 카메라-적 사이 가림물의 페이드나 실루엣 표시를 별도 기능으로 검토한다. 현재 프로젝트 지원 여부는 미확인. [U18][U27] | **미확인** — 마스크 버퍼·추가 렌더 비용. **[추정]** 모든 가림물을 항상 투명화하면 중첩 비용과 화면 혼잡을 따로 확인. [U18] |
| LOD에서 적이 갑자기 사라짐 | **[사실]** LOD 전환 기준은 화면 높이 비율이다. **[추정]** 원거리 이동 구간에서 Cull/LOD 경계를 확인한다. [U31] | **미확인** — 프로젝트 LOD 비율. **[사실]** LOD Cross Fade의 alpha testing도 비용 조절 대상이다. [U28] |
| DOF·모션블러·Bloom이 작은 적을 흐림 | **[추정]** 효과별 비활성 기준 화면과 비교하고, 어두운 분위기 설정을 한꺼번에 켜지 않는다. [U32][U17] | **미확인** — 효과별 허용 강도·ms. **[추정]** 원거리 적을 희생하는 전역 블러를 분위기 필수값으로 두지 않는다. [U32] |
| 비네트가 화면 위쪽 적을 지움 | **[추정]** 먼 적이 놓이는 화면 영역까지 검사하고, 가장자리 감쇠가 몸통을 없애면 낮추거나 범위를 수정한다. [U33] | **미확인** — Intensity/Smoothness 적정값. 효과를 켠/끈 동일 프레임으로 비교. [U33] |
| 붉은 공격 예고가 붉은 안개에 묻힘 | **[추정]** LUT·안개 최종 합성 상태에서 밝기·형태·움직임으로도 구분되는지 확인한다. 색상만으로 분리하지 않는 방향을 제안한다. [U14][U17][P04] | **미확인** — 예고 최소 대비. **[추정]** 예고만 후처리 밖으로 빼는 경우에는 깊이·가림 순서의 일관성과 추가 패스를 검토. [U18] |

### 후속 검증 설계 — 이번 연구에서는 실행하지 않음

1. **[추정]** 카메라 피치 34°를 고정하고 동일 장면·동일 적·동일 이동으로 `안개 없음 → 거리/높이 안개 → 볼류메트릭 → 림 → LUT`를 한 단계씩 비교한다. 저해상도 캐릭터 RT가 있다면 그 출력까지 포함한다. [안개 합성 지점][U18], [색 보정 관계][U02]
2. **[추정]** 검토 해상도 예시를 1920×1080과 3840×1080으로 두고 원본 1배 화면에서 근/중/원거리 적의 존재·진행 방향·공격 동작·바닥 예고를 판정한다. 이 해상도는 제안한 시험 조건이며 사용자의 실제 목표 출력은 **미확인**이다. [해상도·투영 관계][U19][U20]
3. **[추정]** 정지 화면 외에 적 이동·카메라 이동·나뭇가지 가림·광선 중첩·다수 적을 포함한다. 저해상도 안개 업샘플과 Temporal Rendering의 흔적도 확인한다. 이 연구에는 실제 플레이 캡처가 없다. [시간 누적/업샘플 제한][P06], [Animated Noise][P03]
4. **[사실]** GPU Usage Profiler 지원은 플랫폼/API에 따라 다르다. 6000.6 문서는 Windows DX11/DX12 지원과 macOS Metal에서 Xcode GPU Frame Debugger 사용을 안내한다. 지원되지 않는 측정에서 0ms를 “무료”라고 해석하면 안 된다. [GPU Profiler 지원표][U34]
5. **[추정]** 후속 측정은 전체 프레임 CPU/GPU, 안개·그림자·후처리 패스, 드로콜, RT/라이트맵/APV 메모리를 같은 조건에서 기록한다. 장치·API·해상도·렌더 스케일·AA·광원/적 수·워밍업 여부가 없는 단일 FPS는 채택 근거로 삼지 않는다. **현재 모든 성능 측정값은 미확인**이다. [URP 최적화/측정][U28], [GPU Profiler][U34]

## 11. 검토용 결론과 미확인 목록

- **[추정]** 우선 검토 조합은 **정적 라이트맵 + 이동체 APV + 약한 거리/높이 안개 + 제한된 림 + 고정된 톤 매퍼/LUT**다. 볼류메트릭은 전투 가독성이 유지되는 국소 영역에 한해 추가하는 순서를 제안한다. [정적/동적 조명][U10][U08], [안개 지원 범위][U16], [Fresnel][U13]
- **[추정]** 전역 매질 후보는 Kronnect, 좁은 스포트 광선 후보는 VLB, 공개 구현 분석 후보는 sinnwrig로 역할을 나눌 수 있다. 제품별 실제 품질·비용 우열, 구매 필요성, 채택 여부는 아직 결정할 수 없다. [Kronnect][P01], [VLB 범위][P07], [공개 구현][P06]
- **[사실·조사 한계]** 설치 URP/Shader Graph 버전, Renderer 경로, 대상 GPU/API, 월드 단위, 적 최소 화면 크기, 안개/림/LUT 적정값, 베이크 시간, GPU ms, 메모리 MB, 서드파티의 정확한 패치 호환성은 **미확인**이다. 공개 문서에서 확인한 설정값과 이 프로젝트의 실측값을 혼동하지 않는다. [URP 설정][U02], [성능 측정][U28][U34]
- 작업 기록: 지정 Markdown 한 파일 작성만 수행했다. Unity·Python 실행, 유료 서비스 이용, 로그인, 이미지·게임 파일·에셋 수신/추가, 커밋·push를 수행하지 않았다. 문서 외 변경과 검토 후 커밋은 이번 작업 범위가 아니다.

## 출처 — 모두 2026-11-05 열람, 직접 인용 없이 요약

문장·표의 출처 표시는 아래 URL로 연결된다. `U`는 Unity 공식 자료, `P`는 제작사/저자 자료, `S`는 Unity 공식 공개 소스, `T`는 렌더링 원전이다. `master` URL은 움직이는 참조이며 대상 패키지의 고정 버전 증거가 아니다.

[U01]: https://unity.com/releases/editor/whats-new/6000.6.7f1 "Unity 6000.6.7f1 release notes"
[U02]: https://docs.unity.com/en-us/engine/6000.6/manual/render-pipelines/universal-render-pipeline/urp-reference/universalrp-asset "Unity 6000.6 URP Asset reference"
[U03]: https://docs.unity.com/en-us/engine/6000.6/manual/render-pipelines/choose-a-render-pipeline/feature-comparison "Unity 6000.6 render pipeline feature comparison"
[U04]: https://docs.unity.com/en-us/engine/6000.6/manual/whats-new/unity64 "Unity 6.4: URP Compatibility Mode removed"
[U05]: https://docs.unity.com/en-us/engine/6000.6/manual/lighting-overview/lighting-reference/lighting-window "Unity 6000.6 Lighting window and fog settings"
[U06]: https://docs.unity.com/en-us/engine/6000.6/manual/materials-and-shaders/shaders/writing-custom-shaders-urp/writing-shaders-urp/reconstruct-world-position "Unity 6000.6 reconstruct world positions from depth"
[U07]: https://docs.unity.com/en-us/engine/6000.6/manual/lighting-overview/lighting/probevolumes "Unity 6000.6 Adaptive Probe Volumes overview"
[U08]: https://docs.unity.com/en-us/engine/6000.6/manual/lighting-overview/lighting/probevolumes/use "Unity 6000.6 use and bake APV"
[U09]: https://docs.unity.com/en-us/engine/6000.6/manual/lighting-overview/lighting/probevolumes/changedensity "Unity 6000.6 APV size and density"
[U10]: https://docs.unity.com/en-us/engine/6000.6/manual/lighting-overview/direct-and-indirect-lighting/lightmapping/baking-before-runtime/lightmapping "Unity 6000.6 scene setup for baked lightmaps"
[U11]: https://docs.unity.com/en-us/engine/6000.6/manual/lighting-overview/lighting-light-sources/components/configuring/lighting-mode/lighting-mode "Unity 6000.6 Mixed Lighting Modes and Shadowmask"
[U12]: https://docs.unity.com/en-us/engine/6000.6/manual/lighting-overview/lighting/light-component "Unity 6000.6 URP Light component: cookies"
[U13]: https://docs.unity3d.com/Packages/com.unity.shadergraph@17.6/manual/Fresnel-Effect-Node.html "Shader Graph 17.6 Fresnel Effect Node"
[U14]: https://docs.unity.com/en-us/engine/6000.6/manual/post-processing-and-full-screen-effects/urp/effect-list/color-lookup "Unity 6000.6 Color Lookup Override"
[U15]: https://docs.unity.com/en-us/engine/6000.6/manual/post-processing-and-full-screen-effects/urp/effect-list/tonemapping "Unity 6000.6 Tonemapping Override"
[U16]: https://docs.unity.com/en-us/engine/6000.6/manual/render-pipelines/universal-render-pipeline/introduction/installing-and-configuring-urp/migrating-from-hdrp/convert-hdrp-vfx-graph-to-urp "Unity 6000.6: URP requires custom or third-party volumetric fog"
[U17]: https://docs.unity.com/en-us/engine/6000.6/manual/post-processing-and-full-screen-effects/urp/effect-list/color-adjustments "Unity 6000.6 Color Adjustments Override"
[U18]: https://docs.unity.com/en-us/engine/6000.6/manual/post-processing-and-full-screen-effects/urp/custom-post-processing/renderer-feature-full-screen-pass "Unity 6000.6 Full Screen Pass reference"
[U19]: https://docs.unity.com/en-us/engine/6000.6/script-reference/unityengine/camera/worldtoscreenpoint "Unity 6000.6 Camera.WorldToScreenPoint"
[U20]: https://docs.unity.com/en-us/engine/6000.6/manual/cameras/camera-view/frustum-size-at-distance "Unity 6000.6 perspective frustum size formula"
[U21]: https://docs.unity.com/en-us/engine/6000.6/manual/lighting-overview/lighting/probevolumes/fixissues/troubleshoot-artefacts "Unity 6000.6 APV Virtual Offset and Dilation"
[U22]: https://docs.unity.com/en-us/engine/6000.6/manual/lighting-overview/lighting/probevolumes/lighting-panel-reference "Unity 6000.6 APV Baking Set panel and spacing units"
[U23]: https://docs.unity.com/en-us/engine/6000.6/manual/lighting-overview/lighting/probevolumes/streaming "Unity 6000.6 APV streaming"
[U24]: https://docs.unity.com/en-us/engine/6000.6/manual/lighting-overview/direct-and-indirect-lighting/lightmapping/baking-before-runtime/lightmaps-reference "Unity 6000.6 baked lighting settings by backend"
[U25]: https://docs.unity.com/en-us/engine/6000.6/manual/lighting-overview/lighting/shadows-in-urp/shadows-optimization "Unity 6000.6 shadow optimization"
[U27]: https://docs.unity.com/en-us/engine/6000.6/manual/lighting-overview/lighting/rendering-layers/introduction "Unity 6000.6 Rendering Layers and performance"
[U28]: https://docs.unity.com/en-us/engine/6000.6/manual/render-pipelines/universal-render-pipeline/introduction/configure-for-better-performance "Unity 6000.6 URP performance configuration"
[U29]: https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@17.6/api/UnityEngine.Rendering.Universal.ColorLookup.html "URP 17.6 ColorLookup API"
[U30]: https://docs.unity.com/en-us/engine/6000.6/manual/whats-new/unity65 "Unity 6.5 on-tile post-processing"
[U31]: https://docs.unity.com/en-us/engine/6000.6/manual/analysis/graphics-performance-profiling/lod/lod-group/class-lodgroup "Unity 6000.6 LOD Group screen-height thresholds"
[U32]: https://docs.unity.com/en-us/engine/6000.6/manual/post-processing-and-full-screen-effects/urp/effect-list "Unity 6000.6 post-processing effects catalog"
[U33]: https://docs.unity.com/en-us/engine/6000.6/manual/post-processing-and-full-screen-effects/urp/effect-list/vignette "Unity 6000.6 Vignette Override"
[U34]: https://docs.unity.com/en-us/engine/6000.6/manual/analysis/graphics-performance-profiling/profile-rendering/profiler-gpu "Unity 6000.6 GPU Usage Profiler platform support"
[P01]: https://kronnect.com/products/volumetric-fog/ "Kronnect Volumetric Fog and Mist 2 compatibility and features"
[P02]: https://kronnect.com/docs/volumetric-fog-urp/setup/ "Kronnect URP setup and render features"
[P03]: https://kronnect.com/docs/volumetric-fog-urp/fog-volume-settings/ "Kronnect fog settings, defaults and downscaling"
[P04]: https://kronnect.com/docs/volumetric-fog-urp/faq/ "Kronnect performance and transparency FAQ"
[P05]: https://kronnect.com/docs/volumetric-fog-urp/quick-start/ "Kronnect Quick Start"
[P06]: https://github.com/sinnwrig/URP-Fog-Volumes "sinnwrig URP Fog Volumes README: features and limitations"
[P07]: https://saladgamer.com/vlb-doc/ "Volumetric Light Beam setup, SD/HD and spotlight limitations"
[P08]: https://www.saladgamer.com/vlb-doc/changelog/ "Volumetric Light Beam changelog 2.2.9"
[P09]: https://saladgamer.com/vlb-doc/comp-lightbeam-hd/ "Volumetric Light Beam HD steps and jittering"
[P10]: https://www.saladgamer.com/vlb-doc/config/ "Volumetric Light Beam configuration and draw calls"
[P11]: https://saladgamer.com/vlb-doc/comp-shadow-hd/ "Volumetric Shadow HD depth map and update rate"
[S01]: https://raw.githubusercontent.com/Unity-Technologies/Graphics/master/Packages/com.unity.render-pipelines.universal/Shaders/PostProcessing/Common.hlsl "Unity Graphics master: ApplyColorGrading; exact target version unverified"
[S02]: https://raw.githubusercontent.com/Unity-Technologies/Graphics/master/Packages/com.unity.render-pipelines.universal/Shaders/PostProcessing/LutBuilderHdr.shader "Unity Graphics master: HDR grading and tone-map LUT builder"
[S03]: https://raw.githubusercontent.com/Unity-Technologies/Graphics/master/Packages/com.unity.render-pipelines.universal/Runtime/Overrides/ColorLookup.cs "Unity Graphics master: LUT validation; exact target version unverified"
[T01]: https://pbr-book.org/4ed/Volume_Scattering/Transmittance "Physically Based Rendering 4th ed. 11.2: transmittance and Beer law"
