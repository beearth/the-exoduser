# CH1-1 승인 A2 장면 — 제작 후보

사용자 승인 기준 `G:/exoduser/tmp/design-review/20261030_keyframe/APPROVED_1-1_keyframe_A2_woodbridge.png`를 직접 확인했다. 큰 거목·대각선 다리·오른쪽 독액 강·다층 안개·횃불/영웅 초점이 목표다. **현재 실제 Player erosion 후보 FAIL. 촬영 기능 통과와 아트·오류 판정을 분리하며 완료/채택 후보 아님.** 산출물은 I:/EXODUSER-Storage/steam-keyshot/a2/다.

| 항목 | 현재 코드·입력 계약 |
|---|---|
| 선행 통합 | R3 b9ffca060 인수 및 전사R5·UI최종·조작 수정 공통 보존. 공통968f2a324의 MCP Player 제외/빌드/M1 검증분까지 정상 병합한 기준90af40f9. 이후 A2 수로 구조와 접지·미니맵·Editor Terrain 보호만 제작 중. 현재 source의 실제 GPU/M1은 미검증 |
| 활성화 | --remodel3d --unity-a2-forest에서만 조립. 일반 실행 채택0. A2 옵션은 일반 진입의 지역명 배너를 숨기는 테스트 인자로 세지 않음. steam-keyshot/M1/QA 자체의 배너 억제는 유지 |
| MCP Editor 미리보기 | 공식 실행기의 자기 Editor 프로세스에만 EXO_A2_EDITOR_PREVIEW=1, isEditor 및 --unity-qa-sandbox 동시조건으로 A2와 NativeRemodel3D 활성화. 일반 Player는 이 환경값을 무시한다. 해당 Editor fixture는 진입영상 없이 시작하여 MCP로 실제게임 배치/조명 검수. Player 캡처·M1 대체 아님 |
| Editor Terrain 보호 | HellLightingSetup의 TerrainLayer 조정 전에 Editor에서만 TerrainData를 Instantiate하여 런타임 사본으로 사용. Player 동작과 높이 데이터는 그대로. 이전 Editor 재작성은 terrain-preview-before.asset에 보존 후 HEAD 필터 실제 byte로 복원(SHA5cc0a5619e3687e9b81fcb9a185d1607370b9a070567456c5c0cdfdf2b44770b). 다음 Editor에서 비에셋 사본/원본 보존 확인 예정 |
| 자산 | R3 sourceb9ffca060의17FBX·종속재질/텍스처185파일만 Resources/Art/map/a2/r3에 동일byte 인수. R3 정적RETOUCH 유지, R4 HOLD 인수0. r1 Foam_Bank 현재 사용0 |
| 큰 질량 | 주간4/후경15+19 위치·거목 충돌 유지. 주간 밑동의 고목3개+그루터기 조합은 큰 접합 차이가 남아 폐기. 새 CC0 Pine Roots A/B 각16324/16213삼각형·원본UV, 주간마다 scale(3.2,1.4,4)로1개 배치하고 실제 GroundY에 정점 접합. 큰 그루터기1은 유지. 나무 tint(.95,.8,.6), 이끼(.95,.85,.55)/ShadowOff, 덤불(.95,.75,.5), 균류(.65,.55,.4). 낙엽 기존12+12×12후보/2.4u 간격±.22u, 수면·길중심Across2.6u 제외. 낙엽만 지면+.01+lift, 정점별 접합. 새 GPU 미검증 |
| 다리 | 중심(43.2,−71.8)u/yaw+24°/scale(1.5,.55,.85)×.75. A2ForestLayout 다리 보행 |Along|≤4.45u·|Across|≤1.7u. 원본 JSON은 보존하고 A2 질의에만 수로·거목 경계 적용. 새 폭/배율은 실제 메시 높이7.24%였던21u 후보에서 카메라와 함께 수정. 현재 발 접지·동작 GPU 미검증 |
| 카메라 구도 | 비A2 LOOK-001 그대로. A2만 pitch38°/distance18u/FOV46.9453°, 공통TargetOffset+(3,0,.6)u. SMAA High 추가. 논리 카메라/전투 범위는 그대로이고 조준은 실제 3D카메라 역투영. 실제 current source GPU 미검증 |
| 독액 | A2ToxicRiver: linear RGB(.40,.32,.035), 거품(.45,.44,.16), emission.1. 저주파 사인속도.12/.08, 법선.035/.025, smoothness.62→거품.16, 접촉깊이.025~.28u. 수면Y−1.25는 A2ForestLayout.WaterLevel SSOT |
| 접촉 거품 깊이 | 기존 URP_PC_High/Mac_Balanced의 m_RequireDepthTexture=0 확인. A2 카메라에 requiresDepthTexture=true, 수면은 Transparent 큐/ZWrite On/alpha1로 불투명 지형 깊이 복사 후 샘플. 실제 거품 표현 미검증 |
| 수로 | Water: z(−94,−30),동쪽 x>Shore(z)와 지류 |Along|<2.75/Across(−8.5,20)의 합집합. Shore=48+1.4sin((z+72)×.22)+34×smoothstep(−66,−56,z)로 북동쪽에 굽어 빠짐. 남동 앵글러(148,150) 접근을 수로가 덮던 실제 회귀 FAIL을 고쳐 고정 위치/전투 규칙 보존. 수위−1.25, 연속 수면 x−30~110/z−100~70. 실제 수로 접점에만 수직 강둑. 암반9·말뚝5·강둑13접합/지류 접합. 기존 River_/Pool_만 숨김·r1거품 미사용 |
| 반영 | 환경 Realtime ReflectionProbe256²×6면/OnAwake·위치(50,GroundY(50,−72)+1,−72)/크기180×80×260/boxProjection/강도.55/importance100/far150 유지. A2RiverReflection 실제 평면반사960×540 ARGBHalf/수면Y−1.25/oblique clip+.04u, Water layer4 제외·후처리off/깊이on. 설치 URP SingleCameraRequest+SubmitRenderRequest 사용, 정지.1초/이동.05u/회전.3° 갱신. GPU/논리 투영 분리로 GPU VP의 방향 확인, reflection RT 직접 확인·실행1270회/Unity 오류0. 현재 혼합(.30+.30×Fresnel³)×(1−거품), 색(.85,.80,.42), UV왜곡 n.xz×.12. 실패 기본수면 폴백/추가반복0. 새 혼합은 GPU 재검수 예정 |
| 횃불 | R3 holder×.5·8프레임 불꽃/높이1.24u. 다리 국소 Along±3.65/Across±1.95u를 world로 변환해 두 끝에 배치. RGB(1,.55,.19)/강도7/반경5/soft shadow/bias.04/normalBias.1. 받침 투사만off, 기존 화로 루트off/Pool_Hell광원0 |
| 분위기 | A2 배경/안개(.15,.18,.21)/Linear14~54u/far240. 비A2/해제 시 이전 fog mode/start/end 복원. 환경광 sky(.31,.34,.36)/equator(.20,.22,.20)/ground(.075,.07,.05). 주광2.1/RGB(.77,.83,.88)/회전(54,−32,0)/그림자.55. Volume+.9EV/대비8·ACES·블룸.16. 달빛기둥4/alpha.18·가산 합성/깊이·가장자리 감쇠. 랜덤 점 노이즈0 |
| 임포트 | SourceTextureImporter v3. 새 a2/ground 경로만 Repeat 예외, 나머지 A2 Clamp/기존PBR Repeat 유지. 새3맵만 정확 force reimport하여1024²/Repeat/mipmap/Trilinear/aniso8 확인. BaseColor sRGB, NormalMap·Roughness linear. 기존 UI 분기/기존7PBR 계약 보존 |
| 기존 바닥 셰이더 | 작업 시작부터 실제 사용 중인 HellGroundPBR.shader가 미추적이고 .meta만 Git에 있음을 확인. 해당 원본 byte를 보존해 필수 런타임 소스로 함께 체크포인트하며 새 시각합격으로 세지 않음 |
| A2 바닥 | HellGroundPBR._ForestBlend 기본0/A2만1. 기존 CC0흙/돌 바탕과 노멀·러프니스는 보존. A2만 기존4맵의 runtime mip bias2→0. 새 ForestFloor3맵을2.1u 반복, tint(.42,.37,.26)/normal.3, leafMix=.7×lerp(.35,1,smoothstep(1.5,3.5,|Across|)). 길 중심은 흙, 가장자리는 낙엽 비중을 높임. smoothness는 leaf .12+.18×(1−rough)로 혼합. 새맵 없으면 mix0 기존흙 폴백, 비A2 mix0 |
| 숲 바닥 출처 | [Poly Haven Forest Floor](https://polyhaven.com/a/forest_floor), eye-candy.xyz/CC0, Powered by Poly Haven. 무료 원본1024² BaseColor/NormalGL/Roughness3맵, 합8100628B 동일byte 인수. 생성/구매/크레딧0. 원본·API메타·MD5/SHA는 I:/EXODUSER-Storage/steam-keyshot/a2/forest-floor-source/출처-영수증.json |
| 검은 무늬 | A2에서 이름이 Decals_blood로 시작하는 기존 메시 렌더러만 비활성. 이전 분리진단의 원인 수정이며 원본/충돌 불변 |
| 촬영 | --unity-steam-keyshot+A2는 실제NativeGame/격리세이브. 4200:7460, 실제AI/스크립트입력·생존보조, 적/탄 직접주입0. URP SingleCameraRequest/SubmitRenderRequest로1920×1080 월드RT·HUD제외. RGB휘도16픽셀표본 평균>.01 추가하여 검정이미지 성공 방지. 스킨 높이는 Model.activeInHierarchy·Renderer.enabled·카메라layer 교집합일 때 측정, 2D아레나도 보이는3D전사는 실제활성Renderer를 측정(숨긴2D스프라이트 사용0). 일반 손조작/HUD 검수 별도 |
| 영웅 크기 | R5가 있으면 실제 SkinnedMeshRenderer.BakeMesh 정점 투영으로 측정. 숨긴2D스프라이트 높이를 실제전사 크기로 인용하지 않음. 원래8~11% 촬영검사 유지 |
| 미니맵 경계 | SourceMap.DisplayTile(tx,ty)는 추가 경계가 차단한 타일 중심을1로 반환하고 나머지는 원본 Data.tiles 값을 그대로 반환. NativeFieldHud는 이 값으로 기존 미니맵을 그린다. A2 수로/다리/비A2 표시3검사PASS, UI 모양·원본 맵 데이터 변경0. 미니맵-수정전-FAIL.json에 수정 전 불일치 보존 |
| 보행 교차 회귀 | 실제 SourceMap/ch1_map으로 비다리 수면99910표본/겹침0. 주간충돌: 왼쪽2.2u·먼쪽2u·기타2주간1.1u, 큰그루터기1.3u, 기존후경15×.8u/작은후경19×.5u. 다리101점/반경15px·촬영4200:7460·일반4020:7420·중앙4320:7180 보행true.17803타일/출구3곳 연결, 고정앵글러4곳 모두300px 내 접근·시야 확보. 섬바깥49점 높이튐0. 현재26검사PASS. 원본JSON/Core 및 수면/새거목 밖차단 보존. 섬고리/남동앵글러 수정전FAIL별도 보존 |
| 종료 | 미디어닫기·효과음정리·1초배출. 보스1100tick 제한 마지막 촬영 분기1099로 교정 |
| 검증 | erosion/dd53cf66 빌드오류0/MCP제외PASS, bfd44855 실제1920 3장·탄3/15·검정수정 확인. 다만 CPU정점읽기210오류/뿌리·낙엽 누락/경계톱니/빈보스바닥으로 실제FAIL. receipt.passed=true는 아트/오류 통과가 아니며 다음코드에 unityErrors==0 조건 추가. 새소스 독립C#0·26경계/침수/동선검사PASS, 실제GPU/현재빌드M1/통합/일반Desktop 미검증 |

## MAP PRODUCTION REPORT

| 항목 | 현재 범위와 잔여 |
|---|---|
| STAGE / MASTER | CH1-1 부분 키샷. 기존6시시작/12시진행·Core 불변. 원화의 거목·다리·강 구도 목표 |
| OUTER MASS | LEFT/MID주간·RIGHT수로/거목·TOP3층숲·SOUTH낮은고목. 검은구멍·연속·반복은 실제카메라 미검증 |
| LARGE / MEDIUM | R3 스캔 거목/고목·전경목질과 이끼/균류/덤불 연결. R4 HOLD 사용0. R3 정적RETOUCH를 실게임PASS로 올리지 않음 |
| GROUND | 원본 높이맵 수로 제거, 실제 수로 접점만 양면 UV강둑으로 닫음. 강둑은 Repeat/NormalMap 검증된 기존 CC0 rock_ground 사용(종전 rock_face Clamp의 단색 원인 수정). 외곽은 원본513표본축의 모든 경계 좌표를 그대로 연결, 바깥간격.8/UInt32/설계 x−30~110,z−100~70. NativeRemodel3D.GroundY와 같은 연장 높이: 경계에서 일치,4u 밖으로 .35sin(x×.31)+.28cos(z×.27). 섬(53.3,−77)은 기본반경3.4·1+.10sin3a+.08cos5a,5고리×48분할. 높이=(기존−.16)×(1−u³)+(수면−.25)×u³, u≤1.0001 허용 후1로clamp해 경계float반올림24점의 큰높이튐 수정. 섬/배우/소품이 같은 높이 |
| PLAYABLE | 전투·회피·적·탄 규칙 보존. A2 수면은 보행만 차단·다리 통행 예외. 시야/투사체는 실제 거목과 기존 원본 벽만 차단. 실제 집단전투·우회경로 검수 필수 |
| LANDMARK | 다리와두횃불. 전체맵·보스리모델 완료 아님 |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 현재후보 실제화면 전부미검증 |
| TECH QA | 이전824b67a99 빌드/M1 통과와 현재 수정소스 검증을 구분. 현재 수정은 독립C#0, 25회귀PASS, Unity/GPU/실제동선/성능/M1 재검수 필수 |
| FILES / GIT | 자기A2코드/셰이더/r1런타임/임포터·촬영/관련docs만. 공용WIP보존. 원격·채택 상태는 I:영수증 기준 |
| VISUAL VERDICT | FAIL — 이전 실제 Editor 판근2후보와 원화 큰 차이 확인, 절차식 방법 폐기. 스캔 접합/18u/SMAA/mip0 메모리 시안은 개선됐으나 현재 영구 소스의 Player 검수 전. PASS/완료 선언0 |
| NEXT PASS | 기존MCP 예약 반환 뒤 자기 공식서버/MCP로 자산축·게임배치·조명 확인→실제Player1920·1x·같은장소전투·원화비교→큰결함수정→같은후보M1→영수증/정상통합/바로가기 |

## 2026-10-31 재개
최신 공통 a861d0303의 진입 흐름·UI·전사 R5를 정상 병합했다. 기동 충돌은 공통의 일반 진입/명시적 빠른시작을 보존하고 A2 촬영 fixture 조건만 병존시켰다. 이번 소스의 GPU/시각/M1은 아직 미검증이다. PowerShell 호스트 시작 오류5는 CMD와 Node의 숨김 자식 PowerShell 경로로 작업을 계속했으며 전역 설정 변경0이다.

## 2026-10-31 침식 강둑·실제 뿌리·촬영 회귀

| 항목 | 현재 계약 |
|---|---|
| 수면/탄 분리 | SourceMap3인수 생성자(data,보행추가,투사체추가). 기존1/2인수 생성자의 동작 보존. A2BlockedCore=수면&&!다리 또는거목, SolidCore=거목만. LineOfSight/Simulation.IsProjectileWall은 ProjectileBlocked 사용. Core/원본JSON 수정0 |
| 침식 높이 | A2ForestLayout.BankHeight는 비수면/비다리에서 주수로·지류까지 거리2u 이내를 smoothstep으로 수면+.22u~원본높이 연결. 수면/다리·강둑밖 높이 보존. NativeGroundY/원본높이맵메시 정점/외곽/배우·소품이 같은 높이. 새 실제 GPU 접지 미검증 |
| 새 뿌리 출처 | [Poly Haven Pine Roots](https://polyhaven.com/a/pine_roots), Rob Tuytel, CC0. Powered by Poly Haven. 공식2k glTF 원본8파일26720681B MD5확인. Blender5.1에서 원본UV 유지/decimate.2, A16324/B16213삼각형. AO를MaskG, 1−rough를MaskA/MetalR0으로 포장, NormalGL/BaseColor 동일byte. 유료0/R4인수0. 원본·변환·영수증 I:/EXODUSER-Storage/steam-keyshot/a2/pine-roots-* |
| 실패 보존 | 수면시야-침식-수정전-FAIL.json 4실패→현재25검사/0실패. 이전 캡처 검정3장은 coherent-caps에 그대로 보존. 검정 이미지와 비교보드는 시각 검수 불가/FAIL |

### 2026-10-31 검정 촬영의 직접 원인
A2CaptureFrame이 정상 LateUpdate 이후 Remodel3DLate를 다시 불러 이미0으로 비운 view mask를 로비 숨김으로 오독했다. r3Cam을 끄고 HudCamera가 mask0인2D카메라로 폴백하여 검정3장이 저장됐다. 두 번째 Late 호출을 제거하고 실제 활성3D 경로는 r3Cam을 직접 선택한다. URP SingleCameraRequest/휘도>.01 검증도 함께 적용한다. 현재 독립Core/C#0이며 실제 새Player 재검수 전이다.

## 2026-10-31 실제 Player 접합·보스 조명 재작업

| 항목 | 현재 코드 계약·검증 한계 |
|---|---|
| 메시 읽기 | A2GroundCoverImporter v1은 정확 PineRootsA/B·R3DeadLeaf3FBX만 isReadable=true. 해당3meta도 명시. 누락이면 원본메시 유지/이름별1회오류, 빈정점으로 원본 메시를 지우지 않음. 새Player에서오류0·3메시실존 재검수필수 |
| 침수 경계 | CutHeight는 수면정점을 water−.3u로 내려 부분잔류삼각형의 높은원본정점/톱니를 제거. 원본FieldMesh와외곽에같이적용, 별도섬메시는동일IslandHeight유지. 26회귀PASS, 실제Pixel 재검수필수 |
| 높이 재사용 | ForestHeight가 기존 연장/Bank/Island수식 단일원본. 원본Terrain1025² float표본1회읽기, native256점대조 오차>.0005u면native폴백. 배우/정점이같은캐시/수식사용. 외곽은미사용내부정점계산생략·경계원본높이재사용. 이전조립104373ms→현재속도/오차는새Player미검증 |
| 물가 접합 | Roots/낙엽의정점이 비섬수면에걸치면 수면−.18u로내림, 나머지는GroundY. 같은실제ReadWrite메시의UV·normal/tangent 재계산. 지면보조물만/코어충돌불변 |
| 촬영 오류 | keyshotLog Error/Exception/Assert집계, receipt.unityErrors==0이추가통과조건. 실제보이는전사스킨(2D아레나도활성3D전사있음)을측정. 숨긴스프라이트 측정값8.1%는실제전사값으로채택하지않음 |
| 자연 보스 순간 | 로딩완료후 실제boss+260/−150px에플레이어1회배치. 촬영직전순간이동제거. AI가중심600px 내에있고적탄6이상인자연순간선택, 적/탄/AI위치주입0. 최종1099fallback유지. 보스AI/NativeBossView/3D모델변경0 |
| A2 보스 카메라 | 기존의.53배줌인대신view.orthographicSize기본5.4u로복원(A2만). 실제3D영웅8~11%재측정필수. 보스PresentationScale.72/물리/전투불변. 현재2D보스,3D모델인수0 |
| A2 보스 지면 | Clamp rock_face 대신 기존Repeat rock_ground Diffuse/Normal을기존ArenaSoilLit worldXY/4u에연결. NativeArenaView/충돌/벽마스크수정0 |
| A2 보스 낮은 프레임 | 실제Room중심 주위 PineRoots14개/타원8.5×6.2u/scale1.8,1.2,2.2, yaw137°간격. 짝수암반7개/scale.3,.22,.35. 횃불2개×.45,중심±6/±2.5u/pitch−52°·불꽃8프레임12fps·앞오프셋z−1/y+.7/scale.12. 기존두warm광원을같은위치z−1.3으로옮김. 전부장식Collider0·신규보스모델0 |
| 전경·빛 | 빛기둥은기존4개depthfade메시를가산합성alpha.18로교정. 실제볼류메트릭안개가아님. Linear안개14~54u. 입체뿌리/낙엽이현재Player에서누락됐으므로개선완료라부르지않음 |
