"""고어 스프라이트 에셋 생성 — OpenAI Image API"""
import os, sys, base64, time

# .env에서 키 로드
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    for line in open(env_path, 'r', encoding='utf-8'):
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            os.environ[k.strip()] = v.strip()

from openai import OpenAI
client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))

OUT_DIR = os.path.join(os.path.dirname(__file__), 'assets', 'gore')
os.makedirs(OUT_DIR, exist_ok=True)

PROMPTS = [
    ("spine.png",
     "pixel art game asset, single isolated human spine bone chain on pure transparent background, side view, vertical long bone with 6 vertebrae segments, dark fantasy Berserk manga style, stained ivory white, bloody red drips, gritty dark shading, no background"),
    ("intestine_1.png",
     "pixel art game asset, single isolated coiled intestine on pure transparent background, dark red flesh with pink highlights, winding tube shape, dark fantasy Berserk style, wet glossy texture, no background"),
    ("flesh_chunk_1.png",
     "pixel art game asset, single isolated flesh chunk on pure transparent background, irregular red meat blob with pink edges, torn ragged shape, bone fragment sticking out, dark fantasy Berserk style, no background"),
    ("flesh_chunk_2.png",
     "pixel art game asset, single isolated bloody organ on pure transparent background, dark red with black shadows, round organic shape, Berserk manga style, no background"),
    ("blood_splat_1.png",
     "pixel art game asset, single isolated blood splatter on pure transparent background, top-down view, dark crimson red splat, irregular organic shape, radiating droplets, Berserk style, no background"),
]

print(f"[GORE] 출력 폴더: {OUT_DIR}")
print(f"[GORE] {len(PROMPTS)}개 이미지 생성 시작\n")

for i, (fname, prompt) in enumerate(PROMPTS):
    fpath = os.path.join(OUT_DIR, fname)
    print(f"[{i+1}/{len(PROMPTS)}] {fname} 생성 중...")
    try:
        resp = client.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            n=1,
            size="1024x1024",
            quality="medium",
        )
        # gpt-image-1은 b64_json 반환
        img_data = resp.data[0]
        if hasattr(img_data, 'b64_json') and img_data.b64_json:
            img_bytes = base64.b64decode(img_data.b64_json)
        elif hasattr(img_data, 'url') and img_data.url:
            import urllib.request
            img_bytes = urllib.request.urlopen(img_data.url).read()
        else:
            print(f"  ❌ 알 수 없는 응답 형식")
            continue

        with open(fpath, 'wb') as f:
            f.write(img_bytes)

        sz = os.path.getsize(fpath)
        print(f"  ✅ 저장 완료: {fpath} ({sz:,} bytes)")
        if hasattr(img_data, 'revised_prompt') and img_data.revised_prompt:
            print(f"  📝 revised: {img_data.revised_prompt[:80]}...")
    except Exception as e:
        print(f"  ❌ 실패: {e}")

    if i < len(PROMPTS) - 1:
        time.sleep(1)  # rate limit 방지

print(f"\n[GORE] 완료. 파일 목록:")
for f in sorted(os.listdir(OUT_DIR)):
    fp = os.path.join(OUT_DIR, f)
    if os.path.isfile(fp):
        print(f"  {f} — {os.path.getsize(fp):,} bytes")
