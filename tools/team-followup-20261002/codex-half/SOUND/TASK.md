# SOUND — ghost_laugh 큐 포화와 RNG source fixture 1건

이 문서는 총괄의 후속 배정 초안이며 담당 수신·Read·실행은 실제 근거와 구분한다. 총괄1+전문11=12에서 Claude native6은 ART/MAP/SKILL/QA/ENEMY/ANIM, Codex는 총괄+UIUX/ITEM/BUILD/BALANCE/SOUND다. 기존 SOUND project chat에서 이 한 건만 인수한다. 새 세션·하위팀0이다.

최신 운영 보충(최초 수신 전): 위 총괄1+전문11=12/6대6 문맥은 초기 배치 이력이다. 현재는 신규 보스전·스토리·퀘스트/NPC·유튜브/스팀 페이지관리4팀을 더한 **총괄1+전문15=16, Claude8/Codex8** 운영이다. 신규팀의 제공자/소유권 배정은 총괄이 관리하며 이 담당의 과제·허용범위는 늘어나지 않는다.

시작 전에 이 TASK의 절대경로 `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/codex-half/SOUND/TASK.md`와 checkout의 실제 절대경로 `/Users/fordeargamers/Projects/exoduser-migration-20261001`(끝20261001)을 확인한다. 경로가 다르거나 symlink 해석으로 소유 경계가 바뀌면 쓰지 말고 총괄에 보고한다. **파일/폴더 삭제 명령0, 소유폴더 밖 write0, 임의 cleanup0**이다. 자기 소유 파일도 삭제/이동/정리하지 않는다. 상대경로 오타를 고친다는 이유로 다른 checkout이나 외부 경로를 수정·삭제하지 않는다.

checkout은 `/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. 다른 담당과 공유 중이므로 타인 변경을 되돌리지 않는다. 기존 사용자23항목(한글 백업22·BUILD 초안), 원담당 읽기전용 근거·기존 TASK/산출·오디오 에셋을 보존한다. 이 TASK는 immutable이다.

## 선행 결과 인수

`AGENTS.md`, `docs/6사운드디자인/6사운드디자인.md`, 인벤토리 유골 등록 계약, `project-teams/SOUND/result.md`/`evidence.json`, `claude-provider/SOUND/result.md`/`evidence.json`을 읽는다. headless 검토는 성공 Read와 논리 반례의 제출이며 fixture/청취 실행0이다. 기존 caller18그룹/84입력·정적31검사는 인수하고 반복하지 않는다.

이번은 **ghost_laugh=VOICE9이 일반 큐의 노드48/프레임6 게이트에서 폐기되는 경계와 pri=1의 dedup/RNG 변화**를 실제 source 최소 fixture로 비교하는 한 건이다. 정책·수치·키/파일/볼륨/호출 범위 변경0, pri 후보 채택0이다.

## 최소 실제 source fixture

본편/easy의 `_boneRegister`, `_r`, `playSample`, `_sfxFrameReset`, `_sfxPri`, `_sfxCat`와 관련 상수를 원문 추출한다. 현재 행/함수 SHA와 양판 동일 여부를 기록하고 동일한 backend를 불필요하게 두 번 실행하지 않는다. `_silvertailVoiceKey`는 해당 ghost 키의 source 분기를 그대로 사용하거나 명시한 identity 대역으로 표시한다. `_playSampleNow`/AudioContext/실노드는 호출 카운트 대역이고 청취0이다.

하나의 경계 fixture 안에 다음 최소 대조만 둔다. 합성 clock을100ms 이상으로 시작해 최초 `_sfxLastT=0`의30ms 판정을 혼동하지 말고 RNG를 계수하는 결정적 대역을 제공한다. 큐·노드 상태를 각 대조마다 초기화하며 성공 도감 입력은 실제 source가 받는 최소 plain 데이터다. 등록·notify·저장 호출과 backend 호출을 분리한다.

| 대조 | 합성 조건 | 확인할 현행/검토 경계 |
|---|---|---|
| 정상 baseline | 로딩완료 buffer 가정, active0·앞선 일반큐0, 등록음1건 | caller `_r`1/backend pitch RNG1, ghost 큐1, 재생 대역1, flush 후 큐0 |
| 노드 포화 | desktop active48, 일반 ghost1건→flush | 일반큐는 `_playSampleNow` 도달0·flush 후 큐0. VOICE9만으로 queue bypass가 아님 |
| 프레임 포화 | active0 유지 대역, 서로 다른 일반 키6개가 ghost 앞에 있음 | 해당6개의 경과만 통과하고 ghost 호출0·큐0. 음수/모바일/전수 혼합 조건으로 확대하지 않음 |
| 명시 pri 대조 | 같은 포화 입력에서 메모리 호출에 pri=1만 제공 | 긴급 큐 unshift와 게이트 bypass로 backend 도달 여부. 실제 eviction/노드재생 보장은 아님 |
| 30ms 결합 | <30ms 성공 등록2건: 현행과 메모리 pri=1 대조 | 현행 caller RNG2/backend RNG1, pri 대조 backend RNG2 가능성을 실제 결과로 대조. pri1이 포화 보호와 dedup 해제를 함께 바꾼다는 채택 제한 |

앞선6개의 일반큐를 위한 RNG는 준비 구간으로 별도 기록하고 ghost 구간 수와 합산해 whole-game 수치를 만들지 않는다. 정책 대조를 위해 source caller를 메모리에서 바꿀 때는 정확 fragment/SHA와 변경1곳을 evidence 안에 남긴다. 우선순위·48/6/30ms·pool/RNG·등록 정책은 생산에서 바꾸지 않는다. 현재 source가 headless 예측과 다르면 실제 trace를 우선하여 보고한다. 동일 fixture가 선행 산출에 이미 있으면 read-only adoption/report, fixture0/중복0을 허용한다.

## 소유·금지·보고

쓰기 소유는 `tools/team-followup-20261002/codex-half/SOUND/`의 **checks.mjs, result.md, evidence.json 최대3파일**이다. TASK/원담당 파일 수정0, 추가 patch/후보/로그/사본/폴더0. 메모리 후보·입력·실행 trace는 이3파일 안에 둔다. Node는 `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node` 전체 경로다. production HTML 부트/서버 import0, AudioContext/fetch/디코딩/실타이머/실오디오 호출0이다.

생산·공유 docs·에셋 쓰기0, Git 명령/인덱스/commit/push0, 서버/HTTP/실게임/앱/UI입력/생성/인코딩/빌드/청취/새세션/하위팀0이다. 다른 채팅 메시지 전송·자동 다음 작업0이다. 기존23항목과 타 담당 WIP를 보존한다. 시각/HEAD/Changes는 실제 제공 근거만 인용하고 수신·실행을 추정하지 않는다.

result.md에는 id·한글명·source/SHA·48노드/6프레임/30ms·priority/queue position·caller/backend RNG·flush/재생 대역 횟수·입력/미검수 표를 넣는다. `policyAdopted=false`, `productionApplied=false`, `source fixture PASS ≠ runtime/visual/listening PASS`를 명시한다. backend 도달1을 audible1로 표현하지 않는다. 코드 산출 후 docs 전체 관련 키워드 검색을 목록·개수·출력SHA로 evidence에 기록하고 정확한 계약/한계 동기화안만 총괄에게 인계한다. 공용 docs/보호2_3 수정0이다.
