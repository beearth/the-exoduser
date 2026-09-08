import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');

test('only the post-cinematic login hides the redundant brand, preserving normal login',()=>{
 assert.match(html,/#mainWrap\.cinematic-handoff #loginSection \.login-brand\{display:none\}/);
 assert.match(html,/<div class="login-brand" style="text-align:center">/);
 assert.match(html,/function _goLogin\(\{fromCinematic=false\}=\{\}\)/);
 assert.ok(html.includes("$('mainWrap').classList.toggle('cinematic-handoff',fromCinematic)"));
});
test('movie completion marks the login handoff while replay clears it',()=>{
 const finish=html.slice(html.indexOf('function finishCin(){'),html.indexOf('// 인트로 비디오:'));
 assert.equal((finish.match(/_goLogin\(\{fromCinematic:true\}\)/g)||[]).length,2);
 const replay=html.slice(html.indexOf('function _goCinematic(){'),html.indexOf('async function _goLobby(){'));
 assert.ok(replay.includes("$('mainWrap').classList.remove('show','cinematic-handoff')"));
});
