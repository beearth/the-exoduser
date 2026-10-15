import { RUINED_FOREST_SCENE, createRuinedForestTemplate } from '../../engine/fdg/ruined-forest-scene.js?v=forest-route-close-20261012';
import { createNativeMapPack, createNativeEncounterMapPack, compileNativeMapPack, serializeNativeMapPack, encodeNativeMapPackFragment, parseNativeMapPackJson } from '../../engine/fdg/native-map-pack.js?v=encounter-placement-first-20261012';

const MONSTER_NAMES={rot_knight:'부패 기사',skull_brute:'해골 야수',bone_archer:'뼈 궁수',etype1_archer:'가시 사도'};

export function applyMapPackPlacement(pack, baseline, {instanceId, x, y, name}) {
  const draft=structuredClone(pack), object=draft.objects.find(o=>o.instanceId===instanceId);
  if(!object)throw new Error('선택한 인스턴스가 없습니다.');
  object.x=x;object.y=y;if(name!==undefined)draft.name=name;
  return compileNativeMapPack(draft,baseline).pack;
}
export function createMapPackPlayUrl(pack,baseline) {
  const fragment=encodeNativeMapPackFragment(pack,baseline);
  return '../../game.html?test=1&testchar=1&bosstest=0&fdgDruidQa=r4&fdgPerspective=first&fdgScene=ruined-forest-first&fdgMapPack=first'+(pack.version===2?'&fdgEncounter=placement-first':'')+fragment;
}
export function readMapPackJson(text,baseline) {
  return parseNativeMapPackJson(text,baseline).pack;
}
export function applyMapPackEnemyPlacement(pack,baseline,{instanceId,x,y,name}) {
  const draft=createNativeEncounterMapPack(baseline,pack),enemy=draft.enemies.find(e=>e.instanceId===instanceId);
  if(!enemy)throw new Error('선택한 몬스터가 없습니다.');
  enemy.x=x;enemy.y=y;if(name!==undefined)draft.name=name;
  return compileNativeMapPack(draft,baseline).pack;
}

export function installMapPackStudio({document:doc=globalThis.document,baseline={scene:RUINED_FOREST_SCENE,template:createRuinedForestTemplate()}}={}) {
  let pack=createNativeMapPack(baseline),selected='prop-035',kind='prop';
  const byId=id=>doc.getElementById(id),form=byId('pack-placement'),select=byId('pack-object'),canvas=byId('pack-map'),kindSelect=byId('pack-kind');
  const status=byId('pack-status'),json=byId('pack-json'),play=byId('pack-play');
  function selection(){return (kind==='enemy'?pack.enemies:pack.objects).find(item=>item.instanceId===selected);}
  function rebuildOptions(){
    while(select.firstChild)select.firstChild.remove();
    for(const item of kind==='enemy'?pack.enemies:pack.objects){
      const option=doc.createElement('option');option.value=item.instanceId;
      option.textContent=kind==='enemy'?MONSTER_NAMES[item.skin]+' · '+item.instanceId:item.instanceId+' · '+item.id;select.append(option);
    }
    byId('pack-selection-title').textContent=kind==='enemy'?'선택한 몬스터':'선택한 소품';
  }
  const showStatus=(message,error=false)=>{status.textContent=message;status.dataset.error=String(error);};
  function drawMap(){
    const ctx=canvas.getContext('2d');if(!ctx)return;
    const sx=canvas.width/pack.map.mw,sy=canvas.height/pack.map.mh;
    ctx.fillStyle='#0d160f';ctx.fillRect(0,0,canvas.width,canvas.height);
    let cell=0;for(let i=0;i<pack.map.tileRLE.length;i+=2){const value=pack.map.tileRLE[i],count=pack.map.tileRLE[i+1];for(let j=0;j<count;j++,cell++){if(value!==1)continue;ctx.fillStyle='#334739';ctx.fillRect((cell%pack.map.mw)*sx,Math.floor(cell/pack.map.mw)*sy,sx,sy);}}
    for(const object of pack.objects){
      const chosen=kind==='prop'&&object.instanceId===selected;ctx.fillStyle=chosen?'#e4c770':object.fdgUpright?'#91a999':'#758b6d';ctx.strokeStyle=chosen?'#fff5a8':'#91a999';ctx.lineWidth=chosen?2:1;
      if(object.fdgUpright)ctx.strokeRect(object.x*sx-5,object.y*sy-8,10,16);
      else{ctx.beginPath();ctx.arc(object.x*sx,object.y*sy,chosen?6:3,0,Math.PI*2);ctx.fill();}
      if(chosen){ctx.beginPath();ctx.arc(object.x*sx,object.y*sy,13,0,Math.PI*2);ctx.stroke();}
    }
    for(const [i,enemy] of pack.enemies.entries()){
      const chosen=kind==='enemy'&&enemy.instanceId===selected,px=(enemy.x+.5)*sx,py=(enemy.y+.5)*sy;
      ctx.fillStyle=chosen?'#f1d578':'#e28c7f';ctx.beginPath();ctx.arc(px,py,chosen?7:5,0,Math.PI*2);ctx.fill();
      if(chosen){ctx.strokeStyle='#fff5a8';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px,py,13,0,Math.PI*2);ctx.stroke();}
      ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText(String(i+1),px,py-7);
    }
    ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    for(const [point,label] of [[pack.start,'S'],[pack.exit,'E']]){ctx.fillStyle='#d7e7b4';ctx.fillText(label,(point.x+.5)*sx,(point.y+.5)*sy);}
  }
  function refresh(){
    const object=selection();select.value=selected;if(kindSelect)kindSelect.value=kind;
    byId('pack-name').value=pack.name;byId('pack-x').value=object.x;byId('pack-y').value=object.y;
    byId('pack-source').textContent=kind==='enemy'?MONSTER_NAMES[object.skin]+' · 게임 시작 위치':object.id+' · 배율 '+object.scale+' · '+(object.fdgUpright?'세로 소품':'지면 소품');
    byId('pack-coordinate-help').textContent=kind==='enemy'?'몬스터 발 위치는 (타일 좌표 + 0.5) × 40px입니다. 이동 가능한 바닥에만 배치합니다.':'한 타일은 40px입니다. 기존 소품의 위치를 편집합니다.';
    play.href=createMapPackPlayUrl(pack,baseline);drawMap();
  }
  function apply(){
    try{
      const placement={instanceId:selected,x:byId('pack-x').valueAsNumber,y:byId('pack-y').valueAsNumber,name:byId('pack-name').value};
      pack=(kind==='enemy'?applyMapPackEnemyPlacement:applyMapPackPlacement)(pack,baseline,placement);
      const compiled=compileNativeMapPack(pack,baseline);refresh();
      showStatus('소품 '+pack.objects.length+'개'+(pack.version===2?' · 몬스터 '+pack.enemies.length+'개 · 몬스터 위치 편집 '+compiled.receipt.changedEnemies.length+'개':'')+' · 소품 위치 편집 '+compiled.receipt.changedObjects.length+'개. 인게임에서 플레이할 수 있습니다.');return true;
    }catch(error){showStatus(error.message,true);return false;}
  }
  form.addEventListener('submit',event=>{event.preventDefault();apply();});
  select.addEventListener('change',()=>{selected=select.value;refresh();});
  kindSelect?.addEventListener('change',()=>{
    try{
      if(kindSelect.value==='enemy')pack=createNativeEncounterMapPack(baseline,pack);
      kind=kindSelect.value;selected=kind==='enemy'?'enemy-001':'prop-035';rebuildOptions();refresh();
      showStatus(kind==='enemy'?'기존 몬스터 4개의 시작 위치를 편집합니다. 전투 설정은 그대로 사용합니다.':'소품 위치를 편집합니다.');
    }catch(error){kindSelect.value=kind;showStatus(error.message,true);}
  });
  canvas.addEventListener('click',event=>{
    const rect=canvas.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width*pack.map.mw,y=(event.clientY-rect.top)/rect.height*pack.map.mh;
    const items=kind==='enemy'?pack.enemies:pack.objects,offset=kind==='enemy' ? .5 : 0;
    const distance=item=>Math.hypot(item.x+offset-x,item.y+offset-y);
    const nearest=items.reduce((a,o)=>distance(o)<distance(a)?o:a,items[0]);
    if(distance(nearest)<=4){selected=nearest.instanceId;refresh();}
  });
  byId('pack-reset').addEventListener('click',()=>{pack=createNativeMapPack(baseline);kind='prop';selected='prop-035';rebuildOptions();refresh();showStatus('기본 배치로 복원했습니다.');});
  byId('pack-export').addEventListener('click',()=>{if(apply()){json.value=serializeNativeMapPack(pack,baseline);showStatus('현재 배치 JSON을 내보냈습니다.');}});
  byId('pack-import').addEventListener('click',()=>{
    try{
      const imported=readMapPackJson(json.value,baseline);pack=imported;
      if(pack.version===1&&kind==='enemy'){kind='prop';selected='prop-035';}
      rebuildOptions();refresh();showStatus('JSON 배치를 불러왔습니다.'+(pack.version===2?' 몬스터 시작 위치도 적용됐습니다.':''));
    }
    catch(error){showStatus(error.message,true);}
  });
  byId('pack-download').addEventListener('click',()=>{
    if(!apply())return;const content=serializeNativeMapPack(pack,baseline);json.value=content;
    const url=URL.createObjectURL(new Blob([content],{type:'application/json;charset=utf-8'}));
    const link=doc.createElement('a');link.href=url;link.download='fdg-map-pack.json';link.click();URL.revokeObjectURL(url);
    showStatus('맵팩 JSON 파일을 저장했습니다.');
  });
  play.addEventListener('click',event=>{if(!apply())event.preventDefault();});
  rebuildOptions();refresh();showStatus('기존 폐허 숲길 소품 '+pack.objects.length+'개를 불러왔습니다. 소품 또는 몬스터를 선택해 위치를 편집하세요.');
  return {snapshot:()=>structuredClone(pack)};
}
if(typeof document!=='undefined')installMapPackStudio();
