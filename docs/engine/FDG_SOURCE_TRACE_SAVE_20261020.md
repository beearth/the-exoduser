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
| S01 | 기본 `dbSave`, game:3533–3585 | QA early return, parryLesson.active return(**보호**), charId/dbReady/saving/P 가드. sanitize→공유 악의구슬/dirty창고 flush→payload→`characters.update({data,updated_at}).eq(id).select(id)`. 요청 id와 일치하는 정확1행만 `_lastSaveTime`. finally 상당 꼬리에서 pending drain/force |
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
| T03 | `_saveSharedMatsToServer`, `_matsDirty`, `_loadSharedMatsFromServer`, 48531–48536 | 로컬 host/file에서 API. dirty3초 게이트, NaN 감지0. GET 정상 n≥0이면 서버값으로 캐시 갱신, 실패시 LS. POST는 fire-and-forget이므로 `_lastSaveTime`이 공유악의구슬 서버 ACK를 증명하지 않음. 루프 감지61927 |
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
| 공유악의구슬 | 234–249 _sharedMats.json GET/POST. floor/clamp 0..MAX_SAFE_INTEGER/ts; GET 파일없거나오류0 | 158–177 같은 정제·저장; POST오류500 JSON |
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

## 4. 작은 이식 단위 순서안 (후속 배정 후보 / 이번 구현 없음)

모든 단위는 **기존 JSON 형식과 값·순서 보존**, 코드 착수 전 소유권/허용 범위 확정이 선행한다. 보호 세이브 형식/2_3/Q·E의 변경을 포함하지 않는다. ‘파일’은 예정 후보이며 실제 생성하지 않았다.

| 순서/후보ID | 원본 행·최소 단위 | 소유 예정 파일(후보) | 검증 아이디어 | 선행·중단 경계 |
|---|---|---|---|---|
| 0/SV-CONTRACT | 부록C 5생산자/3597–3908, index3488–3519; server198–230 | 문서의 고정범위 인수(이번파일), 테스트명 후보 `godot/tests/test_native_save_contract.gd` | 5경로 key set/타입/의도된예외·신규메타 구분, JSON 캐리어의 null/Number/배열·가변 item own field 보존 관측 | P4-001 총괄이 exactscope 확정. 형식 신규설계/수정은 보호·제외 |
| 1/SV-COLLECT | 3543–3575,63905–63931·64062–64088·62131–62159·61996–62017 | `godot/port_modules/save_adapter/source_save_collector.gd` | 동일 live P/G/INV·STATS/PASSIVES·소유 rawgrit·reward bags에서 1번 수집, 호출부의 경로별 필드와 default 그대로 비교. serialize로 상태 변경하지 않는지, owner loss시 미확인값을 0/빈객체로 제조하지 않는지 | 현재 bagMax/queue/mastery/hellCleared 등 owner 부재 해결 또는 범위HOLD. 일부분 collector로 full save를 쓰지 않음. Q/E 필드의 새로운 writer는 보호 |
| 2/SV-TRANSPORT-READ | server198–213·225–230, node118–126·142–146; index3522–3550 | `godot/port_modules/save_adapter/source_slot_reader.gd` | 격리 fixture 응답으로 목록 fields/default·손상JSON제외·development marker,404/500/parse failure/new metadata/완전저장 구분. 실제 user save/API 사용0 | target이 dev server인지 native namespace인지 먼저 확정. 경로권위 임의결정·외부계정 우회 없음 |
| 3/SV-RESTORE-PLAYER | 3597–3626,3685–3715 | `godot/port_modules/save_adapter/source_player_restore.gd`; 기존 raw_grit_restore.gd 재사용 검토 | EXP overflow·SP/AP 저장값·수치문자/0·queue배열/아님·legacy환급 순서/두번로드 비교. actor HP/ST·authority MP 실제 readback 검사 | restore writer 계약을 State/Resource/Player 담당과 인수. constructor 재호출로 대체 금지. Q/E/rage 관련 보호 지점은 변경 제안 없이 총괄 별도 보호검토 대기 |
| 4/SV-RESTORE-ITEMS | 3628–3683,3735–3769 | `godot/port_modules/save_adapter/source_inventory_restore.gd` | 17키/구키누락·affix/bracelet/weapon 표시/속도 마커·uniqueArt 보존·crystal/socketQ/stoneBag 순서. 원 아이템 객체의 동적 필드/중복·identity 비교 | P2-006a 드랍/줍기/INV 인수와 의존성 조정. shared 창고 정본 필요. 세이브 형식/기존migration은 보호 |
| 5/SV-SHARED-READ | 3721–3752,48521–48553 | `godot/port_modules/save_adapter/source_shared_store.gd` | 공유/슬롯 악의구슬 max 비가산·반복restore·비어있는창고만1회이관·200캡·MAX_SAFE_INTEGER·로컬IO 실패. serializer의 storage{} 유지 확인 | platform namespace 및 사용자 격리 정책 인수. 실사용자 데이터 병합·삭제·재저장 제외 |
| 6/SV-RESTORE-FLOW | 3771–3908,62479–62517/63959–64025/64108–64146/62164–62201 | `godot/port_modules/save_adapter/source_restore_flow.gd` | 스킬→fused→숙련도→active→slots→sanitize 순서·부분실패·신규메타와 완전저장·잘못된저장 구분, applyStats/initStage 후 최종표시 확인 | 스킬/합체/성장 owner와 원본 known key tables 확보. Q/E/2_3 보호 블록은 변경범위로 배정하지 않음. 미확정/미인수면 연결HOLD |
| 7/SV-SAVE-PRIMITIVE | 3533–3585,63932–63940,64089–64092; server95–116·216–222 | `godot/port_modules/save_adapter/source_save_primitive.gd` | 격리 self-owned 저장소에 성공/쓰기실패·ACK불일치·같은slot 경쟁·다른캐릭터 늦은응답·원본catch범위 차이 관측. 성공일때만 lastSave 갱신 | read/collector/restore 인수 및 제품쓰기 허용 필요. dev atomic/NW 직접write 차이 보존. 실제 사용자 쓰기/자동서버재시작은 제외 |
| 8/SV-LIFECYCLE | 3935–3977/부트4지점/63673–63692 | 기존 source_save_lifecycle_owner.gd + 후보 `source_save_request_owner.gd` | 가상 wall-clock으로 30s/10s/3s 및500ms/5s·pending drain·current P/function/slot 바뀜·저장중 강제요청을 정확1회. beforeunload는 ‘시도’와‘ACK’ 구분 | primitive+6개 actual Callable 준비. event pump 일부 있음과 dbSaveNow/Force 전체구현을 혼동하지 않음. 제품 clock/frame 작업과 담당협의 |
| 9/SV-LOBBY-VIEW | index3026–3060/3126–3189/3488–3656/4340–4349 | `godot/scripts/native_save_slot_menu.gd` 및 별도씬 후보 | 메타만신규→저장후카드→선택/입장→복귀·5슬롯/개발Infinity·늦은응답 역전·삭제확인취소/실패. demo active-게임key 교환 원계약 대조 | 온라인인증/스토리와 별도 UI 담당조정, delete는 허용된 격리fixture에서만. 현재 HUD 구현과 로비 메뉴를 구분 |
| 10/SV-E2E | 원본클리어42005/10킬43116/레벨43171/로비63679 | 후보 `godot/tests/test_native_save_reload.gd`, 검증로그만 | 별도 userdir 정상입력으로 시작→보상→저장→프로세스종료→같은프로필 로드. 필드/장비/기록 보존과 부트회복을 분리·Mac/PC 각각검증 | 모든 앞 단계 인수·사용자영역 격리·기존 QA와 실측일정 조정. 보호범위 변경 없음을 확인. 현재는 모두 **미실행/미확인** |

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
| 50836 | `btnRow.appendChild(mkBtn(_L('어픽스 리롤','Affix Reroll'),REROLL_COST,()=>{if(G.mats<REROLL_COST){notify(_T('악의구슬 부족!'));return}G.mats-=REROLL_COST;rerollAffixes(rIt);SFX.forge();addTxt(P.x,P.y-20,_T('어픽스 리롤!'),'#44ccff',60);recalcSt();applyStats();renderForge();dbSaveNow()}));` |
| 50912 | `_crForgeSel=-1;applyStats();renderForge();dbSaveNow()}` |
| 50948 | `cr.enh=(cr.enh\|\|0)+1;SFX.forge();addTxt(P.x,P.y-20,_crDefN(d)+' +'+cr.enh+'!','#bb88ff',50);applyStats();renderForge();dbSaveNow()};` |
| 50998 | `_crForgeSel=-1;applyStats();renderForge();dbSaveNow();` |
| 51017 | `_crForgeSel=-1;applyStats();renderForge();dbSaveNow();` |
| 51032 | `row.onclick=()=>{CRYSTAL_BAG.splice(i,1);CRYSTAL_DUST+=dustGet;_crForgeSel=-1;SFX.forge();addTxt(P.x,P.y-20,_T('분해! 가루 +')+dustGet,'#ff8844',50);renderForge();dbSaveNow()};` |
| 51064 | `btn.onclick=()=>{if(!ok)return;CRYSTAL_DUST-=dustCost;CRYSTAL_BAG.push({id:_crCraftType,star:_crCraftStar,enh:0,q:_qRoll()});SFX.forge();addTxt(P.x,P.y-20,_crStarN(s)+' '+_crDefN(cd)+' '+_T('제작!'),s.color,60);renderForge();dbSaveNow()};` |
| 51077 | `b.onclick=()=>{if(G.mats<_crMatsCost){notify(_T('악의구슬이 부족합니다!'));return}if(CRYSTAL_BAG.length>=CRYSTAL_BAG_MAX){notify(_T('유물 주머니 가득!'));return}G.mats-=_crMatsCost;CRYSTAL_BAG.push({id,star:0,enh:0,q:_qRoll()});SFX.forge();addTxt(P.x,P.y-20,d.emoji+' '+_crStarN(CRYSTAL_STAR[0])+' '+_crDefN(d)+' '+_T('제작!'),'#cc66ff',50);renderForge();dbSaveNow()};` |
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

## DEMO11-05 추가 인수 — native demo 로컬 IO (2026-10-21)

사용자 2026-10-21 분할 배정 범위로 `port_modules/save_adapter/demo_local_storage.gd`를 추가했다. S07의 G62111/62128–62173과 I3486–3520의 **게임 단일 키·active·5슬롯**만 다룬다. 각 키는 별도 native `.json` 파일이며 내용은 원래 localStorage 값의 UTF-8 문자열 그대로다. JSON payload 필드·알 수 없는 필드·공백·null을 재직렬화하지 않고, 새 암호화/envelope/저장 마이그레이션을 만들지 않는다. 공유창고·demo500·cloud/web/API 저장은 이 adapter의 지원 키가 아니다.

`readiness()`는 값 파일을 생성/읽기 전에 namespace와 link metadata를 검사하며 `EXODUSER-Godot-Native-First`를 거절한 뒤에만 경로 검사를 한다. `open_store()`는 현재 userdir가 `EXODUSER-demo11-*`인 경우에만 그 아래 `demo_local_storage`를 연다. 원본 경로/키를 외부 입력으로 받지 않는다. 실패한 open/읽기를 “저장 없음”으로 바꾸지 않고, 정상 열린 디렉터리에 키가 없는 경우만 MISSING이다. 손상 JSON/UTF-8은 보존하고 실패를 반환한다.

`begin_set`/`begin_remove`→`advance` 또는 `run_request`가 실제 IO를 수행한다. 요청 ID와 작업/키/bytes가 같으면 진행/완료 결과를 재사용하고, ID 충돌·다른 진행 요청·재진입을 거절한다. receipt는 명시 `release_receipt` 전까지 최대128개로 보존하며 중복 방지는 해당 adapter 인스턴스 수명 범위다. 동일 root의 독점 `.writer` 디렉터리, 임시 파일 write/flush/readback→같은 파일시스템 rename을 사용한다. 기존 파일을 먼저 삭제하지 않는다. 각 키의 commit만 원자적이며 로비의 여러 키 교환을 하나의 트랜잭션으로 바꿨다는 뜻은 아니다. 정체불명의 잠금은 자동 삭제하지 않고 이전 commit 읽기를 유지한다.

SV primitive의 `web_ack` 성공 시각 계산과 기존 `source_save_lifecycle_owner.gd`를 실제 재사용했다. `configure_lifecycle`의 기존 clock/state/collector/slot/rift Callable과 **현재 시점 `context.raw_json`**을 소비한다. `start_auto_save`/`schedule_boot_save`/`poll`은 원래30초·10초 성공 간격·3초 boot 계약을 유지한다(G3935–3944/62212). 실제 commit 뒤에만 성공 시각을 갱신하며, IO 이전 admission 실패도 알려진 실패 settlement로 전달해 boot ticket을 남기지 않는다. 기존 fixture primitive의 HOLD/readiness 및 다른 SV 모듈은 변경하지 않았다.

이 좁은 native IO와 격리 재시작 읽기만 인수했다. Main/State 수정0, 실제 신규/이어하기·Player/INV restore·collector 직렬화·공유창고·로비 슬롯 활성 교환은 DEMO11-04/06 소비자 범위다. 현재 일반 Main의 기존 userdir에서는 안전하게 NOT_READY이며 별도 demo namespace 선택/실제 lifecycle pump 설치는 부팅/복원 담당이 인수해야 한다. flush/rename 검증은 전원 장애의 fsync 내구성, Windows 교체 rename, 적대적 동시 파일시스템 교체, crash 뒤 잠금 자동 복구의 증명이 아니다. 상세 수치/실패 원문/접점은 [DEMO11-05 보고서](orders/reports/demo11-05_REPORT.md)를 따른다.
