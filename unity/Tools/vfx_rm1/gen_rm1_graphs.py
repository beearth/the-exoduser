#!/usr/bin/env python3
"""RM-1 VFX Shader Graphs: SG_GroundDecal, SG_VfxSoftAlpha, SG_ToxicBubble.

Usage: python gen_rm1_graphs.py <PackageCache shadergraph dir> <output dir>
Unit conventions (the C# bridge follows them): lengths in world metres (Core px / 100), angles in radians, `_SizeX/_SizeY` = decal box size in metres.
Decal local axes: +X = forward (cone / line direction), origin = box centre. Colour properties are authored as sRGB hex (Unity converts them for the Linear project).
"""
import os, sys
from sg_builder import Graph, nid

HEX = lambda h: ((h >> 16 & 255) / 255, (h >> 8 & 255) / 255, (h & 255) / 255, 1.0)

# ---- SG_GroundDecal -------------------------------------------------------------------------------------------------------------------------------
DECAL_BODY = r'''
float2 p = (UV.xy - 0.5) * float2(SizeX, SizeY);
float r = length(p);
float ang = atan2(p.y, p.x);
int s = (int)(Shape + 0.5);
float d = 1000.0;
float maxIn = 1.0;
float gapDist = 1000.0;
float grown = max(Length * Grow, 0.0);
if (s == 0) { d = Radius - r; maxIn = Radius; }
else if (s == 1) { float halfA = Angle * 0.5; d = min(Radius - r, r * (halfA - abs(ang))); maxIn = Radius * 0.5; }
else if (s == 2) { d = min(min(p.x, grown - p.x), Radius - abs(p.y)); maxIn = Radius; }
else if (s == 3)
{
    float da = abs(atan2(sin(ang - GapAngle), cos(ang - GapAngle)));
    gapDist = (da - GapWidth * 0.5) * r;
    d = min(Radius - r, r - Inner);
    maxIn = (Radius - Inner) * 0.5;
}
float aa = max(fwidth(d), 1e-4);
float gaa = max(fwidth(gapDist), 1e-4);
float ew = 0.045;
float inside = smoothstep(0.0, aa, d);
float gapOpen = (s == 3) ? smoothstep(0.0, gaa, gapDist) : 1.0;
float edge = inside * (1.0 - smoothstep(ew, ew + aa, d)) * gapOpen;
float depth = maxIn * saturate(Progress);
float fillM = inside * (1.0 - smoothstep(depth, depth + max(aa, 0.03), d)) * gapOpen;
float hair = 0.0;
if (s == 4) { edge = 0.0; fillM = saturate(Danger); }
if (s == 3)
{
    float band = smoothstep(0.0, aa, Radius - r) * smoothstep(0.0, aa, r - Inner);
    float lineM = (1.0 - smoothstep(0.012, 0.012 + gaa, abs(gapDist))) * band;
    float arc = (1.0 - smoothstep(0.012, 0.012 + aa, abs(Radius - r))) * (1.0 - gapOpen);
    hair = saturate(lineM + arc);
}
float fillA = lerp(0.18, 0.42, saturate(Progress));
float we = edge * 0.9;
float wf = fillM * fillA * (1.0 - edge);
float wh = hair * 0.35;
float a = saturate(we + wf + wh);
float3 edgeCol = lerp(EdgeColor, FlashColor, saturate(Flash));
Color = (edgeCol * we + FillColor * wf + HairColor * wh) / max(a, 1e-4);
float peak = max(max(FlashColor.r, FlashColor.g), FlashColor.b);
Emission = (edgeCol * we + HairColor * wh) * EdgeGlow + FlashColor * (1.3 / max(peak, 1e-4)) * saturate(Flash) * edge;   // border + hairline are self-lit: they must read under any scene light
Alpha = a;
'''


def add_emission_block(g):
    slot = {'m_SGVersion': 0, 'm_Type': 'UnityEditor.ShaderGraph.ColorRGBMaterialSlot', 'm_ObjectId': nid(), 'm_Id': 0, 'm_DisplayName': 'Emission', 'm_SlotType': 0,
            'm_Hidden': False, 'm_ShaderOutputName': 'Emission', 'm_StageCapability': 2, 'm_Value': {'x': 0, 'y': 0, 'z': 0}, 'm_DefaultValue': {'x': 0, 'y': 0, 'z': 0},
            'm_Labels': [], 'm_ColorMode': 1, 'm_DefaultColor': {'r': 0, 'g': 0, 'b': 0, 'a': 1}}
    g._add(slot)
    blk = {'m_SGVersion': 0, 'm_Type': 'UnityEditor.ShaderGraph.BlockNode', 'm_ObjectId': nid(), 'm_Group': {'m_Id': ''}, 'm_Name': 'SurfaceDescription.Emission',
           'm_DrawState': {'m_Expanded': True, 'm_Position': {'serializedVersion': '2', 'x': 0.0, 'y': 0.0, 'width': 0.0, 'height': 0.0}}, 'm_Slots': [{'m_Id': slot['m_ObjectId']}],
           'synonyms': [], 'm_Precision': 0, 'm_PreviewExpanded': True, 'm_DismissedVersion': 0, 'm_PreviewMode': 0, 'm_CustomColors': {'m_SerializableColors': []},
           'm_SerializedDescriptor': 'SurfaceDescription.Emission'}
    g._add(blk); g.g['m_FragmentContext']['m_Blocks'].append({'m_Id': blk['m_ObjectId']}); g.g['m_Nodes'].append({'m_Id': blk['m_ObjectId']})
    g.blocks['SurfaceDescription.Emission'] = blk


def ground_decal(tpl_dir):
    g = Graph(os.path.join(tpl_dir, 'GraphTemplates', 'Cross Pipeline', '0_Decal Simple.shadergraph'))
    g.strip()
    sub = next(o for o in g.objs if o['m_Type'].endswith('.UniversalDecalSubTarget'))
    sub['m_DecalData'].update({'affectsAlbedo': True, 'affectsEmission': True, 'affectsNormal': False, 'affectsMAOS': False, 'angleFade': False})
    add_emission_block(g)
    floats = [('Progress', 0.0, (0.0, 1.0)), ('Shape', 0.0, None), ('Radius', 1.0, None), ('Angle', 1.0, None), ('Length', 2.0, None), ('Grow', 1.0, (0.0, 1.0)), ('Inner', 0.5, None),
              ('GapAngle', 0.0, None), ('GapWidth', 0.6, None), ('SizeX', 4.0, None), ('SizeY', 4.0, None), ('Flash', 0.0, (0.0, 1.0)), ('EdgeGlow', 0.9, (0.0, 1.0))]
    props = {n: g.prop_float(n, v, rng) for n, v, rng in floats}
    cols = {'EdgeColor': g.prop_color('EdgeColor', HEX(0xc8402a)), 'FlashColor': g.prop_color('FlashColor', HEX(0xe8a080)),
            'FillColor': g.prop_color('FillColor', HEX(0x3a3612)),      # map toxic hue 40~65 deg, value <= 0.25 (art bible D5)
            'HairColor': g.prop_color('HairColor', HEX(0xdfd6c2))}
    mask = g.prop_texture('SafeMask')                                    # shape 4: R = danger (1) / safe (0); default white = everything dangerous
    cf_in = [('UV', 'vec2')] + [(n, 'float') for n, _, _ in floats] + [('Danger', 'float'), ('EdgeColor', 'vec3'), ('FlashColor', 'vec3'), ('FillColor', 'vec3'), ('HairColor', 'vec3')]
    cf = g.custom_function('GroundDecalShape', DECAL_BODY, cf_in, [('Color', 'vec3'), ('Emission', 'vec3'), ('Alpha', 'float')])
    uv = g.from_sample('UVNode')
    g.edge(uv, 0, cf, 'UV')
    for n in props: g.edge(g.prop_node(props[n]), 0, cf, n)
    for n in cols: g.edge(g.prop_node(cols[n]), 0, cf, n)
    smp = g.from_sample('SampleTexture2DNode')
    g.edge(g.prop_node(mask), 0, smp, 'Texture')
    g.edge(smp, 'R', cf, 'Danger')
    g.edge(cf, 'Color', g.block('SurfaceDescription.BaseColor'), 0)
    g.edge(cf, 'Emission', g.block('SurfaceDescription.Emission'), 0)
    g.edge(cf, 'Alpha', g.block('SurfaceDescription.Alpha'), 0)
    return g


# ---- SG_VfxSoftAlpha ------------------------------------------------------------------------------------------------------------------------------
SOFT_BODY = r'''
float rawD = SceneRaw;
float lin01 = rawD;
#if UNITY_REVERSED_Z
lin01 = 1.0 - rawD;
#endif
float sceneEye = (unity_OrthoParams.w > 0.5) ? lerp(_ProjectionParams.y, _ProjectionParams.z, lin01) : LinearEyeDepth(rawD, _ZBufferParams);
float fragEye = -TransformWorldToView(PosWS).z;
float fade = saturate((sceneEye - fragEye) / max(Dist, 1e-4));
AlphaOut = AlphaIn * fade;
'''


def soft_alpha(tpl_dir):
    g = Graph(os.path.join(tpl_dir, 'GraphTemplates', 'Cross Pipeline', '0_Particle Unlit.shadergraph'))
    t = g.by[[o['m_ObjectId'] for o in g.objs if o['m_Type'].endswith('.UniversalTarget')][0]]
    t.update({'m_SurfaceType': 1, 'm_AlphaMode': 0, 'm_ZWriteControl': 2, 'm_SupportVFX': True, 'm_RenderFace': 0})   # alpha blend, no depth write
    alpha_blk = g.block('SurfaceDescription.Alpha')
    old = [e for e in g.g['m_Edges'] if e['m_InputSlot']['m_Node']['m_Id'] == alpha_blk['m_ObjectId']]
    assert len(old) == 1, 'template Alpha block should have exactly one feeder'
    old = old[0]; g.g['m_Edges'].remove(old)
    dist = g.prop_float('SoftDistance', 0.5)
    cf = g.custom_function('VfxDepthFade', SOFT_BODY, [('AlphaIn', 'float'), ('PosWS', 'vec3'), ('SceneRaw', 'float'), ('Dist', 'float')], [('AlphaOut', 'float')])
    g.g['m_Edges'].append({'m_OutputSlot': old['m_OutputSlot'], 'm_InputSlot': {'m_Node': {'m_Id': cf['m_ObjectId']}, 'm_SlotId': cf['_slots']['AlphaIn']}})
    pos = g.from_sample('PositionNode', m_Space=2)
    sd = g.from_sample('SceneDepthNode', m_DepthSamplingMode=1)
    g.edge(pos, 0, cf, 'PosWS'); g.edge(sd, 'Out', cf, 'SceneRaw'); g.edge(g.prop_node(dist), 0, cf, 'Dist')
    g.edge(cf, 'AlphaOut', alpha_blk, 0)
    return g


# ---- SG_ToxicBubble -------------------------------------------------------------------------------------------------------------------------------
BUBBLE_VERT = r'''
float wob = 1.0 + Wobble * sin(Phase * 6.2831853 + dot(PosOS, float3(7.1, 5.3, 3.7)));
PosOut = PosOS + NormalOS * (Inflate * wob);
'''
BUBBLE_FRAG = r'''
float ndv = saturate(abs(dot(normalize(NormalWS), normalize(ViewWS))));
float fres = pow(1.0 - ndv, FresnelPower);
float thin = saturate(Thin);
float film = fres * (1.0 - 0.6 * thin);
float3 tint = lerp(Rim, Base, ndv * 0.6);
float burst = saturate(Burst);
Color = tint * (1.0 + burst * HdrPop) + Rim * film * 0.35;
Alpha = saturate((0.10 + film * 0.55) * (1.0 - 0.7 * thin) + burst * 0.25);
'''


def toxic_bubble(tpl_dir):
    g = Graph(os.path.join(tpl_dir, 'GraphTemplates', 'Cross Pipeline', '0_Particle Unlit.shadergraph'))
    t = g.by[[o['m_ObjectId'] for o in g.objs if o['m_Type'].endswith('.UniversalTarget')][0]]
    t.update({'m_SurfaceType': 1, 'm_AlphaMode': 0, 'm_ZWriteControl': 2, 'm_SupportVFX': False, 'm_RenderFace': 0, 'm_AllowMaterialOverride': False})
    g.strip()
    inflate = g.prop_float('Inflate', 0.0, None, per_renderer=True)      # 0..size, the burst-grow value written per bubble
    wobble = g.prop_float('Wobble', 0.08)
    phase = g.prop_float('Phase', 0.0, (0.0, 1.0), per_renderer=True)
    thin = g.prop_float('Thin', 0.0, (0.0, 1.0), per_renderer=True)     # 1 = about to burst
    burst = g.prop_float('Burst', 0.0, (0.0, 1.0), per_renderer=True)   # the 0.08 s of the pop
    fpow = g.prop_float('FresnelPower', 3.0)
    hdrp = g.prop_float('HdrPop', 0.6)
    rim = g.prop_color('Rim', HEX(0x8f8a3a))      # map toxic (art bible D5, hue 40~65 deg), low saturation / value
    base = g.prop_color('Base', HEX(0x2e2c12))
    vert = g.custom_function('BubbleInflate', BUBBLE_VERT, [('PosOS', 'vec3'), ('NormalOS', 'vec3'), ('Inflate', 'float'), ('Wobble', 'float'), ('Phase', 'float')], [('PosOut', 'vec3')])
    pos = g.from_sample('PositionNode', m_Space=0)
    nrm = g.from_sample('NormalVectorNode', m_Space=0)
    g.edge(pos, 0, vert, 'PosOS'); g.edge(nrm, 0, vert, 'NormalOS')
    for nm, pr in (('Inflate', inflate), ('Wobble', wobble), ('Phase', phase)): g.edge(g.prop_node(pr), 0, vert, nm)
    g.edge(vert, 'PosOut', g.block('VertexDescription.Position'), 0)
    frag = g.custom_function('BubbleFilm', BUBBLE_FRAG, [('NormalWS', 'vec3'), ('ViewWS', 'vec3'), ('Thin', 'float'), ('Burst', 'float'), ('FresnelPower', 'float'), ('HdrPop', 'float'),
                                                         ('Rim', 'vec3'), ('Base', 'vec3')], [('Color', 'vec3'), ('Alpha', 'float')])
    nw = g.from_sample('NormalVectorNode', m_Space=2)
    vw = g.from_sample('ViewDirectionNode', m_Space=2)
    g.edge(nw, 0, frag, 'NormalWS'); g.edge(vw, 0, frag, 'ViewWS')
    for nm, pr in (('Thin', thin), ('Burst', burst), ('FresnelPower', fpow), ('HdrPop', hdrp), ('Rim', rim), ('Base', base)): g.edge(g.prop_node(pr), 0, frag, nm)
    g.edge(frag, 'Color', g.block('SurfaceDescription.BaseColor'), 0)
    g.edge(frag, 'Alpha', g.block('SurfaceDescription.Alpha'), 0)
    return g


GRAPHS = {'SG_GroundDecal': ground_decal, 'SG_VfxSoftAlpha': soft_alpha, 'SG_ToxicBubble': toxic_bubble}

if __name__ == '__main__':
    tpl_dir, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    for name, fn in GRAPHS.items():
        g = fn(tpl_dir); g.g['m_Path'] = 'Exoduser/RM1'     # shader names become Exoduser/RM1/<file>
        g.write(os.path.join(out_dir, name + '.shadergraph')); print('wrote', name)
