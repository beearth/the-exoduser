# DEMO11-22r — 일반 장착 transaction / PC runtime refresh 연결

최초 기준은 origin/main `45be76e49d0090316b91a6b7b383d81835e29192`다. PC `a28117c1`은 이미 ancestor이므로 main만 사용했고 미병합 branch 반입/기존 BLOCKED branch merge는 없다. 이전 `ec694742`의 runtime commit·자원 보존 blocker는 인수된 [PC 계약](../../PC_RUNTIME_STAT_REFRESH_CONTRACT_20261021.md)으로 해소했다. 최종 기준은 새 main `0138c5bb9188d27cee10cb1a901d075092ddb88f`를 정상 merge한 `da098350`이다. main에 포함된 DEMO11-21 `a976680b`/종료수정 `72e602d1`도 ancestor 확인했다. 아래 공용 변경은 이 최신 main 대비 수치다. 브랜치는 `codex/demo11-22r-20261021`이며 최종 SHA/원격 일치는 외부 DONE.txt에 기록한다.

| 구현·소유 | 원본 근거·결과 |
|---|---|
| 실제 State INV | TI-00 actual reader/17slot과 TI-01 grid 재사용. G16272–16380 reqLv→귀걸이 대상→old 강화/결정 전승→bag/slot identity와 좌표→refresh 순서. API는 `Main.request_native_equip_item(item,target="")` / `request_native_unequip_item(slot)`, 단일 transaction lock은 State |
| PC refresh | G16287–16292 `equipment_refresh` 한 번. 자원 보관/3캐시 무효화/applyStats/min clamp·actor/resource commit은 PC owner만 수행. Mac은 before/after 공격과 실제 Player.base_def를 읽기만 함 |
| 실패·재진입 | PC 실패면 bag/slot/장비/결정/악의와 원래 cache tokens 참조 복원. 레벨·비용·공간 부족 거부, foreign owner·완료 signal 재진입 차단. producer throw를 성공으로 세지 않음 |
| DEMO11-27 | 기존 강화 이전 prefix 식 재사용·사후 packet 덮어쓰기 없음. transient 실제 equip continuation만 State에서 인수. 독립 forge 이전 호출은 계속 거부. 실제 교체 HOLD 해소는 아래 수치로 검증 |
| 공용 범위 | Main 3057–3085 **+29/-0**, State 1568–1569 **+2/-1** 및 1590–1607 **+18/-0**. 함수 추가/transfer guard만 변경. Player/World/PC runtime/resource authority/hurtE/hurtP/저장/전투식/맵0행 |

신규 **442단정/0실패**, 원문 **42사례·168필드 불일치0**, exit0/ERROR0/ObjectDB 누수0/resource 잔류0이다. 기존 Camera2D WARNING1은 보존했다. 근거는 base game.html G16180(기본 capacity), G16180–16210(grid), G16272–16380(equip/unequip/refresh), G28080–28106(기존 이전 비용 helper), 외부 `source-evidence.txt`다. 원문 JS equip/unequip과 실제 결과의 UTF-8 JSON을 동일 Node Number 파서에서 실행·정확 비교한다. 모든 키/배열/숫자/값과 refresh 횟수를 검사하며 tolerance·ID 정규화·필드 제외는 없다. oracle applyStats는 호출 횟수만 기록하며 실제 스탯의 원문 대조는 기존 PC runtime suite가 담당한다.

새 테스트는 실제 Main/State/actor를 부팅하고 source mkItem의 독립 seeded RNG fixture를 bag에 넣는다. 강화 단계/공격력/affix·결정/자금/가득 찬 그리드/오류 후보는 명시 fixture다. 자연 드랍·피해 실행·save IO·실사용 inventory 화면 검증은 아니다. 현재 native fresh-run 기본 capacity300만 연결했고 확장 bag capacity restore owner와 bonePart 도감 등록은 별도 범위다.

인벤토리 UI·SFX/lesson callbacks·dbSaveForce는 미연결이다. forge panel의 기존 정적 HOLD 안내/화면은 타 담당 파일을 고치지 않고 보존했다. forge owner는 actual equip API를 소비하고 안내를 갱신할 수 있다. 화면 신규/변경0, 캡처/디자인 검수는 이번 범위 밖이다.

새 transaction은 요청 이벤트에서만 실행하며 `_process/_physics_process/advance` 추가0, 목록 생성 API 추가0이다. 별도 성능 벤치는 사용하지 않았다. 매 Godot 실행 전 지정 pgrep를 확인해 2이상이면30초 대기, 실행별 override finally0byte, 실제 사용자 저장 폴더 접근0. 신규 격리는 `EXODUSER-demo11-22r-Isolated-20261021`, 기존 회귀는 각 파일 상수. 출력은 외부 파일로 보내 요약/실패만 확인한다.

원로그는 `~/exoduser-wt/_out/demo11-22r/`다. 최초 `new-01`은 고정값 fixture RNG가 source 반지/목걸이 중복 재추첨에서 끝나지 않아 자기 Godot만 TERM 중단한 이력이다. 실패 로그는 보존하고 제품 원문/검사는 그대로 두고 테스트만 독립 fixed-seed RNG로 교체했다. 최종 관련 suite 결과는 아래 검증 표로 확정한다. 정상 hook/경로 지정 stage/자기 branch push·원격 일치·DONE 뒤 자기 worktree 제거, R HEAD/INDEX/WORK 보존 근거는 외부 제출 기록에 남긴다.

실패 이력 보충: `new-02` 442/45, `new-03` 442/42는 하니스 원인이다. 공간 부족 fixture의 장착품 좌표가 원본 grid의 skip index로 기존 점유셀을 덮어쓰므로, 실패 경계를 검증할 때만 명시적으로 null 좌표를 넣었다(원문도 동일 실패). 나머지는 소수 ID의 Godot JSON 재파싱 정밀도 문제였다. 저장한 new-03 원자료를 Node의 exact Number/shape 비교로 재검사해 원문42사례·168필드 모두 불일치0을 확인했다. 제품 동작/기존 검사·기대값 완화0, 실패 suite만 재실행했다.

| 검증 | 결과·실제 범위 |
|---|---|
| 신규 실제 Main | **442/0**. 17slot 왕복/identity·요구레벨/명시·자동 귀걸이·min clamp 4자원·강화 비용 부족·실제 이전·결정 identity/주머니·affix/공격/방어 변화·실패 rollback/재진입·외부owner/공간 부족/카테고리 독립·World RNG 소비0 |
| 원문 대조 | **42사례·168필드 exact 일치**, source SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. source·slice hash/실제 전후 JSON은 `final-new-02-oracle/` |
| 최종 직접 회귀 | **2,614/0** = PC runtime286 + TI00142 + TI0196 + DEMO11-27 1918 + Main starter148 + DEMO11-21 24. 최종 통합본에서 각1회·기존 test 수정0. PC 원문10사례200필드, forge 원문336시도48이전 일치. TI01 oracle92사례는 출력만이며 별도 JS 대조 PASS로 세지 않음 |
| 종료/자산 | 정상 import 후 신규와 회귀6종 모두 --verbose exit0·ERROR0·ObjectDB 누수0·resource 잔류0·override0byte. `verification-summary.json` 및 실행별 out/err/engine.log/json |

통합 중간 기록: 최초 기준에서 관련5종 PC292/TI00142/TI0196/forge1918/starter148 모두0실패·ERROR0이었다. 드랍 회귀는 해당 main에 script가 없어 실제 실행0·로더 ERROR3이며 PASS로 세지 않는다. 후속 fetch의 최신 main0138c5bb에 DEMO11-21 a976680b 및 종료수정72e602d1 포함을 확인하여 작업 checkpoint 뒤 normal merge했다. 기준 변화가 실제 Main/State 드랍 설치 경로를 바꾸므로 최종 통합본의 직접 검증을 별도로 남긴다.

최종 main merge 후 `final-new`는442/0이지만 새 드랍 beam PNG의 미생성 import 캐시로 ERROR5·SCRIPT ERROR1이어서 실패로 기록했다. 새 제품 코드는 바꾸지 않고 정상 editor import를 수행한 뒤 실패 실행부터 다시 검증했다. 이 기록은 초기 원문 대조 실패/미실행 회귀와 구분해 보존한다.

최종 판정: 기능/API 검증 완료, 실제 장착의 DEMO11-27 이전 HOLD 해소. 최종 PC suite286단정은 기존 코드의 시작 장비 빈 소켓별 검사 반복 수가 초기292와 달라진 결과다. 6개 회귀 파일은 main0138과 byte 동일하며, 원문200필드·10사례와 나머지 검사를 유지했다. 최종 관련 suite는 새 Main/State 통합 기준에서 각1회이고 초기 기준의 통과5종은 별도 이력으로 남겼다. Mac Godot4.7.2 실행만 확인했으며 PC 실기·UI·save/자연 전투는 미검수다. 보호 파일/기존 테스트15개가 최신 main과 byte 동일함을 `final-protected-files.json`으로 확인했다.
