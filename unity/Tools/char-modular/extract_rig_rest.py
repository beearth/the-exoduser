"""DECISION-1: Meshy는 구조만, rest는 Tripo 파트 경계에서만 정한다.

Blender -b --python <이 파일> -- <Meshy.glb> <out.json> --hero silvertail
Blender -b --python <이 파일> -- <Tripo.glb> <out.json> --mode tripo --hero ivan --asset-id d381fefe
Tripo 모드는 비리깅 메시도 검사한다. 자동 관절 추정·Meshy 좌표 전용은 하지 않는다.
"""
import argparse
import json
from pathlib import Path
import sys

import bpy


HUMANOID = {'Hips': 'Hips', 'Spine02': 'Spine', 'Spine01': 'Chest',
            'Spine': 'UpperChest', 'neck': 'Neck', 'Head': 'Head'}
for side in ('Left', 'Right'):
    for source, target in (('Shoulder', 'Shoulder'), ('Arm', 'UpperArm'),
                           ('ForeArm', 'LowerArm'), ('Hand', 'Hand'),
                           ('UpLeg', 'UpperLeg'), ('Leg', 'LowerLeg'),
                           ('Foot', 'Foot'), ('ToeBase', 'Toes')):
        HUMANOID[side + source] = side + target

ASSETS = {'silvertail': ['214c3a56'], 'ivan': ['d381fefe', '816e7107']}
EXTRA_POINTS = ['LeftHandTip', 'RightHandTip', 'Scalp', 'Chin', 'ModelFloor', 'ModelTop']


def pending_measurements(hero, names=None):
    """미수령 GLB에 숫자를 넣지 않는 측정표. 승인 목표만 제공한다."""
    if hero not in ASSETS:
        raise ValueError('hero는 silvertail 또는 ivan')
    names = list(names if names is not None else list(HUMANOID) + ['head_end', 'headfront'])
    targets = {'upper_arm': [0.18, 0.19], 'forearm': [0.145, 0.155],
               'hand': [0.10, 0.11], 'arm_down_tip': [0.36, 0.40],
               'arm_span': [0.98, 1.06 if hero == 'ivan' else 1.05],
               'head_scalp_chin': [0.130, 0.135], 'thigh_shin': [0.90, 1.05]}
    return {
        'decision': 'DECISION-1', 'hero': hero, 'source_asset_ids': ASSETS[hero],
        'status': 'GLB 수령 후', 'model_height_target_m': 1.72 if hero == 'silvertail' else 1.85,
        'display_scale': 0.87, 'rest_authority': 'Tripo part boundaries only',
        'rest_points': [{'name': n, 'part': None, 'vertex_indices': [], 'rest_m': None,
                         'status': 'GLB 수령 후'} for n in names + EXTRA_POINTS],
        'ratios': {key: {'target': value, 'current': None, 'status': 'GLB 수령 후'}
                   for key, value in targets.items()},
        'arm_span_method': 'Actual A-pose chain with elbow bends; no straight-arm estimate',
        'shoulder_policy': 'Ivan shoulder width is preserved; never narrowed',
    }


def extract_scene(source):
    """Meshy에서 이름·부모·Humanoid 대응만 반환. 좌표·길이·메시 비율 없음."""
    armatures = []
    for rig in sorted(bpy.context.scene.objects, key=lambda o: o.name):
        if rig.type == 'ARMATURE':
            bones = [{'name': b.name, 'parent': b.parent.name if b.parent else None,
                      'humanoid': HUMANOID.get(b.name)} for b in rig.data.bones]
            armatures.append({'rig_key': rig.name, 'data_key': rig.data.name,
                              'bone_count': len(bones), 'bones': bones})
    return {'schema_version': 2, 'decision': 'DECISION-1',
            'source_glb': str(Path(source).resolve()), 'blender_version': bpy.app.version_string,
            'authority': 'Meshy: names, parents, Humanoid only', 'armatures': armatures}


def inspect_parts_scene(source, hero, asset_id):
    """Tripo 파트 목록·경계 상자를 제공하고 수동 경계 랜드마크 지정까지 rest를 비운다."""
    result = pending_measurements(hero)
    if asset_id not in ASSETS[hero]:
        raise ValueError('DECISION-1에 지정되지 않은 Tripo 에셋')
    unit = bpy.context.scene.unit_settings.scale_length
    parts = []
    for obj in sorted(bpy.context.scene.objects, key=lambda o: o.name):
        if obj.type != 'MESH' or obj.hide_render or not obj.data.vertices:
            continue
        points = [obj.matrix_world @ v.co for v in obj.data.vertices]
        points = [(p.x * unit, p.z * unit, -p.y * unit) for p in points]
        parts.append({'name': obj.name, 'vertices': len(points),
                      'min_m': [min(p[i] for p in points) for i in range(3)],
                      'max_m': [max(p[i] for p in points) for i in range(3)]})
    result.update({'source_glb': str(Path(source).resolve()), 'source_asset_id': asset_id,
                   'coordinate_system': 'glTF Y-up m: Blender world (x,z,-y) * unit scale',
                   'parts': parts, 'status': '파트 경계 랜드마크 지정 후'})
    # 파트 bbox 중심은 관절이 아니다. 어깨/팔꿈치/손목 등의 실제 경계 링을 지정해야 한다.
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('output', type=Path)
    parser.add_argument('--mode', choices=['topology', 'tripo'], default='topology')
    parser.add_argument('--hero', choices=list(ASSETS), required=True)
    parser.add_argument('--asset-id')
    args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else [])
    if not args.source.is_file():
        raise FileNotFoundError(args.source)
    if args.source.resolve() == args.output.resolve():
        raise ValueError('원본 GLB를 출력으로 덮어쓸 수 없음')
    if args.output.suffix.lower() != '.json':
        raise ValueError('출력은 JSON만 허용')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    bpy.context.scene.unit_settings.scale_length = 1.0
    bpy.ops.import_scene.gltf(filepath=str(args.source))
    if args.mode == 'topology':
        result = extract_scene(args.source)
        if len(result['armatures']) != 1:
            raise ValueError('단일 Meshy 리그가 필요함')
        result['tripo_measurements'] = pending_measurements(
            args.hero, [b['name'] for b in result['armatures'][0]['bones']])
    else:
        result = inspect_parts_scene(args.source, args.hero, args.asset_id)
        if not result['parts']:
            raise ValueError('Tripo 메시 파트 없음')
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'output': str(args.output), 'mode': args.mode,
                      'status': 'Meshy 구조만 추출; Tripo rest 측정 대기' if args.mode == 'topology'
                      else result['status']}, ensure_ascii=False))


if __name__ == '__main__':
    main()
