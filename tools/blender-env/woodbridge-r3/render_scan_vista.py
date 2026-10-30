"""상자형 먼 숲을 실제 CC0 거목의 가지/줄기 실루엣으로 교체. 게임/AI 생성 없음."""
import bpy,math,random,json
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene
for o in S.objects:o.hide_render=True;o.hide_set(True)
rng=random.Random(181030);placements=[]
for i in range(17):
 src=bpy.data.objects['RF3_Ancient_Tree_'+('A'if i%2==0 else'B')];o=src.copy();o.data=src.data.copy();S.collection.objects.link(o);o.name='실제숲카드_스캔거목';o.rotation_mode='XYZ';x=-25+i*3.1+rng.uniform(-1,1);y=rng.uniform(0,14);sc=rng.uniform(.55,.95);o.location=(x,y,0);o.scale=(sc,sc,sc*rng.uniform(.9,1.15));o.rotation_euler=(0,0,rng.random()*math.tau);o.hide_render=False;o.hide_set(False);m=bpy.data.materials.new('깊이별_숲실루엣');m.use_nodes=True;n=m.node_tree.nodes;n.clear();em=n.new('ShaderNodeEmission');u=y/14;em.inputs[0].default_value=(.018+.03*u,.028+.04*u,.030+.045*u,1);out=n.new('ShaderNodeOutputMaterial');m.node_tree.links.new(em.outputs[0],out.inputs['Surface']);o.data.materials.clear();o.data.materials.append(m)
 for f in o.data.polygons:f.material_index=0
 placements.append({'x':x,'y':y,'scale':list(o.scale),'yaw':o.rotation_euler.z})
bpy.ops.object.camera_add(location=(0,-45,11.4));cam=bpy.context.object;cam.rotation_euler=(Vector((0,5,11.4))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=54;S.camera=cam;S.render.resolution_x=2048;S.render.resolution_y=1024;S.render.resolution_percentage=100;S.render.film_transparent=True;S.render.image_settings.color_mode='RGBA';S.view_settings.view_transform='Standard';S.view_settings.look='None';S.view_settings.exposure=0;S.cycles.samples=8;S.render.filepath=str(R/'source/실제거목_숲실루엣_raw.png');bpy.ops.render.render(write_still=True);(R/'source/숲카드-실제스캔배치.json').write_text(json.dumps({'원본':'현재 RF3_Ancient_Tree_A/B·Poly Haven island_tree_01 생잎 제외','실루엣거목':placements,'규격':[2048,1024],'색':'깊이별 실제 렌더, 단색 기둥 생성0','경계':'먼 BACK 전용. 노멀/AO 등은 카드 기준 상수'},ensure_ascii=False,indent=2),encoding='utf8')
