# PC-FIREBALL — 악의구(RMB) 투사체 배달 연결 2026-10-22

브랜치 `claude/pc-input-parity-20261022`. 사용자 직접 지적("악의구 같은 것도 안 나가고") P0.

## 1. 원인
- 실제 입력(OS 메시지 우클릭)으로 누르면 시전 시작 단계에서 거절됐다.
  - `native_fireball_phase._last = {"op":"cast_start","status":"OWNER_REJECTED","reason":"actual_fireball_delivery_not_ready"}`
  - `main.read_native_fireball_delivery_readiness() = {"ready":false,"reason":"actual_fireball_projectile_delivery_unbound"}`
- `main.native_fireball_delivery`(main.gd 69)를 대입하는 코드가 저장소 어디에도 없었다. `read_native_fireball_readiness` / `prepare_native_fireball_finish` 구현체도 없었다.
- 시전 producer(`port_modules/fireball_cast_source`), 비행 producer(`port_modules/fireball_flight_source`), authority의 시작·완료 쓰기(`native_source_resource_authority.apply_native_fireball_start/finish`)는 이미 있었다. 투사체를 만들어 월드에 넣고 비행시키는 배달 owner 하나만 비어 있었다.
- Mac WIP `native_fireball_world_consumer.gd`(10-17)는 World 시계·피해 owner 등이 NR이라 이번 연결에 쓰지 않았다.

## 2. 수정
| 파일 | 소유 | 내용 |
|---|---|---|
| `godot/scripts/native_fireball_delivery.gd` (신규) | PC | 배달 owner. `install_native_boot(main)`로 World 자식에 설치. `read_native_fireball_readiness()`, `prepare_native_fireball_finish(payload)` 구현. 투사체 노드가 물리 틱마다 원본 비행 producer `step()`을 부른다 |
| `godot/scripts/main.gd` | 공용(최소 훅 2줄) | `_install_native_attack_audio()` 다음 줄에 `native_fireball_delivery=...install_native_boot(self)`. `ATTACK_SAMPLE_PATHS`에 `"fireball"` 추가(33645 `playSample('fireball')`가 unloaded drop되던 것) |
| `godot/assets/sfx/attack_source/fireball.mp3`, `bullet_hit.mp3` | 원본 복사 | `sfx/magic/fireball.mp3`, `sfx/hit/bullet_hit.mp3` 원본 바이트 |
| `godot/assets/vfx/Arcane_Arcane_FBF_6x6.png`, `Dark_BasicImpact.png`, `vfx_magic_orb.png` | 원본 복사 | `assets/vfx/` 원본 바이트 |

### 원본 순서 대응
| 단계 | 원본 행 | Godot |
|---|---|---|
| RMB 홀드 → magicCast 진입, MP `useMp('magic')`, `_mpBon` | 28949~28958 | 기존 cast producer → authority `apply_native_fireball_start` (변경 없음) |
| magicCast st2 소진 → mdmg 계산·투사체 push·숙련·샘플·magicRecover st2=12 | 33638~33648 | 기존 cast producer `_finish_fireball` → authority `apply_native_fireball_finish` → **신규** `prepare_native_fireball_finish`가 패킷 노드 생성 → authority가 `world.add_child` |
| 비행(꼬리 링·유도 280/4프레임·성장 12→12×scale·거리 끝/벽 반사 3회) | 35176~35278 | 원본 대응 flight producer `step()` 그대로 |
| 직격: elMul·악의 약화 ×(1+0.3×단)·hurtE(패킷=opts) | 35397~35407, 24569~24578 | `hurt_enemy` → 기존 PC hurtE 실행자 `native_normal_enemy_hurte.execute`, opts 투영 `{kbMult:.1, magic:true}`(42272·42468: magic이면 maxDist 무시) |
| 직격 부수효과(bullet_hit .15·magic 넉백 kb×mult·약점 mult≥2 '약점!'+stunned 35·파티클 ELP[3]) | 35455~35485 | `hit_side_effects` |
| 폭발: r=explR, dmg=explDmg×elMul×악의약화, hurtE `{kbMult:.1}`, 중독 필드 | 24581~24599 | flight producer `_explode` + `apply_fireball_poison` |
| 폭발 시각: DarkSmoke 1.8 / Arcane 1.4(delay1) / Dark_BasicImpact 0.8 × clamp(√(r/80),.8,2.5), lighter, fireball 샘플 .9 _r(.7,.1), shake 5, 파편 12 ELC[3] | 24697~24719, TVFX2 54781~54797 | `_explode_visual` + `_VfxCanvas`(가산) |
| 그리기: 꼬리 리본(연기 .38/불꽃 .2×3/코어 .42/불씨), vfx_magic_orb 7×3·20f·r×5·lighter .85×fa | 24293~24304, 59153~59171 | `_Orb`(연기) + `_OrbAdd`(가산) |
| 히트스톱 | 32585 `G.hitStop=0` 상시 비활성 | 쓰지 않음(원본과 같음) |

## 3. 검증 (창 모드, 자기 worktree 창, OS 메시지 실입력)
- 시작 필드·레슨 스킵 후·적에서 약 300px: 우클릭 1회 → 상태 `idle → magicCast → magicRecover → idle`, 투사체 1발, 유도로 적을 맞히고 폭발.
- 수치: 직격 dmg **471**(웹 패킷 dmg 471과 같음), 폭발 기준 explDmg 282(웹 282), explR 80(웹 80), maxDist 400.
- MP: 시전 비용 10(웹과 같은 `mpCost('magic')` 경로). 1.4~3초 창에서 웹 −8.66, Godot −9.93(재생 포함, 최대 MP가 달라 재생량이 다름 — 아래 남은 차이).
- 비교 격자: `_out/pc-input-parity/compare/fireball_v2.jpg`, 대표 `docs/engine/parity_refs/full_sweep/fireball_v2.jpg`.

## 4. 남은 차이·미이식(기록)
- 중독 DOT 틱: 적 측 poison 틱 소비자가 없어 필드(poison/poisonT/poisonStk/_poisonPool)만 meta로 기록한다. 웹은 10초간 DOT 피해(관측: 웹 더미 −39 추가). **P1, PC 몫**.
- 필드몹(`_hurtFieldMobs`) 대상은 1-1에 연결된 owner가 없어 false.
- shQuery 순서는 `World.get_enemies()` 순서 근사, homing slot_index는 악의구끼리의 순서(웹은 pProjs 전체 순서).
- 비행 진행은 60Hz 물리 틱에 sp=World dt_sp(=1). 웹은 렌더 프레임마다 `_dtSp`.
- 시작 최대 MP·현재 MP가 웹(382/382)과 다르다(Godot 399~453, 현재 MP가 최대보다 낮게 시작). 시작 장비 랜덤 롤 영향인지 확인 필요 → 전수 목록에 등록.
- 시험 조준: 창 비포커스 상태에서 포인터 메시지로 조준해 첫 방향이 표적과 약 50° 어긋났고 유도로 맞았다(시험 인공물 가능성. 실플레이 조준 미확인).
