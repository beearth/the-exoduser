from playwright.sync_api import sync_playwright


def draw_n(page, n):
    return page.evaluate("""(n) => {
      const gl=GL, p=_PERF_PROF;
      const shader=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s};
      const vs=shader(gl.VERTEX_SHADER,'#version 300 es\\nin vec2 p; void main(){gl_Position=vec4(p,0.,1.);}');
      const fs=shader(gl.FRAGMENT_SHADER,'#version 300 es\\nprecision mediump float; out vec4 o; void main(){o=vec4(1.);}');
      const pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(pr));
      const vao=gl.createVertexArray(), buf=gl.createBuffer();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);const a=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);gl.useProgram(pr);
      const before=p.drawCalls;for(let i=0;i<n;i++)gl.drawArrays(gl.TRIANGLES,0,3);const after=p.drawCalls;const err=gl.getError();
      gl.deleteBuffer(buf);gl.deleteVertexArray(vao);gl.deleteProgram(pr);gl.deleteShader(vs);gl.deleteShader(fs);
      return {before,after,delta:after-before,err,hooked:!!gl.__perfHooked,wrapper:String(gl.drawArrays).includes('_PERF_PROF.drawCalls')};
    }""", n)


with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":1280,"height":720})
    errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.goto('http://127.0.0.1:3333/game.html?testchar=1&stage=0',wait_until='networkidle',timeout=60000)
    page.wait_for_timeout(2500)
    initial=page.evaluate("""() => { _PERF_PROF.enabled=true; _perfHookGL(); _PERF_PROF.drawCalls=0; return {hooked:_PERF_PROF._hooked, glHooked:!!GL.__perfHooked}; }""")
    results=[{'initial':initial,'draw':draw_n(page,37)}]
    for i in range(3):
        restored=page.evaluate("""() => new Promise((resolve,reject)=>{
          const gl=GL, ext=gl.getExtension('WEBGL_lose_context');if(!ext){reject(new Error('no WEBGL_lose_context'));return}
          const t=setTimeout(()=>reject(new Error('restore timeout')),10000);
          C.addEventListener('webglcontextrestored',()=>{clearTimeout(t);setTimeout(()=>resolve({same:GL===gl,hooked:!!GL.__perfHooked,wrapper:String(GL.drawArrays).includes('_PERF_PROF.drawCalls')}),100)},{once:true});
          ext.loseContext();setTimeout(()=>ext.restoreContext(),250);
        })""")
        page.evaluate("() => {_PERF_PROF.drawCalls=0;}")
        results.append({'restore':i+1,'state':restored,'draw':draw_n(page,37)})
    window_artifact=page.evaluate("""() => {
      const p=_PERF_PROF, savedEns=ens, savedReport=_perfReport;
      p.enabled=false;p.drawCalls=0;p.frameCnt=29;ens=[];_perfFrameTick();
      const before=drawN=>{const gl=GL;const b=p.drawCalls;for(let i=0;i<drawN;i++)gl.drawArrays(gl.TRIANGLES,0,0);return p.drawCalls-b};
      const disabledDelta=before(19), carried=p.drawCalls;let reported=-1;
      _perfReport=()=>{reported=p.drawCalls;p.drawCalls=0};ens=Array.from({length:301},()=>({alive:true}));_perfFrameTick();
      ens=savedEns;_perfReport=savedReport;p.enabled=false;p.drawCalls=0;
      return {disabledDelta,carried,reported,frameCnt:p.frameCnt};
    }""")
    map_stats=page.evaluate("""() => {
      const rows=[];
      const visible=(camX,camY)=>MAP_OBJS.reduce((n,mo)=>{
        if(mo.type==='breakable'&&!mo.alive)return n;if(mo.type==='trap'&&!mo.active)return n;
        const meta=_OBJ_META[mo.type],m=meta&&meta.sz>200?meta.sz:0;
        return (mo.x>=camX-VW/2-40-m&&mo.x<=camX+VW/2+40+m&&mo.y>=camY-VH/2-40-m&&mo.y<=camY+VH/2+40+m)?n+1:n;
      },0);
      for(let si=0;si<TOTAL_STAGES;si++){
        initStage(si);while(!_bgInitDone)_tickBgInit(9999);
        let vmax=visible(G.cam.x,G.cam.y);
        for(const mo of MAP_OBJS)vmax=Math.max(vmax,visible(mo.x,mo.y));
        rows.push({stage:si,total:MAP_OBJS.length,visibleAtSpawn:visible(G.cam.x,G.cam.y),visibleSampleMax:vmax,mapW:G.mw,mapH:G.mh});
      }
      return {totalStages:TOTAL_STAGES,rows};
    }""")
    print({'results':results,'window_artifact':window_artifact,'map_stats':map_stats,'pageerrors':errors})
    browser.close()
