"""성긴 수직 카드를 입체 이끼 다발로 재제작하고 판 모양 거품을 유기적인 막으로 교체."""
import bpy,math,json
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;id='RF3_Hanging_Moss';o=bpy.data.objects[id];old=o.data;mat=old.materials[0];vs=[];fs=[];uvs=[]
for j in range(320):
 src=bpy.data.objects[['moss_01_tall_a_LOD0','moss_01_tall_b_LOD0'][j%2]].data;mn=Vector([min(v.co[k]for v in src.vertices)for k in range(3)]);mx=Vector([max(v.co[k]for v in src.vertices)for k in range(3)]);a=j*2.399963;rad=math.sqrt((j+.5)/320);bx=.78*rad*math.cos(a);by=.32*rad*math.sin(a);basez=2.30+.12*math.cos(5*a);length=(.70+1.1*math.sqrt(max(.0,1-rad*rad)))*(.85+.15*math.sin(j*1.7));width=.035+.025*(.5+.5*math.sin(j*.9));yaw=j*1.57;base=len(vs)
 for v in src.vertices:
  t=(v.co.z-mn.z)/(mx.z-mn.z);x=((v.co.x-mn.x)/(mx.x-mn.x)-.5)*width;y=((v.co.y-mn.y)/(mx.y-mn.y)-.5)*width*.55;xx=x*math.cos(yaw)-y*math.sin(yaw);yy=x*math.sin(yaw)+y*math.cos(yaw);vs.append((bx+xx+.10*math.sin(t*3.6+a)*t,by+yy+.055*math.sin(t*5+a)*t,basez-length*t))
 for f in src.polygons:
  fs.append(tuple(base+i for i in f.vertices));uvs.extend(tuple(src.uv_layers.active.data[k].uv)for k in f.loop_indices)
me=bpy.data.meshes.new('입체_늘어진이끼_320');me.from_pydata(vs,[],fs);me.update();me.materials.append(mat);uv=me.uv_layers.new(name='UVMap')
for q,v in zip(uv.data,uvs):q.uv=v
for f in me.polygons:f.use_smooth=True
o.data=me
for q in S.objects:
 if q.data==old:q.data=me
bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(id+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False);o.hide_set(True)
rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));r=next(r for r in rows if r['id']==id);r.update({'역할':'CC0 원본 카드320개를 곡선·깊이·길이 변화로 묶은 입체 수염이끼 다발','high':None,'high삼각형':None,'정점':len(me.vertices),'저밀도삼각형':sum(len(f.vertices)-2 for f in me.polygons),'bounds':[min(v.co[k]for v in me.vertices)for k in range(3)]+[max(v.co[k]for v in me.vertices)for k in range(3)],'베이크':'CC0 원본 UV/노멀/Alpha와 톤 atlas 공유. 입체 다발320카드, AO1·곡률.5·roughness.9 상수'})
for r in rows:
 strength=.90 if any(x in r['id']for x in ['Ancient_Tree','Root_Stump'])else .65 if any(x in r['id']for x in ['Fallen_Log','Foreground_Branch','River_Stake'])else .45 if 'Terrain'in r['id']else .25 if r['alpha']and 'Vista'not in r['id']else .55
 r['BumpScale']=strength
 for m in bpy.data.objects[r['id']].data.materials:
  for n in m.node_tree.nodes:
   if n.type=='NORMAL_MAP':n.inputs['Strength'].default_value=strength
for im in bpy.data.images:
 if im.source=='FILE'and Path(bpy.path.abspath(im.filepath))==P/'Textures/Atlas_moss_01_BaseColor.png':
  if im.packed_file:im.unpack(method='REMOVE')
  im.reload()
# 실제 목질 표면으로 이끼 다발 윗부분을 다시 붙인다.
wooddata={bpy.data.objects[r['id']].data for r in rows if any(s in r['id']for s in ['Ancient_Tree','Root_Stump','Fallen_Log','Rotten_Wood_Bridge','Foreground_Branch','River_Stake'])};vv=[];ff=[]
for q in S.objects:
 if q.type=='MESH'and not q.hide_render and q.data in wooddata:
  b=len(vv);vv.extend(q.matrix_world@v.co for v in q.data.vertices);ff.extend(tuple(b+i for i in f.vertices)for f in q.data.polygons)
bvh=BVHTree.FromPolygons(vv,ff);top=max(v.co.z for v in me.vertices)
for q in S.objects:
 if q.type=='MESH'and not q.hide_render and q.data==me:
  anchor=q.matrix_world@Vector((0,0,top));hit,n,idx,d=bvh.find_nearest(anchor)
  if hit is not None:q.location+=hit-anchor
# 선형 사각 띠는 사용하지 않고 Alpha가 가장자리로 사라지는 얇은 흐름 막을 만든다.
for q in S.objects:
 if q.name in ['검수_연속거품','검수_강가거품띠']:q.hide_render=True
foam=bpy.data.materials.new('검수_유기거품막');foam.use_nodes=True;n=foam.node_tree.nodes;l=foam.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=(.105,.115,.046,1);bs.inputs['Roughness'].default_value=.65;g=n.new('ShaderNodeTexCoord');sep=n.new('ShaderNodeSeparateXYZ');l.new(g.outputs['UV'],sep.inputs[0]);offset=[]
for sock in ['X','Y']:
 a=n.new('ShaderNodeMath');a.operation='SUBTRACT';a.inputs[1].default_value=.5;l.new(sep.outputs[sock],a.inputs[0]);b=n.new('ShaderNodeMath');b.operation='MULTIPLY';l.new(a.outputs[0],b.inputs[0]);l.new(a.outputs[0],b.inputs[1]);offset.append(b.outputs[0])
add=n.new('ShaderNodeMath');add.operation='ADD';l.new(offset[0],add.inputs[0]);l.new(offset[1],add.inputs[1]);fade=n.new('ShaderNodeMapRange');fade.interpolation_type='SMOOTHERSTEP';fade.inputs['From Min'].default_value=.035;fade.inputs['From Max'].default_value=.24;fade.inputs['To Min'].default_value=.58;fade.inputs['To Max'].default_value=0;l.new(add.outputs[0],fade.inputs[0]);ge=n.new('ShaderNodeNewGeometry');noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=2.1;noise.inputs['Detail'].default_value=1.2;noise.inputs['Roughness'].default_value=.45;l.new(ge.outputs['Position'],noise.inputs[0]);mul=n.new('ShaderNodeMath');mul.operation='MULTIPLY';l.new(fade.outputs[0],mul.inputs[0]);l.new(noise.outputs['Fac'],mul.inputs[1]);l.new(mul.outputs[0],bs.inputs['Alpha'])
patches=[(-10,-5.3,1.7,.30,.1),(-6,-5.6,1.2,.22,-.1),(-2,-5.3,.8,.16,.1),(4,-5.2,1.0,.22,.1),(8,-5.5,1.5,.28,-.1),(-9,5.3,1.4,.25,.1),(-5,5.0,1.4,.20,.1),(4.6,4.8,1.2,.24,.2),(7.5,2.1,.6,.25,.7),(5.7,-.7,.7,.26,.2),(6.5,.6,.9,.25,1.2),(10.5,5.5,.8,.25,1.4)]
for i,(x,y,sx,sy,a)in enumerate(patches):
 v=[(x,y,-.078)];u=[(.5,.5)];f=[]
 for j in range(80):
  t=j*math.tau/80;rad=1+.13*math.sin(t*5+i)+.06*math.cos(t*9);xx=sx*rad*math.cos(t);yy=sy*rad*math.sin(t);v.append((x+xx*math.cos(a)-yy*math.sin(a),y+xx*math.sin(a)+yy*math.cos(a),-.078));u.append((.5+.5*math.cos(t),.5+.5*math.sin(t)))
 for j in range(80):f.append((0,j+1,(j+1)%80+1))
 mesh=bpy.data.meshes.new('거품막_'+str(i));mesh.from_pydata(v,[],f);mesh.materials.append(foam);layer=mesh.uv_layers.new(name='UVMap')
 for face in mesh.polygons:
  for k in face.loop_indices:layer.data[k].uv=u[mesh.loops[k].vertex_index]
 q=bpy.data.objects.new('검수_비정형거품막_'+str(i),mesh);S.collection.objects.link(q);q.visible_shadow=False
(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');S.render.resolution_percentage=38;S.cycles.samples=16;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/이끼거품_밀도수정.png');bpy.ops.render.render(write_still=True)
