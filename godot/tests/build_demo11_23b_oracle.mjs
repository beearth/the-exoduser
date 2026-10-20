import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
const arg=n=>process.argv.find(x=>x.startsWith(n+'='))?.slice(n.length+1);
const src=fs.readFileSync(arg('--source-game'),'utf8');
// Separate brace/array counters (do not decrement at unrelated characters).
function endOf(start,open,close){let d=0,q='',esc=false;for(let i=start;i<src.length;i++){let c=src[i];if(q){if(esc)esc=false;else if(c==='\\')esc=true;else if(c===q)q='';continue;}if('"\'`'.includes(c)){q=c;continue;}if(c===open)d++;else if(c===close){d--;if(d===0)return i+1;}}throw Error('unbalanced');}
const fn=n=>{const a=src.indexOf('function '+n+'(');if(a<0)throw Error(n);const b=src.indexOf('{',a);return src.slice(a,endOf(b,'{','}'));};
const literal=n=>{const a=src.indexOf('const '+n+'=');if(a<0)throw Error(n);const eq=src.indexOf('=',a),b=src.slice(eq+1).search(/[\[{]/)+eq+1;return src.slice(a,endOf(b,src[b],src[b]==='['?']':'}'))+';';};
const code=['ITEM_SIZE','WTYPE_SIZE','BTYPE_SIZE','AFFIX_POOL','CR_ATK_SLOTS','CR_ARMOR_SLOTS','CR_ACC_SLOTS','CRYSTAL_DEFS','CRYSTAL_STAR','Q_GRADES'].map(literal).join('\n')+'\n'+['_qGradeOf','_qGemMul','socketMul','crystalEffects','itemPower','_invRows','_itemSz','_invCategoryKey','_invGrid','_invFindSpace','_invSortBag','_invAutoPlace'].map(fn).join('\n');
if(arg('--cases-file')){
 const cases=JSON.parse(fs.readFileSync(arg('--cases-file'),'utf8'));
 const rows=cases.map(bag=>{const c=vm.createContext({bag,_L:(a)=>a});vm.runInContext('let INV={bag};const INV_COLS=10;let BAG_MAX=300;\n'+code+'\nglobalThis.powers=INV.bag.map(itemPower);const original=INV.bag.slice();_invAutoPlace();globalThis.order=INV.bag.map(i=>original.indexOf(i));globalThis.coords=INV.bag.map(i=>[i._gx,i._gy]);',c,{timeout:1000});return {powers:c.powers,order:c.order,coords:c.coords};});
 fs.writeFileSync(arg('--out-file'),JSON.stringify({rows,source_sha256:crypto.createHash('sha256').update(src).digest('hex'),slice_sha256:crypto.createHash('sha256').update(code).digest('hex')}));
}else{
 let seed=2026102123;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const texts=['-0','0.0','1.0','1792519148060.6101','9007199254740991.0','5e-324','2.2250738585072014e-308','1.7976931348623157e308','1e-324','-1e-400'];
 for(let i=0;i<500;i++){const n=i%2?1792519148000+rand()*1000:(rand()-.5)*10**Math.floor(rand()*620-310);if(Number.isFinite(n))texts.push(n.toString());}
 fs.writeFileSync(arg('--out-file'),JSON.stringify(texts.map(raw=>{const b=Buffer.alloc(8);b.writeDoubleLE(Number(raw));return {raw,hex:b.toString('hex')};})));
}
