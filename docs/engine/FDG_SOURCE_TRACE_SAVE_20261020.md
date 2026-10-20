# 세이브·데이터 구조 원본 추적과 Godot 이식 순서안 — trace-save

작성: 2026-10-20 KST · 상태: **추적 문서 제출 / 제품 구현 아님** · 브랜치: `codex/trace-save-20261020`

## 0. 기준·소유·보호

| 항목 | 확인 결과 |
|---|---|
| 원격 기준 | 시작 시 `git fetch origin` 성공. `origin/main=788ba758f9f5c92564abacb2f2fce88a42af2c1a`에서 전용 worktree 생성 |
| 작업 위치 | `/Users/fordeargamers/exoduser-wt/trace-save` |
| 기준 체크아웃 R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`. 시작 tracked INDEX/WORK 각각 diff 없음. 브랜치 전환·커밋·파일 수정 없음 |
| 원본 대조 | R `game.html` blob `1869ca2397da78c63d482bc4be5bc4091ae7d80e`, 작업본 `e755a2d98211ac2a6b4a53d8a1e3e7abe4714400`. 차이는 L65 맵 스크립트 query와 L18407 pit_poison 메타 2행뿐이며 줄 증감 없음. **이 문서의 세이브 구간 바이트와 행 번호는 R·작업본 동일**. 맵 내용 동기화 완료를 뜻하지 않음 |
| index 원본 | R·작업본 blob 모두 `88b4940cd5870793e509942224532e06a4a80bdb` |
| 먼저 읽은 배정 기준 | `docs/engine/orders/WORK_BOARD.md`와 `docs/engine/FDG_GAME_DEVELOPMENT_PLAN.md`의 단계 표·작업표(P4 L35 / P4-001 L83). P4-001은 허용 범위 확정 전·미배정·HOLD 유지. 이번 작업은 사용자가 별도로 배정한 읽기/추적 작업 |
| 중복 회피 | P2-001l 레슨 입력·P2-006a 드랍/인벤 반입·P3-002 소환굴·P2-007a UI·QA-002·STARTER-REGIONS·FEATURE-INVENTORY 소유 파일을 수정하지 않음. 신규 모듈 경로는 아래 **후보**이며 소유권 확보·구현 배정이 아님 |
| 유일한 저장소 산출물 | 이 Markdown 1개. 최신 지시가 우선하므로 작업판·설계 docs·별도 REPORT·코드·테스트 수정 없음. Git 밖 `_out/trace-save/`에 검사 로그와 최종 DONE 영수증만 보존 |
| 보호 | **세이브 형식·기존 필드명·기존 마이그레이션·docs/2_3·Q/E = 보호**. 이 문서는 관측·동일 계약 이식의 순서 후보만 기록하며 보호 범위의 변경·수치 조정·신규 저장 버전·저장 초기화를 제안하지 않음 |
| 실행 범위 | 게임/서버 실행·재시작·빌드·Godot 전체 import·실사용자 저장 접근 없음. PC 실행·지정 실행판의 실제 source 경로·화면·재시작 복원은 **미확인** |

아래 `game:Lx–Ly`는 이 기준의 `game.html`, `index:Lx–Ly`는 `index.html`이다. Godot 주석의 옛 원본 행 번호는 현행 행으로 재검증해서 표기한다. `있음`은 파일/호출 존재, `구문 확인`은 check-only, `테스트 소스 확인`은 테스트의 assertion을 읽었다는 뜻이며 실행 PASS와 구분한다.

## 1. 원본 데이터·상수·함수·UI 추적

### 1.1 선언·런타임 객체와 저장 경계

| ID | 데이터·상수 / 원본 행 | 실제 구조·값 / 저장 경계 |
|---|---|---|
| D01 | `G`, game:16714–16718 | 파일 초기화 리터럴. 아래 부록 B에 전 키·초깃값. 저장은 이 객체 전체가 아니라 `game` 일부 + `hellCleared`만 선택. 런타임 map/rooms/존 상태/적/탄/바닥 드랍은 payload에 없음 |
| D02 | `P`, game:16719, `mkP()` 29016–29031 | `P=null` 후 constructor. HP350/ST200/MP160, 레벨1/경험치0/필요15/SP0/AP0, baseAtk8/baseDef2/speed2.6, rage0. 전체 리터럴은 부록 B. 저장 `player`와 루트 `skills/fused/active*`로 나뉨. 좌표·행동·무적·쿨다운은 저장 whitelist에 없음. **Q/E 필드는 보호** |
| D03 | `INV`, game:16174–16180 | `bag:[]`, `equipped` 17키, `selected:null`, `ossCollect:{}`. BAG_MAX300. `bag/equipped/ossCollect`만 저장, selected는 복원 시 null(3683) |
| D04 | 장비 키, game:15176,16176 | `weapon,shield,boots,armor,helmet,bow,gloves,pants,belt,necklace,ring1,ring2,cape,bracelet,headband,ossuary,headband2`. 이름을 바꾸지 않음. shield 문자열 **보호** |
| D05 | 아이템 `mkItem`, game:15894–16166 | `inv.bag`·`inv.equipped`는 아이템 통째 JSON 직렬화. 기본/동적 필드·affixes·prefix/suffix·implicit·legendarySpecial·uniqueSpecial·uniqueArt·itemLv/reqLv·enh·socketCount/crystals/socketQ·그리드/표시 flag도 직렬화 가능한 실제 own enumerable 값이면 포함. 고정 field whitelist가 아님. 15954–15956의 item 리터럴과 함수 내 field write는 부록 D에 전수 인덱스 |
| D06 | 창고, game:16258–16260,48521–48553 | `STORAGE={}`, STORAGE_MAX200. 실제 공유 `STORAGE[0]`; `_synced`·dirty는 런타임. payload는 항상 `storage:{}`. localStorage 배열 `hellcave_sharedStorage`가 별도 정본 |
| D07 | 유물·소켓석, game:15286–15288,15333–15334 | CRYSTAL_BAG_MAX9999/CRYSTAL_BAG=[]/CRYSTAL_DUST=0, STONE_BAG_MAX9999/STONE_BAG=[]. 저장 `crystalBag/crystalDust/stoneBag`. `q/socketQ` 1–100 복원 규칙은 아래 M09 |
| D08 | 퀵슬롯, game:27677–27686 | POT는 hp만. QSLOTS=[hp×1,빈칸×3], qsCooldown=[0,0,0,0], autoPotCd0, qsAuto=[true×4]. 저장 대상은 QSLOTS만. 폐지 UI 재도입 제안 없음 |
| D09 | 스킬 슬롯, game:27681–27682 | SKILL_SLOTS 6칸 null / ULT_SLOT=null. 저장 `skillSlots/ultSlot`; 1–4/Space/F 슬롯 복구는 44246의 `_repairAreaSkillSlot` 및 3880–3907 |
| D10 | 성장 객체, game:27696–27728,27894,28070–28071 | STATS={str,dex,int,vit,lck:0}; STAT_MAX 각500; PASSIVES는 PASSIVE_DEF의 26키를0으로 초기화; `_grit=0`; UPGRADES hp/atk/def/mp/st/spd=0; POT_LV={hp:0}. 모두 별도 payload 필드. 패시브 예약 `_passiveQueueItems` 51219–51220은 known key만, 최대260 |
| D11 | 저장 조정 상태, game:3453–3461,3948,3968 | `_charId/_charName/_dbReady/_saving/_autoSaveTimer/_lastSaveTime/_saveDebounce/_pendingForce`는 payload 외 실행 조정값. `dbSaveNow.pending`도 메모리 owner 요청 |
| D12 | 경로 선택, game:3440,3463,16646,63867–63896; index:1258 | `_isTestMode`는 test=1 엄격 비교, `_EDITOR_MODE` 별도. `EXODUSER_BUILD_TARGET` 기본 demo. 에디터→ForgeLab→DEMO→일반 local/cloud/web 순서. `?char=`만 보고 클라우드 저장이라고 판정하면 안 됨 |
| D13 | 스테이지/기록 시간, game:32742,3731 | stageTime/playTime은 `+sp` 게임 틱. payload는 playTime만 저장, stageTime은 저장하지 않음. clearRecords의 `{si:{t,s,r}}`는 별도 클리어 기록. ms 저장 타이머와 게임 틱을 혼동하지 않음 |

### 1.2 다섯 직렬화 생산자와 저장·로드 경로

| ID | 함수·구간 | admission / 대상 / 성공 시각 / 복원 |
|---|---|---|
| S01 | 기본 `dbSave`, game:3533–3585 | QA early return, parryLesson.active return(**보호**), charId/dbReady/saving/P 가드. sanitize→공유 악의/dirty창고 flush→payload→`characters.update({data,updated_at}).eq(id).select(id)`. 요청 id와 일치하는 정확1행만 `_lastSaveTime`. finally 상당 꼬리에서 pending drain/force |
| S02 | `dbLoad`, game:3588–3594 / `startGameFromDB` 62443–62564 | id 조회·이름 읽기. SDK·인증·dbLoad 성공을 확인한 뒤 mkP/reset/restore. 실패를 새 캐릭터로 대체해 자동저장하지 않음. 생성 메타만 있는 객체는 유효 신규 슬롯 |
| S03 | local `dbSave` override, game:63892–63941 | local게스트 또는 test=1, slot URL 없으면 t1, `_serverOk` null/true/false. P/saving 가드, 공유 flush→`POST /api/save {slot,data}`. HTTP non-ok 시 localStorage `hellsave_<slot>` 폴백. 응답 j.ok 또는 실제 localStorage write 후 성공 시각. throw 경로의 정적 범위 문제는 §2 별도 기록 |
| S04 | local load, game:63944–64044 | mkP/reset→GET `/api/load/<slot>`→있으면 dbRestore. `_foundSave`는 player 없는 메타도 true이므로 오래된 LS 사본을 우선하지 않음. 서버 복원 성공 시 `/api/mats` 동기화. 없을 때만 `hellsave_<slot>` 로드. 미복원 시 신규 장비·가방 생성→applyStats→initStage→dbReady/auto/3초 부트 저장 |
| S05 | web `dbSave` override, game:64054–64093 | `_LS_KEY='hellsave_web'`; P/saving 가드, shared flush, localStorage JSON. 쓰기 성공 때 시각. finally drain/pending |
| S06 | web load, game:64094–64160 | reset→LS parse→dbRestore→빈 장비 보충; 없으면 신규 생성. applyStats→initStage→dbReady/auto/3초 저장 |
| S07 | 일반 데모 `_startDemoNew`, game:62111–62214 | key hellsave_demo, override 62128–62163. P 가드만 있고 기본 cloud admission/sanitize와 동일하지 않음. ts 포함, game.mats는 G.mats. dbRestore 후 신규에만 기본 장비·시작 슬롯, iceOrb 후처리, applyStats 뒤 HP/MP/ST 충전→initStage→auto/3초 저장 |
| S08 | Lv500 데모 `_startDemoTest`, game:61936–62093 | key hellsave_demo500, override61993–62021. 일반 데모와 다른 payload/정책. 62023–62052는 **dbRestore를 호출하지 않고** SP/AP/예약·자원·패시브·스탯·슬롯·일부 active·강화·stage/mats/hellCleared만 선택 복원. AP 최소100. 장비/스킬/합체는 초기값 유지. 부록 C의 생략 필드를 의도 없이 추가하자는 제안 없음 |
| S09 | 부트 분기, game:63867–63893 | editor는 맵만; ForgeLab는 testchar; DEMO는 `_dLv500` 힌트가1이면 제거 후500, 아니면 일반 데모. 이후 일반분기. **현재 실제 사용 중 빌드 target/URL은 미확인** |

모든 payload의 고정 루트/`player`/`inv`/`game` 필드는 부록 C에서 **원 표현식·다섯 생산자별 행**으로 대조한다. 버전 필드는 `gritCostModeV2:1`이며 전역 save schemaVersion 선언은 이 다섯 payload에 없다. 임의 신규 마커를 제안하지 않는다.

### 1.3 공용 복원과 마이그레이션 순서 — 전 구간

| ID | 원본 행 | 순서·읽기/쓰기·경계 (전부 보호·관측만) |
|---|---|---|
| M01 | 3597–3608 | `_restoreExpProgress`: maxExp=pd.maxExp\|\|15; lv<1000 또는 유한양수면 기존값, 그 외 `_calcMaxExp(lv)`와 exp 하한0. dbRestore는 !d false→charIdx 유효정수/범위 확인·atlas 선택→!player false. player가 없어도 외형 선택은 먼저 수행 |
| M02 | 3610–3626 | lv/exp/maxExp·초월날짜/횟수·보스AP·여신선물→SP/AP 저장값 그대로→passiveQueue 배열/아니면[]→baseAtk/baseDef/rates→현재·최대 자원·speed·shield→rage0→maskOn/atlas. `\|\|`로 0이 fallback 되는 의미와 현재 자원 대입이 cap 대입보다 앞서는 순서도 원본 그대로. `_lvStatMigrated`는 저장만 있고 여기 복원은 없음 |
| M03 | 3628–3653 | bag/equipped 복원→belt/bracelet/ossuary 누락null→ossCollect object 검증→bracelet brType=demon→headband/headband2 보충→??? 표시명/통계 복구→shield 이름→삭제 bow타입 crossbow. STORAGE.items 검사 위치도 창고의 후속 rebind보다 먼저 |
| M04 | 3654–3683 | affixes 없으면[], legacy prefix/suffix→legacy/legacySuf 추가→무기 spd=+(0.45×RARITY_MUL).toFixed(2), `_spdMig=3`→uniqueArt 없는 무기 표시명 `_weaponName`, `_nameMig=1`→selected=null. bag와 SLOT_NAMES 순회 |
| M05 | 3685–3715 | stats key별 d.stats[k]\|\|0→passives known own key별 unary+\|\|0→pShield/pDef AP환급(비용[1,1,1,2,2,2,3,3,3,5], 초과5)→humanity/demonRevive를 pHuman/pDemon으로 최대10·원 저장 skills delete→grit=d.grit\|\|0→v2 없으면 legacySpent=g×3+(g−1)×g/2, refund=max(0,legacySpent−g), SP 가산. raw 읽기와 최종 gritTotal 파생은 별개 |
| M06 | 3717–3719 | qslots falsy이면 기존값 유지. 배열 length=max(4,len), truthy 비배열은4; 원소가 비배열 객체이고 POT type 허용이면 원 참조 유지, 아니면 빈 type/count0. 초과4를 자르지 않음 |
| M07 | 3721–3737 | stage/kills→legacy mats 정수하한0, shared와 **최댓값** 동기화(합산 아님), 조건시 d.game.mats=0→iris20/taRecords/clearRecords/comboMax/playTime/cutsceneDone→BAG_MAX=Number.isNaN(+d.bagMax)?300:d.bagMax\|\|300→hellCleared[]. 숫자문자열/Infinity 등에 새 clamp를 붙이는 제안 없음 |
| M08 | 3738–3752 | d.storage[0]가 있고 shared가 비었을 때만 slice(0,200) 이관→입력 d.storage={}→STORAGE 새 객체/_synced=false/_getStore→초과200 자르기/persist. 매로드 concat하는 계약 아님 |
| M09 | 3754–3769 | crystalBag/dust 복원→stoneBag는 Array이고 number q1–100 항목만→legacy crystal ID 치환, q 범위 밖50→아이템 socketCount 미정이면0/crystals=[]→socketQ는 crystals 길이로 부족값1·초과절단→bag/equipped/창고 적용→upgrades 객체 교체, potLv는 POT known key |
| M10 | 3771–3794 | SKILL_LIST known ID만 레벨 복원→chargeStock/Range를 chargeBoost로→fused 객체 or{}→skProf/fuseProfSec/cardProf/catProf 복원→_skProfCap 상한→기검참 보장·LMB 후처리. 이후 슬롯 로드가 다시 값을 바꿀 수 있어 이 부분만 최종 상태로 단정하지 않음 |
| M11 | 3795–3831 | dimHalf/galeSlash 제거; elemFuse→sixFuse, slamStorm→whirlDet, stormBurst→stormBeam/burstLoop, stormBeam 하위 체인 보장; Lv300 blueShot/Lv700 burstLoop; elecRepent/boneStorm, holyIce/holyFuse, holyWeak1–4 체인; holyFlame/holyRevive/holyApex·weakFuse2–4 삭제; dimBlast→dimRush→dimThunder→dimSlam→dimBreach; _FUSE_PAIRS 습득 보장. 구성 스킬 min-level 하향 동기화는 하지 않음 |
| M12 | 3836–3879 | activeChargeSk 복원/quakeStride→charge/미습득 fallback, Bow normal/삭제타입·합체 체크, 기본 spikeTrap/holyDome/giantSlam1, Tech giantSlam fallback, Magic fireball 및 슬롯정의 유효성, LMB·Ct·흡수스킬 동기화. **activeQSk/activeRMBSk와 Q/E 상호작용은 보호 표시만** |
| M13 | 3881–3908 | skillSlots Array 앞6칸/null·truthy ultSlot→chainStun 숙련/스킬 rename 및 chainAssault↔chainSlam→미습득/흡수 skill·ult 해제→fixedKick 제거→_repairAreaSkillSlot→known 액티브 자동 빈칸 배정→_sanitizeCoreState→true |
| M14 | 3499–3530 / 3483–3492 | sanitize: finite floor SP/AP/mats 하한0·skills 레벨하한0→기본 WingStrike 보장(**Q/E 보호**)→fused false/알수없는조합 제거·구성 스킬≥1. 현재 기본 cloud 저장과 restore 말미에서 호출되며 모든 dbSave override가 호출하는 공통 전처리는 아님 |
| M15 | 후처리 62176–62201,62481–62517,63982–64025,64119–64146 | dbRestore 성공/실패와 부트 정책은 별개. 데모는 applyStats 이후 자원충전, cloud/local/web 신규 및 빈 장비 보충 순서 차이. raw restore만 확인해 최종 HP/슬롯 동일하다고 선언하지 않음. 맵 재생성 상세 변경은 이 작업 범위 밖 |

### 1.4 공유 저장·타이머·성공/실패 경계

| ID | 함수·행 | 관측 계약 |
|---|---|---|
| T01 | `_load/_saveSharedStorage`, 48523–48524 | 배열 JSON, parse/IO 오류시 load[], 쓰기 오류 삼킴. QA일 때 QA storage 경로 |
| T02 | `_load/_saveSharedMats`, 48527–48529 | 일반 load parseInt10 + finite/음수 검사 + MAX_SAFE_INTEGER=9007199254740991. save floor/clamp 후 unchanged 생략, LS 캐시 후 서버 POST. 사용자 계정 인증 기반 cloud storage라는 뜻은 아님(origin 공유) |
| T03 | `_saveSharedMatsToServer`, `_matsDirty`, `_loadSharedMatsFromServer`, 48531–48536 | 로컬 host/file에서 API. dirty3초 게이트, NaN 감지0. GET 정상 n≥0이면 서버값으로 캐시 갱신, 실패시 LS. POST는 fire-and-forget이므로 `_lastSaveTime`이 공유악의 서버 ACK를 증명하지 않음. 루프 감지61927 |
| T04 | `_getStore/_persist/_flush`, 48537–48553 | 최초 load/legacy 층 concat 캡200/쓰기, dirty flag일 때만 캐릭터 저장의 flush. 실제 공유 저장 분리 유지 |
| T05 | `doAutoSave/startAutoSave`, 3935–3945 | 마지막 성공 후10,000ms 이상 AND G.on/dbReady. interval30,000ms, QA는 timer skip. 주석의 60초/10초와 실제 interval을 구분 |
| T06 | `dbSaveNow/_drainPendingSaveNow`, 3948–3966 | debounce500ms. charId/charIdx/P identity/함수 identity 캡처, 콜백 시 재확인. saving 중이면 pending에 해당 요청을 보존, 완료후 drain도 같은 owner 검증. 서로 다른 캐릭터로 늦은 저장하지 않음 |
| T07 | `dbSaveForce`, 3968–3977 | ready 가드→5,000ms 최소 간격(부족시 잔여시간 예약)→debounce clear→saving이면 pendingForce, 아니면 dbSave. 이름의 Force가 무조건 즉시 성공을 뜻하지 않음 |
| T08 | 부트, 62092/62213/64042/64158 | auto 시작과 별도로 setTimeout dbSave3,000ms. 기본 cloud62523/62558에는 startAutoSave만 있으며 이 4곳과 같은3초 예약이라고 합치지 않음 |
| T09 | 종료·진행, 42005,63530,63655–63692 | 클리어 보상/기록 후 dbSave; 리스폰 후 await dbSave; 다음 스테이지 전 await; goToLobby는 죽은 자원 복구후 await→로비 URL; beforeunload는 await 없는 최종 시도. 실제 종료시 서버 완료 보장은 미확인 |
| T10 | 초기화 UI, 49449–49463 | reset confirm 후 local slot DELETE/클라우드 data{}/web LS 제거. slot 기본 ‘자동저장’이며 local 부트 기본 t1과 다름. **실행하지 않음·변경 제안 없음·보호** |
| T11 | 모든 직접 호출 | 부록 A에 원본의 직접 `dbSave/dbSaveNow/dbSaveForce` 호출 행을 빠짐없이 인덱스. 저장 관련 클릭·장착·강화·성장·클리어는 이 인덱스와 payload 표로 연결 |
| T12 | 별도 설정/QA | game48876 settings,49293–49321 presets,49398–49436 load,49219–49254 screen,10453–10470 charIdx cache,13450–13509 input/gp map. 캐릭터 payload 밖이며 `trace-settings` 영역과 경합하지 않음. QA storage의 own key·튜토리얼 스킵은 별도 모듈 계약(아래), 사용자 저장과 합치지 않음 |

### 1.5 index.html 슬롯 UI·메타데이터·요청 수명

| ID | 원본 행·UI/함수 | 데이터·동작 |
|---|---|---|
| U01 | 808,1273–1276,3553–3565 | developerSaveNotice/selectedSlot·selectedSlotName/localSlots/developerSlots, scroll. 개발 Infinity/일반5, VIEW2 카드. source의 5는 API 저장소 강제상한이 아니라 로비 생성 UI 정책 |
| U02 | `_enterOffline`,2896–2944 | 이름trim2–8/특수문자 제한/comingSoon 가드→local load 중복확인→POST 최소 `{name,ts,charIdx}`; demo는 API 전에 browser 분기; 실패시 hellsave_demo_0..4 중 빈 슬롯. request=_characterLoadSeq로 응답 전후 가드 |
| U03 | `doCreateChar`,3427–3477 | 다른 생성 경로: testMode API 최소 `{ts,charIdx}` 또는 demo `{name,ts,charIdx}`. 온라인 `characters.insert({user_id,name,data:{charIdx}})`,23505 중복처리. player 없어도 생성 슬롯은 존재 |
| U04 | `_afterCharacterCreated`,3402–3424 | 성공 뒤만 tutorial skip key 해제, 목록 갱신→id/선택 이름→스토리→입장. 저장완료 뒤 목록/영상 실패가 재생성 요청이 되지 않음. 온라인 응답과 선택 session은 구분 |
| U05 | `loadCharacters`,3026–3060 | currentUser.id로 select/order(created_at); 요청번호/계정 동일성 검사→목록 치환, 선택 해제·입장 비활성화. `_onlineChars`는 `{id,name,data,created_at,…}` DB row 목록 |
| U06 | `_renderOnlineSlots`,3126–3189 | data.player.lv/data.game.stage·row/data.charIdx 카드; 선택 id/name 분리; delete id+user_id+select(id) 정확1행 확인. `_showDelConfirm` UI. 실제 DB/RLS/삭제 실행 없음 |
| U07 | demo key helpers,3488–3519 | 5개 슬롯 prefix + active key. `_demoSlotRead` parse안전. `_demoSyncActiveSave`는 active없으면 단일 저장을 첫 빈 슬롯으로 이관(name 중복숫자, charIdx0), active있으면 게임 JSON+로비 meta(name,ts,charIdx 우선) 병합 후 active/hellsave_demo 제거. `_demoActivateSlot(name)`은 동기화 후 player있으면 복사/없으면 active game키 제거→슬롯번호 설정 |
| U08 | `loadLocalCharacters`,3522–3550 | demo는 sync하고 API 미호출; 그 외 GET /api/slots. 최신 request만 적용. `development===true && _testMode && !demo`에만 개발 무제한. API 예외/불가시 browser prefix5개에서 name/lv/stage/charIdx 목록 생성 |
| U09 | `_renderSlotList`,3555–3649 | 카드 이름/Lv/진행·외형·선택·삭제·신규 칸/scroll. DELETE /api/save/<name> 실패시 demo prefix 이름검색 삭제. stale 응답 무시. API 목록 필드 kills/ts가 존재해도 카드가 모두 표시하는 것은 아님 |
| U10 | `_selectSlot`,3650–3656; enterGameBtn3820 | slot name 선택→카드 refresh→진행/외형·입장 버튼. 슬롯 선택과 로드/복원은 다른 단계 |
| U11 | `showCharGate`,4340–4349 | request 캡처→demo activation→test 슬롯 URL 또는 online char+slot URL→1,200ms 뒤 같은 request만 navigation. demo는 `game.html?test=1&slot=demo&demo=1`; story suffix 별도 |
| U12 | `_cinSeenChk/Set`,2301–2317 | 계정 user_metadata.cin_seen 우선·_cinSeen:<uid> 캐시, 오프라인 _cinSeen. 독립 시청/재방문 flag, 저장 player 필드 아님. 계정 정책 이식은 미배정/미확인 |
| U13 | 별도 저장 경계 | index2159–2164 hellLang;3405 tutorial skip key; game의 _FDGDruidQaStorage guard와 parry/system lesson 외부 스크립트의 별도 저장. 원본 HTML의 참조 경계까지만 추적하며 외부 모듈 전체 포팅 완료를 주장하지 않음. **레슨/Q/E 보호** |

### 1.6 /api/slots를 구성하는 실제 서버 (보충 의존 근거)

| 계약 | server.cjs 행·값 | node-main.js 행·값 |
|---|---|---|
| 저장 위치 | 65–67 EXODUSER_SAVE_DIR path.resolve 또는 ROOT/saves | 48–51 APPDATA 또는 homedir + release config saveNamespace 또는 EXODUSER-HELL + saves. 실제 실행 env값 미확인 |
| slot 정제 | 118–119 `[a-zA-Z0-9가-힣_\-]` 외 `_`, 최대50 | 53–54 동일 |
| GET /api/slots | 198–213 `.json`/`_`접두제외, 깨진JSON 제외. `{name,ts:0,lv:1,stage:0,kills:0,charIdx:??0}` defaults, `{ok:true,slots,development:true}` | 118–126 같은 필드, development 없음 |
| POST /api/save | 216–222 `{slot,data}`, data없음400. atomicSaveJSON(95–116): stringify→동일dir `.tmp-<pid>-<serial>` wx→fd write/close→rename; 자기 temp만 finally 정리. 성공200 `{ok:true,slot}` | 129–139 직접 writeFileSync(JSON pretty2), parse/write예외500 JSON, data없음400, 성공200. 원자적 rename과 동일하다고 간주하지 않음 |
| GET /api/load/:slot | 225–230 파일없음404, 있으면 `{ok:true,data}` | 142–146 파일없음404, parse 후 같은 envelope |
| DELETE /api/save/:slot | 308–312 파일있으면unlink, `{ok:true}` | 149–153 동일 |
| 공유악의 | 234–249 _sharedMats.json GET/POST. floor/clamp 0..MAX_SAFE_INTEGER/ts; GET 파일없거나오류0 | 158–177 같은 정제·저장; POST오류500 JSON |
| 검수 한계 | 이 작업에서 두 서버 시작·API 요청·사용자 JSON 열기 없음 | 실행판/저장 위치/네트워크 성공은 미확인 |

## 2. 설계 docs와 원본의 불일치·정보 누락 (수정 없음)

기준 설계 폴더의 파일은 `15 세이브+데이터구조.md`(이하 설계)와 `패시브 자동 투자 예약 저장 2026-09-27.md` 2개다. 설계의 명시적 과거 이력과 현행 요약 누락을 구분한다. 아래는 **변경 지시가 아니며 세이브 형식은 보호**다.

| ID | 설계 위치·기술 | 실제 코드 근거 | 판정·영향 / 조치 |
|---|---|---|---|
| X01 | 설계228 ‘3경로 모두 동일’,232–236 player 목록 | 3545–3549에 passiveQueue/apBossCleared/goddessGift/_lvStatMigrated까지,63907–63911·64064–64068·62133–62138은 _lvStatMigrated 없음 | 요약 불완전 + **생산자 차이**. 기본 cloud만 marker 저장, dbRestore에는 읽기 없음(전파일 검색). 동일 payload라고 선언 불가. 보호·표로만 보고 |
| X02 | 설계247 game 목록(stage/kills/mats/irisSz/taRecords/clearRecords/comboMax) | 3555·62142–62144·63915·64072는 playTime/cutsceneDone도 저장 | 해당 요약행 누락. 설계74·83–84에는 일부 보강되어 문서 내 정보 분산. 보호 |
| X03 | 설계246 qslots=4칸 | 3718 Array이면 max(4,len)로 4초과 보존 | 구 요약과 실제 파서 차이. 설계1024–1033 최신 절은 정확한 계약. 초과분 절단 제안 없음 |
| X04 | 설계115 개발 데모 카드1개 고정/신규칸없음;85/89 단일카드 설명 | index3488·3555–3560 등 demo5슬롯 생성·삭제. 설계47–63이 이전 설명 대체를 명시 | **대체된 이력**. 현재 단일키 게임 저장과 로비5슬롯을 혼동하지 않음 |
| X05 | 설계364–388 ‘새 게임 전용 activeCtSk iceOrb’ | cloud62498–62499는 로드여부와 무관 iceOrb 습득시 activeCtSk 강제. demo62189–62191은 신규/미습득일 때만 | 경로별 후처리 범위 차이. Q/E는 보호, 여기서는 Ct 부트 관측만. 수정 제안 없음 |
| X06 | 설계283 신규 mats는 공유값/초기1000대신 | 62476/63956/64105는 `_loadSharedMats()\|\|1000`(shared0도1000), 일반demo62126은1000 후dbRestore,500은61990 10,000,000,000·별도복원 | 요약만으로 공통 정책 판정 불가. 부트/restore 구분. 보호 |
| X07 | 설계311–312 ‘모든 세이브 경로’ mats0/shared패턴 | cloud/local/web은0, 일반demo62142 mats:G.mats,50062005 mats:G.mats; demo override에는 shared flush 없음 | 적용범위 문장이 넓음. 본문3경로 수정 이력과 demo예외 분리 필요하지만 원문 수정 안 함 |
| X08 | 설계328–330 fireBoneWall12/giantSlam20 예전 경제 감사 | 현행 스킬비용은 game31960–31979 및46454 등 별도 단계. 이 추적은 경제 재설계가 아니므로 값 교정/전투 변경 제안 없음 | 과거 절 숫자를 현재 저장 계약·밸런스 기준으로 채택하지 않음. 현재 정확 비용 전수판정은 본 작업 범위 밖·미확인 |
| X09 | 설계228/242의 경로 동일 설명 vs DEMO500 | 62005–62016은 time/mastery 일부·grit·crystal/stone 미포함,62028–62048 선택복원 | 500은 예외임(설계100에 의도적 초기화 명시). 부록 C로 실제 차이만 기록. 필드 추가 제안 없음 |
| X10 | 설계267 일반 fetch실패 LS폴백 설명 | local63905 `const saveData`는 try block 안,63939 catch에서 그 식별자를 읽음(lexical 범위 밖). HTTP non-ok 폴백은63934 같은 try 안 | **정적 내부 경계 관측**: throw/JSON오류 catch의 LS쓰기 성공은 보장할 수 없음. 실제 실패주입 재현은 미실행/미확인. 성공으로 기록하지 않음·수정 없음 |
| X11 | 설계1215–1261 등 이전 provider/play_time 이력·HUD 주석의 미이식 | 현재 source_update_clock_prefix/producer.gd:284–303, native_source_player_initialization_services.gd:352, test_p2001j_lesson_clock.gd:143에 stage/playTime 경로 존재 | 과거 clock미연결 이력을 현행 부재로 재사용하면 안 됨. 이번 실제 게임 진행은 미확인. 저장 IO와 clock 부분 이식을 구분 |
| X12 | 별도 패시브 예약 문서5–7 | game3616 배열/아니면[],51219–51220 known key filter/260,다섯 payload passiveQueue 기록 | **일치**. Godot에는 현재 queue 시스템 부재(native_source_new_run_state.gd:490–525)이며 웹 docs의 완료는 Godot 완료가 아님 |
| X13 | 설계962–978 개발 atomic/NW 직접write·오류처리 | server95–116/216–222, node-main129–139/168–177 | **일치**.항상 atomic인 공통 서버로 오해하면 안 됨. 실제 내구성/Windows rename 미확인 |
| X14 | 설계937–954 q/socketQ/stoneBag | game3754–3766 같은규칙. 다만 cr.q/socketQ는 range 비교만, stone q는 typeof number도 확인 | 설계의 ‘정수’ 타입표와 로더의 검증 강도 차이(소수/문자열 도달 가능성). 실제 오염 저장 E2E 미확인. 보호·새 검증/정규화 제안 없음 |
| X15 | 저장형식·Q/E·2_3 | source 3483–3492/3624/3867–3870 등 | **보호**. 해당 docs 수정·전투/필드 의미 변경 제안 없음 |

## 3. Godot 실제 파일·연결·테스트에서 확인한 의존성

### 3.1 이미 있는 부분과 이식 공백

| ID | 실제 Godot 경로·행 | 확인한 상태 / 재사용 전제 / 없는 부분 |
|---|---|---|
| G01 | `scripts/main.gd:106–183`; `scripts/native_source_new_run_state.gd:59–63,91–160,175–185,549–574` | Main이 단일 Player/World/Resource/State를 신규로 구성. 실제 G/STATS/PASSIVES/INV/P holder와 reader 있음. current P는 실제 actor HP/자원/좌표를 같은 dict로 동기화. **load saved run 분기·직렬화 collector·dbReady/slot 소유자 없음** |
| G02 | `port_modules/native_new_run_bootstrap_source/producer.gd:31,46–68,217–228` | fresh_new_run 생성 계약 있음. loaded branch는 LOADED_BRANCH_EXCLUDED로 제외. fresh reset을 저장 복원으로 쓰지 않음 |
| G03 | `scripts/native_source_resource_authority.gd:3–20,58–81`; `scripts/player.gd` | ST는 실제 actor, MP/rates는 authority, constructor 전용 검증. 원 dbRestore 자원 writer는 별도 미연결. dictionary 복원만 해도 reader가 actor 값으로 덮어쓰는 경계가 있어 실제 owner 협의 필요 |
| G04 | `scripts/native_source_player_providers.gd:16,78–155,171–196,289–302`; `port_modules/save_adapter/raw_grit_restore.gd:5–17,44–55` | RAW_GRIT 모듈이 **Main의 신규 provider 구성에 실제 사용**(declaration0 initialize/read). restore/legacy환급 함수도 파일에 있음. 현재 provider는 restore/plan/reset 호출 없이 새 raw holder를 구성. full 저장복원 연결이라고 판정 불가 |
| G05 | `port_modules/player_passives_source/producer.gd:161–232,263–295` | saved passives로 local 파생하는 derive_restore와 현재 holder reader는 존재. AP환급·d.skills delete 실제효과는 outside_module/save_mutations_not_applied. Main 현재 경로는 configure_current_passives_reader이며 derive_restore로 saved run을 적용하는 호출은 검색에서 없음 |
| G06 | `port_modules/save_adapter/source_save_lifecycle_owner.gd:3–6,13–21,39–78,80–136` | 30초/10초/3초 event pump, current state/collector/slot/rift/primitive **6 Callable 필요**, schedule/poll/settle/rift busy/snapshot 존재. engine timer·사용자IO 없음, Main_connected=false. 제품 scripts/tests에서 preload/호출 검색0. **collector와 save primitive 자체는 이 파일 구현 밖** |
| G07 | `scripts/native_source_new_run_state.gd:147–149,399–414,490–525`; `scripts/native_normal_enemy_hurte.gd:758–760` | mats 신규1000은 공유저장 미이식 주석, 유물·소켓석 owner 배열은 보상용 RAM, 경험치/레벨업 있음. passive queue·dbSaveForce 미이식 명시,10킬 dbSaveNow는 unported_skip. drop records를 INV 저장으로 간주하지 않음(P2-006a 인계 대기) |
| G08 | `port_modules/source_update_clock_prefix/producer.gd:284–303`; `scripts/native_source_player_initialization_services.gd:352`; `scripts/main.gd:917–938` | stage/playTime += sp 단계와 실제 Main clock 서비스 호출 존재. 저장 wall-clock Date.now gate와 게임 틱은 별개. 이번 실행 측정 없음 |
| G09 | `scripts/hud.gd:97–102,804–870,902–919`; `scripts/main.gd:137–183` | state reader에 연결된 Lv/EXP/kill/mats/timer/슬롯 표시 소비자 있음. save slot 목록·로드/삭제확인·저장실패 UI·로비화면은 없음. 주석의 old unported 문자열만으로 현재 기능 부재 판정 안 함 |
| G10 | `scripts/world.gd:905–954,2486…`; `tests/test_contracts.gd` | World는 res://data JSON을 읽는 맵/encounter 경로. map loader는 save loader 아님. **맵 값/이동/카메라 변경 제안 없음** |
| G11 | godot/ 전체 `.gd` 검색 | `/api/slots`·`hellsave`·`dbRestore` 실제 동등 저장 API 구현, 제품용 FileAccess.WRITE·ConfigFile·HTTPRequest 저장소를 찾지 못함. 테스트 보고서/QA ledger 파일쓰기는 제품 save IO가 아님. 다른 확장자/외부 전달물의 존재는 미확인 |
| G12 | 캐릭터·인벤·부가진행 | 현행17장비 초기생성+10가방, 성장을 읽는 모듈은 있음. 전체 item migration·bagMax·QSLOTS restore·sharedStorage/mats persistence·clearRecords/hellCleared 복원·skills/fused 슬롯 전체 migration·index 온라인/데모5슬롯 정책의 실제 Godot 저장 소비자는 없음. 보호 형식 유지 전제 |

### 3.2 테스트 근거와 이번 실행 결과

| 종류 | 파일·행 / 실행 | 결과와 한계 |
|---|---|---|
| Godot 테스트 소스 | `tests/test_native_main_source_starter_state.gd:16–40,65–105,129–193` | 실제 Main/동일 G/P/17장비·15초기장착+10가방·provider/rawgrit0·raw holder loss NR 확인 assertion 존재. **저장 JSON round-trip·재시작 테스트는 아님**. 이번에는 실행하지 않음(STARTER-REGIONS 담당과 기대값 중복 수리하지 않음) |
| Godot 테스트 소스 | `tests/test_native_main_source_authority.gd:15–44,75–110,141–195` | 격리userdir guard, 자원/owner/실패경계 검사. saved player restore 테스트 아님. 이번 미실행 |
| Godot 테스트 소스 | `tests/test_native_main_source_player_initialization.gd:64–160` | 실제constructor write trace·current P·실제 자원/파생계산·수명. 저장 재적용/로드 권한을 증명하지 않음. 이번 미실행 |
| Godot clock 테스트 소스 | `tests/test_p2001j_lesson_clock.gd:143`; `tests/test_native_source_update_clock_play_time.gd:5,127–155` | 레슨 이후32742 단계/계약 검사. clock 존재 근거이며 disk persistence 아님. 이번 미실행 |
| Godot 저장 부분 모듈 | 원앱 `~/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`, 실제 `4.7.2.stable.official.ed1daf0bf`. `--headless --path godot --check-only --script res://port_modules/save_adapter/source_save_lifecycle_owner.gd` 및 raw_grit_restore.gd | **각 exit0**, stderr 오류 출력 없음(통합 로그의 엔진 banner만). 구문 검사2건이며 행동 테스트2건으로 합산하지 않음. 모듈 전용 저장 round-trip 기존 테스트 파일은 godot/tests·test·tools 검색에서 찾지 못함 |
| 웹 기존 테스트 | Node v24.15.0, `node --test test/cloudAutoSave.test.js test/demoSaveRoute.test.js test/developerCharacterSlots.test.js test/gritSystem.test.js test/balanceExpCurve.test.js` | **60건/48통과/12실패**, exit1. cancelled/skipped0. VM/정적 source 추출 기반이며 실제 Supabase/API/browser 저장 검증 아님. `game-easy-test.html` 경험치 비교4건에 포함, 그 파일 전수추적은 본 범위 밖 |
| 실패 cloud 2건 | cloudAutoSave172 `_charId` ReferenceError;187 `_FDGDruidQaStorage.active` undefined | 현재함수에 필요한 전역 대역 누락이 직접 실패지점. 제품 저장실패라고 단정하지 않으며 harness/제품 수정0 |
| 실패 demo 1건 | demoSaveRoute31 `_characterLoadSeq` ReferenceError | showCharGate 요청가드 대역 누락. URL 동작 PASS로 승격하지 않음 |
| 실패 slots 8건 | developerCharacterSlots55/63/98(2건): `_demoSyncActiveSave` ReferenceError.156 local login/cinematic 4건: finish.resolve/reject undefined + 테스트 종료 후 같은 helper ReferenceError 4건 로그 | 구 단일고정카드 기대 및 helper 대역이 현재멀티슬롯과 어긋남. 뒤4건은 reject/resolve 준비도 실패. 원로그 보존, 추가 재실행/약화 없음 |
| 실패 grit 1건 | gritSystem7 함수 문자열 regex | 현재 game27897은 `(+_grit\|\|0)+…`, 기대식 `_grit+…`와 달라 실패. 수치계산 회귀 여부 전체는 미확인. raw 저장검사(test32)는 통과 |
| 실행 기록 | `~/exoduser-wt/_out/trace-save/web-tests.log`, `godot-lifecycle-check.log`, `godot-raw-grit-check.log` | Git 밖 원로그. 서버/API·사용자 저장 쓰기·씬 실행·import·전역설정 수정 명령 없음. 전체Godot/전체게임PASS·PC동기화완료·실플레이품질 선언 없음 |

## 4. 작은 이식 단위별 구현 지시서 (2026-10-20 보충)

**다음 차례에는 같은 채팅 창에서 1번 `SV-COLLECT`를 바로 구현한다.** 0번은 착수 점검이며 별도 승인·대기 작업이 아니다. 이번 보충 커밋은 이 절만 변경한다. 아래 파일과 API는 구현할 계약이며, 이미 만들어진 기능으로 보고하지 않는다.

이번 보충에서 fetch 후 확인한 main은 `d5421a0b804e94e96051014f44eb5751bf5c37d9`다. 최신 작업판에서 P2-001l·P2-006a의 main 통합과 P2-006b의 `native_world_drops.gd` 표시부 소유를 확인했다. TRACE-INVENTORY/QUICKSLOT/SETTINGS/META/REVIVE-SHIELD는 각자 문서를 소유한다. 1번의 신규 코드·테스트·도구 3경로는 이 main에 없다. §0–3의 최초 조사 기록은 그대로 보존한다.

### 4.0 공통 실행 기준과 0번 SV-CONTRACT

| 항목 | 지시 |
|---|---|
| 다음 작업 위치 | 다음 작업 시작 때 fetch와 최신 작업판을 확인하고, 그때의 origin/main에서 `~/exoduser-wt/save-collect` / `codex/save-collect-20261020`을 만든다. 같은 채팅 창을 계속 사용한다. R과 추적 WT는 보존한다. 경로·브랜치가 다른 담당의 것이면 덮어쓰지 말고 BLOCKED로 보고한다. 이번에는 새 WT를 만들지 않는다 |
| 원본 재확인 | 아래 행 번호는 최초 pin788ba758f 기준이다. 다음 main에서 함수·marker로 다시 찾고, 행만 이동했으면 새 위치를 기록한다. 다섯 저장 리터럴·예약 helper의 표현식이 달라졌으면 혼합 이식하지 말고 차이표와 BLOCKED 사유를 보고한다 |
| 0번 파일·수정 | 별도 파일 생성0, 기존 코드·테스트 수정0, 공용6파일 각각0행. 부록 C와 원본5리터럴을 읽어 1번 oracle의 분모로 사용한다. 별도 `test_native_save_contract.gd` 선행 작업을 만들지 않고 1번 새 테스트에서 계약을 확인한다 |
| 0번 확인값 | game3543–3575/63905–63931/64062–64088/62131–62159/61996–62017 및51219–51221. 펼친 경로수 cloud67/local67/web67/demo67/demo50049, union68. mats0/G.mats, storage{}, gritCostModeV2=1, cloud-only marker, ts 유무, 슬롯 배열 복사 차이를 원본 그대로 확인한다 |
| 허용 범위 | 사용자가 후속 1번 구현을 명시했으므로, 독립 수집기를 P4 일반 배선의 미배정 때문에 다시 대기시키지 않는다. 실제 Main 배선·사용자 저장 IO·보호 계약 변경은 1번에 포함하지 않는다 |
| 보호 | **저장 형식·기존 필드명·기존 마이그레이션·docs/2_3·Q/E는 보호**. 새 save schemaVersion·진행 필드를 제안하지 않는다. saved activeQSk/activeRMBSk는 원문 그대로 읽어 복사하며 전투 writer를 만들지 않는다. 진단 envelope는 payload 밖에 둔다 |
| docs·제출 | 후속 코드 단위는 관련 키워드로 docs 전체 검색→자기 코드와 관련 docs 정합→경로별 stage/commit/push→원격 SHA 대조를 수행한다. 다른 담당 문서나 docs/2_3를 수정하지 않는다. 이번 보충은 이 추적 문서 §4만 변경한다 |
| 공용 줄 수 의미 | 1–9번의 ‘0행’은 해당 독립 모듈 납품에서 공용 파일을 수정하지 않는다는 뜻이다. 10번의 숫자는 원본 pin에서 확인한 **최소 호출부 예산**이다. 실제 writer·부트 흐름 수정 행수는 아직 미확인이며, 그 부분이 확정되기 전 제품 배선은 BLOCKED다 |

### 4.1 1번 SV-COLLECT — 다음 차례에 바로 구현

완료물은 **명시적 입력에서 원본의 다섯 저장 payload를 만드는 RAM 모듈**이다. 실제 Main에 없는 owner를 가짜 기본값으로 만들지 않는다. 실제 owner 결손은 제품 연결의 선행 조건이며, 독립 모듈과 합성 입력 대조의 착수를 막지 않는다.

#### 파일·API·입력 계약

| 구분 | 구현할 내용 |
|---|---|
| 신규 제품 파일 | `godot/port_modules/save_adapter/source_save_collector.gd`, `extends RefCounted`. 공개 API는 `collect(profile: String, context: Dictionary) -> Dictionary`. profile은 `cloud/local/web/demo/demo500`만 허용한다. 다른 제품 모듈·Main·에셋 preload 의존0 |
| 신규 테스트 파일 | `godot/tests/test_native_save_collector.gd`, `extends SceneTree`. 새 수집기만 preload한다. 원본 oracle 대조, 복사·참조, 실패 경계를 검증한다. 실제 Main·World·actor·기존 초기화 테스트는 실행하지 않는다 |
| 신규 oracle 도구 | `tools/godot/save_collector_source_oracle.mjs`. Node 내장 fs/vm/crypto만 사용한다. `--source <game.html> --output <자기 _out/…/oracle.json>`을 받는다. 원본의5개 object 리터럴과 `_passiveQueueItems`를 그대로 추출해 격리 vm에서 실행한다. 전체 HTML·저장 IO·부팅·sanitize 실행0. 제품 수집기를 재사용하거나 원본 공식을 다시 쓴 expected generator로 대체하지 않는다 |
| 기존 파일·공용 수정 | **없음**. main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd 각각0행. 기존 lifecycle/raw_grit/providers 모듈도 수정0. 신규 reader/writer·부팅 호출·metadata를 공용 파일에 넣지 않는다 |
| 성공 반환 | `{ready:true,status:"READY",profile:<입력>,payload:<원본 키만인 Dictionary>,scope:"EXPLICIT_CONTEXT_ONLY",Main_connected:false,persisted:false}`. scope 등은 저장 형식에 추가되는 키가 아니라 호출자 진단이다 |
| 실패 반환 | `{ready:false,status:"NOT_READY",reason:<구체 필드/이유>,missing:[…],Main_connected:false,persisted:false}`. **payload 키 자체가 없어야 한다**. 부분 데이터를 READY로 반환하지 않는다 |
| 필수 context 키 | 모든 profile: `p,g,inv,stats,passives,qslots,bag_max,upgrades,pot_lv,skill_slots,ult_slot,char_idx`. demo500 외: `grit,crystal_bag,crystal_dust,stone_bag`. cloud 외: `now_ms`. 이 이름은 모듈 입력 API이며 저장 키는 부록 C 그대로다. demo500에 없는 필드의 owner는 요구하지 않는다 |
| 존재·타입 | p/g/inv 및 spread map은 Dictionary다. bag/equipped와 각 배열은 정상 JSON 문맥을 받는다. 직접 읽는 P.lv/INV.bag/G.stage 등의 키가 없으면 NR이다. `\|\|`가 있는 선택 필드만 원본 fallback을 적용한다. `Dictionary.has()`로 missing과 명시null/0/false를 구분한다 |
| 지원 도메인 | JSON bool/string/null·유한 Number·배열·문자열 키 Dictionary이며 순환이 없어야 한다. JS safe integer 밖의 int, NaN/Infinity, Object/Resource/Callable, 순환·비문자열 키는 NR이며 payload가 없다. 원본의 undefined 생략·NaN→null 등을 지원한 것으로 보고하지 않는다. 이는 이식 지원 경계이며 원 저장 형식의 변경이 아니다 |

#### 원본에서 옮길 식·상수·복사 의미

| 항목 | 정확한 근거와 구현 규칙 |
|---|---|
| 원본 범위 | Cloud3543–3575, Local63905–63931, Web64062–64088, Demo62131–62159, Demo50061996–62017, 예약 helper51219–51221. 부록 C의 전 필드와 원문 순서를 따른다 |
| player | lv/exp/maxExp/sp/baseAtk/baseDef/mpR/stR/hp/mhp/mp/mmp/st/mst/speed/shield/mshield/maskOn은 원 표현식 그대로다. ap는 `P.ap\|\|0`. 선택 날짜·count·기록의 fallback도 그대로다. `_lvStatMigrated:P._lvStatMigrated\|\|false`는 cloud3546에만 있고 다른 profile에 추가하지 않는다 |
| JS truthiness | JSON 범위의 falsy는 null/false/0/−0/빈문자열이다. 빈 Array·Dictionary는 truthy다. 필드별 `\|\|`를 `get(key,default)`로만 대체하지 않는다. 숫자화·정수화·clamp·스탯 재계산을 추가하지 않는다 |
| 예약 큐 | `_passiveQueueItems()` 원문대로 배열이 아니면[], 문자열이면서 PASSIVES의 own key인 항목만 남기고 순서·중복을 유지해 앞260개를 반환한다. 출력은 새 배열이며 P._passiveQueue·AP·패시브 레벨을 쓰지 않는다 |
| wrapper와 spread | 매 호출마다 root/player/inv/game는 새 Dictionary다. stats/passives/upgrades/potLv/skills는 원본 spread처럼 **얕게 복사**한다. inv.bag/equipped/qslots, fused/mastery 등의 직접 참조는 보존한다. 아이템의 알 수 없는 own 필드를 whitelist로 없애거나 deep clone으로 바꾸지 않는다 |
| skillSlots | Cloud/Local/Web은 SKILL_SLOTS와 같은 Array, Demo/Demo500은 `[...SKILL_SLOTS]`인 새 얕은 Array다. active 기본문자열은 부록 C를 따른다. Q/E 필드는 보호·읽기 복사만 하며 슬롯 수리·미소유 검사·발동을 호출하지 않는다 |
| 고정값 | Cloud/Local/Web game.mats=0, Demo/Demo500은 G.mats다. storage는 항상 새 빈{}. demo500 외 gritCostModeV2=1, grit은 raw 입력 그대로이며 gritTotal을 계산하지 않는다. BAG_MAX는 입력 그대로 복사한다. 300/200/9999는 각각 다른 시스템의 값이며 collector에 새 상한으로 붙이지 않는다 |
| game | stage/kills는 전 profile 공통이다. demo500만 cutsceneDone=true이며 나머지는 irisSz\|\|20/기록\|\|{}/comboMax\|\|0/playTime\|\|0/cutsceneDone\|\|false를 따른다. stageTime·맵·적·탄·drop records는 payload에 추가하지 않는다 |
| 시각 | cloud에는 ts가 없다. 나머지는 context.now_ms를 원본 Date.now() 위치에 사용한다. 수집기가 OS clock/RNG를 직접 호출하지 않는다. 테스트 시각1700000000123은 QA 입력값이며 게임 상수가 아니다 |
| 제외 책임 | admission·sanitize·공유 flush·dbReady/charId/saving/레슨 상태·복원·IO·성공 시각 갱신·자동 타이머는 이 모듈 밖이다. 특히 cloud의 sanitize를 공통 collector로 옮겨 override 경로를 바꾸지 않는다 |

#### 새 테스트의 필수 단정

| ID | 단정과 원본 expected |
|---|---|
| C01 5경로 | 같은 정상 문맥의5개 profile을 원본 vm의 JSON.stringify→parse expected와 수집기 payload→JSON→parse actual로 재귀 비교한다. key집합·배열순서/중복·값·null/bool/string/Number가 같아야 한다. 펼친 경로수는67/67/67/67/49, union68이다 |
| C02 예외 필드 | cloud에는 ts가 없고 player._lvStatMigrated=false가 있다. local/web/demo는 ts=1700000000123이며 그 marker는 없다. demo500에는 grit/gritCostModeV2/crystalBag/crystalDust/stoneBag/activeTechSk/fuseProfSec/cardProf/catProf가 없다. 근거3546·61997–62016·63906–63930·64063–64087·62132–62158 |
| C03 mats·창고 | G.mats=4321이면 Cloud/Local/Web은0, Demo/Demo500은4321이다. 전 profile storage={}이며 원 G.mats는4321 그대로다. 입력에 별도 창고 배열을 붙여도 payload.storage에 복사하지 않는다(3555/3558·62142/62145·62005/62006) |
| C04 fallback | p.ap=0→0, p._transLvCount=0→0, g._irisSz=0→20, p._transLvDate=""→null, cutsceneDone=false→false다. 빈 fused/mastery/기록 Dictionary는 truthy 직접 참조다. missing/false/0/빈문자열을 각각 원본 oracle과 비교한다(3545–3571) |
| C05 예약 | PASSIVES에 pAtk가 있고 입력이 [pAtk×300,"unknown",1,null]이면 결과는 pAtk260개다. 원 배열303개는 그대로다. 알려진 두 키의 순서·중복도 유지한다. 비배열 큐는[]다(51219–51221) |
| C06 참조 | root/player/inv/game는 새 객체, spread map은 얕은 새 객체, bag/equipped/qslots는 same-ref다. skillSlots는 Cloud/Local/Web same-ref, Demo/Demo500은 다른 배열이며 요소는 같다. 입력 before/after JSON은 같아야 한다(3551–3573·62158·62016) |
| C07 item | QA item `{id:7,custom:{flag:false},socketQ:[1,100],crystals:[{id:"atk",q:50}],_gx:0,_gy:2}`의 중첩값·알 수 없는 custom·좌표를 그대로 보존한다. inv wrapper에 붙인 custom키는 원본처럼 저장하지 않는다(3551·15954–16164) |
| C08 추가 변환 없음 | qslots5개→5개, bag_max="432"→같은 문자열, grit=3→raw3이다. 4칸 절단·숫자변환·근성총합 계산이 없어야 한다(3553–3556·63913–63916). 이 정상 JSON 케이스를 NR로 바꾸어 검사를 생략하지 않는다 |
| C09 실패 | unknown profile, p/INV.bag 누락, normal profile의 grit 누락, noncloud의 now_ms 누락, unsafe int/NaN/Infinity/Resource/순환은 NR·payload없음·입력변경0이다. cloud의 now_ms 누락과 demo500의 grit 누락은 정상 수집이다. 직접읽기 누락과 선택필드 fallback을 구분한다 |
| C10 반복·부수효과 | 같은 입력 두 번은 별도 payload와 같은 parsed값을 만든다. caller가 두 호출 사이 kills를41→42로 바꾸면 두 번째는42다. 수집 중 입력 write·OS clock/RNG·FileAccess·HTTPRequest·SceneTree 호출은0이다. 실제 Main 연결은 이 검사로 인증하지 않는다 |

#### 격리 실행·착수 순서·완료 조건

| 항목 | 지시 |
|---|---|
| 격리 이름 | **`EXODUSER-SaveCollect-Isolated-20261020`**. 새 GDScript 테스트의 `_initialize()`에서 실제 OS.get_user_data_dir()를 검사한다. 다르면 exit2이며 검사0을 PASS로 세지 않는다 |
| mini-project | `~/exoduser-wt/_out/save-collect/qa-project/`에만 임시 project.godot를 만든다. config_version=5와 application/config/use_custom_user_dir=true, application/config/custom_user_dir_name="EXODUSER-SaveCollect-Isolated-20261020"을 설정한다. 새 모듈·테스트를 같은 상대경로와 동일 byte로 복사하고 SHA256을 대조한다. oracle.json은 tests/fixtures에 복사한다. 게임 project.godot/override.cfg·전역설정·HOME 수정0, 에셋 import0 |
| oracle 실행 | `node tools/godot/save_collector_source_oracle.mjs --source game.html --output /Users/fordeargamers/exoduser-wt/_out/save-collect/oracle.json`. 추출 원본의 행·부분해시와 fixture/expected를 기록한다. 이 도구는 다음 구현에서 만들며 이번에는 실행하지 않았다 |
| Godot 실행 | `~/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot --headless --path /Users/fordeargamers/exoduser-wt/_out/save-collect/qa-project --script res://tests/test_native_save_collector.gd`. stdout/stderr를 자기 _out에 따로 보존한다 |
| 착수 순서 | 최신 소유 확인→원본 oracle 추출→수집기와 C01–C10 구현→격리 실행→실패 수정·필요 케이스 재검증→docs 정합→구현 브랜치만 commit/push/원격 SHA 확인. 소유 경로 충돌·보호식 변경 필요·권한 거부는 우회하지 않고 BLOCKED로 보고한다 |
| 완료 | exit0·실패0·C01–C10 모두 실행·격리명 일치·SCRIPT ERROR/ERROR0·복사해시 일치를 확인한다. skip/검사0/구문 검사만으로 완료하지 않는다. 기존 웹60건/12실패는 이 단위에서 수정·재실행하지 않는다 |
| 충돌·한계 | 기존 공용·다른 담당 코드 수정0이므로 레슨·드랍·맵·설정 구현과 충돌하지 않는다. 실제 bagMax/숙련도/예약/shared owner가 없다는 사실은 제품 배선에 남긴다. 모듈행동·원본식 대조까지만 완료이며 실제 저장/재시작/실화면/PC는 미확인이다 |

### 4.2 2번 SV-TRANSPORT-READ — 슬롯 목록과 로드 응답 해석

| 항목 | 구현 지시 |
|---|---|
| 파일·공용 | 신규 `godot/port_modules/save_adapter/source_slot_reader.gd`, `godot/tests/test_native_save_slot_reader.gd`. 기존 코드·테스트와 공용6파일 각각0행. API `parse_slots(status_code,body)` / `parse_load(status_code,body)`의 순수 응답 해석부터 구현한다. HTTP 발사는7번에서 target 확정 후 연결한다 |
| 원본·값 | server198–213/225–230, node-main118–126/142–146, index3531–3545. 목록필드 name/ts/lv/stage/kills/charIdx, development는 엄격true다. 로드 파일 없음404, parse/500/ok:false는 실패다. 서버의 default lv1/stage0/kills0/ts0/charIdx0을 깨진 응답의 자동 복구값으로 쓰지 않는다 |
| 테스트·격리 | `test_native_save_slot_reader.gd`, `EXODUSER-SaveSlotRead-Isolated-20261020`. 200+빈slots→빈목록 성공, development:true와"true" 구분,404/500/손상JSON→실패. data{charIdx:0}은 존재하는 신규 메타, data.player.lv7은 진행 저장으로 분류한다. 합성 응답만 사용한다 |
| 선행·충돌 | 1번과 독립 진행 가능. dev/NW/Supabase를 하나로 추정하지 않는다. target·인증 미확정이면 실제 네트워크 연결은 BLOCKED다. 로비UI·TRACE-SETTINGS/INVENTORY 파일 수정0 |

### 4.3 3번 SV-RESTORE-PLAYER — 복원 순서와 실제 자원 owner

| 항목 | 구현 지시 |
|---|---|
| 파일·공용 | 신규 `godot/port_modules/save_adapter/source_player_restore.gd`, `godot/tests/test_native_save_player_restore.gd`. 먼저 `plan(saved,prior)`의 순서있는 write와 명시 sink를 검증한다. 기존 raw_grit_restore는 지원범위를 확인해 재사용하며 수정0. **공용6파일0행**에서 계획 검증까지만 인수한다. 실제 State/actor/Resource 복원 writer는10번 전 별도 확정한다 |
| 원본·공식 | 3597–3626/3685–3715,43128–43132. maxExp=pd.maxExp\|\|15, lv1000 이상에서 유효한 양수maxExp가 아니면 floor(5,000,000+(lv−999)^2×10,000). SP/AP는 저장값 그대로다. known passives는 unary+\|\|0, pShield/pDef 비용[1,1,1,2,2,2,3,3,3,5]/초과5 환급. grit 구 비용=g×3+(g−1)g/2, 환급=max(0,구 비용−g). 보호 마이그레이션 변경0 |
| 테스트·격리 | `test_native_save_player_restore.gd`, `EXODUSER-SavePlayerRestore-Isolated-20261020`. lv1000/손상maxExp→5,010,000, lv1001→5,040,000, 정상12345 보존. grit3/v2없음→SP+9, v2=1→환급0. pDef2→AP+2, queue비배열→[]. prior.mhp350/pd.hp0/pd.mhp500이면 원본3619 순서상 hp350 후 mhp500이다. 부트 충전과 별도로 검사한다 |
| 선행·충돌 | 2번 parse 성공과 원본 known-key 표가 필요하다. State가 actor 값을 다시 읽어 덮는 경계를 해결하기 전 제품 write는 금지한다. TRACE-META/REVIVE-SHIELD와 소유 조정하며 Q/E·rage·부활 규칙의 새로운 writer를 제안하지 않는다 |

### 4.4 4번 SV-RESTORE-ITEMS — 인벤·장비·유물

| 항목 | 구현 지시 |
|---|---|
| 파일·공용 | 신규 `godot/port_modules/save_adapter/source_inventory_restore.gd`, `godot/tests/test_native_save_inventory_restore.gd`. saved INV와 명시 공유창고의 복원 계획·sink를 구현한다. 공용6파일 각각0행, 생성기·줍기·드랍 표시 기존 코드 수정0. 실제 INV 적용 권위는10번 전에 확정한다 |
| 원본·값 | 3628–3683/3735–3769. 누락슬롯null, brType=demon, legacy affix/이름/bow 복구. spd=+(0.45×RARITY_MUL[rarity]).toFixed(2), _spdMig3/_nameMig1. bagMax NaN→300/기타 원값\|\|300. crystal q 범위밖50, socketQ 부족/범위밖1·crystals길이 동기화, stone q는number1–100만. 형식·기존 migration은 보호다 |
| 테스트·격리 | `test_native_save_inventory_restore.gd`, `EXODUSER-SaveInvRestore-Isolated-20261020`. 구15키에 누락 headband2/ossuary를null로 보충하고 기존item 보존. uniqueArt 무기명 보존, _spdMig3 재적용0. q0→50, crystals2/socketQ[101]→[1,1], stone[{q:0},{q:100}]→후자1개. bagMax"bad"→300/"432"는문자열 그대로. 각 기대를 원본식과 대조한다 |
| 선행·충돌 | TRACE-INVENTORY 계약과 P2-006a 통합 INV 경로를 먼저 인수한다. **P2-006b의 native_world_drops 표시부 수정금지**. 공유창고 정본은5번까지 제품 적용을 보류한다. shield 키·Q/E 구조는 보호다 |

### 4.5 5번 SV-SHARED-READ — 공유 악의와 창고 이관

| 항목 | 구현 지시 |
|---|---|
| 파일·공용 | 신규 `godot/port_modules/save_adapter/source_shared_store.gd`, `godot/tests/test_native_save_shared_store.gd`. `plan_restore(legacy,shared)`와 명시 저장 port를 받는다. namespace 자동 선택0, 기존 코드와 공용6파일 각각0행 |
| 원본·공식 | 3724–3752/48521–48553. legacyMats=max(0,floor(+v\|\|0)), 공유값과max 동기화·합산0. saved>0이고 shared와 다를 때만 d.game.mats=0 효과. shared가 빈 배열일 때만 legacy창고 앞200개 이관. 악의 load parseInt10/save floor·0..9,007,199,254,740,991. dirty flush·unchanged 생략은 쓰기 port의 원본 순서를 따른다 |
| 테스트·격리 | `test_native_save_shared_store.gd`, `EXODUSER-SaveShared-Isolated-20261020`. shared100/legacy80→100·legacy0 write, 재로드100불변. shared100/legacy100이면 legacy0 write없음. shared빈/legacy201개→200, shared1개면 legacy무시. 3,000,000,000 양수 유지·음수0·MAX_SAFE 경계를 대조한다. IO 실패는 자기 userdir/대역만 사용한다 |
| 선행·충돌 | 원본 origin 공유와 native namespace의 대상이 확정되기 전 영속화는 BLOCKED다. TRACE-META 통화 owner와 조정한다. 사용자 악의 병합·창고 삭제0, collector.storage={} 유지 |

### 4.6 6번 SV-RESTORE-FLOW — 스킬·합체·슬롯과 부트 분기

| 항목 | 구현 지시 |
|---|---|
| 파일·공용 | 신규 `godot/port_modules/save_adapter/source_restore_flow.gd`, `godot/tests/test_native_save_restore_flow.gd`. `restore(profile,saved,bindings)`가3/4/5번과 명시 스킬 owner를 순서대로 호출한다. 명시 sink 검사까지는 공용6파일 각각0행이다. 보호 블록의 새 writer는 만들지 않는다 |
| 원본·값 | 3771–3908/44246–44273,62164–62201/62479–62517/63959–64025/64108–64146. known skills→chargeBoost→fused→숙련도cap→Lv300 blueShot/Lv700 burstLoop→active/6슬롯→sanitize 순서다. 일반0–3/Space4/F5를 유지한다. _ensureBaseWingStrike·Q/E는 보호 표시만 하며 새 구현에서 제외한다 |
| 테스트·격리 | `test_native_save_restore_flow.gd`, `EXODUSER-SaveFlow-Isolated-20261020`. M01→M13 호출 trace, 메타only는 신규/조회실패는 중단. F ancestorSummon+일반빈칸→일반칸/Fnull, F holyDome 보존, chainStun 숙련도키 전환, Lv299/300·699/700 경계를 검사한다. demo500은62028–62048 선택복원만 하며 일반 dbRestore 전체를 호출하지 않는다 |
| 선행·충돌 | 3/4/5 인수와 스킬/합체/숙련도/부트 후처리 owner가 필요하다. 보호·미이식 부분이 있으면 전체 restore READY를 만들지 않는다. TRACE-QUICKSLOT/TRACE-META와 같은 값의 writer를 중복 생성하지 않는다 |

### 4.7 7번 SV-SAVE-PRIMITIVE — 대상별 저장과 성공 ACK

| 항목 | 구현 지시 |
|---|---|
| 파일·공용 | 신규 `godot/port_modules/save_adapter/source_save_primitive.gd`, `godot/tests/test_native_save_primitive.gd`. `save(slot,context)`→collector→명시 target port를 연결한다. HTTP/FileAccess 포트는 확정된 target 하나씩 구현한다. 공용6파일·server.cjs/node-main.js 수정0 |
| 원본·값 | 3533–3585/63932–63940/64089–64092, server95–116/216–222, node129–139. admission과 정확한1행id/j.ok/로컬write 성공을 확인한 때만 lastSave 갱신. shared flush 순서, 개발서버의wx/write/close/rename과 NW 직접write 차이를 유지한다. §2 X10의 catch 경계는 별도 관측하며 임의 수리하지 않는다 |
| 테스트·격리 | `test_native_save_primitive.gd`, `EXODUSER-SavePrimitive-Isolated-20261020`. now1700000000123/last0에서 실패ACK→last0, 정확id1행→now. 0행/다른id/HTTP500/write실패는 성공표시0. 개발 rename실패는 자기 기존파일 byte보존·자기temp만 정리한다. 실제계정/API/사용자 저장은 사용하지 않는다 |
| 선행·충돌 | 1/2/5와 target(dev/NW/web/cloud) 범위 인수가 필요하다. 3/4/6 미인수이면 제품저장을 활성화하지 않는다. namespace·패키징P5 소유 변경0. 레슨/Q/E admission은 기존 owner를 관측한다 |

### 4.8 8번 SV-LIFECYCLE — 타이머·디바운스·강제 요청

| 항목 | 구현 지시 |
|---|---|
| 파일·공용 | 신규 `godot/port_modules/save_adapter/source_save_request_owner.gd`, `godot/tests/test_native_save_lifecycle.gd`. 기존 source_save_lifecycle_owner는 poll/settle로 재사용한다. 같은 파일의 결손은 새 실패 테스트로 입증한 메서드만 수정한다. 공용6파일 각각0행이며 Main clock 배선은10번이다 |
| 원본·값 | 3935–3977/62092/62213/64042/64158/63673–63692. auto30,000ms/성공gap10,000ms/boot3,000ms/debounce500ms/force최소5,000ms. 요청은 charId/charIdx/P/dbSave함수 identity를 캡처·재확인한다. wall-clock을 sp 게임틱으로 바꾸지 않는다 |
| 테스트·격리 | `test_native_save_lifecycle.gd`, `EXODUSER-SaveLifecycle-Isolated-20261020`. auto예약29999ms→0/30000→조건맞으면1. 별도 doAutoSave admission은 last10000/now19999 skip·20000허용. boot2999→0/3000→1, debounce499대기/500정확1, force gap4999예약/5000가능. 저장중pending은 완료뒤1회, 캐릭터/함수교체뒤0회다.6개Callable누락은NR, 종료 요청과settled를 구분한다 |
| 선행·충돌 | 7번 primitive와 실제 context/slot/session owner가 필요하다. 1번 통과만으로6bindings를 READY로 주입하지 않는다. P2-001l·updateclock·QA-002의 코드/기존 테스트 수정0 |

### 4.9 9번 SV-LOBBY-VIEW — 독립 슬롯 화면

| 항목 | 구현 지시 |
|---|---|
| 파일·공용 | 신규 `godot/scripts/native_save_slot_menu.gd`, `godot/scenes/native_save_slot_menu.tscn`, `godot/tests/test_native_save_slot_menu.gd`. 명시 reader/controller를 받는 독립씬이다. 공용6파일 각각0행, P/G/INV 직접write0. 제품 화면전환은10번이다 |
| 원본·값 | index3026–3060/3126–3189/3488–3656/4340–4349. VIEW2, 일반/demo5·개발Infinity, development===true+testMode+!demo. activekey/5slot 교환·로비메타 우선, requestseq의stale 취소, 입장1,200ms, 이름2–8·중복·삭제확인을 유지한다 |
| 테스트·격리 | `test_native_save_slot_menu.gd`, `EXODUSER-SaveSlotMenu-Isolated-20261020`. 일반5개생성차단/개발6번째허용, 메타only입장은 active설정·신규진입, 기존Lv7슬롯 복귀Lv12 뒤 다른Lv7 보존. 늦은응답은 카드교체0, 삭제취소/실패는 기존카드보존,1199ms이동0/1200은동일request만1. fake backend/자기userdir만 쓰고 실화면1x는 별도 검수한다 |
| 선행·충돌 | 2/6/8과 인증·스토리·다국어 담당 호출계약을 인수한다. TRACE-SETTINGS의 언어를 새 키로 복제하지 않는다. cloud UI polish·hud 기존노드·실제계정 삭제0 |

### 4.10 10번 SV-INTEGRATE/E2E — 공용 연결과 실제 재시작

이 단계만 실제 Main과 상태 owner에 연결한다. **현재 restore writer·로드 이후 부트 API의 추가 행수는 미확인**이다. 아래 최소 호출부 예산과 실제 writer 범위를 총괄이 확정하기 전 해당 제품 연결은 BLOCKED다. 이것은 독립1번의 착수 조건이 아니다.

| 파일 | 만들거나 수정할 위치·최소 호출부 |
|---|---|
| 신규 파일 | `godot/scripts/native_save_session.gd`, `godot/tests/test_native_save_reload.gd`. session이 slot/target/readiness를 소유하며 새 저장형식을 만들지 않는다. 기존 테스트 수정0 |
| main.gd | 최초 pin106 `_ready` 초입의 선언1행+로드 분기 호출1행,144 starter factory 직전 loaded 분기1행, 부팅완료 lifecycle시작1행,935 `_process` pump1행: **최소 호출부5행**. 실제 bootstrap 본문 diff는 미확인이다. 원62459–62481/63959–63981의 load선행·실패중단·신규만defaultItems·불필요RNG소비0을 보존해야 한다 |
| native_source_new_run_state.gd | 115–160 constructor·175–185/549–574 reader가 접점이다. collector 읽기는 기존API를 사용하므로0행. saved G/P/INV를 실제 권위에 적용할 writer의 최소 추가행수는 **미확인·현재API부재**다. identity/constructor 가드를 해제하지 않고, writer 확정 전 배선은 BLOCKED다 |
| player.gd / resource authority | 실제HP/ST와 MP/rates의 분할소유 때문에 dict 대입만으로 복원할 수 없다. 기존 인수 writer만 호출하면 player0행이다. writer가 없으면 위치·최소행수는 **미확인→BLOCKED**다. ResourceAuthority58–81의new-run constructor를 restore로 재호출하지 않는다. Q/E·입력·행동/부활은 보호다 |
| native_normal_enemy_hurte.gd | 최초 pin758–760의unported_skip과 원game43116의10킬 조건에 **통지1행 최소**. State의apply_native_add_exp 종료 직전에도 원43171의 **통지1행 최소**가 후보이다. session참조 공급선은 미확인이므로 함께 소유 범위를 확정한다. 기존조건·처치순서·피해·RNG는 변경0 |
| hud.gd / world.gd | HUD97–102의state bind와804–870 읽기를 재사용하면0행이다. World2486의boot map binding에서 복원stage를 기존경로가 소비하면0행이다. stage교체API가 없으면 World추가행수는 **미확인→맵/P3-002 인수 전 BLOCKED**다. geometry/collision/camera/스폰수치 변경0 |
| 종료·로비 | 원63655–63692에 대응하는 신호 구독은 신규session에서 하여 공용수정0행을 우선한다. 기존 화면전환·종료API를 먼저 확정한다. 종료 시 비동기요청 시도만 하고 ACK를 못 받은 상태를 성공으로 보고하지 않는다 |

| 검증 항목 | 새 테스트·원본 expected·격리·선행 조건 |
|---|---|
| 테스트와 폴더 | `godot/tests/test_native_save_reload.gd`, **`EXODUSER-SaveReload-Isolated-20261020`**, 테스트slot=`trace_save_e2e`. 실제 Main 리소스 import는 자기WT에서 별도 검수한다. 다른 게임/QA 실측과 동시에 실행하지 않는다 |
| 두 프로세스 | 첫 프로세스는 정상부트→허용 입력/진행→저장ACK→종료, 둘째는 같은 버전·격리userdir에서 load한다. 직접fixture 계약검사와 자연플레이 검사를 분리한다. 첫 수집의 Lv/EXP/SP/AP·장비id/동적필드·기록을 재시작 뒤와 비교하며 고정 강무기·드랍을 제품에 주입하지 않는다 |
| 원본값 검사 | game31567/62196–62201/62511–62517의부트회복과 raw 저장값을 분리한다. grit3/v2=1 보존, mats0 profile의 공유풀 별도보존, storage{}유지, 반복로드의악의/창고중복0을 검사한다. API/IO실패·손상파일은 자동신규/덮어쓰기0이어야 한다 |
| 완료·충돌 | 앞 단위와 실제writer·공용범위를 인수한 뒤만 연결한다. 원격SHA·실행source경로·실창1x 카드/복원HUD/오류를 확인한다. 테스트0실패만으로 전체품질PASS를 선언하지 않는다. PC는 지정실행 전 미확인이다. TRACE-META/INVENTORY/QUICKSLOT/SETTINGS/REVIVE와 P2-006b/P3-002 최신 소유를 확인한다 |


## 5. 공용 파일에서 접점 협의가 필요한 곳 (이번 수정 0)

| 공용 파일 | 현재 근거·관련 원본 | 향후 접점 / 보호·소유 조건 |
|---|---|---|
| `godot/scripts/main.gd` | 106–183는 무조건new run 구성, source factory/RNG→provider→applyStats→add_child/refill. 원본62459–62481·63959–63981은 load 결과와 신규를 구분;3935–3977은 wall-clock 조정 | saved run 진입 분기·검증된 collector/slot/primitive/lifecycle 바인딩·종료 요청을 연결할 접점. 한정 line patch 소유/순서 사전인수 필요. 지금 new run을 임의조건으로 끊거나 fresh constructor를 restore로 재사용하지 않음 |
| `godot/scripts/hud.gd` | 97–102 state bind,804–870 실제P/G값 표시,902snapshot. index 목록/삭제UI는 별도 | restore 뒤 실제 상태 reader에서 새 값 표시·실패안내/로비이동 접점. slot menu는 별도모듈 우선 후보, HUD에 세이브 데이터를 직접 write하는 제안 없음 |
| `godot/scripts/world.gd` | 905–954 map/encounters read;2486 부트맵source-state bind,2803 snapshot. 원본3731 game.stage/62517 initStage | 복원된stage에 맞는 기존 stage 소비경로 준비 여부와 로딩 완료 경계. 맵geometry/collision/camera·진행중P3-002/지역값 수정은 제외. map.json을 저장으로 쓰지 않음 |
| `godot/scripts/player.gd` | 실제hp/max_hp/stamina/max_stamina·owner API;State549–574가 actor readback. 원본3619–3623·applyStats27902 및부트initStage31567 | 복원값의 실제 actor owner 대입/최대치재계산/부트회복 접점 확인 필요. constructor 전용쓰기 제한을 해제하자는 제안 아님. **Q/E·상태기계·패링/돌진 입력 보호** |
| `godot/scripts/native_normal_enemy_hurte.gd` | 758–760은 원본43116의10킬 dbSaveNow 미이식 로그. 보상/kill pipeline 이미공용 | 검증된 저장요청 owner에 이벤트 통지할 원 접점만 있음. 피해·드랍 RNG·포이즈·kill순서 변경0. P2-006a/전투 담당과 호출 정확1회 협의 |
| `godot/scripts/native_source_new_run_state.gd` | 59–63/146–153 실제G/P/INV·175–185/549readers;399reward bags·490–525 exp/queue/save부재;796–804 starter equip | 직렬화current-reader의 필드소유·restorewriter·성장/예약/보상주머니 소유 연결 필요. boot packet/default를 saved value로 위장하지 않음. 공용 G/P 객체 identity와 actor/Resource 읽기권위 보존. **세이브형식·Q/E보호** |

추가 비공용 의존 접점은 `native_source_resource_authority.gd`(실자원), `native_source_player_providers.gd`(rawgrit), 기존 `save_adapter` 2모듈, `player_passives_source`와 applyStats initializer다. 이것들의 소유도 이번 작업으로 확보되지 않았다.

## 6. 검수 판정·남은 미확인

| 항목 | 판정 |
|---|---|
| 원본 추적 | 선언/상수/다섯payload/공용restore 전구간/저장호출/슬롯UI/API를 행표로 기록. 아래 부록은 source에서 기계추출한 직접 필드·호출 인덱스이며 전게임P/G동적쓰기 전체 조사가 아님 |
| 설계 불일치 | 이 문서 표로만 기록. 기존 설계 docs/2_3·게임·테스트 수정0 |
| Godot | 존재모듈/호출/테스트소스 확인 + 저장부분모듈구문2건 성공. 저장 IO·자연재시작·이식완료는 미확인 |
| 기존 웹 회귀 | 선별60건 중48통과12실패. 실패보존, 수정/재실행 없음. 전체PASS 아님 |
| 실행·동기화 | R브랜치/HEAD/INDEX/WORK 보존 확인 대상. 새branch 문서제출은PC/Mac/Git게임동기화 완료가 아님. PC 접근/실행미확인 |
| 다음 권한·책임 | P4 exactscope와 보호형식 유지·공용접점·owner를 총괄이 배정한 후만 구현. 이 추적 자체는 코드변경을 허가하지 않음. blocking tool denial 없음; 미구현 의존성은 설계의 선행조건이며 이 추적 제출의 BLOCKED 사유는 아님 |

## 부록 A. 모든 직접 저장 요청 호출 행

정의/내부 pump 재호출도 포함한다. 함수 alias 대입 자체는 §1.2, 외부 JS 모듈의 호출은 여기 분모에 넣지 않았다. Q/E 연관 슬롯 호출은 **보호**다.

| game.html 행 | 직접 호출·문맥(원문) |
|---|---|
| 3584 | `_saving=false;_drainPendingSaveNow();if(_pendingForce){_pendingForce=false;if(Date.now()-_lastSaveTime>=5000)dbSave()}` |
| 3938 | `if(G.on&&_dbReady)dbSave();` |
| 3958 | `dbSave();` |
| 3965 | `dbSave();` |
| 3973 | `if(_now2-_lastSaveTime<5000){if(!_saveDebounce)_saveDebounce=setTimeout(()=>{_saveDebounce=null;dbSaveForce()},5000-(_now2-_lastSaveTime));return}` |
| 3976 | `dbSave();` |
| 12913 | `if(slotIdx>=0&&!_canAssignSkillSlot(sid,slotIdx)){_repairAreaSkillSlot();updateQS();dbSaveNow();return false}` |
| 13318 | `if(ults.length===1){ULT_SLOT=ULT_SLOT?null:ults[0].id;_updateUltSlot();dbSaveNow();return}` |
| 13323 | `_updateUltSlot();dbSaveNow();` |
| 13327 | `uel.addEventListener('contextmenu',(ev)=>{ev.preventDefault();ULT_SLOT=null;_updateUltSlot();dbSaveNow();addTxt(P.x,P.y-20,_T('필살기 해제'),'#bbbbbb',30)});` |
| 13802 | `if(si>=0){SKILL_SLOTS[si]=skId;if(typeof updateQS==='function')updateQS();if(typeof dbSaveNow==='function')dbSaveNow();const _slNm=si<4?_T('슬롯')+(si+1):si===4?'SP'+_T('슬롯'):'F'+_T('슬롯');addTxt(P.x,P.y-20,_slNm+': '+_T(cur.querySelector('.sk-opt-name')?.textContent\|\|skId),'#ff8844',40);SFX.pickup()}` |
| 15496 | `if(detachCrystal(item,si)){dbSaveNow();renderInvCrystals();}` |
| 15501 | `if(attachCrystal(item,si,cr,bi)){dbSaveNow();renderInvCrystals();}` |
| 15568 | `if(attachCrystal(item,si,cr,bi)){dbSaveNow();renderInvCrystals();}` |
| 15629 | `if(attachCrystal(item,si,cr,bi)){dbSaveNow();renderInvCrystals();}` |
| 15809 | `dbSaveNow();renderInvCrystals();` |
| 15826 | `applyStats();dbSaveNow();renderInvCrystals();` |
| 16365 | `dbSaveForce();` |
| 16379 | `dbSaveForce();` |
| 16395 | `dbSaveNow();` |
| 16402 | `if(_boneRegister(item)){dbSaveForce();return true}` |
| 16409 | `window._systemLesson?.pickedUp(item);dbSaveForce();return true;` |
| 16423 | `window._systemLesson?.pickedUp(item);dbSaveForce();return true;` |
| 28183 | `if(res.used>0)dbSaveNow();` |
| 28587 | `updateQS();dbSaveNow();return;` |
| 28607 | `updateQS();dbSaveNow();return;` |
| 42005 | `if(_dbReady)dbSave(); // 클리어 보상·기록은 다음 자동저장 전에 확정` |
| 43116 | `if(G.kills%10===0)dbSaveNow(); // 10킬마다 자동저장` |
| 43171 | `dbSaveForce();` |
| 44983 | `dNone.onclick=()=>{SKILL_SLOTS[slotIdx]=null;pop.style.display='none';updateQS();dbSaveNow();const _slL=(slotIdx<4?_L('슬롯','Slot ')+(slotIdx+1):slotIdx===4?_L('Space 슬롯','Space Slot'):_L('F슬롯','F Slot'));addTxt(P.x,P.y-20,_slL+_L(' 해제',' Unset'),'#bbbbbb',30)};` |
| 44996 | `pop.style.display='none';updateQS();dbSaveNow();` |
| 45851 | `dbSaveForce();` |
| 45873 | `dbSaveForce();` |
| 47011 | `d.onclick=()=>{if(_fuseHostSk){if(_skPopTab==='lmb')P.activeLMBSk=_fuseHostSk;else if(_skPopTab==='magic')P.activeMagicSk=_fuseHostSk;else if(_skPopTab==='charge')P.activeChargeSk=_fuseHostSk;else if(_skPopTab==='bow')P.activeBowSk=_fuseHostSk;addTxt(P.x,P.y-30,_T(ct.fuseName)+_L(' 세팅!',' Set!'),'#ffcc44',40);SFX.pickup();updateSkSlot();dbSaveForce()}_closeSkPop()};` |
| 47026 | `_fd.onclick=()=>{if(_skPopTab==='lmb'){P.activeLMBSk=id}else if(_skPopTab==='rmb'){P.activeRMBSk=id}else if(_skPopTab==='magic'){P.activeMagicSk=id}else if(_skPopTab==='bow'){P.activeBowSk=id}else if(_skPopTab==='charge'){P.activeChargeSk=id}else if(_skPopTab==='q'){P.activeQSk=id}else if(_skPopTab==='ct'){P.activeCtSk=id}addTxt(P.x,P.y-30,_fi.emoji+' '+_skN(_fi)+_L(' 세팅!',' Set!'),'#ffcc44',40);SFX.pickup();updateSkSlot();dbSaveForce();_closeSkPop()};` |
| 47063 | `SFX.pickup();updateSkSlot();dbSaveForce();` |
| 47080 | `SFX.pickup();updateSkSlot();dbSaveForce();` |
| 47137 | `ULT_SLOT=d.skId;_updateUltSlot();dbSaveNow();` |
| 47154 | `SFX.pickup();updateQS();renderSkillPanel();dbSaveForce();dropped=true;break;` |
| 47175 | `SFX.pickup();dbSaveNow();dropped=true;` |
| 47229 | `renderSkillPanel();if(typeof updateSkSlot==='function')updateSkSlot();if(typeof updateQS==='function')updateQS();dbSaveForce();` |
| 47322 | `updateQS();if(typeof updateSkSlot==='function')updateSkSlot();renderSkillPanel();dbSaveForce();` |
| 47816 | `renderSkillPanel();updateSkSlot();updateQS();dbSaveForce();` |
| 47881 | `renderSkillPanel();updateSkSlot&&updateSkSlot();updateQS&&updateQS();dbSaveForce();` |
| 47953 | `renderSkillPanel();updateSkSlot();updateQS();dbSaveForce();` |
| 48296 | `renderSkillPanel();updateSkSlot&&updateSkSlot();updateQS&&updateQS();dbSaveForce();` |
| 48402 | `_skHierTab='rec';_fuseSelId=null;_closeSkPop();updateQS();updateSkSlot();renderSkillPanel();dbSaveForce();` |
| 48441 | `updateQS();renderSkillPanel();dbSaveForce();` |
| 48597 | `SFX.pickup();_persistSharedStorage();renderInv();dbSaveNow();return true;` |
| 48608 | `const wi=store[idx];wi._gx=null;wi._gy=null;INV.bag.push(wi);store.splice(idx,1);INV.selected=null;SFX.pickup();_persistSharedStorage();renderInv();dbSaveNow();` |
| 50244 | `if(ok)eb.onclick=()=>{G.mats-=cost;BAG_MAX+=6;renderInv();dbSaveNow()};` |
| 50376 | `dbSaveNow();renderInv();` |
| 50405 | `SFX.pickup();dbSaveNow();renderInv();` |
| 50474 | `_forgeSel=null;renderForge();dbSaveNow();` |
| 50640 | `renderForge();dbSaveNow();` |
| 50784 | `G.shake=3;renderForge();dbSaveNow();` |
| 50836 | `btnRow.appendChild(mkBtn(_L('어픽스 리롤','Affix Reroll'),REROLL_COST,()=>{if(G.mats<REROLL_COST){notify(_T('악의 부족!'));return}G.mats-=REROLL_COST;rerollAffixes(rIt);SFX.forge();addTxt(P.x,P.y-20,_T('어픽스 리롤!'),'#44ccff',60);recalcSt();applyStats();renderForge();dbSaveNow()}));` |
| 50912 | `_crForgeSel=-1;applyStats();renderForge();dbSaveNow()}` |
| 50948 | `cr.enh=(cr.enh\|\|0)+1;SFX.forge();addTxt(P.x,P.y-20,_crDefN(d)+' +'+cr.enh+'!','#bb88ff',50);applyStats();renderForge();dbSaveNow()};` |
| 50998 | `_crForgeSel=-1;applyStats();renderForge();dbSaveNow();` |
| 51017 | `_crForgeSel=-1;applyStats();renderForge();dbSaveNow();` |
| 51032 | `row.onclick=()=>{CRYSTAL_BAG.splice(i,1);CRYSTAL_DUST+=dustGet;_crForgeSel=-1;SFX.forge();addTxt(P.x,P.y-20,_T('분해! 가루 +')+dustGet,'#ff8844',50);renderForge();dbSaveNow()};` |
| 51064 | `btn.onclick=()=>{if(!ok)return;CRYSTAL_DUST-=dustCost;CRYSTAL_BAG.push({id:_crCraftType,star:_crCraftStar,enh:0,q:_qRoll()});SFX.forge();addTxt(P.x,P.y-20,_crStarN(s)+' '+_crDefN(cd)+' '+_T('제작!'),s.color,60);renderForge();dbSaveNow()};` |
| 51077 | `b.onclick=()=>{if(G.mats<_crMatsCost){notify(_T('악의가 부족합니다!'));return}if(CRYSTAL_BAG.length>=CRYSTAL_BAG_MAX){notify(_T('유물 주머니 가득!'));return}G.mats-=_crMatsCost;CRYSTAL_BAG.push({id,star:0,enh:0,q:_qRoll()});SFX.forge();addTxt(P.x,P.y-20,d.emoji+' '+_crStarN(CRYSTAL_STAR[0])+' '+_crDefN(d)+' '+_T('제작!'),'#cc66ff',50);renderForge();dbSaveNow()};` |
| 51215 | `applyStats();SFX.pickup();renderStatPanel();dbSaveNow();` |
| 51249 | `applyStats();SFX.levelup();renderStatPanel();dbSaveNow();return true;` |
| 51256 | `P._passiveQueue=queue;renderStatPanel();dbSaveNow();return true;` |
| 51260 | `queue.splice(index,1);P._passiveQueue=queue;renderStatPanel();dbSaveNow();return true;` |
| 51267 | `P.sp=next.points;applyStats();SFX.pickup();renderStatPanel();dbSaveNow();` |
| 51274 | `applyStats();SFX.levelup();renderStatPanel();dbSaveNow();` |
| 62092 | `startAutoSave();setTimeout(()=>dbSave(),3000);` |
| 62213 | `setTimeout(()=>dbSave(),3000);` |
| 63530 | `if(_dbReady)await dbSave();` |
| 63656 | `if(_dbReady)await dbSave();` |
| 63679 | `if(_dbReady)await dbSave();` |
| 63691 | `dbSave();` |
| 63940 | `finally{_saving=false;_drainPendingSaveNow();if(_pendingForce){_pendingForce=false;if(Date.now()-_lastSaveTime>=5000)dbSave()}}` |
| 64042 | `setTimeout(()=>dbSave(),3000);` |
| 64092 | `finally{_saving=false;_drainPendingSaveNow();if(_pendingForce){_pendingForce=false;if(Date.now()-_lastSaveTime>=5000)dbSave()}}` |
| 64158 | `setTimeout(()=>dbSave(),3000);` |

## 부록 B. 파일 선언 리터럴의 전 키·초깃값

P는 mkP 반환 직후 값이며 최종저장값/장비적용후값이 아니다. G는 파일선언값이며 stage 초기화가 후속필드를 추가한다. INV.selected 등 transient를 저장하자는 제안이 아니다. **세이브/Q·E 보호**.

| 객체·키 | 원 표현식 | game.html 행 |
|---|---|---|
| `G.on` | `false` | 16714 |
| `G.paused` | `false` | 16714 |
| `G.stage` | `0` | 16714 |
| `G.kills` | `0` | 16714 |
| `G.mats` | `0` | 16714 |
| `G.cam` | `{x:0,y:0}` | 16714 |
| `G.shake` | `0` | 16714 |
| `G.parts` | `[]` | 16714 |
| `G.txts` | `[]` | 16714 |
| `G.forgeOpen` | `false` | 16715 |
| `G.forgeTab` | `'upgrade'` | 16715 |
| `G.forgeExpanded` | `false` | 16715 |
| `G.forgeSort` | `null` | 16715 |
| `G.rooms` | `[]` | 16715 |
| `G.curRoom` | `0` | 16715 |
| `G.map` | `null` | 16715 |
| `G.mw` | `0` | 16715 |
| `G.mh` | `0` | 16715 |
| `G.hitStop` | `0` | 16715 |
| `G.slowMo` | `0` | 16715 |
| `G.stageCleared` | `false` | 16715 |
| `G._stageDiffOff` | `0` | 16715 |
| `G.exits` | `[]` | 16715 |
| `G.bossAlive` | `true` | 16715 |
| `G._chainCnt` | `0` | 16716 |
| `G._chainT` | `0` | 16716 |
| `G.rifts` | `[]` | 16716 |
| `G.spawnHoles` | `[]` | 16716 |
| `G.atkTickets` | `0` | 16716 |
| `G.maxAtkTickets` | `3` | 16716 |
| `G._irisSz` | `20` | 16716 |
| `G.combo` | `0` | 16717 |
| `G.comboTimer` | `0` | 16717 |
| `G.comboMax` | `0` | 16717 |
| `G.stageTime` | `0` | 16717 |
| `G._zones` | `null` | 16718 |
| `G._curZone` | `0` | 16718 |
| `G._zoneState` | `{}` | 16718 |
| `G._portals` | `null` | 16718 |
| `G._playerPortalPair` | `null` | 16718 |
| `P.x` | `0` | 29017 |
| `P.y` | `0` | 29017 |
| `P.r` | `15` | 29017 |
| `P.hp` | `350` | 29017 |
| `P.mhp` | `350` | 29017 |
| `P.st` | `200` | 29017 |
| `P.mst` | `200` | 29017 |
| `P.stR` | `.28` | 29017 |
| `P.mp` | `160` | 29017 |
| `P.mmp` | `160` | 29017 |
| `P.mpR` | `0` | 29017 |
| `P.lv` | `1` | 29018 |
| `P.exp` | `0` | 29018 |
| `P.maxExp` | `15` | 29018 |
| `P.sp` | `0` | 29018 |
| `P.ap` | `0` | 29018 |
| `P.baseAtk` | `8` | 29019 |
| `P.baseDef` | `2` | 29019 |
| `P.speed` | `2.6` | 29019 |
| `P.facing` | `0` | 29019 |
| `P.s` | `'idle'` | 29020 |
| `P.st2` | `0` | 29020 |
| `P.atkArc` | `0` | 29020 |
| `P.swProg` | `0` | 29020 |
| `P.iframes` | `0` | 29020 |
| `P.combo` | `0` | 29020 |
| `P.comboT` | `0` | 29020 |
| `P.blockFlash` | `0` | 29020 |
| `P.blockPushT` | `0` | 29020 |
| `P.chargeDx` | `0` | 29021 |
| `P.chargeDy` | `0` | 29021 |
| `P.chargeSpd` | `0` | 29021 |
| `P.chargeHits` | `null` | 29021 |
| `P.chargeKills` | `0` | 29021 |
| `P.chargeCd` | `0` | 29021 |
| `P.chargeStocks` | `1` | 29021 |
| `P.maxChargeStocks` | `1` | 29021 |
| `P.kb` | `{x:0,y:0}` | 29021 |
| `P.shield` | `0` | 29022 |
| `P.mshield` | `0` | 29022 |
| `P.shieldRegenT` | `0` | 29022 |
| `P.wwAng` | `0` | 29022 |
| `P.rage` | `0` | 29022 |
| `P.activeChargeSk` | `'charge'` | 29023 |
| `P.activeBowSk` | `'normal'` | 29024 |
| `P.activeTechSk` | `'giantSlam'` | 29025 |
| `P.activeMagicSk` | `'fireball'` | 29026 |
| `P.activeLMBSk` | `'kiSlash'` | 29027 |
| `P.activeRMBSk` | `'maliceSwipe'` | 29028 |
| `P.activeQSk` | `'parry'` | 29029 |
| `P.activeCtSk` | `'ghostWalk'` | 29030 |
| `P.skills` | `{kiSlash:1,fireball:1,bladeDash:1,maliceSwipe:1,shieldThrow:1}` | 29031 |
| `P._fused` | `{shieldFuse:true}` | 29031 |
| `P.maskOn` | `true` | 29031 |
| `INV.bag` | `[]` | 16175 |
| `INV.equipped` | `{weapon:null,shield:null,boots:null,armor:null,helmet:null,bow:null,gloves:null,pants:null,belt:null,necklace:null,ring1:null,ring2:null,cape:null,bracelet:null,headband:null,ossuary:null,headband2:null}` | 16176 |
| `INV.selected` | `null` | 16177 |
| `INV.ossCollect` | `{}` | 16178 |

## 부록 C. 다섯 저장 생산자의 고정 필드 전수 대조

각 셀은 `원 표현식` @ `game.html 행`. —는 **그 생산자에 해당 필드가 없음**이며 추가제안이 아니다. player/inv/game는 한 단계 펼쳤고 stats/passives/upgrades/potLv/skills 등의 spread 및 동적 객체는 실제표현식 그대로다. inv item 내부 enumerable 필드 전부는 JSON 엔진이 재귀직렬화하므로 별도의 고정schema로 축소하지 않는다. **모든 행: 세이브 형식 보호**, activeQSk/activeRMBSk 관련은 Q/E도 보호.

| JSON 경로 | Cloud | Local API | Web | Demo Lv1 | Demo500 |
|---|---|---|---|---|---|
| `player.lv` | `P.lv` @3545 | `P.lv` @63907 | `P.lv` @64064 | `P.lv` @62133 | `P.lv` @61998 |
| `player.exp` | `P.exp` @3545 | `P.exp` @63907 | `P.exp` @64064 | `P.exp` @62133 | `P.exp` @61998 |
| `player.maxExp` | `P.maxExp` @3545 | `P.maxExp` @63907 | `P.maxExp` @64064 | `P.maxExp` @62133 | `P.maxExp` @61998 |
| `player.sp` | `P.sp` @3545 | `P.sp` @63907 | `P.sp` @64064 | `P.sp` @62133 | `P.sp` @61998 |
| `player.ap` | `P.ap\|\|0` @3545 | `P.ap\|\|0` @63907 | `P.ap\|\|0` @64064 | `P.ap\|\|0` @62133 | `P.ap\|\|0` @61998 |
| `player.passiveQueue` | `_passiveQueueItems()` @3545 | `_passiveQueueItems()` @63907 | `_passiveQueueItems()` @64064 | `_passiveQueueItems()` @62133 | `_passiveQueueItems()` @61998 |
| `player.transLvDate` | `P._transLvDate\|\|null` @3546 | `P._transLvDate\|\|null` @63908 | `P._transLvDate\|\|null` @64065 | `P._transLvDate\|\|null` @62134 | — |
| `player.transLvCount` | `P._transLvCount\|\|0` @3546 | `P._transLvCount\|\|0` @63908 | `P._transLvCount\|\|0` @64065 | `P._transLvCount\|\|0` @62134 | — |
| `player.apBossCleared` | `P._apBossCleared\|\|[]` @3546 | `P._apBossCleared\|\|[]` @63908 | `P._apBossCleared\|\|[]` @64065 | `P._apBossCleared\|\|[]` @62135 | — |
| `player.goddessGift` | `P._goddessGift\|\|[]` @3546 | `P._goddessGift\|\|[]` @63908 | `P._goddessGift\|\|[]` @64065 | `P._goddessGift\|\|[]` @62135 | — |
| `player._lvStatMigrated` | `P._lvStatMigrated\|\|false` @3546 | — | — | — | — |
| `player.baseAtk` | `P.baseAtk` @3547 | `P.baseAtk` @63909 | `P.baseAtk` @64066 | `P.baseAtk` @62136 | `P.baseAtk` @61999 |
| `player.baseDef` | `P.baseDef` @3547 | `P.baseDef` @63909 | `P.baseDef` @64066 | `P.baseDef` @62136 | `P.baseDef` @61999 |
| `player.mpR` | `P.mpR` @3547 | `P.mpR` @63909 | `P.mpR` @64066 | `P.mpR` @62136 | `P.mpR` @61999 |
| `player.stR` | `P.stR` @3547 | `P.stR` @63909 | `P.stR` @64066 | `P.stR` @62136 | `P.stR` @61999 |
| `player.hp` | `P.hp` @3548 | `P.hp` @63910 | `P.hp` @64067 | `P.hp` @62137 | `P.hp` @62000 |
| `player.mhp` | `P.mhp` @3548 | `P.mhp` @63910 | `P.mhp` @64067 | `P.mhp` @62137 | `P.mhp` @62000 |
| `player.mp` | `P.mp` @3548 | `P.mp` @63910 | `P.mp` @64067 | `P.mp` @62137 | `P.mp` @62000 |
| `player.mmp` | `P.mmp` @3548 | `P.mmp` @63910 | `P.mmp` @64067 | `P.mmp` @62137 | `P.mmp` @62000 |
| `player.st` | `P.st` @3548 | `P.st` @63910 | `P.st` @64067 | `P.st` @62137 | `P.st` @62000 |
| `player.mst` | `P.mst` @3548 | `P.mst` @63910 | `P.mst` @64067 | `P.mst` @62137 | `P.mst` @62000 |
| `player.speed` | `P.speed` @3548 | `P.speed` @63910 | `P.speed` @64067 | `P.speed` @62137 | `P.speed` @62000 |
| `player.shield` | `P.shield` @3549 | `P.shield` @63911 | `P.shield` @64068 | `P.shield` @62138 | `P.shield` @62001 |
| `player.mshield` | `P.mshield` @3549 | `P.mshield` @63911 | `P.mshield` @64068 | `P.mshield` @62138 | `P.mshield` @62001 |
| `player.maskOn` | `P.maskOn` @3549 | `P.maskOn` @63911 | `P.maskOn` @64068 | `P.maskOn` @62138 | `P.maskOn` @62001 |
| `inv.bag` | `INV.bag` @3551 | `INV.bag` @63912 | `INV.bag` @64069 | `INV.bag` @62139 | `INV.bag` @62002 |
| `inv.equipped` | `INV.equipped` @3551 | `INV.equipped` @63912 | `INV.equipped` @64069 | `INV.equipped` @62139 | `INV.equipped` @62002 |
| `inv.ossCollect` | `INV.ossCollect\|\|{}` @3551 | `INV.ossCollect\|\|{}` @63912 | `INV.ossCollect\|\|{}` @64069 | `INV.ossCollect\|\|{}` @62139 | `INV.ossCollect\|\|{}` @62002 |
| `stats` | `{...STATS}` @3552 | `{...STATS}` @63913 | `{...STATS}` @64070 | `{...STATS}` @62140 | `{...STATS}` @62003 |
| `passives` | `{...PASSIVES}` @3553 | `{...PASSIVES}` @63913 | `{...PASSIVES}` @64070 | `{...PASSIVES}` @62140 | `{...PASSIVES}` @62003 |
| `grit` | `_grit` @3553 | `_grit` @63913 | `_grit` @64070 | `_grit` @62140 | — |
| `gritCostModeV2` | `1` @3553 | `1` @63913 | `1` @64070 | `1` @62140 | — |
| `qslots` | `QSLOTS` @3554 | `QSLOTS` @63914 | `QSLOTS` @64071 | `QSLOTS` @62141 | `QSLOTS` @62004 |
| `game.stage` | `G.stage` @3555 | `G.stage` @63915 | `G.stage` @64072 | `G.stage` @62142 | `G.stage` @62005 |
| `game.kills` | `G.kills` @3555 | `G.kills` @63915 | `G.kills` @64072 | `G.kills` @62142 | `G.kills` @62005 |
| `game.mats` | `0` @3555 | `0` @63915 | `0` @64072 | `G.mats` @62142 | `G.mats` @62005 |
| `game.irisSz` | `G._irisSz\|\|20` @3555 | `G._irisSz\|\|20` @63915 | `G._irisSz\|\|20` @64072 | `G._irisSz\|\|20` @62142 | — |
| `game.taRecords` | `G._taRecords\|\|{}` @3555 | `G._taRecords\|\|{}` @63915 | `G._taRecords\|\|{}` @64072 | `G._taRecords\|\|{}` @62143 | — |
| `game.clearRecords` | `G._clearRecords\|\|{}` @3555 | `G._clearRecords\|\|{}` @63915 | `G._clearRecords\|\|{}` @64072 | `G._clearRecords\|\|{}` @62143 | — |
| `game.comboMax` | `G.comboMax\|\|0` @3555 | `G.comboMax\|\|0` @63915 | `G.comboMax\|\|0` @64072 | `G.comboMax\|\|0` @62143 | — |
| `game.playTime` | `G.playTime\|\|0` @3555 | `G.playTime\|\|0` @63915 | `G.playTime\|\|0` @64072 | `G.playTime\|\|0` @62143 | — |
| `game.cutsceneDone` | `G._cutsceneDone\|\|false` @3555 | `G._cutsceneDone\|\|false` @63915 | `G._cutsceneDone\|\|false` @64072 | `G._cutsceneDone\|\|false` @62144 | `true` @62005 |
| `bagMax` | `BAG_MAX` @3556 | `BAG_MAX` @63916 | `BAG_MAX` @64073 | `BAG_MAX` @62145 | `BAG_MAX` @62006 |
| `hellCleared` | `G.hellCleared\|\|[]` @3557 | `G.hellCleared\|\|[]` @63916 | `G.hellCleared\|\|[]` @64073 | `G.hellCleared\|\|[]` @62145 | `G.hellCleared\|\|[]` @62006 |
| `storage` | `{}` @3558 | `{}` @63916 | `{}` @64073 | `{}` @62145 | `{}` @62006 |
| `crystalBag` | `CRYSTAL_BAG` @3559 | `CRYSTAL_BAG` @63917 | `CRYSTAL_BAG` @64074 | `CRYSTAL_BAG` @62146 | — |
| `crystalDust` | `CRYSTAL_DUST` @3559 | `CRYSTAL_DUST` @63917 | `CRYSTAL_DUST` @64074 | `CRYSTAL_DUST` @62146 | — |
| `stoneBag` | `STONE_BAG` @3559 | `STONE_BAG` @63917 | `STONE_BAG` @64074 | `STONE_BAG` @62146 | — |
| `upgrades` | `{...UPGRADES}` @3560 | `{...UPGRADES}` @63918 | `{...UPGRADES}` @64075 | `{...UPGRADES}` @62147 | `{...UPGRADES}` @62007 |
| `potLv` | `{...POT_LV}` @3561 | `{...POT_LV}` @63918 | `{...POT_LV}` @64075 | `{...POT_LV}` @62147 | `{...POT_LV}` @62007 |
| `skills` | `{...P.skills}` @3562 | `{...P.skills}` @63918 | `{...P.skills}` @64075 | `{...P.skills}` @62147 | `{...P.skills}` @62007 |
| `fused` | `P._fused\|\|{}` @3563 | `P._fused\|\|{}` @63919 | `P._fused\|\|{}` @64076 | `P._fused\|\|{}` @62148 | `P._fused\|\|{}` @62008 |
| `skProf` | `P._skProf\|\|{}` @3563 | `P._skProf\|\|{}` @63919 | `P._skProf\|\|{}` @64076 | `P._skProf\|\|{}` @62148 | `P._skProf\|\|{}` @62008 |
| `fuseProfSec` | `P._fuseProfSec\|\|{}` @3563 | `P._fuseProfSec\|\|{}` @63919 | `P._fuseProfSec\|\|{}` @64076 | `P._fuseProfSec\|\|{}` @62148 | — |
| `cardProf` | `P._cardProf\|\|{}` @3563 | `P._cardProf\|\|{}` @63919 | `P._cardProf\|\|{}` @64076 | `P._cardProf\|\|{}` @62149 | — |
| `catProf` | `P._catProf\|\|{}` @3563 | `P._catProf\|\|{}` @63919 | `P._catProf\|\|{}` @64076 | `P._catProf\|\|{}` @62149 | — |
| `activeChargeSk` | `P.activeChargeSk\|\|'charge'` @3564 | `P.activeChargeSk\|\|'charge'` @63920 | `P.activeChargeSk\|\|'charge'` @64077 | `P.activeChargeSk\|\|'charge'` @62150 | `P.activeChargeSk\|\|'charge'` @62009 |
| `activeBowSk` | `P.activeBowSk\|\|'normal'` @3565 | `P.activeBowSk\|\|'normal'` @63921 | `P.activeBowSk\|\|'normal'` @64078 | `P.activeBowSk\|\|'normal'` @62151 | `P.activeBowSk\|\|'normal'` @62010 |
| `activeTechSk` | `P.activeTechSk\|\|'giantSlam'` @3566 | `P.activeTechSk\|\|'giantSlam'` @63922 | `P.activeTechSk\|\|'giantSlam'` @64079 | `P.activeTechSk\|\|'giantSlam'` @62152 | — |
| `activeMagicSk` | `P.activeMagicSk\|\|'fireball'` @3567 | `P.activeMagicSk\|\|'fireball'` @63923 | `P.activeMagicSk\|\|'fireball'` @64080 | `P.activeMagicSk\|\|'fireball'` @62153 | `P.activeMagicSk\|\|'arcLaser'` @62011 |
| `activeLMBSk` | `P.activeLMBSk\|\|'whirlwind'` @3568 | `P.activeLMBSk\|\|'whirlwind'` @63924 | `P.activeLMBSk\|\|'whirlwind'` @64081 | `P.activeLMBSk\|\|'whirlwind'` @62154 | `P.activeLMBSk\|\|'whirlwind'` @62012 |
| `activeRMBSk` | `P.activeRMBSk\|\|'shieldBlock'` @3569 | `P.activeRMBSk\|\|'shieldBlock'` @63925 | `P.activeRMBSk\|\|'shieldBlock'` @64082 | `P.activeRMBSk\|\|'shieldBlock'` @62155 | `P.activeRMBSk\|\|'shieldBlock'` @62013 |
| `activeQSk` | `P.activeQSk\|\|'parry'` @3570 | `P.activeQSk\|\|'parry'` @63926 | `P.activeQSk\|\|'parry'` @64083 | `P.activeQSk\|\|'parry'` @62156 | `P.activeQSk\|\|'peaceShield'` @62014 |
| `activeCtSk` | `P.activeCtSk\|\|'ghostWalk'` @3571 | `P.activeCtSk\|\|'ghostWalk'` @63927 | `P.activeCtSk\|\|'ghostWalk'` @64084 | `P.activeCtSk\|\|'ghostWalk'` @62157 | `P.activeCtSk\|\|'ghostWalk'` @62015 |
| `skillSlots` | `SKILL_SLOTS` @3572 | `SKILL_SLOTS` @63928 | `SKILL_SLOTS` @64085 | `[...SKILL_SLOTS]` @62158 | `[...SKILL_SLOTS]` @62016 |
| `ultSlot` | `ULT_SLOT` @3573 | `ULT_SLOT` @63929 | `ULT_SLOT` @64086 | `ULT_SLOT` @62158 | `ULT_SLOT` @62016 |
| `charIdx` | `_charIdx` @3574 | `_charIdx` @63930 | `_charIdx` @64087 | `_charIdx` @62158 | `_charIdx` @62016 |
| `ts` | — | `Date.now()` @63906 | `Date.now()` @64063 | `Date.now()` @62132 | `Date.now()` @61997 |

## 부록 D. 아이템 생성기·투명 직렬화의 하위 필드 근거

`mkItem` 내부 `item` 리터럴(15954–15956)의 7키와 `item.<key>` 참조를 전수 인덱싱했다. read/write/delete가 섞인 **참조 인덱스**이며 모든 아이템이 이 키를 전부 가진다는 뜻은 아니다. 15995 등 base-derived 속성도 실제 item 대입으로 포함된다. 동적 `item[_us.stat]` 등은 아래에 별도 기록했다. 다른 제작/강화/유골/그리드 루틴은 추가 필드를 붙일 수 있으며 이 객체 전체 직렬화 계약에 포함된다. 세이브 형식 보호.

| 식별자 | game.html 행(정적참조) |
|---|---|
| `_implicitKo` | 16122, 16162 |
| `_implicitStat` | 16120, 16162 |
| `_implicitVal` | 16121, 16162 |
| `affixes` | 16063, 16066, 16067, 16075, 16078, 16079, 16114, 16160 |
| `anc` | 16157 |
| `ancPow` | 16158 |
| `atk` | 15964, 15979, 15992 |
| `atkSpd` | 16045 |
| `bDex` | 16159 |
| `bGrit` | 16093, 16159 |
| `bInt` | 16159 |
| `bLck` | 16092, 16159 |
| `bStr` | 16159 |
| `beamDmg` | 16023, 16024, 16031 |
| `bonusChargeDist` | 16003 |
| `bonusHp` | 16012, 16049, 16054 |
| `bonusMp` | 16014, 16158 |
| `bonusRange` | 15970, 15984, 15989, 16002, 16040 |
| `bonusShield` | 16013 |
| `bonusSt` | 15996 |
| `bowPierce` | 15985 |
| `bowProjSpd` | 15983 |
| `bowRange` | 15982 |
| `bowSpd` | 15980 |
| `bowStCost` | 15981 |
| `brType` | 16108, 16110, 16114, 16116 |
| `btype` | 15976 |
| `charge` | 15997 |
| `chargeAoE` | 16008 |
| `chargeCharge` | 16018 |
| `chargeDist` | 15998 |
| `chargeW` | 15999 |
| `crystals` | 16150, 16164 |
| `def` | 15993 |
| `eDef` | 15994, 16158 |
| `el` | 15954, 16156 |
| `elements` | 16024, 16031, 16033, 16034 |
| `emoji` | 15956, 15963, 15978, 16157 |
| `id` | 15954 |
| `itemLv` | 16146 |
| `legendarySpecial` | 16125, 16130, 16161 |
| `magicPen` | 16038 |
| `name` | 15955, 15962, 15977, 16033, 16034, 16110, 16140, 16157 |
| `potCd` | 16044, 16053 |
| `range` | 16011 |
| `rarity` | 15954, 16156 |
| `reqLv` | 16147, 16163 |
| `shieldWt` | 15990 |
| `slot` | 15895, 15954 |
| `socketCount` | 16149, 16164 |
| `socketQ` | 16151, 16164 |
| `spd` | 15965, 15995 |
| `splashMul` | 16037 |
| `splashR` | 16036 |
| `stagger` | 16010 |
| `tier` | 15954, 16156 |
| `unique` | 16156 |
| `uniqueArt` | 16140 |
| `uniqueSpecial` | 16133, 16141, 16161 |
| `wArcW` | 15967 |
| `wRange` | 15968 |
| `wStCost` | 15966 |
| `wStagger` | 15969 |
| `wtype` | 15961 |
| `item[_extra]` (동적키) | 16095 |
| `item[sk]` (동적키) | 16102 |
| `item[_ls.stat]` (동적키) | 16130 |
| `item[_us.stat]` (동적키) | 16141 |

## 부록 E. 전수 인덱스 확인 방법

| 범위 | 방법·분모 |
|---|---|
| 직접 저장 호출 | game.html 전체 정규식 `\bdbSave(?:Now\|Force)?\s*\(`, 함수선언 제외 80행. 한행 여러호출은 같은 source행으로 표시 |
| 선언 리터럴 | 문자열/주석/괄호 중첩을 구분한 top-level 필드 분리: G 40키, mkP 54키, INV 4키. 하위동적필드나 전게임writer 수가 아님 |
| 저장고정필드 | 다섯실제 리터럴을 재평가 없이 lexical 분리·player/inv/game만 펼침. union 68경로, cloud:67, local:67, web:67, demo:67, 500:49 |
| 관련 docs 검색 | docs 전체 Markdown의 dbSave/dbRestore/api-slots/save_adapter/raw_grit/queue/shared 키워드 검색 수행. 기존문서 내용 수정0. 본문불일치의 기준은 지정설계폴더2파일 |
| 한계 | 원본JS 런타임JSON 결과/undefined 생략/NaN→null·getter·외부모듈·비정상입력·Godot round-trip·실제slot ownership은 별도행동검증 전 **미확인**. 이부록은 source trace이며 동작동등성테스트가 아님 |
