# UIUX — 스킬 X 입력 엣지·닫기/재열기 수명 후보

완료 ID: UIUX-SKILL-X-EDGE-LIFETIME-ROLLING1326. 생산 적용·공유 docs 수정·Git 조회/쓰기·실게임/저장/새 세션/설치/배포 0. nativeAccepted=false. 역할 goal은 실제 CH1-1 시연·총괄 인수가 남아 active다.

최종 후보는 `_gpUINav`의 X 상태 기록과 `_pollGamepad`의 패널 밖 X 상태 동기화 두 문장이다. 앞선 X 기록 한 줄 후보는 닫기→패널 밖 해제→재열기에서 새 X를 놓치는 회귀가 있어 단독 인수 불가다. 비용·스킬 수치·환불·실제 minus handler·저장·매핑·첫 폴링 오입력 방지 계약은 변경하지 않는다.

| 범위 | 원본 | UI 기록만 | 최종 두 문장 |
|---|---:|---:|---:|
| hold3/release/repress→actual close→gameplay release→actual open→fresh X, 각 HTML | minus click 5 | 2 (새 입력 누락) | 3 (의도한 엣지) |
| 실제 gameplay 기본 X→KeyE down/up, 각 HTML | 각1회 | 대조 필수 | 원본 trace 동등, 각1회 |

호출 함수 전체를 디스크 AST로 추출한 실제 `_pollGamepad`, `_gpUINav`, `_gpClearAll`, `_gpInjectKey`, `_rebuildGpKeyIdx`, `openPanel`, `closeAllPanels`, `_injectPanelNav`를 실행했다. `_PANEL_TABS`, `_GP_KEY_DEFAULT`, `_GP_KEY`, `_GP_KEYIDX`, `_gpInjHeld`는 실제 선언이다. DOM/layout/query, pad/clock/cursor update, skill renderer/minus action, KeyboardEvent terminal dispatch는 명시 대역이다. 실제 스킬 레벨/환불/저장, native 입력/초점/레이아웃/음향/GPU/시연 결과를 검수하지 않았다.

정상 게임플레이 control은 close 후 중립 폴링으로 실제 `_gpSynced` 첫 진입 보호를 완료한 뒤 fresh X→release를 실행한다. 최초 하니스는 이 중립 폴링을 빠뜨려 KeyE down 기대1/실제0으로 실패했다. 생산 결함이 아닌 control 구성 누락이며 실패 원문을 아래 보존한다. 수정 후 단언 모두 성공(exit0). 저장 후 재실행0.

## 정확한 전체 함수 후보

### game.html

source SHA256: ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613

`_gpUINav` before SHA256: 3089e0aaac89e10c59769ffc246230eb04abeefabaf56e9e21a2ac7865047796

```js
function _gpUINav(panel){
  if(!_gpad||!panel)return;
  // skSlotPop 열려있으면 그걸 패널로 전환 (skillPanel 밖에 있어서 querySelectorAll 미탐지)
  const _spop=$('skSlotPop');
  if(_spop&&_spop.style.display==='flex')panel=_spop;
  // 패널 내 포커스 가능 요소 수집
  const SEL='button:not([disabled]),.pclose,[onclick],.sk-opt:not(.locked),.up-row:not(.dis),.stat-btn:not(.dis),.passive-row:not(.dis),.fg-i:not(.dis),.fg-tab,.set-key,.id-btn,.retry,input[type="range"],input[type="checkbox"],select,[data-sk-id],.inv-filter-btn,.inv-eq-item,.inv-eq-slot,.inv-item,.inv-cr-item,.inv-cell,.inv-dep-item,.inv-exp-btn,.sk-pop-tab,.gc-btn,.inv-storage-toggle,.cmp-close,label[style*="cursor:pointer"],a[href],[style*="cursor:pointer"]';
  const items=[];
  const all=panel.querySelectorAll(SEL);
  for(let i=0;i<all.length;i++){
    const el=all[i];
    if(el.offsetParent===null)continue;
    // [data-sk-id] 자식 중복 방지: 스킬카드 안의 자식은 카드 자체만 잡음
    if(!el.dataset.skId&&el.closest('[data-sk-id]'))continue;
    items.push(el);
  }
  if(!items.length)return;
  if(_gpUIIdx>=items.length)_gpUIIdx=0;

  // D-pad(버튼12-15) + axes[6/7](일부 패드 D-pad) → 한 칸 이동 (좌스틱은 가상커서 전용)
  const _dU=(_gpad.buttons[12]&&_gpad.buttons[12].pressed)||_gpAxes[7]<-0.5;
  const _dD=(_gpad.buttons[13]&&_gpad.buttons[13].pressed)||_gpAxes[7]>0.5;
  const _dL=(_gpad.buttons[14]&&_gpad.buttons[14].pressed)||_gpAxes[6]<-0.5;
  const _dR=(_gpad.buttons[15]&&_gpad.buttons[15].pressed)||_gpAxes[6]>0.5;
  const u=_dU,d=_dD,l=_dL,r=_dR;
  // 가상 커서 모드 + 좌우 D-pad: 커서 아래 range 슬라이더 값 조절
  if(_gpVC.vis&&(l||r)){
    const _vcHover=document.elementFromPoint(_gpVC.x,_gpVC.y);
    const _vcRng=_vcHover&&(_vcHover.tagName==='INPUT'&&_vcHover.type==='range'?_vcHover:_vcHover.closest?.('.set-range-row')?.querySelector('input[type="range"]'));
    if(_vcRng){
      const _nowTs2=performance.now();const _dir2=l?'l':'r';
      if(_dir2!==_gpUIRepeatDir){_gpUIRepeatDir=_dir2;_gpUIRepeatTs=_nowTs2+_GP_UI_DELAY;
        const _s2=+((_vcRng.step)||1);_vcRng.value=l?Math.max(+_vcRng.min,+_vcRng.value-_s2):Math.min(+_vcRng.max,+_vcRng.value+_s2);_vcRng.dispatchEvent(new Event('input'));
      }else if(_nowTs2>=_gpUIRepeatTs){_gpUIRepeatTs=_nowTs2+_GP_UI_INTERVAL;
        const _s2=+((_vcRng.step)||1);_vcRng.value=l?Math.max(+_vcRng.min,+_vcRng.value-_s2):Math.min(+_vcRng.max,+_vcRng.value+_s2);_vcRng.dispatchEvent(new Event('input'));
      }
      _gpUIPrev.u=u;_gpUIPrev.d=d;_gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;return;
    }
  }
  if(u||d||l||r)_gpVCHide(); // D-pad 누르면 커서 숨기고 선택 모드
  // 우측 스틱 → 스크롤 (휠 역할) — 원시값 사용 (데드존 없이 0.15 임계)
  const rsYVal=_gpad.axes.length>=4?_gpad.axes[3]:0;
  const rsXVal=_gpad.axes.length>=3?_gpad.axes[2]:0;
  const a=_gpad.buttons[0]&&_gpad.buttons[0].pressed;
  const b=_gpad.buttons[1]&&_gpad.buttons[1].pressed;
  const lb=_gpad.buttons[4]&&_gpad.buttons[4].pressed;
  const rb=_gpad.buttons[5]&&_gpad.buttons[5].pressed;

  // 좌스틱/D-pad: 한 칸 이동 — repeat 타이머
  const _nowDir=u?'u':d?'d':l?'l':r?'r':null;
  const _nowTs=performance.now();
  let _didMove=false;
  if(_nowDir){
    if(_nowDir!==_gpUIRepeatDir){
      _gpUIRepeatDir=_nowDir;_gpUIRepeatTs=_nowTs+_GP_UI_DELAY;
      _gpUIStep(_nowDir,items);_didMove=true;
    } else if(_nowTs>=_gpUIRepeatTs){
      _gpUIRepeatTs=_nowTs+_GP_UI_INTERVAL;
      _gpUIStep(_nowDir,items);_didMove=true;
    }
  } else {
    _gpUIRepeatDir=null;
  }
  if(_didMove){_gpVibrate(2,40);_gpRSScrolled=false;}

  const cur=items[_gpUIIdx];

  // LB/RB: 탭 전환
  if((lb&&!_gpUIPrev.lb)||(rb&&!_gpUIPrev.rb)){
    if(panel.id==='skillPanel'&&typeof SKILL_HIER!=='undefined'){
      // 스킬패널 전용: SKILL_HIER 순환
      let _ci=SKILL_HIER.findIndex(h=>h.id===_skHierTab);if(_ci<0)_ci=0;
      if(rb&&!_gpUIPrev.rb)_ci=Math.min(SKILL_HIER.length-1,_ci+1);
      if(lb&&!_gpUIPrev.lb)_ci=Math.max(0,_ci-1);
      _skHierTab=SKILL_HIER[_ci].id;
      if(typeof renderSkillPanel==='function')renderSkillPanel();
    } else {
      const tabs=panel.querySelectorAll('.fg-tab');
      if(tabs.length>1){
        // 탭 있음 → 탭 전환
        let ti=-1;tabs.forEach((t,i)=>{if(t.classList.contains('act'))ti=i});
        if(ti<0)ti=0;
        if(rb&&!_gpUIPrev.rb)ti=Math.min(tabs.length-1,ti+1);
        if(lb&&!_gpUIPrev.lb)ti=Math.max(0,ti-1);
        if(tabs[ti])tabs[ti].click();
      } else {
        // 탭 없음 → 섹션(단락) 이동
        const _lc=items[_gpUIIdx];
        const _lt=_lc?_gpSectType(_lc):'';
        if(rb&&!_gpUIPrev.rb){
          let ni=_gpUIIdx;
          for(let i=_gpUIIdx+1;i<items.length;i++){if(_gpSectType(items[i])!==_lt){ni=i;break;}}
          _gpUIIdx=ni;
        }
        if(lb&&!_gpUIPrev.lb){
          let ni=_gpUIIdx,pt='';
          for(let i=_gpUIIdx-1;i>=0;i--){const t=_gpSectType(items[i]);if(t!==_lt){pt=t;ni=i;break;}}
          if(pt){while(ni>0&&_gpSectType(items[ni-1])===pt)ni--;}
          _gpUIIdx=ni;
        }
      }
    }
  }

  _gpUIPrev.lb=lb;_gpUIPrev.rb=rb;

  // 하이라이트 (우스틱 스크롤 후에는 D-pad 이동 전까지 scrollIntoView 억제)
  const _rsNow=_gpad.axes.length>=4&&(Math.abs(_gpad.axes[3])>0.15||Math.abs(_gpad.axes[2])>0.15);
  if(_rsNow)_gpRSScrolled=true;
  for(let i=0;i<items.length;i++){
    if(i===_gpUIIdx){
      items[i].style.outline='2px solid #C9A961';items[i].style.outlineOffset='-1px';
      if(!_gpRSScrolled){
        if(items[i].scrollIntoViewIfNeeded)items[i].scrollIntoViewIfNeeded(false);
        else items[i].scrollIntoView({block:'nearest'});
      }
    } else {
      items[i].style.outline='';items[i].style.outlineOffset='';
    }
  }

  // 키바인딩 입력 대기 중 → B=취소(ESC 주입)
  if(listeningBind&&b&&!_gpUIPrev.b){
    listeningBind=null;_listenAlt=false;renderSettings();
    _gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.y=y;_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;return;
  }

  // A = 커서 위치 클릭 우선, 없으면 포커스 요소 클릭
  if(a&&!_gpUIPrev.a){
    if(_gpVC.vis){
      let _vcEl=document.elementFromPoint(_gpVC.x,_gpVC.y);
      if(_vcEl&&_vcEl.id!=='_gpVCursor'){
        // range/select 또는 그 행 클릭 → D-pad 선택 모드로 전환하여 해당 요소 포커스
        const _vcRange=_vcEl.tagName==='INPUT'&&_vcEl.type==='range'?_vcEl:_vcEl.closest?.('.set-range-row')?.querySelector('input[type="range"]');
        const _vcSel=!_vcRange&&(_vcEl.tagName==='SELECT'?_vcEl:_vcEl.closest?.('.set-range-row')?.querySelector('select'));
        const _vcFocus=_vcRange||_vcSel;
        if(_vcFocus){
          for(let _ri=0;_ri<items.length;_ri++){if(items[_ri]===_vcFocus){_gpUIIdx=_ri;break}}
          _gpVCHide();
        } else {_vcEl.click()}
        _gpBtnsPrev['k0']=true;
      }
    } else if(cur){
      // 스킬카드 expanded: A → (+) 습득/강화 버튼 우선 클릭
      if(cur.dataset&&cur.dataset.skId){
        const _plusBtn=cur.querySelector('[style*="cursor:pointer"][style*="border:1px solid #aa8833"]');
        if(_plusBtn){_plusBtn.click();_gpBtnsPrev['k0']=true;}
        else{cur.click();_gpBtnsPrev['k0']=true;}
      } else if(cur.tagName==='SELECT'){
        // select: A = 다음 옵션 (네이티브 드롭다운 열지 않음 — 패드로 닫기 불가)
        cur.selectedIndex=(cur.selectedIndex+1)%cur.options.length;cur.dispatchEvent(new Event('change'));
        _gpBtnsPrev['k0']=true;
      } else {cur.click();_gpBtnsPrev['k0']=true;}
    }
  }
  // X = 스킬카드 expanded: (-) 레벨다운/취소 버튼
  const x=_gpad.buttons[2]&&_gpad.buttons[2].pressed;
  if(x&&!_gpUIPrev.x&&cur&&cur.dataset&&cur.dataset.skId&&panel.id==='skillPanel'){
    const _minBtn=cur.querySelector('[style*="cursor:pointer"][style*="border:1px solid #cc4444"]');
    if(_minBtn){_minBtn.click();_gpBtnsPrev['k2']=true;}
  }
  // B = 단계별 뒤로가기
  const _start=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);
  if((b&&!_gpUIPrev.b)){
    _panelBack();_gpBtnsPrev['k1']=true;
  }
  _gpUIPrev.start=_start;
  // Y = 스킬 패널: 선택 스킬 슬롯 배정 / 인벤: 장착·해제·꺼내기
  const y=_gpad.buttons[3]&&_gpad.buttons[3].pressed;
  if(y&&!_gpUIPrev.y&&cur){
    // 스킬 패널에서 .sk-opt 위에 있으면 → 순환 배정
    if(panel.id==='skillPanel'&&cur.classList.contains('sk-opt')){
      const skId=cur.dataset&&cur.dataset.skId;
      if(skId&&typeof _openSkillSlotPop==='function'){
        // 선택 슬롯 계약: 일반=1~4, 지옥강타 계열 분노 폭발=Space, 영역=F
        const si=_findAutoSkillSlot(skId);
        if(si>=0){SKILL_SLOTS[si]=skId;if(typeof updateQS==='function')updateQS();if(typeof dbSaveNow==='function')dbSaveNow();const _slNm=si<4?_T('슬롯')+(si+1):si===4?'SP'+_T('슬롯'):'F'+_T('슬롯');addTxt(P.x,P.y-20,_slNm+': '+_T(cur.querySelector('.sk-opt-name')?.textContent||skId),'#ff8844',40);SFX.pickup()}
      }
    }
    // 인벤토리 패널: Y = 우클릭 (장착/해제/꺼내기)
    if(panel.id==='invPanel'){
      if(cur.classList.contains('inv-item')||cur.classList.contains('inv-eq-item')||cur.classList.contains('inv-cell')){
        cur.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2}));
        _gpBtnsPrev['k3']=true;
      }
    }
  }

  _gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.y=y;

  // ── 우측 스틱: 패널 스크롤 (가상커서 위치 → 해당 영역, 없으면 포커스 항목 기준) ──
  if(Math.abs(rsYVal)>0.15||Math.abs(rsXVal)>0.15){
    let _sc=null;
    if(_gpVC.vis){_sc=_gpFindScroll(document.elementFromPoint(_gpVC.x,_gpVC.y))}
    if(!_sc){
      if(panel.id==='skillPanel')_sc=panel.querySelector('#skillGridWrap');
      if(!_sc&&cur)_sc=_gpFindScroll(cur);
    }
    if(!_sc)_sc=_gpFindScroll(panel)||_gpFindScrollDown(panel);
    if(_sc){_gpDoScroll(_sc,Math.abs(rsYVal)>0.15?rsYVal*18:0,Math.abs(rsXVal)>0.15?rsXVal*18:0)}
  }

  // 버튼 8(Back) = 전체 첫 항목  버튼 9(Start) = 전체 마지막 항목
  const b8=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);
  const b9=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);
  if(b8&&!_gpUIPrev.b8)_gpUIIdx=0;
  if(b9&&!_gpUIPrev.b9)_gpUIIdx=items.length-1;
  _gpUIPrev.b8=b8;_gpUIPrev.b9=b9;
}
```

`_gpUINav` after (X snapshot addition):

```js
function _gpUINav(panel){
  if(!_gpad||!panel)return;
  // skSlotPop 열려있으면 그걸 패널로 전환 (skillPanel 밖에 있어서 querySelectorAll 미탐지)
  const _spop=$('skSlotPop');
  if(_spop&&_spop.style.display==='flex')panel=_spop;
  // 패널 내 포커스 가능 요소 수집
  const SEL='button:not([disabled]),.pclose,[onclick],.sk-opt:not(.locked),.up-row:not(.dis),.stat-btn:not(.dis),.passive-row:not(.dis),.fg-i:not(.dis),.fg-tab,.set-key,.id-btn,.retry,input[type="range"],input[type="checkbox"],select,[data-sk-id],.inv-filter-btn,.inv-eq-item,.inv-eq-slot,.inv-item,.inv-cr-item,.inv-cell,.inv-dep-item,.inv-exp-btn,.sk-pop-tab,.gc-btn,.inv-storage-toggle,.cmp-close,label[style*="cursor:pointer"],a[href],[style*="cursor:pointer"]';
  const items=[];
  const all=panel.querySelectorAll(SEL);
  for(let i=0;i<all.length;i++){
    const el=all[i];
    if(el.offsetParent===null)continue;
    // [data-sk-id] 자식 중복 방지: 스킬카드 안의 자식은 카드 자체만 잡음
    if(!el.dataset.skId&&el.closest('[data-sk-id]'))continue;
    items.push(el);
  }
  if(!items.length)return;
  if(_gpUIIdx>=items.length)_gpUIIdx=0;

  // D-pad(버튼12-15) + axes[6/7](일부 패드 D-pad) → 한 칸 이동 (좌스틱은 가상커서 전용)
  const _dU=(_gpad.buttons[12]&&_gpad.buttons[12].pressed)||_gpAxes[7]<-0.5;
  const _dD=(_gpad.buttons[13]&&_gpad.buttons[13].pressed)||_gpAxes[7]>0.5;
  const _dL=(_gpad.buttons[14]&&_gpad.buttons[14].pressed)||_gpAxes[6]<-0.5;
  const _dR=(_gpad.buttons[15]&&_gpad.buttons[15].pressed)||_gpAxes[6]>0.5;
  const u=_dU,d=_dD,l=_dL,r=_dR;
  // 가상 커서 모드 + 좌우 D-pad: 커서 아래 range 슬라이더 값 조절
  if(_gpVC.vis&&(l||r)){
    const _vcHover=document.elementFromPoint(_gpVC.x,_gpVC.y);
    const _vcRng=_vcHover&&(_vcHover.tagName==='INPUT'&&_vcHover.type==='range'?_vcHover:_vcHover.closest?.('.set-range-row')?.querySelector('input[type="range"]'));
    if(_vcRng){
      const _nowTs2=performance.now();const _dir2=l?'l':'r';
      if(_dir2!==_gpUIRepeatDir){_gpUIRepeatDir=_dir2;_gpUIRepeatTs=_nowTs2+_GP_UI_DELAY;
        const _s2=+((_vcRng.step)||1);_vcRng.value=l?Math.max(+_vcRng.min,+_vcRng.value-_s2):Math.min(+_vcRng.max,+_vcRng.value+_s2);_vcRng.dispatchEvent(new Event('input'));
      }else if(_nowTs2>=_gpUIRepeatTs){_gpUIRepeatTs=_nowTs2+_GP_UI_INTERVAL;
        const _s2=+((_vcRng.step)||1);_vcRng.value=l?Math.max(+_vcRng.min,+_vcRng.value-_s2):Math.min(+_vcRng.max,+_vcRng.value+_s2);_vcRng.dispatchEvent(new Event('input'));
      }
      _gpUIPrev.u=u;_gpUIPrev.d=d;_gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;return;
    }
  }
  if(u||d||l||r)_gpVCHide(); // D-pad 누르면 커서 숨기고 선택 모드
  // 우측 스틱 → 스크롤 (휠 역할) — 원시값 사용 (데드존 없이 0.15 임계)
  const rsYVal=_gpad.axes.length>=4?_gpad.axes[3]:0;
  const rsXVal=_gpad.axes.length>=3?_gpad.axes[2]:0;
  const a=_gpad.buttons[0]&&_gpad.buttons[0].pressed;
  const b=_gpad.buttons[1]&&_gpad.buttons[1].pressed;
  const lb=_gpad.buttons[4]&&_gpad.buttons[4].pressed;
  const rb=_gpad.buttons[5]&&_gpad.buttons[5].pressed;

  // 좌스틱/D-pad: 한 칸 이동 — repeat 타이머
  const _nowDir=u?'u':d?'d':l?'l':r?'r':null;
  const _nowTs=performance.now();
  let _didMove=false;
  if(_nowDir){
    if(_nowDir!==_gpUIRepeatDir){
      _gpUIRepeatDir=_nowDir;_gpUIRepeatTs=_nowTs+_GP_UI_DELAY;
      _gpUIStep(_nowDir,items);_didMove=true;
    } else if(_nowTs>=_gpUIRepeatTs){
      _gpUIRepeatTs=_nowTs+_GP_UI_INTERVAL;
      _gpUIStep(_nowDir,items);_didMove=true;
    }
  } else {
    _gpUIRepeatDir=null;
  }
  if(_didMove){_gpVibrate(2,40);_gpRSScrolled=false;}

  const cur=items[_gpUIIdx];

  // LB/RB: 탭 전환
  if((lb&&!_gpUIPrev.lb)||(rb&&!_gpUIPrev.rb)){
    if(panel.id==='skillPanel'&&typeof SKILL_HIER!=='undefined'){
      // 스킬패널 전용: SKILL_HIER 순환
      let _ci=SKILL_HIER.findIndex(h=>h.id===_skHierTab);if(_ci<0)_ci=0;
      if(rb&&!_gpUIPrev.rb)_ci=Math.min(SKILL_HIER.length-1,_ci+1);
      if(lb&&!_gpUIPrev.lb)_ci=Math.max(0,_ci-1);
      _skHierTab=SKILL_HIER[_ci].id;
      if(typeof renderSkillPanel==='function')renderSkillPanel();
    } else {
      const tabs=panel.querySelectorAll('.fg-tab');
      if(tabs.length>1){
        // 탭 있음 → 탭 전환
        let ti=-1;tabs.forEach((t,i)=>{if(t.classList.contains('act'))ti=i});
        if(ti<0)ti=0;
        if(rb&&!_gpUIPrev.rb)ti=Math.min(tabs.length-1,ti+1);
        if(lb&&!_gpUIPrev.lb)ti=Math.max(0,ti-1);
        if(tabs[ti])tabs[ti].click();
      } else {
        // 탭 없음 → 섹션(단락) 이동
        const _lc=items[_gpUIIdx];
        const _lt=_lc?_gpSectType(_lc):'';
        if(rb&&!_gpUIPrev.rb){
          let ni=_gpUIIdx;
          for(let i=_gpUIIdx+1;i<items.length;i++){if(_gpSectType(items[i])!==_lt){ni=i;break;}}
          _gpUIIdx=ni;
        }
        if(lb&&!_gpUIPrev.lb){
          let ni=_gpUIIdx,pt='';
          for(let i=_gpUIIdx-1;i>=0;i--){const t=_gpSectType(items[i]);if(t!==_lt){pt=t;ni=i;break;}}
          if(pt){while(ni>0&&_gpSectType(items[ni-1])===pt)ni--;}
          _gpUIIdx=ni;
        }
      }
    }
  }

  _gpUIPrev.lb=lb;_gpUIPrev.rb=rb;

  // 하이라이트 (우스틱 스크롤 후에는 D-pad 이동 전까지 scrollIntoView 억제)
  const _rsNow=_gpad.axes.length>=4&&(Math.abs(_gpad.axes[3])>0.15||Math.abs(_gpad.axes[2])>0.15);
  if(_rsNow)_gpRSScrolled=true;
  for(let i=0;i<items.length;i++){
    if(i===_gpUIIdx){
      items[i].style.outline='2px solid #C9A961';items[i].style.outlineOffset='-1px';
      if(!_gpRSScrolled){
        if(items[i].scrollIntoViewIfNeeded)items[i].scrollIntoViewIfNeeded(false);
        else items[i].scrollIntoView({block:'nearest'});
      }
    } else {
      items[i].style.outline='';items[i].style.outlineOffset='';
    }
  }

  // 키바인딩 입력 대기 중 → B=취소(ESC 주입)
  if(listeningBind&&b&&!_gpUIPrev.b){
    listeningBind=null;_listenAlt=false;renderSettings();
    _gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.y=y;_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;return;
  }

  // A = 커서 위치 클릭 우선, 없으면 포커스 요소 클릭
  if(a&&!_gpUIPrev.a){
    if(_gpVC.vis){
      let _vcEl=document.elementFromPoint(_gpVC.x,_gpVC.y);
      if(_vcEl&&_vcEl.id!=='_gpVCursor'){
        // range/select 또는 그 행 클릭 → D-pad 선택 모드로 전환하여 해당 요소 포커스
        const _vcRange=_vcEl.tagName==='INPUT'&&_vcEl.type==='range'?_vcEl:_vcEl.closest?.('.set-range-row')?.querySelector('input[type="range"]');
        const _vcSel=!_vcRange&&(_vcEl.tagName==='SELECT'?_vcEl:_vcEl.closest?.('.set-range-row')?.querySelector('select'));
        const _vcFocus=_vcRange||_vcSel;
        if(_vcFocus){
          for(let _ri=0;_ri<items.length;_ri++){if(items[_ri]===_vcFocus){_gpUIIdx=_ri;break}}
          _gpVCHide();
        } else {_vcEl.click()}
        _gpBtnsPrev['k0']=true;
      }
    } else if(cur){
      // 스킬카드 expanded: A → (+) 습득/강화 버튼 우선 클릭
      if(cur.dataset&&cur.dataset.skId){
        const _plusBtn=cur.querySelector('[style*="cursor:pointer"][style*="border:1px solid #aa8833"]');
        if(_plusBtn){_plusBtn.click();_gpBtnsPrev['k0']=true;}
        else{cur.click();_gpBtnsPrev['k0']=true;}
      } else if(cur.tagName==='SELECT'){
        // select: A = 다음 옵션 (네이티브 드롭다운 열지 않음 — 패드로 닫기 불가)
        cur.selectedIndex=(cur.selectedIndex+1)%cur.options.length;cur.dispatchEvent(new Event('change'));
        _gpBtnsPrev['k0']=true;
      } else {cur.click();_gpBtnsPrev['k0']=true;}
    }
  }
  // X = 스킬카드 expanded: (-) 레벨다운/취소 버튼
  const x=_gpad.buttons[2]&&_gpad.buttons[2].pressed;
  if(x&&!_gpUIPrev.x&&cur&&cur.dataset&&cur.dataset.skId&&panel.id==='skillPanel'){
    const _minBtn=cur.querySelector('[style*="cursor:pointer"][style*="border:1px solid #cc4444"]');
    if(_minBtn){_minBtn.click();_gpBtnsPrev['k2']=true;}
  }
  // B = 단계별 뒤로가기
  const _start=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);
  if((b&&!_gpUIPrev.b)){
    _panelBack();_gpBtnsPrev['k1']=true;
  }
  _gpUIPrev.start=_start;
  // Y = 스킬 패널: 선택 스킬 슬롯 배정 / 인벤: 장착·해제·꺼내기
  const y=_gpad.buttons[3]&&_gpad.buttons[3].pressed;
  if(y&&!_gpUIPrev.y&&cur){
    // 스킬 패널에서 .sk-opt 위에 있으면 → 순환 배정
    if(panel.id==='skillPanel'&&cur.classList.contains('sk-opt')){
      const skId=cur.dataset&&cur.dataset.skId;
      if(skId&&typeof _openSkillSlotPop==='function'){
        // 선택 슬롯 계약: 일반=1~4, 지옥강타 계열 분노 폭발=Space, 영역=F
        const si=_findAutoSkillSlot(skId);
        if(si>=0){SKILL_SLOTS[si]=skId;if(typeof updateQS==='function')updateQS();if(typeof dbSaveNow==='function')dbSaveNow();const _slNm=si<4?_T('슬롯')+(si+1):si===4?'SP'+_T('슬롯'):'F'+_T('슬롯');addTxt(P.x,P.y-20,_slNm+': '+_T(cur.querySelector('.sk-opt-name')?.textContent||skId),'#ff8844',40);SFX.pickup()}
      }
    }
    // 인벤토리 패널: Y = 우클릭 (장착/해제/꺼내기)
    if(panel.id==='invPanel'){
      if(cur.classList.contains('inv-item')||cur.classList.contains('inv-eq-item')||cur.classList.contains('inv-cell')){
        cur.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2}));
        _gpBtnsPrev['k3']=true;
      }
    }
  }

  _gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.y=y;_gpUIPrev.x=x;

  // ── 우측 스틱: 패널 스크롤 (가상커서 위치 → 해당 영역, 없으면 포커스 항목 기준) ──
  if(Math.abs(rsYVal)>0.15||Math.abs(rsXVal)>0.15){
    let _sc=null;
    if(_gpVC.vis){_sc=_gpFindScroll(document.elementFromPoint(_gpVC.x,_gpVC.y))}
    if(!_sc){
      if(panel.id==='skillPanel')_sc=panel.querySelector('#skillGridWrap');
      if(!_sc&&cur)_sc=_gpFindScroll(cur);
    }
    if(!_sc)_sc=_gpFindScroll(panel)||_gpFindScrollDown(panel);
    if(_sc){_gpDoScroll(_sc,Math.abs(rsYVal)>0.15?rsYVal*18:0,Math.abs(rsXVal)>0.15?rsXVal*18:0)}
  }

  // 버튼 8(Back) = 전체 첫 항목  버튼 9(Start) = 전체 마지막 항목
  const b8=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);
  const b9=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);
  if(b8&&!_gpUIPrev.b8)_gpUIIdx=0;
  if(b9&&!_gpUIPrev.b9)_gpUIIdx=items.length-1;
  _gpUIPrev.b8=b8;_gpUIPrev.b9=b9;
}
```

`_pollGamepad` before SHA256: 00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d

```js
function _pollGamepad(){
  // 이벤트 의존 금지 — BT 재연결 시 gamepadconnected가 안 오는 경우가 있어 매 프레임 폴링으로 직접 감지 (index.html과 동일 방식)
  const gps=navigator.getGamepads();
  let _found=null;
  for(let i=0;i<gps.length;i++){if(gps[i]&&gps[i].connected){_found=gps[i];break}}
  if(_found&&!_gpConnected){_gpConnected=true;_gpVibRef=_found;console.log('[GAMEPAD] 폴링 감지:',_found.id);try{notify('🎮 패드 연결됨')}catch(e2){}}
  if(!_found){
    // 패드 사라짐 (BT 절전/블립) — 주입 키 즉시 해제, _gpActive는 유지 (재연결 시 패드모드 그대로 복귀)
    if(_gpConnected){_gpConnected=false;_gpad=null;_gpClearAll();try{notify('🎮 패드 연결 끊김')}catch(e2){}}
    return;
  }
  _gpad=_found;

  // ── 1단계: 하드웨어 상태만 읽기 ──
  let _anyInput=false;
  for(let i=0;i<_gpad.buttons.length;i++){
    const pressed=_gpad.buttons[i].pressed||_gpad.buttons[i].value>0.5;
    _gpBtns[i]=pressed;
    if(pressed)_anyInput=true;
  }
  _gpAxes[0]=Math.abs(_gpad.axes[0])<GP_DEAD?0:_gpad.axes[0];
  _gpAxes[1]=Math.abs(_gpad.axes[1])<GP_DEAD?0:_gpad.axes[1];
  if(_gpad.axes.length>=4){
    _gpAxes[2]=Math.abs(_gpad.axes[2])<GP_DEAD?0:_gpad.axes[2];
    _gpAxes[3]=Math.abs(_gpad.axes[3])<GP_DEAD?0:_gpad.axes[3];
  }
  // D-pad를 axes[6/7]로 전달하는 패드 (Firefox 표준, 일부 컨트롤러)
  if(_gpad.axes.length>=8){
    _gpAxes[6]=Math.abs(_gpad.axes[6])<0.5?0:_gpad.axes[6];
    _gpAxes[7]=Math.abs(_gpad.axes[7])<0.5?0:_gpad.axes[7];
  }
  if(_gpAxes[0]||_gpAxes[1]||_gpAxes[2]||_gpAxes[3])_anyInput=true;
  // 부스: 패드 입력(버튼 눌림 or GP_DEAD=0.25 초과 스틱)도 유휴 리셋 — 폴링 경로라 여기서 처리(키보드/마우스와 동일 변수 _boothIdle, 어트랙트 오전환 방지)
  if(_anyInput&&_BOOTH_MODE)_boothIdle=0;

  // ── 2단계: 입력 감지 → 패드모드 활성화 (드리프트/아날로그 잔압 무시 — 조이스틱 팬텀 자동전환 방지) ──
  // 자동전환은 "의도적 입력"만 인정: 디지털 버튼 실제 press 또는 스틱 0.5 이상 큰 편향. (idle 스틱 드리프트/트리거 잔압으로 패드모드 켜지지 않게)
  let _gpDeliberate=false;
  for(let _di=0;_di<_gpad.buttons.length;_di++){if(_gpad.buttons[_di]&&_gpad.buttons[_di].pressed){_gpDeliberate=true;break}}
  if(!_gpDeliberate&&(Math.abs(_gpAxes[0])>0.5||Math.abs(_gpAxes[1])>0.5||Math.abs(_gpAxes[2])>0.5||Math.abs(_gpAxes[3])>0.5))_gpDeliberate=true;
  if(_gpDeliberate&&!_gpActive){_gpActive=true;document.body.style.cursor='none';C.style.cursor='none';}

  // ── 3단계: 패드모드 아니면 K[]/MB[] 절대 안 건드림 ──
  if(!_gpActive)return;
  // [팬텀차단] 패드모드 재진입 첫 폴링: 이미 눌려있는(드리프트) 버튼을 prev에 스냅샷 → rising-edge 오인주입(ShiftLeft stuck) 방지
  if(!_gpSynced){for(let _si=0;_si<_gpad.buttons.length;_si++)_gpBtnsPrev['k'+_si]=!!_gpBtns[_si];_gpSynced=true;}

  // ── 3a단계: 컷씬 진행 중이면 A=advance, B=skip홀드, Start=즉시스킵 ──
  if(typeof _cutsceneState!=='undefined'&&_cutsceneState==='INTRO_CUTSCENE'){
    const _cA=!!_gpBtns[0],_cB=!!_gpBtns[1],_cSt=!!_gpBtns[9];
    if(_cA&&!_gpBtnsPrev['_cutA'])_cutsceneAdvance();
    if(_cB)_cutSkipHolding=true; else if(_gpBtnsPrev['_cutB'])_cutSkipHolding=false;
    if(_cSt&&!_gpBtnsPrev['_cutSt'])_cutsceneEnd();
    _gpBtnsPrev['_cutA']=_cA;_gpBtnsPrev['_cutB']=_cB;_gpBtnsPrev['_cutSt']=_cSt;
    return;
  }

  // 통합 인트로는 자체 A/Start 입력을 사용한다. 설정창/전투 입력 누출 차단.
  if(G&&G._intro){_gpClearAll();_gpBtnsPrev['_noUI9']=!!_gpBtns[9];return;}

  // ── D-pad 패널 토글 (패널 닫혀있을 때만 — 열려있으면 네비게이션 전용) ──
  {const _DP=[[12,'skillPanel','toggle'],[13,'forge','forge'],[14,'statPanel','toggle'],[15,'invPanel','storage']];
  const _anyPanelOpen=!!document.querySelector('.panel.on');
  for(const[bi,pid,act] of _DP){
    const _on=!!(_gpad.buttons[bi]&&_gpad.buttons[bi].pressed);
    if(_on&&!_gpBtnsPrev['_dpg'+bi]&&!_anyPanelOpen){
      if(G&&G.on){
        if(act==='toggle')togglePanel(pid);
        else if(act==='forge'){if(G.forgeOpen){closePanel('forge');G.forgeOpen=false}else openPanel('forge')}
        else if(act==='storage')openInventoryStorage()
      }
    }
    _gpBtnsPrev['_dpg'+bi]=_on;
  }}

  // ── Start(b9) → 설정창 열기 (패널 없을 때만, 3.5단계 이전 — 오버레이에 막히지 않게) ──
  {const _sn=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);
  if(_sn&&!_gpBtnsPrev['_noUI9']&&!document.querySelector('.panel.on')&&!(_gcEl&&_gcEl.classList.contains('on')))openPanel('settings');
  _gpBtnsPrev['_noUI9']=_sn;}

  // ── 3.5단계: UI 패널/오버레이 열려있으면 게임 입력 차단 + UI 네비게이션 ──
  if(_gcEl&&_gcEl.classList.contains("on")){_gpClearAll();_gpVCUpdate();_gpUINav(_gcEl);return;}
  const _gpOpenPanel=document.querySelector('.panel.on');
  const _gpOverlay=(()=>{
    for(const id of['introDiff','introKeys','deathReplay','death','lvUpScreen','tutorial','stageClear','victory','stageTransition']){
      const el=$(id);if(!el)continue;
      if(el.classList.contains('on'))return el;
      if(el.style.opacity==='1'&&el.style.pointerEvents==='all')return el;
    }
    return null;
  })();
  if(_gpOpenPanel||_gpOverlay){
    _gpClearAll();
    _gpVCUpdate(); // 좌스틱 → 가상 커서
    // Back(b8) → 뒤로가기 (서브팝업 → 패널 순 닫기)
    const _backNow=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);
    if(_backNow&&!_gpBtnsPrev['_back8']){
      _gpBtnsPrev['_back8']=true;
      const _gc=$('gcModal');const _sk=$('skSlotPop');const _cr=$('crBagPop');
      if(_gc&&_gc.classList.contains('on')){const _cb=$('gcCancel');if(_cb)_cb.click();}
      else if(_cr&&_cr.style.display==='flex'){closeCrystalPicker();}
      else if(_sk&&_sk.style.display==='flex'){_closeSkPop();}
      else{closeAllPanels();}
      return;
    }
    _gpBtnsPrev['_back8']=_backNow;
    // crBagPop 열려있으면 결정 주머니 전용 nav 우선
    const _crPop=$('crBagPop');
    if(_crPop&&_crPop.style.display==='flex'){_gpCrBagNav();return;}
    if(_gpOpenPanel&&_gpOpenPanel.id==='invPanel'){_gpInvNav()}
    else{_gpUINav(_gpOpenPanel||_gpOverlay)}
    return;
  }
  _gpVCHide(); // 패널 닫히면 커서 숨김
  // UI 닫힌 후 outline 잔류 제거
  if(_gpUIIdx>0||_gpInvIdx>0||_gpInvEqIdx>0){
    document.querySelectorAll('[style*="outline"]').forEach(el=>{if(el.style.outline){el.style.outline='';el.style.outlineOffset=''}});
    _gpUIIdx=0;_gpInvIdx=0;_gpInvEqIdx=0;_gpInvMode='bag';
  }

  // ── 4단계: 버튼 → 키 주입 ──
  // 조준 모드 판정 — LT 콤보보다 먼저 (조준 중 재발동 차단)
  const _isAimMode=P&&(P._mmAiming||P._bwAiming||P._tsAiming||P._msAiming||P._isAiming||P._hrAiming);

  // LT(6) = 모디파이어(홀드+ABXY=1234) / 탭(단독 뗄 때)=KeyF
  const _ltVal=_gpad.buttons[6]&&_gpad.buttons[6].value||0;
  const _ltHeld=_ltVal>0.7;
  const _ltWasHeld=!!_gpBtnsPrev['kLT_held'];
  const _LT_COMBO={0:'Digit1',1:'Digit2',3:'Digit3',2:'Digit4'}; // A=1,B=2,Y=3,X=4

  // LT 모디파이어 사용 여부 추적
  if(_ltHeld&&!_ltWasHeld)_gpBtnsPrev['kLT_mod']=false;
  let _ltUsedAsModifier=!!_gpBtnsPrev['kLT_mod'];

  if(_ltHeld){
    for(const bi in _LT_COMBO){
      const idx=+bi;
      const comboKey=_LT_COMBO[bi];
      const pressed=!!_gpBtns[idx];
      const prevKey='kLT'+idx;
      if(_isAimMode){
        // 조준 중 버튼 릴리즈 → 발사
        if(!pressed&&_gpBtnsPrev[prevKey]){MBjust[0]=true;G._gpAimDistReset=true;console.log('[GP-AIM] btn'+idx+' release → FIRE at dist='+G._gpAimDist+' mouse='+~~mouse.x+','+~~mouse.y)}
        _gpBtnsPrev[prevKey]=pressed;continue;
      }
      if(pressed&&!_gpBtnsPrev[prevKey]){
        _gpInjectKey(comboKey,true);_ltUsedAsModifier=true;_gpBtnsPrev['kLT_mod']=true;
      }
      if(!pressed&&_gpBtnsPrev[prevKey]){
        _gpInjectKey(comboKey,false);
      }
      _gpBtnsPrev[prevKey]=pressed;
    }
  } else {
    // LT 뗐을 때
    for(const bi in _LT_COMBO){
      const prevKey='kLT'+(+bi);
      if(_gpBtnsPrev[prevKey]){_gpInjectKey(_LT_COMBO[bi],false);_gpBtnsPrev[prevKey]=false}
    }
    if(_ltWasHeld&&_isAimMode){
      // 조준 중 LT 떼기 → 발사 (좌클릭) + 거리 리셋
      MBjust[0]=true;G._gpAimDistReset=true;
    } else if(_ltWasHeld&&!_gpBtnsPrev['kLT_mod']){
      // 모디파이어 안 쓰였으면 → KeyF 탭
      _gpInjectKey('KeyF',true);
      setTimeout(()=>_gpInjectKey('KeyF',false),100);
    }
  }
  _gpBtnsPrev['kLT_held']=_ltHeld;

  // 나머지 버튼 주입
  const _gpModFirst=[4,5,0,1,2,3,9,10,11]; // D-pad(12~15), Back(8) 제외 — Back은 전용 처리
  for(let _mi=0;_mi<_gpModFirst.length;_mi++){
    const idx=_gpModFirst[_mi];
    const kc=_GP_KEY[idx];
    if(!kc)continue;
    // LT 홀드 중 ABXY(0~3)는 콤보로 처리 → 원래 키 차단
    if(_ltHeld&&idx>=0&&idx<=3){
      if(_gpBtnsPrev['k'+idx])_gpInjectKey(kc,false);
      _gpBtnsPrev['k'+idx]=false;
      continue;
    }
    const pressed=!!_gpBtns[idx];
    const wasPrev=!!_gpBtnsPrev['k'+idx];
    if(pressed&&!wasPrev){
      if(idx===3&&G.on&&!G.paused){
        if(P._gwActive){_finishGhostWalk();_gpBtnsPrev['k'+idx]=pressed;continue}
        if(P._ioActive){activateIceShatter();_gpBtnsPrev['k'+idx]=pressed;continue}
      }
      _gpInjectKey(kc,true);
    }
    if(!pressed&&wasPrev)_gpInjectKey(kc,false);
    _gpBtnsPrev['k'+idx]=pressed;
  }

  // [release-sync] 게임패드 주입 키의 falling-edge 유실 방지 — 엣지 아닌 '현재 레벨'로 강제 해제만 (누르기는 위 엣지 로직 유지)
  for(var _ic in _gpInjHeld){
    if(!_gpInjHeld[_ic])continue;
    var _bi=_GP_KEYIDX[_ic];
    if(_bi===undefined)continue;
    if(!_gpBtns[_bi]){ _gpInjectKey(_ic,false); }
  }

  // RT→Z(필살기), LT+RT→X(처형)
  const rt=_gpad.buttons[7]&&_gpad.buttons[7].value>0.7;
  const ltrt=_ltHeld&&rt;
  if(ltrt&&!_gpBtnsPrev['kLTRT']){
    _gpInjectKey('KeyX',true);
    if(_gpBtnsPrev['kRT']){_gpInjectKey('KeyZ',false);_gpBtnsPrev['kRT']=false}
  }
  if(!ltrt&&_gpBtnsPrev['kLTRT']){_gpInjectKey('KeyX',false)}
  _gpBtnsPrev['kLTRT']=ltrt;
  if(!ltrt){
    if(rt&&!_gpBtnsPrev['kRT'])_gpInjectKey('KeyZ',true);
    if(!rt&&_gpBtnsPrev['kRT'])_gpInjectKey('KeyZ',false);
  }
  _gpBtnsPrev['kRT']=rt&&!ltrt;

  // 조준 모드: 포격식 (LT+버튼 홀드→거리증가, 스틱→방향, 릴리즈→발사)
  if(_isAimMode){
    // 스틱 방향 감지
    const ax=_gpAxes[0],ay=_gpAxes[1];
    const rx=_gpAxes[2],ry=_gpAxes[3];
    const lMag=Math.sqrt(ax*ax+ay*ay);
    const rMag=Math.sqrt(rx*rx+ry*ry);
    const useR=rMag>lMag;
    const sx2=useR?rx:ax, sy2=useR?ry:ay, mag=useR?rMag:lMag;
    if(mag>0.15){
      const _ang=Math.atan2(sy2,sx2);
      const _snap=Math.round(_ang/(Math.PI/4))*(Math.PI/4);
      P.facing=_snap;
    }
    // 포격 거리: LT+버튼 홀드 중 자동 증가 (0→1000)
    if(!G._gpAimDist)G._gpAimDist=0;
    // 지연 리셋: 발사 프레임에서는 좌표 유지, 다음 프레임에 리셋
    if(G._gpAimDistReset===2){G._gpAimDist=0;G._gpAimDistReset=0}
    if(G._gpAimDistReset===true)G._gpAimDistReset=2;
    // LT+ABXY 중 하나라도 눌려있으면 거리 증가
    const _anyAimBtn=(_ltHeld&&(_gpBtns[0]||_gpBtns[1]||_gpBtns[2]||_gpBtns[3]));
    if(_anyAimBtn){G._gpAimDist=Math.min((G._gpAimDist||0)+18,1000)}
    // 마우스 좌표를 플레이어+facing 방향×거리로 세팅
    const scx=P.x-G.cam.x+VW/2, scy=P.y-G.cam.y+VH/2;
    mouse.x=scx+Math.cos(P.facing)*(G._gpAimDist||0);
    mouse.y=scy+Math.sin(P.facing)*(G._gpAimDist||0);
    G._gpAiming=true;
  }else{
    // 비조준: 우스틱→방향+마법 자동발동 (트윈스틱)
    let rx=_gpAxes[2],ry=_gpAxes[3];
    // 아케이드스틱 등 우스틱 없는 패드: 좌스틱과 독립 움직임이 감지된 적 없으면 무시
    if(!_gpHasRStick){
      if((rx||ry)&&(rx!==_gpAxes[0]||ry!==_gpAxes[1]))_gpHasRStick=true;
      else{rx=0;ry=0}
    }
    const rMag=Math.sqrt(rx*rx+ry*ry);
    const _rsWas=!!_gpBtnsPrev['kRS'];
    if(rMag>0.2){
      P.facing=Math.atan2(ry,rx);
      G._gpAiming=true;
      if(!_rsWas)_gpInjectKey('mouse2',true); // 스틱 기울이면 마법키(우클릭) 누름
    }else{
      G._gpAiming=false;
      if(_rsWas)_gpInjectKey('mouse2',false); // 스틱 놓으면 마법키 해제
    }
    _gpBtnsPrev['kRS']=rMag>0.2;
  }

  // 좌스틱 → WASD (조준 모드가 아닐 때만 이동)
  const su=!_isAimMode&&_gpAxes[1]<-GP_DEAD,sd=!_isAimMode&&_gpAxes[1]>GP_DEAD,sl=!_isAimMode&&_gpAxes[0]<-GP_DEAD,sr=!_isAimMode&&_gpAxes[0]>GP_DEAD;
  const _stickMap=[['sU','KeyW',su],['sD','KeyS',sd],['sL','KeyA',sl],['sR','KeyD',sr]];
  for(let _si=0;_si<4;_si++){
    const[pk,kc,on]=_stickMap[_si];
    const was=!!_gpBtnsPrev[pk];
    if(on&&!was){K[kc]=true;const ev=new KeyboardEvent('keydown',{code:kc,key:kc,bubbles:true});ev._fromGp=true;document.dispatchEvent(ev)}
    if(!on&&was){K[kc]=false;const ev=new KeyboardEvent('keyup',{code:kc,key:kc,bubbles:true});ev._fromGp=true;document.dispatchEvent(ev)}
    _gpBtnsPrev[pk]=on;
  }
}
```

`_pollGamepad` after (no-panel X snapshot addition):

```js
function _pollGamepad(){
  // 이벤트 의존 금지 — BT 재연결 시 gamepadconnected가 안 오는 경우가 있어 매 프레임 폴링으로 직접 감지 (index.html과 동일 방식)
  const gps=navigator.getGamepads();
  let _found=null;
  for(let i=0;i<gps.length;i++){if(gps[i]&&gps[i].connected){_found=gps[i];break}}
  if(_found&&!_gpConnected){_gpConnected=true;_gpVibRef=_found;console.log('[GAMEPAD] 폴링 감지:',_found.id);try{notify('🎮 패드 연결됨')}catch(e2){}}
  if(!_found){
    // 패드 사라짐 (BT 절전/블립) — 주입 키 즉시 해제, _gpActive는 유지 (재연결 시 패드모드 그대로 복귀)
    if(_gpConnected){_gpConnected=false;_gpad=null;_gpClearAll();try{notify('🎮 패드 연결 끊김')}catch(e2){}}
    return;
  }
  _gpad=_found;

  // ── 1단계: 하드웨어 상태만 읽기 ──
  let _anyInput=false;
  for(let i=0;i<_gpad.buttons.length;i++){
    const pressed=_gpad.buttons[i].pressed||_gpad.buttons[i].value>0.5;
    _gpBtns[i]=pressed;
    if(pressed)_anyInput=true;
  }
  _gpAxes[0]=Math.abs(_gpad.axes[0])<GP_DEAD?0:_gpad.axes[0];
  _gpAxes[1]=Math.abs(_gpad.axes[1])<GP_DEAD?0:_gpad.axes[1];
  if(_gpad.axes.length>=4){
    _gpAxes[2]=Math.abs(_gpad.axes[2])<GP_DEAD?0:_gpad.axes[2];
    _gpAxes[3]=Math.abs(_gpad.axes[3])<GP_DEAD?0:_gpad.axes[3];
  }
  // D-pad를 axes[6/7]로 전달하는 패드 (Firefox 표준, 일부 컨트롤러)
  if(_gpad.axes.length>=8){
    _gpAxes[6]=Math.abs(_gpad.axes[6])<0.5?0:_gpad.axes[6];
    _gpAxes[7]=Math.abs(_gpad.axes[7])<0.5?0:_gpad.axes[7];
  }
  if(_gpAxes[0]||_gpAxes[1]||_gpAxes[2]||_gpAxes[3])_anyInput=true;
  // 부스: 패드 입력(버튼 눌림 or GP_DEAD=0.25 초과 스틱)도 유휴 리셋 — 폴링 경로라 여기서 처리(키보드/마우스와 동일 변수 _boothIdle, 어트랙트 오전환 방지)
  if(_anyInput&&_BOOTH_MODE)_boothIdle=0;

  // ── 2단계: 입력 감지 → 패드모드 활성화 (드리프트/아날로그 잔압 무시 — 조이스틱 팬텀 자동전환 방지) ──
  // 자동전환은 "의도적 입력"만 인정: 디지털 버튼 실제 press 또는 스틱 0.5 이상 큰 편향. (idle 스틱 드리프트/트리거 잔압으로 패드모드 켜지지 않게)
  let _gpDeliberate=false;
  for(let _di=0;_di<_gpad.buttons.length;_di++){if(_gpad.buttons[_di]&&_gpad.buttons[_di].pressed){_gpDeliberate=true;break}}
  if(!_gpDeliberate&&(Math.abs(_gpAxes[0])>0.5||Math.abs(_gpAxes[1])>0.5||Math.abs(_gpAxes[2])>0.5||Math.abs(_gpAxes[3])>0.5))_gpDeliberate=true;
  if(_gpDeliberate&&!_gpActive){_gpActive=true;document.body.style.cursor='none';C.style.cursor='none';}

  // ── 3단계: 패드모드 아니면 K[]/MB[] 절대 안 건드림 ──
  if(!_gpActive)return;
  // [팬텀차단] 패드모드 재진입 첫 폴링: 이미 눌려있는(드리프트) 버튼을 prev에 스냅샷 → rising-edge 오인주입(ShiftLeft stuck) 방지
  if(!_gpSynced){for(let _si=0;_si<_gpad.buttons.length;_si++)_gpBtnsPrev['k'+_si]=!!_gpBtns[_si];_gpSynced=true;}

  // ── 3a단계: 컷씬 진행 중이면 A=advance, B=skip홀드, Start=즉시스킵 ──
  if(typeof _cutsceneState!=='undefined'&&_cutsceneState==='INTRO_CUTSCENE'){
    const _cA=!!_gpBtns[0],_cB=!!_gpBtns[1],_cSt=!!_gpBtns[9];
    if(_cA&&!_gpBtnsPrev['_cutA'])_cutsceneAdvance();
    if(_cB)_cutSkipHolding=true; else if(_gpBtnsPrev['_cutB'])_cutSkipHolding=false;
    if(_cSt&&!_gpBtnsPrev['_cutSt'])_cutsceneEnd();
    _gpBtnsPrev['_cutA']=_cA;_gpBtnsPrev['_cutB']=_cB;_gpBtnsPrev['_cutSt']=_cSt;
    return;
  }

  // 통합 인트로는 자체 A/Start 입력을 사용한다. 설정창/전투 입력 누출 차단.
  if(G&&G._intro){_gpClearAll();_gpBtnsPrev['_noUI9']=!!_gpBtns[9];return;}

  // ── D-pad 패널 토글 (패널 닫혀있을 때만 — 열려있으면 네비게이션 전용) ──
  {const _DP=[[12,'skillPanel','toggle'],[13,'forge','forge'],[14,'statPanel','toggle'],[15,'invPanel','storage']];
  const _anyPanelOpen=!!document.querySelector('.panel.on');
  for(const[bi,pid,act] of _DP){
    const _on=!!(_gpad.buttons[bi]&&_gpad.buttons[bi].pressed);
    if(_on&&!_gpBtnsPrev['_dpg'+bi]&&!_anyPanelOpen){
      if(G&&G.on){
        if(act==='toggle')togglePanel(pid);
        else if(act==='forge'){if(G.forgeOpen){closePanel('forge');G.forgeOpen=false}else openPanel('forge')}
        else if(act==='storage')openInventoryStorage()
      }
    }
    _gpBtnsPrev['_dpg'+bi]=_on;
  }}

  // ── Start(b9) → 설정창 열기 (패널 없을 때만, 3.5단계 이전 — 오버레이에 막히지 않게) ──
  {const _sn=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);
  if(_sn&&!_gpBtnsPrev['_noUI9']&&!document.querySelector('.panel.on')&&!(_gcEl&&_gcEl.classList.contains('on')))openPanel('settings');
  _gpBtnsPrev['_noUI9']=_sn;}

  // ── 3.5단계: UI 패널/오버레이 열려있으면 게임 입력 차단 + UI 네비게이션 ──
  if(_gcEl&&_gcEl.classList.contains("on")){_gpClearAll();_gpVCUpdate();_gpUINav(_gcEl);return;}
  const _gpOpenPanel=document.querySelector('.panel.on');
  const _gpOverlay=(()=>{
    for(const id of['introDiff','introKeys','deathReplay','death','lvUpScreen','tutorial','stageClear','victory','stageTransition']){
      const el=$(id);if(!el)continue;
      if(el.classList.contains('on'))return el;
      if(el.style.opacity==='1'&&el.style.pointerEvents==='all')return el;
    }
    return null;
  })();
  if(_gpOpenPanel||_gpOverlay){
    _gpClearAll();
    _gpVCUpdate(); // 좌스틱 → 가상 커서
    // Back(b8) → 뒤로가기 (서브팝업 → 패널 순 닫기)
    const _backNow=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);
    if(_backNow&&!_gpBtnsPrev['_back8']){
      _gpBtnsPrev['_back8']=true;
      const _gc=$('gcModal');const _sk=$('skSlotPop');const _cr=$('crBagPop');
      if(_gc&&_gc.classList.contains('on')){const _cb=$('gcCancel');if(_cb)_cb.click();}
      else if(_cr&&_cr.style.display==='flex'){closeCrystalPicker();}
      else if(_sk&&_sk.style.display==='flex'){_closeSkPop();}
      else{closeAllPanels();}
      return;
    }
    _gpBtnsPrev['_back8']=_backNow;
    // crBagPop 열려있으면 결정 주머니 전용 nav 우선
    const _crPop=$('crBagPop');
    if(_crPop&&_crPop.style.display==='flex'){_gpCrBagNav();return;}
    if(_gpOpenPanel&&_gpOpenPanel.id==='invPanel'){_gpInvNav()}
    else{_gpUINav(_gpOpenPanel||_gpOverlay)}
    return;
  }
  _gpVCHide(); // 패널 닫히면 커서 숨김
  _gpUIPrev.x=!!_gpBtns[2];
  // UI 닫힌 후 outline 잔류 제거
  if(_gpUIIdx>0||_gpInvIdx>0||_gpInvEqIdx>0){
    document.querySelectorAll('[style*="outline"]').forEach(el=>{if(el.style.outline){el.style.outline='';el.style.outlineOffset=''}});
    _gpUIIdx=0;_gpInvIdx=0;_gpInvEqIdx=0;_gpInvMode='bag';
  }

  // ── 4단계: 버튼 → 키 주입 ──
  // 조준 모드 판정 — LT 콤보보다 먼저 (조준 중 재발동 차단)
  const _isAimMode=P&&(P._mmAiming||P._bwAiming||P._tsAiming||P._msAiming||P._isAiming||P._hrAiming);

  // LT(6) = 모디파이어(홀드+ABXY=1234) / 탭(단독 뗄 때)=KeyF
  const _ltVal=_gpad.buttons[6]&&_gpad.buttons[6].value||0;
  const _ltHeld=_ltVal>0.7;
  const _ltWasHeld=!!_gpBtnsPrev['kLT_held'];
  const _LT_COMBO={0:'Digit1',1:'Digit2',3:'Digit3',2:'Digit4'}; // A=1,B=2,Y=3,X=4

  // LT 모디파이어 사용 여부 추적
  if(_ltHeld&&!_ltWasHeld)_gpBtnsPrev['kLT_mod']=false;
  let _ltUsedAsModifier=!!_gpBtnsPrev['kLT_mod'];

  if(_ltHeld){
    for(const bi in _LT_COMBO){
      const idx=+bi;
      const comboKey=_LT_COMBO[bi];
      const pressed=!!_gpBtns[idx];
      const prevKey='kLT'+idx;
      if(_isAimMode){
        // 조준 중 버튼 릴리즈 → 발사
        if(!pressed&&_gpBtnsPrev[prevKey]){MBjust[0]=true;G._gpAimDistReset=true;console.log('[GP-AIM] btn'+idx+' release → FIRE at dist='+G._gpAimDist+' mouse='+~~mouse.x+','+~~mouse.y)}
        _gpBtnsPrev[prevKey]=pressed;continue;
      }
      if(pressed&&!_gpBtnsPrev[prevKey]){
        _gpInjectKey(comboKey,true);_ltUsedAsModifier=true;_gpBtnsPrev['kLT_mod']=true;
      }
      if(!pressed&&_gpBtnsPrev[prevKey]){
        _gpInjectKey(comboKey,false);
      }
      _gpBtnsPrev[prevKey]=pressed;
    }
  } else {
    // LT 뗐을 때
    for(const bi in _LT_COMBO){
      const prevKey='kLT'+(+bi);
      if(_gpBtnsPrev[prevKey]){_gpInjectKey(_LT_COMBO[bi],false);_gpBtnsPrev[prevKey]=false}
    }
    if(_ltWasHeld&&_isAimMode){
      // 조준 중 LT 떼기 → 발사 (좌클릭) + 거리 리셋
      MBjust[0]=true;G._gpAimDistReset=true;
    } else if(_ltWasHeld&&!_gpBtnsPrev['kLT_mod']){
      // 모디파이어 안 쓰였으면 → KeyF 탭
      _gpInjectKey('KeyF',true);
      setTimeout(()=>_gpInjectKey('KeyF',false),100);
    }
  }
  _gpBtnsPrev['kLT_held']=_ltHeld;

  // 나머지 버튼 주입
  const _gpModFirst=[4,5,0,1,2,3,9,10,11]; // D-pad(12~15), Back(8) 제외 — Back은 전용 처리
  for(let _mi=0;_mi<_gpModFirst.length;_mi++){
    const idx=_gpModFirst[_mi];
    const kc=_GP_KEY[idx];
    if(!kc)continue;
    // LT 홀드 중 ABXY(0~3)는 콤보로 처리 → 원래 키 차단
    if(_ltHeld&&idx>=0&&idx<=3){
      if(_gpBtnsPrev['k'+idx])_gpInjectKey(kc,false);
      _gpBtnsPrev['k'+idx]=false;
      continue;
    }
    const pressed=!!_gpBtns[idx];
    const wasPrev=!!_gpBtnsPrev['k'+idx];
    if(pressed&&!wasPrev){
      if(idx===3&&G.on&&!G.paused){
        if(P._gwActive){_finishGhostWalk();_gpBtnsPrev['k'+idx]=pressed;continue}
        if(P._ioActive){activateIceShatter();_gpBtnsPrev['k'+idx]=pressed;continue}
      }
      _gpInjectKey(kc,true);
    }
    if(!pressed&&wasPrev)_gpInjectKey(kc,false);
    _gpBtnsPrev['k'+idx]=pressed;
  }

  // [release-sync] 게임패드 주입 키의 falling-edge 유실 방지 — 엣지 아닌 '현재 레벨'로 강제 해제만 (누르기는 위 엣지 로직 유지)
  for(var _ic in _gpInjHeld){
    if(!_gpInjHeld[_ic])continue;
    var _bi=_GP_KEYIDX[_ic];
    if(_bi===undefined)continue;
    if(!_gpBtns[_bi]){ _gpInjectKey(_ic,false); }
  }

  // RT→Z(필살기), LT+RT→X(처형)
  const rt=_gpad.buttons[7]&&_gpad.buttons[7].value>0.7;
  const ltrt=_ltHeld&&rt;
  if(ltrt&&!_gpBtnsPrev['kLTRT']){
    _gpInjectKey('KeyX',true);
    if(_gpBtnsPrev['kRT']){_gpInjectKey('KeyZ',false);_gpBtnsPrev['kRT']=false}
  }
  if(!ltrt&&_gpBtnsPrev['kLTRT']){_gpInjectKey('KeyX',false)}
  _gpBtnsPrev['kLTRT']=ltrt;
  if(!ltrt){
    if(rt&&!_gpBtnsPrev['kRT'])_gpInjectKey('KeyZ',true);
    if(!rt&&_gpBtnsPrev['kRT'])_gpInjectKey('KeyZ',false);
  }
  _gpBtnsPrev['kRT']=rt&&!ltrt;

  // 조준 모드: 포격식 (LT+버튼 홀드→거리증가, 스틱→방향, 릴리즈→발사)
  if(_isAimMode){
    // 스틱 방향 감지
    const ax=_gpAxes[0],ay=_gpAxes[1];
    const rx=_gpAxes[2],ry=_gpAxes[3];
    const lMag=Math.sqrt(ax*ax+ay*ay);
    const rMag=Math.sqrt(rx*rx+ry*ry);
    const useR=rMag>lMag;
    const sx2=useR?rx:ax, sy2=useR?ry:ay, mag=useR?rMag:lMag;
    if(mag>0.15){
      const _ang=Math.atan2(sy2,sx2);
      const _snap=Math.round(_ang/(Math.PI/4))*(Math.PI/4);
      P.facing=_snap;
    }
    // 포격 거리: LT+버튼 홀드 중 자동 증가 (0→1000)
    if(!G._gpAimDist)G._gpAimDist=0;
    // 지연 리셋: 발사 프레임에서는 좌표 유지, 다음 프레임에 리셋
    if(G._gpAimDistReset===2){G._gpAimDist=0;G._gpAimDistReset=0}
    if(G._gpAimDistReset===true)G._gpAimDistReset=2;
    // LT+ABXY 중 하나라도 눌려있으면 거리 증가
    const _anyAimBtn=(_ltHeld&&(_gpBtns[0]||_gpBtns[1]||_gpBtns[2]||_gpBtns[3]));
    if(_anyAimBtn){G._gpAimDist=Math.min((G._gpAimDist||0)+18,1000)}
    // 마우스 좌표를 플레이어+facing 방향×거리로 세팅
    const scx=P.x-G.cam.x+VW/2, scy=P.y-G.cam.y+VH/2;
    mouse.x=scx+Math.cos(P.facing)*(G._gpAimDist||0);
    mouse.y=scy+Math.sin(P.facing)*(G._gpAimDist||0);
    G._gpAiming=true;
  }else{
    // 비조준: 우스틱→방향+마법 자동발동 (트윈스틱)
    let rx=_gpAxes[2],ry=_gpAxes[3];
    // 아케이드스틱 등 우스틱 없는 패드: 좌스틱과 독립 움직임이 감지된 적 없으면 무시
    if(!_gpHasRStick){
      if((rx||ry)&&(rx!==_gpAxes[0]||ry!==_gpAxes[1]))_gpHasRStick=true;
      else{rx=0;ry=0}
    }
    const rMag=Math.sqrt(rx*rx+ry*ry);
    const _rsWas=!!_gpBtnsPrev['kRS'];
    if(rMag>0.2){
      P.facing=Math.atan2(ry,rx);
      G._gpAiming=true;
      if(!_rsWas)_gpInjectKey('mouse2',true); // 스틱 기울이면 마법키(우클릭) 누름
    }else{
      G._gpAiming=false;
      if(_rsWas)_gpInjectKey('mouse2',false); // 스틱 놓으면 마법키 해제
    }
    _gpBtnsPrev['kRS']=rMag>0.2;
  }

  // 좌스틱 → WASD (조준 모드가 아닐 때만 이동)
  const su=!_isAimMode&&_gpAxes[1]<-GP_DEAD,sd=!_isAimMode&&_gpAxes[1]>GP_DEAD,sl=!_isAimMode&&_gpAxes[0]<-GP_DEAD,sr=!_isAimMode&&_gpAxes[0]>GP_DEAD;
  const _stickMap=[['sU','KeyW',su],['sD','KeyS',sd],['sL','KeyA',sl],['sR','KeyD',sr]];
  for(let _si=0;_si<4;_si++){
    const[pk,kc,on]=_stickMap[_si];
    const was=!!_gpBtnsPrev[pk];
    if(on&&!was){K[kc]=true;const ev=new KeyboardEvent('keydown',{code:kc,key:kc,bubbles:true});ev._fromGp=true;document.dispatchEvent(ev)}
    if(!on&&was){K[kc]=false;const ev=new KeyboardEvent('keyup',{code:kc,key:kc,bubbles:true});ev._fromGp=true;document.dispatchEvent(ev)}
    _gpBtnsPrev[pk]=on;
  }
}
```

### game-easy-test.html

source SHA256: 8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129

`_gpUINav` before SHA256: cc02ae15d667b7500e2f21dd84e0ee79ce6c2b704e526111face98ab52f4b4b0

```js
function _gpUINav(panel){
  if(!_gpad||!panel)return;
  // skSlotPop 열려있으면 그걸 패널로 전환 (skillPanel 밖에 있어서 querySelectorAll 미탐지)
  const _spop=$('skSlotPop');
  if(_spop&&_spop.style.display==='flex')panel=_spop;
  // 패널 내 포커스 가능 요소 수집
  const SEL='button:not([disabled]),.pclose,[onclick],.sk-opt:not(.locked),.up-row:not(.dis),.stat-btn:not(.dis),.passive-row:not(.dis),.fg-i:not(.dis),.fg-tab,.set-key,.id-btn,.retry,input[type="range"],input[type="checkbox"],select,[data-sk-id],.inv-filter-btn,.inv-eq-item,.inv-eq-slot,.inv-item,.inv-cr-item,.inv-cell,.inv-dep-item,.inv-exp-btn,.sk-pop-tab,.gc-btn,.inv-storage-toggle,.cmp-close,label[style*="cursor:pointer"],a[href],[style*="cursor:pointer"]';
  const items=[];
  const all=panel.querySelectorAll(SEL);
  for(let i=0;i<all.length;i++){
    const el=all[i];
    if(el.offsetParent===null)continue;
    // [data-sk-id] 자식 중복 방지: 스킬카드 안의 자식은 카드 자체만 잡음
    if(!el.dataset.skId&&el.closest('[data-sk-id]'))continue;
    items.push(el);
  }
  if(!items.length)return;
  if(_gpUIIdx>=items.length)_gpUIIdx=0;

  // D-pad(버튼12-15) + axes[6/7](일부 패드 D-pad) → 한 칸 이동 (좌스틱은 가상커서 전용)
  const _dU=(_gpad.buttons[12]&&_gpad.buttons[12].pressed)||_gpAxes[7]<-0.5;
  const _dD=(_gpad.buttons[13]&&_gpad.buttons[13].pressed)||_gpAxes[7]>0.5;
  const _dL=(_gpad.buttons[14]&&_gpad.buttons[14].pressed)||_gpAxes[6]<-0.5;
  const _dR=(_gpad.buttons[15]&&_gpad.buttons[15].pressed)||_gpAxes[6]>0.5;
  const u=_dU,d=_dD,l=_dL,r=_dR;
  // 가상 커서 모드 + 좌우 D-pad: 커서 아래 range 슬라이더 값 조절
  if(_gpVC.vis&&(l||r)){
    const _vcHover=document.elementFromPoint(_gpVC.x,_gpVC.y);
    const _vcRng=_vcHover&&(_vcHover.tagName==='INPUT'&&_vcHover.type==='range'?_vcHover:_vcHover.closest?.('.set-range-row')?.querySelector('input[type="range"]'));
    if(_vcRng){
      const _nowTs2=performance.now();const _dir2=l?'l':'r';
      if(_dir2!==_gpUIRepeatDir){_gpUIRepeatDir=_dir2;_gpUIRepeatTs=_nowTs2+_GP_UI_DELAY;
        const _s2=+((_vcRng.step)||1);_vcRng.value=l?Math.max(+_vcRng.min,+_vcRng.value-_s2):Math.min(+_vcRng.max,+_vcRng.value+_s2);_vcRng.dispatchEvent(new Event('input'));
      }else if(_nowTs2>=_gpUIRepeatTs){_gpUIRepeatTs=_nowTs2+_GP_UI_INTERVAL;
        const _s2=+((_vcRng.step)||1);_vcRng.value=l?Math.max(+_vcRng.min,+_vcRng.value-_s2):Math.min(+_vcRng.max,+_vcRng.value+_s2);_vcRng.dispatchEvent(new Event('input'));
      }
      _gpUIPrev.u=u;_gpUIPrev.d=d;_gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;return;
    }
  }
  if(u||d||l||r)_gpVCHide(); // D-pad 누르면 커서 숨기고 선택 모드
  // 우측 스틱 → 스크롤 (휠 역할) — 원시값 사용 (데드존 없이 0.15 임계)
  const rsYVal=_gpad.axes.length>=4?_gpad.axes[3]:0;
  const rsXVal=_gpad.axes.length>=3?_gpad.axes[2]:0;
  const a=_gpad.buttons[0]&&_gpad.buttons[0].pressed;
  const b=_gpad.buttons[1]&&_gpad.buttons[1].pressed;
  const lb=_gpad.buttons[4]&&_gpad.buttons[4].pressed;
  const rb=_gpad.buttons[5]&&_gpad.buttons[5].pressed;

  // 좌스틱/D-pad: 한 칸 이동 — repeat 타이머
  const _nowDir=u?'u':d?'d':l?'l':r?'r':null;
  const _nowTs=performance.now();
  let _didMove=false;
  if(_nowDir){
    if(_nowDir!==_gpUIRepeatDir){
      _gpUIRepeatDir=_nowDir;_gpUIRepeatTs=_nowTs+_GP_UI_DELAY;
      _gpUIStep(_nowDir,items);_didMove=true;
    } else if(_nowTs>=_gpUIRepeatTs){
      _gpUIRepeatTs=_nowTs+_GP_UI_INTERVAL;
      _gpUIStep(_nowDir,items);_didMove=true;
    }
  } else {
    _gpUIRepeatDir=null;
  }
  if(_didMove){_gpVibrate(2,40);_gpRSScrolled=false;}

  const cur=items[_gpUIIdx];

  // LB/RB: 탭 전환
  if((lb&&!_gpUIPrev.lb)||(rb&&!_gpUIPrev.rb)){
    if(panel.id==='skillPanel'&&typeof SKILL_HIER!=='undefined'){
      // 스킬패널 전용: SKILL_HIER 순환
      let _ci=SKILL_HIER.findIndex(h=>h.id===_skHierTab);if(_ci<0)_ci=0;
      if(rb&&!_gpUIPrev.rb)_ci=Math.min(SKILL_HIER.length-1,_ci+1);
      if(lb&&!_gpUIPrev.lb)_ci=Math.max(0,_ci-1);
      _skHierTab=SKILL_HIER[_ci].id;
      if(typeof renderSkillPanel==='function')renderSkillPanel();
    } else {
      const tabs=panel.querySelectorAll('.fg-tab');
      if(tabs.length>1){
        // 탭 있음 → 탭 전환
        let ti=-1;tabs.forEach((t,i)=>{if(t.classList.contains('act'))ti=i});
        if(ti<0)ti=0;
        if(rb&&!_gpUIPrev.rb)ti=Math.min(tabs.length-1,ti+1);
        if(lb&&!_gpUIPrev.lb)ti=Math.max(0,ti-1);
        if(tabs[ti])tabs[ti].click();
      } else {
        // 탭 없음 → 섹션(단락) 이동
        const _lc=items[_gpUIIdx];
        const _lt=_lc?_gpSectType(_lc):'';
        if(rb&&!_gpUIPrev.rb){
          let ni=_gpUIIdx;
          for(let i=_gpUIIdx+1;i<items.length;i++){if(_gpSectType(items[i])!==_lt){ni=i;break;}}
          _gpUIIdx=ni;
        }
        if(lb&&!_gpUIPrev.lb){
          let ni=_gpUIIdx,pt='';
          for(let i=_gpUIIdx-1;i>=0;i--){const t=_gpSectType(items[i]);if(t!==_lt){pt=t;ni=i;break;}}
          if(pt){while(ni>0&&_gpSectType(items[ni-1])===pt)ni--;}
          _gpUIIdx=ni;
        }
      }
    }
  }

  _gpUIPrev.lb=lb;_gpUIPrev.rb=rb;

  // 하이라이트 (우스틱 스크롤 후에는 D-pad 이동 전까지 scrollIntoView 억제)
  const _rsNow=_gpad.axes.length>=4&&(Math.abs(_gpad.axes[3])>0.15||Math.abs(_gpad.axes[2])>0.15);
  if(_rsNow)_gpRSScrolled=true;
  for(let i=0;i<items.length;i++){
    if(i===_gpUIIdx){
      items[i].style.outline='2px solid #C9A961';items[i].style.outlineOffset='-1px';
      if(!_gpRSScrolled){
        if(items[i].scrollIntoViewIfNeeded)items[i].scrollIntoViewIfNeeded(false);
        else items[i].scrollIntoView({block:'nearest'});
      }
    } else {
      items[i].style.outline='';items[i].style.outlineOffset='';
    }
  }

  // 키바인딩 입력 대기 중 → B=취소(ESC 주입)
  if(listeningBind&&b&&!_gpUIPrev.b){
    listeningBind=null;_listenAlt=false;renderSettings();
    _gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.y=y;_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;return;
  }

  // A = 커서 위치 클릭 우선, 없으면 포커스 요소 클릭
  if(a&&!_gpUIPrev.a){
    if(_gpVC.vis){
      let _vcEl=document.elementFromPoint(_gpVC.x,_gpVC.y);
      if(_vcEl&&_vcEl.id!=='_gpVCursor'){
        // range/select 또는 그 행 클릭 → D-pad 선택 모드로 전환하여 해당 요소 포커스
        const _vcRange=_vcEl.tagName==='INPUT'&&_vcEl.type==='range'?_vcEl:_vcEl.closest?.('.set-range-row')?.querySelector('input[type="range"]');
        const _vcSel=!_vcRange&&(_vcEl.tagName==='SELECT'?_vcEl:_vcEl.closest?.('.set-range-row')?.querySelector('select'));
        const _vcFocus=_vcRange||_vcSel;
        if(_vcFocus){
          for(let _ri=0;_ri<items.length;_ri++){if(items[_ri]===_vcFocus){_gpUIIdx=_ri;break}}
          _gpVCHide();
        } else {_vcEl.click()}
        _gpBtnsPrev['k0']=true;
      }
    } else if(cur){
      // 스킬카드 expanded: A → (+) 습득/강화 버튼 우선 클릭
      if(cur.dataset&&cur.dataset.skId){
        const _plusBtn=cur.querySelector('[style*="cursor:pointer"][style*="border:1px solid #aa8833"]');
        if(_plusBtn){_plusBtn.click();_gpBtnsPrev['k0']=true;}
        else{cur.click();_gpBtnsPrev['k0']=true;}
      } else if(cur.tagName==='SELECT'){
        // select: A = 다음 옵션 (네이티브 드롭다운 열지 않음 — 패드로 닫기 불가)
        cur.selectedIndex=(cur.selectedIndex+1)%cur.options.length;cur.dispatchEvent(new Event('change'));
        _gpBtnsPrev['k0']=true;
      } else {cur.click();_gpBtnsPrev['k0']=true;}
    }
  }
  // X = 스킬카드 expanded: (-) 레벨다운/취소 버튼
  const x=_gpad.buttons[2]&&_gpad.buttons[2].pressed;
  if(x&&!_gpUIPrev.x&&cur&&cur.dataset&&cur.dataset.skId&&panel.id==='skillPanel'){
    const _minBtn=cur.querySelector('[style*="cursor:pointer"][style*="border:1px solid #cc4444"]');
    if(_minBtn){_minBtn.click();_gpBtnsPrev['k2']=true;}
  }
  // B = 단계별 뒤로가기
  const _start=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);
  if((b&&!_gpUIPrev.b)){
    _panelBack();_gpBtnsPrev['k1']=true;
  }
  _gpUIPrev.start=_start;
  // Y = 스킬 패널: 선택 스킬 슬롯 배정 / 인벤: 장착·해제·꺼내기
  const y=_gpad.buttons[3]&&_gpad.buttons[3].pressed;
  if(y&&!_gpUIPrev.y&&cur){
    // 스킬 패널에서 .sk-opt 위에 있으면 → 순환 배정
    if(panel.id==='skillPanel'&&cur.classList.contains('sk-opt')){
      const skId=cur.dataset&&cur.dataset.skId;
      if(skId&&typeof _openSkillSlotPop==='function'){
        // 선택 슬롯 계약: 일반=1~4, 지옥강타 계열 분노 폭발=Space, 영역=F
        const si=_findAutoSkillSlot(skId);
        if(si>=0){SKILL_SLOTS[si]=skId;if(typeof updateQS==='function')updateQS();if(typeof dbSaveNow==='function')dbSaveNow();const _slNm=si<4?_T('슬롯')+(si+1):si===4?'SP'+_T('슬롯'):'F'+_T('슬롯');addTxt(P.x,P.y-20,_slNm+': '+_T(cur.querySelector('.sk-opt-name')?.textContent||skId),'#ff8844',40);SFX.pickup()}
      }
    }
    // 인벤토리 패널: Y = 우클릭 (장착/해제/꺼내기)
    if(panel.id==='invPanel'){
      if(cur.classList.contains('inv-item')||cur.classList.contains('inv-eq-item')||cur.classList.contains('inv-cell')){
        cur.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2}));
        _gpBtnsPrev['k3']=true;
      }
    }
  }

  _gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.y=y;

  // ── 우측 스틱: 패널 스크롤 (가상커서 위치 → 해당 영역, 없으면 포커스 항목 기준) ──
  if(Math.abs(rsYVal)>0.15||Math.abs(rsXVal)>0.15){
    let _sc=null;
    if(_gpVC.vis){_sc=_gpFindScroll(document.elementFromPoint(_gpVC.x,_gpVC.y))}
    if(!_sc){
      if(panel.id==='skillPanel')_sc=panel.querySelector('.frame-inner-panel-stack');
      if(!_sc&&cur)_sc=_gpFindScroll(cur);
    }
    if(!_sc)_sc=_gpFindScroll(panel)||_gpFindScrollDown(panel);
    if(_sc){_gpDoScroll(_sc,Math.abs(rsYVal)>0.15?rsYVal*18:0,Math.abs(rsXVal)>0.15?rsXVal*18:0)}
  }

  // 버튼 8(Back) = 전체 첫 항목  버튼 9(Start) = 전체 마지막 항목
  const b8=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);
  const b9=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);
  if(b8&&!_gpUIPrev.b8)_gpUIIdx=0;
  if(b9&&!_gpUIPrev.b9)_gpUIIdx=items.length-1;
  _gpUIPrev.b8=b8;_gpUIPrev.b9=b9;
}
```

`_gpUINav` after (X snapshot addition):

```js
function _gpUINav(panel){
  if(!_gpad||!panel)return;
  // skSlotPop 열려있으면 그걸 패널로 전환 (skillPanel 밖에 있어서 querySelectorAll 미탐지)
  const _spop=$('skSlotPop');
  if(_spop&&_spop.style.display==='flex')panel=_spop;
  // 패널 내 포커스 가능 요소 수집
  const SEL='button:not([disabled]),.pclose,[onclick],.sk-opt:not(.locked),.up-row:not(.dis),.stat-btn:not(.dis),.passive-row:not(.dis),.fg-i:not(.dis),.fg-tab,.set-key,.id-btn,.retry,input[type="range"],input[type="checkbox"],select,[data-sk-id],.inv-filter-btn,.inv-eq-item,.inv-eq-slot,.inv-item,.inv-cr-item,.inv-cell,.inv-dep-item,.inv-exp-btn,.sk-pop-tab,.gc-btn,.inv-storage-toggle,.cmp-close,label[style*="cursor:pointer"],a[href],[style*="cursor:pointer"]';
  const items=[];
  const all=panel.querySelectorAll(SEL);
  for(let i=0;i<all.length;i++){
    const el=all[i];
    if(el.offsetParent===null)continue;
    // [data-sk-id] 자식 중복 방지: 스킬카드 안의 자식은 카드 자체만 잡음
    if(!el.dataset.skId&&el.closest('[data-sk-id]'))continue;
    items.push(el);
  }
  if(!items.length)return;
  if(_gpUIIdx>=items.length)_gpUIIdx=0;

  // D-pad(버튼12-15) + axes[6/7](일부 패드 D-pad) → 한 칸 이동 (좌스틱은 가상커서 전용)
  const _dU=(_gpad.buttons[12]&&_gpad.buttons[12].pressed)||_gpAxes[7]<-0.5;
  const _dD=(_gpad.buttons[13]&&_gpad.buttons[13].pressed)||_gpAxes[7]>0.5;
  const _dL=(_gpad.buttons[14]&&_gpad.buttons[14].pressed)||_gpAxes[6]<-0.5;
  const _dR=(_gpad.buttons[15]&&_gpad.buttons[15].pressed)||_gpAxes[6]>0.5;
  const u=_dU,d=_dD,l=_dL,r=_dR;
  // 가상 커서 모드 + 좌우 D-pad: 커서 아래 range 슬라이더 값 조절
  if(_gpVC.vis&&(l||r)){
    const _vcHover=document.elementFromPoint(_gpVC.x,_gpVC.y);
    const _vcRng=_vcHover&&(_vcHover.tagName==='INPUT'&&_vcHover.type==='range'?_vcHover:_vcHover.closest?.('.set-range-row')?.querySelector('input[type="range"]'));
    if(_vcRng){
      const _nowTs2=performance.now();const _dir2=l?'l':'r';
      if(_dir2!==_gpUIRepeatDir){_gpUIRepeatDir=_dir2;_gpUIRepeatTs=_nowTs2+_GP_UI_DELAY;
        const _s2=+((_vcRng.step)||1);_vcRng.value=l?Math.max(+_vcRng.min,+_vcRng.value-_s2):Math.min(+_vcRng.max,+_vcRng.value+_s2);_vcRng.dispatchEvent(new Event('input'));
      }else if(_nowTs2>=_gpUIRepeatTs){_gpUIRepeatTs=_nowTs2+_GP_UI_INTERVAL;
        const _s2=+((_vcRng.step)||1);_vcRng.value=l?Math.max(+_vcRng.min,+_vcRng.value-_s2):Math.min(+_vcRng.max,+_vcRng.value+_s2);_vcRng.dispatchEvent(new Event('input'));
      }
      _gpUIPrev.u=u;_gpUIPrev.d=d;_gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;return;
    }
  }
  if(u||d||l||r)_gpVCHide(); // D-pad 누르면 커서 숨기고 선택 모드
  // 우측 스틱 → 스크롤 (휠 역할) — 원시값 사용 (데드존 없이 0.15 임계)
  const rsYVal=_gpad.axes.length>=4?_gpad.axes[3]:0;
  const rsXVal=_gpad.axes.length>=3?_gpad.axes[2]:0;
  const a=_gpad.buttons[0]&&_gpad.buttons[0].pressed;
  const b=_gpad.buttons[1]&&_gpad.buttons[1].pressed;
  const lb=_gpad.buttons[4]&&_gpad.buttons[4].pressed;
  const rb=_gpad.buttons[5]&&_gpad.buttons[5].pressed;

  // 좌스틱/D-pad: 한 칸 이동 — repeat 타이머
  const _nowDir=u?'u':d?'d':l?'l':r?'r':null;
  const _nowTs=performance.now();
  let _didMove=false;
  if(_nowDir){
    if(_nowDir!==_gpUIRepeatDir){
      _gpUIRepeatDir=_nowDir;_gpUIRepeatTs=_nowTs+_GP_UI_DELAY;
      _gpUIStep(_nowDir,items);_didMove=true;
    } else if(_nowTs>=_gpUIRepeatTs){
      _gpUIRepeatTs=_nowTs+_GP_UI_INTERVAL;
      _gpUIStep(_nowDir,items);_didMove=true;
    }
  } else {
    _gpUIRepeatDir=null;
  }
  if(_didMove){_gpVibrate(2,40);_gpRSScrolled=false;}

  const cur=items[_gpUIIdx];

  // LB/RB: 탭 전환
  if((lb&&!_gpUIPrev.lb)||(rb&&!_gpUIPrev.rb)){
    if(panel.id==='skillPanel'&&typeof SKILL_HIER!=='undefined'){
      // 스킬패널 전용: SKILL_HIER 순환
      let _ci=SKILL_HIER.findIndex(h=>h.id===_skHierTab);if(_ci<0)_ci=0;
      if(rb&&!_gpUIPrev.rb)_ci=Math.min(SKILL_HIER.length-1,_ci+1);
      if(lb&&!_gpUIPrev.lb)_ci=Math.max(0,_ci-1);
      _skHierTab=SKILL_HIER[_ci].id;
      if(typeof renderSkillPanel==='function')renderSkillPanel();
    } else {
      const tabs=panel.querySelectorAll('.fg-tab');
      if(tabs.length>1){
        // 탭 있음 → 탭 전환
        let ti=-1;tabs.forEach((t,i)=>{if(t.classList.contains('act'))ti=i});
        if(ti<0)ti=0;
        if(rb&&!_gpUIPrev.rb)ti=Math.min(tabs.length-1,ti+1);
        if(lb&&!_gpUIPrev.lb)ti=Math.max(0,ti-1);
        if(tabs[ti])tabs[ti].click();
      } else {
        // 탭 없음 → 섹션(단락) 이동
        const _lc=items[_gpUIIdx];
        const _lt=_lc?_gpSectType(_lc):'';
        if(rb&&!_gpUIPrev.rb){
          let ni=_gpUIIdx;
          for(let i=_gpUIIdx+1;i<items.length;i++){if(_gpSectType(items[i])!==_lt){ni=i;break;}}
          _gpUIIdx=ni;
        }
        if(lb&&!_gpUIPrev.lb){
          let ni=_gpUIIdx,pt='';
          for(let i=_gpUIIdx-1;i>=0;i--){const t=_gpSectType(items[i]);if(t!==_lt){pt=t;ni=i;break;}}
          if(pt){while(ni>0&&_gpSectType(items[ni-1])===pt)ni--;}
          _gpUIIdx=ni;
        }
      }
    }
  }

  _gpUIPrev.lb=lb;_gpUIPrev.rb=rb;

  // 하이라이트 (우스틱 스크롤 후에는 D-pad 이동 전까지 scrollIntoView 억제)
  const _rsNow=_gpad.axes.length>=4&&(Math.abs(_gpad.axes[3])>0.15||Math.abs(_gpad.axes[2])>0.15);
  if(_rsNow)_gpRSScrolled=true;
  for(let i=0;i<items.length;i++){
    if(i===_gpUIIdx){
      items[i].style.outline='2px solid #C9A961';items[i].style.outlineOffset='-1px';
      if(!_gpRSScrolled){
        if(items[i].scrollIntoViewIfNeeded)items[i].scrollIntoViewIfNeeded(false);
        else items[i].scrollIntoView({block:'nearest'});
      }
    } else {
      items[i].style.outline='';items[i].style.outlineOffset='';
    }
  }

  // 키바인딩 입력 대기 중 → B=취소(ESC 주입)
  if(listeningBind&&b&&!_gpUIPrev.b){
    listeningBind=null;_listenAlt=false;renderSettings();
    _gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.y=y;_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;return;
  }

  // A = 커서 위치 클릭 우선, 없으면 포커스 요소 클릭
  if(a&&!_gpUIPrev.a){
    if(_gpVC.vis){
      let _vcEl=document.elementFromPoint(_gpVC.x,_gpVC.y);
      if(_vcEl&&_vcEl.id!=='_gpVCursor'){
        // range/select 또는 그 행 클릭 → D-pad 선택 모드로 전환하여 해당 요소 포커스
        const _vcRange=_vcEl.tagName==='INPUT'&&_vcEl.type==='range'?_vcEl:_vcEl.closest?.('.set-range-row')?.querySelector('input[type="range"]');
        const _vcSel=!_vcRange&&(_vcEl.tagName==='SELECT'?_vcEl:_vcEl.closest?.('.set-range-row')?.querySelector('select'));
        const _vcFocus=_vcRange||_vcSel;
        if(_vcFocus){
          for(let _ri=0;_ri<items.length;_ri++){if(items[_ri]===_vcFocus){_gpUIIdx=_ri;break}}
          _gpVCHide();
        } else {_vcEl.click()}
        _gpBtnsPrev['k0']=true;
      }
    } else if(cur){
      // 스킬카드 expanded: A → (+) 습득/강화 버튼 우선 클릭
      if(cur.dataset&&cur.dataset.skId){
        const _plusBtn=cur.querySelector('[style*="cursor:pointer"][style*="border:1px solid #aa8833"]');
        if(_plusBtn){_plusBtn.click();_gpBtnsPrev['k0']=true;}
        else{cur.click();_gpBtnsPrev['k0']=true;}
      } else if(cur.tagName==='SELECT'){
        // select: A = 다음 옵션 (네이티브 드롭다운 열지 않음 — 패드로 닫기 불가)
        cur.selectedIndex=(cur.selectedIndex+1)%cur.options.length;cur.dispatchEvent(new Event('change'));
        _gpBtnsPrev['k0']=true;
      } else {cur.click();_gpBtnsPrev['k0']=true;}
    }
  }
  // X = 스킬카드 expanded: (-) 레벨다운/취소 버튼
  const x=_gpad.buttons[2]&&_gpad.buttons[2].pressed;
  if(x&&!_gpUIPrev.x&&cur&&cur.dataset&&cur.dataset.skId&&panel.id==='skillPanel'){
    const _minBtn=cur.querySelector('[style*="cursor:pointer"][style*="border:1px solid #cc4444"]');
    if(_minBtn){_minBtn.click();_gpBtnsPrev['k2']=true;}
  }
  // B = 단계별 뒤로가기
  const _start=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);
  if((b&&!_gpUIPrev.b)){
    _panelBack();_gpBtnsPrev['k1']=true;
  }
  _gpUIPrev.start=_start;
  // Y = 스킬 패널: 선택 스킬 슬롯 배정 / 인벤: 장착·해제·꺼내기
  const y=_gpad.buttons[3]&&_gpad.buttons[3].pressed;
  if(y&&!_gpUIPrev.y&&cur){
    // 스킬 패널에서 .sk-opt 위에 있으면 → 순환 배정
    if(panel.id==='skillPanel'&&cur.classList.contains('sk-opt')){
      const skId=cur.dataset&&cur.dataset.skId;
      if(skId&&typeof _openSkillSlotPop==='function'){
        // 선택 슬롯 계약: 일반=1~4, 지옥강타 계열 분노 폭발=Space, 영역=F
        const si=_findAutoSkillSlot(skId);
        if(si>=0){SKILL_SLOTS[si]=skId;if(typeof updateQS==='function')updateQS();if(typeof dbSaveNow==='function')dbSaveNow();const _slNm=si<4?_T('슬롯')+(si+1):si===4?'SP'+_T('슬롯'):'F'+_T('슬롯');addTxt(P.x,P.y-20,_slNm+': '+_T(cur.querySelector('.sk-opt-name')?.textContent||skId),'#ff8844',40);SFX.pickup()}
      }
    }
    // 인벤토리 패널: Y = 우클릭 (장착/해제/꺼내기)
    if(panel.id==='invPanel'){
      if(cur.classList.contains('inv-item')||cur.classList.contains('inv-eq-item')||cur.classList.contains('inv-cell')){
        cur.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2}));
        _gpBtnsPrev['k3']=true;
      }
    }
  }

  _gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.y=y;_gpUIPrev.x=x;

  // ── 우측 스틱: 패널 스크롤 (가상커서 위치 → 해당 영역, 없으면 포커스 항목 기준) ──
  if(Math.abs(rsYVal)>0.15||Math.abs(rsXVal)>0.15){
    let _sc=null;
    if(_gpVC.vis){_sc=_gpFindScroll(document.elementFromPoint(_gpVC.x,_gpVC.y))}
    if(!_sc){
      if(panel.id==='skillPanel')_sc=panel.querySelector('.frame-inner-panel-stack');
      if(!_sc&&cur)_sc=_gpFindScroll(cur);
    }
    if(!_sc)_sc=_gpFindScroll(panel)||_gpFindScrollDown(panel);
    if(_sc){_gpDoScroll(_sc,Math.abs(rsYVal)>0.15?rsYVal*18:0,Math.abs(rsXVal)>0.15?rsXVal*18:0)}
  }

  // 버튼 8(Back) = 전체 첫 항목  버튼 9(Start) = 전체 마지막 항목
  const b8=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);
  const b9=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);
  if(b8&&!_gpUIPrev.b8)_gpUIIdx=0;
  if(b9&&!_gpUIPrev.b9)_gpUIIdx=items.length-1;
  _gpUIPrev.b8=b8;_gpUIPrev.b9=b9;
}
```

`_pollGamepad` before SHA256: 00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d

```js
function _pollGamepad(){
  // 이벤트 의존 금지 — BT 재연결 시 gamepadconnected가 안 오는 경우가 있어 매 프레임 폴링으로 직접 감지 (index.html과 동일 방식)
  const gps=navigator.getGamepads();
  let _found=null;
  for(let i=0;i<gps.length;i++){if(gps[i]&&gps[i].connected){_found=gps[i];break}}
  if(_found&&!_gpConnected){_gpConnected=true;_gpVibRef=_found;console.log('[GAMEPAD] 폴링 감지:',_found.id);try{notify('🎮 패드 연결됨')}catch(e2){}}
  if(!_found){
    // 패드 사라짐 (BT 절전/블립) — 주입 키 즉시 해제, _gpActive는 유지 (재연결 시 패드모드 그대로 복귀)
    if(_gpConnected){_gpConnected=false;_gpad=null;_gpClearAll();try{notify('🎮 패드 연결 끊김')}catch(e2){}}
    return;
  }
  _gpad=_found;

  // ── 1단계: 하드웨어 상태만 읽기 ──
  let _anyInput=false;
  for(let i=0;i<_gpad.buttons.length;i++){
    const pressed=_gpad.buttons[i].pressed||_gpad.buttons[i].value>0.5;
    _gpBtns[i]=pressed;
    if(pressed)_anyInput=true;
  }
  _gpAxes[0]=Math.abs(_gpad.axes[0])<GP_DEAD?0:_gpad.axes[0];
  _gpAxes[1]=Math.abs(_gpad.axes[1])<GP_DEAD?0:_gpad.axes[1];
  if(_gpad.axes.length>=4){
    _gpAxes[2]=Math.abs(_gpad.axes[2])<GP_DEAD?0:_gpad.axes[2];
    _gpAxes[3]=Math.abs(_gpad.axes[3])<GP_DEAD?0:_gpad.axes[3];
  }
  // D-pad를 axes[6/7]로 전달하는 패드 (Firefox 표준, 일부 컨트롤러)
  if(_gpad.axes.length>=8){
    _gpAxes[6]=Math.abs(_gpad.axes[6])<0.5?0:_gpad.axes[6];
    _gpAxes[7]=Math.abs(_gpad.axes[7])<0.5?0:_gpad.axes[7];
  }
  if(_gpAxes[0]||_gpAxes[1]||_gpAxes[2]||_gpAxes[3])_anyInput=true;
  // 부스: 패드 입력(버튼 눌림 or GP_DEAD=0.25 초과 스틱)도 유휴 리셋 — 폴링 경로라 여기서 처리(키보드/마우스와 동일 변수 _boothIdle, 어트랙트 오전환 방지)
  if(_anyInput&&_BOOTH_MODE)_boothIdle=0;

  // ── 2단계: 입력 감지 → 패드모드 활성화 (드리프트/아날로그 잔압 무시 — 조이스틱 팬텀 자동전환 방지) ──
  // 자동전환은 "의도적 입력"만 인정: 디지털 버튼 실제 press 또는 스틱 0.5 이상 큰 편향. (idle 스틱 드리프트/트리거 잔압으로 패드모드 켜지지 않게)
  let _gpDeliberate=false;
  for(let _di=0;_di<_gpad.buttons.length;_di++){if(_gpad.buttons[_di]&&_gpad.buttons[_di].pressed){_gpDeliberate=true;break}}
  if(!_gpDeliberate&&(Math.abs(_gpAxes[0])>0.5||Math.abs(_gpAxes[1])>0.5||Math.abs(_gpAxes[2])>0.5||Math.abs(_gpAxes[3])>0.5))_gpDeliberate=true;
  if(_gpDeliberate&&!_gpActive){_gpActive=true;document.body.style.cursor='none';C.style.cursor='none';}

  // ── 3단계: 패드모드 아니면 K[]/MB[] 절대 안 건드림 ──
  if(!_gpActive)return;
  // [팬텀차단] 패드모드 재진입 첫 폴링: 이미 눌려있는(드리프트) 버튼을 prev에 스냅샷 → rising-edge 오인주입(ShiftLeft stuck) 방지
  if(!_gpSynced){for(let _si=0;_si<_gpad.buttons.length;_si++)_gpBtnsPrev['k'+_si]=!!_gpBtns[_si];_gpSynced=true;}

  // ── 3a단계: 컷씬 진행 중이면 A=advance, B=skip홀드, Start=즉시스킵 ──
  if(typeof _cutsceneState!=='undefined'&&_cutsceneState==='INTRO_CUTSCENE'){
    const _cA=!!_gpBtns[0],_cB=!!_gpBtns[1],_cSt=!!_gpBtns[9];
    if(_cA&&!_gpBtnsPrev['_cutA'])_cutsceneAdvance();
    if(_cB)_cutSkipHolding=true; else if(_gpBtnsPrev['_cutB'])_cutSkipHolding=false;
    if(_cSt&&!_gpBtnsPrev['_cutSt'])_cutsceneEnd();
    _gpBtnsPrev['_cutA']=_cA;_gpBtnsPrev['_cutB']=_cB;_gpBtnsPrev['_cutSt']=_cSt;
    return;
  }

  // 통합 인트로는 자체 A/Start 입력을 사용한다. 설정창/전투 입력 누출 차단.
  if(G&&G._intro){_gpClearAll();_gpBtnsPrev['_noUI9']=!!_gpBtns[9];return;}

  // ── D-pad 패널 토글 (패널 닫혀있을 때만 — 열려있으면 네비게이션 전용) ──
  {const _DP=[[12,'skillPanel','toggle'],[13,'forge','forge'],[14,'statPanel','toggle'],[15,'invPanel','storage']];
  const _anyPanelOpen=!!document.querySelector('.panel.on');
  for(const[bi,pid,act] of _DP){
    const _on=!!(_gpad.buttons[bi]&&_gpad.buttons[bi].pressed);
    if(_on&&!_gpBtnsPrev['_dpg'+bi]&&!_anyPanelOpen){
      if(G&&G.on){
        if(act==='toggle')togglePanel(pid);
        else if(act==='forge'){if(G.forgeOpen){closePanel('forge');G.forgeOpen=false}else openPanel('forge')}
        else if(act==='storage')openInventoryStorage()
      }
    }
    _gpBtnsPrev['_dpg'+bi]=_on;
  }}

  // ── Start(b9) → 설정창 열기 (패널 없을 때만, 3.5단계 이전 — 오버레이에 막히지 않게) ──
  {const _sn=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);
  if(_sn&&!_gpBtnsPrev['_noUI9']&&!document.querySelector('.panel.on')&&!(_gcEl&&_gcEl.classList.contains('on')))openPanel('settings');
  _gpBtnsPrev['_noUI9']=_sn;}

  // ── 3.5단계: UI 패널/오버레이 열려있으면 게임 입력 차단 + UI 네비게이션 ──
  if(_gcEl&&_gcEl.classList.contains("on")){_gpClearAll();_gpVCUpdate();_gpUINav(_gcEl);return;}
  const _gpOpenPanel=document.querySelector('.panel.on');
  const _gpOverlay=(()=>{
    for(const id of['introDiff','introKeys','deathReplay','death','lvUpScreen','tutorial','stageClear','victory','stageTransition']){
      const el=$(id);if(!el)continue;
      if(el.classList.contains('on'))return el;
      if(el.style.opacity==='1'&&el.style.pointerEvents==='all')return el;
    }
    return null;
  })();
  if(_gpOpenPanel||_gpOverlay){
    _gpClearAll();
    _gpVCUpdate(); // 좌스틱 → 가상 커서
    // Back(b8) → 뒤로가기 (서브팝업 → 패널 순 닫기)
    const _backNow=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);
    if(_backNow&&!_gpBtnsPrev['_back8']){
      _gpBtnsPrev['_back8']=true;
      const _gc=$('gcModal');const _sk=$('skSlotPop');const _cr=$('crBagPop');
      if(_gc&&_gc.classList.contains('on')){const _cb=$('gcCancel');if(_cb)_cb.click();}
      else if(_cr&&_cr.style.display==='flex'){closeCrystalPicker();}
      else if(_sk&&_sk.style.display==='flex'){_closeSkPop();}
      else{closeAllPanels();}
      return;
    }
    _gpBtnsPrev['_back8']=_backNow;
    // crBagPop 열려있으면 결정 주머니 전용 nav 우선
    const _crPop=$('crBagPop');
    if(_crPop&&_crPop.style.display==='flex'){_gpCrBagNav();return;}
    if(_gpOpenPanel&&_gpOpenPanel.id==='invPanel'){_gpInvNav()}
    else{_gpUINav(_gpOpenPanel||_gpOverlay)}
    return;
  }
  _gpVCHide(); // 패널 닫히면 커서 숨김
  // UI 닫힌 후 outline 잔류 제거
  if(_gpUIIdx>0||_gpInvIdx>0||_gpInvEqIdx>0){
    document.querySelectorAll('[style*="outline"]').forEach(el=>{if(el.style.outline){el.style.outline='';el.style.outlineOffset=''}});
    _gpUIIdx=0;_gpInvIdx=0;_gpInvEqIdx=0;_gpInvMode='bag';
  }

  // ── 4단계: 버튼 → 키 주입 ──
  // 조준 모드 판정 — LT 콤보보다 먼저 (조준 중 재발동 차단)
  const _isAimMode=P&&(P._mmAiming||P._bwAiming||P._tsAiming||P._msAiming||P._isAiming||P._hrAiming);

  // LT(6) = 모디파이어(홀드+ABXY=1234) / 탭(단독 뗄 때)=KeyF
  const _ltVal=_gpad.buttons[6]&&_gpad.buttons[6].value||0;
  const _ltHeld=_ltVal>0.7;
  const _ltWasHeld=!!_gpBtnsPrev['kLT_held'];
  const _LT_COMBO={0:'Digit1',1:'Digit2',3:'Digit3',2:'Digit4'}; // A=1,B=2,Y=3,X=4

  // LT 모디파이어 사용 여부 추적
  if(_ltHeld&&!_ltWasHeld)_gpBtnsPrev['kLT_mod']=false;
  let _ltUsedAsModifier=!!_gpBtnsPrev['kLT_mod'];

  if(_ltHeld){
    for(const bi in _LT_COMBO){
      const idx=+bi;
      const comboKey=_LT_COMBO[bi];
      const pressed=!!_gpBtns[idx];
      const prevKey='kLT'+idx;
      if(_isAimMode){
        // 조준 중 버튼 릴리즈 → 발사
        if(!pressed&&_gpBtnsPrev[prevKey]){MBjust[0]=true;G._gpAimDistReset=true;console.log('[GP-AIM] btn'+idx+' release → FIRE at dist='+G._gpAimDist+' mouse='+~~mouse.x+','+~~mouse.y)}
        _gpBtnsPrev[prevKey]=pressed;continue;
      }
      if(pressed&&!_gpBtnsPrev[prevKey]){
        _gpInjectKey(comboKey,true);_ltUsedAsModifier=true;_gpBtnsPrev['kLT_mod']=true;
      }
      if(!pressed&&_gpBtnsPrev[prevKey]){
        _gpInjectKey(comboKey,false);
      }
      _gpBtnsPrev[prevKey]=pressed;
    }
  } else {
    // LT 뗐을 때
    for(const bi in _LT_COMBO){
      const prevKey='kLT'+(+bi);
      if(_gpBtnsPrev[prevKey]){_gpInjectKey(_LT_COMBO[bi],false);_gpBtnsPrev[prevKey]=false}
    }
    if(_ltWasHeld&&_isAimMode){
      // 조준 중 LT 떼기 → 발사 (좌클릭) + 거리 리셋
      MBjust[0]=true;G._gpAimDistReset=true;
    } else if(_ltWasHeld&&!_gpBtnsPrev['kLT_mod']){
      // 모디파이어 안 쓰였으면 → KeyF 탭
      _gpInjectKey('KeyF',true);
      setTimeout(()=>_gpInjectKey('KeyF',false),100);
    }
  }
  _gpBtnsPrev['kLT_held']=_ltHeld;

  // 나머지 버튼 주입
  const _gpModFirst=[4,5,0,1,2,3,9,10,11]; // D-pad(12~15), Back(8) 제외 — Back은 전용 처리
  for(let _mi=0;_mi<_gpModFirst.length;_mi++){
    const idx=_gpModFirst[_mi];
    const kc=_GP_KEY[idx];
    if(!kc)continue;
    // LT 홀드 중 ABXY(0~3)는 콤보로 처리 → 원래 키 차단
    if(_ltHeld&&idx>=0&&idx<=3){
      if(_gpBtnsPrev['k'+idx])_gpInjectKey(kc,false);
      _gpBtnsPrev['k'+idx]=false;
      continue;
    }
    const pressed=!!_gpBtns[idx];
    const wasPrev=!!_gpBtnsPrev['k'+idx];
    if(pressed&&!wasPrev){
      if(idx===3&&G.on&&!G.paused){
        if(P._gwActive){_finishGhostWalk();_gpBtnsPrev['k'+idx]=pressed;continue}
        if(P._ioActive){activateIceShatter();_gpBtnsPrev['k'+idx]=pressed;continue}
      }
      _gpInjectKey(kc,true);
    }
    if(!pressed&&wasPrev)_gpInjectKey(kc,false);
    _gpBtnsPrev['k'+idx]=pressed;
  }

  // [release-sync] 게임패드 주입 키의 falling-edge 유실 방지 — 엣지 아닌 '현재 레벨'로 강제 해제만 (누르기는 위 엣지 로직 유지)
  for(var _ic in _gpInjHeld){
    if(!_gpInjHeld[_ic])continue;
    var _bi=_GP_KEYIDX[_ic];
    if(_bi===undefined)continue;
    if(!_gpBtns[_bi]){ _gpInjectKey(_ic,false); }
  }

  // RT→Z(필살기), LT+RT→X(처형)
  const rt=_gpad.buttons[7]&&_gpad.buttons[7].value>0.7;
  const ltrt=_ltHeld&&rt;
  if(ltrt&&!_gpBtnsPrev['kLTRT']){
    _gpInjectKey('KeyX',true);
    if(_gpBtnsPrev['kRT']){_gpInjectKey('KeyZ',false);_gpBtnsPrev['kRT']=false}
  }
  if(!ltrt&&_gpBtnsPrev['kLTRT']){_gpInjectKey('KeyX',false)}
  _gpBtnsPrev['kLTRT']=ltrt;
  if(!ltrt){
    if(rt&&!_gpBtnsPrev['kRT'])_gpInjectKey('KeyZ',true);
    if(!rt&&_gpBtnsPrev['kRT'])_gpInjectKey('KeyZ',false);
  }
  _gpBtnsPrev['kRT']=rt&&!ltrt;

  // 조준 모드: 포격식 (LT+버튼 홀드→거리증가, 스틱→방향, 릴리즈→발사)
  if(_isAimMode){
    // 스틱 방향 감지
    const ax=_gpAxes[0],ay=_gpAxes[1];
    const rx=_gpAxes[2],ry=_gpAxes[3];
    const lMag=Math.sqrt(ax*ax+ay*ay);
    const rMag=Math.sqrt(rx*rx+ry*ry);
    const useR=rMag>lMag;
    const sx2=useR?rx:ax, sy2=useR?ry:ay, mag=useR?rMag:lMag;
    if(mag>0.15){
      const _ang=Math.atan2(sy2,sx2);
      const _snap=Math.round(_ang/(Math.PI/4))*(Math.PI/4);
      P.facing=_snap;
    }
    // 포격 거리: LT+버튼 홀드 중 자동 증가 (0→1000)
    if(!G._gpAimDist)G._gpAimDist=0;
    // 지연 리셋: 발사 프레임에서는 좌표 유지, 다음 프레임에 리셋
    if(G._gpAimDistReset===2){G._gpAimDist=0;G._gpAimDistReset=0}
    if(G._gpAimDistReset===true)G._gpAimDistReset=2;
    // LT+ABXY 중 하나라도 눌려있으면 거리 증가
    const _anyAimBtn=(_ltHeld&&(_gpBtns[0]||_gpBtns[1]||_gpBtns[2]||_gpBtns[3]));
    if(_anyAimBtn){G._gpAimDist=Math.min((G._gpAimDist||0)+18,1000)}
    // 마우스 좌표를 플레이어+facing 방향×거리로 세팅
    const scx=P.x-G.cam.x+VW/2, scy=P.y-G.cam.y+VH/2;
    mouse.x=scx+Math.cos(P.facing)*(G._gpAimDist||0);
    mouse.y=scy+Math.sin(P.facing)*(G._gpAimDist||0);
    G._gpAiming=true;
  }else{
    // 비조준: 우스틱→방향+마법 자동발동 (트윈스틱)
    let rx=_gpAxes[2],ry=_gpAxes[3];
    // 아케이드스틱 등 우스틱 없는 패드: 좌스틱과 독립 움직임이 감지된 적 없으면 무시
    if(!_gpHasRStick){
      if((rx||ry)&&(rx!==_gpAxes[0]||ry!==_gpAxes[1]))_gpHasRStick=true;
      else{rx=0;ry=0}
    }
    const rMag=Math.sqrt(rx*rx+ry*ry);
    const _rsWas=!!_gpBtnsPrev['kRS'];
    if(rMag>0.2){
      P.facing=Math.atan2(ry,rx);
      G._gpAiming=true;
      if(!_rsWas)_gpInjectKey('mouse2',true); // 스틱 기울이면 마법키(우클릭) 누름
    }else{
      G._gpAiming=false;
      if(_rsWas)_gpInjectKey('mouse2',false); // 스틱 놓으면 마법키 해제
    }
    _gpBtnsPrev['kRS']=rMag>0.2;
  }

  // 좌스틱 → WASD (조준 모드가 아닐 때만 이동)
  const su=!_isAimMode&&_gpAxes[1]<-GP_DEAD,sd=!_isAimMode&&_gpAxes[1]>GP_DEAD,sl=!_isAimMode&&_gpAxes[0]<-GP_DEAD,sr=!_isAimMode&&_gpAxes[0]>GP_DEAD;
  const _stickMap=[['sU','KeyW',su],['sD','KeyS',sd],['sL','KeyA',sl],['sR','KeyD',sr]];
  for(let _si=0;_si<4;_si++){
    const[pk,kc,on]=_stickMap[_si];
    const was=!!_gpBtnsPrev[pk];
    if(on&&!was){K[kc]=true;const ev=new KeyboardEvent('keydown',{code:kc,key:kc,bubbles:true});ev._fromGp=true;document.dispatchEvent(ev)}
    if(!on&&was){K[kc]=false;const ev=new KeyboardEvent('keyup',{code:kc,key:kc,bubbles:true});ev._fromGp=true;document.dispatchEvent(ev)}
    _gpBtnsPrev[pk]=on;
  }
}
```

`_pollGamepad` after (no-panel X snapshot addition):

```js
function _pollGamepad(){
  // 이벤트 의존 금지 — BT 재연결 시 gamepadconnected가 안 오는 경우가 있어 매 프레임 폴링으로 직접 감지 (index.html과 동일 방식)
  const gps=navigator.getGamepads();
  let _found=null;
  for(let i=0;i<gps.length;i++){if(gps[i]&&gps[i].connected){_found=gps[i];break}}
  if(_found&&!_gpConnected){_gpConnected=true;_gpVibRef=_found;console.log('[GAMEPAD] 폴링 감지:',_found.id);try{notify('🎮 패드 연결됨')}catch(e2){}}
  if(!_found){
    // 패드 사라짐 (BT 절전/블립) — 주입 키 즉시 해제, _gpActive는 유지 (재연결 시 패드모드 그대로 복귀)
    if(_gpConnected){_gpConnected=false;_gpad=null;_gpClearAll();try{notify('🎮 패드 연결 끊김')}catch(e2){}}
    return;
  }
  _gpad=_found;

  // ── 1단계: 하드웨어 상태만 읽기 ──
  let _anyInput=false;
  for(let i=0;i<_gpad.buttons.length;i++){
    const pressed=_gpad.buttons[i].pressed||_gpad.buttons[i].value>0.5;
    _gpBtns[i]=pressed;
    if(pressed)_anyInput=true;
  }
  _gpAxes[0]=Math.abs(_gpad.axes[0])<GP_DEAD?0:_gpad.axes[0];
  _gpAxes[1]=Math.abs(_gpad.axes[1])<GP_DEAD?0:_gpad.axes[1];
  if(_gpad.axes.length>=4){
    _gpAxes[2]=Math.abs(_gpad.axes[2])<GP_DEAD?0:_gpad.axes[2];
    _gpAxes[3]=Math.abs(_gpad.axes[3])<GP_DEAD?0:_gpad.axes[3];
  }
  // D-pad를 axes[6/7]로 전달하는 패드 (Firefox 표준, 일부 컨트롤러)
  if(_gpad.axes.length>=8){
    _gpAxes[6]=Math.abs(_gpad.axes[6])<0.5?0:_gpad.axes[6];
    _gpAxes[7]=Math.abs(_gpad.axes[7])<0.5?0:_gpad.axes[7];
  }
  if(_gpAxes[0]||_gpAxes[1]||_gpAxes[2]||_gpAxes[3])_anyInput=true;
  // 부스: 패드 입력(버튼 눌림 or GP_DEAD=0.25 초과 스틱)도 유휴 리셋 — 폴링 경로라 여기서 처리(키보드/마우스와 동일 변수 _boothIdle, 어트랙트 오전환 방지)
  if(_anyInput&&_BOOTH_MODE)_boothIdle=0;

  // ── 2단계: 입력 감지 → 패드모드 활성화 (드리프트/아날로그 잔압 무시 — 조이스틱 팬텀 자동전환 방지) ──
  // 자동전환은 "의도적 입력"만 인정: 디지털 버튼 실제 press 또는 스틱 0.5 이상 큰 편향. (idle 스틱 드리프트/트리거 잔압으로 패드모드 켜지지 않게)
  let _gpDeliberate=false;
  for(let _di=0;_di<_gpad.buttons.length;_di++){if(_gpad.buttons[_di]&&_gpad.buttons[_di].pressed){_gpDeliberate=true;break}}
  if(!_gpDeliberate&&(Math.abs(_gpAxes[0])>0.5||Math.abs(_gpAxes[1])>0.5||Math.abs(_gpAxes[2])>0.5||Math.abs(_gpAxes[3])>0.5))_gpDeliberate=true;
  if(_gpDeliberate&&!_gpActive){_gpActive=true;document.body.style.cursor='none';C.style.cursor='none';}

  // ── 3단계: 패드모드 아니면 K[]/MB[] 절대 안 건드림 ──
  if(!_gpActive)return;
  // [팬텀차단] 패드모드 재진입 첫 폴링: 이미 눌려있는(드리프트) 버튼을 prev에 스냅샷 → rising-edge 오인주입(ShiftLeft stuck) 방지
  if(!_gpSynced){for(let _si=0;_si<_gpad.buttons.length;_si++)_gpBtnsPrev['k'+_si]=!!_gpBtns[_si];_gpSynced=true;}

  // ── 3a단계: 컷씬 진행 중이면 A=advance, B=skip홀드, Start=즉시스킵 ──
  if(typeof _cutsceneState!=='undefined'&&_cutsceneState==='INTRO_CUTSCENE'){
    const _cA=!!_gpBtns[0],_cB=!!_gpBtns[1],_cSt=!!_gpBtns[9];
    if(_cA&&!_gpBtnsPrev['_cutA'])_cutsceneAdvance();
    if(_cB)_cutSkipHolding=true; else if(_gpBtnsPrev['_cutB'])_cutSkipHolding=false;
    if(_cSt&&!_gpBtnsPrev['_cutSt'])_cutsceneEnd();
    _gpBtnsPrev['_cutA']=_cA;_gpBtnsPrev['_cutB']=_cB;_gpBtnsPrev['_cutSt']=_cSt;
    return;
  }

  // 통합 인트로는 자체 A/Start 입력을 사용한다. 설정창/전투 입력 누출 차단.
  if(G&&G._intro){_gpClearAll();_gpBtnsPrev['_noUI9']=!!_gpBtns[9];return;}

  // ── D-pad 패널 토글 (패널 닫혀있을 때만 — 열려있으면 네비게이션 전용) ──
  {const _DP=[[12,'skillPanel','toggle'],[13,'forge','forge'],[14,'statPanel','toggle'],[15,'invPanel','storage']];
  const _anyPanelOpen=!!document.querySelector('.panel.on');
  for(const[bi,pid,act] of _DP){
    const _on=!!(_gpad.buttons[bi]&&_gpad.buttons[bi].pressed);
    if(_on&&!_gpBtnsPrev['_dpg'+bi]&&!_anyPanelOpen){
      if(G&&G.on){
        if(act==='toggle')togglePanel(pid);
        else if(act==='forge'){if(G.forgeOpen){closePanel('forge');G.forgeOpen=false}else openPanel('forge')}
        else if(act==='storage')openInventoryStorage()
      }
    }
    _gpBtnsPrev['_dpg'+bi]=_on;
  }}

  // ── Start(b9) → 설정창 열기 (패널 없을 때만, 3.5단계 이전 — 오버레이에 막히지 않게) ──
  {const _sn=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);
  if(_sn&&!_gpBtnsPrev['_noUI9']&&!document.querySelector('.panel.on')&&!(_gcEl&&_gcEl.classList.contains('on')))openPanel('settings');
  _gpBtnsPrev['_noUI9']=_sn;}

  // ── 3.5단계: UI 패널/오버레이 열려있으면 게임 입력 차단 + UI 네비게이션 ──
  if(_gcEl&&_gcEl.classList.contains("on")){_gpClearAll();_gpVCUpdate();_gpUINav(_gcEl);return;}
  const _gpOpenPanel=document.querySelector('.panel.on');
  const _gpOverlay=(()=>{
    for(const id of['introDiff','introKeys','deathReplay','death','lvUpScreen','tutorial','stageClear','victory','stageTransition']){
      const el=$(id);if(!el)continue;
      if(el.classList.contains('on'))return el;
      if(el.style.opacity==='1'&&el.style.pointerEvents==='all')return el;
    }
    return null;
  })();
  if(_gpOpenPanel||_gpOverlay){
    _gpClearAll();
    _gpVCUpdate(); // 좌스틱 → 가상 커서
    // Back(b8) → 뒤로가기 (서브팝업 → 패널 순 닫기)
    const _backNow=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);
    if(_backNow&&!_gpBtnsPrev['_back8']){
      _gpBtnsPrev['_back8']=true;
      const _gc=$('gcModal');const _sk=$('skSlotPop');const _cr=$('crBagPop');
      if(_gc&&_gc.classList.contains('on')){const _cb=$('gcCancel');if(_cb)_cb.click();}
      else if(_cr&&_cr.style.display==='flex'){closeCrystalPicker();}
      else if(_sk&&_sk.style.display==='flex'){_closeSkPop();}
      else{closeAllPanels();}
      return;
    }
    _gpBtnsPrev['_back8']=_backNow;
    // crBagPop 열려있으면 결정 주머니 전용 nav 우선
    const _crPop=$('crBagPop');
    if(_crPop&&_crPop.style.display==='flex'){_gpCrBagNav();return;}
    if(_gpOpenPanel&&_gpOpenPanel.id==='invPanel'){_gpInvNav()}
    else{_gpUINav(_gpOpenPanel||_gpOverlay)}
    return;
  }
  _gpVCHide(); // 패널 닫히면 커서 숨김
  _gpUIPrev.x=!!_gpBtns[2];
  // UI 닫힌 후 outline 잔류 제거
  if(_gpUIIdx>0||_gpInvIdx>0||_gpInvEqIdx>0){
    document.querySelectorAll('[style*="outline"]').forEach(el=>{if(el.style.outline){el.style.outline='';el.style.outlineOffset=''}});
    _gpUIIdx=0;_gpInvIdx=0;_gpInvEqIdx=0;_gpInvMode='bag';
  }

  // ── 4단계: 버튼 → 키 주입 ──
  // 조준 모드 판정 — LT 콤보보다 먼저 (조준 중 재발동 차단)
  const _isAimMode=P&&(P._mmAiming||P._bwAiming||P._tsAiming||P._msAiming||P._isAiming||P._hrAiming);

  // LT(6) = 모디파이어(홀드+ABXY=1234) / 탭(단독 뗄 때)=KeyF
  const _ltVal=_gpad.buttons[6]&&_gpad.buttons[6].value||0;
  const _ltHeld=_ltVal>0.7;
  const _ltWasHeld=!!_gpBtnsPrev['kLT_held'];
  const _LT_COMBO={0:'Digit1',1:'Digit2',3:'Digit3',2:'Digit4'}; // A=1,B=2,Y=3,X=4

  // LT 모디파이어 사용 여부 추적
  if(_ltHeld&&!_ltWasHeld)_gpBtnsPrev['kLT_mod']=false;
  let _ltUsedAsModifier=!!_gpBtnsPrev['kLT_mod'];

  if(_ltHeld){
    for(const bi in _LT_COMBO){
      const idx=+bi;
      const comboKey=_LT_COMBO[bi];
      const pressed=!!_gpBtns[idx];
      const prevKey='kLT'+idx;
      if(_isAimMode){
        // 조준 중 버튼 릴리즈 → 발사
        if(!pressed&&_gpBtnsPrev[prevKey]){MBjust[0]=true;G._gpAimDistReset=true;console.log('[GP-AIM] btn'+idx+' release → FIRE at dist='+G._gpAimDist+' mouse='+~~mouse.x+','+~~mouse.y)}
        _gpBtnsPrev[prevKey]=pressed;continue;
      }
      if(pressed&&!_gpBtnsPrev[prevKey]){
        _gpInjectKey(comboKey,true);_ltUsedAsModifier=true;_gpBtnsPrev['kLT_mod']=true;
      }
      if(!pressed&&_gpBtnsPrev[prevKey]){
        _gpInjectKey(comboKey,false);
      }
      _gpBtnsPrev[prevKey]=pressed;
    }
  } else {
    // LT 뗐을 때
    for(const bi in _LT_COMBO){
      const prevKey='kLT'+(+bi);
      if(_gpBtnsPrev[prevKey]){_gpInjectKey(_LT_COMBO[bi],false);_gpBtnsPrev[prevKey]=false}
    }
    if(_ltWasHeld&&_isAimMode){
      // 조준 중 LT 떼기 → 발사 (좌클릭) + 거리 리셋
      MBjust[0]=true;G._gpAimDistReset=true;
    } else if(_ltWasHeld&&!_gpBtnsPrev['kLT_mod']){
      // 모디파이어 안 쓰였으면 → KeyF 탭
      _gpInjectKey('KeyF',true);
      setTimeout(()=>_gpInjectKey('KeyF',false),100);
    }
  }
  _gpBtnsPrev['kLT_held']=_ltHeld;

  // 나머지 버튼 주입
  const _gpModFirst=[4,5,0,1,2,3,9,10,11]; // D-pad(12~15), Back(8) 제외 — Back은 전용 처리
  for(let _mi=0;_mi<_gpModFirst.length;_mi++){
    const idx=_gpModFirst[_mi];
    const kc=_GP_KEY[idx];
    if(!kc)continue;
    // LT 홀드 중 ABXY(0~3)는 콤보로 처리 → 원래 키 차단
    if(_ltHeld&&idx>=0&&idx<=3){
      if(_gpBtnsPrev['k'+idx])_gpInjectKey(kc,false);
      _gpBtnsPrev['k'+idx]=false;
      continue;
    }
    const pressed=!!_gpBtns[idx];
    const wasPrev=!!_gpBtnsPrev['k'+idx];
    if(pressed&&!wasPrev){
      if(idx===3&&G.on&&!G.paused){
        if(P._gwActive){_finishGhostWalk();_gpBtnsPrev['k'+idx]=pressed;continue}
        if(P._ioActive){activateIceShatter();_gpBtnsPrev['k'+idx]=pressed;continue}
      }
      _gpInjectKey(kc,true);
    }
    if(!pressed&&wasPrev)_gpInjectKey(kc,false);
    _gpBtnsPrev['k'+idx]=pressed;
  }

  // [release-sync] 게임패드 주입 키의 falling-edge 유실 방지 — 엣지 아닌 '현재 레벨'로 강제 해제만 (누르기는 위 엣지 로직 유지)
  for(var _ic in _gpInjHeld){
    if(!_gpInjHeld[_ic])continue;
    var _bi=_GP_KEYIDX[_ic];
    if(_bi===undefined)continue;
    if(!_gpBtns[_bi]){ _gpInjectKey(_ic,false); }
  }

  // RT→Z(필살기), LT+RT→X(처형)
  const rt=_gpad.buttons[7]&&_gpad.buttons[7].value>0.7;
  const ltrt=_ltHeld&&rt;
  if(ltrt&&!_gpBtnsPrev['kLTRT']){
    _gpInjectKey('KeyX',true);
    if(_gpBtnsPrev['kRT']){_gpInjectKey('KeyZ',false);_gpBtnsPrev['kRT']=false}
  }
  if(!ltrt&&_gpBtnsPrev['kLTRT']){_gpInjectKey('KeyX',false)}
  _gpBtnsPrev['kLTRT']=ltrt;
  if(!ltrt){
    if(rt&&!_gpBtnsPrev['kRT'])_gpInjectKey('KeyZ',true);
    if(!rt&&_gpBtnsPrev['kRT'])_gpInjectKey('KeyZ',false);
  }
  _gpBtnsPrev['kRT']=rt&&!ltrt;

  // 조준 모드: 포격식 (LT+버튼 홀드→거리증가, 스틱→방향, 릴리즈→발사)
  if(_isAimMode){
    // 스틱 방향 감지
    const ax=_gpAxes[0],ay=_gpAxes[1];
    const rx=_gpAxes[2],ry=_gpAxes[3];
    const lMag=Math.sqrt(ax*ax+ay*ay);
    const rMag=Math.sqrt(rx*rx+ry*ry);
    const useR=rMag>lMag;
    const sx2=useR?rx:ax, sy2=useR?ry:ay, mag=useR?rMag:lMag;
    if(mag>0.15){
      const _ang=Math.atan2(sy2,sx2);
      const _snap=Math.round(_ang/(Math.PI/4))*(Math.PI/4);
      P.facing=_snap;
    }
    // 포격 거리: LT+버튼 홀드 중 자동 증가 (0→1000)
    if(!G._gpAimDist)G._gpAimDist=0;
    // 지연 리셋: 발사 프레임에서는 좌표 유지, 다음 프레임에 리셋
    if(G._gpAimDistReset===2){G._gpAimDist=0;G._gpAimDistReset=0}
    if(G._gpAimDistReset===true)G._gpAimDistReset=2;
    // LT+ABXY 중 하나라도 눌려있으면 거리 증가
    const _anyAimBtn=(_ltHeld&&(_gpBtns[0]||_gpBtns[1]||_gpBtns[2]||_gpBtns[3]));
    if(_anyAimBtn){G._gpAimDist=Math.min((G._gpAimDist||0)+18,1000)}
    // 마우스 좌표를 플레이어+facing 방향×거리로 세팅
    const scx=P.x-G.cam.x+VW/2, scy=P.y-G.cam.y+VH/2;
    mouse.x=scx+Math.cos(P.facing)*(G._gpAimDist||0);
    mouse.y=scy+Math.sin(P.facing)*(G._gpAimDist||0);
    G._gpAiming=true;
  }else{
    // 비조준: 우스틱→방향+마법 자동발동 (트윈스틱)
    let rx=_gpAxes[2],ry=_gpAxes[3];
    // 아케이드스틱 등 우스틱 없는 패드: 좌스틱과 독립 움직임이 감지된 적 없으면 무시
    if(!_gpHasRStick){
      if((rx||ry)&&(rx!==_gpAxes[0]||ry!==_gpAxes[1]))_gpHasRStick=true;
      else{rx=0;ry=0}
    }
    const rMag=Math.sqrt(rx*rx+ry*ry);
    const _rsWas=!!_gpBtnsPrev['kRS'];
    if(rMag>0.2){
      P.facing=Math.atan2(ry,rx);
      G._gpAiming=true;
      if(!_rsWas)_gpInjectKey('mouse2',true); // 스틱 기울이면 마법키(우클릭) 누름
    }else{
      G._gpAiming=false;
      if(_rsWas)_gpInjectKey('mouse2',false); // 스틱 놓으면 마법키 해제
    }
    _gpBtnsPrev['kRS']=rMag>0.2;
  }

  // 좌스틱 → WASD (조준 모드가 아닐 때만 이동)
  const su=!_isAimMode&&_gpAxes[1]<-GP_DEAD,sd=!_isAimMode&&_gpAxes[1]>GP_DEAD,sl=!_isAimMode&&_gpAxes[0]<-GP_DEAD,sr=!_isAimMode&&_gpAxes[0]>GP_DEAD;
  const _stickMap=[['sU','KeyW',su],['sD','KeyS',sd],['sL','KeyA',sl],['sR','KeyD',sr]];
  for(let _si=0;_si<4;_si++){
    const[pk,kc,on]=_stickMap[_si];
    const was=!!_gpBtnsPrev[pk];
    if(on&&!was){K[kc]=true;const ev=new KeyboardEvent('keydown',{code:kc,key:kc,bubbles:true});ev._fromGp=true;document.dispatchEvent(ev)}
    if(!on&&was){K[kc]=false;const ev=new KeyboardEvent('keyup',{code:kc,key:kc,bubbles:true});ev._fromGp=true;document.dispatchEvent(ev)}
    _gpBtnsPrev[pk]=on;
  }
}
```

## docs 정본 인계 — 공유 문서 미적용

정본 `docs/3.3 키바인딩+설정/게임패드_매핑표.md`에 스킬 패널 X=선택된 expanded card minus/cancel button의 rising edge, `_gpUINav` UI snapshot 및 `_pollGamepad` no-panel snapshot 위치를 표로 추가. `docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md`에는 UI 입력만 수정하고 기존 환불/스킬/비용 값 그대로인 계약을 연결. 기존 `3.3 키바인딩+설정.md:85` X=KeyE 및 `게임패드_트러블슈팅.md:75` 키 주입 계약은 그대로 보존하고 후속 edge lifetime 절 링크만 추가. 보호 2_3 수정 금지.

```json
{
  "supersedes": "gpSkillXHold snapshot-only candidate is insufficient for reopen lifetime",
  "canonical": "docs/3.3 키바인딩+설정/게임패드_매핑표.md",
  "addTable": [
    [
      "UI snapshot",
      "_gpUINav normal path _gpUIPrev.x=x"
    ],
    [
      "gameplay snapshot",
      "_pollGamepad no-panel path after _gpVCHide _gpUIPrev.x=!!_gpBtns[2]"
    ],
    [
      "intent",
      "hold action once; release outside panel resets previous X; new press after reopening works"
    ],
    [
      "validation",
      "combined hold3/release/repress + actual close/release gameplay/open/new press: source5 snapshot-only2 complete3; no-X control same"
    ],
    [
      "limits",
      "full function source, explicit DOM/pad/actions/render/noUI mappings empty; native/game skill data not accepted"
    ]
  ]
}
```

최종 source 함수 후보는 앞선 complete patch와 동일하고 wiring 하니스만 강화했다. 코드 작업 뒤 docs 전체 실제 rg 검색을 아래 원 영수증에 보존한다. source/fixture PASS를 native/실게임 PASS로 확대하지 않는다.

## 저장 정책 / 실행 영수증

정확 capacity note `tmp/mac-migration-runtime/supervisor-20261002/CAPACITY-rolling-after-0d918990-1326-UIUX.json` SHA256=676f02d4fe9eb26e33800e428412bd0b6a4550c39aac6eaef6a737fa4707181d, actualChanges64, rootReserve14, newOwnedFileCredits2. 이 폴더 checks.mjs/result.md 두 파일만 새로 생성한다. 기존 산출/TASK 불변. 원 실행 cwd=/Users/fordeargamers/Projects/exoduser-migration-20261001. 저장 checks는 import 경로만 소유 폴더 깊이에 맞추고 주석을 추가했다. SHA는 최종 저장 영수증에서 제공하며 본 보고 생성 후 자신의 해시를 삽입하지 않는다.

### complete-X memory script (executed verbatim)

```text
import fs from 'node:fs';import crypto from 'node:crypto';import vm from 'node:vm';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {createDocument} from './tools/team-followup-20261001/UIUX/inventory-dom/node-dom.mjs';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),{parse}=createRequire(process.cwd()+'/package.json')('acorn'),startedUTC=new Date().toISOString(),results=[];
for(const file of ['game.html','game-easy-test.html']){
 const source=fs.readFileSync(file,'utf8'),f=new Map();let tabs;const gpDeclarations=[];
 for(const m of source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)){const tag=m[0].slice(0,m[0].indexOf('>'));if(/type=["']importmap["']/.test(tag))continue;for(const n of parse(m[1],{ecmaVersion:'latest',sourceType:/type=["']module["']/.test(tag)?'module':'script'}).body){if(n.type==='FunctionDeclaration')f.set(n.id.name,m[1].slice(n.start,n.end));if(n.type==='VariableDeclaration'&&n.declarations.some(d=>d.id.name==='_PANEL_TABS'))tabs=m[1].slice(n.start,n.end);if(n.type==='VariableDeclaration'&&n.declarations.some(d=>['_GP_KEY_DEFAULT','_GP_KEY','_GP_KEYIDX','_gpInjHeld'].includes(d.id.name)))gpDeclarations.push(m[1].slice(n.start,n.end));}}
 const original=f.get('_gpUINav'),poll=f.get('_pollGamepad');
 const anchor="  _gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.y=y;\n\n  // ── 우측 스틱:";
 assert.equal(original.split(anchor).length,2);const candidate=original.replace(anchor,"  _gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.y=y;_gpUIPrev.x=x;\n\n  // ── 우측 스틱:");
 const pollAnchor='  _gpVCHide(); // 패널 닫히면 커서 숨김';assert.equal(poll.split(pollAnchor).length,2);const pollCandidate=poll.replace(pollAnchor,pollAnchor+'\n  _gpUIPrev.x=!!_gpBtns[2];');
 function run(mode,rangeRoute){
  const document=createDocument(),panel=document.createElement('div');panel.id='skillPanel';panel.className='panel on';document.body.append(panel);for(const id of ['settings','invPanel','forge','statPanel']){const p=document.createElement('div');p.id=id;p.className='panel';const box=document.createElement('div');box.className='pbox';p.append(box);document.body.append(p);}const box=document.createElement('div');box.className='pbox';panel.append(box);
  const range=document.createElement('div');range.dataset.skId='fixture-skill';range.offsetParent=panel;panel.append(range);const minus=document.createElement('button');range.append(minus);
  const trace=[];range.querySelector=s=>s.includes('border:1px solid #cc4444')?minus:null;minus.click=()=>trace.push({type:'minusAction'});range.scrollIntoView=()=>trace.push({type:'scroll'});
  const panelQuery=panel.querySelectorAll.bind(panel);panel.querySelectorAll=selector=>selector.includes('button:not')?[range]:panelQuery(selector);document.querySelector=selector=>selector==='.panel.on'&&panel.classList.contains('on')?panel:null;document.elementFromPoint=()=>range;document.querySelectorAll=()=>[];
  const pad={connected:true,id:'fixture',buttons:Array.from({length:16},()=>({pressed:false,value:0})),axes:Array(8).fill(0)};
  const prev={a:false,b:false,x:false,y:false,lb:false,rb:false,b8:false,b9:false};
  let now=1000;
  document.dispatchEvent=e=>trace.push({type:e.type,code:e.code,fromGp:e._fromGp});const ctx=vm.createContext({MB:[],MBjust:[],KeyboardEvent:class{constructor(type,options){this.type=type;Object.assign(this,options);}},_gpInvIdx:0,_gpInvEqIdx:0,_gpInvMode:'bag',_gpHasRStick:false,P:{},_GP_KEY:{},_GP_KEYIDX:{},_gpInjHeld:{},K:{},_T:s=>s,renderSkillPanel:()=>trace.push({type:'renderSkill'}),document,navigator:{getGamepads:()=>[pad]},$:id=>document.getElementById(id),G:{on:true,paused:true},C:{style:{}},GP_DEAD:.25,_gpConnected:true,_gpActive:true,_gpSynced:true,_gpad:pad,_gpBtns:[],_gpAxes:Array(8).fill(0),_gpBtnsPrev:{},_gpUIPrev:prev,_gpVC:{vis:false,x:10,y:20},_gcEl:null,_BOOTH_MODE:false,_gpUIIdx:0,_gpRSScrolled:false,_gpUIRepeatDir:null,_gpUIRepeatTs:0,_GP_UI_DELAY:380,_GP_UI_INTERVAL:110,listeningBind:null,_gpClearAll:()=>trace.push({type:'clearGameInput'}),_gpVCUpdate:()=>trace.push({type:'cursorUpdate'}),_gpVCHide:()=>trace.push({type:'hideCursor'}),_gpUIStep:()=>{},_gpVibrate:()=>{},Event:class{constructor(type){this.type=type;}},performance:{now:()=>now}});
  vm.runInContext('let _skPopOwnsPause=false,_fuseSelId=null,_skExpandedId=null;\n'+tabs+'\n'+gpDeclarations.join('\n')+'\n'+['_gpInjectKey','_gpClearAll','_rebuildGpKeyIdx','openPanel','closeAllPanels','_injectPanelNav'].map(n=>f.get(n)).join('\n')+'\n'+(mode==='source'?original:candidate)+'\n'+(mode==='complete'?pollCandidate:poll)+'\n_rebuildGpKeyIdx();',ctx);
  for(const pressed of [true,true,true,false,true]){pad.buttons[2].pressed=rangeRoute&&pressed;ctx._pollGamepad();}ctx.closeAllPanels();assert.equal(panel.classList.contains('on'),false);if(!rangeRoute){pad.buttons[2].pressed=false;ctx._pollGamepad();pad.buttons[2].pressed=true;ctx._pollGamepad();}pad.buttons[2].pressed=false;ctx._pollGamepad();const releasedPreviousX=prev.x;ctx.openPanel('skillPanel');assert.equal(panel.querySelector('.panel-nav').children.length,5);pad.buttons[2].pressed=rangeRoute;ctx._pollGamepad();
  return {mode,rangeRoute,trace,minusActions:trace.filter(x=>x.type==='minusAction').length,releasedPreviousX};
 }
 const before=run('source',true),snapshotOnly=run('snapshotOnly',true),after=run('complete',true),normalBefore=run('source',false),normalAfter=run('complete',false);
 assert.equal(before.minusActions,5);assert.equal(snapshotOnly.minusActions,2);assert.equal(after.minusActions,3);assert.equal(snapshotOnly.releasedPreviousX,true);assert.equal(after.releasedPreviousX,false);const omit=({mode,...rest})=>rest;assert.deepEqual(omit(normalBefore),omit(normalAfter));assert.equal(normalAfter.trace.filter(t=>t.type==='keydown'&&t.code==='KeyE'&&t.fromGp===true).length,1);assert.equal(normalAfter.trace.filter(t=>t.type==='keyup'&&t.code==='KeyE'&&t.fromGp===true).length,1);
 results.push({file,sourceSHA256:sha(source),pollSHA256:sha(poll),navigationSHA256:sha(original),original,candidate,pollCandidate,pollAnchor,anchor,before,snapshotOnly,after,normalBefore,normalAfter});
}
console.log(JSON.stringify({startedUTC,endedUTC:new Date().toISOString(),results,productionApplied:false,runtimeAccepted:false,newFiles:0,realFunctions:['_pollGamepad','_gpUINav'],doubles:['navigator hardware pad','DOM range/layout/selector/event','G/C/state','game-input clear/cursor update sinks','performance clock'],scope:'deeper source wiring regression: full _gpClearAll/_gpInjectKey and actual mapping declarations/rebuild; compound skill X hold/reopen edges plus no-UI X→KeyE down/up normal control equal; DOM KeyboardEvent terminal sink'}));

```

### complete-X full wiring first failure raw stdout

```text
node:internal/modules/run_main:107
    triggerUncaughtException(
    ^

AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

0 !== 1

    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:24:305
    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async node:internal/modules/esm/loader:246:26
    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5) {
  generatedMessage: true,
  code: 'ERR_ASSERTION',
  actual: 0,
  expected: 1,
  operator: 'strictEqual',
  diff: 'simple'
}

Node.js v24.15.0

```

### full wiring first failure explanation

```text
{
  "run": {
    "chunk_id": "872cc3",
    "wall_time_seconds": 0.073732584,
    "exit_code": 1,
    "original_token_count": 189,
    "output": "node:internal/modules/run_main:107\n    triggerUncaughtException(\n    ^\n\nAssertionError [ERR_ASSERTION]: Expected values to be strictly equal:\n\n0 !== 1\n\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:24:305\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\n    at async node:internal/modules/esm/loader:246:26\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5) {\n  generatedMessage: true,\n  code: 'ERR_ASSERTION',\n  actual: 0,\n  expected: 1,\n  operator: 'strictEqual',\n  diff: 'simple'\n}\n\nNode.js v24.15.0\n"
  },
  "reason": "Normal control pressed X in first gameplay poll while actual _gpClearAll sets _gpSynced=false. Existing intentional first-entry held-button snapshot suppresses this. Correct neutral gameplay sync then fresh press; not production failure."
}
```

### complete-X corrected original raw stdout

```text
{"startedUTC":"2026-10-02T13:21:59.265Z","endedUTC":"2026-10-02T13:21:59.579Z","results":[{"file":"game.html","sourceSHA256":"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613","pollSHA256":"00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d","navigationSHA256":"3089e0aaac89e10c59769ffc246230eb04abeefabaf56e9e21a2ac7865047796","original":"function _gpUINav(panel){\n  if(!_gpad||!panel)return;\n  // skSlotPop 열려있으면 그걸 패널로 전환 (skillPanel 밖에 있어서 querySelectorAll 미탐지)\n  const _spop=$('skSlotPop');\n  if(_spop&&_spop.style.display==='flex')panel=_spop;\n  // 패널 내 포커스 가능 요소 수집\n  const SEL='button:not([disabled]),.pclose,[onclick],.sk-opt:not(.locked),.up-row:not(.dis),.stat-btn:not(.dis),.passive-row:not(.dis),.fg-i:not(.dis),.fg-tab,.set-key,.id-btn,.retry,input[type=\"range\"],input[type=\"checkbox\"],select,[data-sk-id],.inv-filter-btn,.inv-eq-item,.inv-eq-slot,.inv-item,.inv-cr-item,.inv-cell,.inv-dep-item,.inv-exp-btn,.sk-pop-tab,.gc-btn,.inv-storage-toggle,.cmp-close,label[style*=\"cursor:pointer\"],a[href],[style*=\"cursor:pointer\"]';\n  const items=[];\n  const all=panel.querySelectorAll(SEL);\n  for(let i=0;i<all.length;i++){\n    const el=all[i];\n    if(el.offsetParent===null)continue;\n    // [data-sk-id] 자식 중복 방지: 스킬카드 안의 자식은 카드 자체만 잡음\n    if(!el.dataset.skId&&el.closest('[data-sk-id]'))continue;\n    items.push(el);\n  }\n  if(!items.length)return;\n  if(_gpUIIdx>=items.length)_gpUIIdx=0;\n\n  // D-pad(버튼12-15) + axes[6/7](일부 패드 D-pad) → 한 칸 이동 (좌스틱은 가상커서 전용)\n  const _dU=(_gpad.buttons[12]&&_gpad.buttons[12].pressed)||_gpAxes[7]<-0.5;\n  const _dD=(_gpad.buttons[13]&&_gpad.buttons[13].pressed)||_gpAxes[7]>0.5;\n  const _dL=(_gpad.buttons[14]&&_gpad.buttons[14].pressed)||_gpAxes[6]<-0.5;\n  const _dR=(_gpad.buttons[15]&&_gpad.buttons[15].pressed)||_gpAxes[6]>0.5;\n  const u=_dU,d=_dD,l=_dL,r=_dR;\n  // 가상 커서 모드 + 좌우 D-pad: 커서 아래 range 슬라이더 값 조절\n  if(_gpVC.vis&&(l||r)){\n    const _vcHover=document.elementFromPoint(_gpVC.x,_gpVC.y);\n    const _vcRng=_vcHover&&(_vcHover.tagName==='INPUT'&&_vcHover.type==='range'?_vcHover:_vcHover.closest?.('.set-range-row')?.querySelector('input[type=\"range\"]'));\n    if(_vcRng){\n      const _nowTs2=performance.now();const _dir2=l?'l':'r';\n      if(_dir2!==_gpUIRepeatDir){_gpUIRepeatDir=_dir2;_gpUIRepeatTs=_nowTs2+_GP_UI_DELAY;\n        const _s2=+((_vcRng.step)||1);_vcRng.value=l?Math.max(+_vcRng.min,+_vcRng.value-_s2):Math.min(+_vcRng.max,+_vcRng.value+_s2);_vcRng.dispatchEvent(new Event('input'));\n      }else if(_nowTs2>=_gpUIRepeatTs){_gpUIRepeatTs=_nowTs2+_GP_UI_INTERVAL;\n        const _s2=+((_vcRng.step)||1);_vcRng.value=l?Math.max(+_vcRng.min,+_vcRng.value-_s2):Math.min(+_vcRng.max,+_vcRng.value+_s2);_vcRng.dispatchEvent(new Event('input'));\n      }\n      _gpUIPrev.u=u;_gpUIPrev.d=d;_gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;return;\n    }\n  }\n  if(u||d||l||r)_gpVCHide(); // D-pad 누르면 커서 숨기고 선택 모드\n  // 우측 스틱 → 스크롤 (휠 역할) — 원시값 사용 (데드존 없이 0.15 임계)\n  const rsYVal=_gpad.axes.length>=4?_gpad.axes[3]:0;\n  const rsXVal=_gpad.axes.length>=3?_gpad.axes[2]:0;\n  const a=_gpad.buttons[0]&&_gpad.buttons[0].pressed;\n  const b=_gpad.buttons[1]&&_gpad.buttons[1].pressed;\n  const lb=_gpad.buttons[4]&&_gpad.buttons[4].pressed;\n  const rb=_gpad.buttons[5]&&_gpad.buttons[5].pressed;\n\n  // 좌스틱/D-pad: 한 칸 이동 — repeat 타이머\n  const _nowDir=u?'u':d?'d':l?'l':r?'r':null;\n  const _nowTs=performance.now();\n  let _didMove=false;\n  if(_nowDir){\n    if(_nowDir!==_gpUIRepeatDir){\n      _gpUIRepeatDir=_nowDir;_gpUIRepeatTs=_nowTs+_GP_UI_DELAY;\n      _gpUIStep(_nowDir,items);_didMove=true;\n    } else if(_nowTs>=_gpUIRepeatTs){\n      _gpUIRepeatTs=_nowTs+_GP_UI_INTERVAL;\n      _gpUIStep(_nowDir,items);_didMove=true;\n    }\n  } else {\n    _gpUIRepeatDir=null;\n  }\n  if(_didMove){_gpVibrate(2,40);_gpRSScrolled=false;}\n\n  const cur=items[_gpUIIdx];\n\n  // LB/RB: 탭 전환\n  if((lb&&!_gpUIPrev.lb)||(rb&&!_gpUIPrev.rb)){\n    if(panel.id==='skillPanel'&&typeof SKILL_HIER!=='undefined'){\n      // 스킬패널 전용: SKILL_HIER 순환\n      let _ci=SKILL_HIER.findIndex(h=>h.id===_skHierTab);if(_ci<0)_ci=0;\n      if(rb&&!_gpUIPrev.rb)_ci=Math.min(SKILL_HIER.length-1,_ci+1);\n      if(lb&&!_gpUIPrev.lb)_ci=Math.max(0,_ci-1);\n      _skHierTab=SKILL_HIER[_ci].id;\n      if(typeof renderSkillPanel==='function')renderSkillPanel();\n    } else {\n      const tabs=panel.querySelectorAll('.fg-tab');\n      if(tabs.length>1){\n        // 탭 있음 → 탭 전환\n        let ti=-1;tabs.forEach((t,i)=>{if(t.classList.contains('act'))ti=i});\n        if(ti<0)ti=0;\n        if(rb&&!_gpUIPrev.rb)ti=Math.min(tabs.length-1,ti+1);\n        if(lb&&!_gpUIPrev.lb)ti=Math.max(0,ti-1);\n        if(tabs[ti])tabs[ti].click();\n      } else {\n        // 탭 없음 → 섹션(단락) 이동\n        const _lc=items[_gpUIIdx];\n        const _lt=_lc?_gpSectType(_lc):'';\n        if(rb&&!_gpUIPrev.rb){\n          let ni=_gpUIIdx;\n          for(let i=_gpUIIdx+1;i<items.length;i++){if(_gpSectType(items[i])!==_lt){ni=i;break;}}\n          _gpUIIdx=ni;\n        }\n        if(lb&&!_gpUIPrev.lb){\n          let ni=_gpUIIdx,pt='';\n          for(let i=_gpUIIdx-1;i>=0;i--){const t=_gpSectType(items[i]);if(t!==_lt){pt=t;ni=i;break;}}\n          if(pt){while(ni>0&&_gpSectType(items[ni-1])===pt)ni--;}\n          _gpUIIdx=ni;\n        }\n      }\n    }\n  }\n\n  _gpUIPrev.lb=lb;_gpUIPrev.rb=rb;\n\n  // 하이라이트 (우스틱 스크롤 후에는 D-pad 이동 전까지 scrollIntoView 억제)\n  const _rsNow=_gpad.axes.length>=4&&(Math.abs(_gpad.axes[3])>0.15||Math.abs(_gpad.axes[2])>0.15);\n  if(_rsNow)_gpRSScrolled=true;\n  for(let i=0;i<items.length;i++){\n    if(i===_gpUIIdx){\n      items[i].style.outline='2px solid #C9A961';items[i].style.outlineOffset='-1px';\n      if(!_gpRSScrolled){\n        if(items[i].scrollIntoViewIfNeeded)items[i].scrollIntoViewIfNeeded(false);\n        else items[i].scrollIntoView({block:'nearest'});\n      }\n    } else {\n      items[i].style.outline='';items[i].style.outlineOffset='';\n    }\n  }\n\n  // 키바인딩 입력 대기 중 → B=취소(ESC 주입)\n  if(listeningBind&&b&&!_gpUIPrev.b){\n    listeningBind=null;_listenAlt=false;renderSettings();\n    _gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.y=y;_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;return;\n  }\n\n  // A = 커서 위치 클릭 우선, 없으면 포커스 요소 클릭\n  if(a&&!_gpUIPrev.a){\n    if(_gpVC.vis){\n      let _vcEl=document.elementFromPoint(_gpVC.x,_gpVC.y);\n      if(_vcEl&&_vcEl.id!=='_gpVCursor'){\n        // range/select 또는 그 행 클릭 → D-pad 선택 모드로 전환하여 해당 요소 포커스\n        const _vcRange=_vcEl.tagName==='INPUT'&&_vcEl.type==='range'?_vcEl:_vcEl.closest?.('.set-range-row')?.querySelector('input[type=\"range\"]');\n        const _vcSel=!_vcRange&&(_vcEl.tagName==='SELECT'?_vcEl:_vcEl.closest?.('.set-range-row')?.querySelector('select'));\n        const _vcFocus=_vcRange||_vcSel;\n        if(_vcFocus){\n          for(let _ri=0;_ri<items.length;_ri++){if(items[_ri]===_vcFocus){_gpUIIdx=_ri;break}}\n          _gpVCHide();\n        } else {_vcEl.click()}\n        _gpBtnsPrev['k0']=true;\n      }\n    } else if(cur){\n      // 스킬카드 expanded: A → (+) 습득/강화 버튼 우선 클릭\n      if(cur.dataset&&cur.dataset.skId){\n        const _plusBtn=cur.querySelector('[style*=\"cursor:pointer\"][style*=\"border:1px solid #aa8833\"]');\n        if(_plusBtn){_plusBtn.click();_gpBtnsPrev['k0']=true;}\n        else{cur.click();_gpBtnsPrev['k0']=true;}\n      } else if(cur.tagName==='SELECT'){\n        // select: A = 다음 옵션 (네이티브 드롭다운 열지 않음 — 패드로 닫기 불가)\n        cur.selectedIndex=(cur.selectedIndex+1)%cur.options.length;cur.dispatchEvent(new Event('change'));\n        _gpBtnsPrev['k0']=true;\n      } else {cur.click();_gpBtnsPrev['k0']=true;}\n    }\n  }\n  // X = 스킬카드 expanded: (-) 레벨다운/취소 버튼\n  const x=_gpad.buttons[2]&&_gpad.buttons[2].pressed;\n  if(x&&!_gpUIPrev.x&&cur&&cur.dataset&&cur.dataset.skId&&panel.id==='skillPanel'){\n    const _minBtn=cur.querySelector('[style*=\"cursor:pointer\"][style*=\"border:1px solid #cc4444\"]');\n    if(_minBtn){_minBtn.click();_gpBtnsPrev['k2']=true;}\n  }\n  // B = 단계별 뒤로가기\n  const _start=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);\n  if((b&&!_gpUIPrev.b)){\n    _panelBack();_gpBtnsPrev['k1']=true;\n  }\n  _gpUIPrev.start=_start;\n  // Y = 스킬 패널: 선택 스킬 슬롯 배정 / 인벤: 장착·해제·꺼내기\n  const y=_gpad.buttons[3]&&_gpad.buttons[3].pressed;\n  if(y&&!_gpUIPrev.y&&cur){\n    // 스킬 패널에서 .sk-opt 위에 있으면 → 순환 배정\n    if(panel.id==='skillPanel'&&cur.classList.contains('sk-opt')){\n      const skId=cur.dataset&&cur.dataset.skId;\n      if(skId&&typeof _openSkillSlotPop==='function'){\n        // 선택 슬롯 계약: 일반=1~4, 지옥강타 계열 분노 폭발=Space, 영역=F\n        const si=_findAutoSkillSlot(skId);\n        if(si>=0){SKILL_SLOTS[si]=skId;if(typeof updateQS==='function')updateQS();if(typeof dbSaveNow==='function')dbSaveNow();const _slNm=si<4?_T('슬롯')+(si+1):si===4?'SP'+_T('슬롯'):'F'+_T('슬롯');addTxt(P.x,P.y-20,_slNm+': '+_T(cur.querySelector('.sk-opt-name')?.textContent||skId),'#ff8844',40);SFX.pickup()}\n      }\n    }\n    // 인벤토리 패널: Y = 우클릭 (장착/해제/꺼내기)\n    if(panel.id==='invPanel'){\n      if(cur.classList.contains('inv-item')||cur.classList.contains('inv-eq-item')||cur.classList.contains('inv-cell')){\n        cur.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2}));\n        _gpBtnsPrev['k3']=true;\n      }\n    }\n  }\n\n  _gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.y=y;\n\n  // ── 우측 스틱: 패널 스크롤 (가상커서 위치 → 해당 영역, 없으면 포커스 항목 기준) ──\n  if(Math.abs(rsYVal)>0.15||Math.abs(rsXVal)>0.15){\n    let _sc=null;\n    if(_gpVC.vis){_sc=_gpFindScroll(document.elementFromPoint(_gpVC.x,_gpVC.y))}\n    if(!_sc){\n      if(panel.id==='skillPanel')_sc=panel.querySelector('#skillGridWrap');\n      if(!_sc&&cur)_sc=_gpFindScroll(cur);\n    }\n    if(!_sc)_sc=_gpFindScroll(panel)||_gpFindScrollDown(panel);\n    if(_sc){_gpDoScroll(_sc,Math.abs(rsYVal)>0.15?rsYVal*18:0,Math.abs(rsXVal)>0.15?rsXVal*18:0)}\n  }\n\n  // 버튼 8(Back) = 전체 첫 항목  버튼 9(Start) = 전체 마지막 항목\n  const b8=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);\n  const b9=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);\n  if(b8&&!_gpUIPrev.b8)_gpUIIdx=0;\n  if(b9&&!_gpUIPrev.b9)_gpUIIdx=items.length-1;\n  _gpUIPrev.b8=b8;_gpUIPrev.b9=b9;\n}","candidate":"function _gpUINav(panel){\n  if(!_gpad||!panel)return;\n  // skSlotPop 열려있으면 그걸 패널로 전환 (skillPanel 밖에 있어서 querySelectorAll 미탐지)\n  const _spop=$('skSlotPop');\n  if(_spop&&_spop.style.display==='flex')panel=_spop;\n  // 패널 내 포커스 가능 요소 수집\n  const SEL='button:not([disabled]),.pclose,[onclick],.sk-opt:not(.locked),.up-row:not(.dis),.stat-btn:not(.dis),.passive-row:not(.dis),.fg-i:not(.dis),.fg-tab,.set-key,.id-btn,.retry,input[type=\"range\"],input[type=\"checkbox\"],select,[data-sk-id],.inv-filter-btn,.inv-eq-item,.inv-eq-slot,.inv-item,.inv-cr-item,.inv-cell,.inv-dep-item,.inv-exp-btn,.sk-pop-tab,.gc-btn,.inv-storage-toggle,.cmp-close,label[style*=\"cursor:pointer\"],a[href],[style*=\"cursor:pointer\"]';\n  const items=[];\n  const all=panel.querySelectorAll(SEL);\n  for(let i=0;i<all.length;i++){\n    const el=all[i];\n    if(el.offsetParent===null)continue;\n    // [data-sk-id] 자식 중복 방지: 스킬카드 안의 자식은 카드 자체만 잡음\n    if(!el.dataset.skId&&el.closest('[data-sk-id]'))continue;\n    items.push(el);\n  }\n  if(!items.length)return;\n  if(_gpUIIdx>=items.length)_gpUIIdx=0;\n\n  // D-pad(버튼12-15) + axes[6/7](일부 패드 D-pad) → 한 칸 이동 (좌스틱은 가상커서 전용)\n  const _dU=(_gpad.buttons[12]&&_gpad.buttons[12].pressed)||_gpAxes[7]<-0.5;\n  const _dD=(_gpad.buttons[13]&&_gpad.buttons[13].pressed)||_gpAxes[7]>0.5;\n  const _dL=(_gpad.buttons[14]&&_gpad.buttons[14].pressed)||_gpAxes[6]<-0.5;\n  const _dR=(_gpad.buttons[15]&&_gpad.buttons[15].pressed)||_gpAxes[6]>0.5;\n  const u=_dU,d=_dD,l=_dL,r=_dR;\n  // 가상 커서 모드 + 좌우 D-pad: 커서 아래 range 슬라이더 값 조절\n  if(_gpVC.vis&&(l||r)){\n    const _vcHover=document.elementFromPoint(_gpVC.x,_gpVC.y);\n    const _vcRng=_vcHover&&(_vcHover.tagName==='INPUT'&&_vcHover.type==='range'?_vcHover:_vcHover.closest?.('.set-range-row')?.querySelector('input[type=\"range\"]'));\n    if(_vcRng){\n      const _nowTs2=performance.now();const _dir2=l?'l':'r';\n      if(_dir2!==_gpUIRepeatDir){_gpUIRepeatDir=_dir2;_gpUIRepeatTs=_nowTs2+_GP_UI_DELAY;\n        const _s2=+((_vcRng.step)||1);_vcRng.value=l?Math.max(+_vcRng.min,+_vcRng.value-_s2):Math.min(+_vcRng.max,+_vcRng.value+_s2);_vcRng.dispatchEvent(new Event('input'));\n      }else if(_nowTs2>=_gpUIRepeatTs){_gpUIRepeatTs=_nowTs2+_GP_UI_INTERVAL;\n        const _s2=+((_vcRng.step)||1);_vcRng.value=l?Math.max(+_vcRng.min,+_vcRng.value-_s2):Math.min(+_vcRng.max,+_vcRng.value+_s2);_vcRng.dispatchEvent(new Event('input'));\n      }\n      _gpUIPrev.u=u;_gpUIPrev.d=d;_gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;return;\n    }\n  }\n  if(u||d||l||r)_gpVCHide(); // D-pad 누르면 커서 숨기고 선택 모드\n  // 우측 스틱 → 스크롤 (휠 역할) — 원시값 사용 (데드존 없이 0.15 임계)\n  const rsYVal=_gpad.axes.length>=4?_gpad.axes[3]:0;\n  const rsXVal=_gpad.axes.length>=3?_gpad.axes[2]:0;\n  const a=_gpad.buttons[0]&&_gpad.buttons[0].pressed;\n  const b=_gpad.buttons[1]&&_gpad.buttons[1].pressed;\n  const lb=_gpad.buttons[4]&&_gpad.buttons[4].pressed;\n  const rb=_gpad.buttons[5]&&_gpad.buttons[5].pressed;\n\n  // 좌스틱/D-pad: 한 칸 이동 — repeat 타이머\n  const _nowDir=u?'u':d?'d':l?'l':r?'r':null;\n  const _nowTs=performance.now();\n  let _didMove=false;\n  if(_nowDir){\n    if(_nowDir!==_gpUIRepeatDir){\n      _gpUIRepeatDir=_nowDir;_gpUIRepeatTs=_nowTs+_GP_UI_DELAY;\n      _gpUIStep(_nowDir,items);_didMove=true;\n    } else if(_nowTs>=_gpUIRepeatTs){\n      _gpUIRepeatTs=_nowTs+_GP_UI_INTERVAL;\n      _gpUIStep(_nowDir,items);_didMove=true;\n    }\n  } else {\n    _gpUIRepeatDir=null;\n  }\n  if(_didMove){_gpVibrate(2,40);_gpRSScrolled=false;}\n\n  const cur=items[_gpUIIdx];\n\n  // LB/RB: 탭 전환\n  if((lb&&!_gpUIPrev.lb)||(rb&&!_gpUIPrev.rb)){\n    if(panel.id==='skillPanel'&&typeof SKILL_HIER!=='undefined'){\n      // 스킬패널 전용: SKILL_HIER 순환\n      let _ci=SKILL_HIER.findIndex(h=>h.id===_skHierTab);if(_ci<0)_ci=0;\n      if(rb&&!_gpUIPrev.rb)_ci=Math.min(SKILL_HIER.length-1,_ci+1);\n      if(lb&&!_gpUIPrev.lb)_ci=Math.max(0,_ci-1);\n      _skHierTab=SKILL_HIER[_ci].id;\n      if(typeof renderSkillPanel==='function')renderSkillPanel();\n    } else {\n      const tabs=panel.querySelectorAll('.fg-tab');\n      if(tabs.length>1){\n        // 탭 있음 → 탭 전환\n        let ti=-1;tabs.forEach((t,i)=>{if(t.classList.contains('act'))ti=i});\n        if(ti<0)ti=0;\n        if(rb&&!_gpUIPrev.rb)ti=Math.min(tabs.length-1,ti+1);\n        if(lb&&!_gpUIPrev.lb)ti=Math.max(0,ti-1);\n        if(tabs[ti])tabs[ti].click();\n      } else {\n        // 탭 없음 → 섹션(단락) 이동\n        const _lc=items[_gpUIIdx];\n        const _lt=_lc?_gpSectType(_lc):'';\n        if(rb&&!_gpUIPrev.rb){\n          let ni=_gpUIIdx;\n          for(let i=_gpUIIdx+1;i<items.length;i++){if(_gpSectType(items[i])!==_lt){ni=i;break;}}\n          _gpUIIdx=ni;\n        }\n        if(lb&&!_gpUIPrev.lb){\n          let ni=_gpUIIdx,pt='';\n          for(let i=_gpUIIdx-1;i>=0;i--){const t=_gpSectType(items[i]);if(t!==_lt){pt=t;ni=i;break;}}\n          if(pt){while(ni>0&&_gpSectType(items[ni-1])===pt)ni--;}\n          _gpUIIdx=ni;\n        }\n      }\n    }\n  }\n\n  _gpUIPrev.lb=lb;_gpUIPrev.rb=rb;\n\n  // 하이라이트 (우스틱 스크롤 후에는 D-pad 이동 전까지 scrollIntoView 억제)\n  const _rsNow=_gpad.axes.length>=4&&(Math.abs(_gpad.axes[3])>0.15||Math.abs(_gpad.axes[2])>0.15);\n  if(_rsNow)_gpRSScrolled=true;\n  for(let i=0;i<items.length;i++){\n    if(i===_gpUIIdx){\n      items[i].style.outline='2px solid #C9A961';items[i].style.outlineOffset='-1px';\n      if(!_gpRSScrolled){\n        if(items[i].scrollIntoViewIfNeeded)items[i].scrollIntoViewIfNeeded(false);\n        else items[i].scrollIntoView({block:'nearest'});\n      }\n    } else {\n      items[i].style.outline='';items[i].style.outlineOffset='';\n    }\n  }\n\n  // 키바인딩 입력 대기 중 → B=취소(ESC 주입)\n  if(listeningBind&&b&&!_gpUIPrev.b){\n    listeningBind=null;_listenAlt=false;renderSettings();\n    _gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.y=y;_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;return;\n  }\n\n  // A = 커서 위치 클릭 우선, 없으면 포커스 요소 클릭\n  if(a&&!_gpUIPrev.a){\n    if(_gpVC.vis){\n      let _vcEl=document.elementFromPoint(_gpVC.x,_gpVC.y);\n      if(_vcEl&&_vcEl.id!=='_gpVCursor'){\n        // range/select 또는 그 행 클릭 → D-pad 선택 모드로 전환하여 해당 요소 포커스\n        const _vcRange=_vcEl.tagName==='INPUT'&&_vcEl.type==='range'?_vcEl:_vcEl.closest?.('.set-range-row')?.querySelector('input[type=\"range\"]');\n        const _vcSel=!_vcRange&&(_vcEl.tagName==='SELECT'?_vcEl:_vcEl.closest?.('.set-range-row')?.querySelector('select'));\n        const _vcFocus=_vcRange||_vcSel;\n        if(_vcFocus){\n          for(let _ri=0;_ri<items.length;_ri++){if(items[_ri]===_vcFocus){_gpUIIdx=_ri;break}}\n          _gpVCHide();\n        } else {_vcEl.click()}\n        _gpBtnsPrev['k0']=true;\n      }\n    } else if(cur){\n      // 스킬카드 expanded: A → (+) 습득/강화 버튼 우선 클릭\n      if(cur.dataset&&cur.dataset.skId){\n        const _plusBtn=cur.querySelector('[style*=\"cursor:pointer\"][style*=\"border:1px solid #aa8833\"]');\n        if(_plusBtn){_plusBtn.click();_gpBtnsPrev['k0']=true;}\n        else{cur.click();_gpBtnsPrev['k0']=true;}\n      } else if(cur.tagName==='SELECT'){\n        // select: A = 다음 옵션 (네이티브 드롭다운 열지 않음 — 패드로 닫기 불가)\n        cur.selectedIndex=(cur.selectedIndex+1)%cur.options.length;cur.dispatchEvent(new Event('change'));\n        _gpBtnsPrev['k0']=true;\n      } else {cur.click();_gpBtnsPrev['k0']=true;}\n    }\n  }\n  // X = 스킬카드 expanded: (-) 레벨다운/취소 버튼\n  const x=_gpad.buttons[2]&&_gpad.buttons[2].pressed;\n  if(x&&!_gpUIPrev.x&&cur&&cur.dataset&&cur.dataset.skId&&panel.id==='skillPanel'){\n    const _minBtn=cur.querySelector('[style*=\"cursor:pointer\"][style*=\"border:1px solid #cc4444\"]');\n    if(_minBtn){_minBtn.click();_gpBtnsPrev['k2']=true;}\n  }\n  // B = 단계별 뒤로가기\n  const _start=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);\n  if((b&&!_gpUIPrev.b)){\n    _panelBack();_gpBtnsPrev['k1']=true;\n  }\n  _gpUIPrev.start=_start;\n  // Y = 스킬 패널: 선택 스킬 슬롯 배정 / 인벤: 장착·해제·꺼내기\n  const y=_gpad.buttons[3]&&_gpad.buttons[3].pressed;\n  if(y&&!_gpUIPrev.y&&cur){\n    // 스킬 패널에서 .sk-opt 위에 있으면 → 순환 배정\n    if(panel.id==='skillPanel'&&cur.classList.contains('sk-opt')){\n      const skId=cur.dataset&&cur.dataset.skId;\n      if(skId&&typeof _openSkillSlotPop==='function'){\n        // 선택 슬롯 계약: 일반=1~4, 지옥강타 계열 분노 폭발=Space, 영역=F\n        const si=_findAutoSkillSlot(skId);\n        if(si>=0){SKILL_SLOTS[si]=skId;if(typeof updateQS==='function')updateQS();if(typeof dbSaveNow==='function')dbSaveNow();const _slNm=si<4?_T('슬롯')+(si+1):si===4?'SP'+_T('슬롯'):'F'+_T('슬롯');addTxt(P.x,P.y-20,_slNm+': '+_T(cur.querySelector('.sk-opt-name')?.textContent||skId),'#ff8844',40);SFX.pickup()}\n      }\n    }\n    // 인벤토리 패널: Y = 우클릭 (장착/해제/꺼내기)\n    if(panel.id==='invPanel'){\n      if(cur.classList.contains('inv-item')||cur.classList.contains('inv-eq-item')||cur.classList.contains('inv-cell')){\n        cur.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2}));\n        _gpBtnsPrev['k3']=true;\n      }\n    }\n  }\n\n  _gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.y=y;_gpUIPrev.x=x;\n\n  // ── 우측 스틱: 패널 스크롤 (가상커서 위치 → 해당 영역, 없으면 포커스 항목 기준) ──\n  if(Math.abs(rsYVal)>0.15||Math.abs(rsXVal)>0.15){\n    let _sc=null;\n    if(_gpVC.vis){_sc=_gpFindScroll(document.elementFromPoint(_gpVC.x,_gpVC.y))}\n    if(!_sc){\n      if(panel.id==='skillPanel')_sc=panel.querySelector('#skillGridWrap');\n      if(!_sc&&cur)_sc=_gpFindScroll(cur);\n    }\n    if(!_sc)_sc=_gpFindScroll(panel)||_gpFindScrollDown(panel);\n    if(_sc){_gpDoScroll(_sc,Math.abs(rsYVal)>0.15?rsYVal*18:0,Math.abs(rsXVal)>0.15?rsXVal*18:0)}\n  }\n\n  // 버튼 8(Back) = 전체 첫 항목  버튼 9(Start) = 전체 마지막 항목\n  const b8=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);\n  const b9=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);\n  if(b8&&!_gpUIPrev.b8)_gpUIIdx=0;\n  if(b9&&!_gpUIPrev.b9)_gpUIIdx=items.length-1;\n  _gpUIPrev.b8=b8;_gpUIPrev.b9=b9;\n}","pollCandidate":"function _pollGamepad(){\n  // 이벤트 의존 금지 — BT 재연결 시 gamepadconnected가 안 오는 경우가 있어 매 프레임 폴링으로 직접 감지 (index.html과 동일 방식)\n  const gps=navigator.getGamepads();\n  let _found=null;\n  for(let i=0;i<gps.length;i++){if(gps[i]&&gps[i].connected){_found=gps[i];break}}\n  if(_found&&!_gpConnected){_gpConnected=true;_gpVibRef=_found;console.log('[GAMEPAD] 폴링 감지:',_found.id);try{notify('🎮 패드 연결됨')}catch(e2){}}\n  if(!_found){\n    // 패드 사라짐 (BT 절전/블립) — 주입 키 즉시 해제, _gpActive는 유지 (재연결 시 패드모드 그대로 복귀)\n    if(_gpConnected){_gpConnected=false;_gpad=null;_gpClearAll();try{notify('🎮 패드 연결 끊김')}catch(e2){}}\n    return;\n  }\n  _gpad=_found;\n\n  // ── 1단계: 하드웨어 상태만 읽기 ──\n  let _anyInput=false;\n  for(let i=0;i<_gpad.buttons.length;i++){\n    const pressed=_gpad.buttons[i].pressed||_gpad.buttons[i].value>0.5;\n    _gpBtns[i]=pressed;\n    if(pressed)_anyInput=true;\n  }\n  _gpAxes[0]=Math.abs(_gpad.axes[0])<GP_DEAD?0:_gpad.axes[0];\n  _gpAxes[1]=Math.abs(_gpad.axes[1])<GP_DEAD?0:_gpad.axes[1];\n  if(_gpad.axes.length>=4){\n    _gpAxes[2]=Math.abs(_gpad.axes[2])<GP_DEAD?0:_gpad.axes[2];\n    _gpAxes[3]=Math.abs(_gpad.axes[3])<GP_DEAD?0:_gpad.axes[3];\n  }\n  // D-pad를 axes[6/7]로 전달하는 패드 (Firefox 표준, 일부 컨트롤러)\n  if(_gpad.axes.length>=8){\n    _gpAxes[6]=Math.abs(_gpad.axes[6])<0.5?0:_gpad.axes[6];\n    _gpAxes[7]=Math.abs(_gpad.axes[7])<0.5?0:_gpad.axes[7];\n  }\n  if(_gpAxes[0]||_gpAxes[1]||_gpAxes[2]||_gpAxes[3])_anyInput=true;\n  // 부스: 패드 입력(버튼 눌림 or GP_DEAD=0.25 초과 스틱)도 유휴 리셋 — 폴링 경로라 여기서 처리(키보드/마우스와 동일 변수 _boothIdle, 어트랙트 오전환 방지)\n  if(_anyInput&&_BOOTH_MODE)_boothIdle=0;\n\n  // ── 2단계: 입력 감지 → 패드모드 활성화 (드리프트/아날로그 잔압 무시 — 조이스틱 팬텀 자동전환 방지) ──\n  // 자동전환은 \"의도적 입력\"만 인정: 디지털 버튼 실제 press 또는 스틱 0.5 이상 큰 편향. (idle 스틱 드리프트/트리거 잔압으로 패드모드 켜지지 않게)\n  let _gpDeliberate=false;\n  for(let _di=0;_di<_gpad.buttons.length;_di++){if(_gpad.buttons[_di]&&_gpad.buttons[_di].pressed){_gpDeliberate=true;break}}\n  if(!_gpDeliberate&&(Math.abs(_gpAxes[0])>0.5||Math.abs(_gpAxes[1])>0.5||Math.abs(_gpAxes[2])>0.5||Math.abs(_gpAxes[3])>0.5))_gpDeliberate=true;\n  if(_gpDeliberate&&!_gpActive){_gpActive=true;document.body.style.cursor='none';C.style.cursor='none';}\n\n  // ── 3단계: 패드모드 아니면 K[]/MB[] 절대 안 건드림 ──\n  if(!_gpActive)return;\n  // [팬텀차단] 패드모드 재진입 첫 폴링: 이미 눌려있는(드리프트) 버튼을 prev에 스냅샷 → rising-edge 오인주입(ShiftLeft stuck) 방지\n  if(!_gpSynced){for(let _si=0;_si<_gpad.buttons.length;_si++)_gpBtnsPrev['k'+_si]=!!_gpBtns[_si];_gpSynced=true;}\n\n  // ── 3a단계: 컷씬 진행 중이면 A=advance, B=skip홀드, Start=즉시스킵 ──\n  if(typeof _cutsceneState!=='undefined'&&_cutsceneState==='INTRO_CUTSCENE'){\n    const _cA=!!_gpBtns[0],_cB=!!_gpBtns[1],_cSt=!!_gpBtns[9];\n    if(_cA&&!_gpBtnsPrev['_cutA'])_cutsceneAdvance();\n    if(_cB)_cutSkipHolding=true; else if(_gpBtnsPrev['_cutB'])_cutSkipHolding=false;\n    if(_cSt&&!_gpBtnsPrev['_cutSt'])_cutsceneEnd();\n    _gpBtnsPrev['_cutA']=_cA;_gpBtnsPrev['_cutB']=_cB;_gpBtnsPrev['_cutSt']=_cSt;\n    return;\n  }\n\n  // 통합 인트로는 자체 A/Start 입력을 사용한다. 설정창/전투 입력 누출 차단.\n  if(G&&G._intro){_gpClearAll();_gpBtnsPrev['_noUI9']=!!_gpBtns[9];return;}\n\n  // ── D-pad 패널 토글 (패널 닫혀있을 때만 — 열려있으면 네비게이션 전용) ──\n  {const _DP=[[12,'skillPanel','toggle'],[13,'forge','forge'],[14,'statPanel','toggle'],[15,'invPanel','storage']];\n  const _anyPanelOpen=!!document.querySelector('.panel.on');\n  for(const[bi,pid,act] of _DP){\n    const _on=!!(_gpad.buttons[bi]&&_gpad.buttons[bi].pressed);\n    if(_on&&!_gpBtnsPrev['_dpg'+bi]&&!_anyPanelOpen){\n      if(G&&G.on){\n        if(act==='toggle')togglePanel(pid);\n        else if(act==='forge'){if(G.forgeOpen){closePanel('forge');G.forgeOpen=false}else openPanel('forge')}\n        else if(act==='storage')openInventoryStorage()\n      }\n    }\n    _gpBtnsPrev['_dpg'+bi]=_on;\n  }}\n\n  // ── Start(b9) → 설정창 열기 (패널 없을 때만, 3.5단계 이전 — 오버레이에 막히지 않게) ──\n  {const _sn=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);\n  if(_sn&&!_gpBtnsPrev['_noUI9']&&!document.querySelector('.panel.on')&&!(_gcEl&&_gcEl.classList.contains('on')))openPanel('settings');\n  _gpBtnsPrev['_noUI9']=_sn;}\n\n  // ── 3.5단계: UI 패널/오버레이 열려있으면 게임 입력 차단 + UI 네비게이션 ──\n  if(_gcEl&&_gcEl.classList.contains(\"on\")){_gpClearAll();_gpVCUpdate();_gpUINav(_gcEl);return;}\n  const _gpOpenPanel=document.querySelector('.panel.on');\n  const _gpOverlay=(()=>{\n    for(const id of['introDiff','introKeys','deathReplay','death','lvUpScreen','tutorial','stageClear','victory','stageTransition']){\n      const el=$(id);if(!el)continue;\n      if(el.classList.contains('on'))return el;\n      if(el.style.opacity==='1'&&el.style.pointerEvents==='all')return el;\n    }\n    return null;\n  })();\n  if(_gpOpenPanel||_gpOverlay){\n    _gpClearAll();\n    _gpVCUpdate(); // 좌스틱 → 가상 커서\n    // Back(b8) → 뒤로가기 (서브팝업 → 패널 순 닫기)\n    const _backNow=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);\n    if(_backNow&&!_gpBtnsPrev['_back8']){\n      _gpBtnsPrev['_back8']=true;\n      const _gc=$('gcModal');const _sk=$('skSlotPop');const _cr=$('crBagPop');\n      if(_gc&&_gc.classList.contains('on')){const _cb=$('gcCancel');if(_cb)_cb.click();}\n      else if(_cr&&_cr.style.display==='flex'){closeCrystalPicker();}\n      else if(_sk&&_sk.style.display==='flex'){_closeSkPop();}\n      else{closeAllPanels();}\n      return;\n    }\n    _gpBtnsPrev['_back8']=_backNow;\n    // crBagPop 열려있으면 결정 주머니 전용 nav 우선\n    const _crPop=$('crBagPop');\n    if(_crPop&&_crPop.style.display==='flex'){_gpCrBagNav();return;}\n    if(_gpOpenPanel&&_gpOpenPanel.id==='invPanel'){_gpInvNav()}\n    else{_gpUINav(_gpOpenPanel||_gpOverlay)}\n    return;\n  }\n  _gpVCHide(); // 패널 닫히면 커서 숨김\n  _gpUIPrev.x=!!_gpBtns[2];\n  // UI 닫힌 후 outline 잔류 제거\n  if(_gpUIIdx>0||_gpInvIdx>0||_gpInvEqIdx>0){\n    document.querySelectorAll('[style*=\"outline\"]').forEach(el=>{if(el.style.outline){el.style.outline='';el.style.outlineOffset=''}});\n    _gpUIIdx=0;_gpInvIdx=0;_gpInvEqIdx=0;_gpInvMode='bag';\n  }\n\n  // ── 4단계: 버튼 → 키 주입 ──\n  // 조준 모드 판정 — LT 콤보보다 먼저 (조준 중 재발동 차단)\n  const _isAimMode=P&&(P._mmAiming||P._bwAiming||P._tsAiming||P._msAiming||P._isAiming||P._hrAiming);\n\n  // LT(6) = 모디파이어(홀드+ABXY=1234) / 탭(단독 뗄 때)=KeyF\n  const _ltVal=_gpad.buttons[6]&&_gpad.buttons[6].value||0;\n  const _ltHeld=_ltVal>0.7;\n  const _ltWasHeld=!!_gpBtnsPrev['kLT_held'];\n  const _LT_COMBO={0:'Digit1',1:'Digit2',3:'Digit3',2:'Digit4'}; // A=1,B=2,Y=3,X=4\n\n  // LT 모디파이어 사용 여부 추적\n  if(_ltHeld&&!_ltWasHeld)_gpBtnsPrev['kLT_mod']=false;\n  let _ltUsedAsModifier=!!_gpBtnsPrev['kLT_mod'];\n\n  if(_ltHeld){\n    for(const bi in _LT_COMBO){\n      const idx=+bi;\n      const comboKey=_LT_COMBO[bi];\n      const pressed=!!_gpBtns[idx];\n      const prevKey='kLT'+idx;\n      if(_isAimMode){\n        // 조준 중 버튼 릴리즈 → 발사\n        if(!pressed&&_gpBtnsPrev[prevKey]){MBjust[0]=true;G._gpAimDistReset=true;console.log('[GP-AIM] btn'+idx+' release → FIRE at dist='+G._gpAimDist+' mouse='+~~mouse.x+','+~~mouse.y)}\n        _gpBtnsPrev[prevKey]=pressed;continue;\n      }\n      if(pressed&&!_gpBtnsPrev[prevKey]){\n        _gpInjectKey(comboKey,true);_ltUsedAsModifier=true;_gpBtnsPrev['kLT_mod']=true;\n      }\n      if(!pressed&&_gpBtnsPrev[prevKey]){\n        _gpInjectKey(comboKey,false);\n      }\n      _gpBtnsPrev[prevKey]=pressed;\n    }\n  } else {\n    // LT 뗐을 때\n    for(const bi in _LT_COMBO){\n      const prevKey='kLT'+(+bi);\n      if(_gpBtnsPrev[prevKey]){_gpInjectKey(_LT_COMBO[bi],false);_gpBtnsPrev[prevKey]=false}\n    }\n    if(_ltWasHeld&&_isAimMode){\n      // 조준 중 LT 떼기 → 발사 (좌클릭) + 거리 리셋\n      MBjust[0]=true;G._gpAimDistReset=true;\n    } else if(_ltWasHeld&&!_gpBtnsPrev['kLT_mod']){\n      // 모디파이어 안 쓰였으면 → KeyF 탭\n      _gpInjectKey('KeyF',true);\n      setTimeout(()=>_gpInjectKey('KeyF',false),100);\n    }\n  }\n  _gpBtnsPrev['kLT_held']=_ltHeld;\n\n  // 나머지 버튼 주입\n  const _gpModFirst=[4,5,0,1,2,3,9,10,11]; // D-pad(12~15), Back(8) 제외 — Back은 전용 처리\n  for(let _mi=0;_mi<_gpModFirst.length;_mi++){\n    const idx=_gpModFirst[_mi];\n    const kc=_GP_KEY[idx];\n    if(!kc)continue;\n    // LT 홀드 중 ABXY(0~3)는 콤보로 처리 → 원래 키 차단\n    if(_ltHeld&&idx>=0&&idx<=3){\n      if(_gpBtnsPrev['k'+idx])_gpInjectKey(kc,false);\n      _gpBtnsPrev['k'+idx]=false;\n      continue;\n    }\n    const pressed=!!_gpBtns[idx];\n    const wasPrev=!!_gpBtnsPrev['k'+idx];\n    if(pressed&&!wasPrev){\n      if(idx===3&&G.on&&!G.paused){\n        if(P._gwActive){_finishGhostWalk();_gpBtnsPrev['k'+idx]=pressed;continue}\n        if(P._ioActive){activateIceShatter();_gpBtnsPrev['k'+idx]=pressed;continue}\n      }\n      _gpInjectKey(kc,true);\n    }\n    if(!pressed&&wasPrev)_gpInjectKey(kc,false);\n    _gpBtnsPrev['k'+idx]=pressed;\n  }\n\n  // [release-sync] 게임패드 주입 키의 falling-edge 유실 방지 — 엣지 아닌 '현재 레벨'로 강제 해제만 (누르기는 위 엣지 로직 유지)\n  for(var _ic in _gpInjHeld){\n    if(!_gpInjHeld[_ic])continue;\n    var _bi=_GP_KEYIDX[_ic];\n    if(_bi===undefined)continue;\n    if(!_gpBtns[_bi]){ _gpInjectKey(_ic,false); }\n  }\n\n  // RT→Z(필살기), LT+RT→X(처형)\n  const rt=_gpad.buttons[7]&&_gpad.buttons[7].value>0.7;\n  const ltrt=_ltHeld&&rt;\n  if(ltrt&&!_gpBtnsPrev['kLTRT']){\n    _gpInjectKey('KeyX',true);\n    if(_gpBtnsPrev['kRT']){_gpInjectKey('KeyZ',false);_gpBtnsPrev['kRT']=false}\n  }\n  if(!ltrt&&_gpBtnsPrev['kLTRT']){_gpInjectKey('KeyX',false)}\n  _gpBtnsPrev['kLTRT']=ltrt;\n  if(!ltrt){\n    if(rt&&!_gpBtnsPrev['kRT'])_gpInjectKey('KeyZ',true);\n    if(!rt&&_gpBtnsPrev['kRT'])_gpInjectKey('KeyZ',false);\n  }\n  _gpBtnsPrev['kRT']=rt&&!ltrt;\n\n  // 조준 모드: 포격식 (LT+버튼 홀드→거리증가, 스틱→방향, 릴리즈→발사)\n  if(_isAimMode){\n    // 스틱 방향 감지\n    const ax=_gpAxes[0],ay=_gpAxes[1];\n    const rx=_gpAxes[2],ry=_gpAxes[3];\n    const lMag=Math.sqrt(ax*ax+ay*ay);\n    const rMag=Math.sqrt(rx*rx+ry*ry);\n    const useR=rMag>lMag;\n    const sx2=useR?rx:ax, sy2=useR?ry:ay, mag=useR?rMag:lMag;\n    if(mag>0.15){\n      const _ang=Math.atan2(sy2,sx2);\n      const _snap=Math.round(_ang/(Math.PI/4))*(Math.PI/4);\n      P.facing=_snap;\n    }\n    // 포격 거리: LT+버튼 홀드 중 자동 증가 (0→1000)\n    if(!G._gpAimDist)G._gpAimDist=0;\n    // 지연 리셋: 발사 프레임에서는 좌표 유지, 다음 프레임에 리셋\n    if(G._gpAimDistReset===2){G._gpAimDist=0;G._gpAimDistReset=0}\n    if(G._gpAimDistReset===true)G._gpAimDistReset=2;\n    // LT+ABXY 중 하나라도 눌려있으면 거리 증가\n    const _anyAimBtn=(_ltHeld&&(_gpBtns[0]||_gpBtns[1]||_gpBtns[2]||_gpBtns[3]));\n    if(_anyAimBtn){G._gpAimDist=Math.min((G._gpAimDist||0)+18,1000)}\n    // 마우스 좌표를 플레이어+facing 방향×거리로 세팅\n    const scx=P.x-G.cam.x+VW/2, scy=P.y-G.cam.y+VH/2;\n    mouse.x=scx+Math.cos(P.facing)*(G._gpAimDist||0);\n    mouse.y=scy+Math.sin(P.facing)*(G._gpAimDist||0);\n    G._gpAiming=true;\n  }else{\n    // 비조준: 우스틱→방향+마법 자동발동 (트윈스틱)\n    let rx=_gpAxes[2],ry=_gpAxes[3];\n    // 아케이드스틱 등 우스틱 없는 패드: 좌스틱과 독립 움직임이 감지된 적 없으면 무시\n    if(!_gpHasRStick){\n      if((rx||ry)&&(rx!==_gpAxes[0]||ry!==_gpAxes[1]))_gpHasRStick=true;\n      else{rx=0;ry=0}\n    }\n    const rMag=Math.sqrt(rx*rx+ry*ry);\n    const _rsWas=!!_gpBtnsPrev['kRS'];\n    if(rMag>0.2){\n      P.facing=Math.atan2(ry,rx);\n      G._gpAiming=true;\n      if(!_rsWas)_gpInjectKey('mouse2',true); // 스틱 기울이면 마법키(우클릭) 누름\n    }else{\n      G._gpAiming=false;\n      if(_rsWas)_gpInjectKey('mouse2',false); // 스틱 놓으면 마법키 해제\n    }\n    _gpBtnsPrev['kRS']=rMag>0.2;\n  }\n\n  // 좌스틱 → WASD (조준 모드가 아닐 때만 이동)\n  const su=!_isAimMode&&_gpAxes[1]<-GP_DEAD,sd=!_isAimMode&&_gpAxes[1]>GP_DEAD,sl=!_isAimMode&&_gpAxes[0]<-GP_DEAD,sr=!_isAimMode&&_gpAxes[0]>GP_DEAD;\n  const _stickMap=[['sU','KeyW',su],['sD','KeyS',sd],['sL','KeyA',sl],['sR','KeyD',sr]];\n  for(let _si=0;_si<4;_si++){\n    const[pk,kc,on]=_stickMap[_si];\n    const was=!!_gpBtnsPrev[pk];\n    if(on&&!was){K[kc]=true;const ev=new KeyboardEvent('keydown',{code:kc,key:kc,bubbles:true});ev._fromGp=true;document.dispatchEvent(ev)}\n    if(!on&&was){K[kc]=false;const ev=new KeyboardEvent('keyup',{code:kc,key:kc,bubbles:true});ev._fromGp=true;document.dispatchEvent(ev)}\n    _gpBtnsPrev[pk]=on;\n  }\n}","pollAnchor":"  _gpVCHide(); // 패널 닫히면 커서 숨김","anchor":"  _gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.y=y;\n\n  // ── 우측 스틱:","before":{"mode":"source","rangeRoute":true,"trace":[{"type":"cursorUpdate"},{"type":"scroll"},{"type":"minusAction"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"minusAction"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"minusAction"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"minusAction"},{"type":"hideCursor"},{"type":"renderSkill"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"minusAction"}],"minusActions":5,"releasedPreviousX":false},"snapshotOnly":{"mode":"snapshotOnly","rangeRoute":true,"trace":[{"type":"cursorUpdate"},{"type":"scroll"},{"type":"minusAction"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"minusAction"},{"type":"hideCursor"},{"type":"renderSkill"},{"type":"cursorUpdate"},{"type":"scroll"}],"minusActions":2,"releasedPreviousX":true},"after":{"mode":"complete","rangeRoute":true,"trace":[{"type":"cursorUpdate"},{"type":"scroll"},{"type":"minusAction"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"minusAction"},{"type":"hideCursor"},{"type":"renderSkill"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"minusAction"}],"minusActions":3,"releasedPreviousX":false},"normalBefore":{"mode":"source","rangeRoute":false,"trace":[{"type":"cursorUpdate"},{"type":"scroll"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"hideCursor"},{"type":"hideCursor"},{"type":"keydown","code":"KeyE","fromGp":true},{"type":"hideCursor"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"renderSkill"},{"type":"cursorUpdate"},{"type":"scroll"}],"minusActions":0,"releasedPreviousX":false},"normalAfter":{"mode":"complete","rangeRoute":false,"trace":[{"type":"cursorUpdate"},{"type":"scroll"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"hideCursor"},{"type":"hideCursor"},{"type":"keydown","code":"KeyE","fromGp":true},{"type":"hideCursor"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"renderSkill"},{"type":"cursorUpdate"},{"type":"scroll"}],"minusActions":0,"releasedPreviousX":false}},{"file":"game-easy-test.html","sourceSHA256":"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129","pollSHA256":"00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d","navigationSHA256":"cc02ae15d667b7500e2f21dd84e0ee79ce6c2b704e526111face98ab52f4b4b0","original":"function _gpUINav(panel){\n  if(!_gpad||!panel)return;\n  // skSlotPop 열려있으면 그걸 패널로 전환 (skillPanel 밖에 있어서 querySelectorAll 미탐지)\n  const _spop=$('skSlotPop');\n  if(_spop&&_spop.style.display==='flex')panel=_spop;\n  // 패널 내 포커스 가능 요소 수집\n  const SEL='button:not([disabled]),.pclose,[onclick],.sk-opt:not(.locked),.up-row:not(.dis),.stat-btn:not(.dis),.passive-row:not(.dis),.fg-i:not(.dis),.fg-tab,.set-key,.id-btn,.retry,input[type=\"range\"],input[type=\"checkbox\"],select,[data-sk-id],.inv-filter-btn,.inv-eq-item,.inv-eq-slot,.inv-item,.inv-cr-item,.inv-cell,.inv-dep-item,.inv-exp-btn,.sk-pop-tab,.gc-btn,.inv-storage-toggle,.cmp-close,label[style*=\"cursor:pointer\"],a[href],[style*=\"cursor:pointer\"]';\n  const items=[];\n  const all=panel.querySelectorAll(SEL);\n  for(let i=0;i<all.length;i++){\n    const el=all[i];\n    if(el.offsetParent===null)continue;\n    // [data-sk-id] 자식 중복 방지: 스킬카드 안의 자식은 카드 자체만 잡음\n    if(!el.dataset.skId&&el.closest('[data-sk-id]'))continue;\n    items.push(el);\n  }\n  if(!items.length)return;\n  if(_gpUIIdx>=items.length)_gpUIIdx=0;\n\n  // D-pad(버튼12-15) + axes[6/7](일부 패드 D-pad) → 한 칸 이동 (좌스틱은 가상커서 전용)\n  const _dU=(_gpad.buttons[12]&&_gpad.buttons[12].pressed)||_gpAxes[7]<-0.5;\n  const _dD=(_gpad.buttons[13]&&_gpad.buttons[13].pressed)||_gpAxes[7]>0.5;\n  const _dL=(_gpad.buttons[14]&&_gpad.buttons[14].pressed)||_gpAxes[6]<-0.5;\n  const _dR=(_gpad.buttons[15]&&_gpad.buttons[15].pressed)||_gpAxes[6]>0.5;\n  const u=_dU,d=_dD,l=_dL,r=_dR;\n  // 가상 커서 모드 + 좌우 D-pad: 커서 아래 range 슬라이더 값 조절\n  if(_gpVC.vis&&(l||r)){\n    const _vcHover=document.elementFromPoint(_gpVC.x,_gpVC.y);\n    const _vcRng=_vcHover&&(_vcHover.tagName==='INPUT'&&_vcHover.type==='range'?_vcHover:_vcHover.closest?.('.set-range-row')?.querySelector('input[type=\"range\"]'));\n    if(_vcRng){\n      const _nowTs2=performance.now();const _dir2=l?'l':'r';\n      if(_dir2!==_gpUIRepeatDir){_gpUIRepeatDir=_dir2;_gpUIRepeatTs=_nowTs2+_GP_UI_DELAY;\n        const _s2=+((_vcRng.step)||1);_vcRng.value=l?Math.max(+_vcRng.min,+_vcRng.value-_s2):Math.min(+_vcRng.max,+_vcRng.value+_s2);_vcRng.dispatchEvent(new Event('input'));\n      }else if(_nowTs2>=_gpUIRepeatTs){_gpUIRepeatTs=_nowTs2+_GP_UI_INTERVAL;\n        const _s2=+((_vcRng.step)||1);_vcRng.value=l?Math.max(+_vcRng.min,+_vcRng.value-_s2):Math.min(+_vcRng.max,+_vcRng.value+_s2);_vcRng.dispatchEvent(new Event('input'));\n      }\n      _gpUIPrev.u=u;_gpUIPrev.d=d;_gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;return;\n    }\n  }\n  if(u||d||l||r)_gpVCHide(); // D-pad 누르면 커서 숨기고 선택 모드\n  // 우측 스틱 → 스크롤 (휠 역할) — 원시값 사용 (데드존 없이 0.15 임계)\n  const rsYVal=_gpad.axes.length>=4?_gpad.axes[3]:0;\n  const rsXVal=_gpad.axes.length>=3?_gpad.axes[2]:0;\n  const a=_gpad.buttons[0]&&_gpad.buttons[0].pressed;\n  const b=_gpad.buttons[1]&&_gpad.buttons[1].pressed;\n  const lb=_gpad.buttons[4]&&_gpad.buttons[4].pressed;\n  const rb=_gpad.buttons[5]&&_gpad.buttons[5].pressed;\n\n  // 좌스틱/D-pad: 한 칸 이동 — repeat 타이머\n  const _nowDir=u?'u':d?'d':l?'l':r?'r':null;\n  const _nowTs=performance.now();\n  let _didMove=false;\n  if(_nowDir){\n    if(_nowDir!==_gpUIRepeatDir){\n      _gpUIRepeatDir=_nowDir;_gpUIRepeatTs=_nowTs+_GP_UI_DELAY;\n      _gpUIStep(_nowDir,items);_didMove=true;\n    } else if(_nowTs>=_gpUIRepeatTs){\n      _gpUIRepeatTs=_nowTs+_GP_UI_INTERVAL;\n      _gpUIStep(_nowDir,items);_didMove=true;\n    }\n  } else {\n    _gpUIRepeatDir=null;\n  }\n  if(_didMove){_gpVibrate(2,40);_gpRSScrolled=false;}\n\n  const cur=items[_gpUIIdx];\n\n  // LB/RB: 탭 전환\n  if((lb&&!_gpUIPrev.lb)||(rb&&!_gpUIPrev.rb)){\n    if(panel.id==='skillPanel'&&typeof SKILL_HIER!=='undefined'){\n      // 스킬패널 전용: SKILL_HIER 순환\n      let _ci=SKILL_HIER.findIndex(h=>h.id===_skHierTab);if(_ci<0)_ci=0;\n      if(rb&&!_gpUIPrev.rb)_ci=Math.min(SKILL_HIER.length-1,_ci+1);\n      if(lb&&!_gpUIPrev.lb)_ci=Math.max(0,_ci-1);\n      _skHierTab=SKILL_HIER[_ci].id;\n      if(typeof renderSkillPanel==='function')renderSkillPanel();\n    } else {\n      const tabs=panel.querySelectorAll('.fg-tab');\n      if(tabs.length>1){\n        // 탭 있음 → 탭 전환\n        let ti=-1;tabs.forEach((t,i)=>{if(t.classList.contains('act'))ti=i});\n        if(ti<0)ti=0;\n        if(rb&&!_gpUIPrev.rb)ti=Math.min(tabs.length-1,ti+1);\n        if(lb&&!_gpUIPrev.lb)ti=Math.max(0,ti-1);\n        if(tabs[ti])tabs[ti].click();\n      } else {\n        // 탭 없음 → 섹션(단락) 이동\n        const _lc=items[_gpUIIdx];\n        const _lt=_lc?_gpSectType(_lc):'';\n        if(rb&&!_gpUIPrev.rb){\n          let ni=_gpUIIdx;\n          for(let i=_gpUIIdx+1;i<items.length;i++){if(_gpSectType(items[i])!==_lt){ni=i;break;}}\n          _gpUIIdx=ni;\n        }\n        if(lb&&!_gpUIPrev.lb){\n          let ni=_gpUIIdx,pt='';\n          for(let i=_gpUIIdx-1;i>=0;i--){const t=_gpSectType(items[i]);if(t!==_lt){pt=t;ni=i;break;}}\n          if(pt){while(ni>0&&_gpSectType(items[ni-1])===pt)ni--;}\n          _gpUIIdx=ni;\n        }\n      }\n    }\n  }\n\n  _gpUIPrev.lb=lb;_gpUIPrev.rb=rb;\n\n  // 하이라이트 (우스틱 스크롤 후에는 D-pad 이동 전까지 scrollIntoView 억제)\n  const _rsNow=_gpad.axes.length>=4&&(Math.abs(_gpad.axes[3])>0.15||Math.abs(_gpad.axes[2])>0.15);\n  if(_rsNow)_gpRSScrolled=true;\n  for(let i=0;i<items.length;i++){\n    if(i===_gpUIIdx){\n      items[i].style.outline='2px solid #C9A961';items[i].style.outlineOffset='-1px';\n      if(!_gpRSScrolled){\n        if(items[i].scrollIntoViewIfNeeded)items[i].scrollIntoViewIfNeeded(false);\n        else items[i].scrollIntoView({block:'nearest'});\n      }\n    } else {\n      items[i].style.outline='';items[i].style.outlineOffset='';\n    }\n  }\n\n  // 키바인딩 입력 대기 중 → B=취소(ESC 주입)\n  if(listeningBind&&b&&!_gpUIPrev.b){\n    listeningBind=null;_listenAlt=false;renderSettings();\n    _gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.y=y;_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;return;\n  }\n\n  // A = 커서 위치 클릭 우선, 없으면 포커스 요소 클릭\n  if(a&&!_gpUIPrev.a){\n    if(_gpVC.vis){\n      let _vcEl=document.elementFromPoint(_gpVC.x,_gpVC.y);\n      if(_vcEl&&_vcEl.id!=='_gpVCursor'){\n        // range/select 또는 그 행 클릭 → D-pad 선택 모드로 전환하여 해당 요소 포커스\n        const _vcRange=_vcEl.tagName==='INPUT'&&_vcEl.type==='range'?_vcEl:_vcEl.closest?.('.set-range-row')?.querySelector('input[type=\"range\"]');\n        const _vcSel=!_vcRange&&(_vcEl.tagName==='SELECT'?_vcEl:_vcEl.closest?.('.set-range-row')?.querySelector('select'));\n        const _vcFocus=_vcRange||_vcSel;\n        if(_vcFocus){\n          for(let _ri=0;_ri<items.length;_ri++){if(items[_ri]===_vcFocus){_gpUIIdx=_ri;break}}\n          _gpVCHide();\n        } else {_vcEl.click()}\n        _gpBtnsPrev['k0']=true;\n      }\n    } else if(cur){\n      // 스킬카드 expanded: A → (+) 습득/강화 버튼 우선 클릭\n      if(cur.dataset&&cur.dataset.skId){\n        const _plusBtn=cur.querySelector('[style*=\"cursor:pointer\"][style*=\"border:1px solid #aa8833\"]');\n        if(_plusBtn){_plusBtn.click();_gpBtnsPrev['k0']=true;}\n        else{cur.click();_gpBtnsPrev['k0']=true;}\n      } else if(cur.tagName==='SELECT'){\n        // select: A = 다음 옵션 (네이티브 드롭다운 열지 않음 — 패드로 닫기 불가)\n        cur.selectedIndex=(cur.selectedIndex+1)%cur.options.length;cur.dispatchEvent(new Event('change'));\n        _gpBtnsPrev['k0']=true;\n      } else {cur.click();_gpBtnsPrev['k0']=true;}\n    }\n  }\n  // X = 스킬카드 expanded: (-) 레벨다운/취소 버튼\n  const x=_gpad.buttons[2]&&_gpad.buttons[2].pressed;\n  if(x&&!_gpUIPrev.x&&cur&&cur.dataset&&cur.dataset.skId&&panel.id==='skillPanel'){\n    const _minBtn=cur.querySelector('[style*=\"cursor:pointer\"][style*=\"border:1px solid #cc4444\"]');\n    if(_minBtn){_minBtn.click();_gpBtnsPrev['k2']=true;}\n  }\n  // B = 단계별 뒤로가기\n  const _start=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);\n  if((b&&!_gpUIPrev.b)){\n    _panelBack();_gpBtnsPrev['k1']=true;\n  }\n  _gpUIPrev.start=_start;\n  // Y = 스킬 패널: 선택 스킬 슬롯 배정 / 인벤: 장착·해제·꺼내기\n  const y=_gpad.buttons[3]&&_gpad.buttons[3].pressed;\n  if(y&&!_gpUIPrev.y&&cur){\n    // 스킬 패널에서 .sk-opt 위에 있으면 → 순환 배정\n    if(panel.id==='skillPanel'&&cur.classList.contains('sk-opt')){\n      const skId=cur.dataset&&cur.dataset.skId;\n      if(skId&&typeof _openSkillSlotPop==='function'){\n        // 선택 슬롯 계약: 일반=1~4, 지옥강타 계열 분노 폭발=Space, 영역=F\n        const si=_findAutoSkillSlot(skId);\n        if(si>=0){SKILL_SLOTS[si]=skId;if(typeof updateQS==='function')updateQS();if(typeof dbSaveNow==='function')dbSaveNow();const _slNm=si<4?_T('슬롯')+(si+1):si===4?'SP'+_T('슬롯'):'F'+_T('슬롯');addTxt(P.x,P.y-20,_slNm+': '+_T(cur.querySelector('.sk-opt-name')?.textContent||skId),'#ff8844',40);SFX.pickup()}\n      }\n    }\n    // 인벤토리 패널: Y = 우클릭 (장착/해제/꺼내기)\n    if(panel.id==='invPanel'){\n      if(cur.classList.contains('inv-item')||cur.classList.contains('inv-eq-item')||cur.classList.contains('inv-cell')){\n        cur.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2}));\n        _gpBtnsPrev['k3']=true;\n      }\n    }\n  }\n\n  _gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.y=y;\n\n  // ── 우측 스틱: 패널 스크롤 (가상커서 위치 → 해당 영역, 없으면 포커스 항목 기준) ──\n  if(Math.abs(rsYVal)>0.15||Math.abs(rsXVal)>0.15){\n    let _sc=null;\n    if(_gpVC.vis){_sc=_gpFindScroll(document.elementFromPoint(_gpVC.x,_gpVC.y))}\n    if(!_sc){\n      if(panel.id==='skillPanel')_sc=panel.querySelector('.frame-inner-panel-stack');\n      if(!_sc&&cur)_sc=_gpFindScroll(cur);\n    }\n    if(!_sc)_sc=_gpFindScroll(panel)||_gpFindScrollDown(panel);\n    if(_sc){_gpDoScroll(_sc,Math.abs(rsYVal)>0.15?rsYVal*18:0,Math.abs(rsXVal)>0.15?rsXVal*18:0)}\n  }\n\n  // 버튼 8(Back) = 전체 첫 항목  버튼 9(Start) = 전체 마지막 항목\n  const b8=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);\n  const b9=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);\n  if(b8&&!_gpUIPrev.b8)_gpUIIdx=0;\n  if(b9&&!_gpUIPrev.b9)_gpUIIdx=items.length-1;\n  _gpUIPrev.b8=b8;_gpUIPrev.b9=b9;\n}","candidate":"function _gpUINav(panel){\n  if(!_gpad||!panel)return;\n  // skSlotPop 열려있으면 그걸 패널로 전환 (skillPanel 밖에 있어서 querySelectorAll 미탐지)\n  const _spop=$('skSlotPop');\n  if(_spop&&_spop.style.display==='flex')panel=_spop;\n  // 패널 내 포커스 가능 요소 수집\n  const SEL='button:not([disabled]),.pclose,[onclick],.sk-opt:not(.locked),.up-row:not(.dis),.stat-btn:not(.dis),.passive-row:not(.dis),.fg-i:not(.dis),.fg-tab,.set-key,.id-btn,.retry,input[type=\"range\"],input[type=\"checkbox\"],select,[data-sk-id],.inv-filter-btn,.inv-eq-item,.inv-eq-slot,.inv-item,.inv-cr-item,.inv-cell,.inv-dep-item,.inv-exp-btn,.sk-pop-tab,.gc-btn,.inv-storage-toggle,.cmp-close,label[style*=\"cursor:pointer\"],a[href],[style*=\"cursor:pointer\"]';\n  const items=[];\n  const all=panel.querySelectorAll(SEL);\n  for(let i=0;i<all.length;i++){\n    const el=all[i];\n    if(el.offsetParent===null)continue;\n    // [data-sk-id] 자식 중복 방지: 스킬카드 안의 자식은 카드 자체만 잡음\n    if(!el.dataset.skId&&el.closest('[data-sk-id]'))continue;\n    items.push(el);\n  }\n  if(!items.length)return;\n  if(_gpUIIdx>=items.length)_gpUIIdx=0;\n\n  // D-pad(버튼12-15) + axes[6/7](일부 패드 D-pad) → 한 칸 이동 (좌스틱은 가상커서 전용)\n  const _dU=(_gpad.buttons[12]&&_gpad.buttons[12].pressed)||_gpAxes[7]<-0.5;\n  const _dD=(_gpad.buttons[13]&&_gpad.buttons[13].pressed)||_gpAxes[7]>0.5;\n  const _dL=(_gpad.buttons[14]&&_gpad.buttons[14].pressed)||_gpAxes[6]<-0.5;\n  const _dR=(_gpad.buttons[15]&&_gpad.buttons[15].pressed)||_gpAxes[6]>0.5;\n  const u=_dU,d=_dD,l=_dL,r=_dR;\n  // 가상 커서 모드 + 좌우 D-pad: 커서 아래 range 슬라이더 값 조절\n  if(_gpVC.vis&&(l||r)){\n    const _vcHover=document.elementFromPoint(_gpVC.x,_gpVC.y);\n    const _vcRng=_vcHover&&(_vcHover.tagName==='INPUT'&&_vcHover.type==='range'?_vcHover:_vcHover.closest?.('.set-range-row')?.querySelector('input[type=\"range\"]'));\n    if(_vcRng){\n      const _nowTs2=performance.now();const _dir2=l?'l':'r';\n      if(_dir2!==_gpUIRepeatDir){_gpUIRepeatDir=_dir2;_gpUIRepeatTs=_nowTs2+_GP_UI_DELAY;\n        const _s2=+((_vcRng.step)||1);_vcRng.value=l?Math.max(+_vcRng.min,+_vcRng.value-_s2):Math.min(+_vcRng.max,+_vcRng.value+_s2);_vcRng.dispatchEvent(new Event('input'));\n      }else if(_nowTs2>=_gpUIRepeatTs){_gpUIRepeatTs=_nowTs2+_GP_UI_INTERVAL;\n        const _s2=+((_vcRng.step)||1);_vcRng.value=l?Math.max(+_vcRng.min,+_vcRng.value-_s2):Math.min(+_vcRng.max,+_vcRng.value+_s2);_vcRng.dispatchEvent(new Event('input'));\n      }\n      _gpUIPrev.u=u;_gpUIPrev.d=d;_gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;return;\n    }\n  }\n  if(u||d||l||r)_gpVCHide(); // D-pad 누르면 커서 숨기고 선택 모드\n  // 우측 스틱 → 스크롤 (휠 역할) — 원시값 사용 (데드존 없이 0.15 임계)\n  const rsYVal=_gpad.axes.length>=4?_gpad.axes[3]:0;\n  const rsXVal=_gpad.axes.length>=3?_gpad.axes[2]:0;\n  const a=_gpad.buttons[0]&&_gpad.buttons[0].pressed;\n  const b=_gpad.buttons[1]&&_gpad.buttons[1].pressed;\n  const lb=_gpad.buttons[4]&&_gpad.buttons[4].pressed;\n  const rb=_gpad.buttons[5]&&_gpad.buttons[5].pressed;\n\n  // 좌스틱/D-pad: 한 칸 이동 — repeat 타이머\n  const _nowDir=u?'u':d?'d':l?'l':r?'r':null;\n  const _nowTs=performance.now();\n  let _didMove=false;\n  if(_nowDir){\n    if(_nowDir!==_gpUIRepeatDir){\n      _gpUIRepeatDir=_nowDir;_gpUIRepeatTs=_nowTs+_GP_UI_DELAY;\n      _gpUIStep(_nowDir,items);_didMove=true;\n    } else if(_nowTs>=_gpUIRepeatTs){\n      _gpUIRepeatTs=_nowTs+_GP_UI_INTERVAL;\n      _gpUIStep(_nowDir,items);_didMove=true;\n    }\n  } else {\n    _gpUIRepeatDir=null;\n  }\n  if(_didMove){_gpVibrate(2,40);_gpRSScrolled=false;}\n\n  const cur=items[_gpUIIdx];\n\n  // LB/RB: 탭 전환\n  if((lb&&!_gpUIPrev.lb)||(rb&&!_gpUIPrev.rb)){\n    if(panel.id==='skillPanel'&&typeof SKILL_HIER!=='undefined'){\n      // 스킬패널 전용: SKILL_HIER 순환\n      let _ci=SKILL_HIER.findIndex(h=>h.id===_skHierTab);if(_ci<0)_ci=0;\n      if(rb&&!_gpUIPrev.rb)_ci=Math.min(SKILL_HIER.length-1,_ci+1);\n      if(lb&&!_gpUIPrev.lb)_ci=Math.max(0,_ci-1);\n      _skHierTab=SKILL_HIER[_ci].id;\n      if(typeof renderSkillPanel==='function')renderSkillPanel();\n    } else {\n      const tabs=panel.querySelectorAll('.fg-tab');\n      if(tabs.length>1){\n        // 탭 있음 → 탭 전환\n        let ti=-1;tabs.forEach((t,i)=>{if(t.classList.contains('act'))ti=i});\n        if(ti<0)ti=0;\n        if(rb&&!_gpUIPrev.rb)ti=Math.min(tabs.length-1,ti+1);\n        if(lb&&!_gpUIPrev.lb)ti=Math.max(0,ti-1);\n        if(tabs[ti])tabs[ti].click();\n      } else {\n        // 탭 없음 → 섹션(단락) 이동\n        const _lc=items[_gpUIIdx];\n        const _lt=_lc?_gpSectType(_lc):'';\n        if(rb&&!_gpUIPrev.rb){\n          let ni=_gpUIIdx;\n          for(let i=_gpUIIdx+1;i<items.length;i++){if(_gpSectType(items[i])!==_lt){ni=i;break;}}\n          _gpUIIdx=ni;\n        }\n        if(lb&&!_gpUIPrev.lb){\n          let ni=_gpUIIdx,pt='';\n          for(let i=_gpUIIdx-1;i>=0;i--){const t=_gpSectType(items[i]);if(t!==_lt){pt=t;ni=i;break;}}\n          if(pt){while(ni>0&&_gpSectType(items[ni-1])===pt)ni--;}\n          _gpUIIdx=ni;\n        }\n      }\n    }\n  }\n\n  _gpUIPrev.lb=lb;_gpUIPrev.rb=rb;\n\n  // 하이라이트 (우스틱 스크롤 후에는 D-pad 이동 전까지 scrollIntoView 억제)\n  const _rsNow=_gpad.axes.length>=4&&(Math.abs(_gpad.axes[3])>0.15||Math.abs(_gpad.axes[2])>0.15);\n  if(_rsNow)_gpRSScrolled=true;\n  for(let i=0;i<items.length;i++){\n    if(i===_gpUIIdx){\n      items[i].style.outline='2px solid #C9A961';items[i].style.outlineOffset='-1px';\n      if(!_gpRSScrolled){\n        if(items[i].scrollIntoViewIfNeeded)items[i].scrollIntoViewIfNeeded(false);\n        else items[i].scrollIntoView({block:'nearest'});\n      }\n    } else {\n      items[i].style.outline='';items[i].style.outlineOffset='';\n    }\n  }\n\n  // 키바인딩 입력 대기 중 → B=취소(ESC 주입)\n  if(listeningBind&&b&&!_gpUIPrev.b){\n    listeningBind=null;_listenAlt=false;renderSettings();\n    _gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.y=y;_gpUIPrev.lb=lb;_gpUIPrev.rb=rb;return;\n  }\n\n  // A = 커서 위치 클릭 우선, 없으면 포커스 요소 클릭\n  if(a&&!_gpUIPrev.a){\n    if(_gpVC.vis){\n      let _vcEl=document.elementFromPoint(_gpVC.x,_gpVC.y);\n      if(_vcEl&&_vcEl.id!=='_gpVCursor'){\n        // range/select 또는 그 행 클릭 → D-pad 선택 모드로 전환하여 해당 요소 포커스\n        const _vcRange=_vcEl.tagName==='INPUT'&&_vcEl.type==='range'?_vcEl:_vcEl.closest?.('.set-range-row')?.querySelector('input[type=\"range\"]');\n        const _vcSel=!_vcRange&&(_vcEl.tagName==='SELECT'?_vcEl:_vcEl.closest?.('.set-range-row')?.querySelector('select'));\n        const _vcFocus=_vcRange||_vcSel;\n        if(_vcFocus){\n          for(let _ri=0;_ri<items.length;_ri++){if(items[_ri]===_vcFocus){_gpUIIdx=_ri;break}}\n          _gpVCHide();\n        } else {_vcEl.click()}\n        _gpBtnsPrev['k0']=true;\n      }\n    } else if(cur){\n      // 스킬카드 expanded: A → (+) 습득/강화 버튼 우선 클릭\n      if(cur.dataset&&cur.dataset.skId){\n        const _plusBtn=cur.querySelector('[style*=\"cursor:pointer\"][style*=\"border:1px solid #aa8833\"]');\n        if(_plusBtn){_plusBtn.click();_gpBtnsPrev['k0']=true;}\n        else{cur.click();_gpBtnsPrev['k0']=true;}\n      } else if(cur.tagName==='SELECT'){\n        // select: A = 다음 옵션 (네이티브 드롭다운 열지 않음 — 패드로 닫기 불가)\n        cur.selectedIndex=(cur.selectedIndex+1)%cur.options.length;cur.dispatchEvent(new Event('change'));\n        _gpBtnsPrev['k0']=true;\n      } else {cur.click();_gpBtnsPrev['k0']=true;}\n    }\n  }\n  // X = 스킬카드 expanded: (-) 레벨다운/취소 버튼\n  const x=_gpad.buttons[2]&&_gpad.buttons[2].pressed;\n  if(x&&!_gpUIPrev.x&&cur&&cur.dataset&&cur.dataset.skId&&panel.id==='skillPanel'){\n    const _minBtn=cur.querySelector('[style*=\"cursor:pointer\"][style*=\"border:1px solid #cc4444\"]');\n    if(_minBtn){_minBtn.click();_gpBtnsPrev['k2']=true;}\n  }\n  // B = 단계별 뒤로가기\n  const _start=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);\n  if((b&&!_gpUIPrev.b)){\n    _panelBack();_gpBtnsPrev['k1']=true;\n  }\n  _gpUIPrev.start=_start;\n  // Y = 스킬 패널: 선택 스킬 슬롯 배정 / 인벤: 장착·해제·꺼내기\n  const y=_gpad.buttons[3]&&_gpad.buttons[3].pressed;\n  if(y&&!_gpUIPrev.y&&cur){\n    // 스킬 패널에서 .sk-opt 위에 있으면 → 순환 배정\n    if(panel.id==='skillPanel'&&cur.classList.contains('sk-opt')){\n      const skId=cur.dataset&&cur.dataset.skId;\n      if(skId&&typeof _openSkillSlotPop==='function'){\n        // 선택 슬롯 계약: 일반=1~4, 지옥강타 계열 분노 폭발=Space, 영역=F\n        const si=_findAutoSkillSlot(skId);\n        if(si>=0){SKILL_SLOTS[si]=skId;if(typeof updateQS==='function')updateQS();if(typeof dbSaveNow==='function')dbSaveNow();const _slNm=si<4?_T('슬롯')+(si+1):si===4?'SP'+_T('슬롯'):'F'+_T('슬롯');addTxt(P.x,P.y-20,_slNm+': '+_T(cur.querySelector('.sk-opt-name')?.textContent||skId),'#ff8844',40);SFX.pickup()}\n      }\n    }\n    // 인벤토리 패널: Y = 우클릭 (장착/해제/꺼내기)\n    if(panel.id==='invPanel'){\n      if(cur.classList.contains('inv-item')||cur.classList.contains('inv-eq-item')||cur.classList.contains('inv-cell')){\n        cur.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2}));\n        _gpBtnsPrev['k3']=true;\n      }\n    }\n  }\n\n  _gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.y=y;_gpUIPrev.x=x;\n\n  // ── 우측 스틱: 패널 스크롤 (가상커서 위치 → 해당 영역, 없으면 포커스 항목 기준) ──\n  if(Math.abs(rsYVal)>0.15||Math.abs(rsXVal)>0.15){\n    let _sc=null;\n    if(_gpVC.vis){_sc=_gpFindScroll(document.elementFromPoint(_gpVC.x,_gpVC.y))}\n    if(!_sc){\n      if(panel.id==='skillPanel')_sc=panel.querySelector('.frame-inner-panel-stack');\n      if(!_sc&&cur)_sc=_gpFindScroll(cur);\n    }\n    if(!_sc)_sc=_gpFindScroll(panel)||_gpFindScrollDown(panel);\n    if(_sc){_gpDoScroll(_sc,Math.abs(rsYVal)>0.15?rsYVal*18:0,Math.abs(rsXVal)>0.15?rsXVal*18:0)}\n  }\n\n  // 버튼 8(Back) = 전체 첫 항목  버튼 9(Start) = 전체 마지막 항목\n  const b8=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);\n  const b9=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);\n  if(b8&&!_gpUIPrev.b8)_gpUIIdx=0;\n  if(b9&&!_gpUIPrev.b9)_gpUIIdx=items.length-1;\n  _gpUIPrev.b8=b8;_gpUIPrev.b9=b9;\n}","pollCandidate":"function _pollGamepad(){\n  // 이벤트 의존 금지 — BT 재연결 시 gamepadconnected가 안 오는 경우가 있어 매 프레임 폴링으로 직접 감지 (index.html과 동일 방식)\n  const gps=navigator.getGamepads();\n  let _found=null;\n  for(let i=0;i<gps.length;i++){if(gps[i]&&gps[i].connected){_found=gps[i];break}}\n  if(_found&&!_gpConnected){_gpConnected=true;_gpVibRef=_found;console.log('[GAMEPAD] 폴링 감지:',_found.id);try{notify('🎮 패드 연결됨')}catch(e2){}}\n  if(!_found){\n    // 패드 사라짐 (BT 절전/블립) — 주입 키 즉시 해제, _gpActive는 유지 (재연결 시 패드모드 그대로 복귀)\n    if(_gpConnected){_gpConnected=false;_gpad=null;_gpClearAll();try{notify('🎮 패드 연결 끊김')}catch(e2){}}\n    return;\n  }\n  _gpad=_found;\n\n  // ── 1단계: 하드웨어 상태만 읽기 ──\n  let _anyInput=false;\n  for(let i=0;i<_gpad.buttons.length;i++){\n    const pressed=_gpad.buttons[i].pressed||_gpad.buttons[i].value>0.5;\n    _gpBtns[i]=pressed;\n    if(pressed)_anyInput=true;\n  }\n  _gpAxes[0]=Math.abs(_gpad.axes[0])<GP_DEAD?0:_gpad.axes[0];\n  _gpAxes[1]=Math.abs(_gpad.axes[1])<GP_DEAD?0:_gpad.axes[1];\n  if(_gpad.axes.length>=4){\n    _gpAxes[2]=Math.abs(_gpad.axes[2])<GP_DEAD?0:_gpad.axes[2];\n    _gpAxes[3]=Math.abs(_gpad.axes[3])<GP_DEAD?0:_gpad.axes[3];\n  }\n  // D-pad를 axes[6/7]로 전달하는 패드 (Firefox 표준, 일부 컨트롤러)\n  if(_gpad.axes.length>=8){\n    _gpAxes[6]=Math.abs(_gpad.axes[6])<0.5?0:_gpad.axes[6];\n    _gpAxes[7]=Math.abs(_gpad.axes[7])<0.5?0:_gpad.axes[7];\n  }\n  if(_gpAxes[0]||_gpAxes[1]||_gpAxes[2]||_gpAxes[3])_anyInput=true;\n  // 부스: 패드 입력(버튼 눌림 or GP_DEAD=0.25 초과 스틱)도 유휴 리셋 — 폴링 경로라 여기서 처리(키보드/마우스와 동일 변수 _boothIdle, 어트랙트 오전환 방지)\n  if(_anyInput&&_BOOTH_MODE)_boothIdle=0;\n\n  // ── 2단계: 입력 감지 → 패드모드 활성화 (드리프트/아날로그 잔압 무시 — 조이스틱 팬텀 자동전환 방지) ──\n  // 자동전환은 \"의도적 입력\"만 인정: 디지털 버튼 실제 press 또는 스틱 0.5 이상 큰 편향. (idle 스틱 드리프트/트리거 잔압으로 패드모드 켜지지 않게)\n  let _gpDeliberate=false;\n  for(let _di=0;_di<_gpad.buttons.length;_di++){if(_gpad.buttons[_di]&&_gpad.buttons[_di].pressed){_gpDeliberate=true;break}}\n  if(!_gpDeliberate&&(Math.abs(_gpAxes[0])>0.5||Math.abs(_gpAxes[1])>0.5||Math.abs(_gpAxes[2])>0.5||Math.abs(_gpAxes[3])>0.5))_gpDeliberate=true;\n  if(_gpDeliberate&&!_gpActive){_gpActive=true;document.body.style.cursor='none';C.style.cursor='none';}\n\n  // ── 3단계: 패드모드 아니면 K[]/MB[] 절대 안 건드림 ──\n  if(!_gpActive)return;\n  // [팬텀차단] 패드모드 재진입 첫 폴링: 이미 눌려있는(드리프트) 버튼을 prev에 스냅샷 → rising-edge 오인주입(ShiftLeft stuck) 방지\n  if(!_gpSynced){for(let _si=0;_si<_gpad.buttons.length;_si++)_gpBtnsPrev['k'+_si]=!!_gpBtns[_si];_gpSynced=true;}\n\n  // ── 3a단계: 컷씬 진행 중이면 A=advance, B=skip홀드, Start=즉시스킵 ──\n  if(typeof _cutsceneState!=='undefined'&&_cutsceneState==='INTRO_CUTSCENE'){\n    const _cA=!!_gpBtns[0],_cB=!!_gpBtns[1],_cSt=!!_gpBtns[9];\n    if(_cA&&!_gpBtnsPrev['_cutA'])_cutsceneAdvance();\n    if(_cB)_cutSkipHolding=true; else if(_gpBtnsPrev['_cutB'])_cutSkipHolding=false;\n    if(_cSt&&!_gpBtnsPrev['_cutSt'])_cutsceneEnd();\n    _gpBtnsPrev['_cutA']=_cA;_gpBtnsPrev['_cutB']=_cB;_gpBtnsPrev['_cutSt']=_cSt;\n    return;\n  }\n\n  // 통합 인트로는 자체 A/Start 입력을 사용한다. 설정창/전투 입력 누출 차단.\n  if(G&&G._intro){_gpClearAll();_gpBtnsPrev['_noUI9']=!!_gpBtns[9];return;}\n\n  // ── D-pad 패널 토글 (패널 닫혀있을 때만 — 열려있으면 네비게이션 전용) ──\n  {const _DP=[[12,'skillPanel','toggle'],[13,'forge','forge'],[14,'statPanel','toggle'],[15,'invPanel','storage']];\n  const _anyPanelOpen=!!document.querySelector('.panel.on');\n  for(const[bi,pid,act] of _DP){\n    const _on=!!(_gpad.buttons[bi]&&_gpad.buttons[bi].pressed);\n    if(_on&&!_gpBtnsPrev['_dpg'+bi]&&!_anyPanelOpen){\n      if(G&&G.on){\n        if(act==='toggle')togglePanel(pid);\n        else if(act==='forge'){if(G.forgeOpen){closePanel('forge');G.forgeOpen=false}else openPanel('forge')}\n        else if(act==='storage')openInventoryStorage()\n      }\n    }\n    _gpBtnsPrev['_dpg'+bi]=_on;\n  }}\n\n  // ── Start(b9) → 설정창 열기 (패널 없을 때만, 3.5단계 이전 — 오버레이에 막히지 않게) ──\n  {const _sn=!!(_gpad.buttons[9]&&_gpad.buttons[9].pressed);\n  if(_sn&&!_gpBtnsPrev['_noUI9']&&!document.querySelector('.panel.on')&&!(_gcEl&&_gcEl.classList.contains('on')))openPanel('settings');\n  _gpBtnsPrev['_noUI9']=_sn;}\n\n  // ── 3.5단계: UI 패널/오버레이 열려있으면 게임 입력 차단 + UI 네비게이션 ──\n  if(_gcEl&&_gcEl.classList.contains(\"on\")){_gpClearAll();_gpVCUpdate();_gpUINav(_gcEl);return;}\n  const _gpOpenPanel=document.querySelector('.panel.on');\n  const _gpOverlay=(()=>{\n    for(const id of['introDiff','introKeys','deathReplay','death','lvUpScreen','tutorial','stageClear','victory','stageTransition']){\n      const el=$(id);if(!el)continue;\n      if(el.classList.contains('on'))return el;\n      if(el.style.opacity==='1'&&el.style.pointerEvents==='all')return el;\n    }\n    return null;\n  })();\n  if(_gpOpenPanel||_gpOverlay){\n    _gpClearAll();\n    _gpVCUpdate(); // 좌스틱 → 가상 커서\n    // Back(b8) → 뒤로가기 (서브팝업 → 패널 순 닫기)\n    const _backNow=!!(_gpad.buttons[8]&&_gpad.buttons[8].pressed);\n    if(_backNow&&!_gpBtnsPrev['_back8']){\n      _gpBtnsPrev['_back8']=true;\n      const _gc=$('gcModal');const _sk=$('skSlotPop');const _cr=$('crBagPop');\n      if(_gc&&_gc.classList.contains('on')){const _cb=$('gcCancel');if(_cb)_cb.click();}\n      else if(_cr&&_cr.style.display==='flex'){closeCrystalPicker();}\n      else if(_sk&&_sk.style.display==='flex'){_closeSkPop();}\n      else{closeAllPanels();}\n      return;\n    }\n    _gpBtnsPrev['_back8']=_backNow;\n    // crBagPop 열려있으면 결정 주머니 전용 nav 우선\n    const _crPop=$('crBagPop');\n    if(_crPop&&_crPop.style.display==='flex'){_gpCrBagNav();return;}\n    if(_gpOpenPanel&&_gpOpenPanel.id==='invPanel'){_gpInvNav()}\n    else{_gpUINav(_gpOpenPanel||_gpOverlay)}\n    return;\n  }\n  _gpVCHide(); // 패널 닫히면 커서 숨김\n  _gpUIPrev.x=!!_gpBtns[2];\n  // UI 닫힌 후 outline 잔류 제거\n  if(_gpUIIdx>0||_gpInvIdx>0||_gpInvEqIdx>0){\n    document.querySelectorAll('[style*=\"outline\"]').forEach(el=>{if(el.style.outline){el.style.outline='';el.style.outlineOffset=''}});\n    _gpUIIdx=0;_gpInvIdx=0;_gpInvEqIdx=0;_gpInvMode='bag';\n  }\n\n  // ── 4단계: 버튼 → 키 주입 ──\n  // 조준 모드 판정 — LT 콤보보다 먼저 (조준 중 재발동 차단)\n  const _isAimMode=P&&(P._mmAiming||P._bwAiming||P._tsAiming||P._msAiming||P._isAiming||P._hrAiming);\n\n  // LT(6) = 모디파이어(홀드+ABXY=1234) / 탭(단독 뗄 때)=KeyF\n  const _ltVal=_gpad.buttons[6]&&_gpad.buttons[6].value||0;\n  const _ltHeld=_ltVal>0.7;\n  const _ltWasHeld=!!_gpBtnsPrev['kLT_held'];\n  const _LT_COMBO={0:'Digit1',1:'Digit2',3:'Digit3',2:'Digit4'}; // A=1,B=2,Y=3,X=4\n\n  // LT 모디파이어 사용 여부 추적\n  if(_ltHeld&&!_ltWasHeld)_gpBtnsPrev['kLT_mod']=false;\n  let _ltUsedAsModifier=!!_gpBtnsPrev['kLT_mod'];\n\n  if(_ltHeld){\n    for(const bi in _LT_COMBO){\n      const idx=+bi;\n      const comboKey=_LT_COMBO[bi];\n      const pressed=!!_gpBtns[idx];\n      const prevKey='kLT'+idx;\n      if(_isAimMode){\n        // 조준 중 버튼 릴리즈 → 발사\n        if(!pressed&&_gpBtnsPrev[prevKey]){MBjust[0]=true;G._gpAimDistReset=true;console.log('[GP-AIM] btn'+idx+' release → FIRE at dist='+G._gpAimDist+' mouse='+~~mouse.x+','+~~mouse.y)}\n        _gpBtnsPrev[prevKey]=pressed;continue;\n      }\n      if(pressed&&!_gpBtnsPrev[prevKey]){\n        _gpInjectKey(comboKey,true);_ltUsedAsModifier=true;_gpBtnsPrev['kLT_mod']=true;\n      }\n      if(!pressed&&_gpBtnsPrev[prevKey]){\n        _gpInjectKey(comboKey,false);\n      }\n      _gpBtnsPrev[prevKey]=pressed;\n    }\n  } else {\n    // LT 뗐을 때\n    for(const bi in _LT_COMBO){\n      const prevKey='kLT'+(+bi);\n      if(_gpBtnsPrev[prevKey]){_gpInjectKey(_LT_COMBO[bi],false);_gpBtnsPrev[prevKey]=false}\n    }\n    if(_ltWasHeld&&_isAimMode){\n      // 조준 중 LT 떼기 → 발사 (좌클릭) + 거리 리셋\n      MBjust[0]=true;G._gpAimDistReset=true;\n    } else if(_ltWasHeld&&!_gpBtnsPrev['kLT_mod']){\n      // 모디파이어 안 쓰였으면 → KeyF 탭\n      _gpInjectKey('KeyF',true);\n      setTimeout(()=>_gpInjectKey('KeyF',false),100);\n    }\n  }\n  _gpBtnsPrev['kLT_held']=_ltHeld;\n\n  // 나머지 버튼 주입\n  const _gpModFirst=[4,5,0,1,2,3,9,10,11]; // D-pad(12~15), Back(8) 제외 — Back은 전용 처리\n  for(let _mi=0;_mi<_gpModFirst.length;_mi++){\n    const idx=_gpModFirst[_mi];\n    const kc=_GP_KEY[idx];\n    if(!kc)continue;\n    // LT 홀드 중 ABXY(0~3)는 콤보로 처리 → 원래 키 차단\n    if(_ltHeld&&idx>=0&&idx<=3){\n      if(_gpBtnsPrev['k'+idx])_gpInjectKey(kc,false);\n      _gpBtnsPrev['k'+idx]=false;\n      continue;\n    }\n    const pressed=!!_gpBtns[idx];\n    const wasPrev=!!_gpBtnsPrev['k'+idx];\n    if(pressed&&!wasPrev){\n      if(idx===3&&G.on&&!G.paused){\n        if(P._gwActive){_finishGhostWalk();_gpBtnsPrev['k'+idx]=pressed;continue}\n        if(P._ioActive){activateIceShatter();_gpBtnsPrev['k'+idx]=pressed;continue}\n      }\n      _gpInjectKey(kc,true);\n    }\n    if(!pressed&&wasPrev)_gpInjectKey(kc,false);\n    _gpBtnsPrev['k'+idx]=pressed;\n  }\n\n  // [release-sync] 게임패드 주입 키의 falling-edge 유실 방지 — 엣지 아닌 '현재 레벨'로 강제 해제만 (누르기는 위 엣지 로직 유지)\n  for(var _ic in _gpInjHeld){\n    if(!_gpInjHeld[_ic])continue;\n    var _bi=_GP_KEYIDX[_ic];\n    if(_bi===undefined)continue;\n    if(!_gpBtns[_bi]){ _gpInjectKey(_ic,false); }\n  }\n\n  // RT→Z(필살기), LT+RT→X(처형)\n  const rt=_gpad.buttons[7]&&_gpad.buttons[7].value>0.7;\n  const ltrt=_ltHeld&&rt;\n  if(ltrt&&!_gpBtnsPrev['kLTRT']){\n    _gpInjectKey('KeyX',true);\n    if(_gpBtnsPrev['kRT']){_gpInjectKey('KeyZ',false);_gpBtnsPrev['kRT']=false}\n  }\n  if(!ltrt&&_gpBtnsPrev['kLTRT']){_gpInjectKey('KeyX',false)}\n  _gpBtnsPrev['kLTRT']=ltrt;\n  if(!ltrt){\n    if(rt&&!_gpBtnsPrev['kRT'])_gpInjectKey('KeyZ',true);\n    if(!rt&&_gpBtnsPrev['kRT'])_gpInjectKey('KeyZ',false);\n  }\n  _gpBtnsPrev['kRT']=rt&&!ltrt;\n\n  // 조준 모드: 포격식 (LT+버튼 홀드→거리증가, 스틱→방향, 릴리즈→발사)\n  if(_isAimMode){\n    // 스틱 방향 감지\n    const ax=_gpAxes[0],ay=_gpAxes[1];\n    const rx=_gpAxes[2],ry=_gpAxes[3];\n    const lMag=Math.sqrt(ax*ax+ay*ay);\n    const rMag=Math.sqrt(rx*rx+ry*ry);\n    const useR=rMag>lMag;\n    const sx2=useR?rx:ax, sy2=useR?ry:ay, mag=useR?rMag:lMag;\n    if(mag>0.15){\n      const _ang=Math.atan2(sy2,sx2);\n      const _snap=Math.round(_ang/(Math.PI/4))*(Math.PI/4);\n      P.facing=_snap;\n    }\n    // 포격 거리: LT+버튼 홀드 중 자동 증가 (0→1000)\n    if(!G._gpAimDist)G._gpAimDist=0;\n    // 지연 리셋: 발사 프레임에서는 좌표 유지, 다음 프레임에 리셋\n    if(G._gpAimDistReset===2){G._gpAimDist=0;G._gpAimDistReset=0}\n    if(G._gpAimDistReset===true)G._gpAimDistReset=2;\n    // LT+ABXY 중 하나라도 눌려있으면 거리 증가\n    const _anyAimBtn=(_ltHeld&&(_gpBtns[0]||_gpBtns[1]||_gpBtns[2]||_gpBtns[3]));\n    if(_anyAimBtn){G._gpAimDist=Math.min((G._gpAimDist||0)+18,1000)}\n    // 마우스 좌표를 플레이어+facing 방향×거리로 세팅\n    const scx=P.x-G.cam.x+VW/2, scy=P.y-G.cam.y+VH/2;\n    mouse.x=scx+Math.cos(P.facing)*(G._gpAimDist||0);\n    mouse.y=scy+Math.sin(P.facing)*(G._gpAimDist||0);\n    G._gpAiming=true;\n  }else{\n    // 비조준: 우스틱→방향+마법 자동발동 (트윈스틱)\n    let rx=_gpAxes[2],ry=_gpAxes[3];\n    // 아케이드스틱 등 우스틱 없는 패드: 좌스틱과 독립 움직임이 감지된 적 없으면 무시\n    if(!_gpHasRStick){\n      if((rx||ry)&&(rx!==_gpAxes[0]||ry!==_gpAxes[1]))_gpHasRStick=true;\n      else{rx=0;ry=0}\n    }\n    const rMag=Math.sqrt(rx*rx+ry*ry);\n    const _rsWas=!!_gpBtnsPrev['kRS'];\n    if(rMag>0.2){\n      P.facing=Math.atan2(ry,rx);\n      G._gpAiming=true;\n      if(!_rsWas)_gpInjectKey('mouse2',true); // 스틱 기울이면 마법키(우클릭) 누름\n    }else{\n      G._gpAiming=false;\n      if(_rsWas)_gpInjectKey('mouse2',false); // 스틱 놓으면 마법키 해제\n    }\n    _gpBtnsPrev['kRS']=rMag>0.2;\n  }\n\n  // 좌스틱 → WASD (조준 모드가 아닐 때만 이동)\n  const su=!_isAimMode&&_gpAxes[1]<-GP_DEAD,sd=!_isAimMode&&_gpAxes[1]>GP_DEAD,sl=!_isAimMode&&_gpAxes[0]<-GP_DEAD,sr=!_isAimMode&&_gpAxes[0]>GP_DEAD;\n  const _stickMap=[['sU','KeyW',su],['sD','KeyS',sd],['sL','KeyA',sl],['sR','KeyD',sr]];\n  for(let _si=0;_si<4;_si++){\n    const[pk,kc,on]=_stickMap[_si];\n    const was=!!_gpBtnsPrev[pk];\n    if(on&&!was){K[kc]=true;const ev=new KeyboardEvent('keydown',{code:kc,key:kc,bubbles:true});ev._fromGp=true;document.dispatchEvent(ev)}\n    if(!on&&was){K[kc]=false;const ev=new KeyboardEvent('keyup',{code:kc,key:kc,bubbles:true});ev._fromGp=true;document.dispatchEvent(ev)}\n    _gpBtnsPrev[pk]=on;\n  }\n}","pollAnchor":"  _gpVCHide(); // 패널 닫히면 커서 숨김","anchor":"  _gpUIPrev.a=a;_gpUIPrev.b=b;_gpUIPrev.y=y;\n\n  // ── 우측 스틱:","before":{"mode":"source","rangeRoute":true,"trace":[{"type":"cursorUpdate"},{"type":"scroll"},{"type":"minusAction"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"minusAction"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"minusAction"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"minusAction"},{"type":"hideCursor"},{"type":"renderSkill"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"minusAction"}],"minusActions":5,"releasedPreviousX":false},"snapshotOnly":{"mode":"snapshotOnly","rangeRoute":true,"trace":[{"type":"cursorUpdate"},{"type":"scroll"},{"type":"minusAction"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"minusAction"},{"type":"hideCursor"},{"type":"renderSkill"},{"type":"cursorUpdate"},{"type":"scroll"}],"minusActions":2,"releasedPreviousX":true},"after":{"mode":"complete","rangeRoute":true,"trace":[{"type":"cursorUpdate"},{"type":"scroll"},{"type":"minusAction"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"minusAction"},{"type":"hideCursor"},{"type":"renderSkill"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"minusAction"}],"minusActions":3,"releasedPreviousX":false},"normalBefore":{"mode":"source","rangeRoute":false,"trace":[{"type":"cursorUpdate"},{"type":"scroll"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"hideCursor"},{"type":"hideCursor"},{"type":"keydown","code":"KeyE","fromGp":true},{"type":"hideCursor"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"renderSkill"},{"type":"cursorUpdate"},{"type":"scroll"}],"minusActions":0,"releasedPreviousX":false},"normalAfter":{"mode":"complete","rangeRoute":false,"trace":[{"type":"cursorUpdate"},{"type":"scroll"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"cursorUpdate"},{"type":"scroll"},{"type":"hideCursor"},{"type":"hideCursor"},{"type":"keydown","code":"KeyE","fromGp":true},{"type":"hideCursor"},{"type":"keyup","code":"KeyE","fromGp":true},{"type":"renderSkill"},{"type":"cursorUpdate"},{"type":"scroll"}],"minusActions":0,"releasedPreviousX":false}}],"productionApplied":false,"runtimeAccepted":false,"newFiles":0,"realFunctions":["_pollGamepad","_gpUINav"],"doubles":["navigator hardware pad","DOM range/layout/selector/event","G/C/state","game-input clear/cursor update sinks","performance clock"],"scope":"deeper source wiring regression: full _gpClearAll/_gpInjectKey and actual mapping declarations/rebuild; compound skill X hold/reopen edges plus no-UI X→KeyE down/up normal control equal; DOM KeyboardEvent terminal sink"}

```

### hold-only docs rg receipt

```text
{
  "startedUTC": "2026-10-02T13:17:21.227Z",
  "endedUTC": "2026-10-02T13:17:21.250Z",
  "command": [
    "rg",
    "-n",
    "_gpUIPrev\\.x|X.*레벨다운|X.*취소|패드.*레벨.*다운|게임패드.*레벨.*다운",
    "docs/"
  ],
  "exitCode": 0,
  "matchLines": 22,
  "files": [
    "docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md",
    "docs/2_1 스킬관리+합체시스템+자원/SKILL03_설치확정_자원검수_20261001.md",
    "docs/2_1 스킬관리+합체시스템+자원/MALICE_STORM_FOCUS_CANCELLATION_20261002.md",
    "docs/0마스터플랜/MAC_AGENT_DASHBOARD.md",
    "docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md",
    "docs/CHANGELOG_SYNC.md",
    "docs/2_4 펫시스템/PET_FIRST_ITEM_ACCEPTANCE_FALLTHROUGH_20261002.md",
    "docs/2_4 펫시스템/대사_스크립트.md",
    "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/MILESTONE-CH1-1-PLAYABLE-20261002.md",
    "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_LOG.md",
    "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/SKILL-result.md",
    "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/FOLLOWUP_RECEIPT.md",
    "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_STATE.json",
    "docs/3.1 ui hud 디자인/lobby_full_patch.md",
    "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md",
    "docs/3.1 ui hud 디자인/GEM_ATELIER_20260927.md",
    "docs/2_9 결정슬롯시스템/2_9 결정슬롯시스템.md"
  ],
  "stdoutSHA256": "10187b15aca5249b8f1e98068e827e125dd2fe9787b5a52d084f2b8857f8c600",
  "stdout": "docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md:270:| 재현 | 패드 X가 삭제 버튼 click을 프로그램으로 실행하면 기존 DOM 초점이 언어 메뉴 등에 남아 취소 후 엉뚱한 메뉴로 복귀 |\ndocs/2_1 스킬관리+합체시스템+자원/SKILL03_설치확정_자원검수_20261001.md:98:| 정상/거절 | 실제 GP LT+ABXY/주입키/등록callback/dispatcher/aim/fire/_malCost 체인, KBM 키즉발의 정상 대조4동등. visible미취소·RMB우선취소·악의5/stock0 확정gate·null P/멱등/다른family sentinel/반복입력 관측 |\ndocs/2_1 스킬관리+합체시스템+자원/MALICE_STORM_FOCUS_CANCELLATION_20261002.md:51:| 취소 후 다음 추출 프레임 | 추가 zone/wall·MP/악의 차감·CD·RNG·SFX/텍스트/숙련도 기록 0 | 진입 후 취소 직전 효과를 기준으로 비교 |\ndocs/0마스터플랜/MAC_AGENT_DASHBOARD.md:77:| EXODUSER-Mac-SKILL<br>claude-opus-4-8<br>ID `b9eeea10` · PID 32523 (ps 확인) | SKILL / iceStorm 취소 후보 | 이번 검토 제출 완료 | idle/done · end_turn<br>2026-10-01T07:09:53.961Z (UTC) | [산출](/Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/teams/SKILL.md)<br>중복 설치·판정 조건 수정 선행 |\ndocs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md:412:기존 SKILL b9eeea10·UIUX 4b78d932·ANIMVFX 720a6335의 최근 상태/마지막 수신을 먼저 읽고 같은 세션에 미완료 한 건씩 실제 전송했다. 끊긴 PTY는 공식 attach로 기존 세션만 재연결했다. 세 팀 모두 Read/Glob/Grep 착수·최종 보고 완료, 공용 HTML 수정0. SKILL=확정/취소10시나리오·기존16회귀 대조; UIUX=실제 밀집 캡처·상단 상태 스트립 대비 후보1건; ANIMVFX=플래시4영역·GL60/고주사율/부활6시나리오 대조. 신규 실플레이 완료로 세지 않는다. 최대 활성 총괄 포함4, 게임1개, 신규팀0. SOUND/ITEM/BALANCE 직전 완료 검토는 반복하지 않았다. ART/ENEMY/BUILD 등 다음 게이트 상태는 유지한다.\ndocs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md:630:ITEM→ENEMY tick, UIUX→ART 최종crop, BALANCE→SKILL 충전증거 후보를 인수했다. BUILD 독립31PASS/2FAIL의 취소ID·getter처리 반례를 root가 지원 후보에서 수정, 동일 독립검사33PASS. 원실패·원담당소스 보존, 생산변경0. 세지원 제출완료이며 실제 tick/trace/픽셀은 미검수. 다음은 첫처치·밀집 정상전투 단독측정. [근거·운영상태](mac-resume-20261001/vscode-dispatch/SUPPORT-root-review.md).\ndocs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md:761:사용자 각 팀 업무 배정 지시에 따라 tools/team-followup-20261002/project-teams/의 task.md11개에 기존 승인 백로그 한 건씩과 소유 파일·검수 조건을 지정했다. ART emg1 LOCK, MAP M5 도달성, SKILL mortar 생산회귀, UIUX 패널초점, ITEM D13 통합지도, SOUND 실제획득 SFX 연결계약, QA 독립host 실제인수, ENEMY 예고취소, BUILD 패키지source delta, BALANCE 공유악의 생산/오류응답 인수계획, ANIMVFX foot-shadow anchor다. 공유 생산코드 적용은 총괄 순차 인수이며 팀별 소유 새 산출은 최대3개다. BUILD 소유폴더는 build/ 무시 규칙의 Mac 대소문자 영향을 피하도록 BUILD_TEAM을 사용한다. QA 유일UI슬롯은 root3340 기동/응답 확인 뒤 별도 release한다. 실제 전송/Read/착수는 PROJECT-TEAM-CHATS-20261002.json 후속 receipts에 기록한다.\ndocs/CHANGELOG_SYNC.md:706:| 설계·밸런스·VFX 문서 | [기검참 홀드 계약](2_1%20스킬관리+합체시스템+자원/KISLASH_HOLD_CHARGE_20260927.md)에 시간·공식·표시·취소를 기록하고 스킬·피해·VFX 표를 동기화 | 코드/문서 키워드 검색 |\r\ndocs/CHANGELOG_SYNC.md:50781:| 재현 | 패드 X가 삭제 버튼 click을 프로그램으로 실행하면 기존 DOM 초점이 언어 메뉴 등에 남아 취소 후 엉뚱한 메뉴로 복귀 |\r\ndocs/2_4 펫시스템/PET_FIRST_ITEM_ACCEPTANCE_FALLTHROUGH_20261002.md:31:| 수락 의미 | 선발 상태 설정·표시/SFX 호출과 후발 pair 예약 뒤 helper true | sink 대역에서 관측한 수락이다. 실제 DOM 표시·cat 완료·청취·취소 재생 완료를 뜻하지 않음 |\ndocs/2_4 펫시스템/대사_스크립트.md:603:| 검수·보존 | 양판 새10/10; 정상 post-call 상태·sink 인수/순서 동등. 표시/SFX 중 flag 관측은 동등성 범위 밖 | 기존검사 반복0. 다른 tutorial 선소비/return·pair 취소재생·장기경쟁 및 실제DOM/audio/save/native 미검수 |\ndocs/0마스터플랜/mac-resume-20261001/vscode-dispatch/MILESTONE-CH1-1-PLAYABLE-20261002.md:12:| 2 | 실제 공격·입력·피격·처치·획득·장비 선택이 연결됨 | SKILL/ENEMY/ANIMVFX/UIUX/ITEM/BALANCE/SOUND. 입력 취소·자원 차감·아이템 identity·표시·효과·소리의 실제 흐름을 같은 후보에서 확인 |\ndocs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_LOG.md:165:Codex7 공식새완료turn/error0 +Claude5 새end_turn과소유23원문/SHA읽어검수. 검수된root소유rawmanifest완성·marker12, 검사재실행0. 후보/NOFIX/latent/model/nativeGate를구분. STORY fullteardown 미연결HOLD 피드백필요. ANIM actualpolicyRead13번째성공은UI취소성공증거가아니며 root교정한실제질문·기존사용자요청대기보존. ENEMY classifier거부이력/currentAPI재시도구분·우회0. 실제Changes91에서원총괄hb1014b raw14checkpoint중이며새23은별도보존인계.\ndocs/0마스터플랜/mac-resume-20261001/vscode-dispatch/SKILL-result.md:3:작업 ID: `SKILL-03-OBSERVER-FIX` · 제목: iceStorm 설치·취소 관측 후보 보강\ndocs/0마스터플랜/mac-resume-20261001/vscode-dispatch/FOLLOWUP_RECEIPT.md:91:Native 목록에는 앱이 나왔으나 입력 복구를 뜻하지 않았다. ENEMY 빈 프롬프트를 확인한 뒤 입력은 `noWindowsAvailable`·붙여넣기 시간 초과·키 입력 후 화면 미갱신을 보였고 JSONL 새 user/Read가 없다. AX에 열린 터미널 이름 편집은 Escape를 보냈지만 취소 확인이 안 됐으며 이름 변경 커밋은 미확인이다. 사용자 초안 전송/삭제0. ENEMY·ART·SKILL은 미전달로 유지하고 ART/SKILL의 구체적인 FIX_TASK만 준비했다. 숨은 TTY·새 세션·전원/잠금 설정 변경0. BUILD EPERM은 유지하며 실제 게임 QA 입력 복구도 미확인이다.\ndocs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_STATE.json:4848:        \"publicText\": \"배정된 다음 한 건(`SKILL-hellray-focus-cancellation-hb1014`)을 완료했습니다. 한국어 보고입니다.\\n\\n## 완료 보고 — 참회(hellRay) 조준 포커스 취소 경계\\n\\n**대상:** hellRay 조준 플래그 `_hrAiming`이 `_clearHeldInput`의 held clear에서 제외된 건. mortar/storm 결과는 **재실행 0**으로 인수만 했습니다.\\n\\n**결함 형태(mortar/storm과 다름):** hellRay는 level 기반 합성 release가 아니라 **LMB edge(`MBjust[0]`) 발사**입니다. 따라서 blur가 `MBjust`를 비우면 \\\"즉시 유령발사\\\"는 없지만, **`_hrAiming`이 취소되지 않아 조준 모드가 blur/hidden을 관통**합니다 → 복귀 후 플레이어가 평타로 누른 **다음 LMB가 참회 설치로 가로채입니다**(MP-100·`_hrStk`-1·zone·쿨 600).\\n\\n### 대조 결과 (Node v24.15.0, exit 0)\\n| 변형 / 시나리오 | `_hrAiming` clear후 | fired | MPΔ | `_hrStk`Δ | 쿨 | LMB after | 판정 |\\n|---|---|---|---|---|---|---|---|\\n| current / 정상 LMB | — | T | 100 | 1 | 600 | 소비 | 기준 |\\n| candidate / 정상 LMB | — | T | 100 | 1 | 600 | 소비 | **CONTROL_EQUIV=PASS** |\\n| current / blur→LMB | **true(sticky)** | **T** | **100** | **1** | **600** | **소비** | **CURRENT_DEFECT=FAIL** |\\n| candidate / blur→LMB | **false(취소)** | **F** | **0** | **0** | **0** | **보존** | **CANDIDATE_FIX=PASS** |\\n\\n1. **정상 control 동등:** 조준 중 LMB→참회 발사가 두 변형 완전 동일(MP-100·stk-1·zone·쿨·RNG·LMB 소비).\\n2. **결함 실재:** blur 후 조준 잔존 → 다음 LMB가 참회로 소비(평타로 못 감), 비용·쿨 발생.\\n3. **후보 수정:** guard에 `_hrAiming=false` 추가 → 조준만 취소, **LMB 보존(평타로 전달)·참회 미설치·MP/stk/쿨/zone/RNG 전부 불변**.\\n\\n### 최소 후보 (미적용)\\n`_clearHeldInput` 12883 기존 P guard에 **`P._hrAiming=false` 한 줄만** 추가. `_mm/_ms`는 root 기통합(미수정). MP/ST/충전/`_hrStk`/CD/zone/숙련/RNG·보호 2_3·패링·합체수치 **불변**. root의 `_skUnclick`/스킬카드 작업은 재현·소유 제외.\\n\\n### docs 인계 (미적용, root canonical)\\n- `2_1 스킬관리+합체시스템.md:229/408` hellRay 조작 계약에 포커스 취소 경계 각주.\\n- 정본 `MALICE_STORM_FOCUS_CANCELLATION_20261002.md`에 **hellRay 항목 추가 권고**(LMB edge 변형 결함).\\n- **잔여 동형 대상 플래그**(`_bwAiming/_tsAiming/_isAiming/_ebAiming`도 조준군·`_clearHeldInput` 미포함)는 별건 검토 권고 — **자체 배정하지 않음**.\\n\\n### 제약 준수\\n- **소유 2파일만:** `result.md`(evidence·해시·영수증 인라인 포함)·`checks.mjs`. 별도 evidence.json 안 만듦.\\n- 실행 영수증: exit 0, 하니스 예외 없음, 결정적 seed로 재현 가능. SHA 앵커 `game.html=8b4653f3…`(본인 Read 시점), `checks.mjs=1308eca6…`.\\n- production·공유docs·Git(조회 포함)·실게임·빌드·이미지·삭제·새 세션/팀 **0**. 이전 검사 재실행 0. Changes 41(80 체크포인트 미도달).\\n- `productionApplied=false`, **source/fixture PASS ≠ 실게임/native/청취/GPU/맵 visual/배포 PASS**. 실입력·음향·시각 Gate는 QA 미검수.\\n\\n**블로커 없음.** 이 한 건만 수행했고 자체 다음 건은 배정하지 않았습니다. 감독 검수 후 root 통합·canonical 인계 대기입니다.\"\ndocs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_STATE.json:4992:            \"publicText\": \"보류했던 인계물을 저장 완료했습니다. 한국어 보고입니다.\\n\\n## 저장 완료 — boneWall `_bwAiming` 동적추출 검증 (epoch `capacity-after-8c317a73-1134`)\\n\\n용량 해제(`allowNewOwnedFiles=true`, Changes 68)를 인수하여, 보류 중이던 **감독 STATE `nextByRole.SKILL`** 인계물을 새 고유 폴더에 **2파일(result.md + checks.mjs)**로 저장했습니다. **재실행 없이** 용량 해제 전 스크래치패드 실행의 원 stdout·명령·SHA를 그대로 인계했습니다.\\n\\n### 저장물 요지\\n- **방법:** 이전 hand-copy가 아니라 **game.html·game-easy-test.html 디스크 바이트를 brace-match 동적 추출 → SHA-256 해시 → `new Function` 실행** → hand-copy가 남긴 **source-extraction 회귀 Gate 해소**.\\n- **양판 provenance(parity=true):** `_clearHeldInput` `1fc97dca…`(410B) / `fireBoneWall` `6c59ddc5…`(922B) / boneWall aim 블록 `43ace365…`(437B) — 모두 game.html==game-easy-test.html byte-identical. (game.html 파일 SHA는 `569e8def…`로 root WIP 변동 중이었으나 슬라이스는 안정.)\\n- **판정:** CONTROL_EQUIV=**PASS** / CURRENT_DEFECT=**FAIL(재현)** / CANDIDATE_FIX=**PASS**.\\n  - 결함: blur 뒤 `_bwAiming` sticky → 다음 LMB 가로채기(악의-12·`_bwStk`-1·쿨1500, LMB 소비).\\n  - 후보: 실제 `_clearHeldInput` 텍스트에 `;P._bwAiming=false`만 결정적 삽입(`clearCandidate` `e5349553…`) → 조준 취소·LMB 보존·악의/stk/쿨/RNG 불변.\\n  - **boneWall 한정:** KBM은 키 즉발(`_bwAiming` 미사용) → 결함은 **게임패드 조준 모드에서만**.\\n\\n### 준수\\n- 이 epoch 저장 **1회·2파일** 한정 준수(폴더에 checks.mjs+result.md만). 성공근거 재실행 0 — 원 stdout/SHA 그대로 인계.\\n- 기존 원자료/production/shared docs/Git/사용자게임 **보존**. mortar/storm/hellRay 기존검사 반복 0, 비용/자원 정책 변경 0. 권한/모드 변경·Ask 응답대행 **안 함**, 정책 반복송신 **안 함**.\\n- `productionApplied=false`. **source/fixture PASS ≠ native/시각/청취/실게임 PASS** — boneWall은 게임패드 입력 실게임 Gate 미검수.\\n\\n### 상태\\n조준-플래그 포커스 취소 가족(mortar/storm/hellRay/iceStorm/boneWall/thunderStake)은 **동적추출 provenance Gate까지 포함해 조사 완결**(`_ebAiming` 미사용 제외 확인). 추가 독립 업무는 감독 STATE `nextByRole.SKILL` 갱신 또는 새 capacity epoch에서 메모리로 이어가고, 추가 저장은 다음 epoch에 하겠습니다. 현재 epoch에서는 저장 한도(1회/2파일)를 다 썼으므로 새 파일 생성을 멈춥니다.\"\ndocs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_STATE.json:5289:          \"publicText\": \"보류했던 인계물을 저장 완료했습니다. 한국어 보고입니다.\\n\\n## 저장 완료 — boneWall `_bwAiming` 동적추출 검증 (epoch `capacity-after-8c317a73-1134`)\\n\\n용량 해제(`allowNewOwnedFiles=true`, Changes 68)를 인수하여, 보류 중이던 **감독 STATE `nextByRole.SKILL`** 인계물을 새 고유 폴더에 **2파일(result.md + checks.mjs)**로 저장했습니다. **재실행 없이** 용량 해제 전 스크래치패드 실행의 원 stdout·명령·SHA를 그대로 인계했습니다.\\n\\n### 저장물 요지\\n- **방법:** 이전 hand-copy가 아니라 **game.html·game-easy-test.html 디스크 바이트를 brace-match 동적 추출 → SHA-256 해시 → `new Function` 실행** → hand-copy가 남긴 **source-extraction 회귀 Gate 해소**.\\n- **양판 provenance(parity=true):** `_clearHeldInput` `1fc97dca…`(410B) / `fireBoneWall` `6c59ddc5…`(922B) / boneWall aim 블록 `43ace365…`(437B) — 모두 game.html==game-easy-test.html byte-identical. (game.html 파일 SHA는 `569e8def…`로 root WIP 변동 중이었으나 슬라이스는 안정.)\\n- **판정:** CONTROL_EQUIV=**PASS** / CURRENT_DEFECT=**FAIL(재현)** / CANDIDATE_FIX=**PASS**.\\n  - 결함: blur 뒤 `_bwAiming` sticky → 다음 LMB 가로채기(악의-12·`_bwStk`-1·쿨1500, LMB 소비).\\n  - 후보: 실제 `_clearHeldInput` 텍스트에 `;P._bwAiming=false`만 결정적 삽입(`clearCandidate` `e5349553…`) → 조준 취소·LMB 보존·악의/stk/쿨/RNG 불변.\\n  - **boneWall 한정:** KBM은 키 즉발(`_bwAiming` 미사용) → 결함은 **게임패드 조준 모드에서만**.\\n\\n### 준수\\n- 이 epoch 저장 **1회·2파일** 한정 준수(폴더에 checks.mjs+result.md만). 성공근거 재실행 0 — 원 stdout/SHA 그대로 인계.\\n- 기존 원자료/production/shared docs/Git/사용자게임 **보존**. mortar/storm/hellRay 기존검사 반복 0, 비용/자원 정책 변경 0. 권한/모드 변경·Ask 응답대행 **안 함**, 정책 반복송신 **안 함**.\\n- `productionApplied=false`. **source/fixture PASS ≠ native/시각/청취/실게임 PASS** — boneWall은 게임패드 입력 실게임 Gate 미검수.\\n\\n### 상태\\n조준-플래그 포커스 취소 가족(mortar/storm/hellRay/iceStorm/boneWall/thunderStake)은 **동적추출 provenance Gate까지 포함해 조사 완결**(`_ebAiming` 미사용 제외 확인). 추가 독립 업무는 감독 STATE `nextByRole.SKILL` 갱신 또는 새 capacity epoch에서 메모리로 이어가고, 추가 저장은 다음 epoch에 하겠습니다. 현재 epoch에서는 저장 한도(1회/2파일)를 다 썼으므로 새 파일 생성을 멈춥니다.\"\ndocs/3.1 ui hud 디자인/lobby_full_patch.md:733:| 재현 | 패드 X가 삭제 버튼 click을 프로그램으로 실행하면 기존 DOM 초점이 언어 메뉴 등에 남아 취소 후 엉뚱한 메뉴로 복귀 |\ndocs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md:2010:| 재현 | 패드 X가 삭제 버튼 click을 프로그램으로 실행하면 기존 DOM 초점이 언어 메뉴 등에 남아 취소 후 엉뚱한 메뉴로 복귀 |\ndocs/3.1 ui hud 디자인/GEM_ATELIER_20260927.md:31:보석을 클릭 또는 드래그로 호환 빈 홈에 실제 장착하면 `attachCrystal`의 공통 성공 지점에서 `SFX.crystalEquip()`이 한 번 재생된다. 취소·비호환·이미 찬 홈·탈착에는 재생하지 않는다. 기존 0.48초 `equip_rare` 파일의 짧은 금속 안착 소리와 마찰·상승/하강 공명을 결합했으며 게임 효과음 볼륨을 따른다. 생성형 SFX 연결 상태와 레이어 수치는 [보석 장착 효과음](../6사운드디자인/보석_장착음_20260927.md)에 기록했다.\ndocs/2_9 결정슬롯시스템/2_9 결정슬롯시스템.md:9:`attachCrystal`이 호환 부위·빈 홈 검증을 통과하고 보유 목록에서 보석 1개를 옮긴 직후 `SFX.crystalEquip()`을 한 번 호출한다. 클릭 장착과 드래그 장착이 같은 성공 경로를 사용한다. 실패·취소·탈착은 이 소리를 재생하지 않는다. 기존 사운드 마스터와 효과음 음량 설정을 따른다.\n",
  "stderr": ""
}
```

### reopen compound docs rg receipt

```text
{
  "startedUTC": "2026-10-02T13:20:43.053Z",
  "endedUTC": "2026-10-02T13:20:43.091Z",
  "command": [
    "rg",
    "-n",
    "_gpUIPrev|패널.*입력.*해제|닫힌.*패드|패드.*재열",
    "docs/"
  ],
  "exitCode": 0,
  "matchLines": 2,
  "files": [
    "docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md",
    "docs/16번역·로컬라이제이션/STEAM_LANGUAGE_RESUME_20260921.md"
  ],
  "stdoutSHA256": "762b26279b33ff2fc19f956067da87b86d15cdee4f3f202ac20ff2f8daf4d157",
  "stdout": "docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md:48:| 패널 단축키 | ESC/TAB/K/G 등 입력을 처리해 대상 패널을 열고 `G.paused=true`로 전환 | 같은 입력을 먼저 처리해 패널 전환·닫기 및 일시정지 해제를 허용 | `game.html` `update()` 초입 |\r\ndocs/16번역·로컬라이제이션/STEAM_LANGUAGE_RESUME_20260921.md:28:- tools/test-system-lesson.cjs: 실제 획득/장착 성공·실패, 자동 회복, 퍼즈 중 패널, 키 재지정, 입력 해제 전달, 양쪽 HTML 구문 검사 통과.\n",
  "stderr": ""
}
```

### final full wiring docs rg receipt

```text
{
  "startedUTC": "2026-10-02T13:22:15.310Z",
  "endedUTC": "2026-10-02T13:22:15.340Z",
  "command": [
    "rg",
    "-n",
    "_gpSynced|_gpInjectKey|패드.*X.*KeyE|KeyE.*패드.*X",
    "docs/"
  ],
  "exitCode": 0,
  "matchLines": 8,
  "files": [
    "docs/3.3 키바인딩+설정/MONICA_UNTRUSTED_EVENT_20260910.md",
    "docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md",
    "docs/3.3 키바인딩+설정/게임패드_트러블슈팅.md",
    "docs/2_1 스킬관리+합체시스템+자원/MALICE_STORM_FOCUS_CANCELLATION_20261002.md",
    "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/CONTINUOUS-INTEGRATION-20261002.md",
    "docs/2_1 스킬관리+합체시스템+자원/BONEWALL_FOCUS_CANCELLATION_20261002.md"
  ],
  "stdoutSHA256": "f743d1cfe702f81a66b6091083804ec3de1cf789b37df8d20a948c5714c168cd",
  "stdout": "docs/3.3 키바인딩+설정/MONICA_UNTRUSTED_EVENT_20260910.md:14:확장 ID `ofpnmcalabcbjgholdjcjblkibolbppb`는 Monica로 식별된다([확장 메타데이터](https://extpose.com/ext/ofpnmcalabcbjgholdjcjblkibolbppb)). 게임의 `_gpInjectKey`와 좌스틱 WASD 전달은 `new KeyboardEvent`에 `_fromGp=true`를 붙이고 `document.dispatchEvent`로 전달한다. 해당 합성 이벤트의 `isTrusted=false`이며 Monica가 예외를 발생시킨다. `_fromGp`는 게임 내부 식별 플래그로, 브라우저가 부여하는 `isTrusted`와 별개다.\ndocs/3.3 키바인딩+설정/3.3 키바인딩+설정.md:85:- 패드 UX는 무변경 — 실제 패드는 `_GP_KEY` **키코드 주입** 방식(`GP_BINDS`는 미사용 레거시)이라 주입 코드를 함께 스왑: X버튼 `mouse2→KeyE`(칼등 유지), R3·우스틱 `KeyE→mouse2`(마법 유지), 저장된 `gpKeyMap`도 구 기본값이면 자동 마이그레이션. `_padifyHint` 글리프: '우클릭'(마법)→RS, 'E'(칼등)→Ⓧ. `keyName` 패드표시 mouse2→RS, 스킬바 키캡(`_SK_SLOTS`) kc 스왑(X=KeyE, RS=mouse2). 마법 홀드 해제(`_beamHold`)도 바인드 기반으로 변경(키보드 keyup + mouseup 양쪽)\r\ndocs/3.3 키바인딩+설정/3.3 키바인딩+설정.md:631:| GP LT+ABXY | 실제 `_gpInjectKey` 및 LT modifier 경계, `MBjust[0]` 기반 release | `navigator.getGamepads`·전체 `_pollGamepad`·실기기·연결 전환 |\r\ndocs/3.3 키바인딩+설정/게임패드_트러블슈팅.md:75:| 키 주입 | `_gpInjectKey()` — `K[]`/`MB[]` 세팅 + 합성 KeyboardEvent(`_fromGp=true` 플래그) | 매핑: `_GP_KEY` (localStorage `gpKeyMap` 오버라이드 가능) |\ndocs/2_1 스킬관리+합체시스템+자원/MALICE_STORM_FOCUS_CANCELLATION_20261002.md:98:새 검사는 디스크에서 선택 gameplay keydown/keyup·등록 blur/hidden 콜백·`_dispatchSkillSlot`·`_clearHeldInput`·`_isFused`·`_r`·`EL`·`_gpInjectKey`·GP LT modifier/ABXY 경계·전체 storm aim/release if를 추출한다. update if를 `frame(sp)`, LT 경계문을 `padBoundary()`로 감싼다. 음성대조는 같은 원문 메모리에서 추가된 storm 2문장만 제거한다.\ndocs/0마스터플랜/mac-resume-20261001/vscode-dispatch/CONTINUOUS-INTEGRATION-20261002.md:119:| 입력 경계 | 등록 gameplay keydown/keyup·router·actual GP LT/ABXY block·_gpInjectKey 원문 추출 | KeyboardEvent/DOM/document.hidden/pad/eligibility/damage/audio 대역, 전체poll/update 미실행 |\ndocs/2_1 스킬관리+합체시스템+자원/BONEWALL_FOCUS_CANCELLATION_20261002.md:8:| 입력 체인 | 실제 선택 GP LT+ABXY→`_gpInjectKey` KeyboardEvent→등록 gameplay keydown→`_dispatchSkillSlot`→boneWall aim. aim=true를 직접 seed한 ingress 모형 아님 |\ndocs/2_1 스킬관리+합체시스템+자원/BONEWALL_FOCUS_CANCELLATION_20261002.md:10:| blur/hidden 뒤 fresh confirm | 등록callback→helper에서 aim false. 이후 실제 `_gpInjectKey(mouse0,true)` 새확정에도 선택block 추가 wall·악의/stock/rech·RNG·숙련·audio/presentation sink0, MBjust[0] true 유지. native mouse/전체update 판정 아님 |\n",
  "stderr": ""
}
```

### source/renderer limitations

```text
{
  "actualFunctions": [
    "_pollGamepad",
    "_gpUINav",
    "_gpInjectKey",
    "_gpClearAll",
    "_rebuildGpKeyIdx",
    "openPanel",
    "closeAllPanels",
    "_injectPanelNav"
  ],
  "sourceDeclarations": [
    "_PANEL_TABS",
    "_GP_KEY_DEFAULT",
    "_GP_KEY",
    "_GP_KEYIDX",
    "_gpInjHeld"
  ],
  "doubles": [
    "DOM layout/query, pointer and panel/card fixtures",
    "hardware pad/clock/cursor update",
    "minus action and skill renderer",
    "KeyboardEvent DOM terminal dispatch sink"
  ],
  "native": false,
  "fullGameSkillMutations": false,
  "sourceLevelKeyInjectionNormalControl": {
    "KeyEkeydown": 1,
    "KeyEkeyup": 1,
    "equal": true
  },
  "candidateRegressionSuperseded": true
}
```

### checks/raw stdout original pins

```text
[
  {
    "unit": "gpSkillXFullWiringCorrected",
    "scriptSHA256": "a194e1bbf36376df78478ec3050e985187e94cc26b21fe6e05b56f1a8bebb8f3",
    "rawStdoutSHA256": "484e95c5fb7ce6fab83d08e8d968896513723cd24d8e0157d9b65686c40b59ec",
    "endedUTC": "2026-10-02T13:21:59.579Z",
    "pins": [
      {
        "file": "game.html",
        "source": "ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613",
        "nav": "3089e0aaac89e10c59769ffc246230eb04abeefabaf56e9e21a2ac7865047796",
        "poll": "00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d"
      },
      {
        "file": "game-easy-test.html",
        "source": "8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129",
        "nav": "cc02ae15d667b7500e2f21dd84e0ee79ce6c2b704e526111face98ab52f4b4b0",
        "poll": "00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d"
      }
    ],
    "newFiles": 0,
    "productionApplied": false,
    "nativeAccepted": false
  }
]

```

## 다음 독립 업무

가상커서 eq/bot/st 이중 click, 빈 가방 cursor A 누락, bot Dpad index, 일반 nav a/b/y TDZ, L3/LT/RT edge/reopen 후보는 별도 미저장 메모리로 유지한다. 이 인계에 대한 행동·native 검증으로 합산하지 않는다. L3/LT/RT 마지막 stdout은 truncation 구간이 있어 전체 원문 확보로 주장하지 않는다. capacity credit0 뒤에도 다음 승인 독립 실제 source 작업을 메모리로 이어간다.
