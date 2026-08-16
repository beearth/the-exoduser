from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":1280,"height":720})
    errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.goto('http://127.0.0.1:3333/game.html?testchar=1&stage=0',wait_until='networkidle',timeout=60000)
    page.wait_for_timeout(2500)
    page.evaluate("() => { _PERF_PROF.enabled=true; _perfHookGL(); _PERF_PROF.drawCalls=0; }")
    # A. synthetic N:N while enabled (should stay 1:1)
    nn=page.evaluate("""() => {
      const gl=GL,p=_PERF_PROF;
      const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x};
      const vs=sh(gl.VERTEX_SHADER,'#version 300 es\\nin vec2 q;void main(){gl_Position=vec4(q,0.,1.);}');
      const fs=sh(gl.FRAGMENT_SHADER,'#version 300 es\\nprecision mediump float;out vec4 o;void main(){o=vec4(1.);}');
      const pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);
      const vao=gl.createVertexArray(),b=gl.createBuffer();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);const a=gl.getAttribLocation(pr,'q');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);gl.useProgram(pr);
      p.drawCalls=0;const b0=p.drawCalls;for(let i=0;i<41;i++)gl.drawArrays(gl.TRIANGLES,0,3);const d=p.drawCalls-b0;
      gl.deleteBuffer(b);gl.deleteVertexArray(vao);gl.deleteProgram(pr);
      return {enabledDelta:d};
    }""")
    # B. window artifact repro: draw while DISABLED, then re-enable and report
    win=page.evaluate("""() => {
      const p=_PERF_PROF, savedEns=ens, savedReport=_perfReport;
      p.enabled=false;p.drawCalls=0;p.frameCnt=29;ens=[];_perfFrameTick();
      const disN=drawN=>{const gl=GL;const b=p.drawCalls;for(let i=0;i<drawN;i++)gl.drawArrays(gl.TRIANGLES,0,0);return p.drawCalls-b};
      const disabledDelta=disN(19), carried=p.drawCalls;let reported=-1;
      _perfReport=()=>{reported=p.drawCalls;p.drawCalls=0};ens=Array.from({length:301},()=>({alive:true}));_perfFrameTick();
      ens=savedEns;_perfReport=savedReport;p.enabled=false;p.drawCalls=0;
      return {disabledDelta,carried,reported,frameCnt:p.frameCnt};
    }""")
    print({'synthetic':nn,'window_after_fix':win,'pageerrors':errors})
    browser.close()
