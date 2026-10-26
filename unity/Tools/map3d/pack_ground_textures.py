"""PC-MAP3D S2-1: pack the GPT-TEX HANDOFF maps into the Unity Resources folder.

Per ground layer one albedo PNG (sRGB) and one packed data PNG `<name>_nhr.png`:
  R = normal.x, G = normal.y (OpenGL +Y, as exported), B = height, A = roughness.
Decals: RGBA albedo + RGBA normal (alpha = decal alpha). Deterministic; run again to refresh.
Usage: python pack_ground_textures.py <HANDOFF dir> <Resources/Art/map3d dir>
"""
import os, shutil, sys
import numpy as np
from PIL import Image

src, dst = sys.argv[1:3]
os.makedirs(dst, exist_ok=True)

def gray(name):
    return np.array(Image.open(os.path.join(src, name + '.png')).convert('L'))

for layer in ('floor_v01b', 'floor_v02b', 'floor_v03b', 'mass_v01'):
    albedo = os.path.join(src, layer + '.png')
    if not os.path.exists(os.path.join(dst, layer + '.png')):
        shutil.copyfile(albedo, os.path.join(dst, layer + '.png'))
    nrm = np.array(Image.open(os.path.join(src, layer + '_normal.png')).convert('RGB'))
    packed = np.dstack([nrm[:, :, 0], nrm[:, :, 1], gray(layer + '_height'), gray(layer + '_roughness')]).astype(np.uint8)
    Image.fromarray(packed, 'RGBA').save(os.path.join(dst, layer + '_nhr.png'))
    print('packed', layer)

for decal in ('blood', 'bone', 'root'):
    shutil.copyfile(os.path.join(src, 'decal_%s_b.png' % decal), os.path.join(dst, 'decal_%s.png' % decal))
    shutil.copyfile(os.path.join(src, 'decal_%s_b_normal_rgba.png' % decal), os.path.join(dst, 'decal_%s_nrm.png' % decal))
    print('decal', decal)
