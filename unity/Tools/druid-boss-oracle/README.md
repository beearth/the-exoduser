# BX-02/03/05 1-1 다크드루이드 oracle

`Runtime/Core/DruidBoss*.cs`(AI 틱·점수·콤보·페이즈·23기술·투사체·장판)를 **원본 game.html 코드를 Node VM에서 같은 시드로 실행한 결과**와 틱 단위로 비교한다. 기대값은 손으로 쓰지 않는다.

```powershell
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/druid-boss-oracle/run.cjs --cases 48     # export → dotnet build → 비교 (불일치 0이어야 통과)
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/druid-boss-oracle/gen-cs.cjs               # Core/DruidBossData.cs 재생성 (BOSS_MOVES·COMBOS·PHASES·_BOSS_MOVESET[0])
```

- 실행하는 원본: `BOSS_*` 표, `_bossScore`/`_bossStartPattern`/`_bossPhaseCheck`/`_bossIdleMove`/`_bossAI`, updateE 머리(텔레그래프·넉백·벽 충돌 피해·경직·시야 어그로·`_ffMoveE` 추격·ATK 리셋·`_tickProjCharge`·st2 시계), 보스 디스패처 + `switch(e.s)` 전체, `_spawnBossProjectile`+`spawnProj`(1/3 드랍·크기/속도 배율·속도 롤), `_fireChargedProj`, update()의 장판 블록(추적 장판·균열·조류파·추적지뢰·독웅덩이·드루이드 리듬탄·오브·독 늪).
- 비교 항목(틱마다): 난수 추첨 횟수, 보스 상태 필드 36개 + 기술 이력·콤보·쿨다운 합, `hurtP`/`hurtE`/`_poiseHit`/`doParry` 호출 목록, 플레이어 넉백·이동·무적·독/거미줄 변화, 새로 생긴 투사체의 필드, 장판 배열 전체, 소환체 수.
- 난수: 같은 LCG를 JS(`Math.random` 치환)와 C#에 넣어 추첨 **횟수와 순서**까지 대조한다. 입자(`poolPart`/`addParts`/`playVFXAng`) 인자와 입자 루프 변수의 `Math.random()`은 별도 스트림(`_vr`)으로 보낸다(Unity에 입자가 없다). 보낸 줄 목록은 `oracle.json`의 `visualLines`.
- **범위 밖**: 적 투사체의 비행·충돌 루프(Q/E 패링 반사 포함 450줄 공용 코드)는 추출하지 않았다 → 투사체는 생성 직후 인자만 대조. 비행·플레이어 충돌은 `UpdateProjectiles`(B09 `HurtPlayer`가 E 창/Q 막기를 처리, 반사는 흡수로 대체)가 맡는다. 소환체는 etype0 몸체(웹은 etype `[0,2,3,3,3]`). 균열 충돌, `_pushOutWall`, 피날레(`_isDruidFinale`, 원본에서 도달 불가), 오라는 제외.
- 허용 오차: 위치류 1e-3 px + 상대 1.2e-7(EnemyState의 `float` 필드 때문). HP가 int 범위를 넘는 보스(Lv≈480↑)는 케이스에서 제외.
- `run.cjs`는 `DOTNET_CLI_HOME`을 고정 폴더(`E:/exoduser-wt/_dotnet-home`)로 쓰고 `DOTNET_ADD_GLOBAL_TOOLS_TO_PATH=false`를 건다.
