"""분리 진단에서 확인한 별 모양 흙섬을 수면 아래 강바닥으로 내린다."""
import bpy,math,json,numpy as np
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;o=bpy.data.objects['RF3_Continuous_Bank_Terrain'];count=0
for v in o.data.vertices:
 x,y,z=v.co;north=y-(5.8+.5*math.sin(x*.4));south=(-6+.5*math.sin(x*.35))-y;right=6.7+.12*max(y,0)+1.3*math.sin(y*.23)-x;bank=max(south,min(north,right));foot=2.7*(1-math.sqrt(((x+7.3)/4.2)**2+((y+5.8)/3.5)**2));d=max(bank,foot);h=.62+.25*math.sin(x*.27+y*.16)+.14*math.sin(x*.67-y*.4);zz=-1.1+(h+1.1)*max(0,min(1,(d+1.4)/2.2))+.09*math.sin(x*2.1+y)*max(0,min(1,d+1))
 if math.hypot(x-6.2,y-.8)<6.0 and zz<z-.005:v.co.z=zz;count+=1
o.data.update();bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.export_scene.fbx(filepath=str(P/'Models/RF3_Continuous_Bank_Terrain.fbx'),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False);o.hide_set(True)
stump=bpy.data.objects['RF3_Root_Stump'].data;stakes=bpy.data.objects['RF3_River_Stake_Cluster'].data
for o in S.objects:
 if o.type=='MESH'and not o.hide_render:
  if o.data==stump:o.location.z-=.30
  if o.data==stakes:o.location.z+=.55
src=bpy.data.objects['RF3_Fallen_Log']
for j,a in enumerate([-1.4,-.4,.7]):
 o=src.copy();o.data=src.data;S.collection.objects.link(o);o.name='그루터기_침수뿌리';o.location=(6.2+1.1*math.cos(a),.8+1.1*math.sin(a),-.16);o.scale=(.42,.22,.22);o.rotation_euler.z=a;o.hide_render=False;o.hide_set(False)
rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));r=next(r for r in rows if r['id']=='RF3_Continuous_Bank_Terrain');r['역할']='연속 굴곡 강둑·좌측 거목 반도·강바닥. 분리 흙섬 없이 침수된 목질 뿌리로 접합';r['bounds']=[min(v.co[k]for v in bpy.data.objects[r['id']].data.vertices)for k in range(3)]+[max(v.co[k]for v in bpy.data.objects[r['id']].data.vertices)for k in range(3)];(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');(R/'source/흙섬-분리진단수정.json').write_text(json.dumps({'진단':'그루터기 메시를 숨겨도 회색 별모양 받침이 남아 terrain 섬으로 확정','수정':'분리된 흙섬만 강바닥으로 낮추고 목질 뿌리를 침수 접합. 남은 노출 강둑 면/UV 보존','낮춘정점':count,'그루터기침수':.30,'말뚝높이보정':.55},ensure_ascii=False,indent=2),encoding='utf8');S.render.resolution_percentage=38;S.cycles.samples=16;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/침수뿌리_최종확인.png');bpy.ops.render.render(write_still=True)
