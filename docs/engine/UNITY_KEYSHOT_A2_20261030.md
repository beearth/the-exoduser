# CH1-1 승인 A2 장면 — 제작 후보

사용자 승인 기준 `G:/exoduser/tmp/design-review/20261030_keyframe/APPROVED_1-1_keyframe_A2_woodbridge.png`를 직접 확인했다. 큰 거목·대각선 다리·오른쪽 독액 강·다층 안개·횃불/영웅 초점이 목표다. **현재 실게임 시각 미검증, 완료/채택 후보 아님.** 산출물은 I:/EXODUSER-Storage/steam-keyshot/a2/다.

| 항목 | 현재 코드·입력 계약 |
|---|---|
| 선행 통합 | 숲4c2797c7f + 공통642e31d2e → e82431e0d. 충돌은 기동 분기·양쪽 문서 보존, 공통 카메라·입력 수정 유지 |
| 활성화 | --remodel3d --unity-a2-forest에서만 조립. 일반 실행 채택0 |
| 자산 | R3 sourceb9ffca060의17FBX·종속재질/텍스처185파일만 Resources/Art/map/a2/r3에 동일byte 인수. R3 정적RETOUCH 유지, R4 HOLD 인수0. r1 Foam_Bank만 거품 보조로 재사용 |
| 큰 질량 | 주간4·고목3·후경거목3층×5·먼카드2. R3 거목단위.45/고목.8, 전경목질2·그루터기1. 주간4접합에 추가 이끼/덤불/낙엽 각5. 실제 가림·반복·보행 미검증 |
| 다리 | 중심(43.2,-71.8)u/yaw+24°/scale(1,.55,1)×.75, R3 원본길이11.616874u. 원본 지형·충돌 유지, 발 접지·동선 미검증 |
| 카메라 구도 | 공통pitch48.7014126°/distance14u/FOV46.9453°/lookAhead1.45u 유지. A2만 시선표적X+2.4u로 영웅을 화면왼쪽 약39%에 두고 오른쪽강 시야 확보. 실제현재화면 미검증, 논리카메라/조준 불변 |
| 독액 | A2ToxicRiver: linear RGB(.075,.080,.023), 거품(.22,.24,.10), emission.012. 저주파 사인속도.12/.08, 법선.035/.025, smoothness.62→거품.16. 접촉깊이.025~.28u. 반영·GPU 표현은 미검증 |
| 접촉 거품 깊이 | 기존 URP_PC_High/Mac_Balanced의 m_RequireDepthTexture=0 확인. A2 카메라에 requiresDepthTexture=true, 수면은 Transparent 큐/ZWrite On/alpha1로 불투명 지형 깊이 복사 후 샘플. 실제 거품 표현 미검증 |
| 수로 | 기존 River_/Pool_ 재질 교체 + 비보행 외곽 z−94~−30u/81행/.8u/폭20u. x48~95u/.2u 간격, z±.4u/.2u 간격5행의 마지막 보행점(CanMove반경0) 합집합 뒤+.6u. 수위=GroundY(50.8,−72)−.35 일정. 강가암반9·말뚝5. 실제 수면 접합/높이 미검증 |
| 반영 | Realtime ReflectionProbe/OnAwake/256²×6면·위치(50,GroundY(50,−72)+1,−72)/크기100×50×100u/boxProjection/강도.55/far150u. 실제 GPU 반영 미검증 |
| 횃불 | R3 Bridge_Torch_Holder×.5·8프레임 불꽃/높이1.02u, 위치(40.8,-75.4)/(45.4,-68.2)u. RGB(1,.55,.19)/강도7/반경5u/soft shadow |
| 분위기 | 배경/안개(.085,.115,.14), 밀도.028/far240u. 국소 달빛기둥3개/alpha.065/깊이·가장자리 감쇠. 그림자 적분 볼류메트릭이 아닌 메시 연출, 랜덤 노이즈0 |
| 임포트 | SourceTextureImporter v3. 기존 keyshot2 진단의 정확7종PBR은 Repeat/mipmap/Trilinear/aniso8/normal·linear. A2는 같은 색공간과Clamp. 공통UI분기 보존 |
| 기존 바닥 셰이더 | 작업 시작부터 실제 사용 중인 HellGroundPBR.shader가 미추적이고 .meta만 Git에 있음을 확인. 해당 원본 byte를 보존해 필수 런타임 소스로 함께 체크포인트하며 새 시각합격으로 세지 않음 |
| A2 바닥 | HellGroundPBR._ForestBlend 기본0/A2만1. 기존CC0 토양·돌만 사용. forest=lerp(soil×.9,stone×.6,.28+.2×sweep)×RGB(.75,.65,.48), 표면normal=돌normal, smoothness=.36−.16×rough. 기존skin/비A2 경로와 Core·충돌 불변. 실제 현재 바닥 시각 미검증 |
| 검은 무늬 | A2에서 이름이 Decals_blood로 시작하는 기존 메시 렌더러만 비활성. 이전 분리진단의 원인 수정이며 원본/충돌 불변 |
| 촬영 | --unity-steam-keyshot+A2는 영상Open 없는 기존NativeGame fixture. batch GPU 월드RT1920×1080/HUD제외. 스크립트입력·생존보조·실제AI, 적/탄 직접주입0. 일반입장/손조작/HUD 검수와 구분 |
| 영웅 크기 | R5가 있으면 실제 SkinnedMeshRenderer.BakeMesh 정점 투영으로 측정. 숨긴2D스프라이트 높이를 실제전사 크기로 인용하지 않음. 원래8~11% 촬영검사 유지 |
| 보행 교차 회귀 | 현재 A2ShoreX 원문을 추출·컴파일하고 실제 SourceMap/현재 ch1_map으로 수면 삼각형 행사이를 보간해32421점/반경15px 질의. 수정전3982겹침 FAIL→수정후0, 출발점/다리중심 보행true. Core/맵데이터 변경0. 근거 I:/EXODUSER-Storage/steam-keyshot/a2/shore-check/ |
| 종료 | 미디어닫기·효과음정리·1초배출. 보스1100tick 제한 마지막 촬영 분기1099로 교정 |
| 검증 | 독립C#오류0. Unity컴파일·GPU·실제1080p/1x·M1·공통/바로가기 전부 미검증/미실행. 시작guard WIP byte보존, 사용자창/세이브 미조작, 구매/크레딧0 |

## MAP PRODUCTION REPORT

| 항목 | 현재 범위와 잔여 |
|---|---|
| STAGE / MASTER | CH1-1 부분 키샷. 기존6시시작/12시진행·Core 불변. 원화의 거목·다리·강 구도 목표 |
| OUTER MASS | LEFT/MID주간·RIGHT수로/거목·TOP3층숲·SOUTH낮은고목. 검은구멍·연속·반복은 실제카메라 미검증 |
| LARGE / MEDIUM | R3 스캔 거목/고목·전경목질과 이끼/균류/덤불 연결. R4 HOLD 사용0. R3 정적RETOUCH를 실게임PASS로 올리지 않음 |
| GROUND | 원본높이맵 메시 경로 유지. 다리발접지·나무밑동·수로경계 겹침 미검증 |
| PLAYABLE | 전투면·회피·적·탄규칙 불변. 수직질량 가림·집단전투 가독성 검수 필수 |
| LANDMARK | 다리와두횃불. 전체맵·보스리모델 완료 아님 |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 현재후보 실제화면 전부미검증 |
| TECH QA | 독립C#0오류. Unity/GPU/route/collision/seam/loading/performance/M1 미실행 |
| FILES / GIT | 자기A2코드/셰이더/r1런타임/임포터·촬영/관련docs만. 공용WIP보존. 원격·채택 상태는 I:영수증 기준 |
| VISUAL VERDICT | 미검증 |
| NEXT PASS | 사용자 실행창 종료 허용/직접종료 뒤 공용실행기로 실제1920·1x·같은장소전투·원화비교→큰결함수정→같은후보M1→영수증/정상통합/바로가기 |

## 2026-10-31 재개
최신 공통 a861d0303의 진입 흐름·UI·전사 R5를 정상 병합했다. 기동 충돌은 공통의 일반 진입/명시적 빠른시작을 보존하고 A2 촬영 fixture 조건만 병존시켰다. 이번 소스의 GPU/시각/M1은 아직 미검증이다. PowerShell 호스트 시작 오류5는 CMD와 Node의 숨김 자식 PowerShell 경로로 작업을 계속했으며 전역 설정 변경0이다.
