import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {plan} from './mac-packager/packager.mjs';
export {plan,execute,libraryEvidence} from './mac-packager/packager.mjs';
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try{if(process.argv.length!==3)throw Error('Usage: node mac-packager-cli.mjs CONFIG.json (plan only)');const configPath=path.resolve(process.argv[2]);if(!configPath.endsWith('.json')||configPath.split(path.sep).some(segment=>/^(saves?|userdata.*|profiles?|\.env.*|\.git)$/i.test(segment)))throw Error('CONFIG_PATH_REJECTED');let current=path.parse(configPath).root;for(const segment of configPath.slice(current.length).split(path.sep).filter(Boolean)){current=path.join(current,segment);if(fs.lstatSync(current).isSymbolicLink())throw Error('CONFIG_SYMLINK_REJECTED');}const result=plan(JSON.parse(fs.readFileSync(configPath,'utf8')));console.log(JSON.stringify(result,null,2));if(result.status==='BLOCKED')process.exitCode=2;}catch(error){console.log(JSON.stringify({status:'BLOCKED',error:String(error.message),packageCreated:false}));process.exitCode=2;}
}
