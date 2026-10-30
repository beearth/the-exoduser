# CH1-1 승인 A2 장면 — 제작 후보

사용자 승인 기준 `G:/exoduser/tmp/design-review/20261030_keyframe/APPROVED_1-1_keyframe_A2_woodbridge.png`를 직접 확인했다. 큰 거목·대각선 다리·오른쪽 독액 강·다층 안개·횃불/영웅 초점이 목표다. **현재 Editor 첫 실게임 화면 FAIL. 구조 재작업 중이며 완료/채택 후보 아님.** 산출물은 I:/EXODUSER-Storage/steam-keyshot/a2/다.

| 항목 | 현재 코드·입력 계약 |
|---|---|
| 선행 통합 | R3 b9ffca060 인수 및 전사R5·UI최종·조작 수정 공통 보존. 공통968f2a324의 MCP Player 제외/빌드/M1 검증분까지 정상 병합한 기준90af40f9. 이후 A2 수로 구조와 접지·미니맵·Editor Terrain 보호만 제작 중. 현재 source의 실제 GPU/M1은 미검증 |
| 활성화 | --remodel3d --unity-a2-forest에서만 조립. 일반 실행 채택0. A2 옵션은 일반 진입의 지역명 배너를 숨기는 테스트 인자로 세지 않음. steam-keyshot/M1/QA 자체의 배너 억제는 유지 |
| MCP Editor 미리보기 | 공식 실행기의 자기 Editor 프로세스에만 EXO_A2_EDITOR_PREVIEW=1, isEditor 및 --unity-qa-sandbox 동시조건으로 A2와 NativeRemodel3D 활성화. 일반 Player는 이 환경값을 무시한다. 해당 Editor fixture는 진입영상 없이 시작하여 MCP로 실제게임 배치/조명 검수. Player 캡처·M1 대체 아님 |
| Editor Terrain 보호 | HellLightingSetup의 TerrainLayer 조정 전에 Editor에서만 TerrainData를 Instantiate하여 런타임 사본으로 사용. Player 동작과 높이 데이터는 그대로. 이전 Editor 재작성은 terrain-preview-before.asset에 보존 후 HEAD 필터 실제 byte로 복원(SHA5cc0a5619e3687e9b81fcb9a185d1607370b9a070567456c5c0cdfdf2b44770b). 다음 Editor에서 비에셋 사본/원본 보존 확인 예정 |
| 자산 | R3 sourceb9ffca060의17FBX·종속재질/텍스처185파일만 Resources/Art/map/a2/r3에 동일byte 인수. R3 정적RETOUCH 유지, R4 HOLD 인수0. r1 Foam_Bank만 거품 보조로 재사용 |
| 큰 질량 | 주간4: (34.8,−70.5)/(49,−64.8)/(53.3,−77)/(29.5,−64). 왼쪽scale(1.8,1.6,1.65)×.45, 다른R3거목각기존배율. 밑동마다 Root_Stump(.8,.35,.85)/yaw+73/lift−.25 + Fallen_Log3개/113°간격/반경1.15/scale(.45,.32,.65)×.8/lift−.22 접합. 기존후경15 + 작은 후경19(3층×7후보, 고정앵글러3.5u 내2곳생략)/scale(.55,.85,.55)×.45·덤불/이끼. 먼카드2·전경2·그루터기1. 절차식판근2FAIL 폐기. 낙엽/잔돌12·강둑13접합점. 이끼(.48,.52,.30)/shadowOff·수광on, 덤불(.65,.40,.22). 비섬 수면 낙엽/이끼생략, 거목/고목−1.35+lift·Root_Stump−1.15+lift·덤불−1.2+lift. 전경왼쪽yaw−35/오른쪽−32 |
| 다리 | 중심(43.2,−71.8)u/yaw+24°/scale(1.5,.55,.85)×.75. A2ForestLayout 다리 보행 |Along|≤4.45u·|Across|≤1.7u. 원본 JSON은 보존하고 A2 질의에만 수로·거목 경계 적용. 새 폭/배율은 실제 메시 높이7.24%였던21u 후보에서 카메라와 함께 수정. 현재 발 접지·동작 GPU 미검증 |
| 카메라 구도 | 비A2 LOOK-001 그대로. A2만 pitch38°/distance18u/FOV46.9453°, 공통TargetOffset+(3,0,.6)u. SMAA High 추가. 논리 카메라/전투 범위는 그대로이고 조준은 실제 3D카메라 역투영. 실제 current source GPU 미검증 |
| 독액 | A2ToxicRiver: linear RGB(.40,.32,.035), 거품(.45,.44,.16), emission.1. 저주파 사인속도.12/.08, 법선.035/.025, smoothness.62→거품.16, 접촉깊이.025~.28u. 수면Y−1.25는 A2ForestLayout.WaterLevel SSOT |
| 접촉 거품 깊이 | 기존 URP_PC_High/Mac_Balanced의 m_RequireDepthTexture=0 확인. A2 카메라에 requiresDepthTexture=true, 수면은 Transparent 큐/ZWrite On/alpha1로 불투명 지형 깊이 복사 후 샘플. 실제 거품 표현 미검증 |
| 수로 | Water: z(−94,−30),동쪽 x>Shore(z)와 지류 |Along|<2.75/Across(−8.5,20)의 합집합. Shore=48+1.4sin((z+72)×.22)+34×smoothstep(−66,−56,z)로 북동쪽에 굽어 빠짐. 남동 앵글러(148,150) 접근을 수로가 덮던 실제 회귀 FAIL을 고쳐 고정 위치/전투 규칙 보존. 수위−1.25, 연속 수면 x−30~110/z−100~70. 실제 수로 접점에만 수직 강둑. 암반9·말뚝5·강둑13접합/지류 접합. 기존 River_/Pool_만 숨김·r1거품 미사용 |
| 반영 | 환경 Realtime ReflectionProbe256²×6면/OnAwake·위치(50,GroundY(50,−72)+1,−72)/크기180×80×260/boxProjection/강도.55/importance100/far150 유지. A2RiverReflection 실제 평면반사960×540 ARGBHalf/수면Y−1.25/oblique clip+.04u, Water layer4 제외·후처리off/깊이on. 설치 URP SingleCameraRequest+SubmitRenderRequest 사용, 정지.1초/이동.05u/회전.3° 갱신. GPU/논리 투영 분리로 GPU VP의 방향 확인, reflection RT 직접 확인·실행1270회/Unity 오류0. 현재 혼합(.30+.30×Fresnel³)×(1−거품), 색(.85,.80,.42), UV왜곡 n.xz×.12. 실패 기본수면 폴백/추가반복0. 새 혼합은 GPU 재검수 예정 |
| 횃불 | R3 holder×.5·8프레임 불꽃/높이1.24u. 다리 국소 Along±3.65/Across±1.95u를 world로 변환해 두 끝에 배치. RGB(1,.55,.19)/강도7/반경5/soft shadow/bias.04/normalBias.1. 받침 투사만off, 기존 화로 루트off/Pool_Hell광원0 |
| 분위기 | A2 배경/안개(.15,.18,.21)/Exp²밀도.02/far240. 환경광 sky(.31,.34,.36)/equator(.20,.22,.20)/ground(.075,.07,.05). 주광2.1/RGB(.77,.83,.88)/회전(54,−32,0)/그림자.55. Volume+.9EV/대비8·ACES·블룸.16. 달빛기둥4/alpha.12/깊이·가장자리 감쇠. 랜덤 점 노이즈0 |
| 임포트 | SourceTextureImporter v3. 새 a2/ground 경로만 Repeat 예외, 나머지 A2 Clamp/기존PBR Repeat 유지. 새3맵만 정확 force reimport하여1024²/Repeat/mipmap/Trilinear/aniso8 확인. BaseColor sRGB, NormalMap·Roughness linear. 기존 UI 분기/기존7PBR 계약 보존 |
| 기존 바닥 셰이더 | 작업 시작부터 실제 사용 중인 HellGroundPBR.shader가 미추적이고 .meta만 Git에 있음을 확인. 해당 원본 byte를 보존해 필수 런타임 소스로 함께 체크포인트하며 새 시각합격으로 세지 않음 |
| A2 바닥 | HellGroundPBR._ForestBlend 기본0/A2만1. 기존 CC0흙/돌 바탕과 노멀·러프니스는 보존. A2만 기존4맵의 runtime mip bias2→0. 새 ForestFloor3맵을2.1u 반복, tint(.42,.37,.26)/normal.3, leafMix=.7×lerp(.35,1,smoothstep(1.5,3.5,|Across|)). 길 중심은 흙, 가장자리는 낙엽 비중을 높임. smoothness는 leaf .12+.18×(1−rough)로 혼합. 새맵 없으면 mix0 기존흙 폴백, 비A2 mix0 |
| 숲 바닥 출처 | [Poly Haven Forest Floor](https://polyhaven.com/a/forest_floor), eye-candy.xyz/CC0, Powered by Poly Haven. 무료 원본1024² BaseColor/NormalGL/Roughness3맵, 합8100628B 동일byte 인수. 생성/구매/크레딧0. 원본·API메타·MD5/SHA는 I:/EXODUSER-Storage/steam-keyshot/a2/forest-floor-source/출처-영수증.json |
| 검은 무늬 | A2에서 이름이 Decals_blood로 시작하는 기존 메시 렌더러만 비활성. 이전 분리진단의 원인 수정이며 원본/충돌 불변 |
| 촬영 | --unity-steam-keyshot+A2는 기존NativeGame fixture. batch/hidden 모두 GPU 월드RT1920×1080/HUD제외. A2 출발4200:7460, 같은 장소에서 실제 AI·스크립트 입력·생존보조. 적/탄 직접주입0. 일반입장/손조작/HUD 검수와 구분 |
| 영웅 크기 | R5가 있으면 실제 SkinnedMeshRenderer.BakeMesh 정점 투영으로 측정. 숨긴2D스프라이트 높이를 실제전사 크기로 인용하지 않음. 원래8~11% 촬영검사 유지 |
| 미니맵 경계 | SourceMap.DisplayTile(tx,ty)는 추가 경계가 차단한 타일 중심을1로 반환하고 나머지는 원본 Data.tiles 값을 그대로 반환. NativeFieldHud는 이 값으로 기존 미니맵을 그린다. A2 수로/다리/비A2 표시3검사PASS, UI 모양·원본 맵 데이터 변경0. 미니맵-수정전-FAIL.json에 수정 전 불일치 보존 |
| 보행 교차 회귀 | 실제 SourceMap/ch1_map으로 비다리 수면99910표본/겹침0. 주간충돌: 왼쪽2.2u·먼쪽2u·기타2주간1.1u, 큰그루터기1.3u, 기존후경15×.8u/작은후경19×.5u. 다리101점/반경15px·촬영4200:7460·일반4020:7420·중앙4320:7180 보행true.17803타일/출구3곳 연결, 고정앵글러4곳 모두300px 내 접근·시야 확보. 섬바깥49점 높이튐0.20검사PASS. 원본JSON/Core 및 수면/새거목 밖차단 보존. 섬고리/남동앵글러 수정전FAIL별도 보존 |
| 종료 | 미디어닫기·효과음정리·1초배출. 보스1100tick 제한 마지막 촬영 분기1099로 교정 |
| 검증 | 독립 Core/C#0/0·20경계/높이/접근검사PASS.64c1120bf 실제 Editor에서 leafMix.7·두주간 차단true·실제반사67회·Unity오류0 확인했으나 섬외곽24/49점이−1.5~1.726m로튀고 강둑rock_face가Clamp임을 확인해 재작업. 현재 새 외곽축/섬경계/반복강둑/굽은수로/밑동/후경 소스의 GPU·Player·M1·통합·Desktop 미검증 |

## MAP PRODUCTION REPORT

| 항목 | 현재 범위와 잔여 |
|---|---|
| STAGE / MASTER | CH1-1 부분 키샷. 기존6시시작/12시진행·Core 불변. 원화의 거목·다리·강 구도 목표 |
| OUTER MASS | LEFT/MID주간·RIGHT수로/거목·TOP3층숲·SOUTH낮은고목. 검은구멍·연속·반복은 실제카메라 미검증 |
| LARGE / MEDIUM | R3 스캔 거목/고목·전경목질과 이끼/균류/덤불 연결. R4 HOLD 사용0. R3 정적RETOUCH를 실게임PASS로 올리지 않음 |
| GROUND | 원본 높이맵 수로 제거, 실제 수로 접점만 양면 UV강둑으로 닫음. 강둑은 Repeat/NormalMap 검증된 기존 CC0 rock_ground 사용(종전 rock_face Clamp의 단색 원인 수정). 외곽은 원본513표본축의 모든 경계 좌표를 그대로 연결, 바깥간격.8/UInt32/설계 x−30~110,z−100~70. NativeRemodel3D.GroundY와 같은 연장 높이: 경계에서 일치,4u 밖으로 .35sin(x×.31)+.28cos(z×.27). 섬(53.3,−77)은 기본반경3.4·1+.10sin3a+.08cos5a,5고리×48분할. 높이=(기존−.16)×(1−u³)+(수면−.25)×u³, u≤1.0001 허용 후1로clamp해 경계float반올림24점의 큰높이튐 수정. 섬/배우/소품이 같은 높이 |
| PLAYABLE | 전투·회피·적·탄 규칙 보존. A2 수면은 보행/시야/투사체 공통 차단, 다리 통행 예외. 실제 집단전투·우회경로 검수 필수 |
| LANDMARK | 다리와두횃불. 전체맵·보스리모델 완료 아님 |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 현재후보 실제화면 전부미검증 |
| TECH QA | 독립C#0오류. Unity/GPU/route/collision/seam/loading/performance/M1 미실행 |
| FILES / GIT | 자기A2코드/셰이더/r1런타임/임포터·촬영/관련docs만. 공용WIP보존. 원격·채택 상태는 I:영수증 기준 |
| VISUAL VERDICT | FAIL — 이전 실제 Editor 판근2후보와 원화 큰 차이 확인, 절차식 방법 폐기. 스캔 접합/18u/SMAA/mip0 메모리 시안은 개선됐으나 현재 영구 소스의 Player 검수 전. PASS/완료 선언0 |
| NEXT PASS | 기존MCP 예약 반환 뒤 자기 공식서버/MCP로 자산축·게임배치·조명 확인→실제Player1920·1x·같은장소전투·원화비교→큰결함수정→같은후보M1→영수증/정상통합/바로가기 |

## 2026-10-31 재개
최신 공통 a861d0303의 진입 흐름·UI·전사 R5를 정상 병합했다. 기동 충돌은 공통의 일반 진입/명시적 빠른시작을 보존하고 A2 촬영 fixture 조건만 병존시켰다. 이번 소스의 GPU/시각/M1은 아직 미검증이다. PowerShell 호스트 시작 오류5는 CMD와 Node의 숨김 자식 PowerShell 경로로 작업을 계속했으며 전역 설정 변경0이다.
