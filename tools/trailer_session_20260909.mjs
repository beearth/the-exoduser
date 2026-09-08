// Run only inside the Browser skill's Node session, with its supported tab CDP capability.
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

export function createTrailerSession({ tab, cdp, root, ffmpeg }) {
  const out = path.join(root, 'captures/gameplay_trailer_20260909');
  const fps = 30;
  const report = [];
  async function evaluate(expression) {
    const r = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
    return r.result?.value;
  }
  async function freeze() {
    return evaluate(`(() => {
      if(window.__trailer) return {alreadyFrozen:true};
      const s=window.__trailer={now:performance.now(),queue:[],seq:0,frames:0};
      window.requestAnimationFrame=cb=>{s.queue.push(cb);return ++s.seq;};
      Object.defineProperty(performance,'now',{configurable:true,value:()=>s.now});
      OPT.fpsCap=0;_prevTs=s.now;_acc=0;
      const style=document.createElement('style');style.id='trailerCaptureStyle';
      style.textContent='#perfHud,#fpsHud,#dpsHud,#dmgPeakHud,#_btPanel,#petSubtitle,#toast,#areaTitle,#stageTitle,#dcprof,#deathReplay{display:none!important}';
      document.head.appendChild(style);
      P.iframes=0;G.on=false;
      return {stage:G.stage,width:VW,height:VH};
    })()`);
  }
  async function step({ protect = false, pan = null } = {}) {
    return evaluate(`(() => {
      const s=window.__trailer;s.now+=1000/${fps};s.frames++;
      ${protect ? 'P.hp=P.mhp;P._dead=false;P.mp=P.mmp;P.st=P.mst;P.iframes=0;' : ''}
      const q=s.queue.splice(0);for(const cb of q)cb(s.now);
      ${pan ? `G.cam.x=${pan[0]};G.cam.y=${pan[1]};draw();if(_useGPU||_useGL)_glFlush();_drawBurst();` : ''}
      return {callbacks:q.length,stage:G.stage,on:G.on,enemies:ens.length};
    })()`);
  }
  async function screenshot(name) {
    await fs.mkdir(out,{recursive:true});
    const r=await cdp.send('Page.captureScreenshot',{format:'jpeg',quality:94,fromSurface:true});
    const file=path.join(out,`${name}.jpg`);
    await fs.writeFile(file,Buffer.from(r.data,'base64'));
    return file;
  }
  async function record({name,seconds,events=[],protect=false,pan=null}) {
    await fs.mkdir(out,{recursive:true});
    const file=path.join(out,`${name}.mp4`);
    try { await fs.access(file);throw new Error(`Output already exists: ${file}`); }
    catch(e){if(e.code!=='ENOENT')throw e;}
    const frames=Math.round(seconds*fps);
    const proc=spawn(ffmpeg,['-hide_banner','-loglevel','error','-n','-f','image2pipe','-framerate',String(fps),'-vcodec','mjpeg','-i','pipe:0','-an','-c:v','libx264','-preset','veryfast','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',file],{windowsHide:true});
    let errors='';proc.stderr.on('data',d=>errors+=d);proc.stdin.on('error',()=>{});
    const done=new Promise((resolve,reject)=>{proc.on('error',reject);proc.on('close',c=>c===0?resolve():reject(new Error(errors||`ffmpeg exit ${c}`)));});
    done.catch(()=>{});
    const before=await evaluate('({stage:G.stage,player:{x:P.x,y:P.y},enemies:ens.length,gameTime:_gameTime})');
    const started=Date.now();
    try {
      for(let frame=0;frame<frames;frame++) {
        for(const event of events)if(Math.round(event.at*fps)===frame)await evaluate(event.js);
        let camera=null;
        if(pan){let t=frame/Math.max(1,frames-1);t=t*t*(3-2*t);camera=[pan[0][0]+(pan[1][0]-pan[0][0])*t,pan[0][1]+(pan[1][1]-pan[0][1])*t];}
        await step({protect,pan:camera});
        const shot=await cdp.send('Page.captureScreenshot',{format:'jpeg',quality:92,fromSurface:true});
        const bytes=Buffer.from(shot.data,'base64');
        if(!proc.stdin.write(bytes))await new Promise((resolve,reject)=>{proc.stdin.once('drain',resolve);proc.stdin.once('error',reject);});
        if(frame===0||frame===Math.floor(frames/2)||frame===frames-1)await fs.writeFile(path.join(out,`${name}_${frame}.jpg`),bytes);
        if(frame%fps===0)await fs.writeFile(path.join(out,'progress.json'),JSON.stringify({name,frame,frames,elapsed:(Date.now()-started)/1000}));
      }
      proc.stdin.end();await done;
    } catch(e){proc.stdin.destroy();proc.kill();throw e;}
    const after=await evaluate('({stage:G.stage,player:{x:P.x,y:P.y},enemies:ens.length,gameTime:_gameTime})');
    const entry={name,file,seconds,frames,fps,before,after,protect,pan,events,wallSeconds:(Date.now()-started)/1000};
    report.push(entry);await fs.writeFile(path.join(out,'capture_report.json'),JSON.stringify(report,null,2));
    return entry;
  }
  return {evaluate,freeze,step,screenshot,record,report,out,fps};
}
