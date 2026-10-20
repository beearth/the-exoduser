# EC4-02 — 4장 catalog·23필드 초기 literal projection

작업ID `ec4-02` · 브랜치 `codex/ec4-02-20261020` · 2026-10-20 KST · **REVIEW_PENDING**.

## 기준과 의존

fetch 최신 `origin/main=3886513f591bbff642a7a8cf622ccbbcbc6cc6f9`에서 `worktree add --no-checkout -b` 후 non-cone sparse-checkout으로 분기했다. 지시서 [CH4 추적 §4.2](../../FDG_SOURCE_TRACE_ENEMIES_CH4_20261020.md)의 EC4-02만 구현했다. WORK_BOARD의 EC3-02 main 병합 및 다른 담당 소유 경계를 읽었다.

| 의존 | 실제 반영 |
|---|---|
| EC4-01 `61f3ad9cd862ade599a4dbf41f0a3c79ca604ce7` | `--no-ff` 정상 merge. CHANGELOG_SYNC의 동시 최상단 추가 충돌은 EC4-01 절 + 기존 main 전체 byte를 보존해 해결 |
| EC3-02 `fb8e80d03dfb7fa073ed9aaf1820bb86306b2c75` | 최신 main에 이미 ancestry로 포함. 명시 merge는 Already up to date. 별도 체인/미인수 WIP 반입0 |
| 의존 고정점 `b74a7d3e` | 부모는 위 최신 main과 EC4-01. rebase/reset0. `dependencies.json`에 full SHA/부모/ancestry 보존 |
| main EC2-02 | `native_ch2_enemy_constructor_policy.gd::Draws`를 실제 preload하고 provider 검증·count·error를 그대로 사용. EC3-02의 slice 경계 및 READY/NOT_READY 형식 재사용 |

고정점 이후 자기 변경은 신규 policy/test와 각각 UID, 이 보고서, CHANGELOG_SYNC 자기 절의 6파일이다. 원본·공용 export 도구2·Main/State/저장·HP authority/elite/mods/aura·기존 제품/테스트는0줄. 기존 공통 전체 constructor의 CH2 guard를 넓히거나 우회하지 않는다.

## 원본과 catalog10

G는 위 최신 main `game.html`의 1-based 행이다. game SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, 65,692행/4,195,551byte. index SHA256 `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12`. fetch main·의존 고정점·작업본의 원문 byte가 같다.

G30823–30920의 순수 catalog다. `catalog_for(etype)`는 hp/atk/raw_speed/speed/r/poise/shield/range/col을 반환한다.

| etype | HP/ATK | rawSPD | R/poise/shield% | range | col |
|---|---|---:|---|---:|---|
|50|32/12|.36|10/12/0|400|#554433|
|51|96/16|.12|20/40/65|400|#665544|
|52|80/24|.09|18/35/0|400|#774433|
|53|26/18|.18|12/10/0|800|#887766|
|54|22/2|.54|10/3/0|600|#443333|
|55|38/16|.39|10/12/0|400|#ddccaa|
|56|48/12|0|20/45/75|400|#cc5544|
|57|128/18|.45|10/12/0|1000|#998877|
|58|128/24|.15|25/40/0|600|#aaaaaa|
|59|224/30|.18|30/65/0|1000|#332211|

G30858의 `raw===0 ? 0 : max(.2,raw*1.3)`를 유지한다. 56은 mapped speed0, 51/52/58은 .2다. 실제 생성 speed는 G31138의 jitter/배율/M02 권위이며, 원본 fixture에서 56의 양수 생성 speed도 관측했다. catalog shield65/75%를 G31164/31184의 생성 HP 기반 방어값으로 대입하지 않는다. HP/ATK/레벨/정예 생성식을 이 모듈에 복사하지 않았다.

## 정확한 23필드 경계와 API

호출자가 G31298 `_adSlamT` 뒤, **G31300 `_erraticT` 직전**의 공유 RNG cursor를 제공한다. 반환 후 G31311 `_lavaBurn`부터는 호출자 소유다. 이 모듈은 이 구간의23키를 모두 원래 순서로 반환한다. `build({stage,etype},random_unit)`는 stage14..20/etype50..59의 유한 정수 숫자를 받는다. 다른 context는 읽기 전용이다.

성공은 `{status:"READY",fields,catalog,draws,complete_actor:false}`다. 잘못된 context/Callable/sample은 `{status:"NOT_READY",reason,draws,complete_actor:false}`로 멈추며 부분 fields는 반환하지 않는다. 각 실패 위치의 실제 소비 count를 유지하고 뒤 sample을 소비하거나 되감지 않는다. 범위 밖 catalog는 `{}`다.

| G행 | 원문 초기 필드·일치 조건 | 불일치·공통 값 |
|---|---|---|
|31300|50 `_erraticT=30+30U`; **모든 type** `_erraticAng=U*PI*2`|timer9999; angle은 type과 무관하게 별도1draw |
|31301|51 `_amalgCleave=true`|나머지false; `_amalgSplit=false` 모든type |
|31302|52 `_tongueCd=160+60U`, `_tongueT=60+30U`|각9999 |
|31303|53 `_gazeCd=180+60U`, `_gazeT=80+40U`|각9999; `_gazeAng=0` 모든type |
|31304|54 `_hangCd=200+60U`, `_hangT=80+40U`, `_hanging=true`|9999/9999/false |
|31305|55 `_boneChargeCd=120+50U`, `_boneChargeT=50+30U`, `_boneDeath=true`|9999/9999/false |
|31306|56 `_bloodCd=100+40U`, `_bloodT=40+20U`|각9999 |
|31307|57 `_curled=true`, `_curlTimer=300+120U`|false/0 |
|31308|58 `_mirrorBuf=[]`(매 build 새 배열)|다른type은 명시null; `_mirrorDelay=60` 모든type |
|31309|59 `_overlordPhase=0`, `_overlordCd=120`|−1/9999 |

각 U는 별도 호출이다. type50..59별 소비는 **2/1/3/3/3/3/3/2/1/1**이다. 50은 timer→angle 순이며 나머지 type은 angle→해당 timer 순이다. bool/0/−1/9999/null/[]의 구분을 유지했다. AI tick·재추첨·phase전환·지연 생성되는 `_eyeBuff`는 이 초기 literal에 넣지 않았다. bitwise 식이 없어 신규 JS int32 부품0이다.

## 원본 JS oracle와 검증 방법

Node24.15.0의 내장 fs/vm/crypto만 사용한다(acorn/node_modules 불필요). 명시 `--node-bin`을 받고, helper/JSON은 격리 디렉터리의 UTF-8 임시 파일로 쓰고 읽은 뒤 삭제한다. OS.execute의 모든 출력 조각은 join해 진단에만 사용한다. 한글/emoji 수송도 확인한다.

전체 source SHA, catalog 선언 SHA `2dbfc1df07aa9d46f52e8336d8c2a9b240bfaf10844cd5b52ef7dc024b3a5e41`, 23필드 구간 SHA `770178af0b8df2dea510b42e387de62b1494c4c9d4fa512183eebe9287583b83`를 pin했다. double은 little-endian binary64/base64로 수송해 필드/카탈로그/소비열에 허용오차0으로 비교한다. 모든 단정에는 행·계약 근거를 JSONL로 남긴다.

**1,750사례 = 7stage×10type×자연tier/강제0·1·2·3×0/.5/1직하/ramp/seeded stream.** 원본 `mkEn` 및 원본 elite/mod/aura 정의를 VM에서 실행한다. 원문 필드식을 보존하고 slice 시작/끝에 RNG0회의 관측 mark만 삽입했다. canMv=true·safePt 미사용·GPUoff·skin 빈 함수·theme fixture는 명시된 실험 조건이다.

원본 slice 앞7..12draw를 fixture로 재생→실제 새 policy 호출→원본 잔여 suffix0 확인→다음 sentinel까지 대조했다. 관측 앞부분 재생에도 기존 `Constructor.Draws`를 사용한다. 이는 정확한 slice 위치/소비의 검증이며 Godot 공통 HP/전체 constructor 구현 증거가 아니다. 필드23개 값/키 순서, catalog9값, 소비 binary64, 입력 불변, 모든 matching draw 위치의 잘못된 sample, 범위/Callable 가드, fresh buffer/결과 catalog 변이 격리를 검증한다.

| 최종 label | 결과 | exit / ERROR / WARNING | 격리 |
|---|---|---|---|
| `new-final` | 61739단정/0 | 0/0/0 | `EXODUSER-ec4-02-Isolated-20261020` |
| `reg-ch4_enemy_spawn_policy` | 22364단정/0 | 0/0/0 | `EXODUSER-ec4-01-Isolated-20261020` |
| `reg-ch3_enemy_catalog_policy` | 12602단정/0 | 0/0/0 | `EXODUSER-ec3-02-Isolated-20261020` |
| `reg-ch3_enemy_spawn_policy` | 10234단정/0 | 0/0/0 | `EXODUSER-ec3-01-Isolated-20261020` |
| `reg-ch2_enemy_constructor_policy` | 159902단정/0 | 0/0/0 | `EXODUSER-ec2-02-Isolated-20261020` |
| `reg-ch2_enemy_spawn_policy` | 7483단정/0 | 0/0/0 | `EXODUSER-ec2-01-Isolated-20261020` |
| `reg-encounter_factory` | 3그룹/실패단정0 | 0/0/0 | `EXODUSER-ec4-02-Isolated-20261020` |
| `reg-contracts` | 5그룹/실패단정0 | 0/0/0 | `EXODUSER-ec4-02-Isolated-20261020` |

신규 **61,739/0**, 회귀7종 실패0·ERROR/WARNING/SKIP0. 단정 수와 그룹 수는 합산하지 않았다. 최초 `new-01`도61,739/0이었고, 이후 oracle의 전체 사례 수를 정확히1,750으로 고정한 최종본을 다시 실행했다. 정상 구현에서의 초기 테스트 실패0, import도exit0/ERROR0/WARNING0이다.

검출력 확인은 자기 신규 policy에만 아래 결함을 한 개씩 주입했다. 각 실행은 exit1·실패단정>0·엔진ERROR/WARNING0으로 검출됐고 원로그를 보존했다. 이는 의도된 음성 검사로, 정상 통과 수에 합산하지 않는다.

| 주입 결함 | 검출 실패단정 |
|---|---:|
| `mutation-angle-draw-omitted` | 10040 |
| `mutation-nonmatching-default` | 1575 |
| `mutation-null-as-array` | 1584 |
| `mutation-buffer-alias` | 1 |
| `mutation-speed-zero-clipped` | 176 |

모든 변이 뒤 원래 policy SHA256 `6a943b54717b2adf587548629650518c55b78562d525449003e97dd11ad03fb0`로 byte 복원했고 `new-final`을 재실행했다. 검사 삭제/기대값 완화/오류 suppress0.


## docs 대조와 통합 경계

`docs-search.out`에 docs/8.0·9 전체 관련 검색을 보존했다. 기존 [CH4 추적 §2](../../FDG_SOURCE_TRACE_ENEMIES_CH4_20261020.md)의16행 불일치 표를 참조하며 기존 설계 docs는 고치지 않았다.

| 근거 | 이 단위 판정·후속 요청 |
|---|---|
| G30823–30920 vs 총관리 catalog | literal10행을 사용. 실HP/poise/shield 및 생성 jitter와 구분. rawSPD0을 이동불가/무적 계약으로 확대하지 않음 |
| G31301 및 G39521–39523 / 총관리51 전방위 | 여기서는 `_amalgCleave` 초기 bool만 보존. 전방위 피해를 새로 만들지 않음. AI/death는 별도 단위 |
| G31308 vs 거울 스킬 복사 서술 | fresh buffer/null/60만 초기화. 원본 G39630–39641의 위치 추종과 스킬복사를 혼동하지 않음 |
| EC2 constructor build/guard; G31120–31364 | CH4 전체 constructor가 필요하면 원래 collision→elite/mods→stats→literal→skin 사이의 slice hook/provider/공유 cursor 지원을 별도 통합해야 함. 현재 EC2 guard4..9/30..39는 불변. type33/stage4로 위장 호출0 |
| Main/State/World/factory/저장 | 실actor 생성·admission·전투·소환·처치/보상·저장 연결은 별도 권위, 이번 변경0줄. 단순 catalog READY로 지원/실플레이 완료 판정0 |

EC4-02의 순수 단위만 완료했다. 실제 CH4 actor/전체constructor/공용 연결·자연 도달·PC Windows·실창/저장 동등성은 **미확인**이다. 다음 EC4-03은 착수하지 않았다.

Godot4.7.2.stable.official.ed1daf0bf. 총15회 실행(import1+정상신규2+회귀7+변이5). 매 실행 전 정확한 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을 기록했다. 2이상인 18회는 각30초 대기 후 재확인했고, 모든 실제 실행은 count1에서 시작했다. `process-gate.jsonl`에 전체33회 관측을 보존했다. 새 테스트는 지정 userdir, 기존 테스트는 각 파일 상수, 상수 없는 factory/contracts는 이번 작업 격리명을 사용했다. override는 매회 finally로 제거했고 종료 시 없다.

의존 고정점 이후 기존 **1620파일**(godot tracked 전체+game/index) byte 동일. 공용 export 두 파일은 fetch main과도 byte 동일하다. R branch/HEAD/INDEX/WORK를 시작·마감 대조했으며 변경0이다. main push/force/reset/rebase/add-A/훅우회0.

재실행은 이 브랜치로 같은 sparse worktree를 만든 뒤 외부 원로그의 gate/격리 runner를 사용할 수 있다. Node는 명시 절대경로다.

```sh
python3 ~/exoduser-wt/_out/ec4-02/run.py review-new test_ch4_enemy_catalog_policy --node-bin=/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node
```

원로그 `~/exoduser-wt/_out/ec4-02/`: fetch/base/dependencies·R스냅샷·references·docs검색·보호hash·source-probe.cjs/json·oracle-summary·각out/err/engine/meta·단정행근거JSONL·변이/검증 요약·정상훅/Git감사·DONE. 정상 훅으로 자기 변경6파일을 커밋하고 자기 branch만 push, 원격 SHA 일치/DONE 기록 후 자기 worktree를 제거한다.
