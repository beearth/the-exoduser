"""Regression for cinematic exits; uses isolated browser and synthetic account data."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 720})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.route('**/supabase.min.js', lambda route: route.fulfill(
        content_type='application/javascript', body='window.supabase={createClient:()=>({})};'))
    try:
        page.goto("http://127.0.0.1:3333/?cinematic=1", wait_until="networkidle")
        page.evaluate("""() => {
          currentUser={id:'intro-regression',email:'intro@example.invalid'};
          sb.from=()=>({select:()=>({eq:()=>({order:()=>new Promise(resolve=>{
            window.resolveCharacters=()=>resolve({data:[],error:null});
          })})})});
        }""")
        page.get_by_role("button", name="입장 / Enter", exact=True).click()
        page.wait_for_function("worldIntroVideo.currentTime>0.2", timeout=30000)
        page.evaluate("worldIntroVideo.currentTime=112")
        page.wait_for_function("_cinDone && typeof resolveCharacters==='function'", timeout=10000)
        assert not page.locator('#chapterGate').is_visible(), 'Movie completion repeats the fullscreen loading logo'
        assert page.locator('#lobby').is_visible()
        page.screenshot(path='output/cinematic/single_logo_lobby_handoff_20260908.png')
        page.evaluate("resolveCharacters()")
        page.wait_for_function("getComputedStyle(chapterGate).display==='none'")
        page.evaluate("_goCinematic(); skipToGate()")
        assert not page.locator('#chapterGate').is_visible(), 'Online hold skip repeats loading logo'
        page.evaluate("resolveCharacters()")
        page.evaluate("currentUser=null; _goCinematic(); skipToGate()")
        assert page.locator('#loginSection').is_visible()
        assert not page.locator('#loginSection .login-brand').is_visible(), 'Hold skip repeats login logo'
        page.evaluate("_goLogin()")
        assert page.locator('#loginSection .login-brand').is_visible()
        page.evaluate("showLoading('Loading')")
        assert page.locator('#chapterGate').is_visible(), 'Normal loading should retain its logo'
        assert not errors, errors
        print('PASS: natural online exit, online/login skip exits, normal login/loading; page errors 0')
    finally:
        browser.close()
