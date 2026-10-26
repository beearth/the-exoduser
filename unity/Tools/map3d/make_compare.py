"""PC-MAP3D stage-1 comparison sheets (Pillow only, resample 0 / no scaling of source pixels)."""
import sys, os
from PIL import Image, ImageDraw, ImageFont

godot_dir, cap_dir, out_dir = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out_dir, exist_ok=True)
G = {k: Image.open(os.path.join(godot_dir, k + '.png')).convert('RGB') for k in ('C', 'D')}
U = Image.open(os.path.join(cap_dir, 'unity-world3d.png')).convert('RGB')
UN = Image.open(os.path.join(cap_dir, 'unity-world3d-nomass.png')).convert('RGB')
for im in list(G.values()) + [U, UN]:
    assert im.size == (1920, 1080), im.size
try:
    font = ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 28)
except Exception:
    font = ImageFont.load_default()

def sheet(left, right, left_label, right_label, path):
    band = 48
    out = Image.new('RGB', (3840, 1080 + band), (20, 20, 20))
    out.paste(left, (0, band)); out.paste(right, (1920, band))
    d = ImageDraw.Draw(out)
    d.text((16, 8), left_label, fill=(230, 220, 190), font=font)
    d.text((1936, 8), right_label, fill=(230, 220, 190), font=font)
    out.save(path, quality=92)

sheet(G['D'], U, 'Godot LOOK-001 D (Compatibility, HUD included, only 3 of 51 view masses built)', 'Unity stage 1 (Built-in, lit key/fill/ambient, 292 masses, no shadow/fog/glow/grade)', os.path.join(out_dir, 'map3d_s1_vs_godot_D.jpg'))
sheet(G['D'], UN, 'Godot LOOK-001 D (Compatibility, HUD included)', 'Unity stage 1 without masses (like-for-like with the Godot capture)', os.path.join(out_dir, 'map3d_s1_vs_godot_D_nomass.jpg'))
sheet(G['C'], UN, 'Godot LOOK-001 C (Forward+, reference target)', 'Unity stage 1 without masses', os.path.join(out_dir, 'map3d_s1_vs_godot_C.jpg'))

boxes = {'player-contact': (800, 440, 1120, 696), 'living-tree': (160, 320, 544, 704), 'skin-ground': (1120, 560, 1504, 816)}
for name, box in boxes.items():
    a, b, c = G['D'].crop(box), UN.crop(box), U.crop(box)
    w, h = a.size
    strip = Image.new('RGB', (w * 3 + 20, h), (255, 0, 255))
    strip.paste(a, (0, 0)); strip.paste(b, (w + 10, 0)); strip.paste(c, (2 * w + 20, 0))
    strip.save(os.path.join(out_dir, 'crop_' + name + '_godotD_unityNoMass_unity.png'))
    print(name, box, strip.size)
print('done')
