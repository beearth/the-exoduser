#!/usr/bin/env python3
"""Build the RM-1 Ki Slash Graph from Unity 17.6 shipped Graph templates.

Usage: python gen_vfx_ki.py <visualeffectgraph PackageCache directory>

The three independent systems use one asset: hit core, hit shards, and a
particle strip whose one-particle bursts append a trail point each simulation
tick. The caller must keep one VisualEffect instance per live projectile or
points from different projectiles would join the same strip.
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen_vfx_poison as p
from gen_vfx import curve_json


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'Assets', 'Exoduser'))
SOURCE_VFX = os.path.join(ROOT, 'VFX', 'RM1')
OUT = os.path.join(ROOT, 'Resources', 'VFX', 'RM1')
ASSET = os.path.join(OUT, 'VFX_KiSlash.vfx')
FOLDER_GUIDS = {'VFX': 'a2e6c13fb8d74d4daf66722039c54e91', 'RM1': 'ea867b39d0454c29a8c16ebd70f35a42'}
ASSET_GUID = 'c47842d073ea4dc5b4f0e610b72e85a3'


def trim_file(path):
    with open(path, encoding='utf-8') as f:
        original = f.read()
    clean = re.sub(r'[ \t]+(?=\n|$)', '', original)
    if clean != original:
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(clean)


def folder_meta(path, guid):
    meta = path + '.meta'
    if not os.path.exists(meta):
        with open(meta, 'w', encoding='utf-8', newline='\n') as f:
            f.write('fileFormatVersion: 2\nguid: ' + guid + '\nfolderAsset: yes\nDefaultImporter:\n  externalObjects: {}\n  userData:\n  assetBundleName:\n  assetBundleVariant:\n')
    trim_file(meta)


def asset_meta():
    meta = ASSET + '.meta'
    if not os.path.exists(meta):
        with open(meta, 'w', encoding='utf-8', newline='\n') as f:
            f.write('fileFormatVersion: 2\nguid: ' + ASSET_GUID + '\nVisualEffectImporter:\n  externalObjects: {}\n  serializedVersion: 2\n  template:\n    name:\n    category:\n    description:\n    icon: {instanceID: 0}\n    thumbnail: {instanceID: 0}\n    order: 0\n  useAsTemplate: 0\n  userData:\n  assetBundleName:\n  assetBundleVariant:\n')
    trim_file(meta)


def add_event(g, name, spawners):
    ev = p.new_id()
    for sp in spawners:
        # Both source spawner templates have Start and Stop input flow slots.
        existing = re.findall(r'context: \{fileID: (\d+)\}',
                              re.search(r'(?s)  m_InputFlowSlot:\n(.*?)  m_OutputFlowSlot:', g.docs[sp]).group(1))
        starts = list(dict.fromkeys(existing + [ev]))
        flow = ('  m_InputFlowSlot:\n  - link:\n' +
                ''.join('    - context: {fileID: %s}\n      slotIndex: 0\n' % x for x in starts) +
                '  - link: []\n')
        g.docs[sp], n = re.subn(r'(?s)  m_InputFlowSlot:\n.*?(?=  m_OutputFlowSlot:)', flow, g.docs[sp], count=1)
        assert n == 1
    fields = ('  m_InputSlots: []\n  m_OutputSlots: []\n  m_Label: \n  m_Data: {fileID: 0}\n'
              '  m_InputFlowSlot:\n  - link: []\n  m_OutputFlowSlot:\n  - link:\n' +
              ''.join('    - context: {fileID: %s}\n      slotIndex: 0\n' % x for x in spawners) +
              '  eventName: ' + name + '\n')
    g.docs[ev] = p.mono(ev, p.G_EVENT, g.graph_id, fields, pos=(-700, 300 + 210 * len(g.top)))
    g.top.insert(0, ev)


def clone_slot(g, src, old_id, owner, value):
    mapping, docs = p.clone(src, [old_id])
    g.add(docs)
    root = mapping[old_id]
    g.docs[root] = re.sub(r'(?m)^(    m_Owner: )\{fileID: \d+\}',
                          lambda m: m.group(1) + '{fileID: %s}' % owner, g.docs[root], count=1)
    g.docs[root] = p.set_value(g.docs[root], value)
    return root


def add_strip(g, srcs):
    trail = srcs['trail']
    ids = ('8926484042661614852', '8926484042661614857',
           '8926484042661614895', '8926484042661614918')
    mapping, docs = p.clone(trail, ids)
    g.add(docs)
    sp, init, upd, out = (mapping[x] for x in ids)
    g.top.extend((sp, init, upd, out))
    for c in (sp, init, upd, out):
        g.docs[c] = p.shift_ui(g.docs[c], 1500, 0)
    g.docs[sp] = p.setf(g.docs[sp], 'm_Label', 'Ki projectile trail spawn')
    g.docs[init] = p.setf(g.docs[init], 'm_Label', 'Ki projectile strip init')
    g.docs[out] = p.setf(p.setf(g.docs[out], 'm_Label', 'Ki strip output'), 'blendMode', 0)

    # One OnKiTrail event contributes one point to the strip. A new component
    # represents a new projectile, preventing two trajectories from joining.
    g.block_remove(sp, mapping['8926484042661614854'])  # continuous rate
    burst = g.graft_block(sp, srcs['burst'], p.B(14703))
    p_count = g.slot(burst, 'Count')
    g.docs[p_count] = p.set_value(g.docs[p_count], 1)
    g.docs[sp] = p.setf(p.setf(g.docs[sp], 'loopCount', 1), 'loopDuration', 1)
    duration = clone_slot(g, srcs['burst'], p.B(14879), sp, .01)
    count = clone_slot(g, srcs['msb'], '8926484042661614725', sp, 1)
    g.docs[sp] = p.set_input_slots(g.docs[sp], [duration, count])

    data = mapping['8926484042661614871']
    g.docs[data] = p.setf(p.setf(p.setf(g.docs[data], 'capacity', 16), 'particlePerStripCount', 16), 'title', 'Ki projectile strip')
    g.docs[mapping['8926484042661615047']] = p.set_value(g.docs[mapping['8926484042661615047']], .12)
    g.block_remove(init, mapping['8926484042661614872'])  # circle placement
    g.block_remove(init, mapping['8926484042661615032'])  # velocity direction
    g.graft_block(init, srcs['firework'], '8926484042661617809', 0)  # Source.position

    size_block = g.graft_block(init, srcs['sparks'], '8926484042661614606')
    g.docs[size_block] = p.setf(p.setf(g.docs[size_block], 'attribute', 'size'), 'channels', 6)
    size = p.input_slots_of(g.docs[size_block])[0]
    g.docs[size] = p.unlink(g.docs[size])
    g.docs[size] = p.set_value(g.docs[size], .08)
    g.docs[size] = re.sub(r'(?m)^  m_Property:\n    name: .*$', '  m_Property:\n    name: _Size', g.docs[size], count=1)

    # Front of the slash is HDR; old strip points fade to desaturated bone.
    grad_slot = mapping['8926484042661614940']
    g.docs[grad_slot] = p.set_value(g.docs[grad_slot],
        p.grad([(0, 0xfff4d0, 1.8), (1, 0x9a8a72, 1.0)],
               [(0, .78), (.45, .42), (1, 0)]))
    g.docs[mapping['8926484042661615044']] = p.set_value(
        g.docs[mapping['8926484042661615044']], curve_json([(0, 1), (1, .45)]))
    # Template texture is a package-local GUID; use the verified project texture.
    tex = mapping['8926484042661614919']
    g.docs[tex] = g.docs[tex].replace('8aafaa78fe944854997fef757ff4ba72', p.TEX_GUID[0])
    g.expose('TrailGradient', grad_slot, 'Trail')
    g.expose('TrailSize', size, 'Trail')
    return sp


def build(pkg):
    t = os.path.join(pkg, 'Editor', 'Templates')
    s = os.path.join(pkg, 'Samples~')
    srcs = {
        'burst': p.Store(os.path.join(t, 'Simple_Burst.vfx')),
        'firework': p.Store(os.path.join(t, 'Firework.vfx')),
        'lightning': p.Store(os.path.join(s, 'VFXGraphAdditions', 'VFX', 'Lightning.vfx')),
        'sparks': p.Store(os.path.join(s, 'VFXGraphAdditions', 'VFX', 'Sparks.vfx')),
        'msb': p.Store(os.path.join(s, 'VFXLearningTemplates', 'VFX', 'MultiStripSingleBurst.vfx')),
        'trail': p.Store(os.path.join(t, 'Simple_Trail.vfx')),
    }
    tex_meta = os.path.join(SOURCE_VFX, 'T_SoftCircle.png.meta')
    p.TEX_GUID[0] = re.search(r'guid: (\w+)', open(tex_meta, encoding='utf-8').read()).group(1)
    g = p.Graph(srcs['burst'])
    core = p.build_system(g, srcs, 'hit_core', 'Ki hit core', 0, 12, 1, (.25, .25),
                          size=.30, blend=0, orient=0,
                          curve=[(0, .5), (.15, 1), (1, 1.08)])
    shards = p.build_system(g, srcs, 'hit_shards', 'Ki hit shards', 1, 96, 8, (.08, .20),
                            size=.09, drag=7, vel=4, stretch=2.6, blend=1, orient=6,
                            curve=[(0, 1), (.4, .8), (1, .35)])
    g.docs[core['grad_slot']] = p.set_value(g.docs[core['grad_slot']],
        p.grad([(0, 0xfff4d0, 4)], [(0, .35), (.16, 1), (.4, .225), (1, 0)]))
    g.docs[shards['grad_slot']] = p.set_value(g.docs[shards['grad_slot']],
        p.grad([(0, 0xefe6d2, 1), (1, 0x9a8a72, 1)], [(0, .8), (.6, .5), (1, 0)]))
    g.expose('CoreGradient', core['grad_slot'], 'Core')
    g.expose('CoreSize', core['size_slot'], 'Core')
    g.expose('ShardGradient', shards['grad_slot'], 'Shards')
    g.expose('ShardSize', shards['size_slot'], 'Shards')
    g.expose('ShardVelMin', shards['vel_a'], 'Shards')
    g.expose('ShardVelMax', shards['vel_b'], 'Shards')
    strip = add_strip(g, srcs)
    add_event(g, 'OnKiHit', [core['spawner'], shards['spawner']])
    add_event(g, 'OnKiCharge', [core['spawner']])
    add_event(g, 'OnKiTrail', [strip])

    burst = srcs['burst']
    headers = {i: d for i, d in burst.docs.items()
               if i in ('114340500867371532', '114350483966674976', p.B(14527))}
    graph = p.set_children(headers['114350483966674976'], g.top)
    graph = p.setf(graph, 'm_Name', 'VFX_KiSlash')
    resource = p.setf(headers[p.B(14527)], 'm_Name', 'VFX_KiSlash')
    ui = re.sub(r'(?s)  groupInfos:.*?  stickyNoteInfos: \[\]\n  categories: \[\]\n',
                '  groupInfos: []\n  stickyNoteInfos: []\n  categories:\n' +
                ''.join('  - name: %s\n    collapsed: 0\n' % x for x in ('Core', 'Shards', 'Trail')), headers['114340500867371532'])
    text = burst.head + ui + graph + resource + ''.join(g.docs.values())
    # Shipped Unity templates serialize empty scalars with a trailing space.
    # Preserve their values while keeping the generated asset diff-clean.
    return re.sub(r'[ \t]+(?=\n)', '', text), g


def main():
    if len(sys.argv) != 2:
        sys.exit('usage: python gen_vfx_ki.py <visualeffectgraph PackageCache directory>')
    pkg = os.path.abspath(sys.argv[1])
    text, graph = build(pkg)
    errors, docs, _ = p.validate(text, pkg)
    if errors:
        for error in errors[:30]:
            print('PROBLEM', error)
        sys.exit('graph validation failed: %d errors' % len(errors))
    os.makedirs(OUT, exist_ok=True)
    folder_meta(os.path.dirname(OUT), FOLDER_GUIDS['VFX'])
    folder_meta(OUT, FOLDER_GUIDS['RM1'])
    asset_meta()
    with open(ASSET, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)
    print('wrote %s: %d documents, %d exposed properties, %d errors' %
          (ASSET, len(docs), len(graph.params), len(errors)))


if __name__ == '__main__':
    main()
