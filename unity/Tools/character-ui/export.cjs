const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),path=require('node:path');
const source=fs.readFileSync(process.argv[2],'utf8');
const visuals=vm.runInNewContext(source.match(/const CHAR_VISUALS\s*=\s*(\[[\s\S]*?\n\]);/)[1]);
if(visuals.length!==5||visuals[0].id!=='exoduser_warrior'||visuals[0].comingSoon||visuals.slice(1).some(v=>!v.comingSoon))throw Error('Source character admission changed');
const data={sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),visuals:visuals.map(v=>({id:v.id,name:v.name,job:v.job,description:v.desc,locked:!!v.comingSoon}))};
fs.writeFileSync(path.join(__dirname,'../../Assets/Exoduser/Resources/Data/character_ui.json'),JSON.stringify(data,null,2)+'\n');
console.log('Exported five source classes; warrior only is available.');
