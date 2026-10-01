"""Read one observer JSON. Inclusive spans are never added to their parents."""
import collections
import json
import math
import pathlib
import sys


def stats(values):
    values = sorted(values)
    n = len(values)
    return dict(n=n, mean=sum(values) / n if n else None,
                p95=values[math.ceil(n * .95) - 1] if n else None,
                p99=values[math.ceil(n * .99) - 1] if n else None,
                max=max(values) if n else None,
                gt50=sum(x > 50.000001 for x in values),
                gt100=sum(x > 100.000001 for x in values))


def deltas(values):
    return [b - a for a, b in zip(values, values[1:])]


def analyze(raw):
    start, end = raw['inputAt'], raw['end']['at']
    loops = [x for x in raw['loops'] if start <= x['start'] <= end]
    spans = [x for x in raw['spans'] if start <= x['start'] <= end]
    frames = [x for x in raw['frames'] if start <= x['at'] <= end]
    metrics = {
        'rAFtimestampIntervals': stats(deltas([x['timestamp'] for x in frames])),
        'loopStartIntervals': stats(deltas([x['start'] for x in loops])),
        'drawStartIntervals': stats(deltas([x['start'] for x in spans if x['kind'] == 'draw'])),
        'loopDuration': stats([x['duration'] for x in loops]),
        'updateDuration': stats([x['duration'] for x in spans if x['kind'] == 'update']),
        'drawDuration': stats([x['duration'] for x in spans if x['kind'] == 'draw']),
    }
    gaps = []
    for a, b in zip(loops, loops[1:]):
        duration = b['start'] - a['start']
        if duration <= 50.000001:
            continue
        update = a['calls'].get('update', {}).get('total', 0)
        draw = a['calls'].get('draw', {}).get('total', 0)
        events = [s for s in spans if s['end'] > a['start'] and s['start'] < b['start']
                  and s['kind'] not in ('draw', 'update')]
        entries = [e for e in raw['browserEntries'] if e['startTime'] + e['duration'] > a['start']
                   and e['startTime'] < b['start']]
        gaps.append(dict(fromLoop=a['id'], toLoop=b['id'], start=a['start'], end=b['start'],
                         interval=duration, previousLoopCPU=a['duration'],
                         outsidePreviousLoop=b['start'] - a['end'], previousUpdate=update,
                         previousDraw=draw, previousLoopOther=a['duration'] - update - draw,
                         afterKills=a['after']['kills'], items=a['after']['items'],
                         topEvents=sorted(events, key=lambda x: x['duration'], reverse=True)[:8],
                         browserEntries=entries))
    aggregates = {}
    for row in loops:
        for name, value in row['calls'].items():
            acc = aggregates.setdefault(name, dict(count=0, total=0, max=0))
            acc['count'] += value['count']
            acc['total'] += value['total']
            acc['max'] = max(acc['max'], value['max'])
    draw_count = sum(x['drawCount'] for x in loops)
    return dict(
        window=dict(inputAt=start, endAt=end, duration=end-start, reason=raw['reason'],
                    loops=len(loops), draws=draw_count, updates=sum(x['updateCount'] for x in loops),
                    rateLoop=len(loops)/(end-start)*1000, rateDraw=draw_count/(end-start)*1000),
        initial=raw['inputState'], end=raw['end'], metrics=metrics,
        skipCounts=dict(collections.Counter(str(x['skip']) for x in loops)),
        updateCountHistogram=dict(collections.Counter(x['updateCount'] for x in loops)),
        aggregatesNestedDoNotSum=aggregates,
        longLoopStartIntervals=sorted(gaps, key=lambda x: x['interval'], reverse=True),
        longCalls=sorted([x for x in spans if x['duration'] > 5], key=lambda x: x['duration'], reverse=True)[:20],
        events=[e for e in raw['events'] if start <= e['at'] <= end],
        browserEntries=[e for e in raw['browserEntries'] if e['startTime'] + e['duration'] > start and e['startTime'] <= end],
        environment=raw['environment'], options=raw['options'], finalOptions=raw['finalOptions'],
        restored=raw['restored'], dropped=raw['dropped'])


if __name__ == '__main__':
    raw_path, output_path = map(pathlib.Path, sys.argv[1:3])
    output_path.write_text(json.dumps(analyze(json.loads(raw_path.read_text())), ensure_ascii=False, indent=2))
