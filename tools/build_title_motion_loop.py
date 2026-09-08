"""Bake a continuous title-art loop from the approved five-second video.
Run with Python + numpy and FFmpeg; source is kept unchanged.
"""
import argparse
import json
import shutil
import subprocess
from pathlib import Path

import numpy as np

WIDTH, HEIGHT, FPS = 1920, 768, 24
SOURCE_FRAMES, OVERLAP = 120, 30


def build(source, output, ffmpeg):
    if source.resolve() == output.resolve():
        raise ValueError('Keep the approved source video unchanged')
    output.parent.mkdir(parents=True, exist_ok=True)
    decoder = subprocess.Popen(
        [ffmpeg, '-v', 'error', '-i', str(source), '-map', '0:v:0',
         '-vf', f'scale={WIDTH}:{HEIGHT},fps={FPS}', '-f', 'rawvideo',
         '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    encoder = subprocess.Popen(
        [ffmpeg, '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
         '-s', f'{WIDTH}x{HEIGHT}', '-r', str(FPS), '-i', '-', '-an',
         '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
         '-pix_fmt', 'yuv420p', '-g', str(FPS), '-movflags', '+faststart',
         str(output)], stdin=subprocess.PIPE)
    head = []
    count = 0
    try:
        for n in range(SOURCE_FRAMES):
            data = decoder.stdout.read(WIDTH * HEIGHT * 3)
            if len(data) != WIDTH * HEIGHT * 3:
                raise ValueError(f'Expected {SOURCE_FRAMES} source frames; stopped at {n}')
            frame = np.frombuffer(data, np.uint8).reshape(HEIGHT, WIDTH, 3)
            if n < OVERLAP:
                head.append(frame.copy())
                continue
            if n >= SOURCE_FRAMES - OVERLAP:
                k = n - (SOURCE_FRAMES - OVERLAP)
                t = k / (OVERLAP - 1)
                weight = t * t * (3 - 2 * t)
                frame = np.rint(frame.astype(np.float32) * (1 - weight)
                               + head[k].astype(np.float32) * weight).astype(np.uint8)
            encoder.stdin.write(frame.tobytes())
            count += 1
        if decoder.stdout.read(1):
            raise ValueError('Source must contain exactly 120 frames')
    finally:
        decoder.stdout.close()
        encoder.stdin.close()
        decoder.wait()
        encoder.wait()
    if decoder.returncode or encoder.returncode:
        raise RuntimeError('FFmpeg failed')
    result = {'source': str(source), 'output': str(output), 'width': WIDTH,
              'height': HEIGHT, 'fps': FPS, 'frames': count,
              'duration': count / FPS, 'overlap_frames': OVERLAP,
              'blend': 'smoothstep t*t*(3-2*t), t=k/29', 'bytes': output.stat().st_size}
    print(json.dumps(result))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--ffmpeg', default=shutil.which('ffmpeg'))
    args = parser.parse_args()
    if not args.ffmpeg:
        parser.error('Pass --ffmpeg with the FFmpeg executable path')
    build(args.source, args.output, args.ffmpeg)
