# 전사 실시간 리깅 픽셀 렌더 — 2026-11-03

현재 상태: 21:20 CTO 전달의 Mac39e52fe 시각 PASS(사각면0·망토낱픽셀0·흑철·1px검격), 3840 성능은 동시 Player 오염으로 단독 재측정 대기. 최신공통 aa38bb877 병합·PC컴파일 후 자기브랜치를 CTO 통합용으로 전달하며 기본 sprite를 유지한다.

| 계약 | 코드·수치 |
|---|---|
| 모드 | 기본 sprite 유지. --hero-render=rigpixel 또는 --hero-render rigpixel. 마지막 명시 인자 우선, 부분 일치 없음. 통과 전 기본값 변경 없음 |
| 입력·모션 | 기존 Resources/Characters/Warrior R7, NativeHeroView.Sync → NativeHeroMotion 90 → CapeSpring 100 → NativeRigPixelHero 1000. Core/루트모션/판정/세이브 코드 변경0 |
| 격리·광원 | 기존 모델 layer30만 정사영 RT에 렌더. 최종 메인 카메라에서는30 제외. RT 카메라 그림자는 끄며, 원래 전사 전용 fill/rim은 끄고 같은 월드 위치에서 장면 달빛/캠프 실제광을 셀 셰이더에 적용 |
| RT | ARGB32 Linear, depth24, AA1, Point, Clamp, mip 없음, HDR/후처리 없음. URP17.6 SingleCameraRequest. 정사영 near .05/far24, 카메라 후퇴8u |
| 크기·정수배 | n=max(1,floor(camera.pixelHeight/1080)). 1920/3840×1080 n1. canvas=ceil(5.6/(worldUnitsPerPixel×n)/32)×32, 최소64/최대1024. 범위를 넘기면 기존 sprite 폴백. orthoSize=canvas×worldUnitsPerPixel×n/2 |
| 기준선 | Core가 정한 기존 hero root를 원점으로 사용. 캡처 중심은 view.up×round(.65/(wpp×n))×wpp×n. 최종 발밑은 NativeHd2D.SnapAnchor, 텍셀1개가 화면정수n픽셀. 맵 NativeHd2D/Remodel3D writer 변경0 |
| 명암·테 | floor(saturate(NdotL)×3+.5)/3의4단 셀 명암. normal/specular 맵 미사용, 금속은 넓은 2단 하이라이트만 추가(아래 현행표), alpha mip bias4, 소재팔레트100%/원본RGB0%. 실제광의 최대RGB로1.1/(1+maxRGB) 압축 후4단명암. 표면 Fresnel 윤곽광은 제거하고 실제 달빛 방향의 알파 실루엣 한쪽만 추가. 최종 알파 바깥 4이웃1텍셀 검은 외곽선. 디더링/그레인/노이즈 추가0 |
| 접지 | HD2DContact 셰이더의 별도 .62×.36u 지면 quad, 지면오프셋 .018u. 기존 스프라이트는 RT 첫 성공 뒤에만 숨김. 리소스/투영/렌더 실패 시 모델 숨김+sprite 폴백, 오류1회 |
| 수명 | RT는32텍셀 canvas 구간이 바뀔 때만 재생성. 종료 시 RT·자기 재질 해제와 자신이 바꾼 layer30 카메라 비트만 복원 |
| 제어 동작 검수 | --unity-hero-review --hero-render=rigpixel -review-width 1920 또는3840. 높이1080, 12개 구간 1156틱/2틱당PNG. 기존 fixture 유지하되 rigpixel의 방향 구간은 실제8방향 이동, 공격·피격·사망은 기존 제어 fixture. OS손조작/자연사망 증거가 아님 |
| 일반 입력/성능 | --unity-rigpixel-natural --hero-render=rigpixel -review-width 1920/3840. 실제 일반 FixedUpdate·가상InputSystem, AI/소환/충돌/HP 유지, 12초 중 첫2초 워밍업 제외. screenshot 인코딩 시간만 별도 제외하고 긴 프레임은 포함. 평균fps≥60, Core≥500틱, 이동>100px, 최종앵커≤.71px, 실제RT성공 확인. OS손조작 아님 |
| 비교·합격 | 같은 EXE M1, 1920/3840 실제 Player, 전사3x·10초 무음영상·NRFTW/기존C10 나란히. 발미끄러짐/모자이크/관통/실루엣/점/60fps 핵심FAIL이면 미채택. Editor/정책 테스트로 PASS 선언 금지 |

정책 테스트는 I:/EXODUSER-Storage/codex-takeover/rig-pixel/tests/run.ps1: 첫 RED policy 없음, GREEN23/23. Unity 첫 UPM 실패는 자식 ProgramData 환경 보완으로 해결; 64de26cf에서 실제 리그 Humanoid=true, renderer=false/shaders=false의 RED를 확인했다. 같은 검사 중 USER_SAVE changed3이 관측돼 정상 게이트 통과로 세지 않는다. 사용자 세이브를 수정/복원하지 않는다. 이후 실제 실행·시각 판정은 REPORT에 이어 기록한다.

R1 실제 Player 진단: 첫 동작 캡처에서 FDG 화면이 게임을 가린 것을 직접 확인했다. 구형 fixture가 ShowLobby 비동기 전환 직후 SelectPreview/EnterNativeTest를 호출한 것이 원인이다. 해당 실행을 검수 실패로 두고 자기 Player만 종료했다(실행기의 UInt32 종료코드 변환 예외도 별도 기록). R2는 공개 로비 API의 전환 Busy/CinematicEntryPending을 최대30초 대기한 뒤 preview 입장·실제 !lobby.IsBlocking을 필수 확인한다. UI를 강제로 숨기지 않는다. HeroCapture/새 자연검수/rigpixel Shift Playtest에만 이 진입을 적용하고 일반 제품 UI는 변경하지 않는다. Shift는 --unity-playtest-capture -playtest-controls Shift -review-width 1920으로 실제 InputSystem 사슬 이동을 확인한다.

R1 렌더 자체는 실제 M1 24623b09(무창/잔여/USER_SAVE0, exit0)에서 확인했다. 03-move.png와480×432 nearest3x 크롭을 직접 보고 검은 갑옷/내부 반짝임을 시각FAIL로 판정했다. 실제 몸통 ROI(780,435,41,53)의 고립 고휘도점 진단은46개(목표0). R2 대기 빌드는 자기 대기 프로세스56604만 확인 중단했다. R3은 raw PBR색/내부 geometry-Fresnel 대신 소재별큰색면(88%)+원본저주파12%, 4단명암, 알파 실루엣달빛테로 제작 방법을 바꾼다. Iron(.18,.205,.235), Skin(.38,.245,.18), Hair(.022,.018,.016), Cloth/Cape(.16,.033,.028), Leather(.075,.046,.030), Sword/Weapon/Blade(.29,.30,.32), 모두 알파1. ambient최저(.24,.25,.28), diffuse최대1.35. 달빛방향은 실제 Directional 광원을 화면에 투영하며 테색은 moon.color×.08. 합성에서 불투명4이웃≥3·중앙휘도>주변+.045인 고립하이라이트만 제거하고, 4이웃이 모두불투명인1픽셀 알파구멍은 닫는다. 얇은검/연결된망토틈은 보존. 이 수치는 새 실제 Player/3x 검수 전 후보이며 PASS가 아니다.

R3 Hero 98be68d0는 외부실행기 exit0/USER_SAVE0이어도 frames0·hero-review.json 없음으로 검수FAIL이다. 로그는 초기 A2조립15.891초와 return-lobby prepare-timeout(12초), preview entry rejected를 보여준다. exit0을 PASS로 쓰지 않는다. 두 차례 preview 방식 실패 뒤 이 경로를 중단하고 R4부터 검증된 실제 M1 새전사 생성/이야기Skip/연습장종료 경로를 사용한다. 먼저 맵조립완료(최대60초)와.5초 워밍업 후 UI전환을 시작하며, Time.captureDeltaTime=1/60은 실제1-1 진입 후에만 적용한다. 일반 제품 frontend/Core는 변경0.

R3 실제 몸통ROI의 고립고휘도점46→1이며0이 아니고 3x에서 검은 미세셀/암부가 남아 미채택이다. R4는 원형 제작 단계의 표면 법선을 정리한다. 런타임 복제 SkinnedMesh의 모델기준8cm 공간셀·6개 법선방향군·인접27셀 평균(원법선 내적≥.35, 거리제곱 가중)을1회 적용한다. 메시 원래 정점/스킨가중/바인드/UV/토폴로지는 동일하며 자산 원본은 쓰지 않는다. 메시-모델 스케일로8cm를 변환하고 복제 Mesh는 종료 시 해제한다. 색면의 최종 후보는 Iron(.34,.38,.42), Skin(.62,.42,.32), Hair(.06,.045,.035), Cloth/Cape(.34,.085,.065), Leather(.18,.11,.07), Sword(.48,.50,.52), alpha1. Project ColorSpace=Linear. 이 보강도 실제 R4 Player 확인 전 미검증이다. 진입은 성공/실패 모두 rigpixel-entry.json을 남기고 !blocking·요청된3D활성까지 확인한다.

## v4 G0/G1 제작 근거·동작 출처 대조

목표는 1-1 실제 Player의 전사 표시/동작이며, 원화는 G:/exoduser/assets/charselect/warrior_cut.png(직접열람), 광원/무게 비교는 quality-reference-20261030의 nrftw-02.jpg·launch-heavy-timeline.jpg(직접열람)다. R7 1.85m/24본Humanoid·망토9본·대검소켓을 재사용하며 신규 모델/동작 유료생성0. 이동·루트·조준·기간은 Core를 그대로 읽는다. 대기/이동은 기존 Warrior_Locomotion.controller와 달리기/무기홀드 클립, 3타/구르기/피격/사망은 NativeHeroMotionClock+기존 R7 Humanoid/IK 보정이다. 원래 유료원형 TM-A 및 기존 R7 실제 검수/동작 출처는 UNITY_HERO_MOTION_20261030.md와 origin/main 캐릭터보드 UCH-A1에 보존되어 있으며, 새 출처 없는4프레임을 만들지 않는다. Shader/RT는 v4 §3 및 현 브리프의 실시간 픽셀 제작법 안에서 구현한다.

| 사례·1차 자료 | 도구·순서·결과 및 적용/경계 |
|---|---|
| [Motion Twin Thomas Vasseur의 Dead Cells 제작기](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-) | 모델시트→3DS Max 리그/키→작은 무AA 렌더→PNG/normal 및 toon 조명. 핵심은 작은화면 실루엣과 공격키/타이밍을 먼저 확정하는 것. 원작은 프레임수출 경로이며 EXODUSER의 런타임RT와 구분한다 |
| [Dan Moran/Broxxar PixelArtPipeline 원본 Unity 프로젝트](https://github.com/Broxxar/PixelArtPipeline) | 3D 캐릭터를 Toon-lit sprite로 출력하는 실제 공개 구현. Rig→소형출력→toon 조명이라는 기술 분리를 대조한다. 코드/에셋을 무검수로 제품에 복사하지 않음 |
| [David Holland 본인의 3D Pixel Art Rendering](https://www.davidhol.land/articles/3d-pixel-art-rendering/) | Godot4.3의 view-aligned 텍셀격자·4이웃1텍셀 윤곽·toon 조명 공정. 저폴리의 명확한 큰 면이 유리하다는 제작상 제약을 대조해 R4 표면정리로 돌아간다. 문서의 노멀노이즈/세계효과는 EXODUSER 점금지·캐릭터범위 때문에 적용하지 않음 |

위 세1차제작자료는 공정/코드 대조 근거이며 결과를 복제하거나 독립시각검수 PASS로 세지 않는다. G2 기능실물은 실제R1/R3 M1에서 확인했고, 현재G3 표면/명암 재작업 후 R4 G4 실제해상도·동작/점0검수 대기다. G5 사용자실행본 반영은 아직0이다.

R4 G4 실제 cabb8cd4는 실제1-1 진입/40검사/579PNG/USER_SAVE0을 확인했지만 1x보드·3x에서 갑옷/망토 재질 사이 잔점이 보여 시각FAIL이다. 기본sprite/공통/바탕화면 반영0. R3/R4 표면노멀 방법으로 핵심결함이 계속되어 R5는 원형의 재질분할 단계로 돌아간다. R7 importer의5부위 색분류 삼각형에 대해, 복제mesh의 모델공간 위치를0.01mm단위로 용접한 변인접 그래프에서 같은재질 연결성분을 구한다. 면적<.0025m²인 작은섬만, 큰이웃성분(면적≥.0025m²)의 경계지원≥60%인 소재로 재분류하며3회 수행한다. 위치/스킨가중/바인드/UV/전체삼각형은 유지하고 submesh 소속만 이동한다. 좁은화면에서 점을 만드는 원형재질조각을 제거하는 보강이며, 시각PASS는 새 실제Player검수까지 미검증이다.

G3 보조 검사 Exoduser.CharacterLab.RigPixelVerification.SurfacePreview: Editor 중립광/1920×1080/55도 정사영에서 같은리그·RT·합성을 사용한다. 전후 정점/가중/전체삼각형 동일성과 RT Ready를 확인하고 surface-preflight.json/PNG를 출력한다. 실제1-1/제품광/동작/성능 판정을 대신하지 않는다. Player슬롯 대기 중 표면수정을 빠르게 검토하기 위한 도구다.

R5 실제871ab83e 첫3x에서 갑옷/망토의 작은섬 일부는 줄었으나 연결된 가는재질조각이 남아 아트FAIL이다. 런타임정리4623/93437삼각형을 확인했다. 강한월드달빛3.2가 이전diffuse최대1.35에 포화되어 셀명암 대부분이 평탄해지는 원인도 코드에서 확인했다. R6은 그래프작은섬 정리 전에 모델공간8cm/6법선군/인접27셀에서 면적·거리제곱 가중으로 큰소재면을2회 분류(평균법선내적≥.3, 지지≥60%)한다. Skin/Hair는 작은얼굴·머리영역 보존을 위해 재분류에서 제외한다. 피부/머리 보호는 작은섬 단계에도 적용한다. 색은 소재팔레트100%(원본albedo색0%, alpha만사용)로 고정해 잘린UV의 색미세잡티를 제거한다. 실제 장면light.color는1.1/(1+maxRGB)로 압축한 뒤 기존4단NdotL과 실제거리/감쇠를 적용하여 큰곡면의 명암이 상한에 한꺼번에 포화되지 않게 한다. 월드광원/바닥/카메라/전투코어 변경0.

R6 표면사전검사23c37b66는 정점/가중/전체삼각형 동일·RT Ready·컴파일0·USER_SAVE0을 확인했지만 중립조명3x가 지나치게 어두워 조명검수 통과로 쓰지 않는다. Quad Collider의 Editor Destroy 경고도 발견해 Editor에서만 DestroyImmediate로 수정했다. 렌더요청 카메라의 URP 전역광/그림자 상태에 의존하지 않도록 실제활성 Scene Light를120렌더프레임마다 캐시하고, 매렌더 최고강도Directional1개+범위내가장가까운Point4개의 실제 위치/색.linear×intensity/range를 전용셰이더 전역값으로 전달한다. Point감쇠=(1-d²/range²)²/(1+d²), 범위밖0, 광량은1.1/(1+maxRGB) 압축, ambientEquator.linear와 기존ambient하한 사용. 새장식광0/월드광원변경0. 합성은 불투명4이웃 중3개가 최대RGB차<.035로 일치하고 중앙과>.045 차이면 그3개평균으로 고립된 밝은/어두운텍셀을 제거한다. 연결된얇은검은3이웃일치가 없어 보존. R6 실제Player 판정은 여전히 대기다.

R6 실제광원 보강에 맞춘 최종후보 팔레트(alpha1): Iron(.17,.19,.22), Skin(.45,.28,.20), Hair(.025,.020,.015), Cloth/Cape(.18,.035,.025), Leather(.08,.045,.025), Sword(.36,.38,.40). R4의 ambient-only 보상색을 유지해 흑철이 회색판금으로 뜨지 않도록 조정하며, 제품실제화면 판정 전 후보값이다.

Editor사전검사 최종카메라만sRGB RenderTexture로 저장한다(내부리그RT는Linear 유지). Linear최종바이트를 gamma변환 없이 PNG로 내보내 어둡게 보이던 사전미리보기 한계를 수정했다. T포즈 정면으로 표면의큰면/재질만 대조하며 실제제품색/모션 판정은 아니다.

동일패키지C10 기준은 --unity-rigpixel-natural --hero-render=sprite --remodel3d로 같은실제입장/같은1920·3840×1080 검수흐름을 사용한다. 자연입력 시작 전 natural-entry.png와 entryScreenX/Y(발밑화면앵커)를 기록하며 해당PNG인코딩은 성능측정 시작 전이다. sprite baseline은 리그표시검사를 통과했다고 해석하지 않는다.

R6b 사전검사10fec0bd 오류0/USER_SAVE0·geometry동일·RT성공. 3x에서 큰재질면 개선 후에도 미세명암얼룩이 남아 G3를 이어간다. 몸체/정적대검 모두 복제Mesh에8cm 법선평균을4회 적용해 미세방향 편차를 낮춘다(기존1회→4회, 원정점/전체면/가중유지). Editor는 Run클립64등분의 양발목 모델좌표 CSV를 추가해 루트이동0으로 저장된 클립의 실제 보행거리/접지구간을 조사한다. 평균속도 메타데이터는 Run7.29e-8/Walk1.61e-7로 사실상0이며 이것을 보행속도라 사용하지 않는다.

R6 모션 보강은 UNITY_HERO_MOTION_20261030.md의11-03 절을 따른다. 실제Core이동1.631791m/s와기존Run접지4.1384m/s의불일치를측정해 모델주기3.0126457m당거리위상으로 보강했다. rigpixel 전용Chain 상태는HarpActive/DashActive를읽고 기존달리기대체, 실제Shift화면판정대기. 순수계약9/9이며게임용PASS아님.

모션보강 기존대검발회전회귀는 실제DLL141/141 PASS. wrapper dotnet run은출력경로와실행경로가달라져실행파일찾기실패했지만 빌드된I:절대DLL을dotnet으로직접실행해검수했다. 이는게임용실제Player판정을대신하지않음.

보행접점시각기록은HeroFrame.gaitPhase/gaitFootPlanted/gaitFootPlantError, Shift실제InputSystem프레임은PlaytestFrame.motion을추가한다. 실제HarpActive/DashActive와Chain포즈의동시표시를대조한다. Body/발목코드는HERO_MOTION11-03절, Core변경0.

11-03 비정상종료 후 재개: 사용자 보고Kernel-Power41 이후 REPORT/작업파일을 대조했다. 9개 자기미커밋수정 보존, INDEX0, origin/unity/main c741c11c27은현HEAD조상으로이미포함. R6d는PC종료전실행결과가없고재사용하지않는다. 순수모션9검사를재개후다시실행하고 검수전복구커밋으로보존한다. 타인/Unity임포트파생메타/guard는포함하지않는다. 최신v4253ad0b1d의G0~G5/하루커밋push/1920·3840/점0관문은유지한다.

R6 실제e54f1e56는Playing진입/41검사/579PNG/USER_SAVE0·창노출0·잔여0·정상종료를확인했다. 보행접점26표본최대.000009m/대검발회전.000009m/장갑파지.000012m. 그러나motion-board-1x.png를직접보고 갑옷·망토·칼이암부에서검은실루엣으로뭉치는핵심가독성FAIL로판정했다. 큰재질면과점제거·모션은유지하고R6b에서광량만보강한다. 실제Point광의거리감쇠를color에먼저곱한뒤1.1/(1+maxRGB)압축하여, 강한횃불을먼저압축한후거리를다시감쇠해지나치게어두워지는계산을교정한다(Directional attenuation1은동일). 최종후보Palette alpha1: Iron(.34,.38,.42), Skin(.62,.42,.32), Hair(.045,.035,.030), Cloth/Cape(.34,.085,.065), Leather(.18,.11,.07), Sword(.48,.50,.52). 기존피부/머리보호·재질면정리·4회법선·RT정수배·Core/월드광원/보행코드는동일. 새실제1x/3x판정전미채택이다.

R6c 상체선행회전은 HERO_MOTION의R6c절을따른다. R6b 광량/팔레트는그대로이며아래는R6c/R6d 이력값이다. 현행 재작업값은문서끝표를따른다. 새Player완료전기본sprite유지.

| 소재 판별 id | RGB | alpha | 적용 |
|---|---|---|---|
| skin | .62 / .42 / .32 |1|피부|
| hair | .045 / .035 / .030 |1|머리|
| cloth,cape | .34 / .085 / .065 |1|망토·천|
| leather | .18 / .11 / .07 |1|가죽|
| sword,weapon,blade | .48 / .50 / .52 |1|대검|
| default iron | .34 / .38 / .42 |1|갑옷|

실제Point광: 거리감쇠A=(1-d²/range²)²/(1+d²); E=light.color.linear×intensity×A; 압축E×1.1/(1+maxRGB(E)); 최종4단NdotL에적용. Directional A=1. 상체회전보강은게임root/조준/판정각을바꾸지않고자식모델에만적용하며실제영상판정전미검증이다.

공통898ac2b960 정상merge: NativeGame 생성분기의 opt-in/AttachRigPixel을 유지하며 공통에서 제거한 lastKillCount 초기화는 다시 넣지 않는다. 새 공통의 자연완주/실제사망전환/전면UI/숨김영상포커스/공용실행기 변경을 그대로 인수한다. R6c 영수증은 merge 전 c65fe43 패키지 범위이며 새병합본 실게임검수는 Mac에 요청한다. 공통규칙11:55에 따라 PC의 새빌드/Player/M1 시작0.

## R6d 고립 명암 처리와 Mac 검수 요청

R6c c65fe43e 실제Hero76d1e6a8(41/41·579PNG), Shift3840 279f9e85(4/4·700px·aim.03px), M1 f13ca186(23/23)는 모두 exit0·창/잔여/USER_SAVE변경0. 실제1x 보드와대기3x를직접보아 R6암부FAIL보다큰면/망토/대검구분은개선됐지만 종아리의고립밝고어두운픽셀이남아점0 FAIL. ROI색진단8개는재질/윤곽/셀경계후보도포함하며실제점개수의정답이아니다. 해당패키지는기본값/후보바로가기에채택하지않는다.

| R6d id | 계약·정확값 | 보존/검증 경계 |
|---|---|---|
| RT SurfaceTag | iron .6 / cloth,cape .7 / leather .8 / skin,hair,sword,weapon,blade 1 | 캡처RT alpha에만태그. 소재팔레트 alpha는1. 최종합성표면 alpha는항상1로복구해반투명갑옷회귀방지 |
| same-plane median | 중앙RT alpha<.9, 중앙과8이웃 alpha차<.02인3×3내부만 적용. RGB휘도 .2126R+.7152G+.0722B로정렬, 중앙샘플원RGB를선택. 5회 bubble pass로index4 산출 | 다른재질/투명외곽/머리/얼굴/얇은대검은median 제외. 흐림/색보간/노이즈/디더추가0. 기존4이웃고립점정리와달빛한쪽테유지 |
| shader target | composite SM3.5 | D3D/Metal 실제컴파일·장면색·RT태그정밀도·성능은Mac및후속Windows검수전미검증 |
| natural fallen | Running=!PlayerDown | 제품의5초fallen부활카운트와같이Core틱을유지. Hp>0만보던QA조기정지를교정, AI/HP/피해/부활규칙변경0 |
| 검수 위치 | 11:55추가지시확인후PC는코드/커밋push·배치컴파일1회까지만. 정식빌드/Player/M1/UI/FPS는Mac담당 | R6c이미종료된영수증을새R6d검수로세지않음. 기본sprite유지, 공통/Desktop반영0 |

Mac에서는 Editor RigPixelVerification.Verify 후 PortVerification.Build(-remodel-scenes 1), 같은패키지 Hero1920/3840·Shift·M1·natural1920/3840·spritebaseline·10초무음영상·C10/NRFTW동일크기비교를 수행한다. 새병합본 NativeGame 생성분기/실제fallen전환/RT태그/약한곳의점0/발접지/상체선행/3타접점/60fps가필수다. Mac검수/통합담당응답전공통반영/전달완료로보고하지않는다.

R6d 배치665409d7은C#오류0/USER_SAVE0이지만renderer=true·humanoid=true·shaders=false로exit2, 전체PASS가아니다. 허용된PC Editor 배치1회를사용했으므로추가Unity기동0. 별도Windows D3DCompile로median함수구문을검사하여예약어pass 사용의실제X3000을확인했다(tests/red-r6d-hlsl.json). iteration으로교정한함수는ps_5_0 HRESULT0(tests/green-r6d-hlsl.json), 이는전체Unity/Metal/실제렌더검수PASS가아니다. Editor Verify는각shader의severity/line/platform/message를로그에추가해Mac실패진단이누락되지않게한다.

직접본비교판: G:/exoduser/tmp/design-review/20261103_rig_pixel/r6c/comparison/C10-R6c-NRFTW-body-aligned.png 및-3x.png. 원본C10=다른R3패키지1600×900, R6c=1920×1080원1x, NRFTW원참조를수동몸높이114px로정렬한검토판이다. 같은패키지A/B 또는R6d결과가아니며manifest.json에crop/scale/범위를기록했다. C10대비실루엣/대검/큰면은좋아졌으나노레위와의입체명암/재질차와고립픽셀은남아시각완료를선언하지않는다.

## 14:25·19:00 재작업 G0/G1 — 망토·흑철·픽셀 검격

목표는 최신 Unity 1-1의 같은 R7 전사다. 최신 공통 cbdcbc2822를 먼저 정상 merge했다. Mac 검수 22918886e의 1920_hero_ambient_x3.png를 직접 열어 망토 끝의 분리된 어두운 픽셀과 부드러운 흰 검격을 확인했다. Mac이 보고한 두 해상도 FPS 121.7/75.1과 가독성은 이전 입력의 근거이며 새 수정의 합격이 아니다. 현재 가장 큰 차이는 연결되지 않은 망토 픽셀이다.

| G0 공통 관례 체크 | 직접 확인한 1차 자료·현재 적용 |
|---|---|
| 작은 화면의 실루엣·동작 우선 | [Dead Cells 제작자 Thomas Vasseur](https://www.gamedeveloper.com/production/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-i-dead-cells-i-): 키포즈/타이밍을 먼저 잡고 저해상도·무AA·toon으로 출력. 원작도 시간축 픽셀 깜빡임을 미해결 문제로 기록하므로 이를 우리 합격 기준으로 허용하지 않는다 |
| 캐릭터·효과의 격자와 외곽 결 통일 | [David Holland 본인 구현](https://www.davidhol.land/articles/3d-pixel-art-rendering/): view-aligned texel grid·큰 외곽·셀 조명, 실제 장면 반복 확인. 우리 카메라/RT 정수배를 그대로 사용하고 검격만 같은 화면 격자로 표본화한다 |
| 큰 형태·명도·타이밍으로 판독 | [Riot 공식 VFX 교육](https://www.riotgames.com/en/artedu/visual-effects): 효과가 실제 동작/상태를 전달하고 캐릭터 및 전체 화면과 조화돼야 함. 노레위 원본과 함께 검토한 적용 판단은 흑철 큰 암부와 제한된 금속 밝은 면, 짧은 검격이다. 점·노이즈로 재질을 표현하지 않는다 |
| Core 접점과 탄막 가독성 유지 | b1d3cb69e의 VFX_G1_TIMING_DESIGN_20261103.md: 발사/히트/회복 및 원본 시트는 그대로. 이번 범위는 검격 샘플 격자·필터·셀화뿐. 빛/히트스톱/데칼/피해/속도 변경0 |

선택한 제작법은 v4 §3의 기존 R7→정사영 Point RT→월드 합성, 원본 검격 시트의 픽셀 표본화다. 별도 프로젝트/원형/이미지 생성0. 설계: 8이웃 연결로 망토의 크기1~2 섬만 지우고 연결된 계단·얇은 대검을 보존한다. 흑철은 중성 암부와 넓은 셀 하이라이트를 분리한다. 검격은 hero-render=rigpixel의 KiSlashView만 opt-in, 기존 공용 impact 재질의 기본값은 유지한다. 첫 새 실물 판정은 PC 컴파일 후 Mac 같은 패키지 1920/3840이다. 합격은 망토 낱픽셀0·흑철 LOCK·같은 픽셀 크기 검격·가독성/60fps 회귀0, 핵심 FAIL 또는 같은 검사2회 실패 시 수정 항목을 보고한다.

### 14:25·19:00 수정 계약 — 현행 값

| id | 현행 동작·수치 | 유지/판정 |
|---|---|---|
| cape coverage | RT alpha가.7±.02인천만8이웃검사. 이웃0이면제거, 이웃1일때그이웃의다른연결이없으면2텍셀섬으로제거. 3텍셀이상연결/몸체에붙은끝/다른소재는보존 | 중앙과외곽선4이웃모두정리된coverage를사용해삭제한섬의검은테도남기지않음. 점0은Mac3x/동영상확인전미검증 |
| iron palette | default iron RGB(.18,.185,.195), alpha1 | 피부(.62,.42,.32)/머리(.045,.035,.030)/망토(.34,.085,.065)/가죽(.18,.11,.07)/대검(.48,.50,.52)는유지. 월드광/ambient하한변경0 |
| metal cells | _MetallicPlane iron1 / blade.8 / 그외0. 실제달빛/Point E를기존과같이압축, N·H≥.90이면.04 / ≥.97이면추가.08의넓은하이라이트 | 노멀맵·스펙맵·노이즈0. H=normalize(광방향+view), 원기하/법선큰면·median유지. 회청색큰바탕을낮추고밝은금속면만분리 |
| pixel grid | NativeRigPixelHero가_RigPixelGrid=(RT화면좌하단x,y,n,1)을전달. n=max(1,height/1080) 정수. 투영화면좌표를동일격자중심에맞춰UV미분으로원본시트표본위치를계산 | ComputeScreenPos로D3D/Metal Y방향을보정. 뷰포트/고해상도n전환은Mac필수확인 |
| KiSlashView opt-in | Requested(args)일때자기additive/ink재질의_RigPixelMode1, 기본0. 셀rect를_PixelFrameRect로전달 | 공유impact/다른재질은기본0, 기존RGB/opacity·원시트·발사/수명/크기/5레이어유지 |
| slash sampling | inline Point Clamp·LOD0. source premultiplied RGB의 max×2.4를clamp한C<.25는제거, 나머지는coverage1과RGB4단(floor(rgb×3+.5)/3). 화면8이웃의1~2픽셀섬도제거 | 아틀라스셀경계는반텍셀안쪽으로clamp. 시간fade는기존_Opacity한번만적용. sprite모드는기존필터/합성유지 |
| slash ink | rigpixel모드에서정리된coverage의4이웃1픽셀테, 각정리픽셀의I=saturate(max(RGB×alpha)×2.4)를사용, 최종alpha=max(I,4이웃I최대×.6)×opacity, RGB(5,4,6)/255 | 기존121탭넓은blur는sprite모드에만남김. 탄막·스킬·SFX·히트스톱·Core타이밍변경0 |
| compile gate | Verify는toon/composite/slash additive/ink네셰이더오류·R7아바타를검사 | PC공용bin batch compile만1회, 새Player/빌드0. Mac Metal/실게임판정후CTO가통합/기본전환결정 |

inline Point/Clamp의D3D11/12·Metal지원은 [Unity 공식 sampler 문서](https://docs.unity.cn/6000.0/Documentation/Manual/SL-SamplerStates.html)와대조했다. 효과형태·기본타이밍의다음변경은임팩트레인이VFX_G1표로진행하며이번표본화플래그/그리드를재사용한다. 새유료호출0.

PC 단일 컴파일 결과: 7d38fa45, source1274675fb0. renderer/shaders(네개)/humanoid true, exit0, C# compileErrors0·USER_SAVE변경0. 실제작업27.4초/순번포함719초. 부수 라이선스토큰갱신·종료통신로그는별도기록하며코드/셰이더검사실패는없다. 새Player/정식빌드/시각PASS를뜻하지않는다. 자기Editor 종료뒤자기worktree의자동직렬화860개·새meta/SceneTemplate57개·CLI임시캐시를정리했다. 실제수정은이미커밋된13경로에만남는다. 최신Mac판정6PNG만current에남겼고확인끝난PC빌드7개·이전캡처8폴더·사본을삭제했다(약51.2GiB). 정식빌드고정폴더는build-current, Mac PASS후CTO만통합/기본전환결정.

## 20:20 Mac FAIL — 검격 뒤 검은 사각 면 교정

G0 범위는 1-1 검격만이며 최신 CLAUDE7bc7a3518 및 docs 정본 unity/main을 적용한다. origin/unity/main d6c5bb89bb206d7712b6bcf286ad7a98d3fbd638을 먼저 정상 merge했다. 기존 G0의 큰 형태·게임 동작과 같은 효과 결·배경 판독 관례는 유지한다. 새 입력은 qa/mac-captures-20261103 @39c3ae380의qa/unity-rigpixel/aa95382/1920_hero_slash_x3.png와1920_full.png로, 회전 검은 사각 면을 직접 봤다. 시트 원화는1254×1254, alpha전범위255/모서리RGBA(0,0,0,255)를디스크에서확인했다. 알파를투명마스크로가정한이전구현이원인이며원화는바꾸지않는다.

| id | 교정 계약 | 보존·판정 범위 |
|---|---|---|
| Raw coverage C | RigSlashInkAlpha(c)=saturate(max(c.rgb×c.a)×2.4). 중앙/8이웃/두번째연결검사를전부이C≥.25로판정 | opaque black(0,0,0,1)도C0이므로배경으로제거. 검격에사용되는원본RGBA/asset/meta 수정0 |
| Pixel output | 연결섬정리후 RGB4단/alpha1은유지, 제거픽셀은RGBA0 | 기존Point·격자·셀clamp·1~2픽셀섬정리·5레이어·opacity타이밍유지 |
| Ink alpha I | 필터된각픽셀에서같은premultiplied RGB식으로I계산. 최종alpha=max(Icenter,.6×max(Ileft,Iright,Iup,Idown))×_Opacity | alpha만보고검게칠하지않음. 빈검은배경은중앙/이웃I0→ink0. 기존sprite121탭분기무변경 |
| 이전 Mac PASS | 망토낱픽셀0·중성흑철·동일픽셀크기·FPS1920 127.11 /3840 83.11 | 해당 aa9538206 입력의증거. 이번RGB교정의G4합격은같은두해상도 재검수전미검증 |

첫 새실물 판정은 PC 공용 단일 컴파일 후 Mac 같은패키지1920/3840의검격표본이다. 원래 사각 면좌표1920 x744–983/y369–565와3840 중앙을1x/3x에서직접보고, 10초무음영상에서검격의사각배경0·망토낱픽셀0·흑철/픽셀크기/FPS회귀0을확인한다. Core/카메라/망토/팔레트/원시트/공통재질기본값은변경0. 두번실패하면무수정재실행없이원인을보고한다. 검수후기본값전환과통합은CTO가결정한다.

20:20 수정 PC 단일 컴파일 영수증: 4c477254 / source0fa44094edbce3079b32d04502515b15dd737ef5. renderer/네셰이더/Humanoid true·exit0·compileErrors0·USER_SAVE변경0, 재임포트포함303.3초. 부수 Curl종료통신/라이선스갱신로그는검사결과와구분한다. 자기Editor종료·공식예약반환후880개자동직렬화와56개새meta를정리해직접수정만커밋에남겼다. 새Player/정식빌드/실게임PASS0. 검은사각면0의실제판정은Mac재검수대기이며그뒤CTO가기본값전환을결정한다.

## 21:20 최신 Unity 병합·통합 준비

최신 origin/unity/main aa38bb8773274bd5f2c91fdc25c4eb2cf003565d(사망화면포함)을인수했다. docs/CHANGELOG_SYNC.md의한충돌은리깅14:25/19:00·20:20과사망UI후속세기록을양쪽그대로보존해해소한다. NativeGame.cs/WORK_BOARD는정상자동병합이며리깅셰이더·원화·팔레트·기본모드의추가수정0.

브리프21:20 CTO 전달: qa/mac-captures-20261103 @adc7233e6 / qa/unity-rigpixel/39e52fe/에서사각면0·망토낱픽셀0·흑철·1px칼궤적시각PASS. 3840의56fps는다른Player동시실행오염이라단독재측정대기이며60fps PASS로세지않는다. 새로운PC Player/빌드/성능검사없이공용컴파일한번만수행한다. CTO가검수후unity/main을fast-forward로반영하며기본rigpixel전환은성능재측정PASS뒤별도결정한다.
