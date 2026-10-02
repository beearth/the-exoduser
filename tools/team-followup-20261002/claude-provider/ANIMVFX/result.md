모든 소스 근거를 확인했습니다. 실행/재현을 수행하지 않고 Read/Grep만으로 검토한 결과입니다.

---

# ANIMVFX 후속 검토 — idle 큐 성공 후 walk 큐 실패 (읽기 전용)

## 1. 소스 근거 (실제 Read 위치·식별자)

읽은 파일: `tools/.../ANIMVFX/{task.md,result.md,evidence.json,checks.mjs}`, `AGENTS.md`, `game.html`(5028–5257, 51940–52009), `game-easy-test.html`(4807–4854), `docs/8.0몬스터디자인/몬스터_스킨_렌더링_파이프라인.md`(31–69), `img/atlas_ch1_8dir.json`·`img/atlas_ch1_8dir_walk.json` 머리부.

핵심 원문 (game.html, easy-test 동일 로직):

- **큐 용량 게이트** `_queueEnemy8DirInstanced` — `game.html:5029` `if(bucket<0||bucket>=_ENS8_GL_GROUPS||!img||_ens8GLTotal>=_ENS8_GL_MAX)return false;` / `game.html:5030` `const _cnt=_ens8GLCounts[bucket];if(_cnt>=_ENS_GL_MAX)return false;` (easy: `4683`, 기존 evidence queue slice SHA 양쪽 동일 `acbf8ebf…`).
- **idle 성공이 게이트, walk 반환은 무시** — `game.html:5187` idle 큐 `&&_queueEnemy8DirInstanced(_bucket,…)` 성공 시 블록 진입 → `5191` `if(_mW&&_mW.ready)_queueEnemy8DirInstanced(8+_bucket,_mW.img,…)` **반환값을 받지 않음** → `5193` `e._ensGLMode=1;` **무조건 설정**. easy-test 동일: `4846`(walk), `4848`(`_ensGLMode=1`).
- **상수** (driver/SSOT 기준): `_ENS8_GL_MAX=1024`(전역), `_ENS_GL_MAX=512`(버킷), `_ENS8_GL_GROUPS=16`, idle 버킷 0–7 / walk 버킷 8–15. SSOT `몬스터_스킨_렌더링_파이프라인.md:63` "본체 512 + walk 512 = 1,024".
- **2D 본문 분기** — `game.html:51956` `let _eDrew=!!_ensGLQueued;`, `51969` `if(_a8){` (현행, guard 없음), `51981` idle `drawImage`, `51982–51983` walk `drawImage`(`e._isMoving&&_mHasW && _mW&&_mW.ready`로 게이트). easy body slice SHA 양쪽 동일 `44855da4…`.
- **후보 guard** (result.md §6, patch SHA 기존기재 `8771cd8b…`, 미적용): `if(_a8){` → `if(_a8&&!_ensGLQueued){`.
- **SSOT 계약** `:35` "성공 시 e._ensGLMode=1, Canvas 본문 중복 렌더 방지", `:69` "배치가 거절되면 `e._ensGLMode`를 세우지 않아 Canvas 8방향 본문이 그대로 렌더됨".

> SHA는 기존 evidence.json 기재값을 인용한 것이며 **이번에 현행 SHA를 재검증하지 않았습니다**(총괄 단계).

## 2. 57 하니스가 놓친 경계

`checks.mjs:133` `_ENS8_GL_MAX=options.capacity??1024`, `:221` `'capacity-full':{capacity:0}`, `:154` `_getTex(img){return img}`, `:137` `ens=[inputEnemy]`(단일 적).

- `capacity:0` → `5029`의 `0>=0`이 **idle 큐 자체를 거절** → `_ensGLMode=0` → 전면 2D 폴백만 검사(`:225–227`). **idle 성공·walk 거절 경계(`capacity:1`)는 미검사.**
- 단일 적 fixture라 **여러 적 누적으로 `_ens8GLTotal`이 1023에 도달하는 자연 경로를 모델링하지 않음.**
- `_getTex`가 항상 img 반환 → **draw 단계 텍스처 업로드 실패를 모델링하지 않음.**
- `hound-no-walk`/`idle-only`는 walk 큐를 **애초에 호출하지 않는** 경로(§T3)이지 "호출했으나 거절"이 아님.

## 3. 조건별 원문 trace / 기대 fallback (실행하지 않음 — 원문 추적)

| id | 한글명 | 발생 조건 | 현재(미적용) 분기 | 후보 guard 적용 시 영향 | 기대 행동 |
|---|---|---|---|---|---|
| T1 | 전역용량 잔여1 | 이 이동 적 idle 큐 직전 `_ens8GLTotal===1023`. idle `5029` `1023>=1024`=false→성공, 총계 1024. walk `5191`→`5029` `1024>=1024`=true→**false(무시)**. `5193` `_ensGLMode=1` | `51969 if(_a8)` 실행 → 2D idle+walk 그림 (walk 오버레이 **유지**, GL idle과 중복=D2) | `!_ensGLQueued`로 2D 전체 skip → **GL idle만, walk 오버레이 누락**(경계 적 1마리, 다리 애니 정지 포즈) | walk 오버레이가 유지돼야 함(GL walk 실패 시 최소 2D walk) |
| T2 | walk버킷 포화 | walk버킷(8+_bucket) `_cnt>=512`인데 idle버킷(_bucket)은 여유 | — (아래 반례) | — | **도달 불가 추정**(§4) |
| T3 | walk 미준비 | `!e._isMoving` / `_idxSet.has(_mIdx)`=false(hound idx25) / `_mW.ready`=false | walk 큐 **미호출**(`5189`/`5191`), `_ensGLMode=1`. 2D도 `51978/51983` 동일 게이트로 walk 미출력 | 2D skip되나 2D도 walk를 안 그렸을 것 → **추가 손실 없음** | idle만 — 정상(설계상 hound/미로드) |
| T4 | draw 실패 | prep에서 `_ensGLMode=1` 설정 후 draw `5053` `_getTex` null → 그 버킷 `continue`(미출력) | 2D 본문이 여전히 그림 → 적 **보임** | 2D skip → 해당 방향 버킷 idle+walk 모두 소실 → **적 본체 소실 위험** | 텍스처 업로드 실패 시 본체가 사라지면 안 됨 |

## 4. 논리 반례·불확실성 (실행하지 않은 논리 추적)

- **T2 도달 불가 — 논리 반례 후보:** prep 루프는 이동 적마다 idle(_bucket)→walk(8+_bucket)를 **동일 보조로 채움**. 비이동·hound는 idle 버킷에만 가산. 따라서 임의 방향의 `walk버킷 count ≤ idle버킷 count`. walk버킷이 512에 도달하려면 idle버킷 ≥512 → `5030`에서 idle도 거절 → `_ensGLMode=0` → 정상 2D 폴백. **fill 순서가 바뀌면 재검토 필요.** (미실행, 채움 순서 추론)
- **T4 심각도:** 단일 스레드 한 프레임 내 prep→draw 사이 GL 컨텍스트 소실은 비현실적이나, **버킷 텍스처 업로드 실패(`_getTex` null)** 는 현실적 경로이고 하니스가 stub으로 가려 미검출. 실제 GL 텍스처 수명은 QA Gate.
- **T1 실제 빈도:** 뷰포트 컬링(`_vl..`) 하에 전역 1023 누적은 극고밀도에서만, 그 경계 적 **1마리의 1프레임 다리 오버레이**에 한정. 시각 영향은 작지만 실재하는 결함.
- 발 앵커는 메타데이터에 없어 **UNKNOWN 유지**, corpse fade 보류, 에셋 생성 0, 실게임/GPU 합성 추정 0. 이전 57검사 재실행·재현 PASS 합산 0.

## 5. 최소 후보 비교 (전부 미적용 — 문안만)

현행 후보(`!_ensGLQueued`)는 D2 중복은 제거하나 **T1·T4에서 본체/오버레이 소실을 새로 유발**. 권고: 생산 반영 전 아래 중 하나로 보강.

- **후보 B(권고) — 동일객체 rollback:** walk 큐가 거절되면(반환 false) **같은 적의 idle 큐를 되돌림**(`_ens8GLCounts[_bucket]--; _ens8GLTotal--; _cnt===0이면 _ens8GLImgs[_bucket]=null`) 하고 `_ensGLMode`를 세우지 않음 → 해당 적만 깨끗한 2D 폴백(idle+walk). 핫패스에 rollback 몇 줄 추가. T1 해소, T4는 별도(draw 실패는 prep에서 알 수 없어 미해소).
  - 문안: `const _wq=(e._isMoving&&_a8.walkDirs&&_wm&&_wm._idxSet&&_wm._idxSet.has(_mIdx)&&_mW&&_mW.ready)?_queueEnemy8DirInstanced(8+_bucket,…):true; if(!_wq){/* idle rollback */} else { e._ensGLMode=1; … }`
- **후보 A — walk 성공까지 _ensGLMode 게이트:** walk 반환을 받아 실패 시 `_ensGLMode` 미설정. 단 **이미 큐된 GL idle이 draw에 남아** 2D idle과 이중이 되므로 idle rollback이 반드시 동반돼야 함(사실상 B와 동일 필요).
- **보류(현행 후보 그대로):** T1을 "1024 경계 1마리 1프레임 다리 정지"로 문서화하고 수용. 단 **T4(본체 소실)** 가 미해소라 권고하지 않음.

하니스 보강 제안(미작성): `capacity:1` fixture(T1 재현), `_getTex` null 버킷 fixture(T4 재현)를 57그룹에 추가해 "idle 성공·walk 거절" 경계를 명시 커버.

## 6. docs 정정 문안 (총괄이 생산 인수와 함께 반영)

- `docs/8.0몬스터디자인/몬스터_스킨_렌더링_파이프라인.md:35,69` — `:69`의 "배치가 거절되면 `_ensGLMode`를 세우지 않아" 는 **enemy 단위(idle 배치)에만 해당**하며, **idle 성공·walk 하위배치 거절 시에도 코드는 `_ensGLMode=1`을 설정**함을 명시. 이 경우 (후보 guard 적용 시) walk 오버레이가 GL·2D 모두에서 누락될 수 있다는 **경계 조건**과, 전역 1024/버킷 512 경계(`:63`)에서의 잔여1 거동을 추가. 현재/후보 상태를 "재현(원문 추적)·미적용"으로 구분 표기.
- `docs/5.1임펙트디자인/ANIMATION_VFX_TEAM_MASTER.md` 백로그 말미 — foot-shadow-anchor 후속 검토로 "idle 성공·walk 거절(T1 전역잔여1, T4 draw텍스처실패) 경계를 57하니스가 미검출, rollback 후보 B 권고, 미적용" 1행 추가.

## 7. 검수 Gate (미수행 명시)

- 생산 code+docs 통합·정확한 원격 SHA 인수·현행 SHA 재검증 = **총괄 단계**.
- 정규 GL 부팅에서 (a) 극고밀도 1024 경계 적의 walk 오버레이, (b) 버킷 텍스처 업로드 실패 시 본체 생존, (c) 중복 제거 후 합성/줌/흔들림/폴백/보행 프레임, (d) 발 접지 = **QA 실게임·시각 Gate**(미수행).
- 본 검토는 **원문·논리 추적만** 수행했고 실행/재현 PASS·시각/청취 인수·생산 적용은 **하지 않았습니다**. 발 앵커 UNKNOWN·corpse fade 보류·에셋 0 유지.
