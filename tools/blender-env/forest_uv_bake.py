import bpy,json,shutil
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/forest-r1');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest/Textures'
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));S=bpy.context.scene;S.render.engine='CYCLES';S.cycles.samples=1;S.render.threads_mode='FIXED';S.render.threads=10
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'));receipts=[];history=R/'source/투영색_변경전';history.mkdir(exist_ok=True)
for o in S.objects:
 if o.type=='MESH':o.hide_render=True;o.hide_set(True)
for r in rows:
 if r['id']=='RF_Forest_Vista_Card' or r.get('검증기존베이크재사용'):continue
 id=r['id'];lo=bpy.data.objects[id];hi=bpy.data.objects[id+'_High'];hi.hide_render=False;hi.hide_set(False)
 bpy.ops.object.select_all(action='DESELECT');hi.select_set(True);bpy.context.view_layer.objects.active=hi
 mats=list(hi.data.materials);S.render.bake.use_selected_to_active=False;S.render.bake.use_clear=True;S.render.bake.margin=12
 for kind in ['Normal','BaseColor','AO','Curvature','Roughness','Metallic']:
  path=P/(id+'_'+kind+'.png')
  if path.exists() and not (history/path.name).exists():shutil.copy2(path,history/path.name)
  im=bpy.data.images.new(id+'_공통UV_'+kind,width=r['텍스처해상도'],height=r['텍스처해상도'],alpha=False);im.colorspace_settings.name='sRGB' if kind=='BaseColor' else 'Non-Color';nodes=[]
  for m in mats:
   n=m.node_tree.nodes;l=m.node_tree.links;target=n.new('ShaderNodeTexImage');target.image=im;n.active=target;nodes.append((m,target));bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');out=next(x for x in n if x.type=='OUTPUT_MATERIAL')
   if kind not in ['AO','Normal']:
    em=n.new('ShaderNodeEmission');em.name='임시UV베이크'
    if kind=='Curvature':
     geom=n.new('ShaderNodeNewGeometry');geom.name='임시UV곡률';l.new(geom.outputs['Pointiness'],em.inputs[0])
    else:
     sock=bs.inputs['Base Color' if kind=='BaseColor' else kind]
     if sock.is_linked:l.new(sock.links[0].from_socket,em.inputs[0])
     elif kind=='BaseColor':em.inputs[0].default_value=sock.default_value
     else:em.inputs[0].default_value=(*([sock.default_value]*3),1)
    l.new(em.outputs[0],out.inputs['Surface'])
  S.cycles.samples=16 if kind=='AO' else 1;bpy.ops.object.bake(type='AO' if kind=='AO' else 'NORMAL' if kind=='Normal' else 'EMIT');im.filepath_raw=str(path);im.file_format='PNG';im.save()
  for m,node in nodes:
   n=m.node_tree.nodes;l=m.node_tree.links;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');out=next(x for x in n if x.type=='OUTPUT_MATERIAL');l.new(bs.outputs[0],out.inputs['Surface']);n.remove(node)
   for x in list(n):
    if x.name.startswith('임시UV'):n.remove(x)
  if kind=='BaseColor':shutil.copy2(path,R/'source/최종원베이크'/path.name)
 hi.hide_render=True;hi.hide_set(True);r['베이크']='공통 로우 UV를 물려받은 고해상도에서 tangent normal/색/AO/곡률/러프니스/금속 직접 UV 베이크. 로우가 같은 UV로 사용';receipts.append({'id':id,'맵':6,'입력하이폴리면':len(hi.data.polygons),'로우UV공유':True,'베이크선택투영':False});print('공통UV 베이크 완료',id,flush=True)
(R/'source/모듈명세.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');(R/'UV직접-베이크.json').write_text(json.dumps(receipts,ensure_ascii=False,indent=2),encoding='utf8')
# 기존 low 재질은 동일 파일 경로를 쓰므로 렌더 단계의 reload로 새 텍스처를 읽는다.
for im in bpy.data.images:
 if im.source=='FILE':im.filepath=bpy.path.abspath(im.filepath)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/숲_베이크.blend'))
