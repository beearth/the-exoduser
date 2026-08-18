from playwright.sync_api import sync_playwright
import json, sys
PORT = sys.argv[1] if len(sys.argv)>1 else '3333'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":1280,"height":720})
    errs=[]; console=[]
    page.on('pageerror',lambda e:errs.append(str(e)))
    page.on('console',lambda m: console.append(m.text) if m.type=='error' else None)
    page.goto(f'http://127.0.0.1:{PORT}/game.html?testchar=1&stage=0',wait_until='networkidle',timeout=60000)
    on=False
    for _ in range(30):
        page.wait_for_timeout(500)
        if page.evaluate("()=>G.on"): on=True; break

    # 1. tooltip def text now correct
    tip = page.evaluate("""() => {
      const s=(typeof SKILLS!=='undefined'?SKILLS:(typeof SKILL_LIST!=='undefined'?SKILL_LIST:[])).find(x=>x&&x.id==='iceOrb');
      if(!s) return {found:false};
      return {found:true, desc:s.desc, descEn:s.descEn,
        ko_has_8:/얼음칼날 8발/.test(s.desc), ko_has_plus4:/칼날\\+4/.test(s.desc), ko_has_48:/48/.test(s.desc),
        en_has_8:/8 ice blades/.test(s.descEn), en_has_plus4:/blades\\+4/.test(s.descEn), en_has_48:/48/.test(s.descEn)};
    }""")

    # 2. runtime blade count at Lv1 and Lv10 (must match tooltip base 8 / +4/Lv)
    def blades(lv):
        return page.evaluate("""(lv)=>{
          P.skills.iceOrb=lv; P._ioActive=true; P._ioBon=0;
          // clear existing ice blades count baseline
          const before=pProjs.filter(q=>q&&q.iceBlade).length;
          try{ activateIceShatter(); }catch(e){ return {error:String(e)}; }
          const after=pProjs.filter(q=>q&&q.iceBlade).length;
          return {lv, spawned:after-before};
        }""",lv)
    b1=blades(1); b10=blades(10)

    # 3. regression: transitions + errors
    trans = page.evaluate("""()=>{let r=[];for(const si of [1,2,3,0]){try{G.stage=si;initStage(si);buildMapCache();r.push({si,ok:true});}catch(e){r.push({si,ok:false});}}return r;}""")

    print('==== ICEORB VERIFY (port '+PORT+') ====')
    print(json.dumps({'reached_gameplay':on,'tooltip':tip,'blades_lv1':b1,'blades_lv10':b10,'transitions':trans,'pageerrors':errs,'console_errors':console[:6]}, indent=2, ensure_ascii=False))
    browser.close()
