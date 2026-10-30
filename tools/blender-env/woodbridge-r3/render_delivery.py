"""최종 납품과 동일 메시·PNG의 1080p 조립/동일52도 모듈 렌더."""
import bpy,math,json,sys
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;S.cycles.use_denoising=True;S.render.threads_mode='FIXED';S.render.threads=10
def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
if '--modules'not in sys.argv:
 S.cycles.samples=96;S.render.resolution_percentage=100;S.render.resolution_x=1920;S.render.resolution_y=1080;S.render.filepath=str(R/'renders/승인구도_납품동일_1920x1080.png');bpy.ops.render.render(write_still=True)
 print('1080p 납품동일 후보 렌더 완료',flush=True)
else:
 for o in S.objects:o.hide_render=True;o.hide_set(True)
 S.cycles.samples=40;S.render.resolution_percentage=100;S.render.resolution_x=1600;S.render.resolution_y=1000
 S.world.use_nodes=True;bg=next(n for n in S.world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs[0].default_value=(.16,.18,.21,1);bg.inputs[1].default_value=.45
 def area(name,p,power,color,size):
  d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=color;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);S.collection.objects.link(o);o.location=p;aim(o,(0,0,2))
 area('동일_차가운주광',(-5,-7,12),1900,(.67,.77,1),7);area('동일_따뜻한보조',(7,-4,7),900,(1,.79,.56),6);area('동일_뒷면광',(0,7,11),2100,(.60,.74,.96),7)
 bpy.ops.mesh.primitive_plane_add(size=160);floor=bpy.context.object;floor.name='동일_검수바닥';m=bpy.data.materials.new('동일_검수바닥');m.use_nodes=True;bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=(.035,.043,.055,1);bs.inputs['Roughness'].default_value=.9;floor.data.materials.append(m);floor.location.z=-.04
 bpy.ops.object.camera_add();cam=bpy.context.object;cam.data.type='ORTHO';S.camera=cam;rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'))
 for r in rows:
  if '--only'in sys.argv and r['id']not in sys.argv[sys.argv.index('--only')+1:]:continue
  src=bpy.data.objects[r['id']];p=src.copy();p.data=src.data;S.collection.objects.link(p);p.name='검수정규화_'+r['id'];p.hide_render=False;p.hide_set(False);pts=[v.co for v in p.data.vertices];mn=Vector([min(q[k]for q in pts)for k in range(3)]);mx=Vector([max(q[k]for q in pts)for k in range(3)]);sc=8/max(mx-mn);c=(mn+mx)*.5;c.z=0 if r.get('매립깊이m')else mn.z;p.scale=(sc,)*3;p.location=-c*sc
  sides=[0,1]if r['id']in ['RF3_Ancient_Tree_A','RF3_Rotten_Wood_Bridge','RF3_Hanging_Moss']else[0]
  for side in sides:
   p.rotation_euler.z=side*math.pi/2;bpy.context.view_layer.update();pts=[p.matrix_world@v.co for v in p.data.vertices];c=Vector([sum(q[k]for q in pts)/len(pts)for k in range(3)]);cam.location=c+Vector((10,-14,math.hypot(10,14)*math.tan(math.radians(52))));aim(cam,c);bpy.context.view_layer.update();ps=[cam.matrix_world.inverted()@q for q in pts];cam.data.ortho_scale=max(max(abs(q.x)for q in ps)*2.30,max(abs(q.y)for q in ps)*3.68);S.render.filepath=str(R/'renders'/(r['id']+('_side'if side else'')+'.png'));bpy.ops.render.render(write_still=True)
  bpy.data.objects.remove(p,do_unlink=True)
 print('동일52도·동일조명·크기정규화 검수 모듈 렌더 완료',flush=True)
