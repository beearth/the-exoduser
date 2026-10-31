# DEMO11-25 — 자동 HP 물약 런타임 (재개: demo11-25b)

2026-10-21 KST. 사용자 정정에 따라 존재하지 않았던 QS-02/03을 의존으로 요구하지 않고, main에 병합된 QS-01 위에 **자동 HP 정책·실제 State writer·60Hz 자연 호출**을 구현했다. 웹 원본/피해 경로/저장/맵은 수정하지 않았다. SFX·시스템 튜토리얼·전설 벨트 피해 consumer는 아래 잔여 범위이며 전체 퀵슬롯 구현 완료가 아니다.

| 범위·공용 변경 | 근거·계약 |
|---|---|
| 기준·의존 | fetch/원격 main `0105159934d0c2a8b167bd51518dca1e0fafe50a`. QS-01 main 모듈 재사용(인수 ref56dbc46a). 미병합 브랜치 반입/merge/rebase0. gap `61ab71be:130`의 “기존 QS-02/03”은 사용자 정정에 따라 신규 구현으로 해석. 이전 BLOCKED ac283e13은 이번 제품 의존이 아님 |
| 순수 phase | 신규 `godot/port_modules/potion_recovery_source/auto_phase.gd`. G35893 양수CD만 `-=sp`/음수허용 →35894 임계 level/affix 조회 →35895 lesson/CD/hp/mats/부족HP short-circuit →35896 before →35897 악의구슬1 →35899–35902 장갑/벨트/pRegen/CD →35903 회복 재조회 →35904 HP →35905–35910 후속순서. QS-01 `enhanced_heal/auto_cooldown`을 호출하며 공식을 재작성하지 않음. callback 실패 시 수행 prefix 유지, refund/자동 retry 없음 |
| 런타임 | 신규 `godot/scripts/native_potion_recovery.gd`: Main 약한참조·physics serial 중복방지·read/write callback 조립·마지막 사용/미이식 영수증. threshold 미발동 시 장갑/벨트/패시브/두 번째 heal reader0. OPT.autoPotThr/qsAuto/수동 물약/새 RNG0 |
| Main 공용 추가 | **17, 84, 1007행**만 추가(기존 줄 수정/삭제0): preload·인스턴스·`_physics_process`의 deferred 호출 한 줄. physics delta×60을 sp로 사용해 렌더FPS가 CD를 가속하지 않음. 같은 physics serial 중복 호출 거절. 기존 source-clock stage/playTime CONTINUE·sp 통과를 확인하고, 현재 G.on/paused 및 tree pause도 재확인 |
| State 공용 추가 | `native_source_new_run_state.gd` **1227–1260행(+34)**만 추가. CD0/HP강화레벨0은 G27684/28071·fresh63950/63952의 별도 런타임 소유. 악의/CD/조건부 통계 write, HP는 resource sink로 위임 후 실제 P.hp readback. 기존 addPotion·addExp·Q/E·P/INV schema 변경0 |
| 자원 authority 공용 추가 | `native_source_resource_authority.gd` **672–685행(+14)**만 추가. State/실제Main/actor/authority/일시정지/중복 commit guard 후 G35904 `min(mhp,hp+v)`만 적용. ST/MP/poise/iframes·피해 함수 변경0. 기존 regen sink의 허용 phase에 문자열을 끼워 넣지 않음 |
| 표시·잔여 | 기존 NativeFloatingText에 G35909 요청, 거절 시 PARTIAL 기록. SFX.potion 미연결은 마지막 사용 영수증에 PARTIAL로 보존. native systemLesson owner 부재라 before=null; 활성 튜토리얼 통지 미구현. 전설 벨트 활성 시 `_lBeltT`를 생성하지 않고 피해 consumer HOLD를 기록(추적 §4.4 요구). PC 소유 피해·Q/E·이동·돌진·사슬·방패·분노 변경0 |

**자연 호출 순서 근거:** 원본 G60467의 PHYS_STEP=1000/60, G61876–61882의 accumulator update 반복이 시간 기준이다. 같은 update 안에서 G32715–32720 자연회복, G32742 stage/playTime, G35893–35910 자동 물약 순서다. Main physics 콜백은 child Player보다 먼저 실행되므로 지연 호출하여 child 자연회복 뒤에 적용한다. source-clock은 기존 render callback에서 early gates/sp/stage prefix를 확인하는 입장 조건으로만 쓴다. 미이식 중간 전투 단계·원본 accumulator/catch-up 전체의 이식 완료/정확한 모든 writer 순서라고 주장하지 않는다. 휴면 하니스의 레슨 tick owner 부재를 임의 CONTINUE/sp로 우회하지 않는다. 실제 인트로→기존 연습 건너뛰기로 정상 경로를 검증한다.

| 검증 | 결과·원로그 |
|---|---|
| 원본 JS·신규 | 최종 **2,560단정/0실패**, exit0·ERROR0·Camera2D WARNING1·종료누수0 (`new-final.*`). UTF-8 파일 oracle은 최신 main G35893–35911을 그대로 추출·vm 실행한 **420사례**. HP/악의/CD·장비/패시브·두 번 heal의 조회 순서·조건부통계 대조. 전체 원본/큰 JSON 출력 없이 파일 전달, Node --node-bin, 진단 출력 join |
| 실제 Main·writer | 신규 테스트는 `EXODUSER-demo11-25b-Isolated-20261021`. production intro owner/기존 skip 동작→자연 발동, HP/P 동기화·악의구슬1·CD·조건부 통계·미연결 SFX 영수증·HP-only ST/MP 불변·외부 writer 거절·physics cadence/serial·on/paused/tree pause 검증 |
| 직접 회귀(각1회) | QS-01 **318/0**, `test_p2005d_regen_wiring` **10/0**, `test_p2001j_lesson_clock` **21/0**, contracts **5그룹/0**. 기존 격리명/기대값/테스트 파일 무수정. reg-*-first.meta.json 및 원출력 파일 |
| 실패 이력·종료 | 최초 신규 2555단정/5실패 및 진단 재실행 동일: 휴면 하니스의 parry_lesson prefix halt 때문. production intro 하니스로 2556/0 확인했으나 MP3 종료누수 ERROR1, 다음 2558/0에서도 동일. verbose로 voice_wakeup MP3 playback/stream 2객체 확인→테스트가 음성 stop/AudioServer 해제 대기하도록 수정. 검사를 삭제/약화하거나 오류를 PASS로 계산하지 않음. 회귀 launcher 초기 충돌4건은 override 보호 assert로 **Godot 실행 전 중단**, 이후 각 suite 실제1회 |
| 정적·보호·제출 | diff-check/docs-sync/정상 pre-commit을 거쳐 자기 branch만 push하고 실제 원격SHA를 대조한다. 보호 파일/R 비교·DONE 뒤 자기 worktree 제거 결과는 외부 DONE.txt에 기록한다. 원로그 `~/exoduser-wt/_out/demo11-25b/`, bounded 원본 source-lines.txt·common-file-ranges.diff. Camera2D 기존 interpolation WARNING은 그대로 기록, ERROR0을 전체 이력으로 확대하지 않음 |

관련 설계 문서 `docs/2_8 퀵슬롯+물약시스템/2_8 퀵슬롯+물약시스템.md`에 native 범위·원순서·시간 경계·잔여를 추가했다. UI/PC 실제 플레이·패키지 동기화·저장·물약 강화 UI는 이번 검수 범위 밖이다. 변경 줄 범위는 이 브랜치 최종 파일 기준이며 State 병합 때 기존 말미 다른 담당 추가 함수와 병합 보존해야 한다.

2026-10-21 성능 후속: 같은 브랜치에 최신 origin/main `8dbbf2b0e699c36a93ca5cf41a2f3408be6da2c4`(PC 성능 수정 `aa1eaea5a` 포함)을 정상 merge했다. CHANGELOG는 DEMO11-25 절과 upstream 절 전체를 보존했다. 자체 물약 phase/runtime·QS-01·affix/formula·State/authority·provider/clock bridge 11파일에서 목록 생성 API 0건을 확인했다. 추가로 lesson holder의 물약용 read_active_status는 목록 API 없이 active만 읽는다. 같은 파일의 _obj_has(547행)에는 get_property_list가 있으나 물약 active-only API에서 호출하지 않는 별도 projection/guard 경로다. 해당 PC 레슨 코드는 수정하지 않았다(tick-api-audit.json). 후속에서 자체 제품 수정은 없으며 upstream PC 전투 파일은 수정하지 않는다. 기존 공용 추가 줄 범위는 최초 제출 SHA 기준이고, 최신 main의 Main 추가26줄로 현재 물약 위치는 18/85/1033행이다. 후속 각1회 재실행 결과: 신규 **2560/0**(원본 JS420사례), QS-01 **318/0**, regen **10/0**, lessonclock **21/0**, contracts **5그룹/0**. 전부 exit0·ERROR0·skip0, Camera2D WARNING은 신규/regen/lessonclock 각1건으로 보존했다. 원로그 `perf-followup/*.meta.json` 및 `suites-summary.log`. 자체 코드에서 새 목록 생성/API 비용을 발견하지 않아 별도 성능 벤치는 실행하지 않으며 Performance 수치로 성능 향상을 주장하지 않는다.
