"""승인 원화의 우측 전경 거목과 낮은 앞쪽 그루터기로 외곽 질량을 닫는다."""
import bpy,math
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene
for o in list(S.objects):
 if o.name.startswith('원화전경_'):bpy.data.objects.remove(o,do_unlink=True)
def put(id,p,sc,rot):
 src=bpy.data.objects[id];o=src.copy();o.data=src.data;S.collection.objects.link(o);o.name='원화전경_'+id;o.location=p;o.scale=sc;o.rotation_euler=rot;o.hide_render=False;o.hide_set(False);return o
put('RF3_Ancient_Tree_B',(14,-1,-.35),(.95,.95,.95),(0,0,math.radians(150)))
put('RF3_Foreground_Branch_Frame',(14,-1,-.18),(1.1,1.4,.6),(0,0,.7))
put('RF3_Root_Stump',(5,-8.6,.20),(.68,.68,.7),(0,0,1.0))
wood={bpy.data.objects['RF3_'+x].data for x in ['Ancient_Tree_A','Ancient_Tree_B','Root_Stump','Fallen_Log','Foreground_Branch_Frame']};vs=[];fs=[]
for o in S.objects:
 if o.type=='MESH'and not o.hide_render and o.data in wood:
  a=len(vs);vs.extend(o.matrix_world@v.co for v in o.data.vertices);fs.extend(tuple(a+i for i in f.vertices)for f in o.data.polygons)
bvh=BVHTree.FromPolygons(vs,fs);src=bpy.data.objects['RF3_Hanging_Moss'];top=max(v.co.z for v in src.data.vertices)
for j,center in enumerate([(13,-2.5,2.4),(14,-2.3,4.2),(13.5,-2,6),(4,-9.2,2.0),(5.5,-9.0,2.0)]):
 p=Vector(center);hit,n,ix,d=bvh.ray_cast(S.camera.location,(p-S.camera.location).normalized(),100)
 if hit is None:continue
 sc=1.1 if j<3 else .7;o=put('RF3_Hanging_Moss',hit+Vector((n.x*.2,n.y*.2,-top*sc)),(sc,sc,sc),(0,0,math.atan2(n.y,n.x)+math.pi/2))
for p in [(13,-2.4,1.4),(13.1,-2.2,2.1),(4.6,-9,1.0)]:put('RF3_Fungal_Colony',p,(.38,.38,.38),(0,0,.7))
S.render.resolution_percentage=45;S.cycles.samples=20;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/전경질량_검수후보.blend'));S.render.filepath=str(R/'renders/원화전경_질량검수.png');bpy.ops.render.render(write_still=True)
