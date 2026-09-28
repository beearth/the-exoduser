# 로비 풀 코드 (index.html 패치)

> 2026-09-28 로비 현행 변경: 기존 랜덤 전사 배경 및 선택 캐릭터 영상/포스터를 어깨 대검 전대 원화 1종으로 교체했다. 전신 `assets/lobby/lobby_ancestor_shoulder_v4.png`(1355×2503 RGBA), 데모/폴백 초상 `lobby_ancestor_portrait_v4.webp`(512×512). 아래 이전 로비 이미지·영상 계약은 제작 이력이며 현행 로비에는 적용하지 않는다. 캐릭터 생성 외형창·전투 시트는 별도 유지. 현행 규격/코드/QA: [로비 전대 원화 교체](<../3.1 ui hud 디자인/LOBBY_ANCESTOR_ART_20260928.md>).


과거 로비 패치 기록. 현재 정적 이미지 계약은 아래 2026-09-13 절을 우선한다. 기존 CSS를 통째로 재적용하지 않는다.

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
<div class="lobby-bg-img" id="lobbyBgImg"></div>
<video class="lobby-char-preview" id="lobbyCharPreview" muted loop playsinline></video>
<img class="lobby-char-preview lobby-char-keyart" id="lobbyCharKeyart" alt="" aria-hidden="true">
<div class="lobby-left">
  <div class="char-disp-empty" id="charDispEmpty">
    <div class="char-disp-title" id="charDispTitle">당신은 누구인가</div>
    <div class="char-disp-sub" id="charDispSub"></div>
  </div>
</div>

<!-- 우측: 슬롯 + 버튼 -->
<div class="lobby-right">
  <div class="lobby-header">
    <h1>HELL</h1>
    <div class="lobby-mode">LOCAL MODE</div>
  </div>
  <div class="lobby-divider"><img class="lobby-brand-logo" src="img/logo_exoduser.png" alt="EXODUSER" draggable="false"></div>
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
  const _bgs=[{k:'frost',e:'.png'},{k:'flame',e:'.png'},{k:'abyss',e:'.png'}];
  const pick=_bgs[~~(Math.random()*_bgs.length)];
  if(_curBg===pick.k)return;
  _curBg=pick.k;
  const url='assets/lobby/lobby_bg_'+pick.k+pick.e+'?v=20260913-lobby-detail2';
  bg.style.opacity='0';
  const tmp=new Image();
  tmp.onload=()=>{
    bg.style.backgroundImage="url('"+url+"')";
    setTimeout(()=>{ bg.style.opacity='1'; },50);
  };
  tmp.onerror=()=>{ bg.style.backgroundImage="url('"+url+"')"; bg.style.opacity='1'; };
  tmp.src=url;
}
```


================================================================
[4] 로비 진입시 디폴트 배경 트리거
================================================================

2026-09-28 현행: `loadLocalCharacters` 시작에서 이전 선택과 디폴트 배경을 초기화한다. 로딩이 끝나면 `_renderSlotList()`만 호출한다. 렌더 뒤 `_updateCharDisplay()`를 추가하던 이전 지침은 데모 자동 선택을 지우므로 폐기한다.

```javascript
  _selectedSlot=null;_selectedSlotName=null;_updateCharDisplay();
  // 기존 API 조회 또는 localStorage 폴백
  if(devNotice)devNotice.hidden=!_developerSlots;
  _renderSlotList();
}
```

================================================================
[5] CSS 13줄 `.lobby{display:none}` 한 줄 제거
================================================================

`.lobby{display:none}` 한 줄을 찾아서 삭제. (위 [1]의 새 CSS에서 다시 정의했음)

또한 [1]의 `.lobby.show{display:flex}` 가 새로 추가됐으므로, 기존 코드에서 `$('lobby').style.display='flex'` 로 직접 설정하는 부분은 그대로 두면 됨 (display:flex가 inline style로 들어가서 정상 동작).

## 2026-09-13 로비 정적 이미지 현행 계약

미선택 메인 배경은 스테이지와 무관하게3종을 무작위 선택한다. 캐릭터 선택 시 기존 아이들 영상 레이어를 사용한다.

| 적용 위치 | 파일 | 공유 원본 | 캐시 |
|---|---|---|---|
| 메인 frost | assets/lobby/lobby_bg_frost.png | img/lording/rd17.png | 메인20260913-lobby-detail2 / 로딩20260913-intro-detail2 |
| 메인 flame | assets/lobby/lobby_bg_flame.png | img/lording/rd1.png | 메인20260913-lobby-detail2 / 로딩20260913-intro-detail2 |
| 메인 abyss | assets/lobby/lobby_bg_abyss.png | img/lording/rd6.png | 메인20260913-lobby-detail2 / 로딩20260913-intro-detail2 |
| 우측 패널 | assets/lobby/lobby_bg_new.png | 별도 편집 | 20260913-lobby-smooth1 |
| 대체 초상화 | assets/lobby/lobby_portrait.png | 별도 편집 | 20260913-lobby-smooth1 |

`_preloadLobbyBgs`와 `_swapLobbyBg`는 동일한 PNG3개와 버전 URL을 사용한다. `_curBg`가 같은 경우 재전환하지 않는다. 로딩 picker는 rd3을 제외한 rd1~rd17의16개(rd11.jpg 외 PNG)이며, 일반/쉬운 게임 전환 배경은 숫자1~19의19개다. 이미지의 전면 점무늬를 GPT로 정리했으며 [개별 판정·해상도](../1전체그래픽세팅/LOBBY_IMAGE_REVIEW_20260913.md)를 따른다.

### 거대전사 재디자인·확대 계약 (2026-09-13 후속)

| 항목 | 현행 |
|---|---|
| 메인3종 | 동일한 전사·직선 대검·두 펫 목걸이를 가진1536×1024 PNG, 불/얼음/심연 환경 변형 |
| 캐시 | images/ 컷신(일반·쉬운 게임), 숫자1~19 로딩/로비 배경/preload, rd16개 picker/preload는 `20260913-intro-detail2`. 메인 로비3종 preload/swap는 `20260913-lobby-detail2`. 우측 배경·대체 초상화는 `20260913-lobby-smooth1` |
| lobbyKenburns |2026-09-27부터 로비 배경 animation:none/transform:none으로 고정,자동 확대 미사용 |
| 표시 | background-size:cover, left center. 추가 확대는 기존4~8%에서0~2%로 축소 |
| 상세 | [디자인/해상도/실제 화면 검수](../1전체그래픽세팅/LOBBY_WARRIOR_REDESIGN_20260913.md) |

전체 메뉴와 로비의 최신 재질·제목·문양·선택·초점·스크롤 스타일은 UI_COMPOSITION_20260925.md의 **2026-09-26 전체 메뉴 마감 절**을 따른다.

전체 메뉴와 로비의 최신 재질·제목·문양·선택·초점·스크롤 스타일은 UI_COMPOSITION_20260925.md의 **2026-09-26 슬롯과 상호작용 마감 절**을 따른다.

전체 메뉴와 로비의 최신 재질·제목·문양·선택·초점·스크롤 스타일은 UI_COMPOSITION_20260925.md의 **2026-09-26 유니크 분해 NaN 수정과 상세창 마감 절**을 따른다.

전체 메뉴와 로비의 최신 재질·제목·문양·선택·초점·스크롤 스타일은 UI_COMPOSITION_20260925.md의 **2026-09-26 창고와 상세 스크롤 마감 절**을 따른다.


## 2026-09-27 로비 원본 로고 중앙 이동

| 항목 | 현행 규격 |
|---|---|
| 사용자 지시 | 기존 좌상단 EXODUSER 이미지 로고를 캐릭터 목록 위 중앙으로 이동. 별도로 추가했던 게임명 텍스트 제거 |
| DOM | index.html의 .lobby-divider 안에 img.lobby-brand-logo, src=img/logo_exoduser.png, alt=EXODUSER, draggable=false |
| 문양 제거 | 해당 구분영역 background:none, opacity:1, flex 중앙정렬. 큰 배경 문양 유지 |
| 헤더 | 기존 좌상단 로고 래퍼 제거. .lobby-header는 justify-content:flex-end, min-height:48px로 언어·계정 영역 정렬 |
| 로고 규격 | display:block, height:100%, max-height:100%, max-width:100%, width:auto, object-fit:contain |
| 높이·캐시 | 구분영역 120px·화면 높이800px 이하 80px, flex-shrink:0. index의 ui-refinement.css 캐시 20260927-lobby-logo250 |
| 검증 | 실제 index/CSS를 스크립트 비활성 격리 페이지에서 표시. 360/664/1280/1920px에서 원본 이미지 로딩·영역 내 배치, 가로 중심 오차 0.01px 미만. 헤더 이미지와 추가 텍스트 각각 0개. 로그인/세이브 API 실행 없음. tmp/lobby-logo-center/after.png 및 report.json |


## 2026-09-27 로비 프레임 외곽 투명화·장식 확대

| 항목 | 현행 규격 |
|---|---|
| 원인 | .lobby-right 전체의 배경·왼쪽 선·외부 그림자가 알파 프레임 바깥에도 사각형으로 남음 |
| 패널 | isolation:isolate, background:transparent!important, border:0!important, box-shadow:none!important. padding:28px 30px 24px |
| 안쪽 배경 | ::before, position:absolute, inset:22px, z-index:-1, pointer-events:none. 기존 철판·문양·그라디언트 유지, 네 모서리 12px 사선 clip-path로 배경만 제한 |
| 장식 프레임 | ::after inset:0, border-width:48px, border-image-width:48px. 기존 40px 대비 20% 확대. 기존 --ui-frame 이미지·slice22%·stretch·z-index2·pointer-events:none 유지 |
| 원본 이미지 | 수정·생성 없음. 프레임의 기존 PNG 알파 사용, 바깥은 로비 배경이 비침 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-lobby-frame |
| 검증 | 스크립트 비활성 실제 index/CSS, 1280/1600/1920px에서 패널 배경 투명·border0·shadow none·fill inset22px·frame48px 확인. 패널 가로 넘침 없음. tmp/lobby-frame-transparency/after.png 및 report.json. 로그인·세이브 API 미실행 |


## 2026-09-27 중앙 EXODUSER 로고 2.5배 확대

| 항목 | 현행 규격 |
|---|---|
| 기본 크기 | .lobby-divider 높이120px!important, flex-shrink:0. 기존48px 대비2.5배 |
| 낮은 화면 | max-height:800px에서 영역80px!important. 기존32px 대비2.5배 |
| 이미지 | .lobby-brand-logo height:100%, max-height:100%, max-width:100%, width:auto, object-fit:contain. 원본 이미지·중앙 정렬 유지 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-lobby-logo250 |
| 검증 | 1920×960,1280×900,1280×720,800×720에서 영역 내 배치·중심 오차0.01px 미만·캐릭터 목록 비겹침. tmp/lobby-logo-250/after.png 및 report.json. 스크립트 비활성 렌더 검수 |


## 2026-09-27 캐릭터 선택에 따른 ENTER 소등·점등

| 항목 | 현행 규격 |
|---|---|
| 미선택 | disabled 유지, display:block!important, opacity:1!important, 버튼 filter:none!important. 이미지 grayscale(1) brightness(.45)로 보석·문양 소등, 클릭 불가 |
| 선택 | 기존 _updateCharDisplay(s) 및 온라인 선택 처리의 disabled=false를 그대로 사용. 이미지 filter:none으로 원본 보라색 점등 |
| 선택 해제 | 기존 _updateCharDisplay()의 disabled=true로 소등 복귀 |
| 전환 | 이미지 filter .45s ease, prefers-reduced-motion:reduce에서는 transition:none |
| 배치·원본 | assets/lobby/lobby_enter_btn.png 재사용. 상태 전환 시 버튼 영역 높이 동일, 숨김에 따른 레이아웃 이동 제거. 입장은 별도 클릭 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-enter-light |
| 검증 | 스크립트 비활성 로비에서 실제 _updateCharDisplay 함수만 추출 실행, 번역·배경 교체·캐릭터 영상은 격리. 미선택 disabled/display:block/opacity1/filter grayscale(1) brightness(.45), 선택 disabled=false/filter none, 해제 disabled=true 확인. 두 상태 높이120px 동일. tmp/lobby-enter-light/off.png 및 on.png. 로그인·세이브 API 미실행 |


## 2026-09-27 로비 계정 영역 폭과 키보드 로그아웃 수정

| 항목 | 현행 규격 |
|---|---|
| 재현 | 긴 계정명이 flex 최소 콘텐츠 폭을 강제하여 1280px 화면의 우측 패널이784.34px로 확대. 정상35%는448px |
| 레이아웃 | .lobby-right 및 헤더 min-width:0, 헤더 flex-shrink:0. .lobby-account-controls grid-template-columns:minmax(0,140px) minmax(0,1fr), gap8px, width100%, min-width0, align-items:center |
| 언어 선택 | width100%, min-width0, max-width100%. 기존 다국어 옵션과 이벤트 유지 |
| 계정명 | lobby-mode flex/right 정렬, gap8px,min-width0,margin-top0,letter-spacing.04em. .lobby-account-email은 한 줄 ellipsis, font-size.7rem,색#aa8855, title에 전체 주소 |
| 로그아웃 | span 대신 type=button, id=lobbyLogout 유지. flex:0 0 auto, 최소높이28px,padding3px4px,border0,transparent배경,색#b8a386,글자.65rem,자간.08em. hover와 gp-hover는#ead6a5. 기존 공통 focus-visible outline 사용 |
| DOM·이벤트 | createElement와 리프 textContent로 주소를 텍스트 처리, replaceChildren으로 계정 요소 구성. 기존 sb.auth.signOut 호출 유지 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-account-layout |
| 검증 | 800/1280/1600/1920px에서 패널 폭360/448/560/672px, 계정 컨트롤 영역 내 배치·가로 넘침 없음. 실제 생성 코드와 signOut 스텁으로 Enter/Space 각1회 호출 확인. 로비 회귀8개 통과, 인라인 스크립트4개 구문 통과. tmp/lobby-account-layout/report.json 및 after.png. 실계정 로그아웃·저장 호출 없음 |


## 2026-09-27 캐릭터 카드 이름·직업·삭제 영역 분리

| 항목 | 현행 규격 |
|---|---|
| 문제 | 긴 이름 뒤 직업 배지가 잘리고 삭제 버튼과 텍스트 영역이16px 겹침 |
| 온라인·로컬 이름 | 기존 .char-name 안에 .char-name-label span 추가. 이름 본문은 escHtml 적용, title은 해당 리프 DOM 프로퍼티에 원문 직접 대입하여 전체 이름 확인 |
| 이름·직업 배치 | 이름 행 flex/align-items:center/gap8px. 이름 min-width0/한 줄 ellipsis. 직업 flex:0 0 auto/max-width50%/margin-left0/한 줄 ellipsis |
| 삭제 영역 | 삭제 버튼이 있는 .char-item만 padding-right48px·삭제28px, pointer:coarse에서는 padding-right64px·삭제44px. 텍스트와 삭제 버튼 사이10px 확보 |
| 진행 정보 | .char-info 한 줄 ellipsis로 긴 지역명이 카드 밖에 넘치지 않음 |
| 삭제 발견성 | 카드 focus-within 또는 hover:none 환경에서 삭제 버튼 opacity1. 기존 삭제 확인 동작 유지 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-card-details |
| 검증 | 온라인·로컬 실제 카드 템플릿을 격리 페이지에 렌더. 화면폭800/1280/1920에서 직업 배지 영역 내·삭제 간격10px·이름 말줄임 및 전체 이름 title 확인. 삭제 키보드 초점 opacity1. 로비 회귀7개 및 인라인 스크립트4개 구문 통과. tmp/lobby-card-details/after.png 및 report.json. 실제 캐릭터 선택·삭제·세이브 요청 없음 |


## 2026-09-27 로비 카드 키보드 선택·생성

| 항목 | 현행 규격 |
|---|---|
| 대상 | 온라인·로컬·데모의 실제 캐릭터 카드, 생성 가능한 새 캐릭터 카드 및 온라인 빈 목록 생성 카드. 빈 슬롯·생성 불가 카드는 제외 |
| DOM | _addLobbyCardControl(card,label,key)가 type=button.char-select를 prepend. aria-label/title은 이름·직업·레벨/진행 정보 또는 번역된 새 캐릭터, data-card-key는 online:id/local:name/demo/new |
| 배치 | .char-select absolute/inset0/z-index1/width100%/height100%/padding0/border0/radius0/transparent. 삭제 버튼은 별도 형제이며 z-index2 |
| 키보드 | Tab으로 카드 선택 가능, Enter/Space의 네이티브 click이 기존 카드 선택·생성 이벤트로 전달. 선택만 하고 실제 입장은 ENTER 버튼으로 진행 |
| 초점 복원 | 클릭 시작 시 초점 여부 저장, setTimeout 0으로 이벤트 버블링·목록 재생성 이후 처리. 기존 버튼이 제거되고 activeElement가 body일 때 동일 data-card-key 버튼에 focus(preventScroll:true). 다른 초점은 빼앗지 않음 |
| 초점 표시 | outline2px solid #ead6a5, outline-offset:-3px로 카드 내부에 표시 |
| 목록 초기화 | 온라인·로컬 렌더러의 cl.innerHTML 초기화를 replaceChildren으로 변경 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-card-keyboard |
| 검증 | 실제 온라인/로컬 렌더러·선택 함수 추출, 격리된 선택·생성·삭제 확인 콜백 사용. Enter/Space 각각 선택1회, 재렌더 후 초점 유지, 삭제 Enter는 선택 없이 확인1회, 생성 Space1회. 로비 회귀8개 통과 및 inline4개 구문 확인. tmp/lobby-card-keyboard/report.json 및 after.png. 실제 계정·저장·삭제 API 호출 없음 |


## 2026-09-27 목록 이동 초점·온라인 오른쪽 스틱 수정

| 항목 | 현행 규격 |
|---|---|
| 재현 | 목록 이동 버튼 클릭이 렌더러를 재실행하여 활성 버튼을 제거, 키보드 초점이 body로 유실. 오른쪽 스틱은 로컬 ID만 조회하여 온라인 목록 미동작 |
| 공통 바인딩 | _bindLobbyListNavigation(up,down,move), 위 -1/아래 +1. 각 렌더러는 인덱스를0~total-VIEW로 제한한 뒤 재렌더 |
| 초점 유지 | 클릭 전 활성 버튼이었다면 재렌더 후 동일 ID의 활성 버튼에 focus(preventScroll:true). 마지막/첫 페이지에서 해당 버튼이 disabled이면 반대 방향 버튼으로 초점 이동. 이미 다른 요소로 이동한 초점은 보존 |
| 게임패드 | 위 charNavUpOn 우선·charNavUp 폴백, 아래 charNavDnOn 우선·charNavDn 폴백. 기존 오른쪽 스틱 임계값±0.5 및 방향 진입1회 처리 유지 |
| 검증 | 온라인/로컬 실제 렌더러로 Enter3회:2-3→3-4→4-5/5, 끝에서 위 버튼 초점, Space로3-4/5 복귀. 실제 스틱 처리 코드에1,1,0,1,-1 입력:2-3,2-3,2-3,3-4,2-3/5로 두 모드 일치. 실제 게임패드 하드웨어 검증은 아님 |
| 회귀·기록 | 로비 회귀8개 통과, inline4개 구문 통과. tmp/lobby-list-navigation/report.json 및 gamepad-report.json. 테스트 데이터5개 사용, 계정·저장·삭제 API 호출 없음 |


## 2026-09-27 로비 목록 컨트롤 클릭·터치 영역 확대

| 항목 | 현행 규격 |
|---|---|
| 재현 | 화살표 실제 높이15.2px, 삭제24×24px로 클릭 영역이 작음 |
| 기본 입력 | 화살표 최소32×32px, inline-flex 중앙정렬, padding4px8px. 삭제28×28px, 카드 오른쪽 padding48px |
| 터치 | pointer:coarse에서 화살표 최소44×44px, 삭제44×44px 및 opacity1, 카드 오른쪽 padding64px |
| 간격 | 삭제 버튼 right10px 유지, 텍스트와 버튼 사이10px 유지 |
| 초점·호버 | 목록 내비 align-items:center. 화살표 focus-visible outline-offset:-2px. 활성 화살표 hover/gp-hover 색#ffd6bb,배경#6b38282e |
| 캐시 | index.html의 ui-refinement.css?v=20260927-control-targets |
| 검증 | 온라인 실제 렌더러,1920/1280/800×720에서 화살표32px·삭제28px·간격10px·가로 넘침 없음·footer 화면 내. 키보드 이동 후 초점 유지. Chromium hasTouch 입력 에뮬레이션에서44×44px 및 간격10px 확인, 실제 터치 기기 검증은 아님. tmp/lobby-control-targets/report.json,desktop.png,touch.png |


## 2026-09-27 낮은 로비 화면 세로 접근성 수정

| 항목 | 현행 규격 |
|---|---|
| 재현 | 높이600px 이하에서 ENTER 하단612px, footer620px로 화면 밖 잘림. 배너 영역6px로 축소 |
| 구조 | .lobby-right 내부 콘텐츠를 .lobby-content로 감쌈. 모든 높이에서 flex column으로 배치하고 부족한 높이만 내부 스크롤 사용 |
| 낮은 화면 | 전체 높이에서 내부만 flex column/overflow-y:auto/overflow-x:hidden/flex:1 1 auto/min-height0/min-width0. scrollbar-gutter:stable,padding-right8px,thin 스크롤바 색#75674f/#101113,scroll-padding-block4px. 직계 자식 flex-shrink0 |
| 배너·프레임 | 낮은 화면의 lobby-mid-area flex:0 0 auto/overflow:visible로 중첩 스크롤 제거. 부모 장식 프레임·배경은 고정, 로고·카드 크기 보존 |
| 휠 경계 | 온라인·로컬 모두 현재 .char-scroll-vp에 연결한 wheel에서 Math.sign(deltaY)와 현재 데이터 길이로 다음 인덱스 계산. 실제 목록 이동 때만 preventDefault/렌더, 시작·끝·delta0에서는 기본 외부 스크롤 허용. 로컬 최초 바인딩의 오래된 chars 길이 캡처 제거 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-short-lobby |
| 검증 | 격리 로비 카드3개 고정 높이로1280×720/1024×600/960×540/800×480 검수. 낮은 화면에서 ENTER 초점 시 내부 스크롤196/256/316px, 버튼 화면 내·가로 넘침 없음. 실제 휠 핸들러 상하 경계/이동/0 입력 확인. 로비 회귀8개·inline4개 구문 통과. tmp/lobby-short-height/after.png,report.json,wheel-report.json |


## 2026-09-27 로비 하단 버튼 접근성 보완

| 항목 | 현행 규격 |
|---|---|
| 다시보기 | replayCinBtn을 span에서 type=button으로 변경. 기존 _goCinematic onclick·번역 셀렉터·게임패드 목록 유지. 키보드 Enter/Space로 동작 |
| 표시 | 최소높이32px,padding4px0,border0,transparent배경,글자#b8a386/.7rem/자간.08em. hover·gp-hover #ead6a5, focus-visible outline-offset0 |
| 입장 | enterGameBtn 기본 aria-label=입장, _applyLobbyLang에서 _TL(입장)로 갱신. 이미지 노드·선택 전 disabled 유지 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-footer-controls |
| 검증 | 실제 마크업 격리 브라우저에서 Enter/Space 각각 다시보기 콜백1회(시네마틱 실행은 스텁). 입장 접근성 이름·이미지1개·disabled 보존,영문/한글 라벨 갱신 확인. 로비 언어·선택 회귀5개 통과. tmp/lobby-footer-controls/report.json 및 after.png |


## 2026-09-27 언어 팝업 화면 경계·키보드 보완

| 항목 | 현행 규격 |
|---|---|
| 재현 |360×480 화면 우하단 선택창에서 기존 팝업 right412/bottom764로 잘림 |
| 배치 | 좌우 여백8px, min-width=min(200,화면폭−16),max-width=화면폭−16. 아래 공간이 min(240,화면높이×.6) 이상 또는 위 공간보다 크면 아래, 아니면 위로 배치. 최대높이는 가용공간과60vh 중 작은 값,최소48px. 좌표 화면 내 보정 |
| 키보드 | 선택창 Enter/Space/위/아래로 열기, 팝업 ArrowUp/Down/Home/End로 탐색,Enter/Space로 기존 change1회 실행. 열기·팝업 키는 시네마틱 등 상위 키 처리로 전파하지 않음 |
| 닫기 | Escape는 선택값 유지하고 원래 select로 초점 복귀,Tab은 닫은 후 기본 이동. 바깥 pointerdown 및 화면 전환(_goLogin/_goCinematic/_goLobby/showLobby)은 초점을 강제로 되돌리지 않고 닫기 |
| 접근성 | 팝업 tabindex0/role=listbox/aria-label=Language. 행 role=option/aria-selected 및 고유id,팝업 aria-activedescendant. 선택창 aria-controls/aria-expanded 상태 동기화 |
| DOM | 팝업 재구성은 replaceChildren,행 텍스트는 리프 textContent. 기존 옵션·change 처리·게임패드 인덱스 계약 유지 |
| 검증 | 실제 팝업 코드 격리 실행,360×480/1280×720/640×360/320×280 우하단 배치 모두 화면내. 방향키 선택change1회,Escape취소 값 유지·초점복귀,바깥 클릭닫기 확인. 로비 회귀5개·inline4개 구문 통과. tmp/lobby-language-popup/report.json 및 after.png. 언어 저장은 검수용 change 계수로 대체 |


## 2026-09-27 언어 메뉴 혼합 입력·화면 크기 변경 보완

| 항목 | 현행 규격 |
|---|---|
| 재현 | 마우스로3번 행을 가리킨 후 Enter가0번을 확정.1280→360px 축소 후 팝업 right1062px로 화면 밖 유지 |
| 마우스 | 행 mousemove의 clientX/clientY를 _langPopPointer와 비교,처음 또는 좌표 변경 때만 _langPopIdx 갱신 및 _hlLangPop(false). 정지 포인터의 동일 좌표 이벤트는 키보드 선택을 덮어쓰지 않음 |
| 강조 | 개별 enter/leave 배경 조작 제거, 공통 _hlLangPop으로 배경·outline·aria-activedescendant 동기화. scroll 기본true,마우스 이동은false로 스크롤 점프 방지 |
| 창 크기 변경 | 기존 배치 수식을 _positionLangPop(pop,sel)로 분리. 열린 상태의 window resize에서 위치·최대높이 재계산 후 선택 행을 내부 스크롤로 노출,행 재생성·언어 확정·키보드 초점 이동 없음 |
| 검증 | 실제 메뉴 코드 격리 브라우저:마우스3번→Enter3번 확정,End28번 강조 후1280×720→360×480 축소 시 화면 내·28번 강조 유지,Enter28번 확정. 로비 회귀5개 통과. tmp/lobby-language-mixed-input/report.json. 실제 언어 저장 없음 |


## 2026-09-27 로비 통합 검증·언어 선택 행 가시성 보정

| 항목 | 결과·현행 규격 |
|---|---|
| 통합 검증 | 로비 단계·언어 선택·선택 정보·29언어 지역명·캐릭터 동기화·생성 스토리·스토리 제어·울트라와이드·언어 지역명9개 테스트 파일,82개 통과 |
| 추가 재현 | 메뉴 마지막 언어 선택 후1280×900→360×280 축소 시 팝업 하단227px,선택 행 하단598px로 내부 시야 밖 |
| 보정 | 열린 언어 팝업 resize에서 _positionLangPop 뒤 _hlLangPop 호출. 선택 인덱스 유지하며 현재 행을 내부 스크롤로 노출 |
| 브라우저 검증 |360×280→640×360→1280×900에서 마지막28번 항목 유지·선택 행 가시성·메뉴 화면 내 확인. tmp/lobby-integrated-review/report.json. 모의 팝업 검수,사용자 언어·저장 데이터 변경 없음 |


## 2026-09-27 저장 이름 툴팁의 따옴표 보존

| 항목 | 현행 규격 |
|---|---|
| 재현 | escHtml은 텍스트용 변환으로 따옴표를 인코딩하지 않음. 기존 저장 이름 전사 "별명" & 동료의 title이 전사 공백까지만 표시 |
| 수정 | 온라인/로컬 .char-name-label의 HTML title 보간 제거. 새 카드 생성 후 특정 리프 노드의 title 프로퍼티에 ch.name/s.name 직접 대입 |
| 유지 | 이름 본문은 기존 escHtml로 표시,선택 버튼 aria-label/title은 기존 DOM 대입. 신규 이름 입력 제한·저장 데이터 변경 없음 |
| 검증 | 온라인·로컬 실제 템플릿×큰따옴표/작은따옴표/꺾쇠·앰퍼샌드3종=6경우 본문·title 원문 일치,추가 속성·자식 없음. 로비 회귀7개 통과. tmp/lobby-name-attributes/report.json. 사용자 저장 수정 없음 |


## 2026-09-27 언어 메뉴 재열기 입력 상태 초기화

| 항목 | 현행 규격 |
|---|---|
| 재현 | 스틱을 기울인 채 메뉴를 닫고 밖에서 중립 복귀 후 다시 열면 로그인 첫 상하 이동이 무시됨. 로비는 이전 반복 대기시간이 남아 첫 이동 지연. 동일 좌표의 첫 마우스 이동도 이전 좌표 비교 때문에 무시됨 |
| 공통 처리 | _openLangPop에서 대상 select 확인 후 _langPopPointer=null, _GP.prev._lpU=false, _lpD=false, _lpDir=null, _lpRepT=0. 로그인·로비·시네마틱 공통 열기 함수에 적용 |
| 유지 | 현재 select.selectedIndex로 초기 선택. 탐색만으로 언어 확정하지 않음. 기존 스틱 임계값 ±0.5 및 로비 반복 초기300ms/이후80ms 유지. 같은 열린 메뉴 안에서는 정지 포인터가 키보드 선택을 덮어쓰지 않음 |
| 검증 | lobbyLanguageReopen.test.js: 로그인/로비 × 상/하 4건 및 동일 좌표 재열기 마우스1건. 수정 전5건 실패→수정 후 통과. 언어 선택·한글 입력 포함 총12건 통과. 실제 함수 VM 실행, 실물 게임패드 미검증 |
| 기록 | tmp/lobby-language-reopen/changes.patch에 코드·회귀 테스트·문서 동시 보관. 기존 터미널/.git 쓰기 제한으로 커밋 미완료 |


## 2026-09-27 낮은 로비 게임패드 선택 자동 노출

| 항목 | 현행 규격 |
|---|---|
| 재현 | 960×540에서 게임패드로 하단 시네마틱 버튼 선택 시 패널 하단516px,선택 버튼 하단768.19px,scrollTop0으로 화면 밖 유지 |
| 처리 | lobbyNav에서 _lobbyGpIdx 또는 실제 선택 요소 변경 시 현재 컨트롤의 closest(.lobby-content) 확인. clientHeight>0 및 scrollHeight>clientHeight일 때만 패널 내부 scrollTop 보정 |
| 경계 | 패널 getBoundingClientRect.top+clientTop 기준 위아래4px 여유. 선택 요소가 위 경계보다 위면 차이만큼 감소,아래 경계보다 아래면 차이만큼 증가. 이미 보이면 이동 없음 |
| 유지 | 내용이 패널 높이를 넘지 않으면 스크롤하지 않음. 실제 DOM 초점·언어 선택·캐릭터 선택/삭제 동작은 변경 없음. 중립 프레임은 같은 인덱스·동일 요소에서 스크롤하지 않음 |
| 브라우저 검증 | 실제 로비 HTML/CSS와 lobbyNav 함수,검수 카드3개로 960×540/800×480/1024×600/1280×900 각 첫 선택+아래6+위6 총52개 가시성 통과. 중립 스크롤 유지 및 document.scrollY0. 실제 저장/삭제 요청 없이 모의 패드 입력,실물 패드 미검증 |
| 회귀·기록 | 언어 재열기·캐릭터 선택 정보·언어 선택 테스트10개 통과. tmp/lobby-pad-visibility/report.json,after.png,changes.patch. 기존 터미널/.git 제한으로 커밋 미완료 |


## 2026-09-27 목록 재렌더 후 게임패드 대상 동기화

| 항목 | 현행 규격 |
|---|---|
| 재현 | 오른쪽 스틱 목록 이동과 A/X를 같은 프레임에 입력하면 미리 수집한 _navItems가 제거된 카드 DOM을 참조하여 이전 카드 선택/삭제 확인 실행. 같은 인덱스의 새 DOM에는 gp-hover 누락 |
| 순서 | 오른쪽 스틱 페이지 이동을 _navItems 수집 전에 처리. 최신 보이는 DOM 수집 → 이전 요소가 남아 있으면 인덱스 복원 → 인덱스 상한 보정 → 방향 탐색 → 강조 → A/X 실행 순서 |
| 강조 상태 | _GP.prev._lobbyEl에 이전 실제 요소 참조 저장. 인덱스 또는 요소가 바뀌면 이전 요소 gp-hover 제거 후 현재 요소 강조·패널 노출·호버 사운드 처리. 교체 DOM도 같은 인덱스에서 갱신 |
| 유지 | 오른쪽 스틱 ±0.5 임계값 및 중립 복귀 전 방향별1회 이동, 온라인 ID 우선·로컬 폴백 유지. X는 기존 삭제 확인 클릭만 실행하며 삭제 확정 과정 유지 |
| 회귀 | lobbyGamepadRefresh.test.js 신규4건: 우스틱+A 최신 카드 선택,우스틱+X 최신 카드 삭제 확인,같은 인덱스 DOM 교체 강조 복구·이전 강조 제거,우스틱 홀드1회 및 중립 재진입. 수정 전3실패/1통과→수정 후4통과 |
| 검증·기록 | 캐릭터 동기화·선택 정보·언어 재열기 포함21개 통과. 실제 lobbyNav 추출 및 모의 DOM/패드 입력,실제 저장·삭제/실물 패드 검증 없음. tmp/lobby-pad-refresh/changes.patch. 기존 터미널/.git 제한으로 커밋 미완료 |


## 2026-09-27 로비 버튼 목록 변경 시 선택 대상 유지

| 항목 | 현행 규격 |
|---|---|
| 재현 | 현재 선택 앞에 버튼이 추가되거나 제거되면 숫자 인덱스만 유지되어 다른 컨트롤로 강조/A 실행 대상 이동. 입장 버튼 활성화로 시네마틱 앞에 탐색 항목 추가되는 경우 포함 |
| 처리 | _navItems 수집 후 _GP.prev._lobbyEl과 동일한 요소를 findIndex하여 _retainedGpIdx 계산. 0 이상이면 _lobbyGpIdx를 해당 위치로 복원한 뒤 상한 보정·방향 입력 처리 |
| 폴백 | 이전 요소가 제거되거나 탐색 대상에서 제외되면 기존 인덱스 상한 보정 유지. DOM이 교체된 카드는 기존 교체 감지·강조 갱신 경로 사용 |
| 자동 회귀 | lobbyGamepadRefresh.test.js에 앞 항목 삽입/제거 후 A 대상 유지,삽입 후 방향 입력의 기준 유지,현재 요소 제거 후 남은 항목 폴백4건 추가. 수정 전 신규3건 실패/1건 통과,수정 후 통과. 관련 테스트 총25건 통과 |
| 브라우저 | 실제 로비 마크업/CSS/lobbyNav 격리 실행. 960×540에서 시네마틱 선택 후 입장 버튼 활성화/비활성화 각각 A 실행이 시네마틱 콜백으로 전달(총2회),강조1개 유지. 실제 시네마틱 실행·저장 없음,실물 패드 미검증 |
| 기록 | tmp/lobby-pad-stable-target/report.json 및 changes.patch. 코드·테스트·문서 함께 보관,기존 터미널/.git 제한으로 커밋 미완료 |


## 2026-09-27 투명화 범위 정정: 프레임 안 유지·밖만 투명

| 항목 | 현행 규격 |
|---|---|
| 사용자 확정 | 230651 스크린샷 지적: 박스 안을 투명하게 하라는 뜻이 아님. 직전 전체 내부 투명화는 오해로 폐기. 장식 테두리 바깥만 투명 |
| 로비 원인·수정 | .lobby-right 자체는 이미 transparent이고 ::before inset22px 안쪽 배경 유지. 최신 단일 장면 규칙에 따라 #lobbyBgImg를 로비 전체로 확장하고 .lobby의 검정 로딩 폴백을 유지. 외곽에 별도 body 배경이 비치지 않음. 카드·배너·버튼·내부 문양 유지 |
| 튜토리얼 | #parryLesson 부모 background:transparent,border0,box-shadow:none 유지. ::before의 실제 border-width18px·border-image-width40px에 기존 radial-gradient(ellipse at 50% 0,#47171288,transparent 48%),#100d0ef5 배경을 padding-box로 제한. 프레임22% 슬라이스·문장 유지 |
| 내부 복원 | 키·현재 행·footer·시작/건너뛰기 버튼·자원 안내·체크박스의 직전 투명 오버라이드 제거. 기존 붉은 현재 행/버튼 및 배경 복원. parryLessonBackdrop도 기존 정의 복원 |
| 캐시 | index.html/game.html/game-easy-test.html: ui-foundation.css?v=20260927-frame-interior, ui-refinement.css?v=20260927-frame-exterior |
| 검증 | Chromium1280×900에서 검수용 줄무늬 배경을 이용해 로비/튜토리얼 바깥만 배경이 비치고 내부는 어두운 배경 유지 확인. 튜토리얼 내부 rgba(16,13,14,.96),padding-box,frame40px,부모border0. 로비 부모/전체 배경transparent 및 내부 inset22px 확인. 실제 CSS 격리 검수,게임 데이터 변경 없음 |
| 기록 | tmp/frame-outside-only/report.json,lobby-after.png,tutorial-after.png,changes.patch. 기존 터미널/.git 제한으로 커밋 미완료 |


## 2026-09-27 로비 장면 배경 한 장으로 통일

| 항목 | 현행 규격 |
|---|---|
| 원인 | 로비 투명 외곽에서 body의 별도 img/lording 랜덤 배경이 노출되어 왼쪽 로비 장면과 오른쪽 외곽 장면이 달라짐 |
| 구조 | #lobbyBgImg를 .lobby-left 내부에서 #lobby 직계 자식으로 이동. 좌측65%(1100px 이하55%) 영역에 contain/center center로 원본 전체 한 장 표시(미선택 배경 잘림 수정). 기존 _swapLobbyBg의 이미지 선택·전환 및 DOM id 유지 |
| 레이어 | .lobby background:#000/isolation:isolate/overflow:hidden. 검정은 로딩·페이드 시 별도 body 배경 노출 방지용. 직계 배경 z-index0/pointer-events:none,좌우 패널 z-index1,왼쪽 자체 배경 transparent |
| 유지 | 오른쪽 장식 바깥은 동일 로비 장면을 노출. 내부 inset22px 배경·문양·카드·로고·버튼 및 캐릭터 미리보기 유지. 기존 배경3종 선택 정책 유지,새 이미지 생성 없음 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-single-lobby-scene |
| 검증 | 실제 HTML/CSS 격리 브라우저에서 flame 기존 에셋1장으로1600×900 시각 확인. #lobbyBgImg1개/부모lobby/전체화면크기 일치. body에 검수용 마젠타 배경을 두어 외곽에 노출되지 않음 확인. 960×540·1920×1080에서도 전체크기 일치/횡넘침 없음 |
| 기록 | tmp/lobby-single-scene/after.png,report.json,sizes.json,changes.patch. 게임 저장·계정 변경 없음. 기존 터미널/.git 제한으로 커밋 미완료 |


## 2026-09-27 선택 캐릭터와 로비 전체 장면 일치

| 항목 | 현행 규격 |
|---|---|
| 사용자 확정 | 로비 표시 이미지는 선택 캐릭터와 일치. 선택 실버테일 뒤/우측 외곽에 랜덤 전사 배경이 남는 상태 금지 |
| 구조 | #lobbyCharPreview/video 및 #lobbyCharKeyart/img를 .lobby-left 안에서 #lobby 직계 자식으로 이동. 선택 시 #lobbyBgImg visibility:hidden,선택 해제 시 복원 |
| 매핑 | _updateCharDisplay의 기존 CHAR_VISUALS[s.charIdx 또는0] 공통 데이터로 이름·직업·영상·정적 이미지 표시. 영상이 있으면 idleVid,실패/재생 거절 시 같은 캐릭터 poster 우선·portrait 폴백. 영상 없는 경우 poster 또는 portrait 표시,keyart 플래그에 의한 숨김 제거 |
| 실버테일 | 기존 공식 assets/charselect/silvertail_solo.png?v=20260927을 전체 선택 장면으로 사용. 썸네일은 공식 bust 유지. 신규 이미지·영상 생성/변형 없음 |
| 늦은 응답 | 정적 폴백 콜백에서 _selectedCharDisplay!==s이면 무시. 캐릭터 전환 시 preview.onerror 초기화,선택 해제 시 video src/poster 및 정적 src 제거 |
| 영상 재사용 | getAttribute(src)의 물음표 앞 경로와 idleVid 경로를 비교하여 같은 영상의 불필요한 reload 방지. 기존 idleRate 유지 |
| 구도 | 직계 선택 미디어 z-index0,left0,width65%,height100%,object-fit:contain,object-position:center center,transform:none. 폭1100px 이하는 width55%. 원본 전체 표시,우측 패널은 자기 열을 채움(전체화면 잘림 수정 규칙) |
| 캐시 | index.html:ui-refinement.css?v=20260927-selected-scene |
| 검증 | 신규4회귀(정적 선택/영상 실패/이전 영상 늦은 실패/선택 해제)와 선택정보·동기화 포함16개 통과. 실제 CSS/함수 격리 브라우저1600×900 실버테일 표시 및 전사 영상 오류 후 전사 포스터1개만 표시 확인. 실물 게임패드·실계정 저장 미검증 |
| 기록 | tmp/lobby-selected-scene/silvertail.png,warrior-fallback.png,report.json,changes.patch. 기존 터미널/.git 제한으로 커밋 미완료 |


## 2026-09-27 전체화면 선택 이미지 잘림 수정

| 항목 | 현행 규격 |
|---|---|
| 원인 | 선택 미디어 width135%/145% 및 음수left와 cover가 전체화면에서 원본 글자·머리·목을 잘라냄. 해당 확대 규칙 폐기 |
| 선택 이미지·영상 | #lobby 직계 .lobby-char-preview: left0,right:auto,width65%,height100%,object-fit:contain,object-position:center center,transform:none. 폭1100px 이하는 width55%. 원본 전체를 좌측 가용 영역 안에 표시 |
| 비율 | 원본을 변형하거나 자르지 않음. 표시 배율 min(영역폭/원본폭,영역높이/원본높이),남는 공간은 검정 여백. 임의 추가 배경 이미지 없음 |
| 우측 패널 | 사용자 대안 수용: .lobby>.lobby-right background:#100d0e!important로 자기 열을 화면 상하·오른쪽 끝까지 채움. 기존 장식 프레임·안쪽 문양·컨트롤 유지. 이전 외곽 투명 계약의 로비 부분은 이 규칙으로 대체 |
| 캐시 | index.html ui-refinement.css?v=20260927-selected-fit |
| 검증 | 실제 HTML/CSS 격리 렌더2560×900,1920×1080,1600×900,960×540에서 원본 전체 포함·선택 영역과 우측 패널 겹침 없음·횡넘침 없음. 2560×900 표시1588.35×900/가용1664×900,전체 문구와 머리·발 시각 확인. 기능/저장 변경 없음 |
| 기록 | tmp/lobby-selected-fit/report.json,ultrawide.png,changes.patch. 기존 터미널/.git 제한으로 커밋 미완료 |


## 2026-09-27 실버테일 이전 초상화·애니메이션 복원 및 영상 잘림 방지

| 항목 | 현행 규격 |
|---|---|
| 사용자 결정 | 실버테일 애니메이션 전환 요청 후 초상화 교체 이력 확인,이전 초상화·영상 복원 방향으로 진행. 정적 키아트만 표시하던 당일 변경을 대체 |
| 복원 | tmp/silvertail_art_backup_20260927.zip에서 assets/charselect/silvertail_cut.png,portrait_silvertail.png,poster_idle_silvertail.jpg,idle_silvertail.mp4 4개 원본 바이트 복원. 기존 PNG2장은 삭제하지 않고 보관,CHAR_VISUALS에서 미사용 |
| 연결 | CHAR_VISUALS[1] portrait=silvertail_cut.png,bust=portrait_silvertail.png,idleVid=idle_silvertail.mp4,poster=poster_idle_silvertail.jpg. 네 경로 v=20260927-restored. 기존 bg_scene2.png?v=1/bg_scene2_loop.mp4?v=1 복원. comingSoon:true 유지 |
| 영상 | 실버테일1280×720/3초,기본1배속·muted/loop/playsinline. 로비 및 선택창 기존 video 경로로 재생,오류 시 같은 캐릭터 포스터·정적 초상화 사용 |
| 목 잘림 | 전사 원본 및 로비 중간 프레임에 머리 정상. #charVisualPop .cs-idle-vid 기본cover→contain/center top/transform:none,21:9 이상 scale1.15/scaleX1.1 제거. 로비 contain 배율 유지 |
| 검증 | 실제 로비 영상 실버테일0.2초/1.5초 프레임 축소 샘플값279839597/268599186으로 동작 확인. 초광폭2560×900 선택창 전사3840×2160/5.541667초 및 실버테일1280×720/3초 모두 contain/transform none 확인. 관련10개 회귀 통과 |
| 생성·기록 | 새 Higgsfield 영상 생성 제출 없음. tmp/silvertail-animation-restore/에 백업·복원 자산 목록·브라우저 캡처·report.json·코드/문서 changes.patch. 기존 터미널/.git 제한으로 커밋 미완료 |


## 2026-09-27 미선택 기사 배경 머리 잘림 수정

| 항목 | 현행 규격 |
|---|---|
| 원인 | 사용자233356 스크린샷은 선택 전 #lobbyBgImg. 선택 영상만 contain으로 바꾼 뒤 미선택 배경cover/전체화면 크기/자동줌이 남아 투구·머리 잘림 |
| 적용 | .lobby>.lobby-bg-img:left0,right:auto,width65%,background-size:contain,background-position:center center,animation:none,transform:none. 폭1100px 이하 width55%. 기존 z-index0/pointer-events:none 유지 |
| 표시 | 원본 전체를 좌측 영역 안에 표시,비율 차이는 검정 여백. 기존 로비 Ken Burns 확대는 이 요소에서 사용하지 않음. frost/flame/abyss1536×1024 원본·선택 정책 변경 없음 |
| 상태 | 선택 전에는 배경1개,선택 후에는 기존 선택 캐릭터 영상·정적 폴백으로 전환. 이번 수정은 미선택 상태의 표시 배율만 변경 |
| 캐시 | index.html ui-refinement.css?v=20260927-unselected-fit |
| 검증 | 실제 HTML/CSS 격리 브라우저:배경3종×2560×900/1920×1080/1600×900/960×540=12경우 contain/animation none/transform none·우측 겹침 없음·횡넘침 없음 확인. frost투구·까마귀·고양이·검 원본 전체 시각 확인 |
| 기록 | tmp/lobby-unselected-fit/report.json,frost-after.png,changes.patch. 기존 터미널/.git 제한으로 커밋 미완료 |


## 2026-09-27 로비 입장 버튼 자동 배율 복원

| 항목 | 현행 구현 |
|---|---|
| 원인 | ui-foundation.css의 고정 max-height 120px 및 낮은 화면 96px 규칙이 index.html의 반응형 배율을 덮어씀 |
| 크기 | .lobby-right .enter-game-btn img: width 100%, height auto, object-fit contain; max-height min(500px,28dvh), 미지원 환경은 min(500px,28vh) |
| 선택 상태 | 선택/미선택 이미지 크기는 동일. 기존 점등/소등 필터 유지 |
| 실측 | 3840×2160: 높이490.17px, 2560×1440:319.14px, 1920×1080:233.63px, 1280×720:148.11px, 960×540:135.14px. 이미지 원본 종횡비 유지 |
| 검증 | 실제 index.html/CSS를 스크립트 비활성 상태로 확인. 5개 해상도 가로 넘침 없음 및 선택 전후 동일 크기. 별도 3개 더미 카드 배치 후 1080/720/540 높이에서 스크롤로 버튼 전체 접근 확인. 로그인·세이브 API 미실행 |
| 캐시 | index.html의 ui-foundation.css?v=20260927-enter-responsive |
| 이전 기록 | 소등 검증 당시 높이120px 기록은 과거 측정값이며 현행 크기 계약은 이 표를 따름 |


## 2026-09-28 로비 중간 높이 배너 압축 방지

| 항목 | 구현 계약 |
|---|---|
| 원인 | 높이681~720px에서 display:contents와 배너 flex 축소가 결합해 3개 카드 검수 시 배너가6px로 압축됨 |
| 수정 | .lobby-content의 flex column 및 overflow-y:auto/overflow-x:hidden을 모든 높이에 적용. 기존 scrollbar-gutter:stable,padding-right8px,scroll-padding-block4px 유지. 직계 자식 flex-shrink0 및 배너 flex:0 0 auto/overflow:visible |
| 배치 | 충분한 높이에서는 스크롤 없음. 부족할 때 패널 내부 스크롤로 배너와 입장 버튼 모두 접근. 기존 680px 한정 규칙 대체 |
| 검증 | 디스크에 저장한 실제 로비 HTML/CSS를 새 브라우저 페이지로 불러와 스크립트 비활성 및 3개 검수용 카드로 검증. 3840×2160,1920×1080,1920×720,2560×720,1280×681,960×540 모두 가로 넘침 없음 및 버튼 전체 접근. 681~720 높이 배너132px 복원 |
| 캐시 | index.html의 ui-refinement.css?v=20260928-lobby-content-fit |


## 2026-09-28 로비 안내 제목·이름 줄바꿈

| 항목 | 현행 규격 |
|---|---|
| 원인 | .char-disp-title의 white-space:nowrap 때문에 640×480에서 SIAPAKAH ENGKAU?가 좌측 영역을 넘어 오른쪽 패널 뒤로 잘림 |
| 수정 | index.html .char-disp-title: white-space:normal,overflow-wrap:anywhere,text-wrap:balance. 기존 폰트 크기·색·선택 상태·장식 유지. 들어가는 문구는 한 줄,긴 문구는 가용 폭에서 줄바꿈 |
| 검증 | 실제 수정 HTML/CSS를 스크립트 비활성 브라우저에 로드. 중복 제외 번역·한국어·8글자 한글/영문 이름 28개 × 1920×1080,960×540,640×480,480×360 = 112조건 텍스트 범위가 제목 폭 안에 포함됨 확인 |
| 범위 | 표시 CSS만 수정. 이름 값·번역 문자열·캐릭터 에셋·저장 동작 변경 없음 |
| 기록 | tmp/lobby-title-wrap/report.json,after.png,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 로비 우측 하단 게임 종료

| 항목 | 현행 구현 |
|---|---|
| 배치 | index.html #lobbyQuitBtn, type=button. .lobby-bottom-actions를 .lobby-content 밖 우측 패널 하단에 배치하여 스크롤과 독립. 시네마틱 좌측,버전·종료 우측 |
| 스타일 | 로비 인라인 CSS. 종료 최소높이32px,padding4px 6px,글자.7rem,기본색#b8a386,hover/gp-hover#f1b6a2. corner gap12px 및 flex-wrap. 종료/입장/시네마틱/언어선택 focus-visible outline-offset:-2px로 잘림 방지 |
| 확인 | _showLobbyQuit → 기존 확인창 _showDelConfirm의 선택적 message 인수 사용. 기본 취소,Escape/B 취소,Tab 초점 순환 및 닫은 뒤 원래 버튼 초점 복원. 기존 삭제 기본 문구·동작 유지 |
| 종료 | window.nw.App.quit 우선,다음 window.electronAPI.quitApp을 await,일반 브라우저 window.close. 브라우저가 닫히지 않으면150ms 뒤 직접 탭 닫기 안내. 실패 시 안내 메시지. 세이브 삭제·변경 없음 |
| 입력·언어 | 로비 게임패드 수집 목록에 #lobbyQuitBtn 포함. 버튼은 _applyLobbyLang의 한국어/영어 fallback,확인/오류/브라우저 안내는 한국어 또는 영어 |
| 검증 | 실제 확인창 코드 격리 실행:취소 기본/Escape 복귀/취소 시 종료0회,NW·Electron·브라우저 각 stub1회. 1920×1080,1280×720,960×540에서 하단 버튼 전체 표시 및 초점offset -2px. 실제 앱 종료·실물패드·실계정 저장은 실행하지 않음 |
| 기록 | tmp/lobby-quit/after.png,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 종료·삭제 확인창 스틱 입력 재진입

| 항목 | 현행 규격 |
|---|---|
| 재현 | 왼쪽 스틱을 기울인 채 확인창을 열면 다음 프레임에 기본 취소가 확인으로 바뀜. 신규 회귀 테스트로 수정 전 실패 확인 |
| 수정 | _showDelConfirm 진입 시 _GP.prev._dlL/_dlR을 현재 _GP.axes[0]의 -0.5 미만/+0.5 초과 상태로 초기화. 진입 전에 유지하던 기울임은 선택을 바꾸지 않고,중립 복귀 후 새 입력부터 처리 |
| 적용 | 종료·캐릭터 삭제 공용 확인창. 기본 취소,새 D-pad 입력,A확정/B취소,키보드 Tab/Escape 및 비동기 중복 방지 유지 |
| 검증 | test/lobbyConfirmStick.test.js 신규2개와 characterSync/lobbyGamepadRefresh 포함18개 통과. 유지된 왼쪽 입력+A는 취소되어 콜백0회,중립 후 다시 왼쪽+A는 콜백1회. 실물 패드·실제 종료·저장 삭제 실행 없음 |
| 기록 | tmp/lobby-confirm-stick 백업 및 changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 확인창 Enter·Space 자동 반복 차단

| 항목 | 현행 규격 |
|---|---|
| 재현 | 종료 버튼에서 Enter를 유지하면 확인창 취소 버튼으로 반복 keydown이 전달되어 창이 즉시 닫힘 |
| 수정 | #delConfirmModal keydown에서 repeat이며 key가 Enter 또는 공백이면 preventDefault/stopPropagation 후 반환. 키를 놓고 다시 누르는 기본 버튼 활성화는 유지 |
| 범위 | 종료·캐릭터 삭제 공용 확인창. 기존 Tab 초점 순환/Escape 취소,게임패드,비동기 중복 제출 방지 유지 |
| 검증 | 신규 Enter/Space 회귀2개는 수정 전 실패 후 통과. 관련20개 테스트 통과. Chromium 실제 키 입력으로 Enter 반복2회에도 확인창 유지·취소 초점·종료0회,해제 후 Tab/Enter는 종료 stub1회 확인. 실제 앱 종료·삭제 미실행 |
| 기록 | tmp/lobby-confirm-repeat/browser-report.json 및 changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 하단 정렬 및 전원 아이콘 종료 버튼

| 항목 | 현행 규격 |
|---|---|
| 사용자 확정 | 게임 종료 글자 버튼을 전원 종료 모양 아이콘으로 교체 |
| 아이콘 | #lobbyQuitBtn 내부 인라인 SVG viewBox0 0 24 24,표시20×20,stroke currentColor/1.8,둥근 선 끝. 버튼36×36,padding7px,원형 border-radius50%,border1px #77604766,배경#100d0e80,색#b8a386 |
| 상호작용 | hover/gp-hover 색#f1b6a2,테두리#bd795b,배경#52261f66. 기존 종료 확인창 및 키보드·패드 동작 유지 |
| 언어·접근성 | SVG aria-hidden=true/focusable=false. 버튼 aria-label/title은 한국어 게임 종료,번역값 또는 영어 Quit Game. _applyLobbyLang에서 textContent 교체 대상에서 제외하고 속성만 갱신하여 SVG 보존 |
| 하단 정렬 | .lobby-corner-actions flex1 1 auto/min-width0,줄바꿈 제거. 양쪽 버튼 flex0 0 auto/white-space nowrap. 버전 min-width0/overflow hidden/text-overflow ellipsis/white-space nowrap/margin-top0/text-align right,실제 버전 전체 문구는 title에 저장 |
| 검증 | 실제 HTML/CSS에서1920×1080,960×540,640×480,480×360 모두36×36 아이콘 화면 안. 한국어/영어 속성 갱신 후 SVG1개 유지. 이전 영문 텍스트 버튼640px창 높이74px/시네마틱 두줄 문제도 해소. 실제 종료 미실행 |
| 기록 | tmp/lobby-footer-fit/power-after.png,power-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 게임패드 연결 표시와 전원 버튼 겹침 제거

| 항목 | 현행 규격 |
|---|---|
| 재현 | 기존 fixed right14px/bottom12px/24px 🎮 표시가960×540에서 전원 버튼 영역과 겹침 |
| 배치 | 로비 display:flex일 때 _gpDot이 #lobbyCornerActions의 #lobbyQuitBtn 앞에 표시 노드를 이동. 로비 밖은 body로 복귀하여 기존 fixed 위치 유지. 연결 상태가 같아도 화면 전환에 따른 부모 이동은 수행 |
| 로비 표시 | position:static!important,flex0 0 auto,font-size18px!important,line-height1,width24px,text-align center. 기존 하단 gap12px로 전원과 분리 |
| 연결 해제 | hidden=true 및 opacity0,다시 연결 시 hidden=false/opacity1. aria-hidden=true와 기존 pointer-events:none 유지,Tab 대상 아님 |
| 검증 | 실제 HTML/CSS 및 실제 _gpDot 함수 격리 실행. 1920×1080,960×540,640×480,480×360 모두 겹침·가로 넘침 없음,전원과12px 간격. 연결 해제 공간 반환,로비 밖 body 이동 및 동일 연결 상태에서 로비 복귀 확인. 실물 패드 검증 아님 |
| 기록 | tmp/lobby-pad-indicator/after.png,report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 종료 확인창 초점 복귀 일치

| 항목 | 현행 규격 |
|---|---|
| 재현 | 패드의 programmatic click은 DOM 초점을 옮기지 않아 종료창 취소 후 이전 언어 select로 초점이 복귀함 |
| 수정 | _showLobbyQuit 진입 시 #lobbyQuitBtn.focus({preventScroll:true}) 후 공용 확인창을 열어 실제 실행 버튼을 복귀 대상으로 저장 |
| 유지 | 삭제 확인창의 복귀 규칙과 종료 확인/취소 동작 유지. 스크롤 위치를 변경하지 않음 |
| 검증 | 신규 회귀 수정 전 실패 후 통과,확인창·캐릭터 동기화13개 통과. Chromium에서 언어 select 초점→프로그램 클릭→Escape 후 lobbyQuitBtn 복귀/종료0회 확인. 확인창960×540,640×360,360×280 모두 화면 내 |
| 기록 | tmp/lobby-quit-focus/report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 로비 상태 안내 고정 노출

| 항목 | 현행 구현 |
|---|---|
| 재현 | 960×540에서 카드3개 및 scrollTop0일 때 lobbyStatus 하단487px가 스크롤 패널 하단474px를 넘어 안내가 잘림 |
| 위치 | #lobbyStatus를 .lobby-content 밖, .lobby-bottom-actions 바로 앞으로 이동. 카드 스크롤 위치와 독립적으로 표시 |
| 규격 | line-height1.5,max-height min(80px,20dvh),overflow-y auto,overflow-wrap anywhere,flex0 0 auto. 기존 글꼴.75rem/padding8px/role status/aria-live polite 및 리프 갱신 유지. :empty display none으로 빈 공간 제거 |
| 긴 안내 | 상한을 넘는 문구는 안내 자체에서 스크롤. 하단 전원 버튼 위치 보존 |
| 검증 | 실제 HTML/CSS 1920×1080,960×540,640×360 × 빈문구/21자안내/450자오류 총9조건에서 가로 넘침 없음·안내 영역 및 전원 화면 내. 빈 상태높이0,긴 안내높이80/80/72px 및 내부스크롤. 캐릭터 동기화·삭제 실패 회귀8개 통과 |
| 기록 | tmp/lobby-notice-visible/report.json,after.png,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 상태 안내 교체 시 읽기 위치 초기화

| 항목 | 현행 규격 |
|---|---|
| 재현 | 긴 오류를 스크롤한 뒤 새 오류로 교체해도 scrollTop260px가 유지되어 새 안내 첫 문장이 보이지 않음 |
| 수정 | setStatus의 status/lobbyStatus 리프에서 textContent가 새 메시지와 다를 때만 교체하고 scrollTop0. 동일 문구는 노드·스크롤을 유지하고 error 클래스만 갱신 |
| 유지 | 자식 노드가 있는 컨테이너는 수정하지 않는 기존 DOM 보호 유지. 생성창·로비 모두 적용 |
| 검증 | 신규 회귀 수정 전 실패 후 통과. 캐릭터 동기화/확인창 포함14개 통과. 실제 Chromium 새 내용 교체 시 scrollTop0,동일 내용 재설정 시120 유지 확인 |
| 기록 | tmp/lobby-status-reset/report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 종료 상태 안내 언어 갱신

| 항목 | 현행 규격 |
|---|---|
| 수정 | setStatus는 기존 문자열 외에 {ko,en} 메시지를 지원. _localizedStatus에 메시지·오류 여부를 보관하고 현재 언어가ko이면 한국어,그 외에는 기존 영어 fallback 사용 |
| 전환 | _applyLobbyLang에서 _refreshStatusLanguage 호출. 현재 보관된 번역 가능 안내만 다시 표시. 일반 문자열·빈 메시지로 교체하면 메타데이터 제거하여 이전 안내 복원 방지 |
| 적용 | 브라우저 탭 직접 닫기 안내와 게임 종료 실패 안내. 서버 오류 원문은 번역하거나 제거하지 않음. 다른 언어에 신규 번역을 추가한 것은 아님 |
| 안전성 | 초기 언어 적용 시 _refreshStatusLanguage는 document.getElementById를 사용하여 뒤에서 선언되는 $ 참조를 피함. 자식 노드 보호·내용 변경 시 scrollTop0·같은 내용 읽기 위치 유지 |
| 검증 | 언어 왕복/오류 스타일 유지/서버 오류 보존/빈 문구/초기 DOM 헬퍼 미선언 회귀 포함17개 통과. 별도 기존 선택정보·언어 팝업9개 통과 |
| 기록 | tmp/lobby-status-language/changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 낮은 로비 로딩 여백 압축

| 항목 | 현행 구현 |
|---|---|
| 재현 | 960×540 로비 초기 로딩 상태에서 입장 버튼 하단548.33px이 내부 패널 하단474px을 넘어 잘림. sticky 버튼은 배너를 덮어 불채택 |
| 원인 | .no-chars 로딩 문구 위아래40px과 헤더/구분선/배너 간격 누적. 480px 높이에서는 외부 ui-refinement.css가 로고 구분선80px!important로 덮어씀 |
| 높이680px 이하 | .no-chars padding4px 20px,헤더/구분선 margin-bottom4px,배너 위아래 padding4px,mid-area padding-top0. 로딩 빈 공간만 압축하고 입장 버튼 이미지는 기존 반응형 크기 유지 |
| 높이480px 이하 | #lobby .lobby-right .lobby-divider height52px!important로 외부 스타일 우선순위 해결, .no-chars padding0 20px |
| 범위 | 로비 초기 로딩 텍스트와 짧은 화면의 간격. 캐릭터3개 등 내용이 화면보다 길면 기존 .lobby-content 내부 스크롤 유지 |
| 검증 | 실제 index.html 및 외부 CSS 재로딩 후1920×1080,1280×720,960×540,800×480,640×480에서 Steam 배너·입장 버튼 초기에 모두 표시,가로 넘침 없음. 480×360은 내부 스크롤 필요·가로 넘침 없음 |
| 기록 | tmp/lobby-loading-compact/after.png,report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 전원 아이콘 터치 영역 확대

| 항목 | 현행 규격 |
|---|---|
| 원인 | 로비 전원 버튼이 터치 환경에도36×36px로 남아 기존 카드 내비·삭제44×44px 규격보다 작음 |
| 조정 | @media(pointer:coarse) #lobbyQuitBtn width44px,height44px,min-height44px,padding11px. 기존20×20px SVG·원형·종료 확인 동작 유지 |
| 동시 배치 | 터치 전용 로딩 문구 padding0 20px 및 하단 액션 padding-top0으로 추가8px 높이를 흡수. 기존 버튼 배율·본문 배너를 줄이지 않음 |
| 검증 | Chromium hasTouch 환경에서 pointer:coarse=true 확인. 1280×720,960×540,800×480,640×480에서 전원44×44px,전원·입장 버튼 초기 화면 내,횡넘침 없음. 실제 터치 기기 검증은 아님 |
| 기록 | tmp/lobby-power-touch/after.png,report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 로비 선택 직업명 영문 대체 문구

| id | 한글 키 | 영문 기본값 | 표시 위치 |
|---|---|---|---|
| CHAR_VISUALS[0] | 전사 | Warrior | #charDispSub, _TL(_vi.job) |
| CHAR_VISUALS[1] | 블레이드 댄서 | Blade Dancer | #charDispSub, _TL(_vi.job) |

기존 _LOBBY_EN에 두 키를 추가한다. 한국어에서는 원문을 유지하고 영문에서는 번역을 사용한다. 다른 언어 전용 키가 없으면 기존 _TL의 영문 fallback을 사용하며, 각 언어 번역 완료로 간주하지 않는다. 캐릭터 데이터·영상·생성 가능 여부는 변경하지 않는다. 실제 _TL 함수와 영문 테이블 회귀 테스트 5개 통과. tmp/lobby-job-translation/changes.patch에 변경 기록, 기존 Git 쓰기 제한으로 커밋 미완료.


## 2026-09-28 좁은 캐릭터 카드 정보 재배치

| 항목 | 현행 규격 |
|---|---|
| 원인 | 640×480 카드에서 이름과 직업 배지가 같은 행을 나눠 사용하여 이름폭25px/직업33px로 한두 글자만 표시 |
| 기준 | #lobby .char-list container-type:inline-size/container-name:lobby-cards. 열 폭300px 이하에서만 재배치,넓은 열 기존 한 줄 유지 |
| 좁은 카드 | 왼쪽padding12px,gap10px,초상화40×40px. 이름행 column/align-start/gap2px,이름 font.9rem/line-height1.2,width100%. 직업 max-width100%/line-height1.2. 텍스트 gap2px,진행정보 font.65rem/line-height1.3 |
| 유지 | 카드 높이84px,이름·직업 말줄임,이름 title 및 삭제 영역 desktop48px/coarse64px 유지 |
| 검증 | 실제 HTML/CSS 영문8글자 이름·Blade Dancer 카드로1280/960/800/640 화면 확인. 좁은800/640 이름폭169.36/97.36px,텍스트 카드 안·삭제와10px 간격.640×480 터치 에뮬레이션에서도 삭제44×44px·간격10px·텍스트 카드 안 확인 |
| 기록 | tmp/lobby-narrow-cards/after.png,report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 캐릭터 카드 전체 정보 안내

| 항목 | 현행 규격 |
|---|---|
| 원인 | 카드 전체를 덮는 .char-select의 안내는 이름·직업만 포함하여 말줄임된 진행 정보는 전체 확인 불가. 개별 리프 title은 위의 버튼 때문에 마우스 대상이 아님 |
| 수정 | _addLobbyCardControl에서 .char-info 리프의 trim한 텍스트를 읽어 기존 label 뒤에 구분자 · 와 함께 추가. 실제 선택 버튼 title과 aria-label에 동일한 전체 설명 적용 |
| 범위 | 온라인·로컬 공통 카드. 진행 정보 없는 생성 카드는 기존 label 유지. DOM 내용·카드 크기·클릭/삭제 동작 변경 없음 |
| 검증 | Chromium640×480 실제 선택 버튼이 진행 정보 위의 마우스 대상임을 확인. tooltip/aria에 이름·Blade Dancer·Lv.99·Chapter7 전체 포함,자식 이름 노드 유지. 선택정보·패드 회귀13개 통과 |
| 기록 | tmp/lobby-card-full-info/changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 삭제 취소 후 실제 실행 버튼으로 복귀

| 항목 | 현행 규격 |
|---|---|
| 재현 | 패드 X가 삭제 버튼 click을 프로그램으로 실행하면 기존 DOM 초점이 언어 메뉴 등에 남아 취소 후 엉뚱한 메뉴로 복귀 |
| 수정 | 온라인·로컬 카드 삭제 click 핸들러가 e.currentTarget.focus({preventScroll:true}) 후 _showDelConfirm 호출. 기존 공용 복귀 처리로 방금 삭제를 요청한 버튼에 복귀 |
| 유지 | 삭제 요청·확정·취소·버튼 크기·키보드/패드 행동 유지. 초점 이동 자체로 스크롤을 바꾸지 않음 |
| 검증 | 신규 온라인/로컬 회귀2개 수정 전 실패→통과. 실제 이벤트 앞부분 및 확인창을 Chromium에 격리 실행,언어 select 초점에서 프로그램 클릭→Escape 후 각 삭제 버튼 복귀/삭제 콜백0회. 확인창·캐릭터 동기화·패드26개 통과 |
| 테스트 보완 | characterSync 테스트의 빈 카드 DOM에 querySelector(null) 동작을 추가하여 앞선 전체 카드 정보 안내와 호환. 실제 삭제 API 호출 없음 |
| 기록 | tmp/lobby-delete-focus/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 로비 게임패드 사용 불가 카드 제외

| 항목 | 현행 계약 |
|---|---|
| 원인 | 빈 슬롯 및 생성 한도에 도달한 새 캐릭터 카드는 inline pointer-events:none이지만 기존 패드 수집은 offsetParent만 검사하여 동작 없는 칸에 정지 |
| 대상 수집 | _navItems는 offsetParent===null 또는 el.style.pointerEvents===none인 요소를 제외. 온라인·로컬 공통 빈 슬롯과 생성 불가 카드,기존 숨김/disabled 버튼 제외 유지 |
| 강조 정리 | 이전 _GP.prev._lobbyEl이 새 cur.el과 다르면 gp-hover·inline outline·outlineOffset을 제거. 같은 요소의 인덱스만 바뀌면 강조선 유지 |
| 검증 | 신규4회귀 수정 전 실패→수정 후 통과. 카드 사이 비활성 칸 건너뛰기 및 선택 중 비활성화 확인. 탐색·확인창·캐릭터 동기화30개 통과. Chromium800×480 실제 로비 DOM/탐색 함수에서 usableFirst→usableLast,빈 칸 강조 없음·비활성 카드 강조선 제거 확인. 실물 패드 미검증 |
| 기록 | tmp/lobby-gamepad-disabled/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 데모 로비 자동 선택 유지

| 항목 | 현행 계약 |
|---|---|
| 원인 | _renderSlotList의 데모 분기가 고정 캐릭터를 선택한 뒤 loadLocalCharacters의 마지막 _updateCharDisplay()가 표시·영상·입장 버튼을 다시 초기화. _selectedSlot=demo와 active 카드만 남아 표시와 불일치 |
| 초기화 순서 | loadLocalCharacters 시작에서 _selectedSlot/_selectedSlotName=null 및 _updateCharDisplay()로 이전 선택 초기화. 로딩 완료 후 _renderSlotList만 호출하며 뒤의 중복 초기화 제거 |
| 데모 | _renderSlotList가 _selectedSlot=demo,_selectedSlotName=demo,_updateCharDisplay({name:DEMO CHARACTER,charIdx:0,stage:0})를 적용. 로딩 후 active 카드·이름·전사 미디어·enabled ENTER/점등 유지 |
| 일반 로비 | 자동 선택 추가 없음. full 로컬 목록은 초기화 상태로 렌더하며 사용자가 선택하기 전 입장 disabled/소등 유지. 온라인 동작 변경 없음 |
| 검증 | 데모 서버 성공/브라우저 저장 폴백2회귀 수정 전 실패→통과 및 full 선택 초기화1건 추가. 개발 슬롯·데모 경로·선택 정보·캐릭터 동기화28개 통과. Chromium960×540 실제 HTML/CSS/함수 격리 실행에서 demo/full×서버 성공/실패4건,선택·제목·배경·ENTER disabled/filter 일치 확인 |
| 범위·기록 | 사용자 저장 데이터 수정·실제 게임 입장·패키지 갱신/업로드 없음. tmp/lobby-demo-selection/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 로비 목록 모드 전환 시 휠 충돌 제거

| 항목 | 현행 계약 |
|---|---|
| 원인 | 로컬 _renderSlotList가 #charList 부모에 _wheelBound로 wheel을 영구 연결. 온라인 전환 후 .char-scroll-vp wheel 이벤트가 부모로 전파되면 오래된 로컬 핸들러도 실행하여 온라인 카드가 로컬 카드로 교체 |
| 수정 | 로컬 wheel을 현재 렌더한 vp(.char-scroll-vp)에 연결,온라인과 동일 범위. cl._wheelBound 제거. replaceChildren으로 뷰포트가 교체되면 이전 핸들러도 현재 목록 이벤트 경로에서 제외 |
| 입력 범위 | 캐릭터 카드 뷰포트 위에서 목록 이동. 고정 생성 카드·화살표 등 뷰포트 밖의 휠은 본문 스크롤로 전달. 시작/끝/deltaY0은 preventDefault하지 않음. Math.sign(deltaY),현재 _localSlots 길이 및 VIEW2 유지 |
| 검증 | 신규2회귀 수정 전 실패→통과. 로컬→온라인 전환 후 휠1회가 온라인 인덱스만 이동,로컬 인덱스0 유지. 로컬 왕복/끝 경계 기본 스크롤 확인. 슬롯·패드 탐색·캐릭터 동기화·데모 경로37개 통과 |
| 브라우저 | Chromium960×540 실제 HTML/CSS/렌더러 격리 실행. 버블링 WheelEvent로 수정 전 online1/local1·local-1,local-2 표시 재현→수정 후 online1/local0·online-1,online-2 표시. 계정/저장 API 호출 없음 |
| 기록 | tmp/lobby-wheel-scope/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 로컬 목록 응답 순서 보호

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | loadLocalCharacters에 요청 순서 검사가 없어 이전 API 성공·실패가 최신 _localSlots와 카드 DOM·개발자 표시를 덮어씀. 선택 id/표시는 최신 상태로 남고 목록만 옛 데이터/빈 목록이 되는 불일치 |
| _characterLoadSeq | 로비 공용 선택 상태 옆에 var로 선언,초기값0. loadCharacters/loadLocalCharacters 진입마다 request=++_characterLoadSeq를 캡처 |
| API 성공 | await res.json() 완료 직후 request!==_characterLoadSeq이면 return. 최신 요청만 _localSlots 및 _developerSlots를 반영하고 렌더 |
| API 실패 | catch 진입 즉시 같은 순서 검사. 오래된 fetch/JSON 오류는 localStorage 폴백·배열 초기화·표시 갱신 없이 return. 최신 실패의 기존5칸 폴백은 유지 |
| 선택 상태 | 최신 목록에서 선택한 카드가 이전 응답으로 교체되지 않음. 목록 조회 시작의 선택 초기화·데모 자동 선택·최신 요청 렌더 규칙은 유지 |
| 테스트 | 오래된 성공/fetch 실패/JSON 실패 및 JSON 파싱 지연4회귀 수정 전 실패→통과. 개발 슬롯·캐릭터 동기화·데모 경로·패드 탐색41개 통과 |
| 브라우저 | Chromium960×540 실제 HTML/CSS/함수 격리 실행에서 두 요청 완료 순서 역전 후 최신 카드 선택. 수정 전 성공은 old 카드/active 없음,실패는 빈 목록/active 없음으로 재현. 수정 후 두 상황 모두 latest 카드·active·선택 이름·ENTER 활성·개발자 표시 유지 |
| 범위·기록 | 현행은 공용 _characterLoadSeq로 온라인/로컬 요청 간 늦은 응답까지 차단. 실제 네트워크 취소는 하지 않음. 사용자 저장·실계정 API 변경 없음. tmp/lobby-local-load-order/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 온라인·로컬 목록 요청 번호 통합

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | 기존 모드별 요청 번호는 같은 모드의 역전만 차단. 반대 모드 목록을 불러온 뒤 이전 성공·오류가 도착하면 카드 목록만 이전 모드로 바뀌고 선택 이름/ENTER는 현재 상태로 남음 |
| _characterLoadSeq | index.html 로비 선택 상태 옆의 공용 var,초기값0. loadCharacters/loadLocalCharacters 모두 시작 시 request=++_characterLoadSeq 캡처. 기존 _onlineLoadSeq/_localLoadSeq 선언 제거 |
| 온라인 반영 | request!==_characterLoadSeq 또는 계정 없음/조회 당시 userId와 다르면 무시. 서버 성공 및 error 메시지 출력 전에 검사. 기존 계정 소유 확인 유지 |
| 로컬 반영 | JSON 파싱 완료 후 및 catch 진입 시 같은 공용 번호 검사. 이전 fetch/JSON 실패는 폴백·렌더 없이 반환. 최신 요청의 개발 플래그 및5칸 폴백 유지 |
| 모드 전환 | 반대 모드의 새 목록 요청 자체가 이전 요청을 무효화. 기존 모드 내 늦은 응답 보호도 동일 번호로 유지. 네트워크 요청 자체를 중단하거나 로그인/시네마틱 전환만으로 취소하는 기능은 추가하지 않음 |
| 검증 | 로컬→온라인/온라인→로컬×이전 성공/실패4회귀 수정 전 실패→통과. 슬롯·캐릭터 동기화·데모 경로·패드 탐색45개 통과 |
| 브라우저 | Chromium960×540 실제 HTML/CSS/함수 격리 실행 전후8조건. 수정 전 반대 모드 카드/빈 목록·active 없음 재현. 수정 후 현재 카드·active·선택/표시 이름·ENTER 활성·모드에 맞는 개발자 표시 유지 |
| 범위·기록 | 실계정/저장 API 및 사용자 저장 데이터 변경 없음. tmp/lobby-list-mode-order/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 로비 이탈 후 목록 응답 무효화

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | 목록 대기 중 로그인/시네마틱으로 이동해도 번호가 유지되어 늦은 응답이 숨긴 로비를 재렌더. 데모에서는 자동 선택·ENTER 활성·캐릭터 영상 표시를 다시 켬 |
| _goLogin | 함수 진입 직후 ++_characterLoadSeq. 로그인 화면·시네마틱 handoff·언어·데모 입장 버튼 등 기존 전환 유지 |
| _goCinematic | 함수 진입 직후 ++_characterLoadSeq. 기존 영화 초기화·다시보기·화면 전환 유지 |
| 응답 | 기존 loadCharacters/loadLocalCharacters의 공유 번호 검사로 이탈 전 대기 요청을 무시. 실제 네트워크 중단 없음. 새 로비 진입에서 다시 요청하면 정상 렌더 |
| 테스트 | 실제 두 전환 함수×온라인/로컬×성공/오류8회귀,완전한 전환용 DOM/타이머 대역에서 수정 전8실패→수정 후통과. 목록·캐릭터 동기화·데모·패드·영화 handoff55개 통과 |
| 브라우저 | Chromium960×540 실제 HTML/CSS/함수 격리 실행,두 전환×데모 성공/오류 전후8조건. 수정 전 숨긴 로비의 demo 선택·영상 show·입장 활성 재현→수정 후 카드 DOM 유지·선택 null·영상 show 없음·입장 disabled 유지 |
| 범위·기록 | 현행 _goLogin/_goCinematic은 선택 상태와 로비 영상 src/poster를 정리. 로비 로딩 후처리도 현재 _characterLoadSeq와 lobby 표시 상태를 검사. 실제 계정·저장 API/사용자 데이터 변경 없음. tmp/lobby-leave-load/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 로비 이탈 시 선택 영상 해제

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | 이미 선택한 lobbyCharPreview는 로그인/시네마틱 진입 후에도 재생. _selectedCharDisplay도 남아 언어 적용의 선택 정보 갱신이 숨겨진 영상을 다시 play할 수 있음 |
| _goLogin/_goCinematic | ++_characterLoadSeq 직후 _selectedSlot=null,_selectedSlotName=null,_updateCharDisplay() 실행. 이전 응답 무효화 및 선택/미디어 해제 |
| 영상 | 기존 _updateCharDisplay의 미선택 분기로 pause,onerror=null,show 제거,src/poster 제거,load 호출. 정적 keyart의 show/src도 제거 |
| 표시 | _selectedCharDisplay=null,ENTER disabled/소등,선택 제목/직업 초기화,디폴트 배경 복원. 저장 데이터·캐릭터 외형 에셋·원본 비율 변경 없음 |
| 재진입 | 기존 목록 조회 및 선택 경로에서 다시 영상 src/poster를 설정하고 play. 선택 언어 갱신은 _selectedCharDisplay가 null이면 영상 재생 경로에 진입하지 않음 |
| 테스트 | 실제 표시 함수 및 두 전환 함수의 영상 정지/소스 제거/선택 초기화2회귀 수정 전 실패→통과. 슬롯·캐릭터 동기화·데모·패드·영화 handoff·선택 정보62개 통과 |
| 브라우저 | Chromium960×540 실제 전사0/실버테일1 영상 time>.05s 재생 확인 후 로그인/시네마틱 전후8조건. 수정 전 paused=false/src 유지,수정 후 paused=true/src·poster null/show 없음/ENTER disabled. 선택 정보 갱신 뒤 유지 및 재선택 실제 재생8조건 확인 |
| 범위·기록 | 영상·오디오 원본 교체/생성,사용자 저장 데이터 수정 없음. 현행 로비 로딩 후처리는 현재 요청/표시 상태를 검사. tmp/lobby-leave-media/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 로비 로딩 후처리 요청 확인

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | 목록 함수가 오래된 응답을 무시해도 이를 기다린 _goLobby/showLobby가 마지막 hideLoading을 실행하여 새 요청/다른 화면의 로딩 표시까지 제거. _goLobby는 이미지16장 프리로드도 실행 |
| _goLobby | 모드별 목록 호출의 Promise를 pending에 저장한 뒤 시작된 _characterLoadSeq를 request에 캡처. await pending 후 request!==_characterLoadSeq 또는 lobby.style.display!==flex이면 반환 |
| showLobby | loadCharacters() 호출 직후 pending와 현재 request 캡처. await 후 동일 번호/로비 표시 조건 검사,통과할 때만 hideLoading |
| 후처리 | 현재 로비 진입만 hideLoading 및 _preloadLoadingImgs 실행. 숨겨진 로비/이전 진입은 로딩 DOM·프리로드에 영향 없음. 정상 온라인/로컬 진입은 기존 로딩 종료 유지 |
| 시네마틱 | fromCinematic=true의 전체 화면 로딩 로고 생략 및 목록 내 로딩 표시 유지. 기존 handoff 동작 변경 없음 |
| 테스트 | 온라인/로컬×이전 요청 완료/숨긴 로비 완료4회귀 수정 전 실패→통과 및 정상 완료2건 통과. 데모 경로·목록·동기화·영화 handoff·패드63개 통과 |
| 브라우저 | Chromium960×540 실제 HTML/CSS/로비 진입·로딩 DOM 함수,대기 목록 Promise 격리. 전후8조건: 수정 전 이전 완료가 loading/chapterGate none·프리로드1회,수정 후 새 로딩 block 유지·프리로드0회. 최신 완료는 none·프리로드1회 확인 |
| 범위·기록 | 실계정/저장 API·사용자 데이터·로딩 에셋 변경 없음. tmp/lobby-loading-owner/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 화면 전환 시 언어 메뉴 닫기

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | body에 만든 _langPop이 화면 전환 후에도 block/_langPopOpen=true/aria-expanded=true로 남아 이전 화면 메뉴와 입력 분기를 유지 |
| 전환 | _goLogin/_goCinematic/_goLobby/showLobby 시작에서 if($('_langPop'))_closeLangPop(false) 실행 |
| 닫기 | 기존 함수의 display:none,_langPopOpen=false,원래 select aria-expanded=false 사용. restore=false로 숨겨질 select에 초점 복귀하지 않음. 탐색 인덱스를 언어 선택값으로 확정하지 않으며 change 호출 없음 |
| 초기화 순서 | 초기 오프라인/시네마틱 진입이 뒤쪽 let _langPopOpen 선언보다 먼저 실행될 수 있으므로,동적 팝업 DOM이 생성된 경우에만 닫기 호출. 팝업 없는 초기 진입에서 TDZ 접근 없음 |
| 재열기 | 기존 _openLangPop의 선택값 기준 인덱스·스틱/포인터 초기화 유지. 새 팝업 내용/탐색은 기존 경로 |
| 테스트 | 네 전환×열린 메뉴4회귀 수정 전 실패→통과,초기 메뉴 상태 선언 전 실행4건 통과. 언어 재열기/선택·데모 진입·목록·동기화·영화 handoff·패드77개 통과 |
| 브라우저 | Chromium960×540 실제 HTML/CSS/언어 팝업/전환 함수 격리 전후8조건. 수정 전 메뉴 block/open/expanded=true 유지→수정 후 none/false/false. 선택 인덱스1 유지,change0,원래 select focus0,재열기 정상 |
| 검수 대역 | 기존 진입/영상 테스트의 자동 생성 DOM은 _langPop 미생성 시 null을 반환하도록 보완. 실제 동적 팝업 생성 계약과 일치 |
| 범위·기록 | 사용자 언어·저장 데이터 변경 없음. tmp/lobby-language-transition/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 로비 호버음 소스 정리와 이탈 진동 종료

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | _stopHover가100ms 뒤 전역 _hoverSrc.stop()을 호출하나 즉시 참조를 null로 초기화하여 기존 소스가 종료되지 않음. 새 호버가 시작되면 지연 콜백이 새 소스를 종료. 로그인/시네마틱 이탈은 호버음·패드 반복 진동 정리 누락 |
| _stopHover | 호출 당시 src=_hoverSrc,gain=_hoverGain 캡처. 기존0.08초 fade/100ms 지연 유지. 콜백은 캡처한 src.stop/src.disconnect 및 gain.disconnect만 실행,각 실패 독립 catch. 전역 참조 즉시 null 유지 |
| _goLogin/_goCinematic | 진입 시 try _stopHover/catch 및 사용 가능한 _GP.vibLoopStop 실행. 기존 선택 영상/응답/언어 메뉴 정리 유지. 로비 BGM 정책 및 영화 음량 변경 없음 |
| 초기화 | 초기 동기 진입은 뒤쪽 let 호버 상태 선언 전일 수 있으므로 기존 호출 패턴처럼 try/catch. 아직 재생 소스가 없는 부트에서 전환 중단 없음. 패드 객체/메서드 없는 검수 환경도 허용 |
| 테스트 | 소스 종료·이전 fade가 새 소스를 정지하지 않음·두 전환 호버/진동 정리4회귀 수정 전 실패→통과,호버 초기화 전 전환2건 통과. 언어·데모·목록·동기화·handoff·패드83개 통과 |
| 브라우저 | Chromium960×540 실제 정지/전환/패드 루프 함수와 gain0 무음 AudioBufferSourceNode로 전후6조건. 수정 전 rapid hover는 old ended=false/new=true,이탈은 반복 진동9회까지 증가. 수정 후 old=true/new=false,이탈 loop없음·추가 진동 없음·소스 참조 해제. 실물 패드 진동 검증은 아님 |
| 범위·기록 | 사용자 오디오 청취·실물 패드 실행·음원 교체 없음. tmp/lobby-hover-cleanup/browser-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |


## 2026-09-28 로비 패드 연결 해제 피드백 정리

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | index.html gamepaddisconnected는 connected/active/vibRef만 초기화하여 cursor:none,inputMode=pad,스틱 값,진동 interval,호버음,이전 카드 강조가 남음 |
| 연결 상태 | 기존 connected=false,active=false,vibRef=null 유지. _GP.axes=[0,0,0,0]으로 잔여4축 초기화 |
| 피드백 | _GP.vibLoopStop 및 try _stopHover/catch 실행. 반복 진동 interval 해제,기존 캡처 소스 정지 경로 사용 |
| 강조 | _GP.prev._lobbyEl이 있으면 gp-hover·outline·outlineOffset 제거. prev._lobbyEl 및 prev._lobbyIdx 삭제하여 재연결의 새 강조/피드백 갱신 허용 |
| KBM 복귀 | document.body.style.cursor=빈 문자열,localStorage inputMode=kbm. 선택 캐릭터와 ENTER 활성 상태는 변경하지 않음 |
| 테스트 | 커서/KBM,반복 피드백/스틱,이전 강조/재연결3회귀 수정 전 실패→통과. 패드·handoff·언어·데모·목록·동기화86개 통과 |
| 브라우저 | Chromium960×540 실제 DOM/패드 관리자/연결 이벤트/로비 탐색 함수 모의 실행. 수정 전 cursor none/loop/강조/4축 잔류→수정 후 커서/KBM·loop 없음·강조 제거·4축0. 재연결 후 ENTER 선택에서 hoverStarts1/loop/강조 복구 확인. 실물 연결·진동 검증은 아님 |
| 적용 범위 | index.html 로비의 명시적 gamepaddisconnected와 _gpGlobalPoll의 no-gamepad 경로. game.html의 주입 키·폴링상 일시 소실 정책은 기존대로 유지 |
| 기록 | tmp/lobby-pad-disconnect/browser-report.json,reconnect-report.json,changes.patch. 기존 Git 쓰기 제한으로 커밋 미완료 |

## 2026-09-28 로비 게임패드 폴링 소실 정리

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | _gpGlobalPoll은 navigator.getGamepads()에서 연결된 패드를 찾지 못하면 즉시 return하여 gamepaddisconnected 이벤트를 놓친 BT/절전 소실에서 cursor:none, inputMode=pad, 4축, 진동 루프, 호버음, 이전 카드 강조가 남았다. |
| 공용 정리 | _resetDisconnectedPadState가 connected/active/vibRef를 초기화하고 axes=[0,0,0,0], vibLoopStop, 호버음 정리, 이전 카드 gp-hover/outline/outlineOffset 제거, prev 버튼·방향·카드 래치 전체 초기화, cursor 복구, inputMode=kbm을 수행한다. |
| 이벤트·폴링 | gamepaddisconnected와 _gpGlobalPoll의 no-gamepad 경로가 같은 공용 정리를 사용한다. 폴링에서는 관련 상태가 하나라도 남을 때만 호출하여 패드 없는 프레임마다 호버 정리와 저장 쓰기를 반복하지 않는다. |
| 재연결 | 기존 gamepadconnected가 connected/vibRef를 다시 설정한다. 다음 실제 패드 입력의 로비 탐색이 새 강조와 피드백을 시작한다. |
| 테스트 | no-gamepad 폴링 소실의 상태 정리와 무패드 연속 프레임 idempotent 회귀 2건은 수정 전 실패했고 수정 후 통과했다. 패드, handoff, 언어, 데모, 목록, 동기화 88건이 통과했다. |
| 브라우저 | Chromium 960×540 실제 로비 DOM과 _gpGlobalPoll을 getGamepads 빈 배열 대역으로 실행했다. 수정 전 상태·커서·강조·루프가 두 프레임 유지되고, 수정 후 connected/active false, 4축 0, loop/이전 강조 없음, cursor 복구, KBM, 호버 정리 1회와 두 번째 프레임 동일을 확인했다. 실물 BT/절전 소실 검증은 아니다. |
| 적용 범위 | index.html 로비 글로벌 패드 폴링과 명시적 연결 해제. game.html의 키 주입과 독립 폴링 정책은 변경하지 않는다. |
| 기록 | tmp/lobby-pad-poll-loss/browser-report.json. 기존 Git 쓰기 제한으로 커밋 미완료. |

## 2026-09-28 로비 패드 재연결 첫 입력 정리

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | 연결 해제 뒤 _GP.prev에 이전 장치의 버튼 pressed 상태와 방향 래치가 남으면, 새 패드가 버튼을 누른 상태로 재연결될 때 just 입력이 false가 될 수 있었다. |
| 정리 | _resetDisconnectedPadState는 카드 강조 참조만 지우지 않고 _GP.prev 전체를 새 객체로 초기화한다. |
| 재연결 | 다음 _gpGlobalPoll은 새 장치의 pressed 버튼을 이전 상태 없음으로 비교하므로 첫 프레임의 just 입력을 정상 전달한다. |
| 회귀 | polling loss 뒤 prev[0]과 _lobbyDir이 비워지고, A 버튼을 누른 새 패드의 첫 폴링이 just[0]=true가 되는 테스트를 추가했다. 수정 전 실패, 수정 후 통과. |
| 적용 범위 | index.html 로비의 명시적·폴링 연결 해제 공용 정리. game.html 입력 계약은 변경하지 않는다. |

## 2026-09-28 로비 포인터·키보드 패드 피드백 해제

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | mousemove와 keydown은 _GP.active와 입력 모드만 KBM으로 돌려, 이전 gp-hover 강조와 반복 진동, 호버음이 로비에 남았다. |
| 공용 피드백 정리 | _clearGamepadFeedback이 vibLoopStop, 호버음 정지, 이전 카드 gp-hover·outline·outlineOffset 제거, _lobbyEl/_lobbyIdx 삭제를 수행한다. |
| KBM 전환 | _leaveGamepadInput이 active=false, 공용 피드백 정리, cursor 복구, inputMode=kbm을 한 번에 수행한다. 마우스 이동 임계값 기존 3초과와 _fromGp가 아닌 키보드 입력 조건은 유지한다. |
| 연결 해제 | _resetDisconnectedPadState는 축0·연결 참조 해제 후 _leaveGamepadInput을 호출하고 prev 전체를 초기화한다. |
| 회귀 | mousemove와 keydown 각각에서 active false, 반복 진동 종료, 호버음 1회 정지, 강조 제거, KBM/커서 복구를 확인하는 2건을 추가했다. 수정 전 실패, 수정 후 통과. |
| 적용 범위 | index.html 로비 입력 방식 전환. game.html 입력 계약과 선택 캐릭터 상태는 변경하지 않는다. |

## 2026-09-28 로비 다중 패드 주 입력 유지

| id / 위치 | 현행 계약 |
|---|---|
| 연결 | gamepadconnected는 vibRef가 없을 때만 새 패드를 초기 진동 대상으로 저장한다. 뒤늦은 보조 패드 연결이 현재 주 패드의 피드백 대상을 바꾸지 않는다. |
| 폴링 | _gpGlobalPoll이 navigator.getGamepads의 첫 connected 패드를 입력 주체와 vibRef로 함께 설정한다. 입력과 진동 대상이 일치한다. |
| 해제 | gamepaddisconnected는 보조 패드 해제면 주 패드의 active, 축, 커서, 강조, 반복 진동을 유지한다. 주 패드 해제면 남은 패드로 연결만 넘기고 이전 입력 상태를 초기화한다. |
| 마지막 해제 | 남은 connected 패드가 없을 때만 기존 _resetDisconnectedPadState 공용 정리를 수행한다. |
| 회귀 | 주 패드 연결 뒤 보조 패드 연결·해제에서 vibRef=주 패드, connected/active/축 유지, KBM 전환 없음 1건을 추가했다. 수정 전 실패, 수정 후 통과. |
| 적용 범위 | index.html 로비의 브라우저 Gamepad API 연결·폴링 경로. game.html의 입력 계약은 변경하지 않는다. |

## 2026-09-28 로비 주 패드 교체 입력 초기화

| id / 위치 | 현행 계약 |
|---|---|
| 구분 | gamepaddisconnected의 이벤트 패드가 vibRef와 같은 index 또는 같은 객체이면 주 패드 손실로 판단한다. 다른 패드면 보조 패드 해제다. |
| 주 패드 교체 | _handoffConnectedPadState가 남은 패드를 connected/vibRef로 설정하고 axes=[0,0,0,0], active=false, 호버·반복 진동·강조 종료, cursor 복구, inputMode=kbm, prev 전체 초기화를 수행한다. |
| 다음 입력 | 남은 패드의 다음 폴링은 새 prev 상태를 기준으로 첫 버튼 just와 활성화를 시작한다. |
| 보조 패드 해제 | 기존 주 패드의 입력·피드백 상태는 유지한다. |
| 회귀 | 주 패드 손실 뒤 보조 패드가 남는 경우 vibRef=보조, connected=true, active=false, 4축0, prev 래치 삭제, KBM 전환을 확인하는 1건을 추가했다. 수정 전 실패, 수정 후 통과. |
| 적용 범위 | index.html 로비 다중 패드 장치 전환. game.html 입력 계약은 변경하지 않는다. |

## 2026-09-28 로비 폴링 장치 교체와 KBM 복귀 유지

| id / 위치 | 현행 계약 |
|---|---|
| `_gpGlobalPoll` 연결 | 연결 이벤트 없이 첫 connected 패드를 발견해도 `_GP.connected=true`, `vibRef=gp`로 매 프레임 상태를 동기화한다. |
| 장치 교체 | 기존 `vibRef`와 현재 패드의 `index` 또는 `id`가 달라지면 버튼 비교 전에 `_handoffConnectedPadState(gp)`로 이전 축·입력 래치·호버음·반복 진동·강조를 정리한다. |
| 같은 장치 스냅샷 | 객체가 새로 만들어져도 `index/id`가 같으면 장치 교체로 처리하지 않는다. 누른 버튼을 유지한 다음 프레임은 `just=false`다. |
| 축 갱신 | 0~3번 축 모두 기존 DEAD=0.25 기준으로 매 프레임 갱신한다. 없는 오른쪽 스틱 축은 0으로 처리해 이전 값이 남지 않는다. |
| KBM 복귀 유지 | `_GP.active=false`이면 입력 샘플과 연결 표시까지만 갱신하고 UI 탐색 핸들러를 실행하지 않는다. 다음 실제 버튼·축 입력이 active=true를 설정하면 탐색을 재개한다. |
| 회귀 | 이벤트 없는 연결, 장치 교체 첫 입력·이전 피드백 종료, 같은 장치 스냅샷의 버튼 유지, 없는 축 초기화, 마우스 복귀 후 유휴 폴링·재입력의 5건. 변경 전 결함 4건 실패, 같은 장치 유지 1건 통과 → 변경 후 전체 통과. 관련 로비 회귀 98건 통과. |
| 실제 런타임 | Node 서버의 원본 index.html을 Chromium에서 실행하고 getGamepads만 대역으로 주입했다. 이벤트 없는 secondary 첫 프레임 just=true/다음 false, 축4개0, 이전 강조·루프 제거를 확인했다. 마우스 복귀 후100ms active=false/강조0/KBM, 재입력 후 active=true/강조1/커서 숨김을 확인했다. 실물 패드 검증은 별도다. |
| 화면 QA | 데모 로비 960×540, 1280×720, 1920×1080에서 가로 넘침 없음. 캐릭터 카드·입장·종료·확인/취소 버튼 모두 화면 안. 종료 팝업 기본 취소 초점과 Escape 후 종료 버튼 초점 복귀 확인. |
| 증거 | test/lobbyGamepadDeviceSwitch.test.js, tmp/lobby-pad-device-switch/browser-report.json, quit-960x540.png, quit-1280x720.png, quit-1920x1080.png. |

## 2026-09-28 로비 고정 포인터 클릭의 입력 모드 복귀

| id / 위치 | 현행 계약 |
|---|---|
| 재현 | 패드로 종료 버튼을 강조한 뒤 마우스를 같은 위치에서 클릭하면 movement 합이 3을 넘지 않아 종료창이 열려도 active=true, cursor=none, inputMode=pad와 배경 gp-hover가 남았다. |
| `pointerdown` | index.html의 window 캡처 단계에서 passive=true로 처리한다. active=true이고 이벤트가 _fromGp가 아니면 기존 _leaveGamepadInput을 실행한다. |
| 지원 입력 | mouse, touch, pen 모두 포인터 이동 여부와 무관하게 KBM 복귀, 커서 복원, 이전 강조·호버음·반복 진동 정리를 수행한다. 실제 클릭·터치의 기본 동작은 유지한다. |
| 패드 입력 | _fromGp=true인 포인터 이벤트는 패드 모드와 피드백을 유지한다. programmatic click은 pointerdown을 생성하지 않는다. |
| 회귀 | mouse/touch/pen 3건은 변경 전 실패→변경 후 통과. 패드가 만든 이벤트 보존 1건도 통과. 모달·로비 통합109건 통과. |
| 실제 런타임 | Node 서버의 원본 로비와 getGamepads 대역으로 패드 A 열기/B 취소를 확인했다. 이동 없는 마우스 클릭 후100ms active=false, cursor 복원, KBM, 배경 강조 제거와 취소 초점 확인. Escape 후 종료 버튼 복귀와 종료 호출0회 확인. touch/pen PointerEvent 전달 뒤70ms에도 active=false와 강조0 확인. 실물 패드·터치펜 검증은 별도다. |
| 증거 | tmp/lobby-pointer-takeover/mouse-after.png, browser-report.json. |

## 2026-09-28 로비·문 열림 진동의 비동기 거부 처리

| id / 위치 | 현행 계약 |
|---|---|
| 원인 | 두 playEffect 호출의 try/catch는 동기 예외만 처리했다. Promise 거부가 처리되지 않아 로비 반복 진동과 문 열림 예약 진동에서 unhandled rejection이 쌓였다. |
| `_GP.vib` | playEffect('dual-rumble', {startDelay:0, duration:dur, weakMagnitude:weak, strongMagnitude:strong})의 반환 Promise에 catch를 연결한다. 동기 예외도 기존 catch로 처리한다. |
| 문 열림 진동 | index.html의 _steps 8개 예약 콜백 안 playEffect 반환 Promise도 catch로 처리한다. 단계별 시각·기간·강도는 기존 값 그대로다. 전체 수치는 docs/6사운드디자인/6사운드디자인.md의 같은 날짜 표를 따른다. |
| 실패 정책 | 진동 실패는 게임 조작·선택·팝업 흐름을 중단하거나 추가 상태 문구를 표시하지 않는다. 진동 지원이 없는 패드도 기존대로 허용한다. |
| 회귀 | 신규5건: 단발 거부 처리, 문 열림8콜백 거부 처리, 동기 예외 허용, 미지원 허용, 정상 요청 인수 유지. 변경 전 앞2건 실패→수정 후 모두 통과. 관련 로비·모달 통합114건 통과. |
| 실제 런타임 | Node 서버의 원본 로비에서 getGamepads와 playEffect만 대역으로 교체했다. 거부 반복 요청은 수정 전130ms 동안 오류5회, 수정 후3회 요청에서 오류0회였다. 같은 페이지에서 원본 문 열림 예약 코드8단계를 실행해 거부8회·오류0회 확인. 종료창 열기·Escape 취소 후 버튼 초점 복귀 정상. 실물 패드 진동 검증은 별도다. |
| 증거 | test/lobbyHapticsFailure.test.js, tmp/lobby-haptics-rejection/browser-report.json. |
| 커밋 상태 | 이번 코드2줄·회귀·문서만 담은8파일 검수본은5회귀 및 inline4개 구문 검증 통과. 승인된 실행 도구의 WindowsApps 런처 오류317과 대체 경로의 .git/objects 쓰기 제한으로 커밋 미완료. 기존 game.html·SKILL_CARD_ICON_FIT_20260928.md 스테이징 보존. 검수본: tmp/lobby-haptics-rejection/commit-review. |


## 2026-09-28 화면 전환 시 종료·삭제 확인창 해제

| id / 적용 위치 | 현행 계약 |
|---|---|
| 원인 | 종료·삭제 공용 확인창이 로그인/시네마틱/로비 갱신 후에도 남아 이전 콜백과 초점을 유지. 제출한 요청의 늦은 완료가 새 목록 요청 또는 이전 오류 안내를 시작할 수도 있었음 |
| 전환 | index.html의 _goLogin, _goCinematic, _goLobby, showLobby 진입에서 #delConfirmModal의 inline display가 flex일 때만 _hideDelConfirm({fromTransition:true}) 호출. 초기 숨김 상태에는 확인창 let 변수 초기화 전 호출하지 않음 |
| _hideDelConfirm | fromTransition 기본 false. 일반 취소는 기존 busy 잠금 및 열린 창의 원래 버튼 초점 복귀 유지. 전환은 busy 중에도 창을 숨기고 _delConfirmCb/_delConfirmReturnFocus를 null로 정리하며, 창 내부 초점을 blur. 이전 로비 버튼으로 초점을 돌리지 않음 |
| 제출된 요청 | _delConfirmBusy는 기존 요청이 완료될 때까지 유지. 실제 전송된 DELETE/quit 요청을 취소하거나 되돌리지 않음. _delConfirmCb를 지역 onYes로 캡처하고, 현재 콜백이 onYes와 같을 때만 공용 오류 안내/완료 닫기 실행. 완료 후 busy 해제·확인/취소 버튼 재활성화 |
| 온라인 삭제 | 콜백 시작 시 request=_characterLoadSeq 캡처. DELETE 응답 후 request가 현재 번호와 다르면 목록 재조회/삭제 결과 안내 없이 return. 같은 화면은 기존 user_id 소유 필터·정확히1행/id 일치 검증과 loadCharacters 유지 |
| 로컬 삭제 | 같은 request 번호를 캡처하고 fetch 완료 후 및 catch 진입에서 번호 확인. 이전 작업이면 _slotScrollIdx 변경, loadLocalCharacters, localStorage 폴백 삭제/오류 안내를 시작하지 않음. 같은 화면의 서버 삭제·hellsave_demo_ 접두사·5칸 폴백 정책 유지 |
| 종료 안내 | _showLobbyQuit 콜백도 request 번호 캡처. 브라우저 직접 닫기 안내150ms와 NW/Electron/브라우저 종료 실패 안내는 번호가 같을 때만 setStatus. 정상 종료 우선순위 유지 |
| 회귀 | test/lobbyConfirmTransition.test.js 신규21건. 창 전환/늦은 완료6건 및 실제 콜백 후처리6건이 수정 전 각각 실패 후 통과. 일반 취소·busy 잠금·같은 화면 로컬 삭제/종료 안내·초기화 전 진입 보존. characterSync의 온라인 삭제 대역에 실제 공용 요청 번호 추가. 관련 로비 통합135건 및 inline script4개 구문 통과 |
| 브라우저 | Node 서버 실제 페이지960×540에서 전환4경로 전후 확인: flex/콜백 유지 → none/콜백 및 복귀 참조 null. 지연 성공/실패 대역에서도 전환 즉시 닫힘·busy 완료 후 해제·새 화면 초점 유지·공용 이전 오류 없음. 원본 삭제 콜백에 API/목록 대역만 주입한 전후8조건에서 이전 목록 재조회1회 → 0회, 로컬 실패의 저장 조회5회/오류 안내 → 0회/안내 없음. 데스크톱 종료 실패의 늦은 안내도 제거 |
| 화면·범위 | 960×540/1920×1080에서 종료창 Escape 취소 후 전원 버튼 초점 복귀, 로비 표시·가로 넘침 없음, pageerror0. 실계정 세션 종료/저장 삭제·앱 종료·실물 패드는 실행하지 않음. 실제 전환 함수와 콜백의 대역 검증이며 인증 서버의 종단 검증은 아님 |
| 기록·커밋 | tmp/lobby-confirm-transition/browser-report.json, test-output.txt, changes.patch. 코드·테스트·관련 문서6개를 이 작업 범위로 보존. 기존 승인 실행의 WindowsApps 런처 오류317 및 .git/objects 쓰기 제한이 남아 커밋 미완료. 다른 작업의 game.html/스킬 문서 스테이징은 변경하지 않음 |


## 2026-09-28 외형·이름 팝업 정리와 이전 영상 폴백 차단

| id / 적용 위치 | 현행 계약 |
|---|---|
| 재현 | 외형 취소 뒤 #csIdleVid가 숨은 채 계속 재생. 로그인/시네마틱/로비 전환4경로에 외형창 또는 이름창·가상 키보드·내부 초점이 남음. 실버테일 선택 뒤 전사 영상의 늦은 실패 콜백이 실버테일 영상을 멈추고 전사 초상화를 표시할 수 있었음 |
| _visualPreviewSeq | index.html의 _pendingVisualIdx 옆 let, 초기0. 유효한 열린 외형창의 selectVisual 호출 및 열린 창 닫기에서 증가. 선택 시 request를 캡처하며 현재 번호와 열린 flex 상태가 모두 일치해야 지연 미디어 처리를 허용 |
| selectVisual | 유효한 캐릭터와 열린 #charVisualPop이 없으면 반환. 오류 폴백, canplay의 타이머 정리, 5000ms 스톨 검사, 초상화/배경의180ms 지연 반영에 동일 isCurrent 검사. 새 선택·닫기 이전 콜백은 영상 정지나 이미지 교체를 수행하지 않음 |
| _closeVisualSelect | restoreFocus 기본false. 열린 외형창만 정리하고 번호 증가·내부 초점 blur·display none. csIdleVid/csSceneVid의 _csT clear/null, onerror/oncanplay null, stopMediaVideo, on 클래스 제거, src/poster 제거, load 실행. 숨김 상태 재호출은 상태를 바꾸지 않음 |
| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |
| 이름 확정 | _visualConfirm은 기존 comingSoon 차단 후 _closeVisualSelect 사용. createModal show, 이름/안내 초기화, 기존50ms 조건부 이름 초점 유지. 캐릭터 생성 요청·저장·스토리 경로 변경 없음 |
| _closeCreationOverlays | 외형창 공용 닫기 후 열린 createModal의 내부 초점 blur·show 제거·_vkbHide. 이름창이 숨겨져도 vkbWrap이 block이면 키보드 정리. _goLogin/_goCinematic/_goLobby/showLobby에서 사용 가능한 이 함수를 호출. 초기 숨김 상태에는 나중에 선언한 팝업/키보드 let 상태를 접근하지 않음. 이름창 show 또는 createBtn.disabled이면 생성 안내 초기화, 활성 생성 스토리는 skip()으로 종료. |
| _vkbHide | vkbWrap display none 및 replaceChildren()으로 생성된 키 DOM을 비움. 기존 _vkbActive=false/_hgState=null 유지. 부모 innerHTML 문자열 교체를 사용하지 않음. 한글 조합·키 배열·8글자 제한 변경 없음 |
| 에셋·표시 | 전사4K/idleRate0.75 및 실버테일 복원 영상·초상화·포스터 경로와 comingSoon:true 유지. contain/center top/transform none 규격 변경 없음. 재열면 기존 선택의 src/poster를 다시 지정해 재생. 신규 이미지/영상 생성 없음 |
| 회귀 | test/lobbyCreationOverlayLifecycle.test.js 신규17건: 닫기·재열기·이름 확정·이전 폴백·일반 취소 초점·전환4경로의 외형/이름/초기화 안전. 원본 코드에서13실패/4통과 → 수정 후17통과. 관련 생성·한글·패드·확인창·언어·목록 통합187건, inline script4개 구문 통과 |
| 실제 화면 | Node 서버 원본 페이지960×540에서 전환8조건: 외형 flex/재생 true 및 이름 show/키보드 block → 외형 none/paused true/src·poster·타이머 null, 이름 show false/키보드 none/active false/조합 null/숨은 초점 없음. 페이지 오류0 |
| 선택 정합성 | 원본 selectVisual 콜백으로 전사→실버테일→전사 늦은 오류를 재현: selected1이나 전사 초상화 표시·실버테일 정지. 수정 함수는 selected1·실버테일 재생·정적 초상화 숨김 유지. 실제 미디어 에셋으로 전후 확인 |
| 취소·재열기 | 960×540/1920×1080 실제 취소 버튼으로 미디어 해제·연결된 실행 컨트롤 초점 복귀, 재열기 후 전사 영상 재생, 이름창 Escape 취소·횡넘침 없음 확인. 가상 키보드 DOM8행 → 전환 후 자식0개 확인 |
| 검증 범위 | 데모 로비에는 생성 카드가 없어 openVisualSelect로 진입하고 실제 취소/생성확정/Escape 컨트롤을 사용. 실계정 인증 전환·캐릭터 저장/삭제·앱 종료 요청은 수행하지 않음. 이미 전송된 생성 요청의 성공/실패 후처리 정책은 이번 변경 범위가 아님 |
| 기록·커밋 | tmp/lobby-creation-overlays/browser-report.json, red-tests.txt, test-output.txt, changes.patch. 관련 문서9개 동기화. 기존 WindowsApps 실행 오류317 및 .git 쓰기 제한으로 커밋 미완료. 다른 작업의 스테이징을 변경하지 않음 |


## 2026-09-28 화면 이탈 후 캐릭터 생성 응답·스토리 후처리 차단

| id / 적용 위치 | 현행 계약 |
|---|---|
| 요청 번호 | doCreateChar와 _enterOffline 생성 콜백 시작 시 기존 _characterLoadSeq를 request로 캡처. _goLogin/_goCinematic 및 새 로컬·온라인 목록 요청이 번호를 바꾸면 이전 생성 후처리 중단 |
| 외형 일치 | 버튼 경로에서 _pendingVisualIdx를 visualIdx로 한 번 캡처. 서버 charIdx, localStorage charIdx 및 _afterCharacterCreated에 같은 값을 전달 |
| 스토리 수명 | _afterCharacterCreated는 자체 loadCharacters/loadLocalCharacters 호출 직후 증가한 번호를 캡처. 온라인 목록 완료와 story.play 완료/예외 후 번호가 같아야 showCharGate·BGM 복구. 자체 목록 갱신은 정상 생성 취소로 간주하지 않음 |
| 전환 정리 | _closeCreationOverlays는 이름창 show 또는 createBtn.disabled일 때 setStatus('')로 이전 생성 안내 제거. 기존 팝업/키보드 정리 후 ExoduserCharacterStory.active이면 skip() 호출. 이전 Promise 완료는 번호 검사로 게임 진입하지 않음 |
| 실제 저장 | 이미 전송된 저장 요청을 취소하거나 성공 데이터를 되돌리지 않음. 다음 정상 목록 조회에서 서버 결과 확인. 화면 이탈 뒤 추가 localStorage 폴백 쓰기·자동 재시도 없음 |
| 회귀 | test/lobbyCreationResponse.test.js 신규22건. 최초21건은 원본에서20실패/1통과, 안내·재생기 정리 추가 검사는 수정 전22건 중10실패/12통과. 관련 통합209건·inline script4개 구문 통과 |
| 실제 브라우저 | Node 서버 실제 페이지960×540, 시작 타이틀 실제 클릭 후 직접/버튼×성공/오류/네트워크 실패6조건: 로그인 유지·생성창 숨김·안내 빈값·현재 초점 유지·스토리/입장0회·추가 폴백 저장0회·버튼 해제. 실제 재생 중 스토리도 전환 즉시 종료, 이전 입장0회 |
| 전체 계약·증거 | [세이브 설계](../15%20세이브+데이터구조/15%20세이브+데이터구조.md)의 동명 절. 같은 화면의 기존 생성 성공/실패 유지. 관련 문서7개 동기화, 커밋은 기존 .git 쓰기 제한으로 미완료 |


## 2026-09-28 외형 선택창 키보드 조작·초점 격리

| id / 적용 위치 | 현행 계약 |
|---|---|
| 모달 의미 | #charVisualPop role=dialog/aria-modal=true/aria-labelledby=charVisualTitle. 기존 제목 h2에 charVisualTitle id 추가 |
| 미리보기 버튼 | openVisualSelect는 .cs-ico를 type=button인 네이티브 button으로 생성. selectVisual에서 .sel 및 aria-pressed=true/false를 함께 갱신. 출시 준비 캐릭터도 미리보기 버튼은 활성, visualCreateBtn만 기존 잠금 유지 |
| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |
| Tab | _visualSelectKeydown: 캐릭터 버튼→취소→생성의 enabled 컨트롤을 순환. Shift+Tab 역순. 현재2종은 일반4개/출시 잠금3개. 초점이 외부에 있으면 정순 첫 항목/역순 마지막 항목으로 복구. preventDefault/stopPropagation으로 배경 이동 차단 |
| 방향키 | 아이콘에 초점이 있을 때만 ArrowLeft/ArrowRight, Home/End 처리. 현재 인덱스를0~icons.length-1 범위로 제한하고 대상 네이티브 click 후 focus. 선택·설명·영상·생성 잠금·aria-pressed가 동일 캐릭터로 갱신. 취소/생성 버튼의 방향키는 가로채지 않음 |
| Escape·IME | 열린 창의 일반 Escape는 기본 동작·버블링 차단 후 비반복 입력일 때 visualCancelBtn.click(). isComposing 또는 keyCode229 이벤트 및 숨김 상태는 처리하지 않음. OS IME 실기 검증은 별도 |
| 버튼 마감 | .cs-ico padding0/border0/background transparent/font inherit로 네이티브 버튼 기본 재질 제거. :focus-visible outline2px solid #ead6a5/offset6px/radius4px. 기존 아이콘·레이아웃·미디어 에셋 유지 |
| 회귀 | test/lobbyVisualKeyboard.test.js 신규17건: 열기/선택 상태, 양방향 Tab, 잠금, 외부 초점 복구, 방향키, Escape 정리, IME6조건, 숨김/클릭 경로. 원본16실패/1통과→수정 후17통과. 관련 로비·생성·패드·울트라와이드 통합228건 및 inline script4개 구문 통과 |
| 실제 화면 | Node 서버의 실제 페이지에서 시작 타이틀 클릭 후960×540/1920×1080 확인. 실제 Tab/Shift+Tab/Enter/Space/방향키/Home/End/Escape 입력. 초점 전부 창 내부, 출시 잠금 유지, 취소 후 실행 버튼 복귀, 미디어 pause/src 해제. 컨트롤·초점 테두리 화면 내 및 가로 넘침 없음 |
| 전체 계약·증거 | [캐릭터 선택 기획](../3.1%20ui%20hud%20디자인/캐릭터선택_리모델링_기획서.md)의 동명 절. 관련 문서6개 동기화, 저장 요청0/pageerror0. 커밋은 현재 .git 쓰기 제한으로 실행 불가 |
