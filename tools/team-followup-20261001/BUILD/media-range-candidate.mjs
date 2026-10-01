export const oldDeclaration='const range = req.headers.range;';
export const newDeclaration=`const _rangeMatch = req.method === 'GET' && stat.size > 0 && typeof req.headers.range === 'string'
        ? /^bytes=(\\d*)-(\\d*)$/i.exec(req.headers.range.trim()) : null;
      const range = _rangeMatch && (_rangeMatch[1] || _rangeMatch[2]) ? _rangeMatch : null;`;
export const oldParsing=`const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10) || 0;
        const end = Math.min(parts[1] ? parseInt(parts[1], 10) : stat.size - 1, stat.size - 1);`;
export const newParsing=`const _size = BigInt(stat.size);
        const _first = range[1] ? BigInt(range[1]) : null;
        const _last = range[2] ? BigInt(range[2]) : null;
        const _start = _first === null ? (_last < _size ? _size - _last : 0n) : _first;
        const _end = _first === null || _last === null || _last >= _size ? _size - 1n : _last;
        const start = _start >= _size ? stat.size : Number(_start);
        const end = Number(_end);`;
export function applyCandidate(source){
  if(source.split(oldDeclaration).length!==2||source.split(oldParsing).length!==2)throw Error('SOURCE_CONTRACT_CHANGED');
  return source.replace(oldDeclaration,newDeclaration).replace(oldParsing,newParsing);
}
