"""Bake a six-second warrior idle from the existing clip; no runtime deformation.

Run with .venv/Scripts/python.exe tools/build_warrior_idle_motion.py.
Requires Pillow, numpy and imageio-ffmpeg. Original assets are read-only.
"""
from pathlib import Path
import math
import subprocess
import numpy as np
from PIL import Image
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets/charselect/idle_warrior.mp4'
OUTPUT = ROOT / 'assets/charselect/idle_warrior_dynamic.mp4'
POSTER = ROOT / 'assets/charselect/poster_idle_warrior_dynamic.jpg'
WIDTH, HEIGHT, FPS, SECONDS, CELL = 1280, 720, 30, 6, 24


def smooth(a, b, value):
    t = np.clip((value-a)/(b-a), 0, 1)
    return t*t*(3-2*t)


def mesh_at(seconds):
    """Inverse mesh: feet and blade stay planted; motion grows along the cape."""
    boxes = [(x, y, min(x+CELL, WIDTH), min(y+CELL, HEIGHT))
             for y in range(0, HEIGHT, CELL) for x in range(0, WIDTH, CELL)]
    points = np.array([[(x0,y0),(x0,y1),(x1,y1),(x1,y0)]
                       for x0,y0,x1,y1 in boxes], dtype=float)
    x, y = points[:,:,0], points[:,:,1]
    phase = math.tau*seconds/SECONDS
    # Localised breathing/weight shift; the lower greaves and sword remain fixed.
    body = np.exp(-((x-510)/205)**4-((y-300)/245)**4)
    planted = 1-smooth(470,660,y)
    dx = 5.5*math.sin(phase)*body*planted
    dy = -6.0*math.sin(phase*2)*body*planted
    # Soft diagonal cape envelope avoids moving the stone columns at the sides.
    cape = (smooth(550,790,x)*(1-smooth(1010,1160,x))
            *smooth(155,255,y)*(1-smooth(520,655,y)))
    lag = (x-580)/105
    wave = np.sin(phase*2-lag)-np.sin(-lag)
    ripple = np.sin(phase*4-lag*1.5)-np.sin(-lag*1.5)
    dx += cape*(7.0*wave+2.0*ripple)
    dy += cape*(15.0*wave+3.0*ripple)
    # A small head movement follows the chest without changing facial features.
    head = np.exp(-((x-503)/64)**4-((y-195)/66)**4)
    dx += 1.5*math.sin(phase)*head
    dy += -1.5*math.sin(phase*2)*head
    points[:,:,0] = x-dx
    points[:,:,1] = y-dy
    return [(box, tuple(p.flatten())) for box,p in zip(boxes,points)]


def main():
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    decoded = subprocess.run([ffmpeg,'-v','error','-i',str(SOURCE),'-vf',f'fps={FPS}',
                              '-f','rawvideo','-pix_fmt','rgb24','pipe:1'],
                             check=True, capture_output=True).stdout
    frame_bytes = WIDTH*HEIGHT*3
    source_frames = [Image.frombytes('RGB',(WIDTH,HEIGHT),decoded[i:i+frame_bytes])
                     for i in range(0,len(decoded),frame_bytes)]
    encoder = subprocess.Popen([ffmpeg,'-y','-v','error','-f','rawvideo',
        '-pix_fmt','rgb24','-s',f'{WIDTH}x{HEIGHT}','-r',str(FPS),'-i','pipe:0',
        '-an','-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p',
        '-movflags','+faststart',str(OUTPUT)], stdin=subprocess.PIPE)
    try:
        for n in range(FPS*SECONDS):
            seconds = n/FPS
            # Smooth forward/back traversal of the subtle original idle closes the loop.
            source_position = (len(source_frames)-1)*(1-math.cos(math.tau*seconds/SECONDS))/2
            lo = int(source_position)
            source = Image.blend(source_frames[lo],source_frames[min(lo+1,len(source_frames)-1)],source_position-lo)
            frame = source.transform((WIDTH,HEIGHT),Image.Transform.MESH,mesh_at(seconds),Image.Resampling.BICUBIC)
            if n == 0:
                frame.save(POSTER, quality=94)
            encoder.stdin.write(frame.tobytes())
        encoder.stdin.close()
        if encoder.wait() != 0:
            raise RuntimeError('MP4 encoding failed')
    finally:
        if encoder.poll() is None:
            encoder.kill()
            encoder.wait()
    print(f'{OUTPUT.relative_to(ROOT)}: {WIDTH}x{HEIGHT}, {FPS}fps, {SECONDS}s, {OUTPUT.stat().st_size} bytes')


if __name__ == '__main__':
    main()
