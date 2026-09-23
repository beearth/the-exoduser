import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const gameHtml=readFileSync(new URL("../game.html",import.meta.url),"utf8");
const slice=(from,to)=>{const a=gameHtml.indexOf(from),b=gameHtml.indexOf(to,a);assert.ok(a>=0&&b>a,"boss laser states must exist");return gameHtml.slice(a,b)};

test("boss laser locks its telegraphed direction before the sweep",()=>{
  const wind=slice("case'bossLaserWind'","case'bossLaser'");
  const laser=slice("case'bossLaser'","case'bossShock'");
  assert.match(wind,/e\._laserLockAng=e\.laserAng/);
  assert.match(wind,/e\._laserSweepDir=Math\.random\(\)<\.5\?-1:1/);
  assert.match(laser,/e\._laserSweepT=\(e\._laserSweepT\|\|0\)\+sp/);
  assert.match(laser,/e\.laserAng=e\._laserLockAng\+\(e\._laserSweepDir\|\|1\)\*.0065\*e\._laserSweepT/);
  assert.doesNotMatch(laser,/toP2=Math\.atan2\(P\.y-e\.y,P\.x-e\.x\)/);
});
