# death-art

Art for the Unity death decision screen `NativeDeathOverlay` ("안식은 없다", 2026-11-04).

- Used: `death_splatter.png` — dark blood-ink bloom behind the title. Solid irregular blobs, 16 tapered splash strokes, a few large droplets (no stipple). Fixed seed 20261104. 1400x1400, drawn at 560–640 px in the 1920x1080 design space.
- The RGB is **pre-linearised** (each channel `pow(c/255, 2.2)`) because the Linear Player shows IMGUI texture values without sRGB decoding (measured 2026-11-04: authored 187 shown as 222). The shown colour is the authored one.
- `make.py` also renders a calligraphy test layer (Yuji Boku, OFL, `YujiBoku-OFL.txt`) from the first Phantom-Blade-style attempt. It is not used in the game.

```bash
curl -L -o YujiBoku-Regular.ttf https://github.com/google/fonts/raw/main/ofl/yujiboku/YujiBoku-Regular.ttf
python3 make.py YujiBoku-Regular.ttf /abs/out/art.html
node shoot.cjs /abs/out/art.html /abs/out    # writes death_splatter.png (+ unused calligraphy, preview)
```

Copy `death_splatter.png` to `unity/Assets/Exoduser/Resources/Art/ui/death/`. Headless Chrome cannot load a font from `file://`, so `make.py` embeds it as a data URI.
