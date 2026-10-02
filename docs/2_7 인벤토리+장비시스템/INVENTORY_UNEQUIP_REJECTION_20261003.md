# source15 장비 해제 거절의 자원 보존 — 2026-10-03

본편·Easy의 실제 가방 격자에서 장비를 놓을 공간이 없어 해제가 취소돼도 상세 해제 버튼과 장착 칸 우클릭이 applyStats/renderInv를 실행했다. 강인·마력그릇의 최종 보너스가 다시 붙기 전에 현재 HP·MP가 중간 최대치로 clamp돼 자원이 줄었다. unequipItem의 성공/실패 boolean과 세 등록 UI 경로의 성공 가드로 거절 시 재계산·재렌더를 막았다.

| 코드 접점 | 이전 | source15 |
|---|---|---|
| unequipItem 빈 슬롯 | undefined 반환 | false 반환 |
| 같은 분류의 실격자 공간 부족 | 임시 push→pop, 안내, undefined | 같은 복구/안내, false |
| 실제 이동 완료 | 기존 recalcSt·알림·해제음·dbSaveForce 후 undefined | 동일 순서 후 true |
| 상세 해제 버튼 | 호출 뒤 무조건 applyStats/renderInv | 반환 true일 때만 두 함수 호출 |
| 장착 칸 우클릭 | 위와 동일 | 위와 동일, preventDefault 유지 |
| 유골함 우클릭 | 장비 잔존 검사로 공간 거절 중단 | boolean 성공 검사로 공간·빈 슬롯 거절 중단; 기존 선택/호버 해제 순서 유지 |

함수명·slot 인자·장비 이동·강화·결정·악의·저장 schema·수치·가방 분류는 변경하지 않는다. BAG_MAX300/INV_COLS10/_invRows의 120행 및 크기 2×2는 검사 fixture에서 실제 선언·함수로 확인했다. 300개 장비로 같은 분류 격자를 채우고, 조각난 빈4칸에도2×2가 들어가지 않는 대조를 검사했다. 다른 분류 격자가 빈 경우 기존 성공을 유지하며 별도 개수 제한을 추가하지 않았다.

| actual 소스 검수 | 결과·정확한 범위 |
|---|---|
| 메모리 신규 조합 | 원본22/48PASS·26RED, 최종48/48PASS. RED에는 새 boolean/거절 부작용 계약 위반이 포함되며26개 별도 제품 버그라는 뜻이 아님 |
| 실제 생산 | 최종48/48PASS·source 입력/검사 후 SHA 동일, 전체12 JS+2 JSON 파싱 PASS |
| 명확한 기존 자원 손실 | 같은 격자 거절의 두 일반 caller×양판4대조: main HP1028→428·MP244→144, EasyHP1051→451·MP244→144. PASSIVES.pFortify2/pVital2의 합성 고자원 fixture |
| 거절 상태 | P/INV/G/가방·장비 객체·좌표·강화·결정·캐시 참조·현재/최대 자원4개 유지. applyStats/recalcSt/renderInv/저장/해제음/호버정리0·공간실패안내1 |
| 빈 슬롯/재호출 | stale/nonstale 상세·우클릭·유골함 및 직접 producer. 성공 뒤 재호출은 false·추가 저장/소리/재계산/렌더0 |
| 성공 대조 | 실제 좌표1회이동·기존 효과 순서·선택/호버·분류 격자 독립·현재 저자원 무료회복0. 기존 성공 해제의 HP/MP clamp 손실은 변경하지 않았고 별도 개선 후보로 남김 |
| 판별 차이 | main17/Easy16 SLOT_NAMES 및 main crystalEffects/Easy crystalVal·기존 결정 정의와 headband2 차이 그대로 추출 |
| 추출 근거 | actual unequip/격자/stat/crystal/passive 함수·선언, actual 상세 HTML 대입에서 생성된 onclick을 JS파싱, actual div/urn oncontextmenu 등록 RHS. callback 수작업 복제0 |
| 대역 경계 | 합성 P/INV 상태, 렌더/호버/알림/FM/noise/DB save는 기록 leaf. 전체 DOM·실저장·시각·음향·native 플레이 PASS 아님 |
| 최초 준비 이력 | 2회0케이스: 역치환 앵커가 기존 pickupItem도 매칭, Easy에 main crystalEffects를 가정. 문맥 앵커·판별 dependency 정정 후 신규 의미실행1회. 생산 결함/RED/PASS 숫자에 합산0 |
| 반복 범위 | 원팀ITEM8/4 및 source12/13/14·기존15+5/26 검사를 재실행하지 않음. 최종 logger는 live에서 이전 RED재현을 null로 표시하며 실제생산은GREEN만1회 |

| 입력/최종 | bytes | 전체 SHA256 |
|---|---|---|
| game.html | 4030105→4030118B(+13B) | `4e528f8ccd65f222b6c0d108e89c1281022eb27e3c8de152c72fb7e659d7d614` |
| game-easy-test.html | 3907372→3907385B(+13B) | `fe3bca4e299b5aea9e08fdbd37cf3798d8085d923c013fc21d0ac74f81288a4e` |

parent는 source14 `8d95685814b86b824ff2f8b9fa0ee22dc3ada303`이다. 양판6접점씩 OLD/NEW 유일성·전체 역치환 exact이며 stat/grid/declaration 의존성 bytes는 불변이다. 신규 영구 하니스 `test/unequipRejectionResourceAcceptance.test.cjs` 23265B/SHA `1d94a6f082d2bbfa597a1ac14c658223cabce4bfda9209c3549d732c9ac0eaa8`.

| 보존·인계 | 근거 |
|---|---|
| root 소유 | HTML2/docs7/test1=10. 기존8 byte백업·신규2부재·공유 인덱스empty 기준으로 시작 |
| 보호 | 타인67 SHA snapshot/감독STATE·LOG4별도 소유/사용자 게임·save/기존source11 앱 보존 |
| 용량 | actual71→완료own10 후81; externalfuture8 포함 예약상한89.80부터 완료소유10만 즉시checkpoint·100전새산출중단 |
| 실제 플레이 | 이번 source11 앱 getAXState 읽기도 Mac locked, 입력0/반복질문0. 신규 생산 코드의 실제 해제 UI·보스방 개방·사망후 문/몬스터 보존·재도전은 미인수 |
| 원자료 | ignored root-unequip-rejection-source15의 before-receipt/6patch-plan/production-applied/memory/live/docs-search 및 준비실패2개. 원자료는 제품 완성 건수로 계산하지 않음 |
| memory receipt | 192057B/SHA `0c00ba2920e2bc5fa6e39b2230d46f5b2d416f79c589f8c72dff16f7061bee40` |
| live receipt | 107304B/SHA `dd948b0c034f675991b0aad5a5d3ec20104bb22d621ee9ae2c8c54f80f81519b` |

전체 docs 관련 검색을 실행해 현재 인벤토리/저장/어픽스 정본의 해제 재계산 설명을 성공 조건으로 동기화했다. 기존 유골함 성공의2×2 공간·선택/호버 및 역사 GPU/패링/스킬/레이아웃 기록의 수치는 동일하다. 보호2_3/Q전용/어택티켓금지·맵geometry 변경0. 원격exact checkpoint와 최종 검색 개수는 root 영수증에 별도 기록한다.

## 후속 source16 — 성공 경로 손실은 별도 범위

위 source15 원본22/48PASS·26RED/최종48/48PASS, 두 일반 거절 caller HP/MP 손실 수치·SHA·준비실패2회는 당시 이력으로 보존한다. source15 성공 대조는 낮은 현재 자원의 무료회복0과 기존 이동/효과를 검수했으며 성공 해제 중간 clamp 손실 해결은 당시 별도 미해결이었다.

source16 후보는 성공 전이 직후 자원4개 보관→캐시 무효화→applyStats1회→최종 최대치로 min 복원하고 caller 중복 재계산을 제거한다. 새 private47그룹은 원본11PASS/36FAIL→후보47/47PASS이며 기존 source15 48 전체검사 재실행0이다. actual production/live 결과는 [source16 보고서](EQUIPMENT_ATOMIC_RESOURCE_REFRESH_20261003.md)에 별도 확정한다. 이력48을47로 치환하거나 native 성공으로 합산하지 않는다.

현재 검수는 `test/equipmentAtomicResourceAcceptance.test.cjs --live --root <checkout>`다. 옛 하니스는 `--historical-source15`와 정확한 source14(memory)/source15(live)에서만 지원하며 plan 쓰기0이다. 일반/현재 입력은 exit2·executedCases0·overallPass=null과 새 명령을 안내한다. 과거48 결과는 보존하며 현재47의 실패 경계6/성공 후 반복 거절2와 합산하지 않는다.
