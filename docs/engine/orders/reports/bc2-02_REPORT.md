# BC2-02 — chapter 데이터 수용 접점 판정: HOLD

## 판정·기준

**HOLD — 구현하지 않음.** BC2-02는 인수된 2장 추적 문서 §5.2의 2번 ‘BC02~BC07 chapter 데이터 접점·인수형식/guard/snapshot/ack 통합 결정’이다. 기존 모듈의 실제 진입점이 CH1 전용이므로, 자기 소유 새 파일만 추가해서 2장 계산까지 재사용할 수 없다. 사용자 지시의 **공용·다른 담당 파일 0줄**을 지켰으며 필요한 위치와 재개 조건을 아래에 남긴다. 다음 BC2-03이나 실제 전투·Main 연결로 진행하지 않았다.

| 항목 | 확인 내용 |
|---|---|
| 작업·브랜치 | `bc2-02` / `codex/bc2-02-20261020` / `~/exoduser-wt/bc2-02` |
| 최신 main | fetch 결과 `26c050a99a711e793a6c2413395acda09b0c1614`, 요청 하한26c050a99와 일치 |
| 선행·실제 분기 기준 | BC2-01 catalog는 위 main에 없음. 사용자 지정 예외에 따라 인수된 `codex/bc2-01-20261020` 끝 `6e6f2f58633bb7a54fa0cf1a9cd3df3dc1535aba`에서 분기. 최신main을 포함한 것으로 주장하지 않음 |
| 기준 재대조 | 최신main의 BC01~03 제품 파일은 선행 끝의 동일 파일과 byte 일치. game.html·index.html도 최신main과 byte 일치. 차단 판단은 최신main 및 최신 원격 BC04~07을 대상으로 함 |
| 원본 | game.html65,692행/SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`; index.html4,742행/SHA256 `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12` |
| 작업 방식 | --no-checkout worktree + 필요한 경로만 non-cone sparse-checkout. 빈 index는 `read-tree -mu HEAD`로 초기화. 웹 에셋·Godot 자산·실행 캐시를 받지 않음 |
| 변경·실행 | 이 보고서+허용CHANGELOG_SYNC 맨위절만 변경. 제품·신규테스트·기존테스트·공용·다른 담당·원본·저장형식·바이너리0줄. **Godot0/게임0/Node원본하니스0/테스트0**. 실행PASS 없음 |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001` HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, branch `codex/mac-live-play-time-main-20261017`; HEAD/branch/tracked INDEX/WORK 보존 |
| 순서안 근거 | trace-boss-ch2 `ddf0549597e645b507cac672cba29df2639712c3` §4.2/§5.2/§6, BC2-01 REPORT의 ‘다음 단위·공용 접점’. 추적 문서는 기준main에 없어 승인 SHA에서 읽기 참조만 함 |

이 HOLD는 실제 Main 연결이 현재 반드시 필요하다는 판정이 아니다. **그 전 단계인 공통 계산 모듈의 데이터 수용 계약부터 기존 담당 파일 수정이 필요**하다는 판정이다. 기존 stage guard를 지우거나 새 파일에 공통식을 복제하는 방식으로 공용0줄을 형식적으로 맞추지 않는다.

## 확인한 모듈·원격

| 단위 | 읽은 기준 / SHA | 모듈(`godot/scripts/` 아래) |
|---|---|---|
| BC01 | 최신main `26c050a99a711e793a6c2413395acda09b0c1614` | native_ch1_boss_catalog.gd |
| BC02 | 같은main | native_ch1_boss_spawn_contract.gd |
| BC03 | 같은main | native_ch1_boss_utility.gd |
| BC04 | origin/codex/bc04-20261020 `818e9b2027afa37fadbf13a6b79b885abdb95f6b` | native_ch1_boss_selector.gd |
| BC05 | origin/codex/bc05-20261020 `e1850171849de176ad7d5df61e2cd296705ad7b7` | native_ch1_boss_phase.gd |
| BC06 | origin/codex/bc06-20261020 `1110eec6c2deacd43c6c20dd52affff33d4e4d47` | native_ch1_boss_pattern_start.gd |
| BC07 | origin/codex/bc07-20261020 `edcbc480491a2b9c55abbb99fcda3dc47073583c` | native_ch1_boss_melee_states.gd |
| BC2-01 | 인수된 선행 `6e6f2f58633bb7a54fa0cf1a9cd3df3dc1535aba` | native_ch2_boss_catalog.gd |

BC04~07은 제품 worktree에 이송하지 않고 외부 원로그로 읽었다. 각 파일의 Git blob·SHA256·진입점/guard/caller 행은 `dependencies.json`, `source-and-interface-audit.json`, `api-excerpts.txt`에 보존한다.

## 필요한 수정 위치·근거

행은 위 표의 각 파일 기준이다. 아래는 **정적 코드 분기 분석**이며 Godot에서 호출해 얻은 실행 실패 수가 아니다.

| 소유 파일 / 위치 | 현재 코드·차단 | 담당자가 정해야 할 접점 |
|---|---|---|
| BC01 catalog:164–171,182–205 | boss_for_stage/moves/combos는최종4 Set만허용,move_by_id는CH1 union24만제공 | CH1 catalog 자체를CH2까지무단확장하지않고 chapter별데이터를선택하는공식접점이필요. BC01은전역59 manifest와기존CH1데이터의정본으로유지 |
| BC02 spawn_contract:7,33–43,139–142 | Catalog가preload고정. request.si=4~9는boss_for_stage에서unsupported_chapter_stage,실수치계산전반환. 함수인수에catalog/provider없음 | 기존입력/RNG/충돌reader규약을유지하면서 chapter데이터를받는진입점. 실제si·element·ib/etype·global CD수59를검증한뒤동일계산을재사용할owner변경필요 |
| BC03 utility:6,21–30 | Catalog고정,동일stage거절. move인수로CH2메타데이터를넣어도먼저CH1 boss범위와Set검사 | 실제si와그stage의허용Set을공급할계약. si2얼굴가점·si0/3streak분기등기존원본특례유지. score공식복제금지 |
| BC04 selector:6–7,20–27,67–75,87–104,116 | Catalog/Utility가고정,stage거절외에도연속combo·59score행·최종선택·combo조회모두CH1에묶임. 내부Utility.evaluate_move도같이거절 | 단순맨앞guard확장이아닌catalog조회와score호출의일관된chapter문맥이필요. 59score슬롯/원본ordinal·CD감산·RNG순서·이력쓰기보존 |
| BC05 phase:26–28,38,70–72,193–194,209–215,340 | phase_transition/clock_step/begin_phase_effects와continuation단계모두CH1 catalog검증. 공통phase는읽을수있어도전체상태/효과진입은막힘 | 최초진입과재개token이같은chapter/si·데이터receipt를쓰도록계약. 원본phase순서·checkpoint·helper ack/readback을유지. 실제executor연결은별도HOLD |
| BC06 pattern_start:6,39–44,207,211–215 | begin_start가CH1 stage/union24에고정. next_start는이미작성된program을이어가는소비자이며외부catalog를받아정식시작하는API가아님 | 공통22기술의정식시작진입과새10기술의미지원경계를명시. catalog교체만으로새10의start프로그램이생기지않음. 임의continuation/program작성으로begin_start를우회하지않음 |
| BC07 melee_states:13–17,23–26,73 | begin_tick은si0~3직접검사,next_tick도token.si0~3직접검사. Catalog주입만으로해결되지않음. slam반경은실제si사용 | 소유근접6state 중CH2공통slash/slam/sweep만재사용할stage계약과token검증필요. complete enemy_after/player_after readback·full_tick_complete=false 유지 |

### 단순 연결로 해결되지 않는 차이

| 확인점 | 근거·영향 |
|---|---|
| BC2-01의ready와계산모듈ready는별개 | CH2 catalog의boss_for_stage(4~9) 지원은이미있지만BC02~06의lexical Catalog는여전히CH1 preload다. 새외부모듈을만들어도그상수binding이교체되지않음 |
| 전역manifest와장별데이터구분 | BC04:87/104는source_receipt.move_manifest의59개전역순서를필요로한다. BC2-01 source_receipt:40–52에는집합수/범위가있고 **move_manifest키는없다**. 따라서단순preload치환도정식해결안이아님. 기존BC01전역manifest와CH2장별조회가함께필요 |
| 사용가능한부분helper도확인 | BC04 pick_top_six:128–159는59개score를받는독립계산으로재사용가능하다. 그러나score생성·CD/이력·combo·start경계의차단을해결하지않으므로이helper만호출하고BC2-02가구현됐다고할수없음 |
| stage위장불가 | BC07 slam식73의1000+si*30+phase*80은si4/phase0에서1120,si0위장은1000이된다(원본game.html41125). BC02초기revPts도si4=224/si0=200(game.html31181). 결과만사후보정하면원본계산을새파일에복제하게됨 |
| 신규10시작은다음소유단위 | 32개등록데이터와22개재사용시작/새10개start구현은별개. BC06의chapter범위만넓히고모든32기술이실행지원됐다고표시하면안됨. 신규10은원래다음BC2-03의소유범위이며이번착수0 |

## 총괄·기존 owner에게 넘길 결정

아래는 재개에 필요한 계약 요구사항이며 채택·구현·검증된 새 API가 아니다. 기존 담당 파일의 구체적인 변경 줄 수와 최종 함수 signature는 owner 구현 전이라 **미확인**이다.

| 결정 | 최소 요구·보존 조건 |
|---|---|
| 읽기 데이터 공급 | 전역receipt/gamehash/59 manifest,실제si의boss/Set,move_by_id,5phase,combo 조회를구분한다. BC01·BC2-01 공개읽기API를재사용하고공통수치테이블/공식복제0. 공급누락·hash불일치·미지원기술은NOT_READY,부분성공금지 |
| 기존 호출 호환 | CH1 기존호출·반환·실패규약·기본데이터선택을그대로보존하는추가진입점또는명시적데이터인수를owner가결정한다. 전역static catalog변경·stage위장·별칭클래스로guard우회금지 |
| chapter/state 문맥 | 최초packet과continuation의실제si/chapter/지원기술/원본receipt를같은권위로검증한다. ctx에값만첨가하고기존함수가그값을읽는다고가정하지않음 |
| 순수 계산과집행 구분 | 현재snapshot/RNG/충돌reader·단일command/ack·실제owner readback경계를유지한다. no live actor/Main/State/World/피해/패링/큐/저장연결. 실제연결요구가나오면그단위는HOLD |
| 재사용 지원범위 | BC02/03/04/05의공통계산,BC06의공통22시작,BC07의근접3기술6state를구분. 새10start와새4state/6queue를한번에끌어오지않음 |
| 회귀·원본검증 | BC01~BC07·BC2-01 기존상수격리명으로실행,신규는EXODUSER-bc2-02-Isolated-20261020. CH1동일결과·모든CH2slot·stage/phase밖·미지원기술·의존오류·입력불변·RNG소비/중단·ack/readback 실패를독립원본fixture와검증. 이번에는실행하지않음 |
| QA-007 하니스 | 새하니스가Node를호출하면node실행경로를인자로받고,OS.execute의출력은전체join또는임시파일UTF-8로읽는다. output[0]만해석하거나고정Node경로/심볼릭링크를전제하지않음. BC02/BC03계열의source-game 절대경로인수유지. 누락인수를PASS/skip으로감추지않음 |

공용·다른 담당 파일 0줄 조건이 유지되는 현재 배정에서는 위 owner 변경을 수행할 수 없다. 총괄의 수정 소유권·진입점 계약 결정이 반영된 선행을 받은 뒤에만 재사용 단위를 재개할 수 있다. 현재 보고서는 그 결정을 대신한 자동 승인이나 보호 범위 완화가 아니다.

## 정적 확인·제출 범위

| 검토 | 관측·한계 |
|---|---|
| 원격·기준 | 최신main/BC2-01의포함여부,BC01~07파일존재/공개인수/guard/caller경로를확인. 선행에있는BC01~03은최신main과동일byte |
| 코드·원본 | 코드수정0,새공통식/adapter/token생성0. 원본game/index hash·행수와최신main동일byte를확인 |
| 실행 | Godot0/게임0/Node원본하니스0/신규·회귀테스트0. 전역Godot실행gate를건너뛴실행도없음. 기존BC2-01의114,036/0등을이번PASS로재사용하지않음 |
| 산출물 | `docs/engine/orders/reports/bc2-02_REPORT.md`와CHANGELOG_SYNC맨위절만commit. 별도제품파일·테스트·UID없음 |
| 원로그·정리 | `~/exoduser-wt/_out/bc2-02/`: baseline/dependencies/source-and-interface-audit/api-excerpts/docs-matches·정상commit/push원문·remoteSHA·DONE. push/remote일치/DONE후자기worktree제거,브랜치·원로그보존 |

판정은 **BC2-02 HOLD, 기능 미구현**이다. 실제 전투·Main 연결을 수행하지 않았고 후속 단위로 넘어가지 않았다.
