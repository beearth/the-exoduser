"""Extract the exact PBR images embedded in Meshy's rigged Dark Druid GLB.

Usage: python extract_druid_textures.py <rigged_character_glb.glb> <Source folder>
The GLB is retained in I: storage; Unity receives only these images and FBXs.
"""

import json
import pathlib
import struct
import sys


def main(source: pathlib.Path, destination: pathlib.Path) -> None:
    data = source.read_bytes()
    if data[:4] != b"glTF" or struct.unpack_from("<I", data, 4)[0] != 2:
        raise ValueError("expected GLB v2")
    json_length, json_type = struct.unpack_from("<I4s", data, 12)
    if json_type != b"JSON":
        raise ValueError("missing JSON chunk")
    model = json.loads(data[20 : 20 + json_length])
    binary_start = (20 + json_length + 3) & ~3
    binary_length, binary_type = struct.unpack_from("<I4s", data, binary_start)
    if binary_type != b"BIN\x00":
        raise ValueError("missing BIN chunk")
    binary_start += 8
    destination.mkdir(parents=True, exist_ok=True)
    names = {"normal": "Druid_Normal.png", "Image_0": "Druid_BaseColor.jpg", "Image_1": "Druid_MetalRough.jpg"}
    if set(image.get("name") for image in model["images"]) != set(names):
        raise ValueError("unexpected image set; inspect source before import")
    for image in model["images"]:
        view = model["bufferViews"][image["bufferView"]]
        start = binary_start + view.get("byteOffset", 0)
        end = start + view["byteLength"]
        if end > binary_start + binary_length:
            raise ValueError("image outside BIN chunk")
        target = destination / names[image["name"]]
        target.write_bytes(data[start:end])
        print(f"{target}: {end-start} bytes")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    main(pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]))
