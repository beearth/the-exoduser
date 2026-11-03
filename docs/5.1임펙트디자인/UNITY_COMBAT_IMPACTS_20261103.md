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

## 근접 패링 스파크(G2) — 2026-11-03 PC

실행본 반영 없음. 작업본 `G:/exoduser-wt/codex-vfx-spark`, 브랜치 `claude/unity-pc-vfx-spark-20261103`, 기준 HEAD `17490149b1301bc7f01055be4e684eb9040905c8`.
관문: 소스 회귀·Roslyn 통과 / **RETOUCH_GAME_QA_PENDING**, 추가 M1 독립 회귀의 09c는 FAIL.
다음: 총괄이 09c·디스크 여유를 확인하고 Mac에서 같은 장면 A/B·1x/3x·탄막 가독성을 판정한다.

### 작업 범위와 계약

브리프 `I:/EXODUSER-Storage/codex-runs/20261103-203816_vfx-spark/prompt.md` 및 끝의 표준 실행 규칙을 우선했다. 착수 시 tracked·untracked·index 변경 없음, 브랜치·기준 SHA 일치. LANES.md에 spark 개별 행은 없어 브리프를 소유 범위로 삼았다. fetch는 외부 Git 메타데이터에 쓰므로 하지 않았으며 원격 최신 여부는 미확인이다. commit·push·stage·영구 삭제·다른 worktree 쓰기·Core/웹 변경·유료 호출·Unity/브라우저 실행을 하지 않았다. PowerShell 시작의 CreateProcessW os error5 이후 문서에 허용된 CMD/Node 경로로 진행했다.

목표 장면은 1-1 원근 LOCK의 근접 Q/완벽 패링과 Step0 막기다. 시간 정본은 `PARRY_REDESIGN_G1_20261103.md` §3, 모양·색 근거는 [PBZ·도타 실측](IMPACT_REFERENCE_PBZ_DOTA2_20261103.md) R2·R4·R5다. 두 문서를 읽었으며 원본 게임 영상은 이 실행에서 다시 열지 않았다. 공통 관례 중 접점 방사선·접촉 뒤 정점·짧은 제한 섬광·일시 푸시인을 연결했다. 기존 가장 큰 차이는 점 파편12개와 표시 흔들림14였다. 제작법은 기존 가산 셰이더+코드로 만든 선 텍스처+표시 전용 틱 정책이며 이미지 생성은 쓰지 않았다. 첫 실물 판정은 Mac G2/G4다. 1x/3x 점0·적 예고/탄 가독성·같은 장면 A/B·카메라 원상복귀가 인수 조건이며 PC 컴파일만으로 시각 PASS를 주지 않는다.

| 항목 | 구현 |
|---|---|
| 근접 식별 | `FeedbackKind.Parry`, 비어 있는 SampleKey, Source가 없음 또는 contact/swing/slam/charge/combo/melee 접두사. 비어 있지 않은 반사 SampleKey나 알 수 없는 Source는 근접에서 제외. Core 이벤트는 읽기만 함 |
| 스파크 | Step1 80~130개, Step0 30~60개. 표시 RNG로 접촉 틱에 약30%(정수 반올림), +1~3틱 나머지 방출, 개수·밝기 +3틱 정점. 접촉 기준18~30틱 수명. 약70%는 `Angle+π` 중심180° 부채, 나머지는 전방위. 화면 아래로 약한 중력 |
| 선·색·크기 | `#f5e5d5`~`#f0debd`, 가산. 키의 .10~.25배에서 감쇠하되 .05배 이상 유지. 900px 높이 기준1~2px, 수명 말기에도1px 이상. 끝 알파 페이드와 수명 중 두께·밝기 감쇠. 키는 표시 중인 영웅 SpriteRenderer의 투영 bounds 높이, 없으면900px 기준96px 폴백. 실제 리깅 실루엣 높이와의 일치는 Mac에서 확인 필요 |
| 예전 파편·시트 | 근접의 점 파편과 dark/lightning boom을 선으로 교체. 탄 반사의 기존 시트·12개 파편·GUI 섬광은 유지하고 근접 스파크를 추가하지 않음. 완전한 점0은 실제1x/3x 검수 전 미확인 |
| 근접 화면 섬광 | Step1만 `#fff4d0`. 0→1틱 상승, 1→6틱 감쇠, 6틱에0. 중첩해서 더하지 않음. Gamma 알파 상한 .15(최대채널 변화38.25), Linear 상한 .02(검정 위 sRGB 변환 약38.7)를 사용. 평균 휘도≤40을 보수적으로 제한하는 정책이며 실제 HDR/톤매핑/후처리 화면 측정은 미실행 |
| 위험 정렬 | 근접 섬광은 GUI 대신 화면을 덮는 world SpriteRenderer, renderQueue2999·ZTestAlways. 기존 transparent(queue3000) 적 예고·탄보다 먼저 그림. 근접 스파크도 기존 Combat sortingOrder를 사용. 실제 렌더 파이프라인 정렬은 Mac 검수 필요 |
| 카메라 A/B | `--unity-parry-camera=shake` 기본: 근접6/탄4. `--unity-parry-camera=pushin`: 흔들림2, 8틱 동안 화각/orthographicSize를2.5% 좁히고20틱 복귀. 28틱 이후 정확히 배율1. 원근 카메라는 기존 `NativeRemodelCamera.FieldOfView`에서 매번 계산하여 누적 변경 없음. 피치34°·기본거리·follow offset 불변. ReducedMotion이면 푸시인·표시 흔들림·섬광 없음 |
| M1 06 비교 | 첫 실제 Q 패링 이벤트를 재사용. Tick을 진행하지 않고 접촉+4틱으로 표시 age만 맞춰 `06-parry-q-shake.png` / `06-parry-q-pushin.png` 추가. 별도 동일 seed 표시 객체, 기존 효과 enabled 플래그·Core probe 상태/RNG·pending feedback·카메라 pose/lens/projection·marker·Unity RNG를 finally에서 복원. 보상을 다시 지급하지 않음. headless 컷은 실제 HudCamera를 RenderTexture로 렌더. 기존06 판정식 불변 |

카메라 선택 인자는 `NativeReviewArgs.IsReviewArgument`에 등록하여 지역 제목이 QA 인자로 오인되어 꺼지지 않게 했다. 기존 피·데칼·다른 전투 표현의 계약은 유지했다. 새 사용자 표시 문자열은 없다.

### 검증·남은 문제

- `C:/nvm4w/nodejs/node.exe unity/Tools/combat-impact-tests/run.cjs --red`: 새 정책 누락으로 **61검사/1실패** 확인. 구현 후 기본 명령1회 **430검사/0실패**, 기존 피 PNG 검사도 통과. 스파크40개 seed/Step 조합의 개수·30%/70%·정점·수명·최소선길이, 섬광 상승/소멸·상한·이벤트 제외, 옵션 기본값·8+20틱 복귀 및4개 기준 카메라 값의 정확한 원상복귀를 검사했다. `tools/combat-impact-check/red.log`, `checks.log`.
- `C:/nvm4w/nodejs/node.exe tools/vfx-missing-compile.cjs`: **Core121·Runtime249소스, Roslyn 오류0**. 기존 Unity 참조 DLL은 읽기만 함. `tools/combat-impact-check/compile/`. Unity 임포트·셰이더 컴파일 증거는 아니다. Core `EnemyAi.cs:88`의 기존 CS0219 경고2개는 남음.
- 추가 `run.cjs --m1`1회: **11검사/2실패**. 기존 shield probe의 상태/RNG 복원 검사는 통과했지만 기존09c 대조 경로 양쪽에서 `naturally unlocked False`, `stage kills 136/168`로 실패했다. `tools/combat-impact-check/m1.log`. 09c·Core는 이번 수정 대상이 아니므로 고치거나 무수정 재실행하지 않았다. 새 카메라 coroutine은 Roslyn 컴파일만 확인했고 이 독립 검사는 실제 캡처를 실행하지 않는다.
- `git diff --check` 통과. G: 여유가 약97.8GiB로 확인되어 운영 매뉴얼의100GB 기준 아래임을 보고하고 추가 실행을 중단했다. 브리프의 영구 삭제 금지를 따라 정리는 하지 않았다. 큰 빌드·캡처·복사본은 생성하지 않았으며 로그/독립 검사 출력은 worktree 내 고정 경로만 사용했다.
- **아직 없는 증거:** 실제 M1 A/B PNG, Mac Player, 1x·3x 점0, 투영된 실제 키/접점/방향, HDR 후처리 뒤 평균 밝기≤40, 적 예고·탄 정렬, 카메라28틱 복귀의 실제 Player 값, 1920×1080·3840×1080 및10초 무음 영상. 실행본 반영·병합·화면 PASS로 처리하지 않는다.

변경9파일: `unity/Assets/Exoduser/Runtime/NativeGame.cs`, `NativeGame.Remodel3D.cs`, `NativeGame.M1Check.cs`, `NativeReviewArgs.cs`, `Vfx/CombatImpactTimeline.cs`, `Vfx/CombatImpactView.cs`(뒤5개도 같은 Runtime 아래), `unity/Tools/combat-impact-tests/Program.cs`, `run.cjs`, 이 문서. 공용 CHANGELOG는 소유 범위 밖이라 총괄 인수용 초안만 남긴다: “근접 패링 G2: 따뜻한 선 스파크·6틱 제한 섬광·shake/pushin 비교 옵션·M1 +4틱 A/B 컷 연결. 표시 회귀430/0·Roslyn 오류0, 추가M1 09c FAIL·실제 화면 미검증.”

END

## 패링 RETOUCH 3 — 사용자 「패링구현이 엉망이네」 (2026-11-03 PC)

바탕화면 실행본 385e76ce1의 M1 캡처(06-parry-q·06-parry-shield)를 1x·3x로 다시 봤다. 결함:

| 결함 | 원인 | 조치 |
|---|---|---|
| Q 패링 = 보라 8각 별 스티커 | 웹 doParry의 `Dark_MediumImpact`(암흑 원소 시트)를 그대로 이식 | 근접은 이 브랜치의 따뜻한 흰 선 스파크(80~130). **탄 패링도 같은 선 스파크로 바꾸고 보라 별 삭제**(완벽 36~50·막기 20~30, 반사되는 탄이 주인공이라 적게) |
| 패링 주변 보라·흰 잔점 | `ParryParts` 둥근 점 입자 12개 | **삭제**(점 금지). 모든 패링은 선 스파크만 |
| 방패 탄 패링 = 누런 번개 시트 3장 | 웹 TVFX2 번개 3층 | **삭제**, 선 스파크 20~30. 물리탄 방패 패링의 화염 붐(`Fire_ImpactFire_Sheet`)·물콩·무지개 전용 시트는 유지 |
| 탄 패링에도 원소색 화면 섬광 .25 | 옛 `Flash` 경로 | **삭제** — 화면 섬광은 완벽 근접 패링만(R2, Δ≤40·6틱) |
| 영문 「PARRY!」 원색 노랑 글자, 빠른 연속 패링에 두 줄 쌓임 | Core `RaisePlayerText("PARRY!","#ffdd00")`(웹 '⚡PARRY!') | **표시 안 함**(`NativeRevive.Add`에서 거름, Core 문자열은 그대로). 레퍼런스 공통(팬텀 블레이드 제로·도타2·세키로류): 패링 성공은 스파크·섬광·소리로 읽히고 글자를 띄우지 않는다 |

- 파일: `Runtime/Vfx/CombatImpactTimeline.cs`(Plan 탄 패링 시트 제거, `CombatParryPresentation.Sparks` 탄 패링 개수), `Runtime/Vfx/CombatImpactView.cs`(`ParryLines` 하나로, `ParryParts`·`ParryColor` 삭제, `Flash` 패링 분기), `Runtime/NativeRevive.cs`(PARRY! 거름), `unity/Tools/combat-impact-tests/Program.cs`.
- 검사: combat-impact **508 checks 0 failures**(탄 패링 시트 0개·스파크 개수·섬광 없음 포함), blood-dark PASS, Runtime Roslyn 오류 0(249 소스), m1-parry 11개 중 실패 2건은 기존 09c 오프라인 하네스(위 「09c 회귀 조사」)와 같은 것.
- 판정: PC는 컴파일까지. Mac M1 06(06-parry-q-shake/pushin·06-parry-shield)·07e(탄 패링 장면 있으면) 1x·3x 판정 뒤 병합.
- 규칙 쪽(패링 판정 창·보상·히트스톱·적 밀림)은 이 브랜치가 건드리지 않는다. 손맛 결함은 유니티 총괄에 따로 전달.


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

## RETOUCH 4·패링 G1 타이밍 대조·흔들림 A/B 근거·3D 적 피격 위치 계획 (2026-11-04 PC)

CTO 야간 지시(11-03 밤). 작업본 `G:/exoduser-wt/codex-vfx-spark`, 브랜치 `claude/unity-pc-vfx-retouch-20261104`, 기준 origin/unity/main `4d336665a`. 새 작업본·빌드 없음(G: 여유 84GB).

### RETOUCH 4 — 남은 4건

| 결함 | 원인 | 조치 | 수치 근거 |
|---|---|---|---|
| 사망 피 색 | 사망 시트는 dark로 바뀌었지만 웹 deathFX 입자가 남음: 흰 사각 테두리 링·흰 점 1~3·보스 분홍 링 `#ff5577`·큰 몹/보스 방사 점 16/26개 `#ffaa66`/`#ff5577`·밝은 적색 점 6/10개 `#880000` | 사망 입자 전부 삭제. 사망은 dark 무광 시트 64/96틱 + 바닥 혈흔 3.5s+1s만 | VFX 마스터 §2.2 피 행(`#2a0f0b`~`#7a3326`), PBZ R6·R7, 점 금지 |
| 방패 패링 청록 | 물 파란콩(`waterBean`) 패링이 웹 `Ice_ImpactIce_Sheet`·`Ice_MistSmoke_FBF_4x4` 원본을 그대로 씀. 색상각 180~210° 채도 .67~.98, 중간 휘도 .53~.60의 밝은 만화풍 하늘색 + 흩어진 물방울 점 | `tools/vfx/recolor_parry_water.py`로 §2.2 물 램프(`#0f1c26`→`#3a6a88`→`#8db4c8`→`#dcebf0`, 감마 1.6, 코어색은 0~1프레임만) 재채색 + 셀 면적 0.2% 미만 분리 조각 제거 → `Ice_ImpactIce_Sheet_water`·`Ice_MistSmoke_FBF_4x4_water`. 충격 시트는 12프레임에서 멈춤(12~15는 흩어진 물방울만), 안개 투명도 .8→.6 | 검사: 색상각 199.1~206.0° / 200.0~202.8°, 잔점 0, 2~15프레임 중간색 초과 0, 알파는 제거분(2,886/82px) 외 동일, 임포트 설정 동일·새 GUID. 비교판 `tmp/design-review/vfx-retouch4/water_parry_compare.png` |
| 구르기 먼지 1x 판독 | 웹 addParts 그대로: 시작 3·끝 2개 + 틱마다 60% 확률 1개, `#6e6050` 2~6px 사각 → 1x에서 점으로만 보이고 먼지로 안 읽힘 | 부드러운 흙먼지 덩이(코드로 만든 64px 5엽 가우시안, 노이즈·그레인 없음, 가장자리 알파 0), 일반 알파. 시작: 구르는 방향 반대쪽 ±40°로 3개(지름 30~40 웹px, 수명 26~34틱, 정점 .42). 끝: 발밑 주위 2개(26~34px, 22~28틱, .36). 구르는 중: 4틱마다 1개(18~24px, 20~26틱, .26). 3틱에 정점, 지름 1.8배로 퍼지며 감속 이동. 색 `#6e6050`~`#9a8a72`(뼈·흙 계열) | 정점 알파 .42 이하라 탄·예고가 비쳐 보임. 동시 상한 24개 |
| 독탄 가산 과광 | 독탄 본체(일반 알파, 최고 휘도 .45) 위에 중심 가산층 `#c8e8a8` ×.6 | 중심 가산 .6→.35 | 실제 시트로 계산(선형 색공간, 프로젝트 설정 Linear): .6 = 정점 `#b4de8b` 휘도 .79 / .35 = `#97c170` 휘도 .67, 색상각 88~90° 띠 안. 블룸 문턱 1.1 아래. 감마 공간 가정이면 .6은 녹 채널 포화 18%(`#d6ff91`, 라임 쪽) |

### 패링 G1 §3 타이밍 대조 (근접 패링)

| G1 항목 | G1 값 | 수정 전 실제 | 수정 후 |
|---|---|---|---|
| 접촉 → 스파크 정점 | +2~4틱 | Core 히트스톱 2틱 동안 `FixedUpdate`가 멈추고 스파크 나이도 시뮬레이션 틱이라 같이 멈춤 → 화면 기준 **+5프레임** | 표시 시계(`CombatPresentationClock`)가 홀드 프레임도 셈 → **+3프레임**. 섬광·흔들림·푸시인도 같은 시계(PBZ R3 "포즈 홀드만, 연출은 계속") |
| 스파크 | 선 80~130, 키 .10~.25, 수명 .3~.5s | 같음(18~30틱) | 같음 |
| 섬광 | 근접만, Δ≤40, ≤6틱 | 홀드 중 0에 멈췄다가 2프레임 늦게 시작 | 접촉 다음 프레임부터 6프레임 안에 끝남 |
| 히트스톱 | 근접 2, 탄 0 | Core `ParryRewards` 2/0 | 같음(Core 무변경) |
| 슬로 | 0 | 0 | 같음 |
| 흔들림 | 근접 6, 탄 4 | Core 이벤트 `ParryShake` 6/4 | 같음 |
| 적 반응 | +6틱부터 18px 밀림 | G2 표현(시뮬레이션 틱 기준) | 변경 없음(G2 레인 소유, 홀드 2틱만큼 화면에서 늦음 — Mac에서 확인) |
| 성공 스파크 중복 | VFX 레인 소유 | G2 레인 임시 "최소 스파크"(뼈색 예고 섬광 줄을 +2~6틱 다시 켬)와 VFX 선 스파크가 함께 나옴 | 임시 줄 끔. 뼈색 줄은 예고 전용 |
| 푸시인 후보 | — | 두 개: VFX `--unity-parry-camera=pushin`(화각 2.5%, 8+20틱)과 G2 `--parry-feedback-push-in`(마커 .08u 당김, 6틱 선형 감소, 근접 흔들림 2) | 하나로 합침: 두 플래그 모두 R4 화각 푸시인 선택, .08u 당김 삭제. **근접 패링에만** 적용(탄 패링은 G1대로 흔들림 4). M1 06 A/B 컷도 근접 완벽 패링 이벤트로 찍음(위치·방향은 실제 Q 이벤트) |

### 흔들림 A/B — 기본값을 정할 근거

같은 근접 완벽 패링 한 번에서 화면이 움직이는 양(1600×900, 약 62.8px/u, 1080p는 ×1.2):

| 항목 | A: 흔들림 6 (지금 기본) | B: 푸시인(흔들림 2 + 화각 2.5%) |
|---|---|---|
| 움직임 모양 | 화면 전체가 진동(코사인·사인 진동, 크기 0.86배씩 감소) | 화면 중심 쪽으로 부드럽게 확대 후 복귀, 진동은 흔들림 2만 |
| 최대 이동 | 약 3.8px(.06u), 화면 전체 같은 양 | 플레이어 근처(화면 중심) ≈0px, 위쪽 먼 적(중심에서 400px) ≈10px, 모서리(918px) ≈24px. 진동 1.3px |
| 지속 | 약 20틱(.33s) 뒤 0.3 미만 | 8틱 확대 + 20틱 복귀 = 28틱(.47s), 그 뒤 정확히 원래 값 |
| 패링 직후 회피할 탄 | 플레이어 주변 탄도 같이 3.8px 떨림 | 플레이어 주변은 거의 고정. 가장자리의 먼 적만 천천히 이동 |
| 레퍼런스 | G1 표가 현행 14에서 낮춘 값 | PBZ: 진동 없음·푸시인, 도타: 흔들림 0 → R4 "큰 사건은 진동 대신 푸시인(화각 2~3% 6~10틱 → 복귀 20틱)" |
| 카메라 LOCK | 피치·거리 불변 | 피치 34°·거리 불변, 화각만 2.5% 28틱. 화면 끝 1.3% 띠(900p 기준 위아래 약 11px)가 잠깐 잘림 — 먼 적이 그 띠에만 있을 때만 영향 |
| 줄이기 옵션 | ReducedMotion이면 0 | ReducedMotion이면 0 |

- **총괄 제안: 기본 B(푸시인).** 레퍼런스 공통점이 "큰 사건은 진동 대신 푸시인"이고, 패링 직후 피할 탄이 플레이어 주변에 있어 진동보다 덜 방해된다.
- **확정 조건:** Mac M1 `06-parry-q-shake`·`06-parry-q-pushin` 같은 장면 1x 비교와 10초 무음 영상에서 (1) 푸시인이 체감되는지, (2) 먼 적이 화면 밖으로 밀려나지 않는지, (3) 연속 패링 3회에서 화면이 출렁이지 않는지를 본다. 셋 다 맞으면 `parry_feedback.json`·기본 플래그를 B로 바꾸는 한 줄 커밋을 한다. 하나라도 틀리면 A를 유지한다.

### 3D 적이 들어올 때 피격 이펙트 위치 확인 계획

지금 피격 이펙트는 Core 이벤트의 발밑 좌표(X,Y)에 그리고, 크기는 Core 반경 `Size`(몸 반지름)로 정한다. 키는 몸 지름으로 어림한다(U-VFX-04 절). 리깅 3D 적([1-1 적 3D G0](../8.0몬스터디자인/UNITY_CH1_1_ENEMY_3D_RIG_G0_20261103.md), 메시 높이 = 1.85m × 적 r ÷ 영웅 r × 체형 보정)이 들어오면 실제 몸과 어긋날 수 있다.

| 순서 | 할 일 | 합격 기준 |
|---|---|---|
| 1. 기준점 | 근접 패링 스파크가 이미 쓰는 방식(표시 중인 렌더러의 투영 bounds 높이)을 적에도 쓴다. 적 3D 렌더러가 있으면 접점 = 발밑에서 화면 위로 몸 높이 ×0.55(가슴), 크기 = 투영 높이. 없으면(아틀라스 적) 지금처럼 Core `Size` | Core 판정·좌표 무변경(표시만) |
| 2. 표 | etype마다 "Core r · 메시 높이 · 투영 높이(px, 34° 화면 위·중간·아래 3위치) · 접점 높이"를 G1 적 표 옆에 적는다. 1차 = 가시 사도·다안 육괴(도구 비교 대상) | 표의 투영 높이와 실제 캡처 bounds 차이 10% 이하 |
| 3. 캡처 | Mac M1에 적 3D 피격 컷 추가: 일반 피격·치명·사망·근접 패링(겹친 적 3마리)을 화면 위·중간·아래에서 각각, 1x·3x | 피격 섬광 중심이 몸통 안(머리 위·발밑 밖으로 벗어나지 않음), 핏줄기가 몸 실루엣을 .2s 넘게 가리지 않음, 먼 적의 피격도 1x에서 보임 |
| 4. 크기 | 피격 시트 폭 ÷ 투영 몸 높이 비율을 지금 아틀라스 적과 같게(일반 .6~1.0배) 맞춘다. 큰 적(대형사도·빙마 문지기)은 상한 1.2배 | 같은 장면에서 작은 적·큰 적 모두 "몸에 맞는 크기"로 눈 판정 |
| 5. 사망 | 3D 적이 무너지는 동작과 사망 피 시트·바닥 혈흔 시작 틱을 맞춘다(무너짐 시작 = 혈흔 생성) | 피가 몸보다 먼저/엉뚱한 곳에 생기지 않음 |

- 착수 시점: G0 §4의 G5(etype → rig-pixel 모델 표 연결)와 같은 커밋 묶음. PC는 컴파일·정책 검사까지, 판정은 Mac.

#### 보스전 총괄 1차 일정에 맞춘 순서 (11-04, CTO 지시)

기준: 적 3D G0 §8(773bf0238). 0차 시범 가시 사도(1)는 Meshy 메시·리깅까지 끝났고, 나머지 1차 4종은 현자형 사도(7)·덫 사도(16)·그림자 쌍둥이(47)·갑각 사도(4)다. 지금 피격 크기는 Core 반경으로 몸 지름 = 2×r 웹px: 1·7·16 = 20, 47 = 24, 4 = 32(일반 피격은 ×.6, 치명·보스는 ×1.0).

| 적 3D 단계(G0 §8) | 임펙트가 붙이는 일 | 담당 | 산출물 |
|---|---|---|---|
| 0차 완료(가시 사도) | 이 계획 확정. 가시 사도는 G3.5 정리 뒤 정리 FBX로 1번 표를 먼저 채워 시범으로 쓴다 | 임펙트 총괄 | 이 절 |
| 3. 1차 4종 G1~G3.5 | G2.5 조기 판정 렌더(34°·거리 16.5·영웅 1.31u 기준)와 같은 Blender 장면에서 종마다 숫자 3개를 함께 적어 달라고 요청: **메시 높이(u)·가슴 높이 비율(발 피벗 기준)·화면 위/중간/아래 투영 높이(px, 1920×1080)**. 그림자 쌍둥이는 분신·순간이동 뒤 나타나는 자리, 갑각 사도는 등딱지 막기 자세의 가슴 높이도 함께 적는다 | 보스전 총괄 서브에이전트(Blender 렌더에 숫자 출력 추가, 추가 비용 0) → 임펙트 총괄이 2번 표로 정리 | 종×숫자 표(5종) |
| 4. Unity etype→rig-pixel 모델 표 | 같은 커밋 묶음에 피격 기준점 연결: 3D 렌더러가 있는 etype은 투영 bounds로 접점 높이(가슴 .55 또는 표의 비율)·크기(일반 .6~1.0배, 큰 적 상한 1.2배)를 정하고, 없으면 지금처럼 Core 반경. 사망 무너짐 시작 틱에 사망 피·바닥 혈흔을 맞춘다. 표시 전용, Core 무변경. 정책 검사(접점이 몸 bounds 안, 크기 비율 범위)는 combat-impact 검사에 추가 | 11-05부터 Sonnet 서브에이전트(임펙트 총괄 브리프·검수) | 코드+검사, PC 컴파일 1회 |
| 5. Mac 34° 캡처·영상 판정 | 같은 Mac 판정 차례에 피격 컷을 함께 넣는다: 5종 × 일반 피격·치명·사망 × 화면 위·중간·아래, 근접 패링은 갑각 사도 내려치기(겹친 적 3마리), 그림자 쌍둥이는 착지 강타 뒤 피격. 1x·3x와 10초 무음 영상 | 디자인총괄·테스트 총괄(캡처), 임펙트 총괄(피격 판정) | 3번 표의 합격 기준으로 PASS/RETOUCH |
| 1차 PASS 뒤 2차 | 다안 육괴(비인간형, 0차에 메시 완료)는 몸이 둥글어 가슴 비율 대신 **눈 높이**를 접점으로 쓴다. 문지기 빙마(29)는 ×1.4 크기라 상한 1.2배 확인 | 임펙트 총괄 | 2차 G1 표에 같은 숫자 열 |

- 막히는 조건: 3번 숫자가 없으면 4번은 Core 반경 방식을 유지한 채 연결만 하고, 크기 조정은 Mac 캡처의 bounds로 대신한다(일정을 늦추지 않음).

### 검증

- `run.cjs` 1회: **812검사/0실패**(물 패링 시트·12프레임·안개 .6, 표시 시계 홀드 +3, 구르기 먼지 개수·정점·수명·크기·퍼짐·방향, 두 푸시인 플래그) + blood-dark·원소구 v3·물 패링 PNG 검사 PASS. 로그 `tools/combat-impact-check/checks.log`.
- `tools/vfx-missing-compile.cjs`: Core 126·Runtime 262 소스 Roslyn 오류 0(1차에서 MeleeParry 한 줄 주석이 뒤 코드를 가린 CS0103을 고친 뒤).
- 화면 판정 없음: Unity 임포트·Player·실게임 1x·10초 영상은 Mac. 독탄 밝기는 계산값이며 화면 측정이 아니다.

변경: `Vfx/CombatImpactTimeline.cs`, `Vfx/CombatImpactView.cs`, `NativeGame.cs`(홀드 프레임 한 줄), `NativeGame.Remodel3D.cs`(.08u 당김 줄 삭제), `NativeGame.MeleeParry.cs`(임시 성공 스파크 끔), `NativeGame.M1Check.cs`(A/B 컷 근접 이벤트), `NativeBossView.cs`·`NativeDruidArt.cs`(독탄 코어 .35), 새 PNG·meta 2쌍, `tools/vfx/recolor_parry_water.py`, 검사 `Program.cs`·`run.cjs`, 이 문서·VFX 마스터·CHANGELOG_SYNC.

**판정: PC 검사·컴파일 통과 / RETOUCH_GAME_QA_PENDING.** Mac에서 볼 것: 물탄 방패 패링 색(06-parry-shield 계열), 일반·보스 사망 1x에 점 0, 구르기 먼지 1x 판독·탄 가림 없음, 드루이드 독탄 중심 밝기, M1 06 A/B, 근접 패링 스파크 정점 +3프레임.

## 11-04 01:00 적 3D 접점 연결 바탕 (PC)

[Unity 연결 기록](../8.0몬스터디자인/UNITY_ENEMY3D_WIRING_20261104.md)의 NativeEnemyRigRenderer.ImpactAnchor → CombatImpactView.EnemyRigAnchor를 연결했다. 기존 AnchorRatio·ImpactRatio·chestRatio/height/deathTicks·--enemy-render=rigpixel 이름/의미를 보존했다. TargetId 또는 etype+동일 좌표의 유일한 표시 개체만 사용하고, 모델/접점이 없거나 겹쳐 식별할 수 없으면 기존 Core 반경 경로다.

리그 bounds의 투영 높이로 몸 안 접점과 시트 최종 폭(일반.6·치명/사망1.0·큰 적 상한1.2)을 정한다. Blood Stretch까지 최종 폭에 포함한다. 바닥 혈흔은 발밑에 유지하며 사망 관측 틱을 모델 사망 샘플링과 공유한다. Core 이벤트 X/Y/Size나 판정은 수정하지 않는다. deathTicks 뒤에도 기존 사망 피 시트가 발밑으로 튀지 않도록 마지막 리그 접점을 유지한다.

PC 정책103/0·전체 참조 컴파일5개 오류0. 실제 임포트·접점 오차10%·피 실루엣 가림·먼 적1x·30마리 성능은 Mac 미판정. 공격/피격/사망 클립은 현재 제공되지 않아 bind pose이며 실제 무너짐 동기화 판정은 클립 제작 뒤다.
