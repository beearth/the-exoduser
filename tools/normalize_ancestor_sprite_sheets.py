"""Convert image-generation checkerboard strips into equal-cell transparent runtime sheets."""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "img" / "vfx_ancestor"
DEFAULT_FRAME_COUNT = 6
CELL_WIDTH = 384
SHEET_HEIGHT = 800
HORIZONTAL_PAD = 29
VERTICAL_PAD = 40

SHEETS = (
    ("ancestor_iron_warlord_plant_raw_v2.png", "ancestor_iron_warlord_plant_v2.png", 6, False),
    ("ancestor_iron_warlord_walk_raw_v2.png", "ancestor_iron_warlord_walk_v2.png", 6, False),
    ("ancestor_iron_warlord_swing_raw_v2.png", "ancestor_iron_warlord_swing_v2.png", 6, False),
    # GPT Image can let adjacent capes/swords cross an implied panel edge. v3 keeps one primary figure per cell.
    ("ancestor_iron_warlord_swing_raw_v3.png", "ancestor_iron_warlord_swing_v3.png", 8, True),
)


def is_baked_checker_pixel(red: int, green: int, blue: int) -> bool:
    """Generated checkerboards are bright near-neutral pixels; armor is not."""
    return min(red, green, blue) >= 218 and max(red, green, blue) - min(red, green, blue) <= 12


def remove_connected_checkerboard(frame: Image.Image) -> Image.Image:
    image = frame.convert("RGBA")
    width, height = image.size
    pixels = image.load()
    background = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def enqueue(x: int, y: int) -> None:
        index = y * width + x
        if background[index]:
            return
        red, green, blue, _ = pixels[x, y]
        if not is_baked_checker_pixel(red, green, blue):
            return
        background[index] = 1
        queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(1, height - 1):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height:
                enqueue(nx, ny)

    for y in range(height):
        for x in range(width):
            if background[y * width + x]:
                red, green, blue, _ = pixels[x, y]
                pixels[x, y] = (red, green, blue, 0)
    return image


def discard_isolated_frame_fragments(image: Image.Image, primary_only: bool = False) -> Image.Image:
    """Drop detached spill pixels from adjacent generated cells, never a connected sword/body."""
    width, height = image.size
    pixels = image.load()
    visited = bytearray(width * height)
    components: list[list[int]] = []
    for y in range(height):
        for x in range(width):
            start = y * width + x
            if visited[start] or pixels[x, y][3] <= 32:
                continue
            visited[start] = 1
            queue: deque[int] = deque((start,))
            component: list[int] = []
            while queue:
                index = queue.popleft()
                component.append(index)
                px, py = index % width, index // width
                for nx, ny in ((px - 1, py - 1), (px, py - 1), (px + 1, py - 1), (px - 1, py), (px + 1, py), (px - 1, py + 1), (px, py + 1), (px + 1, py + 1)):
                    if not (0 <= nx < width and 0 <= ny < height):
                        continue
                    neighbor = ny * width + nx
                    if not visited[neighbor] and pixels[nx, ny][3] > 32:
                        visited[neighbor] = 1
                        queue.append(neighbor)
            components.append(component)

    if not components:
        raise RuntimeError("frame lost every foreground component")
    largest = max(map(len, components))
    if primary_only:
        primary = max(components, key=len)
        for component in components:
            if component is primary:
                continue
            for index in component:
                x, y = index % width, index // width
                red, green, blue, _ = pixels[x, y]
                pixels[x, y] = (red, green, blue, 0)
        return image
    minimum = max(450, round(largest * 0.018))
    for component in components:
        if len(component) >= minimum:
            continue
        for index in component:
            x, y = index % width, index // width
            red, green, blue, _ = pixels[x, y]
            pixels[x, y] = (red, green, blue, 0)
    return image


def normalize_sheet(source: Path, output: Path, frame_count: int = DEFAULT_FRAME_COUNT, primary_only: bool = False) -> tuple[int, int, int]:
    raw = Image.open(source).convert("RGBA")
    result = Image.new("RGBA", (CELL_WIDTH * frame_count, SHEET_HEIGHT))
    target_width = CELL_WIDTH - HORIZONTAL_PAD * 2
    target_height = SHEET_HEIGHT - VERTICAL_PAD * 2

    for frame in range(frame_count):
        left = round(frame * raw.width / frame_count)
        right = round((frame + 1) * raw.width / frame_count)
        cleaned = discard_isolated_frame_fragments(
            remove_connected_checkerboard(raw.crop((left, 0, right, raw.height))), primary_only
        )
        scale = min(target_width / cleaned.width, target_height / cleaned.height)
        resized = cleaned.resize(
            (max(1, round(cleaned.width * scale)), max(1, round(cleaned.height * scale))),
            Image.Resampling.LANCZOS,
        )
        x = frame * CELL_WIDTH + (CELL_WIDTH - resized.width) // 2
        y = (SHEET_HEIGHT - resized.height) // 2
        result.alpha_composite(resized, (x, y))

    alpha = result.getchannel("A")
    alpha_count = sum(value > 0 for value in alpha.get_flattened_data())
    if alpha_count <= result.width * result.height // 100:
        raise RuntimeError(f"{source.name}: foreground alpha coverage is implausibly small")
    for frame in range(frame_count):
        frame_alpha = alpha.crop((frame * CELL_WIDTH, 0, (frame + 1) * CELL_WIDTH, SHEET_HEIGHT))
        bounds = frame_alpha.getbbox()
        if not bounds:
            raise RuntimeError(f"{source.name}: frame {frame} lost its foreground")
        if bounds[0] < HORIZONTAL_PAD // 2 or bounds[2] > CELL_WIDTH - HORIZONTAL_PAD // 2:
            raise RuntimeError(f"{source.name}: frame {frame} touches a cell edge")
    result.save(output)
    return result.width, result.height, alpha_count


def main() -> None:
    for source_name, output_name, frame_count, primary_only in SHEETS:
        width, height, alpha_count = normalize_sheet(ASSET_DIR / source_name, ASSET_DIR / output_name, frame_count, primary_only)
        print(f"{output_name}: {width}x{height}, opaque-or-partial pixels={alpha_count}")


if __name__ == "__main__":
    main()
