# SOUND-start-failure-0543 — src.start 예외와 즉시 회수

**현행 즉시 회수 기준 RED → 최소 메모리 후보 GREEN**, 정상 대조 원문/후보 동등. 새 입력은 start예외1·정상여유1뿐이며 원문/후보 총4실행, 비교1건, assertion FAIL0. 양판 동일 source는1그룹만 실행했다. 이전3/7/31/84 실행/import/합산0. productionApplied=false, priorityPolicyAdopted=false. source PASS ≠ runtime/visual/listening/제품 PASS.

| 근거 | 실제 기록과 한계 |
|---|---|
| 수신·Read | 감독 채팅01a0fb1e-4ec3-7dd3-bba2-f87518e881fa 지시; 첫 TASK cat chunk f8b985 exit0. 정확 수신/첫Read 시각 null. TASK/COMMON/AGENTS/현재담당표/사운드SSOT 실제Read SHA와 후속시각 evidence 기록. |
| 담당·경로 | Codex SOUND/01a0faaf-956a-74a3-9bf1-77032f124e2d. cwd/realpath /Users/fordeargamers/Projects/exoduser-migration-20261001. 쓰기는 이 새 폴더 checks.mjs/result.md/evidence.json3개뿐; TASK/이전산출/생산/공유docs 보존. |
| 제공 근거 | TASK가 제공한 2026-10-02T05:42 전후 원격검증commit f2e70ef7c9c663fdd69e925bc379b6d6f8bcaa9c와 생산SHA는 제공관측시점 근거. Git조회0/독립현재HEAD null/Changes null; count는 감독추적. 이전6c77/c40e/7e694950은 역사입력. |
| 새 실행 | 2026-10-02T05:45:59.682Z→2026-10-02T05:45:59.800Z UTC / 2026-10-02 14:45:59.682 KST→2026-10-02 14:45:59.800 KST. /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node, v24.15.0, exit0. 읽은 입력 SHA보존=true. |

| 실제 source | 본편/easy 시작행 | SHA256 | 양판 |
|---|---:|---|---|
| _r | 12004/11408 | a2ae931f0268caf75ddb17d752c77cd32960a6cf59eac23be2db7dc76dda8ab3 | 동일 |
| playSample | 11899/11303 | 4305df5cdb884bda6cfe83fc670852d5d7a3d02937e4087ea3f59eebaff6bc79 | 동일 |
| _sfxFrameReset | 11840/11244 | a1e9ed017b19ea9adb736eaa53ff9f1b9f548db8b14763ed7068854a54705370 | 동일 |
| _playSampleNow | 11800/11204 | 9b0733ee9355782ea98e0e959eafec27e04544b850c8b33eb0c076d1b2459e4a | 동일 |
| _evictLowest | 11793/11197 | 01e85bff85d87d3121731a046b9308f4bbd0e206d6259143bb689404de144e88 | 동일 |
| _sfxPri | 11778/11182 | ddb3b9c901afd6dca96d917fb79dbcd164ed802b4dfea2287394c23c253738d5 | 동일 |
| _sfxCat | 11883/11287 | b46865084a6cd213875c288681d8ddc3bd6f72446e604778c9ec9713c2695e8b | 동일 |
| _isFootstepSfx | 11777/11181 | d3f6179e260c9264ff417dc356f789044609d495d7f9d8a70f3ce01be882f853 | 동일 |
| _isSkillSfx | 11897/11301 | 1eb9ed929a4b063ee1f8f7f418a8ba92a771149482be8d3eb2ef8eb8f1d1f73a | 동일 |
| _MAX_ACTIVE_NODES | 11767/11171 | 7fc65f673a1f32ef796b08234996170426b4e5c133f37aa43452143a63ff4267 | 동일 |
| _SFX_MAX | 11768/11172 | 409644afebe7967ebe57352442c4a6f0080359debd5d948c8b93e55845781470 | 동일 |
| _SFX_PER_FRAME | 11770/11174 | 74b8f6406e429a980e5ba25120e30f4b8a23df18c60a945998f79759083745b9 | 동일 |
| _SFX_PRI | 11772/11176 | 3d026a723da2d9ff5693b3f8486f2a8790854f0a43f84313ffc40d6836e5e965 | 동일 |
| _SKILL_SFX_KEYS | 11896/11300 | e2b7bd8e642492759d2ac39c2cab43f6f932bda35f7061269f41effaaaf71271 | 동일 |
| _MAX_PROJ_NODES | 11774/11178 | 9d7cf03015d8a1c8f5526ef3c01d78976c13fe836538330b6ae47253cb2fb04d | 동일 |
| _MAX_HIT_NODES | 11775/11179 | f4c08800ccc4a5e6909ad405ab1469fbf9bff17ce6a1fe935e40f900a6f13011 | 동일 |
| _MAX_STEP_NODES | 11776/11180 | f6dc8c7eb4e4453f936f6a7f862132a9e7b52108edd18ce35edbacb20a4318c1 | 동일 |

현재 전체 SHA 본편=2e45ee0e9ad909b378bf1a7b864818ce442a4c3e17b12360b42e363dc7d0bd94, easy=3e5969ca139497c2efb312dc720ab53eb42a8d1912c8288caa2ce858cfd5120a, node-main=541ff8e6f57db862ddbb1b148ee37a3a8e0da1e16293bc8343a0bc4144d80daf. 제공SHA/이전SHA와 현재값은 evidence에서 별도로 기록하며 동일성을 추측하지 않는다.

| id | 원예외 전달/원 src return | 즉시 count/nodes/queue | 즉시disconnect | timer후 count/nodes/queue | stop/src/gain disconnect총 | caller/pitch RNG | 검수 |
|---|---|---|---:|---|---|---|---|
| start-throws-current | true/false | 1/1/1 | 0 | 0/0/1 | 0/1/1 | 1/1 | PASS |
| start-throws-memory | true/false | 0/0/1 | 1 | 0/0/1 | 0/1/1 | 1/1 | PASS |
| start-normal-current | false/true | 1/1/0 | 0 | 0/0/0 | 0/1/1 | 1/1 | PASS |
| start-normal-memory | false/true | 1/1/0 | 0 | 0/0/0 | 0/1/1 | 1/1 | PASS |

현행은 start예외 후 count1/activeNodes1이 남고 예약700ms 콜백 수동실행 뒤0/0으로 회수된다. 영구 누수로 판정하지 않는다. 메모리 후보는 같은 원예외 객체를 그대로 재throw하면서 actual _nd._dn을 즉시 실행해0/0이 된다. 이미예약한 timer는 취소/변경하지 않고 뒤늦은 onended·중복timer가 _d guard에서 중복회수를 막았다. stop호출0이며 시작하지 못한 소스를 억지stop하지 않는다.

| 메모리1곳 | exact fragment / 보존 |
|---|---|
| _playSampleNow | `src.start(startTime||0);` → `try{src.start(startTime||0);}catch(e){_nd._dn();throw e;}`. 원/후보 fragment·함수SHA evidence. 실제원문 backend/내부_dn 실행, 생산patch0. |
| 정상 | 원문/후보 src return동일·trace완전동등·priority9/gain0.8/rate1.1856/timer700ms 유지. |
| dispatcher 실패 | _sfxFrameReset로 전달된 원예외 때문에 큐정리행에 도달하지 않아 원문/후보 모두 queue1 유지. lastT.ghost_laugh100/queue pri0/callerRNG1+pitchRNG1 동일. 큐를 추가flush/수정하지 않음. |
| 입력/대역 | active0·loaded duration0.2초 buffer·clock100ms·pan0. 실제 _r/playSample/flush/backend/priority/_dn 사용. WebAudio create/start/stop/disconnect·mbus/sfxVol·identity보이스·timer/plainclock만 대역. start만 FixtureStartError를 던지며 create/panner 등 다른실패0. 실제장치실패 관측 아님. |
| 한계 | 합성 start성공도 청취성공 아님. timer수동실행은 실시간 검수 아님. 등록/전체pickup/저장/포화/모바일/패키지/다른실패/실노드0. RNG는 이 sample호출 구간만. |

docs 전체 rg 51행/33파일; 명령/목록/출력SHA evidence. 공유docs/보호2_3쓰기0. 사운드SSOT에 총괄이 인수할 정확한 canonical 문안:

> | id / 위치 | 현행 관찰과 미적용 후보 |
> |---|---|
> | _playSampleNow / src.start | 노드count증가·activeNodes등록·timeout예약 후 start. start가 예외를 던지면 즉시등록노드가 남고 예약정리_dn에서 회수됨. duration0.2초 합성입력은700ms 예약이며 실제시간측정이 아님. |
> | 미적용 실패정리 후보 | start예외 catch에서 actual _nd._dn 호출 뒤 같은 예외를 throw. 즉시count/nodes0, 기존timer·lateonended 중복회수guard 유지. 정상return/priority9/큐·dedup·RNG 불변. productionApplied=false/priorityPolicyAdopted=false. |
> | 전달·한계 | flush로 예외전달 시 큐정리행 미실행으로 해당fixture queue1 유지. 후보는 이별도계약을 바꾸지 않음. 합성WebAudio·수동timer source검수이며 실제장치/청취/게임 미검수. |

다음 Gate는 원총괄의 이 최소 실패정리 후보 검토·생산/docs 순차인수와 별도 허가된 실제장치/게임 검수다. 새업무/세션/메시지·Git·서버·UI·빌드·설치·파일삭제/이동/cleanup0. 외부skill/API/MCP는 이source경계에 필요 없어 사용0; 실제도구는 functions.exec/exec_command/apply_patch, Node fs/vm/crypto/Acorn, rg다.
