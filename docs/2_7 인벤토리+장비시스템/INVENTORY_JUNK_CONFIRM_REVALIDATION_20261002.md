# 쓰레기 일괄 분해 — 확인 후 잠금 보호

분해 확인창 대기 중 실제 전역 F로 아이템을 중요잠금해도 이전 콜백이 잠근 객체를 삭제하고 이전 보상을 지급하는 문제를 수정했다. 확인 직전과 확인 후 원래 집합의 현재 상태를 재검사한다.

| 경계/변수 | 정확 계약 |
|---|---|
| 소유 source | `game.html`, `game-easy-test.html`의 `_jkBtn.onclick` 각각1개. callback682→1244B, 각+562B. 다른 callback/global helper 변경0 |
| 원래 `_jkItems` | 렌더 당시 filtered에서 캡처한 원래 junk 객체 집합. 확인 후 새로 생긴 junk 객체를 자동 추가하지 않는다 |
| `_canJunk(it)` / `_value` | 현재 bag의 같은 객체·junk=true·fav=false·equipped에 같은 객체 없음. `salvageVal(it)` 값이 유한하고0이상인 객체만 허용. 콜백 내부 predicate |
| `_pendingJunk` / `_pendingTotal` | 원래집합에서 확인 직전 적격 객체를 필터하고 현재 분해액을 합산. 빈집합이면 확인창 열기0 |
| `_currentJunk` / `_currentTotal` | 확인 성공 뒤 pending집합을 같은 조건으로 다시 필터하고 현재 분해액을 합산. 빈집합이면 추가 상태 변경0 |
| 지급/제거 | bag에서 current집합의 객체 identity만 제거하고 `G.mats+=_currentTotal`. 현재 적격 일부만 남아도 그 일부의 현재 보상만 지급 |
| 성공 후 | `_invSalSel.clear()`→`INV.selected=null`→`SFX.pickup()`→`dbSaveNow()`→`renderInv()` 기존 순서 |
| 취소/적격0 | 원래 modal/key handler의 부작용과 await 후 제거·보상·선택·SFX/save/render 부작용을 구분. await 후 적격0은 latter0 |
| 실제 재현 | main/easy 모두 실제 전체 등록 keyboard KeyF→actual gameConfirm/gcOk→await bulk를 연결. A잠금/B일반, 초기악의500에서 old A+B3000지급→3500, final A보존/B2000만지급→2500 |
| baseline | 신규28그룹=양판14씩, 8PASS/20상태·보상FAIL; fixtureErrors0. 이전 검사 반복0 |
| final | 신규28/28 PASS + 별도 정상 역소스대조8/8 동일(정상·취소·새junk 제외·KeyF후취소×양판). final source 실행contexts44=28+대조8×old/final2; 44를44독립PASS로 세지 않는다 |
| 정상 대조 | 확인내용·state·SFX/save/render·RNG 동일. main/easy 기존차이 유지 |
| 구문/보존 | inline JS12/importmapJSON2 1회PASS. callback2 외 전체 bytes/EOL 동일 및 역치환 exact. index·single/drop·GP·장비경제공식·기존test 원문보존 |
| 현재 main | 4028906B/SHA e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea |
| 현재 easy | 3906353B/SHA 68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390 |
| index | 342119B/SHA1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7 보존 |
| 검사 | `test/inventoryJunkConfirmRevalidationAcceptance.test.cjs` |
| 근거 | ignored `tmp/mac-migration-runtime/continued-review-20261002/inventory-junk-confirm-revalidation-acceptance/` source백업/baseline/final/receipt, docs검색은 같은상위 `inventory-junk-confirm-revalidation-docs/` |

현재 DOM/통계·부분renderer·오디오·저장 등은 대역이다. 실제 OS 키보드/마우스·native modal·패드·픽셀·청취·서버저장·전체게임 인수와 구분한다. aggregate 합계의 비정상 overflow·객체getter/분해액계산 예외·다른 single/선택분해/옛 callback 수명은 이번 범위의 추가 인수가 아니다. 현재 b3 Mac 앱은 이전7ccb72c0 세수정 snapshot이며 이번source 변경이 포함된 것으로 계산하지 않는다.

[인벤토리 SSOT](2_7%20인벤토리+장비시스템.md), [UI 정본](../3.1%20ui%20hud%20디자인/UI_COMPOSITION_20260925.md).
