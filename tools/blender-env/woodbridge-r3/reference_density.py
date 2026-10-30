"""승인 원화의 다리 화면 비중과 전면 이끼·균사의 큰 질량을 맞춘다."""
import bpy,math,json
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene
for o in list(S.objects):
 if o.name.startswith('원화밀도_'):bpy.data.objects.remove(o,do_unlink=True)
cam=S.camera;cam.location=(15,-25,23);target=Vector((2,1,1));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=45
tags=['Ancient_Tree','Root_Stump','Fallen_Log','Rotten_Wood_Bridge'];wood={bpy.data.objects['RF3_'+t].data for t in ['Ancient_Tree_A','Ancient_Tree_B','Root_Stump','Fallen_Log','Rotten_Wood_Bridge']};vs=[];faces=[]
for o in S.objects:
 if o.type=='MESH'and not o.hide_render and o.data in wood:
  b=len(vs);vs.extend(o.matrix_world@v.co for v in o.data.vertices);faces.extend(tuple(b+i for i in f.vertices)for f in o.data.polygons)
bvh=BVHTree.FromPolygons(vs,faces)
def place(id,center,scale,index):
 src=bpy.data.objects[id];hit,n,ix,d=bvh.ray_cast(cam.location,(Vector(center)-cam.location).normalized(),100)
 if hit is None:return
 o=src.copy();o.data=src.data;S.collection.objects.link(o);o.name='원화밀도_'+id;o.hide_render=False;o.hide_set(False);o.scale=scale;o.rotation_euler.z=math.atan2(n.y,n.x)+math.pi/2+.14*math.sin(index*1.8)
 if id.endswith('Hanging_Moss'):
  top=max(v.co.z for v in src.data.vertices);o.location=hit+Vector((n.x*.065,n.y*.065,-top*scale[2]))
 else:o.location=hit+Vector((n.x*.03,n.y*.03,-.1));o.rotation_euler.z=math.atan2(-n.x,n.y)
for i,(x,y,z,sc)in enumerate([(-7.9,-4.5,2.3,1.1),(-6.9,-4.8,3.8,1.0),(-7.3,-4.3,5.3,1.2),(-8.5,-4.8,1.7,.9),(-6.1,-5,1.7,.85),(-7.7,-3.8,7.0,1.25),(6.2,.8,2.5,.8),(5.4,.7,1.8,.75),(7.2,.6,1.8,.7),(5.8,13.5,2.2,1),(5.2,14,4.2,1.1),(-1.4,-2,1.3,.45),(1.4,1,1.2,.45)]):
 for j in range(2):place('RF3_Hanging_Moss',(x+(j-.5)*.38,y,z+.16*j),(sc,sc,sc*.85),i*2+j)
for i,c in enumerate([(-7.5,-4.5,2),(-7,-4.5,3.0),(6.1,.7,1.6),(6.1,.7,2.3)]):place('RF3_Fungal_Colony',c,(.5,.5,.5),i)
S.render.resolution_percentage=45;S.cycles.samples=20;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/원화구도_전면밀도.png');bpy.ops.render.render(write_still=True)
