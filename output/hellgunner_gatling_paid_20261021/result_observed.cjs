const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const p=path.join(__dirname,'generation-receipt.json'),r=JSON.parse(fs.readFileSync(p));
r.status='completed';r.completed_observed_at=new Date().toISOString();
r.result_url='https://skillsrc.octask.ai/gpt-image-2/7518447066934194176/7e26848a-81fc-30ba-013a-e1b7cb7a7cdf_0.png';
r.completed_evidence='Exact task card changed from Generating image to result; Preview image task opened Generated image preview';
r.reference_sha256=crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'../../assets/charselect/silvertail_cut.png'))).digest('hex');
fs.writeFileSync(p,JSON.stringify(r,null,2));
