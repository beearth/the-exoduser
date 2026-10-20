# P2-008a — 1-1 미지원 적 source 추적·부분 이식

## P2-008a-FIX 포이즈 후속 정정 / 2026-10-20

최초 후보의 직접 `apply_native_normal_enemy_poise_core` 계약/실드 검증만으로 실제 hurtE 포이즈 dispatch까지 검증한 것은 아니었다. 실제 경로는 상속된 type0 전용 `apply_native_source_poise_hit` 메서드 유무를 먼저 보고 잘못 들어가 `42490 source_field_call_unavailable`로 정지했다. 실행자 조건1줄로 명시된 전용 core를 우선하고, type0의 기존 field-owner 조건·메서드·원 수치를 변경하지 않았다. owner 거부 시 원 정지는 유지하고 두 경로를 연속 호출하지 않는다.

| 항목 | 원본 / 확인 |
|---|---|
| 세 actor 초기 포이즈 | order4/10/12 모두 poise875/maxPoise875/poiseR0. HP2187/875/875와 구분. `31164` 및 gate caller 적용 이후 원 record |
| `_poiseHit` | `19972-19983` amt≤0/사망 무변경, poise−=amt 한 번·R0, zero clamp·일반 stun/max180 |
| 자연 회복 | `38660-38664` 200tick / trunc875×.15=131, max875 cap. 새 배율/별도 포이즈 owner 없음 |
| 실제 재현 | 원본 옵션의 근접 Crescent 충돌→hurtE, 명시 fixture base100/실드0. 수정 전3halt·포이즈875 유지, 수정 후3개 모두 halt0·HP−100/poise875→775/R0 |
| 검증 | 새55check/0 및 p1002g247/0. p1002g는 기존6대상 검증을 유지하고 모든 실제 처치 owner를 대조하도록 집계 누락을 보정(검사27개 추가) |

원로그·필수 회귀·커밋은 [P2-008a-FIX 보고서](orders/reports/P2-008a-FIX_REPORT.md). 이하 최초 이식 당시 기록은 보존한다.

## 범위·원본

이 문서는 `codex/p2-008a-ch1-enemies-pc-20261020` 후보의 현행이다. main/Mac/배포본 갱신을 뜻하지 않는다. QA-001의 6지원/10미지원은 당시 정확한 이력이며 이번 후보는 **9지원/7미지원, 총16개체**다. **종류 수가 아니라 원본 레코드 수**이며, 새 구현은 etype20 한 종류의 정확한 세 프로필(order4/10/12)이다. `encounters.json`의 support=false/runtime=null은 추출 당시 영수증이므로 바꾸지 않았다.

| 원본 | SHA-256 |
|---|---|
| 이 worktree game.html, 65,693줄 | 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4 |
| godot/data/encounters.json | 91fd1a88b394152cd8b0de653f1bde5139b7829f331787581616f7ef3c0724fa |

1차 레퍼런스: `docs/8.0몬스터디자인/몬스터_총관리.md`, `몬스터_공격시스템.md`, `code_etype20_29_얼음몹_애니메이션_공격모션_정리.md`, `docs/9적ai패턴디자인/9_적AI패턴디자인.md`를 읽고 실제 원문 분기로 대조했다. 개념상 얼음 몹 이름과 원본 스킨·el은 서로 다르다. `native etype N`이라는 레코드 이름을 임의 개명하거나 el을 ice로 바꾸지 않는다.

## 초기 미지원10개체 전수표

시작점은 map.json의 `(4020,7420)`. 초기 미지원10개는 모두 상단 gate 부근이다. 아래 순서는 시작점 직선거리 증가순이며, 실제 플레이어 경로/조우 시각 실측은 아니다. 우선 etype20의 가장 가까운 order10부터 확인한 뒤 동일 원분기의 나머지 두 exact 프로필을 등록했다. 좌표·배치·맵은 변경하지 않았다. HP/쉴드/포이즈·r·speed는 추출 레코드의 원값이다.

| order | etype / 코드 주석명 | el | HP / shield / poise | ATK | radius | speed(px/tick) | spawn(x,y) | 스킨 col/row·높이 | 후보 상태 |
|---|---|---|---|---|---|---|---|---|---|
| 10 | 20 빙결전사 | physical | 875/875/875 | 31 | 21.945927370339632 | 0.5415485634338111 | 4071.338948165395,498.0050355845301 | carapace_predator 7/0·153.62149159237742 | 등록 |
| 11 | 47 그림자 쌍둥이 | physical | 875/875/875 | 31 | 26.665450139902532 | 0.7655834316909312 | 3969.716234383507,494.7575176250593 | flesh_crawler 6/0·186.65815097931772 | 미지원 |
| 9 | 21 빙궁수 | dark | 875/875/875 | 31 | 21.545625534839928 | 0.6989011177606881 | 4159.552543804879,441.39085796557566 | spine_beast 5/0·150.8193787438795 | 미지원 |
| 12 | 20 빙결전사 | lightning | 875/875/875 | 31 | 20.852594511583447 | 0.5635517939049751 | 3919.000584636192,413.38037056548455 | spine_beast 5/0·145.96816158108413 | 등록 |
| 4 | 20 빙결전사 | physical | 2187/875/875 | 31 | 20.28180555999279 | 0.6098637344744058 | 4036.995934690622,392.3081083962334 | flesh_crawler 6/0·141.97263891994953 | 등록·elite1/mods[] |
| 5 | 25 빙판슬라임 | physical | 2187/875/875 | 31 | 22.30737677309662 | 0.6269484242610635 | 3975.504065309378,372.328188876086 | carapace_predator 7/0·156.15163741167635 | 미지원·elite1 |
| 2 | 29 빙마 | physical | 3500/875/80 | 62 | 57 | 0.7913562389630824 | 4020,340 | carapace_predator 7/0·399 | 미지원·guardian/elite3 |
| 3 | 7 리치 | physical | 4377/1751/1751 | 40 | 22.73476334709674 | 0.39137590795755384 | 4075,340 | flesh_crawler 6/0·159.1433434296772 | 미지원·elite1/M30 |
| 6 | 6 방패돌격병 | physical | 2187/875/875 | 31 | 28.97044614702463 | 0.7508026934321969 | 3975.504065309378,307.671811123914 | apostle_knight 2/0·202.79312302917242 | 미지원·elite1 |
| 7 | 7 리치 | physical | 2187/875/875 | 31 | 20.151121815666556 | 0.362181977564469 | 4036.995934690622,287.6918916037665 | soul_flame 3/0·141.0578527096659 | 미지원·elite1/mods[] |

## AI·투사체·애니메이션 원본 행 추적

| 적용 | game.html 행 | 실제 원분기 / 의존성 |
|---|---|---|
| 공통 타입/사거리 | 30870–30878 | etype20=400,21=800,25=600,29=1000,6=400,7=800,47=400 |
| mkEn 스탯/타이머 | 31120–31390 | raw native_factory/native_final·initial_timers 전체는 encounters.json 보존. _iceOnHit=true/_iceFreeze=.35는 능력 발동 증명이 아님 |
| 공통 어그로·추적 | 38681–38705 | idle/recover·LOS·d<800; 근접 사거리≤400은 d>30에서 flow 이동. 원본 flow1배 뒤 idle1.6배, 합2.6배인 순서 유지 |
| etype20 | 39057–39060,31154–31157,40498–40518 | 타입 전용 idle 분기는 빈 본문. _meleeET에20 없음, _noProjEtypes[20]=1로 projCd9999. **자연 접촉 피해/탄막/빙결을 임의 추가하지 않는다** |
| eModHitP | 31098–31113 | mods가 비면 즉시 return. 이번20 세 프로필은 모두 mods[]. 이름/주석의 ‘35% 빙결’과 실제 현재 도달성을 구분 |
| etype47 | 31285–31287,39408–39428 | clone timer→mkEn type40/HP30%/ATK50%/shield0, 해당 분기에 직접 ens.push 없음. TP 전조120→순간이동·쿨다운. constructor/RNG·경고·텔포 exact 추적 필수. 주석만 보고 가짜 clone 등록 금지 |
| etype21 | 39061,40462–40518 | 원거리800: .65/.85 간격 및 idle <80 후퇴 .6/>200 전진1.2, 공통 탄막/60틱 차징. 이 기록 el=dark이므로 얼음 화살로 바꾸면 안 됨 |
| etype25 | 31228–31229,39078–39083 | 감속 지대: 정지 iceZone·EL.D·dmg0/life480/sz2, 고유 타이머. 원거리600와 공통탄 필수 |
| etype29 | 31230–31231,39124–39139,42816–42823 | d<120 강타 wind45, I 8방향(속도3·계수1.2·life300·sz2), d<100 slow120, 확률 .008×sp 돌진·사망8방향 효과. 원본 gate 해방/보상 연동까지 별도 필요 |
| etype7 | 38920–38948 | TP 전조·소환·채널/복귀·공통 탄. order3 M30와 order7 다른 스킨은 각각 exact 의존성 필요. 기존 pending/assembly를 factory 완료로 간주하지 않음 |
| etype6 | 38891–38917 | 원거리 아군 호위60%·shieldAng 추적 .08×sp, shield 파괴 후 bash20. Q/E·공격 티켓 재구현은 이번 범위 아님 |
| idle/분리/복귀 | 40456–40497 및 기존 dedicated consumer | idle1.6, 이웃 r×4.4/간격+4/force1.5, sep cd3. 기존 body/walk·쉴드·포이즈·hurtE owner helper만 재사용, type0 AI는 호출하지 않음 |

## etype20 소비 계약

| 항목 | 현행 |
|---|---|
| 구현 | enemy_melee_ch1_ice_warrior.gd extends 기존 flesh 스크립트. _physics_process는 전용 구현이며 super AI 호출0 |
| admission | etype20_ch1_ice_warrior.json의 source SHA 및 order[4,10,12]; 전체 원레코드를 canonical record와 비교. 임의 다른 etype/skin/el/elite로 일반화하지 않음 |
| payload | 원record deep copy에서 facing/eShield/eShieldMax/eRes/native_flags/animation만 소비용 추가. 원추출 support/runtime/타이머/RNG receipt는 변경0 |
| 피격 | native_dedicated_enemy_hurte_owner.gd의 read/field/HP/death API 상속, 포이즈 core 명시 위임. Main의 실제 hurtE.execute로 세 프로필의 쉴드 흡수 확인 |
| AI 시계 | delta×60·추적/idle/분리/피격·스턴 guard/포이즈 리젠. projCd9999/projT 보존, charge·자연 공격 생성0. full JS global scheduler/모든 선택 상태 parity 주장0 |
| 원본 아트 | 기존 base8방향+walk8방향 atlas **16개/22,734,844B SHA-256 동일** 재사용. 새 이미지 생성/재편집/새 copy 불필요. base2048×1280·walk8192×1280, 256셀/4 walk프레임·128px 이동당1프레임. 개별 파일 [manifest](orders/reports/P2-008a_ASSETS.json) |
| 제외 | 공격 티켓·Q/E·레슨·main/player 입력·세이브·map 지형·서버·배포 수정0. 원본의 무공격 상태를 새 밸런스로 보완하지 않음 |
| 미검수 | 새 세 프로필의 public 입력 전투·실창1x/모든 8방향 시각 QA·실측 성능은 미확인. 재사용 아트/헤드리스 통과를 visual PASS로 표시하지 않음 |

테스트·복구·제출 SHA: [P2-008a_REPORT.md](orders/reports/P2-008a_REPORT.md). 원본 전체10레코드 보존 사본은 로컬 산출물 `G:/exoduser-wt/_out/P2-008a-pc/source-ten-records.json`에 있다. 나머지 미지원 order `[2,3,5,6,7,9,11]`은 각각 고유 동작·필수 서비스가 준비된 뒤 다음 작업으로 이식한다.
