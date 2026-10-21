const fs=require('node:fs'),path=require('node:path');
const p=path.join(__dirname,'generation-receipt.json'),r=JSON.parse(fs.readFileSync(p));
r.status='completed';r.completed_observed_at=new Date().toISOString();
r.result_url='https://skillsrc.octask.ai/gpt-image-2/7518462142332321792/65fa07c9-13e8-c5bd-6037-52a5cb3a7dbf_0.png';
r.completed_evidence='Exact task card completed and Generated image preview opened';
fs.writeFileSync(p,JSON.stringify(r,null,2));
