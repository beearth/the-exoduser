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

    # 1. generation: all 7 types, few tiers, real mkItem
    gen = page.evaluate("""() => {
      const out={};
      for(const wt of WTYPE_KEYS){
        const rows=[];
        for(const tier of [0,2,4]){
          const it=mkItem('weapon',tier,0,0,wt);  // el ignored (forced EL.P), rarity0
          const badge=(WTYPES[it.wtype]||{}).name;
          const card=(typeof _invCardFields==='function')?_invCardFields(it):'';
          rows.push({tier, name:it.name, wtype:it.wtype, emoji:it.emoji, badge,
            name_has_type: it.name.indexOf(WTYPES[wt].name)>=0,
            name_has_daegeom: it.name.indexOf('대검')>=0,
            card_has_type: card.indexOf(WTYPES[wt].name)>=0,
            wtype_ok: it.wtype===wt });
        }
        out[wt]=rows;
      }
      return out;
    }""")

    # 2. _weaponName unit map (all 7, physical tier0)
    unit = page.evaluate("""() => {
      const m={}; for(const wt of WTYPE_KEYS){ m[wt]=_weaponName(wt,0,0); } return m;
    }""")

    # 3. REAL migration via dbRestore(d): craft a save with legacy '대검' weapons, restore, verify rename + identity
    mig = page.evaluate("""() => {
      const d={player:{lv:60}, inv:{bag:[
        {id:1001,slot:'weapon',wtype:'axe',  el:0,tier:0,rarity:0,name:'녹슨 대검',  atk:10,spd:0.45},
        {id:1002,slot:'weapon',wtype:'spear',el:0,tier:3,rarity:0,name:'심판의 대검',atk:20,spd:0.45},
        {id:1003,slot:'weapon',wtype:'sword',el:0,tier:2,rarity:0,name:'흑요석 대검',atk:15,spd:0.45}
      ], equipped:{}}};
      const before=d.inv.bag.map(x=>({id:x.id,name:x.name,wtype:x.wtype,atk:x.atk}));
      let err=null; try{ dbRestore(d); }catch(e){ err=String(e); }
      const byId=(id)=>INV.bag.find(x=>x&&x.id===id)||null;
      const rep=(id)=>{const x=byId(id);return x?{name:x.name,wtype:x.wtype,atk:x.atk,tier:x.tier,nameMig:x._nameMig}:null;};
      // idempotency: run restore-equivalent guard twice shouldn't change (nameMig gate)
      return {restoreError:err, before, after:{axe:rep(1001),spear:rep(1002),sword:rep(1003)}};
    }""")

    # 4. stage transition + error capture
    trans = page.evaluate("""() => { let r=[]; for(const si of [1,2,0]){ try{G.stage=si;initStage(si);buildMapCache();r.push({si,ok:true});}catch(e){r.push({si,ok:false,e:String(e)});} } return r; }""")
    page.wait_for_timeout(500)

    print('==== WEAPON NAME VERIFY (port '+PORT+') ====')
    print(json.dumps({
      'reached_gameplay':on,
      'unit_weaponName':unit,
      'generation':gen,
      'migration_roundtrip':mig,
      'transitions':trans,
      'pageerrors':errs,
      'console_errors':console[:10],
    }, indent=2, ensure_ascii=False))
    browser.close()
