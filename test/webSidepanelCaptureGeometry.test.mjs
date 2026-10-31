import test from 'node:test';
import assert from 'node:assert/strict';
import {assessRows} from '../tools/check-web-sidepanel.mjs';
const box=(left,right,top=0,bottom=100)=>({left,right,top,bottom,visible:true});
test('HUD central alignment follows the symmetric orb bodies while keeping outer art bounds',()=>{
 const row={screen:'hud',width:1920,height:1080,texts:1,overlaps:[],geometry:{'#mmWrap':box(8,148),'#mmLvl':box(1684,1900),'#globeHP':{...box(397.05,637.35),bodyRect:box(440.25,597.75)},'#globeMP':{...box(1279.05,1519.35),bodyRect:box(1322.25,1479.75)}}};
 assert.deepEqual(assessRows([row]),[]);
});
test('tutorial collision still uses the outer art boundary instead of the smaller orb body',()=>{
 const row={screen:'practice',width:1920,height:1080,texts:1,overlaps:[],geometry:{'#mmLvl':box(1684,1900,16,170),'#parryLesson':box(1464,1864,186,896),'#globeMP':{...box(1279,1519,873,1110),bodyRect:box(1322,1480,913,1070)}}};
 assert.ok(assessRows([row]).some(f=>f.kind==='component-overlap'&&f.id==='#globeMP'));
});
