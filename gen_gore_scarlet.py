"""선홍색 고어 에셋 10종 생성 — OpenAI gpt-image-1"""
import os, base64, time

for line in open(os.path.join(os.path.dirname(__file__), '.env'), 'r', encoding='utf-8'):
    if 'OPENAI' in line:
        k, v = line.strip().split('=', 1)
        os.environ[k.strip()] = v.strip()

from openai import OpenAI
client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])
OUT = os.path.join(os.path.dirname(__file__), 'assets', 'gore')
os.makedirs(OUT, exist_ok=True)

S = "pixel art 16-bit game asset sprite on pure transparent background, dark fantasy style, vivid scarlet crimson red color (#ff2233), no bones no skeleton, "

ITEMS = [
    ("scarlet_chunk_1.png", S + "single isolated torn raw meat chunk, bright scarlet red flesh with pink fat edges, irregular blob shape, wet glossy surface"),
    ("scarlet_chunk_2.png", S + "single isolated shredded muscle tissue, vivid crimson red strips of torn flesh, ragged fibrous texture"),
    ("scarlet_chunk_3.png", S + "single isolated large bloody flesh lump, bright red meat mass with darker center, round organic shape"),
    ("scarlet_chunk_4.png", S + "single isolated thin flesh strip, scarlet red torn skin flap with raw pink underside, elongated shape"),
    ("scarlet_chunk_5.png", S + "single isolated crushed organ piece, vivid red-pink damaged tissue, flat splattered shape with liquid edges"),
    ("scarlet_splat_1.png", S + "single isolated blood splatter, bright scarlet red paint-like splash, radial spray pattern with droplets"),
    ("scarlet_splat_2.png", S + "single isolated thick blood pool, dark crimson red puddle with bright scarlet edges, irregular oval shape"),
    ("scarlet_guts_1.png", S + "single isolated coiled intestine segment, vivid scarlet red tube, short curled rope shape, wet shiny surface"),
    ("scarlet_guts_2.png", S + "single isolated torn stomach organ, bright red deflated sac shape, leaking dark fluid, RPG game sprite"),
    ("scarlet_heart.png", S + "single isolated beating heart organ, vivid scarlet red with dark veins, anatomical shape, dripping blood drops"),
]

print(f"[SCARLET-GORE] {len(ITEMS)}개 생성 시작\n")
ok = fail = 0
for i, (fname, prompt) in enumerate(ITEMS):
    fpath = os.path.join(OUT, fname)
    if os.path.exists(fpath):
        print(f"[{i+1}/{len(ITEMS)}] {fname} 이미 존재 — 스킵")
        ok += 1; continue
    print(f"[{i+1}/{len(ITEMS)}] {fname} 생성 중...")
    try:
        resp = client.images.generate(model='gpt-image-1', prompt=prompt, n=1, size='1024x1024', quality='medium')
        d = resp.data[0]
        if hasattr(d, 'b64_json') and d.b64_json:
            img = base64.b64decode(d.b64_json)
        elif hasattr(d, 'url') and d.url:
            import urllib.request; img = urllib.request.urlopen(d.url).read()
        else:
            print(f"  ❌ 알 수 없는 형식"); fail += 1; continue
        with open(fpath, 'wb') as f: f.write(img)
        print(f"  ✅ {len(img):,} bytes"); ok += 1
    except Exception as e:
        print(f"  ❌ {e}"); fail += 1
    if i < len(ITEMS) - 1: time.sleep(1.5)

print(f"\n[SCARLET-GORE] 완료: {ok} 성공, {fail} 실패")
