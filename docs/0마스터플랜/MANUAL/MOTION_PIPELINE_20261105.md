# 캐릭터 동작 파이프라인 (2026-11-05)

브리프: `docs/0마스터플랜/worklog/cloud-lanes/BRIEF_MOTION_PIPELINE_20261105.md`. Mac이 §1 기준 영상·채점과 §3 측정값·D-MO-2를 먼저 채웠고(`claude/unity-mac-motion-20261105`), 클라우드 MO 세션이 §1 코드 근거, §2 촬영 가이드·무료 티어 조사, §3 파일:줄 전수표, §4의 ①② 도구 옵션표를 덧붙였다. §4 실습 기록·§5 비교 영상은 **Mac 실습 대기**다. Core 수치는 읽기만 했고 바꾸지 않았다.

클라우드 조사 기준 커밋: `origin/unity/main` `a1ee5666c`(2026-11-05). 파일 경로는 `unity/Assets/Exoduser/` 아래 상대 경로다. 줄 번호는 이 커밋의 체크아웃에서 확인했다.

## §1 현황·채점

[MO_BASELINE_20261105.md](MO_BASELINE/MO_BASELINE_20261105.md): 스프라이트·rigpixel 두 경로의 영상과 7항목 채점(Mac, 실제 화면 판정의 정본). 아래 1.1~1.7은 클라우드가 코드·클립 메타데이터·문서에서 확인한 **구조 근거**이며, 화면 판정은 전부 위 Mac 문서를 따른다.

### 1.1 한 줄 결론 (코드 근거)

- **기본 실행 영웅은 2D 스프라이트다.** `NativeHd2D.Enabled`는 `--legacy-models`가 없으면 true이고(`NativeHd2D.cs:10`), 3D 리그 뷰는 `!NativeHd2D.Enabled || RigPixelRequested`일 때만 만든다(`NativeGame.cs:238`). 리그 경로는 `--hero-render=rigpixel`(`NativeRigPixelPolicy.cs:5~14`)이다.
- **리그 경로에서도 공격·구르기·피격·사망은 애니메이션 클립이 아니다.** `Runtime/NativeHeroMotion.cs`(744줄)가 Core 틱마다 손 위치·칼날 방향·척추 굽힘 수치(코드 상수)를 smoothstep 보간하고 2본 IK로 팔·다리를 맞춘다. 브리프가 말한 "스크립트 키"의 실체가 이 파일이다.
- **대기(idle)는 전용 클립이 없다.** Animator의 Idle 상태는 걷기 클립(`Warrior_Walk`)을 속도 0으로 멈춘 것이고, 런타임이 정규화 시각 0으로 고정한다(흉곽 호흡 사인만 덧붙임).
- **걷기·달리기 클립은 Meshy 리깅 API가 자동으로 붙여 준 기본 클립**(31프레임·19프레임, 30fps, 제자리)이다. 캐릭터 보드가 이미 "자리표시용이며 최종 애니메이션이 아니다"라고 적었다.
- 클립 전환은 Animator의 0.1초 크로스페이드를 쓰지 않는다. 런타임이 매 프레임 `Animator.Play(state, layer, time)`로 점프시키므로 Idle↔Run은 **즉시 컷**이다.
- 10-28 UCH-A1 결정("생성 원형 + Unity 수동 손질")은 코드에 반영된 적이 없다.

### 1.2 영웅 리그·클립 파일 위치

| 파일 | 내용 | 근거 |
|---|---|---|
| `Art/Characters/Warrior/RemasterR7/Warrior_R7.fbx` | **현재 리그 경로의 전사 리그(R7)**. 33본 = Meshy 24본 + 망토 9본(`Cape_L/C/R_0~2`), 널 `Grip_L`·`Socket_Weapon_R`. 정점 142,733 / 인덱스 280,311(≈93,437△). 애니메이션 없음. Blender 5.2.3 LTS로 내보냄 | FBX 바이너리 파싱(`Creator`, `Model` LimbNode 수, `Geometry`) |
| `Art/Characters/Warrior/Warrior_Rigged.fbx` | 구 전사 리그(R2~R6). 24본, 정점 97,656. Blender 4.4.0 내보냄. 1프레임 정지 스택만 있음 | 같은 방법 |
| `Art/Characters/Warrior/Warrior_Walk.anim` | 걷기 클립. 30fps, 0~1.0333 s = **31프레임**, 루프, Humanoid 머슬 커브 130개(손가락 커브 포함, 값은 상수), 이벤트 0 | `.anim` YAML `m_SampleRate`·`m_StopTime`·`m_EditorCurves` |
| `Art/Characters/Warrior/Warrior_Run.anim` | 달리기 클립. 30fps, 0~0.6333 s = **19프레임**, 루프 | 같은 방법 |
| `Art/Characters/Warrior/Warrior_Walk_ArmR_Hold.anim` | 오른팔 운반 레이어용 클립(31프레임). Editor 스크립트 `WarriorR2Fit.WriteClip`이 만든 파생본 | 캐릭터 보드 UCH-03b |
| `Art/Characters/Warrior/Warrior_Locomotion.controller` | Animator 컨트롤러(아래 1.5) | YAML |
| `Art/Characters/Warrior/Warrior_ArmR.mask` | 오른팔 전용 아바타 마스크 | YAML |
| `Art/Characters/Warrior/Warrior.prefab` | 런타임 프리팹. R7 메시·Animator·CapeSpring·소켓 | YAML |
| `Art/Characters/Ivan/Ivan_Rigged.fbx`·`Ivan_Walk.fbx`·`Ivan_Run.fbx` | 아이반. 24본, 정점 105,556. Walk 31f / Run 19f. Generic 임포트(Humanoid 아님) | FBX 파싱 + `.meta` `animationType: 2` |
| `Art/Characters/Silvertail/Silvertail_Rigged.fbx`·`_Walk.fbx`·`_Run.fbx` | 실버테일. 24본, 정점 92,665. Walk 31f. Generic 임포트 | 같은 방법 |
| `Remodel/Boss/DarkDruid/Source/00_Druid_Rig.fbx`·`11_Walk.fbx`·`10_Slam127.fbx` | 드루이드 Meshy 리그(24본, 정점 99,643)와 걷기 31f, 내려찍기 원형 127(**90프레임**, 3.0 s). **10_Slam127의 메시는 전사 Warrior_Rigged와 정점 수(97,656)·인덱스 수가 같다** → 전사 리깅에 돌린 Meshy 애니메이션 127 원본 | FBX 파싱; 보드 "전사 리깅 01a17d1c에 127 적용" |

Meshy 24본 이름(모든 리그 공통): `Hips, Spine02, Spine01, Spine, neck, Head, head_end, headfront, Left/RightShoulder, Left/RightArm, Left/RightForeArm, Left/RightHand, Left/RightUpLeg, Left/RightLeg, Left/RightFoot, Left/RightToeBase`. **손가락·트위스트·무기 본 없음.**

### 1.3 클립이 어떻게 만들어졌나 (근거)

| 동작 | 출처 | 근거 |
|---|---|---|
| 몸·리그 | 원화 3뷰 → Meshy 7.1 `multi-image-to-3d`(30cr) → Meshy `rigging`(5cr, 24본, 손가락 없음) → Blender에서 망토 9본·물성·파지 보정 → R7 | `docs/engine/UNITY_CHARACTER_BOARD_20261027.md` §3-1 ②③⑤, 10-31 R7 절; FBX `Creator`=Blender |
| 걷기·달리기 | Meshy 리깅 결과에 **함께 나오는 기본 클립**(`basic_animations_walking/running`)을 `.anim`으로 분리 | 보드 §3-1 ③ "기본 걷기·달리기가 함께 나온다", UCH-03b "Walk/Run FBX를 .anim으로 분리"; FBX 키가 전 프레임 베이크(60커브×32키) |
| 대기 | 전용 클립 없음. Idle 상태 = Walk 클립 속도 0 + 런타임 흉곽 호흡 `sin(tick×.025)×.025` | 컨트롤러 Idle `m_Speed: 0`·`m_Motion`=Walk guid; `docs/engine/UNITY_HERO_MOTION_20261030.md` "대기·달리기" 행 |
| 기본 공격·E·강타·구르기·피격·사망·시전 | **코드 절차 포즈**(`NativeHeroMotion.cs` `GripPose`·`HeroBodyWeight`·`SolveArm` 2본 IK·`HumanPoseHandler` 머슬 덮어쓰기). 10-30 커밋 "Core 틱 모션 후보 연결"부터 11-03까지 11개 커밋 | GitHub 커밋 이력 `851c1a0`(10-30)~`c65fe43`(11-03); 파일 9~31행(웹 스프라이트 프레임 수식 이식), 136~180행(체중 상수), 480~520행(파지 상수) |
| 공급원 결정(10-28, UCH-A1) | "원형(생성 클립) + Unity 수동 손질" 혼합. Meshy 라이브러리 4종(127·128·237·382)+Text to Motion 2건(32cr) 시범 뒤, 라이브러리는 한 손 자세라 대검 최종본 불가 판정. **코드에 미반영** | 보드 §4 10-28 행, 2단계 비교표 |

### 1.4 리그·클립 수치 요약

| 항목 | 값 |
|---|---|
| 본 수 | R7 33(Meshy 24 + 망토 9). Ivan·Silvertail·Druid 24 |
| 클립 수(전사) | 3개(Walk 31f, Run 19f, Walk_ArmR_Hold 31f). 공격·피격·사망 클립 **0** |
| 클립 fps | 30 (`m_SampleRate: 30`) |
| 루트 모션 | 클립은 제자리(RootT.z ≈ 0.06 상수). `animator.applyRootMotion=false`(`NativeHeroMotion.cs` Bind) |
| 블렌드 트리 | 없음. 상태 3개(Idle/Walk/Run) + 레이어 1개 |
| 전환 | 컨트롤러엔 0.1 s 고정 전환(Speed 0.1/3 임계)이 있으나 런타임 `Play()` 점프라 **실효 0** |
| IK | Unity IK Pass 끔(`m_IKOnFeet: 0`, `m_IKPass: 0`). 대신 코드 2본 IK(`SolveArm`)로 팔·다리, rigpixel 모드에서만 발가락 고정(`PlantRunFeet`, 위상 .29~.43 / .83~.96) |
| Humanoid 매핑 | `Warrior_R7.fbx.meta` `animationType: 3`(Humanoid), `avatarSetup: 1`. meta의 humanDescription은 비어 있음 → 보드가 적은 수동 매핑(Spine02→Spine, Spine01→Chest, Spine→UpperChest)이 Editor 스크립트(`WarriorImport.Run`)에서 적용되는지 **미확인** |

### 1.5 Animator 구조 (`Warrior_Locomotion.controller`)

```
파라미터: Speed(float)
Base Layer (마스크 없음)
  Idle  ← 기본. Motion = Warrior_Walk, speed 0
  Walk    Motion = Warrior_Walk
  Run     Motion = Warrior_Run
  Idle→Walk  Speed > 0.1 | Walk→Idle Speed < 0.1 | Walk→Run Speed > 3 | Run→Walk Speed < 3
  (모두 duration 0.1 s 고정, exit time 없음)
ArmR_HoldWeapon (마스크 Warrior_ArmR = 오른팔, 가중치 1)
  HoldWeapon  Motion = Warrior_Walk_ArmR_Hold
```

런타임(`NativeHeroMotion.cs:410~420`): `animator.speed=0; SetFloat(Speed, moving?4:0); Play(moving?Run:Idle, 0, t); Play(HoldWeapon, holdLayer, t); animator.Update(0)`. 그 위에 `HumanPoseHandler.SetHumanPose`로 척추 머슬을 덮고, `SolveArm`으로 손·발을 맞춘다. Walk 상태는 런타임이 쓰지 않는다(이동이면 바로 Run).

### 1.6 표시 경로 세 가지

| 항목 | (a) 2D 스프라이트(**기본**) | (b) rigpixel RT 합성(`--hero-render=rigpixel`) | (c) 3D 직접 렌더(`--legacy-models`) |
|---|---|---|---|
| 코드 | `NativeHd2D.cs`, `NativeHeroSpriteMotion`(`NativeHeroMotion.cs:10~32`, 웹 `warrior-bat-swing.js` 프레임 수식 이식) | `NativeRigPixelHero.cs`·`NativeRigPixelPolicy.cs` + `NativeHeroMotion` | `NativeHeroView.cs` + `NativeHeroMotion` |
| 선택 조건 | `NativeHd2D.Enabled`(기본 true) | `RigPixelRequested`(`NativeGame.cs:238`) | `!NativeHd2D.Enabled` |
| 카메라 각 | 평면 투영(`ProjectFlatActors`) | 직교 캡처 카메라, **월드 카메라와 같은 회전**(1-1 ForestA2 피치 34°, LOCK) | 월드 카메라 |
| 해상도 | 스프라이트 원본 | RT 한 변 = `ceil(5.6u/(wpp×n)/32)×32`, 64~1024px, Point 필터, AA 없음. `n=max(1, floor(화면높이/1080))` → 1080p에서 **1텍셀 = 1화면픽셀** | 화면 |
| fps | 공격 시트 프레임(9프레임, 0.85속 팔로스루) | `LateUpdate`마다 1회 `SubmitRenderRequest` → **렌더 fps와 같다**. 프레임 양자화(12fps 스텝 등) 없음 | 렌더 fps |
| 동작 표본 시각 | Core 틱 60/s(`NativeGame.cs:104` `fixedDeltaTime=1/60`) | 같음. rigpixel에서만 거리 기반 보행 위상(`RigPixelLocomotionClock`, 보폭 3.0126 모델단위)·회전 지연(`RigPixelTurnClock` 12°/틱)·발가락 고정 | 같음(틱 시각 보행 위상) |
| 픽셀 느낌의 원천 | 원본 스프라이트 | `RigPixelToon` 셰이더 + Point 필터. 저해상도 다운샘플·저fps는 없다 | 없음 |

"동작이 몇 fps로 양자화돼 보이는가"의 답은 (b)·(c) 모두 **양자화 없음(60틱 표본을 렌더 fps로 그대로 그림)**이다. 픽셀 아트 특유의 8~12fps 홀드 리듬은 어느 경로에도 없다.

### 1.7 7항목 — 코드·클립으로 확인된 구조 근거 (리그 경로 b/c 기준)

실제 ○× 판정은 [MO_BASELINE](MO_BASELINE/MO_BASELINE_20261105.md)이다. 여기서는 각 항목의 **원인이 코드 어디에 있는지**만 적는다. "미판정" = 코드만으로는 판단 불가, 화면 몫.

| 항목 | idle | walk(run) | attack1(wSwing 1타) | 근거 |
|---|---|---|---|---|
| ① 예비동작 | — | — | Core 예비 0틱(idle→wSwing 즉시, `Simulation.cs:116`). 표현도 start→hit를 접점 전 2틱(33 ms)에 끝냄(`NativeHeroMotion.cs:152,248`) → **Core 제약**(D-MO-2) | 코드 |
| ② 무게 이동 | 걷기 0프레임 정지 + 흉곽 사인뿐. 체중 상수 `BodyWeight`는 Idle에서 0(`NativeHeroMotion.cs:105`) | 미판정(클립 RootT.x −0.024~+0.003 m 흔들림은 있음) | `SwingWeight` side ±0.06 m·forward 0.08 m·drop 0.025 m·골반 7°·흉곽 15°(136~154행). 수치가 작아 1x에서 읽히는지 미판정 | 코드·클립 |
| ③ 팔로스루 | — | — | hit→end 보간은 남은 3틱, Recover 중 앞 절반은 hit 자세 유지 뒤 복귀(`PoseWeight` 106행). 오버슈트·반동 없음 | 코드 |
| ④ 발 미끄러짐 | 정지 | **(c)** 클립 위상 = `tick/(60×0.633)`로 고정 38틱/주기, 실제 이동(2.6 px/틱=1.56 u/s)과 무관. **(b)** 거리 위상 + 발가락 고정(접점 3 mm 검사) | — | `NativeHeroMotion.cs:120,404,133~148` |
| ⑤ 전환 끊김 | Idle↔Run `Play()` 점프, 크로스페이드 0 | 같음 | Run→Swing 포즈 가중치 즉시 1(109행). Swing→Idle은 Recover 보간 | 코드 |
| ⑥ 타이밍 Core 불일치 | — | 틱 구동 | 접점 phase .4 = 틱 3(`HitArc` 136행과 일치). **피격은 불일치**(Core 경직 6틱, 표현 18틱·자원감소 12틱, `NativeHeroMotion.cs:256,260`) | 코드 |
| ⑦ 포즈 자체 | 미판정 | 미판정 | 미판정 | Mac |

구조 요약: "클립이 없거나(공격·대기) 자리표시 클립(걷기)이며 전환이 점프"다. 어느 한 동작을 손봐서 되는 문제가 아니라 ②리그→③클립→⑤Animator 전환을 한 번 끝까지 다시 만드는 파이프라인 문제다.

## §2 촬영 가이드 (1순위: 사용자 직접 연기 + 단일 카메라 영상 모캡)

### 2.1 무료 티어 조사 (2026-11-05, 클라우드)

이 세션의 네트워크 정책으로 **공급사 페이지(help.move.ai·docs.move.ai·rokoko.com·deepmotion.com·plask.ai·cascadeur.com)는 열리지 않았다**. 아래 수치는 검색 결과 요약이며 전부 **미검증**이다. 가입 전에 Mac에서 공식 가격 페이지를 열어 표를 확정한다.

| 도구 | 플랫폼 | 무료 티어(검색 요약, 미검증) | 내보내기 | 출처 URL | 비고 |
|---|---|---|---|---|---|
| **Move One**(Move AI) | iPhone 앱(iOS). Android 버전 근거 없음 | 영상당 최대 **30초**, 1회성 **30크레딧**(1크레딧≈처리 1초, 만료 없음). 유료 Personal $15/월 | FBX·BVH·USD·BLEND·JSON. Blender 플러그인 직접 내보내기 | help.move.ai/en/articles/8851451-move-one-pricing, docs.move.ai/knowledge/move-ai-pricing-plans-credits, cgchannel.com/2023/11/move-ai-releases-move-one | 무료 총량이 **30초**라 idle 10 + walk 10 + attack 10으로 꽉 찬다. 손가락 추적 없음(Pro) |
| **Rokoko Vision** | 웹 브라우저(웹캠 또는 업로드) | 단일 카메라 무료, **월 30초 처리**(한 클립 15초 상한 기록도 있음). 듀얼 카메라는 Plus $20/월 | FBX(무료), BVH(유료) | rokoko.com/pricing, rokoko.com/products/vision, cgchannel.com/2023/09/check-out-free-browser-based-ai-mocap-tool-rokoko-vision | Rokoko Blender 애드온(무료)으로 리타깃 가능 |
| **DeepMotion Animate 3D** | 웹 | 월 **60초**(또는 60크레딧), 클립당 20초, 비상업·워터마크. FBX가 무료에 포함되는지 출처가 엇갈림 | FBX/BVH/GLB(유료 확실, 무료 불확실) | deepmotion.com/pricing, blog.deepmotion.com/2021/05/27/animate3dstarterpackage | 상업 사용은 유료 필요 → 데모 반입 전 라이선스 확인 |
| **Plask Motion** | 웹 | **일 15초**(또는 일 900크레딧≈30초, 출처 엇갈림), 저장 1 GB. 무료는 리타깃 미리보기만이라는 기록 | FBX/GLB/BVH(무료 포함으로 기록) | plask.ai/pricing, renderhub.com/blog/budget-motion-capture-options-worth-considering | 매일 조금씩 누적 가능 |
| Mixamo(3순위) | 웹, Adobe 무료 계정 | 무제한. 자동 리깅 포함 | FBX | community.adobe.com/t5/mixamo-discussions/mixamo-faq-licensing-royalties-ownership-eula-and-tos/m-p/13234775 | 게임 반입 상업 사용 허용, 단독 재배포 금지. 로그인은 사용자 직접 |
| Quaternius Universal Animation Library | 다운로드 | CC0. 무료 Standard 45종, 전체 120+는 $9.99 | FBX/glTF | quaternius.com/packs/universalanimationlibrary.html, quaternius.itch.io/universal-animation-library | 공용 동작이라 "모두가 쓰는 동작" 제약 |
| Cascadeur(④ 손질 보조) | PC/Mac 앱 | 무료는 `.casc`만, **FBX 내보내기 불가**·비상업. Indie $12/월(연 $8/월, 연매출 $100k 미만) | FBX(유료) | cascadeur.com/plans | 물리 기반 자세 보정 도구. 유료라 승인 전 미사용 |

미검증 수: 공급사 페이지 6개 전부(위 굵은 도구 4개 + Mixamo FAQ + Cascadeur). Android용 Move One 존재 여부도 미검증(검색에서 iOS만 확인).

**추천(총량 기준):** 1차 촬영은 Move One(총 30초)로 idle·walk·attack1 각 10초, 보강 테이크는 Rokoko Vision(월 30초)·Plask(일 15초)로 나눠 쓴다. DeepMotion은 상업 조건이 걸려 보류. 사용자 폰이 Android면 Move One 대신 Rokoko Vision(웹 업로드)이 1순위가 된다.

### 2.2 촬영 세팅

| 항목 | 값 | 이유 |
|---|---|---|
| 카메라 | 폰 1대, 가로(landscape), 1080p **60fps**(불가하면 30fps), 손떨림 보정 끔, 삼각대 또는 고정 | Core 60틱과 맞추기 쉽고, 공격 접점(3틱=50 ms)을 프레임으로 잡는다 |
| 높이·거리 | 렌즈 높이 **1.0~1.2 m**(골반~명치), 거리 **3.5~4 m**, 연기자 전신 + 머리 위·발 아래 각 0.5 m 여유 | 단일 카메라 모캡은 전신·발이 항상 보여야 한다. 광각 왜곡 금지 |
| 각도 | 정면에서 **30~45° 비스듬히**(측면 성분 확보). attack1은 같은 각도로 한 번, 정측면(90°)으로 한 번 더 | 예비·팔로스루 깊이는 측면에서만 읽힌다 |
| 배경 | 단색 벽, 바닥과 벽 경계 보이게. 거울·유리·움직이는 물건 없음 | 추적 오염 방지 |
| 조명 | 정면 확산광, 역광·창문 뒤 금지, 그림자 약하게 | |
| 의상 | 배경과 대비되는 **몸에 붙는 단색 긴팔·긴바지**, 운동화, 모자·망토·치마 금지, 머리 묶기 | 관절 추정 정확도 |
| 소품 | 대검 대용 **길이 1.4~1.5 m, 무게 2~3 kg**의 막대(빗자루에 모래주머니 등). 날 없음, 안전 거리 확보 | 무게가 있어야 예비·팔로스루가 몸에 나온다(핵심) |
| 캘리브레이션 | 매 테이크 시작 **A포즈 3초**(팔 45° 아래) → 동작 → 끝에 A포즈 2초 | Move One·Rokoko 공통 요구. Humanoid 리타깃 기준 자세 |
| 슬레이트 | 테이크 시작 때 카메라를 보고 **"동작이름-테이크번호"를 말하고 손뼉 1회**. 예: "attack1-3" + 손뼉 | 파일명·오디오 동기 기준 |
| 파일명 | `YYYYMMDD_<동작>_t<번호>.mp4` → `I:/EXODUSER-Storage/mocap/raw/20261105/` | 매뉴얼 ⑤ 네이밍 |

### 2.3 동작 목록 (1순위 3개, 총 30초 안)

| 동작 | 길이 | 연기 지시 | Core 타이밍 대응 |
|---|---|---|---|
| idle | **10초** × 2테이크 | 대검(소품)을 오른손에 들고 칼끝을 뒤·아래로 끌며 선다. 무게 중심을 좌우로 **아주 천천히** 옮기고 호흡. 발은 떼지 않는다. 5초 지점에서 한 번 어깨를 고쳐 잡는다 | 루프 클립. 길이 제한 없음 |
| walk(실제로는 run 상태) | 왕복 **10초** × 2테이크 | 카메라 기준 좌→우 3보, 돌아서 우→좌 3보. 보폭 넓게, 대검 무게로 어깨 한쪽이 처진 채. 돌 때 멈추지 말 것 | 1.56 u/s(초당 키 0.97배). 실제 보행 1.3~1.6 m/s와 비슷하므로 **평소 걷기 속도** |
| attack1 | **5회**, 테이크당 10초 | A포즈 → 준비자세 → **크게 뒤로 당겼다가**(예비) → 수평 베기 → 끝까지 휘두르고(팔로스루) → 멈춰 1초 → 준비자세. 매회 사이 1초. 5회 중 2회는 **최대한 무겁게·느리게**, 2회는 빠르게, 1회는 중간 | D-MO-2 적용 후 예비 6·휘두름 5·회복 28틱. 모캡 예비 구간은 ④에서 6틱(100 ms)으로 잘라 쓰고, 팔로스루는 회복 28틱(0.47 s)에 맞춰 늘인다 |

예비 테이크(총량이 남으면): roll(앞구르기 3회, 매트 위), hurt(뒤로 밀리며 버티기 3회), death(무릎부터 무너지기 2회).

### 2.4 촬영 후 즉시 확인

- 각 테이크를 앱에서 처리해 **발이 땅에 붙는지**(미끄러짐·떠오름)와 손 교차 구간의 팔 꼬임을 본다. 꼬이면 각도를 바꿔 재촬영(무료 총량 소모 주의 — 먼저 폰 영상만 보고 고른 뒤 처리).
- 내보내기: FBX(30 또는 60fps 원본 그대로), 스켈레톤 기본값. 파일은 `I:/EXODUSER-Storage/mocap/fbx/20261105/`에 두고 SHA256을 `sha256.txt`에 적는다.

## §3 타이밍 표 (현재 Core 값, `unity/main` `a1ee5666c`)

60틱 = 1초. 기본 공격은 프리뷰 진입 상태에서 측정했고, 새 캐릭터 경로의 무기 값은 확인하지 않았다.

| 동작 | 구간 | 틱 | 시간 | 출처 |
|---|---|---|---|---|
| 기본 공격 1타 | 예비 (`wWindup`) | **0** | 0ms | 기본 공격은 이 상태를 거치지 않음. `wWindup`은 기검 충전 경로뿐 (`Simulation.cs:112`, `:121`) |
| | 휘두름 (`wSwing`) | **5** | 83ms | `Simulation.cs:116`, `:130` |
| | 접점 (`HitArc`) | `StateTicks`가 3을 지날 때 | | `Simulation.cs:136` |
| | 검기 생성 (`SpawnKiSlash`) | 휘두름 시작 때 | | `Simulation.cs:131` |
| | 회복 (`wRecover`) | **34** (측정) | 567ms | `(int)(16/(WeaponSpeed × AttackSpeedMultiplier))`, `Simulation.cs:139` |
| | 합계 | **39** | 650ms | `motion-log.csv` 5회 반복 동일 |
| 이동 | 속도 | 2.72px/틱 (측정) | 163px/초 | `motion-log.csv`. 첫 틱부터 전속력 |
| 이동 | 루트 이동 | 공격 중 0 | | `motion-log.csv` (x 4200.00 고정) |

구르기, 피격, 사망은 재지 않았다.

### 3.2 Core 파일:줄 전수표 (클라우드, 코드 읽기)

위 측정표를 코드로 보강한 것이다. 측정과 식이 다른 곳은 둘 다 적었다. px → Unity 단위는 ÷100(`NativeRemodel3D.cs` `Point2D`, `x/100f`). 화면 영웅 키 1.61u(캐릭터 보드 11-04).

| # | 동작 | 예비(틱) | 접점/발동(틱) | 회복(틱) | 총 길이 | 이동량 | 근거 |
|---|---|---|---|---|---|---|---|
| 1 | 기본 공격 1타 `wSwing` | **0** (idle에서 즉시 진입) | 5틱 상태. 판정은 `StateTicks<=3 && +1>3` → 진입 후 3번째 틱(phase .4) | `int(16/(WeaponSpeed×AtkSpdMul))`. 근접 7종 모두 SpdMul .45, 배율 1 → 식 **35**(16/.45=35.56), Mac 측정 **34**(틱 경계 차이, 미확정) | 39~40틱 ≈ 0.65 s | 공격 중 이동 ×0.8(2.08 px/틱) | `Core/Simulation.cs:105,107,116,134~142`; `SimulationState.cs:21,30`; `WeaponCatalog.cs:19` |
| 1b | 기검참 3타째 충전 `wWindup` | 홀드(999) 최대 120틱 | 해제 시 `wSwing` 5틱 | 위와 같음 | 가변 | — | `Simulation.cs:111~132`; `KiSlash.cs:49`(콤보 창 120틱, 쿨 12/20) |
| 2 | E 타격 `sBash` | 20틱 상태 | `st2` 12 교차 = 8번째 틱 | `sRecover` = `int(28/(1+pParry×.1))` → 기본 **28틱** | 48틱 = 0.8 s | ×0.8 | `ParryRules.cs:12,18,114,137`; `Simulation.PlayerCombat.cs:65,82,97` |
| 3 | 지옥강타 | `gSlamWindup` 10틱이지만 **진입 첫 틱에 피해·파동 동시** | 0 | `gSlam1` 10 + `gSlamRecover` 12 | 32틱 | — | `Skills/SkillRules.cs:62`; HERO_MOTION 문서 "R5 타이밍 계약 정정" |
| 4 | 구르기 `bladeDash` | 0 | — | — | **18틱 = 0.3 s**, 앞 **14틱 무적**, 뒤 4틱 노출 | **175 px** ease-out(속도 1.5−u 비례, 18틱 합이 정확히 175) | `RollRules.cs:10~12,36~40`; `Simulation.Roll.cs:62~66` |
| 5 | 피격 경직 `stagger` | — | 즉시 | **6틱** | 6틱 = 0.1 s | 넉백 `min(12, max(1, dmg/maxHp×30))` px 누적 | `PlayerPoise.cs:12,40`; `Simulation.PlayerHurt.cs:122~124` |
| 5b | 포이즈 0 스턴 `pStun` | — | 즉시 | `int(240×(1−min(.5, ccRes+stunRes)))` → 기본 **240틱** = 4 s, 히트스톱 5 | 240틱 | — | `PlayerPoise.cs:12,22,36~38` |
| 6 | 쓰러짐 `fallen` → 사망 `dead` | — | HP≤0 즉시 `fallen` | `fallen` **300틱**(5 s, 무적 9999) 뒤 `dead` | 300틱+ | — | `Simulation.Revive.cs:78,85,97` |
| 7 | 이동 | — | — | — | — | 설정 **2.6 px/틱**(`PlayerSpeed`) = 156 px/s = 1.56 u/s(키 1.61u 기준 초당 약 0.97 키). Mac 측정 2.72 px/틱(장화 `spd` 가산 또는 측정 상태 차이, 미확정). 행동 중 ×0.8 | `SimulationState.cs:23`; `Simulation.cs:46,105,182,190~198` |

표현 쪽이 쓰는 값(대조): 공격 접점 phase .4 일치, 구르기 18 일치, 사망 최종 자세 48틱(`NativeHeroMotion.cs:243`, Core 300틱 안), **피격 18틱/12틱(256·260행) ≠ Core 6틱**, Run 주기 38틱(0.633 s) — Core에 대응 수치 없음(걷기 템포는 표현 자유, 단 발 미끄러짐으로 돌아옴).

## D-MO-2 Core 제안 — 사용자 결정: 6틱, 총 길이 유지 (11-05)

**기본 공격 1타에 `wWindup` 6틱을 넣고, 회복을 6틱 줄여 총 길이를 유지한다.** 측정 상태에서는 예비 6 → 휘두름 5 → 회복 28, 합계 39틱이다.

**아직 적용하지 않았다.** Core 수치 변경이라 CTO의 구현 배정과 병합이 필요하다. 적용 전까지 채점표 예비동작은 "Core 제약"으로 표기한다.

**구현 때 정할 것:**
- 회복은 `(int)(16/(WeaponSpeed × AttackSpeedMultiplier))`로 계산되므로 34틱은 측정 상태의 값이다. 공격 속도가 높아 회복이 6틱보다 짧아지는 경우의 처리가 필요하다.
- 예비 6틱이 공격 속도 영향을 받는지.
- 콤보 2타 이후와 다른 무기에 적용할지. 이번 결정은 기본 공격 1타 기준이다.
- (클라우드 추가) 표현 쪽: `NativeHeroMotion.cs:252`는 `wWindup`을 기검 충전(`Charge`, phase=charge/120)으로만 해석한다. 기본 공격 예비를 넣으면 `wWindup && !KiChargeActive`를 새 예비 종류로 분기해야 하고, 웹 스프라이트 경로(`NativeHeroSpriteMotion.Frame`, 9~31행)는 이미 `wWindup` 프레임 0~2를 갖고 있어 그대로 쓸 수 있다. 웹 oracle(`game.html`) 쪽 기본 공격에 예비 틱이 있는지는 확인하지 않았다(Core 변경 시 oracle 대조 필요).

후보 비교:

| N | 입력→휘두름 지연 | 총 길이 유지 시 회복 | 총 길이 안 맞출 때 합계 |
|---|---|---|---|
| 4 | 67ms | 30틱 | 43틱 (717ms) |
| 6 | 100ms | 28틱 | 45틱 (750ms) |
| 8 | 133ms | 26틱 | 47틱 (783ms) |

위 표의 회복·합계는 현재 측정값 34틱과 5틱에서 계산했다. 공격 판정 시점이 늦어지므로 전투 손맛과 밸런스가 달라진다. 이 영향은 측정하지 않았다.

## §4 단계별 설정·실패 기록

실습 기록은 **Mac 실습 대기**다. 형식: 단계 / 도구·버전 / 설정값 / 입력 SHA / 결과 / FAIL 사유 / 다음 시도. 아래 4.0은 클라우드가 쓴 ①② 도구 옵션표 초안이며, 도구별 `TOOLS/*.md`(옵션 전수표·절차·실습 기록, 틀은 `DIRECTION_RESET_20261105.md` 09:50 결정)는 Mac 실습 때 채운다.

### 4.0.1 ① 타이밍 표 → 클립 규격 (제안, Core 불변, D-MO-2 반영)

| 클립 | fps | 길이(프레임@60) | 구간 | 루트 |
|---|---|---|---|---|
| Idle | 60 | 600(10 s 루프) | — | 제자리 |
| Run | 60 | 1주기 = 보폭/속도. 보폭 1.0u 가정 시 1.0/1.56 = 0.64 s ≈ **38프레임**(현재 Run 주기 38틱과 일치) | — | 제자리 + 거리 위상(rigpixel 방식) |
| Attack1 | 60 | **39**(예비 6 / 휘두름 5·접점 3번째 / 회복 28) — D-MO-2 적용 전에는 예비 0·회복 34 | 접점 = 예비 뒤 3프레임째 | 제자리, 전진 성분은 Core 이동(×0.8)에 맡김 |
| Roll | 60 | 18 | 무적 1~14 | 루트 제거(Core가 175 px 이동) |
| Hurt | 60 | 6(Core) — 표현 연장 여부는 사용자 결정 | — | 제자리(넉백은 Core) |
| Death | 60 | 48(최종 자세) + 홀드 | — | 제자리 |

### 4.0.2 ② 리그 1개 — 옵션표

| 옵션 | 비용 | Unity Humanoid 호환 | 장점 | 제약·위험 | 출처 |
|---|---|---|---|---|---|
| A. **기존 Meshy 24본 리그(R7) 유지 + Blender에서 보강**(손가락·트위스트·무기 소켓 본 추가, 가중치 수동) | 0 | ○(이미 Humanoid 17본 대응) | 현재 메시·망토·소켓 호환. 재리깅 없이 ③로 바로 갈 수 있다 | 자동 가중치 품질 미확인(겨드랑이·골반). 손가락 없음 → 파지는 블렌드셰이프 `Fist_R` | 보드 §3-1 ③⑤ |
| B. **Blender Rigify**(무료) | 0 | △ Rigify DEF 본 계층을 그대로 내보내면 Humanoid 매핑이 깨진다 → **Game Rig Tools**(무료 애드온)로 디폼 리그 추출·액션 베이크, 또는 ORG 본으로 디폼 | 전신 컨트롤 리그(IK/FK, 손가락) → ④ 손 다듬기에 최적 | 내보내기 정리 단계가 하나 더. 메시 재가중 필요(망토 9본 재작업) | blendernation.com/2023/01/14/…rigify-rig-free-and-easy, game-rig-tools-documentation.readthedocs.io, github.com/vignedev/Rigify-To-Unity, docs.unity3d.com/cn/560/Manual/BlenderAndRigify.html |
| C. **Auto-Rig Pro**(Superhive, Lite $25 / Full $50) | 유료 → **승인 필요** | ○ 전용 "Humanoid" 내보내기 프리셋, Remap 리타깃 포함 | 가장 빠른 리깅+리타깃 일체. Blender 2.93~5.1 | 유료. 리뷰에 "spine_02가 Unity chest로 안 잡힘" 사례 → 매핑 검사 필수 | superhivemarket.com/products/auto-rig-pro, sorceress.games/blog/auto-rig-pro-free-download-the-honest-2026-path(가격 2026-09-04 확인 기록) |
| D. **Mixamo 자동 리깅**(무료) | 0 | ○ 65본(손가락 포함) 표준 | 리깅+리타깃 동시, 즉시 | 메시를 Adobe에 올린다(메시만). 망토·소켓 재작업. 가중치 조절 불가 | 위 Mixamo FAQ |

**초안 추천:** A를 1순위(현재와 호환, 비용 0), ④에서 컨트롤 리그가 필요해지면 B(Rigify + Game Rig Tools)로 **컨트롤 리그만 얹고 디폼 본은 A 그대로** 두는 방식. C는 A·B가 같은 단계에서 2회 FAIL일 때 승인 요청.

### 4.0.3 ③ 모캡 반입·리타깃 — 후보만(D-MO-1 결정 전에는 진행 안 함)

| 옵션 | 비용 | 비고 |
|---|---|---|
| Unity Humanoid 리타깃(내장) | 0 | 모캡 FBX를 Humanoid로 임포트하면 아바타 간 자동 리타깃. 발 미끄러짐은 Animation Rigging 또는 코드 IK로 후처리 |
| Rokoko Blender 애드온(무료) | 0 | 본 이름 수동 매핑, T포즈 정렬. 커스텀 리그 OK |
| Move One Blender 플러그인 | 0 | Move One 결과를 Blender로 직접 |
| ARP Remap | C 구매 시 포함 | |

④는 Blender NLA·그래프 에디터(무료)로 한다. Cascadeur는 무료 티어가 FBX를 내보내지 못하므로 쓰지 않는다(§2.1).

## §5 비교 영상 경로·판정

**Mac 실습 대기.** 10초 무음 영상 ×3(현재 / 새 파이프라인 / 레퍼런스 블러 구도), 1920×1080·3840×1080, 1x·3x 크롭, MO_BASELINE 채점표 재채점. 현재 기준 영상은 `MO_BASELINE/`에 있다.

## 부록 A. 클라우드 조사 방법·한계

- FBX는 바이너리 파서(스크래치, 커밋 안 함)로 `Creator`·`Model`·`Geometry`·`AnimationStack`·`AnimationCurve` 노드를 읽었다. 키 수 히스토그램(예: Ivan_Walk 60커브×32키, 156커브×2키)은 Blender 내보내기 베이크 결과라 **원 제작 방식의 직접 증거가 아니다**. 제작 방식은 문서·커밋으로 확정했다.
- 커밋 이력은 GitHub API(`unity/main`, 경로 필터)로 읽었다. 이 세션 checkout은 depth 1이다.
- 열지 못한 페이지: help.move.ai, docs.move.ai, rokoko.com, deepmotion.com, plask.ai, cascadeur.com(세션 네트워크 정책). 검색 요약은 2023~2026 혼재라 **가격·한도는 전부 미검증**이다.
- 미확인: R7 Humanoid 매핑이 어디서 적용되는지(meta는 비어 있음), Meshy 걷기 클립의 실제 보폭(m), 회복 34(측정) vs 35(식)·이동 2.72(측정) vs 2.6(설정) 차이의 원인.
