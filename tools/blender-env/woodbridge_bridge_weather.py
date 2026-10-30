"""기존 베이크 UV를 보존하고 일부 상판의 끝 파손·처짐을 기하에 반영한다."""
import bpy,json,math
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');marker=R/'source/다리파손완료.json'
if marker.exists():print('이미 적용된 다리 파손. 중복 변형 없음',flush=True);raise SystemExit(0)
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));counts={}
for suff in ['', '_High']:
 o=bpy.data.objects['RF_Rotten_Wood_Bridge'+suff];adj=[[] for v in o.data.vertices]
 for e in o.data.edges:a,b=e.vertices;adj[a].append(b);adj[b].append(a)
 left=set(range(len(adj)));changed=[]
 while left:
  a=left.pop();group={a};todo=[a]
  while todo:
   for b in adj[todo.pop()]:
    if b in left:left.remove(b);group.add(b);todo.append(b)
  ps=[o.data.vertices[i].co for i in group];mn=[min(p[k] for p in ps) for k in range(3)];mx=[max(p[k] for p in ps) for k in range(3)]
  if mx[0]-mn[0]<3.7 or mx[1]-mn[1]>.7 or mn[2]<.2 or mx[2]>1:continue
  cy=(mn[1]+mx[1])/2;j=round((cy+5.4)/.386)
  if j not in [3,8,14,19,24]:continue
  side=-1 if j%2 else 1;amount=.45+.35*(.5+.5*math.sin(j*2))
  for i in group:
   p=o.data.vertices[i].co;w=max(0,min(1,(side*p.x-.40)/1.8));p.x-=side*amount*w;p.z-=.16*w*w;p.y+=.035*math.sin(p.x*2+j)*w
  changed.append(j)
 o.data.update();counts[suff or 'Low']=sorted(changed);assert len(changed)==5,(suff,changed)
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'))
for row in rows:
 if row['id']=='RF_Rotten_Wood_Bridge':row['역할']='29장 휜 상판 중5장 끝 파손·처짐,10말뚝·썩은 난간·처진 밧줄';row['범위XYZ최소최대']=[min(v.co[k] for v in bpy.data.objects[row['id']].data.vertices) for k in range(3)]+[max(v.co[k] for v in bpy.data.objects[row['id']].data.vertices) for k in range(3)]
(R/'source/모듈명세.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');marker.write_text(json.dumps({'변형':counts,'UV':'기존 베이크 UV/삼각형 보존, 재베이크 아님'},ensure_ascii=False,indent=2),encoding='utf8');bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/숲_베이크.blend'));print('상판 끝 파손·처짐5장',counts,flush=True)
