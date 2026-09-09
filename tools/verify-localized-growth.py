"""Exercise localized growth controls on server.cjs:3333 without saving user data."""
import json
import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright

out = Path('tmp/localization_qa')
out.mkdir(parents=True, exist_ok=True)
parser = argparse.ArgumentParser()
parser.add_argument('--width', type=int, default=1280)
parser.add_argument('--height', type=int, default=720)
args = parser.parse_args()
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': args.width, 'height': args.height})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.route('**/api/slots**', lambda r: r.fulfill(status=200, content_type='application/json', body='[]' if r.request.method == 'GET' else '{}'))
    page.add_init_script("localStorage.setItem('hellLang','malay');localStorage.removeItem('hellSettings');")
    page.goto('http://127.0.0.1:3333/game.html?test=1&demo&bosstest=3', wait_until='domcontentloaded')
    page.wait_for_function('typeof G!=="undefined" && G._bossArena', timeout=60000)
    assert page.evaluate('OPT.lang') == 'ms'
    page.evaluate('G.paused=true;_bossCine.active=false;dbSaveNow=()=>{}')
    page.add_style_tag(content='#_btPanel{display:none!important}')
    report = []
    for code in page.evaluate('Array.from(ExoduserI18n.languages)'):
        result = page.evaluate('''async code=>{
          OPT.lang=code;_applyLang();
          for(const k in STATS)STATS[k]=0;
          for(const k in PASSIVES)PASSIVES[k]=0;
          _grit=0;P.sp=100;P.ap=100;applyStats();openPanel('statPanel');
          const root=document.getElementById('statPanel'),missing=new Set(),overflow=new Set();let states=0;
          const click=s=>{const e=root.querySelector(s);if(!e)throw Error('Missing '+s);e.click();};
          const check=()=>{states++;for(const e of root.querySelectorAll('*')){
            if(e.children.length||!e.getClientRects().length||!e.textContent.trim())continue;
            if(code!=='ko'&&/[가-힣]/.test(e.textContent))missing.add(e.textContent);
            if(/\\{(?:n|p\\d+)\\}/.test(e.textContent))missing.add(e.textContent);
            const s=getComputedStyle(e);if(e.clientWidth>1&&e.scrollWidth>e.clientWidth+4&&s.textOverflow!=='ellipsis'&&s.clipPath==='none')overflow.add(e.id||e.className);
          }
          const overlap=(a,b)=>{
            if(!a?.getClientRects().length||!b?.getClientRects().length||getComputedStyle(a).display==='none'||getComputedStyle(b).display==='none')return;
            const x=a.getBoundingClientRect(),y=b.getBoundingClientRect();
            if(Math.min(x.right,y.right)-Math.max(x.left,y.left)>1&&Math.min(x.bottom,y.bottom)-Math.max(x.top,y.top)>1)overflow.add('overlap: '+(a.id||a.className)+' / '+(b.id||b.className));
          };
          overlap(root.querySelector('#growthAttributesTitle'),root.querySelector('#growthAttributesNote'));
          overlap(root.querySelector('.growth-library>.growth-section-heading'),root.querySelector('[data-path="all"]'));
          };
          const assert=(ok,label)=>{if(!ok)throw Error(code+': '+label);};
          click('[data-path="all"]');click('[data-focus="filter-all"]');
          const search=root.querySelector('#growthSearch');search.value='';search.dispatchEvent(new Event('input'));
          for(const key of PASSIVE_DEF.map(d=>d.key)){click('[data-passive="'+key+'"]');check();}
          for(const id of ['str','dex','int','lck','grit']){click('[data-focus="inspect-'+id+'"]');check();}
          click('[data-focus="str-1"]');check();assert(STATS.str===0&&P.sp===100,'draft spends live SP');
          click('#growthApply');check();assert(STATS.str===1&&P.sp===99,'SP apply');
          click('[data-passive="pAtk"]');click('#growthUpgrade');check();
          assert(PASSIVES.pAtk===0&&P.ap===100,'draft spends live AP');
          click('[data-focus="filter-planned"]');check();assert(root.querySelectorAll('[data-passive]').length===1,'pending filter');
          click('#growthApply');check();assert(PASSIVES.pAtk===1&&P.ap===99,'AP apply');
          click('[data-focus="filter-learned"]');check();assert(root.querySelectorAll('[data-passive]').length===1,'learned filter');
          click('[data-focus="filter-all"]');click('#growthRefund');check();click('#growthApply');check();
          assert(PASSIVES.pAtk===0&&P.ap===100,'AP refund');
          click('[data-passive="pHuman"]');click('#growthUpgrade');click('[data-passive="pDemon"]');click('#growthUpgrade');check();
          assert(root.querySelector('.growth-tradeoff'),'Humanity/Demon warning');click('#growthCancel');check();
          click('[data-focus="str-1"]');click('#statClose');await Promise.resolve();openPanel('statPanel');G.paused=true;check();
          assert(STATS.str===1&&P.sp===99&&root.querySelector('#growthApply').disabled,'close discards plan');
          click('#statResetBtn');check();assert(STATS.str===1&&P.sp===99,'full refund must stay draft');
          click('#growthApply');check();assert(STATS.str===0&&P.sp===100,'full refund apply');
          P.ap=0;P.sp=0;renderStatPanel();click('[data-passive="pMagic"]');check();assert(root.querySelector('#growthUpgrade').disabled,'AP shortage');
          click('[data-focus="inspect-str"]');check();assert(root.querySelector('#growthUpgrade').disabled,'SP shortage');
          PASSIVES.pMagic=PASSIVE_DEF.find(d=>d.key==='pMagic').max;P.ap=100;renderStatPanel();click('[data-passive="pMagic"]');check();assert(root.querySelector('#growthUpgrade').disabled,'rank cap: '+JSON.stringify({live:PASSIVES.pMagic,max:PASSIVE_DEF.find(d=>d.key==='pMagic').max,detail:root.querySelector('#growthDetail').innerText,button:root.querySelector('#growthUpgrade').textContent}));
          for(const id of ['assault','arcane','precision','erosion','survival','fate','all']){click('[data-path="'+id+'"]');check();}
          search.value='zzznomatchzzz';search.dispatchEvent(new Event('input'));check();assert(root.querySelectorAll('[data-passive]').length===0,'empty search');
          search.value='';search.dispatchEvent(new Event('input'));
          return {code,states,missing:[...missing],overflow:[...overflow],dir:document.documentElement.dir};
        }''', code)
        assert not result['missing'], result
        assert not result['overflow'], result
        assert result['dir'] == ('rtl' if code == 'ar' else 'ltr'), result
        report.append(result)
        if code in ['ms', 'el', 'ar']:
            page.screenshot(path=str(out / f'growth-reviewed-{code}-{args.width}.png'))
        print(code, 'PASS', result['states'], 'states', flush=True)
    assert not errors, errors
    (out / f'growth-interactions-final-{args.width}.json').write_bytes(json.dumps({'viewport': vars(args), 'languages': report, 'errors': errors}, ensure_ascii=False, indent=2).encode('utf8'))
    browser.close()
