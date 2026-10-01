# 정상 전투 독립 감사 결과

## 수신·실제 착수·완료
- 수신/첫 Read: 2026-10-01T14:48:27Z. AGENTS, 총괄 §18.40, 전용 task, QA 문서, 최신 인계 및 원자료를 읽었다. 이전 support33과 별도이며 전용 task 외 동일 완료 결과가 없어 착수했다.
- 실제 검수: `node tools/team-followup-20261001/BUILD/normal-combat-audit-check.mjs`. 2026-10-01T14:49:30.180Z~14:49:30.261Z, 21PASS/0FAIL. 그중 반례 검사의 PASS는 분석기 결함 재현 성공이며 성능 인수 PASS가 아니다.
- 판정: 현재 원자료의 수치·기록 일관성 대조 PASS. 임의 입력에 대한 분석기 자격 판정 RETOUCH: 12개 이상 입력을 eligible=true로 잘못 허용했다. 실제 원자료에는 아래 주입 이상이 없다.
- 분석기는 실제 소스 본문을 VM에서 실행하되 fs를 메모리 캡처로 대체했다. 공유 analysis.json을 덮어쓰는 원 명령은 실행하지 않았다. 검수 전후 5개 입력 SHA 동일. 원실패/수정은 원 support33 S1/S2 인계와 구분하며 이번에는 분석기 수정0이다.

## 입력 SHA-256
| 입력 | SHA-256 |
|---|---|
| normal-combat/raw.json | 9df8cd85a5634299fa13410475435fcc161d3cffd7dd261610b988edbf6e6413 |
| normal-combat/analysis.json | 8a0fe3b0c3593f74f6a35fd4a76c311afa78ee81e951d882067f804cc39b8e82 |
| normal-combat/preflight.json | 32260488a467b5ba7f6e0ca8427d9ebe2a93b1070e436eba5036ee0f00ac1ecc |
| QA/analyze-support-normal.mjs | 78fa5e6b81c66b6d629df1a4ada39f0cf7926996caa7bb18c7ff373658df10f8 |
| SUPPORT-normal-combat.md | 0d8de6c9d91dbba27ff6049e55a2bf6cb84505558f68fae03c4627f042b7f3e0 |

위 JSON은 outputs/team-review-20261001/support 아래, 분석기는 tools/team-followup-20261001 아래, 문서는 docs/0마스터플랜/mac-resume-20261001/vscode-dispatch 아래다. 게임 SHA는 preflight 기록 8ebc3b7b52a651c1a3bc5e8c285b00d186c6dacc18429ada7499781acc72b0b9이며 이번에 게임을 실행/HTTP 확인하지 않았다. 원격 d128e3c89e1e9e155ea8606cf1283b02df82c3fa는 사용자 인계값이며 Git으로 재확인하지 않았다.

## 독립 수치 대조
최근접 순위는 오름차순 표본의 ceil(n*p)번째 값이다. 긴 구간은 엄격한 >50ms/>100ms로 집계했다. 아래 반올림 표시의 원 정밀값은 evidence에 보존했다.

| 구간/지표 | n | p95 ms | p99 ms | 최대 ms | >50 / >100 |
|---|---:|---:|---:|---:|---:|
| 전체 rAF timestamp 간격 | 692 | 42.5 | 50.2 | 133.4 | 11 / 2 |
| 전체 snapshot wall 간격 | 692 | 45.5 | 49.3 | 155.6 | 5 / 3 |
| 전체 draw 시작 간격 | 692 | 45.4 | 49.7 | 132.8 | 6 / 3 |
| 전체 synchronousDrawCPU | 693 | 1.8 | 6.0 | 129.8 | 3 / 2 |
| 첫 입력~첫 처치 관측+2초 rAF | 52 | 42.5 | 133.4 | 133.4 | 1 / 1 |
| 동일 구간 synchronousDrawCPU | 53 | 6.7 | 129.8 | 129.8 | 1 / 1 |
| 최장 밀집 rAF | 313 | 50.0 | 50.2 | 50.7 | 8 / 0 |
| 최장 밀집 synchronousDrawCPU | 313 | 0.9 | 2.9 | 11.2 | 0 / 0 |

전체 25019.800000071526ms, 최장 밀집 11439.799999952316ms. 밀집은 alive(enemies)>=30이며 화면 내 적 수가 아니다. raw rows/draws 각694, inputs796, 입력 이후 선택 rows693이므로 간격692이다. 최장 밀집의 draw 시작 간격312와 rAF313 차이는 draw 구간 완전 포함 경계이며 dropped 기록이 아니다. 전체/첫 처치/최장 밀집의 네 분포 모두 저장 analysis와 정확히 일치했다.

첫 입력 at=45217.59999990463, 첫 처치 관측 at=45293.699999928474, 차이76.10000002384186ms. 해당 row의 rAF timestamp=45276.3은 snapshot at와 다르다. 이전 row kills0에서 첫 관측 kills2 batch로 증가했으며 총15 처치와 대조했다. 이는 rAF 관측 지연이지 두 적의 개별 사망 시각 또는 인과관계가 아니다.

현재 표본은 finite/단조 시각, focus=true/hidden=false/on=true/paused=false/hp>0 조건을 만족했다. 입력 trusted, initial/final 옵션 동일, events 빈 배열, dropped=0, stopped=true, cleanupErrors 빈 배열, restored.draw/listeners=true를 대조했다. 메타데이터상 누락0이지 관측되지 않은 모든 이벤트의 절대 완전성 증명은 아니다. 옵션은 시작/끝과 이벤트 기록 근거이며 row마다 옵션 스냅샷이 없어 기록 밖 순간 변경까지 증명하지 않는다.

## 실제 분석기 반례
각 행은 원 raw의 메모리 복제에 아래 한 변화만 적용했다. 기대는 제외 또는 명시 UNKNOWN, 실제는 모두 eligible=true/exclusions=[]였다. 정확한 출력 분포와 입력별 이름은 evidence.counterexamples에 보존했다.

| 입력 변경 | 문제 |
|---|---|
| rows=[] | 관측 표본 없이 자격 확정 |
| draws=[] | draw 측정 없이 자격 확정 |
| inputs=[] | 실제 입력 증거 없이 자격 확정 |
| stopped=false | 미종료 캡처 허용 |
| firstKill.at를 firstInput 이전으로 변경 | 음의 첫 처치 지연 허용 |
| firstKill.kills=999 | 실제 row/batch 불일치 허용 |
| rows[5].timestamp=null | 비정상 시각을 수치 계산에 포함 |
| rows[5].timestamp=앞 row timestamp-10 | 역행 간격 허용 |
| draws[5].end=draws[5].at-1 | 음의 draw duration 허용 |
| inputs[0].trusted=false | 신뢰 입력 계약 미충족을 자격과 분리하지 않음 |
| end.focus=false | 종료 상태와 rows의 불일치 누락 |
| dropped 필드 삭제 | 누락과 실제0을 혼동 |

기존 row.focus=false, finalOptions 변경, restored.draw=false, dropped=1은 정상적으로 제외했다. 따라서 기존 배제 분기는 동작하나 필수 schema/상호참조/종료 경계가 부족하다.

최소 수정 권고: 분석 전 필수 own 필드·배열·엄격한 boolean·finite 시각/비음수 계수를 검사하고 충분한 표본을 요구한다. 시각 단조/구간/end>=at를 검증하며 firstInput/firstKill을 실제 inputs/rows와 연결하고 batch/chronology를 대조한다. stopped=true·dropped 명시0·종료 focus/상태·cleanup 계약을 검증한다. 결측은0으로 간주하지 말고 UNKNOWN/제외를 반환한다. 현재 캡처 수치를 고치거나 원자료를 수정할 필요는 없다. root가 분석기 보강 여부를 인수한다.

## 한계·인계
- synchronousDrawCPU는 draw wrapper의 동기 경과시간이며 CPU 계산 전용 또는 GPU 완료시간이 아니다. CPU/GPU 원인귀속은 하지 않았다.
- 기존 Chrome 프로필/캐시 UNKNOWN/관측 오버헤드 미측정/GPU 타이밍 미측정 유지. A/B 비교·개선율·실전 QA 전체 완료를 주장하지 않는다.
- root profiler 진단과 별개로 작은 JSON 검수만 수행했다. 새 게임/브라우저/서버/빌드/Git/queue/권한변경/EPERM 재시도/새 세션/하위 에이전트0. 입력/타팀/공유파일 쓰기0. root 자동메시지0.
- 관련 docs 검색은 normal-combat-audit-docs.txt에 기록했다. 공유 문서 수정은 소유 제한상 하지 않았다. root에 이 결과와 evidence/검사 후보를 한 번 제출한다.
