const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const { collectAssemblies } = require('../buildloop/assembly-compile-check.cjs');
const root = fs.mkdtempSync('I:/EXODUSER-Storage/devtools/fix-1102/fix2/asm-fixture-');
const files = {
 'Assets/Base/Base.asmdef': JSON.stringify({name:'Base',references:[]}),
 'Assets/Base/Base.asmdef.meta': 'guid: aabbcc\n',
 'Assets/Base/A.cs': 'class A {}',
 'Assets/Base/Nested/Nested.asmdef': JSON.stringify({name:'Nested',references:['GUID:aabbcc']}),
 'Assets/Base/Nested/B.cs': 'class B {}',
 'Assets/Remodel/Base.asmref': JSON.stringify({reference:'GUID:aabbcc'}),
 'Assets/Remodel/Pool.cs': 'class Pool {}',
 'Assets/Editor/Tool.asmdef': JSON.stringify({name:'Tool',references:['Base'],includePlatforms:['Editor']}),
 'Assets/Editor/Tool.cs': 'class Tool {}',
 'Assets/Default.cs': 'class Default {}',
 'Assets/Other/Editor/Utility.cs': 'class Utility {}'
};
for (const [f,s] of Object.entries(files)) {fs.mkdirSync(path.dirname(path.join(root,f)),{recursive:true}); fs.writeFileSync(path.join(root,f),s)}
const map=collectAssemblies(root,Object.keys(files));
assert.deepEqual(map.get('Base').sources,['Assets/Base/A.cs','Assets/Remodel/Pool.cs']);
assert.deepEqual(map.get('Nested').references,['Base']);
assert.deepEqual(map.get('Tool').includePlatforms,['Editor']);
assert.deepEqual(map.get('Assembly-CSharp').sources,['Assets/Default.cs']);
assert.deepEqual(map.get('Assembly-CSharp-Editor').sources,['Assets/Other/Editor/Utility.cs']);
console.log('PASS: asmdef boundaries, GUID asmref, nested boundaries, Editor/predefined assemblies');
