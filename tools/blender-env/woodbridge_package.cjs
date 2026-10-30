// 검증된 기존 포장 레시피를 새 납품 경로에만 적용하고 GUID 계약은 유지한다.
const fs=require('fs'),path=require('path');
const text=fs.readFileSync(path.join(__dirname,'forest_package.cjs'),'utf8').replaceAll('I:/EXODUSER-Storage/demo-art/blender-env/forest-r1','I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');
new Function('require',text)(require);
