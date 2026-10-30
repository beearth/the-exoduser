"""실물 스캔의 잘린 바닥을 실제 매립 뿌리로 처리. 축/UV/기하 세부는 보존하고 피벗 아래1m로 이동."""
import bpy,json,math
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));changed=[]
for id in ['RF3_Ancient_Tree_A','RF3_Ancient_Tree_B','RF3_Root_Stump']:
 r=next(x for x in rows if x['id']==id)
 if r.get('매립깊이m'):continue
 unique={o.data for o in S.objects if o.type=='MESH'and(o.name==id or o.name.startswith(id+'_'))}
 for me in unique:
  for v in me.vertices:v.co.z-=1
  me.update()
 o=bpy.data.objects[id];r['매립깊이m']=1.;r['피벗계약']='피벗Z0=권장 지표/매립선. 하단1m는 뿌리 매립부이며 지면 위로 들어 올리지 않음. 시각 메시, 충돌 별도';r['bounds']=[min(v.co[k]for v in o.data.vertices)for k in range(3)]+[max(v.co[k]for v in o.data.vertices)for k in range(3)]
 bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(id+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False);o.hide_set(True);changed.append(id)
# 중앙 그루터기의 노출 높이는 유지하고 매립된 얇은 밑동만 물 아래로 내린다.
o=bpy.data.objects.get('배치_RF3_Root_Stump')
if o:o.scale.z=1.05
wood={bpy.data.objects[r['id']].data for r in rows if any(t in r['id']for t in ['Ancient_Tree','Root_Stump','Fallen_Log','Rotten_Wood_Bridge','Foreground_Branch','River_Stake'])};vs=[];fs=[]
for o in S.objects:
 if o.type=='MESH'and not o.hide_render and o.data in wood:
  b=len(vs);vs.extend(o.matrix_world@v.co for v in o.data.vertices);fs.extend(tuple(b+i for i in f.vertices)for f in o.data.polygons)
bvh=BVHTree.FromPolygons(vs,fs);moss=bpy.data.objects['RF3_Hanging_Moss'].data;top=max(v.co.z for v in moss.vertices)
for o in S.objects:
 if o.type=='MESH'and not o.hide_render and o.data==moss:
  anchor=o.matrix_world@Vector((0,0,top));hit,n,ix,d=bvh.find_nearest(anchor)
  if hit is not None and d<2.0:o.location+=hit-anchor+Vector((n.x*.12,n.y*.12,0))
(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');(R/'source/뿌리-매립선-계약.json').write_text(json.dumps({'대상':changed,'Z이동m':-1,'권장매립선':'피벗Z0','왜':'평면 스캔 바닥을 더 잘라 종잇장 림을 노출하는 방법 중단. 실제 지면 아래로 들어가는 뿌리 범위를 계약화','표면UV및노멀':'전 좌표 평행이동만. UV/삼각형/베이크 표면 불변','중앙그루터기배율Z':1.05,'게임실행':0},ensure_ascii=False,indent=2),encoding='utf8');S.render.resolution_percentage=45;S.cycles.samples=20;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/뿌리매립선_검수후보.blend'));S.render.filepath=str(R/'renders/실제매립선_접지검수.png');bpy.ops.render.render(write_still=True)
