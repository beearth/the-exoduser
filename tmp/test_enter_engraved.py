from playwright.sync_api import sync_playwright
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for width, height, action in [(1440,900,'click'), (1920,1080,'Enter'), (900,900,'click')]:
        page = browser.new_page(viewport={'width':width,'height':height})
        errors=[]
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto('http://127.0.0.1:3333/index.html', wait_until='networkidle')
        page.evaluate("() => {for(let i=0;i<8;i++) document.getElementById('fdgScreen').click();}")
        page.wait_for_timeout(1000)
        page.evaluate("() => {document.getElementById('fdgScreen').style.display='none'; _goCinematic();}")
        page.wait_for_timeout(2500)
        button=page.locator('.cin-enter-btn')
        assert button.evaluate("e => e.tagName === 'BUTTON'"), 'ENTER must be a native text button, not a metal image'
        assert button.bounding_box()['width'] <= 240, 'ENTER must remain a secondary visual element'
        page.screenshot(path=f'tmp/enter_engraved_{width}.png')
        if action=='click': button.click()
        else:
            button.focus()
            page.keyboard.press('Enter')
        page.wait_for_timeout(1500)
        assert page.locator('#cinClickPrompt').evaluate("e => getComputedStyle(e).display === 'none'"), 'Entry transition failed'
        assert not errors, errors
        print(json.dumps({'viewport':[width,height], 'action':action, 'result':'PASS'}))
        page.close()
    browser.close()
