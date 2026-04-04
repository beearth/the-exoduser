import json
import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "generated" / "animation-smoke"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def page_eval(page, expr):
    script = f"""
    () => {{
      try {{
        return eval({json.dumps(expr)});
      }} catch (e) {{
        return {{ "__eval_error__": String(e) }};
      }}
    }}
    """
    return page.evaluate(script)


def snapshot(page, label):
    return page_eval(
        page,
        f"""(() => {{
          const enemy0 = (typeof ens !== 'undefined' && ens && ens.length)
            ? {{
                et: ens[0].et ?? null,
                x: Math.round(ens[0].x ?? 0),
                y: Math.round(ens[0].y ?? 0),
                hp: ens[0].hp ?? null,
                s: ens[0].s ?? ens[0].state ?? null,
                fr: ens[0]._eFr ?? ens[0].fr ?? null,
                walk: ens[0]._walkDist ?? null
              }}
            : null;
          return {{
            label: {json.dumps(label)},
            title: document.title,
            stage: typeof G !== 'undefined' ? G.stage : null,
            on: typeof G !== 'undefined' ? !!G.on : null,
            paused: typeof G !== 'undefined' ? !!G.paused : null,
            intro: typeof G !== 'undefined' ? !!G._intro : null,
            ensCount: typeof ens !== 'undefined' && ens ? ens.length : null,
            player: typeof P !== 'undefined' && P ? {{
              x: Math.round(P.x ?? 0),
              y: Math.round(P.y ?? 0),
              hp: P.hp ?? null,
              s: P.s ?? null,
              dir: P.dir ?? null,
              anim: P._sa?.anim ?? null,
              frame: P._sa?.f ?? null,
              done: P._sa?.done ?? null
            }} : null,
            atlas: {{
              player: typeof _atlasPReady !== 'undefined' ? !!_atlasPReady : null,
              enemy: typeof _atlasExtEReady !== 'undefined' ? !!_atlasExtEReady : null,
              boss: typeof _atlasExtBReady !== 'undefined' ? !!_atlasExtBReady : null,
              legacyEnemy: typeof _atlasEReady !== 'undefined' ? !!_atlasEReady : null,
              legacyBoss: typeof _atlasBReady !== 'undefined' ? !!_atlasBReady : null
            }},
            enemy0
          }};
        }})()""",
    )


def main():
    base_url = (
        sys.argv[1]
        if len(sys.argv) > 1
        else os.environ.get("SMOKE_URL", "http://127.0.0.1:8080/game.html?stage=3&test=1")
    )
    result = {
        "url": base_url,
        "console": [],
        "pageErrors": [],
        "requestFailures": [],
        "responses404": [],
        "snapshots": [],
    }

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        page.on(
            "console",
            lambda msg: result["console"].append(
                {"type": msg.type, "text": msg.text}
            ),
        )
        page.on("pageerror", lambda err: result["pageErrors"].append(str(err)))
        page.on(
            "response",
            lambda res: result["responses404"].append(
                {"url": res.url, "status": res.status}
            )
            if res.status == 404
            else None,
        )
        page.on(
            "requestfailed",
            lambda req: result["requestFailures"].append(
                {
                    "url": req.url,
                    "method": req.method,
                    "failure": req.failure,
                }
            ),
        )

        page.goto(result["url"], wait_until="load")
        page.wait_for_function(
            """
            () => {
              try {
                return eval("typeof G !== 'undefined' && typeof P !== 'undefined' && G && P && G.stage === 3");
              } catch (e) {
                return false;
              }
            }
            """,
            timeout=20000,
        )
        page.wait_for_function(
            """
            () => {
              try {
                return eval("typeof G !== 'undefined' && G && G.on === true && typeof P !== 'undefined' && P && !!P._sa");
              } catch (e) {
                return false;
              }
            }
            """,
            timeout=20000,
        )
        page.wait_for_timeout(1000)
        page.screenshot(path=str(OUT_DIR / "stage3-idle.png"), full_page=True)
        result["snapshots"].append(snapshot(page, "after-load"))

        page.mouse.click(200, 200)
        page.keyboard.down("d")
        page.wait_for_timeout(250)
        result["snapshots"].append(snapshot(page, "during-move"))
        page.wait_for_timeout(650)
        page.keyboard.up("d")
        page.wait_for_timeout(250)
        page.screenshot(path=str(OUT_DIR / "stage3-move.png"), full_page=True)
        result["snapshots"].append(snapshot(page, "after-move"))

        page.mouse.move(1100, 450)
        page.mouse.down()
        page.wait_for_timeout(120)
        result["snapshots"].append(snapshot(page, "during-attack"))
        page.wait_for_timeout(350)
        page.mouse.up()
        page.wait_for_timeout(450)
        page.screenshot(path=str(OUT_DIR / "stage3-attack.png"), full_page=True)
        result["snapshots"].append(snapshot(page, "after-attack"))

        spawned = page_eval(
            page,
            """(() => {
              if (typeof mkEn === 'undefined' || typeof ens === 'undefined' || typeof P === 'undefined') {
                return { ok: false, reason: 'spawn-api-missing' };
              }
              const e = mkEn(P.x + 180, P.y, 0, 0, false, EL.P, -1);
              ens.push(e);
              return { ok: true, et: e.et ?? null, count: ens.length };
            })()""",
        )
        result["spawnedEnemy"] = spawned
        page.wait_for_timeout(900)
        page.screenshot(path=str(OUT_DIR / "stage3-enemy.png"), full_page=True)
        result["snapshots"].append(snapshot(page, "after-enemy-spawn"))

        browser.close()

    out_path = OUT_DIR / "result.json"
    out_path.write_text(
        json.dumps(result, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(json.dumps(result, ensure_ascii=True))


if __name__ == "__main__":
    main()
