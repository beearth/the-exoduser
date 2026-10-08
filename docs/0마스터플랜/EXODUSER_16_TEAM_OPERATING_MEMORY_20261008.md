## 최신 직접 지시 — 2026-10-08: 실제 제작 한 건씩

최신 제품·정확 HEAD는 [PROJECT_MANAGEMENT_MASTER 맨 앞](PROJECT_MANAGEMENT_MASTER.md)과 각 외부 completion 정본을 따른다. CH1 양옆 골짜기 렌더는 474b9aae4d5454a12e62589044b9dfa7abf2943f로 보존했고 물리 고도·native는 미인수다. 후속 `ROOT-EDITOR-FRAME-SELECTION-20261008`은 선택 맞춤(Shift+F)의 카메라 기능이며 [실제 계약](../4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md#editor-frame-selection-20261008)과 외부 `editor-frame-selection-20261008/completion.json`을 따른다. 아래 헬거너·과거 팀 관측은 작성 시점 이력이다. LMB/RMB/SPACE 기본 시험 킷만 연결되어 정식 캐릭터·전용sprite/2.5D·native는 여전히 미완료이며 완료 작업을 반복하지 않는다.

“천천히 해라”와 사용량 대비 결과물 지적이 과거 하루15% 사용·병렬속도 목표보다 우선한다. 사용량을 맞추거나 반복 조사/원문/보고서 확대를 위해 작업하지 않는다. 우선 제작은 틈과 보스·캐릭터 2.5D, 신규 캐릭터 스킬·스프라이트, 기존 에디터의 실용 기능이다. Godot/다른 엔진의 제작 원리를 현재 코드에 응용하며 별도 엔진 설치·교체는 하지 않는다.

`31724a6107582078b0e1f519c3a501d3be6e51ab`은 헬거너 LMB 관통 창격의 제한된 본편 시험 consumer다. 정식 신규 캐릭터 전체·sprite·native 검수는 미완료다. 후속 `ROOT-EDITOR-ASSET-REVEAL-20261008`은 인스펙터의 `원본 재료 찾기` 기능(code3/docs4)이며 외부 `editor-asset-reveal-20261008/completion.json`의 최종 commit/remote 결과를 따른다. 통제 검사와 실제 화면/청취/보상 save를 분리하고 기존 열린 탭을 재로드하지 않는다. 아래 과거 사용량 목표/운영 관측은 이 최신 지시를 덮지 않는다.

# EXODUSER 프로젝트 메모리와 16팀 운영 정본

기록: 2026-10-08 KST. 사용자 직접 지시: “메모리 해두고 16팀을 어떻게 운영할 것인지도 정리하고”. 이 파일은 저장소에 보존하는 프로젝트 메모리다. 앱 전역 메모리 저장을 뜻하지 않는다. 다음 총괄 실행은 AGENTS.md의 연결을 통해 이 정본을 먼저 읽고, 동적 상태는 기존 owner의 최신 STATE/LOG·공식 종료·영수증으로 확인한다.

## 1. 기억할 목표와 책임

실제 CH1-1을 고품질 2.5D 본편으로 연결한다. 같은 후보에서 시작 → 전투·획득 → 보스방 개방 → 보스전 사망·부활 → 재도전의 화면·청취·실보상 save까지 확인해야 전체 인수다. 독립 lab, 읽기 계획, 원문 보존, CPU PASS만으로 본편 품질 완료를 선언하지 않는다. 현재 전체 미감은 RETOUCH이고 physical relief 0, 맵 확대 흐림·절벽/전경 재질·공통 발접지·전체 경로·청취·durable save는 남아 있다.

총괄은 우선순위 결정, 정확 소유권 확정, 후보 의미 검토, 실제 main 통합, 필요한 검수, docs 동기화, 소유 변경의 정상 commit/push·원격 exact 대조, 다음 승인 미완료 연결까지 책임진다. 사용자에게 계속 지시하도록 떠넘기거나 운영 문서 작성만 반복하지 않는다. 완료 팀의 독립 제작은 총괄 검토 대기로 일괄 멈추지 않는다.

## 2. 16팀의 의미와 송신 소유

**제작 16팀 = 총괄 1 + Codex 전문 7 + Claude 전문 8.** 기존 감독 2명은 전문팀 배정·근거 인수·다음 연결 역할이며 제작팀 수에 다시 더하지 않는다. 모두를 역할 수로 세면 제작16 + 감독2 = 18이다. 기존 문서의 11/12/15/17 표기는 당시 편성 또는 계산 이력으로 보존하고 현재 16팀 운영과 혼동하지 않는다. 새로운 팀·채팅·Claude 실행 세션을 만들지 않는다.

| 전달 경로 | 단일 소유자 | 책임 |
|---|---|---|
| Codex 전문 7 | Codex7 감독 `01a0fb1e-4ec3-7dd3-bba2-f87518e881fa` | UIUX·ITEM·BUILD·BALANCE·SOUND·QUESTNPC·MARKETING 배정, 실제 수신·첫 성공 source·공식 end 확인, 끝난 팀 다음 독립 작업 연결 |
| Claude 전문 8 | Claude8 orders `01a0fd2d-8a6f-7f01-b2da-70119654cffe` | ART·MAP·SKILL·QA·ENEMY·ANIMVFX·BOSS·STORY의 동일 책임 |
| 본편 채택·공유 파일·Git | 이 원총괄 | 감독의 후보와 증거를 검토하여 실제 main에 통합·보존. 전문팀 직접 중복 송신 금지 |

root helpers `character_preview`, `orders_checkpoint_readiness`, `rig_motion`은 기존 지원 역할이다. 필요할 때 독립 검토·원문 보존·문서 동기화에 재사용하며 전문팀 수에 포함하지 않는다. 총괄 포함 로컬 동시 슬롯 4개와 전문 역할 15개는 다른 개념이다. 16개 동시 실행을 보장하거나 전원이 가동 중이라고 보고하지 않는다.

## 3. 팀별 제작 범위와 완료 Gate

아래 “다음 우선 범위”는 담당 백로그이며 현재 TASK를 새로 송신했다는 뜻이 아니다. 기존 TASK가 끝나면 owner가 실제 최신 미완료 중 한 건을 선택한다. 공유 `game.html`은 총괄 소유이고 전문팀은 기본적으로 완성 inline own hunk·정확 삽입 지점·Gate를 제출한다. repo 파일이 필요하면 먼저 정확 절대 경로 하나와 충돌 없는 소유를 확정한다.

| 제작팀 | 제공자·소유 | 다음 우선 범위 | 제출물·완료 Gate |
|---|---|---|---|
| 01 총괄 | ROOT | 실제 CH1-1·Rift 연결과 품질, 아래 미완료를 작은 본편 단위로 통합 | code·관련 docs·검수 한계·원격 exact·다음 실제 배정까지 완료 |
| 02 UIUX | Codex7 | 지역 목표/해금 이유·입력/대화/사망·복귀 가독성 | 실제 leaf와 수명·KR/EN·640/1280 계약, 본편 화면에서 흐름 확인 |
| 03 ITEM | Codex7 | 전투 획득·장착/비교·보상 귀속·인벤토리 소비 | 현재 item identity와 caller 검증, 거짓 선택 반례 수정 금지, durable 여부 별도 |
| 04 BUILD | Codex7 | 현재 입력·소유 변경·실행/저장 격리 근거 | 기존 증거 기반 정확 manifest·인수 누락 해결. 현재 새 빌드/서버/설치 금지 유지 |
| 05 BALANCE | Codex7 | 실제 스킬 비용·자원·중첩식과 표시 불일치 | docs 식·실제 caller·최소/일반/경계값 대조, 표시 변경과 밸런스 변경 분리 |
| 06 SOUND | Codex7 | 기존 음원과 main 전투/NPC/복귀 수명 연결 | 정확 기존 source·world 좌표·재생/정지·수명 계약, 청취 전 음질 인수 금지 |
| 07 QUESTNPC | Codex7 | 주민 접근→R→정본 대화→귀환·유품/부탁 consumer | actor/map/owner·거리·입력 단일 소비, 확정 ID만, 미확정 보상 추정 금지 |
| 08 MARKETING | Codex7 | 실제 인수된 화면·기능의 출시 자료 정합성 | 미구현/미인수 구분한 정확 원고·에셋 목록, 현 범위에서 게시/발송 금지 |
| 09 ART | Claude8 | 승인 기존 원화의 크기·밝기·배경 흐림·재질 | 원자료·UV·mask 권위와 실제 시각 근거. 현재 보류/거절 목적 접근 금지 |
| 10 MAP | Claude8 | CH1 지형/절벽·전경·실 editor·보행/전투 연결 | guide 전체→SSOT→stage LOCK, 실제 도달 consumer·§23 REPORT·VISUAL 판정 |
| 11 SKILL | Claude8 | 기존 일반 공격·스킬의 실제 consumer·비용/표시 | 완성 JS·현재 source/docs·명확 Gate, 특수/Q 설계·전투식 무단 변경 금지 |
| 12 QA | Claude8 | 같은 후보의 실제 정상 플레이·해금·death/retry 반례 | setup/관측/PASS/FAIL/미도달 분리, 한정 새 Gate, 옛 suite 재실행 금지 |
| 13 ENEMY | Claude8 | 실제 caller가 소비하는 AI·상태·효과 수명 결함 | 재현 가능한 입력·원인·최소 후보. 손계산을 실행 PASS로 꾸미지 않음 |
| 14 ANIMVFX | Claude8 | 캐릭터/Druid 동작·발접지·효과 가림·수명 | 기존 decoded 에셋·frame/crop/pose/currentness, 실제 몸/발·FX 화면 근거 |
| 15 BOSS | Claude8 | CH1-1 개방·정상 진입·사망/부활·재도전·Druid 소비 | life generation·deaths·pending·phase·실제 필드/별칭 대조, 강제 해금 없음 |
| 16 STORY | Claude8 | 확정 내러티브·Rift 대화/유품/부탁의 본편 연결 | 정본 대사/ID·session 대 durable 경계. 현재 보류와 UNKNOWN 원문 접근 금지 |

## 4. TASK 한 건의 계약

각 팀은 현재 TASK 한 건과 다음 후보 한 건을 구분한다. TASK에는 다음 필드를 빠짐없이 기록한다. 미확인 값은 UNKNOWN으로 남긴다.

| 필드 | 의미 |
|---|---|
| taskId / role / providerOwner | 유일 TASK·제작팀·송신 감독 |
| objective / primaryDocs | 실제 제품 변화 한 건·먼저 읽을 시스템 정본 |
| exactFileOwner / ownHunk | 정확 절대 파일 경로·함수·삽입 지점. inline 후보는 repo 쓰기 권한 없음 |
| dependency / Gate / stopBoundary | 필요한 선행 결과·검수 범위·거절/충돌 시 멈출 해당 목적 |
| sent / peer | 송신과 실제 수신을 별도로 기록 |
| firstSuccessfulSource | 현재 TASK의 실제 성공 tool pair·시각. ACK/파일 존재로 대체 불가 |
| officialEnd / rawPin | 현재 TASK 공식 종료·단일 원문 UUID/시각/bytes/fullSHA. 미채택 원문 |
| rootReview / adopted | 반례 성립 여부·실제 최소 consumer 채택 여부. 원문 보존과 별개 |
| validation / visual / preservation | 실제 source epoch·FAIL/미도달·시각 판정·소유 commit/remote exact |
| nextAction | 수정 피드백 또는 다음 승인 독립 TASK. 같은 TASK 재송신 금지 |

거짓 반례면 patch 0으로 종결하고 다른 실제 미완료로 간다. 완료했다고 알려진 동일 source/검사/보고서/원문을 다시 생산해 작업량으로 세지 않는다. inline 계획은 실제 본편 구현 완료가 아니다. 큰 STATE에 과거 전체 객체를 중첩 복사하지 않고 현재 필드와 완료 원문 JSONL UUID/fullSHA·영수증 참조만 갱신한다. 파일 쓰기는 encode 완료→선 fullbytes 백업→대상 경로/realparent/symlink 확인 뒤 수행한다. encoding 실패로 기존 STATE를 0B로 만들지 않는다.

## 5. 매 실행의 제작 순서와 후속 연결

1. 기존 owner의 이전 cursor 뒤 새 first source·공식 end·차단 변화만 확인한다. giant STATE 전체 출력·반복 hash·동일 감사는 하지 않는다.
2. 끝난 팀은 공식 end와 정확 원문 핀을 제출하고, 기존 owner가 다음 승인 독립 미완료를 실제 다음 turn으로 연결한다. 진행 중 TASK에 “계속해”를 중복 송신하지 않는다. root 검수 중 독립 팀은 계속한다.
3. root는 실제 main 효용·정본 계약이 명확한 후보 한 건을 선택해 의미 검토→선 백업→최소 consumer를 구현한다. 한 차단이 다른 허용 제작을 멈추는 이유가 되지 않는다.
4. 변경에 필요한 한정 검수만 실행한다. 새 의미가 없는 옛 CPU/Chrome/전체 suite 재실행·PASS 합산은 금지한다. 실제 화면이 필요하면 허용된 기존 격리3387에서 사용자 열린 게임과 충돌하지 않는 승인 범위만 사용한다.
5. code 변경 뒤 docs 전체 관련 keyword 검색→현재 정본의 값/상태 정확 동기화→소유 code+docs만 정상 commit/push→정확 원격 ref 대조→다음 단위로 잇는다.
6. 실제 rename-aware NUL 항목 80부터 완료 소유만 즉시 checkpoint, 100 전에 새 산출을 멈추고 보존·기존 WIP 인계를 우선한다. 완료 검수 보존을 모든 팀의 무조건 대기 이유로 사용하지 않는다.

단일 root `exoduser-2` 기존 ACTIVE 30분 heartbeat만 유지한다. 실행 중 완료 연결은 바로 진행하고 다음 날짜/19시/라운드 후속 대기를 두지 않는다. 예약 실행은 앱·호스트가 실행 가능한 조건에 의존하며 24시간 전원 가동을 보장한다는 뜻은 아니다. 사용자가 중지하면 즉시 중지·임의 재개 0. 한국시간 일별19시 요약은 한 번만, 의미 없는 idle/동일 현황 보고는 생략한다. Oct7 요약은 이미 완료했다.

## 6. 작성 시점의 실제 관측과 다음 통합

이 절은 2026-10-08 KST 작성 중 받은 16:28:54Z owner 관측까지이며 live 상태판이 아니다. 최신 owner 기록이 우선한다.

| 범위 | 실제 관측 | 다음 처리 |
|---|---|---|
| ROOT holyPrison | code1/docs5 remote exact `f777486e7eec73d625439a9100ebea9802deb83a`; t/15 한행. software 원PNG13조건 PASS, native NOT_RUN/RETOUCH | 완료 단위 반복 0. 원격·completion 영수증은 외부 E/ch1-holy-prison-deploy-in-20261008/ 참조 |
| Codex 감독 | cursor172 부모 blit result port 후보 공식 완료·미채택. 다음 BLIT-CONSUMER-OWNERSHIP-INLINE task 송신 | 새 source/end만 확인해 업로드 결과·중복 draw·stale 계약 의미 검토 |
| Codex 전문7 | notLoaded/newsource0. UIUX/QUESTNPC의 실제 송신2건 approval 필요+policynever 거절, 다른5 미송신 | 기존 감독만 소유. 같은 목적 다른 tool/path/host/권한 재시도 금지. 감독 source 작업을 전문7 착수로 세지 않음 |
| Claude 기존6 | ANIMVFX/MAP/SKILL/QA/ENEMY/BOSS의1617 TASK peer6/firstsource6을16:18:31Z에 관측. owner는16:28:54Z 조회 공식end6/CLIidle6와 정확 refs를 새 인계했고 root 원문 대조 전이다 | 현재 TASK 재송신 없이 새 공식 end 정확 refs→다음 독립 작업. 지속6busy로 과장하지 않음 |
| Claude ART/STORY | 보류 유지 | 불허 목적 접근/실행/대체 구현 없음 |
| root helpers3 | source/문서 peer·현재 원문 보존·팀 inventory 등 필요한 독립 범위만 배정 | 지원 작업 완료 후 실제 신규 범위에만 재사용 |

우선 제품 백로그는 실제 CH1-1 보스 개방/정상 진입/death-revive-retry, Druid/캐릭터 발접지·몸 크기/밝기·절벽/전경 재질·맵 흐림, NPC 정본 대화/유품/부탁 durable consumer, 실 map editor다. UI 숫자 수정·문서만으로 이 핵심 목표를 대신하지 않는다. thunderStake 번역 canonical 후보29입력/생성 bundle은 미채택이며 새 대형 생성/build를 자동 실행하지 않는다.

## 7. 보존·현재 사용자 게임·설정 경계

- checkout은 `/Users/fordeargamers/Projects/exoduser-migration-20261001`만 사용한다. shell cwd의 `/Users/fordeargamers/the-exoduser`로 오인하지 않는다.
- 공용 game foreign185B와 설정3.3 foreign2948B, foreign68·타인 WIP·사용자 save·원PNG/scene/nav/LOCK는 미채택 보존한다. game/3.3 전체 git add 금지. working/HEAD 각각 백업·같은 own hunk·inverse exact·owned blob만 stage한다.
- 사용자가 보는 기존 IAB13/3387 main Rift view-only는 열린 채 유지한다. 닫기/재로드/조작/중복 게임·Chrome 0. old loaded source이므로 새 코드가 실시간 적용됐다고 말하지 않는다. 그 탭 APIforward/storage/usersave 관측은 UNKNOWN이다.
- 새 서버·Chrome·빌드·대형 작업·Windows·사용자3333/3340·앱3381/3383, 삭제/cleanup·권한/인증·설치/결제·게시·자동 이메일/음성 발송은 현재 승인 범위에 없다. 추가 모델/플랜/구매·설정 변경 없이 허용 제작을 이어간다.
- 실제3387 entry/SAVE_DIR은 UNKNOWN이다. `ps Operation not permitted` 거절 목적을 우회하지 않고 서버 재시작 0. 이 경계는 durable save 실검수만 막으며 다른 허용 제품 제작은 계속한다. dbSave resolve/localStorage 기록/합성 API 차단을 실제 서버 ACK로 세지 않는다.
- 거절된 전문 송신·ART선택·ENEMY policyRead·tree-card 목적을 다른 도구/경로/호스트/권한으로 재시도하지 않는다. tree-card 파일 존재 확인/동등 출력/root 대체 구현 0. held WOLF/STORY 후보는 추가 내용/hash/실행/검수/채택/Git 0. WOLF 쓰기는 자동 승인 검토 dangerous로 거절됐고 구체 사유가 제공되지 않았으며 damage UNKNOWN이다. 이전 외부 쓰기/삭제 피해 UNKNOWN·옛 STATE alias 완전 복구 false를 지우지 않는다.
- 보호2_3 문서 수정 0, Q 전용 magic blackBean의 E 패링 0, 어택 티켓 0, PixelLab 캐릭터 생성 0. 미확정 Berin contentID/type/qty와 Nessa questID/reward는 추정/질문 반복 0.
- 맵 작업은 guide 전체·_MAP_SSOT_INDEX·stage LOCK 선행 및 §23 MAP PRODUCTION REPORT/실제 VISUAL VERDICT가 필요하다. CPU 합격을 visual PASS로 대체하지 않는다.
- 주간 사용량 약15 percentage points/day는 유용한 제작 목표이며 모든 채팅 공유다. Oct8 관측 used31/rem69/reset2026-10-14T03:28:59Z는 당시 기준이고 이 채팅의 정확 소비량/15pp를 보장하지 않는다. 같은 감사·토큰 태우기·한도 우회/추가 구매 0, 하루1회 또는 실제 한도 변화 시에만 재조회한다.

## 8. 다음 세션 시작 시 기억 확인

이 파일 → MASTER의 최신 맨앞 지시 → GOALS/CONTINUATION/CONTINUOUS-DISPATCH의 현재 필드 → 두 owner의 마지막 cursor 이후 새 결과 순으로 읽는다. 지난 완료의 상세 suite/원문 보존은 각 영수증 참조로 대신한다. 현재 TASK·정확 소유·의존성·새 source/end·root 채택·다음 action만 갱신한다. 이 파일을 새 대형 STATE처럼 반복 복사하지 않는다.


### 2026-10-08 — Codex 전문 연결의 후속 거절 관측

이전 “UIUX/QUESTNPC 2건 거절·다른5 미송신”은 당시 관측 이력이다. 이후 Codex 감독의 공식 cursor231 / turn `01a118fd-a035-7e31-a50a-50f50c012a35`는 ITEM·SOUND·BUILD·BALANCE·MARKETING 다섯 기존 전문팀의 첫 공식 송신도 approval policy `never`로 거절됐다고 보고했다. 신규5의 전달·peer·source·end는0, retry0·STATE쓰기0이며, 앞선2건 거절과 구분한다. 전문7의 실제 새 착수나 가동 완료를 주장하지 않는다. 기존 감독의 별도 source 작업과 ROOT의 제품 통합은 전문팀 착수로 합산하지 않으며 다른 도구/경로/호스트/권한으로 거절 목적을 재시도하지 않는다.

정확 단일 final 보존 근거: 외부 `team-goal-0045-official-20261008/codex-231-official/final.txt` 1,603B / `cc54b3515dbed685ab25dbceb81e26a34520ac5efb2a1b4910e227a221ba81fe`, manifest 2,207B / `d56447fd8b179739010ced644e7b543b44ac0779b8adb56bd0920644afa2507d`. 이 단위에서 해당 원문을 재추출·재hash하지 않고 이미 검증한 보존 핀을 참조했다.

## 2026-10-08 — 드루이드 실제 입체 본체 단위

ROOT-CH1-DRUID-VOLUMETRIC-BOSS-20261008: 일반형 solid128/관절25/조명5를 actual character-rigs→ch1-player-rig→game에 연결. 사용자가 첫 모션을 거절한 뒤 양팔 two-bone IK/공통 staff grip/골반·다리 stance, 실제 Wind countdown anticipation·recover20f 표시 연결을 재구현했다. 같은 actor/map/owner/life에서만 sheet 전환 뒤 직전 공격 family를 이어받는다. 최종 새 Node1/7그룹PASS/80자세, 실제 IAB15 WebGL 양손 준비/전신 Slam 측면/Sweep 회전 관측. 이전8·shadow2·weaponFAIL1·수정Sweep4는 별도 source 이력/재실행·clean합산0. 미리보기 준비.6s/대기.5s는 관찰용, 실제전투시간 변경0. 기존IAB14 사용자게임 무조작/새기능live적용 주장0. 외형·타격 무게감 RETOUCH/사용자 승인 미인수. 특수·변신·사망/native6/audio/실보상save·전체보스전 미완료. 정본 DIRECTIONAL_CHARACTER_RIGS_20261006.md 입체 본체절, 최종보존 E/ch1-druid-volumetric-boss-20261008/completion.json. 천천히 실제 한 건씩 지시 우선; 동일검사/원문/검색/Git 반복0.
