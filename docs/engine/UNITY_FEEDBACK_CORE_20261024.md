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

명중 잉크는 19375행 `floor((_gameFrame-f0)/3)`으로 4프레임이다. additive는 `playVFXAng`(19328행) 생성 시 `bornGameTime`이 없으므로 54583행 fallback인 `v.t+=_dtSp; if(v.t>=frameTime){v.t=0;v.frame++}`를 사용한다. 이 경로는 남은 시간 버림 및 한 render에서 한 프레임 진행 규칙이다. 고정 60Hz TickCount에 대응하는 이벤트 수명 정보만 전달하며, 가변 render cadence/고FPS 시계 전체 동치로 보고하지 않는다.

## 검증과 남은 범위

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
