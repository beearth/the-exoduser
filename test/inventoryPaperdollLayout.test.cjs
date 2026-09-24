const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync('game.html','utf8');
const coords=Function('return ['+source.match(/const EQ_POS=\[([\s\S]*?)\];/)[1]+']')().slice(0,15);
test('paperdoll sockets stay inside 600x324 and do not overlap at 72px',()=>{
  coords.forEach(([x,y],i)=>{
    assert.ok(x>=0&&y>=0&&x+72<=600&&y+72<=324,`bounds ${i}`);
    coords.slice(i+1).forEach(([xx,yy],j)=>assert.ok(x+72<=xx||xx+72<=x||y+72<=yy||yy+72<=y,`overlap ${i}/${i+j+1}`));
  });
});
test('inventory hides remaining world HUD overlays',()=>{
  for(const id of ['hudTop','tutorialBadgeButton','skBarTip'])assert.ok(source.includes(`body:has(#invPanel.on) #${id}`),id);
});
