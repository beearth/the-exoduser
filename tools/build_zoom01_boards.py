"""Assemble original 1080p ZOOM-01 captures without resizing game pixels."""
import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw

folder = Path(sys.argv[1]).expanduser()
zooms = [1.0, 2.0, 2.5, 3.0]
rows = [row for zoom in zooms for row in json.loads((folder / f"measurements_x{zoom}.json").read_text())]
lines = ["| scene | multiplier | player opaque height px | boss opaque height px | visible world width |", "|---|---:|---:|---:|---:|"]
for scene in ["field_start", "boss_entry", "boss_melee"]:
    board = Image.new("RGB", (7680, 1140), "#181818")
    draw = ImageDraw.Draw(board)
    for i, zoom in enumerate(zooms):
        row = next(r for r in rows if r["scene"] == scene and r["multiplier"] == zoom)
        im = Image.open(folder / f"{scene}_x{zoom}.png")
        assert im.size == (1920, 1080)
        board.paste(im, (1920 * i, 60))
        label = f'x{zoom} | player {row["player_px"]:.1f}px | boss {row["boss_px"]:.1f}px | world width {row["world_width"]:.1f}'
        draw.text((1920 * i + 24, 20), label, fill="white")
        lines.append(f'| {scene} | {zoom} | {row["player_px"]:.1f} | {row["boss_px"]:.1f} | {row["world_width"]:.1f} |')
    board.save(folder / f"{scene}_comparison.png")
(folder / "measurements.md").write_text("\n".join(lines) + "\n")
