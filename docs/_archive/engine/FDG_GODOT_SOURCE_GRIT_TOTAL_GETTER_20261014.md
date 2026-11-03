## 현재 actualMain 초기 상태 / 공급자 — 2026-10-14

실제 Main은 원 fullmkP/G40/STATS5/PASSIVES26/INV17 source 상태를 명시설치하고 원 actualRNG/time→StarterFactory25를 실제sameidentity로 소비했다. 실제 current holder→Affix/CRef/Formula/Passives/Rates/Fusion/Crystal/currentGrit/rawholder/SourceParameters10이 연결된다. SOURCE_BOOT/currentfalse 이력은그대로이며 설치된현재값은별도진실이다. 첫고유5그룹145는 최초성공4/132+scriptERROR가난consumer만13재검한결과다. 원HP·MP·ST 파생/전체applyStats/recalcSt/actualOPT/diffSigned/fullbootstrap/자동회복은아직미완이다. 아래 독립helper 과거검사·당시부족이력은보존하며 최신중앙상태는 FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md 및 FDG_GODOT_SOURCE_PLAYER_PROVIDERS_20261014.md를따른다.

# 원 `_gritTotal()` 공유 getter — 2026-10-14

`godot/port_modules/player_resource_parameters_source/producer.gd`의 `read_source_grit_total()->Dictionary`는 기존 private `_grit_total()`를 원 호출점에서 정확히 1회 소비한다. DEF/speed 등 다른 source producer가 5항 수식을 다시 조립하지 않도록 제공한다.

| 항목 | 계약 |
|---|---|
| 원 식 | `game.html:28559`: `(+_grit\|\|0)+_lvB()+_eqStat('Grit')+_eqAffix('gritFlatN')+_eqAffix('gritFlatR')` |
| 호출 순서 | 기존 `_grit_total()`의 raw grit→level bonus→equipment stat→flat N→flat R 그대로 1회. 추가 사전조회 없음 |
| 성공 | `{status:'READY',ready:true,value:finite,reason:'',source:'game.html:28559 _gritTotal()'}`; 실제 source 결과 0도 유효 |
| 공급자 부재/거절 | `{status:'NOT_READY',ready:false,value:null,reason,source}`; private helper의 진단용 0을 실제 결과로 공급하지 않음 |
| 비유한 계산 | `{status:'SOURCE_NON_FINITE',ready:false,value:null,reason:'computed_non_finite:_gritTotal',source}` |
| plan 상태 | getter 진입 전 `_fail`을 보존하고 조회 종료 후 복원. 바깥 plan의 기존 첫 오류를 지우지 않음 |
| 부작용 | 공유 자원/캐시 무효화/clock/RNG/save 쓰기 없음. sink가 없어도 구성된 실제 source provider로 조회 가능 |

원 `_gritTotal()`의 단일 계산 소유는 SourceParameters이다. raw grit holder는 BUILD `raw_grit_restore`가, 현재 getter는 `player_grit_source`가 소유하며 이 getter는 초기화·투자·환불·복원을 수행하지 않는다. 새로운 source consumer의 최초 검증으로 확인할 예정이며 기존 SourceParameters 성공 검사는 재실행하지 않는다. Main 전체 파생값 완료를 주장하지 않는다.

## actual Main 최초 소비 검증 — 2026-10-14

고유 **5그룹145 clean검사**는 첫성공4그룹132와 scriptERROR가난 consumer만13 재검한 합이다. 첫전체 실행은141assert/exit0이었지만 `Dictionary == int` fixture SCRIPTERROR1로 **NOT_PASS**다. 해당 consumer에서 error전9개 검사는INVALID이고 이후성공13으로대체하며, 제품수리0·fixture leaf수리1·성공4그룹재연0·전체5최종재연0이다.

| 그룹 | 고유 clean 수 | 관측 |
|---|---:|---|
| startup_state_and_items | 94 | actualMain SourceState fullmkP/G40/STATS5/PAS26/INV17, 실제sameitem 15장착+10bag, entries26/RNG913/time25/level70; bootcurrentfalse와actualcurrent별도 |
| public_actor_sync | 8 | 공개attack/damage→실제currentP HP250/ST190.175/MP160/stateidle; actor/state/HP/clock 시험용setter0 |
| original_provider_consumers | 13 | 수리후실패그룹만firstclean. 현재actualINV→originalAffix/CRef/Rates/Fusion holyDome0, ownedrawGrit0→publicgritTotal READY/value0. Parameters는sink미설치NR |
| once_and_tree_gates | 11 | 재생성ALREADY_ATTEMPTED/RNG913→913; actualTree/preTree/persistentclaim경계 |
| lifecycle_and_grit_loss | 19 | rawholder unpublish→NOTREADY/value:null(grit_not_number:Nil), State.free→reader/providerNR; actualresource리필0 |

첫실행4.267587541초, affected-only2.191662083초, 둘째ERROR0/exit0. 최초 오류coroutine의Main 미cleanup 때문에 다음두그룹에독립Main이동시에존재한이력을보존한다. 성공4는자기Main/World/actor/currentreader/Worldcounter 직접참조 assertion만인수하고 globalcurrentCamera/groups/FPS 의미는주장하지않는다. 원시attempt1/2와local-scene proof는 E/dependency-main-source-starter-state-first/tests/worker-test-receipt.json에남는다.

SourceParameters의현재 P/Crystal requirement 진단문자열2개는첫성공뒤 metadata-only로현재실제supplier에맞췄다. 식/숫자/함수/분기/keys변경0이고원testedbytes와finalbytes/diff를따로보존한다. 나머지production11+test는actualtestedstage와exactbytes동일이다. UID9은실제GodotResourceUID 생성(metadata0groups/0imports/.598615542초), userdata는EXODUSER-MainSourceStarter-Isolated-20261014다. 기존source성공test/GUI/save/userQA/server/기존asset해시·복사·import0이다.

실제파일init+starter+provider-binding완료와post-applyStats파생/fullbootstrap/actualOPT/diffSigned/automaticregen/이미지품질/24장24FPS/최저240은별도다. 현재다음source부분은미완으로표시한다.
