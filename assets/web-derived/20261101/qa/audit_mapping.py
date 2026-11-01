#!/usr/bin/env python3
"""Check every proposed substitution against the exact 3,095-file web closure."""
import hashlib,json
from pathlib import Path

ROOT=Path(__file__).resolve().parent
def read(name):return json.loads((ROOT/name).read_text())
def sha(path):
 h=hashlib.sha256()
 with open(path,'rb') as f:
  for b in iter(lambda:f.read(1<<20),b''):h.update(b)
 return h.hexdigest()
def main():
 selection=read('web-closure-selection.json')
 assert (selection['files'],selection['bytes'])==(3095,4629181769)
 selected={e['path']:e for e in selection['entries']}
 all_entries=read('bgm-flac-manifest.json')['entries']+read('runtime-image-webp-manifest.json')['entries']+[read('video-candidate-manifest.json')]
 paths=set();saving=0;aliases=[]
 for e in all_entries:
  path=e['source_path'];assert path in selected and path not in paths,path;paths.add(path)
  assert e['source_git_blob']==selected[path]['blob'] and e['source_bytes']==selected[path]['bytes'],path
  src=ROOT/'build-input'/path;dst=ROOT/e['candidate_path']
  assert src.stat().st_size==e['source_bytes'] and sha(src)==e['source_sha256'],path
  assert dst.stat().st_size==e['candidate_bytes'] and sha(dst)==e['candidate_sha256'],path
  assert e['candidate_bytes']<e['source_bytes'],path
  assert e['candidate_bytes']<100000000,path
  saving+=e['source_bytes']-e['candidate_bytes']
  aliases.append({'request_path':path,'candidate_path':e['candidate_path'],'mime':e['mime'],
   'source_blob':e['source_git_blob'],'source_sha256':e['source_sha256'],'candidate_sha256':e['candidate_sha256'],
   'source_bytes':e['source_bytes'],'candidate_bytes':e['candidate_bytes']})
 effective=selection['bytes']-saving
 replacements={e['source_path']:e for e in all_entries}
 max_file=max((replacements[e['path']]['candidate_bytes'] if e['path'] in paths else e['bytes'],e['path']) for e in selection['entries'])
 assert effective<4000000000 and max_file[0]<100000000
 assert sum(1 for e in selection['entries'] if e['path'].startswith('img/lording/wide/') and e['path'].endswith('.webp'))==105
 assert sum(1 for e in selection['entries'] if e['path'].startswith('assets/fullscreen-wide/20261031/') and e['path'].endswith('.webp'))==128
 result={'source_commit':selection['commit'],'source_tree':'1ba1c6ca9ee1fd5239f209b659dd7dfa54c79b37',
  'selected_file_count':selection['files'],'selected_bytes':selection['bytes'],'replacement_count':len(aliases),
  'saving_bytes':saving,'effective_bytes':effective,'transfer_limit_bytes':4000000000,
  'remaining_headroom_bytes':4000000000-effective,'largest_effective_file_bytes':max_file[0],
  'largest_effective_file_path':max_file[1],'per_file_limit_bytes':100000000,
  'loading_wide_webp_untouched':105,'fullscreen_wide_webp_untouched':128,
  'web_runtime_integration':'PENDING: explicit request URL mapping and MIME, 16:9/21:9/32:9 browser preview',
  'aliases':aliases}
 (ROOT/'web-derivative-routing-proposal.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({k:v for k,v in result.items() if k!='aliases'},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
