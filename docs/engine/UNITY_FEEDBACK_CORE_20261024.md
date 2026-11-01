# Unity 기검참 피드백 코어 — 2026-10-24

사용자 지시는 Godot 보존과 Unity 비교 시험이다. 최종 엔진은 미확정이다. 이 단위 `UNITY-FEEDBACK-01`은 원본 기검참의 발사·충전 경계 샘플과 명중광 이벤트를 순수 C# 코어에서 전달한다. Godot·웹·세이브·Q/E·보호 설계와 전투 수치는 수정하지 않았다. 뷰·오디오 재생·GPU 결과는 부모 통합 단위이며, 여기의 독립 .NET 검사로 실행·시각·청각 품질을 주장하지 않는다.

## 원본과 이벤트 계약

원본은 `godot/source_snapshot/game.html`, SHA256 `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209`다. 오프라인 Node VM에서 아래 원본 함수 10개를 직접 추출·실행했다. 현재 `G:/exoduser/game.html`에서도 각 함수 원문 10/10이 snapshot과 같음을 확인했다. 전체 웹 파일 동일성·전체 게임 RNG 동치는 아니다.

| 원본 행 | 함수/동작 | C# 이벤트 |
|---|---|---|
|12358–12369|`playSample`의 `rate*(.92+random*.16)`|`QueuedRate`에 최종 큐 pitch 저장|
|12463|`_r(1,.06)` → `1+(random-.5)*2*.06`|발사 `Rate`; 바로 다음 RNG를 위 큐 pitch가 소비|
|16789|`_playKiSlashComboSfx`|`sword_swing1/2/3`, vol `.85`|
|16790–16812|`spawnCrescent`, 풀 `16`|풀 포화여도 그 앞의 sample 이벤트·난수 2회는 유지|
|16814,16817|홀드 `floor(max(0,f)/40)`, cap `3`, 배율 `2^tier`|기존 수치 유지|
|16818–16831|`_fireKiSlashCrescent`|sample을 projectile allocation 전에 enqueue|
|16840–16858|`_updateKiSlashThirdCharge`|경계를 넘을 때만 sample, release 때 3타 sample|
|19380–19386|`_playKiSlashHit`|적 위치·검기각·크기·4프레임/3틱·잉크 cap 전달|
|19823–19850|`updateCrescents`|벽→살아있는 적→strict radius→identity once→LOS→hurtE→명중광 순서|

| 이벤트 | 조건 | 값 |
|---|---|---|
|`Sample` cast|1/2/3타 발사|key `sword_swing1/2/3`, vol `.85`, caller `Rate=_r(1,.06)`, `QueuedRate=Rate*(.92+r*.16)`|
|`Sample` charge|40f/80f tier 상승|key `scarecrow_charge`, vol `.35`, Rate `1`, 추가 jitter 난수 1회|
|`Sample` full charge|120f tier 상승|key `sword_parry`, vol `.72`, Rate `1.08`, 추가 jitter 난수 1회|
|`KiChargeFlash`|위 120f sample 직후|key `ki_slash_hit_2`, Scale `.26`, FrameCount `4`, FrameTicks `2`, 현재 위치·현재 조준각|
|`KiSlashHit`|허용된 적에 `ApplyEnemyDamage` 처리 직후, 처치도 포함|key `ki_slash_hit_0`, Size `140`(1/2타) 또는 `184*ChargeScale`(3타), FrameCount `4`, FrameTicks `3`, 검기각과 처리 후 적 위치, Ink `true`, InkCapacity `8`|

`Simulation.Feedback`는 `Queue<FeedbackEvent>`다. 뷰는 Tick 후 drain하여 한 이벤트를 재소비하지 않는다. `Rate`는 caller pitch, `QueuedRate`는 원본 큐에 들어간 pitch이며 adapter에서 다시 난수화하지 않는다. cast sample은 공유 `NextRandom` 2회, charge sample은 1회, hit VFX는 0회 소비한다. 시뮬레이션은 원본 전체 RNG 스트림을 이식한 상태가 아니며, 이 작은 경로의 소비 순서를 고정했다. 원본 priority queue의 unshift 순서·믹스·재생 제한은 뷰/오디오 소유 범위다.

잉크 최대 8개는 이벤트 큐를 잘라내는 규칙이 아니다. 뷰의 살아있는 잉크 목록에서 초과 시 가장 오래된 것을 제거한다. 공용 additive 풀 20개도 별도 뷰 계약이다. 현재 코어는 기존 시트가 준비된 경로의 이벤트를 전달하며, 이미지 누락 fallback/GX 감쇠/음성 remap/전체 일반 SFX 30ms debounce를 새로 구현하지 않았다. 정상 60Hz의 40f 경계 간격에서는 해당 일반 SFX debounce에 걸리지 않는다.

## 히트스톱과 clock 경계

원본 `updateCrescents`는 1/2타 `G.hitStop>=3`, 3타 `>=6`과 `shake(8)`을 요청한다. 그러나 실제 소비부 **32585행에서 `G.hitStop=0`으로 매번 초기화**한 뒤 `_hsActive`를 결정하여 히트스톱은 비활성이다. 이 작업은 임의의 scheduler freeze를 추가하지 않았다. 별도의 카메라 shake는 이 코어 이벤트 계약에 포함하지 않았다.

2026-10-31 임팩트 브리프의 50~100ms 요구는 별도 표현 후보 `ImpactResponse`가 일반55/치명프로필75/강공90ms의 뷰 정지로 다룬다. 이 문서의 Core·웹 scheduler 계약은 그대로다. r1 정식 Player/M1·12초 전후 Core SHA 동일을 확인했으며, r2는 현재5스킬·탄막·XY 아레나 표현을 별도 재검수한다. 치명 프로필은 실제 이벤트 미연결이며 상세 수치는 [RM-1 구현 기록](../5.1임펙트디자인/UNITY_RM1_VFX_IMPLEMENTATION_20261028.md)을 따른다.

r1의 기술 게이트와 별개로, 1x 연속 접점 프레임에서 코어·방향 파편이 식별되지 않아 **r1 접점 Graph 가시성은 FAIL**이다. r2 MCP에서 같은 Core tick7/피해208 상태로 정렬0→표적 Y+4만 바꿔 몸체 가림을 재현하고 수정했다. XY 바닥의 알파0 반사도2150픽셀→비활성 대비0픽셀로 수정 확인했다. 접점/잔여의 정렬은 Y+4/Y-4, 화면 가장자리 여유±0.1·near/far를 사용하고 화면 밖 관찰은 새 반동/정지를 만들지 않는다. 모두 표시 경로이며 Core scheduler 계약은 그대로다.

r2 source `597c3b9b8d6300a6554abd9543ac08a78bed58bf`의 정식 Win64 빌드 `c1bbb4b4`·동일 EXE M1 `e60e23d8` 23/23 ok·3D/XY 전후16초를 완료했다. 네 Core SHA `ce48d649960a79064929e94ab5f3a204cbfd59da1ecb1125ccf77dd6d3445f0e`·피해55777 동일, 사용자창/잔류/세이브변경0이다. 그러나 3D 접점은 가리고 새 적탄이 작은 점무리로 축소되어 해당 시각 범위 FAIL이다. r3는 접점 본체를85ms 카메라 면 Shader Graph로 분리·GPU Graph를 파편/먼지에 사용하고, 지형 밀착 표면과 기존 웹 탄막 외곽식을 복원하는 후보다. 충돌R·피해·입력·Core scheduler는 변경하지 않는다. r3 공식 빌드/M1/영상·최종 품질은 별도 미검증이며 입자 생성 수로 PASS를 대신하지 않는다.

명중 잉크는 19375행 `floor((_gameFrame-f0)/3)`으로 4프레임이다. additive는 `playVFXAng`(19328행) 생성 시 `bornGameTime`이 없으므로 54583행 fallback인 `v.t+=_dtSp; if(v.t>=frameTime){v.t=0;v.frame++}`를 사용한다. 이 경로는 남은 시간 버림 및 한 render에서 한 프레임 진행 규칙이다. 고정 60Hz TickCount에 대응하는 이벤트 수명 정보만 전달하며, 가변 render cadence/고FPS 시계 전체 동치로 보고하지 않는다.

2026-10-31 r3의 최신 공통 인수 기준은 `19c6ccec8f7056acdc554b45de72d43a78c12ec6`다. 승인된 일시정지·UI 음원 변경을 전용 후보에 정상 병합했으며 공통 대비 자체 Core 변경은 0이다. 새 입력의 피드백26/0·기검참93/0·스킬13,216/0과 독립 Runtime292소스 C#오류0(경고438)을 `I:/EXODUSER-Storage/demo-art/impact/oracle-common19c/` 및 `runtime-compile-common19c/`에 별도 보존했다. 첫 r3 공식 시작의 CS0246 두 건은33자리 메타 GUID 때문에 새 소스가 무시된 것으로 확인해32자리로 최소 수정했다. 메타20개 형식/중복 검사는 GREEN이지만 실제 Unity 임포트·새 빌드M1·영상은 아직 미검증이다.

## 검증과 남은 범위

2026-10-31 r4 공통 결합: 수락 공통 `b673cb3f7a534c367e03c285404342e3769a8bfc`의 R5맵/HD2D1을 정상 병합한다. 공유 런타임3충돌은 HD2D 원본자세복원·접지등록과타격pose hold를함께유지하고, marker반동을Cinemachine ManualUpdate 전에적용해최종카메라뒤픽셀스냅순서를보존했다. 공통 `Map.ProjectileBlocked` 콜백·영웅모션/자산은그대로다. Core tree424bcafff는동일·자체Core변경0, 결합Runtime317소스 독립C#오류0/경고473·표현계약456통과다. cffe41b1의MCP는새EdgeMix실제셰이더/세재질오류0·XY정지진단만확인했으며, 결합후Player/M1/전체아트는미검증이다. 첫진단의구형카메라ID컴파일실패와RT회수·Play종료·원본복원도보존했다. CPU충돌해결전에own예약을반환했고새GPU단위는큐끝재접수한다. 상세수치/참조정정은 [RM-1 구현 기록](../5.1임펙트디자인/UNITY_RM1_VFX_IMPLEMENTATION_20261028.md)의 b673 결합표를따른다.

2026-10-31 추가: source `6cda46abeb2f4e2ad63fa6ad1d7ed496da13d34a`의 r3 공식6000.6.7f1 빌드 `2f4ebedc` 오류0·동일 M1 `72363307` 23/23 ok·3D/XY 전후와21:9/32:9 각16초480PNG를 완료했다. 여섯 Core SHA `dc9493fefc26ba10139a71abf26c17a5e9c01d593f12bc7d4969083e5a095861`·피해84083 동일·안전검사통과다. 3D 접점 본체 가림은 개선됐지만 적탄의 밝은 반복무늬가 만화풍으로 보여 **해당재질FAIL**, 통합제출하지 않았다. r4는 거친 알베도 명암과 물질별 `_EdgeMix`로 바꾸는 표현 재작업이며 Core 변경0이다. 상세 HLSL 수식·kind별0.025/0.04/0.06/0.25/0.55/0.12 값은 [RM-1 구현 기록](../5.1임펙트디자인/UNITY_RM1_VFX_IMPLEMENTATION_20261028.md)의 r4표를 따른다. r4 독립Runtime292소스 C#오류0/경고438·표현계약456통과와 실제 Unity/GPU미검증을 구분한다. 이전 대기/실패 기록은 이력으로 보존하며 새 입력의 같은 빌드M1·영상·공통/Desktop 인수까지 완료로 올리지 않는다.

| 검사 | 결과 | 영수증 |
|---|---|---|
|실제 source 함수 오프라인 실행|10함수, cast3·charge4시점·release·hit2·kill/벽/LOS, 현재 G 원문10/10 동일|`unity/Tools/feedback-oracle/oracle.json`|
|첫 의미 있는 RED|코어 queue API 부재, 빌드 성공 후 1/1 실패|`I:/EXODUSER-Storage/qa/unity-port-20261024/feedback-runs/feedback-red-01.json` 및 `.log`|
|source 대조 강화 중 실패|26중 2실패. oracle의 고정 performance.now가 80f에도 30ms debounce를 걸었음. 60Hz clock와 시나리오 reset으로 oracle 수정; 생산 코드 변경 없음|동일 폴더 `feedback-green-02.json` 및 `.log`|
|최종 독립 Core GREEN|26/26, cast caller/queued 양층 pitch·pool포화·40/80/120once·120release순서·kill후hit·중복/벽/LOS방지·공유RNG순서|동일 폴더 `feedback-green-03.json` 및 `.log`|
|기존 기검참 회귀|93/93|동일 폴더 `ki-regression/ki-green.json`|
|기존 포이즈 회귀|7/7|동일 폴더 `poise-regression/poise-green.json`|
|기존 기본무기/맵 회귀|36/36 및 원본 맵 oracle2523표본|동일 폴더 `core-regression/core-receipt.json`|
|실제 Editor·Windows Player·음성·화면|이 단위 미검수|상위 `UNITY_PORT_20261024.md`의 부모 통합 결과에서 구분|

도구 시작 과정의 잘못된 Junction 기본 root와 acorn dependency 지정 오류 로그도 남겨두었다. 경로/환경 실패를 기능 RED로 세지 않았다. 출력·dotnet bin/obj·oracle/tests는 기존 Tools Junction을 통해 I:에만 생성했다. 전체 게임 믹서/EQ/compressor·모든 샘플·보스·아이템/affix·field mobs·전체 scheduler와 청각/시각 패리티는 이 단위의 완료 범위가 아니다.


## 2026-10-31 r4 첫 정식 빌드와 넉백 영상 근거 정정

source65ead/Unity tree93d5f054/Core tree424bcafff의 첫 정식 빌드 `9de2257e`는 C# compileErrors0/errorLogs0/USER_SAVE0이나 셰이더 준비 중600초 제한(실제603281ms)으로 실패했다. 마지막577s에583/1536변형 준비를 기록했다. 미완성 출력과 원래 JSON/log를 byte·SHA로 보존하고 입력3959 변경0을 확인했으며, 슬롯 반환 후 같은 입력·TimeoutSec1800의 단일 재시도를 큐끝에 접수했다. 새 빌드/M1/영상·통합/Desktop 완료 근거는 아직 없다.

r3 전후 Core trace 일치는 입력 불변 근거로 유지하지만, 그 fixture는 `EnemyAiEnabled=false`로 적 넉백 이동 루프도 중지했다. 실제21표적/7구간 이동0px이므로 기존 영상의 넉백 이동 범위는 미검증이다. 일반·Ki·강타 이동>1px 검사 FAIL/exit2를 보존했다. 격리 Core 예행에서 기존 AI루프+매tick 명시적 fixture Stunned180으로 자발 AI를 중지하자 일반99.61/Ki205.93/강타53.14px 이동과 현행5시전·Ki3타 Tier3명중·처치·악의구폭발을 확인했다. 이는 지형/GPU/자연플레이 증거가 아니며 Core 수식 변경0이다. 영상용 최소 보완은 아직 미적용으로 남긴다. 실제 최종 영상의 이동 게이트와 스프라이트 추종까지 확인한 뒤 판정하며 상세 근거는 [RM-1 구현 기록](../5.1임펙트디자인/UNITY_RM1_VFX_IMPLEMENTATION_20261028.md)의 최신 절을 따른다.


## r4 동일소스 재시도 후 실제 영상 판정

같은 source65ead/Unity tree93d5f054의 재시도 `f9e9faf3`는6000.6.7f1/remodel-scenes1 빌드오류0·실제Player MCP파일/관리참조0을확인했다. 동일EXE M1 `c70b8dd3` 23/23 ok·정상종료/창/잔류/USER_SAVE0, 3D16초480PNG `48ca3efb` 안전0과Core SHA dc9493fe…/피해84083/현행5종Graph를확인했다. 새노레위참조와나란히16초실제재생및1x연속프레임을직접보았으나 교량회복바닥/가시접지/강타의점선원형테두리로시각FAIL이다. 이결과는이전첫600초실패를지우지않으며 기술통과를디자인PASS로올리지않는다. 바닥alpha0.016·지형샘플격자·기존Decal투영과넉백검수fixture의원인분리를MCP에서진행할예정이고, 현재Core수식·원본규칙변경0/MQ READY0/Desktop미갱신이다. 상세는RM-1최신절과I: `r4-영상-판정.json`을따른다.


## 2026-11-01 r5 접지·투영·넉백 재작업 — 소스 후보/실제 GPU 미검증

r4 빌드·M1 기술 PASS와 회복 바닥/가시 접지/강타 점선 테두리 VISUAL FAIL을 보존한다. 아래는 r5 소스 후보이며 MQ READY0·Desktop 미갱신이다.

| 범위 | 확인 원인·변경·수치 | 검증 경계 |
|---|---|---|
| 가시 18개 | 기존 중앙 높이 사용으로 실제 collar 최대오차0.5548178m·바닥 최대뜸0.435781717m. 3D 각 조각 world XZ의 기존 GroundY+0.015m에 뿌리를 배치. 아래 tip은 매립. XY localY0.04m·폭0.22·높이0.28/0.46/0.64·전개/페이드·Core 반경 유지 | 같은 실제 Core 시전30틱의 런타임 진단18개는 RED0.5548178→GREEN0.015m. 첫 쿨다운 재시전의 조각0 결과는 무효로 보존, 900틱 경과 후 1영역/18개를 확인한 표본만 사용. 실제 수정 소스의 Unity 재컴파일/동작은 아직 미검증 |
| 3D 지면 | 12×12 높이격자가 널빤지/지형 단절을 잇거나 관통. ImpactGroundPatch를 기존 M_SkillGround/URP DecalProjector로 변경: 지름2radius·깊이2m·pivot0·X90도·drawDistance60m·fadeFactor1·전용 clone 재질. XY는 기존 quad/MPB 경로 유지 | 같은 프레임 .016/.04/.06/.08 데칼은 다리 수신 정상·흙 수신0. 공통b673의 A2RootSurface DBuffer 수신 누락을 확인, 맵 소유자의 별도 표준수신 기술 변경이 필수 의존성. 미인수 맵/셰이더 복사0·이 의존성의 정식 인수 전 전체 바닥 PASS/통합 제출 금지 |
| 바닥 마스크 | SG_SkillGround만 hard rim 제거. r=length((UV-.5)*Size)/max(Radius,.001), inside=1-smoothstep(.72,1,r), grain은 기존3항 사인, Color=lerp(FillColor,EdgeColor,.12*grain), Emission0, Alpha=saturate(inside*(.6+.4*grain)*Progress). 기존 ID/속성/GUID 유지·생성기 동기화 | SkillGround108객체·참조누락0·재질GUID 일치. XY SkillFloor/ContactFlash 그래프 불변. CPU 구조는 실제 시각 판정 아님 |
| 회복·그을음 | 회복 fade최대3D0.06/XY0.016, 웹색 #b6ff54/#d5ff72·15틱 전개/마지막30틱 소멸·수증기크기0.9/alpha0.012·코어/파편0 유지. 가시fade0.2/강타0.28/얼음0.08 유지. 그을음도 같은3D투사 경로, 색 #1b1410·반경0.28/0.5m·fade0.6·2초·동시8 유지 | 같은프레임 알파 비교는 선택을 위한 진단이다. 새 마스크/수신을 포함한16초 Player 재판정 전 |
| 실제 넉백 fixture | r3/r4 AIoff가 Core 넉백 이동루프도 건너뛰어21표적 이동0/검사exit2. 명시적 fixture만 AI루프 활성+매tick Stunned180 갱신으로 자발행동 억제. receipt normalKnockback/kiKnockback/slamKnockback에 시작점 대비 최대이동을 기록하고 각각>1px 요구 | 기존 Core 예행 일반99.61/Ki205.93/강타53.14px 이동 근거 유지. 새 실제 영상의 전후 Core trace 일치와 스프라이트 추종은 아직 미검증. 자연플레이 아님·Core 소스/수식 변경0 |
| MCP 정상 마감 | boot e73821a4/Editor42796·자기A2/RX9070XT/D3D11·격리/무음. Play정지·dirty0·probe0·공식stop/잠금없음·예약반환. QA용 EditorBuildSettings 원래 byte/SHA 동일. 파생763개 보존/기존706 정확복구/신규57 GUID참조0 정리 | import-derived/editor-r5-floor 영수증. 그 뒤 소유 코드만 수정. Unity 자동파생을 제작 변경으로 stage하지 않음 |
| 기존 CPU 검증 | r5 Runtime317소스·Unity참조125 C#오류0/기존경고473, 표현계약456 통과 | 이미 통과한 동일 검사를 반복하지 않음. Unity 임포트·M1·새 영상·공통/Desktop 검증을 대신하지 않음 |

진단 원문: I:/EXODUSER-Storage/demo-art/impact/MCP-r5-가시-유효대조-결과.json, MCP-r5-회복-同프레임-결과.json, mcp-r3-captures/MCP-r5-*.png. 수정 전 원본은 before-ground-r5/와 before-knockback-r5/에 보존했다. 사용자 도타 보호 조건에 따라 dota2가 어느 PID로든 살아 있으면 새 Unity/Player/빌드/인코딩/무거운 검수를 시작하지 않는다. 가벼운 소스·문서·안전 체크포인트만 진행하며, 재개 전 실제 프로세스 부재와 기존 FIFO/메모리/무음·세이브 조건을 확인한다.


### 2026-11-01 r5 맵 표준 데칼 수신 소스 인수 — 실제 검수 전

맵 담당 d19847702111b7d5b2cf77059c198f1f9d78aae6에서 전달한 공통 b673 기준 receiver-only 패치만 r5 작업 브랜치에 인수했다. R8 전체 브랜치·재질·배치 반입0, 공통 unity/main/Desktop 채택0이다.

| 확인 | 결과 |
|---|---|
| 입력 경계 | 인수 전 r5 HEAD3a78311e9/INDEX0·외부 guard WORK1. HellGroundPBR/A2RootSurface 원문은 공통b673 byte와 동일·맵 영수증 base SHA 일치. 패치SHA256 720a0e1fc8f22354b556cb45a58ec8ba659bca2c9bb30a76ca35909211059fed·git apply --check 무충돌 |
| 인수 범위 | 기존 두 Opaque UniversalForward 셰이더에 _DBUFFER_MRT1/2/3 변종·DBuffer.hlsl include·최종 표면 계산 뒤 guarded ApplyDecalToSurfaceData/법선 반영 SampleSH 추가. 두 수신 추가를 제거하면 원래 byte와 완전 일치. 재질 GUID/속성·geometry·shadow/depth·Core·기존 r5 VFX 불변 |
| 후보 SHA256 | HellGroundPBR 93896381f9dc33efaa0bf1a02c7942f170402192e272a977c4e82c02f077a218, A2RootSurface e49e7350cd96de8385feb53e6aa5aaac0d43f17c99aebecbd1104c85fca9c6ec. 분리 문서 UNITY_A2_DECAL_RECEIVER_20261101.md는 맵 원문9e09c8ce42758cf88910253b62af4ce5ebff5932804153e2b0ec399232123c5b과 일치 |
| 설치 계약 | 자기 설치 URP com.unity.render-pipelines.universal@ffe395a3a1d1의 Lit.shader/LitForwardPass.hlsl/DBuffer.hlsl 원문에서 변종·인수 SurfaceData/InputData·수신→GI→PBR 순서를 대조. 이 소스 대조는 Shader 컴파일 통과가 아님 |
| 현재 미완료 | 이전의 '맵 수신 코드 준비 대기'는 이 소스 후보 인수로 해소했다. 실제 Unity import/변종0오류·동일프레임 지면/뿌리/목교 off/on·무데칼 회귀·r5 접지/회복/넉백1x·새빌드/M1/16초 전후·초광폭·최종 판정은 모두 미완료. r4 VISUAL FAIL/MQ READY0 유지 |
| 사용자 보호 | 실제 dota2 PID4892 생존을 인수 전에 재확인. 새 Unity/MCP Editor/Player/빌드/대기자/인코딩/무거운 검사0·passed CPU검사 반복0. 소스/문서/원격 복구점만 진행 |

원본·인수 영수증: I:/EXODUSER-Storage/demo-art/impact/decal-receiver-intake-r5/. 별도 맵 수신 계약은 [UNITY_A2_DECAL_RECEIVER_20261101.md](../engine/UNITY_A2_DECAL_RECEIVER_20261101.md)를 따른다. 소스 인수와 실제 표시 성공을 구분하며, 도타 부재와 기존 실행 안전조건 확인 전에는 검수 실행을 재개하지 않는다.
