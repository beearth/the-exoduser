"""Build isolated legacy composites or navigation for a generated Hell Rift image.

No game.html, production template, NPC roster, save, or asset source is modified.
Python dependency: bundled Pillow + numpy. Output is a master image + template
contract, not an engine-integrated town. No random prop scatter is used.
"""
from pathlib import Path
import hashlib
import json
import math

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets/map/hell_rift/candidate_20261005"
SIZE = 2048
TILES = 200
S = SIZE / TILES
SOURCES = {
    "soil": "assets/map/ch1/ground_dark_soil.png",
    "nest_soil": "assets/map/ch2/ground.png",
    "ridge": "assets/map/ch2/mega/wall_ridge_l.png",
    "cliff": "assets/map/ch2/mega/slime_cliff.png",
    "depth": "assets/map/ch2/mega/wall_skin_depth_arch.png",
    "camp": "assets/map/ch1/collision/prop_camp.png",
    "arch": "assets/map/ch1/collision/mega_chapel.png",
    "bones": "assets/map/ch1/collision/mega_ribs.png",
    "well": "assets/map/ch1/collision/prop_well.png",
    "brazier": "assets/map/ch4/collision/prop_brazier.png",
    "exit": "assets/map/ch2/mega/exit_organic_frame.png",
}
IMAGES = {key: Image.open(ROOT / p).convert("RGBA") for key, p in SOURCES.items()}


def region(name, role, anchor, shape, density, direction, landmark, ground, transition):
    return {"name": name, "role": role, "anchor": anchor, "shape": shape,
            "density": density, "mainDirection": direction, "landmark": landmark,
            "groundIdentity": ground, "transition": transition,
            "combatFunction": "휴식 후보 / 적 스폰 없음"}


def rift_polygon(kind):
    points=[(87,68),(95,72),(104,69),(111,77),(108,83),(116,92),
            (105,100),(98,97),(89,104),(82,95),(85,88),(77,82),(86,76)]
    if kind=="stage":
        points=[(96+(x-97)*.65,93+(y-85)*.65) for x,y in points]
    return points


def mask_for(kind):
    """MASTER geometry: joined, asymmetric open lobes, not scatter or corridors."""
    m = Image.new("L", (SIZE, SIZE), 0)
    d = ImageDraw.Draw(m)
    lobes = ([(100, 174, 22, 23), (81, 146, 37, 25), (81, 113, 42, 31),
              (132, 109, 41, 31), (133, 82, 33, 27), (98, 62, 35, 25),
              (100, 29, 20, 26)] if kind == "chapter" else
             [(100, 178, 20, 20), (91, 148, 28, 28), (80, 116, 32, 28),
              (113, 99, 31, 29), (101, 67, 25, 29), (100, 29, 19, 26)])
    for index,(x, y, rx, ry) in enumerate(lobes):
        points=[]
        for n in range(120):
            angle=math.tau*n/120
            k=1+.07*math.sin(angle*3+index*.7)+.045*math.sin(angle*7+index*1.1)
            points.append(((x+rx*math.cos(angle)*k)*S,(y+ry*math.sin(angle)*k)*S))
        d.polygon(points,fill=255)
    # The void changes route choice and foreground, not just decoration.
    d.polygon([(x*S,y*S) for x,y in rift_polygon(kind)],fill=0)
    return m.filter(ImageFilter.GaussianBlur(2))


def texture(key, darkness=1, saturation=1):
    im = IMAGES[key].convert("RGB")
    # Two large scales, shared world alignment. Avoid visible small tile repetition.
    im = ImageEnhance.Color(im).enhance(saturation)
    im = ImageEnhance.Brightness(im).enhance(darkness)
    b = Image.new("RGB", (SIZE, SIZE))
    tile = im.resize((768, 768), Image.Resampling.LANCZOS)
    for y in range(-192, SIZE, 768):
        for x in range(-192, SIZE, 768):
            b.paste(tile, (x, y))
    wash = im.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    return Image.blend(b, wash, .48).convert("RGBA")


def place(layer, key, x, y, width, angle=0, brightness=1, crop=None):
    im = IMAGES[key].copy()
    if crop:
        im = im.crop(tuple(int(v) for v in crop))
    im = ImageEnhance.Color(im).enhance(.63)
    im = ImageEnhance.Brightness(im).enhance(brightness)
    w = max(1, int(width*S)); h = max(1, round(im.height*w/im.width))
    im = im.resize((w, h), Image.Resampling.LANCZOS)
    if angle:
        im = im.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    layer.alpha_composite(im, (int(x*S-im.width/2), int(y*S-im.height*.75)))


def glow(layer, x, y, radius, color, alpha):
    g = Image.new("RGBA", layer.size)
    d = ImageDraw.Draw(g)
    for n in range(24, 0, -1):
        r = radius*S*n/24
        d.ellipse((x*S-r,y*S-r,x*S+r,y*S+r), fill=(*color, max(1,int(alpha*(1-n/25)**2))))
    layer.alpha_composite(g.filter(ImageFilter.GaussianBlur(radius*S*.16)))


def build(kind):
    m = mask_for(kind)
    # GATE 2: BACK, large MID, front shoulder. Entire outer plane is composed.
    base = texture("nest_soil", .44, .35)
    base.alpha_composite(Image.new("RGBA", base.size, (12,17,24,125)))
    outer = Image.new("RGBA", base.size)
    if kind == "chapter":
        masses = [("depth",23,51,91,20,(0,0,1254,1050)),
                  ("ridge",30,104,67,-24,(0,180,1000,1254)),
                  ("cliff",39,160,78,11,(150,0,1350,1000)),
                  ("ridge",175,70,82,13,(50,0,1254,1050)),
                  ("depth",183,133,83,-31,(100,120,1254,1254)),
                  ("cliff",151,178,77,-28,(0,0,1250,950)),
                  ("depth",67,8,96,-15,(0,0,1254,1000)),
                  ("ridge",141,15,73,35,(100,0,1200,1150))]
    else:
        masses = [("depth",32,58,86,12,(0,0,1100,1100)),
                  ("ridge",42,125,70,-21,(50,100,1100,1254)),
                  ("cliff",56,173,71,6,(120,0,1350,1000)),
                  ("ridge",161,66,89,-13,(0,50,1254,1150)),
                  ("depth",165,133,89,-28,(100,0,1254,1150)),
                  ("cliff",149,176,84,-12,(0,0,1200,950)),
                  ("depth",71,13,89,-16,(0,0,1254,1050)),
                  ("ridge",142,12,85,28,(0,0,1200,1050))]
    for key,x,y,w,a,crop in masses:
        place(outer,key,x,y,w,a,.73,crop)
    # MASS joins are absorbed by the base depth material and floor shoulder.
    base.alpha_composite(outer)
    # GATE 3/4: unified warm soil, soft AO shoulder, shared world coordinates.
    expanded = m.filter(ImageFilter.MaxFilter(65)).filter(ImageFilter.GaussianBlur(30))
    shoulder = texture("soil", .82, .5)
    shoulder.putalpha(expanded)
    base.alpha_composite(shoulder)
    shadow = Image.new("RGBA", base.size, (0,0,0,0))
    shadow.putalpha(ImageChops.subtract(expanded,m).point(lambda v:int(v*.64)))
    base.alpha_composite(shadow)
    ground = texture("soil", 1.18, .42)
    ground.putalpha(m)
    base.alpha_composite(ground)
    # Continuous mineral fractures, authored curves, texture only.
    fractures = Image.new("RGBA",base.size); fd=ImageDraw.Draw(fractures)
    for pts in [[(59,139),(77,129),(78,116),(89,104)],[(145,144),(140,126),(151,115)],
                [(73,62),(76,50),(89,39)],[(102,164),(96,149),(101,136)]]:
        fd.line([(x*S,y*S) for x,y in pts],fill=(11,12,13,140),width=3)
    fractures.putalpha(ImageChops.multiply(fractures.getchannel("A"),m))
    base.alpha_composite(fractures)
    # GATE 5/6: primary rift, paired choice paths, isolated playable margins.
    x,y=(97,85) if kind=="chapter" else (96,93)
    points=rift_polygon(kind)
    vd=ImageDraw.Draw(base)
    for n in range(30,0,-1):
        k=n/30
        vd.polygon([((x+(px-x)*k)*S,(y+(py-y)*k)*S) for px,py in points],
                   fill=(5+int(k*12),9+int(k*15),13+int(k*19),255))
    # Chasm is genuine non-walkable space with a lowered, shaded lip.
    void_mask=Image.new('L',base.size);ImageDraw.Draw(void_mask).polygon([(px*S,py*S) for px,py in points],fill=255)
    rim=ImageChops.subtract(void_mask.filter(ImageFilter.MaxFilter(23)),void_mask)
    rim_layer=texture("soil",.58,.28)
    rim_layer.putalpha(rim.filter(ImageFilter.GaussianBlur(5)).point(lambda v:int(v*.74)))
    base.alpha_composite(rim_layer)
    glow(base,x,y,18,(47,101,124),11)
    # GATE 6: hand authored landmarks, footprints included in template contract.
    props=[("exit",100,23,34,0), ("arch",69,113,25,-4),
           ("camp",65,145,36,0), ("brazier",108,129,12,0)]
    if kind=="chapter":
        props += [("camp",149,128,33,-5), ("well",146,78,16,0),
                  ("bones",62,67,32,-18)]
    else:
        props=[("exit",100,23,29,0),("camp",74,131,34,0),
               ("brazier",108,130,12,0)]
    for key,x,y,w,a in props:
        contact=Image.new("RGBA",base.size)
        cd=ImageDraw.Draw(contact);cd.ellipse(((x-w*.45)*S,(y-2)*S,(x+w*.45)*S,(y+5)*S),fill=(0,0,0,150))
        base.alpha_composite(contact.filter(ImageFilter.GaussianBlur(6)))
        place(base,key,x,y,w,a,1.08)
    glow(base,108,125,22,(228,109,47),38)
    glow(base,100,20,22,(120,154,159),22)
    # SOUTH and NORTH route framing; avoid full vertical repeat silhouettes.
    for key,x,y,w,a,c in [("cliff",78,190,43,9,(300,180,1200,980)),
                         ("ridge",129,197,40,-8,(200,400,1150,1200))]:
        layer=Image.new("RGBA",base.size);place(layer,key,x,y,w,a,.8,c);base.alpha_composite(layer)
    # Small story detail is restricted to authored camp pockets, no scatter.
    fd=ImageDraw.Draw(base)
    for sx,sy in [(58,151),(144,133)] if kind=="chapter" else [(69,137)]:
        # Ground marks only; no invented character art or triangle stand-ins.
        fd.line([((sx-1)*S,sy*S),((sx+1)*S,(sy+.4)*S)],fill=(120,99,75,100),width=2)
    # Tone scene after assembly; keep the walking surface quieter than its rim.
    arr=np.array(base.convert("RGB")).astype(float)
    yy,xx=np.mgrid[0:SIZE,0:SIZE]
    dist=((xx-SIZE*.5)/(SIZE*.8))**2+((yy-SIZE*.52)/(SIZE*.8))**2
    arr*=np.clip(1-dist*.38,.6,1)[...,None]
    image=Image.fromarray(np.uint8(np.clip(arr,0,255)))
    image.save(OUT/f"{kind}-master.png",optimize=True)
    # Tile mask includes stable, explicit footprints for large interactable props.
    grid=np.array(m.resize((TILES,TILES),Image.Resampling.NEAREST))>127
    footprints=([(108,128,3.1,2),(65,142,8,4),(149,125,7,3.8),(69,110,4,2.2),(146,76,2.8,2)]
                if kind=="chapter" else [(108,128,3.1,2),(74,128,8,4)])
    for cx,cy,rx,ry in footprints:
        for ty in range(TILES):
            for tx in range(TILES):
                if ((tx+.5-cx)/rx)**2+((ty+.5-cy)/ry)**2<1:grid[ty,tx]=False
    tiles=grid.astype(int).ravel().tolist();rle=[]
    for tile in tiles:
        if rle and rle[-2]==tile:rle[-1]+=1
        else:rle.extend([tile,1])
    regions=(
        [region("남쪽 진입", "하층 도착", [100,177], "압축 진입", "낮음", "북서", "하층의 턱", "마른 흙", "입장→야영"),
         region("멈춘 자의 야영지", "대화·양도 후보", [59,150], "서쪽 주머니", "높음", "북동", "야영 천막", "밟힌 흙", "도착→광장"),
         region("잔불 광장", "정비·휴식", [104,140], "넓은 비대칭 여백", "낮음", "북", "잔불 화로", "회갈색 흙", "야영→갈림"),
         region("골문 아래 쉼터", "주민·정비 후보", [61,119], "서측 테라스", "중간", "북동", "낡은 골문", "재 섞인 흙", "광장→서측 우회"),
         region("부탁을 맡기는 자리", "구출 부탁 후보", [144,133], "동측 포켓", "중간", "북서", "준비 중인 야영지", "짙은 흙", "광장→동측 우회"),
         region("깊은 틈", "주요 랜드마크·비보행", [97,85], "비대칭 균열", "비보행", "양측 우회", "심연", "깊은 푸른 그림자", "남측 갈림→북측 합류"),
         region("상승 준비의 턱", "다음 목적 확인", [104,49], "합류와 상승", "낮음", "북", "상층의 문", "차가운 회갈색", "우회→출발"),
         region("북쪽 상승문", "다음 지역 출발 후보", [100,16], "압축 출구", "중간", "북", "갑각 문틀", "상층 오염", "틈→다음 지역")]
        if kind=="chapter" else
        [region("남쪽 진입","이전 스테이지 도착",[100,179],"압축 진입","낮음","북서","하층의 턱","마른 흙","입장→쉼터"),
         region("작은 야영지","잠시 정비",[68,137],"서측 주머니","중간","북동","천막","밟힌 흙","도착→잔불"),
         region("잔불","휴식 후보",[107,142],"열린 여백","낮음","북","화로","회갈색 흙","야영→갈림"),
         region("작은 틈","비보행 랜드마크",[96,93],"작은 심연","비보행","양측 우회","균열","깊은 그림자","갈림→합류"),
         region("출발 준비","다음 스테이지 목적",[100,55],"열린 합류","낮음","북","상층의 턱","차가운 흙","합류→문"),
         region("북쪽 문","다음 스테이지 출발 후보",[100,16],"압축 출구","중간","북","갑각 문틀","상층 오염","틈→다음 스테이지")])
    pois=([{"id":"gift","name":"물건을 맡기는 망자","x":59,"y":150},
           {"id":"request","name":"구출을 부탁하는 망자","x":144,"y":133},
           {"id":"rest","name":"잔불 — 기능 미연결","x":104,"y":140},
           {"id":"prepare","name":"정비 자리 — 기능 미연결","x":61,"y":119},
           {"id":"exit","name":"상승문 — 전환 미연결","x":100,"y":16}]
          if kind=="chapter" else
          [{"id":"rest","name":"잔불 — 기능 미연결","x":107,"y":142},
           {"id":"prepare","name":"작은 야영지","x":68,"y":137},
           {"id":"exit","name":"상승문 — 전환 미연결","x":100,"y":16}])
    return {"id":f"hell-rift-{kind}-v1","variant":kind,"name":"지옥의 틈",
            "status":"ISOLATED_CANDIDATE_NOT_ADOPTED","w":TILES,"h":TILES,"T":40,
            "worldSize":[8000,8000],"masterSize":[SIZE,SIZE],"tileRLE":rle,
            "start":{"x":100,"y":179},"exit":{"x":100,"y":16},
            "regions":regions,"pois":pois,"footprints":footprints,
            "spawns":[],"hazards":[],"saveEnabled":False,
            "image":f"{kind}-master.png",
            "navSha256":hashlib.sha256(bytes(tiles)).hexdigest()}


def build_interspace():
    """Author conservative screen-projected paths; never alter the generated bitmap."""
    out = ROOT / "assets/map/hell_rift/interspace_20261005"
    image = out / "hell-rift-painterly-v2.png"
    expected = "a3d95a005924692626321cedf384d1e4e90282ba990d9e19e86a3aa73a1563d4"
    assert hashlib.sha256(image.read_bytes()).hexdigest() == expected
    # MASTER: bottom entry, two unequal ledges, reunited stair at the north.
    left = [(100,193,9),(100,178,8),(77,169,7),(63,162,5),
            (56,151,5),(47,141,5),(38,130,5),(38,121,6),
            (43,113,5),(38,104,4),(39,95,5),(47,86,5),
            (49,78,4),(58,72,4),(69,67,4),(80,62,4),
            (91,59,4),(100,54,3),(100,43,2)]
    right = [(100,193,9),(100,178,8),(123,162,6),(134,149,5),
             (132,135,5),(139,125,5),(146,116,5),(146,109,5),
             (152,102,5),(159,94,4),(153,85,5),(145,80,5),
             (146,73,4),(137,70,4),(129,64,4),(120,61,4),
             (111,58,3),(100,54,3),(100,43,2)]
    yy, xx = np.mgrid[0:TILES,0:TILES];xx=xx+.5;yy=yy+.5
    grid=np.zeros((TILES,TILES),dtype=bool)
    for route in [left,right]:
        for (ax,ay,ar),(bx,by,br) in zip(route,route[1:]):
            dx,dy=bx-ax,by-ay
            t=np.clip(((xx-ax)*dx+(yy-ay)*dy)/(dx*dx+dy*dy),0,1)
            radius=ar+(br-ar)*t
            grid |= (xx-(ax+dx*t))**2+(yy-(ay+dy*t))**2 < radius**2
    tiles=grid.astype(int).ravel().tolist();rle=[]
    for tile in tiles:
        if rle and rle[-2]==tile:rle[-1]+=1
        else:rle.extend([tile,1])
    pois=[{"id":"gift","name":"멈춘 망자의 자리","x":39,"y":122},
          {"id":"request","name":"위층을 바라보는 망자","x":145,"y":116},
          {"id":"rest","name":"남쪽 잔불","x":79,"y":170},
          {"id":"prepare","name":"상승 전 머무는 턱","x":137,"y":70},
          {"id":"exit","name":"북쪽 상승로 — 전환 미연결","x":100,"y":43}]
    regions=[region("하층의 입구","도착",[100,193],"넓은 진입", "낮음","북서·북동","갈라지는 턱","빛이 닿는 흙·돌","입구→양측"),
             region("멈춘 망자의 턱","양도 이야기 후보",[39,122],"서측 굴곡", "중간","북","잔불과 머무는 망자","갈라진 돌","서측→북쪽"),
             region("부탁을 품은 턱","구출 이야기 후보",[145,116],"동측 생체 돌출", "중간","북서","몸을 낮춘 망자","생체·돌","동측→북쪽"),
             region("깊은 균열","비보행 주요 랜드마크",[102,102],"세로 심연", "비보행","양측 우회","심연의 빛","청회색 안개","두 길 사이"),
             region("상승 준비","다음 목적",[137,70],"유기적 돌턱", "낮음","북서","상층을 보는 자리","갑각·돌","동측→합류"),
             region("북쪽 상승로","출발 후보",[100,43],"두 길 합류·계단", "낮음","북","밝은 균열 너머 계단","회갈색 돌","틈→다음 구간")]
    variant={"id":"hell-rift-interspace-v2","variant":"interspace","name":"지옥의 틈",
             "status":"ISOLATED_CANDIDATE_NOT_ADOPTED","w":200,"h":200,"T":40,
             "worldSize":[8000,8000],"masterSize":[1920,1920],"tileRLE":rle,
             "start":{"x":100,"y":193},"exit":{"x":100,"y":43},
             "pois":pois,"regions":regions,"footprints":[],"spawns":[],"hazards":[],
             "saveEnabled":False,"image":"hell-rift-painterly-v2.png",
             "assetRoot":"../assets/map/hell_rift/interspace_20261005/",
             "projection":"screen-projected conservative route; no height simulation",
             "navSha256":hashlib.sha256(bytes(tiles)).hexdigest()}
    manifest={"name":"지옥의 틈","version":2,"productionIntegrated":False,"variants":{"interspace":variant},
              "cameraAnchors":[[100,193],[79,170],[39,122],[47,86],[145,116],[102,102],[137,70],[100,43]],
              "source":{"provider":"MagicLight Toolbox","model":"Seedream 5.0 Pro","taskId":"7512746338260033536",
                        "path":str(image.relative_to(ROOT)),"sha256":expected,"originalUnedited":True,
                        "route":"authenticated Toolbox UI; no direct API call"}}
    (out/"layout.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n")
    (out/"layout.js").write_text("window.HELL_RIFT_INTERSPACE = "+json.dumps(manifest,ensure_ascii=False)+";\n")
    print(json.dumps({"walkable":sum(tiles),"navSha256":variant["navSha256"],"originalUnedited":True}))


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    templates={kind:build(kind) for kind in ["chapter","stage"]}
    manifest={"name":"지옥의 틈","version":1,
              "scope":"장 사이와 스테이지 사이의 반복 거점 후보",
              "productionIntegrated":False,"variants":templates,
              "sources":{k:{"path":p,"sha256":hashlib.sha256((ROOT/p).read_bytes()).hexdigest()}
                         for k,p in SOURCES.items()},
              "cameraAnchors":[[100,177],[65,145],[104,140],[61,119],
                               [144,133],[97,85],[104,49],[100,16]]}
    (OUT/"layout.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n")
    (OUT/"layout.js").write_text("window.HELL_RIFT_LAYOUT = "+json.dumps(manifest,ensure_ascii=False)+";\n")
    print(json.dumps({"output":str(OUT.relative_to(ROOT)),"variants":2,
                      "productionIntegrated":False},ensure_ascii=False))


if __name__=="__main__":
    import sys
    if "--interspace" in sys.argv:build_interspace()
    else:main()
