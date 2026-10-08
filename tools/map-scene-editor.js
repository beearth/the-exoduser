/* Image composition workspace mounted inside the canonical editor. No game/save-slot bridge. */
(async function () {
  'use strict';
  if (new URLSearchParams(location.search).get('workspace') === 'tiles') return;
  const $ = id => document.getElementById('scene-' + id), K = window.MapSceneCore;
  document.body.classList.add('scene-mode'); $('workspace').hidden = false; $('workspace').inert = true;
  const canvas = $('canvas'), ctx = canvas.getContext('2d'), pictures = new Map(), keys = new Set();
  let history, selected = null, layerId = 'mid', paletteId = null, tool = 'select', playing = false, player, drag = null, space = false, busy = true;
  let viewport = { x: 4000, y: 4000, zoom: .08 }, size = { w: 1, h: 1 }, dirty = true, last = 0, toastTimer, autosaveTimer;
  let objectListFactory, objectSceneListFactory, objectFocusFactory, objectFrameFactory, objectPage=0, objectLayer=null;
  const batchIds=new Set();let batchLayer=null;
  function clearBatch(){batchIds.clear();batchLayer=null;}
  function releaseHeld(){keys.clear();space=false;}
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
  function setBusy(value){busy=value;$('workspace').inert=value;if(history){$('resident-access-check').disabled=value||playing||dialogueOpen||!residentAccessFactory;placementUI();objectListUI();maskResolutionUI();}if(value){keys.clear();space=false;}}
  const uid = prefix => prefix + '-' + crypto.randomUUID();
  function toast(message) { $('toast').textContent = message; $('toast').hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').hidden = true; }, 4000); }
  function script(src) { return new Promise((resolve, reject) => { const el = document.createElement('script'); el.src = src; el.onload = resolve; el.onerror = () => reject(new Error('데이터 로드 실패: ' + src)); document.head.appendChild(el); }); }
  function picture(src) {
    if (pictures.has(src)) return pictures.get(src);
    const promise = new Promise((resolve, reject) => { const im = new Image(); im.onload = () => { if (im.naturalWidth > 8192 || im.naturalHeight > 8192) return reject(new Error('이미지 최대 크기는 8192px입니다')); resolve(im); dirty = true; }; im.onerror = () => { pictures.delete(src); reject(new Error('이미지를 읽지 못했습니다')); }; im.src = src; });
    pictures.set(src, promise); return promise;
  }
  const loaded = new Map();
  let residentLighting, residentIdle, groundDetail, groundDetailEnabled = true;
  let scaleComparisonFactory, scaleComparisonKey = null;
  // Runtime composition masks: default remains the legacy 1024px path; source bitmaps stay untouched.
  const softMasks = new Map();
  let maskResolutionMode = 'legacy';
  function maskBufferResolution(o, a, im, native = false) {
    const ratio = 1024 / Math.max(o.width, o.height), width = Math.max(1, Math.round(o.width * ratio)), height = Math.max(1, Math.round(o.height * ratio));
    const legacy = {width,height,legacyWidth:width,legacyHeight:height,native:false,reason:'legacy-1024'};
    if (!native) return legacy;
    if (!Number.isFinite(o.width) || !Number.isFinite(o.height) || o.width <= 0 || o.height <= 0) return {...legacy,reason:'invalid-world-size'};
    if (!Number.isSafeInteger(im?.naturalWidth) || !Number.isSafeInteger(im?.naturalHeight) || im.naturalWidth <= 0 || im.naturalHeight <= 0 || a?.width !== im.naturalWidth || a?.height !== im.naturalHeight) return {...legacy,reason:'source-dimensions-mismatch'};
    const c = a.crop;
    if (!c || ![c.x,c.y,c.w,c.h].every(Number.isFinite) || c.x < 0 || c.y < 0 || c.w < 1 || c.h < 1 || c.x + c.w > im.naturalWidth || c.y + c.h > im.naturalHeight) return {...legacy,reason:'invalid-source-crop'};
    // Canvas dimensions are integral; fractional crop registration is kept in drawImage.
    return {...legacy,width:Math.ceil(c.w),height:Math.ceil(c.h),native:true,reason:'source-native-crop'};
  }
  function selectedMaskObjectId() {
    const pair = selectedPair();
    return !playing && batchIds.size <= 1 && pair?.o.mask && (pair.o.maskFeather || pair.o.sourceParallax !== undefined) ? pair.o.id : null;
  }
  function syncNativeMaskCache() {
    const id = maskResolutionMode === 'native' ? selectedMaskObjectId() : null;
    for (const [key,entry] of softMasks) if (entry.native && key !== id) softMasks.delete(key);
    return id;
  }
  function maskResolutionSnapshot() {
    const pair = selectedPair(), a = pair && current().assets.find(a=>a.id===pair.o.assetId), im = a && loaded.get(a.src);
    const eligible = selectedMaskObjectId(), q = eligible && im ? maskBufferResolution(pair.o,a,im,true) : null;
    const entry = eligible && softMasks.get(eligible);
    let retainedRgbaBytes = 0, nativeEntries = 0;
    for (const value of softMasks.values()) { retainedRgbaBytes += 8 * value.image.width * value.image.height; if (value.native) nativeEntries++; }
    return Object.freeze({mode:maskResolutionMode,selectedObjectId:eligible,ready:!!q?.native,reason:q?.reason || (eligible?'source-not-loaded':'selected-composed-mask-required'),sourceWidth:im?.naturalWidth??null,sourceHeight:im?.naturalHeight??null,cropWidth:a?.crop.w??null,cropHeight:a?.crop.h??null,legacyWidth:q?.legacyWidth??null,legacyHeight:q?.legacyHeight??null,nativeWidth:q?.native?q.width:null,nativeHeight:q?.native?q.height:null,activeMode:entry?.native?'native':'legacy',activeWidth:entry?.image.width??null,activeHeight:entry?.image.height??null,cacheEntries:softMasks.size,nativeEntries,retainedRgbaBytes,maxEntries:8,maxNativeEntries:1,featherSampleLongAxis:256,scope:'selected-main-canvas-composed-mask-only',exportMode:'legacy',visualAccepted:false});
  }
  function maskResolutionUI() {
    syncNativeMaskCache();
    let select = $('mask-resolution');
    if (!select) {
      const field = document.createElement('label'), label = document.createElement('span'), note = document.createElement('p');
      field.className = 'scene-field'; label.textContent = '선택 마스크 이미지 비교';
      select = document.createElement('select'); select.id = 'scene-mask-resolution';
      for (const [value,text] of [['legacy','기존 중간 버퍼 · 최대 축 1024 (기본)'],['native','원본 해상도 · 선택 객체만']]) { const option = document.createElement('option'); option.value=value; option.textContent=text; select.append(option); }
      note.id = 'scene-mask-resolution-status'; note.className = 'scene-note'; note.setAttribute('role','status'); note.setAttribute('aria-live','polite');
      field.append(label,select); $('scale-comparison').append(field,note);
      select.addEventListener('change',()=>{if(!['legacy','native'].includes(select.value)){select.value=maskResolutionMode;return;}maskResolutionMode=select.value;syncNativeMaskCache();dirty=true;maskResolutionUI();});
    }
    const q = maskResolutionSnapshot(); select.value = maskResolutionMode;
    select.disabled = busy || playing || dialogueOpen || !q.selectedObjectId || !q.ready;
    const note = $('mask-resolution-status');
    note.textContent = !q.selectedObjectId ? 'feather 또는 원본 시차가 있는 마스크 객체를 하나 선택하세요.' : !q.ready ? '원본 해상도 비교 불가 · '+q.reason+' · 기존 처리 유지' : '기존 '+q.legacyWidth+' × '+q.legacyHeight+' → 원본 crop '+q.nativeWidth+' × '+q.nativeHeight+' px · '+(maskResolutionMode==='native'?'원본 해상도 비교':'기존 처리')+' · feather 256 샘플 유지 / PNG 내보내기는 기존 처리';
  }
  function maskedPicture(o, a, im, allowNative = false) {
    const nativeId = syncNativeMaskCache(), resolution = maskBufferResolution(o,a,im,allowNative && o.id===nativeId);
    const stamp = JSON.stringify([a.src, a.crop, o.width, o.height, o.mask, o.maskFeather || 0, ...(resolution.native?['source-native',im.naturalWidth,im.naturalHeight,resolution.width,resolution.height]:[])]);
    let entry = softMasks.get(o.id);
    if (!entry || entry.stamp !== stamp) {
      const w = resolution.width, h = resolution.height;
      const mask = document.createElement('canvas'), image = document.createElement('canvas'); mask.width = image.width = w; mask.height = image.height = h;
      const m = mask.getContext('2d',{willReadFrequently:true});
      if (!o.maskFeather) { m.fillStyle = '#fff'; m.beginPath(); o.mask.forEach(([x,y], i) => i ? m.lineTo(x*w,y*h) : m.moveTo(x*w,y*h)); m.closePath(); m.fill(); }
      else {
        const sample = document.createElement('canvas'), sw = resolution.legacyWidth, sh = resolution.legacyHeight, r = 256 / Math.max(sw,sh); sample.width = Math.max(1,Math.round(sw*r)); sample.height = Math.max(1,Math.round(sh*r));
        const sx = sample.getContext('2d',{willReadFrequently:true}), pixels = sx.createImageData(sample.width, sample.height), poly = o.mask.map(([x,y]) => [x*o.width,y*o.height]);
        for (let y=0;y<sample.height;y++) for (let x=0;x<sample.width;x++) {
          const px=(x+.5)/sample.width*o.width, py=(y+.5)/sample.height*o.height; let inside=false, distance=Infinity;
          for(let i=0,j=poly.length-1;i<poly.length;j=i++) {
            const v=poly[i],u=poly[j],dx=v[0]-u[0],dy=v[1]-u[1];
            if ((v[1]>py)!==(u[1]>py) && px<(u[0]-v[0])*(py-v[1])/(u[1]-v[1])+v[0]) inside=!inside;
            const t=Math.max(0,Math.min(1,((px-u[0])*dx+(py-u[1])*dy)/(dx*dx+dy*dy||1)));
            distance=Math.min(distance,Math.hypot(px-u[0]-t*dx,py-u[1]-t*dy));
          }
          if(inside){const k=(y*sample.width+x)*4,v=Math.min(1,distance/o.maskFeather);pixels.data[k]=pixels.data[k+1]=pixels.data[k+2]=255;pixels.data[k+3]=Math.round(255*v*v*(3-2*v));}
        }
        sx.putImageData(pixels,0,0);m.drawImage(sample,0,0,w,h);
      }
      entry={stamp,mask,image,native:resolution.native};softMasks.delete(o.id);softMasks.set(o.id,entry);while(softMasks.size>8)softMasks.delete(softMasks.keys().next().value);
    }
    const target=entry.image.getContext('2d',{willReadFrequently:true}), w=entry.image.width,h=entry.image.height, p=current();
    const factor=1-(o.sourceParallax ?? 1),dx=(viewport.x-p.world.cols*p.world.tileSize/2)*factor,dy=(viewport.y-p.world.rows*p.world.tileSize/2)*factor;
    const angle=-o.rotation*Math.PI/180, lx=(dx*Math.cos(angle)-dy*Math.sin(angle))*(o.flipX?-1:1),ly=dx*Math.sin(angle)+dy*Math.cos(angle);
    target.imageSmoothingQuality='high';target.clearRect(0,0,w,h);target.globalCompositeOperation='source-over';target.drawImage(im,a.crop.x,a.crop.y,a.crop.w,a.crop.h,lx/o.width*w,ly/o.height*h,w,h);
    target.globalCompositeOperation='destination-in';target.drawImage(entry.mask,0,0);target.globalCompositeOperation='source-over';return entry.image;
  }
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
  // Approach anchors belong to this editor preview, not the preserved STORY POIs.
  const RESIDENT_ANCHORS = Object.freeze([
    {npcId:'rift-rest-haran',x:4780,y:6460,visualX:1132*25/6,visualY:1552*25/6,labelHeight:146,approach:{x:4820,y:6500}},
    {npcId:'rift-gift-berin',x:6020,y:5580,visualX:1445*25/6,visualY:1335*25/6,labelHeight:188,approach:{x:5980,y:5620}},
    {npcId:'rift-request-nessa',x:6300,y:5020,visualX:1515*25/6,visualY:1198*25/6,labelHeight:175,approach:{x:6220,y:5020}},
    {npcId:'rift-prepare-dorik',x:5220,y:2500,visualX:1206*25/6,visualY:603*25/6,labelHeight:71,approach:{x:5180,y:2540}}
  ].map(a=>Object.freeze({...a,approach:Object.freeze(a.approach)})));
  let residentAnchorsFactory, residentGroundingFactory, residentRegistrationFactory, residentRegistrationKey = null, residentGrounding, residentGroundingScene, dialogueSceneSupport, dialogueFactory, dialogueRaw, dialogueController, dialogueScene, nearestResident = null, dialogueOpen = false;
  const residentAnchors = () => residentAnchorsFactory?.(current()) || (dialogueSceneSupport?.(current()) ? RESIDENT_ANCHORS : []);
  let residentAccessFactory, residentAccessReport = null;
  let residentPreviewFactory, residentPreviewOrigin = null;
  let residentPreviewButtons = [], residentPreviewBlockedState = null;
  const residentStatusText = {ready:'접근 가능', 'foot-blocked':'발이 막힌 바닥 위에 있음', 'start-blocked':'시작점이 막힘', 'no-route':'시작점과 길이 끊김', 'no-approach':'대화 거리 안 접근점 없음'};
  const pointText = p => Math.round(p.x*100)/100+', '+Math.round(p.y*100)/100;
  function invalidateResidentAccess() {
    residentAccessReport = null;
    residentPreviewButtons = []; residentPreviewBlockedState = null;
    $('resident-access-list').replaceChildren();
    $('resident-access-summary').textContent='주민 위치나 길을 바꿨습니다. 다시 검사하세요.';
    dirty=true;
  }
  function residentAccessUI() {
    residentPreviewButtons = []; residentPreviewBlockedState = null;
    const supported=current().residentLayerReview?.kind==='independent-resident-preview-v1';
    $('resident-access-section').hidden=!supported;
    $('resident-access-check').disabled=busy||playing||dialogueOpen||!residentAccessFactory;
    if(!supported) return;
    if(!residentAccessReport) {
      if(!residentAccessFactory) $('resident-access-summary').textContent='주민 접근 검사 모듈을 준비하지 못했습니다.';
      return;
    }
    const report=residentAccessReport;
    $('resident-access-list').replaceChildren();
    if(report.mode!=='independent') {
      $('resident-access-summary').textContent=report.mode==='invalid-profile'?'주민 레이어 구성이 맞지 않습니다. 그림·크기 비율·발 기준·가림 설정을 확인하세요.':'현재 씬의 주민 접근을 검사할 수 없습니다.';
      return;
    }
    const passed=report.rows.filter(r=>r.status==='ready').length;
    $('resident-access-summary').textContent=passed+' / '+report.rows.length+'명 접근 가능 · 시작점에서 연결된 길 기준';
    for(const row of report.rows) {
      const card=document.createElement('div');card.className='scene-resident-card';card.dataset.npcId=row.npcId;card.dataset.status=row.status;
      const name=dialogueRaw?.npcs.find(n=>n.npcId===row.npcId)?.name?.ko || row.npcId;
      const heading=document.createElement('strong');heading.textContent=name;
      const state=document.createElement('p');state.className='scene-resident-state';state.textContent=residentStatusText[row.status]||'검사 불가';
      const details=document.createElement('p');details.textContent='발 '+pointText(row.foot)+(row.approach?' · 접근 '+pointText(row.approach)+' · 거리 '+Math.round(row.approach.distance*100)/100:'');
      const focus=document.createElement('button');focus.type='button';focus.textContent=name+' · 발 위치 보기';focus.disabled=playing||dialogueOpen;
      focus.onclick=()=>{if(busy||playing||dialogueOpen||!residentAccessReport)return;const foot=current().layers.find(l=>l.id==='foot');const o=foot?.objects.find(o=>o.id===row.objectId);if(!o)return;selected=o.id;layerId=foot.id;paletteId=null;tool='select';viewport={x:o.x,y:o.y-60,zoom:Math.min(size.w/900,size.h/600)};clampCamera();if(matchMedia('(max-width:760px)').matches)$('inspector').classList.add('mobile-hidden');palette();refresh();canvas.focus();};
      const preview=document.createElement('button');preview.type='button';preview.dataset.residentPreview=row.npcId;preview.textContent=name+' · 접근점에서 보행 시험';
      preview.onclick=()=>startResidentPreview(row.npcId);
      residentPreviewButtons.push({button:preview,ready:row.status==='ready'});
      card.append(heading,state,details,focus,preview);$('resident-access-list').append(card);
    }
    syncResidentPreviewButtons();
  }
  function residentPreviewBlocked() {
    return busy||playing||dialogueOpen||!!drag||!!history.pending||batchIds.size>1||!residentPreviewFactory||!dialogueFactory||!dialogueRaw;
  }
  function syncResidentPreviewButtons() {
    const blocked=residentPreviewBlocked()||!dialogueController;
    if(blocked===residentPreviewBlockedState)return;
    residentPreviewBlockedState=blocked;
    for(const {button,ready} of residentPreviewButtons)button.disabled=blocked||!ready;
  }
  function startResidentPreview(npcId) {
    if(residentPreviewBlocked())return;
    const q=residentPreviewFactory(current(),npcId,(scene,x,y,r)=>K.canWalk(scene,x,y,r));
    residentAccessReport=q.report;residentAccessUI();dirty=true;
    if(!q.ready){toast('보행 시험 시작 불가 · '+q.reason);return;}
    syncDialogue();
    const near=dialogueController?.nearest(q.player);
    if(near?.npcId!==q.npcId){toast('이 접근점에서 선택한 주민과 대화할 수 없습니다. 주민 사이 거리를 확인하세요.');return;}
    residentPreviewOrigin={scene:current(),npcId:q.npcId,objectId:q.objectId,entry:{...q.player},view:{...viewport},selected,layerId,paletteId,tool,player:player?{...player}:null,batch:[...batchIds],batchLayer,inspectorHidden:$('inspector').classList.contains('mobile-hidden')};
    playing=true;releaseHeld();clearBatch();selected=null;paletteId=null;tool='select';player={...q.player};
    viewport={x:player.x,y:player.y,zoom:Math.min(size.w/900,size.h/600)};clampCamera();
    if(matchMedia('(max-width:760px)').matches)$('inspector').classList.add('mobile-hidden');
    palette();refresh();canvas.focus();toast(near.name.ko+' 접근점 · F 대화 · ESC 보행 종료');
  }
  function restoreResidentPreview() {
    const origin=residentPreviewOrigin;residentPreviewOrigin=null;
    if(!origin||origin.scene!==current())return;
    selected=origin.selected;layerId=origin.layerId;paletteId=origin.paletteId;tool=origin.tool;player=origin.player?{...origin.player}:undefined;viewport={...origin.view};
    clearBatch();for(const id of origin.batch)batchIds.add(id);batchLayer=origin.batchLayer;
    $('inspector').classList.toggle('mobile-hidden',origin.inspectorHidden);
  }
  function drawResidentAccess(target) {
    if(playing||drag||history.pending||!$('resident-access-show').checked||residentAccessReport?.mode!=='independent')return;
    target.save();
    for(const row of residentAccessReport.rows) {
      const color=row.status==='ready'?'#a4deb9':'#f1ba78', f=row.foot, z=viewport.zoom;
      target.strokeStyle=color;target.fillStyle=color;target.lineWidth=1.5/z;target.setLineDash([5/z,4/z]);target.beginPath();target.arc(f.x,f.y,140,0,Math.PI*2);target.stroke();target.setLineDash([]);
      target.beginPath();target.moveTo(f.x-6/z,f.y);target.lineTo(f.x+6/z,f.y);target.moveTo(f.x,f.y-6/z);target.lineTo(f.x,f.y+6/z);target.stroke();
      if(row.approach){target.beginPath();target.moveTo(f.x,f.y);target.lineTo(row.approach.x,row.approach.y);target.stroke();target.beginPath();target.arc(row.approach.x,row.approach.y,5/z,0,Math.PI*2);target.fill();}
    }
    target.restore();
  }
  function closeDialogue(reason = 'ui-close') {
    dialogueController?.close(reason); dialogueOpen = false; nearestResident = null; keys.clear(); space = false;if(history){placementUI();objectListUI();}
    if($('dialogue').open) $('dialogue').close();
    $('talk').hidden = true; dirty = true;
  }
  function syncDialogue() {
    if(dialogueScene === current()) return;
    closeDialogue('scene-changed'); dialogueScene = current();
    dialogueController = dialogueFactory && dialogueRaw ? dialogueFactory(current(), dialogueRaw, (scene,x,y,r) => K.canWalk(scene,x,y,r), residentAnchors()) : null;
    nearestResident = null;
  }
  function showDialogue(state) {
    if(!state?.isOpen || !state.view) { closeDialogue('finished'); canvas.focus(); return; }
    const v=state.view;
    $('dialogue-name').textContent=v.name.ko;
    $('dialogue-role').textContent=dialogueRaw.npcs.find(n=>n.npcId===v.npcId)?.residentType_ko || '';
    $('dialogue-text').textContent=v.text.ko;
    $('dialogue-options').replaceChildren();
    for(const [i,o] of v.options.entries()) {
      const b=document.createElement('button');b.type='button';b.dataset.dialogueOption=o.id;b.textContent=(i+1)+'. '+o.label.ko;
      b.onclick=()=>showDialogue(dialogueController.choose(o.id));$('dialogue-options').append(b);
    }
    const notes=[];
    if(state.trialFlags?.['rift.berin.giftGiven']) notes.push('베린의 유품을 받는 선택');
    if(state.trialFlags?.['rift.nessa.questAccepted']) notes.push('린을 찾는 부탁 수락');
    $('dialogue-record').textContent=notes.length?'이번 시험의 기록 · '+notes.join(' / '):'';$('dialogue-record').hidden=!notes.length;
    dialogueOpen=true;keys.clear();space=false;$('talk').hidden=true;placementUI();objectListUI();
    if(!$('dialogue').open) $('dialogue').showModal();
    ($('dialogue-options').querySelector('button') || $('dialogue-close')).focus();dirty=true;
  }
  function talk() {
    if(!playing || dialogueOpen || !dialogueController) return;
    const near=dialogueController.nearest(player);if(near) showDialogue(dialogueController.open(near.npcId,player));
  }
  function updateNearby() {
    const near=playing&&!dialogueOpen&&dialogueController ? dialogueController.nearest(player) : null;
    if(near?.npcId!==nearestResident?.npcId) {nearestResident=near;$('talk').hidden=!near;if(near)$('talk').textContent=near.name.ko+' · 이야기 듣기 [F]';dirty=true;}
    if(dialogueOpen && !dialogueController?.snapshot().isOpen) closeDialogue('out-of-reach');
  }
  function residentMarkers(target) {
    if(!playing || !dialogueController || target!==ctx || !nearestResident) return;
    const a=residentAnchors().find(a=>a.npcId===nearestResident.npcId);if(!a)return;
    const name=nearestResident.name.ko,z=viewport.zoom;
    target.save();target.textAlign='center';target.font=(12/z)+'px sans-serif';target.lineWidth=1/z;
    target.beginPath();target.arc(a.x,a.y,6/z,0,Math.PI*2);target.fillStyle='#111b16cc';target.fill();target.strokeStyle='#e5c989';target.stroke();
    target.fillStyle='#eadbb8';target.shadowColor='#000';target.shadowBlur=4;
    target.fillText(name,a.visualX,a.visualY-a.labelHeight-8/z);target.restore();
  }
  $('talk').onclick=talk;
  $('dialogue-close').onclick=()=>{closeDialogue();canvas.focus();};
  $('dialogue').addEventListener('cancel',e=>{e.preventDefault();closeDialogue('escape');canvas.focus();});
  const selectedPair = () => { for (const l of current().layers) { const o = l.objects.find(o => o.id === selected); if (o) return { l, o }; } return null; };
  function placementUI() {
    const pair=selectedPair(),a=pair&&current().assets.find(a=>a.id===pair.o.assetId);
    const blocked=busy||playing||dialogueOpen||batchIds.size>1||!pair||pair.l.locked||!pair.l.visible||!a||a.internal||!!pair.o.mask;
    $('placement-save').disabled=blocked;$('placement-reset').disabled=blocked||a?.placementPreset===undefined;
    const chosen=a||(paletteId&&current().assets.find(a=>a.id===paletteId));
    if(!chosen){$('placement-status').textContent='선택한 이미지의 다음 배치에 크기와 기준점만 적용합니다.';return;}
    if(chosen.internal||pair?.o.mask){$('placement-status').textContent='분할·마스크 그림은 배치 규격을 저장하지 않습니다.';return;}
    try {
      const rule=K.placementDefaults(chosen),def=LIBRARY.find(d=>d.id===chosen.id),width=rule?.width??def?.width??400,height=rule?.height??width*chosen.crop.h/chosen.crop.w;
      const value=n=>Number(n.toFixed(3));
      $('placement-status').textContent=(chosen.placementPreset?'저장된 규격':chosen.unitySprite?'Unity 기본 규격':'기본 규격')+' · '+value(width)+' × '+value(height)+' world px · 기준 ('+value(rule?.pivotX??.5)+', '+value(rule?.pivotY??1)+')';
    } catch(e) {$('placement-save').disabled=$('placement-reset').disabled=true;$('placement-status').textContent='배치 규격 오류 · '+e.message;}
  }
  function savePlacement(reset) {
    if(busy||playing||dialogueOpen||batchIds.size>1)return;endDrag();
    const pair=selectedPair(),a=pair&&current().assets.find(a=>a.id===pair.o.assetId);
    if(!pair||pair.l.locked||!pair.l.visible||!a||a.internal||pair.o.mask)return;
    if(reset&&a.placementPreset===undefined)return;
    try {
      const preset=reset?null:K.capturePlacement(a,pair.o),assetId=a.id;
      mutate(p=>{const target=p.assets.find(a=>a.id===assetId);if(reset)delete target.placementPreset;else target.placementPreset=preset;},reset?'다음 배치에 기본 규격을 사용합니다':'이 이미지의 다음 배치 크기와 발 기준을 저장했습니다');
    } catch(e){toast('현재 씬 유지 · '+e.message);refresh();}
  }
  function syncBatchSelection(){
    if(batchLayer!==layerId){clearBatch();return;}
    const layer=current().layers.find(l=>l.id===layerId),ids=new Set(layer?.objects.map(o=>o.id)||[]);
    for(const id of batchIds)if(!ids.has(id))batchIds.delete(id);
    if(!batchIds.size)batchLayer=null;
  }
  function batchObjects(){
    const layer=current().layers.find(l=>l.id===layerId);
    if(busy||playing||dialogueOpen||!layer||layer.locked||!layer.visible||batchLayer!==layer.id||!batchIds.size)return null;
    const byId=new Map(layer.objects.map(o=>[o.id,o])),objects=[...batchIds].map(id=>byId.get(id));
    if(objects.some(o=>!o))return null;
    return {layer,objects};
  }
  function batchUI(){
    syncBatchSelection();const count=batchIds.size,blocked=busy||playing||dialogueOpen,available=!!batchObjects();
    $('batch-summary').textContent=count?'함께 이동 '+count+'개 · 상대 간격을 유지합니다':'객체 목록에서 함께 이동할 그림을 체크하세요.';
    const layer=current().layers.find(l=>l.id===layerId);$('batch-all').disabled=blocked||!layer||layer.locked||!layer.visible||!layer.objects.length;
    $('batch-clear').disabled=blocked||!count;
    for(const id of ['batch-dx','batch-dy','batch-move'])$(id).disabled=!available||!K.translateObjects;
  }
  function toggleBatch(objectId,checked){
    if(busy||playing||dialogueOpen)return;endDrag();
    const layer=current().layers.find(l=>l.id===layerId),o=layer?.objects.find(o=>o.id===objectId);
    if(!layer||layer.locked||!layer.visible||!o)return;
    syncBatchSelection();batchLayer=layer.id;
    if(checked){batchIds.add(o.id);selected=o.id;}else{batchIds.delete(o.id);if(batchIds.size&&selected===o.id)selected=[...batchIds].at(-1);}
    paletteId=null;tool='select';releaseHeld();palette();refresh();
    $('object-list').querySelectorAll('.scene-object-batch input').forEach(input=>{if(input.dataset.objectId===objectId)input.focus();});
  }
  function moveBatch(){
    if(busy||playing||dialogueOpen)return;endDrag();const group=batchObjects();if(!group)return;
    const x=$('batch-dx').value,y=$('batch-dy').value;
    if(!x.trim()||!y.trim()){toast('이동할 X와 Y 거리를 입력하세요');return;}
    try{
      const plan=K.translateObjects(group.objects,snap(Number(x)),snap(Number(y))),id=group.layer.id;
      if(plan.every((v,i)=>v.x===group.objects[i].x&&v.y===group.objects[i].y)){toast('이동 거리 0 · 현재 배치 유지');return;}
      mutate(p=>{const l=p.layers.find(l=>l.id===id);if(!l||l.locked||!l.visible)throw new Error('현재 레이어를 다시 선택하세요');const byId=new Map(l.objects.map(o=>[o.id,o]));for(const v of plan){const o=byId.get(v.objectId);if(!o)throw new Error('선택 객체가 바뀌었습니다');o.x=v.x;o.y=v.y;}},plan.length+'개를 같은 거리로 이동했습니다');
    }catch(e){toast('전체 배치 유지 · '+e.message);refresh();}
  }
  function objectListUI() {
    revealAssetUI();batchUI();
    const blocked=busy||playing||dialogueOpen;
    $('object-search').disabled=blocked;$('object-scope').disabled=blocked;
    $('object-list').replaceChildren();$('object-prev').disabled=$('object-next').disabled=true;
    if(!objectListFactory){$('object-summary').textContent='객체 목록 모듈을 준비하지 못했습니다.';$('object-page').textContent='';return;}
    const allLayers=$('object-scope').value==='all',queryLayer=allLayers?'*':layerId;
    if(objectLayer!==queryLayer){objectLayer=queryLayer;objectPage=0;}
    try {
      const report=allLayers?objectSceneListFactory(current(),$('object-search').value,objectPage):objectListFactory(current(),layerId,$('object-search').value,objectPage);objectPage=report.page;
      $('object-summary').textContent=report.layerName+' · '+report.matched+' / '+report.total+'개'+(!report.visible?' · 숨긴 층입니다. 먼저 표시하세요.':report.locked?' · 잠긴 층입니다. 먼저 잠금을 해제하세요.':'');
      $('object-page').textContent=report.pages?(report.page+1)+' / '+report.pages+'쪽 · 한 번에 최대 50개':'검색 결과 없음';
      $('object-prev').disabled=blocked||report.page===0;$('object-next').disabled=blocked||report.page+1>=report.pages;
      for(const row of report.rows) {
        const rowLayerId=row.layerId||report.layerId,rowLayer=current().layers.find(l=>l.id===rowLayerId),active=rowLayerId===layerId&&row.objectId===selected;
        const card=document.createElement('div');card.className='scene-object-row'+(active?' active':'');card.dataset.objectId=row.objectId;card.dataset.layerId=rowLayerId;
        const choose=document.createElement('button');choose.type='button';choose.className='scene-object-select';choose.textContent=row.name;choose.title=row.objectId;choose.setAttribute('aria-pressed',String(active));choose.disabled=blocked||!rowLayer||rowLayer.locked||!rowLayer.visible;
        choose.onclick=()=>selectListedObject(rowLayerId,row.objectId,false);
        const details=document.createElement('small');details.textContent=(allLayers?row.layerName+' · ':'')+row.assetId+' · 발 '+pointText(row)+' · '+Math.round(row.width*100)/100+' × '+Math.round(row.height*100)/100+'px';
        const focus=document.createElement('button');focus.type='button';focus.className='scene-object-focus';focus.textContent='발 보기';focus.setAttribute('aria-label',row.name+' 발 위치 보기');
        focus.disabled=choose.disabled||rowLayer.parallax===0;focus.title=focus.disabled?'표시·잠금·시차 설정을 확인하세요':'그림과 길을 움직이지 않고 발 위치 보기';focus.onclick=()=>selectListedObject(rowLayerId,row.objectId,true);
        const together=document.createElement('label');together.className='scene-object-batch';
        const check=document.createElement('input');check.type='checkbox';check.dataset.objectId=row.objectId;check.checked=batchLayer===rowLayerId&&batchIds.has(row.objectId);check.disabled=choose.disabled||rowLayerId!==layerId;check.title=rowLayerId!==layerId?'먼저 이 층의 객체를 선택하세요':'';check.setAttribute('aria-label',row.name+' 함께 이동 선택');check.onchange=()=>toggleBatch(row.objectId,check.checked);
        const caption=document.createElement('span');caption.textContent='함께 이동';together.append(check,caption);
        card.classList.toggle('batch-selected',check.checked);card.append(choose,details,focus,together);$('object-list').append(card);
      }
    } catch(e){$('object-summary').textContent='객체 목록 오류 · '+e.message;$('object-page').textContent='';}
  }
  function selectListedObject(targetLayer,objectId,focus) {
    if(busy||playing||dialogueOpen||(targetLayer!==layerId&&$('object-scope').value!=='all'))return;
    endDrag();
    const l=current().layers.find(l=>l.id===targetLayer),o=l?.objects.find(o=>o.id===objectId);
    if(!l||l.locked||!l.visible||!o)return;
    try {
      const point=focus?objectFocusFactory?.(current(),targetLayer,objectId):null;if(focus&&!point)return;
      clearBatch();selected=o.id;layerId=l.id;paletteId=null;tool='select';keys.clear();space=false;
      if(point){viewport={...point,zoom:Math.min(size.w/900,size.h/600)};clampCamera();if(matchMedia('(max-width:760px)').matches)$('inspector').classList.add('mobile-hidden');}
      palette();refresh();if(focus)canvas.focus();
    } catch(e){toast('현재 씬 유지 · '+e.message);}
  }
  function autosave() { clearTimeout(autosaveTimer); autosaveTimer = setTimeout(() => { try { localStorage.setItem(CACHE_KEY, JSON.stringify(current())); $('status').textContent = '로컬 복구 저장됨 · 프로젝트 JSON으로 보존하세요'; } catch (e) { $('status').textContent = '복구 저장 공간 부족 · 프로젝트 저장을 사용하세요'; } }, 500); }
  function changed(message) { groundDetail?.invalidate();groundDetail?.prepare(current());residentPreviewOrigin=null;invalidateResidentAccess(); ambienceScene = null; dialogueScene = null; residentGroundingScene = null; closeDialogue('scene-edited'); dirty = true; refresh(); autosave(); if (message) toast(message); }
  function mutate(fn, message) { if (busy) return; try { history.change(fn); changed(message); } catch (e) { toast(e.message); refresh(); } }
  function frameSelectionUI() {
    const pair=selectedPair();
    $('frame-selection').disabled=busy||playing||dialogueOpen||!!drag||!!history?.pending||!objectFrameFactory||!pair?.l.visible||pair.l.parallax===0;
  }
  function frameSelected() {
    if(busy||playing||dialogueOpen||drag||history?.pending||!objectFrameFactory)return false;
    const pair=selectedPair();if(!pair||!pair.l.visible||pair.l.parallax===0)return false;
    const ids=batchLayer===pair.l.id&&batchIds.size>1?[...batchIds]:[pair.o.id];
    try {
      const view=objectFrameFactory(current(),pair.l.id,ids,size.w,size.h);if(!view)return false;
      viewport=view;releaseHeld();dirty=true;canvas.focus();return true;
    } catch(e){toast('선택 맞춤 불가 · '+e.message);return false;}
  }
  function fit() { viewport = { x: current().world.cols * current().world.tileSize / 2, y: current().world.rows * current().world.tileSize / 2, zoom: Math.min((size.w-60)/(current().world.cols*current().world.tileSize), (size.h-110)/(current().world.rows*current().world.tileSize)) }; dirty = true; }
  function clampCamera() {const w=current().world,halfX=size.w/viewport.zoom/2,halfY=size.h/viewport.zoom/2,maxX=w.cols*w.tileSize,maxY=w.rows*w.tileSize;viewport.x=halfX*2>=maxX?maxX/2:Math.max(halfX,Math.min(maxX-halfX,viewport.x));viewport.y=halfY*2>=maxY?maxY/2:Math.max(halfY,Math.min(maxY-halfY,viewport.y));}
  function resize() { const r = $('stage').getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); size = { w:r.width, h:r.height }; canvas.width = Math.round(r.width*d); canvas.height = Math.round(r.height*d); dirty = true; }
  function world(e) { const r = canvas.getBoundingClientRect(); return { x:(e.clientX-r.left-size.w/2)/viewport.zoom+viewport.x, y:(e.clientY-r.top-size.h/2)/viewport.zoom+viewport.y }; }
  function snap(v) { return $('snap').checked ? Math.round(v/current().world.tileSize)*current().world.tileSize : v; }
  function offset(l) { return { x:(viewport.x-current().world.cols*current().world.tileSize/2)*(1-l.parallax), y:(viewport.y-current().world.rows*current().world.tileSize/2)*(1-l.parallax) }; }
  function selectAt(pos) {
    for (const l of [...current().layers].reverse()) { if (!l.visible || l.locked) continue; const off = offset(l), objects = l.sort === 'foot' ? [...l.objects].sort((a,b)=>a.y-b.y).reverse() : [...l.objects].reverse();
      for (const o of objects) { if (K.hit(o,pos.x-off.x,pos.y-off.y)) { const a = current().assets.find(a=>a.id===o.assetId), im = loaded.get(a.src), q=K.local(o,pos.x-off.x,pos.y-off.y);
        // Polygon/alpha hit testing avoids selecting transparent margins over smaller objects.
        if (im && !o.mask) { const test=document.createElement('canvas');test.width=test.height=1;const tx=test.getContext('2d');tx.drawImage(im,a.crop.x+q.x/o.width*a.crop.w,a.crop.y+q.y/o.height*a.crop.h,1,1,0,0,1,1);try{if(tx.getImageData(0,0,1,1).data[3]<8)continue;}catch(e){} }
        if(batchLayer!==l.id||!batchIds.has(o.id))clearBatch();selected=o.id;layerId=l.id;refresh();return {l,o};
      } }
    } clearBatch();selected=null;refresh();return null;
  }
  function selectedScaleComparison() {
    const pair=selectedPair();
    if(!scaleComparisonFactory||!pair||batchIds.size>1)return null;
    const a=current().assets.find(a=>a.id===pair.o.assetId);
    return scaleComparisonFactory(pair.o,a,{zoom:viewport.zoom,rasterScale:canvas.width/size.w});
  }
  function scaleComparisonUI() {
    const card=$('scale-comparison'),q=selectedScaleComparison();
    card.hidden=!q;
    if(!q){scaleComparisonKey=null;return;}
    const key=JSON.stringify(q);
    if(key===scaleComparisonKey)return;
    scaleComparisonKey=key;card.dataset.resolution=q.resolution.status;
    $('scale-bars').hidden=$('scale-details').hidden=!q.valid;
    if(!q.valid){$('scale-height').textContent='비교할 수 없음 · '+q.reason;$('scale-quality').textContent='이미지 크기와 화면 배율을 확인하세요.';return;}
    const num=v=>v>0&&v<.001?'< 0.001':new Intl.NumberFormat('ko-KR',{maximumFractionDigits:3}).format(v);
    const pixels=(v,unit)=>num(v.width)+' × '+num(v.height)+' '+unit;
    $('scale-height').textContent='표시 영역 높이 '+num(q.world.height)+' world px · 전사 기준의 '+num(q.heightRatio)+'배';
    $('scale-reference-bar').style.height=q.bars.reference+'px';$('scale-object-bar').style.height=q.bars.object+'px';
    $('scale-world').textContent=pixels(q.world,'world px');$('scale-source').textContent=pixels(q.sourceCrop,'px');$('scale-screen').textContent=pixels(q.css,'CSS px');
    const r=q.resolution;
    $('scale-raster').textContent=r.status==='masked'?'마스크 · 직접 비교 제외':'X '+num(r.scaleX)+'배 · Y '+num(r.scaleY)+'배';
    $('scale-quality').textContent=r.status==='masked'?'마스크가 적용되어 원본 crop 배율로 선명도를 직접 판정하지 않습니다.':r.status==='enlarged'?'현재 화면에서 원본보다 확대되어 흐려질 수 있습니다. 그림 크기와 확대 배율을 함께 확인하세요.':r.status==='native'?'현재 화면의 최대 축이 원본 해상도와 같습니다.':'현재 화면은 원본보다 축소해서 표시합니다.';
  }
  function selectedResidentRegistration() {
    const pair=selectedPair();
    if(!residentRegistrationFactory||!pair||batchIds.size>1||!['obj-resident-haran','obj-resident-berin','obj-resident-nessa','obj-resident-dorik'].includes(pair.o.id))return null;
    const q=residentRegistrationFactory(current());
    return q.supported?{selectedName:pair.o.name,selectedObjectId:pair.o.id,...q}:null;
  }
  function residentRegistrationUI() {
    const card=$('registration-check'),q=selectedResidentRegistration();
    if(card.hidden!==!q)card.hidden=!q;
    if(!q){residentRegistrationKey=null;return;}
    const key=JSON.stringify(q);
    if(key===residentRegistrationKey)return;
    residentRegistrationKey=key;
    const issue=q.issue;
    card.dataset.valid=String(q.valid);card.dataset.target=issue?.target||'';card.dataset.field=issue?.field||'';
    $('registration-state').textContent=q.selectedName+' · '+(q.valid?' 배치 규격 일치':' 배치 규격 불일치');
    $('registration-state').style.color=q.valid?'#a4deb9':'#e9bc82';
    for(const id of ['registration-target','registration-actual','registration-expected'])$(id).hidden=q.valid;
    if(issue){
      const [type,...parts]=issue.target.split(':'),id=parts.join(':'),p=current();
      const name=type==='object'?p.layers.flatMap(l=>l.objects).find(o=>o.id===id)?.name:type==='asset'?p.assets.find(a=>a.id===id)?.name:type==='layer'?p.layers.find(l=>l.id===id)?.name:null;
      const fields={pivotX:'발 기준 X',pivotY:'발 기준 Y',rotation:'회전',flipX:'좌우 반전',opacity:'불투명도',parallax:'시차',sort:'정렬',visible:'레이어 표시','width/height':'가로·세로 비율'};
      const value=v=>JSON.stringify(v);
      $('registration-target').textContent='실패 대상 · '+(name?name+' / ':'')+issue.target+' · '+(fields[issue.field]||issue.field);
      $('registration-actual').textContent='현재 값 · '+value(issue.actual);
      $('registration-expected').textContent='필요한 값 · '+value(issue.expected);
    }
    $('registration-note').textContent=q.valid?'그림·발 기준·배경 등록이 맞습니다. 길과 대화 접근은 주민 접근 검사로 확인하세요.':'첫 번째 규격 불일치입니다. 주민 접지·조명·접근·대화 시험을 사용할 수 없습니다. 값을 수정한 뒤 다시 확인하세요.';
  }
  function refresh() {
    const p = current(), pair = selectedPair(), active = p.layers.find(l=>l.id===layerId)||p.layers[0]; layerId=active.id;
    syncBatchSelection();const multiple=batchIds.size>1;
    if(tool==='pivot' && (!pair || pair.l.locked || !pair.l.visible || playing||multiple)) tool='select';
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
    for(const input of $('transform').querySelectorAll('input,select,button')) input.disabled=!pair||pair.l.locked||multiple;
    $('pivot-pick').disabled=!pair||pair.l.locked||!pair.l.visible||playing||multiple;
    $('pivot-pick').setAttribute('aria-pressed',String(tool==='pivot'));
    $('pivot-pick').textContent=tool==='pivot'?'접지점을 클릭 · Esc 취소':'⊕ 발 기준 찍기';
    $('pivot-hint').textContent=tool==='pivot'?'선택한 그림 안의 접지점을 클릭하세요. 그림과 길은 움직이지 않습니다.':'그림 위치를 유지하며 접지점을 바꿉니다.';
    canvas.style.cursor=tool==='pivot'?'crosshair':'';
    for(const b of document.querySelectorAll('[data-scene-tool]'))b.classList.toggle('active',b.dataset.sceneTool===tool);
    if(pair){const o=pair.o,a=p.assets.find(a=>a.id===o.assetId);for(const [id,key] of [['x','x'],['y','y'],['width','width'],['height','height'],['pivot-x','pivotX'],['pivot-y','pivotY'],['rotation','rotation'],['opacity','opacity']])$(id).value=Number(o[key].toFixed(3));$('feather').value=o.maskFeather??0;$('source-parallax').value=o.sourceParallax??1;$('feather').disabled=$('source-parallax').disabled=pair.l.locked||!o.mask||multiple;$('object-name').value=o.name;$('object-layer').value=pair.l.id;$('source-info').textContent='원본 '+a.width+' × '+a.height+' · 표시 영역 '+a.crop.w+' × '+a.crop.h+' · '+Math.round(o.height/p.world.tileSize*10)/10+' tile 높이';}
    else $('source-info').textContent='';
    const i=p.layers.indexOf(active);$('layer-up').disabled=i===p.layers.length-1;$('layer-down').disabled=i===0;
    $('unity-import').disabled=playing||dialogueOpen;
    residentAccessUI();placementUI();objectListUI();scaleComparisonUI();maskResolutionUI();residentRegistrationUI();
    $('play').textContent=playing?'■ 보행 종료':'▶ 보행 시험';$('view-label').textContent=playing?'보행 시험 · WASD / 방향키 · F 대화 · ESC 종료':tool==='pivot'?'발 기준 찍기 · 선택한 그림 안 클릭 · Esc 취소':'SOUTH → NORTH · 이미지와 충돌을 별도로 편집';
    $('cameras').replaceChildren();for(const c of p.cameras){const b=document.createElement('button');b.textContent=c.name;b.onclick=()=>{viewport={x:c.x,y:c.y,zoom:Math.min(size.w/1800,size.h/1100)};clampCamera();dirty=true;};$('cameras').append(b);} dirty=true;
  }
  function revealAssetUI() {
    frameSelectionUI();
    $('reveal-asset').disabled=busy||playing||dialogueOpen||!!drag||batchIds.size>1||!selectedPair();
  }
  function revealSelectedAsset() {
    if(busy||playing||dialogueOpen||drag||batchIds.size>1)return;
    const pair=selectedPair();if(!pair)return;
    const id=pair.o.assetId,asset=LIBRARY.find(a=>a.id===id)||current().assets.find(a=>a.id===id&&!a.internal);
    if(!asset){toast('이 오브젝트의 원본은 팔레트에 공개된 재료가 아닙니다.');return;}
    const find=()=>[...$('palette').children].find(b=>b.dataset.assetId===id);
    let button=find();
    if(!button){$('search').value='';palette();button=find();}
    if(!button){toast('팔레트에서 원본 재료를 찾지 못했습니다.');return;}
    for(const b of $('palette').children)b.classList.remove('revealed');
    button.classList.add('revealed');button.scrollIntoView({block:'nearest',inline:'nearest'});
    toast('원본 재료: '+asset.name+' · 오브젝트 선택 유지');
  }
  function palette() {
    const filter=$('search').value.toLowerCase(), defs=[...LIBRARY,...current().assets.filter(a=>!a.internal&&!LIBRARY.some(d=>d.id===a.id)).map(a=>({...a,width:400,layer:'foot'}))];$('palette').replaceChildren();
    for(const a of defs.filter(a=>a.name.toLowerCase().includes(filter))){const b=document.createElement('button');b.className='scene-asset'+(paletteId===a.id?' active':'');b.title=a.name;b.dataset.assetId=a.id;const img=document.createElement('img');img.src=a.src;img.alt='';const label=document.createElement('span');label.textContent=a.name;b.append(img,label);b.onclick=()=>{paletteId=paletteId===a.id?null:a.id;tool='select';clearBatch();selected=null;palette();refresh();};$('palette').append(b);}
  }
  function drawObject(o, l, target=ctx, includeSelection=true) {
    const a=current().assets.find(a=>a.id===o.assetId), im=a&&loaded.get(a.src);if(!im)return;const off=offset(l);
    target.save();
    try{
      target.translate(o.x+off.x,o.y+off.y);target.rotate(o.rotation*Math.PI/180);target.scale(o.flipX?-1:1,1);target.globalAlpha=o.opacity;
      if(target===ctx){const scaleY=residentIdle?.scaleFor(o)||1;if(scaleY!==1)target.scale(1,scaleY);}
      if(o.mask){target.beginPath();for(const [i,v] of o.mask.entries()){const x=v[0]*o.width-o.pivotX*o.width,y=v[1]*o.height-o.pivotY*o.height;i?target.lineTo(x,y):target.moveTo(x,y);}target.closePath();target.clip();}
      const graded=residentLighting?.picture(o,a,im);
      if(graded){
        const m=target.getTransform();
        if(Math.hypot(m.a,m.b)*o.width<a.crop.w||Math.hypot(m.c,m.d)*o.height<a.crop.h){target.imageSmoothingEnabled=true;target.imageSmoothingQuality='high';}
        target.drawImage(graded,-o.width*o.pivotX,-o.height*o.pivotY,o.width,o.height);
      }else if(o.mask&&(o.maskFeather||o.sourceParallax!==undefined)){const composed=maskedPicture(o,a,im,target===ctx&&includeSelection);target.drawImage(composed,-o.width*o.pivotX,-o.height*o.pivotY,o.width,o.height);}
      else target.drawImage(im,a.crop.x,a.crop.y,a.crop.w,a.crop.h,-o.width*o.pivotX,-o.height*o.pivotY,o.width,o.height);
    }finally{target.restore();}
    if(includeSelection&&(o.id===selected||batchIds.has(o.id))){target.save();target.translate(o.x+off.x,o.y+off.y);target.rotate(o.rotation*Math.PI/180);target.scale(o.flipX?-1:1,1);target.strokeStyle='#e8cf8e';target.lineWidth=1.5/viewport.zoom;target.strokeRect(-o.width*o.pivotX,-o.height*o.pivotY,o.width,o.height);if(batchIds.size<=1){const hs=8/viewport.zoom;target.fillStyle='#efdba1';target.fillRect(o.width*(1-o.pivotX)-hs/2,o.height*(1-o.pivotY)-hs/2,hs,hs);}target.restore();target.save();target.strokeStyle='#70cfbc';target.lineWidth=1/viewport.zoom;target.beginPath();target.moveTo(o.x+off.x-9/viewport.zoom,o.y+off.y);target.lineTo(o.x+off.x+9/viewport.zoom,o.y+off.y);target.moveTo(o.x+off.x,o.y+off.y-9/viewport.zoom);target.lineTo(o.x+off.x,o.y+off.y+9/viewport.zoom);target.stroke();target.restore();}
  }
  let warrior, ambienceFactory, ambience, ambienceScene, ambienceTime = 0, ambienceFrame = 0;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  $('ambient').checked = !reducedMotion.matches;
  reducedMotion.addEventListener('change', e => { if(e.matches) $('ambient').checked=false; dirty=true; });
  $('ambient').onchange=()=>{dirty=true;};
  function syncAmbience(){
    const p=current();
    if(ambienceScene!==p){ambienceScene=p;ambience=ambienceFactory?.(p,(scene,x,y)=>K.canWalk(scene,x,y))||null;}
    $('ambient-option').hidden=!ambience;$('ambient-option').style.display=ambience?'':'none';
  }
  function drawAmbience(target,band){if(target===ctx&&ambience&&$('ambient').checked)ambience.draw(target,band,ambienceTime,{player:playing?player:null});}
  function actor(target) { if(window.MapSceneActor){window.MapSceneActor.draw(target,player);return;}target.save();target.fillStyle='#070c09aa';target.beginPath();target.ellipse(player.x,player.y,25,11,0,0,Math.PI*2);target.fill();if(warrior){target.imageSmoothingEnabled=false;const scale=80/29;target.drawImage(warrior,0,0,48,48,player.x-22*scale,player.y-43*scale,48*scale,48*scale);}else{target.fillStyle='#eddfa7';target.fillRect(player.x-12,player.y-55,24,55);}target.restore(); }
  function render(target=ctx, overlays=true) {
    const p=current();residentLighting?.prepare(p);if(overlays){syncAmbience();syncDialogue();}if(residentGroundingScene!==p){residentGroundingScene=p;residentGrounding=residentGroundingFactory?.(p,(scene,x,y,r)=>K.canWalk(scene,x,y,r))||null;}let actorDrawn=false;
    if(target===ctx&&overlays)residentIdle?.prepare(p,ambienceTime,!!ambience&&$('ambient').checked&&!reducedMotion.matches&&!busy&&!drag&&!history.pending,selected?[selected,...batchIds]:[...batchIds]);
    for(const l of p.layers){if(!l.visible)continue;const objects=l.sort==='foot'?[...l.objects].sort((a,b)=>a.y-b.y):l.objects;
      if(l.id==='foot'){groundDetail?.draw(target,p,{enabled:groundDetailEnabled});residentGrounding?.draw(target);}
      if(playing&&l.sort==='foot'){for(const o of objects){if(!actorDrawn&&player.y<=o.y){actor(target);actorDrawn=true;}drawObject(o,l,target,overlays);}if(!actorDrawn){actor(target);actorDrawn=true;}}
      else for(const o of objects)drawObject(o,l,target,overlays);
      if(overlays&&l.id==='abyss'){drawAmbience(target,'back');drawAmbience(target,'ground');}
    }if(playing&&!actorDrawn)actor(target);
    if(overlays)drawAmbience(target,'front');
    if(!overlays)return;residentMarkers(target);const w=p.world,t=w.tileSize;
    if($('show-nav').checked){target.fillStyle='#66d99c3d';for(let y=0;y<w.rows;y++)for(let x=0;x<w.cols;x++)if(p.walkable[y*w.cols+x])target.fillRect(x*t,y*t,t,t);}
    if($('show-grid').checked){target.strokeStyle='#b7c8b722';target.lineWidth=.5/viewport.zoom;target.beginPath();for(let x=0;x<=w.cols;x++){target.moveTo(x*t,0);target.lineTo(x*t,w.rows*t);}for(let y=0;y<=w.rows;y++){target.moveTo(0,y*t);target.lineTo(w.cols*t,y*t);}target.stroke();}
    drawResidentAccess(target);
    target.strokeStyle='#738976';target.lineWidth=1/viewport.zoom;target.strokeRect(0,0,w.cols*t,w.rows*t);
    for(const [id,color,label] of [['start','#8ecdb0','START'],['exit','#e6cc8d','EXIT']]){target.fillStyle=color;target.beginPath();target.arc(p[id].x,p[id].y,5/viewport.zoom,0,Math.PI*2);target.fill();target.font=12/viewport.zoom+'px sans-serif';target.fillText(label,p[id].x+10/viewport.zoom,p[id].y-8/viewport.zoom);}
  }
  function tick(time) { ambienceTime=time;if(ambience&&$('ambient').checked&&!document.hidden&&time-ambienceFrame>=1000/30){dirty=true;ambienceFrame=time;} const dt=Math.min(.05,(time-last)/1000||0);last=time;
    if(playing&&!dialogueOpen){let dx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),dy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);const before={...player},n=Math.hypot(dx,dy)||1,step=320*dt;if(K.canWalk(current(),player.x+dx/n*step,player.y))player.x+=dx/n*step;if(K.canWalk(current(),player.x,player.y+dy/n*step))player.y+=dy/n*step;if(window.MapSceneActor?.tick(time,player.x-before.x,player.y-before.y))dirty=true;if(dx||dy){viewport.x=player.x;viewport.y=player.y;clampCamera();dirty=true;}}
    if(playing&&dialogueOpen&&window.MapSceneActor?.tick(time,0,0))dirty=true;
    updateNearby();
    syncResidentPreviewButtons();
    if(dirty){dirty=false;const d=canvas.width/size.w;ctx.setTransform(d,0,0,d,0,0);ctx.fillStyle='#0d1510';ctx.fillRect(0,0,size.w,size.h);ctx.save();ctx.translate(size.w/2,size.h/2);ctx.scale(viewport.zoom,viewport.zoom);ctx.translate(-viewport.x,-viewport.y);render();ctx.restore();$('zoom-value').textContent=Math.round(viewport.zoom*100)+'%';scaleComparisonUI();residentRegistrationUI();}
    requestAnimationFrame(tick);
  }
  function brush(pos) {if(residentAccessReport)invalidateResidentAccess();ambienceScene=null;dialogueScene=null;closeDialogue('nav-edited');const p=current(),t=p.world.tileSize,r=Math.max(0,Math.min(12,+$('brush').value||0)),cx=Math.floor(pos.x/t),cy=Math.floor(pos.y/t);for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){const tx=cx+x,ty=cy+y;if(x*x+y*y<=r*r&&tx>=0&&ty>=0&&tx<p.world.cols&&ty<p.world.rows)p.walkable[ty*p.world.cols+tx]=tool==='walk'?1:0;}groundDetail?.invalidate();dirty=true;}
  function paintLine(from,to){const t=current().world.tileSize,steps=Math.max(1,Math.ceil(Math.hypot(to.x-from.x,to.y-from.y)/(t/2)));for(let i=0;i<=steps;i++)brush({x:from.x+(to.x-from.x)*i/steps,y:from.y+(to.y-from.y)*i/steps});}
  canvas.addEventListener('pointerdown',async e=>{if(busy||dialogueOpen||drag)return;canvas.focus();const pos=world(e);if(space||e.button===1||e.button===2){drag={kind:'pan',sx:e.clientX,sy:e.clientY,vx:viewport.x,vy:viewport.y};drag.pointerId=e.pointerId;canvas.setPointerCapture(e.pointerId);e.preventDefault();return;}if(playing)return;
    if(tool==='pivot'){
      const q=selectedPair();if(!q||q.l.locked||!q.l.visible){tool='select';refresh();return;}
      const off=offset(q.l),point=K.local(q.o,pos.x-off.x,pos.y-off.y);
      if(point.x<0||point.y<0||point.x>q.o.width||point.y>q.o.height){toast('선택한 그림 안의 접지점을 클릭하세요');return;}
      mutate(()=>Object.assign(q.o,K.reanchor(q.o,point.x/q.o.width,point.y/q.o.height)),'그림 위치를 유지한 채 발 기준을 옮겼습니다');
      tool='select';if(matchMedia('(max-width:760px)').matches)$('inspector').classList.remove('mobile-hidden');refresh();return;
    }
    if(paletteId){const builtIn=LIBRARY.find(a=>a.id===paletteId), def=builtIn||current().assets.find(a=>a.id===paletteId), l=current().layers.find(l=>l.id===layerId);if(l.locked){toast('선택한 레이어의 잠금을 먼저 해제하세요');return;}setBusy(true);try{const a=current().assets.find(a=>a.id===paletteId)||await asset(def,true);const off=offset(l),placement=K.placementDefaults(a),o=object(a,snap(pos.x-off.x),snap(pos.y-off.y),placement?placement.width:(builtIn?builtIn.width:400),placement?placement.pivotX:.5,placement?placement.pivotY:1);if(placement)o.height=placement.height;history.change(p=>{if(!p.assets.some(x=>x.id===a.id))p.assets.push(a);p.layers.find(x=>x.id===layerId).objects.push(o);});selected=o.id;changed('이미지 배치됨 · 속성에서 크기와 발 기준점을 맞추세요');}catch(err){toast(err.message);}finally{setBusy(false);}return;}
    if(tool==='start'||tool==='exit'){mutate(p=>{p[tool]={x:Math.min(p.world.cols*p.world.tileSize-1,Math.max(0,snap(pos.x))),y:Math.min(p.world.rows*p.world.tileSize-1,Math.max(0,snap(pos.y)))};});return;}
    if(tool==='walk'||tool==='block'){history.begin();brush(pos);drag={kind:'brush',last:pos};drag.pointerId=e.pointerId;canvas.setPointerCapture(e.pointerId);return;}
    const existing=selectedPair();let resize=false;if(existing&&!existing.l.locked&&batchIds.size<=1){const off=offset(existing.l),q=K.local(existing.o,pos.x-off.x,pos.y-off.y);resize=Math.hypot((q.x-existing.o.width)*viewport.zoom,(q.y-existing.o.height)*viewport.zoom)<12;}
    const pair=resize?existing:selectAt(pos);if(pair){const group=batchObjects();history.begin();drag=group&&batchIds.size>1?{kind:'batch',pos,layer:pair.l.id,before:group.objects.map(o=>({id:o.id,x:o.x,y:o.y})),id:pair.o.id,rejected:false}:{kind:resize?'resize':'move',pos,before:K.clone(pair.o),id:pair.o.id};drag.pointerId=e.pointerId;canvas.setPointerCapture(e.pointerId);}
  });
  canvas.addEventListener('pointermove',e=>{const pos=world(e);$('coords').textContent='x '+Math.round(pos.x)+' · y '+Math.round(pos.y)+' | tile '+Math.floor(pos.x/current().world.tileSize)+', '+Math.floor(pos.y/current().world.tileSize);if(!drag||e.pointerId!==drag.pointerId)return;
    if(drag.kind!=='pan'&&residentAccessReport)invalidateResidentAccess();
    if(drag.kind==='pan'){viewport.x=drag.vx-(e.clientX-drag.sx)/viewport.zoom;viewport.y=drag.vy-(e.clientY-drag.sy)/viewport.zoom;dirty=true;}
    else if(drag.kind==='brush'){paintLine(drag.last,pos);drag.last=pos;}
    else if(drag.kind==='batch'){
      const group=batchObjects();if(!group||group.layer.id!==drag.layer){endDrag();return;}
      try{const plan=K.translateObjects(drag.before,snap(pos.x-drag.pos.x),snap(pos.y-drag.pos.y)),byId=new Map(group.objects.map(o=>[o.id,o]));for(const v of plan){const o=byId.get(v.objectId);if(!o)throw new Error('선택 객체가 바뀌었습니다');o.x=v.x;o.y=v.y;}drag.rejected=false;}
      catch(err){const byId=new Map(group.objects.map(o=>[o.id,o]));for(const b of drag.before){const o=byId.get(b.id);if(o){o.x=b.x;o.y=b.y;}}if(!drag.rejected)toast('전체 배치 유지 · '+err.message);drag.rejected=true;}dirty=true;
    }
    else{const pair=selectedPair();if(!pair)return;const o=pair.o,b=drag.before;if(drag.kind==='move'){o.x=Math.max(-40000,Math.min(40000,snap(b.x+pos.x-drag.pos.x)));o.y=Math.max(-40000,Math.min(40000,snap(b.y+pos.y-drag.pos.y)));}else{const off=offset(pair.l),q=K.local(b,pos.x-off.x,pos.y-off.y);Object.assign(o,K.resize(b,pos.x-off.x,pos.y-off.y,$('aspect').checked,$('snap').checked?current().world.tileSize:1));o.x=Math.max(-40000,Math.min(40000,o.x));o.y=Math.max(-40000,Math.min(40000,o.y));}dirty=true;}
  });
  function endDrag(e){if(!drag||(e&&e.pointerId!==drag.pointerId))return;if(drag.kind!=='pan'){try{K.validate(current());history.end();changed();}catch(e){if(history.pending){history.project=history.pending;history.pending=null;}toast(e.message);refresh();}}drag=null;revealAssetUI();}
  canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);canvas.addEventListener('contextmenu',e=>e.preventDefault());
  function zoom(factor,anchor){const old=viewport.zoom;viewport.zoom=Math.max(.025,Math.min(3,old*factor));if(anchor){viewport.x=anchor.x-(anchor.x-viewport.x)*old/viewport.zoom;viewport.y=anchor.y-(anchor.y-viewport.y)*old/viewport.zoom;}dirty=true;}
  canvas.addEventListener('wheel',e=>{e.preventDefault();if(dialogueOpen)return;zoom(e.deltaY<0?1.12:1/1.12,world(e));},{passive:false});
  for(const b of document.querySelectorAll('[data-scene-tool]'))b.onclick=()=>{closeDialogue('tool-changed');residentPreviewOrigin=null;tool=b.dataset.sceneTool;if(tool!=='select')clearBatch();paletteId=null;playing=false;keys.clear();for(const x of document.querySelectorAll('[data-scene-tool]'))x.classList.toggle('active',x===b);if(tool==='walk'||tool==='block')$('show-nav').checked=true;palette();refresh();};
  function property(id,key){const input=$(id);let ratio=1;input.addEventListener('focus',()=>{history.begin();const pair=selectedPair();if(pair)ratio=pair.o.height/pair.o.width;});input.addEventListener('input',()=>{const pair=selectedPair();if(!pair||pair.l.locked||batchIds.size>1)return;if(key!=='name'&&(!input.value.trim()||!Number.isFinite(Number(input.value))))return;const v=key==='name'?input.value:Number(input.value);if((key==='width'||key==='height')&&v<=0)return;history.begin();invalidateResidentAccess();const o=pair.o;o[key]=v;if($('aspect').checked&&key==='width')o.height=v*ratio;if($('aspect').checked&&key==='height')o.width=v/ratio;dirty=true;});input.addEventListener('change',()=>{try{K.validate(current());history.end();changed();}catch(e){if(history.pending){history.project=history.pending;history.pending=null;}toast(e.message);refresh();}});input.addEventListener('blur',()=>{if(history.pending){try{K.validate(current());history.end();changed();}catch(e){history.project=history.pending;history.pending=null;refresh();}}});}
  for(const [id,key] of [['object-name','name'],['x','x'],['y','y'],['width','width'],['height','height'],['pivot-x','pivotX'],['pivot-y','pivotY'],['rotation','rotation'],['opacity','opacity'],['feather','maskFeather'],['source-parallax','sourceParallax']])property(id,key);
  $('object-search').oninput=()=>{if(busy||playing||dialogueOpen)return;objectPage=0;objectListUI();};
  $('object-scope').onchange=()=>{if(busy||playing||dialogueOpen)return;objectPage=0;objectListUI();};
  for(const [id,delta] of [['object-prev',-1],['object-next',1]])$(id).onclick=()=>{if(busy||playing||dialogueOpen||$(id).disabled)return;objectPage=Math.max(0,objectPage+delta);objectListUI();};
  $('batch-all').onclick=()=>{if(busy||playing||dialogueOpen)return;endDrag();const l=current().layers.find(l=>l.id===layerId);if(!l||l.locked||!l.visible||!l.objects.length)return;clearBatch();batchLayer=l.id;for(const o of l.objects)batchIds.add(o.id);selected=l.objects.at(-1).id;paletteId=null;tool='select';releaseHeld();palette();refresh();};
  $('batch-clear').onclick=()=>{if(busy||playing||dialogueOpen)return;endDrag();clearBatch();refresh();};
  $('batch-move').onclick=moveBatch;
  $('workspace').addEventListener('focusin',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))releaseHeld();});
  $('placement-save').onclick=()=>savePlacement(false);$('placement-reset').onclick=()=>savePlacement(true);
  $('pivot-pick').onclick=()=>{if(busy||playing||dialogueOpen)return;const q=selectedPair();if(!q||q.l.locked||!q.l.visible||batchIds.size>1)return;endDrag();tool=tool==='pivot'?'select':'pivot';paletteId=null;keys.clear();space=false;if(tool==='pivot'&&matchMedia('(max-width:760px)').matches)$('inspector').classList.add('mobile-hidden');palette();refresh();canvas.focus();};
  $('layer-sort').onchange=()=>mutate(p=>{p.layers.find(l=>l.id===layerId).sort=$('layer-sort').value;});
  $('layer-name').onchange=()=>mutate(p=>{p.layers.find(l=>l.id===layerId).name=$('layer-name').value;});
  $('parallax').onchange=()=>mutate(p=>{p.layers.find(l=>l.id===layerId).parallax=Number($('parallax').value);});
  $('flip').onclick=()=>mutate(()=>{const q=selectedPair();if(q&&!q.l.locked&&batchIds.size<=1)q.o.flipX=!q.o.flipX;});
  $('delete').onclick=()=>mutate(()=>{const q=selectedPair();if(q&&!q.l.locked&&batchIds.size<=1){q.l.objects=q.l.objects.filter(o=>o.id!==selected);selected=null;}});
  $('duplicate').onclick=()=>mutate(()=>{const q=selectedPair();if(q&&!q.l.locked&&batchIds.size<=1){const o={...K.clone(q.o),id:uid('obj'),x:Math.min(40000,q.o.x+40),y:Math.min(40000,q.o.y+40)};q.l.objects.push(o);selected=o.id;}});
  $('object-layer').onchange=()=>mutate(p=>{const q=selectedPair(),l=p.layers.find(l=>l.id===$('object-layer').value);if(q&&!q.l.locked&&!l.locked&&batchIds.size<=1){q.l.objects=q.l.objects.filter(o=>o.id!==selected);l.objects.push(q.o);layerId=l.id;}});
  function layerMove(delta){mutate(p=>{const i=p.layers.findIndex(l=>l.id===layerId),j=i+delta;if(j>=0&&j<p.layers.length)[p.layers[i],p.layers[j]]=[p.layers[j],p.layers[i]];});}
  $('layer-up').onclick=()=>layerMove(1);$('layer-down').onclick=()=>layerMove(-1);$('layer-add').onclick=()=>mutate(p=>{if(p.layers.length>=24)throw new Error('최대 24레이어');const l={id:uid('layer'),name:'새 레이어 '+(p.layers.length+1),visible:true,locked:false,sort:'flat',parallax:1,objects:[]};p.layers.push(l);layerId=l.id;});
  $('undo').onclick=()=>{endDrag();clearBatch();history.undo();selected=null;paletteId=null;palette();changed();};$('redo').onclick=()=>{endDrag();clearBatch();history.redo();selected=null;palette();changed();};
  $('fit').onclick=fit;$('minus').onclick=()=>zoom(1/1.2);$('plus').onclick=()=>zoom(1.2);for(const id of ['show-grid','show-nav','snap'])$(id).onchange=()=>{dirty=true;};$('search').oninput=palette;
  $('reveal-asset').onclick=revealSelectedAsset;
  $('frame-selection').onclick=frameSelected;
  $('play').onclick=()=>{closeDialogue('play-changed');endDrag();syncDialogue();if(playing){playing=false;releaseHeld();restoreResidentPreview();}else{residentPreviewOrigin=null;if(!K.canWalk(current(),current().start.x,current().start.y)){toast('시작점이 막혀 있습니다. 길을 열거나 시작점을 옮기세요');return;}playing=true;clearBatch();selected=null;paletteId=null;player={...current().start};viewport={x:player.x,y:player.y,zoom:Math.min(size.w/1600,size.h/1000)};clampCamera();}palette();refresh();};
  $('resident-access-check').onclick=()=>{if(busy||playing||dialogueOpen||!residentAccessFactory)return;endDrag();residentAccessReport=residentAccessFactory(current(),(scene,x,y,r)=>K.canWalk(scene,x,y,r));residentAccessUI();dirty=true;};
  $('resident-access-show').onchange=()=>{dirty=true;};
  $('check').onclick=()=>{const r=K.route(current());toast((r.pass?'연결 PASS · ':'연결 FAIL · ')+r.reason+' ('+r.visited+'칸)');};
  function download(name,blob){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);}
  $('save').onclick=()=>{endDrag();try{const p=K.validate(current());download(p.name.replace(/[\\/:*?"<>|]/g,'-')+'.scene.json',new Blob([JSON.stringify(p)],{type:'application/json'}));$('status').textContent='프로젝트 JSON 내보냄 · 이미지 크기/기준점/레이어/길 포함';}catch(e){toast(e.message);}};
  $('png').onclick=()=>{const p=current(),out=document.createElement('canvas'),ratio=2048/Math.max(p.world.cols*p.world.tileSize,p.world.rows*p.world.tileSize);out.width=Math.round(p.world.cols*p.world.tileSize*ratio);out.height=Math.round(p.world.rows*p.world.tileSize*ratio);const target=out.getContext('2d',{willReadFrequently:true});target.imageSmoothingQuality='high';target.fillStyle='#0d1510';target.fillRect(0,0,out.width,out.height);target.scale(ratio,ratio);const viewBefore=viewport;viewport={...viewport,x:p.world.cols*p.world.tileSize/2,y:p.world.rows*p.world.tileSize/2};render(target,false);viewport=viewBefore;try{out.toBlob(blob=>{if(blob)download(p.name+'.overview.png',blob);},'image/png');}catch(e){toast('PNG 내보내기는 로컬 서버에서 열어 사용하세요');}};
  async function importProject(raw, save=true){const p=K.validate(raw),temp=new Map();for(const a of p.assets){const im=await picture(a.src);if(im.naturalWidth!==a.width||im.naturalHeight!==a.height)throw new Error(a.name+' 원본 크기가 파일과 다릅니다');temp.set(a.src,im);}closeDialogue('scene-imported');residentPreviewOrigin=null;invalidateResidentAccess();history.import(p);await groundDetail?.prepare(p);for(const [src,im] of temp)loaded.set(src,im);softMasks.clear();clearBatch();selected=null;paletteId=null;playing=false;keys.clear();layerId=p.layers[0].id;palette();if(save)changed('씬 불러오기 완료');else refresh();fit();}
  async function namedProject(src){const path=K.projectSource(src),response=await fetch(path,{cache:'no-store',redirect:'error'});if(!response.ok)throw new Error('씬 파일 HTTP '+response.status);if(Number(response.headers.get('content-length'))>32000000)throw new Error('프로젝트 최대 32MB');const bytes=await response.arrayBuffer();if(bytes.byteLength>32000000)throw new Error('프로젝트 최대 32MB');return JSON.parse(new TextDecoder().decode(bytes));}
  $('load').onclick=()=>{if(!busy)$('project-file').click();};$('project-file').onchange=async e=>{if(busy)return;const file=e.target.files[0];if(!file)return;setBusy(true);try{if(file.size>32000000)throw new Error('프로젝트 최대 32MB');await importProject(JSON.parse(await file.text()));}catch(err){toast('현재 씬 유지 · '+err.message);}finally{setBusy(false);e.target.value='';}};
  $('import').onclick=()=>{if(!busy)$('image-file').click();};$('image-file').onchange=async e=>{if(busy)return;const file=e.target.files[0];if(!file)return;setBusy(true);try{if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>10000000)throw new Error('PNG/JPEG/WebP 10MB 이하를 선택하세요');const src=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);});const a=await asset({id:uid('asset'),name:file.name.replace(/\.[^.]+$/,''),src},true);history.change(p=>p.assets.push(a));paletteId=a.id;selected=null;changed('투명 여백을 제외한 이미지가 팔레트에 추가됐습니다');palette();}catch(err){toast(err.message);}finally{setBusy(false);e.target.value='';}};
  $('unity-import').onclick=()=>{if(!busy&&!playing&&!dialogueOpen)$('unity-file').click();};
  $('unity-file').onchange=async e=>{
    const files=[...e.target.files];if(busy||playing||dialogueOpen){e.target.value='';return;}if(!files.length)return;
    setBusy(true);
    try {
      if(files.length!==2)throw new Error('PNG와 같은 이름의 .png.meta 두 파일을 함께 선택하세요');
      const png=files.find(f=>/\.png$/i.test(f.name)),meta=files.find(f=>/\.png\.meta$/i.test(f.name));
      if(!png||!meta||meta.name.toLowerCase()!==png.name.toLowerCase()+'.meta')throw new Error('PNG와 .png.meta 파일 이름이 일치해야 합니다');
      if(png.type!=='image/png'||png.size>10000000||meta.size>256000)throw new Error('PNG는 10MB, .meta는 256KB 이하로 선택하세요');
      if(!window.MapSceneUnity)throw new Error('Unity 이미지 가져오기 모듈을 읽지 못했습니다');
      const worldPixelsPerUnit=Number($('unity-unit').value),raw=new TextDecoder('utf-8',{fatal:true}).decode(await meta.arrayBuffer()),info=MapSceneUnity.parseMeta(raw);
      const src=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(new Error('PNG를 읽지 못했습니다'));r.readAsDataURL(png);});
      const a=await asset({id:uid('asset'),name:png.name.replace(/\.png$/i,''),src},false);
      a.unitySprite={kind:'unity-single-sprite-v1',...info,worldPixelsPerUnit};const placement=K.unityPlacement(a);
      endDrag();history.change(p=>p.assets.push(a));paletteId=a.id;selected=null;
      changed('Unity Sprite 추가 · '+placement.width.toFixed(2)+' × '+placement.height.toFixed(2)+' world px · 기준점 유지');palette();
    } catch(err) {toast('현재 씬 유지 · '+err.message);}
    finally {setBusy(false);e.target.value='';}
  };
  $('reset').onclick=async()=>{if(busy)return;endDrag();setBusy(true);try{await importProject(await preset($('preset').value));}catch(e){toast(e.message);}finally{setBusy(false);}};
  $('legacy').onclick=()=>{location.href='editor.html?workspace=tiles';};$('inspector-toggle').onclick=()=>$('inspector').classList.toggle('mobile-hidden');
  window.addEventListener('keydown',e=>{if(busy)return;
    if(dialogueOpen){const key=e.key.toLowerCase();
      if(key==='escape'){e.preventDefault();closeDialogue('escape');canvas.focus();}
      else if(key==='tab'){e.preventDefault();const buttons=[...$('dialogue').querySelectorAll('button:not([disabled])')],index=buttons.indexOf(document.activeElement);if(buttons.length)buttons[(index+(e.shiftKey?-1:1)+buttons.length)%buttons.length].focus();}
      else if(/^[1-9]$/.test(key)&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();$('dialogue-options').children[Number(key)-1]?.click();}
      else if(e.ctrlKey||e.metaKey||e.altKey||!['tab','enter',' ','arrowup','arrowdown','pageup','pagedown','home','end'].includes(key)||(e.repeat&&['enter',' '].includes(key)))e.preventDefault();
      return;
    }
    if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;const key=e.key.toLowerCase();if(e.target.tagName==='BUTTON'&&[' ','enter'].includes(key)&&(e.target.closest('#scene-object-list')||e.target.matches('button[data-resident-preview]')||['scene-reveal-asset','scene-frame-selection','scene-object-prev','scene-object-next','scene-batch-all','scene-batch-clear','scene-batch-move'].includes(e.target.id)))return;if((e.ctrlKey||e.metaKey)&&key==='s'){e.preventDefault();$('save').click();return;}if((e.ctrlKey||e.metaKey)&&(key==='z'||key==='y')){e.preventDefault();(key==='y'||e.shiftKey?$('redo'):$('undo')).click();return;}if(key===' '){space=true;e.preventDefault();}if(playing){if(key==='f'&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();talk();return;}if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){keys.add(key);e.preventDefault();}if(key==='escape')$('play').click();return;}if(key==='f'&&e.shiftKey&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.repeat&&!e.isComposing&&!e.target.isContentEditable){if(frameSelected())e.preventDefault();return;}if(key==='escape'){if(tool==='pivot'){tool='select';if(matchMedia('(max-width:760px)').matches)$('inspector').classList.remove('mobile-hidden');refresh();return;}paletteId=null;clearBatch();selected=null;palette();refresh();}if(key==='delete'||key==='backspace'){e.preventDefault();$('delete').click();}if(key==='v')document.querySelector('[data-scene-tool="select"]').click();if(key==='b')document.querySelector('[data-scene-tool="walk"]').click();if(key==='e')document.querySelector('[data-scene-tool="block"]').click();});
  window.addEventListener('keyup',e=>{keys.delete(e.key.toLowerCase());if(e.key===' ')space=false;});window.addEventListener('blur',()=>{closeDialogue('focus-lost');keys.clear();space=false;endDrag();});
  try{try{const module=await import('./map-scene-rift-dialogue.mjs');dialogueSceneSupport=module.supportsRiftDialogueScene;
      const response=await fetch('tools/team-followup-20261005/hell-rift/STORY/rift-dialogue.json',{cache:'no-store',redirect:'error'});
      if(!response.ok||Number(response.headers.get('content-length'))>256000)throw new Error('주민 대화 데이터 로드 실패');
      const bytes=await response.arrayBuffer();if(bytes.byteLength>256000)throw new Error('주민 대화 데이터가 너무 큽니다');
      dialogueRaw=JSON.parse(new TextDecoder().decode(bytes));dialogueFactory=module.createRiftDialogue;
    }catch(e){console.warn('틈 대화 시험을 읽지 못했습니다',e);}try{const residents=await import('./map-scene-rift-residents.mjs');residentAnchorsFactory=residents.residentDialogueAnchors;residentGroundingFactory=residents.createResidentGrounding;residentRegistrationFactory=residents.inspectResidentPaintingRegistration;}catch(e){console.warn('틈 주민 모듈을 읽지 못했습니다',e);}try{residentLighting=(await import('./map-scene-resident-lighting.mjs')).createResidentLighting();}catch(e){console.warn('주민 빛 합성 모듈을 읽지 못했습니다',e);}try{residentIdle=(await import('./map-scene-resident-idle.mjs')).createResidentIdle();}catch(e){console.warn('주민 호흡 모듈을 읽지 못했습니다',e);}try{groundDetail=(await import('./map-scene-rift-ground-detail.mjs')).createRiftGroundDetail({loadImage:picture,onReady:()=>{dirty=true;}});}catch(e){console.warn('바닥 재질 모듈을 읽지 못했습니다',e);}try{scaleComparisonFactory=(await import('./map-scene-scale-comparison.mjs')).inspectScaleComparison;}catch(e){console.warn('이미지 크기 비교 모듈을 읽지 못했습니다',e);}try{residentAccessFactory=(await import('./map-scene-resident-access.mjs')).inspectResidentAccess;}catch(e){console.warn('주민 접근 검사 모듈을 읽지 못했습니다',e);}try{residentPreviewFactory=(await import('./map-scene-resident-preview.mjs')).prepareResidentPreview;}catch(e){console.warn('주민 보행 시험 모듈을 읽지 못했습니다',e);}try{const objects=await import('./map-scene-object-list.mjs?objects=20261008-all-layers');objectListFactory=objects.inspectLayerObjects;objectSceneListFactory=objects.inspectSceneObjects;objectFocusFactory=objects.focusObjectFoot;objectFrameFactory=objects.frameLayerObjects;}catch(e){console.warn('객체 목록 모듈을 읽지 못했습니다',e);}try{ambienceFactory=(await import('./map-scene-rift-ambience.mjs')).createRiftAmbience;}catch(e){console.warn('틈 분위기 모듈을 읽지 못했습니다',e);}await Promise.all([script('assets/map/hell_rift/interspace_20261005/layout.js'),script('assets/map/ch1/production_finish/layout.js')]);history=new K.History(await preset('rift'));try{const raw=localStorage.getItem(CACHE_KEY);if(raw){const p=K.validate(JSON.parse(raw));await importProject(p,false);}}catch(e){toast('기존 복구 씬을 읽지 못해 승인 원화로 시작합니다');}const named=new URLSearchParams(location.search).get('scene');if(named){try{await importProject(await namedProject(named),false);}catch(e){toast('현재 씬 유지 · '+e.message);}}await groundDetail?.prepare(current());resize();fit();refresh();palette();$('status').textContent='준비됨 · '+current().name+' / 본편에 자동 적용하지 않음';new ResizeObserver(resize).observe($('stage'));picture('img/exoduser_warrior/south.png').then(im=>{warrior=im;dirty=true;}).catch(()=>{});setBusy(false); $('workspace').inert=false; requestAnimationFrame(tick);
    // Read-only diagnostics for local UI QA; import uses the same validated atomic path.
    window.EXODUSER_SCENE_EDITOR={snapshot:()=>K.clone(current()),view:()=>({...viewport}),player:()=>playing?{...player}:null,selection:()=>selected,batchSelection:()=>[...batchIds],importProject,ambience:()=>({enabled:!!ambience&&$('ambient').checked,stats:ambience?.snapshot()||null}),grounding:()=>residentGrounding?.snapshot()||[],residentLighting:()=>residentLighting?.snapshot()||null,residentIdle:()=>residentIdle?.snapshot()||null,groundDetail:()=>groundDetail?.snapshot()||null,groundDetailEnabled:value=>{if(typeof value==='boolean'){groundDetailEnabled=value;dirty=true;}return groundDetailEnabled;},scaleComparison:()=>selectedScaleComparison(),maskResolution:()=>maskResolutionSnapshot(),residentRegistration:()=>selectedResidentRegistration(),residentAccess:()=>residentAccessReport?K.clone(residentAccessReport):null,residentPreview:()=>residentPreviewOrigin?{npcId:residentPreviewOrigin.npcId,objectId:residentPreviewOrigin.objectId,entry:{...residentPreviewOrigin.entry}}:null,dialogue:()=>({anchors:residentAnchors().map(a=>({...a,approach:{...a.approach}})),state:dialogueController?.snapshot()||null}),ready:true};
  }catch(e){$('status').textContent='씬 시작 실패 · '+e.message;toast(e.message);}
})();
