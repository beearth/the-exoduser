"""Prepare the approved Grok shoulder-sword anchor for the lobby (no regeneration)."""
from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'img/vfx_ancestor/ancestor_new_grok_shoulder_anchor_v4.png'
out = ROOT / 'assets/lobby'
raw = np.asarray(Image.open(source).convert('RGB')).astype(np.float32)
excess = raw[:, :, 1] - np.maximum(raw[:, :, 0], raw[:, :, 2])
alpha = np.clip(1 - (excess - 22) / 88, 0, 1)
raw[:, :, 1] = np.minimum(raw[:, :, 1], np.maximum(raw[:, :, 0], raw[:, :, 2]) + 8)
rgba = np.dstack((raw, alpha * 255)).astype(np.uint8)
rgba[alpha < .02] = 0
hero = Image.fromarray(rgba)
bounds = hero.getbbox()
hero = hero.crop((max(0, bounds[0]-32), max(0, bounds[1]-32), min(hero.width, bounds[2]+32), min(hero.height, bounds[3]+32)))
hero.save(out / 'lobby_ancestor_shoulder_v4.png', optimize=True)
# Same anchor, framed around mask, ribs and coffin pauldron for the small demo/fallback card.
portrait = Image.fromarray(rgba).crop((470, 390, 1250, 1170)).resize((512, 512), Image.Resampling.LANCZOS)
background = Image.new('RGBA', portrait.size, '#14161d')
background.alpha_composite(portrait)
background.convert('RGB').save(out / 'lobby_ancestor_portrait_v4.webp', quality=94)
print({'hero_size': hero.size, 'portrait_size': background.size, 'source': str(source.relative_to(ROOT))})
