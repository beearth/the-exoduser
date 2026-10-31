## 2026-10-31 전체 필드 재작업 — 현재 후보

사용자 field-screen-brief.md 확장과 재부팅 이후 실행 승인을 적용한다. 아래 이전 단일 키샷·수로 차단·실행 금지 기록은 당시 이력이다. 현재 게임 소스는 일반 `--remodel3d`의 1-1 전체 필드를 대상으로 하며, 실제 Player·동일 빌드 M1·시각 판정·공통/바로가기 갱신 전이다.

| 항목 | 현재 코드 계약 |
|---|---|
| 보행/시야/미니맵 | A2FieldLayout.CreateMap → 원본 SourceMap(MapData). 추가 A2 수면/거목 콜백 미사용. 전체40000타일×반경0/15/28 보행,40000표시/시야 대조 차이0. 이전 경로는 각각7368/2564/1122 불일치 재현 |
| 범위 | 원본200×200타일/80×80u. 전체 지면은 X−45..125/Z−125..45,341²정점/.5u 간격. 지면/배우는 같은 A2FieldLayout.Height 사용 |
| 외곽 | 원본 타일 경계의 양측22행+마지막행/3.6u 간격,3깊이층/4.8u 간격. 나무 중심은 원본 경계 밖 radius+0.6u. 중경 목질·이끼/덤불 연결,원경 distance−10..−34u 숲. 새Collider0 |
| 높이 | .14sin(.29x+.12z)+.10cos(.31z−.08x)+.055sin(.73x−.37z)−1.65smoothstep(clamp(−거리/2.8)). 외곽 독액 Y−.45u/보행 지면 아래,원본 통행 차단0 |
| 지면 | 기존CC0 흙·노출뿌리·낙엽 재사용. 신규 이끼지면 [forest_leaves_02](https://polyhaven.com/a/forest_leaves_02),Rob Tuytel/[CC0](https://polyhaven.com/license),Powered by Poly Haven/비용0. 2K 컬러1668009B·GL노멀10708761B·러프니스723748B/공식MD5전부일치,Resources Art/map/a2/ground/A2_FieldMoss_* 3맵. 원본·SHA는 field-screen-20261031/moss-ground-source/출처-영수증.json. 원본 경계200²시각 거리장/40u정규화. HellGroundPBR _FullField=1. 머티리얼은 런타임 사본 |
| 카메라/조명 | A2 34°/16.5u 유지,단일 다리용(+3,0,+.6)편향 제거. 방향광1.65/색(.77,.85,1)/49°−32°/소프트그림자. Linear안개19..62u/색(.105,.145,.17),수관빛9곳/alpha.035. A2HeightFog는 실제깊이/높이의 지수밀도 광선적분(밀도.045/높이감쇠.8/최대거리80u/alpha상한.42),점노이즈·수평안개카드0. 횃불7곳 실제점광원/기존강도7·반경5u |
| 적 표시 | remodel의 항시 반달 제거. 살아있는 일반 적 중 피해입음 또는85Core단위 내 조준 대상을42px 체력3px·실드2px 바로 표시. 원본 HP/eShield/AI·전투 수치 변경0 |
| 적 접지 | 원본16아틀라스/1600셀의 alpha>=32가3픽셀 이상인 최하단/최상단 추출. NativeEnemyFootprint로 투명 여백 높이 제외. 반경clamp(Radius×.012,.16,.48) 접촉그림자/alpha.5. SpriteLit3D 추가광 그림자·안개·림광. 원본PNG변경0 |
| 검수 | --unity-field-screen: 일반 --remodel3d/추가A2옵션0,시작·초반·공터·서·동·랜드마크·후반·입구8곳×1920/3840×1080 최종ScreenCapture/HUD. 직접위치이동·AI정지 구도이며 자연완주 증거 아님 |
| 현재 근거 | 독립Core/C#0/0,순수보행·거리장·표시10검사PASS. 실제Unity/셰이더·시각·같은빌드M1 미검증. 출력 I:/EXODUSER-Storage/steam-keyshot/a2/field-screen-20261031 |

# CH1-1 승인 A2 장면 — 제작 후보

사용자 승인 기준 `G:/exoduser/tmp/design-review/20261030_keyframe/APPROVED_1-1_keyframe_A2_woodbridge.png`를 직접 확인했다. 큰 거목·대각선 다리·오른쪽 독액 강·다층 안개·횃불/영웅 초점이 목표다. **현재 실제 Player shore 후보와 새 Editor 후보는 원화 대비 큰 차이가 남아 FAIL. 완료·일반 실행 채택0.** 최신 계약은 첫 표와 문서 끝, 과거 후보 수치는 각 시점의 검수 이력이다. 산출물은 I:/EXODUSER-Storage/steam-keyshot/a2/다.

| 항목 | 현재 코드·입력 계약 |
|---|---|
| 선행 통합 | 최신 fetch 공통 b9491cf58을 정상 병합한 ad9702975, 자기 이끼 교정 f3b8b10c9 이후 주거목·뿌리·지면 후보. 실제 공통 오디오·UI 검수는 인수했으며 자기 새 시각/GPU/M1로 소급하지 않음 |
| 활성화 | --remodel3d --unity-a2-forest에서만 조립. 일반 실행 채택0. A2 옵션은 일반 진입의 지역명 배너를 숨기는 테스트 인자로 세지 않음. steam-keyshot/M1/QA 자체의 배너 억제는 유지 |
| MCP Editor 미리보기 | 공식 실행기의 자기 Editor 프로세스에만 EXO_A2_EDITOR_PREVIEW=1, isEditor 및 --unity-qa-sandbox 동시조건으로 A2와 NativeRemodel3D 활성화. 일반 Player는 이 환경값을 무시한다. 해당 Editor fixture는 진입영상 없이 시작하여 MCP로 실제게임 배치/조명 검수. Player 캡처·M1 대체 아님 |
| Editor Terrain 보호 | HellLightingSetup의 TerrainLayer 조정 전에 Editor에서만 TerrainData를 Instantiate하여 런타임 사본으로 사용. Player 동작과 높이 데이터는 그대로. 이전 Editor 재작성은 terrain-preview-before.asset에 보존 후 HEAD 필터 실제 byte로 복원(SHA5cc0a5619e3687e9b81fcb9a185d1607370b9a070567456c5c0cdfdf2b44770b). 다음 Editor에서 비에셋 사본/원본 보존 확인 예정 |
| 자산 | R3 sourceb9ffca060의17FBX·종속재질/텍스처185파일만 Resources/Art/map/a2/r3에 동일byte 인수. R3 정적RETOUCH 유지, R4 HOLD 인수0. r1 Foam_Bank 현재 사용0 |
| 큰 질량 | 주거목4/후경15+19 고정위치 보존. Hollow_Loft_Tree 현재v4b13510정점/26876삼각형/재질3, Unity임포트14292정점. 주거목4+후경5/속빈외피·비대칭뿌리. 낮은뿌리8갈래와새스캔부조4/회갈색이끼·균류·낙엽 유지. 실제Editor에서기하확인/새Player미검증 |
| 다리 | 중심(43.2,−71.8)u/yaw+24°/scale(.96,.55,.85)×.75. A2ForestLayout 다리 보행 |Along|≤4.45u·|Across|≤1.7u. 원본 JSON은 보존하고 A2 질의에만 수로·거목 경계 적용. 새 폭/배율은 실제 메시 높이7.24%였던21u 후보에서 카메라와 함께 수정. 현재 발 접지·동작 GPU 미검증 |
| 카메라 구도 | 비A2 LOOK-001 그대로. A2만 pitch34°/distance16.5u/FOV46.9453°, 공통TargetOffset+(3,0,.6)u. SMAA High. 실제 새 Editor 위치(45,9.24,-86.23)·1920×1080 확인. 실제 Player 영웅8~11% 재검수 전 |
| 독액 | A2ToxicRiver: linear RGB(.40,.32,.035), 거품(.57,.52,.23), emission.1. 저주파속도.12/.08·법선.07/.045, smoothness.78→거품.22, 깊이접촉.025~.28u. SSOT수로 RFloat512² 거리장으로수평.04~.50u 거품, 흐르는넓은오염띠16% 추가. 수면Y−1.25는기존SSOT. 새D3D11 Player 검수전 |
| 접촉 거품 깊이 | 기존 URP_PC_High/Mac_Balanced의 m_RequireDepthTexture=0 확인. A2 카메라에 requiresDepthTexture=true, 수면은 Transparent 큐/ZWrite On/alpha1로 불투명 지형 깊이 복사 후 샘플. 실제 거품 표현 미검증 |
| 수로 | Water: z(−94,−30),동쪽 x>Shore(z)와 둥근 지류 BranchDistance<0의 합집합. Shore=48+1.4sin((z+72)×.22)+34×smoothstep(−66,−56,z)−28×smoothstep(−52,−42,z)로 북동쪽에 굽어 빠짐. 남동 앵글러(148,150) 접근을 수로가 덮던 실제 회귀 FAIL을 고쳐 고정 위치/전투 규칙 보존. 수위−1.25, 연속 수면 x−30~110/z−100~70. 실제 수로 접점에만 수직 강둑. 암반9·말뚝5·강둑13접합/지류 접합. 기존 River_/Pool_만 숨김·r1거품 미사용 |
| 반영 | 환경 Realtime ReflectionProbe256²×6면/OnAwake·위치(50,GroundY(50,−72)+1,−72)/크기180×80×260/boxProjection/강도.55/importance100/far150 유지. A2RiverReflection 실제 평면반사960×540 ARGBHalf/수면Y−1.25/oblique clip+.04u, Water layer4 제외·후처리off/깊이on. 설치 URP SingleCameraRequest+SubmitRenderRequest, 정지.1초/이동.05u/회전.3° 갱신. D3D12는진단폴백/실제반사는D3D11에서만채택. 현재혼합(.48+.32×Fresnel³)×(1−거품), 색(.85,.80,.42), UV왜곡n.xz×.12. 새혼합D3D11 Player 재검수전 |
| 횃불 | R3 holder×.5·8프레임 불꽃/높이1.24u. 다리 국소 Along±3.65/Across±2.5u를 world로 변환해 두 끝에 배치. RGB(1,.55,.19)/강도7/반경5/soft shadow/bias.04/normalBias.1. 받침 투사만off, 기존 화로 루트off/Pool_Hell광원0 |
| 분위기 | A2 배경/선형안개(.23,.29,.35)/16..40u/far240. 환경광 sky(.22,.26,.31)/equator(.14,.14,.135)/ground(.04,.035,.03). 주광2.4/색(1,.96,.90)/회전(54,-32,0)/그림자.65. Volume+.25EV/대비16·ACES·블룸.16. 빛기둥4 색(1.4,1.6,1.8)/alpha.045. GraphicsSettings FogStripping Custom1/기존3안개keep1의e271 실제Player원경복원확인. 새중립목질광은Player재검수전 |
| 임포트 | SourceTextureImporter v3의 a2/ground Repeat 예외 유지. 원래 낙엽3맵+새 흙/뿌리6맵1024²/Repeat/mipmap/Trilinear/aniso8. BaseColor sRGB, NormalMap/Roughness linear. A2GroundCoverImporter v3은 기존4개+Hollow+RootRelief FBX의 정확6경로만 읽기true. 신규 RootRelief는2k/Clamp/Trilinear/mipmap/aniso8, BaseColor sRGB·Normal/ARM linear |
| 기존 바닥 셰이더 | 작업 시작부터 실제 사용 중인 HellGroundPBR.shader가 미추적이고 .meta만 Git에 있음을 확인. 해당 원본 byte를 보존해 필수 런타임 소스로 함께 체크포인트하며 새 시각합격으로 세지 않음 |
| A2 바닥 | HellGroundPBR _ForestBlend 기본0/A2만1. 기존 바닥 폴백 유지. 새 자갈흙3.2u/뿌리흙2.5u와 국소 낙엽2.1u를 거리·저주파 마스크로 혼합, 낙엽mix.35. 새6맵 모두 로드될 때 _SoilTextureMix=1, 하나라도 누락하면0으로 기존 흙·낙엽 폴백/에러 기록. 비A2 soilMix0. 정확 tint/normal/roughness는 최신 절 |
| 숲 바닥 출처 | [Poly Haven Forest Floor](https://polyhaven.com/a/forest_floor), eye-candy.xyz/CC0, Powered by Poly Haven. 무료 원본1024² BaseColor/NormalGL/Roughness3맵, 합8100628B 동일byte 인수. 생성/구매/크레딧0. 원본·API메타·MD5/SHA는 I:/EXODUSER-Storage/steam-keyshot/a2/forest-floor-source/출처-영수증.json |
| 검은 무늬 | A2에서 이름이 Decals_blood로 시작하는 기존 메시 렌더러만 비활성. 이전 분리진단의 원인 수정이며 원본/충돌 불변 |
| 촬영 | --unity-steam-keyshot+A2는 실제NativeGame/격리세이브·실제AI/스크립트입력. 주3장은 hidden non-batch Player의 최종 ScreenCapture 프레임/HUD포함1920×1080. actualScreen=true·captureSource·screenWidth/Height·휘도>.01·Unity오류0·실제활성스킨높이8~11%가 통과조건. GPU batch/별도카메라 요청은 A2 최종검수 통과 불가 |
| 영웅 크기 | R5가 있으면 실제 SkinnedMeshRenderer.BakeMesh 정점 투영으로 측정. 숨긴2D스프라이트 높이를 실제전사 크기로 인용하지 않음. 원래8~11% 촬영검사 유지 |
| 미니맵 경계 | SourceMap.DisplayTile(tx,ty)는 추가 경계가 차단한 타일 중심을1로 반환하고 나머지는 원본 Data.tiles 값을 그대로 반환. NativeFieldHud는 이 값으로 기존 미니맵을 그린다. A2 수로/다리/비A2 표시3검사PASS, UI 모양·원본 맵 데이터 변경0. 미니맵-수정전-FAIL.json에 수정 전 불일치 보존 |
| 보행 교차 회귀 | 실제 SourceMap/ch1_map 현재36검사PASS. 수면123472표본/보행겹침0/다리101점, 도달16766타일/출구3·고정앵글러4접근/시야. 주거목 충돌 왼쪽2.6u/먼쪽2u/섬1.8u/북서1.9u, 밑동1.3u/기존후경15×.8u·작은후경19×.5u. 새경계안팎6점고체검사 포함. 원본JSON/Core규칙보존 |
| 종료 | 미디어닫기·효과음정리·1초배출. 보스1100tick 제한 마지막 촬영 분기1099로 교정 |
| 검증 | erosion/dd53cf66 빌드오류0/MCP제외PASS, bfd44855 실제1920 3장·탄3/15·검정수정 확인. 다만 CPU정점읽기210오류/뿌리·낙엽 누락/경계톱니/빈보스바닥으로 실제FAIL. receipt.passed=true는 아트/오류 통과가 아니며 다음코드에 unityErrors==0 조건 추가. 새소스 독립C#0·28경계/침수/동선검사PASS, 실제GPU/현재빌드M1/통합/일반Desktop 미검증 |

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
| TECH QA | 이전824b67a99 빌드/M1 통과와 현재 수정소스 검증을 구분. 현재 수정은 독립C#0, 28회귀PASS, Unity/GPU/실제동선/성능/M1 재검수 필수 |
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
| 메시 읽기 | A2GroundCoverImporter v2은 정확 PineRootsA/B·R3DeadLeaf·ScannedStump4FBX만 isReadable=true. 해당4meta도 명시. 누락이면 원본메시 유지/이름별1회오류, 빈정점으로 원본 메시를 지우지 않음. 새Player에서오류0·4메시실존 재검수필수 |
| 침수 경계 | CutHeight는 수면정점을 water−.3u로 내려 부분잔류삼각형의 높은원본정점/톱니를 제거. 원본FieldMesh와외곽에같이적용, 별도섬메시는동일IslandHeight유지. 26회귀PASS, 실제Pixel 재검수필수 |
| 높이 재사용 | ForestHeight가 기존 연장/Bank/Island수식 단일원본. 원본Terrain1025² float표본1회읽기, native256점대조 오차>.0005u면native폴백. 배우/정점이같은캐시/수식사용. 외곽은미사용내부정점계산생략·경계원본높이재사용. 이전조립104373ms→현재속도/오차는새Player미검증 |
| 물가 접합 | Roots/낙엽의정점이 비섬수면에걸치면 수면−.18u로내림, 나머지는GroundY. 같은실제ReadWrite메시의UV·normal/tangent 재계산. 지면보조물만/코어충돌불변 |
| 촬영 오류 | keyshotLog Error/Exception/Assert집계, receipt.unityErrors==0이추가통과조건. 실제보이는전사스킨(2D아레나도활성3D전사있음)을측정. 숨긴스프라이트 측정값8.1%는실제전사값으로채택하지않음 |
| 자연 보스 순간 | 로딩완료후 실제boss+260/−150px에플레이어1회배치. 촬영직전순간이동제거. AI가중심600px 내에있고적탄6이상인자연순간선택, 적/탄/AI위치주입0. 최종1099fallback유지. 보스AI/NativeBossView/3D모델변경0 |
| A2 보스 카메라 | 기존의.53배줌인대신view.orthographicSize×.9=기본4.86u(A2만). 실제3D영웅8~11%재측정필수. 보스PresentationScale.72/물리/전투불변. 현재2D보스,3D모델인수0 |
| A2 보스 지면 | Clamp rock_face 대신 기존Repeat rock_ground Diffuse/Normal을기존ArenaSoilLit worldXY/4u에연결. NativeArenaView/충돌/벽마스크수정0 |
| A2 보스 낮은 프레임 | 전체 흙바닥이 포함된 PineRoots14개는 검은 패드 결함으로 제거. 실제Room중심 타원8.5×6.2u의 작은 암반7개/scale(.16,.12,.18)만 유지. 횃불2개×.45/중심±6,±2.5u/pitch−52°·불꽃8프레임12fps/scale.12·기존국소광3 유지. 추가 directional은 금빛 과장/문제 미해결로 제거. 장식Collider0·보스모델/AI변경0 |
| 전경·빛 | 빛기둥은기존4개depthfade메시를가산합성alpha.18로교정. 실제볼류메트릭안개가아님. Linear안개14~54u. 입체뿌리/낙엽이현재Player에서누락됐으므로개선완료라부르지않음 |

### 먼 수로의 원근 연결
남동 고정앵글러 주변에서 북동쪽으로 비켜간 강이 z−52~−42u에서 다시28u 돌아와 먼 오른쪽 숲에 보이도록 Shore를 보완했다. 고정앵글러 위치/AI/보행 규칙은 보존한다. 현재 수면123571표본/보행겹침0, 연결16842타일/출구3·앵글러4접근, 수로 원근 재연결 포함28검사PASS. 실제 새Player에서 조립시간·오류·1x 검수 전이다.

### 신규 아레나 스크립트 메타 교정
18:44UTC Editor 기동은 NativeGame.A2Arena.cs.meta GUID33자로 파일이무시되어 CS0103두곳으로실패했다. 자기신규GUID를32자로교정하고신규메타15개형식검사0오류. 수동독립C#0은Unity자산임포트완료의증거가아님을확인했다. 로그 server-20261030T184452621.log를보존하고수정입력으로1회재기동한다.

## 2026-10-31 조립 병목과 D3D12 반사 크래시

| 항목 | 관측·수정·남은 검수 |
|---|---|
| 실제 edb526c73 Editor | 1920화면 A2_침수접합_edb526c73-1.png. 정확3모델Importer 읽기true, 뿌리/낙엽 실존·톱니제거 확인. 높이캐시256점 오차최대2.384186E−07u. 조립은100831ms로 남아 높이재사용만을 성능해결로 세지 않음. 큰 원화 차이로 아트FAIL 유지 |
| 실제 병목 재현 | 기존 long키 기본해시 high^low가128²그리드49408변을78해시에 몰고 최대동일해시8256개,614ms. edge-check/기존-long-해시-FAIL.json 보존. A2MeshEdgeComparer가 양쪽uint정점을 각73856093/19349663으로 섞음. 같은49408변/49408해시·최대1/외곽512개·2ms PASS. 변 동등성·위상은 그대로. 실제513²Unity조립시간 재검수필수 |
| 실제 엔진 크래시 | server-20261030T184746855.log의 RenderSurfaceD3D12::CreateTextureD3D12Internal→CameraScripting::SubmitRenderRequests→A2RiverReflection.LateUpdate46. Windows/드라이버 전체 결함으로 일반화하지 않음 |
| 백엔드 회피 | D3D12에서만 평면반사 component를 꺼 환경반사/기본수면으로 폴백·경고1회. D3D11에서는 실제반사 유지, 반사카메라 targetTexture도 자기960×540 RT로 명시. 관측된Player는 모두 force-d3d11. 새Editor 안정성/새Player반사·M1은미검증 |
| 조명 시안 | 어두운명암/두꺼운뿌리/작은낙엽/밝은빛기둥 메모리A/B는 크래시뒤MCP연결없음으로 미실행. 시안개선/PASS로 세지 않음. 현재소스 조명값은 위계약 유지 |

## 2026-10-31 실제 MCP 명암·비율과 정밀 수로

| 항목 | 실제 확인과 현재 계약 |
|---|---|
| 생성 성능 | source70082344e 실제 Editor46124: 수로·외곽486ms. 이전100831ms 지연의 해시충돌 수정 확인. D3D12 폴백 경고1회, 새 네이티브 충돌0. 최종 D3D11 Player 검수와 구분 |
| 같은 크기/1x | A2_명암뿌리다리_MCP시안.png 및 editor-review의 같은 크기/1x 목질·다리 직접 확인. 잎101개와 다리 비율·명암 개선. 실제 NativeGame Play 시안이며 Player/완료 증거 아님 |
| 확정한 시안 값 | 노출+.25EV/대비16, 환경광(.20,.25,.30)/(.12,.14,.16)/(.035,.03,.02), 주광2.1/RGB(.8,.87,1)/그림자.65. 다리 scale(.96,.55,.85)×.75, 기존 보행경계는 유지. 낙엽 모듈 units.45를 정점 접합 전에 적용. PineRoots scale(3.2,4.3,4). 거목 노멀/오클루전 각.9, 이끼 tint(.65,.60,.40) |
| 수관 빛 | 기존4개 중 첫 접점(39.5,−72.8)u로 이동. HDR RGB(2,2.5,3)/alpha.18. 첫 접점에서 offset(−4,13,4.5) 국소 spot, RGB(.55,.67,1)/강도30/범위18/각22·내각14/soft. 전부 표현층, 실제 볼류메트릭 아님 |
| 단면 원인 분리 | 새 강둑·옛 Decals_wet·외곽·원본 표면을 각각 분리 촬영. 문제 단면은 원본영역 표면의 경계 잔류삼각형임을 확인. Decals_wet 숨김은 개선 증거가 없어 소스 변경 안 함 |
| 정밀 수로 | 삼각형 중심점으로 통째 제거하던 근사 대신 물/육지 혼합 삼각형을 실제 Water 경계에서 clip. 변마다16회 이분 탐색·마른 쪽 유지, 교차정점은 변 키로 재사용/동일 GroundY·보간UV. 수면 원본정점은 기존 water−.3u 유지. 새 교차정점의 순서/공유변/노멀·tangent 재계산 후 강둑 연결. 보행/AI/원본JSON/투사체 규칙 변경0 |
| 판정 | 현재 아트 FAIL 유지. 거목 큰 형태·수관·강가/재질·원화 원근 차이를 계속 수정. 새 영구 소스 실제 GPU/Player3장·동일 빌드 M1·통합·Desktop 미검증 |

### 굽은 강둑의 경사 폭 보정
0bbeec61a 실제 Editor에서 경계 교차1573점/지형405298삼각형을 확인했으나 굽은 물가의 높은 단면이 남아 FAIL로 판정했다. 실제 카메라 ray/삼각형 교차로 (55.15,−.52,−63.12)u 부근의 메시 높이=GroundY를 확인했다. 원인은 Shore(z)−x를 그대로 거리로 써 강 굽이에서2u 경사가 좁아진 것. slope=(Shore(z+.05)−Shore(z−.05))/.1, d=(Shore(z)−x)/sqrt(1+slope²)로 국소 법선 간격을 근사하고 지류 SDF와 min한 기존 smoothstep2u를 적용한다. 보행/수로/투사체 경계는 변경0. 실제 법선 방향1cm 간격 높이연속성 회귀를 추가해 29검사 중1실패를 재현·보존한 뒤29/29 PASS. 새 GPU/최종Player 검수필수.

### 지류를 직각 직사각형에서 둥근 침식 형태로 전환
원화와 같은 물가의 큰 형태를 위해 BranchDistance를 Water/BankHeight가 공유한다. w=Across, u=Along−.35sin(w×.45), end=w−clamp(w,−5.75,17.25), width=2.75+.20sin(w×.73)+.12cos(w×1.6), signedDistance=sqrt(u²+end²)−width. 양끝 둥근 형태와 낮은 굽음으로 직각 꼭짓점을 제거하며 다리 통행 경계는 기존4.45/1.7u 유지. 실제 지류 끝 모서리 검사 실패1을 먼저 재현·보존한 뒤30/30 PASS, 수면123472표본/보행겹침0·출구3/3·고정앵글러4접근 유지. 큰형태·수면반사·현재Player/동일빌드M1은 다음 검수 대상. 별도 목질8배 세부결 MCP시안은1x 개선이 뚜렷하지 않아 인수0.

## 2026-10-31 source1e0a748e8 실제 Player와 같은 빌드 M1

| 항목 | 실제 근거와 판정 |
|---|---|
| 빌드 | 8b4e655b, StandaloneWindows64/6000.6.7f1/BuildReport Succeeded/오류0/3734889646B. 실행기 errorLogs2는 별도 보존, C# compileErrors0. MCP 파일/관리참조0:212파일/160DLL PASS |
| 실제3장 | hidden Player765006d8/D3D11/25.6초, 탐험8.4726%·전투9.3696%/적탄3·드루이드7.3557%/적탄15, 평균휘도.1589/.1584/.1461. unityErrors0/정점읽기오류0. 보스 크기 기준8~11% 미달로 exit3. 창0/세이브0/잔여0. 실제 PNG3장과 원화 같은크기·1x 직접 확인 |
| 실제 성능/반사 | 수로·외곽1697ms/전체1797ms, 원본 높이256점오차2.384186E−07u. D3D11 평면반사가 실제 이미지에 보이며 크래시0. 최종아트 합격과 분리 |
| M1 | 같은 shore-build, c9a2389a/25.9초,23단계 전부ok·firstBlocked빈값·실제화면32장/AMD RX9070XT/D3D11. 창0/세이브0/잔여0. 다음 소스에 소급하지 않음 |
| 시각 결함 | 원화에 비해 넓은 평면 바닥·가늘고 반복되는 나무/작은 밑동·부족한 큰 목질·단순한 물가, 보스 암반의 검은 무리와 영웅크기 부족. 아트FAIL 유지/공통·Desktop 채택0 |
| 후속 코드 | A2 보스 카메라 기본5.4×.9=4.86u. 낮은 암반7개를 scale(.16,.12,.18)로 줄임. 필드 주광이 꺼진 XY 아레나에만 전용 directional RGB(.6,.7,.85)/강도.9/회전(25,−25,0)/그림자없음. rig와 함께 비활성, Core/AI/보스모델불변. 실제 조명 재검수필수 |
| 필드 환경광 재진입 | HellLightingActive(on)의 이전(.31,.34,.36) 덮어쓰기를 제거. 조립/활성화가 A2Ambient 한 함수를 공유해 (.20,.25,.30)/(.12,.14,.16)/(.035,.03,.02)를 적용. 현재 독립C#0, 실제 새후보 미검증 |
| 단일 실행 | 자기 예약 정상 반환, 다음 기존 UI-tab-audio 예약 보존. 큰형태 보완은 자기 오프라인 자산에서 진행, 타프로세스 종료0 |

## 2026-10-31 실제 스캔 큰 밑동 제작 후보

| 항목 | 출처·규격·검수 한계 |
|---|---|
| 원본 | [Poly Haven Tree Stump 01](https://polyhaven.com/a/tree_stump_01), Rob Tuytel/CC0/Powered by Poly Haven. 공식2k glTF5파일11375163B 전부 MD5 확인·SHA256 원장. 원본·API메타·변환은 I:/EXODUSER-Storage/steam-keyshot/a2/scanned-stump-source 및 scanned-stump-export. 결제0/생성크레딧0 |
| 메시 | 원본41046→20523삼각형/원본UV 유지·decimate.5. Blender 축 크기(1.425737,1.590188,.572362)m, 중앙/최저점 원점. Traceback0/의미성공표식 확인. 정적 변환 성공을 실게임PASS로 보지 않음 |
| 현재 배치 | Resources/Art/map/a2/stump의1FBX/1재질/3텍스처. 기존4주간에 scale(3.2,2.8,3.2)/yaw각주간/lift−.18, tint(.85,.78,.65)/PineRoots를 유지하고 큰 밑동을 추가. 지면/수면 정점 접합은 같은 GroundY/WaterLevel−.18. 장식·충돌/Core변경0 |
| 재질/임포트 | 원본2k Diffuse/NormalGL 동일byte, ARM의 R을Unity AO_G·1−G를smoothness_A·Metal_R0으로 포장. URP Lit/normal.65/occlusion.65. SourceTextureImporter v3의A2규칙으로sRGB색·linearNormal/Mask·mipmap/Trilinear/aniso8/max2048/Clamp. A2GroundCoverImporter v2는 정확4모델만읽기true |
| 다음 실제검수 | 큰 밑동의 접합·컷면 노출·실루엣·카메라 거리16/18u 및 왼쪽거목 회전 대조. 이끼 카드의 검은 암부는 실제 Unlit 분리로 먼저 진단. 현재 GPU/Player미검증/아트FAIL 유지 |

### 동일 순간 일반 화면 진단과 시작점 장식
이전 source1e0a748e8 M1의 일반 시작화면에서 빛기둥이 키샷보다 밝았다. 위치4020:7420/4200:7460 및 화면1600×900/1920×1080도 달라 아직 촬영 경로를 원인으로 확정하지 않는다. 현재 A2 비batch 키샷은 KeyshotSave의 같은 EndOfFrame에서 ScreenCapture.CaptureScreenshotAsTexture로 `_일반화면_HUD포함.png`3장을 추가 보존한다. receipt.frame.screenWidth/Height/screenLuminance로 실제 표시 해상도·밝기를 기록하며 기존 월드 RT 촬영과 직접 비교한다. HUD포함 진단을 최종 키샷으로 바꿔 부르지 않는다. 일반 시작점의 전사가 횃불과 겹치던 실제화면을 고치기 위해 장식 Along±3.65는 유지하고 Across±1.95→±2.5u. 원본 시작점/보행/Core/세이브 변경0. 이끼 BaseColor 알파검사:2048²/완전투명3904442·부분51281·불투명238581픽셀, 마스크 누락으로 단정하지 않음. 현재 독립Core/C#0, 실제 새후보 미검증.

## 2026-10-31 04:50 KST 실제 MCP 분리 판정과 제작 단계 복귀

| 항목 | 직접 본 결과·현재 처리 |
|---|---|
| 새 스캔 밑동 | A2_스캔밑동_ed331fab6.png에서 실존/접합 확인. 첫4배높이는 밝은 암반처럼 보여 FAIL. 높이2.8/tint(.85,.78,.65) 시안으로 낮춰 목질/접합을 보완했으나 큰 줄기/속빈 형태 부족은 남음. 현재소스에 이값 반영, 아트FAIL 유지 |
| 촬영 경로 분리 | 같은 위치/1920×1080의 자동 카메라RT 읽기 A2_자동렌더_RT.png와 수동요청 스캔밑동 화면은 같은 표현. M1 시작점/키샷 차이만으로 촬영버그라 확정하지 않음. 다음Player 같은순간 HUD포함 추가진단 유지 |
| 카메라 | 기존38°/18u,38°/16u,32°/16u 및34°/16.5u 실제 정지게임 시안 대조. 34°/16.5u 선택. 거리/Pitch를 NativeRemodel3D 단일값으로 두고 Cinemachine pose/follow 및 횃불 정렬이 같은값을 사용. 예상 필드높이 약9.7/10.8%, 실제활성스킨 측정은 새Player 필요 |
| 거목 방향 | 기존25°/145°/265° 비교. 방향 변경만으로 속빈 큰형태 해결 불가, 기존25° 유지. 기존Boolean2실패 방식 재시도0. 새 방식은 구멍을 Boolean으로 뚫는 대신 안/밖 표면과 뿌리 플레어를 이어 만드는 줄기 모델 후보 제작 |
| 이끼 | 기존Lit/Unlit 분리에서 투명마스크는정상·조명 암부 영향 확인. Unlit을 최종 채택하지 않음. 기존자산의 긴 가닥UV/양면 조명 검토를 새모델큰형태 뒤 진행. 현재영구소스는기존Lit 유지 |
| 독액 | RGB(.5,.32,.025)/emission.16 시안은 갈색 과장으로 미채택. 영구값(.4,.32,.035)/.1 유지 |
| 보스 검은 덩어리 | 실제MeshRenderer이름/UV/Unlit 분리로 MossRock이 아니라 PineRoots의 넓은 스캔 흙바닥14개임을 확정. 3.5cm/11.5cm 높이 절단2시안은 패드/파편으로 FAIL, 방식 중단·소스인수0. 보스방PineRoots 배치 제거, 필드원본자산보존. 전용directional과flat환경광 시안도 해결0/과장으로 미채택 |
| 실제 아레나 한계 | Editor 640×480 시점의 ortho6.075u를 1920 Player의4.86u 증거로 인용하지 않음. 원래1e0 Player7.36%→현재×.9배율은새Player 재측정필수. 보스는기존2D/3D담당checkpoint0 유지 |
| 실행과 다음 | 자기Editor34952 공식stop/예약반환·타프로세스변경0. 큰거목 제작은오프라인에서진행, 타담당정식QA와장시간렌더안겹침. 현재 독립Core/C#0, 새Player/M1/통합/Desktop 미완료 |

## 2026-10-31 05:18 KST 이끼 사진 채널 불일치 교정 후보

| 항목 | 실제 파일 근거·현재 계약 |
|---|---|
| 직접 근거 | RF3_Hanging_Moss 재질 BaseMap은 Atlas_hanging_moss_BaseColor이나 BumpMap은 Atlas_moss_01_Normal(guid2efbbe8a78e2c2edaf4e4455bde17f3c), AO는 Atlas_moss_01_AO(577a0bcb03615b48363a3413e144d633)임을 현재meta와대조. 서로다른사진UV의normal/AO를혼합한불일치. 기존MCP Lit/Unlit분리와알파검사도보존 |
| A2 전용 수정 | Resources/Art/map/a2/foliage/Materials/A2_Hanging_Moss_Lit. 원본R3재질/사진byte보존. 같은BaseMap/alphaClip.32/Cull0/Queue2450 유지, 다른사진의Bump/MetallicMask/AO연결제거. keyword는ALPHATEST_ON만, Metallic0/Smoothness.15. 명시재질을리소스에두어Player의해당셰이더variant포함 |
| 런타임 | A2Module Hanging_Moss만새Lit재질을사용, 누락시기존재질폴백. tint(1,.95,.75), 투사Off/수광On. 새로운이미지생성0/결제0. 현재독립Core/C#0, 실제새GPU미검증 |
| 공통 인수 | 공통b9491cf58 오디오실제입력74/같은빌드M1검수분을정상병합한ad9702975 원격동일. 원래guard WIP보존. 자기새아트의GPU/M1로소급하지않음 |
| 새 거목 | I: hollow-loft-v3 actual14072정점/27872삼각형/UV·재질3, .5/2/4/5.2m ray와내부법선·유한값5검사PASS. 첫v2시각FAIL을보존하고연속곡선/불규칙형태로보완. v3정적렌더는보스정식QA반환까지대기, Unity채택0 |

## 2026-10-31 05:28 KST 연속 속빈 주거목의 제한 적용 후보

| 항목 | 현재 계약과 검수 범위 |
|---|---|
| 제작 방식 | Boolean 절삭 후보의 실패를 보존한 뒤 연속 외피·내피·개구부 곡선과 일체형 뿌리 벌어짐으로 변경. Blender 원본과 렌더는 I: a2/hollow-loft-v3에 보관 |
| 실제 자산 | Resources/Art/map/a2/hollow/Models/A2_Hollow_Loft_Tree.fbx. 실제 메시 14072정점·27872삼각형, UV, 재질3개. 기존 hell_lighting/bark_brown_02_Diffuse.jpg와 nor_gl.jpg를 참조하며 텍스처 중복0 |
| 재질 | A2_Loft_Bark 색(.65,.55,.40)/normal .8, Inner(.19,.13,.075)/.5, Broken(.62,.40,.20)/.25. 공통 Metallic0/Smoothness.18, 다른 사진의 mask/AO 연결0 |
| 적용 범위 | A2RootedTree x34.8/z-70.5인 왼쪽 주거목 한 그루만 scale1/yaw0/lift-.02 후보. 해당 모델 누락 시 기존 조립 경로. 다른 거목·충돌반경은 기존 값 보존 |
| 접지 | 바닥 상대높이1u까지 지형차를 전부 적용하고 1..3u smoothstep으로 줄여 3u 이상 줄기와 수관은 변형0. A2GroundCoverImporter 버전3, 기존4개와 새 FBX만 isReadable=true |
| 정적 검수 | CPU2스레드 미리보기2장 직접 확인. 개구부 계단 결함 제거와 이어진 줄기·뿌리 확인. 가지 갈고리와 얇은 뿌리 끝은 RETOUCH. 정적 카메라의 좌우 변환은 미검증이므로 실제 구도 근거로 사용하지 않음 |
| 상태 | 제한된 Unity 비교 후보. 게임 아트 PASS 아님. 실제 Editor/Player·같은 빌드 M1·일반 Desktop 갱신은 아직0 |
| 실행 경계 | 보스 담당의 M1 23/23 후 종료지연/로그공유 IOException 및 잔존 핸들 사실 인수. 공식 예약 반환 뒤 A2 예약. 타인 프로세스 강제종료0·공용 잠금 임의변경0 |

## 2026-10-31 05:34 KST 실제 게임 비교 후 주거목·뿌리·회갈색 이끼 후보

| 항목 | 최신 후보 계약 |
|---|---|
| 직접 화면 | McpCaptures/loft-v3-first/depth/second-tree/landing.png 실제 게임 카메라1920×1080. 속빈 내부가 보이고 큰 스캔 뿌리패드를 제거할 수 있음. 별도 Root_Stump가 다리 건너 바위 덩어리의 직접 원인임을 분리 확인 |
| 주거목 | 네 고정 좌표 모두 Hollow_Loft_Tree 우선/자산누락 시 이전 경로. 가로scale 34.8=1/29.5=.78/49와53.3=.74. 높이29.5=1/53.3=.85/나머지1.05. yaw순서0/85/23/137, lift-.02 |
| 낮은 뿌리 | A2RootWeb: 주거목마다8갈래, 13단면×8정점×8갈래=832정점/1536삼각형. 길이(3.5+.9sin(root×2.7))×scale, 시작반경.38→끝.025, 높이반경비.63. 지형·수면-.23을 따르고 바닥 간격.045, 시작높이상승.45. 수피 재질 공유, 장식만/보행·투사체 경계 변경0 |
| 다리 건너 밑동 | 기존 Root_Stump 시각 배치 제거, 같은47.6/-67.2에 Scanned_Stump scale(2,1.2,2)/yaw35/lift-.12. 기존1.3u 충돌 유지 |
| 깊이 | A2 전용 선형 안개16..40u/색(.23,.29,.35), 카메라 배경 같은색. 비A2 원래 분기 보존. 실제메모리 시안으로 먼 숲 분리 개선 확인, 영구 소스 재검수 필요 |
| 이끼 | 새 EXODUSER/A2HangingMoss. 원래사진/알파.32/CullOff/AlphaTest 유지. luma=sqrt(saturate(dot(rgb,(.2126,.7152,.0722)))), lerp(luma,rgb,.18)로 회갈색 처리 후 기존 tint(1,.95,.75). 양면법선·SH·실제주광/추가광·그림자수광·안개 적용, emission0. 기존 다른사진 normal/AO 혼합0 |
| 검증 상태 | 새 셰이더와 전체4그루·뿌리의 실제 GPU는 아직 미검증. 지난 1e0a M1을 소급하지 않음. visual FAIL 잔여: 먼 숲 반복, 지면층 부족, 근경 구도·뿌리 끝 |

## 2026-10-31 05:40 KST 실제 스캔 지면과 원경 반복 보완

| 항목 | 최신 계약과 증거 |
|---|---|
| 출처 | [Roots](https://polyhaven.com/a/roots), Dario Barresi·Dimitrios Savva / [Forest Ground 04](https://polyhaven.com/a/forest_ground_04), Rico Cilliers·Rob Tuytel. 공식 CC0와 현재 API 파일 MD5 확인. Powered by Poly Haven. 비용0 |
| 런타임 | a2/ground/A2_ExposedRoots_*와 A2_ForestSoil_* 각 BaseColor.jpg/Normal.png/Roughness.jpg, 총6맵 11612482B. 원본·조회정보·MD5/SHA256은 I: 뿌리-자갈지면-출처.json. 기존 낙엽3맵도 국소 혼합으로 실제 참조 |
| 지면 혼합 | A2 전용: 자갈흙3.2u 반복/tint(.62,.55,.45)/normal.6, 뿌리흙2.5u/tint(.70,.63,.52)/normal.7. 네 주거목까지 최단거리2..5u와 통로 Across2..5u를 따라 rootMix, 저주파 sweep(.45+.25sweep) 가중. 기존 낙엽 혼합.7→.35, 통로에서는.1 가중/외곽1 가중, 저주파(.25+.75sweep). 전체 평면의 균일 노란 낙엽 제거 |
| 거칠기 | 자갈흙 smoothness=.14+.16(1-Rough), 뿌리흙=.12+.18(1-Rough), 낙엽 기존=.12+.18(1-Rough). 새6텍스처는 기존 숲의 반복 sampler 공유/D3D11 sampler 한도 보존. 비A2 ForestBlend0 분기 유지 |
| 실제 GPU | loft-v3-scanned-ground.png·ground-clusters.png 실제1920×1080 직접 확인. C#/신규 수염이끼/HellGroundPBR 셰이더 오류0. 주거목의3재질 실제 매핑과 정점읽기 확인. 추가 환경광·Flat·프로브Off 진단 시안은 최종 소스 미채택 |
| 근경 방향 | 왼쪽34.8 주거목 yaw0→-25. 실제 화면에서 빈 입구가 화면 안으로 드러나는 방향 확인. 나머지85/23/137 유지 |
| 원경 질량 | 기존15개 고정 줄기 위치/충돌은 유지. (j+layer)%3=0인5그루를 좁은 속빈 줄기 scale(.45+layer*.06,1.05+layer*.15,.48)로 분화. 나머지는 높이·가로비와 R3 A/B를 좌표 sin으로 변화. 규칙적 양쪽 A/B 분리 제거 |
| 덤불 | 4×9 후보격자 x30+col3.5+sin*.4 / z-65+row3.7+sin*.35, 수로와 Across절대3.2u 이내 제외. 실제26개 시안 확인, scale(1.1,.8,1.1)/yaw=row73+col137/lift-.03. 통로는 유지/새 충돌0 |
| 남은 판정 | 큰 검은 패드·고목 바위 덩어리 감소와 회갈색 수염 분리 개선. 원화의 복잡한 뿌리·층별 원근·수면 명암 차이 잔여. 게임 아트 PASS 아님. 현재 소스의 실제 Player3장·같은 빌드M1·일반Desktop 검증은 아직0 |

## 2026-10-31 05:44 KST 복구점 경계와 촬영 검증 정정

| 항목 | 실제 근거 |
|---|---|
| 컴파일·로드 | 최신 소스 강제Refresh 뒤 compiling=false/updating=false, 실제 어셈블리MVID fa976a9c-847a-40aa-a930-2fb905a92aca, Play에서 Hollow9/WitheredShrub92/왼쪽yaw335(-25) 확인. Refresh 요청 직후의 이전 어셈블리 이미지는 최신 배치의 증거로 세지 않음 |
| 촬영 전환 | MCP screenshot 두 번은 PNG를 쓴 뒤에도 reloading 실패를 반환하여 성공 receipt로 채택하지 않음. 대신 실제 자동 렌더된 카메라 RT를 직접 읽어 loft-v3-automatic-frame.png 저장 성공: 1920×1080/frame7945/위치(45,9.24,-86.23). 메인 Player 촬영 대체 아님 |
| 안전 종료 | Play stop→공식 Editor stop 종료0/pid57584 종료 확인→공식unreserve 종료0/잠금0·예약0. GP의 기존 실행파일 GPU batch 비교1회/100초 경계에 자원 반환. 선예약·자기자동대기0 |
| 신규 폴백 | _SoilTextureMix 기본0, 새 지면6맵이 전부 로드될 때1. 누락은 기존 바닥으로 돌아가며 오류로그를 남겨 캡처 통과로 숨기지 않음. 이 작은 후속 소스는 새 Player/최종 셰이더 검수 대상 |
| 품질 판정 | VISUAL VERDICT: FAIL. 속빈 구조/바위패드 제거/회갈색 이끼/흙 구분은 개선. 원화의 복잡한 뿌리와 원근·수면·재질 차이 잔여. 이 복구점은 제작 후보 보존이며 unity/main·Desktop 채택 요청0 |

## 2026-10-31 06:01 KST 실제 Player 결과와 촬영·안개 교정 후보

| 항목 | 결과·입력·한계 |
|---|---|
| 실제 빌드 | 소스/자기원격2f8c726311093c27863e768ac8ee8e5d4c4a5a48. 공식3d718027/Win64/6000.6.7f1/BuildReport오류0/3762198270B. 실제빌드212파일/160DLL/MCP파일0·MCP참조0 확인 |
| 실제 촬영 | 공식9e499ff3/D3D11. 3장·Unity오류0, 필드조립1281ms/원본높이256점오차2.384186E-07u. 탐험높이.0981518/전투.1055537/드루이드.0817301, 적탄0/3/15. 캡처내용검사통과와 시각품질·정상종료를 분리 |
| 최종 표시 차이 | 같은프레임 01-탐험.png의별도요청 빛기둥은약하지만 01-탐험_일반화면_HUD포함.png의실제최종표시는과도하게흼. 같은위치·1920·동일프레임의직접증거. 별도카메라/깊이의존경로 차이이며 정확엔진원인은미확정. 이전 월드촬영의 명암을 최종표시로 인용하지 않음 |
| 촬영 교정 | A2 non-batch KeyshotSave는 최종 ScreenCapture를 주3장에직접저장, HUD도포함. actualScreen과1920×1080/휘도>.01을필수판정. A2 batch의기존RenderRequest폴백은진단만/통과불가. 비A2기존경로유지. 불필요한 OnGUI/사용자화면 수정0 |
| 빛기둥 | 실제최종표시의과광을기준으로색(2,2.5,3)/alpha.18→(1.4,1.6,1.8)/.045. 실제새Player검수전, RT만보고통과하지않음 |
| 안개 가설 | Editor에서보이던원경감쇠가Player에서약함. GraphicsSettings m_FogStripping=Automatic0, 세Keep=1 확인. Runtime에서Linear로전환하는데씬기반자동제거위험. [현재 Unity6000.6공식설명](https://docs.unity.com/en-us/engine/6000.6/manual/unity-editor/editor-settings-reference/comp-manager-group/class-graphics-settings) 확인 뒤 해당파일INDEX/WORK가HEAD동일임을검사·I:원본보존→Custom1 한필드변경. 기존세안개모드는모두keep1. 직접원인확정은새실제Player대조뒤 |
| 보스 소품 | 실제03-드루이드에서작은암반7개도검은파편처럼보여해당시각배치제거. 기존횃불2/광원3/지면/보행/AI/2D보스유지. 3D보스인수0 |
| 종료 실패 | 공식240초경계뒤ReadAllText IOException/실행기종료1. 자기58420/parent49392 HasExited=true·창0·thread1·CIM잔존. 로그InputShutdown까지. 실제검사JSON passed=true여도정상종료PASS아님. 같은빌드M1미실행/연속GPU중단/예약정상반환. 기존GP담당의종료경계진단과조율, 타인종료·권한변경·거부우회0 |
| 품질·인수 | VISUAL VERDICT: FAIL. 판처럼얇은뿌리·검은내부·원경·물가·수면차이잔여. MERGE_QUEUE채택요청0/unity/main미반영/Desktop갱신0. 후속은최종표시·안개검증후근경제작방식보완 |

## 2026-10-31 06:14 KST 검증된 로그 읽기 변경분 한정 인수

GP 원작성자 edf12c419의 exo-unity.ps1·devtools/README·UNITY_DEVTOOLS_SHARED_LOG 정확3파일 변경분만 정상 패치 통합했다. 원작성자의 Read-RunLogShared 함수는 동일byte이며 패치 역방향check로 전체변경분 적용을 확인했다. 원작성자 전체파일에는 이 브랜치에 없는 BrowserDesktopIsolation 선행기능이 있어 전체Git blob동일검사는 실패했고, 해당 미인수기능을 끼워넣지 않고 현재 브라우저분기를 보존했다. 공유읽기 FileShare.ReadWrite와 GPU이름미확인실패만 인수/게임·Core·Runtime·Assets·다른GP문서0. 시간초과·잔존은 계속실패다. 자기실행잠금0에서만교체·원본I:보존. 기존e271 빌드게임입력byte동일, 검수도구변경을게임재빌드로세지않는다.

## 2026-10-31 06:20 KST 실제 안개 복원 확인과 주거목 v4b 비교 후보

| 항목 | 정확 입력·검수·한계 |
|---|---|
| 안개 실제 증거 | 게임소스e271cc02c/빌드3c22df83/3766523550B/오류0/MCP파일·참조0. Tool5a5759acf에서같은바이너리70ea8988 hidden D3D11 RX9070XT 실제최종3장, actualScreen=true1920×1080/Unity오류0/영웅.0981518/.1055537/.0817301/적탄0·3·15. display-fog-caps/01..03 직접확인 |
| 원경·광선 | 직전2f8 실제일반화면과비교해 Custom1 안개보존후 먼숲이푸른감쇠층으로돌아옴. 셰이더제거위험과실제차이를함께확인. 실제최종표시의과한흰빛기둥도새alpha.045로완화. 현재표시를별도RT요청으로대체하지않음 |
| 종료·도구 | 70ea공식결과ok=false/timedOut=true/exit-1/91299ms, 사용자창0/USER_SAVE0/공식leftovers목록0/hiddenDesktopClosedtrue. 내용검사passed=true여도정상종료FAIL. 공유로그읽기수정으로IOException부가없이실패JSON생성확인. 같은빌드M1미실행 |
| 거목 제작 변경 | v3의판형뿌리·U자가지반복을보존하고개별가지절점그래프·비대칭버트레스로제작단계를되돌림. v4정적렌더에서분리가지발견FAIL/Unity인수0. v4b는줄기실제중심과반경.6위치에가지시작점접합후재렌더직접확인. 13510정점/26876삼각형/UV·재질3/속빈입구와법선5검사PASS. 게임아트PASS아님 |
| 모델 인수 | 기존FBX와Inner재질·관련소스4개를I:loft-v4b-before-1793395055427/에보존·SHA기록뒤동일런타임경로에교체. 기존GUID·외부재질매핑·원래수피텍스처유지. Inner색(.19,.13,.075)→(.55,.36,.2)로검은내부의수피가독성비교 |
| 지면·장식 | 더넓은몸통에맞춰수염반경왼쪽2.1u/기타1.6u, z반경×.8. 첫수염은x-.8/z-1.7. 균류군집은x+1.7/z-.7 scale(1,.9,.9)/lift.35와x-1.3/z-1.1 scale(.6,.7,.6)/yaw+160/lift.15. 기존수광·알파·원본사진유지 |
| 충돌·검사 | 왼쪽2.2→2.6/섬1.1→1.8/북서1.1→1.9u, 다른좌표/경계보존. 최초30검사1실패는독립검사의의도영역이옛반경이어서발생. 구오라클FAIL과원본코드보존. 새의도영역밖원본보존검사와안팎6점추가후36검사0실패. 수면겹침0/다리101/출구3·앵글러4접근모두유지 |
| 현재 품질 | VISUAL VERDICT: FAIL 유지. 새v4b의게임시점실제접지·실루엣·명암검수전. 원경표시교정과실제촬영교정은확인했으나전체원화큰차이·정상종료·M1·unity/main·Desktop미완료 |

## 2026-10-31 06:26 KST 새 거목 실게임 기하와 이끼 접합

| 항목 | 검증·현재 계약 |
|---|---|
| 실제 기하 | Editor 신규서버21840/Play 실제카메라1920×1080/frame2629. FBX임포트는 UV·normal 경계 분할 후14292정점/26876삼각형/읽기true, Blender원본13510정점과구분. 위치(34.8,-.95,-70.5)/yaw335(-25)/Inner(.55,.36,.2) 실제조회. loft-v4b-automatic-frame.png 직접확인 |
| 이끼 결함 | 바깥반경만늘린배치가실제게임에서떠보이는결함발견. 개별Hollow메시 삼각형에수평레이교차로표면을찾아 이끼 bounds상단중심을붙이는방식으로변경. 실제시안24/24접합/loft-v4b-attached-moss.png 직접확인. 새목질·균류·지면접합은개선됐으나원화차이FAIL유지 |
| 영구 소스 | A2AttachMoss를 A2 초기화에서1회/수로생성전 호출. 가장가까운Hollow트리의실제읽기가능mesh만사용, 외측12u에서안쪽24u이내최초삼각형교차. 이끼상단을hit-dir*.025로연결하고tint(.8,.76,.6). Collider추가0/원본모델·사진변경0/프레임반복0. 누락메시는건너뛰고원래위치유지 |
| 검사 | 새소스독립Core/C#0. 변경한충돌은최신36검사PASS/수면123472·겹침0/도달16766/출구3·앵글러4접근·시야. 추가장식변경은보행설계에참여하지않음 |
| 종료·자원 | 실제Editor오류0→Playstop→공식stop종료0→공식unreserve종료0. GP종료경계진단에반환/자기GPU·예약·자동대기0. 새영구모델과접합의Player/M1은미검증. Editor RT는기하근거이며최종Player명암/반영검수대체아님 |

## 2026-10-31 06:51 KST 스캔 뿌리의 연속 지면 접합 후보

| 항목 | 현재 입력·검수 한계 |
|---|---|
| 출처 | [Poly Haven Root Cluster 01](https://polyhaven.com/a/root_cluster_01), Jenelle van Heerden·Rico Cilliers, CC0. 공식 glTF와 원본2k BaseColor/NormalGL/ARM 등5파일18198016B 현재 MD5 확인. 원본·출처 영수증은 I:root-cluster-source. 비용0 |
| 방법 변경 | 전체 흙판을 그대로 놓은 root-patch-candidate 정적2장 FAIL/Unity인수0. 높이로 잘라 뿌리를 끊는 방법 대신 전체36040면과 원본UV를 보존하고, 주변.24m의 하위10% 높이를 기준으로 부조를 추출. 해당 실패도 I:에 보존 |
| 부조 | prominence0...36m, 높이=(prominence×.9+원래양수높이×.035)×경계.55m smoothstep. 사진 가중=같은경계×smoothstep(.015,.10,prominence). 정점색 R=사진/G=경계/B=prominence÷.36. 18181정점/36040삼각형,4.12176×2.68349×.3610254m. 원본 삼각형 삭제0 |
| 정적 검사 | root-patch-relief-r1의 제작·가중 영수증, 전체·접합 렌더 직접확인. 경계사진가중0/경계높이0/검사실패0. 큰 흙판은 제거됐으나 미세한 경계차이 잔여로 정적 RETOUCH/게임 아트 PASS 아님 |
| 실제 자산 | Resources/Art/map/a2/rootrelief 아래 FBX·전용재질·원본3맵. EXODUSER/A2RootSurface는 실제 HellGroundPBR의 월드지면15맵/6값을 공유하고, 원본UV 스캔사진·법선·ARM을 정점R로 혼합. AO=ARM.r/거칠기=ARM.g/metal0. scan색(.9,.85,.75), 지면 반복 sampler 공유·scan Clamp 분리, Forward Offset -1,-1 |
| 배치 | NativeGame.A2RootRelief: (x,z,scale,yaw)=(34.8,-70.5,1.05,75)/(49,-64.8,.8,170)/(53.3,-77,.85,237)/(29.5,-64,.8,85). 수로 생성 뒤1회, 정확4개. 실제GroundY를 정점별 추종하고 비섬 수면은WaterLevel-.18u. 새Collider0·기존36보행검사 계약변경0 |
| 실패 폴백 | 모델·재질·지면·지원셰이더 누락은 오류로그와 기존뿌리 유지. 읽기/정점색 개수 불일치는 새장식만 제거. 오류를 숨기고 시각검수 통과하지 않음 |
| 현재 검증 | 독립 최신Core/C#0/0. Unity 셰이더·정점색 임포트·실제 그림자/1x 접합은 아직미검증. 실제 Player3장·같은빌드 M1·통합·일반Desktop 미완료. VISUAL VERDICT: FAIL 유지 |

## 2026-10-31 07:01 KST 실제 경계 융기 진단과 중간 연결층 수정

| 항목 | 변경·증거·한계 |
|---|---|
| 부조 실제 | Unity임포트20728정점/36040삼각형·동수정점색/읽기true, 셰이더지원true/메시지0. 실제4개 원본3맵·지면맵연결/사진가중0..1/Collider0 확인. root-relief-first/wide 실제Editor1920×1080 직접확인. UV경계분할정점은 Blender18181과구분 |
| 부조 배치 교정 | 원본의비대칭피벗때문에밑동덮는범위가좁아수평bounds중심을배치좌표에정렬. scale순서1.7/1.35/1.3/1.35, yaw75/170/237/85. 높이와사진경계0·원본면·UV·원본3맵유지. root-relief-wide 직접확인 |
| 긴 검은 선 | 실제카메라(400,105)레이와읽기가능메시삼각형교차로 지옥바닥(40.39,.54,-79.74) 확인. 가지/RootWeb/Blockout Mass04 각각숨김시에도선잔류. 원본Terrain z-80 경계높이.7799382→z-79 .04202u의직선융기가원인. 숨김진단은영구소스미채택 |
| 경계 높이 | A2 ForestHeight만 원본창안쪽1.6u 표본으로 경계를잇고 inside/inset의smoothstep으로원본내부복귀. 기존외곽저주파·Bank/Island는이후동일적용. cache/native같은표본/배우·소품·지면같은수식. 실제시안 경계.7799382→.001388073u/긴선제거 root-border-smoothed.png 직접확인. 원본Terrain/Core/충돌데이터변경0 |
| 광 시안 | 2.8/색(1,.90,.73)과밝은환경광은과도한갈색이라미채택. 중립주광2.4/색(1,.96,.90), 환경광sky(.22,.26,.31)/equator(.14,.14,.135)/ground(.04,.035,.03)만후속Player비교입력. 속빈내부Point4 시안은균류핫스폿·내부개선부족으로미채택 |
| 덤불 방법 전환 | R3넓은잎카드확대1.8와양면재질교정두시안은원화와불일치하여미채택. 기존r1 마른덤불도굵은다리형태로미채택. 해당실제화면보존후새입체잔가지로제작방식변경. 기존정확배치92곳/크기/충돌보존 |
| 입체 고사 덤불 | NativeGame.A2Bramble: 3공유변형메시,13줄기×주가지1/곁가지3/갈림6=4212삼각형씩. 높이.85..1.25u/가지끝.0008u, 주간반경.032/곁가지.011/갈림.0065u. 실제단면5/갈림4각·곡선링6/4/3. 기존Hollow수피사진·법선공유, tint(1.1,.8,.5), smooth0/bump.45/반사광택·환경반사off. 유료0/새이미지0/원본R3보존·소스누락시원래사진폴백+오류 |
| 다리 이끼 | 기존HangingMoss사진·전용양면셰이더로난간10묶음. Along-3.4..3.4/1.7간격,Across±1.58/scale(.30,.38,.25)/yaw24±90, 상단y.65u/tint(.62,.63,.43). A2AttachMoss뒤별도호출해거목으로오접합하지않음. 새충돌0/보행반경보존 |
| 품질 상태 | 실제a0bdfeb2 어셈블리의기하확인/Unity오류0. 잔가지최종두께·무광수정과최종명암·반영은새Player미검증. 원화의거목·복잡한뿌리·수로·층별원근차이는여전히FAIL. 통합·Desktop채택요청0 |

### 07:02 KST 최신 Editor 실제 검수

실제 어셈블리4e0c287d-bfaa-47b1-8dfc-e62284628c1e. 지면441141정점과같은GroundY 질의 최대차이.0000158548355u, 경계높이.001388073u/전후.02u기울기.004763901. 부조4·입체덤불92·다리이끼10, Unity오류0. 새가지3변형각3276정점/4212삼각형·퇴화/비유한0/주간바깥면방향양수 확인. root-connection-final-editor.png/동크기/640²1x목질·다리직접확인. 형상개선은있으나평평한수면·원화대비근경과뿌리·층별원근차이로전체FAIL. 현재D3D12 Editor반사는진단폴백이며D3D11 Player검수대체아님. Player/M1/일반Desktop미완료.

## 2026-10-31 07:30 KST 실제 Player 검수와 수면·보스 촬영 교정

| 항목 | 정확 입력·결과·새 계약 |
|---|---|
| 직전 실제 입력 | 598749108의새시각소스+최신공통0ced574ef 정상병합4c6b845e01d9d8b116b92e1c3891ba93a3232ff7. 원격같은SHA. 빌드4e18c658/3784613982B/오류0/212파일·160DLL/MCP파일·참조0 |
| 실제 M1 | 같은실행파일de8a5184의23/23내용검사통과. 106379ms/timedOut/exit-1이라정상종료FAIL. 사용자창0/세이브변경0/공식잔여목록0/hiddenDesktopClosed=true. 실제PNG는m1/caps 하위이며목록을추가확인. 과거정상M1로소급하지않음 |
| 실제 3장 | 69d9633b의root-connection-caps 실제최종/HUD포함1920×1080. 영웅높이.0981518/.1057166/.0885409, 탄0/3/25, Unity오류0. 실제기하·경계선제거·새목질·수염·다리이끼확인. 촬영도정상종료FAIL/내용passed와분리 |
| 시각 판정 | 3장·A2동크기/1x·PoE2/노레위6장전후비교생성·직접판정FAIL. 수면평면성/빈약한물가·원화대비큰형태와원근차이. 03은드루이드가잠복해본체가없으므로Steam용채택불가 |
| 최소 덤프 | 이번자기M1생존PID55600/부모53264/생성22:08:50.8828530UTC/EXE/창0 검증.22:09:14 한회0x1004 스레드+핸들정보 최소덤프성공/전체메모리제외. M1진행중수집이므로종료후덤프로주장하지않음. GP파일분석에서동일HID제품명조회대기확인, 파일핸들명·VID/PID없음. 추가수집/라이브접근/장치·권한변경0 |
| 수로 거리장 | NativeGame.A2ShoreField: 512²/RFloat/linear/Bilinear/Clamp/mipmap0, 세계(-30,-100)+(140,170)u. 기존 Shore/기울기±.05u·BranchDistance/IslandRadius를직접사용한wet양수거리. z범위-94..-30과섬경계최솟값. 게임맵·충돌설계변경0. RFloat미지원은기존깊이거품폴백+경고 |
| 거품·흐름 | 수평.04~.50u 거품띠×.85와기존깊이.025~.28u×.72 중큰값, ribbon임계.20..8. 넓은오염띠 sin(p.x×.72+p.z×.36+t×.05)^16과sin(p.x×.22-p.z×.48-t×.1)^8의양수정규화곱×.16. 점·디더·필름그레인추가0. 거품색(.57,.52,.23)/법선.07,.045/smooth.78→.22/반영(.48+.32×Fresnel³) |
| 물가 부조 | 기존4주거목 +Shore9후보(z-79+i×2.6,xShore-.65,scale.95+.15sin(2.1i),접선yaw-90+17sin(i)) +지류양쪽10후보(Along±3.4,Across-5+j×4.5,scale.8+.1(j%3),yaw24±20+j47). 기존Water/Trunk/Bridge면후보제외. 실제Editor14개/거리장Ready1·512² 확인. 정점/사진혼합·새Collider0 유지 |
| 부드러운 그림자 | 설치URP ffe395a3a1d1의Lit.shader가쓰는 _SHADOWS_SOFT/LOW/MEDIUM/HIGH 변종을A2수면·부조·이끼/HellGroundPBR에도추가. 현재PC자산supportsSoftShadows1/quality2 확인. 렌더사이글로벌키워드조회는모두false라실제하드그림자의단독원인확정으로쓰지않음. shader지원/메시지0, 새Player직접검수대상 |
| 보스 촬영 | KeyshotBossVisible: 실제살아있는드루이드/렌더러와Data상태확인. Under/Dive/Erupt/TelePrep/TeleWarn 제외. bounds투영 x.03..97/y.18..88, 높이>.15/카메라앞조건. 03선택및최종passed에가시성필수, bossState/bossVisible영수증기록. 적/탄/AI패턴수정0. Editor정상idle true, 잠복상태만잠깐검사한fixture false/원상복원true/적·탄주입0. 새Player자연순간검수필수 |
| 아레나 지면 | 비A2 ArenaSoilLit 보존/A2ArenaSoilLit만추가. 기존rock5.5u/새숲흙3.2u·뿌리2.5u 사진과법선4맵, 넓은저주파혼합(root가중최대.55)/젖은암화최대.18. 법선.25/.45/.5, 기존실제국소광3·원본floor알파 유지. 누락은기존암반폴백+오류. 실제Editor 반복무늬완화확인/Player미검증 |
| 실패 소품 제외 | 아레나FallenLog8개 URPLit검은가지시안FAIL. 바닥과같은XY국소광전용셰이더시안도군데군데놓은소품으로보여FAIL. 두이미지·셰이더원본SHA를I:arena-wood-failed-candidate 보존후런타임에서8개및미사용셰이더제외. 원래횃불2·광원3 유지. 보스담당신규3D는NOT_READY/인수0 |
| 현재 경계 | 새소스독립Core/C#0/0·수면/부조/아레나셰이더지원true·컴파일메시지0. Editor의private카메라접근진단코드1회실패는reflection으로교정/게임소스컴파일실패아님. D3D12 Editor는반사폴백이므로실제D3D11명암/반영대체아님. 전체VISUAL VERDICT: FAIL, 새Player/M1·통합·일반Desktop미완료 |

## 2026-10-31 08:00 KST 실제 3f25 Player 검수와 스캔 전경 후보

| 항목 | 정확 입력·결과·현재 계약 |
|---|---|
| 직전 실제 입력 | 3f25cca7904e76f07dc21a02491f123086ba3840. 실제 빌드01a326b3/103941ms/exit0/3784630622B/오류0. 212파일·160DLL/MCP파일·ASCII참조0. Core SHA256 9242c48064da01340a1e6eff2ffaf0f696674a90ceedad8faa0187c5fcc404f4, Runtime SHA256 409a4d3e1ab810c392d32633b1baf513f52e9c910700bb4e59747215b3d56130 |
| 동일 빌드 M1 | fe8afcf4의23/23 내용검사·caps 하위32PNG. 106263ms/timedOut=true/exit-1/ok=false라 정상종료 FAIL. 창0/세이브변경0/공식잔여목록0/hiddenDesktopClosed=true. 과거1e0a 정상M1은 현재 소스 근거가 아님 |
| 실제 Player 3장 | d0825d97의shore-motion-caps 01탐험·02전투·03드루이드/HUD포함1920×1080/Unity오류0. 91142ms/timedOut/exit-1/ok=false. bossVisible=true로 잠복 본체 누락은 해결했으나 영웅과 보스가 겹치는 실제 결함 발견. 내용passed=true와 시각 FAIL/종료 FAIL을 분리 |
| 시각 판정 | 실제3장 직접 확인·A2 동크기/1x 보존. 수면 반영 개선은 보이나 광택 노란 접촉띠·단순한 물가·빈 지면·원화 대비 큰 형태와 원근 차이 잔존. 전체 VISUAL VERDICT: FAIL. common/일반Desktop 채택0 |
| 새 전경 출처 | Poly Haven dead_tree_trunk_02, CC0, Jenelle van Heerden(촬영)/Rico Cilliers(처리). 기존R3 원본5파일13351323B를 이번 공식 files API MD5와 전부 대조. 로컬 gltf 이름은 dead_tree_trunk_02.gltf, 공식 2k descriptor는 dead_tree_trunk_02_2k.gltf인 명명 차이를 명시적으로 매핑. 첫 파일명 조회 실패를 원본 변조로 판단하지 않음. 비용0/기존원본 수정0. I:foreground-log-source/출처-영수증.json |
| 새 전경 제작 | Blender CPU2, decimate .55, 원본UV1/원본2k BaseColor·Normal·ARM 유지/재베이크0. Blender27064정점·45719삼각형·4.051744×1.055865×1.055913m. Unity 실제27151정점·45719삼각형·readable=true/vertex R min=max1. 동일 RootSurface 셰이더로 스캔사진만 사용, _ScanColor(.55,.50,.36), 새Collider0. 정적2장·실제EditorRT는 Player/Steam PASS 근거가 아님 |
| 경로·임포터 | Art/map/a2/foreground/Models/A2_Scanned_Foreground_Log.fbx, Materials 동명.mat, Textures 동명_BaseColor.jpg/_Normal.jpg/_ARM.jpg. A2GroundCoverImporter exact whitelist 7개/GetVersion3 유지. 기존6개 계약 보존/메시 정점읽기 사용 |
| 전경 배치 | A2Foreground는 강·부조 조립 후 실행. 바깥 Hollow거목 (31,-84), scale(.75,1.15,.75),yaw-25/lift-.2. 스캔목질 (36.7,-81.5),scale(2.2,2,1.4),yaw-20/lift-.25 후+Y2.2; (33.4,-81),scale(1.75,1.7,1.4),yaw62/lift-.25 후+Y1. 전체렌더bounds.maxZ가 -80.05보다 크면 prefab 전체를 뒤로 이동. 실제거목maxZ-80.17403/목질2개각-80.05/플레이영역침범0 |
| 전경 수염 | 각 목질 localX -1.2/-.2/.8의 실제 읽기정점 중 world normal.y>=.25, score=dx²+dz²-.05×worldY 최솟값에 상단 부착. Hanging_Moss scale(.55,.7,.5),yaw목질+90,상단bounds중심=hit-Y.02,tint(.65,.62,.48). 부착후maxZ>-80.05이면 그 이끼 제외. 실제6개모두경계밖/maxZ -82.73594,-81.94946,-81.18107,-81.338,-82.84054,-84.42946. 주거목24+다리10+전경6=40그룹 |
| 실제 Editor 확인 | Runtime MVID53fe7d57-19a6-450a-8dbb-dbda21e731c3/오류0. foreground-surface-moss 실제자동RT1920×1080·동크기/1x 보존. 전경 목질·접합은 후보 RETOUCH, 전체 FAIL. D3D12 Editor 반사 폴백을 최종 D3D11 반영 증거로 쓰지 않음 |
| 물가 시험 제외 | 동일 스캔목질7개를 지면/수면에 맞춘 Editor 시험 shore-scan-timber-first.png은 가늘게 잠긴 가지처럼 보여 큰형태 개선 FAIL. 소스에 채택0/새빌드에 포함0. 카메라28도 임시 변경은 기존LateUpdate가34도로 복원해 유효 후보 촬영이 아니며 카메라 변경0 |
| 보스 겹침 방지 | 자연전투 입력의 목표 보스거리400Core단위(기존일반전투 기본300 유지), 가시성 최소거리260. 실제영웅 활성 SkinnedMeshRenderer bounds합집합(누락시playerView.bounds)과 druidBody.Bounds의8꼭짓점을 카메라 투영. 영웅 Rect 사방.01 확장 후 Overlaps=false가 필수. 03선택과최종passed에 heroBossSeparated 추가/영수증 기록. 적·탄·Core·AI패턴·강제보스포즈 변경0. 새실제Player 미검증 |
| 남은 필수 게이트 | 새소스 빌드/동일빌드 정상종료M1/최종Player3장/원화·PoE2·노레위6장 동크기·1x/전체시각판정/통합담당인수/unity main/일반Desktop. HID제품명조회 종료대기는 별도 미해결. 새덤프·취소실험·장치·권한·입력backend 변경0 |

## 2026-10-31 08:08 KST 높은 스캔 뿌리 제작 후보

| 항목 | 현재 계약·미검증 경계 |
|---|---|
| 방법 변경 | 가늘게 잠긴 물가목질 시험 미채택. 원본 root_cluster_01 스캔을 다시 제작해 낮은 부조의 평평한 큰형태를 수정하는 후보. 제작과 정적2장 RETOUCH/게임 PASS 아님 |
| 제작 | 동일 CC0 원본·원본 UV/원본3맵 유지. decimate .16/18181정점·36040삼각형. 국소바닥반경 .24→.8m/바닥분위 .10→.05, 부조 상한 .36→1.1m, 실제높이 .986387312m. 기하높이=국소돌출높이+원본양수높이×.015, 경계 .45m smoothstep/경계높이0. vertex R=경계완화×smoothstep(.035,.215,돌출높이), G=경계완화/B=돌출높이÷1.1. 원본면연속보존/UV재베이크0 |
| 새 자산 | Art/map/a2/raisedroots/Models/A2_Raised_Root_Cluster.fbx. 기존 rootrelief 재질·3사진 재사용/새사진0. exact 임포터 8개·GetVersion3 유지/읽기1 |
| 적용 범위 | A2RootRelief의 첫4개 주거목 고정좌표·scale·yaw는 유지하고 높은 메시만 선택. 물가의 기존 낮은부조10개 보존. 높은 메시 누락은 오류+기존낮은부조 폴백. 기존 per-vertex GroundY/수면bed-.18/Collider0 유지 |
| 검수 경계 | 정적2장 뿌리실루엣 개선 확인. 게임 접합·중앙 통로·그림자·Player·M1 미검증. 전체 VISUAL VERDICT: FAIL 유지. 현재검수중인 edeac86cc 바이너리에는 이 후보 포함0 |

## 2026-10-31 08:12 KST 실행 메모리 차단과 후보 보존

| 항목 | 새 증거·현재 상태 |
|---|---|
| 마지막 실제 빌드 | edeac86cc6fc8ad6b8177543456caaabeb20fa58 입력/cec13920 오류0/100604ms/3803100766B. MCP파일·ASCII참조0/212파일160DLL. EXE SHA9806abde4a406ed68647e9505852c49f6aa72a372f4f084e2aa2821affea57a2, Runtime68e5e790acbcb383a215500260bdfe87c554c1a74916c31bf6fb742f4240a529, Core9242c48064da01340a1e6eff2ffaf0f696674a90ceedad8faa0187c5fcc404f4 |
| 같은 빌드 M1 | dac59de0 내용23/23·32PNG/106442ms timeout·exit-1·ok=false. 창0/세이브0/공식잔여0/hiddenDesktopClosed=true. 실제 정상종료 FAIL. 아직 이 빌드의 최종3장 촬영 전 |
| 공식 무창 비교 | exo-unity -Desktop batch는 GPU유지/-batchmode 추가만이며 -nographics 금지. 동일binary의 비교 호출은 커밋 여유9.3~9.8GB<필수10GB라 Player 자식0/미실행. 기준완화0. 자기 대기PS54728/부모37484/생성23:06:22.474593UTC/정확스크립트/자식0/잠금0/여유9.714710GB 재확인 후23:09:47 회수. 공식M1영수증0/성공처리0 |
| 메모리 읽기 진단 | 23:08:02.870670UTC 시스템commit93675835392/103910297600B/물리여유11633MB. 자기A2 종료대기7개 PID58420,40420,55600,55824,60216,56412,55128는 각스레드1/HasExited=true이나 PrivateBytes2907127808,2974109696,4474871808,3025747968,4498862080,3122757632,4551380992 보유. HasExited만으로 자원정상반환이라 하지않음. 새Player10GB/기존Library Editor12GB 조건 둘다차단 |
| 보존·중단 경계 | 종료대기 Unity·타인프로세스 추가kill/새취소/덤프/장치·권한·입력backend·메모리기준 변경0. 미시작 자기대기PS만회수. 사용자에게 키보드·마우스/USB허브·패드·앰프 목록을 메모리차단근거와함께질문. 외부상태변화전 새GPU실행 쌓지않음 |
| 높은 뿌리 검증 | 2장 정적 직접판정 RETOUCH/Blender traceback0·기하경계높이0·UV/유한값검사완료. 현재소스 독립Core/C#0/0. 새Unity import·실제Player접합·M1·시각비교 미검증. 이 후보를 edeac86cc 실행결과로 소급검증하지않음 |
| 품질·반영 | 전체 VISUAL VERDICT: FAIL/미완료. A2 common인수·일반Desktop갱신0. 실제3장·정상M1·큰형태/원근/수면 교정이 남음. 자기원격 후보보존만 진행 |

## 2026-10-31 08:25 KST 조용모드 취소와 높은 뿌리 보행면 진단

| 항목 | 현재 근거·계약 |
|---|---|
| 정책 | 최신 직접지시·NIGHT_ROSTER 마지막 정정 적용/quietMode 취소·Normal. 자기CLI52364/조회도구 Normal 확인. 무음·숨김·단일Unity·공식잠금·기존 메모리기준·08:34 신규단위 마감 보존. 신규writer·CLI·작업본·중복배정0/중앙설정변경0. 영웅씬 원본byte미확보 보존FAIL은 해소된것으로세지않음 |
| 독립 재개 | 현재commit여유9.45GiB로 새Player10/Editor12GiB 미달. 같은빌드/M1반복0. 기존높은뿌리의 새위험진단만실행: Blender58932 Normal/readback/렌더0/exit0/traceback0/표본54221(정점18181+면중심36040). 실제A2ForestLayout 소스를직접링크한CPU진단/경계소스SHAeb531bb10ec3b5bf6251326091bbd55877c2c410f5d5164224a8937421cb4934 |
| 발견 | 기존바운드중심배치의 마른열린지면 돌출최대1.2993745u, 제작밑동앵커배치는일부최대1.3699409u로 악화. 축부호는Unity실제import전±둘다보수적으로검사. 앵커대안채택0. SourceMap의다른충돌·실제배우가림까지증명한검사아님 |
| 높이교정 후보 | 새A2RootHeightProfile.Height를높은4개에만적용. 기존바운드중심/좌표/scale/yaw/낮은10개 유지. radius순서2.6/2/1.8/1.9u는기존주거목차단반경. d=지면XZ에서주거목중심까지거리, t=clamp01((d-(radius-.7))/.7), 새높이=원본돌출높이×(1-.85×t²×(3-2t)). 반경안쪽.7u부터부드럽게감소/경계와밖15% 유지. 지면bed/수면bed-.18/원본UV·재질가중·면연속보존. Collider·Core·충돌반경변경0 |
| 검증 경계 | 실제새높이함수와실제A2ForestLayout 직접호출비교를진행. 축/실제게임기하·삼각형사이표면·카메라가림·품질PASS대체아님. C#·새Editor/Player·정상M1 미완료. 전체 VISUAL VERDICT: FAIL 유지 |

### 08:27 KST 실제 새 높이함수 진단 결과

| 항목 | 결과·한계 |
|---|---|
| 직접 함수 결과 | 현재 A2RootHeightProfile와 A2ForestLayout 직접호출, 원본정점18181+면중심36040=54221표본×4주거목×축부호±. 기존바운드중심+높이완화의 열린마른지면 최대돌출 0.19490615u/35cm초과0. 차단반경 경계±.001u·사방향32대조 불일치0 |
| 동일 입력 구분 | 앵커대안은최대1.3699409u로미채택. 바운드중심의기존1.2993745u를새함수로낮춘정적진단이며 실제Unity FBX축/삼각형사이연속표면/배우가림·카메라·아트PASS근거아님 |
| 컴파일·보존 | 변경후현재소스 독립Core/C#0/0. 소스SHA는 I:root-patch-relief-r2/보행면-최종입력.json. 실제Editor/Player·정상M1 미완료. 마지막실제빌드는edeac86cc/이소스소급0. 전체 VISUAL VERDICT: FAIL 유지 |
| 운영 정정 | 과거Idle설정도구는 취소영수증이존재하면 재실행0으로막음. 정책취소를다시재개하거나이전제한을복구하지않음. 신규writer·CLI·작업본·중복GPU/검수0/무음·숨김유지 |

## 2026-10-31 08:32 KST 종료 안전 게이트와 원본 삼각형 진단

| 항목 | 실제 근거·현재 경계 |
|---|---|
| 안전 인수 | 사용자 직접05:16KST 관측 PID43348/5272/31104의 CIM잔여·threads1/handles2101·2105·2101 및 동일종료실패2/force-gfx-direct한정진단exit1을 인수. 정상M1 def19879 23/23·프레임passed는종료안전FAIL과별도/맵후보 소급0 |
| 신규 PC 실행 금지 | 세Player 잔여와실제종료안전이해소된 새직접근거 전 Unity/Player/정식빌드/선예약/같은입력재검/종료진단반복0. 메모리회복·잠금반환·HasExited=true만으로해제0. 자기resume-tools 호출에 로컬 active차단 적용/공식자기정상종료·반환만예외. 타인자원·공용실행기·root·watchdog·CLI재시작·재부팅·드라이버·환경조작0 |
| 기존 범위 지속 | Normal·무음/숨김·08:34신규단위마감 유지. 기존r2높이후보의 비Unity파일진단만수행/새후보·모델·게임실행·렌더·인코딩0. 08:28 Blender실행관측으로 새렌더겹치지않음. 사용자질문·담당자간동일안전정보재전송0. 사용자확정 오디오공통b9491cf58·기존Desktop 유효/새맵 공통인수0 |
| FBX 직접 추출 | 현재소스 d3e0c6c55d15734fd9cf499601aa5adb30385947의 raisedroots 원본FBX. 설치Blender의공식읽기parser를별도 bpy없는Python에서사용/원본모듈·FBX변경0/Blender프로세스0/렌더0. FBX7400/18181정점·36040삼각형. 기존높이표본의 원본정점순서·위치대조최대오차0/추정triangulation0. FBX SHA256 c008111139ad41bbb88c390d08cd8961bd5ef74caa0301ee3b58bccb0d402a43 |
| 실제 면 보간 | 실제 A2RootHeightProfile를정점에적용한뒤 원본삼각형의 바깥정점·차단원교차변·삼각형내원호극점으로차단원밖 최대선형높이를직접평가. 기하fixture3. 거목4개각36040면, 최대0.1981571742/.1596270949/.1541398615/.1600661274u. 각수치여유.0001포함최대 0.19825717422966843u/35cm초과삼각형0. 원형영역은평면회전·수평축부호불변 |
| 소스·한계 | 높이함수 SHA256 55a62bcbc423246dde8474908f585ce29aca34b177d05b5c3f3920f07a73d05b. 정점별bed의선형보간을뺀높이진단이며 실제지형곡률·Unity FBX import·배우가림·카메라·실제게임·정상종료·최종시각PASS는미검증. 이전.19490615는정점/면중심표본최대이며 이번면보간상한과구분. 현재게임코드변경0/새독립후보상한추가0 |
| 품질 | 전체 VISUAL VERDICT: FAIL 유지. 맵 최종3장/M1은 종료안전게이트대기. 기존모델FAIL2·영웅원본byte보존FAIL·종료FAIL카운터유지. 새실행·새검증완료로승격0 |


## 2026-10-31 09:19:41 KST 재개 확인과 Meshy 거목 입력 검수

| 항목 | 현재 직접 근거·경계 |
|---|---|
| 소스 보존 | 재개 HEAD4be1de16f69b84eddb6bb6262accec1220fe209f/INDEX빈상태/WORK기존guard만. fetch후공통0ced574ef·숲브랜치4c2797c7 확인. 게임코드·에셋변경0 |
| 실행 경계 | CTO_STATE의 사용자09:00:39KST재부팅·잔여0/메모리회복 기록과 이번 CIM의Unity/Player0 확인. 정상Quit수정은미확인. 기존 종료안전-신규실행금지.json active유지/신규Unity·Player·빌드·예약0. 재부팅후동일binary 한정1회 허용여부질문은답변대기 |
| 유료 승인·비용 | COMMON_RULES 마지막10-31승인: Meshy+ludo 합계500cr. A2 자체2건 확정35cr(30+5), 생성전SPEND_LOG예약/작업ID연결·성공비용대체기록. 타인영웅35cr예약과구분/잔액·리셋조회/추가지출0 |
| 1차 FAIL | 7.1/PBR4k, 작업01a18f4e-6905-75ff-b5fd-9474de181d46. 승인원화알파크롭. 실제폭1.902916·두께.041771·높이1.832239/22132정점·28769tri. 정면·측면직접확인: 입체거목이아닌판. Blender4방향/exit0·traceback0. Unity인수0 |
| 2차 FAIL | 원화사각크롭/t2.5 SmartTopology 무텍스처, 작업01a18f50-feaa-7358-b7fc-efac03da68a8. 실제범위.951172/.940430/.860352·16155정점·29999tri·604연결그룹. 정면·측면·후면직접확인: 주변이끼·배경이기둥/막/바닥판으로묶인큰형태결함. Blender4방향/exit0·traceback0. Unity인수0 |
| 중단·다음 입력 | 같은거목2후보FAIL/추가생성0. 깨끗한전체거목정면·측면입력또는검증된실제스캔원형이필요. 생성원본·PBR·Blender·해시·원화대조를 I:/EXODUSER-Storage/steam-keyshot/a2/meshy-hollow 에보존. 신규GPU검수·전체시각PASS·common·Desktop으로승격0 |
