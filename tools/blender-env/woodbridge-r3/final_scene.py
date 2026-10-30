"""승인 구도 보정과 이끼 쿠션의 실제 접지. 동일 납품 PNG를 다시 읽는다."""
import bpy,math,json
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from bpy_extras.object_utils import world_to_camera_view
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene
for im in bpy.data.images:
 if im.source=='FILE'and Path(bpy.path.abspath(im.filepath)).parent==P/'Textures':
  if im.packed_file:im.unpack(method='REMOVE')
  im.reload()
cam=S.camera;cam.location=(24,-28,26);target=Vector((3,3,1));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=45;bpy.context.view_layer.update()
woodnames=['Ancient_Tree','Root_Stump','Fallen_Log','Rotten_Wood_Bridge','Continuous_Bank_Terrain'];data={o.data for o in S.objects if o.name.startswith('RF3_')and any(x in o.name for x in woodnames)};verts=[];faces=[]
for o in S.objects:
 if o.type=='MESH'and not o.hide_render and o.data in data:
  base=len(verts);verts.extend(o.matrix_world@v.co for v in o.data.vertices);faces.extend(tuple(base+i for i in f.vertices)for f in o.data.polygons)
bvh=BVHTree.FromPolygons(verts,faces);moss=bpy.data.objects['RF3_Moss_Cushion'].data;count=0
for o in S.objects:
 if o.type=='MESH'and not o.hide_render and o.data==moss:
  start=o.location+Vector((0,0,2.5));hit,n,index,d=bvh.ray_cast(start,Vector((0,0,-1)),5)
  if hit is not None:o.location.z=hit.z+.015;count+=1
anchors={name:list(world_to_camera_view(S,cam,Vector(p)))for name,p in [('다리남쪽',(0,-5.4,.6)),('다리북쪽',(0,5.4,.6)),('좌측거목',(-7.3,-4.3,.5)),('강가그루터기',(6.2,.8,1.1))]}
(R/'source/최종-카메라접지.json').write_text(json.dumps({'카메라XYZ':list(cam.location),'목표':list(target),'초점mm':45,'수평대비하향각':math.degrees(math.atan2(25,math.hypot(21,31))),'앵커':anchors,'이끼쿠션접지':count,'색대리면':{'linearRGB최소':[.062,.070,.014],'linearRGB최대':[.082,.086,.021],'roughness':.27,'IOR':1.36,'발광':0}},ensure_ascii=False,indent=2),encoding='utf8')
S.render.resolution_percentage=38;S.cycles.samples=16;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/최종구도_확인.png');bpy.ops.render.render(write_still=True)
