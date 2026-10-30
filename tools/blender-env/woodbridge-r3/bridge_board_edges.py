"""기존 판자 성분의 UV를 보존하고 끝의 넓은 결손/뒤틀림을 실제 메시로 만든다."""
import bpy,bmesh,math,json,shutil
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';src=R/'source/승인구도_납품동일.blend';bpy.ops.wm.open_mainfile(filepath=str(src));S=bpy.context.scene;o=bpy.data.objects['RF3_Rotten_Wood_Bridge']
if o.data.get('실제판자끝파손'):raise RuntimeError('이미 수정된 후보에 반복 적용 금지')
shutil.copyfile(src,R/'source/판자끝파손_이전.blend');shutil.copyfile(P/'Models/RF3_Rotten_Wood_Bridge.fbx',R/'source/판자끝파손_이전.fbx')
bm=bmesh.new();bm.from_mesh(o.data);seen=set();parts=[]
for v in bm.verts:
 if v in seen:continue
 stack=[v];seen.add(v);part=[]
 while stack:
  q=stack.pop();part.append(q)
  for e in q.link_edges:
   z=e.other_vert(q)
   if z not in seen:seen.add(z);stack.append(z)
 mn=[min(q.co[k]for q in part)for k in range(3)];mx=[max(q.co[k]for q in part)for k in range(3)]
 if mx[0]-mn[0]>2.7 and mx[1]-mn[1]<.75 and mn[2]>.15:parts.append((part,mn,mx))
edges=list({e for part,mn,mx in parts for v in part for e in v.link_edges});boxes=[(mn,mx)for part,mn,mx in parts]
# 연속 연산이 기존 BMVert 핸들을 무효화하므로 전체 판자 모서리를 한 번에 분할하고 좌표 구역으로 재식별한다.
bmesh.ops.subdivide_edges(bm,edges=edges,cuts=3,use_grid_fill=True);count=len(boxes)
for v in bm.verts:
 for mn,mx in boxes:
  x,y,z=v.co
  if not all(mn[k]-.001<=v.co[k]<=mx[k]+.001 for k in range(3)):continue
  cy=(mn[1]+mx[1])*.5;j=round((cy+5.4)/.386);cx=(mn[0]+mx[0])*.5;hw=(mx[0]-mn[0])*.5;hy=(mx[1]-mn[1])*.5;u=(x-cx)/hw;t=(y-cy)/hy
  # 끝 가장자리의 중간 정점을 크게 안쪽으로 파서 실제 비대칭 결손을 남긴다.
  edge=max(0,(abs(u)-.68)/.32);cut=(.06+.13*(.5+.5*math.sin(j*1.7)))*max(0,1-abs(t-.22*math.sin(j)))**1.2
  v.co.x-=math.copysign(edge*cut,u);v.co.z+=.027*math.sin(j*1.9+u*3.1)*(1-.3*abs(t));v.co.y+=.025*math.sin(j*2.3+u*4.2)*(1-.4*abs(t))
  break
bm.normal_update();bm.to_mesh(o.data);bm.free();o.data['실제판자끝파손']=True
for f in o.data.polygons:f.use_smooth=True
rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));r=next(x for x in rows if x['id']==o.name);r.update({'정점':len(o.data.vertices),'저밀도삼각형':sum(len(f.vertices)-2 for f in o.data.polygons),'bounds':[min(v.co[k]for v in o.data.vertices)for k in range(3)]+[max(v.co[k]for v in o.data.vertices)for k in range(3)],'판자실제끝파손':count,'마감설명':'기존 UV/베이크 보존, 끝 최대19cm의 비대칭 결손과 큰 뒤틀림. 기존 두 부분파손 판자 유지. 새 high 베이크로 과장하지 않음'})
bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.export_scene.fbx(filepath=str(P/'Models/RF3_Rotten_Wood_Bridge.fbx'),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False);o.hide_set(True);(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(src));print('실제 판자 끝 파손',count,r['저밀도삼각형'],flush=True)
