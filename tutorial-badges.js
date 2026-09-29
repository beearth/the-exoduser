/* Local tutorial medals. Only complete, unskipped checklists award a medal. */
window._tutorialBadges={
  t(ko,en,values) { return typeof _L==='function' ? _L(ko,en,values) : ko.replace(/\{(\w+)\}/g,(all,key)=>values?.[key]??all); },
  definitions:[
    {id:'combat',name:'지옥의 첫걸음',nameEn:"First Steps in Hell",detail:'이동·전투 실습 1단 · 12개 항목 완료',detailEn:"Combat practice · Complete all 12 objectives",count:12,color:'#d9a875',paths:['M12 3 21 7v9c0 7-9 12-9 12S3 23 3 16V7Z','m7 10 10 12M17 10 7 22m-1-3 4 4m4-4 4 4']},
    {id:'resources',name:'불굴의 생존자',nameEn:"Unyielding Survivor",detail:'자원·정신력 실습 2단 · 8개 항목 완료',detailEn:"Resource and Poise practice · Complete all 8 objectives",count:8,color:'#92c9c2',paths:['M12 2 22 15 12 30 2 15Z','M12 7v17M6 15h12m-9-5 6 10m0-10L9 20']},
    {id:'systems',name:'지옥의 개척자',nameEn:"Pioneer of Hell",detail:'장비·성장 시스템 · 7개 항목 완료',detailEn:"Equipment and progression · Complete all 7 objectives",count:7,color:'#e9d18b',paths:['M4 27V9l8-6 8 6v18M2 27h20M8 27V15h8v12','m8 10 3 3 6-7']}
  ],
  node(tag,text){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;},
  icon(def){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 32');svg.setAttribute('aria-hidden','true');
    for(const d of def.paths){const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',d);p.setAttribute('fill','none');p.setAttribute('stroke','currentColor');p.setAttribute('stroke-width','1.4');p.setAttribute('stroke-linejoin','round');p.setAttribute('stroke-linecap','round');svg.append(p);}return svg;
  },
  init(){
    if(this.ready)return;this.ready=true;
    const slot=new URLSearchParams(location.search).get('slot')||'main';this.storageKey='exoduser:tutorial-badges:v1:'+slot;
    this.earned={};try{const data=JSON.parse(localStorage.getItem(this.storageKey)||'{}');for(const def of this.definitions)if(typeof data?.[def.id]==='string')this.earned[def.id]=data[def.id];}catch{}
    this.button=this.node('button','배지 0/3');this.button.id='tutorialBadgeButton';this.button.type='button';this.button.hidden=true;this.button.setAttribute('aria-expanded','false');this.button.setAttribute('aria-controls','tutorialBadgeCollection');
    this.panel=this.node('section');this.panel.id='tutorialBadgeCollection';this.panel.hidden=true;this.panel.setAttribute('aria-label','튜토리얼 배지 모음');
    const head=this.node('header');this.heading=this.node('span');head.append(this.heading);
    this.close=this.node('button','닫기');this.close.type='button';this.close.onclick=()=>this.toggle(false);head.append(this.close);
    this.title=this.node('h2');this.description=this.node('p');this.panel.append(head,this.title,this.description);
    this.cards=this.definitions.map(def=>{
      const card=this.node('article');card.style.setProperty('--medal-color',def.color);
      const art=this.node('div');art.className='tutorial-medal';art.append(this.icon(def));
      const copy=this.node('div');const status=this.node('span');status.className='tutorial-medal-status';
      const title=this.node('h3'),detail=this.node('p');copy.append(title,detail,status);card.append(art,copy);this.panel.append(card);return {def,card,status,title,detail};
    });
    this.toast=this.node('div');this.toast.id='tutorialBadgeToast';this.toast.hidden=true;this.toast.setAttribute('role','status');
    this.toastLabel=this.node('span');this.toastHeading=this.node('small');this.toast.append(this.toastHeading,this.toastLabel);
    this.button.onclick=()=>this.toggle(this.panel.hidden);
    for(const el of [this.button,this.panel])for(const type of ['mousedown','click','pointerdown','wheel','keydown'])el.addEventListener(type,e=>{e.stopPropagation();if(type==='keydown'&&e.code==='Escape'){e.preventDefault();this.toggle(false);}});
    const hud=document.getElementById?.('mmLvl')||document.body;
    hud.append(this.button,this.panel);document.body.append(this.toast);this.render();
  },
  toggle(open){open=!!open&&!this.button.hidden;this.panel.hidden=!open;this.button.setAttribute('aria-expanded',String(open));if(open)this.close.focus();else if(!this.button.hidden)this.button.focus();},
  refreshLanguage(){if(this.ready)this.render();},
  render(){
    this.panel.setAttribute('aria-label',this.t('튜토리얼 배지 모음','Tutorial badge collection'));
    this.heading.textContent=this.t('엑소듀서 · 수료 배지','EXODUSER · ACHIEVEMENTS');
    this.close.textContent=this.t('닫기','Close');
    this.title.textContent=this.t('지옥에서 남긴 증명','Proof of Your Journey');
    this.description.textContent=this.t('실습을 끝까지 마치고 세 개의 배지를 모으세요.','Complete the tutorials and collect all three badges.');
    this.toastHeading.textContent=this.t('배지 획득','Badge earned');
    const toastDef=this.definitions.find(def=>def.id===this.toastId);
    if(toastDef)this.toastLabel.textContent=this.t(toastDef.name,toastDef.nameEn);
    const count=Object.keys(this.earned).length;
    this.button.hidden=count===0;
    if(count===0){this.panel.hidden=true;this.button.setAttribute('aria-expanded','false');}
    this.button.textContent=this.t('배지 {count}/3','Badges {count}/3',{count});
    for(const {def,card,status,title,detail} of this.cards){const earned=!!this.earned[def.id];card.setAttribute('data-earned',String(earned));title.textContent=this.t(def.name,def.nameEn);detail.textContent=this.t(def.detail,def.detailEn);status.textContent=earned?this.t('획득 완료','Earned'):this.t('미획득','Not earned');}
  },
  complete(id,checks){
    const def=this.definitions.find(d=>d.id===id);
    if(!def||!Array.isArray(checks)||checks.length!==def.count||!checks.every(v=>v===true))return false;
    this.init();if(this.earned[id])return false;
    this.earned[id]=new Date().toISOString();try{localStorage.setItem(this.storageKey,JSON.stringify(this.earned));}catch{}
    this.toastId=id;this.render();this.toast.hidden=false;
    clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>{this.toast.hidden=true;},3500);return true;
  }
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>window._tutorialBadges.init(),{once:true});else window._tutorialBadges.init();
