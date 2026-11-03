"""Four real tutorial/stash ink controls; does not replace the 1410-frame gate.
Requires Pillow. --self-test checks the checker against frozen real-ink crops;
--candidate checks NEW same-package PNG/JSON captures and fails on missing text.
"""
import argparse
import json
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent
FIXTURES = HERE / 'fixtures' / 'scroll-ink'

def read_json(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))

def otsu(values):
    histogram = [0] * 256
    for value in values:
        histogram[value] += 1
    total, weighted = len(values), sum(i*n for i, n in enumerate(histogram))
    left_n = left_sum = 0
    best, cutoff = -1, 0
    for i, count in enumerate(histogram):
        left_n += count
        left_sum += i*count
        right_n = total-left_n
        if not left_n or not right_n:
            continue
        variance = left_n*right_n*(left_sum/left_n-(weighted-left_sum)/right_n)**2
        if variance > best:
            best, cutoff = variance, i
    return cutoff

def ink(image, row):
    # Classify local contrast, not absolute brightness: Metal's background can
    # exceed the old gray>=60 threshold; faint green letters can be below G=35.
    scores = []
    rgb = image.convert('RGB')
    pixels = rgb.load()
    for i in range(rgb.width*rgb.height):
        r, g, b = pixels[i % rgb.width, i // rgb.width]
        scores.append(min(r,g,b) if row['mode'] == 'gray' and max(r,g,b)-min(r,g,b) <= 35 else max(0,g-max(r,b)) if row['mode'] == 'green' else 0)
    if not scores or max(scores)-min(scores) < 12:
        return []
    cutoff = otsu(scores)
    points = [(i % image.width + row['roi'][0] + .5, i // image.width + row['roi'][1] + .5) for i, value in enumerate(scores) if value > cutoff]
    # A solid panel selected as "ink" is a failed control, never a PASS.
    return points if .01 <= len(points)/len(scores) <= .70 else []

def bounds(points):
    if not points:
        return None
    xs, ys = zip(*points)
    return dict(x=min(xs)-.5, y=min(ys)-.5, width=max(xs)-min(xs)+1, height=max(ys)-min(ys)+1)

def contains(rect, points):
    return bool(rect and points) and all(rect['x'] <= x <= rect['x']+rect['width'] and rect['y'] <= y <= rect['y']+rect['height'] for x, y in points)

def run(candidate=None):
    results = []
    for row in read_json(FIXTURES / 'manifest.json')['rows']:
        frozen = ink(Image.open(FIXTURES / (row['stem']+'.png')).convert('RGB'), row)
        physical = bounds(frozen)
        # Independent known-ink rectangle calibrates containment, not production GUI.
        positive = contains(physical, frozen)
        negative_rejected = not contains(row['legacyRect'], frozen)
        result = dict(stem=row['stem'], fixtureInkPixels=len(frozen), fixtureInkBounds=physical,
                      knownInkPositive=positive, legacyAuditNegativeRejected=negative_rejected)
        if candidate:
            image = Image.open(candidate / (row['stem']+'.png')).convert('RGB')
            frame = read_json(candidate / (row['stem']+'.json'))
            width, height = map(int, row['stem'].split('-')[0].split('x'))
            if image.size != (width, height) or (frame['width'], frame['height']) != image.size:
                raise ValueError('PNG/JSON resolution mismatch: '+row['stem'])
            x, y, w, h = row['roi']
            actual = ink(image.crop((x,y,x+w,y+h)), row)
            records = [e for e in frame['elements'] if e.get('kind') == 'text' and not e.get('shadow') and e.get('text') == row['text'] and e.get('source') == row['source']]
            rect = records[0]['rect'] if records else None
            # Guard against a missing/blank glyph, or a huge substitute audit box.
            visible = len(actual) >= max(8, len(frozen)*.5)
            bounded = bool(rect) and rect['width'] <= w*1.5 and rect['height'] <= h*1.5
            native_metric = bool(records) and 'Internal_GetTextRectOffset' in records[0].get('metricProof', '')
            result.update(actualInkPixels=len(actual), actualInkBounds=bounds(actual), auditRect=rect,
                          nativeMetric=native_metric, productionPassed=visible and bounded and contains(rect, actual))
        results.append(result)
    calibrated = len(results) == 4 and all(r['fixtureInkPixels'] >= 8 and r['knownInkPositive'] and r['legacyAuditNegativeRejected'] for r in results)
    return dict(scope='ko tutorial0 + stash, 2560x1600/1600x900; actual ink vs audit box. Frozen checker positive is NOT runtime PASS.',
                calibrated=calibrated, productionPassed=(calibrated and all(r['productionPassed'] for r in results)) if candidate else None, rows=results)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--self-test', action='store_true')
    mode.add_argument('--candidate', type=Path)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    result = run(args.candidate)
    if args.output:
        args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(result, ensure_ascii=False))
    return 0 if result['calibrated'] and (args.self_test or result['productionPassed']) else 1

if __name__ == '__main__':
    raise SystemExit(main())
