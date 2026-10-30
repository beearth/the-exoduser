const fs=require('fs'),r=__dirname,s=fs.readFileSync(r+'/bake_export.py','utf8');let head=s.slice(0,s.indexOf("opaque=['RF3_Ancient"));head=head.replaceAll('승인구도_베이크입력.blend','뿌리매립선_검수후보.blend').replace("R/'source/모듈명세.json'","R/'source/모듈명세_납품.json'");let body=s.slice(s.indexOf('for id in opaque:'),s.indexOf('# 실제 Alpha 원본'));const a=body.indexOf(" print('실제 high"),b=body.indexOf(' clean(low);',a),u=body.indexOf(" if not low.data.uv_layers"),v=body.indexOf(' original=list(high.data.materials)',u);body=body.slice(0,a)+` print('원본 UV 암반2K 재베이크',id,flush=True);low=bpy.data.objects[id];old=low.data;clones=[o for o in S.objects if o!=low and o.data==old];src=bpy.data.objects[id+'_High'];high=src.copy();high.data=src.data.copy();high.name=id+'_원본UVHigh';S.collection.objects.link(high)
 for i,m in enumerate(list(high.data.materials)):
  cp=m.copy();high.data.materials[i]=cp;n=cp.node_tree.nodes;l=cp.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED');prev=bs.inputs['Base Color'].links[0].from_socket;mul=n.new('ShaderNodeMixRGB');mul.blend_type='MULTIPLY';mul.inputs[0].default_value=1;mul.inputs[2].default_value=(.58,.65,.46,1);l.new(prev,mul.inputs[1]);l.new(mul.outputs[0],bs.inputs['Base Color'])
 low.data=high.data.copy();de=low.modifiers.new('스캔원래UV_형상보존','DECIMATE');de.ratio=.75;apply(low,de)
 for o in clones:o.data=low.data
 for f in low.data.polygons:f.use_smooth=True
 size=2048
`+body.slice(b,u)+` low.data.uv_layers.active_index=0
`+body.slice(v);body=body.replace("'high':high.name","'high':high.name,'텍스처규격':[2048,2048],'암반후속':'원래 스캔UV·75퍼센트 기하 보존,6맵2K 실제 재베이크. 자동UV 조각화 세부 손실을 수정'");const end=`
for id in opaque:
 o=bpy.data.objects[id];select([o]);bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(id+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False);o.hide_render=True;o.hide_set(True);r=next(x for x in rows if x['id']==id);r.update({'재질':o.data.materials[0].name,'정점':len(o.data.vertices),'저밀도삼각형':sum(len(f.vertices)-2 for f in o.data.polygons),'high삼각형':sum(len(f.vertices)-2 for f in bpy.data.objects[r['high']].data.polygons),'bounds':[min(v.co[k]for v in o.data.vertices)for k in range(3)]+[max(v.co[k]for v in o.data.vertices)for k in range(3)]})
for name,(render,hide)in visibility.items():
 o=bpy.data.objects.get(name)
 if o:o.hide_render=render;o.hide_set(hide)
(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');S.render.resolution_percentage=45;S.cycles.samples=20;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/매립뿌리_원본UV암반.png');bpy.ops.render.render(write_still=True)
`;fs.writeFileSync(r+'/rebake_rock_uv.py',head+"opaque=['RF3_Moss_Rock_1','RF3_Moss_Rock_2','RF3_Moss_Rock_3']\n"+body+end);console.log('원래 스캔UV 암반 재베이크 레시피');
