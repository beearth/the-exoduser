const fs=require('node:fs'),path=require('node:path');
const p=path.join(__dirname,'generation-receipt.json'),r=JSON.parse(fs.readFileSync(p));
r.status='completed';r.completed_observed_at=new Date().toISOString();
r.result_url='https://skillsrc.octask.ai/gpt-image-2/7518452248233431040/20cd1cba-3db8-5115-e677-5af38df32a38_0.png';
r.completed_evidence='Exact task card completed and Generated image preview opened';
fs.writeFileSync(p,JSON.stringify(r,null,2));
