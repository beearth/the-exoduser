"""Pin the existing OFL Noto source to explicit static lobby weights."""
import hashlib, json, pathlib, sys, fontTools
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

source, target, report = map(pathlib.Path, sys.argv[1:4])
target.mkdir(parents=True, exist_ok=True)
source_hash = hashlib.sha256(source.read_bytes()).hexdigest()
rows = []
for weight, style in [(400, "Regular"), (600, "SemiBold"), (700, "Bold")]:
    font = TTFont(source, recalcTimestamp=False)
    font = instantiateVariableFont(font, {"wght": weight}, inplace=True, optimize=False, updateFontNames=True)
    assert "fvar" not in font and font["OS/2"].usWeightClass == weight
    family = "EXODUSER Lobby Sans KR"
    names = {1:family, 2:style, 4:family+" "+style, 6:"EXODUSERLobbySansKR-"+style, 16:family, 17:style}
    for record in list(font["name"].names):
        if record.nameID in names:
            font["name"].setName(names[record.nameID], record.nameID, record.platformID, record.platEncID, record.langID)
    for name_id, value in names.items():
        for platform, encoding, language in [(3,1,0x409),(1,0,0)]:
            font["name"].setName(value, name_id, platform, encoding, language)
    dest = target / ("NativeLobbyNotoSansKR-"+style+".ttf")
    font.save(dest)
    check = TTFont(dest)
    assert "fvar" not in check and check["OS/2"].usWeightClass == weight
    rows.append({"file":dest.name,"weight":weight,"bytes":dest.stat().st_size,"sha256":hashlib.sha256(dest.read_bytes()).hexdigest(),"sourceSha256":source_hash,"glyphs":len(check.getGlyphOrder()),"lineRatio":(check["hhea"].ascent-check["hhea"].descent+check["hhea"].lineGap)/check["head"].unitsPerEm})
assert hashlib.sha256(source.read_bytes()).hexdigest() == source_hash
report.parent.mkdir(parents=True, exist_ok=True)
report.write_text(json.dumps({"sourceSha256":source_hash,"fontTools":fontTools.__version__,"fonts":rows},indent=2),encoding="utf-8")
print(json.dumps(rows))
