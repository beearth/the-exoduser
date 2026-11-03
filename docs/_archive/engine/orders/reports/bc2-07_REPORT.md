# BC2-07 shieldBash2 독립 계산·원본 대조 보고

- 작업 `bc2-07`, 브랜치 `codex/bc2-07-20261020`, 2026-10-20.
- 판정: 독립 wind/dash/contact 요청 계산 검증. **실제 투사체·hurtP·패링·Main/State 연결 HOLD**. 실전·화면·성능·PC 실행 PASS를 의미하지 않는다.
- 기준 main `3886513f591bbff642a7a8cf622ccbbcbc6cc6f9` + 인수 BC2-06 `ef665f402940098aacaffd0b001513d158ce0529`를 **정상 merge**한 `baa75b16e920ada4f1f44c52a457f2b875a1ebfe`에서 작성했다. 부모 순서 main→BC2-06. rebase/reset/force/main push0.
- 원로그 `~/exoduser-wt/_out/bc2-07/`. 최종 제출 SHA·원격 일치·정리 수치는 외부 `DONE.txt`에 남긴다.

## 1. 원본 행·정확 계약

원본 `game.html`은 기준 main과 byte 동일, SHA-256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. `source-verification.json`, `source-shield-bash-numbered.txt` 보존. 추적 인수본 `ddf0549597e645b507cac672cba29df2639712c3`의 `FDG_SOURCE_TRACE_BOSS_CH2_20261020.md` §2.3/§5.2 7번을 읽고 참조했으며 원문 문서는 복사/수정하지 않았다.

| 원본 game.html 행 | 보존한 동작 / 이번 계산 |
|---|---|
| G38048–38053 | 시작 `_sbAng=P각` lock·tele fallback20은 BC2-03 소유. 이번 wind/dash에서 재설정하지 않음 |
| G41337–41339 | wind는 매 tick P를 바라보는 facing 계산. st2<=0이면 bossSBash/st2=18 → SFX.block 요청 후 break. 같은 tick dash를 실행하거나 시계를 다시 감산하지 않음 |
| G41340–41342 | dx=cos(locked_sbAng)*9*sp, dy=sin(locked_sbAng)*9*sp. **canMv XY 1회**의 bool ack가 true일 때만 x→y 덧셈. X/Y fallback·막힘 즉시 종료 없음. facing을 이동 방향으로 대체하지 않음 |
| G31723,41343 | 이동 결과를 적용한 뒤 원문 sqrt 거리 < P.r+e.r+20, P.iframes<=0. 동일 거리 경계는 제외. 이 바깥 gate에 charge 제외를 추가하지 않음 |
| G41344–41348 | 보호 contact 전체를 `resolve_shield_bash_contact`로 요청. **isPWin 먼저**, false일 때만 not charge 피해/KB/stun. BC07 sweep의 multiplier1.8/KB10·기존 parry×3/stunned60 recipe 재사용, parry angle은 `_sbAng+π`, poise는 **25**로 원문 차이 반영 |
| G41346–41348 | 피해 `~~(atk*1.8*elMul(e.el,ar().el))`는 element 적용 **후** ToInt32, 옵션 인자 생략. hurtP 후 새 위치로 KB10 덧셈, 그 뒤 stun=max(P.stunned\|\|0,~~(45*(1-min(.5,_eqAffix('stunRes'))))). 저항 하한0 clamp 없음. 보호 owner가 수행할 계약이며 실제 집행0 |
| G41349 | outer contact gate를 통과하면 parry/normal/charge 모두 recover30 후 break. owner readback의 상태/타이머가 바뀌어도 이 원문 쓰기가 뒤따름. timeout과 우선순위를 합치지 않음 |
| G41350–41351 | contact가 없을 때만 st2<=0이면 recover25. 그 외 active 유지. 공통 다음 tick recover의20 clamp는 별도 owner |

새 `native_ch2_boss_shield_bash.gd`는 `begin_tick(si,enemy,sp,player)`→`next_tick(token,response)` API다. CH2 catalog bridge/context 및 BC07 `_command/_write/_distance/_aim/_contact` 등 기존 helper를 수정 없이 재사용한다. `executed=false`, `full_tick_complete=false`, 직접 RNG ledger는 비어 있다. 이 switch에 직접 Math.random은 없으며 SFX/보호 helper 내부 난수 소비는 owner/fixture cursor가 공급한다.

| 입력·응답 | 경계 |
|---|---|
| stage/state | catalog가 지원하는 CH2 si4..9, bossSBashWind/bossSBash만. 강제 상태 fixture를 move 해금/선택/실actor 지원과 혼동하지 않음 |
| snapshot | 공통 actor/player finite 수치 + `_sbAng`, player.kb x/y, optional stunned 숫자/null/누락. finite sp. unknown 미소유 필드 보존 |
| collision | 명시 ack + bool value 필요. false도 다음 접촉 gate로 진행하고 축별 재시도 없음 |
| protected contact | 전체 enemy_after/player_after 없으면 NOT_READY. source branch 내부 피해·parry·KB·P.stunned·bank를 자체 실행하지 않고 owner snapshot을 받아 뒤의 recover30 계산만 이어감 |
| continuation | chapter provider/path/hash, owner/version/kind/stage/checkpoint guard. actor/player/token 호출자 사본 불변 대조 |

## 2. 원본 대조 방법·신규 검증

필수 `--node-bin`·`--source-game=<game.html 절대경로>`를 받는다. OS.execute 출력은 모든 조각을 join해 진단에만 쓰고 Node가 새 자기 userdir의 UTF-8 `bc2-07-원본-fixture.json`으로 응답한다. 기존 파일을 먼저 지우며 Node 오류·파일 누락·source hash 불일치·인자 누락은 실패다. 실제 저장·서버 호출0.

Node oracle은 제품 GD를 읽지 않고 **G31723 dst와 G41337–41351 원본 switch bytes 그대로** VM 실행한다. source Proxy가 쓰기/명령 순서를 관측한다. isPWin부터 recover 쓰기 직전까지는 보호 구간의 helper trace/전체 readback으로 별도 관측한다. source 이벤트 대조는 이 구간을 요청 하나로 정규화하고, 실제 source hurtP 인자·parry 배율/각/poise/stun·doParry fresh reads·은행 fallback·KB·stunRes 결과를 descriptor와 별도로 검증한다. 실제 hurtP/hurtE/Q/E body는 fixture stub이며 실전 성공 증거가 아니다.

| 최종 실측 | 값 |
|---|---:|
| source 상황 / events | 1,494 / 5,695 |
| contact / 그중 parry / 비parry charge | 645 / 207 / 168 |
| collision 조회 / stunRes 조회 | 918 / 270 |
| 신규 검사 / 실패 / skip | **30,191 / 0 / 0** |
| 기존 회귀 / 실패 | **332,010 / 0** |
| 최종 양성 합계 | **362,201 / 0** |

stage/state/time/sp/충돌/normal·parry·charge·iframe 행렬, post-move 거리 strict 전후/동일 경계, Pr/er/margin20, facing≠locked-angle/다회전/0·음수 sp, 충돌 false 후 접촉, contact와timeout 동시조건 우선순위, charge+parry 우선순위, owner가 바꾼 위치·각·atk·상태·타이머, 음수/overflow atk·baseAtk, element0/분수, parryBank 누락/null/0/음수, stunRes 음수/.5 전후/큰값과 기존 stunned 누락/null/0/높은값을 포함한다.

분기 입력은 little-endian binary64 hex로 복원한다. 출력 부동소수는 기존 BC2 방식의 `1e-12*max(1,abs(expected))`로 비교하고 필드·명령·수·순서를 대조한다. 신규 양성 exit0/ERROR0/stderr0byte/skip0. 제품/기존 검사 약화 없이 실제 실패 로그는 모두 보존한다.

## 3. 기존 회귀 무수정

| 기존 테스트 | 최종 검사 | 실패 | 이전 검사 수 |
|---|---:|---:|---:|
| ch1_bc01_catalog | 681 | 0 | 681 |
| ch1_bc02_spawn | 5,257 | 0 | 5257 |
| ch1_bc03_utility | 31,976 | 0 | 31976 |
| ch1_bc04_selector | 21,899 | 0 | 21899 |
| ch1_bc05_phase | 18,424 | 0 | 18424 |
| ch1_bc06_start | 14,099 | 0 | 14099 |
| ch1_bc07_melee | 14,531 | 0 | 14531 |
| ch1_bc08_movement | 24,788 | 0 | 24788 |
| ch2_bc2_01_catalog | 7,169 | 0 | 7169 |
| ch2_bc2_02_reuse | 44,891 | 0 | 44891 |
| ch2_bc2_03_new_start | 25,749 | 0 | 25749 |
| ch2_bc2_04_vortex | 41,373 | 0 | 41373 |
| ch2_bc2_05_bean_rain | 35,164 | 0 | 35164 |
| ch2_bc2_06_fan_wave | 46,009 | 0 | 46009 |
| 합계 | **332,010** | **0** | **332,010** |

BC01~08 GD/UID16개를 인수 SHA-256으로 고정했고 소계 **131,655/0** 불변이다. BC2-01~06 포함 총14종의 기존 테스트/기대값/검사 수 수정0. 기존 제품과 CH2 테스트/oracle은 merge 기준 byte와 외부 검증 사본을 대조했다. BC08 등 기존 외부 인수 자료는 참조 실행만 하고 이번 제품 커밋에 끼워 넣지 않았다. 기존 파일 상수 userdir를 매 실행 쓰고 bc02/03 source-game을 전달했다. 최종 모든 기존 양성 exit0/ERROR0/stderr0byte/skip0. 무관한 전체 게임/실전 회귀 PASS 주장은 하지 않는다.

## 4. 결함 주입·인자 거절

정상 source fixture/테스트/oracle은 유지하고 외부 mutation-project의 **신규 제품 파일만** 바꾸었다. 각 실제 exit1/FAIL 원로그를 보존하며 양성 합계에서 제외한다. mutant 복구 및 마지막 source fixture의 정상본과 hash 동일성을 확인한다.

| 주입 | 변경 | 검사 / 실패 | 결과 |
|---|---|---:|---|
| wind-duration | `"s":"bossSBash","st2":18` → `"s":"bossSBash","st2":17` | 30,191 / 577 | exit1 / 검출 |
| locked-dash | `cos(e["_sbAng"])*9` → `cos(e["facing"])*9` | 30,186 / 1,003 | exit1 / 검출 |
| collision-bool | `if response["value"]:` → `if true:` | 30,006 / 565 | exit1 / 검출 |
| distance-strict | `<p["r"]+e["r"]+20` → `<=p["r"]+e["r"]+20` | 30,116 / 30 | exit1 / 검출 |
| charge-contact | `and p["iframes"]<=0:` → `and p["iframes"]<=0 and p["s"]!="charge":` | 27,815 / 624 | exit1 / 검출 |
| parry-poise | `["poise"]=25` → `["poise"]=20` | 30,191 / 852 | exit1 / 검출 |
| stun-cap | `"resistance_cap":0.5` → `"resistance_cap":0.4` | 30,191 / 675 | exit1 / 검출 |
| contact-recovery | `"s":"recover","st2":30` → `"s":"recover","st2":25` | 30,191 / 1,291 | exit1 / 검출 |

--node-bin 누락과 --source-game 누락은 각각 **3검사/1실패 exit1**로 거절했다. 통과 합계에 더하지 않는다. source 없는 합성 PASS/fallback 없음.

## 5. 작성 파일·격리·보호

| 작성 파일 | 역할 |
|---|---|
| godot/scripts/native_ch2_boss_shield_bash.gd + .uid | 새 독립 packet 계산 |
| godot/tests/test_boss_ch2_bc2_07_shield_bash.gd + .uid | 신규 원본 대조/불변/거절 검사 |
| godot/tests/bc2_07_source_oracle.cjs | 원문 VM·자기 UTF-8 fixture |
| docs/engine/orders/reports/bc2-07_REPORT.md | 보고 |
| docs/CHANGELOG_SYNC.md | 맨 위 기존 형식 동기화 절 |

**merge `baa75b16e920ada4f1f44c52a457f2b875a1ebfe` 이후 신규 7경로만 작성**. BC2-06 의존 이력의 인수7경로는 별도 merge이며 새 작성과 구분한다. 공용6(main/hud/world/player/native_normal_enemy_hurte/native_source_new_run_state)·기존 BC 모듈/테스트·다른 담당·원본·세이브·형식·LOCK·보호Q/E 문서·바이너리 변경0. scope-verification.json으로 byte 확인했다.

--no-checkout+sparse-checkout, 약68MB의 필요한 스크립트/테스트/Markdown만 받았다. 새 빈 index를 HEAD로 초기화한 뒤 sparse 경로를 checkout-index로 물리화하고 clean 상태를 확인했다. 유일한 CHANGELOG merge 충돌은 BC2-06 절+main 전체 본문을 보존해 해결했다. 정상 pre-commit 훅 사용, 정확한7경로만 stage. 기존 ignore에 걸리는 자기 test GD/UID2경로만 명시 git add -f -- 적용. add-A/훅 우회0.

모든 Godot 전 지정 pgrep/wc 검사, 2 이상이면30초 대기. 자기 Godot는 순차 실행하며 타 프로세스 종료0. 신규 userdir는 **EXODUSER-bc2-07-Isolated-20261020**, 기존은 각 파일 상수. 매 실행 override, finally에서0byte. argv/exit/stdout/stderr/engine/gate를 원로그에 보존하고 execution-verification.json에서 양성·의도된 음성·gate·순차·override를 구분한다. R의 HEAD/branch/index/work/untracked 시작값을 대조하며, 자기 branch push→원격SHA 일치→DONE 기록 후 자기 worktree만 제거하고 브랜치는 남긴다.

## 6. 실제 연결 HOLD·후속

| 접점 | 필요한 위치·근거 / 상태 |
|---|---|
| Main/State | G40444–40454·BC05 감산 후 dispatcher. 두 상태의 packet 소비·정확 checkpoint 연결 HOLD. source updateE 전체가 아님 |
| collision | G41342 canMv XY만의 실제 월드 충돌·actor 위치 반영 owner HOLD. snapshot 계산만 검증 |
| protected contact | G41344–41348 isPWin/hurtP/boss hurtE/doParry/poise25/은행/KB/P.stunned/장비 stunRes owner. 같은 순서의 실제 집행·완전 readback/내부 RNG cursor 계약 필요. Q/E·피해·저항 실제 성공 미확인 |
| 투사체·음향·종료 | 본체 직접 projectile 요청0. 실제 투사체 owner·SFX.block·recover 공통20clamp/다음 AI 연결은 후속 통합 HOLD |
| 다음 BC2-08 | trace §5.2 spiralBullet queue계산. 이번 shieldBash2 범위까지만 진행, 다음 단위 미착수 |

관련 docs shieldBash2/bossSBash/방패돌진/stunRes 전체 Markdown 검색 결과를 docs-keyword-audit.txt에 보존했다. 일반 etype6 shieldBash와 이 보스 기술을 혼동하지 않았고 기존 수치/설계는 그대로 두었다. 시작/새 계산/실제 연결 상태 차이는 이 보고와 CHANGELOG에 보충했다. **실제 화면·플레이·성능·PC 동기화 미확인**.
