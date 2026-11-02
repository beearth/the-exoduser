"""Create the owned runtime derivative; the Tripo master is never overwritten.
Blender --background --factory-startup --python tools/tripo-chest-game.py --
  --source MASTER.glb --output RUNTIME.glb --receipt RECEIPT.json --blend SOURCE.blend
"""
import argparse, hashlib, json, math, sys
from pathlib import Path
import bpy, bmesh
from mathutils import Vector

parser=argparse.ArgumentParser()
parser.add_argument('--source',required=True)
parser.add_argument('--output',required=True)
parser.add_argument('--receipt',required=True)
parser.add_argument('--blend',required=True)
args=parser.parse_args(sys.argv[sys.argv.index('--')+1:])
source=Path(args.source); output=Path(args.output)
assert source.resolve()!=output.resolve(), 'Never overwrite the generation master'
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(source))
obj=next(o for o in bpy.context.scene.objects if o.type=='MESH')
bpy.context.view_layer.objects.active=obj; obj.select_set(True)
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
original_triangles=sum(len(p.vertices)-2 for p in obj.data.polygons)
dec=obj.modifiers.new('Runtime silhouette reduction','DECIMATE')
dec.ratio=19000/original_triangles
bpy.ops.object.modifier_apply(modifier=dec.name)
coords=[v.co.copy() for v in obj.data.vertices]
lo=Vector(tuple(min(v[i] for v in coords) for i in range(3)))
hi=Vector(tuple(max(v[i] for v in coords) for i in range(3)))
cut=lo.z+(hi.z-lo.z)*.65

def split(name,upper):
    result=bpy.data.objects.new(name,obj.data.copy()); bpy.context.collection.objects.link(result)
    bm=bmesh.new(); bm.from_mesh(result.data)
    cut_geo=bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),
        dist=.000001,plane_co=(0,0,cut),plane_no=(0,0,1),clear_inner=upper,clear_outer=not upper)
    if upper:
        boundary=[e for e in cut_geo['geom_cut'] if isinstance(e,bmesh.types.BMEdge) and e.is_boundary]
        if boundary: bmesh.ops.holes_fill(bm,edges=boundary,sides=0)
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
    bm.to_mesh(result.data); bm.free(); result.data.update()
    return result

body=split('ChestBody',False); lid=split('ChestLid',True)
bpy.data.objects.remove(obj,do_unlink=True)
pivot=bpy.data.objects.new('ChestLidPivot',None); bpy.context.collection.objects.link(pivot)
pivot.location=(0,hi.y*.94,cut)
lid.parent=pivot; lid.matrix_parent_inverse=pivot.matrix_world.inverted()
# Apply the inverse explicitly after a dependency update, preserving the closed silhouette.
bpy.context.view_layer.update(); lid.matrix_parent_inverse=pivot.matrix_world.inverted()

# A dark, recessed wooden lining makes the cut body an actual empty container.
lining=bpy.data.materials.new('Recessed dark wood'); lining.use_nodes=True
bsdf=lining.node_tree.nodes.get('Principled BSDF')
bsdf.inputs['Base Color'].default_value=(.033,.020,.013,1)
bsdf.inputs['Roughness'].default_value=.91
original_mat=body.data.materials[0]
base=original_mat.node_tree.nodes.get('Principled BSDF')
if base and base.inputs['Base Color'].is_linked:
    linked=base.inputs['Base Color'].links[0].from_node
    if linked.type=='TEX_IMAGE':
        tex=lining.node_tree.nodes.new('ShaderNodeTexImage'); tex.image=linked.image
        mult=lining.node_tree.nodes.new('ShaderNodeMixRGB'); mult.blend_type='MULTIPLY'
        mult.inputs[0].default_value=1; mult.inputs[2].default_value=(.26,.22,.18,1)
        lining.node_tree.links.new(tex.outputs['Color'],mult.inputs[1])
        lining.node_tree.links.new(mult.outputs[0],bsdf.inputs['Base Color'])
x=max(abs(lo.x),abs(hi.x))*.88; y=max(abs(lo.y),abs(hi.y))*.84
floor=lo.z+(hi.z-lo.z)*.14
# A surface scan contains the outside of the lid, not a usable inside panel.
# Give the opened lid a continuous wooden underside instead of leaving metal strips floating.
under_mesh=bpy.data.meshes.new('Lid wooden underside')
under_mesh.from_pydata([(-x,-y,cut-.002),(x,-y,cut-.002),(x,y,cut-.002),(-x,y,cut-.002)],[],[(3,2,1,0)])
under_mesh.update()
underside=bpy.data.objects.new('ChestLidUnderside',under_mesh); bpy.context.collection.objects.link(underside)
underside.data.materials.append(lining)
under_uv=underside.data.uv_layers.new(name='WoodUV')
for poly in under_mesh.polygons:
    for index,corner in zip(poly.loop_indices,((.25,.25),(.75,.25),(.75,.75),(.25,.75))):
        under_uv.data[index].uv=corner
underside.parent=pivot; underside.matrix_parent_inverse=pivot.matrix_world.inverted()
vertices=[(-x,-y,floor),(x,-y,floor),(x,y,floor),(-x,y,floor),
          (-x,-y,cut),(x,-y,cut),(x,y,cut),(-x,y,cut)]
faces=[(0,1,2,3),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)]
mesh=bpy.data.meshes.new('Interior lining'); mesh.from_pydata(vertices,[],faces); mesh.update()
inner=bpy.data.objects.new('ChestInterior',mesh); bpy.context.collection.objects.link(inner)
inner.data.materials.append(lining)
uv=inner.data.uv_layers.new(name='WoodUV')
for poly in inner.data.polygons:
    for index,corner in zip(poly.loop_indices,((.25,.25),(.75,.25),(.75,.75),(.25,.75))):
        uv.data[index].uv=corner

for image in bpy.data.images:
    if image.size[0]==0: continue
    limit=1024 if 'base' in image.name.lower() or max(image.size)>4096 else 512
    image.scale(limit,limit)
    image.pack()
for item in (body,lid):
    for poly in item.data.polygons: poly.use_smooth=True

root=bpy.data.objects.new('TripoChest',None); bpy.context.collection.objects.link(root)
for item in (body,pivot,inner): item.parent=root
output.parent.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(Path(args.blend)))
bpy.ops.export_scene.gltf(filepath=str(output),export_format='GLB',export_image_format='AUTO',
    export_cameras=False,export_lights=False,export_animations=False)
triangles=sum(len(p.vertices)-2 for o in bpy.context.scene.objects if o.type=='MESH' for p in o.data.polygons)
receipt={'source':str(source),'sourceSHA256':hashlib.sha256(source.read_bytes()).hexdigest(),
    'runtime':str(output),'runtimeSHA256':hashlib.sha256(output.read_bytes()).hexdigest(),
    'sourceBytes':source.stat().st_size,'runtimeBytes':output.stat().st_size,
    'originalTriangles':original_triangles,'triangles':triangles,'lidCutBlenderZ':cut,
    'hingeBlender':list(pivot.location),'lidRotationXOpened':-1.92,
    'textures':[{'name':i.name,'width':i.size[0],'height':i.size[1]} for i in bpy.data.images if i.size[0]],
    'adoptedScope':'web chest derivative; final visual/runtime gates recorded separately'}
Path(args.receipt).write_text(json.dumps(receipt,indent=2),encoding='utf8')
assert triangles<=24000, receipt
assert output.stat().st_size<3000000, receipt
print('TRIPO_CHEST_RECEIPT '+json.dumps(receipt))
