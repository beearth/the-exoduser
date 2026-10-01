import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {scenarios,runOriginal,expectedRefund,verifyCandidate,sourceEvidence} from './d10-independent.mjs';

const candidatePath=process.argv[2];
if(candidatePath) {
  const candidate=await import(pathToFileURL(resolve(candidatePath)).href);
  const result=await verifyCandidate(candidate.runD10Scenario);
  console.log(JSON.stringify({...result,sourceHashes:sourceEvidence(),candidatePath:resolve(candidatePath)},null,2));
} else {
  console.log(JSON.stringify({status:'waiting_for_item',candidateChecked:false,runtimeReady:false,
    sourceHashes:sourceEvidence(),rows:scenarios().map(scenario=>({scenario,original:runOriginal(scenario),expectedRefund:expectedRefund(scenario)}))},null,2));
}
