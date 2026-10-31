"""Headless·무음 로고 전후 캡처/알파/겹침 검수. server.cjs는 별도로 실행한다.
python tools/verify-logo-solid.py OUTPUT http://127.0.0.1:3376
"""
from pathlib import Path
import json, sys, hashlib, io
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
BASE = sys.argv[2] if len(sys.argv) > 2 else 'http://127.0.0.1:3376'
SIZES = [1920, 3840]
result = {'captures': [], 'occlusion': [], 'errors': [], 'failures': [], 'mode': '실제 HTML·CSS; 로비 빈 슬롯 fixture, legacy 시네마틱·chapterGate·인게임 타이틀 강제 표시. 자연 플레이/영상 재인코딩 검수 아님.'}
LEGACY_ONLY = '--legacy-only' in sys.argv
if LEGACY_ONLY:
    result = json.loads((OUT / 'verification.json').read_text(encoding='utf8'))
    result['captures'] = [r for r in result['captures'] if r['screen'] != 'legacy-cinematic-title']

GEOMETRY = """selectors=>{
 const roots=selectors.map(s=>document.querySelector(s)).filter(Boolean),items=[],overlaps=[];
 const visible=e=>{for(let p=e;p;p=p.parentElement){const c=getComputedStyle(p);if(c.display==='none'||c.visibility==='hidden'||+c.opacity===0)return false;}return true;};
 for(const e of roots){if(!visible(e))continue;const r=e.getBoundingClientRect();if(r.width&&r.height)items.push({selector:selectors.find(s=>document.querySelector(s)===e),...r.toJSON()});}
 for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){const a=items[i],b=items[j];const x=Math.min(a.right,b.right)-Math.max(a.left,b.left),y=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);if(x>1&&y>1)overlaps.push({a:a.selector,b:b.selector,x,y});}
 const texts=[];for(const root of roots){if(!visible(root))continue;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(!n.textContent.trim()||!visible(n.parentElement)||n.parentElement.closest('script,style'))continue;const range=document.createRange();range.selectNodeContents(n);for(const r of range.getClientRects())if(r.width&&r.height)texts.push({node:n,text:n.textContent.trim(),...r.toJSON()});}}
 const textOverlaps=[];for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){const a=texts[i],b=texts[j];if(a.node===b.node)continue;const x=Math.min(a.right,b.right)-Math.max(a.left,b.left),y=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);if(x>2&&y>3)textOverlaps.push({a:a.text,b:b.text,x,y});}
 return {items,overlaps,textOverlaps};
}"""


def capture(page, phase, name, logo, selectors, fixture=False):
    page.evaluate('()=>document.fonts.ready')
    page.wait_for_timeout(250)
    rect = page.locator(logo).bounding_box()
    assert rect and rect['width'] > 0, (name, logo)
    file = f'{phase}-{name}-{page.viewport_size["width"]}x1080'
    shot = page.screenshot(path=str(OUT / (file + '.png')))
    image = Image.open(io.BytesIO(shot))
    visible_pixels = None
    if name == 'legacy-cinematic-title':
        page.locator(logo).evaluate("e=>e.style.visibility='hidden'")
        without = Image.open(io.BytesIO(page.screenshot()))
        page.locator(logo).evaluate("e=>e.style.visibility=''")
        visible_pixels = int(np.any(np.array(image) != np.array(without), axis=2).sum())
        assert visible_pixels > 1000, '시네마틱 제목이 다른 레이어에 가려짐'
    box = (int(rect['x']), int(rect['y']), int(np.ceil(rect['x'] + rect['width'])), int(np.ceil(rect['y'] + rect['height'])))
    crop = image.crop(box)
    crop.save(OUT / (file + '-logo-1x.png'))
    crop.resize((crop.width * 3, crop.height * 3), Image.Resampling.NEAREST).save(OUT / (file + '-logo-3x.png'))
    geometry = page.evaluate(GEOMETRY, selectors)
    row = {'phase': phase, 'screen': name, 'width': page.viewport_size['width'], 'file': file + '.png', 'logo': rect, 'fixture': fixture, 'visibleImagePixels': visible_pixels, **geometry}
    result['captures'].append(row)
    if geometry['overlaps'] or geometry['textOverlaps']:
        result['failures'].append({'kind': 'overlap', **row})
    print(file, flush=True)
    return image, rect


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=['--mute-audio'])
    try:
        for phase in ['before', 'after']:
            context = browser.new_context(viewport={'width': 1920, 'height': 1080}, device_scale_factor=1, reduced_motion='reduce')
            context.route('**/api/slots', lambda r: r.fulfill(json={'slots': []}))
            context.route('**/api/save**', lambda r: r.fulfill(json={'ok': True, 'qa': True}))
            if phase == 'before':
                context.route('**/img/logo_exoduser_solid.png', lambda r: r.fulfill(path=str(ROOT / 'img/logo_exoduser.png'), content_type='image/png'))
            context.add_init_script("localStorage.setItem('hellLang','ko');")
            page = context.new_page()
            page.on('pageerror', lambda e: result['errors'].append(str(e)))
            page.goto(BASE + '/index.html', wait_until='domcontentloaded')
            if LEGACY_ONLY:
                # Complete the real splash lifecycle so its independent FDG layer
                # cannot cover a directly forced cinematic state.
                page.wait_for_selector('#splashTitleMenu', state='visible', timeout=90000)
                page.locator('#splashTitleMenu .stm-btn').nth(1).click()
                page.wait_for_selector('#gateLock', state='visible')
                page.wait_for_timeout(1800)
                page.evaluate("()=>{document.getElementById('cinClickPrompt').style.display='none';const v=document.getElementById('cinVideo');v.pause();v.style.display='none';const e=document.getElementById('cinImg19');e.classList.add('show');e.style.zIndex='20';e.style.transition='none';e.style.opacity='1';e.querySelector('img').style.opacity='1';}")
                page.wait_for_function("()=>document.querySelector('#cinImg19 img').complete&&document.querySelector('#cinImg19 img').naturalWidth===1506")
                for width in SIZES:
                    page.set_viewport_size({'width': width, 'height': 1080})
                    capture(page, phase, 'legacy-cinematic-title', '#cinImg19 img', ['#cinImg19 img'], True)
                context.close()
                continue
            try:
                page.wait_for_load_state('networkidle', timeout=15000)
            except Exception:
                pass
            page.wait_for_selector('#splashTitleMenu', state='visible', timeout=90000)
            page.evaluate("()=>{const v=document.getElementById('splashTitleVideo');v.pause();if(v.readyState)v.currentTime=0;}")
            for width in SIZES:
                page.set_viewport_size({'width': width, 'height': 1080})
                capture(page, phase, 'splash', '#splashTitleLogo', ['#splashTitleLogo', '#splashTitleMenu', '#splashTitleBuild'])
            page.locator('#splashTitleMenu .stm-btn').nth(1).click()
            page.wait_for_selector('#gateLock', state='visible')
            page.wait_for_timeout(1800)
            for width in SIZES:
                page.set_viewport_size({'width': width, 'height': 1080})
                page.evaluate('()=>document.getAnimations().forEach(a=>a.pause())')
                image, rect = capture(page, phase, 'gate', '#gateLock .gl-logo', ['#gateLock .gl-logo', '.cin-hell-frame .cin-enter-btn'])
                page.locator('#gateLock .gl-sigil').evaluate("e=>e.style.visibility='hidden'")
                hidden = Image.open(io.BytesIO(page.screenshot()))
                page.locator('#gateLock .gl-sigil').evaluate("e=>e.style.visibility=''")
                # Exclude resampled matte edges: only the opaque silhouette core counts.
                mask = Image.open(OUT / 'solid-backing-mask.png').resize((round(rect['width']), round(rect['height'])), Image.Resampling.LANCZOS)
                core = ndi.binary_erosion(np.array(mask) == 255, iterations=2)
                x, y = round(rect['x']), round(rect['y'])
                a = np.array(image.convert('RGB'))[y:y + core.shape[0], x:x + core.shape[1]]
                b = np.array(hidden.convert('RGB'))[y:y + core.shape[0], x:x + core.shape[1]]
                diffs = np.max(abs(a.astype(int) - b.astype(int)), axis=2)
                row = {'phase': phase, 'width': width, 'corePixels': int(core.sum()), 'leakingPixels': int(((diffs > 3) & core).sum()), 'maxDelta': int(diffs[core].max())}
                result['occlusion'].append(row)
                if phase == 'after' and row['leakingPixels']:
                    result['failures'].append({'kind': 'sigil-leak', **row})
            # The old DOM title remains in the source; explicitly label this fixture.
            page.evaluate("()=>{document.getElementById('cinClickPrompt').style.display='none';const v=document.getElementById('cinVideo');v.pause();v.style.display='none';const e=document.getElementById('cinImg19');e.classList.add('show');e.style.zIndex='20';e.style.transition='none';e.style.opacity='1';e.querySelector('img').style.opacity='1';}")
            for width in SIZES:
                page.set_viewport_size({'width': width, 'height': 1080})
                capture(page, phase, 'legacy-cinematic-title', '#cinImg19 img', ['#cinImg19 img'], True)
            page.evaluate('async()=>{_testMode=true;await _goLobby()}')
            page.wait_for_selector('#lobby', state='visible')
            page.wait_for_timeout(2000)
            for width in SIZES:
                page.set_viewport_size({'width': width, 'height': 1080})
                capture(page, phase, 'lobby', '.lobby-brand-logo', ['.lobby-brand-logo', '#lobby .lobby-header', '.char-item-new', '#lobby .lobby-footer'], True)
            page.evaluate('()=>showLoading()')
            for width in SIZES:
                page.set_viewport_size({'width': width, 'height': 1080})
                capture(page, phase, 'chapter-gate', '#chGateImg', ['#chGateImg'], True)
            # Exercise the actual canvas title renderer, not a recreated logo card.
            game = context.new_page()
            game.on('pageerror', lambda e: result['errors'].append(str(e)))
            game.goto(BASE + '/game.html?forgelab=1&tutorial=0&resourceTutorial=0', wait_until='domcontentloaded')
            game.wait_for_function("()=>typeof P!=='undefined'&&P?.lv===1000&&!_bootLoadActive&&G.on", timeout=180000)
            # Current authored PRO/INTRO lines contain no title:true. Exercise the
            # preserved renderer branch using a transient QA line, without editing data.
            game.evaluate("()=>{window._btFramePause=true;G.paused=true;_cutsceneGetLines=()=>[{narr:true,title:true,text:'EXODUSER',dur:10000,fade:{in:400}}];_cutLineIdx=0;_cutsceneState='INTRO_CUTSCENE';_cutC.id='logoSolidCutsceneFixture';_cutC.style.display='block';_cutC.style.opacity='1';window._cutLogoImg=new Image();window._cutLogoImg.src='img/logo_exoduser_solid.png';}")
            game.wait_for_function('()=>window._cutLogoImg.complete&&window._cutLogoImg.naturalWidth===1506')
            for width in SIZES:
                game.set_viewport_size({'width': width, 'height': 1080})
                game.wait_for_timeout(250)
                game.evaluate('()=>{_cutLineStartMs=performance.now()-1500;_renderIntroCutscene();}')
                capture(game, phase, 'ingame-title', '#logoSolidCutsceneFixture', ['#logoSolidCutsceneFixture'], True)
            context.close()
        for name in ['index.html', 'game.html', 'img/logo_exoduser_solid.png']:
            import urllib.request
            disk = (ROOT / name).read_bytes()
            served = urllib.request.urlopen(BASE + '/' + name).read()
            result.setdefault('source', []).append({'path': name, 'sha256': hashlib.sha256(disk).hexdigest(), 'httpMatch': disk == served})
            if disk != served:
                result['failures'].append({'kind': 'source-http', 'path': name})
        if not all(r['leakingPixels'] > 0 for r in result['occlusion'] if r['phase'] == 'before'):
            result['failures'].append({'kind': 'baseline-leak-not-detected'})
    except Exception as error:
        result['failures'].append({'kind': 'harness-error', 'message': str(error)})
        raise
    finally:
        browser.close()
        (OUT / 'verification.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf8')
print(json.dumps({'captures': len(result['captures']), 'occlusion': result['occlusion'], 'errors': result['errors'], 'failures': result['failures']}, ensure_ascii=False), flush=True)
sys.exit(bool(result['errors'] or result['failures']))
