import fs from 'node:fs';import vm from 'node:vm';import crypto from 'node:crypto';
const arg=n=>process.argv.slice(2).find(x=>x.startsWith(n+'='))?.slice(n.length+1);
const src=fs.readFileSync(arg('--source-game'),'utf8'),cases=JSON.parse(fs.readFileSync(arg('--cases-file'),'utf8'));
function fn(name){const m=new RegExp('^function '+name+'\\(','m').exec(src);if(!m)throw Error(name);let d=0;for(let i=src.indexOf('{',m.index);i<src.length;i++){let c=src[i];if(c==='"'||c==="'"||c==='`'){let q=c;while(++i<src.length){if(src[i]==='\\')i++;else if(src[i]===q)break;}continue;}if(c==='/'&&src[i+1]==='/'){while(src[i]&&src[i]!=='\n')i++;continue;}if(c==='{')d++;if(c==='}'&&!--d)return src.slice(m.index,i+1);}throw Error('brace');}
const names=['_eqAffixRebuild','_eqAffix','_eqStatRebuild','_eqStat','_eqLckTotal','_lvB','statDropBonus','pMagicCost','_cdRed','pAtkCost','pMeleeStCost','_stDisc','_uEq','_lEqRebuild','_lEq','potHeal','pRegenMul','pAbundRegen','pPredRegen','nc','addExp','_fuseMul'];
const parts=names.map(fn);const slots=/^const SLOT_NAMES=.*$/m.exec(src)[0];
const heal=/const _apHealAmt=([^;]+);/.exec(src)[1];const hpr=/const _hpr=([^;]+);/.exec(src)[1];
const flat=/const _hdFlat=([^;]+);/.exec(src)[1];
const code=slots+'\nvar _eqAffixCache=null,_eqStatCache=null,_lEqCache=null,_gxFiring=false;const _DEMO_MODE=true,_DEMO_LV_CAP=100;\n'+parts.join('\n');
function equal(a,b){if(a===b)return true;if(a&&b&&typeof a==='object'&&typeof b==='object'){const ak=Object.keys(a),bk=Object.keys(b);return ak.length===bk.length&&ak.every(k=>Object.hasOwn(b,k)&&equal(a[k],b[k]));}return false;}
const rows=[];for(const c of cases){const e={P:structuredClone(c.P),G:structuredClone(c.G),STATS:structuredClone(c.STATS),PASSIVES:structuredClone(c.PASSIVES),INV:structuredClone(c.INV),POT_LV:{hp:c.potion_level},_hdMul:1,_hdLv:c.dome_level,sp:c.sp,_fuseStar:()=>c.fuse_star,Math};vm.createContext(e);vm.runInContext(code,e);
let expression;switch(c.kind){case 'magic':expression='pMagicCost()';break;case 'st':expression="_stDisc('giantSlam')";break;case 'cd':expression='_cdRed()';break;case 'drop':expression="_eqAffix('dropRate')";break;case 'flat':expression=flat;break;case 'lck':expression='_eqLckTotal()';break;case 'potion':expression=heal;break;case 'regen':expression=hpr;break;case 'exp':e.P.exp=0;e.P.maxExp=1e9;expression='addExp('+c.raw_exp+');P.exp';break;default:throw Error(c.kind);}
const expected=vm.runInContext(expression,e);rows.push({id:c.id,kind:c.kind,expected,actual:c.actual,equal:equal(expected,c.actual)});}
fs.writeFileSync(arg('--out-file'),JSON.stringify({source_sha256:crypto.createHash('sha256').update(src).digest('hex'),functions:names,exact_js_number:true,rows}));
