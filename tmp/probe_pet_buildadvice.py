from playwright.sync_api import sync_playwright
import json, sys

# Verify pet build-advice AI. Mode-agnostic (works before & after fix).
#  Scenario: STR-heavy build, low survivability, lv>=50, no boss.
#  BEFORE fix (reads dead P.a*): 'build_str' NEVER fires; 'build_vit_low' ALWAYS fires.
#  AFTER fix (reads STATS.*, VIT nag removed): 'build_str' fires; 'build_vit_low' gone.
PORT = sys.argv[1] if len(sys.argv)>1 else '3333'

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":1280,"height":720})
    errs=[]; page.on('pageerror',lambda e:errs.append(str(e)))
    page.goto(f'http://127.0.0.1:{PORT}/game.html?testchar=1&stage=0',wait_until='networkidle',timeout=60000)
    on=False
    for _ in range(30):
        page.wait_for_timeout(500)
        if page.evaluate("()=>G.on"): on=True; break

    def run(build):
        # build: dict of STATS + grit; also sets P.a* to same to be fair to old code path
        return page.evaluate("""(b)=>{
          // hook _petBidCD to record fired ids
          if(!window.__origBid){ window.__origBid=_petBidCD; }
          window.__fired=[];
          _petBidCD=function(id,who,txt,dur,cd,pw,pt,pd){ window.__fired.push(id); return window.__origBid(id,who,txt,dur,cd,pw,pt,pd); };
          // state
          G.bossAlive=false; P.lv=b.lv;
          for(const k in b.stats){ STATS[k]=b.stats[k]; }
          try{ _grit=b.grit; }catch(e){}
          // legacy fields (what the buggy code reads) — leave at 0 to reflect real gameplay
          P.astr=0;P.adex=0;P.aint=0;P.alck=0;P.avit=0;
          // reset hint flags + dialogue cooldowns so bids can fire
          if(typeof _petBuildHinted!=='undefined'){ for(const k in _petBuildHinted) _petBuildHinted[k]=false; }
          try{ for(const k in _petDlgCD) _petDlgCD[k]=0; }catch(e){}
          // ensure the build block runs: frame multiple of 300
          G.frame=300;
          try{ _checkPetDialogue(); }catch(e){ return {error:String(e)}; }
          return {fired:window.__fired.slice(), stats:{str:STATS.str,dex:STATS.dex,int:STATS.int,lck:STATS.lck,vit:STATS.vit}, grit:(typeof _grit!=='undefined'?_grit:null), lv:P.lv};
        }""", build)

    run({'lv':60,'grit':0,'stats':{'str':50,'dex':50,'int':50,'lck':0,'vit':0}})  # warm-up (discard first-call state)
    # STR-heavy build, no grit (low survivability), lv60
    r_str = run({'lv':60,'grit':0,'stats':{'str':100,'dex':5,'int':5,'lck':0,'vit':0}})
    # INT-heavy build
    r_int = run({'lv':60,'grit':0,'stats':{'str':5,'dex':5,'int':100,'lck':0,'vit':0}})
    # LCK-heavy build
    r_lck = run({'lv':60,'grit':0,'stats':{'str':40,'dex':5,'int':5,'lck':40,'vit':0}})
    # tanky build (high STR -> lots of HP): should NOT get a false "too fragile" nag after fix
    r_tank = run({'lv':60,'grit':50,'stats':{'str':200,'dex':5,'int':5,'lck':0,'vit':0}})

    fix_present = page.evaluate("()=>(typeof _drainTexGCQueue==='function')")  # proxy not reliable; report reads instead
    reads = page.evaluate("""()=>{ // detect which fields the source reads by checking a fresh string of the fn if available
      return {petFnLen: (typeof _checkPetDialogue==='function')?_checkPetDialogue.toString().length:0}; }""")

    print('==== PET BUILD-ADVICE VERIFY (port '+PORT+') ====')
    print(json.dumps({
      'reached_gameplay':on,
      'STR_build':r_str, 'INT_build':r_int, 'LCK_build':r_lck, 'TANK_build':r_tank,
      'pageerrors':errs,
    }, indent=2, ensure_ascii=False))
    browser.close()
