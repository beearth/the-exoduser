"""Isolated runtime QA for staged growth allocation and the remastered UI."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT=Path('captures/growth_visual_20260909');OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1920,'height':1080})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.route('**/api/slots**',lambda r:r.fulfill(status=200,content_type='application/json',body='[]' if r.request.method=='GET' else '{}'))
    page.goto('http://127.0.0.1:3333/game.html?test=1&demo&bosstest=3',wait_until='domcontentloaded')
    page.wait_for_function('typeof G!=="undefined"&&G._bossArena&&document.getElementById("_btPanel")',timeout=60000)
    page.add_style_tag(content='#_btPanel{display:none!important}')
    page.evaluate('''()=>{G.paused=true;_bossCine.active=false;dbSaveNow=()=>window._saves++;window._saves=0;PASSIVE_DEF.forEach(d=>d.max=10);for(const k in STATS)STATS[k]=0;for(const k in PASSIVES)PASSIVES[k]=0;_grit=0;P.sp=10;P.ap=5;OPT.lang='ko';applyStats();openPanel('statPanel');}''')
    assert page.locator('#growthApply').count()==1,'Pending allocation Apply control is missing'
    assert page.locator('.growth-stat-select').count()==5,'Attribute contribution inspector is missing'
    assert '0.025%' in page.locator('#statPanel').inner_text(),'LCK per-point critical chance must retain its precision'
    page.locator('[data-focus="inspect-str"]').click()
    assert 'HP' in page.locator('.growth-effects-table').inner_text()
    assert '/s' in page.locator('.growth-effects-table').inner_text()
    assert page.locator('[data-path]').count()==7
    page.locator('[data-passive="pMagic"]').click()
    page.locator('#growthUpgrade').click()
    assert page.evaluate('PASSIVES.pMagic===0&&P.ap===5&&_saves===0'),'Preview must not spend or save'
    assert page.locator('#growthApply').is_enabled()
    page.locator('[data-focus="amount-10"]').click()
    page.locator('[data-focus="str-1"]').click()
    assert page.evaluate('STATS.str===0&&P.sp===10')
    page.locator('#growthCancel').click()
    assert page.locator('#growthApply').is_disabled()
    assert page.evaluate('STATS.str===0&&P.ap===5&&_saves===0')
    page.locator('[data-passive="pMagic"]').click()
    page.locator('#growthUpgrade').click()
    page.locator('[data-focus="str-1"]').click()
    page.locator('#growthApply').click()
    assert page.evaluate('STATS.str===10&&PASSIVES.pMagic===1&&P.sp===0&&P.ap===4&&_saves===1')
    # A draft refund can fund a different stat; cancel/close discards it.
    page.locator('[data-focus="str--1"]').click()
    page.locator('[data-focus="dex-1"]').click()
    page.locator('#statClose').click()
    page.evaluate('openPanel("statPanel")')
    assert page.locator('#growthApply').is_disabled()
    assert page.evaluate('STATS.str===10&&STATS.dex===0')
    # All 26 passives are reachable through six distinct paths.
    counts=[]
    for key in ['assault','arcane','precision','erosion','survival','fate']:
        page.locator('[data-path="'+key+'"]').click()
        counts.append(page.locator('.growth-passive').count())
    assert counts==[5,3,5,4,5,4],counts
    page.locator('[data-path="all"]').click()
    page.locator('#growthSearch').fill('critical')
    assert page.locator('[data-passive="pCrit"]').count()==1
    page.locator('#growthSearch').fill('no_such_passive')
    assert page.locator('.growth-empty').count()==1
    page.locator('#growthSearch').fill('')
    # Reset is staged, and includes hidden legacy VIT + grit at their real costs.
    page.evaluate('STATS.vit=2;_grit=3;renderStatPanel()')
    page.locator('#statResetBtn').click()
    assert page.evaluate('STATS.str===10&&STATS.vit===2&&_grit===3')
    page.locator('#growthApply').click()
    assert page.evaluate('STATS.str===0&&STATS.vit===0&&_grit===0&&P.sp===15&&P.ap===5&&PASSIVES.pMagic===0')
    # Stamina Vessel remains applied after every resource recalculation.
    page.evaluate('PASSIVES.pStamina=3;applyStats();window._mst=P.mst;recalcSt()')
    assert page.evaluate('P.mst===_mst')
    page.locator('#smToggleBtn').click()
    assert page.locator('#statSummary').is_visible()
    page.keyboard.press('Escape')
    assert page.locator('#growthSummaryDrawer').is_hidden()
    page.evaluate('P.sp=28;P.ap=12;STATS.str=42;STATS.dex=18;STATS.int=8;STATS.lck=12;_grit=5;PASSIVES.pAtk=3;PASSIVES.pMagic=1;applyStats();renderStatPanel()')
    page.locator('[data-path="assault"]').click()
    page.locator('[data-passive="pParry"]').click()
    page.locator('#growthUpgrade').click()
    cases=[]
    for w,h,lang in [(1920,1080,'ko'),(1280,720,'ko'),(960,720,'ko'),(1280,720,'en'),(600,900,'ko')]:
        page.set_viewport_size({'width':w,'height':h})
        page.evaluate('lang=>{OPT.lang=lang;renderStatPanel();_applyLang();_injectPanelNav("statPanel")}',lang)
        page.wait_for_timeout(100)
        geometry=page.locator('#statPanel .pbox').evaluate('(e)=>({width:e.clientWidth,scroll:e.scrollWidth,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})')
        assert geometry['scroll']<=geometry['width']+2,geometry
        assert geometry['left']>=0 and geometry['right']<=w+1,geometry
        if w>=960:
            visible=page.evaluate('''()=>{
                const detail=document.getElementById('growthDetail'),box=detail.getBoundingClientRect();
                const rows=[...detail.querySelectorAll('.growth-effect-row')];
                const paths=document.getElementById('growthPaths');
                return {lastEffectBottom:rows.at(-1).getBoundingClientRect().bottom,detailBottom:box.bottom,
                    pathHeight:paths.clientHeight,pathScroll:paths.scrollHeight};
            }''')
            assert visible['lastEffectBottom']<=visible['detailBottom']+1,(w,h,lang,visible)
            assert visible['pathScroll']<=visible['pathHeight']+2,(w,h,lang,visible)
        page.screenshot(path=str(OUT/f'growth_{w}_{lang}.png'))
        cases.append({'w':w,'h':h,'lang':lang,**geometry})
    page.set_viewport_size({'width':1920,'height':1080})
    page.evaluate('OPT.lang="ko";renderStatPanel()')
    page.locator('[data-focus="inspect-str"]').click()
    page.screenshot(path=str(OUT/'attribute_detail_1920.png'))
    page.locator('[data-path="all"]').click()
    page.screenshot(path=str(OUT/'all_paths_1920.png'))
    assert not errors,errors
    report={'draft':'PASS','apply':'PASS','refund':'PASS','closeDiscard':'PASS','paths':counts,'stamina':'PASS','cases':cases,'pageErrors':errors}
    (OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))
    browser.close()
