# HD-2D 2단계 — 판정·바닥·조준 정렬

현재는 소스 적용/원격 복구 checkpoint 준비 단계다. 1단계 Desktop M1과 이2단계 새Runtime 검수는 구분한다.

## 입력·진행 경계

|항목|현재값|
|---|---|
|직전 공통/자기|b673cb3f7a534c367e03c285404342e3769a8bfc / cd16abbdbe6e902b2ee5c6c83c067df0faacbc66, 전체tree789b4d6c3f54bc226ffdd7511e2ac03448f8920f/Unitydc195627806caa74375bd1991f5b312d1a539b0f|
|1단계 전달|공통반영·일반Desktop링크 fd6dcea809516aa8cbde886231a29827cfad65231db18dabf547e5f5085d16d6, 대상8dbdf검수빌드. 설치경로M1b8e40eba23/23·창SAVE잔여0·E전후1334.80GiB. 클릭/OSfocus/자연플레이 미검증|
|적용범위|기존21코드+신규C#4/Shader1+meta5=31. 7Core·14기존Runtime·신규Runtime3·Editor1·Shader1·meta5. 원본21은I 정확보존 후beforeSHA전수확인/afterSHA31확인. INDEX기존WIP와분리|
|현재 H5|origin/main108980fb5fafc7bebe2c16ae6f0d420e80d6a36f, game.html SHA6cb7f9e5a32c53cc4de4e5444527457a24a1e4915d7d55f1261b25c6d7e6458b. 207→108의update시작~intro렌더시작 1,887,648문자 동일(update/draw/RAF 포함). 변경은진입원화/설정동작. 기존13Core검사유효|
|웹 실제관측|3c39c948에서모든요청Gitblob/HTML검증·pageerror0/4040·초기INTRO·G.onfalse 관측. 창1로안전FAIL, 실제전투/피격프레임증거아님. 종료/프로필제거·잔여SAVE0는별도기록. 재시도무한반복0|
|미인수|단계3post/fog/water·신규리마스터·MapR6·미READY UI/Impact 후보0. R5순수맵1a3 유지. 보호2_3문서/ParryRules수치변경0|

## 화면 역할 계약

|역할/식별자|변경과 수치|
|---|---|
|Actor|영웅·적·보스만기존SpriteLit/발선/접지한개. Surface/Center로전환시원래local pose·재질을복구하고Actor/중복그림자등록해제. 새소유가원재질을바꾼경우강제덮기0|
|Surface/NativeHd2DSurface.Bind|원본rect/PPU/pivot/flip/tint/rotation/scale/MaterialPropertyBlock을사용한XZ지형격자. Bind는그프레임에명시한source만. geometrycache는Terrain/revision/pose/size/pivot/flip/epsilon으로갱신,Sprite변경은UV만갱신가능|
|격자|world축길이/.20m 올림,축별2..16구간,원래pivot행/열을추가(차이.00001),6index/quad. 각정점은GroundY+epsilon. epsilon=min(.003m,.15출력px/max(상방1m의출력px,1));변화1e-6초과시재생성|
|범위/소유|camera frustum plane은그camera/frame당1회. sprite반지름=원본extent.magnitude×lossyScale.magnitude+1m,Bounds변길이2r. offscreen은source표시만숨겨원프록시없음. 다음Restore/Release는기존forceRenderingOff와원래source상태복구|
|재질|mode0일반/mode1SkillAdditive/mode2KiSlashAdditive/mode3KiSlashInk, DstBlend원값(기본add1/normal10),ink의SrcAlphaBlend5/그외1. 원본_Color/_Flat/_NormalBlend/프로퍼티블록/정렬레이어·순서보존. 프록시shadowCasting/receiveShadows off|
|누락Shader|Resources/Shaders/HD2DGround 누락/unsupported면원forceRenderingOff복구·proxyoff·false반환/DisposeAll전경고한번. 정상Sprite를통째숨기거나pink프록시를만들지않음|
|Center|일반탄·악의구등중심역할은발높이lift추가0,실제카메라rotation/up사용. 기존legacy NativeEnemyFootprint 경로유지|
|Grounded line|원형링72점,각점GroundY+.003m,활성HD3D에서world좌표. 그외기존localXY. 범위radiusPx/100 유지|
|Aim/NativeHd2DAim|장식Collider/고정Y평면대신동일GroundY와ray교점. 하향y<-.001·maxDistance>0만; reference±4m,실제Terrain기준하한-2/상한sizeY+2 확장. step.08m/최대2048번·부호교차후12번이분. 실패시현재PlayerXY 반환. legacy고정평면유지|
|촬영입력|Playtest기본1600×900,추가-capture-width/-capture-height로1920/3840×1080만허용. 실제해상도10초대기+6프레임안정화/field40초. aim목표300px는실제화면정수중심. HD에서목표지점고유GroundY유지/legacy만PlayerY고정. LMB/E검사는해상도1항목추가로8checks|
|피격fixture|1920·3840×1080 × physical-hit/magic-hit/physical-miss ×25=150PNG. 이동입력0/AIoff/SpawnHolesnull/idle/iframe0·실제BossProjectile직접추가. Sz2/R4/Dmg1/Life240/속도10/시작거리160,miss측면=(PlayerRadius+3×Sz+4)+1. 원본map열린축26점검사. 실제StepInput/UpdateViews/끝프레임촬영. 초기HP/장비·무작위생성·자연전투동등성검사아님|
|Editor 검수|ShieldArcGroundRole96조건(2해상도×3쉴드×8각×2반경),SurfaceAndAim8조건(2해상도×2투영×2pitch34/48.7014),각25역변환. meshheight≤.0031m/pivot≤.151px/aim≤.02px,외부forceOff보존/원Actor재질복구. Shader실제Resource/오류메시지 검사. 실패시RT·자기카메라/sprite정리. 아직실행전|

# 단계2 런타임 문서 반영 초안

상태: Desktop1 M1 b8e40eba 통과 뒤 정확31경로를 제품소스에 적용했다. 실제 Editor·Shader·새Player·공통/Desktop2는 미검수다. 문서 반영은 docs/engine/UNITY_HD2D_RUNTIME_20261031.md와 관련 Unity 패링·피격 문서를 함께 갱신하고 같은 커밋에 포함한다. 보호 문서 2_3은 수정하지 않는다. 전체 관련 키워드 검색은 phase2-docs-keyword-search.txt에 보존했다. Godot 이식의 과거 미지원 표를 Unity 완료로 바꾸지 않는다.

| 식별자/위치 | 원본 계약 및 후보 동작 | 경계·숫자 | 검증 |
|---|---|---|---|
| IBossProjectileSweepHost/ProjectilePlayerDistance | 현재·직전 플레이어와 탄 이전·현재 위치의 최소거리. 원본 endpoint broad phase를 먼저 적용 | endpoint scan max(400, Q유효scan), 이동선분 길이제곱>1일 때 segment 검사 | 기존 sweep 입력 및 지뢰 moving192 |
| ReflectInput | 현재 플레이어 상태·자원 입력을 한 번 만든다. IoActive는 실제 IceOrbActive | 기존 ParryRules 수치·Q/E 분류 변경0 | actual IO48, 기존 규칙48708 |
| OrdinaryContactRadius | C=PlayerRadius+3×ProjectileSize. 기존 ComputeGate를 그대로 사용 | Eactive=(3C+12)×SkillRangeMul, SbPWDet=3C+12, AnyPW=3C+8, 기본 C+4; 기존 QPulseR>0 우선; WhirlDet 상태90 | normal684/6379 |
| 일반 접촉 guard | Q 창/기존 무적·IO·literal charge 상태를 원문 순서로 처리 | 일반 radius/body 교정은 !Remodel만. 새 charge skill 없음 | Mine2400, 기존 RM 보호 |
| HurtOptions.Projectile | 일반 근접 E 피격 구조를 투사체에 잘못 적용하지 않도록 출처를 명시 | 기존 default 옵션·근접/ORB 경로 유지 | playerhurt3000/47559 및 actual26 |
| HurtOptions.HasKnockback/KnockX/Y | 일반 탄의 원본 명시 벡터를 전달한다 | velocity 정규화×2; 속도0이면 플레이어-탄 방향×2; 둘 다0이면 (0,2). default false일 때 기존 피해비례 KB 유지 | normal684/6379 |
| Q 중심 Absorb | 원본 중심은 피해·반사·보상 없이 탄만 소비 | 기존 Zone/Resolve 판단 사용, 20 경계 포함 | contact432 및 moving192 |
| physical mouth/RedBean Q 오류 | 원본 raw 피해·redBean/DruidPoison 옵션을 전달, 오류 후속은 hurtP 성공 여부와 별개 | Q hold/SbParryT>0/원본 100 미만·무적0·IO0. RedBean 오류 iframe3+추가KB6, burn total=raw×2 | contact432/14040 |
| 일반 RedBean 몸통 | 실제 ElementMul 후 요청 피해를 burn pool로 기록한다 | RedBean && !DruidPoison일 때만 burn append. HP 감소량으로 대체0 | normal684 |
| RedBeanBurns | 별도 화상 스택·원문 idle 시계 | max10/no-refresh,total 요청피해×2,t600,tick0; 매30 tick max(1,Int(total/20)); t<=0 먼저 제거. 실제 idle 600 시계의 19회 pulse | burn480/6948 |
| RainbowPoisons | 일반 poison과 별개의 무지개 중독 pool | max10/no-refresh,total 폭발요청×2,t600,tick0,30tick·divisor20·만료우선 | rainbow15552/377784, clock480/6948 |
| 두 pool의 갱신 위치 | 전역 roll trigger 뒤, 새 Q/E 진입 전 idle에서 poison→burn 순서 | roll·block·공격 중 시계 정지. 새로운 timer 상시 갱신 금지 | entry4 및 두 clock |
| BlackBean Consumed | Q 전용 magic 규칙을 그대로 사용한 뒤 실제 소비 후속을 연결 | !Remodel만. 일반 무적이면 피해·중독·AOE 없이 소멸 | rainbow1728 |
| BlackBean 폭발 | max(Int(Mhp×.15×(1-DR)),Int(raw×.7×(1-DR)))를 기존 magic hurtP에 전달 | 별도 ElementMul 선곱0. DR=기존 ParryRainbowDamageReduction. src 문자열의 KB fallback 보존 | rainbow1728/17604; passive0/3/5 |
| BlackBean 추가 후속 | hurtP 뒤 중독→추가 poise→KB→AOE | JS (poise||4)-2 보존; 집중 시1, 그 외 pStun=기존 StunFrames/iframe60. 추가KB7/iframe>=15 | rainbow1728/15552 |
| BlackBean AOE | 반경120 포함인 살아있는 적에 기존 ApplyEnemyDamage 호출 | max(120,Int(raw×2)), poiseHit=false, blueBean=false, 원래 p.El. 전용 적 피해 규칙 복제0 | 실제36/10800, 원본84호출→실제 HP/Shield84변화 |
| 무적 whirlwind 구성상태 | 원본 base 흡수. 현재 실제 WhirlDet 입력은 미지원 false 유지 | base .20, 피해 Int(raw×.3×.8×(1-DR)), 기존 hurtP 무적 guard 유지, Bank Int(raw×.3×.2)+KB2. 신규 skill 생성0 | 정적 원문 대조, 실제 WhirlDet 완료 주장0 |
| 지뢰 초기 몸통 | 거리30 미만·무적0·charge 아님에서 원본 초기 폭발 처리 | ElementMul 적용/실제 DruidPoison/src 문자열, 추가KB10. IO 중에도 후속 KB·소멸은 원문대로이고 내부 hurtP만 거절 | Mine2400/21480 |
| 지뢰 외부 Q·회수 | 초기 폭발하지 않은 일반 지뢰를 공통 Q 루프로 보낸다 | 반사 friendly/blue mine는 다음 tick 즉시 회수. Remodel/reflectHost 없는 옛 oracle 경로는 기존 continue | Mine2400, RM Mine168 |
| 지뢰 cached input | 상태 입력1회 재사용하되 공통 pd 계산 뒤 PDist를 pd로 갱신 | 이전10→현재60의 중심 무보상 흡수, 반대 방향 초기 몸통 폭발 우선 | moving192/996, RED24→GREEN0 |
| RetryInsideArena | 자기 두 pool 초기화 | RedBeanBurns.Clear + RainbowPoisons.Clear | 실제 Player 재시작 검수 전 |

최종 동일 CPU 입력은 phase2-core-final-mine-sweep/input-manifest.json의114개다. 13개 프로젝트는 자기 Program+이 입력만 컴파일하며 Program/project/manifest/specs SHA를 영수증에 기록한다. 이전 결과를 새 후보에 소급하지 않는다.

최종 13종 결과: druid 48/54400/5421635, actual parry26, special48708, playerhurt3000/47559, contact432/14040, burn480/6948, entry4, IO48, normal684/6379, rainbow1728/17604, rainbow passive/cap15552/377784, poison clock480/6948, Mine2400/21480 모두 실패0. API Core/Runtime/Editor도 phase2-api-pure-985-mine-sweep에서0이다. 실제 Editor·shader·M1·Player·웹/Unity 접촉 PNG·최신공통/Desktop 증거는 아직 없다.

무효 검사도 보존한다: normal exporter c.iframes 누락, rainbow PASSIVES.pParry 누락에 따른 NaN, 초기 Mine dst 미추출 및 expected 파일 생성 전 조기 실행은 현재 수치 증거로 사용하지 않는다. 각 diagnostic/INVALID 파일을 유지한다.

남은 범위: 실제 물리/마법 탄의 외형·지형 높이 접촉 프레임, friendly blast enemy poison consumer, 물/다크/Bw/Titan/energy 원래 생성 flag 전달과 미지원 skill, source camera cull/FEEL 표현 전체, 실제 game 플레이. 이 CPU 범위를 2단계 전체 완료나 시각 PASS로 부르지 않는다.


## 바닥 셰이더 실패 폴백
Resources/Shaders/HD2DGround 누락 또는 isSupported=false면 원래 SpriteRenderer의 forceRenderingOff 값을 복구하고 프록시만 끈 뒤 false를 반환한다. 경고는 DisposeAll 전 한 번만 기록하고, 정상 셰이더일 때 기존 blend/alpha/원본tint/UV 경로를 유지한다. 새흐름은 제품소스후보에 반영됐으며 실제 Editor/Player 실패주입 검수 전이다. Core13suite 입력은 변경0.


## 최신 적용 후보와 검수 fixture 정리
현재 준비 입력은 phase2-api-r5-only이며 정확한31경로(코드·Shader26 + 신규meta5)의 before/after SHA는 PHASE2_APPLY_PLAN_R5_STAGE1.json을 따른다. 오래된 phase2-candidate/manifest.json의 폐기 초안은 직접 제품으로 복사하지 않는다. 최신 Core114는 위13suite와 동일, Runtime199/Editor56 API0에 더해 누락Shader 폴백Runtime 재컴파일0·fixture 리소스정리Editor 재컴파일0이다. SurfaceAndAim·ShieldArcGroundRole은 실패해도 자기 RT를 해제/파괴하고 자기 Sprite/카메라 오브젝트를 정리한다. 이는 C# API·정리 경로 준비이며 실제 Editor 검수나 Shader/GPU 증거가 아니다.

일반 Druid.Remodel=false 경로의 교정과 NativeRemodel3D.Active 맵 표시를 혼동하지 않는다. 3D 맵 옵션을 사용해도 일반 Core 접촉 경로를 쓸 수 있으며, 별도 보스 리모델 flag/RM5의 보호 수치와 궤적은 변경하지 않는다.


## 정확한 적용 파일

|구분|경로|신규|
|---|---|---|
|core|`unity/Assets/Exoduser/Runtime/Core/DruidBoss.Hazards.cs`|기존|
|core|`unity/Assets/Exoduser/Runtime/Core/DruidBoss.Reflect.cs`|기존|
|core|`unity/Assets/Exoduser/Runtime/Core/Simulation.DruidBoss.cs`|기존|
|core|`unity/Assets/Exoduser/Runtime/Core/Simulation.ParryReflect.cs`|기존|
|core|`unity/Assets/Exoduser/Runtime/Core/Simulation.PlayerCombat.cs`|기존|
|core|`unity/Assets/Exoduser/Runtime/Core/Simulation.PlayerHurt.cs`|기존|
|core|`unity/Assets/Exoduser/Runtime/Core/Simulation.cs`|기존|
|runtime|`unity/Assets/Exoduser/Runtime/KiImpactView.cs`|기존|
|runtime|`unity/Assets/Exoduser/Runtime/KiSlashView.cs`|기존|
|runtime|`unity/Assets/Exoduser/Runtime/NativeBoltView.cs`|기존|
|runtime|`unity/Assets/Exoduser/Runtime/NativeBossView.cs`|기존|
|runtime|`unity/Assets/Exoduser/Runtime/NativeDruidBody.cs`|기존|
|runtime|`unity/Assets/Exoduser/Runtime/NativeGame.PlaytestCapture.cs`|기존|
|runtime|`unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs`|기존|
|runtime|`unity/Assets/Exoduser/Runtime/NativeGame.StageFlow.cs`|기존|
|runtime|`unity/Assets/Exoduser/Runtime/NativeGame.cs`|기존|
|runtime|`unity/Assets/Exoduser/Runtime/NativeSkillView.Malice.cs`|기존|
|runtime|`unity/Assets/Exoduser/Runtime/NativeSkillView.cs`|기존|
|runtime|`unity/Assets/Exoduser/Runtime/Vfx/VfxWorld.cs`|기존|
|runtime|`unity/Assets/Exoduser/Runtime/NativeGame.Hd2dCapture.cs`|기존|
|runtime|`unity/Assets/Exoduser/Runtime/NativeHd2D.cs`|기존|
|runtime|`unity/Assets/Exoduser/Runtime/NativeHd2DSurface.cs`|신규|
|runtime|`unity/Assets/Exoduser/Runtime/NativeHd2DAim.cs`|신규|
|runtime|`unity/Assets/Exoduser/Runtime/NativeGame.Hd2dHitCapture.cs`|신규|
|editor|`unity/Assets/Exoduser/Editor/Hd2dAlignmentVerification.cs`|신규|
|shader|`unity/Assets/Exoduser/Resources/Shaders/HD2DGround.shader`|신규|
|meta|`unity/Assets/Exoduser/Runtime/NativeHd2DSurface.cs.meta`|신규|
|meta|`unity/Assets/Exoduser/Runtime/NativeHd2DAim.cs.meta`|신규|
|meta|`unity/Assets/Exoduser/Runtime/NativeGame.Hd2dHitCapture.cs.meta`|신규|
|meta|`unity/Assets/Exoduser/Editor/Hd2dAlignmentVerification.cs.meta`|신규|
|meta|`unity/Assets/Exoduser/Resources/Shaders/HD2DGround.shader.meta`|신규|

신규meta5의GUID·모든before/after SHA·원본보존은 I:/EXODUSER-Storage/demo-art/hd2d-main/20261031/PHASE2_APPLY_PLAN_R5_STAGE1.json, phase2-apply-original/verified-inputs.json, phase2-apply-status.json. 관련docs전체검색은phase2-docs-after-code-keyword-search.txt. 실제Editor·Shader·새build/M1·1920/3840·H5피격나란히검수·MERGE_QUEUE/common/Desktop2가남았다. 기존단계1영수증을새Runtime로소급하지않는다.
