/* Local tutorial medals. Only complete, unskipped checklists award a medal. */
window._tutorialBadges={
  definitions:[
    {id:'combat',name:'지옥의 첫걸음',detail:'이동·전투 실습 1단 · 11개 항목 완료',count:11,color:'#d9a875',paths:['M12 3 21 7v9c0 7-9 12-9 12S3 23 3 16V7Z','m7 10 10 12M17 10 7 22m-1-3 4 4m4-4 4 4']},
    {id:'resources',name:'불굴의 생존자',detail:'자원·정신력 실습 2단 · 10개 항목 완료',count:10,color:'#92c9c2',paths:['M12 2 22 15 12 30 2 15Z','M12 7v17M6 15h12m-9-5 6 10m0-10L9 20']},
    {id:'systems',name:'지옥의 개척자',detail:'장비·성장 시스템 · 7개 항목 완료',count:7,color:'#e9d18b',paths:['M4 27V9l8-6 8 6v18M2 27h20M8 27V15h8v12','m8 10 3 3 6-7']}
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
    this.button=this.node('button','배지 0/3');this.button.id='tutorialBadgeButton';this.button.type='button';this.button.setAttribute('aria-expanded','false');this.button.setAttribute('aria-controls','tutorialBadgeCollection');
    this.panel=this.node('section');this.panel.id='tutorialBadgeCollection';this.panel.hidden=true;this.panel.setAttribute('aria-label','튜토리얼 배지 모음');
    const head=this.node('header');head.append(this.node('span','EXODUSER · ACHIEVEMENTS'));
    this.close=this.node('button','닫기');this.close.type='button';this.close.onclick=()=>this.toggle(false);head.append(this.close);
    this.panel.append(head,this.node('h2','지옥에서 남긴 증명'),this.node('p','실습을 끝까지 마치고 세 개의 배지를 모으세요.'));
    this.cards=this.definitions.map(def=>{
      const card=this.node('article');card.style.setProperty('--medal-color',def.color);
      const art=this.node('div');art.className='tutorial-medal';art.append(this.icon(def));
      const copy=this.node('div');const status=this.node('span');status.className='tutorial-medal-status';
      copy.append(this.node('h3',def.name),this.node('p',def.detail),status);card.append(art,copy);this.panel.append(card);return {def,card,status};
    });
    this.toast=this.node('div');this.toast.id='tutorialBadgeToast';this.toast.hidden=true;this.toast.setAttribute('role','status');
    this.toastLabel=this.node('span');this.toast.append(this.node('small','배지 획득'),this.toastLabel);
    this.button.onclick=()=>this.toggle(this.panel.hidden);
    for(const el of [this.button,this.panel])for(const type of ['mousedown','click','pointerdown','wheel','keydown'])el.addEventListener(type,e=>{e.stopPropagation();if(type==='keydown'&&e.code==='Escape'){e.preventDefault();this.toggle(false);}});
    document.body.append(this.button,this.panel,this.toast);this.render();
  },
  toggle(open){this.panel.hidden=!open;this.button.setAttribute('aria-expanded',String(open));if(open)this.close.focus();else this.button.focus();},
  render(){
    this.button.textContent=`배지 ${Object.keys(this.earned).length}/3`;
    for(const {def,card,status} of this.cards){const earned=!!this.earned[def.id];card.setAttribute('data-earned',String(earned));status.textContent=earned?'획득 완료':'미획득';}
  },
  complete(id,checks){
    const def=this.definitions.find(d=>d.id===id);
    if(!def||!Array.isArray(checks)||checks.length!==def.count||!checks.every(v=>v===true))return false;
    this.init();if(this.earned[id])return false;
    this.earned[id]=new Date().toISOString();try{localStorage.setItem(this.storageKey,JSON.stringify(this.earned));}catch{}
    this.render();this.toastLabel.textContent=def.name;this.toast.hidden=false;
    clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>{this.toast.hidden=true;},3500);return true;
  }
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>window._tutorialBadges.init(),{once:true});else window._tutorialBadges.init();
