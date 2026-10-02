# QUESTNPC-firstItem-fallthrough-0548 — 거절 뒤 T4 평가 인수

firstItem 거절 시에도 기존 뒤쪽 발화를 평가하도록 하는 좁은 fallthrough 후보를 검토했다. 양판의 실제 전체 _checkPetDialogue와 helper를 실행한 새 source 경계에서 **boss_summon(T4) 평가·수락이 복구**됐다. 기존 무조건 return HOLD 후보는 같은 틱에서 해당 분기와 최종 fire에 도달하지 못했다. 정상 firstItem 수락 대조는 **본편 1건만**이며 원본/HOLD/fallthrough의 전체 추출 상태와 호출 순서가 동등했다. productionApplied=false, 생산/공유 docs 수정0이다.

신규 Node 실행은 **2회: 초기 VM 선언 구문 오류 exit1(경계 실행 전), 수정 후 완료 exit0 1회**다. 완료된 새 근거는 양판 동일 T4 경계 2건 + 정상 대조1건이다. 이전8그룹 실행/재합산0, 완료 검사의 반복0. 이번 Git 조회·쓰기0이며, 이전 continuous 작업의 금지 조회2회 이력은 취소하지 않는다.

## 관측 출처와 보존

실제 cwd는 /Users/fordeargamers/Projects/exoduser-migration-20261001(F24 pwd)다. TASK를 F01에서 정확히 먼저 읽었다. 감독 메시지의 checkpoint 6c2dadab0b3a81a600e8358f485518cfcb122199/Changes54, TASK의 f2e70ef7c9c663fdd69e925bc379b6d6f8bcaa9c 및 game2e45/easy3e59/node541ff8은 각각 제공 시점 이력이다. 독립 현재 HEAD로 쓰지 않는다. 종료 Changes는 UNKNOWN, Git 재조회0, Changes80/100 checkpoint는 root 소유다.

| 현행 입력 | 이번 F19/완료 fixture/F24 SHA |
|---|---|
| game.html | dc711864876610a83c67a659d4f162551191b56ba11d74e1cb81f03df935368e |
| game-easy-test.html | 1f139e0cd5fd898e33ba2b1c408b33e49984e106f0b46cc5b38b7d2abf2dabe1 |

제공된 과거 SHA와 달라 실제 현재 원문을 다시 읽었다. 이전 continuous의 checks/result/evidence는 F19와 F24 SHA 동일, 쓰기0이다. 소유 TASK 옆 checks/result/evidence 최대3파일만 작성한다. 최종 hash 관측은 evidence에 따로 기록하며 다른 담당 변경을 되돌리지 않는다.

## 선택 경계와 source chain

| 계약 | main | easy |
|---|---|---|
| update 선행 guard | 30857–30881: lesson tick → G.on → parry tick → editor → 단축키 → paused | 29675–29698, 동일 의미 |
| pet 호출 → 실제 dispatcher | 30910 → updatePet40091–40099 → check9184 | 29727 → updatePet38891–38899 → check8635 |
| 선행 생존 우선 처리 | 9191–9228의 urgent 입찰·mid _petFireBid, 이후 Lv500 guard | 8642–8679, 이후 Lv500 guard |
| Stage0/Lv≤200 firstItem | 9232–9245, 대상9243 | 8683–8696, 대상8694 |
| 뒤쪽 전체 평가·끝 fire | 9246–9415, boss_summon9270, 최종 fire9414 | 8697–8866, boss_summon8721, 최종 fire8865 |
| 실제 획득 | pickupItem15675–15701 일반장비 가방행 | pickupItem14782–14818 첫 빈 headband 자동장착, 두 번째 가방행 |
| 정상 summon 상태 진입 | 36379 실제 case: s=bossSummonWind, st2=tele 또는55 | 동일 원문 case를 fixture가 해당 판에서 추출 |
| 소환 wind 해제 | 39410–39426: st2≤0 뒤 소환·recover | 실AI 실행 미검수 |

fixture는 실제 tut_start로 crow300f→cat300f와 T1 CD720f를 만들고, 실제 ordinary rarity1 headband pickup 2건으로 bag≥1을 만든다. 초기 bubble/CD/firstItem을 직접 대입하지 않는다. full dispatcher/caller를 tick600까지 진행하면 앞선 pair t=1/T1=121이다. 그 직후 실제 summon switch case를 실행하고 tick601 하나를 관측했다. T1=120, 앞선 bubble 종료, T4 CD=0이므로 pending firstItem은 거절되지만 T4 발화는 수락 가능하다.

**합성 입력 한계:** G.stage0/Lv1, 정상 HP/MP/ST, 정지한 alive 보스 참조·bossAlive·ens를 하니스가 제공한다. 보스 source 조건과 실제 summon case는 실행했지만 보스 spawn/맵·이동·타격·mv 선택 자격 전체는 실행하지 않았다. 55f wind를600f 고정한 반례가 아니다. wind는 관측 직전에 생성하고 **1틱만** 검사했다. 조건상 합법적 source 상태이며 실제 플레이 도달 완료로 확장하지 않는다.

## 원본 / HOLD / fallthrough

같은 대상 한 줄만 VM에서 치환했다. 원문 문구·화자·ID·조건·숫자는 유지했다.

```js
if(!_petTut.firstItem&&INV.bag.length>=1){if(_petSayCD('tut_firstItem','crow','TAB을 눌러. 가방을 열고 장비를 입어야 한다.',5,9999,'cat','주웠으면 껴야지! TAB!',4)){_petTut.firstItem=true;return}}
```

| tick601 비교 | 원본 | 이전 HOLD | fallthrough |
|---|---|---|---|
| firstItem 상태 | 앞선 tick2 선소비 true, 이번엔 대상 미호출 | false, 이번 즉시 helper 거절 뒤 return | false, 즉시 helper 거절 뒤 후속 평가 |
| firstItem ID CD | 없음 | 없음 | 없음 |
| _petSayCD 반환 | 이번 미호출 | false: T1>0 guard, flag false 유지 | false: 같은 guard, flag false 유지 |
| boss_summon 입찰 평가 | 1회 | 0회 | 1회 |
| 최종 경쟁 _petFireBid 도달 | O | X(mid-fire만) | O |
| _petSay boss_summon 수락 | true 1회 | 호출0 | true 1회 |
| 최종 bubble / pair | crow240f / cat240f 예약 | 앞선 cat t0 / pair없음 | 원본과 같은 crow240f / cat240f 예약 |
| boss_summon ID CD / T4 CD | 3600f / 240f | 없음 / 0 | 3600f / 240f |
| T1 잔여 CD | 120f | 120f | 120f |
| 실제 helper 반환 계약 | bid/fire undefined | mid-fire undefined | bid/fire undefined |
| pickup/save/guide 대역 호출 | 2 / 2 / 2 | 2 / 2 / 2 | 2 / 2 / 2 |

_petSayCD의 거절 bool은 별도 wrapper로 기록하지 않았다. 실제 실행된 해당 guard·pending flag·CD 부재에서 false를 판독한다. _petSay 수락 bool, _petBidCD 입찰 슬롯과 undefined 반환, _petFireBid 진입 슬롯/undefined 반환은 직접 trace한다. undefined 반환을 발화 실패 bool로 취급하지 않는다. 최종 _PB.tier는 fire가 -1로 되돌린다. 같은 T4면 기존 코드 순 먼저 우선, T1 parry_low는 boss_summon 슬롯을 덮어쓰지 못했다.

### 정상 수락 대조 1건

본편에서 startup 뒤 full update를720틱 진행하고 동일 pickup2건 및 summon case 후 tick721을 관측했다. 원본/HOLD/fallthrough의 **전체 snap/trace deepEqual** 통과. firstItem=true, crow300f/cat240f pair 예약, ID CD599940f(9999초), T1 CD720f, boss_summon 입찰0, T4 CD0이다. firstItem 성공 시 return이 유지되므로 같은 틱의 T4는 기존처럼 평가되지 않는다. 이 검사는 원래 성공 경로의 순서를 보존하는 대조이며 모든 higher-tier가 항상 먼저 나와야 한다는 새 정책이 아니다.

## 실제 실행과 미검수

| 구분 | 범위 |
|---|---|
| 실제 원문 | 양판 전체 _checkPetDialogue, 모든 pet state, _petSay/CD/BidCD/Urgent/FireBid/timer/TierOf/BagNext, updatePet, pickupItem, dst2, _diffSigned, 원본 summon case |
| 원문 caller 일부 | 실제 update guard prefix와 pet 호출. 중간 gameplay/AI/worker와 update 후반은 생략 |
| 대역 | DOM/SFX/번역 sink, pet 이동 no-op, 키 false, parry tick false, guide 호출 count, inventory 공간 성공, stat/save count |
| 입력 | dtSp1·하니스 frame clock, ordinary rarity1 headband, 정상자원·synthetic alive stationary boss |
| 생존 T5 | 원래 앞쪽 urgent와 mid-fire 원문 보존. 새 실행의 입력은 비긴급이라 **T5 검사는 실행0**; 이전 중단 그룹 재실행0 |
| 신규 상태/계약 | 새 flag/questId/queue/save/reward/badge/CD/대사/배치 없음 |
| 실제 게임 | UI/패드/언어/음성/저장/HTTP/GPU/빌드/플레이0 |

source 추출은 고유 marker/함수 경계를 확인하고 누락·중복이면 assert로 중단한다. 중단을 임의 구현으로 대체하지 않는다. 새 fixture는 이전 파일을 import/실행하지 않는다. 이전 함수 추출 helper 작성 형식을 재사용했지만 기존 검사를 실행·합산하지 않았다.

전체 튜토리얼 소비 문제, 다른 Stage0 early return(potionCraft 등), T3 별도 상태, 장기 starvation, 동시 guide/배지/실저장, 디로이 응답 완독·취소 뒤 replay는 이번 해결 범위 밖이다. _petSay true는 선발 수락과 pair 예약이며 실제 DOM 표시·cat 완료 보장이 아니다.

## docs 검색과 canonical 인계

checks 작성·수정 뒤 F23에서 docs/ 전체 rg 검색(exit0, 아래 패턴)을 수행했다. 출력 잘림0, 총21개 매칭 행. 모든 매칭 본문 완독이나 공유 문서 수정 완료로 주장하지 않는다. 문서가 설계/과거 이력과 현행을 섞는 부분은 이번 변경 범위에 필요한 사실만 인계한다.

패턴: tut_firstItem|_petTut\.firstItem|boss_summon|_petBidCD|_petFireBid|_PET_TIER_COOL|_petSayCD

| canonical 대상 | root가 기록할 정확한 보충 문안 |
|---|---|
| docs/2_4 펫시스템/대사_스크립트.md §시스템 함수 v7(29–35), §튜토리얼(98), §보스 패턴(140,149) | firstItem 성공 뒤 소비+무조건 return 후보는 거절 중 후속 경쟁 분기를 생략해 HOLD다. 성공 때만 firstItem=true·return, false 때 후속 평가를 허용하는 좁은 메모리 후보는 현재 양판 source에서 T1 CD가120f 남고 앞선 pair가 끝난 틱의 boss_summon(T4) 평가·수락을 복구했다. boss_summon은 s==='bossSummonWind', 선발 crow4초/후발 cat4초, ID CD60초/T4 글로벌240f를 유지한다. 생산 미적용, 장기 starvation·실게임·cat 완료 미검수다. |
| docs/11내러티브·로어디자인/펫_대사_스크립트.md §튜토리얼39 / 구현참고89–93 | tut_firstItem의 승인 문구·화자·5초/4초·ID9999초·T1 720f를 유지한다. 원본은 helper 거절 전 flag를 소비한다. 새 검토 후보는 true에만 소비·return하고 false면 기존 후속 평가를 계속한다. 정상 수락 대조1건에서는 원본과 호출 순서·bubble/pair/CD·획득/save 대역 상태 동등, 생산 미적용이다. |
| docs/2_4 펫시스템/대사_개편_v7_설계.md §2-1(35–52), T4 boss_summon121 | 이 설계의 과거 weight65를 현행 코드 값으로 이식하지 않는다. 현재 _petBidCD는 티어가 같으면 먼저 나온 후보를 유지하며 _petFireBid는 비긴급 bubble가 비고 해당 티어 CD≤0일 때 발동한다. 이번 firstItem fallthrough는 그 경쟁 규칙·숫자·T5 원문을 변경하지 않는다. 한 T4 상태만 source 검증했고 새 weight/큐/재시도 상수 없음. |

번역대상 두 행, PETS_DESIGN_LOCK, Q 전용 blackBean·보호2_3는 수정0이다. 새 문구/번역 키/인물/퀘스트/보상 없음. 공유 docs/Git 반영은 root가 순차 수행한다.

## 감독 인수 Gate

선택한 T4 경계와 본편 정상 대조는 source PASS다. 이전 HOLD의 후속 생략 사유는 이 좁은 fallthrough로 제거됨을 확인했다. **생산 승인/통합 검수 완료는 아니다.** root는 변경 직전 최신 함수 계약·소유를 다시 인수하고 양판 한 줄 및 canonical 동기화를 순차 적용해야 한다. T5 동시성·실제 활성 guide/HUD·세이브·장기 경쟁은 별도 미검수로 유지한다.

이번 Git0/생산0/타인WIP쓰기0/공유docs0/기존산출쓰기0/새세션·하위팀·메시지0이다. 지정 한 건 보고를 마치고 감독의 다음 지시를 기다린다.
