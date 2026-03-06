from pathlib import Path
import re
p = Path('tilemap-editor-src.html')
s = p.read_text(encoding='utf-8')
m = re.search(r"function _tCarveCross\([\s\S]*?\n}\nfunction _tCarveCorridor", s)
if not m:
    raise SystemExit('FAIL: _tCarveCross block not found')
block = m.group(0)
if re.search(r"//[^\n]*for\(let dy=-ry;dy<=ry;dy\+\+\)", block):
    raise SystemExit('FAIL: vertical arm loop is commented out in _tCarveCross')
print('PASS: _tCarveCross vertical loop is active')
