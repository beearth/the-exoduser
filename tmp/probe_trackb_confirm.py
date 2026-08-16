from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(headless=True)
    pg=b.new_page(viewport={"width":1280,"height":720})
    pg.goto('http://127.0.0.1:3333/game.html?testchar=1&stage=0',wait_until='networkidle',timeout=60000)
    pg.wait_for_timeout(2000)
    r=pg.evaluate("""() => {
      const gl=GL,p=_PERF_PROF; p.enabled=true; _perfHookGL();
      const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x};
      const vs=sh(gl.VERTEX_SHADER,'#version 300 es\\nin vec2 q;void main(){gl_Position=vec4(q,0.,1.);}');
      const fs=sh(gl.FRAGMENT_SHADER,'#version 300 es\\nprecision mediump float;out vec4 o;void main(){o=vec4(1.);}');
      const pr=gl.createProgram();gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);
      const vao=gl.createVertexArray(),bf=gl.createBuffer();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,bf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);const a=gl.getAttribLocation(pr,'q');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);gl.useProgram(pr);
      p.drawCalls=0; for(let i=0;i<41;i++)gl.drawArrays(gl.TRIANGLES,0,3); const enOn=p.drawCalls;
      p.enabled=false; const b0=p.drawCalls; for(let i=0;i<41;i++)gl.drawArrays(gl.TRIANGLES,0,3); const enOff=p.drawCalls-b0;
      gl.deleteBuffer(bf);gl.deleteVertexArray(vao);gl.deleteProgram(pr);
      return {enabledCount:enOn, disabledCount:enOff};
    }""")
    print(r)
    b.close()
