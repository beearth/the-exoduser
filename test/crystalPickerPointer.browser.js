// Run against each HTML in an isolated browser DOM; no save or application state access.
function testCrystalPickerPointer(html,document){
  const start=html.indexOf('function renderCrystalBag(){');
  const source=html.slice(start,html.indexOf('let _crPickerFocusOrigin',start));
  const pop=document.createElement('div');
  const ctx={$:()=>pop,CRYSTAL_BAG:[{id:'qa',star:0,enh:0},{id:'qa',star:1,enh:0},{id:'qa',star:1,enh:0}],CRYSTAL_BAG_MAX:9999,CRYSTAL_DUST:0,
    CRYSTAL_DEFS:{qa:{ko:'QA',cat:'atk',slots:['armor']}},CRYSTAL_STAR:[{name:'One',color:'#aaa'},{name:'Two',color:'#bbb'},{color:'#ccc'},{color:'#ddd'},{color:'#eee'}],
    _crBagFilter:'all',_gpCrIdx:0,_crPickSlot:null,_crPickCb:null,_crBagSel:-1,
    _T:x=>x,_L:x=>x,_crIco:()=>'',_crStarN:x=>x.name,_crDefN:x=>x.ko,_crValStr:()=>'+1',closeCrystalPicker(){}};
  const render=new Function('document','ctx','with(ctx){'+source+';return renderCrystalBag;}')(document,ctx);
  const checks=[];const check=(value,label)=>{if(!value)throw Error(label);checks.push(label);};
  const event=(name,dx=0)=>new document.defaultView.MouseEvent(name,{movementX:dx,movementY:0});
  render();let rows=pop.querySelectorAll('.cr-picker-item');check(rows.length===3,'Real renderer creates all fixture rows');
  rows[2].dispatchEvent(new document.defaultView.FocusEvent('focus'));check(ctx._gpCrIdx===2,'Keyboard focus synchronizes selection');
  rows[0].dispatchEvent(event('mouseenter'));check(ctx._gpCrIdx===2,'Scroll-induced pointer entry does not replace selection');
  rows[0].dispatchEvent(event('mousemove'));check(ctx._gpCrIdx===2,'Zero-distance pointer events do not replace selection');
  rows[0].dispatchEvent(event('mousemove',3));check(ctx._gpCrIdx===0,'Actual pointer motion updates selection');
  ctx._gpCrIdx=2;ctx._crBagFilter='s0';render();check(ctx._gpCrIdx===0&&pop.querySelectorAll('.cr-picker-item').length===1,'Shortened filter resets selection');
  return checks;
}
