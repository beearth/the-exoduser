"""Preserve the observed completed male concept; submits no generation."""
import hashlib,io,json,shutil,urllib.request
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent
p=root/'generation-receipt.json';r=json.loads(p.read_text(encoding='utf8'))
if r.get('status')!='completed' or not r.get('result_url'):raise RuntimeError('Observed completed result required')
target=root/'hellgunner_male_refined.png'
if not target.exists():
    with urllib.request.urlopen(r['result_url'],timeout=120) as response:data=response.read()
    with Image.open(io.BytesIO(data)) as im:im.verify()
    target.write_bytes(data)
with Image.open(target) as im:im.load();size=list(im.size);fmt=im.format
r.update(file=target.name,sha256=hashlib.sha256(target.read_bytes()).hexdigest(),size=size,format=fmt)
p.write_text(json.dumps(r,ensure_ascii=False,indent=2),encoding='utf8')
desktop=Path('C:/Users/심도진/Desktop/엑소듀서_검토/헬거너_남성정제안_20261021');desktop.mkdir(parents=True,exist_ok=True)
dst=desktop/target.name
if dst.exists() and dst.read_bytes()!=target.read_bytes():raise FileExistsError(dst)
shutil.copy2(target,dst)
print(json.dumps({'file':str(target),'size':size,'sha256':r['sha256']},ensure_ascii=False))
