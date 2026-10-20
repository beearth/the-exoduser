"""Finish existing approved-direction art; no generation or repainting."""
import hashlib
import json
from pathlib import Path

import numpy as np
from PIL import Image
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
SPECS = [
    ("hellgunner", "output/steam_store_remaster_20261020/hellgunner_sniper_revolver_remaster.png", (530, 170, 1152, 792)),
    ("transmuter", "output/steam_store_remaster_20261020/transmuter_bow_candidate.png", (530, 265, 1152, 887)),
    ("spearmage", "output/charselect_remaster_20261019/spearmage_c3_dress.png", (980, 80, 1744, 844)),
]


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def finish():
    session = new_session("u2net", providers=["CPUExecutionProvider"])
    receipt = {"provider": "existing art only", "new_generations": 0, "generation_cost": 0,
               "method": "local rembg u2net CPU alpha matting + source-white matte cleanup; no repaint", "assets": []}
    for hero, source, crop in SPECS:
        source_path = ROOT / source
        image = Image.open(source_path).convert("RGB")
        result = remove(image, session=session, alpha_matting=True,
                        alpha_matting_foreground_threshold=240,
                        alpha_matting_background_threshold=10,
                        alpha_matting_erode_size=3)
        # Keep pure blue/violet energy, including fine bowstrings, even if U2Net
        # classifies them as background. No new pixels or weapon redesign.
        raw = np.asarray(image).astype(np.int16)
        rgba = np.array(result)
        energy = (raw[:, :, 2] > 130) & ((raw[:, :, 2] - raw[:, :, 1]) > 45) & ((raw[:, :, 2] - raw[:, :, 0]) > 25)
        if hero != "hellgunner":
            rgba[:, :, 3][energy] = np.maximum(rgba[:, :, 3][energy], 255)
        # U2Net treats enclosed gaps between hair/rune rings as foreground.
        # Source neutral whites are the known backdrop. Fade only minRGB
        # 230..248 with chroma <25, retaining colored energy and silver mids.
        minimum = raw.min(axis=2)
        neutral = raw.max(axis=2) - minimum < 25
        if hero == "transmuter":
            # The bright center of the blue gauntlet core is subject, not matte.
            yy, xx = np.ogrid[:image.height, :image.width]
            neutral[((xx - 318) ** 2 + (yy - 536) ** 2) <= 42 ** 2] = False
        white_alpha = np.clip((248 - minimum) * (255 / 18), 0, 255).astype(np.uint8)
        rgba[:, :, 3][neutral] = np.minimum(rgba[:, :, 3][neutral], white_alpha[neutral])
        result = Image.fromarray(rgba)
        result.save(OUT / f"{hero}_alpha_native.png")
        bounds = result.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
        trimmed = result.crop(bounds)
        scale = 1856 / max(trimmed.size)
        content = trimmed.resize((round(trimmed.width * scale), round(trimmed.height * scale)), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (1536, 2048))
        canvas.alpha_composite(content, ((canvas.width - content.width) // 2, (canvas.height - content.height) // 2))
        cut = OUT / f"{hero}_cut.png"
        canvas.save(cut)
        portrait = OUT / f"portrait_{hero}.png"
        result.crop(crop).resize((1024, 1024), Image.Resampling.LANCZOS).save(portrait)
        for background, color in [("dark", (18, 18, 23, 255)), ("light", (225, 222, 214, 255))]:
            preview = Image.new("RGBA", canvas.size, color)
            preview.alpha_composite(canvas)
            preview.convert("RGB").save(OUT / f"{hero}_{background}.jpg", quality=94)
        receipt["assets"].append({"id": hero, "source": source, "source_sha256": sha(source_path),
                                  "source_size": list(image.size), "native_bounds": list(bounds),
                                  "portrait_crop": list(crop), "cut_size": [1536, 2048],
                                  "portrait_size": [1024, 1024], "cut_sha256": sha(cut),
                                  "portrait_sha256": sha(portrait)})
        print(f"Finished {hero}: {bounds}", flush=True)
    (OUT / "art-receipt.json").write_text(json.dumps(receipt, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    finish()
