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

def ink(image, row):
    points = []
    for y in range(image.height):
        for x in range(image.width):
            r, g, b = image.getpixel((x, y))[:3]
            selected = (min(r, g, b) >= row['min'] and max(r, g, b) - min(r, g, b) <= 35) if row['mode'] == 'gray' else (g >= row['min'] and g > r * 1.5 and g > b * 1.3)
            if selected:
                points.append((x + row['roi'][0] + .5, y + row['roi'][1] + .5))
    return points

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
            result.update(actualInkPixels=len(actual), actualInkBounds=bounds(actual), auditRect=rect,
                          productionPassed=visible and bounded and contains(rect, actual))
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
