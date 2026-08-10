"""Build transparent, tightly framed world-drop cutouts from physical item skins."""

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "output" / "imagegen" / "item-skins"
OUTPUT_DIR = ROOT / "output" / "imagegen" / "item-cutouts"
OUTPUT_SIZE = 256
CONTENT_SIZE = 224
BLACK_CUTOFF = 20
BLACK_FADE_END = 70


def remove_dark_background(image: Image.Image) -> Image.Image:
    result = image.convert("RGBA")
    pixels = result.load()
    for y in range(result.height):
        for x in range(result.width):
            red, green, blue, alpha = pixels[x, y]
            light = max(red, green, blue)
            if light <= BLACK_CUTOFF:
                pixels[x, y] = (red, green, blue, 0)
            elif light < BLACK_FADE_END:
                pixels[x, y] = (
                    red,
                    green,
                    blue,
                    round(alpha * (light - BLACK_CUTOFF) / (BLACK_FADE_END - BLACK_CUTOFF)),
                )
    return result


def frame_icon(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A")
    bounds = alpha.getbbox()
    if not bounds:
        raise ValueError("No foreground pixels found")
    left, top, right, bottom = bounds
    pad = max(4, round(max(right - left, bottom - top) * 0.06))
    crop = image.crop((max(0, left - pad), max(0, top - pad), min(image.width, right + pad), min(image.height, bottom + pad)))
    scale = min(CONTENT_SIZE / crop.width, CONTENT_SIZE / crop.height)
    size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
    crop = crop.resize(size, Image.Resampling.LANCZOS)
    framed = Image.new("RGBA", (OUTPUT_SIZE, OUTPUT_SIZE))
    framed.alpha_composite(crop, ((OUTPUT_SIZE - size[0]) // 2, (OUTPUT_SIZE - size[1]) // 2))
    return framed


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    sources = sorted(SOURCE_DIR.glob("*_phys.png"))
    if not sources:
        raise FileNotFoundError(f"No physical skins found in {SOURCE_DIR}")
    for source in sources:
        with Image.open(source) as image:
            cutout = frame_icon(remove_dark_background(image))
        cutout.save(OUTPUT_DIR / source.name)
    print(f"Built {len(sources)} transparent item cutouts in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
