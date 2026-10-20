# DEMO11-06c — PC 복원 인터페이스와 loaded 시작

PC 보호 3종과 자원 writer를 연결했다. opt-in 실제 Main에서 저장→새 Main loaded 복원→PC applyStats→기존 stage-entry refill→loaded 시작·저장 허용을 검수한다. 기본 OFF 경로는 PC 회귀로 확인하며 새 UI/맵/전투 구현은 없다.

| 구현·근거 | 경계·판단 |
|---|---|
| 기준·의존 | 최신 fetch main `0138c5bb9188d27cee10cb1a901d075092ddb88f`(969c194e6 이상). 06b e8fd0a59를 이 main에 정상 merge해 `cadd5311772451fa08242f51e540b9c28a6fe2eb`로 일반 push·원격 일치(재검사72/0). 06c는 main에 이 커밋을 fast-forward merge한 지점. PC `a28117c1`은 main 조상이므로 별도 PC merge0 |
| 보호3종 | `demo_restore_flow.prepare`의 각 경계에서 PC `protected_qe(state,serialized)`·`protected_active_sync(state,tables)`·`protected_wing(state)` 관측 공급→기존 source `_handoff` 검증. before/after/허용 leaf 소유권 그대로, identity 관측 제조/보호 동작 복제0. 명시적 잘못된 callback·관측은 HOLD |
| 단일 resource writer | State load-only 직접 HP/ST/MP/cap/rate 대입·`_owned` 접근 삭제→PC `commit_native_restore_resources(main,{hp,mhp,st,mst,mp,mmp,stR,mpR})` 1회. 유한수 raw 값, clamp/보충0. 음수 cap도 source raw 단계에서는 거부하지 않고 후속 applyStats에서 파생값 계산. State/INV/globals/raw grit 설치는 기존 1회 admission·dict identity 보존 |
| 순서·시작 gate | PC refresh는 completed 초기화 dispatcher를 요구하므로 기존 pre-Tree 초기화를 loaded의 지급 없는 빈 actor에도 실제 완료. 그 뒤 loaded 설치→PC apply_stats→기존 stage-entry refill→나머지 Main boot 성공 뒤에만 State 봉인/G.on/actor·world 활성화 및 save/lifecycle 허용. 자원 receipt의87/42/31→applyStats.before 동일→최종 cap refill을 관측. 저장 자원을 무시한 fresh refill 성공으로 대체하지 않음 |
| fresh/loaded | loaded 신규15장비/10가방·새게임 스킬/슬롯·fresh 공유 지급0, 신규 intro는 dormant. XP/레벨·학습·숙련도·저장 슬롯·커스텀 장비·공유창고/mats 유지. PC 자원/보호·Player·World·HUD·전투 핵심·저장 형식은 수정0. 기존 initStage 미이식 상태리셋·다른 stage/atlas 확장은 구현하지 않음 |
| 원본 | game SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. G3618–3622 raw 복원, G3867–3879 보호 Q/RMB·활성 동기화, G3483–3490/G3513 wing, G62511 applyStats→G62517 initStage, G31567 HP/ST/MP/shield refill. PC 계약 문서의 이전 행 라벨과 달리 이번 근거는 현재 game 행으로 기록 |
| 공용 줄 범위(06b cadd5311 대비) | Main **225–229,237–244,271–278,391,406–416**(+33/−13): loaded 부팅·PC 호출·fresh 분기·최종 gate만. State **1549,1555,1563–1568,1584,1672–1678** 및 옛1574 직접 rate 대입 삭제(+16/−11): 임시 load writer 대체·시작 봉인만. 나머지 공용/PC owner/전투0줄 |

| 관련 검사(각1회) | 결과 |
|---|---:|
| 신규 실제 Main 저장·loaded 시작/저장·실패 차단 | 47/0 |
| 별도 Godot 프로세스 actual Main 재시작 | 6/0 |
| 기존 06b namespace lifecycle/실패 settlement·원본 표 대조 | 32/0 |
| 기존 PC protected handoff/source flow·raw resource 회귀(기본 OFF Main) | 4,830/0 |
| 기존 PC runtime refresh/source oracle 회귀(기본 OFF Main) | 290/0 (원본10사례) |

최종 합계 **5,205/0**, ERROR0. WARN5는 각 Main boot의 기존 Camera2D physics interpolation 경고다. 신규 기능·재시작·집중·두 PC 회귀는 각1회다.

기존 06b 테스트는 PC_INTERFACE_WAIT를 요구하던 과거 계약 대신 신규 connected 하니스를 상속하고 기존 namespace·집중 lifecycle 검사는 유지했다. 음수 cap 기대만 PC raw writer 계약으로 변경했으며 원본 수식/기대 상수 완화0. 신규 namespace는 EXODUSER-demo11-06c-Isolated-20261021, 기존은 각 파일 상수다. 결함 주입은 공유 writer lock·손상 player·손상 공유 JSON·PC applyStats 거부의4종과 pure 잘못된 보호 관측을 검수했다. 초기 연결 기능검사 실패0, Godot import0exit. 출력 파일과 요약만 읽고 큰 oracle JSON은 통째로 읽지 않았다.

PC writer 이후에는 기존 applyStats/initStage가 파생값과 자원을 변경하므로 최종 HP/ST/MP는 원본대로 cap까지 채운다. 손상/IO/관측/applyStats 실패는 시작/저장 차단; 새 씬에서 저장을 재시도하며 부분 실패를 fresh로 바꾸지 않는다. 공유 키+게임 전체 단일 원자성·전원 차단/fsync·Windows 실제 IO/PC 실플레이는 미확인이다. 저장 adapter 기존 보호 형식/키별 원자 rename 정책 유지, 실제 First 저장 폴더 접근0.

틱 경로 목록 생성 API는 수정 runtime 전체0건, 새 tick hook0. 성능 수치를 주장하지 않으며 Performance 지표/추가 벤치0. 이번 단위는 새 UI가 없어 화면 캡처 대상 없음. 관련 docs15·SAVE 추적·CHANGELOG 동기화. 원로그 `~/exoduser-wt/_out/demo11-06c/`, 매 실행 pgrep2이상30초 gate·override 종료0byte. R HEAD/branch/tracked INDEX/WORK 보존, 자기 branch 일반 push·remote SHA 일치·DONE 뒤 자기 worktree 제거.
