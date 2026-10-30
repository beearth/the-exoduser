"""알파 외곽 안쪽의 연속된 이끼 질량을 실제 high→low PBR로 베이크."""
import bpy,bmesh,math,json
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');D=R/'source/이끼섬유베이크';D.mkdir(exist_ok=True);bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;visibility={o.name:(o.hide_render,o.hide_get())for o in S.objects}
for o in S.objects:o.hide_render=True;o.hide_set(True)
vs=[];fs=[];V=18;U=6
for j in range(70):
 bx=(j/69-.5)*1.35+.04*math.sin(j*1.9);by=.27*math.sin(j*2.39);length=1.12+.61*(.5+.5*math.sin(j*1.7));top=2.30+.12*math.sin(j*2);base=len(vs)
 for k in range(V+1):
  t=k/V;cx=bx+.075*math.sin(t*5+j)*t;cy=by+.065*math.sin(t*4+j*1.3)*t;cz=top-length*t;rad=(.013+.012*(.5+.5*math.sin(j*1.1)))*(1-.88*t)*(.85+.15*math.sin(k*2.2+j))
  for i in range(U):
   ang=math.tau*i/U+j*.6+t*4;vs.append((cx+rad*math.cos(ang),cy+rad*math.sin(ang),cz))
 for k in range(V):
  for i in range(U):a=base+k*U+i;b=base+k*U+(i+1)%U;fs.append((a,b,b+U,a+U))
 fs.append(tuple(base+i for i in range(U-1,-1,-1)));fs.append(tuple(base+V*U+i for i in range(U)))
me=bpy.data.meshes.new('이끼_연속질량');me.from_pydata(vs,[],fs);me.update();low=bpy.data.objects.new('MOSS_FIBER_LO',me);S.collection.objects.link(low);bm=bmesh.new();bm.from_mesh(me);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));assert abs(bm.calc_volume(signed=True))>.01;bm.to_mesh(me);bm.free()
for f in me.polygons:f.use_smooth=True
def select(obs,active):
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active
select([low],low);me.uv_layers.new(name='UVMap');bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.1,island_margin=.012);bpy.ops.object.mode_set(mode='OBJECT')
m=bpy.data.materials.new('이끼질량_CC0표면');m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED');ge=n.new('ShaderNodeTexCoord');sc=n.new('ShaderNodeVectorMath');sc.operation='SCALE';sc.inputs[3].default_value=.75;l.new(ge.outputs['Object'],sc.inputs[0]);tx=n.new('ShaderNodeTexImage');tx.image=bpy.data.images.load(str(R/'source/이끼표면_Diffuse.png'));tx.projection='BOX';tx.projection_blend=.3;l.new(sc.outputs[0],tx.inputs[0]);h=n.new('ShaderNodeHueSaturation');h.inputs['Saturation'].default_value=.12;h.inputs['Value'].default_value=.90;l.new(tx.outputs[0],h.inputs['Color']);mul=n.new('ShaderNodeMixRGB');mul.blend_type='MULTIPLY';mul.inputs[0].default_value=1;mul.inputs[2].default_value=(.85,.80,.62,1);l.new(h.outputs[0],mul.inputs[1]);l.new(mul.outputs[0],bs.inputs['Base Color']);bs.inputs['Roughness'].default_value=.98;bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.15;bump.inputs['Distance'].default_value=.035;l.new(tx.outputs[0],bump.inputs['Height']);l.new(bump.outputs[0],bs.inputs['Normal']);me.materials.append(m)
high=low.copy();high.data=low.data.copy();high.name='MOSS_FIBER_HIGH';S.collection.objects.link(high);select([high],high);sub=high.modifiers.new('곡면보존_하이','SUBSURF');sub.subdivision_type='SIMPLE';sub.levels=2;bpy.ops.object.modifier_apply(modifier=sub.name);target=bpy.data.materials.new('이끼코어_베이크표적');target.use_nodes=True;me.materials.clear();me.materials.append(target);bak=S.render.bake;bak.use_selected_to_active=True;bak.normal_space='TANGENT';bak.normal_r='POS_X';bak.normal_g='POS_Y';bak.normal_b='POS_Z';bak.cage_extrusion=.025;bak.max_ray_distance=.1;bak.margin=12
for kind in ['Normal','AO','Curvature','BaseColor','Roughness','Metallic']:
 im=bpy.data.images.new('MossFiber_'+kind,width=1024,height=1024,alpha=True);im.colorspace_settings.name='sRGB'if kind=='BaseColor'else'Non-Color';tex=target.node_tree.nodes.new('ShaderNodeTexImage');tex.image=im;target.node_tree.nodes.active=tex
 if kind not in ['Normal','AO']:
  out=next(q for q in n if q.type=='OUTPUT_MATERIAL');em=n.new('ShaderNodeEmission');em.name='코어임시'
  if kind=='Curvature':g=n.new('ShaderNodeNewGeometry');g.name='코어임시곡률';l.new(g.outputs['Pointiness'],em.inputs[0])
  else:
   so=bs.inputs['Base Color'if kind=='BaseColor'else kind]
   if so.is_linked:l.new(so.links[0].from_socket,em.inputs[0])
   else:em.inputs[0].default_value=so.default_value if kind=='BaseColor'else(*([so.default_value]*3),1)
  l.new(em.outputs[0],out.inputs['Surface'])
 select([high,low],low);high.hide_render=False;low.hide_render=False;S.cycles.samples=12 if kind=='AO'else 1;bpy.ops.object.bake(type='NORMAL'if kind=='Normal'else'AO'if kind=='AO'else'EMIT');im.filepath_raw=str(D/(kind+'.png'));im.file_format='PNG';im.save();target.node_tree.nodes.remove(tex)
 out=next(q for q in n if q.type=='OUTPUT_MATERIAL');l.new(bs.outputs[0],out.inputs['Surface'])
 for q in list(n):
  if q.name.startswith('코어임시'):n.remove(q)
 print('분리된 이끼 섬유 베이크',kind,flush=True)
for name,(render,hide)in visibility.items():
 o=bpy.data.objects.get(name)
 if o:o.hide_render=render;o.hide_set(hide)
for o in [low,high]:o.hide_render=True;o.hide_set(True)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/이끼섬유_베이크.blend'))
