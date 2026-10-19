# 일반 적 el_mul 등록 11개 main 소스 동기화 — 2026-10-17


## 2026-10-17 el_mul 등록 11개 main 소스 통합

| 항목 | 계약과 범위 |
|---|---|
| 승인 commit/tree | d38d4e68ad14682dd2d82c50a041b4716875bc3b / 61ccd7de9df30eec6b6195a78b72f62ccdc1d597 |
| main 사전 조건 | c91e41749d698b2b0d40c4acd4b1898dd0a0c2af, expected_sha 일치, force=false 정상 FF |
| 등록 | 기존 10개 순서 후 el_mul, 실제 11개 / 미등록 14개 |
| 소유 계약 | Main mutable EL Dictionary 1개 + 현재 Script WeakRef 1개; typed el_mul(a,d) arity 2 |
| 승인 입력 | code 3 / docs 37, 총 40 paths |
| 이번 작성 | 통합 문서 신규 1개 + 본 문서 전체 원문 바이트 보존 append, 신규 blob 2개 |
| 최종 합집합 | code 3 / docs 38, 총 41 paths. 기존 39개 불변 + 본 문서 전체 prefix 보존 + 신규 문서 1개 |
| I 브랜치 | codex/mac-native-el-mul-main-20261017, origin/main 추적 |
| R 브랜치 | codex/mac-live-el-mul-main-20261017, origin/main 추적 |
| 통합 보존 브랜치 | codex/el-mul-main-source-integration-local-20261017 |
| 검증 | 새 소스 동기화 경계 static 1회 / runtime 0. 이전 검사 재실행 0 |
| 미인수 | typed consumer V11, World hook, 실행 게임·빌드·PC 배포·최신 화면 |

기존 검증은 분리된 이력이다. 최초 static 14/14; 최초 owner 23 case / 46 check 중 45 true / 1 false, whole=false 유지; 별도 숫자 진단 8 records / Variant 8 / typed 7; 승인 입력 보정 후 최초 미실행 경계 25 case / 74 true + setup 4 true; 등록 static 12/12. 이번 소스 통합에서 최초 실패를 전체 통과로 바꾸지 않는다.

I/R 첫 WORK·HEAD 백업과 PRE는 fetch 및 작성 전에 저장한다. R 실제 fetch/FF 직전 추가 WORK·HEAD 백업과 PRE를 저장한다. I 기존 60710e16fc8af90dcb4601ace9c67cad6fc6baf3 / 138c64305efac08d1d220c56a2abb43f69369311, remote D38/3357, main c91, R 기존 브랜치, W a3를 보존한다. 강제 갱신·reset·clean·일괄 stage를 사용하지 않는다.

이 절은 소스 통합 계약이다. 실제 게시·정렬 결과는 NORMAL-HURTE-EL-MUL-MAIN-SOURCE-SYNC-20261017의 final-graph.json, physical-match.json, static-check.json, receipt.json에 기록한다. 소스 일치는 실행 파일이나 인게임 화면의 최신 버전 확인을 뜻하지 않는다. 브라우저·게임 입력·서버·세이브·에셋·import/export 작업은 0이다.

사용량 시작 실제 누적 62%를 재사용하고 종료 실제 조회는 1회다. 공유 계정이며 일간 소비는 미상이다. 새 일일 20%를 배정하거나 작업 단독 소비로 해석하지 않는다.
