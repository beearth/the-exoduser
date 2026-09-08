import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
test('recall ignites the actual plant silhouette in red, with cached alpha mask and red glow',()=>{
 assert.ok(html.includes("_redCtx.globalCompositeOperation='source-in'"),'red layer must preserve sprite alpha');
 assert.ok(html.includes("_redCtx.fillStyle='#ff1808'"),'armor needs explicit red, not sepia');
 assert.ok(html.includes("X.shadowColor='#ff2008'"),'red ignition glow must be attached to body');
 assert.ok(html.includes('X.drawImage(_plantImg._ignitionRed,'),'draw the red mask using the current plant frame');
 assert.ok(!html.includes("X.filter='sepia('+heat"),'remove the muddy tint');
});
