"""Exercise the real SP/AP body tree in a fresh browser, with saves isolated."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT=Path('captures/passive_codex_20260909')
OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1920,'height':1080})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.route('**/api/slots**',lambda r:r.fulfill(status=200,content_type='application/json',body='[]' if r.request.method=='GET' else '{}'))
    page.goto('http://127.0.0.1:3333/game.html?test=1&demo&bosstest=3',wait_until='domcontentloaded')
    page.wait_for_function('typeof G!=="undefined"&&G._bossArena',timeout=60000)
    page.add_style_tag(content='#_btPanel{display:none!important}')
    page.evaluate('''()=>{G.paused=true;_bossCine.active=false;window._saves=0;dbSaveNow=()=>_saves++;
      for(const k in STATS)STATS[k]=0;for(const k in PASSIVES)PASSIVES[k]=0;
      STATS.vit=2;_grit=3;P.sp=20;P.ap=10;OPT.lang='ko';applyStats();openPanel('statPanel');}''')
    page.locator('#growthTreeViewport').wait_for(state='visible')
    assert page.locator('[data-body-node]').count()==31
    assert page.locator('#statLeft').is_hidden()
    detail=page.locator('#growthDetail').inner_text()
    page.locator('[data-body-node="pMagic"]').hover()
    assert page.locator('#growthNodePreview').is_visible()
    assert 'MP' in page.locator('#growthNodePreview').inner_text()
    assert page.locator('#growthDetail').inner_text()==detail
    assert page.evaluate('P.sp===20&&P.ap===10&&_saves===0')
    page.screenshot(path=str(OUT/'codex_preview_1920_ko.png'))
    page.locator('[data-body-node="int"]').click()
    page.locator('[data-focus="amount-10"]').click()
    page.locator('#growthUpgrade').click()
    assert page.evaluate('STATS.int===0&&P.sp===20&&_saves===0')
    page.locator('[data-body-node="pMagic"]').click()
    page.locator('#growthUpgrade').click()
    assert page.locator('[data-connection="pMagic"].route').count()==1
    assert page.locator('#growthDraftList [data-draft-key]').count()==2
    page.locator('[data-path="assault"]').click()
    page.locator('[data-draft-key="pMagic"]').click()
    assert page.locator('[data-body-node="pMagic"]').get_attribute('aria-pressed')=='true'
    page.mouse.move(1,1)
    page.screenshot(path=str(OUT/'codex_plan_1920_ko.png'))
    assert page.evaluate('PASSIVES.pMagic===0&&P.ap===10&&_saves===0')
    page.locator('#growthApply').click()
    assert page.evaluate('STATS.int===10&&P.sp===10&&PASSIVES.pMagic===1&&P.ap===9&&STATS.vit===2&&_grit===3&&_saves===1')
    page.locator('[data-body-node="int"]').click()
    page.locator('#growthRefund').click()
    page.locator('[data-body-node="str"]').click()
    page.locator('#growthUpgrade').click()
    page.locator('#statClose').click()
    page.evaluate('openPanel("statPanel")')
    assert page.evaluate('STATS.int===10&&STATS.str===0&&P.sp===10&&_saves===1')
    assert page.locator('#growthApply').is_disabled()
    page.locator('#growthSearch').fill('int')
    assert page.locator('[data-body-node="int"]').count()==1
    page.locator('#growthSearch').fill('no_such_node_123')
    assert page.locator('[data-body-node]').count()==0
    assert page.locator('.growth-empty').count()==1
    page.locator('#growthSearch').fill('')
    page.locator('[data-focus="filter-learned"]').click()
    assert page.locator('[data-body-node]').count()==3 # INT, GRIT, Mana Surge
    page.locator('[data-focus="filter-all"]').click()
    page.locator('[data-body-node="pMagic"]').focus()
    page.keyboard.press('ArrowDown')
    assert page.locator(':focus').get_attribute('data-body-node')!='pMagic'
    page.locator('.growth-zoom-button').nth(2).click()
    assert page.locator('.growth-zoom-button').nth(1).inner_text()=='125%'
    transform=page.locator('#growthTreeScene').get_attribute('style')
    box=page.locator('#growthTreeViewport').bounding_box()
    page.mouse.move(box['x']+50,box['y']+80)
    page.mouse.down()
    page.mouse.move(box['x']+115,box['y']+115,steps=4)
    page.mouse.up()
    assert page.locator('#growthTreeScene').get_attribute('style')!=transform
    assert page.evaluate('_saves===1')
    for _ in range(5):page.locator('.growth-zoom-button').nth(2).click()
    assert page.locator('.growth-zoom-button').nth(2).is_disabled()
    page.locator('[data-body-node="pMalice"]').focus()
    node=page.locator('[data-body-node="pMalice"]').bounding_box()
    assert box['y']<=node['y'] and node['y']+node['height']<=box['y']+box['height']+1
    page.locator('.growth-zoom-button').nth(1).click()
    assert page.locator('.growth-zoom-button').nth(1).inner_text()=='100%'
    page.locator('#smToggleBtn').click()
    assert page.locator('#statSummary').is_visible()
    page.keyboard.press('Escape')
    assert page.locator('#growthSummaryDrawer').is_hidden()
    page.locator('#statResetBtn').click()
    assert page.evaluate('STATS.int===10&&_grit===3')
    page.locator('#growthApply').click()
    assert page.evaluate('STATS.int===0&&STATS.vit===0&&_grit===0&&P.sp===25&&P.ap===10')
    page.evaluate('STATS.str=12;STATS.int=8;PASSIVES.pAtk=3;PASSIVES.pMelee=2;PASSIVES.pMagic=2;P.sp=20;P.ap=10;applyStats();renderStatPanel()')
    cases=[]
    for w,h,lang in [(1920,1080,'ko'),(1280,720,'ko'),(960,720,'ko'),(600,900,'ko'),(1280,720,'en'),(1280,720,'ar'),(1920,1080,'ms')]:
        page.set_viewport_size({'width':w,'height':h})
        page.evaluate('lang=>{OPT.lang=lang;_applyLang();renderStatPanel();}',lang)
        page.locator('[data-body-node="pMelee"]').click()
        page.wait_for_timeout(100)
        geo=page.evaluate('''()=>{
          const shell=document.querySelector('#statPanel .pbox'),view=document.getElementById('growthTreeViewport'),v=view.getBoundingClientRect();
          const nodes=[...document.querySelectorAll('[data-body-node]')].map(n=>{const r=n.getBoundingClientRect();return {key:n.dataset.bodyNode,x:r.x,y:r.y,w:r.width,h:r.height};});
          return {shellWidth:shell.clientWidth,shellScroll:shell.scrollWidth,view:{left:v.left,top:v.top,right:v.right,bottom:v.bottom},nodes};
        }''')
        assert geo['shellScroll']<=geo['shellWidth']+2,(w,lang,geo)
        for n in geo['nodes']:
            v=geo['view']
            assert n['x']>=v['left']-1 and n['y']>=v['top']-1 and n['x']+n['w']<=v['right']+1 and n['y']+n['h']<=v['bottom']+1,(w,lang,n,v)
        page.mouse.move(1,1)
        page.screenshot(path=str(OUT/f'codex_{w}_{lang}.png'))
        if w==600:
            page.locator('#growthUpgrade').scroll_into_view_if_needed()
            assert page.locator('#growthUpgrade').is_visible()
            page.screenshot(path=str(OUT/'codex_600_ko_detail.png'))
            page.locator('#statPanel .pbox').evaluate('(n)=>n.scrollTop=0')
        cases.append({'width':w,'height':h,'lang':lang,**geo})
    assert not errors,errors
    (OUT/'report.json').write_text(json.dumps({'cases':cases,'errors':errors,'transactions':'PASS','previewWithoutMutation':'PASS','draftNavigation':'PASS','mobileDetailScroll':'PASS'},ensure_ascii=False,indent=2),encoding='utf8')
    print(json.dumps({'cases':len(cases),'transactions':'PASS','errors':errors}))
    browser.close()
