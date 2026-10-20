import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {extract} from '../../tools/pet-dialogue-source.mjs';
const game=readFileSync(new URL('../../game.html',import.meta.url),'utf8');
const text=readFileSync(new URL('../scripts/native_pet_dialogue_catalog.gd',import.meta.url),'utf8');
const entries=JSON.parse(text.slice(text.indexOf('const ENTRIES := ')+17,text.indexOf('\n\nstatic func get_entry')));
const original=extract(game);
for(const id of ['boss_groggy','boss_grab_warn','boss_aoe_warn','boss_p2','boss_p3','boss_p4','boss_intro_ch0','boss_kill','boss_gate_open']) {
 test(`original full dialogue entry and exact source line: ${id}`,()=>assert.deepEqual(entries[id],original[id]));
}
test('execution and dead chapter/speed callbacks remain unconnected',()=>{
 for(const id of ['boss_exec','chapter_clear_0','speed_stage_30s','speed_stage_60s']) assert.equal(entries[id].connected,false);
});
