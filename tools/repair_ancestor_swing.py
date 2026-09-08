"""Recover full authored poses BEFORE packing equal-width runtime cells."""
from collections import deque
from pathlib import Path
from PIL import Image, ImageFilter
from normalize_ancestor_sprite_sheets import remove_connected_checkerboard

ROOT = Path(__file__).resolve().parents[1]

def components(image):
    width, height = image.size
    alpha = image.getchannel('A').tobytes()
    seen = bytearray(width * height)
    result = []
    for start, value in enumerate(alpha):
        if value <= 32 or seen[start]:
            continue
        seen[start] = 1
        queue = deque([start])
        pixels = []
        while queue:
            index = queue.popleft()
            pixels.append(index)
            x, y = index % width, index // width
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < width and 0 <= ny < height:
                        nxt = ny * width + nx
                        if not seen[nxt] and alpha[nxt] > 32:
                            seen[nxt] = 1
                            queue.append(nxt)
        if len(pixels) > 300:
            xs = [i % width for i in pixels]
            ys = [i // width for i in pixels]
            result.append((min(xs), min(ys), max(xs)+1, max(ys)+1, pixels))
    return sorted(result)

def build():
    image = remove_connected_checkerboard(Image.open(ROOT / 'img/vfx_ancestor/ancestor_iron_warlord_swing_raw_v3.png'))
    parts = components(image)
    assert len(parts) == 8, 'Expected eight complete poses; never slice a merged figure'
    # Shared scale preserves the calibrated 248px standing body span (.31 * 800).
    scale = 248 / 250
    cell_w, cell_h = 512, 800
    # Authored pelvis/stance centers and boot baselines in the uncut source.
    centers = [175, 505, 750, 960, 1175, 1395, 1635, 1965]
    feet = [570, 568, 564, 569, 566, 566, 565, 566]
    sheet = Image.new('RGBA', (cell_w * 8, cell_h))
    frames = []
    for frame, (left, top, right, bottom, indices) in enumerate(parts):
        mask = Image.new('L', image.size)
        mask_pixels = mask.load()
        for index in indices:
            mask_pixels[index % image.width, index // image.width] = 255
        # Include antialiased edges; never clip at an assumed cell boundary.
        mask = mask.filter(ImageFilter.MaxFilter(3))
        isolated = image.copy()
        from PIL import ImageChops
        isolated.putalpha(ImageChops.multiply(image.getchannel('A'), mask))
        bounds = isolated.getbbox()
        assert bounds is not None
        crop = isolated.crop(bounds)
        resized = crop.resize((round(crop.width * scale), round(crop.height * scale)), Image.Resampling.LANCZOS)
        x = round(cell_w / 2 + (bounds[0] - centers[frame]) * scale)
        y = round(590.4 + (bounds[1] - feet[frame]) * scale)
        assert x >= 32 and x + resized.width <= cell_w - 32, (frame, 'blade exceeds safe cell')
        assert y >= 32 and y + resized.height <= cell_h - 32, (frame, 'vertical clipping')
        canvas = Image.new('RGBA', (cell_w, cell_h))
        canvas.alpha_composite(resized, (x, y))
        sheet.alpha_composite(canvas, (frame * cell_w, 0))
        frames.append(canvas)
        print(f'frame={frame} full_source={bounds} pixels={len(indices)} destination={(x,y,resized.width,resized.height)}')
    output = ROOT / 'img/vfx_ancestor/ancestor_iron_warlord_swing_v4.png'
    sheet.save(output)
    preview = []
    for frame in frames:
        bg = Image.new('RGBA', frame.size, '#292929')
        bg.alpha_composite(frame)
        preview.append(bg.convert('RGB'))
    # Same timing as _ancestorSwingFrame and .026 decay; diagnostic preview only.
    preview[0].save(ROOT / 'captures/ancestor_swing_v4.gif', save_all=True, append_images=preview[1:], duration=[80,90,120,90,60,50,80,80], loop=0)
    print(output)

if __name__ == '__main__':
    build()
