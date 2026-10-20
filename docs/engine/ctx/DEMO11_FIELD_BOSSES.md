# DEMO11 — 필드보스(앵글러·곰치·화마귀) context pack

## 원본 계약

| R 행 | 핵심 |
|---|---|
| 60973–61067 | 앵글러: site/awake/body/charge/teleport/shot 및 clear 경계. |
| 61237–61442 | 곰치(worm): 목적지·잠복/출현·접촉/shot cycle. |
| 61443–61779 | 화마귀(firedevil): 등장/이동/8방향·charge/TP/사망. |
| 41869–41916 | 4개 지역, `_fbDone`, 문/arena 진행 연동. |
| 18628–18755 | field projectile·공통 전투 소비자. |

앵글러는 clear 진행 필수 조건이고 곰치/화마귀도 stage0 자연 전투다. 다만 원본 고정 XY/site/맵 배치는 새 맵 이식 대상이 아니다.

## 호출 순서

`region/site activation → spawn/asleep 또는 emerge → per-tick movement/pattern/CD → projectile/contact intent → hit set/HP/death once → _fbDone/alive count → region lock·door/arena`다. 앵글러 telegraph, 곰치 잠복, 화마귀 charge/TP는 일반 enemy tick으로 축약하지 않는다.

## Godot origin/main 대응

gap D22는 제품 fieldboss actor/전투 owner를 찾지 못해 **미착수**다. `FDG_SOURCE_TRACE_FIELDBOSS`의 S01~S08은 catalog/hit/각 cycle을 분리한 후속 제안일 뿐, module 존재나 page artifact를 실행 연결로 간주하지 않는다.

## 관련 docs

- `docs/8.0몬스터디자인/`, `docs/9적ai패턴디자인/`
- `docs/engine/FDG_SOURCE_TRACE_FIELDBOSS_20261020.md` §1–5
- `docs/engine/DEMO11_COMPLETION_GAP_20261021.md` D22

## 주의

필드보스의 hitSet/8tick/접촉 hurtP는 전투 owner 승인 전 건드리지 않는다. `_fbDone`/문 조건을 생략하고 장식 boss만 만들지 말며, map site 좌표/룩/배치는 새 map 팀 계약을 따른다.
