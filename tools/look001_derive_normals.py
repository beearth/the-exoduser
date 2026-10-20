#!/usr/bin/env python3
"""LOOK-001: derive smooth normal PNGs from unchanged original sprite PNGs.

Requires the approved task environment: NumPy 1.26.4 and Pillow 10.4.0.
No image-generation service, RNG, geometry extraction, resize, or source write.
The height field is a material-like estimate from source color, NOT measured
geometry. Alpha-normalized Gaussian filtering avoids transparent RGB halos;
Sobel gradients produce an OpenGL-style tangent-space normal by default.

Example (from the worktree root):
  <task-venv>/bin/python tools/look001_derive_normals.py --project godot \
    --sources /absolute/path/visible_sources.json \
    --output assets/derived/look001/ --strength 2.0 --blur-radius 2.0

--sources accepts a JSON file, an inline JSON array, or multiple texture paths.
JSON: ["res://assets/example.png", {"path":"res://assets/atlas.png",
       "frame_size":[256,256]}]. Optional frame_size filters atlas cells
independently; cells must exactly tile the source, with no resampling.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import math
import os
from pathlib import Path
import re
import shlex
import sys
import tempfile
import zlib

ALGORITHM = 'look001-alpha-aware-luma-gaussian-sobel-v1'
NUMPY_VERSION = '1.26.4'
PILLOW_VERSION = '10.4.0'
LUMA = (0.2126, 0.7152, 0.0722)
ALPHA_EPSILON = 1.0e-6
GRADIENT_EPSILON = 1.0e-6
np = None
Image = None


def digest(data):
    return hashlib.sha256(data).hexdigest()


def within(path, parent):
    try:
        path.relative_to(parent)
        return True
    except ValueError:
        return False


def project_path(raw, project):
    raw = str(raw)
    if raw.startswith('res://'):
        raw = raw[6:]
    path = Path(raw)
    path = (path if path.is_absolute() else project / path).resolve()
    if not within(path, project):
        raise ValueError('프로젝트 밖 경로는 허용하지 않음: ' + str(path))
    return path


def res_path(path, project):
    return 'res://' + path.relative_to(project).as_posix()


def parse_sources(arguments, project):
    if len(arguments) == 1:
        raw = arguments[0]
        if raw.lstrip().startswith(('[', '{')):
            items = json.loads(raw)
        elif Path(raw).suffix.lower() == '.json':
            items = json.loads(Path(raw).read_text(encoding='utf-8'))
        else:
            items = arguments
    else:
        items = arguments
    if isinstance(items, dict):
        items = items.get('sources', items.get('textures'))
    if not isinstance(items, list) or not items:
        raise ValueError('--sources는 비어 있지 않은 텍스처 경로 배열이어야 함')
    unique = {}
    for item in items:
        if isinstance(item, str):
            raw, frame = item, None
        elif isinstance(item, dict):
            raw = item.get('path', item.get('source'))
            frame = item.get('frame_size')
            if not isinstance(raw, str):
                raise ValueError('source 항목에는 문자열 path/source가 필요함')
        else:
            raise ValueError('source 항목은 경로 문자열 또는 path 객체여야 함')
        if frame is not None:
            if not isinstance(frame, list) or len(frame) != 2 or any(
                    type(size) is not int or size <= 0 for size in frame):
                raise ValueError('frame_size는 양의 정수 [width,height]여야 함')
        path = project_path(raw, project)
        if not path.is_file() or path.suffix.lower() != '.png':
            raise ValueError('존재하는 원본 PNG만 입력 가능: ' + str(path))
        canonical = res_path(path, project)
        if canonical in unique and unique[canonical]['frame_size'] != frame:
            raise ValueError('같은 텍스처에 서로 다른 frame_size 지정: ' + canonical)
        unique[canonical] = {'source': canonical, 'path': path, 'frame_size': frame}
    return [unique[key] for key in sorted(unique, key=lambda value: value.encode('utf-8'))]


def normal_filename(source):
    stem = Path(source[6:]).stem
    safe = re.sub(r'[^a-zA-Z0-9_-]+', '-', stem).strip('-_').lower()[:64] or 'texture'
    return safe + '-' + digest(source.encode('utf-8'))[:12] + '.normal.png'


def gaussian_kernel(sigma):
    if sigma == 0:
        return np.array([1.0], dtype=np.float32)
    radius = int(math.ceil(3.0 * sigma))
    offsets = np.arange(-radius, radius + 1, dtype=np.float64)
    weights = np.exp(-(offsets * offsets) / (2.0 * sigma * sigma))
    return (weights / weights.sum()).astype(np.float32)


def gaussian(plane, kernel):
    """Separable Gaussian, fixed accumulation order, clamped source edges."""
    radius = len(kernel) // 2
    if radius == 0:
        return plane.copy()
    height, width = plane.shape
    horizontal = np.pad(plane, ((0, 0), (radius, radius)), mode='edge')
    result = np.zeros_like(plane, dtype=np.float32)
    for offset, weight in enumerate(kernel):
        result += horizontal[:, offset:offset + width] * weight
    vertical = np.pad(result, ((radius, radius), (0, 0)), mode='edge')
    result = np.zeros_like(plane, dtype=np.float32)
    for offset, weight in enumerate(kernel):
        result += vertical[offset:offset + height, :] * weight
    return result


def derive_cell(rgba, strength, kernel, green_channel):
    rgb = rgba[:, :, :3].astype(np.float32) / np.float32(255.0)
    alpha = rgba[:, :, 3].astype(np.float32) / np.float32(255.0)
    luma = rgb[:, :, 0] * LUMA[0] + rgb[:, :, 1] * LUMA[1] + rgb[:, :, 2] * LUMA[2]
    # Normalized convolution suppresses hidden RGB in transparent pixels and
    # avoids interpreting the cutout's transition to transparent black as depth.
    weighted = gaussian(luma * alpha, kernel)
    blurred_alpha = gaussian(alpha, kernel)
    height = np.zeros_like(weighted)
    np.divide(weighted, blurred_alpha, out=height, where=blurred_alpha > ALPHA_EPSILON)
    p = np.pad(height, ((1, 1), (1, 1)), mode='edge')
    # Sobel /8: image coordinates, +x right and +y down; the surface z faces out.
    dx = (p[:-2, 2:] + np.float32(2.0) * p[1:-1, 2:] + p[2:, 2:]
          - p[:-2, :-2] - np.float32(2.0) * p[1:-1, :-2] - p[2:, :-2]) / np.float32(8.0)
    dy = (p[2:, :-2] + np.float32(2.0) * p[2:, 1:-1] + p[2:, 2:]
          - p[:-2, :-2] - np.float32(2.0) * p[:-2, 1:-1] - p[:-2, 2:]) / np.float32(8.0)
    # Suppress roundoff around a mathematically flat surface before 8-bit
    # half-way rounding; this avoids isolated 127/128 speckles in flat regions.
    dx[np.abs(dx) < GRADIENT_EPSILON] = 0.0
    dy[np.abs(dy) < GRADIENT_EPSILON] = 0.0
    nx = -np.float32(strength) * dx
    # OpenGL tangent +Y is up, opposite the PNG image row direction.
    ny = np.float32(strength if green_channel == 'opengl' else -strength) * dy
    inverse_length = np.float32(1.0) / np.sqrt(nx * nx + ny * ny + np.float32(1.0))
    normal = np.stack((nx * inverse_length, ny * inverse_length, inverse_length), axis=-1)
    encoded = np.floor(np.clip((normal + np.float32(1.0)) * np.float32(127.5), 0.0, 255.0)
                       + np.float32(0.5)).astype(np.uint8)
    encoded[rgba[:, :, 3] == 0] = (128, 128, 255)
    return encoded


def derive_image(rgba, strength, kernel, green_channel, frame_size):
    height, width, _ = rgba.shape
    frame_width, frame_height = frame_size or (width, height)
    if width % frame_width or height % frame_height:
        raise ValueError('frame_size가 원본 PNG 규격을 나머지 없이 나눠야 함')
    result = np.empty((height, width, 3), dtype=np.uint8)
    for y in range(0, height, frame_height):
        for x in range(0, width, frame_width):
            result[y:y + frame_height, x:x + frame_width] = derive_cell(
                rgba[y:y + frame_height, x:x + frame_width], strength, kernel, green_channel)
    return result


def png_bytes(pixels, mode):
    output = io.BytesIO()
    Image.fromarray(pixels, mode=mode).save(output, format='PNG', optimize=False,
                                          compress_level=9, pnginfo=None)
    return output.getvalue()


def write_bytes(path, data):
    """Atomic replacement of this derivative only; byte-identical reruns don't write."""
    if path.is_symlink():
        raise ValueError('출력 파일 symlink는 허용하지 않음: ' + str(path))
    if path.exists() and path.read_bytes() == data:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(prefix='.look001-', suffix='.tmp', dir=path.parent,
                                         delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(data)
        os.replace(str(temporary), str(path))
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink()


def run(args):
    global np, Image
    try:
        import numpy as np_module
        from PIL import Image as image_module
        from PIL import __version__ as pillow_version
    except ImportError as exc:
        raise RuntimeError('BLOCKED: 작업 전용 환경에 NumPy1.26.4/Pillow10.4.0 필요. 자동 설치하지 않음: ' + str(exc))
    if np_module.__version__ != NUMPY_VERSION or pillow_version != PILLOW_VERSION:
        raise RuntimeError('BLOCKED: 재현성 기준 의존성 버전 불일치(numpy=' + np_module.__version__
                           + ', Pillow=' + pillow_version + ')')
    np, Image = np_module, image_module
    project = Path(args.project).resolve()
    if not (project / 'project.godot').is_file():
        raise ValueError('--project는 project.godot가 있는 Godot 프로젝트 폴더여야 함')
    output = project_path(args.output, project)
    derived_root = (project / 'assets/derived').resolve()
    if not within(derived_root, project) or not within(output, derived_root):
        raise ValueError('--output은 프로젝트 assets/derived/ 안이어야 함')
    sources = parse_sources(args.sources, project)
    for source in sources:
        if within(source['path'], derived_root):
            raise ValueError('원본만 입력 가능; 파생 폴더는 입력 금지: ' + source['source'])
    if not math.isfinite(args.strength) or not 0.0 <= args.strength <= 64.0:
        raise ValueError('--strength 범위는 0..64')
    if not math.isfinite(args.blur_radius) or not 0.0 <= args.blur_radius <= 32.0:
        raise ValueError('--blur-radius 범위는 0..32 (Gaussian sigma, 원본 픽셀 단위)')
    kernel = gaussian_kernel(args.blur_radius)
    entries = []
    for source in sources:
        original = source['path'].read_bytes()
        with Image.open(io.BytesIO(original)) as image:
            if image.format != 'PNG' or getattr(image, 'n_frames', 1) != 1:
                raise ValueError('단일 프레임 원본 PNG만 지원: ' + source['source'])
            source_mode = image.mode
            # Preserve alpha for RGBA/LA and indexed/RGB PNG tRNS transparency.
            has_alpha = 'A' in image.getbands() or 'transparency' in image.info
            source_bit_depth = original[24] # PNG IHDR bit depth, after verified PNG decode.
            if source_bit_depth == 16 and has_alpha:
                raise ValueError('16-bit 알파의 묵시적8-bit 축소 금지: ' + source['source'])
            width, height = image.size
            rgba = np.array(image.convert('RGBA'), dtype=np.uint8)
        normal = derive_image(rgba, args.strength, kernel, args.green_channel, source['frame_size'])
        normal_mode = 'RGBA' if has_alpha else 'RGB'
        if has_alpha:
            normal = np.concatenate((normal, rgba[:, :, 3:4]), axis=2)
        data = png_bytes(normal, normal_mode)
        if source['path'].read_bytes() != original:
            raise RuntimeError('BLOCKED: 처리 도중 원본이 외부에서 변경됨: ' + source['source'])
        target = output / normal_filename(source['source'])
        write_bytes(target, data)
        entries.append({
            'source': source['source'], 'source_sha256': digest(original),
            'normal': res_path(target, project), 'normal_sha256': digest(data),
            'width': width, 'height': height, 'source_mode': source_mode,
            'source_bit_depth': source_bit_depth, 'normal_bit_depth': 8,
            'normal_mode': normal_mode, 'source_has_alpha': has_alpha,
            'alpha_preserved': bool(np.array_equal(normal[:, :, 3], rgba[:, :, 3])) if has_alpha else True,
            'frame_size': source['frame_size'],
        })
    # A final source recheck also covers earlier inputs while later ones processed.
    for source, entry in zip(sources, entries):
        if digest(source['path'].read_bytes()) != entry['source_sha256']:
            raise RuntimeError('BLOCKED: manifest 확정 전 원본 해시 변경: ' + source['source'])
    canonical_specs = [entry['source'] if entry['frame_size'] is None else
                       {'path': entry['source'], 'frame_size': entry['frame_size']} for entry in entries]
    output_relative = output.relative_to(project).as_posix() + '/'
    reproduction_args = [
        'tools/look001_derive_normals.py', '--project', 'godot', '--sources',
        json.dumps(canonical_specs, ensure_ascii=False, sort_keys=True, separators=(',', ':')),
        '--output', output_relative, '--strength', format(args.strength, '.12g'),
        '--blur-radius', format(args.blur_radius, '.12g'), '--green-channel', args.green_channel,
    ]
    manifest = {
        'version': 1, 'algorithm': ALGORITHM,
        'height_interpretation': 'source-color material-like estimate; NOT measured geometry, collision, physical height or depth',
        'source_bytes_unchanged': True, 'resize_or_crop': False,
        'parameters': {
            'strength': args.strength, 'blur_radius': args.blur_radius,
            'gaussian_sigma_pixels': args.blur_radius, 'gaussian_kernel_radius': len(kernel) // 2,
            'gaussian_truncation_sigma': 3.0, 'luma_coefficients': list(LUMA),
            'height_color_space': 'decoded source RGB code values /255 (no invented geometry)',
            'alpha_method': 'Gaussian(alpha*luma)/Gaussian(alpha); source alpha retained; transparent RGB neutral normal',
            'alpha_epsilon': ALPHA_EPSILON, 'gradient': 'Sobel/8 after Gaussian; clamped cell edges',
            'gradient_roundoff_epsilon': GRADIENT_EPSILON,
            'normal_formula': 'normalize(-strength*dH/dx, +strength*dH/dImageY, 1)' if args.green_channel == 'opengl'
                              else 'normalize(-strength*dH/dx, -strength*dH/dImageY, 1)',
            'green_channel': args.green_channel, 'numeric_dtype': 'float32, fixed Gaussian accumulation order',
            'png_compress_level': 9, 'png_optimize': False,
        },
        'tool': {'path': 'tools/look001_derive_normals.py', 'sha256': digest(Path(__file__).read_bytes())},
        'dependencies': {'numpy': np.__version__, 'Pillow': pillow_version, 'zlib': zlib.ZLIB_RUNTIME_VERSION},
        'reproduction': {
            'working_directory': 'worktree root', 'interpreter': 'approved LOOK-001 task venv/bin/python',
            'arguments': reproduction_args,
            'command': '<task-venv>/bin/python ' + ' '.join(shlex.quote(part) for part in reproduction_args),
            'scope': 'same tool/dependency versions; no input order, mtime, wall clock or RNG in generated bytes',
        },
        'mapping': {entry['source']: entry['normal'] for entry in entries},
        'sources': entries,
    }
    manifest_data = (json.dumps(manifest, ensure_ascii=False, sort_keys=True, indent=2) + '\n').encode('utf-8')
    manifest_path = output / 'manifest.json'
    write_bytes(manifest_path, manifest_data)
    print(json.dumps({'manifest': res_path(manifest_path, project), 'manifest_sha256': digest(manifest_data),
                      'sources': len(entries), 'source_bytes_unchanged': True}, ensure_ascii=False, sort_keys=True))


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--project', required=True, help='Godot project folder containing project.godot')
    parser.add_argument('--sources', required=True, nargs='+', help='JSON file, inline JSON list, or PNG texture paths')
    parser.add_argument('--output', default='assets/derived/look001/', help='Output folder strictly under project assets/derived/')
    parser.add_argument('--strength', type=float, default=2.0, help='Gradient strength (default:2.0)')
    parser.add_argument('--blur-radius', type=float, default=2.0, help='Gaussian sigma in source pixels (default:2.0)')
    parser.add_argument('--green-channel', choices=('opengl', 'directx'), default='opengl')
    args = parser.parse_args()
    try:
        run(args)
    except (OSError, ValueError, RuntimeError) as exc:
        print(str(exc), file=sys.stderr)
        return 2
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
