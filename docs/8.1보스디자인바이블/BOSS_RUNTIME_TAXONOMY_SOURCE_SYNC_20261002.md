# BOSS RUNTIME TAXONOMY SOURCE SYNC — 2026-10-02

현행 source 선언·매핑 분모의 정본 문서 동기화다. 생산 코드 수정0, 보스 이름·배치·설계19 정책·전투 수치 변경0이며 정적 관찰과 실게임 인수를 구분한다. 기존5 정본의 승인12접점만 교정하고 매핑 부록을 추가했다.

## 분모와 예약 계약

| 항목 | 현행 source/매핑 사실 | 한계 |
|---|---|---|
| 설계 canonical | 19종 LOCK 유지 | 원설계19 목록 독립 재검증0 |
| runtime placement | HELL_BOSSES 35배치(si0~34), 7행 4/6/4/7/5/6/3 | 새 종류/이름/배치 채택 아님 |
| distinct display strings | 34개; 다크드루이드 si0/si3 중복 | 설계 종 수와 다름 |
| 매핑 identity/alias-mapped | 19행 | 명칭 문자열 literal subset 주장이 아님 |
| 매핑 runtime-only 표기 | 15행: si4/5/8/10/12/14/15/17/19/21/23/26/27/28/32 | 옛14는 si4 벌레 수호자 누락; 로어 채택·완료 미확정 |
| si0 특별 행 | 별도1행 | 19+15+1=35는 직접 표 분류; 35−19 추론 아님 |
| move definitions | BOSS_MOVES 59개 고유 ID | 원배열/idx/보호 규칙 불변 |
| eligible ID universe | 전역 cageTrap 예약 제외 기준58개 | 모든 보스가58개를 모두 실행했다는 판정 아님 |
| reserved definition | cageTrap.idx41 유지 | 모든35 Set 제외, score−1, 강제 case recover/25f; 새 실행 검사0 |
| si32~34 | 최종 보강 후 명시적58 ID Set | 초기 미정의/null·옛49 주석과 구분; phase/range/CD/score 조건 별도 |

identity/alias 대응에는 si2 숲의 사냥꾼↔지옥기형, si3 로어 숲의 기생수↔현재 다크드루이드가 포함된다. 설계19/배치35/표시명34를 하나의 보스 종류 수로 합치지 않는다. [매핑 §6의 상세 표](../4.1맵디자인+설정/BOSS_CANONICAL_MAPPING.md#6-2026-10-02--보스-source-taxonomy-동기화)를 따른다.

## source 관찰과 공식 완료 시각

| 근거 | game.html | game-easy-test.html |
|---|---|---|
| HELL_BOSSES | 15868–15876 | 14985–14993 |
| BOSS_MOVES | 9497–9557 | 8948–9008 |
| MOVESET 정의·최종 루프 | 9637–9688 | 9088–9139 |
| cageTrap score | 36339 | 35145 |
| cageTrap forced case | 36706–36709 | 35511–35514 |

양판 위5구간은 각각 byte 동일하다. main SHA-256 `34ba2b742523850bda8b6f204f86d216b74ce3264698277f6e6c728f9c75bdf7`; easy SHA-256 `24f820a162d8ef545caf910116119cb09db6980c0f9508d48867eff5dc7d8adb`. 이번 파일 read 시각은 2026-10-02T09:55:17.958Z UTC이며 런타임 실행 시각을 뜻하지 않는다.

| 공식 native 근거 | UTC timestamp / UUID |
|---|---|
| TASK 수신 | 2026-10-02T05:54:01.361Z / 0ae369f2-2df5-443b-80b8-69c2ec841ee7 |
| TASK 읽기 성공 | 2026-10-02T05:54:04.671Z / db72df69-b32f-4ca8-bb84-914153238bb5 |
| 공식 end_turn | 2026-10-02T05:58:48.391Z / cb7c1847-d8f0-4337-899c-b8d6e1290017 |

감독 최신 review는 source mapping만 인수하고 원설계19 독립 검증·production/runtime 인수를 구분한다. 원팀 result/evidence의 부정확한 시각·옛 수량·소스변화 추정은 원문 그대로 보존한다. 공식 완료시각과 이번 source read 시각을 혼합하거나 원팀 자체 시각을 새 확정시각으로 사용하지 않는다.

## 승인된 정본 교정

| 정본 | 원문 행 접점 | 교정 범위 |
|---|---|---|
| [BOSS_CANONICAL_MAPPING](../4.1맵디자인+설정/BOSS_CANONICAL_MAPPING.md) | 19/20/27/69/77 | 35배치/34표시명, alias19+runtime-only15+si0별도1, 59정의/58허용 Set + 현행 source 부록 |
| [BOSS_BATTLE_SETTINGS](BOSS_BATTLE_SETTINGS.md) | 191/204/206 | 49/null 설명 → 정의59/예약제외58/최종 명시적 Set |
| [WORLD_STRUCTURE_SSOT](../4.1맵디자인+설정/WORLD_STRUCTURE_SSOT.md) | 225 | runtime-only14→15; 미결 로어 부여 상태 유지 |
| [MAP_DESIGN_CLOSURE](../4.1맵디자인+설정/MAP_DESIGN_CLOSURE.md) | 75/81 | runtime-only14→15; 설계/우선순위 미결 유지 |
| [_MAP_SSOT_INDEX](../4.1맵디자인+설정/_MAP_SSOT_INDEX.md) | 288 | runtime-only14→15; 기존 outer/map 예외 문구 유지 |

변경 전 백업과 제공 HEAD 시점 원문 bytes가 동일함을 확인했다. 승인12 old/new를 역치환하면 기존5 원문을 byte100% 복원하며, 매핑 부록 밖 bytes와 모든 기존 개행을 유지한다. 보호2_3/LOCK 정책·원팀 raw2/TASK·root CHANGELOG/CONTINUOUS-INTEGRATION·SUPERVISOR 수정0. 정적 source 관찰=true, docs 동기화=true, 생산 패치=false, runtimeAccepted=false다.

Unity edition 설계49, 2026-08-16 source snapshot57, 2026-03-27 sound mapping56, 설계/voice19와 서사·마케팅35/35+는 당시 기록/분모로 보존한다. 매핑 구판 si0 흑요염/si3 숲의 기생수 및 예전 행 위치는 2026-08-23 이력이며 상단 다크드루이드 확정 계약이 현행이다. rootCI 초기21의14와15 SI열거 충돌은 당시 correction pending 기록으로 유지한다. 코드를 고치거나 역사 문서를 현재 선언 수로 일괄 치환하지 않았다.

## 증거와 HOLD

정적 source 영수증 `tmp/mac-migration-runtime/continued-review-20261002/boss-runtime-taxonomy-static/2026-10-02T09-34-21.501Z-c9a11d6d-16ed-4649-b2c4-ede31e4c6058/source-taxonomy.json`, SHA-256 `1f333aa6664e3e5cb99f16e74b7400c4eac6e764bc721e76195316c4dd758afb`. 승인 전 전체docs 검색183행/35문서와 행별 분류·정확 old/new의 조사영수증은 같은 폴더 `completion-final.json`, SHA-256 `43464cc08513dacee7569410967757d2f0b4a60f55627d0e0cc9b50f8c49abcc`다. 적용 후 전수검색·6문서 SHA·12접점 역치환·원자료/보호/source12 pin 보존은 동일 ignored 폴더 `docs-sync-completion.json`에 기록한다.

HOLD: 원설계19 독립 목록/정체성 검증, 로어 보강 채택, 모든58의 실전투·59case·전체 AI/update, native/game/DOM/audio/GL/visible pixels, geometry/art/placement 및 camera/map QA. 이번 source·원팀 검사 실행0, visual/audio PASS0이다. 기존 whole-map RETOUCH와 과거 테스트 판정은 유지한다.
