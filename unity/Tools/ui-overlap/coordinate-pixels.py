import json,sys
from pathlib import Path
from PIL import Image,ImageChops
root=Path(sys.argv[1]); receipt=json.loads((root/'coordinate-probe.json').read_text(encoding='utf-8-sig')); results=[]
def bounds(r): return [r['x'],r['y'],r['x']+r['width'],r['y']+r['height']]
def delta(a,b): return max(abs(x-y) for x,y in zip(a,b))
for row in receipt['rows']:
 stem=f"{row['width']}x{row['height']}-{row['name']}"; im=Image.open(root/(stem+'.png')).convert('RGB');r,g,b=im.split()
 mask=ImageChops.multiply(ImageChops.multiply(r.point(lambda v:255 if v<10 else 0),g.point(lambda v:255 if v>245 else 0)),b.point(lambda v:255 if v>245 else 0)); pixels=mask.getbbox()
 frame=json.loads((root/(stem+'.json')).read_text(encoding='utf-8-sig')); probes=[e for e in frame['elements'] if e.get('text')=='probe']; measured=bounds(probes[-1]['rect']) if probes else None
 expected=bounds(row['expected']); raw=bounds(row['rawExpected']); candidates={}
 for label in ['legacy','identityThenMatrix','unclip']:
  lo,hi=row[label+'Min'],row[label+'Max']; candidates[label]=delta([lo['x'],lo['y'],hi['x'],hi['y']],raw)
 results.append({'name':stem,'pixelBounds':pixels,'expectedMetricBounds':expected,'measuredMetricBounds':measured,'fixturePixelDelta':delta(pixels,expected) if pixels else None,'productionMetricPixelDelta':delta(pixels,measured) if pixels and measured else None,'candidateRawDeltas':candidates})
fixture_ok=len(results)==45 and all(x['fixturePixelDelta'] is not None and x['fixturePixelDelta']<=1.01 for x in results)
audit_ok=fixture_ok and all(x['productionMetricPixelDelta'] is not None and x['productionMetricPixelDelta']<=1.01 for x in results)
out={'scope':'Independent solid-color pixel calibration; raster edge rounding <=1.01px only; UI overlap detector tolerances unchanged','frameCount':len(results),'fixturePixelsPassed':fixture_ok,'productionAuditPassed':audit_ok,'rows':results}
(root/'coordinate-pixels.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps({'frameCount':len(results),'fixturePixelsPassed':fixture_ok,'productionAuditPassed':audit_ok,'productionFailed':sum(x['productionMetricPixelDelta'] is None or x['productionMetricPixelDelta']>1.01 for x in results),'candidateWorst':{k:max(x['candidateRawDeltas'][k] for x in results) for k in ['legacy','identityThenMatrix','unclip']}}));sys.exit(0 if audit_ok else 1)
