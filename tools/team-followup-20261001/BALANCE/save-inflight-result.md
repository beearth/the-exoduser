# 진행중 저장의 debounce 요청 유실 — 미적용 후보

## 수신·실제 작업
- 수신/첫Read/receipt 선기록 2026-10-01T16:09:12Z. AGENTS, BALANCE_ECONOMY_TEAM_MASTER, 전용task, 기존 AI persistence29검사/하니스와 현재 강화·저장 구역을 읽었다. 동일 prefix는 task만 존재, 중복 후보 없음.
- 첫 코드 Edit/실제검사명령 16:10:29Z. 원본 함수별 before.json 보존 후 구역SHA를 고정했다. 기존29검사 파일/공용test/생산은 읽기만 했다.
- 최종 검수 16:11:53Z: `node --test tools/team-followup-20261001/BALANCE/save-inflight.test.mjs` **29PASS / 0FAIL**. 16개 before/after 전송 비교행 + 중복/실패/전환/force/override 경계. 초기 force fixture에서 이미500ms를 전진한 뒤4999ms를 더하는 잘못된 기대를4499ms로 교정했으며 생산오류가 아니다.

## 실제 손실 재현
본편/easy 각각 기본DB 및 로컬fetch 분기의 전체 dbSave를 실행했다. 초기 저장 fixture 성공 뒤 첫 검수전송의 **dispatch 시점 JSON bytes를 복제해 sink hold**, AI 강화→500ms timer→첫전송완료→500ms를 진행했다. live INV 참조를 첫전송완료 때 읽는 가짜sink로 손실을 숨기지 않았다.

| 입력/순서 | 원결과 | 후보결과 |
|---|---|---|
| 희귀+0/악의15000/목표+1/성공RNG0, 첫전송hold, AI후500ms | dbSave가 _saving guard로return, 추가전송0 | scoped pending1, 추가전송은 아직0 |
| 첫전송완료후499ms | 원snapshot +0 | 아직원snapshot +0 |
| 완료후500ms·두번째sink완료·실제dbRestore | 전송1회, +0복원 | 전송2회, +1/악의0복원 |
| 동일 실패RNG.999999·악의15000 차감 | 옛snapshot 복원 | 실패+0/악의0 snapshot 보존 |
| 여러 now호출/debounce만료/진행중추가요청 | 유실가능 | 최신상태용 pending1개로 병합, 완료후 추가전송1회 |

첫dispatch의 직렬화 snapshot은 +0이고 실제강화 메모리는 +1이었다. `_saving=false` 이후 `_pendingForce`만 확인하는 원본에는 이번 now요청 재시도가 없어 **아이템 snapshot 유실이 실제 소스 격리실행으로 입증**됐다. 실패시 자원복원 차이는 프레임 악의observer를 실행하지 않은 이 경계의 결과이며, 실제게임에서 공유악의도 반드시 유실한다는 뜻이 아니다. 이전검수처럼 shared악의가 따로 저장되더라도 아이템+1 유실 반례는 남는다.

## 최소 후보·실행 연결
소유 `save-inflight-candidate.mjs`의 실제 함수텍스트를 VM에 연결하고 `save-inflight-candidate.diff`와 문자열 동등한지 메모리 unified-diff 적용으로 검수했다. 두판본 각각 다음 구역만 후보로 바꾼다:
1. dbSaveNow의500ms closure에 charId/charIdx/P객체/dbSave함수 identity를 캡처한다. DB미준비/전환은 폐기. 진행중이면 dbSaveNow.pending에 요청1개만 보관한다.
2. `_drainPendingSaveNow()`는 pending을 **먼저 소비/삭제**, 현재identity와 DB준비를 확인하고 dbSaveNow로500ms 재예약한다. 직접 강제전송하지 않는다.
3. 기본DB/로컬/standalone의 `_saving=false` 바로 다음에 drain1회를 넣는다. 로컬/standalone은 기존 finally에서 실행. demo500/demo의 동기override 본문은 그대로다.

aiEnhance/AI콜백 used>0 저장예약·비용·성공효과·RNG·dbRestore·dbSaveForce 본문은 변경0. 새 스냅샷에는 **완료 후 최신 상태**를 읽으며 기대oracle을 snapshot으로 반환하지 않는다. dbSaveNow 재예약은 원래500ms 계약이며 강제저장의5초 규칙을 바꾸지 않는다.

## 경계 검수와 한계
| 경계 | 실제 판정 |
|---|---|
| 첫전송실패 및 재시도실패(기본DB/로컬json ok=false) | 요청당 추가전송1회 뒤 pending=null; 6000ms 추가전진에도 자체반복0 |
| charId/charIdx/P객체/dbSave override 변경 또는 DB미준비 | timer 이전/이미pending 각각검수. 구캐릭터요청에서 신캐릭터 재전송0 |
| dbSaveForce 마지막성공후4999/5000ms | 원본force함수 그대로, 5초이전전송0/정확5초전송1 |
| force진행중 pendingForce | 원본의완료시5초검사·pending해제 그대로. 성공완료직후 별도force재전송0 |
| demo500/demo/standalone | 정상동기저장 snapshot +1, demo본문 불변, 불필요네트워크0 |
| 무시도/악의0/DB미준비 now | 새전송0 |
| diff | 양쪽4hunk를 현재원문에 메모리로 적용해 실행한 후보텍스트와 완전동일 |

보장범위는 **now timer가 진행중저장 때문에 거절된 요청의 유한재예약**이다. 모든 dbSave 직접호출의dirty queue나 일반전송 재시도 정책이 아니다. 첫sink가 영원히완료되지 않으면 pending도 드레인되지 않는다. 첫완료후500ms/재전송완료 이전 중단은 여전히 보장하지 않는다. 저장sink가실패하면 마지막snapshot이남을 수 있으며 무한자동재시도를 새로 만들지 않았다.

캐릭터 전환은 캡처identity 불일치로 관측 가능한 전환을 거부한다. 같은identity로 변경후원복까지 발생한 이력을 감지하는 epoch계약은 추가하지 않았다. 옛전송이 신캐릭터의 전역 _lastSaveTime/_saving에 미치는 기존 동작 전체를 수정하지 않는다. 로컬slot은 closure에고정되고 override함수변경으로 scope를 구분한다. force진행중요청의 기존5초검사로 재전송이안되는 별도잔여도 이번now 후보가 해결했다고 주장하지 않는다.

메모리 DOM/시계, fake Supabase query/fetch/localStorage/shared sink 사용. 실제 전체 dbSave/dbRestore/AI호출을 실행하되 관련없는 atlas/skill hooks는 기존하니스 no-op. dispatch시점JSON복제는 네트워크에보낼 snapshot 경계를 모델링하며 실제 SDK 전송성능/서버내구성/atomicity 검수는 아니다. demo500 별도선택복원·demo shared max정책은 이전한계 그대로다. 사용자게임tab1573846373·API·실제저장 접근0.

## 해시·docs·인계
- 결과·receipt 완료 UTC: 2026-10-01T16:12:50Z.
- before.json SHA-256: `ae7000ff2020a5eac60ff8f4a0cd2310fd11c2b16aa2ee50fac78ffc2e8ed87a`
- candidate.mjs SHA-256: `96750107f0da4dceb756bbe3a14017d1e58e29015f91fb76cf91bea4301bfb5b`
- candidate.diff SHA-256: `a6708fbcbf440be0ad8893d9651c35d31347b2012785797aa3b7b40382f7ab73`
- 함수구역 JSON문자열SHA는 before.json/evidence.json에 보존, 검사전후불변. 전체파일SHA를고정하지않아 root의다른구역순차수정과구분한다.
- docs 전체관련검색 save-inflight-doc-search.txt. 공유docs수정금지로 소유결과에 제안만기록: 저장타이밍표에 now진행중pending→완료후500ms 재예약/캐릭터범위/실패유한성·force5초불변을 인수단계와함께추가.
- root 적용전 원함수SHA/diff 재대조·기존저장통합회귀·실제사용분기 인수필요. 생산/공용game/easy/index/server/test/docs/Git/queue/브라우저/게임/설치/빌드/새세션/에이전트 변경/실행0. 기존패링FAIL 재조사0. 이번한건후추가범위착수0.
