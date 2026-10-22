import fs from 'node:fs';
import crypto from 'node:crypto';
const root='G:/exoduser/',file=root+'output/new_heroes_refinement_20261022/submission-receipt.json';
const receipt=JSON.parse(fs.readFileSync(file,'utf8'));
const reference='assets/character-concepts/20261022/hellgunner_cyberpunk_robotarm_h02.png';
const prompt='New composition, realistic 3D key art. Reference identity/colors ONLY, not style/layout. Adult female, brown ponytail, red goggles OVER eyes, crimson cloth cape, fitted black leather, modern belt, exposed robot arm. Low three-quarter camera, offset full-body stance; huge single-muzzle revolver-cannon foreshortened diagonally, two hands, short stock. Sculpted face, large clean forms, soft key light, quiet city silhouettes. NO anime outlines, grids, dots, grain, particles, rain or tiny lights.';
if(prompt.length>500)throw Error('Prompt too long');
if(!receipt.jobs.some(j=>j.candidate==='H11'))receipt.jobs.unshift({candidate:'H11',task:'7518889321528745984',reference,referenceSha256:crypto.createHash('sha256').update(fs.readFileSync(root+reference)).digest('hex'),referenceRole:'Identity/colors only; fresh composition and rendering, not local material edit.',prompt,provider:'MagicLight',model:'GPT Image 2.5 sunburst',aspectRatio:'4:3',outputs:1,displayedCost:200,status:'submitted'});
receipt.jobs.find(j=>j.candidate==='H10').verdict='FAIL: user rejected overall quality, dated illustration style and dotted details. Do not use as continuing edit reference.';
receipt.userFeedbackH10={quotes:['퀄리티 거지같어 맘에안드네','옜날이미지같고','선부트ㅡ로 만든거냐','왜케 구리지 점찎힌것도 그렇고 짜치게','작화퀄리티는 왜구 구풍이냐 이해가안가네 좋은구성 많읉네데'],finalApproval:false};
receipt.balanceBeforeH11=37290;
const h11=receipt.jobs.find(j=>j.candidate==='H11');
if(h11.status==='completed-downloaded'){
  h11.verdict='New direction candidate, not approved: low camera/foreshortened cannon and realistic volumes achieved; background light dots removed, leather panels and folds clearer. Belt still ornate, stock contact obscured, cylindrical weapon mass changed. Inspect before adoption.';
  h11.originalInspected=true;
  receipt.latestObservedBalance=37090;
  receipt.balanceObservedAt=new Date().toISOString();
}
receipt.updatedAt=new Date().toISOString();
fs.writeFileSync(file,JSON.stringify(receipt,null,2)+'\n');
console.log('H11 receipt and H10 user rejection updated');
