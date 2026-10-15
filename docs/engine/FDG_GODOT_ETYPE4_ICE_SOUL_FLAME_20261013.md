# FDG Godot etype4 ice soul_flame 첫 소비 — 2026-10-13

## 2026-10-13 · Godot Windows x64 미리보기 패키지

현행 패키지의 자원·수출 정본은 [Windows native preview](FDG_GODOT_WINDOWS_NATIVE_PREVIEW_20261013.md)이다. 현재 지원5/미이식11과 source 초기16·seed·배치·원수치를 유지한다. 아래 앞선 ice/외부 PNG·Windows 미전달 문단은 `3a30d539` 등 당시 checkpoint 이력이며, 이번 패키지는 그 후 필요한 물 자원과 한글 지원 데이터를 자체 포함한 기술 산출물이다. 실제 Windows 실행·시각 인수와 구분한다.

| 현행 범위 | 정확 소비 / 결과 |
|---|---|
| 원 물 PNG2 | `assets/vfx/water_blue_projectile_sheet.png` 501466B/SHA `81c7c640d429cb0ffda887cb4de0adf7e01f02435bcb369e517d2d94f81267af`, `Water_ImpactWater_Sheet.png` 186899B/SHA `6ce330a1a1a25f7ceb9bcf66987a547c92789ac085f860034dec17deea7710d9` → `godot/assets/vfx/`에 원본byte동일 2copy/합688365B, 새원본hash2. 기존body16/17·source16 hash/copy/reextract0, 이미지변형0 |
| 내부 texture 소비 | runtime animation/impact.texture 및 assets.resource=`res://assets/vfx/…`, external_original_file=false/packaged_original_copy=true, water dependency packaged=true/외부water의존0. 기존 `_original_texture(path:String)->Texture2D`는 static cache + ResourceLoader.exists/load(Texture2D)로 remap/압축 수출 대응. missing은 Sprite2D 할당 전 명시end, factory도 ResourceLoader.exists로 원자거절 |
| typed config / 역사 | ice config38013B/SHA `eeb448bc13e74784713497c5198c374911e56fbd6578e27ec03904214ec98435`. target/native_source_contract/native 수치·clock·crop·alpha1·impact/HP/slow/독립탄 불변. `source_config_creation_scope`·`original_source_dependency`는 최초 외부주소/원범위 보존. config scope/packaging의 export_completed=false는 자원 consumer 저장 당시 범위이며, 실제 최종수출 결과는 아래 artifact와 별도 receipt로 기록 |
| 수출 preset / build | `Windows Native Preview x64`, Windows Desktop/x86_64/all_resources/include_filter=*.json/exclude tests·tools·md·run.command, embed_pck=false/암호화false. `build_windows_preview.py --project --godot --template --output`는 외부 새출력만 허용하고 code/metadata stagecopy·assets/data symlink·원 PNG/source16 copyhash0. 기존cache240files/115796787B 보존, 실제 import는 새water2만; isolated editor/_sc_·전역설정0·main실행0 |
| 한글 support data | `project.godot`의 `internationalization/locale/include_text_server_data=true`와 builder 필수gate. 첫 PCK는 기본false/ICU누락이어서 완전 인수하지 않았고, 이1leaf만수리하여 import반복0으로 새PCK 수출. final `res://icudt_godot.dat` 4797472B/header144/DA27/CmnD. Windows release ICU stub의 별도데이터이며 한글 실제 glyph 관측과 구분 |
| 최종 EXE / PCK | EXE109268480B/SHA `d34d36f3be1a6c49c56525ae86469b92e4f417ddf0b43cf00dd80c385c4b0562`, 공식4.7.2.stable.official.ed1daf0bf release template와byte동일·PE AMD64/0x8664·PE32+/0x20b. final PCK121929956B/SHA `bd786be82167fd92ffdfc36e72fa2b79192c165eeaea354b1e56517eaf1ebf5d`, format4/engine4.7.2/288entries. first287대비 ICU1추가/project.binary1변경/제거0/기존286 저장size·MD5·flags metadata동일, payload PNG재hash0 |
| ZIP / 공개 실행 경로 | `EXODUSER-Godot-Preview-Windows-x64-20261013.zip`157457375B/SHA `321af5874f84805fef92b636920ef1989b35c2be7b5e3c757f281b1aa21ff6a7`, 6파일/풀면231301651B/ZIP CRC모두PASS. EXE+PCK+launch_windows.cmd+README-KO.txt+LICENSE-Godot.txt+COPYRIGHT-Godot.txt. 원 G:\\exoduser에덮어쓰기없이 새폴더에전부풀고 launcher 실행, fullscreen/Compatibility/max_fps240. 원게임save/API/node/server변경0 |
| 새 의미검사 | 실제firstPCK만 mount: water consumer/cache/missing처리/runtime pack dependency3 첫PASS/exit0/2.049584041초/assert0·미완0; loads130/active107/JSON9, expectedmissingstderr1/unexpected0. 추가ICU leaf firstFAIL2assert/exit1/.25572500000000004초→project export설정1leaf수리→그실패leaf만PASS/exit0/.25378241700000004초·assert0·stderr0. 새고유4 기술PASS, 최초성공3 반복0/기완료suite0/main/factory설치/물리/사용자report쓰기0 |
| 실제 실행 / 품질 경계 | Windows PE 실행·한글pixels·Windows입력/자연교전·최저1080p240FPS 미관측. 캡240은 실측240이 아니며 native60/physics interpolation/Compatibility/1920×1080 및 현재5/11 유지. 기존 인간 Mac fullscreen paused 앱/browser31/3333·3334질문승인대기 유지, 새소스 resident로드 소급0. fullQE/parry/blackBean Q반사·24원화/24FPS·전체FX/AI/장비 미완, 확정2_3 불변. **VISUAL VERDICT: RETOUCH** |

## 현재 제작 상태

고정 CH1 초기 목록의 `order8 / ch1_initial_009 / etype4 / ice / soul_flame` 한 record를 별도 actor/projectile과 원 player 감속 소비에 연결하는 단위다. 최종 제품의 실제 factory/world에서 지원5/미지원11을 확인했고 새 고유4개 검사를 마감했다. 최초 실행의 유효 완료는1 PASS/미완료1/실패2였으며 검사 환경 두 문제만 수리해 미완료·실패3개가 후속 PASS했다. 최초 marker2 PASS/2 FAIL을 최초4 PASS로 합산하지 않는다. 제품 코드 수리0·기존 성공 재실행0이며 공개 소비/시각/성능 완료를 뜻하지 않는다.

| 항목 | 현재 범위 / 경계 |
|---|---|
| parent / 백업 | parent `9a0ceb24`; 외부 `encounter-etype4-ice-soul-first/consumer-backup-before-docs/manifest.json`. factory SSOT HEAD/WORK102194B·SHA `999f6001175522d59b953c1ad5f87543339b500637fdf6f4c20f53e691de6360` byte exact; 새 두 파일 HEAD/WORK 부재는 부모 영수증 참조 |
| consumer 소유 | 새 `godot/tests/test_etype4_ice_soul_flame.gd`, 이 SSOT, 기존 factory SSOT에 후속 current 한 문단만. 생산 코드/config/README/primary docs/공통 prefix/Git은 다른 담당 소유 |
| 정확 원 record | order8/id `ch1_initial_009`/etype4/ice/soul_flame; HP875/ATK31, world `[4191.995760537684,340]`. 원16/full native_final337/support.runtime_supported=false/runtime=null 보존 |
| 지원 경계 | 기존 medium dark2+physical spine1+physical flesh1에 정확 ice record1을 추가해 actual world5/11 확인. 모든 type4/skin/element/affix 지원으로 확대0 |
| 현재 공개 앱 | 인간의 기존 source1 fullscreen paused Godot 및 browser31 유지. 새 source load/GUI input/launch/reload0·live observer/state/HP/좌표/clock 주입0 |
| 기존 증거 | 기존 고유4/4/3/3/5·JS·source16/PNG 검사와 공개 자료 재실행/재해시/재생산0 |
| 시각 / 성능 | **VISUAL VERDICT: RETOUCH**. 새 공개 플레이/픽셀/전체 AI 및 status pipeline/최소 Windows1080p240 미검증 |

## 1차 문서 / source oracle

| reference / 출처 | 이번 소비에서 구분할 계약 |
|---|---|
| `docs/8.0몬스터디자인/몬스터_공격시스템.md` | 공통 접촉/charge 및 waterBean 물·빙 마법탄. 이동탄 magic500..600px/s와 일반 projectile×2 피해·commit density 예외를 개체 피부색으로 바꾸지 않음 |
| `docs/9적ai패턴디자인/9_적AI패턴디자인.md` | d<800+LOS 알림·range400 단거리 분류/발사준비·실제 flow축 fallback. 원 source에 없는 near50..100 자동 알림/새 ticket·windup 진입을 만들지 않음 |
| `docs/5.0애니메이션파이프라인/몬스터_스킨_시스템.md` | 기존40종/8방향/256cell·4walk overlays와 원 source distance clock. 실제 soul cell3/scale/8방향·distance128의4walk frames를 확인;24장/24FPS 완성 주장0 |
| `docs/2_2 무기+활+속성시스템/2_2 무기+활+속성시스템.md` | 일반 속성 상태이상과 이번 waterBean의 player `_freezeSlow`를 구분. 모든 frozen/ice affix 상태 지원으로 확대하지 않음 |
| [factory 역사 정본](FDG_GODOT_ENCOUNTER_FACTORY_20261013.md) | 고정16/초기2지원 선언·원 raw snapshot과 이전 검사 chronology를 동결. 다음 capability만 별도로 기록 |
| source 담당의 최종 artifact oracle | raw `_iceOnHit=false`/mods[]; 공통 contact phys24, charge60→waterBean ice/magic raw37→global74. life120/.667/speed500..600/homing.00655. 최종 artifact/제품 READY 후 새4 고유 검사만 실행함 |

### 상태 효과 / 시간 분리

| source 경로 | 현재 확인한 값 / 순서 | 검증 범위 |
|---|---|---|
| 일반 접촉 | `trunc(31×.8)=24`, defaultphys. 얼음 개체라는 이유로 magic 또는 감속 추가0 | `ice_actor_packet`의 실제 actor→요청 sink에서 phys24·cold append0 확인 |
| water direct hit | outer iframe/literal charge gate 통과 뒤 hurtP→`_freezeSlow=max(existing,60)`. hurtP 내부 반환/피해 성과와 상태 append를 혼동하지 않음 | 실제 projectile→거절 요청 sink에서 damage74/magic→slow60 순서·outer iframe/charge gate 확인. full player status pipeline 증거는 아님 |
| player idle | R33640 decrement→R33656 양수이면.5: full60은59번 idle update half speed,60번째0/fullspeed | public method 부여→headless fixture move_right action→real physics/velocity·실제 이동의59half/60full 확인 |
| 다른 player 상태 | attack/recover/stagger/기검windup에는 감속 clock 감소0. literal source charge와 기검참 hold는 별도 상태 | public request_attack/release_attack 콤보로 상태를 얻고 private field를 강제하지 않음 |
| mod iceOnHit | 원값false/mods[] early return; eModHitP35%/90 modifier 효과를 자동 추가0 | 원 선언 false/mods[] 및 consumer 경계 보존 확인; 별도 modifier 효과 활성화0 |
| projectile lifetime | R35288–90 update 시작 cam>2500이면 life 감소 전 recycle. life120−.667×ticks; R35367 non-redBean water의 life≤0이면 camera2500 내 life1 연장 후 같은 update 계속 | 새 독립 projectile의 near180번째life1 연장·far2501px 선행 정리 확인. physical redBean의 즉시 만료와 구분 |
| water homing / 이동 | R35389 life>30에서만.00655rad/tick; R35429–31 velocity×ticks로 위치 증가(추가×2 없음). 연장탄은 현재 heading 직진 | 실제 birth speed500..600px/s·첫 회전.00655·135번째life29.955 뒤 heading 유지·180번째near 연장 확인 |
| runtime asset dependency | 기존 W의 water flight와 Water_Impact PNG2개를 외부 경로에서 실제 runtime load; source copy/hash/import0 | actual WaterFlight/WaterImpact texture 소비 확인; PNG copy/hash/import0·portable export 미포장 |

## 최종 source/config 수치 계약

| artifact / 현행 | exact 값 / 경계 |
|---|---|
| source config | `godot/data/etype4_ice_soul_flame.json`, 33672B/SHA `90f3ab523a7f9539437c2335c64db1eca6f93e3f87c060ba51df2ad48fc8706a` |
| source receipt | 외부 `source-soul-contract-receipt.json`, 50982B/SHA `3639f77986fc86cbb33e9da018df25faad623261d152e1943b9865e6a83db537` |
| 初期 artifact history | 최초config33508B/SHA `7fb035686fbbfc8bdd49d60e22503a4a9071590be082956a81905469afdb49db`, receipt48429B/SHA `5a91ef6e341dfade2290e0579e3a0ad62f57d5091402194ba5380204b49e502c`는 생산 당시 이력 |
| currentmetadata 명료화 | cfg의 water flight alpha_rule=1/life미fade 및 source R54547 추가2path만. runtime 숫자/target/assets/337raw/27subset 불변. 원 cfg의 decay→expiry→homing→move 순서는 원래 정확했고 중간 전달 오류만 정정. 외부 currentmetadata-correction-receipt.json 참조 |
| 원 frozen 선언 | record order8 full native_final337 및 support.runtime_supported=false/runtime=null 동결; runtime53/subset27/initial_timers197을 별도 소비 |
| 완료 상태 | source/config·제품 READY 후 새 고유4개 모두 유효 완료. 최초 완료1/미완료1/실패2→fixture만 수리→후속3 PASS. config 생성 당시 verification pending은 현재 검사 결과로 소급수정하지 않음 |

### runtime / animation / projectile 전체 leaf

| config path | exact 값 | 소비 / 한계 |
|---|---|
| `runtime.id` | `"ch1_initial_009"` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.order` | `8` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.name` | `"native etype 4"` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.etype` | `4` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.element` | `"ice"` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.element_id` | `2` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.stage` | `0` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.level` | `1` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.difficulty` | `"NORMAL"` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.spawn_position` | `[4191.995760537684,340]` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.requested_spawn_position` | `[4191.995760537684,340]` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.hp` | `875` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.attack` | `31` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.radius` | `34.87446582969278` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.speed_pixels_per_tick` | `0.32862369619309906` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.native_tick_rate` | `60` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.poise` | `875` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.max_poise` | `875` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.poise_regen_ticks` | `200` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.poise_regen_fraction` | `0.15` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.initial_idle_ticks` | `44.74301584530622` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.initial_projectile_ticks` | `294.2270742729306` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.projectile_cooldown_ticks` | `240` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.initial_facing` | `3.801742677476639` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.elite` | `0` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.mods` | `[]` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.aura` | `null` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.initial_spawn_fade_ticks` | `20` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.aggro_range` | `800` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.pursuit_stop_distance` | `30` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.idle_movement_multiplier` | `1.6` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.contact_extra_radius` | `8` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.contact_damage_multiplier` | `0.8` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.contact_cooldown_min_ticks` | `40` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.contact_cooldown_random_ticks` | `20` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.hit_stun_ticks` | `8` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.projectile_charge_ticks` | `60` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile_range` | `400` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.windup_ticks` | `null` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.attack_ticks` | `8` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.recovery_ticks` | `35` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.factory_random_seed` | `2062072998` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.animation.kind` | `"native-ch1-eight-direction-atlas"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.skin` | `"soul_flame"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.resources_copied` | `true` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.cell_size` | `[256,256]` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.atlas_columns` | `8` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.atlas_rows` | `5` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.column` | `3` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.row` | `0` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.draw_height` | `244.12126080784947` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.native_pivot` | `[0.5,0.5]` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.base_textures.south` | `"res://assets/enemy/atlas_ch1_8dir_south.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.base_textures.south-east` | `"res://assets/enemy/atlas_ch1_8dir_south_east.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.base_textures.east` | `"res://assets/enemy/atlas_ch1_8dir_east.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.base_textures.north-east` | `"res://assets/enemy/atlas_ch1_8dir_north_east.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.base_textures.north` | `"res://assets/enemy/atlas_ch1_8dir_north.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.base_textures.north-west` | `"res://assets/enemy/atlas_ch1_8dir_north_west.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.base_textures.west` | `"res://assets/enemy/atlas_ch1_8dir_west.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.base_textures.south-west` | `"res://assets/enemy/atlas_ch1_8dir_south_west.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.source_relative_base_textures.south` | `"img/atlas_ch1_8dir_south.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.source_relative_base_textures.south-east` | `"img/atlas_ch1_8dir_south_east.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.source_relative_base_textures.east` | `"img/atlas_ch1_8dir_east.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.source_relative_base_textures.north-east` | `"img/atlas_ch1_8dir_north_east.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.source_relative_base_textures.north` | `"img/atlas_ch1_8dir_north.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.source_relative_base_textures.north-west` | `"img/atlas_ch1_8dir_north_west.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.source_relative_base_textures.west` | `"img/atlas_ch1_8dir_west.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.source_relative_base_textures.south-west` | `"img/atlas_ch1_8dir_south_west.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.walk_supported` | `true` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.walk_frames` | `4` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.walk_pixels_per_frame` | `128` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.walk_textures.south` | `"res://assets/enemy/atlas_ch1_8dir_walk_south.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.walk_textures.south-east` | `"res://assets/enemy/atlas_ch1_8dir_walk_south_east.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.walk_textures.east` | `"res://assets/enemy/atlas_ch1_8dir_walk_east.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.walk_textures.north-east` | `"res://assets/enemy/atlas_ch1_8dir_walk_north_east.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.walk_textures.north` | `"res://assets/enemy/atlas_ch1_8dir_walk_north.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.walk_textures.north-west` | `"res://assets/enemy/atlas_ch1_8dir_walk_north_west.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.walk_textures.west` | `"res://assets/enemy/atlas_ch1_8dir_walk_west.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.walk_textures.south-west` | `"res://assets/enemy/atlas_ch1_8dir_walk_south_west.png"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.direction_angle_sectors` | `["east","south-east","south","south-west","west","north-west","north","north-east"]` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.direction_rounding` | `"round(normalize_0_to_2pi(facing)/(PI/4)) mod 8"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.base_and_walk_overlay` | `true` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.walk_frame_rule` | `"floor(_walkDist / 128) mod 4"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.walk_distance_origin` | `0` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.native_pivot_pixels` | `[128,128]` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.anatomical_foot_pivot` | `null` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.texture_filter` | `"nearest"` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.animation_time_driven` | `false` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.unique_attack_animation` | `false` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.unique_death_animation` | `false` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.native_sprite_source` | `["game.html:23832","game.html:23847","game.html:54119","game.html:54129","game.html:54131"]` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.resources_reused_from_previous_copy` | `true` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.base_rect` | `[768,0,256,256]` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.animation.walk_frame_rects` | `[[3072,0,256,256],[3328,0,256,256],[3584,0,256,256],[3840,0,256,256]]` | 원 soul_flame body+walk overlay; PNG/알파/모델 시각 검수 대체0 |
| `runtime.facing` | `3.801742677476639` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.ai_profile` | `"native_ch1_etype4_ice_soul_flame_v1"` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.eShield` | `875` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.eShieldMax` | `875` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.eRes` | `[0,0,0,0,0,0,0]` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.native_flags.ib` | `false` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.native_flags.elite` | `0` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.native_flags.mods` | `[]` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.native_flags.aura` | `null` | 별도 actor configure/source field; 원 generic/full special 시스템 활성화 선언 아님 |
| `runtime.projectile.element` | `"ice"` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.element_id` | `2` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.parry_class` | `"magic"` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.native_dtype` | `"magic"` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.native_birth_position` | `"actor-center"` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.base_damage` | `37` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.contact_damage` | `74` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.size` | `3.2` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.radius` | `5.2` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.contact_margin` | `13.6` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.contact_margin_rule` | `"size * 3 + 4; add player collision radius"` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.life_ticks` | `120.0` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.life_decay_per_tick` | `0.667` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.speed_pixels_per_second` | `[500,600]` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.speed_roll_rule` | `"500 + (600 - 500) * random"` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.position_advance_rule` | `"world_xy += velocity_pixels_per_native_tick * sp"` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.homing_radians_per_tick` | `0.00655` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.homing_until_life` | `30.0` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.waterBean` | `true` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.redBean` | `false` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.homing` | `true` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.commit` | `true` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.drop_exempt` | `true` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.col` | `"#317cec"` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.player_knockback_pixels_per_tick` | `2.0` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.camera_cull_distance` | `2500.0` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.camera_cull_before_life_decay` | `true` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.nonred_near_camera_life_extension` | `true` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.expired_near_camera_life_ticks` | `1.0` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.expiry_condition` | `"life <= 0 and distance_to_native_camera > 2500; at start camera cull applies first"` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.homing_after_near_camera_extension` | `false` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.animation.texture` | `"res://../assets/vfx/water_blue_projectile_sheet.png"` | 기존 외부 water flight 원 PNG·현재 renderer 입력; portable export 미포장 |
| `runtime.projectile.animation.external_original_file` | `true` | 기존 외부 water flight 원 PNG·현재 renderer 입력; portable export 미포장 |
| `runtime.projectile.animation.loader` | `"Image.load_from_file(ProjectSettings.globalize_path(texture)) then ImageTexture.create_from_image"` | 기존 외부 water flight 원 PNG·현재 renderer 입력; portable export 미포장 |
| `runtime.projectile.animation.columns` | `4` | 기존 외부 water flight 원 PNG·현재 renderer 입력; portable export 미포장 |
| `runtime.projectile.animation.rows` | `2` | 기존 외부 water flight 원 PNG·현재 renderer 입력; portable export 미포장 |
| `runtime.projectile.animation.flight_frames` | `8` | 기존 외부 water flight 원 PNG·현재 renderer 입력; portable export 미포장 |
| `runtime.projectile.animation.cell_size_rule` | `["image_width / 4","image_height / 2"]` | 기존 외부 water flight 원 PNG·현재 renderer 입력; portable export 미포장 |
| `runtime.projectile.animation.frame_rule` | `"positive_mod(native_now_milliseconds * .012 + world_x * .04 + world_y * .025, 8)"` | 기존 외부 water flight 원 PNG·현재 renderer 입력; portable export 미포장 |
| `runtime.projectile.animation.frame_column_rule` | `"trunc(frame) % 4"` | 기존 외부 water flight 원 PNG·현재 renderer 입력; portable export 미포장 |
| `runtime.projectile.animation.frame_row_rule` | `"0 if frame < 4 else 1"` | 기존 외부 water flight 원 PNG·현재 renderer 입력; portable export 미포장 |
| `runtime.projectile.animation.crop_height_rule` | `"min(cell_height - 1, cell_height * .255)"` | 기존 외부 water flight 원 PNG·현재 renderer 입력; portable export 미포장 |
| `runtime.projectile.animation.crop_y_rule` | `"min(row * cell_height + cell_height * (.10 if row else .675), row * cell_height + cell_height - crop_height)"` | 기존 외부 water flight 원 PNG·현재 renderer 입력; portable export 미포장 |
| `runtime.projectile.animation.height` | `44.8` | 기존 외부 water flight 원 PNG·현재 renderer 입력; portable export 미포장 |
| `runtime.projectile.animation.width` | `84.0` | 기존 외부 water flight 원 PNG·현재 renderer 입력; portable export 미포장 |
| `runtime.projectile.animation.native_scale` | `2.8` | 기존 외부 water flight 원 PNG·현재 renderer 입력; portable export 미포장 |
| `runtime.projectile.animation.draw_scale_rule` | `"clamp(size * 1.5, 1.2, 4) * .7; magic multiplier 1"` | 기존 외부 water flight 원 PNG·현재 renderer 입력; portable export 미포장 |
| `runtime.projectile.animation.native_draw_rect` | `[-45.36,-22.4,84.0,44.8]` | 기존 외부 water flight 원 PNG·현재 renderer 입력; portable export 미포장 |
| `runtime.projectile.animation.rotation_rule` | `"atan2(vy,vx)"` | 기존 외부 water flight 원 PNG·현재 renderer 입력; portable export 미포장 |
| `runtime.projectile.animation.composite_operation` | `"lighter"` | 기존 외부 water flight 원 PNG·현재 renderer 입력; portable export 미포장 |
| `runtime.projectile.animation.alpha_rule` | `"1.0 for exact hostile waterBean (mine=false,bomb=false); fa=(mine\|\|bomb)?min(1,life/(ml\|\|60)):1; life does not fade, including near-camera life=1 extension"` | 기존 외부 water flight 원 PNG·현재 renderer 입력; portable export 미포장 |
| `runtime.projectile.animation.source` | `["game.html:24516","game.html:24520","game.html:24523","game.html:24524","game.html:24525","game.html:24526","game.html:24527","game.html:24528","game.html:54666","game.html:54671","game.html:54716","game.html:54547"]` | 기존 외부 water flight 원 PNG·현재 renderer 입력; portable export 미포장 |
| `runtime.projectile.impact.texture` | `"res://../assets/vfx/Water_ImpactWater_Sheet.png"` | 실제 WaterImpact sheet 소비; 아래 API/검사 범위 참조. 공개 FX/픽셀 검수0 |
| `runtime.projectile.impact.external_original_file` | `true` | 실제 WaterImpact sheet 소비; 아래 API/검사 범위 참조. 공개 FX/픽셀 검수0 |
| `runtime.projectile.impact.loader` | `"Image.load_from_file(ProjectSettings.globalize_path(texture)) then ImageTexture.create_from_image"` | 실제 WaterImpact sheet 소비; 아래 API/검사 범위 참조. 공개 FX/픽셀 검수0 |
| `runtime.projectile.impact.columns` | `4` | 실제 WaterImpact sheet 소비; 아래 API/검사 범위 참조. 공개 FX/픽셀 검수0 |
| `runtime.projectile.impact.rows` | `4` | 실제 WaterImpact sheet 소비; 아래 API/검사 범위 참조. 공개 FX/픽셀 검수0 |
| `runtime.projectile.impact.frames` | `16` | 실제 WaterImpact sheet 소비; 아래 API/검사 범위 참조. 공개 FX/픽셀 검수0 |
| `runtime.projectile.impact.radius` | `72.0` | 실제 WaterImpact sheet 소비; 아래 API/검사 범위 참조. 공개 FX/픽셀 검수0 |
| `runtime.projectile.impact.duration_ticks` | `66.0` | 실제 WaterImpact sheet 소비; 아래 API/검사 범위 참조. 공개 FX/픽셀 검수0 |
| `runtime.projectile.impact.frame_rule` | `"min(15, trunc(clamp(elapsed_ticks / duration_ticks, 0, 1) * 16))"` | 실제 WaterImpact sheet 소비; 아래 API/검사 범위 참조. 공개 FX/픽셀 검수0 |
| `runtime.projectile.impact.draw_size_rule` | `"radius * 3 * sqrt(min(1, elapsed_fraction * 3))"` | 실제 WaterImpact sheet 소비; 아래 API/검사 범위 참조. 공개 FX/픽셀 검수0 |
| `runtime.projectile.impact.max_draw_size` | `216.0` | 실제 WaterImpact sheet 소비; 아래 API/검사 범위 참조. 공개 FX/픽셀 검수0 |
| `runtime.projectile.impact.alpha_rule` | `"max(0, 1 - elapsed_fraction * .5)"` | 실제 WaterImpact sheet 소비; 아래 API/검사 범위 참조. 공개 FX/픽셀 검수0 |
| `runtime.projectile.impact.source_center` | `"actual projectile collision world position"` | 실제 WaterImpact sheet 소비; 아래 API/검사 범위 참조. 공개 FX/픽셀 검수0 |
| `runtime.projectile.impact.shard_count` | `10` | 원 source metadata만 보존; 보조 shard/shake/flash 실제 소비 미이식 |
| `runtime.projectile.impact.shake` | `6` | 원 source metadata만 보존; 보조 shard/shake/flash 실제 소비 미이식 |
| `runtime.projectile.impact.flash_color` | `"#8ed8ff"` | 원 source metadata만 보존; 보조 shard/shake/flash 실제 소비 미이식 |
| `runtime.projectile.impact.flash_alpha` | `0.15` | 원 source metadata만 보존; 보조 shard/shake/flash 실제 소비 미이식 |
| `runtime.projectile.impact.source` | `["game.html:9094","game.html:9095","game.html:9096","game.html:9099","game.html:57501","game.html:57514","game.html:57593","game.html:57594","game.html:57596","game.html:57598","game.html:57600","game.html:57601","game.html:57603"]` | 실제 WaterImpact sheet 소비; 아래 API/검사 범위 참조. 공개 FX/픽셀 검수0 |
| `runtime.projectile.freeze_slow.duration_ticks` | `60.0` | 물 탄 접촉 후 player slow API 및 idle clock |
| `runtime.projectile.freeze_slow.movement_multiplier` | `0.5` | 물 탄 접촉 후 player slow API 및 idle clock |
| `runtime.projectile.freeze_slow.append_rule` | `"max(existing,60)"` | 물 탄 접촉 후 player slow API 및 idle clock |
| `runtime.projectile.freeze_slow.decrement_only_native_player_state` | `"idle"` | 물 탄 접촉 후 player slow API 및 idle clock |
| `runtime.projectile.freeze_slow.decrement_before_movement` | `true` | 물 탄 접촉 후 player slow API 및 idle clock |
| `runtime.projectile.freeze_slow.uninterrupted_idle_half_speed_updates` | `59` | 물 탄 접촉 후 player slow API 및 idle clock |
| `runtime.projectile.freeze_slow.full_speed_on_idle_update` | `60` | 물 탄 접촉 후 player slow API 및 idle clock |
| `runtime.projectile.freeze_slow.non_idle_timer_frozen` | `true` | 물 탄 접촉 후 player slow API 및 idle clock |
| `runtime.projectile.freeze_slow.independent_of_hurtP_acceptance_after_outer_contact` | `true` | 물 탄 접촉 후 player slow API 및 idle clock |
| `runtime.projectile.freeze_slow.api` | `"apply_native_freeze_slow(duration_ticks:float)->bool"` | 물 탄 접촉 후 player slow API 및 idle clock |
| `runtime.projectile.freeze_slow.getter` | `"get_native_freeze_slow_ticks()->float"` | 물 탄 접촉 후 player slow API 및 idle clock |
| `runtime.projectile.freeze_slow.snapshot_field` | `"freeze_slow_ticks"` | 물 탄 접촉 후 player slow API 및 idle clock |
| `runtime.projectile.freeze_slow.api_return` | `"whether duration was extended"` | 물 탄 접촉 후 player slow API 및 idle clock |
| `runtime.projectile.freeze_slow.source` | `["game.html:35710","game.html:35713","game.html:33632","game.html:33640","game.html:33656","game.html:33658"]` | 물 탄 접촉 후 player slow API 및 idle clock |
| `runtime.projectile.resource_missing_is_admission_error` | `true` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.portable_export_dependency_packaged` | `false` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.projectile.source` | `["game.html:20574","game.html:20578","game.html:20592","game.html:20593","game.html:17300","game.html:17305","game.html:17315","game.html:17357","game.html:17368","game.html:17370","game.html:17374","game.html:17665","game.html:17675","game.html:35288","game.html:35293","game.html:35367","game.html:35389","game.html:35429","game.html:35469","game.html:35475","game.html:35665","game.html:35693","game.html:35710","game.html:35713"]` | 별도 ice projectile의 실제 packet/lifecycle 입력 |
| `runtime.native_type_traits.undead` | `true` | 원 etype4 undead·baseline antiRevive0; nonzero affix 미포트 |
| `runtime.native_type_traits.source_undead_set` | `"game.html:25106"` | 원 etype4 undead·baseline antiRevive0; nonzero affix 미포트 |
| `runtime.native_type_traits.source_antiRevive_bonus` | `"game.html:42800"` | 원 etype4 undead·baseline antiRevive0; nonzero affix 미포트 |
| `runtime.native_type_traits.baseline_antiRevive` | `0` | 원 etype4 undead·baseline antiRevive0; nonzero affix 미포트 |
| `runtime.native_type_traits.nonzero_antiRevive_modifier_ported_by_this_unit` | `false` | 원 etype4 undead·baseline antiRevive0; nonzero affix 미포트 |

### 원 native_final subset27 / 초기 timer197

| 원 origin path | exact 값 | 경계 |
|---|---|
| `runtime.native_final.x` | `4191.995760537684` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final.y` | `340` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final.hp` | `875` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final.mhp` | `875` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final.atk` | `31` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final.r` | `34.87446582969278` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final.speed` | `0.32862369619309906` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final.s` | `"idle"` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final.st2` | `44.74301584530622` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final.alive` | `true` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final.facing` | `3.801742677476639` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final.stunned` | `0` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final.poise` | `875` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final.maxPoise` | `875` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final.poiseR` | `0` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final.eShield` | `875` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final.eShieldMax` | `875` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final.eShieldRegenT` | `0` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final.eRes` | `[0,0,0,0,0,0,0]` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final.kb` | `{"x":0,"y":0}` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final.projT` | `294.2270742729306` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final.projCd` | `240` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final._spawnT` | `20` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final._mobCh` | `1` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final._mob8Col` | `3` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final._mob8Row` | `0` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.native_final._mob8dir` | `true` | 고정 원 record337 중 소비 subset. 원 snapshot을 덮어쓰지 않음 |
| `runtime.initial_timers`: `poiseR`, `chargeT`, `eShieldRegenT`, `bleedT`, `poisonT`, `burnT`, `_tpWarnT`, `_patrolT` | `0` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `_bossStrafeCd`, `_obsGuardT`, `_fsBurrowT`, `_fsGrabT`, `_dragonBreathT`, `_dragonFlyT`, `_seaGrabT`, `_crabGuardT` | `0` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `_eelBurrowT`, `_eelGrabT`, `_ppSelfDestT`, `_teGrindT`, `_kaFlyT`, `_rkComboCd`, `_rkParryCd`, `_rkDodgeCd` | `0` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `_tmCounterCd`, `_tsSlowT`, `_grAbsorbCd`, `_twRotT`, `_twReviveT`, `_deathT` | `0` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `st2` | `44.74301584530622` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `projCd` | `240` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `projT` | `294.2270742729306` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `chargeCd`, `bossPatCd`, `shieldBashCd`, `shieldBashT`, `summonCd`, `summonT`, `teleportCd`, `teleportT` | `9999` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `bombCd`, `bombT`, `reviveCd`, `reviveT`, `stealthCd`, `stealthT`, `wombCd`, `wombT` | `9999` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `webCd`, `webT`, `swoopCd`, `swoopT`, `trapCd`, `trapT`, `motherCd`, `motherT` | `9999` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `slamCd`, `slamT`, `_iceChargeCd`, `_iceChargeT`, `_iceSwoopCd`, `_iceSwoopT`, `_iceSlimeCd`, `_iceSlimeT` | `9999` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `_iceSlamCd`, `_iceSlamT`, `_iceBlizzCd`, `_iceBlizzT`, `_wildChargeCd`, `_wildChargeT`, `_boulderSlamCd`, `_boulderSlamT` | `9999` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `_poisonZoneCd`, `_poisonZoneT`, `_beastComboCd`, `_beastComboT`, `_beastRoarCd`, `_beastRoarT`, `_serpentZigCd`, `_serpentZigT` | `9999` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `_predStealthCd`, `_predStealthT`, `_broodSpawnCd`, `_broodSpawnT`, `_broodGasCd`, `_broodGasT`, `_elderRoarCd`, `_elderRoarT` | `9999` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `_elderChargeCd`, `_elderChargeT`, `_elderSlamCd`, `_elderSlamT`, `_wraithPhaseT`, `_wraithPhaseCd`, `_dkGuardCd`, `_dkGuardT` | `9999` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `_dkSlashCd`, `_dkSlashT`, `_fmAbsorbCd`, `_fmSpitCd`, `_fmSpitT`, `_ddLungeCd`, `_ddLungeT`, `_torChainCd` | `9999` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `_torChainT`, `_wdSwoopCd`, `_wdSwoopT`, `_pillarRingCd`, `_pillarRingT`, `_pillarAoeCd`, `_pillarAoeT`, `_stCloneCd` | `9999` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `_stCloneT`, `_stTpCd`, `_hpHealCd`, `_hpHealT`, `_hpBuffCd`, `_hpProjCd`, `_adFireCd`, `_adFireT` | `9999` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `_adSummonCd`, `_adChargeCd`, `_adSlamCd`, `_adSlamT`, `_erraticT`, `_tongueCd`, `_tongueT`, `_gazeCd` | `9999` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `_gazeT`, `_hangCd`, `_hangT`, `_boneChargeCd`, `_boneChargeT`, `_bloodCd`, `_bloodT`, `_overlordCd` | `9999` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `_volcBombCd`, `_volcBombT`, `_fireBatSwoopCd`, `_fireBatSwoopT`, `_obsGuardCd`, `_fsBurrowCd`, `_lavaGiantSlamCd`, `_lavaGiantSlamT` | `9999` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `_flPriestRevCd`, `_flPriestRevT`, `_flPriestBuffCd`, `_dragonBreathCd`, `_dragonFlyCd`, `_dragonMeteorCd`, `_seaGrabCd`, `_seaSpitCd` | `9999` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `_anglerLureCd`, `_jellyParaCd`, `_jellyZapCd`, `_crabGuardCd`, `_crabSlamCd`, `_eelBurrowCd`, `_coralSpikeCd`, `_coralProjCd` | `9999` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `_sirenSongCd`, `_sirenDashCd`, `_levChargeCd`, `_levTailCd`, `_levParaCd`, `_abyssTentCd`, `_abyssTridCd`, `_abyssWhirlCd` | `9999` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `_abyssSumCd`, `_abyssTideCd`, `_ppRushCd`, `_tePullCd`, `_bpDrainCd`, `_psCreamCd`, `_psGrabCd`, `_psSpawnCd` | `9999` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `_dkComboCd`, `_dkDodgeCd`, `_dkParryCd`, `_iaSpearCd`, `_iaBurstCd`, `_jdScaleCd`, `_jdPillarCd`, `_jdExecCd` | `9999` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `_kaSwordCd`, `_kaTentCd`, `_kaFlyCd`, `_kaBeamCd`, `_kaSumCd`, `_tsTpCd`, `_drTpCd`, `_drRiftCd` | `9999` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `_drSumCd`, `_deathScCd` | `9999` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `bossPatT` | `44.85538443084806` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |
| `runtime.initial_timers`: `_spawnT` | `20` | 원197 clock 보존; 해당 특수 시스템 신규 지원 선언 아님 |

### source 분기 / 미이식 scope

| config path | exact 값 | 출처 / 한계 |
|---|---|
| `native_source_contract.source_root` | `"/Users/fordeargamers/Projects/exoduser-migration-20261001"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.source_file` | `"game.html"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.canonical_revision_reference_from_parent` | `"9a4534b42f74093095ebc3364a25dd104e93b379"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.source_revision_rehashed` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.snapshot` | `"/Users/fordeargamers/the-exoduser/godot/data/encounters.json"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.snapshot_is_frozen` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.snapshot_rehashed` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.raw_factory_not_reexecuted` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.target_native_arguments` | `[4191.995760537684,340,0,4,false,2,-1]` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.factory_random_seed` | `2062072998` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.rng_begin` | `105` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.rng_end` | `114` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.tick_seconds` | `0.016666666666666666` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.aggro.range` | `800` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.aggro.automatic_idle_recover_alert_requires_los` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.aggro.automatic_idle_recover_alert_condition` | `"!e._alerted && d < 800 && (e.s === 'idle' \|\| e.s === 'recover') && hasLOS(e.x,e.y,P.x,P.y)"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.aggro.near_idle_recover_alert_branch_exists_in_current_source` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.aggro.never_release_on_distance` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.aggro.initial_native_alerted_field` | `"absent in the frozen native_final; falsey comparison, not a literal stored false flag"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.aggro.far_unalerted_nonboss_return_distance` | `400` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.aggro.far_unalerted_nonboss_return_condition` | `"!_chgCommit && !e._alerted && !e.ib && d > 400"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.aggro.far_return_runs_after_existing_projectile_charge_tick` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.movement.native_speed_pixels_per_tick` | `0.32862369619309906` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.movement.range` | `400` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.movement.pursuit_stop_distance` | `30` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.movement.flow_field_multiplier` | `1` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.movement.idle_multiplier` | `1.6` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.movement.aura_speed_multiplier_baseline` | `1` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.movement.both_flow_and_idle_paths_exist` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.movement.collision_radius` | `34.87446582969278` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.movement.flow_collision_function` | `"canMv"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.movement.flow_axis_fallback` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.movement.full_native_pathfinding_culling_separation_parity_claim` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.movement.flow_axis_fallback_order` | `["both_xy","x_only","y_only"]` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.movement.flow_axis_fallback_success_resets_stuckT` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.movement.flow_axis_fallback_x_only_last_direction._lastFdx` | `"dx"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.movement.flow_axis_fallback_x_only_last_direction._lastFdy` | `0` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.movement.flow_axis_fallback_y_only_last_direction._lastFdx` | `0` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.movement.flow_axis_fallback_y_only_last_direction._lastFdy` | `"dy"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.movement.flow_axis_fallback_source` | `"game.html:32579-32581"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.normal_idle.contact_extra_radius` | `8` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.normal_idle.contact_requires_player_iframes_nonpositive` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.normal_idle.contact_requires_st2_nonpositive` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.normal_idle.contact_damage_multiplier` | `0.8` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.normal_idle.contact_damage` | `24` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.normal_idle.contact_dtype` | `"phys"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.normal_idle.contact_cooldown_ticks` | `"40 + trunc(random*20)"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.normal_idle.contact_cooldown_min` | `40` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.normal_idle.contact_cooldown_max_inclusive` | `59` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.normal_idle.projectile_initial_timer` | `294.2270742729306` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.normal_idle.projectile_cooldown` | `240` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.normal_idle.projectile_charge` | `60` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.normal_idle.projectile_charge_bean` | `"water"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.normal_idle.projectile_charge_parry_class` | `"magic"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.normal_idle.projectile_actor_center` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.normal_idle.automatic_melee_windup` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.normal_idle.tank_specific_active_attack_branch_found` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.normal_idle.tank_label_renderer_is_not_AI` | `"game.html:20874"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.conditional_melee.entry` | `"eCircle + atkTicketRequest only in existing source"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.conditional_melee.windup_ticks` | `35` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.conditional_melee.attack_ticks` | `8` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.conditional_melee.hit_threshold_crossing` | `5` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.conditional_melee.recovery_ticks` | `35` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.conditional_melee.auto_entry_ported` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.conditional_melee.new_attack_ticket_implemented` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.eShield_initial` | `875` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.eShield_max` | `875` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.eShield_regen_initial_timer` | `0` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.eRes` | `[0,0,0,0,0,0,0]` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.type4_armored_flat_or_percent_reduction_branch_found` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.type4_undead_bonus.formula` | `"trunc(dmg * (1 + _eqAffix(antiRevive)))"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.type4_undead_bonus.applied_after_STR` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.type4_undead_bonus.raw_baseline_affix` | `0` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.type4_undead_bonus.nonzero_modifier_ported_here` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.shield_after_final_damage_multipliers` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.shield_absorbs_before_hp` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.shield_fully_absorbed_preserves_hp_and_hitstun_kb_poise` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.hitstun_ticks` | `8` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.hitstun_only_nonboss_idle_hp_overflow` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.kb_remaining_damage_fraction` | `0.25` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.kb_max` | `15` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.weapon_kb_multiplier` | `1` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.ki_slash_kb_multiplier` | `0.5` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.poise_damage_requires_explicit_poiseHit` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.poise_uses_remaining_hp_damage` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.normal_stun_ticks` | `180` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.hitstun_pauses_AI_before_charge_tick` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.incoming_damage.stunned_cancels_charge` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.flags.exact_frozen_elite` | `0` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.flags.mods` | `[]` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.flags.aura` | `null` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.flags.ib` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.flags._iceOnHit` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.flags._firstShot` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.flags.initial_spawn_fade_ticks` | `20` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.flags.source_spawn_fade_decays_before_updateE` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.flags.no_other_element_or_skin_admission` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.flags._iceFreeze` | `0` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.flags.eModHitP_empty_mods_returns_before_iceOnHit` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.flags.ice_element_does_not_add_contact_freeze` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.producer_damage_formula` | `"trunc(31 * 1.2) = 37"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.spawn_damage_formula` | `"trunc(37 * 2) = 74; redBean false, no redBean half"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.player_element_multiplier` | `"elMul(EL.I,armor.el): physical 1, ice .5, fire 2; other native matrix preserved by source"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.baseline_energy_defence` | `0` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.baseline_hp_damage` | `74` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.contact_still_physical_24` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.redBean_burn_append` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.projectile_independent_of_owner_death` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.outer_contact_guard` | `"!friendly && !noParry && !_pHit && !poisonZone && !_bigBall && distance < ordinary_contact_range && (qParryActive \|\| P.iframes <= 0) && !P._ioActive; damage branch additionally P.s != charge"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.literal_charge_is_movement_dash_not_Ki_hold` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.water_side_effect_after_hurtP_call` | `"water impact and max(freezeSlow,60) run regardless of internal hurtP early return when generic branch was entered"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.freeze_slow.duration_ticks` | `60.0` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.freeze_slow.movement_multiplier` | `0.5` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.freeze_slow.append_rule` | `"max(existing,60)"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.freeze_slow.decrement_only_native_player_state` | `"idle"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.freeze_slow.decrement_before_movement` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.freeze_slow.uninterrupted_idle_half_speed_updates` | `59` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.freeze_slow.full_speed_on_idle_update` | `60` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.freeze_slow.non_idle_timer_frozen` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.freeze_slow.independent_of_hurtP_acceptance_after_outer_contact` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.freeze_slow.api` | `"apply_native_freeze_slow(duration_ticks:float)->bool"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.freeze_slow.getter` | `"get_native_freeze_slow_ticks()->float"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.freeze_slow.snapshot_field` | `"freeze_slow_ticks"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.freeze_slow.api_return` | `"whether duration was extended"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.expiry` | `"camera > 2500 cull before life decrement; life -= .667*sp; nonred life<=0 near camera gets1 and continues same update"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.homing_requires_life_above` | `30` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `native_source_contract.ice_projectile_and_freeze_slow.homing_target_baseline` | `"player; optional native scarecrow/ancestor targets unported"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.exact_record_only` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.source_snapshot_edited` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.source_model_generated_or_modified` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.new_rigging` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.source_24_unique_frames` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.source_24_fps` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.full_native_enemy_system` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.new_attack_ticket` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.conditional_ticket_melee_auto_entry_ported` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.nonzero_antiRevive_and_full_player_modifier_pipeline_ported` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.revival_ported` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.new_PNG_copy_or_processing` | `0` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.new_PNG_hashes` | `0` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.runtime_consumer_verification` | `"pending owner implementation and new unit validation"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.visual_verdict` | `"not reviewed in this source/config-only task"` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.ice_projectile_and_player_freeze_slow_consumer_required` | `true` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.existing_medium_dark_and_physical_burn_code_changed_by_this_task` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.current_human_app_loaded_new_source` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.existing_body_PNGs_reused` | `16` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.external_original_water_PNG_dependencies` | `2` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.portable_export_completed` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.player_full_native_status_modifier_pipeline_ported` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |
| `scope.parry_blue_black_rainbow_variants_added_by_this_unit` | `false` | 새 config source metadata/범위 선언. 생성당시 pending과 현재 기술 결과를 구분 |

## 실제 제품 API / 시간·렌더 접점

아래 행은 최종 소비 코드를 좁게 대조한 위치다. private clock/actor 필드에 값을 주입하거나 원 source를 재생산한 검사가 아니다. source global frame과 fresh headless fixture의 local60Hz method·SceneTree dispatch 범위를 구분한다.

| 실제 leaf / 소비 위치 | 정확 API·초기값 / 현재 소비 |
|---|---|
| `enemy_factory.gd:156`, `:315`, `:452` | exact order8/id/etype4/ice2/soul_flame/elite0/mods[]/aura null/원 spawn만 admission. `consume_atomic(source,owner_world)`는 실제 `ExoduserIceSoulFlame.configure`로 생성하고 원337·support/runtime null record를 deep-copy report에 보존. 실제 world 등록 orders0,1,8,13,14→지원5/미지원11 |
| `enemy_tank_ice_soul_flame.gd:61`, `:131`, `:134` | `configure(runtime:Dictionary,owner_world:Node2D)`, `set_player(Node2D)`; physics delta×60. `native_frame`은 update 시작 증가. source `_alerted` field absent/falsey→consumer alerted=false. 초기44.74301584530622 contact는45번째phys24, 초기294.2270742729306 shot timer는295번째charge60→355번째birth |
| `enemy_tank_ice_soul_flame.gd:206`, `:279`, `:299` | 공통 actual flow both→X-only→Y-only, 실패 stuck 누적; source8방향escape/fullFlow parity 미검증. `_fire_projectile()`는 actor center/world owner/native_frame으로 독립 ice탄을 등록. `receive_damage(amount:int,direction:Vector2,source:String,opts={})`, `receive_poise_damage(float)`; 두 정상1000 요청으로 actor 사망 후 실제 탄의 진행을 확인. 살아 있는 stun/full modifier 동등성 검사는 아님 |
| `enemy_tank_ice_soul_flame.gd:353`, `:372` | Body/WalkOverlay 원8방향/col3/row0/base[768,0,256,256], walkX3072/3328/3584/3840, height244.12126080784947, center pivot. 실제 거리128마다4frame 순환·nearest. snapshot은 raw flags/timers/type_traits와 last_flow_direction/flow_stuck_ticks read-only 복사; 실제24원화/24FPS 구현0 |
| `enemy_projectile_ice.gd:8`, `:25`, `:70` | static `_original_textures:Dictionary`와 `_original_texture(path)`는 `ProjectSettings.globalize_path`→`Image.load_from_file`→`ImageTexture.create_from_image` 원 외부 PNG 캐시. `configure(origin,aim,profile,target,owner_world,birth_frame=0)`에서 life120/speed500..600 한 번 roll, `_near_camera_extensions=0`/`_visual_frame=0`. 파일 부재는 명시 missing end/에러이며 portable export 포장0 |
| `enemy_projectile_ice.gd:40`, `:81` | PAUSABLE·physics priority1, player기존0. groups `enemy_projectiles`+`ice_enemy_projectiles`, layer8/mask0/shape r5.2. 실제 viewport Camera2D screen center 필수; 없는 경우 `missing_native_camera` end. cam>2500 선행 cull→life−.667×ticks→near life1 연장→updated life>30 homing.00655→speed×delta 이동→wall/contact |
| `enemy_projectile_ice.gd:114`, `:129` | 현재 P·이전 P 각각 old→new shot segment의 최소 거리로 swept contact. margin13.6+P.r15=28.6. outer HP>0/iframes≤0/literal state!='charge' 뒤 `receive_damage(74,'magic',heading,2)`→impact→`apply_native_freeze_slow(60)`. 내부 피해 거절 sink에서도 slow 요청, burn 요청0. KiSlash windup hold를 literal 이동돌진 charge로 차단하지 않음 |
| `enemy_projectile_ice.gd:136`, `:167` | WaterFlight linear/additive, 원4×2/8frame, frame=`fposmod(Time.get_ticks_msec()*.012+x*.04+y*.025,8)`; crop .255 / row .10,.675 / source rect[-45.36,-22.4,84,44.8]와 heading 회전. alpha항상1(life1 포함), frame0..7. snapshot damage/life_ticks/speed/heading/position/native_frame/ended/near_camera_extensions/waterBean/redBean/blackBean/blueBean/fromRainbow/native_dtype/parry_class/visual_frame/visual_alpha/portable_export_dependency_packaged |
| `enemy_projectile_ice.gd:153`, `:170` | WaterImpact group `water_impacts`, PAUSABLE/linear/additive·actual collision center. age0→delta×60,66틱에queue_free. 원4×4/16frame/r72, frame=min(15,int(progress×16)), size=r×3×sqrt(min(1,progress×3))→max216, alpha=max(0,1−progress×.5). 실제 sheet texture/22틱 max size 확인; shard10/shake6/flash#8ed8ff/.15는 원metadata 보존·보조FX 미이식 |
| `player.gd:194`, `:217`, `:324`, `:334`, `:321` | `apply_native_freeze_slow(duration_ticks:float)->bool` max(existing,duration), 실제 연장 여부 반환; `get_native_freeze_slow_ticks()->float`, snapshot `freeze_slow_ticks`. HP/iframes/death 독립 append API, HP damage 본문·기존 burn 본문 수정0. held/request_attack 뒤 movement 전 **idle때만 먼저감소**→양수 speed×.5;59half/60full. attack/windup/recover/stagger/pStun clock freeze, 상태가 idle로 전환된 update도 기존 branch 후 다음idle부터 감소 |
| projectile/player telemetry | `enemy_projectile_birth`:id/position/aim/life_ticks/damage/native_dtype/parry_class. `enemy_projectile_hit`:damage_request/native_dtype/element/parry_class/waterBean/distance/position/freeze_slow_extended/freeze_slow_ticks/burn_appended=false. `enemy_projectile_end`:reason/life_ticks/distance/parry_class/waterBean/near_camera_extensions. `native_freeze_slow_applied`:requested_ticks/previous_ticks/remaining_ticks/extended. 관측 leaf이며 게임판정·시간 주입0 |

## 새 검사 결과 / chronology

| 신규 고유 그룹 | 실제 소비 oracle / 한계 | 최초 유효 결과 → 후속 |
|---|---|---|
| `exact_ice_admission` | exact factory→actual world16/5/11·원337/27subset/197timers·skin col3/Body/WalkOverlay. 다른 id/order/element/elite/skin admission 거부 | 최초 RefCounted.free runtime error로 world 부분 미완료(PASS marker 무효)→fixture lifetime 수리 후 PASS |
| `ice_actor_packet` | contact45 phys24/slow0·295charge60→355 actual magic74 birth·두 정상1000 피해로 actor 사망 뒤 독립 탄 진행·8방향/실제 distance128의4walk cells | 최초 끝까지 완료 PASS. 후속 재실행0 |
| `ice_projectile_hit_order` | life/homing/near1/far2501 선행 정리·outer iframe/literal charge gate·내부 거절 sink damage→slow 순서. 실제 player move_down 이전Psegment 경계에서 magic74 HP350→276/slow60·impact sheet max216 | 최초 실제 main InputMap action 미등록 assertion1 FAIL→fresh fixture action 등록 후 PASS |
| `native_freeze_slow_clock` | 실제 player Input.action_press(move_right)→physics/velocity/이동59half/60full·max refresh 및 public request/release/cancel 콤보 windup freeze. fresh SceneTree player0→shot1 자동 dispatch에서 hit후60/6stagger update freeze/다음idle59 관측 | 최초 실제 main InputMap action 미등록 assertion1 FAIL→fresh fixture action 등록 후 PASS |

| 실행 / 영수증 | exact 결과 / 계수 |
|---|---|
| 최초 `first-four-receipt.json` | exit1 /4.746394709초. raw stdout markers2 PASS/2 FAIL, failed_assertions2. **유효 끝까지 완료1 PASS(ice_actor_packet), admission 미완료1, 실패2**. RefCounted 수동free가 world 검사 전에 함수를 중단했으므로 marker PASS를 성공 수에 넣지 않음 |
| 최초 clock / 입력 | explicit physics method1450 / actual automatic fixture ticks13 /headless action edges5. 실패 실행 계수이며 성공 검증 총량으로 합산0 |
| harness 수리 | RefCounted factory의 수동free 제거 + `--script`에서 main boot가 없으므로 실제 main action명 move_left/right/up/down/weapon을 fresh InputMap에 등록. fixture만2수리·제품수리0. initial source support key는 첫 실행 전 `support.runtime_supported`로 맞춘 이력과 구별 |
| 후속 `failed-incomplete-three-receipt.json` | admission+onhit+player 세 그룹만 exit0 /1.265548292초 /3 PASS /assertion0 /stderr error0. explicit physics method421 /actual automatic fixture ticks14 /headless action edges5. 이미 유효 PASS actor 재실행0 |
| 최종 고유 결과 | 새 고유4개 모두 유효 완료: 최초 valid1 + 후속3. 최초4 PASS 주장0·기완료 suite/원source/PNG 반복0·GUI/public input0·actor HP/좌표/state/timer 강제0·callback 승리 주입0 |
| test byte history | 최초21565B/SHA `a89e1cef9333e927f78ccf2bc18668355da26179a83d84c340068595473f6535`→fixture 수리21848B/SHA `3dd1ea647992ddf62e1b601d06c2c6f956f6364627be8b9fdee3d4688382aba1`. 최초 raw/수리diff/후속 raw 분리 보존 |
| actual 자료 위치 | 외부 `encounter-etype4-ice-soul-first/tests/`의 first-four.*, fixture-repair.*, failed-incomplete-three.*, contracts-ledger.json, owned-final.diff, owned-freeze-receipt.json. source/config 생성·메타 명료화는 검사 실행 수에 포함0 |

headless action은 fresh fixture 입력이며 실제 인간/GUI/public play 증거가 아니다. 수동 explicit method 호출과 SceneTree automatic dispatch tick을 별도 계수했다. 실제 player/camera를 이용한 제한적인 clock/contact 관측을 whole global clock/whole movement/pathing/AI/벽·근접 공개 소비로 확대하지 않는다. 요청 sink의 내부 피해 거절 순서 확인은 full shield/affix/status/revival/retry pipeline 검사가 아니며 기존 burn kernel도 재실행하지 않았다. source-derived constructor context 이외 running actor 값을 강제로 덮어쓰지 않았다.

## MAP PRODUCTION REPORT (§23)

| 항목 | 현재 결과 / 미완 |
|---|---|
| MASTER / STAGE | 고정 order8의 ice/soul_flame consumer1. 신규 map/source 목록/seed 생산0·원16 frozen snapshot 유지 |
| LARGE / MEDIUM / GROUND / LANDMARK | geometry/collision/nav/배치/PNG/material/server 작업0. 기존 원 자료 보존 |
| PLAYABLE / COMBAT | 실제 exact factory/world5지원/11미이식·새 고유4 기술검사 유효 완료. source literal charge와 KiSlash hold 구분·contact phys24/water magic74/idle slow 소비. 전체 AI/affix/status/원global clock·Q/E 이식 완료0 |
| CAMERA QA | actual fresh fixture Camera2D의2500px lifecycle만 확인. 인간 기존 source1 paused 화면 및 browser31 보존·새 공개 픽셀 검수0 |
| TECH QA | 최초 valid1/미완료1/실패2→fixture2수리→후속3 PASS. attempt별 method1450/421·automatic13/14 분리, 성공 반복0·기완료 suite0 |
| FILES / GIT | consumer 소유 새 검사/SSOT·factory 후속 한 문단만. 타인 WIP 보존·worker Git0; 부모가 정상 code+docs checkpoint 담당. 실제 commit 성공 전 완료표시0 |
| VISUAL VERDICT | **RETOUCH** — 새 source 공개 소비/시각/전체경로/최소 Windows1080p240 미검증. 24원화/24FPS·전체FX·portable export 완성 주장0 |
| NEXT PASS | 정확 다음 record/element/AI 또는 실제 공개 wall/contact·ice hit/감속 검수. 이번 headless source 소비 마감은 full status·Q 패링/whole globalclock·최저240 및 시각 검수를 대체하지 않음 |
