# ITEM-UNIQUE-SAVE-NAME-CANDIDATE 결과

2026-10-01 기존 ITEM 승인 후속. **현재 원실패 재현·최소 미적용 후보·격리 저장 호환 회귀 완료. 생산 미반영.**

## 수신·첫Read·Edit·실행

12:54:42 UTC 배정 파일과 소유 폴더 목록을 읽었다. unique-save 산출/영수증은 없고 이전 ring/rgb와 다른 과제임을 확인했다. 이어 ITEM_TEAM_MASTER·적용계약·본편/easy dbSave/dbRestore 및 실제 무기명/공유창고 함수를 읽었다. 전용 영수증을 먼저 작성한 뒤 `unique-save-candidate.mjs`, `unique-save-check.mjs`를 편집했다. 새 세션/공유대장/생산편집은 없다.

첫 실행은 fake DB chain의 문법 오류로 exit1이었다. 해당 테스트 소유파일의 객체 문법만 수정했다. 후속 exit0 실행 뒤 장착 경로를 `INV.equipped[item.slot]`로 정확화하고 소켓 누락 RNG 한계 및 source hash 잠금을 추가한 최종 실행도exit0.

명령: `node tools/team-followup-20261001/ITEM/unique-save-check.mjs`. **84개 시나리오 assertion 통과**(파일별42개, node:test의84독립테스트라는 뜻이 아님). 원자료 `tools/team-followup-20261001/ITEM/unique-save-evidence.json`.

## 현재 실패와 최소후보

| 입력 / 경로 | 원식 | 후보 |
|---|---|---|
| UI-08, weapon/dagger, 고유 단검 이름, rarity5, _nameMig없음 / bag | **녹슨 단검**, _nameMig1 | 고유 단검 이름 유지, _nameMig 추가0 |
| 같은아이템 / equipped.weapon | **녹슨 단검**, _nameMig1 | 이름·ID·소수롤 유지 |
| 같은아이템 / 공유창고 | 원래 이름유지 | 원래대로 유지 |
| 미등록 문자열 ID·공백문자열 | 원무기명 마이그레이션 | 이름보존, 등록조회/삭제/재롤/신형전환0 |
| uniqueId 없음/빈문자열/null/숫자/객체/배열 | 기존 이름마이그레이션 | 원식과전체객체 동등 |
| 구형슬롯유니크(uniqueId없음) | 원이름/효과/마이그레이션 | 원식동등 |
| 유골함 unique=true, uniqueSpecial=null | 원보존 | 원식동등 |

root 사전 보고의 '일반 단검'은 이번 실제 `_weaponName`·`_WP_MOD`·WTYPES를 추출한 tier0/el0 값 **'녹슨 단검'**과 다르다. 덮어쓰기 문제는 동일하지만 문자열은 현재 실제값으로 기록한다. 신규 고유드롭이 있다는 증거로 해석하지 않는다.

최소추가식은 `_fixWpnName` 맨앞의 `if(it&&typeof it.uniqueId==='string'&&it.uniqueId.length>0)return;` 하나다. 문자열은trim/정규화/등록목록검사를 하지 않아 ' '도 비어있지 않은ID로 보존한다. 원ID/이름을 변경하지 않는다. 이름마이그레이션을 건너뛰는 아이템에 _nameMig를 신규추가하지 않는다. 신규생성/번역/효과/아트/드롭/경제정책0.

미적용 context diff: `tools/team-followup-20261001/ITEM/unique-save-game.patch`, `tools/team-followup-20261001/ITEM/unique-save-game-easy-test.patch`. 각한줄변경과앞뒤2줄표준context를 저장했다. Git apply/쓰기명령은 실행하지 않았다. 변환기는 원시그니처가 없거나 이미후보면 실패하여 중복수정을 막는다.

## 실제 저장 전달 경로와 격리 수준

| 경로 | 실제추출해 실행한 계약 |
|---|---|
| 가방 | dbSave `saveData.inv.bag=INV.bag` → fake sb.from('characters').update({data:saveData}).eq('id','fixture').select('id') → JSON stringify/parse → full dbRestore `INV.bag=d.inv.bag||[]` → _fixWpnName |
| 장착 | 같은전달경로의 inv.equipped → dbRestore → SLOT_NAMES를순회해 실제각슬롯의 _fixWpnName. 유골함은 equipped.ossuary에서 검사 |
| 공유창고 | dbSave `_flushSharedStorage` → `_persistSharedStorage` → `_saveSharedStorage` → 메모리localStorage `hellcave_sharedStorage` JSON → dbRestore STORAGE리셋·`_getStore`/`_loadSharedStorage` → STORAGE[0] |
| 캐릭터세이브 storage | dbSave는 `{}`. 가방/장착 이름마이그레이션은 STORAGE[0]에실행하지 않음 |
| 구storage[0] | 공유저장이빈경우만 STORAGE_MAX내 이관; 이미공유저장이있으면 정본을우선하고 저장storage 제거. 두분기검사 |

full dbSave/dbRestore와 실제 `_sanitizeCoreState`, `_weaponName`, 저장/load/flush창고함수를 추출했다. DB·localStorage는 메모리 대역이며 JSON왕복을 강제했다. 실제사용자세이브·서버·전투·브라우저를 사용하지 않았다. 캐릭터atlas/스킬UI/숙련상한/공유mats 등무관한의존성은 noop/통제대역. fixture lv/스킬/결정필드는 단순값이라 무관한고레벨분기는검수범위가아니다.

fixture는 기존 _spdMig3·socketCount1·저장crystals와 기존affixes/uniqueSpecial을 포함한다. atk12.375, spd1.125, affix0.125, uniqueSpecial1.375 등소수값의 JSON왕복·반복restore 보존을 검증했다. 기존 nameMig1은원식과동등. unknown/invalid ID는 삭제하지않으며 전체객체대조로재롤/정규화없음을확인했다.

## RNG·기존정책 한계

- 정상저장82개 시나리오의 dbSave/dbRestore와반복restore에서 Math.random=throw 대역을설치했고 호출0. mkItem·효과·롤생성기를호출하지 않았다.
- 추가2개 제한시나리오는 파일별 원식/후보모두 socketCount누락시 `_fixCr`의 **기존 Math.random 1회**를 trap으로잡았다. 기존소켓마이그레이션을 고친것이나 전체구세이브 RNG0이라보고하지 않는다.
- _spdMig0 case는 기존 공속마이그레이션이동일하게실행됨을 차등검사했다. 이후보는 **이름마이그레이션**만 막으며 다른기존수리정책까지전체보존으로확대하지 않는다. 이 범위에서기존affix/공격력/uniqueSpecial소수롤은보존한다.
- 이미 원식에 의해 이름이덮이고 _nameMig1로저장된아이템의 잃은이름은 되살리지 않는다. 등록정보/번역정의없는 자동복구는범위밖이다.

## 입력 source hash / 인수 조건

| 파일 | HTML SHA256 | dbRestore SHA256 |
|---|---|---|
| game.html | `e5518842324d17fb63da44457e6092af138b4fcfbaf49c1cb03ef791431dc115` | `26c8789edaa85f46dfd14f1fbd040f3e55fd388942327a4abf50ccd79129c5d4` |
| game-easy-test.html | `269411143e093319926948dce42740d83617b2a0e1305cc1180a59a6ecb75e58` | `4e9f40574f363bc1cb00a61ca9e10d4d20bb256020e27fef644b35665649749a` |

dbSave·candidateRestore·_weaponName 해시와실제line은evidence.sources에보존했다. _weaponName양파일SHA `f84d1ddbdcd856dfca80c01fff5c0e3a6a3df7b93b06183071b02a09c9ccdb19`. 최종shasum명령exit0로HTML위값동일확인. 검사기는dbRestore해시변경시fail-closed; root는통합직전현재소스와타팀diff를다시확인한다.

docs 전체 `rg -n 'uniqueId|_fixWpnName|_nameMig|dbRestore|sharedStorage' docs --glob '*.md'` 검색(exit0), 결과 `tools/team-followup-20261001/ITEM/unique-save-docs-related.txt`. 생산미반영이므로공유docs수정0. 통합후적용계약§1표시이름·§4세이브회귀와ITEM대장/세이브SSOT에 nonempty-string guard, unknownID보존, 정확한창고분기·기존RNG/공속수리한계를동기화하도록인계한다.

**완료:** 사전저장계약의구체실패→미적용후보·격리회귀. **미완료:** root생산통합·실사용저장/슬롯/창고UI·패키지회귀·원격체크포인트. 새정의/드롭/효과/아트/번역정책은추가하지않았다. ring/픽셀과제반복0, Git/새세션/브라우저/서버/대형빌드0.
