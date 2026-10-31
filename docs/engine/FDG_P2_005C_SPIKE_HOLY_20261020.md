# FDG P2-005c — 가시덫(1)·회복의 영역(F) 발동 + hurtE DOT 확장 (2026-10-20)

> 2026-10-21 DEMO11-16 현재 연결 갱신: 현재 spikeTrap은 _cdRed가 반영된 쿨과 단일 비용 commit을 쓴다. holyDome 쿨1800/비용0은 유지하며 HUD는 실제 배정 슬롯에서 같은 쿨 owner를 읽는다. 존/리젠/피해 경로 변경은 없다. 아래는 당시 인수 이력이다. [현재 계약](DEMO11_SKILL_DISPATCH_20261021.md).

작업 폴더 `G:\exoduser-wt\p2-002a-hud`, 브랜치 `claude/p2-005c-skills-20261020`. 원본 근거는 전부 `G:\exoduser\game.html`(읽기 전용) 행 번호.

## 1. P2-005b 지적 2건 반영

| 항목 | 원본 근거 | 반영 |
|---|---|---|
| (a) 레슨 중 지옥강타 악의오브 미소비 | 13010 게이트 `(window._parryLesson?.active‖G.mats>=_malCost(20))`·46454 `if(!window._parryLesson?.active)G.mats-=_malCost(20)` | `native_skill_slots.gd` `_is_parry_lesson_active()` — `main.source_intro_sequence.lesson_flow.active` **읽기 전용 getter**(레슨 파일 무수정). 게이트 면제+소비 면제 둘 다 적용 |
| (b) 인페르노 분출 크기 차이 | 56811 `X.globalCompositeOperation='screen'` | 원인=블렌드 차이(크기 식 `maxR×0.9×(.72+.28min(1,p3.5))`은 양쪽 동일·900px). `CanvasItemMaterial BLEND_MODE_ADD` 적용. 같은 위상 재캡처: 웹 t=13 vs Godot t=14(둘 다 grow=1.0·α=1 구간), `_out/p2-005c/compare_slam_t14.png`. 중앙 세로 극값 659px(웹)/593px(Godot) — 장면 요소 차이 범위, 시트·렉트 크기 동형 |

## 2. hurtE 집행자 DOT 확장 (`native_normal_enemy_hurte.gd`)

`SUPPORTED_OPT_KEYS` += `dot`, `shieldHit`. isDot 분기 8곳을 원본 행 그대로:

| 원본 행 | 분기 |
|---|---|
| 42121 | reviveIframes 감소·return은 `!isDot`일 때만 (DOT는 통과) |
| 42191 | 피격음 `!isDot` |
| 42332/42334 | 스턴/빙결 ×1.5 증폭 `!isDot` |
| 42345 | 쉴드 흡수 `(!isDot‖shieldHit)` — 블루 흡수 텍스트는 `!isDot`만 |
| 42387 | 피해 피크 펌프 `_quiet2` DOT 제외 |
| 42382 | 즉시반격 `!isDot` |
| 42472 | 넉백 `!isDot` |
| 42486 | 포이즈 `poiseHit&&!isDot` |

비dot 경로는 전부 `not is_dot` 추가 형태라 무변경 — E/F/G 회귀(80/313/214) 0 실패로 확인.

## 3. 가시덫 (spikeTrap, 키 1)

| 항목 | 원본 | 포트 |
|---|---|---|
| 게이트 | 13021 `G.mats>=_malCost(10)&&P._gcCd<=0` (레슨 면제 없음) | 동일. 거절 시 cast_log rejected 기록(showPH '악의오브 부족!' 토스트는 미이식 기록) |
| 비용·쿨 | 45512 `mats-=_malCost(10)=5`·`_gcCd=~~(600×(1+_cdRed 0))=600` | state `apply_native_skill_cast_cost` 5·`gc_cd=600` |
| 피해 | 45507 `~~(magicRef×statInt(1)×pMagicMul×_skMul(14+(lv−1)×11.2×0.5)×0.75)` | provider bundle `reference.magic_ref()`+`formula.p_magic_mul()` READY 필수(NOT_READY=정지 기록), `js_to_int32` |
| 존 | 45515~45517 `{r:300+15(lv−1), maxT:600, dmg, el:EL.P, lv}` | `G._fireZones`에 push (아래 §5) |
| 틱 | 37414s `_tickTimer+=sp`, `_fzTick=25` | 존 dict `_tickTimer` 누산 동일 |
| 틱 효과 | 37467~37472: 30% melee_hit1(.25,_r(1.2,.15))·hurtE `{dot,shieldHit,_lessonAttack:'spikeTrap'}` EL.P·출혈 스택·첫적용 `🌿N%`(#66aa44,25)·`_spikeSlow=max(,90)`/`_spikeSlowLv` | 동일(출혈 스택만 소비자 미이식 — 아래 §6). 감속 소비는 `enemy.gd` `_spike_slow` 틱 감소+`×(1−min(.95,.91+.02(lv−1)))` (34398·45506) |
| 캡 | 37427~ `_stHitCap` 틱당 1회/타입 | 생략 기록 — 쿨600=지속600이라 동시 1존만 존재 가능(합체 pillarSpike 9존은 미보유) |
| 연출 | 45519 `playSample('spike_trap',.8,_r(1,.08))`·45520 `shake(4)` | 샘플 동일(vol −1.94dB)·state `apply_native_skill_shake(4)` (19924 `G.shake=max(,n×OPT.shake/100)`) |
| 파티클 | 37491 30%/프레임: 갈(#886633)/녹(#667744) 가시 + 30% #aa4422 | 어댑터 파티클 리스트(시각 전용 로컬 난수)·링 없음(원본 동일) |
| 합체 분기 | 45509 pillarSpike 흡수 시 발동 차단 | 미보유 — 분기 기록만(스킬 데이터에 합체 없음) |

## 4. 회복의 영역 (holyDome, 키 F)

| 항목 | 원본 | 포트 |
|---|---|---|
| 게이트 | 13006 `P._hdCd<=0`만 (자원 비용 없음) | 동일 |
| 쿨 | 46711 `P._hdCd=1800` 고정(_cdRed 없음) | `hd_cd=1800` |
| 존 | 46709~46713 `{r:500+lv×20, maxT:720+lv×30, type:'holyDome', lv}` | `G._fireZones` push |
| 리젠 | 32706~32709 플랫 초당 10+lv×2 + 자연리젠 _hdMul=2 | **리젠 단계 소유** — 포트 모듈(`holy_dome_presence_source`/`holy_dome_flat_heal_source`/`native_source_player_regeneration_phase`)이 이미 존재하고 `G._fireZones`를 읽으나 **main 부팅 미배선**(경계 — §7). 어댑터 중복 구현은 금지 원칙에 따라 안 함. 존이 실소유 presence 프로듀서에서 READY·true로 판정됨을 테스트로 증명 |
| 쿨 2배속 | 35936 `_hdCdBonus=sp` — 대상 cd만: 36678 `_gslCd-=sp+bonus` 등. **36517 `_gcCd-=sp`·36679 `_hdCd-=sp`(돔 자체)는 가속 제외** | 어댑터 보유 3종 중 `gsl_cd`만 +bonus. (웹 실측 gcPerSec 59.9=1배로 교차 확인) |
| 연출 | 46725 voice_holyDome/2(50%)·46728 `🛡 회복의 영역!`(#b6ff54,50)·46730 shake(3) | 동일. SFX.pickup(10368 프로시저럴)·addParts 15입자는 미이식 기록 |
| 파티클 | 37256 25%/프레임 #b6ff54 상승 입자(돔 내 임의 지점) | 동일(시각 전용 로컬 난수)·링 없음 |
| 합체 분기 | 46715~46723 holyFuse/holyIce 동시 존, 이름/색 분기 | 미보유 — 기록만. Q(peaceShield)와는 무관(불간섭 유지) |

## 5. `G._fireZones` 공유 상태 소유

- 존 보관처는 로컬이 아니라 **state의 `G["_fireZones"]`** — 리젠 단계·main Q쿨(main.gd 1683)·presence 프로듀서가 전부 이 키를 읽는다.
- state 신규 API `commit_native_fire_zones(owner, zones)` (`commit_native_e_wave_state` 선례). lazy 생성(45516) — 부트 `_fireZones 부재` starter 단정 보존(시전 전 키 없음).
- 존 clock(만료 drop·틱 타이머·37389s)은 스킬 슬롯 어댑터가 owner(현재 존 생산자가 어댑터뿐).
- state 신규 API `apply_native_skill_shake(owner, n)` = 19924 `shake(n)` (OPT.shake 100 기준).

## 6. 미이식/보류 기록 (가짜 구현 금지 원칙)

- 출혈 스택(37469 `bleedT/bleedStk/_bleedPool`): 포트에 bleed DOT 소비자 부재 — 스택 기록도 생략(가짜 상태 방지). bleed 시스템 이식 때 함께.
- `_stHitCap` 겹침 캡: 동시 1존만 가능해 효과 없음 — pillarSpike(9존) 이식 때 함께.
- SFX.pickup = WebAudio 프로시저럴 합성음 — 에셋 복사 불가.
- showPH 부족 토스트·_addSkProf 숙련도 프로파일 — 해당 시스템 미이식.
- **iceOrb(Ctrl) 미구현** — 범위 큼(무적 보주·재입력 파쇄·칼날 4+lv×4발·파쇄 30%·냉저 −10%/히트·_ioActive 중 타 스킬 차단). 키 무반응 유지. 다음 차수 경계 보고됨.

## 7. 경계 — holyDome 리젠 실효화 조건

리젠 단계(`native_source_player_regeneration_phase`)는 구현·자체 테스트(88/0) 완료 상태지만 main 부팅에 바인딩돼 있지 않다(바인딩 시 ST 자연리젠 소유가 player 로컬 0.28에서 source로 넘어가는 시스템 전환이라 본 태스크 범위 밖). **리젠 단계가 배선되는 즉시 holyDome 리젠은 추가 작업 없이 작동한다** (존 모양·판정은 실소유 프로듀서로 검증 완료).

## 8. 검증

- `test_p2005c_spike_holy` 20/0 (격리 EXODUSER-P2005C-Isolated-20261020): 악의오브5·쿨600·존 수치·dmg식·25f 전 틱 없음·hurtE dot 경유·쉴드 흡수(42345)·dot 무스턴·_spikeSlow 90·재시전 거부·qs0 sweep / 돔 쿨1800·존 r520 maxT750·presence false→true·_gslCd 2배속·_gcCd 1배·재시전 거부·qs5 sweep.
- 웹 교차(`_tmp/web_p2005c_shot.mjs`): mats 1000→995·gcCd 600·zone{r300,maxT600,dmg401=~~(23×1.66292×14×.75)}·_spikeSlow 85/lv1·쉴드 875→0 흡수·hdCd 1800·zone{r520,maxT750}·gcPerSec 59.9(가속 없음 확인).
- 회귀: E 80/0·F 313/0·G 214/0·p2001a 31/0·b 38/0·c 16/0·e 18/0·j 21/0·p2002a 36/0·b 16/0·p2003a 10/0·p2004a 17/0·p2005a 27/0·b 12/0·contracts 5/0·초기화 117/2(선재)·시작 145/2(선재)·재생 88/0·레슨 30/0·regen binding 170/0·qe 0실패·authority 71/6(**선재** — stash 후 무변경 트리에서 동일 재현).
- 화면: `_out/p2-005c/compare_{slam_t14,spike_cast,spike_tick,dome_cast}.png`(웹·Godot 같은 장면 합성), `godot_p2005c_skills.mp4`(5초: 가시덫→돔→돔 안 강타).
- 문서 대조: 2_1 §spikeTrap(1214)·DPS표(156) 수치 일치. holyDome 리젠 Lv 스케일(+2/Lv, 32709)이 2_1(1212)·DPS(158)에 누락 → 코드 기준 정정 + 쿨감 제외 cd(36517/36679) 명시.
