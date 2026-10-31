# HD-2D A2 분리 시험 — 2026-10-31

사용자 브리프 I:/EXODUSER-Storage/codex-takeover/hd2d-brief.md에 따른 두 번째 미술 방향 시안. 본편 unity/main·바탕화면 실행본에 통합하지 않는다.

| 항목 | 시험 계약 |
|---|---|
| 소유 | G:/exoduser-wt/codex-hd2d, codex/pc-hd2d-trial-20261031 |
| 범위 | CH1-1 승인 A2 목교 구도의 독립 장면. Core·게임 규칙·저장·제품 빌드 설정 변경0 |
| 원본 | Blender woodbridge-r3/source/승인구도_납품동일.blend에서 보이는 Baked 재질 메시를 FBX로 추출. 원본·타인 WIP 변경0. R3 텍스처·재질 GUID 보존 |
| 장면 | Assets/Exoduser/HD2DTrial/HD2D_A2_Trial.unity, Editor/Hd2dTrialBuilder.cs로 제작. 전용 HD2DTrial asmref→Exoduser.Runtime. 단일 타임라인은 FindAnyObjectByType으로 조회 |
| 스프라이트 | 기존 player/north-east.png(1008×48,48셀), attack-bat-v1.png(720×640,80셀·북동3행), enemy/atlas_ch1_8dir_south_west.png(2048×1280,256셀·0/1/9번) |
| 픽셀 | URP GlobalSamplers의 단일 sampler_PointClamp·LOD0·TAA/MSAA 없음. 정사영 반높이8.4375u,1080p에서.015625u(1/64m)/화소. 영웅3u/48셀·공격5u/80셀=원본1픽셀당4화소. 적3u/64격자=3화소. 카메라/액터 화면좌표를1화소 격자에 정렬 |
| 조명 | URP 실제 주광·추가 점광. 주광1.65/RGB(.84,.88,1)·실제 카메라 회전×Euler(12,−25,0)·ambient SH(.24,.27,.30), 횃불4.5±(.25sin6t+.12sin11t),반경7u; 접점광5/5u |
| 접지 | 별도 SoftSurface 타원그림자 alpha.68,영웅.84375×.53125u·적1.25×.53125u. 빌보드 직접 광원,4방향 이웃 alpha의 최소값으로 원본1픽셀 윤곽 림=원본RGB×.25×주광색. 원본 영웅 하단 픽셀의 아래 경계(+1)를 기준으로 걷기/공격 centre lift1.1875u,적64격자 Point 샘플 하단47/48/47행의 lift.75/.796875u. 다리/강둑 두 메시의 전용 MeshCollider 광선 질의로 바닥높이+.018u에 접지. 실제 투사 그림자·자연 전투 인증과 다름 |
| 안개 | ExponentialSquared .013 + 24단계 광선 적분 높이 안개/광로. 확률 샘플·점·노이즈 디더링0 |
| 후처리 | ACES,노출+.30,채도−10,bloom threshold1.05/intensity.22/scatter.65. Gaussian 원경 초점+5~+23u·반경1.2. ARGB32 sRGB RT→동일 출력 RT→PNG, 수동 감마 변환 없음. 캡처용 상하 틸트시프트9탭·최대5화소,초점대 화면Y.27~.70 |
| 재생 | 0~4초 접근1.4u,4~10초1.45초 주기 연출. 공격.72초/9자세,접점.27~.55초. 카메라 횡팬 진폭.140625u=9화소,슬래시2.25u·up.6875u,접점광 높이.8125u,불꽃.25×.53125u. 적 근접·피격은 연출이며 실제 AI/명중/데미지 없음 |
| 캡처 | MCP 원본 캡처는 임시1920×1080 RT/aspect 설정 뒤 원상복원. 최종 탐험t1·전투t5.82초,각1920×1080. Editor update에서1장씩 비동기300장/30fps=10초,30장마다 진행 기록,고정시간·무음. 원본3D와 승인A2를 함께 3열 비교 |
| 출력 | G:/exoduser/tmp/design-review/20261031_hd2d의 기존 연결→I:/EXODUSER-Storage/archive/G/exoduser/tmp/design-review/20261031_hd2d |
| 실행 | exo-unity.ps1 예약 mcp-codex-hd2d → 단일 잠금 → MCP 실제 경로 대조 → Build → 컴파일/셰이더/장면 검수 → 캡처 → 자기 서버·예약 반환 |
| 판정 | 최종1080p2장·300프레임/30fps10초·3열1x 비교·MP4디코딩 검수 완료. VISUAL VERDICT: RETOUCH. 자연 플레이/제품 PASS 미주장 |

유료 생성0. 추가 스프라이트 제작·노이즈 텍스처·본편 자동 반영0. R3 원본의 Poly Haven CC0 출처는 원본 REPORT.md와 출처-원본영수증.json을 보존한다. 이 시안의 실제 원본/납품 SHA는 출력 source/provenance.json에 기록한다.

첫 실제 캡처는 주광 역방향/선형 출력/푸른 림/수면 평행띠로 FAIL, 출력 failed-v1에 원본·소스 보존. 두 번째는 카메라 기준 주광·ambient SH·원본색 림·sRGB와 교차 변형 저대비 수면으로 원인을 수정한다.

V2 실제 캡처의 적3개 흰 사각형은 기존 .mat 경로에 CreateAsset 재호출 후 BaseMap NULL/UV 초기값으로 확인했다. 기존 재질을 재사용하고 타임라인이 매 프레임 BaseMap·UV·64격자를 재설정한다. V2 수동 감마 중복 변환을 제거하고 표준 ARGB32 출력으로 전환했다. V2 실패 캡처·소스는 failed-v2에 보존한다.

최종 정리: R3 Hanging_Moss 반복 알파 면은 화면의 점상 섬유를 만들므로 시안 전용 인스턴스에서 표시를 제외했다. 독액 패치는120×180u UV 좌표로 변형한다(밝기 .72±.32, 발광패치와 정반사). 기존 큐브 안개의 on/off 캡처 차이0을 확인하여 채택하지 않고, 직교 카메라 origin/right/up/forward와 실제 depth로24단계 적분하는 전면 안개면으로 전환한다. 저층밀도.035,광로.02.

후처리 VolumeProfile은 기존 경로를 재사용하고 Bloom/DOF/ACES/ColorAdjustments를 명시적인 subasset으로 저장하여 재로드 후 빈 프로필을 방지한다. 독액 녹색 점광2개: (−4,.4,0)/(4,.4,−2),RGB(.48,.65,.08),강도.75,반경8u.

최종 실측: Editor PID47708, 세 스프라이트 Point, 후처리4개·적 BaseMap 재로드 유지, 임시 RT 원상복원. 300프레임×4액터의 격자 오차 최대.0007324219px. 사용자 저장24파일 변경0. MP4 H.264/1920×1080/30fps/300프레임/10.000초, 전체 디코딩 오류0. 자기 Editor·잠금·예약 반환 완료. 재개 OnEnable은 유효 참조에서 t1을 초기화한다. 최종 SHA·출력 SHA는 I: 출력 source/final-delivery.json에 기록한다.
