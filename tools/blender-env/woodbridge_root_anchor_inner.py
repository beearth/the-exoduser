"""뿌리의 실제 접합 밑동과 내벽 목질 재질을 완성한다. 같은 후보 전체를 다시 베이크."""
import bpy,bmesh,json
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest';
if (R/'source/뿌리접합내벽완료.json').exists():print('이미 적용됨. 현재 원본의 중복 변형 없음',flush=True);raise SystemExit(0)
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));S=bpy.context.scene;S.render.engine='CYCLES';S.render.threads_mode='FIXED';S.render.threads=10
def select(obs,active=None):
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active or obs[-1]
def apply(o,m):select([o]);bpy.ops.object.modifier_apply(modifier=m.name)
stem=bpy.data.objects['RF_Fractured_Stump']
for suff in ['', '_High']:
 root=bpy.data.objects['RF_Foreground_Roots'+suff];part=stem.copy();part.data=stem.data.copy();S.collection.objects.link(part)
 for v in part.data.vertices:v.co.x*=.35;v.co.y*=.35;v.co.z*=.70
 part.data.uv_layers.active.name='원본UV'
 for i,mat in enumerate(list(part.data.materials)):
  mat=mat.copy();part.data.materials[i]=mat;n=mat.node_tree.nodes;l=mat.node_tree.links;uv=n.new('ShaderNodeUVMap');uv.uv_map='원본UV'
  for tx in n:
   if tx.type=='TEX_IMAGE':l.new(uv.outputs[0],tx.inputs[0])
   if tx.type=='NORMAL_MAP':tx.uv_map='원본UV'
 select([root,part],root);bpy.ops.object.join();root.hide_render=True;root.hide_set(True)
for id in ['RF_Ancient_Rotten_Tree','RF_Gnarled_Split_Trunk','RF_Fractured_Stump']:
 high=bpy.data.objects[id+'_High']
 for mat in high.data.materials:
  if not mat or '_썩은내벽' not in mat.name:continue
  n=mat.node_tree.nodes;l=mat.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED');g=n.new('ShaderNodeTexCoord');v=n.new('ShaderNodeVectorMath');v.operation='MULTIPLY';v.inputs[1].default_value=(.35,.35,.55);l.new(g.outputs['Object'],v.inputs[0]);tx=n.new('ShaderNodeTexImage');tx.image=bpy.data.images.load('I:/EXODUSER-Storage/demo-art/blender-env/forest-r1/pbr-source/fine_grained_wood_Diffuse.jpg');tx.projection='BOX';tx.projection_blend=.25;l.new(v.outputs[0],tx.inputs[0]);mix=n.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;mix.inputs[2].default_value=(.28,.20,.12,1);l.new(tx.outputs[0],mix.inputs[1]);l.new(mix.outputs[0],bs.inputs['Base Color']);bu=n.new('ShaderNodeBump');bu.inputs['Strength'].default_value=.18;bu.inputs['Distance'].default_value=.035;l.new(tx.outputs[0],bu.inputs['Height']);l.new(bu.outputs[0],bs.inputs['Normal'])
prepared=[(id,bpy.data.objects[id],bpy.data.objects[id+'_High']) for id in ['RF_Foreground_Roots','RF_Ancient_Rotten_Tree','RF_Gnarled_Split_Trunk','RF_Fractured_Stump']];rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'));code=Path(__file__).with_name('woodbridge_natural_roots.py').read_text(encoding='utf8');code=code[code.index('for id,low,high in prepared:'):];code=code.replace("'큰 속빈 줄기 보존·CC0 실제 얽힌 뿌리 접합' if id=='RF_Ancient_Rotten_Tree' else 'CC0 실제 뿌리 군락·부패 목질과 지면 연결'","'실제 CC0 파단목질7갈래·실물 밑동 접합 노출뿌리' if id=='RF_Foreground_Roots' else 'CC0 실제 목질·20cm 두께·결이 있는 부패 내벽 거목/밑동'").replace('기존 큰 줄기 UV 보존+Poly Haven Root Cluster01 high→low normal/AO/curvature/PBR 2048; 원본 MD5/SHA 일치','실제 CC0 목질·접합 밑동·목재 내벽 high→low normal/AO/curvature/PBR 2048; 종잇장/분리 뿌리 후보 재작업');exec(compile(code,str(Path(__file__)),'exec'))
(R/'source/뿌리접합내벽완료.json').write_text(json.dumps({'뿌리':'실제 파단목질7갈래+실제 밑동의XY.35/Z.70 접합','내벽':'CC0 FineGrainedWood box scale(.35,.35,.55), tint(.28,.20,.12), bump.18/.035','기하':'20cm두께 실제표면 전체6맵 재베이크'},ensure_ascii=False,indent=2),encoding='utf8')
