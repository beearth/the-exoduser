# Asset-format conversion only; source GLBs remain untouched.
# Run: Blender -b --factory-startup -P this_file.py -- [--out DIR] [--only key,key] </dev/null
#
# 11-04 30-species converter. It REPLACES import-pilots.py (kept untouched for history): the old script converted only the five first-wave
# bipeds with a single walk clip renamed "Walk". This one converts all 30 *_anim_v1.glb of the 1-1 enemies (clips keep the GLB names:
# idle, walk, hit, stagger, death, attack_tele ...), bakes 60 fps (1 frame = 1 Core tick), keeps the weapon props + WeaponSocket_R/L of
# ritual/duelist/warden, turns the 9 non-human rigs (Tripo bones, source front = Blender world -X) so their front is -Y like the Meshy bipeds,
# and freezes the horizontal root travel of locomotion clips (Core moves the body). Palette conversion (8 flat planes) is unchanged.
# Provenance: Resources/Enemies3D/enemy3d-provenance.json (the old pilot-provenance.json is left as is).
import bpy, sys, os, json, math, time
from mathutils import Vector, Matrix
BASE='I:/EXODUSER-Storage/boss/enemy3d-20261104/'
DEFAULT_OUT=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../Assets/Exoduser/Resources/Enemies3D'))
argv=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
OUT=DEFAULT_OUT;ONLY=None
for i,a in enumerate(argv):
 if a=='--out':OUT=os.path.abspath(argv[i+1])
 if a=='--only':ONLY=argv[i+1].split(',')
os.makedirs(OUT,exist_ok=True)
# key, resource name, etype, Tripo non-human
MODELS=[('lesser','LesserApostle',0,False),('spine','SpineApostle',1,False),('imp','Imp',3,False),('carapace2','CarapaceApostleV2',4,False),('eyemass','EyeMass',4,True),
 ('fetal','FetalDemon',5,True),('ironclad','IroncladApostle',6,False),('sage','SageApostle',7,False),('bloated','BloatedApostle',8,False),('ritual','RitualApostle',9,False),
 ('shadow','ShadowApostle',10,False),('womb','WombApostle',11,True),('berserk','BerserkApostle',12,False),('spider','SpiderApostle',13,True),('winged','WingedApostle',14,False),
 ('worm','SplitWorm',15,True),('trapper','TrapperApostle',16,False),('mother','MotherApostle',17,True),('vampire','VampireApostle',18,False),('giant','GiantApostle',19,False),
 ('cleaver','CleaverApostle',20,False),('duelist','DuelistApostle',21,False),('wraith','Wraith',23,True),('zombie','FrozenZombie',24,False),('slime','SwampSlime',25,True),
 ('hexer','HexerApostle',26,False),('bat','IcicleBat',27,True),('golem','GlacierGolem',28,False),('warden','Warden',29,False),('twin','ShadowTwin',47,False)]
NONHUMAN_TRI_MIN=5000   # Tripo bodies are ~12.2k triangles; a bone preview shape is a few hundred
HUMAN_TRI_MIN=8000      # same guard as import-pilots.py
LOCK_NET_M=0.5          # locomotion clip: the top bone ends this many display metres away from where it started
PALETTE=[(.045,.025,.020),(.16,.075,.045),(.28,.16,.10),(.38,.29,.18),(.20,.25,.14),(.53,.49,.31),(.76,.71,.53),(.32,.045,.025)]
def load_report(path):
 # a few reports were written in cp949 (Korean notes); only numbers and ASCII keys are used here
 raw=open(path,'rb').read()
 for enc in('utf-8','cp949'):
  try:return json.loads(raw.decode(enc))
  except (UnicodeDecodeError,ValueError):pass
 return json.loads(raw.decode('utf-8',errors='replace'))
def lin2srgb(c):return 12.92*c if c<=.0031308 else 1.055*(c**(1/2.4))-.055
def ev_mesh(depsgraph,obj):
 e=obj.evaluated_get(depsgraph);m=e.to_mesh();mw=e.matrix_world.copy();pts=[mw@v.co for v in m.vertices];e.to_mesh_clear();return pts
def bbox(pts):
 return (min(p.x for p in pts),max(p.x for p in pts),min(p.y for p in pts),max(p.y for p in pts),min(p.z for p in pts),max(p.z for p in pts))
def set_action(arm,a):
 ad=arm.animation_data or arm.animation_data_create();ad.action=a
 if a.slots:ad.action_slot=a.slots[0]
def convert(key,name,etype,nonhuman_flag):
 t0=time.time();src=BASE+'anim/%s_anim_v1.glb'%key
 report=load_report(BASE+'anim/%s_anim_report.json'%key)
 bpy.ops.wm.read_factory_settings(use_empty=True)
 bpy.context.scene.render.fps=60;bpy.context.scene.render.fps_base=1   # the glTF importer converts seconds to frames with the scene fps
 bpy.ops.import_scene.gltf(filepath=src)
 scene=bpy.context.scene
 rigs=[o for o in scene.objects if o.type=='ARMATURE'];assert len(rigs)==1,'one armature expected'
 arm=rigs[0]
 sockets=[o for o in scene.objects if o.type=='EMPTY' and o.name.startswith('WeaponSocket_')]
 weapons=[o for o in scene.objects if o.type=='MESH' and any(o.parent==s for s in sockets)]
 meshes=[o for o in scene.objects if o.type=='MESH' and o.parent==arm and len(o.data.vertices)>=200]
 assert meshes,'no body mesh'
 tripo=any(b.name.startswith('tripo::') for b in arm.data.bones) or arm.data.bones[0].name=='BoneRoot'
 nonhuman=tripo or report.get('facing_world','').startswith('-X')
 assert nonhuman==nonhuman_flag,'non-human flag mismatch for '+key
 tris=sum(len(p.vertices)-2 for o in meshes for p in o.data.polygons)
 assert tris>(NONHUMAN_TRI_MIN if nonhuman else HUMAN_TRI_MIN),'Armature preview mesh must never be shipped as the model: %d triangles'%tris
 bones=len(arm.data.bones)
 # --- palette: broad flat colour planes for the shared toon shader, deterministic nearest colour per face (no texture, no noise)
 for obj in meshes:
  original=list(obj.data.materials);images=[]
  for mat in original:
   image=None
   if mat and mat.use_nodes:
    for node in mat.node_tree.nodes:
     if node.type=='TEX_IMAGE' and node.image and ('base' in node.image.name.lower() or image is None):image=node.image
   images.append(image)
  cache={im.name:(list(im.pixels),im.size[0],im.size[1]) for im in images if im}
  uv=obj.data.uv_layers.active.data if obj.data.uv_layers.active else None
  assignments=[]
  for face in obj.data.polygons:
   im=images[min(face.material_index,len(images)-1)] if images else None
   c=(.28,.16,.10)
   if im and uv:
    pixels,w,h=cache[im.name];u=sum(uv[k].uv.x for k in face.loop_indices)/len(face.loop_indices);v=sum(uv[k].uv.y for k in face.loop_indices)/len(face.loop_indices)
    n=(int(v%1*h)*w+int(u%1*w))*4;c=tuple(pixels[n:n+3])
   assignments.append(min(range(len(PALETTE)),key=lambda k:sum((c[j]-PALETTE[k][j])**2 for j in range(3))))
  obj.data.materials.clear()
  for c in PALETTE:
   hexcode=''.join('%02x'%round(x*255) for x in c);mat=bpy.data.materials.new('enemy_'+hexcode);mat.diffuse_color=(*c,1);mat.use_nodes=True;mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(*c,1);obj.data.materials.append(mat)
  for face,k in zip(obj.data.polygons,assignments):face.material_index=k
  for face in obj.data.polygons:face.use_smooth=True
 # weapon props keep their flat colours, but the renderer reads the colour from an "enemy_<hex>" material name
 renamed={}
 for w in weapons:
  for slot in w.material_slots:
   m=slot.material
   if m is None or m.name.startswith('enemy_'):continue
   node=m.node_tree.nodes.get('Principled BSDF') if m.use_nodes else None
   base=node.inputs['Base Color'].default_value if node else m.diffuse_color
   new='enemy_'+''.join('%02x'%round(lin2srgb(base[i])*255) for i in range(3))
   if new in bpy.data.materials and bpy.data.materials[new] is not m:slot.material=bpy.data.materials[new]
   else:renamed[m.name]=new;m.name=new
 # --- clips: names stay as in the GLB, 60 fps frames
 depsgraph=bpy.context.evaluated_depsgraph_get()
 actions=sorted(bpy.data.actions,key=lambda a:a.name)
 scale_disp=report.get('scale_to_display',1.0)
 # detach the armature from glTF helper nodes (Node_0/node_0 carry a -90 degree turn on the Tripo rigs) keeping its world transform
 if arm.parent is not None:
  mw=arm.matrix_world.copy();arm.parent=None;arm.matrix_world=mw
 # --- root motion freeze (before the facing turn): horizontal travel of the single top bone
 top=[b for b in arm.data.bones if b.parent is None]
 assert len(top)==1,'single top bone expected'
 topb=top[0];pb=arm.pose.bones[topb.name]
 rootlock=[];rootinfo={}
 rest3=topb.matrix_local.to_3x3()
 for a in actions:
  set_action(arm,a);f0=int(round(a.frame_range[0]));f1=int(round(a.frame_range[1]))
  pos=[];loc=[]
  for f in range(f0,f1+1):
   scene.frame_set(f);w=arm.matrix_world@pb.head;pos.append((w.x,w.y));loc.append(Vector(pb.location))
  x0,y0=pos[0]
  exc=max(math.hypot(p[0]-x0,p[1]-y0) for p in pos)*scale_disp;net=math.hypot(pos[-1][0]-x0,pos[-1][1]-y0)*scale_disp
  rep=report['clips'].get(a.name,{})
  info={'frames':f1-f0,'top_bone_max_excursion_m':round(exc,3),'top_bone_net_m':round(net,3)}
  if 'root_speed_display_m_per_s' in rep:info['report_root_speed_m_per_s']=rep['root_speed_display_m_per_s']
  if rep.get('in_place_cycle'):info['in_place_cycle']=True
  if 'root_travel_m' in rep:info['report_root_travel_m']=rep['root_travel_m']
  if net>LOCK_NET_M:
   M=(arm.matrix_world.to_3x3()@rest3).inverted()
   for i,f in enumerate(range(f0,f1+1)):
    d=Vector((pos[i][0]-x0,pos[i][1]-y0,0))
    pb.location=loc[i]-(M@d);pb.keyframe_insert('location',frame=f)
   worst=0
   for f in range(f0,f1+1):
    scene.frame_set(f);w=arm.matrix_world@pb.head;worst=max(worst,math.hypot(w.x-x0,w.y-y0))
   assert worst<1e-4,'root lock failed %s/%s %g'%(key,a.name,worst)
   scene.frame_set(f0);b0=bbox(ev_mesh(depsgraph,meshes[0]));scene.frame_set(f1);b1=bbox(ev_mesh(depsgraph,meshes[0]))
   shift=math.hypot((b1[0]+b1[1])/2-(b0[0]+b0[1])/2,(b1[2]+b1[3])/2-(b0[2]+b0[3])/2)*scale_disp
   info['locked']=True;info['original_net_m']=round(net,3);info['original_max_excursion_m']=round(exc,3);info['residual_top_bone_m']=round(worst*scale_disp,6);info['body_bbox_centre_shift_after_lock_m']=round(shift,3)
   rootlock.append(a.name)
  rootinfo[a.name]=info
 # --- front fix: non-human rigs face world -X, Meshy bipeds face -Y. Turn the armature (+ its meshes) +90 degrees about Z and apply.
 def front_vector():
  # horizontal vector the body faces, measured on the rest pose
  arm.animation_data.action=None
  for pbn in arm.pose.bones:
   pbn.location=(0,0,0);pbn.rotation_quaternion=(1,0,0,0);pbn.rotation_euler=(0,0,0);pbn.scale=(1,1,1)
  bpy.context.view_layer.update()
  names=[b.name for b in arm.data.bones]
  for pre in('Left','Right'),('L_','R_'):
   if all((p+'Foot') in names and (p+'ToeBase') in names for p in pre):
    v=Vector((0,0,0))
    for p in pre:v+=(arm.matrix_world@arm.data.bones[p+'ToeBase'].head_local)-(arm.matrix_world@arm.data.bones[p+'Foot'].head_local)
    v.z=0
    if v.length>1e-3:return v.normalized(),'toe-base minus foot (both sides) bone heads'
  axis=report.get('tele_body_axis')
  if axis and axis[0] in names and axis[1] in names:
   v=(arm.matrix_world@arm.data.bones[axis[1]].head_local)-(arm.matrix_world@arm.data.bones[axis[0]].head_local);v.z=0
   return (v.normalized() if v.length>1e-3 else Vector((0,0,0))),'report tele_body_axis %s->%s bone heads (horizontal)'%(axis[0],axis[1])
  return Vector((0,0,0)),'none'
 walk=bpy.data.actions['walk'];wf=int(round(walk.frame_range[1]))//3
 fv0,fmethod=front_vector()
 set_action(arm,walk);scene.frame_set(1);bb0=bbox(ev_mesh(depsgraph,meshes[0]))
 if nonhuman:
  scene.frame_set(wf);snap=ev_mesh(depsgraph,meshes[0])
  arm.matrix_world=Matrix.Rotation(math.radians(90),4,'Z')@arm.matrix_world
  bpy.ops.object.select_all(action='DESELECT')
  for o in [arm]+meshes+sockets+weapons:o.select_set(True)
  bpy.context.view_layer.objects.active=arm
  bpy.ops.object.transform_apply(location=False,rotation=True,scale=False)
  bpy.context.view_layer.update()
  set_action(arm,walk);scene.frame_set(wf);after=ev_mesh(depsgraph,meshes[0])
  err=max((Vector((-p.y,p.x,p.z))-q).length for p,q in zip(snap,after))
  assert err<1e-3,'skinned mesh not turned rigidly: %g'%err
  fv1,_=front_vector()
  frontinfo={'applied':True,'rotation_z_deg':90,'applied_to_object_transform':True,'object_rotation_euler_deg_after_apply':[round(math.degrees(v),3) for v in arm.rotation_euler],'skin_check_max_err_m':round(err,6),'front_vector_before':[round(v,4) for v in fv0],'front_vector_after':[round(v,4) for v in fv1],'front_method':fmethod}
 else:
  frontinfo={'applied':False,'front_vector':[round(v,4) for v in fv0],'front_method':fmethod}
 set_action(arm,walk);scene.frame_set(1);bb1=bbox(ev_mesh(depsgraph,meshes[0]))
 frontinfo['body_bbox_xy_before']=[round(v,3) for v in bb0[:4]];frontinfo['body_bbox_xy_after']=[round(v,3) for v in bb1[:4]]
 frontinfo['body_height_raw_m']=round(bb1[5]-bb1[4],4)
 # --- export
 bpy.context.scene.render.fps=60
 bpy.ops.object.select_all(action='DESELECT')
 for o in [arm]+meshes+sockets+weapons:o.select_set(True)
 types={'ARMATURE','MESH'}|({'EMPTY'} if sockets else set())
 path=os.path.join(OUT,name+'.fbx')
 bpy.ops.export_scene.fbx(filepath=path,use_selection=True,object_types=types,add_leaf_bones=False,bake_anim=True,bake_anim_use_all_actions=True,bake_anim_use_nla_strips=False,bake_anim_simplify_factor=0,axis_forward='-Z',axis_up='Y',path_mode='STRIP')
 clips={a.name:int(round(a.frame_range[1]-a.frame_range[0])) for a in actions}
 sock_rows=[{'name':s.name,'parent_bone':s.parent_bone,'node_scale':[round(v,3) for v in s.scale],'glb_basis_location':[round(v,5) for v in s.location],'glb_basis_rotation_euler_deg':[round(math.degrees(v),3) for v in s.rotation_euler],'props':[w.name for w in weapons if w.parent==s],'prop_triangles':sum(len(p.vertices)-2 for w in weapons if w.parent==s for p in w.data.polygons)} for s in sockets]
 row={'key':key,'etype':etype,'model':name,'resource':'Enemies3D/'+name,'source':src,'report':BASE+'anim/%s_anim_report.json'%key,'bones':bones,'bodyTriangles':tris,'nonHuman':nonhuman,'triangleGuardMin':NONHUMAN_TRI_MIN if nonhuman else HUMAN_TRI_MIN,
  'fps':60,'clips':clips,'unityClipNames':['Armature|'+c for c in clips],'reportLengthMismatch':{c:[n,report['clips'][c]['length']] for c,n in clips.items() if c in report['clips'] and int(report['clips'][c]['length'])!=n},'frontFix':frontinfo,'rootMotion':rootinfo,'rootLocked':rootlock,'sockets':sock_rows,'weaponMaterialsRenamed':renamed,'palettePlanes':len(PALETTE),
  'scaleToDisplay':scale_disp,'rawHeightM':report.get('raw_height_m'),'displaySizeM':report.get('display_size_m'),'displayBasis':report.get('display_basis'),'displayHeightM':report.get('display_height_m'),'displayHeightDerivedM':round(report.get('display_height_m') or report['raw_height_m']*report['scale_to_display'],4),'displayHeightFromTurnedBodyBboxM':round(frontinfo['body_height_raw_m']*scale_disp,4),'fbxBytes':os.path.getsize(path),'seconds':round(time.time()-t0,1)}
 print('ENEMY3D_ROW',json.dumps({k:row[k] for k in('key','model','bones','bodyTriangles','nonHuman','rootLocked','fbxBytes','seconds')}))
 return row
results=[]
for key,name,etype,nonhuman in MODELS:
 if ONLY and key not in ONLY:continue
 results.append(convert(key,name,etype,nonhuman))
prov=os.path.join(OUT,'enemy3d-provenance.json')
with open(prov,'w',encoding='utf8') as f:json.dump({'generator':'unity/Tools/enemy3d/import-anim-v1.py','blender':bpy.app.version_string,'models':results,'totalFbxBytes':sum(r['fbxBytes'] for r in results)},f,ensure_ascii=False,indent=1)
print('ENEMY3D_DONE',len(results),sum(r['fbxBytes'] for r in results))
