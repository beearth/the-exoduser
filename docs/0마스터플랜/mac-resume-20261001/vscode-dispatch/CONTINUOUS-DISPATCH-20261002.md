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
