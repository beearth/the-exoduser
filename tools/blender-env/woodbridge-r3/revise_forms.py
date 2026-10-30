"""알파 누락 원인 교정 및 스캔 접합 위 대형 고목 주간 재조형."""
import bpy,bmesh,math,json
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_수정1.blend'));S=bpy.context.scene
for id in ['moss_01','shrub_03']:
 m=bpy.data.materials[id];n=m.node_tree.nodes;l=m.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED');tx=n.new('ShaderNodeTexImage');tx.image=bpy.data.images.load(str(R/'scan-source'/id/(id+'_Alpha.png')));tx.image.colorspace_settings.name='Non-Color';cut=n.new('ShaderNodeMath');cut.operation='GREATER_THAN';cut.inputs[1].default_value=.32;l.new(tx.outputs[0],cut.inputs[0]);l.new(cut.outputs[0],bs.inputs['Alpha'])
 # 마스크는 JPEG의 상수 Alpha가 아니라 제공된 실제 흑백 Alpha다.
 for q in n:
  if q.type=='NORMAL_MAP':q.inputs['Strength'].default_value=.25
  if id=='moss_01'and q.type=='HUE_SAT':q.inputs['Saturation'].default_value=.18;q.inputs['Value'].default_value=1.1
  if id=='moss_01'and q.type=='MIX_RGB'and not q.inputs[2].is_linked:q.inputs[2].default_value=(.95,.84,.53,1)

def select(obs,active=None):
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active or obs[-1]
bark=bpy.data.materials.new('스캔접합_거대고목_수피층');bark.use_nodes=True;n=bark.node_tree.nodes;l=bark.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED');g=n.new('ShaderNodeTexCoord');v=n.new('ShaderNodeVectorMath');v.operation='MULTIPLY';v.inputs[1].default_value=(.38,.38,.12);l.new(g.outputs['Object'],v.inputs[0]);tx=n.new('ShaderNodeTexImage');tx.projection='BOX';tx.projection_blend=.25;tx.image=bpy.data.images.load('I:/EXODUSER-Storage/demo-art/blender-env/forest-r1/pbr-source/bark_brown_02_Diffuse.jpg');l.new(v.outputs[0],tx.inputs[0]);mul=n.new('ShaderNodeMixRGB');mul.blend_type='MULTIPLY';mul.inputs[0].default_value=1;mul.inputs[2].default_value=(.36,.28,.17,1);l.new(tx.outputs[0],mul.inputs[1]);l.new(mul.outputs[0],bs.inputs['Base Color']);bs.inputs['Roughness'].default_value=.92;bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.33;bump.inputs['Distance'].default_value=.10;l.new(tx.outputs[0],bump.inputs['Height']);l.new(bump.outputs[0],bs.inputs['Normal'])
for ti,name in enumerate(['RF3_Ancient_Tree_A','RF3_Ancient_Tree_B']):
 for suff in ['', '_High']:
  o=bpy.data.objects[name+suff];bm=bmesh.new();bm.from_mesh(o.data)
  # 좁고 긴 스캔 로그의 주간 대용부는 제거하고 실제 밑동·판근 스캔은 유지한다.
  cut=[v for v in bm.verts if v.co.z>1.7]
  if cut:bmesh.ops.delete(bm,geom=cut,context='VERTS')
  bm.to_mesh(o.data);bm.free()
  vs=[];fs=[];N=96 if suff else 48;K=49 if suff else 25;phase=ti*1.3
  for k in range(K):
   t=k/(K-1);z=t*18;cx=-.55*t+1.2*math.sin(t*2.4+phase)-1.2*math.sin(phase);cy=.45*math.sin(t*4+phase);gap=.36*max(0,1-z/5.5)
   for j in range(N):
    a=-math.pi/2+gap+(math.tau-2*gap)*j/(N-1);r=(2.5*(1-.74*t))*(1+.18*math.sin(a*6+t*2.5+phase)+.10*math.sin(a*11-t*5)+.045*math.cos(a*19+t*8));r+=max(0,1-z/3.2)**2*(.75+.65*math.cos(a*5+phase));vs.append((cx+r*math.cos(a),cy+r*math.sin(a),z))
  for k in range(K-1):
   for j in range(N-1):a=k*N+j;fs.append((a,a+1,a+N+1,a+N))
  # 속빈 틈은 검은 내벽과 잘린 가장자리로 닫는다.
  innerbase=len(vs)
  for k in range(K):
   t=k/(K-1);z=t*18;cx=-.55*t+1.2*math.sin(t*2.4+phase)-1.2*math.sin(phase);cy=.45*math.sin(t*4+phase)
   for j in range(N):
    x,y,zz=vs[k*N+j];vs.append((cx+(x-cx)*.77,cy+(y-cy)*.77,zz))
  for k in range(K-1):
   for j in range(N-1):a=innerbase+k*N+j;fs.append((a+N,a+N+1,a+1,a))
   for j in [0,N-1]:a=k*N+j;b=innerbase+a;fs.append((a,a+N,b+N,b))
  for j in range(N-1):a=(K-1)*N+j;fs.append((a,a+1,innerbase+a+1,innerbase+a))
  me=bpy.data.meshes.new('넓은판근_휜주간');me.from_pydata(vs,[],fs);me.materials.append(bark);core=bpy.data.objects.new(me.name,me);S.collection.objects.link(core)
  for f in me.polygons:f.use_smooth=True
  # 기존 low의 모든 조립 instance가 동일 데이터 변경을 받도록 join 뒤 데이터 핸들을 연결한다.
  olddata=o.data;clones=[q for q in bpy.data.objects if q.data==olddata and q!=o];select([o,core],o);bpy.ops.object.join()
  for q in clones:q.data=o.data
  o.hide_render=True;o.hide_set(True)
for o in S.objects:
 if o.name.startswith('배치_RF3_Withered_Shrub'):o.scale.x*=1.7;o.scale.y*=1.7;o.scale.z*=1.5
 if o.name.startswith('배치_RF3_Hanging_Moss'):o.location.z-=1.1*o.scale.z
# 기존 강가의 딱 끊긴 말뚝은 낮게 침수시킨다.
for o in S.objects:
 if o.name.startswith('배치_RF3_River_Stake_Cluster'):o.location.z-=.30
S.cycles.samples=28;S.render.resolution_percentage=65
for im in bpy.data.images:
 if im.source=='FILE':im.filepath=bpy.path.abspath(im.filepath)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_수정2.blend'));S.render.filepath=str(R/'renders/승인구도_수정2.png');bpy.ops.render.render(write_still=True)
(R/'source/알파-원인과수정.json').write_text(json.dumps({'원인':'Poly Haven glTF의 baseColor는 JPEG이며 Alpha가 상수1. 별도 Alpha 파일 연결이 필요했다. 투명 bounce 증가는 원인 해결이 아니었다.','수정':'CC0 제공 Alpha 2K 별도 수신·선형·cutoff .32 연결','미세노이즈생성':False,'이전검은카드':'FAIL'},ensure_ascii=False,indent=2),encoding='utf8')
print('알파 원인 교정 및 대형 조형 수정 렌더 완료',flush=True)
