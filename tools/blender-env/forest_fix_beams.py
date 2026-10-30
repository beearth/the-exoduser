import bpy,json
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/forest-r1')
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_형태.blend'))
o=bpy.data.objects['RF_Rotten_Wood_Bridge'];adj={v.index:set() for v in o.data.vertices}
for e in o.data.edges:a,b=e.vertices;adj[a].add(b);adj[b].add(a)
left=set(adj);fixed=[]
while left:
 start=left.pop();group={start};stack=[start]
 while stack:
  a=stack.pop()
  for b in adj[a]:
   if b in left:left.remove(b);group.add(b);stack.append(b)
 vs=[o.data.vertices[i] for i in group];dims=[max(v.co[k] for v in vs)-min(v.co[k] for v in vs) for k in range(3)]
 if dims[0]>7 and dims[1]<.7:
  for v in vs:v.co.z-=.2
  fixed.append(len(vs))
assert len(fixed)==2,fixed
bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/숲_형태.blend'))
(R/'source/보_접합수정.json').write_text(json.dumps({'실제수정':'판재를 뚫던 하중보2개의 Z를 .2m 낮춤','정점수':fixed,'원본레시피동기화':True},ensure_ascii=False,indent=2),encoding='utf8')
print('하중보2개 판재 관통 수정',flush=True)
