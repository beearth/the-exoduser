export function matchesIfNoneMatch(value,currentTag){
  if(typeof value!=='string'||typeof currentTag!=='string')return false;
  if(value.replace(/^[ \t]+|[ \t]+$/g,'')==='*')return true;
  const current=/^(?:W\/)?("[\x21\x23-\x7e\x80-\xff]*")$/.exec(currentTag);
  if(!current)return false;
  const tag=/(?:W\/)?("[\x21\x23-\x7e\x80-\xff]*")/y;
  let position=0,matched=false,seen=false,emptyMembers=0;
  while(position<value.length){
    while(value[position]===' '||value[position]==='\t')position++;
    if(position===value.length)break;
    if(value[position]===','){if(++emptyMembers>32)return false;position++;continue;}
    tag.lastIndex=position;
    const member=tag.exec(value);if(!member)return false;
    seen=true;matched=matched||member[1]===current[1];position=tag.lastIndex;
    while(value[position]===' '||value[position]==='\t')position++;
    if(position===value.length)break;
    if(value[position]!==',')return false;
    position++;
  }
  return seen&&matched;
}
export function applyCandidate(source){
  const needle="req.headers['if-none-match'] === _etag",anchor='const COMPRESSIBLE = new Set(';
  if(source.split(needle).length!==2||source.split(anchor).length!==2)throw Error('SOURCE_CONTRACT_CHANGED');
  return source.replace(anchor,matchesIfNoneMatch.toString()+'\n\n'+anchor).replace(needle,"matchesIfNoneMatch(req.headers['if-none-match'], _etag)");
}
