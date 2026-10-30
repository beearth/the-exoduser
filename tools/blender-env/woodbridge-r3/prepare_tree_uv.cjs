const fs=require('fs'),r=__dirname,s=fs.readFileSync(r+'/bake_export.py','utf8');let head=s.slice(0,s.indexOf("opaque=['RF3_Ancient"));head=head.replaceAll('승인구도_베이크입력.blend','승인구도_납품동일.blend').replace("R/'source/모듈명세.json'","R/'source/모듈명세_납품.json'");let body=s.slice(s.indexOf('for id in opaque:'),s.indexOf('# 실제 Alpha 원본'));const a=body.indexOf(" print('실제 high"),b=body.indexOf(' clean(low);',a),u=body.indexOf(" if not low.data.uv_layers"),v=body.indexOf(' original=list(high.data.materials)',u);if([a,b,u,v].some(x=>x<0))throw Error('정확한 단계 경계');body=body.slice(0,a)+` print('원래 연속 UV 재베이크',id,flush=True);low=bpy.data.objects[id];old=low.data;clones=[o for o in S.objects if o!=low and o.data==old];src=bpy.data.objects[id+'_High'];high=src.copy();high.data=src.data.copy();high.name=id+'_연속UV_수피High';S.collection.objects.link(high);high.data.materials.clear();high.data.materials.append(detail)
 for f in high.data.polygons:f.material_index=0
 low.data=high.data.copy();de=low.modifiers.new('스캔형상보존60퍼센트','DECIMATE');de.ratio=.60;apply(low,de)
 for o in clones:o.data=low.data
 for f in low.data.polygons:f.use_smooth=True
 size=4096
`+body.slice(b,u)+` low.data.uv_layers.active_index=0
`+body.slice(v);body=body.replace("'high':high.name","'high':high.name,'수피추가':'CC0 bark_brown_02를10m 폭의 BOX 투사. 스캔 원래 UV를 보존한 low에6종4K 실제 베이크. 점 노이즈 대체0','텍스처규격':[4096,4096]");let extra=`
detail=bpy.data.materials['CC0_균열수피_추가표면'].copy();detail.name='큰균열수피_원래UV'
for n in detail.node_tree.nodes:
 if n.type=='VECT_MATH'and n.operation=='MULTIPLY':n.inputs[1].default_value=(.10,.10,.12)
 if n.type=='BUMP':n.inputs['Distance'].default_value=.18;n.inputs['Strength'].default_value=.65
opaque=['RF3_Ancient_Tree_A','RF3_Ancient_Tree_B','RF3_Root_Stump']
`;let end=`
for id in opaque:
 low=bpy.data.objects[id];select([low]);bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(id+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False);low.hide_render=True;low.hide_set(True);r=next(x for x in rows if x['id']==id);r.update({'재질':low.data.materials[0].name,'정점':len(low.data.vertices),'저밀도삼각형':sum(len(f.vertices)-2 for f in low.data.polygons),'high삼각형':sum(len(f.vertices)-2 for f in bpy.data.objects[r['high']].data.polygons),'bounds':[min(v.co[k]for v in low.data.vertices)for k in range(3)]+[max(v.co[k]for v in low.data.vertices)for k in range(3)]})
for name,(render,hide)in visibility.items():
 o=bpy.data.objects.get(name)
 if o:o.hide_render=render;o.hide_set(hide)
(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');S.render.resolution_percentage=45;S.cycles.samples=20;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/연속UV_수피4K.png');bpy.ops.render.render(write_still=True)
`;fs.writeFileSync(r+'/rebake_tree_uv.py',head+extra+body+end);console.log('연속 UV 재베이크 레시피 생성');
