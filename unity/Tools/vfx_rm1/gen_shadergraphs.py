#!/usr/bin/env python3
"""Generate RM-1 VFX Shader Graph assets from the shipped Particle Unlit template.

Source: com.unity.shadergraph GraphTemplates/Cross Pipeline/0_Particle Unlit.shadergraph
Usage: python gen_shadergraphs.py <PackageCache shadergraph dir> <output dir>
"""
import json, sys, os

def load_multi(path):
    s = open(path, encoding='utf-8').read()
    dec = json.JSONDecoder(); i = 0; out = []
    while i < len(s):
        while i < len(s) and s[i].isspace(): i += 1
        if i >= len(s): break
        o, j = dec.raw_decode(s, i); out.append(o); i = j
    return out

def dump_multi(objs, path):
    # Shader Graph multi-JSON: pretty-printed objects separated by a blank line.
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n\n'.join(json.dumps(o, indent=4) for o in objs) + '\n')

def urp_target(objs):
    return next(o for o in objs if o['m_Type'].endswith('.UniversalTarget'))

def make_additive_flipbook(objs):
    t = urp_target(objs)
    t.update({'m_SurfaceType': 1, 'm_AlphaMode': 2, 'm_ZWriteControl': 2, 'm_SupportVFX': True, 'm_RenderFace': 0})
    # m_AlphaMode: 0 Alpha, 1 Premultiply, 2 Additive, 3 Multiply
    return objs

GRAPHS = {'SG_VfxAdditiveFlipbook': make_additive_flipbook}

if __name__ == '__main__':
    src_dir, out_dir = sys.argv[1], sys.argv[2]
    tpl = os.path.join(src_dir, 'GraphTemplates', 'Cross Pipeline', '0_Particle Unlit.shadergraph')
    os.makedirs(out_dir, exist_ok=True)
    for name, fn in GRAPHS.items():
        objs = fn(load_multi(tpl))
        dump_multi(objs, os.path.join(out_dir, name + '.shadergraph'))
        print('wrote', name)
