# 1-1 바닥 잔해 아틀라스 굽기(우리 제작, 레퍼런스 원본 0). blender -b -P bl_atlas.py -- <out_dir>
# 4열×8행 셀(셀 512×256px = 2×1 단위). 0~9 잔가지, 10~14 솔잎 무더기, 15~19 잔뿌리, 20~25 낙엽 조각. 26~31 비움.
# 출력: debris_col.png(sRGB, 알파), debris_nrm.png(탄젠트=위에서 본 x→오른쪽, y→위, Raw), debris_h.png(Raw, 0~1)
import bpy, bmesh, math, random, sys, os
OUT = sys.argv[sys.argv.index('--') + 1]; os.makedirs(OUT, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
eng = [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items]
sc.render.engine = 'BLENDER_EEVEE' if 'BLENDER_EEVEE' in eng else 'BLENDER_EEVEE_NEXT'
sc.render.resolution_x = sc.render.resolution_y = 2048; sc.render.film_transparent = True
sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_mode = 'RGBA'; sc.render.image_settings.color_depth = '8'
try: sc.eevee.taa_render_samples = 16
except Exception: pass
cam = bpy.data.cameras.new('c'); cam.type = 'ORTHO'; cam.ortho_scale = 8; co = bpy.data.objects.new('c', cam); co.location = (4, 4, 5); sc.collection.objects.link(co); sc.camera = co
R = random.Random(1107)
def lin(c): return tuple(c)   # 바이트 색 속성은 sRGB 값을 그대로 받는다
def lerp3(a, b, t): return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))
HMAX = .16   # 높이 정규화 상한(셀 단위)

def tube(bm, col_layer, pts, radii, cols, sides=6):
    rings = []
    for i, p in enumerate(pts):
        a = pts[min(i + 1, len(pts) - 1)]; b = pts[max(i - 1, 0)]; dx, dy = a[0] - b[0], a[1] - b[1]; l = math.hypot(dx, dy) or 1
        nx, ny = -dy / l, dx / l; ring = []
        for k in range(sides):
            t = 2 * math.pi * k / sides; r = radii[i]
            v = bm.verts.new((p[0] + nx * r * math.cos(t), p[1] + ny * r * math.cos(t), p[2] + r * math.sin(t) + r)); ring.append(v)
        rings.append(ring)
    for i in range(len(rings) - 1):
        for k in range(sides):
            f = bm.faces.new((rings[i][k], rings[i][(k + 1) % sides], rings[i + 1][(k + 1) % sides], rings[i + 1][k]))
            for loop in f.loops:
                idx = i if loop.vert in rings[i] else i + 1; loop[col_layer] = (*lin(cols[idx]), 1)
    for ring, c in ((rings[0], cols[0]), (rings[-1], cols[-1])):
        f = bm.faces.new(ring)
        for loop in f.loops: loop[col_layer] = (*lin(c), 1)

def path(start, ang, length, n, wiggle):
    pts = [start]; a = ang
    for i in range(n):
        a += R.uniform(-wiggle, wiggle); s = length / n
        pts.append((pts[-1][0] + math.cos(a) * s, pts[-1][1] + math.sin(a) * s, 0))
    return pts

def obj(name, builder, cell):
    me = bpy.data.meshes.new(name); bm = bmesh.new(); cl = bm.loops.layers.color.new('col')
    builder(bm, cl)
    xs = [v.co.x for v in bm.verts]; ys = [v.co.y for v in bm.verts]; cx0, cy0 = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    k = min(1.0, 1.84 / max(1e-3, max(xs) - min(xs)), .88 / max(1e-3, max(ys) - min(ys)))   # 셀(2×1) 안에 여백 두고 맞춤
    for v in bm.verts: v.co.x, v.co.y, v.co.z = (v.co.x - cx0) * k, (v.co.y - cy0) * k, v.co.z * k
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o)
    cx, cy = cell % 4, cell // 4; o.location = (cx * 2 + 1, 8 - (cy + .5), 0)   # 셀 중심(위 행이 0번)
    return o

BARK0, BARK1 = (.30, .22, .15), (.60, .50, .38)   # 밑동 어두운 갈색 → 끝 밝은 회갈
def twig(bm, cl):
    L = R.uniform(1.6, 1.85); main = path((-L / 2, R.uniform(-.1, .1), 0), R.uniform(-.12, .12), L, 14, .14)
    r0 = R.uniform(.06, .085); n = len(main)
    tube(bm, cl, main, [r0 * (1 - .75 * i / (n - 1)) for i in range(n)], [lerp3(BARK0, BARK1, (i / (n - 1)) ** .8) for i in range(n)])
    for _ in range(R.randint(1, 3)):
        j = R.randint(3, n - 4); side = R.choice((-1, 1)); a = math.atan2(main[j + 1][1] - main[j][1], main[j + 1][0] - main[j][0]) + side * R.uniform(.4, .9)
        sl = R.uniform(.25, .6); br = path(main[j], a, sl, 6, .2); m = len(br); rb = r0 * (1 - .75 * j / (n - 1)) * .6
        tube(bm, cl, br, [rb * (1 - .8 * i / (m - 1)) for i in range(m)], [lerp3(lerp3(BARK0, BARK1, j / n), BARK1, i / (m - 1)) for i in range(m)])
        if R.random() < .5:
            k = R.randint(2, m - 2); tw = path(br[k], a + side * R.uniform(.5, .9), sl * .4, 4, .2)
            tube(bm, cl, tw, [rb * .55 * (1 - .7 * i / 4) for i in range(5)], [BARK1] * 5, 5)
def needles(bm, cl):
    for _ in range(R.randint(28, 46)):
        cxy = (R.gauss(0, .45), R.gauss(0, .2)); a = R.uniform(0, math.pi); ln = R.uniform(.22, .38)
        p0 = (cxy[0] - math.cos(a) * ln / 2, cxy[1] - math.sin(a) * ln / 2, R.uniform(0, .02)); p1 = (cxy[0] + math.cos(a) * ln / 2, cxy[1] + math.sin(a) * ln / 2, p0[2])
        c = lerp3((.40, .29, .19), (.55, .46, .35), R.random())
        tube(bm, cl, [p0, ((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, p0[2]), p1], [.015, .013, .008], [c, c, lerp3(c, (.62, .52, .40), .5)], 4)
def rootlet(bm, cl):
    L = R.uniform(1.5, 1.8); main = path((-L / 2, R.uniform(-.15, .15), 0), R.uniform(-.2, .2), L, 16, .35); n = len(main)
    c0, c1 = (.22, .16, .12), (.42, .35, .28)
    tube(bm, cl, main, [.05 * (1 - .75 * i / (n - 1)) for i in range(n)], [lerp3(c0, c1, i / (n - 1)) for i in range(n)])
    for _ in range(R.randint(3, 6)):
        j = R.randint(1, n - 3); a = R.uniform(0, 2 * math.pi); br = path(main[j], a, R.uniform(.15, .4), 5, .4)
        tube(bm, cl, br, [.022 * (1 - .7 * i / 5) for i in range(6)], [lerp3(c0, c1, .6 + .4 * i / 5) for i in range(6)], 4)
LEAF = [(.50, .32, .16), (.42, .36, .20), (.55, .38, .20), (.36, .26, .15)]
def leaves(bm, cl):
    for _ in range(R.randint(3, 6)):
        cx, cy = R.uniform(-.65, .65), R.uniform(-.22, .22); a = R.uniform(0, math.pi); ln = R.uniform(.42, .6); wd = ln * R.uniform(.38, .52)
        c = LEAF[R.randrange(4)]; c = lerp3(c, (.55, .5, .42), R.uniform(0, .25)); edge = lerp3(c, (.2, .16, .12), .45); N = 14
        center = bm.verts.new((cx, cy, .03)); ring = []
        for k in range(N):
            t = 2 * math.pi * k / N; rx = ln / 2 * math.cos(t); ry = wd / 2 * math.sin(t) * (1 - .3 * math.cos(t)) * R.uniform(.75, 1.05)
            if R.random() < .2: rx *= .8; ry *= .7   # 찢긴 가장자리
            x, y = cx + rx * math.cos(a) - ry * math.sin(a), cy + rx * math.sin(a) + ry * math.cos(a)
            ring.append(bm.verts.new((x, y, .03 + .06 * (abs(math.sin(t)) ** 2) * R.uniform(.5, 1))))   # 가장자리가 말려 올라감
        for k in range(N):
            f = bm.faces.new((center, ring[k], ring[(k + 1) % N]))
            for loop in f.loops: loop[cl] = (*lin(c if loop.vert is center else edge), 1)
        mid = [bm.verts.new((cx + s * ln / 2 * math.cos(a), cy + s * ln / 2 * math.sin(a), .045)) for s in (-1, 1)]   # 잎맥
        tube(bm, cl, [(*v.co[:2], .035) for v in mid], [.006, .004], [edge, edge], 4)

kinds = [twig] * 10 + [needles] * 5 + [rootlet] * 5 + [leaves] * 6
objs = [obj('piece%02d' % i, k, i) for i, k in enumerate(kinds)]
def mat(kind):
    m = bpy.data.materials.new(kind); m.use_nodes = True; N_ = m.node_tree.nodes; L_ = m.node_tree.links
    out = N_['Material Output']; N_.remove(N_['Principled BSDF']); em = N_.new('ShaderNodeEmission')
    if kind == 'col':
        at = N_.new('ShaderNodeVertexColor'); at.layer_name = 'col'; L_.new(at.outputs['Color'], em.inputs['Color'])
    elif kind == 'nrm':
        g = N_.new('ShaderNodeNewGeometry'); vm = N_.new('ShaderNodeVectorMath'); vm.operation = 'MULTIPLY_ADD'
        vm.inputs[1].default_value = (.5, .5, .5); vm.inputs[2].default_value = (.5, .5, .5); L_.new(g.outputs['Normal'], vm.inputs[0]); L_.new(vm.outputs[0], em.inputs['Color'])
    else:
        g = N_.new('ShaderNodeNewGeometry'); sp = N_.new('ShaderNodeSeparateXYZ'); L_.new(g.outputs['Position'], sp.inputs[0])
        d = N_.new('ShaderNodeMath'); d.operation = 'DIVIDE'; d.inputs[1].default_value = HMAX; d.use_clamp = True; L_.new(sp.outputs['Z'], d.inputs[0])
        cr = N_.new('ShaderNodeCombineColor'); [L_.new(d.outputs[0], cr.inputs[i]) for i in range(3)]; L_.new(cr.outputs[0], em.inputs['Color'])
    L_.new(em.outputs[0], out.inputs['Surface']); return m
for kind, vt in (('col', 'Standard'), ('nrm', 'Raw'), ('h', 'Raw')):
    m = mat(kind)
    for o in objs: o.data.materials.clear(); o.data.materials.append(m)
    sc.view_settings.view_transform = vt; sc.render.filepath = os.path.join(OUT, 'debris_%s.png' % kind); bpy.ops.render.render(write_still=True)
print('atlas ok', len(objs))
