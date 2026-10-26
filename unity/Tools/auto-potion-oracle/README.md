# 자동 물약 원본 함수 대조 (B11 oracle)

`Runtime/Core/AutoPotion.cs`(순수 계산)를 **원본 game.html 함수를 실제로 실행한 결과**와 대조하는 offline .NET 검사다. Unity Player/Editor 검증이나 게임 전체 판정이 아니다. 손으로 옮긴 기대값은 없다.

```powershell
# 1) 원본 실행 → oracle.json (Node VM, game.html 읽기 전용)
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/auto-potion-oracle/export.cjs --source 'G:/exoduser/game.html'
# 2) RED: 구현이 없는 빈 모양(RedStub)에 대해 전부 대조 → 실패해야 함
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/auto-potion-oracle/run-red.cjs --project 'E:/exoduser-wt/pc-unity-win/unity' --label red
# 3) GREEN: 실제 AutoPotion.cs
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/auto-potion-oracle/run.cjs --project 'E:/exoduser-wt/pc-unity-win/unity' --label green
```

## export.cjs가 하는 일

- 원문을 **텍스트 앵커**(첫 줄 접두어)로 찾아 줄 범위를 `oracle.json`의 `source.anchors`에 기록한다(줄 번호를 믿지 않는다). 앵커 형태가 바뀌면 오류로 멈춘다. `--expect-source-sha <sha256>`로 파일 해시 불일치 시 거절할 수 있다. 각 블록의 sha256도 기록한다.
- 실행하는 원문 블록: `POT`(정의), `potHeal`, `_MALICE_COST_MUL`+`_malCost`, `addPotion`, 자동 블록(`if(autoPotCd>0)…potions++` 전체), 킬 드랍 블록(`if(Math.random()<(e.ib?1:1)){ … 보스 추가 }`), 보물상자 두 줄, 중형 상자 한 줄, 파괴물 한 줄, 대장간 물약 카드 계산 5줄과 클릭 조건식, `_fgCraft` 함수와 강화 콜백(`()=>{POT_LV[item.type]++;G.mats-=cost;…}`).
- 입력 격자는 스크립트가 생성하고 결과는 전부 VM이 만든다: 자동 블록 1,866건(레벨 0~10 × 증폭 6종 × HP 경계 × 악의 × 패링 연습, 쿨 합성 격자, 쿨 감소 격자), 240프레임 순환 12건(피해 패턴·전설 벨트·레벨), 킬 드랍 192건(난수 3개 조합×보스), 보물상자 41건(스테이지), 중형 상자 20건, 파괴물 1건, 대장간 카드 144건(단계 0~11 × 플레이어 레벨), 반복 강화 160건.

## 최소 래퍼(전역 주입) — 이것 외에는 원문을 그대로 실행

| 전역 | 주입 값 |
|---|---|
| `Math` | `Math`의 복사본 + `random()`이 호출자 난수열을 순서대로 반환(고갈되면 오류). 소비 횟수를 `draws`로 기록해 C#의 소비 횟수와 대조 |
| `P`, `G`, `PASSIVES`, `POT_LV`, `INV` 대용 함수 | 케이스 입력으로 만든 단순 객체: `P{x,y,hp,mhp,_lBeltT}`, `G{mats,stage,_pStats,_sStats}`, `PASSIVES{pRegen}`, `POT_LV{hp}`, `gl()`/`blt()`가 `{potCd}`, `_eqAffix('potionPower')`, `_lEq('_lBeltBuff')` |
| `window._parryLesson` / `_systemLesson` | `{active:true}` 또는 `undefined` / `undefined` |
| `SFX`, `addTxt`, `notify`, `_T`, `_requestQSRefresh`, `renderForge`, `dbSaveNow` | 호출을 기록하거나 무동작. `addTxt` 호출(좌표·문구·색·수명)은 그대로 `oracle.json`에 남는다 |
| `QSLOTS`, `item`, `it`, `mo`, `e`, `_dt`, `cost` | 케이스 입력 |

`Program.cs`는 웹 문구의 이모지(`👿`, `🧪`)를 제거한 문자열을 C# 문구와 비교한다(프로젝트 규칙: 게임 UI 이모지 금지). 좌표는 플레이어 기준(`P.y-25`) 또는 대상 기준(`e.y-8`, `it.x+20` 등)의 오프셋으로 환산해 비교한다.

## 실행 기록

- `RED`: `RedStub/AutoPotionStub.cs`(공개 모양만 있고 값은 0) 기준 **2,438검사 중 1,053 실패**(기대 실패).
- `green-01`: 8 실패 — 하니스 결함(순환 케이스의 SFX 카운터가 프레임 간 누적). 구현이 아니라 `export.cjs`를 고침.
- `green-02`/`green-03`: **2,438 checks / 0 failures**.
- 변이 검사(구현 상수를 일부러 바꿈): 쿨다운 기준 420→300, `Ceiling`→`Floor` → **2,438 중 620 실패**(검사가 실제로 민감함).
- 결과 파일: `E:/exoduser-wt/_out/pc-b11-impl/runs/{red,green-01,green-02,green-03,mutation}.json`.
