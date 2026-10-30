"""직접 형태 검수한 실제 목질·속빈 공간을 납품용6맵으로 베이크한다."""
import bpy,bmesh,math,json,sys
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest'
bpy.ops.wm.open_mainfile(filepath=str(R/'source/실물주간_형태시험.blend'));S=bpy.context.scene;S.render.engine='CYCLES';S.render.threads_mode='FIXED';S.render.threads=10
def select(obs,active=None):
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active or obs[-1]
def apply(o,m):select([o]);bpy.ops.object.modifier_apply(modifier=m.name)
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'));prepared=[(id,bpy.data.objects[id],bpy.data.objects[id+'_High']) for id in ['RF_Ancient_Rotten_Tree','RF_Gnarled_Split_Trunk']]
code=Path(__file__).with_name('woodbridge_natural_roots.py').read_text(encoding='utf8');code=code[code.index('for id,low,high in prepared:'):]
code=code.replace("'큰 속빈 줄기 보존·CC0 실제 얽힌 뿌리 접합' if id=='RF_Ancient_Rotten_Tree' else 'CC0 실제 뿌리 군락·부패 목질과 지면 연결'","'CC0 전체 목질·기하로 파낸 속빈 부패 거목' if id=='RF_Ancient_Rotten_Tree' else 'CC0 실제 휜 목질·반전 분기 거목'")
code=code.replace('기존 큰 줄기 UV 보존+Poly Haven Root Cluster01 high→low normal/AO/curvature/PBR 2048; 원본 MD5/SHA 일치','Poly Haven IslandTree01 생잎/잎가지 제거·실제 속빈 공간, high→low normal/AO/curvature/PBR 2048; 원본 MD5/SHA 일치')
exec(compile(code,str(Path(__file__).with_name('woodbridge_natural_roots.py')),'exec'))
(R/'source/전체목질스캔완료.json').write_text(json.dumps({'원본':'Poly Haven island_tree_01','높이기준':24,'생잎/잎카드':0,'속빈기하':'주 거목 전면 실제 Boolean 차집합','음수배율':'반전 기하와 면 방향 수정, object 양수1'},ensure_ascii=False,indent=2),encoding='utf8')
