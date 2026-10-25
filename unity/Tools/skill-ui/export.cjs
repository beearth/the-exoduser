const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),path=require('node:path');
const p=process.argv[2],source=fs.readFileSync(p,'utf8');
const skills=vm.runInNewContext(source.match(/const SKILL_LIST\s*=\s*(\[[\s\S]*?\n\]);/)[1]);
const ki=skills.find(s=>s.id==='kiSlash');if(!ki||!ki.default)throw Error('Expected default kiSlash');
const forge=fs.readFileSync(process.argv[3],'utf8'),slots=vm.runInNewContext(forge.match(/const SLOTS=(\[[\s\S]*?\n\s*\]);/)[1]);
const data={sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),forgeSha256:crypto.createHash('sha256').update(forge).digest('hex'),skill:{id:ki.id,name:ki.name,description:ki.desc,descriptionEn:ki.descEn},slots:slots.map(s=>({key:s.k,kind:s.kind,index:s.idx??-1,definition:s.def??'',variable:s.v??''}))};
fs.writeFileSync(path.join(__dirname,'../../Assets/Exoduser/Resources/Data/skill_ui.json'),JSON.stringify(data,null,2)+'\n');console.log('Exported source kiSlash description and '+slots.length+' slot identities');
