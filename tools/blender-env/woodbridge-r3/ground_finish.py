"""실물 스캔 고목의 접지·강둑 반도·잘린 목질 그루터기 및 식생 톤 보정."""
import bpy,bmesh,math,json
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_실물스캔.blend'));S=bpy.context.scene
def ground(x,y):
 north=y-(5.8+.5*math.sin(x*.4));south=(-6+.5*math.sin(x*.35))-y;right=6.7+.12*max(y,0)+1.3*math.sin(y*.23)-x;bank=max(south,min(north,right));dx=x-6.2;dy=y-.8;a=math.atan2(dy,dx);island=2.5*(1-math.sqrt((dx/2.6)**2+(dy/3.0)**2)*(1+.16*math.sin(a*5)+.07*math.sin(a*9)));foot=2.7*(1-math.sqrt(((x+7.3)/4.2)**2+((y+5.8)/3.5)**2));d=max(bank,island,foot);h=.62+.25*math.sin(x*.27+y*.16)+.14*math.sin(x*.67-y*.4);return -1.1+(h+1.1)*max(0,min(1,(d+1.4)/2.2))+.09*math.sin(x*2.1+y)*max(0,min(1,d+1))
terrain=bpy.data.objects['RF3_Continuous_Bank_Terrain']
for v in terrain.data.vertices:v.co.z=ground(v.co.x,v.co.y)
terrain.data.update()
trees=[o for o in S.objects if o.name.startswith('배치_RF3_Ancient_Tree_')]
for t in trees:
 dz=ground(t.location.x,t.location.y)-t.location.z-.08;t.location.z+=dz
 for o in S.objects:
  if o.name.startswith('뿌리접합_이끼')and (o.location.xy-t.location.xy).length<4*t.scale.x:o.location.z+=dz
# 둥근 흙더미 대용물을 폐기하고 실제 큰 나무의 밑동을 잘라 목질 그루터기로 쓴다.
raw=bpy.data.objects['스캔_뒤틀린나무_생잎제외']
for suff in ['', '_High']:
 o=bpy.data.objects['RF3_Root_Stump'+suff];old=o.data;o.data=raw.data.copy();bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.0001,plane_co=Vector((0,0,3.2)),plane_no=Vector((0,0,1)),clear_inner=False,clear_outer=True)
 boundary=[e for e in bm.edges if e.is_boundary and all(v.co.z>3.0 for v in e.verts)]
 if boundary:bmesh.ops.holes_fill(bm,edges=boundary,sides=0)
 for v in bm.verts:
  if v.co.z>2.8:v.co.z+=.16*math.sin(math.atan2(v.co.y,v.co.x)*8)
  v.co.x*=1.35;v.co.y*=1.35
 bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(o.data);bm.free()
 if not suff:
  bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o;de=o.modifiers.new('그루터기_실물저밀도','DECIMATE');de.ratio=.40;bpy.ops.object.modifier_apply(modifier=de.name)
  for q in S.objects:
   if q.data==old:q.data=o.data
 o.hide_render=True;o.hide_set(True)
for o in S.objects:
 if o.name.startswith('배치_RF3_Root_Stump'):o.location.z=.10
for m in bpy.data.materials:
 if m.name=='shrub_03':
  for n in m.node_tree.nodes:
   if n.type=='HUE_SAT':n.inputs['Value'].default_value=.5
   if n.type=='MIX_RGB'and not n.inputs[2].is_linked:n.inputs[2].default_value=(.62,.32,.13,1)
 if m.name=='island_tree_01':
  for n in m.node_tree.nodes:
   if n.type=='HUE_SAT':n.inputs['Value'].default_value=.6
   if n.type=='MIX_RGB'and not n.inputs[2].is_linked:n.inputs[2].default_value=(.55,.43,.27,1)
# 거대한 스캔 밑동과 경사 사이에는 낮은 실제 파단 목질을 얹는다.
log=bpy.data.objects['RF3_Fallen_Log'];moss=bpy.data.objects['RF3_Hanging_Moss']
for x,y,a,sc in [(-7.3,-4.6,20,.8),(-8.4,-6.4,-20,.7),(5.8,13.2,60,.7),(4.9,14.9,130,.6)]:
 o=log.copy();o.data=log.data;S.collection.objects.link(o);o.name='낮은_뿌리접합목질';o.location=(x,y,ground(x,y)-.12);o.scale=(sc,sc,.45);o.rotation_euler.z=math.radians(a);o.hide_render=False;o.hide_set(False)
for j,(x,y,z)in enumerate([(5.5,-.6,1),(7.6,1.1,.7),(6.2,2.5,1.0),(-8.5,-4.8,1.2),(-6.9,-5.6,1.7)]):
 o=moss.copy();o.data=moss.data;S.collection.objects.link(o);o.name='강가_접지이끼';o.location=(x,y,z);o.scale=(.75,.75,.75);o.rotation_euler.z=j*.8;o.hide_render=False;o.hide_set(False)
S.cycles.samples=32;S.render.resolution_percentage=65
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_베이크입력.blend'));S.render.filepath=str(R/'renders/승인구도_접지검수.png');bpy.ops.render.render(write_still=True)
print('접지 및 실제 목질 그루터기 수정 완료',flush=True)
