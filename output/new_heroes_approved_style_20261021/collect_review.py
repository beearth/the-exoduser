"""Download recorded completed candidates and assemble a review sheet; no generation."""
import hashlib, io, json, shutil, urllib.request
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT=Path(__file__).resolve().parent
REPO=ROOT.parent.parent
NAMES={'A01':'창법사 · 원형 룬 창','A02':'변성술사 · 흑청 코어','A03':'헬거너 · 흑철 혈월',
       'B01':'창법사 · 먹보라 수정','B02':'변성술사 · 흑청 수정','B03':'헬거너 · 단일 총열 수정',
       'C02':'변성술사 · 남청 순례자','C03':'헬거너 · 흑철 방랑사수'}
receipt=json.loads((ROOT/'generation-receipt.json').read_text(encoding='utf8'))
if (ROOT/'edit-generation-receipt.json').exists():
    receipt['jobs']+=json.loads((ROOT/'edit-generation-receipt.json').read_text(encoding='utf8'))['jobs']
if (ROOT/'clean-generation-receipt.json').exists():
    receipt['jobs']+=json.loads((ROOT/'clean-generation-receipt.json').read_text(encoding='utf8'))['jobs']
items=[]
for job in receipt['jobs']:
    if job['status']!='completed': continue
    cid=job['concept_id']; path=ROOT/(cid+'.png')
    if not path.exists():
        url=job.get('results',{}).get('rawUrl') or job.get('result_url')
        with urllib.request.urlopen(url,timeout=120) as r: data=r.read()
        with Image.open(io.BytesIO(data)) as im: im.verify()
        path.write_bytes(data)
    with Image.open(path) as im: im.load(); size=list(im.size)
    items.append({'id':cid,'name':NAMES[cid],'file':path.name,'size':size,
                  'job_id':job['id'],'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})

font=ImageFont.truetype('C:/Windows/Fonts/malgun.ttf',30)
small=ImageFont.truetype('C:/Windows/Fonts/malgun.ttf',24)
def place(canvas,path,box):
    x,y,w,h=box
    with Image.open(path) as im:
        view=ImageOps.contain(im.convert('RGBA'),(w,h))
        canvas.paste(view,(x+(w-view.width)//2,y+(h-view.height)//2),view)

if items:
    current=[it for it in items if it['id'].startswith('B')]
    if len(current)!=3: current=[it for it in items if it['id'].startswith('A')]
    latest=[next((it for it in items if it['id']==cid),None) for cid in ['B01','C02','C03']]
    if all(latest): current=latest
    out=Image.new('RGB',(2400,1280),'#121820');d=ImageDraw.Draw(out)
    d.text((28,18),'EXODUSER · 승인 작화와 신규 콘셉트 탐색',font=font,fill='#e5e7e9')
    d.text((28,65),'위: 승인 전사·실버테일 / 아래: 최신 실험 · 구조 오류 포함 · 채택/게임 적용 전',font=small,fill='#a8b8c9')
    place(out,REPO/'assets/charselect/warrior_cut.png',(370,110,750,360))
    place(out,REPO/'assets/charselect/silvertail_cut.png',(1240,110,750,360))
    d.text((650,480),'승인 전사',font=small,fill='#bbc5cd')
    d.text((1520,480),'승인 실버테일',font=small,fill='#bbc5cd')
    for n,it in enumerate(current):
        x=n*800
        place(out,ROOT/it['file'],(x+10,550,780,620))
        d.text((x+30,1200),it['id']+' · '+it['name'],font=font,fill='#e5e7e9')
        verdict={'B01':'색감 개선 · 포즈 변경 · 검토 후보','C02':'미채택: 팔 3개 / 코어 중복','C03':'미채택: 권총과 라이플이 분리됨'}.get(it['id'],'최초 실험 · 수정/미채택 이력')
        d.text((x+30,1245),verdict,font=small,fill='#c6ac8c')
    out.save(ROOT/'approved_lineup_review.jpg',quality=95,subsampling=0)
    if len(items)>=6:
        comparison=Image.new('RGB',(2400,1380),'#121820');d2=ImageDraw.Draw(comparison)
        d2.text((25,16),'위: 최초 후보 A / 아래: 무료 부분 수정 B · 최종 채택 전',font=font,fill='#e5e7e9')
        for n,it in enumerate(items[:6]):
            x=(n%3)*800;y=(n//3)*650+60
            place(comparison,ROOT/it['file'],(x+10,y,780,580))
            d2.text((x+28,y+590),it['id']+' · '+it['name'],font=small,fill='#e5e7e9')
        comparison.save(ROOT/'before_after_review.jpg',quality=95,subsampling=0)

(ROOT/'download-receipt.json').write_text(json.dumps(items,ensure_ascii=False,indent=2),encoding='utf8')
desktop=Path('C:/Users/심도진/Desktop/엑소듀서_검토/신캐릭터_승인작화비교_20261021')
if items:
    desktop.mkdir(parents=True,exist_ok=True)
    for it in items:
        src=ROOT/it['file'];dst=desktop/src.name
        if dst.exists() and dst.read_bytes()!=src.read_bytes(): raise FileExistsError(dst)
        shutil.copy2(src,dst)
    shutil.copy2(ROOT/'approved_lineup_review.jpg',desktop/'approved_lineup_review.jpg')
    if (ROOT/'before_after_review.jpg').exists():
        shutil.copy2(ROOT/'before_after_review.jpg',desktop/'before_after_review.jpg')
    (desktop/'후보번호.txt').write_text('\n'.join(x['id']+' '+x['name'] for x in items),encoding='utf8')
print(json.dumps({'downloaded':len(items),'items':items},ensure_ascii=False))
