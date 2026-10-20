"""Public diagnostic-result contract: partial/checkpoint routes cannot claim E2E PASS."""
ORDER=['isolation','new_game','character_create','intro_skip','field_MAP11','enemy_kill','revival_interface','item_pickup','equip','auto_potion','level_up','stat_passive_invest','bossroom_gate','boss_defeat_signal','clear','demo_end','save_handoff','lobby_return']
USERDIR='EXODUSER-demo11-47h-Isolated-20261021'
def validate_result(result):
 errors=[];rows=result.get('stages',[])
 if [r.get('id') for r in rows]!=ORDER:errors.append('stage_order_or_coverage')
 if not result.get('headless') or result.get('userdir','').replace('\\','/').split('/')[-1]!=USERDIR:errors.append('isolation_claim')
 counts={s:sum(r.get('status')==s for r in rows) for s in ['PASS','NOT_READY','FAIL']}
 if sum(counts.values())!=len(rows) or result.get('counts')!=counts:errors.append('status_counts')
 checkpoints=any(r.get('checkpoint',False) for r in rows)
 expected='FAIL' if counts['FAIL'] else ('NOT_READY' if counts['NOT_READY'] or checkpoints else 'PASS')
 if result.get('overall')!=expected:errors.append('overall_claim')
 if result.get('continuous_E2E')!=(expected=='PASS' and not checkpoints):errors.append('continuous_claim')
 by_id={r.get("id"):r for r in rows}
 for name in ["boss_defeat_signal","clear","demo_end","lobby_return"]:
  row=by_id.get(name,{})
  if by_id.get("bossroom_gate",{}).get("status")=="NOT_READY":
   if row.get("status")!="NOT_READY" or "bossroom_gate" not in row.get("blocked_by",[]):errors.append(name+":gate_dependency")
 for row in rows:
  if row.get('status')!='PASS':continue
  e=row.get('evidence',{});name=row.get('id')
  for key in {'equip':['applied','same_item_equipped','refresh_readback'],'stat_passive_invest':['verified_growth_readback'],'auto_potion':['HP_written_directly'],'level_up':['source_curve_reused'],'field_MAP11':['actual_provider']}.get(name,[]):
   desired=key!='HP_written_directly'
   if e.get(key) is not desired:errors.append(name+':'+key)
  for metric in ['physics_callback','process_frame_interval']:
   if row.get(metric,{}).get('samples',0)<1:errors.append(name+':unmeasured_'+metric)
 return errors
