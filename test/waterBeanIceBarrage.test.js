import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function between(a,b){const i=html.indexOf(a),j=html.indexOf(b,i);assert.ok(i>=0&&j>i);return html.slice(i,j);}
test('Water Impact replaces clipped ice on both parry and hit',()=>{
 const calls=[],ctx=vm.createContext({_addBoom:(...a)=>calls.push(a),poolPart(){},shake(){},doHitFlash(){},Math});
 vm.runInContext(between('function _waterBeanIceBurst(','// ═══ Dark 02 임팩트'),ctx);
 ctx._waterBeanIceBurst(10,20,true);ctx._waterBeanIceBurst(10,20,false);
 assert.deepEqual(calls,[[10,20,96,72,'waterImpact'],[10,20,72,66,'waterImpact']]);
 assert.ok(html.includes("waterImpact:['Water_ImpactWater_Sheet.png']"));
 assert.ok(existsSync(new URL('../assets/vfx/Water_ImpactWater_Sheet.png',import.meta.url)));
 assert.equal(/water_ice_impact_sheet|_drawWaterIceSheet|waterIceParry|waterIceHit/.test(html),false);
});
test('flight art stays original while only impacts are replaced',()=>{
 assert.ok(html.includes("_waterBlueFlightImg.src='assets/vfx/water_blue_projectile_sheet.png?v=20260905'"));
 assert.ok(html.includes("_krakenShotImg.src='img/balls/proj_kraken_shot_api_v1.png?v=20260903'"));
 assert.ok(html.includes("_fbFlyImg.src='img/proj_kraken_water.png'"));
 assert.ok(between('function _drawWaterBlueFlight(','function _drawWaterBean(').includes('const _dw=30*sSc,_dh=16*sSc'));
 assert.equal(html.includes('function _drawWaterFlight('),false);
});
test('Q routing and player-hit freeze preserved',()=>{
 assert.ok(between('function _fbEnergyBoom(', 'function _fbFireEnergy(').includes("el===EL.I?'waterImpact'"));
 assert.ok(html.includes('if(_waterBeanParry)_waterBeanIceBurst(p.x,p.y,true)'));
 assert.ok(html.includes("_waterBeanParry?'waterBean':undefined"));
 assert.ok(between('function doParry(','// ═══ 어택 티켓 시스템').includes("_impactKind==='waterBean'"));
 assert.ok(html.includes('if(p.waterBean){_waterBeanIceBurst(p.x,p.y,false);P._freezeSlow='));
});
