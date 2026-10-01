import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {verifyBinding,sourceHashes,legacyFixtures,saveRoundtrip,storageRoundtrip} from './binding-independent.mjs';

if(process.argv[2]) {
  const adapter=await import(pathToFileURL(resolve(process.argv[2])).href);
  const result=await verifyBinding(adapter);
  console.log(JSON.stringify({...result,sourceHashes:sourceHashes(),adapterPath:resolve(process.argv[2])},null,2));
}else{
  console.log(JSON.stringify({status:'waiting_for_item_binding',candidateChecked:false,runtimeReady:false,sourceHashes:sourceHashes(),
    rows:['game.html','game-easy-test.html'].flatMap(file=>legacyFixtures().map(input=>({file,input,
      bag:saveRoundtrip(file,input,'bag'),equipped:saveRoundtrip(file,input,'equipped'),storage:storageRoundtrip(file,input)})))},null,2));
}
