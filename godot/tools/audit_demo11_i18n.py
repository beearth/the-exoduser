"""Code-only GDScript UI literal inventory; comments/shaders/diagnostic receipts excluded.

Not a GDScript parser or proof of reachability: explicit display scopes are listed below.
User names, numeric formats and producer-owned item/actor data are separate dynamic inputs.
"""
import argparse, bisect, json, re, subprocess
from pathlib import Path

FILES = ["native_demo_lobby_screen.gd", "native_forge_panel.gd", "hud.gd",
         "native_intro_key_guide_panel.gd", "native_parry_lesson_flow.gd", "main.gd"]
TOKEN = re.compile(r'#[^\n]*|"""[\s\S]*?"""|\'\'\'[\s\S]*?\'\'\'|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'', re.S)
KO = re.compile('[\uac00-\ud7a3]')

def literals(source):
    funcs = [(m.start(), m.group(1)) for m in re.finditer(r'^func ([\w]+)\(', source, re.M)]
    positions = [p for p, _ in funcs]
    declarations=[(m.start(),m.group(1),m.group(2)) for m in re.finditer(r'^(const|var|func|class) ([\w]+)',source,re.M)]
    decl_positions=[x[0] for x in declarations]
    for m in TOKEN.finditer(source):
        raw = m.group()
        if raw.startswith('#'): continue
        q = 3 if raw.startswith(('"""', "'''")) else 1
        value = raw[q:-q]
        value = re.sub(r'\\(.)', lambda x: {'n':'\n','r':'\r','t':'\t'}.get(x[1],x[1]), value)
        if value.lstrip().startswith('shader_type '): continue
        f = bisect.bisect_right(positions,m.start())-1
        di=bisect.bisect_right(decl_positions,m.start())-1
        declaration=declarations[di] if di>=0 else (0,'','')
        yield {'text':value,'line':source.count('\n',0,m.start())+1,'start':m.start(),'end':m.end(),
               'function':funcs[f][1] if f>=0 else '<constants>','declaration_kind':declaration[1],'declaration':declaration[2]}

def visible_scope(name, token, source):
    f, line = token['function'],token['line']
    if name=='native_demo_lobby_screen.gd': return f not in ['get_snapshot']
    if name=='native_forge_panel.gd': return f!='get_snapshot'
    if name=='hud.gd': return not f.startswith('get_') and not f.startswith('_native_boot_loading_not_ready')
    if name=='native_intro_key_guide_panel.gd':
        return (token['declaration_kind']=='const' and token['declaration'] in ['INTRO_LINES','KEY_STEPS','HINT','PAD_HINT_NEXT','PAD_HINT_SKIP']) or f in ['_key_name','_guide_keys','compose_step']
    if name=='native_parry_lesson_flow.gd': return (token['declaration_kind']=='const' and token['declaration'] in ['LESSON_LABELS','STEP_TITLES','STEP_TIPS','STEP_KEYS','BASIC_LABELS']) or f in ['_label','_build_panel','_render']
    if name=='main.gd':
        context=source[source.rfind('\n',0,token['start'])+1:source.find('\n',token['end'])]
        boot=token['declaration_kind']=='const' and token['declaration']=='SOURCE_BOOT_EN_LABELS'
        return boot or f in ['_build_native_character_selection_ui','_on_native_character_selected'] or 'show_native_input_status(' in context
    return False

def extract(source,name,path,include_all=False):
    all_tokens=list(literals(source)); rows=[]
    for i,t in enumerate(all_tokens):
        if not KO.search(t['text']) or (not include_all and not visible_scope(name,t,source)): continue
        # Adjacent literal pairs (inline tr_text/_l, WORDS/KEY_STEPS) are candidates,
        # not proof: only ASCII English-looking values qualify.
        pair=''
        if i+1<len(all_tokens):
            j=i+1
            if all_tokens[j]['text']=='en' and j+1<len(all_tokens):j+=1
            nxt=all_tokens[j]; gap=source[t['end']:nxt['start']]
            if len(gap)<35 and re.fullmatch(r'[\s,:\[\]}]*(?:"en"\s*:)?\s*',gap) and re.search('[A-Za-z]',nxt['text']) and not KO.search(nxt['text']): pair=nxt['text']
        rows.append({**t,'path':path,'inline_en':pair})
    return rows

def inventory(root, revision=None):
    result=[]
    for name in FILES:
        path='godot/scripts/'+name
        source=subprocess.check_output(['git','-C',str(root),'show',revision+':'+path],text=True) if revision else (root/path).read_text()
        result+=extract(source,name,path)
    path='godot/port_modules/source_prepare_start_map_view_owner/producer.gd'
    source=subprocess.check_output(['git','-C',str(root),'show',revision+':'+path],text=True) if revision else (root/path).read_text()
    ko=re.search(r'const TEXT_KO := "([^"]+)"',source)[1]
    en=re.search(r'const TEXT_EN := "([^"]+)"',source)[1]
    token=next(t for t in literals(source) if t['text']==ko)
    result.append({**token,'path':path,'inline_en':en,'readonly_producer':True})
    return result

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[2]);ap.add_argument('--output',type=Path,required=True);ap.add_argument('--revision');args=ap.parse_args()
    rows=inventory(args.root,args.revision)
    args.output.write_text(json.dumps({'scope_files':FILES,'occurrences':rows},ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'files':len(set(r['path'] for r in rows)),'occurrences':len(rows),'unique_ko':len(set(r['text'] for r in rows))}))
if __name__=='__main__': main()
