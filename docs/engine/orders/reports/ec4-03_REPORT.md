# EC4-03 — etype50 불규칙 이동·무작위 windup 순수 정책

작업ID `ec4-03` · 브랜치 `codex/ec4-03-20261020` · **REVIEW_PENDING**. READY는 전용 AI 블록의 순수 투영이며 실제 이동·공격 집행/actor 지원 완료가 아니다.

## 기준·의존·보호 범위

| 항목 | 확인 근거 |
|---|---|
| 최신 main | fetch `823c24baee3f6c5f058ebfd7776721e86f80bd18` |
| 승인 의존 | EC4-02 `5134227018158de128567feb5abe47b9b3bc1726` |
| 정상 merge 기준점 | `b2062cc6f8f9f50a4e15ee1edcb77ce61a54a6d2` — 부모는 위 main과 EC4-02. --no-ff merge, rebase/reset0. CHANGELOG 충돌은 EC4-02 절과 최신 main 전체 byte를 보존해 해결 |
| 이미 main에 있는 참조 | EC3-03 `native_ch3_enemy_phase_policy.gd`의 read-only canMv/fields·position·commands/NOT_READY 형식. EC4-01·EC3-02/03 포함 여부를 확인, 다른 미병합 후속 체인 반입0 |
| 재사용 | 실제 EC2-02 `Constructor.Draws`: 주입 callback 검증·실제 count/error. 기존 `port_modules/combat_stat_formula/producer.gd::js_to_int32`: G39518의 ~~. EC4-02 초기화 후 같은 stream으로 이어지는 검수. 자체 RNG/재시드·공통 HP/정예/이동·공격 writer 복제0 |
| 지시서·담당 | [CH4 추적 §4.2](../../FDG_SOURCE_TRACE_ENEMIES_CH4_20261020.md) EC4-03, main WORK_BOARD의 PC factory/actor 소유 및 EC3-03 병합 상태를 읽음. 공용 export2·Main·State·저장·기존 제품/테스트·다른 담당0줄 |
| 자기 변경6파일 | 신규 native_ch4_enemy_erratic_policy.gd·test_ch4_enemy_erratic_policy.gd·각 UID, 이 보고서, CHANGELOG_SYNC 최상단 자기 절 |

--no-checkout + non-cone sparse-checkout으로 필요한 docs/godot/도구/루트 원문만 받았다. 의존 SHA·부모·기준과 R 시작 상태를 원로그에 보존한다.

## 원본 행과 순서

G는 위 최신 main의 game.html 1-based 행이다. 전체 SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, 전용 블록(G39510–39519, 실행식은39510–39518) SHA256 `b637fe161e3450717893a0231ee23b53f3941ab7158e0b4a82b89c7271b89587`. fetch main/merge 기준점/작업 입력의 game/index byte를 대조했다.

| G행 | 구현 계약 |
|---|---|
|39510|etype===50 && s==='idle' 외곽 검사 한 번. 다른 상태에서는 전용 timer/RNG/canMv/전환 없음 |
|39511|_erraticT-=sp 한 번. 거리 밖/이동 거부/sp0에도 같은 위치에서 실행 |
|39512|감소 후 T<=0이면 **angle=U*PI*2 → timer=30+U*30**. 각기 별도 draw, 둘째 대입 후 같은 tick timer 추가 감소0. 초기화 G31300의 timer→angle 순과 구분 |
|39514|d<250 안에서만 이동. d<50이면 갱신된 erraticAng, d>=50이면 facing+sin(raw_now*.005)*.5. 50/250 경계는 strict |
|39515|speed×(_aSpdM\|\|1)×sp 순서. nx=x+cos(angle)×이동량, ny=y+sin(angle)×이동량. sp/시간 단위 추가 보정0 |
|39516|canMv(nx,ny,r) 한 번. 참이면 로컬 x/y만 갱신, 거짓이면 원좌표. 후보 좌표/r/판정은 move 요청으로 반환 |
|39518|별도 if(d<30+r && U<.03sp). 거리 밖은 확률 draw0; 근거리는 sp0이어도 확률 draw1. 성공 때만 telegraph20/s=windup/st2=10+js_to_int32(20U) 추가draw1. 이동 거부와 무관하며 확률 clamp·재시도·거리 재계산0 |
|34395–34409|_aSpdM의 실제 공통 배속 권위. 여기서는 주어진 유한 숫자/bool/null/부재만 소비. 부재/null/false/±0은1, true는1, 유한 음수/양수는 그대로. 문자열/객체/NaN/Inf는 API NOT_READY이며 JS 전체 coercion 지원 주장0 |
|60461/60467–60468,61878/61885|원문 _now는 gameTime/보간 clock의 raw 값, PHYS_STEP=1000/60. raw_now를 ms 그대로 받고 /1000·Time.get_ticks·wall-clock·sp로 대체0 |

`d`는 G38665 이후 caller가 갱신해 **G39510에 도달했을 때의 cached 값**이다. 이동 후 다시 재지 않는다. 이번 leaf는 raw_now·d·sp·facing/배속을 생성하거나 소유하지 않는다. EC4-02 catalog/23필드를 재초기화하지 않으며 HP·elite/mods/aura를 계산하지 않는다.

## API·집행 경계

`step(actor,context,random_unit,can_move)`는 actor의 etype50/s, 유한 x/y/speed/r/facing/erraticT/angle와 선택 _aSpdM을 받고, context의 유한 d/sp/raw_now를 받는다(d/sp/r>=0). 원문에는 없는 전체 actor admission이나 stage 제한을 추가하지 않는다. 이 API의 숫자/Callable 검증은 EC3-03과 같은 명시 계약이다.

| 결과 | 내용 |
|---|---|
| READY fields | erraticT/angle/s의 현재 투영, _telegraphT/st2는 원래 있었거나 원문이 쓴 경우에만 반환. 부재와 명시null을 보존 |
| position/commands | 로컬 투영 x/y와 `{kind:move,site:erratic,x,y,r,allowed}` 요청. 실제 Node/World 이동·collision map writer0. canMv는 순수 조회여야 하며 owner snapshot 유지 필요 |
| draws / flags | 실제 소비 수, full_tick=false/product_connected=false. 같은 caller RNG cursor를 원래 위치에서 소비하며 앞뒤 공통 RNG를 대신 소비하지 않음 |
| NOT_READY | reason/실제draws/동일false flags, fields/position/commands 없음. 이미 소비한 RNG·조회는 되감지 않으며 실패 후 추가 callback0. caller actor/context/중첩 값을 변경하지 않음 |

이동 후 공격 검사 순서를 RNG와 canMv의 혼합 trace로 검사한다. owner는 성공 packet을 원래 위치에서 인수하고 뒤 공통 FSM에 넘겨야 한다. G38587의 telegraph tick, G38884의 공통 st2 감소/가드, G40458–40519의 추격·분리·발사 tail 및 G41232–41240의 windup/공격 전환은 구현하지 않았다. G39510 블록만으로 updateE 전체를 대체하지 않는다.

## 원문 oracle·정밀도

원본 if 블록을 변형 없이 발췌해 Node VM에서 실행하고 canMv만 정해진 bool의 조회 fixture로 관측한다. 실제 맵·World·updateE 전체를 실행한 증거가 아니다. Node 내장 fs/vm/crypto만 사용(acorn/node_modules 불필요). 명시 `--node-bin`, UTF-8 helper/결과 임시 파일, 한글/emoji receipt, OS.execute 출력 전체 join 진단을 사용한다. source/block hash를 pin하고 숫자는 binary64 little-endian/base64로 수송한다.

**4,174사례 = 단일3,854 + 연속8×40 tick**. timer−1/0/1/2, sp0/1/34, radius0/10/300, d50/250/30+r 직하·동일·직상, 허용/거부 충돌, 별도 .03sp 직하·동일·직상, 20개 windup 정수 경계, 임의 기하/시간800, non-idle12를 포함한다. raw_now의 음수·0·큰 값, _aSpdM JS truthiness, 선택 st2/telegraph의 부재/null도 대조한다. 연속 tick은 JS 이전 출력과 Godot 이전 출력을 각각 다음 입력으로 이어 RNG/상태/이동을 관측한다.

필드·timer·상태·정수변환·분기·RNG 소비·콜백 종류/개수/순서는 binary64/정확 비교다. 삼각함수에서 유래한 **XY에만** EC3-03과 같은 V8/libm forward error 한도를 적용한다. ε=2⁻⁵², S=max(1,|입력 x|,|입력 y|,|speed×배속×sp|+연속 이동량 budget), 한도8εS. 연속 chain의 budget은 지금까지 절대 이동량 합이며 위치 누적 오차를 반영한다. r/상태/RNG/분기에는 이 한도를 적용하지 않는다. 실제 충돌 경계에서 canMv 결과의 동등성은 **미확인**이다.

추가 golden은 EC4-02 초기 stream [.25,.5] 뒤 만료 refresh [.125,.75]→확률0→duration.95로 T52.5/anglePI*.25/telegraph20/windup29를 확인한다. 차단된 이동에도 windup이 발생하며 다음 sentinel.42는 owner 몫이다. invalid sample을 refresh angle/refresh timer/probability/duration의 네 위치에 넣고 실제 count·앞선 조회 수·부분 receipt 거부·입력 불변을 검사한다. overflow projection은 callback 전에 거부한다. 큰 정수 timer/sp의 JS Number 뺄셈도 확인하여 Int64 wrap을 방지한다.

| 최종 label | 실제 결과 | exit / ERROR / WARNING | 격리 |
|---|---|---|---|
| `new-final` | 58696단정/0 | 0/0/0 | `EXODUSER-ec4-03-Isolated-20261020` |
| `reg-ch4_enemy_catalog_policy` | 61739단정/0 | 0/0/0 | `EXODUSER-ec4-02-Isolated-20261020` |
| `reg-ch4_enemy_spawn_policy` | 22364단정/0 | 0/0/0 | `EXODUSER-ec4-01-Isolated-20261020` |
| `reg-ch3_enemy_phase_policy` | 33177단정/0 | 0/0/0 | `EXODUSER-ec3-03-Isolated-20261020` |
| `reg-ch3_enemy_catalog_policy` | 12602단정/0 | 0/0/0 | `EXODUSER-ec3-02-Isolated-20261020` |
| `reg-ch3_enemy_spawn_policy` | 10234단정/0 | 0/0/0 | `EXODUSER-ec3-01-Isolated-20261020` |
| `reg-ch2_enemy_constructor_policy` | 159902단정/0 | 0/0/0 | `EXODUSER-ec2-02-Isolated-20261020` |
| `reg-ch2_enemy_spawn_policy` | 7483단정/0 | 0/0/0 | `EXODUSER-ec2-01-Isolated-20261020` |
| `reg-encounter_factory` | 3그룹/실패단정0 | 0/0/0 | `EXODUSER-ec4-03-Isolated-20261020` |
| `reg-contracts` | 5그룹/실패단정0 | 0/0/0 | `EXODUSER-ec4-03-Isolated-20261020` |

신규 **58,696/0**, 회귀9종 실패0·ERROR/WARNING/SKIP0. 숫자 단정과 그룹 수를 합산하지 않는다. 최종 XY 최대 절대차 `1.4210854715202e-14`, εS 대비 최대 `0.941176470588235`(고정 한도8). 실제 충돌맵/경계의 동일 판정 증거는 아니다.

최초 `new-01`은58,694단정/1실패로 보존했다. 원문4,174사례 비교는 모두 통과했고 overflow 진단 fixture만 실패했다. T=1/sp=1이 먼저 refresh를 유발하여 fixture RNG가 부족했던 원인이다. T=1000으로 overflow 경로를 독립시키고 refresh RNG/충돌 조회0 단정을 추가했다. 별도 정수 입력의 JS double 뺄셈 검사를1개 추가하여 최종58,696단정이다. 원문 사례/기대값/정밀도 한도/검사를 삭제하거나 완화하지 않았다. `new-01-test.gd` SHA는 당시 실행 meta와 일치하며 최초 stderr/audit도 보존한다. 정책의 timer 뺄셈은 명시 float 변환으로 JS Number를 유지했다.

자기 신규 policy에만 아래 결함을 한 개씩 주입했다. 모든 변이는 exit1·실패단정>0·엔진ERROR/WARNING0으로 검출됐다. 의도된 음성 검사를 정상 통과 수에 합산하지 않는다.

| 주입 결함 | 검출 실패단정 |
|---|---:|
| `mutation-refresh-order` | 4885 |
| `mutation-distance50-inclusive` | 1673 |
| `mutation-distance250-inclusive` | 2281 |
| `mutation-probability-inclusive` | 425 |
| `mutation-blocked-skips-attack` | 2679 |
| `mutation-raw-time-seconds` | 4052 |
| `mutation-duration-round` | 476 |
| `mutation-timer-int64` | 1 |

변이 뒤 policy SHA256 `46735746ac191c0db809ad837439244a702c5120580e16133de55f6d4bf17137`로 byte 복원하고 `new-final`을 다시 실행했다. 검사 약화·오류 suppress0.


## docs·통합 접점

기존 [CH4 추적 §2](../../FDG_SOURCE_TRACE_ENEMIES_CH4_20261020.md)의16행 불일치 표를 참조한다. docs/8.0·9 및 추적 문서의 관련 검색32행을 docs-search.out에 보존했다. 기존 설계 docs와 공용 코드는 수정하지 않는다.

| 접점 | 필요한 owner 인수 / 이번 변경 |
|---|---|
| G39510 진입 전 | 공통 stun/alert/시간/거리/facing/오라 snapshot 제공. 이미 처리된 공통 st2/telegraph 감소를 중복하지 않는 호출 위치 필요 |
| G39516 / 이동 writer | canMv는 읽기만, fields/position/commands를 인수하는 실제 actor owner 별도. 이번 실제 이동 writer·collision adapter·dispatcher0 |
| G39518 / G41232–41240 | 같은 tick의 windup 전환 후 공통 FSM이 원래 순서대로 진행해야 함. 추가 근접 피해/조준탄/공통 st2 writer 복제0 |
| G40458–40519 | 별도 공통 추격/분리와 함께 실행될 수 있음. 전용 이동이 전체 이동을 대체한다는 지원 판정0 |
| Main·State·factory·저장 | profile admission·실actor 등록·피격/처치/보상/저장 owner 인수 별도HOLD. 범용 fallback·guard 확대·저장키0 |

이번 순수 단위만 완료했다. 실 actor/공용 연결·전체 AI/RNG 동등성·자연 도달·실창/PC Windows 검수는 **미확인**이다. 다음 EC4-04는 착수하지 않았다.

Godot4.7.2.stable.official.ed1daf0bf / Node24.15.0. 총21회 실행(import1+신규3+회귀9+변이8). 정확한 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을 매 실행 전에 확인했다. 2이상인 42회는 각30초 대기, 전체63회 관측을 process-gate.jsonl에 보존했다. 모든 실제 launch는 count1에서 시작했다. 기존 테스트는 각 파일 상수, 상수 없는 factory/contracts는 이번 작업 격리명을 사용했다. 새 테스트는 EXODUSER-ec4-03-Isolated-20261020. override는 매회 finally로 제거했고 종료 시 없다. cold import exit0/ERROR0/WARNING0.

의존 기준점의 기존 **1633파일**(Godot tracked 전체+game/index) byte 동일. 잠금 export 두 파일은 fetch main과도 byte 동일하다. R branch/HEAD/INDEX/WORK 시작·마감 대조 불변. 정상 훅·경로 지정 stage·자기 branch만 push·원격 SHA 일치 확인/DONE 뒤 자기 worktree 제거. main push/force/reset/rebase/add-A/훅우회0.

같은 sparse worktree를 이 브랜치로 복구한 뒤 외부 gate/격리 runner로 재실행할 수 있다.

```sh
python3 ~/exoduser-wt/_out/ec4-03/run.py review-new test_ch4_enemy_erratic_policy --node-bin=/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node
```

원로그 `~/exoduser-wt/_out/ec4-03/`: fetch/base/dependencies·merge 단계·R스냅샷·references·docs 검색·보호hash·source-probe.cjs/json·oracle-summary·각out/err/engine/meta·단정행근거JSONL·최초 하니스 실패/당시 테스트·변이/검증 요약·훅/Git감사·DONE. 완료일은 2026-10-21 KST이며 브랜치/과업일 식별자는 사용자 지정20261020을 유지한다.
