# CH1-1 승인 A2 장면 — 제작 후보

사용자 승인 기준 `G:/exoduser/tmp/design-review/20261030_keyframe/APPROVED_1-1_keyframe_A2_woodbridge.png`를 직접 확인했다. 큰 거목·대각선 다리·오른쪽 독액 강·다층 안개·횃불/영웅 초점이 목표다. **현재 Editor 첫 실게임 화면 FAIL. 구조 재작업 중이며 완료/채택 후보 아님.** 산출물은 I:/EXODUSER-Storage/steam-keyshot/a2/다.

| 항목 | 현재 코드·입력 계약 |
|---|---|
| 선행 통합 | R3 b9ffca060 인수 및 전사R5·UI최종·조작 수정 공통 보존. 공통968f2a324의 MCP Player 제외/빌드/M1 검증분까지 정상 병합한 기준90af40f9. 이후 A2 수로 구조와 접지·미니맵·Editor Terrain 보호만 제작 중. 현재 source의 실제 GPU/M1은 미검증 |
| 활성화 | --remodel3d --unity-a2-forest에서만 조립. 일반 실행 채택0. A2 옵션은 일반 진입의 지역명 배너를 숨기는 테스트 인자로 세지 않음. steam-keyshot/M1/QA 자체의 배너 억제는 유지 |
| MCP Editor 미리보기 | 공식 실행기의 자기 Editor 프로세스에만 EXO_A2_EDITOR_PREVIEW=1, isEditor 및 --unity-qa-sandbox 동시조건으로 A2와 NativeRemodel3D 활성화. 일반 Player는 이 환경값을 무시한다. 해당 Editor fixture는 진입영상 없이 시작하여 MCP로 실제게임 배치/조명 검수. Player 캡처·M1 대체 아님 |
| Editor Terrain 보호 | HellLightingSetup의 TerrainLayer 조정 전에 Editor에서만 TerrainData를 Instantiate하여 런타임 사본으로 사용. Player 동작과 높이 데이터는 그대로. 이전 Editor 재작성은 terrain-preview-before.asset에 보존 후 HEAD 필터 실제 byte로 복원(SHA5cc0a5619e3687e9b81fcb9a185d1607370b9a070567456c5c0cdfdf2b44770b). 다음 Editor에서 비에셋 사본/원본 보존 확인 예정 |
| 자산 | R3 sourceb9ffca060의17FBX·종속재질/텍스처185파일만 Resources/Art/map/a2/r3에 동일byte 인수. R3 정적RETOUCH 유지, R4 HOLD 인수0. r1 Foam_Bank만 거품 보조로 재사용 |
| 큰 질량 | 주간4·고목3·후경거목3층×5·먼카드2.R3 거목단위.45/고목.8, 전경목질2·그루터기1. 주간 판근5개씩/길이3.8~5.2u/폭.65→.06u/높이.9×(1−t)^3+.07u. 새 판근에 스캔 아틀라스 재사용을 폐기하고 기존 CC0 bark_brown_02 Diffuse/nor_gl 반복 수피·색(.65,.56,.42)/smoothness.17/normal.35를 사용. 낮은 낙엽/잔돌12접합점은 간격2u 이상. 수면 비섬 낙엽/이끼 생략, 덤불높이−1.2u. 현재 GPU 재검수 예정 |
| 다리 | 중심(43.2,−71.8)u/yaw+24°/scale(1,.55,1)×.75. A2ForestLayout의 Along/Across 좌표로 다리 보행 |Along|≤4.45u·|Across|≤1.25u. 실제 원본 ch1_map은 보존하고 A2 질의에만 수로 경계를 추가. 접지·동작 미검증 |
| 카메라 구도 | 비A2 LOOK-001 그대로. A2만 pitch38°/distance21u/FOV46.9453°, 공통TargetOffset+(3,0,1.05)u. 3D 표현·조준 역투영은 실제 카메라를 쓰고 Core 논리 카메라는 보존. 실제 현재 구도 미검증 |
| 독액 | A2ToxicRiver: linear RGB(.30,.32,.045), 거품(.45,.44,.16), emission.1. 저주파 사인속도.12/.08, 법선.035/.025, smoothness.62→거품.16. 접촉깊이.025~.28u. 실제 Editor 분리검사에서 종전 지형 가림·과암부 확정, 개선 후보 GPU 미검증 |
| 접촉 거품 깊이 | 기존 URP_PC_High/Mac_Balanced의 m_RequireDepthTexture=0 확인. A2 카메라에 requiresDepthTexture=true, 수면은 Transparent 큐/ZWrite On/alpha1로 불투명 지형 깊이 복사 후 샘플. 실제 거품 표현 미검증 |
| 수로 | A2ForestLayout.Water 단일 경계: z(−94,−30), 동쪽 x>48+1.4sin((z+72)×.22), 지류 |Along|<2.75u·Across(−8.5,20)u의 합집합. 수위−1.25u, 연속 수면 x−30~110/z−100~70u. 바닥 메시에서 수로 삼각형 제거, 잔여 경계 edge를 수위−.3까지 닫은 양면 강둑. 기존 River_/Pool_ 렌더러만 A2에서 숨김. 물가암반9·말뚝5·지류 목질/덤불 연결. 전경 거목(53.3,−77)에 반경3.4u/5고리×48분할 침식 섬을 추가, 비보행 수면 차단은 유지. r1 Foam_Bank 미사용 |
| 반영 | 주변 환경용 Realtime ReflectionProbe/OnAwake/256²×6면·위치(50,GroundY(50,−72)+1,−72)/크기180×80×260u/boxProjection/강도.55/importance100/far150u 유지. 수면은 추가로 실제 장면 평면반사: A2RiverReflection/960×540 ARGBHalf, 수면Y−1.25로 뷰 행렬 반사·oblique clip+.04u, Water layer4 제외·후처리off/깊이on. 설치된 URP의 SingleCameraRequest+RenderPipeline.SubmitRenderRequest 사용. 정지.1초 간격/이동.05u 또는 회전.3° 이상 갱신, 반사혼합(.22+.28×Fresnel³)×(1−거품), 색(.85,.88,.66). 실패 시 추가 반복 없이 기본 수면 폴백. 실제 GPU 미검증 |
| 횃불 | R3 Bridge_Torch_Holder×.5·8프레임 불꽃/높이1.24u, 위치(40.8,−75.4)/(45.4,−68.2)u. RGB(1,.55,.19)/강도7/반경5u/soft shadow/bias.04/normalBias.1. 받침대만 shadowCastingOff, 과대 고리 그림자 원인분리 확인. 기존 화로 루트 비활성·Pool_Hell광원0 |
| 분위기 | A2 배경/안개(.15,.18,.21)/Exp²밀도.035/far240u. 환경광 sky(.31,.34,.36)/equator(.20,.22,.20)/ground(.075,.07,.05). 주광2.1/RGB(.77,.83,.88)/회전(54,−32,0)/그림자강도.55. A2 Volume만 노출+.9EV/대비8, 기존ACES·블룸.16 유지. 국소 달빛기둥4개/alpha.12/깊이·가장자리 감쇠. 랜덤 노이즈0 |
| 임포트 | SourceTextureImporter v3. 기존 keyshot2 진단의 정확7종PBR은 Repeat/mipmap/Trilinear/aniso8/normal·linear. A2는 같은 색공간과Clamp. 공통UI분기 보존 |
| 기존 바닥 셰이더 | 작업 시작부터 실제 사용 중인 HellGroundPBR.shader가 미추적이고 .meta만 Git에 있음을 확인. 해당 원본 byte를 보존해 필수 런타임 소스로 함께 체크포인트하며 새 시각합격으로 세지 않음 |
| A2 바닥 | HellGroundPBR._ForestBlend 기본0/A2만1. 기존CC0 토양·돌만 사용. forest=lerp(soil×.9,stone×.6,.28+.2×sweep)×RGB(.75,.65,.48), 표면normal=돌normal, smoothness=.36−.16×rough. 기존skin/비A2 경로와 Core·충돌 불변. 실제 현재 바닥 시각 미검증 |
| 검은 무늬 | A2에서 이름이 Decals_blood로 시작하는 기존 메시 렌더러만 비활성. 이전 분리진단의 원인 수정이며 원본/충돌 불변 |
| 촬영 | --unity-steam-keyshot+A2는 기존NativeGame fixture. batch/hidden 모두 GPU 월드RT1920×1080/HUD제외. A2 출발4200:7460, 같은 장소에서 실제 AI·스크립트 입력·생존보조. 적/탄 직접주입0. 일반입장/손조작/HUD 검수와 구분 |
| 영웅 크기 | R5가 있으면 실제 SkinnedMeshRenderer.BakeMesh 정점 투영으로 측정. 숨긴2D스프라이트 높이를 실제전사 크기로 인용하지 않음. 원래8~11% 촬영검사 유지 |
| 미니맵 경계 | SourceMap.DisplayTile(tx,ty)는 추가 경계가 차단한 타일 중심을1로 반환하고 나머지는 원본 Data.tiles 값을 그대로 반환. NativeFieldHud는 이 값으로 기존 미니맵을 그린다. A2 수로/다리/비A2 표시3검사PASS, UI 모양·원본 맵 데이터 변경0. 미니맵-수정전-FAIL.json에 수정 전 불일치 보존 |
| 보행 교차 회귀 | 실제 SourceMap/ch1_map의152693개 수면 표본: 수정전33266보행겹침·4FAIL→수정후겹침0. 다리 중심101점/반경15px·촬영출발4200:7460·일반출발4020:7420·중심4320:7180 보행true. 촬영 출발점에서14951타일과 필드출구3곳 모두 도달. 미니맵3검사·일반 출발점을 포함해15검사PASS. SourceMap.Blocked에서 보행/직선시야/투사체 공통 적용, 원본 맵 데이터·Core 변경0. layout-check/현재결과.json·수정전-FAIL.json·미니맵-수정전-FAIL.json. 종전 shore-check는 이전 외곽 수면 후보 이력 |
| 종료 | 미디어닫기·효과음정리·1초배출. 보스1100tick 제한 마지막 촬영 분기1099로 교정 |
| 검증 | 첫 실제 Editor 화면과 dadbb7148 구조 수정본을 직접 확인해 FAIL. 수로 연결/강둑/20판근·38°카메라 적용 확인, 강둑17608정점/0영법선·Terrain 비에셋사본/원본dirtyfalse·Unity error0. 다만 아틀라스 판근의 검은 쐐기·지형 창의 직각 경계·평평한 수면 때문에 제작 방법 변경. 현재 독립 Core/C#0, 경계15검사PASS. 새 재질/연장 지형/실제 반사의 GPU·Player·M1·통합·Desktop 미검증 |

## MAP PRODUCTION REPORT

| 항목 | 현재 범위와 잔여 |
|---|---|
| STAGE / MASTER | CH1-1 부분 키샷. 기존6시시작/12시진행·Core 불변. 원화의 거목·다리·강 구도 목표 |
| OUTER MASS | LEFT/MID주간·RIGHT수로/거목·TOP3층숲·SOUTH낮은고목. 검은구멍·연속·반복은 실제카메라 미검증 |
| LARGE / MEDIUM | R3 스캔 거목/고목·전경목질과 이끼/균류/덤불 연결. R4 HOLD 사용0. R3 정적RETOUCH를 실게임PASS로 올리지 않음 |
| GROUND | 기존 높이맵 수로 제거/연속 강둑. 강둑은 UV를 가진 양면 메시+기존 CC0 rock_face Diffuse/nor_gl·색(.48,.44,.32)/smoothness.16/normal.35로 별도 매핑. 원본 창 밖은 x−30~110/z−100~70u/.8u 간격176×214정점의 수로 제외 지면으로 이어짐. 원본 경계에서 높이 일치, 4u 밖으로 .35sin(x×.31)+.28cos(z×.27) 완만한 지형. 원본 맵/충돌은 수로 경계 외 변경0. 실제 GPU 미검증 |
| PLAYABLE | 전투·회피·적·탄 규칙 보존. A2 수면은 보행/시야/투사체 공통 차단, 다리 통행 예외. 실제 집단전투·우회경로 검수 필수 |
| LANDMARK | 다리와두횃불. 전체맵·보스리모델 완료 아님 |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 현재후보 실제화면 전부미검증 |
| TECH QA | 독립C#0오류. Unity/GPU/route/collision/seam/loading/performance/M1 미실행 |
| FILES / GIT | 자기A2코드/셰이더/r1런타임/임포터·촬영/관련docs만. 공용WIP보존. 원격·채택 상태는 I:영수증 기준 |
| VISUAL VERDICT | FAIL — Editor 첫 게임 화면을 직접 확인. 수로 구조를 바꾼 현재 소스는 GPU 미검증. PASS/채택 선언0 |
| NEXT PASS | 기존MCP 예약 반환 뒤 자기 공식서버/MCP로 자산축·게임배치·조명 확인→실제Player1920·1x·같은장소전투·원화비교→큰결함수정→같은후보M1→영수증/정상통합/바로가기 |

## 2026-10-31 재개
최신 공통 a861d0303의 진입 흐름·UI·전사 R5를 정상 병합했다. 기동 충돌은 공통의 일반 진입/명시적 빠른시작을 보존하고 A2 촬영 fixture 조건만 병존시켰다. 이번 소스의 GPU/시각/M1은 아직 미검증이다. PowerShell 호스트 시작 오류5는 CMD와 Node의 숨김 자식 PowerShell 경로로 작업을 계속했으며 전역 설정 변경0이다.
