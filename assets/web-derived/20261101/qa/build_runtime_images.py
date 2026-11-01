#!/usr/bin/env python3
"""Pinned web closure only: lossless PNG->WebP, loading originals first, then largest runtime PNGs."""
import hashlib,json,os,subprocess,unicodedata
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parent
REPO=Path('/Users/fordeargamers/exoduser-wt/UNITY-MAC-20261024')
TARGET_SAVING=180_000_000

def run(*cmd,**kw):return subprocess.run(cmd,check=True,**kw)
def sha(path):
 h=hashlib.sha256()
 with open(path,'rb') as f:
  for b in iter(lambda:f.read(1<<20),b''):h.update(b)
 return h.hexdigest()
def pixels(im):return hashlib.sha256(im.convert('RGBA').tobytes()).hexdigest()
def physical_path(path):
 for name in os.listdir(path.parent):
  if unicodedata.normalize('NFC',name)==unicodedata.normalize('NFC',path.name):return path.parent/name
 return path
def extract(row,dst):
 dst.parent.mkdir(parents=True,exist_ok=True)
 if not dst.exists():
  check=subprocess.run(['git','cat-file','-e',row['blob']],cwd=REPO,env={**os.environ,'GIT_NO_LAZY_FETCH':'1'},capture_output=True)
  if check.returncode:
   run('git','fetch','origin',row['blob'],cwd=REPO,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
  with dst.open('wb') as f:run('git','cat-file','blob',row['blob'],cwd=REPO,env={**os.environ,'GIT_NO_LAZY_FETCH':'1'},stdout=f)
 if dst.stat().st_size!=row['bytes'] or run('git','hash-object',str(dst),cwd=REPO,capture_output=True).stdout.decode().strip()!=row['blob']:
  raise ValueError('source Git blob mismatch: '+row['path'])

def main():
 selected=json.loads((ROOT/'web-closure-selection.json').read_text())
 if (selected['commit'],selected['files'],selected['bytes'])!=('58956eec7d35873d229d94d5244cb73f665ef49e',3095,4629181769):
  raise ValueError('web closure contract changed')
 rows=[x for x in selected['entries'] if x['path'].lower().endswith('.png')]
 loading=sorted((x for x in rows if x['path'].startswith('img/lording/')),key=lambda x:x['path'])
 rest=sorted((x for x in rows if not x['path'].startswith('img/lording/')),key=lambda x:-x['bytes'])
 entries=[];exclusions=[];by_blob={};saved=0
 for row in loading+rest:
  if saved>=TARGET_SAVING and row not in loading:break
  path=row['path'];blob=row['blob'];src=ROOT/'build-input'/path;dst=ROOT/'candidates'/Path(path).with_suffix('.webp')
  try:
   extract(row,src);dst.parent.mkdir(parents=True,exist_ok=True)
   with Image.open(src) as im:
    if getattr(im,'n_frames',1)!=1 or im.mode not in ('RGB','RGBA','P','L','LA'):
     exclusions.append({'source_path':path,'reason':'unsupported color depth or animation'});continue
    dims=im.size;mode=im.mode;icc=im.info.get('icc_profile',b'');src_pix=pixels(im)
    if blob in by_blob:
     if not dst.exists():os.link(by_blob[blob],dst)
    elif not dst.exists():im.save(dst,'WEBP',lossless=True,quality=100,method=4,exact=True,icc_profile=icc)
   with Image.open(dst) as check:
    if check.size!=dims or check.info.get('icc_profile',b'')!=icc or pixels(check)!=src_pix:
     exclusions.append({'source_path':path,'reason':'decoded pixel/dimension/ICC mismatch'});dst.unlink();continue
   if dst.stat().st_size>=row['bytes']:
    exclusions.append({'source_path':path,'reason':'candidate no smaller','source_bytes':row['bytes'],'candidate_bytes':dst.stat().st_size});dst.unlink();continue
   by_blob[blob]=dst
   actual_dst=physical_path(dst)
   entry={'source_commit':selected['commit'],'source_path':path,'source_git_blob':blob,'source_sha256':sha(src),
    'source_bytes':row['bytes'],'candidate_path':str(actual_dst.relative_to(ROOT)),'candidate_sha256':sha(dst),
    'candidate_bytes':dst.stat().st_size,'codec':'WebP lossless','mime':'image/webp','dimensions':list(dims),
    'source_mode':mode,'decoded_rgba_sha256':src_pix,'decoded_rgba_identical':True,'icc_identical':True}
   entries.append(entry);saved+=row['bytes']-dst.stat().st_size
   print('PASS',saved,path,row['bytes'],'->',dst.stat().st_size,flush=True)
  except Exception as exc:
   exclusions.append({'source_path':path,'reason':str(exc)});print('EXCLUDE',path,str(exc),flush=True)
  finally:
   result={'source_commit':selected['commit'],'selected_files':selected['files'],'entries':entries,'exclusions':exclusions,
    'source_bytes':sum(e['source_bytes'] for e in entries),'candidate_bytes':sum(e['candidate_bytes'] for e in entries),'savings_bytes':saved}
   (ROOT/'runtime-image-webp-manifest.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 print('TOTAL',len(entries),'images',saved,'bytes saved')

if __name__=='__main__':main()
