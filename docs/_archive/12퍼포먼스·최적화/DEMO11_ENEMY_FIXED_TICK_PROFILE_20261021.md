# DEMO11 적 다수 fixed-tick 비용 — 2026-10-21

main0138c5bb9 +99e6fe7b/d931ebe2/c6d19973/9fd31a64 병합 기준 c09196b5. 30·60 natural etype0 추가의 CPU source loop·실제 headless physics·1920×1080 실창을 전후 각각1회 측정했다. raw/profile/표·공용 변경 범위·PC OLD/NEW는 [진단 보고서](../engine/orders/reports/demo11-perf-enemy_REPORT.md).

Mac 기하 질의의 임시 Array·반복 타원 연산을 줄여 native CPU 평균30개체2.627→2.375ms,60개체5.124→4.595ms. 기존 타원 Vector2 경계/네 corner/적 순서를 보존하고 live 데이터 변경을 허용한다. cache로 오래된 map 값을 읽지 않는다. 변경 함수 동일입력 검사6473/0 +관련회귀2352/0. PC State/자원 권위·피해/QE 파일 무수정.

최대 profiler frame의 펫 `native_pets.gd::_show_bubble` 1회가 약14.9ms. PC 이력 함수의 portrait 동기 load이며, 별도 read-only probe에서 최초 crow15.735/cat15.305ms→강한 참조 재로드4µs를 재현했다. PC OLD/NEW: 초기화 시 두 portrait를1회 로드·강한 참조 유지, 발화는 texture 배정만. 해당 PC 파일 변경0.

**전체30개체 최대8.333ms 목표는 FAIL**: headless18.975ms·실창20.652ms. CPU-only 최대3.948ms를 전체 frame 성공으로 보고하지 않는다. 실창 frame 간격/렌더 backpressure는 callback CPU와 분리한다. 기존 사용자 Godot PID21779가 남아 모든 matrix는 uncontended=false이며 단독 인증이 아니다. 120Hz N틱 벽시계가 약 실시간이어도 최대 hitch/렌더120fps 통과를 뜻하지 않는다.

기본 script profiler의 self/call count는 병목 위치를 찾는 용도이며 상속/native 귀속·계측 overhead 때문에 더해 총 wall time으로 계산하지 않는다. top512에서 목록 API가 관측되지 않아도 다른 etype 경로의 전체 미호출 증거가 아니다. get_method_list 규칙과 측정 원칙은 [PC 성능 진단](GODOT_METHOD_LIST_TICK_COST_20261021.md), 공식 [CLI](https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html)·[Profiler](https://docs.godotengine.org/en/stable/tutorials/scripting/debug/the_profiler.html)를 따른다. 원본 동작/RNG/보호 검사를 약화해 목표 수치를 맞추지 않는다.
