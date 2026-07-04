from playwright.sync_api import sync_playwright
import time, hashlib
CB=str(int(time.time()))
with sync_playwright() as p:
    b=p.chromium.launch(headless=True)
    pg=b.new_context().new_page()
    pg.goto("https://the-exoduser.vercel.app/game.html?cb="+CB, wait_until="domcontentloaded")
    pg.wait_for_timeout(1500)
    if pg.locator("input[type=password]").count()>0:
        pg.fill("input[type=password]","fdg2026!"); pg.keyboard.press("Enter"); pg.wait_for_timeout(3500)
    resp=pg.request.get("https://the-exoduser.vercel.app/game.html?cb2="+CB)
    h=resp.headers
    body=resp.body()
    print("status:",resp.status)
    print("x-vercel-cache:",h.get("x-vercel-cache"))
    print("age:",h.get("age"))
    print("date:",h.get("date"))
    print("last-modified:",h.get("last-modified"))
    print("x-vercel-id:",h.get("x-vercel-id"))
    print("body bytes:",len(body),"md5:",hashlib.md5(body).hexdigest())
    b.close()
