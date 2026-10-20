# DEMO11-24b — 306id 분류·게임 시스템 소비

동일 브랜치 `codex/demo11-24-20261021`의 인수 SHA `5a3af4106b3fc944177f94563d7fc4988a33ebf3`에서 이어간다. fetch한 origin/main은 `0138c5bb9188d27cee10cb1a901d075092ddb88f`이며 이미 ancestor라 정상 merge 결과 Already up to date. 미병합 타 브랜치 반입·rebase·force·main push 없음. R은 시작 HEAD/branch/INDEX/WORK를 분리 보존한다.

| 306id 분류 | 수·근거·처리 |
|---|---|
| ① 게임 시스템 | **14개**, 원본 함수 소비 근거. 드랍/LCK G27996–27999·경험치 G43140–43144·비용 G28041/31983·쿨 G28065·물약 G35894/35903·재생 G32713·영역 flat G32709/_fuseMul G44557. 빈도순 상위 **13개**의 기존 owner에 장착 시점 값 캐시 연결. 수식·장비 테이블·자원 authority 추가 없음 |
| ② PC 전투 | **추가50개**, 보호 피해/방어/패링/기동/분노/상태/부활·공격/시전 동작. `_elAx/_elBn` G42216–42218의 동적8id를 포함. 이전72와 구분해 pc-iface-pack으로 인계. 선택13 중 LCK/skillBoost/비용·쿨의 미검증 보호 소비 부분도 별도 요청 |
| ③ 데모 드랍0 | **0개**. 이306은 전 단위 원본 롤 관측에서 모두 나온 후보다. 소비 미구현·죽은 함수를 드랍0으로 오인하지 않음 |
| 원본 소비처 미확인 | **242개**. 정의/표시 외 실제 literal/동적 소비 근거 부재. 요청한3분류를 억지로 채우기 위해 추정하거나 새 식을 만들지 않음. [306행 전수표](../../../7아이템디자인/DEMO11_24B_SYSTEM_CONSUMERS_20261021.md)에 각 id·빈도·원본행·상태를 남김 |

연결13개: `lckFlatR, mpCostRed, dropRate, stCostRed, skillCdRed, potionPower, lckFlatN, expBonus, lifeHealPow, skillBoost, cooldownRed, helmCooldown, endCooldownAll`. 기존 reader 결과를 부팅/성공한 PC refresh 신호에서만 캐시한다. 캐시 조회는 식/분기를 재구현하지 않으며 원래 reader의 캐시 token identity도 보존한다. 기존 보호 hurtE의 보상·드랍, 기존 스킬 quote→자원/쿨 writer, 기존 자동 물약→HP sink, 기존 HP/영역 source phase의 식을 그대로 사용한다. Main 인터페이스의 선택 id만 값 캐시로 보내며 PC 파일은 바이트 그대로다. 지원 상태는 `system_component_only`이고 공격/방어 전체 구현 완료를 뜻하지 않는다.

①의 미연결1개 `potionCdRed`는 NOT_READY다. 원본 `useQuickslot` 정의 G28202–28245에는 소비 식이 있지만 game.html 이름 검색상 정의뿐이며 HP 퀵슬롯 폐지 이력이 있다. 실제 자동 물약 G35898–35902는 이 id를 소비하지 않는다. 자동 물약에 임의로 넣거나 폐지된 수동 UI를 되살리지 않았다. 기존72의 goldBonus는 보호 처치/악의 경로 요청을 유지하고 별도 악의를 지급하지 않는다.

공용 변경(5a3af410 대비): **Main +23/-3**, 새 줄 범위 **89–90,207,842–844,1070–1075,2315,2373,2478,3054,3099–3105**. 캐시 소유·부팅·회복 callback·기존 비용 조회·공개 affix 조회·성공 신호 연결만. **State0줄/Player0줄/hurtE0줄/저장0줄**. 관련 게임 시스템 `native_source_player_regeneration_phase.gd` **+38/-4**, 새 줄 :44/:78/:133–142/:148/:613/:626–649에서 캐시 callback 및 실제 완료 intro의1회 identity 인수만 추가; 원래 provider script/owner 검증은 유지. `native_potion_recovery.gd:62` **+1/-1** 캐시 조회. `native_equipment_effect_consumption.gd:32–34` **+3/-2** 게임 시스템 부분의 receipt 판정. 인트로/레슨/World/피해/순수 계산 owner는 수정하지 않는다. 원문·보호·순수 계산 owner 15파일 해시 동일. 상세 diff·범위는 외부 common-diff.txt/common-ranges.json.

| 검증 | 결과·실제 범위 |
|---|---|
| 신규 id별 소비 | **131/0**, 13id/원문13사례 exact JS Number 불일치0. dropRate는 실제 보상 handler의 캐시 소비/roll_drop journal과 원본 affix 합산값을 대조하며 확률 분포의 실측 일치를 주장하지 않음. 실제 Main 장착13id, 100회 캐시 조회당 source query0, 성공 refresh1회당 warm1회, 실제 보호 처치 보상·실제 스킬 자원/쿨 commit·자연 물약/회복 phase. 원본 JS 함수/식 실행과 수치 비교. 직접 DOT 처치/장비/스킬/자금/HP 손실/적 위치는 명시 fixture, 자연 드랍 플레이 성공으로 주장하지 않음 |
| 관련 회귀 | **4,167/0** = 前24 639 + 장착442 + 자동물약2,560 + source회복88(6그룹) + 보상45 + dispatch393. 각1회·기존6파일 동일 바이트. 기존 source회복의 stale/duplicate/identity/lifecycle 거부 검사 유지 |
| 종료·격리·성능 | 최종 신규 --verbose exit0·ERROR0·ObjectDB 누수0·resource 잔류0; 관련6종도 모두 exit0·ERROR0·누수0·잔류0. 매 실행 exact pgrep에서2이상이면30초 대기. 실행별 override finally0byte·신규 EXODUSER-demo11-24b-Isolated-20261021/기존 파일 상수·실사용 저장0. 틱 목록 API 추가0·매틱 source affix 사전조회0, 값 캐시 조회만. 기존 arity static cache는 변경하지 않음. 벽시계 성능 벤치 추가 필요 없음 |

하니스 실패 이력도 원로그에 보존한다. `new`는 World 적 목록을 속성으로 잘못 접근해 SCRIPT ERROR1, 자기 Godot 종료 후 `get_enemies()`로 고쳤다. `new-02`는 정지시킨 tree에서 실제 보상/자원 writer를 호출해 정상 거부됐고, 정지 중 물약 readback null을 숫자로 바꿔 SCRIPT ERROR1로 중단했다. 검사·writer guard를 약화하지 않고 기존25b와 같은 실제 intro/lesson skip 절차로 clock을 열고, 실제 이벤트 commit 때만 동기적으로 tree를 재개하도록 하니스를 고쳤다. 원본 제품 식/보호 파일 수정은 없다. `new-03/04`는128검사 중5실패로 실제 회복 미진입을 검출했다. new-03은 wakeup MP3 해제 대기 누락으로 종료 리소스1 잔류; 기존25b 방식의 AudioStreamPlayer 정지/AudioServer 해제 대기를 하니스에 넣어 new-04 종료ERROR/누수/잔류0을 확인했다. new-04의 snapshot은 clock_admitted0·rejected134/139·stale_duplicate_or_mismatched_native_tick이다. 원본 intro/lesson이 ens를 교체하는 실제 전환을 기존 phase가 인수하지 못한 제품 연결 문제였다. Main 등록·원본 intro/lesson 완료·같은 owner/binding·1회 사용을 검사하는 명시 인계를 추가하며 원래 clock/sink 검사는 유지했다. new-05는 인계 뒤 자연 HP가 실제 적용됐고, 영역1개만 하니스가 owner 외부에서 주입한 zone이 기존 NativeSkillSlots에 의해 갱신되어2실패였다. guard/판정을 낮추지 않고 실제 cast_holy_dome 경로를 사용한 new-06에서131/0·13사례 일치·종료0을 확인했다.

원로그·전수 분류 JSON·pc-iface-pack.json·id별 결과·원본 대조·R/보호 파일 해시는 `~/exoduser-wt/_out/demo11-24b/`. UI 변경·새 화면 문구·실사용 저장 IO 없음. 242개에 원본 소비 계약이 발견되거나 수동 퀵슬롯을 되살리는 결정이 있어야 나머지를 연결할 수 있다. PC 보호 소비는 이 단위 완료 분자에 넣지 않는다.
