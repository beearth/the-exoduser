const test=require('node:test'),assert=require('node:assert/strict');
const {toUnity,normalToUnity,doorPoint}=require('./convert-stage.cjs');
test('glTF 오른손 좌표를 Unity 좌표로 반사하고 이동도 적용한다',()=>assert.deepEqual(toUnity([1,2,3],[1,0,0,0,0,1,0,0,0,0,1,0,4,5,6,1]),[5,7,-9]));
test('비균일 스케일의 법선은 역전치와 정규화를 거친다',()=>{const n=normalToUnity([1,1,0],[2,0,0,0,0,1,0,0,0,0,3,0,0,0,0,1]);assert.ok(Math.abs(n[0]-1/Math.sqrt(5))<1e-8);assert.ok(Math.abs(n[1]-2/Math.sqrt(5))<1e-8);});
test('열린 문짝의 경첩점은 움직이지 않는다',()=>{for(const [x,a] of [[-2.92,72],[2.92,-58]])assert.deepEqual(doorPoint([x,2,4.63],x,a),[x,2,4.63]);});
test('문짝과 부착 철물은 같은 경첩 회전으로 후면 공간을 연다',()=>{const p=doorPoint([-1.47,2,4.63],-2.92,72);assert.ok(Math.abs(p[0]+2.471925)<1e-5);assert.ok(p[2]>5.9);});
