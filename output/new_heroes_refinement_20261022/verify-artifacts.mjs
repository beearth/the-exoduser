import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root='G:/exoduser',dir=path.join(root,'output/new_heroes_refinement_20261022');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const submissionsFile=path.join(dir,'submission-receipt.json'),submissions=JSON.parse(fs.readFileSync(submissionsFile));
const downloads=JSON.parse(fs.readFileSync(path.join(dir,'download-receipt.json')));
const references=[],textOnlyRequests=[];
for(const job of submissions.jobs){
 if(job.prompt.length>500)throw new Error(`Overlong prompt: ${job.candidate}`);
 if(job.generationMode==='text-to-image'&&job.reference===null){textOnlyRequests.push({candidate:job.candidate,reference:null});continue;}
 if(!job.reference)throw new Error(`Missing input declaration: ${job.candidate}`);
 const hash=sha(fs.readFileSync(path.join(root,job.reference)));
 if(job.referenceSha256&&hash!==job.referenceSha256)throw new Error(`Input changed: ${job.candidate}`);
 if(!job.referenceSha256){job.referenceSha256=hash;job.referenceHashRecordedAt=new Date().toISOString();}
 references.push({candidate:job.candidate,path:job.reference,sha256:hash});
}
const verified=[];
for(const row of downloads.rows){
 const b=fs.readFileSync(path.join(root,row.destination));
 if(sha(b)!==row.sha256)throw new Error(`Output hash mismatch: ${row.candidate}`);
 if(b.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error('Invalid PNG');
 if(b.readUInt32BE(16)!==row.width||b.readUInt32BE(20)!==row.height)throw new Error('Size mismatch');
 const reviewCopyPresent=fs.existsSync(row.desktopCopy);
 if(reviewCopyPresent&&sha(fs.readFileSync(row.desktopCopy))!==row.sha256)throw new Error('Review copy mismatch');
 verified.push({candidate:row.candidate,path:row.destination,width:row.width,height:row.height,sha256:row.sha256,reviewCopyPresent});
}
fs.writeFileSync(submissionsFile,JSON.stringify(submissions,null,2)+'\n');
const result={verifiedAt:new Date().toISOString(),kind:'Byte hashes, PNG headers, prompt lengths, reference preservation and review-copy checks only. Does not assert visual approval or runtime adoption.',references,textOnlyRequests,outputs:verified};
fs.writeFileSync(path.join(dir,'artifact-verification.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({referencesVerified:references.length,textOnlyRequests:textOnlyRequests.length,outputFilesVerified:verified.length,missingReviewCopies:verified.filter(v=>!v.reviewCopyPresent).map(v=>v.candidate),visualApproval:false,runtimeAdoption:false},null,2));
