# A2R — 기존 3D 1-1 + 웹 원화 이식

기준: `codex/unity-map-a2-20261103` / unity/main `5062b5701`. GB1은 중단했다. BRIEF_A2R의 14:30 사용자 정정이 우선이다. CTO 직접 지시로 자기 소유 경로만 commit·push한다. 바로가기 판정은 맵 총괄이 한다.

| 범위 | 계약 |
|---|---|
| 구도·걷기·원근 | A2Field·SourceMap·NativeRemodelCamera를 유지. 배치·지형·Core·액터 그리기 방식 변경 없음 |
| 웹 기존 소품 | a5c287157 C10 원화 중 현재 SourceMap.props의 ID·XY가 일치한 34개. 원화 PNG/기존 노멀만 복용. x=px/100, z=-py/100 |
| 접지 | 실제 A2 지면·다리의 표현 전용 layer28 쿼리. 아래 레이 높이에서 4cm 묻고 불투명 최저점 피벗. Y축 빌보드·AO. 동일 위치 대응 3D 소품은 유지하고 중복 표 작성 |
| 바닥·늪 | 기존 웹 r3_litter/r3_soil/r4_tex_mud/r3_water를 기존 재질에 연결. KeyScene 바닥 그림·새 키트·새 데칼 없음 |
| C10 조명 A2 보정 | 달빛 RGB(.86,.88,.93), 세기.75, Euler(32,-44,0), 그림자.9. 캠프 반경6.5/세기6.2/RGB(1,.32,.08) + 반경3.4/세기3.6/RGB(1,.52,.20). 보조 캠프 glow는 그림자 없음. 횃불 반경5/세기7/RGB(1,.40,.10). 포탈 붉은빛 반경4.4/세기4.56 유지 |
| Volume | Neutral, exposure.80, contrast0, saturation0, white balance temperature12/tint3. split shadows(.48,.49,.51), highlights(.53,.51,.48), balance−15. bloom.055/threshold1.5/scatter.5. Gaussian24~38m/.25 |
| 환경·안개 | Trilight sky(.105,.100,.090), equator(.075,.070,.058), ground(.018,.015,.012). 높이 안개 RGB(.040,.043,.045), density.008/falloff1.2. 기존 빛줄기 RGB(.60,.65,.70)/alpha.010. 달빛 spot은 시험 표현에서만 끄고 원본 A/B에서는 복원 |
| 영웅 | 기존 윤곽광을 달빛 한 면으로 위치·세기 조정. 짧은 .78×.42 접지 그림자. 기존 메시·스프라이트·합성·아틀라스 미수정 |
| 가림 18:20 확대 | 영웅 원(화면 높이12% 반경) + 전장 타원(화면 폭45%·높이40%) + 화면 안 적·탄막·소환굴 작은 원의 합집합. 내부70%까지 alpha.35, 70~100% smoothstep, 밖 불투명. CPU viewport VP를 셰이더에도 명시해 Metal/RT 축 차이를 배제. 픽셀 깊이 절단·디더링 없음 |
| 가림 대상·캠프 | 밑동이 영웅보다 남쪽(카메라 쪽)인 나무·고목·목질 카드만. worldZ=−CoreY/100이므로 south는 tree.z < hero.z. 진입 여유.05u/유지 여유.10u, 화면 겹침 유지 여유8%, 이탈 hold.12초+fade.2초. 북쪽 원경 및 마스크 밖 좌우 끝 전경 불투명. 캠프 중심18% 보호도 같은 남쪽 규칙, 기존3D 나무에만 |
| 수면 밝기 | A2R 시험 재질만 `_SPECULARHIGHLIGHTS_OFF` 로 직접광 흰 정반사 제거, smoothness.18. 기존 실제 planar 반사·흐름·거품 유지. 원본 A/B는 원래 keyword와 smoothness 식 복원 |
| 실행 | `--a2r1-light` 시험 적용. `--unity-field-screen --a2r1-light-capture --a2-plan-capture`는 같은 패키지 A/B 8컷+가림3컷+전장 가림A/B4컷·비교2장+정사영 구조도. 일반 실행 기본값은 기존 장면 |
| 구조도 | 별도 정사영 카메라4096², x[-4,84],z[-84,4]. image=(CoreXY+400)×4096/8800. 실제 Core walk0/actor 범위와 앵커 JSON. 게임 카메라 변경 없음 |

산출: `I:/EXODUSER-Storage/map25d/a2redesign/`. 고정 build-current 하나. 실제 화면 검수 전 상태는 미검증이다. 2단계는 구조도 판정 뒤 진행한다.


## 2026-11-03 CTO 인계 — PC 컴파일만, 촬영은 Mac

15:39 PC 비정상 종료 뒤 CTO 지시로 소스·데이터·원화·자기 .meta만 경로 지정 커밋·push한다. PC에서는 Unity Editor/Player/빌드/촬영을 실행하지 않는다. 관련 문서와 CHANGELOG_SYNC도 함께 반영한다. Library/Temp/Generated 및 기존 타 경로 .meta/ProjectSettings 잡음은 제외한다.

Mac 빌더는 Exoduser.A2RBuilder.Build이며 OSXEditor에서는 EXODUSER-A2R.app을 만든다. 같은 패키지 촬영은 A/B8컷, 고목 뒤3개 고정 위치, 4096 정사영 원본+좌표 JSON이다. 가림 위치가 막혔으면 인접 보행점으로 보정하고 실제 좌표를 기록한다. 3컷 누락/해상도 불일치/구조도 누락은 PASS가 아니다. 필드보스가 아직 생성되지 않았으면 Core의 정적 FieldBossSites 정의를 촬영 시 1회 읽어 실제4좌표를 기록한다. Core를 변경하거나 강제 소환하지 않는다.

검증 경계: C# 컴파일과 별도로 새 후보의 셰이더·Mac 빌드·실제 화면·접지·투명화·성능은 미검증이다. 가림 CPU 수집은 매 프레임 현재 Core 적·Bolts·Druid.Projectiles·소환굴을 읽기만 한다. 화면 밖을 걸러 Renderer당 최대128개 원을 전달하며, 전장 타원 내부가 이미 덮는 원은 중복 제외한다. 넘친 수는 PeakDroppedTargets에 기록하고 촬영 PASS는0을 요구한다. 밀집 전투 전체 적/탄막 커버는 후속 검수 대상이다. A/B8컷은 14프레임 뒤, 고목3컷은 24프레임 뒤 각각 추가.25초 대기해 정적 알파를 촬영한다. 자연 도보/연속0.2초 동작의 증거는 아니다.

## Mac 8dce239 FAIL 후 CTO 수정

근거: `origin/qa/mac-captures-20261103@1e7b556d9`의 `qa/map-a2r/8dce239/REPORT.md`와 PNG6장을 직접 열었다. 기존 후보는 빌드 errors0이나 촬영 errors2/exit3 및 시각 FAIL이다. added31/total34, floating0, 구조도28점 PASS는 **이전 후보의 결과**이며 새 후보 검증으로 재사용하지 않는다.

| CTO 결함 | 수정과 재검수 조건 |
|---|---|
| texture property Error2 | `mainTexture` 접근 제거. `HasProperty(_BaseMap/_MainTex)`로 선택한 속성만 GetTexture/Scale/Offset. `GroundSkillReceiver` 재질을 포함한 Renderer는 원본 그대로 두고 복제·치환하지 않는다. Mac player.log Error0/exit0 재확인 |
| 각진 반투명 띠 | world-space 픽셀 깊이 smoothstep 제거, 양쪽 점을 같은 GPU 행렬로 투영한 원형 거리만 사용. 타깃당 범위와 0.2초 fade는 Renderer MPB, fade-out 중 마지막 원 유지. 1x/3x 원 밖 불투명·원 안.30/부드러운 가장자리 재확인 |
| 전체 청록 | 중립 달빛 세기 감소, 따뜻한 WB/흙색 환경광, 카드 기본광도 RGB(.08,.075,.065)로 중립화. 캠프 주광6.2·보조광3.6/횃불7. 웹 원화 PNG·바닥 텍스처와 색상 자체는 변경0 |
| 다리 밝음·흰 타원·물 안 보임 | 노출1.30→.80, 안개 밀도.032→.008, 빛줄기 alpha.042→.010, DOF.6→.25. 수면 직접 정반사만 끄고 거칠게. 원본 대비 bridge ROI 평균은1920 68.49/3840 51.12가 비교 기준이며 새 실측은 Mac 대기 |
| 캠프 3D 나무 중첩 | 기존 나무 등록 대상 유지, 캠프 원화 중심도 제한된 원형 가림 타깃으로 추가. 나무 전체 투명화·위치 변경·새 에셋 없음. tent/nest 읽힘 재검수 |

세이브 namespace/root 바인딩 로그 부족은 Mac 이전 REPORT의 미검증으로 유지한다. 이 작업에서 공용 세이브 코드·장판 수신 셰이더는 수정하지 않는다.

MAP PRODUCTION REPORT: STAGE=Mac FAIL 원인 수정 / MASTER·OUTER MASS·LARGE·MEDIUM·PLAYABLE·LANDMARK=기존 A2Field LOCK / GROUND=기존 원화·접지 유지 / CAMERA QA=이전 A/B8·가림3·구조도 좌표 검수 인수, 새 촬영 대기 / TECH QA=PC C#만, Unity 실행0 / FILES=A2R 표현·기존 수면 옵션·관련 docs만 / GIT=정확한 자기 경로 commit·비강제 push / VISUAL VERDICT: RETOUCH (새 GPU 결과 미검증) / NEXT=Mac 같은 인자로 재촬영하여 오류0·원형 경계·흙색/불빛·다리 밝기·캠프 중첩 확인.

MAP PRODUCTION REPORT: STAGE=기존 에셋 이식 코드 인계 / MASTER PLAN·OUTER MASS·GROUND=기존 A2Field LOCK / PLAYABLE=기존 Core 유지 / CAMERA=원근 유지, 구조도만 별도 정사영 / TECH QA=PC C# 컴파일 결과는 MAC_RUN.md / VISUAL VERDICT=미검증 / NEXT=Mac 동일 패키지 촬영 후 맵 총괄 판정. 실행 인자·실제 push SHA는 I:/EXODUSER-Storage/map25d/a2redesign/MAC_RUN.md에 기록한다.

## 18:20 사용자 스크린샷·18:25 CTO 동의 — 전장 가림

18:14의 영웅 원 단독/alpha.30 계약을 위 표의 전장 확대/alpha.35로 대체한다. 스크린샷 \images\1.webp를 직접 확인했다. 전장과 적을 덮는 카메라 쪽 거목을 흐리되 윤곽·원근·북쪽 깊이는 유지한다. 410e3fead의 조명·색·원화·장판 수신 제외 계약은 그대로다.

| 항목 | 구현·Mac 검수 계약 |
|---|---|
| 전장 영역 | 영웅 중심 반지름(.225W,.20H), 즉 전체45%W×40%H. 아래60% 화면과 전장 타원의 교차가 있는 남쪽 Renderer만 전장 마스크 대상으로 선택. 실제 픽셀은 타원 안 부분만 alpha.35 |
| 추가 원 | 영웅.12H, 적.055H, 아군 bolt.025H, 적/보스 탄.04H, 소환굴.075H 반경. 캠프.18H 원은 기존3D에만. 반경은 화면 높이 단위이며 x반경은 aspect로 보정 |
| 북쪽·끝 전경 | 생성 루트 밑동으로 남북 판정. 안개 원경 루트 제외, 남쪽이어도 실제 마스크와 안 겹친 픽셀은 불투명. 접지·원화 XY·원근 카메라·충돌 불변 |
| 깜빡임 억제 | 진입 z < hero.z−.05u, 유지 z < hero.z+.10u. 겹침 해제 범위8% 여유, 마지막 마스크 hold.12초, Renderer alpha fade.2초. 연속 동작/깜빡임 여부는 Mac에서 추가 확인 필요 |
| 셰이더 | A2R4종만 target3.5 명시(128개 원 동적 반복), fade0 조기 return. 장판 수신 재질 Renderer는 복제/치환 제외. 모든 대상의 원 밖은 원래 불투명 |
| 신규 전장 fixture | 같은 조명·웹 에셋·카메라·고정 적(최대12개)에서 mask OFF/ON만 비교. 3840·1920 각각2원본+나란히1장. 적 좌표/수·화면 내 적 수·fadedRenderers·maskTargets·누락 수를 영수증에 기록. 자연 전투 증거 아님 |
| 재현 위치 | 원본 이미지에 Core 좌표가 없어 목교 동측 횃불의 상대 위치로 추정한(3640,7420) 사용. 막히면 WideLegal 인접 보행점. --a2r-foreground-x/y로 실제 좌표 지정 가능. 요청/실제 좌표와 추정임을 JSON에 기록. 사용자 컷과 정확히 같은 자리인지는 Mac에서 대조해야 하며 PC에서 확인했다고 주장하지 않음 |

출력 추가: 3840-foreground-current.png / 3840-foreground-applied.png / 3840-foreground-current-vs-applied.png(7680×1080), 1920-foreground-current.png / 1920-foreground-applied.png / 1920-foreground-current-vs-applied.png(3840×1080). 비교판 왼쪽=가림OFF, 오른쪽=확대 가림ON, 각 열은 원본1x다. 일반 A/B8+고목3+구조도1까지 총18PNG. 별도 인자 없이 기존 촬영 인자로 함께 실행한다.

기술 게이트: 기존8+3·구조도에 전장 원본4·비교2·화면 안 적1이상·가림 대상으로 들어간 Renderer1이상·타깃 누락0·해상도/카메라 불일치0을 추가한다. 시간·위치가 고정된 이미지로 자연 전투나 히스테리시스 연속 동작 PASS를 선언하지 않는다.

MAP PRODUCTION REPORT: STAGE=전장 가림 확대 소스 인계 / MASTER·OUTER MASS·LARGE·MEDIUM·GROUND·PLAYABLE·LANDMARK=A2Field LOCK / CAMERA QA=사용자32:9 원본 직접 확인, 재현 위치/확대 가림은 Mac 대기 / TECH QA=PC Runtime·Editor C#만, Unity 실행0 / FILES=A2R 가림·readonly 타깃·촬영·관련 docs만 / GIT=자기 경로 commit·비강제 push / VISUAL VERDICT: RETOUCH (새 GPU 결과 미검증) / NEXT=Mac 적 포함1920·3840 비교/북쪽과 좌우 끝 원형 보존/0.2초 동작·깜빡임 재검수.

## 18:45 최우선 — C10 전체 이식·Windows 실제 후보

이 절은 앞의 props교집합34개/PC컴파일만/일반실행미적용 방침을 대체한다. CTO가 Windows Player1회 빌드·격리 스모크·후보 바로가기 교체를 직접 승인했다.

| 항목 | 현재 계약 |
|---|---|
| 원본 | a5c287157 Art PNG369개(약433MiB)와 layout/r5-layout/maplook-source 원문, 독립GUID .meta로 Resources/A2R/C10에 이식 |
| 카드 | C10 layout142 + R5 신규ID14(동일ID는 C10 위치 유지) + 원본foreground27 + C10빌더의숲3/고사리3 =189. SourceMap props 교집합 필터 폐지. 종류별 source/added/duplicates와 중복3D이름·접지 결과를 영수증 기록 |
| 위치 | 원본drawX/footY/width/height, 알파 발피벗에 따른 수평offset만 적용해 이미지중심 유지. world x=px/100,z=−py/100. 아래ray에서4cm묻기·Y축billboard·AO. vegetation 높이는 C10의low1.3u/나머지.9u상한 유지. 무작위 배치 없음 |
| 지면 | r3_ground8×8 타일64, 타일당10u/40×40분할. NativeRemodel3D.GroundY를 샘플하고1.2cm올린 표현 mesh. 실제 지형높이·Core·충돌 불변. 원본water mask/전체외곽35cmsoft blend. Queue2475로 기존 장판투영 이전에 그리며 수신재질은 변경0 |
| 늪 | 원본riverPoints에r3_moat_strip/normal/mask와r3_water를 연결. 기존 높이와−.44u중높은표면으로투영, Core걷기위는alpha0. Queue3010으로기존수면뒤. 네이티브수면반사·움직임 유지 |
| 3D·가림 | 대응3D고목/다리/횃불은 유지하고 같은좌표웹나무는 제외표 작성. 새 큰 카드도 기존남쪽전장가림.35/.2초에등록. 구도·원근·액터그리기·리마스터영웅 변경0 |
| 기본 후보 | A2R/default-enabled.json 있는 후보에서 A2R/3D가 기본ON. NativeRemodel3D.Requested에 후보기본값 1줄만 연결. 소스일반제품채택아님 |
| 세이브 | Map25DHumanSave방식의 A2RHumanSave가 BeforeSplashScreen에 fail-closed바인딩. --a2r-play-sandbox 절대경로. 공용Runner의--unity-qa-sandbox가있으면그격리root우선. 인자없는Windows후보도I:/EXODUSER-Storage/map25d/a2r-play-sandbox로격리. 실제세이브fallback금지 |
| 빌드 | 공용bin exo-unity.ps1/Editor예약은빌드때만. A2RBuilder.Build Windows1회, 고정I:/EXODUSER-Storage/map25d/a2r-build/EXODUSER-A2R.exe. 무창·무음/D3D11. 이전후보빌드보존 |
| 스모크 | --a2r-play-smoke -output <절대경로>. 실제타이틀LobbyKeys→로비→격리캐릭터/제품진입callback→Core StepInput으로캠프2050,4400. 좌표순간이동0. TutorialSkipcallback/무적갱신은검수용이며전투밸런스검증아님. 오류0·도달·전체에셋/접지영수증을요구 |
| 바로가기 | 지옥의 길1-1맵후보(Unity)만 교체. --remodel3d --a2r1-light --a2r-play-sandbox ... --unity-mute -force-d3d11. Description=1-1 A2R 후보: 조명·웹 에셋·나무 투명화, 영웅=리마스터 미적용. history에SHA/이전대상 기록 |

사전 소스 검사: 카드189/바닥64, 참조PNG누락0. 현재종류별수: {"m_c1sbone":3,"m_ctree17":1,"m_ctree16":1,"corpse":2,"m_fbones":2,"m_c1pool":1,"m_hang_cage":1,"m_c1cocoon":1,"m_c1spod":2,"m_c1groot":1,"m_c1tree":1,"m_ctree15":1,"m_ctree18":1,"m_penta_circle":1,"m_c1altar":1,"m_c1camp":1,"m_skull_totem":1,"m_fyellow":1,"m_sword_pile":1,"m_c1sroot":4,"m_c1gtoxicf":1,"pit_poison":1,"m_ctree19":1,"m_ctree14":1,"m_bone_arch":1,"m_ctree20":1,"m_ctree13":1,"boundary_tree":8,"vegetation":113,"forest_wall":6,"foreground_tree":27}. r3_bank/thicket/rootfan 등 보관변종은원문Art에보존하되 a5의실제배치에없는변종을새좌표로흩뿌리지않는다. C10이사용한고사리/덤불/숲/나무/소품/낙엽·뿌리바닥표현은전체배치·바닥으로연결한다.

MAP PRODUCTION REPORT: STAGE=C10 전체원화·Windows후보 / MASTER·OUTER MASS·LARGE·MEDIUM·PLAYABLE·LANDMARK=A2Field구도LOCK, C10표현전체이식 / GROUND=원래높이에투영·접지ray/AO / CAMERA QA=같은Player캠프1920·3840검수예정 / TECH QA=PC C#후 Windows1회빌드·로비도보스모크 / FILES=A2R소스·데이터·원화·자기meta·후보기본표현flag1줄·관련docs만 / GIT=정확경로commit·비강제push / VISUAL VERDICT: RETOUCH(동일빌드검수결과는I:REPORT) / NEXT=스모크오류0후후보바로가기교체, 일반제품·Steam배포없음.

## 18:45 실제 후보 검증 결과

Windows빌드1회job28c0bc2e Succeeded/errors0. 실제189 source→173 added/16 duplicates/64 ground/1moat/floating0. 일반입장은FullRun job056f2314의6경계·field샘플로검증(maxTicks1의의도된time-limit/exit2, 전체클리어검증아님). 새 --a2r-play-smoke 단독은전환대기누락으로실패했으므로타이틀부터자동검증PASS가아니다. 같은exe의기존 --unity-*-smoke 계약인 --unity-a2r-route-smoke와 --a2r-play-smoke를함께써서연출생략후Core도보별도검증. job89ff9ea2에서1829ticks/4974.3px/도달/errors0/순간이동0/정체0. 무적·튜토리얼Skip은fixture범위. 1920캠프3초91.5FPS, 밀집전투/3840성능미검증. 전용바로가기스크립트는일반진입과경로양쪽영수증을요구한다.

캠프1920·3840직접확인/웹원화표시확인. 후보바로가기교체·원격SHA·종류별실수량은 I:/EXODUSER-Storage/map25d/a2redesign/REPORT.md 및 MAC_RUN.md, 실행web-assets-receipt.json. 실제세이브변경0/기존앱종료0/이전후보삭제0. VISUAL VERDICT: RETOUCH(후보전달과디자인합격별도).

## 19:30 R1~R4 RETOUCH 계약

| 항목 | 변경 | 보존 |
|---|---|---|
| R1 | HellLightingActive의전역청회선형안개가A2R설정을덮던원인제거: A2RLate에서fogOFF/중립흙색ambient고정. 별도DistanceHaze는22u이후density.004/alpha최대.13, 근중경맑게. WB16/tint6, moonRGB(.92,.90,.86)/.62. 캠프점광radius7.5/power9.5, 보조4.8/5.2, 횃불5.8/9. 보조광위치에서유도한부드러운역제곱바닥광+원화색RGB(1.10,1.03,.91) | 원근·먼적·원화디테일/새데칼없음 |
| R2 | 각카드·3D가림대상에A2RNearest전용pass. 카메라별RFloat MIN-blend 선처리(지원안되면ARGBHalf), 투명pass는가장가까운표면깊이+.002u만허용(half fallback.02u). 겹친줄기누적합성방지 | 원·타원밖불투명/.35/.2초/히스테리시스/남쪽밑동/좌우끝규칙/장판수신제외 |
| R3 | 원래113개좌표/ID를3.3001u(float여유)인접그래프로읽고DSATUR로기존고사리3종+덤불4종variationAsset배정. 실제3.3u인접동일0. 고정IDscale.8~1.2/yaw±17°/반전/tint.92~1.08, 선택원화footU/V 적용 | 원래웹좌표·기본원화데이터·수량·접지, 새원화/랜덤scatter없음 |
| R4 | 원본SpriteRenderer읽기전용별도mesh에달빛쪽한면1source texel/boneRGB(.78,.81,.77)/alpha.82 윤곽, ZTestAlways로묻힌영웅실루엣. foot+.8u/range2.8/power1.1 중립약광 | 원본sprite/atlas/material/filter/scale/rig 경로변경0 |
| 스모크 | 기존FullRun대기계약을A2R자체fixture에이식. 로비전환/생성/입장callback완료대기, startup skip callback후동일Core도보. 더이상legacy연출우회플래그필요없음. nearestRT실제covered pixel검사·각capture hero/distant/camera좌표기록 | 실제세이브·Core판정·액터방식변경0 |

이전0fd8e9f19의같은도착위치1920/3840원본을비교근거로유지한다. 빌드후캠프·좌측거목1x·영웅3x·먼적을직접검수하고확인된범위만판정한다. 현재시각결과는미검증.

19:30 검수중 보정: 캠프광원은원본이미지중심(1820,4020)이아닌웹캠프불투명발피벗(1805.75,4241)의전방으로재접지한다. 광원뿐아니라바닥광분석위치도같이이동. 고사리15/덤불98개전체변형, 선택원화의기존측정footU/V를재사용해투명하단여백차이로뜨지않게한다. MIN-depth pass는ZTestAlways/ZWriteOff/BlendOpMin으로역Z깊이상태에독립적이며명시Mesh/worldMatrix/viewport를사용한다. 빌드전64x64 GPU quarter-depth 테스트를통과해야BuildPipeline호출. 최초일반스모크는cold quick-start전환실패, legacy진단은도달했으나depthcoverage0이어서FAIL로기록. 새 --a2r-lobby-start 는초기로드뒤일반로비를열며legacy우회는영수증에서명시적으로불합격이다.

R3 최종: 근접한 동일 원화 14쌍을 실측해 기존 greedy 선택을 폐지했다. 원래113개좌표/ID유지, 3.3u인접그래프를오프라인DSATUR로색칠해기존고사리3종+덤불4종 variationAsset을데이터로공급한다. 원래원화를우선하고인접동일원화0쌍을보장, scale/yaw/flip/tint는기존고정ID변형유지. 선택원화의불투명발피벗재사용. 새원화/랜덤배치0.

## 19:30 최종 실행 영수증

최종빌드84127006 Succeeded/errors0, MIN-depth GPU probe LitOpaque/CardOpaque 실측.25. Player ca2f988a는legacy우회없이일반로비8경계·도보1829ticks/4974.3px/캠프도착/오류0/순간이동0/정체0, public userSaveChanged0/windows0/leftovers0. 깊이411828pixels/51draws. 식생113/3.3u인접동일0/좌표변경0/떠있음0. 기본카드/강/지면값은0fd8기준그대로이며variationAsset만추가. tools/a2r-plant-variation.cjs --check로읽기검증, 인자없이수동배정(원래좌표쓰기없음). 최종비교판은I:/EXODUSER-Storage/map25d/a2redesign/proof-a2r-r1930-vs-0fd8e9f19.png. 최초오류·단기FPS범위·다른빌드Player.log감시건·미검증범위는같은REPORT. VISUAL VERDICT: RETOUCH/총괄판정대기.

## 20:40 R2/R4 후속 계약

| 항목 | 현행 값/구현 | 보호 범위 |
|---|---|---|
| R2 | 전장 타원 폭45%/높이40%, 중심alpha .20→경계1.0 smoothstep(0,1), 밖불투명. MIN 선처리 앞줄기 깊이 뒤의 투명+불투명 줄기 픽셀 모두 버림. 북쪽은 스스로 흐려지지 않고 앞줄기와겹친픽셀만제외 | 남쪽밑동/.2초/히스테리시스/디더링0/장판수신제외. 식생·캠프카드는줄기제거대상제외 |
| R4 | 같은카메라 렌더 전 영웅screen bounds와겹치는적·탄 SpriteRenderer를영웅sortingOrder-8이하. 높은큐만같은source shader/material복제에서queue를맞춤. 렌더후즉시복원 | 액터atlas/텍셀/filter/rig/투영/소스shader변경0 |
| R4 윤곽 | 기존흰1texel step삭제. 별도companion에1.5screen px 선형alpha샘플 뼈색(.76,.72,.61) alpha .36 한면림. source Point는불변. 발밑1.8×1.35u 부드러운additive pool최대.12. 개인광4u/1.1 | Core·판정·원근LOCK 보존 |
| 다리 | 회청전역fogOFF 유지. 중립distance haze시작34u/density .002/상한.05. 국소A2빛줄기alpha0(단독해결실패, 아래HellFogFeature근본수정으로대체) | 캠프주황광·갈색/올리브·R3원화변형보존 |

화면판정은같은Player후기록. 기존19:30수치는이절에서대체한다.

20:40 검수 보정: 첫Player0a618546 도보/오류0, 원화접지0/인접동일0/좌표이탈0. 영웅3x에서 적HP바가몸을덮어후보교체보류. 정렬을LateUpdate(컬링전)에도적용하고카메라렌더후복원한다. NativeGame.A2Enemies.cs에는A2R이켜진경우만HP바가영웅screen bounds를덮지않게좌우로밀어내는호출1줄추가(HP·Core·표시조건불변). 영웅원본프레임명/겹침정렬개수와동일위치적sprite숨긴04b보조컷추가. 반사카메라는가림대상아니며전용깊이마스크를끄고주카메라에서만재활성화한다.

20:40 R2/R4 첫 제출: Windows build c89d8894/errors0, Player2749eb26/exit0/무창/실제세이브변경0. 일반로비8경계·Core1829ticks/4974.3px·순간이동0·캠프같은좌표. 겹침정렬10개/피크33개. 영웅3x와적sprite숨긴보조컷직접대조: 몸통·망토·무기가앞에보임/흰계단림없음/체력바회피. 32:9먼적29/16:9먼적15. 새웹카드떠있음0, 식생113/인접동일0/좌표변경0. proof-a2r-r2040-vs-e67a46f86.png. VISUAL VERDICT: RETOUCH(총괄최종판정및다리추가컷대기), R2/R4방향개선으로후보갱신가능판정. 다음REFERENCE_CONVENTIONS4·5·6.

## REFERENCE_CONVENTIONS 4·5·6 (76bf4ebad 후속)

| 항목 | 런타임 계약 | 보존/검증 |
|---|---|---|
| 4 바람 | C10/R4 sin(time*.72+phase)+.28sin(time*1.13+phase*1.7), 공통방향(1,.28), ID고정위상. 식생진폭.09u/나무.035~.09u. 높이제곱가중, 불투명발피벗y0 정점행고정 | 기존173카드/113식생/웹좌표·변형·원화·원근불변. 그림자/가림깊이도동일변형 |
| 4 눌림 | 원본영웅·가까운적최대32개의읽기전용좌표. 영웅반경1.2u/적.95u, 누적밀림진폭×4이하로제한 | Core충돌·보행·AI변경0 |
| 5 물결 | 기존수면shader를A2R전용복제로사용(원본공통파일수정0). 실제수면반사유지. 실제다리지지목최대8/반경3u파형. 발·사라진탄의물접촉(y<-.39)만최대24임펄스, 이동샘플.16s/발간격.38s, 감쇠3.2s/전파.48u/s | 물걷기강제추가0. 보행가능물접촉칸수와실제발/탄물결발생수별도기록. 미발생을검증PASS로올리지않음 |
| 6 공기 | 엔진ParticleSystem/새PNG0. 캠프반딧불최대16·alpha.23/life8s, 낙엽최대24·alpha.30/life12s, 낮은늪실안개최대3·alpha.018/life14s. CPU동일VP기준위쪽y.55~.72에서알파0으로감쇠 | 먼적실루엣우선. 안개원반/전역청회층추가0, 고정seed1103+kind*137 |
| 증명 | 본스모크일반입장/Core캠프도보 noTeleport와별개로, 그후다리1회고정pose를명시한--a2r-nature-capture. 캠프·다리동일자리nature OFF/ON컷,1920영상각10초. 실제CoreStepInput60Hz로먼적이동기록,10fps JPG실제시각샘플 | 순간이동0은본도보경로범위. 영상/다리보조pose는별도영수증. 사람플레이·밸런스QA아님 |

R2에서는정적RearClip property block을초기1회설정하고,더이상쓰지않는타원밖개별원CPU순회를제거했다. 렌더계약은76bf동일.

### 다리 베이지 덩어리 실제 원인과 교체

Resources/Shaders/HellHeightFog.shader의16step전체화면적분은RenderSettings.fog와독립이다. 고정화로좌표(38,-73.2)/(43.6,-69.6)/(40,-62.4)/(44.8,-56.8)/(32.2,-61)에localFire를더해다리위베이지덩어리를그렸다. A2HeightFog/국소빛줄기만바꾸던이전방법으로해결되지않았음. A2RLighting은실행중로드된HellFogFeature의isActive를저장하고A2R ON일때만SetActive(false), OFF/Destroy에서원복한다. 원본RendererData·공통shader·ProjectSettings/Packages수정0, 별도HellSsaoFeature는유지한다. 같은패키지10-bridge-{1920,3840}-legacy-fog.png와09-bridge-*-nature-after.png로패스ON/OFF를직접비교한다. legacyFogFeatures수를스모크영수증에기록한다.

물결접지보정: 연결성분을용접(1e-4u)한실제다리메시에서높이>=.7u/폭·깊이<=.6u/minY<=.05u/maxY>=.6u인원본지지목을찾아그xz중심을사용한다. 경계상자네모서리fallback은제거. 메시읽기뿐이며정점·UV·원본충돌변경0. 실제검출개수는nature영수증으로확인한다. 입자화면크기상한.012, 바람누적밀림최대진폭×4.

최종동일후보검증: build07f88b3e/errors0, Player7b61aa6d/exit0/window0/userSaveChanged0/leftovers0. 일반로비8경계→Core캠프1829ticks/4974.3px/순간이동0/정체0. 별도다리촬영pose1회는도보범위와구분. 웹173/3D중복16/바닥64/새카드뜸0/식생113/인접동일0/좌표이탈0. nearest315507pixels/34draws, 겹침정렬32/peak40, 먼적11/27(16:9/32:9,실행별전투상태차이있음). 캠프3초106.2FPS(범위제한). 최종영상각100frame/실제10초/1920x1080, Core상이동적각50개, 시각물접촉발19/탄1(누적), 실제메시지지목8/입자43/눌림액터32. 별도HellFogFeature1개ON/OFF다리비교로베이지5광산란덩어리·회청막제거직접확인, SSAO유지. 비교판proof-a2r-r2040-vs-e67a46f86.png/proof-a2r-bridge-fog-on-off.png/proof-a2r-nature-456.png. VISUAL VERDICT: RETOUCH/총괄최종판정·Mac검수대기. 전체맵·밀집전투성능·기존3D전물체접지검수완료주장없음.

## 21:45 맵 판정 1~5 / 21:55 CTO 연동 (검증 전)

| 항목 | 수정 계약 | LOCK |
|---|---|---|
| 1 | 카메라쪽대상, 화면높이>=.50(유지.46), 영웅보다깊이2u앞, 카메라-표면거리12u이내, 좌우15%에걸친거목은.2초에전체alpha.35(기존.20전장타원별도). 원경·지형이동0, 기존낮은수풀·숲벽이뒤에서보임 | 구도/34도카메라/나무위치불변 |
| 2 | 물표시는원본수면평면y=-.45와Core바닥밖도메인(tiles==1)에만. 기존물리본이GroundY+.015로마른지형에올라가던경로를-.445고정으로수정. 마른바닥(shader Water=0)에는물결/반사합성0 | Core/웹원화텍스처불변 |
| 3 | 기존수면원화albedo*.60→*.22, planarFresnel .48+.32→.12+.24. 실제기존횃불위치최대8개로긴주황반사줄을수면shader에서만합성(폭.075+.035*길이, 감쇠.48,8u종료). 빛원반추가0 | 다리·길>땅>늪>숲벽명도검수 |
| 4 | m_c1groot만원본Map.props (4100,3460),760×758.48px로원복·불투명발피벗접지/Y축빌보드. 원화사본변경0, tint(.82,.76,.58)/saturation.45로보라채도완화 | 다른웹좌표/원화/캠프/숲배치불변 |
| 5 | 별도림alpha .36→.50(1.5screen px), 발밑광반경=보이는영웅world폭*1.3. rigpixel은렌더된RT/mesh와실제layer30몸체bounds를읽는A2R표현adapter로만대응 | 영웅텍셀·rig-pixel코드수정0 |

1~5를이전1e4841030위에먼저체크포인트하고,21:55지시대로최신origin/unity/main정상병합. 충돌시멈추고보고한다. 새후보는--hero-render=rigpixel로빌드스모크/바로가기/영웅1x·3x촬영. 수정후검증전상태이므로시각PASS아님.

## 22:30 병합본 4895bf9c6 재검증

- 병합 완료 상태를 그대로 빌드했다. 추가 병합 없음. 빌드 원본은 4895bf9c6b4300aca7ec7515ecc4237ed405b612이며 이 전달 커밋은 바로가기 도구·문서만 바꾼다. 구도·34° 카메라·Core·원화·rigpixel 코드는 수정하지 않았다.
- 공용 실행기 build 0f81de48 오류0, Player 34848254 exit0/window0/실제 세이브 변경0/잔여 프로세스0. 일반 로비8경계→캠프1829ticks, 정체0/본 도보 순간이동0. 다리 보조 pose1회는 별도다.
- --hero-render=rigpixel 및 heroFrame=rigpixel live Point RT 확인. 겹침 정렬30/peak39, nearest320969pixels/35draws. 캠프3초110.1FPS는 해당 장면 한정이다.
- 바로가기 도구는 현재 영수증의 live rigpixel을 확인하고 같은 플래그·격리 세이브·무음을 넣는다. 일반 사용자 실행에는 스모크/자동 종료 인자가 없다.
- 증명: I:/EXODUSER-Storage/map25d/a2redesign/proof-a2r-4895bf9c6-vs-1e4841030.png. 실제 이전 캡처와 캠프·다리1920/3840 및 끝1x·마른 바닥3x·늪1x·밀집 영웅1x/3x를 비교했다. 같은 캠프 Core 도착점이며 전투 시각/적 위치는 다르다.
- 자가 화면 판정 RETOUCH: 끝 거목의 큰 면적, 마른 바닥 회청 반점, 늪의 물 읽힘이 남는다. 시각 PASS나 Mac/Metal 검증 완료로 표시하지 않는다. 22:30 지시에 따라 병합본을 사용자 후보로 전달하고 맵 총괄 판정을 기다린다.

## 22:55 방법 전환: 알파 대신 전경 제외

- origin/unity/main385e76ce1 문서 정리를 정상 병합했다(10545b0da6). CHANGELOG 한 곳의 충돌은 양쪽 절을 모두 보존했다. 런타임 병합 변경0.
- 남쪽/카메라15u이내 줄기 그룹은 밑동 화면 아래 또는 투영 높이55%이상이면 Renderer만 제외한다. 끝 액자는 한쪽 최대1개·폭12%이하·불투명. 큰 끝 전체알파 경로는 사용하지 않는다. 데이터/위치/메시/충돌 보존, 제외 이유·원본 이름·투영 크기를 각 촬영의 *-composition.json에 기록한다. 내부 전장 타원은 유지한다. 제외된 수피 위 이끼/버섯은 같은 경계상자 안에서 함께 숨긴다.
- 회색 접지 가설: HD2DContact는 선형RGB(.025,.03,.035)를 SrcAlpha로 섞어 어두운 바닥을 청회색으로 밝힌다. A2RContact는 해당 접지 재질만 런타임 복제해 검정으로 감쇠한다. 원본 actor/rig/shared shader 및 GroundSkillReceiver 재질은 그대로다. 동일자리 diag-contact-legacy-3840 / diag-contact-dark-3840으로 이 원인을 검증한다.
- 영웅 발밑광: 사각 Quad를 64방향·4동심 지형추종 원형 메시로 교체. RGB(.65,.24,.055), 반경=영웅폭1.3배, 경계0의 부드러운 감쇠. 보조 점광도 약한 주황색. diag-foot-light-off/on-1920으로 발밑광 기여를 분리한다. 영웅 텍셀/rigpixel 코드 수정0.
- 늪의 원인: 기존 Core tiles==1 도메인은 보행가능한 실제 얕은 수면422칸도 지웠다. 실제 기존 TerrainHeight<-.46의512² 도메인으로 바꾸고 Core는 읽기조차 변경하지 않는다. diffuse-only moat 덮개가 반사를 가리므로 기존 실제 물 재질과 planar RT를 공유한다. 수면 원화는 더 어두운 갈색/녹갈색으로 조명하고 실제 횃불 위치의 주황 반사 줄을 남긴다. 지형/물높이/카메라 불변.
- 새 그림0/원화 텍스처 변경0. 새 후보 빌드·스모크·화면 검증은 아래 최종 결과로 별도 기록한다.

22:55 첫 검증: build6487b5a7 오류0, Player429b85c3 exit3/창0/세이브변경0. 실제 로비/Core1829ticks/도착/오류0이나, 제외 후 가림 RT에 실제 표면0픽셀이라는 기존 검사가 실패했다. 이 상태를 PASS/바로가기 갱신으로 올리지 않았다. 캠프 회청 반점과 사각 발밑면은 제거 방향을 확인했다. 늪은 환경 하늘 반사 때문에 청회색으로 밝았다.

검사/늪 보정 후 1회 재검증: 자연 장면 깊이0이면 본 컷 촬영 뒤 작은 QA 전용 표면을 영웅 앞에 잠깐 세워 **실제 메인카메라 nearest GPU>=8pixels**를 요구한다. 임시물은 즉시 제거하며 Core/본 비교 컷에는 없다. 자연 장면 또는 이 GPU probe 중 하나를 바로가기 관문으로 확인한다. 단순히 검사를 제거하거나0을PASS로 읽지 않는다. actual planar reflection은 유지하고, 별도 sky cubemap 환경 반사를 끈 뒤 실제 반사의 명암을 어두운 녹갈색으로 제한한다. 다음 실패 시 중단·보고.

22:55 최종 검증: 빌드 998e40e3f21b03f9c4cfe6c074f1da207b64637d, 공용 build f8158d6f 오류0/Player226ec625 exit0·창0·실제세이브변경0·잔여프로세스0. 일반로비8경계→Core 캠프1829ticks/4974.3px/정체0/본도보순간이동0. 자연 가림 RT0픽셀은 제어 표면 probe1560pixels로 실제 메인카메라 경로를 확인했다. rigpixel live Point RT, 겹침30/peak47, 캠프3초90.4FPS(해당장면한정), 먼적14/29(16:9/32:9).

proof-a2r-r2255-vs-4895bf9c6.png / proof-a2r-r2255-diagnostics.png 직접 확인. 네 핵심 컷의 남쪽 전경 제외7/7/9/9개·원본이름16종, 끝액자0/0(최대1·폭12%계약), 끝 전체반투명0. 각 원본 ID/이유/투영크기는 I:/EXODUSER-Storage/map25d/a2redesign/r2255-exclusions.json 및 REPORT.md에 기록했다. 북쪽 기존 숲/거목은 남긴다. 마른땅ROI 접지 진단은 30131픽셀 변화 중28573픽셀이 어두워졌고, 청회 반점이 사라지는 것을 1x로 확인. 발밑광OFF/ON은 따뜻한 원형/모서리0, 영웅3x 원본텍셀유지. 늪/땅/다리 고정ROI luma18.19/37.99/42.49, 늪에 주황 반사줄 확인(전체명도자동PASS판정은아님).

이번1~4는 개선 후보로 전달 가능 판정, 맵 총괄 최종판정·Mac/Metal 미검증. 전체맵AAA/밀집전투성능/사람1판 검증완료 주장없음. 웹카드 원본173/3D중복16/바닥64/새카드뜸0/식생113/인접동일0 유지. 원화·Core·rigpixel·34도카메라·장판수신셰이더 변경0. 바로가기 rigpixel 플래그·격리세이브·무음을 유지한다.

## 00:10 시야선 우선 — 앞 고목 복원 / 세이브 명시 격리

- 23:20/본편준비/비교판은 이번 범위에서 제외한다. 앞 고목 화면밑동/55%/12%/최대1개 숨김 규칙은 삭제했다. 원래 고목/카드의 원본 위치·크기·가시성 복원. 전체알파0, 원형 구멍 밖은 불투명.
- 대상은 실제 카메라→영웅몸중심/14m안적·탄/앞고목뒤먼적의 mesh 표면 시야선이다. 게임플레이와 분리한 LocalPhysics3D 질의 장면에서 원본 mesh의 양면 query proxy만 사용한다. 바닥·늪·장판수신재질·actor/HUD 제외. CPU mesh ray+원화 alpha 검사 후 해당 renderer/대상 bit만 활성.
- 영웅원 반경=화면키1.6배, 적·탄=키1.2배/최소24px, 최대32/가까운순. 안쪽70% alpha.1, 바깥30% smoothstep로1.0. .2초 페이드/.12초히스테리시스, 현재카메라행렬로매프레임계산. 실제원형영역에서 nearest surface만그려뒤줄기누적을막는다. 기존영웅뼈색윤곽유지/actor텍셀불변.
- A2RHumanSave.Bind의 CandidateDefault 격리 분기 삭제. --a2r-play-sandbox 있을 때만 사용자 샌드박스 binding, QA는 기존 명시 --unity-qa-sandbox 경로를 사용한다. 표현기본ON과저장경로분리, 실제세이브쓰기0.
- --a2r-sight-smoke는 일반로비→Core캠프 뒤 실제나무3지점을 원래 Core StepInput/BFS 경로로 이동(보조이동은가속,플레이어좌표대입0), OFF/ON1920·3840 원본컷과 자연 mesh 가림수/GPU픽셀을 요구한다. 적탄은 명시한 Core projectile fixture다. 남→북10초영상은실시간60Hz Core보행. 작은테스트판으로실제나무검증을대체하지않으며바로가기에도sightVerified를요구한다.

00:10 첫 Playerb2abb29e: 일반로비/Core캠프1829ticks·오류0/창0/세이브변경0. 실제가림표면/GPU>0과적탄원은확인했으나, 원래Collider의원점내부/비균일계층변환 때문에 앞줄기일부가 빠졌고, 보조Core도보가필러에서막혀FAIL. 바로가기갱신보류.

보정: 실제Renderer.worldToLocalMatrix/원본triangle+UV를직접읽는양면BVHray로교체(게임물리콜라이더/씬추가0). 렌더와동일한shear/scale, 내부시점도검사한다. 보조BFS는기존FullRunCanMove와동일한Core필러차단을읽어피한다. Core수정/순간이동0. 불필요한shader hole bits0순회즉시반환. 이수정후한번검증하며다시실패하면중단·보고.

## 00:10 결과 — FAIL / 두 차례 실패로 중단

- 최신 빌드 0e994de9efd0be6f3f14c7e3aae48764d868c53b, 공용 build e1dc1c88 오류0 / Playerc203801e exit3. 첫 Playerb2abb29e도실패. 창0·실제세이브변경0·잔여프로세스0, 로비→캠프1829ticks/정체0/좌표대입0은통과했으나P0시각검증은실패했다.
- 실제나무2지점과적탄에서CPU가림수/GPU픽셀>0은기록됐지만, 원본화면의큰줄기중앙이불투명해영웅은뼈색윤곽만보였다. 표면수>0만으로통과시키지않았다. 세번째지점도미발견(No legal real-tree sight point:3).
- CLAUDE.md §9의두번실패규칙에따라추가구현·빌드중단/바로가기승인갱신보류. 고정a2r-build는실패후보로덮인상태이며,바로가기대상경로는같지만메타데이터/이력SHA는갱신하지않았다. 이전승인바이너리가유지된다고주장하지않는다.
- 실패증명 I:/EXODUSER-Storage/map25d/a2redesign/SIGHT_PROOF.md: 나무2곳OFF/ON1920·3840/영웅1x,적탄컷,남→북10초100frame영상. 세번째컷없음을명시했다. 비교판·본편준비·23:20작업은수행하지않았다.
- 앞고목숨김규칙삭제/원래고목복원, HumanSave의기본격리삭제는반영했다. --a2r-play-sandbox인자가없으면Bind즉시반환. 실제LocalLow로스터3파일의크기/수정시각/캐릭터수읽기전후동일,실제쓰기0. 무인자일반Player를띄운것은아니므로일반로비UI검증주장없음.
- 다음진단후보: HLSL uint비트마스크/정수count를MaterialPropertyBlock.SetInt/Shader.SetGlobalInt로전달하고있다. 설치Unity6 XML은이API가폐기됐고SetInteger/SetGlobalInteger를사용하도록명시한다. 타입전달문제가원형중앙누락원인인지추가확인이필요하며현재미수정·미검증. source단계컴파일0을시각PASS로바꾸지않는다.


## 00:50 재검증 + 00:30 바닥 원화

맵 총괄 a5bec4992의 float 3분할 마스크를 그대로 사용한다. 지정 바닥형 m_c1groot/m_c1gtoxicf/m_c1pool/pit_poison만 원본 sourceX/Y·크기·UV를 보존한 32×32 지형 메시로 바꾼다. 지형과 수면 중 높은 곳 위 1.2cm에 놓고 바람·원통 빌보드·물체 AO·가림 등록에서 제외한다. m_penta_circle 등 나머지는 세운다. 원화 55종(189항목) 직접 검토표는 I:/EXODUSER-Storage/map25d/a2redesign/REPORT.md에 기록한다.

00:50 지시의 실제 나무 2~3곳 중 두 곳(캠프 원화 나무·다리 옆 네이티브 고목)을 Core 도보로 방문해 1920/3840 OFF/ON을 검증한다. 적 탄막 1곳·10초 실제 도보·독 웅덩이 서있음/투영 원본 캡처도 같은 빌드에서 낸다. 00:55에 따라 신규 시도는 고정 a2r-build-next, 승인 실행본 a2r-build와 분리한다. Runtime/Editor C# 컴파일 오류 0. 빌드/실제 구멍/스모크는 아직 미검증이며 다시 실패하면 중단한다.


### 00:50 실제 재검증 — FAIL, 추가 시도 중단

실행 소스 c3e2cdecefc517855e3d1599de290bafcee21316. 공용 빌드 b2ffb4c5 PASS/오류0, Player34224363 exit3/창0/오류0/실제세이브변경0. 다리 옆 네이티브 고목은 float 마스크 수정 후 영웅 몸과 검이 실제로 보인다. 그러나 캠프 sight-1의 앞 네이티브 가지는 ON에서도 영웅 몸을 가려 1920·3840 모두 시각 FAIL이다. 독 웅덩이 목표(6700,2424.68) Core 경로도 없어서 바닥형 4종의 현장 화면 검증은 미완료다. 로비→캠프 원래 경로는 도착/순간이동0. 생성 상태의 floor-projection 4/0을 화면 PASS로 쓰지 않는다.

증명 I:/EXODUSER-Storage/map25d/a2redesign/SIGHT_PROOF.md(원본 OFF/ON·1x·탄막·10초 영상·수치), 189항목 분류표 REPORT.md. 맵 총괄 판정 전/배포 금지. 실패본은 a2r-build-next만 갱신했고 a2r-build·바로가기·shortcut-history는 변경하지 않았다. 추가 코드 수정·재빌드 없이 중단했다. 00:55에 따른 별도 tools/promote-a2r-candidate.ps1은 MapLeadPass와 스모크/바닥 증명 통과를 모두 요구하며 이번 회차 실행하지 않았다. 자동생성 메타/설정447개 복원, 사전 WIP는 제외.


## 01:20 원래 장면 물체 재질까지 적용

맵 총괄 판정: 이전 sight-2/탄 원형 구멍은 PASS, sight-1 잔존은 별도 원주민 물체 적용 범위 결함이다. 기존 실제 OFF/ON 재현을 회귀 검증으로 유지한다. 등록을 a2Root 하위에서 A2Field가 속한 원래 장면 전체 큰 메시로 확대하고, 원래 재질의 런타임 사본에 구멍 셰이더를 지정한다. 원본 material/texture asset은 불변이다. 기존 재질/MPB의 색·노멀·텍스처를 보존하고 renderer별 전체 material slot의 구멍 지원/텍스처 동일성 native-material-coverage.json을 남긴다. 바닥·늪·물·GroundSkill 수신 재질은 제외한다. 반경은 영웅 화면 키1.3배, feather40%다.

웅덩이와 영상 목표는 현재 Core 연결 성분 전체의 가장 가까운 걷기 칸에서 고른다. 이전 (6700,2424.68) 실패는 웅덩이 도착 후 영상 시작점이었다. 종전 문서의 웅덩이 이동 실패 원인 기술은 이 기록으로 정정한다. 실제 웅덩이 컷이 가린 것은 여전히 미검증이었다. C# Runtime/Editor 컴파일0. 공용 a2r-build-next만 1회 재빌드/같은 실행본 OFF/ON·탄·웅덩이·10초 촬영 예정, 맵 총괄 판정 전. 바로가기/이력/실행본 a2r-build 변경 금지. Core/카메라34°/rigpixel 불변.


### 01:20 재현 검사 보강

첫 빌드408dac27/Playeradbfa97c는 원래 물체986개 재질 사본/원화·노멀 텍스처와 색 유지가 확인됐지만 sight-1 상반신이 계속 가렸다. 안개 DistanceHaze 한 건이 검사에서 잘못 집계됐고, 웅덩이 촬영 후 영상 사전 이동이 막혔다. 이 결과를 PASS로 쓰지 않는다.

추가 가설 “카메라가 경계 안에 있으면 삼각형을 놓침”은 실제 Unity 검사 e518fc4e에서 재현되지 않아 구현하지 않았다. 반면 머리만 가리고 중앙은 열린 원래 메시 재현 검사 VerifyPartialHeroSight는 2edd22d0에서 의도한 실패를 보였다. 중앙 외 머리·하단·양옆으로 영웅 부분 가림을 검사해 하나의 동일한 원형 구멍을 열도록 바꾸자 525bed95에서 통과했다(오류0). 영웅/액터 그리기는 불변이다. 안개 검사 제외를 보강하고, 기존에 검증된 다리 구간에서 10초 영상을 먼저 찍은 다음 웅덩이의 가장 가까운 연결 걷기 칸으로 간다. 재검증은 같은 고정 next 폴더만 덮어쓴다.


### 01:20 최종 실행 — 맵 총괄 판정 전 / 전체 FAIL

실제 빌드 소스 7219d5eeb2240fd7381913bac9ac82ae0f01621a, 빌드7e240690 오류0, Player4075b746 exit3/오류0/창0/실제세이브변경0. 원래 장면에서 분류된 큰 MeshRenderer986개 모두 구멍 지원 재질 사본/텍스처·색 보존 검사 통과, 미지원0. 이 수치는 분류된 MeshRenderer의 재질 검사이며 화면의 모든 draw call 검증을 뜻하지 않는다.

같은 sight-1의 상반신 가림은 1920·3840 모두 남았다. 부분 가림 회귀 테스트는 통과했지만 실제 컷 partialHeroSurfaces는 모두0이라 실제 해결 증거가 아니다. sight-2·탄 구멍은 작동 유지. 실제 잔존 원인은 미확정이다. Core 도보는 웅덩이 목표 전에 (5189.3179,3689.4417)에서 멈췄으며 목표 거리2466.3px, floor-projection.arrived=false. 웅덩이 컷을 유효 증명으로 쓰지 않는다. 다리 구간 남→북10초/100프레임 영상은 최신 실행으로 완성했다. 원래 로비→캠프는 도착/순간이동0.

실제 컷/1x/1920·3840/탄/무효 웅덩이 컷/영상/영수증: I:/EXODUSER-Storage/map25d/a2redesign/SIGHT_PROOF.md. 같은 실제 결함이 두 검증에서 남아 추가 후보 제작 중단. a2r-build-next만 덮어썼고 a2r-build·바로가기·이력은 변경하지 않았다. Core/카메라/rigpixel/원화 텍스처 불변. 다음 진단은 실제 영웅 화면 위치와 가림 draw call/시야선의 정합을 먼저 대조해야 한다.
