// 검증된 기존 포장 레시피를 새 납품 경로에만 적용하고 GUID 계약은 유지한다.
const fs=require('fs'),path=require('path');
let text=fs.readFileSync(path.join(__dirname,'forest_package.cjs'),'utf8').replaceAll('I:/EXODUSER-Storage/demo-art/blender-env/forest-r1','I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');
const alphaPatch=`
for(const r of rows.filter(x=>x.알파)){
 const id=r.id,mp=kit+'/Materials/'+id+'.mat',tp=kit+'/Textures/'+id+'_BaseColor.png.meta';
 let m=fs.readFileSync(mp,'utf8');m=m.replace('m_CustomRenderQueue: -1','m_CustomRenderQueue: 2450').replace('RenderType: Opaque','RenderType: TransparentCutout').replace('  - _NORMALMAP','  - _ALPHATEST_ON\\n  - _NORMALMAP').replace('- _Cull: 2','- _Cull: 0').replace('- _AlphaClip: 0','- _AlphaClip: 1\\n    - _Cutoff: 0.35');fs.writeFileSync(mp,m);
 let tx=fs.readFileSync(tp,'utf8').replace('alphaUsage: 0','alphaUsage: 1').replace('alphaIsTransparency: 0','alphaIsTransparency: 1');fs.writeFileSync(tp,tx);
}
`;
text=text.replace('// 폴더 GUID',alphaPatch+'\n// 폴더 GUID');
new Function('require',text)(require);
