# 로비 풀 코드 (index.html 패치)

세 군데에 넣으면 끝. 다른 거 손대지 말 것.

================================================================
[1] CSS 추가
================================================================

위치: index.html에서 `/* ── 로비 CSS: 2단계에서 새로 작성 ── */` 주석 찾아서 그 다음 줄에 통째로 붙여넣기.

```css
/* ── 로비 CSS ── */
.lobby{display:none;position:fixed;inset:0;z-index:10;flex-direction:row;background:#000}
.lobby.show{display:flex}

/* 좌측 영역 */
.lobby-left{position:relative;flex:0 0 65%;height:100%;overflow:hidden;background:#000}
.lobby-bg-img{position:absolute;inset:0;background-position:left center;background-size:cover;background-repeat:no-repeat;opacity:1;transition:opacity 400ms ease}
.lobby-bg-img::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,0) 50%,rgba(0,0,0,0.55) 90%,rgba(0,0,0,0.85) 100%);pointer-events:none}
.char-disp-empty{position:absolute;left:50%;bottom:8%;transform:translateX(-50%);color:rgba(220,110,80,0.78);font-family:'Cinzel Decorative',serif;font-size:clamp(1.6rem,2.6vw,2.8rem);font-weight:300;letter-spacing:0.25em;text-shadow:0 0 28px rgba(196,68,68,0.35),0 0 60px rgba(0,0,0,0.7);white-space:nowrap;pointer-events:none;user-select:none;opacity:1;transition:opacity 500ms ease;z-index:2}
.char-disp-empty.hidden{opacity:0}

/* 우측 영역 */
.lobby-right{position:relative;flex:0 0 35%;height:100%;background:linear-gradient(180deg,rgba(20,8,5,0.92) 0%,rgba(8,4,2,0.96) 100%);padding:28px 28px 24px 28px;display:flex;flex-direction:column;backdrop-filter:blur(2px);border-left:2px solid;border-image:linear-gradient(180deg,#443322 0%,#c44444 50%,#443322 100%) 1}

/* 우측 헤더 */
.lobby-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px}
.lobby-header h1{font-family:'Cinzel Decorative',serif;color:#ff6633;font-size:1.8rem;letter-spacing:0.15em;text-shadow:0 0 20px rgba(255,80,30,0.4)}
.lobby-mode{color:rgba(180,140,110,0.55);font-size:0.72rem;letter-spacing:0.3em;font-weight:700;margin-top:8px}

/* 헤더 아래 장식 라인 */
.lobby-divider{height:1px;width:100%;background:linear-gradient(90deg,transparent 0%,rgba(196,68,68,0.4) 50%,transparent 100%);margin-bottom:18px}

/* 슬롯 리스트 */
.char-list{flex:1;overflow-y:auto;overflow-x:hidden;padding-right:6px}
.char-list::-webkit-scrollbar{width:4px}
.char-list::-webkit-scrollbar-track{background:rgba(0,0,0,0.3)}
.char-list::-webkit-scrollbar-thumb{background:rgba(196,68,68,0.3);border-radius:2px}
.no-chars{color:rgba(180,140,110,0.5);text-align:center;padding:40px 20px;font-size:0.9rem;letter-spacing:0.1em}

/* 슬롯 카드 */
.char-item,.char-item-new{position:relative;display:flex;align-items:center;gap:14px;height:84px;padding:14px 18px 14px 24px;margin-bottom:10px;background:linear-gradient(135deg,rgba(28,16,12,0.7) 0%,rgba(18,10,6,0.85) 100%);border:1px solid rgba(120,60,40,0.18);border-radius:2px;cursor:pointer;transition:all 200ms ease;overflow:hidden}
.char-item::before{content:'';position:absolute;left:0;top:20%;width:3px;height:60%;background:linear-gradient(180deg,transparent 0%,rgba(196,68,68,0.4) 50%,transparent 100%);opacity:0.6;transition:all 300ms ease}
.char-item:hover{transform:translateY(-2px);border-color:rgba(196,68,68,0.35);box-shadow:0 4px 16px rgba(0,0,0,0.5),0 0 12px rgba(196,68,68,0.1)}
.char-item:hover::before{opacity:1;height:80%;top:10%}
.char-item.active{border-color:rgba(196,68,68,0.5);box-shadow:0 0 20px rgba(196,68,68,0.2),inset 0 0 24px rgba(196,68,68,0.05)}
.char-item.active::before{width:4px;opacity:1;height:90%;top:5%;background:linear-gradient(180deg,rgba(196,68,68,0.2) 0%,rgba(255,100,80,0.95) 50%,rgba(196,68,68,0.2) 100%);box-shadow:0 0 8px rgba(196,68,68,0.6)}

/* 새 캐릭터 카드 */
.char-item-new{border:1px dashed rgba(120,60,40,0.4);background:rgba(18,10,6,0.4)}
.char-item-new:hover{border-color:rgba(196,68,68,0.5);background:rgba(28,14,8,0.5);transform:translateY(-2px)}

/* 썸네일 */
.char-thumb{flex:0 0 56px;width:56px;height:56px;background:rgba(0,0,0,0.4);border:1px solid rgba(120,60,40,0.3);border-radius:2px;display:flex;align-items:center;justify-content:center;overflow:hidden}
.char-thumb-empty{color:rgba(180,140,110,0.4);font-size:1.6rem;font-weight:300}

/* 텍스트 영역 */
.char-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.char-name{color:rgba(230,200,170,0.95);font-size:1.05rem;font-weight:600;letter-spacing:0.05em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.char-info{color:rgba(180,140,110,0.9);font-size:0.78rem;opacity:0.7;letter-spacing:0.06em}

/* 삭제 버튼 */
.char-del{position:absolute;right:10px;top:50%;transform:translateY(-50%);width:24px;height:24px;background:transparent;border:1px solid rgba(120,60,40,0.4);color:rgba(180,100,80,0.6);font-size:0.85rem;cursor:pointer;border-radius:2px;opacity:0;transition:all 200ms;display:flex;align-items:center;justify-content:center}
.char-item:hover .char-del{opacity:1}
.char-del:hover{border-color:rgba(220,80,60,0.7);color:rgba(255,120,100,0.95);background:rgba(120,30,20,0.2)}

/* 입장 버튼 */
.lobby-footer{margin-top:14px;display:flex;flex-direction:column;gap:10px}
.enter-game-btn{width:100%;height:56px;background:linear-gradient(135deg,rgba(120,40,30,0.4) 0%,rgba(80,20,15,0.6) 100%);border:1.5px solid rgba(196,68,68,0.4);color:rgba(255,200,170,0.95);font-family:'Noto Sans KR';font-size:1.1rem;font-weight:700;letter-spacing:0.3em;cursor:pointer;transition:all 300ms ease;text-shadow:0 0 12px rgba(0,0,0,0.8)}
.enter-game-btn:hover:not(:disabled){border-color:rgba(255,100,80,0.8);color:rgba(255,230,200,1);background:linear-gradient(135deg,rgba(150,50,40,0.5) 0%,rgba(100,25,20,0.7) 100%);box-shadow:0 0 24px rgba(196,68,68,0.4),inset 0 0 16px rgba(196,68,68,0.1);transform:translateY(-1px)}
.enter-game-btn:disabled{opacity:0.35;cursor:not-allowed;border-color:rgba(120,60,40,0.3);color:rgba(180,140,110,0.5)}

/* 작은 화면 대응 */
@media(max-width:1100px){
  .lobby-left{flex:0 0 55%}
  .lobby-right{flex:0 0 45%}
}
```


================================================================
[2] HTML 추가
================================================================

위치: index.html 281줄 `<div class="lobby" id="lobby" ...>` 와 그 다음 `</div>` 사이.
주석 `<!-- 로비 UI: 2단계에서 새로 작성 -->` 를 아래 통째로 교체.

```html
<!-- 좌측: 배경 + 안내 -->
<div class="lobby-left">
  <div class="lobby-bg-img" id="lobbyBgImg"></div>
  <div class="char-disp-empty" id="charDispEmpty">당신은 누구인가</div>
</div>

<!-- 우측: 슬롯 + 버튼 -->
<div class="lobby-right">
  <div class="lobby-header">
    <h1>HELL</h1>
    <div class="lobby-mode">LOCAL MODE</div>
  </div>
  <div class="lobby-divider"></div>
  <div class="char-list" id="charList">
    <div class="no-chars">불러오는 중...</div>
  </div>
  <div class="lobby-footer">
    <button class="enter-game-btn" id="enterGameBtn" disabled>입장</button>
  </div>
</div>
```


================================================================
[3] JS _updateCharDisplay 함수 교체
================================================================

위치: index.html 994줄 근처 `function _updateCharDisplay(s){` 부터 닫는 `}` 까지 통째로 교체.

```javascript
function _updateCharDisplay(s){
  const btn=$('enterGameBtn');
  const empty=$('charDispEmpty');
  const bg=$('lobbyBgImg');
  if(!s){
    if(btn) btn.disabled=true;
    if(empty) empty.classList.remove('hidden');
    _swapLobbyBg(0);
    return;
  }
  if(btn) btn.disabled=false;
  if(empty) empty.classList.add('hidden');
  _swapLobbyBg(s.stage||0);
}

let _curBg=null;
function _swapLobbyBg(stage){
  const bg=$('lobbyBgImg');if(!bg)return;
  const hell=Math.min(6,~~((stage||0)/10));
  const key=hell===0?'frost':(hell===1?'flame':'abyss');
  if(_curBg===key)return;
  _curBg=key;
  const url='assets/lobby/lobby_bg_'+key+'.webp';
  bg.style.opacity='0';
  setTimeout(()=>{
    bg.style.backgroundImage="url('"+url+"')";
    bg.style.opacity='1';
  },200);
}
```


================================================================
[4] 로비 진입시 디폴트 배경 트리거
================================================================

위치: index.html `loadLocalCharacters` 함수의 `_renderSlotList();` 줄 바로 다음에 한 줄 추가.

찾기:
```javascript
    _localSlots=j.ok&&j.slots?j.slots:[];
    _renderSlotList();
```

뒤에 한 줄 추가:
```javascript
    _localSlots=j.ok&&j.slots?j.slots:[];
    _renderSlotList();
    _updateCharDisplay();
```


================================================================
[5] CSS 13줄 `.lobby{display:none}` 한 줄 제거
================================================================

`.lobby{display:none}` 한 줄을 찾아서 삭제. (위 [1]의 새 CSS에서 다시 정의했음)

또한 [1]의 `.lobby.show{display:flex}` 가 새로 추가됐으므로, 기존 코드에서 `$('lobby').style.display='flex'` 로 직접 설정하는 부분은 그대로 두면 됨 (display:flex가 inline style로 들어가서 정상 동작).
