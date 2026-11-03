# Unity 누락 전투 임팩트 이식 — 2026-11-03

소유 작업본 `G:/exoduser-wt/codex-vfx-missing`, 브랜치 `claude/unity-pc-vfx-missing-20261103`, 기준 `cbdcbc2822e32bffdddf6da622ac1d071e8a9013`. 웹 원본은 읽기 전용 `G:/exoduser/game.html`과 `assets/vfx/`다. **소스 연결·독립 C# 검증 완료 / Unity 임포트·빌드·Player·M1·실게임 1x·탄막 겹침은 미검증**이다.

브리프 끝의 표준 실행 규칙이 본문의 예외보다 우선한다. 따라서 커밋·push·브랜치 전환·외부 경로 쓰기·삭제를 하지 않았다. 지정된 I: 결과 파일 대신 작업본 루트 `result.md`에 기록한다. `exo-unity.ps1`은 I:에 작업 큐·로그·슬롯·격리 세이브를 쓰므로 현재 범위에서 실제 실행하지 않았다. buildloop는 원격 브랜치를 소비하고 외부 경로도 쓰므로 실행하지 않았다. 기존 `_pc_lock.json`은 다른 작업본 `codex-impact` 소유로 관측했으며 수정하지 않았다(프로세스 생존 판정 아님).

## 원인과 표시 계약

| 항목 | 확인·변경 |
|---|---|
| 기존 drain | `KiImpactView`와 오디오만 호출. Parry/Roll/EnemyHit/EnemyCrit/BossHit/EnemyDeath/BossDeath용 신규 시각 뷰 호출 없음 |
| 실제 피격 | `ApplyEnemyDamage`의 `noImpact=true`, `BuildHurtContext.AddImpact` no-op. 기존 오디오 이벤트는 cooldown/noSound의 영향을 받아 시각 트리거로 재사용 불가 |
| `FeedbackEvent.VisualOnly` | 실제 비DOT 피해 합계가 양수일 때 표시 전용 Hit/Crit/BossHit 통지. 오디오 어댑터 호출에서 제외. 새 RNG·판정·피해·상태 쓰기 없음 |
| `Element / Angle / TargetId` | 실제 공격 `atkEl`·방향·피격자 ID를 표시로 전달. 기존 음원 이벤트는 새 뷰가 무시하여 중복 방지 |
| `visualImpact` 인자 | `ApplyEnemyDamage`의 표시 전용 선택 인자. 기검참은 `false`: 웹 `noImpact:true`와 기존 `QueueKiHit` 전용 시트만 유지 |
| 패링 `Source / SampleKey / X / Y` | 반사 결과 `ParryTag / ParryEl / ParryX / ParryY` 전달. 일반 근접은 플레이어 위치. 패링 보상·가능 입력·반사 규칙 불변 |
| 사망 통지 | TargetId·사망 방향·`druid_sink` 표시 태그 추가. 드루이드 침강은 피·파편을 생성하지 않음 |

## 이벤트별 웹 대응 수치

| 이벤트 | 읽은 웹 함수·행 | 시트·합성·수치 |
|---|---|---|
| Q 패링 | `doParry`38956~38984, `_dark02Impact`8941, `_addBoom`8946~8949, draw57523~57621 | `Dark_MediumImpact`, 4×4/16셀, 일반 알파. r80→최대240px, 시작60%, `.6+.4*sqrt(min(1,p*8))`, 72틱, alpha `1-p*.5` |
| 물리 패링 | 같은 함수 `_impactKind==='physicalProjectile'`, `_physicalImpactSheet`8927 | `Fire_ImpactFire_Sheet`, 4×4 중 첫4셀, 흰색 `_Flat=1`(밝기×원본alpha). r60→최대180px. **요청12틱이 `_addBoom`에서 최소66틱으로 늘어나는 현행 동작을 적용** |
| 그 밖의 패링 | `_TVFX2_COMBOS[2]`19151~19154, draw55221~55240 | Lightning Impact/FBF/Basic은 RETOUCH 2의 `*_el4` 시트 사용. 4×4 sc1.2/delay0/5틱; 4×3 sc1.32/delay1/7틱; 3×3 sc.6/delay0/7틱. 가산, 크기 `cell*sc*(1+p*.4)`, alpha .7·60%부터 페이드 |
| 물콩 Q | `_waterBeanIceBurst`8933~8938 및 `doParry`38958 | Ice Impact+Mist 4×4, r96→288/326.4px, 72틱. 두 번째 지연3틱/alpha×.8. Dark02 중복 없음 |
| 무지개 Q | `_rainbowImpact`8945, draw57563~57579 | Poison Medium/Dark Smoke/Light Impact/Ice Impact 4층, 72틱, r80×(2.8/3.1/3.4/3.7), 회전0/90/180/270°, alpha×(1/.85/.7/.55). 지연을 가장 가까운 정수 틱으로 샘플링 |
| 패링 공통 | `doParry`38982~38984, `doHitFlash`20314, draw55373 | 방사12개, speed3~7/size2~5/life10~16, 3개당 흰색1개. 플래시 strength .25→실제alpha+.125(누적상한.5), 틱당-.08. 흔들림14×설정, 감쇠.86/틱·.3px 미만 종료. Core 히트스톱 추가0 |
| 일반·치명·보스 피격 | `_addImpact`25777~25805, `_impactSpriteFor`19232, draw55166~55218 | `impact_el0..5_sheet`9셀 / `impact_el0..5_boss_sheet`16셀, 16틱, boss×2.5. `drawSz=cell*scale*(boss?.92:.8+p*.6)`에서 괄호는 `(boss?.92:.8)+p*.6`. alpha `(1-p)*(boss?.62:.45)`, 가산. 원소6/누락 시 basic9셀 폴백 |
| 피격 버스트 | `spawnHolyBurst`19533 / `spawnElecBurst`19476 | basic9셀×2.4틱(22틱 샘플), 일반sc.4/보스.7, alpha.45. 번개는 `boss/vfx_holy_burst`3×3/9셀×3틱, sc.1/.18, 5셀 뒤 감쇠. 역방향6~8파편과 원소별 추가입자 |
| 일반 사망 | `deathFX`25197~25223, `_deathBloodScale`25163, `_spawnLargeMonsterDeathFx`25759 | `Blood_FBF_4x4_matte`(RETOUCH 1), 4×4/16셀×4틱=64틱, `Additive=false` 일반 알파. 폭 `128*clamp(.35+max(1,r)*.075,.8,4.8)`, alpha `min(1,1.5*(1-p*.3))`. 중심 사각 플래시·팽창 테두리·피 파편. 큰 몹(r≥18) 추가16입자 |
| 보스 사망 | 위 함수와 `_drawBossDeathBloodClip`20088 | `boss/boss_death_blood_24_20261010` 원본 유지, 6×4/24셀을 기존16셀×6틱=96틱 수명에 매핑. `Blood_FBF_4x4_matte` 16셀 폴백, `Additive=false`. 추가26입자, 중심 플래시·외곽 테두리. `druid_sink` 제외 |
| Roll | `activateRoll`45813~45815 / `_finishRoll`45817~45819 / 이동45840 | 흙색 `#6e6050`, 시작요청5→실제3입자/끝4→실제2입자(`addParts`×.6 절삭), size2~6/life12~24. 이동 중 확률.6로 발밑 먼지1개(size2~4/life10~16). 시작 흔들림2. 빛·별도 잔상 추가 없음(현행 웹 roll과 비roll bladeDash 구분) |

## 풀·정렬·임포트

| 구분 | 계약 |
|---|---|
| 피격 예산 | 같은 틱 일반2개, 보스는 예외. 기본 임팩트12접점 풀, 동시에 기본 시트4개 표시. Core 이벤트는 버리지 않고 뷰에서만 예산 적용 |
| 기타 예산 | boom12접점, 전체 flipbook60개·사망시트20개 한계, 파편256개 보관/80개 표시/32px 셀당3개. 오래된 표시 객체만 반환 |
| 파편 | 웹 `poolUpdate`의 drag.9·중력 순서를 닫힌식으로 샘플링. alpha `min(1,(1-age/life)*2.1)`. 자기 System.Random 사용: Core RNG 소비0 |
| 정렬 | 신규 SpriteRenderer sortingOrder -10000: 기존 bolt24000~24002·field bullet Y+6·boss warning -9002~-8978 아래. 3D는 별도 카메라면 투영, 중심 유지, 기존 foot-lift 이중 적용 제외 |
| 재질 | `Resources/Shaders/SkillAdditive`, 기본 `_Flat=0`; 빛은 가산. 피·먼지·boom은 `_NormalBlend=1 / _DstBlend=10` 일반 프리멀티 알파. 물리패링만 Flat1. DepthTest Always8로 중심 시트의 지면 절단 방지. 벽/배우 가림은 Player 미검증 |
| 에셋 | `Resources/Art/vfx/combat/` PNG26개, 10.77MiB. 현재 웹 PNG를 그대로 복사. `.meta`는32자리 안정 GUID, Bilinear·mipmap0·압축0·원본크기보존(max8192/NPOT0) 명시. 원래 ki_slash meta는 GUID만 있어 대형 boss atlas 기본2048축소를 막기 위해 설정 보완 |
| 실패·수명 | 없는 시트는1회 경고·피격basic/보스blood 폴백. Reset/Dispose에서 표시·스프라이트·재질·예산·flash/shake 정리. 텍스처 Resources 원본은 변경하지 않음 |

## 검증·미이식

- 신규 독립 .NET 검사 **25/0**, 기존 feedback oracle **28/0**. 같은 틱 연속 피격·반사 접점·Q/물리/Lightning/물콩/무지개·보스·풀·수명·입자감속·기검참 noImpact 포함. RED에서 누락2건, 별도 기검참 중복1건을 재현 후 수정했다. 최종 로그 `tools/combat-impact-check/checks.log`, `feedback.log/json`.
- Unity 참조 DLL을 읽는 Roslyn 사전검사: Core121소스/Runtime244소스 오류0. 첫 Runtime CS0172(Vector2/Vector3 조건식) 수정 후 통과. **Unity 실행·임포트·셰이더 컴파일·Player 빌드 증거가 아니다.** 결과는 `tools/combat-impact-check/compile/` 하나에 덮어썼다.
- M1은 기존 Q 캡처 직전 feedback drain 추가, `06-parry-q`, 실제 shield-strike 창의 근접 접점 `06-parry-shield`, `05-roll-end` 촬영을 추가했다. 기존 M1 합격 판정식은 변경하지 않았다. 캡처 코드만 추가됐고 실제 PNG는 생성하지 않았다. 물리 투사체 반사 Player 캡처는 아직 없음.
- **남음:** 물/불 대형 에너지탄 전용 authored contact, `spawnOldBurst`의 WebP6개 explosion/magic 버스트, 시체·불타는 시체·고어 조각/바닥 혈흔과 사망 파생기술의 전체 연출, 입자 TYPE별 세부 부유/피 색 편차, 고FPS 웹 render-clock과 Unity60Hz의 일치, 1x 탄막 겹침의 알파.35/G+25·명도80% 기준 실측. 이 범위와 실제 원본대조는 통합 담당의 정식 실행이 필요하다.

VISUAL VERDICT: **미검증**. 이번 소스 연결을 전체 누락 연출 이식 완료·실게임 PASS로 올리지 않는다.

## 09c 회귀 조사 — 2026-11-03 후속 (미완료)

기준 `cbdcbc282` → HEAD `84657eed24dadc2a96f82eff9f7e03a3a93d16e1`의 변경만 조사했다. 기존 Player 영수증에서 09c의 `regions 4/4, naturally unlocked False; stage kills 136/168` 실패를 읽었다. 이번에는 Unity·브라우저·commit·push를 실행하지 않았다.

| 항목 | 현재 확인·변경 |
|---|---|
| 확인된 컷 오염 | 추가 `06-parry-shield`의 `HurtPlayer(500)`는 `CombatBeforeHurt`보다 먼저 회피 RNG를 1회 소비한다(회피율 0%도 동일). 실제 패링 성공 시 HP/ST/MP·무적·포이즈·악의·하프 게이지·분노·ParryCount·LastParryHp를 변경한다. 표시 전용 enqueue만으로 설명할 수 없는 실제 게임 상태 변경이다. |
| 복원 수정 | `Simulation.CaptureParryProbeState()`는 native RNG와 유효한 sBash 창에서만 사용하는 무틱 캡처 스냅샷이다. 위 상태와 Shield·State·StateTicks·DodgeCount·private RNG를 복원한다. M1은 컷 직전 스냅샷 → 실제 HurtPlayer·캡처 → `finally` 복원으로 변경했다. 피드백은 실제 컷에 사용하며, 일반 전투·보상·RNG 계산식과 09c 판정식은 변경하지 않았다. 외부 `Random01` 제공자는 되감을 수 없으므로 거부한다. |
| 새 회귀 검사 | `run.cjs --m1`은 현재 M1 파일에서 shield 컷과 09c 본문을 추출해 실제 Core·SourceMap·ch1_map으로 실행한다. 모든 public scalar 상태와 RNG를 비교하고, 캡처 예외에서도 복원되는지 검사한다. 01~09b 전체 진행·Unity 렌더링의 재현은 아니다. `--region`은 기존 region-test 본문을 동일한 독립 컴파일 경로에서 실행하기 위한 옵션이다. |
| 첫 실행 RED | 11검사/9실패. 상태·RNG 누출을 재현했다. 09c 두 실패는 검사 fixture의 `EnableFieldBosses()` 누락도 포함했으며, 이를 실제 초기화와 맞췄다. 로그 `tools/combat-impact-check/red.log`. |
| 수정 후 실행 | **11검사/2실패(9통과)**. 상태·RNG 및 예외 복원, 대조군과 09c RNG·처치·CheckT 일치는 통과했다. 그러나 컷 없는 대조군과 복원한 후보 모두 실제 09c 본문에서 `4/4, naturally unlocked False; 136/168`로 실패했다. 로그 `tools/combat-impact-check/m1.log`. |
| 미확정 원인 | 지역 정화는 `TickCount % 15`, 문 개방은 `CheckT` 30호출 주기다. 처치가 추가 `Stage.Tick()`을 예약하므로 두 위상이 달라질 수 있다. 09c의 마지막 처치 후 30틱이 두 검사 완료를 항상 보장하지 않는 경로가 남아 있다. 따라서 컷 오염을 원래 Player 실패의 **단독 원인으로 확정하지 않는다**. 전체 이전 단계의 결정적 재현 또는 실제 허용된 M1 재검증이 필요하다. |
| 중단·남은 검증 | 읽은 `origin/main:docs/0마스터플랜/AGENT_OPERATIONS_MANUAL.md` §2.3의 동일 검사 2회 실패 중단 규칙에 따라 추가 수정·테스트를 중단했다. 기존 combat-impact25/0·feedback28/0은 이전 작업의 기록이며 **이번 변경 후 재실행하지 않았다**. 기존 지역 회귀, Runtime 정적 컴파일, Player M1도 미실행이다. |

**판정: 컷 상태·RNG 복원은 독립 검사 통과, 09c 회귀 수정 전체는 미완료.** 총괄 인수 전 통합·완료로 처리하지 않는다. 다른 세션의 기존 WIP·인덱스·`game.html`은 수정하지 않았다.

## RETOUCH 1·2 — 사망 피 적갈·방패 패링 누런 전광 (2026-11-03 PC)

작업본 `G:/exoduser-wt/codex-vfx-retouch`, 브랜치 `claude/unity-pc-vfx-retouch-20261103`, 기준 HEAD `0b5441130a0fdb3bf5a2439b38b3d4e2c74ce288`. 착수 시 INDEX/WORK·미추적 변경 없음. 원격 fetch는 worktree 외부 `FETCH_HEAD` 쓰기 권한 거부로 실행되지 않아 원격 최신 여부는 미확인이다. 읽을 수 있는 `origin/main`의 운영 매뉴얼·WORK_MANUAL v4·AAA 기준·VFX 마스터 §2.2/2.5와 `regrid_arcpoi_pack.py`를 확인했다. WORK_BOARD에는 이 레인 행이 없어 이 절과 브리프를 소유 범위 기록으로 남긴다. **최신 브리프의 commit·push·Unity·브라우저·외부 쓰기·영구 삭제 금지 준수.**

### 변경 계약

경로 접두사는 `unity/Assets/Exoduser/Resources/Art/vfx/combat/`. 아래 4개 PNG와 각 `.png.meta`를 새로 추가했다. 원본 PNG/meta와 보스 승인 PNG는 수정하지 않았다. 추가 에셋+meta 총 409,046B. 초기 26개 PNG에 4개가 추가되며, 앞 절의 26개/10.77MiB는 최초 이식 당시 기록이다.

| 새 PNG | 규격·격자 | 램프·밝기 | 새 GUID |
|---|---|---|---|
| `Blood_FBF_4x4_matte.png` | 512², 4×4/16셀 | `#2a0a08` → `#6e1e16` → `#c0503a`; 보이는 원본 최고 휘도로 정규화, 정지점 0/.45/1. 최고색도 피 코어 이하, 흰 코어 추가 없음 | `83d3353b1430581fa812cdc72286eb48` |
| `Lightning_ImpactLightning_Sheet_el4.png` | 512², 4×4/16셀 | `#2e2814` → `#c8a848` → `#fff4d0`; 원본 휘도 97백분위까지 중간색, 이를 초과하는 상위 3% 안에서만 코어로 보간 | `b6a3399a05655529a165d1469839fde5` |
| `Lightning_Lightning_FBF_4x3_el4.png` | 512², 4×3/12셀, 셀128×170·나머지2px 유지 | 같은 번개 램프·상위3% 조건 | `f94978475623526588e2408f1559ec3d` |
| `Lightning_BasicImpact_el4.png` | 256², 3×3/9셀, 셀85²·나머지1px 유지 | 같은 번개 램프·상위3% 조건 | `589e0c4b982a571380e81a18f0bf5587` |

- `tools/vfx/recolor_combat_retouch.py`: 기존 도구와 같은 `L=.299R+.587G+.114B`, `np.interp`, uint8 최근접 반올림. 형상 회전·재격자화·알파 수정·그레인 없음. **알파 전 바이트 동일**. `.meta`는 원본 임포트 설정 그대로, 이름별 UUID5 새 GUID. Python3.14의 numpy/Pillow/scipy 사용; 3.13에는 numpy가 없어 3.14로 실행했다.
- `CombatImpactTimeline.cs`: 일반 사망과 보스 폴백을 matte로 변경. 두 사망 클립 모두 `Additive=false` 명시(기존에도 bool 기본값 false). 보스 승인 시트·수명·크기·프레임·판정 불변. Step0의 Lightning 3층은 새 el4 시트로 교체하고 기존 가산·시각 수치는 유지.
- `CombatImpactView.cs`: 기존 `spec.Flat?whiteAlpha:spec.Additive?add:alpha`, alpha 재질 `_NormalBlend=1`, `_DstBlend=10`, 셰이더 `Blend One [_DstBlend]`와 프리멀티 출력으로 일반 알파 합성을 확인. 재질 분기는 수정하지 않았다. 패링의 `ParryColor`만 새 팔레트로 변경하여 Flash와 공통 패링 파편에 함께 적용.

| 패링 표시 식별자(우선순위 순) | 새 색 |
|---|---|
| `Source=waterBean` | 물 코어 `#dcebf0` |
| `Source=physicalProjectile` | 물리 코어 `#efe6d2` |
| `SampleKey=red` | 화염 코어 `#ffd9a0` |
| `SampleKey=rainbow` | 단일 원소가 없는 4층 합성의 신성 코어 `#fff2d6`를 대표색으로 사용. 마젠타 제거 |
| 그 외 `Element=0..6` | 물리 `#efe6d2`, 화염 `#ffd9a0`, 빙결 `#e8f3f8`, 암흑 `#cdb2e0`, 번개 `#fff4d0`, 신성 `#fff2d6`, 대지 `#dcc8a4`(범위 밖 clamp) |

**이벤트 한계:** 현행 Core의 패링 enqueue는 `Element`를 설정하지 않아 기본 0이다. 기존 Source/SampleKey 태그가 없는 원소 투사체의 실제 원소는 이 뷰만으로 알 수 없어 뼈색으로 표시된다. Core 변경 금지에 따라 전파 코드를 확장하지 않았다. 기존 사망 중심 흰 플래시·분홍 보스 입자 등은 이번 시트 재채색 밖의 남은 RETOUCH다.

### 검사·비교판·판정

| 시트 | 색상각 범위 | 번개 중간색 초과 비율 | 원본과 같은 외부 분리 성분 합(α>0 / α>20) |
|---|---|---|---|
| 피 matte | 4.21~9.92° | 해당 없음. 평균 HSV 채도 .977→.793, 최대 .812(지정 피 램프 상한 이내) | 190 / 200 |
| Lightning Impact el4 | 44.52~47.59° | 1.584%, 원본 상위3% 밖 밝은 픽셀 0 | 12 / 46 |
| Lightning FBF el4 | 44.59~47.14° | 2.544%, 원본 상위3% 밖 밝은 픽셀 0 | 24 / 22 |
| Lightning Basic el4 | 44.52~47.59° | 2.485%, 원본 상위3% 밖 밝은 픽셀 0 | 3 / 0 |

8방향 연결 성분을 프레임마다 검사해 가장 큰 성분을 제외한 개수를 합산했다. 임계값에 따라 얇은 연결이 갈라져 α>20의 개수가 더 많을 수 있다. 원본에도 위 성분이 존재한다. **알파 보존과 외부 분리 성분 0은 이 원본에서 양립하지 않으므로, 알파 보존을 우선하고 잔점 기준을 FAIL로 공개한다.** 새 분리 성분은 0이며 원본을 조용히 정리하거나 알파를 바꾸지 않았다. 잔점 제거는 후속 브리프에서 원본 대비 알파 변경을 명시하고 진행해야 한다.

실행과 증거(모두 현재 worktree 안):

- `C:\Python314\python.exe tools\vfx\recolor_combat_retouch.py < NUL`: 재채색·색상각·알파·meta 검사 4/4 통과. 비교판 크롭을 전체 셀 3x로 보완한 뒤 `--check-only --strict`로 검사: exit1, 4개 모두 기존 분리 성분 때문에 strict FAIL. 결과 `tmp/design-review/vfx-retouch/checks.json`, `tmp/recolor-combat-retouch*.log`.
- `C:\nvm4w\nodejs\node.exe unity\Tools\combat-impact-tests\run.cjs --red`: 시트 이름 관련 기존 검사만 갱신해 **25검사/3실패** 확인. 소스 수정 후 기본 명령 1회 **25검사/0실패**. `tools/combat-impact-check/red.log`, `checks.log`. 기존 Core `EnemyAi.cs:88` CS0219 경고 2개는 별개로 남아 있다. --m1/전체 E2E·feedback suite 재실행 없음.
- 실제 `CombatImpactView.ParryColor` 본문을 추출한 독립 C# 검사 **13/0**(7원소·태그 우선순위·범위 밖), `tmp/vfx_flash_check.cjs`, `tmp/design-review/vfx-retouch/flash-check.log`. 색 분기 검사이며 Unity 화면 플래시 증거가 아니다.
- 비교판 **4개 모두 직접 열어 확인**: `tmp/design-review/vfx-retouch/Blood_FBF_4x4_matte_compare.png`, `Lightning_ImpactLightning_Sheet_el4_compare.png`, `Lightning_Lightning_FBF_4x3_el4_compare.png`, `Lightning_BasicImpact_el4_compare.png`. 원본|수정 같은 배율 1x 시트+같은 첫 프레임 3x 크롭. 피의 탁한 적갈·번개의 누런 전광 변화를 확인했으며 작은 분리 성분과 기존 번개 형상은 남아 있다.

**VISUAL VERDICT: RETOUCH 유지. 잔점 0 관문 FAIL / Unity 임포트·셰이더 컴파일·Player·실게임 1x·탄막 가독성 미검증.** 빌드·캡처·커밋·push·배포를 수행하지 않았으며 실행본 반영 완료로 보고하지 않는다. 원본·외부 파일·타 세션 변경·세이브·웹 game.html 변경 및 영구 삭제 0. 비교판과 핵심 로그는 브리프가 지정한 고정 폴더 하나에 두었다.

## U-VFX-04 — 어두운 피·방향성 핏줄기·바닥 데칼 (2026-11-03 PC)

작업본 `G:/exoduser-wt/codex-vfx-blood`, 브랜치 `claude/unity-pc-vfx-blood-20261103`, 기준 HEAD `b3cf7a682bd753d81952157ba2d5b7cd55392db4`. 착수 시 tracked·untracked·index 변경 없음. 브리프 `I:/EXODUSER-Storage/codex-runs/20261103-202313_vfx-blood/prompt.md`의 **commit·push·외부 쓰기·삭제·Unity·브라우저·유료 생성 금지**를 우선했다. 공유 Git 메타데이터에 쓰는 fetch는 실행하지 않았으므로 원격 최신 여부는 미확인이다. LANES.md에는 이 신규 레인의 개별 행이 없어 브리프를 소유 범위로 사용했다.

### 작업 기준과 구현

목표 장면은 일반·치명·보스 피격 직후의 방향성 피와 사망 후 바닥 혈흔이다. 근거는 [PBZ·도타 실측](IMPACT_REFERENCE_PBZ_DOTA2_20261103.md) §2 R6·R7, [G1](VFX_G1_TIMING_DESIGN_20261103.md) §3.1·§8, VFX 마스터 §2.2다. 공통 관례 중 어두운 무광 피·공격 방향성·지속하는 바닥 혈흔·짧은 대상 가림을 이번에 연결했다. 기존 가장 큰 차이는 밝은 matte 피와 바닥 혈흔 부재였다. 제공된 실측 문서를 읽었으며 원본 게임 클립을 이번에 다시 열어 보지는 않았다. 제작은 기존 PNG의 결정적 픽셀 변환과 기존 Unity 표시 시스템 재사용이다. 첫 실제 카메라 판정은 Mac G2/G4이며, 이 레인에서는 정적 비교판·독립 회귀까지만 확인한다.

| 변경 | 구현 계약 |
|---|---|
| 새 시트 | `Resources/Art/vfx/combat/Blood_FBF_4x4_dark.png`, 512²·4×4·16셀. matte의 휘도(.299R+.587G+.114B)를 정규화해 그림자 `#2a0f0b` → 중간 `#5a231b` → 코어 `#7a3326`로 보간. 최고 휘도는 코어 이하. 새 GUID `205327068e4052ff90ae57e7334ddd1b`, 기존 임포트 설정 유지. 원본 matte·원본 boss 시트 불변 |
| 잔점 정리 | 각 128² 셀의 8방향 연결 성분을 α>0·α>20에서 검사. 가장 큰 본체 외에 셀 면적 0.2%(32.768px) 미만인 성분만 제거. **178픽셀의 알파를 0으로 변경**, 나머지 알파 바이트 전부 동일. 두 임계값 모두 16프레임의 기준 이하 잔점 0. 0.2% 이상인 의도된 분리 혈흔은 보존하므로 모든 분리 성분 자체가 0이라는 뜻은 아니다 |
| 피격 핏줄기 | `VisualOnly` EnemyHit/EnemyCrit/BossHit에 dark 16셀을 추가. 별도 표시 RNG로 `Angle ±35°`, 가로만 1.6배. 일반 9틱(.15s)·치명/보스 18틱(.3s), 기준 크기는 `2×Size`의 .6/1.0배. **Size는 Core 이벤트의 몸 반지름이므로 키는 몸 지름으로 근사**하며 실제 리깅 모델 높이 계측값이 아니다. 3D에서는 공격 방향을 카메라에 투영해 회전하고 접점에서 바깥쪽으로 조금 이동. `_NormalBlend=1 / _DstBlend=10` 일반 알파, 가산 없음 |
| 대상 가림 제한 | 일반은 .15s에 소멸. 치명/보스는 12틱(.2s)에 알파 .35, 이후 18틱까지 감소. 이는 표시 알파 제한이며 실제 적·탄 실루엣 가독성 PASS 증거는 아니다 |
| 사망 | 일반·보스 사망 모두 dark 16셀 사용. 일반 64틱·보스 96틱 수명과 폭 공식 유지. 보스는 기존 24셀 시트를 이번 분기에서 16셀 dark로 교체했고 원본 에셋은 보존. `druid_sink`는 피격/사망 혈흔 모두 제외 |
| 바닥 혈흔 | 치명 피격·보스 피격·일반/보스 사망 시 생성. dark의 마지막 4프레임(12~15) 중 무작위 1셀·무작위 회전. RGB .9배, 일반 알파. 210틱(3.5s) 유지 + 60틱(1s) 선형 페이드, 270틱에 비표시. 시뮬레이션 틱 기준이라 일시정지 중 소모되지 않음 |
| 풀·회수 | `CombatBloodDecals`의 고정 8슬롯과 재사용 SpriteRenderer 8개. 비활성/만료 슬롯 우선, 모두 살아 있으면 생성 순서가 가장 오래된 슬롯 회수(같은 틱도 순서 유지). transient hit 예산 전에 별도 처리하여 치명 혈흔이 일반 피격 예산에 묻히지 않음. Reset은 모두 숨기고 Dispose는 표시 객체·투영·재질 정리 |

`ImpactGroundPatch.cs`를 먼저 확인했다. 해당 패치는 3D에서 실제 지형 데칼 프로젝터를 쓰지만 색/절차형 얼룩용이며 임의 프레임 텍스처 입력이 없다. 피 프레임에는 이미 있는 `NativeGroundSkillSurface.Mark/Project`를 재사용했다. 이는 같은 지형 밀착 목적의 **실제 receiver depth 투영**으로 경사·다리 판자 간격에 바닥 혈흔을 붙인다. legacy XY는 바닥 평면 스프라이트를 사용한다. 3D 투영이 준비되지 않으면 피 데칼을 숨겨 공중 카드로 대체하지 않는다. 공용 바닥 패치·공용 셰이더 파일은 수정하지 않았다. 실제 renderer/depth 결과는 Unity 금지로 미검증이다.

### 검증과 인수 조건

- `C:/Python314/python.exe tools/vfx/recolor_blood_dark.py < NUL`: 새 PNG/meta·고정 비교판 생성. 알파 예외 178픽셀 외 보존, 코어 초과 0, 기준 이하 잔점 0, 임포트 설정·새 GUID 검사 통과. `tmp/design-review/vfx-blood/checks.json`.
- `C:/nvm4w/nodejs/node.exe unity/Tools/combat-impact-tests/run.cjs --red`: **29검사/6실패**로 새 시트·핏줄기·풀 누락을 확인. 구현 후 기본 명령 1회 **60검사/0실패**, 이어 실행되는 실제 PNG 검사도 통과. 피격 종류·일반 알파·1.6배·9/18틱·.2s 알파 제한, decal 210/270틱 경계·중간 페이드·8장·9/10번째 회수·만료 재사용·Reset·이벤트 제외 조건을 검사. 로그 `tools/combat-impact-check/red.log`, `checks.log`. 기존 Core `EnemyAi.cs:88`의 CS0219 경고 2개는 그대로다.
- `C:/nvm4w/nodejs/node.exe tools/vfx-missing-compile.cjs`: 기존 Unity 참조 DLL을 **읽기만 하는 Roslyn 사전검사**. Core121소스·Runtime249소스 오류0, 로그 `tools/combat-impact-check/compile/`. Unity 실행·임포트·셰이더 컴파일·Player 증거가 아니다.
- `git diff --check` 통과. Core·game.html·원본 matte PNG/meta 변경 0. git stage/commit/push·외부 파일 쓰기·영구 삭제·유료 호출·Unity/브라우저 실행 0.
- 비교판 `tmp/design-review/vfx-blood/matte_dark_compare_3x.png`를 직접 열어 확인. 이전 matte | 새 dark 전체 시트 1x와 프레임 0/13의 동일 영역 3x를 배치했다. dark의 낮은 밝기·무광 적갈색을 확인했다. 이는 게임 캡처가 아니다.

변경 파일은 `CombatImpactTimeline.cs`, `CombatImpactView.cs`, `unity/Tools/combat-impact-tests/Program.cs`, `run.cjs`, `tools/vfx/recolor_blood_dark.py`, 새 dark PNG/meta, 이 문서의 8개다. `tmp/design-review/vfx-blood/`에는 비교판·픽셀 검사 결과만 둔다. CHANGELOG_SYNC 인수용 초안: “U-VFX-04: 무광 dark 피 시트·피격 방향성 핏줄기·8장 풀의 3.5s+1s 지형 혈흔 연결, 회귀60/0·Roslyn 오류0; 실제 화면 미검증.” 공용 CHANGELOG는 총괄 커밋 시 반영한다.

**판정: 소스·독립 회귀 통과 / RETOUCH_GAME_QA_PENDING.** 남은 것은 Mac Unity 임포트·실제 원근 카메라에서 핏줄기 방향/크기(몸 지름 근사 대 실제 키)·지형 접지·8장 교체·3.5s+1s·0.2s 이후 적/탄 가독성의 1x 검수다. 1920×1080·3840×1080, 10초 무음 영상과 3x 크롭으로 판정한다. 실행본 반영·통합·실게임 품질 완료로 처리하지 않는다.


## U-VFX-05 — 기검참 접점·얇은 초승달·명중 흔들림 (2026-11-03 PC 후속)

기준 HEAD d37fb2a0ddd1a17c98ddb6454e26f980aae612b2, 브랜치 claude/unity-pc-vfx-ki-20261103, 작업본 G:/exoduser-wt/codex-vfx-ki. 후속 브리프 I:/EXODUSER-Storage/codex-runs/20261103-205915_vfx-ki-2/prompt.md에 따라 1차 미커밋 변경을 이어서 직접 수정했다. **stage·commit·push·fetch·Unity·브라우저·유료 API·외부 쓰기·영구 삭제 없음.** 시작 HEAD는 로컬 origin/unity/main보다 2커밋 뒤였고, 마감 status에서는 공유 원격 추적 ref가 갱신되어 13커밋 뒤로 표시됐다. 브랜치 전환·병합은 하지 않았으며 원격 최신 여부와 해당 추가 커밋 통합 결과는 미확인이다. LANES에 개별 소유 행이 없어 두 브리프를 소유 범위로 사용했다. 프로세스 조회는 접근 거부여서 생존·잠금 상태를 확정하지 않는다.

### 목표와 실제 경로

목표는 기존 04-attack의 오래 남는 두꺼운 회백 초승달을 줄이고, 실제 KiSlashHit에 5틱 코어·방향성 선 스파크·작은 명중 반동을 넣는 것이다. G1 §3·§8 및 PBZ·도타2 실측 R1·R4·R5를 기준으로 기존 원화·가산 재질을 재사용한다. 이번에 원본 게임 클립·04-attack Player 캡처를 다시 열지는 않았다. 원본 초승달 PNG는 직접 열어 오른쪽 앞날을 확인했다. 실제 카메라 판정은 Mac G2/G4에 남긴다.

- 일반 게임은 NativeGame.Awake → KiSlashView, Art/vfx/ki_slash_silver_sheet를 사용한다. NativeSkillRemaster.Enabled=false여서 이 경로가 기본이다.
- Vfx/KiSlashVfxView.cs(RM1 Graph)는 생성자 호출이 없고 미연결 NativeGame.VfxCheck.cs의 인자로만 등장한다. 현재 일반 게임에 사용되지 않아 수정하지 않았다. 향후 활성화 시 같은 표시 규칙 이식이 필요하다.
- Core 기검참은 ShakeAmount를 만들지 않는다. 기존 큰 반동은 HP 감소 관찰기 NativeImpactView → ImpactResponse에서 발생한다(일반 .022world=2.2px, heavy .045world=4.5px). 평면은 projection, 원근은 NativeGame.Impact.cs → ImpactCameraOffset → Remodel3DLate에서 적용된다. 이 부분 클래스의 카메라 누적부도 이번 수정 범위에 포함했다. 공용 ImpactResponse·NativeImpactView·CombatImpactView/Timeline은 수정하지 않았다.

### 파일별 최종 표시 계약

| 파일 | 변경 |
|---|---|
| Runtime/KiImpactView.cs | 1차 코어 유지: 5틱(첫 틱 차오름·뒤 4틱 감소), 키×.35 / 3타 키×.6×충전배율. 색 #fff4d0→#ffd9a0, SkillAdditive 가산. 명중 시트 원본·크기·수명 유지, 0번 셀 시작·1번 셀 +3틱 도달. 명중 잉크 상한 .35. 접점 보정 등록과 Reset/Dispose 회수 유지 |
| 같은 파일 스파크 | 최종 길이 = clamp(height*(.08+.07*(index%8)/7), height*.05, height*.15). 기존 결정적 분산을 유지하며 **최종 키 단위에서 clamp, 충전배율은 길이에 적용하지 않음**. 1·2타12개, 3타 기본24개×충전배율 반올림(티어0/1/2/3: 24/34/43/53개). 1차의 20~30개는 충전 전 기본 개수로 두고 후속의 개수 배율 지시를 적용했다. 공격 방향 ±60°, 12~18틱, 길이 고정·알파만 감소, 카메라 환산 두께1.5px 유지 |
| Runtime/KiSlashView.cs | 실제 원화의 진행 방향 폭 .45배, 높이 유지, 앞날 쪽으로 이동. 잉크·잔상·몸통은 각각 알파 .35 이하·3틱에0. 앞날은 나이0~5틱 진하게, 6틱 .35 → 7틱 .2333 → 8틱 .1167 → 9틱0(비표시). 표시 나이를 MaxLife-Life로 읽기만 한다. Core 판정·속도·수명·위치·트레일 불변. 최종 형상은 실제 1x 검수 필요 |
| Runtime/NativeGame.cs | 1차 생성부의 SkinnedMeshRenderer 캐시·bounds 키 계측·HudCamera 전달 유지. 명중/관찰 틱으로 기검참이 만든 공용 관찰 반동을 식별해 대체한다. 뒤의 비기검참 관찰 접점은 공용 반동을 다시 사용한다. 전용 기검참 반동을 평면 카메라에 연결, 시작/재시작에서 식별 상태 초기화 |
| Runtime/NativeGame.Impact.cs | 같은 반동 대체를 원근 marker와 평면 projection에 연결. 기검참 유발 반동: 1·2타0, 3타2px/최대충전3px, .86/틱 감쇠. OptionShakeScale 최종1회·ReducedMotion이면0. 기존 Core 피격·패링·구르기 반동 별도 유지 |
| unity/Tools/combat-impact-tests/KiPresentationTests.cs / run-ki.cjs | 실제 KiImpactPresentation을 추출해 Roslyn 실행. 키4종·96인덱스·충전별 개수·길이·수명·부채·코어·시트·흔들림·옵션 검사. 길이 허용오차1e-4. 실제 표시/카메라 연결 소스 검사·원본 PNG 셀 휘도 계측 추가. Unity 렌더링 검사 아님 |

### 원인과 검증

1차 413검사/20실패의 직접 원인은 인덱스7/15/23에서 **160*(.08+.07*7/7)=24.000000000000004 > 160*.15=24**가 된 엄격 비교다. 당시 길이 식에는 충전배율이 없었다. 최종 clamp와 허용오차1e-4를 적용했다. 새 검사의 첫 실행은 기존 SparkCount 인자 차이로 Reflection 예외가 났고, 이를 검사 실패로 기록하도록 하네스를 고친 뒤 RED를 확인했다. 구현 수정 후 GREEN이며 같은 방법으로 두 번 수정 실패하지 않았다.

아래 명령의 Node는 C:/nvm4w/nodejs/node.exe이며 모든 산출물은 이 worktree 내부다.

| 실행·증거 | 결과 |
|---|---|
| unity/Tools/combat-impact-tests/run-ki.cjs --red | 정책2311검사/36실패, 연결6검사/6실패로 충전 개수·짧은 앞날·카메라 연결 누락 확인. tools/combat-impact-check/ki/red.log |
| 같은 명령, --red 제외 | **2722검사/0실패**, 연결·시트 **7검사/0실패**. tools/combat-impact-check/ki/checks.log |
| tools/vfx-missing-compile.cjs | **Core121소스·Runtime250소스 Roslyn 오류0**. 기존 Unity 참조 DLL은 읽기만 하고 현재 worktree 전체 Core/Runtime 소스를 컴파일. tools/combat-impact-check/compile/Exoduser.Core.log 및 Exoduser.Runtime.log. Unity 실행·임포트·셰이더·Player 검증 아님 |
| unity/Tools/combat-impact-tests/run.cjs | **60검사/0실패**, 기존 dark 피 PNG 검사 통과. tools/combat-impact-check/checks.log |
| 같은 도구 --feedback | **28검사/0실패**. tools/combat-impact-check/feedback.log. 위 두 회귀에서 기존 EnemyAi.cs:88의 미사용 gb/water 경고 CS0219는 남음 |
| 원본 명중 PNG 계측 | RGB8·1254²·2×2. 셀 총휘도: 0번5,347,752 / **1번12,257,303** / 2번6,517,537 / 3번2,516,441. 실제 최대 정점은1번이며 +3틱에 표시됨. 원본 텍셀 peak255는 Player 코어240+ 증거가 아님. tools/combat-impact-check/ki/sheet-measurements.json. PIL 미설치로 Python 계측 실패 후, 설치 없이 Node zlib로 PNG 필터를 해독해 계측 |
| 범위·형식 | git diff --check 통과. Core·CombatImpactView.cs·CombatImpactTimeline.cs·RM1 Graph·웹·원본 에셋 변경0. 생성물은 기존 고정 tools/combat-impact-check에 작은 DLL·로그로 덮어씀. 대형 빌드·캡처·백업 없음. G: 여유 약93.5GiB, 영구 삭제 금지에 따라 정리하지 않음 |

### 남은 인수 조건

**판정: 소스·Roslyn·관련 회귀 통과 / RETOUCH_GAME_QA_PENDING.** Unity 임포트·셰이더·Player·실게임 판정·실행본 반영은 수행하지 않았다. Mac의 1920×1080·3840×1080, 1x/3x·10초 무음 영상으로 .45배 앞날 형상·9틱 소멸·접점 코어240+·실제 키/포즈 변동·1.5px 스파크·120°·적/탄 가독성을 확인해야 한다. 공용 관찰 반동 분류는 같은 관찰 배치의 기검참 피드백 기준이므로 **동일 배치에 기검참과 다른 공격이 겹치는 경우**도 확인해야 한다. 독립 정책/연결 검사가 화면 검수를 대신하지 않는다.

변경 파일은 위 Runtime4개·검사2개·이 문서의 **7개**이며 미커밋으로 인계한다. CHANGELOG_SYNC 인수용 초안: “U-VFX-05: 스파크 최종 키 길이 clamp·충전 개수, 실제 KiSlashView .45배 앞날/6틱 진한 구간/9틱 소멸, 1·2타0·3타2/최대충전3의 평면·원근 반동 연결; 기검참2722/0·연결7/0·임팩트60/0·피드백28/0·Core/Runtime Roslyn 오류0, 실게임 검수 대기.” 공용 CHANGELOG는 총괄 인수 커밋 시 반영한다.

END
