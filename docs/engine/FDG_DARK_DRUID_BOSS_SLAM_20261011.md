# 다크드루이드 전신 내려찍기 r3

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

기존 NORMAL 다크드루이드 `slam` 한 패턴의 몸 동작 제작과 native render 소비 접점이다. 원래 게임의 AI·피해·충돌·쿨다운·공격각·무적·Q/E·저장 권위는 변경하지 않는다. r1/r2 본체·지팡이 저작과 이전 검사/증거는 동결한다. r3는 별도 fixture와 로컬 저장키를 사용한다.

| 범위 | r3 계약 |
|---|---|
| 원화 | 기존 `assets/sprites/boss/boss_dark_druid_f0.png`, 355×541 RGBA, 479258bytes, SHA256 `74060fc68eb5f6dd76771272e973b2c5038e2939286c411cb2bc9a5bbcf0fa68`; 원본 변경·새 texture·PixelLab 생성0 |
| 제작 URL | `http://127.0.0.1:3333/tools/fdg-studio/index.html?authoring=dark-druid-boss-slam-r3&v=boss-slam-r3-final` |
| 제작 저장키 | `fdg.studio.dark-druid.slam.r3`; r1/r2의 `fdg.studio.dark-druid.body.r1` 및 기본 `fdg.studio.project.v1`과 구분 |
| 배송 | `tools/fdg-studio/fixtures/dark-druid-boss-slam-r3.fdg.json` / `dark-druid-boss-slam-r3.rig.json`; 새 builder `build-dark-druid-boss-pattern.mjs` |
| ID | project `dark-druid-boss-slam-scene-r3`, rig `dark-druid-boss-slam-r3`, node `dark-druid-slam-body-r3`, resource `dark-druid-slam-body-r3-resource` |
| 저작 clip | `dark-druid-native-slam-r3`, 2.6초·24FPS·nonloop; `dark-druid-slam-idle-r3`로 복귀. 저작 clip FPS는 원화 sprite 장수나 본편 화면 FPS가 아님 |
| 저작 phase marker | windStart0 / windEnd1 / strikeEnd1.16 / recoverEnd2.6초. 이 시간표로 native 공격시간을 교체하지 않음 |
| native opt-in | 본편의 `fdgDruidSlam=r3` query일 때만 마지막 module script가 `engine/fdg/dark-druid-slam-bridge.js?v=boss-slam-r3-final`를 로드. 준비 실패·미관측 공격·대상 외 상태는 기존 sheet render |
| body 권위 | 승인된 정면 원화의 `ENGINE_AUTHORING` 2.5D mesh/weights. 머리를 staff matrix에 맞추는 r2 보정은 사용하지 않음. native actor x/y를 이동시키는 저작 root motion0 |

## native 상태 대응

native 원래 함수가 먼저 실행된 뒤 실제 `e.st2`를 별도 WeakMap에 관측한다. actor/save에 추적필드를 추가하지 않는다. pose는 draw 시 현재 상태/남은 frame으로만 결정하며 별도 RAF·공격 이벤트·wall-clock 타이머를 만들지 않는다.

| 원래 패턴 | native 현재 계약 | r3 pose 읽기 |
|---|---|---|
| `slam` idx14 준비 | `bossSlamWind`, phase0..4의 기본26/22/17/14/8frame + 선택된 지연14frame. `floor(35*BOSS_PHASES[phase].teleM)+extraDelay`; 시작 시 실제 st2가 권위 | `p=clamp(1-st2/windFrames)` → 저작0..1초 |
| 타격 | `bossSlam` 8frame, 원래 `_weaponAng=-1.2+(1-st2/8)*2.4` | `p=clamp(1-st2/8)` → 저작1..1.16초 |
| impact | native `st2<=0`에서 기존 피해·패링·충격파·hitStop 실행 | 새 mesh/clip이 피해·패링 이벤트를 발생시키지 않음 |
| 회복 | impact가 `recover40`을 할당, 다음 update에서 공용 boss20frame clamp | 같은 actor에서 strike 관측 이후만 인정. `p=clamp(1-min(st2,20)/20)` → 저작1.16..2.6초; 최초40과 clamp20은 같은 impact pose |
| 정지/중단 | 기존 PHYS_STEP=`1000/60`; pause는 native state 그대로 | 같은 state/st2 반복 읽기는 같은 pose. idle/다른 상태·다른 패턴 start·사망·stunned/_hitStun은 trace 취소 |

`createDruidSlamPhaseObserver(markers)`는 `begin(actor,windFrames)`, `sample(actor)`, `cancel(actor)`만 제공한다. `sample`은 `{phase,progress,time,windFrames,facing}` 또는 null이다. phase는 wind/strike/recover다. `installDruidSlamNativeBridge`는 원래 `_bossStartPattern`/`_drawDruidBoss`를 opt-in 범위에서 감싸고, `uninstall`은 자기 wrapper가 여전히 설치되어 있을 때만 원래 함수를 복구한다.

대상은 stage0/3의 `e.ib` NORMAL이며 demo finale는 제외한다. native facing을 읽어 정면 mesh의 X mirror를 선택한다. 이는 기존8방향 sheet의8개 실루엣 복원이 아니다. 원래 Canvas 좌표·`_btScaleMul`·foot anchor·`_nameTopOff`·alpha·source-over1/lighter2·기존 glow gate와 tell caller를 유지한다. CPU triangle renderer의 본편 성능은 아직 실측하지 않았다.

## 실제 검증 범위와 저장 경계

새 제작 장면의 공개 재생·정지·저장·재열기와 새 변경 검사 결과는 아래에 기록한다. 이 장면은 실제 player/native 보스전 검증이 아니다.

기존 `game.html?test=1&testchar=1&bosstest=0`의 공개 slam/PAUSE/STEP은 실제 FSM 경로지만 **저장 격리가 없다**. testchar는 슬롯 load만 우회하며 종료 시 save와 공통 `hellcave_sharedStorage`/`hellcave_sharedMats`·`POST /api/mats`를 차단하지 않는다. 새 슬롯·`dropPreview=1`도 이 공유 경로를 격리하지 않는다. 원 사용자 main/server/save를 보존하기 위해 이번 native live 부팅·입력은0이며 실제 준비→player 회피/피격→회복 인수는 대기한다. global fetch/storage proxy·새 서버·복제 game·보류된 경로 우회0이다.

| 인수 항목 | 현재 상태 |
|---|---|
| 새 body/mesh와 실제 제작 재생 | 정면 2.5D 저작 범위 인수 — 새 GIF·저장 왕복 확인 |
| native caller 최소 접점 | 원본 game 텍스트를 보존한 opt-in module script1개. live 소비는 미검증 |
| 실제 native 보스전 | BLOCKED — 기존 testbed의 공유 저장/API 미격리 |
| 원화 없는 표면 | SOURCE_GAP: 원화 없는 뒤쪽·겨드랑이·옷 속 정본 표면/텍스처 미확보 |

E=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-boss-pattern-r3/`. 수정 전 백업·한정 native 계약·후속 새 검수/소유 checkpoint는 이 디렉터리에 보관한다. 이전 r1/r2 proof와 suite를 재실행하거나 새 결과에 합산하지 않는다.


## 최종 제작 계약

| 항목 | 최종 c 값 / 적용 위치 |
|---|---|
| 형상 | 19본, 3729정점, 4680삼각형, 재질1, clip2; 원화 UV 앞면4622tri + 기존 짧은 팔 단면22tri + 새 접합면36tri |
| 물리 분리 | 원화 경계370 source index에 별도 mesh index/weights 부여. 지팡이·손·위팔 소매·아래팔 소매를 분리. 원화 색 삭제0 |
| 접합면 | shoulder[158,187]r28/chest, elbow[122,233]r18/leftUpperArm, wrist[77,242]r16/leftForearm; 각12segments/13v/12tri, 합39v/36tri, layer3, #191815. 원화 없는 관절 뒤의 좁은 평면 추정이며 정본 표면 복원 주장이 아님 |
| 단위 / 원점 | sourcePxPerModelUnit150, originPx[221,526], model=[(x-221)/150,(526-y)/150,z] |
| 지팡이 | leftHand→staff child, bind T/R0; staff track0, 손과 지팡이 표면 staff weight1; headStaffCommonSkinCompensation=false |
| 머리 | head/neck 독립 skin. 가지뿔을 지팡이 회전에 맞추는 보정0 |
| 팔 | bakeDarkDruidSlamArm의 오프라인 평면2본 IK. 원화 위팔58.41232746604091px/아래팔45.891175622335055px, 음수 elbow bind branch. 세 팔 track T[0,0,0] 전 키 유지. 런타임 IK 추가0 |
| 발 | leftBoot/rightBoot는 root child, clip track0, 표면137정점의 sampled drift0. 새 발걸음/발 피벗0. native actor x/y 변경0 |
| clip | attack14tracks×14keys, 2.6초/24FPS/nonloop; idle10tracks×9keys, 2초/24FPS/loop |
| 키 시간 | attack[0,0.15,0.45,0.75,1,1.06,1.12,1.16,1.26,1.42,1.65,1.95,2.3,2.6]; idle[0,0.25,0.5,0.75,1,1.25,1.5,1.75,2] |
| idle 공식 | rotationZ=amplitude×sin(π×time), chest T=[0,0.004×sin(π×time),0], 나머지 T0; amplitude spine.006/chest.009/head−.008/leftUpperArm.012/leftForearm−.010/rightUpperArm−.008/coatLeft.009/coatRight−.007/coatFront.004/coatBack.005 |
| scene | node position[4150,7360,0], scale80, visible=true; camera[4150,7216], follow=false/yaw0/pitch0; clip 진입 전환.25초/복귀.35초. collision·새전투·FX0 |
| cache suffix | index studio module / r3 fixture / native loader rig / native hook module 모두 boss-slam-r3-final. r1/r2 fixture와 query는 변경0 |
| producer API | DRUID_SLAM_IDS/PHASES/TIMES/REGIONS; darkDruidSlamPartAt/WeightsAt, buildDarkDruidSlamClip(원시 키), bakeDarkDruidSlamArm(최종 키), buildDarkDruidBossPattern, buildDarkDruidBossPatternScene, measureDarkDruidSlam |

ROI 내부 판정의 우선순위는 leftHand→staffCrownAndRopes/staffShaft→boots→leftSleeve→rightArm→y<154 head→coatFront/Left/Right→y>292 coatBack→body다. 소매는 원화 중심점에서 [158,187]→[122,233]과 [122,233]→[77,242] segment까지의 거리로 위/아래 물리부를 선택한다.

| weights branch | 공식 (c=clamp0..1) |
|---|---|
| staff / leftHand | staff1 |
| leftUpperSleeve / leftForeSleeve | leftUpperArm1 / leftForearm1 |
| head | n=c((y−132)/30); head1−n, neck n |
| rightArm | e=c((y−220)/75), h=c((y−293)/35); upper1−e, fore e(1−h), hand eh |
| coat* | d=.8c((y−286)/110); pelvis1−d, 해당 coat d |
| body y≤184 | n=c((184−y)/42); neck n, chest1−n |
| body184..226 | t=c((y−184)/42); chest1−t, spine t |
| body>226 | h=c((y−226)/72); spine1−h, pelvis h |
| leftSleeve fallback branch | s=c((x−145)/26),w=c((128−x)/44),g=c((105−x)/23); chest s,upper(1−s)(1−w),fore(1−s)w(1−g),hand(1−s)wg. 최종 mesh는 위/아래 rigid 소매를 사용 |
| boot / socket | 해당 root-child boot1 / 각 접합부 chest 또는 upper 또는 fore1; 1e−10 이하 weight 제외 |

## render 소비와 비용

| 항목 | 최종 계약 |
|---|---|
| projection | dw=actor.r×spec.dw,dh=actor.r×spec.dh,u=1/(_btScaleMul\|\|1); x=mirror×(modelX×150×dw/355+(221/355−.5)dw),y=−modelY×150×dh/541+(526/541−.86)dh; cos(native facing)<0이면 X mirror−1 |
| native anchor | translate(actor.x,actor.y+(tdY||0)−6),scale(u,u); _nameTopOff=(tdY||0)−6−dh×.86×u−10. 이 필드만 시각 출력용 actor 쓰기 |
| raster | 독립 owner canvas1 lazy 생성. displayScale=max(hypot(a,b),hypot(c,d)), 없으면1; rasterScale=clamp(u×displayScale,.25,2). min bounds floor−1, max측+1, 크기ceil. 자기 buffer를 새 pose 때만 재생성 |
| cache | WeakMap pose는 actor/저작 time; raster는 actor/time/facing/dw/dh/rasterScale. 같은 pause sample은 재래스터0. 원화 texture 삼각형은 한 번만 그려 cached image를 native context에3회 합성 |
| 합성 | source-over alpha1배 + lighter alpha.42배×2. 기존 glow gate일 때 alpha.30, 중심 y−dh×.40,rx dw×.24,ry dh×.22. tell은 원래 caller1회 |
| 생명주기 | 별도 RAF/listener0. 다른 패턴·대상 외·idle·중단은 원래 sheet fallback. 자기 fallback/uninstall에서 buffer0×0, actor 참조 해제; 다른 wrapper를 덮어쓴 경우 원래 함수 복구를 강행하지 않음 |
| 검증 접점 | 선택적 canvasFactory는 새 좁은 MockCanvas 검사 주입점. 실제 native renderer 성능/로딩은 미관측 |

## 새 증거와 인수 판정

| 증거 | 결과 / 범위 |
|---|---|
| 실제 제작 재생 | 탭23 공개 Play → slam 선택 → 대기 복귀 관측 → Stop. 원 실제 screencast51장 중 대기 도구 간격11.010초가 있는 앞3장만 생략하여48장/3600ms GIF. 원 프레임 전부 보관. attackObserved/returnedIdle=true |
| GIF | E/dark-druid-slam-r3-actual-authoring.gif, 8165400bytes, SHA256 50b4e1f899a025de14a2cb2885967ee3dc63b3891c4a4a233ab48c2ad8f726cf. 제작 장면 재생이며 native 보스전 영상 아님 |
| 저장 왕복 | 공개 Save1 / 재열기1 / Export2. project/sceneProject/19bone positions/3729posed vertices/clip time1.16/transition null/camera/key 동일. owner stats time/frame은 재열기0, paused |
| 실제 수출 | 두 파일 각3221252bytes, JSON 동일, SHA256 3f13f462da732742694b04ea9a2d20c6224c0b3eab54b05e3362d4b56c599eba |
| 신규 검사 | test/fdgDarkDruidNativeSlam.test.mjs 첫실행4/4 PASS, 실패/취소/skip0,624.533333ms, 재실행0. phase/pause/interrupt, native wrapper/cache/fallback, 최종 mesh/손·발/IK/접지/복귀만 검사 |
| 새 문법 검사 | 최종 builder/bridge/studio/extracted native opt-in module 4개 node --check PASS. 초기 중간 검사·옛 suite는 새4개에 합산0 |
| 원화 사용 | 새r3 builder bytes-read6/decode5/view1/write0, 신규검사 source PNG read0. PNG 재감사·r1/r2 재제작0 |
| game.html | 원본3792975bytes를 그대로 보존하고570bytes module1개만 삽입, 최종3793545bytes. query 미지정 기본 실행 변경0; native 부팅0 |
| 실제 수치 | prep1→strike1.16: 지팡이 앞/하강451.5765710343492/470.23476746385836 sourcepx, body153.4486/144.9190px. tip[425.5971521485494,493.99418252522923], hand[362.6827886629114,346.86912392813963]. scale80 제작 화면에서 tip 약240.84/250.79px, 실제 native 측정 아님 |
| 연결 검사 | 손–staff skin drift0,137boot drift0; 팔길이 최대오차4.974e−14sourcepx,1356staff edges factor오차1.417e−13; 마지막2.6초 bind drift4.578e−16model |
| 남는 변형 한계 | rigid 소매/staff edge factor≈1; 전체 최대2.2166263221475164는1.26초 몸통 blend, head 최대1.4422369566644873. 실제 제작 front에서만 인수했으며 큰 yaw/등/입체 전투 모델 품질 보장 아님 |
| 성능 관측 | 녹화 중 스튜디오 HUD에서15..23FPS, render 약21..30ms가 보임. 24FPS는 clip 저작값이며 본편60FPS 최적화 인수나 신규24장 sprite 납품을 뜻하지 않음. native offscreen 비용은 미실측 |

**VISUAL VERDICT: RETOUCH — 실제 전투 인수 대기.** 정면 제작 장면의 준비 실루엣·전방 하강·어깨 접합·외투 후행·대기 복귀는 한정 PASS다. 기존 a의 높은 지팡이 끝과 b의 떠 있는 어깨 파편은 RETOUCH로 보관했고 최종 c에서 개선했다. PoE2를 언급한 새 인간 품질 기준은 특정 패턴 복제가 아닌 전신 힘 전달·체중 이동·빠른 타격·반동의 읽힘이다. 현재 발은 고정이므로 발 체중 이동/접지 타격감, NORMAL 실제 전투 크기와 native 속도의 읽힘, 실제 플레이어 회피·피격·recover는 **미관측**이다. 공개 제작 재생과4개 검사를 이 전투 인수로 세지 않는다.

native blocker의 구체 접점은 testchar에서 `_dbReady=true` 이후 종료 강제 `dbSave`의 `POST /api/save`, 공용 `_getStore`/`_saveSharedMats`의 `hellcave_sharedStorage`·`hellcave_sharedMats` 및 `_matsDirty`→`POST /api/mats`, 공용 `_charIdx`/`inputMode`/설정 key다. 일반 bosstest는 슬롯 load 뒤3초 save·30초 autosave도 남는다. `test=1`은 Supabase만 우회하고 저장 격리가 아니다. 원래 main/server/save에 대한 부팅·reload·입력·API·저장 접촉은0이다. 이 경계를 우회하는 proxy·복제 runtime·추가 server·저장 guard 구현은 하지 않았다.

한정 변경은 코드8경로 + docs5경로를 같은 정상 checkpoint에 포함한다. checkpoint SHA와 정확 owned 목록은 E/owned-checkpoint-receipt.json에 기록한다. 타팀 Hell r9 WIP와 기존 r1/r2는 포함하지 않는다. 전체 docs `rg` 및 literal recursive `grep -r` 최종 동기화 분류는 E/docs-sync-final-receipt.json에서 인수한다.

## 최종 정확 형상/키 테이블

| part | vertices | triangles | layer |
|---|---:|---:|---:|
| head | 1035 | 1343 | 3 |
| staff | 607 | 768 | 6 |
| body | 469 | 568 | 0 |
| leftUpperSleeve | 25 | 24 | 4 |
| rightArm | 173 | 210 | 4 |
| leftForeSleeve | 18 | 18 | 4 |
| coatLeft | 366 | 496 | -1 |
| coatFront | 64 | 75 | 2 |
| coatRight | 179 | 265 | -1 |
| coatBack | 617 | 657 | -2 |
| leftBoot | 70 | 87 | 1 |
| rightBoot | 67 | 89 | 1 |
| authored-shoulder-socket | 13 | 12 | 3 |
| authored-elbow-socket | 13 | 12 | 3 |
| authored-wrist-socket | 13 | 12 | 3 |
| leftHand | 0 | 22 | 5 |
| authored-arm-side | 0 | 22 | 4 |

leftHand 경계의 실제 정점은 물리 staff 부분에 소유된다. 정점0은 손의 표면 부재를 뜻하지 않는다.

| bone id | parent | bind model translation | bind rotation |
|---|---|---|---|
| root | None | `[0,0,0]` | `[0,0,0]` |
| pelvis | root | `[0.006666666666666667,1.5666666666666667,0]` | `[0,0,0]` |
| spine | pelvis | `[-0.006666666666666667,0.46666666666666656,0]` | `[0,0,0]` |
| chest | spine | `[0.02,0.30000000000000027,0]` | `[0,0,0]` |
| neck | chest | `[0,0.273333333333333,0]` | `[0,0,0]` |
| head | neck | `[-0.006666666666666666,0.15333333333333332,0]` | `[0,0,0]` |
| leftUpperArm | chest | `[-0.44,-0.0733333333333337,0]` | `[0,0,0]` |
| leftForearm | leftUpperArm | `[-0.24000000000000005,-0.3066666666666664,0]` | `[0,0,0]` |
| leftHand | leftForearm | `[-0.29999999999999993,-0.06000000000000005,0]` | `[0,0,0]` |
| staff | leftHand | `[0,0,0]` | `[0,0,0]` |
| rightUpperArm | chest | `[0.44666666666666666,-0.10000000000000009,0]` | `[0,0,0]` |
| rightForearm | rightUpperArm | `[0.19333333333333336,-0.3866666666666667,0]` | `[0,0,0]` |
| rightHand | rightForearm | `[0.14,-0.45333333333333337,0]` | `[0,0,0]` |
| coatLeft | pelvis | `[-0.25333333333333335,-0.08666666666666667,0]` | `[0,0,0]` |
| coatRight | pelvis | `[0.2466666666666667,-0.10666666666666669,0]` | `[0,0,0]` |
| coatFront | pelvis | `[0,-0.020000000000000018,0]` | `[0,0,0]` |
| coatBack | pelvis | `[-0.013333333333333334,-0.1266666666666667,0]` | `[0,0,0]` |
| leftBoot | root | `[-0.4066666666666667,0.24,0]` | `[0,0,0]` |
| rightBoot | root | `[0.4,0.25333333333333335,0]` | `[0,0,0]` |

| ROI id | source-pixel polygon |
|---|---|
| staffCrownAndRopes | `[[49,15],[70,25],[86,43],[107,58],[115,83],[114,151],[95,180],[79,202],[72,229],[56,250],[30,273],[4,278],[0,164],[0,62],[15,30]]` |
| staffShaft | `[[51,168],[66,162],[77,201],[87,250],[93,309],[104,377],[116,448],[130,531],[120,538],[109,458],[95,388],[84,320],[70,265],[62,215],[47,184]]` |
| leftHand | `[[65,216],[82,219],[91,231],[88,249],[96,267],[80,277],[65,260],[61,240]]` |
| leftSleeve | `[[156,179],[171,207],[150,250],[127,285],[100,304],[85,281],[88,256],[111,234],[134,205]]` |
| rightArm | `[[288,189],[315,193],[327,221],[340,259],[348,290],[354,315],[353,348],[338,362],[326,350],[326,316],[315,287],[304,265],[295,234]]` |
| coatFront | `[[208,267],[238,267],[251,310],[243,380],[234,451],[222,494],[207,458],[198,386],[197,321]]` |
| coatLeft | `[[190,266],[210,302],[195,363],[167,428],[146,475],[113,514],[67,519],[14,495],[0,468],[59,422],[89,352],[125,291]]` |
| coatRight | `[[246,273],[283,287],[314,339],[354,418],[354,511],[304,515],[276,480],[259,429],[247,369],[237,313]]` |
| leftBoot | `[[143,476],[166,468],[178,487],[164,518],[141,533],[118,528],[122,511]]` |
| rightBoot | `[[270,474],[288,476],[302,501],[315,523],[305,535],[278,533],[263,511]]` |

| attack bone id | translation [x,y,z] at the14 times above | rotationZ radians at the14 times above |
|---|---|---|
| pelvis | `[[0,0,0],[-0.008,-0.008,0],[-0.02,-0.022,0],[-0.035,-0.04,0],[-0.045,-0.06,0],[0.005,-0.055,0],[0.09,-0.03,0],[0.115,-0.035,0],[0.125,-0.055,0],[0.09,-0.06,0],[0.025,-0.03,0],[-0.01,0.006,0],[-0.003,0.002,0],[0,0,0]]` | `[0,-0.006,-0.014,-0.026,-0.035,-0.024,-0.002,0.014,0.024,0.016,-0.01,-0.005,-0.002,0]` |
| spine | `[[0,0,0],[-0.01,0.035,0],[-0.045,0.1,0],[-0.085,0.18,0],[-0.12,0.26,0],[0.2,-0.05,0],[0.63,-0.56,0],[0.77,-0.733,0],[0.82,-0.78,0],[0.39,-0.38,0],[0.03,-0.06,0],[-0.025,0.025,0],[-0.007,0.006,0],[0,0,0]]` | `[0,0.025,0.07,0.105,0.13,0.02,-0.135,-0.17,-0.185,-0.13,-0.035,0.04,0.012,0]` |
| chest | `[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]` | `[0,0.018,0.055,0.085,0.1,0.025,-0.08,-0.11,-0.1,-0.04,0.03,0.015,0.005,0]` |
| neck | `[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]` | `[0,-0.008,-0.02,-0.03,-0.032,0.012,0.055,0.065,0.055,0.025,-0.014,-0.012,-0.003,0]` |
| head | `[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]` | `[0,-0.012,-0.035,-0.055,-0.075,0.025,0.105,0.12,0.09,0.02,-0.04,-0.02,-0.008,0]` |
| leftUpperArm | `[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]` | `[-4.440892098500626e-16,-0.04278844903751597,-0.1616194528512918,-0.3643326983723204,-0.6387652668410073,1.1393642252621756,2.0992516850571574,2.1858865277091906,2.331783102423926,1.8457041284460534,0.5480094122456999,0.050908348324312486,-0.015000000000000444,-4.440892098500626e-16]` |
| leftForearm | `[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]` | `[8.881784197001252e-16,-0.27430647092733196,-0.5765091985046715,-0.8959556407748246,-1.0431829711123806,-1.3002967022975782,-0.7244778364664364,-0.3388356467320377,-0.4469696167455641,-0.9207914076845962,-0.8815877511233827,-0.24145496072424288,8.881784197001252e-16,8.881784197001252e-16]` |
| leftHand | `[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]` | `[-4.440892098500626e-16,0.36009491996484794,0.8571286513559633,1.526288339147145,2.126948237953388,-0.11006752296459732,-2.957773848590721,-4.331050880977153,-4.223813485678361,-1.8709127207614573,0.46857833887768285,0.23054661239993038,0.019999999999999556,-4.440892098500626e-16]` |
| rightUpperArm | `[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]` | `[0,-0.025,-0.08,-0.15,-0.21,-0.07,0.15,0.21,0.245,0.12,-0.08,-0.025,-0.008,0]` |
| rightForearm | `[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]` | `[0,0.035,0.1,0.145,0.175,0.035,-0.18,-0.23,-0.2,-0.07,0.07,0.025,0.008,0]` |
| coatLeft | `[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]` | `[0,0.004,0.012,0.02,0.026,0.03,0.01,-0.015,-0.065,-0.09,-0.04,0.028,0.008,0]` |
| coatRight | `[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]` | `[0,-0.003,-0.009,-0.016,-0.023,-0.025,-0.006,0.02,0.07,0.085,0.03,-0.02,-0.006,0]` |
| coatFront | `[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]` | `[0,0.002,0.008,0.013,0.018,0.025,0.015,0.005,-0.045,-0.06,-0.015,0.016,0.004,0]` |
| coatBack | `[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]` | `[0,0.003,0.009,0.015,0.022,0.028,0.02,0.01,-0.04,-0.075,-0.03,0.024,0.006,0]` |

모든 rotationX/Y=0. 최종 팔 값은 bake 이후의 literal 수치이며 중간 upper translation 초안을 사용하지 않는다.

| deliverable | bytes | SHA256 |
|---|---:|---|
| build-dark-druid-boss-pattern.mjs | 24034 | `2cdfcd227f5e5aa6261e05636fdec195dc2ca021d0de1d42bfe8172780575b69` |
| dark-druid-boss-slam-r3.rig.json | 846526 | `05c58382815a2e900473f6593d00385bc61471cbc325c5dd12654121d02c6679` |
| dark-druid-boss-slam-r3.fdg.json | 953130 | `1138bdfd9277e9b35dd75c61ab22c631f2015d8fc29469c1ba4a6ac9766005fd` |

## 다음 보스전 제작 인계 — 이번 r3 구현에 포함되지 않음

새 사용자 방향은 인간형 물리·마법 공격과 기존 멧돼지 돌진·개구리 독장판·지네 지하 이동/출현·변신 복귀를 실제 native 상태/판정으로 묶는 보스전이다. 기존 BOSS 담당의 최초 확인/정확 pointer/후보를 받아 소비하며 동일 source·완료 proof를 중복 조사하지 않는다. 근접과 모든 보스 탄의 기존 class별 패링 대응, 일반 적 탄의 발사 시 조준 후 직진 기본 및 일부 특수 탄만 유도, 비유도 물리 가시/마법탄 증가가 다음 설계 범위다. 구체 수치·패턴 후보는 아직 인수하지 않았으며 이번 r3에서 새 탄막·변신 코드를 변경하지 않았다.

다음 단위에서는 기존 허용3333 native 테스트의 최소 opt-in 저장 경계를 자기 전용 또는 메모리로 격리하는 구현을 검토할 수 있다. 기본 본편 save·사용자 save bytes·공유 API 쓰기·사용자 main을 보존해야 한다. 도구/승인 거절을 우회하거나 거절된 BOSSalpha.7 patch를 재개하는 권한은 없다. 원게임 전체 복사·새 서버/backend·PBR/GPU 공사·새 PNG/캐릭터 생성은 하지 않는다. blackBean의 Q 전용 magic/E 불가 및 Q 성공 후 블루콩 유도반사, 보호2_3/player Q-E, 어택 티켓 금지를 유지한다. 다음 인수는 실제 공개 플레이어 입력의 회피·패링·변신 대응·가능한 승리/종료와 실제 플레이 캡처이며, 이번 제작 GIF와 검사4개로 대체하지 않는다.


## 2026-10-11 다크드루이드 내려찍기 접촉 동작 r5 · 별도 저작과 격리 소비

이 문서의 r3 수치·봉인·완료 원문은 동결 이력이다. 후속 [r5 접촉 동작 정본](FDG_DARK_DRUID_SLAM_CONTACT_20261011.md)은 기존 r3를 덮어쓰지 않는 새 `dark-druid-slam-contact-r5.rig.json` / `.fdg.json`과 19본 접촉 저작을 사용한다. 제작 query `authoring=dark-druid-slam-contact-r5`, own key `fdg.studio.dark-druid.slam.contact.r5`를 분리한다. attack `dark-druid-native-slam-contact-r5`는 2.6초·24FPS이고 idle은 `dark-druid-slam-contact-idle-r5`, markers는 0/1/1.16/2.6초다. 5장 비교는 native phase틱과 authoring sample초를 별도 기록한다.

native r5는 exact r4 QA active에서만 새 clip/fixture를 선택하며 bridge의 optional `clipId` / `rigUrl` 기본은 r3로 유지한다. native clock·damage·angle·AI·Q/E·원PNG·맵은 변경하지 않는다. 기존 r3/r4 검수와 r5 결과를 합산하지 않고 실제 visual/test/save 인수는 새 정본의 최종 검수 표를 따른다.

최종 candidate B의 attack은 14tracks×15keys이며 1.09초 shortest-slerp 키를 추가했다. duration2.6초·24FPS와 markers0/1/1.16/2.6초는 유지한다. r5 authoring module과 두 rig/scene fixture query는 `slam-contact-r5-b`, bridge cache는 `slam-contact-r5-cache2`다. native WebGPU의 cached canvas가 이전 raster를 재사용하던 접점은 실제 r5 clip raster 작성 완료 때만 owner canvas의 `_glVer`를 1 증가시켜 갱신하며 동일 pause pose에서는 증가0이다. native clock/actor와 기본 r3 경로는 변경하지 않는다. read-only `getRenderSnapshot()`은 rigId/clipId/time/facing/rasterRevision과 새 사본의 bounds를 반환한다. 새 기술·시각·저장 검수 결과는 r5 정본의 최종 표를 따른다.
