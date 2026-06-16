from playwright.sync_api import sync_playwright

URL = "https://the-exoduser.vercel.app/game.html"
with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    pg = b.new_page()
    pg.goto(URL, wait_until="domcontentloaded")
    pg.wait_for_timeout(1500)
    # Vercel password gate
    if pg.locator("input[type=password]").count() > 0:
        pg.fill("input[type=password]", "fdg2026!")
        pg.keyboard.press("Enter")
        pg.wait_for_timeout(3000)
    # fetch raw source through authenticated context
    src = pg.evaluate("fetch('/game.html',{cache:'no-store'}).then(r=>r.text())")
    open("G:/hell/_deployed_game.html","w",encoding="utf-8").write(src)
    print("deployed bytes:", len(src))
    b.close()
