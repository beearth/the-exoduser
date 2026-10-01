import assert from 'node:assert/strict';
import {saveNowCandidate,candidateSave} from './save-inflight-candidate.mjs';

const drainTail='  dbSaveNow();\n}';
assert.equal(saveNowCandidate.split(drainTail).length,2);
export const immediateDrainCandidate=saveNowCandidate.replace(drainTail,'  dbSave();\n}');
export {candidateSave};
