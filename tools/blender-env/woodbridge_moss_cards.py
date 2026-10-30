"""굵은 줄 이끼 대신 실제 CC0 식생의 알파를 가진 굽은 면 군락. 상수맵을 베이크라 부르지 않는다."""
import bpy,math,json
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest';id='RF_Hanging_Moss'
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));S=bpy.context.scene
for suff in ['', '_High']:
 o=bpy.data.objects.get(id+suff)
 if o:bpy.data.objects.remove(o,do_unlink=True)
vs=[];fs=[];uvs=[]
for j in range(96):
 x=-1.30+(j%16)*.17+.06*math.sin(j*4);z=2.35-(j//16)*.16;w=.17+.12*(.5+.5*math.sin(j*1.9));h=.95+.90*(.5+.5*math.sin(j*2.73));yaw=.75*math.sin(j*1.3);base=len(vs)
 u0,u1=(.255,.37) if j%2 else (.43,.52)
 for k in range(9):
  t=k/8;xx=x+.12*math.sin(t*3+j);y=-.12*(j//16)-.34*math.sin(t*2.5);zz=z-h*t
  for q in [-1,1]:vs.append((xx+q*w*.5*math.cos(yaw),y+q*w*.5*math.sin(yaw),zz))
 for k in range(8):
  a=base+k*2;v0=.45+.49*k/8;v1=.45+.49*(k+1)/8;fs.extend([(a,a+1,a+3),(a,a+3,a+2)]);uvs.extend([[(u0,v0),(u1,v0),(u1,v1)],[(u0,v0),(u1,v1),(u0,v1)]])
me=bpy.data.meshes.new(id+'_CC0알파');me.from_pydata(vs,[],fs);me.update();uv=me.uv_layers.new(name='UVMap')
for f,coords in zip(me.polygons,uvs):
 for li,co in zip(f.loop_indices,coords):uv.data[li].uv=co
 f.use_smooth=True
o=bpy.data.objects.new(id,me);S.collection.objects.link(o);m=bpy.data.materials.new(id+'_베이크표적');m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED');tx=n.new('ShaderNodeTexImage');tx.image=bpy.data.images.load(str(P/'Textures'/(id+'_BaseColor.png')),check_existing=False);l.new(tx.outputs['Color'],bs.inputs['Base Color']);cut=n.new('ShaderNodeMath');cut.operation='GREATER_THAN';cut.inputs[1].default_value=.35;l.new(tx.outputs['Alpha'],cut.inputs[0]);l.new(cut.outputs[0],bs.inputs['Alpha']);bs.inputs['Roughness'].default_value=.92
tx=n.new('ShaderNodeTexImage');tx.image=bpy.data.images.load(str(P/'Textures'/(id+'_Normal.png')),check_existing=False);tx.image.colorspace_settings.name='Non-Color';nm=n.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.45;l.new(tx.outputs[0],nm.inputs['Color']);l.new(nm.outputs[0],bs.inputs['Normal']);me.materials.append(m);o.hide_render=True;o.hide_set(True)
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'))
for row in rows:
 if row['id']==id:row.update({'역할':'공식 CC0 이끼 알파·긴줄기2셀·굽은96면군락·회갈색 수염 부피','정점':len(vs),'삼각형':len(fs),'하이폴리면':0,'텍스처해상도':2048,'알파':True,'범위XYZ최소최대':[min(p[k] for p in vs) for k in range(3)]+[max(p[k] for p in vs) for k in range(3)],'베이크':'CC0 Moss01 원본 알파/노멀 유지. AO1·곡률.5·rough235/255·metal0는 상수, 기하 베이크 아님'})
(R/'source/모듈명세.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');(R/'source/이끼알파완료.json').write_text(json.dumps({'CC0원본':'moss_01','굽은면':96,'삼각형':len(fs),'알파컷':.35},ensure_ascii=False),encoding='utf8');bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/숲_베이크.blend'));print('CC0 알파 이끼96면군락',len(fs),'삼각형',flush=True)
