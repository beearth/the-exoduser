/* Image composition workspace mounted inside the canonical editor. No game/save-slot bridge. */
(async function () {
  'use strict';
  if (new URLSearchParams(location.search).get('workspace') === 'tiles') return;
  const $ = id => document.getElementById('scene-' + id), K = window.MapSceneCore;
  document.body.classList.add('scene-mode'); $('workspace').hidden = false; $('workspace').inert = true;
  const canvas = $('canvas'), ctx = canvas.getContext('2d'), pictures = new Map(), keys = new Set();
  let history, selected = null, layerId = 'mid', paletteId = null, tool = 'select', playing = false, player, drag = null, space = false, busy = true;
  let viewport = { x: 4000, y: 4000, zoom: .08 }, size = { w: 1, h: 1 }, dirty = true, last = 0, toastTimer, autosaveTimer;
  const CACHE_KEY = 'exoduser:map-scene:v1', LIBRARY = [
    { id: 'rift-art', name: '지옥의 틈 · 원화', src: 'assets/map/hell_rift/interspace_20261005/hell-rift-painterly-v2.png', width: 8000, layer: 'ground' },
    { id: 'abyss', name: '심연 · 후경', src: 'assets/map/hell_rift/interspace_20261005/hell-rift-abyss-v3.png', width: 8000, layer: 'back' },
    { id: 'root-wall', name: '비대칭 뿌리 절벽', src: 'assets/map/ch1/a_grade_candidates/20261005/root_buttress_v3.png', width: 1800, layer: 'foot', alphaCrop: {x:85,y:35,w:1626,h:827} },
    { id: 'forest-ground', name: '썩은숲 · 지면', src: 'assets/map/ch1/rottenwood_living_hell_v7_ground_layer.png', width: 8000, layer: 'ground' },
    { id: 'forest-left', name: '서쪽 · 숲 질량', src: 'assets/map/ch1/rottenwood_living_hell_v7_left_layer.png', width: 8000, layer: 'mid' },
    { id: 'forest-right', name: '동쪽 · 숲 질량', src: 'assets/map/ch1/rottenwood_living_hell_v7_right_layer.png', width: 8000, layer: 'mid' },
    { id: 'forest-north', name: '북쪽 · 숲 질량', src: 'assets/map/ch1/rottenwood_living_hell_v7_north_layer.png', width: 8000, layer: 'mid' },
    { id: 'dead-tree', name: '고목 · 기존 에셋', src: 'assets/objects/tree_dead_01.png', width: 240, layer: 'foot', alphaCrop: {x:3,y:4,w:61,h:57} },
    { id: 'glow-mushroom', name: '잔불빛 버섯', src: 'assets/objects/mushroom_glow_01.png', width: 100, layer: 'foot', alphaCrop: {x:7,y:3,w:18,h:27} }
  ];
  function setBusy(value){busy=value;$('workspace').inert=value;if(value){keys.clear();space=false;}}
  const uid = prefix => prefix + '-' + crypto.randomUUID();
  function toast(message) { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').hidden = true; }, 4000); }
  function script(src) { return new Promise((resolve, reject) => { const el = document.createElement('script'); el.src = src; el.onload = resolve; el.onerror = () => reject(new Error('데이터 로드 실패: ' + src)); document.head.appendChild(el); }); }
  function picture(src) {
    if (pictures.has(src)) return pictures.get(src);
    const promise = new Promise((resolve, reject) => { const im = new Image(); im.onload = () => { if (im.naturalWidth > 8192 || im.naturalHeight > 8192) return reject(new Error('이미지 최대 크기는 8192px입니다')); resolve(im); dirty = true; }; im.onerror = () => { pictures.delete(src); reject(new Error('이미지를 읽지 못했습니다')); }; im.src = src; });
    pictures.set(src, promise); return promise;
  }
  const loaded = new Map();
  async function asset(def, trim = false) {
    const im = await picture(def.src); loaded.set(def.src, im);
    let crop = { x: 0, y: 0, w: im.naturalWidth, h: im.naturalHeight };
    if (trim && im.naturalWidth * im.naturalHeight <= 16777216) {
      const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0);
      let pixels;try{pixels=x.getImageData(0,0,c.width,c.height).data;}catch(e){if(def.alphaCrop)crop={...def.alphaCrop};return {id:def.id,name:def.name,src:def.src,width:im.naturalWidth,height:im.naturalHeight,crop};} let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
      for (let y = 0; y < c.height; y++) for (let a = 0; a < c.width; a++) if (pixels[(y * c.width + a) * 4 + 3] > 8) { x0 = Math.min(x0, a); y0 = Math.min(y0, y); x1 = Math.max(x1, a); y1 = Math.max(y1, y); }
      if (x1 < 0) throw new Error('완전히 투명한 이미지입니다'); crop = { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
    }
    return { id: def.id, name: def.name, src: def.src, width: im.naturalWidth, height: im.naturalHeight, crop };
  }
  function object(a, x, y, width, pivotX = .5, pivotY = 1) { return { id: uid('obj'), assetId: a.id, name: a.name, x, y, width, height: width * a.crop.h / a.crop.w, pivotX, pivotY, rotation: 0, opacity: 1, flipX: false }; }
  function base(name) { return { format: 'exoduser-map-scene', version: 1, name, world: { cols: 200, rows: 200, tileSize: 40 }, assets: [], layers: [
    { id: 'back', name: 'BACK · 심연', sort: 'flat', parallax: .965 }, { id: 'ground', name: 'GROUND · 지면', sort: 'flat', parallax: 1 },
    { id: 'mid', name: 'MID · 외곽 질량', sort: 'flat', parallax: 1 }, { id: 'foot', name: 'FOOT · 발 기준 가림', sort: 'foot', parallax: 1 },
    { id: 'front', name: 'FRONT · 전경', sort: 'flat', parallax: 1 }
  ].map(l => ({ ...l, visible: true, locked: false, objects: [] })), walkable: new Array(40000).fill(1), start: { x: 4020, y: 7740 }, exit: { x: 4020, y: 300 }, cameras: [] }; }
  async function preset(id) {
    const p = base(id === 'rift' ? '지옥의 틈 · 레이어 작업' : id === 'ch1' ? '1-1 썩은숲 · 구성 스케치' : '새 환경 씬');
    if (id === 'rift') {
      const r = window.HELL_RIFT_INTERSPACE.variants.interspace;
      p.walkable = K.decode(r.tileRLE, 40000); p.start = { x: (r.start.x + .5) * 40, y: (r.start.y + .5) * 40 }; p.exit = { x: (r.exit.x + .5) * 40, y: (r.exit.y + .5) * 40 };
      const a = await asset(LIBRARY[0]); p.assets.push(a); p.layers[1].objects.push(object(a, 0, 0, 8000, 0, 0)); p.layers[1].locked = true;
      // Reuse already-reviewed exact silhouettes; the source painting is preserved.
      const fronts = [
        { name: '서쪽 뿌리', foot: 134, poly: [[66,116],[65,121],[62,123],[63,127],[59,129],[57,132],[53,133],[56,134],[63,132],[66,128],[68,123],[69,121]] },
        { name: '동쪽 뿔', foot: 108, poly: [[146,83],[149,83],[147,89],[147,94],[150,99],[149,105],[146,108],[141,108],[142,104],[143,100],[143,95]] },
        { name: '남쪽 뿌리', foot: 173, poly: [[123,157],[124,162],[128,165],[131,169],[130,172],[126,173],[124,169],[121,167],[118,165],[119,161]] }
      ];
      for (const [i,f] of fronts.entries()) { const x0=Math.min(...f.poly.map(v=>v[0])),y0=Math.min(...f.poly.map(v=>v[1])),w=Math.max(...f.poly.map(v=>v[0]))-x0,h=Math.max(...f.poly.map(v=>v[1]))-y0; const fragment={...K.clone(a),id:'rift-front-'+i,name:f.name,internal:true,crop:{x:x0/200*a.width,y:y0/200*a.height,w:w/200*a.width,h:h/200*a.height}};p.assets.push(fragment);const o=object(fragment,x0*40,f.foot*40,w*40,0,(f.foot-y0)/h);o.height=h*40;o.mask=f.poly.map(([x,y])=>[(x-x0)/w,(y-y0)/h]);p.layers[3].objects.push(o); }
      p.cameras = window.HELL_RIFT_INTERSPACE.cameraAnchors.map(([x,y], i) => ({ id: 'cam-' + i, name: ['시작','잔불','서측','서쪽 길','동측','심연','상승 준비','출구'][i], x: (x+.5)*40, y: (y+.5)*40 }));
    } else if (id === 'ch1') {
      p.walkable = K.decode(window.CH1_1_PRODUCTION.buildRLE(200,200), 40000); p.start = { x: 4020, y: 7420 }; p.exit = { x: 4020, y: 300 };
      for (let i = 3; i <= 6; i++) { const a = await asset(LIBRARY[i]); p.assets.push(a); p.layers[i === 3 ? 1 : 2].objects.push({ ...object(a,0,0,8000,0,0), height:8000 }); }
      p.layers[1].locked = true; p.cameras = window.CH1_1_PRODUCTION.regions.map(r => ({ id:r.id, name:r.name, x:(r.anchor[0]+.5)*40, y:(r.anchor[1]+.5)*40 }));
    }
    return K.validate(p);
  }
  const current = () => history.project;
  const selectedPair = () => { for (const l of current().layers) { const o = l.objects.find(o => o.id === selected); if (o) return { l, o }; } return null; };
  function autosave() { clearTimeout(autosaveTimer); autosaveTimer = setTimeout(() => { try { localStorage.setItem(CACHE_KEY, JSON.stringify(current())); $('status').textContent = '로컬 복구 저장됨 · 프로젝트 JSON으로 보존하세요'; } catch (e) { $('status').textContent = '복구 저장 공간 부족 · 프로젝트 저장을 사용하세요'; } }, 500); }
  function changed(message) { dirty = true; refresh(); autosave(); if (message) toast(message); }
  function mutate(fn, message) { if (busy) return; try { history.change(fn); changed(message); } catch (e) { toast(e.message); refresh(); } }
  function fit() { viewport = { x: current().world.cols * current().world.tileSize / 2, y: current().world.rows * current().world.tileSize / 2, zoom: Math.min((size.w-60)/(current().world.cols*current().world.tileSize), (size.h-110)/(current().world.rows*current().world.tileSize)) }; dirty = true; }
  function resize() { const r = $('stage').getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); size = { w:r.width, h:r.height }; canvas.width = Math.round(r.width*d); canvas.height = Math.round(r.height*d); dirty = true; }
  function world(e) { const r = canvas.getBoundingClientRect(); return { x:(e.clientX-r.left-size.w/2)/viewport.zoom+viewport.x, y:(e.clientY-r.top-size.h/2)/viewport.zoom+viewport.y }; }
  function snap(v) { return $('snap').checked ? Math.round(v/current().world.tileSize)*current().world.tileSize : v; }
  function offset(l) { return { x:(viewport.x-current().world.cols*current().world.tileSize/2)*(1-l.parallax), y:(viewport.y-current().world.rows*current().world.tileSize/2)*(1-l.parallax) }; }
  function selectAt(pos) {
    for (const l of [...current().layers].reverse()) { if (!l.visible || l.locked) continue; const off = offset(l), objects = l.sort === 'foot' ? [...l.objects].sort((a,b)=>b.y-a.y) : [...l.objects].reverse();
      for (const o of objects) { if (K.hit(o,pos.x-off.x,pos.y-off.y)) { const a = current().assets.find(a=>a.id===o.assetId), im = loaded.get(a.src), q=K.local(o,pos.x-off.x,pos.y-off.y);
        // Polygon/alpha hit testing avoids selecting transparent margins over smaller objects.
        if (im && !o.mask) { const test=document.createElement('canvas');test.width=test.height=1;const tx=test.getContext('2d');tx.drawImage(im,a.crop.x+q.x/o.width*a.crop.w,a.crop.y+q.y/o.height*a.crop.h,1,1,0,0,1,1);try{if(tx.getImageData(0,0,1,1).data[3]<8)continue;}catch(e){} }
        selected=o.id;layerId=l.id;refresh();return {l,o};
      } }
    } selected=null;refresh();return null;
  }
  function refresh() {
    const p = current(), pair = selectedPair(), active = p.layers.find(l=>l.id===layerId)||p.layers[0]; layerId=active.id;
    $('name').textContent=p.name; $('world-label').textContent='레이어 씬 · '+p.world.tileSize+'px / tile · '+p.world.cols+' × '+p.world.rows; $('undo').disabled=!history.undoStack.length; $('redo').disabled=!history.redoStack.length;
    $('layers').replaceChildren(); $('object-layer').replaceChildren();
    for (const l of [...p.layers].reverse()) {
      const row=document.createElement('div');row.className='scene-layer'+(l.id===layerId?' active':'');
      const name=document.createElement('button');name.className='scene-layer-name';name.textContent=l.name;name.onclick=()=>{layerId=l.id;refresh();};
      const count=document.createElement('span');count.textContent=String(l.objects.length);
      const visibility=document.createElement('button');visibility.textContent=l.visible?'●':'○';visibility.title='가시성';visibility.setAttribute('aria-label',l.name+' 가시성');visibility.onclick=()=>mutate(()=>{l.visible=!l.visible;});
      const lock=document.createElement('button');lock.textContent=l.locked?'잠금':'열림';lock.title='편집 잠금';lock.onclick=()=>mutate(()=>{l.locked=!l.locked;});row.append(visibility,name,count,lock);$('layers').append(row);
      const option=document.createElement('option');option.value=l.id;option.textContent=l.name;$('object-layer').append(option);
    }
    $('parallax').value=active.parallax; $('layer-sort').value=active.sort; $('layer-name').value=active.name;
    $('selection').textContent=pair?pair.o.name:(paletteId?'클릭해서 이미지 배치':'오브젝트를 선택하세요');
    for(const input of $('transform').querySelectorAll('input,select,button')) input.disabled=!pair||pair.l.locked;
    if(pair){const o=pair.o,a=p.assets.find(a=>a.id===o.assetId);for(const [id,key] of [['x','x'],['y','y'],['width','width'],['height','height'],['pivot-x','pivotX'],['pivot-y','pivotY'],['rotation','rotation'],['opacity','opacity']])$(id).value=Number(o[key].toFixed(3));$('object-name').value=o.name;$('object-layer').value=pair.l.id;$('source-info').textContent='원본 '+a.width+' × '+a.height+' · 표시 영역 '+a.crop.w+' × '+a.crop.h+' · '+Math.round(o.height/p.world.tileSize*10)/10+' tile 높이';}
    else $('source-info').textContent='';
    const i=p.layers.indexOf(active);$('layer-up').disabled=i===p.layers.length-1;$('layer-down').disabled=i===0;
    $('play').textContent=playing?'■ 보행 종료':'▶ 보행 시험';$('view-label').textContent=playing?'보행 시험 · WASD / 방향키 · ESC 종료':'SOUTH → NORTH · 이미지와 충돌을 별도로 편집';
    $('cameras').replaceChildren();for(const c of p.cameras){const b=document.createElement('button');b.textContent=c.name;b.onclick=()=>{viewport={x:c.x,y:c.y,zoom:Math.min(size.w/1800,size.h/1100)};dirty=true;};$('cameras').append(b);} dirty=true;
  }
  function palette() {
    const filter=$('search').value.toLowerCase(), defs=[...LIBRARY,...current().assets.filter(a=>!a.internal&&!LIBRARY.some(d=>d.id===a.id)).map(a=>({...a,width:400,layer:'foot'}))];$('palette').replaceChildren();
    for(const a of defs.filter(a=>a.name.toLowerCase().includes(filter))){const b=document.createElement('button');b.className='scene-asset'+(paletteId===a.id?' active':'');b.title=a.name;const img=document.createElement('img');img.src=a.src;img.alt='';const label=document.createElement('span');label.textContent=a.name;b.append(img,label);b.onclick=()=>{paletteId=paletteId===a.id?null:a.id;tool='select';selected=null;palette();refresh();};$('palette').append(b);}
  }
  function drawObject(o, l, target=ctx, includeSelection=true) {
    const a=current().assets.find(a=>a.id===o.assetId), im=a&&loaded.get(a.src);if(!im)return;const off=offset(l);
    target.save();target.translate(o.x+off.x,o.y+off.y);target.rotate(o.rotation*Math.PI/180);target.scale(o.flipX?-1:1,1);target.globalAlpha=o.opacity;
    if(o.mask){target.beginPath();for(const [i,v] of o.mask.entries()){const x=v[0]*o.width-o.pivotX*o.width,y=v[1]*o.height-o.pivotY*o.height;i?target.lineTo(x,y):target.moveTo(x,y);}target.closePath();target.clip();}
    target.drawImage(im,a.crop.x,a.crop.y,a.crop.w,a.crop.h,-o.width*o.pivotX,-o.height*o.pivotY,o.width,o.height);target.restore();
    if(includeSelection&&o.id===selected){target.save();target.translate(o.x+off.x,o.y+off.y);target.rotate(o.rotation*Math.PI/180);target.scale(o.flipX?-1:1,1);target.strokeStyle='#e8cf8e';target.lineWidth=1.5/viewport.zoom;target.strokeRect(-o.width*o.pivotX,-o.height*o.pivotY,o.width,o.height);const hs=8/viewport.zoom;target.fillStyle='#efdba1';target.fillRect(o.width*(1-o.pivotX)-hs/2,o.height*(1-o.pivotY)-hs/2,hs,hs);target.restore();target.save();target.strokeStyle='#70cfbc';target.lineWidth=1/viewport.zoom;target.beginPath();target.moveTo(o.x+off.x-9/viewport.zoom,o.y+off.y);target.lineTo(o.x+off.x+9/viewport.zoom,o.y+off.y);target.moveTo(o.x+off.x,o.y+off.y-9/viewport.zoom);target.lineTo(o.x+off.x,o.y+off.y+9/viewport.zoom);target.stroke();target.restore();}
  }
  let warrior;
  function actor(target) { target.save();target.fillStyle='#070c09aa';target.beginPath();target.ellipse(player.x,player.y,25,11,0,0,Math.PI*2);target.fill();if(warrior){target.imageSmoothingEnabled=false;const scale=80/29;target.drawImage(warrior,0,0,48,48,player.x-22*scale,player.y-43*scale,48*scale,48*scale);}else{target.fillStyle='#eddfa7';target.fillRect(player.x-12,player.y-55,24,55);}target.restore(); }
  function render(target=ctx, overlays=true) {
    const p=current();let actorDrawn=false;
    for(const l of p.layers){if(!l.visible)continue;const objects=l.sort==='foot'?[...l.objects].sort((a,b)=>a.y-b.y):l.objects;
      if(playing&&l.sort==='foot'){for(const o of objects){if(!actorDrawn&&player.y<=o.y){actor(target);actorDrawn=true;}drawObject(o,l,target,overlays);}if(!actorDrawn){actor(target);actorDrawn=true;}}
      else for(const o of objects)drawObject(o,l,target,overlays);
    }if(playing&&!actorDrawn)actor(target);
    if(!overlays)return;const w=p.world,t=w.tileSize;
    if($('show-nav').checked){target.fillStyle='#66d99c3d';for(let y=0;y<w.rows;y++)for(let x=0;x<w.cols;x++)if(p.walkable[y*w.cols+x])target.fillRect(x*t,y*t,t,t);}
    if($('show-grid').checked){target.strokeStyle='#b7c8b722';target.lineWidth=.5/viewport.zoom;target.beginPath();for(let x=0;x<=w.cols;x++){target.moveTo(x*t,0);target.lineTo(x*t,w.rows*t);}for(let y=0;y<=w.rows;y++){target.moveTo(0,y*t);target.lineTo(w.cols*t,y*t);}target.stroke();}
    target.strokeStyle='#738976';target.lineWidth=1/viewport.zoom;target.strokeRect(0,0,w.cols*t,w.rows*t);
    for(const [id,color,label] of [['start','#8ecdb0','START'],['exit','#e6cc8d','EXIT']]){target.fillStyle=color;target.beginPath();target.arc(p[id].x,p[id].y,5/viewport.zoom,0,Math.PI*2);target.fill();target.font=12/viewport.zoom+'px sans-serif';target.fillText(label,p[id].x+10/viewport.zoom,p[id].y-8/viewport.zoom);}
  }
  function tick(time) { const dt=Math.min(.05,(time-last)/1000||0);last=time;
    if(playing){let dx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),dy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);const n=Math.hypot(dx,dy)||1,step=320*dt;if(K.canWalk(current(),player.x+dx/n*step,player.y))player.x+=dx/n*step;if(K.canWalk(current(),player.x,player.y+dy/n*step))player.y+=dy/n*step;if(dx||dy){viewport.x=player.x;viewport.y=player.y;dirty=true;}}
    if(dirty){dirty=false;const d=canvas.width/size.w;ctx.setTransform(d,0,0,d,0,0);ctx.fillStyle='#0d1510';ctx.fillRect(0,0,size.w,size.h);ctx.save();ctx.translate(size.w/2,size.h/2);ctx.scale(viewport.zoom,viewport.zoom);ctx.translate(-viewport.x,-viewport.y);render();ctx.restore();$('zoom-value').textContent=Math.round(viewport.zoom*100)+'%';}
    requestAnimationFrame(tick);
  }
  function brush(pos) {const p=current(),t=p.world.tileSize,r=Math.max(0,Math.min(12,+$('brush').value||0)),cx=Math.floor(pos.x/t),cy=Math.floor(pos.y/t);for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const tx=cx+x,ty=cy+y;if(x*x+y*y<=r*r&&tx>=0&&ty>=0&&tx<p.world.cols&&ty<p.world.rows)p.walkable[ty*p.world.cols+tx]=tool==='walk'?1:0;}dirty=true;}
  function paintLine(from,to){const t=current().world.tileSize,steps=Math.max(1,Math.ceil(Math.hypot(to.x-from.x,to.y-from.y)/(t/2)));for(let i=0;i<=steps;i++)brush({x:from.x+(to.x-from.x)*i/steps,y:from.y+(to.y-from.y)*i/steps});}
  canvas.addEventListener('pointerdown',async e=>{if(busy)return;canvas.focus();const pos=world(e);if(space||e.button===1||e.button===2){drag={kind:'pan',sx:e.clientX,sy:e.clientY,vx:viewport.x,vy:viewport.y};canvas.setPointerCapture(e.pointerId);e.preventDefault();return;}if(playing)return;
    if(paletteId){const builtIn=LIBRARY.find(a=>a.id===paletteId), def=builtIn||current().assets.find(a=>a.id===paletteId), l=current().layers.find(l=>l.id===layerId);if(l.locked){toast('선택한 레이어의 잠금을 먼저 해제하세요');return;}setBusy(true);try{const a=current().assets.find(a=>a.id===paletteId)||await asset(def,true);const off=offset(l),o=object(a,snap(pos.x-off.x),snap(pos.y-off.y),builtIn?builtIn.width:400);history.change(p=>{if(!p.assets.some(x=>x.id===a.id))p.assets.push(a);p.layers.find(x=>x.id===layerId).objects.push(o);});selected=o.id;changed('이미지 배치됨 · 속성에서 크기와 발 기준점을 맞추세요');}catch(err){toast(err.message);}finally{setBusy(false);}return;}
    if(tool==='start'||tool==='exit'){mutate(p=>{p[tool]={x:Math.min(p.world.cols*p.world.tileSize-1,Math.max(0,snap(pos.x))),y:Math.min(p.world.rows*p.world.tileSize-1,Math.max(0,snap(pos.y)))};});return;}
    if(tool==='walk'||tool==='block'){history.begin();brush(pos);drag={kind:'brush',last:pos};canvas.setPointerCapture(e.pointerId);return;}
    const existing=selectedPair();let resize=false;if(existing&&!existing.l.locked){const off=offset(existing.l),q=K.local(existing.o,pos.x-off.x,pos.y-off.y);resize=Math.hypot((q.x-existing.o.width)*viewport.zoom,(q.y-existing.o.height)*viewport.zoom)<12;}
    const pair=resize?existing:selectAt(pos);if(pair){history.begin();drag={kind:resize?'resize':'move',pos,before:K.clone(pair.o),id:pair.o.id};canvas.setPointerCapture(e.pointerId);}
  });
  canvas.addEventListener('pointermove',e=>{const pos=world(e);$('coords').textContent='x '+Math.round(pos.x)+' · y '+Math.round(pos.y)+' | tile '+Math.floor(pos.x/current().world.tileSize)+', '+Math.floor(pos.y/current().world.tileSize);if(!drag)return;
    if(drag.kind==='pan'){viewport.x=drag.vx-(e.clientX-drag.sx)/viewport.zoom;viewport.y=drag.vy-(e.clientY-drag.sy)/viewport.zoom;dirty=true;}
    else if(drag.kind==='brush'){paintLine(drag.last,pos);drag.last=pos;}
    else{const pair=selectedPair();if(!pair)return;const o=pair.o,b=drag.before;if(drag.kind==='move'){o.x=Math.max(-40000,Math.min(40000,snap(b.x+pos.x-drag.pos.x)));o.y=Math.max(-40000,Math.min(40000,snap(b.y+pos.y-drag.pos.y)));}else{const off=offset(pair.l),q=K.local(b,pos.x-off.x,pos.y-off.y);Object.assign(o,K.resize(b,pos.x-off.x,pos.y-off.y,$('aspect').checked,$('snap').checked?current().world.tileSize:1));o.x=Math.max(-40000,Math.min(40000,o.x));o.y=Math.max(-40000,Math.min(40000,o.y));}dirty=true;}
  });
  function endDrag(){if(!drag)return;if(drag.kind!=='pan'){try{K.validate(current());history.end();changed();}catch(e){if(history.pending){history.project=history.pending;history.pending=null;}toast(e.message);refresh();}}drag=null;}
  canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);canvas.addEventListener('contextmenu',e=>e.preventDefault());
  function zoom(factor,anchor){const old=viewport.zoom;viewport.zoom=Math.max(.025,Math.min(3,old*factor));if(anchor){viewport.x=anchor.x-(anchor.x-viewport.x)*old/viewport.zoom;viewport.y=anchor.y-(anchor.y-viewport.y)*old/viewport.zoom;}dirty=true;}
  canvas.addEventListener('wheel',e=>{e.preventDefault();zoom(e.deltaY<0?1.12:1/1.12,world(e));},{passive:false});
  for(const b of document.querySelectorAll('[data-scene-tool]'))b.onclick=()=>{tool=b.dataset.sceneTool;paletteId=null;playing=false;keys.clear();for(const x of document.querySelectorAll('[data-scene-tool]'))x.classList.toggle('active',x===b);if(tool==='walk'||tool==='block')$('show-nav').checked=true;palette();refresh();};
  function property(id,key){const input=$(id);let ratio=1;input.addEventListener('focus',()=>{history.begin();const pair=selectedPair();if(pair)ratio=pair.o.height/pair.o.width;});input.addEventListener('input',()=>{const pair=selectedPair();if(!pair||pair.l.locked)return;if(key!=='name'&&(!input.value.trim()||!Number.isFinite(Number(input.value))))return;const v=key==='name'?input.value:Number(input.value);if((key==='width'||key==='height')&&v<=0)return;history.begin();const o=pair.o;o[key]=v;if($('aspect').checked&&key==='width')o.height=v*ratio;if($('aspect').checked&&key==='height')o.width=v/ratio;dirty=true;});input.addEventListener('change',()=>{try{K.validate(current());history.end();changed();}catch(e){if(history.pending){history.project=history.pending;history.pending=null;}toast(e.message);refresh();}});input.addEventListener('blur',()=>{if(history.pending){try{K.validate(current());history.end();changed();}catch(e){history.project=history.pending;history.pending=null;refresh();}}});}
  for(const [id,key] of [['object-name','name'],['x','x'],['y','y'],['width','width'],['height','height'],['pivot-x','pivotX'],['pivot-y','pivotY'],['rotation','rotation'],['opacity','opacity']])property(id,key);
  $('layer-sort').onchange=()=>mutate(p=>{p.layers.find(l=>l.id===layerId).sort=$('layer-sort').value;});
  $('layer-name').onchange=()=>mutate(p=>{p.layers.find(l=>l.id===layerId).name=$('layer-name').value;});
  $('parallax').onchange=()=>mutate(p=>{p.layers.find(l=>l.id===layerId).parallax=Number($('parallax').value);});
  $('flip').onclick=()=>mutate(()=>{const q=selectedPair();if(q&&!q.l.locked)q.o.flipX=!q.o.flipX;});
  $('delete').onclick=()=>mutate(()=>{const q=selectedPair();if(q&&!q.l.locked){q.l.objects=q.l.objects.filter(o=>o.id!==selected);selected=null;}});
  $('duplicate').onclick=()=>mutate(()=>{const q=selectedPair();if(q&&!q.l.locked){const o={...K.clone(q.o),id:uid('obj'),x:Math.min(40000,q.o.x+40),y:Math.min(40000,q.o.y+40)};q.l.objects.push(o);selected=o.id;}});
  $('object-layer').onchange=()=>mutate(p=>{const q=selectedPair(),l=p.layers.find(l=>l.id===$('object-layer').value);if(q&&!q.l.locked&&!l.locked){q.l.objects=q.l.objects.filter(o=>o.id!==selected);l.objects.push(q.o);layerId=l.id;}});
  function layerMove(delta){mutate(p=>{const i=p.layers.findIndex(l=>l.id===layerId),j=i+delta;if(j>=0&&j<p.layers.length)[p.layers[i],p.layers[j]]=[p.layers[j],p.layers[i]];});}
  $('layer-up').onclick=()=>layerMove(1);$('layer-down').onclick=()=>layerMove(-1);$('layer-add').onclick=()=>mutate(p=>{if(p.layers.length>=24)throw new Error('최대 24레이어');const l={id:uid('layer'),name:'새 레이어 '+(p.layers.length+1),visible:true,locked:false,sort:'flat',parallax:1,objects:[]};p.layers.push(l);layerId=l.id;});
  $('undo').onclick=()=>{endDrag();history.undo();selected=null;paletteId=null;palette();changed();};$('redo').onclick=()=>{endDrag();history.redo();selected=null;palette();changed();};
  $('fit').onclick=fit;$('minus').onclick=()=>zoom(1/1.2);$('plus').onclick=()=>zoom(1.2);for(const id of ['show-grid','show-nav','snap'])$(id).onchange=()=>{dirty=true;};$('search').oninput=palette;
  $('play').onclick=()=>{endDrag();if(playing){playing=false;keys.clear();}else{if(!K.canWalk(current(),current().start.x,current().start.y)){toast('시작점이 막혀 있습니다. 길을 열거나 시작점을 옮기세요');return;}playing=true;selected=null;paletteId=null;player={...current().start};viewport={x:player.x,y:player.y,zoom:Math.min(size.w/1600,size.h/1000)};}palette();refresh();};
  $('check').onclick=()=>{const r=K.route(current());toast((r.pass?'연결 PASS · ':'연결 FAIL · ')+r.reason+' ('+r.visited+'칸)');};
  function download(name,blob){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);}
  $('save').onclick=()=>{endDrag();try{const p=K.validate(current());download(p.name.replace(/[\\/:*?"<>|]/g,'-')+'.scene.json',new Blob([JSON.stringify(p)],{type:'application/json'}));$('status').textContent='프로젝트 JSON 내보냄 · 이미지 크기/기준점/레이어/길 포함';}catch(e){toast(e.message);}};
  $('png').onclick=()=>{const p=current(),out=document.createElement('canvas'),ratio=2048/Math.max(p.world.cols*p.world.tileSize,p.world.rows*p.world.tileSize);out.width=Math.round(p.world.cols*p.world.tileSize*ratio);out.height=Math.round(p.world.rows*p.world.tileSize*ratio);const target=out.getContext('2d');target.fillStyle='#0d1510';target.fillRect(0,0,out.width,out.height);target.scale(ratio,ratio);const viewBefore=viewport;viewport={...viewport,x:p.world.cols*p.world.tileSize/2,y:p.world.rows*p.world.tileSize/2};render(target,false);viewport=viewBefore;try{out.toBlob(blob=>{if(blob)download(p.name+'.overview.png',blob);},'image/png');}catch(e){toast('PNG 내보내기는 로컬 서버에서 열어 사용하세요');}};
  async function importProject(raw){const p=K.validate(raw),temp=new Map();for(const a of p.assets){const im=await picture(a.src);if(im.naturalWidth!==a.width||im.naturalHeight!==a.height)throw new Error(a.name+' 원본 크기가 파일과 다릅니다');temp.set(a.src,im);}history.import(p);for(const [src,im] of temp)loaded.set(src,im);selected=null;paletteId=null;playing=false;keys.clear();layerId=p.layers[0].id;palette();changed('씬 불러오기 완료');fit();}
  $('load').onclick=()=>{if(!busy)$('project-file').click();};$('project-file').onchange=async e=>{if(busy)return;const file=e.target.files[0];if(!file)return;setBusy(true);try{if(file.size>32000000)throw new Error('프로젝트 최대 32MB');await importProject(JSON.parse(await file.text()));}catch(err){toast('현재 씬 유지 · '+err.message);}finally{setBusy(false);e.target.value='';}};
  $('import').onclick=()=>{if(!busy)$('image-file').click();};$('image-file').onchange=async e=>{if(busy)return;const file=e.target.files[0];if(!file)return;setBusy(true);try{if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>10000000)throw new Error('PNG/JPEG/WebP 10MB 이하를 선택하세요');const src=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});const a=await asset({id:uid('asset'),name:file.name.replace(/\.[^.]+$/,''),src},true);history.change(p=>p.assets.push(a));paletteId=a.id;selected=null;changed('투명 여백을 제외한 이미지가 팔레트에 추가됐습니다');palette();}catch(err){toast(err.message);}finally{setBusy(false);e.target.value='';}};
  $('reset').onclick=async()=>{if(busy)return;endDrag();setBusy(true);try{await importProject(await preset($('preset').value));}catch(e){toast(e.message);}finally{setBusy(false);}};
  $('legacy').onclick=()=>{location.href='editor.html?workspace=tiles';};$('inspector-toggle').onclick=()=>$('inspector').classList.toggle('mobile-hidden');
  window.addEventListener('keydown',e=>{if(busy)return;if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;const key=e.key.toLowerCase();if((e.ctrlKey||e.metaKey)&&key==='s'){e.preventDefault();$('save').click();return;}if((e.ctrlKey||e.metaKey)&&(key==='z'||key==='y')){e.preventDefault();(key==='y'||e.shiftKey?$('redo'):$('undo')).click();return;}if(key===' '){space=true;e.preventDefault();}if(playing){if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){keys.add(key);e.preventDefault();}if(key==='escape')$('play').click();return;}if(key==='escape'){paletteId=null;selected=null;palette();refresh();}if(key==='delete'||key==='backspace'){e.preventDefault();$('delete').click();}if(key==='v')document.querySelector('[data-scene-tool="select"]').click();if(key==='b')document.querySelector('[data-scene-tool="walk"]').click();if(key==='e')document.querySelector('[data-scene-tool="block"]').click();});
  window.addEventListener('keyup',e=>{keys.delete(e.key.toLowerCase());if(e.key===' ')space=false;});window.addEventListener('blur',()=>{keys.clear();space=false;endDrag();});
  try{await Promise.all([script('assets/map/hell_rift/interspace_20261005/layout.js'),script('assets/map/ch1/production_finish/layout.js')]);history=new K.History(await preset('rift'));try{const raw=localStorage.getItem(CACHE_KEY);if(raw){const p=K.validate(JSON.parse(raw));await importProject(p);}}catch(e){toast('기존 복구 씬을 읽지 못해 승인 원화로 시작합니다');}resize();fit();refresh();palette();$('status').textContent='준비됨 · '+current().name+' / 본편에 자동 적용하지 않음';new ResizeObserver(resize).observe($('stage'));picture('img/exoduser_warrior/south.png').then(im=>{warrior=im;dirty=true;}).catch(()=>{});setBusy(false); $('workspace').inert=false; requestAnimationFrame(tick);
    // Read-only diagnostics for local UI QA; import uses the same validated atomic path.
    window.EXODUSER_SCENE_EDITOR={snapshot:()=>K.clone(current()),view:()=>({...viewport}),selection:()=>selected,importProject,ready:true};
  }catch(e){$('status').textContent='씬 시작 실패 · '+e.message;toast(e.message);}
})();
