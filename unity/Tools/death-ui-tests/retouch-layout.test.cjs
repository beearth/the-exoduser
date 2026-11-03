const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),runtime=path.join(root,'Assets/Exoduser/Runtime'),art=path.join(root,'Assets/Exoduser/Resources/Art/ui/silver_hell');
const read=n=>fs.readFileSync(path.join(runtime,n),'utf8');
const source=read('NativeLobby.SilverHell.cs');
// The boundary examples come from the CTO brief, including exactly48/160.
const expr=/IsCompactPlate\(Rect box\)\s*\{return ([^;]+);\}/.exec(source);
assert(expr,'missing compact plate policy');const compact=new Function('box','return '+expr[1]);
for(const [width,height,want] of [[70,34,true],[300,30,true],[159,80,true],[160,48,false],[400,76,false]])assert.equal(compact({width,height}),want,width+'x'+height);
assert(source.includes('PlateTextRect')&&source.includes('box.x+6')&&source.includes('box.width-12'),'6px face padding');
assert(source.includes('btn_chip_1x')&&source.includes('btn_chip_2x'),'separate thorn-free small art');
const dimensions={btn_chip_1x:[150,32],btn_chip_2x:[300,64],lobby_enter_ready_1x:[416,156],lobby_enter_ready_2x:[832,312],lobby_enter_disabled_1x:[416,156],lobby_enter_disabled_2x:[832,312]};
for(const [name,size]of Object.entries(dimensions)){const png=fs.readFileSync(path.join(art,name+'.png'));assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],size,name);const meta=fs.readFileSync(path.join(art,name+'.png.meta'),'utf8');assert(/enableMipMap: 0/.test(meta)&&/filterMode: 1/.test(meta),name+' import');}
const lobby=read('NativeLobby.SilverLobby.cs');assert(lobby.includes('DrawEmptySilverSlot(card)'),'empty cards keep the rail');
assert(lobby.includes('1676,card.y+17,88,20')&&lobby.includes('1788,card.y+21,24,34'),'class/delete gap');assert(lobby.includes('1738,609,76,64'),'count14px clear of card edge');
assert(read('NativeLobby.CharacterPresentation.cs').includes('Panel(panel,45,0,iron:true)'),'name modal uses shared A face and original thorn frame');
assert(read('NativePauseMenu.A15Web.cs').includes('PlateLabel(r,text'),'small settings buttons respect inset');
assert(read('NativeKeyBindList.cs').includes('PlateLabel(r,text'),'keycaps respect inset');
const capture=read('NativeGame.DeathUiCapture.cs');assert(capture.includes('entryPointerInside')&&capture.includes('entryHoverVisible'),'hover receipt measures pointer and actual light');
console.log('PASS compact threshold/6px inset, six prescaled artwork assets, rail/name/gap/hover source contracts; no Player execution');
