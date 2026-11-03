"""Evaluated world-space BVH metrics. Never equate overlap() count with depth.

Depth is sampled, not an exact continuous-volume maximum. Open/non-manifold
surfaces cannot certify an inside sign and never silently pass as zero depth.
Nearest-vertex distances are reported separately from nearest-surface depths.
The vertex proxy can include original AABB-candidate corners outside the
opposing closed solid when that pair intersects; it is a conservative contact
candidate distance, not the depth of penetrating vertices alone.
"""
from collections import Counter
import bpy
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree


class Snapshot:
    def __init__(self, source):
        deps = bpy.context.evaluated_depsgraph_get()
        evaluated = source.evaluated_get(deps)
        mesh = evaluated.to_mesh()
        mesh.calc_loop_triangles()
        self.vertices = []
        remap, weld = {}, {}
        for v in mesh.vertices:
            point = evaluated.matrix_world @ v.co
            key = tuple(round(float(value), 7) for value in point)
            if key not in weld:
                weld[key] = len(self.vertices)
                self.vertices.append(point)
            remap[v.index] = weld[key]
        self.triangles = []
        self.triangle_ids = []
        for tri in mesh.loop_triangles:
            indices = tuple(remap[i] for i in tri.vertices)
            if len(set(indices)) == 3:
                self.triangles.append(indices)
                self.triangle_ids.append(tri.index)
        evaluated.to_mesh_clear()
        edges = Counter(tuple(sorted((tri[i], tri[(i+1) % 3]))) for tri in self.triangles for i in range(3))
        self.boundary_indices = sorted({i for edge, count in edges.items() if count == 1 for i in edge})
        self.nonmanifold_edges = sum(count > 2 for count in edges.values())
        self.closed = not self.boundary_indices and not self.nonmanifold_edges
        self.low = Vector(tuple(min(v[i] for v in self.vertices) for i in range(3)))
        self.high = Vector(tuple(max(v[i] for v in self.vertices) for i in range(3)))
        self.diagonal = (self.high-self.low).length
        self.tree_vertices = KDTree(len(self.vertices))
        for i, v in enumerate(self.vertices):
            self.tree_vertices.insert(v, i)
        self.tree_vertices.balance()
        # FromObject is object-local. Bake every evaluated vertex to metres in
        # a temporary identity object so independently transformed parts agree.
        self.mesh = bpy.data.meshes.new("Metric snapshot")
        self.mesh.from_pydata(self.vertices, [], self.triangles)
        self.obj = bpy.data.objects.new("Metric snapshot", self.mesh)
        bpy.context.scene.collection.objects.link(self.obj)
        self.obj.matrix_world = Matrix.Identity(4)
        bpy.context.view_layer.update()
        self.tree = BVHTree.FromObject(self.obj, bpy.context.evaluated_depsgraph_get(), deform=False, epsilon=1e-8)

    def close(self):
        bpy.data.objects.remove(self.obj, do_unlink=True)
        bpy.data.meshes.remove(self.mesh)

    def in_box(self, point, padding=1e-7):
        return all(self.low[i]-padding <= point[i] <= self.high[i]+padding for i in range(3))

    def inside(self, point, confirm=False):
        hit, normal, index, distance = self.tree.find_nearest(point)
        if hit is None or distance <= 1e-7:
            return False, False
        if not self.closed:
            return (point-hit).dot(normal) < -1e-7, True
        answers = []
        for direction in (Vector((.327, .497, .803)), Vector((-.613, .719, .325)), Vector((.851, -.283, .441))):
            direction.normalize()
            origin = point.copy()
            count = 0
            for _ in range(512):
                location, _, _, _ = self.tree.ray_cast(origin, direction, self.diagonal*3+1)
                if location is None:
                    break
                count += 1
                origin = location + direction*1e-6
            answers.append(count % 2 == 1)
        verdict, ambiguous = sum(answers) >= 2, len(set(answers)) > 1
        if confirm and verdict and ambiguous:
            # 11-04 head1: the 3-ray vote disagreed (2 of 3). Re-vote with 40 fixed Fibonacci-sphere directions; a point 12 mm outside
            # the head (surface normal side +12 mm, 39 of 40 rays even) was counted as 12 mm deep. Unanimous 3-ray verdicts are unchanged.
            import math
            odd = 0
            for k in range(40):
                z = 1 - 2 * (k + .5) / 40
                r = math.sqrt(1 - z * z)
                a = k * 2.399963229728653
                direction = Vector((r * math.cos(a), r * math.sin(a), z))
                origin = point.copy()
                count = 0
                for _ in range(512):
                    location, _, _, _ = self.tree.ray_cast(origin, direction, self.diagonal*3+1)
                    if location is None:
                        break
                    count += 1
                    origin = location + direction*1e-6
                odd += count % 2
            verdict = odd * 2 > 40
        return verdict, ambiguous


def pair_metrics(a, b):
    overlapping_box = all(a.low[i] <= b.high[i]+1e-7 and b.low[i] <= a.high[i]+1e-7 for i in range(3))
    overlaps = a.tree.overlap(b.tree) if overlapping_box else []
    surface, vertex, open_proximity, inside_count, uncertain = 0., 0., 0., 0, 0
    measured_closed_direction = not overlapping_box
    if overlapping_box:
        for source, target, involved in ((a, b, {i for i, _ in overlaps}), (b, a, {j for _, j in overlaps})):
            involved_vertices = {j for i in involved for j in source.triangles[i]}
            # Open sheets have no well-defined interior. Only report unsigned
            # proximity near intersecting triangles; never call far points
            # behind a sheet a half-metre penetration.
            samples = [(point, True) for i, point in enumerate(source.vertices)
                       if target.in_box(point) and (target.closed or i in involved_vertices)]
            for i in involved:
                tri = source.triangles[i]
                point = sum((source.vertices[j] for j in tri), Vector())/3
                if target.in_box(point):
                    samples.append((point, False))
            for point, is_vertex in samples:
                if not target.closed:
                    open_proximity = max(open_proximity, target.tree.find_nearest(point)[3])
                    if is_vertex:
                        vertex = max(vertex, target.tree_vertices.find(point)[2])
                    continue
                measured_closed_direction = True
                inside, ambiguous = target.inside(point)
                uncertain += int(ambiguous)
                # An intersecting triangle can have all original corners on
                # the other solid's side surfaces. Keep its vertex proximity
                # even when the signed surface depth at that corner is zero.
                if is_vertex and (inside or overlaps):
                    vertex = max(vertex, target.tree_vertices.find(point)[2])
                if not inside:
                    continue
                inside_count += 1
                distance = target.tree.find_nearest(point)[3]
                surface = max(surface, distance)
    return {"overlapTrianglePairs": len(overlaps),
            "overlappedTrianglesA": len({i for i, _ in overlaps}), "overlappedTrianglesB": len({j for _, j in overlaps}),
            "maxSurfaceDepthMm": surface*1000 if measured_closed_direction else None,
            "maxOpenSurfaceProximityMm": open_proximity*1000,
            "maxNearestVertexMm": vertex*1000,
            "containedSampleCount": inside_count, "uncertainSignSamples": uncertain,
            "depthVerified": (not overlapping_box) or (a.closed and b.closed and uncertain == 0),
            "topologyAClosed": a.closed, "topologyBClosed": b.closed,
            "boundaryVerticesA": len(a.boundary_indices), "boundaryVerticesB": len(b.boundary_indices)}


def boundary_gap(first, second):
    """Symmetric maximum of nearest boundary-vertex distances, in millimetres.
    Missing/open-ring selection never becomes a fabricated zero gap.
    """
    if not first or not second:
        return None
    largest = 0.
    for source, target in ((first, second), (second, first)):
        kd = KDTree(len(target))
        for i, point in enumerate(target):
            kd.insert(Vector(point), i)
        kd.balance()
        largest = max(largest, max(kd.find(Vector(point))[2] for point in source))
    return largest*1000
