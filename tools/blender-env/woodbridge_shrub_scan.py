"""성긴 관형 덤불을 실제 CC0 잎/줄기 알파의 마른 식생으로 교체한다."""
import bpy,bmesh,json
from pathlib import Path
from mathutils import Vector,Matrix
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest';id='RF_Withered_Shrub';bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));S=bpy.context.scene
before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(R/'pbr-source/shrub_03/shrub_03.gltf'));bpy.context.view_layer.update();obs=[o for o in bpy.data.objects if o not in before and o.type=='MESH'];o=max(obs,key=lambda x:len(x.data.polygons))
for q in obs:
 if q!=o:bpy.data.objects.remove(q,do_unlink=True)
o.data.transform(o.matrix_world);o.parent=None;o.matrix_world=Matrix.Identity(4);ps=[v.co for v in o.data.vertices];mn=Vector([min(p[k] for p in ps) for k in range(3)]);mx=Vector([max(p[k] for p in ps) for k in range(3)]);scale=1.15/(mx.z-mn.z);c=Vector(((mn.x+mx.x)/2,(mn.y+mx.y)/2,mn.z))
for v in o.data.vertices:
 p=(v.co-c)*scale;p.x+=.12*p.z*p.z;p.z*=.88;v.co=p
for suff in ['', '_High']:
 old=bpy.data.objects.get(id+suff)
 if old:bpy.data.objects.remove(old,do_unlink=True)
o.name=id;bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;tri=o.modifiers.new('고정삼각화','TRIANGULATE');bpy.ops.object.modifier_apply(modifier=tri.name);bm=bmesh.new();bm.from_mesh(o.data);bad=[f for f in bm.faces if f.calc_area()<1e-9]
if bad:bmesh.ops.delete(bm,geom=bad,context='FACES')
loose=[v for v in bm.verts if not v.link_faces]
if loose:bmesh.ops.delete(bm,geom=loose,context='VERTS')
bm.to_mesh(o.data);bm.free();o.data.update();m=bpy.data.materials.new(id+'_베이크표적');m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED');tx=n.new('ShaderNodeTexImage');tx.image=bpy.data.images.load(str(P/'Textures'/(id+'_BaseColor.png')),check_existing=False);l.new(tx.outputs['Color'],bs.inputs['Base Color']);cut=n.new('ShaderNodeMath');cut.operation='GREATER_THAN';cut.inputs[1].default_value=.35;l.new(tx.outputs['Alpha'],cut.inputs[0]);l.new(cut.outputs[0],bs.inputs['Alpha']);bs.inputs['Roughness'].default_value=.92;tx=n.new('ShaderNodeTexImage');tx.image=bpy.data.images.load(str(P/'Textures'/(id+'_Normal.png')),check_existing=False);tx.image.colorspace_settings.name='Non-Color';nm=n.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.45;l.new(tx.outputs[0],nm.inputs['Color']);l.new(nm.outputs[0],bs.inputs['Normal']);o.data.materials.clear();o.data.materials.append(m)
for f in o.data.polygons:f.material_index=0
o.hide_render=True;o.hide_set(True);rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'))
for row in rows:
 if row['id']==id:row.update({'역할':'CC0 실제 줄기·잎·씨앗의 시든 적갈색 저층 덤불','정점':len(o.data.vertices),'삼각형':len(o.data.polygons),'하이폴리면':0,'텍스처해상도':2048,'알파':True,'범위XYZ최소최대':[min(v.co[k] for v in o.data.vertices) for k in range(3)]+[max(v.co[k] for v in o.data.vertices) for k in range(3)],'베이크':'CC0 shrub_03 원본 UV·별도Alpha·노멀 유지, 색만 마른 톤. AO1/곡률.5/rough235/255/metal0 상수, 실제AO 베이크 아님'})
(R/'source/모듈명세.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');(R/'source/덤불알파완료.json').write_text(json.dumps({'CC0원본':'shrub_03','삼각형':len(o.data.polygons),'알파컷':.35},ensure_ascii=False),encoding='utf8');bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/숲_베이크.blend'));print('CC0 시든 덤불',len(o.data.polygons),'삼각형',flush=True)
