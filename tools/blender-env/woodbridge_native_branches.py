"""닫힌 스캔 가지에 겹껍질을 만들지 않는다. 원본 목질 기하 보존·UV/PBR 재투영."""
import bpy,bmesh,json
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest'
if (R/'source/원본가지보존완료.json').exists():print('이미 원본 가지 보존 적용',flush=True);raise SystemExit(0)
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));S=bpy.context.scene;S.render.engine='CYCLES';S.render.threads_mode='FIXED';S.render.threads=10;ids=('RF_Ancient_Rotten_Tree','RF_Gnarled_Split_Trunk')
with bpy.data.libraries.load(str(R/'source/두께오류복구/깨끗한기하.blend'),link=False) as (a,b):b.objects=[id+'_High' for id in ids]
prepared=[]
for id,source in zip(ids,b.objects):
 for suff in ['', '_High']:
  target=bpy.data.objects[id+suff];target.data=source.data.copy();target.hide_render=True;target.hide_set(True)
 bpy.data.objects.remove(source,do_unlink=True);high=bpy.data.objects[id+'_High']
 if id=='RF_Ancient_Rotten_Tree':
  cutfaces=sum(f.material_index==3 for f in high.data.polygons);assert cutfaces>10,'실제 절삭 공동을 보존해야 한다';mat=high.data.materials[3].copy();high.data.materials[3]=mat;n=mat.node_tree.nodes;l=mat.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED');g=n.new('ShaderNodeTexCoord');v=n.new('ShaderNodeVectorMath');v.operation='MULTIPLY';v.inputs[1].default_value=(.35,.35,.55);l.new(g.outputs['Object'],v.inputs[0]);tx=n.new('ShaderNodeTexImage');tx.image=bpy.data.images.load('I:/EXODUSER-Storage/demo-art/blender-env/forest-r1/pbr-source/fine_grained_wood_Diffuse.jpg');tx.projection='BOX';tx.projection_blend=.25;l.new(v.outputs[0],tx.inputs[0]);tone=n.new('ShaderNodeMixRGB');tone.blend_type='MULTIPLY';tone.inputs[0].default_value=1;tone.inputs[2].default_value=(.28,.20,.12,1);l.new(tx.outputs[0],tone.inputs[1]);l.new(tone.outputs[0],bs.inputs['Base Color']);bu=n.new('ShaderNodeBump');bu.inputs['Strength'].default_value=.18;bu.inputs['Distance'].default_value=.035;l.new(tx.outputs[0],bu.inputs['Height']);l.new(bu.outputs[0],bs.inputs['Normal'])
 prepared.append((id,bpy.data.objects[id],high))
def select(obs,active=None):
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active or obs[-1]
def apply(o,m):select([o]);bpy.ops.object.modifier_apply(modifier=m.name)
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'));code=Path(__file__).with_name('woodbridge_natural_roots.py').read_text(encoding='utf8');code=code[code.index('for id,low,high in prepared:'):];code=code.replace("'큰 속빈 줄기 보존·CC0 실제 얽힌 뿌리 접합' if id=='RF_Ancient_Rotten_Tree' else 'CC0 실제 뿌리 군락·부패 목질과 지면 연결'","'CC0 원본 닫힌 목질·실제 부패 공동·가지 겹껍질0' if id=='RF_Ancient_Rotten_Tree' else 'CC0 원본 휜 분기 목질·가지 겹껍질0'").replace('기존 큰 줄기 UV 보존+Poly Haven Root Cluster01 high→low normal/AO/curvature/PBR 2048; 원본 MD5/SHA 일치','CC0 원본 목질 기하 보존(추가 decimation0)·원본 UV/PBR에서 새 게임UV로6맵 재투영. High/Low 동일 원본 표면, 추가 스컬프 high 주장 안 함');exec(compile(code,str(Path(__file__)),'exec'))
(R/'source/원본가지보존완료.json').write_text(json.dumps({'원인':'닫힌 얇은 가지까지 .2m 겹껍질을 추가해 안쪽 면이 바깥으로 돌출','확인':'얇은가지-원인검사.json,표본50/3819·108/4119 실제 외부 돌출','수정':'거목2종은 닫힌 원본 목질 기하를 그대로 유지·추가겹면0, main 실제 절삭 공동 보존','베이크':'원본 기하 보존, 새 UV로 Normal/AO/Curvature/PBR 재투영. 원본보다 고밀도 sculpt라고 주장하지 않음'},ensure_ascii=False,indent=2),encoding='utf8')
