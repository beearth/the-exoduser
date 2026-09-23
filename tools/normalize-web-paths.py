"""Collapse NFC/NFD duplicate paths in a derived prebuilt static directory."""
from pathlib import Path
import sys,unicodedata,hashlib,shutil,json
root=Path.cwd().resolve();static=Path(sys.argv[1]).resolve()
assert static.is_relative_to(root/'tmp') and static.name=='static','Only derived tmp static artifacts may be normalized'
changed=[]
for source in list(static.rglob('*')):
    if not source.is_file():continue
    relative=source.relative_to(static).as_posix();canonical=unicodedata.normalize('NFC',relative)
    if relative==canonical:continue
    target=static/canonical
    assert target.resolve().is_relative_to(static)
    if target.exists():
        assert hashlib.sha256(source.read_bytes()).digest()==hashlib.sha256(target.read_bytes()).digest(),f'Different bytes at normalized collision: {relative}'
    else:
        target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target)
    source.unlink();changed.append({'from':relative,'to':canonical})
for directory in sorted((p for p in static.rglob('*') if p.is_dir()),key=lambda p:len(p.parts),reverse=True):
    if not any(directory.iterdir()):directory.rmdir()
configPath=static.parent/'config.json';config=json.loads(configPath.read_text(encoding='utf-8'));overrides=config.setdefault('overrides',{});aliases=[]
for source in list(static.rglob('*')):
    if not source.is_file():continue
    relative=source.relative_to(static).as_posix()
    if relative.isascii():continue
    # Keep public URLs unchanged while avoiding non-ASCII upload filenames.
    alias='_unicode/'+hashlib.sha256(relative.encode()).hexdigest()+source.suffix
    target=static/alias;target.parent.mkdir(exist_ok=True)
    shutil.copyfile(source,target)
    assert hashlib.sha256(source.read_bytes()).digest()==hashlib.sha256(target.read_bytes()).digest()
    overrides[alias]={'path':relative};source.unlink();aliases.append({'source':relative,'upload':alias,'bytes':target.stat().st_size})
configPath.write_text(json.dumps(config,ensure_ascii=False,indent=2),encoding='utf-8')
report={'normalizedPaths':len(changed),'changes':changed,'aliases':aliases,'files':sum(p.is_file() for p in static.rglob('*'))}
Path('output/release_20260910/unicode-paths.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'normalizedPaths':len(changed),'aliases':len(aliases),'aliasBytes':sum(p['bytes'] for p in aliases),'files':report['files']}))
