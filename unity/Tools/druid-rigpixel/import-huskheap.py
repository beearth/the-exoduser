# Blender format conversion only; static HuskHeap_P3 GLB -> FBX with the same axis/unit settings as import-oldman.py.
# Usage: blender -b --factory-startup --python import-huskheap.py -- <glb> <outDir>
import bpy,sys,os,json,hashlib,struct
source,output=sys.argv[sys.argv.index('--')+1:]
os.makedirs(output,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=source)
raw=open(source,'rb').read();document=json.loads(raw[20:20+struct.unpack_from('<I',raw,12)[0]].decode('utf8'))
source_names=set(n.get('name','') for n in document['nodes'])
for obj in list(bpy.context.scene.objects):
 if obj.name not in source_names:bpy.data.objects.remove(obj,do_unlink=True)
objs=list(bpy.context.scene.objects);assert len(objs)==1 and objs[0].type=='MESH' and objs[0].name=='HuskHeap_P3','Heap must be one static mesh'
heap=objs[0];assert not heap.parent and not any(m.type=='ARMATURE' for m in heap.modifiers),'Heap must not be skinned'
tris=sum(len(p.vertices)-2 for p in heap.data.polygons);assert tris==37994,'Heap triangles '+str(tris)
materials=sorted(m.name for m in heap.data.materials if m);assert materials==['druid_bone','druid_feather','druid_glow','druid_husk_bark'],materials
corners=[heap.matrix_world@v.co for v in heap.data.vertices]
lo=[min(c[i] for c in corners) for i in range(3)];hi=[max(c[i] for c in corners) for i in range(3)]
bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=heap
bpy.ops.export_scene.fbx(filepath=os.path.join(output,'HuskHeapP3.fbx'),use_selection=True,object_types={'MESH'},add_leaf_bones=False,bake_anim=False,axis_forward='-Z',axis_up='Y',path_mode='STRIP',use_custom_props=False,use_mesh_modifiers=False)
report={'sourceSha256':hashlib.sha256(raw).hexdigest(),'sourceBytes':len(raw),'triangles':tris,'materials':materials,'boundsMinMetres':lo,'boundsMaxMetres':hi,'heightMetres':hi[2]-lo[2],'frame':'husk frame (origin = boss spot before the collapse)'}
print('DRUID_HEAP '+json.dumps(report))
