import bpy, pathlib, json, hashlib
root=pathlib.Path('I:/EXODUSER-Storage/demo-art/character/warrior-r1')
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(root/'warrior_r1.glb'))
rig=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE')
mesh=next(o for o in bpy.context.scene.objects if o.type=='MESH' and o.vertex_groups)
manifest=json.loads((root/'manifest.json').read_text(encoding='utf-8'))
original_bones=[x[0] for x in manifest['before']['bones']]
assert set(original_bones)=={b.name for b in rig.data.bones}
assert mesh.data.shape_keys and 'CapeSilhouette_R1' in mesh.data.shape_keys.key_blocks
assert abs(mesh.data.shape_keys.key_blocks['CapeSilhouette_R1'].value-1)<1e-5
assert any(m.type=='ARMATURE' for m in mesh.modifiers)
source=pathlib.Path(manifest['source'])
assert hashlib.sha256(source.read_bytes()).hexdigest()==manifest['source_sha256']
assert manifest['topology_weights_uv_rest_bones_unchanged']
result={'export_reimport':'PASS','original_sha_still_matches':True,'bones':len(rig.data.bones),'morph_default':1,'skin_modifier':True,'unity_player':'NOT_RUN','animations':'NOT_VALIDATED'}
(root/'validation.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print('VALIDATION='+json.dumps(result))
