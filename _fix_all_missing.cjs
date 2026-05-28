const fs = require('fs');

const translations = {
  '\u{1F47B} 유령!': {
    ar: '\u{1F47B} شبح!', bg: '\u{1F47B} Призрак!', cs: '\u{1F47B} Duch!', da: '\u{1F47B} Spøgelse!',
    de: '\u{1F47B} Geist!', el: '\u{1F47B} Φάντασμα!', es: '\u{1F47B} Fantasma!', fi: '\u{1F47B} Haamu!',
    fr: '\u{1F47B} Fantôme!', hu: '\u{1F47B} Szellem!', id: '\u{1F47B} Hantu!', it: '\u{1F47B} Fantasma!',
    nl: '\u{1F47B} Geest!', no: '\u{1F47B} Spøkelse!', pl: '\u{1F47B} Duch!', ptbr: '\u{1F47B} Fantasma!',
    ro: '\u{1F47B} Fantomă!', ru: '\u{1F47B} Призрак!', sv: '\u{1F47B} Spöke!', th: '\u{1F47B} ผี!',
    tr: '\u{1F47B} Hayalet!', uk: '\u{1F47B} Привид!', vi: '\u{1F47B} Ma!', zh: '\u{1F47B} 幽灵!', zht: '\u{1F47B} 幽靈!'
  },
  '\u{1F9B4} 해골무덤!': {
    ar: '\u{1F9B4} مقبرة العظام!', bg: '\u{1F9B4} Костна гробница!', cs: '\u{1F9B4} Kostěná hrobka!', da: '\u{1F9B4} Knoglegrav!',
    de: '\u{1F9B4} Knochengruft!', el: '\u{1F9B4} Οστεοτάφος!', es: '\u{1F9B4} Tumba Ósea!', fi: '\u{1F9B4} Luuhauta!',
    fr: '\u{1F9B4} Tombeau d\'os!', hu: '\u{1F9B4} Csontsír!', id: '\u{1F9B4} Makam Tulang!', it: '\u{1F9B4} Tomba d\'ossa!',
    nl: '\u{1F9B4} Knekkelgraf!', no: '\u{1F9B4} Beingrav!', pl: '\u{1F9B4} Kościany grobowiec!', ptbr: '\u{1F9B4} Tumba Óssea!',
    ro: '\u{1F9B4} Mormânt de oase!', ru: '\u{1F9B4} Костяная гробница!', sv: '\u{1F9B4} Bengrav!', th: '\u{1F9B4} สุสานกระดูก!',
    tr: '\u{1F9B4} Kemik Mezar!', uk: '\u{1F9B4} Кісткова гробниця!', vi: '\u{1F9B4} Mộ Xương!', zh: '\u{1F9B4} 骸骨墓!', zht: '\u{1F9B4} 骸骨墓!'
  },
  '💥 유령총 폭발!': {
    ar: '💥 انفجار مسدس الشبح!', de: '💥 Geisterpistolen-Explosion!', el: '💥 Έκρηξη Φαντασματικού Πιστολιού!',
    es: '💥 Explosión de Pistola Fantasma!', fi: '💥 Haamupistoolin räjähdys!', fr: '💥 Explosion du pistolet fantôme!',
    hu: '💥 Szellemfegyver robbanás!', id: '💥 Ledakan Pistol Hantu!', it: '💥 Esplosione Pistola Fantasma!',
    ja: '💥 幽霊銃爆発!', ptbr: '💥 Explosão da Arma Fantasma!', ro: '💥 Explozie Pistol Fantomă!',
    ru: '💥 Взрыв призрачного ружья!', th: '💥 ระเบิดปืนผี!', tr: '💥 Hayalet Silah Patlaması!',
    vi: '💥 Nổ Súng Ma!', zh: '💥 幽灵枪爆炸!', zht: '💥 幽靈槍爆炸!'
  },
  '🦴 해골무덤!': {
    ar: '🦴 مقبرة العظام!', el: '🦴 Οστεοτάφος!', fi: '🦴 Luuhauta!',
    hu: '🦴 Csontsír!', id: '🦴 Makam Tulang!', it: '🦴 Tomba d\'ossa!',
    ro: '🦴 Mormânt de oase!', th: '🦴 สุสานกระดูก!', tr: '🦴 Kemik Mezar!', vi: '🦴 Mộ Xương!'
  },
  '탈취!': {
    ar: 'سرقة!', bg: 'Кражба!', cs: 'Krádež!', da: 'Stjæl!',
    de: 'Stehlen!', el: 'Κλοπή!', es: '¡Robo!', fi: 'Varastus!',
    fr: 'Vol!', hu: 'Lopás!', id: 'Curi!', it: 'Furto!',
    nl: 'Steel!', no: 'Stjel!', pl: 'Kradzież!', ptbr: 'Roubo!',
    ro: 'Furt!', ru: 'Кража!', sv: 'Stjäl!', th: 'ขโมย!',
    tr: 'Çal!', uk: 'Крадіжка!', vi: 'Trộm!', zh: '夺取!', zht: '奪取!'
  },
  '추적자의': {
    da: 'Forfølger', nl: 'Achtervolger', no: 'Forfølger', sv: 'Förföljare'
  },
  '✟ 신성한 결계!': {
    id: '✟ Penghalang Suci!', it: '✟ Barriera Sacra!'
  },
  '👻 유령총!': {
    id: '👻 Pistol Hantu!', it: '👻 Pistola Fantasma!'
  },
  '기절!  ': {
    id: 'Pingsan!  ', it: 'Stordito!  '
  },
  '일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.': { fr: 'Debout. La d\u00e9esse ne t\'a pas envoy\u00e9 ici pour mourir.' },
  '좋아, 감각이 있군. 계속 쳐!': { fr: 'Bien, tu as de l\'instinct. Continue de frapper!' },
  'Shift를 눌러. 작살이다. 땅에 꽂아서 끌려가!': { fr: 'Appuie sur Shift. C\'est le harpon. Plante-le et fonce!' },
  '작살로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아.': { fr: 'Tu es invincible pendant le harpon. Utilise-le quand c\'est dangereux.' },
  '못 하겠으면 때려. 안 죽으면 그만이야.': { fr: 'Si tu ne peux pas, frappe. Tant que tu survis.' },
  '됐어! 감 잡았구나.': { fr: 'Voil\u00e0! Tu commences \u00e0 comprendre.' },
  '유령쇠뇌야. 인사해.': { fr: 'C\'est l\'arbal\u00e8te fant\u00f4me. Dis bonjour.' },
  '빨간 탄을 무서워하지 마. 악의가 강하다.': { fr: 'N\'aie pas peur des projectiles rouges. La malice est puissante.' },
  '무지개빛은 패링 불가! 피해!': { fr: 'Les tirs arc-en-ciel sont imparables! Esquive!' },
  '피가 새고 있다. Shift. 빠져.': { fr: 'Tu saignes. Shift. D\u00e9gage.' },
  'Z. 필살기다. 아껴 써라.': { fr: 'Z. C\'est ton ultime. Utilise-le avec parcimonie.' },
  '가방 터지겠다! V 눌러서 창고에 넣어둬!': { fr: 'Ton sac va exploser! Appuie sur V pour ranger au coffre!' },
  '흥, 작살 못 맞추면 헛수고야.': { fr: 'Pff, si tu rates le harpon, c\'est du g\u00e2chis.' },
  '...말은 못해.': { fr: '...Il ne peut pas parler.' },
  '예쁘다고 만지면 죽어.': { fr: 'Touche \u00e7a parce que c\'est joli et tu meurs.' },
  '작살 던져! 끌려가면 무적이야!': { fr: 'Lance le harpon! Tu es invincible en glissant!' },
  '...마시든 말든. 네 목숨이니까.': { fr: '...Bois ou pas. C\'est ta vie.' },
  '...얼어붙은 놈은 오래 안 간다.': { fr: '...Les gel\u00e9s ne durent pas longtemps.' },
  '...힘을 골라라. 전부 가질 순 없다.': { fr: '...Choisis ton pouvoir. Tu ne peux pas tout avoir.' },
  '...버리기 아까운 건 창고에.': { fr: '...Ce qui est trop pr\u00e9cieux, mets-le au coffre.' },
  '...따라오는 거 아니야. 같은 방향일 뿐이지.': { fr: '...Je ne te suis pas. On va juste dans la m\u00eame direction.' },
  '공기가 달라졌어. 더 썩었군.': { fr: 'L\'air a chang\u00e9. Plus putride.' },
  '여기부터는 악마 영역이야. ...맘대로 해.': { fr: 'C\'est le territoire des d\u00e9mons ici. ...Fais comme tu veux.' },
  '...이 냄새. 살점이 썩는 냄새야.': { fr: '...Cette odeur. C\'est de la chair en d\u00e9composition.' },
  '여기 오래 있으면 미쳐. 나도, 너도.': { fr: 'Reste ici trop longtemps et tu perds la t\u00eate. Moi aussi.' },
  '이 길의 끝에 뭐가 있을까. ...알고 싶지도 않어.': { fr: 'Qu\'y a-t-il au bout de ce chemin... Je ne veux m\u00eame pas savoir.' },
  '...여기가 끝이야. 돌아갈 길은 없어.': { fr: '...C\'est la fin. Il n\'y a pas de retour.' },
};

const files = fs.readdirSync('.').filter(f => /^lang_[a-z]+\.js$/.test(f)).sort();

for (const f of files) {
  const lang = f.match(/lang_(.+)\.js/)[1];
  const content = fs.readFileSync(f, 'utf8');

  const toAdd = [];
  for (const [key, langMap] of Object.entries(translations)) {
    if (!langMap[lang]) continue;
    // Check if key already exists (exact match)
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const keyRegex = new RegExp("'" + escapedKey.replace(/'/g, "\\'") + "'\\s*:");
    if (keyRegex.test(content)) continue;

    const val = langMap[lang].replace(/'/g, "\\'");
    toAdd.push("'" + key + "':'" + val + "'");
  }

  if (toAdd.length === 0) continue;

  // Find end of main object
  const varMatch = content.match(/^const _[A-Z]+\s*=\s*\{/m);
  if (!varMatch) { console.log('SKIP ' + f); continue; }

  const mainStart = content.indexOf(varMatch[0]);
  let depth = 0;
  let mainEnd = -1;
  for (let i = mainStart + varMatch[0].length - 1; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') {
      depth--;
      if (depth === 0) { mainEnd = i; break; }
    }
  }

  if (mainEnd === -1) { console.log('SKIP ' + f); continue; }

  const insertion = '\n' + toAdd.join(',\n') + ',\n';
  const newContent = content.slice(0, mainEnd) + insertion + content.slice(mainEnd);

  fs.writeFileSync(f, newContent, 'utf8');
  console.log(f + ': +' + toAdd.length + ' keys');
}

console.log('\nDone!');
