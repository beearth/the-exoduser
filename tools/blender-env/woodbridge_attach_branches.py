"""휘어진 줄기와 떨어진 기존 가지 좌표를 수정한다. UV와 동일 기저 노멀은 보존하고 AO를 재투영한다."""
import bpy,json,math
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest';id='RF_Ancient_Rotten_Tree'
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));S=bpy.context.scene;S.render.threads_mode='FIXED';S.render.threads=10
# 파일 존재 대신 실제 기하에서 아직 떨어진 좌표를 판별한다. 이미 이동한 가지는 다시 옮기지 않는다.
records=[]
for suffix in ['', '_High']:
 o=bpy.data.objects[id+suffix];adj=[[] for v in o.data.vertices]
 for e in o.data.edges:a,b=e.vertices;adj[a].append(b);adj[b].append(a)
 todo_set=set(range(len(adj)));moved=[]
 while todo_set:
  a=todo_set.pop();group=[a];todo=[a]
  while todo:
   for b in adj[todo.pop()]:
    if b in todo_set:todo_set.remove(b);group.append(b);todo.append(b)
  vs=[o.data.vertices[i] for i in group];mn=[min(v.co[k] for v in vs) for k in range(3)];mx=[max(v.co[k] for v in vs) for k in range(3)]
  delta=2.3 if mn[2]>6 and mx[0]<.5 else .7 if mn[2]>8 and mx[0]<2.5 else 0
  if delta:
   for v in vs:v.co.x+=delta
   moved.append({'정점':len(vs),'X이동m':delta,'이전최소':mn,'이전최대':mx})
 assert len(moved) in (0,2),(o.name,moved)
 records.append({'객체':o.name,'부착이동':moved});o.data.update()
for o in S.objects:
 if o.type=='MESH':o.hide_render=True;o.hide_set(True)
low=bpy.data.objects[id];high=bpy.data.objects[id+'_High'];target=low.data.materials[0];im=bpy.data.images.new(id+'_부착AO',width=2048,height=2048,alpha=False);im.colorspace_settings.name='Non-Color';tx=target.node_tree.nodes.new('ShaderNodeTexImage');tx.image=im;target.node_tree.nodes.active=tx
bpy.ops.object.select_all(action='DESELECT')
for o in [low,high]:o.hide_set(False);o.hide_render=False;o.select_set(True)
bpy.context.view_layer.objects.active=low;S.cycles.samples=16;S.render.bake.use_selected_to_active=True;S.render.bake.cage_extrusion=.018;S.render.bake.max_ray_distance=.05;S.render.bake.margin=12;bpy.ops.object.bake(type='AO');im.filepath_raw=str(P/'Textures'/(id+'_AO.png'));im.file_format='PNG';im.save();target.node_tree.nodes.remove(tx)
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'))
for r in rows:
 if r['id']==id:r['범위XYZ최소최대']=[min(v.co[k] for v in low.data.vertices) for k in range(3)]+[max(v.co[k] for v in low.data.vertices) for k in range(3)]
(R/'source/모듈명세.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
for o in [low,high]:o.hide_render=True;o.hide_set(True)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/숲_베이크.blend'));(R/'source/거목가지_부착수정.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf8');print('로우·하이 동일 가지2개 부착 및 AO 재베이크 완료',flush=True)
