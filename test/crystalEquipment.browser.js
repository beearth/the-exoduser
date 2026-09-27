// Browser-run regression harness; detached DOM, no real save or inventory writes.
async function testCrystalEquipment(html,document){
  const source=html.slice(html.indexOf('const CR_ATK_SLOTS='),html.indexOf('const ITEM_SIZE='));
  const panel=document.createElement('div');
  const slots=['weapon','shield','boots','armor','helmet','bow','gloves','pants','belt','necklace','ring1','ring2','cape','bracelet','headband','ossuary','headband2'];
  const ctx={$:()=>panel,INV:{equipped:{},bag:[]},SLOT_NAMES:slots,_slotName:i=>slots[i],
    _L:x=>x,_T:x=>x,_glyph:()=>'',_malCost:x=>x,OPT:{lang:'ko'},G:{mats:0},
    applyStats(){},notify(){},dbSaveNow(){ctx.saves++},saves:0,picker:null};
  const api=new Function('document','ctx','with(ctx){'+source+';return {render:renderInvCrystals,setBag:b=>CRYSTAL_BAG=b,bag:()=>CRYSTAL_BAG,select:c=>_invCrSelected=c,mockPicker:()=>{openCrystalPicker=(cb,slot)=>{ctx.picker={cb,slot}}}};}')(document,ctx);
  const checks=[];
  const check=(ok,name)=>{if(!ok)throw Error(name);checks.push(name)};
  api.setBag([]);api.render();
  check(panel.querySelectorAll('.inv-cr-equipment-card').length===17,'All 17 parts visible without equipment');
  check(panel.querySelector('.inv-cr-portrait').getAttribute('aria-hidden')==='true','Decorative portrait excluded from interaction and accessible names');
  check(panel.querySelectorAll('.inv-cr-socket').length===0,'Unequipped parts cannot socket gems');
  for(const slot of slots)ctx.INV.equipped[slot]={slot,name:slot,crystals:[null]};
  const hp={id:'cr_martyr_tear',star:1,enh:2},atk={id:'cr_blood_oath',star:0,enh:0};
  api.setBag([hp,atk]);api.select(hp);api.render();
  check(panel.querySelector('[data-slot=weapon] .inv-cr-socket').disabled,'Incompatible gem blocked');
  check(panel.querySelector('[data-slot=armor]').dataset.compatible==='true'&&panel.querySelector('[data-slot=weapon]').dataset.compatible==='false','Selected gem highlights only compatible equipment');
  check(panel.querySelector('[data-slot=armor]').dataset.socketState==='ready'&&panel.querySelector('[data-slot=armor] .inv-cr-socket').dataset.ready==='true'&&panel.querySelector('.inv-cr-equipment-help').textContent.includes('6개'),'Only actual compatible empty sockets glow and are counted');
  ctx.INV.equipped.gloves.crystals[0]={id:'cr_iron_vow',star:0,enh:0};api.render();
  check(panel.querySelector('[data-slot=gloves]').dataset.socketState==='full'&&panel.querySelector('[data-slot=gloves] .inv-cr-socket').dataset.ready==='false','Full compatible equipment does not suggest an empty socket');
  ctx.INV.equipped.gloves.crystals[0]=null;api.render();
  ctx.INV.equipped.weapon.crystals[0]=atk;api.render();
  const filled=panel.querySelector('[data-slot=weapon] .inv-cr-socket');filled.onmouseenter();
  check(panel.querySelector('.inv-cr-name').textContent==='피의 맹세'&&panel.querySelector('.inv-cr-meta').textContent.includes('장착 중'),'Hovering an equipped socket previews its own gem');
  filled.onmouseleave();
  check(panel.querySelector('.inv-cr-name').textContent==='순교자의 눈물','Leaving a filled socket restores the selected bag gem');
  ctx.INV.equipped.weapon.crystals[0]=null;api.render();
  const socket=panel.querySelector('[data-slot=armor] .inv-cr-socket');socket.click();socket.click();
  check(ctx.INV.equipped.armor.crystals[0]===hp&&api.bag().length===1&&api.bag()[0]===atk,'Equip exactly one gem; stale click safe');
  check(panel.querySelector('.inv-cr-socket-summary').textContent==='장착 1 / 17','Socket summary updates after equipping');
  panel.querySelector('[data-slot=armor] .inv-cr-socket').click();
  check(ctx.INV.equipped.armor.crystals[0]===null&&api.bag().includes(hp),'Remove returns same gem');
  api.select(null);api.mockPicker();api.render();
  panel.querySelector('[data-slot=headband2] .inv-cr-socket').click();
  check(ctx.picker.slot==='headband2','Second earring opens compatible picker');
  const mp={id:'cr_last_breath',star:0,enh:0};api.setBag([mp]);ctx.picker.cb(mp,0);
  check(ctx.INV.equipped.headband2.crystals[0]===mp&&api.bag().length===0,'Picker equips second earring');
  api.render();panel.querySelector('[data-slot=ring2] .inv-cr-socket').click();
  ctx.INV.equipped.ring2={slot:'ring2',crystals:[null]};api.setBag([mp]);ctx.picker.cb(mp,0);
  check(api.bag().length===1&&ctx.INV.equipped.ring2.crystals[0]===null,'Changed equipment rejects stale picker');
  check(ctx.saves===3,'Successful mutations schedule save');
  return checks;
}
