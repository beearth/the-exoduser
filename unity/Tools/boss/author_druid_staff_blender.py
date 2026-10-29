"""Blender 5.2.3 portable S3 staff authoring study (no Unity import).

Run with --background --factory-startup and private BLENDER_USER_* / TEMP under I:.
Construction meshes remain editable in the .blend; the display mesh is Blender's
native voxel-remeshed, vertex-sculpted copy. The old OBJ studies stay untouched.
"""
from pathlib import Path
import json
import math
import bpy
from mathutils import Vector, noise

WORK = Path("I:/EXODUSER-Storage/boss/local-authoring-20261029")
REVIEW = WORK / "review"
SRC = Path("I:/exoduser-wt/codex-boss-sculpt/unity/Assets/Exoduser/Remodel/Boss/DarkDruid")
V2 = SRC / "Studies/dark_druid_staff_v2.obj"
SDF = Path("I:/EXODUSER-Storage/boss/staff-neck-sdf-20261029/dark_druid_staff_neck_sdf.obj")
BARK = SRC / "Source/Druid_BaseColor.jpg"
S3 = Path("I:/EXODUSER-Storage/archive/E/exoduser-wt/_out/unity-charsheet/dark_druid/S3_staff.png")
REVIEW.mkdir(parents=True, exist_ok=True)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
for coll in list(bpy.data.collections):
    if coll.name != bpy.context.scene.collection.name:
        bpy.data.collections.remove(coll)


def collection(name):
    c = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(c)
    return c


COLLECTIONS = {
    "v2": collection("Comparison_v2"),
    "prior_fail": collection("Comparison_prior_FAIL"),
    "new": collection("S3_editable_candidate"),
    "construction": collection("Construction_editable_lofts"),
}


def srgb(hex_color):
    h=hex_color.lstrip("#")
    return tuple(int(h[i:i+2],16)/255 for i in (0,2,4))+(1,)


def material(name, color, roughness=.8, emission=None):
    m=bpy.data.materials.new(name)
    m.diffuse_color=srgb(color)
    m.use_nodes=True
    p=m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value=srgb(color)
    p.inputs["Roughness"].default_value=roughness
    if emission:
        p.inputs["Emission Color"].default_value=srgb(emission)
        p.inputs["Emission Strength"].default_value=.7
    return m


old_materials={
    "charred_root":material("Old_Bark", "#4a3826"),
    "raised_bark":material("Old_Ridge", "#5c4733"),
    "recess":material("Old_Recess", "#26211d"),
    "leather":material("Old_Leather", "#4b2a1f"),
    "bone":material("Old_Bone", "#b9ad90",.72),
    "orb":material("Old_Flat_Orb", "#41491d",.38,"#9ea83a"),
    "orb_vein":material("Old_Orb_Plate", "#282b12",.7),
}


def bark_material():
    m=material("S3_Bark_AtlasAndRelief", "#4a3826",.85)
    nodes=m.node_tree.nodes; links=m.node_tree.links
    p=nodes.get("Principled BSDF")
    img=nodes.new("ShaderNodeTexImage")
    img.name="Existing_Druid_BaseColor_unchanged"
    img.image=bpy.data.images.load(str(BARK),check_existing=True)
    mix=nodes.new("ShaderNodeMixRGB")
    mix.blend_type="MIX"
    mix.inputs[0].default_value=.20
    mix.inputs[1].default_value=srgb("#2b2018")
    links.new(img.outputs["Color"],mix.inputs[2])
    links.new(mix.outputs["Color"],p.inputs["Base Color"])
    coord=nodes.new("ShaderNodeTexCoord")
    mapping=nodes.new("ShaderNodeVectorMath")
    mapping.operation="MULTIPLY"
    mapping.inputs[1].default_value=(33,33,9)
    links.new(coord.outputs["Generated"],mapping.inputs[0])
    tex=nodes.new("ShaderNodeTexNoise")
    tex.inputs["Scale"].default_value=2.8
    tex.inputs["Detail"].default_value=4
    links.new(mapping.outputs["Vector"],tex.inputs["Vector"])
    bump=nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value=.48
    bump.inputs["Distance"].default_value=.0035
    links.new(tex.outputs["Fac"],bump.inputs["Height"])
    links.new(bump.outputs["Normal"],p.inputs["Normal"])
    return m


new_bark=bark_material()


def core_material():
    m=material("S3_Cored_Lantern_veins", "#3a4219",.54)
    n=m.node_tree.nodes; l=m.node_tree.links; p=n.get("Principled BSDF")
    coord=n.new("ShaderNodeTexCoord")
    vor=n.new("ShaderNodeTexVoronoi")
    vor.feature="DISTANCE_TO_EDGE"
    vor.inputs["Scale"].default_value=20
    l.new(coord.outputs["Generated"],vor.inputs["Vector"])
    ramp=n.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position=.006
    ramp.color_ramp.elements[0].color=(.54,.51,.12,1)
    ramp.color_ramp.elements[1].position=.058
    ramp.color_ramp.elements[1].color=(.12,.15,.045,1)
    l.new(vor.outputs["Distance"],ramp.inputs["Fac"])
    l.new(ramp.outputs["Color"],p.inputs["Base Color"])
    glow=n.new("ShaderNodeMapRange")
    glow.inputs["From Min"].default_value=.005
    glow.inputs["From Max"].default_value=.055
    glow.inputs["To Min"].default_value=.45
    glow.inputs["To Max"].default_value=.03
    l.new(vor.outputs["Distance"],glow.inputs["Value"])
    p.inputs["Emission Color"].default_value=srgb("#9ea83a")
    l.new(glow.outputs["Result"],p.inputs["Emission Strength"])
    bump=n.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value=.52
    bump.inputs["Distance"].default_value=.006
    l.new(vor.outputs["Distance"],bump.inputs["Height"])
    l.new(bump.outputs["Normal"],p.inputs["Normal"])
    return m


new_core=core_material()


def read_obj(path):
    verts=[]; uvs=[]; faces=[]; mats=[]; active=""
    for line in path.open(encoding="ascii"):
        if line.startswith("v "):
            verts.append(tuple(map(float,line.split()[1:])))
        elif line.startswith("vt "):
            uvs.append(tuple(map(float,line.split()[1:])))
        elif line.startswith("usemtl "):
            active=line.split()[1]
        elif line.startswith("f "):
            faces.append(tuple(int(t.split("/")[0])-1 for t in line.split()[1:]))
            mats.append(active)
    return verts,uvs,faces,mats


def make_obj(name, source, coll, keep=None):
    vertices,uv,faces,mats=source
    indices=[i for i,(face,mat) in enumerate(zip(faces,mats)) if keep is None or keep(face,mat,vertices)]
    used=sorted({j for i in indices for j in faces[i]})
    remap={old:new for new,old in enumerate(used)}
    pts=[(vertices[i][0],vertices[i][2],vertices[i][1]) for i in used]
    polygons=[tuple(remap[j] for j in faces[i]) for i in indices]
    mesh=bpy.data.meshes.new(name+"_Mesh")
    mesh.from_pydata(pts,[],polygons); mesh.update()
    obj=bpy.data.objects.new(name,mesh); coll.objects.link(obj)
    keys=list(old_materials)
    for key in keys: mesh.materials.append(old_materials[key])
    for poly,i in zip(mesh.polygons,indices): poly.material_index=keys.index(mats[i]); poly.use_smooth=True
    layer=mesh.uv_layers.new(name="Existing_UV")
    for poly in mesh.polygons:
        for loop_idx in poly.loop_indices:
            old=used[mesh.loops[loop_idx].vertex_index]
            layer.data[loop_idx].uv=uv[old]
    return obj


v2_source=read_obj(V2)
prior_source=read_obj(SDF)
make_obj("V2_unchanged",v2_source,COLLECTIONS["v2"])
make_obj("Prior_SDF_FAIL_unchanged",prior_source,COLLECTIONS["prior_fail"])


def lower_keep(face,mat,verts):
    high=max(verts[i][1] for i in face)
    if mat in ("charred_root","raised_bark") and high>1.56: return False
    if mat=="recess" and high>1.60: return False
    if mat in ("orb","orb_vein"): return False
    return True


lower=make_obj("S3_LowerGripSkull_Bone_unchanged",v2_source,COLLECTIONS["new"],lower_keep)
for i,m in enumerate(lower.data.materials):
    if m.name in ("Old_Bark","Old_Ridge"): lower.data.materials[i]=new_bark

# Explicit, editable loft stations are placed against S3 front and three-quarter
# views. A station is x, height, depth, major width, minor depth, cross-section
# twist. The geometry uses broad, non-circular cross-sections and branching
# overlaps; Blender's native voxel remesh joins them before local sculpt relief.
ROOT_STATIONS={
 "trunk":((-.004,1.50,.002,.018,.018,0),(.002,1.67,.002,.019,.016,.2),
          (.012,1.82,.004,.022,.020,.4),(.022,1.91,.004,.030,.027,.5),
          (.027,1.97,.006,.041,.033,.7)),
 "left_front":((.024,1.90,.006,.029,.027,.2),(-.026,1.98,.053,.025,.023,.6),
          (-.093,2.06,.078,.021,.019,.8),(-.128,2.14,.065,.020,.017,1.1),
          (-.112,2.23,.018,.014,.013,1.3),(-.080,2.298,-.020,.003,.003,1.4)),
 "right_front":((.027,1.91,.009,.029,.028,1.2),(.080,1.98,.048,.027,.022,1.5),
          (.139,2.073,.059,.022,.021,1.7),(.146,2.16,.021,.019,.016,1.9),
          (.105,2.24,-.018,.012,.011,2.1),(.092,2.296,-.040,.003,.003,2.2)),
 "left_back":((.022,1.91,-.009,.026,.025,.2),(-.040,2.00,-.061,.024,.020,.5),
          (-.112,2.10,-.088,.020,.018,.8),(-.104,2.19,-.063,.016,.014,1.1),
          (-.047,2.291,-.050,.003,.003,1.4)),
 "right_back":((.028,1.91,-.006,.026,.025,1.0),(.086,2.00,-.060,.023,.019,1.2),
          (.127,2.10,-.077,.018,.016,1.5),(.089,2.20,-.072,.013,.012,1.8),
          (.045,2.293,-.052,.003,.003,2.0)),
 "upper_hook":((-.102,2.12,.064,.015,.013,.4),(-.078,2.18,.097,.018,.015,.6),
          (-.030,2.22,.108,.017,.013,.8),(.020,2.267,.069,.010,.010,1.1),
          (.052,2.292,.046,.003,.003,1.2)),
 "lower_cross":((-.098,1.997,.075,.016,.015,.4),(-.030,2.017,.105,.018,.014,.6),
          (.042,2.047,.104,.017,.014,.8),(.112,2.076,.067,.013,.012,1.0)),
 "upper_cross":((.133,2.143,.027,.015,.014,.5),(.082,2.168,.104,.017,.015,.8),
          (.012,2.190,.117,.015,.014,1.0),(-.055,2.208,.100,.012,.012,1.2),
          (-.110,2.223,.022,.008,.008,1.4)),
}


def catmull(values,index,t):
    a=values[max(0,index-1)]; b=values[index]
    c=values[index+1]; d=values[min(len(values)-1,index+2)]
    return .5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t)


def loft_mesh(name,stations,coll):
    stations=list(stations); samples=[]
    for i in range(len(stations)-1):
        for k in range(10):
            t=k/10
            samples.append(tuple(catmull([s[j] for s in stations],i,t) for j in range(6)))
    samples.append(stations[-1])
    vertices=[]; quads=[]; sides=16
    for i,s in enumerate(samples):
        x,y,z,rx,rz,twist=s
        p=Vector((x,z,y))
        before=samples[max(i-1,0)]; after=samples[min(i+1,len(samples)-1)]
        tangent=Vector((after[0]-before[0],after[2]-before[2],after[1]-before[1])).normalized()
        ref=Vector((0,1,0)) if abs(tangent.dot(Vector((0,1,0))))<.9 else Vector((1,0,0))
        u=tangent.cross(ref).normalized(); v=tangent.cross(u).normalized()
        for j in range(sides):
            a=2*math.pi*j/sides
            lobe=1+.14*math.sin(3*a+twist)+.07*math.sin(7*a-.4*i+twist)
            q=p+lobe*(rx*math.cos(a)*u+rz*math.sin(a)*v)
            vertices.append(q)
        if i:
            for j in range(sides):
                q=(j+1)%sides
                quads.append(((i-1)*sides+j,(i-1)*sides+q,i*sides+q,i*sides+j))
    quads.append(tuple(reversed(range(sides))))
    quads.append(tuple((len(samples)-1)*sides+j for j in range(sides)))
    mesh=bpy.data.meshes.new(name+"_LoftMesh")
    mesh.from_pydata(vertices,[],quads); mesh.update()
    obj=bpy.data.objects.new(name,mesh); coll.objects.link(obj)
    return obj


raw=[]
for name,stations in ROOT_STATIONS.items():
    raw.append(loft_mesh("Editable_"+name,stations,COLLECTIONS["construction"]))
copies=[]
for obj in raw:
    clone=obj.copy(); clone.data=obj.data.copy(); COLLECTIONS["new"].objects.link(clone)
    copies.append(clone)
bpy.ops.object.select_all(action="DESELECT")
for obj in copies: obj.select_set(True)
bpy.context.view_layer.objects.active=copies[0]
bpy.ops.object.join()
root=bpy.context.view_layer.objects.active
root.name="S3_JoinedRoots_BlenderVoxelSculpt"
root.data.remesh_voxel_size=.0025
bpy.ops.object.voxel_remesh()
root.data.update()
for v in root.data.vertices:
    pos=v.co
    theta=math.atan2(pos.y,pos.x-.03)
    broad=.0018*math.sin(8*theta+11*pos.z)+.0011*math.sin(15*theta-7*pos.z)
    broken=.0009*noise.noise_vector(pos*24).length
    v.co+=v.normal*(broad+broken)
    if pos.z>2.15: v.co.z=min(v.co.z,2.30)
root.data.update()
root.data.materials.append(new_bark)
uv=root.data.uv_layers.new(name="ExistingBarkAtlasPatch")
for poly in root.data.polygons:
    poly.use_smooth=True
    for lid in poly.loop_indices:
        p=root.data.vertices[root.data.loops[lid].vertex_index].co
        angle=(math.atan2(p.y,p.x-.03)+math.pi)/(2*math.pi)
        uv.data[lid].uv=(.175+.115*angle,.43+.14*((p.z-1.50)/.80))
for obj in raw: obj.hide_render=True; obj.hide_set(True)

# Layered, editable lantern core: irregular actual mesh plus Voronoi edge veins
# and emission mask, instead of v2's flat uniformly glowing sphere.
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=5,radius=.078,location=(.030,.001,2.065))
core=bpy.context.object
core.name="S3_IrregularCore_MaskedVeins"
for c in list(core.users_collection): c.objects.unlink(core)
COLLECTIONS["new"].objects.link(core)
for v in core.data.vertices:
    rel=v.co.normalized()
    v.co*=1+.045*noise.noise(rel*5)+.018*noise.noise(rel*13)
core.data.materials.append(new_core)
for poly in core.data.polygons: poly.use_smooth=True

# Keep the original approved sheet as a read-only reference inside the authoring
# file. It is never rewritten or used as a generated texture.
reference=bpy.data.images.load(str(S3),check_existing=True)
reference.name="Reference_S3_staff_approved_sheet"

scene=bpy.context.scene
scene.render.engine="BLENDER_EEVEE"
scene.render.resolution_x=1600; scene.render.resolution_y=900
scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
scene.render.film_transparent=False
scene.world.color=(.055,.052,.048)
scene.view_settings.view_transform="Standard"
scene.view_settings.look="Medium High Contrast"

def area(name,location,power,size,color):
    data=bpy.data.lights.new(name,type="AREA")
    data.energy=power; data.shape="DISK"; data.size=size; data.color=color
    obj=bpy.data.objects.new(name,data); scene.collection.objects.link(obj)
    obj.location=location
    obj.rotation_euler=(Vector((0,0,1.2))-obj.location).to_track_quat("-Z","Y").to_euler()
    return obj

area("Key_same_all_candidates",(-2.5,3.8,5),370,3,(1,.93,.82))
area("Fill_same_all_candidates",(2.0,2.8,3),110,3,(.68,.77,1))
area("Rim_same_all_candidates",(.3,-3,4),250,2,(1,.84,.55))

cam_data=bpy.data.cameras.new("Matched_Orthographic")
cam=bpy.data.objects.new("Matched_Orthographic",cam_data)
scene.collection.objects.link(cam); scene.camera=cam
cam.data.type="ORTHO"

def camera(eye,target,scale):
    cam.location=(eye[0],eye[2],eye[1])
    target=Vector((target[0],target[2],target[1]))
    cam.rotation_euler=(target-cam.location).to_track_quat("-Z","Y").to_euler()
    cam.data.ortho_scale=scale

views=(
    ("front",(0,1.15,5),(0,1.15,0),4.40),
    ("game55",(2.3,4.1,3.3),(0,1.15,0),4.40),
    ("side",(5,1.15,0),(0,1.15,0),4.40),
    ("neck_front",(.03,2.43,3),(.03,2.08,0),.68),
    ("neck55",(2.33,5.03,3.3),(.03,2.08,0),.68),
    ("neck_side",(3.03,2.43,0),(.03,2.08,0),.68),
)

def set_candidate(label):
    for key,c in COLLECTIONS.items():
        if key=="construction": continue
        for obj in c.objects:
            obj.hide_render=key!=label

for label in ("v2","prior_fail","new"):
    set_candidate(label)
    for name,eye,target,scale in views:
        camera(eye,target,scale)
        scene.render.filepath=str(REVIEW/(label+"_"+name+".png"))
        bpy.ops.render.render(write_still=True)

set_candidate("new")
camera((2.3,4.1,3.3),(0,1.15,0),2.92)
scene.render.filepath=str(REVIEW/"new_game55.png")
bpy.context.preferences.filepaths.save_version=0
blend=WORK/"dark_druid_staff_S3_blender_authoring.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(blend))

metrics={
    "blender":bpy.app.version_string,
    "blend":str(blend),
    "root_vertices":len(root.data.vertices),
    "root_faces":len(root.data.polygons),
    "editable_construction_objects":len(raw),
    "root_bbox_height_m":float(max(v.co.z for v in root.data.vertices)-min(v.co.z for v in root.data.vertices)),
    "all_rendered_png":len(list(REVIEW.glob("*.png"))),
    "source_v2":str(V2),
    "source_prior_fail":str(SDF),
    "reference_s3":str(S3),
}
(WORK/"authoring_metrics.json").write_text(json.dumps(metrics,indent=2)+"\n",encoding="utf-8")
print("AUTHORING_METRICS",json.dumps(metrics))
