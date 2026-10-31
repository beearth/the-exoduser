# 무기·활·속성 원본 추적과 이식 순서 — 2026-10-20

## 1. 판정과 조사 기준

현재 원본의 분모는 **근접무기 7종·석궁 3종·EL 7개(물리 1+비물리 6)**다. 요청에 적힌 활 5종·속성 5종은 현재 실행 카탈로그와 다르다. 이미 이식된 카탈로그·상성·근접 기본 공격을 다시 만들지 않고, 첫 단위 W01은 Godot에 미이식인 원본 `_autoBowSpec()` 순수 계산만 새 모듈과 새 테스트에 이식한다. W01은 공용 제품 파일 수정 0줄로 구현할 수 있다.

이 문서는 추적·구현 지시서다. 이번 작업에서 제품·테스트·설계 문서를 수정하거나 Godot를 실행하지 않았다. 아래의 새 파일·테스트·사용자 폴더는 **다음 구현 작업의 제안**이며, 현재 존재하거나 통과한 것으로 읽으면 안 된다.

| 항목 | 고정 기준 |
|---|---|
| 작업 | `trace-weapons` |
| 브랜치 / worktree | `codex/trace-weapons-20261020` / `~/exoduser-wt/trace-weapons` |
| fetch 후 기준 main | `ad6ac68a2e009c4d299fe1dd2264182355ee992c` |
| `game.html` | 65,692행, SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| `index.html` | 4,742행, SHA256 `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12` |
| 행 번호 표기 | `G:`는 위 SHA의 `game.html`, `I:`는 `index.html`. Godot·문서 행도 같은 main 기준 |
| 변경 소유 | 새 문서 `docs/engine/FDG_SOURCE_TRACE_WEAPONS_20261020.md` 한 개 |
| 원로그·조사 보조 자료 | `~/exoduser-wt/_out/trace-weapons/` |
| 실행 검증 범위 | 원본의 일부 순수 선언·함수만 Node VM에서 추출 평가. 게임 부팅·Godot 테스트·화면 검수는 미실행 |

행 번호는 이후 main 이동 시 달라진다. 다음 구현자는 위 SHA/해시와 함수 본문을 함께 대조하고, 변경된 본문이 있으면 먼저 추적을 갱신한다. `R=/Users/fordeargamers/Projects/exoduser-migration-20261001`은 읽기 전용으로 유지한다.

## 2. 선행 문서와 중복 소유 경계

| 읽은 문서·현재 상태 | 이 문서에 적용한 경계 |
|---|---|
| `docs/engine/orders/WORK_BOARD.md` | TRACE-META·TRACE-INVENTORY·TRACE-REVIVE-SHIELD 진행 중. 다른 worktree의 미병합 내용을 인수했다고 가정하지 않음 |
| `docs/engine/FDG_GAME_DEVELOPMENT_PLAN.md` | P4의 계약→독립 검증→실제 호출 연결 순서를 따름. 정적 데이터나 독립 모듈을 전체 플레이 완료로 합산하지 않음 |
| `docs/engine/FDG_FEATURE_INVENTORY_20261020.md:57,527–536` | 이미 WTYPES7/BOWTYPES3 구분. 무기·활 개별 행은 partial. 문서 자체의 기준 SHA `2845f96…`와 현재 main을 구분 |
| 같은 FEATURE-INVENTORY의 1,061 leaf 집계 | 387 none / 665 partial / 6 isolated / 0 play / 3 unknown은 해당 스냅샷 집계다. 최신 main의 실행 성적이 아님 |
| `FDG_SOURCE_TRACE_QUICKSLOT_20261020.md` | QS01 회복 계산·QS02 자동 사용 순서·belt·forge·UI 소유를 중복 배정하지 않음 |
| `FDG_SOURCE_TRACE_SAVE_20261020.md` | 저장 collection/restore·transport·migration 소유. item은 가변 객체 전체를 직렬화하며 무기 전용 저장 whitelist를 새로 만들지 않음 |
| `FDG_SOURCE_TRACE_SETTINGS_20261020.md` | 설정·입력 의미와 T키 같은 실제 라우팅은 설정 담당과 합의 후 연결. 이 문서는 키 재배정 지시가 아님 |
| `docs/2_2 무기+활+속성시스템/` | 현재 D22는 무기7·활3·EL7로 정리되어 있음. 차이는 §7 표로만 보고 |
| `docs/14밸런스+수치테이블/` | ref·ATK 생성·강화 예시의 불일치를 확인. 경제 전체는 TRACE-META 영역 |

현재 충돌 가능 구역은 P2-006b의 `native_world_drops.gd` 표시부, P3-002의 world 동적 등록/소환굴, P2-007a의 글꼴·인트로·검기색, QA-002의 테스트 결정성/종료 누수다. W01은 이 파일들을 열어 수정하지 않는다. 공용 보드 갱신보다 **이번 사용자 지시의 새 문서 1개 제한**을 우선한다.

보호 범위는 `docs/2_3 돌진+패링+방패시스템/`, Q/E·blackBean 패링, 저장 형식·migration, 실제 사용자 저장 폴더 `EXODUSER-Godot-Native-First`다. 아래에는 관측 접점만 적으며 변경을 배정하지 않는다.

### 2.1 제출 전 main 진행분 보충 대조

위 표는 작업 시작 기준이다. 제출 전 공유 remote-tracking `origin/main`이 `9528ea35b429498fcf42fe3723008219ed0ed7e1`까지 진행한 것을 확인했다. ad6→9528에서 **game.html/index.html 변경0**이며 W01의 두 신규 경로도 여전히 없다. 원본 행·§6의 Godot 행은 계속 **ad6 고정**으로 읽는다. main/world/state 등 다른 제품의 진행분을 이 문서 브랜치에 병합하지 않았으며, 후속 통합 때는 그 시점의 최신 파일을 다시 대조한다.

| 새로 병합/진행 확인한 문서·작업 | 추가로 적용한 경계 |
|---|---|
| `FDG_SOURCE_TRACE_INVENTORY_20261020.md`(9528 tree에서 읽음) | TI-00 실제 INV 계약, TI-04 refresh·캐시, TI-05 장착 writer를 재사용. **W01 대응 단위가 없어 첫 이식 단위 중복 없음** |
| 같은 문서 TI-03/TI-06 | 상세 UI·비교/CP 계산은 인벤 담당 단일 구현. W10은 그 owner에 무기 필드 계약을 인수하는 단계로 한정하고 별도 표시 계산 owner를 만들지 않음 |
| 같은 문서 C18 | 제작의 빈 슬롯 자동장착 G:51162–51178은 INVENTORY/META 조율. W01/W10에 제작 owner를 추가하지 않음 |
| `FDG_SOURCE_TRACE_REVIVE_SHIELD_20261020.md`(9528 tree의 해당 소유·단위·공용 접점 대조) | R1/R2 일반 예약·타이머, S1/S2 플레이어 실드, P1/P2 fallen/부활, B1–B3 보스 부활 소유. W08/09는 그 예약·ES·사망 순서에 새 owner를 중복하지 않음 |
| 최신 WORK_BOARD | P3-002/STARTER-REGIONS/REVIVE-SHIELD/INVENTORY 병합 상태를 시작 시점과 구분. TRACE-SKILLS·TRACE-ITEMS·TRACE-SOUND도 진행 중이므로 W06/어픽스/음향 후속은 해당 담당과 경계 확정 후 수행 |

W01의 기존 카탈로그·coercion helper·원본 수식은 이 진행으로 달라지지 않았다. 다른 세션의 작업판·진행 파일은 이 작업에서 수정하지 않는다.

## 3. 원본 데이터·상수·생성 필드

### 3.1 카탈로그와 명칭

| 구조 / 행 | 값·계약 |
|---|---|
| `WTYPES`, `WTYPE_KEYS` G:15863–15872 | `sword, dagger, hammer, mace, club, axe, spear` 순서. 이름은 검·단검·해머·메이스·곤봉·도끼·창 |
| 무기 7종의 공통 값 G:15864–15870 | **모두** `atkMul=1, stCost=5, spdMul=.45, arcW=.95, range=50, stagger=8`. 주석의 `kb`는 실제 정의 필드가 아님 |
| `_WP_MOD` / `_weaponName` G:15876–15883 | 원소0..4별 티어 접두사5개+WTYPES의 canonical name. tier 상한4, 없는 원소는 물리 접두사, 없는 wtype은 `무기/Weapon` |
| `BOWTYPES`, `BTYPE_KEYS` G:15886–15891 | 아래 석궁3종. 현재 카탈로그에 없는 종류를 복원하지 않음 |
| `bowNames` G:15898–15902 | 3종×원소0..4×티어5. H5/E6 이름 풀은 없고 생성 시 타입 이름 fallback. uniqueArt가 후단에서 덮을 수 있음 |
| `ITEM_SIZE`, `WTYPE_SIZE`, `BTYPE_SIZE` G:15830–15833 | 현재 weapon/bow 및 모든 하위 타입은 `[2,2]` |
| `SLOT_KR/EN/EMOJI`, `EQ_POS` G:15835–15859 | 무기 슬롯0·석궁 슬롯5, paper-doll 위치는 각각 `[0,294]`, `[558,294]` |
| `RARITY*` G:14346–14351 | `RARITY` 문자열 배열은5개지만 이름/색/배율은 unique 포함6개. `RARITY_MUL=[1,1.2,1.5,1.8,2.2,2.5]` |

| btype | 이름 | atkMul | stCost | spdMul | range | projSpd | 행 |
|---|---|---:|---:|---:|---:|---:|---|
| crossbow | 석궁 | 1 | 5 | 1 | 800 | 22 | G:15887 |
| repeater | 연사석궁 | .65 | 5 | 1.5 | 700 | 22 | G:15888 |
| arcane | 마력석궁 | 1.4 | 5 | .8 | 840 | 22 | G:15889 |

### 3.2 `mkItem`의 실제 생성과 확장 필드

`mkItem(slot,tier,el,rarity,wtype)`는 G:15894–16167이다. weapon/bow는 생성 중에 타입 배율을 `atk`에 이미 적용한다. 이후 발사 수식의 타입 배율 적용을 이중 적용 오류라고 임의 제거하면 원본과 달라진다.

| 항목 | 원본 식·행 |
|---|---|
| ATK 상계 | `_atkMax=~~((200+tier*200+(P.lv\|\|1))*.25)` G:15922 |
| 등급 최소 비율 | `[0,.05,.15,.25,.40,.50][rarity]\|\|0` G:15923 |
| 공통 ATK 롤 | `max(1,~~(_atkMax*(floor+(1-floor)*U²)))` G:15924. `U=Math.random()`의 실제 소비 순서를 보존해야 함 |
| 기본 속성 | weapon/bow base에 `atk`, `spd=1`, `antiRevive=+(0.01+0.19*U³).toFixed(2)` G:15926,15937 |
| 공통 레코드 | `id,slot,el,rarity,tier,name,emoji` G:15954–15956. weapon/shield는 직전 G:15953에서 `el=P` 강제 |
| weapon 타입·ATK | 인수 wtype 또는 WTYPE_KEYS 무작위, `atk=~~(roll*wd.atkMul)` G:15958–15964 |
| weapon 속도·비용 | `spd=+(wd.spdMul*rm).toFixed(2)`; `wStCost=~~(wd.stCost*(2-rm*.3))` G:15965–15966 |
| weapon 범위·경직 | `wArcW=+wd.arcW.toFixed(2)`; `wRange=~~(wd.range*(.95+U*.1))`; `wStagger=~~(wd.stagger*rm)` G:15967–15969 |
| weapon 거리 보너스 | `bonusRange=min(3,~~((1+tier*.4+rarity*.5)*(.8+U*.4)))` G:15970 |
| bow 타입·ATK | 인수 wtype 또는 BTYPE_KEYS 무작위; 알 수 없는 타입은 공통 item을 조기 반환; `atk=~~(roll*bd.atkMul)` G:15973–15979 |
| bow 속도·비용·거리 | `bowSpd=+(bd.spdMul*rm).toFixed(2)`; `bowStCost=~~(bd.stCost*(2-rm*.3))`; `bowRange=~~(bd.range*(.95+U*.1))`; `bowProjSpd=bd.projSpd` G:15980–15983 |
| bow 거리·관통 | bonusRange cap3은 weapon과 동일; `bowPierce=+((.02+tier*.03+rarity*.04)*(.8+U*.4)).toFixed(2)` G:15984–15985 |
| affix/implicit | `affixes` 후단 생성 G:16114. `_implicitStat/_implicitVal/_implicitKo` G:16116–16123. weapon `_iAtkPct`5..15, bow `_iPierce`5..15 G:15017–15018 |
| 전설·유니크 | `legendarySpecial`, 동적 효과 필드, `uniqueArt` 등 G:16125–16141. 고정된 무기 필드만 복사하는 이식 금지 |
| 요구 레벨·소켓 | `_pLv=P&&P.lv?P.lv:1` 후 `itemLv=min(900,floor(_pLv/10)*10)`, `reqLv=max(0,itemLv-10)` G:16143–16147; `socketCount=0, crystals=[], socketQ=[]` G:16148–16151 |

`_iAtkPct`·`_iPierce`는 game.html에서 정의 출현 각1회로 실제 수식 소비를 찾지 못했다. 외부 JS 소비는 **미확인**이다. 반면 장갑 `_iAtkSpd`(G:15022)는 `statDex`(G:27994)에 실제 연결된다. 생성된 이름·어픽스·implicit과 실제 전투 소비를 따로 인수해야 한다.

어픽스는 `_AFSLOT` G:14364에서 weapon→wpn/bow→xbow로 분류하고 `rollAffixes` G:15131–15144가 생성한다. 정의 G:14563,14567,14575–14577,14853과 실제 소비를 연결하면 ranged/proj 피해→G:42277, bow crit→42313, melee speed→33364, bowAtkSpd→28696·44961, pierceFlat→17348이다. **bowAtkSpd는 자동간격 G:35151에 직접 반영되지 않는다.** `weaponRange/bowRange` 어픽스 정의 G:14706–14707을 직접 읽는 `_eqAffix()` 호출은 game.html에서 미발견이다. 이를 item의 `bonusRange`와 같은 값으로 합치지 않는다.

### 3.3 장착 권위·저장 필드와 변경 순서

| 단계 | 구조·쓰기/읽기·원본 행 | 기존 소유 경계 |
|---|---|---|
| INV 생성 | `equipped.weapon`, `equipped.bow`, bag/그리드 G:16174–16180; `_itemSz` G:16183–16186 | INVENTORY |
| 현재 getter | `wp()` G:16498, `bw()` G:16503은 현재 장착 객체 또는 `{}` | 현재 INV 권위 재사용 |
| 장착 | reqLv gate G:16297 → 강화 이전 G:16303–16318 → 결정 이전 G:16321–16345 → 기존 장비 bag·새 equipped 참조 G:16348–16356 → refresh G:16363 → save G:16365 | INVENTORY/META/SAVE. 순서 바꾸지 않음 |
| 해제 | G:16367–16379. bag 빈칸 부족 시 해제 실패/보존, 성공 후 slot=null·refresh·save | INVENTORY |
| 능력치 갱신 | `_refreshEquipmentStats` G:16287–16291. affix/stat/legend 캐시 무효화, applyStats 후 현재 자원을 최대치 안으로 보정 | 새 캐시 owner 금지 |
| 장착·획득음 | G:16263–16265 sword/crossbow 전용, 그 외 기본; rarity≥2 보조음, pickup G:16270–16271 | 사운드 연결은 후단 |
| 효과 조회·일시 상태 | `_uEq` G:16512, `_uqS` G:16515, `_lEq` G:16620 | unique/legend 동적 조회와 runtime 상태를 저장 필드로 혼동하지 않음 |
| 전체 item 저장 | `inv` payload G:3551,62002,62139,63912,64069. bag/equipped의 **가변 item 객체 전체** 저장 | SAVE의 collect/restore 계약 보호 |
| 선택 활 저장 | `P.activeBowSk` 기본 normal G:29024; payload G:3565,62010,62151,63921,64078; 복구 G:3842–3846 | maliceMortar/ghostXbowTurret·미습득·합체에 흡수된 fanShot→normal. SAVE 소유 |
| 토글 설정 저장 | `OPT.xbowAuto` G:13222,49072; 설정 기본 G:48876, 복구 boolean gate G:49416 | 캐릭터 장비 저장과 별도 SETTINGS 소유 |
| 구 bow 복구 | `_fixBow` G:3650–3653: 현 BOWTYPES에 없으면 crossbow | SAVE |
| 구 무기 복구 | `_fixWpnSpd` G:3669–3674, `_spdMig3`; `_fixWpnName` G:3677–3681, `_nameMig1`, uniqueArt 보존 | SAVE |

`enh`, `affixes`, `bStr/bDex/bInt`, `uniqueArt`, `_u*`, `_l*`, crystals 등은 후속 강화·소켓·전설 시스템에서 추가될 수 있다. 이 표는 저장 schema 신설 제안이 아니다. P에 무기 전용 영속 필드를 만들거나 장착 시 다른 item의 동적 필드를 지우지 않는다.

## 4. 원본 함수·실행 경로와 UI

### 4.1 능력치·강화·패시브

| 함수 | 실제 식·순서 | 행 |
|---|---|---|
| `_slotFlatAtk` | 현재 그 item의 `sharpAtk/brutalAtk/ruinAtk` affix 값 `(+value\|\|0)` 합산 | G:28766 |
| `_lvB` | `~~(P.lv*.5)` | G:28768 |
| `meleeRef/bowRef/magicRef` | `((+item.atk\|\|0)+enhMulAtk(item.enh\|\|0)+slotFlat+P.baseAtk+(대응 STATS+eqStat+lvB))*(weaponSeal>0?.3:1)`; 대응은 weapon/STR, bow/DEX, helmet/INT | G:28770–28772 |
| `enhMulAtk` | `enh*.25` **가산** | G:28097–28099 |
| `statStr/statInt` | 각각1. ref에 해당 스탯이 이미 가산됨 | G:27993,27995 |
| `statDex` | `1+(DEX+eqDex+lvB)*.0005+(+gl.atkSpd\|\|0)+atkSpeedAffix+_iAtkSpd*.01+uGloveSpd+(lGloveElem>0?.20:0)` | G:27994 |
| `statCrit/statCritDmg` | LCK/레벨/장비합, pCrit, ring/necklace, affix/crystal을 읽음; 별도 bowCrit를 추정하지 않음 | G:27996–27998 |
| `_passDmgSum(type)` | `s=pAtk*.10+altAtk+(pHuman\|\|0)*.05`; melee면 pMelee*.15, magic이면 pMagic*.10+affix+implicit, bow/proj면 pBow*.15, xbow면 pXbow*.05, dot면 pDot*.15; **반환 `(1+s)*.7`** | G:28003–28014 |
| 배율 getter | `pAtkMul=위 melee`, `pBowMul=위 bow`, `pXbowMul=위 xbow`, `pMeleeMul=1` | G:28017,28042,28046,28048 |
| 활 패시브 | `pBowCost=max(.60,1-pBow*.04)`; `pBowRange=1+pBow*.08`; `pBowSpd=1+pBow*.10`; `pXbowSpd=1+(pXbow\|\|0)*.05` | G:28043–28047 |
| DoT getter | `pDotDmg=위 dot`, `pDotDur=1+(pDot\|\|0)*.10`, `pDotPool=1+(pDot\|\|0)*.05` | G:28066–28068 |
| 실제 baseAtk | applyStats에서 `G.on?15+((G.stage\|\|1)-1)*2:15`; 생성자의8·복구의 pd.baseAtk fallback8과 시점을 구분 | G:27926,29019,3617 |

`pBowRange`에는 `||0`가 없다. 누락된 pBow와 명시 null은 다른 결과다. 구현자가 clamp/기본0을 추가할 근거가 없다. JavaScript `~~`는 단순 floor가 아닌 ToInt32이므로 후속 수식 이식에서도 음수·비유한·큰 수를 별도로 대조해야 한다.

### 4.2 근접 7종 공통 공격과 특수 검기

| 경로 | 실제 실행 사실 | 행 |
|---|---|---|
| 비용 | `stCost('weapon')`은 kiSlash일 때 `10+(lv-1)*2`, 그 외5를 일찍 반환. 생성된 `wStCost`를 소비하지 않음 | G:31984–31989 |
| LMB 시작 | ST 소비 → `_atkBon=~~(소모ST*1.5)` → `wSwing`, `st2=5`, 현재 facing 고정 | G:33053–33056 |
| 공격 이동·시간 | 실제 이동계수.8(인접 주석20%와 다름). `st2<=3 && st2+sp>3` crossing에 타격 | G:33347–33357 |
| 범위·반각 | `(wRange\|\|50)+(bonusRange\|\|0)*4`; `wArcW\|\|.95` | G:33358–33359 |
| 기초 피해·회수 | `~~((P.baseAtk+(wp.atk\|\|0)+enhMulAtk(enh)+15)*6)`; `~~(16/((spd\|\|.3)*statDex()*(1+meleeAtkSpd+glovesAtkSpd)))` | G:33362–33364 |
| `hitArc` | weapon은 `~~(base*pAtkMul()*pMeleeMul())+atkBon` 후 bonus 소비; 거리≤range+e.r·각도差<arcW; full circle≥PI*1.99; 상성 정수화 후 hurtE | G:37603–37648, 특히37608–37617 |
| 경직 | 생성 `wStagger`는 표시·점수 참조가 있으나 실제 기본 hurtE 경직은 일반8f/엘리트4f | G:42413–42414 |
| 검기 준비·발사 | `spawnCrescent`, hold/tier/multiplier G:16788–16815; `_fireKiSlashCrescent` G:16816–16830; third-charge G:16833–16857 | kiSlash 의존. Q 취소 접점은 보호 |
| 검기 갱신 | `updateCrescents` G:19821–19849, 실제 caller G:34552. `_cresCd`는 설정16817·감소34555, LMB 발동 gate로 확인되지 않음 | skill 공통 clock과 협의 |
| 폐기·별도 상태 | `bowDraw` G:33559는 idle로 폐기. `wWindup` G:34078은 `cRecover`를 거치는 돌진 피니셔의 실제 별도 경로(진입 G:33965,34016)이며 일반 LMB 패턴으로 채택하지 않음 | 7종 고유 모션 구현 근거 아님 |

무기 타입마다 다른 타격 패턴을 실행하는 현재 분기는 확인하지 못했다. 이름·아이콘·아이템 필드를 보유한 것과 7종 고유 전투감을 구현한 것은 구분한다.

### 4.3 석궁 자동사격·수동 잔존 함수·투사체

| 구역 | 실제 상수·함수·상태 | 행 |
|---|---|---|
| 기본 상수 | `XBOW_RANGE=1000, INTERVAL=120, DMG=28, SPEED=13, PIERCE=false` | G:17446–17450 |
| `_autoBowSpec` | `b=bw(); brd=BOWTYPES[b.btype\|\|'crossbow']\|\|BOWTYPES.crossbow`; `range=max(220,(max(b.bowRange\|\|0,brd.range\|\|1000)+(b.bonusRange\|\|0)*12)*pBowRange())`; `spd=b.bowProjSpd\|\|brd.projSpd\|\|13` | G:17451–17457 |
| 자동 상태 | `_xbowTimer=0`, `_xbowTarget=null`, `_xbowEquipped=true` | G:17458–17460 |
| 실제 frame caller | 토글ON·P존재·hp>0·장착 bow이면 timer+=`_dtSp`; pet 또는 player 원점에서 alive 적 조회; `d<현재최단거리`만 교체(경계 동일거리 미선택) | G:35139–35150 |
| 발사 gate | 간격 `120/((bw.bowSpd\|\|1)*pXbowSpd())`; timer≥간격·target·**ST>mst*.2**이면 timer=0 후 발사. 프레임당 catch-up 여러 발 루프 없음 | G:35151–35165 |
| `_fireXbow` | pet 위치(터렛이면 무시) 또는 P 위치; 대상 atan2; `_autoBowSpec`; 피해 `~~((bowRef()*pBowMul()*pXbowMul()*type.atkMul+28)*(_gxFiring\|\|1))*3` | G:28703–28711 |
| 발사 레코드 | origin+방향×10; vx/vy=방향×spd; dmg/el/maxDist/dist0/r3/stagger0/kb0/pierce0/pierceMax0/**normalBow=true/ghostXbow=true** | G:28712 |
| 추가 발사 | `_lBowCrit>0 && random*100<statCrit()`면 ±.12 rad에 한 발 추가. RNG 순서·pool owner 필요 | G:28713–28717 |
| 발사 부수효과 | pet._ang, 공간 음향·pitch RNG, poolPart2회 | G:28718–28723 |
| dispatch | `_autoFireBowSkill`: normal·ghostXbowTurret slot fallback, 선택 skill/cd/fusion gate; 방향·상태 임시 변경 후 복구; 자동 ltnChaser/설치는 금지 | G:28725–28765 |
| 실제 자동 비용 | normal 포함 `(1.5+(fanShotLv\|\|0)*1.5)*_stDisc('bow')`를 발사 전 ST에서 차감, 0 clamp. cd 대기 return과 turret fallback 순서 보존 | G:28729–28734,28748–28764 |
| 수동 `fireBow` | G:28676–28701. `game.html` 식별자 출현은 정의1회, 현재 입력 caller 미발견. 악의오브1, `(~~(bowRef*pBowMul*10)+bowBon)*3`, 회수 `~~(45/(pBowSpd*(1+bowAtkSpd)))` | 현재 자동 경로와 다른 잔존 함수 |
| pool | `_mkPProj/_resetPProj/_recyclePProj/_getPProj` | G:17309–17362 |
| pool 관통 | reset은 `_pierceRate=50+eqAffix('pierceFlat')` G:17348. 새 객체 fallback의 `_mkPProj`에는 해당 기본값이 없어 pool 고갈 분기 동등성은 런타임 **미확인** | 선언 PIERCE=false만으로 실제 무관통 단정 금지 |
| 이동·유도 | normalBow는 일반 homing에서 제외 G:35185–35186; `x+=vx*sp,y+=vy*sp,dist+=speed*sp` G:35207 | clock은 기존 source frame 소유 |
| 벽·적 충돌 | 비폭발 일반탄은 절반 maxDist 이전·반사2회 미만 gate G:35236–35246; bolt 상성 G:35398 → hurtE G:35407 | map/world 충돌 의존 |
| 관통·회수 | 통일 관통 G:35560–35573이 legacy p.pierce보다 먼저; normalBow kill pierce G:35617; 전체 update/회수 G:35174–35629 | 격리 spec 테스트로 완료 판정 불가 |

`arcane`도 현재 `_fireXbow`에서는 `magic=false`인 normalBow 볼트다. 타입 이름만으로 arcMissile/magic 분기를 추가하지 않는다. 타입 atkMul은 생성 G:15979와 발사 G:28710 양쪽에 있으므로 순서를 그대로 검증한다.

### 4.4 선택 활 스킬과 터렛 의존

| 스킬·상태 | 원본 생성·수식·clock |
|---|---|
| fanShot | G:44942–44963. ST=`2+(lv\|\|1)`, 3발, range=`400+(lv-1)*68`, spd20, 각도−.15/0/+.15; dmg=`~~(bowRef*statDex*pBowMul*lv/3*2)+~~(STcost*1.5)`; physical·bleed·poison·normalBow·needle |
| bladeShot | G:45294–45309. ST=`1+~~(lv/2)`; orb=`~~(bowRef*statDex*pBowMul*_skMul('blueShell'))+bonus`; shard는 `~~(기초합*.25)+~~(bonus*.3)`; range=`~~(400*(1+(lv-1)*.11))`, r=`~~(10*(1+(lv-1)*.11))`, spd10, cd30 |
| blastShot | G:45312–45327. ST=`1+~~(lv/2)`, `_malCost(5)`, cd30; count=`lv>=10?5:min(3,1+~~((lv-1)/4.5))`; spread.2, spd18, maxDist500, `G._bsBombs` |
| blast 진행 | G:36158–36191. `G._gsBombs` G:36105–36156은 별도 종류다. 폭발 반경·집탄·hit 순서도 이 owner의 원문을 재확인한 뒤 옮김 |
| needleShot | G:45329–45341. ST8, cd90, dmg=`~~(bowRef*statDex*pBowMul*_skMul('needleShot'))`; count=`2+~~((lv-1)/5)`, interval2, range600, spd30. 실제 발사 clock G:36088–36099; cooldown G:36102–36104,36196–36197 |
| ltnChaser | G:45216–45251. 수동만 허용. ST40, dmg=`~~(bowRef*statDex*pBowMul*_skMul*_fuseMul)`; spd18, count=min(12,2+lv*2), chainMax=min(8,3+~~(lv/2)); pierce=`500+(lv-1)*20+~~((bowPierce\|\|0)*30+(pPierce\|\|0)*3)+pierceFlat`; lightning/magic/mhBlade 의존. `_lcOx/_lcOy/_lcMaxR=1000` 메타는 설정45242·복사35331 외 소비 미발견. 실제 cutoff G:35210은 **현재 P좌표 기준** 제곱거리>1,000,000 |
| ghostXbowTurret | G:45523–45543. ST100, 설치P.x/P.y−40, activeBowSk 유지, siegeGhost면 voidScarecrow 동반. 입력G:13083–13084의 cd1200은 입력 owner |
| turret frame | G:35139–35165. P좌표/상태 임시 사용→`_gxFiring=1`→발사→새 탄`_fromTurret=true`→복구. `GXBOW_DMG_MUL=1.5/SPD_MUL=1.5` G:17464–17465는 game 내 선언만 있고 현 caller의 실효1과 다름 |

ltnChaser의 별도 실행 경로도 분리한다. mhBlade 유도 G:35185–35204는 첫 탐지1000/관통 뒤500·turn1.5×dtSp·hitSet 재탐색을 쓴다. G:35286–35294의 ltn 명중은 일반 bolt G:35398 이전에 **raw p.dmg를 hurtE로 직접** 넘긴다. G:35295–35313의 즉발 chain은 strict nearest·기존 hitSet 제외·매연쇄 `~~(dmg*.8)`이며 추가 투사체를 만들지 않는다. G:35316–35341 split은 budget 절반·±.3rad 두 자식·grace15·hitSet 복사·원탄 소멸이다. `count<100`은 생성 전 gate이므로 절대상한100으로 보장하지 않는다. fallback guaranteed=`floor(budget*91/100)`도 일반 통일관통의91/1000과 구분한다.

스킬 전체는 합체·숙련·음향·투사체 owner에 의존하므로 W01에 포함하지 않는다.

| 선택·성장 데이터 | 원본 행·실제 계약 |
|---|---|
| `SKILL_LIST` | G:44161 시작; bow 분류 항목44171,44173,44176–44178,44187,44190,44193,44216,44221. **cat=bow는 자동석궁 선택 목록과 다름**. elemMissile/fireBeam/blueShot 등 magic 슬롯 실행도 포함 |
| `SKILL_SLOT_DEFS.bow` | G:44292–44300의 실제 skills는 `normal,bladeShot,blastShot,fanShot,needleShot` 5개. ltnChaser/turret는 info만 있으며 이 선택 배열에는 없음. 이것은 **활 아이템5종**이라는 뜻이 아님 |
| 실제 popup | qsT 클릭 G:28620→`openSkSlotPop` G:46969–46988,47032–47067. def.skills 중 습득·합체 비흡수 항목 표시→선택→activeBowSk→HUD→dbSaveForce |
| reset·학습 선택 | `_syncActiveSkAfterReset` G:44644–44661; `_skLearnUp` G:47767–47787. reset 유효성 검사와 학습 시 normal/빈 선택 자동 장착을 구분 |
| `_SK_MUL/_skMul/_fuseMul` | G:44507–44557. blueShell {b8,g6.4}, ltnChaser/needleShot/blastShot {b4,g3.2}; `b+(lv-1)*g*.5`, 미정의 key는1. fuse는 star와 skillBoost를 읽음 |
| bladeShot의 다른 key | G:45299–45300의 피해는 `_skMul('blueShell')`이므로 **P.skills.blueShell**을 읽음. 범위/r/cost의 bladeShot 레벨과 분리해 단정. 임의 key 이름 정정 금지 |
| 레벨 gate | `_skillBatchUp` G:47192–47194 / `_skCtx` G:47745–47762. max20, 캐릭터 레벨락 `min(20,~~(P.lv/50)+1)`. 습득 reqLv/requires/SP/악의 gate와 강화 gate는 별도 |
| 고정 T 토글 | G:13220–13223. KeyT·G.on·비일시정지·비repeat일 때 토글→timer0/targetnull→OPT/saveSettings→checkbox. 설정 UI G:49072, 복구 G:49416 |
| 실제 T HUD | G:28398–28404, `updateTSlot` G:44924–44929. qsT에 activeBowSk·ON/OFF·turret 표시. 이름이 `updateBowSlot`인 G:44888–44892는 **Space 슬롯**으로 다른 함수 |

bladeShot/blastShot은 선택·실행 함수가 남아 있지만 현재 SKILL_LIST의 습득 항목과 일치하지 않는 경로가 있다. 함수 존재만으로 자연 학습→선택→발사 전 과정 도달을 확정하지 않는다. cat=bow인 독사·악의사냥·폭독칼날 등 전문 스킬/합체 전체는 공통 bowRef·투사체·DoT를 소비하는 의존으로 표시하며, 이 문서의 W06 자동석궁 단위에 묶어 임의 구현하지 않는다. 그 전문 스킬 전체의 Godot 인수 상태는 **미확인**이다.

### 4.5 UI·로비·저장 표시

| UI / 행 | 원본 입력·표시·접점 |
|---|---|
| `_invCardFields` G:49730–49863 | reqLv, 타입 이름, ATK/강화, spd/wStCost/wRange/wArcW/wStagger/bowSpd/bowRange/bowPierce 등. 필드 존재·truthy에 따른 표시 조건도 계약 |
| card DPS G:49732–49742,49759 | rawDmg=atk*타입atkMul, windup=33/(타입spdMul*statDex), APS=60/windup. preview는 `~~(atk*(1+enhMulAtk(enh)))`로 선변환해 **실제 ref의 강화 가산과 다름** |
| card 발사속도 G:49767 | `60/(33/(item.bowSpd*statDex*pBowSpd))`. 실제 자동간격120/`bowSpd*pXbowSpd`와 별도 표시식 |
| `_invBuildCompare` G:49874–49902 | 키목록 G:49876, ST소모/무게/물약쿨감은 낮을수록 good; 비교 DPS G:49881–49891은 타입 기반이고 card의 강화 선변환과도 다름 |
| 가상 장착 비교 | G:49903 이후 실제 INV/캐시를 일시 교체하는 combat-power 비교. 무기 모듈에서 새 equipped writer로 복제하지 않음 |
| 제작 선택·미리보기 | G:51168(원소0..5·90%영웅/10%전설),51171–51172(타입 선택/mkItem),51193–51198(타입·스탯 preview) |
| 능력치 패널 | G:51301–51354 melee/bow ref·현재 무기 원소/장비 표시. 전투 결과·간이 DPS와 수식을 구분 |
| HUD·시각 | eq0 무기/방패/부츠 label G:60342–60346; 공격 animation G:58624–58648; 무기 sprite G:58949–59066; 원소 탄 sprite G:14340–14341 |
| 로비 구조 | I:3199–3237 `CHAR_VISUALS`: 무기 설명·trait는 캐릭터 소개. I:3208,3217,3224,3231 comingSoon. 무기7/석궁3 장착 선택 UI가 아님 |
| 로비 생성·표시 | I:3427–3468 생성은 charIdx 메타 저장(3436/3450/3461); online slot I:3126–3189, 카드3145–3147; local slot I:3555 이후, 카드3586–3588 |
| 로비 데이터·진입 | I:3488–3519 demo slot 전체 데이터 교환; `_afterCharacterCreated` I:3402–3424 story gate; game URL I:4348–4349. index에 WTYPES/BOWTYPES·무기 전용 저장 구조는 없음 |

## 5. 속성 7개·상성·상태의 실행 순서

| ID | 기호 | 원본 이름 | 색 | 행 |
|---:|---|---|---|---|
| 0 | P | 물리 | #bbbbbb | G:14333,14338,14342–14343 |
| 1 | F | 화염 | #ff5522 | 동일 |
| 2 | I | 빙결 | #3388ff | 동일 |
| 3 | D | 암흑 | #9933cc | 동일 |
| 4 | L | 암전 | #ffee00 | 동일. 번개 관련 경로가 사용하는 enum |
| 5 | H | 신성 | #ff88cc | 동일 |
| 6 | E | 대지 | #88aa44 | 동일 |

`elMul` G:14344의 **전체49칸**이다. 행은 공격, 열은 방어다. 물리 대 물리는1, 같은 비물리는.5이며 F↔I/D↔L/D↔H/E↔L은2다. 이 표는 이미 Godot에 있는 수학을 다시 만들라는 지시가 아니다.

| 공격＼방어 | P0 | F1 | I2 | D3 | L4 | H5 | E6 |
|---|---:|---:|---:|---:|---:|---:|---:|
| P0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| F1 | 1 | .5 | 2 | 1 | 1 | 1 | 1 |
| I2 | 1 | 2 | .5 | 1 | 1 | 1 | 1 |
| D3 | 1 | 1 | 1 | .5 | 2 | 2 | 1 |
| L4 | 1 | 1 | 1 | 2 | .5 | 1 | 2 |
| H5 | 1 | 1 | 1 | 2 | 1 | .5 | 1 |
| E6 | 1 | 1 | 1 | 1 | 2 | 1 | .5 |

EL enum 범위와 이름·그래픽·생성 분모는 서로 다르다. `_BULLET_IMGS` G:14340–14341은 phys/fire/ice/dark/ltn/holy 6종, `EL_TO_PAL` G:23023과 `ELP` G:55462도0..5다. 대지 전용 자산/전체 상태효과 완료는 **미확인**이며 7개 enum 존재만으로 주장하지 않는다.

| 단계 | 실제 처리와 함정 | 행 |
|---|---|---|
| 적 저항 설치 | `ETYPE_ERES`120×7의 전부0 기본값 → 적 생성 eRes. 상성과 독립된 저항 축 | G:14334–14336,31185 |
| 상성 호출 | melee hitArc와 projectile 충돌에서 `~~(dmg*elMul)` 후 hurtE. hurtE가 상성을 한 번 더 곱하지 않음 | G:37614–37617,35398–35407 |
| 출혈·독 옵션 | 300f/최대10스택. 증가 후 `<10`일 때만 pool에 pDotPool×입력dmg×.10 추가 | G:42161–42164 |
| 저항·감전 | 저항 `~~(dmg*(1-eRes[atkEl]))` G:42172–42173 → 기존 shock스택×5% 가산 → 번개 새 스택(최대10/300f), 일반 적 조건부3스택18f기절 | G:42196–42203 |
| 저주·변환 | cursed 피해×1.25; 물리 elemConvert 확률→무기 원소 교체는 **저항 처리 뒤** | G:42204–42205,42210–42218 |
| 최소치·피해분류 | G:42262–42263 최소1 보정. eRes1을 최종0으로 단정 금지. 정확한 arrow 조건은 `!_isPure&&opts&&opts.maxDist!==undefined&&!opts.magic`. 이 화살은 gunpowder이며 원소가 있어도 magic 분류가 아님 | G:42269–42283 |
| crit·증폭·흡수 | crit G:42308; 비DoT stunned/frozen 각각×1.5 G:42335–42338; ES흡수 G:42343–42352; HP 적용 G:42383 이후 | 순서 보존 |
| onHit 어픽스 | fire/ice/light/dark/poison/bleed/stun/freeze | G:42369–42379 |
| DoT 어픽스 | poison/fire는 underscore pool, ice는 `_iceDot*` 별도 | G:42422–42443 |
| 냉기 gauge | HP overflow dmg>0일 때만. 일반 max100/보스500, 증가 일반dmg/보스dmg*.3, debuff×1.5, shard×(1+res). frozen=180은 양쪽 동일, gauge0 | G:42444–42458 |
| 빙결 해제 | frozen을 sp로 감소, 해제 면역 보스300/일반120, gauge0 | G:38643–38657 |
| DoT clock | `_bleedPool/_poisonPool/_burnPool`을60f 경계마다 남은 초수로 나누어 소모 | G:38720–38748 |
| 전류강화 | iceStorm만, 거리1000, .0875×2/20f, 흡인15×거리감쇠/3회, 범위cap1500·대상40·근접틱.075 | G:32601–32624,32631–32675 |

원본 자체의 이름 차이도 보존 대상이다. `fireOnHit→burnPool`, `poisonOnHit→poisonPool`, `onHitBleed→bleedPool`인데 실제 틱은 underscore pool을 읽는다. `_shockMul`도 실제 스택 피해식과 다르다. 원인 수정 여부는 별도 원본 판정이 필요하며 이 추적에서 통합·수정하지 않는다. 빙결의 “보스1.5초” 주석과 실제180f 대입도 구분한다.

## 6. Godot 실제 파일·테스트 대조

아래는 파일/실제 caller를 읽어 확인한 범위다. 이번 조사에서 해당 테스트를 실행하지 않았으므로 표에 PASS 성적을 붙이지 않는다. `godot/` 내 스크립트를 이름만 검색해 이식 완료로 계산하지 않는다.

| 영역 | 이미 있는 실제 파일·행·연결 | 미이식/부분 범위 |
|---|---|---|
| 무기/활 카탈로그 | `port_modules/item_armor_element/source_item_catalog.gd:6–18`, weapon_definition:51–52/bow_definition:54–55 deep copy | 정의 API의 실제 caller는 선언 외 미발견. 테이블·이름 재전사 불필요 |
| 이름 | 같은 catalog:20–25,71–109에 WP_MOD0..4·weapon_name·물리 fallback | EL7 수학과 이름 풀0..4는 별도 |
| 생성 테이블·드랍 | `data/item_generation_tables.json:1`; `port_modules/kill_reward/drop_item_source.gd:203–235`에 무기/활 필드 생성 | :470 드랍 원소 roll0..5. 실제 활 발사 완료 아님 |
| 시작 장비 | `port_modules/starter_item_factory_source/producer.gd:629–652` 기존 Catalog 참조 | :571–578은 원소0..4·crossbow만 지원하는 명시 계약. 범용 생성기로 확장 금지 |
| 현재 INV/PASSIVES | `scripts/native_source_new_run_state.gd:184–185`; `scripts/native_source_player_providers.gd:171–183` current_inventory/current_passives | 새 owner·복제 snapshot으로 장착 권위를 만들지 않음 |
| 어픽스 | `port_modules/equipment_affix_reader/producer.gd:64–100` live INV, :105 invalidate seam | W01이 affix 합산/장착 writer를 재구현하지 않음 |
| 실제 근접 | `scripts/player.gd:1053–1095` → `scripts/main.gd:1456–1510` current weapon/baseAtk/range/arc → 실제 hurtE. main:1850 이후 attack tempo는 실제 spd 소비 | 무기7 고유모션·모든 unique/legend 효과 완료는 아님 |
| ref | `port_modules/combat_reference_source/producer.gd:55–59`은 melee/magic; `player_base_attack_source/producer.gd:24–25`는 무기 자체 범위 밖 | bowRef·자동석궁 피해 구현 미발견 |
| EL·플레이어 방어 | `scripts/main.gd:59` enum0..6; `port_modules/item_armor_element/producer.gd:42–65` elMul(E↔L 포함); main:160→player:966–978 | 기존 상성 함수 재사용 |
| 일반 적 상성 | 실제 호출 `scripts/native_normal_enemy_hurte.gd:109–115`→`scripts/native_source_player_initialization_services.gd:1014–1036`→`port_modules/combat_stat_formula/producer.gd:572–586`→main:2755–2831 | 별도 normal_enemy_element_multiplier 모듈은 없음. 새 수식 owner 발명 금지 |
| crit | `scripts/native_normal_enemy_hurte.gd:318–351`, statCrit/statCritDmg도 같은 파일:838–867 | bow 전용 critRateBow는 generic hurtE에서 미연결 |
| 냉기 | normal_enemy_hurte:465–474→`scripts/enemy.gd:358–377`; tick enemy:144–155 | 이미 있는 gauge·timer와 중복 상태 owner 금지 |
| 번개·DoT | normal_enemy_hurte:191–192(번개),455–459(DoT affix)는 활성 시 halt | 미이식 경계를 성공으로 처리하지 않음 |
| player projectile | `scripts/native_player_projectile_store.gd:27–29` normalBow/ghostXbow 기본 false 필드는 존재 | Godot에서 이를 true로 실제 발사하는 caller 미발견. 필드 존재≠활 발사 |
| 실제 world consumer | `scripts/native_fireball_world_consumer.gd:101–106`; `scripts/world.gd:3010–3012,3370–3376`에서 호출 | fireball 이외 packet은 보존하고 건너뜀. 범용 활 consumer가 이미 있다고 볼 수 없음 |
| 화살 피해 입구 | normal_enemy_hurte:72–74 허용opts에 normalBow/maxDist 없음, :299–302 meleeDmgPct, :318–319 melee/spell crit | arrow 분류·`rangedDmgPct+projDmgPct`·critRateBow를 먼저 명시 인수해야 실제 화살 검수 가능 |
| pet·입력 | `scripts/native_pets.gd:197–210` xbow 이동; `scripts/native_skill_slots.gd:149–150` Space는 giantSlam | 자동 석궁이라고 오인 금지 |
| 실제 관련 테스트 | `tests/test_p2001c_kill_rewards.gd:91–101`, `test_p1002e_melee_hurte.gd:243–263`, `test_p2001e_natural_lmb.gd:118–201`, iceOrb 계열 | 테스트 소스 확인만. Mac 재실행·화면 품질·전체 속성 동등성 미확인 |

표의 경로는 `godot/` 기준이다. `port_modules/auto_bow_spec/producer.gd`와 `tests/test_native_auto_bow_spec.gd`는 현재 main에 없다. 기존 catalog나 elMul만 다시 이식하는 것을 첫 진척으로 삼지 않는다.

## 7. 설계 폴더와 원본의 일치·불일치

약칭 D22=`docs/2_2 무기+활+속성시스템/2_2 무기+활+속성시스템.md`, D14=`docs/14밸런스+수치테이블/14밸런스+수치테이블.md`, F=`docs/14밸런스+수치테이블/스킬데미지공식표.md`. **원문은 이번 작업에서 수정하지 않는다.**

| 항목 | 설계 문서 행·값 | 현재 원본 행·값 | 판정·후속 소유 |
|---|---|---|---|
| 분모 | D22:118–127/155–175 무기7·활3·EL7 | G:15863–15890,14333 | 일치. 옛 요약 활5·속성5로 문서를 잘못 분류하지 않음 |
| 무기7 수치 | D22:151 공통 수치 | G:15864–15870 동일 | 일치. 특징 설명을 타입별 실행 차이로 확대하지 않음 |
| 활 수치 | D22:158–160 range/atkMul/spdMul | G:15887–15889 동일, 공통stCost5/projSpd22 | 기재값 일치, 공통 필드 상세 누락 |
| 활 미구현 표현 | D22:155–162 활 전용 캐릭터 예정 | G:35139–35165 자동사격 실행, fireBow는 정의만 | 전용 캐릭터와 석궁 실행을 분리해서 읽어야 함 |
| 상성·저항 | D22:165–175,181–183,342 | G:14336/14344/31185 | 일치. eRes와 elMul 별도 |
| 감전 | D22:214–221 300f/10/5%/3스택18f | G:42196–42203 | 일치, 기존 스택 배율→새 스택 순서 보충 |
| 전류강화 | D22:240–282 | G:32601–32624,32631–32675 | 핵심 수치 일치 |
| 근접 회수·DEX | D22:7; D14:11,283 | G:33364,27994 | 회수16·DEX .0005 일치 |
| ATK 상계 | D14:228–239 `(200+tier*200+lv)`, 201~2000 표 | G:15922 `~~((200+tier*200+(lv\|\|1))*.25)` | **불일치** .25·정수화·fallback 누락. D14:107은 .25를 명시하여 문서 내부도 충돌 |
| rarity floor | D14:229 `[0,.05,.15,.25,.40]` | G:15923 unique .50까지6개 | **누락** |
| ATK skew roll | D14:230 random² | G:15924 최소1·정수화 | 중심 식 일치, 경계 누락 |
| 강화 ATK | D14:104–106 가산enh*.25 | G:28097–28099 동일 | 일치 |
| ref | D14:248–250 `atk*(1+강화배율)+flat+base` | G:28770–28772 강화 가산·대응 능력치/eqStat/lvB·봉인.3 | **불일치**. META와 함께 문서 정합 필요 |
| ref 교차 문서 | F:267–274 강화 가산·봉인.3 | G:28770–28772 | 구조 일치, D14의 곱셈 표와 충돌 |
| item ATK 계수 | F:271 *.5 | G:15922 *.25 | **불일치** |
| 능력치 배율 | F:284–286 STR/INT/DEX *.01 | G:27993–27995 STR/INT1, DEX .0005+장비 | **불일치** |
| baseAtk | F:272 `15+(stage-1)*2` | G:27926 G.on·stage fallback, 생성 G:29019는8 | **조건·시점 누락** |
| 강화 확률 식 | D14:96 `max(.5,99*.99^n)%` | G:28077–28078 동일 | 일치 |
| 강화 확률 예시 | D14:103 +831=.023% | 실제 최소.5% | **식과 모순**. TRACE-META |
| 강화 비용 | D14:94–102 | G:28080–28091 raw→등급→악의오브.5 올림 | 핵심 식 일치. 경제 이식 중복 금지 |
| implicit·bonusRange | D22/14 상세 대응 표 미발견 | G:15017–15018/15970/15984/16116–16123 | 상세 누락. 생성과 실제 소비를 구분해 §3에 보충 |
| 카드 DPS/발사속도 | 설계의 실제 전투식과 단일 값으로 보기 어려움 | G:49732–49742/49759/49767 vs G:28771/35151 | **원본 UI와 실행식 차이**. 원본 결함 판정/수정은 별도, UI 담당에 전달 |
| 터렛 +50%·빙결 보스 주석 | 원본 인접 설명도 의도와 실행이 다를 수 있음 | G:17464–17465 선언만,35156 실효1;42452–42454 frozen180 | 원본 자체 불일치. 조용히 의도값으로 고치지 않음 |
| 특수 활 주석·메타 | blast 주석은 lv5에2발, ltn 메타는 시전 원점반경 | G:45319 실제 lv5=1/lv6=2/lv10=5;45242·35331 메타와35210 현재 P기준 cutoff | 원본 자체 차이. 주석·필드명 대신 실행식을 테스트로 고정 |
| 선택·습득·설명 | SKILL_SLOT_DEFS의 bladeShot desc는ST50, SKILL_LIST에는 removed 주석도 존재 | G:44294 설명 vs G:45296 실제 `1+~~(lv/2)`; G:44185 제거 주석 vs44292 선택/45294 함수 잔존 | 원본 UI·습득·실행의 불일치. 자연 도달은 별도 확인 |
| bladeShot 피해 레벨 key | 스킬 이름만으로 같은 레벨 성장이라 보기 어려움 | G:45299–45300은blueShell, G:44556은`P.skills[skId]` | 원본 다른 key 보존. 임의 bladeShot 치환 금지 |

## 8. W01 구현 지시서 — `_autoBowSpec`만 독립 이식

### 8.1 소유 파일·API·입력 계약

| 항목 | 구현 지시 |
|---|---|
| 새 제품 파일 | `godot/port_modules/auto_bow_spec/producer.gd` |
| 새 테스트 파일 | `godot/tests/test_native_auto_bow_spec.gd` |
| 수정 제품 공용 파일 | **0개·0줄**. main/player/world/native_regions/store/catalog/reader 수정 없음 |
| 원본 | G:17446–17457 중 RANGE1000/SPEED13와 `_autoBowSpec`; pBowRange G:28044; catalog G:15886–15890은 기존 모듈 참조 |
| 제안 API | `evaluate(bow: Dictionary, passives: Dictionary, catalog: RefCounted) -> Dictionary` |
| bow 의미 | caller가 이미 `bw()`의 **effective 현재 장비 Dictionary**를 확보한 입력. 실제 빈 장비 `{}`와 INV 권위 미준비를 같은 것으로 처리하면 안 됨. 권위 획득은 W01 밖 |
| passives 의미 | `pBow`의 값과 `.has("pBow")`를 함께 전달/조회. 누락(undefined)·명시null 구분 |
| catalog | 기존 `item_armor_element/source_item_catalog.gd` 인스턴스의 `bow_definition`. 타입 테이블 사본·EL 사본을 새로 두지 않음 |
| 의존 미준비 | null/메서드 없는 catalog·계약 밖 정의 반환은 `NOT_READY` 진단. 빈 장비나 unknown 타입 fallback과 구분하고 카탈로그 상수 사본으로 대신하지 않음 |
| coercion 재사용 | `equipment_affix_reader/producer.gd`의 공개 static `js_truthy:312–323`, `js_property_key:326–347`, 인스턴스 `js_to_number:350–374`(생성자 regex:53–57, 문자열:392–411) |
| receipt | status, source(SHA·함수/행), raw range/spd, 선택 catalog_key/fallback 여부, 입력 presence 기록. receipt는 게임 발사·장착·물리 준비 완료 표시가 아님 |
| 사용자 폴더 | 새 테스트 `USERDIR="EXODUSER-W01-AutoBowSpec-Isolated-20261020"` |
| 금지 | Main 부팅, current INV writer/cache, RNG/clock/자원 차감, 투사체 생성, 입력·Q/E·저장 연결, 기존 catalog/reader에 기능 추가 |

### 8.2 순서·JavaScript 경계

1. 입력 Dictionary의 raw 값·presence를 유지한다. `btype||'crossbow'`는 JS truthiness로 선택한다. `{}`·`[]`는 truthy이므로 Godot의 단순 bool/빈 배열 검사를 사용하지 않는다.
2. 지원 scalar btype의 키 변환 후 catalog를 읽는다. 일반 unknown은 crossbow로 fallback한다. 선택 결과의 `range/projSpd`를 raw bow 필드에 덮어쓰지 않는다.
3. `b.bowRange||0`, `brd.range||1000`을 각각 선택한 **뒤** 숫자화하여 Math.max한다. `(b.bonusRange||0)*12`를 더한다. pBow는 presence를 보존해 숫자화한 뒤 `1+pBow*.08`을 계산한다. 끝에만 `Math.max(220,range)`한다. 중간 truncation/반올림/clamp 금지.
4. JS Math.max의 NaN 전파를 명시 처리한다. `maxf()`가 NaN을220 같은 값으로 감추는 동작에 의존하지 않는다. ±Infinity도 원결과로 보존한다.
5. spd는 `bowProjSpd||brd.projSpd||13`가 선택한 **원 Variant**다. `"0"`·객체·배열을 무조건 float로 바꾸거나 유효속도22로 고치지 않는다. 음수도 source 결과 그대로다.
6. 유한 숫자 결과는 `READY`, 비유한 숫자는 `SOURCE_NON_FINITE`, 비숫자 raw spd는 `SOURCE_RAW_SPEED`처럼 진단을 구분한다(명칭은 구현 시 고정). raw 결과를 보존하고 다음 물리 consumer가 준비됐다고 주장하지 않는다. 이 metadata는 원본 수식을 바꾸는 fallback이 아니다.
7. JS 일반 Object prototype 키는 별도다. `__proto__`, `constructor`, `__defineGetter__`, `__defineSetter__`, `hasOwnProperty`, `__lookupGetter__`, `__lookupSetter__`, `isPrototypeOf`, `propertyIsEnumerable`, `toString`, `valueOf`, `toLocaleString`은 상속 조회가 일어날 수 있다. W01은 **명시 `SOURCE_UNSUPPORTED`**로 보고하며 ordinary unknown fallback 성공을 반환하지 않는다. btype Array/Dictionary·기존 helper 미지원 숫자 키도 같은 지원 밖이다. 지원 밖 receipt에 가짜800/22를 담지 않는다.
8. bowRange/bonusRange/pBow의 Array 숫자화는 기존 `js_to_number` 범위에서 처리한다. btype의 Array 키 변환과 혼동하지 않는다. helper 변경 없이 가능한 범위를 쓰고 미지원 carrier는 명시한다. 사용자 함수/getter/prototype를 가진 JS 객체의 완전 동등성은 **미확인·지원 밖**이다.

### 8.3 원본 oracle와 필수 단정

저장소 밖 `source_probe.mjs`가 고정 game.html에서 EL/카탈로그/elMul/autoBowSpec/pBowRange의 **원문 행을 추출**해 VM에서 평가했다. 로그 `source-probe.json`은 무기7·활3·원소7·상성49칸·아래24개 결과를 포함한다. 이는 새 Godot 테스트 결과가 아니며, 구현은 별도 격리 테스트로 입증해야 한다. 기본 PASSIVES는 `{pBow:0}`다.

| # | bow·passives 변경 | 원본 range | 원본 raw spd | W01 필수 단정 |
|---:|---|---:|---|---|
| 1 | `{}` | 800 | 22 | READY, crossbow; **1000/13 아님** |
| 2 | btype=repeater | 700 | 22 | READY, repeater |
| 3 | btype=arcane | 840 | 22 | READY, arcane |
| 4 | btype=unknown | 800 | 22 | fallback=true |
| 5 | btype=null | 800 | 22 | truthy 선택 fallback와 presence 구분 |
| 6 | bowRange=100 | 800 | 22 | catalog 하한 |
| 7 | bowRange=1200 | 1200 | 22 | raw 우선 큰 값 |
| 8 | bonusRange=2 | 824 | 22 | +24 |
| 9 | pBow=10 | 1440 | 22 | ×1.8 |
| 10 | pBow=−10 | 220 | 22 | 마지막 최소220 |
| 11 | bowRange1000/bonus3/pBow5 | 1450.4 | 22 | 곱셈 위치, 오차≤1e−9 |
| 12 | bowProjSpd=0 | 800 | 22 | 0은 falsy |
| 13 | bowProjSpd=−5 | 800 | −5 | 임의 양수 clamp 금지 |
| 14 | bowProjSpd=`"0"` | 800 | 문자열 `"0"` | raw 타입 보존 |
| 15 | pBow 키 부재 | NaN | 22 | is_nan,220/800 위장 금지 |
| 16 | pBow=null | 800 | 22 | undefined와 구분 |
| 17 | bowRange=`"abc"` | NaN | 22 | NaN 전파 |
| 18 | bowRange=[] | 800 | 22 | [] truthy→숫자0 |
| 19 | bonusRange={} | NaN | 22 | 객체 truthy→숫자NaN |
| 20 | bowRange=+Infinity | +Infinity | 22 | 비유한 결과 보존 |
| 21 | btype=`__proto__` | 1000 | 13 | source 사실 기록; W01은 UNSUPPORTED |
| 22 | btype=`constructor` | 1000 | 13 | ordinary unknown과 구분·UNSUPPORTED |
| 23 | btype=[`"repeater"`] | 700 | 22 | source Array 키변환; W01은 UNSUPPORTED |
| 24 | bowProjSpd={} | 800 | 객체 `{}` | raw 객체 타입·값 보존 |

추가로 입력 bow/passives/catalog 원본을 deep snapshot해 호출 전후 동일함, 같은 입력 반복 결과 동일함, catalog 반환값을 바꾸어도 원 catalog 불변임을 검사한다. pBow 음수/상한초과를 0..5/10으로 제한하지 않는다. 테스트가 source-probe의 Godot 구현을 그대로 복제한 식으로 기대값을 생성해서는 안 된다. 표의 고정 기대값·NaN/타입 단정을 사용한다. 테스트 RESULT는 assertions/failures와 exit code를 남기고 실제 수를 보고한다(미실행 시 예상 PASS 수를 발명하지 않음).

### 8.4 다음 구현 작업의 검수·격리

새 브랜치/최신 main을 확인한 뒤 W01 두 파일과 관련 승인 문서만 다룬다. 새 test는 headless `SceneTree` 독립 모듈 테스트로 작성하여 Main을 띄우지 않는다. Godot import 전 `~/Library/Application Support/Godot/`를 작업ID별 `~/exoduser-wt/_backup/godot-appsupport-20261020-<작업ID>/`로 백업한다. 실행 binary는 `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot` 원본만 사용한다.

headless test는 `USERDIR` 상수를 실제 project 설정의 격리 이름과 일치시키고 stdout/stderr/exit/시간을 `~/exoduser-wt/_out/<구현작업ID>/`에 보존한다. Main을 부팅하는 후속 단위라면 `godot/override.cfg`의 custom user dir을 해당 이름으로 한정하고 종료 후 비운다(커밋 금지). 실제 저장 폴더·열린 게임·다른 작업자의 userdir/로그를 만지지 않는다. W01 완료는 **자동 탐지 spec 독립 검증**이며 자동사격/화면/전체 활 인수 완료가 아니다.

## 9. 후속 작은 이식 단위와 새 테스트 계획

아래 제품·테스트 경로는 모두 **제안 경로**다. 실행 때 최신 main에서 경로 소유·이미 병합된 구현을 다시 확인한다. 원본 수식을 임의 재설계하지 않으며, 공유 파일 접점이 있는 단계는 그 담당자와 실제 수정 구역을 확정한 후 착수한다. 테스트 prefix의 W번호는 단위 경계이며 새 전역 기능 이름이 아니다.

| 순서 | 만들/수정할 파일(제안) | 원본·옮길 상수/공식 | 새 테스트·핵심 단정 | 격리 USERDIR | 선행·충돌 |
|---|---|---|---|---|---|
| W01 | 새 `port_modules/auto_bow_spec/producer.gd`; 공용0 | §8 전부 | `test_native_auto_bow_spec.gd`;24 oracle·presence·불변성 | `EXODUSER-W01-AutoBowSpec-Isolated-20261020` | 기존 Catalog/JS helper만. 즉시 구현 가능 |
| W02 | 새 `port_modules/bow_reference_source/producer.gd`; 기존 combat_reference는 수정하지 않음 | G:28766–28771,28097–28099. bow atk+enh*.25+flat3종+base+DEX+eqDEX+`~~(P.lv*.5)`, 봉인.3 | `test_native_bow_reference_source.gd`; enh10이면+2.5, lv3 보너스1, 해당 item flat만, seal 전합 후*.3, current item 교체, JS NaN/~~ 경계 | `EXODUSER-W02-BowReference-Isolated-20261020` | live providers/effective stat 기존 API. 신규 STR/DEX owner 금지. 실제 caller 연결은 W05 |
| W03 | 새 `port_modules/normal_xbow_emission_source/producer.gd` | G:28703–28723,17448–17450. 28·×3·trunc 위치, origin+10·r3·flags·추가탄±.12. catalog atkMul **재적용** | `test_native_normal_xbow_emission.gd`; 기본/전설추가탄 packet, pet/turret origin우선, 두 단계 배율, RNG draw 순서, 자원/INV 쓰기0 | `EXODUSER-W03-XbowEmission-Isolated-20261020` | W01/02, 기존 배율/legend/crit reader를 입력. RNG는 caller 공급 trace; 별도 RNG owner 금지 |
| W04 | 새 `port_modules/auto_bow_frame_source/producer.gd` | G:35139–35165 중 normal 경로·G:28729–28734. dtSp timer, strict nearest `<`, interval120/speed, strictST20%, timer reset0, ST cost1.5+fanLv1.5 | `test_native_auto_bow_frame_source.gd`; 정확 경계와 동거리 순서, off/dead/no bow, catchup1회, 부족ST, timer/차감 순서 | `EXODUSER-W04-AutoBowFrame-Isolated-20261020` | W01–03. query 후보 순서·현재 pXbowSpd/_stDisc 입력 필요. selected skill은 W06 이후, 미지원은 halt |
| W05a | 새 `scripts/native_normal_bow_owner.gd`; 공용 main/player_projectile_store의 birth 연결부만 후보 | G:17309–17362,28712,35139–35165. 기존 pool 취득·normalBow/ghostXbow packet·자동 normal 발사 요청 | `test_native_main_normal_bow_birth.gd`; 실제 Main/current INV 교체→단1회 발사, pool 고갈/재사용 trace, snapshot stale 금지·저장0 | `EXODUSER-W05a-BowBirth-Isolated-20261020` | W01–04, 실제 source phase·pet 원점 연결. main/clock 담당 소유 합의. 충돌·피해 완료는 W05b/c 전까지 미인수 |
| W05b | 새 `port_modules/bow_damage_type_source/producer.gd`; `scripts/native_normal_enemy_hurte.gd` 허용opts·분류·배율·crit 연결부 | G:42269–42334. nonpure·maxDist&&!magic→arrow/gunpowder·`rangedDmgPct+projDmgPct`·critRateBow, 상성 적용 위치는 G:35398–35407 | `test_native_normal_bow_hurte.gd`; 화살/마법/근접/pure 구분, 타입별 배율·bow crit, 기존 ES/HP순서, 상성 정확1회 | `EXODUSER-W05b-BowHurtE-Isolated-20261020` | 현재 hurtE는 arrow opts 미지원. 해당 공유 파일·Formula/Services 담당 소유 합의와 실제 arrow reader 확보가 필수. generic melee PASS 대체 금지 |
| W05c | 새 `scripts/native_normal_bow_world_consumer.gd`; world의 source projectile phase·W05a owner 연결부 | G:35174–35629. 비유도·벽반사·통일 관통·kill pierce·재활용 순서 | `test_native_main_normal_bow.gd`; 실제 Main 발사→이동→벽/적 충돌→hurtE→회수, query 순서·hitSet·상성1회·no duplicate tick | `EXODUSER-W05c-MainNormalBow-Isolated-20261020` | W05a/b, source clock/query/map/펫 실제 seam 확인. 기존 fireball consumer는 nonfireball skip이므로 새 좁은 owner 필요. main/world 담당과 충돌·missing seam면 HOLD |
| W06a | 새 `port_modules/fan_shot_source/producer.gd`+W05 dispatch 연결부 | G:44942–44963,28725–28765. §4.4 fan 공식·3발·ST·임시상태 복구 | `test_native_fan_shot_source.gd`; 3각·dmg 정수화2곳·ST부족·자동 outerST 차감이 innerST를 대체하는 순서 | `EXODUSER-W06a-FanShot-Isolated-20261020` | W02/03/05, fusion gate는 기존 owner. skill/affix/회복 합류 충돌 |
| W06b | 새 `port_modules/blade_shot_source/producer.gd`+기존 projectile owner의 bladeOrb 구역 | G:45294–45309 및 pProjs 해당 branch. §4.4 orb/shard·lv .11·cd30·blueShell multiplier key | `test_native_blade_shot_source.gd`; bladeShot/blueShell 레벨 분리·orb/shard 별도trunc·cd gate·자동복구·실제 orb tick과 hit set | `EXODUSER-W06b-BladeShot-Isolated-20261020` | W05/skill multiplier/projectile branch 추적. shared pProjs 소유 합의 전 HOLD |
| W06c | 새 `port_modules/blast_shot_source/producer.gd`+새 `scripts/native_blast_shot_owner.gd` | G:45312–45327,36158–36191. _malCost5·ST·cd30·spread.2·spd18·range500·폭발원문 | `test_native_blast_shot_source.gd`; lv1/5/6/10 발수=1/1/2/5, 악의오브gate=차감원가, bsBombs≠gsBombs, fly→explode 순서 | `EXODUSER-W06c-BlastShot-Isolated-20261020` | W05/META의 비용reader/폭발hurtE·world. 폭발 세부 receipt의 필드별 재추적이 선행 조건 |
| W06d | 새 `port_modules/needle_shot_source/producer.gd`+기존 source frame burst seam | G:45329–45341,36088–36099,36102–36104/36196–36197. ST8·cd90·count2+~~((lv−1)/5)·interval2·range600·spd30 | `test_native_needle_shot_source.gd`; lv1/5/6/10/11 횟수, frame당순서·방향snapshot·cooldown exact | `EXODUSER-W06d-NeedleShot-Isolated-20261020` | W05/source clock. frame driver 변경은 공용 충돌 확인 |
| W06e | 새 `port_modules/ltn_chaser_source/producer.gd`+기존 lightning/homing projectile seam | G:45216–45251·§4.4, pProjs의 chain/mhBlade 분기. ST40·countcap12·chaincap8·pierce500+20/lv, 실제 cutoff35210 | `test_native_ltn_chaser_source.gd`; lv1/5/cap, 수동만·auto금지, query/hitSet/chain RNG순서, 원점 메타 보존과 현재 P기준1000 cutoff 구분 | `EXODUSER-W06e-LtnChaser-Isolated-20261020` | W05/기존 skill/fusion/chain owner. 해당 branch 전체 이식 확인 전 HOLD |
| W07 | 새 `port_modules/ghost_xbow_turret_source/producer.gd`+W05 owner/pet seam | G:45523–45543,35139–35173,13083–13084. ST100·y−40·inputcd1200·caller gxFiring1·P상태복구 | `test_native_ghost_xbow_turret.gd`; 방향/좌표finally복구·신규탄만fromTurret·activeBowSk유지·자동설치금지·1.5 선언 미소비 | `EXODUSER-W07-GhostXbow-Isolated-20261020` | W05/06, voidScarecrow/fusion/input 기존 owner. 미이식 합체는 명시 halt; Q/E 수정 없음 |
| W08 | 새 `port_modules/enemy_shock_source/producer.gd`; normal_enemy_hurte의 현재 번개halt 구역·enemy timer 연결만 | G:42196–42203,38592. 기존스택*.05 먼저, 새스택cap10/300f·일반3스택18f | `test_native_enemy_shock_source.gd`; 첫타/다음타 순서·max10·보스/noStun gate·만료/reset | `EXODUSER-W08-EnemyShock-Isolated-20261020` | 기존 hurtE/clock과 REVIVE-SHIELD 담당 확인. 기존 elMul/저항 owner 재사용 |
| W09 | 새 `port_modules/enemy_dot_pool_source/producer.gd`; hurtE DoT halt·enemy tick seam | G:42161–42164,42422–42443,38720–38748,28066–28068. 출혈/중독300f·화상180f·max10·60f drain·pool합산 | `test_native_enemy_dot_pool.gd`; 9→10 pool경계·분모/남은시간·다중DoT순서·HP/ES·source필드이름 차이 | `EXODUSER-W09-EnemyDotPool-Isolated-20261020` | W08/기존냉기·hurtE. underscore 불일치 원본 판정이 선행인 HOLD, 임의 이름 통합 금지 |
| W10 | TI-03 제안 `scripts/native_inventory_panel.gd`·TI-06 제안 `scripts/native_inventory_compare.gd`에 무기 reader 계약 인수만; 별도 제품 owner0 | G:49730–49902,51301–51354. card/compare/실제dmg 3종식 분리·reqLv·비용역전 good·표시truthy | 새 `test_native_weapon_inventory_view_contract.gd`; 타입7/3·강화가산/preview차이·noequipmutation·unknown형·빈필드. 인벤 담당의 단일 계산을 소비 | `EXODUSER-W10-WeaponCard-Isolated-20261020` | 병합된 TRACE-INVENTORY TI-03/06의 실제 구현/소유 인수 후. 실제 UI 연결은 **미확인**, 별도 weapon_card_view 복제 금지. 시각은 별도 검수 |

경로 표의 `port_modules/`, `scripts/`, 테스트명은 모두 `godot/` 하위다. W06b/e의 세부 projectile branch·W06c 폭발 receipt는 이 문서가 실행 동등성을 확정한 범위가 아니므로 구현 전에 원문과 기존 담당 계약을 추가로 좁혀야 한다. W01→W02→W03→W04까지는 독립 계산을 우선하고 W05부터 실제 caller 증거를 요구한다. W08/09는 일반 bow 구현의 선행 필수가 아니며, 미지원 속성 효과를 숨기지 않고 별도 인수한다. 근접7종 기본 공격은 기존 연결을 재사용하고 새로운 타입별 수치·패턴은 설계 변경 승인 없이 만들지 않는다.

## 10. 공용 파일 접점과 보호 계약

| 공용 접점 | 소비/제공 계약 | 변경 시 선행 확인 |
|---|---|---|
| `godot/scripts/main.gd` | 현재 source 권위·LMB/hurtE/clock routing | W01 수정0. W05 이후 좁은 함수/행 소유 확인 |
| `native_source_player_providers.gd` / `native_source_new_run_state.gd` | current INV/PASSIVES/장비, 현재 객체 참조 | 기존 Callable 소비. 스냅샷 캐시·새 equipped writer 금지 |
| `native_source_player_initialization_services.gd` / `combat_stat_formula/producer.gd` | 현재 스탯·상성·패시브 reader | 기존 구현 먼저 사용, bow에 필요한 누락만 별도 계약 |
| `equipment_affix_reader/producer.gd` | 실제 장비 affix·invalidate·JS helper | W01 읽기/호출만. 카탈로그·item generator를 넣지 않음 |
| `item_armor_element/producer.gd` / `source_item_catalog.gd` | EL math·타입 정의 deep copy | 재전사·신규 원소번호 금지 |
| `player.gd` / `enemy.gd` / `native_normal_enemy_hurte.gd` | 실제 타격·기존 냉기·미이식 효과halt | 공격/상태 owner를 이중으로 돌리지 않음. W08/09 소유 합의 |
| `native_player_projectile_store.gd` / birth/hit owner | pool·reset·projectile mutable lifecycle | 생성/재활용/관통을 W03 packet과 혼동하지 않음 |
| `native_fireball_world_consumer.gd` / world 호출부 | 현재 fireball 외 packet을 skip/보존 | 기존 owner에 활 분기를 무작정 삽입하지 않고 W05c의 실제 phase/소유부터 확정 |
| `native_normal_enemy_hurte.gd`의 허용opts/분류 | 현재 arrow/maxDist/normalBow 미지원·melee/spell crit 경계 | W05b에서 arrow 배율·critRateBow·상성1회 계약을 명시 인수하기 전 실제 활 피해 PASS 금지 |
| `world.gd` / `native_pets.gd` | query 순서·벽 충돌·pet 위치 | P3-002 동적 등록, 현 pet owner와 충돌 확인 |
| `native_world_drops.gd` | 아이템 획득·표시 | P2-006b 소유. 무기 추적이 표시 수정 권한이 아님 |
| UI·입력·글꼴 | INVENTORY/SETTINGS/P2-007a | W10 reader만 분리 후 실제 파일·호출 경계 확정 |
| 저장·migration | whole item payload·구타입 복구·원본 slot | TRACE-SAVE. schema/version/실제 userdir 변경 금지 |

Q/E 보호 원본 색인: `_qIsIceOrb` G:14295(false), `_tryKiSlashQCancel`14298–14311, `_sBlockChargeRadius`14313–14316, `_sBlockProjectileZone`14317–14320, projectile class16911–16921, E반사 gate16923–16927, 물리탄×3 16929–16931, 실제 접촉34847–34889, blackBean34961–34998, Q magic→blueBean35043–35062, E발동38449–38456, charge release38459–38468, `isPWin`38469, `doParry`38470–38575, `pParryProjDmg`28036. **blackBean은 Q magic 패링만 허용하며 E 반사 불가**다. 무기·원소 변경을 이유로 이 분기나 확정 docs/2_3을 수정하지 않는다.

## 11. 조사 검증과 남은 미확인

| 확인 | 결과 |
|---|---|
| fetch·기준 SHA·worktree | 시작 최신 origin/main `ad6ac68a2…`에서 생성, 별도 codex 브랜치. 제출 전9528 진행분은 §2.1에 분리 기록 |
| tracked INDEX / WORK | 시작 시 분리 확인, 타인 tracked 변경 없음 |
| 원본 해시·행 | §1 고정. 원문 추출 oracle와 파일 해시 일치 |
| 순수 원본 평가 | catalog 7/3·EL7·상성49칸·auto spec24 fixture. 로그 `source-probe.json` |
| Godot 구현 대조 | 실제 파일·caller·테스트 소스 확인. 이번 테스트 실행/GUI 검수 없음 |
| 새 경로 충돌 | W01 제품/테스트 경로는 기준 main에 없음 |
| 저장/기존 창·AppSupport | 이번 조사 실행 없음·접근/수정 없음 |
| 최종 변경 범위 | 이 문서 한 개만 커밋 대상. 제출 SHA/원격 확인은 외부 DONE에 기록 |

미확인 항목: 외부 JS의 `_iAtkPct/_iPierce` 소비, source pool 고갈 분기의 실제 도달 결과, 전체 특수 활 스킬·대지 자산의 플레이 동등성, 원본 DoT 이름 차이의 의도, 아직 진행 중인 TRACE-META/SKILLS/ITEMS 산출물, 병합된 INVENTORY/REVIVE-SHIELD의 향후 제품 구현, PC의 최신 실행 상태, 향후 UI 통합 파일명과 실제 시각 품질. 이번 문서만으로 이 항목을 완료로 승격하지 않는다.

## 12. 원본 식별자 전체 출현 색인

아래는 고정 `game.html`에서 범위가 명확한 무기/활/속성 식별자 123개의 **모든 literal 출현 행**을 추출한 색인이다. 정의·주석·생성·표시·실행·저장 관련 참조가 섞이므로 출현 자체가 실행 caller의 증거는 아니다. 범용 `atk/el/spd` 같은 전역 필드는 §3–5의 문맥별 범위로 추적했고, 전체 게임의 동명 필드를 이 시스템의 소비로 잘못 합산하지 않았다. `index.html`은 §4.5에서 별도로 추적했다.

<!-- LITERAL_INDEX -->

| 식별자 | 출현 행 수 | 전체 G 행 |
|---|---:|---|
| `WTYPES` | 13 | 3677, 15863, 15872–15873, 15875, 15883, 15897, 15960, 49734, 49756, 49883, 51193, 60346 |
| `WTYPE_KEYS` | 4 | 15872, 15959, 51171, 51193 |
| `WTYPE_SIZE` | 2 | 15832, 16184 |
| `_WP_MOD` | 3 | 15876, 15883, 15897 |
| `_weaponName` | 5 | 3675, 3678, 15883, 15897, 15962 |
| `BOWTYPES` | 11 | 3651, 15886, 15891, 15975, 17453, 28686, 28710, 49735, 49757, 49884, 51198 |
| `BTYPE_KEYS` | 4 | 15891, 15974, 51171, 51198 |
| `BTYPE_SIZE` | 2 | 15833, 16185 |
| `bowNames` | 2 | 15898, 15977 |
| `wtype` | 25 | 3669, 3676–3678, 15082–15083, 15862, 15894–15895, 15959, 15961, 15974, 16184, 16262, 16265, 27799, 27859, 49733–49734, 49756, 49759, 49880, 49882–49883, 60346 |
| `btype` | 20 | 3651, 15082–15083, 15976, 16185, 16262, 16265, 17453, 27799, 27859, 28686, 28695, 28710, 49733, 49735, 49757, 49759, 49880, 49882, 49884 |
| `wStCost` | 3 | 15966, 49763, 49876 |
| `wArcW` | 6 | 15967, 33359, 49765, 49876, 58949, 58968 |
| `wRange` | 15 | 15968, 16451, 33169, 33358, 34080, 34862, 43315, 43616, 49500, 49764, 49876, 58208, 58349, 58949, 58967 |
| `wStagger` | 6 | 15969, 16451, 43616, 49500, 49766, 49876 |
| `bonusRange` | 28 | 3493, 12132, 15970, 15984, 15989, 16002, 16040, 16451, 17454, 28686, 33169, 33358, 33596, 33644, 34080, 34858–34859, 34862, 43315, 43616, 49506, 49787, 49876, 58208, 58349, 58949, 58967, 59029 |
| `bowSpd` | 8 | 15980, 16445, 35151, 36103, 49501, 49767, 49876, 59066 |
| `bowStCost` | 1 | 15981 |
| `bowRange` | 10 | 14707, 14917, 15982, 16452, 17454, 28686, 43616, 49501, 49768, 49876 |
| `bowProjSpd` | 3 | 15983, 17455, 28686 |
| `bowPierce` | 16 | 15985, 16452, 17399, 33232, 36077, 43616, 44193, 44784, 45114, 45172, 45190, 45223, 46170, 49769, 49876, 51351 |
| `antiRevive` | 13 | 14499–14500, 14870, 14965, 15926, 15932, 15937, 42208–42209, 42522, 42629, 42644, 51403 |
| `_iAtkPct` | 1 | 15017 |
| `_iPierce` | 1 | 15018 |
| `_iAtkSpd` | 2 | 15022, 27994 |
| `_fixBow` | 3 | 3651–3653 |
| `_fixWpnSpd` | 3 | 3669, 3673–3674 |
| `_fixWpnName` | 3 | 3677, 3680–3681 |
| `_spdMig3` | 0 | 미발견 |
| `_nameMig1` | 0 | 미발견 |
| `_refreshEquipmentStats` | 3 | 16287, 16363, 16376 |
| `_slotFlatAtk` | 4 | 28766, 28770–28772 |
| `_lvB` | 11 | 27897, 27906, 27994, 27996, 28768, 28770–28772, 32759, 43432, 51327 |
| `meleeRef` | 27 | 12870, 16825, 28036, 28770, 32306, 32353, 32390, 32484, 33085, 33173, 33415–33416, 36001, 36004, 36418, 38545, 42330, 42495, 43310, 43371, 43600, 44672, 45116, 45171, 45284, 46468, 51301 |
| `bowRef` | 17 | 16539, 28687, 28711, 28771, 36001, 36003, 36124, 36173, 44673, 44951, 45143, 45188, 45221, 45299–45300, 45335, 51302 |
| `magicRef` | 44 | 28036, 28772, 28806, 28843, 28965, 32282, 32344, 32424, 33212, 33594, 33629, 33641, 33785, 34030, 34151, 35383, 36059, 36347, 36357, 36405, 36428, 36591, 36737, 36833, 36868, 36892, 36950, 36994, 42771, 44215, 44674, 45366, 45399, 45500, 45507, 45815, 46113, 46266, 46517, 46648, 46771, 46909, 46947, 51303 |
| `statStr` | 29 | 16825, 27993, 28036, 32291, 32306, 32353, 32390, 32484, 33085, 33173, 33416, 36004, 36418, 38545, 42207, 42330, 42495, 43310, 43371, 43600, 44675, 45116, 45171, 45284, 46194, 46213, 46468, 49490, 51301 |
| `statDex` | 26 | 16539, 27994, 33164, 33364, 36003, 36124, 36173, 44676, 44951, 45143, 45188, 45221, 45299–45300, 45335, 49739, 49767, 49888, 51309–51311, 51333, 51347, 58625, 58630, 58648 |
| `statInt` | 43 | 27995, 28036, 28806, 28843, 28965, 32282, 32344, 32424, 33212, 33594, 33629, 33641, 33785, 34030, 34151, 35383, 36059, 36347, 36357, 36405, 36428, 36591, 36737, 36833, 36868, 36892, 36950, 36994, 42771, 44677, 45366, 45399, 45500, 45507, 45815, 46113, 46266, 46517, 46648, 46771, 46909, 46947, 51303 |
| `enhMulAtk` | 28 | 28097, 28770–28772, 33362, 37055, 37065, 37073, 40586, 40627, 40681, 40959, 41033, 41068, 41091, 41128, 41159, 41261, 41278, 41312, 41344, 49758–49759, 50608–50609, 51344–51346 |
| `_passDmgSum` | 6 | 28003, 28017, 28039, 28042, 28046, 28066 |
| `pBowMul` | 17 | 16539, 28042, 28687, 28711, 36003, 36124, 36173, 44682, 44951, 45143, 45188, 45221, 45299–45300, 45335, 51302, 51345 |
| `pBowCost` | 3 | 28043, 31983, 51320 |
| `pBowRange` | 3 | 17454, 28044, 28686 |
| `pBowSpd` | 4 | 28045, 28696, 44961, 49767 |
| `pXbowMul` | 3 | 28046, 28711, 51388 |
| `pXbowSpd` | 4 | 28047, 35151, 36103, 51388 |
| `XBOW_RANGE` | 5 | 17446, 17454, 35168–35169, 56702 |
| `XBOW_INTERVAL` | 2 | 17447, 35152 |
| `XBOW_DMG` | 2 | 17448, 28711 |
| `XBOW_SPEED` | 2 | 17449, 17455 |
| `XBOW_PIERCE` | 3 | 17450, 28712, 28716 |
| `_autoBowSpec` | 3 | 17451, 28709, 35144 |
| `_xbowTimer` | 6 | 13221, 17458, 35140, 35152–35153, 49072 |
| `_xbowTarget` | 8 | 13221, 17459, 35141, 35149, 35152, 35158, 35161, 49072 |
| `_xbowEquipped` | 12 | 13062, 13084, 13221–13223, 17460, 28400, 35139, 43734, 49072, 49376, 49416 |
| `GXBOW_ST` | 5 | 13084, 17463, 45524, 45526, 54906 |
| `GXBOW_DMG_MUL` | 1 | 17464 |
| `GXBOW_SPD_MUL` | 1 | 17465 |
| `_gxTurret` | 32 | 13059, 13062, 16538, 16540, 16544, 16547–16548, 16553, 17468, 28401–28402, 28719, 35138, 35154, 35156, 35167–35168, 35171–35172, 35406, 35418, 43734, 45529, 54898, 54900, 54902–54903, 54905–54906, 56696, 56698, 59977 |
| `_gxFiring` | 9 | 17469, 28704, 28711, 28719, 28744, 28754, 31983, 35156, 35160 |
| `fireBow` | 1 | 28676 |
| `_fireXbow` | 4 | 28703, 28731, 28754, 28758 |
| `_autoFireBowSkill` | 3 | 28725, 35158, 35161 |
| `normalBow` | 17 | 16550, 17311, 17333, 28689, 28693, 28712, 28716, 35186, 35418, 35433, 35454, 35617, 35624, 36095, 42466, 44957, 59125 |
| `ghostXbow` | 5 | 17311, 17333, 28712, 28716, 59130 |
| `_fireFanShot` | 2 | 28744, 44942 |
| `activateBladeShot` | 3 | 12979, 28742, 45294 |
| `activateBlastShot` | 2 | 28743, 45312 |
| `activateNeedleShot` | 2 | 28745, 45329 |
| `activateLtnChaser` | 2 | 12953, 45216 |
| `activateGhostXbowTurret` | 2 | 13084, 45523 |
| `_needleBurst` | 7 | 36088–36092, 36099, 45338 |
| `_bsBombs` | 13 | 30762, 31553, 36158–36160, 36190–36191, 43871, 45320, 45323, 57056–57057, 63485 |
| `_gsBombs` | 11 | 30762, 31553, 36106–36108, 36154–36155, 43871, 56899–56900, 63485 |
| `_lcMaxR` | 2 | 35331, 45242 |
| `_lcOx` | 2 | 35331, 45242 |
| `_lcOy` | 2 | 35331, 45242 |
| `ETYPE_ERES` | 3 | 14334, 14336, 31185 |
| `ELC` | 113 | 8798, 14338, 17381, 19956, 20055, 20105, 20119, 20144, 20147, 20267, 22753, 23699, 23718, 23800, 24269, 24275, 24390, 24534, 24715, 24831, 25427, 25430, 25447, 31163, 32435, 33502, 33833, 33989, 34236, 34246, 34285, 34324, 34828, 34832, 34892, 35036, 35125, 35216, 35255, 35472, 35531, 35954, 37059, 37067, 37630, 37782, 37786, 37788, 37841, 37875, 37886, 37946, 37961, 38115, 38572, 38819, 40514, 41238, 42333, 45908, 46556, 48564, 49803, 49920, 50233, 50304, 50306, 51354, 52901, 52906, 54054, 54075, 54089, 54096, 54219, 54274, 54277, 54289, 54292, 54299, 54733, 55485, 55530, 57737, 57821, 57874, 58352, 58444, 58949, 58964, 59065, 59104, 59123, 60207, 60210, 60234, 60346–60351, 60357–60358, 60361, 60363–60364, 60748, 60795, 60823, 60979, 61025, 61095 |
| `ELN` | 5 | 14342, 49918, 49920, 51129, 51354 |
| `ELE` | 4 | 14343, 49803, 49918, 53947 |
| `ELP` | 12 | 25430, 32295, 32437, 33991, 34091, 35474, 37633, 42333, 46558, 55462, 55520, 59265 |
| `EL_TO_PAL` | 2 | 23023, 23542 |
| `elMul` | 88 | 9592, 14344, 20020, 24588, 28817, 28852, 28978, 32431, 33977, 33998, 34083, 34235, 34245, 34275, 34284, 34309, 34321, 34682, 34697, 34730, 34903, 35080, 35086, 35089, 35227, 35264, 35398, 35466, 35506, 35528, 35621, 37037, 37055, 37059, 37065, 37067, 37069, 37071, 37073, 37077, 37079, 37122, 37129, 37131, 37133, 37135, 37137, 37139, 37141, 37143, 37145, 37147, 37149, 37151, 37614, 40535, 40545, 40553, 40588, 40629, 40685, 40706, 40756, 40768, 40830, 40857, 40862, 40884, 40925, 40935, 40962, 41036, 41069, 41093, 41130, 41161, 41263, 41281, 41293, 41314, 41346, 41370, 42124, 42131, 42328, 43351, 46327, 46537 |
| `pDotDmg` | 7 | 28066, 38722, 38726, 38731, 38735, 38740, 38744 |
| `pDotDur` | 7 | 28067, 38722–38723, 38731–38732, 38740–38741 |
| `pDotPool` | 31 | 24595, 24597, 28068, 32318, 34038, 34236, 34246, 34276, 34285, 34311, 34323, 35113, 35124, 35359, 35415, 35577, 36131, 36179, 37367, 37435–37436, 37442, 37469, 37476, 37480, 37484, 42163–42164, 42426, 42429, 44865 |
| `_shockStk` | 5 | 35874, 38592, 42197, 42201–42202 |
| `_shockT` | 4 | 35874, 38592, 42200, 42373 |
| `_freezeGauge` | 17 | 37276, 37278–37280, 37323–37325, 38647, 38657, 42322, 42372, 42378, 42447, 42451–42452, 42454, 53968 |
| `_frozen` | 24 | 9594, 20084, 20120, 24592, 24611, 34463, 35421, 37274, 37280, 37321, 37325, 38644, 38646–38647, 38667, 42252, 42322, 42338, 42372, 42378, 42445, 42453, 53696, 53967 |
| `_freezeImmune` | 3 | 42322, 42372, 42378 |
| `_bleedPool` | 13 | 31187, 32318, 35415, 35577, 37435, 37469, 38726–38727, 38730, 41620, 41696, 42163, 44865 |
| `_poisonPool` | 14 | 24597, 31187, 35113, 35124, 35359, 37436, 37442, 38735–38736, 38739, 41620, 41696, 42164, 42426 |
| `_burnPool` | 21 | 24595, 31187, 34038, 34236, 34246, 34276, 34285, 34311, 34323, 36131, 36179, 37367, 37476, 37480, 37484, 38744–38745, 38748, 41620, 41696, 42429 |
| `activeBowSk` | 27 | 3565, 3842–3846, 28400, 28726, 29024, 44658, 44927, 45527, 47011, 47015, 47026, 47036, 47056, 47280, 47779, 54895, 61980, 62010, 62039, 62151, 62395, 63921, 64078 |
| `xbowAuto` | 3 | 13222, 49072, 49416 |
| `SKILL_LIST` | 16 | 3772, 3903, 13304, 13316, 44161, 44225–44226, 44563, 44970, 47213–47214, 47480, 62225, 62230, 64204–64205 |
| `SKILL_SLOT_DEFS` | 26 | 3859, 3873, 28498, 28656, 44277, 44652, 47014, 47032, 47078, 47159, 47168, 47173, 47279–47284, 47539, 47541, 47778–47782, 47784 |
| `_SK_MUL` | 6 | 44507, 44556, 44750–44753 |
| `_skMul` | 64 | 16825, 28806, 28843, 28966, 32282, 32306, 32344, 32353, 32390, 32424, 32484, 33173, 33212, 33594, 33629, 33641, 34030, 34151, 35383, 36059, 36124, 36173, 36347, 36357, 36405, 36418, 36428, 36591, 36833, 36868, 36892, 36950, 36994, 42771, 43310, 43371, 44167, 44173, 44194, 44216, 44282, 44504, 44522, 44556, 45116, 45143, 45171, 45188, 45221, 45284, 45299–45300, 45335, 45366, 45399, 45500, 45507, 45802, 45815, 46266, 46468, 46648, 46771, 46947 |
| `_fuseMul` | 41 | 28806, 32282, 32306, 32390, 32424, 32484, 32709, 33173, 33212, 33629, 33641, 33979, 34030, 34151, 36059, 36124, 36173, 36347, 36357, 36405, 36418, 36591, 36833, 36868, 36892, 36950, 36994, 43313, 43373, 44557, 45116, 45143, 45188, 45221, 45399, 45802, 45815, 46194, 46213, 46648, 46947 |
| `openSkSlotPop` | 12 | 28616–28620, 28627–28628, 32121, 46969, 46998, 47567–47568 |
| `updateTSlot` | 2 | 44883, 44925 |
| `updateBowSlot` | 5 | 44883, 44888, 47172, 47779–47780 |
| `_syncActiveSkAfterReset` | 5 | 3879, 44644, 47270, 47935, 47949 |
| `_skillBatchUp` | 2 | 3090, 47192 |
| `_skCtx` | 3 | 47678, 47767, 47819 |
| `_skLearnUp` | 2 | 47767, 48464 |
| `_AFSLOT` | 2 | 14364, 15132 |
| `rollAffixes` | 8 | 15131, 15134, 15136, 15138–15139, 15141, 16114, 50460 |
| `weaponRange` | 2 | 14706, 14917 |
| `bowAtkSpd` | 5 | 14577, 14893, 14975, 28696, 44961 |
| `meleeAtkSpd` | 7 | 14576, 14893, 14975, 33364, 58625, 58630, 58648 |
| `rangedDmgPct` | 4 | 14563, 14892, 14974, 42277 |
| `projDmgPct` | 5 | 14567, 14892, 14974, 42277, 42281 |
| `critRateBow` | 4 | 14575, 14893, 14975, 42313 |
| `pierceFlat` | 10 | 14853, 14918, 15012, 17348, 28035, 45114, 45172, 45190, 45223, 49770 |
| `pBow` | 8 | 27704, 27884, 28009, 28043–28045, 42282, 61982 |
| `pXbow` | 5 | 27711, 27884, 28010, 28047, 61982 |
| `pPierce` | 17 | 17356, 17399, 27709, 27884, 33232, 35513, 35610, 36077, 44193, 44784, 45114, 45172, 45190, 45223, 46170, 51351, 61982 |
| `_BULLET_IMGS` | 3 | 14340–14341, 23262 |
