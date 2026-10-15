# 다크드루이드 내려찍기 접촉 동작 · r5 · 2026-10-11

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

## 2026-10-12 · 현재 상태 정정

**USER_REJECTED_OLD_MODEL / VISUAL FAIL — 구형 f0 모델의 현재 품질 인수는 거절됐다.** 사용자 지적은 치마 파손·모델 원형과 최신 검은 드루이드 자료 불일치다. 아래 과거 기술 검사·카메라·재시작 기록은 보존하되, 화면 안에 들어온 본체를 온전한 의상이나 승인 모델로 인수한 것으로 읽지 않는다.

| 정정 항목 | 현재 인수 경계 |
|---|---|
| 사용한 구형 source | assets/sprites/boss/boss_dark_druid_f0.png, 355×541 RGBA, SHA256 74060fc68eb5f6dd76771272e973b2c5038e2939286c411cb2bc9a5bbcf0fa68. 최신 검은 드루이드 승인 모델로 대체해 기록하지 않음 |
| 모델 결함 | 원화 가장자리 alpha 및 r5 의상 분리 경계·변형 틈이 확인됨. camera contained / fullbody screen-inside는 의상 intact·모델 품질 PASS의 근거가 아님 |
| 보존 / 다음 인수 | 기존 이미지·fixture·commit·12종 math/bridge 검사·overlay restart 기술 성과는 이력 보존. 10/9 black maxSW 후보 exact 선택·모델 승인은 pending이며 새 모델·전체 완성 주장0 |

[구형 source·의상 topology 정정 수치](FDG_DARK_DRUID_SMOOTH_MOTION_20261012.md). 기본 모델과 역사 QA 선택 gate의 최종 코드 계약은 root의 확정 기록을 따르며, 이 정정은 미확정 계획을 계약값으로 추가하지 않는다.

소유 checkout /Users/fordeargamers/the-exoduser. 기존 높은 지팡이 머리가 접촉까지 남던 동작을 어깨→팔→손→지팡이가 함께 전방 아래로 내려가도록 저작했다. 실제 native 소비에서 발견한 GPU 캐시의 첫 준비 포즈 고정도 자기 raster canvas 갱신으로 수리했다. 기존 r3/r4 원산출·검사·재생·저장 인수는 동결하며, 기술 검사와 실제 시각 판정을 구분한다.

## 구현 접점과 보호 계약

| 항목 | 현재값·소비 위치 |
|---|---|
| 제작 진입 | http://127.0.0.1:3333/tools/fdg-studio/index.html?authoring=dark-druid-slam-contact-r5&v=slam-contact-r5-b |
| own 제작 저장 | fdg.studio.dark-druid.slam.contact.r5; 다른 authoring/default 키와 분리 |
| native 진입 | http://127.0.0.1:3333/game.html?test=1&testchar=1&bosstest=0&fdgDruidQa=r4&fdgDruidSlam=r5&v=slam-contact-r5-b |
| gate | fdgDruidSlam=r5 AND 기존 exact r4 QA storage.active AND fdgDruidSource=legacy-f0 명시 선택만 구형 소비; r5 단독 main/user save 진입0 |
| IDs | rig dark-druid-slam-contact-r5 / project dark-druid-slam-contact-scene-r5 / node dark-druid-slam-contact-body-r5 / resource dark-druid-slam-contact-resource-r5 / attack dark-druid-native-slam-contact-r5 / idle dark-druid-slam-contact-idle-r5 |
| loader | installDruidSlamNativeBridge의 optional clipId, loadDruidSlamNativeBridge의 optional rigUrl; 둘의 기본값은 기존 r3. selected clip·ready original texture 불일치시 기존 caller catch/fallback |
| cache suffix | r5 bridge slam-contact-r5-cache2; r5 authoring module·두 fixture slam-contact-r5-b. 기존 r3/default boss-slam-r3-final 및 다른 Hell 모듈 suffix 유지 |
| GPU 갱신 | r5 clip의 raster 재작성 완료때 raster._glVer=(raster._glVer||0)+1. 기존 WebGPU _getTex의 src._glVer 계약 소비. 같은 paused pose는 재래스터·revision 증가·재업로드0; actor/전투 clock 변경0 |
| 읽기 snapshot | getRenderSnapshot(actor): exact last actor일 때 rigId,clipId,time,facing,rasterRevision,bounds(left,top,width,height) clone; 다르면 null. getSnapshot(actor)는 기존 phase 관측 |
| native 시간 | wind26/22/17/14/8f + 선택 delay14f, strike8f, impact recover40→다음 update 공용20 clamp. PHYS_STEP1000/60·FSM 그대로, 저작 markers0/1/1.16/2.6초로 pose만 대응 |
| native 방향·피해 | _weaponAng=-1.2+(1-st2/8)*2.4 그대로. hit는 bossXY 원형 _slamR=1000+stage*30+phase*80이며 facing/weaponAng 각도 gate 없음. cos(facing)<0 X mirror만 소비; 이번 전방은 동일 정면 투영 +X와 화면+Y 하강 |
| 보호 | native actor 강제이동0, AI·damage·탄·Q/E·시간·save·map/nav/LOCK·원PNG 변경0. blackBean Q전용/E금지. 게임 원화24장·화면24FPS·전체엔진 완료 선언0 |

## 최종 생산 데이터

| 항목 | 최종 candidate-b |
|---|---|
| 배송 rig | tools/fdg-studio/fixtures/dark-druid-slam-contact-r5.rig.json · 848593B · SHA256 c20106dc2d691413ee642e8f4517e9d0313f263b076fb8a96e493ecf041da660 |
| 배송 scene | tools/fdg-studio/fixtures/dark-druid-slam-contact-r5.fdg.json · 955189B · SHA256 23e220379a3d381afdf93b06fb835a25ae337f6960d478b638021045ce681848 |
| 구조 | 19본 / 3729정점 / 4680삼각형 / 1재질 / 2clips; r3 skeleton·mesh·weights·UV·materials exact 유지. 기존 source355×541RGBA, origin[221,526], 150px/model unit |
| attack | 2.6초/24FPS/nonloop/14tracks×15keys. 시점[0,.15,.45,.75,1,1.06,1.09,1.12,1.16,1.26,1.42,1.65,1.95,2.3,2.6] |
| idle | 2초/24FPS/loop/10tracks×9keys. 동일 원 r3 대기 track values, 새 ID로 복귀 |
| 오프라인 팔 | 기존 2본 IK negative elbow branch. upper=Math.hypot(36,46)px / fore=Math.hypot(45,9)px; 팔 local T0, staff=leftHand child T0/R0·staff track0, head 독립, root/boots track0 |
| 1.09 추가 이유 | candidate-a leftHand1.06→1.12 localR delta−3.2094947이 shortest slerp 반대호를 만듦. 추가한1.09 키로 각 interval<π, max2.4865451992(leftHand1.42→1.65). phase endpoints·1.16 접촉·geometry 유지 |
| 접촉1.16 sourcepx | shoulder[224.396949,305.535899], hand[289.396949,367.535899], crown probe[313.956135,525.652459]. crown−hand=[24.559186,158.116559] |
| 준비→접촉 sourcepx | crown[310.412564,509.342386], hand[221.704321,204.634905], body[67.497757,174.145014]. 숫자는 geometry 측정이며 physical hit target 좌표가 아님 |
| green core | UV center[57,110]/radius30로 제작 확인한30tri 모두 staff rigid1. 넓은 UV[10,30..101,172]455tri는 staff451/head4; head4는 x98..101/y47..52 뿔 외곽으로 core 밖 |
| 연결·변형 | boots drift0, hand–staff skin drift0. contact rigid sleeve/staff edge ratio≈1, body1.759062/head1.240059. 숨은 관절 면은 기존 저작 추정; mesh 재분류0 |
| 외투 | coat extrema1.42초, contact1.16보다 .26초 뒤. bind recovery2.6·idle return.35초. 새발걸음/actor teleport0 |
| 원화 접근 | 제작에 필요한 original PNG view1, byte decode0/write0. builder PNG read0/write0. PixelLab/새원화 생성0, r3/r4 fixture 덮기0 |

## 실제 화면·재생·저장

증거 E=/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-slam-contact-r5/. candidate-a의 GPU 고정 화면·최초 실패검사·중간 저장은 candidate-a/에 보존하며 최종 인수에 합산하지 않는다. 누적 tick 값이51만큼 오프셋된 중간 helper JSON도 실패 디렉터리에 남겼다. 아래 candidate-b 다섯 장은 각 공개 UI 입력 수를 명시하여 새로 기록했다.

| 실제 native 원본 | 공개 manual tick 누계 | 실제 state/st2 | 저작 sample초 | GPU rasterRevision |
|---|---:|---|---:|---:|
| frames/01-anticipation.png +json | 8 | bossSlamWind18 | 0.3076923076923077 | 9 |
| frames/02-downswing.png +json | 25 | bossSlamWind1 | 0.9615384615384616 | 26 |
| frames/03-contact.png +json | 34 | recover40 / 기존 실제 impact | 1.16 | 35 |
| frames/04-rebound.png +json | 39 | recover16 | 1.448 | 39 |
| frames/05-recovery.png +json | 51 | recover4 | 2.3120000000000003 | 51 |

공개 패턴 준비·side340px·HP3000 fixture·frame camera(2880,2060,zoom.5)·QA 표시scale.5를 사용했다. actor 이동은 기존 native 갱신 결과이며 저작 강제이동0이다. 각 PNG는 canvas1280×720 전체 원본이다. gameFrameCounter=UNAVAILABLE이며 입력tick·performance.now·native state/st2·authoring초는 별도로 기록한다. native 배경·기존FX·까마귀 대사·HUD가 포함된 실제 화면으로, FX0는 별도 authoring 소비자에서 확인했다.

| 증거·검증 | 최종 관측 |
|---|---|
| 전체 다섯장 보드 | frames/slam-five-poses-full-body-board.png · 2632×2488/4950170B. 원본1280×720 각각1:1, 2열+마지막왼쪽1장. 각panel RGB exact·화면 배치 crop 관측만 보존. 망토/의상 intact·모델 품질 인수0 |
| native 정상속도 | native-play/87actualJPEG + frames.json, CDP first→last3.841591835초. 공개pause해제→native slam→idle→pause; GIF slam-native-play.gif640×360/15698823B/3880ms(관측3840ms 양자화+미관측 마지막hold40ms) |
| FX0 정상속도 | authoring-play/70actualJPEG + frames.json, first→last4.518158197초. 공개play idle→r5attack선택→자동idle return→stop; GIF slam-authoring-fx0.gif960×540/11113808B/4560ms(관측4520+미관측hold40). FX0/1024, time scale변경0 |
| 파생 원칙 | 전체 원본 보존, GIF 균일축소만, timestamp10ms 양자화. crop/보간/합성포즈/duplicate추가/몸체교정0. 각gif-receipt.json·r5-derived-artifacts-receipt.json에 SHA·재개방검증 기록 |
| 실제 시각 | contact에서 green crown이 손 아래·몸 앞·발 높이 부근으로 내려감. 어깨/몸통 숙임과 팔/손staff 연결을 FX0에서도 확인. 외투 후행→복귀는 당시 동작 관측. 구형 f0/치마 파손에 대한 현재 모델 인수는 FAIL / USER_REJECTED_OLD_MODEL |
| 성능 한계 | FX0 authoring재생 표시21FPS/render29.5ms 관측. 60FPS 성능PASS 아님. native pausedFPS106..117은 정상 실전부하 benchmark 아님 |
| own 최종Save/reopen | candidate-b publicSave1/reload1; key fdg.studio.dark-druid.slam.contact.r5. 변경 전 candidate-a preliminarySave/reload1은 별도 보관하며 최종1에 합산0 |
| saved payload | 955193B/SHA256 05815deb8cd7249cd93c9612388690becd3420f592e500ddb69042a7edd22933. saved string exact·sceneProject/rig/skeleton/3729posed vertices/19bonePositions exact |
| 보존 설정 | node[4150,7360,0],scale55,camera[4150,7300],yaw/pitch0,followfalse,attackclip/time1.16/transitionnull,idle return.35. 재열기 ownerclock0/runningfalse; ownSave/reopen receipt 참조 |
| native 저장 | 이번 QA설정저장button0·기존격리QA 재감사0. main 저장/API/사용자main 입력0 |

## 새 의미 검사와 syntax

| 검사 | 결과·범위 |
|---|---|
| test/fdgDarkDruidSlamContactPose.test.mjs | 신규4그룹. a최초1PASS/3FAIL; 잘못된 비교2건과 실제slerp1건 수리 후 affected3만3/3PASS. 고유4PASS=first1+affected3, 성공1 재실행0 |
| pose 의미 | geometry보호·green core30tri/동시점hand비교·2본원길이/localT0·head독립/handstaff skin·15keys+14midpoints+1.14=30samples·소매/stretch/외투지연/bind복귀. 기술수치가 실제 시각판정을 대체하지 않음 |
| test/fdgDarkDruidSlamContactBridge.test.mjs | 신규3그룹. a최초2/2PASS417.1745ms + finalB/cache2 새affected1/1PASS254.762792ms. actual loader/hook→B rig/clip/time/rasterRevision, 실제game WebGPU _getTex를 VM소비하여 새revision마다upload1·동일pauseupload0. 앞성공2 재실행0 |
| 검증 한계 | mockImage로PNG byte읽기0. oldr4의20검사·기존suite 재실행/합산0. 새고유7PASS는 동일시점 일괄7회 실행이나 전체게임 QA PASS가 아님 |
| syntax | 최종변경소스 및 Studio/game inline module 개별parse + diff whitespace. 결과 E/new-syntax.json |

## MAP PRODUCTION REPORT · §23

| 항목 | 이번 보고 |
|---|---|
| STAGE | 기존 dark-druid NORMAL 격리r4 arena, r5 접촉동작/카메라 전투QA만 |
| MASTER PLAN | silhouette/regions/mainroute/sidespaces:기존MAP/SSOT 변경0. 이번route 신인수 없음 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes:기존유지, geometry수정0 |
| LARGE | assets/composites/overlap/repeated silhouette:기존arena유지, mapasset제작0 |
| MEDIUM | connections/remaining holes:변경0·전체map 재검사 없음 |
| GROUND | shadow/contamination/structure integration:기존유지·환경 전체시각PASS 추가0 |
| PLAYABLE | 기존native arena/pattern/HP fixture; torso→팔→손→staff 전방하강/외투후행/boots고정 확인. travel/breathing/threat 전체map 인수 범위 아님 |
| LANDMARK | primary/secondary/tertiary:기존유지·새landmark제작0 |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 중 ARENA+같은정면 전방하강contact 관측. 나머지는 이번UNOBSERVED·world/camera LOCK 변경0 |
| TECH QA | native hit tick/angle/phase 보호·GPU새이미지갱신·ownSave/reopen 확인. route/collision/page전체404/loading/seam/실전성능 합격 주장0 |
| FILES | builder+2fixtures+bridge+game opt-in+Studio 진입2+새test2+정본+관련docs5+CHANGELOG_SYNC. foreignWIP stage/복구0 |
| GIT | owned 정상checkpoint1, push0/deploy0. commit hash는 정상commit후 E/final-receipt.json에 기록 |
| VISUAL VERDICT | 현재 모델 인수 FAIL / USER_REJECTED_OLD_MODEL. 접촉동작의 전방하강은 당시 기술 관측이며, 구형 source·의상 틈의 visual 합격 근거가 아님 |
| NEXT PASS | 이 접촉단위 이후 다른인간형기술/변신·전체boss시각은 별도인크리먼트. 이번 범위를 넘어 완성 선언0 |

잔여 원화정보는 정확1건: **SOURCE_GAP: 원화 없는 뒤쪽·겨드랑이·옷 속 정본 표면/텍스처 미확보**. 숨은면은 ENGINE_AUTHORING 추정으로 유지하며 원PNG복원이나8방향완성으로 보고하지 않는다.

## 배송clip 전체키 표 · JSON exact

T는 model XYZ, R은 radian XYZ, time은 저작초다. 숫자는 최종shippingJSON 그대로이며 native 변환은 위 계약만 따른다. root/boots/staff는 track없음, previewpose={}, previewclip=idle/time0/playingfalse/camera(yaw0,pitch0,zoom1).

### dark-druid-slam-contact-idle-r5

| duration | fps | loop | tracks |
|---:|---:|---|---:|
| 2 | 24 | true | 10 |

| boneId | time | T XYZ | R XYZ |
|---|---:|---|---|
| spine | 0 | [0,0,0] | [0,0,0] |
| spine | 0.25 | [0,0,0] | [0,0,0.004242640687119285] |
| spine | 0.5 | [0,0,0] | [0,0,0.006] |
| spine | 0.75 | [0,0,0] | [0,0,0.004242640687119286] |
| spine | 1 | [0,0,0] | [0,0,7.347880794884119e-19] |
| spine | 1.25 | [0,0,0] | [0,0,-0.004242640687119285] |
| spine | 1.5 | [0,0,0] | [0,0,-0.006] |
| spine | 1.75 | [0,0,0] | [0,0,-0.004242640687119287] |
| spine | 2 | [0,0,0] | [0,0,-1.4695761589768239e-18] |
| chest | 0 | [0,0,0] | [0,0,0] |
| chest | 0.25 | [0,0.00282842712474619,0] | [0,0,0.006363961030678927] |
| chest | 0.5 | [0,0.004,0] | [0,0,0.009] |
| chest | 0.75 | [0,0.0028284271247461905,0] | [0,0,0.006363961030678928] |
| chest | 1 | [0,4.898587196589413e-19,0] | [0,0,1.1021821192326178e-18] |
| chest | 1.25 | [0,-0.00282842712474619,0] | [0,0,-0.006363961030678927] |
| chest | 1.5 | [0,-0.004,0] | [0,0,-0.009] |
| chest | 1.75 | [0,-0.002828427124746191,0] | [0,0,-0.006363961030678929] |
| chest | 2 | [0,-9.797174393178825e-19,0] | [0,0,-2.2043642384652355e-18] |
| head | 0 | [0,0,0] | [0,0,0] |
| head | 0.25 | [0,0,0] | [0,0,-0.00565685424949238] |
| head | 0.5 | [0,0,0] | [0,0,-0.008] |
| head | 0.75 | [0,0,0] | [0,0,-0.005656854249492381] |
| head | 1 | [0,0,0] | [0,0,-9.797174393178825e-19] |
| head | 1.25 | [0,0,0] | [0,0,0.00565685424949238] |
| head | 1.5 | [0,0,0] | [0,0,0.008] |
| head | 1.75 | [0,0,0] | [0,0,0.005656854249492382] |
| head | 2 | [0,0,0] | [0,0,1.959434878635765e-18] |
| leftUpperArm | 0 | [0,0,0] | [0,0,0] |
| leftUpperArm | 0.25 | [0,0,0] | [0,0,0.00848528137423857] |
| leftUpperArm | 0.5 | [0,0,0] | [0,0,0.012] |
| leftUpperArm | 0.75 | [0,0,0] | [0,0,0.008485281374238571] |
| leftUpperArm | 1 | [0,0,0] | [0,0,1.4695761589768239e-18] |
| leftUpperArm | 1.25 | [0,0,0] | [0,0,-0.00848528137423857] |
| leftUpperArm | 1.5 | [0,0,0] | [0,0,-0.012] |
| leftUpperArm | 1.75 | [0,0,0] | [0,0,-0.008485281374238573] |
| leftUpperArm | 2 | [0,0,0] | [0,0,-2.9391523179536477e-18] |
| leftForearm | 0 | [0,0,0] | [0,0,0] |
| leftForearm | 0.25 | [0,0,0] | [0,0,-0.0070710678118654745] |
| leftForearm | 0.5 | [0,0,0] | [0,0,-0.01] |
| leftForearm | 0.75 | [0,0,0] | [0,0,-0.007071067811865476] |
| leftForearm | 1 | [0,0,0] | [0,0,-1.2246467991473532e-18] |
| leftForearm | 1.25 | [0,0,0] | [0,0,0.0070710678118654745] |
| leftForearm | 1.5 | [0,0,0] | [0,0,0.01] |
| leftForearm | 1.75 | [0,0,0] | [0,0,0.007071067811865477] |
| leftForearm | 2 | [0,0,0] | [0,0,2.4492935982947064e-18] |
| rightUpperArm | 0 | [0,0,0] | [0,0,0] |
| rightUpperArm | 0.25 | [0,0,0] | [0,0,-0.00565685424949238] |
| rightUpperArm | 0.5 | [0,0,0] | [0,0,-0.008] |
| rightUpperArm | 0.75 | [0,0,0] | [0,0,-0.005656854249492381] |
| rightUpperArm | 1 | [0,0,0] | [0,0,-9.797174393178825e-19] |
| rightUpperArm | 1.25 | [0,0,0] | [0,0,0.00565685424949238] |
| rightUpperArm | 1.5 | [0,0,0] | [0,0,0.008] |
| rightUpperArm | 1.75 | [0,0,0] | [0,0,0.005656854249492382] |
| rightUpperArm | 2 | [0,0,0] | [0,0,1.959434878635765e-18] |
| coatLeft | 0 | [0,0,0] | [0,0,0] |
| coatLeft | 0.25 | [0,0,0] | [0,0,0.006363961030678927] |
| coatLeft | 0.5 | [0,0,0] | [0,0,0.009] |
| coatLeft | 0.75 | [0,0,0] | [0,0,0.006363961030678928] |
| coatLeft | 1 | [0,0,0] | [0,0,1.1021821192326178e-18] |
| coatLeft | 1.25 | [0,0,0] | [0,0,-0.006363961030678927] |
| coatLeft | 1.5 | [0,0,0] | [0,0,-0.009] |
| coatLeft | 1.75 | [0,0,0] | [0,0,-0.006363961030678929] |
| coatLeft | 2 | [0,0,0] | [0,0,-2.2043642384652355e-18] |
| coatRight | 0 | [0,0,0] | [0,0,0] |
| coatRight | 0.25 | [0,0,0] | [0,0,-0.0049497474683058325] |
| coatRight | 0.5 | [0,0,0] | [0,0,-0.007] |
| coatRight | 0.75 | [0,0,0] | [0,0,-0.004949747468305833] |
| coatRight | 1 | [0,0,0] | [0,0,-8.572527594031473e-19] |
| coatRight | 1.25 | [0,0,0] | [0,0,0.0049497474683058325] |
| coatRight | 1.5 | [0,0,0] | [0,0,0.007] |
| coatRight | 1.75 | [0,0,0] | [0,0,0.004949747468305834] |
| coatRight | 2 | [0,0,0] | [0,0,1.7145055188062945e-18] |
| coatFront | 0 | [0,0,0] | [0,0,0] |
| coatFront | 0.25 | [0,0,0] | [0,0,0.00282842712474619] |
| coatFront | 0.5 | [0,0,0] | [0,0,0.004] |
| coatFront | 0.75 | [0,0,0] | [0,0,0.0028284271247461905] |
| coatFront | 1 | [0,0,0] | [0,0,4.898587196589413e-19] |
| coatFront | 1.25 | [0,0,0] | [0,0,-0.00282842712474619] |
| coatFront | 1.5 | [0,0,0] | [0,0,-0.004] |
| coatFront | 1.75 | [0,0,0] | [0,0,-0.002828427124746191] |
| coatFront | 2 | [0,0,0] | [0,0,-9.797174393178825e-19] |
| coatBack | 0 | [0,0,0] | [0,0,0] |
| coatBack | 0.25 | [0,0,0] | [0,0,0.0035355339059327372] |
| coatBack | 0.5 | [0,0,0] | [0,0,0.005] |
| coatBack | 0.75 | [0,0,0] | [0,0,0.003535533905932738] |
| coatBack | 1 | [0,0,0] | [0,0,6.123233995736766e-19] |
| coatBack | 1.25 | [0,0,0] | [0,0,-0.0035355339059327372] |
| coatBack | 1.5 | [0,0,0] | [0,0,-0.005] |
| coatBack | 1.75 | [0,0,0] | [0,0,-0.0035355339059327385] |
| coatBack | 2 | [0,0,0] | [0,0,-1.2246467991473532e-18] |

### dark-druid-native-slam-contact-r5

| duration | fps | loop | tracks |
|---:|---:|---|---:|
| 2.6 | 24 | false | 14 |

| boneId | time | T XYZ | R XYZ |
|---|---:|---|---|
| pelvis | 0 | [0,0,0] | [0,0,0] |
| pelvis | 0.15 | [-0.008,-0.008,0] | [0,0,-0.006] |
| pelvis | 0.45 | [-0.02,-0.022,0] | [0,0,-0.014] |
| pelvis | 0.75 | [-0.035,-0.04,0] | [0,0,-0.028] |
| pelvis | 1 | [-0.045,-0.06,0] | [0,0,-0.038] |
| pelvis | 1.06 | [0.002,-0.055,0] | [0,0,-0.026] |
| pelvis | 1.09 | [0.035,-0.0435,0] | [0,0,-0.0155] |
| pelvis | 1.12 | [0.068,-0.032,0] | [0,0,-0.005] |
| pelvis | 1.16 | [0.08,-0.038,0] | [0,0,0.01] |
| pelvis | 1.26 | [0.09,-0.058,0] | [0,0,0.018] |
| pelvis | 1.42 | [0.06,-0.055,0] | [0,0,0.014] |
| pelvis | 1.65 | [0.02,-0.025,0] | [0,0,-0.008] |
| pelvis | 1.95 | [-0.01,0.006,0] | [0,0,-0.005] |
| pelvis | 2.3 | [-0.003,0.002,0] | [0,0,-0.002] |
| pelvis | 2.6 | [0,0,0] | [0,0,0] |
| spine | 0 | [0,0,0] | [0,0,0] |
| spine | 0.15 | [-0.01,0.03,0] | [0,0,0.022] |
| spine | 0.45 | [-0.035,0.085,0] | [0,0,0.06] |
| spine | 0.75 | [-0.07,0.155,0] | [0,0,0.09] |
| spine | 1 | [-0.105,0.225,0] | [0,0,0.112] |
| spine | 1.06 | [0.11,-0.075,0] | [0,0,-0.018] |
| spine | 1.09 | [0.1725,-0.37,0] | [0,0,-0.1315] |
| spine | 1.12 | [0.235,-0.665,0] | [0,0,-0.245] |
| spine | 1.16 | [0.25,-0.95,0] | [0,0,-0.32] |
| spine | 1.26 | [0.27,-0.98,0] | [0,0,-0.348] |
| spine | 1.42 | [0.155,-0.48,0] | [0,0,-0.23] |
| spine | 1.65 | [0.025,-0.08,0] | [0,0,-0.038] |
| spine | 1.95 | [-0.02,0.02,0] | [0,0,0.034] |
| spine | 2.3 | [-0.006,0.005,0] | [0,0,0.011] |
| spine | 2.6 | [0,0,0] | [0,0,0] |
| chest | 0 | [0,0,0] | [0,0,0] |
| chest | 0.15 | [0,0,0] | [0,0,0.015] |
| chest | 0.45 | [0,0,0] | [0,0,0.045] |
| chest | 0.75 | [0,0,0] | [0,0,0.07] |
| chest | 1 | [0,0,0] | [0,0,0.085] |
| chest | 1.06 | [0,0,0] | [0,0,0.01] |
| chest | 1.09 | [0,0,0] | [0,0,-0.059000000000000004] |
| chest | 1.12 | [0,0,0] | [0,0,-0.128] |
| chest | 1.16 | [0,0,0] | [0,0,-0.18] |
| chest | 1.26 | [0,0,0] | [0,0,-0.185] |
| chest | 1.42 | [0,0,0] | [0,0,-0.088] |
| chest | 1.65 | [0,0,0] | [0,0,0.022] |
| chest | 1.95 | [0,0,0] | [0,0,0.014] |
| chest | 2.3 | [0,0,0] | [0,0,0.004] |
| chest | 2.6 | [0,0,0] | [0,0,0] |
| neck | 0 | [0,0,0] | [0,0,0] |
| neck | 0.15 | [0,0,0] | [0,0,-0.008] |
| neck | 0.45 | [0,0,0] | [0,0,-0.018] |
| neck | 0.75 | [0,0,0] | [0,0,-0.028] |
| neck | 1 | [0,0,0] | [0,0,-0.035] |
| neck | 1.06 | [0,0,0] | [0,0,0.015] |
| neck | 1.09 | [0,0,0] | [0,0,0.04] |
| neck | 1.12 | [0,0,0] | [0,0,0.065] |
| neck | 1.16 | [0,0,0] | [0,0,0.08] |
| neck | 1.26 | [0,0,0] | [0,0,0.07] |
| neck | 1.42 | [0,0,0] | [0,0,0.03] |
| neck | 1.65 | [0,0,0] | [0,0,-0.012] |
| neck | 1.95 | [0,0,0] | [0,0,-0.01] |
| neck | 2.3 | [0,0,0] | [0,0,-0.003] |
| neck | 2.6 | [0,0,0] | [0,0,0] |
| head | 0 | [0,0,0] | [0,0,0] |
| head | 0.15 | [0,0,0] | [0,0,-0.01] |
| head | 0.45 | [0,0,0] | [0,0,-0.032] |
| head | 0.75 | [0,0,0] | [0,0,-0.048] |
| head | 1 | [0,0,0] | [0,0,-0.066] |
| head | 1.06 | [0,0,0] | [0,0,0.02] |
| head | 1.09 | [0,0,0] | [0,0,0.036] |
| head | 1.12 | [0,0,0] | [0,0,0.052] |
| head | 1.16 | [0,0,0] | [0,0,0.065] |
| head | 1.26 | [0,0,0] | [0,0,0.05] |
| head | 1.42 | [0,0,0] | [0,0,0.018] |
| head | 1.65 | [0,0,0] | [0,0,-0.028] |
| head | 1.95 | [0,0,0] | [0,0,-0.018] |
| head | 2.3 | [0,0,0] | [0,0,-0.006] |
| head | 2.6 | [0,0,0] | [0,0,0] |
| leftUpperArm | 0 | [0,0,0] | [0,0,-4.440892098500626e-16] |
| leftUpperArm | 0.15 | [0,0,0] | [0,0,-0.035292013461127286] |
| leftUpperArm | 0.45 | [0,0,0] | [0,0,-0.1484232099327401] |
| leftUpperArm | 0.75 | [0,0,0] | [0,0,-0.28060447265351873] |
| leftUpperArm | 1 | [0,0,0] | [0,0,-0.49802716214009113] |
| leftUpperArm | 1.06 | [0,0,0] | [0,0,1.153105989008304] |
| leftUpperArm | 1.09 | [0,0,0] | [0,0,1.9077601950875138] |
| leftUpperArm | 1.12 | [0,0,0] | [0,0,2.1853450437919486] |
| leftUpperArm | 1.16 | [0,0,0] | [0,0,2.4290883659806095] |
| leftUpperArm | 1.26 | [0,0,0] | [0,0,2.4980111036567454] |
| leftUpperArm | 1.42 | [0,0,0] | [0,0,2.032384536095711] |
| leftUpperArm | 1.65 | [0,0,0] | [0,0,0.595466210445114] |
| leftUpperArm | 1.95 | [0,0,0] | [0,0,0.07754106937856267] |
| leftUpperArm | 2.3 | [0,0,0] | [0,0,-0.013000000000000443] |
| leftUpperArm | 2.6 | [0,0,0] | [0,0,-4.440892098500626e-16] |
| leftForearm | 0 | [0,0,0] | [0,0,8.881784197001252e-16] |
| leftForearm | 0.15 | [0,0,0] | [0,0,-0.2551392191669355] |
| leftForearm | 0.45 | [0,0,0] | [0,0,-0.46968133326777695] |
| leftForearm | 0.75 | [0,0,0] | [0,0,-0.7659826987005993] |
| leftForearm | 1 | [0,0,0] | [0,0,-0.9353728274598088] |
| leftForearm | 1.06 | [0,0,0] | [0,0,-1.414016385003778] |
| leftForearm | 1.09 | [0,0,0] | [0,0,-1.206214383175349] |
| leftForearm | 1.12 | [0,0,0] | [0,0,-0.5027607511031151] |
| leftForearm | 1.16 | [0,0,0] | [0,0,-0.3655405462459016] |
| leftForearm | 1.26 | [0,0,0] | [0,0,-0.3578900960406628] |
| leftForearm | 1.42 | [0,0,0] | [0,0,-0.8819608776160175] |
| leftForearm | 1.65 | [0,0,0] | [0,0,-0.8815877511233827] |
| leftForearm | 1.95 | [0,0,0] | [0,0,-0.2524128572521076] |
| leftForearm | 2.3 | [0,0,0] | [0,0,8.881784197001252e-16] |
| leftForearm | 2.6 | [0,0,0] | [0,0,8.881784197001252e-16] |
| leftHand | 0 | [0,0,0] | [0,0,-4.440892098500626e-16] |
| leftHand | 0.15 | [0,0,0] | [0,0,0.3294312326280628] |
| leftHand | 0.45 | [0,0,0] | [0,0,0.707104543200517] |
| leftHand | 0.75 | [0,0,0] | [0,0,1.224587171354118] |
| leftHand | 1 | [0,0,0] | [0,0,1.6743999895999] |
| leftHand | 1.06 | [0,0,0] | [0,0,0.05491039599547398] |
| leftHand | 1.09 | [0,0,0] | [0,0,-1.5405458119121649] |
| leftHand | 1.12 | [0,0,0] | [0,0,-3.1545842926888334] |
| leftHand | 1.16 | [0,0,0] | [0,0,-4.573547819734708] |
| leftHand | 1.26 | [0,0,0] | [0,0,-4.485121007616082] |
| leftHand | 1.42 | [0,0,0] | [0,0,-2.0964236584796936] |
| leftHand | 1.65 | [0,0,0] | [0,0,0.3901215406782687] |
| leftHand | 1.95 | [0,0,0] | [0,0,0.21687178787354494] |
| leftHand | 2.3 | [0,0,0] | [0,0,0.019999999999999556] |
| leftHand | 2.6 | [0,0,0] | [0,0,-4.440892098500626e-16] |
| rightUpperArm | 0 | [0,0,0] | [0,0,0] |
| rightUpperArm | 0.15 | [0,0,0] | [0,0,-0.025] |
| rightUpperArm | 0.45 | [0,0,0] | [0,0,-0.075] |
| rightUpperArm | 0.75 | [0,0,0] | [0,0,-0.145] |
| rightUpperArm | 1 | [0,0,0] | [0,0,-0.205] |
| rightUpperArm | 1.06 | [0,0,0] | [0,0,-0.065] |
| rightUpperArm | 1.09 | [0,0,0] | [0,0,0.052500000000000005] |
| rightUpperArm | 1.12 | [0,0,0] | [0,0,0.17] |
| rightUpperArm | 1.16 | [0,0,0] | [0,0,0.235] |
| rightUpperArm | 1.26 | [0,0,0] | [0,0,0.25] |
| rightUpperArm | 1.42 | [0,0,0] | [0,0,0.13] |
| rightUpperArm | 1.65 | [0,0,0] | [0,0,-0.075] |
| rightUpperArm | 1.95 | [0,0,0] | [0,0,-0.023] |
| rightUpperArm | 2.3 | [0,0,0] | [0,0,-0.007] |
| rightUpperArm | 2.6 | [0,0,0] | [0,0,0] |
| rightForearm | 0 | [0,0,0] | [0,0,0] |
| rightForearm | 0.15 | [0,0,0] | [0,0,0.03] |
| rightForearm | 0.45 | [0,0,0] | [0,0,0.09] |
| rightForearm | 0.75 | [0,0,0] | [0,0,0.135] |
| rightForearm | 1 | [0,0,0] | [0,0,0.165] |
| rightForearm | 1.06 | [0,0,0] | [0,0,0.02] |
| rightForearm | 1.09 | [0,0,0] | [0,0,-0.085] |
| rightForearm | 1.12 | [0,0,0] | [0,0,-0.19] |
| rightForearm | 1.16 | [0,0,0] | [0,0,-0.245] |
| rightForearm | 1.26 | [0,0,0] | [0,0,-0.21] |
| rightForearm | 1.42 | [0,0,0] | [0,0,-0.075] |
| rightForearm | 1.65 | [0,0,0] | [0,0,0.065] |
| rightForearm | 1.95 | [0,0,0] | [0,0,0.022] |
| rightForearm | 2.3 | [0,0,0] | [0,0,0.007] |
| rightForearm | 2.6 | [0,0,0] | [0,0,0] |
| coatLeft | 0 | [0,0,0] | [0,0,0] |
| coatLeft | 0.15 | [0,0,0] | [0,0,0.004] |
| coatLeft | 0.45 | [0,0,0] | [0,0,0.011] |
| coatLeft | 0.75 | [0,0,0] | [0,0,0.019] |
| coatLeft | 1 | [0,0,0] | [0,0,0.025] |
| coatLeft | 1.06 | [0,0,0] | [0,0,0.032] |
| coatLeft | 1.09 | [0,0,0] | [0,0,0.027] |
| coatLeft | 1.12 | [0,0,0] | [0,0,0.022] |
| coatLeft | 1.16 | [0,0,0] | [0,0,0.006] |
| coatLeft | 1.26 | [0,0,0] | [0,0,-0.053] |
| coatLeft | 1.42 | [0,0,0] | [0,0,-0.09] |
| coatLeft | 1.65 | [0,0,0] | [0,0,-0.043] |
| coatLeft | 1.95 | [0,0,0] | [0,0,0.028] |
| coatLeft | 2.3 | [0,0,0] | [0,0,0.008] |
| coatLeft | 2.6 | [0,0,0] | [0,0,0] |
| coatRight | 0 | [0,0,0] | [0,0,0] |
| coatRight | 0.15 | [0,0,0] | [0,0,-0.003] |
| coatRight | 0.45 | [0,0,0] | [0,0,-0.009] |
| coatRight | 0.75 | [0,0,0] | [0,0,-0.016] |
| coatRight | 1 | [0,0,0] | [0,0,-0.023] |
| coatRight | 1.06 | [0,0,0] | [0,0,-0.031] |
| coatRight | 1.09 | [0,0,0] | [0,0,-0.025] |
| coatRight | 1.12 | [0,0,0] | [0,0,-0.019] |
| coatRight | 1.16 | [0,0,0] | [0,0,-0.004] |
| coatRight | 1.26 | [0,0,0] | [0,0,0.058] |
| coatRight | 1.42 | [0,0,0] | [0,0,0.085] |
| coatRight | 1.65 | [0,0,0] | [0,0,0.033] |
| coatRight | 1.95 | [0,0,0] | [0,0,-0.02] |
| coatRight | 2.3 | [0,0,0] | [0,0,-0.006] |
| coatRight | 2.6 | [0,0,0] | [0,0,0] |
| coatFront | 0 | [0,0,0] | [0,0,0] |
| coatFront | 0.15 | [0,0,0] | [0,0,0.002] |
| coatFront | 0.45 | [0,0,0] | [0,0,0.007] |
| coatFront | 0.75 | [0,0,0] | [0,0,0.012] |
| coatFront | 1 | [0,0,0] | [0,0,0.017] |
| coatFront | 1.06 | [0,0,0] | [0,0,0.025] |
| coatFront | 1.09 | [0,0,0] | [0,0,0.0245] |
| coatFront | 1.12 | [0,0,0] | [0,0,0.024] |
| coatFront | 1.16 | [0,0,0] | [0,0,0.013] |
| coatFront | 1.26 | [0,0,0] | [0,0,-0.035] |
| coatFront | 1.42 | [0,0,0] | [0,0,-0.06] |
| coatFront | 1.65 | [0,0,0] | [0,0,-0.018] |
| coatFront | 1.95 | [0,0,0] | [0,0,0.016] |
| coatFront | 2.3 | [0,0,0] | [0,0,0.004] |
| coatFront | 2.6 | [0,0,0] | [0,0,0] |
| coatBack | 0 | [0,0,0] | [0,0,0] |
| coatBack | 0.15 | [0,0,0] | [0,0,0.003] |
| coatBack | 0.45 | [0,0,0] | [0,0,0.008] |
| coatBack | 0.75 | [0,0,0] | [0,0,0.015] |
| coatBack | 1 | [0,0,0] | [0,0,0.021] |
| coatBack | 1.06 | [0,0,0] | [0,0,0.03] |
| coatBack | 1.09 | [0,0,0] | [0,0,0.028999999999999998] |
| coatBack | 1.12 | [0,0,0] | [0,0,0.028] |
| coatBack | 1.16 | [0,0,0] | [0,0,0.02] |
| coatBack | 1.26 | [0,0,0] | [0,0,-0.027] |
| coatBack | 1.42 | [0,0,0] | [0,0,-0.075] |
| coatBack | 1.65 | [0,0,0] | [0,0,-0.034] |
| coatBack | 1.95 | [0,0,0] | [0,0,0.024] |
| coatBack | 2.3 | [0,0,0] | [0,0,0.006] |
| coatBack | 2.6 | [0,0,0] | [0,0,0] |


## 2026-10-11 r7 · native 전투 화면의 별도 프레이밍

[r7 전투 프레이밍 정본](FDG_DARK_DRUID_COMBAT_FRAMING_20261011.md)은 이 r5 rig/scene·원PNG·clip/markers·native phase/damage를 그대로 소비하고 exact r4 storage.active AND fdgDruidCombat=r7에서만 actual posed bounds와 native sheet 보수 envelope를 카메라에 사용한다. r7 AI 시작의 static cameraLock 해제·compact172px·현재 mouse zoom 소비는 자기 QA 화면 범위다. r5 접촉 제작/원산출은 동결하며 새 native hurtE 쉴드 접촉 관측·첫 사망 FAIL·live camera 한정 PASS·VISUAL RETOUCH/COMBAT_OVERLAP 1건과 파생본은 r7 정본을 따른다. 전체 battle/kill PASS0이다.

<!-- SCREEN_QUALITY_20261012_APPENDIX_BEGIN -->
## 2026-10-12 · r5 idle 화면 소비 후속

이번 표는 현재 선택된 자기 r4+r5+r9+thornfirst 소비 경로의 새 범위다. 이전 보고 body와 판정은 동결한다.

| 항목 | 현재 계약 |
|---|---|
| 현재 화면 | 물리 정지 draw도 dt0 camera-only fit. combatFraming의 ready/forced-pattern/native-ai/player-dead는 live boss bounds 소비; 활성 fit에서 cameraLock getter 우회 |
| idle | first+r5에서 dark-druid-slam-contact-idle-r5 2초/24FPS, G.stageTime/60 → floor(seconds×24)/24 %2. 19본/원PNG 유지, walk·다른상태 fallback |
| frozen ready body | paused ready/forced 현재 live boss만 draw alpha1; _spawnT/physics write0. ready paused 전신 VISIBLE 인수; 정상 전투/다른 pose 판정은 별도 |
| slam | attack clip/phase markers/native damage·AI·native clock 및 승인 리그 데이터는 이번 화면 접점으로 수정하지 않음 |
| Q 표시 | 소유 QA+thornfirst+combat r9의 createDruidParryContactRenderer: cached canvas6×4/cell128,24 procedural effect cells/FPS24/world96, native boom.t/60, visual1초·frame23 transparent |
| native 유지 | dark02 renderer true일 때만 override/다른 kind fallback. native Q72·boom.r80·E/AI/damage/reflection 그대로. Q 효과24cell은 캐릭터24장 충족이 아님 |
| 새 결과 | ready 전신 VISIBLE/HUD654·contained:true, 공개 Q 장식 preview frame0/2/6/23 및 fan 세 화면 unclipped 관측. idle5/Q4/preview9/consumer3=고유21종 증분 PASS(수리 이력 정본). native Q 성공0·전체24cell pixel PASS0·60FPS/캐릭터24장 미인수. VISUAL RETOUCH/exact1 WHOLE_COMBAT_VISUAL_UNIFICATION |

[2026-10-12 화면 품질 수리 정본](FDG_DARK_DRUID_SCREEN_QUALITY_20261012.md).
<!-- SCREEN_QUALITY_20261012_APPENDIX_END -->

<!-- DARK_DRUID_SMOOTH_MOTION_20261012_APPENDIX_BEGIN -->
## 2026-10-12 · smooth-motion 현재 계약

이전 본문/보고는 날짜가 있는 동결 이력이다. 이번 first+r5 표시 계산·전환·QA restart 범위만 추가한다.

| 항목 | 이번 정확 계약 / 관측 경계 |
|---|---|
| opt-in / query | first+r5 smoothMotion:true && idleClip 존재. bridge/rig import motion-continuity-20261012-final; default24FPS floor·다른 bridge/fallback 보존 |
| idle / 전환 | native G.stageTime/60 연속 idle. 마지막 표시 localPose를 source로 entry wind normalized progress0..0.25 smoothstep(0.25초가 아님), return native clock0.12초. wind 외 blend amount1 즉시·impact/FSM 지연0 |
| prepared 평가 | compileRigEvaluator(project) full project validate1회+독립 structuredClone, bind quaternion/world/inverse·hierarchy·influences·lookups·key quaternion prepare1회, frozen{evaluate(options={})}. 매 evaluate options 검증/sample/world/skinning·독립 결과 사본. 기존 evaluateRig 매-call project validation 유지 |
| pose / 표시 cache | localPose=[{id,translation:[x,y,z],rotationQuaternion:[x,y,z,w]}]는 bind transform에 합성할 offset. smooth rasterScale=ceil(clamp(desired,.25,2)×8)/8; 같은 bucket의 scale 원인 reraster 억제. facingDeadZone=.1 display hysteresis, native facing 미수정·8방향 완성0 |
| 관측 API | getRenderSnapshot().motion={phase,nativeSeconds,transition,blendAmount,rasterScale,authoredFps}, getDisplayedPose(actor)는 localPose 새 사본·uninstall 후 null. authoredFps24와 실제 renderedFPS 구별 |
| 새 검사 | root 최초6/6 PASS954.97ms + 이후 facing 새1/1 PASS752.284ms + math 최초5/5 PASS987.274542ms =12 고유 증분 PASS. math의6legacy SHA/18compiled exact는 새 검사 내부 비교이며 old suite 재실행0·한 command12종 최초PASS 아님 |
| 최종 실제 관측 | visible slam 원본116 JPEG1280×720/2.2741949558258057초·running44observer: wind/strike/recover/idle·entry/null/return. camera44/44 fit.ok&&contained, root source frame17/22/41 화면내 배치만 당시 확인. 의상 intact·모델 품질 인수0. public 실제 사망HP0→QA restart HP548/opacity0/pointer none/pet0·즉시 숨김PASS |
| 성능 / 파생 | slam rolling FPS63/median69/119, drawmedian12.427905746499118ms/update median0.2947923078451533ms; 짧은QA·pause baseline/녹화 overhead 포함으로 sustained60FPS 미인수. GIF640×360/25Hz57targets/2280ms는 preceding 실제 frame 재표본(동일 frame 반복 가능), 새 pose0/원116+timestamp 보존 |
| 최종 판정 / 중간 실패 | 연속동작 단위는 당시 기술 구현 기록·현재 구형 모델 인수 VISUAL FAIL / USER_REJECTED_OLD_MODEL. 당시 잔여1 WHOLE_COMBAT_VISUAL_UNIFICATION(플레이어 tiny·기존걷기/다른패턴4frame·ambient edge crop·trueflip/8방향·true24이미지). overlay 전slam120·사망 전/잔존fade restart 자료는 INVALID 이력 보존; 최종증거 사용0 |
| 보호 / 미인수 | native actor시간/AI/판정/damage/Q-E/PNG/19본/mesh/UV/weights/fixture/맵/사용자save 유지. true24 실제 캐릭터 이미지·전체1280×72060FPS 미인수; 효과24cell/clip24FPS/단일98FPS를 목표PASS로 확대0 |

[2026-10-12 smooth-motion 정본](FDG_DARK_DRUID_SMOOTH_MOTION_20261012.md). 실제 최종 결과·§23은 이 정본의 새 관측 표를 따른다.
<!-- DARK_DRUID_SMOOTH_MOTION_20261012_APPENDIX_END -->
