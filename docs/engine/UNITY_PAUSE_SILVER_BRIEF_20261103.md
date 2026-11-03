# Unity 일시정지 메뉴·인벤토리 제목 실버 헬 마감 — 작업 브리프 (2026-11-03)

- 요청 (사용자, Unity 캡처 2장):
  1. 일시정지 메뉴: "저기 ui 너무 투박하다 색이나 폰트나 다"
  2. 인벤토리: "저기 저렇게 대장간 고유 ui를 가릴거면 인벤토리 저 허접한 텍스트는 빼버려"
- 상태: **미착수(Unity)**. 클라우드 세션에서는 Unity 편집기가 없고 `unity/main`도 가져올 수 없어(디스크 한도) 코드를 읽어 원인 가설만 정리했다. 웹 쪽 인벤토리 제목 제거는 main 브랜치 `claude/festive-darwin-jrf8hy` 커밋 872f7326([WEB_UIUX_GAME 2026-11-03 절](../3.1%20ui%20hud%20디자인/WEB_UIUX_GAME_20261031.md#2026-11-03-인벤토리-제목-띠-제거))에서 끝났다.
- 브랜치: `unity/main`에서 `claude/unity-pc-*` 브랜치를 따서 작업하고 `unity/main`으로만 병합한다(CLAUDE.md "엔진별 버전 분리").

## 1. 일시정지 메뉴 — 코드 기준 원인 가설 (`unity/main` cbdcbc28 기준)

| 증상(캡처) | 원인 가설 | 고칠 방향 |
|---|---|---|
| 글자·판 전체가 회색으로 흐림 | `NativePauseMenu.Draw()`가 `GUI.enabled=oldEnabled&&navigation.Focused&&!navigation.WaitingForRelease`로 설정한다. 포커스가 없거나 키에서 손을 떼길 기다리는 동안 IMGUI 비활성 틴트가 걸리고, `MetalAction` 라벨도 `NativeSilverHellUi.Dim`(138,141,141)으로 바뀐다 | 입력 차단과 그리기를 분리해 정상 대비로 그린다 |
| 버튼판 뒤 판 크기의 회색 사각형 | `btn_plaque_20261029`·`btn_primary_composed`의 import 설정(Alpha Source, Alpha Is Transparency, 압축) 또는 `ButtonFocus`(`guide_button_glow`)가 모든 버튼에 그려지는지 의심 | 투명 영역이 그대로 보이는지 확인 |
| 계속하기 = 진홍 판 전체 | 주 버튼에 `btn_primary_composed`(진홍 판)를 쓴다 | 실버 헬 §1·§7(빨강은 작게)에 따라 은빛 판 + 진홍 빛(웹 `#gcModal .gc-ok` drop-shadow 수준)·양끝 보석 |
| 버튼 폭·정렬 불일치 | 계속하기 504px, 나머지 456px. 안내 두 줄은 왼쪽 정렬 | 폭·간격 통일, 안내 가운데 정렬 |
| 글꼴·색이 웹과 다름 | 제목 Hahmlet 300 32px `(226,223,217)`, 버튼 20px, 안내 16px `(157,160,160)` | 제목 = 웹 공통 제목 띠(40px `title_eye_medallion_20261031` + 24px Hahmlet 300 `#e6e3dc` 자간 .04em + 은빛 헤어라인). 버튼 Hahmlet 400 15~18px `#e6e3dc`(선택 `#f2f0ec`) 자간 .16em. 안내 Hahmlet 400 13~14px `#a7a49d`, 영문·키는 Cinzel |

`DrawSettingsA15`·`DrawQuit`도 같은 규칙을 쓰는지 확인한다. 웹 기준: `silver-hell-ui-kit.css`, [UI_COMPOSITION](../3.1%20ui%20hud%20디자인/UI_COMPOSITION_20260925.md) 2026-10-31(제목 띠)·2026-11-02(실습창 마감) 절.

## 2. 인벤토리 제목

Unity 인벤토리의 "인벤토리" 제목과 눈 메달이 상단 공통 탭 바 `대장간 [G]` 아래를 덮는다. 웹과 같게 제목·메달만 빼고, 전투력·악의오브·닫기 줄은 유지한다(웹 머리 줄 최소 높이 44px).

## 완료 조건

- 실제 Unity 플레이어에서 일시정지·종료 확인·인벤토리를 1920×1080·1600×900으로 캡처해 before/after·1x 크롭으로 직접 판정한다. 기준은 "웹 실버 헬 창 옆에 놓아도 같은 게임처럼 보이는가".
- 키보드 탐색(↑↓·Enter·ESC·TAB)과 포커스 표시가 그대로 동작한다.
- 컴파일·테스트 통과만으로 완료라고 하지 않는다. 결과는 이 문서 아래에 이어서 기록한다.

## 3. 인벤토리 "쓰레기 전부 분해" 미이식 (2026-11-03 사용자: "전체 쓰레기 지정 다음 지정 전체 분해가 안 뜨냐 왜", "그대로 웹버전 이식하라고 했을텐데")

### 원인 (`unity/main` cbdcbc28)

- 웹(`game.html` renderInv): `#invJunkSelBtn`을 누르면 즐겨찾기를 뺀 가방 전부가 `junk=true`가 된다. 다시 그리면 `#invJunkBtn` "쓰레기 전부 분해 (N개 -> 악의오브 +T)"가 나타나고, `gameConfirm`을 거쳐 가방에서 제거하고 `G.mats += T`를 더한다. 2026-11-03 실제 웹 게임에서 확인: 6개 지정 → "쓰레기 전부 분해 (6개 -> 악의오브 +6000)".
- Unity `NativeInventoryDock.cs` `DrawActionRow`에는 **지정 버튼만** 옮겨져 있다. 분해 버튼·확인창·분해값 공식(`salvageVal`)이 없다. 같은 줄의 단일 분해 버튼도 `"분해 (악의오브+미이식)"` 자리표시로 남아 있고, 코드 주석에 `salvage ... not ported, shape only`라고 적혀 있다. 선택분해(`#invSalvageBtn`)도 없다.
- 그래서 지정을 누르면 `n==0`이 되어 지정 버튼마저 사라지고, 줄에 아무것도 남지 않는다.

### 이식 패치 (컴파일·실기 미검증 — Unity 세션이 적용 후 검수)

**Core `InventoryState.cs`** (클래스 안에 추가):
```csharp
  // Web salvageVal (game.html): base by economy rarity (_itemEconomyRarity = min(r,4), negative -> 0)
  // + 50% of the legacy per-level enhance cost (truncated, web ~~) + tier*2.
  // The web _enhRefund (legacy migrated items) has no Unity field; Unity items never carry it.
  static readonly int[] SalvageBase={1000,2000,10000,20000,50000};
  static readonly double[] SalvageRarityMul={0.5,0.7,1.0,1.3,1.8};
  public static int SalvageValue(InventoryItem it){
   if(it==null)return 0;int r=it.rarity>=0?Math.Min(it.rarity,4):0;int refund=0;
   if(it.enh>0){double total=0;for(int i=0;i<it.enh;i++)total+=Math.Ceiling(Math.Max(1,Math.Ceiling((1+i*0.15)*1.5))*SalvageRarityMul[r]);refund=(int)(total*0.5);}
   return SalvageBase[r]+refund+it.tier*2;
  }
  public List<InventoryItem> JunkItems(){var list=new List<InventoryItem>();foreach(var it in Bag)if(it!=null&&it.junk&&!it.fav)list.Add(it);return list;}
  // Web invJunkBtn: favorites excluded, equipped items are never in Bag. Returns the orbs gained.
  public int SalvageJunk(out int count){
   count=0;int total=0;
   for(int i=Bag.Count-1;i>=0;i--){var it=Bag[i];if(it==null||!it.junk||it.fav)continue;total+=SalvageValue(it);Bag.RemoveAt(i);count++;}
   if(count>0&&Selected!=null&&!Owns(Selected))Selected=null;
   return total;
  }
```

**`NativeInventoryDock.cs` `DrawActionRow`** — 맨 끝의 `int n=0;...` 블록을 아래로 바꾼다:
```csharp
            var junkList=State.JunkItems();
            int n=0;foreach(var b in State.Bag)if(!b.junk&&!b.fav)n++;
            if(n==0&&junkList.Count==0)return;
            int tot=0;foreach(var j in junkList)tot+=InventoryState.SalvageValue(j);
            // Web flex row: invJunkSelBtn (nonJunk>0) then invJunkBtn (junk>0), centred together in the remaining width.
            string sel=n>0?"전체 쓰레기 지정 ("+n+"개)":null;
            string jk=junkList.Count>0?"쓰레기 전부 분해 ("+junkList.Count+"개 -> 악의오브 +"+tot+")":null;
            float sw=sel!=null?TextWidth(sel,12,500)+28:0,kw=jk!=null?TextWidth(jk,12,500)+28:0,gap=sel!=null&&jk!=null?8:0;
            float x=startX+(1882-startX)/2f-(sw+gap+kw)/2f;
            if(sel!=null&&PlateButton(new Rect(x,1004,sw,34),sel,12)){foreach(var b in State.Bag)if(!b.fav)b.junk=true;}
            if(jk!=null&&PlateButton(new Rect(x+sw+gap,1004,kw,34),jk,12,true))junkConfirm=true;
```

**`NativeInventoryDock.cs`** — 확인창(웹 `gameConfirm` 문구 그대로)을 추가한다:
```csharp
        bool junkConfirm;
        void DrawJunkConfirm(){
            if(!junkConfirm)return;
            var junkList=State.JunkItems();if(junkList.Count==0){junkConfirm=false;return;}
            int tot=0;foreach(var j in junkList)tot+=InventoryState.SalvageValue(j);
            Fill(new Rect(0,0,1920,1080),C(0,0,0,.55f));
            var box=new Rect(660,380,600,300);NativeSilverHellUi.Panel(box,52,18);
            Txt(new Rect(box.x+40,box.y+52,box.width-80,28),"쓰레기 "+junkList.Count+"개를 일괄 분해합니다.",16,C(230,227,220),400,TextAnchor.MiddleCenter,true);
            Txt(new Rect(box.x+40,box.y+86,box.width-80,28),"악의오브 +"+tot+" 획득.",16,C(230,227,220),400,TextAnchor.MiddleCenter,true);
            Txt(new Rect(box.x+40,box.y+132,box.width-80,22),"중요잠금 아이템은 제외됩니다.",13,C(167,164,157),400,TextAnchor.MiddleCenter,true);
            Txt(new Rect(box.x+40,box.y+158,box.width-80,22),"복구 불가!",13,C(194,26,16),400,TextAnchor.MiddleCenter,true);
            if(PlateButton(new Rect(box.x+86,box.yMax-76,200,40),"취소",14))junkConfirm=false;   // web: cancel left, confirm right
            if(PlateButton(new Rect(box.xMax-286,box.yMax-76,200,40),"확인",14,true)){
                int count;int gained=State.SalvageJunk(out count);
                var g=NativeGame.Instance;if(g!=null&&g.Simulation!=null)g.Simulation.Materials+=gained;
                junkConfirm=false;AfterOwnershipChange();
            }
        }
```

**`DrawDock`** — 확인창이 떠 있는 동안 아래 창 입력을 막는다:
```csharp
            bool en=GUI.enabled;if(junkConfirm)GUI.enabled=false;
            ... 기존 DrawWindow ~ DrawActionRow ...
            GUI.enabled=en;DrawJunkConfirm();
            GUI.matrix=old;
```

**`NativeInventory.Keyboard.cs` `PollKeys`** — `WaitingForRelease` 검사 바로 다음에 넣는다(확인창의 ESC는 인벤토리를 닫지 않고 확인창만 닫는다):
```csharp
   if(junkConfirm){if(ExoInput.KeyDown(KeyCode.Escape)){junkConfirm=false;Navigation.Fence();}return false;}
```

### 남은 미이식 (같은 줄)

- 단일 분해 `"분해 (악의오브+미이식)"` → 위의 `SalvageValue`로 웹 `"분해 (악의오브+N)"`과 같은 동작으로 바꾼다.
- 선택분해 `#invSalvageBtn`(Ctrl 다중 선택 `_invSalSel`) 없음.
- 웹 버튼은 현재 필터(`filtered`) 범위만 대상으로 하고, Unity는 가방 전체를 대상으로 한다(기존 지정 버튼과 같음). 필터 이식 때 함께 맞춘다.
- 분해 효과음 `ui_salvage`, 즉시 저장(`dbSaveNow`)은 Unity 저장 범위에 맞춰 연결한다.

### 검수

- 전/후 캡처(1920×1080·1600×900, 1x 크롭): 지정 → 분해 버튼 표시 → 확인창 → 악의오브 증가·가방 제거.
- `SalvageValue`를 웹 `salvageVal`과 대조한다. rarity 0~5, enh 0/1/5/20, tier 0~7 조합의 oracle 테스트를 Core 테스트에 추가.

## 4. 진행 기록 — 2026-11-03 클라우드 세션 (코드 적용·Core 검증 완료, Unity 컴파일·실기 판정 미실시)

- 상태: **기능·코드 완료, 디자인 미검수.** 이 세션도 Linux 클라우드라 Unity 편집기가 없고, PC(DESKTOP-R2F12NG)의 Remote Control 폴더도 클라우드에 열려 있지 않아 붙이지 못했다. 전체 `unity/main` fetch는 디스크 한도로 실패해 blob 없는 얕은 fetch + sparse checkout으로 필요한 C#만 받아 작업했다.
- Unity 커밋: `claude/unity-pc-inv-salvage-20261103` **85ca8fd9cf5286a28d652bf968a8e11460197149** (부모 `unity/main` 9dc27dea5). `unity/main` 대상 PR로 올린다.

### 4.1 바꾼 것

| 항목 | 파일 | 내용 |
|---|---|---|
| 분해값·일괄 분해 Core | `Runtime/Core/InventoryState.cs` | `SalvageValue`(웹 `salvageVal`), `JunkItems`, `JunkSalvageTotal`, `SalvageJunk(out count)`, `SalvageOne`(웹 `dropItem`: 즐겨찾기 거부, 다음 선택 `min(idx,len-1)`) |
| 버튼 줄 | `NativeInventoryDock.cs` `DrawActionRow` | 단일 `분해 (악의오브+N)` 동작(1초 반복 방지). `전체 쓰레기 지정 (N개)`·`쓰레기 전부 분해 (N개 -> 악의오브 +T)`를 웹 flex 줄처럼 남은 폭 가운데에 함께 배치 |
| 확인창 | `NativeInventory.JunkSalvage.cs`(신규) | 웹 `gameConfirm` 문구 4줄(빈 줄 포함). `web-uiux.css` `#gcModal` 규격: 배경 검정 .72, panel_frame 150/52px/18px, 안쪽 여백 38/42, Hahmlet 400 17px `#e6e3dc`, 줄높이 1.7, 버튼 btn_plaque 0 174/32px/8px·최소 128×44·간격 16, 취소 왼쪽·확인 오른쪽, 확인만 옅은 진홍 빛, 포커스 1px `#e6e3dc`+검은 테. 악의오브 줄에 화폐 오브 20px |
| 확인창 입력 | `NativeInventoryDock.cs` `DrawDock`, `NativeInventory.Keyboard.cs`, `NativeGame.cs` | 확인창이 뜨면 아래 창 `GUI.enabled=false`. 키보드 Tab/←/→ 포커스(시작은 취소), Enter 실행, ESC는 확인창만 닫고 `Fence`. 확인창이 열린 동안 G·K 등 창 단축키도 먼저 처리하지 않는다. 창을 닫거나 저장을 복원하면 확인창도 닫힌다 |
| 악의오브 | 위 파일 | `Simulation.AddMalice(gained)`(웹 `G.mats+=`), 이어서 기존 `changed()` 경로로 저장 요청(웹 `dbSaveNow`) |
| 인벤토리 제목 | `NativeInventoryDock.cs` | `NativePanelTitle.Draw(... "인벤토리")` 제거. 전투력·악의오브·닫기 줄 유지 |
| 일시정지 메인·종료 확인 | `NativePauseMenu.cs`, `NativePauseMenu.SilverHell.cs`(신규) | 아래 원인 표대로 다시 그림 |
| 회색 사각형 | `NativePauseMenu.Keyboard.cs` `MetalAction` | 글자 스타일을 `GUIStyle.none`에서 만든다 |
| 공용 도구 | `NativeLobby.SilverHell.cs` `NativeSilverHellUi` | `PrimaryGlow`(.gc-ok drop-shadow), `Latin()`(Cinzel), `SpacedLabel`/`SpacedWidth`(CSS letter-spacing) |
| oracle | `unity/Tools/salvage-oracle/` | `export.cjs`가 game.html의 `_itemEconomyRarity`·`salvageVal`을 앵커로 찾아 VM 실행 → `oracle.json` 214건. `Program.cs`가 Core와 대조 + 일괄/단일 분해 규칙 12건 |

### 4.2 일시정지 원인 — 확인 결과

| 1절 가설 | 확인 | 처리 |
|---|---|---|
| 판 뒤 회색 사각형 = 원화 알파/import | **아님.** `btn_plaque_20261029`·`btn_primary_composed`·`guide_button_glow` 모두 RGBA, 모서리 알파 0, `.meta` alphaIsTransparency 1·무압축 | — |
| 판 뒤 회색 사각형 = 다른 원인 | **확정.** `MetalAction`이 글자 스타일을 `new GUIStyle(button)`(= `GUI.skin.button` 복제)로 만들어, 글자를 그릴 때 Unity 기본 버튼 배경이 판 크기 그대로 그려졌다 | `GUIStyle.none` 기반 |
| 전체 회색 흐림 | 코드상 확정: 포커스 없음·키 해제 대기 동안 `GUI.enabled=false` → IMGUI 비활성 틴트 + 글자 `Dim` | 메인·종료 확인은 정상 대비로 그리고, 그동안 포인터 이벤트를 소비해 입력만 막는다. A15 설정 창은 기존 처리 유지 |
| 글꼴·크기 | **추가 원인.** 메인 화면이 1280×720 설계 공간이라 1080p에서 1.5배: 제목 32→48px, 버튼 20→30px, 안내 16→24px로 웹 규격의 약 2배 | 1920×1080 설계 공간에서 웹 px 그대로: 제목 = 공통 제목 띠(`NativePanelTitle`, 40px 메달 + Hahmlet 300 22px + 금빛 헤어라인), 버튼 Hahmlet 400 17px 자간 .16em `#e6e3dc`(선택·주 버튼 `#f2f0ec`), 안내 Hahmlet 400 14px `#a7a49d` 가운데, Enter·ESC·TAB은 Cinzel 13px |
| 계속하기 = 진홍 판 통째 | 확정 | 모든 버튼 은빛 판. 주 버튼(계속하기·종료)만 옅은 진홍 빛. 선택은 밝기 1.18 + 기존 guide_button_glow |
| 버튼 폭 504/456·안내 왼쪽 정렬 | 확정 | 모두 360×44, 간격 14. 종료 확인 두 버튼 172×44, 간격 16 |

창은 `#gcModal`처럼 panel_frame 150/52px/18px, 안쪽 여백 38/42, 폭 520이다. 공통 탭 바(설정 위치)는 그대로 둔다. 키보드 탐색은 기존 `PauseNavigation` 인덱스(메인 0~3, 종료 확인 0 취소·1 종료)를 그대로 쓴다.

### 4.3 검증한 것 / 하지 않은 것

- **Core oracle (dotnet 8, Unity 아님): 226 checks / 0 failures.** 변이 검사(강화 환불 절사를 반올림으로 바꿈) → 226 중 27 실패, 되돌림. 원본 game.html sha256 `d2976ef5…4eb4c8162`, `salvageVal` 28601-28615줄.
- **근사 컴파일:** Roslyn 4.8 + NuGet `UnityEngine.Modules` 2021.3.33 참조로 Runtime 전체를 올리고, 바꾼 11개 파일의 의미 오류만 조회 → 0건(남은 1건은 URP 패키지 미참조로 생기는 기존 `NativeGame.cs` 55행). 일부러 넣은 오류는 잡힘을 확인했다. **Unity 6000.6.7f1 실제 컴파일이 아니다.**
- **하지 않음:** Unity 컴파일, Player 실행, 1920×1080·1600×900 전/후 캡처, 1x 크롭 판정, 실제 키보드 동작. 디자인 판정 전이다.

### 4.4 PC Unity 세션이 이어서 할 일

1. `G:/exoduser-wt/…`의 Unity 작업본에서 `origin/claude/unity-pc-inv-salvage-20261103`을 받아 Unity 6 컴파일 오류를 확인한다.
2. 인벤토리: 지정 → 분해 버튼 표시 → 확인창(마우스·Tab/←→/Enter/ESC) → 악의오브 증가·가방 제거. 1920×1080·1600×900 전/후와 1x 크롭. 제목 제거 뒤 상단 탭 `대장간 [G]`이 가리지 않는지 본다.
3. 일시정지 메인·종료 확인: 전/후 캡처와 1x 크롭. 기준은 "웹 실버 헬 창 옆에 놓아도 같은 게임처럼 보이는가". 특히 Hahmlet·Cinzel이 Player에 실제로 들어가는지, 자간 그리기의 글자 사이가 고른지, 판 뒤에 회색 사각형이 남지 않는지 본다.
4. 판정 결과(PASS/RETOUCH·결함·캡처 경로)를 이 문서 아래에 잇고, `unity/main` PR을 갱신한다.

### 4.5 남은 미이식

- 확인창의 웹 `_glyph('trash')`·`_glyph('warn')` 벡터 아이콘은 Unity 대응 원화가 없어 그리지 않았다(악의오브 아이콘만 있음).
- 분해 효과음 `ui_salvage`: Unity 대응 소리 없음.
- 선택분해 `#invSalvageBtn`(Ctrl 다중 선택), 필터 범위(`filtered`) 적용: 필터 이식 때 함께.
- 대장간 분해 탭의 `NativeForgeData.SalvageValue`(데이터 표 인자형)는 그대로다. Core `InventoryState.SalvageValue`와 값은 같으며 하나로 합치는 것은 대장간 분해 실행 이식 때 한다.
