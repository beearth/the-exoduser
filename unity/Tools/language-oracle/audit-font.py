"""Read-only glyph audit of the existing language-name font; requires fonttools."""
import hashlib,json,pathlib,sys
from fontTools.ttLib import TTFont
root=pathlib.Path(__file__).resolve().parents[2]
font=root/"Assets/Exoduser/Resources/Art/fonts/NativeLobbyNotoSansKR-SemiBold.ttf"
catalogue=json.loads((pathlib.Path(__file__).parent/"catalogue.json").read_text())
chars=TTFont(font).getBestCmap()
rows=[]
for code,name in catalogue:
 missing=[c for c in sorted(set(name)) if not c.isspace() and ord(c) not in chars]
 rows.append(dict(code=code,name=name,missing=missing))
receipt=dict(font=str(font),sha256=hashlib.sha256(font.read_bytes()).hexdigest(),unicodeEntries=len(chars),labels=rows,scope="Font cmap coverage only; no shaping/RTL/rendering assertion")
pathlib.Path(sys.argv[1]).write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+"\n")
print(json.dumps(dict(complete=sum(not r["missing"] for r in rows),incomplete=[r["code"] for r in rows if r["missing"]])))
