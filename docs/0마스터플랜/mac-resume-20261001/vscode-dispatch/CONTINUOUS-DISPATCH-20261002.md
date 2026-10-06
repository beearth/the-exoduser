# Mac 전문15팀 연속 후속 배정 — 2026-10-02

기록시각 2026-10-02T05:23:19.224897+00:00. 총괄 포함 Codex8 / Claude8를 유지한다. 이전15팀은 완료 제출했으며 이번 표는 새 작업의 전달/Read 상태다. 실제 실행은 Mac/local이고 PC 원격 연결 또는 Claude Remote Control 선택은 미확정이다.

생산 기준 `7e69495046323b3120578f67635c20feb48b2a4f`는 두 오류 수정과 docs 동기화가 원격 SHA까지 확인된 commit이다. 카드 plus 중복 차감은 양판 source2 GREEN/음성 대조2 RED, NW.js mats 오류는4회귀 PASS, inline12구문/2importmap PASS다. 실게임·청취·실HTTP·새 패키지 검수는 별도 Gate다.

BOSS 영수증 정정은 실제 Read와 end_turn을 확인했다. 소유 밖11바이트 쓰기1건을 evidence와 일치시키고 설계19→런타임35 치환 제안을 취소했다. 기존 오경로는 보존했다. 다음 작업은 NEXT.md이며 이전 TASK 정정 재실행이 아니다.

| 역할 | 제공자 | 다음 한 건 | TASK | 현재 상태 |
|---|---|---|---|---|
| UIUX | Codex | 분리된 minus 콜백의 합체 환불 수명 | `tools/team-followup-20261002/continuous/UIUX/TASK.md` | completed_root_production_integration |
| ITEM | Codex | D13 parent lifecycle・child payload 접점 | `tools/team-followup-20261002/continuous/ITEM/NEXT.md` | next_sent_read_pending |
| BUILD | Codex | 기존 앱과 최신 source 차이·새 빌드 계획 | `tools/team-followup-20261002/continuous/BUILD/TASK.md` | read_confirmed_in_progress |
| BALANCE | Codex | POST 본문 중간 abort/error 응답 수명 | `tools/team-followup-20261002/continuous/BALANCE/TASK.md` | read_confirmed_in_progress |
| SOUND | Codex | ghost_laugh 실제 backend 포화 경계 | `tools/team-followup-20261002/continuous/SOUND/TASK.md` | read_confirmed_in_progress |
| QUESTNPC | Codex | firstItem 대사 성공·거절·취소 수명 | `tools/team-followup-20261002/continuous/QUESTNPC/TASK.md` | read_confirmed_in_progress |
| MARKETING | Codex | Steam 주장과 코드/출시 빌드 근거 대응 | `tools/team-followup-20261002/continuous/MARKETING/TASK.md` | read_confirmed_in_progress |
| ART | Claude Code | COVER 이미지 오류·배경 fallback | `tools/team-followup-20261002/continuous/ART/TASK.md` | read_confirmed_in_progress |
| MAP | Claude Code | easy CH1-1 hook 차이와 LOCK 인계 | `tools/team-followup-20261002/continuous/MAP/TASK.md` | read_confirmed_in_progress |
| SKILL | Claude Code | blur 시 박격포 취소·자원 차감 대조 | `tools/team-followup-20261002/continuous/SKILL/TASK.md` | read_confirmed_in_progress |
| QA | Claude Code | descriptor 설치/rollback 실패 경계 | `tools/team-followup-20261002/continuous/QA/TASK.md` | read_confirmed_in_progress |
| ENEMY | Claude Code | burstCounter idx60 CD 만료 경로 | `tools/team-followup-20261002/continuous/ENEMY/TASK.md` | read_confirmed_in_progress |
| ANIMVFX | Claude Code | 실제 queue/draw 잔류와 부분 실패 | `tools/team-followup-20261002/continuous/ANIMVFX/TASK.md` | read_confirmed_in_progress |
| BOSS | Claude Code | 설계19와 구현35 별도 대응표 | `tools/team-followup-20261002/continuous/BOSS/NEXT.md` | read_confirmed_in_progress |
| STORY | Claude Code | CIN 타이밍·locale·skip 실제 source | `tools/team-followup-20261002/continuous/STORY/TASK.md` | read_confirmed_in_progress |

현재 채팅 heartbeat `exoduser-mac` ACTIVE1분·기본 알림을 actual TOML로 확인했다. 새 완료만 보고하고 같은 실행에서 근거 검토→피드백 또는 다음 한 건→실제 Read를 확인한다. 상태 변화가 없을 때 중복 알림/재실행0. PC 기존5분 자동화는 유지한다. 즉시 무지연을 보장하는 이벤트 연결은 아니다.

공통 계약: COMMON.md, 역할별 최대3산출(보고/근거/필요한 검사), production/docs 순차 반영은 총괄 소유. 보호설계/타인WIP/사용자 게임/저장 유지, 외부 게시·삭제0. Changes80체크포인트·100전 중단. 도구는 실제 유용한 호출만 기록하고 가용 도구를 사용 완료로 계산하지 않는다.


배정 문서 사전검수 정정: ART/MAP/STORY/QUESTNPC/MARKETING은 Git조회 없이 총괄 제공commit의 출처/시각만 기록한다. MAP 지원계약 조사에는 실제 시각Gate가 없으므로 미판정(null), RETOUCH를 미검수 값으로 사용하지 않는다. 실제 제작/시각QA 시 §23과 PASS/RETOUCH/FAIL 보고 계약을 적용한다.

실제 후속 Read 확인: Codex7명령 exit0. Claude8의 새TASK/NEXT 수신은0(기존 초기8완료와 구분). ART 입력시도는 JSONL 수신이 없어 시작으로 계산하지 않았다. AX초점 표시는 되지만 keyboard 전달이 확인되지 않아 사용자 ART입력칸 클릭 응답 대기. 새 세션/중복 resume/원세션 재시작0.

ITEM 새 공급 경로 검수3입력/5그룹 PASS를 같은 실행에서 인수했다. actual D13 공급·효과연결0/플래그false를 보존하고 기존3파일을 유지하며 NEXT.md의 lifecycle 하위폴더 한 건을 준비했다.

## 감독 추가·Claude 실제 착수 확인

최신 사용자 지시에 따라 EXODUSER 작업감독(`01a0fb1e-4ec3-7dd3-bba2-f87518e881fa`)을 추가했고 TASK 실제Read(exit0)·active를 확인했다. 총괄+감독2/Codex전문7/Claude전문8=17역할(Codex9/Claude8), 이전8+8표는 감독추가전 이력이다. 이후 전문팀 업무전달/완료후feedback는 감독STATE/LOG가최신운영기록, 총괄은생산통합/Git전담이다.

05:38:34Z Claude8 모두 기존 UUID를 유지한 local inbox peer수신/정확TASK/NEXT Read/tool_result 성공을 확인했다. ART05:34:55Z,나머지7은05:36:43~47Z. 화면입력의이전실패기록은역사보존,현재새지시의입력대기해소. 새세션/resume/Remote Control서버/권한모드변경0. isMeta=true peer를제외하던collector판정을정정했다. 단순send/EOF는ACK가아니며Read로검증했다.

감독heartbeat `exoduser` ACTIVE1분과root `exoduser-mac` ACTIVE1분은각target 실제TOML확인. 감독만15팀후속을보내고root는감독인수/생산통합을해중복배정을막는다.

## 2026-10-02 최신: 전문15팀 자율 연속 진행

사용자 “감독없이 혼자 그냥 계속진행하게 명령하면어떄” 및 “그렇게 다 일시켜봐”를 적용한다. 전문팀은 현재 작업·사용자 직접 지시를 보존하며 완료 근거 제출 후 감독 검토나 총괄 통합을 기다리지 않고 자기 승인 백로그의 다음 독립 작업 한 건을 선택한다. 기존 다음지시 대기 방식보다 이 항목이 우선한다.

| 항목 | 현재 계약 |
|---|---|
| 역할 | 원총괄+감독2 / Codex 전문7 / Claude 전문8 =17; 과거8+8은 감독 추가 전 이력 |
| Codex 전문 | UIUX, ITEM, BUILD, BALANCE, SOUND, QUESTNPC, MARKETING |
| Claude 전문 | ART, MAP, SKILL, QA, ENEMY, ANIMVFX, BOSS, STORY |
| 작업 순서 | 재현된 결함 수정 후보 → 필요한 회귀 검수 → 기존 구현 누락 연결; 같은 결함·검사·문서 보고 반복 금지 |
| 자율 소유 | `tools/team-followup-20261002/supervisor-next/<ROLE>/` 아래 자기 새 고유 반복 폴더; 반복당 최대3산출; 제출한 기존 원자료 불변 |
| 통합 소유 | 공용 production 코드·공유 정본 docs·Git/index/commit/push는 원총괄; 팀은 후보·근거·정확 docs 동기화 필요사항을 인계 |
| 의존성 | 한 작업이 막히면 구체적 의존성·필수 결정을 기록하고 다른 승인 독립 작업을 진행 |
| 감독 | 허가 대기 문턱이 아닌 실제 종료/idle/막힘 복구·근거 인계. 진행 중 계속 지시 반복0; 기존 세션에 정책1회 전달·실제 Read 확인 |
| 예약 | 기존 `exoduser` / EXODUSER 작업감독 완료감시 / ACTIVE /5분 / 감독채팅 `01a0fb1e-4ec3-7dd3-bba2-f87518e881fa`; 공식 update 및 저장 TOML 확인. 과거1분 설정 기록은 이력 |
| 실행 중 | 감독이 긴 실행 중에도 최대5분마다 점검. 검증된 후보는 즉시 원총괄에 인계, 전체팀 묶음 완료를 기다리지 않음 |
| 용량 | 실제 untracked 전체 포함 변경 항목80부터 완료 소유만 checkpoint,100 전 새 산출 중단; ignore/삭제로 숫자 축소0 |
| 보존 | 현재 TASK/사용자 직접 작업·타인WIP·사용자23 변경·보호2_3/Q전용패링/어택티켓 금지·맵 LOCK/가이드·사용자 게임/세이브 보존 |
| 제한 | 새 팀/채팅/세션·권한/인증/설치/결제/게시/삭제/cleanup0; PC/Windows 대상0 |

정책 저장과 실제15팀 수신·착수는 구분한다. 감독에게 공식 전달했고 실제 Read 결과는 supervisor STATE/LOG의 최신 영수증을 따른다. 한 번의 계속 명령이나 예약 간격을 무제한 실행·무지연 보장으로 보고하지 않는다. 의미 있는 완료/실패/필수 결정만 알린다.

## 2026-10-02 현행 보충 — 완료 뒤 연속 작업과 종료 복구

사용자의 팀 전체 계속 진행·목표 설정 지시에 따라, 운영에서 추가한 epoch 1반복 또는 결과2파일 소진 뒤 새 epoch까지 종료·대기하는 조건은 해제한다. 위 자율 연속 계약과 기존 공통 보호 규칙은 유지하며, 다음 표가 완료 뒤의 실행 기준이다. 이 보충은 문서에 없던 운영 제한을 해제하는 기록이며 이전 문구·수신 이력을 새 착수 증거로 바꾸지 않는다.

| 항목 | 현행 실행 계약 |
|---|---|
| 다음 한 건 | 결과1건을 완료·제출하면 즉시 구체적인 다음 승인 독립 작업 한 건을 이어간다. 감독 검토·총괄 통합·정리 대기 때문에 전체팀을 세우지 않는다. |
| epoch·산출 한도 | epoch 반복 횟수나 결과2파일 소진은 실행 종료 조건이 아니다. 기존 반복당 최대3산출은 상한이며 불필요한 새 파일을 만들 근거가 아니다. |
| 80/100 용량 | 실제 untracked 전체를 포함한 변경 항목80부터 완료 소유만 checkpoint하고,100 전 새 산출을 중단한다. ignore·삭제·임의 cleanup으로 수량을 낮추지 않는다. |
| 새 파일 여유 없음 | 새 반복 폴더·파일 생성 없이 현재 소유권이 있고 수정 가능한 기존 파일의 추가 수정 또는 메모리 조사를 이어갈 수 있다. 제출 원자료·기존 TASK·타인 WIP를 수정 대상으로 전환하지 않는다. |
| 소유·통합 | 동시 소유 충돌을 피하고 원본 WIP를 보존한다. 공용 production·공유 정본·Git/index/commit/push는 원총괄 소유이며 이 보충으로 전문팀의 쓰기 범위를 넓히지 않는다. |
| 감독 복구 | 전문팀의 후속 지시·종료팀 복구 송신은 감독 단일담당이다. 공식 기존 chat/CLI prompt로 깨우고 실제 새 turn와 유용한 tool 실행을 확인한다. 전송·Read만으로 실제 작업 재개를 보고하지 않는다. |
| 중복·거절 보호 | 진행 중 중복 지시·새 세션·중복 TASK·권한 우회0. MAP의 기존 대기열과 ENEMY classifier 거절은 보존하며 이 정책을 우회 재시도 근거로 쓰지 않는다. |
| 실행 가능한 목표 | 팀은 승인된 독립 백로그를 이어가고, 종료팀 복구 때 감독이 역할별 실행 가능한 다음 목표를 선택한다. 총괄의 소스 통합을 기다리는 동안에도 충돌 없는 독립 작업을 선택한다. 가능한 작업이 없으면 실제 의존성을 기록하고 착수·완료를 만들지 않는다. |

다음 목표는 [CH1-1 실제 플레이 통합 목표](MILESTONE-CH1-1-PLAYABLE-20261002.md)를 따른다. source fixture 통과는 실제 플레이·native·visual·청취 Gate를 대신하지 않는다. [팀 공통 연속 정책](../../TEAM_CONTINUATION_POLICY_20261001.md)의 기존 소유·보호 계약도 유지한다.

## 2026-10-03 현행 보충 — Codex7·Claude8 오더 담당 분리

사용자 최신 지시 “다놀고있으니까 안쉬는방법...몇개더만들던가 관리에이전트를제발”에 따라 관리 담당을 분리한다. 아래 표는 위 관리2+전문15=17 및 감독 한 명의 전문15팀 단일 송신 계약을 대체하는 최신 운영 기준이다. [공통 연속 정책](../../TEAM_CONTINUATION_POLICY_20261001.md)의 동일 보충을 함께 적용한다. 구표·송신·검수 이력과 공통 보호 규칙은 보존한다.

| 항목 | 최신 계약·실제 확인 범위 |
|---|---|
| 역할 수 | 원총괄·기존 작업감독·Claude 오더 담당 관리3 + Codex 전문7·Claude 전문8 =18. 전문15팀과 기존 Claude 세션은 추가하지 않는다. |
| Codex7 유일 송신 | 기존 `EXODUSER 작업감독` `01a0fb1e-4ec3-7dd3-bba2-f87518e881fa`: UIUX, ITEM, BUILD, BALANCE, SOUND, QUESTNPC, MARKETING. 기존 supervisor STATE/LOG 소유를 유지한다. |
| Claude8 유일 송신 | 새 `EXODUSER Claude 오더 담당` `01a0fd2d-8a6f-7f01-b2da-70119654cffe`: ART, MAP, SKILL, QA, ENEMY, ANIMVFX, BOSS, STORY. 새 관리 채팅 생성은 사용자 승인 예외이며 새 전문팀·Claude 세션·resume copy·권한 변경0이다. |
| 원총괄 소유 | 생산 코드·공유 정본 동기화·인수·Git/index/commit/push. 두 오더 담당은 긴 source 의미 검수를 총괄에 인계하고 해당 검수 때문에 전체팀을 정지시키지 않는다. |
| 송신 이관 경계 | 기존 감독의 마지막 native1512 송신5건은 2026-10-02 15:12:50~51Z이며 이후 추가 Claude 송신0 ACK를 총괄이 확인했다. 새 담당은 5팀 진행·ART/MAP 미소비2건·ENEMY 승인 거절1건의 실제 감사를 수신했다. 이 기록은 8팀 모두 active라는 판정이 아니다. |
| 새 담당 활성화 | 총괄의 용량 확보·activation 이후 Claude8 송신과 `supervisor/claude-orders/SUPERVISOR_STATE.json`, `supervisor/claude-orders/LOG.md` 두 운영 파일 쓰기를 시작한다. 활성화 전 실제 송신·파일 작성 완료로 계산하지 않는다. 기존 감독의 STATE/LOG를 덮어쓰지 않는다. |
| 기존 예약 | `exoduser`: 이름·5분·target 기존 작업감독 유지, scope는 Codex7로 변경. 총괄의 공식 automation update 성공을 인계받았으며 영구 TOML 대조는 총괄 후속이다. |
| 새 예약 | `exoduser-claude8`, 이름 `EXODUSER Claude8 오더 점검`, ACTIVE·5분·target 새 Claude 오더 담당. 총괄의 공식 생성 성공을 인계받았다. |
| 총괄 예약 | `exoduser-mac`: ACTIVE·1분·target 원총괄 유지, scope18로 공식 update 성공. 설정 성공은 실제 5분 점검 준수나 무지연·무중단 작업의 증명이 아니다. |
| 짧은 관리 회차 | 각 담당은 먼저 소유7팀/8팀의 공식 active·idle·needAttention와 최신 turn·tool을 확인하고, 완료·idle 팀에 구체적인 다음 승인 독립 목표를 배정한다. 관리 회차는 3분 안에 종료하고 놓친 점검 시각·간격은 정직하게 기록한다. |
| 착수 증거 | 종료팀은 공식 기존 chat/CLI prompt로 깨운 뒤 새 turn와 유용한 tool 실행을 확인한다. 전송·Read·채팅 active만으로 실작업 또는 완료를 선언하지 않는다. 채팅 복구와 goal 재개는 구분한다. |
| 중복·거절 보호 | pending·busy인 지시를 재송신하지 않는다. MAP 기존 대기열·미소비 입력과 ENEMY classifier/승인 거절을 보존하고 우회·재시도하지 않는다. 권한·인증 변경0이다. |
| 연속·용량 | 결과1건 뒤 다음 승인 독립 작업을 즉시 이어간다. epoch 횟수·2파일 소진·검수 대기는 종료 조건이 아니다. 실제 untracked 전체 포함80부터 완료 소유만 checkpoint,100 전 새 산출 중단을 유지하고 메모리 독립 조사는 계속한다. 동시 owner·원자료·사용자23·타인 WIP를 보존한다. |
| 관측 이력 | 2026-10-03 KST 감사에서 BUILD는 00:00:29 완료→00:12:50 새 지시·실도구로 복귀해 idle12분21초가 관측됐다. BALANCE는 00:12:41 완료 뒤 00:13:54 조회에서 idle이었다. 이 시각별 관측을 현재 계속 active 또는 영구 정지로 확대하지 않는다. |

목표는 [CH1-1 실제 플레이 통합 목표](MILESTONE-CH1-1-PLAYABLE-20261002.md)를 유지한다. source fixture·원자료 보존·정책 설정을 실제 플레이/native/visual/청취 인수로 바꾸지 않는다. 이 보충 작성 담당은 자동화·팀 송신·생산 코드·검사·Git을 변경하지 않았다.


## 2026-10-05 최신 — 지옥의 틈/맵 에디터 전문15팀 수동 제작

사용자 전팀 동원 직접 지시로 기존 Codex7+Claude8를 [콘텐츠 계획 §24](../../EXODUSER_GAMEPLAY_CONTENT_PLAN_20261004.md)의 역할별 후보/연결 v1/인수 기준에 한정해 재개한다. 관리3+전문15=전체18, 기존 두 오더담당의 유일송신과 raw/production 소유를 보존한다. MAP만 수동 재개였던 직전 범위는 이력이며 자동화·새팀·새채팅·새실행세션·Windows 재개0. 역할별max1(MAP합산max3), 실제80부터 완료소유 정확pin/완료ID checkpoint/100전 신규산출중단. 진행중 큐·직접 사용자WIP·승인/브라우저선택 대기를 우회하지 않는다. 전송·active만으로 실제 작업/완료를 선언하지 않는다.


## 2026-10-05 최신 — CH1-1 A급 우선 / 송신 차단

[콘텐츠 계획§25](../../EXODUSER_GAMEPLAY_CONTENT_PLAN_20261004.md)/[CH1-1 제작 정본](../../../4.1맵디자인+설정/CH1_1_A_GRADE_PRODUCTION_20261005.md)의 기존15전문+root통합=제작16 범위가 최신이다. 관리3+전문15=전체18/두유일오더 유지, 지옥의 틈·에디터 기존WIP/큐 보존. 자동화 일시중지(과거 ACTIVE 구표는 이력).

Codex7 기존7팀 모두 이전turn 종료이고 후속송신7건이 자동승인 검토에서 승인필요/never로 거절되어 실제 새전달0. Claude8의 기존UUID/PID 등록은 모두 소실, 현재다른8 idle metadata의 공식 역할이관 미확인으로 새전달0. 예전MAP 브라우저선택 대기를 현재새세션 MAP 상태로 계산하지 않는다. 최신 미송신 범위 준비와 정상공식handoff 읽기 확인만 하며 거절송신 재시도·root직접팀송신·CLI/UI·새세션·정책변경 우회0. root 후보1점 보존/이전앱 native partial은 전팀착수/A급/같은후보6단계·청취 완료가 아니다.


## 2026-10-06 KST 최신 — 기존 Claude8의 명시 역할 재배정

사용자 직접 재개 지시에 따라 현재 동일 checkout의 공식 CLI inventory interactive/idle 8개를 확인하고 기존 UUID별 책임을 새로 배정했다. 과거 UUID·Terminal14–21 역할이 자동 승계됐다고 추정하지 않는다. [정확 책임표와 실행 경계](../../../4.1맵디자인+설정/CH1_1_A_GRADE_PRODUCTION_20261005.md#11-기존-claude8-명시-책임-재배정--2026-10-06-kst)를 따른다. Claude 오더담당 한 명만 송신하며 기존 MAP WIP·3개 큐는 보존/재송신0, 공유 에디터 중복 제작0. 자동화·새팀·새세션·권한/인증 변경0. 배정 기록 시 실제 새전달/착수는0이며 peer·새 turn·유용한 source tool 확인 후 운영 STATE/LOG에서 갱신한다. 과거 ps/송신 거절을 우회하지 않는다. 역할별 기존 예약max1/MAP합산max3·80 완료소유 checkpoint/100전 신규산출중단·production/docs/Git root 소유를 유지한다.


### 2026-10-06 KST 실제 전달 결과 — 실행환경 연결 차단

오더담당 완료 turn `01a10e77-917e-7590-aaa9-579202ec28d0`가 공식 역할8건을 인수·소유 STATE/LOG에 기록했다. 2026-10-05T23:48:56Z 첫 ART 정상 inbox 연결이 `PermissionError: [Errno 1] Operation not permitted`로 차단되어 송신0/전문팀 착수0/8. 나머지7역할 연결은 시도하지 않았고 재시도·다른채널·권한변경0. 역할 이관 문제는 해소됐지만 현재 실행환경의 연결 차단은 남았다. 현재8팀 제작중으로 계산하지 않는다. 이전 MAP WIP/3큐·UUID/완료 이력 보존. 실제 외부 조치가 있기 전 거절 작업을 반복하지 않는다.


### 2026-10-06 KST 최신 — Claude8 실제 재개 / 완료 후보7 보존

유일 Claude 오더담당의 01:01:43Z 기존8 역할 정상 전달·peer8/Read8/source8 및 최초 완료7의 end_turn/정확 파일 핀을 확인했다. 앞의 송신0/EPERM은 조치 전 이력이며 현재 Claude8 재개를 덮어쓰지 않는다. [완료 raw7·정확핀/endID·검수 경계 정본 §12](../../../4.1맵디자인+설정/CH1_1_A_GRADE_PRODUCTION_20261005.md#12-claude8-실제-재개완료-후보7-원자료-보존--2026-10-06-kst)에 따른다. ART/SKILL/QA/ANIMVFX/BOSS/STORY/MAP의 독립 후보7을 생산 미채택으로 보존하고 JSON3 parse/MJS4 문법 검사 PASS를 기록한다. ENEMY 최초 turn·다른 WIP/live STATE/LOG/세이브·기존23 제외. root는 raw7+관련 docs8만 checkpoint하며 실제80부터 상세검수 대기 없이 완료소유를 보존한다.

완료7팀 후속은 유일 오더담당의 독립 메모리 조사 각1회·새 파일0/raw수정0. 자동화 중지·새팀/세션/권한/인증 변경0, 관리3/전문15=전체18 유지. Codex7 새 제작착수는 미확인. 공유 editor/core/actor/틈 결과/nav1192·본편 무변. NPC 대사/보상·분위기 consumer·장 전환/본편6단계·실청취 연결은 미완료이며 **VISUAL RETOUCH** 유지. 후보 제출/문법 PASS/Git 보존을 게임 완성이나 A급 인수로 계산하지 않는다.


### 2026-10-06 최신 — 틈 editor 분위기 consumer

최초 Claude8 원자료8/8는 정확 원격 `15f5e64b9221b7bfbf8d5ca41d5328fcc9afe4a0`에 보존됐다. root 완료ID **ROOT-RIFT-AMBIENCE-INTEGRATION-20261006**에서 ANIMVFX 원문을 보존한 world/nav/mask adapter로 저장된 틈의 안개·잔불을 에디터에 연결했다. 직전 consumer0/완료7은 당시 이력이다. [정확 계약/수치/검사 정본 §9](../../../4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md#9-2026-10-06--저장된-틈의-안개잔불-consumer), [최신 §23 제작 보고](../../../4.1맵디자인+설정/HELL_RIFT_EDITOR_RESULT_20261006.md#2026-10-06-최신--안개잔불의-실제-에디터-연결), [CH1 §14](../../../4.1맵디자인+설정/CH1_1_A_GRADE_PRODUCTION_20261005.md#14-root-틈-분위기-consumer-완료--2026-10-06-kst)를 따른다. 실제 보행·장식·토글/PNG/reduced-motion 검사 및8카메라 시각확인 완료, scene/nav1192/본편 무변. NPC/대화/보상·장 gate·본편6단계/청취/A급 인수는 미완료·**VISUAL RETOUCH**. 자동화중지/유일오더·관리3/전문15=18·새팀/세션/권한변경0, 다른 WIP·live STATE/LOG·세이브·기존23 보존.


## 2026-10-06 최신 — 틈 대화 consumer / 오늘19시 보고

공식 완료ID **ROOT-RIFT-DIALOGUE-PREVIEW-INTEGRATION-20261006**. 이전 NPC/대화consumer0와 모든자동화PAUSED는 당시 이력이다. 현재 에디터에 하란·베린·네사·도릭의 F근접대화/선택/시험기록/재방문을 연결했다. 실제선물·퀘스트등록/완료·가방실패·장gate·본편·native6단계·청취/A급인수는0, **VISUAL RETOUCH**. source/raw/scene/nav1192·core/actor/game/index 불변; source STORY SHA be14b1416838ab345eb1c2a150b92403566ccfdc43cd3f3b317cf2913840dfdc. 대화15/실제Chrome12그룹·4보행/원본UI15/core29/안개10 PASS.

오늘 사용자 “작업을해서 저녁까지 보고해”를 따라2026-10-06 KST19:00에 실제완료·미완료/화면·검수·Git을한번보고한다. 기존4자동화PAUSED유지, 오늘만exoduser-2가1시간간격으로승인작업을계속하고 변화없으면알림0/19시보고뒤PAUSED. 기존1분루프·아침email/음성발송·Windows재개0. Codex7/Claude8 유일오더·관리3/전문15=18/새팀·새세션0, 전문TASK중복0, production/docs/Git root소유 유지. 현재slot4의재사용worker/read-only검수를전체16팀가동으로보고하지않는다. liveSTATE/LOG/WIP·보호2_3/Q-only·어택티켓금지·세이브·기존23 보존. 이번완료code6+관련docs11만exactcheckpoint/remoteSHA영수증, 80부터완료소유보존/100전신규산출중단.

### 2026-10-06 — 맵 에디터 발 기준 찍기 현행

공식 완료ID **ROOT-EDITOR-FOOT-PIVOT-INTEGRATION-20261006**. 공유 이미지 씬 에디터의 선택된 이미지에 `발 기준 찍기`와 `MapSceneCore.reanchor`를 구현했다. 그림의 화면 위치·source/crop/mask·길을 유지한 채 기존 v1의 `x/y/pivotX/pivotY`만 하나의 Undo/Redo 거래로 바꾼다. 회전·좌우반전도 보정하며 잠긴/숨긴 레이어와 보행 중에는 차단한다. 모바일≤760px에서 찍기 시작 시 속성창을 접고 성공 클릭 또는 Esc 후 복원한다. 기존 기준점 숫자 입력의 동작은 변경하지 않았다.

정확 API·수식·범위·UI·저장·검수 계약은 `docs/4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md` §11, MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 발 기준 pass를 따른다. core33/33, 실제 포인터/휴대폰13그룹, 최종 기존 UI15그룹 PASS. PNG byte 동일·source/nav·사용자 세이브 불변. 코드4+관련 docs12만 checkpoint하고 원격 exact SHA는 외부 `pivot-integration-20261006/receipt.json`에 보존한다.

**VISUAL VERDICT: RETOUCH**. 발 기준 편집 구현을 주민 크기 통일·clean plate·독립 NPC body·본편/native/청취·A급 맵 인수로 계산하지 않는다. 원본 그림·STORY·결과 씬은 불변이다. 기존 paused 자동화/아침메일 재개0. 오늘 19시 결과보고 조건은 유지한다.


## 2026-10-06 독립 주민 레이어 후보 반영 — ROOT-RIFT-RESIDENT-LAYERS-PREVIEW-20261006

현재 root 소비자는 승인 원화 유래 인물 없는 배경과 투명 주민4명을 별도 에디터 후보에서 렌더·크기 편집·현재 foot 기반 대화에 연결했다. 이전 절의 원본 baked/clean plate·독립body 후속 표기는 해당 시점과 원본 결과 씬의 이력이다. 원본을 교체하거나 본편 FIELD NPC 구현 상태를 바꾼 것이 아니다.

| 항목 | 현재 계약·근거 |
|---|---|
| 후보 | `assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json`, SHA256 `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`, `ISOLATED_EDITOR_RESULT_NOT_ADOPTED` |
| 그림 | built-in imagegen, clean plate/atlas1254². 원본1920²의 정확 픽셀 추출이 아니며 세부 지형/재질이 바뀐 별도 후보. 두 생성 PNG를 byte 그대로 사용 |
| 주민 | 하란/네사/도릭 최초 본체80world px, 앉은 베린 `80*352/578`. pivot(.5,1), alpha crop>8. 유효 aspect/foot을 유지한 사용자 크기 편집 허용; 편집 후80 고정 강제0 |
| 하란 v2 | foot(4660,6660), 접근(4660,6700). body와 south-root bbox 사이35.77854671280277world px, 접근 전사 폭80 기준20px. 이전 v1(4780,6460)의 발 가림은 미채택 이력으로 보존 |
| 씬 | 원본10개 지형 객체의 world/mask·nav1192·BFS1185·r12·시작(4020,7740)/출구(4020,1740) 유지. 6layers/14assets/14objects, foot=기존3+주민4 |
| 대화 | `residentDialogueAnchors(scene)`는 현재 body x/y/height. 편집 확정 시 controller/ambience 무효화, 보행 시작 전 재생성. F범위140, 최대240·접근step20/r12·64전이·22nodes/37options는 기존 session-only 계약 |
| PNG | 2048² export, CPU readback context `willReadFrequently:true`, `imageSmoothingQuality='high'`. 보행 전후 각각 멈춘 상태에서 export한 PNG byte 동일 SHA `f7e03969aa26b4eeaf227c513e0b6e5dfd28df992aabb74f0c7e309f5d34ed84` |
| 검증 | builder 의미19/19, 기본 UI15/15, 실제4주민 보행·분기10그룹 완료 뒤 PNG 차이 FAIL을 보존. 샘플링 수정 후 targeted8/8 PASS(실제3보행, 이전 위치 F닫힘/이동 위치 F열림·Undo·JSON/PNG). pageerror/HTTP누락0 |
| 기획/운영 | §16의 전문15+root통합1=제작16 유지. Claude8 raw8 공식완료는 미채택 보존, Codex7 새7착수0(송신 자동승인 검토 거절: 승인 필요/never). 기존 paused 자동화/아침메일 재개0; 오늘19시 한 번 실제결과 보고 |

정확 구현 표는 `docs/4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md` §12, MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 독립주민 후보 절. 저장/실제지급·부탁/장 gate·높이물리·주민애니메이션·Unity package/Prefab/FBX/PSD 임포트·본편/native6단계·실청취는 미인수. 확대 grain/전사와 주민의 재질·접지 그림자·전체 절벽 실루엣 분리는 추가 개선 대상. **VISUAL VERDICT: RETOUCH.**

완료소유 코드10+관련docs12만 checkpoint한다. 원본 scene/PNG/STORY, game.html/index.html, live supervisor STATE/LOG·타인WIP·보호2_3/Q-only·어택티켓 금지·사용자세이브·기존23 유지. 원격 exact SHA와 최초 실패/최종 화면·영상은 외부 receipt에 보존한다.


### 2026-10-06 주민 접지 그림자 소비자 — ROOT-RIFT-RESIDENT-GROUNDING-20261006

현재 구현은 독립주민 v2의 정적 발접지 그림자다. 이전 독립주민 절의 접지그림자 미구현·builder19·PNG f7e03969…는 그 시점 이력이며, 현재는 아래 계약을 따른다. 원화/atlas/scene/nav 수치와 본편 구현 상태를 바꾸지 않는다.

| 항목 | 코드와 일치하는 현재 계약 |
|---|---|
| 대상 | scene SHA `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`, strict `residentPaintingProfile(scene)`의 독립4body. generic CH1/원본 baked 씬은 비활성 |
| API | `createResidentGrounding(scene,canWalk)` → 유효 factory 또는 null. `snapshot()`는 매번 현재 scene/body를 검증, 실패[]; `draw(ctx)`는 그린 shadow 수. 읽기 전용 editor 진단 `EXODUSER_SCENE_EDITOR.grounding()` |
| 판정 | 현재 foot에서 `canWalk(scene,x,y,12)===true`. Promise/throw/false/다른 truthy는 해당body 제외. ellipse를 겹치는 tile 중심의 `canWalk(scene,cx,cy,0)===true`인 셀에 clip; 현재tile40 |
| 수식 | `rx=clamp(body.width*.42,2,32)`, `ry=clamp(body.height*.08,1,8)` world px. tileSize 양수유한·cols/rows 정수필수. clipping cell `{x,y,width,height}`는 world rect, 임의 심연/벽 보행 추가0 |
| 페인트 | ellipse 정규화 반경1 radial gradient: stop0 `rgba(8,9,6,.34)`, stop.55 `rgba(8,9,6,.15)`, stop1 `rgba(8,9,6,0)`. clip→translate foot→scale rx/ry→fillRect(-1,-1,2,2), ctx finally restore |
| 기본 하란 | foot(4660,6660), rx20.346020761245676 / ry6.4 |
| 기본 베린 | foot(6020,5580), rx21.10173010380623 / ry3.8975778546712805 |
| 기본 네사 | foot(6300,5020), rx16.09360146252285 / ry6.4 |
| 기본 도릭 | foot(5220,2500), rx17.341935483870966 / ry6.4 |
| 렌더·편집 | 바닥 뒤 foot층의 기존뿌리/전사/주민 y-sort 전에 shadow 1회. changed() 시 scene cache 무효화, 열린 drag 중에도 live body 재검증. 숨김/등록변형/잘못된profile은0. 유효resize에 그림자도 비례, 하란height120일 때 ry8 cap |
| 로드 | residents import/factory는 STORY fetch/parse와 별도 try. STORY HTTP503 주입 시 대화null·grounding4 유지. 캐릭터·원화·보행 경계·inventory/save변경0 |
| PNG | overlay=false에도 grounding 포함. 멈춘 보행 전후/숨김Undo복구 2048² PNG 7018879B SHA `24230e778be6a955108e83a16a0086c510e6f82781324c837fb6fd7ef9f06ed4` byte 동일. 실행중 player는 렌더될 수 있음 |
| 의미·화면 | 기존19+접지 negative8=unit27 PASS(동일검사 반복0). browser10 PASS/실제4WASD접근·하란F/드래그·높이·숨김Undo·JSON정확·STORY503/기본씬비활성. 정상 pageerror/HTTP/console0. 새 동영상0 |
| 픽셀 | 기존 무그림자 export와 비교해 발ellipse 근방72픽셀만 달라짐, 외부0. 원본/derived PNG·scene/nav·STORY source hash불변. 전체화면 A급 품질이나 실제광원/높이물리 인수로 승격0 |

검수 시4접근 화면 및 resize 화면을 육안 확인했다. 작은 발 그림자는 구현됐지만 확대grain/재질의 차이·정적인물·전체절벽 alpha/height·실제지급/진행save·장gate·본편/native6단계·실청취는 미인수. **VISUAL VERDICT: RETOUCH.** 본편 code patch0. 외부 backup/최초실패/현재검수/PNG/원격exact SHA: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-grounding-integration-20261006/receipt.json`. code3+관련docs12만 checkpoint, 보호2_3/Q-only/어택티켓금지/타인WIP·liveSTATE/LOG·사용자세이브·기존23 유지. Claude8 원0324 raw8는 후보 미채택 보존 완료(c9b873cb…+7d12ede3…); 현재 memory후속은 쓰기0이며 본편채택으로 계산0. Codex7 새7은 정상송신 자동승인 검토 거절(승인 필요/정책never) hold. 기존paused/메일 재개0, 오늘19시 실제결과 한 번 보고.


### 2026-10-06 — 독립 주민 대화 차단 분리·마스크 출력 안정화

공식 완료ID `ROOT-RIFT-RESIDENT-DIALOGUE-ISOLATION-20261006`. 현행 독립 주민 후보 `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`의 editor consumer만 수정한다. 원본 baked 씬·그림·STORY·nav·body 값은 불변이며 이전 PASS/PNG 핀은 당시 이력으로 남긴다.

| 항목 | 현재 구현·검수 경계 |
|---|---|
| 독립 주민 보행 | strict profile/원문/중복 없는 정확4 anchor 구조 유지. 각 발 `canWalk(scene,x,y,12)===true`; 최소1명이 유효하면 controller 유지하고 막힌 주민만 근접/대화에서 제외. 전원 무효면 초기 null/열린 세션 inactive-scene |
| 원본 baked·무효 profile | 원본 그림의4 logical 발은 모두 strict true여야 생성·유지. 잘못된 source/body/profile은 전체 비활성. 검증 안 된 씬에는 이전 baked 진단 anchor를 표시하지 않음 |
| 접근·수락 | 직선 경로 간격≤20world px의 모든 검사 strict true 필수; Promise/1/throw는 실패. 대화 중 발이 막히면 선택 처리 전에 out-of-range로 닫고 새 선물/부탁 기록0. trial은 editor-session-only/actualGrant=false |
| 마스크 합성 | maskedPicture의 mask/sample/image 2D context `willReadFrequently:true`, image 합성 `imageSmoothingQuality='high'`. 캐시≤8·최대 변1024px·feather sample 최대 변256px·mask/source/world/직렬화 규격 불변. FPS 개선 주장0 |
| 실제 검수 | 의미19/19(1회). 최초 실제 XY/F/WASD 3확인·3보행 후 PNG 불일치 FAIL 보존. 합성 수정 후 Undo/무효 profile/JSON/새로고침/일반·baked/error불변6/6 PASS, 보행 재실행0. pageerror/HTTP/console0 |
| 현재 PNG | 멈춘2048² export7018386B SHA `21b2651252851355d6e2dee865b5e58282576585ad28a0097b5c08be90efb78a`; 편집→Undo·fresh reload/cache rebuild byte 동일. 직전24230e77…/7018879B는 수정 전 이력이며 현재 핀으로 사용0 |
| 제작·보존 | root완료 code3+관련docs12 한정checkpoint. 실제72+15=87부터 완료소유를 보존해72로 복귀; live owner STATE/LOG·타인WIP/기존23/세이브·보호2_3/Q전용·어택티켓 금지 유지. 원문8후속 메모는 미채택·idle, 중복TASK/새팀0 |
| 품질·잔여 | VISUAL VERDICT: RETOUCH. 정적 주민의 확대 grain/재질·전사와 원근/절벽 alpha·높이·실제 지급/quest/save/상승·본편/native6단계/청취 미인수. 계획이나 fixture를 게임완료로 계산0 |

정본 계약은 `MAP_SCENE_EDITOR_20261005.md` §14, 맵 가이드§23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 해당 완료ID를 따른다. 외부 근거=`/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-dialogue-isolation-20261006/`의 receipt.json·first-browser-failure.json/log·browser-qa/browser-final-verification.json·실제 베린/네사 대화 PNG. 정상 code+docs commit/push와 remote exact SHA는 영수증에 기록; 새 build/server/game/게시0. 오늘19시 한 번 보고·기존paused/메일 재개0.
### 2026-10-06 — Unity 단일 Sprite 이미지 규격 consumer

완료ID `ROOT-EDITOR-UNITY-SINGLE-SPRITE-IMPORT-20261006`. 실제 checkout의 격리 editor3387에서 PNG와 동명 .png.meta2파일을 함께 읽고 단일Sprite(TextureImporter textureType8/spriteMode1)의 PPU·alignment·피벗을 기본 배치에 적용했다. 원본 full crop/data URI, 반복 배치·Undo/Redo·JSON v1 왕복 유지. ordinary PNG/JPEG/WebP의 alpha crop/400world px·pivot(.5,1)은 그대로다.

| 항목 | 현재 사실 |
|---|---|
| 단위·규격 | PPU=spritePixelsToUnits .001~1,000,000, worldPixelsPerUnit 기본40·1~32,000, width/height=원본px÷PPU×단위 각1~32,000. Custom editor pivot=(x,1−y), fixed alignment0~8별enum. 범위밖 clamp0 |
| 파일·consumer | PNG≤10,000,000B + meta fatalUTF8≤256,000B·정확2동명파일. `MapSceneUnity.parseMeta` + `MapSceneCore.unityPlacement` + assets[].unitySprite(kind='unity-single-sprite-v1'). 중복/부적합모드·메타/부분crop·PPU/피벗오류는 현재씬/history 유지 |
| 실물 출처 | 기존 UI/button.png122×69/8956B SHA9fcb41bc8c54d83414161a44bd79acfba540c5fbc04a9c084bcc954971a5e5ec + meta2082B SHA3c7aa428101710c2a830de30618a5ffc559d2c02f2e80d468dec44b03cb54c1c → PPU100/단위40/center48.8×27.6world px. QA임시배치이며 틈v2채택0 |
| 의미검수 | 새Unity suite16/16PASS·실제총4회. 1차UMD로더14실패/2차cameras fixture2실패를 외부조건기록으로 보존, 3차15PASS 뒤 plain userData apostropheP2 제품수정·회귀추가 후4차16PASS. 다른 기존suite 재실행0 |
| 화면·입력 | 실제 브라우저23고유그룹PASS·실행5회(최초16+plain문자1+남은4+실제viewport1+버튼줄바꿈1), 성공한 다른검사 반복0. 390px/scale1/viewport내 속성toggle·실제tap/파일선택/배치, 단위44px·버튼55px/2줄문구확인. pageerror/404/외부서버요청0 |
| 소유·보존 | code5(editor.html/map-scene-editor.js/map-scene-core.js/map-scene-unity.js/test-map-scene-unity.cjs)+관련docs12=17만 정상commit/push. 완료소유 checkpoint 실제89→72, 원격exactSHA는 외부receipt 기록 |
| 남은 GATE | Multiple/9slice/.unitypackage/Prefab/FBX/PSD·Unity shader/script·3Dheight/runtime bridge 미구현. 틈4NPC/nav/STORY/source/game·사용자save 불변. 전체맵RETOUCH·실제grant/quest/save/상승·본편/native6단계/청취 미인수 |

정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §15, §23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 같은완료ID. 근거는 `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/unity-sprite-import-20261006/`의 receipt·first-unit-failure.json·browser-qa. 전팀가동/A급/Unity전체호환/음성·메일발송 선언0. 두오더담당 유일송신·전문팀 중복TASK/새팀·세션0, 기존paused/아침메일 재개0·오늘19시한번보고 조건 유지.

### 2026-10-06 — 독립 주민 접근 검사 inspector

완료ID `ROOT-RIFT-RESIDENT-ACCESS-INSPECTOR-20261006`. 현재 격리 editor3387에서 네 주민의 발과 시작점 연결·대화 접근 위치를 수동 검사하는 읽기 전용 편집 도구를 구현했다. 원자료·고정 approach를 생산 씬에 새로 저장하지 않으며, 기존 controller의 현재 발 대상·trial-only 대화 계약은 유지한다.

| 항목 | 현재 구현 경계 |
|---|---|
| 대상·API | `tools/map-scene-resident-access.mjs`의 `inspectResidentAccess(scene,canWalk)`. strict 독립 profile만 `mode=independent`/4rows, review가 있지만 불일치=`invalid-profile`, 원본 baked·generic=`unsupported`, 함수 누락=`invalid-query`; 실패 rows[]·추정 fallback0 |
| 판정·단위 | radius12/range140/line step20/minApproachDistance40world px/maxCells40000. nav0/1과 world를 검증하고 시작→자기 cell중심/4방향 BFS edge/중심→foot 및 추천점→foot 모두 양끝 포함≤20 간격 stricttrue. Promise/throw/1 통과0 |
| 현재 위치·접근점 | body 현재 x/y와 objectId/npcId 사용, 고정 anchor.approach 무시. 연결된 tile중심 중 거리40…140 후보를 distance→y→x로 정렬하여 유효직선 최초1 선택. foot-blocked/start-blocked/no-route/no-approach/ready 구분, 다른 주민 차단 전파0 |
| 편집 화면 | inspector 주민 접근 검사 버튼,4카드의 이름/발/새 접근점/거리/상태, 발 위치 보기=선택과 camera만 변경. 모바일 보기 뒤 inspector닫힘; teleport/배치/nav/자동저장·History 변경0 |
| 갱신·export | 검사 버튼당 새 query1회, RAF/BFS자동재실행0. position/size input·드래그/첫brush/changed·Undo·import(save=false포함) 즉시 이전결과 무효화. 표시 토글/원형범위140·십자6screenpx·접근점5screenpx·실선1.5screenpx; 편집 overlay만, 보행/drag/pending/PNG에 표시0 |
| 의미검수 | 신규 suite12/12 PASS·실제1회·실패0. 실제4ready/이동·독립차단/고립섬/start seed/foot중심/중간구간/r12/invalid/failclosed/비변이. 기존 성공suite 반복0 |
| 화면검수 | 신규 Chrome12/12그룹PASS·실제launch1·실패/pageerror/404/외부서버요청0. overlay on/off의PNG7018386B SHA21b2651252851355d6e2dee865b5e58282576585ad28a0097b5c08be90efb78a 정확동일·JSON c508e70d…불변. 390px/scale1 touch에뮬레이션·버튼180×44px·가로넘침0·camera보기PASS. 보호14핀 before/after불변+승인원화a3d95a…확인. 원본4주민WASD재실행0;F대화가드1은하란만시작근처로옮긴외부fixture시험이며실플레이인수0 |
| 보존·인수 | source v2 c508e70d…/STORY be14b141…/game4f4eba25…/주민모듈·core 불변. 검수완료 root소유 code4+관련docs12=16만 정상checkpoint 범위이며 변경88개에서 타인72개와 분리; exactSHA·보존후실제수는 외부receipt 기록; live STATE/LOG·타인72WIP·기존23/save/2_3/Q-only/어택티켓 금지 보존 |
| 잔여 | VISUAL VERDICT: RETOUCH. 후보 원화 재질/정적 주민/높이/실제grant·quest·save·상승/본편native6단계·실청취 미인수. 시작연결 PASS는 실제 게임 이동·전투·보상 인수가 아님 |

정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §16, §23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md` 같은완료ID. 외부 백업·의미검수·화면·Git영수증=`/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-access-inspector-20261006/`. 두오더담당 유일송신/전문팀 중복TASK·새팀·실행세션0, 기존paused/아침메일 재개0·오늘19시 실제결과 한 번 보고 조건 유지.

### 2026-10-06 — 이미지별 다음 배치 크기·발 기준 규격

완료ID `ROOT-EDITOR-WORLD-PLACEMENT-PRESETS-20261006`. 일반 이미지를 편집한 크기·기준점으로 반복 배치하려면 매번 숫자를 다시 입력해야 했다. 선택 객체의 width/height/pivotX/pivotY 네 값만 자산별 기본 규격으로 보존하는 editor3387 consumer를 구현했다. 현재 객체를 일괄 확대하거나 본편 자산을 교체하지 않는다.

| 항목 | 현행 계약과 인수 경계 |
|---|---|
| JSON v1 | assets[].placementPreset 선택 `{kind:'world-placement-v1',width,height,pivotX,pivotY}`. world 크기 각 Number 유한1…32000, 피벗 각0…1. 잘못된 kind/null/array/문자수치/비유한/범위밖은 validate와import/History에서거절 |
| API·우선순위 | `MapSceneCore.placementDefaults(asset)`는 기존 unityPlacement를 먼저 검증한 뒤 preset이 있으면 fresh4값, 없으면 Unity기본 또는null. 다음 pointer배치=preset > UnityPPU·피벗 > 기존library너비/일반400·crop비율·pivot(.5,1). 저장된height도명시적으로적용 |
| 규격 저장 | `capturePlacement(asset,object)`는 Unity유효성과일치assetId+현재4값을검증해 freshkind+4값 반환, 입력쓰기0. UI는선택한assetId의optional메타만 History1트랜잭션에저장. 회전/반전/opacity/mask/좌표/레이어복사0 |
| 복원·왕복 | 기본규격복원은asset의placementPreset만제거, Unity메타/기존객체불변. 다음배치는Unity또는기존library/400으로복귀. 프로젝트JSON/로컬씬복구/Undo/Redo에서규격왕복; 게임세이브를사용하지않음 |
| 화면·가드 | scene-placement-save/reset/status(리프role=status·aria-live=polite), 버튼전체너비·min-height44px·문구줄바꿈. 선택없음/internal자산/마스크객체/잠금/숨김/busy/보행/대화중 저장·복원차단. 현재선택또는팔레트자산의다음규격만표시 |
| 주민 안내 | 접근검사의40…140world px타일중심조건을실제안내문에명시. controller거리0대화허용/최소거리/고정approach/계산규격변경0 |
| 새 의미검수 | 신규suite14/14PASS·실제1회·실패0. 일반·Unityoverride/restore·strict거절·detached/원본불변·JSONv1·History/invalidimport원자성·실제v2등록/body/nav보존검수. 기존성공검사반복0 |
| 새 화면검수 | 신규 Chrome14/14그룹PASS·실제launch1·실패0. 실제PNG/pointer/Unity·규격저장·반복배치·JSON왕복/Undo/복원·가드·390px touch 에뮬레이션은외부QA기록을따른다. 기존성공suite/원본4주민종주반복0, 휴대폰/native 인수0 |
| 소유·보존 | code4(editor.html/map-scene-editor.js/map-scene-core.js/test-map-scene-placement-presets.cjs)+관련docs12=16완료범위. 실제NUL88의완료소유만정상checkpoint·원격exactSHA/후속72대조는외부receipt. 타인72/기존23·liveSTATELOG/보호2_3/Q전용·어택티켓금지·사용자세이브보존 |
| 남은 GATE | VISUAL VERDICT: RETOUCH. 정적주민·확대원화흐림/높이·본편 실제grant/quest/save/상승·같은후보native6단계·실청취미인수. 규격도구PASS를맵A급·Unity전체호환·실플레이완료로계산0 |

정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §17, 가이드§23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md` 같은완료ID. 외부백업·핀·의미/화면·Git근거=`/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/placement-presets-20261006/receipt.json`. 새팀/전문팀중복TASK/빌드·서버·게임/Windows0. 기존paused/아침메일재개0·오늘19시실제결과한번보고조건유지.
