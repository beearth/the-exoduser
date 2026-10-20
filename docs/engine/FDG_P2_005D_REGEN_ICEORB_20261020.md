# FDG P2-005d — A) 자연 회복 단계 부팅 배선 · B) 얼음보주(Ctrl) 발동 (2026-10-20)

작업 폴더 `G:\exoduser-wt\p2-002a-hud`, 브랜치 `claude/p2-005d-regen-iceorb-20261020`(main 0779085bd). 원본 근거는 `G:\exoduser\game.html`(읽기 전용) 현재 행 번호.

## A. 자연 회복 단계 부팅 배선 (커밋 6f34bb5be)

### 전수 조사 — 배선 전 회복 소유자
| 자원 | 배선 전 소유 | 원본 |
|---|---|---|
| ST | player.gd 레거시 `_stamina_regen_base 0.28`/div(731 else 분기) | 32718~32719 `_str/8(idle)·/16` |
| MP | 없음(리젠 미적용) | 32718~32719 `_mpr` 동일 |
| HP | 없음 | 32715~32717 `_hpr/_regenDiv` |
| 돔 플랫·회복×2 | 없음(모듈만 존재·미배선) | 32705~32709 `_inHolyDome/_hdMul/_hdFlat` |

### 배선 (main.gd `_bind_native_source_regeneration_boot`)
- `native_source_player_regeneration_phase`(기존 모듈, 자체 테스트 88/0)를 Main 부팅에서 configure→authority bind→world/player bind. 원본 순서는 단계 내부가 소유(presence→holy flat→pre-holy rates→HP→natural ST/MP = 32705→32709→32711~12→32715→32717~20, 레슨 ch2 게이트 32717).
- 공급자 전부 기존 단일 소유 재사용: providers `rates/affix/passives`·state `read_current_g/p`·fusion `fuse_star`·authority `commit_native_source_hp`/`commit_native_holy_flat_resources` 싱크·lesson `read_guard`. 신규는 `read_native_source_regeneration_init_ready`(초기화 READY 검증)뿐.
- **소유권 이전**: Player는 바인딩되면 같은 틱에 레거시 0.28 경로가 비활성(player.gd 731 기존 분기 — player.gd 무수정). 이중 회복 없음.
- 하니스 메타 `native_source_regeneration_boot="external"`(native_intro_boot 선례): fixture 단계(재생 테스트)·synthetic natural_regen 패킷(authority 테스트) 검증은 bind-1회 단일 소유 계약상 프로덕션 바인딩과 공존 불가 → 해당 테스트 main만 옵트아웃.
- 스냅샷 `automatic_regeneration_bound` 리터럴 false → 실값. 초기화 테스트 기대값 bound==true 정정(원본 상시 단계 근거). p2002a 레벨업 표시 대기 6→12f(30Hz `_refresh` 주기 여유 — 단정 불변).

### 검증
- `test_p2005d_regen_wiring` 10/0: bound·ready·clock_admitted>0, **ST 자연 0.00625/f = stR(0.05)/8 정밀 일치**(레거시 0.035 아님 단정), 돔 안 **0.2125/f = 플랫 0.2 + 자연×2** 정밀 일치, HP 플랫 회복.
- 웹 교차: 돔 밖 +0.375/s(기울기 일치; 주기적 −1.5 ST 하락은 P2-001d의 미특정 ~2s 장면 소스와 동일 — 기록), 돔 안 12.83/s ≈ 12.75.
- 기준선: 초기화 117/2(선재 movement 2만)·재생 88/0·시작 145/2·레슨 30/0·p2002a 36/0 복귀. authority 71/5(선재 6 → 5: 옵트아웃으로 자동리젠 간섭 1건 해소).

## B. 얼음보주 (iceOrb, Ctrl)

### 발동·상태 (native_skill_slots.gd)
| 항목 | 원본 | 포트 |
|---|---|---|
| 게이트 | 12916~12923: `_ioActive` 중 타 스킬 차단·재입력=파쇄·`mp>=mpCost&&_ioCd<=0` | 동일(차단 로그 reason=ice_orb_active; showPH 토스트 미이식 기록) |
| MP 비용 | 31992 `~~(50×(1+(lv−1)×.35)×pMagicCost)`·useMp 실소비 반환 | `read_native_fireball_magic_cost`(28041 단일 공급자) + authority 신규 `commit_native_skill_mana_spend` |
| 시전 | 46756~46764: `_ioBon=useMp×2`·`P.s='iceOrb'`·ice_storm(.6,2.0)·입자 12·shake4 | 동일. 상태는 player 신규 API `set_native_ice_orb_state`(idle↔iceOrb) |
| 무적·행동불가 | 34889s 전 피격 경로 `!P._ioActive`·33040 상태 강제 | player.gd 최소 수정 3건: `_apply_native_damage` 게이트 2줄·speed_scale "iceOrb" 1줄·상태 API 13줄 (**입력 처리 함수 무변경**; 공격은 기존 `state!="idle"` 579로 차단) |
| 자동 파쇄 | 36695 `_ioT>=120` | 동일. **Shift 블링크 탈출(36696~36706)=미이식 기록**(charge 입력 경로 미보유·레슨 담당 입력 작업과 경합 회피) |
| 쿨 | 46820 `max(600,1200−60(lv−1))`·36687 `-=sp+_hdCdBonus`(돔 가속 **적용**) | 동일 |

### 파쇄·칼날
- 46770~46772: 칼날 4+lv×4, `base=~~(magicRef×statInt×pMagicMul×_skMul(8+(lv−1)×3.2))+_ioBon`, 칼날/파쇄 각 `~~(base×0.3)`(칼날 min 1).
- 칼날 패킷(46782): spd 7~10·maxDist 3000·r12·pierce 0.95·EL.I — 보관처=어댑터 `_blades`(원본 pProjs; 흡수계 등 상호작용 시스템 이식 시 store 이관 기록). 비행=직진(유도 제외 35186)·벽 반사 magic ≤3회(35238~35246, `world.is_world_blocked`)·관통 롤 95%(35585, 로컬 RNG — 원본 Math.random 비추적).
- 히트(35399s): 집행자 `execute(dmg, ang, EL.I(2), {iceBlade, magic})` — elMul은 집행자 37614 단계 소유. 부가: chain_fly(.3,_r(1.2,.15)) 재생·비보스 `stunned=max(,30)`(35583)·`_iceShardRes+=0.10`(35584). magic_burst 히트 VFX 미이식 기록.
- 파쇄 AoE(46785~46792): r=(100+5lv)×lvScale, `hurtE(e,shatterDmg,ang,false,{},EL.I)` — opts `{}` 원문 그대로(블러드/임팩트 표시됨).

### 집행자 확장 (native_normal_enemy_hurte.gd)
- opts += `iceBlade`(42386/42396 _quiet·_quiet2: 피크 표시·피 스플래시 억제), `magic`(42417 `_isMagicDmg` 임팩트 생략 + 42309 크리 보정 critRateSpell 선택).
- **냉기 프리즌 42446~42460 이식**(기존 fail-closed halt 대체): atkEl==2 → 적 소유 `freeze_hit` 쓰기. 게이트(_frozen/_frozenImmune)·`_freezeMax=ib?500:100`·`_fzAdd=(ib?dmg×.3:dmg)×1(_iceResDown 아이스스톰 미이식=1 기록)×(1+_iceShardRes)`·발동 `_frozen=180`. ❄프리즌! 텍스트(파티클 12·_TXT_BUDGET 게이트 미이식 기록).
- 쉴드 상호작용은 원본 그대로: 42348 흡수 후 잔여 dmg만 42354 블록 진입 → **쉴드 잔존 적은 게이지 미축적**(테스트로 양쪽 분기 검증).

### 적 소유 (enemy.gd)
- 필드 `_freeze_gauge/_freeze_max/_frozen/_frozen_immune/_ice_shard_res` + 읽기 노출.
- 틱(38644~38657): 빙결 중 행동불가·charge 리셋(파란 틴트 미이식 기록)·해동 시 면역 ib?300:120·면역/파편저항(−0.002/f)/게이지(−0.3/f) 자연 감소.
- 쓰기 op `freeze_hit`(42447~42456 전체 소유·triggered 반환)·`ice_shard_res`(+0.10 cap 1.0).

### 렌더
- 보주: vfx_ice_orb.png(19355 등록 768² 9프레임 3열) — 형성 프레임 46746 `8×(1−t/60)` 인접 보간, 반경 `(P.r+32+sin(pπ)×10)×lvScale`×6.6, 2층(소스오버 .85+.1sin(p6)/lighter .2+.12sin(p8)).
- ADD 레이어 분리: 'screen'/'lighter' 시트는 자식 AdditiveLayer(BLEND_MODE_ADD), 파티클·칼날·플래시는 부모 source-over(원본 블렌드 구분 복원 — P2-005c에서 전체 ADD였던 것 정정).
- 칼날(59452~): 삼각 칼날 4층+엣지, 회전 ang+ms×0.012. 원본 6점 경로는 자기교차라 Godot 삼각분할 불가 → 동일 윤곽 4점 다트 근사(기록). 냉기 트레일 50%/f.
- 파쇄 VFX: 정순 0→8·frameTime 13(46811)·drawR=(P.r+32)×lvScale×6.6. 파쇄 입자 24+16(46794~46808).
- HUD: `skSlotCT` sweep(28316 cdMap). CT 활성(ac) 하이라이트 28499 미이식 기록.

### 검증
- `test_p2005d_ice_orb` **22/0**(격리 P2005D): 비용 50·_ioBon·s='iceOrb'·무적(피해 0)·타 스킬 차단+비용 미소비 / 120f 자동 파쇄·idle 복구·쿨 1200·칼날 8·피해식(base/30%)·AoE+칼날 hurtE·쉴드 분기별 프리즌 게이지·_iceShardRes·재시전 거부·skSlotCT sweep / **프리즌 직접 증명**: 쉴드 소진→EL.I 150→_frozen 180·빙결 중 게이트 스킵·행동불가·해동 후 면역 120f.
- 웹 교차(web_iceorb_shot.mjs): mpCost 50·spent 50·_ioBon 100·s='iceOrb'·자동 파쇄·ioCd 1156(=1200 감쇠)·iceBlade 8발·쉴드 잔존 프리즌 미발동 — 전항 일치.
- 화면: `_out/p2-005d/compare_iceorb_{orb,shatter}.png`(같은 위상 t=28/파쇄 직후 웹·Godot 합성)·godot_p2005d_iceorb.mp4.

### 미이식/경계 기록
Shift 블링크 탈출(36696~36706)·magic_burst 히트 VFX·CT 활성 하이라이트(28499)·유니크 u_d04 파쇄 회수(_uqS)·_iceResDown(아이스스톰)·빙결 파란 틴트·❄프리즌 파티클·프리즌 텍스트 예산 게이트·showPH 토스트·_addSkProf·iceMortar 합체 분기(미보유)·맵오브젝트 접촉 무적 경로(32800s — 맵오브젝트 미이식)·칼날 store 이관(상호작용 시스템 이식 시).

### 문서 정정 (코드 기준·근거)
- 2_1 §283/§446: 칼날 48발→4+Lv×4·baseDmg `(5+(Lv−1))`→`_skMul(8+(Lv−1)×3.2)`(44511)·+_ioBon·MP 50×…·파쇄 r 식·쉴드-게이지 규칙 추가.
- DPS표: COST_BASE/_COST_DPS 블록을 코드(31960~31979) 그대로 정정(구 250 모델 폐기)·iceOrb 행 전면 갱신.
