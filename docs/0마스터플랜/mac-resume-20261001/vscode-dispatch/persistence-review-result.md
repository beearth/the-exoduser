# QA-20261002-PERSISTENCE-REVIEW — 결과 (한국어)

- 담당 QA / 기존 세션 `88c3f903…`. HEAD `7cb8485d`.
- 수신 16:09:32Z / 첫 Read 16:10Z / Edit 착수 16:14Z / 완료 16:14Z (UTC). receipt: `persistence-review-receipt.json`.
- 범위: `persistence-review-task.md` 한 건만. 게임/성능/빌드 미실행. **실제 브라우저·사용자 세이브 미사용**(메모리/소유 임시객체만).
- 대상: root 적용분 — 양쪽 `_doAiEnhance` 의 `const res=aiEnhance(...)` 직후 `if(res.used>0)dbSaveNow();`
  (game.html L26921-26922 / game-easy-test.html L25796-25797). **현재 = 적용됨(patched).**

## 산출물 (QA 소유)
- 소형 독립 회귀: `tools/team-followup-20261001/QA/persistence-review-regression.mjs` → **10 PASS / 0 FAIL, exit 0**
  - BALANCE 기존 29검사 복제 아님. **current callback(실제 `aiEnhance`+`dbSaveNow`/`dbSaveForce`) 원문 추출** + **hold 가능한 전송 sink**로 저장진행중·창닫기를 결정적으로 재현.

## 함수별 before/SHA 고정 (root 순차 수정용 — game·easy 동일)
| 함수 | SHA-256(앞16) |
|---|---|
| enhRate | `be2ef762d3119ae8` |
| _malCost | `b8a3fc0bf01787aa` |
| enhCostRaw | `861e2d4c7c9062ea` |
| enhCost | `fd942db7d954f6f7` |
| _itemEconomyRarity | `13ebcae9484f58bc` |
| aiEnhance | `abd6138c157297be` |
| dbSaveNow | `f31e1ecf47f3df72` |
| dbSaveForce | `9e6f375e6a285652` |
| 호출부 `const res…if(res.used>0)dbSaveNow();` | `5a1ccb0b8ec04fa5` |

## 검수 결과 (판정표)
| # | 경계 | 결과 |
|---|---|---|
| P1 | 적용 확인: 양쪽 호출부 존재·동일(current=patched) | PASS |
| P2 | 관련 함수 양쪽 동일(한 검수로 커버) | PASS |
| P3 | **성공**(used>0) → 500ms 후 저장 1회·공유악의(G.mats)+enh persist | PASS |
| P4 | **실패**(ok:false, used>0) → 저장 트리거(mats/enh 변동 반영) | PASS |
| P5 | **무시도**(used=0/undefined: 이미목표·악의부족 조기 return) → 저장 없음 | PASS |
| P6 | **중복 500ms**(2회 연속) → 디바운스 병합 → 전송 1회(과저장 없음) | PASS |
| P7 | **창닫기**(500ms 이전 종료) → 디바운스 미발화 → 저장 안 됨 | PASS (해결 아님) |
| P8 | **저장진행중**(_saving) → 디바운스 dbSave no-op 드롭, dbSaveNow는 _pendingForce 미설정 | PASS (해결 아님) |
| P9 | **5저장분기·공유 _saveDebounce**: force 대기 중 dbSaveNow가 대체 → 데이터는 저장(손실 아님) | PASS |
| P10 | **원본 대비 악화 없음**: 원본은 500ms 시점 미전송(autosave 대기), current는 전송 | PASS |

## 판정 요약
- **BALANCE before.json의 +1→+0 손실**(강화 후 저장 트리거 없음 → autosave/beforeunload 전 종료 시 enh·공유악의 유실)에 대해, `if(res.used>0)dbSaveNow()`는 **손실 창을 autosave(≤10s)에서 500ms 디바운스로 축소**한다. 성공·실패(소비>0) 모두 저장을 트리거하고, **무시도(used=0)는 저장하지 않아** 과저장도 없다. 공유악의(G.mats)와 item.enh 모두 dbSave 실행 시 persist됨을 확인.
- **원본 대비 악화 없음**: 새 손실·중복·과저장 경로를 추가하지 않는다. 디바운스 병합으로 연속 강화도 1회 저장.

## 미해결(“해결됐다”고 하지 않음)
1. **500ms 이전 종료(창닫기)**: 디바운스 미발화 → 강화분 유실 가능. 이 변경은 창을 줄일 뿐 제거하지 못한다(P7).
2. **저장진행중(_saving) 유실**: `dbSaveNow`→`dbSave`는 `_saving`이면 no-op이고 `dbSaveNow`는 `_pendingForce`를 세우지 않아, in-flight 저장 중 발화한 강화분은 그 사이클에 유실될 수 있다(P8). 이는 기존 `dbSaveNow` 공통 한계이며 이번 변경이 새로 만든 결함은 아니다.
3. **5저장분기 공유 `_saveDebounce`**: 강화 시 대기 중 `dbSaveForce` 재시도가 취소되고 500ms 일반 `dbSave`로 대체된다. 데이터는 더 빨리 저장되나 force 의미(5초 간격 보장 재시도)는 소실 — persist 관점 악화는 아님(P9).

## 후속 인계 (root / BALANCE)
- root: 변경은 persist 손실 창을 줄이는 개선이며 원본 대비 악화 없음 → **그대로 유지 가능**. 생산 순차 반영은 root 소유.
- **busy(_saving) 재시도 후보는 BALANCE 별도 과제**(예: dbSaveNow 경로도 _pendingForce 설정, 또는 used>0에 dbSaveForce 사용). 본 검수 범위 밖으로 남긴다.
- 창닫기(≤500ms) 완전 해결은 beforeunload 동기 저장과의 연계 필요 — 별도 설계.

## 미실행 / 경계
- game.html·game-easy-test.html·index·server·공유 test·docs·타팀 파일(BALANCE/*, ITEM/*) 수정 0.
- 신규 측정·게임·성능·빌드 0. 사용자 게임 tab1573846373 입력/리로드/계측/닫기 0. 사용자 세이브 미접촉. Git/queue/새세션/에이전트 0.
- 최소 모델(가짜 클럭·hold sink) 기반 — 실제 Supabase/localStorage I/O·실브라우저 종료 타이밍은 검증 범위 밖.
