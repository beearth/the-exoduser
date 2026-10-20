# EC3-03 — etype40 위상 상태·명령 순수 leaf

검수 대기. 실제 actor·World·factory·Main·State·피격/이동 writer는 연결하지 않았다. 이 보고서의 READY는 원본 전용 블록의 순수 계산 결과이며 실제 게임의 위상 무적/이동/기습 성공 증거가 아니다.

## 기준·의존·소유권

| 항목 | 근거 |
|---|---|
| 작업 | ec3-03 / codex/ec3-03-20261020 / ~/exoduser-wt/ec3-03 |
| 최신 main | fetch 결과 `249c26fad989071a94c19128e524ce0bbcb2c8c9` |
| 승인 의존 | EC3-02 `fb8e80d03dfb7fa073ed9aaf1820bb86306b2c75` |
| 정상 merge 기준점 | `0aa7690e0fb74bd8c5f3188d9ec2c2eacab9f175`, 첫 부모=위 main, 둘째 부모=위 EC3-02. rebase/reset/force 없음. CHANGELOG 충돌은 양쪽 절 전부 보존 |
| 지시서 | 원격 codex/trace-enemies-ch3-20261020 `20b2139a7f140f13dc37deb082e471c494d6fa77`의 FDG_SOURCE_TRACE_ENEMIES_CH3_20261020.md §4.2 EC3-03 행을 읽기 전용 참조 |
| WORK_BOARD | main WORK_BOARD:63–64·135–136의 P2-008a/FIX는 main 병합, P2-008b는 factory·etype47 소유. 이번은 신규 etype40 pure leaf/test로 경로·consumer 변경 중복 없음. 보드·다른 담당 파일 수정0 |
| 기존 재사용 | native_ch2_enemy_constructor_policy.gd::Draws를 실제 preload해 [0,1) 유효성·소비 count/error를 재사용. 테스트는 EC3-02 build 초기값과 이어지는 같은 RNG stream도 검사. CH2/CH3 초기 catalog·HP식 복제0 |
| 허용 변경 | 신규 native_ch3_enemy_phase_policy.gd·test_ch3_enemy_phase_policy.gd·각 UID, 이 보고서, CHANGELOG_SYNC 최상단 자기 절. 병합 기준점 대비6파일 |
| 보호 재검사 | 병합 기준점 기존 game.html·Godot scripts/tests/data/scene 중395파일 SHA256 불변. R HEAD dd49171c5b88e211575a41f185395d6c0a14b184 / branch codex/mac-live-play-time-main-20261017 / tracked INDEX·WORK 불변. 기존 CHANGELOG 전체 본문 byte 보존, 새 자기 절만 추가 |

## 최신 main 원본과 정확 계약

최신 main의 game.html과 작업 입력은 byte 동일하다. 전체 SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, 전용 블록 SHA256 `c4e332b65a6b554dab5e23e1f688b1506cafbfc9cd6b6d8b8352cb4366874b95`, hurtE 단일 게이트 SHA256 `45b2a3771bf13a71a006f7c21368e51d0513893837671756add66718c406c7c7`를 테스트에 고정한다.

| 원본 행 | 상태·순서·정확 수치 |
|---|---|
| 39289–39294 | etype===40 && s==='idle' 외곽 검사 한 번. T-=sp 후, !phasing && T<=0 && d<1200이면 phase=true·T=60+30U·소멸 text(y−15/색#aa66ff/life20) 요청 |
| 39295–39301 | phasing이면 같은 tick에도 다시 T-=sp. 현재 P−현재 e 좌표 atan2, speed×1.5×(_aSpdM\|\|1)×sp. canMv(nx,ny,r) 참일 때만 로컬 좌표 투영 |
| 39303–39307 | T<−60이면0. T<=0 또는 d<30이면 phase=false/T=Cd. d<50이면 현재 이동 후 위치에서 조준하여 eProjAt(speed5, 요청 dmg배율1.5, e.el, life60, #aa66ff, size2), 기습 text(y−10/life25), parts4 순서 |
| 39310–39315 | 별도 if(!phasing && d>30 && d<1200). speed×(_aSpdM\|\|1)×sp의 일반 이동 요청. 해제 tick에도 추가 canMv/이동 가능, 앞선 이동이 차단됐어도 이 검사는 실행 |
| 42154 | etype40 && phasing이면 hurtE의 해당 위치에서 return 요청. s=idle 여부와 무관하며 DOT 예외를 새로 만들지 않음 |
| 31263–31265 | EC3-02 소유 초기값 T120+60U / Cd240+80U / phase=false 재사용, 본 step이 초기화하거나 재추첨하지 않음 |

`d`는 호출자가 원본 전용 블록 진입 전 계산한 거리이며 이동 후 재계산하지 않는다. 반대로 각 이동 및 기습 각도는 그 시점의 로컬 투영 좌표에서 다시 계산한다. `_aSpdM` 부재/null/false/0은1, true는1, 유한 음수·양수는 그대로 유지한다. e.el 부재와 명시 null을 구별하며 물리 원소 기본값을 채우지 않는다. canMv 거짓을 벽 통과로 바꾸지 않는다.

## API와 집행 경계

| API | 입출력·책임 |
|---|---|
| step(actor,context,random_unit,can_move) | actor는 etype40, s, x/y, speed/r, _wraithPhaseT/Cd/Phasing, 선택 _aSpdM/el. context는 미리 계산된 d/sp와 현재 px/py. 원본 블록 호출 위치의 snapshot을 전달 |
| READY | fields에는 T·Phasing만, position에는 로컬 투영 x/y, commands에는 순서 있는 move/addTxt/eProjAt/addParts 요청. draws는 실제 소비, full_tick=false/product_connected=false. caller Dictionary와 중첩 값에 쓰기0 |
| move 명령 | site=phase/ordinary, 후보 x/y/r, canMv 결과 allowed. predicate는 호출자 기존 canMv를 읽기 전용으로 사용한다. 반환 local position은 다음 원본 위치의 계산용이며 실제 Node·World 위치 writer가 아니다 |
| NOT_READY | 무효 context/actor·Callable·난수·canMv 응답은 reason/실제draws. fields/position/commands 반환0, 부분 집행 없음. 이미 읽은 RNG·predicate 소비를 되감지 않음. 자체 RNG/reseed/fallback 없음 |
| hurt_return_request(actor) | 원본42154에서 사용할 return_requested/source_line/complete_hurte=false. 다른 etype은 false, etype40의 flag 누락/무효는 NOT_READY. HP/poise/iframe/사망 쓰기0 |

**실제 writer 연결 HOLD:** canMv를 평가하는 동안 같은 snapshot/장애물 상태가 유지되어야 하며, 반환 명령을 실행하는 actor owner가 필요하다. 외부 상태가 바뀌었거나 callback이 실제 이동까지 집행한다면 이 순수 API 계약 밖이다. 이번 구현은 command dispatcher·ack·실제 이동 writer를 만들지 않는다. eProjAt의 공통 mouth/bean/정상화/생성·경고와 FX/localization owner도 별도다. raw dmg_mul1.5 요청이 최종 실제 피해1.5 보장이라는 뜻이 아니다.

## 원문 oracle·수치 검증 방법

최신 game.html에서 전용 if 블록을 변형 없이 발췌해 Node VM의 tick 함수에 넣는다. canMv와 FX 함수만 관측 fixture로 제공한다. hurt 게이트는42154 원문 한 줄을 별도 실행한다. updateE 전체·실제 충돌맵·피격 전체를 실행한 것으로 세지 않는다.

`--node-bin` 필수 절대 경로를 받고 OS.execute 출력은 join한 진단만 사용한다. 테스트 helper와 결과는 작업 격리 userdir의 새 UTF-8 임시 파일에 쓰고 사용 후 삭제한다. 모든 double은 little-endian binary64/base64로 수송해 JSON decimal 재파싱 오차를 없앤다.

- 단일 tick 2,048건: 30/50/1200 바로 아래·동일·위, T−61/−60/0/1/2/60, sp0/1/65, 기존 phase/진입, canMv TT/FT/TF/FF, 현재 P 조준, e.el 누락/null, 배속 JS truthiness와 non-idle 동결.
- 연속 8×80=640 tick: 원본 이전 출력과 Godot 이전 출력을 각각 다음 입력으로 이어서 상태·RNG·명령을 대조.
- hurt site16조합: etype0/20/39/40/41/47/49/90 × phase bool. 매 tick 전후 phase gate도 대조.
- 독립 golden: T5→3, 진입 U.5에서75→74, 해제 tick phase 이동3+일반 이동2, 명령 move→shot→text→parts→move, d30/50/1200 엄격 경계. EC3-02 init의 U.25/.75 뒤 본 step U.5 stream 검수.
- 무효 입력/난수/canMv·두 번째 predicate 실패·호출자 입력 불변·실제 callback 소비/부분 READY 금지 검사.

타이머·분기·난수 소비·명령 종류/순서/개수·축 방향 golden은 허용오차0이다. 임의 각도600건의 XY·angle에만 V8/libm 삼각함수의 forward error 한도를 쓴다. ε=2⁻⁵², S=max(1,입력 x/y/Px/Py 절댓값, |speed×배속×sp×2.5|). 한 번 조준의 XY 한도는8εS, 각도는8ε×max(1,|angle|)이다. 첫 이동 허용 후 같은 tick 두 번째 조준이 있으면 첫 이동 후 플레이어 거리 r에 대해 XY 한도를8εS(1+2|일반이동량|/r), 각도는8ε×max(1,|angle|,2S/r)로 계산한다. atan2 기울기 크기1/r와 XY 오차 벡터 norm≤2×개별 오차의 전파를 반영하며, 이 경우 임의각도 fixture의 r>0도 추가 단정한다. 거리 분기·timer·RNG·명령 구조에 이 한도를 적용하지 않는다.

초기 출력 좌표 크기로만 잡은 한도에서는 subtractive cancellation 때문에61실패(new-first, 33029검사)였다. 입력 S 기준으로 바꾼 중간 실행은 두 번째 조준의 조건수를 빠뜨려2실패(new-final, 33029검사)였다. 원문·제품 코드는 바꾸지 않고 검사식에 위 forward error 전파를 반영했으며, 최종33177검사/0실패다. 기존33029단정은 유지하고 두 번째 조준 r>0 검사148개를 추가했다. 최대 관측 절대차3.41060513164848e−13, 최종 bound 단위 ε 대비 최대1.34914457417547(한도8). 두 실패 실행의 stderr 원문과 당시 테스트 사본을 각각 보존한다. 이는 bit-identical trig 보장이 아니며 실제 충돌 경계에서 canMv 결과까지 동일함을 입증하지 않는다. canMv는 정해진 bool 순열의 관측 fixture이며 실제 공간 충돌/actor 검수는 별도 HOLD다.

## 실행 결과

Godot4.7.2.stable.official.ed1daf0bf / Node24.15.0, 새 userdir EXODUSER-ec3-03-Isolated-20261020. 기존 상수가 있는 테스트는 그 이름을 사용하고 상수가 없는 contracts/factory/element는 이 작업 격리 이름을 사용했다. 매 실행 직전 요청한 pgrep 명령을 확인했으며2개 이상일 때30초씩 대기했다(godot-count.log). 자기 runner 직렬 실행·각 실행 finally override.cfg0byte. cold import exit0/ERROR0/WARNING0.

| 검사 | 실제 수치 | exit / ERROR / WARNING |
|---|---:|---|
| 신규 test_ch3_enemy_phase_policy | 33177 / 0실패, 원문2688tick+hurt16조합, skip0 | 0 / 0 / 0 |
| test_ch3_enemy_catalog_policy | 12602 / 0실패 | 0 / 0 / 0 |
| test_ch3_enemy_spawn_policy | 10234 / 0실패 | 0 / 0 / 0 |
| test_ch2_enemy_constructor_policy | 159902 / 0실패 | 0 / 0 / 0 |
| test_ch2_enemy_spawn_policy | 7483 / 0실패 | 0 / 0 / 0 |
| test_contracts | 5그룹 / 0실패 | 0 / 0 / 0 |
| test_encounter_factory | 3그룹 / 0실패 | 0 / 0 / 0 |
| test_p3002_spawn_holes | 298 / 0실패 | 0 / 0 / 2 |
| test_native_element_projectiles | 4그룹 / 0실패 | 0 / 0 / 1 |

기존 회귀8종은 파일/검사 수정0, 모든 결과의 only=[]/skipped=[] 또는 전체그룹 실행을 확인했다. 숫자 단정190519/0과 그룹12/0을 구분하며 서로 더해 임의 검사 수로 만들지 않는다. 신규 포함 숫자 단정223696/0이다. 성공 실행과 별개로 앞선 신규 실패61·2건은 위 기록/원문 로그에 남긴다.

종료 WARNING 원문은 다음과 같으며 원인을 이번 작업에서 진단/수정했다고 주장하지 않는다. 기존 EC3-02 회귀에서도 같은 원문이 기록되어 있었다.

```text
WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.
WARNING: 8 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

첫 문구는 spawn_holes/element 각1, 두 번째 문구는 spawn_holes1이다. 세 WARNING을 ERROR0에 숨기지 않는다. 원로그 위치: ~/exoduser-wt/_out/ec3-03/의 *.out.log / *.err.log / *.engine.log / 실행별 JSON, source-oracle.cjs/json, test-first.gd/test-second.gd, run.py.

## 공용 접점·남은 의존

| 필요 위치 | 통합 요청·근거 / 이번 변경 |
|---|---|
| 실제 etype40 actor tick / canMv adapter | G39289 전 진입 gate·38884 공통 st2 감소·cached d/sp/현재 P/공통 오라 배속을 owner가 제공해야 함. 39289–39316 projection 결과를 원래 순서에 소비할 좁은 adapter 필요. 현재 실제 etype40 actor의 권위 연결 미확인·신설0 |
| 공통 이동 tail | G40458–40519의 별도 movement/contact/FSM은 이번 step에 없음. phase 이동이 updateE 전체를 대신하거나 같은 이동을 중복하지 않도록 owner 인수 필요. world/factory 변경0 |
| native_normal_enemy_hurte.gd:156–160 부근 | 기존 SPECIAL_HIT_ETYPES 차단(원본42136으로 halt) 그대로. 40을 목록에서 단순 삭제하지 않고 원본42154 위치에 phase return을 소비할 별도 승인 통합 필요. 앞선 lesson/생존/부활·pet 등의 원본 순서 보존. 현재 특수 etype 피해 집행자 수정0 |
| actor field owner / factory admission | CH3 전용필드 readback·write 권위, 현재 정확 profile/실제 State provenance가 필요. crawler:408–424 guard 확장/타 actor fallback0. enemy_factory.gd와 world.gd0줄 |
| projectile/FX writer | G39306의 eProjAt·addTxt·addParts 실제 소비와 원소 undefined/null·탄 normalization·동기 RNG/출생 순서는 기존 owner 의존, 공통 emitter/새 fake World0 |
| Main/State/저장 | 제품 owner·save whitelist/포맷 변경0. 순수 leaf 검수가 실플레이·실제 무적/피격/포이즈·지역kill·성능·PC 확인을 대신하지 않음 |

추적/설계 문서에서 현재 제품 구현 상태를 완료로 바꾸지 않았다. docs 전체 관련 키워드 검색은 원로그 docs-keywords.log에 보존하고 이번 정확 수치/API/미연결 상태는 이 보고서와 CHANGELOG에 동기화한다. 다음 EC3-04 착수0.
