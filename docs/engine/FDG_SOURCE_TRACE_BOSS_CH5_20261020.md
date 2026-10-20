# 5장 보스 원본 추적·작은 이식 단위 지시서 — 2026-10-20

## 0. 기준·범위

기준은 fetch한 **origin/main `0105159934d0c2a8b167bd51518dca1e0fafe50a`**. `G`는 이 main의 `game.html` 행이며 SHA-256은 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`다. 원문은 필요한 구간만 추출·정적 선언/HP 산술을 관측했다. **Godot/import/제품 회귀/실창/저장 실행0**, 원본·공용 Main/State/저장·기존 보스 코드 변경0. 문서 정적 검수와 실제 전투 PASS를 구분한다.

형식·공통 상세는 [CH4 추적](FDG_SOURCE_TRACE_BOSS_CH4_20261020.md), [CH3 추적](FDG_SOURCE_TRACE_BOSS_CH3_20261020.md), [CH1 추적](FDG_SOURCE_TRACE_BOSS_CH1_20261020.md)을 참조한다. CH4 문서 작성 당시와 달리 현재 main에는 CH2 catalog/bridge와 CH3 catalog가 있다. 그러나 **CH4 catalog는 Git tree에 없으므로 BC5-01 구현 착수는 그 정식 인수 전 BLOCKED**다. 이번 문서 작업의 차단이 아니다.

## 1. 보스 5개·HP·기술·콤보·phase

공통 생성은 G16679–16710/31119–31184: hell=4, element=EL.D(3), body color=#9933cc(G14333/14338), ib=true/etype0/r44/speed.5. STG.monLv=500은 맵 표기값이고 실제 `L=max(1,(P.lv||1)+(DIFF_LV_OFF[OPT.diff]||0)+(G._stageDiffOff||0))`다. 난도 dm은 G9272/9276, elite0의 hpMul/atkMul=1을 사용한다.

`C(L)=(L<=500?0.4*L*L*L+199*L+100:50000000*1.0014^(L-500))*2.925`, `pacing=1/(1+min(9,max(0,L-1))/18)`, **H=floor(floor(C*pacing*24*dm)*(1+si*.02))**, **A=floor((75+2.9*L)*.6*dm)**(G31119/31145–31152). 표는 dm=1의 L1/L100이며 A는 전원46/219다. 최종 슬롯에 FINALBOSS15/5를 더 곱하지 않는다. binary64 연산순서·이중 floor를 보존한다.

| si / 보스 | H(L1 / L100) | 최종 Set 크기·추가(직전 대비) | combo 총수 / phase0,1,2,3,4 후보수 | phase / 초기 revPts | 원문 |
|---|---:|---|---|---|---|
| 21 / 5-1 전쟁의 잔해 | 29,844 / 27,911,520 | 48 · 공유45+judgeCut/phantomSwords/crescendoCombo | 58 / 17,37,54,58,58 | 0..4 / 324 | G9993,16693,31145–31181 |
| 22 / 5-2 뼈산의 왕 | 30,264 / 28,304,640 | 49 · +mirrorGuard | 59 / 17,37,55,59,59 | 0..4 / 329 | G9994,16693,31145–31181 |
| 23 / 5-3 악마 사령관 | 30,684 / 28,697,760 | 50 · +rewindStrike | 60 / 17,37,56,60,60 | 0..4 / 335 | G9995,16693,31145–31181 |
| 24 / 5-4 철벽 기사단장 | 31,105 / 29,090,880 | 51 · +orbWeave | 60 / 17,37,56,60,60 | 0..4 / 341 | G9996,16693,31145–31181 |
| 25 / 5-5 군단 지휘관 | 31,525 / 29,484,000 | 52 · +mirrorClone | 61 / 17,37,57,61,61 | 0..4 / 347 | G9997,16693,31145–31181 |

콤보 수는 **seq 전체가 해당 Set에 있고 combo.phase가 일치하는 정적 후보**이며 score/CD/첫 기술/개별 move.phase/추첨까지 통과한 발동 수가 아니다. G9881–9950의 global68 중 CH5 union61=CH4 공유54+신규7. 신규 ordinal(0-based)은 **33,36,37,40,41,46,52**: 각각 `judgeCut→swordWave→charge`(phase1..4), `phantomSwords→judgeCut`, `burstCounter→crescendoCombo`, `crescendoCombo→sweep→slam`, `mirrorClone→slashCombo→sweep`, `rewindStrike→judgeCut`, `mirrorGuard→crescendoCombo`(나머지 phase2..4). 원문 G9915/9918/9919/9922/9923/9928/9934. orbWeave→darkZone(G9932)은 darkZone이 CH5 Set 밖이므로 si24에도 신규 유효 combo가 늘지 않는다.

**공통/신규 분리:** global59기술 중 CH5 union52=CH1과 겹침22+CH2 추가10+CH3 추가7+CH4 추가6+CH5 신규7. CH4 union45 전체를 재사용한다. 모든 Set에서 cageTrap 삭제(G10008–10010); CH5 밖은 `tailSwipe,burrowStrike,cageTrap,darkZone,soulAnchor,doppelganger,itemSteal`. 기본48=공유45+judgeCut/phantomSwords/crescendoCombo이고 G9994–9997의4단계 unlock을 보존한다. Set 삽입순서와 global source_ordinal 순서는 별개다.

**공통 phase/AI:** G9951–9957의5phase·8필드, G38236–38314의 hp/mhp strict `>.8,>.6,>.4,>.2` 및 한 번에 상위 phase 이동, iframe90/maxPoise×1.2/현재poise 유지/recover45·patT10·CD reset0..58을 재사용한다. spawn HP의 floor와 phase 회복의 `~~`를 혼동하지 않는다. burstCounter의 idx60/ordinal31·초기 CD59칸·idx60 미감산은 CH4 §2.2 그대로다. 공통 selector/clock·원본 RNG·중첩 hazard 순서 재작성0.

## 2. 신규7 기술의 시작→소비 핵심

각 항목의 `idx/ordinal`은 원본 그대로이며, 11개 metadata 필드의 정본은 적힌 선언 행이다. start의 실제 시간은 metadata tele/rec와 다를 수 있다. 아래 raw 피해는 이후 원소/실제 hurtP/hurtE owner에 전달할 값이다.

- **judgeCut** idx24/ordinal25(G9846; tele60/rec40/cd160, phase1..4). G37814–37830→37055. phase0..4 개수1/2/2/3/3, 각 XY2draw·P 주변 수직 오프셋60+노이즈±15. delay24+8i/maxT54+8i/r375/raw~~atk2.5, recover35. 소비는 `t>=delay && t<delay+sp+2`, hit를 먼저 세우고 거리<r(**Pr 없음**)/iframe, 패링×3·stun60/poise20 또는 charge 제외 피해. 안정압축·배열identity 보존.
- **phantomSwords** idx29/ordinal30(G9851; tele60/rec40/cd180, phase1..4). G37878–37888→37061. swords=4+phase*2, delay60/fireInterval9/fireT0, 저장된 생성 XY에서 매 발 현재 P 방향 재조준. raw~~atk1.8, 속도5.5/life250/redBean+phantomSword+homing 요청, recover40. tick당 최대1발이며 제거는 fired>=swords **AND** t>delay+swords*9+30. 발수 catch-up/생성점의 src 추적을 임의 추가하지 않음.
- **crescendoCombo** idx31/ordinal32(G9853; tele20/rec40/cd200, phase2..4). G37896–37902→41302–41325. 첫 st2=48, 최대5+min(phase,2)타, 이후 st2=max(9,48−idx*6)지만 **진행률 분모는~~(48−idx*5)**. .3<진행률<.7·각차<1.4·거리<r+Pr+35·iframe 검사. 패링×2/stun30/poise15 또는 raw~~(atk*(1+idx*.15)*elMul)/KB5. 매 타 재조준, 전체 종료recover45. 분모와 재대기식 통일0.
- **mirrorGuard** idx45/ordinal46(G9867; tele20/rec60/cd180, phase1..4; si22+). G38054–38058→41352–41355, 피격 G42120–42127. active=true/T0/max120·state120; timeout active=false/recover20. hurtE는 reviveIframes 선행 거부 뒤 raw~~(atk*2*elMul), active=false/P.iframes15/recover30/return. 이 분기에 거리·isDot 제외·charge·isPWin 검사는 없으며 실제 hurtP 보호는 그 owner 권위. **CH4 burstCounter처럼 active가 남는 반격과 다르다.** 실 hurtE 연결은 공용 통합 전 HOLD.
- **rewindStrike** idx37/ordinal38(G9859; tele60/rec40/cd180, phase1..4; si23+). G37979–37990→37073. 개수1/2/2/3/3, 각 XY2draw(ri0도 소비), P위치+노이즈ri*40, delay120/r350/raw~~atk2.5/recover35. hit를 먼저 세우며 거리<r/iframe/패링×3·stun60/poise25 또는 charge 제외 피해, t<160 유지. **주석의 ‘2초 뒤 텔포’와 달리 이 실행 경로에는 보스 좌표 쓰기가 없다.** 텔포를 만들어 넣지 않는다.
- **orbWeave** idx43/ordinal44(G9865; tele35/rec50/cd240, phase2..4; si24+). G38037–38046→37147. N=4+phase, 원주균분+반경120+U30(개당1draw), spd.04/maxT300/orbR10/raw~~atk*.7/recover35. src 생존 시 추적, 아니면 `_lx||0,_ly||0`; 각도·t 갱신 뒤 **충돌부터** 검사(거리<orbR+Pr/iframe). hit 시 소비·12입자draw; 이후 만료/사망 trim. 이 큐엔 패링·charge 제외 gate 없음; 사망 첫 tick 좌표0도 임의 보정0.
- **mirrorClone** idx33/ordinal34(G9855; tele60/rec40/cd240, phase2..4; si25). G37914–37929→37065. phase>=3 두 개, 그 외1개; 현재 facing 수직 ±50, delay18/maxT180/r=.8r/atk~~(.5atk)/attackCd40/recover30. tick당 최대1타·거리<clone.r+Pr+40, 패링×2/원보스poise10 또는 charge 제외 피해. **분신이 보스 기술을 복제하는 dispatcher는 없고**, 자체 근접타+src 주변 보간 이동이다. 배열 인덱스 mi의 짝홀수 편향과 안정압축 순서도 보존.

공유 공격의 stage 산술(소환수·laser 길이 등)은 CH4 정본의 같은 식에 **실 si21..25**를 넣는다. 일반 자동탄은 G40513–40514→20134–20136의 dark/EL.D/gbBean/속도3.3/raw~~atk이고, chainLightning의 EL.L 같은 공격별 예외는 그대로다. arena는 G30697–30747의 hell4/type4 타원,128×108/T40/중심64,54·반경62,52·하단입구64,103. 생성 색은 공용 spawn_contract.gd:110의#bbbbbb와 원문#9933cc가 달라 owner의 별도 인수가 필요하다.

## 3. docs/8.1보스디자인바이블 대조

기존 설계 문서는 수정하지 않는다. 경로 기준은 [BOSS_BATTLE_SETTINGS.md](../8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md); 폴더8문서 대상 키워드 대조 원로그는 L/bible-new-moves-index.log다.

| ID | docs 위치·요약 | 원본 근거·판정 / 구현 지시 |
|---|---|---|
| C501 | BOSS_BATTLE_SETTINGS:231의CH5 신규4개만 열거 | G9992–9997. **부분 누락**: si21부터 judgeCut/phantomSwords/crescendoCombo도 CH1~4 대비 신규. 이후guard22/rewind23/orb24/clone25; 전원52로 취급0 |
| C502 | 같은220/233/235의49종/null 및 cage 허용 이력 | G9820–9880/10008–10010. 실제global59/CH5최종48..52의Set·cage삭제. ordinal·idx 재번호화0 |
| C503 | 같은101–111 HP/ATK 감사 수식 | G31119/31145–31152와 **식 일치**, 문서296xx→현재311xx. stage21..25·실효 L 적용. 초기실드/poise=H, 최종군단장만 별도15배 추가0 |
| C504 | 같은193의phase ATK×1.3 강화 요약 | G38252 즉시 강화는 있으나 **G38771 매tick baseAtk 재대입**. 영구 baseAtk 강화로 해석 금지; CD59와 idx60 분리도 유지 |
| C505 | 같은66의군단 타원형 | G30698–30722와 **일치**. 군단/기사 이름에서 새 기둥·벽·방어력을 추정하지 않음 |
| C506 | 폴더 내 CH5 7기술 상세·61combo·unlock별 후보 표 없음(231 요약만) | G9846/9851/9853/9855/9859/9865/9867,9915–9934. §1~2가 보완 정본. 원문 주석 ‘rewind 텔포/분신 공격복제’도 실행 없는 동작을 지시하는 근거로 쓰지 않음 |
| C507 | 같은191–205 phase 회복/전조 공통 요약 | G38236–38314. strict 경계·최고phase·maxPoise만강화·CD0..58·원래 재진입순서 유지. 별도CH5 phase 알고리즘0 |
| C508 | 폴더의 CH1 개별 보스·드루이드 원화/전용 설계 | G16693의5개 신원과 별개. G64947–64982/65096은hell0만전용·hell4기본3D fallback, G24758–24764는si0..3만전용SFX. CH5 5개 독립모델/전용음성/화면완료 근거 없음 |

## 4. BC5 작은 단위 순서안

1. **BC5-01 catalog**: 5슬롯/52기술/61콤보/공통5phase·원문 oracle. CH4 catalog 정식 인수 전 BLOCKED.
2. **BC5-02 공통 reuse**: chapter catalog/context와 spawn/utility/selector/phase/start를 실si21..25로 검증. 공용 색·stage guard 일반화가 필요하면 owner 인수 전 HOLD, 사후 덮어쓰기0.
3. **BC5-03 신규7 start**: 원문 draw·start st2·5queue(judge/phantom/rewind/orb/clone) 요청/ack. 기존45 start 복제0.
4. **BC5-04 judgeCut queue**: delay 창/선 hit/strict r/패링·charge 순서·압축.
5. **BC5-05 phantomSwords queue**: 고정생성점·재조준·1발/tick·AND제거·투사체 owner.
6. **BC5-06 crescendo state**: 48−5i 분모 vs48−6i 대기·타수/이동/피격readback.
7. **BC5-07 mirrorGuard state**: timeout120/recover20 독립계산. hurtE 반격은 별도 통합 결정 전 HOLD.
8. **BC5-08 rewind queue**: 2draw/점·120/160·텔포 없음·패링/순서.
9. **BC5-09 orb queue**: src fallback·충돌 선행·charge gate 없음·소비/trim.
10. **BC5-10 clone queue**: 근접타·src보간·배열인덱스 의존·복제dispatcher 없음.
11. **BC5-11 공유45 재사용 fixture**: 실stage 산술/EL.D 및idx60·CD59 예외·공통 phase. 선행 CH2~4 상태모듈의 실제 인수 범위 밖은 명시 NOT_READY.
12. **BC5-12 부활·연출·실제품 통합 사양**: G42515–42649/34493–34535/41816–42009의revPts/180f폴백/문gating/hellCleared4·기존owner재사용. 실arena/actor·5queue·HUD/renderer/SOUND·Main/World/State/hurtE/저장 연결은 통합 권한 결정 전 BLOCKED. 새 CH5 부활/저장 시스템0.

## 5. 1번 BC5-01 구현 지시서

- **착수 gate/범위:** 새 fetch main에서 정식 `native_ch4_boss_catalog.gd` 및 그 의존 CH2/CH3 provider가 실재하고 ready/source hash/global manifest가 일치하는지 확인. 현재 CH4 없음. 없으면 파일·필요 API·근거만 보고하고 멈춘다. 미병합 끝 분기/임의merge/공통 literal 복사·빈 provider로 우회0. 이 절은 의존 해소 후 별도 배정용 지시서다.
- **자기 파일/API:** 신규 `godot/scripts/native_ch5_boss_catalog.gd`, `godot/tests/test_boss_ch5_bc5_01_catalog.gd`, 자기 source oracle/UID·보고서만. CH3:34–95와 같은 `source_receipt,boss_for_stage,moves_for_stage,move_by_id,phase_by_index,combos_for_stage`. 지원 si21..25/phase0..4; 다른 stage·id는 명시 unsupported/빈 조회, 손상 의존은 ready=false/NOT_READY로 구분한다.
- **데이터/소유:** 보스 packet에 name_ko/si/hell4/element_id3/element_color#9933cc/ibtrue/etype0/Set 삽입순서 전달. 공유45 move·5phase·54combo는 CH4 공개 API 조회·깊은복사만. CH4의7stage×5phase에서 globalordinal로 combo 중복을 제거하되 같은 ordinal 내용 불일치는 거부하고 같은 seq의 다른 ordinal은 보존. 신규7 move의11필드+source_ordinal/line은 §2 선언 행, 신규7combo는 §1 원행만 소유한다. 반환 move/콤보는 globalordinal순, Set membership/phase 필터 뒤 §1 count와 전부 일치해야 한다.
- **receipt/불변:** game 전체/hash·추출 구간 hash·기준 main·실제 의존 인수 SHA/manifest를 명시. global59/68/5phase/stages21..25/union52=45+7/combo61=54+7/max_idx60/CD59 예외/live_combat_connected=false/rng_draws0/save_io=false 기록. 고정 과거 HEAD 문자열을 정답으로 쓰지 말고 기록된 provenance와 원본 바이트를 검증한다. 이 단계에서 HP/selector/phase/시계·큐 소비자를 재작성하지 않음.
- **독립 oracle/경계:** 최신 main game을 --source-game으로 명시하고 원문 선언만 Node VM에서 평가해 expected 생성(제품에서 expected 역생성0). 5Set·52move11필드·61combo seq/phase/ordinal·5phase8필드 전부 exact 비교. si20/26·phase−1/5·제외7id·unlock 앞뒤·idx≠ordinal·orb24 combo증가0·반환별칭·source/manifest 손상 거부 유지. HP는 기존 spawn의 binary64/정수 순서 사용, 이번 catalog에 복사0.
- **검증/운영:** 후속 구현 때 바꾼 파일의 catalog·직접 공유 provider 회귀만1회, 실패 때만 재실행. 출력은 UTF-8 파일·OS.execute 전체join/임시파일, --node-bin 필수. 결함 주입은 핵심3종(신규 필드1개·unlock1개·공유 manifest 손상)만. 후속 새 userdir는 별도 배정 이름, 기존 회귀는 파일 상수. 이번 `EXODUSER-trace-boss-ch5-Isolated-20261020`은 **미사용**. Godot를 실행하는 후속 단위는 매run pgrep Godot 수>=2이면30초대기/override 매run·종료0byte.
- **중단선/제출:** 공유 spawn color:110, 실제 boss_hurtE(G42123–42127), Main/World/State 5queue/actor·시계·진행 접점은 파일:행·OLD/NEW 제안만. owner 권한 결정 전 BLOCKED. 정상 docs-sync 절·경로 지정 add·자기 branch 일반push·remote SHA/DONE 후 자기worktree 제거. rebase/force/main push/add -A 0.

## 6. 검수·인계

원로그 `~/exoduser-wt/_out/trace-boss-ch5/`: 제한 구간 원문·declaration-analysis.json·Bible/현재 provider 행 색인·정적 문서 검수. 변경은 이 문서·CHANGELOG_SYNC 맨 위 절·WORK_BOARD 자기 행뿐이다. 정적 문서 검수는 **1회 29통과/0실패**, 제품 회귀0·결함 주입0(문서 전용)이며 자동 게임 PASS로 합산하지 않는다. R의 branch/head·tracked INDEX/WORK 보존, 자기 branch push·원격 일치·DONE 후 자기worktree 제거. 시각·실전·PC 검증은 미실행이다.
