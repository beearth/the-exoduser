# VFX 디렉션 연구 — 정보의 순서, 형태와 밀도

조사일: 2026-11-05. 대상: Diablo IV, Hades, Path of Exile 2, Phantom Blade Zero. 엔진 비교 기준: Unity 6.0(6000.0), URP, VFX Graph 17.0 계열.

이 문서는 공개 웹 텍스트를 조사한 연구 문서다. 이미지·영상·게임 파일·에셋을 다운로드하거나 삽입하지 않았으며, Unity 실행·성능 측정·프레임별 영상 판독은 하지 않았다. 영상 링크는 공개 자료의 위치를 알리는 용도다. 게임별 수치와 내부 구현은 공개 설명으로 확인되는 범위만 기록한다.

- **[사실]** 출처에서 직접 확인되는 설명 또는 발언이다. 개발자가 목표를 설명한 경우에는 그 발언이 확인됐다는 뜻이며, 모든 출시 빌드에서 목표가 달성됐다는 뜻은 아니다.
- **[추정]** 자료를 바탕으로 작성자가 도출한 해석·적용 제안이다. 함께 붙인 URL은 출발 근거이며 해당 제안이나 수치를 원작이 채택했다는 증거가 아니다.
- **[미확인]** 이번에 확인한 공개 자료로는 확정할 수 없다. 자료가 세상에 없다고 단정하지 않는다. 옆 링크는 확인한 자료의 범위다.
- 본문 출처 기호는 모두 URL 링크다. 직접 인용은 사용하지 않고 요약했다.

## 1. 게임별 공개 근거와 한계

| 게임 | 확인한 개발자·아티스트 자료 | Realtime VFX 및 외부 분석 | 확인 한계 |
|---|---|---|---|
| Diablo IV | [사실] Lead VFX Artist Daniel Briggs가 2021년 개발 일지에서 전투 가독성, 효과 강도의 위계, 조명을 받는 VFX와 예술적 PBR 예외를 설명했다. **개발 당시 설명**이다. [D4] | [사실] `Diablo IV VFX References`는 참여 아티스트의 포트폴리오를 모은 커뮤니티 자료다. 내부 예산을 검증한 분석 문서는 아니다. [RT-D4] | [미확인] 최종 빌드의 효과별 입자 수·GPU 시간·오버드로 상한, 모든 기술의 4단계 타이밍. [D4] |
| Hades | [사실] Jen Zee 인터뷰는 게임 디자인을 우선하는 제작, 펜·잉크 방향, Josh Barnett의 FX/UI 담당과 FX 애니메이션 프레임 제작을 설명한다. Barnett 본인은 즉각적이고 강한 인상을 목표로 했다고 회고한다. [H-ART] [H-FX] | [사실] `Hades Material/VFX Help`에서 원형 불꽃·흘러내리는 부분·방사형 스파크를 분리하고, 평평한 색·그라디언트 맵·왜곡 UV·SDF로 재현하는 방법을 토론한다. [RT-H] | [미확인] 토론의 재현 셰이더가 Hades 원작 코드라는 증거, 모든 FX가 한 종류의 플립북이라는 증거. [RT-H] [H-ART] |
| Path of Exile 2 | [사실] GGG가 Alexander Sannikov의 ExileCon 2023 렌더링 발표를 공개했다. 별도의 2025년 개발사 보도자료는 전투 가독성 개선과 Delirium 안개의 강도 축소를 설명한다. [P2-TALK] [P2-PRESS] | [사실] GGG의 Realtime VFX 채용 글은 PoE2 개발팀 확장과 색·명도·타이밍·임팩트의 중요성을 밝힌다. 외부 아티스트 Raúl Fernández Guardia는 PoE2에서 영감을 받은 UE5 방사형 블러 재현을 게시했다. [RT-GGG] [P2-REBUILD] | [미확인] 채용 글은 기술 분석이 아니며, 외부 재현은 GGG의 구현 증거가 아니다. 이번 조사에서 PoE2 전용 Realtime VFX 기술 분해 글과 정량 예산은 확보하지 못했다. [RT-GGG] [P2-REBUILD] |
| Phantom Blade Zero | [사실] 전투 디자이너 Bob Wu와 Soulframe Liang은 실제 무술이 공격 의도를 숨기는 문제를 설명하고, 플레이어가 대응할 수 있도록 시각 신호를 넣는다고 말했다. 창병의 숨긴 찌르기에 후방 회피 동작을 연결한 사례가 있다. [PB-INT] | [미확인] 이번 검색에서는 해당 게임의 Realtime VFX 전문 분석이나 VFX 아티스트의 셰이더 분해를 확보하지 못했다. 확인된 개발자 인터뷰는 전투 신호에 관한 자료다. [PB-INT] | [미확인] 입자 수, 메시/플립북 비중, 디졸브 구현, HDR 밝기·채도 수치, VFX 전용 GDC 세션. [PB-INT] |

### GDC 자료를 구분해서 읽기

| 공개 세션 | 확인한 내용 | 이번 연구에서의 사용 범위 |
|---|---|---|
| GDC 2013, Julian Love — Technical Artist Bootcamp: The VFX of Diablo | [사실] GDC 목록에서 발표자·연도·세션을 확인했다. Realtime VFX 자료 목록은 이를 **Diablo III** 강연으로 안내한다. [G13] [RT-GDC] | [추정] 시리즈의 VFX 사고방식을 탐색하는 보조 자료로 둔다. Diablo IV 구현이나 예산의 출처로 옮겨 쓰지 않는다. 세션 재생 페이지 본문 접근은 타임아웃으로 제한됐다. [G13] [RT-GDC] |
| GDC 2017, Hadidjah Chamberlain / Jason Keyser — Artistic Principles of VFX | [사실] 공식 개요는 장르·스타일에 적용할 미술·게임플레이 원칙과 LoL/Hearthstone 사례를 다룬다고 명시한다. [G17] | [추정] 공통 원칙의 참고 틀로만 쓴다. 네 연구 대상 게임의 전용 세션으로 취급하지 않는다. 세부 강의 내용 전체를 시청·검증한 것은 아니다. [G17] |
| GDC 2018, Michael Lyndon — Zip! Thwack! Ping! Animation Principles of VFX | [사실] 공식 개요는 애니메이션의 12원칙을 VFX에 연결하고 도구보다 설계 이유에 초점을 맞춘다고 설명한다. [G18] | [추정] 아래 단계별 리듬을 설계하는 참고 틀이다. 정확한 프레임 수를 이 강연에서 가져왔다고 주장하지 않는다. [G18] |

## 2. 게임별 예고 → 접점 → 본체 → 잔여 비교

**[추정]** 여기서 예고는 위험·방향의 사전 신호, 접점은 맞닿는 순간의 확인, 본체는 에너지·형태의 주된 전개, 잔여는 후속 흔적과 종료 신호로 정의한다. 이는 비교를 위한 작성자의 분해법이다. 이동 투사체처럼 본체가 접점보다 먼저 보이는 효과도 있으므로 고정 재생 순서로 강제하지 않는다. 참고: [G18] [PB-INT].

| 게임 | 예고 | 접점 | 본체 | 잔여 |
|---|---|---|---|---|
| Diablo IV | [사실] 몬스터 예고·함정·피해 영역을 읽어야 할 정보로 명시한다. [D4] | [사실] 애니메이션/피해 영역 데이터로 충돌 위치와 방향에 맞는 피격 효과를 배치한다고 설명한다. [D4] | [사실] 시간에 따라 움직이는 피해 영역과 VFX를 맞추며, 강한 능력에 더 큰 시각 강도를 배정한다. [D4] | [미확인] 보편적인 잔여 길이·감쇠 곡선은 제시하지 않는다. [D4] |
| Hades | [미확인] 공개 인터뷰에 기술별 예고 시간표는 없다. [H-ART] | [추정] Barnett의 즉각적인 인상이라는 목표를 옮기려면 접점의 큰 명암 변화부터 설계할 수 있다. 원작의 정량 규칙은 아니다. [H-FX] | [추정] 커뮤니티가 제시한 원형 덩어리·흘러내림·방사형 요소 분해를 역할별 레이어 설계의 참고로 삼을 수 있다. [RT-H] | [미확인] 토론의 흘러내림이 원작에서 항상 판정 종료 뒤 잔여인지까지는 확인되지 않는다. [RT-H] |
| Path of Exile 2 | [미확인] 확인한 발표 소개와 보도자료에는 공통 예고 길이가 없다. [P2-TALK] [P2-PRESS] | [추정] 외부 아티스트의 방사형 블러 재현은 순간 운동감을 연구하는 후보이나, 원작 접점 셰이더로 확정할 수 없다. [P2-REBUILD] | [미확인] 본체가 메시·플립북·GPU 입자 중 무엇으로 구성됐는지 효과별로 검증하지 못했다. [P2-TALK] | [사실] 개발사는 Delirium 안개를 줄였다고 설명했다. 이는 지속 화면 효과의 절제 사례이며, 개별 스킬 잔여 타이밍의 증거는 아니다. [P2-PRESS] |
| Phantom Blade Zero | [사실] 대응할 수 있는 선행 동작을 붙여 숨긴 공격을 읽게 만든 사례가 있다. [PB-INT] | [미확인] 접점 플래시나 스파크의 고정 길이는 공개 인터뷰에 없다. [PB-INT] | [추정] 이 설명을 VFX에 적용한다면 무기·몸의 공격 궤적을 덮지 않는 방향성 효과가 적합한 가설이다. 실제 내부 규칙은 미확인이다. [PB-INT] | [미확인] 잔상·연무·파편의 구현과 종료 규칙은 확인하지 못했다. [PB-INT] |

## 3. 공통점 — 확인된 교집합과 적용 가설

- **[사실] 게임플레이 맥락이 효과의 강도를 결정한다는 설명이 반복된다.** Diablo IV는 읽기 우선순위, Hades 아트 디렉터는 디자인 우선 제작, Phantom Blade Zero 개발자는 대응 가능한 신호를 각각 강조한다. 같은 제작 규칙을 공유한다는 뜻은 아니다. [D4] [H-ART] [PB-INT]
- **[사실] 가독성은 더 강하게 빛내는 방식만으로 다루지 않는다.** PoE2 개발사의 안개 축소와 Phantom Blade Zero의 선행 동작 추가는 각각 덜 가리기와 의도 드러내기의 사례다. [P2-PRESS] [PB-INT]
- **[추정] 네 게임에서 배울 연구 방향은 ‘장식의 양’보다 ‘알아야 할 정보의 순서’다.** 위험 예고와 방향 → 접점 확인 → 주된 형태 → 빨리 정리되는 잔여로 역할을 나누고, 위험과 장식이 동시에 경쟁하지 않게 한다. 네 게임 모두가 이 4단계를 내부 표준으로 쓴다는 증거는 없다. [G17] [G18] [P2-PRESS] [PB-INT]
- **[추정] 실루엣을 먼저 만든다.** 단색 덩어리만으로 공격 방향·범위·접점이 읽힌 다음 색과 입자를 붙인다. 무기·적·탄의 윤곽을 지우는 부드러운 연무는 주된 형태가 안정된 뒤에만 검토한다. 이는 게임플레이 우선 원칙과 신호 설계에서 도출한 제안이다. [G17] [H-FX] [PB-INT]
- **[미확인] 공통 숫자 규격은 확보하지 못했다.** 동일한 예고 밀리초, 흰색 면적 비율, 채도 상한, 입자 수, 오버드로 배수를 네 게임의 공통 규칙으로 제시할 근거는 없다. [D4] [H-ART] [P2-PRESS] [PB-INT]

## 4. 색·밝기·채도 디렉션

| 항목 | 근거와 연구 적용안 |
|---|---|
| 밝기 위계 | [추정] 최고 밝기와 큰 면적의 동시 사용을 중요한 순간에만 배정한다. 반복 기본 공격과 지속 잔여가 적 탄의 윤곽보다 먼저 눈에 들어오면 밝기·면적·지속시간을 함께 줄이는 후보로 삼는다. 고정 HDR 수치는 미정이다. [G17] [P2-PRESS] |
| 환경과의 관계 | [사실] Diablo IV는 조명을 받는 VFX를 사용하면서, 중요한 신호가 어둠에 묻히지 않도록 PBR 규칙을 예술적으로 조정한다고 설명한다. [D4] |
| 색상 역할 | [추정] 피해 속성의 색과 대응 행동의 색을 별도 표로 설계한다. 공격 의도를 알려야 한다는 개발자 설명에서 도출한 제안이며, Phantom Blade Zero의 실제 색상 대응표를 확인했다는 뜻은 아니다. [PB-INT] |
| 색만으로 구별하지 않기 | [추정] 위험은 윤곽·형태·움직임도 함께 구별한다. 같은 색 장판 위에서도 탄의 진행 방향과 경계를 찾을 수 있는지를 후속 판정 항목으로 둔다. [G17] [PB-INT] |
| 채도 | [추정] 본체의 식별색은 유지하되 넓은 잔여와 배경성 연무는 채도를 낮추는 후보로 둔다. 무조건 저채도화하지 말고, 탈채도 때문에 신호까지 사라지는지도 비교해야 한다. 원작의 HSV/HSL 상한은 미확인이다. [G17] [RT-H] |
| 평면적인 색 덩어리 | [사실] Hades 재현 토론에서는 색을 일치시킨 평평한 레이어와 경계가 뚜렷한 그라디언트 맵을 제안한다. [추정] 픽셀풍에서는 이를 색 단계와 큰 형태를 통일하는 참고로 쓸 수 있다. 원작 셰이더 확인은 아니다. [RT-H] |
| 가산 합성 | [사실] URP Particles Unlit의 Additive는 배경에 색을 더한다. [추정] 작은 발광 접점에 우선 검토하고, 넓은 본체·연무까지 겹쳐 하얀 면이 되는 구성은 피한다. Alpha/Premultiply 대안도 같은 배경에서 비교한다. [U-SHADER] |

## 5. 파티클 수·오버드로 예산

### 원작 숫자의 확인 상태

| 게임 | 효과당/화면당 입자 수 | 오버드로 상한·GPU ms | 판단 |
|---|---|---|---|
| Diablo IV | [미확인] | [미확인] | 공개 철학 설명을 숫자 예산으로 바꿔 적지 않는다. [D4] |
| Hades | [미확인] | [미확인] | 인터뷰의 누적 FX 애니메이션 프레임 수는 동시 입자 수나 렌더링 예산이 아니다. [H-ART] |
| Path of Exile 2 | [미확인] | [미확인] | 발표 소개·안개 개선 보도자료·채용 글에서 효과별 상한은 확인되지 않는다. [P2-TALK] [P2-PRESS] [RT-GGG] |
| Phantom Blade Zero | [미확인] | [미확인] | 전투 신호에 관한 인터뷰에서 예산을 추출할 수 없다. [PB-INT] |

**[사실]** Unity는 겹치는 투명 UI·입자·스프라이트를 주요 오버드로 원인으로 들고, 픽셀 처리량이 병목일 때 오버드로와 프래그먼트 셰이더 비용을 줄이도록 안내한다. 따라서 입자 개수 하나로 렌더링 비용을 판정할 수 없다. [U-PERF]

**[추정]** 연구용 예산표는 아래처럼 채운다. 숫자는 목표 하드웨어·출력 해상도·최악의 동시 시전 장면을 정한 뒤 측정으로 확정한다. 이번 문서는 실행 금지 범위이므로 빈칸을 임의의 업계 표준값으로 채우지 않는다. [U-PERF] [U-CHOOSE]

| 예산 단위 | 정할 항목 | 이번 상태 |
|---|---|---|
| 효과 한 개 | 최대 생존 입자 수, 방출률, 수명, 버스트·서브 이미터 수, 투명 카드 면적 | [미확인] 프로젝트 측정 전. 비용 검토 근거: [U-PERF] [U-RENDER] |
| 동시에 켜진 효과 | 효과 종류별 동시 수, 전체 생존 입자 수, 전체 렌더러·드로콜 수 | [미확인] 실전 장면 측정 전. 참고: [U-CHOOSE] [U-MESH] |
| 화면의 위험 구역 | 영웅·적 탄·예고 위에 겹치는 투명 레이어와 가려진 경계 | [추정] 성능 상한과 별도로 가독성 실패를 판정한다. [G17] [PB-INT] |
| 프레임 시간 | VFX를 포함한 전체 CPU/GPU 시간과 VFX 유무에 따른 변화 | [미확인] 목표 기기·해상도·목표 프레임레이트·VFX 할당 시간 모두 실측 전. [U-PERF] |

- **[추정] 입자 수 추산:** 일정 방출률 `r`, 일정 수명 `L`이고 버스트·서브 이미터·조기 제거가 없는 정상 상태라면 생존 수를 대략 `r × L`로 계산할 수 있다. 화면 예산은 이를 동시 효과 수까지 합산하는 식으로 시작한다. 실제 엔진 상한이나 측정값을 대신하지 않는 산술 추산이다. 제어 항목의 참고: [U-CHOOSE] [U-RENDER].
- **[추정] 화면 면적 추산:** 투명 카드들의 화면상 면적 합을 화면 면적으로 나눈 값을 보조 지표로 기록할 수 있다. 같은 값이어도 국소 중첩·깊이 테스트·셰이더·해상도가 달라 실제 GPU 시간은 다르다. 이 값을 하드웨어 오버드로 실측치라고 부르지 않는다. [U-PERF]
- **[추정] 감축 순서:** 판정과 무관한 잔여 → 넓은 연무 → 중복 발광층 → 보조 입자를 먼저 줄인다. 예고와 탄의 경계는 유지한다. 입자 수만 줄이고 큰 투명 카드를 남기는 최적화는 별도로 검토한다. [P2-PRESS] [U-PERF]
- **[사실]** Unity 비교표의 Shuriken ‘수천’, VFX Graph ‘수백만’은 가능한 규모를 설명하는 개략치다. **[추정]** 이를 우리 게임에서 허용할 동시 수나 목표 품질로 채택하지 않는다. [U-CHOOSE]

## 6. 셰이더 기법 — 재현 방법과 원작 증거를 분리

| 기법 | 확인한 기능 | 연구 적용 제안과 비용 주의 |
|---|---|---|
| 디졸브 | [사실] URP Particles Unlit의 Alpha Clipping은 임계값 아래 픽셀을 버린다. [미확인] 이것만으로 네 게임의 디졸브 구현은 증명되지 않는다. [U-SHADER] | [추정] 큰 형태의 마스크와 진행값을 비교해 접점 이후 본체를 걷어내는 방식으로 시험할 수 있다. 임계 가장자리 전체를 밝히거나 미세한 점으로 오래 남기는 연출은 탄과 경쟁하므로 제외 후보로 둔다. 클리핑만 켰다고 비용이 해결된다고 가정하지 않는다. [U-SHADER] [U-PERF] |
| 플립북 | [사실] Shuriken Texture Sheet Animation은 텍스처 격자를 프레임으로 재생하며 수명·속도·FPS 기반 선택을 지원한다. Shader Graph Flipbook 노드는 격자와 타일 번호로 UV를 만든다. [U-SHEET] [U-FLIP] | [추정] 접점·칼날 형태처럼 실루엣과 타이밍이 중요한 부분을 적은 수의 카드로 제어하는 후보로 둔다. 불필요한 프레임 보간은 픽셀 경계와 비용 양쪽에서 검토한다. [U-SHEET] [U-SHADER] |
| 메시 VFX | [사실] Shuriken은 Billboard와 Mesh 렌더 모드를 제공한다. VFX Graph에도 Output Particle Mesh가 있다. 다중 메시 출력은 추가 드로콜과 정렬 제약을 갖는다. [U-RENDER] [U-MESH] | [추정] 칼의 방향성 띠·지면을 따르는 충격 형태·짧은 파편에 검토한다. 투명 메시라면 여전히 중첩 비용이 있으며, 메시라는 이유만으로 싸다고 판단하지 않는다. [U-MESH] [U-PERF] |
| 그라디언트·UV 왜곡·SDF | [사실] Hades 커뮤니티 토론은 방사형 그라디언트, 왜곡 UV, 경계가 좁은 그라디언트 맵과 SDF 조합을 대안으로 제시한다. 원작 구현 확인은 아니다. [RT-H] | [추정] 색 단계를 통일하고 큰 덩어리를 연결하는 방법으로 연구한다. 미세 노이즈·과도한 왜곡보다 읽히는 바깥 윤곽을 먼저 정한다. [RT-H] [G17] |
| 방사형 블러 | [사실] 외부 아티스트는 PoE2에 영감을 받아 UE5에서 렌더 타깃을 이용한 화면 공간 블러를 만들었고 최적화가 목적은 아니라고 밝혔다. [P2-REBUILD] | [추정] 픽셀풍 탄막 전투에서는 탄·바닥 신호까지 흐릴 위험이 있으므로 기본 채택 대상으로 삼지 않는다. 제한된 영역·짧은 순간의 후보라도 별도 가독성 검증이 필요하다. [P2-REBUILD] [PB-INT] |

## 7. 픽셀풍과 섞는 방법

- **[사실]** Unity 6000.0의 Pixel Perfect Camera 자료는 여러 해상도에서 픽셀 아트의 선명도와 움직임의 안정을 유지하는 2D 카메라 기능을 설명한다. **[미확인]** 이 설명이 원근 3D 장면 전체와 모든 VFX를 자동으로 픽셀화한다는 근거는 아니다. [U-PIXEL]
- **[추정]** 먼저 효과의 출력 픽셀 크기·색 단계·경계 두께를 캐릭터와 맞춘다. 3D 원근 장면에서는 캐릭터와 핵심 VFX를 같은 저해상도 합성 경로에 놓고 정수 확대하는 안을 검토하되, 2D Pixel Perfect Camera를 원근 카메라에 그대로 대입하지 않는다. 구체 렌더 패스는 후속 구현 과제다. [U-PIXEL] [U-FEATURE]
- **[추정]** 플립북의 선명한 외곽과 단계형 색을 우선하고, 프레임 간 보간은 기본 후보에서 뺀다. 부드러운 연무를 추가하더라도 영웅·탄의 경계와 다른 픽셀 밀도로 튀지 않는지 확인한다. Hades를 픽셀 아트 게임 또는 이 합성 경로의 실증 사례로 부르지 않는다. [RT-H] [H-ART] [U-SHADER]
- **[추정]** 이동·회전에서 형태가 깜빡이거나 가느다란 탄이 사라지면 장식 디테일보다 탄의 최소 화면 두께와 경계를 먼저 수정하는 후보로 삼는다. 정지 확대 화면만으로 일치 판정을 내리지 않는다. [U-PIXEL] [PB-INT]
- **[미확인]** 네 게임에서 우리와 동일한 픽셀 합성·팔레트·Point 필터링 체계를 사용한다는 근거는 확보하지 못했다. 위 항목은 전용 적용 제안이다. [D4] [H-ART] [P2-TALK] [PB-INT]

## 8. 탄막을 가리지 않게 하는 절제

다음은 모두 **[추정] 적용 제안**이다. 출발점은 반응할 정보를 먼저 제공한다는 개발자 설명과, 지속 화면 효과를 줄인 PoE2의 사례다. [PB-INT] [P2-PRESS]

1. **보호할 정보를 먼저 정한다.** 적 탄의 중심·윤곽·진행 방향, 피해 영역 경계, 영웅의 위치와 발밑을 보호 대상으로 둔다. 아군 장식이 이 중 하나를 못 읽게 하면 가독성 실패로 기록한다. [G17] [PB-INT]
2. **공간을 비운다.** 큰 본체를 외곽으로 전개하거나 내부를 비우고, 영웅 주변과 탄 진행선 위의 연무·발광 면적을 줄인다. 효과를 더 밝게 덧그리는 방식보다 먼저 검토한다. [P2-PRESS] [U-PERF]
3. **접점과 지속 영역을 다르게 만든다.** 순간 접점은 좁고 분명하게, 지속 판정은 경계가 남도록, 판정이 끝난 잔여는 신속히 감쇠하도록 설계한다. 실제 위험이 남았는데 장판을 없애거나, 위험이 끝났는데 동등한 경고색을 남기는 구성은 피한다. [G18] [PB-INT]
4. **아군 효과 감축은 장식에 적용한다.** 연무·잔상·보조 입자의 수명과 밀도를 낮추되 피해 범위·투사체·충돌 규칙을 감축하지 않는다. 이 연구로 Core 수치나 동시 공격 제한 변경을 제안하지 않는다. [G17] [P2-PRESS]
5. **렌더 순서만으로 해결했다고 보지 않는다.** 탄을 항상 위에 그리는 안도 깊이감·지형 가림을 검토해야 한다. 투명도·합성·국소 밝기까지 실제 카메라에서 함께 확인할 후속 과제로 둔다. [U-RENDER] [U-SHADER]
6. **최악의 중첩을 판정 장면으로 삼는다.** 아군 반복 공격·궁극기·적 장판·탄이 겹칠 때와 효과가 사라질 때를 비교한다. 흑백 비교와 색만 본 비교도 보조로 쓰되, 최종 판정은 실제 속도의 무음 플레이에서 위험을 읽는지로 한다. 이번 조사에서 실행 검증한 항목은 아니다. [G17] [P2-PRESS] [PB-INT]

## 9. Unity 6000.0 / URP — VFX Graph와 Shuriken 비교

**[사실]** 아래는 Unity 6000.0 매뉴얼과 VFX Graph 17.0 문서의 기능 비교다. **[미확인]** 현재 프로젝트에 설치된 패치·패키지·렌더러 설정과 Player 동작은 조사하지 않았다. 문서상 기능 지원과 우리 프로젝트의 작동 확인을 구별한다. [U-CHOOSE] [U-REQ]

| 항목 | Shuriken / Built-in Particle System | VFX Graph | 적용 판단 |
|---|---|---|---|
| 시뮬레이션·저작 | [사실] CPU 파티클로 분류되며 모듈식 Inspector 저작을 제공한다. [U-FEATURE] [U-CHOOSE] | [사실] GPU 시뮬레이션과 그래프 저작을 제공한다. [U-CHOOSE] | [추정] 소규모 핵심 효과는 조정과 검수의 단순성, 다량 보조 효과는 CPU/GPU 병목을 기준으로 고른다. [U-CHOOSE] |
| URP 지원 | [사실] 지원한다. Built-in/HDRP도 비교표에 포함된다. [U-CHOOSE] | [사실] URP/HDRP를 지원하며 Built-in Render Pipeline은 지원하지 않는다. [U-FEATURE] | [추정] URP 전체 기능과 VFX Graph 기능이 같다고 가정하지 않는다. [U-FEATURE] |
| 하드웨어·색 공간 | [미확인] 이번 자료만으로 모든 대상 기기 지원을 보장하지 않는다. [U-CHOOSE] | [사실] 17.0 요구사항은 Compute Shader·SSBO 지원을 요구하고 OpenGL ES와 URP Gamma 색 공간을 지원하지 않는다고 명시한다. [U-REQ] | [추정] Linear·그래픽 API·대상 GPU를 먼저 고정하고 검증할 항목이다. 이번에 프로젝트 설정을 바꾸지 않는다. [U-REQ] |
| 스크립트·물리 | [사실] C# 입자 읽기/쓰기, Unity 물리 상호작용과 충돌 이벤트를 제공한다. [U-CHOOSE] | [사실] 노출 속성·이벤트로 제어하며 그래프에서 정의한 요소와 상호작용한다. [U-CHOOSE] | [추정] 핵심 탄 판정을 GPU 장식 입자에 맡기지 않고 게임 판정과 표현을 분리하는 안이 검토하기 쉽다. [U-CHOOSE] |
| 플립북 | [사실] Texture Sheet Animation 및 URP 입자 셰이더의 프레임 블렌딩을 사용할 수 있다. [U-SHEET] [U-SHADER] | [사실] URP 기능표에 플립북 블렌딩이 지원으로 표기돼 있다. [U-FEATURE] | [추정] 픽셀 경계가 중요하면 보간 유무를 명시한다. 지원 기능을 모두 켜는 것이 목표는 아니다. [U-SHADER] |
| 메시 | [사실] Mesh 렌더와 호환 셰이더를 통한 Mesh GPU Instancing을 제공한다. GPU 렌더링 최적화와 CPU 시뮬레이션 분류는 별개다. [U-RENDER] [U-FEATURE] | [사실] 메시 출력·화면 크기 기반 LOD를 제공한다. 다중 메시에는 드로콜·정렬 주의사항이 있다. [U-MESH] | [추정] 칼날 형태·큰 파편은 메시 후보, 접점은 플립북 후보로 나눠 실제 비용을 비교한다. [U-RENDER] [U-MESH] |
| 조명 | [사실] URP에 Lit/Simple Lit/Unlit 입자가 지원된다. [U-FEATURE] | [사실] URP에 Lit/Unlit은 지원되나 Simple Lit은 미지원으로 표기돼 있다. [U-FEATURE] | [추정] 핵심 신호의 명도 안정성과 배경성 효과의 조명 반응을 구분해 설계한다. 정확한 출력 셰이더 조합은 별도 확인한다. [U-FEATURE] |
| 왜곡·반해상도 | [사실] Shuriken URP 왜곡은 기능표상 지원이다. [U-FEATURE] | [사실] 같은 표에서 VFX Graph의 URP 왜곡과 Half-resolution은 미지원이다. [U-FEATURE] | [추정] HDRP 사례를 옮기며 동일 기능을 가정하지 않는다. 커스텀 우회 구현은 이 문서의 검증 범위 밖이다. [U-FEATURE] |
| 2D 혼합 | [사실] Renderer 모듈에 Sorting Layer와 Order in Layer 설정이 있다. [U-RENDER] | [사실] URP 표는 3D 입자·정렬 레이어/스프라이트 지원을 적되, 2D Physics·2D Sprite Emitter·2D Lights 미지원을 적고 있다. [U-FEATURE] | [추정] 픽셀풍 외형만으로 2D Renderer 기능과의 완전 호환을 판단하지 않는다. [U-FEATURE] |
| 성능 결론 | [추정] 적은 입자여도 넓은 투명 카드·복잡한 셰이더는 검토 대상이다. [U-PERF] | [추정] GPU 시뮬레이션을 써도 투명 픽셀을 그리는 비용은 별도로 남는다. [U-PERF] [U-CHOOSE] | [미확인] 우리 장면에서 어느 쪽이 빠른지는 실행·프로파일링 전이다. [U-PERF] |

### 문서 불일치와 버전 경계

- **[사실]** 6000.0의 입자 시스템 선택 문서는 카메라 색/깊이 버퍼 접근을 HDRP 항목으로 설명하지만, 같은 버전의 파이프라인 기능표는 URP VFX Graph에도 Camera Buffer와 Depth collision/Color buffer를 지원으로 표시한다. **[미확인]** 이 문서 차이만으로 설치된 패키지의 정확한 동작을 결정할 수 없다. URP 버퍼 접근을 일괄 미지원이라고 단정하지 않고 후속 버전 확인 항목으로 둔다. [U-CHOOSE] [U-FEATURE]
- **[사실]** VFX Graph 17.0 요구사항 페이지에는 오래된 URP preview 설명도 남아 있으며, Mesh 출력 페이지는 기존 Lit Mesh 변형을 HDRP 전용으로 설명한다. 한편 6000.0 기능표는 URP Lit 입자를 지원으로 표시한다. **[추정]** 따라서 ‘URP Lit 지원’과 특정 출력 컨텍스트/셰이더 조합의 지원을 구분해서 검토해야 한다. [U-REQ] [U-MESH] [U-FEATURE]

## 10. 후속 검토에 넘길 방향

- **[추정] 1차 후보:** 예고 경계·접점·본체 실루엣은 제어하기 쉬운 기존 플립북/메시와 Shuriken으로 구성하고, VFX Graph는 판정과 무관한 보조 효과에 한정해 비교한다. 이는 비교 문서에서 도출한 보수적인 시작안이며 엔진별 속도 우열의 결론은 아니다. [U-CHOOSE] [U-SHEET] [U-MESH]
- **[추정] 합격 기준:** 색을 빼도 방향과 접점이 읽히고, 아군 효과가 겹쳐도 탄의 경계가 남으며, 위험이 끝나면 잔여가 다음 예고와 혼동되지 않아야 한다. 실제 카메라·출력 크기·움직임에서 후속 검증한다. [G17] [G18] [PB-INT]
- **[미확인] 남은 관문:** 실제 Player 가독성, 픽셀 합성의 시간적 안정성, 목표 기기의 CPU/GPU ms, 동시 입자·오버드로 예산, 설치된 Unity/URP/VFX Graph 버전별 기능. 이 문서 작성은 구현·성능·시각 품질 통과를 의미하지 않는다. [U-PERF] [U-PIXEL] [U-REQ]

## 출처 목록과 확인 범위

모두 2026-11-05 확인. 아래 목록은 링크 식별용이며, 본문 주장은 해당 문장·표 셀의 링크로 연결했다.

| 기호 | 자료·발행 시점 | 읽은 범위 |
|---|---|---|
| [D4] | Blizzard, Diablo IV Quarterly Update—December 2021 | 공식 개발 일지의 Visual Effects 절 |
| [H-ART] | MCV/DEVELOP, Jen Zee 인터뷰, 2021-06-07 | 인터뷰 원문 텍스트; 제작자 발언을 1차 증언으로 사용 |
| [H-FX] | Josh Barnett, Hades 1.0 + Thoughts on Art & Personal Growth, 2020-09-19 | 제작자 회고 텍스트 |
| [P2-TALK] | GGG, Rendering Path of Exile 2 안내, 2023-11-01 | 공식 발표 소개; 영상 세부 기술은 검증하지 않음 |
| [P2-VIDEO] | GGG 공식 YouTube, ExileCon 2023 - Rendering Path of Exile 2 | 공식 게시 위치; 영상 다운로드·시청 분석 없음 |
| [P2-PRESS] | GGG 배포 보도자료, The Last of the Druids, 2025-12-05 | Games Press 게재 보도자료의 가독성·안개 축소 설명; 현재 모든 콘텐츠의 상태로 일반화하지 않음 |
| [P2-REBUILD] | Raúl Fernández Guardia, PoE2에서 영감을 받은 UE5 블러 재현 | 아티스트 자신의 공개 설명; GGG 내부 기술 증언이 아님 |
| [PB-INT] | Epic Games Store News, S-GAME 개발자 인터뷰, 2025-12-12 | 개발자 직접 발언; 전투 신호에 한정 |
| [RT-D4] | Realtime VFX, Diablo IV VFX References, 2024-07-07 | 커뮤니티 포트폴리오 모음의 텍스트; 연결된 영상/에셋 미수집 |
| [RT-H] | Realtime VFX, Hades Material/VFX Help, 2024-01 | 질문·답변 텍스트; 재현 가설을 원작 구현과 구별 |
| [RT-GGG] | Realtime VFX, GGG VFX 채용 글, 2023-05-22 | 개발사 게시 채용 설명; 게임별 기술 분석 자료는 아님 |
| [RT-GDC] | Realtime VFX, Useful, free GDC talks, 2016-09 | 공개 세션 소개와 Diablo III 구분 |
| [G13] | GDC 2013, Julian Love | 검색 색인의 공식 세션 목록·개요; 본문 재접근 타임아웃 |
| [G17] | GDC 2017, Artistic Principles of VFX | 공식 세션 개요·발표자·사례 게임 |
| [G18] | GDC 2018, Zip! Thwack! Ping! | 공식 세션 개요·발표자·주제 |
| [U-CHOOSE] / [U-FEATURE] | Unity 6000.0 시스템·파이프라인 비교 | 공식 문서 텍스트; 실제 프로젝트 설정 미검증 |
| [U-REQ] / [U-MESH] | Unity VFX Graph 17.0 문서 | 요구사항·메시 출력·제약; 오래된 설명은 본문에 표시 |
| [U-SHEET] / [U-RENDER] | Unity 6000.0 Particle System 모듈 | 공식 기능·제약 |
| [U-SHADER] / [U-FLIP] | Unity 6000.0 URP 입자 셰이더 / Shader Graph 17.0 | 공식 합성·클리핑·플립북 설명 |
| [U-PERF] / [U-PIXEL] | Unity 6000.0 성능 / Pixel Perfect 소개 | 공식 텍스트; Pixel Perfect는 접근 가능한 중국어 판 확인 |

[D4]: https://news.blizzard.com/en-us/article/23746639/diablo-iv-quarterly-updatedecember-2021
[H-ART]: https://mcvuk.com/business-news/behind-the-art-of-hades-we-value-artistic-integrity-and-excellence-in-artistic-craft-at-supergiant-however-were-first-and-foremost-a-game-design-lead-team/
[H-FX]: https://kirbyufo.com/2020/09/19/hades-1-0-thoughts-on-art-personal-growth/
[P2-TALK]: https://www.pathofexile.com/forum/view-thread/3447463/filter-account-type/staff
[P2-VIDEO]: https://www.youtube.com/watch?v=TrHHTQqmAaM
[P2-PRESS]: https://www.gamespress.com/en-US/Unleash-the-wild-within-as-Path-of-Exile-2-The-Last-of-the-Druids-arri
[P2-REBUILD]: https://www.linkedin.com/posts/ra%C3%BAl-fern%C3%A1ndez-guardia-38718b207_ive-been-playing-path-of-exile-2-quite-activity-7320773493032132610-1GqY
[PB-INT]: https://store.epicgames.com/news/phantom-blade-zero-interview-kung-fu-combat-approachability-authentic-wuxia-homage?lang=en-US
[RT-D4]: https://realtimevfx.com/t/diablo-iv-vfx-references/27007
[RT-H]: https://realtimevfx.com/t/hades-material-vfx-help/25344
[RT-GGG]: https://realtimevfx.com/t/hiring-vfx-artists-for-path-of-exile-grinding-gear-games/23224
[RT-GDC]: https://realtimevfx.com/t/useful-free-gdc-talks/219
[G13]: https://gdcvault.com/play/1017660/Technical-Artist-Bootcamp-The-VFX
[G17]: https://gdcvault.com/play/1023943/Visual-Effects-Bootcamp-Artistic-Principles
[G18]: https://www.gdcvault.com/play/1025301/Visual-Effects-Bootcamp-Zip-Thwack
[U-CHOOSE]: https://docs.unity3d.com/6000.0/Documentation/Manual/ChoosingYourParticleSystem.html
[U-FEATURE]: https://docs.unity3d.com/6000.0/Documentation/Manual/render-pipelines-feature-comparison.html
[U-REQ]: https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.0/manual/System-Requirements.html
[U-MESH]: https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.0/manual/Context-OutputParticleMesh.html
[U-SHEET]: https://docs.unity3d.com/6000.0/Documentation/Manual/PartSysTexSheetAnimModule.html
[U-RENDER]: https://docs.unity3d.com/6000.0/Documentation/Manual/PartSysRendererModule.html
[U-SHADER]: https://docs.unity3d.com/6000.0/Documentation/Manual/urp/particles-unlit-shader.html
[U-FLIP]: https://docs.unity3d.com/Packages/com.unity.shadergraph@17.0/manual/Flipbook-Node.html
[U-PERF]: https://docs.unity3d.com/6000.0/Documentation/Manual/OptimizingGraphicsPerformance.html
[U-PIXEL]: https://docs.unity3d.com/cn/6000.0/Manual/urp/2d-pixelperfect-intro.html
