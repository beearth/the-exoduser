"""Assemble original 1080p ZOOM-01 captures without resizing game pixels."""
import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

folder = Path(sys.argv[1]).expanduser()
zooms = [1.0, 2.0, 2.5, 3.0]
receipt = json.loads((folder / "measurements.json").read_text())
rows = receipt["rows"]
lines = ["| scene | multiplier | player opaque height px | boss opaque height px | visible world width | both fit safe area |", "|---|---:|---:|---:|---:|---|"]
for scene in dict.fromkeys(row["scene"] for row in rows):
    board = Image.new("RGB", (7680, 1140), "#181818")
    draw = ImageDraw.Draw(board)
    font = ImageFont.truetype("/System/Library/Fonts/AppleSDGothicNeo.ttc", 24)
    for i, zoom in enumerate(zooms):
        row = next(r for r in rows if r["scene"] == scene and r["multiplier"] == zoom)
        im = Image.open(folder / f"{scene}_x{zoom}.png")
        assert im.size == (1920, 1080)
        board.paste(im, (1920 * i, 60))
        label = f'x{zoom} | player {row["player_px"]:.1f}px | boss {row["boss_px"]:.1f}px | world width {row["world_width"]:.1f} | {"안전영역 수용" if row["both_fit"] else "둘 다 안 들어옴"}'
        if "IDLE_NOT_COMBAT" in scene: label += " | 실제 전투 실패 / idle 참고만"
        draw.text((1920 * i + 24, 20), label, fill="white", font=font)
        annotated = Image.new("RGB", (1920, 1140), "#181818")
        annotated.paste(im, (0, 60))
        ImageDraw.Draw(annotated).text((24, 20), label, fill="white", font=font)
        annotated.save(folder / f"{scene}_x{zoom}_annotated.png")
        lines.append(f'| {scene} | {zoom} | {row["player_px"]:.1f} | {row["boss_px"]:.1f} | {row["world_width"]:.1f} | {row["both_fit"]} |')
    board.save(folder / f"{scene}_comparison.png")
(folder / "measurements.md").write_text("\n".join(lines) + "\n")
