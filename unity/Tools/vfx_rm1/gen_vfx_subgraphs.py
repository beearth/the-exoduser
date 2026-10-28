#!/usr/bin/env python3
"""RM-1 VFX Graph block subgraphs: VFXS_Core, VFXS_Shards, VFXS_Mist (spec v2.1 section 2).

VFX Graph's model classes are internal, so the subgraphs are authored by grafting two shipped blocks ("Set Color over Life" with a gradient, "Set Size over Life"
with a curve, from Templates/Simple_Burst.vfx) into the shipped Templates/DefaultSubgraphBlock.vfxblock and patching their values.

Usage: python gen_vfx_subgraphs.py <PackageCache visualeffectgraph dir> <output dir>
"""
import os, re, sys
from gen_vfx import gradient_json, curve_json, split_docs, doc_id

COLOR_BLOCK, SIZE_BLOCK = '8926484042661614792', '8926484042661614952'


def srgb(h):
    return ((h >> 16 & 255) / 255, (h >> 8 & 255) / 255, (h & 255) / 255)


def graft(burst_docs, block_id, new_base, parent_id):
    """Copy a block doc and its slot docs with fresh ids; returns (docs, new_block_id)."""
    b = burst_docs[block_id]
    slots = re.findall(r'^  - \{fileID: (\d+)\}', b, flags=re.M) + re.findall(r'm_ActivationSlot: \{fileID: (\d+)\}', b)
    ids = [block_id] + list(dict.fromkeys(slots))
    remap = {old: str(new_base + i) for i, old in enumerate(ids)}
    out = []
    for old in ids:
        d = burst_docs[old]
        for o, n in remap.items(): d = d.replace('fileID: ' + o + '}', 'fileID: ' + n + '}').replace('&' + o + '\n', '&' + n + '\n')
        d = re.sub(r'^--- !u!(\d+) &\d+', lambda m: '--- !u!%s &%s' % (m.group(1), remap[old]), d, count=1, flags=re.M)
        if old == block_id: d = re.sub(r'(m_Parent: \{fileID: )\d+', lambda m: m.group(1) + str(parent_id), d, count=1)
        out.append(d)
    return out, remap[block_id], remap


def patch_slot_value(docs, remap, old_slot_id, json_text):
    new = remap[old_slot_id]
    for i, d in enumerate(docs):
        if re.match(r'--- !u!\d+ &%s\n' % new, d):
            d, n = re.subn(r"(^  m_Value:\n    m_Type:.*\n    m_SerializableObject: ).*", lambda m: m.group(1) + "'" + json_text.replace("'", "''") + "'", d, flags=re.M)
            if n == 0: d, n = re.subn(r"(^      m_SerializableObject: ).*", lambda m: m.group(1) + "'" + json_text.replace("'", "''") + "'", d, flags=re.M)
            assert n >= 1, 'slot value line not found in ' + new
            docs[i] = d; return
    raise KeyError(new)


def build(burst_path, tpl_path, name, color_json, size_json):
    _, bdocs = split_docs(open(burst_path, encoding='utf-8').read())
    burst = {doc_id(d): d for d in bdocs}
    head, tdocs = split_docs(open(tpl_path, encoding='utf-8').read())
    out = [d for d in tdocs]
    base = 100
    cdocs, cblock, cmap = graft(burst, COLOR_BLOCK, base, 4)
    patch_slot_value(cdocs, cmap, '8926484042661614793', color_json)
    sdocs, sblock, smap = graft(burst, SIZE_BLOCK, base + 20, 4)
    patch_slot_value(sdocs, smap, '8926484042661614953', size_json)
    res = []
    for d in out:
        i = doc_id(d)
        if i == '4':
            d = d.replace('  m_Children: []', '  m_Children:\n  - {fileID: %s}\n  - {fileID: %s}' % (cblock, sblock), 1)
            d = re.sub(r'm_SuitableContexts: \d+', 'm_SuitableContexts: 8', d)      # Output
        if i in ('1', '2'): d = d.replace('m_Name: Default Subgraph Block', 'm_Name: ' + name)
        res.append(d)
    res += cdocs + sdocs
    return head + ''.join(res)


def main(pkg, out):
    burst = os.path.join(pkg, 'Editor', 'Templates', 'Simple_Burst.vfx')
    tpl = os.path.join(pkg, 'Editor', 'Templates', 'DefaultSubgraphBlock.vfxblock')
    os.makedirs(out, exist_ok=True)
    def grad(rgb, keys, mult=1.0):
        return gradient_json(rgb, mult, keys)      # gen_vfx.hdr converts sRGB -> linear, then applies the HDR multiplier
    from gen_vfx import curve_json as cj
    specs = {
        # HDR core: spec U2 curve 1 -> 0.225 @ 20% -> 0, colour #fff4d0, HDR x4 (blocks bloom threshold 1.05 comfortably)
        'VFXS_Core': (grad(srgb(0xfff4d0), [(0.0, 0.35), (0.16, 1.0), (0.4, 0.225), (1.0, 0.0)], 4.0), cj([(0.0, 6.0), (0.15, 12.0), (1.0, 13.0)])),
        # shards: bone silver, not HDR, fast fade, shrinking
        'VFXS_Shards': (grad(srgb(0xefe6d2), [(0.0, 1.0), (0.5, 0.7), (1.0, 0.0)], 1.0), cj([(0.0, 1.0), (1.0, 0.3)])),
        # mist: normal alpha, density = alpha max 0.58 (U5), growing
        'VFXS_Mist': (grad(srgb(0x9a8a72), [(0.0, 0.0), (0.15, 0.58), (0.7, 0.40), (1.0, 0.0)], 1.0), cj([(0.0, 0.6), (1.0, 1.6)])),
    }
    for name, (cjson, sjson) in specs.items():
        open(os.path.join(out, name + '.vfxblock'), 'w', encoding='utf-8', newline='\n').write(build(burst, tpl, name, cjson, sjson))
        print('wrote', name)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
