# HD-2D A2 분리 시험 — 2026-10-31

사용자 브리프 I:/EXODUSER-Storage/codex-takeover/hd2d-brief.md에 따른 두 번째 미술 방향 시안. 본편 unity/main·바탕화면 실행본에 통합하지 않는다.

| 항목 | 시험 계약 |
|---|---|
| 소유 | G:/exoduser-wt/codex-hd2d, codex/pc-hd2d-trial-20261031 |
| 범위 | CH1-1 승인 A2 목교 구도의 독립 장면. Core·게임 규칙·저장·제품 빌드 설정 변경0 |
| 원본 | Blender woodbridge-r3/source/승인구도_납품동일.blend에서 보이는 Baked 재질 메시를 FBX로 추출. 원본·타인 WIP 변경0. R3 텍스처·재질 GUID 보존 |
| 장면 | Assets/Exoduser/HD2DTrial/HD2D_A2_Trial.unity, Editor/Hd2dTrialBuilder.cs로 제작. 전용 HD2DTrial asmref→Exoduser.Runtime. 단일 타임라인은 FindAnyObjectByType으로 조회 |
| 스프라이트 | 기존 player/north-east.png(1008×48,48셀), attack-bat-v1.png(720×640,80셀·북동3행), enemy/atlas_ch1_8dir_south_west.png(2048×1280,256셀·0/1/9번) |
| 픽셀 | URP GlobalSamplers의 단일 sampler_PointClamp·LOD0·TAA/MSAA 없음. 정사영 반높이13.5u,1080p에서.025u/화소. 영웅4.8u/48셀·공격8u/80셀=원본1픽셀당4화소. 적4.8u/64격자=3화소. 카메라/액터 화면좌표를1화소 격자에 정렬 |
| 조명 | URP 실제 주광·추가 점광. 주광1.05/차가운 RGB(.71,.81,1), 횃불4.5±(.25sin6t+.12sin11t),반경7u; 접점광5/5u |
| 접지 | 별도 SoftSurface 타원그림자 alpha.68,영웅1.35×.85u·적2×.85u. 빌보드 직접 광원,4방향 이웃 alpha의 최소값으로 원본1픽셀 윤곽 림 RGB(.10,.13,.16)×주광색. 다리/강둑 두 메시의 전용 MeshCollider 광선 질의로 바닥높이+.018u에 접지. 실제 투사 그림자·자연 전투 인증과 다름 |
| 안개 | ExponentialSquared .013 + 24단계 광선 적분 높이 안개/광로. 확률 샘플·점·노이즈 디더링0 |
| 후처리 | ACES,노출+.30,채도−10,bloom threshold1.05/intensity.22/scatter.65. Gaussian 원경 초점+5~+23u·반경1.2. 캡처용 상하 틸트시프트9탭·최대5화소,초점대 화면Y.27~.70 |
| 재생 | 0~4초 접근1.4u,4~10초1.45초 주기 연출. 공격.72초/9자세,접점.27~.55초. 적 근접·피격은 연출이며 실제 AI/명중/데미지 없음 |
| 캡처 | MCP 원본 캡처는 임시1920×1080 RT/aspect 설정 뒤 원상복원. 최종 탐험t1·전투t5.82초,각1920×1080. Editor update에서1장씩 비동기300장/30fps=10초,30장마다 진행 기록,고정시간·무음. 원본3D와 승인A2를 함께 3열 비교 |
| 출력 | G:/exoduser/tmp/design-review/20261031_hd2d의 기존 연결→I:/EXODUSER-Storage/archive/G/exoduser/tmp/design-review/20261031_hd2d |
| 실행 | exo-unity.ps1 예약 mcp-codex-hd2d → 단일 잠금 → MCP 실제 경로 대조 → Build → 컴파일/셰이더/장면 검수 → 캡처 → 자기 서버·예약 반환 |
| 판정 | 작성 시 촬영 전. 기능·영상·1x·시각 판정은 출력 REPORT.md의 최종 실제 근거로 확정. 자연 플레이/제품 PASS 미주장 |

유료 생성0. 추가 스프라이트 제작·노이즈 텍스처·본편 자동 반영0. R3 원본의 Poly Haven CC0 출처는 원본 REPORT.md와 출처-원본영수증.json을 보존한다. 이 시안의 실제 원본/납품 SHA는 출력 source/provenance.json에 기록한다.
