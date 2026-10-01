# 정상 최초 currentSrc 확정 경계 수정 — BALANCE

## 수신·실제 작업
- 수신/첫 Read: 2026-10-01T15:00:55Z. 전용 task, 기존후보/12검사, BUILD 독립15 결과·실행코드/currentSrc 반례, 총괄18.41, 실제 new Image 로더와 본편 통합을 읽었다. 동일 경계 수정의 중복 제출 없음.
- 첫 Edit/보존: 15:02:08Z. before 후보·하니스·검사로그 보존. 실제 수정/검사 완료: 15:02:43Z. before/after 직접 실행 대조·최종 해시/완료: 15:02:57Z. 시각 UTC.
- root 원격 백업 SHA 3d5badddad5fa389ebb3c767b890a66f72412aba는 사용자 전달 근거이며 이번 Git 조회/쓰기0.

## 최소 변경 계약
| 경계 | 결과 |
|---|---|
| 같은객체·캡처한 절대 src 불변·currentSrc 최초 빈값→그 src·complete·srcset/sizes 처음부터 빈값이며 불변 | 정상 준비 허용 |
| 확정 currentSrc 변경·다른주소/선택주소·실제 src 변경·객체교체 | stale, 가공0 |
| srcset/sizes 변경 또는 처음부터 비어있지 않은 선택속성 | 최초확정 예외 거부 |
| epoch/G.on/killed/bootActive 취소 | cancelled 우선, 가공0 |
| 원함수/WeakMap/RNG/512²/250ms | 변경0; 출력명목 1,048,576바이트 |

캡처 문자열과 정확히 같아야 하며 URL 정규화·임의 다른 URL 허용은 없다. 절대주소는 scheme 접두사를 확인한다. 실제 로더 game.html:17973은 new Image에 src만 설정한다. HTMLImageElement의 src는 절대주소이고 기본 srcset/sizes는 빈 문자열이다. 기존 mock은 상대 src와 DOM 속성 undefined라 실제 DOM과 다르다. 기존 unchanged-currentSrc 경로는 보존하되, DOM 속성 증거 없는 mock의 빈값→주소 확정은 허용하지 않는다. 추가 fixture에는 절대 src/빈 srcset/sizes를 명시했다. 폴링 사이 변경 후 원복은 관측 불가능하며 완전한 변경 이력 검증이라고 주장하지 않는다.

## 실제 검사
- `node --test tools/team-followup-20261001/BALANCE/physical-prewarm.test.mjs`: **17 PASS / 0 FAIL**. 기존12 그룹을 변경 없이 유지하고 추가5 그룹에서 정상 지연로드, 다른/악성 선택URL, src 변경, 상대주소/DOM속성 부재, 객체교체, srcset/sizes, epoch/취소, 완료전확정, 이미확정된주소 변경을 검수했다.
- 동일 입력을 before/after 후보로 직접 실행: before stale/read0 → after prepared/read1, 양쪽 listener/timer0. 이후 같은 원WeakMap 객체 재사용·추가가공0. 로그 physical-prewarm-load-comparison.txt.
- 기존 로그와 before 로그 바이트 동일성 PASS. before 후보 SHA는 BUILD가 읽은 후보 SHA와 같다.
- docs 전체 관련키워드 검색은 physical-prewarm-load-doc-search.txt에 보존. 공유 docs 쓰기 금지이므로 이 소유 결과에 변경 계약을 기록하고 root에 전달한다.
- 하니스는 fake clock/synthetic Canvas를 사용하지만 실제 game 원 helper/tint를 추출하고 수정한 소유 후보를 직접 실행한다. 기대 oracle을 후보 대신 실행하지 않았다. 실제 브라우저 픽셀·부트·실전성능은 미검수.

## SHA-256 및 인계
| 파일 | SHA-256 |
|---|---|
| physical-prewarm-before.js | 34524ef90d3549aa60448b2bee0d6a25b04af71e43f20be0823ded8723e5f6ed |
| physical-prewarm-candidate.js | e80f74f25fcc0ffa2144897ba4290c0b383e46c570f9a7eb4941ef90f29101b0 |
| physical-prewarm.test.mjs | 98a8618182f1929be512c56eba03523e68af36485f9dd36d046af8fd52475a5f |
| game.html 읽기전용 | 7c681cfaa592778ab6d7cc5b88c46906b332e4395bb60fda1b837d09ed6ee1de |
| test/physicalImpactPrewarm.test.mjs 읽기전용 | f8bc0b5073a3feb838680017fc1ecd56df707cc1666ab0ba0f6440b369ccc3c2 |

후보 최종해시 재대조 불변. 본편/공유test 해시는 BUILD 인수본과 일치한다. root는 후보의 source 캡처/stale 판정 구역만 본편 함수에 적용하고 추가회귀를 공유 test로 인수한다. 부트 위치는 기존 통합 위치 그대로다. 원 lazy 폴백·예외 정리·공유 Promise 불변. 250ms는 협력예산이며 동기가공 시작 후 선점 불가, hard timeout이 아니다.
남은 게이트는 root 실제 정상 최초로드/캐시동일성·원색/알파·부트시간·한 번의 실전회귀 측정이다. 생산/타팀/공유파일 수정0, 게임/브라우저/서버/대형빌드/Git/queue/권한/새세션/에이전트0. 추가 범위 착수0.
