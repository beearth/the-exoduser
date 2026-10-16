# 실제 Main 플랫폼 프레임 입력 — 2026-10-17

| 항목 | 정확 API / 적용 위치 |
|---|---|
| 소유자 / 생성 | 실제 Main이 _native_source_frame_timestamp_ms=null, _native_source_render_serial=0을 소유한다. source G/P/global clock을 생성·변형하지 않는다. |
| 갱신 caller | Main._process(_delta) 첫 줄의 _capture_native_source_frame_input(). 현재 실제 Main script/lifecycle일 때 Time.get_ticks_usec()/1000.0으로 단조 밀리초를 기록하고 렌더 serial을 1 증가시킨다. 그 뒤 기존 공격 audio/Q 렌더 본문을 같은 순서로 실행한다. |
| 플랫폼 시간 domain | godot_engine_monotonic_milliseconds. 엔진 uptime의 단조 시각 입력이며 source _now/_dtSp/sp/_acc/_gameTime 또는 browser RAF와 같은 origin이라는 주장이 아니다. 기존 _source_now_ms() system wallclock ID 경로는 변경하지 않는다. |
| 신규 Main API | read_native_source_frame_input(caller:Node)->Dictionary. 같은 현재 Main 또는 같은 World caller만 허용한다. World는 현재 Main의 자식이며 실제 current world identity가 같아야 한다. Main 수명 손실/queued/외부 caller/World 교체는 NR. |
| 신규 World API | read_native_source_frame_input()->Dictionary. 실제 같은 Tree의 World와 부모 Main script res://scripts/main.gd 및 main.world==self를 확인한 뒤 Main.read_native_source_frame_input(self)를 호출한다. |
| 첫 프레임 전 | 실제 capture가 없으면 ready=false / actual_main_render_input_not_captured. timestamp=0/1 또는 system clock 대체값으로 준비를 제조하지 않는다. |
| 반환 / 의미 | ready=true는 LAST_NATIVE_PLATFORM_RENDER_INPUT_ONLY 범위다. timestamp_ms, render_serial, clock_domain, source_clock_ready=false, source_update_returned=false. render_serial은 입력 갱신 metadata이며 source counter가 아니다. |
| 현재성 한계 | 마지막 실제 Main._process 진입의 플랫폼 sample을 읽는다. 이후 시점의 현재 source update/현재 진행 중 callback/physics step을 보증하지 않는다. 향후 frame producer는 같은 실제 render caller와 신규 serial을 검증해야 한다. source prefix가 끝난 뒤 stale sp를 읽어도 된다는 계약이 아니다. |
| 실제 소비 | Main.get_native_content_version_manifest()의 platform_frame_input은 World의 신규 공개 reader를 경유해 같은 실제 Main 현재 sample을 읽는다. source clock / content parity / latest_full_game 준비로 승격하지 않는다. |
| 부하 | 렌더 갱신은 primitive field 2개만 대입한다. Dictionary는 공개 read/manifest 요청에서 만든다. 기존 physics / HP / 적 / source clock / RNG / audio body / asset / save / UI 처리 변경 없음. |

## 새 영향 검수

| 항목 | 관측 |
|---|---|
| 첫 실행 | Godot 4.7.2 격리 SceneTree에서 자동 Main._process callback을 실제 실행. 12 checks PASS / exit0 / stdout·Godot log ERROR/WARN/leak0. 수리·재실행·기통과 suite 재연0. |
| 입력 관측 | 해당 fixture 첫 serial1 / timestamp106.349ms, 후속 serial3 / timestamp119.444ms. 관측 예시이며 고정 주기/FPS/원 시계 상수가 아니다. |
| 범위 | 제품 Main/World 메서드 정확 추출본 + 실제 Time.get_ticks_usec. preTree/첫 capture전 NR, 다음 실제 callback 갱신, audio body 전 capture, caller·reparent·World identity 교체·Main 제거 거절, 반환 Dictionary 변경의 원 sample 비오염. |
| fixture 경계 | 전체 제품 Main/World scene 실행 아님. 기존 audio/Q 의존부는 대역이며 원 이미지·음원/SourceState G/P/자원/save/UI 실행0. manifest 전체 bootstrap은 실행하지 않았다. |
| Source clock 상태 | sp/_dtSp/_acc 계산 및 controller/body/gap/전체 update 반환 미연결. 알려진 결함이 검수 중인 외부 source prefix는 이 단위에 복사·채택하지 않았다. |
| 보존 | 정확 I/R 5경로의 분리 INDEX/WORK/UNTRACKED·realparent/nonlink·개별 WORK/HEAD copy 시작/종료→manifest→code/doc 쓰기시각을 기록. main/R/served 자동 적용0. |
| 사용량 | 시작 계정 공유 주간 누적39%. 일간 소비 미상. 종료 관측은 별도 receipt에 기록하며 전용 소비로 귀속하지 않는다. |
