// Web salvageVal oracle: cuts _itemEconomyRarity + salvageVal verbatim out of game.html and evaluates them.
// usage: node export.cjs <game.html> <oracle.json> [sourceSha]
const fs=require('fs');const [,,src,out,sha]=process.argv;const html=fs.readFileSync(src,'utf8');
function cut(name){const at=html.indexOf('function '+name+'(');if(at<0)throw new Error('missing '+name);let i=html.indexOf('{',at),d=0;for(;i<html.length;i++){if(html[i]==='{')d++;else if(html[i]==='}'){d--;if(d===0)break;}}return html.slice(at,i+1);}
const code=cut('_itemEconomyRarity')+'\n'+cut('salvageVal')+'\nreturn salvageVal;';
const salvageVal=new Function(code)();
const rows=[];for(const rarity of [-1,0,1,2,3,4,5])for(const enh of [0,1,5,20])for(let tier=0;tier<=7;tier++)rows.push({rarity,enh,tier,value:salvageVal({rarity,enh,tier})});
fs.writeFileSync(out,JSON.stringify({source:'game.html salvageVal',sourceSha:sha||null,count:rows.length,rows},null,1)+'\n');
console.log('rows',rows.length,'sample',JSON.stringify(rows.slice(0,2)),'max',Math.max(...rows.map(r=>r.value)));
