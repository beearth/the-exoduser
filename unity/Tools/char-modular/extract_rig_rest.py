"""GLB의 rest 관절을 미터·glTF Y-up 좌표로 추출한다. Blender 내장 Python 전용.

blender -b -t 2 --python-exit-code 2 --python extract_rig_rest.py -- in.glb out.json
원본 파일과 리그를 수정하지 않으며 pose/애니메이션 대신 Bone.head_local을 쓴다.
Blender가 임의 생성한 bone tail은 해부학적 손끝/턱으로 사용하지 않는다.
"""
import json
from pathlib import Path
import sys

import bpy
from mathutils import Vector


HUMANOID = {
    'Hips': 'Hips', 'Spine02': 'Spine', 'Spine01': 'Chest',
    'Spine': 'UpperChest', 'neck': 'Neck', 'Head': 'Head',
}
for side in ('Left', 'Right'):
    for source, target in (('Shoulder', 'Shoulder'), ('Arm', 'UpperArm'),
                           ('ForeArm', 'LowerArm'), ('Hand', 'Hand'),
                           ('UpLeg', 'UpperLeg'), ('Leg', 'LowerLeg'),
                           ('Foot', 'Foot'), ('ToeBase', 'Toes')):
        HUMANOID[side + source] = side + target


def extract_scene(source):
    """현재 장면의 원본 메시 정점·rest 뼈를 추출. 반환값 좌표는 모두 m."""
    unit = bpy.context.scene.unit_settings.scale_length

    def point(world):
        return Vector((world.x, world.z, -world.y)) * unit

    def serial(v):
        return [round(float(x), 7) for x in v]

    def bounds(points):
        return {'min_m': [min(p[i] for p in points) for i in range(3)],
                'max_m': [max(p[i] for p in points) for i in range(3)]}

    result = {
        'schema_version': 1, 'source_glb': str(Path(source).resolve()),
        'blender_version': bpy.app.version_string,
        'coordinate_system': 'right-handed glTF: X right, Y up, Z forward',
        'conversion': 'Blender world (x,y,z) -> (x,z,-y) * scene.unit_settings.scale_length',
        'unit_scale_m': unit,
        'rest_source': 'armature.matrix_world @ Bone.head_local (pose independent)',
        'tail_warning': 'Imported bone tails may be synthesized; not fingertip/chin landmarks.',
        'armatures': [], 'meshes': [],
    }
    all_points = []
    # 스킨 원본 정점만 사용한다. evaluated mesh는 애니메이션 pose를 섞는다.
    for obj in sorted(bpy.context.scene.objects, key=lambda o: o.name):
        if obj.type != 'MESH' or not obj.data.vertices:
            continue
        if not any(m.type == 'ARMATURE' and m.object for m in obj.modifiers):
            continue  # glTF 임포터의 뼈 표시용 Icosphere 등은 캐릭터가 아니다.
        vertices = [point(obj.matrix_world @ v.co) for v in obj.data.vertices]
        all_points.extend(vertices)
        groups = {}
        for vertex, world in zip(obj.data.vertices, vertices):
            if vertex.groups:
                dominant = max(vertex.groups, key=lambda g: g.weight)
                if dominant.weight >= 0.5:
                    name = obj.vertex_groups[dominant.group].name
                    groups.setdefault(name, []).append(world)
        result['meshes'].append({
            'name': obj.name, 'vertices': len(vertices), **bounds(vertices),
            'dominant_weight_bounds': {name: {'vertices': len(pts), **bounds(pts)}
                                       for name, pts in groups.items()},
        })
    if all_points:
        result['mesh_bounds'] = bounds(all_points)
        result['mesh_height_m'] = max(v.y for v in all_points) - min(v.y for v in all_points)
    for rig in sorted(bpy.context.scene.objects, key=lambda o: o.name):
        if rig.type != 'ARMATURE':
            continue
        bones = []
        by_name = {}
        for bone in rig.data.bones:
            head = point(rig.matrix_world @ bone.head_local)
            tail = point(rig.matrix_world @ bone.tail_local)
            record = {
                'name': bone.name, 'parent': bone.parent.name if bone.parent else None,
                'humanoid': HUMANOID.get(bone.name), 'head_m': serial(head),
                'tail_m': serial(tail), 'length_m': (tail - head).length,
                'deform': bone.use_deform,
            }
            bones.append(record)
            by_name[bone.name] = head
        lengths = {}
        for side in ('Left', 'Right'):
            for key, start, end in (('upper_arm', 'Arm', 'ForeArm'),
                                    ('forearm', 'ForeArm', 'Hand'),
                                    ('thigh', 'UpLeg', 'Leg'), ('shin', 'Leg', 'Foot')):
                if side + start in by_name and side + end in by_name:
                    lengths[side + '_' + key + '_m'] = (by_name[side + end] - by_name[side + start]).length
        result['armatures'].append({'rig_key': rig.name, 'data_key': rig.data.name,
                                     'bone_count': len(bones), 'bones': bones,
                                     'joint_segment_lengths': lengths})
    return result


def main():
    args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    if len(args) != 2:
        raise ValueError('사용법: -- <input.glb> <out.json>')
    source, output = map(Path, args)
    if not source.is_file():
        raise FileNotFoundError(source)
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    bpy.context.scene.unit_settings.scale_length = 1.0
    bpy.ops.import_scene.gltf(filepath=str(source))
    result = extract_scene(source)
    if not result['armatures'] or not result.get('meshes'):
        raise ValueError('GLB에 리그 또는 메시가 없음')
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'output': str(output), 'rigs': len(result['armatures']),
                      'bones': [r['bone_count'] for r in result['armatures']],
                      'height_m': result['mesh_height_m']}, ensure_ascii=False))


if __name__ == '__main__':
    main()
