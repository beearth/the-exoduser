# EC2-03 — 부식·산란 사도의 독장판 순수 명령/상태 정책

작업ID `ec2-03` · 브랜치 `codex/ec2-03-20261020` · **REVIEW_PENDING** · 2026-10-20 KST.

## 기준·중복 확인·수정 범위

| 항목 | 정확 상태 |
|---|---|
| 최신 원본 | fetch 후 `origin/main=a00893ad9b93750d7ce70b90f5bd501b578daccb`의 game.html. SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| 분기 의존 | EC2-02 미병합으로 사용자 지시대로 `a10924eb0ee725b993ab7bd1ea019d99180d4e1c`에서 분기. 이 기반과 최신 main의 game.html byte 동일, 재사용 combat_stat_formula도 동일 확인. 최신 main의 다른 통합 코드 전체를 병합/검수했다고 주장하지 않음 |
| 승인 설계 | [trace-enemies-ch2 cf57f721 §4.2 CH2E-03](https://github.com/beearth/the-exoduser/blob/cf57f721041869f0b7a2c18383cafe7f4ef003dc/docs/engine/FDG_SOURCE_TRACE_ENEMIES_CH2_20261020.md): type34/38 packet·tick30/25·반경40/60·마지막life/조건·독2, 순수명령/상태만. Player피해/Worldbirth 별도 소비 배정 |
| 착수 전 WORK_BOARD | 최신 main 보드의 P2-008a/FIX=CH1빙결전사·crawler·factory, P2-008b=CH1order11/9 actor/factory 진행 중, P3-002=소환굴/World 등록, P3-003=지역, TRACE-ELITES=정예, MAPLOOK-TOXIC=maplook 맵 독액 표현 큐를 확인. 이번은 신규 CH2 계산 파일2개뿐이므로 경로·기능 소유 교집합0. 기존 담당 파일/WORK_BOARD0줄, 보고서/DONE 인계 |
| 코드 소유 | `godot/scripts/native_ch2_poison_zone_policy.gd`·`godot/tests/test_ch2_poison_zone_policy.gd`·자기UID2개. 이 보고서와 CHANGELOG_SYNC 맨 위 자기 절만 추가, 총6파일 |
| 공용 경계 | factory/world/main/player/normal hurtE/State·원본·기존 테스트·저장 형식·다른 담당 파일0줄. 전용 prototype actor/가짜 World/sink/실제 피해/실제 장판 등록0 |
| R 보존 | HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, branch `codex/mac-live-play-time-main-20261017`, tracked INDEX/WORK 불변. 새 WT --no-checkout + non-cone sparse, 필요한 source/scripts/tests/docs·회귀 리소스만 checkout |

## 원본 행과 정확 수치

| 원본 game.html | 실행 계약 |
|---|---|
| 39166–39173 | 34가 outer idle일 때 _poisonZoneT−sp; T≤0·d&lt;300이면T=Cd, 본체 현재위치 정지 D장판 rawtrunc(atk×.4), life/ml300,sz8,색#33aa22,tickCd0,tickRate30. 그 뒤 독안개! text(y−15,30), magic(.7) |
| 39237–39252 | 38 idle에서 두 clock 감소→**brood 생성/연출 먼저**→gasT≤0·d&lt;1200이면gasT=gasCd. 현재위치 D장판 rawtrunc(atk×.5),life/ml400,sz12,색#556633,tickRate25. 독가스! text(y−15,30),magic(.5). brood 생성/RNG는 이 모듈0줄 |
| 16940–16945 / 16947–17003 | 비보스라도 vx=vy=0이면 warning/이동탄 대신 spawnProj 직접. stationary는 이동탄 density/size/radius/speed/dmg 배율이 적용되지 않음. 정규화 결과 dmg/sz 원래 값 보존 |
| 16911–16920 | poisonZone은 parryClass forbidden. 기존 Q/E·반사/흡수 흐름을 수정하거나 다른 dark-moving projectile로 대체하지 않음 |
| 34671–34676 | 공통 life−sp×.667 및 배리어/돔 처리가 poisonZone 분기보다 먼저다. 이 prefix의 실제 실행/등록은 기존 owner 책임 |
| 34725–34729 | vx/vy0; tickCd&gt;0일 때만−sp. cd≤0·거리&lt;sz×5·iframes≤0·P.s!='charge'이면1회 접촉. 엄격한 반경40/60, 큰sp에서도 catch-up 반복0. cd는 tickRate||30으로 reset(0→30, 음수는truthy 보존) |
| 34730 / 16996 | _hurtProjectilePlayer(p,ToInt32(dmg×elMul(D,armorEl)),dtype magic). dot:true를 새로 붙이지 않음. wrapper/실제hurtP·mouth/sfx 등은 기존 소유자 |
| 34731–34734 | hurt 요청 반환 뒤 P.poison=(P.poison||0)+2, 최신 P위치 독! text(y−10,15)·parts3. **이후에** 최신 p.life≤0이면 장판위치/색 parts5→recycle→continue. 피해가 거부되어도 독 추가를 피해 성공에 종속시키지 않음 |
| 43415–43435 | hurtP에는 dead/fallen/일부 무적/회피 등의 조기 반환이 있다. poisonZone outer 조건에는 그 모든 gate가 없으므로 새 gate로 접촉 명령/독2를 삭제하지 않음 |

## API·동기 호출 경계

- `advance_emitter_clock(actor,sp)`는 type34/38 비보스의 해당 clock만 사본에서 감소시킨다. outer idle 진입 여부 `idle_entered`를 같이 반환한다.
- `plan_emission(actor_at_emit_site,distance,idle_entered)`는 clock 이후 **그 시점 최신** actor에서 raw packet→text→sfx 명령을 만든다. type38은 brood/연출 이후에 호출해야 한다. outer idle은 처음 한 번만 검사하고 다시 검사하지 않는다. 테스트에서 clock 뒤 atk/좌표/s를 바꿔도 source outer 진입·최신 수치를 보존했다.
- `plan_contact(etype,zone,view,sp)`는 **공통 prefix가 끝난** zone.life와 해당 분기 진입의 distance/iframes/state/element_multiplier를 명시 입력으로 받는다. velocity/cd를 사본에 계산한다. 접촉이면 hurt_projectile_player 명령만 내고 `phase=after_hurt_required`에서 멈춘다. 만료 판단/Player 쓰기를 미리 만들지 않는다.
- `finish_contact(etype,zone_after_hurt,player_after_hurt)`는 hurt 요청이 반환한 뒤의 최신 스냅샷으로 독 쓰기→text→parts→필요시 만료 parts/recycle 명령을 만든다. hurt 성공 bool을 요구하지 않는다. no-contact 경로만 즉시 만료를 판단한다. 살아있는 branch_complete는 공통 후속 루프로 fallthrough, 만료는 continue_projectiles 명령이다.
- `radius(etype)`는40/60만 반환한다. 모든 READY는 `product_connected=false`이다. unsupportedetype/입력·필수 owner view 누락/비수치/비정상 sp·distance는 NOT_READY 및 commands빈배열, 임의 기본 actor/Player상태나 실제 sink를 만들지 않는다.

ToInt32는 기존 `port_modules/combat_stat_formula/producer.gd:228–239` static helper를 **읽기 재사용**한다. elMul/갑옷/피해/정예 authority를 복제하지 않고 element_multiplier는 기존 소유자의 명시 입력이다. 입력 actor/zone/Player/context는 수정하지 않는다. RNG/clock owner를 새로 만들지 않으며 SFX/parts 명령을 실제 실행하거나 그 RNG를 소비하지도 않는다. 이 단계의 identity 검사는 packet shape 범위이며 실제 actor provenance/admission 증거가 아니다.

## docs 전수 검색과 기존 불일치

코드 작성 후 docs 전체 poisonZone/poison_zone/독안개/독가스/_broodGasT/EC2-03 검색53일치행을 저장했다(`docs-keyword-search.log`). 다음은 기존 문서/원본의 차이로, 이번에는 해당 팀의 설계 파일을 수정하지 않고 이 보고서·CHANGELOG에 원본 기준을 기록한다.

| 문서·행 | 문서 설명 | 최신 원본 판정 |
|---|---|---|
| 몬스터_공격시스템.md355/525 | 34 자기발치 d&lt;300, 정지위험물 배율 미적용 | 원본39168–39170/16971–16991과 일치 |
| 탄막시스템_총정리.md222 | size8..12/life300..400/atk .4..5/패링불가 | 범위 요약은 일치. 34/38별 값으로 분리해야 함 |
| 같은 문서710 | poisonZone30f·플레이어-적 중간점 배치 | **불일치**: 두 유형 모두 본체 x/y. 34는30,38은25틱 |
| 같은 문서737 | 독안개 배치&lt;1200px,etype34 | **불일치**: 34는&lt;300,38 gas는&lt;1200 |
| 스킨 렌더링/일반 dark 커널 | 독가스 좀비 이름·기존탄 부품 | 이름/부품 존재는 type34/38 poisonZone 실제 지원의 근거가 아님 |

## 실제 검증

Godot4.7.2.stable.official.ed1daf0bf. 매번 정확한 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l` 기록 후2이상이면30초씩 대기했다(이번 대기 2회). override.cfg 매회 격리 설정·finally0byte. 새 테스트 ec2-03 격리, 기존은 각 파일 상수(상수 없는 contracts/factory/element는 작업 격리). 테스트·공용 코드 값/검사 변경0.

원본 JS literal 및 각 분기만 Node VM에서 추출·실행하고 수치를 binary64로 전달했다. scalar 숫자는 정확 비교, 허용오차0. 38은 **gas clock/if만** 발췌하고 brood 분기는 계산하지 않았다. emit용 원본 _spawnBossProjectile/spawnProj/classifier도 고립 실행해 stationary 원배율/forbidden을 확인했다. pool은 빈 배열, warning 경로와 Math.random 호출은 오류 fixture, addTxt/SFX/parts는 명령 기록 fixture다. game/DOM/실제 플레이어·물리·World는 이 oracle에서 부팅하지 않았다.

최종 oracle **방출615 + 접촉2470 = 3085사례**. 방출은 idle/비idle, cd/sp/엄격한거리 양쪽,0/음수/큰ATK ToInt32, clock 뒤 최신입력/outeridle1회. 접촉은 cd감소·반경±ε·iframes/state·원본elMul 갑옷5원소(0/3/4/5/6)·음수/overflow damage·만료프레임·hurt거부/이후새poison41→43·새좌표·hurt후life변경·rate0/음수·velocity0·입력불변을 대조한다. 2470 안에는 sp1 공통prefix fixture의34=450프레임/15접촉,38=600/24접촉 연속 기록1050개가 포함된다. 이 프레임 수는 외부 prefix fixture 수치이며 정책이 공통 life clock이나 실제 World를 구현했다는 뜻이 아니다.

| 실제 실행 label | 결과 | exit/ERROR/WARNING | 격리 |
|---|---|---|---|
| `unit-02` | 18512/0단정 | 0/0/0 | `EXODUSER-ec2-03-Isolated-20261020` |
| `test_ch2_enemy_constructor_policy` | 159902/0단정 | 0/0/0 | `EXODUSER-ec2-02-Isolated-20261020` |
| `test_ch2_enemy_spawn_policy` | 7483/0단정 | 0/0/0 | `EXODUSER-ec2-01-Isolated-20261020` |
| `test_contracts` | 5그룹/실패단정0 | 0/0/0 | `EXODUSER-ec2-03-Isolated-20261020` |
| `test_encounter_factory` | 3그룹/실패단정0 | 0/0/0 | `EXODUSER-ec2-03-Isolated-20261020` |
| `test_native_element_projectiles` | 4그룹/실패단정0 | 0/0/1 | `EXODUSER-ec2-03-Isolated-20261020` |
| `test_p1002f_dedicated_hurte` | 357/0단정 | 0/0/2 | `EXODUSER-P1002F-Isolated-20261020` |
| `test_p3002_spawn_holes` | 298/0단정 | 0/0/2 | `EXODUSER-P3002-Isolated-20261020` |

전8suite 전체그룹·SKIP0. 단정/그룹을 합산하지 않고 원본 JS 단독검산을 Godot PASS로 세지 않는다. 기존 실제 Main 회귀의 fixture 개입/공개 공격·정지시뮬레이션 한계는 원래 결과 그대로다.

첫 `unit-01`은 **18,506/1,048실패**, exit1/ERROR0, 원로그 보존. 연속 수명 oracle가 이전 row.after 객체를 다음 frame입력에 그대로 써서 다음 life감소가 이전 기대값까지 바꾸는 fixture alias를 확인했다. 다음 입력만 복사하도록 수정했고 source 분기/비교를 삭제하거나 허용오차를 늘리지 않았다. 또한 outer idle 한 번/clock 뒤 최신 snapshot 사례1개를 보완했다. 최종 `unit-02`는18,512/0이다. import exit0/ERROR0/WARNING0. 종료 경고는 아래 실제 원문이며 원인/선재 여부는 미확인이다.

- `test_native_element_projectiles`: ``WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.``
- `test_p1002f_dedicated_hurte`: ``WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.`` / ``WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).``
- `test_p3002_spawn_holes`: ``WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.`` / ``WARNING: 8 ObjectDB instances were leaked at exit (run with `--verbose` for details).``

## 공용 접점·후속 인수

이번 순수 정책은 공용 수정 없이 완료 가능하므로 BLOCKED가 아니다. 실제 소비 연결은 아래 기존 소유 위치를 수정해야 하는 별도 배정이며 이번0줄이다.

| 위치 | 필요한 소비·원본 근거 |
|---|---|
| native_element_projectile_emitter.gd26/89–108 | RAW_KEYS에는 poisonZone/tickCd/rate가 없고 source actor는3/7/21 부품이다. 34/38 stationary를 기존 moving-dark로 위장하거나 source gate를 삭제하지 않음. source16940–17003 직접 birth·registry·packet shape 소비 인수 필요 |
| world.gd17 및 native_projectile_birth_phase | 실제 stationary birth, 공통 prefix life/배리어/돔, effect/RNG·iteration/expiry/recycle owner 필요. source34671–34735의 순서와 posthurt resume를 실등록 상태에서 검증해야 함 |
| player.gd876–888 및 damage/status owner | 일반 projectile Q/reflection 접촉 adapter를 그대로 독장판 sink라고 주장하지 않음. source34730–34732의 hurt요청→거부여부와무관한독2→현재좌표 presentation을 실제 owner가 소비해야 함. Q/E·save 변경0 |
| factory·적actor·brood owner | 34/38 실제 s/clock/좌표/ATK와 source39238–39250 brood-before-gas 순서 연결 필요. packet 식별자만으로 actor지원으로 세지 않음. 1장 P2-008a/b와 중복0 |

다음 EC2-04 charge/slam은 이 제출에서 착수하지 않았다. 원본 수치 동등성은 여기 정의한 순수 경계만이며 실창·PC·자연 CH2 적/장판/피해·Q/E 전체·정예·전역 RNG·영구 저장/게임플레이는 **미확인**이다.

원로그 `~/exoduser-wt/_out/ec2-03/`: 원본/WORK_BOARD/design 기준, source-oracle.cjs/json, unit/회귀 out/err/engine/json, validation-summary.json, godot-count.log, 보호 해시/Git 감사/DONE. push·원격 SHA 일치·DONE 기록 후 자기 worktree를 제거한다. R불변·main push/force push/add-A/훅 우회0, 자기6파일만 정상 커밋한다.
