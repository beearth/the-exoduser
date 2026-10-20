> **2026-10-21 DEMO11-31 현행 보충:** 앵글러1 family4개체를 Main/실제 World phase·같은 G에 설치했고,35 registry의 field birth/에너지 전용 sweep·PC HP/최종 사망 readback→P3→37를 연결했다. 배치는 provider Marker4개만, source 사이트 좌표 복제0. PC 피해/패링·world/player·저장·지형 변경0. 실제 맵/PC producer/렌더 마감·전역 원본 update 순서 동치는 미인수다. [API·원문 대조·최종 수치](orders/reports/demo11-31_REPORT.md). 아래 원본 추적 이력/수치는 보존한다.

# 필드보스 원본 추적·작은 이식 단위 설계 — 2026-10-20

## 2026-10-21 Native DEMO11-32 인계 상태 (기존 동결 원본 추적은 아래 보존)

main0138c5bb9 기준 화마귀 전용 `native_demo11_fire_devil_tick.gd`와 `native_demo11_fire_devils.gd`를 추가했다. source `_fdTickOne`의 tick 단위/직접 RNG4회·HP/ATK/8방향·충전/TP 순서를 유지하고 Main에는 설치/Marker provider/read API만, State에는 FD 4슬롯 claim만 추가했다. 배치는 MAP11 `Markers/FireDevil1..4`만이며 원본 사이트 좌표를 복제하지 않는다. 사망은 FD 슬롯 null, kills/지역/보상/fbDone 변경 없음.

35 registry/class/drop/실제 carrier를 재사용하지만 현재 specialized elemBall 거절은 유지한다. PC contact/landing KB·incoming hitSet/query와 실제 source clock·registry phase·MAP11 Marker 인수 전 **부분 구현·통합 BLOCKED**다. 피해/QE/Player·World·35/지형 수정0. standalone source oracle·실제 작은 탄 검증과 전체 실플레이/시각 완료는 구분한다. **31과 통합 후보**(provider 수명·명령 continuation·hit ingress·registry clock/aggro)는 [보고서](orders/reports/demo11-32_REPORT.md)에 정리했다. 아래 과거 ‘미이식’ 표는 동결 SHA 당시이며 현재 전체 이식 완료로 읽지 않는다.


## 0. 기준·범위

| 항목 | 확인 내용 |
| --- | --- |
| 작업 / 브랜치 | `trace-fieldboss` / `codex/trace-fieldboss-20261020` |
| 원본 기준 | `git fetch origin` 후 `origin/main=e556b617190c325ca39f5add04357f5dea5ca87e`. 모든 원본 행 번호는 이 main의 game.html·index.html 기준 |
| 작업 위치 | `/Users/fordeargamers/exoduser-wt/trace-fieldboss`. `worktree add --no-checkout` 후 sparse-checkout. 웹 대형 에셋은 받지 않음 |
| 변경 허용 | 이 문서 1개와 CHANGELOG_SYNC 맨 위 절만. 코드·테스트·설계 docs·작업판·기존 추적 문서 0줄 |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`. 시작 tracked INDEX/WORK clean. 기존 untracked 보존, 최종 대조 |
| 증거 수준 | 파일·선언·호출 정적 추적. 순수 상수·생성자만 별도 JS VM에서 평가. Godot/import/게임/서버/브라우저/테스트 실행 0. 아래 검수 항목은 후속 계획이며 PASS가 아님 |
| 보호 | Q/E 입력·패링·자원, docs/2_3, save 형식·복원, State/main/World/피해·드랍 소유 파일 변경 0. getter 존재를 writer 권한으로 해석하지 않음 |

### 0.1 마감 시 main 진행 재확인

자기 브랜치 첫 push 후 원격 main이 `299e48ac4dfbb7cedd313e791173c0d8ff20cb0a`로 진행되어 다시 fetch·정적 대조했다. **game.html·index.html은 시작 pin과 동일 byte/SHA/행 수**이므로 이 문서의 원본 행 근거는 이 마감 main에서도 그대로다. 지역·State·normal hurtE·소환굴·factory·World·HUD의 조사 파일도 변경 없다. Main 차이는234행 뒤 표시용 native_map_look 부트2줄 추가뿐이며, 본문의 시작 pin Main263–271은 마감 main265–273에 해당한다. 추가된 MAP-LOOK/일반 적 표시·포이즈 수정 등 다른 변경을 이 추적의 실행 인수나 완료 범위로 포함하지 않는다. 전체 변경 경로와 byte 대조는 외부 main-advance.json에 보존했다. 후속 구현은 다시 최신 main/소유 경계를 확인한다.

### 0.2 선행 문서와 중복 방지

| 먼저 읽은 근거 | 이번 문서의 경계 |
| --- | --- |
| [P3-003 지역](FDG_P3_003_REGIONS_20261020.md) | 분면·정화·배너·미니맵 사이트·자물쇠는 기존 owner를 참조. 초두의 처치 훅/분모 미연결은 제출 당시 기록이며 §4에서 최신 코드를 구분 |
| [BOSS_CH1](FDG_SOURCE_TRACE_BOSS_CH1_20261020.md) §0.2·§2·공용 접점 | ib=true 장 보스·아레나·59무브·부활·피날레를 독립 필드몹에 중복 적용하지 않음 |
| [P3-002 소환굴](FDG_P3_002_SPAWN_HOLES_20261020.md) §1·§4.8 | 14굴·168분모·동적 등록·RNG·지역 초기화 순서는 기존 소유. 고정 필드몹 사이트를 소환굴 배치로 대체하지 않음 |
| [작업판](orders/WORK_BOARD.md) P3-002/P3-003 병합 행, [기능 목록](FDG_FEATURE_INVENTORY_20261020.md) FIELD 4항목 | 과거 snapshot과 최신 main 구현을 구분. 타인 WIP/미병합 branch를 현재 완료로 포함하지 않음 |
| [CH1 일반 적 추적](FDG_SOURCE_TRACE_CH1_ENEMIES_20261020.md) §1.1·§1.2·§2 | 문지기 ch1_initial_003/etype29·호위·일반 AI·피해·드랍 상세는 기존 담당에 위임. 여기서는 필드/게이트 접점만 연결 |

### 0.3 ‘지역별 4종’과 FIELD 분모 4의 구분

지역 담당 필드보스는 **같은 앵글러 생성자의 4개체(SW물/SE불/NW암/NE뇌)**다. 서로 다른 네 전용 보스 AI 선언은 없다. 이 네 지역 인스턴스를 주 대상으로 추적한다. 기능 목록의 FIELD 분모 4는 **앵글러·곰치·화염악마·문지기라는 네 항목**이므로 보조 세 계열도 함께 추적한다. 두 집합을 합쳐 ‘서로 다른 네 생물종이 지역마다 한 마리’라는 계약으로 만들지 않는다.

| 앵글러 배열 idx → 지역 idx | 사이트(타일) | 월드 중심(T=40) | el / 사이트 색 |
| --- | --- | --- | --- |
| 0 → 2 남서 | (58,158) | (2340,6340) | I2 / #3388ff |
| 1 → 3 남동 | (148,150) | (5940,6020) | F1 / #ff5522 |
| 2 → 0 북서 | (52,42) | (2100,1700) | D3 / #9933cc |
| 3 → 1 북동 | (148,42) | (5940,1700) | L4 / #ffee00 |

근거: T16631, EL/ELC14333–14338, `_REG_FB_TO_REG`60694/60708, `_FB_SITES/_FB_ELS`60976–60977, 좌표식61044. 사이트 el은 지역·표시 속성이다. 에너지탄은 네 개체 모두 I2, 혈안탄은 F1 외형/physical 분류다. 불 지역 보스의 공격을 화염 에너지탄으로 바꾸지 않는다.

## 1. 수명·스폰·초기 상태 전수 추적

### 1.1 호출·활성 분기·초기화

| game.html 행 | 경로 | 계약 |
| --- | --- | --- |
| 4747,31559,61048,61262,61646 | ruined-forest-first | URL/텍스처 gate에 따른 조건식이며 항상 true가 아님. 해당 별도 scene에서는 다른 init을 사용하고 FB/WM/FD tick이 즉시 반환 |
| 31569 | initStage | `_fbDone/_fbSpawned/_fbAnnounced`, FB singleton/array, `_fdSpawned/_fdAnnounced`/FD array와 게이트·로드 상태를 리셋. 이 줄에는 WM array/stage reset이 없음 |
| 31612–31655 | 문지기 생성 → QA clear → 지역 init | 문지기·호위·외곽은 ens, 필드 3계열은 별도 저장소. 지역 init은 소환굴 확정 후이며 앵글러가 아직 미스폰이어도 담당 사이트 지정 |
| 32108–32146 | update 순서 | systemLesson tick → !on → parryLesson tick → editor → 패널 처리 → paused return → `_gameFrame++` → FB → 지역 → WM → FD. 필드 타이머는 정수 --/t++이며 sp·delta로 일괄 치환하지 않음 |
| 30768–30769 | 아레나 진입 | si0에서 FB/FD=null, WM=[]. 옛 si3 피날레 WM도 억제. 현재 피날레 도달성은 BOSS_CH1 §0.2 참조 |
| 55203–55205 | body draw | 일반 엔티티 위·안개/토치 아래에서 FB → WM → FD 순. 일반 enemy atlas 렌더와 별도 |
| 62281,61266 | 별도 시작 / WM stage 변화 | 시작 흐름의 저장소 정리와 WM stage 변화 시 null 대입을 구분. []는 truthy라 자동 재생성하지 않음. 같은 stage의 모든 재시작에서 복구된다고 추정하지 않음 |
| index.html | 직접 참조 | 부록 65함수·16상태 식별자의 직접 참조 0. 로비가 필드보스 스폰/보상을 소유한다는 근거 없음 |

### 1.2 집합·생성자·필드

| 계열 / 행 | 스폰·위치 | 수식·초기 필드 |
| --- | --- | --- |
| 앵글러 60973–60978/60985/61043–61067 | stage0 최초 적격 tick에 4개 모두 생성. **1000 접근은 생성이 아닌 기상 조건**. !on/P 없음은 반환, stage0 arena·MAP_QA·다른 stage는 clear. stage 변화 시 spawned/announced reset, done이면 생성하지 않음 | HP=`~~((1800+(P.lv\|\|1)*350)*7.5)`, ATK=`~~((20+P.lv*3)*1.2)`, r120. xy/homeXY=사이트 중심, alive=true,t/frame0,hitCd0,shotCd120,tpCd/tpT0,tpMax54,tpXY=home,hid1,burst/gap0,spawnIn/asleep1,enChg0,el=사이트 |
| 곰치 61237–61243/61261–61285 | stage0 4사이트[(70,160),(50,100),(155,70),(72,55)] → [(2820,6420),(2020,4020),(6220,2820),(2900,2220)]. 다른 stage는 플레이어 주변 LockDest로 4개 생성하고 home 갱신. map/P/on 필요. stage0 arena와 옛 demo-si3 finale arena에서 []로 억제. MAP_QA 전용 clear는 없음 | HP=`~~(150+P.lv*45)`, ATK=`~~((16+P.lv*2.5)*1.2)`, r56. xy/homeXY,frame/ft0,shotF−1,hitCd0,face0,phase=hide,shots0,hideT=asleep?0:54,popHit0,tpXY=xy,asleep=0/1. **alive/ib/el 키 없음** |
| 화마귀 61443–61448/61460/61627–61660 | stage0 4사이트[(78,125),(125,125),(78,70),(125,70)] → [(3140,5020),(5020,5020),(3140,2820),(5020,2820)]. FB와 같은 arena/QA/stage clear. stage 변화 때 fdSpawned만 reset; fdAnnounced는31569 reset. 1000 기상 | HP=`~~((1800+(P.lv\|\|1)*350)*2.5)`, ATK=`~~((18+P.lv*2.8)*1.2)`, r100. xy/homeXY,t0,frame6,_moving=false,walkT/chargeWalkT0,hitCd0,shotCd90,tpCd0,emT0,emMax54,tpXY=home,hid/spawnIn/asleep1,enChg/burst/gap0,elF1,_fmKind=fd. **alive/ib 키 없음** |
| 문지기 31612–31628 | bossGate가 비어 있지 않고 gateY 존재, 문 앞(gateY+3)이 범위 안 바닥0. hell0..6 etype=[29,39,49,59,69,79,89], el=STG[si].be. xy=((bossCx+.5)T,(gateY+3+.5)T) | mkEn(ib=false,room=−1) **후** HP/MHP=~~(mhp×4),ATK/baseAtk=~~(atk×2),r=~~(r×1.4),poise/max80,elite3,_isGateGuard=true,dropTier=min(4,hell+2). 기존 rolled mods/aura/실드/속도/쿨 재계산 없음. 이 블록은 mkEn null을 별도 검사하지 않음 |
| 호위·외곽 31629–31650 | 호위 4+~~(u×3), 반경55 등각, canMv10 후 생성. 외곽 8+~~(u×5), 반경100+u×80, canMv 후 생성 | 호위는 rollEtype 후 elite1·HP×2.5, 외곽은 rollEtype/rollEl 일반몹. 주석 ‘근접’과 달리 원거리 배제 보장 없음. 위치 실패로 최종 수량 감소 가능. 이 수를 소환굴 분모에 더하는 코드 없음 |

문지기 mkEn/RNG/실드는31120–31362 및 CH1_ENEMIES 추적을 따른다. frozen `ch1_initial_003/order2`는 etype29/el0, HP3500·ATK62·shield875·poise80·r57·[4020,340], elite3/mods[]/aura null이다. 이는 특정 frozen 입력이며 모든 레벨/RNG에서 고정값이 아니다. ib=true 장 보스 24배나 `_FB_HP_MUL`을 적용하지 않는다.

### 1.3 순수 원본 식 표본

선택한 상수·생성자만 JS VM에서 평가했다. 게임/엔진 실행 결과가 아니다.

| P.lv | 앵글러 HP / ATK | 곰치 HP / ATK | 화마귀 HP / ATK |
| --- | --- | --- | --- |
| 0 | 16125 / 24 | 150 / 19 | 5375 / 21 |
| 1 | 16125 / 27 | 195 / 22 | 5375 / 24 |
| 10 | 39750 / 60 | 600 / 49 | 13250 / 55 |
| 100 | 276000 / 384 | 4650 / 319 | 92000 / 357 |
| 500 | 1326000 / 1824 | 22650 / 1519 | 442000 / 1701 |
| 501 | 1328625 / 1827 | 22695 / 1522 | 442875 / 1704 |
| 1000 | 2638500 / 3624 | 45150 / 3019 | 879500 / 3381 |

`~~`는 JS ToInt32이며 floor/64bit int와 다르다. lv0에서 HP만 `||1`을 적용하는 차이를 보존한다. HP에 dm/monLv/장 보스 커브는 들어가지 않는다. 원본 밖의 레벨 clamp/최소 HP 추가 금지. 전체 생성 객체는 외부 static-oracle.json에 보존했다.

## 2. 패턴·피격·보상·지역 연동

### 2.1 앵글러 공통 패턴의 실행 순서

| game.html | 단계 | 정확 계약 |
| --- | --- | --- |
| 61068–61078 | 기상 | d>1000이면 정지, 정확히1000은 기상. tpT/tpMax54,hid/spawnIn1,목표=현재위치. 안내는 4마리 합쳐1회. 직접 RNG10회(speed3+u×4)·smoke·shake8·magic1 후 return. t/CD 미감소 |
| 61079–61087 | 몸·접촉 | t++ → hitCd/shotCd 양수만-- → 방향. !hid이면 P를 r+P.r 밖으로 밀고 +8 이내/iframes≤0/charge 아님에 hurtP(atk). dtype/속성 전달 없음 |
| 60986–61008 | 방향·앵커 | 우향frame3/7, 좌향은 dy와 absdx×.4로pose0/1/2, 행은(t>>5)&1. esca: frame&7, u=.87/.13,v=.14/.22,표시크기300. mouth/lureTips 정의와 실제 참조는 부록 구분 |
| 61089–61097 | 에너지 충전 | 화면 중심 판정 통과,shotCd≤0,!hid,!tpT,!enChg면 shotCd=enChg=180. 같은 tick에 enChg--. 짝수t 파티클에 직접 RNG4개. 0이면 energy 발사·burst3/gap18, tpCd가 양수가 아니면600. 시야 밖이면 enChg/burst/gap0 |
| 61098–61106 | 혈안 후속 | !hid,!tpT,!enChg에서 gap>0 감소, 아니면 현재 P 재조준해 `_emitEnemyShot` 요청, burst--/gap24. 이 요청은 공통 warning60f·취소·commit 처리(20065–20093)를 거친다. 요청3회를 최종 탄3개와 혼동하지 않음 |
| 61108–61126 | TP/첫 출현 종료 | tpT--,0에 목표xy로 이동·hid/spawnIn0. 첫 출현은 강타 생략. 재TP는 d<r+110/iframes≤0/charge 아님에 ~~atk,KB18,텍스트. smoke/kraken_tp/light/shake16/폭발음·16방향 파티클 |
| 61127–61140 | TP 예약 | tpT가 없을 때 tpCd--,0이고 d<2200이면 그 순간 Pxy를 고정하고 tpT/max54,hid1. 출발 smoke/vanish/bolt·직접 RNG10회. d≥2200이면600 재대기. 이후 P를 계속 추적하지 않음 |
| 61141,61036–61041 | 죽음 | 정상 terminal은 fmApply. tick에도 hp≤0 방어 흔적. MarkDead: alive=false → 해당 배열 슬롯null → singleton이면null → alivecount0이면fbDone=true. 배열 압축 금지 |

충전 종료 tick에 뒤 분기의 burst gap/tpCd도 즉시 감소할 수 있다. gap=24를 ‘정확히24틱 간격’으로 재작성하지 않는다. 아래 WM/FD도 소스의 조건·실행 순서를 유지한다. asleep 동안 hitCd는 감소하지 않는다.

### 2.2 보조 FIELD 계열

| game.html | 계열 | 계약 |
| --- | --- | --- |
| 61203–61213 | WM 목적지 | 최대28회: 각u·반경48+u×40, !isW이고 P거리>36이면 채택. 실패는Pxy. 좌표 대입 후 bonfire 바깥75 보정, 최종tpXY 저장. 직접 위치 RNG는 시도당2회이며 FX/내부 보정까지의 전체 소비 수는 별도 확인 필요 |
| 61220–61236 | WM 잠복/출현 | vanish→목표잠금→hide108,frame/ft0,shots0,shotF−1,popHit0. appear는tpXY/bonfire/face 결정 후 emerge frame2. TP마다 home을 덮지 않음 |
| 61281–61328 | WM 상태 | asleep는home거리1000 초과 정지, 기상appear 후continue. hitCd/contactCd--,좌우16px 히스테리시스. hideT54에 새목표 고정,>54 완전잠복,54..1 엿보기frame0/1,0appear. emerge/retreat는7틱,shoot는36틱마다frame 진행. frame5마다1발 요청×2,frame7/2회 완료면retreat8,>11vanish. 시야 밖 발사 거절도 shots 증가 |
| 61244–61260,61315–61326 | WM 접촉 | emerge frame≥4 최초1회: 거리<r+P.r+28에 .45atk. 노출 몸 거리<r+18에 .5atk. contactCd60 공유. dead/fallen/load/harp/dash/io/gw 등의 gate, hurtP 후 생존 시4px씩 canMv 밀기·KB28. 이 gate를 다른 보스에 임의 확장하지 않음 |
| 61661–61688 | FD 기상/출현 | 거리1000 기상,emT54,hid/spawnIn1,전역안내1회 후return. 이후t++/hitCd·shotCd--/방향. emT--/0이면tpXY·hid0. 최초_land1/후속강타(~~atk magic,KB16). emT 분기는 처리 후 매번return |
| 61689–61706 | FD 이동/충전 | 비충전이고 d>r+P.r+28이면1.8/tick,중심isW검사,walkT증가. 몸 통과 차단·+8 내 magic atk. 시야 밖은 충전/후속 취소. shotCd≤0에180 충전,같은tick--,짝수t 직접 RNG4. 종료energy·burst3/gap18/tpCd600(없을 때) |
| 61708–61725 | FD 후속/TP | 후속은 spawnProj fireMagic 직접 호출: raw속도6·~~atk1.4·life240·r10·sz2,burst--/gap20. commit 없으므로 공통1/3 선택 영향. CD0/d<2200에 Pxy 고정,em54/hid1/spawnIn0/_landed1. 죽음은FD슬롯null이며fbDone에 쓰지 않음 |
| 61461–61475,61669–61694 | FD 방향·시계 | atan2 8방향clock[3,5,6,7,9,11,12,1],zero6. dirframe{1:1,3:2,5:3,6:4,7:5,9:6,11:7,12:0}. walkT/chargeWalkT 구분,일반6tick/charge18tick frame |
| 31230–31231,39125–39139,40550–40557 | CH1 문지기etype29 | slamCd250+u×80/T80+u×40. idle에서T-=sp,거리<120에전조45·8방향eProjAt(3,1.2,I,life300),거리<100슬로120. 별도 조건150<d<1200 및u<.008sp이면eCharge25로 덮을 가능성. 공통slam 범위70+r/atk×2/KB10/recover50. 일반 이동·탄·돌진·사망탄은CH1_ENEMIES 소유 |

다른 장 문지기는 해당 etype의 일반 적 AI 소유다. stage/종류를 무시하고 앵글러 AI를 붙이지 않는다. 첫 이식 단위는 문지기 AI를 구현하지 않는다.

### 2.3 투사체 생성 인자와 최종 값

| game.html | 생산/소비 | 정확 계약 |
| --- | --- | --- |
| 20060–20064 | 발사 가능 영역 | 중심이 abs(x−cam.x)×zoom≤max(0,VW/2−64), y도 같은 식. 필드3계열 zoom1, _ch1StartMedium만 별도camZoom. 원 중심 경계를 임의 body반경으로 확장하지 않음 |
| 61022–61029 | 앵글러 energy raw | esca에서P조준,속도10·~~atk2.8·elI·life/ml320·sz48/r20,elemBall/typed/commit/fbEnergy=true. 사이트el과 무관 |
| 61102,61214–61219 | 앵글러/WM 혈안 raw | 앵글러9·~~atk1.6·life260,WM8·~~atk1.5·life240. 모두F1,titanEye/typed,sz6.4/r12. WM 직접spawn,앵글러 warning 경유 |
| 61498–61505,61712 | FD raw | energy6·~~atk2.8·F1·life320·sz48/r18,elemBall/typed/commit/fdEnergy. 작은 후속탄은§2.2 |
| 16870–16883,16911–16920,16947–16994 | pool/class/공통변환 | energy의magic 분류는 elemBall forbidden보다 우선. titanEye는F외형이어도physical,homing/redBean=true,속도5 정규화. titan 외 이동탄: sz×2/r×1.3/속도×1.8/dmg×2,비commit은1/3채택. energy는elemBall이라속도대역 재정규화 제외(10→18,6→10.8),life320 유지. 작은FD는마법속도8.333..10·homing·RNG. raw를 최종값으로 보고하지 않음 |
| 17262–17303,34819–34824,34896–34906 | 큰탄 터미널 | contactRadius=max(r,sz). 벽sweep는중심+8원주검사 후 폭발/회수. friendly잔존 금지. Q성공 분열,몸은무적/charge로피해0이어도폭발/회수(ioActive별도gate). 취약 시magic피해·slide100 |
| 17363–17383 | 큰탄 Q 후속 | player magic 혜성5개,속도7.5/r8/range900/pierce0,각dmg=max1 ~~(total/5),반대방향에서5등분. 자원배율10/parryBank/doParry의waterEnergy/fireEnergy. 기존 보호 계약의 의존만 기록 |
| 33824–33838,35089,61009–61020 | 보호막/충돌FX | energy boom220/90,blastlight280/24,flash/chroma8,parts42,shake32,detonate. I의fbEnergy는bossWaterImpact,F의fdEnergy는bossFireImpact |
| 35280–35281 | 반사탄→필드몹 | hurtFieldMobs 후parryMagicShot이 맞으면 즉시회수. 일반 player projectile hurtE와 별도 |

Q/E owner를 수정하거나 기존 일반 탄을 큰탄으로 위장하는 작업은 독립 단위 권한에 포함되지 않는다. 장 보스 포이즈/실드와도 별개다.

### 2.4 피격·죽음·보상

| game.html | 계약 | 이식 시 보존 |
| --- | --- | --- |
| 18628–18634 | FB TP중 피격좌표=도착점. isFb는!hid 또는tpT/emT>0에피격. WM는hideT>54만면역 | 전조 중 피격 가능,완전잠복만불가. hurtFieldMobs에는asleep별도검사없고 hid/phase로gate. target탐색만asleep제외18720 |
| 18699–18711 | hitCd>0거부 → dmg=max1 ~~dmg → HP감산 → hitCd8 → 표시 → 사망분기 | hurtE의원소/실드/포이즈/부활 호출 없음. 가짜ib=true enemy로hurtE를 대체하지 않음 |
| 18733–18755 | FB→WM→FD 충돌. 거리<히트반경+r,hitSet미포함이면 **먼저add 후apply**. parryShot이면apply거절도n증가/FX | hitCd거부 시hitSet과 반사탄terminal 순서 보존. WM죽음은slotnull,배열압축 없음 |
| 18713–18731 | 반사탄 target은FB→FD→WM 순. asleep/hitSet/피격gate,FB만TPxy. 히트FX는I에waterImpact/나머지projHitFx | target순서와 충돌순서를 같게 정렬하지 않음 |
| 19844,33971,35280,37646,46566 | 유입5곳: 기참·차지·player projectile·근접공격·_bowFire | 모든 스킬 광역이 자동으로 필드몹을 때린다는 증거 없음 |
| 18677–18698 | deathFxDone 래치,FX용fake/시체/bodyblit/고어/사망임팩트·shake/flash. 직접RNG로고어선택 | fake.ib는FX용,실제boss 보상 분류가 아님 |
| 18706–18709,61036–61041,61327,61628–61630 | 필드3계열 죽음은안내/FX/slotnull. **EXP/SP/mats/item/potion/kills/stageKills/regKill 호출 없음** | 일반 보상을 새로 붙이지 않음. FB4마리 죽음은fbDone과 담당지역 정화조건만 해제 |
| 42702,42737–42744 | 문지기는 일반hurtE에서alive=false,kills/stageKills+1,regKill 후 안내/VFX/SFX,guard=null/killed=true,bossGateOpen=true/cache재생성 | bossGateOpen과bossUnlocked는 별도. 문지기 죽음만으로 입장 허용하지 않음 |
| 42817–42823 | etype29사망:8방향 각u<.5면blackBean,그외redBean. 거리<100슬로150 | ‘30%무지개’ 주석과 다름. 다른 장 사망은 일반 적 담당; 보호패링 변경0 |
| 42746–42761,43076–43116 | 문지기elite3: 잔해25%/대형tier2후보,킬체인5/180f균열. 악의=~~((12+stage×3)×12×4)의affix/malice보정 +기본4 +~~((2+~~(u×2))×10×comboBonus×2). hp/st/mp중물약1개,rollDrop,XP | P.lv≥1000은eliteXP2. 미만은~~(max(5,~~(eLv×.4))×4×comboBonus). 일반 reward owner 사용,이중집행0 |
| 32002–32034 | 문지기는ib=false/etype29이므로elite:dropCount1,rarityweights[25,35,25,12,3,.03],tier=dropTier(stage0은2) | minPickRar/minPickLv/mkItem실패로 최종 미드랍 가능. miniboss(etype90..99)/stageBoss/chapterBoss로 바꾸지 않음 |

일반 EXP/물약/드랍/악의의 상세 이식은 [메타](FDG_SOURCE_TRACE_META_20261020.md)·[아이템](FDG_SOURCE_TRACE_INVENTORY_20261020.md) 추적/P2-001c 소유다. 여기서는 ‘필드3계열은 보상 호출 없음,문지기는 일반 보상 경유’라는 접점만 확정한다.

### 2.5 지역·자물쇠·입장

| game.html | 접점 | 기존 소유/주의 |
| --- | --- | --- |
| 60694–60725 | NW0/NE1/SW2/SE3,FB배열mapping[2,3,0,1]. 미스폰FB=생존,spawn후slotnull/dead=비생존. ratio=kills/분모+문지기지역만.10,total0이면1 | 분모=spawnHoles 원count합. FB/WM/FD/문지기/호위 수량을 추가하지 않음 |
| 60728–60732,60766–60795 | 일반kills는_homeXY우선·ib제외. ratio≥.8−1e−9이고 담당FB없으면 정화래치,15프레임주기 | FB죽음은kills+1 아님. 문지기/호위는ib=false라일반kill,문지기는별도.10 보너스도적용. 필드몹homeX를regKill에연결하지 않음 |
| 41869–41917 | 4지역정화+stage0 fbDone이면bossUnlocked. 지역없으면total≤0즉시/else전역kills÷total+.10≥.8,FB조건유지. 출구는FB미완료안내→sealed안내→loader | 전역80%폴백을4지역맵에사용하지 않음. loader/아레나는BOSS_CH1 소유 |
| 60201–60214,60954–60967 | 미니맵생존FB실xy/r3/검정외곽,미스폰은site+.5. 실제배열[]이면site폴백없음. gate+.5의자물쇠closed#ff4444/open#44aaff,몸통7×6/고리r3 | P3-003 draw_minimap/draw_lock 의존. WM/FD 전용점은 이 구간에 없음 |
| 60806–60826 | 방향안내: 일반몹home귀속,FB실xy/미스폰site후보,Angler·속성라벨 | P3-003당시방향화살표는미이식 기록. 후속owner조정 |
| 60321–60336,60118–60123,60934–60952 | HUD지역킬/정화수4·틴트/캐시mask | 기존P3-003 참조. 소환굴분모/alpha를 임의 보정하지 않음 |

## 3. docs 불일치·누락 표

설계 docs와 기존 문서는 수정하지 않고 이 표에서만 보고한다.

| id | docs의 표현/범위 | 최신 원본·구현 | 판정 |
| --- | --- | --- | --- |
| D1 | 요청8.1의8파일+2_6의1파일에4앵글러site/수식/패턴의완결표 없음. 8.1은장보스 중심 | 60969–61197 등 독립구현. primary-doc-audit.json에검색근거보존. 피날레곰치억제이력은존재 | 설계누락. 장보스×24/페이즈로채우지않음 |
| D2 | FEATURE-INVENTORY FIELD4와지역4개체의축 차이,목록명화염악마 | 담당FB는같은앵글러4개체,WM/FD도각4개체,guard는gate별1. 실제표시화마귀/Flame Devil(61665/61777) | 두집합과명칭병기. 새로운공식명칭결정은미확인 |
| D3 | P3-003 초두/후속에C처치·분모미연결 | main263–271/normal_hurte589–593은연결됨. P3-002§4.8/작업판38·54도통합기록 | 과거제출시점과최신main 차이. 지금결손으로재배정금지 |
| D4 | FEATURE-INVENTORY의FIELD/HUD snapshot에지역owner없음·자물쇠미연결 | native_regions65–74/118–125/161–205,HUD998 존재 | snapshot이력. 정적연결존재와본체전투완료는별개 |
| D5 | BOSS_BATTLE_SETTINGS§3/5의HP·페이즈와피날레보상/부활 | FB/WM/FD는자체HP/사망,문지기는ib=false | 적용대상차이. 장보스수치를통일적용할근거없음 |
| D6 | 2_6 리프트의적처치균열/보상·소환굴수량을필드몹까지포괄할가능성 | fmApply/DeathFx는chain/rollDrop/regKill없음,문지기만일반hurtE | 보상/카운트추가금지. 설계의추가적용범위는미확인 |
| D7 | 원본주석3초/10초/WM2발/FD3연사 | 같은tick감소·warning60·FD소형탄1/3선택·시야밖거절/소비·spawn변환 존재 | 주석만으로최종동작단정금지. 실화면/지속초는미확인 |
| D8 | 42816 주석30%무지개탄 | 42818 식은u<.5 blackBean/그외redBean | 주석/실행식불일치. 코드보정0,CH1 일반적 추적 참조 |

## 4. Godot 의존과 빠진 것

모두 최신 main 코드의 정적 대조다. 기존 보고서의 검수 수치는 재실행한 결과가 아니다.

| 의존 / 실제 위치 | 이미 있음 | 빠진 것 / 제한 |
| --- | --- | --- |
| native_regions.gd42–160/161–205/285,HUD998 | 실G참조검증·분모/ratio/FB생존읽기·kill·정화·사이트·자물쇠·배너·gate_opened | FB array/actor 생산자없음,미스폰은생존. pending SFX/pet·화살표·실플레이인수는별도 |
| main.gd263–271,spawn_hole_system170–210 | 소환굴배치→지역configure. P3-002기존보고:14굴168,지역23/60/53/32 | 이번실행0. 소환시스템기본휴면/메타활성화범위,etype가 0이 아닌 소환 consumer 제약은기존결과참조 |
| normal_enemy_hurte581–593,regions118–125 | 등록된실dead/hp≤0 actor의_home좌표를지역킬로전달 | FB별도dict를가짜actor로등록금지. FB죽음에이API호출은원본에없음 |
| native_source_new_run_state278–305 | 소환굴owner허용키spawnHoles/_totalSpawned/shake | FB상태writer아님. live G의필드범위·수명·동일성인수필요. 임의dict쓰기권한추정0 |
| enemy_factory151–192,world2920–2937 | frozen정확레코드gate·초기적/etype0소환등록 | etype29미지원. FB/WM/FD는etype없음. 소환굴등록은정확etype0 script만허용하여재사용불가 |
| normal_enemy_hurte150–153,kill_reward모듈 | 일반피해·보상소유자와미이식분기정지 | ib=true는halt. fm피격/HP/8tickCD/사망/FB완료원장없음. 가짜boss입력재사용금지 |
| Main/Player/무기·player projectile store | 일반enemy hurtE 경로 | 별도collection/query/원본5유입/hitSet순서연결없음. 공용소유조정필요 |
| combat_qe·일반enemy projectile | 일반탄/QE의제한된이식 | fbEnergy/fdEnergy/titanEye 전용경로식별자를찾지못함. 큰탄sweep/터미널/5분열동등성미확인 |
| 일반texture/deathFX/audio서비스 | 기반시설존재 | 전용body/view/HP/차징/TP없음. tracked godot/assets에서angler/worm/firedevil/kraken/boss_water/boss_fire/titan이름경로0. 별칭·동등byte존재는미확인(경로검색만수행) |

### 4.1 웹 view·자산 접점

| 원본 행 | 자산·표시 계약 |
| --- | --- |
| 60970–60984,61143–61196 | img/fieldboss_angler.png,1200×600캐시/4×2셀300,body300. idle회전/bob,HP220×10/13px이름. charge이미지는8가로frame,280px,lighter |
| 19631–19642,61166–61179 | kraken_tp/vanish512셀·8frame·4열. 원자리32tick정방향(첫spawn생략),도착54tick역방향,scale.9/1.05. TP중bodyreturn |
| 61199–61202,61330–61360 | worm_burrow1/2:4×3/12frame→600×450캐시/150셀. asleep/완전잠복미표시,화면+150cull. 엿보기white경고링/물리E안내. 노출중HP감소시90×6bar |
| 61364–61442,61449–61458,61476–61489,61636–61643,61727–61778 | FD emerge/idle/dir/charge,walk_clock1/3/5/6/7/9/11/12(11은1시flip). body280,charge200/12frame,emerge8frame. 이동/차징walk→dirfallback,HP200×10/13px이름. idle은사망blit에도소비 |
| 24149–24221,61368–61427,61615–61625,54180–54191 | titanEye/kraken물회오리·기존16frame orb. 물24clip metadata data/vfx/kraken_water_orb24_20261010.json(6×4/24/10.8fps/loop),불24clip firedevil_orb24_20261010.json(6×4/24/19.8fps/loop),실패시기존16fallback,표시240. 공통render54088의_sprFr+.12 후 fdDrawFly는추가+.22를소유(해당렌더1회에합.34). 물탄은공통+.12 |
| 8824–8879,8886–8941,61009–61020 | bossFire/WaterImpact24 metadata(각6×4/24/16fps/non-loop)·기존fallback. _booms t/mt가시계소유. 아트교체가피해/수명/패링확장을뜻하지않음 |
| 18635–18698 | 사망bodyblit/large death/corpse/gore/impact. FB/FD는isFb=true FX,WM는false. _fmKind=fd일때FD시트사용 |
| 54010–54015 | 문지기이름13px/HP%10px. 일반enemy렌더소유,별도FB바중복표시0 |

위 규격은 소스 선언·draw식이며 실제 이미지 실측이 아니다. 실제 파일 규격·hash·alpha·오디오 재생은 미확인. 이번에 자산 복사/생성/렌더 교체는 하지 않았다.

## 5. 작은 이식 단위 순서안

후속 배정용 제안이다. fixture/view 완료를 본편 이식 완료로 승격하지 않는다. 공용 연결은 별도 통합 결정 전까지 중지한다.

### FB-S01 — 순수 사이트·초기값 catalog(구현 지시서, 공용0줄)

| 항목 | 구현 계약 |
| --- | --- |
| 소유 파일 | 신규 godot/port_modules/fieldboss_source/catalog.gd(+자기uid), godot/tests/test_trace_fieldboss_s01_catalog.gd(+자기uid), 자기보고서/CHANGELOG만. 기존코드·factory·regions·NativeSkillSlots·설계docs0줄. 착수시경로충돌재확인 |
| 원본 범위 | 최신main을다시fetch/pin. 이번기준60973–60978/60985/61043–61046,61237–61243,61443–61448/61460,61632–61635. 문지기31614–31626은읽기전용규칙표만. actor/AI/피해/보상/등록/Statewriter제외 |
| API | extends RefCounted,고정상수/static함수. 권장 catalog(kind:String)->Dictionary, build_initial(kind:String,input:Dictionary)->Dictionary. kind=angler/worm/firedevil/gate_guard. 불명kind는NOT_READY. 반환새값·mutable전역0·입력변이0·RNG0 |
| 초기값 입력 | 앵글러/FD: 유한Number player_level/tx/ty/tile_size(현재40),앵글러element필수. WM:유한Number player_level/x/y와asleep bool필수. 누락/타입/비유한은{status:NOT_READY,reason:...,writes:0}. host검증과원본식clamp구분. lv\|\|1와rawlv위치/ToInt32/식순서보존 |
| READY 출력 | {status:READY,value:<원본생성객체>,source_ref:<pin/행>}. 키/타입/누락그대로. FB alive=true,WM/FD에없는alive/ib/el일괄추가금지. homeX와_homeX구분. WM는픽셀직접,FB/FD는+.5tile. 죽음배열/싱글턴생성없음 |
| 문지기 제한 | catalog는hell→etype7개/강화순서/.10/후대입필드목록만. build_initial(gate_guard)는NOT_READY:requires_approved_mkEn_input. mkEn/RNG/elite/실드/맵바닥을가짜기본값으로대체금지. frozen3500/62를보편값으로사용금지 |
| 고정 검사 | §0.3의4사이트/el/mapping,WM/FD4사이트,§1.3의7레벨×3계열HP/ATK와전체초기dict를독립기대값으로대조. lv0에서HPfallback만적용. 음수/소수/Int32경계는별도JSoracle확보. shape/키부재검사. 반환변이후다음호출/입력/다른개체불변 |
| 실패 검사 | kind/필수키/원소/좌표/Number/NaN/Inf오류. 원소허용집합은angler사이트[2,1,3,4];다른원소를READY로치환금지. RNG호출0증거. unknownkind를READY/0HP로통과시키면실패. 기대값을구현출력에서생성하지않음 |
| 실행 계획 | 다음구현때만신규격리명 EXODUSER-fb-s01-Isolated-20261020. Godot전사용자pgrep gate. 관련기존 test_contracts/test_p3003_regions/test_p3002_spawn_holes는각상수격리명. skip/exit/ERROR/원로그보존. 현재실행0,미측정검사수/PASS발명금지 |
| 완료 조건 | 자기모듈/테스트/관련docs만정상hookcommit·자기branchpush·원격SHA확인. 공용0줄/원본불변/정확검증로그. 공용writer필요시S01확장없이BLOCKED보고 |

### 후속 단위

| 순서 | 신규 단위 | 선행·검수 / 공용 예상 |
| --- | --- | --- |
| FB-S02 | fieldboss_source/hit_core.gd + fixture | S01. XY/CanHit/apply/hitSet순서/deathonce/slotnull/alivecount/FB완료만fixture. 0/8tick·TP/emerge·잠복54/55·마지막사망/중복호출. 실G/HPwriter0,공용0 |
| FB-S03 | angler_wake_body.gd + fixture | S01. spawn4/asleep1000경계/첫54tick출현/방향/몸접촉intent. 원본공용hurtP실행대체0,공용0 |
| FB-S04 | angler_charge_shots.gd + fixture | S03. 화면−64/180충전/동일tick순서/3warning요청/취소/RNG·spawn후처리packet. 실탄연결0,공용0 |
| FB-S05 | angler_teleport.gd + fixture | S04. CD600/2200엄격경계/목표고정/54tick/hid/첫강타생략/KBintent·도착피격xy. 공용0 |
| FB-S06 | worm_cycle.gd + fixture | S01/S02. 목적지28회/bonfire·canMv입력/108→54잠복/7·36frame/거절시shots소비/contactCd60. 공용0 |
| FB-S07 | firedevil_cycle.gd + fixture | S01/S02/투사체검증fixture. 출현return/이동1.8/8방향/충전180/후속요청과1/3선택구분/TP54/사망. 공용0 |
| FB-S08 | 신규 standalone view/scene/test,앵글러부터 | 원본동일byte자산승인. body/HP/차징→TP→죽음순작은화면단위. 기존사이트/lock중복0. 1x웹대조/영상전VISUAL미인수. 공용0목표,자산/레이어범위재확인 |
| FB-S09 | 문지기 dependency 인수표/순수 spawn modifier fixture | CH1 etype29/elite/피해/사망탄/보상owner선행. 후대입·실드 미동기화·1kill과.10구분·호위/외곽수/RNG. 일반actor중복구현0,공용0목표 |
| FB-S10 | 실제field owner·State/main/World/query/region/탄 연결 | **통합 결정 HOLD**. 실G배열/안정idx/alias,FB→region순서,무기5유입/실사망,문지기gate/loader/effects. 공용줄수미확인. 승인전0줄,fake fbDone/킬/분모/보상주입0 |

S04를 Q/E 본편 연결로, S08을 맵 geometry 변경으로 확대하지 않는다. 장 보스 BC·일반 적 CH1 단위의 인수도 FB-S10 전투/지역 완료를 뜻하지 않는다.

## 6. 공용 접점·통합 결정 목록

| 소유 접점 | 필요한 결정 | 보호·인수 조건 |
| --- | --- | --- |
| State/live G | FB배열/alias·spawned/done/announced/stage,WM/FD,guard/killed/unlocked/open writer와reset범위 | getter만으로쓰기허용추정0. spawn_hole writer우회확장0. 기존소환굴/지역재초기화0,save필드추가0 |
| Main/source frame | FB→지역→WM→FD를어느native phase에호출할지,pause/lesson/editor/scene/정수tick범위 | 소환굴시계/World.frame_reset_epoch/JS_gameFrame동등성추정0. native_skill_slots.gd0줄 |
| P3-003/NativeRegions | fbIdx가읽는실Dictionary/Array동일성,lastdeath→15tick정화,fbDone→unlocked순서,문지기귀속지역 | filter/compact0,fake snapshot완료표시0. 이미연결된kill/분모재구현0 |
| World/factory/CH1 | 별도stores query/표적/충돌/수명,문지기정확record/skin등록 | etype0소환등록의범용factory확장0. 별도collection을ens에섞어보상자동발생0 |
| 무기/스킬/피해 | 원본5유입순서/hitSet/8tickCD,FB도착xy·FD현재xy,접촉hurtP/KB | 승인전player/main/피해파일0줄. 모든광역이필드보스에맞는다고추정0 |
| 적 탄/QE | energy/혈안최종변환,warning60,sweep/무적terminal/Q5분열/playerproj회수 | Q/E/2_3보호. 기존magic탄으로위장fallback0,원본분류변경0 |
| 드랍/EXP/리프트 | 문지기일반reward만기존처리,필드3계열보상호출없음 | 새보상정책결정0,kill/reward중복0,save/API호출추가0 |
| HUD/UI/아트/사운드 | site색/공격el분리,body/전조/HP/TP/죽음,기존site/lock과gate_opened효과sink | 파일선언과실소비/시각인수구분. 이번이미지/Godot실행0. 실플레이/PC인수미확인 |

## 부록 A. 직접 식별자 전수 색인

범위는 game.html18628–18755와60969–61779의 `_fm/_fb/_wm/_fd` 함수 정의 전체 및 외부 필수 field-shot/반사 target/전용 view·clip loader다. 총 **65함수**의 파일 전체 정의·직접 참조 행을 열거한다. 정적 이름 검색은 댓글·문자열도 포함할 수 있다. 정의만 있는 함수는 이 검색에서 호출 참조가 없다는 뜻이며 동적 호출 부재의 증명은 아니다. 일반 피해/장 보스 전체의 이식 완료를 주장하는 색인이 아니다.

| 식별자 | 정의 행 | 전체 직접 참조 행(정의 포함) |
| --- | --- | --- |
| `_fmXY` | 18628 | 18628, 18680, 18703, 18721, 18737 |
| `_fmCanHit` | 18629 | 18629, 18720, 18736, 18743, 18750 |
| `_fmEnsureFbSheet` | 18635 | 18635, 18666 |
| `_fmEnsureWmSheet` | 18643 | 18643, 18671 |
| `_fmDrawSpriteTo` | 18654 | 18654, 24985, 25142–25143 |
| `_fmDeathFx` | 18677 | 18677, 18707, 61141, 61327, 61725 |
| `_fmApply` | 18699 | 18699, 18739, 18745, 18752 |
| `_fbElCol` | 60979 | 60979, 61010, 61072–61073, 61125, 61132, 61194 |
| `_fbEnsureSheet` | 60980 | 60980, 61182 |
| `_fbHp` | 60985 | 60985, 61044 |
| `_fbMouth` | 60986 | 60986 |
| `_fbFaceFrame` | 60990 | 60990, 61082 |
| `_fbEsca` | 60997 | 60997, 61025, 61094, 61160 |
| `_fbLureTips` | 61001 | 61001 |
| `_fbEnergyBoom` | 61009 | 33832, 34821, 34824, 34904, 35089, 61009 |
| `_fbFireEnergy` | 61022 | 61022, 61096 |
| `_fbClear` | 61030 | 61030, 61051–61054 |
| `_fbAliveCount` | 61031 | 61031, 61041 |
| `_fbMarkDead` | 61036 | 18709, 61036, 61141 |
| `_fbMk` | 61043 | 61043, 61057 |
| `_fbTick` | 61047 | 32143, 61047 |
| `_fbTickOne` | 61068 | 61065, 61068 |
| `_fbDraw` | 61143 | 55203, 61143 |
| `_fbEnsureCharge` | 61147 | 61147, 61157 |
| `_fbDrawCharge` | 61155 | 61155, 61189 |
| `_fbDrawOne` | 61166 | 61145, 61166 |
| `_wmLockDest` | 61203 | 61203, 61224, 61277, 61293, 61295 |
| `_wmFire` | 61214 | 61214, 61324 |
| `_wmVanish` | 61220 | 61220, 61312 |
| `_wmAppear` | 61228 | 61228, 61285, 61297 |
| `_wmMkAt` | 61240 | 61240, 61272, 61276 |
| `_wmContactHit` | 61244 | 61244, 61320, 61326 |
| `_wmTick` | 61261 | 32145, 61261 |
| `_wmDraw` | 61330 | 55204, 61330 |
| `_fdEnsureSheet` | 61449 | 18658, 61449, 61637, 61753 |
| `_fdHp` | 61460 | 61460, 61633 |
| `_fdWalkClock` | 61461 | 61461, 61467 |
| `_fdFaceFrame` | 61466 | 61466, 61673, 61692 |
| `_fdDirFrame` | 61470 | 18660, 61470, 61768 |
| `_fdAnimFrame` | 61471 | 61471, 61760 |
| `_fdEnsureCharge` | 61476 | 61476, 61729 |
| `_fdEye` | 61484 | 61484, 61501, 61704, 61732 |
| `_fdTips` | 61491 | 61491 |
| `_fdFireEnergy` | 61498 | 61498, 61706 |
| `_fdDrawFly` | 61615 | 54181, 61615 |
| `_fdClear` | 61627 | 61627, 61649–61652 |
| `_fdMarkDead` | 61628 | 18708, 61628, 61725 |
| `_fdMk` | 61632 | 61632, 61655 |
| `_fdDrawEmerge` | 61636 | 61636, 61746–61747 |
| `_fdTick` | 61645 | 32146, 61645 |
| `_fdTickOne` | 61661 | 61659, 61661 |
| `_fdDrawCharge` | 61727 | 61727, 61771 |
| `_fdDraw` | 61739 | 55205, 61739 |
| `_fdDrawOne` | 61743 | 61741, 61743 |
| `_fieldEnemyCanShoot` | 20060 | 20060, 20066, 20084, 61023, 61089, 61215, 61499, 61698 |
| `_hurtFieldMobs` | 18733 | 18733, 19844, 33971, 35280, 37646, 46566 |
| `_parryMagicFieldTarget` | 18713 | 18713, 35196 |
| `_fbDrawVanishFrame` | 19634 | 19634, 61173, 61178 |
| `_fbDrawFly` | 24213 | 24213, 54184 |
| `_loadFiredevilOrb24` | 61371 | 61371, 61412, 61500 |
| `_drawFiredevilOrb24` | 61411 | 61411, 61618 |
| `_loadKrakenWaterOrbClip` | 24156 | 24156, 24197, 61024 |
| `_drawKrakenWaterOrbClip` | 24196 | 24196, 24215 |
| `_loadBossFireImpactClip` | 8824 | 8824, 8866, 38554, 61014 |
| `_loadBossWaterImpactClip` | 8886 | 8886, 8928, 38551, 61012 |

## 부록 B. G 저장소·게이트 전체 직접 참조

동일 필드명의 파일 전체 직접 참조 16개다. `_fieldBoss`는 첫 생존 개체 alias이며 다섯 번째 독립 보스가 아니다. 필드몹 homeX와 일반 enemy _homeX를 같은 키로 정규화하지 않는다.

| G 필드 | game.html 전체 직접 참조 행 |
| --- | --- |
| `_fieldBoss` | 18709, 18717, 18719, 18734, 30768, 31569, 31653, 55203, 61030, 61032, 61040, 61058, 61061, 61064, 61144, 62281 |
| `_fieldBosses` | 18716, 18734, 30768, 31569, 31653, 55203, 60205, 60722, 60812, 61030, 61032, 61039, 61056–61058, 61060, 61144, 62281 |
| `_fbStage` | 61054 |
| `_fbSpawned` | 31569, 60208, 60721, 60816, 61054–61055, 61058 |
| `_fbAnnounced` | 31569, 61054, 61072 |
| `_fbDone` | 18709, 31569, 41871, 41900, 60204, 60720, 60816, 61041, 61055, 61141 |
| `_worms` | 18716, 18742, 30768–30769, 55204, 61265–61268, 61272, 61277, 61281, 61327, 61331, 61333, 62281 |
| `_wmStage` | 30769, 61266 |
| `_fireDevils` | 18716, 18749, 30768, 31569, 31653, 55205, 61627, 61629–61630, 61654–61655, 61658, 61740, 62281 |
| `_fdStage` | 61652 |
| `_fdSpawned` | 31569, 61652–61653, 61656 |
| `_fdAnnounced` | 31569, 61665 |
| `_gateGuard` | 31612, 31627, 31653, 42743, 60713–60714 |
| `_gateGuardKilled` | 31569, 41884, 41908, 42743, 60725 |
| `_bossUnlocked` | 31569, 41869, 41875, 41881, 41886, 41904, 52005, 52040, 60213, 60800, 62280 |
| `bossGateOpen` | 29541, 30204, 30274, 30678, 30753, 30778, 42744, 63492 |

## 부록 C. 검증·미확인·제출

| 확인 | 결과·한계 |
| --- | --- |
| 원본 `game.html` | 65,692행, SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 이번 pin의 Git blob과 byte 대조 |
| 원본 `index.html` | 4,742행, SHA256 `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12`. 이번 pin의 Git blob과 byte 대조 |
| 순수 표본 | 7레벨×3계열 생성자,피격 gate5표본(true/true/false/false/true). 원본을 평가한 자료이며 Godot 제품/테스트 PASS 아님 |
| 정적 검색 | 65함수·G16필드,index 직접 참조0. 요청 primary9문서와 Godot 본문/API·tracked 자산 경로 대조. 원본 색인·hash·표본 JSON은 외부 보존 |
| 실행 | Godot/import/신규·기존 테스트/게임/서버/브라우저 실행0. 전투·화면·오디오·PC 재생/인수 미확인 |
| 제출 | 이 문서+CHANGELOG 절2파일만 정상 hook commit·자기 branch 비강제 push. main push/force/전체 add 없음. 원격 SHA 확인→DONE 기록→자기 worktree 제거,branch/로그 보존 |

원로그·정적 근거·DONE: `/Users/fordeargamers/exoduser-wt/_out/trace-fieldboss/`. 최종 SHA/원격 일치·R 불변·정리는 외부 DONE과 Git 커밋을 기준으로 한다. 이 문서는 추적·설계 산출이며 필드보스 구현 완료 보고서가 아니다.
