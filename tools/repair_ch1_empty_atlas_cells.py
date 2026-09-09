"""Restore empty runtime atlas cells from existing directional source sprites."""
import json
import shutil
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]

def atlas_path(direction):
    return ROOT / 'img' / f"atlas_ch1_8dir_{direction.replace('-', '_')}.png"

def scan():
    meta = json.loads((ROOT/'img/atlas_ch1_8dir.json').read_text())
    missing = []
    for direction in meta['directions']:
        path = atlas_path(direction)
        with Image.open(path).convert('RGBA') as atlas:
            for name, cell in meta['mobs'].items():
                x, y = cell['col']*meta['cell'], cell['row']*meta['cell']
                if not atlas.crop((x,y,x+meta['cell'],y+meta['cell'])).getchannel('A').getbbox():
                    missing.append((direction,name,x,y))
    return missing

def repair():
    backup=ROOT/'tmp/trailer_v22_before'
    backup.mkdir(parents=True,exist_ok=True)
    for direction,name,x,y in scan():
        path=atlas_path(direction)
        dest=backup/path.name
        if not dest.exists():shutil.copy2(path,dest)
        atlas=Image.open(path).convert('RGBA')
        source=Image.open(ROOT/f'img/ch1_8dir/{name}/{direction}.png').convert('RGBA')
        if not source.getchannel('A').getbbox():raise ValueError(f'Empty source {name}/{direction}')
        if max(source.size)>256:raise ValueError('Unexpected source size')
        atlas.paste(source,(x+(256-source.width)//2,y+(256-source.height)//2))
        atlas.save(path)
        print(f'Restored {name}/{direction} from existing source')
    assert not scan(),scan()

if __name__=='__main__':repair()
