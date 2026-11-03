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
