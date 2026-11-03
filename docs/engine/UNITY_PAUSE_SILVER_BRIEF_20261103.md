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

## 4. Mac 적용 기록 (2026-11-03, PC UI 총괄 Mac 세션)

- 출처: 이 문서는 main 쪽 `claude/festive-darwin-jrf8hy` 81fdafbb의 브리프를 `unity/main` 작업 브랜치 `claude/unity-pc-inv-salvage-20261103`로 그대로 옮긴 것이다. 아래부터 Unity 적용 결과를 이어 쓴다.
- 시작점: `unity/main` 34ce305e. 브리프 기준 cbdcbc28과 대상 파일(`NativeInventoryDock.cs`·`NativePauseMenu*.cs`·`InventoryState.cs`) 차이 0.
- 작업본: `/Users/fordeargamers/exoduser-wt/UNITY-INV-SALVAGE-20261103`, 산출물 `/Users/fordeargamers/exoduser-wt/_out/UNITY-INV-SALVAGE-20261103/`.
- 기존 공식 확인: 브리프의 분해값 공식은 Unity 대장간 `ForgeFormulas.SalvageValue`(`NativeForgeData.cs`, 표 `forge_web.json` valueTable)와 같다. 대장간 쪽도 실제 분해 동작은 없다.

### 4.1 전/후 캡처 고정 장치

`--unity-ui-finish-capture -output <dir> -ui-phase pause,inventory`에 인벤토리 단계를 추가했다. 1920×1080·1600×900마다 인벤토리 열림, 가방 아이템 선택, 가방 전체 쓰레기 지정 화면을 찍고 junk 표시와 선택은 원래대로 돌린다. 일시정지는 기존 `pause` 단계(보조메뉴·종료확인·ESC 설정 직행)를 쓴다. 같은 장치로 변경 전 빌드와 변경 후 빌드를 찍는다.

첫 실행(빌드 76fd7aa2)에서 이 장치의 일시정지·인벤토리 화면 12장이 모두 로비로 찍혔다. 장치가 시작 연출 상태를 건너뛰지 않아 `EnterNativeTest` 뒤에도 로비가 남았다. UI 겹침 검사와 같은 진입 순서(`StartupCaptureState.Skip` → `SelectPreview` → `EnterNativeTest` → 입력 울타리 해제·실습 종료)로 고치고, 로비가 남으면 실패로 센다. 처음 두 빌드 시도는 작업본에 로비 영상 2개(`Tools/restore-lobby-media.cjs`, `Tools/restore-warrior-story.cjs`)가 없어 `VerifyLobby`에서 멈췄고, 바이트 동일 복원 뒤 성공했다.
