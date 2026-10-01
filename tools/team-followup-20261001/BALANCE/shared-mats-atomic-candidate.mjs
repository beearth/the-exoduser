import {parse} from 'acorn';

export function buildSharedMatsCandidate(serverSource, source) {
  const serverAST = parse(serverSource,{ecmaVersion:'latest'});
  const helper = serverAST.body.find(node=>node.type==='FunctionDeclaration'&&node.id.name==='atomicSaveJSON');
  const sequence = serverAST.body.find(node=>node.type==='VariableDeclaration'&&node.declarations.some(declaration=>declaration.id.name==='atomicSaveSequence'));
  if(!helper||!sequence)throw Error('production helper missing');
  const helperCode = [sequence,helper].map(node=>serverSource.slice(node.start,node.end)).join('\n');
  const ast = parse(source,{ecmaVersion:'latest'});
  const routes = {};
  function walk(node) {
    if(!node||typeof node!=='object')return;
    if(node.type==='IfStatement') {
      const test=source.slice(node.test.start,node.test.end);
      if(test.includes("pathname === '/api/mats'")) {
        for(const method of ['GET','POST'])if(test.includes("req.method === '"+method+"'"))routes[method]=source.slice(node.start,node.end);
      }
    }
    for(const value of Object.values(node)) {
      if(Array.isArray(value))value.forEach(walk);
      else if(value&&typeof value==='object')walk(value);
    }
  }
  walk(ast);
  if(!routes.GET||!routes.POST)throw Error('mats routes missing');
  const before = "fs.writeFileSync(MATS_FILE, JSON.stringify({ mats: n, ts: Date.now() }), 'utf8');";
  if(routes.POST.split(before).length!==2)throw Error('write boundary changed');
  const after = 'atomicSaveJSON(fs, MATS_FILE, { mats: n, ts: Date.now() }, process.pid);';
  return {helperCode,get:routes.GET,originalPost:routes.POST,candidatePost:routes.POST.replace(before,after),before,after};
}
