# Hahmlet 가변 글꼴 → 300·400 고정 굵기, 한글 서브셋(KS X 1001 2350자 + 게임 원문에 쓰인 한글 전부) + 라틴·문장부호 → TTF(Unity)·WOFF(웹)
import sys, os, re, glob
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

SRC = r'E:/exoduser-wt/_out/fonts/Hahmlet-wght.ttf'
OUT = sys.argv[1]
TEXT_DIRS = sys.argv[2:]

# 1) KS X 1001 한글 2350자 = EUC-KR 0xB0A1~0xC8FE
ks = set()
for hi in range(0xB0, 0xC9):
    for lo in range(0xA1, 0xFF):
        try:
            ks.add(bytes([hi, lo]).decode('euc-kr'))
        except UnicodeDecodeError:
            pass
# 2) 게임 원문(한국어) 파일에 실제로 쓰인 한글·한글 자모
used = set()
for d in TEXT_DIRS:
    for path in [d] if os.path.isfile(d) else glob.glob(os.path.join(d, '*')):
        if not os.path.isfile(path):
            continue
        try:
            s = open(path, encoding='utf-8', errors='ignore').read()
        except Exception:
            continue
        used.update(ch for ch in s if '\uac00' <= ch <= '\ud7a3' or '\u3131' <= ch <= '\u318e')
chars = ks | used
unicodes = set(ord(c) for c in chars)
unicodes |= set(range(0x20, 0x7f)) | set(range(0xa0, 0x100))       # ASCII + Latin-1
unicodes |= set(range(0x2010, 0x2070))                              # 일반 문장부호(— · … ‹ › 등)
unicodes |= {0x2190, 0x2191, 0x2192, 0x2193, 0x25b2, 0x25b6, 0x25bc, 0x25c0, 0x25c6, 0x25c7, 0x3001, 0x3002, 0x300c, 0x300d, 0x300e, 0x300f, 0x3008, 0x3009, 0x2022, 0xff5e}
print('hangul KS', len(ks), 'used', len(used), 'used-not-in-KS', len(used - ks), 'total codepoints', len(unicodes))

os.makedirs(OUT, exist_ok=True)
for w in (300, 400):
    f = TTFont(SRC)
    inst = instancer.instantiateVariableFont(f, {'wght': w}, updateFontNames=True)
    opts = subset.Options()
    opts.layout_features = ['*']
    opts.name_IDs = ['*']
    opts.name_languages = ['*']
    opts.notdef_outline = True
    opts.drop_tables += ['DSIG']
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=unicodes)
    sub.subset(inst)
    base = os.path.join(OUT, f'Hahmlet-{w}-ko')
    inst.flavor = None
    inst.save(base + '.ttf')
    inst.flavor = 'woff'
    inst.save(base + '.woff')
    for ext in ('.ttf', '.woff'):
        print(os.path.basename(base + ext), os.path.getsize(base + ext))
