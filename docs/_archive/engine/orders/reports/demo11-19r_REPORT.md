# DEMO11-19r — 성장 writer·PC 재계산·XP 순서 연결

기준 **45be76e49d0090316b91a6b7b383d81835e29192**, PC 의존 **a28117c1**은 이미 main 조상이라 별도 merge0. 계약 `docs/engine/PC_RUNTIME_STAT_REFRESH_CONTRACT_20261021.md`를 소비한다. 이전 00340d57의 pre-Tree BLOCKED는 별도 runtime owner 인수로 해소됐고 초기화 dispatcher/전투 sink guard를 풀지 않았다. 선행 DEMO11-38 반송은 같은 branch **5ff66f32**, main 보존 merge 후46+100+293=439/0·push/원격일치·WT제거 완료다(자세한 로그는 _out/demo11-38/return-*).

| 원본·순서 | 구현·계약 |
|---|---|
| G27697·27699–27726 / META-04 | caps500·패시브26/max10을 원문 대조. 기존 bootstrap canonical key와 기존 point policy만 재사용. stat/passive 증감·grit·live/base 계획·legacy VIT 포함 환불. 새 cost/효과 수식0 |
| G51204–51215·51242–51274 | Main.request_native_growth(command)→State 동일 owner/XP guard→실제 STATS/PASSIVES/SP/AP/기존 raw_grit holder commit→PC apply_stats→status/3owner committed_fields/20필드 after readback→기존 HUD 수치 확인. reset API는 UI 확인 이후의 transaction 접점이며 확인 대화창/전체 성장 패널은 새로 만들지 않음 |
| G51219–51233·51251–51260 / META-05 | enqueue/cancel은 원본대로 재계산0. process는 FIFO/max-head제거/부족 선두 중단, 투자 있을 때만 PC 호출. reset/direct 증감은 raw queue를 건드리지 않음. plan은 감소한 패시브 예약만 제거하고 큐 투자 후 갱신 |
| plan applyStats 호출 | 원본 계획 콜백은 큐 투자 시 재계산+마지막 재계산으로2회. 이 원자 transaction은 최종 할당 후 **1회**로 합침(중간 콜백/await0). 원문24 logical 결과 정확대조·실제 PC 두 번째 pass의20필드 동일 단정으로 현재 stats/passive/grit/queue fixture의 동등성 확인. 전체 임의 외부 부작용의 동등성으로 확대하지 않음 |
| G43157–43158 / DEMO11-20 | 레벨 루프 AP 지급→큐 투자→PC 재계산→새 actual max로 기존 heal1회→원래 level-up 표시/저장 handoff. 이미cap/level증가0에는 큐 투자0. XP handoff 재진입 UI 투자 거부 |
| 실패 시 무변경 | PC NOT_READY/REJECTED는 자체 derived 무변이 계약. 호출자 쪽 allocation/raw grit/SP/AP/raw queue·XP 5필드를 복구하고 실제 readback unchanged 확인. late shield producer 거부2회는 진짜 PC 경로로 검증. PC 자체 READY/readback 계약 위반이면 INCONSISTENT로 노출·보호 필드 직접 복구0(가짜 unchanged 금지) |

| 변경·검증 | 결과·한계 |
|---|---|
| 공용 Main | +12/-0, 끝 부분 request_native_growth/read_native_growth event API·기존 HUD 진단행만. 키 변경/틱 caller 추가0 |
| 공용 State | +31/-2, 성장 preload/lazy owner·XP 잠금/큐 후처리·실패시 XP 복구·새 동일owner wrapper·미이식 passive_queue 태그 제거. 정확 줄범위는 아래 기록. 기존 PC 보호 sink/전투 함수 본문 변경0 |
| 다른 담당/원본 | Player·World·HUD·resource authority·PC refresh·초기화/서비스·META04/05·raw_grit 파일·원본/맵/에셋·docs2_3 변경0. 실제 파생 쓰기는 PC 인터페이스만 호출 |
| 신규 검증 | **383/0**, 원본 JS 콜백24사례·26key/max 검증, stat cap/부족·rank경계/환불·grit·reset legacyVIT·큐 취소/순서/불충분·stale plan·실제 PC 실패복구·XP 회복/표시순서·원래 dict identity. 최초382/25는 JSON 숫자 중첩비교 하니스 불일치, 기존META05 equal 규칙 재사용 후 실패suite만 재실행·검사1개 추가 |
| 표시·저장 | 최소 확인은 기존 HUD 상태행(SP/AP/QUEUE), 실제 새 성장 조작 패널은 META-11에 인계. 저장은 요청 정보만/committed=false, 실제 IO·세이브 형식 변경0. 실창/PC Windows/전체 UI·언어 인수 미실행 |

공개 호출은 `main.read_native_growth()`와 `main.request_native_growth(command)`다. command는 `{action:"stat"|"passive",key,amount}`, `{action:"plan",plan}`, `{action:"reset"}`(UI 확인 이후), `{action:"queue_add",key,amount}`, `{action:"queue_cancel",index}`, `{action:"process_queue"}`. 계획은 기존 META-04 create_plan(snapshot)의 구조다. 성공 applied=true/status=READY/after/refresh, 거부 applied=false/reason/unchanged를 읽는다. queue만 변경되거나 대기하면 refresh는 빈 dict다. PC receipt는 detached 반환, 실제 저장 성공은 주장하지 않는다.

공용 최종 줄범위: Main 3051–3062; State 6–8 / 656 / 659 / 661–662 / 698–702 / 1520–1538 (git hunk 기준, 원본은 L/shared-ranges.json). 원로그 L=`~/exoduser-wt/_out/demo11-19r/`, Node --node-bin·OS.execute 전체 chunk join/UTF8 파일 oracle, 각 Godot pgrep>=2일 때30초 대기·매run override 후0byte. 신규 격리 EXODUSER-demo11-19r-Isolated-20261021, 기존은 각 파일 상수. 틱 _process/_physics/advance 등록·목록 생성 API 추가0, 15ms 수치는 PC 계약 참고일 뿐 새 성능 벤치/성능 향상 주장0. 관련 회귀만각1회, 결과는 마감에 기록. 자기branch 일반push/원격SHA/DONE 뒤 자기 WT제거·R 보존. 전체 성장 UI/실제 세이브 완료로 과장하지 않는다.

마감 검증: 신규383/0 + META04 1076/0 + META05 1102/0 + DEMO11-20 214/0 + PC refresh290/0 + DEMO11-17 100/0 + P2001c45/0 = **3210/0**, skip0·예상밖ERROR0. 기존6suite는 각1회, 신규 첫382/25 실패 후 숫자 비교 하니스 정정과 원본 plan second-pass 단정1개를 추가한 suite만1회 재실행. 제품 코드는 최초 실행 뒤 수정0, 검사 삭제0. import1+신규2+기존6=Godot9회, gate/격리/override0byte 기록.

PC 회귀의 기존293 대비 이번290은 동일 테스트 코드107–110행의 초기 장비 빈 socket 순회 단정 수 변동이며 이번 fixture socket26개다. 원문 oracle10사례/20필드=**200 대조는 동일**하고 테스트0줄 변경했다. 선행293 실행의 socket fixture 자체는 보존되지 않아 그때 개수는 실측치로 주장하지 않는다. 기존 PC 회귀 내 시간값은 성능 기준/개선 주장으로 사용하지 않는다. 이번 테스트에는 Camera2D interpolation WARNING만 관측했고 P2001c의 ObjectDB 누수 WARNING는 관측되지 않았다. 과거 경고의 해소 원인은 이 단위에서 판정하지 않는다. 원문 전체 경고 목록은 validation-summary.json을 따른다.

정적 검증은 신규 tick/list API0·보호 파일/원본 불변·PC a28117c1 조상·공용줄범위·정확 staging 범위를 확인했다. 최종SHA/원격/DONE·자기 WT제거/R 보존은 L/final-receipt.json과 DONE.txt를 따른다.

첫 커밋 시도는 스테이징 목록의 미생성 테스트 UID 경로 확인이 중단시켜 문서가 미스테이지였고 정상 docs 훅이 차단했다(커밋 생성0). 경로 실행 전용 테스트의 UID는 임의 생성하지 않고 실제 존재하는 자기 코드/문서를 정확히 스테이징해 재시도했다. 훅 우회0.
