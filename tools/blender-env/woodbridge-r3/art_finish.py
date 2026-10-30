"""원화 비교 후 큰 주간·접지 이끼·강의 흐름 및 조명 위계 보정."""
import bpy,math,json
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_수정2.blend'));S=bpy.context.scene
# 주간의 큰 능선은 기하로, 미세 수피는 CC0 PBR로 분리한다.
for name in ['RF3_Ancient_Tree_A','RF3_Ancient_Tree_B']:
 for suff in ['', '_High']:
  o=bpy.data.objects[name+suff]
  for v in o.data.vertices:
   x,y,z=v.co
   if z>1.5:
    a=math.atan2(y,x);r=math.hypot(x,y);gain=1+.13*math.sin(a*5+z*.16)+.10*math.sin(a*8-z*.31)
    v.co.x=x*gain+.11*z*math.sin(z*.11);v.co.y=y*gain+.05*z*math.sin(z*.17)
  o.data.update()
# 새 주간에 묻힌 이끼를 실제 수피 바깥으로 이동한다.
trees=[o for o in S.objects if o.name.startswith('배치_RF3_Ancient_Tree_')]
for o in S.objects:
 if o.name.startswith('배치_RF3_Hanging_Moss'):
  near=min(trees,key=lambda t:(o.location.x-t.location.x)**2+(o.location.y-t.location.y)**2)
  d=Vector((o.location.x-near.location.x,o.location.y-near.location.y,0))
  if d.length<3.2*near.scale.x:
   d*=1.75;o.location.x=near.location.x+d.x;o.location.y=near.location.y+d.y;o.scale.z*=1.2
for m in bpy.data.materials:
 if m.name=='moss_01':
  for n in m.node_tree.nodes:
   if n.type=='HUE_SAT':n.inputs['Value'].default_value=2.3;n.inputs['Saturation'].default_value=.12
   if n.type=='MIX_RGB'and not n.inputs[2].is_linked:n.inputs[2].default_value=(.9,.8,.6,1)
# 스캔 가지를 주간에 붙인 큰 굴곡·부러진 측지로 재사용한다.
def select(obs,active):
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active
source=bpy.data.objects['dead_tree_trunk_02']
for ti,name in enumerate(['RF3_Ancient_Tree_A','RF3_Ancient_Tree_B']):
 for suff in ['', '_High']:
  o=bpy.data.objects[name+suff];parts=[]
  for j,(a,z,tilt)in enumerate([(2.7+ti,7.2,.7),(.1+ti*1.7,11,.45)]):
   q=source.copy();q.data=source.data.copy();S.collection.objects.link(q);q.name='실물파단_측지';q.hide_render=False;q.hide_set(False);q.scale=(1.35,1.8,1.8);q.rotation_euler=(0,-tilt,a);q.location=(1.4*math.cos(a),1.4*math.sin(a),z);select([q],q);bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
   if not suff:
    de=q.modifiers.new('측지_로우','DECIMATE');de.ratio=.18;bpy.ops.object.modifier_apply(modifier=de.name)
   parts.append(q)
  old=o.data;clones=[q for q in S.objects if q.data==old and q!=o];select([o]+parts,o);bpy.ops.object.join()
  for q in clones:q.data=o.data
  o.hide_render=True;o.hide_set(True)
water=bpy.data.materials['독액_기준대리물_비납품']
for n in water.node_tree.nodes:
 if n.type=='VECT_MATH'and n.operation=='MULTIPLY':n.inputs[1].default_value=(1.0,1.0,.2)
 if n.type=='VALTORGB':n.color_ramp.elements[0].color=(.062,.070,.014,1);n.color_ramp.elements[1].color=(.082,.086,.021,1)
 if n.type=='BUMP':n.inputs['Strength'].default_value=.022
for name in ['강가_저층연무','빛기둥_희박입자']:
 m=bpy.data.materials.get(name)
 if m:
  for n in m.node_tree.nodes:
   if n.type=='PRINCIPLED_VOLUME':n.inputs['Density'].default_value=.0035 if '저층'in name else .0025
for o in S.objects:
 if o.type=='LIGHT'and '빛기둥'in o.name:o.data.energy=18000;o.data.spot_blend=.85
def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
d=bpy.data.lights.new('길_따뜻한반사','AREA');d.energy=1300;d.color=(1,.66,.34);d.shape='DISK';d.size=8;o=bpy.data.objects.new(d.name,d);S.collection.objects.link(o);o.location=(-1,-3,7);aim(o,(0,1,0))
d=bpy.data.lights.new('후경틈_달빛기둥','SPOT');d.energy=95000;d.color=(.67,.79,1);d.spot_size=.16;d.spot_blend=.7;o=bpy.data.objects.new(d.name,d);S.collection.objects.link(o);o.location=(-1,19,22);aim(o,(-5,6,0))
# 동일 위치에서 덩어리로 뭉친 거품 띠를 가라앉히고 파단 목질의 물가 반영을 남긴다.
S.cycles.samples=40;S.render.resolution_percentage=65
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_제작본.blend'));S.render.filepath=str(R/'renders/승인구도_제작검수.png');bpy.ops.render.render(write_still=True)
print('주간·측지·이끼·강·안개 제작 검수 렌더 완료',flush=True)
