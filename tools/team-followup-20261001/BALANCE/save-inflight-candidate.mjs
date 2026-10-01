import assert from 'node:assert/strict';

export const saveNowCandidate=`function dbSaveNow(){
  if(!_dbReady)return;
  if(_saveDebounce)clearTimeout(_saveDebounce);
  const request={charId:_charId,charIdx:_charIdx,player:P,save:dbSave};
  _saveDebounce=setTimeout(()=>{
    _saveDebounce=null;
    if(!_dbReady||request.charId!==_charId||request.charIdx!==_charIdx||request.player!==P||request.save!==dbSave)return;
    if(_saving){dbSaveNow.pending=request;return}
    dbSaveNow.pending=null;
    dbSave();
  },500);
}
function _drainPendingSaveNow(){
  const request=dbSaveNow.pending;
  dbSaveNow.pending=null;
  if(!request||!_dbReady||request.charId!==_charId||request.charIdx!==_charIdx||request.player!==P||request.save!==dbSave)return;
  dbSaveNow();
}`;

export function candidateSave(source){
  if(!source.includes('_saving=false;'))return source;
  const result=source.replace('_saving=false;','_saving=false;_drainPendingSaveNow();');
  assert.notEqual(result,source);return result;
}
