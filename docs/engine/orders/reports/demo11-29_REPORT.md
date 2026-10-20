# DEMO11-29 — 데모 소켓·유물·장비 제작 거래

판정: **PARTIAL / 재련·빈 슬롯 제작 자동장착 경계 HOLD**. 원본에서 폐지되거나 데모 금지인 기능으로 오인하지 않는다. 최신 fetch의 main `0138c5bb9188d27cee10cb1a901d075092ddb88f`에 장착22r `d276e02ed3bc8c6610c2a3d5c1404c14a515fe3c`를 정상 merge한 기준(동일 HEAD)에서 작업했다. 브랜치는 `codex/demo11-29-20261021`. 전체 main 동기화·PC 실행 인수를 주장하지 않는다.

| 거래·원본 근거(game.html G행) | 연결·제한 |
|---|---|
| 데모 판정 | G16646–16650은 stage0/level100 및 금지 affix7종. G50549–50555 renderForge 탭에는 `_DEMO_MODE` gate가 없다. 장비 슬롯별 상위 탭은 `_EQUIPMENT_TABS`로 감추지만 craft 탭으로 진입한다. G51085 제작 목록은14슬롯이며 유골함 없음. 보석/소켓/제작/재련 전체를 데모 금지로 숨기지 않는다. 기존 ITEMS/NPC_WORLD 순서안은 참조만 함 |
| 소켓 READY | G15777–15829 attach/detach/stoneUnseal/stoneUpgrade. actual INV/보석/소켓석 같은 참조를 이동하고 최초 동품질 석을 소모. 해제9999 cap, 최대5홈, 품질보다 높은 석만 승급. G15491의 화면처럼 승급 버튼은5홈에서만 노출. 개방은 refresh0, 부착/분리/승급은 PC `apply_stats`1회(사전 캐시 무효화·장착용 clamp 없음). 기본 홈은 원본 랜덤1–2개를 보존 |
| 유물 READY | G15285/G15297–15300 강화 비용, G15380 dust비용50/200/500/1500/5000. G50952–51079 강화=동종/동성급 첫 다른 재료1개·악의 차감·enh+1, 합성=첫3개 역순 제거·품질 반올림 평균·성급+1/enh0, 분해=성급 비용50% 가루. 제작=가루 또는 craft:true3종만 악의25, q=1+trunc(U×100). 강화/합성만 applyStats, 분해/두 제작은 refresh0. v0.7.0 패치노트의 품질1–100/최대5홈 계약과 일치 |
| 장비 제작 READY/HOLD | G50419/G51165–51186 악의100000 선차감→element U→rarity U(90%3/10%4)→필요 weapon/bow type U→기존 mkItem. tier0/실제lv, 반지·귀걸이 원래 대상 순서. 이미 차 있는 슬롯은 기존 State pickup writer로 실제 bag에 넣음. **가방 포화는 원본 G51167/G51178처럼 이미 낸 비용/RNG를 환불하지 않고 pickup 실패만 반환**(예상하지 못한 owner 실패와 구분). drop_item_source 전체 생성기 재사용, demo opt-in 금지7 affix 필터만 추가(default false로 기존 caller 유지). **빈 슬롯은 아래 recalcSt 인터페이스 부족으로 차감/RNG 전에 HOLD** |
| 재련 HOLD / PC 요청 | G50458/G50836 가격은 `_malCost(200)`=100(구 ITEMS trace의100 raw를 그대로 재사용하지 않음). 원본은 rollAffixes(rarity,slot), brType 생략 후 **recalcSt→applyStats**. 빈 슬롯 제작 G51176도 같은 순서다. PC 공개 refresh는 apply_stats/equipment_refresh만 있고 recalcSt 단독 writer가 없다. 장착용 equipment_refresh로 대체하면 hp/mp/st/shield 사후 clamp가 추가되므로 불일치. restore 전용 sink/초기화 단회 sink를 우회 호출하지 않음. PC에 실제 owner·3캐시 무효화→기존 resource_parameters.run_recalc_st→ST/mST commit·실패 무변이 receipt를 요청. 도입 후 이 두 경계만 풀어 apply_stats를 뒤에1회 호출해야 한다. 현재 UI 버튼 비활성, 내부 NOT_READY만 반환하며 개발 상태 문자열 화면 노출0 |
| 실제 거래·실패 | Main 요청→State workshop/equipment 단일 lock→actual INV/보석/석/가루/악의→기존 PC refresh. stale item/gem·재료/돈/성급/슬롯/외부 owner/재진입 거부. refresh 실패시 중첩 참조/악의/3캐시 복구, 이미 뽑은 공용 RNG는 되감지 않음. paused craft bag pickup만 기존 State writer에 좁은 lock 예외 추가(실제 제작 operation·caller·동일 item 1개 window). forge/equipment 재진입은 차단 |
| 공용 변경(의존22r 대비) | Main GDScript 3086–3102 **+17/-0**. State 765/1553 각guard **+2/-2**, 1608–1628 **+21/-0**. forge panel 81 input guard/178 navigation/230 transfer 문구 **+3/-1**(최종 diff hunk는 외부 common-diff.txt). 공유 drop_item_source 29–31/65–66 **+5/-1**. 나머지는 신규 workshop/UI/검증 파일. Player/World/PC runtime/resource authority/피해·전투핵심/저장IO·schema/맵/공용 export 도구0행 |

State에 실제 가루 원장을 추가했으나 save owner는 건드리지 않았다. dbSaveNow/dbSaveForce·복원용 dust 인계, SFX/lesson callback은 미연결이다. 재시작 지속성 완료를 주장하지 않는다. 보석/석·장비·악의는 기존 actual State 원장을 소비한다. 화면은 기존27 대장간의 G 진입/폰트·재료·pause 계약을 재사용하며 별도 자연 tick/독립 BINDS/사설 RNG를 추가하지 않았다. 작업대가 열려 있으면 기존 forge의 G 처리만 넘겨 이중 패널/일시정지 꼬임을 막는다.

| 검증 | 실제 결과·한계 |
|---|---|
| 신규 실제 Main/State | **new-05: 96/0**. explicit wallet/material fixture, 실제 paused 거래/identity/HP·crystal readback/공용 RNG/거부·rollback/재진입/HOLD 무변이. 원문 JS UTF-8 파일 oracle은 **17사례·41검사/0불일치**. mutation은 전체 INV/bags/materials를, 제작은 기존 pickup 좌표/_pickT만 제외한 전체 생성 item을 exact 비교한다. applyStats/recalcSt는 oracle 안에서 stub이므로 자원식 JS 대조로 과장하지 않음. 실제 PC 모드/무효화 횟수는 별도 단정, 자원 원문식은 기존 PC 회귀10사례200필드가 검증 |
| 직접 관련 회귀 | equipment442/0, forge1918/0, kill_rewards45/0, equipped_socket_multiplier1713/0, PC runtime286/0. 기존 스위트는 각 상수 격리 이름, 변경한 함수와 직접 관련된 것만 실행. 마지막 모드/입력 수정은 신규와 forge/capture, pickup window 수정은 신규/pickup만 추가 확인. 모든 최종 실행 ERROR0, Camera2D physics interpolation 기존 WARNING1(소켓 순수 suite0) 보존 |
| UI·번역 | sockets/gems 1920×1080 각1장+1480×984 1x crop, capture-02 **7/0**(크기·저장·실제 G 종료/이중 forge/일시정지 확인). 흑철/뼈색#dfd6c2/금빛 헤어라인/적갈색 선택 탭, 제목 hell_title/Cinzel, 숫자 포함 본문 hell 폰트. 이모지/개발 상태 문구0. 23쌍 신규 문구 등록, 기존 번역 파일 bytes를 보존하고 CRLF 추가(단독LF0). 캡처는 명시 재료 fixture이며 자연 드랍/재화 획득 검수 아님. 자체 화면 확인 후 맥북총괄 눈 검수 대기. capture-02 뒤 pickup window/가방 포화 알림 처리만 보강했다. 캡처한 소켓·유물 레이아웃·폰트·색/캡처 코드 변경0 |
| 실행·실패 이력 | 초기 import/panel parse 실패는 첫 줄 주석 접합 오류로 수정. new-01 88/4는 낮은 q의 정수 공격력 표시 단정·기본 홈 수 fixture·oracle UI helper 추적 오류. new-02 88/1은 기본 홈1개 고정 가정 잔재, 원문 oracle는 이미16사례 일치. new-03 86/0 뒤 source refresh 차이를 발견해 direct apply_stats로 정정하고 불가한2경계는 HOLD로 명시했으므로 이를 최종 전체 기능 PASS로 재사용하지 않음. 실패 로그 전부 보존. 모드 수정 뒤 new-04는93/0, 마지막 pickup window·원본 가방포화 차감 보강 뒤 new-05는96/0(17사례·41검사 일치). paused callback의 직접 pickup/작업대 pickup 재진입 거부와 가방300칸 포화에서도 비용100000/RNG 유지·미수령을 추가 검사했다. 검사 약화/가짜 PASS0. |
| 성능·격리·제출 | 이벤트 전용: _process/_physics_process/advance 추가0·목록 생성 API0, 틱 벤치 필요0. Godot 매회 지정 pgrep 2이상30초 대기, override finally 제거. 신규 user dir EXODUSER-demo11-29-Isolated-20261021 확인·실제 사용자 저장 폴더 접근0. 정상 pre-commit/경로지정 stage/자기 branch push·원격 일치·DONE 후 자기 worktree 제거. R HEAD/INDEX/WORK 불변은 외부 receipt로 확인 |

실행 안내: 새 sparse worktree의 oracle에는 Node+acorn이 필요하다. 이번에는 R의 기존 node_modules를 읽기 전용 symlink로 연결했고 설치/수정0이다. 단독 재현은 해당 의존을 준비한 뒤 각 테스트 상수의 custom user dir override를 쓰고 `test_demo11_29_workshop.gd -- --node-bin=<실제 Node 경로>`로 실행한다. OS.execute는 stdout을 `"".join(chunks)`로 진단에만 쓰고 Node 결과는 FileAccess UTF-8 JSON 파일로 읽는다. headless에서도 격리 확인 실패면 즉시 종료한다.

DEMO11-26 = 원본 폐지로 불필요(근거 docs/2_8 첫 절). 이 단위에서 수동 포션/MP·ST 새 시스템을 만들지 않았다.

원로그·소스 근거·캡처·최종 SHA/원격 일치·R 불변: `~/exoduser-wt/_out/demo11-29/`. 보고서 자체의 성공 수치는 실행 종료 뒤 원로그로 확정하며, HOLD 두 경계/저장 인계/PC 실행·맥북총괄 눈 검수는 완료로 세지 않는다.
