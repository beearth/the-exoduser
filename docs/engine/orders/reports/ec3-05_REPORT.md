# EC3-05 — etype42 시체 흡수·분비 순수 leaf

## 범위·기준·의존

| 항목 | 실제 근거 |
|---|---|
| 작업 | ec3-05 / codex/ec3-05-20261020 / ~/exoduser-wt/ec3-05 |
| fetch 최신 main | 823c24baee3f6c5f058ebfd7776721e86f80bd18. 요청 최소823c24bae 충족, EC3-03 포함 |
| 승인 의존 | EC3-04 113eb78d12f0ed88c8d24808d165fea1d0e419dc |
| 정상 병합 기준점 | 9258eac1b5a367e6b2cf40caee5a8667d9252c2c. 첫 부모 위 main, 둘째 부모 EC3-04. rebase/reset/force0. CHANGELOG 충돌은 main 전체 byte를 보존하고 승인 EC3-04 절만 앞에 추가 |
| 지시서 | codex/trace-enemies-ch3-20261020 20b2139a7f140f13dc37deb082e471c494d6fa77, FDG_SOURCE_TRACE_ENEMIES_CH3_20261020.md §4.2 EC3-05 행 |
| WORK_BOARD | P2-008a/FIX는 main 병합, P2-008b 진행 소유는 etype47/factory. 신규42 순수 leaf/test와 경로 중복0. 보드·타 actor·World·factory 수정0 |
| 재사용 | EC2-02 native_ch2_enemy_constructor_policy::Draws, 기존 combat_stat_formula::js_to_int32, equipment_affix_reader::js_truthy 직접 preload. EC3-02의42 초기3draw와 동일 stream 검수. HP 생성식·Player heal·별도 JS truthy/ToInt32/거리공식 복제0 |
| 변경6파일 | 신규 native_ch3_enemy_absorb_policy.gd·test_ch3_enemy_absorb_policy.gd·각 UID, 이 보고서, CHANGELOG_SYNC 최상단 자기 절 |
| 보호 | 기존 원본·Godot scripts/tests/data/scene 등405파일 SHA256 불변 확인. 공용 Main/State/저장·다른 담당·기존 테스트 변경0줄. R HEAD dd49171c5b88e211575a41f185395d6c0a14b184 / branch codex/mac-live-play-time-main-20261017 / tracked INDEX·WORK 보존 |

이는 순수 계산·요청/응답 프로토콜 구현이다. 실제 corpse/actor HP·좌표 writer, deadpool 소유·registry 삭제, World·factory·Main/State·저장, Player heal 함수 연결은 **0/HOLD**다. READY는 이 API의 부분 결과이며 제품 적용이나 실제 처치 시체 흡수 성공을 뜻하지 않는다.

## 최신 main 원본 행·정확 값

game.html 전체 SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, G39337–39356 전용 if SHA256 `dcb62cfb5f57b97a05fca17a4121aa3d710cb01cf6309361978a09ce331ace0b`를 테스트가 고정한다. 최신 main blob과 입력의 byte 동일함을 확인했다.

| 원본 행 | 보존한 내용 |
|---|---|
| 39337–39338 | etype42 && s==='idle' 외곽 한 번. AbsorbCd·SpitT 각각−sp. idle 밖에서는 필드/쿼리/난수/명령 모두 동결 |
| 39340–39341 | AbsorbCd<=0이면 즉시180+60U reset. 시체 없음/미일치/HP가 가득 차도 이 draw/reset은 수행 |
| 39342–39343 | 매 반복 ens.length → ens[index] → 그 참조의 dead를 다시 읽는다. dead 부재/false는 건너뛰며 alive=false로 대체0. JS truthiness 보존. 참이면 corpse.x→actor.x→corpse.y→actor.y 순서 후 원본 Math.hypot(dx,dy)<80 |
| 39344 | 첫 일치 시 mhp/hp를 해당 위치에서 재조회해 `min(mhp, hp+ToInt32(mhp×.15))` 요청. 최대 HP의15%, 음수 trunc는0방향, clamp·큰값 int32 wrap 보존. 이미 full/overfull이어도 원본대로 쓰고 이어서 시체 좌표 처리 |
| 39345–39346 | 선택 참조 x=−9999 → y=−9999 → 현재 actor 위치의 parts(#ff6644,8) → break. 가까운 순 정렬·자기 제외·consume flag·dead/alive 변경·ens 제거·deadpool 이동·부활0 |
| 39351–39354 | 독립 if SpitT<=0 && 60<cached d<1200. SpitT=SpitCd / s=eShootWind / st2=60 / chargeEl=D3 / deferred fire 바인딩 요청. 흡수/FX 뒤에도 외곽 idle을 다시 검사하지 않음 |
| 39354 callback | 실제 callback 호출 시 현재 P−현재 e의 atan2. eProjAt(speed2.5, 요청dmg배율.8, D3, life200, #dd4466, size5) → 현재 e 위치 y−15의 분비 text(#882233,life25). 진입 시 조준값/목표 저장0 |
| 31271–31273 | EC3-02 초기 AbsorbCd180+60U → SpitCd200+80U → SpitT80+40U. 새 T/전역clock을 만들거나 초기 RNG를 앞으로 옮기지 않음 |

`dead` 실제 생성/사망 경로와 수명, 현재 registry의 정확 참조를 실제 owner가 제공해야 한다. 원문에 없는 `!alive` 판정으로 자연 도달성을 보정하지 않는다. 시체를−9999로 옮겨도 registry 항목은 남는다. actor와 같은 참조가 들어 있는 명시 fixture도 원문처럼 처리하며, 임의로 self 제외하지 않는다. `d`는 전용 블록 진입 시 값이므로 좌표 변경 후 Spit 판정에서 재계산하지 않는다.

## API·원본 순서와 확인 경계

`begin(actor,context)`는 etype42 snapshot과 cached d/sp를 받는다. idle 밖이면 입력 그대로 done=true, 그 외 첫 명령은 두 clock 쓰기 요청이다. `resume(continuation,response,random_unit,readers)`는 직전 명령의 seq/op/ack와 실제 읽기 결과가 빠지면 NOT_READY다. 외부 snapshot/continuation을 직접 변경하지 않고 복사한다.

| 요청·읽기 | 계약 |
|---|---|
| actor_fields | 요청 fields가 적용됐다는 applied=true와 완전 actor_after가 필요. 각 요청 필드와 읽기 결과가 다르면 중지. 첫 clock 쓰기 확인 후에만 원래 위치의 RNG를 소비하고 reset 쓰기를 요청 |
| registry readers | length()·entry(index)로 현재 배열 순서를 읽고, entry는 owner의 opaque String 참조를 돌려준다. 실제 시체 배열/registry를 이 leaf가 만들거나 소유하지 않음 |
| dead(ref) | present/value 구조로 부재를 명시. 기존 JS truthy helper 직접 사용, null/false/0/빈 문자열은 false, 배열/객체는 빈 것도 true |
| coordinate(ref,axis) | 원본 읽기 순서 corpse.x/actor.x/corpse.y/actor.y를 그대로 호출. 참조가 actor와 같을 때도 순서 유지. 필드 제공자는 이 원본 위치의 현재 값/유효 참조를 제공해야 함 |
| source hypot(dx,dy) | 원본 Math.hypot의 float64 결과를 제공하는 읽기 전용 경계. leaf는 인자를 만들고 **strict <80** 비교를 소유한다. 새 sqrt/Vector2 float32/별도 거리 authority를 만들지 않음. 실제 Godot adapter는 미연결/HOLD |
| actor("heal") | 거리 일치 후 해당 위치의 완전 현재 snapshot을 읽는다. 진입 시 HP로 계산하거나 Player heal 함수/회복 수식으로 바꾸지 않음 |
| HP 쓰기→corpse x→corpse y | 각 쓰기의 seq/op/대상 ref/applied·읽기 결과를 확인한 후에만 다음 요청. corpse_after의 x/y와 요청 필드 값 확인. ref가 actor인 alias는 actor_after 좌표도 일치해야 함 |
| addParts | actor 현재 위치를 소비하는 symbolic 요청. executed=true와 actor_after를 확인한 뒤 break 이후 Spit 계산. 효과/RNG writer를 leaf가 호출하지 않음 |
| arm_spit | 원본 순서의4필드와 FIRE{owner:EC3-05/v1,entry:fire} 바인딩 요청. 실제 owner가 callback 설치 후 fire_binding 읽기 결과를 제공해야 함. descriptor 자체를 제품 _swFire Callable처럼 취급하지 않음 |
| fire(actor,read_player) | 나중 실제 windup callback owner가 호출할 순수 함수. 호출 순간 read_player() 한 번, 현재 actor/P로 조준. shot 요청 뒤 text는 position_ref=actor로 현재 위치를 늦게 읽도록 요청. 실제 탄/FX 집행0 |

각 READY는 단일 미집행 명령 또는 done=true snapshot이며 full_tick=false/product_connected=false다. source owner가 동일 원본 실행 문맥에서 순차 적용/재개해야 한다. await로 다른 World tick을 끼우거나 이전 continuation을 재집행하는 실제 scheduler는 이번에 만들지 않는다. readback은 구조·일치 검증 계약이며, fixture의 ACK를 실제 제품 쓰기 증거로 세지 않는다.

중도 NOT_READY가 발생해도 **앞서 owner가 ACK한 prefix를 되감거나 숨기지 않는다**. 예를 들어 clock 쓰기 확인 뒤 잘못된 난수면 해당 clock 쓰기는 이미 외부에서 수행된 것이고, 실패 결과에는 실제 난수 소비1이 남는다. 늦은 registry/좌표/HP/FX/바인딩 미준비도 원래 지점에서 멈추며 가짜 done·fallback은 없다.

## 독립 원문 oracle·검증 방법

Node 내장 fs/vm/crypto로 최신 원본 if 블록을 그대로 발췌한다. 관측용 Proxy로 ens length/entry/dead/좌표 읽기와 field 쓰기를 기록하고, 원본 Math.hypot의 인자·결과 및 HP 대입 직전 snapshot을 관측한다. 원래 수식·조건·콜백 본문을 GDScript 복제품으로 expected 생성하지 않는다. 효과/탄/registry는 명시적인 JS 관측 fixture이며 게임 전체 실행이 아니다.

| 검사 | 실제 입력 범위·의도 |
|---|---|
| 단일1850tick | AbsorbCd/SpitT0·1·5, sp0·1·2, cached d0/60/바로위60/100/바로아래1200/1200 × 빈 registry/부재dead/false/근거리/80동일·바로아래·위/첫대최근접/먼후근접/자기 alias. seed180 추가 |
| dead·동적 registry | dead false/0/1/−1/null/빈문자열/문자열/빈배열/빈객체. 두 번째 length 조회 시 append/shift fixture로 고정 배열 snapshot·정렬 사용을 검출 |
| HP | hp0/99/100/120/−10 × mhp0/1/6/7/99/100/큰 int32-wrap 값. HP가 늘지 않아도 corpse 쓰기/parts/break 수행 |
| 연속40tick | 첫/먼후근접/자기/부재dead 4종×10. 이전 Godot actor/pool/refs 결과를 다음 실제 입력으로 이어, 원문과 재조회·반복 선택·남은−9999 항목을 대조 |
| callback2496회 | 진입 후 actor/P를 수평·수직4방향으로 바꾼 원본 callback 실행과 비교. shot 후 actor 위치를 바꾸는 fixture도 text의 늦은 읽기 비교. 등록 시 P 조회0, fire당 현재 P 조회1 |
| ACK·실패 | 누락/잘못된 seq/op/applied/readback·다른 corpse ref·미적용 x·미확인 FX/바인딩·무효 RNG/registry binding/source hypot/current P·잘못된 snapshot 진단. 응답 없이 HP→x→y→FX/Spit 자동 진행0 |
| 기존 재사용 | EC3-02 초기 U.25/.5/.75 뒤 absorb U.5를 동일 stream으로 소비. 초기값195/240/110, 이후 reset210/SpitT240 확인 |

Hypot 테스트는 원문 결과를 provider 응답으로 재생하고, **실제 제공 인자/모든 조회 순서가 원문과 정확히 같음을 별도로 비교**한다. GDScript의 Math.hypot 구현·공간 registry adapter를 검증했다고 주장하지 않는다. callback의 조준은 native atan2를 사용하며 이 검사에서는 정확히 표현 가능한 축 방향 입력을 쓴다. 새 거리·타이머·회복·각도·명령 비교 모두 허용오차0이다.

draws는 이 leaf가 원본39341에서 소비한 난수만 센다. addParts/eProjAt의 내부 난수·부수효과는 외부 owner 책임이며 원문 oracle에서는 명시 stub이다. 전체 게임 seed/전체 RNG stream 동등성으로 확대 집계하지 않는다.

명시 --node-bin 절대 경로, OS.execute 출력 join 진단, 작업 격리 userdir의 새 UTF-8 helper/JSON 임시 파일, source/block hash pin, double little-endian binary64/base64 복원, 사용 후 파일 제거를 적용했다. stdout JSON 재파싱 오차나 엔진 ERROR를 허용오차·무시로 처리하지 않는다.

## 실행 결과·경고

Godot4.7.2.stable.official.ed1daf0bf / Node24.15.0. cold import는 exit0/ERROR0/WARNING0. 신규 test_ch3_enemy_absorb_policy는 첫 실행(new-first) **44738검사/0실패**, 원문1890tick/callback2496회, exit0/ERROR0/WARNING0/skip0/허용오차0이다. 이 작업의 신규 실패 실행은 없다. 통과 후 제품/신규 검사 변경이나 불필요한 재실행0이다.

새 userdir EXODUSER-ec3-05-Isolated-20261020, 기존 회귀는 파일 상수 격리 이름(상수 없는 파일만 작업 격리 이름)을 쓴다. 매 Godot 실행 전 정확한 pgrep 명령을 확인하고2개 이상이면30초씩 기다렸다(godot-count.log). 자기 runner는 직렬·lock 처리하며 매 실행 finally override.cfg0byte를 확인했다. 장시간 실행 대기와 실제 테스트 실행 시간을 구분하며, 대기 자체를 PASS로 세지 않는다.

| 기존 회귀 | 실제 수치 | exit / ERROR / WARNING |
|---|---:|---|
| test_ch3_enemy_guard_policy | 36588 / 0실패 | 0 / 0 / 0 |
| test_ch3_enemy_phase_policy | 33177 / 0실패 | 0 / 0 / 0 |
| test_ch3_enemy_catalog_policy | 12602 / 0실패 | 0 / 0 / 0 |
| test_ch3_enemy_spawn_policy | 10234 / 0실패 | 0 / 0 / 0 |
| test_ch2_enemy_constructor_policy | 159902 / 0실패 | 0 / 0 / 0 |
| test_ch2_enemy_spawn_policy | 7483 / 0실패 | 0 / 0 / 0 |
| test_contracts | 5그룹 / 0실패 | 0 / 0 / 0 |
| test_encounter_factory | 3그룹 / 0실패 | 0 / 0 / 0 |
| test_p3002_spawn_holes | 298 / 0실패 | 0 / 0 / 2 |
| test_native_element_projectiles | 4그룹 / 0실패 | 0 / 0 / 1 |

기존 검사/파일 변경0, 회귀 숫자 단정260284/0과 그룹12/0을 구분한다. 신규 포함 숫자 단정305022/0이다. 모든 결과의 only=[]/skipped=[] 또는 예정 그룹 전체 실행을 확인했다. stdout/stderr/engine/실행JSON을 분리 보존했고 성공 실행의 engine 로그에도 ERROR가 없다.

이번 Mac(823c24bae+EC3-04 기반)에서는 아래 WARNING이 spawn_holes2/element1로 남았다. 전체 stderr가 이전 EC3-04 Mac 기록과 byte 동일하다. 사용자가 제공한 **PC 통합본823c24bae WARNING0은 별도 측정 정보**이며, 이를 이번 Mac WARNING0으로 바꿔 보고하지 않는다. Mac/PC 차이 원인은 미확인, 이번 범위에서 수정0이다. 이전 EC3-04가 기록한 main249 재현 근거와도 실행 기준을 구분한다.

```text
WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.
WARNING: 8 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

Camera는 두 파일에 각1, ObjectDB는 spawn_holes에1회다. 결과/원문은 ~/exoduser-wt/_out/ec3-05/의 new-first.*·test_*.out.log/err.log/engine.log/json, regression-summary.json, source-oracle.cjs/json, run.py에 보존한다. 문서검사·정상 pre-commit hook 후 자기 브랜치만 push하고 원격 SHA/DONE를 확인한 뒤 자기 worktree를 제거한다.

## 공용 접점·HOLD 인계

| 위치·근거 | 별도 인수 필요 / 이번 수정 |
|---|---|
| etype42 실제 actor / G39337–39356 | 현재 snapshot·cached d/sp·동일 원본 callsite의 동기 요청 소비/identity·정확 ACK/readback 필요. actual actor·World·factory admission 생성/변경0 |
| ens / corpse / G39342–39346 | ens.length/entry/현재 dead·좌표·actor HP의 provider와 실제 HP/x/y writer는 기존 owner. deadpool을 새 authority로 사용하거나 registry 삭제·상태 flag 변경0. source Math.hypot float64 adapter actual binding도 미확인/HOLD |
| eShootWind / G39352–39354 및 common windup | _swFire 실제 Callable 설치·60tick 공통 clock·호출 수명·current P callback·사망/취소 처리·탄/FX owner 별도. 실제 deferred dispatcher/가짜 World0 |
| Main/State/저장/Player heal | 공용·저장 포맷·Player heal 연결/대체0. 다음 EC3-06 착수0. 순수 leaf/ACK fixture 검수가 실제 흡수·분비·전투·PC/실플레이·성능 성공을 의미하지 않음 |

관련 docs 전체 키워드 검색 결과는 docs-keywords.log에 보존한다. 타 설계/추적 문서의 제품 상태를 완료로 승격하지 않고, 정확 수치/API/부분 구현/HOLD 경계를 이 보고서와 CHANGELOG에 동기화한다.
