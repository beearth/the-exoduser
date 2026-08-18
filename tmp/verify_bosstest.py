from playwright.sync_api import sync_playwright
import json, time

URL = 'http://127.0.0.1:3333/game.html?bosstest=2&_v=arena-fix'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1400, 'height': 900})
    logs = []
    page.on('console', lambda m: logs.append(f'{m.type}: {m.text}'))
    page.on('pageerror', lambda e: logs.append(f'PAGEERROR: {e}'))
    page.goto(URL, wait_until='domcontentloaded', timeout=60000)
    # boot can wait on atlas; poll arena flag
    state = None
    for i in range(80):
        state = page.evaluate('''() => {
          const g = window.G, p = window.P, ens = window.ens;
          const boss = ens && ens.find(e => e && e.ib);
          const startRoom = g && g.rooms && g.rooms.find(r => r.type === 'start');
          const bossRoom = g && g.rooms && g.rooms.find(r => r.type === 'boss');
          return {
            ready: !!(g && p),
            on: !!(g && g.on),
            stage: g && g.stage,
            bossArena: !!(g && g._bossArena),
            cutsceneDone: !!(g && g._cutsceneDone),
            mapType: g && g.mapType,
            mw: g && g.mw, mh: g && g.mh,
            rooms: g && g.rooms && g.rooms.map(r => r.type),
            hasStartRoom: !!startRoom,
            hasBossRoom: !!bossRoom,
            ens: ens ? ens.length : -1,
            bossName: boss && (boss.name || boss._nm || ''),
            bossIb: !!(boss && boss.ib),
            bossHp: boss && boss.hp,
            map0: g && g.map && g.map[0] && g.map[0].length,
            btPanel: !!document.getElementById('_btPanel'),
            btActive: !!window._btActive,
            href: location.href
          };
        }''')
        if state and state.get('bossArena') and state.get('btPanel'):
            break
        time.sleep(0.25)
    page.screenshot(path='G:/exoduser/tmp/bosstest_arena.png')
    print(json.dumps(state, ensure_ascii=False, indent=2))
    print('---logs---')
    for line in logs[-40:]:
        print(line)
    browser.close()

    ok = state and state.get('bossArena') and state.get('hasBossRoom') and not state.get('hasStartRoom') and state.get('stage') == 2
    if not ok:
        raise SystemExit('FAIL: not in boss arena')
    print('OK: boss arena')
