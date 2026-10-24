const fs=require('fs'),path=require('path');
const dir=process.argv[2];if(!dir)throw Error('Usage: node verify-inventory-player.cjs <actual Player output>');
let r;const checks=[];const check=(name,ok)=>checks.push({name,ok:!!ok});
try{r=JSON.parse(fs.readFileSync(path.join(dir,'inventory-smoke.json'),'utf8'));}catch{}
check('actual_native_inventory_receipt',r?.scope==='actual_native_player_inventory_fixture');
check('original_seed_15_equipped_10_bag',r?.initialEquipped===15&&r?.initialBag===10);
check('shared_ui_handlers_equip_unequip_move_sort',r?.equipped&&r?.unequipped&&r?.moved&&r?.sorted);
check('source_drag_center_and_edge_clamp',r?.edgeDrop);
check('source_resource_clamp_no_heal',r?.resourcesClamped);
check('inventory_pauses_and_resumes',r?.paused&&r?.resumed);
for(const n of ['equipment','swap','bag'])check('rendered_'+n,fs.existsSync(path.join(dir,'unity-inventory-'+n+'.png')));
console.log(JSON.stringify({status:checks.every(c=>c.ok)?'PASS':'FAIL',checks},null,2));process.exitCode=checks.every(c=>c.ok)?0:1;
