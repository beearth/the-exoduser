#!/usr/bin/env python3
"""Generate VFX_PoisonBurst.vfx (RM-1 spec v2.1 section 3.2: poison burst, ONE graph, variants A enemy druid / B player malice orb).

VFX Graph's model classes are internal, so (like gen_vfx.py / gen_vfx_subgraphs.py) the graph is assembled from documents of the shipped templates and samples:
  * 4 particle systems (core / chunks / mist / taint) are cloned from Templates/Simple_Burst.vfx and patched,
  * blocks the template lacks (position from the event, random velocity, scale) are grafted from Firework / Lightning / Sparks,
  * one Event context ("OnBurst") feeds the four Spawn contexts, so VfxBridge can fire it with VisualEffect.SendEvent,
  * every colour / size / lifetime / velocity box is an EXPOSED property linked straight to a block slot (spec U7: no colour constants in the graph; the numbers that
    select variant A or B live in VfxBridge.cs PoisonBurstPresets, the defaults baked here are variant A's).

Usage: python gen_vfx_poison.py <PackageCache visualeffectgraph dir> <output dir>      (output dir = Assets/Exoduser/VFX/RM1, must hold T_SoftCircle.png.meta)
Then the file is checked structurally (validate()): every reference resolves, links are symmetric, every script GUID is a known VFX Graph class.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_vfx import srgb_to_linear, curve_json      # shared helpers of the verified generator (signatures untouched)

P = 8926484042661600000
def B(n): return str(P + n)                         # template document ids: 8926484042661614700 == B(14700)

# ---- script GUIDs of VFX Graph model classes (read from the package .cs.meta files) --------------------------------------------------------------------
G_EVENT = '2461f61b3c026d54db1951a4e17ab20e'
G_PARAM = '330e0fca1717dde4aaa144f48232aa64'
G_SLOT_INT = '4d246e354feb93041a837a9ef59437cb'

T_FLOAT = 'System.Single, mscorlib, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089'

# ---- palette / sizes baked as the DEFAULTS of the exposed properties = variant A (spec 3.2 A, SSOT 2.2 "enemy poison") ----------------------------------
def hexrgb(h): return ((h >> 16 & 255) / 255.0, (h >> 8 & 255) / 255.0, (h & 255) / 255.0)

def grad(color_keys, alpha_keys):
    """color_keys [(t, 0xRRGGBB, hdr_mult)], alpha_keys [(t, a)] -> VFX Graph gradient JSON. sRGB hex -> linear x HDR multiplier (the project is Linear, gen_vfx.hdr)."""
    ck = []
    for t, h, m in color_keys:
        r, g, b = hexrgb(h)
        ck.append({"color": {"r": srgb_to_linear(r) * m, "g": srgb_to_linear(g) * m, "b": srgb_to_linear(b) * m, "a": 1.0}, "time": t})
    return json.dumps({"colorKeys": ck, "alphaKeys": [{"alpha": a, "time": t} for t, a in alpha_keys], "gradientMode": 0}, separators=(',', ':'))

# Variant A numbers = the defaults baked into the exposed properties. They must equal PoisonBurstPresets.A in VfxBridge.cs (checked by check_presets(), run on every generation).
PRESET_A = dict(PaletteCore=0xc8e8a8, PaletteMid=0x5f8a2e, PaletteShadow=0x1c2810, HdrCore=0xc8e8a8, CoreHdr=5.0, CoreSize=0.30, ChunkSizeMin=0.18, ChunkSizeMax=0.30,
                ChunkSpeed=6.0, MistSize=1.10, MistLifeMin=0.6, MistLifeMax=0.8, MistAlpha=0.30, TaintSize=0.20)
PA = PRESET_A
A = dict(
    core_grad=grad([(0.0, PA['HdrCore'], PA['CoreHdr'])], [(0.0, 0.35), (0.16, 1.0), (0.4, 0.225), (1.0, 0.0)]),            # U2 curve 1 -> 0.225@20% -> 0, HDR core
    chunk_grad=grad([(0.0, PA['PaletteMid'], 1.0), (1.0, PA['PaletteShadow'], 1.0)], [(0.0, 1.0), (0.55, 0.9), (1.0, 0.0)]),
    mist_grad=grad([(0.0, PA['PaletteMid'], 1.0), (1.0, PA['PaletteShadow'], 1.0)],
                   [(0.0, 0.0), (0.12, PA['MistAlpha']), (0.6, PA['MistAlpha'] * 0.67), (1.0, 0.0)]),                          # per-puff alpha peak 0.30 (4 overlapping puffs stay <= 0.58, U5)
    taint_grad=grad([(0.0, 0x5f8a2e, 1.0), (1.0, PA['PaletteShadow'], 1.0)], [(0.0, 0.0), (0.2, 0.0), (1.0, 0.0)]),            # variant A: invisible (count 0 anyway)
)

def check_presets(bridge_cs):
    """Fail loudly when the baked defaults drift from PoisonBurstPresets.A in the C# bridge."""
    src = open(bridge_cs, encoding='utf-8').read()
    m = re.search(r'public static readonly PoisonPreset A = new PoisonPreset\s*\{(.*?)\};', src, re.S)
    assert m, 'PoisonBurstPresets.A not found in ' + bridge_cs
    body = m.group(1); bad = []
    for k, v in PRESET_A.items():
        mm = re.search(r'\b%s = (0x[0-9a-fA-F]+|[\d.]+)f?' % k, body)
        if not mm: bad.append(k + ' missing'); continue
        got = int(mm.group(1), 16) if mm.group(1).startswith('0x') else float(mm.group(1))
        if abs(got - v) > 1e-9: bad.append('%s: C# %s != generator %s' % (k, got, v))
    return bad

# ---- document store -----------------------------------------------------------------------------------------------------------------------------------
def unfold(s):
    # Unity wraps long scalars ("Culture=neutral,\n    PublicKeyToken=...") in files it saved itself; undo it so one-line regexes work.
    return re.sub(r',\n\s+(?=(?:Version|Culture|PublicKeyToken))', ', ', s)

class Store:
    def __init__(self, path):
        s = unfold(open(path, encoding='utf-8').read())
        parts = re.split(r'^(?=--- )', s, flags=re.M)
        self.head, self.docs = parts[0], {}
        for d in parts[1:]:
            self.docs[re.match(r'--- !u!\d+ &(\d+)', d).group(1)] = d

FOLLOW = ('m_Children', 'm_InputSlots', 'm_OutputSlots', 'm_ActivationSlot', 'm_SubOutputs', 'm_Data')

def followed(text):
    out, cur = [], None
    for line in text.split('\n'):
        m = re.match(r'  (\w+):', line)
        if m: cur = m.group(1)
        if cur in FOLLOW: out += re.findall(r'fileID: (\d+)', line)
    return [r for r in out if r != '0']

def closure(docs, roots):
    seen, order, stack = set(), [], list(roots)
    while stack:
        i = stack.pop(0)
        if i in seen: continue
        seen.add(i); order.append(i)
        stack += followed(docs[i])
    return order

_next = [P + 100000]
def new_id():
    _next[0] += 1
    return str(_next[0])

def remap(text, m):
    text = re.sub(r'fileID: (\d+)', lambda x: 'fileID: ' + m.get(x.group(1), x.group(1)), text)
    return re.sub(r'^(--- !u!\d+ &)(\d+)', lambda x: x.group(1) + m.get(x.group(2), x.group(2)), text, flags=re.M)

def clone(store, roots):
    """Copy the documents reachable from roots with fresh ids. Returns (old->new map, {new id: text}). References to documents outside the copy are left as they were."""
    ids = closure(store.docs, roots)
    m = {i: new_id() for i in ids}
    return m, {m[i]: remap(store.docs[i], m) for i in ids}

# ---- text edit helpers --------------------------------------------------------------------------------------------------------------------------------
def setf(text, key, value):
    new, n = re.subn(r'(?m)^(  %s: ).*$' % re.escape(key), lambda m: m.group(1) + str(value), text, count=1)
    assert n == 1, key
    return new

def getf(text, key):
    m = re.search(r'(?m)^  %s: (.*)$' % re.escape(key), text)
    return m.group(1) if m else None

def set_value(text, v):
    """Value of a MASTER slot (the only 6-space m_SerializableObject line). v is a number/bool string or a JSON string."""
    v = str(v)
    if v.startswith('{') or v.startswith('['): v = "'" + v.replace("'", "''") + "'"
    new, n = re.subn(r'(?m)^(      m_SerializableObject: ).*$', lambda m: m.group(1) + v, text, count=1)
    assert n == 1
    return new

def get_value(text):
    return re.search(r'(?m)^      m_SerializableObject: (.*)$', text).group(1)

def children_of(text):
    m = re.search(r'(?m)^  m_Children:(?: \[\])?\n((?:  - \{fileID: \d+\}\n)*)', text)
    return re.findall(r'fileID: (\d+)', m.group(1)) if m else []

def set_children(text, ids):
    body = 'm_Children: []\n' if not ids else 'm_Children:\n' + ''.join('  - {fileID: %s}\n' % i for i in ids)
    new, n = re.subn(r'(?m)^  m_Children:(?: \[\])?\n(?:  - \{fileID: \d+\}\n)*', lambda m: '  ' + body, text, count=1)
    assert n == 1
    return new

def input_slots_of(text):
    m = re.search(r'(?m)^  m_InputSlots:(?: \[\])?\n((?:  - \{fileID: \d+\}\n)*)', text)
    return re.findall(r'fileID: (\d+)', m.group(1)) if m else []

def set_input_slots(text, ids):
    body = 'm_InputSlots: []\n' if not ids else 'm_InputSlots:\n' + ''.join('  - {fileID: %s}\n' % i for i in ids)
    new, n = re.subn(r'(?m)^  m_InputSlots:(?: \[\])?\n(?:  - \{fileID: \d+\}\n)*', lambda m: '  ' + body, text, count=1)
    assert n == 1
    return new

def slot_name(text):
    return re.search(r'(?m)^  m_Property:\n    name: (.*)$', text).group(1)

def add_link(text, other):
    """Append `other` to this slot document's m_LinkedSlots."""
    if re.search(r'(?m)^  m_LinkedSlots: \[\]$', text):
        return re.sub(r'(?m)^  m_LinkedSlots: \[\]$', '  m_LinkedSlots:\n  - {fileID: %s}' % other, text, count=1)
    return re.sub(r'(?m)^(  m_LinkedSlots:\n(?:  - \{fileID: \d+\}\n?)+)', lambda m: m.group(1).rstrip('\n') + '\n  - {fileID: %s}\n' % other, text, count=1)

def unlink(text):
    return re.sub(r'(?m)^  m_LinkedSlots:\n(?:  - \{fileID: \d+\}\n?)+', '  m_LinkedSlots: []\n', text)

def mono(id_, guid, parent, fields, pos=(0, 0), collapsed=0):
    return ('--- !u!114 &%s\nMonoBehaviour:\n  m_ObjectHideFlags: 0\n  m_CorrespondingSourceObject: {fileID: 0}\n  m_PrefabInstance: {fileID: 0}\n  m_PrefabAsset: {fileID: 0}\n'
            '  m_GameObject: {fileID: 0}\n  m_Enabled: 1\n  m_EditorHideFlags: 0\n  m_Script: {fileID: 11500000, guid: %s, type: 3}\n  m_Name: \n  m_EditorClassIdentifier: \n'
            '  m_UIIgnoredErrors: []\n  m_Parent: {fileID: %s}\n  m_Children: []\n  m_UIPosition: {x: %s, y: %s}\n  m_UICollapsed: %d\n  m_UISuperCollapsed: 0\n%s') % (id_, guid, parent, pos[0], pos[1], collapsed, fields)

def shift_ui(text, dx, dy=0):
    def f(m): return '  m_UIPosition: {x: %s, y: %s}' % (float(m.group(1)) + dx, float(m.group(2)) + dy)
    return re.sub(r'(?m)^  m_UIPosition: \{x: (-?[\d.]+), y: (-?[\d.]+)\}', f, text, count=1)

# ---- graph assembly -----------------------------------------------------------------------------------------------------------------------------------
class Graph:
    def __init__(self, tpl):
        self.docs = {}            # new id -> text (everything except the 3 header documents)
        self.graph_id = '114350483966674976'
        self.top = []             # ids that are children of the VFXGraph (contexts, parameters, event)
        self.params = []
        self.tpl = tpl

    def add(self, m_docs): self.docs.update(m_docs)

    def block_add(self, ctx, block_id, index=None):
        t = self.docs[ctx]; ch = children_of(t)
        ch.insert(len(ch) if index is None else index, block_id)
        self.docs[ctx] = set_children(t, ch)
        self.docs[block_id] = re.sub(r'(?m)^  m_Parent: \{fileID: \d+\}', '  m_Parent: {fileID: %s}' % ctx, self.docs[block_id], count=1)

    def block_remove(self, ctx, block_id):
        t = self.docs[ctx]
        self.docs[ctx] = set_children(t, [c for c in children_of(t) if c != block_id])
        for i in closure(self.docs, [block_id]): del self.docs[i]

    def slot(self, owner, name):
        for s in input_slots_of(self.docs[owner]):
            if slot_name(self.docs[s]) == name: return s
        raise KeyError('%s on %s (have %s)' % (name, owner, [slot_name(self.docs[s]) for s in input_slots_of(self.docs[owner])]))

    def graft_block(self, ctx, src, old_id, index=None):
        m, docs = clone(src, [old_id]); self.add(docs); nid = m[old_id]
        self.block_add(ctx, nid, index); return nid

    def expose(self, name, target_slot, category):
        """Exposed property `name` linked straight to the input slot `target_slot` (a master slot of a block/context). The output slot is a copy of that slot's subtree."""
        pid = new_id()
        sub = closure(self.docs, [target_slot])
        m = {i: new_id() for i in sub}
        out = {}
        for i in sub:
            t = remap(self.docs[i], m)
            t = re.sub(r'(?m)^  m_Direction: 0$', '  m_Direction: 1', t)
            t = re.sub(r'(?m)^  m_LinkedSlots:\n(?:  - \{fileID: \d+\}\n?)+', '  m_LinkedSlots: []\n', t)
            out[m[i]] = t
        o = m[target_slot]
        out[o] = re.sub(r'(?m)^  m_Property:\n    name: .*$', '  m_Property:\n    name: o', out[o], count=1)
        out[o] = re.sub(r'(?m)^(    m_Owner: )\{fileID: \d+\}', lambda x: x.group(1) + '{fileID: %s}' % pid, out[o], count=1)
        out[o] = add_link(out[o], target_slot)
        self.docs[target_slot] = add_link(self.docs[target_slot], o)
        self.add(out)
        order = len(self.params)
        node = ('  m_Nodes:\n  - m_Id: 0\n    linkedSlots:\n    - outputSlot: {fileID: %s}\n      inputSlot: {fileID: %s}\n    position: {x: %s, y: %s}\n'
                '    expandedSlots: []\n    expanded: 0\n    supecollapsed: 1\n') % (o, target_slot, -420 - 330 * (order // 12), 120 + 70 * (order % 12))
        fields = ('  m_InputSlots: []\n  m_OutputSlots:\n  - {fileID: %s}\n  m_ExposedName: %s\n  m_Exposed: 1\n  m_Order: %d\n  m_Category: %s\n'
                  '  m_Min:\n    m_Type:\n      m_SerializableType: \n    m_SerializableObject: \n  m_Max:\n    m_Type:\n      m_SerializableType: \n    m_SerializableObject: \n'
                  '  m_IsOutput: 0\n  m_EnumValues: []\n  m_ValueFilter: 0\n  m_Tooltip: \n%s') % (o, name, order, category, node)
        doc = mono(pid, G_PARAM, self.graph_id, fields)
        doc = doc.replace('  m_InputSlots: []\n  m_InputSlots: []\n', '  m_InputSlots: []\n')
        self.docs[pid] = doc; self.top.append(pid); self.params.append(pid)
        return pid

# ---- one particle system ------------------------------------------------------------------------------------------------------------------------------
def build_system(g, srcs, key, label, col, capacity, count, life, size=None, drag=None, vel=None, stretch=None, blend=1, orient=0, curve=None, size_random=None, lifetime_param=None):
    """Clone the Simple_Burst system and patch it. Returns dict of ids the caller needs for exposure."""
    burst = srcs['burst']
    m, docs = clone(burst, [B(14700), B(14707), B(14756), B(14775)])
    g.add(docs)
    I = lambda n: m[B(n)]
    sp, init, upd, out = I(14700), I(14707), I(14756), I(14775)
    for c in (sp, init, upd, out): g.docs[c] = shift_ui(g.docs[c], col * 700)
    g.top += [sp, init, upd, out]
    r = {'spawner': sp, 'init': init, 'update': upd, 'output': out}

    # --- Spawn: a single burst per Start event. Loop duration 0.01 s (constant) x loop count 1 (constant): the loop ends by itself and waits for the next OnBurst.
    g.docs[sp] = setf(g.docs[sp], 'm_Label', label + ' spawn')
    g.docs[sp] = setf(g.docs[sp], 'loopCount', 1)
    lc_m, lc_docs = clone(srcs['msb'], ['8926484042661614725'])        # LoopCount (int) slot of MultiStripSingleBurst's spawner
    g.add(lc_docs); lc = lc_m['8926484042661614725']
    g.docs[lc] = re.sub(r'(?m)^(    m_Owner: )\{fileID: \d+\}', lambda x: x.group(1) + '{fileID: %s}' % sp, g.docs[lc], count=1)
    g.docs[lc] = set_value(g.docs[lc], 1)
    g.docs[sp] = set_input_slots(g.docs[sp], input_slots_of(g.docs[sp]) + [lc])
    g.docs[I(14879)] = set_value(g.docs[I(14879)], 0.01)               # LoopDuration: shorter than one 60 Hz frame, so back-to-back bursts on consecutive ticks are never swallowed
    g.docs[I(14704)] = set_value(g.docs[I(14704)], count)              # burst Count
    r['count_slot'] = I(14704)

    # --- Initialize: bounds covering the arena (the component sits at the origin; particles live in world space), capacity, blocks
    g.docs[init] = setf(g.docs[init], 'm_Label', label + ' init')
    g.docs[I(14880)] = set_value(g.docs[I(14880)], '{"center":{"x":0.0,"y":0.0,"z":0.0},"size":{"x":80.0,"y":6.0,"z":80.0}}')
    data = m[B(14721)]
    g.docs[data] = setf(setf(g.docs[data], 'capacity', capacity), 'title', label)
    g.block_remove(init, I(14956)); g.block_remove(init, I(14912))      # PositionShape, VelocityDirection: replaced by event position + exposed velocity box
    g.block_remove(upd, I(14922))                                       # Gravity: the burst lives on the ground plane, seen from above
    life_blk = I(14722)
    g.docs[I(14723)] = set_value(g.docs[I(14723)], life[0]); g.docs[I(14724)] = set_value(g.docs[I(14724)], life[1])      # lifetime A / B (uniform random)
    r['life_a'], r['life_b'] = I(14723), I(14724)
    pos = g.graft_block(init, srcs['firework'], '8926484042661617809', 0)       # position <- event attribute (Source)
    if vel is not None:
        vb = g.graft_block(init, srcs['lightning'], '8926484042661615314')       # velocity, random per component, slots A / B (Vector)
        r['vel_a'], r['vel_b'] = g.slot(vb, 'A'), g.slot(vb, 'B')
        g.docs[r['vel_a']] = set_value(g.docs[r['vel_a']], '{"vector":{"x":%s,"y":0.0,"z":%s}}' % (-vel, -vel))
        g.docs[r['vel_b']] = set_value(g.docs[r['vel_b']], '{"vector":{"x":%s,"y":0.0,"z":%s}}' % (vel, vel))
    # size: uniform random A..B (float) when size_random else one value
    sb = g.graft_block(init, srcs['sparks'], '8926484042661614606')        # a float SetAttribute (scale X in the sample) -> retargeted below
    g.docs[sb] = setf(g.docs[sb], 'attribute', 'size'); g.docs[sb] = setf(g.docs[sb], 'channels', 6)
    _sl0 = input_slots_of(g.docs[sb])[0]
    g.docs[_sl0] = unlink(g.docs[_sl0])
    if size_random:
        # Random = Uniform needs slots A and B: duplicate the float slot and rename (names are what SyncSlots matches against)
        sl = input_slots_of(g.docs[sb])[0]
        m2, d2 = clone_local(g.docs, sl); g.add(d2); sl2 = m2[sl]
        g.docs[sb] = setf(g.docs[sb], 'Random', 2)
        for s, nme, val in ((sl, 'A', size_random[0]), (sl2, 'B', size_random[1])):
            g.docs[s] = re.sub(r'(?m)^  m_Property:\n    name: .*$', '  m_Property:\n    name: ' + nme, g.docs[s], count=1)
            g.docs[s] = set_value(g.docs[s], val)
        g.docs[sl2] = re.sub(r'(?m)^(    m_Owner: )\{fileID: \d+\}', lambda x: x.group(1) + '{fileID: %s}' % sb, g.docs[sl2], count=1)
        g.docs[sb] = set_input_slots(g.docs[sb], [sl, sl2])
        r['size_a'], r['size_b'] = sl, sl2
    else:
        sl = input_slots_of(g.docs[sb])[0]
        g.docs[sl] = re.sub(r'(?m)^  m_Property:\n    name: .*$', '  m_Property:\n    name: _Size', g.docs[sl], count=1)
        g.docs[sl] = set_value(g.docs[sl], size)
        g.docs[sl] = re.sub(r'(?m)^  m_LinkedSlots:\n(?:  - \{fileID: \d+\}\n?)+', '  m_LinkedSlots: []\n', g.docs[sl])
        r['size_slot'] = sl
    if stretch is not None:
        st = g.graft_block(init, srcs['sparks'], '8926484042661614606')          # scale.Y = stretch (the quad is oriented along its velocity)
        g.docs[st] = setf(g.docs[st], 'channels', 1)
        sl = input_slots_of(g.docs[st])[0]
        g.docs[sl] = re.sub(r'(?m)^  m_LinkedSlots:\n(?:  - \{fileID: \d+\}\n?)+', '  m_LinkedSlots: []\n', g.docs[sl])
        g.docs[sl] = set_value(g.docs[sl], stretch)

    # --- Update: drag only where the system moves
    if drag is None: g.block_remove(upd, I(14929))
    else: g.docs[I(14930)] = set_value(g.docs[I(14930)], drag)
    g.docs[upd] = setf(g.docs[upd], 'm_Label', label + ' update')

    # --- Output: quad, texture = T_SoftCircle (procedural soft disc), orient, colour-over-life gradient, size-over-life curve
    g.docs[out] = setf(g.docs[out], 'm_Label', label + ' quad')
    g.docs[out] = setf(g.docs[out], 'blendMode', blend)
    g.docs[I(14776)] = re.sub(r'8aafaa78fe944854997fef757ff4ba72', TEX_GUID[0], g.docs[I(14776)])
    g.docs[I(14779)] = setf(g.docs[I(14779)], 'mode', orient)
    r['grad_slot'] = I(14793)
    g.docs[I(14953)] = set_value(g.docs[I(14953)], curve_json(curve))
    return r

def clone_local(docs, root):
    """Clone a subtree that already lives in the graph (used to duplicate a slot)."""
    ids = closure(docs, [root]); m = {i: new_id() for i in ids}
    return m, {m[i]: remap(docs[i], m) for i in ids}

TEX_GUID = [None]

# ---- main ---------------------------------------------------------------------------------------------------------------------------------------------
def build(pkg, outdir):
    meta = os.path.join(outdir, 'T_SoftCircle.png.meta')
    TEX_GUID[0] = re.search(r'guid: (\w+)', open(meta, encoding='utf-8').read()).group(1)
    T = os.path.join(pkg, 'Editor', 'Templates'); S = os.path.join(pkg, 'Samples~')
    srcs = {'burst': Store(os.path.join(T, 'Simple_Burst.vfx')), 'firework': Store(os.path.join(T, 'Firework.vfx')),
            'lightning': Store(os.path.join(S, 'VFXGraphAdditions', 'VFX', 'Lightning.vfx')), 'sparks': Store(os.path.join(S, 'VFXGraphAdditions', 'VFX', 'Sparks.vfx')),
            'msb': Store(os.path.join(S, 'VFXLearningTemplates', 'VFX', 'MultiStripSingleBurst.vfx'))}
    burst = srcs['burst']
    g = Graph(burst)

    # Event context: SendEvent("OnBurst", attribute) -> the four spawners' Start flow (slot 0)
    ev = new_id()
    # size curves (value x base size): core grows to a plateau, chunks taper, mist/taint swell
    sysd = {}
    sysd['core'] = build_system(g, srcs, 'core', 'Core', 0, 8, 1, (0.25, 0.25), size=0.30, blend=0, orient=0,
                                curve=[(0.0, 0.5), (0.15, 1.0), (1.0, 1.08)])
    sysd['chunks'] = build_system(g, srcs, 'chunks', 'Chunks', 1, 64, 10, (0.18, 0.34), size_random=(0.18, 0.30), drag=7.0, vel=6.0, stretch=2.6, blend=1, orient=6,
                                  curve=[(0.0, 1.0), (0.4, 0.8), (1.0, 0.35)])
    sysd['mist'] = build_system(g, srcs, 'mist', 'Mist', 2, 32, 4, (0.6, 0.8), size=1.10, drag=3.0, vel=1.6, blend=1, orient=0,
                                curve=[(0.0, 0.55), (0.35, 0.9), (1.0, 1.6)])
    sysd['taint'] = build_system(g, srcs, 'taint', 'Taint', 3, 16, 0, (0.5, 0.6), size=0.20, drag=3.0, vel=0.5, blend=1, orient=0,
                                 curve=[(0.0, 0.6), (0.4, 1.0), (1.0, 1.4)])
    # flow: Event -> every Spawn context (Start)
    ev_out = []
    for k in sysd:
        sp = sysd[k]['spawner']
        g.docs[sp] = re.sub(r'(?m)^(  m_InputFlowSlot:\n)  - link: \[\]\n', lambda x: x.group(1) + '  - link:\n    - context: {fileID: %s}\n      slotIndex: 0\n' % ev, g.docs[sp], count=1)
        ev_out.append(sp)
    ev_fields = ('  m_InputSlots: []\n  m_OutputSlots: []\n  m_Label: \n  m_Data: {fileID: 0}\n  m_InputFlowSlot:\n  - link: []\n  m_OutputFlowSlot:\n  - link:\n' +
                 ''.join('    - context: {fileID: %s}\n      slotIndex: 0\n' % s for s in ev_out) + '  eventName: OnBurst\n')
    g.docs[ev] = mono(ev, G_EVENT, g.graph_id, ev_fields, pos=(-250, 360))
    g.top.insert(0, ev)

    # initial values of the exposed properties = variant A defaults (set before exposing so the copies carry them)
    c, k, mi, ta = sysd['core'], sysd['chunks'], sysd['mist'], sysd['taint']
    for s, gr in ((c, A['core_grad']), (k, A['chunk_grad']), (mi, A['mist_grad']), (ta, A['taint_grad'])):
        g.docs[s['grad_slot']] = set_value(g.docs[s['grad_slot']], gr)
    g.expose('CoreGradient', c['grad_slot'], 'Core')
    g.expose('CoreSize', c['size_slot'], 'Core')
    g.expose('ChunkGradient', k['grad_slot'], 'Chunks')
    g.expose('ChunkSizeMin', k['size_a'], 'Chunks'); g.expose('ChunkSizeMax', k['size_b'], 'Chunks')
    g.expose('ChunkVelMin', k['vel_a'], 'Chunks'); g.expose('ChunkVelMax', k['vel_b'], 'Chunks')
    g.expose('MistGradient', mi['grad_slot'], 'Mist')
    g.expose('MistSize', mi['size_slot'], 'Mist')
    g.expose('MistLifeMin', mi['life_a'], 'Mist'); g.expose('MistLifeMax', mi['life_b'], 'Mist')
    g.expose('TaintGradient', ta['grad_slot'], 'Taint')
    g.expose('TaintSize', ta['size_slot'], 'Taint')
    g.expose('TaintCount', ta['count_slot'], 'Taint')

    # the three header documents come from the template (graph / resource / UI), with the graph's children rewritten
    hdr_docs = {i: d for i, d in burst.docs.items() if i in ('114340500867371532', '114350483966674976', B(14527))}
    ui = hdr_docs['114340500867371532']
    ui = re.sub(r'(?s)  groupInfos:.*?  stickyNoteInfos: \[\]\n  categories: \[\]\n',
                '  groupInfos: []\n  stickyNoteInfos: []\n  categories:\n' + ''.join('  - name: %s\n    collapsed: 0\n' % n for n in ('Core', 'Chunks', 'Mist', 'Taint')), ui)
    ui = re.sub(r'(?s)  uiBounds:.*$', '  uiBounds:\n    serializedVersion: 2\n    x: -700\n    y: 120\n    width: 3500\n    height: 2400\n', ui)
    gr = hdr_docs['114350483966674976']
    gr = set_children(gr, g.top)
    gr = setf(gr, 'm_Name', 'VFX_PoisonBurst')
    res = setf(hdr_docs[B(14527)], 'm_Name', 'VFX_PoisonBurst')
    text = burst.head + ui + gr + res + ''.join(g.docs[i] for i in g.docs)
    return text, g

# ---- validation (no Unity needed) ---------------------------------------------------------------------------------------------------------------------
def validate(text, pkg):
    g2c = {}
    for root, _, fs in os.walk(pkg):
        for f in fs:
            if f.endswith('.cs.meta'):
                mm = re.search(r'guid: (\w+)', open(os.path.join(root, f), encoding='utf-8', errors='ignore').read())
                if mm: g2c[mm.group(1)] = f[:-8]
    parts = re.split(r'^(?=--- )', text, flags=re.M)[1:]
    docs = {re.match(r'--- !u!\d+ &(\d+)', d).group(1): d for d in parts}
    errs = []
    for i, d in docs.items():
        for r in re.findall(r'fileID: (\d+)', d):
            if r not in ('0', '11500000') and r not in docs: errs.append('dangling %s in %s' % (r, i))
        sc = re.search(r'm_Script: \{fileID: 11500000, guid: (\w+)', d)
        if sc and sc.group(1) not in g2c and sc.group(1) not in ('d01270efd3285ea4a9d6c555cb0a8027', '7d4c867f6b72b714dbb5fd1780afe208'):
            # URP sub-output classes live in the render-pipelines package, not in the VFX package
            if sc.group(1) not in ('081ffb0090424ba4cb05370a42ead6b9', '388ad3b1dc9c6ae45b630f914fab638f'): errs.append('unknown script %s in %s' % (sc.group(1), i))
        ch = children_of(d)
        for c in ch:
            if c in docs:
                par = re.search(r'(?m)^  m_Parent: \{fileID: (\d+)\}', docs[c])
                if par and par.group(1) != i: errs.append('child %s of %s has parent %s' % (c, i, par.group(1)))
        for ls in re.findall(r'(?m)^  m_LinkedSlots:\n((?:  - \{fileID: \d+\}\n?)+)', d):
            for o in re.findall(r'fileID: (\d+)', ls):
                if o in docs and ('{fileID: %s}' % i) not in re.search(r'(?s)m_LinkedSlots:(.*?)(?=\n  \w|\Z)', docs[o]).group(1): errs.append('asymmetric link %s -> %s' % (i, o))
        # slots point at their master / owner
        mo = re.search(r'(?m)^    m_Owner: \{fileID: (\d+)\}', d)
        if mo and mo.group(1) != '0' and mo.group(1) not in docs: errs.append('owner %s missing for %s' % (mo.group(1), i))
        for ctxlink in re.findall(r'context: \{fileID: (\d+)\}\n\s+slotIndex: (\d+)', d):
            other = docs.get(ctxlink[0])
            if other is None or ('context: {fileID: %s}' % i) not in other: errs.append('flow link %s -> %s not mirrored' % (i, ctxlink[0]))
        own = re.search(r'(?m)^  m_Owners:\n((?:  - \{fileID: \d+\}\n)+)', d)
        if own:
            for o in re.findall(r'fileID: (\d+)', own.group(1)):
                if ('m_Data: {fileID: %s}' % i) not in docs.get(o, ''): errs.append('data %s owner %s does not point back' % (i, o))
    # every context has its data; every slot master chain is intact
    for i, d in docs.items():
        m = re.search(r'(?m)^  m_MasterSlot: \{fileID: (\d+)\}', d)
        if m and m.group(1) not in docs: errs.append('master missing %s' % i)
    return errs, docs, g2c

if __name__ == '__main__':
    pkg, out = sys.argv[1], sys.argv[2]
    bridge = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'Assets', 'Exoduser', 'Runtime', 'Vfx', 'VfxBridge.cs')
    drift = check_presets(bridge)
    if drift:
        print('PRESET DRIFT between gen_vfx_poison.py and VfxBridge.cs:', drift); sys.exit(2)
    text, g = build(pkg, out)
    errs, docs, g2c = validate(text, pkg)
    path = os.path.join(out, 'VFX_PoisonBurst.vfx')
    open(path, 'w', encoding='utf-8', newline='\n').write(text)
    meta = path + '.meta'
    if not os.path.exists(meta):
        open(meta, 'w', encoding='utf-8', newline='\n').write(open(os.path.join(out, 'VFX_CoreTest.vfx.meta'), encoding='utf-8').read().replace('094dc7c92d241d7458e3177a365d14a0', 'b7e24f1a6c3d4e8f9a0b1c2d3e4f5a6b'))
    print('wrote %s: %d documents, %d exposed properties, %d problems' % (path, len(docs), len(g.params), len(errs)))
    for e in errs[:40]: print('  PROBLEM', e)
    sys.exit(1 if errs else 0)
