const directions = Object.freeze(['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west']);
const druidDirectionRows = Object.freeze([0, 7, 6, 5, 4, 3, 2, 1]);
const freeze = object => Object.freeze(object);
const asset = (path, width, height, bytes, sha256, sampling='nearest') => freeze({ path, width, height, bytes, sha256, sampling });

const warriorHashes = [
  ['d04c5a3e7831b4a349908a5f31361c39f9993e5fdccc5f792585bce8e601d467',32485],
  ['7d316415b0994330bc758af9c5f901db74b5a78d03478d57d129a57f0ea01efe',29283],
  ['3e26c01d8d032440572b5fbe72a91adc4946c5e340b70921044f1a533e99588b',27539],
  ['a2875563ac73f7a5d500aa2cac252c06ba6be2cab06c7f31f9f595adbba27aaa',23941],
  ['d573be371b59d3aa4b1b2c7414b56460f85c12d7459c8d5ad2db65d5721bc65d',24495],
  ['e44b06d474bb7a5a414aa01cf455088d4fbe9847be2a8455e5dc0ff479fc4ead',27573],
  ['2dec33ee14852f08ee2b2e0266dbd4b8cdf6176659ab71285d53df18c6f2b067',27385],
  ['df74da2698138c42c6906d6d7531da9befe21a292cc45313c174f0d79826236f',25858],
];
const silvertailSourceDirections = Object.freeze(["s","se","e","ne","n","nw","w","sw"]);
const silvertailIdleHashes = [["c0e5b7f4e3e41a9fc454b015f0083524467a2a3ce572395976c78e19d2b28e16",1541562],["c5f547d04234572d5b2e02c8932a41c08fa515c6dde35e50efdd987bbe187aae",1373159],["6cf399352d0eebef6a9711d44e20547714f31949a3ddc04f0c58a5d29b20ce7c",1377604],["1d0bb30ec5cefaee2cafcd32449dd8151aaf7addadcc7d23a858d1d8934f26af",1308706],["5ebaf8eb571e9787a2bf84dbcdcc45015409ce664fa717e2520dbc92e13b8050",1339159],["0c9f7db881de7680674f288b15ff6e2912fd8031b1c68a4a6b65533576f6e758",1497779],["87a6934e4fec884dd1c3b3aff62fa42324001987f2fecfad0b2468340503d72f",1426875],["2d1774015117dffb784de4cbeccf575a304edbff57007c918bf7cbdef640ecc9",1529613]];
const silvertailWalkHashes = [["c278d27e335dc63635d291223707fe8f1287fae137f24c728a886a0abba7b976",1070042],["17fd8a31d8767c817b2d996e4354a483b93122cbcd95445a01684174bb38bb3e",1027460],["daded4168ab910e39aa2f8cced301d5ad4d378c395b48604e67093cfd22b0abf",1033414],["1f3e446204025c4f51de7e3c8932068bce6c3e7c735f8722a770467bea3e5c64",990288],["248ef4074988422dd09ce3e781a463add9dae02d14c28f1078517343449cae6c",823367],["c75b342b7f30a5ecf4a81bdeb75dcb10f878f62eb32fc5d348130766f6374503",1033570],["995cfb9069d64e8096352935359684b3d91970984c964668920c0ef1d9246877",1131757],["f752968b753f2a08de3a641b4fa25b6a0af24bd41728b1cb04bfdcb17e9fc735",1067454]];
// Existing packing metadata uses right/bottom EXCLUSIVE boundaries. No inferred grid crops.
const silvertailIdleCrops = freeze([[104,7,347,428],[113,35,322,426],[122,42,286,431],[145,45,335,421],[105,16,336,423],[111,19,333,436],[147,15,333,426],[108,8,343,421]].map(freeze));
const silvertailWalkScales = freeze([0.07588532883642496,0.07908611599297012,0.0847457627118644,0.0847457627118644,0.081374321880651,0.08302583025830258,0.07922535211267606,0.07588532883642496]);
const silvertailWalkCrops = freeze([[[233,22,550,615,379],[757,20,1038,612,913],[230,633,549,1222,380],[751,631,1038,1222,867.5]],[[204,41,516,610,389.5],[813,51,1075,611,978.5],[196,673,542,1208,380.5],[825,671,1090,1222,989.5]],[[149,57,527,588,377.5],[799,58,1048,589,964],[162,662,558,1192,354.5],[810,669,1051,1192,985]],[[208,59,545,587,405],[807,58,1064,589,967],[203,660,540,1183,403.5],[805,662,1078,1187,976]],[[224,48,513,601,306.5],[796,57,1045,563,864.5],[197,671,471,1209,324.5],[807,675,1042,1178,856]],[[199,42,570,584,319],[772,52,1103,590,870.5],[177,654,569,1191,306],[789,661,1112,1201,878.5]],[[137,35,533,601,320],[808,34,1107,602,920.5],[131,641,532,1199,316.5],[812,642,1107,1201,938]],[[201,22,542,615,325],[856,22,1125,611,933.5],[181,644,523,1229,325],[858,647,1123,1227,952.5]]].map(list => freeze(list.map(freeze))));
const silvertailMetadata = freeze([{"path":"output/silvertail_sprites_20260915/packed/manifest.json","bytes":18643,"sha256":"6f11bff914f568087b71df962c0fc5d15d2d03d8d3a56acf6688d3f1218f2e0d"},{"path":"output/silvertail_walk_fix_20260915/packed/manifest.json","bytes":11248,"sha256":"3b9e2890714bf4533e4433035f15f10858d17cb8d60f0f50ff62cbf88f398901"}].map(freeze));
const warriorBody = freeze(directions.map((direction, i) => asset(`img/exoduser_warrior/${direction}.png`,1008,48,warriorHashes[i][1],warriorHashes[i][0])));
const silvertailIdle = freeze(silvertailSourceDirections.map((direction,i)=>asset(`assets/sprites/player/silvertail_v2/${direction}.png`,1254,1254,silvertailIdleHashes[i][1],silvertailIdleHashes[i][0],'linear')));
const silvertailWalk = freeze(silvertailSourceDirections.map((direction,i)=>asset(`output/silvertail_walk_fix_20260915/${direction}.png`,1254,1254,silvertailWalkHashes[i][1],silvertailWalkHashes[i][0],'linear')));
const warriorAttack = asset('img/exoduser_warrior/attack-bat-v1.png',720,640,131631,'f198e5639a9da1e8e71ac103d44ffa2c7b396cd9a76c17d529eb3a4da3a393b6');
const silvertailAttack = asset('img/exoduser_silvertail/attack-spin-v2.png',240,240,32575,'e186fd51d8c00012e4bdf911aa47a89f95515d44157558cd6378876c6ad1edf0');
const druidIdle = asset('assets/sprites/boss/boss_dark_druid_8dir_v3.png',1656,1240,3668669,'ceb3843fc1d612601b63dcb33035298da9b92d4ae39e88d986805ec4216e1549','linear');
const druidWalk = asset('assets/sprites/boss/boss_dark_druid_walk.png',887,1774,2391134,'6da45fefe6f2e064e314ac90b674468db495590be0bf5501322fad5b2362e473','linear');
const druidAttack = asset('assets/sprites/boss/boss_dark_druid_attack.png',887,1774,2827353,'79e0f8e6d86326f4ab7600d49110fef6be30bc47ac9f2b1d6fffbd1e95c1bf6a','linear');

export const CHARACTER_RIG_CATALOG = freeze({
  'dark-druid': freeze({ id:'dark-druid',name:'다크드루이드',kind:'directional-artwork-skinned-mesh',assets:freeze([druidIdle,druidWalk,druidAttack]),idle:druidIdle,walk:druidWalk,attack:druidAttack,footCalibration:'idle south alpha>16: y12…602, height591; walk/attack: full-cell baseline',frames:freeze({idle:1,walk:4,run:4,attack:4}) }),
  warrior: freeze({ id:'warrior',name:'엑소듀서 전사',kind:'directional-artwork-skinned-mesh',assets:freeze([...warriorBody,warriorAttack]),body:warriorBody,attack:warriorAttack,footCalibration:'south idle alpha>16: x11…32/y14…45; reference height32; anchor22,46; attack40,58',frames:freeze({idle:2,walk:8,run:8,attack:9}) }),
  silvertail: freeze({ id:'silvertail',name:'실버테일',kind:'directional-artwork-skinned-mesh',assets:freeze([...silvertailIdle,...silvertailWalk,silvertailAttack]),idle:silvertailIdle,walk:silvertailWalk,attack:silvertailAttack,metadata:silvertailMetadata,footCalibration:'hires idle crop center/bottom/reference crop height; hires walk manifest anchor/box bottom/reference 45/scale; attack40,62/reference45',frames:freeze({idle:2,walk:4,run:4,attack:9}) }),
});

export const CHARACTER_RIG_CONFIG = freeze({
  columns:20,rows:28,boneCount:12,maxDelta:0.05,alphaTest:0.08,
  frameInterval:freeze({idle:0.65,walk:0.15,run:0.1,attack:0.09}),
  // Existing druid walk/attack are locked to 150 ms; running reuses the walk artwork.
  druidFrameInterval:0.15,uvInsetPixels:0.5,poseStrength:0.012,
});
export const CHARACTER_RIG_DIRECTIONS = directions;

function rectangle(assetInfo, col, row, cols, rows, anchorX, anchorY, referenceHeight) {
  const x=Math.round(col*assetInfo.width/cols),y=Math.round(row*assetInfo.height/rows);
  const w=Math.round((col+1)*assetInfo.width/cols)-x,h=Math.round((row+1)*assetInfo.height/rows)-y;
  return freeze({path:assetInfo.path,x,y,w,h,anchorX:anchorX ?? w/2,anchorY:anchorY ?? h,referenceHeight:referenceHeight ?? h});
}

function originalCropFrame(info,crop,anchorX,referenceHeight){
  const [x,y,right,bottom]=crop,w=right-x,h=bottom-y;
  if(![x,y,right,bottom,anchorX,referenceHeight].every(Number.isFinite)||x<0||y<0||right>info.width||bottom>info.height||w<=1||h<=1||anchorX<0||anchorX>w||referenceHeight<=0)throw new Error('고해상도 crop/발 앵커 계약 오류');
  return freeze({path:info.path,x,y,w,h,anchorX,anchorY:h,referenceHeight});
}

export function characterRigFrame(id,mode,direction,index) {
  const entry=CHARACTER_RIG_CATALOG[id];
  if(!entry)throw new Error(`지원하지 않는 캐릭터: ${id}`);
  if(!['idle','walk','run','attack'].includes(mode)||!Number.isInteger(direction)||direction<0||direction>7)throw new Error('모션/8방향 계약 오류');
  if(!Number.isInteger(index)||index<0||index>=entry.frames[mode])throw new Error('프레임 범위 오류');
  if(id==='dark-druid'){
    const row=druidDirectionRows[direction];
    if(mode==='idle')return rectangle(entry.idle,row%4,Math.floor(row/4),4,2,207,603,591);
    return rectangle(mode==='attack'?entry.attack:entry.walk,index,row,4,8);
  }
  if(mode==='attack'){
    if(id==='warrior')return rectangle(entry.attack,index,direction,9,8,40,58,32);
    const start=(8-direction)%8,i=direction===0&&index===8?8:(start+index)%8;
    return rectangle(entry.attack,i%3,Math.floor(i/3),3,3,40,62,45);
  }
  if(id==='silvertail'){
    if(mode==='idle'){
      const crop=silvertailIdleCrops[direction];
      return originalCropFrame(entry.idle[direction],crop,(crop[2]-crop[0])/2,crop[3]-crop[1]);
    }
    const crop=silvertailWalkCrops[direction][index];
    return originalCropFrame(entry.walk[direction],crop,crop[4]-crop[0],45/silvertailWalkScales[direction]);
  }
  const offset=mode==='idle'?0:2;
  return rectangle(entry.body[direction],offset+index,0,21,1,22,46,32);
}
