# P2-001b — 첫 전투 사망 연출 + 피격 파티클/임팩트 (2026-10-20)

## 원본 추적 (수치·색·수명·개수 원문 그대로)

### 1) 피격 시각 (hurtE dmg>0, weapon/kiSlash 프로필)
| 행 | 문장 | 구현 |
|---|---|---|
| 42396~42398 | `_quiet`(두 프로필 모두 해당 키 없음→false), `_txtPerFrame++`, `_overBudget=_txtPerFrame>12`(25413) | state feel owner (P2-001a 확장) |
| 42399 | `addParts(e.x,e.y,e.col,min(~~(dmg/3×OPT.parts/100),8))` — addParts(43927): n×0.6, vx/vy=(r-.5)×7, sz 2+r×4, life 12+r×12 | hit-fx 어댑터 `emit_parts` 재사용 (동일 포트) |
| 42401~42411 | 피 스플래시: `_bN=min(12,~~(2+dmg×.04)×parts/100)`, 각=ang±.4rad, 속=1.5+r×3+dmg×.02, 색 4종(#aa0000/#880000/#cc1111/#660000), sz 1.5+r×2.5, life 12+r×10, grav .12 | hit-fx `emit_native_hurte_hit_blood`(신규) — OPT.parts(80)는 main owner 경유 |
| 42415 | `G._flashCol='#ffffff';G._flashT=0.08` | state feel에 기록, 소비자 55113(알파 min(.55,t×.18)·`t-=dt`)은 main 오버레이+감쇠 owner API |
| 42417~42419 | `ang&&!_overBudget&&!_isMagicDmg&&!noImpact → _addImpact(e.x,e.y,0,ang,'slash',e.ib,_impPerFrame>3)` — **kiSlash는 noImpact로 생략(원문)** | main `emit_native_hurte_impact` → state `_impPerFrame++`(25415 실카운트) → death-fx 어댑터 |
| 25414~25440 | _addImpact: `_lite=_impPerFrame>2`(비보스), 임팩트 풀 12(ml16/sz1/slash), slash→`spawnHolyBurst(x,y,.4)`(19172, impact_basic_sheet 공유·frameRate .04), `doHitFlash(ELC[0] #bbbbbb, .1)`(19953 — 기존 hit-fx emit_hit_flash), 방향성 파편 6+r×3(반대각±1.1, el0 색 #bbbbbb/#ff4444, kind 2/0, grav .06), 25430 hitStop은 OPT.hitStop 0+32585 비활성 → 효과 0 | death-fx 어댑터 `spawn_native_impact` + 렌더 54720~(9프레임, drawSz=fsz×(.8+p×.6), alpha=(1-p)×.45, additive) |
| 37632~37643 | hitArc 원소 파티클·약점 링 | 미이식 유지 (호출부 소관 — 잔여) |

### 2) 사망 연출 (처치 파이프라인 42704~42732)
| 행 | 문장 | 구현 |
|---|---|---|
| 42711 | `deathFX(e.x,e.y,e.r,e.col,ib,…)` — 24805~: **사운드 디스패치(24790~24830, sfx/death ~43파일)**, 흰 링 tp3(r,life8), 중심 플래시 tp1×1, `death_blood` 시트(19679: Blood_FBF_4x4.png 128px 16f 4cols, scale=max(.8,min(4.8,.35+r×.075)), frameTime4, 랜덤각, baseAlpha1.5, alpha×(1-f/16×.3), lighter) | 링/플래시=hit-fx poolPart, 시트=death-fx 어댑터. **사운드 미이식 — 에셋 미복사 목록 보고·카운터 기록** |
| 42720 | `_spawnLargeMonsterDeathFx`(25396): `_isLarge=r>=18||mhp>=220`(첫 스테이지 전원 r 20~35 해당), 비보스 16발 방사(#ffaa66/#ffd9aa, v 3.2+r×2, grav .08) + addParts(…,10) | death-fx front |
| 42722 | `_addCorpse`(24964, OPT.deathFx 게이트): 스프라이트 캡처 시체, spd=min(5,1.5+power×.8) (power=min(8,dmg/mhp×20)), 회전 a+π/2·rv±.1, **mt=420틱**, 물리 34638~(벽 바운스 -0.4·마찰 .85^sp), 렌더 54529~(캡 25, **t<mt×.4 페이드**, scale(1,.5) 납작, 그림자 웅덩이 #330000 α.3) + `_addFloorTrace`(24903): 핏자국 전원(_stainRadius=max(14,min(36,r×1.4)), **420틱 유지+120틱 페이드**, 2중 타원 #4a0508 α.42/#7a1018 α.30), 살점 잔류는 r>=40만 | death-fx 어댑터 (시체=적 _body 현재 프레임 캡처) |
| 42726~42731 | 고어: **provider 롤 3건(P1-002.E 고정: common/rare→조각 인덱스→대형 intestine/organ) 값 그대로 재사용 — 추가 소비 없음**. _addGorePiece(25236): 변형 _goreRand·크기±4·30% 카메라 플링(scale .5→3, life40)/일반(v 5+r×7, vy-2, grav .10, life90), 렌더 54562~(알파 life/ml×3, 축소 life<10) | death-fx 어댑터 (gore 33종 PNG — 원본 assets/gore 복사) |
| 42732 | `_addDeathImpact`(25187): blood_impact_2/3/4 랜덤, maxSz=max(24,min(240,r×3))(25186), life 1.0→0 (0.8/초, 34616), 렌더 54568(확대 .3까지 급팽창 후 ×1.2 완만, 페이드, lighter) | death-fx 어댑터 |
| — | 사망 시 본체: 원본 drawEn은 `alive` 게이트로 즉시 렌더 제외 → 시체가 대체. 기존 Godot '어두운 반투명 모듈레이트'는 원본과 달라 **hurtE 사망에서 본체 숨김으로 교체** (receive_damage 레거시 경로는 킬 파이프라인·시체가 없어 기존 연출 유지 — 잔여) | enemy.gd + 공용 owner death write |

### RNG 규약 (충돌 보고)
원본은 게임플레이·시각이 단일 Math.random 스트림. E에서 "엔진이 달라 단일 스트림 정렬
불가 — provider 추적은 게임플레이 롤만"으로 고정했고, **기존 hit-fx 어댑터의 시각 RNG가
이미 world.sample_native_random_unit()(공유 샘플러)을 쓰는 관례**가 있다. 본 작업의 시각
RNG도 같은 샘플러를 쓴다 — provider 추적 롤(rng_draws)에는 비노출이라 **E/F/G 고정 계약
(비처치 1회/처치 7·8/8·9)과 충돌 없음**(테스트로 재확인: 처치 롤 수 불변). 고어 카테고리
선택 3건만은 이미 소비된 provider 롤 값을 재사용(추가 소비 0).

## 에셋
- 복사(원본 파일 그대로, 신규 제작 없음): `assets/gore/*.png` 46종 → `godot/assets/gore/`,
  `assets/vfx/Blood_FBF_4x4.png` → `godot/assets/vfx/`. impact_basic_sheet.png 기존 보유.
- **미복사·미이식(목록)**: 사망 사운드 `sfx/death/ACE/*.mp3`(약 43파일 — death_monster1~4,
  death_flesh/2, death_crack1~4, death_bone*, death_insect*, death_ghost, death_beast1~4,
  death_armor, death_crush2, death_skull, death_ghoul1~3 변형 등) + boss_death_blood clip
  (보스 전용) — 어댑터가 스킵 카운터 기록.

## 변경 파일
native_death_fx_adapter.gd(신규 — 핏자국/시체/고어/데드임팩트/death_blood/임팩트/홀리버스트,
고정 풀·노드 비증식) / native_projectile_hit_fx.gd(42399~42411 blood 메서드, **셰이크 소비자
단일화** — 기존엔 main._process와 어댑터가 camera.offset을 서로 덮어써 P2-001a의 G.shake
적용이 무효였음 → G.shake 공급자 바인딩 후 max 합성, 오프셋 작성자 1곳) /
native_source_new_run_state.gd(42415 플래시 기록·_impPerFrame 증가 API·55113 플래시 감쇠) /
main.gd(OPT.parts/deathFx 읽기, blood/impact/death front·tail 배선, 화면 플래시 오버레이) /
world.gd(어댑터 장착) / native_normal_enemy_hurte.gd(42399/42417/42704/42726~32 호출) /
enemy.gd·native_dedicated_enemy_hurte_owner.gd(사망 본체 숨김) / 테스트 1종 + 에셋.

## 검증 (원로그 scratchpad\p2-001b\)
- test_p2001b_death_fx (격리 EXODUSER-P2001B-Isolated-20261020): **40/0 PASS** — 에셋
  33+3+2종 로드, HP 피해 타의 blood/impact/홀리버스트/파티클 생성·화면 플래시 G 기록,
  처치 시 deathFX·시체(본체 숨김 확인)·고어 2조각(r≥18, provider 롤 재사용)·데드임팩트·
  핏자국·death_blood 애님·사운드 스킵 카운터, **처치 provider 롤 수 불변(8/9)**, 수명
  (시체420·비행고어90·핏자국540·DI75·임팩트16틱) 소거, kiSlash noImpact(임팩트 메트릭 불변).
  초기 1회 실패 3건은 신규 PNG 미임포트 — `--import` 1회 후 재실행 PASS(.import 커밋).
- 회귀: p1002e 93/0 · p1002f 313/0 · p1002g 214/0 · p2001a 31/0 · contracts 5/0.
- 화면(1920×1080 실제 창, 대상 좌표 3배 크롭·가시 확인): 피격 순간(흡수 숫자+임팩트 버스트),
  처치 순간(death_blood 피 폭발+고어 비산+본체 소멸), 1.2초 후(시체·핏자국·화이트 피해 숫자).
  영상: `p2b_hit_death_fx_720p.mp4` (9.8초, 720p, 1.94MB).

## 잔여 (목록)
1. 사망 사운드(sfx/death 에셋 복사+오디오 소비자) — 에셋 파이프라인 별도.
2. hitArc 원소 히트 파티클·약점 링(37632~43), 분할 시체(_splits)·gib·불타는 시체(_addBurnCorpse),
   보스 변형(boss_death_blood clip·보스 시체 캡처).
3. receive_damage 레거시 경로(Q/E·투사체 킬)의 사망 연출 — hurtE 파이프라인 바깥(기존 유지).
4. 고어 '바닥 잔류' 생성원은 r≥40 전용이라 첫 스테이지 미발생(시스템은 이식됨).
