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
| 그 밖의 패링 | `_TVFX2_COMBOS[2]`19151~19154, draw55221~55240 | Lightning Impact 4×4 sc1.2/delay0/5틱; Lightning FBF 4×3 sc1.32/delay1/7틱; Lightning Basic 3×3 sc.6/delay0/7틱. 가산, 크기 `cell*sc*(1+p*.4)`, alpha .7·60%부터 페이드 |
| 물콩 Q | `_waterBeanIceBurst`8933~8938 및 `doParry`38958 | Ice Impact+Mist 4×4, r96→288/326.4px, 72틱. 두 번째 지연3틱/alpha×.8. Dark02 중복 없음 |
| 무지개 Q | `_rainbowImpact`8945, draw57563~57579 | Poison Medium/Dark Smoke/Light Impact/Ice Impact 4층, 72틱, r80×(2.8/3.1/3.4/3.7), 회전0/90/180/270°, alpha×(1/.85/.7/.55). 지연을 가장 가까운 정수 틱으로 샘플링 |
| 패링 공통 | `doParry`38982~38984, `doHitFlash`20314, draw55373 | 방사12개, speed3~7/size2~5/life10~16, 3개당 흰색1개. 플래시 strength .25→실제alpha+.125(누적상한.5), 틱당-.08. 흔들림14×설정, 감쇠.86/틱·.3px 미만 종료. Core 히트스톱 추가0 |
| 일반·치명·보스 피격 | `_addImpact`25777~25805, `_impactSpriteFor`19232, draw55166~55218 | `impact_el0..5_sheet`9셀 / `impact_el0..5_boss_sheet`16셀, 16틱, boss×2.5. `drawSz=cell*scale*(boss?.92:.8+p*.6)`에서 괄호는 `(boss?.92:.8)+p*.6`. alpha `(1-p)*(boss?.62:.45)`, 가산. 원소6/누락 시 basic9셀 폴백 |
| 피격 버스트 | `spawnHolyBurst`19533 / `spawnElecBurst`19476 | basic9셀×2.4틱(22틱 샘플), 일반sc.4/보스.7, alpha.45. 번개는 `boss/vfx_holy_burst`3×3/9셀×3틱, sc.1/.18, 5셀 뒤 감쇠. 역방향6~8파편과 원소별 추가입자 |
| 일반 사망 | `deathFX`25197~25223, `_deathBloodScale`25163, `_spawnLargeMonsterDeathFx`25759 | `Blood_FBF_4x4`, 4×4/16셀×4틱=64틱, 일반 알파. 폭 `128*clamp(.35+max(1,r)*.075,.8,4.8)`, alpha `min(1,1.5*(1-p*.3))`. 중심 사각 플래시·팽창 테두리·피 파편. 큰 몹(r≥18) 추가16입자 |
| 보스 사망 | 위 함수와 `_drawBossDeathBloodClip`20088 | `boss/boss_death_blood_24_20261010`, 6×4/24셀을 기존16셀×6틱=96틱 수명에 매핑. 원본 blood16셀 폴백. 추가26입자, 중심 플래시·외곽 테두리. `druid_sink` 제외 |
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
