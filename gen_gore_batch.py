"""고어 에셋 대량 생성 — 30종 완성"""
import os, base64, time

for line in open(os.path.join(os.path.dirname(__file__), '.env'), 'r', encoding='utf-8'):
    if 'OPENAI' in line:
        k, v = line.strip().split('=', 1)
        os.environ[k.strip()] = v.strip()

from openai import OpenAI
client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])
OUT = os.path.join(os.path.dirname(__file__), 'assets', 'gore')

# 스타일 프리픽스
S = "pixel art game asset sprite on pure transparent background, dark fantasy Berserk manga style, transparent background, no background, "

ITEMS = [
    # 뼈 +3
    ("bone_3.png", S + "single isolated long femur bone fragment, ivory white with blood cracks, diagonal orientation, sharp broken ends"),
    ("bone_4.png", S + "single isolated small chipped bone shard, tiny triangular ivory piece with red stain, jagged edges"),
    ("bone_5.png", S + "single isolated curved rib cage fragment with 3 ribs attached, ivory white with dark red marrow, crescent arc shape"),
    # 살덩이 +4
    ("flesh_chunk_3.png", S + "single isolated large torn muscle chunk, dark red raw meat with white fat streaks, irregular torn shape"),
    ("flesh_chunk_4.png", S + "single isolated small flesh scrap, pink-red shredded meat piece, thin ragged strip shape"),
    ("flesh_chunk_5.png", S + "single isolated round fatty tissue blob, pale pink with red veins, soft organic lump shape"),
    ("flesh_chunk_6.png", S + "single isolated dark bruised flesh piece, purple-red damaged tissue chunk, crushed flat shape"),
    # 눈알 +2
    ("eye_bloody.png", S + "single isolated bloodshot eyeball, white sclera covered in red veins, trailing red optic nerve strand, wide staring pupil"),
    ("eye_torn.png", S + "single isolated crushed eyeball, deflated sphere with leaking dark fluid, torn iris, grotesque damaged orb"),
    # 두개골 +2
    ("skull_half.png", S + "single isolated half skull fragment, lateral cross-section showing empty brain cavity, bone white with dark cracks"),
    ("skull_crushed.png", S + "single isolated crushed skull pieces, flattened bone fragments with dark stains, shattered cranium remains"),
    # 심장 +1
    ("heart_damaged.png", S + "single isolated dark red fantasy organ crystal with cracks, damaged round gem with dark veins leaking, glossy wet RPG item"),
    # 내장 +3
    ("intestine_2.png", S + "single isolated long straight intestine segment, dark pink tube with red blood, twisted rope-like shape"),
    ("intestine_3.png", S + "single isolated tangled intestine knot, coiled dark red tubes bunched together, wet glossy organic mass"),
    ("stomach.png", S + "single isolated fantasy creature stomach organ, pale pink deflated sac with dark veins, RPG game item sprite"),
    ("liver.png", S + "single isolated dark reddish-brown organ lobe, smooth rounded triangular shape with dark veins, glossy wet RPG item"),
    # 척추 +2
    ("spine_short.png", S + "single isolated short spine segment with 3 vertebrae, ivory white bone chain, vertical orientation, blood-stained"),
    ("spine_broken.png", S + "single isolated broken spine fragment, snapped vertebrae with exposed marrow, ivory with dark red, jagged break point"),
    # 이빨
    ("tooth_1.png", S + "single isolated large sharp fang tooth, ivory white with blood root, pointed canine shape, dark fantasy style"),
    ("tooth_2.png", S + "single isolated cracked molar tooth, yellow-ivory with dark cavity, broken crown, blood-stained root"),
    # 손가락
    ("finger_1.png", S + "single isolated severed bony finger, pale skin with dark nail, small elongated shape, dark fantasy RPG item"),
    ("finger_2.png", S + "single isolated curled skeletal finger bone, ivory white phalanges chain, bent hook shape"),
    # 잘린 손
    ("severed_hand.png", S + "single isolated fantasy creature claw hand, pale gray with dark claws, severed at wrist with red stump, RPG game sprite"),
    # 힘줄
    ("tendon_1.png", S + "single isolated torn white tendon strand, fibrous pale rope with red blood tips, stretched elastic shape"),
    ("tendon_2.png", S + "single isolated snapped ligament bundle, white-pink fibrous tissue with frayed ends, short thick cord"),
]

print(f"[GORE-BATCH] {len(ITEMS)}개 생성 시작\n")
ok = 0
fail = 0
for i, (fname, prompt) in enumerate(ITEMS):
    fpath = os.path.join(OUT, fname)
    if os.path.exists(fpath):
        print(f"[{i+1}/{len(ITEMS)}] {fname} 이미 존재 — 스킵")
        ok += 1
        continue
    print(f"[{i+1}/{len(ITEMS)}] {fname} 생성 중...")
    try:
        resp = client.images.generate(model='gpt-image-1', prompt=prompt, n=1, size='1024x1024', quality='medium')
        d = resp.data[0]
        if hasattr(d, 'b64_json') and d.b64_json:
            img = base64.b64decode(d.b64_json)
        elif hasattr(d, 'url') and d.url:
            import urllib.request
            img = urllib.request.urlopen(d.url).read()
        else:
            print(f"  ❌ 알 수 없는 형식")
            fail += 1
            continue
        with open(fpath, 'wb') as f:
            f.write(img)
        print(f"  ✅ {len(img):,} bytes")
        ok += 1
    except Exception as e:
        print(f"  ❌ {e}")
        fail += 1
    if i < len(ITEMS) - 1:
        time.sleep(1.5)

print(f"\n[GORE-BATCH] 완료: {ok} 성공, {fail} 실패")
print(f"\n전체 고어 에셋:")
for f in sorted(os.listdir(OUT)):
    if f.endswith('.bak'):
        continue
    print(f"  {f} — {os.path.getsize(os.path.join(OUT, f)):,} bytes")
