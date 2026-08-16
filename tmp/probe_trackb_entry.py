from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":1280,"height":720})
    logs=[]
    page.on('console',lambda m: logs.append(m.text) if '[DCPROF f' in m.text else None)
    page.goto('http://127.0.0.1:3333/game.html?testchar=1&stage=2&dcprof',wait_until='networkidle',timeout=60000)
    prep=page.evaluate("""() => {
      initStage(2);while(!_bgInitDone)_tickBgInit(9999);
      const visible=(x,y)=>MAP_OBJS.reduce((n,mo)=>{const meta=_OBJ_META[mo.type],m=meta&&meta.sz>200?meta.sz:0;return mo.x>=x-VW/2-40-m&&mo.x<=x+VW/2+40+m&&mo.y>=y-VH/2-40-m&&mo.y<=y+VH/2+40+m?n+1:n},0);
      let best=MAP_OBJS[0],count=-1;for(const mo of MAP_OBJS){const n=visible(mo.x,mo.y);if(n>count){best=mo;count=n}}
      P.x=best.x;P.y=best.y;G.cam.x=best.x;G.cam.y=best.y;G.on=true;_DCP.resetFrame();
      _DCP._entry.raf++;_DCP._entry.main++;draw();_glFlush();
      return {total:MAP_OBJS.length,visible:count,dc:_DCP.dc,source:_DCP._srcSummary(),sourceSum:_DCP._sourceSum(),unknown:_DCP.srcDc[_DCP_SRC.UNKNOWN],entries:_DCP._entrySummary()};
    }""")
    page.wait_for_timeout(4500)
    print({'prep':prep,'reports':logs[-3:],'state':page.evaluate("() => ({mapObjs:MAP_OBJS.length,entry:_DCP._entry,dc:_DCP.dc,sourceSum:_DCP._sourceSum(),unknown:_DCP.srcDc[_DCP_SRC.UNKNOWN]})")})
    browser.close()
