# DEMO11-23 — BLOCKED / 실제 공유창고 계약 필요

제품/UI 미구현이다. 최신 main `0138c5bb9188d27cee10cb1a901d075092ddb88f`에서 승인 의존22r `d276e02ed3bc8c6610c2a3d5c1404c14a515fe3c`를 정상 FF merge했다. 실제 INV/장착은 있지만 SV-SHARED는 detached 읽기·이관 계산이다. 사용자 조건 “새 가방/창고 owner 만들지 않음”에 따라 State에 새 STORAGE 배열을 만들거나 계산 사본을 실제 창고로 가장하지 않았다.

| 확인 대상 | 근거·판정 |
|---|---|
| 실제 가방 | State `read_current_inventory():186`, Main `request_native_equip_item`/22r transaction 사용 가능. 새 가방 owner 불필요 |
| SV-SHARED | `source_shared_store.gd:72–75` receipt는 calculation_only=true/write_authorized=false/storage_io=false. :156–157 intent execute_authorized=false. :158 plan_store/:180 plan_restore는 입력 사본·관측값 계산만 수행 |
| 실제 STORAGE | main/Main·State에는 STORAGE reader/owner/입출고 writer/공유 setter 연결 없음. save_slot_menu :117은 슬롯 저장 primitive이며 공유창고 writer가 아님. bootstrap의 STORAGE reset 계획도 실제 설치는 아님 |
| 추적 문서의 동일 선행 | FDG_SOURCE_TRACE_INVENTORY §5.11 TI-09: actual STORAGE owner 인수, 없으면 fixture만 가능·실제 연결 BLOCKED. sv-shared-read 보고서도 실제 연결 전부 HOLD 명시 |

| 필요한 인수 접점 | 원본 근거·최소 요구 |
|---|---|
| 기존 공유 저장 담당의 actual reader | G48537–48549 `_getStore`, G16257–16260 cap200. 실제 namespace/STORAGE[0] 배열 identity·readiness·동기화 결과 제공. 제공 파일/추가 줄 수는 계약 전 **미확인**. plan.store 사본의 live authority 전환 금지 |
| 기존 owner의 입출고 writer | G48592–48599 deposit: store200 gate→동일 item push/bag splice→선택 해제. G48605–48608 withdraw: bag.length>=BAG_MAX 거절→store item→좌표null→bag push/store splice. 빈자리 사전검사 추가0. actual bag/store 양쪽 owner와 이동 readback 필요 |
| 공유 setter·실패 결과 | G48551 `_persistSharedStorage`, G48521–48527 getter/setter. namespace/실패·재조회/부분 상태·중복 처리 계약은 저장 담당 인수 필요. 새 저장 형식·성공 ACK·롤백 정책을 발명하지 않음 |
| UI 재착수 위치 | Main의 event-only inventory caller에서 인수 reader/writer 연결, State actual INV와22r 장착 재사용. Main/State 정확한 줄 수는 구현 후 보고. 이 연결의 owner 인수 SHA가 있어야 실제 가방/비교/창고 통합 화면 검수 가능 |

기존 `test_native_shared_store_read.gd`를 **1회149,486단정/0실패**, 읽기100/store17/복원131×2 평가로 확인했다. --verbose exit0·ERROR0·ObjectDB누수0·resource잔류0·override0byte. 결과도 actual_storage_reads/writes/server_calls=0, live_connection=false이므로 실제 UI/IO PASS가 아니다. 기존 격리 상수 `EXODUSER-sv-shared-read-Isolated-20261020`, Node --node-bin·진단 join/UTF-8 파일, 실행 전 지정 pgrep gate 유지. 원로그 `_out/demo11-23/shared-read.*`, oracle와 bounded 원본 근거 보존. source SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`.

제품/테스트/Main/State/전투/저장/폰트/맵 수정0, tick/목록 생성 API 추가0. docs2_7/7·원본 화면/희귀도 지침은 읽었으나 UI 신규 텍스트0·번역 목록 변경0(CRLF/hash 보존). 가방/비교/창고 3캡처·1x 크롭은 **미생성/미검수**다. fixture 창고 화면으로 대체하지 않았다. 새 테스트가 없어 신규 격리 이름은 사용하지 않았고 기존 회귀 상수만 사용했다.

공유 저장 담당이 actual owner·reader·입출고·setter 결과 계약과 인수 SHA를 제공하면 UI 단위를 재개한다. 현재 branch는 기능 완료 병합 대상이 아닌 BLOCKED 진단이다. 변경은 이 보고서/CHANGELOG_SYNC/docs2_7/본인 작업판뿐이다. 자기branch push·원격SHA/DONE·WT제거·R보존은 외부 제출 기록에 남긴다.
