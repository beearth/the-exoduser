# SOUND — 유골 획득 SFX 통합 계약 인수

2026-10-02 최신 `project-teams/SOUND/task.md`에 따른 독립 소유 문서 과제다. 작업 경로는 `/Users/fordeargamers/Projects/exoduser-migration-20261001`, 시작 HEAD는 `96610b6546a31e882962470ea1f2164ce94edca6`다. 같은 원격 ref 일치는 총괄의 전달 근거이며 이 팀의 원격 재조회0이다. 생산 연결0·생산 수정0·청취0·오디오 생성0·인코딩0이다. 원담당 제안의 실행/실측/전체 RNG0 표현은 완료 근거로 채택하지 않았다.

## 수신·Read·실행·산출의 구분

| 단계 | 실제 근거와 한계 |
|---|---|
| 이번 배정 | 총괄의 사용자 승인 전달과 새 task.md 전문 cat exit0. 최초 수신/첫 cat의 정밀 시각은 도구 출력에 없어 추정하지 않았다. 접수 기록 관찰은 2026-10-02 12:43:55.681 KST다. 이후 파일 Read·명령·검수 완료 시각은 evidence.json에 실제 UTC로 기록한다. |
| 선행 Read | AGENTS, 사운드 SSOT, 인벤토리 유골함/등록 계약, 원담당 읽기 제한, 기존 source 검수 원자료, 팀 행을 읽었다. 이번 최신 지시가 소유 폴더 산출·검수만 허용하며 원래 생산/게임/청취 제한은 유지한다. |
| 기존 원세션 | aa3ac0ed-f4e5-44ad-a0b2-d4d2da045b84: 마지막 제안 수신 10/02 02:28:41.105, Read 02:28:49.936, 완료 02:31:30.181 KST. 현재 원세션 과제의 수신/Read는 null인 기록이다. 실시간 창/프로세스 조회·재전송0; 기존 담당 동시 작업/종료를 추정하지 않는다. |
| 이번 실행 | checks.mjs의 새 정적 계약 감사31항목 PASS/exit0. 파일 SHA·AST·caller·기존 JSON·문서 계약을 감사한다. 실제 게임 helper/VM 실행0. 기존18검사를 반복하지 않는다. 정확한 시작·종료는 evidence.json의 execution을 따른다. |
| 소유 산출 | result.md, evidence.json, checks.mjs 3개. task.md는 총괄 소유로 수정0. 기존 prefix·공유 docs·Git 인덱스·사용자 데이터 수정0. |

## 기존 18그룹·84입력과 데이터 부작용

검수 원자료는 `tools/team-followup-20261002/integration-review/mkitem-sideeffects-evidence.json`과 `mkitem-sideeffects-tests.txt`다. 검수 시각은 2026-10-02 08:17:46.998 KST이며 이번 새 실행 시각과 구분한다. 본편 SHA는 `30ae8544524d7cd710383ebd10f4911bea3247e90b18a46c51c253e73ce9ba3f`, easy SHA는 `9c7c25c131f6175a464cffe2e981e946cf2a0af70ed04b969cc5292403799af8`다. 현재 파일과 일치하는지는 이번 static audit에서 확인한다.

7경로×양판×LCG seed 0/7/4294967295×demo false/true=84입력이다. 경로14그룹과 mkItem 대역/등록 피치 삭제 변이 검출4그룹으로 18그룹 PASS였다. 합성 P.lv=42·시계·인벤토리 조건이며 일반적인 모든 게임 상황의 난수 횟수가 아니다. mkBonePart의 입력 ID 생성 RNG1은 아래 pickup 구간과 별도다. playSample·저장·스탯/UI backend 내부는 실행하지 않았다.

| source ID / 한글 경로 | pickup RNG / 호출 | 데이터·저장 호출 계약 | 후보가 보존할 경계 |
|---|---|---|---|
| first_registration_actual_mkItem / 미보유 첫 등록 | 42 = mkItem41(직접37+rollAffixes4)+등록 `_r`1; ghost_laugh1 | 유골함 생성·자동장착·알림·recalcSt1, 도감 등록, dbSaveForce1 | 최종 고정 필드 전에 소비한 생성 난수를 제거/대역 처리하지 않는다. |
| equipped_registration / 장착 보유 신규 등록 | 1; ghost_laugh1 | mkItem0, 도감 등록, 저장 호출1 | 기존 유골함 재생성/재장착·추가음0. |
| bag_ossuary_registration / 가방 보유 신규 등록 | 1; ghost_laugh1 | mkItem0, 가방 유골함 자동장착0, 도감 등록·저장 호출1 | 보유 여부 검사와 가방 상태를 유지한다. |
| duplicate_lower_to_bag / 하위 중복 가방 획득 | 2 = pool 선택1+피치1; 일반 획득음1 | 기존 도감 보존, `_gx/_gy/_pickT` 기록, pickedUp/저장 호출1 | 등록음·획득음 중첩0. 새 후보 pool 선택 시 난수 계약이 달라진다. |
| duplicate_equal_full_refusal / 보유·동점·가방 가득 | 0; 음 호출0 | false, 가방/도감 보존, 저장 호출0 | 거부 전에 후보 재생 금지. |
| duplicate_missing_ossuary_full_refusal / 미보유·하위 중복·가방 가득 | 41; 음 호출0 | false여도 유골함 생성·장착·알림·recalcSt1 선행; 저장 호출0 | 전체 상태 무변화/RNG0 주장 금지. 이 순서의 정책 수정은 SOUND 소유 밖이다. |
| fourth_part_unlock / 네 번째 부위 등록 | 1; ghost_laugh1 | 도감 등록·해금 알림/addTxt/shake2·저장 호출1 | 해금 추가음0. |

`mkItem('ossuary',0,EL.P,5)`는 베이스/rollAffixes/임플리싯/소켓 난수를 먼저 소비하고 최종 유골함 값을 덮어쓴다. 최종명 전대의 유골함, rarity5/tier0/el=EL.P/unique=true, anc=iron_warlord, eDef60, bonusMp150, ancPow0.25, STR/DEX/INT/LCK/근성 보너스 삭제, affixes=[ancHP tier3 value0.9], `_iAncPow`10, reqLv0, socketCount2/crystals=[null,null], legendarySpecial/uniqueSpecial=null이다. itemLv/id 생성과 내부 rollAffixes 캐시는 소리와 별개의 생성 경로이며 후보 때문에 순서를 바꾸지 않는다.

## 실제 caller와 한 사건당 SFX 소유권

| caller / 적용 위치(본편·easy) | 현재 계약 | 전용 후보 통합 계약 / 상태 |
|---|---|---|
| R 단발·홀드 → pickupItem (`31664/31690`, `30481/30507`) | 두 성공 호출부는 picked/addParts/deathDrop만 처리하고 추가 SFX.pickup 호출 없음. 홀드는 누적9 기준이며 현재 주석150ms. | 월드 caller에 추가음을 얹지 않는다. addParts·입력/주변 RNG까지 기존84입력이 검수한 것은 아니다. |
| 펫 회수 → pickupItem (`40064`, `38864`) | 필터 통과품만 pickupItem 경유. 필터 미달은 분해+SFX.pickup 별도 경로이며 거부 후 저등급 분해 정책도 별도다. | 유골 등록/가방 성공과 분해를 같은 이벤트로 취급하지 않는다. 전체 펫 flow는 runtime Gate다. |
| pickupItem bonePart (`15675`, `14782`) | `_grantOssuaryIfNeeded` → `_boneRegister`; 등록 성공은 저장/true로 조기 종료. 중복은 공간 확보 성공 뒤 playItemPickupSfx1. 거부는 후보음0. | 등록과 가방 획득 중 무엇을 전용화할지 미확정. 하나의 성공 경로에 기존음과 후보음을 동시에 추가하지 않는다. |
| `_boneRegister` (`44315`, `42952`) | key=anc+'_'+part, pts=(rarity||0)+(tier||0). 기존 pts≥새 pts면 false. 성공에 `ghost_laugh`, vol0.8, `_r(1.2,0.1)`1회. | 등록 후보면 이 기존 1회 호출의 대체 지점이 최소 범위다. 새 키/파일/볼륨/정책은 아직 미확정이며 patch/연결0. |
| registerBonePart (`44335`, `42972`) | 가방 수동 등록도 같은 `_boneRegister`를 호출하며 성공 후 가방 제거·저장·UI 갱신. | `_boneRegister` 교체는 월드 획득뿐 아니라 수동 등록에도 적용된다. 월드 전용 요구라면 별도 이벤트 범위 결정 필요. |
| draw 시작 (`50086`, `48615`) | `_ossGrantChk` 가드 뒤 미보유 유골함을 보장 지급한다. 생성·장착·스탯 경로이며 자체 SFX 없음. | 실제 첫 pickup 전에 이미 보유할 수 있다. 기존42회 fixture를 실제 첫 획득 일반값으로 선언하지 않는다. |
| `_grantOssuaryIfNeeded` (`44368`, `43005`) | 장착/가방 유골함 보유면 return. 없으면 실제 mkItem 생성·장착. playEquipSfx/등록음 호출0. | 지급음 추가·장착 경로 변경0. 임의 RNG0/전체 무변화 보장 금지. |

## 음량·중복·pitch RNG·재생 수명 계약

| source ID / 한글명 | 현행 수치·공식 | 후보의 필수 통합 Gate |
|---|---|---|
| ghost_laugh / 유골 도감 등록음 | `sfx/ghost_laugh.mp3`, vol0.8, caller rate=`1.2×(1+(random−0.5)×0.2)` = 1.08~1.32. 같은 파일은 허수아비·전대 소환/공격에서도 사용한다. | 전역 파일 덮어쓰기는 다른 효과를 바꾼다. 후보 파일/id 미확정, 이번 파일 변경/재생0. |
| playSample / backend 피치 | 유효 큐 진입 시 caller rate에 `0.92+random×0.16` 추가. 등록 caller×backend rate 범위0.9936~1.4256. 일반 pickup은 caller0.95~1.05×backend0.92~1.08 = 0.874~1.134. | 기존84입력의 playSample은 대역이다. 42/1/2는 이 backend RNG를 포함하지 않는다. dedup/감쇠 return 후에는 추가 RNG 없음; 통과할 때만1회라는 소스 계약을 실제 오디오와 구분한다. |
| playSample / 동일 키 중복 방지 | ghost_laugh는 skill/footstep 키도 explicit pri도 아니므로 같은 키30ms 제한을 받는다. `_gxVolMul<1`이면 vol에 곱하고0.01 미만이면 return. | 새 키는 `_sfxLastT[key]`를 분리하므로 다른 ghost_laugh 이벤트와의 중복 억제/추가 RNG 통과율이 달라질 수 있다. 단순 키 치환을 RNG 보존으로 인수하지 않는다. |
| `_sfxPri` / 노드 우선순위 | ghost_laugh=VOICE9. generic pickup=기본 HIT2. `_sfxCat`은 두 키군 모두 키 자체다. ghost_laugh에는 실버테일 매핑/10초 voice 반복 제한 없음. | 우선순위9는 일반 큐 bypass 플래그가 아니다. 새 키를 미등록하면 기본 HIT2가 되므로 분류 Gate가 필요하다. |
| 큐·노드 제한 | 일반 프레임6/모바일3, 카테고리2/모바일1. active nodes48/모바일16; HIT3/모바일2, PROJ5/모바일2. 정상 등록 caller는 explicit pri 인자 없음. 처리 뒤 `_sfxQueue.length=0`으로 초과 항목을 다음 프레임에 유지하지 않는다. | 한 사건의 함수 호출1회는 실제 audible1회 보장이 아니다. 버스트/포화·같은 key 교전·일시정지/재진입에서 QA 확인한다. |
| `_playSampleNow` / 음량 | sample gain=`min(1,(volEff||1)×sfxVol())`; volEff는 caller vol과 적용된 감쇠/큐 volMul. 연결 대상 mbus에도 gain=sfxVol(). 그 뒤 EQ·master compressor를 거친다. | caller0.8/0.5를 최종 음압이나 청각 동등성으로 선언하지 않는다. 동일 장치·설정에서 클리핑/마스킹/연속 조작 청취 필요. |
| `_playSampleNow` / 수명·폴백 | AudioBufferSourceNode 단발(loop 설정 없음), rate||1. onended 정리와 `(buffer.duration||2)+0.5`초 timer 정리를 병행, `_d`로 중복 회수 방지. src/gain disconnect; 포화 교체는 stop+회수. | timer는 playbackRate로 보정하지 않는다. 후보 길이/낮은 pitch/끝 잔향/정리·노드 잔류 실검수 필요. 실제 duration·디코딩·노드 실행0. |
| 미준비 buffer | 기존 fetch/decode lazy load를 시작하고 그 호출은 무음 return. 중복 요청은 pending으로 억제. | 후보 연결 후 첫 획득 로드/404/오디오 중단과 정상 preload Gate 필요. 현재 존재·호출 검수로 첫 음 재생을 보장하지 않는다. |

## SSOT 동기화 제안 — 정확한 추가 문안

이번 소유 보고서는 현행 사실과 미적용 후보를 구분한 docs 계약표다. `docs/6사운드디자인/6사운드디자인.md`의 픽업/easy 차이 절 뒤에 아래 절을 추가하고, 인벤토리 문서의 유골함 획득 행에는 draw 보장 경로를 보충하도록 총괄에 인계한다. 후보 채택 상태/수치는 실제 생산 반영 시 함께 동기화하며 보호2_3 수정0이다.

> ### 유골 도감 등록·획득 음향과 난수 범위 — 2026-10-02 source 인수
>
> | id / 적용 위치 | 현행 계약 | 검수·한계 |
> |---|---|---|
> | `_boneRegister` / bonePart 도감 | pts=(rarity||0)+(tier||0). 기존 포인트보다 높을 때만 등록·`playSample('ghost_laugh',0.8,_r(1.2,0.1))`1회. 등록 성공의 일반 획득음0, 네 부위 해금의 추가음0. 수동 registerBonePart도 같은 등록음을 사용한다. | 양판 actual source18그룹·84입력 인수. backend 음 재생·실청취·실저장·패키지 미검수. |
> | `pickupItem` / 중복 유골 | 유골함 지급/등록 시도 뒤 기존이 같거나 높으면 가방행. 공간 성공에 일반6종 pickup 풀·volume0.5·caller pitch±0.05 한 번, 거부는 음/저장 호출0. | 미보유+하위 중복+가방 full이면 거부 이전 유골함 생성·장착/스탯 부작용이 있다. 전체 상태/RNG0 아님. |
> | `_grantOssuaryIfNeeded` / 유골함 생성 | 보유면 생성0. 없으면 실제 mkItem('ossuary',0,EL.P,5) 생성·자동장착. 지급 자체의 장착음/등록음0. draw 시작 `_ossGrantChk` 보장 지급도 같은 함수로 연결된다. | P.lv42/세 seed/두 demo의 미보유 첫 등록 pickup42(생성41+caller pitch1), 보유등록1, 중복가방2, 미보유 full거부41. 입력 mkBonePart ID RNG1은 별도이고 whole-game 값 아님. |
> | `playSample` / 등록음 backend | ghost_laugh node VOICE9이나 일반큐30ms dedup 적용. 통과 뒤 rate×(0.92+Math.random()×0.16). | source trace의 playSample은 대역이므로 내부 난수/실제 청취를 포함하지 않는다. 새 전용키/파일/음량·수명 미확정·생산 연결0. |

인벤토리 `docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md`의 유골함 `획득` 행 보충안: **“첫 유골 부위 pickup에서 미보유 시 자동 지급+자동 장착. 양판 draw 시작에서도 `_ossGrantChk` 가드로 `_grantOssuaryIfNeeded`를 호출하여 미보유 유골함을 보장 지급한다. 랜덤 드롭 풀·대장간 제작 제외는 유지한다.”** 기존 문구의 픽업 경로를 삭제하거나 첫 실게임 RNG42로 일반화하지 않는다.

## 미완료 Gate와 다음 인수

| Gate | 완료 조건 | 이번 상태 |
|---|---|---|
| 후보 계약 | 대상=등록/가방/월드 전용 중 확정, 기존 음 대체·단일 호출, key/파일/priority/category/dedup 정책·길이 확정 | 미확정; candidate.patch/신규 에셋/생산 연결0. |
| RNG·상태 | 실제 backend 포함 통과/30ms 차단·동시 ghost 이벤트를 비교하고 생성·등록·가방·저장 호출순서를 보존 | 이번 AST/기존 trace 인수만. whole-game RNG0 주장0. |
| 실청취·재생 수명 | 총괄 QA 단독 슬롯에서 첫/기보유·중복/거부·네 부위·수동 등록·펫/분해를 구분. 같은 장치/볼륨의 마스킹·클리핑·잔향·끝/stop/404·일시정지/재진입·노드 회수 검수 | UI/게임/재생/청취0. |
| 저장·패키지 | 실제 저장 ACK/재로드에서 도감/유골함/가방 상태 대조, 현행 코드·에셋 포함 고유 앱에서 동일 재생·노드 정리 확인 | dbSaveForce 호출은 기존 fixture 대역; 실제 저장/패키지 미검수. |

다음 인수는 총괄이 이 계약표와 evidence.json을 검토하여 **전용 후보의 대상 이벤트·키/중복 정책 한 건**을 지정하는 것이다. 이번 과제를 마친 뒤 새 작업/세션/지시를 생성하지 않는다. 변경 개수 시작23 및 중간/완료 값은 evidence.json에 기록하고, 공유 변경을 SOUND 산출로 계산하지 않는다.
