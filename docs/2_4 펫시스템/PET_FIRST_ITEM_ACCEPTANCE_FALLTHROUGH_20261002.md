# firstItem 안내 수락·거절 후 분기 — 2026-10-02

양판의 `tut_firstItem` 한 접점만 수정했다. `_petSayCD`가 거절한 안내를 1회 플래그로 소비하지 않고 기존 후속 분기를 검사한다. 수락하면 `_petTut.firstItem=true`와 기존 `return`을 유지한다. 인수 범위는 실제 소스에서 추출한 Node VM 경로이며 실게임·DOM·청취·저장 인수가 아니다.

## 소스·근거

| 파일 / 접점 | 현재 SHA-256 또는 본편 / easy 행 |
|---|---|
| game.html | `34ba2b742523850bda8b6f204f86d216b74ce3264698277f6e6c728f9c75bdf7` |
| game-easy-test.html | `24f820a162d8ef545caf910116119cb09db6980c0f9508d48867eff5dc7d8adb` |
| 실제 `[S03e] PET_DIALOGUE` 시작 | 8978 / 8433. 섹션의 v6·173종 주석은 기존 이력이며 이번 수량 재검수가 아님 |
| `_checkPetDialogue` / firstItem | 9184 / 8635, 수정 접점 9243 / 8694 |
| 실제 긴급 helper `_petSayUrgent` | 9110 / 8561. 양판 `_petUrgent` 이름·alias 원문 0개 |
| 새 검사 | `test/petFirstItemAcceptance.test.cjs`, SHA `f1b27ec25b9da96deae73135b1f24bb32d5fe726bd2155b02ce7896f52a3e489` |
| 소스 최종 영수증 | `tmp/mac-migration-runtime/continued-review-20261002/pet-first-item-backup/receipt.json`, SHA `3d591e869a92808aca543e443ac42b9e842fe68c886e2e6d561190f10f13e379` |

행은 위 SHA의 위치다. 이전 펫 본문 `~5717줄~`은 구판 위치다. 최종 영수증의 `docsFacts`, `sourceExtraction`, `normalTraces`, `limits`가 관측 경계의 근거다.

## 변경·보존 계약

| 대상 | 이전 / 현재 | 보존·한계 |
|---|---|---|
| firstItem 소비 순서 | 이전 `flag=true → SayCD → 무조건 return`; 현재 `SayCD true → flag=true → return`, false는 flag를 유지하고 다음 분기 검사 | 각 HTML 218→223바이트, +5바이트 한 접점. 줄 개행과 접점 밖 전체 바이트 동일 |
| 발동 조건 | 기존 `G.stage===0`, `P.lv<=200`, `!_petTut.firstItem`, `INV.bag.length>=1` 유지 | 첫 드롭 자체나 자동장착 완료를 뜻하지 않음. 기존 가방 조건 유지 |
| 대사 ID·문구·화자 | `tut_firstItem`, crow 선발·cat 후발 원문 유지 | 캐릭터 텍스트·번역키·PETS_DESIGN_LOCK 변경 0 |
| 시간·ID 쿨다운 | crow 5초=300f, cat 예약 4초=240f, ID 9999초×60=599940f | T1 글로벌쿨과 별개. 새 ID·큐·필드·저장 schema 추가 0 |
| 티어 글로벌쿨 | `_PET_TIER_COOL` T0~T5 = 1200/720/480/360/240/0f, firstItem T1=720f, near_boss T4=240f | 값·우선순위 변경 0. v6 단일 15초 글로벌쿨은 과거 구조 |
| 일반 경쟁 | `_petBidCD`는 프레임 슬롯 입찰, 일반 동일티어는 코드순 먼저가 우선 | v7 설계의 일반 weight45/65 제안은 이번 패치의 현행 구현값이 아님 |
| 긴급 경로 | `_petSayUrgent`는 ID CD를 먼저 검사하고, 프레임 안에서는 생존 weight 입찰·밖에서는 같은 UID의 활성 대사를 가드한 뒤 인터럽트 | “긴급은 모든 쿨 무시”라는 절대 설명은 부정확. 기존 T5 경로의 내부 `_petSay` 반환 무시 정책도 변경 0 |
| 수락·거절 | 새 검사 wrapper가 실제 `_petSayCD` false/true를 직접 기록. `_petSay` true도 실제 반환 관측 | `_petBidCD`와 `_petFireBid`의 정상 undefined 반환을 false로 취급하지 않음 |
| 수락 의미 | 선발 상태 설정·표시/SFX 호출과 후발 pair 예약 뒤 helper true | sink 대역에서 관측한 수락이다. 실제 DOM 표시·cat 완료·청취·취소 재생 완료를 뜻하지 않음 |
| 범위 | firstItem 거절 후 후속 분기로 진행. 성공은 기존 return 유지 | 다른 튜토리얼 선소비·return, potionCraft·전체 retry/queue·장기 starvation 해결을 주장하지 않음. 기존 후속 분기 자체가 return할 수 있음 |

## 새 실제 소스 대역 검수

| 검사 / 양판 각 1그룹 | 실제 관측 | 대역·제한 |
|---|---|---|
| 시작 안내 중 거절 → 타이머 후 재수락 | 실제 tut_start crow300f/cat300f+T1CD720. t2 firstItem SayCD=false/flag=false, 후속 최종 FireBid 도달. t721 최초 수락 1회; t722 추가 요청 0, ID599939/T1CD719 | 실제 updatePet·dispatcher·timer를 실행한 합성 시계. 전체 update/AI·live 표시·저장 검수 아님 |
| 다른 fresh T4 후속 분기 | 가방 없이 620번 진행 후 실제 일반 pickup 2회. t621 bubble 비었음/T1CD100 → firstItem false·미소비 → near_boss 입찰/FireBid/Say true. crow240f/cat예약240f, ID30초=1800f/T4CD240. 옛 메모리 원문은 near_boss 입찰 0 | G.bossAlive·정지한 만피 보스·중심10/10타일·P(0,0) 대역, 거리226.274px<300. 보스 AI·스폰·맵 도착·이동의 전체 적법성 UNKNOWN |
| 정상 수락 보존 | 양판 옛/새 원문의 추출 post-call 전체 상태와 sink·helper 호출 인수/순서 deepEqual. crow300/cat예약240, ID599940/T1CD720, 수락 뒤 near_boss 입찰 0 | 소비 시점을 의도적으로 이동했으므로 표시/SFX 함수 안에서 flag를 관측한 값은 동등성 범위 밖 |
| T5 선행 | 합성 HP8/100에서 실제 hp_critical weight100이 firstItem보다 먼저 mid-fire. Say true, urgent SFX 호출, UID hp_critical, ID1800, crow180/cat예약180. T0/2/3/4CD300, T1 기존719 유지. 뒤 firstItem SayCD=false/flag=false. 후속 near_boss는 활성 T5 bubble·T4CD300에 막혀 발화 0 | 긴급 bubble·ID/tier CD는 옛 메모리 대조와 동일. 전체 프레임을 중단하는 새 정책은 없음. 실제 피해/죽음·모든 T5·전체 AI/native 긴급표시 UNKNOWN |
| 기존 부적격 조건 | 가방 없음/stage1/Lv201/G.onfalse의 합성 4입력씩, firstItem 요청 0·옛/새 추출 동등 | 양판 2그룹 안의 8하위입력이며 전체 그룹 수에 더하지 않음. nullP/전체 update 미실행 |

| 검수 기록 | 수치·의미 |
|---|---|
| 신규 현재 소스 | Node 10/10 PASS, 양판 각5그룹. 성공 실행 1회 |
| 신규 검사의 수정 전 기록 | 원본 10그룹 중 4 PASS / 6 FAIL. 현재 PASS와 합산하지 않는 역사 |
| 메모리 음성 대조 | 현재 호출 AST로 옛 접점만 재구성. 거절 시 flag 소비와 T4 후속 누락을 확인 |
| 구문 | 인라인 JavaScript 12개 + importmap JSON 2개, 실행 1회 exit0. 게임/module 실행 아님 |
| 기존 팀 자료 | QUESTNPC-firstItem-fallthrough-0548의 summon601 T4 양판2·정상 본편1은 당시 대역 이력. T5 미검수·SayCD false 추론이라는 당시 한계 보존 |
| 반복 | 기존 팀8그룹·summon601 검사 및 기존 root 검사 재실행 0. 문서 담당은 새 검사도 실행하지 않고 제출 원문/영수증만 읽음 |

현재 대역은 실제 full `_checkPetDialogue`, `updatePet`, `pickupItem`, say/CD/urgent/bid/fire/timer/TierOf/BagNext/dst2 및 실제 상태 선언을 실행한다. 이동 함수는 no-op, DOM/번역/SFX는 sink, 공간·스탯·save·guide는 대역이다. 본편 일반 headband 2개는 가방으로, easy는 첫 장비 자동장착 후 두 번째가 가방으로 들어가는 해당 소스 경로만 관측했다. 실제 인벤토리 배치/저장 파일을 인수한 것이 아니다.

표시/SFX 예외는 실제 helper에서 잡지 않으며 이번 예외 정책·fault 검수 추가는 없다. pair 중단 뒤 안내 재생, 장기 경쟁, 다른 튜토리얼 소비, 실제 패드/언어별 표시·음성·게임/native·저장·빌드의 판정은 미검수다.

## 정본 동기화

| 정본 | 반영 |
|---|---|
| `2_4 펫시스템.md` | 현재 코드 위치·helper 설명 2접점만 최소 교정, 이번 firstItem 부록. 나머지 v6 173종/29분류 등은 구판 문맥이며 재실측 수량 아님 |
| `대사_스크립트.md` | 기존 원문 prefix 보존 + firstItem 소비/false 후속·검수 경계 부록 |
| `대사_개편_v7_설계.md` | 역사 설계·검수 보존 + 현행 한 접점과 일반 코드순/생존 weight 구분 부록 |
| `../11내러티브·로어디자인/펫_대사_스크립트.md` | 1회성·우선순위 절대표현 2접점만 좁혀 교정 + firstItem 한계 부록. 대사 표 문구 보존 |

전체 docs 관련 키워드 무절단 검색·정확 file:line 분류·기존4 원문 백업과 허용4접점 old/new·나머지 바이트 보존 증거는 ignored `tmp/mac-migration-runtime/continued-review-20261002/pet-first-item-docs-backup/`의 이번 completion 영수증에 기록한다. 번역·키바인딩·외형 LOCK·다른 보스/피날레·사운드/영상 계약과 역사 운영 자료는 보존한다. CHANGELOG·통합기록·Git 체크포인트는 총괄 소유다.
