"""Offline attribution. CDP clock alignment is bounded, never treated as exact."""
import collections
import json
import pathlib
import sys


def analyze(light, diag, profile, clocks):
    profile = profile['profile']
    first = light['firstInput']['at']
    kill = light['firstKill']['at']
    attack = next(e['at'] for e in light['inputs'] if e['kind'] == 'mousedown' and e['target'] == 'CANVAS')
    long_draw_gaps = []
    for a, b in zip(light['draws'], light['draws'][1:]):
        if a['at'] < first or b['at'] - a['at'] <= 50.000001:
            continue
        long_draw_gaps.append(dict(start=a['at'], end=b['at'], gap=b['at']-a['at'],
            previousDraw=a['end']-a['at'], betweenDrawCalls=b['at']-a['end'],
            startAfterInput=a['at']-first, endRelativeToFirstKill=b['at']-kill,
            endBeforeFirstAttack=b['at'] < attack,
            adjacentDraws=[a,b], adjacentStates=[r for r in light['rows'] if a['at']-40 <= r['at'] <= b['end']+40],
            nearbyInputs=[e for e in light['inputs'] if a['at']-100 <= e['at'] <= b['end']+100],
            nearbyEvents=[e for e in light['events'] if a['at']-100 <= e['at'] <= b['end']+100]))
    nodes = {n['id']:n for n in profile['nodes']}
    parents = {c:n['id'] for n in profile['nodes'] for c in n.get('children',[])}
    lo = clocks['before']['result']['value']['pageNow']
    hi = clocks['after']['result']['value']['pageNow']
    assert lo <= hi
    samples = []
    t = 0
    assert len(profile['samples']) == len(profile['timeDeltas'])
    for node_id, delta in zip(profile['samples'],profile['timeDeltas']):
        t += delta/1000
        samples.append((t,node_id))
    def possible_stack_samples(start,end):
        hits = collections.Counter()
        for at,node_id in samples:
            if at+hi < start or at+lo > end:
                continue
            seen = set()
            while node_id in nodes:
                f = nodes[node_id]['callFrame']
                key = (f['functionName'],f['url'],f['lineNumber']+1)
                if key not in seen: hits[key] += 1; seen.add(key)
                if node_id not in parents: break
                node_id = parents[node_id]
        return [dict(function=k[0],url=k[1],line=k[2],sampleCount=v) for k,v in hits.most_common(12)]
    loops = [r for r in diag['loops'] if diag['inputAt'] <= r['start'] <= diag['end']['at']]
    attributed = []
    for a,b in zip(loops,loops[1:]):
        gap = b['start']-a['start']
        if gap <= 50.000001: continue
        update = a['calls'].get('update',{}).get('total',0)
        draw = a['calls'].get('draw',{}).get('total',0)
        outside = b['start']-a['end']
        assert abs(gap-a['duration']-outside) < .0001
        attributed.append(dict(fromLoop=a['id'],toLoop=b['id'],start=a['start'],end=b['start'],gap=gap,
            previousLoopElapsed=a['duration'],previousUpdate=update,previousDraw=draw,
            otherInsidePreviousLoop=a['duration']-update-draw,outsidePreviousLoop=outside,
            browserEntries=[e for e in diag['browserEntries'] if e['startTime'] < b['start'] and e['startTime']+e['duration'] > a['start']],
            possibleStackSamples=possible_stack_samples(a['start'],b['start'])))
    return dict(lightFirstInput=first,lightFirstAttack=attack,lightFirstKillObserved=kill,
        lightLongDrawGaps=sorted(long_draw_gaps,key=lambda g:g['gap'],reverse=True),
        lightLargestDraw=max(light['draws'],key=lambda d:d['end']-d['at']),
        lightKillTransitionRows=[r for r in light['rows'] if kill-100 <= r['at'] <= kill+100],
        lightKillAdjacentDraws=[r for r in light['draws'] if kill-100 <= r['at'] <= kill+100],
        diagnosticLongLoopGaps=sorted(attributed,key=lambda g:g['gap'],reverse=True),
        profileClock=dict(startPageLowerBound=lo,startPageUpperBound=hi,uncertaintyMs=hi-lo,
            durationMs=(profile['endTime']-profile['startTime'])/1000,samples=len(samples),
            note='Possible stack windows include clock uncertainty. Counts are neither CPU milliseconds nor causal percentages.'),
        diagnosticFirstKill=next((e for e in diag['events'] if e['kind']=='kills' and e['after']>0),None),
        diagnosticReason=diag['reason'],diagnosticRestored=diag['restored'],dropped=diag['dropped'])


if __name__ == '__main__':
    light,diag,profile,clocks,out = map(pathlib.Path,sys.argv[1:])
    result=analyze(*(json.loads(p.read_text()) for p in [light,diag,profile,clocks]))
    out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
