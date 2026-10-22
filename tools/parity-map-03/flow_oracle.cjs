// Execute verbatim web Worker source, not a reimplementation of native BFS.
const fs=require('fs'),vm=require('vm');
const source=fs.readFileSync('godot/source_snapshot/game.html','utf8');
const worker=source.match(/const _FF_WORKER_SRC=`([\s\S]*?)`;/)[1];
const map=JSON.parse(fs.readFileSync('godot/data/map.json')).tiles;
for(const [x,y] of [[4020,7420],[4020,7380],[4100,3250],[4020,1020]]){
 let result;const self={postMessage:r=>result=r};
 vm.runInNewContext(worker,{self,Int8Array,Int16Array,Int32Array,Float32Array,Math});
 self.onmessage({data:{mw:200,mh:200,ptx:Math.trunc(x/40),pty:Math.trunc(y/40),px:x,py:y,cell:40,bufSize:40000,map:Int8Array.from(map).buffer}});
 fs.writeFileSync(`godot/tests/parity_map03/flow_${x}_${y}.f32`,Buffer.from(result.field));
}
