## actualMain 소비 상태 — 2026-10-14

원 producer는 실제 SourceState/SourceResources와 providerbundle10에 연결된다. actualMain 첫고유5그룹145는 처음성공4/132+fixture SCRIPTERROR consumer만13수리재검한이력이며 원독립source 성공검사는재연하지않는다. 실제초기아이템15equip+10bag/currentrawGrit0·getter·원currentCRef/Formula/Affix를소비하지만 전체파생/applyStats/fullbootstrap/actualsave복원·투자·환불/화면·240FPS는아직미완이다. 최신중앙SSOT는 FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md 및 FDG_GODOT_SOURCE_PLAYER_PROVIDERS_20261014.md다. 아래producer의원수치·과거검증이력은보존한다.

# Godot ITEM armor element 첫 이식 — 2026-10-13

| 항목 | 값 / 범위 |
|---|---|
| TASK | CODEX7-GODOT-ITEM-ITEM_ARMOR_ELEMENT-FIRST-20261013 |
| COMPLETION-ID | ITEM-ARMOR-ELEMENT-FIRST-20261013-75 |
| 작업 시작 실제 parent | b921fc4017703d8b37cc2a9de8fdb5781992165e |
| 제품 root | `/Users/fordeargamers/the-exoduser` — realpath 동일, 소유 경로 symlink 없음 |
| 소유 코드 | `godot/port_modules/item_armor_element/producer.gd` |
| 소유 최초 검사 | `godot/port_modules/item_armor_element/tests/test_first.gd` |
| 새 정본 문서 | 이 파일만 소유. 기존 공유 docs 수정0 |
| 생성 전 | 코드·검사·이 문서 working/HEAD 모두 부재; 이전 bytes가 없어 백업 대상 없음. 외부 before.json에 기록 |
| 변경하지 않은 영역 | 공유 player/world/factory, HTML/원 source, drop/경제/save, enum/schema/등급색, 자산/맵/보호2_3, Git index/commit |

## 원 source와 현재 수식

원 source root는 `/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. `game.html:15066`의 EL, `15077`의 elMul, `17023`의 ar, `16802` equipItem과 `16875` unequipItem을 읽었다. source-fragments.txt는 필요한 원문만 보존하며 원자원 재해시/재import는 하지 않았다.

| id | 원 값 / 식 | 실제 API / 소비 |
|---|---|---|
| EL | P=0, F=1, I=2, D=3, L=4, H=5, E=6 | incoming int를 그대로 사용. 새 enum/임의 EL.P 장비 생성0 |
| armor identity | `ar() = INV.equipped.armor || {}` | caller가 반환하는 현재 inventory의 `equipped.armor` Dictionary 자체를 반환. id나 이름으로 재검색/복제하지 않음 |
| 장비 교체 | `INV.equipped[equipSlot]=item; item.slot=equipSlot` | armor 선택은 `equipped.armor` 키 기준. 원 `id`, `slot`, `el` 변경0, bag 검색/경제 처리0 |
| 해제 | `INV.equipped[slot]=null` | reader의 현재 armor=null이면 반환 null; defender element=null, 모든 native incoming에 1.0 |
| 약점 배율 | F→I, I→F, D→L, L→D, D→H, H→D, E→L, L→E 각각 2 | `element_multiplier(attacker, defender)`의 동일 분기 순서 |
| 동일 속성 | `a===d && a!==EL.P` → 0.5 | numeric 동일·물리0 제외. 숫자형 float 2.0도 JS Number 2와 같은 의미 |
| 나머지 | 1 | 무장비/누락/null/문자열/bool defender는 numeric native attacker와 일치하지 않으므로 1.0. 0으로 강제 변환하지 않음 |
| 피해 caller | `game.html:35710`: `~~((p.dmg||10)*elMul(p.el,ar().el))` | 이 producer는 배율만 반환. 피해 truncation·HP·패링·poise·raw flags·탄 생명주기는 호출자 소유 |

| 공격＼방어 | P0 | F1 | I2 | D3 | L4 | H5 | E6 |
|---|---|---|---|---|---|---|---|
| P0 | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| F1 | 1 | 0.5 | 2 | 1 | 1 | 1 | 1 |
| I2 | 1 | 2 | 0.5 | 1 | 1 | 1 | 1 |
| D3 | 1 | 1 | 1 | 0.5 | 2 | 2 | 1 |
| L4 | 1 | 1 | 1 | 2 | 0.5 | 1 | 2 |
| H5 | 1 | 1 | 1 | 2 | 1 | 0.5 | 1 |
| E6 | 1 | 1 | 1 | 1 | 2 | 1 | 0.5 |

## Runtime public API와 caller

| API | 실제 동작 / 계약 |
|---|---|
| `configure_inventory_reader(reader: Callable) -> bool` | 유효 reader를 바인딩. 무효 Callable은 false이며 이전 바인딩 유지. reader는 매 조회마다 현재 inventory Dictionary를 반환해야 함 |
| `clear_inventory_reader() -> void` | 소유 바인딩 해제; 이후 neutral1 |
| `get_equipped_armor() -> Variant` | reader 실행 → 현재 equipped → armor. Dictionary면 원 identity 반환; reader 소멸/비Dictionary/없음/빈 armor면 null. 슬롯을 새로 쓰거나 ID로 객체를 바꾸지 않음 |
| `get_armor_element() -> Variant` | 현재 원 armor.el 또는 null. 물리0 fallback 없음 |
| `get_armor_identity() -> Variant` | 현재 원 armor.id 또는 null. numeric id 변환/생성 없음 |
| `get_native_element_multiplier(attacker_element_id: int) -> float` | 현재 armor를 읽어 원 elMul 식 반환 |
| `element_multiplier(attacker: int, defender: Variant) -> float` | 독립 원 상성 수식; 숫자 값 clamp/새 balance 없음 |

실제 격리 caller는 전용 test_first.gd의 `InventoryCaller`이다. constructor가 producer를 instantiate하고 `read_inventory` Callable을 configure한다. `select_armor`는 fixture inventory의 장비 identity를 교체하고 `incoming_multiplier`가 실제 producer를 호출한다. inventory/equipped Dictionary 전체 교체와 동일 id의 서로 다른 Dictionary도 현재 참조를 소비한다.

```gdscript
var armor_provider = preload("res://port_modules/item_armor_element/producer.gd").new()
armor_provider.configure_inventory_reader(read_current_inventory)
# read_current_inventory()는 실제 소유 caller의 최신 INV Dictionary를 반환한다.
var multiplier = armor_provider.get_native_element_multiplier(attacker_element_id)
```

위 production caller 예는 ENGINE 연결용이며 공유 player에 적용하지 않았다. fixture의 숫자 id `1700000000000.25`와 armor el 1/2/3은 검사용 입력이며 live 장비 생성·save 기록이 아니다. 실제 source equipItem의 요구레벨/강화비용/결정전승/가방 이동은 이 provider의 기능이 아니다.

## 최초 검사와 미완 Gate

| 항목 | 결과 / 한계 |
|---|---|
| 실제 도구 | 기존 portable Godot 4.7.2, headless, `--path /Users/fordeargamers/the-exoduser/godot --script res://port_modules/item_armor_element/tests/test_first.gd` |
| 최초 meaningful 검사 | 75 checks, failures=[], exit0. 도구 chunk a77548. 성공 suite 반복0 |
| 검사 범위 | 무장비 7속성 neutral1·원 객체 identity·원 slot/id·같은 id 객체 교체·직접 el 변경·equipped/INV 참조 교체·무효 reader 보존·49 상성 조합·누락/잘못된 el 비강제변환·unbind |
| 격리 I/O | `--log-file`을 외부 E의 `fixture/first.log`로 지정. 테스트/provider는 user:// 및 실제 save/슬롯/API 접근0. 프로젝트 user-directory 설정 자체는 공유 config 소유여서 변경하지 않음 |
| live inventory | 아직 Godot production inventory caller 연결 없음. fixture 실행을 live inventory 소비/전체 equipment 이식으로 승격하지 않음 |
| 공유 player | `get_native_element_multiplier`는 현재 no-armor neutral1을 유지. ENGINE이 실제 inventory와 provider를 연결할 때만 장비 상성 경로 활성 가능 |
| source docs 차이 | R `docs/2_2 무기+활+속성시스템/2_2 무기+활+속성시스템.md`의 상성 강약 설명 일부는 현재 elMul과 불일치. 이 문서의 원문 분기/표를 current-value로 ENGINE에 인계; 기존 공유 문서 수정0 |
| 추가 관련 docs | W `docs/engine/FDG_INTEGRATION_INTERFACE.md`의 armor 상성1 범위; R `docs/2_7 인벤토리+장비시스템/` 및 속성/밸런스 검색 결과는 외부 docs-W/R-*.txt에 보존 |
| visual / render / audio | 렌더·실제 청취·공개 play·최저240 미검수. auto 플레이/전체게임 완료0 |
| 보호 계약 | native60·raw flags·Q/E·poise·owner 독립탄·nav LOCK 변경0. blackBean magic/Q만/E불가/Q 성공 blue 유도반사 및 공격 동시 제한 금지 유지 |

증거 root: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/item_armor_element/`. `before.json`, `source-fragments.txt`, `fixture/first.log`, `first-test-ledger.json`, `owned-receipt.json`, `own-hunk.patch`, 전체 allowed docs keyword 검색 raw가 담당 증거다. 지정 제외 문서/마케팅 capture 도구 read·검색·채택0. 새 producer와 최초 headless consumer 동작 완료이며 중앙/ROOT 인수·실게임 연결은 미완이다.
