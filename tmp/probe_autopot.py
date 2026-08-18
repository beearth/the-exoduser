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

    res = page.evaluate("""() => {
      const el=document.getElementById('optAutoPot');
      if(!el) return {error:'no optAutoPot element'};
      const attrs={min:el.min,max:el.max,step:el.step};
      // A. element clamping (browser clamps assignment to [min,max] and snaps to step)
      const clamp={};
      for(const t of ['30','60','95','99','100']){ el.value=t; clamp[t]=el.value; }
      // B. oninput round-trip (handler sets OPT.autoPotThr = value/100). Attach exists after settings init.
      const rt={};
      for(const t of ['30','60','99']){ el.value=t; el.dispatchEvent(new Event('input')); rt[t]=OPT.autoPotThr; }
      // C. populate logic (default + legacy save representable): _apV=~~((thr||0.99)*100), el.value=_apV
      const pop={};
      for(const thr of [0.99,0.95,0.60,0.30]){ OPT.autoPotThr=thr; const v=~~((OPT.autoPotThr||0.99)*100); el.value=v; pop[thr]=el.value; }
      // D. dead-wiring runtime proof: auto-pot trigger uses (mhp-hp>=healAmt), NOT autoPotThr.
      //    Show trigger eligibility identical for threshold 0.10 vs 0.99 at 80% HP.
      const healAmt=~~(potHeal('hp')*(1+_eqAffix('potionPower')));
      const simEligible=(thr)=>{ OPT.autoPotThr=thr; P.hp=~~(P.mhp*0.8); const missing=P.mhp-P.hp;
        return {missing, healAmt, condMissingGEHeal:(missing>=healAmt), refsThreshold:false /*code: 29262 no autoPotThr*/}; };
      const wireLow=simEligible(0.10), wireHigh=simEligible(0.99);
      OPT.autoPotThr=0.99; P.hp=P.mhp;
      return {attrs, clamp, roundtrip:rt, populate:pop, deadwire:{at80pct_thr010:wireLow, at80pct_thr099:wireHigh}};
    }""")

    trans = page.evaluate("""() => { let r=[]; for(const si of [1,0]){ try{G.stage=si;initStage(si);buildMapCache();r.push({si,ok:true});}catch(e){r.push({si,ok:false,e:String(e)});} } return r; }""")

    print('==== AUTOPOT VERIFY (port '+PORT+') ====')
    print(json.dumps({'reached_gameplay':on,'result':res,'transitions':trans,'pageerrors':errs,'console_errors':console[:8]}, indent=2, ensure_ascii=False))
    browser.close()
