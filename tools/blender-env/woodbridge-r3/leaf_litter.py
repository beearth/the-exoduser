"""실물 잎의 독립 바닥 낙엽 모듈과 실제 접지 산포. 수면의 과한 반사도 낮춘다."""
import bpy,math,random,json
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/전경질량_검수후보.blend'));S=bpy.context.scene;rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));id='RF3_Dead_Leaf_Litter';rng=random.Random(3110);vs=[];fs=[];uvs=[]
for j in range(48):
 x=rng.uniform(-.7,.7);y=rng.uniform(-.7,.7);a=rng.random()*math.tau;L=rng.uniform(.14,.26);W=L*rng.uniform(.35,.48);slot=j%8;b=len(vs)
 for k in range(5):
  t=k/4
  for i in range(3):
   u=i/2;xx=(u-.5)*W;yy=(t-.5)*L;zz=.01+.025*math.sin(t*math.pi)**2+.015*abs(u-.5);vs.append((x+xx*math.cos(a)-yy*math.sin(a),y+xx*math.sin(a)+yy*math.cos(a),zz+.004*(j%3)));uvs.append(((slot%4+u)/4,(1-slot//4+(1-t))/2))
 for k in range(4):
  for i in range(2):q=b+k*3+i;fs.append((q,q+1,q+4,q+3))
me=bpy.data.meshes.new('실물낙엽48_곡면');me.from_pydata(vs,[],fs);me.update();uv=me.uv_layers.new(name='UVMap')
for f in me.polygons:
 f.use_smooth=True
 for loop in f.loop_indices:uv.data[loop].uv=uvs[me.loops[loop].vertex_index]
o=bpy.data.objects.new(id,me);S.collection.objects.link(o);m=bpy.data.materials.new(id+'_Baked');m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED');ims={}
for k in ['BaseColor','Normal','AO','Curvature','Roughness','Metallic']:
 im=bpy.data.images.load(str(P/'Textures'/(id+'_'+k+'.png')),check_existing=False);im.colorspace_settings.name='sRGB'if k=='BaseColor'else'Non-Color';ims[k]=im
for k,sock in [('BaseColor','Base Color'),('Roughness','Roughness'),('Metallic','Metallic')]:
 tx=n.new('ShaderNodeTexImage');tx.image=ims[k];l.new(tx.outputs[0],bs.inputs[sock])
 if k=='BaseColor':clip=n.new('ShaderNodeMath');clip.operation='GREATER_THAN';clip.inputs[1].default_value=.32;l.new(tx.outputs['Alpha'],clip.inputs[0]);l.new(clip.outputs[0],bs.inputs['Alpha'])
tx=n.new('ShaderNodeTexImage');tx.image=ims['Normal'];nm=n.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.25;l.new(tx.outputs[0],nm.inputs[1]);l.new(nm.outputs[0],bs.inputs['Normal']);me.materials.append(m);bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(id+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False);o.hide_render=True;o.hide_set(True)
rows=[r for r in rows if r['id']!=id];rows.append({'id':id,'역할':'실제 CC0 사진 잎48개의 갈색 낙엽·얕은 곡면·접지 산포용','정점':len(me.vertices),'저밀도삼각형':sum(len(f.vertices)-2 for f in me.polygons),'high':None,'high삼각형':None,'alpha':True,'BumpScale':.25,'텍스처규격':[1024,1024],'텍스처해상도':1024,'맵':{k:Path(im.filepath).name for k,im in ims.items()},'재질':m.name,'FBX':id+'.fbx','베이크':'CC0 잎 원본 RGBA/노멀 재배치·갈색 탈색. AO1·곡률.5·roughness235/255·metallic0 상수. 하이베이크 아님','bounds':[min(v.co[k]for v in me.vertices)for k in range(3)]+[max(v.co[k]for v in me.vertices)for k in range(3)]})
terrain=bpy.data.objects['RF3_Continuous_Bank_Terrain'];bvh=BVHTree.FromPolygons([v.co for v in terrain.data.vertices],[tuple(f.vertices)for f in terrain.data.polygons]);count=0
for ix in range(42):
 for iy in range(48):
  x=-14+ix*.7+rng.uniform(-.15,.15);y=-13+iy*.7+rng.uniform(-.15,.15)
  if abs(x)<2 and rng.random()<.60:continue
  hit,no,k,d=bvh.ray_cast(Vector((x,y,10)),Vector((0,0,-1)),20)
  if hit is None or hit.z<.12:continue
  q=o.copy();q.data=me;S.collection.objects.link(q);q.name='실물낙엽_접지';q.hide_render=False;q.hide_set(False);q.location=hit+Vector((0,0,.012));q.rotation_euler=no.to_track_quat('Z','Y').to_euler();q.rotation_euler.z+=rng.random()*math.tau;q.scale=(1,1,1);count+=1
water=bpy.data.materials['독액_기준대리물_비납품'];bs=next(q for q in water.node_tree.nodes if q.type=='BSDF_PRINCIPLED');bs.inputs['Specular IOR Level'].default_value=.20;bs.inputs['Roughness'].default_value=.24
(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');(R/'source/실물낙엽-배치.json').write_text(json.dumps({'모듈당잎':48,'접지군락':count,'실제잎합':count*48,'중앙진입축낮은밀도':True,'수면과낮은경사제외':True,'게임충돌변경':0},ensure_ascii=False,indent=2),encoding='utf8');S.render.resolution_percentage=45;S.cycles.samples=20;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/납엽전경_검수후보.blend'));S.render.filepath=str(R/'renders/실물낙엽_전경_반사검수.png');bpy.ops.render.render(write_still=True)
