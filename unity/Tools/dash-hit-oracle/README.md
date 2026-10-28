# 돌진(사슬 이동) 경로 피격 oracle

원본 `game.html`의 `_dashActive` 경로 피격 루프(STR 분기, 현재 32475~32505)를 Node VM에서 그대로 실행해 프레임별 (맞은 적, 피해, 각도, hurtE 옵션, 속성, 넉백)을 `oracle.json`으로 남기고, `Runtime/Core/ChainDash.cs`(`IsPathHit`, `PathHitDamage`, 상수)를 대조한다.

```powershell
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/dash-hit-oracle/export.cjs --source <game.html 경로>   # oracle.json 생성 (앵커: "const _csActiveNow" ~ "기동칼날개: 이동 중 광역 베기")
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/dash-hit-oracle/run.cjs                                  # .NET 8 빌드 + 비교
```

- 160케이스(돌진 강화 0~20, baseAtk 0~12000, 갑옷 charge/el 있음·없음, dashBoost 0~.9, 걸음 14/31/63px, 적 1~20, 죽은 적 포함), 733타, 15,338검사, 불일치 0.
- 통합(Simulation) 확인은 `Tools/kill-wire-test` 11번: 끌려가는 플레이어가 적을 한 번만 맞히고(같은 시전에서 재타격 없음) 흔들림이 켜진다.
- 이식 범위: STR 분기만. 마법 사슬(magicBlink/dimBreach 화염 관통+화상), 기동칼날개 광역 베기·반경 확대, 합체(`_fuseMul`), 유니크 회수(`_uChainCrowdRefund`), 착지 슬램은 스킬·유니크 미이식이라 제외. `G.hitStop`은 Core에 모델이 없어 제외(흔들림 `G.shake`만 반영).
- 앵글러(`_hurtFieldMobs`)는 연결하지 않는다: 웹의 사슬 이동 루프는 `_hurtFieldMobs`를 부르지 않는다(돌진 호출은 도달 불가 코드).
- 후보 적 선정: 웹은 `shQuery(P, 40)`(128px 셀 해시) 뒤 `dst <= e.r + 20`; Unity의 기존 shQuery 이식(`NearbyWebs`)은 정확한 반경 `r + other.r`이라 `e.r + 20` 도달 범위를 포함하므로 같은 집합이다. 셀 경계로 웹이 놓치는 가장자리 사례(e.r이 크고 셀 밖)는 재현하지 않는다.
