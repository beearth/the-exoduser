import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const gameHtml=readFileSync(new URL("../game.html",import.meta.url),"utf8");

test("default impacts select the loaded elemental sheet and reserve the boss sheet for heavy hits",()=>{
  assert.match(gameHtml,/function _impactSpriteFor\(im\)/);
  assert.match(gameHtml,/const bank=im\.boss\?_impElBossSpr:_impElSpr/);
  assert.match(gameHtml,/const frames=im\.boss\?16:9/);
  assert.match(gameHtml,/const sprite=_impactSpriteFor\(im\)/);
  assert.match(gameHtml,/boss:isBoss/);
  assert.match(gameHtml,/boss:true/);
});
