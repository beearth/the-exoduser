# 로비 풀 코드 (index.html 패치)

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
<div class="lobby-left">
  <video class="lobby-char-preview" id="lobbyCharPreview" muted loop playsinline></video>
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
| lobbyKenburns |46s ease-in-out infinite alternate 유지. 시작 scale(1) translate(0,0), 끝 scale(1.02) translate(-.3%,-.2%). transform-origin50%45%, reduced-motion은 animation:none |
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
| DOM | _addLobbyCardControl(card,label,key)가 type=button.char-select를 prepend. aria-label/title은 이름·직업 또는 번역된 새 캐릭터, data-card-key는 online:id/local:name/demo/new |
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
| 구조 | .lobby-right 내부 콘텐츠를 .lobby-content로 감쌈. 기본 display:contents로 기존 배치 유지 |
| 낮은 화면 | max-height:680px에서 내부만 flex column/overflow-y:auto/overflow-x:hidden/flex:1 1 auto/min-height0/min-width0. scrollbar-gutter:stable,padding-right8px,thin 스크롤바 색#75674f/#101113,scroll-padding-block4px. 직계 자식 flex-shrink0 |
| 배너·프레임 | 낮은 화면의 lobby-mid-area flex:0 0 auto/overflow:visible로 중첩 스크롤 제거. 부모 장식 프레임·배경은 고정, 로고·카드 크기 보존 |
| 휠 경계 | 온라인·로컬 목록은 Math.sign(deltaY)와 현재 데이터 길이로 다음 인덱스 계산. 실제 목록 이동 때만 preventDefault/렌더, 시작·끝·delta0에서는 기본 외부 스크롤 허용. 로컬 최초 바인딩의 오래된 chars 길이 캡처 제거 |
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
| 닫기 | Escape는 선택값 유지하고 원래 select로 초점 복귀,Tab은 닫은 후 기본 이동. 바깥 pointerdown은 초점을 강제로 되돌리지 않고 닫기 |
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
| 유지 | 기본 display:contents 레이아웃은 스크롤하지 않음. 실제 DOM 초점·언어 선택·캐릭터 선택/삭제 동작은 변경 없음. 중립 프레임은 같은 인덱스·동일 요소에서 스크롤하지 않음 |
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
| 구조 | #lobbyBgImg를 .lobby-left 내부에서 #lobby 직계 자식으로 이동. absolute/inset0/cover/left center로 로비 전체에 한 장 표시. 기존 _swapLobbyBg의 이미지 선택·전환 및 DOM id 유지 |
| 레이어 | .lobby background:#000/isolation:isolate/overflow:hidden. 검정은 로딩·페이드 시 별도 body 배경 노출 방지용. 직계 배경 z-index0/pointer-events:none,좌우 패널 z-index1,왼쪽 자체 배경 transparent |
| 유지 | 오른쪽 장식 바깥은 동일 로비 장면을 노출. 내부 inset22px 배경·문양·카드·로고·버튼 및 캐릭터 미리보기 유지. 기존 배경3종 선택 정책 유지,새 이미지 생성 없음 |
| 캐시 | index.html의 ui-refinement.css?v=20260927-single-lobby-scene |
| 검증 | 실제 HTML/CSS 격리 브라우저에서 flame 기존 에셋1장으로1600×900 시각 확인. #lobbyBgImg1개/부모lobby/전체화면크기 일치. body에 검수용 마젠타 배경을 두어 외곽에 노출되지 않음 확인. 960×540·1920×1080에서도 전체크기 일치/횡넘침 없음 |
| 기록 | tmp/lobby-single-scene/after.png,report.json,sizes.json,changes.patch. 게임 저장·계정 변경 없음. 기존 터미널/.git 제한으로 커밋 미완료 |
