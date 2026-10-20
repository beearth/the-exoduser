# EC4-04 — etype51 trigger·death 분리 계획

작업 `ec4-04` / `codex/ec4-04-20261020` / 2026-10-21 KST / 검수 대기. **순수 trigger와 사망 재개 계획만 구현했다. 실 mkEn·child 등록·FX 집행은 HOLD**다. PLAN/complete는 자료 계획 상태이며 실제 출생/전체 death 완료를 뜻하지 않는다.

fetch main `0105159934d0c2a8b167bd51518dca1e0fafe50a`에 승인 EC4-03 `a2b7654c0c6dce5abc7f5cc74c0f54f5eaf23fd8`를 정상 merge한 기준점은 `b1ecde2e726483d943d2bb959f345b8c5d26539d`(위 두 SHA가 부모)다. rebase0. CHANGELOG 충돌은 EC4-03 절+최신 main 전체 byte를 보존했다. main WORK_BOARD/AGENTS와 [CH4 추적 EC4-04](../../FDG_SOURCE_TRACE_ENEMIES_CH4_20261020.md)를 읽었다. EC2-05 `699f2a56f1b517f9c015c56366e044a860395475`의 continuation 형식은 읽기 참조만 하고 미병합 제품 반입0. 실제 main의 Constructor.Draws·Formula.js_to_int32·AffixReader.js_truthy를 재사용했다.

## 원본 계약·API

G는 위 최신 main game.html 1-based. source SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`; trigger3행 SHA `bcacdcb0d2ca7ce377ba3423bc578fd06fe29683fd4cad28cee7301b0d019f2c`; death9행 SHA `c2fef205bee9aa83eb8509ca6a165b2c3c71b78f0bd23811003c1ce24193f9c8`.

| 근거 / API | 정확한 계산·재개 경계 |
|---|---|
| G39521–39523 / trigger | etype51·idle·**d<35+r**이면 telegraph20 / windup / st2=20. RNG0, _amalgCleave를 추가 gate로 쓰지 않음. 전방위 피해/공통 공격 writer0 |
| G42827 / begin_death | !JS truthy(_amalgSplit)를 **진입 때 한 번** 평가. 2회 고정, callbacks 뒤 부모 flag/type이 바뀌어도 loop를 다시 gate하지 않음 |
| G42828–42830 / plan_child | i0→1 순서로 a=PI*i+U → sd=18+8U → mkEn 요청. 각 쌍 사이에 constructor/append/parts owner가 실행되어야 함. 7인자(stage 현재값, etype50, ibfalse, **직접 e.el/e.room**); 누락=undefined와 null/0 구분, _ri/원소 fallback·cap200·사전 canMv 없음 |
| G42831 / resume_constructor | **생성된 child.hp**에 js_to_int32(*.35)→mhp 동일, shield/max0, r=max(5,js_to_int32(**그 시점 부모r**×.6)), speed×1.3, child._amalgSplit=true. poise/maxPoise/baseSpd/elite/mods/aura 등은 보존. 부모HP/catalog 값으로 대체0 |
| G42831 null / SOURCE_FAILURE | null이면 첫 ne.hp 지점에서 TypeError 경계(42831), batch halted. null skip/다음 child/뒤 text로 복구하지 않음. 앞 child의 이미 관측된 prefix와 constructor RNG는 되감지 않음. live 예외를 실제 발생시켰다는 주장은 아님 |
| G42832–42835 / resume_append→resume_parts→finish_batch | append 요청 인수 뒤 **현재 child x/y·부모col**로 parts6, parts owner 반환 뒤에만 다음 좌표쌍. 둘 다 끝나면 현재 부모 x/y−15에 분리!/#884455/life30. append/FX/registry 자체는 실행하지 않음 |

사망 API는 기존 최종 death guard를 통과한 G42827 위치에서 caller가 호출한다. alive/부활/HP 재판정은 복제하지 않는다. 반환은 `status=PLAN, execution=HOLD, product_connected=false, complete_actor=false`와 batch/commands/draws를 반환한다. 외부 owner는 `coordinates→await_constructor→await_append→await_parts` 순서와 실제 동일 child identity·fresh snapshot을 인수해야 한다. index2에서 presentation→complete는 마지막 text **요청 계획**이다. 입력/receipt를 deep-copy하고, 유한 hp/speed/부모r 등 필요한 readback이 없으면 NOT_READY다. 빈 receipt로 가짜 출생 성공을 만들지 않는다. null은 별도 SOURCE_FAILURE다.

main enemy_factory.gd:26의 KNOWN_ETYPES에는50/51이 없고 EC2 constructor는4..9/30..39용 부분 투영이다. EC4-02 catalog도 actual mkEn이 아니다. 공용 constructor/actor/ens·공간 registry·FX/localization·공유 RNG owner의 승인된 연결이 선행되어야 실 집행 가능하며 이번에는 만들거나 복제하지 않았다. 공통 HP authority·Main/State/저장 변경0. 기존 [CH4 불일치 표](../../FDG_SOURCE_TRACE_ENEMIES_CH4_20261020.md)의51 전방위 서술과 실제 windup을 구분하며 설계 docs를 고치지 않았다.

## 검증

Node는 원본을 스트리밍 hash하고 **필요한12행만** 추출한다. 전체 원본/큰 JSON을 출력하지 않는다. UTF-8 임시 파일·명시 --node-bin·OS.execute 출력 join 진단, binary64/base64 수송을 사용했다. 92사례(27 trigger/65 death): 거리 ULP경계, truthy/누락/null, 두 child의 순서·constructor/parts RNG 비용0/비0·fresh source views, 첫/둘째 null의 실패 prefix, signed int32 경계와 불변 필드를 대조했다. constructor·append·FX의 side effect/RNG 비용은 명시적 fixture이며 실제 mkEn/FX/공간 검증이 아니다.

필드/상태/소비열/콜 순서는 정확 비교, π·sin/cos 유래 요청 XY만 기존8εS(ε=2⁻⁵², S=max(26,|부모x|,|부모y|)) 한도다. 최대 관측 XY 차이는 `0.0`. 실제 충돌 경계/전체 RNG 동등성은 미확인이다.

| 실행 | 단정 / 실패 | exit / ERROR / WARNING |
|---|---:|---|
| 신규 정상1회 (92 source cases) | 1339 / 0 | 0 / 0 / 0 |
| 직접 회귀 EC4-02 catalog1회 | 61739 / 0 | 0 / 0 / 0 |
| 결함 주입 `mutation-parent-hp` | 실패검출 116 | 1 / 0 / 0 |
| 결함 주입 `mutation-child-radius` | 실패검출 116 | 1 / 0 / 0 |
| 결함 주입 `mutation-null-skip` | 실패검출 33 | 1 / 0 / 0 |
| 결함 주입 `mutation-extra-rng` | 실패검출 388 | 1 / 0 / 0 |

결함4종은 자기 신규 policy에만 주입했다. 변이 뒤 정상 정책 SHA256 `bfdb3e99e6b632fb64dabe7c0b3768bb7d77bd4c63f3f786e9e03aad241874ae`로 byte 복원했다. 정상·기존 회귀는 각각1회만 실행했으며 복원 후 불필요한 재실행0. 음성 검사를 정상 PASS에 더하지 않는다. import 포함 Godot 7회, engine ERROR/WARNING0, SKIP0. 매 launch 전 지정 pgrep 확인, 2이상이면30초씩 6회 대기했다. 새 userdir는 EXODUSER-ec4-04-Isolated-20261020, 회귀는 파일 상수 EXODUSER-ec4-02-Isolated-20261020. override는 매회 finally 제거했다.

변경은 신규 policy/test·각 UID, 이 보고서, CHANGELOG_SYNC 절의6파일. 기준점 기존 Godot/game/index **1647파일 byte 동일**, 공용·다른 담당0줄. --no-checkout+sparse-checkout, R branch/HEAD/INDEX/WORK 시작·마감 불변. 정상 훅·경로 지정 stage·자기 branch push/원격 SHA 대조·DONE 후 자기 worktree 제거. main push/force/rebase/reset/add-A/훅우회0. 실제 birth·전투·공용 연결·실창/PC 검수는 HOLD/미확인, 다음 EC4-05는 착수하지 않았다.

원로그 `~/exoduser-wt/_out/ec4-04/`: 원본 streaming helper·compact receipt(출력하지 않음), source pins/직접 실행 out·err·engine·meta, 4변이/복원 hash, docs-search/참조·의존 SHA, 보호 hash/R snapshot, 훅/Git 감사·DONE. 보고서 표는 위2개다.
