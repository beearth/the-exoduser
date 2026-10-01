#!/usr/bin/env python3
"""Read-only BUILD source audit; JSON goes to stdout. Never builds or opens game."""
import hashlib, json, re, subprocess
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[3]
rows = []
def check(name, good, detail=None, warning=False):
    rows.append(dict(name=name, status='PASS' if good else ('WARN' if warning else 'FAIL'), detail=detail))
def read(p): return (ROOT / p).read_text()
def sha(p): return hashlib.sha256((ROOT / p).read_bytes()).hexdigest()

class Links(HTMLParser):
    def __init__(self): super().__init__(convert_charrefs=True); self.refs=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='script' and 'src' in a: self.refs.append(('script',a['src']))
        if tag=='link' and 'href' in a: self.refs.append(('link',a['href']))

b=read('build-nwjs.mjs')
def literals(name, is_set=False):
    pattern=r'const '+name+r'\s*=\s*'+(r'new Set\(' if is_set else '')+r'\[([\s\S]*?)\]'
    m=re.search(pattern,b)
    if not m: raise ValueError('Missing build literal: '+name)
    return re.findall(r"'([^']+)'",re.sub(r'//[^\n]*','',m[1]))
files=literals('FILES'); dirs=literals('DIRS')
optional=set(literals('OPTIONAL_FILES',True)+literals('OPTIONAL_DIRS',True))
for name,paths in [('files',files),('directories',dirs)]:
    missing=[p for p in paths if not (ROOT/p).exists()]
    check('build required '+name,not any(p not in optional for p in missing),[p for p in missing if p not in optional])
    check('build optional '+name,not any(p in optional for p in missing),[p for p in missing if p in optional],True)
for f in ['game.html','game-easy-test.html','ui-refinement.css','ch1-boundary-edge.js','ch1-border-foreground.js','ch1-altar-moat.js']:
    check('FILES includes '+f,f in files)
check('Windows x64 target',bool(re.search(r"platform:\s*'win'",b) and re.search(r"arch:\s*'x64'",b)))

all_refs={}; cache={}; manifests={}
for name in ['game.html','game-easy-test.html']:
    src=read(name); parser=Links();parser.feed(src)
    local=[]
    for tag,url in parser.refs:
        parts=urlsplit(url)
        if parts.scheme or parts.netloc or not parts.path:continue
        p=unquote(parts.path).lstrip('/')
        local.append({'tag':tag,'url':url,'path':p})
    all_refs[name]=local
    missing=sorted({x['path'] for x in local if not (ROOT/x['path']).is_file()})
    check(name+' static script/link files',not missing,{'count':len(local),'missing':missing})
    not_packaged=[]
    for x in local:
        p=x['path']
        included=p in files or any(p.startswith(d+'/') for d in dirs) or ('/' not in p and (p.startswith('lang_') and p.endswith('.js') or p.startswith('atlas_')))
        if not included:not_packaged.append(p)
    check(name+' script/link package inclusion',not not_packaged,sorted(set(not_packaged)))
    keys=[urlsplit(x['url']).query for x in local if x['path']=='ui-refinement.css']
    cache[name]=keys
    check(name+' one versioned UI stylesheet',len(keys)==1 and keys[0].startswith('v=') and len(keys[0])>2,keys)
    loaded=any(x['path']=='ch1-boundary-edge.js' for x in local)
    guarded=bool(re.search(r'if\s*\(globalThis\.Ch1BoundaryEdge\)\s*Ch1BoundaryEdge\.draw\(',src))
    check(name+' boundary guarded call',guarded)
    check(name+' boundary load contract',loaded if name=='game.html' else not loaded,{'loaded':loaded,'easy_guarded_noop':name!='game.html'})
check('UI stylesheet cache keys equal',cache['game.html']==cache['game-easy-test.html'],cache)
s=read('server.cjs');nm=read('node-main.js')
check('development env PORT default3333',bool(re.search(r'Number\(process\.env\.PORT\s*\|\|\s*3333\)',s)))
check('development port range',all(x in s for x in ['Number.isInteger(PORT)','PORT < 1','PORT > 65535']))
check('development host and save isolation',all(x in s for x in ['process.env.HOST','process.env.EXODUSER_SAVE_DIR','path.resolve(process.env.EXODUSER_SAVE_DIR)']))
check('package base port3333', 'const PORT = 3333;' in nm)
check('integration package3347/profile/save isolation',all(x in b for x in ['localhost:3347','const PORT = 3347;','userdata-integration-${integrationId}','EXODUSER-INTEGRATION-${integrationId}']))
inputs=set(files)-optional
inputs.update(['build-nwjs.mjs','server.cjs','node-main.js','package.json'])
inputs.update(x['path'] for refs in all_refs.values() for x in refs)
for p in sorted(inputs):
    if (ROOT/p).is_file(): manifests[p]={'sha256':sha(p),'bytes':(ROOT/p).stat().st_size}
result={'kind':'static-source-audit','head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'root':str(ROOT),'checks':rows,'counts':{k:sum(r['status']==k for r in rows) for k in ['PASS','WARN','FAIL']},'references':all_refs,'inputs':manifests,'limits':['No build, browser, HTTP, package or save/relaunch validation.','Directory contents are not recursively hashed; this manifest covers required standalone files and static script/link references.','Mac development port3340 is a launch convention, not a detected running server.']}
print(json.dumps(result,ensure_ascii=False,indent=2))
raise SystemExit(1 if result['counts']['FAIL'] else 0)
