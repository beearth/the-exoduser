# DEMO11-23b — 실제 가방·공유창고 UI / 화면 비교 자료 준비

출발 main은 `0138c5bb9188d27cee10cb1a901d075092ddb88f`, 승인22r `d276e02e`와 진단 `2e0d317b`를 FF merge했다. 실제 원격 main에는 지시에서 언급한06c가 없었고 완료 branch는 `93f118fb5b63be2cbe7055fb9ca903fcf4483f13`였다. 명시된06c를 사용하고 중복 owner를 피하려고 그 완료 의존을 정상 merge한 기준은 **fb76706eb89dae79e5820745b22257f2ca53409b**다. State 끝의22r/06c 함수 충돌은 양쪽 함수를 그대로 보존했다. main에06c가 이미 있다고 주장하지 않는다. 최종 자기branch SHA/원격 일치는 외부 DONE.txt에 기록한다.

| 구현·소유 | 근거·경계 |
|---|---|
| 단일 owner | 06c `State._demo11_storage`/actual INV를 그대로 사용. 새 stock/bag authority0. UI는 WeakRef·actual 참조와 일시 rollback journal만 보유. 기존 snapshot reader/collector는 유지하고 인수된 Main/UI에만 actual reader/writer 제공 |
| 실제 IO·복원 | 기존06c session의 demo11-05 기반 game/shared adapters·collector·loaded restore/save 재사용. 원 키/배열 JSON/namespace/원자 rename 변경0. store cap200, withdraw bag.length gate·동일 item splice/좌표 정책은 G16257–16260/G48592–48608. 공유 writer 실패와 뒤쪽 game writer 실패의 메모리 복원/보상 저장을 실제 파일로 검증 |
| 장착 | 22r Main equip/unequip→PC equipment_refresh만 호출. PC 실패면22r 무변이 계약 유지. 장착 자체 성공 뒤 save 실패는 적용을 취소했다고 가장하지 않고 saved=false/일반 저장 오류 표시. actor/피해식 직접쓰기0 |
| UI·정렬 | 실제 선택/원 index·drag grid/cross-store·우클릭·TAB/ESC pause, bag/stock/장착·두 카드 비교/scroll 상세·필터·정렬. G16213–16246/G16434–16488의 stable sort·전체 itemPower, G44049–44050 열기 배치, G49534–49873 상세 구성, G50151–50296 필터/그리드 사용. 슬롯/rarity0/el0 AND·귀걸이 합동, 유니크 전용 필터 임의 추가0. source presentation/quality/crystal/special-text 재사용. UI itemPower를 CP/실제 피해량으로 부르지 않음 |
| 숫자·디자인 | Hell Gothic 흑철/뼈색·금빛 선·붉은 버튼, 숫자/본문 hell 명조. 새 이모지/개발 상태 문구0. source RARITY_C(G14350)를 그대로 사용. 기존 item_skins/ancestor 이미지 재사용·새 이미지0. 정적 제목만 hell_title. 원본 속성·어픽스·특수 텍스트를 표시하며 전투 공식을 UI에서 복제하지 않음 |
| native JSON 정확도 | 기존 SV-SHARED의15자리/큰 소수 HOLD가 정상 생성 item ID에도 걸려 native session에만 optional exact decoder 연결. decimal→binary64 nearest/even, 510개 JS Number bit 대조. 원래 source 계산/기본 reader 계약 유지. native 재관측은 full_precision JSON. plan/receipt 사후 덮어쓰기·ID 반올림/정규화0 |
| 공용 변경(기준fb76706 대비) | Main **417–422,3157–3162 +12/-0**: opt-in lifecycle 뒤 UI 설치/요청 함수만. State **1698–1711 +14/-0**: 동일 owner reader·직렬 writer만. session **+3/-1**, SV-SHARED **+8/-1**: native decoder 전달만. Player/World/hurtE/hurtP/PC resource/전투/맵0줄. 원 저장 adapter/공유 adapter/22r 제품·기존 검사14파일 byte 보존 |

| 검증 | 결과·실제 범위 |
|---|---|
| 신규 기능 | **1286/0**, actual Main·06c fresh/loaded·실제 IO·fractional ID 재시작 보존·22r 장착·identity/거부/200·300 gate·grid drag·TAB/ESC·filter·정렬. source **16가방160아이템** power/순서/좌표 불일치0(소켓 품질/결정 probe 포함), **510문자열 binary64 bit** 불일치0 |
| 뒤쪽 저장 실패 집중 | **10/0**. shared commit 뒤 game writer lock을 주입하여 적용 실패·실제 배열/객체 identity 복구·공유 원문 byte 복구·game 원문 보존 확인. 이 검사를 전원 차단 원자성으로 확대하지 않음 |
| 입력 소유·null 집중 | **5/0**: guide 관측 fixture일 때 TAB을 인벤토리가 가로채지 않고 정상 viewport TAB은 유지. 보호 guide 상태 쓰기0. **4/0**: 선택 배열이 null인 원본 falsy 분기·DEF×5·정렬을 확인. 신규 기능/집중 합계 **1305/0** |
| 직접 회귀 각1회 | **150073/0** = SV-SHARED149486 + 06c connected49 + 22r442 + TI01 layout96. 기존 테스트 수정0. TI01 oracle92는 출력만이며 별도 JS 일치로 세지 않음 |
| 화면 | 실제 GPU viewport **1920×1080 3장+1x 크롭3개**, 명시 source mkItem lv12/rarity fixture·실제 입출고로 stock2 구성. 자연 획득/자금/전투 진행으로 주장하지 않음. `captures/01-bag-1920x1080.png`, `02-compare-1920x1080.png`, `03-storage-1920x1080.png`와 각 `*-1x.png`. 로컬 육안 확인 후 총괄 눈 검수 대기 |
| 종료 | 최종 기능/집중/직접 회귀/화면 실행 모두 exit0·ERROR0·ObjectDB누수0·resource잔류0·override0byte. 상세 보완 최종 화면 전용 **15/0**, 이미지·글꼴/숫자/스크롤을 원해상도로 확인했다. 실 사용자 First 접근0, 신규는 EXODUSER-demo11-23b-Isolated-20261021·회귀는 파일 상수 |

58개 기본/슬롯과29개 상세, 합계 **87 KO/EN** 쌍을 번역 목록에 등록했다. 원본 CRLF prefix/hash를 보존하고 lone LF0이다. 임의 아이템 이름/캐릭터 데이터/진단 코드는 번역 키로 넣지 않았다. 29언어 완역·PC Windows 실기·자연 전투·전체 source CP/DPS UI·유골 도감 등록/유물 조작은 검증/구현 범위로 확대하지 않는다.

실패/수정 기록: 최초 import의 non-static coercion 호출4ERROR→native scalar 경로로 수정 후 import0ERROR. 최초 신규1229/1은 oracle에 CR_ATK/ARMOR/ACC_SLOTS 선언 누락(제품 IO/종료ERROR0); 원문 선언 추가 후1278/0. 화면 아이콘의 TextureRect 초기 최소크기 넘침을 ignore-size 설정 순서로 수정했다. 입력 검사 추가본1286/1은 global Input.parse 경로의 TAB 재열기 실패로, viewport keycode/physical 입력 경로와 처리 양쪽을 검증한1286/0으로 확정했다. 어픽스 설명 누락은 기존 name fallback, 추가 상세/특수 효과는 기존 producer로 표시하고 **기능 suite를 반복하지 않고 화면 전용 실행**으로 재검수했다. 실패 로그/중간 캡처 보존·검사 삭제/허용오차 확대0.

원로그 `~/exoduser-wt/_out/demo11-23b/`: merge 로그·new*/reg-*/storage-fault*/capture-*·oracle·capture/translation/protected manifest. 원문 game SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 틱 hook/목록 생성 API 추가0, 별도 Performance 수치/벤치0. 매 Godot 전 지정 pgrep2이상이면30초 대기, 실행별 override 정리. shared/game **다중 키 단일 원자성·전원 차단/fsync·동일 namespace 다중 앱**은 미확인(06c 경계 유지). 자기branch 정상 push·원격 일치·DONE 뒤 자기WT 제거, R 보존 근거는 외부 제출 기록에 남긴다.

기동은 기존06c opt-in `--demo11-storage=on` 또는 Main 메타와 승인 demo namespace다. 기본 OFF 경로는 그대로이며 UI가 실제 First 저장 폴더를 여는 우회는 없다. 이 결과는 **기능 검증 및 화면 비교 자료 준비**이며 총괄의 시각 인수 완료 선언이 아니다.
