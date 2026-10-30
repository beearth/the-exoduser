"""단순한 관형 줄기와 비교하기 위한 CC0 실물 스캔 주 줄기 시험. 기존 납품/원본은 수정하지 않는다."""
import bpy,math,json
from pathlib import Path
from mathutils import Vector,Matrix
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');src=Path('I:/EXODUSER-Storage/demo-art/map/r2/source/r2_one_mass_lod_baked.blend')
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False);S=bpy.context.scene;S.render.engine='CYCLES';S.cycles.samples=32;S.cycles.use_denoising=True;S.render.threads_mode='FIXED';S.render.threads=10
with bpy.data.libraries.load(str(src),link=False) as (a,b):b.objects=['MASS_broken_rising_trunk_scanned','MASS_rotten_foot_scanned_stump']
for j,o in enumerate(b.objects):
 S.collection.objects.link(o);bpy.context.view_layer.update();world=[o.matrix_world@v.co for v in o.data.vertices]
 dims=[max(v[k] for v in world)-min(v[k] for v in world) for k in range(3)];axis=max(range(3),key=lambda k:dims[k])
 if j==0:
  if axis==0:world=[Vector((p.y,p.z,p.x)) for p in world]
  elif axis==1:world=[Vector((p.x,p.z,p.y)) for p in world]
 mn=[min(v[k] for v in world) for k in range(3)];mx=[max(v[k] for v in world) for k in range(3)];target=(3.8,3.0,10) if j==0 else (4.4,4.1,1.7)
 o.parent=None;o.matrix_world=Matrix.Identity(4)
 for v,p in zip(o.data.vertices,world):
  q=Vector(tuple(((p[k]-mn[k])/(mx[k]-mn[k])-(.5 if k<2 else 0))*target[k] for k in range(3)))
  if j==0:q.x+=.013*q.z*q.z
  else:q.z-=.18
  v.co=q
 o.hide_render=False;o.hide_set(False)
 for m in o.data.materials:
  bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');so=bs.inputs['Base Color'];old=so.links[0].from_socket;mul=m.node_tree.nodes.new('ShaderNodeMixRGB');mul.blend_type='MULTIPLY';mul.inputs[0].default_value=1;mul.inputs[2].default_value=(.62,.51,.38,1);m.node_tree.links.new(old,mul.inputs[1]);m.node_tree.links.new(mul.outputs[0],so)
 print('실물 스캔 주 줄기 정규화',o.name,dims,'주축',axis,flush=True)
bpy.ops.mesh.primitive_plane_add(size=120);o=bpy.context.object;m=bpy.data.materials.new('중립바닥');m.diffuse_color=(.07,.08,.10,1);o.data.materials.append(m)
def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
for name,pos,energy,color,size in [('차가운큰면광',(-8,-1,15),4200,(.57,.69,.83),11),('후경림광',(4,18,18),4200,(.56,.70,.90),10),('따뜻한미약보조',(7,-10,8),850,(.84,.65,.43),9)]:
 d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.color=color;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);S.collection.objects.link(o);o.location=pos;aim(o,(0,0,4))
bpy.ops.object.camera_add();cam=bpy.context.object;cam.location=Vector((9,-13,math.hypot(9,13)*math.tan(math.radians(52))))+Vector((0,0,4));aim(cam,(0,0,4));cam.data.type='ORTHO';cam.data.ortho_scale=18;S.camera=cam
S.world.color=(.15,.18,.21);S.view_settings.view_transform='AgX';S.view_settings.exposure=.3;S.render.resolution_x=1600;S.render.resolution_y=1000;S.render.resolution_percentage=100
S.render.filepath=str(R/'compare/실물스캔_주줄기_방법시험.png');bpy.ops.render.render(write_still=True)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/실물스캔_주줄기_방법시험.blend'));print('실물 스캔 대안 정적 렌더 시험 완료',flush=True)
