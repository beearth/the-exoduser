"""Owned Shader Graphs; use Unity's existing imported Lit graph as a structural template.
No source art or existing material is changed. Run once before Unity import.
"""
from pathlib import Path
import sys, hashlib, json
root=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(root/'Tools/vfx_rm1'))
from sg_builder import Graph,load_multi,dump_multi,nid
from gen_rm1_graphs import add_emission_block
out=root/'Assets/Exoduser/Resources/VFX/Impact'
def meta(p):
    m=Path(str(p)+'.meta')
    if not m.exists():m.write_text('fileFormatVersion: 2\nguid: '+hashlib.md5(('impact-remaster:'+str(p.relative_to(root))).encode()).hexdigest()+'\n',encoding='utf-8')
g=Graph(str(root/'Assets/Exoduser/Art/Characters/Shaders/HeroIronContrast.shadergraph'))
g.strip();g.g['m_Path']='Exoduser/Impact'
g.set_target(m_SurfaceType=0,m_AlphaMode=0,m_ZWriteControl=0,m_SupportVFX=False,m_RenderFace=0,m_AllowMaterialOverride=False)
if 'SurfaceDescription.Emission' not in g.blocks:add_emission_block(g)
base=g.prop_color('Base',(0.18,0.14,0.11,1))
edge=g.prop_color('Edge',(0.55,0.48,0.35,1))
glow=g.prop_float('Glow',0,(0,2))
phase=g.prop_float('Phase',0)
body='''
float veins = pow(saturate(0.5 + 0.5 * sin(Pos.x * 29.0 + sin(Pos.y * 37.0 + Pos.z * 19.0) * 2.3)), 18.0);
float grain = 0.75 + 0.25 * sin(dot(Pos, float3(83.0,67.0,71.0)));
Color = lerp(Base * grain, Edge, veins * 0.35);
Emission = Edge * veins * Glow * (0.7 + 0.3 * sin(Phase * 7.0));
'''
cf=g.custom_function('VeinedMaterial',body,[('Pos','vec3'),('Base','vec3'),('Edge','vec3'),('Glow','float'),('Phase','float')],[('Color','vec3'),('Emission','vec3')])
pos=g.from_sample('PositionNode',m_Space=0);g.edge(pos,0,cf,'Pos')
for name,p in [('Base',base),('Edge',edge),('Glow',glow),('Phase',phase)]:g.edge(g.prop_node(p),0,cf,name)
g.edge(cf,'Color',g.block('SurfaceDescription.BaseColor'),0);g.edge(cf,'Emission',g.block('SurfaceDescription.Emission'),0)
# Existing Lit blocks retain physically lit normals, smoothness .35 and nonmetal surface.
for name,val in [('SurfaceDescription.Metallic',0),('SurfaceDescription.Smoothness',.35),('SurfaceDescription.Alpha',1)]:
    if name in g.blocks:
        slot=g.by[g.blocks[name]['m_Slots'][0]['m_Id']];slot['m_Value']=slot['m_DefaultValue']=val
p=out/'SG_SkillMatter.shadergraph';g.write(str(p));meta(p)
objs=load_multi(str(out/'SG_ImpactScorch.shadergraph'))
objs[0]['m_Path']='Exoduser/Impact'
fn=next(o for o in objs if o.get('m_FunctionBody') and 'float soot' in o['m_FunctionBody'])
fn['m_FunctionName']='SkillGround'
fn['m_FunctionBody']='''
float2 p = (UV.xy - 0.5) * float2(SizeX, SizeY);
float r = length(p);
float a = atan2(p.y,p.x);
float grain = saturate(0.5 + 0.3 * sin(p.x * 23.0 + sin(p.y * 31.0)) + 0.2 * sin(p.y * 47.0));
float rough = Radius * (0.985 + 0.015 * sin(a * 19.0));
float aa = max(fwidth(r),0.006);
float inside = 1.0 - smoothstep(rough-aa,rough+aa,r);
float rim = (1.0-smoothstep(0.012,0.028,abs(r-rough))) * smoothstep(0.25,0.6,grain);
Color = lerp(FillColor,EdgeColor,rim);
Emission = EdgeColor * rim * EdgeGlow;
Alpha = saturate((inside * grain * 0.2 + rim * 0.35) * Progress);
'''
p=out/'SG_SkillGround.shadergraph';dump_multi(objs,str(p));meta(p)
# The legacy boss arena is an XY sprite plane. DecalProjector cannot draw on its
# sprite floor, so the same restrained floor language gets a transparent Lit quad.
g=Graph(str(root/'Assets/Exoduser/Art/Characters/Shaders/HeroIronContrast.shadergraph'))
g.strip();g.g['m_Path']='Exoduser/Impact'
g.set_target(m_SurfaceType=1,m_AlphaMode=0,m_ZWriteControl=2,m_SupportVFX=False,m_RenderFace=0,m_AllowMaterialOverride=False)
if 'SurfaceDescription.Emission' not in g.blocks:add_emission_block(g)
fill=g.prop_color('FillColor',(.1,.08,.06,1));edge=g.prop_color('EdgeColor',(.3,.25,.18,1));glow=g.prop_float('EdgeGlow',0);fade=g.prop_float('Fade',.2)
if 'SurfaceDescription.Alpha' not in g.blocks:
    import copy
    src=Graph(str(root/'Assets/Exoduser/VFX/RM1/ShaderGraph/SG_ToxicBubble.shadergraph'))
    blk=copy.deepcopy(src.blocks['SurfaceDescription.Alpha']);slot=copy.deepcopy(src.by[blk['m_Slots'][0]['m_Id']])
    blk['m_ObjectId']=nid();slot['m_ObjectId']=nid();blk['m_Slots']=[{'m_Id':slot['m_ObjectId']}]
    g._add(slot);g._add(blk);g.g['m_FragmentContext']['m_Blocks'].append({'m_Id':blk['m_ObjectId']});g.g['m_Nodes'].append({'m_Id':blk['m_ObjectId']});g.blocks['SurfaceDescription.Alpha']=blk
cf=g.custom_function('SkillFloorFilm','''
float2 p = (UV-0.5)*2.0;
float r = length(p);
float grain = saturate(0.5 + 0.3*sin(p.x*23.0+sin(p.y*31.0)) + 0.2*sin(p.y*47.0));
float inside = 1.0-smoothstep(0.96,1.0,r);
float rim = (1.0-smoothstep(0.012,0.04,abs(r-0.975)))*smoothstep(0.25,0.6,grain);
Color = lerp(FillColor,EdgeColor,rim);
Emission = EdgeColor*rim*EdgeGlow;
Alpha = saturate((inside*grain*0.2+rim*0.35)*Fade);
''',[('UV','vec2'),('FillColor','vec3'),('EdgeColor','vec3'),('EdgeGlow','float'),('Fade','float')],[('Color','vec3'),('Emission','vec3'),('Alpha','float')])
uv=g.from_sample('UVNode');g.edge(uv,0,cf,'UV')
for name,p in [('FillColor',fill),('EdgeColor',edge),('EdgeGlow',glow),('Fade',fade)]:g.edge(g.prop_node(p),0,cf,name)
for name,slot in [('Color','BaseColor'),('Emission','Emission'),('Alpha','Alpha')]:g.edge(cf,name,g.block('SurfaceDescription.'+slot),0)
p=out/'SG_SkillFloor.shadergraph';g.write(str(p));meta(p)
# A separate graph asset for the sparse skill motes and debris; the proven four-system
# event topology is retained, exposed values are supplied per skill at runtime.
p=out/'VFX_SkillMatter.vfx';p.write_text((out/'VFX_ImpactBurst.vfx').read_text(encoding='utf-8').replace('VFX_ImpactBurst','VFX_SkillMatter'),encoding='utf-8');meta(p)
for name in ['SG_SkillMatter','SG_SkillGround','SG_SkillFloor']:
    p=out/(name+'.shadergraph');guid=Path(str(p)+'.meta').read_text().split('guid: ')[1].splitlines()[0]
    m=out/('M_'+name[3:]+'.mat')
    m.write_text('%YAML 1.1\n%TAG !u! tag:unity3d.com,2011:\n--- !u!21 &2100000\nMaterial:\n  serializedVersion: 8\n  m_ObjectHideFlags: 0\n  m_CorrespondingSourceObject: {fileID: 0}\n  m_PrefabInstance: {fileID: 0}\n  m_PrefabAsset: {fileID: 0}\n  m_Name: M_'+name[3:]+'\n  m_Shader: {fileID: -6465566751694194690, guid: '+guid+', type: 3}\n  m_Parent: {fileID: 0}\n  m_ModifiedSerializedProperties: 0\n  m_ValidKeywords: []\n  m_InvalidKeywords: []\n  m_LightmapFlags: 4\n  m_EnableInstancingVariants: 0\n  m_DoubleSidedGI: 0\n  m_CustomRenderQueue: -1\n  stringTagMap: {}\n  disabledShaderPasses: []\n  m_LockedProperties: \n  m_SavedProperties:\n    serializedVersion: 3\n    m_TexEnvs: []\n    m_Ints: []\n    m_Floats: []\n    m_Colors: []\n  m_BuildTextureStacks: []\n',encoding='utf-8');meta(m)
for name in ['SkillPresentation.cs','NativeSkillRemaster.cs']:
    p=root/'Assets/Exoduser/Runtime/Vfx'/name
    if p.exists():meta(p)
print('스킬 Lit Shader Graph·별도 VFX Graph 생성')
