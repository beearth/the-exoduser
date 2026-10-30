"""첫 실물 검수의 원인 수정: 주간 비례·알파 중첩·지면 재질 경계·거품 띠."""
import bpy,math,sys
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3')
bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_스캔재제작.blend'));S=bpy.context.scene
S.cycles.transparent_max_bounces=96;S.cycles.max_bounces=10;S.cycles.volume_bounces=2
for name in ['RF3_Ancient_Tree_A','RF3_Ancient_Tree_B']:
 for suff in ['', '_High']:
  o=bpy.data.objects[name+suff]
  for v in o.data.vertices:
   z=v.co.z
   if z>1.7:
    gain=1+2.9*min(1,(z-1.7)/1.5);v.co.x*=gain;v.co.y*=gain
  o.data.update()
for m in bpy.data.materials:
 if not m.use_nodes:continue
 if m.name in ['tree_stump_02','dead_tree_trunk_02','dry_branches_medium_01']:
  for n in m.node_tree.nodes:
   if n.type=='MIX_RGB'and n.blend_type=='MULTIPLY'and not n.inputs[2].is_linked:n.inputs[2].default_value=(.46,.35,.24,1)
 if m.name=='moss_01':
  for n in m.node_tree.nodes:
   if n.type=='HUE_SAT':n.inputs['Value'].default_value=1.0;n.inputs['Saturation'].default_value=.38
   if n.type=='MIX_RGB'and not n.inputs[2].is_linked:n.inputs[2].default_value=(.72,.73,.45,1)
def tex(n,l,p,coords,non=False):
 t=n.new('ShaderNodeTexImage');t.image=bpy.data.images.load(str(p),check_existing=True);t.projection='BOX';t.projection_blend=.25
 if non:t.image.colorspace_settings.name='Non-Color'
 l.new(coords,t.inputs[0]);return t
terrain=bpy.data.objects['RF3_Continuous_Bank_Terrain'];m=bpy.data.materials.new('분층_연속혼합_젖은흙낙엽이끼');m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED');g=n.new('ShaderNodeNewGeometry');sc=n.new('ShaderNodeVectorMath');sc.operation='SCALE';sc.inputs[3].default_value=.30;l.new(g.outputs['Position'],sc.inputs[0]);cols=[];hs=[];rs=[]
for id in ['mud_forest','brown_mud_leaves_01','forest_leaves_02']:
 cols.append(tex(n,l,next((R/'pbr-source').glob(id+'_Diffuse.*')),sc.outputs[0]).outputs[0]);hs.append(tex(n,l,next((R/'pbr-source').glob(id+'_Displacement.*')),sc.outputs[0],True).outputs[0]);rs.append(tex(n,l,next((R/'pbr-source').glob(id+'_Rough.*')),sc.outputs[0],True).outputs[0])
noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=.25;noise.inputs['Detail'].default_value=1.3;l.new(g.outputs['Position'],noise.inputs[0]);ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.35;ramp.color_ramp.elements[1].position=.68;l.new(noise.outputs['Fac'],ramp.inputs[0]);sep=n.new('ShaderNodeSeparateXYZ');l.new(g.outputs['Position'],sep.inputs[0]);ab=n.new('ShaderNodeMath');ab.operation='ABSOLUTE';l.new(sep.outputs['X'],ab.inputs[0]);path=n.new('ShaderNodeMapRange');path.interpolation_type='SMOOTHERSTEP';path.inputs['From Min'].default_value=2.3;path.inputs['From Max'].default_value=5.5;l.new(ab.outputs[0],path.inputs[0])
def mix3(v):
 a=n.new('ShaderNodeMixRGB');l.new(ramp.outputs[0],a.inputs[0]);l.new(v[1],a.inputs[1]);l.new(v[2],a.inputs[2]);b=n.new('ShaderNodeMixRGB');l.new(path.outputs[0],b.inputs[0]);l.new(v[0],b.inputs[1]);l.new(a.outputs[0],b.inputs[2]);return b.outputs[0]
col=mix3(cols);h=n.new('ShaderNodeHueSaturation');h.inputs['Saturation'].default_value=.65;h.inputs['Value'].default_value=.60;l.new(col,h.inputs['Color']);l.new(h.outputs[0],bs.inputs['Base Color']);l.new(mix3(rs),bs.inputs['Roughness']);b=n.new('ShaderNodeBump');b.inputs['Strength'].default_value=.28;b.inputs['Distance'].default_value=.13;l.new(mix3(hs),b.inputs['Height']);l.new(b.outputs[0],bs.inputs['Normal']);terrain.data.materials.clear();terrain.data.materials.append(m)
for f in terrain.data.polygons:f.material_index=0
# 좁은 반복 사각형 대신 넓이가 천천히 변하는 불규칙 scum 연속막.
old=bpy.data.objects.get('검수_강가거품띠')
if old:bpy.data.objects.remove(old,do_unlink=True)
foam=bpy.data.materials.new('독액가장자리_연속부패거품');foam.use_nodes=True;n=foam.node_tree.nodes;l=foam.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=(.14,.15,.057,1);bs.inputs['Roughness'].default_value=.7;g=n.new('ShaderNodeNewGeometry');noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=3;noise.inputs['Detail'].default_value=1;l.new(g.outputs['Position'],noise.inputs[0]);r=n.new('ShaderNodeValToRGB');r.color_ramp.elements[0].position=.40;r.color_ramp.elements[1].position=.62;l.new(noise.outputs['Fac'],r.inputs[0]);l.new(r.outputs[0],bs.inputs['Alpha'])
vs=[];fs=[]
for sign in [-1,1]:
 for j in range(240):
  x=-25+j*.22;y=5.8+.5*math.sin(x*.4)if sign>0 else -6+.5*math.sin(x*.35);y+=sign*(-.86+.16*math.sin(x*1.2));w=.10+.22*(.5+.5*math.sin(x*1.4));vs.extend([(x,y,-.063),(x,y+sign*w,-.062)])
 for j in range(239):a=(0 if sign<0 else 480)+j*2;fs.append((a,a+1,a+3,a+2))
me=bpy.data.meshes.new('검수_연속거품');me.from_pydata(vs,[],fs);me.materials.append(foam);o=bpy.data.objects.new(me.name,me);S.collection.objects.link(o)
water=bpy.data.materials['독액_기준대리물_비납품'];n=water.node_tree.nodes;l=water.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED');bs.inputs['Roughness'].default_value=.38
for q in n:
 if q.type=='VALTORGB':q.color_ramp.elements[0].color=(.045,.053,.012,1);q.color_ramp.elements[1].color=(.085,.094,.024,1)
 if q.type=='BUMP':q.inputs['Strength'].default_value=.045
 if q.type=='TEX_NOISE':q.inputs['Scale'].default_value=115
for o in S.objects:
 if o.type=='LIGHT'and '빛기둥'in o.name:o.data.energy=70000;o.data.spot_size=.17
S.cycles.samples=24;S.render.resolution_percentage=65
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_수정1.blend'));S.render.filepath=str(R/'renders/승인구도_수정1.png');bpy.ops.render.render(write_still=True)
print('비례·투명중첩·연속혼합 수정 렌더 완료',flush=True)
