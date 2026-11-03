# 적 3D Unity 연결 바탕 — 2026-11-04 01:20 1차 종 추가

> 11-04 30종 연결로 아래 "모델 선택"·"빈 동작 표" 등 1차 5종 + 시작 육괴(Walk만) 기록은 이력이다. 현재 표·슬롯·정면·루트 고정은 맨 아래 "11-04 30종 연결" 절이 대체한다.

상태: **PC 정책166/0·전체 참조 컴파일5개 오류0 / RETOUCH_GAME_QA_PENDING.** 실제 임포트·Player 화면·동작 완성·성능은 미판정이다.
기준: origin/unity/main 5c9dd3673861b4b5086884dac664068b4d87f370. 브랜치 codex/unity-enemy3d-20261104, 작업본 G:/exoduser-wt/codex-parry. 이번에는 최신 본편을 충돌 없이 fast-forward 병합했다. 이전 CHANGELOG 양쪽 기록도 보존된다.

## 모델 선택

| 표현 키 | 리소스 | 동작 현황 | 표시 데이터 |
|---|---|---|---|
| etype1, startEyeMass=false | Enemies3D/SpineApostle | Meshy24본, Walk 클립 연결 | baseRadius10, height1.35, chestRatio.618, stride80, deathTicks45 |
| etype4, startEyeMass=true | Enemies3D/EyeMass | Meshy+Tripo20본, 제공 클립 없음 | baseRadius16, height1.05, chestRatio.55, stride80, deathTicks45 |
| etype7, startEyeMass=false | Enemies3D/SageApostle | Meshy24본, Walk | baseRadius10, height1.27, chestRatio.639, stride80, deathTicks45 |
| etype16, startEyeMass=false | Enemies3D/TrapperApostle | Meshy24본, Walk | baseRadius10, height1.27, chestRatio.570, stride80, deathTicks45 |
| etype47, startEyeMass=false | Enemies3D/ShadowTwin | Meshy24본, Walk | baseRadius12, height1.42, chestRatio.641, stride80, deathTicks45 |
| etype4, startEyeMass=false | Enemies3D/CarapaceApostleV2 | Meshy24본, Walk. v1 제외 | baseRadius16, height1.49, chestRatio.625, stride80, deathTicks45 |
| 모델 없음·보스·구울 | 현재 표시 | 보스 전용 경로 포함 | 기존 표시 유지 |

표: Resources/Data/enemy_rig_models.json. 기존 AnchorRatio·ImpactRatio·chestRatio/height/deathTicks 및 --enemy-render=rigpixel 이름과 의미를 유지했다. startEyeMass 키와 EnemyState.IsStartEyeMass만 추가했다. 기존 시작 로그에는 개체 ID가 없어 문자열/좌표 추정 대신 StartMobs에서 해당 두 개체에 비직렬화 표현 태그를 붙인다. Core 수정은 필드 선언+대입 두 줄뿐이며 전투 규칙에서는 읽지 않는다. 정예·스폰 좌표 해시는 새 모델 선택에 쓰지 않는다.

Spine height/chestRatio는 총괄의 0차 측정값(1.35/.618), Eye height1.05/chestRatio.55와 stride80은 잠정값이다. 실제 눈 높이·보폭은 G3.5/Mac 캡처로 보정한다. 일반 갑각 사도를 EyeMass로 바꾸던 키 결함은 이전에 수정했고, 이번에는 일반4용 CarapaceApostleV2를 별도로 등록했다.

## 렌더 연결

- --enemy-render=rigpixel opt-in. NativeRemodel3D.Active일 때만 적 리그를 표시한다. 기본값과 2D 구역은 기존 스프라이트다. 영웅과 직접 비교할 때 --hero-render=rigpixel도 함께 쓴다.
- NativeGame.Enemy3D → NativeEnemyRigRenderer. 영웅과 같은 Shaders/RigPixelToon·RigPixelComposite·HD2DContact를 공유한다. 화면 높이에 따른 NativeRigPixelPolicy의 정수 텍셀 배율, Point·비MSAA·비밉맵 RT, 발밑 픽셀 스냅과 같은 외곽선 합성이다. 셰이더 사본은 만들지 않았다.
- 전용 레이어28(기존 지면 QA29·영웅30과 분리), 공유 캡처 카메라1개, 보이는 개체마다 RT1개. 포착할 리그만 일시적으로 켜고 월드 카메라에는 원본 메시를 숨긴다. 34도 카메라·거리·판정 원은 바꾸지 않는다.
- 실제 RenderRequest 성공 뒤에만 본체/걷기 스프라이트를 숨긴다. 모델/셰이더/Animator/RT 실패는 해당 개체를 스프라이트로 돌리고 경고를 한 번 기록한다. 재시작·소멸 때 RT·재질·Playables를 정리하고 카메라 마스크의 자기 비트만 복구한다.
- 기존 피격 포즈 홀드 중에는 모델도 마지막 자세를 유지한다. 모델 없는 etype의 렌더는 그대로다.

## Animator와 Core 틱

Generic Animator + PlayableGraph(Manual), applyRootMotion=false. 상태마다 JSON 클립 슬롯을 바꿀 수 있고 샘플링 시각은 아래 Core 값에서 구한다. 벽시계/Animator 자동 전이로 전투 시점을 만들지 않는다.

| 상태 | 시계/근거 |
|---|---|
| Idle | Core 틱, 기본 반복120틱 |
| Move | 기존 ev.distance / stride로 보행 위상 |
| Tell | g2Tell: MeleeTellMax-MeleeTimer / 탄:60-_projChargeT |
| Active | g2Active: MeleeActiveMax-MeleeTimer / 탄 충전 종료 후 표시3틱 |
| Recover | g2Gap 또는 MeleeFreezeUntil·MeleeParriedTick / 탄 표시 복귀9틱 |
| Hit | HurtTicks·HitStun, 표시10틱 |
| Stagger | Stunned·MaxStunned, 포이즈 붕괴 |
| Death | 첫 사망 관측 Core 틱부터 definition.deathTicks에 맞춰 클립 샘플링, 이후 표시 종료 |

탄 발동3/복귀9·Hit10은 표시용 길이이며 Core 발사/피해 수치를 바꾸지 않는다. 근접 판정은 기존 G2 타이머를 그대로 읽는다. 동작 클립이 없는 슬롯은 bind pose로 남고 missingClips/로그에 드러난다. **제공되지 않은 공격·피격·사망 동작을 제작 완료로 판정하지 않는다. 1차 이족5종은 Walk만 연결했고 그 외7개 슬롯(Idle/Tell/Active/Recover/Hit/Stagger/Death)은 비어 있다.** EyeMass는 리그만 있어 모든 동작이 이 상태이며, 모델/렌더 연결 검수용이다.

## VFX 연결 계약

- NativeEnemyRigRenderer.ImpactAnchor(FeedbackEvent,Camera) → nullable EnemyRigImpactAnchor. 필드 Point/Ground/WorldHeight/ProjectedHeightPx/ChestRatio/DeathStartTick/DeathTicks/Large.
- TargetId 우선. ID가 없는 이벤트는 etype+동일 좌표의 유일한 표시 개체만 쓴다. 후보가 겹치면 추정하지 않고 기존 Core 반경 방식을 유지한다.
- 표시 리그 Renderer.bounds의 8꼭짓점을 투영한다. Point는 발밑 화면Y+투영 높이×AnchorRatio(chestRatio), 몸 투영 bounds 안으로 제한한다. WorldHeight는 그 투영 높이를 해당 깊이의 월드 길이로 환산한 값이다.
- CombatImpactView.EnemyRigAnchor 선택적 콜백으로 일반 피격·치명·사망의 접점을 몸으로 옮긴다. 최종 시트 폭은 WorldHeight×ImpactRatio(일반.6/치명·사망1.0, 큰 적 상한1.2)이며 Blood Stretch도 최종 폭에 포함해 상한을 넘기지 않는다. null이면 기존 경로 그대로다. Core 이벤트 자체의 X/Y/Size는 수정하지 않는다.
- 사망 이벤트를 Dispatch에서 먼저 관측하므로 모델 사망 샘플링 시작과 기존 피 시트·바닥 혈흔 생성은 같은 Core 틱이다. 바닥 혈흔은 발밑에 남긴다. deathTicks 뒤에도 이미 생성된 피 시트가 발밑으로 튀지 않도록 마지막 리그 접점을 유지한다. 실제 무너짐 클립은 아직 없다.

## 검증·남은 관문

- 하니스 Core/Skills 재귀 열거 수정 후 지정 재검사1회:65개/실패0.
- 시작 스폰 태그·공유 etype 선택·리소스 존재·8개 상태·정지 틱·접점 bounds/비율 확장 검사1회:166개/실패0. 정책·모델 선택·승인 버전/외눈 보정·임펙트 숫자·제공 클립을 검사했으며 Unity 런타임 PASS가 아니다.
- 전체 PC Unity DLL 참조 컴파일1회: Player Core126/Runtime268, Editor Core126/Runtime268/Editor59, 총5개 오류0. 기존 Core 경고 CS0219 2개는 유지.
- 기존 다른 작업본 Library의 RSP/DLL은 읽기 참조만. Unity/Player/빌드 실행0, 유료0. PC에서 임포트나 화면 검사를 실행하지 않았다.
- FBX·JSON·코드의 고정 GUID .meta를 추가했다. 실제 Generic 리그/클립 임포트는 Mac에서 확인한다. 이전 변환 FBX/8재질 면은 G3.5 수정 전 시범 자산이며 외형 채택 판정은 아니다.
- Mac: 1920×1080·3840×1080, 위/중간/아래 bounds와 접지, 일반4 아틀라스/시작4 육괴 구분, G2 예고·발동(겹친3마리), 일반/치명/사망 피격, 영웅 옆1x·3x, 10초 무음 영상, 30마리 성능. 모든 누락 동작 클립 제작 후 자연 플레이 판정이 필요하다.
- -output을 주면 종료 시 enemy3d-render.json에 개체키·모델·현재상태·누락클립·렌더수·폴백·최근 렌더시간을 쓴다. NativeGame.WriteEnemyRigReceipt(directory)로 Mac 하니스에서 중간 기록도 가능하다.

증거 고정 위치: I:/EXODUSER-Storage/codex-takeover/parry-g2/REPORT.md(최종 SHA), enemy3d-check/policy.log, enemy3d-compile.out.log, compile-current/result.json·assembly-sources.json·Player/Editor/*.log. 바이너리 중간물은 확인 후 정리한다.

이전 중단 이력: 3d3c186106은 예상 RED1회와 하니스 소스 열거 오류1회 뒤 중단한 WIP였다. 01:00 브리프가 재개를 승인했고 이번 첫 재검사가 통과해 그 중단 사유는 해소됐다. 이전 failure JSON은 과거 기록이며 이번 검증 결과는 아니다.

## 01:20 1차 자산 인계

제작자 PASS 정본22aa8c30b의 G0 §4.1.2~4.1.3과 impact_metrics_1st.json·impact_metrics_carapace2.json을 적용했다. 높이/가슴: 1=1.35/.618, 7=1.27/.639, 16=1.27/.570, 47=1.42/.641, 일반4 v2=1.49/.625. 가시 사도는 cleanup/spine_walk_eyefix.glb(눈1.25배/위15도 보정)를 쓴다. 나머지는 sage_rig_20261104_0038·trapper_rig_20261104_0042·twin_rig_20261104_0046·carapace2_rig_20261104_0100의 basic_animations_walking_glb.glb다. 원본 I: 자산을 수정하지 않았다.

일반 etype4는 이번부터 갑각 v2를 쓴다. 시작 etype4는 동일 EyeMass 리소스·GUID·기존 FBX를 유지한다. 변환 도구는 명시적으로 본체와 리그만 선택해 Blender의 보조 bone-shape Icosphere를 제외한다. provenance의 삼각형 수는 본체 기준으로 바로잡았다(이전 집계는 숨김 보조물80tri까지 포함했다). 새 4종 .meta는 기존 Generic 임포트 설정과 고정 GUID를 쓴다.

빈 동작 표: 1/7/16/47/일반4는 Move=Walk, Idle/Tell/Active/Recover/Hit/Stagger/Death 없음. 시작 EyeMass는 Move를 포함8종 모두 없음. bind pose·missingClips 기록 정책을 유지한다. 현자형 사도의 손 불꽃/팔레트 발광 보완도 아직 없다. 제작자 PASS는 Blender 근사 비교판 판정이며 Unity에서 같은 외형/색·동작이란 판정은 Mac에서 한다.

이번 Core·렌더 정책·Animator/VFX 런타임 코드 변경0, 기본 플래그 변경0. PC 정책166/0·전체 참조 컴파일5개 오류0 각1회. 가시 보정 후 접점 오차·걷기 발 미끄러짐·표의 잠정 크기와 보폭·30마리 성능은 Mac 미판정이다.

## 11-04 30종 연결 — PC 정책·컴파일만, Mac 판정 전

상태: **PC 정책 1046/0 · 전체 참조 컴파일 5어셈블리 오류 0 / Mac 임포트·화면·동작·성능 미판정(완료 아님).** 기준 origin/unity/main 60b7f746e, 브랜치 claude/unity-pc-enemy3d-30-20261104(작업본 G:/exoduser-wt/claude-ulead-mipmap). 위의 모델 선택 표(1차 5종 + 시작 육괴, Walk만 연결)는 11-04 01:20 기준이며 이 절의 30행 표가 대체한다. Core 수치·판정·필드 수정 0, 기본 플래그와 기본 렌더 경로 변경 0.

### 변환 — unity/Tools/enemy3d/import-anim-v1.py

- import-pilots.py는 지우지 않고 남기며 새 변환기가 그 일을 대신한다(옛 pilot-provenance.json도 그대로). 원본 `I:/EXODUSER-Storage/boss/enemy3d-20261104/anim/<key>_anim_v1.glb` 30개(읽기 전용)를 Blender 5.2.3 `-b --factory-startup`으로 `Resources/Enemies3D/<이름>.fbx`로 변환했다. 새 24개 리소스는 PascalCase 영문 이름, 기존 6개(SpineApostle·SageApostle·TrapperApostle·ShadowTwin·CarapaceApostleV2·EyeMass)는 이름과 `.meta` GUID를 그대로 둔 채 FBX만 덮어썼다. 새 24개 `.fbx.meta`는 SageApostle.fbx.meta 복사 + 무작위 GUID(저장소 전체 meta와 겹침 0)다.
- 변환 실행 2회: 첫 회는 3번째(imp) 모델에서 cp949로 저장된 리포트 JSON 디코딩 오류로 멈췄고(원인 수정: UTF-8 실패 시 cp949), 2회째에 30개 전부 성공했다. 영수증 `Resources/Enemies3D/enemy3d-provenance.json`(키마다 리소스·원본·뼈 수·삼각형·클립 길이·정면 보정·루트 고정·소켓), 로그 `I:/EXODUSER-Storage/ulead-enemy3d-20261104/convert_run2.log`.
- 클립: GLB 원래 이름 그대로(idle·walk·hit·stagger·death·attack_tele …), 씬 60fps로 임포트해 1프레임=Core 1틱, 모든 액션을 FBX에 굽는다(옛 `Walk` 일괄 개명 없음). FBX 테이크 이름은 `Armature|<클립>`이다(FBX 바이너리 문자열로 확인). Unity가 클립을 같은 문자열로 만들 것이며 런타임은 `|` 뒤 이름으로도 찾는다 — **Unity 임포트는 PC에서 실행하지 않았으므로 실제 클립 이름은 미확인**이고 Enemy3DImportCheck가 Mac에서 확인한다.
- 팔레트 8면 변환은 기존과 같다. 가시 사도 눈 보정: `spine_anim_v1.glb`와 `cleanup/spine_walk_eyefix.glb`의 전 정점 15,589개를 비교해 최대 차이 1.0e-6, 다른 정점 0개이고(보정 전 원본과는 3,448개 정점·최대 0.1255m 차이) 눈알 1.25배·위 15° 보정이 들어 있다.
- 삼각형 가드(미리보기 도형 금지): 사람형 8,000 초과(기존과 같음), Tripo 비사람형 5,000 초과(본체 약 12.2~12.5k, 뼈 미리보기 도형은 수백 개). 30개 본체 모두 12,091~12,560이다.
- 무기 3종(ritual 지팡이·duelist 쌍낫·warden 망치): FBX `object_types`에 `EMPTY`가 필요하다(소켓이 빈 오브젝트 노드). 소켓이 있는 종만 EMPTY를 포함해 내보냈다. 3종 FBX를 Blender로 다시 열어 `WeaponSocket_R/L`이 `RightHand/LeftHand` 뼈의 자식으로, 무기 메시가 소켓의 자식으로 나온다. 소켓 노드 값(위치·회전·스케일 100)은 GLB 값 그대로이며 Blender 재열기 표시 어긋남은 임포터 문제로 보고 고치지 않았다(provenance에 GLB 값 기록). 무기 재질은 렌더러가 재질 이름 `enemy_<hex>`에서 색을 읽으므로 `weapon_wood`→`enemy_3b2a1e` 식으로 이름만 바꿨다(색 값은 그대로).
- FBX 합계 **99,619,208바이트(약 99.6MB, 한도 150MB 이내)**, 건당 2.09~7.22MB.

### 정면 보정 — 비사람형 9종

원본 정면은 Blender 월드 -X(Tripo 뼈), 사람형(Meshy)은 -Y다. 변환기가 아마추어(와 본체·소켓)를 Z축 +90°로 돌려 오브젝트 변환에 apply한다(적용 후 아마추어 회전 0,0,0). 사람형과 같은 FBX 축 설정(`axis_forward=-Z`, `axis_up=Y`)으로 내보냈고 런타임 회전은 더하지 않는다.

- **수치 확인(사람형 1 + 비사람형 1)**: 사람형 ritual은 내보내기 전 양발 `ToeBase-Foot` 뼈 벡터 (0.005, -1.000), 비사람형 bat은 변환 전 (-1.000, 0.000) → 변환 후 (0.000, -1.000)으로 같은 -Y가 된다. FBX를 Blender로 다시 열어도 ritual (0.005, -1.000), bat (0.000, -1.000), eyemass (-0.011, -1.000)이다.
- 몸통 변형 검사: 회전 전후 걷기 중간 프레임의 변형된 메시 전 정점이 (x,y)->(-y,x)와 일치(오차 1e-3m 미만, 아래 표 모두 0)한다.

| key | 변환 전 정면 벡터(x,y) | 변환 후 | 뼈 축 측정 | 몸통 변형 검사 오차 | 지휘 확인(수축 +X / 타격 -X, 원본 m) |
|---|---|---|---|---:|---|
| eyemass | (-1.000, 0.011) | (-0.011, -1.000) | 리포트 축 tripo::Root->tripo::Spine_0 bone heads (horizontal) | 0 | 수축 (0.049, 0.000) / 타격 (-0.033, -0.001) |
| fetal | (0.989, -0.150) | (0.150, 0.989) | 리포트 축 Waist->Head bone heads (horizontal) | 0 | 수축 (0.260, 0.010) / 타격 (-0.151, 0.026) |
| womb | (-0.591, -0.806) | (0.806, -0.591) | 리포트 축 tripo::Spine_0->tripo::Head_3 bone heads (horizontal) | 0 | 수축 (0.035, -0.002) / 타격 (-0.044, 0.002) |
| spider | (0.999, -0.056) | (0.056, 0.999) | 리포트 축 tripo::Spine_0->tripo::Spine_2 bone heads (horizontal) | 0 | 수축 (0.026, -0.002) / 타격 (-0.010, 0.001) |
| worm | (-1.000, -0.015) | (0.015, -1.000) | 리포트 축 tripo::Spine_0->tripo::Head_2 bone heads (horizontal) | 0 | 수축 (0.012, 0.011) / 타격 (0.010, 0.001) |
| mother | (1.000, -0.000) | (0.000, 1.000) | 리포트 축 tripo::Head_0->tripo::Head_1 bone heads (horizontal) | 0 | 수축 (0.120, -0.008) / 타격 (-0.108, 0.000) |
| wraith | (0.978, 0.209) | (-0.209, 0.978) | 발끝-발 뼈 | 0 | 수축 (0.065, 0.010) / 타격 (-0.072, 0.017) |
| slime | (-0.316, 0.949) | (-0.949, -0.316) | 리포트 축 tripo::Root->tripo::Head_0 bone heads (horizontal) | 0 | 수축 (0.073, 0.004) / 타격 (-0.090, -0.014) |
| bat | (-1.000, -0.000) | (0.000, -1.000) | 리포트 축 tripo::Spine_0->tripo::Head_0 bone heads (horizontal) | 0 | 수축 (0.033, 0.001) / 타격 (-1.582, 0.002) |

- 뼈 축 측정은 fetal·spider·mother·wraith·slime·womb에서 방향이 모호하거나 반대로 나온다(뼈 사슬이 수직이거나 앞뒤 순서가 반대). 그래서 몸통 중심의 수축·타격 이동을 따로 쟀다: 9종 모두 축은 X이고(Y 아님), 7종은 예고에서 +X로 물러나 발동에서 -X로 나가 앞 = -X와 맞는다. spider(-0.010)와 worm(+0.010)은 이동량이 작아 부호를 읽을 수 없고, 이 둘과 모호 6종은 리포트의 `facing_world` -X를 믿은 것이다. **9종의 실제 화면 정면은 Mac 캡처로 확인해야 한다.** 도구 `unity/Tools/enemy3d/front-lunge-check.py`.

### 루트 모션 고정

규칙: 최상위 뼈(Meshy Hips / Tripo Root·BoneRoot)의 머리 위치가 클립 시작 대비 **끝에서 0.5 표시m 넘게** 이동하는 클립은 수평(월드 XY) 위치 키를 첫 프레임 값으로 고정하고 높이(Z)는 둔다. 고정 후 최상위 뼈 수평 이동 잔여는 0(검증 assert)이다.

| 종 | 클립 | 원래 이동(표시 m) | 고정 후 몸통 bbox 중심 이동 | 비고 |
|---|---|---:|---:|---|
| winged | dive_act | 2.441 | 0.264 | 리포트 root_travel 2.2 |
| bat | dive_act | 1.290 | 0.493 | 날개·몸 숙임에 따른 자세 이동(고정 불가) |

- 키가 제자리 순환인 클립(루트 속도는 메타 정보): ironclad charge_run 2.26m/s, ritual walk 0.48, duelist walk 0.56, warden walk 0.9·charge_run 3.23. 최상위 뼈 이동은 0.06m 이하라 고정할 것이 없고, 속도는 걷기 stride에만 쓴다(charge_run은 Core 돌진 이동).
- 고정하지 않은 0.25m 이상 클립(발이 땅에 있는 몸 기울임·반동이라 고정하면 발이 끌린다): bat attack_rec 0.369(루트가 원점 뒤에서 복귀, 비고정), bat death 0.415, spider death 0.309, warden combo3_act 0.356·death 0.297, giant attack2_act 0.259. 사람형 대부분의 death는 최대 0.2~0.3m 흔들린다. Mac에서 접지·미끄러짐을 본 뒤 필요하면 고정 규칙을 조정한다.

### 30행 표 (Resources/Data/enemy_rig_models.json)

공통 슬롯은 모두 같다: idle=`idle`, move=`walk`, hit=`hit`, stagger=`stagger`, death=`death`. deathTicks 45. 새 필드: `blendTicks`(기본 0), `sockets`, `extras`, `retouch`, `source`(원본 key). 기존 필드 이름·의미는 바꾸지 않았고 `EnemyRigDefinition`에 같은 이름·동작 무변경 기본값으로 선언했다.

| key | etype | 리소스 | height | chestRatio | baseRadius | stride | blendTicks |
|---|---:|---|---:|---:|---:|---:|---:|
| lesser | 0 | LesserApostle | 1.27 | 0.631 | 10 | 80 임시 | 0 |
| spine | 1 | SpineApostle | 1.35 | 0.618 | 10 | 80 임시 | 0 |
| imp | 3 | Imp | 0.78 | 0.562 | 10 | 80 임시 | 0 |
| carapace2 | 4 | CarapaceApostleV2 | 1.49 | 0.625 | 16 | 80 임시 | 2 |
| eyemass (시작) | 4 | EyeMass | 0.585 | 0.49 | 16 | 80 임시 | 0 |
| fetal | 5 | FetalDemon | 0.641 | 0.55 | 10 | 80 임시 | 0 |
| ironclad | 6 | IroncladApostle | 1.34 | 0.629 | 13 | 80 임시 | 0 |
| sage | 7 | SageApostle | 1.27 | 0.639 | 10 | 80 임시 | 0 |
| bloated | 8 | BloatedApostle | 1.2 | 0.429 | 10 | 80 임시 | 0 |
| ritual | 9 | RitualApostle | 1.27 | 0.613 | 10 | 51.2 | 0 |
| shadow | 10 | ShadowApostle | 1.35 | 0.643 | 10 | 80 임시 | 0 |
| womb | 11 | WombApostle | 0.728 | 0.55 | 11 | 80 임시 | 0 |
| berserk | 12 | BerserkApostle | 1.42 | 0.622 | 18 | 80 임시 | 0 |
| spider | 13 | SpiderApostle | 1.091 | 0.55 | 10 | 80 임시 | 0 |
| winged | 14 | WingedApostle | 1.27 | 0.643 | 10 | 80 임시 | 0 |
| worm | 15 | SplitWorm | 0.188 | 0.55 | 12 | 80 임시 | 0 |
| trapper | 16 | TrapperApostle | 1.27 | 0.57 | 10 | 80 임시 | 0 |
| mother | 17 | MotherApostle | 1.06 | 0.55 | 20 | 80 임시 | 0 |
| vampire | 18 | VampireApostle | 1.35 | 0.626 | 16 | 80 임시 | 0 |
| giant | 19 | GiantApostle | 1.84 | 0.586 | 22 | 80 임시 | 0 |
| cleaver | 20 | CleaverApostle | 1.27 | 0.591 | 10 | 80 임시 | 0 |
| duelist | 21 | DuelistApostle | 1.27 | 0.624 | 10 | 56 | 0 |
| wraith | 23 | Wraith | 1.13 | 0.55 | 10 | 80 임시 | 0 |
| zombie | 24 | FrozenZombie | 1.34 | 0.624 | 10 | 80 임시 | 0 |
| slime | 25 | SwampSlime | 0.624 | 0.55 | 10 | 80 임시 | 0 |
| hexer | 26 | HexerApostle | 1.13 | 0.61 | 10 | 80 임시 | 0 |
| bat | 27 | IcicleBat | 0.921 | 0.55 | 10 | 80 임시 | 0 |
| golem | 28 | GlacierGolem | 1.7 | 0.566 | 25 | 80 임시 | 0 |
| warden | 29 | Warden | 1.84 | 0.607 | 20 | 108 | 0 |
| twin | 47 | ShadowTwin | 1.42 | 0.641 | 12 | 80 임시 | 0 |

슬롯(주 공격 예고·발동·회복)·extras·소켓·결함·근거:

| key | tell | active | recover | extras | sockets | retouch | 근거 |
|---|---|---|---|---|---|---|---|
| lesser | attack_tele | attack_act | attack_rec | - | - | - | G2 swing tell24/act2, 반격창36 -> attack 24/2, 회복 attack_rec 36 |
| spine | attack_tele | attack_act | attack_rec | - | - | - | 탄 충전 60틱(Core 발동 표시3·복귀9) -> attack 60/6/30 |
| imp | attack_tele | attack_act | attack_rec | - | - | - | G2 없음(접촉), 일반 탄 충전 -> attack 24/3/30 |
| carapace2 | attack_tele | attack_act | attack_rec | block | - | attack_tele 끝~attack_act 첫 관절 점프 약 80도(blendTicks 2), 충격 때 주먹이 땅에 완전히 닿지 않음, 팔 도달 0.17~0.29m 부족 | G2 slam tell36/act3, 반격창45 -> attack 36/3/45, block은 슬롯 밖 |
| eyemass (시작) | attack_tele | attack_act | attack_rec | - | - | 덩어리형: 접지 뒤 한쪽 들림(경미), 팔레트 8면 고정으로 색 손실 가능; height는 폭 1.13 기준 환산값(이전 임시 1.05) | 시작 etype4도 G2(tell36/act3) -> attack 24/3/30(24틱 클립을 36틱에 늘려 표시) |
| fetal | attack_tele | attack_act | attack_rec | explode_tele, explode_act | - | 정면 방향 Mac 확인, 접지 들림 | G2 없음, 자폭 windup은 표현 상태가 아님 -> attack 24/3/30, explode는 extras |
| ironclad | shield_tele | charge_run | attack_rec | charge_hit | - | shield_tele 방패 들기가 대기와의 차이 작음(경미) | G2 charge tell24/act20 -> shield_tele 24 / charge_run 20(제자리 순환), 회복 attack_rec 40(반격창40) |
| sage | attack_tele | attack_act | attack_rec | summon_tele, summon_act, summon_rec | - | attack_tele 정점 변화가 가장 작음 | 탄 충전 -> attack 60/6/30, summon은 extras |
| bloated | attack_tele | attack_act | attack_rec | - | - | - | 탄 충전(Ranged) -> attack 60/6/30 |
| ritual | attack_tele | attack_act | attack_rec | - | WeaponSocket_R | stagger 지팡이 바닥 관통 8cm | 시전 클립 attack 60/6/30(Core 표현 상태는 탄 충전만), 지팡이 소켓 |
| shadow | attack_tele | attack_act | attack_rec | vanish, appear | - | - | 접촉 근접 -> attack 24/3/30, vanish/appear는 extras |
| womb | attack_tele | attack_act | attack_rec | summon_tele, summon_act, summon_rec | - | 덩어리형: 접지 뒤 한쪽 들림(경미), 팔레트 8면 고정으로 색 손실 가능 | attack 60/6/30, summon은 extras |
| berserk | attack_tele | attack_act | attack_rec | rage | - | - | 접촉 근접 -> attack 24/3/30, rage는 extras |
| spider | attack_tele | attack_act | attack_rec | - | - | attack_tele 앞다리 들기 작음(경미), 정면 방향 Mac 확인 | 탄(거미줄) -> attack 24/3/30(Core 충전60에 늘려 표시) |
| winged | dive_tele | dive_act | attack_rec | - | - | dive_act 루트 이동 2.44m 고정(몸통 위치 이동량 0.26m 남음) | 주 공격이 급강하 -> dive_tele 24 / dive_act 12(루트 고정) / attack_rec 30 |
| worm | attack_tele | attack_act | attack_rec | - | - | 위에서 보면 가늘다(굵기 1.2배 후보), height는 폭 1.42 기준 환산값 | 접촉 근접 -> attack 24/3/30 |
| trapper | attack_tele | attack_act | attack_rec | trap_set | - | 팔 도달 0.17~0.29m 부족 | 탄 충전 -> attack 60/6/30, trap_set은 extras |
| mother | attack_tele | attack_act | attack_rec | summon_tele, summon_act, summon_rec | - | 정면 방향 Mac 확인 | 탄 충전(Ranged) -> attack 60/6/30, summon은 extras |
| vampire | attack_tele | attack_act | attack_rec | - | - | - | 접촉 근접 -> attack 24/3/30 |
| giant | attack1_tele | attack1_act | attack1_gap | attack2_tele, attack2_act, attack_rec | - | 손 도달 부족 최대 0.21~0.27m, attack1_gap은 브리프에 없던 이음 클립 | G2 1타 tell18/act2, g2Gap 22 -> attack1_tele/act/gap, 2타·attack_rec은 extras(v1은 첫 타) |
| cleaver | attack_tele | attack_act | attack_rec | - | - | - | 접촉 근접 -> attack 24/3/30 |
| duelist | attack_tele | attack_act | attack_rec | - | WeaponSocket_R, WeaponSocket_L | - | 접촉 근접 -> attack 24/3/30, 쌍낫 소켓 2 |
| wraith | attack_tele | attack_act | attack_rec | - | - | 부유 개체: 렌더러가 bounds 최저점을 바닥에 붙여 부유 높이 미반영, 정면 방향 Mac 확인 | 접촉 근접 -> attack 24/3/30 |
| zombie | attack_tele | attack_act | attack_rec | - | - | - | 접촉 근접 -> attack 24/3/30 |
| slime | attack_tele | attack_act | attack_rec | - | - | 덩어리형: 접지 뒤 한쪽 들림(경미), 팔레트 8면 고정으로 색 손실 가능 | 탄 충전 -> attack 60/6/30 |
| hexer | attack_tele | attack_act | attack_rec | - | - | - | 탄 충전 -> attack 60/6/30 |
| bat | dive_tele | dive_act | attack_rec | - | - | dive_act 루트 이동 1.29m 고정(몸통 bbox 중심 0.49m 남음), attack_rec 루트 복귀 0.37m 비고정, 부유 높이는 렌더러가 바닥에 붙여 미반영 | 주 공격이 급강하 -> dive_tele 24 / dive_act 12(루트 고정) / attack_rec 30 |
| golem | attack_tele | attack_act | attack_rec | - | - | 손 도달 부족 최대 0.21~0.27m | 접촉 근접 -> attack 24/3/30 |
| warden | combo1_tele | combo1_act | combo_gap | combo2_tele, combo2_act, combo3_tele, combo3_act, attack_rec, charge_tele, charge_run, charge_hit | WeaponSocket_R | idle/stagger 망치 머리 바닥 관통 4~8cm, 손 도달 부족 최대 0.21~0.27m | G2 combo tell30/act3, g2Gap 10 -> combo1_tele/act/combo_gap, 2·3타·돌진·attack_rec은 extras(v1은 첫 타) |
| twin | slam_tele | slam_act | slam_rec | tp_vanish, tp_appear, clone_cast | - | tp_vanish/slam 바닥에 13~16cm 묻힘(의도), death 전이 7~8cm 관통, 팔 도달 부족 | Core 관측 상태 없음, 유일한 근접 공격 slam -> slam 24/3/40, 순간이동·분신은 extras |

판단이 들어간 곳.
- **baseRadius** = Core `EnemyTables.R[etype]`. 기존 6행도 값이 같다(1→10, 7→10, 16→10, 47→12, 4→16, 시작 4→16, 어긋남 0).
- **height·chestRatio**: 사람형 21종은 G0 4.1.2·4.1.4·4.1.6 표 값. 비사람형 9종은 리포트에 `display_height_m`이 없고 `display_size_m`(폭 또는 높이 기준)만 있어서 `raw_height_m × scale_to_display`로 환산했다(렌더러가 모델을 몸 bounds 높이 = height로 맞추므로 이것이 표시 크기와 일치): slime 0.624·eyemass 0.585·wraith 1.13·fetal 0.641·mother 1.06·spider 1.091·bat 0.921·worm 0.188·womb 0.728. chestRatio는 0.55, eyemass만 0.49(임펙트 표). **eyemass height는 이전 임시값 1.05에서 0.585로 바뀐다**(폭 1.13 기준 환산, 같은 메시) — Mac 캡처에서 크기를 확인해야 한다. worm 0.188은 폭 1.42 기준 납작한 몸이다.
- **warden(29)**: G0의 2.57은 문지기 r×1.4가 들어간 값이다. Core `Simulation.SpawnGateGuard`가 `w.r = trunc(w.r×1.4)`로 `EnemyState.Radius`에 28(=trunc(20×1.4))을 넣고, 렌더러는 `Radius/baseRadius`(28/20 = 1.4)로 루트를 다시 키운다. 그래서 표에는 보통 크기 `2.6 × 1.31/1.85 = 1.841 → 1.84`를 넣었고 문지기는 1.84×1.4 = 2.576 ≈ 2.57, 일반 필드 빙마(r 20)는 1.84가 된다(시험에서 확인).
- **stride** = (walk 클립 틱수 / 60) × `root_speed_display_m_per_s` × 100. `NativeRemodel3D.Point`가 Core px를 월드 단위로 x/100, z=-y/100으로 바꾸고(1 Core px = 0.01 월드 단위, 표시 m = 월드 단위) `NativeGame`의 `ev.distance`가 Core px이기 때문이다. 속도가 있는 3종만 계산한다: ritual 64틱 × 0.48 → 51.2, duelist 60 × 0.56 → 56, warden 72 × 0.9 → 108. 나머지 27종은 리포트에 걷기 속도가 없어 **80 임시**다(옛 6행과 같음). 정예(×1.08)·문지기(×1.4)는 모델이 Radius/baseRadius로 커지지만 stride는 그대로라 발이 그 비율만큼 끌릴 수 있다.
- **주 공격 선택**: 위 표 근거 열. G2 근접(Core `MeleeAttackRules.Target` = 0·4·6·19·29)은 그 tell/active 시간(0: 24/2, 4: 36/3, 6: 24/20, 19: 18/2, 29: 30/3)에 맞는 클립, 회복은 g2Gap이 있는 19·29는 이음 클립(attack1_gap·combo_gap), 나머지는 attack_rec(패링 반격창 CounterTicks 36/45/40/36/30에 가깝다). 원거리(Core `EnemyProjectilePolicy.Ranged` = 1·7·8·9·13·16·17·25·26)는 탄 충전 60틱 attack 3단. Core가 G2·탄 충전 상태를 안 내는 접촉 근접형은 정책 상태가 탄 충전(일반 탄 링)일 때만 attack 계열이 쓰인다. 급강하가 주 공격인 winged·bat은 dive 계열, 쌍둥이는 slam.
- 크로스페이드(blendTicks): 아래.

### 런타임 — 표현만

- `NativeEnemyRigAnimator`: `blendTicks>0`(일반 etype4 갑각 사도 = 2)이고 클립이 바뀌면 직전 클립을 마지막으로 샘플한 시각에 고정하고 새 클립과 `AnimationMixerPlayable`(입력 2)로 섞는다. 가중치 `w = min(1, (sample.Age + 1) / (blendTicks + 1))`(Age는 Core 틱, 벽시계 없음, blendTicks 2면 1/3 → 2/3 → 1)이고 w가 1이 되면 믹서와 이전 플레이어블을 연결 해제 뒤 파괴하고 출력 원본을 새 클립 하나로 되돌린다. 섞는 도중 클립이 또 바뀌면 믹서를 파괴하고 처음부터 다시 만든다. 클립 교체·Dispose에서 플레이어블 누수는 없다(Dispose는 그래프 전체 파괴). `blendTicks=0` 경로는 이전 코드와 같다(연결 하나, `SetSourcePlayable(current)`). `applyRootMotion=false`와 매 샘플 모델 루트 복원은 그대로.
- `NativeEnemyRigRenderer.Create`: 모델 크기·접지 bounds를 `SkinnedMeshRenderer`로만 잰다(스킨 메시가 하나도 없으면 이전과 같은 전체 bounds). 무기 소품(의식 지팡이가 머리 위로 솟음)이 표의 몸 height를 줄이지 않게 하는 보정이다. 화면 bounds·접점은 무기 포함 전체 bounds를 그대로 쓴다. 정면 보정은 변환에서 끝냈으므로 런타임 회전은 없다. `--enemy-render=rigpixel` 이름·의미·기본값(꺼짐) 변경 0.
- `unity/Assets/Exoduser/Editor/Enemy3DImportCheck.cs`(고정 GUID .meta): Mac 임포트 검사. 표 30행마다 `Resources.Load<GameObject>`·SkinnedMeshRenderer 수·뼈 수·에셋 경로의 AnimationClip 이름·비어 있지 않은 슬롯과 extras 이름(런타임과 같은 `|` 뒤 이름 규칙)·sockets·인스턴스화한 렌더러 bounds 높이 > 0을 확인해 `enemy3d-import.json`에 쓰고 하나라도 실패하면 passed=false·`EditorApplication.Exit(1)`. **총괄이 공용 실행기로 1회 돌린다. PC 서브에이전트는 Unity를 실행하지 않았다.**

### RETOUCH v2 5종 반영 (06:30, G0 §4.1.8)

- 보스전 총괄의 경미 RETOUCH v2(unity/main 6a61db1ea)에 맞춰 철갑 6·거미 13·갑각 4 v2·문지기 29·의식 9의 원본을 `<key>_anim_v2.glb`(+ `_anim_v2_report.json`)로 바꿨다. 쌍낫 21은 v1 그대로다. 변환기 `import-anim-v1.py`에 `V2` 집합을 두었고, `--only`는 지정 행만 다시 쓰며 다른 행과 `frontCrossCheck` 기록은 보존한다(provenance LF 고정). 5종만 다시 변환했다(Blender 1회, 각 1.5~1.9초). 클립 이름·길이·뼈 수·소켓은 v1과 같고, provenance `animVersion: "v2"`로 구분한다. FBX 합계는 99,624,088바이트다.
- 표 `retouch` 메모를 v2 결과로 바꿨다. 문지기·의식의 무기 바닥 관통은 해소됐다(+0.20·+0.14cm). 갑각 예고→발동은 프레임당 23.9°로 줄었지만 `blendTicks` 2는 그대로 둔다(1-2틱 크로스페이드, CTO 지시). 수치 필드(height·chestRatio·slot)는 바뀌지 않았다.

### 검증 (PC, 각 1회)

- `node unity/Tools/enemy3d-tests/run.cjs`(출력 폴더는 환경변수 `EXO_ENEMY3D_CHECK_OUT`로 바꿀 수 있고 기본값은 전과 같다): **1046 checks / 0 failures**. 기존 정책·상태·접점 검사는 그대로 통과했고 표 검사를 30행으로 늘렸다: 키 30개 유일·etype 집합 = 29종 + 시작 육괴, 모든 슬롯·extras 이름이 provenance 클립 목록에 있고 슬롯+extras가 클립 전체와 일치, height·chestRatio(G0 값, 비사람형은 환산값), baseRadius = Core R, 일반 etype4 blendTicks 2, warden 1.84, sockets·stride·정면 보정·루트 고정 일치, FBX meta GUID 유일, FBX 합계 150MB 미만. 영수증 `I:/EXODUSER-Storage/ulead-enemy3d-20261104/enemy3d-check/policy.log`. 옛 `pilot-provenance.json`의 6행·Walk 1클립 검사는 새 표로 대체했다.
- 참조 컴파일 `assembly-compile-check.cjs`: Player Core126/Runtime268, Editor Core126/Runtime268/Editor61, **5어셈블리 오류 0**. 영수증 `I:/EXODUSER-Storage/ulead-enemy3d-20261104/compile/result.json`.
- 총괄 PC 공용 실행기(exo-unity.ps1 batch 단발, 세이브 격리, Windows 기본 변수 보정 포함) 1회: Unity 컴파일 오류 0, `Enemy3DImportCheck.Run` **30행/실패 0**(모델 로드·SkinnedMeshRenderer 1·뼈 20~71·슬롯/extras 클립·소켓·bounds 모두 확인). 임포트 뒤 `.fbx.meta` 변경 0. 영수증 `I:/EXODUSER-Storage/ulead-enemy3d-20261104/import/enemy3d-import.json`, 로그 `I:/EXODUSER-Storage/unity-jobs/claude-ulead-mipmap/logs/7d960daf.log`(오류 로그 1 = 라이선스 토큰 경고). Player 실행·화면 판정은 Mac.

### 남은 일

- extras(summon·trap_set·tp_vanish·tp_appear·slam 계열·clone_cast·charge_*·combo2/3·rage·explode·block·vanish·appear·attack2·이음 클립)는 Core가 관측 가능한 상태(정책이 읽는 상태)를 내면 슬롯으로 연결한다. 지금 정책은 g2 상태와 탄 충전만 읽는다.
- Mac 판정 항목: ① (PC 임포트 검사 30/0 통과, Mac 임포트 재확인), ② 비사람형 9종 정면(특히 fetal·spider·mother·wraith·slime·womb·worm), ③ 표시 크기: 비사람형 환산 height(eyemass 1.05→0.585)·worm 0.188, 팔레트 8면 고정으로 인한 색 손실, ④ 무기 3종 소켓 위치(GLB 노드 값)·재질 색·지팡이 포함 크기, ⑤ 걷기 stride 임시 80(27종)과 정예·문지기 확대 시 미끄러짐, ⑥ 고정하지 않은 반동 클립의 접지, ⑦ 갑각 사도 attack_tele→attack_act 크로스페이드 2틱의 관절 점프, ⑧ 부유 개체(bat·wraith) 높이가 바닥에 붙는 문제, ⑨ 30마리 성능(FBX 합계 99.6MB·뼈 최대 71), ⑩ 34° 먼 적이 보이는 장면에서 1x·3x 판정.
