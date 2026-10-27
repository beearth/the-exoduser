#!/usr/bin/env python3
"""Tiny Shader Graph (multi-JSON) builder for the RM-1 VFX graphs.

Shader Graph's model classes are internal, so graphs are generated from shipped templates (GraphTemplates/Cross Pipeline) by stripping the template's
content nodes and adding properties, Custom Function nodes and edges. Reference JSON for node/slot shapes is in sg_samples/ (copied from Unity's own samples).
"""
import copy, json, os, uuid

HERE = os.path.dirname(os.path.abspath(__file__))


def load_multi(path):
    s = open(path, encoding='utf-8').read()
    dec = json.JSONDecoder(); i = 0; out = []
    while i < len(s):
        while i < len(s) and s[i].isspace(): i += 1
        if i >= len(s): break
        o, j = dec.raw_decode(s, i); out.append(o); i = j
    return [o for o in out if isinstance(o, dict) and 'm_ObjectId' in o]


def dump_multi(objs, path):
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n\n'.join(json.dumps(o, indent=4) for o in objs) + '\n')


def sample(name):
    return json.load(open(os.path.join(HERE, 'sg_samples', name + '.json'), encoding='utf-8'))


def nid(): return uuid.uuid4().hex


class Graph:
    def __init__(self, template_path):
        self.objs = load_multi(template_path)
        self.by = {o['m_ObjectId']: o for o in self.objs}
        self.g = self.objs[0]
        assert self.g['m_Type'].endswith('GraphData')
        self.blocks = {self.by[b['m_Id']]['m_SerializedDescriptor']: self.by[b['m_Id']]
                       for b in self.g['m_VertexContext']['m_Blocks'] + self.g['m_FragmentContext']['m_Blocks']}
        self._pos = [-900.0, 0.0]

    # ---- structure ------------------------------------------------------------------------------------------------------------------------------
    def strip(self, keep_types=('BlockNode',)):
        """Remove every graph node that is not a block, with its slots, all properties, and all edges."""
        drop = []
        for n in list(self.g['m_Nodes']):
            o = self.by[n['m_Id']]
            if o['m_Type'].split('.')[-1] not in keep_types: drop.append(o)
        ids = {o['m_ObjectId'] for o in drop}
        for o in drop:
            for s in o.get('m_Slots', []): self._remove(s['m_Id'])
        self.g['m_Nodes'] = [n for n in self.g['m_Nodes'] if n['m_Id'] not in ids]
        for o in drop: self._remove(o['m_ObjectId'])
        for p in list(self.g['m_Properties']): self._remove(p['m_Id'])
        self.g['m_Properties'] = []
        for c in self.g['m_CategoryData']: self.by[c['m_Id']]['m_ChildObjectList'] = []
        self.g['m_Edges'] = []

    def _remove(self, oid):
        o = self.by.pop(oid, None)
        if o is not None: self.objs.remove(o)

    def _add(self, o):
        self.objs.append(o); self.by[o['m_ObjectId']] = o; return o

    def set_target(self, **kw):
        t = next(o for o in self.objs if o['m_Type'].endswith('.UniversalTarget'))
        t.update(kw)

    # ---- properties -----------------------------------------------------------------------------------------------------------------------------
    def _prop_base(self, ptype, name, ref, version):
        return {'m_SGVersion': version, 'm_Type': ptype, 'm_ObjectId': nid(), 'm_Guid': {'m_GuidSerialized': str(uuid.uuid4())},
                'promotedFromAssetID': '', 'promotedFromCategoryName': '', 'promotedOrdering': -1, 'm_Name': name,
                'm_DefaultRefNameVersion': 1, 'm_RefNameGeneratedByDisplayName': name, 'm_DefaultReferenceName': ref, 'm_OverrideReferenceName': '',
                'm_GeneratePropertyBlock': True, 'm_UseCustomSlotLabel': False, 'm_CustomSlotLabel': '', 'm_DismissedVersion': 0, 'm_Precision': 0,
                'overrideHLSLDeclaration': False, 'hlslDeclarationOverride': 0, 'hideConnector': False, 'm_Hidden': False, 'm_PerRendererData': False,
                'm_customAttributes': []}

    def _register_prop(self, p):
        self._add(p); self.g['m_Properties'].append({'m_Id': p['m_ObjectId']})
        self.by[self.g['m_CategoryData'][0]['m_Id']]['m_ChildObjectList'].append({'m_Id': p['m_ObjectId']}); return p

    def prop_float(self, name, default, rng=None, per_renderer=False):
        ref = '_' + name.replace(' ', '_').lstrip('_')
        p = self._prop_base('UnityEditor.ShaderGraph.Internal.Vector1ShaderProperty', name, ref, 1)
        p.update({'m_Value': default, 'm_FloatType': 1 if rng else 0, 'm_LiteralFloatMode': False, 'm_RangeValues': {'x': rng[0], 'y': rng[1]} if rng else {'x': 0.0, 'y': 1.0},
                  'm_SliderType': 0, 'm_SliderPower': 3.0, 'm_EnumType': 0, 'm_CSharpEnumString': '', 'm_EnumNames': [], 'm_EnumValues': []})
        p['m_PerRendererData'] = per_renderer
        return self._register_prop(p)

    def prop_color(self, name, rgba, hdr=False):
        ref = '_' + name.replace(' ', '_').lstrip('_')
        p = self._prop_base('UnityEditor.ShaderGraph.Internal.ColorShaderProperty', name, ref, 3)
        p.update({'m_Value': {'r': rgba[0], 'g': rgba[1], 'b': rgba[2], 'a': rgba[3]}, 'isMainColor': False, 'm_ColorMode': 1 if hdr else 0})
        return self._register_prop(p)

    def prop_texture(self, name, default='white'):
        ref = '_' + name.replace(' ', '_').lstrip('_')
        p = self._prop_base('UnityEditor.ShaderGraph.Internal.Texture2DShaderProperty', name, ref, 1)
        p.update({'m_Value': {'m_SerializedTexture': '', 'm_Guid': ''}, 'isMainTexture': False, 'useTilingAndOffset': False, 'm_Modifiable': True, 'm_DefaultType': 0})
        return self._register_prop(p)

    # ---- nodes ----------------------------------------------------------------------------------------------------------------------------------
    def _node_base(self, ntype, name, slots, version=0):
        self._pos[1] += 120
        n = {'m_SGVersion': version, 'm_Type': ntype, 'm_ObjectId': nid(), 'm_Group': {'m_Id': ''}, 'm_Name': name,
             'm_DrawState': {'m_Expanded': True, 'm_Position': {'serializedVersion': '2', 'x': self._pos[0], 'y': self._pos[1], 'width': 200.0, 'height': 120.0}},
             'm_Slots': [{'m_Id': s['m_ObjectId']} for s in slots], 'synonyms': [], 'm_Precision': 0, 'm_PreviewExpanded': False, 'm_DismissedVersion': 0,
             'm_PreviewMode': 0, 'm_CustomColors': {'m_SerializableColors': []}}
        for s in slots: self._add(s)
        self._add(n); self.g['m_Nodes'].append({'m_Id': n['m_ObjectId']}); return n

    def from_sample(self, name, **overrides):
        smp = sample(name); node = copy.deepcopy(smp['node']); slots = copy.deepcopy(smp['slots'])
        for s in slots: s['m_ObjectId'] = nid()
        node['m_ObjectId'] = nid(); node['m_Group'] = {'m_Id': ''}
        node['m_Slots'] = [{'m_Id': s['m_ObjectId']} for s in slots]
        node.update(overrides)
        for s in slots: self._add(s)
        self._add(node); self.g['m_Nodes'].append({'m_Id': node['m_ObjectId']})
        node['_slots'] = {s['m_DisplayName']: s['m_Id'] for s in slots}   # temp: slot-name lookup, stripped on write
        return node

    def prop_node(self, prop):
        ptype = prop['m_Type'].split('.')[-1]
        if ptype == 'Vector1ShaderProperty': st, sv = 'Vector1MaterialSlot', {'m_Value': 0.0, 'm_DefaultValue': 0.0}
        elif ptype == 'ColorShaderProperty': st, sv = 'Vector4MaterialSlot', {'m_Value': {'x': 0, 'y': 0, 'z': 0, 'w': 0}, 'm_DefaultValue': {'x': 0, 'y': 0, 'z': 0, 'w': 0}}
        elif ptype == 'Texture2DShaderProperty': st, sv = 'Texture2DMaterialSlot', {}
        else: raise ValueError(ptype)
        slot = {'m_SGVersion': 0, 'm_Type': 'UnityEditor.ShaderGraph.' + st, 'm_ObjectId': nid(), 'm_Id': 0, 'm_DisplayName': prop['m_Name'], 'm_SlotType': 1, 'm_Hidden': False,
                'm_HideConnector': False, 'm_ShaderOutputName': 'Out', 'm_StageCapability': 3, 'm_Labels': []}
        slot.update(sv)
        if ptype == 'Vector1ShaderProperty': slot['m_LiteralMode'] = False
        n = self._node_base('UnityEditor.ShaderGraph.PropertyNode', 'Property', [slot])
        n.update({'m_PreviewExpanded': True, 'm_Property': {'m_Id': prop['m_ObjectId']}}); return n

    def custom_function(self, name, body, inputs, outputs):
        """inputs/outputs: list of (name, kind) with kind in float|vec2|vec3|vec4. Slot ids: inputs 0.., outputs after."""
        def slot(i, nm, kind, out):
            base = {'m_SGVersion': 0, 'm_ObjectId': nid(), 'm_Id': i, 'm_DisplayName': nm, 'm_SlotType': 1 if out else 0, 'm_Hidden': False, 'm_ShaderOutputName': nm,
                    'm_StageCapability': 3, 'm_Labels': []}
            if kind == 'float': base.update({'m_Type': 'UnityEditor.ShaderGraph.Vector1MaterialSlot', 'm_Value': 0.0, 'm_DefaultValue': 0.0})
            elif kind == 'vec2': base.update({'m_Type': 'UnityEditor.ShaderGraph.Vector2MaterialSlot', 'm_Value': {'x': 0, 'y': 0}, 'm_DefaultValue': {'x': 0, 'y': 0}})
            elif kind == 'vec3': base.update({'m_Type': 'UnityEditor.ShaderGraph.Vector3MaterialSlot', 'm_Value': {'x': 0, 'y': 0, 'z': 0}, 'm_DefaultValue': {'x': 0, 'y': 0, 'z': 0}})
            else: base.update({'m_Type': 'UnityEditor.ShaderGraph.Vector4MaterialSlot', 'm_Value': {'x': 0, 'y': 0, 'z': 0, 'w': 0}, 'm_DefaultValue': {'x': 0, 'y': 0, 'z': 0, 'w': 0}})
            return base
        slots = []; ids = {}
        for nm, k in inputs: ids[nm] = len(slots); slots.append(slot(len(slots), nm, k, False))
        for nm, k in outputs: ids[nm] = len(slots); slots.append(slot(len(slots), nm, k, True))
        n = self._node_base('UnityEditor.ShaderGraph.CustomFunctionNode', name + ' (Custom Function)', slots, version=1)
        n.update({'synonyms': ['code', 'HLSL'], 'm_SourceType': 1, 'm_FunctionName': name, 'm_FunctionSource': '', 'm_FunctionBody': body})
        n['_slots'] = ids; return n

    # ---- edges ----------------------------------------------------------------------------------------------------------------------------------
    def edge(self, a, a_slot, b, b_slot):
        def sid(n, s): return n['_slots'][s] if isinstance(s, str) else s
        def nodeid(n): return n['m_ObjectId']
        self.g['m_Edges'].append({'m_OutputSlot': {'m_Node': {'m_Id': nodeid(a)}, 'm_SlotId': sid(a, a_slot)}, 'm_InputSlot': {'m_Node': {'m_Id': nodeid(b)}, 'm_SlotId': sid(b, b_slot)}})

    def block(self, desc):
        b = self.blocks[desc]; b['_slots'] = {'in': 0}; return b

    def write(self, path):
        out = []
        for o in self.objs:
            o = {k: v for k, v in o.items() if k != '_slots'}; out.append(o)
        dump_multi(out, path)
