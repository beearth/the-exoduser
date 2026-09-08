"""Character growth QA against server.cjs; isolated storage and no save writes."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

out=Path('captures/stat_panel_20260909');out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1920,'height':1080})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.route('**/api/slots**',lambda route:route.fulfill(status=200,content_type='application/json',body='[]') if route.request.method=='GET' else route.fulfill(status=200,body='{}'))
    page.goto('http://127.0.0.1:3333/game.html?test=1&demo&bosstest=3',wait_until='domcontentloaded')
    page.wait_for_function('typeof G!=="undefined" && G._bossArena && document.getElementById("_btPanel")',timeout=60000)
    page.add_style_tag(content='#_btPanel{display:none!important}')
    page.evaluate('''()=>{
      G.paused=true;_bossCine.active=false;window._testSaves=0;dbSaveNow=()=>{window._testSaves++};
      PASSIVE_DEF.forEach(d=>d.max=10);
      for(const key in STATS)STATS[key]=0;for(const key in PASSIVES)PASSIVES[key]=0;
      _grit=0;P.sp=8;P.ap=3;OPT.lang='ko';applyStats();openPanel('statPanel');
    }''')
    page.wait_for_timeout(800)
    page.screenshot(path=str(out/'stats_1920_ko.png'))
    print('INITIAL',page.evaluate('({cards:document.querySelectorAll(".growth-passive").length,ap:P.ap,errors:typeof ExoduserStatsPanel})'),flush=True)
    # Selecting, then buying, are separate actions. Crossing rank 3 costs 2 AP.
    page.locator('[data-passive="pMagic"]').click()
    assert page.evaluate('P.ap')==3
    page.locator('#growthUpgrade').click()
    assert page.evaluate('PASSIVES.pMagic===1&&P.ap===2&&_testSaves===1')
    page.locator('#growthRefund').click()
    assert page.evaluate('PASSIVES.pMagic===0&&P.ap===3')
    page.evaluate('PASSIVES.pMagic=3;P.ap=1;renderStatPanel()')
    assert page.locator('#growthUpgrade').is_disabled()
    page.evaluate('P.ap=2;renderStatPanel()')
    page.locator('#growthUpgrade').click()
    assert page.evaluate('PASSIVES.pMagic===4&&P.ap===0')
    # Bulk allocation is atomic; grit is uncapped; card browsing works without AP.
    page.locator('[data-focus="amount-10"]').click()
    assert page.locator('[data-focus="str-1"]').is_disabled()
    page.evaluate('P.sp=10;renderStatPanel()')
    page.locator('[data-focus="grit-1"]').click()
    assert page.evaluate('_grit===10&&P.sp===0')
    page.locator('[data-focus="grit--1"]').click()
    assert page.evaluate('_grit===0&&P.sp===10')
    page.locator('#growthSearch').fill('')
    page.locator('#growthSearch').press_sequentially('magic')
    assert page.locator('#statPanel').evaluate('(e)=>e.classList.contains("on")')
    assert page.locator('[data-passive="pMagic"]').count()==1
    page.locator('#growthSearch').fill('없는패시브')
    assert page.locator('.growth-empty').count()==1
    page.locator('#growthSearch').fill('')
    page.locator('[data-focus="filter-support"]').click()
    assert page.locator('.growth-passive').count()==11
    page.locator('[data-focus="filter-learned"]').click()
    assert page.locator('.growth-passive').count()==1
    page.locator('[data-focus="filter-all"]').click()
    page.locator('[data-passive="pCombo"]').click()
    assert page.locator('.growth-effect').inner_text()==page.evaluate('PASSIVE_DEF.find(d=>d.key==="pCombo").desc')
    print('TRANSACTIONS/FILTER PASS',flush=True)
    page.locator('#smToggleBtn').click()
    print('SUMMARY OPEN',flush=True)
    assert page.locator('#statSummary').is_visible()
    page.locator('#growthSummaryClose').click()
    assert page.locator('#growthSummaryDrawer').is_hidden()
    page.locator('#smToggleBtn').click()
    page.keyboard.press('Escape')
    assert page.locator('#growthSummaryDrawer').is_hidden()
    assert page.locator('#statPanel').evaluate('(e)=>e.classList.contains("on")')
    page.locator('[data-focus="filter-support"]').focus()
    page.keyboard.press('Space')
    assert page.locator('.growth-passive').count()==11
    page.keyboard.press('Tab')
    assert page.locator('#statPanel').evaluate('(e)=>e.classList.contains("on")')
    page.locator('[data-focus="filter-all"]').click()
    assert page.locator('#petSubtitle').evaluate('(e)=>getComputedStyle(e).visibility')=='hidden'
    # Confirmation cancellation preserves every allocation; confirmation refunds actual costs.
    print('SUMMARY PASS',flush=True)
    page.evaluate('''()=>{STATS.str=20;STATS.vit=4;_grit=7;PASSIVES.pAtk=10;PASSIVES.pMagic=4;P.sp=2;P.ap=3;renderStatPanel();window._realConfirm=gameConfirm;gameConfirm=async()=>false;}''')
    page.locator('#statResetBtn').click()
    assert page.evaluate('STATS.str===20&&_grit===7&&P.ap===3')
    page.evaluate('gameConfirm=async()=>true')
    page.locator('#statResetBtn').click()
    assert page.evaluate('STATS.str===0&&STATS.vit===0&&_grit===0&&P.sp===33&&P.ap===31&&PASSIVES.pAtk===0&&PASSIVES.pMagic===0')
    page.evaluate('()=>{gameConfirm=window._realConfirm}')
    print('RESET PASS',flush=True)
    cases=[]
    for w,h,lang in [(1920,1080,'ko'),(1280,720,'ko'),(960,720,'ko'),(1280,720,'en'),(600,900,'ko')]:
        page.set_viewport_size({'width':w,'height':h})
        page.evaluate('''lang=>{OPT.lang=lang;P.sp=8;P.ap=3;STATS.str=42;STATS.dex=18;STATS.int=8;STATS.lck=12;_grit=5;PASSIVES.pAtk=3;PASSIVES.pMagic=1;applyStats();renderStatPanel();}''',lang)
        page.locator('#growthSearch').fill('')
        page.locator('[data-passive="pAtk"]').click()
        page.locator('[data-focus="amount-1"]').click()
        page.evaluate('()=>{document.getElementById("statGrid").scrollTop=0;document.querySelector("#statPanel .pbox").scrollTop=0;_applyLang();_injectPanelNav("statPanel")}')
        page.wait_for_timeout(150)
        page.screenshot(path=str(out/f'stats_{w}_{lang}.png'))
        geometry=page.evaluate('''()=>{const p=document.querySelector('#statPanel .pbox'),b=p.getBoundingClientRect();return {overflow:p.scrollWidth>p.clientWidth+2,left:b.left,right:b.right,viewport:innerWidth,columns:[...document.querySelectorAll('.growth-column')].map(e=>({width:e.clientWidth,scroll:e.scrollWidth}))}}''')
        assert not geometry['overflow'],geometry
        assert geometry['left']>=0 and geometry['right']<=w+1,geometry
        cases.append({'width':w,'height':h,'lang':lang,**geometry})
    page.set_viewport_size({'width':1280,'height':720})
    page.locator('#statClose').click()
    assert not page.locator('#statPanel').evaluate('(e)=>e.classList.contains("on")')
    assert page.locator('#petSubtitle').evaluate('(e)=>getComputedStyle(e).visibility')!='hidden'
    assert not errors,errors
    (out/'report.json').write_text(json.dumps({'cases':cases,'pageErrors':errors,'transactions':'PASS','search':'PASS','refund':'PASS'},ensure_ascii=False,indent=2),encoding='utf-8')
    print('PASS: transactions, search/filter, reset, summary, responsive KO/EN; page errors=0',flush=True)
    browser.close()
