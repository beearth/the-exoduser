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

### 4.2 적용 내용

**1) 쓰레기 전부 분해 (브리프 3절)**

| 위치 | 변경 |
|---|---|
| Core `InventoryState.cs` | `SalvageValue(it,table=null)`(웹 `salvageVal` 그대로, 기본 표 = 웹 `[1000,2000,10000,20000,50000]`), `JunkItems()`, `SalvageJunk(out count)`(즐겨찾기 제외, 웹처럼 선택 해제), `SalvageOne(it)`(웹 `dropItem`: 즐겨찾기 거부, 같은 인덱스 다음 칸 선택) |
| `NativeForgeData.cs` | `ForgeFormulas.SalvageValue`는 Core 함수에 `forge_web.json` 표를 넘기기만 한다. 공식은 한 곳 |
| `NativeInventoryDock.cs` 하단 줄 | 웹 flex 줄과 같이 `전체 쓰레기 지정 (N개)`·`쓰레기 전부 분해 (N개 -> 악의오브 +T)`를 함께 가운데 정렬. 분해 버튼은 웹 `#invJunkBtn` 색(바탕 rgba(196,36,24,.15)·테 #cc2d22·글자 #b8b5af) |
| 같은 줄 단일 분해 | 자리표시 `분해 (악의오브+미이식)` → `분해 (악의오브+N)` 실제 동작(확인창 없음·즐겨찾기 거부·1초 연타 방지) |
| 확인창 `DrawJunkConfirm` | 웹 `gameConfirm` 문구 4줄(휴지통·오브·경고 글리프 포함), 취소 왼쪽·확인 오른쪽, 은빛 판 버튼, 확인만 진홍 빛. 판은 `#gcModal .gc-box`처럼 실버 헬 테 + 흑철 바탕 |
| 입력 차단 | 확인창이 떠 있으면 마우스 이벤트는 확인창만 받고, 아래 창은 그리기만 한다. G/C/F10/K 창 전환 단축키도 막는다. ESC는 확인창만 닫는다(`PollKeys`) |
| 확인 결과 | 가방에서 제거, `Simulation.Materials += T`, `changed()`로 장비 재계산·저장 요청(웹 `dbSaveNow` 대응) |

**2) 인벤토리 제목 제거** — `DrawDock`의 `NativePanelTitle.Draw(...,"인벤토리")` 삭제. 전투력·악의오브·닫기 줄은 그대로다. 탭 바 `대장간 [G]`가 온전히 보인다.

**3) 일시정지 실버 헬 마감 (브리프 1절)** — 원인 가설 5개를 화면으로 확인했다.

| 증상 | 확인된 원인 | 변경 |
|---|---|---|
| 판 전체 회색 흐림 | (a) 보조메뉴·종료확인에 `GUI.enabled=false` 비활성 틴트 (b) 판 바탕이 RGB ~62 회색. 코드로 만든 그라데이션 텍스처와 `GUI.color`가 Linear Player에서 sRGB 변환 없이 그려져 웹 #0c0b0c가 62로 나왔다(픽셀 측정) | (a) 그리기는 정상 대비, 클릭만 `inputLive`로 막음. 설정 페이지는 기존 게이트 유지 (b) `NativeSilverHellUi.Panel(...,iron:false)` 새 선택 인자: 웹 `.sh-framed` 바탕을 Linear 보정값으로 칠함. 측정 13/13/13 |
| 버튼판 뒤 회색 사각형 | `MetalAction` 글자 스타일이 `GUI.skin.button`을 복사해 기본 버튼 배경을 함께 그렸다 | 글자는 `GUIStyle.none` 기반 자간 글자 |
| 계속하기 = 진홍 판 통째 | `btn_primary_composed` | 은빛 `btn_plaque` + 작은 진홍 빛(웹 `.gc-ok` drop-shadow). 종료확인의 `종료`도 같은 규칙 |
| 폭·정렬 불일치 | 504/456, 안내 왼쪽 정렬 | 네 버튼 456×56·간격 18, 은빛 구분선, 안내 두 줄 가운데 |
| 글꼴·색 | 제목 32px 단독 라벨, 버튼 20px | 제목 = Unity 공통 제목 띠 `NativePanelTitle`(눈 메달·헤어라인), 버튼 Hahmlet 400 17px 자간 .16em `#d6d3cd`(선택·주 버튼 `#f2f0ec`), 안내 Hahmlet 400 14/13px `#a7a49d` |

공용 `Panel`의 기본값(`iron:true`)과 공용 `ActionPlate`는 바꾸지 않아 로비·다른 창은 그대로다.

### 4.3 검수 결과 (Mac, Unity 6000.6.7f1 StandaloneOSX ARM64)

| 항목 | 결과 |
|---|---|
| 변경 전 빌드 | 소스 `8c1e1d47`, Succeeded·오류 0, 6,446,262,926 B (`_out/.../b1b-before`) |
| 최종 빌드 | 아래 커밋 소스와 동일한 작업본, Succeeded·오류 0·C# error 0, 6,446,270,606 B (`_out/.../b5-after`). 중간 b2~b4는 눈 검수 수정 반복 |
| 마감 캡처 장치 `pause,inventory` | 1920·1600 각 16항목 PASS·실패 0. 확인창 표시, 확인창 ESC는 확인창만 닫음(인벤토리 유지), 쓰레기 10개 분해 악의오브 +20000(기대 +20000, 1000→21000), 가방 10→0 |
| Core `--salvage-only` | 9/9 PASS. 웹 `salvageVal` oracle 224행 불일치 0(`unity/Tools/inv-salvage-oracle`, main `30bc2e2ceb`) |
| `--unity-inventory-keys-smoke` | 17/17 PASS. 단 프로세스가 스스로 끝나지 않아 300초에 종료. 변경 전 빌드도 같다(기존 동작) |
| `--unity-pause-input-check` | 첫 단계 `일반 미리보기 진입`에서 FAIL. 변경 전 빌드도 같은 단계에서 같은 FAIL(기존 결함, 이 변경과 무관). 일시정지 키 경로는 마감 캡처 장치의 PASS 4항목(종료확인 진입·취소 복귀·ESC 설정 직행·두 번째 ESC 재개)으로만 확인 |
| 눈 검수 | 1920×1080·1600×900 전/후 18장과 1x 크롭(`_out/.../crops`)을 직접 봤다. 흑철 판·은빛 테·은빛 판 버튼·작은 진홍 강조로 웹 실버 헬 창과 같은 계열. 개발 상태 문구 노출 0. **판정: PASS** |

전/후 대표 파일: `b1b-before/cap/Unity_일시정지_보조메뉴_1920.png` ↔ `b5-after/cap/Unity_일시정지_보조메뉴_1920.png`, `b1b-before/cap/Unity_인벤토리_쓰레기지정_1920.png` ↔ `b5-after/cap/Unity_인벤토리_쓰레기일부_1920.png`·`…_분해확인_1920.png`·`…_분해후_1920.png` (모두 `/Users/fordeargamers/exoduser-wt/_out/UNITY-INV-SALVAGE-20261103/` 아래).

빌드 import가 만든 `.meta`·재질·씬·ProjectSettings 변경 860개와 새 파일 57개는 커밋하지 않았다. `build-generated.patch`·`build-generated-untracked.tar.gz`로 보존한 뒤 HEAD 바이트로 되돌렸다.

### 4.4 남은 일

- 선택분해(`#invSalvageBtn`, Ctrl 다중 선택) 미이식.
- 웹 버튼은 현재 필터 범위만 대상인데 Unity는 가방 전체가 대상이다. 필터 펼침 이식 때 맞춘다.
- 분해 효과음 `ui_salvage` 미연결(Unity 리소스 없음).
- **범위 밖 발견(중요)**: 이 Linear Player는 IMGUI `GUI.color`와 코드 생성 텍스처를 sRGB 변환 없이 그린다. 웹 색을 그대로 넣은 Unity 창 바탕들(인벤토리 등)이 웹보다 밝게 보이는 공통 원인일 가능성이 높다. 이번에는 일시정지·확인창 판만 보정했다. 전체 적용은 별도 단위로 측정 후 결정한다.
- `--unity-pause-input-check` 첫 단계 실패와 `--unity-inventory-keys-smoke` 미종료는 기존 결함이다. 이번에 고치지 않았다.

### 4.5 통합 (2026-11-03)

- 작업 기준이 오래된 원격 추적 ref(34ce305e)였다. 실제 `unity/main`은 9f0d00cf(지옥문 목표·기동 고리 등 7커밋)까지 나가 있었다. 최신 `unity/main`을 비강제로 병합했다(`10cbe2ff`). 겹친 파일은 `CHANGELOG_SYNC.md`(두 항목 모두 보존)와 `NativeGame.cs`(자동 병합)였다.
- 병합본을 다시 빌드했다(`b6-merged`): Succeeded·오류 0, 6,446,338,142 B. 마감 캡처 장치 1920·1600 16/16 PASS, 화면 동일.
- 지정 브랜치 이름 `claude/unity-pc-inv-salvage-20261103`에는 클라우드 세션 커밋 `85ca8fd9`(같은 세 작업, Unity 6 컴파일·Player 캡처 미실시)가 먼저 올라가 있었다. 남의 커밋을 덮어쓰지 않으려고 Mac 검수본은 `claude/unity-pc-inv-salvage-20261103-mac`으로 올리고, 이 브랜치만 `unity/main`에 병합한다. `85ca8fd9`은 병합하지 않았다. 내용이 이 기록과 겹치므로 보관 여부는 사용자가 정한다.

### 20:20 사망 UI 레인 공통 판 후속
Mac 3941b3ff8의3차 FAIL에 따라 공통 ActionPlate를 생성 텍스처/투명 blackTexture에서 실버 헬 --iron #0f0f10·알파1·비블렌딩 단색 판으로 교체한다. 선은 --sv-md/--sv-lt1px. 이 레인의 inputLive·Hahmlet 자간·제목/안내 배치는 보존하고 PrimaryGlow 바깥 번짐만 제거했다. §4.3의 PASS는 이전 Mac 검수본의 결과이며 새 공통 판의 시각 PASS를 뜻하지 않는다. 현재 계약/진단: UNITY_BUTTON_PLATE_MATERIAL_20261103.md, 새 판은 Mac 재검수 대기.

### 21:25 판 질감 RETOUCH
4차 Mac에서 공통 판 불투명13/13/13·1px·원화 비침0이 확인돼 기능은 유지한다. codex/unity-ui-plate-20261103은 #0f0f10 중심의 옅은 세로 명암·1px 경사/음각·선택 내부8px 진홍을 추가한다. 기존 inputLive·명조 자간·배치는 바꾸지 않는다. 점/노이즈/그레인/디더0. 새 질감은 Mac1920/3840 1x·3x 비교 전까지 RETOUCH다. 현재 수치: UNITY_BUTTON_PLATE_MATERIAL_20261103.md.

### 23:05 디자인총괄 원화 합격표가 우선
21:25 코드 판 RETOUCH는 폐기하고 공용 ActionPlate를 원래 btn_primary_composed/btn_plaque_20261029 9-slice로 복구한다. 밉맵OFF·밝기1.0, 호버 안쪽 빛만. 기본 IMGUI 스킨 배경은 제거하되 사용자 원화 배경은 보존한다. 일시정지 inputLive/명조/배치는 유지하고 primary 플래그를 주요 원화에 전달한다. 실제 합격은 새 Mac 비교판 대기다.
