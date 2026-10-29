"""Independent S3 staff retouch. Y up, metres; preserves the v1 study.

The existing Druid BaseColor atlas is sampled by UV in Unity. No new image is made.
"""
from pathlib import Path
import math

OUT = Path(__file__).resolve().parents[2] / "Assets/Exoduser/Remodel/Boss/DarkDruid/Studies"
V, UV, F, M = [], [], [], []
MATERIALS = {
    "charred_root": "Kd 0.68 0.62 0.55\nNs 20",
    "raised_bark": "Kd 0.86 0.75 0.60\nNs 18",
    "recess": "Kd 0.15 0.13 0.11\nNs 8",
    "leather": "Kd 0.29 0.16 0.12\nNs 20",
    "bone": "Kd 0.71 0.65 0.49\nNs 36",
    "orb": "Kd 0.28 0.30 0.15\nKe 0.62 0.66 0.23\nNs 64",
    "orb_vein": "Kd 0.17 0.19 0.08\nNs 32",
}


def vertex(p, uv=(.5, .5)):
    V.append((p[0], min(p[1], 2.30), p[2]))
    UV.append(uv)
    return len(V)


def triangle(a, b, c, mat):
    F.append((a, b, c))
    M.append(mat)


def tube(points, radii, mat, sides=12, grain=.08, phase=0):
    rings = []
    distance = 0.0
    for i, p in enumerate(points):
        if i:
            distance += math.dist(p, points[i-1])
        p0, p1 = points[max(0, i-1)], points[min(len(points)-1, i+1)]
        t = [p1[k]-p0[k] for k in range(3)]
        mag = math.sqrt(sum(q*q for q in t))
        t = [q/mag for q in t]
        guide = (0, 0, 1) if abs(t[2]) < .9 else (1, 0, 0)
        u = (t[1]*guide[2]-t[2]*guide[1], t[2]*guide[0]-t[0]*guide[2], t[0]*guide[1]-t[1]*guide[0])
        mag = math.sqrt(sum(q*q for q in u))
        u = [q/mag for q in u]
        w = (t[1]*u[2]-t[2]*u[1], t[2]*u[0]-t[0]*u[2], t[0]*u[1]-t[1]*u[0])
        ring = []
        for j in range(sides):
            a = 2*math.pi*j/sides
            relief = 1+grain*(.65*math.sin(7*a+.11*i+phase)+.35*math.sin(13*a-.09*i+phase))
            r = radii[i]*relief
            pos = tuple(p[k]+r*(math.cos(a)*u[k]+math.sin(a)*w[k]) for k in range(3))
            # Constrain UVs to a bark-rich region of the existing, unmodified atlas.
            uv = (.175+.115*j/sides, .43+.14*(distance/.72 % 1)) if mat in ("charred_root", "raised_bark") else (j/sides, distance/.45)
            ring.append(vertex(pos, uv))
        rings.append(ring)
    for a, b in zip(rings[:-1], rings[1:]):
        for j in range(sides):
            k = (j+1) % sides
            triangle(a[j], a[k], b[k], mat)
            triangle(a[j], b[k], b[j], mat)


def ellipsoid(center, radii, mat, sides=28, rows=16):
    rings = []
    for i in range(1, rows):
        lat = math.pi*i/rows
        ring = []
        for j in range(sides):
            lon = 2*math.pi*j/sides
            p = (center[0]+radii[0]*math.sin(lat)*math.cos(lon),
                 center[1]+radii[1]*math.cos(lat),
                 center[2]+radii[2]*math.sin(lat)*math.sin(lon))
            ring.append(vertex(p, (j/sides, i/rows)))
        rings.append(ring)
    top = vertex((center[0], center[1]+radii[1], center[2]), (.5, 1))
    bottom = vertex((center[0], center[1]-radii[1], center[2]), (.5, 0))
    for j in range(sides):
        k = (j+1) % sides
        triangle(top, rings[0][j], rings[0][k], mat)
        triangle(bottom, rings[-1][k], rings[-1][j], mat)
    for a, b in zip(rings[:-1], rings[1:]):
        for j in range(sides):
            k = (j+1) % sides
            triangle(a[j], b[j], b[k], mat)
            triangle(a[j], b[k], a[k], mat)


def center(y):
    return (.012*math.sin(3.1*y)+.006*math.sin(10*y), y,
            .008*math.sin(4.2*y+.5))


# Three interwoven load-bearing roots remain inside the 4 cm shaft envelope.
for strand in range(3):
    pts, rs = [], []
    for i in range(191):
        y = .07+1.83*i/190
        cx, _, cz = center(y)
        a = strand*2*math.pi/3 + 7.4*y + .23*math.sin(5*y+strand)
        offset = .0071+.0014*math.sin(8*y+strand)
        pts.append((cx+offset*math.cos(a), y, cz+offset*math.sin(a)))
        rs.append(.0103+.0012*math.sin(6*y+strand))
    tube(pts, rs, "charred_root", 14, .23, strand)
    # A longitudinal grain seam reinforces the helical flow without enlarging it.
    seam = []
    for p in pts[3:-3:2]:
        seam.append((p[0]+.009*math.cos(strand*2.09+7.4*p[1]), p[1],
                     p[2]+.009*math.sin(strand*2.09+7.4*p[1])))
    tube(seam, [.0027]*len(seam), "raised_bark", 6, 0, strand)

# Twenty-centimetre grip around the 0.85 m hand position.
for strand in (0, 1):
    pts = []
    for i in range(185):
        y = .75+.20*i/184
        cx, _, cz = center(y)
        a = math.pi*strand+10*math.pi*i/184
        pts.append((cx+.0203*math.cos(a), y, cz+.0203*math.sin(a)))
    tube(pts, [.004]*len(pts), "leather", 8, 0)

# Bird skull and narrow hooked beak above the grip.
ellipsoid((.026, 1.035, .027), (.026, .035, .026), "bone", 20, 10)
tube([(.027,1.026,.047),(.030,1.015,.074),(.031,.993,.104),(.028,.980,.116)],
     [.017,.012,.006,.001], "bone", 12)
for s in (-1, 1):
    ellipsoid((.026+s*.019,1.043,.046), (.005,.008,.004), "recess", 10, 6)

# Blunt bone butt is the lowest point; cage underside stays clear for slam contact.
tube([(0,.075,0),(.004,.036,0),(.004,0,0)], [.021,.027,.020], "bone", 18, .05)

orb = (.030, 2.063, .001)
ellipsoid(orb, (.080,.080,.076), "orb", 40, 24)

# Irregular woody shell plates interrupt the bright sphere with visible cracks.
# The gaps expose the unchanged olive light; the shell does not add an image.
for band, (lat0, lat1) in enumerate(((.36, 1.43), (1.65, 2.76))):
    for section in range(7):
        start = section*2*math.pi/7 + .11*band
        span = .58+.07*math.sin(section*2.3+band)
        grid = []
        for row in range(5):
            t = row/4
            lat = lat0+(lat1-lat0)*t
            twist = .17*math.sin(math.pi*t+section*1.9)
            ring = []
            for col in range(4):
                s = col/3
                lon = start+span*s+twist
                r = 1.018
                ring.append(vertex((orb[0]+.080*r*math.sin(lat)*math.cos(lon),
                                    orb[1]+.080*r*math.cos(lat),
                                    orb[2]+.076*r*math.sin(lat)*math.sin(lon))))
            grid.append(ring)
        for a, b in zip(grid[:-1], grid[1:]):
            for col in range(3):
                triangle(a[col], b[col], b[col+1], "orb_vein")
                triangle(a[col], b[col+1], a[col+1], "orb_vein")

# Five unequal primary roots plus one thinner cross-root: S3's broken diagonal cage.
# Each path enters from the 1.90 m collar and ends at or below the 2.30 m lock.
ROOTS = [
    [(.032,1.900,.000),(-.027,1.957,.035),(-.099,2.042,.053),(-.124,2.139,.040),(-.074,2.235,-.007),(-.057,2.300,-.021)],
    [(.028,1.902,.006),(.068,1.951,.052),(.133,2.037,.069),(.102,2.133,.023),(.069,2.217,-.034),(.085,2.281,-.052)],
    [(.029,1.900,-.004),(.004,1.961,-.075),(-.065,2.048,-.106),(-.043,2.162,-.090),(.005,2.242,-.063),(.028,2.286,-.044)],
    [(.033,1.903,-.004),(.075,1.976,-.054),(.135,2.069,-.035),(.127,2.173,-.057),(.053,2.243,-.063),(.041,2.293,-.065)],
    [(.027,1.903,.003),(-.019,1.959,.069),(.008,2.041,.119),(.043,2.153,.117),(.107,2.231,.055),(.117,2.283,.033)],
    [(.029,1.904,.003),(.077,1.970,.005),(.056,2.047,-.103),(-.035,2.125,-.100),(-.108,2.208,-.038),(-.106,2.266,.021)],
]


def smooth_path(nodes, steps=12):
    result = []
    for i in range(len(nodes)-1):
        a, b = nodes[i], nodes[i+1]
        prev, nxt = nodes[max(0,i-1)], nodes[min(len(nodes)-1,i+2)]
        for j in range(steps):
            t = j/steps
            # Cubic Hermite gives continuous, organic tangent flow.
            result.append(tuple((2*t**3-3*t**2+1)*a[k]+(t**3-2*t**2+t)*.5*(b[k]-prev[k])+
                                (-2*t**3+3*t**2)*b[k]+(t**3-t**2)*.5*(nxt[k]-a[k]) for k in range(3)))
    result.append(nodes[-1])
    return result


for i, nodes in enumerate(ROOTS):
    pts = smooth_path(nodes)
    rs = [(.016 if i < 5 else .011)*(1-j/(len(pts)-1))**.77+.0013 for j in range(len(pts))]
    tube(pts, rs, "charred_root", 12, .18, i)
    if i in (0, 2, 4):
        p = pts[35]
        spur = [p, (p[0]-.018, p[1]+.025, p[2]+.013),
                (p[0]-.027, p[1]+.047, p[2]+.018)]
        tube(spur, [.008,.005,.001], "raised_bark", 8, .1, i)

# Secondary crossings grow from the six primary claws, forming S3's nested cage.
for i, nodes in enumerate((
    [ROOTS[0][3], (-.071,2.166,.099), (-.010,2.120,.117),
     (.063,2.077,.112), ROOTS[4][2]],
    [ROOTS[4][3], (.072,2.169,.097), (.017,2.119,.121),
     (-.061,2.070,.111), ROOTS[0][2]],
    [ROOTS[2][3], (-.072,2.074,-.105), (.001,2.043,-.110),
     (.073,2.018,-.075), ROOTS[3][1]],
)):
    pts = smooth_path(nodes, 11)
    tube(pts, [.008+.004*math.sin(math.pi*j/(len(pts)-1)) for j in range(len(pts))],
         "charred_root", 10, .17, 9+i)

# Three branching veins are actual raised geometry on the outer orb shell.
# They support the olive core glow without creating a uniform glowing ball.
for branch in range(3):
    pts = []
    for j in range(38):
        t = j/37
        lon = branch*2*math.pi/3+.35+1.45*t+.18*math.sin(7*t+branch)
        lat = .34+2.28*t
        pts.append((orb[0]+.0818*math.sin(lat)*math.cos(lon),
                    orb[1]+.0818*math.cos(lat),
                    orb[2]+.0778*math.sin(lat)*math.sin(lon)))
    tube(pts, [.0042*(1-j/37)+.0013 for j in range(38)], "orb_vein", 6, 0)
    for split in (.37, .62):
        p = pts[int(37*split)]
        twigs = [p]
        for step in range(1, 12):
            t = split+.15*step/11
            lon = branch*2*math.pi/3+.35+1.45*t+.18*math.sin(7*t+branch)+.42*step/11
            lat = .34+2.28*t
            twigs.append((orb[0]+.0818*math.sin(lat)*math.cos(lon),
                          orb[1]+.0818*math.cos(lat),
                          orb[2]+.0778*math.sin(lat)*math.sin(lon)))
        tube(twigs, [.0023*(1-j/11)+.0007 for j in range(12)], "orb_vein", 6, 0)

# Two restrained moss strings hang from the open rim; within the LOCK limit of 3.
for i, anchor in enumerate((ROOTS[0][3], ROOTS[4][3])):
    pts = [(anchor[0]-.003*i, anchor[1]-.018*j/12,
            anchor[2]+.004*math.sin(j*.5+i)) for j in range(13)]
    tube(pts, [.0028*(1-j/13)+.0003 for j in range(13)], "recess", 6, 0)


def save():
    OUT.mkdir(parents=True, exist_ok=True)
    mtl = OUT / "dark_druid_staff_v2.mtl"
    obj = OUT / "dark_druid_staff_v2.obj"
    mtl.write_bytes(("\n\n".join(f"newmtl {name}\nKa 0.08 0.08 0.08\n{props}\nillum 2" for name, props in MATERIALS.items())+"\n").encode("ascii"))
    with obj.open("w", encoding="ascii", newline="\n") as f:
        f.write("# EXODUSER S3 staff retouch; Y-up metres\nmtllib dark_druid_staff_v2.mtl\n")
        for v in V: f.write("v %.6f %.6f %.6f\n" % v)
        for uv in UV: f.write("vt %.6f %.6f\n" % uv)
        last = None
        for tri, mat in zip(F, M):
            if mat != last:
                f.write("usemtl "+mat+"\n")
                last = mat
            f.write("f "+" ".join(f"{i}/{i}" for i in tri)+"\n")
    print(f"{obj}: vertices={len(V)} triangles={len(F)} materials={len(set(M))} y={min(v[1] for v in V):.3f}..{max(v[1] for v in V):.3f}")


if __name__ == "__main__":
    save()
