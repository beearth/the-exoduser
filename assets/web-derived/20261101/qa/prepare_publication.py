#!/usr/bin/env python3
"""Create the agreed v1 publication manifest and an immutable, source-only Git payload plan."""
import hashlib,json
from pathlib import Path

ROOT=Path(__file__).resolve().parent
PREFIX='assets/web-derived/20261101/'
def read(name):return json.loads((ROOT/name).read_text())
def sha(path):
 h=hashlib.sha256()
 with open(path,'rb') as f:
  for b in iter(lambda:f.read(1<<20),b''):h.update(b)
 return h.hexdigest()
def main():
 proposal=read('web-derivative-routing-proposal.json')
 assert (proposal['replacement_count'],proposal['effective_bytes'])==(73,3961122491)
 assets=[];payload={}
 for e in proposal['aliases']:
  source=e['request_path'];candidate=e['candidate_path']
  assert candidate.startswith('candidates/')
  relative=candidate.removeprefix('candidates/')
  if source=='video/world_intro_v22b_steam.mp4':relative='video/world_intro_v22b_steam.web.mp4'
  destination=PREFIX+relative
  path=ROOT/candidate
  assert path.is_file() and path.stat().st_size==e['candidate_bytes'] and sha(path)==e['candidate_sha256']
  assert e['candidate_bytes']<100_000_000 and e['candidate_bytes']<100*1024*1024
  asset={'source_path':source,'source_git_blob':e['source_blob'],'source_sha256':e['source_sha256'],
   'source_bytes':e['source_bytes'],'derivative_path':destination,'sha256':e['candidate_sha256'],
   'bytes':e['candidate_bytes'],'mime':e['mime']}
  assert destination.startswith(PREFIX) and destination.endswith({'audio/flac':'.flac','image/webp':'.webp','video/mp4':'.mp4'}[e['mime']])
  assets.append(asset)
  if destination in payload:assert payload[destination]['sha256']==e['candidate_sha256']
  else:payload[destination]={'source_file':str(path),'sha256':e['candidate_sha256'],'bytes':e['candidate_bytes']}
 manifest={'version':1,'assets':assets}
 out=ROOT/'publication/manifest.json';out.parent.mkdir(parents=True,exist_ok=True)
 out.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 payload[PREFIX+'manifest.json']={'source_file':str(out),'sha256':sha(out),'bytes':out.stat().st_size}
 qa_names=['REPORT_KO.md','web-closure-selection.json','bgm-flac-manifest.json','runtime-image-webp-manifest.json',
  'video-candidate-manifest.json','web-derivative-routing-proposal.json','make_selection.mjs','build_derivatives.py',
  'build_runtime_images.py','rebuild_video.sh','audit_mapping.py','prepare_publication.py','github-tree.json',
  'build-input/web-runtime-manifest.mjs','build-input/build-nwjs.mjs']
 qa_names += [f'review/{kind}-{sec:03d}.png' for kind in ('original','candidate') for sec in (5,45,90)]
 qa_names += ['review/silent-preview-87-93.mp4']
 for name in qa_names:
  p=ROOT/name;assert p.is_file(),name
  target=PREFIX+'qa/'+name
  payload[target]={'source_file':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
 plan={'parent_commit':'b3f7c68df736a18c1eb66b94f69134641d2c0615','target_ref':'refs/heads/codex/h5-web-delivery-20261101',
  'payload_file_count':len(payload),'payload_bytes':sum(e['bytes'] for e in payload.values()),'media_physical_count':len(payload)-1-len(qa_names),
  'logical_mapping_count':len(assets),'files':payload}
 (ROOT/'publication-plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({k:v for k,v in plan.items() if k!='files'},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
