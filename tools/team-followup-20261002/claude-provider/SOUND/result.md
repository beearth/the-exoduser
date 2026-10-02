읽기 전용 검토를 마쳤습니다. 아래는 원문(game.html / game-easy-test.html) 기반 실제 사운드 backend 분기 추적 결과입니다. **어떤 파일도 쓰지 않았고(Read/Grep/Glob만 사용), 실제 재생·청취·런타임 PASS는 주장하지 않습니다.**

## 1. 실제로 읽은 파일·행

| 파일 | 행 | 확인한 것 |
|---|---|---|
| `tools/.../project-teams/SOUND/result.md` | 1–83 | 선행 소유 계약표(31검사/18그룹/84입력 요약) |
| `tools/.../project-teams/SOUND/evidence.json` | 1–635 | SHA·블록 라인·카운트(production writes 0) |
| `AGENTS.md` | 1–234 | 운영/권한 규칙 |
| `game.html` | 11766–11769 | `_activeNodeCnt`, `_MAX_ACTIVE_NODES=48/16`, `_SFX_MAX=2/1`, `_sfxQueue=[]` |
| `game.html` | 11778–11798 | `_sfxPri`(ghost_laugh→VOICE 9), `_evictLowest` |
| `game.html` | 11800–11839 | `_playSampleNow`(버퍼 없을 때 lazy load + 무음 return, 노드 수명) |
| `game.html` | 11840–11867 | `_sfxFrameReset`(프레임6/카테고리2 게이트, `_sfxQueue.length=0`) |
| `game.html` | 11883–11898 | `_sfxCat`(ghost_laugh 미매핑→키 자체), `_isSkillSfx` |
| `game.html` | 11899–11911 | `playSample`(30ms dedup → **그 뒤** backend pitch RNG, pri면 unshift) |
| `game.html` | 12004 | `_r`(caller pitch RNG) |
| `game.html` | 9721 | `sfxVol()=OPT.sfxVol/100` |
| `game.html` | 16629 | `_gxVolMul`(터렛 전용 뮤트) |
| `game.html` | 44314–44376 | `_boneRegister`, `registerBonePart`, `_grantOssuaryIfNeeded` |
| `game.html` | 15550–15555, 15675–15701 | `playItemPickupSfx`(6종 풀), `pickupItem` bonePart 분기 + 일반 분기 |
| `game.html` | 9753·10003·10010–10034·61677–61740 | `_sampleFiles`(ghost_laugh:10003), `_loadAudioBuffers`(부트 fire-and-forget) |
| `game-easy-test.html` | 14782–14801 | bonePart 분기 **main과 바이트 동일**, 일반 분기만 자동장착(+`playEquipSfx`)으로 상이 |

핵심 backend 함수 8종(`_boneRegister`·`_grantOssuaryIfNeeded`·`playItemPickupSfx`·`playSample`·`_playSampleNow`·`_sfxPri`·`_sfxCat`·`_r`)은 evidence.json SHA 기준 두 빌드가 **동일**합니다. 차이는 `pickupItem`/`mkItem`의 비(非)유골 구간뿐입니다.

## 2. 현행 계약 표 (id / 조건 / 분기 / RNG / 음원 / 노드 수명)

| id·이벤트 | 조건 | 실행 분기 | caller RNG | backend(큐 통과 시) | 음원·vol·pri | 노드 수명 |
|---|---|---|---|---|---|---|
| **정상 유골 등록** `_boneRegister`→true | `pts=(r||0)+(t||0)` > 기존 | notify + `playSample('ghost_laugh',.8,_r(1.2,.1))` → 조기 `return true`(가방·획득음 없음) | `_r` 1회 (rate 1.08~1.32) | `×(0.92+rnd×0.16)` 1회 → 0.9936~1.4256 | `sfx/ghost_laugh.mp3`, vol 0.8, `_sfxPri`=VOICE 9 **단 큐에는 pri 없이 push** | 단발, `onended`+`(dur+.5)s` 타이머 |
| **중복 부위 가방** `_boneRegister`→false | 기존 pts ≥ 신규, 가방 공간 성공 | `playItemPickupSfx(item)` 1회 + notify | 풀 index `~~(rnd×6)` 1회 + `_r` 1회 = **2회** | `×(0.92+rnd×0.16)` 1회 | 6종 풀(`pickup_item`/`pickup_rummage1~5`), vol 0.5, pri=기본 HIT 2 | 동일 |
| **거부(공간 없음)** | 가방 full | `INV.bag.pop()` + notify만 | 0 | — | 음 호출 0 | — |
| **네 부위 해금** | 세트 완성 전환 | 위 등록음 + addTxt/shake, **추가음 0** | `_r` 1회(등록과 동일) | 1회 | ghost_laugh 1회 | 동일 |
| **수동 등록** `registerBonePart` | 가방→도감 버튼 | 같은 `_boneRegister` 공유 → ghost_laugh | `_r` 1회 | 1회 | 동일 | 동일 |
| **유골함 자동지급** `_grantOssuaryIfNeeded` | 장착·가방 모두 미보유 | `mkItem('ossuary',0,EL.P,5)` 생성·장착, notify/recalcSt — **장착음·등록음 0** | mkItem 내부 약 41 | 0 | — | — |
| **playSample 공통 dedup** | `!pri`일 때 | `_sfxLastT[key]` 30ms 미만이면 `return`(**backend RNG 소비 전**) | — | dedup 통과 시만 | `_gxVolMul<1`일 때만 `vol*=`·`<0.01 return` | — |
| **`sfxVol()`(뮤트)** | `OPT.sfxVol=0` | playSample 전 구간 그대로 진행, `_playSampleNow`에서 `gain=min(1,vol×0)=0` | 정상 소비 | 정상 소비 | 노드 생성 | **무음 노드가 active 슬롯 점유** |
| **버퍼 미로딩** | `_audioBuffers[key]` 없음 | `_sampleFiles[key]&&!pending`→lazy fetch 시작, **무음 return**(노드 미생성, `_activeNodeCnt` 불변) | 이미 소비됨 | 이미 소비됨 | — | 노드 없음 |

**결정적 사실**: `playSample`의 30ms dedup과 backend pitch RNG는 **같은 함수 안에서 dedup이 먼저**입니다(11905 → 11907). 따라서 dedup에 걸리면 backend RNG는 소비되지 않지만, caller의 `_r`/풀 index는 인자로 **항상 먼저 평가**되어 소비됩니다.

## 3. 새로 찾은 반례와 영향

**반례 1 — 정상 등록음(ghost_laugh)이 노드·프레임 포화에서 영구 유실 (핵심).**
`_sfxPri('ghost_laugh')`는 VOICE 9지만, `_boneRegister`는 `playSample('ghost_laugh',.8,_r(1.2,.1))`를 **pri 인자 없이** 호출합니다(44326). 그러면 `_isPri=false` → `_sfxQueue.push`(normal, `q.pri` undefined). `_sfxFrameReset`에서:
- `if(_activeNodeCnt>=_MAX_ACTIVE_NODES && !q.pri) continue;` (11851) — 노드 48개(모바일16) 포화 시 **스킵**
- `if(!q.pri && _cnt>=_SFX_PER_FRAME) continue;` (11852) — 프레임 6개(모바일3) 초과 시 **스킵**
- 루프 끝 `_sfxQueue.length=0` (11863) → 스킵된 항목은 **다음 프레임으로 이월되지 않고 폐기**.

즉 VOICE 9 우선순위는 `_playSampleNow`의 `_evictLowest`에서만 의미가 있는데, **그 단계에 도달하기 전 프레임 큐 게이트에서 먼저 드롭**됩니다. 밀집 전투(타격음으로 노드 포화) 중 유골 등록 시 **진행 피드백(전대 수집음)이 통째로 사라질 수 있음**. result.md 52행("우선순위9는 일반 큐 bypass 플래그가 아니다")을 구체 재현한 것입니다.

**반례 2 — 같은 프레임 유골 2개: 2번째 등록음 30ms dedup으로 소실.**
서로 다른 부위 2개가 같은 프레임(또는 <30ms)에 성공 등록되면 둘 다 `ghost_laugh` 키. 1번째는 `_sfxLastT['ghost_laugh']` 설정·큐 적재, 2번째는 `playSample`에서 `now-lt<30 → return`. 결과: notify는 2회(시각상 둘 다 등록), **ghost_laugh 음은 1회**, caller `_r`은 2회 소비·backend RNG는 1회. "부위 2개 먹었는데 웃음소리 1번"이 의도인지 미확정(UNKNOWN).

**반례 3 — 일반 아이템 + 중복 유골 가방: 같은 풀 키 충돌로 한 쪽 무음.**
둘 다 `playItemPickupSfx`(동일 6종 풀). 두 획득이 <30ms에 **같은 풀 키**를 뽑으면(확률 1/6) 2번째가 30ms dedup으로 드롭 → 2연속 획득인데 사삭음 1회. 다른 키면 각자 카테고리(`_sfxCat`=키 자체)라 `_SFX_MAX=2`·프레임6 모두 통과. (정상 등록 ghost_laugh는 풀과 키·카테고리가 달라 이 충돌과 무관 — **정상 등록음과 중복 가방음은 원천적으로 다른 키**.)

**반례 4 — 뮤트(OPT.sfxVol=0)는 RNG·노드 예산을 아끼지 않음.**
`playSample`는 `sfxVol()`을 보지 않습니다(터렛 `_gxVolMul`만 조기 return). 따라서 뮤트 상태에서도 dedup·backend RNG·큐·`_playSampleNow` 노드 생성이 그대로 일어나고 **gain 0의 무음 노드가 active 48슬롯을 점유**, 다른(역시 무음) 노드 eviction까지 유발. RNG 스트림은 비뮤트와 동일.

**반례 5 — 첫 등록 무음 가능성.**
`_loadAudioBuffers`는 부트에서 `void`로 비동기 preload(동시 4, `setTimeout 0` 양보)만 걸고 **await 안 함**(61740). 첫 유골 pickup이 ghost_laugh 디코드 완료 전이면 `_playSampleNow`가 무음 return. 이때 preload worker가 `_audioLoadPending['ghost_laugh']=true` 상태면 lazy fetch도 스킵되어 그 호출은 완전 무음(caller/backend RNG는 이미 소비). 다음 호출부터 정상. `sfx/ghost_laugh.mp3` 파일 실제 존재/404 여부는 **UNKNOWN**(fetch·디스크 확인 안 함).

## 4. 최소 미적용 제안 / 보류 이유

**제안(미적용·후보)**: 등록 피드백을 긴급 큐로 보장하려면 `_boneRegister`의 호출을 `playSample('ghost_laugh',.8,_r(1.2,.1),1)`처럼 pri=1로 올리는 것이 최소 변경 후보입니다. 그러면 `unshift`(긴급 큐)로 프레임/노드/카테고리 게이트를 우회하고 `_playSampleNow`의 `_evictLowest(9)`에 도달해 포화 시에도 하위 노드를 밀어내고 재생됩니다.

**보류 이유(자동채택 안 함)**: `playSample`에서 `_isPri=true`는 **30ms same-key dedup까지 동시에 비활성**합니다(11904–11905). 즉 pri=1 하나로 "포화 보호"와 "같은 키 30ms 억제"가 **결합**되어, 반례 2의 2번째 ghost_laugh가 이제 둘 다 재생(backend RNG 2회)되는 **RNG/동작 변화**가 생깁니다. 따라서 단일 pri 플래그로는 두 요구를 동시에 만족할 수 없고, 이는 설계 결정(총괄 지정)이 필요합니다. 새 전용 키/파일/볼륨/카테고리는 임의 결정하지 않습니다. 최소 integration contract로 다음을 **질의**합니다:

1. 유골 등록 피드백을 포화에서 보호할 것인가? (예 → pri 경로 필요)
2. 보호 시 같은 프레임 중복 부위의 등록음을 억제 유지할지 동시 재생 허용할지 (현재 pri 경로는 억제가 풀림)
3. 보호 대상 범위: 월드 pickup만 / 수동 `registerBonePart` 포함 / 둘 다 (`_boneRegister` 공유이므로 자동 둘 다 적용됨)

세 항이 확정되기 전에는 patch/연결 0으로 보류합니다.

## 5. 다음 fixture 1개 (입력·예상)

**목적**: 반례 1(포화 시 등록음 유실)을 소스 함수 추출로 재현.

- **입력(합성)**:
  - `_activeNodeCnt = _MAX_ACTIVE_NODES`(=48; 데스크톱)로 선(先)포화. `_audioBuffers['ghost_laugh']`=더미 AudioBuffer 존재(로딩 완료 가정), `OPT.sfxVol=100`, `_gxVolMul=1`, `_sfxLastT` 비움.
  - 한 프레임 내: 성공 등록 1건 → `_boneRegister(item)` 호출(= `playSample('ghost_laugh',.8,_r(1.2,.1))`) 후 `_sfxFrameReset()` 1회 실행.
  - `_playSampleNow`·`actx`·`mbus`는 노드 생성 호출만 카운트하는 스텁으로 대체(실제 오디오 0).
- **예상 결과**:
  - `playSample`는 큐에 `{key:'ghost_laugh', pri:undefined}` 1건 push (caller `_r` 1회·backend RNG 1회 소비).
  - `_sfxFrameReset`에서 `_activeNodeCnt>=48 && !q.pri` → `continue` → `_playSampleNow` 호출 **0회**, 프레임 끝 `_sfxQueue.length=0`으로 **영구 폐기**.
  - 대조군: 같은 입력에서 `playSample(...,1)`(pri=1)이면 `unshift`로 게이트 우회·`_playSampleNow` 1회 호출(`_evictLowest(9)` 성공) → 재생 1.
  - ⇒ 현행에서 포화 시 등록 피드백 0, pri 경로에서 1 — 유실을 수치로 증명. (실제 WebAudio 재생/청취는 미포함.)

## 6. 필요한 docs 정정 항목

`docs/6사운드디자인/6사운드디자인.md`(사운드 SSOT)에 다음을 **추가 제안**(총괄이 생산 반영 시 동기화):

- `ghost_laugh`는 `_sfxPri`상 VOICE 9이나 `_boneRegister`/`registerBonePart`가 **pri 없이** 호출하므로 등록음은 **일반 큐**로 들어가 프레임6/노드48 포화에서 드롭될 수 있음(우선순위 9는 큐 bypass 아님).
- 정상 등록음 = `ghost_laugh` vol 0.8 `_r(1.2,.1)`; 중복 부위 가방음 = `playItemPickupSfx` 6종 풀 vol 0.5 `_r(1,.05)` — **서로 다른 키·카테고리**.
- 뮤트(`OPT.sfxVol=0`)는 RNG·노드 예산 미절감(터렛 `_gxVolMul`만 조기 return). 무음 노드가 active 슬롯 점유.
- 등록음 backend pitch RNG는 30ms same-key dedup **통과 시에만** 1회(`×(0.92+rnd×0.16)`). 유효 범위 0.9936~1.4256.
- 유골함 자동지급은 월드 첫 pickup뿐 아니라 `draw` 시작 `_ossGrantChk` 가드에서도 `_grantOssuaryIfNeeded`로 발생(자체 음 없음). (인벤토리 문서 `2_7`의 유골함 "획득" 행에도 draw 보장 경로 보충 — result.md 71행 인계안과 동일.)

## 7. 실행/청취 미검수 한계

- 실제 WebAudio 재생·청취·클리핑/마스킹·잔향·stop 정리·노드 회수 **0**. 분기표는 원문 정적 추적입니다.
- 전체 게임 RNG 횟수(42/1/2 등)는 result.md의 **caller/등록측 대역**이며 backend pitch RNG·입력 생성 RNG는 별도. 전체 RNG0 주장 안 함.
- `sfx/ghost_laugh.mp3` 실제 존재/404, preload 완료 타이밍, 첫 pickup 무음 여부는 fetch·디스크 미확인 → **UNKNOWN**.
- fixture는 제안(설계도)일 뿐 **미실행**. 새 키·파일·볼륨·우선순위 자동채택 0, patch/생산 연결 0.
- 다른 Codex/Claude 담당의 공유 checkout을 보존했고 어떤 변경도 되돌리지 않았습니다. 결과 파일 기록은 총괄 CLI 출력에 위임합니다.
