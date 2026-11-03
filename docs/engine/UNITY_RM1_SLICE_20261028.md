# Unity RM-1 슬라이스 (1-1 R1 START ~ R2) 구현 현황 — 2026-10-28

## 2026-11-03 11:40 재개 — 병합본 GB1a 구도 확인판

맵 소스 a5c287157을 포함한 병합 HEAD64253d64d에서 재빌드한다. 10:41 결정대로 전체 GB1 연결판은 보류한다. `Map25DBuilder.BuildGB1Nav` 새 지형의 Core/Nav 차이는 24/0이며 6개 높이 근사점을 제외한 값이다. 이 검사를 통과했다고 처리하지 않는다.

| GB1a 계약 | 적용·증거 범위 |
|---|---|
| 기존 걷기 | active-presentation=GB1a. 새 MapData 어댑터·ResetRun·새 Nav 설치를 실행하지 않는다. 원본40000타일 동일 여부를 Player에서 기록. 원본 환경 그림 renderer만 제거, Core 충돌·스폰·판정 코드 수정0 |
| 구도 지형 | 승인 plan_v2 고정. 210×210m 범위, 높이513². G1 양쪽 늪·G2 남쪽 폭 변화·G3 외곽 숲·G4 동쪽 고리 덩어리를 회색 기하로 확인. 걷기/회색 지형 일치 완성본은 아님 |
| 어긋남 | 기존 충돌을 포함한 타일중심 검사: 공통10678, 기존 걷기 중 새 길 바깥8860, 새 길 중 기존 Core 차단1369. 좌표 전체는 composition/gb1a-walk-vs-geometry.json. 대표01~07점 접근 가능은 전 경로 일치와 구분 |
| 접지 | 아래 레이캐스트·4cm 묻음·경사15° 제한·발밑 AO. 메시 bounds 하단/등록 액터 발과 실제 지형·데크 콜라이더의 양의 틈3cm 또는 투영 틈2px 초과를 실패로 기록. 이미지 알파 빈틈 자동분할 검사는 아님. 최종 화면 직접 검수와 함께 보고 |
| 실제 이동 검증 | 새 패키지 제품 로비→1-1→캠프→A2→북안→캠프 복귀. 기존 Core StepInput만 사용, 좌표 배정·충돌 우회0. 영상1은 시작→캠프 중 첫10초, 영상2는 캠프→북안 연속 촬영 중 마지막10초(도착 정지 짧게 포함). 영상2 중간 PNG/해상도 변경 없이 완료 후 컷을 찍음. 전체 여행을10초에 완료했다는 뜻이 아님 |
| 시각 fixture | 별도 고정 카메라 구간1920/3840 촬영은 구도 검토용 좌표 fixture로 표시. 실제 도보 캡처와 분리. C10은 기존 패키지·기존 내장 배치에서 카메라 좌표만 바꾼 비교 촬영 |
| 채택 | 바로가기는 맵 총괄 판정 전 교체하지 않음. 영웅=리마스터 후보(미승인), 기존 액터 합성 변경0. 빌드 성공·play-smoke 성공과 시각 PASS는 별도 |

병합 호환: GB1Grounded는 별도 MonoScript 파일로 저장해 프리팹 스크립트 참조를 유지한다. GB1a 표시 중 NativeRemodel3D의 기존 A2 높이 우선 선택만 끄고 새 Terrain 높이를 사용하며 로비에서는 원래 값을 복원한다(공통 소스·Core 수정0). 정지 촬영 fixture만 AutomatedInput=true로 직접 진입한다. 실제 smoke는 false를 유지하고 새 비동기 로비 전환·캐릭터 생성 단계·로비 복귀·재시도의 완료를 각각 기다린다.

아래 GB1 절은 연결판의 제작 이력이며 GB1a 완료 판정이 아니다.

## 2026-11-03 GB1 — 승인 PLAN V2 전체 회색 박스 (연결 보류)

평면도는 `I:/EXODUSER-Storage/map25d/composition/plan_v2.json` 조건부 PASS본을 고정했다. C17 수정 중단 뒤 GB1로 전환했다. 이전 C17 빌드·검증 프로세스는 종료하거나 변경하지 않았다. GB1은 kit1103·손그림 소품을 장면에 사용하지 않으며 회색 지형·기둥·다리·약한 색 구분만 만든다.

| 계약 | 구현·검증 범위 |
|---|---|
| Core 입력 | 새 MapData는 Remodel/Resources/Map25D/GB1/gb1-map.json. 원본 SourceMap JSON·Core 소스 변경0. NativeGame.Map25D.Graybox의 AfterSceneLoad 어댑터가 로비 진입 전에 기존 A2FieldLayout.CreateMap(MapData)와 기존 ResetRun을 호출. ResetRun이 CanMove·LineOfSight·ProjectileBlocked·Stage.InitializeField·소환굴/지역 초기화에 새 입력을 연결. 반사·Core 패치·좌표 순간이동0. 정적 컴파일 PASS, 실제 Player 확인은 빌드 뒤 |
| 데이터 보존 | 200×200/타일40px, 시작4020/7420. 게이트·출구6칸·콜라이더19·hill 계약 유지. 기준점43·4지역·소환굴14/계획168·필드보스4 유지. 초기 적16은 실제 C1702 표본. 새 걷기 데이터만 제안으로 공급 |
| 표면 | 범위210×210m/원점−65,−145, 높이513²(초기1025² 계산 중단 후 최적화). 길0~1.1m, 둑3~6m, 물−1.6m. 북향 목교4.8m 폭·데크+.55m는 승인 척추와 동일한 곡선을 사용. Core/Nav 실제 표면 검사24/0 잔여로 연결 보류 |
| G1~G4 | 다리 동쪽 늪 확장(보행 영역은 보호), 남쪽 척추/동쪽 고리에 교대 둑·고목·바위 회색 덩어리, 32:9 외곽210m 숲. 실제 화면 판정 전 |
| P0 접지 | 지형·데크는 query용 레이어28 콜라이더. Core 판정에는 쓰지 않음. 회색 물체는 아래 레이캐스트 후4cm 묻음, 바위·고목 root 기울기 최대15°. 발밑 AO. 다리는 설계된 지지 span·물은 설계 수면으로 분리. 메시 bounds 하단/등록 액터 발의 양의 틈>3cm 또는 투영 틈>2px를 FAIL 목록으로 기록 |
| 카드 계약 | GB1 환경 카드는0. inherited round4 reprojector도 지형 ray/height sample−.04m·불투명 최저 row 피벗·Y축 원통 빌보드로 수정. 액터 합성 셰이더·아틀라스·정수 배율은 변경하지 않음 |
| 플레이 증거 | 실제 제품 로비65초 회귀 검사→1-1 도보→캠프→A2→북안→뿌리길→밀집 공터→관문. 1920 구간8장·3840 네 곳·접지 JSON·자연 Core 전투 FPS. 영상1은 시작→캠프 전체 경로 중 첫 연속10초, 영상2는 실제 캠프→다리 건너 raw11초의 마지막10초(배속0). 전체 이동을10초에 완료했다고 주장하지 않음 |

바로가기 교체는 맵 총괄 판정 뒤에만 한다. GB1_STATUS.md에 최신 실행 상태를 기록한다. 기술 검사와 시각 구도 판정을 구분한다.

## 2026-11-03 09:45 추가 인수 — C17 제작 계약 (새 패키지 검증 전)

| 항목 | 현재 제작값·경계 |
|---|---|
| 액터 레인 경계 | R4PixelActor 셰이더·색 합성 유지. 아래09:10 영웅 크기 실험은 폐기하고 C1701 승인된 reference3/1080·리마스터 조건부 짝수 정수배로 복원. Point·divisor1·virtual PPU200·A64 등록 유지. 원본 atlas 수정0, remaster 기본OFF |
| 접지 계약 | Map25DContactShadows 실행순서25000: NativeHd2D가 산출한 foot=contact−up×.018u를 보존. 그림자만 up.009u+달빛 진행방향XZ×.12u로 이동. 폭=clamp(기존폭×.72,.30,1.35)u, 길이=폭×.43, 기존 opacity×1.45. R4PixelActors는 보존한 foot을 조회하며 이동한 그림자로부터 actor 위치를 역산하지 않음. 영웅·적 동일, Core 위치 변경0 |
| 빌더 저장 | ContactQuad처럼 이미 저장된 공유 메시를 새 Mesh_N 경로에 직접 다시 저장하지 않음. MeshObject 진입에서 persistent mesh만 복제 후 저장. 첫 시도51e05072는 이 오류로 패키지 생성 전에 실패했으며 같은 경로로 재검증 |
| 독액·둑 | 수면−.35u(지면0), planar 반사 기준 동기화. 탁한 녹갈색·반사 Fresnel.06+.14. 레인B kit1103 원본 읽기/FBX·BaseColor·Normal24종 byte 복사, JSON52배치(뿌리둑5·바위12·고목6·그루터기6·식생23). 둑Y배율.42·lift−.25u. Collider0 |
| 검은 쐐기·입체 줄기 | 모델 일부 삼각형을 임의 삭제하던 경로 제거, 닫힌 RF3 메시 보존. FBX 원래 축 회전·scale에 JSON yaw/배율을 곱함. 원본 모델 변경0 |
| 노란 원 | 실제 C1701 Renderer 위치(1385.7,579.1), 이름web_20/type m_fyellow를 확인. 장식 카드1개 제거, Core 위험 장판 변경0 |
| 다리 | 동일3×10u 안34판재, 두께.12u/상단.025u, 하부보.18u. 면별 실제 metre×.65 UV, 환경 Trilinear+mip. 타일/대각 triplanar 경로 폐기 |
| 바닥·조명 | Soil/Litter/Mud3원화 레이어. 연속 저주파 macro UV warp·회전·19u 대형 soil 혼합/색변형, 디더·점 생성0. 차가운 달빛1.45(이전1.05), Neutral exposure1.3, 캠프 range8/intensity7.68 유지 |
| 성능 계약 | 실제 로비→도보 도착 이후3840×1080·5120×1440 각각10초 Core 기본공격/자연 스폰. 무적 갱신 fixture, 적 주입0. 평균/P50/P95·main/render/GPU valid·draw/triangle·유일 적수 기록. 밀집 화면18개 이상/60fps 게이트는 실제 결과로 판정 |

## 2026-11-03 09:10 지시 인수 — C17 재개 (새 패키지 검증 전)

I: 접근 복구 후 HEAD1403c5ee6·codex/unity-map25d-20261102·빈 INDEX를 재확인했다. 명령은 시스템 Windows PowerShell5.1 `powershell.exe -NoProfile -Command`로 실행하고 Unity는 공용 `I:/EXODUSER-Storage/unity-jobs/bin/exo-unity.ps1` slots3만 사용한다. 타 작업 Editor/Player는 종료하지 않는다. 아래7시 기록은 이전 중단 이력이다.

| 항목 | 재개 C17 변경·검증 계약 |
|---|---|
| 32:9 지형 | 기존96×96u/원점−8,−88에서208×192u/원점−64,−128로 확장. JSON terrainBounds,513² 높이/512² 레이어·4096² 연속 곡선 mask,4×4×128² 메시. Core 걷기 칸/충돌 불변. 1920×1080·3840×1080·5120×1440 실제 Player 확인 |
| 외곽 질량 | Core 밖에 명시 JSON 좌표18개 기존 RF3 거목 추가. 경계선 일렬 배치/랜덤 scatter0. 지형 높이에 발을 붙이고 개체별 실제 바닥 높이를 바람 뿌리 기준으로 설정 |
| 검은 다리 조각 | 잘려서 검은 홈통으로 보인 원래 bridge shell 복제를 제거. 같은 Core 승인3×10u/yaw135° 안에34개 완전한 판재와 밑 지지목만 구성. 상단.025u·Collider0. 전체 다리 표본/Core Nav0/0 재검사 |
| 청색 그림판 나무 | 원본 PNG는 보존. tree 카드 baked blue를48% 중성화 후1.13/1/.84 재질 배율과 실제 장면 광원 적용. 보이는 tree 카드 발에만 타원 접지 그림자. forest wall alpha는 네 가장자리 모두 곡선 feather |
| 영웅 크기 | 이 행의 reference2/무조건 짝수화 실험은09:45 액터 경계 지시로 회수했다. C1701의 reference3/1080p·리마스터 ON에서만 짝수 기준을 유지하며 새 합성 방식은 넣지 않는다. 원래 월드 Sprite·PPU·발 위치/virtual PPU200·A64 등록·Point·divisor1 유지. 정수 맞춤에 따른 flag OFF/ON 화면 크기 차이는 별도 리깅 레인 계약 검토 대상으로 남김 |
| 증명 | 실제 도보 도착 위치에서 Core tick/좌표를 바꾸지 않고1600·3840·5120 전투/적 없는 컷을 각각 저장. 가림 OFF/ON·원색·native 텍셀·한 면1텍셀 rim을 별도 검증 |
| 적 무더기 | 매 StepInput 후 ID 최초 출현 좌표·틱을 읽기만 하여 원래 Core 스폰과 도보 유인을 구분. body+부분 walk overlay는 원래 한 적의 레이어이므로 제거하거나 두 적으로 세지 않음. Core/스폰 수정0 |

중단 패키지 진단1702: 실제 도보131.48초·1829틱·4974.279px·오류0·도착. 같은 자리 clean 전후 틱1888/적132/좌표 동일. 원본 불투명1091텍셀 RGB 오차0. 현재 자세에서는 가림 ON/OFF 모두 오차0이므로 C16 회색 기둥의 원인을 가림으로 확정하지 않는다. 진입16→도착132,600px 안9개로 원래 Core의 경로 중 추가 생성도 존재한다. 새 추적 자료와 화면으로 재판정한다. 이 진단은 새 C17 패키지 채택 근거가 아니다.

## 2026-11-03 07:00 C17 최종 상태 — 실제 검증·제출 미완료

I:의 결과 읽기·기록 저장 요청이 07:00까지 반환되지 않았다. C17의7항목은 소스에 반영했고 소스 컴파일 및 빌더의 생성 자산 저장까지 확인했으나, 실제 패키지 빌드·play-smoke·proof-17·1920/3840 캡처·10초 영상·FPS·MapLint 결과는 미검증이다. 바로가기 교체0(C10 유지). C10 실행 파일도 I:에 있어 현재 정상 실행 재확인까지 완료한 것은 아니다.

자기 Editor38876·C17 빌드/검증 프로세스는 생성 시각 대조 후 종료 확인했다. 타인/C15 프로그램은 종료하지 않았다. 예약 파일 정리·자동 생성 파일 HEAD byte 복원·최종 Git diff는 I: 접근 복구 대기다. 커밋·stage·push·stash·reset·rebase·영구 삭제는 하지 않았다. G:의 `unity/Temp/map25d-tools/C17_REPORT_DRAFT.md`와 `C17_CURRENT_SOURCE_MANIFEST.json`에 임시 복구 기록을 보존했다. I: REPORT 갱신 완료나 최종 산출물 제출 완료로 간주하지 않는다.

현재 2026-11-03 06시 C17은 **I: 실행 자료 접근 지연으로 실제 빌드·Player 검증 대기**, 후보 바로가기 C10 유지다. 파일 끝의 `06:03 C17 실행 차단 상태`와 작업본 Temp의 `C17_REPORT_DRAFT.md`를 함께 본다. 05:25에 생성된4096 R8 곡선 마스크의 Core 중심 격자 검사에서는 다리 밖 물 위 걷기 중심0개를 확인했지만 실제 화면 PASS를 뜻하지 않는다.

06:40 자기 Editor38876·C17 빌드/검증 PowerShell35984/42640과 부모Node38424/44216을 생성 시각으로 식별해 중단 정리했다. .NET `HasExited=True`/부모Node 없음 및 두 도구 세션 exit1 확인. C15·타인 프로그램 종료0. 낡은 검증의 뒤늦은 자동 실행은 중단했으며, 예약 파일/HEAD byte 복원은 I: 접근 복구 전까지 미확인이다. 현재 C17 재시도는 실행하지 않았다.

## 2026-11-03 05:15 CTO — C17 일곱 항목 재작업 (실제 Player 검증 전)

C16은 맵 총괄 FAIL이며 후보 바로가기는 C10 그대로다. C16 제품 경로128.19초·1829틱·4974.28px·막힘0·오류0은 기능 증거만 보존한다. 아래는 C17 제작값이며 실제 합격으로 올리지 않는다.

| 항목 | 변경·검증 계약 |
|---|---|
| 곡선 물가 | Core 격자로 찍던 렌더 구멍을 폐기. world 좌표10개 bank curve, Catmull-Rom+저주파 Perlin(.18/.07u)로4096² R8 연속 signed-distance를 구움. 물가 wet band.60u. 실제 수면 메시 최소 범위보다 작은 ellipse radius.86 안에서만 구멍 생성. 목교 아래도 이 수면 범위와 교집합, width×.28/length×.43. Core 칸/충돌 변경0 |
| 바닥 칠 | SmoothStep(from,to,t)에 world 거리/좌표를 직접 넣던 잘못된 정규화를 수정. InverseLerp 후0~1 SmoothStep. 낙엽 최대.86→.45, path 폭1.1~3.8u/48~69u 구간 곡선 연결. alpha가 없는 원화 뿌리 부분은 soil로 채워 검은 구멍 색을 만들지 않음 |
| 검은 쐐기 | C16 실제 동일 패키지 진단 f144204a에서 shadow OFF에도 남음. 렌더 holes와 실제 수면 범위의 불일치를 우선 제거. C17 동일 진단으로 잔여 여부 판정. 원인 확정/제거 PASS는 실제 화면 뒤 기록 |
| 목교 | 원래 admitted 썩은 다리 형상/재질 유지, 잘려 나간 판재 사이에34개 평탄한 웹 재질 판재를 추가. 폭3u·길이10u·상단.025u, gap.012u. Collider0. 아래 지형 높이의 pixel/world 단위 오류도 수정 |
| 영웅 색 | 가림 경로를 기본 OFF로 하고 원본 RGBA×원래 tint로 그림. 적 world-depth는 유지. 같은 자리의 적 없는 카메라 컷에서 hero occlusion OFF→ON·depth mask를 저장하여 원인을 분리. 한 면1 native texel×.025 윤곽광은 유지, 원본색 진단에서는 이 광도 OFF. 전 둘레 edge lerp 없음 |
| 증명 | 실제 camp arrival 전투 PNG 보존. 같은 Core tick·동일 좌표에서 적/탄/그림자 등 비맵 렌더와 OnGUI만 뺀 Camera StandardRequest 컷을 별도 저장. Simulation.Enemies 제거/좌표 대입0. clean receipt에 틱·적 수·좌표 전후 기록. C14 실제 캠프 무적 컷과 C17 clean의 hero3x를 proof에 넣음 |
| 적 무더기 | 입장·실제 캠프 도착의 Core enemy ID/좌표/생존/이동거리/영웅600px 이내 수를 JSON으로 기록. 걷기 fixture는 무적600틱 갱신·공격false이므로 추적/생존 집결 가능. C10/C16 HUD 모두00:30~31에0/53, 새 sprite 표시는256px 원본1배로 C10 논리64px보다 크게 읽힘. 스폰/AI 코드·맵 데이터 불변. 웹 같은 시각 자연 플레이는 아직 미검증 |
| 밀도 | 기존 웹 원화16개 추가 손배치: 뿌리·독주머니·토템·고사리·고목. 36개 카드+기존 거목7개+RM1 덩어리. 랜덤 scatter0. 실제 빈 바닥 비율과 L1/L1b/L4는 별도 검수 |
| 캠프 광원 | C10의 camp_glow_0(radius340/energy1.5) 복구. 주 불빛 radius650→800px·energy2→3.2(실제×2.4), 중심1860/4080. 화면 텐트의 fire pit 위치에0.64×.90u 연속 emissive flame, point particle/새 유료 원화0. C10과 실제 도착 컷 비교 |

## 2026-11-03 05:00 CTO — C16 영웅 후보 한정 예외 (빌드 검증 전)

이 절이 아래 03:40 사용 금지와 04:54 rim 초안을 대체한다. 제품 채택이 아닌 맵 후보 검토용이다. C15 검증 대기는 중단하지 않았다.

| 항목 | C16 계약 |
|---|---|
| 플래그 | `--map25d-hero-remaster`, 기본 OFF. 이 맵 표현층의 영웅 overlay만 바꿈. 일반 제품/적/애니메이션/Core/원래 SpriteRenderer는 그대로 |
| 원화 | sprites-11의 r15 8방향 기본21셀 PNG와 r13 강타 atlas를 읽기 전용 원본에서 `Remodel/CH1_1_25D/Resources/Map25D/HeroRemaster/`로 동일 byte 복사. 총9장. r15가 r11 대기/r10 보행/r13 기본 강타 호환 셀을 재패킹한 패키지. 별도 r14 피격은 미바인딩 유지. dash 등 미제공 atlas는 원본 그대로 |
| 세계·발선 | 원래 Sprite/PPU100/월드 크기·투영 발 위치는 바꾸지 않는다. overlay의2배 텍셀은 가상 PPU200으로 대응. 원본240셀 A64 하단을 대조하여23셀의 차이(정수 candidate texel)를 draw 발 등록 offset으로 보정. 원본/복사 PNG 편집0 |
| 정수 출력 한계 | C14 원본48px×3 출력은2배96px 원화에서1.5배가 되어 native 텍셀 폭이 불균일해진다. C16 opt-in은 원래 목표 배율을 가까운 짝수로 양자화하고2배 텍셀을 그 절반의 정수 배율로 출력한다. 900/1080p에서96px×2=192px canvas이며 C14의48px×3=144px보다33.3% 크다. 세계/발 위치 보존과 화면 양자화 차이를 구분하며 '화면 크기 완전 동일'로 주장하지 않음. Point·원본 텍셀 축소0 |
| 윤곽광 | 전체 회색 edge lerp·외부 alpha 확장 제거. 달빛을 받는 한 축 방향의 alpha 경계 내부1 native texel에만 뼈색/청백(.72,.76,.68)×.025 가산. 캠프를 향한 면 제외. 실제 소품 뒤 hero는 원본색×.30/alpha×.55로만 표시, 전 둘레 띠 없음 |
| 달빛 방향 | 기존 cold key1.05·색(.36,.56,.65) 유지, yaw44→−44°로 캠프 왼쪽 따뜻한 빛과 반대인 오른쪽 달빛 면을 만든다. pitch32°/실제 그림자 유지 |
| 실행·바로가기 | 검증 실행은 플래그를 명시한다. 통과 뒤 후보 바로가기 인자에만 opt-in을 넣고 Description/shortcut-history Note에 `영웅=리마스터 후보(미승인)` 표시. 기존 일반 바로가기 불변. C15와 C16의 Player 예약 owner를 분리해 실행/해제 충돌 방지 |
| 증명 | 실제 play-smoke·C10 대비1x·hero3x C14와C16·원본 적3x·1600/3840 경계·native grid. 두 CTO 결함 잔여 시 바로가기 미교체 |

05:04 C16 빌드 d0cefa64 오류0·USER_SAVE0, Editor 즉시 반납. 건설 실측은 Nav/Core0/0·이동10676칸 높이 최대.0000611u·목교1407표본 비이동면0. 실제 제품 경로 검증 중이다. C17 준비 소스에서 높이 루프의 py(웹 pixel)를 bridgeFade에 쓰기 전에/100하도록 단위 오류를 수정했다. 이 수정은 판재 아래 지면을.025u로 올리며 C16 설치본에는 소급하지 않는다. holes 루프의 py는 이미 world unit이므로 그대로 둔다.

## 2026-11-03 03:40 CTO 우선 수정 (C14 검증·시각 RETOUCH)

04:31 현황: C14 실제 제품 경로130.21초·도착·오류0. 원본 크기/Point/divisor1 전원 통과, field-entry hero1936셀 중 불균일0. 1600/3840 수직 경계 제거 확인. 다만 혼잡 캠프의48px 원본 영웅은3x에서 여전히 거칠어 strict 시각 PASS를 선언하지 않고 **후보 바로가기는 C10 유지**. 금지된 전사 remaster0. source는 R5 대체 지형으로 진행하되 모든 새 후보에 동일 증명을 적용한다.

04:54 C16 준비: 반투명 원본 내부를 회색으로 혼합하던 visible rim을 제거하고 원본 색을 보존한다. alpha<.02인 바깥 셀에서 이웃 alpha>.65일 때만 냉색(.25,.48,.52) 윤곽 alpha.45(실제 소품 뒤 .24)를 그린다. 정수 배율·원본 Point 텍셀은 그대로다. 아직 실제 Player 검증 전이다.

| 항목 | 현재 계약 |
|---|---|
| 배우 | sourceDivisor 무조건1. 원본48px hero/80px 공격/256px 적 셀을 줄이지 않음. 원본 Point texel × 정수 destination, 위치 정수 반올림. hero 2배 fallback 강제 확대를 없애고1.4배 목표에 가장 가까운 정수 배율. 별도 전사 리마스터 사용0. 실제 원본/로드 atlas 크기·Point를 영수증으로 대조 |
| C12 재작업 | 실제 걷기 PASS·축소0이나, native 적 실루엣이 커지며 근접 적이 영웅을 가림. 바로가기 미교체. C13 이후 일반 깊이 순서를 유지하되 hero와1.4u 이내·eye-depth차1.1u 이내 접촉 적 다음에 영웅을 그려 가독성 보정. hero 원본 경계의 냉색 rim 혼합.20. 소품 가림은 world-depth 경로로 별도 처리 |
| 텍셀 진단 | C12 전체 actor grid는 적의256px 불투명 진단 사각형이 hero grid를 덮어1936셀 검사가 오염됨. C13은 진단 때만 비hero를 discard하여 hero 실제 quad의 정수 셀 균일도를 검사. 제품 렌더 원본/알파는 그대로. 적은 native256→256·Point·1배 출력 |
| 정수 렌더·깊이 | R4 전용 pipeline MSAA4→1, renderScale1 유지. C12 world-depth readback이 far plane199.995만 반환하여 유효 가림으로 인정하지 않음. C13 이후 overlay clear 전 AfterRenderingTransparents에서 shader-read placeholder 대신 실제 base activeDepthTexture를 R32Float로 보존. Viewer를 R3 원근 카메라 한 개로 제한하여 빈 기본2D clear 카메라/반사 카메라는 제외. C13 실제 발밑25.814u/머리27.008u 확인 |
| C13→C14 방법 전환 | C13 실제 readback 발밑25.814u/머리27.008u로 깊이 유효, 제품 경로126.55초·도달·예외0. 그러나 hero48px 원본을 원근 높이에 맞춰4배 확대하는 거친 모습이 남음. 확인한 원본·backup·최초 PixelLab metadata 모두48px. C14는 원근 크기 피팅을 버리고 원본 게임2배에서1.5배인1080p 기준3texel 배율로 고정: floor(3×height/1080+.5), 900/1080은3·1440은4. 위치만 원근. 전사2배 remaster/업스케일 재활용0 |
| C14 grid | C13 캠프1936셀 중92셀은 제품 바닥 아이템 글자/바와 겹쳐 불균일 결과를 그대로 보존. C14는 동일 제품 Player의 field-entry에서도 hero-only grid를 캡처하여 라벨 없는1936 내부 셀을 실측. 캠프 정상1x/3x에는 원래HUD·아이템 표시 그대로 유지 |
| 오른쪽 경계 | R4 숲 패널 세로/바닥 외곽을 저주파 곡선 alpha feather로 제거, forward/depth/shadow 동일 적용. 충돌 변경0. C14 실제1600/3840 검수에서 세로 직선 경계 제거 확인. 외곽 검은 질량의 미술 품질은 RETOUCH |
| 보존 | 반쯤 만든 R5 C11은 컴파일·빌드 성공, 실제 화면 지형 렌더 누락 FAIL. 파일을 보존하고 active-presentation=4로 CTO2건부터 검수. R5 기본 전환은 이후 |
| 증명 | play-smoke 캠프 실제 PNG+원본 texel 영수증+grid 진단. 후보10 대비1x/hero·적3x/오른쪽 경계 proof를 제출, 두 결함 잔여 시 바로가기 미교체 |

## 2026-11-03 P0 평소 실행·5차 Unity 구성 (제작 중, 시각 미검증)

04:31 R5 지형 방법 전환: TerrainData513²·실제 Terrain Layer512²는 유지하고 동일 높이 표본을4×4 메시(각64×64cell)로 그린다. 별도 R5Ground 셰이더가 같은3개 웹 레이어와 동일 holes/weight를 샘플한다. Native Terrain renderer는 숨기고 Core 높이 질의는 같은 TerrainData를 사용한다. 기존 RM1 영역은 양수 둔덕으로 덮지 않고 원래 음수 수로 높이도 보존한다. 목교 아래 이동 높이는 최대.025u·허용±.04u 안. 새 web bark는 tree03의 원본110×140 crop/휘도 노멀, 3D 가지는 world-height 기준 root고정 wind.08u. 영웅 작은 빛은 sprite scale을 상속하지 않고 실제 월드 위치를 따른다. 실행 검증 전 상태.

| 항목 | 현재 계약 |
|---|---|
| 평소 진입 | 캡처 전용 60초 제한을 일반 실행에서 제거. 무기한 필드 대기 후 1-1에서만 표현층 생성. 로비/다른 stage 비활성·원본 Renderer/Light/Volume/Terrain/렌더 파이프라인 복원. 재입장·사망 재시도는 같은 표현층 한 개 재사용 |
| 사람 세이브 | `--map25d-play-sandbox I:/EXODUSER-Storage/map25d/play-sandbox`는 기존 NativeQaSandbox 저장 경로만 바꿈. QA 자동 실행 인자를 사람 바로가기에서 제거하여 설정 저장·일반 입력·소리 정책 유지. 공용/Core 수정 없이 저장 라우터 private root/resolved에 조기 바인딩하며 계약 변경 시 종료. 실제 사람 청취/OS 입력은 별도 미검증 |
| 제품 경로 fixture | `--map25d-play-smoke -output ABS`: 65초 생존→제품 LobbyKeys/키보드 경로→캐릭터 진입→제품 튜토리얼 건너뛰기→실제 Map.CanMove BFS→StepInput 60Hz로 시작4020/7420에서 캠프2050/4400까지 걷기. 직접 좌표 대입 없음. 이동 QA 동안만 무적600틱. 로비 재입장/제품 사망 재시도/다른 stage 합성 guard를 별도 기록. 실제 1-2 자연 진행 검수 아님 |
| R5 기본 표현 | `UnityComposition.prefab` 우선, 보존된 R4 KeyScene은 구버전 폴백. `r5-layout.json`·`r5-construction.json` 데이터 제작. 원본 RM1 scene 읽기 전용으로 Toxic/Blockout mesh 변환 복사, 웹 전체 바닥 그림 사용 안 함 |
| 지형 | R5 전용96×8×96u/원점−8,−1,−88, 높이513²·블렌드512². 걷기와 주변2칸 높이0, 걷기 바깥만 기존 RM1 높이+완만한 둔덕. 지형 레이어 soil7.5u/litter5.5u/mud11u와 곡선 길. 새 Collider0. 수면 구멍은 막힘55px 여유 또는 목교 판재 아래로 제한 |
| 입체 | 기존 Resources RF3 거목 A/B 7개와 목교 복제, 원본 FBX 불변. 웹 bark/rock/mud triplanar 재질. 거목 낮은1.35u 부분에서 Core 이동+45px 침범 삼각형 제거, 높은 가지 보존. C15 목교5.4×8.6u/중심2050,4620의 남쪽이 비이동 영역 위임을 발견하여 C16은3×10u/중심2340,4620/yaw135°로 회전 배치. 판재 높이.025u·높은 난간 제거. .15u 간격의 전체 deck 표본이 Core 비이동이면 빌드 실패. 실제 Player 검증 대기 |
| 카메라·배우 | R5 pitch50°/yaw0°/FOV35°/거리35u/lookAhead2.5u. R4 화면 정렬 직교 카메라 정수 배율 actor 유지. 원본 hero48px·적256px 그대로, divisor1·Point sampling. hero 배율 floor(3×height/1080+.5), 최소1. 실제 소품/적 가림은 별도 시각 검수 |
| 빛·심도 | cold key1.05/색(.36,.56,.65)/Euler32,44. 따뜻한 camp spot180/범위24/각28°·inner18°/부드러운 cookie, 공중 주황 막대 없음. Neutral1.30/Bloom.055·threshold1.5. Bokeh 대신9tap Gaussian band2.4px tilt-shift·HUD/배우 sharp overlay. 음영 보라색 제거 |
| 독액 | 원본 Unity 수로 메시+캠프 양편 타원 basin. 웹 독액 반복/느린 흐름(.003,−.006)·노멀·약한 자체 발광. 기존 A2 실제 장면 반사 D3D11 readonly 컴포넌트 사용, 수면−.075u. 반사카메라는 actor world-depth 수집에서 제외 |
| 지면 접지 검증 | C16 소품은 R5 Terrain.SampleHeight+terrainY 위에 둔다. 목교 holes/높이 ramp도 같은 yaw로 회전한다. 모든 이동 칸 지형 높이 최대±.04u를 실측하고 넘으면 빌드 실패. 목교 holes는 local half extent의 width×.40/length×.46 이내이며 판재가 덮는다. C15 결과에 소급하지 않음 |
| 검증·배포 | Editor는 slots2 공용 실행기 빌드 직전 예약·빌드 직후 종료. Player 독립2슬롯. 제품 경로 fixture와 CTO 두 시각 결함 모두 PASS일 때 후보 바로가기 교체. C10 제품 경로169.30초/1829틱·4974.28px/도달 true/오류0으로 PASS, 03:37 후보 바로가기 교체. R5 C15 빌드 f8d754a9 오류0·Nav0/0. MapLint 가림 잔여L1 341·L1b55·L4 38. R5 실제 Player 시각·FPS는 대기열 대기 중이며 미검증 |

### 이후 승인용 맵 데이터 제안 (오늘 적용0)

A2처럼 캠프 양편이 깊은 늪이고 목교만 건너는 구도는 현재 Core의 넓은 캠프 이동면과 충돌한다. 제안 검토 영역은 웹 좌표 x1300~3000, y4200~5000이며 중앙 x1780~2320 목교 이동면과 캠프2050/4400 도착을 유지하는 방향이다. 이 구역의 이동 타일·스폰·회피 공간 영향은 별도 승인/플레이 검수 대상이다. 오늘은 Core·맵 데이터 변경0, 기존 걷기 위 물 구멍은 시각 목교 아래만 만들고 Nav/Core 0/0을 유지한다.

아래 4차 및 이전 절은 후보 이력이며 위 5차 수치가 현행 제작값이다. 빌드/정적 컴파일은 시각 합격 근거가 아니다.

## 2026-11-03 Map25D 4차 — 빛·원근·실제 높이로 전환 (진행 중)

BRIEF4와 실제6칸 비교판/GAP_ANALYSIS를 직접 검수했다. R13은 빌드 성공 상태이며 사용자 중지 지시로 결과물을 보존하고 I: `r4-before-source`에2489파일 체크포인트를 남겼다. ①+② 실제 Player step1을 먼저 만든 뒤 ③~⑥ 순서로 진행한다.

| 항목 | 현재4차 계약 |
|---|---|
| 카메라·심도 | 원근 pitch50°/yaw−25°/FOV30°/거리28u. Bokeh 초점28m, focalLength50mm, aperture5.6. 실제1x에서 중앙 선명도와 위·아래 끝 흐림 검증 전 |
| 입체 카드 | 바닥 복사/카메라 광선 깊이 가짜 투영을 4차에서 끔. 원래 웹 소품/크기를 실제 높이의 upright alpha card로 세움. alpha clip ShadowCaster·TwoSided 실제 그림자, 지면은 receiveShadow. 원본Core/걷기/소품 데이터 수정0 |
| 주광 | 차가운 방향광1개, 강도1.65·색(.48,.66,1)·Euler32/−38°. 그림자강도1·bias.025/normal.04. 캠프 따뜻한 spot1개: 위치(13.5,10,−43.5)→(18.4,0,−40.3), 강도75/각33°·inner20°·range23. 기존 캠프/포탈 점광 유지 |
| 렌더 에셋 | Remodel Resources의 R4Pipeline/R4Renderer 복제본만 변경. depthTexture ON, CopyDepth after opaque, 주광 shadow4096/거리65. opt-in 실행 중 QualitySettings.renderPipeline에만 적용하고 종료 시 복원. ProjectSettings/Packages/공용 렌더 에셋 수정 없음 |
| 셰이더 | R4Surface는 실제 world normal과 실제높이에서 주광·추가광·alpha 그림자를 받음. 기존 웹 원화64타일/해자 재사용, 바닥·물 그림 미세조정 후보를 더 만들지 않음. Neutral/노출1.30 |
| 실행·검증 | 단일 에디터 빌더 유지. 같은 실제 Core Player에서 shadow ON/OFF 진단 캡처를 추가. step1/최종 품질은 아직 미검증. 원래3차 결과물 수정 없음 |


## 2026-11-02 Map25D 3차 — 웹 원화 지형·해자 방식으로 전환 (진행 중)

BRIEF3의 23시 추가 지시를 적용한다. 3개 빌드마다 중간 보고하되 횟수만으로 멈추지 않고 핵심 결함이 반복되면 제작법을 바꾼다. A2 품질 도달 전 시각 PASS로 올리지 않는다. 이 대화가 단독 writer이며 CTO가 중지한 실행의 WIP는 `I:/EXODUSER-Storage/map25d/r3-takeover-source/`와 `r3-concurrent-writer-*/`에 보존했다. 공유 예약 `codex-map25d-r3`를 현재 대화의 단독 소유 표시로 갱신했다. 사용자 프로그램은 종료하지 않는다.

| 항목 | 현재 제작 계약·검증 범위 |
|---|---|
| 웹 지형 | 실제 웹 런타임 `assets/map/ch1/production_finish` 캐시와 hill/해자를 8×8, 각1000² 타일로 캡처한 WIP를 인수. 월드8000px, 1타일40px, x=px/100,z=−py/100. 캡처 뒤 추가 축소 없이64장으로 지형 샘플. 원본 캐시1024px를 웹의1000px 영역에 그린 결과이며 원본 PNG byte 복사는 아님. provenance는 I: `r3-web/manifest.json`, 추출 코드는 `r3-web.py` |
| 원래 소품 | 웹 draw routine에서 추출한36장·경계 나무8장 중 보이는43카드. 투명 테두리 crop 뒤 drawX/footY만 보정하여 원래 x/y와 가시 크기 보존. 캠프 원래1820/4020, 가시588×442px; 포탈1220/3860; 뼈1940/4340; 검1580/4180; 토템6220/4060. Core props와 collider 수정 없음 |
| 걷기 가림 | 직립 소품의 원화 픽셀이 원래 Core 걷기 칸에 해당하면 직립 알파를 비우고 같은 원화 픽셀을 바닥 연결 그림으로 이동. 원래 막힌 칸 위 부분만 직립으로 남김. 원형 뿌리 둔덕·원형 데칼 추가 없음. 원래 막힘/평탄화 픽셀 수는 `original-prop-coverage.json`. 표준 MapLint 결과는 별도로 보존 |
| 물 제작 전환 | 단색 수면/카메라 평면반사 폐기. 웹 제단 해자(중심5880/3920, rx720/ry360)의 원래 둑·수면을512×2048 띠로 펼친 `r3_moat_strip` 사용. 캠프 옆 원래 걷기 바깥8개 손배치 riverPoints, 폭450px에 얹음. 해자 자체의 Core 위치/충돌은 이동하지 않으며 캠프 옆 띠는 표현만 추가. 삼각형 정점이 걷기 칸에 닿으면 제거. 노드 코드 `Authoring/moat-r3.cjs`, recipe JSON에 좌표 보존 |
| 색/움직임 | 기존 원화만 사용, 새 이미지 생성/유료 도구0. 수면 마스크에만 UV drift(.0018×sin/cos), 노멀의 느린 흐름·실시간 빛 반사. 원래 녹색은 water RGB×(1.16,.62,.30)로 탁하게 조정. Neutral/노출1.30 유지. 낮은 안개(.014,.025,.037,.17)/밀도.10과 높은 안개(.014,.026,.040,.12)/밀도.06 |
| 지형·카메라 | Core 지형/걷기는 원형 보존. 표현 지형80×80u, 걷기 정점0·바깥 높이상한.035u(±.04u 이내), 새 Collider0. 선행 확인용 카메라55° 정사영/100px per world unit, 가로 보정−2u. 영웅은 최종 카메라에 원본2D sprite 재투영. 원근/외곽/수풀 보강은 r3_step1 검수 뒤 진행 |
| 지면 연결/외곽 | 기존 웹 soil/litter 그림을 native64타일 위 월드 곡선 흙길(폭1.2~4.3u, 혼합.72)과 이끼장(혼합.38)으로 연결. soil8u/litter10u 주기, Repeat, 원형 데칼 없음. 맵 바깥(−32~112u)에는 웹 흙 지면 apron .025u 아래, 충돌 바깥3개 실제 3D 숲 패널15×7.5u, 위치(−2.5,−35)/(−1.5,−43)/(−4.5,−51), 앞/중간/뒤3층 합성. 전역 DOF는 실제 Player에서 캠프까지 흐려져 제거, 근경 mip2 흐림만 유지. 진정한 tilt-shift 완료 아님 |
| 실행 근거 | 첫 빌드 `0a6e5424`/실제 Player `ccc2bdc9`로 웹 바닥·캠프 크기 확인. 캠프 옆 물 없음과 영웅의 소품 가림을 발견하여 해자 띠/걷기 평탄화를 적용한 두 번째 빌드 진행. 아직 3차 최종 시각 판정·채택 근거가 아님 |

첫 `r3_step1.png`는 실제 Player에서 E1/E5를 확인한 뒤 보존한다. 최종 화면·영상·FPS·MapLint와 E1~E6 판정은 REPORT의 3차 절에 기록한다. Core/Common/ProjectSettings/Packages는 수정하지 않으며 자동 생성 변화는 최종 실행 뒤 보존/복원한다. stage·commit·push는 금지 상태를 유지한다.

## 2026-11-02 Map25D 2차 — 어둠·회화 바닥 선행 GATE

맵 총괄 candidate5 FAIL 판정을 받아 제작법을 전환한다. 2차는 빌드 최대3회이며, 먼저 어둠/바닥만 실제 Player로 캡처하여 `20261102_map25d/r2_step1.png`에서 D1·D2를 직접 판정한다. 이 GATE 통과 전 숲 패널·강·그림자·전경 재작업으로 넘어가지 않는다. 현재 원격 `unity/main`은 fetch 후 `5a61e137b416f50bf56b2f052293ac20eb9acd88`이나, 사용자 지정 입력/HEAD `1403c5ee6`을 유지하며 merge·stage·commit·push를 하지 않는다.

| 변경 | 2차 계약 |
|---|---|
| 회화 바닥 | `Authoring/paint-r2.cjs`가 지정 입력 웹 흙/이끼/피부 원화3종을 큰 연속 곡선·저주파 블렌드로 합성. Core 타일/occupancy를 색상 합성에 사용하지 않음. 뿌리/둑/독액 원화8개 넓은 feather 덧그림. 배치/블렌드/원본 경로는 `r2-paint-recipe.json` |
| 바닥 좌표 | px x−1000..5000/y2400..6000, 5120×3072, 최대 임포트8192·Clamp. UV=((wx+10)/60, 1−(−wz−24)/36). 단일 월드 그림을 기존 지형 청크에 연속 샘플. 기존 칸 모양 floor87 덧그림 제거 |
| 바닥 노멀 | 합성 원화 휘도·1.5px blur·±2px 차분, 강도2.5. 새 grain/dither 없음. 합성 전후 그림·해시는 I: `map25d/r2-paint-final` |
| 어둠 | 환경광(.003,.006,.014), 셰이더 상수광(.004,.007,.014), 달빛(.26,.38,.65)/강도.055. 셰이더 거리 안개 시작18u/계수.025/색(.003,.008,.015). Neutral/노출1.30 유지 |
| 높이 안개 | 낮은 층 y.06...65/색(.006,.014,.020,.15)/밀도.065; 높은 층 y1.8..7.4/색(.009,.022,.034,.34)/밀도.09. 강 독안개(.018,.026,.012,.14)/밀도.15 |
| 빛 웅덩이 | 활성 키 구역 광원3개: camp_fire_0 반경950px/energy3.2, camp_glow_0 반경340px/energy1.5, tree_glow_m_ctree15 반경440px/energy1.9. 실제 Light intensity=energy×2.4×일렁임. 원화 없이 바닥만 붉히던 원거리 광원 제거. 캠프/포탈 원화 적색 발광 계수.36/.70 |
| 어둠 측정 | HUD 외곽을 뺀 (60,80)~(1860,900) sRGB 휘도30/255 미만 면적60~75%를 CTO 수치 보조선으로 사용하고 전체 화면 비율도 별도 기록. 바닥에만 moonFill=(1.008,1.44,2.088)×곡선 patch(.25~1)×구름(.80~1)을 곱해 원화 디테일을 보완. 이는 선형 셰이더 계수이며 화면 RGB 밝기가 아님. 숫자만으로 D2 합격 처리하지 않고 1x 빛 경계·영웅·원화 디테일을 함께 검수 |
| 영상 | 화면 readback 목표20Hz로 RAM에 모은 뒤 동작 구간이 끝나면 무손실32bit BMP로 I: 저장. 인코딩은 Player와 별도. 실제 표본 수/시간·타임스탬프를 motion.json에 기록하며 인코딩 fps를 게임 fps로 쓰지 않음 |

선행 실제 Player: 빌드1 `9992b6c8`·Player `f00aabdb`, `r2_step1.png` 직접 1x 확인. D1 칸 덧그림 계단선 제거/빛 아래 회화 정보, D2 암부90.93%/빛 웅덩이 분리로 선행 GATE 통과. 기존의 투사 그림자/흰 접지 얼룩은 이 시점 미해결로 보존했다. 이후에만 아래 제작법을 적용했다.

| 후속 표현 | 2차 계약·검증 범위 |
|---|---|
| 숲 합성 | `Authoring/forest-r2.cjs`: 웹 나무01/02/03/05/06/07/11 원화의 back/mid/front를 오프라인 중첩한 서로 다른4096×2048 패널4장, 전경1024² 합성2장. 원본/배치/색은 `r2-forest-recipe.json`. 런타임의 개별 나무 줄 배치 제거. 패널은 수직으로 세우고 yaw만 카메라에 맞춤 |
| 카메라 | 표현층 opt-in에서만 yaw−70°, pitch48.7014126°/거리20u/세로FOV46.9453°, lookAhead4u/lookSide−1.5u. x=px/100,z=−py/100 그대로. 실제 카메라 최종 pose 후 기존 NativeHd2D actor의 소스 자세로 재투영하고 비actor는 기존 pivot/roll을 보존. Core·입력·스프라이트 자산 변경 없음. 각 해상도 Player readback에 cameraYaw/position/euler 기록 |
| 소품 가림 | 카드32×40 분할, 알파는 픽셀 셰이더에서 clip. 중심점 알파로 삼각형을 제거하던 처리는 얇은 가지를 잘라 삭제. 숲 패널은 실제 걷기 영역 주변45px도 geometry에서 제외. 캠프/아치/뼈/검의 표현 위치·크기는 JSON에 별도 기록해 외곽 막힘 영역으로 옮김. SourceMap 원본 props/colliders는 불변. 상호작용과 표시 위치 일치 검수는 별도 미완 |
| 충돌 섬 표현 | 원래1220/3860(rx57,ry57),1820/4020(rx201.5,ry124),1580/4180(rx80,ry80) 세 ellipse에 원화 뿌리+월드 바닥을 합성한 낮은 지형 둔덕. 반경1.035배·20ring×64segment, 막힘 내부 높이최대.42u/정규화반경.86에서0·걷기 높이0. 새 Collider 없음. 지형 전체160×120u/257² 높이맵, 걷기 밖 완만한 높이 변화는 걷기 사각형까지 연속거리.85~1.65u로 블렌드 |
| 그림자 | 모든 환경 카드의 투사 그림자 OFF. 보이는 소품 발밑의 kind3 검은 접지만 사용(알파.40·제곱 radial fade), ZWrite0/queue2980. actor 접지는 stage-owned FootContact 셰이더(RGB0/알파.48)로 실행 중만 교체하고 종료 시 복원. Common/원본 스프라이트 자산은 수정하지 않음 |
| 강/둑 | 끝단을 화면 밖으로 연장한12개 riverPoints를 Catmull-Rom 보간, 중심선24sin(.007y)+12sin(.015y)px/폭28sin(.0055y)+18cos(.012y)px 변주. 수면−.55u, 양 둑−.57u→기존지형/범위−6..145px. 걷기 쪽은 높이0 이하. 탁한 녹갈색 깊이 차이·연속 노이즈 흐름(.018,.032)/초·기포·미약한 자체 발광·실제 평면반사와 캠프/포탈의 긴 반사 흔적. 별도 RG flow-map은 미구현. 강의 윤곽/둑 일체감은 실제 화면에서 별도 판정 |
| 후처리/동작 | Neutral/노출1.30, Bloom강도.09/threshold1.25/scatter.5, Gaussian DOF24~38u/반경.6(엄밀한 tilt-shift 아님). 바람.72/1.13rad/s·공통방향(1,.28)·world phase·뿌리 고정, 숲패널 sway.06~.12u, hero 근접1.2u 눌림. 원본 Godot 전경27개는 앵커만 보존하고 전부 가시 이식하지 않음 |
| 시점 검사 | 표준 MapLint는 기존 북향 L1b/L4 계약 그대로 실행하여 결과를 숨기지 않음. 회전 시점은 추가로 걷기1460칸×높이.25/1/1.6u의4380ray로 카드 메시 교차 검사. 최종 L1/L1b/L2/L3/L3b/L5/L6/L7 위반0, L4 캠프1건 FAIL(h2.537u/허용2.344u). 추가ray 가림0. 이는 빌더 CPU 시점 검사이며 시각 PASS가 아님 |

**2차 최종 VISUAL VERDICT: FAIL.** 세 번째 빌드 `b6a7db05`/실제 Player `f067fadc`(D3D11/RX9070XT)까지 검수하고 3/3 한도로 중단했다. 암부 ROI71.00%/전체74.66%, 실제 캡처·1x/3x·3열 비교·10초 영상은 최종 REPORT의 “2차” 절에 있다. 강이 판처럼 읽히고 숲 하단 절단·초광폭 오른쪽 빈 바닥·검은 수면 반사 도형이 남는다. L4 잔여1, 3x 점0도 합격 선언하지 않는다. 정지 Core tick 중 6초 표본 1920 평균249.84FPS/3840 평균273.30FPS, 동작 원본201장/10.018초(20.063Hz readback)를 30fps·10.000초로 인코딩했다. 밀집 전투/자연 손조작 QA는 미검증이다.

**21:30 CTO 최신 지시로 Dota 대기 규칙을 폐지**하여 자체 실행 스크립트의 검사와 중단을 모두 제거했다. 사용자 프로그램은 종료하지 않았다. 공용 FIFO/단일 Unity·무창·무음·격리 세이브를 지켰고 최종 Player 창 노출0/잔여0/사용자 세이브 변경0이다. Unity 자동 tracked718개와 새 meta/settings58개는 I:에 SHA 보존 후 복원/이동했다. HEAD·INDEX 불변, 보호 경로 diff0, Core DLL은 1차와 2차3후보 모두 동일하다. 자체 서버·예약을 종료했고 다른 작업자 예약은 보존했다. 중단 무결성은 `r2-interruption-integrity.json`, 최종 보호 검증은 `r2-final-verification.json`, 최종 소스 보존본은 `r2-candidate3-source/`다. stage·commit·push0, 2단계 미착수.

## 2026-11-02 CH1-1 2.5D 캠프·강 1차 후보5 이력 (현행 수치는 위 2차 절)

브랜치 `codex/unity-map25d-20261102`, 입력 `1403c5ee6d52c540815ab1cf70d5666b9023aa75`. 이번 범위는 실제 Core 캠프 한 장면이며 전체 1-1 적용/채택/사용자 실행본 교체가 아니다. 커밋·push 없이 총괄 diff 검수에 제출한다. 판정·최종 실행 근거는 `G:/exoduser/tmp/design-review/20261102_map25d/REPORT.md`, 중간물·원본·로그는 `I:/EXODUSER-Storage/map25d/`다.

| 항목 | 현재 후보 계약 |
|---|---|
| 소유 | `Remodel/CH1_1_25D/**`, 에디터 `Map25DBuilder.cs` 1개, 본 절. Core/Common/ProjectSettings/Packages 설계 변경 없음. Unity 자동 임포트·직렬화 변화는 별도 보존 후 원본 byte 복원 |
| 진입 | `--remodel3d --unity-keyshot-baseline --unity-map25d-capture`와 실행기의 격리 세이브 필수. 기존 `FirstPlayable`·실제 NativeGame/Simulation·RM1 카메라를 쓰고 기존 맵 표현만 끔. 기본 실행에는 연결하지 않음 |
| 좌표·구역 | x=px/100, z=−py/100, 40px=0.4u. 캠프 원본 `(1820,4020)`, 검수 영웅 `(1690,4430)`, MapLint 타일 창 `[12,84,72,124)`; 표현 지형 px x−3000..7000/y2000..6400. 높이 표본257², 지형100×4×44u/원점(−30,−.8,−64), 4u 청크25×11개 |
| 원화 | 웹 `rotforest_tree`·camp·sword_pile·bone·root 15종을 동일 byte 입력으로 복사. 바닥 반복 베이스는 불투명 floor87 `skin_material_generated`(2048²·명도.65/채도.65), 전역 덧그림은 floor87 좌표 crop `[0,2458,4506,3482]`→4096×3165. 마스크가 있는 skin65 덧그림을 반복 베이스로 썼던 검은 도형 결함은 폐기. CG 나무·바위 모델 없음 |
| 노멀 | 밝기(.2126R+.7152G+.0722B)와 알파 경사, 1.5px blur 후 ±2px 차분. 새 점/디더/그레인 추가 없음. 카드 강도3, soil1.4, floor1.8 |
| 지형 | 걷기 칸 주변 2칸 확장 영역 y=0. 비보행만 낮은 기복·강 홈. 기존 SourceMap의 이동·판정·스폰 데이터/콜백 불변. 새 물리 Collider 없음 |
| 배치 | `Resources/Map25D/layout.json` 손배치26카드. 기존 Godot 전경 앵커27개는 좌표 데이터/비렌더링 transform으로 보존. 전체 나무 전경→걷기 영역 메시 절단을 반려하고 카메라 모서리 가지 crop2장으로 제작법 전환: tree03/01, UV(0,.43,1,.57)/(0,.47,1,.53), 크기7×5/6.5×4.5u, 회전−24/26°, 깊이8u·바깥오프셋1.1u/하단.45u·mip4 blur·알파.92. 원본 전경27실물 이식 완료가 아님. 원본 캠프 소품의 카드 가림은 MapLint에 그대로 남김 |
| 빛·안개 | Godot MAP-LOOK 원본 JSON 별도 보존. 정적 광원30앵커 해석(오브젝트/나무/빛줄기 웅덩이), 키 구역만 생성·근접7개 활성. 플레이어 소형광 별도. 원본 동적 스폰/VFX 광원 전체 이식은 미완. 높이 안개2겹+독안개·깊이 버퍼로 절단하는 24표본 볼륨 빛줄기 |
| 톤 | Neutral·postExposure1.30·채도−8·대비6, Bloom .09/threshold1.25/scatter.5. Gaussian DOF 시작17.5u/끝28u/반경.6. 엄밀한 기울어진 초점면의 tilt-shift는 미구현. Volume override는 서브에셋으로 저장하고 Player readback 검사 |
| 움직임 | 카드 위쪽 uv.y²로만 바람·위상 변주/영웅 반경1.2u 눌림. 시간 .72/1.13rad/s, 공통 바람(1,.28). 독액 곡선 UV 흐름(.018/.032uv/s)·실제 평면반사(기존 A2RiverReflection readonly, 혼합.18)·8개 JSON 기포(.11주기/초)·강가 거품. 포자38/수명10초/크기.11u/속도.022, 불씨34/수명2.6초/크기.055u/속도.28, seed20261020. 저속 구름 그림자 .035/.026rad/s. 별도 풀 군락과 엄밀한 RG flow-map은 미구현 |
| 검수 fixture | 캠프 직접 좌표 진입, 정지 구도는 Core tick 정지. 스폰굴14·초기 적16 유지. 영상은 기존 StepInput 60Hz·600틱 무적. 자연 도착/OS 손조작/밀집 전투 검수 아님 |
| 성능·판정 | 1920/3840×1080 실제 hidden D3D11 Player에서 각6초 무제한 프레임 측정, PNG 저장/영상 인코딩과 분리. 첫 후보 398.98/393.78fps는 전경 가림/후처리 저장 결함이 있는 FAIL 이력이며 후속 후보의 성능으로 재사용하지 않음 |

첫 실화면의 전경 중앙 가림·검은 바닥 도형·분홍 사각형을 FAIL로 보존했다. 전경 메시 절단 뒤 모서리 가지 crop 방식으로 전환했고, 재생성 시 자산 참조 유지·URP shadow bias/clip-space·후처리 서브에셋 저장을 수정했다. 검은 바닥 도형의 원인은 마스크가 있는 바닥을 반복 베이스로 쓴 것이어서 불투명 원화로 교체했다. 최종 비교·1x/3x·동작·FPS·MapLint의 범위와 판정은 위 REPORT를 따른다. 기술 검사로 visual PASS를 대체하지 않는다.

최종 후보5: 빌드 `63dc3023` 오류0, 실제 hidden D3D11/RX9070XT Player `431dd645` 종료0·사용자창0·잔여0·USER_SAVE 변경0. Neutral/1.30 readback, 1920×1080 **338.67fps**(p95 3.900ms), 3840×1080 **324.09fps**(p95 4.049ms), 각6초·Core 정지 표본이다. 영상은 실시간10초/59 PNG 표본을 타임스탬프로30fps·10.000초에 배치했으며 실제게임30fps 성능 증거가 아니다. Core DLL 5후보 모두 `04afacf88c56fb84223f2bcca0e7a9b81e58add87f4358b19934847dfd940713`로 동일. 최종 Runtime DLL `86c45e802e61b51982b75db218cbb4414a8f6d735bd74d1ce337b53691edb673`.

최종 MapLint: L1 **125칸 FAIL**, L1b **8칸 FAIL**, L4 **5건 FAIL**; L2/L3/L3b/L5/L6 위반0, L7 경고0. 기존 source 캠프·아치·뼈 카드가 걷는 면 위를 덮는 표현 문제이며 검사에서 숨기거나 Core 충돌을 바꾸지 않았다. **VISUAL VERDICT: FAIL** — A2 대비 외곽 질량/안개 깊이/수면/구도 큰 차이 잔여, 3x 전체 점0 확정 안 됨. 1단계 미합격 제출이며 2단계 착수0·일반 실행본 반영0. Unity 자동 tracked718개는 I: 보존 후 HEAD byte 복원, 새 자동 meta/settings58개도 생성 시각·소유 확인 뒤 I:로 이동 보존했다. 자체 서버·예약 해제, INDEX/commit/push0.

## 2026-10-31 현행 순수 맵 분기 — 미인수 UI 재질 제외

기존맵분기에상속된 c253ec3b0/1c985c88e 재질시안은현공통15c8 및현재순수UI01dbc의조상이아니며현행채택근거가없다. UI담당과대조후정확8파일을I: `steam-keyshot/a2/field-screen-20261031/미인수UI-원본/`에보존하고, Overlay/Presentation은승인공통15c8의정확byte로복원·MaterialLayout/Material.Capture의cs/meta 및전용tests2파일은현행맵입력에서제외했다. 원격6771672c9와기존이력은보존했다.

현재클리어표시는공통의기존평면패널/버튼을사용하며 MaterialReady/Pieces/UV재질helper는없다. scale=min(1,max(1,W−32)/560,max(1,H−32)/LogicalHeight). 별도UI담당의SafeLayout·물리버튼후보는아직인수하지않았다. 아래2026-10-30재질절과그수치·검사·Player는당시private후보이력으로만보존하며현재구현/맵PASS로소급하지않는다. 현재전체필드계약은 `UNITY_KEYSHOT_A2_20261030.md` R4표를따른다. R4 실제 D3D11/6구도는 FAIL 이력이며 R5 통행맞춤·강바닥지지목·전경/수피접합·노출+.55EV/달빛3.2·이끼안쪽.45는 첫문서 R5절을 따른다. 순수회귀37PASS/원본Core·타일·이동·LOS불변. 공동R2 e357/빌드feecb283·같은M107fa19ed23/23·필드bb5d6a4822장 원본1x·실제메시(144청크/9거목/침범0/목교145수면교차) 기술PASS. 전체아트는카펫/뿌리반복/Stage3물마감RETOUCH. UI전체R3재작업/최종common·Desktop는별도미완료. 현행근거는첫문서 R5실제절.


브랜치 `claude/unity-pc-rm1-20261027`. 명세 `E:/exoduser-wt/_out/rm1/SPEC.md`(맵 총괄), 판정: 맵 총괄(구조), 디자인총괄(시각), 톤은 ① VFX 렌더 병합(Linear·후처리) 뒤.

## 생성 방법 (멱등)
- 씬 `unity/Assets/Exoduser/Remodel/CH1_1/RM1_Slice.unity`, 빌더 `unity/Assets/Exoduser/Editor/Rm1SliceBuilder.cs`.
- `Unity -batchmode -executeMethod Exoduser.Rm1SliceBuilder.Run` (씬 생성), `.Capture -outDir <dir> -cuts start,r2,river,close,trunk,top [-capsule 1] [-shape 1]` (1600x900 컷, top=3200x2160 정사영+걷기 칸 초록), `.Fps -out <json>`.
- 좌표: 웹 px → 월드 x=px/100, z=-px_y/100 (1타일=0.4u). Core(`Runtime/Core`)는 건드리지 않고 3D 층은 렌더 전용.
- 슬라이스 창: 타일 x60~140 y138~192(패딩 포함 지형 x48~152 y126~200).

## 구조 판정 수치 (최종 빌드)
| 항목 | 값 | 파일 |
|---|---|---|
| 3D 덩어리가 덮는 걷기 칸 (중심 / 0.5칸 이상 깊이) | 0 / 0 | `Data/rm1_walk_overlap.json` |
| NavMesh vs Core 걷기 격자 (4320칸) | NavMesh만 걷기 0, Core만 걷기 0 | `Data/rm1_navmesh_diff.json` |
| 막힘 섬·돌출부 전수 점검 4건 | 모두 3D 물체로 덮임 | `Data/rm1_islands.json` |
| FPS (editor batch camera.Render, RX 9070 XT, 1600x900, START) | 3D 켬 767·934 / 끔 2286 | `Data/rm1_fps.json` |

- NavMesh는 걷기 칸 메시를 에이전트 반경 0.1u(복셀 0.04u)로 직접 굽는다. 몹 간격은 NavMeshAgent 반경으로 맞춘다.
- 카메라 쪽(걷기 칸이 북쪽 16칸 이내) 덩어리는 높이 0.9u 이하.

## 재질·실루엣
- `M_RottenWoodMembrane`(덩어리·채움), `M_CursedBark`(둥치·뿌리·가지·W8 소품): 기존 확정 아트 map3d `mass_v01`(+normal) 사용, 새 생성 이미지 없음.
- 덩어리·둥치는 절차 메시(`LumpMesh`: 슈퍼엘립스 풋프린트 상한, 밑동 로브, 테이퍼, 기울임, 노이즈, 돔형 윗면, 둥치는 부러진 윗면). 풋프린트는 항상 막힘 칸 안.
- 독액 `M_ToxicFlow`(`EXODUSER/ToxicFlow`, 불투명): 보스 아레나 수로에서 재사용. 색은 ① 병합 뒤 재조정.
- 전경 카드 `M_FgRoots`(카메라 하위, 화면 아래 모서리), 배경 카드 `M_BgTree`(바깥 덩어리 너머 6장), 풀 detail(LIFE1 색, 군락 36칸): 절차 알파 텍스처.

## 못 한 것 / 대기
- 독 스킬 터진 프레임: VFX 세션 산출물(기포·독 스킬 이펙트) 도착 뒤.
- 풀 detail·전경 카드는 어두운 Gamma 화면에서 거의 안 보임 — ① 병합 뒤 톤에서 재판정.
- 톤·색 수치(독액 노랑 등): ① 병합 뒤. `Rendering/` 자산은 ④ 차례 전까지 손대지 않음.
- 데칼은 쿼드 메시(URP Decal Projector 아님).

## Core → 월드 좌표 변환 (런타임 연결용, 2026-10-28 맵 총괄 요청)

`Rm1SliceBuilder`가 씬을 구울 때 쓴 변환 그대로다(출처: `Editor/Rm1SliceBuilder.cs` 26-29·45행 `W()`, 128-131행 지형 배치, 320행 `GroundY`, 829-859행 카메라). Core(`Runtime/Core`)는 한 줄도 바꾸지 않았고 Core의 z(높이)는 0 그대로다 — 높이는 표현 쪽이 지형에서 샘플한다.

| 항목 | 값 |
|---|---|
| 원점 | Core px (0, 0) = 월드 (0, 0, 0) = 웹 맵 격자 좌상단 모서리. 이동·회전·스케일 없음 |
| 축 | **x_월드 = px_x / 100**, **z_월드 = −px_y / 100**, y_월드 = 높이. 웹 y(아래쪽 = 남쪽)가 커지면 z가 작아진다. +z = 북 = 화면 위, −z = 남 = 카메라 쪽 |
| 단위 | 1px = 0.01u, **1타일 = 40px = 0.4u**. 타일 (tx, ty)의 좌상단 모서리 = `(tx·0.4, y, −ty·0.4)`, 중심 = `((tx+0.5)·0.4, y, −(ty+0.5)·0.4)`. 타일 인덱스 = floor(px/40) |
| 씬 루트 | 루트 오브젝트 `World`(위치 0, 회전 없음, 스케일 1) 아래에 `Terrain`·`Toxic`·`Blockout`·`Background Cards`·`Decals`·`NavWalk`. 씬 루트에 `Lights`(`Pools`·`Shafts`)·`Key Light`(방향광)·`Global Volume`, 그리고 카메라 리그 `RM1_CameraRig`(`Main Camera`(`Foreground Cards` 자식)·`Player Marker`·`CM LOOK-001`, 재생성 뒤. 저장된 씬은 아직 이 셋이 루트에 따로 있음). 모두 월드 좌표 그대로라 오프셋·회전 보정은 필요 없다 |
| 지형 배치 | `Terrain` 위치 = `(48·0.4, −0.5, −200·0.4)` = **(19.2, −0.5, −80.0)** = 타일 x48·y200(남서쪽 모서리) 기준. 크기 `(41.6, 4, 29.6)`u = 타일 104×74. 즉 지형은 **타일 x 48~152 · y 126~200 (px x 1920~6080 · y 5040~8000)** 창만 덮는다. 걷기·막힘·덩어리·수로 데이터는 이 안의 슬라이스 창 타일 x 60~140 · y 138~192만 정식(나머지는 패딩) |
| 지형 높이 | 높이맵 1025×1025, 행 i = 남쪽(ty=200)에서 북쪽으로, 열 j = 서쪽(tx=48)에서 동쪽으로. 월드 높이 = −0.5 + h·4, 범위 −0.5~3.5 |
| 높이 샘플 | `Terrain.SampleHeight(new Vector3(wx, 0, wz)) + terrain.transform.position.y` (빌더의 `GroundY`). 캐릭터·적·드랍은 이 값 위에 얹는다(마커 스프라이트는 `Player Marker` 위 +0.75u). 창 밖 위치의 `SampleHeight` 동작은 확인하지 않았다 → 연결 쪽에서 창 안으로 클램프해서 부르는 것을 권장 |
| 독 수로 | 수면 y = −0.21(지형 위가 아니라 파인 홈). 걷기 칸은 침범하지 않는다(`rm1_walk_overlap.json` 0/0) |
| NavMesh | `NavWalk`: 걷기 타일 사각형만 모은 메시로 구움(반경 0.1u, 복셀 0.04u). Core와 칸 단위 일치(`rm1_navmesh_diff.json` 0/0). 런타임 이동·충돌은 Core가 하므로 NavMesh는 몹 간격 용도 |

### 카메라 LOOK-001 (슬라이스 값)
- 원근, 피치 **0.85rad = 48.70°**(회전 `Euler(48.70, 0, 0)`), 거리 **14u**(= 1400px). 카메라 위치 = 대상 위치 + `(0, sin0.85·14, −cos0.85·14)` = 대상 + **(0, 10.52, −9.24)**. 댐핑 0, 월드 좌표 추적(`CinemachineFollow`).
- 현행 빌더·런타임 카메라 수치는 `Resources/Data/remodel_camera.json` 하나다: 세로FOV46.9453° 고정, 피치48.7014126°·거리14u, 영웅2배·북쪽전방1.45u. 기존 저장 씬은 로드 후 공통값으로 덮어쓰며 다시 굽는 빌더도 같은 값을 읽는다. 이전 H/2800 FOV와 900p35.65°/1080p42.17°는 과거 검수 기록이다.
- 스프라이트 빌보드: 마커 스프라이트 회전 `Euler(48.70, 0, 0)`(카메라 피치와 같은 기울임), 쉐이더 `Rendering/Sandbox/SpriteLit3D.mat`.
- 같은 씬에 카메라 리그(`Main Camera`·`AudioListener`·`CinemachineBrain`·`CM LOOK-001`·`Player Marker`)가 들어 있어 additive 로드하면 `NativeGame`의 `Camera.main`·오디오 리스너와 겹친다. 연결 쪽에서 로드 직후 이 오브젝트를 이름으로 끄거나 `NativeGame` 카메라가 CM에 따르게 해야 한다. **빌더는 이미 고쳤다(맵 총괄 승인 10-28)**: `Main Camera`(+`Foreground Cards`·`AudioListener`·`CinemachineBrain`)·`CM LOOK-001`·`Player Marker`를 루트 `RM1_CameraRig`(위치 0·회전 없음·스케일 1) 하나로 묶는다. additive 로드 뒤 이 루트 하나만 `SetActive(false)`하면 된다. **저장된 `RM1_Slice.unity`는 아직 다시 굽지 않아 예전 배치(리그가 씬 루트에 흩어짐)다** — 재생성은 Unity 실행 순번을 받은 뒤라 그때까지는 이름으로 끈다.

### 보스 아레나 A1 (`RM1_Arena.unity`, 아직 안 만듦)
- 같은 변환: 원점 = 아레나 격자 좌상단 (0,0), x = px/100, z = −py/100, 격자 5120×4320px = 51.2×43.2u. **Core 아레나 중심 (2560, 2160)px = 월드 (25.60, −21.60)**, 걷는 바닥 y = 0 평면(지형 없음 → 높이 샘플은 0 고정).
- 필드 창(x 19.2~60.8, z −80.0~−50.4)과 아레나(x 0~51.2, z −43.2~0)는 월드 좌표가 겹치지 않아 한 번에 로드돼도 충돌하지 않는다.
- 수로 원 중심은 타일 원 중심 (2580, 2180)px = (25.80, −21.80)이고 기둥은 Core 중심 기준이다(`UNITY_RM1_ARENA_20261028.md` §4.1).

## 2026-10-29 웹 화면 비교 수정 후보

인계서 `unity-visual-brief2.md`의 6건을 담당 `codex/pc-unity-visual-ntfs-20261029`에서 처리한다. 웹 기준 game.html blob `1439fadd79e75034ce1e5286a3b885fc67e69c6f`, 검수 해상도 1600×900. 아래는 구현 계약이며 최종 시각 판정은 같은 후보 Player 캡처 뒤에 기록한다.

| 항목 | 현재 후보 값·동작 | 적용 위치 |
|---|---|---|
| 빛줄기 | Hell 1/2 강도 0.035/0.028, 셰이더 상한 0.05, 가로 감쇠 제곱, 세로 0~0.75 진입·0.75~1 퇴장 smoothstep. 바닥 끝 사각형 단절 제거 | 빌더·두 재질·LightShaft.shader |
| 카메라 | 공통 JSON: FOV46.9453°·피치48.7014126°·거리14u·영웅2배·전방1.45u. Core 카메라/판정은 유지. 발끝은 원본240프레임 알파>64 측정값 | NativeRemodelCamera / NativeGame.Remodel3DViewport / Rm1SliceBuilder |
| 필드 톤 | RM-1 로드 뒤 Volume 프로필 사본의 노출 +1.0EV, 채도 -18, 색 필터 (0.82,0.90,1). 공통 렌더 자산은 변경하지 않음 | NativeGame.Remodel3DLoad |
| 피부 결 | 기존 웹 컬러맵 4260×3031의 회색조→blur sigma1→중앙 차분×6, nx=-dx/길이·ny=dy/길이·nz=1/길이를 RGB로 인코딩한 normal. 최대4096, TerrainLayer Colormap normalScale .55 | Ground/ch1_1_r1r2_normal.png, TL_Colormap, 빌더 |
| 피격막 | 원본 색 알파 .25×Core ScreenFlashAlpha. 처음 유효 알파 .0625, Core 감쇠 불변 | NativeGame.OnGUI, B07 정본 |
| 보스 바닥·외곽 | 토양 Bilinear, 시각용 바깥 여백32타일, 점유 한 타일 확장 후 Px8 기준 반경10의 가로·세로 box blur3회로 벽 알파 감쇠. 원래 충돌·걷기·출구는 그대로 | NativeArenaView |
| 피해·상태 문자 | 아래 보스 문자 근거리 재작업 계약으로 교체. 실제몸 예약·유형별거리144/176/208·.18초합계/횟수·필수경고3→수치2→일반예고1→반복0·이동오프셋 유지 | NativeFloatingTextLayout, NativeGame, NativeReviveHud |
| 결과 화면 | 현재private재질후보: 본문560×546/원화외곽592×578, 화면여백16에맞춘축소·UV모서리픽셀보정. 시간/처치→SP→로비·표시/입력공유유지. A22 최신계약 참조 | NativeStageClearOverlay / Presentation / MaterialLayout |

- 문자 배치 회귀: 변경 전 두 번째 문자에서 중첩 실패, 변경 후 40개 밀집 문자·HUD 경계·프레임 초기화·화면 밖 클램프 통과. `unity/Tools/visual-parity-tests`.
- 기준 빌드 `f4642f85` 오류0, 숨은 D3D11 M1 `3c4f97a5` 23/23·종료0·창0·잔여0·USER_SAVE 변경0. 이 증거는 수정 전 기준이며 위 수정 후보의 검수로 재사용하지 않는다.
- 출력: `I:/EXODUSER-Storage/unity-visual/ntfs-20261029/`. 최종 빌드·비교·통합은 진행 중이다.

- 첫 후보 5a340b469의 Win 빌드 69e759cd·M1 bcad8039는 23/23·세이브 변경0. 직접 본 화면에서 노출+.25EV는 피부 결이 지나치게 어두워 시각 반려했고 +1.0EV로 수정한다. 반복 문구는 같은 색/내용·세계거리 x130/y80 이내·120ms 안이면 생성을 합치고 출현 시각만 갱신한다. Core 텍스트 이벤트·값·수명은 바꾸지 않으며, 실제 보스 몸 경계는 화면 배치 금지 영역으로 등록한다. 최종 검수는 다음 후보 영수증으로 구분한다.

- 두 번째 1x 대조에서 피부가 여전히 흐려 기존 색 조정 반복을 중단했다. 컬러맵의 기본 최대2048/NPOT 변환·anisotropic1과 일반 흙 혼합이 원본 주름을 약화시키는 입력으로 확인했다. 컬러맵 최대8192·NPOT 없음·Trilinear·anisotropic8·고품질 압축, 주 레이어 가중치1/추가 흙0으로 바꾼다. WebSkinSurface는 기존 TerrainData의 알파만 수정하고 전체 높이값 전후 동일을 검사한다. normalScale.55와 카메라·노출+1.0은 유지한다.
- 보스의 실제 그림은 generic EnemyView가 아니라 NativeDruidBody.main이었다. 기존 예약 조건은 disabled generic body라 동작하지 않아 현재 NativeDruidBody.Visible/Bounds를 직접 읽도록 수정했다. 소스 값·애니메이션·판정은 그대로다. 다음 Player 실화면에서 이 경로의 글자 가림을 확인한다.

- 원본 피부 단독 가중치 후보 fa3d2e990은 실제 화면에서 거울 같은 점반사가 발생해 반려했다. 설치된 URP17.6 TerrainLitPasses.hlsl 177~194행을 읽어 기존 m_SmoothnessSource=1이 smoothness0을 무시하고 불투명 diffuse alpha1을 표면 매끄러움1로 쓰는 직접 원인을 확인했다. 주 피부 레이어는 m_SmoothnessSource=2(상수), smoothness .08로 고정하고 빌더에도 같은 값을 지정한다. 조명/노출을 다시 돌려서 감추지 않고 재질 입력을 바로잡는다.


## 2026-10-29 NTFS 재개 최종 제작·검수 영수증

- 빌드 입력: `e9dc9700a96613f316f0ea9e0ebff771b3cd000f`, 브랜치 `codex/pc-unity-visual-ntfs-20261029`. 공통 `13c23929eefa1780334935af2c17ba0802d72965`를 정상 병합한 후보이며 작업 브랜치 원격 SHA를 읽어 대조했다.
- Unity 6000.6.7f1 시작 f8eca84f 성공. 최종 Win64 빌드 8e05c001 컴파일0·BuildReport 오류0. 숨은 D3D11 Player 1dbb47b3 M1 23/23, RX9070XT, 사용자창0·잔여0·USER_SAVE 변경0.
- 기존 성공 피격 oracle 3000사례·47559검사·불일치0은 현재 Core 트리/웹 블롭이 동일해 보존했다. 새 oracle 실행으로 세지 않는다. 새 화면 배치의 40개 밀집 문자·HUD 경계·보스 예약20개 검사는 통과했다.
- RM-INT: 2D 2d585d6f와 최종3D 16b5187b 각1800틱·180기록·해시11640a5da4a88c94·기록 불일치0. 2D 실행본과 최종 실행본의 Runtime/Core DLL 바이트 동일을 확인하여 같은 성공검사를 반복하지 않았다.
- 제작자 제출 당시 자체 PASS 표기는 아래 중앙 CTO 독립 판정으로 대체한다. **최종 RETOUCH 기술 통합이며 6항목 전체·보스 리마스터·AAA 완성 PASS가 아니다.**

| 요청 | 최종 직접 확인 | 비교 이미지(1600×900 원본을 좌우 배치) |
|---|---|---|
| 거대한 붉은 빛줄기 | 시야를 덮던 띠·끝 사각면 제거, 약한 광원 흔적만 남음 | I:/EXODUSER-Storage/unity-visual/compare_01_빛줄기.png |
| 피격 붉은 막 | 지형·캐릭터가 읽히는 약한 반응. Core 초기.25×색.25=.0625 | I:/EXODUSER-Storage/unity-visual/compare_02_피격막.png |
| 작은 캐릭터 | 웹과 유사한 원본 픽셀 높이로 복원. 카메라 H는 실제900 | I:/EXODUSER-Storage/unity-visual/compare_03_카메라.png |
| 평평한 분홍 바닥 | 기존 피부 컬러맵 주름·혈관과 냉한 회색 톤 복원, 잘못된 알파 광택 제거 | I:/EXODUSER-Storage/unity-visual/compare_04_피부바닥.png |
| 보스 바닥·문자 겹침 | 토양 경계 완화, 실제 드루이드 몸 경계에 글자0, 피해·상태 문자 공유 배치 | I:/EXODUSER-Storage/unity-visual/compare_05_보스문자.png |
| 클리어 경계·작은 글자 | 검은 계단 단절 제거, 제목21px·결과폭368px·버튼하단80px | I:/EXODUSER-Storage/unity-visual/compare_06_클리어.png |

웹은 정확 game.html 블롭을 별도 서버로 읽고 상태를 고정해 캡처했다. 페이지오류0·사용자창0, 캡처 실행 ee73ec65/실제 보스AI 34e22765. 이는 실제 OS 입력 종단 검수가 아니다. 보스 AI 프레임·레벨·통계·방향/모션 프레임이 완전히 같다는 주장은 하지 않는다. 보스 바닥과 글자·실루엣 가림, 결과 글자 크기/외곽을 비교하는 근거다.

### MAP PRODUCTION REPORT

| 구분 | 이번 범위와 판정 |
|---|---|
| STAGE | CH1-1 RM-1 시작~R2 및 기존 드루이드 아레나/출구 표현 |
| MASTER | 기존 실루엣·구역·주 경로·곁공간 유지. 새 맵 설계0 |
| OUTER MASS | 좌/우/상/남 덩어리·큰 구멍 재설계0. 기존 둥치 반복 실루엣은 맵 담당 재작업 |
| LARGE | 기존 웹 피부 컬러맵·기존 메시 사용. 새 합성/실루엣 제작0·새 충돌 덮침0 |
| MEDIUM | 기존 연결 유지. 외곽 중간 연결의 전체 품질은 별도 미완성 |
| GROUND | 기존 높이 전후 동일. 컬러맵 주름/normal·매끄러움.08·광원 연결 수정, 오염·혈관 원본 유지 |
| PLAYABLE | 넓은 전투공간·이동/휴식/위협 공간·Core 불변. M1 전투23/23, 보스 문자 가림 개선 |
| LANDMARK | 주/보조/세부 랜드마크 변경0·전체 리모델 판정 대상 아님 |
| CAMERA QA | START/EARLY는03-move, ARENA는11a, EXIT는13 캡처 직접 확인. SIDE L/R·LANDMARK·LATE 전체 맵 독립 시각 검수는 미실행, RM-INT start/mid/north/east 보조 증거 |
| TECH QA | 자연 보스 게이트/출구 M1통과·Core 충돌/전투 기록 동일. 웹 pageerror0. 404는 전수 검증 아님. 아레나 계단 seam 해소. UPM/로딩 성공. 성능 수치는 이번 최적화 PASS로 주장하지 않음 |
| FILES | 자기 시각 코드·피부 입력·관련 docs만 반영. 자동 임포트450파일은 I:에 SHA 보존 후 현재HEAD 바이트 복구. tools/guard.baseline.json·미추적 meta는 별도 보존 |
| GIT | 정확경로 커밋·비강제push. 지정된 동일 담당이 후보273773008을 unity/main에 반영하고 일반 바로가기를 검증 exe로 연결, 아래 최종 인수 근거 참조 |
| VISUAL VERDICT | 중앙 CTO 독립 판정 RETOUCH. 붉은 띠·피격 알파·피부 주름·계단 단절의 제한 개선만 인수, 6항목 전체 PASS 아님 |
| NEXT PASS | 전투표현/UI: 보스 문자 확산·대비 및 클리어 통계·문구·LV/SP 겹침. 맵: 외곽 조형·지면 접합. Mac 소유자: 소스 반영·실행 검수 |

최종 영수증은 `I:/EXODUSER-Storage/unity-visual/ntfs-20261029/최종-검수영수증.json`. `COMMON_RULES.md`의 지정 unity-integrator 제한 때문에 시각 담당의 직접 unity/main push/바로가기 교체는0이다. 구 update_unity_latest.ps1는 직접 Unity 실행·이전 빌드 삭제·구 E 경로가 포함돼 사용하지 않았다. 인계서에 허용된 대체 경로로 검증된 exe를 기존 바로가기 백업 후 연결하는 구체 절차를 준비한다. 기존 사용자 실행본·세이브·창은 보존한다.


## 2026-10-29 지정 통합 최종 인수 — RETOUCH 기술 반영

작업ID `unity-ntfs-visual-reviewed-integration-20261029T140030Z`. 중앙 Codex CTO가 기존 NTFS 담당을 이 한 건의 unity-integrator로 지정했다. 같은 G 작업본·세션에서 수행했으며 새 팀/작업본/CLI writer를 만들지 않았다.

| 경계 | 최종 결과·근거 |
|---|---|
| 소스/원격 | expected unity/main13c23929eefa1780334935af2c17ba0802d72965를 fetch·원격조회·조상검사 후 정확 후보273773008115698a005138fa4ff741a3cc1d8d17로 비강제 fast-forward 반영. 원격 SHA 동일 확인. 다른 대기 Mac/runner/보스 후보 추가0 |
| 빌드입력 | e9dc9700a96613f316f0ea9e0ebff771b3cd000f와 후보의 unity tree1f77e160a60a93317d24b24998095a90935fc2cd 동일. 후속은 검수문서만, Unity 입력 변경0 |
| 기존 실행 증거 | Win 빌드8e05c001 컴파일0/빌드오류0, Player1dbb47b3 M1 23/23·창0·잔여0·USER_SAVE0, RM-INT2D/3D1800틱·180기록 전체동일/해시11640a5da4a88c94. 기존 oracle 재사용과 새검사 구분 유지. 성공 빌드/M1/oracle/웹 검수 반복0 |
| 실행파일 | I:/EXODUSER-Storage/unity-visual/ntfs-20261029/accepted-build/EXODUSER-Unity.exe, SHA256 9806abde4a406ed68647e9505852c49f6aa72a372f4f084e2aa2821affea57a2 재대조 |
| 일반 바로가기 | 바탕화면 지옥의 길 (Unity).lnk만 위 exe로 연결. 인자 -force-d3d11 --remodel3d, 시작폴더 accepted-build, 아이콘 같은exe,0. 저장 후 네 속성·해시·반영시 원격273773008 재조회 |
| 보존 | 일반 바로가기 변경전 사본은 원래와 동일 SHA c2e22c41f88f6089e9270db8ce610757d7907cfe2f26ec80cd34676716900ebb. 미리보기 바로가기 SHA ac9a0cf88cee2739e33c195ed84cd361daf079b9ee529cacc092f9254e4560d0 전후동일. 구 실행본·unity-latest 폴더·사용자 게임/세이브·양쪽guard·MP4원본/임포트사본·oldI·과거실패 기록 보존 |
| 작업 제외 | 자동 사용자앱 실행0, Unity 새시작0, 구 updater 사용0, 외부배포/Steam/SetLive0, 비용/삭제/OS·신뢰·예약설정 변경0, CTO_STATE 쓰기0 |
| 공백 예외 | root의 전체 diff --check는 normal.png.meta의 Unity 생성 빈 scalar7행 trailing whitespace 때문에 status2. root-intake-cosmetic-exception.json의 제한 검증exit0·의미영향없음 예외를 이 단위에서 인수. 전체 diff-check PASS로 기록하지 않음, 원본/검사설정/빌드 변경0 |

### 중앙 CTO 독립 시각 판정 — 최종 RETOUCH

root가 compare_04/02/05/06과 accepted-m1/caps의03-move·11a-druid-volley·13-stage-clear를 실제1600×900로 직접 확인했다. 거대한 붉은 띠 제거·피격 알파 계약·피부 주름 복원·검은 계단 단절 해소만 제한 범위에서 인수했다. **회귀 없는 기존 기술 수정의 분리 가능한 RETOUCH 통합**이며 6항목 전체·보스 리마스터·AAA 완성 PASS가 아니다. 신규 FAIL 보스 아트 채택0. 앞선 제작자 자체 PASS 표기는 이 독립 판정으로 대체한다.

| 남은 결함 | 담당·다음 실제 검수 대상 |
|---|---|
| 보스 문자 좌우 열의 과도한 확산·낮은 색 대비 | Unity 전투표현/UI 담당: 실제 밀집 보스전에서 배치폭·대비 수정 후 같은 시점1x 비교 |
| 반복 외곽 둥치·지면 접합 | 맵 담당: 외곽 큰형태/중간연결/접지 리모델 후 실제 게임 카메라·전투 가독성 검수 |
| 클리어 미이식 통계·하단 희미한 문구·상단 LV/SP 겹침 | Unity UI 담당: 실제 상태 연결·대비·겹침 수정 후 클리어1x 검수 |

이 단위의 source 통합과 로컬 바로가기 연결은 완료했다. 손 조작 Player 종단검수·Mac 반영/실행·전체 맵/보스 리마스터 완성은 별도이며 이번 증거로 완료 처리하지 않는다. MAP PRODUCTION REPORT의 최종 VISUAL VERDICT는 **RETOUCH**다. 위 남은 결함은 후속 담당의 다음 패스이며 이 한 건 결과 제출 후 대기한다.

실제 근거: I:/EXODUSER-Storage/unity-visual/ntfs-20261029의 지정통합-선행확인.json, 지정통합-소스반영.json, 통합-바로가기-선행확인.json, shortcut-after.json, root-intake-cosmetic-exception.json, 지정통합-최종영수증.json. 제품소스 반영 SHA와 그 뒤 문서 전용 SHA를 최종 영수증에서 분리한다.


## 2026-10-29 보스 문자 근거리 재작업 후보

작업ID unity-boss-text-locality-rework-20261029T142030Z, 기존 private 브랜치·G NTFS 작업본 유지. 이번 소유 범위는 NativeFloatingTextLayout/NativeGame의 피해 표시/NativeRevive의 상태 표시·최소검사이며 Core·피해량·AI·Q/E규칙·저장·모델·맵·카메라·결과화면은 변경0이다. 이전 통합 권한은 종료, 이번은 제작 후보 제출이다.

### 원인·실패 재현

기존 Place는 숫자부터 배치한 뒤 top~120 사이 행과 좌우 열을 최대512회 전역 탐색했다. 실제 보스 예약상자(760,90,400,500)에서 원점(960,450), 폭90/높이32 문자의 표시중심이294.4px 떨어지는 실패를 재현했다. 프레임마다 전역 탐색하고 상태 수명에 최소.9초를 적용해 M1의 가속 틱에서 예고가 긴 열로 누적됐다.

기존11a는 M1Check의 실제23상태 AI 경로이나 매30틱yield/null로 가속되며, 매틱 플레이어HP/쉴드 회복·420틱뒤무적·170틱마다HurtEnemy로 보스HP단계 진행을 보조한다. 별도 문자 대량 직접주입은0이며 art-a의8발/11c의pool 수동주입과 구분한다. 싸움 전체86피격·254발/53드롭 로그는 있으나11a 한장의 사건원장/자연대하네스피해 비율은 없어 미확정이다. 이 고밀도 한장을 자연플레이 전체로 보지 않는다.

### 현행 표현 계약

| 항목 | 값·동작 |
|---|---|
| 좌표·반경 | 1920×1080 논리좌표, 표시중심-사건원점 거리: 일반숫자/반복정보≤144, 일반예고≤176, 필수경고≤208. 1600×900 실제화면에서는 각각120/146.7/173.3px. 사건원점은 ToGUI(원래 이벤트x,y), 기존 피해만의 위100px 이동 제거 |
| 탐색 | 기존 전역 rows/column 제거. 원점 위/아래30, 반경36단계의8방향, 예약몸의가장가까운변과 그 아래 x±60/120 등 유한한 근거리 후보만. 몸/앞선글자2px여백과 충돌하거나 반경을 넘으면 원래수명내 다음프레임 대기, 먼열로 내보내지 않음 |
| 앵커 안정 | 메시지ID별 상대오프셋 캐시, 유효하면 같은오프셋으로 이동. 움직인몸/상위경고가 침범할 때만 근거리 재배치. 캐시 미사용2초 뒤 회수 |
| HUD·크기 | 기본 화면 x8~1912, y128~864. 2026-10-31 실제 실행은 ScreenInDesign 좌우+8/−8로 확장하고 미니맵·자원·우상단목표·실습·일반알림의 실제 가장자리 Rect를 역변환해 예약. 실제 드루이드 SpriteRenderer bounds 예약. 글자상자 최대312×68, 긴문구는최대2줄. 숫자/일반24, 필수26, 굵게·검정외곽2px |
| 순서 | 필수경고3→수치2→일반예고1→반복정보0. 같은등급 숫자는집계건수많은것이먼저, 나머지는최근사건먼저. 파괴/패링/PARRY/Q!/E!/사망/부활/구울/쓰러/집중/보호막 및 대응영문을3으로 분류. 그밖의느낌표문구1, 나머지0 |
| 집계 | 같은유형/색/부호채널, 사건x차≤96/y차≤72, 마지막유입으로부터.18초 안의 숫자는합계와 ×횟수로 표시. 반복동일문구도 ×횟수. 원점은건수가중평균. 예:12×40→480 ×40, 실제수치총합·Core 이벤트는불변 |
| 예고 교체 | 같은근거리의 일반예고는현재2개, 반복정보는현재1개. 새예고가오면오래된동급만교체하며 필수경고·숫자는그교체대상아님. 급한경고공간우선, 혼잡시는낮은등급만지역내대기 |
| 시간 | ReviveText.Life/60초 그대로, 미지정은35/60초. 기존최소.9초 제거. 적HP/쉴드피해는기존1초. 합쳐진그룹은마지막사건의표시수명을최대입력수명으로유지 |
| 대비 | 웹일반문구흰색·검정외곽 계약 적용. 필수문구 (1,.96,.78), 숫자원색을흰색으로.55보간하여채널색유지·밝기보강. 웹처럼마지막20%시간만알파감쇠(앞80%불투명) |
| 검사 | 수정전거리208상한실패(실측294.4), 수정후38검사통과: 합480/40건·우선배치·일반예고2개·경고보존·숫자전체숨김방지·유형별반경·비중첩·HUD·이동오프셋·화면밖끌어옴방지·28f수명·반복횟수 |

### 실제 후보 화면 검수 계획

선택플래그 --unity-boss-text-smoke는 명시적 --unity-qa-sandbox/-output/--unity-boss-direct 0 없이는종료한다. 일반실행·기존M1은이경로를실행하지않는다. 기존프리뷰진입 API로격리캐릭터없이보스장에직접들어가 실제AI·StepInput 공격을약60틱/초 진행한다. 플레이어HP/쉴드매틱회복은관찰보조이며 손조작·자연입장검수아님을별도표시한다. 문자주입0인실제AI저밀도(1~2개)/중밀도(3개이상)와, 그뒤분리한합성고밀도(12피해40건+예고10+Q/쉴드파괴2)를별도캡처한다. 합성뒤12틱오른쪽실제이동입력으로앵커변화를검수한다. 전은기존accepted11a1600×900을재사용, 후는같은해상도캡처와사건/표시거리JSON을함께제출한다. 이번단위는새후보빌드·표적캡처가필요하며 기존Core oracle/이전빌드/M1/웹성공검사는반복하지않는다.

후보의Unity컴파일·GPU·실화면·root독립검수는 아직미검증이다. 유한배치검사통과로시각PASS를대신하지않는다. 산출물: I:/EXODUSER-Storage/unity-visual/boss-text-20261029/.


### 첫 실화면 재작업과 최종 우선순위 수정

후보05bf6ec0c의새빌드6572667c는컴파일0/빌드오류0, 표적Player4cc2be4a 종료0·창0·잔여0·USER_SAVE0. 실제AI저밀도2개/중밀도4개는거리103.8~137.7 안에서읽혔으나, 별도합성고밀도에서일반예고2개가숫자보다먼저공간을차지해480 ×40이대기했다. 이화면을완료로채택하지않는다. 실제GPU상자치수로새실패검사를추가해한번실패를재현한뒤, 필수3→수치2→일반예고1→반복0으로유형순서를수정했다. 같은등급수치는집계건수우선으로하여이동중새159단발이40건집계를밀어내지않는다. 반경/글자크기/탐색횟수만확대한수정아님. 실제치수수치보장·신규단발경쟁까지최종40검사통과, 다음후보새빌드·실화면으로별도검수한다. 처음캡처·실패로그는보존한다.


### 최종 후보 표적 실행·1x 제작자 판정

- 실제빌드입력 `21a66acad50c4e42d7527887ec41310d3af727c8`, private브랜치 codex/pc-unity-visual-ntfs-20261029. 새Win64빌드37de2a1e: Unity6000.6.7f1·컴파일0·빌드오류0·셰이더오류0. 새표적Player5c8dcdaf: D3D11/RX9070XT·정상종료0·창0·잔여0·USER_SAVE0. 이번은문자전투QA이며 전체M1새PASS라고부르지않는다.
- 의미있는검사40통과. 기존Core tree23ae5783080d45cb40804b4b59b1e9b8f7811244 동일, 기존oracle재사용이며 새실행0. 이전성공빌드/M1/웹검수 반복0. 첫후보의고밀도수치대기실패는보존하고새소스때문에두번째빌드/표적캡처를실행했다.

| 실제 장면 | 표시/대기 | 사건-표시중심 최대거리(논리px) | 제작자1x 관찰 |
|---|---|---|---|
| 자연AI 저밀도 | 2/0 |153.85(일반예고), 숫자91.75 | 가속M1의긴좌우열이없고연격예고·피해집계가사건근처에서읽힘 |
| 자연AI 중밀도 |4/0|140.67, 숫자113.20/128.72| Q경고·쉴드피해합계·적피해·속박문구를몸밖에서읽음. 문자는흰외곽과밝은채널색, 발사체궤도구분유지 |
| 별도합성 고밀도 |5/0|154.34(일반예고), 집계143.31| Q/쉴드파괴와480 ×40(40건합계480)이함께표시. 일반예고는현재2개. 숫자전부숨김이나먼열이동0 |
| 합성사건+12틱이동 |6/0|167.14(일반예고), 수치143.31/114.72| 집계480 ×40 유지·새실제잔여공격159도표시. Q·쉴드파괴·집계의상대오프셋전후차0/0/0.000061논리px. 신규수치가우선배정되며일반예고는한번재배치됨 |

이동프레임의159는고밀도주입40건과별개의잔여실제공격사건이다. 이프레임을순수합성40건만의결과로세지않는다. 거리원점은그룹사건위치(숫자집계의경우건수가중평균)다. 위프레임과검사에서몸예약/HUD 경계·숫자/문자비중첩을확인했으나모든공격/언어/해상도/장시간플레이를검증한것은아니다.

**제작자 판정: 국소목표(긴전역열·낮은대비·고밀도수치소실) 개선을1x에서확인한 후보. 최종등급은 RETOUCH 유지, root독립검수대기.** 보스리마스터·전체아트/게임PASS가아니며문자개선의반영완료도아니다. 이번승인은제작후보제출만이므로 unity/main push·바로가기교체·다른큐인수0. 이번한건제출뒤대기한다.

| 근거 | 경로(I:/EXODUSER-Storage/unity-visual/boss-text-20261029 기준) |
|---|---|
| 기존 전 | ../ntfs-20261029/accepted-m1/caps/11a-druid-volley.png |
| 같은해상도 전후 | 전후_natural-low.png, 전후_natural-medium.png, 전후_synthetic-high.png (좌우각1600×900, 이벤트시점/밀도차이를표제에명시) |
| 실제1x 원본·잘라보기 | candidate2-caps/*.png, 1x_natural-medium.png, 1x_synthetic-high.png, 1x_synthetic-moving.png |
| 사건표시기록 | candidate2-caps/text-review.json, 실화면-거리-앵커검수.json |
| 검사·실패·보존 | 의미있는-검사결과.json, 원인-분리.json, source-before/, candidate-caps/첫실화면, 자동임포트-보존복구.json |
| 최종영수증 | 후보-제출영수증.json |

Unity자동임포트450파일은이번I보관사본·SHA대조후prebuild입력/현재HEAD바이트로복구했고guard바이트전후동일·INDEX비어있음을확인한다. normal.png.meta 생성빈scalar7공백예외는수정하지않고원인이력유지, 전체diff-check PASS를주장하지않는다. 사용자실행본/세이브·oldI·원본MP4/자동메타·과거실패카운터·다른WIP 보존. 새팀/writer/worktree·비용·삭제·reset/stash/force·권한/신뢰/OS설정·배포·서버재시작·CTO_STATE쓰기0.


## 2026-10-30 보스 문자 지정 통합·변경 Runtime 최초 M1 인수

작업ID `unity-boss-text-reviewed-gate-integration-20261030T000030KST`. 중앙 CTO가 기존 동일NTFS 담당을 이한건 unity-integrator로지정했다. 위제작단위의제출/통합대기기록은그당시상태이며, 현재게이트는아래로갱신한다. 새세션/작업본/CLI writer 추가0.

| 게이트 | 최종 확인 |
|---|---|
| 정확한 소스 | expected unity/main14bcb6eff2b3770dfa8d8da5c1d3e6b84f607120을fetch/원격조회/조상검사하고 제품후보f4d8af17bd80f70dc846ea3cb281d4ba99bf6fd1로정상비강제fast-forward. 다른Mac/runner/보스후보추가0 |
| 빌드 입력 | 실제빌드입력21a66acad50c4e42d7527887ec41310d3af727c8·후보f4의Unity tree9f61da18c54056f7674b30cfd78a221cbcb201ff 동일. 후속은검수문서만이며최종원격SHA는최종영수증에서분리 |
| 새 필수 회귀 | 동일candidate2-build의변경Runtime에대한최초전체M1 b3e441ca,23/23·첫막힘없음·정상종료0·D3D11/RX9070XT·창0·잔여0·USER_SAVE0. 실제실행경로는아래candidate2-build. 단계별기록은통합-새M1-단계영수증.json. 이전accepted M1을이번후보에소급하지않음 |
| 실행 전 조건 | 15:05:37Z Unity/UPM/Player0·잠금없음·큐/티켓0·커밋여유26.67GiB·G/E NTFS·E여유1267025588224바이트. 프로젝트/Library G·DOTNET/UPM E·출력I. 이조회값은그시점값이며향후예약보장아님 |
| 후보 증거 묶음 | I:/EXODUSER-Storage/unity-visual/boss-text-20261029/candidate2-build/EXODUSER-Unity.exe + 빌드37de2a1e영수증오류0 + Unity트리 + Runtime DLL a66d17270d9bdb6db740bd1ca6c6e5abf6e098eabd7ad2206d7cf56102d6b5a1 + Core DLL e6d89a07efae6882c3062ac6b9d9fe1d8acdb00340d3a671ba175282a2ab65c5. Launcher exe의9806abde해시는이전과같으므로단독후보증거로쓰지않음 |
| 일반 바로가기 | 기존14b의accepted-build target/args/workdir/icon일치확인후고유백업을만들고 candidate2-build/EXODUSER-Unity.exe, 인자 -force-d3d11 --remodel3d, 시작candidate2-build, 아이콘같은exe,0으로연결. 저장후네속성·Managed해시·원격f4 readback일치 |
| 고유 백업·보존 | boss-text-20261029/지옥의 길 (Unity)-보스문자통합전-20261030T000030KST.lnk, SHA b735d94faefaee76170d8f617b81640fede0bc15cb81a8c5c307f10153b7cc6e. 미리보기SHA ac9a0cf88cee2739e33c195ed84cd361daf079b9ee529cacc092f9254e4560d0 전후동일. accepted-build/구unity-latest·사용자창/세이브·oldI/양쪽guard·MP4원본/자동사본·과거실패/7공백예외보존 |
| 반복/제외 | 새빌드0·기통과표적캡처/40검사/Coreoracle/웹QA반복0. 이번새M1은변경후보최초통합회귀로서이전성공검사의동일바이트재실행이아님. 사용자앱자동실행/구updater/이전빌드삭제/비용/권한·신뢰·OS예약/외부배포·Steam·SetLive/자동서버재시작/CTO_STATE쓰기0 |

### root 독립 시각 인수 — RETOUCH

root가 candidate2-caps/natural-medium.png·synthetic-high.png·synthetic-moving.png를실제1600×900로직접봤다. 긴전역열제거·480 ×40(40건합480)+Q/쉴드파괴동시표시·가까운사건위치·대비·이동앵커유지의국소개선을인수했다. 문자는여전히보스발아래작은묶음으로모이며중요도별크기/시각계층의추가다듬기가남아있다. **최종 RETOUCH 기술 통합, 전체맵/보스리마스터/AAA PASS0·신규FAIL아트채택0**이다.

기존전은가속M1, 후는직접보스입장·생존보조·StepInput 실제AI/분리한합성이다. 같은사건전후·손조작E2E로부르지않는다. 새전체M1통과도이시각판정을PASS로올리지않는다. 기존05후보고밀도숫자대기실패→실제치수실패재현→유형우선순위수정→40검사/표적전투성공이력은그대로보존한다.

최종소스통합·일반바로가기연결·문서인계만완료하고이한건결과제출뒤대기한다. 손조작/장시간/전언어·전체리모델·Mac반영/실행은별도미검증이다. 근거는동일boss-text-20261029폴더의 통합-소스선행확인.json, 통합-새M1-단계영수증.json, 통합-원격제품반영.json, 통합-바로가기-변경전/후.json, 통합-최종연결확인.json, 통합-최종영수증.json. 전체기존7공백예외를포함한diff-check PASS를주장하지않으며이번문서경로검사와구분한다.

## 2026-10-30 클리어 표시 재작업 제작 후보

작업ID `unity-stageclear-presentation-rework-20261030T002030KST`. 정확한 제품 후보/실제 빌드 입력 `2376c58584281c4fa74352da75f45311bddbd466`, Unity tree `02a7af43c255640ce5cf547e54b33956946762bd`. A22 SSOT의 현행 데이터·배치·언어/진단·최종 영수증을 따른다. 제목/실제 시간·처치/실제SP/측정통계/저장·로비 행동을 한 패널로 정리하고 완료 중 HUD/LV/SP/타이머 중첩과 내부 미이식/중복줄을 제거했다. Core/점수공식/경제/저장/맵·카메라·보스아트 불변.

새빌드 d8684b11 오류0, 최종표적 Player143c1383 D3D11/RX9070XT·170/170·32프레임·창0/잔여0/USER_SAVE0. 실제 Core 이벤트는 QA 직접진입/생존보조/강제처치로 1/168·16초·SP10, 별도137/168·88초는 기존M1확인값복사 화면이다. 자연M1/손조작/같은사건 전후 아님. 1600원본과960작은창·긴언어1x직접판정은 **클리어 국소개선 확인 / 전체RETOUCH·root독립검수대기**. 새 Runtime 전체M1은 미실행, 이전23/23 소급0. 원본웹/기통과Coreoracle/M1 반복0. 기존 첫 QA5실패/컴파일원인·7공백예외·보스문자추가다듬기/전체리마스터/외곽접합 잔여를 보존한다. 최종 비교·영수증: `I:/EXODUSER-Storage/unity-visual/stageclear-20261030/최종_전후_같은표시값_1600.png`, `후보-제출영수증.json`. 이번 private 제출만, 통합/바로가기갱신0.

## 2026-10-30 클리어 표시 지정 통합 게이트

중앙 root가 제품후보 `5f2996dccdd7d5b4dea732ea71d224db1970447a`의 소스·170검사·143c1383·1600/960/긴번역1x를 독립 인수했다. root 판정은 **기술 RETOUCH**: 중복/미이식표시·버튼좌표 개선 인수, 패널재질/완성도·30영문폴백·점수/등급 미구현 잔여. 보스리마스터/문자계층/외곽접합 등 전체RETOUCH 유지. 실제빌드입력2376c5858/Unity tree02a7af43 불변, 정확candidate3-build Runtime89440bab/Coree6d89a07을 대조했다.

이번 변경Runtime 최초전체M1 **47961226 23/23**·D3D11 RX9070XT·정상종료0·창0/잔여0/USER_SAVE0, 실제13은137/168·88초·지역4·SP10. Simulation.Tick/API 가속 하네스로 손조작E2E 아님. 이전M1소급/기통과표적QA·번역·빌드/Coreoracle 반복0. expected unity/main a2f5058652a91b10ca1357f4a9c39db99a0cbadf를 다시 대조한 이번 지정integrator만 후보+필요docs 비강제 반영·일반바로가기 고유백업후candidate3 연결을 진행한다. 최종소스/연결readback은 `I:/EXODUSER-Storage/unity-visual/stageclear-20261030/통합-최종영수증.json`, A22의 지정통합절과 `통합-새M1-단계영수증.json`에 연결. root 수신의 failed키 혼동은 실제 failures=0/170 확인으로 정정, 제품실패/카운터증가0. 기존실패·7공백예외/WIP·guard·oldI·MP4/구실행본·세이브 보존, 전체PASS0.

## 2026-10-30 클리어 재질·프레임 마감 제작 후보

기존원화 forge/window_base의바깥금속모서리/마모테와inventory/iron_480본문을직접열고A22의WORK_QUALITY§1.1기획을먼저기록했다. 첫사전실물의불투명사각모서리/본문입자경쟁을반려하고2px행UV클립·균일축소/한구간crop·본문iron단일cover로수정한두번째1x를확인했다. 전체forge/기사/원형문양/기능칸내용·반복tile·새이미지생성0. 본문560×546/원화외곽592×578, screen scale=min(1,(W-32)/592,(H-32)/578), 시간→처치→SP→로비·실제데이터/콜백유지. 원화/다른창byte불변. 세부UV/명암/소유/탈락조건/새최소캡처는A22최신절. 이단위는private제작후보만, unity/main/바로가기교체0·전체RETOUCH유지. I산출물 `I:/EXODUSER-Storage/unity-visual/stageclear-material-20261030/`.

- 첫 재질native5512bc8f는35경계검사통과라도960모서리가로줄무늬로시각반려. 2px행→1.381117화면px의소수배율에서공유픽셀경계/UV역보정경로로한번수정하고1240연속성검사통과. 원화/색/코너크기/행개수만바꾸는변형아님. 다음실화면에서같은결함이면HOLD. 기존실패/프레임보존, 최종시각판정은후속새실행영수증과구분.

- 최종재질후보 빌드입력881c1e17737ceefd1e785c3918e58411cb2bbeaf/Unity tree8c9c45ac9b0d63f2027b68c617a70cf4b245a41f, 빌드5b891d6a오류0·새Runtime d13a3619ddf0cd55decf3e5856ec871ca3af271d93e51818ce8b85eb7045dcc8. 최종193a42a4는같은값1/168·16초·SP10의1600/960표시전용11/11·창0/잔여0/USER_SAVE0. 직전수정후9e671e00의재질/7언어35검사는별도Runtime/동일3렌더소스blob근거로구분. 원화PNG/meta전후byte동일·450임포트보존. 1x직접판정은원화재질/마감국소개선확인·전체RETOUCH/root독립검수대기, 새M1미실행/현재47961226소급0. 후보-제출영수증.json과전후_동일값_1600.png/960.png·1x_프레임_전후.png 참조. 이번private만/main·바로가기0.

## 2026-10-30 사용자 플레이 결함 수정 최종 실행 증거

| 항목 | 실제 검증 범위와 결과 |
|---|---|
| 코드 후보 | ef75f883e03fdc355392ff853bde4813e8412053, Core 트리546cad24a1e4f2988fb1a268ba35a43b67a90d19 유지 |
| 정식 빌드 | Unity6000.6.7f1 Win64, 6bcf428c, 컴파일 오류0·종료0 |
| 전 입력 | 16c7536f, LMB/RMB/Shift/E/Q/Ctrl/Space/1~4/F/Z/이동+Space 14사례·44검사 통과, 1190틱·20fps401장 |
| 표현/조준 | 조준오차 최대0.021356374px, 투사체 표현 위치오차 최대2.980232238e-8u, 구르기175px·중복스킬0 |
| M1 | 72cd32e1, 23단계 전부ok·firstBlocked 없음, D3D11 RX9070XT, exit0 |
| 실행 안전 | 최종 두 Player batch 실행 창0·잔여0·사용자 세이브 변경0. 임의 OS 손조작/전체 자연 플레이의 증거는 아님 |
| 촬영 방식 | 실제 FixedUpdate/Input System/Core/실제 카메라 렌더. batch RT는 HUD 제외. 자동 검사 강제 진행은 별도 표기 |
| 원본 대조 | 스킬8416·검기93·사슬/패링187165검사 불일치0. 최신H5 관련24섹션 대조만 확인, 미이식 기동스킬까지 최신 전체동등으로 확대하지 않음 |
| 산출물 | I:/EXODUSER-Storage/demo-art/playtest-fix/final-player, final-m1, final-build, oracles |

기술 범위는 입력·스킬 이동·누적 billboard·공통 카메라 설정 수정이다. 승인 A2의 숲/목교/재질/조명 전체 환경 제작은 이 후보에 포함되지 않으며 실제 현재 환경은 여전히 차이가 크다. 카메라/영웅 가독성 개선은 RETOUCH, 전체 A2 아트 PASS 아님. 기존 hidden Player 종료 지연은 같은 경로 두 번 확인 후 중단했으며 정상 종료가 검증된 공식 batch 경로만 최종 영수증에 사용했다.


## 웹/Unity 전수 비교 최종 자료

- 웹은 고정 origin/main18aef1218의 실제 update/draw와 실제 브라우저 키/마우스 이벤트로1190틱·20fps401장. 제품 소스 수정0, 시작결계·대사·적/자동석궁만 QA상태로 격리했다. API는 QA메모리응답이며 실제백엔드·저장 검수 아님.
- 검기224px·악의구410px·사슬700px·구르기175px는 웹/Unity 일치. Q는sBlock, E는sDraw/sBash, Ctrl얼음보주·Space강타·1가시덫/F회복장판·미배정2~4/Z를 나란히 직접 확인했다.
- 자료: I:/EXODUSER-Storage/demo-art/playtest-fix/스킬-전수-비교.html (원본1600×900,1x·20fps슬라이더), 웹-Unity-14입력-연속비교.mp4, 전수-비교-축소목록.png, 악의구-수정전후-연속비교.png, A2-현재-동일크기.png, A2-영웅-1x.png. 축소목록만으로1x판정을 대체하지 않았다.
- 실제 웹pageerror0. 정적 URL18개(기존 UI이미지3·글꼴2·음원13)가 읽기용G자산경로에 없어404기록; 전체웹자산로딩 PASS로 주장하지 않는다. 스킬 원본 이미지와 궤적은 비교 자료에 포함됐다.
- 웹 첫 촬영482d71ff는240초 제한종료, 재촬영b533b4f8는14입력/1190틱/401장·JSON저장 완료 후 browser.close 지연. 격리프로필로 소유 확인한 Chrome44840/56660·촬영Node27320만 종료요청했다. Chrome HasExited=true 확인. 정상종료 PASS로 세지 않으며 실행기 잔류 감지의 WMI 사후목록과 실제HasExited를 구분한다. 같은 촬영 경로 추가 반복0.
- 카메라/영웅 가독성 RETOUCH. A2의3D영웅·숲/목교 질량·재질·조명과 현재화면의 차이는 남아 있다. Q/E의 잔광·링크 및 장판표현도 원본과 조형/잔상 차이가 있어 전체 VFX아트 PASS가 아니다. 기존 맵/캐릭터/VFX 담당의 후속범위다.

영상 순서(초): LMB0~1.35, RMB1.35~2.70, Shift2.70~4.05, E4.05~5.40, Q5.40~6.75, Ctrl6.75~9.25, Space9.25~10.60, 1키10.60~11.95, 2키11.95~13.30, 3키13.30~14.65, 4키14.65~16.00, F16.00~17.35, Z17.35~18.70, 구르기18.70~20.05. 왼쪽웹/오른쪽Unity, 각1600×900.

웹 실행기 b533b4f8 최종 영수증은 ok=false/exit=-1/창0/사용자세이브변경0, 잔류1(PID56288)을 실행기가 정리했다. 해당PID와 실행기5172는 최종조회에서없음, 두Chrome은HasExited=true다. 두임시프로필은 chrome_debug.log EBUSY로 완전삭제 미완료이며 browser-profile-cleanup.json에 정확경로를 남겼다. 사용자앱/브라우저·시스템설정 변경0. 영상은3200×900·20fps·401프레임·20.05초로 인코딩/추출프레임 직접확인 완료.
# 2026-11-03 06:03 C17 실행 차단 상태

05:10/05:15의 7항목 구현과 Runtime/Editor 정적 컴파일 exit 0까지 확인했다. C17 빌드는 시작됐으나, 이후 I: 결과 파일 읽기에서 10초 타임아웃이 재현됐다. G: 작업본 파일 읽기·작은 상태 파일 저장과 tasklist는 응답했다. 원인은 확정하지 않았다. 당시 자기 Editor PID 38876은 존재했고 별도 Unity PID 29288도 관측돼, 소유권/공용 슬롯 확인 없이 중복 빌드나 다른 프로세스 종료는 하지 않았다.

**C17 빌드 완료·play-smoke·proof-17·영웅 원색·곡선 경계·쐐기 제거·밀도·캠프 빛은 미검증이다. 바로가기 교체는 실행하지 않았다(C10 유지).** 공용 실행기/예약은 I: 접근 복구 후 재확인한다. 자동 생성 파일 복원은 자기 Editor 종료 확인 이후에만 한다. 현 상태 영수증은 작업본 `unity/Temp/map25d-tools/c17-execution-status.md`에 임시 보존했다. I: REPORT 저장은 응답을 확인하지 못했다.

앞의 C17 수치는 구현 계약이며 실제 Player PASS를 의미하지 않는다.

