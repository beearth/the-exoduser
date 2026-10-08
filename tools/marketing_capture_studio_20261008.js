'use strict';

// Deliberately independent of game.html. This script runs in the studio and, via
// serialized bootstrap functions, in its same-origin disposable game iframe.
(function studioEntry() {
  const params = new URLSearchParams(location.search);
  if (params.get('embedded') === '1') {
    bootstrapEmbedded().catch(error => {
      const message = document.createElement('pre');
      message.textContent = 'Capture bootstrap failed: ' + error.message;
      document.body.appendChild(message);
      parent.postMessage({type:'marketing-studio-bootstrap-error', message:error.stack || error.message}, location.origin);
    });
    return;
  }
  const $ = id => document.getElementById(id);
  const frame = $('game');
  let recording = null, lastResult = null, currentMode = null, bootStarted = 0;
  let session = '', gameHash = '', bootError = '';
  const status = message => { $('status').textContent = message; };
  const fail = error => { $('errors').textContent += '\n' + (error.stack || error.message || error); status('Error: ' + (error.message || error)); };
  const bridge = () => {
    const b = frame.contentWindow?.__marketingStudioBridge;
    if (!b) throw new Error('Game bridge is not ready. Wait for boot status.');
    return b;
  };
  const resize = () => {
    const scale = $('viewport').clientWidth / 1920;
    frame.style.transform = `scale(${scale})`;
    $('viewport').style.height = `${1080 * scale}px`;
  };
  new ResizeObserver(resize).observe($('viewport'));
  resize();
  function boot(mode) {
    if (recording) throw new Error('Stop the current recording before booting.');
    currentMode = mode; gameHash = ''; bootError = '';
    session = 'marketing_capture_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
    const query = new URLSearchParams({embedded:'1', mode, character:$('character').value, session});
    bootStarted = performance.now();
    frame.src = '/tools/marketing_capture_studio_20261008.html?' + query;
    status(`Booting ${mode === 'showcase' ? 'staged Lv500 test character' : 'actual demo, manual input'}…\nDisposable slot: ${session}\nCharacter index: ${$('character').value}. No ordinary save is used.`);
  }
  function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  function prepare(id) {
    if (recording) throw new Error('Stop recording before preparing a take.');
    if (currentMode !== 'showcase') throw new Error('Staged take preparation is available only in Lv500 showcase mode.');
    const info = bridge().prepare(id, $('restoreAnchor').checked);
    status(`Prepared ${id} · ${info.duration}s · STAGED Lv${info.player.lv}\nEnemies ${info.spawn.placed}/${info.spawn.requested}, ${info.spawn.skipped} skipped at walls. Anchor ${info.anchor.x.toFixed(1)}, ${info.anchor.y.toFixed(1)}.\nPlayer wall check: ${info.anchor.wall}. HP ${info.player.hp}. Audio must be running before recording.`);
  }
  async function record(manual) {
    if (recording) throw new Error('Already recording.');
    const b = bridge(), snapshot = b.snapshot();
    if (!snapshot.ready) throw new Error('Game has not reached a playable state.');
    if (manual && currentMode !== 'demo') throw new Error('Manual demo recording requires Boot actual demo.');
    if (!manual && currentMode !== 'showcase') throw new Error('Staged recording requires the Lv500 showcase.');
    // resume() is invoked during this click, before the first await.
    const audioPromise = b.enableAudio();
    await audioPromise;
    const duration = manual ? Math.max(8, Math.min(20, Number($('manualDuration').value) || 12)) : b.preparedDuration();
    const mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) throw new Error('This browser does not support VP9 + Opus WebM recording.');
    const canvas = b.getCanvas();
    const videoStream = canvas.captureStream(60);
    const audioStream = b.getAudioStream();
    const stream = new MediaStream([...videoStream.getVideoTracks(), ...audioStream.getAudioTracks()]);
    const recorder = new MediaRecorder(stream, {mimeType, videoBitsPerSecond:28000000, audioBitsPerSecond:256000});
    const chunks = [];
    const startedAt = performance.now();
    const fileBase = `${manual ? 'demo_manual' : 'staged_' + snapshot.prepared}_${Date.now()}`;
    recording = {recorder, videoStream, startedAt, duration, fileBase, manual, timer:null};
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    recorder.onerror = event => { b.logError(event.error || new Error('MediaRecorder error')); fail(event.error || 'MediaRecorder error'); };
    recorder.onstop = async () => {
      const active = recording;
      if (!active) return;
      clearTimeout(active.timer);
      const audit = b.finishRecording();
      active.videoStream.getTracks().forEach(track => track.stop());
      const blob = new Blob(chunks, {type:mimeType});
      const elapsed = (performance.now() - active.startedAt) / 1000;
      Object.assign(audit, {sourceGit:$('sourceGit').value.trim() || null, gameSha256:gameHash || null,
        requestedDurationSeconds:duration, recorderDurationSeconds:elapsed, bytes:blob.size,
        mimeType:recorder.mimeType, requestedVideoBitsPerSecond:28000000, requestedAudioBitsPerSecond:256000,
        actualRecorderVideoBitsPerSecond:recorder.videoBitsPerSecond, actualRecorderAudioBitsPerSecond:recorder.audioBitsPerSecond,
        steamBuildEquivalence:'unverified', capturedLayers:['c','fogGL','burstCvs','ct','vfx3dCvs','boss3dCvs'],
        htmlHudCaptured:false, auditStatus:'runtime captured; human visual/audio review required'});
      lastResult = {blob, audit, fileBase}; recording = null;
      if (location.origin === 'http://127.0.0.1:3338') {
        try {
          const savedVideo = await fetch('/__recording?name=' + fileBase + '.webm', {method:'POST',body:blob});
          const savedAudit = await fetch('/__recording?name=' + fileBase + '.json', {method:'POST',body:JSON.stringify(audit,null,2)});
          if (!savedVideo.ok || !savedAudit.ok) throw new Error('Capture server refused a recording');
          audit.serverSave={ok:true,base:fileBase};
        } catch(error) { audit.serverSave={ok:false,error:error.message}; fail(error); }
      }
      if ($('preview').dataset.blobUrl) URL.revokeObjectURL($('preview').dataset.blobUrl);
      const url = URL.createObjectURL(blob); $('preview').src = url; $('preview').dataset.blobUrl = url;
      $('download').disabled = false; $('json').disabled = false;
      status(`Recorded ${active.manual ? 'MANUAL DEMO · unstaged' : 'STAGED Lv500'} · ${elapsed.toFixed(2)}s · ${(blob.size / 1048576).toFixed(1)} MiB\nActual composite frames: ${audit.frames}; measured rendered FPS: ${audit.measuredRenderFps.toFixed(2)}. Audio: ${audit.audio.contextState}.\nServer save: ${JSON.stringify(audit.serverSave||null)}\nReview the preview, JSON errors and actual skill/HP logs before publication.`);
      $('errors').textContent = JSON.stringify({errors:audit.errors, parryVerification:audit.parryVerification, blockedRequests:audit.isolation.blockedRequests}, null, 2);
      if ($('autoDownload').checked) download(blob, fileBase + '.webm');
    };
    try {
      b.beginRecording(manual);
      recorder.start(1000);
      recording.timer = setTimeout(stop, duration * 1000);
      if (manual) frame.contentWindow.focus();
      status(`RECORDING ${manual ? 'MANUAL DEMO · real input; combat values unchanged' : 'STAGED Lv500 · scripted demonstration'} · ${duration}s\nKeep this tab visible. Real canvas layers + game audio, 1920×1080, requested 60 FPS.`);
    } catch (error) {
      recording = null; videoStream.getTracks().forEach(track => track.stop()); b.finishRecording(); throw error;
    }
  }
  function stop() { if (recording && recording.recorder.state !== 'inactive') recording.recorder.stop(); }
  function bind(id, fn) { $(id).addEventListener('click', () => { try { Promise.resolve(fn()).catch(fail); } catch (error) { fail(error); } }); }
  bind('boot', () => boot('showcase')); bind('demo', () => boot('demo'));
  bind('audio', async () => { const result = await bridge().enableAudio(); status('Real game audio: ' + JSON.stringify(result)); });
  bind('pause', () => { status('Paused: ' + bridge().togglePause()); });
  bind('english', () => { bridge().english(); status('English UI and 60 FPS cap applied to isolated runtime settings.'); });
  bind('skipIntro', () => { status('Normal intro skip: ' + JSON.stringify(bridge().skipIntro())); });
  bind('releaseInputs', () => bridge().manualInput('release',false));
  for(const button of document.querySelectorAll('[data-hold]'))button.addEventListener('click',()=>{
    try{const down=bridge().manualInput(button.dataset.hold);button.setAttribute('aria-pressed',String(down));frame.contentWindow.focus();}catch(error){fail(error);}
  });
  for(const button of document.querySelectorAll('[data-pulse]'))button.addEventListener('click',()=>{
    try{bridge().manualInput(button.dataset.pulse,true);setTimeout(()=>{try{bridge().manualInput(button.dataset.pulse,false);}catch(error){fail(error);}},100);frame.contentWindow.focus();}catch(error){fail(error);}
  });
  document.querySelectorAll('[data-take]').forEach(button => button.addEventListener('click', () => { try { prepare(button.dataset.take); } catch (error) { fail(error); } }));
  bind('record', () => record(false)); bind('manual', () => record(true)); bind('stop', stop);
  bind('download', () => { if (lastResult) download(lastResult.blob, lastResult.fileBase + '.webm'); });
  bind('json', () => { if (lastResult) download(new Blob([JSON.stringify(lastResult.audit,null,2)], {type:'application/json'}), lastResult.fileBase + '.json'); });
  bind('png', () => { bridge().getCanvas().toBlob(blob => { if (blob) download(blob, `${currentMode || 'runtime'}_frame_${Date.now()}.png`); else fail('Canvas PNG encoding failed.'); }, 'image/png'); });
  addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
    if (event.data.type === 'marketing-studio-source') gameHash = event.data.sha256;
    if (event.data.type === 'marketing-studio-bootstrap-error') { bootError = event.data.message; fail(bootError); }
  });
  setInterval(() => {
    if (!currentMode || recording || bootError) return;
    const b = frame.contentWindow?.__marketingStudioBridge;
    if (!b) {
      if (performance.now() - bootStarted > 90000) status('Boot is taking over 90 seconds. Inspect the game view and errors. No recording has started.');
      return;
    }
    const s = b.snapshot();
    if (!s.ready) status(`Waiting for ${currentMode === 'showcase' ? 'G.on + P.lv=500' : 'playable demo G.on + P'}… ${Math.round((performance.now()-bootStarted)/1000)}s\n${JSON.stringify(s)}\nUse the actual demo start/cutscene controls in the game view if needed.`);
    else if (!s.prepared && !lastResult) status(`Ready: ${currentMode === 'showcase' ? 'STAGED Lv500 showcase; select a take' : 'MANUAL DEMO; Record manual demo and play in the iframe'}\nCharacter ${s.character}, Lv${s.player.lv}, HP ${s.player.hp}, initial coordinates ${JSON.stringify(s.bootAnchor)}\nGame SHA256: ${gameHash || 'pending'}. Save guard: ${s.saveGuard}.`);
  }, 1000);

  async function bootstrapEmbedded() {
    const mode = params.get('mode') === 'demo' ? 'demo' : 'showcase';
    const config = {mode, character:params.get('character') === '0' ? 0 : 1,
      session:(params.get('session') || '').replace(/[^a-z0-9_]/gi,'') || 'marketing_capture_' + Date.now()};
    const query = new URLSearchParams({test:'1', slot:config.session});
    // Explicit stage=0 selects the separate plate-test arena in the current
    // runtime. Omit it so both modes use the actual CH1-1 production map.
    if (mode === 'showcase') query.set('testchar','1'); else query.set('demo','1');
    const target = '/game.html?' + query;
    const response = await fetch(target, {cache:'no-store'});
    if (!response.ok) throw new Error(`game.html fetch returned ${response.status}`);
    const bytes = await response.arrayBuffer();
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), n => n.toString(16).padStart(2,'0')).join('');
    parent.postMessage({type:'marketing-studio-source',sha256:hash}, location.origin);
    const original = new TextDecoder().decode(bytes);
    const script = source => '<script>' + source + '<' + '/script>';
    const early = '<base href="/">' + script('(' + installEarlyIsolation.toString() + ')(' + JSON.stringify(config) + ');');
    const late = script('(' + installRuntimeBridge.toString() + ')(' + JSON.stringify(config) + ');');
    if (!/<head(?:\s[^>]*)?>/i.test(original) || !/<\/body>/i.test(original)) throw new Error('Unrecognized game HTML structure; injection stopped.');
    const html = original.replace(/<head(?:\s[^>]*)?>/i, match => match + early).replace(/<\/body>/i, late + '<' + '/body>');
    history.replaceState(null,'',target);
    document.open(); document.write(html); document.close();
  }
})();

function installEarlyIsolation(config) {
  'use strict';
  const prefix = 'capture_studio_20261008:' + config.session + ':';
  const audit = window.__marketingIsolation = {prefix, slot:config.session, character:config.character,
    blockedRequests:[], storageWrites:0, errors:[], installedBeforeGameScripts:true};
  if(config.mode==='showcase'){
    // Current build-target.js defaults to demo even with testchar=1. Only this
    // disposable showcase forces full targeting so Lv500 can actually boot.
    Object.defineProperty(window,'EXODUSER_BUILD_TARGET',{configurable:true,get:()=>'full',set:value=>{audit.buildTargetAssignmentIgnored=value;}});
    audit.forcedBuildTarget='full';
  }else audit.forcedBuildTarget=null;
  const storage = localStorage, session = sessionStorage;
  const native = {get:Storage.prototype.getItem, set:Storage.prototype.setItem, remove:Storage.prototype.removeItem, key:Storage.prototype.key};
  const scoped = value => value === storage || value === session;
  Storage.prototype.getItem = function(key) { return native.get.call(this, scoped(this) ? prefix + key : key); };
  Storage.prototype.setItem = function(key,value) { if (scoped(this)) audit.storageWrites++; return native.set.call(this, scoped(this) ? prefix + key : key, value); };
  Storage.prototype.removeItem = function(key) { return native.remove.call(this, scoped(this) ? prefix + key : key); };
  Storage.prototype.clear = function() {
    if (!scoped(this)) throw new Error('Capture guard refuses unscoped Storage.clear');
    const keys=[]; for(let i=0;i<this.length;i++){const key=native.key.call(this,i);if(key?.startsWith(prefix))keys.push(key);}
    keys.forEach(key=>native.remove.call(this,key));
  };
  localStorage.setItem('_charIdx', String(config.character));
  localStorage.setItem('hellLang','en');
  const originalFetch = window.fetch.bind(window);
  window.fetch = async function(input, options) {
    const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url, location.href);
    const method = String(options?.method || (typeof input === 'object' && input.method) || 'GET').toUpperCase();
    if (!['GET','HEAD'].includes(method)) {
      audit.blockedRequests.push({time:Date.now(),method,url:url.origin + url.pathname});
      return new Response(JSON.stringify({ok:true,captureBlocked:true}),{status:200,headers:{'Content-Type':'application/json'}});
    }
    // Disposable API reads prevent progress/currency from a normal save leaking in.
    if (url.origin === location.origin && url.pathname.startsWith('/api/')) {
      const value=url.pathname==='/api/slots'?{ok:true,slots:[]}:url.pathname==='/api/mats'?{ok:true,mats:0}:{ok:true,data:null};
      return new Response(JSON.stringify(value),{status:200,headers:{'Content-Type':'application/json'}});
    }
    return originalFetch(input, options);
  };
  const xhrOpen=XMLHttpRequest.prototype.open, xhrSend=XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open=function(method,url,...rest){this.__captureMethod=String(method).toUpperCase();this.__captureUrl=String(url);return xhrOpen.call(this,method,url,...rest);};
  XMLHttpRequest.prototype.send=function(body){if(!['GET','HEAD'].includes(this.__captureMethod)){audit.blockedRequests.push({time:Date.now(),method:this.__captureMethod,url:this.__captureUrl});throw new Error('Capture isolation blocked XHR write');}return xhrSend.call(this,body);};
  try{navigator.sendBeacon=function(url){audit.blockedRequests.push({time:Date.now(),method:'BEACON',url:String(url)});return false;};}catch(error){audit.errors.push('Beacon guard: '+error.message);}
  addEventListener('error',event=>audit.errors.push({message:event.message,filename:event.filename,line:event.lineno,stack:event.error?.stack}));
  addEventListener('unhandledrejection',event=>audit.errors.push({message:String(event.reason),stack:event.reason?.stack}));
}

function installRuntimeBridge(config) {
  'use strict';
  const state = {prepared:null, bootAnchor:null, active:false, start:0, frameTimes:[], hp:[], skills:[], events:[], audioNodes:[], errors:[], timers:[], spawn:null, removedAffixes:[], numberDraws:0, lastNumber:null, operatorControls:[]};
  const canvas=document.createElement('canvas');canvas.width=1920;canvas.height=1080;
  const ctx=canvas.getContext('2d',{alpha:false});
  let audioDestination=null, audioContext=null, lastHpSample=0, lastFrame=0;
  const now=()=>state.active ? (performance.now()-state.start)/1000 : null;
  const logError=error=>state.errors.push({t:now(),message:error?.message||String(error),stack:error?.stack});
  // Observe real hostile projectiles; only synthesize Q input. Never alter HP,
  // projectile positions, parry windows, cooldowns or the game's damage rules.
  const parryDetector={scanRadius:200,pressRadius:100,leadTicks:12,holdSeconds:.18,releaseGapSeconds:.10};
  function tickParryDetector(){
    if(!state.active||state.manual||state.prepared!=='parry'||!state.parry)return;
    const d=state.parry,t=now();
    if(d.held&&t-d.pressedAt>=parryDetector.holdSeconds){
      key('KeyQ',false);d.held=false;d.releasedAt=t;
      state.events.push({t,kind:'detected Q up'});
    }
    if(!G.on||G.paused||!P||P.hp<=0)return;
    let target=null,sawNearMagic=false;
    for(const p of projs){
      if(!p||p.friendly||p.noParry||p.life<=0)continue;
      const magic=p.blackBean||typeof _projectileParryClass==='function'&&_projectileParryClass(p)==='magic';
      if(!magic)continue;
      const dx=p.x-P.x,dy=p.y-P.y,distance=Math.hypot(dx,dy);
      if(!Number.isFinite(distance)||distance>parryDetector.scanRadius)continue;
      const closing=distance>0?-(dx*(p.vx||0)+dy*(p.vy||0))/distance:0;
      if(closing<=0)continue;
      sawNearMagic=true;
      const ticksToRing=Math.max(0,(distance-parryDetector.pressRadius)/closing);
      if(ticksToRing<=parryDetector.leadTicks&&(!target||ticksToRing<target.ticksToRing))target={distance,closing,ticksToRing,blackBean:!!p.blackBean};
    }
    if(sawNearMagic)d.nearMagicFrames++;
    if(!target||d.held||t-d.releasedAt<parryDetector.releaseGapSeconds||(P._sbCd||0)>0||P.mp<10||P._ioActive)return;
    if(P.s!=='idle'&&P.s!=='wRecover'&&P.s!=='magicRecover')return;
    key('KeyQ',true);d.held=true;d.pressedAt=t;d.inputPulses++;
    state.events.push({t,kind:'detected Q down',...target});
  }
  function guardSaves(){
    try{
      if(typeof _dbReady!=='undefined')_dbReady=false;
      if(typeof _charId!=='undefined')_charId=null;
      if(typeof _autoSaveTimer!=='undefined'&&_autoSaveTimer){clearInterval(_autoSaveTimer);_autoSaveTimer=null;}
      if(typeof dbSave==='function')dbSave=async()=>{};
      if(typeof dbSaveNow==='function')dbSaveNow=()=>{};
      if(typeof dbSaveForce==='function')dbSaveForce=()=>{};
      if(typeof startAutoSave==='function')startAutoSave=()=>{};
      if(typeof _saveSharedMatsToServer==='function')_saveSharedMatsToServer=()=>{};
    }catch(error){logError(error);}
  }
  guardSaves();
  setInterval(()=>{
    guardSaves();
    if(typeof P!=='undefined'&&P&&typeof G!=='undefined'&&G.on&&!state.bootAnchor){
      state.bootAnchor={x:P.x,y:P.y};
      if(config.mode==='showcase')G.paused=true;
    }
  },100);
  const player=()=>typeof P==='undefined'||!P?null:{x:P.x,y:P.y,lv:P.lv,hp:P.hp,mhp:P.mhp,mp:P.mp,st:P.st,state:P.s,iframes:P.iframes,dead:!!P._dead,rage:P.rage};
  function composite(){
    try{
      ctx.fillStyle='#000';ctx.fillRect(0,0,1920,1080);
      for(const id of ['c','fogGL','burstCvs','ct','vfx3dCvs','boss3dCvs']){
        const layer=document.getElementById(id);
        if(layer?.width&&layer?.height&&getComputedStyle(layer).display!=='none')ctx.drawImage(layer,0,0,1920,1080);
      }
      lastFrame=performance.now();
      if(state.active){
        tickParryDetector();
        state.frameTimes.push(lastFrame-state.start);
        if(lastFrame-lastHpSample>=100){lastHpSample=lastFrame;state.hp.push({t:now(),...player(),alive:ens.filter(e=>e.alive!==false&&!e.dead).length,kills:G.kills});}
      }
    }catch(error){if(state.errors.length<100)logError(error);}
  }
  if(typeof _drawBurst==='function'){
    const original=_drawBurst;
    _drawBurst=function(...args){const result=original.apply(this,args);composite();return result;};
  }else logError(new Error('Missing _drawBurst: actual frame hook unavailable.'));
  if(typeof drawNumStr==='function'){
    const original=drawNumStr;
    drawNumStr=function(...args){if(state.active){state.numberDraws++;state.lastNumber=args[1];}return original.apply(this,args);};
  }
  if(typeof _addSkProf==='function'){
    const original=_addSkProf;
    _addSkProf=function(id,...args){if(state.active)state.skills.push({t:now(),id,source:'actual _addSkProf'});return original.call(this,id,...args);};
  }
  if(typeof doParry==='function'){
    const original=doParry;
    doParry=function(...args){if(state.active)state.events.push({t:now(),kind:'actual parry',forceQ:!!args[3],playerState:P?.s,qWindow:!!(P?._sbParryT>0&&(P.s==='sBlock'||P.s==='peaceShield'||P._sbReleaseR>0))});return original.apply(this,args);};
  }
  async function enableAudio(){
    if(typeof actx!=='function'||typeof mbus!=='function')throw new Error('Current game audio API is unavailable.');
    audioContext=actx();
    const resume=audioContext.resume();
    mbus();
    if(!audioDestination){
      audioDestination=audioContext.createMediaStreamDestination();
      if(typeof _comp==='undefined'||!_comp)throw new Error('Game compressor _comp is unavailable.');
      _comp.connect(audioDestination);
      // Voice/ultimate nodes that bypass the compressor keep their real route and
      // are additionally connected to the capture destination once per node.
      const originalConnect=AudioNode.prototype.connect;
      const mirrored=new WeakSet();
      AudioNode.prototype.connect=function(...args){
        const result=originalConnect.apply(this,args);
        if(this.context===audioContext&&args[0]===audioContext.destination&&this!==_comp&&!mirrored.has(this)){
          mirrored.add(this);originalConnect.call(this,audioDestination);
        }
        return result;
      };
      const originalStart=AudioBufferSourceNode.prototype.start;
      AudioBufferSourceNode.prototype.start=function(...args){
        if(state.active&&this.context===audioContext)state.audioNodes.push({t:now(),type:'AudioBufferSourceNode',duration:this.buffer?.duration||null,playbackRate:this.playbackRate.value,character:config.character});
        return originalStart.apply(this,args);
      };
    }
    await resume;
    if(audioContext.state!=='running')throw new Error('Audio context is '+audioContext.state+'. Click Enable real audio, then retry.');
    return {contextState:audioContext.state,sampleRate:audioContext.sampleRate,audioTracks:audioDestination.stream.getAudioTracks().length};
  }
  function english(){OPT.lang='en';OPT.fpsCap=60;localStorage.setItem('hellLang','en');if(typeof _FLOAT_TEXT_ENABLED!=='undefined')_FLOAT_TEXT_ENABLED=true;}
  function release(){for(const key in K)K[key]=false;if(typeof KH!=='undefined')for(const key in KH)KH[key]=false;for(let i=0;i<3;i++){MB[i]=false;MBjust[i]=false;}}
  function key(code,down){dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{code,key:code==='ShiftLeft'?'Shift':code==='KeyQ'?'q':code,bubbles:true}));}
  function aim(dx,dy){mouse.x=VW/2+dx;mouse.y=VH/2+dy;}
  function manualInput(code,down){
    if(config.mode!=='demo')throw new Error('Operator manual controls require actual demo mode.');
    if(code==='release'){release();state.operatorControls.push({t:now(),code,down:false});return false;}
    const next=down===undefined?!(code==='LMB'?MB[0]:K[code]):down;
    if(code==='LMB'){aim(VW*.22,0);MB[0]=next;MBjust[0]=next;}else key(code,next);
    state.operatorControls.push({t:now(),code,down:next,source:'operator UI button'});return next;
  }
  function skipIntro(){
    if(state.active)throw new Error('Skip intro before recording.');
    const invoked=[];
    if(typeof _cutsceneState!=='undefined'&&_cutsceneState==='INTRO_CUTSCENE'&&typeof _cutsceneEnd==='function'){_cutsceneEnd();invoked.push('_cutsceneEnd');}
    if(typeof _introGuide!=='undefined'&&_introGuide&&typeof _finishIntroGuide==='function'){_finishIntroGuide();invoked.push('_finishIntroGuide');}
    return {invoked,message:invoked.length?'Existing game skip flow invoked':'No active skippable intro/guide; retry after next intro step if needed'};
  }
  function cast(id){
    const sk=_skById(id);if(!sk)throw new Error('Unknown current-runtime skill: '+id);
    const slot=_isAreaSkillId(id)?5:_isRageBurstSkillId(id)?4:0;
    if(sk.ult)ULT_SLOT=id;else SKILL_SLOTS[slot]=id;
    P.skills[id]=Math.max(1,P.skills[id]||0);
    const ok=_dispatchSkillSlot(sk.ult?-1:slot,'Digit1');
    state.events.push({t:now(),kind:'dispatch',skill:id,slot:sk.ult?-1:slot,ok});
    if(!ok)logError(new Error('Skill dispatch returned false: '+id));
  }
  function wave(){
    ens.filter(e=>e.alive!==false&&!e.dead).slice(0,24).forEach((e,i)=>{
      const bean=state.prepared==='parry'?['black','fire','water','dark'][i%4]:['black','fire','water','red','special','normal'][i%6];
      e._projChargeBean=bean;e._projChargeCol={black:'#00aa00',fire:'#ff2e22',water:'#317cec',red:'#cc1100'}[bean]||ELC[e.el];e._projChargeT=60;
    });
    state.events.push({t:now(),kind:'staged enemy projectile windup',count:Math.min(24,ens.filter(e=>e.alive!==false&&!e.dead).length)});
  }
  const takes={
    parry:{duration:10,count:24,level:35,radius:380,skills:['Q parry'],actions:[[.3,'wave'],[4.8,'wave']]},
    rage_slam:{duration:8,count:256,level:35,radius:220,skills:['giantSlam'],actions:[[3.8,'cast giantSlam']]},
    fire:{duration:11,count:128,level:75,radius:420,skills:['chainAssault'],actions:[]},
    ice_orb:{duration:8,count:72,level:35,radius:400,skills:['iceOrb'],actions:[[1.5,'cast iceOrb']]},
    ancestor:{duration:8,count:72,level:120,radius:430,skills:['ancestorSummon'],actions:[[1,'cast ancestorSummon']]},
    blackhole:{duration:10,count:120,level:80,radius:390,skills:['lavaSummon'],actions:[[.2,'wave'],[1,'cast lavaSummon'],[2,'wave'],[3.8,'wave']]}
  };
  for(let i=0;i<6;i++){const t=1+i;takes.fire.actions.push([t,'fire aim '+(i%2?-800:800)],[t,'Shift down'],[t+.055,'Shift up'],[t+.12,'RMB down'],[t+.42,'release']);}
  takes.fire.actions.push([7.5,'detonate assault flames']);
  function prepare(id,restoreAnchor){
    if(config.mode!=='showcase'||!P||P.lv!==500||!G.on)throw new Error('Preparation requires a fully booted Lv500 showcase.');
    if(state.active)throw new Error('Cannot prepare during recording.');
    const take=takes[id];if(!take)throw new Error('Unknown take '+id);
    english();guardSaves();G.paused=true;release();
    if(!state.bootAnchor)state.bootAnchor={x:P.x,y:P.y};
    const anchor=restoreAnchor?state.bootAnchor:{x:P.x,y:P.y};
    if(typeof isW!=='function')throw new Error('Current map collision API is unavailable; no enemies placed.');
    if(isW(anchor.x,anchor.y))throw new Error('Player anchor is blocked by current map collision. Move to playable ground and retry.');
    G._fbSpawned=true;G._fdSpawned=true;G._fieldBosses=[];G._fieldBoss=null;G._fireDevils=[];G.spawnHoles=[];G.pets=null;G._irisOff=true;
    ens.length=0;projs.length=0;pProjs.length=0;worldItems.length=0;G._fireZones=[];G.txts.length=0;
    if(typeof _vfxAnims!=='undefined')_vfxAnims.length=0;if(typeof _fireExps!=='undefined')_fireExps.length=0;
    if(typeof _corpses!=='undefined')_corpses.forEach(c=>c.active=false);
    G._gSlamWave=null;G._flashT=0;G.chromaT=0;G.shake=0;G.hitStop=0;G.slowMo=0;
    P.x=anchor.x;P.y=anchor.y;G.cam.x=P.x;G.cam.y=P.y;
    P.s='idle';P.st2=0;P.mhp=100000000;P.hp=P.mhp;P.mp=P.mmp;P.st=P.mst;P.iframes=0;P._dead=false;
    P._ioActive=false;P._ioCd=0;P._gslCd=0;P._ancCd=0;P._lvCd=0;P._sbCd=0;P._sbParryT=0;
    P._fused={};P.skills.guardian=0;P.skills.fireAura=0;P.skills.holyDome=0;P._hdCd=999999;
    P.activeChargeSk='charge';P.activeCtSk='iceOrb';P.activeQSk='detonate';P.activeMagicSk='fireball';
    BINDS.charge='ShiftLeft';BINDS.beam='mouse2';BINDS.weapon='mouse0';BINDS.parry='KeyQ';
    if(typeof _harpActive!=='undefined')_harpActive=false;if(typeof _dashActive!=='undefined')_dashActive=false;if(typeof _dashHold!=='undefined')_dashHold=false;
    if(typeof _harpGauge!=='undefined'&&typeof _HARP_GAUGE_MAX!=='undefined')_harpGauge=_HARP_GAUGE_MAX;
    state.removedAffixes=[];
    for(const [slot,item] of Object.entries(INV.equipped))if(item?.affixes)item.affixes=item.affixes.filter(a=>{
      if(a.id==='onCritExplode'||a.id==='onCritChain'){state.removedAffixes.push({slot,id:a.id,value:a.value});return false;}return true;
    });
    if(typeof _eqAffixCache!=='undefined')_eqAffixCache=null;
    const oldLevel=P.lv;let placed=0;
    try{
      P.lv=take.level;
      for(let i=0;i<take.count;i++){
        let location=null;
        for(let retry=0;retry<24;retry++){
          const a=(i+retry*.713)*2.3999632297,r=take.radius+(i%9)*20+(retry%4)*35;
          const x=anchor.x+Math.cos(a)*r,y=anchor.y+Math.sin(a)*r;
          if(!isW(x,y)&&!isW(x-18,y)&&!isW(x+18,y)&&!isW(x,y-18)&&!isW(x,y+18)){location={x,y};break;}
        }
        if(!location)continue;
        const enemy=mkEn(location.x,location.y,0,[0,1,3,4,6,7][i%6],false,[EL.P,EL.F,EL.I,EL.L,EL.D][i%5]);
        if(enemy){ens.push(enemy);placed++;}
      }
    }finally{P.lv=oldLevel;}
    if(typeof _shDirty!=='undefined')_shDirty=true;if(typeof shRebuild==='function')shRebuild();
    if(!placed)throw new Error('No valid enemy positions found around the current player anchor. Move to an open playable area.');
    ens.forEach((e,i)=>{e._firstShot=false;e.projT=180+i*25;});
    P.rage=id==='rage_slam'?_rageMax():0;
    state.prepared=id;state.spawn={requested:take.count,placed,skipped:take.count-placed,monsterLevel:take.level,radius:take.radius};
    composite();
    return {duration:take.duration,spawn:state.spawn,anchor:{...anchor,wall:false},player:player()};
  }
  function runAction(action){
    state.events.push({t:now(),kind:'scheduled action',action});
    if(action==='wave')wave();else if(action.startsWith('cast '))cast(action.slice(5));
    else if(action==='Q down')key('KeyQ',true);else if(action==='Q up')key('KeyQ',false);
    else if(action==='Shift down')key('ShiftLeft',true);else if(action==='Shift up')key('ShiftLeft',false);
    else if(action.startsWith('fire aim '))aim(Number(action.slice(9)),0);
    else if(action==='RMB down'){MB[2]=true;MBjust[2]=true;}
    else if(action==='release')release();else if(action==='detonate assault flames')_detonateAssaultFlames();
  }
  function beginRecording(manual){
    if(state.active)throw new Error('Bridge is already recording.');
    if(!G.on||!P)throw new Error('Game is not playable.');
    if(!manual&&!state.prepared)throw new Error('Prepare a staged take before Record.');
    if(manual&&G.paused)throw new Error('Resume the actual demo before manual recording.');
    if(!lastFrame)throw new Error('No actual game frame has reached the compositor.');
    state.active=true;state.start=performance.now();state.frameTimes=[];state.hp=[];state.skills=[];state.events=[];state.audioNodes=[];state.numberDraws=0;state.lastNumber=null;state.operatorControls=[];lastHpSample=0;
    state.manual=manual;state.initialPlayer=player();state.initialSkills={...P.skills};
    state.parry=!manual&&state.prepared==='parry'?{held:false,pressedAt:0,releasedAt:-Infinity,nearMagicFrames:0,inputPulses:0}:null;
    if(!manual){
      G.paused=false;
      for(const [at,action] of takes[state.prepared].actions)state.timers.push(setTimeout(()=>{try{runAction(action);}catch(error){logError(error);}},at*1000));
      state.timers.push(setInterval(()=>{if(state.active&&P){P.mp=P.mmp;P.st=P.mst;}},100));
    }
    state.hp.push({t:0,...player(),alive:ens.filter(e=>e.alive!==false&&!e.dead).length,kills:G.kills});
  }
  function finishRecording(){
    const duration=state.active?(performance.now()-state.start)/1000:0;
    state.timers.forEach(id=>{clearTimeout(id);clearInterval(id);});state.timers=[];
    let parryVerification=null;
    if(state.parry){
      const actualParries=state.events.filter(e=>e.kind==='actual parry').length;
      const actualQParries=state.events.filter(e=>e.kind==='actual parry'&&(e.forceQ||e.qWindow||e.playerState==='sBlock'||e.playerState==='peaceShield')).length;
      const passed=state.parry.nearMagicFrames>0&&actualQParries>0;
      const reason=passed?'Actual Q parry observed':state.parry.nearMagicFrames===0?'No approaching hostile magic projectile within 200px; move to open ground and retry':'No actual Q parry observed; inspect detected Q events and projectile timing';
      parryVerification={status:passed?'PASS':'FAIL',actualParries,actualQParries,nearMagicFrames:state.parry.nearMagicFrames,inputPulses:state.parry.inputPulses,detector:{...parryDetector},reason};
      if(!passed)logError(new Error('Parry verification failed: '+reason));
    }
    if(!state.manual){release();if(typeof G!=='undefined')G.paused=true;}
    const frames=state.frameTimes.length;
    const intervals=state.frameTimes.slice(1).map((t,i)=>t-state.frameTimes[i]);
    const span=frames>1?(state.frameTimes[frames-1]-state.frameTimes[0])/1000:0;
    const result={version:'20261008',mode:config.mode,take:state.manual?'manual_demo':state.prepared,staged:!state.manual,
      manipulation:state.manual?{combatValuesChanged:false,scriptedTake:false,spawnedEnemies:false,operatorButtonInputs:state.operatorControls.length>0}:{testCharacterLevel:500,forcedBuildTarget:'full',playerMaxHp:100000000,resourceRefill:'MP and ST every 100ms',artificialEnemyPlacement:true,randomGearCritAffixesRemoved:state.removedAffixes,fusionsCleared:true,passiveGuardianFireAuraHolyDomeDisabled:true},
      sourceUrl:location.href,character:config.character,slot:config.session,bootAnchor:state.bootAnchor,spawn:state.manual?null:state.spawn,
      initialPlayer:state.initialPlayer,finalPlayer:player(),initialSkills:state.initialSkills,plannedSkills:state.manual?null:takes[state.prepared]?.skills,
      plannedActions:state.manual?[]:takes[state.prepared]?.actions,durationSeconds:duration,width:1920,height:1080,requestedFps:60,
      frames,measuredRenderFps:span>0?(frames-1)/span:0,renderFrameTimesMs:state.frameTimes,frameIntervalsMs:intervals,
      damageNumbers:{enabled:typeof _FLOAT_TEXT_ENABLED==='undefined'?null:_FLOAT_TEXT_ENABLED,drawCalls:state.numberDraws,lastNumber:state.lastNumber},
      hp:state.hp,skills:state.skills,events:state.events,parryVerification,operatorControls:state.operatorControls,audioNodes:state.audioNodes,
      audio:{contextState:audioContext?.state||'not initialized',sampleRate:audioContext?.sampleRate||null,trackCount:audioDestination?.stream.getAudioTracks().length||0},
      errors:[...state.errors,...(window.__marketingIsolation?.errors||[])],isolation:window.__marketingIsolation};
    state.active=false;return result;
  }
  window.__marketingStudioBridge={
    prepare,enableAudio,english,beginRecording,finishRecording,logError,skipIntro,manualInput,
    togglePause(){if(state.active)throw new Error('Stop recording before changing pause.');G.paused=!G.paused;return G.paused;},
    getCanvas(){if(!lastFrame)throw new Error('No actual game canvas frame available yet.');return canvas;},
    getAudioStream(){if(!audioDestination)throw new Error('Enable real audio first.');return audioDestination.stream;},
    preparedDuration(){if(!state.prepared)throw new Error('No staged take prepared.');return takes[state.prepared].duration;},
    snapshot(){const p=player();return {ready:!!(typeof G!=='undefined'&&G.on&&p&&(config.mode==='demo'||p.lv===500)),mode:config.mode,player:p,character:config.character,bootAnchor:state.bootAnchor,prepared:state.prepared,saveGuard:typeof _dbReady!=='undefined'&&!_dbReady,paused:typeof G!=='undefined'?G.paused:null,errors:state.errors.slice(-3)};}
  };
}
