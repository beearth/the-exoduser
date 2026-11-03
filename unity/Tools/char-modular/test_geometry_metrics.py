"""Calibration with known millimetres, containment and world-space transforms."""
import importlib.util
from pathlib import Path
import sys
import bpy
from mathutils import Matrix

sys.path.insert(0, str(Path(__file__).parent))
assert importlib.util.find_spec("geometry_metrics") is not None, "BVH metric implementation is missing"
from geometry_metrics import Snapshot, pair_metrics, boundary_gap

bpy.ops.wm.read_factory_settings(use_empty=True)

def cube(name, center, size=.2):
    bpy.ops.mesh.primitive_cube_add(size=size, location=center)
    obj = bpy.context.object
    obj.name = name
    bpy.context.view_layer.update()
    return obj

a = Snapshot(cube("A", (0, 0, 0)))
b = Snapshot(cube("B_disjoint", (1, 0, 0)))
m = pair_metrics(a, b)
assert m["overlapTrianglePairs"] == 0 and m["maxSurfaceDepthMm"] == 0, m
assert m["depthVerified"], m
b.close()
b = Snapshot(cube("B_one_mm", (.199, 0, 0)))
m = pair_metrics(a, b)
assert m["overlapTrianglePairs"] > 0, m
assert abs(m["maxSurfaceDepthMm"] - 1) < .03, m
assert abs(m["maxNearestVertexMm"] - 1) < .03, m
assert m["depthVerified"], m
b.close()
b = Snapshot(cube("B_contained", (0, 0, 0), .02))
m = pair_metrics(a, b)
assert m["overlapTrianglePairs"] == 0 and m["maxSurfaceDepthMm"] > 89, m
assert m["containedSampleCount"] > 0, m
b.close()
bpy.ops.mesh.primitive_plane_add(size=.1, location=(0, 0, 0))
open_obj = bpy.context.object
bpy.context.view_layer.update()
b = Snapshot(open_obj)
m = pair_metrics(a, b)
assert not m["depthVerified"] and b.boundary_indices, m
a.close(); b.close()
p = [(-.05, -.05, 0), (.05, -.05, 0), (.05, .05, 0), (-.05, .05, 0)]
q = [(x, y, .0015) for x, y, _ in p]
assert abs(boundary_gap(p, q) - 1.5) < .001
assert boundary_gap([], q) is None
print("GEOMETRY_METRICS_CALIBRATION_PASS: separation/world-transform/1mm/containment/open-boundary/1.5mm-gap")
