# SOUND — ghost_laugh 큐 포화·RNG source fixture 인수

새 후속 한 건: **7대조 PASS/0 FAIL**, 고유 backend source 1개 실행. 본편/easy 추출 함수·상수 fingerprint 동일; 동일 source는 두 번 실행하지 않았다. 이전18그룹/84입력 및 정적31검사 재실행0. policyAdopted=false, productionApplied=false. **source fixture PASS ≠ runtime/visual/listening PASS**.

## 수신·읽기·실행 근거

| 단계 | 실제 근거 |
|---|---|
| 수신/최초 Read | 최신 총괄 메시지로 과제 수신, TASK.md 전문 cat exit0. 정확 메시지/첫 cat 시각은 없어서 추정하지 않았다. 실제 경로·목록 관찰 2026-10-02 13:31:12.695 KST; TASK 외 파일은 없었다. |
| 실제 checkout/소유 | realpath가 지정 checkout과 codex-half/SOUND 경로와 일치. 쓰기 파일은 checks.mjs/result.md/evidence.json 3개뿐. TASK/원후보/공유 docs/생산 파일은 보존했다. |
| 선행 인수 | AGENTS·사운드 SSOT·유골 등록·project-teams 31정적검수·claude-provider 읽기 검토 완료. Claude는 성공 Read/논리 반례 제출이며 fixture/청취 실행 근거가 아니다. |
| 실행 | Node v24.15.0 전체 경로, 2026-10-02T04:35:35.392Z→2026-10-02T04:35:35.540Z UTC. 실제 source 함수 실행과 명시 대역으로 결과를 분리했다. 정확 read SHA/시각·입력·trace는 evidence.json. |
| HEAD/Changes | 이번 TASK는 Git 명령0을 지정한다. 현재 HEAD/Changes는 독립 미조회(null); 이전31검수의 역사 HEAD 96610b6546a31e882962470ea1f2164ce94edca6, 당시 완료 Changes 54를 현재 상태로 쓰지 않는다. |

## 실제 source와 양판 동일성

| source ID | 본편 시작행 | easy 시작행 | 추출 SHA256 | 양판 |
|---|---:|---:|---|---|
| _boneRegister | 44315 | 42952 | be4d703b137804a12acc3264e81ccb02be3ab606e710a18f19b64a568cdbc20f | 동일 |
| _r | 12004 | 11408 | a2ae931f0268caf75ddb17d752c77cd32960a6cf59eac23be2db7dc76dda8ab3 | 동일 |
| playSample | 11899 | 11303 | 4305df5cdb884bda6cfe83fc670852d5d7a3d02937e4087ea3f59eebaff6bc79 | 동일 |
| _sfxFrameReset | 11840 | 11244 | a1e9ed017b19ea9adb736eaa53ff9f1b9f548db8b14763ed7068854a54705370 | 동일 |
| _sfxPri | 11778 | 11182 | ddb3b9c901afd6dca96d917fb79dbcd164ed802b4dfea2287394c23c253738d5 | 동일 |
| _sfxCat | 11883 | 11287 | b46865084a6cd213875c288681d8ddc3bd6f72446e604778c9ec9713c2695e8b | 동일 |
| _isFootstepSfx | 11777 | 11181 | d3f6179e260c9264ff417dc356f789044609d495d7f9d8a70f3ce01be882f853 | 동일 |
| _isSkillSfx | 11897 | 11301 | 1eb9ed929a4b063ee1f8f7f418a8ba92a771149482be8d3eb2ef8eb8f1d1f73a | 동일 |
| _MAX_ACTIVE_NODES | 11767 | 11171 | 7fc65f673a1f32ef796b08234996170426b4e5c133f37aa43452143a63ff4267 | 동일 |
| _SFX_MAX | 11768 | 11172 | 409644afebe7967ebe57352442c4a6f0080359debd5d948c8b93e55845781470 | 동일 |
| _SFX_PER_FRAME | 11770 | 11174 | 74b8f6406e429a980e5ba25120e30f4b8a23df18c60a945998f79759083745b9 | 동일 |
| _SFX_PRI | 11772 | 11176 | 3d026a723da2d9ff5693b3f8486f2a8790854f0a43f84313ffc40d6836e5e965 | 동일 |
| _SKILL_SFX_KEYS | 11896 | 11300 | e2b7bd8e642492759d2ac39c2cab43f6f932bda35f7061269f41effaaaf71271 | 동일 |

생산 전체 파일 SHA는 evidence.json에 기록한다. 원문 추출은 Acorn AST이며 HTML 부트·서버 import 없이 최소 함수/관련 상수만 VM에서 실행했다. _r 계측 래퍼는 추출 원함수를 호출해 실제 Math.random 소비를 보존한다. 결정적 RNG [0.25,0.75,0.5,0.125] 순환, synthetic clock 100ms/120ms; 각 대조는 큐·노드·도감·dedup 기록이 비어 있는 새 context다.

## 대조 결과 — desktop48노드/프레임6/30ms

priority 열은 node priority/queue pri/flush 전 ghost 위치이며 0부터 시작한다. caller/backend RNG는 ghost 등록 구간만, 준비 RNG는 별도다. 도달은 _playSampleNow 호출 대역에 도달한 횟수이고 audible 횟수가 아니다.

| id / 한글명 | active/앞선큐 | priority/queue pri/위치 | caller/backend RNG | 준비 RNG | notify/save 호출 | ghost/전체 backend 도달 | flush 후 큐 | 결과 |
|---|---:|---|---:|---:|---:|---:|---:|---|
| baseline / 정상 기준 | 0/0 | 9/0/0 | 1/1 | 0 | 1/0 | 1/1 | 0 | PASS |
| nodes48-current / 노드48 포화·현행 | 48/0 | 9/0/0 | 1/1 | 0 | 1/0 | 0/0 | 0 | PASS |
| frame6-current / 앞선 일반큐6·현행 | 0/6 | 9/0/6 | 1/1 | 6 | 1/0 | 0/6 | 0 | PASS |
| nodes48-pri1 / 노드48 포화·메모리 pri1 | 48/0 | 9/1/0 | 1/1 | 0 | 1/0 | 1/1 | 0 | PASS |
| frame6-pri1 / 앞선 일반큐6·메모리 pri1 | 0/6 | 9/1/0 | 1/1 | 6 | 1/0 | 1/6 | 0 | PASS |
| dedup20-current / 20ms 간격 성공등록2·현행 | 0/0 | 9/0/0 | 2/1 | 0 | 2/0 | 1/1 | 0 | PASS |
| dedup20-pri1 / 20ms 간격 성공등록2·메모리 pri1 | 0/0 | 9/1/0,1 | 2/2 | 0 | 2/0 | 2/2 | 0 | PASS |

노드48/프레임6 포화에서 현행 ghost는 caller/backend pitch RNG를 이미 소비하고 큐에 들어갔지만 flush 단계에서 backend 도달0, 큐0으로 폐기된다. VOICE9는 queue bypass가 아니다. 메모리 pri1은 unshift로 앞에 들어가 gate를 우회하여 backend에 도달한다. 프레임 대조에서는 ghost와 일반5개가 도달하고 앞서 준비한 여섯 번째 일반 키는 이번 flush에서 제외됐다.

100ms와120ms의 서로 다른 부위 성공 등록2건에서 현행 caller RNG2/backend RNG1, pri1은 caller2/backend2다. 도감 등록2/notify2와 큐/backend 도달 수는 별개다. 포화 보호와 30ms dedup 해제가 pri 플래그에 결합돼 있어 정책을 자동 채택할 수 없다.

## 메모리 대조와 명시 대역

| 항목 | 실제/대역과 한계 |
|---|---|
| 메모리 변경1곳 | _boneRegister의 `playSample('ghost_laugh',.8,_r(1.2,.1))`→`playSample('ghost_laugh',.8,_r(1.2,.1),1)`만 바꿨다. exact fragment/원·대조 함수 SHA는 evidence.json. 생산 patch/정책/키/파일/볼륨 변경0. |
| 최소 입력 | 실제 _boneRegister가 받는 plain bonePart(iron_warlord/skull 또는 torso, rarity0/tier0/name)를 입력했다. mkItem/유골함 지급/가방/월드 caller는 이번 fixture에서 실행하지 않았다. |
| _silvertailVoiceKey | 명시 identity 대역. ghost_laugh는 앞선 source 검토에서 치환 미대상으로 확인됐지만 이번 전체 캐릭터 보이스 매핑은 실행0. |
| 도감/알림 | 실제 _boneRegister가 INV.ossCollect에 기록; ANC_ROSTER 1행 합성, _ossSetComplete=false 대역. notify 카운트 대역, _T/_L/_rarName 표시 대역. 해금·UI 실행0. |
| 저장 | _boneRegister에는 dbSaveForce 호출이 없어 모든 대조 save0. 이 값은 pickupItem의 저장 성공/실제 디스크 저장0이라는 일반 주장이 아니다. 저장 helper는 호출 기록 대역이다. |
| backend/AudioContext | _playSampleNow는 인수 기록만 하고 active 노드를 변경하지 않는 대역. actx는 currentTime(clock/1000) plain object, _actx=null. 버퍼는 준비됨 가정만; 파일/디코딩/실노드/eviction/컴프레서/수명 실행0. |
| 과장 정정 | headless 제안의 pri1→eviction 성공/재생1 표현을 이번 결과로 확정하지 않는다. 인수한 것은 backend 도달1이며 동일 priority9 노드 포화·load failure 등 실제 재생 Gate는 남아 있다. |

## docs 계약·한계 동기화안

코드 산출 뒤 docs 전체 관련 키워드를 rg 검색했다: 107행/52파일, 목록·정확 명령·출력SHA는 evidence.json. 공용 docs/보호2_3 수정0. 총괄에 아래 절을 사운드 SSOT 추가안으로 인계한다.

> ### ghost_laugh 등록 큐 포화·dedup — source fixture 인수
>
> | id / 수치 | 현행 계약과 검수 |
> |---|---|
> | _boneRegister / ghost_laugh | caller vol0.8, _r(1.2,0.1), explicit queue pri 없음. node priority VOICE9라도 desktop active48 또는 앞선 일반큐6 조건에서 flush 후 backend 호출0·큐0. |
> | 30ms same-key dedup | clock100/120ms에 성공등록2건은 caller RNG2/backend pitch RNG1. 도감/notify는2건. 메모리 pri1 대조는 backend RNG2로 바뀐다. |
> | 미적용 pri1 대조 | 같은 caller fragment에 pri1만 메모리 추가: 포화 gate bypass/backend 도달. 실제 노드 eviction·audible 보장 아님. policyAdopted=false/productionApplied=false. |
> | 근거 범위 | 양판 동일 source backend 1개·7대조. _playSampleNow/AudioContext/저장/표시는 명시 대역, source fixture PASS ≠ runtime/visual/listening PASS. 모바일·전체게임 RNG·전수 혼합·실청취/패키지 미검수. |

현재 채택0을 유지한다. 총괄의 포화 보호·dedup 유지/허용·월드/수동 등록 범위 결정, 허용 QA 단독 실노드/청취·저장·패키지 인수가 남는다. 새 작업·메시지·세션·하위팀·cleanup·삭제·Git·서버·실게임·UI·빌드·생성·인코딩0.
