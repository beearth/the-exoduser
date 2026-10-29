#!/usr/bin/env python3
"""Generate RM-1 VFX Graph assets by patching shipped VFX Graph templates (VFX model classes are internal, so no public authoring API).

Usage: python gen_vfx.py <PackageCache visualeffectgraph dir> <output dir>
Produces: T_SoftCircle.png(+.meta), VFX_CoreTest.vfx
"""
import json, os, re, struct, sys, zlib, math

TEX_GUID = None   # read from the Unity-created T_SoftCircle.png.meta (run once to import, then again to link)

def write_png(path, w, h, rgba):
    def chunk(t, d):
        c = struct.pack('>I', len(d)) + t + d
        return c + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    raw = b''.join(b'\x00' + bytes(rgba[y*w*4:(y+1)*w*4]) for y in range(h))
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')
    open(path, 'wb').write(png)

def soft_circle(path, n=128):
    # Radial falloff; alpha = white * smooth core. No noise, no dots.
    px = bytearray()
    for y in range(n):
        for x in range(n):
            r = math.hypot((x + .5) / n * 2 - 1, (y + .5) / n * 2 - 1)
            a = 0.0 if r >= 1 else (1 - r) ** 0.7
            v = int(round(255 * a))
            px += bytes((255, 255, 255, v))
    write_png(path, n, n, px)

def split_docs(s):
    head, *docs = re.split(r'^(?=--- )', s, flags=re.M)
    return head, docs

def doc_id(d):
    return re.match(r'--- !u!\d+ &(\d+)', d).group(1)

def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def hdr(color, intensity):
    # The project is Linear: VFX Graph gradient colours are used as linear values, so the authored sRGB hex is converted first, then the HDR multiplier is applied.
    return {"r": srgb_to_linear(color[0]) * intensity, "g": srgb_to_linear(color[1]) * intensity, "b": srgb_to_linear(color[2]) * intensity, "a": 1.0}

def gradient_json(color, intensity, alpha_keys, two=False):
    ck = [{"color": hdr(color, intensity), "time": 0.0}] + ([{"color": hdr(color, intensity), "time": 1.0}] if two else [])
    return json.dumps({"colorKeys": ck,
                       "alphaKeys": [{"alpha": a, "time": t} for t, a in alpha_keys], "gradientMode": 0}, separators=(',', ':'))

def curve_json(points):
    frames = []
    for t, v in points:
        frames.append({"time": t, "value": v, "inTangent": 0.0, "outTangent": 0.0, "tangentMode": 0, "leftTangentMode": 0, "rightTangentMode": 0, "broken": False})
    return json.dumps({"frames": frames, "preWrapMode": 8, "postWrapMode": 8, "version": 1}, separators=(',', ':'))

def patch(docs, edits):
    out = []
    for d in docs:
        i = doc_id(d)[-5:]
        for pat, fn in edits.get(i, []):
            d, n = re.subn(pat, fn, d, flags=re.M)
            assert n >= 1, (i, pat)
        out.append(d)
    return out

def core_test(tpl, color, intensity, only=None, two=False, keys=None, count=1, disable=True, life=(0.25, 0.25)):
    head, docs = split_docs(open(tpl, encoding='utf-8').read())
    def setv(v): return lambda m: m.group(1) + str(v)
    def ser(js): return lambda m: m.group(1) + "'" + js.replace("'", "''") + "'"
    keys = keys or [(0.0, 0.35), (0.16, 1.0), (0.4, 0.225), (1.0, 0.0)]    # SPEC U2: peak +2..4 ticks (0.16 x 0.25 s = 2.4 ticks), then 0.225, then 0
    edits = {
        '14704': [(r'(^      m_SerializableObject: )\d+', setv(count))],                             # burst count 1
        '14723': [(r'(^      m_SerializableObject: ).*', setv(life[0]))], '14724': [(r'(^      m_SerializableObject: ).*', setv(life[1]))],   # lifetime 0.25s
        '14793': [(r"(^      m_SerializableObject: )'.*'", ser(gradient_json(color, intensity, keys, two)))],
        '14953': [(r"(^      m_SerializableObject: )'.*'", ser(curve_json([(0.0, 6.0), (0.15, 12.0), (1.0, 13.0)])))],  # world size 0.1 * k
        '14776': [(r'8aafaa78fe944854997fef757ff4ba72', lambda m: TEX_GUID)],
        '14775': [(r'(^  blendMode: )1', setv(0))],                                    # additive
    }
    if only is not None:
        edits = {k: v for k, v in edits.items() if k in only}
    for blk in (('14956', '14912', '14922', '14929') if disable else ()):             # position shape, velocity, gravity, drag off
        edits.setdefault(blk[-5:], []).append((r'(^  m_Disabled: )0', setv(1)))
    for act in (('14974', '14921', '14928', '14931') if disable else ()):            # their _vfx_enabled activation slots -> False
        edits.setdefault(act, []).append((r'(^      m_SerializableObject: )True', setv('False')))
    return head + ''.join(patch(docs, edits))

if __name__ == '__main__':
    pkg, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    soft_circle(os.path.join(out, 'T_SoftCircle.png'))
    meta = os.path.join(out, 'T_SoftCircle.png.meta')
    if os.path.exists(meta):
        TEX_GUID = re.search(r'guid: (\w+)', open(meta, encoding='utf-8').read()).group(1)
    else:
        print('texture meta missing: import in Unity first, then rerun'); sys.exit(2)
    tpl = os.path.join(pkg, 'Editor', 'Templates', 'Simple_Burst.vfx')
    # core flash #fff4d0 (SPEC V2.2) as HDR; intensity chosen against bloom threshold 1.0
    c = (1.0, 0xf4 / 255, 0xd0 / 255)
    open(os.path.join(out, 'VFX_CoreTest.vfx'), 'w', encoding='utf-8', newline='\n').write(core_test(tpl, c, float(sys.argv[3]) if len(sys.argv) > 3 else 4.0))
    print('ok')
