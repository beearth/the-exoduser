# 파이어볼 source sample global 실제 소유·소비 연결 — 2026-10-17

| 항목 | 정확 현재 계약 |
|---|---|
| 원 근거 | canonical R/game.html:17472 let _gxVolMul=1, playSample:12361와 playSampleAt:12383 읽기. 기존 Acorn으로 해당 script 1개 내 Identifier 5개를 처음 조사했다. 선언 1개·직접 assignment/update target 0. 동적 eval 및 모든 간접 쓰기 부재 증명으로 확대하지 않는다. |
| 신규 원 소유자 | native_source_sample_globals.gd RefCounted. initialize_source_boot() 최초 1회가 원 선언값 1을 자신의 current field에 설치한다. getter의 fallback 상수 또는 원 실행 화면의 현재값 관측이 아니다. 다시 boot하면 false이며 기존 값을 덮어쓰지 않는다. |
| current 읽기 | read_current_sample_context()->Dictionary. 명시 boot 전 NR, current field가 비수치/비유한이면 NR. 초기값 snapshot을 current 대용으로 읽지 않는다. 프로덕션 setter/자동 reset/restore 없음. |
| 실제 Services 배선 | configure()의 Readers 생성 뒤 _initialize_source_sample_globals()를 한 번 호출하고 실패하면 discard한다. 실제 Services가 같은 owner를 보유하며 discard는 owner를 해제한다. 기존 OPT/파생공식 초기화와 순서는 유지. |
| 신규 Services 공개 API | read_current_sample_context(caller:Node)->Dictionary. 기존 actual Main/World/Player/State/Resources/Providers/Dispatcher lifecycle·identity 검증 후 caller가 동일 weak Main인지 확인. owner 부재/철회는 NR, getter에서 새 owner 생성 또는 재초기화 없음. |
| 실제 소비자 | Main.read_native_fireball_sample_dispatcher_readiness()가 실제 SourceInitializationServices script의 동일 current getter를 self로 호출한다. 투사체 delivery Node를 sound-global owner로 가정하던 계약을 이 경로로 교체했다. |
| 준비 분리 | sound-global 준비, 기존 실제 OPT/audio backend 준비, character profile 준비를 각각 확인한다. 실제 projectile delivery/prepare는 별도 필수이며 여전히 미연결 NR이다. |
| 보존한 응답 | sample_loaded와 loader_bound=false는 dispatcher ready와 별개. 무음인 더미 stream/미연결 fallback1/관측 현재1 제조 없음. |
| 기존 순서 | Resource caller RNG → void dispatcher → gx<1일 때 .8×gx, 결과<.01이면 queue jitter 없이 skip → 기존 queue RNG/우선순위 → render backend. 기존 dispatch/queue/RNG/start backend/delivery readiness 메서드 5개는 이번 사전 WORK 백업과 byte 동일. |
| 미완 | 실제 source clock/hurtE/fieldmob/poison/projectile delivery/renderer/sample loader 미연결. 실제 발사·실제 Main 실행·가청·최신 전체 게임 완료 아님. R/main/served/이미지·음원·import/save/UI 변경0. |

## 새 영향 검수

| 검사 | 결과와 한계 |
|---|---|
| 첫 시도 | 격리 fixture header가 source_state 선언을 빠뜨려 Main fragment parse/의존 compile 실패. 완결 functional 결과 없음. own exec session을 SIGINT로 종료(exit130). 이 최초 실패 로그는 보존한다. |
| 수리 | 제품 코드 수정0. fixture main_fragment.gd의 누락 변수 선언 1개만 추가. 사전 copy와 전후 쓰기시각 별도 기록. |
| 수리 후 첫 완료 | Godot 4.7.2 새 16개 검사 PASS / exit0 / stdout·Godot log ERROR/WARN/leak0. 이전 성공 suite 재연0. 전체 처음부터 clean으로 표시하지 않는다. |
| 실행 내용 | 실제 신규 globals 원코드 copy, 변경된 Services/Main 메서드 정확 추출. boot전 NR/명시boot1회/중복boot거절/currentgetter→실 queue 소비/다른 caller거절/owner철회·context손실 NR/자동재초기화0/미로드 상태 분리/projectile NR 유지. |
| 격리 경계 | Services 실제 _context_error/전체 configure tree·OPT/audio backend·actor/World RNG/Resources는 fixture 대역. 신규 service constructor 호출 위치는 코드로 연결했으나 실제 Main scene 실행 증거는 없다. |
| fresh current probe | gx .5와0은 fixture 내부 field 주입으로 fresh getter/기존 skip 소비를 검수한 값이다. 원 실제 runtime에서의 관측이나 프로덕션 setter를 뜻하지 않는다. caller RNG/원8stream body/full audio 검사를 재실행하지 않았다. |
| 사전 보존 | 최초 I/R 10경로의 INDEX·WORK·UNTRACKED 별도 metadata, realpath/exists/nonlink 및 개별 WORK/HEAD copy 시작·종료시각을 첫 code 전 기록했다. 코드 후 docs 전체 검색으로 관련 5문서가 더 발견되어, 그 문서들의 사전 보존·scope extension manifest를 해당 문서 쓰기 전에 추가했다. 최종 정확15경로이며 추가5 보존을 첫 code 전 기록이라고 소급하지 않는다. 각 code/doc 쓰기시각을 기록했다. 이전 단위 시각 부족을 소급 보충하지 않았다. |
| 사용량 | 시작 계정 공유 주간 누적38%. 일간 소비는 날짜 최초 관측 부재로 미상. 종료값은 별도 receipt. |
