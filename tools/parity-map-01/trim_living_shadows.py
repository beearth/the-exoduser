"""After export_living.cjs: lossless transparent-border trim, preserving world pixels."""
from pathlib import Path
import json
from PIL import Image
root=Path('godot/assets/map/web_parity/living')
p=root/'source.json'
data=json.loads(p.read_text())
rows=[]
for row in data['shadows']:
    path=root/row['name']
    image=Image.open(path)
    box=image.getchannel('A').getbbox()
    if box:
        image.crop(box).save(path)
        row['x']+=box[0]
        row['y']+=box[1]
        rows.append(row)
    else:
        path.unlink()
data['shadows']=rows
data['source']='ch1-living-detail.js:4-15,312-367,406-528; game.html:51930-51931,52480'
p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
