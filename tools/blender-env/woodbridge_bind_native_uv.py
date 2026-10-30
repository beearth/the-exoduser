"""원본 사진 UV와 게임 베이크 UV를 분리한다. 원본 UV 불변을 실제 좌표 SHA로 검사."""
import bpy,bmesh,json,hashlib,array
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest'
if (R/'source/원본UV확정완료.json').exists():print('원본 UV 명시/재베이크 이미 완료',flush=True);raise SystemExit(0)
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));S=bpy.context.scene;S.render.engine='CYCLES';S.render.threads_mode='FIXED';S.render.threads=10;prepared=[];proof=[]
def digest(o,name):
 a=array.array('f');a.fromlist([c for uv in o.data.uv_layers[name].data for c in uv.uv]);return hashlib.sha256(a.tobytes()).hexdigest()
for id in ['RF_Ancient_Rotten_Tree','RF_Gnarled_Split_Trunk','RF_Fractured_Stump']:
 high=bpy.data.objects[id+'_High'];candidate=next((u.name for u in high.data.uv_layers if u.name!='UVMap'),high.data.uv_layers[0].name);high.data.uv_layers[candidate].name='원본목질UV';original='원본목질UV';before=digest(high,original);mat=high.data.materials[0].copy();high.data.materials[0]=mat;n=mat.node_tree.nodes;l=mat.node_tree.links;uv=n.new('ShaderNodeUVMap');uv.uv_map=original
 for tx in n:
  if tx.type=='TEX_IMAGE':l.new(uv.outputs[0],tx.inputs['Vector'])
  if tx.type=='NORMAL_MAP':tx.uv_map=original
 high.data.uv_layers.active_index=high.data.uv_layers.find(original)
 for u in high.data.uv_layers:u.active_render=u.name==original
 prepared.append((id,bpy.data.objects[id],high));proof.append({'id':id,'입력레이어명':candidate,'원본UV':original,'베이크전원본UV_SHA256':before});print('원본 UV 명시',id,candidate,'→',original,flush=True)
def select(obs,active=None):
 # 숨김 상태에 남은 선택 플래그도 해제하여 다중 오브젝트 UV 편집을 막는다.
 for o in bpy.context.view_layer.objects:o.select_set(False)
 for o in obs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active or obs[-1]
def apply(o,m):select([o]);bpy.ops.object.modifier_apply(modifier=m.name)
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'));code=Path(__file__).with_name('woodbridge_natural_roots.py').read_text(encoding='utf8');code=code[code.index('for id,low,high in prepared:'):];code=code.replace("'큰 속빈 줄기 보존·CC0 실제 얽힌 뿌리 접합' if id=='RF_Ancient_Rotten_Tree' else 'CC0 실제 뿌리 군락·부패 목질과 지면 연결'","'원본 사진UV 명시·CC0 실제 목질·실제 공동/파단 기하'").replace('기존 큰 줄기 UV 보존+Poly Haven Root Cluster01 high→low normal/AO/curvature/PBR 2048; 원본 MD5/SHA 일치','CC0 원본 UV 명시·원본 UV불변 SHA 검사·원본닫힌 목질/그루터기 실제 내벽에서 새 게임UV로6맵 재투영');exec(compile(code,str(Path(__file__)),'exec'))
for row,(_,_,high) in zip(proof,prepared):row['베이크후원본UV_SHA256']=digest(high,row['원본UV']);assert row['베이크후원본UV_SHA256']==row['베이크전원본UV_SHA256'],'원본 UV가 편집됨'
(R/'source/원본UV확정완료.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2),encoding='utf8');print('원본 UV 명시/좌표 SHA 불변3종',proof,flush=True)
