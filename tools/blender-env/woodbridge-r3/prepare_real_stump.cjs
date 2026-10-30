const fs=require('fs'),r=__dirname,s=fs.readFileSync(r+'/bake_export.py','utf8');let head=s.slice(0,s.indexOf("opaque=['RF3_Ancient"));head=head.replaceAll('승인구도_베이크입력.blend','승인구도_납품동일.blend').replace("R/'source/모듈명세.json'","R/'source/모듈명세_납품.json'");let body=s.slice(s.indexOf('for id in opaque:'),s.indexOf('# 실제 Alpha 원본'));const a=body.indexOf(" print('실제 high"),b=body.indexOf(' clean(low);',a),u=body.indexOf(" if not low.data.uv_layers"),v=body.indexOf(' original=list(high.data.materials)',u);body=body.slice(0,a)+` print('실제 전체 부패 그루터기 재베이크',id,flush=True);low=bpy.data.objects[id];old=low.data;clones=[o for o in S.objects if o!=low and o.data==old]
 with bpy.data.libraries.load(str(R/'source/실제그루터기_제작입력.blend'),link=False)as(a,b):b.objects=['실제_부패그루터기_원본UVHigh']
 high=b.objects[0];S.collection.objects.link(high);high.name=id+'_실제부패High';high.rotation_mode='XYZ'
 for v in high.data.vertices:
  rad=math.hypot(v.co.x,v.co.y);t=max(0,min(1,(rad-1.25)/1.05));smooth=t*t*(3-2*t);gain=1+.55*(1-min(1,rad/2.75))**2;v.co.x*=gain;v.co.y*=gain;v.co.z-=.90*smooth
  if rad>2.45:v.co.z=min(v.co.z,-.15)
 low.data=high.data.copy();de=low.modifiers.new('실제그루터기_35퍼센트','DECIMATE');de.ratio=.35;apply(low,de)
 for q in clones:q.data=low.data
 for f in low.data.polygons:f.use_smooth=True
 size=2048
`+body.slice(b,u)+` low.data.uv_layers.active_index=0
`+body.slice(v);body=body.replace("'high':high.name","'high':high.name,'텍스처규격':[2048,2048],'매립깊이m':.9,'피벗계약':'피벗Z0=지표. 바깥 원본 흙 가장자리는Z음수 매립. 중심 목질을 넓힌 실제 전체 그루터기 스캔','역할':'실제 부패 그루터기 tree_stump_01·노출 뿌리·큰 목질·원본UV·흙 받침 매립','그루터기후속':'속빈 나무를 잘라 만든 껍질형 밑동 폐기. 실제 전체 스캔·원본 UV·6맵2K 실제 베이크'");let end=`
id='RF3_Root_Stump';o=bpy.data.objects[id];select([o]);bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(id+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False);o.hide_render=True;o.hide_set(True);r=next(x for x in rows if x['id']==id);r.update({'재질':o.data.materials[0].name,'정점':len(o.data.vertices),'저밀도삼각형':sum(len(f.vertices)-2 for f in o.data.polygons),'high삼각형':sum(len(f.vertices)-2 for f in high.data.polygons),'bounds':[min(v.co[k]for v in o.data.vertices)for k in range(3)]+[max(v.co[k]for v in o.data.vertices)for k in range(3)]});r.pop('수피추가',None)
for name,(render,hide)in visibility.items():
 restore_obj=bpy.data.objects.get(name)
 if restore_obj:restore_obj.hide_render=render;restore_obj.hide_set(hide)
stumps={q.data for q in S.objects if q.name.startswith('RF3_Root_Stump')};vv=[];ff=[]
for q in S.objects:
 if q.type=='MESH'and not q.hide_render and q.data==o.data:
  a=len(vv);vv.extend(q.matrix_world@v.co for v in q.data.vertices);ff.extend(tuple(a+i for i in f.vertices)for f in q.data.polygons)
from mathutils.bvhtree import BVHTree
from mathutils import Vector
bvh=BVHTree.FromPolygons(vv,ff);moss=bpy.data.objects['RF3_Hanging_Moss'].data;fungal=bpy.data.objects['RF3_Fungal_Colony'].data;top=max(v.co.z for v in moss.vertices)
for q in S.objects:
 if q.type!='MESH'or q.hide_render or q.data not in {moss,fungal}:continue
 anchor=q.matrix_world@Vector((0,0,top))if q.data==moss else q.location.copy();hit,n,ix,d=bvh.find_nearest(anchor)
 if hit is not None and d<1.3:
  if math.hypot(n.x,n.y)>.1:q.rotation_euler.z=math.atan2(n.y,n.x)+math.pi/2
  q.location=hit+Vector((n.x*.12,n.y*.12,-top*q.scale.z))if q.data==moss else hit+Vector((n.x*.015,n.y*.015,-.04))
(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');S.render.resolution_percentage=45;S.cycles.samples=20;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/실제전체그루터기_접지조립.png');bpy.ops.render.render(write_still=True)
`;fs.writeFileSync(r+'/bake_real_stump.py',head+"opaque=['RF3_Root_Stump']\n"+body+end);console.log('실제 전체 그루터기 제작법 전환 레시피');
