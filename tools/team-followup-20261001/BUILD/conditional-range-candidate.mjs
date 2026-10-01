export const oldRangeDeclaration="      const _rangeMatch = req.method === 'GET' && stat.size > 0 && typeof req.headers.range === 'string'";
export const oldCacheBlock=`        const _isHtml = ext === '.html';
        const _cache = _isHtml
          ? 'no-cache, no-store, must-revalidate'
          : 'public, max-age=3600';
        const _etag='"'+stat.size.toString(16)+'-'+Math.floor(stat.mtimeMs).toString(16)+'"';
        if(!_isHtml&&req.headers['if-none-match']===_etag){
          res.writeHead(304, { 'Cache-Control': _cache, 'ETag': _etag });
          return res.end();
        }`;
export const newPrelude=`      const _isHtml = ext === '.html';
      const _cache = _isHtml
        ? 'no-cache, no-store, must-revalidate'
        : 'public, max-age=3600';
      const _etag='"'+stat.size.toString(16)+'-'+Math.floor(stat.mtimeMs).toString(16)+'"';
      if (!_isHtml && (req.method === 'GET' || req.method === 'HEAD') && req.headers['if-none-match'] === _etag) {
        res.writeHead(304, { 'Cache-Control': _cache, 'ETag': _etag });
        return res.end();
      }
      const _rangeMatch = req.headers['if-range'] === undefined && req.method === 'GET' && stat.size > 0 && typeof req.headers.range === 'string'`;
export function applyCandidate(source){
  if(source.split(oldRangeDeclaration).length!==2||source.split(oldCacheBlock).length!==2)throw Error('SOURCE_CONTRACT_CHANGED');
  return source.replace(oldRangeDeclaration,newPrelude).replace(oldCacheBlock,'');
}
