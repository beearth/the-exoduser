import test from 'node:test';
import assert from 'node:assert/strict';
import * as layout from '../web3d/living-layout.mjs';

test('environment affine transforms compose on the native GPU proxy without transform()',()=>{
 assert.equal(typeof layout.applyAffine,'function','GPU proxy needs a portable affine composition');
 for(const expected of [[1,0,-.55,-.26,12,34],[1,0,.02,1.045,0,0],[0,-1,1,0,4,9]]){
  let m=[1,0,0,1,0,0];const mul=(a,b,c,d,e,f)=>{const [A,B,C,D,E,F]=m;m=[A*a+C*b,B*a+D*b,A*c+C*d,B*c+D*d,A*e+C*f+E,B*e+D*f+F];};
  const proxy={translate:(e,f)=>mul(1,0,0,1,e,f),rotate:t=>mul(Math.cos(t),Math.sin(t),-Math.sin(t),Math.cos(t),0,0),scale:(a,d)=>mul(a,0,0,d,0,0)};
  layout.applyAffine(proxy,...expected);
  expected.forEach((v,i)=>assert.ok(Math.abs(m[i]-v)<1e-8,`${m} != ${expected}`));
 }
});
