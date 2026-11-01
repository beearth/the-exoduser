"""Normalize only the Mac bundle launcher, preserving product identity and gameplay DLLs."""
import argparse
import hashlib
import json
from pathlib import Path
import plistlib
import subprocess

p=argparse.ArgumentParser()
p.add_argument('app',type=Path)
p.add_argument('--backup',type=Path)
p.add_argument('--receipt',type=Path,required=True)
p.add_argument('--check',action='store_true')
a=p.parse_args()
assert a.app.is_absolute() and a.app.suffix=='.app' and a.app.is_dir()
info_path=a.app/'Contents/Info.plist';info=plistlib.loads(info_path.read_bytes())
product,identifier=info['CFBundleName'],info['CFBundleIdentifier']
managed=a.app/'Contents/Resources/Data/Managed'
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
before={name:sha(managed/name) for name in ['Exoduser.Runtime.dll','Exoduser.Core.dll']}
old_name=info['CFBundleExecutable']
if not a.check:
    assert a.backup and a.backup.is_absolute() and not a.backup.exists()
    subprocess.run(['cp','-cR',str(a.app),str(a.backup)],check=True)
    if old_name!='EXODUSER':
        source=a.app/'Contents/MacOS'/old_name;target=source.parent/'EXODUSER'
        assert source.is_file() and not target.exists()
        source.rename(target)
        info['CFBundleExecutable']='EXODUSER'
        info_path.write_bytes(plistlib.dumps(info,fmt=plistlib.FMT_XML,sort_keys=False))
    subprocess.run(['codesign','--force','--sign','-','--timestamp=none','--preserve-metadata=identifier,entitlements,flags',str(a.app)],check=True)
else:assert old_name=='EXODUSER'
subprocess.run(['codesign','--verify','--deep','--strict',str(a.app)],check=True)
current=plistlib.loads(info_path.read_bytes())
assert current['CFBundleName']==product and current['CFBundleIdentifier']==identifier
assert all(sha(managed/name)==value for name,value in before.items())
seal=plistlib.loads((a.app/'Contents/_CodeSignature/CodeResources').read_bytes())
assert 'MacOS/EXODUSER' not in seal.get('files2',{})
receipt={'app':str(a.app),'product':product,'identifier':identifier,'executable':'EXODUSER','previousExecutable':old_name,'strictDeepCodesignVerified':True,'mainNotNestedSeal':True,'gameplayDllsUnchanged':before,'executableSha256':sha(a.app/'Contents/MacOS/EXODUSER'),'checkOnly':a.check}
with a.receipt.open('x') as stream:json.dump(receipt,stream,ensure_ascii=False,indent=2);stream.write('\n')
print(json.dumps(receipt,ensure_ascii=False))
