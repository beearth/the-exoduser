# NW-03 — MAP_OBJS action reducer의 독립 명령 계획

작업ID `nw-03`, 브랜치 `codex/nw-03-20261020`. 추적 순서안 3번에 따라 lore → breakable → altar → bonfire를 구분해 원문 효과·쓰기 순서를 검수하는 **fixture용 순수 proposal**을 구현했다. 실제 MAP_OBJS·HP·악의구슬·버프·난수·오디오·입력·저장 consumer 연결은 하지 않았다. 공용6·다른 담당 파일·기존 제품/테스트 변경은 모두 0줄이다. 실제 연결은 아래 접점의 별도 승인 전까지 BLOCKED이며 임시 State/지갑/자원 owner를 만들지 않았다.

## 기준·의존·제출 범위

- fetch 후 최신 origin/main은 `8524bbbb444fe2e57ce25d773fae24b890747f4a`. NW-02가 main에 없는 것을 ancestor 검사로 확인해 승인된 끝 `2cc27d09d807d77ee5c2534e699bceb9870e1c47`에서 분기했다. NW-01 `d9865e4c`/추적 지시서 `5e8cbd23`도 선행 의존이다.
- 최신 main의 game.html Git object와 작업 파일은 동일 SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 최신 main의 별도 맵 표현 변경을 임의로 합치지 않았다.
- `worktree add --no-checkout` → `sparse-checkout set --no-cone` → `read-tree -mu HEAD`. Godot·engine docs·원본 game.html·훅·3개 원문 대조 도구만 필요한 경로로 받았다. 웹 대용량 에셋 추가0.
- 신규 `godot/port_modules/map_object_action_proposal/producer.gd`, `godot/tests/test_native_map_object_action_proposal.gd`, 각 UID, `tools/nw03_map_action_oracle.cjs`, 이 보고서, CHANGELOG_SYNC 신규 절만 커밋한다.
- R은 `/Users/fordeargamers/Projects/exoduser-migration-20261001`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`·브랜치·tracked INDEX/WORK 보존. main push·force·add -A·훅 우회0.

## 원본 전이·효과·의존 경계

아래는 최신 main game.html 행이다. G32828–32853 발췌 SHA256 `9eea8397b33211a9a7b4ba18372d4fb60a5ab6cffa497687254d47b66d6c265f`. oracle은 전체 hash, 고유 마커, 실제 loop/hash, G31723 dst, G32827 gate를 확인한 후 **변경 없는 원문**을 VM에서 실행한다. 배열 순서는 NW-01 query를 그대로 재사용하며 가까운 순/type 묶음으로 바꾸지 않는다.

| 순서별 검수 대상 | 원본 행 | 명령 계획의 정확 순서 |
|---|---|---|
| lore | 32834–32836 | read=true → 플레이어 좌표의 비문 발견 텍스트(y-40) → 오브젝트 좌표 입자6 → pickup. textIdx 본문 조회·새 대사 없음 |
| breakable 기본 | 32837–32838 | hp-1 → #aa8844 입자4 → pickup. 새 hp>0이면 여기서 MAP 루프만 break |
| breakable 파괴 | 32839–32844 | alive=false → 해당 loot 보상 → #886633 입자8. hp0/음수·소수도 원본 비교대로 처리 |
| mat 보상 | 32840 | 난수1개 → mv=1+trunc(U*3) → G.mats+mv. mv를 먼저 계산해 JS 덧셈 결합 순서 보존 |
| potion 보상 | 32841 | addPotion('hp',1) 호출 명령 → 그 반환이 true일 때만 HP물약! 텍스트 → 마지막 파괴 입자. 반환값은 명시 bool 의존 |
| altar | 32846–32852 | used=true → mmDirty=1 → 난수1개 → 선택 stat 누적 → 축복명! → 입자12 → pickup |
| altar 값/후속 | 32848–32850,27927,28005,28019,31567 | _altAtk+.15 / _altDef+.20 / _altSpd+.15. 선택값의 null/false/없음은0. DEF의 후속 +6과 속도 갱신시점은 별도 applyStats consumer; 이번엔 호출하지 않음 |
| bonfire | 32830–32833 | hp=mhp → st=mst → mp=mmp → shield=mshield → lit=true → mmDirty=1 → 회복 텍스트 → 입자12 → pickup. lit=true여도 다시 회복 가능 |
| HP addPotion 의존 | 28250–28258 | 원문 HP 분기 관측은 true·악의구슬+1. producer에 이 함수 본문을 복제하지 않음. 실제 오디오/텍스트/mats 처리는 기존 owner가 필요 |

bonfire의 정상 생성 코드 G25793–25808은 주석 상태다. fixture 지원이 자연 생성 활성화를 뜻하지 않는다. trap·상자·잔해·R hold·인벤 반입·저장·비문 본문 UI는 구현하지 않았다. `break_scope="map_objs"`는 MAP loop 종료만 뜻하며 같은 입력의 이후 상자·수거 블록을 소진하지 않는다.

## native API와 NR 계약

`extends RefCounted`. `propose(player: Variant, objects: Variant, pressed: Variant, portal_used: Variant, dependencies: Variant=null) -> Dictionary`, `provenance() -> Dictionary`. native envelope이며 원본 함수 이름/반환이라고 주장하지 않는다. 유일한 preload는 NW-01 readonly query이다.

결과는 정확히9키: ready, matched, source_index, type, reason, commands, rng_consumed, source, break_scope. 정상 hit는 정수 index/type/`map_objs`, no-hit와 NR은 index/type/break_scope=null. 정상 reason=null. NR은 ready=false·matched=false·명령0·rng_consumed0·String 사유다. rng_consumed는 **명령 계획의 샘플 수**, 실제 난수 호출 수가 아니다. 입력·SceneTree·전역 RNG·파일·State 쓰기는 없다.

| 입력/검증 단계 | 지원·조기 반환·의존 |
|---|---|
| 첫 단계 | NW-01의 gate/Array/player/앞 순서 flag/좌표 검증 그대로. 실패는 `query:<원래 reason>` NR. no-hit면 downstream player extra/dependencies를 읽지 않음 |
| lore | NW-01이 이미 확인한 좌표/flag 외 추가 의존 없음 |
| breakable hp | finite int/float만 지원, float64 hp-1. hp>0이면 loot/dependencies를 읽지 않음 |
| 파괴 loot | String 'mat'/'potion'에만 보상. 다른 String/null/비String 값은 JS strict equality처럼 보상 없이 마지막 입자만. StringName을 JS String으로 변환하지 않음 |
| mat | dependencies Dictionary에 finite mats와 random_sample 필요. random_sample은 finite 숫자 `0<=U<1`, bool/문자열/없음/비finite/1 이상 거절. 샘플이 먼저 준비되어야 mats 검사 |
| potion | dependencies.add_potion_return:bool 필수. 명령에 expected_return으로 기록. 실제 owner를 호출한 것으로 간주하지 않음 |
| altar | 위와 같은 random_sample 1개. 선택 stat만 검사하며 없는 값/null/false는0, finite 숫자는 누적. true/String/Array/Dictionary/비finite는 NR. 선택되지 않은 stat은 읽지 않음 |
| bonfire | mhp/mst/mmp/mshield 네 finite 숫자 필수. 음수/0/소수도 원본처럼 그대로 명령화하며 max clamp를 추가하지 않음 |

부족한 의존을 0·난수·가짜 성공으로 대체하지 않는다. 전체 계획을 반환하기 전 검증하므로 NR에 부분 쓰기를 싣지 않는다. 이는 native 지원 도메인의 방어 계약이며, 원본 JS의 모든 coercion·prototype/getter·예외/부분 실행 순서 동등성은 미확인이다. `{key}` 번역 토큰과 효과 args를 보존하며 실제 번역·FX dispatch는 없다.

addPotion의 false 상황은 **호출 반환 계약 fixture**로 검사한 것으로, 현재 원본 HP 함수가 실제 false를 반환한다고 주장하지 않는다. 실제 연결 시 예상 반환과 실제 권위/결과가 일치하는 owner가 필요하다. 반환값을 먼저 추측해 실제 HP/악의구슬 거래를 적용하는 consumer는 이번에 만들지 않았다.

## 검증

Godot 4.7.2, 각 실행 `--verbose`. 원문 loop 실행141상황(이 중 potion false1개는 위 계약 fixture), native 방어계약98상황, 직접 짧은 경로/불변/provenance 검사. 전체 ordered command/result·부수효과 args·fixture에만 적용한 후 상태·native9키/정수index/bool/Array·NR 원자성·입력 deep snapshot/배열 참조·RNG/씬 불변·반복/새 중첩 결과 독립성을 검사한다. JSON Number는 양쪽 JSON으로 int/float만 동일화하고 값·bool/string/null·키·배열 순서는 그대로 비교한다.

| 실행 | 검사 결과 | exit / ERROR / ObjectDB / 개별 누수 / resource |
|---|---|---|
| unit-final | 3060/0 | 0 / 0 / 0 / 0 / 0 |
| NW-01 기존 회귀 | 2304/0 | 0 / 0 / 0 / 0 / 0 |
| NW-02 기존 회귀 | 1851/0 | 0 / 0 / 0 / 0 / 0 |
| test_contracts 전체 | 5그룹, failed_assertions0 | 0 / 0 / 0 / 0 / 0 |
| 기존 potion_recovery_source 전체 | 318/0 | 0 / 0 / 0 / 0 / 0 |
| 기존 p2001c_kill_rewards 전체 | 45/0, skip0 | 0 / 0 / 1 / 2 / 0 — 종료 깨끗함 미달 |
| editor import(검사 수 미합산) | 정상 완료 | 0 / 0 / 0 / 0 / 0 |

처치 보상 테스트는 Camera2D interpolation WARNING1과 `AudioStreamMP3`/`AudioStreamPlaybackMP3` 각1개 누수로 ObjectDB WARNING1을 보고했다. assertion 실패0·exit0과 종료 누수는 분리한다. 최종 전체 회귀 종료 깨끗함 PASS를 주장하지 않는다. 범위 밖 오디오·공용·기존 테스트를 고쳐 숨기지 않았다. 신규 producer/test/UID/oracle을 모두 원로그에 임시 보관해 경로에서 제외한 뒤, 부모 커밋과 같은 byte의 기존 테스트·제품만으로 다시 실행해 동일45/0·ObjectDB1·누수2·resource0을 재현했다. 두 실행 모두 AudioStreamMP3/AudioStreamPlaybackMP3 각1개이며 신규 파일은 검수 byte 그대로 복원했다. 실제 main 실행과의 비교는 미수행이고, 부모 기준 선재 문제로 분리한다.

첫 Node oracle은 HP 분기 발췌의 닫는 중괄호 한 행 누락으로 syntax error(exit1/JSON0); 끝행을28258까지 포함해 수정했다. 첫 Godot unit-01은 테스트의 `value != true`가 String/bool 비교 오류로 중단되어 ERROR1·RESULT 없음·자기 실패 프로세스만 SIGTERM(exit -15) 후 override0byte. carrier 확인을 명시하는 하니스 수정 및 비String loot strict 비교 방어/원문6상황 추가 후 unit-02/final 각3060/0. 실패 원문과 실행 코드 보존, PASS 합산0.

| 자체 결함 주입(항상 원복) | 검사 수 | 검출 실패 / exit |
|---|---|---|
| lore read를 false로 잘못 기록 | 3060 | 27 / 1 |
| breakable hp를2 감소 | 3060 | 204 / 1 |
| altar DEF를.15로 잘못 가산 | 3060 | 36 / 1 |
| bonfire shield를mhp로 잘못 회복 | 3060 | 24 / 1 |
| potion false인데도 안내 표시 | 3060 | 2 / 1 |

5개 모두 SCRIPT ERROR/종료 ERROR/ObjectDB/resource0인 의도한 assertion 실패다. 원복 후 unit-final 통과·검수 코드 동일 byte를 확인했다. 원본 변조 hp-2 파일은 oracle이 hash 불일치 exit1/JSON0으로 거절한다. 검사 삭제·완화·skip0.

Godot 총15회 모두 실행 직전 지정된 pgrep을 기록했다. count2 관측2회는 각각30초 대기했고 모든 실제 launch 직전 count1이었다. 소유 실행은 직렬1개. 신규/기본계약/import는 `EXODUSER-nw-03-Isolated-20261020`, 기존 NW01/NW02/P2001C/QS01은 각 파일 USERDIR 상수를 적용했다. 모든 override finally0byte. import 전 AppSupport Godot68파일 백업·hash 대조, 기존68파일 변경0.

## 실제 연결 요청 위치 — 이번 변경0줄

| 실제 필요한 접점 | 원본 근거 / 기존 위치 | 필요한 변경·현재 중단선 |
|---|---|---|
| MAP_OBJS 실제 배열·epoch writer | G32829–32852; world.gd의 기존 tick/맵 epoch, native 실제 배열 owner는 미확인 | lore read1쓰기, 파괴 hp1/alive1쓰기, altar used1, bonfire lit1의 실제 대상과 수명·stale snapshot 규칙 필요. native 삽입 줄 수/정확 위치 미확인, 변경0 |
| R caller·포탈·레슨/pause | G32825–32827 및32108–32132; main.gd 입력 관리 | pressed/portal_used 권위 뒤 NW01→plan→실행의 작은 adapter 필요. 현재 자동 적용/입력소진0. 새로운 전체 공용 router 만들지 않음 |
| HP/ST/MP/shield refill | G32831; State `native_source_new_run_state.gd:448–464` stage-entry 자원 owner 경유 경로 | 일반 bonfire에 stage-entry 함수/owner를 우회 재사용하지 않음. 자원4쓰기의 승인된 실제 회복 authority 필요 |
| HP addPotion | G28250–28258/32841; State `:508–517` apply_native_add_potion, `:314` _feel_owner_current | 현재 owner gate를 만족하는 실제 reward owner·반환 accepted 판정과 nested SFX/text 처리 필요. 가짜 Node/owner·mats 직접 쓰기0 |
| mat와 선택 buff | G32840/32850; State `:175` G reader/`:581` P reader | mat 덧셈1쓰기, 선택 stat1쓰기 권위 필요. reader를 writer로 취급하거나 두 번째 지갑/P를 actual로 채택하지 않음 |
| RNG·mmDirty·FX/pickup | G32832–32852 | 매트 파괴/제단에만 실제 U1개, 원본 순서로 효과 dispatch 필요. 지금은 sample/명령만. native seed/오디오 경로0 |

표의 쓰기 수는 원본 statement 수이며 native 제품 변경 줄 수가 아니다. 현재 actual API/epoch/권위와 정확 새 삽입 줄은 미확인이므로 임의 수치를 만들지 않았다. 이 연결 단위는 BLOCKED로 보고하고 구현하지 않았다. NW-04도 착수하지 않았다. 실제 자연 배치·실창·제품 기능 완료·PC 동등성은 미확인이다.

## 제출·보존

관련 docs 전체를 Git object 기준 검색한284행을 `docs-search.txt`에 보존했다. 추적 문서의 비활성 bonfire·HP악의변환·제단 DEF/속도 경계, 기능 분모의 actual consumer 미연결 판정은 계속 유효하다. 기존 수치/타인 문서를 바꾸지 않고 신규 독립 계획의 상태를 본 보고서와 CHANGELOG_SYNC에 기록한다.

원로그 `~/exoduser-wt/_out/nw-03/`: preflight·원본 fragment/hash·oracle·실행별 out/err/json/코드 snapshot·결함주입·기준 누수 비교·격리/보존 정산. 자기 branch 정상 훅 commit→push→원격 SHA 일치→DONE.txt 후 자기 worktree만 제거한다. 최종 SHA·수치·정리 증거는 DONE.txt/submission.json/cleanup-verification.json에 기록한다.
