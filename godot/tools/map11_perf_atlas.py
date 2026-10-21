"""Lossless packing of the 16 existing MAP11 contact masks; no generated artwork.
Run from repository root with Pillow. Each original RGBA pixel remains identical.
"""
from pathlib import Path
import hashlib,json,re
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'scripts/maps/map11/ground_contact_masks.gd'
DEST=ROOT/'assets/map/map11/contact_masks/atlas'

def main():
    rows=re.findall(r'"(res://[^\"]+)": \{"texture":preload\("(res://[^\"]+\.png)"\)',SOURCE.read_text())
    if len(rows)!=16:
        rows=[(r['source_key'],r['source']) for r in json.loads((DEST/'manifest.json').read_text())['entries']]
    if len(rows)!=16:raise ValueError('Expected the original 16 contact mask entries')
    DEST.mkdir(parents=True,exist_ok=True)
    atlas=Image.new('RGBA',(2048,1024),(0,0,0,0));manifest=[]
    for i,(key,path) in enumerate(rows):
        src=ROOT/path.removeprefix('res://');im=Image.open(src).convert('RGBA')
        if im.width>512 or im.height>256:raise ValueError('Grid cell exceeded')
        x=(i%4)*512;y=(i//4)*256
        atlas.paste(im,(x,y))
        if atlas.crop((x,y,x+im.width,y+im.height)).tobytes()!=im.tobytes():raise AssertionError(path)
        name=src.stem
        tres=f'''[gd_resource type="AtlasTexture" load_steps=2 format=3]

[ext_resource type="Texture2D" path="res://assets/map/map11/contact_masks/atlas/contact_atlas.png" id="1"]

[resource]
atlas = ExtResource("1")
region = Rect2({x}, {y}, {im.width}, {im.height})
filter_clip = true
'''
        (DEST/(name+'.tres')).write_text(tres)
        manifest.append({'source':path,'source_key':key,'region':[x,y,im.width,im.height],'source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'pixels_identical':True})
    atlas.save(DEST/'contact_atlas.png')
    (DEST/'manifest.json').write_text(json.dumps({'size':[2048,1024],'grid_cell':[512,256],'pixel_changes':0,'atlas_sha256':hashlib.sha256((DEST/'contact_atlas.png').read_bytes()).hexdigest(),'entries':manifest},ensure_ascii=False,indent=2)+'\n')
    code='extends RefCounted\n## Setup-only lossless atlas of existing contact masks. Original dimensions retained.\nconst TEXTURES={\n'
    code+=''.join(' "'+row['source_key']+'":preload("res://assets/map/map11/contact_masks/atlas/'+Path(row['source']).stem+'.tres"),\n' for row in manifest)+'}\n'
    (ROOT/'scripts/maps/map11/ground_contact_atlas.gd').write_text(code)
if __name__=='__main__':main()
