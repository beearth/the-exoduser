# EC2-05 — 산란 사도 batch 전용 정책

작업ID `ec2-05` · 브랜치 `codex/ec2-05-20261020` · **REVIEW_PENDING** · 2026-10-20 KST.

## 착수·의존·허용 범위

| 항목 | 실제 확인 |
|---|---|
| 기준 | fetch 후 최신 `origin/main=26c050a99a711e793a6c2413395acda09b0c1614`. 최소 기준26c050a99와 동일. EC2-04가 main에 없어 허용된 예외대로 `5a389578b9549b25538c665580e0d8bd906f9dbc` 끝에서 분기. EC2-03/04 미병합 의존 포함. 최신 main 전체 통합본으로 검증했다고 주장하지 않음 |
| 원본 | 최신 main game.html과 checkout byte 동일, SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 아래 행은 이 원본 기준 |
| 순서안 | [cf57f721 §4.2 CH2E-05](https://github.com/beearth/the-exoduser/blob/cf57f721041869f0b7a2c18383cafe7f4ef003dc/docs/engine/FDG_SOURCE_TRACE_ENEMIES_CH2_20261020.md): type38→33 batch2..3·batch전cap·_ri·el\|\|P·mkEn순서. 실제33actor/공간등록writer 인수 전 연결HOLD를 유지 |
| WORK_BOARD | 최신 main의 P2-008a/FIX=CH1 ice/crawler병합, P2-008b=CH1order11/9·factory진행, P3-002=소환굴·동적등록병합, TRACE-ELITES=문서진행을 읽음. 이번 전용 신규 계산/테스트 경로와 진행 소유 파일 교집합0. factory/world/소환굴/regions/공용적 경로를 수정하지 않음 |
| 변경6파일 | 신규 `godot/scripts/native_ch2_brood_spawn_policy.gd`·`godot/tests/test_ch2_brood_spawn_policy.gd`·각UID, 이 보고서, CHANGELOG_SYNC 맨 위 자기 절. 기존 source/scripts/tests/data/scene 보호 246파일 동일바이트 |
| 보호 | factory/world/main/player/hud/공용hurtE/State·다른담당·기존테스트·원본·저장 형식0줄. R HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`/branch `codex/mac-live-play-time-main-20261017`/trackedINDEX·WORK 불변 |

## 원본 계약과 API

| 최신 main game.html | 보존 계약 |
|---|---|
| 31250–31253 | constructor의 spawnCd=180+60U/spawnT=60+30U와 gasCd=250+80U/gasT=100+40U는 기존 EC2-02 numeric constructor 소유. 이 단위에서 초기화/RNG 중복0 |
| 39237–39238 | outer type38/idle를 한 번 판정. spawnT와 gasT 모두−sp 후 산란→가스 순서. 새 `advance_spawn_clock`은 spawnT만 사본에서 감소, gasT는 기존 EC2-03 `advance_emitter_clock`을 재사용. 실제 owner는 두 clock 후 begin을 호출해야 함 |
| 39239–39241 | spawnT≤0 **AND ens.length&lt;200**이면 cooldown reset→count=2+trunc(U×2). alive 필터/거리 조건 없음. batch 전 한 번 검사이므로199+3=202 허용,200이면0draw/미reset. mkEn 모두null이어도 cooldown은 이미reset |
| 39242–39244 | 자식마다 x=e.x+(U−.5)×40, y=e.y+(U−.5)×40 → `mkEn(x,y,G.stage,33,false,e.el\|\|EL.P,e._ri)` → 반환truthy일 때ens.push. 좌표를 batch 전체 먼저 뽑거나 mkEn RNG를 나중에 합치지 않음. 각 call 뒤 최신 부모/context를 다시 공급해야 함 |
| 31120–31124 /31362 | 실제 mkEn의 좌표검사·canMv/safePt·null반환·최종 actor 반환은 외부 owner. 정책은 좌표 보정/조건 없는 성공/가짜 child 생성0. resume은 null이면push0·object이면push요청1. 빈Dictionary도 JS object처럼truthy |
| 31165 /39244 | constructor 필드는room이며 caller는**e._ri**를 전달. _ri 부재는 요청room키 부재(undefined), null은null,−1/0/양수는 그대로. e.room99나 기본room−1로 대체하지 않음. _ri의 실제 writer는 원본 검색에서 확인하지 못했으므로 미확인 |
| 39244 | el의0/null/undefined는P0 fallback, 유효1..6은 그대로. 이것은 이 caller의 `\|\|`이며 소환굴의undefined 전달을 모두P로 바꾸는 규칙이 아님 |
| 39246 | 모든 constructor 시도 뒤 현재좌표 text 산란!(y−20,#cc8866,30)→parts(x,y,#dd6644,8). 전부null이어도 실행. 연출의 실제 pool/RNG 소비는 후속 presentation owner 소유 |
| 39248–39252 | 독립 gas if는 산란 뒤. 기존 EC2-03 plan_emission에 fresh actor와 최초idle_entered/d를 공급. constructor후상태가recover로 바뀌어도 outer idle을 재검사하지 않음. 가스/RNG/Player writer 중복0 |
| 31433–31435 | room 생성의 etype33 추가4~7 group은 별도 caller. 산란의33 child 각각에 이를 붙이지 않음. type7→3 summon/HP50% 후처리도 섞지 않음 |

`begin_batch(actor,array_length,idle_entered,rng)`는 사본의 timer reset과 count/continuation을 만든다. `plan_child(batch,fresh_actor,fresh_stage,rng)`는 좌표2draw와 **mk_en 요청1개**만 반환한다. owner는 실제 constructor를 호출하고 그 RNG/부수효과가 끝난 뒤 `resume_child(batch,returned_child)`로 돌아와 push 요청을 소비하고 다음 자식을 진행해야 한다. 마지막 `finish_batch(batch,fresh_actor)`가 연출 요청을 만든다.

continuation은 `coordinates→await_constructor→coordinates/presentation→complete`이며 잘못된 순서/미연결 RNG/비수치·범위밖 U·지원밖stage/불완전actor를 NOT_READY로 진단한다. stage는 이 CH2 unit의4..9 입력 도메인이다. RNG는 주입된 공유 stream의읽기 인터페이스이며 전역owner를 새로 만들지 않는다. 실패 진단은 이미 읽은 RNG를 되감지 않는다. READY는 `product_connected=false/complete_actor=false`이며 **등록·생성·실전 지원 PASS가 아니다**.

## 실제 검증

신규 harness는 Node 경로를 **필수 `--node-bin=...` 인자**로 받는다. PATH/node symlink/고정설치경로 기본값0. 원본 추출 Node helper와 결과JSON은 작업 격리 userdir의 임시파일에 UTF-8로 쓰고 실행 후 제거했다. OS.execute 출력은 `"\n".join(output)`으로만 진단하고 첫덩어리output[0]에 의존하지 않는다. 실행기에서 실제 Node24.15.0 절대경로를 인자로 공급했다.

원본 type38 전체if(39237–39252)를 그대로 발췌해 VM에서 실행하고, 생성 함수 **mkEn은 명시 constructor fixture**로 대체했다. 이 fixture는 요청을 기록하고0/1/2/3/5/8개 외부 RNG를 소비해 null/object를 반환하거나 부모 x/y/el/_ri/atk/s/timer·현재stage를 바꾼다. ens는 dead항목도 포함한 length fixture이며, text/parts/projectile/SFX/push는 순서 수집이다. 이 표본은 **실제 mkEn/collision/skin/World/region 실행이 아니다**.

최종 원본 1,849사례, fixture constructor요청3,182건. timer/sp·idle/recover·length0/198/199/200/201, countU0/.5−ε/.5/1−ε, stage4..9, el0..6/null/undefined, _ri−1/0/17/null/undefined, 모두성공/모두거부/혼합, d0/1200−ε/1200/9999와 동tick 산란→가스를 비교했다. actor사본·전체event/RNG/constructor/push/연출/gas순서·실제consume열·최종배열길이·stage·입력불변을 **binary64 정확 비교, 허용오차0**로 확인했다.

기존 EC2-02 `build(etype33)`도 별도fixture에서 호출했다. tier0 projection의8draw를 자식 사이 공유stream에 넣어1(count)+2(xy)+8(기존projection)+2(xy)+8=21 소비와 다음좌표를 확인했다. 이것은 전체mkEn draw수 보증이 아니며 elite/admission/skin/전역phase의 실효소비는 미확인이다. 기존type3 recipe의stage0/etype3/HP50%를 재사용해33으로 위장하지 않았다.

| 실제 실행 label | 실제 결과 | exit/raw ERROR/WARNING | 격리 |
|---|---|---|---|
| `unit-02` | 33875/0단정 | 0/0/0 | `EXODUSER-ec2-05-Isolated-20261020` |
| `test_ch2_charge_slam_policy` | 30307/0단정 | 0/0/0 | `EXODUSER-ec2-04-Isolated-20261020` |
| `test_ch2_poison_zone_policy` | 18512/0단정 | 0/0/0 | `EXODUSER-ec2-03-Isolated-20261020` |
| `test_ch2_enemy_constructor_policy` | 159902/0단정 | 0/0/0 | `EXODUSER-ec2-02-Isolated-20261020` |
| `test_ch2_enemy_spawn_policy` | 7483/0단정 | 0/0/0 | `EXODUSER-ec2-01-Isolated-20261020` |
| `test_contracts` | 5그룹/실패단정0 | 0/0/0 | `EXODUSER-ec2-05-Isolated-20261020` |
| `test_encounter_factory` | 3그룹/실패단정0 | 0/0/0 | `EXODUSER-ec2-05-Isolated-20261020` |
| `test_enemy_mod_m29` | 143/0단정 | 0/0/0 | `EXODUSER-ec2-05-Isolated-20261020` |
| `test_m30_epicenter` | 4그룹/실패단정0 | 0/1/0 | `EXODUSER-ec2-05-Isolated-20261020` |
| `test_native_element_projectiles` | 4그룹/실패단정0 | 0/0/1 | `EXODUSER-ec2-05-Isolated-20261020` |
| `test_p1002f_dedicated_hurte` | 357/0단정 | 0/0/2 | `EXODUSER-P1002F-Isolated-20261020` |
| `test_p3002_spawn_holes` | 298/0단정 | 0/0/2 | `EXODUSER-P3002-Isolated-20261020` |

신규 **33,875/0**, 회귀11종 실패단정0·SKIP/미완그룹0. 단정수/그룹수를 합산하지 않는다. M29는 ledger143checks/14group PASS/failures[]를 읽었고 exit0만으로 PASS를 만들지 않았다. import exit0/ERROR0/WARNING0.

첫 신규 unit-01은 **33,871/1**이었다. source 비교는 일치했으나 coverage 단정이 undefined 사례 누락을 발견했다. JS fixture의 destructuring default가 명시undefined를0/7로 바꿔버렸기 때문이다. fixture에서 해당 키를 명시 삭제해 실제 source undefined 입력을 만들고 coverage 단정을5개로 분리했다. 정책 코드는 이 정정 전후 동일하며, 단정 삭제/허용오차 완화 없이 **전체 unit-02**를 다시 실행했다. 실패 원로그/초기oracle JSON도 보존했다.

M30 raw ERROR1은 기존 test_m30_epicenter.gd334–336의 의도된 required-resource 거부 검사다. expected_missing_resource_rejections=1·4그룹/0실패·미완0와 아래 원문을 확인했다. ERROR0으로 숨기거나 제품/검사를 수정하지 않았다. 다른11suite ERROR0이다.

```text
ERROR: Required packaged original M30 texture is missing: res://assets/vfx/__missing_required_M30_original__.png
```

종료 경고(원인·선재 여부 미확인, err.log 전체 보존):

- `test_native_element_projectiles`: ``WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.``
- `test_p1002f_dedicated_hurte`: ``WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.`` / ``WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).``
- `test_p3002_spawn_holes`: ``WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.`` / ``WARNING: 8 ObjectDB instances were leaked at exit (run with `--verbose` for details).``

Godot4.7.2.stable.official.ed1daf0bf, 매 실행 전 정확한 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을 기록하고2이상이면30초 대기(총2회). 새 `EXODUSER-ec2-05-Isolated-20261020`, 기존각상수격리명, 상수없는fixture는작업격리명. override는 매회설정/finally0byte. worktree는--no-checkout→non-cone sparse→필요 경로 checkout. 다른 세션/프로세스 종료0.

## docs 대조·공용 접점

| 자료 | 대조·인계 |
|---|---|
| docs 전체 키워드 산란/brood/39240..47/CH2E-05 검색125행 | 원로그에 보존. 몬스터_총관리.md424/941의 소형요마소환+독가스, 몬스터_공격시스템.md354/359의 type33/38명칭은 일치. 장거리800은 산란 발동거리 조건이 아니며 원본 spawn if에 d조건을 새로 넣지 않음. 세부 batch/RNG/_ri/null/미연결은 이 보고서와 CHANGELOG에 보충 |
| enemy_factory.gd25–31/60–61 | CH1 schema와stage0 gate는 유지. type33/38 실actor/constructor/admission이 없어 실제등록은HOLD. exact gate 삭제/범용crawler/3fallback0 |
| game.html31120–31364·EC2-02 | 실제collision→safePt→null, elite/mod/aura/literal/skin과공유RNG를 원래사이트에서 소비할owner필요. 새정책은인자/반환continuation만. numericprojection을완전actor로세지않음 |
| world.gd·native_regions.gd·P3-002 | ens.push에 대응하는 실제공간등록/부팅phase/지역처치분모/동적개체수 소유는 별도. 소환굴700cap/후속분모 정책을산란200cap에혼용0. 필요한공용쓰기인수전 연결HOLD |
| 기존 EC2-03·parent AI owner | 같은tick두clock→broodconstructor+push+연출→freshgas순서연결필요. EC2-03 gasclock/zone/피해소유중복0 |
| Player/State/hurtE/저장 | child의실제포이즈/피해/사망/드랍/저장/로드는미확인. 새로운저장키나Statewriter없음 |

이번 순수 정책은 공용 변경 없이 완료 가능하다. 위 실제 연결은 구현하지 않았다. 실제33 birth/부모38의자연도달/실창/PC/지역분모/전역RNG전체동등성/저장/전투품질은 **미확인**이며 EC2-06은 착수하지 않았다.

원로그 `~/exoduser-wt/_out/ec2-05/`: start·최신WORK_BOARD/AGENTS·최신원본·승인설계, source-oracle.cjs/json·초기실패JSON, unit/회귀/import out/err/engine/json, validation-summary·godot-count·보호hash·제출감사·DONE. 정상훅·자기브랜치push·원격SHA일치·DONE 후 자기worktree만제거. R불변·mainpush/force/add-A/훅우회0.
