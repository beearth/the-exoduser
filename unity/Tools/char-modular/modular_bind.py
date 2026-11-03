"""Blender helpers for independently made rigid plates and cloth-only skin."""
import bpy
import bmesh
import math
from mathutils import Matrix, Vector


def rigid_bind(obj, rig, bone):
    if bone not in rig.data.bones:
        raise ValueError("target bone missing: " + bone)
    world = obj.matrix_world.copy()
    for group in list(obj.vertex_groups):
        obj.vertex_groups.remove(group)
    obj.vertex_groups.new(name=bone).add(list(range(len(obj.data.vertices))), 1.0, "REPLACE")
    for modifier in list(obj.modifiers):
        if modifier.type == "ARMATURE":
            obj.modifiers.remove(modifier)
    modifier = obj.modifiers.new("Rigid single bone", "ARMATURE")
    modifier.object = rig
    modifier.use_deform_preserve_volume = False
    obj.parent = rig
    obj.matrix_world = world
    obj["char_modular_role"] = "rigid"
    obj["char_modular_bone"] = bone


def fit_static(obj, center, dimensions):
    # Bake the imported GLTF transform; edit only the new independent part.
    obj.data.transform(obj.matrix_world.copy())
    obj.matrix_world = Matrix.Identity(4)
    low = Vector([min(v.co[i] for v in obj.data.vertices) for i in range(3)])
    high = Vector([max(v.co[i] for v in obj.data.vertices) for i in range(3)])
    span = high - low
    if min(span) <= 0:
        raise ValueError("degenerate part bounds")
    for vertex in obj.data.vertices:
        vertex.co = Vector(center) + Vector([(vertex.co[i] - (low[i] + high[i]) / 2) * dimensions[i] / span[i] for i in range(3)])
    obj.data.update()


def import_part(path, name):
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=str(path))
    added = [o for o in bpy.context.scene.objects if o not in before]
    meshes = [o for o in added if o.type == "MESH"]
    if not meshes:
        raise ValueError("no generated part mesh")
    # Keep multiple surfaces together as this part, preserving their material slots.
    bpy.ops.object.select_all(action="DESELECT")
    for obj in meshes:
        world = obj.matrix_world.copy()
        obj.parent = None
        obj.matrix_world = world
        obj.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1:
        bpy.ops.object.join()
    obj = bpy.context.view_layer.objects.active
    obj.name = name
    for other in added:
        if other.type == "EMPTY" and other.name in bpy.data.objects:
            bpy.data.objects.remove(other, do_unlink=True)
    return obj


def soft_bind_body(obj, rig):
    """Cloth/skin only: blend adjacent capsules in A-pose, inverse-bind to old T rest.

    No metallic geometry is passed here. Existing skeleton rest matrices stay intact.
    """
    offsets = {}
    for side, sign in (("Left", 1), ("Right", -1)):
        pivot = rig.matrix_world @ rig.data.bones[side + "Arm"].head_local
        offsets[side + "Arm"] = Matrix.Translation(pivot) @ Matrix.Rotation(math.radians(50 * sign), 4, "Y") @ Matrix.Translation(-pivot)
    moving = {}
    for side in ("Left", "Right"):
        for suffix in ("Arm", "ForeArm", "Hand"):
            moving[side + suffix] = offsets[side + "Arm"]
    trunk = ["Hips", "Spine02", "Spine01", "Spine", "neck"]
    segments = {}
    for bone in rig.data.bones:
        transform = moving.get(bone.name, Matrix.Identity(4))
        segments[bone.name] = (transform @ rig.matrix_world @ bone.head_local,
                               transform @ rig.matrix_world @ bone.tail_local)

    def distance(point, start, end):
        delta = end - start
        fraction = max(0, min(1, (point - start).dot(delta) / max(delta.length_squared, 1e-12)))
        return (point - (start + delta * fraction)).length

    for group in list(obj.vertex_groups):
        obj.vertex_groups.remove(group)
    groups = {name: obj.vertex_groups.new(name=name) for name in trunk +
              [side + suffix for side in ("Left", "Right") for suffix in
               ("Shoulder", "Arm", "ForeArm", "Hand", "UpLeg", "Leg", "Foot", "ToeBase")]}
    inverse_world = obj.matrix_world.inverted()
    for vertex in obj.data.vertices:
        point = obj.matrix_world @ vertex.co
        side = "Left" if point.x >= 0 else "Right"
        if abs(point.x) > .28 and point.z > .8:
            candidates = [side + suffix for suffix in ("Shoulder", "Arm", "ForeArm", "Hand")]
        elif point.z < 1.03:
            candidates = ["Hips"] + [side + suffix for suffix in ("UpLeg", "Leg", "Foot", "ToeBase")]
        else:
            candidates = trunk
        near = sorted((distance(point, *segments[name]), name) for name in candidates)[:2]
        raw = [1 / max(.025, item[0]) ** 4 for item in near]
        weights = [value / sum(raw) for value in raw]
        blended = Matrix(((0, 0, 0, 0),) * 4)
        for (_, name), weight in zip(near, weights):
            matrix = moving.get(name, Matrix.Identity(4))
            for row in range(4):
                for col in range(4):
                    blended[row][col] += matrix[row][col] * weight
            groups[name].add([vertex.index], weight, "REPLACE")
        vertex.co = inverse_world @ blended.inverted() @ point
    world = obj.matrix_world.copy()
    obj.parent = rig
    obj.matrix_world = world
    modifier = obj.modifiers.new("Soft cloth and skin only", "ARMATURE")
    modifier.object = rig
    obj["char_modular_role"] = "soft"
    obj.data.update()
    return offsets


def auxiliary(rig, name, head, tail, parent):
    bpy.ops.object.select_all(action="DESELECT")
    rig.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")
    bone = rig.data.edit_bones.get(name) or rig.data.edit_bones.new(name)
    inverse = rig.matrix_world.inverted()
    bone.head = inverse @ Vector(head)
    bone.tail = inverse @ Vector(tail)
    bone.parent = rig.data.edit_bones[parent]
    bone.use_connect = False
    bpy.ops.object.mode_set(mode="OBJECT")
    return name


def duplicate(obj, name, mirror=False):
    other = obj.copy()
    other.data = obj.data.copy()
    other.name = name
    bpy.context.collection.objects.link(other)
    if mirror:
        other.data.transform(Matrix.Diagonal((-1, 1, 1, 1)))
        mesh = bmesh.new()
        mesh.from_mesh(other.data)
        bmesh.ops.reverse_faces(mesh, faces=list(mesh.faces))
        mesh.to_mesh(other.data)
        mesh.free()
    return other


def face_part(obj, name, keep):
    other = duplicate(obj, name)
    mesh = bmesh.new()
    mesh.from_mesh(other.data)
    discard = [face for face in mesh.faces if not keep(face.calc_center_median())]
    bmesh.ops.delete(mesh, geom=discard, context="FACES")
    mesh.to_mesh(other.data)
    mesh.free()
    if not len(other.data.polygons):
        bpy.data.objects.remove(other, do_unlink=True)
        raise ValueError("empty plate: " + name)
    return other


def fit_limb(obj, rig, bone, width, depth, extra=0):
    b = rig.data.bones[bone]
    head, tail = rig.matrix_world @ b.head_local, rig.matrix_world @ b.tail_local
    direction = (tail - head).normalized()
    center = (head + tail) / 2
    fit_static(obj, (0, 0, 0), (width, depth, (tail - head).length + extra))
    rotation = Vector((0, 0, 1)).rotation_difference(-direction)
    for vertex in obj.data.vertices:
        vertex.co = rotation @ vertex.co + center
    obj.data.update()


def cloth_weights(obj, rig, centers, role="soft", fixed_top=None):
    """Up to four nearby auxiliary bones on soft cloth/hair only."""
    for group in list(obj.vertex_groups):
        obj.vertex_groups.remove(group)
    names = list(centers)
    if fixed_top:
        names.append(fixed_top[1])
    groups = {name: obj.vertex_groups.new(name=name) for name in names}
    for vertex in obj.data.vertices:
        point = obj.matrix_world @ vertex.co
        if fixed_top and point.z >= fixed_top[0]:
            groups[fixed_top[1]].add([vertex.index], 1, "REPLACE")
            continue
        near = sorted(((point - Vector(center)).length, name) for name, center in centers.items())[:4]
        raw = [1 / max(.035, distance) ** 4 for distance, _ in near]
        for (_, name), value in zip(near, raw):
            groups[name].add([vertex.index], value / sum(raw), "REPLACE")
    world = obj.matrix_world.copy()
    obj.parent = rig
    obj.matrix_world = world
    modifier = obj.modifiers.new("Soft auxiliary skin", "ARMATURE")
    modifier.object = rig
    obj["char_modular_role"] = role
