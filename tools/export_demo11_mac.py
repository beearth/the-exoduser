#!/usr/bin/env python3
"""DEMO11-46 local macOS QA export. No product scripts or real save access.
Official 4.7.2 template required; output must be outside the checkout.
Before any launch, verify project.binary from the exported PCK offline.
"""
import argparse
import datetime
import hashlib
import json
from pathlib import Path
import plistlib
import re
import struct
import subprocess
import time

USERDIR = "EXODUSER-demo11-46-Isolated-20261021"
PRESET = "macOS Demo11 Isolated Preview"


def godot_gate(out, label):
    command = 'pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l'
    while True:
        count = int(subprocess.check_output(['/bin/zsh'], input=command+'\n', text=True).strip())
        with (out/'process-gate.jsonl').open('a') as f:
            f.write(json.dumps({'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(), 'label':label, 'command':command, 'count':count, 'wait_seconds':30 if count >= 2 else 0})+'\n')
        if count < 2:
            return
        print('waiting Godot count',count,flush=True)
        time.sleep(30)


def run_engine(engine, project, out, label, args):
    godot_gate(out,label)
    argv=[str(engine),'--headless','--path',str(project),'--log-file',str(out/(label+'.engine.log')),*args]
    with (out/(label+'.out.log')).open('w') as stdout, (out/(label+'.err.log')).open('w') as stderr:
        result=subprocess.run(argv,stdout=stdout,stderr=stderr,timeout=600)
    (out/(label+'.command.json')).write_text(json.dumps({'argv':argv,'exit':result.returncode},indent=2)+'\n')
    if result.returncode:
        raise RuntimeError(label+' failed; inspect its logs')


def verify_pack(app):
    """PCK v2/v3/v4 directory + ECFG keys; never start the app to discover its userdir.
    Layout: official core/io/file_access_pack.cpp and core/config/project_settings.cpp.
    Only the string/bool settings needed for isolation are decoded.
    """
    plist=plistlib.loads((app/'Contents/Info.plist').read_bytes())
    packs=list((app/'Contents/Resources').glob('*.pck'))
    if len(packs)!=1: raise RuntimeError('expected one external PCK')
    with packs[0].open('rb') as f:
        def u32(): return struct.unpack('<I',f.read(4))[0]
        def u64(): return struct.unpack('<Q',f.read(8))[0]
        if f.read(4)!=b'GDPC': raise RuntimeError('PCK header')
        version=u32(); engine_version=[u32(),u32(),u32()]; flags=u32(); base=u64()
        if flags & 1: raise RuntimeError('encrypted directory unsupported')
        if version in (3,4): f.seek(u64())
        elif version==2: f.read(64)
        else: raise RuntimeError('unsupported PCK version')
        count=u32(); project=None
        for _ in range(count):
            name=f.read(u32()).rstrip(b'\0').decode(); offset=u64(); size=u64(); digest=f.read(16); file_flags=u32()
            if name.removeprefix('res://')=='project.binary': project=(base+offset,size,digest,file_flags)
        if project is None or project[3]!=0: raise RuntimeError('plain project.binary missing')
        f.seek(project[0]); data=f.read(project[1])
        if hashlib.md5(data).digest()!=project[2]: raise RuntimeError('project.binary checksum')
    if data[:4]!=b'ECFG': raise RuntimeError('settings header')
    pos=4
    def read32():
        nonlocal pos
        value=struct.unpack_from('<I',data,pos)[0];pos+=4;return value
    settings={}
    for _ in range(read32()):
        length=read32();key=data[pos:pos+length].decode();pos+=length
        length=read32();value=data[pos:pos+length];pos+=length
        kind=struct.unpack_from('<I',value)[0]&0xffff
        if kind in (4,21):
            length=struct.unpack_from('<I',value,4)[0];settings[key]=value[8:8+length].decode()
        elif kind==1: settings[key]=bool(struct.unpack_from('<I',value,4)[0])
    if settings.get('application/config/custom_user_dir_name')!=USERDIR or settings.get('application/config/use_custom_user_dir') is not True:
        raise RuntimeError('isolation absent from exported project.binary; DO NOT RUN')
    expected={'com.exoduser.demo11-46':'res://scenes/main.tscn','com.exoduser.demo11-46.lobby':'res://scenes/demo_lobby.tscn'}
    if plist.get('CFBundleIdentifier') not in expected or settings.get('application/run/main_scene')!=expected[plist['CFBundleIdentifier']]: raise RuntimeError('wrong QA bundle/entry scene')
    # Exact user-specified pgrep pattern also sees our QA app while it is running.
    if plist.get('CFBundleExecutable')!='Godot' or app.name!='Godot.app': raise RuntimeError('QA process must participate in the Godot gate')
    return {'userdir':USERDIR,'binary_settings':{k:v for k,v in settings.items() if k.startswith('application/')},'pack_file':str(packs[0]),'pack_bytes':packs[0].stat().st_size,'pack_version':version,'engine_version':engine_version,'project_binary_sha256':hashlib.sha256(data).hexdigest(),'bundle_id':plist['CFBundleIdentifier'],'executable':str(app/'Contents/MacOS'/plist['CFBundleExecutable'])}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--godot-bin',type=Path,required=True)
    p.add_argument('--template',type=Path,required=True)
    p.add_argument('--out-dir',type=Path,required=True)
    p.add_argument('--entry-scene',choices=['field','lobby'],default='field',help='lobby is an explicitly separate diagnostic export, never an integrated router')
    a=p.parse_args(); repo=Path(__file__).resolve().parents[1]; project=repo/'godot'; out=a.out_dir.resolve()
    if out==repo or repo in out.parents: raise RuntimeError('artifacts must be outside checkout')
    if not a.template.is_file() or not a.godot_bin.is_file(): raise RuntimeError('engine/template missing')
    out.mkdir(parents=True,exist_ok=True); app=out/'mac/Godot.app';app.parent.mkdir(exist_ok=True)
    if app.exists(): raise RuntimeError('preserve previous app; choose a new output directory')
    preset=project/'export_presets.cfg';original=preset.read_bytes();override=project/'override.cfg'
    project_file=project/'project.godot';project_original=project_file.read_bytes()
    if override.exists() and override.stat().st_size: raise RuntimeError('override already in use')
    # QA-only package name makes the exported binary match the required pgrep.
    # Native game content and product project.godot are left byte-identical.
    settings='[application]\nconfig/name="Godot"\nconfig/use_custom_user_dir=true\nconfig/custom_user_dir_name="'+USERDIR+'"\n[rendering]\ntextures/vram_compression/import_etc2_astc=true\ntextures/vram_compression/import_s3tc_bptc=true\n'
    # Editor/export explicitly ignores override.cfg (main.cpp setup(..., editor)).
    # Set QA export settings in this own checkout temporarily and restore exact bytes.
    qa=project_original.decode()
    qa=re.sub(r'^config/name=.*$', 'config/name="Godot"', qa, count=1, flags=re.M)
    if a.entry_scene=='lobby': qa=re.sub(r'^run/main_scene=.*$', 'run/main_scene="res://scenes/demo_lobby.tscn"', qa, count=1, flags=re.M)
    qa=re.sub(r'^config/custom_user_dir_name=.*$', 'config/custom_user_dir_name="'+USERDIR+'"', qa, count=1, flags=re.M)
    qa=qa.replace('[rendering]','[rendering]\ntextures/vram_compression/import_etc2_astc=true\ntextures/vram_compression/import_s3tc_bptc=true',1)
    if 'config/use_custom_user_dir=true' not in qa: raise RuntimeError('custom userdir must be enabled')
    try:
        project_file.write_text(qa)
        override.write_text(settings);(out/'override-used.cfg').write_text(settings)
        (out/'project-export-used.godot').write_text(qa)
        text=original.decode();start=text.index('[preset.2.options]');prefix=text[:start];suffix=text[start:]
        template=str(a.template.resolve()).replace('\\','\\\\').replace('"','\\"')
        suffix=suffix.replace('custom_template/debug=""','custom_template/debug="'+template+'"',1)
        suffix=suffix.replace('custom_template/release=""','custom_template/release="'+template+'"',1)
        if a.entry_scene=='lobby': suffix=suffix.replace('application/bundle_identifier="com.exoduser.demo11-46"','application/bundle_identifier="com.exoduser.demo11-46.lobby"',1)
        preset.write_text(prefix+suffix)
        run_engine(a.godot_bin,project,out,'version',['--version'])
        version=(out/'version.out.log').read_text().strip()
        if not version.startswith('4.7.2.'): raise RuntimeError('requires the verified 4.7.2 template cohort')
        run_engine(a.godot_bin,project,out,'import',['--editor','--import','--quit'])
        run_engine(a.godot_bin,project,out,'export',['--export-debug',PRESET,str(app)])
        record=verify_pack(app);record['engine_version_text']=version
        record['standalone_lobby_diagnostic']=a.entry_scene=='lobby'
        record['template_sha256']=hashlib.sha256(a.template.read_bytes()).hexdigest()
        record['source_project_godot_sha256']=hashlib.sha256(project_original).hexdigest()
        record['export_project_godot_sha256']=hashlib.sha256(project_file.read_bytes()).hexdigest()
        (out/'package-verification.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
        print('export verified:',app,'userdir='+USERDIR,flush=True)
    finally:
        preset.write_bytes(original);project_file.write_bytes(project_original);override.write_text('')

if __name__=='__main__': main()
