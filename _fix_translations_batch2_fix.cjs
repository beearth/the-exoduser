'use strict';
const fs = require('fs');

function findMainObjEnd(src, varDecl) {
  const startIdx = src.indexOf(varDecl);
  if (startIdx === -1) return -1;
  let depth = 0, i = startIdx;
  while (i < src.length) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) return i; }
    i++;
  }
  return -1;
}

function escKey(s) {
  // escape backslash then single quote
  return s.split('\\').join('\\\\').split("'").join("\\'");
}

const fixes = {
  de: {
    file: 'G:/hell/lang_de.js',
    decl: 'const _DE={',
    keys: [
      ['✟ 신성한 결계!', '✟ Heiliger Bann!'],
      ['👻 유령총!', '👻 Geisterpistole!'],
      ['기절!  ', 'Betäubt!  '],
      ['녹슨', 'Verrostet'],
      ['화염의', 'des Infernos'],
      ['악마팔찌', 'Teufelsarmband'],
      ['생명팔찌', 'Lebensarmband'],
    ]
  },
  es: {
    file: 'G:/hell/lang_es.js',
    decl: 'const _ES={',
    keys: [
      ['투구 착용', 'Equipar Yelmo'],
      ['투구 해제', 'Desequipar Yelmo'],
      ['✟ 신성한 결계!', '✟ ¡Barrera Sagrada!'],
      ['혼돈의 투구', 'Yelmo del Caos'],
      ['전지전능의 투구', 'Yelmo de la Omnipotencia'],
      ['방향키 연타', 'Machacar teclas de dirección'],
      ['까마귀와 고양이가 아이템을 주워준다. 수거 범위 안이면.', 'El cuervo y el gato recogen objetos dentro del rango.'],
      ['Ctrl 얼음보주로 탈출! 없으면 방향키 연타!', '¡Ctrl Orbe de Hielo para escapar! ¡Si no, machaca las teclas!'],
      ['👻 유령총!', '👻 ¡Pistola Fantasma!'],
      [' 뎀 ', ' DMG '],
      ['기절!  ', '¡Aturdido!  '],
      ['녹슨', 'Oxidado'],
      ['화염의', 'del Infierno'],
      ['악마팔찌', 'Brazalete Demoníaco'],
      ['생명팔찌', 'Brazalete de Vida'],
    ]
  },
  fr: {
    file: 'G:/hell/lang_fr.js',
    decl: 'const _FR={',
    keys: [
      ['투구 착용', 'Équiper Heaume'],
      ['투구 해제', 'Déséquiper Heaume'],
      ['✟ 신성한 결계!', '✟ Barrière Sacrée !'],
      ['👻 유령총!', '👻 Pistolet Fantôme !'],
      ['기절!  ', 'Étourdi !  '],
      ['녹슨', 'Rouillé'],
      ['화염의', "de l'Inferno"],
    ]
  }
};

for (const [code, cfg] of Object.entries(fixes)) {
  let src = fs.readFileSync(cfg.file, 'utf8');
  const endIdx = findMainObjEnd(src, cfg.decl);
  if (endIdx === -1) { console.error(code, 'could not find main obj end'); continue; }

  const lines = cfg.keys.map(([k, v]) => "  '" + escKey(k) + "':'" + escKey(v) + "',");
  const injection = '\n// --- batch2-fix ---\n' + lines.join('\n') + '\n';

  src = src.slice(0, endIdx) + injection + src.slice(endIdx);
  fs.writeFileSync(cfg.file, src, 'utf8');
  console.log(code.toUpperCase(), '-> injected', lines.length, 'keys into main obj');
}
console.log('Done.');
