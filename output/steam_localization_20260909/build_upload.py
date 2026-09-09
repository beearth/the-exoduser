import json,re,copy
from pathlib import Path
ROOT=Path(__file__).parent
original=json.loads((ROOT/'original_storepage_1189321_all.json').read_text(encoding='utf-8'))
ABOUT='app[content][about]'
SHORT='app[content][short_description]'
parts=re.split(r'(\[[^\]]+\])',original['languages']['koreana'][ABOUT])
indices=[i for i,t in enumerate(parts) if t and not t.startswith('[') and t!='EXODUSER: HELL LORD']
def render(data):
    assert len(data['segments'])==len(indices),(len(data['segments']),len(indices))
    assert 0<len(data['short'])<=300,len(data['short'])
    result=parts.copy()
    for i,t in zip(indices,data['segments']): result[i]=t
    s=''.join(result)
    assert re.findall(r'\[[^\]]+\]',s)==re.findall(r'\[[^\]]+\]',original['languages']['koreana'][ABOUT])
    assert 'EXODUSER: HELL LORD' in s
    assert not re.search('[가-힣]',s)
    return {ABOUT:s,SHORT:data['short']}
all_data={}
for lang in original['languages']:
    path=ROOT/(lang+'.json')
    if path.exists(): all_data[lang]=render(json.loads(path.read_text(encoding='utf-8')))
# Upload only target fields and changed languages; never submit unrelated empty values.
for name,langs in [('pilot_japanese',['japanese']),('remaining',[l for l in all_data if l!='japanese'])]:
    if not langs: continue
    d={'itemid':original['itemid'],'languages':{l:all_data[l] for l in langs}}
    (ROOT/(name+'_upload.json')).write_text(json.dumps(d,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(json.dumps({l:{'short_chars':len(v[SHORT]),'about_chars':len(v[ABOUT])} for l,v in all_data.items()},ensure_ascii=False))
