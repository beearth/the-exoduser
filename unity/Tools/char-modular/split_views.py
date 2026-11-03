"""Split explicitly requested three-view input sheets; no repainting or synthesis."""
import argparse
from pathlib import Path
from PIL import Image

parser = argparse.ArgumentParser()
parser.add_argument("sheet", type=Path)
parser.add_argument("out", type=Path)
args = parser.parse_args()
image = Image.open(args.sheet).convert("RGB")
args.out.mkdir(parents=True, exist_ok=True)
width, height = image.size
for index, name in enumerate(("front", "side", "back")):
    left = round(width * index / 3)
    right = round(width * (index + 1) / 3)
    # Trim panel separators, preserve all object pixels and source scale.
    margin = max(2, round(width / 240))
    image.crop((left + margin, 0, right - margin, height)).save(args.out / (name + ".png"))
print("SPLIT_VIEWS", width, height, "->", args.out)
