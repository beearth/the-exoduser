# DEMO11-27 — G 대장간 강화·물약 실행 / 강화 이전 인계

2026-10-21 KST. **장비 강화·HP 물약 강화의 실제 State 결제·결과 UI 검증 완료. 강화 이전은 실제 장비 교체 caller가 없어 순수 선행 거래/API·견적 UI까지, 실장착 연결은 HOLD.** SFX·입자·펫·실제 저장 호출도 미연결로 분리한다. 장비 교체를 가장한 별도 이전 버튼을 발명하지 않았다.

DEMO11-26 = 원본 폐지로 불필요(근거 docs/2_8 첫 절).

| 범위·공용 접점 | 구현·원본 근거 |
|---|---|
| 기준·의존 | fetch main `8dbbf2b0e699c36a93ca5cf41a2f3408be6da2c4`에서 분기. HP 강화레벨 owner 중복을 피하려고 인수된 DEMO11-25b 최종 `a03a0cbc65e70274ded67f964c115ca1f6b9cea7`을 정상 merge(fast-forward)했다. META-02 정책·META-03 legacy refund 재사용. META-07 `3f0a607e`는 읽기 참조: 당시 State 권한 미허용 BLOCKED였고 실행 모듈은 없었음. 미인수 DEMO11-22 WIP 반입0 |
| 신규 거래 | `native_meta_enhancement_transaction.gd`: META-02 enh_cost를 live item에 적용. G50623 재견적→50624 부족액 반환/RNG0→50625 실제 mats 차감→50626 strict `<rate` RNG1→50627 성공만 enh+1. 실패 차감 유지·단계하락/파괴/최대단계/환급0. 실제 wallet/item 참조는 State가 위임. META-02의 유한 숫자·JS safe integer 비용 domain 전제를 유지하며 원본 enh||0 이외 지원 형변환을 발명하지 않음 |
| Main 공용 추가 | 이 단위 **18,86,294–296행(+5, 수정·삭제0)**: preload·Main-owned CanvasLayer·기존 actor/State 구성 뒤 configure/add_child. 25b에서 상속된 기존 물약 3행은 그대로 보존. 다른 전투 입력/이동·패링·방패·분노·hurtE/hurtP 변경0 |
| State 공용 추가 | `native_source_new_run_state.gd` **1261–1302행(+42, 수정·삭제0)**. forge actor/Main/실제 State 소유 guard·재진입 guard. UI가 gameplay를 pause해도 대장간 거래만 허용. `apply_native_forge_enhance`는 선택 시 잡은 실제 item 참조를 사용하며 원본에 없는 stale equipped identity 거부/견적 고정0. success roll은 기존 World.sample_native_random_unit 1회. 실제 `_g.mats`와 item.enh만 변경. 별도 지갑/INV0 |
| 물약 탭 | G50549의 탭 목록에 potion이 있으며 데모 제외 gate 없음. G50694–50705: level<10·P.lv≥(level+1)×100, 비용META-02.malice_cost((level+1)×5), level++ 후 mats 차감. level0→1 cost3·heal100→150. 25b `_auto_potion_level`을 공유해 자동 heal reader가 즉시 같은 값을 읽음. 현재 데모 cap100이므로 첫 강화 후 다음 req200 잠금. MP/ST 추가0·단건만 제공, Shift/Ctrl stale batch 미도입. MAX 화면은 불가능한 다음 단계를 표시하지 않음 |
| 이전·실장착 HOLD | G16303–16319는 독립 대장간 버튼이 아니라 equip의 선행 거래. 새 `transfer_prefix(old,item,wallet)`는 실제 인계 가능한 메모리 규칙: 부족액 교체중단·비용malice_cost(ceil(n×1000))·새 enh를 기존값보다 낮아져도 old값으로 대입·old legacy_refund 기록·old.enh0. State entry는 actual equip continuation이 없으면 NOT_READY/차감0. panel은 이전 견적만 표시하고 결제를 노출하지 않음. 후속 DEMO11-22는 원본16320 이후 유물전승·bag/grid/slot 교체·_refreshEquipmentStats·save를 소유한 caller에서 이 prefix를 소비해야 함. 해당 WIP와 독립 교체 owner/이전 버튼을 만들지 않음 |
| UI·폰트·입력 | `native_forge_panel.gd` 신규. G키는 기존 SourceBinds.BINDS.forge=KeyG 읽기(6193), native defaults만 사용하며 저장 remap 복원 완료 아님. echo 무시·G/ESC 닫기·이전 pause 복원. Hell Gothic 흑철·금/뼈색·게임 Fonts.stack hell/hell_title/cinzel_hell, 새 이모지0/기존 이름 이모지 제거. 화면은 새 지형 제작이 아니라 기존 Main 위 overlay. 새 KO/EN35쌍은 번역대상_전체목록에 등록(ko 이외 EN 폴백;29언어 완역 주장0) |
| 원본 소비 경계 | 원본 강화 callback은 renderForge/dbSaveNow만 호출하며 applyStats를 호출하지 않으므로 이번에 전투 stats 재계산·피해 writer를 새로 끼워 넣지 않음. 원본 SFX/입자/펫·dbSaveNow 미이식은 receipt/unported와 이 보고서에 보존. 세이브 형식/실 IO/재시작 후 강화 보존은 미검수 |

| 검증·캡처 | 결과·근거 |
|---|---|
| 원본 JS 대조·신규 | **1,918단정/0실패**, exit0·ERROR0·기존 Camera2D WARNING1. 원본 G50623–50627 강화 **336사례**, G16303–16319 이전 **48사례**, quote helpers원문을 UTF-8 파일 oracle로 실행. HP/MP/ST를 강화 비용으로 소모하지 않음, rate 동률 유료실패·부족 RNG0·유료 RNG1·live재견적·외부 owner 거부·실제 State/INV/RNG·shop pause복원·POT lv99/100/cost3/150회복·다음lv200 gate 검증 |
| 실패 이력 | 최초 신규1918/18 실패는 paid transfer의 JSON float와 Godot int를 Dictionary==로 비교한 하니스 문제. 모든 key/shape 유지·숫자는 exact float value 비교로 바꿨으며 tolerance 확대/검사삭제0. 실패 suite만 재실행하여1918/0. MAX 표시 후처리는 UI 정적 분기 확인이며 고레벨 자연 진행을 검증했다고 주장하지 않음 |
| 기존 직접 회귀 각1회 | META-02 **70/0**, META-03 **68/0**, DEMO11-25b 자동물약 **2560/0**(원본420사례), contracts **5그룹/0**. 전부 exit0/ERROR0/skip0, auto의 기존 Camera WARNING1 보존. 기대값·기존 test 수정0 |
| 실렌더·1x 증거 | `captures/forge-1920x1080.png` **1920×1080**, `forge-panel-1x.png` **1320×960**(확대0). 실제 Main/State/UI/World RNG로 weapon0→1 성공, roll0.906356232939288<0.99, 7500차감/42500잔액. **촬영용 악의오브50000 fixture만 주입**, 정상 데모 초기 자금/레벨 증가 아님. caption meta capture.json. capture4단정/0실패, 실제 GPU window render; 이미지 저장 성공/화면 내 panel rect 확인. 본인 육안: title/탭/장비 scroll/견적/결과 표시·클리핑 없음, 맥북총괄의 최종 눈 검수 대기 |
| 성능·보호 | 새 module/State 추가/입력 경로에 get_method_list/get_property_list/get_signal_list 없음. UI는 open/선택/거래에만 refresh, tick polling0. 별도 성능 벤치·Performance 수치 주장0. 웹원본/전투핵심/다른담당 코드/저장·R 보호 결과와 exact staging·hook·push/remoteSHA·DONE·자기WT제거는 외부 DONE.txt에 기록 |

원로그 `~/exoduser-wt/_out/demo11-27/`: source-evidence.txt, new.*(최초 실패), new-fix-json-number.*(정상), reg-*.meta.json, captures/capture.json 및 PNG. 새 테스트는 `EXODUSER-demo11-27-Isolated-20261021`, 기존 회귀는 각 파일 상수. Node --node-bin·UTF-8 파일 결과·진단 출력 join, 매 Godot 실행 전 pgrep/2이상30초대기. 보고서의 State 줄은 25b 의존 포함 후 이 단위가 추가한 범위이며 25b HP authority 함수는 이 단위0행 변경이다.

인계 요청: DEMO11-22 실제 equip transaction owner가 준비되면 source transfer prefix를 그 caller에서 원순서로 연결하고, `owns_transfer_handoff`의 증명 계약/State 진입점·실제 교체 완료/통계갱신/저장 인계 범위를 조정한다. 아직 없는 교체 완료를 영수증으로 가장하지 않는다. G 입력의 실사용 키보드 동작은 코드 경로 확인이며 자동 검사는 공개 panel API로 수행했다. 실사용 입력·물약 탭의 추가 화면·원어민 감수·실저장/재시작은 별도 검수 범위다.
