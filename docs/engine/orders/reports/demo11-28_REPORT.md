# DEMO11-28 — 분해 단일 writer·INV/UI 연결 / 자연 줍기·저장 소비자 대기

**화면 비교 자료 준비, 맥북총괄 눈 검수 대기.** 최신 fetch main `ac3764bfe5476b56e2f2388b1f2d9baeff731885` 기준, 추가 미병합 체인 merge0. 브랜치 `codex/demo11-28-20261021`. 수동/쓰레기 분해와 자동 분해의 실제 Main API→단일 State writer→G.mats/INV·드랍 picked/cache/UI를 구현했다. 현재 main에 자연 바닥 줍기 소비자와 DEMO11-06b 저장 API가 없으므로 **자연 자동 줍기·영속 저장 완료는 주장하지 않는다.**

| 구현·판단 | 근거·공용 변경 범위 |
|---|---|
| 기존 정책 재사용 | native_meta_salvage_policy.gd 0줄. G28187–28201의 base[1000,2000,10000,20000,50000]·legacy50% signed32·기록 _enhRefund max·tier×2를 그대로 호출. game SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 강화 현재 지출액50%로 재작성0 |
| 수동/확인 | G50367–50377/50397–50407의 잠금·bag.includes·equipped identity·확정 후 재검증 우선. G50776–50787 구 forge의 index splice만 재현하면 장착 보호를 놓치므로 최신 안전한 INV 경로 및 사용자 명시 금지를 적용. UI pending은 객체 참조, 확정 시 값 재계산. 선택·쓰레기·잠금·정렬/교체·중복·취소 처리, INV.selected=null |
| 자동 분해 | G41448–41460: 필터 미만 또는 pickup 실패 시 전설 미만, 값은 Math.max(1,salvageVal). 실제 현재 State drop journal 객체/미picked/미소유 검증→picked+mats 단일 commit. 실제 OPT getter 재사용, 레코드 복제/재호출·장착/가방 alias·fav 거절. `Main.try_native_auto_salvage_pickup(drop,pickup_failed)`는 줍기 담당이 실제 거리/실패 판정 뒤 호출할 접점. 새 R키/펫 줍기·INV 반입 writer를 중복 구현하지 않음 |
| 단일 owner·cache | Main.request_native_salvage→State.commit_native_salvage 하나만 분해 입금/제거/picked 쓰기. mark_native_salvage_junk는 같은 State의 junk flag만 변경. bag array identity 보존, revision 증가, Main 기존 _source_l_eq_cache 무효화 및 panel 재조회. 장착 stats 재계산/장비 쓰기0, 기존 HUD는 현재 G.mats를 읽어 갱신 |
| 공용 변경 줄 | Main340–343 설치4줄 +2974–2992 접점/캐시/선택 저장 위임19줄, 기존 줄 수정0. State1325–1365 추가41줄, 기존 줄 수정0. Player/World/HUD/resource authority/hurtE/hurtP·2_3·기존 가격 policy0줄. 새 transaction/panel/test·UID 및 관련 docs만 |
| UI·번역 | G키 중앙980×780, 선택/쓰레기/현재 악의/예상 수익·확인/취소·결과/잠금 표시. UI_FOUNDATION/UI_COMPOSITION 참조, 기존 Hell Gothic frame/crest byte 재사용·흑철·뼈색#dfd6c2·금빛 선·붉은 위험 버튼. body hell(Nanum Myeongjo 계열), 제목/숫자 cinzel_hell, 기본 sans0. 아이템 이름의 emoji codepoint는 표시에서 제외. G14350 희귀도색 유지. 번역 목록3338–3366 등록, ko/영어 폴백 |
| 미인수 접점 | DEMO11-22 장착은 PC 대기라 연결하지 않고 장착 alias 분해를 거절. 자연 줍기 소비자가 main에 없어 자동 경로는 실제 journal API 검수까지다. main에 save_native_demo11_current가 있으면 기존 저장 owner로 위임, 현재 기준 없음→NOT_CONNECTED를 그대로 표시. 임의 저장/성공 ACK 제조0. 사용자 취침 지시에 따라 이 범위 판단으로 진행하고 질문하지 않음 |

| 검증(직접 관련 스위트 각1회) | 실제 결과 |
|---|---:|
| 신규 actual Main·확인/취소/잠금/장착/identity·INV/cache/UI·자동·중복·오류 | 29/0 |
| 신규 G/Esc 엔진 입력(확인 취소/창 닫기·pause 복구) | 6/0 |
| 신규 source 경계 집중: 수동 음수 거절/0 허용, 자동 음수·0만1, 비정상/무한 루프 admission | 6/0 |
| 기존 META salvage policy / native inventory contract | 68/0 · 142/0 |
| 기능 합계 | **251/0**, ERROR0 · 기존 Camera WARN2 |
| 최종 실창 capture-text-margin | viewport/file/crop 검사16/0, ERROR0 · 기존 Camera WARN1; 기능 합계와 구분 |

초기 입력6/3 로그도 보존했다. add_child 직후 첫 프레임 전에 주입한 하니스 이벤트가 입력 등록 전에 실행됐으며, process_frame을 한 번 기다린 뒤 같은 G/Esc 경로6/0이다. 제품 입력 코드는 수정하지 않았다. 입력 장치 물리 검수가 아닌 실제 SceneTree의 Input.parse_input_event 경로다. 전체/전투/맵 회귀·장착 소비자·저장 복원은 실행/완료로 주장하지 않는다. 오류 경계는 foreign/stale item, 잠금/장착 재검증, 중복/이미 picked, 미지원 수치/비finite wallet로 제한했다. Native numeric enh/tier/_enhRefund 외 강제 coercion은 HOLD, enh>1,000,000은 실행 예산 초과 거절(가격/강화 레벨 clamp 아님). 자동 음수/0은 원본 max1, 수동 음수는 제외하고 0은 허용한다. 기존 정책의 지원 domain/가격을 바꾸지 않았다. tick hook 추가0, touched runtime get_method_list/get_property_list/get_signal_list0건. 성능 지표나 N틱 벤치는 측정하지 않았다.

캡처 `~/exoduser-wt/_out/demo11-28/captures/`: `01-selection.png`, `02-confirmation.png`, `03-receipt.png`는 실제 GUI 창1920×1080 viewport다. 각각 `-1x-items/-1x-summary/-1x-footer.png` 9개를 원래 픽셀로 저장했다. source starter bag에 캡처용 fav/junk·장착 alias를 지정한 격리 검수이며 자연 드랍 획득 화면으로 위장하지 않는다. 수익6000·보유1000→7000은 실제 동일 State commit 결과다. 최초 과대 텍스처 캡처 `initial_RETOUCH/`, 중간 크기/행 여백 검수 `retouch_02/`, `retouch_03/`도 보존했다. TextureRect expand-mode 설정 전 size가 원본 min-size에 묶인 문제를 고쳤고 1× 첫 행 glyph overhang을 12px inset으로 수정했다. 최종 수치/문자 잘림을 자체 확인했으며 사용자 시각 승인은 대기다.

원로그 `~/exoduser-wt/_out/demo11-28/` 실행별 stdout/stderr/meta·gate·source diff·캡처 manifest 보존. 신규 격리 EXODUSER-demo11-28-Isolated-20261021, 기존은 각 상수. editor/import 포함 Godot마다 정확한 pgrep 수 확인/2이상30초 대기, override 종료0byte. First 저장 폴더 접근0, R HEAD/branch·tracked INDEX/WORK 불변, 경로 지정 stage·정상 훅·자기 branch 일반 push/원격 일치/DONE 뒤 자기 worktree 제거.
