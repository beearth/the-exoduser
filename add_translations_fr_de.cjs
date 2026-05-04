const fs = require('fs');
const BASE = 'G:/hell';

// ────────────────────────────────────────────────
// FRENCH TRANSLATIONS
// ────────────────────────────────────────────────
const TRANS_FR = {
  // --- Passive names (currently English placeholders) ---
  '⚔️ 맹공': '⚔️ Assaut',
  '🔱 돌파': '🔱 Percée',
  '⚡ 반격': '⚡ Riposte',
  '🔮 마력폭주': '🔮 Débordement de Mana',
  '🎯 정밀사격': '🎯 Tir de Précision',
  '🛡 수호신': '🛡 Égide Divine',
  '💚 회복력': '💚 Régénération',
  '💥 급소': '💥 Coup Critique',
  '🎁 약탈': '🎁 Pillage',
  '🔱 관통': '🔱 Perçage',
  '💠 마력회복': '💠 Récupération de Mana',
  '🏹 쇠뇌력': '🏹 Maîtrise Arbalète',
  '⚔ 광전사': '⚔ Berserker',
  '🎯 추적자': '🎯 Traqueur',
  '🗡 물리관통': '🗡 Pénétration Physique',
  '🔮 마법관통': '🔮 Pénétration Magique',
  '🌿 풍요': '🌿 Abondance',
  '🐺 약자포식': '🐺 Prédateur',
  '☠ 침식': '☠ Corrosion',
  '💎 마력그릇': '💎 Réservoir de Mana',
  '💪 힘의그릇': '💪 Réservoir d\'Endurance',
  '👿 악의중독': '👿 Intoxication à la Malice',
  '❤️ 강인': '❤️ Robustesse',
  '🛡 철벽': '🛡 Mur de Fer',
  '🎯 사냥꾼': '🎯 Chasseur',
  '✦ 인간성': '✦ Humanité',
  '☠ 악마성': '☠ Démon',
  // --- Recommended builds ---
  '1. 악의폭풍': '1. Tempête de Malice',
  '2. 칼날 계열': '2. Compétences Lame',
  '3. 역병 확장': '3. Extension Peste',
  '4. 이동스킬 마스터': '4. Maître Déplacement',
  '5. 사슬 확장': '5. Extension Chaîne',
  '6. 💀 필살기 선택': '6. 💀 Choix Final',
  '7. 멸살+만화+원소+전격이동': '7. Rayon+Barrage+Élém+Flash',
  '8. 회전참+기폭+대왕': '8. Tourbillon+Déton+Titan',
  '9. 방패 합체': '9. Fusion Bouclier',
  '10. 해골무덤+악의폭풍': '10. Ossuaire+Tempête Malice',
  '11. 폭풍소환+얼음보주': '11. Tempête+Orbe Glace',
  '12. 뇌전걸음': '12. Marche Fantôme',
  '13. 신성 영역': '13. Domaine Sacré',
  '14. 6단합체: 폭풍빔': '14. Fusion×6: Rayon Tempête',
  '15. 신성+빙결': '15. Sacré+Glace',
  '16. 암흑+가시+대왕2': '16. Ténèbres+Épines+Titan2',
  '17. 사슬 최종': '17. Chaîne Finale',
  // --- Skill category tabs ---
  '⚡ 이동스킬': '⚡ Déplacement',
  '⚔️ 물리': '⚔️ Physique',
  '🛡️ 방어': '🛡️ Défense',
  '🔮 마법': '🔮 Magie',
  '🏹 석궁/투사체': '🏹 Arbalète/Projectile',
  '⚙️ 영역': '⚙️ Domaine',
  '💀 필살기': '💀 Final',
  '⭐ 추천': '⭐ Recommandé',
  '⚔ 공격': '⚔ Attaque',
  '🛡 방어': '🛡 Défense',
  '⚙ 특수': '⚙ Spécial',
  // --- Siege scarecrow ---
  '👻 공성허수아비!': '👻 Épouvantail de Siège !',
  '💥 공성허수아비 폭발!': '💥 Explosion Épouvantail !',
  // --- BGM chapter labels (English placeholders) ---
  '── 1장 - 썩은 숲 ──': '── CH1 - Forêt Putride ──',
  '── 2장 - 벌레굴 ──': '── CH2 - Nid de Vers ──',
  '── 3장 - 얼음굴 ──': '── CH3 - Caverne de Glace ──',
  '── 4장 - 화염지대 ──': '── CH4 - Terres Infernales ──',
  '── 5장 - 지옥군단 ──': '── CH5 - Légion Infernale ──',
  '── 6장 - 사도마굴 ──': '── CH6 - Antre de l\'Apôtre ──',
  '── 7장 - 지옥성 ──': '── CH7 - Citadelle Infernale ──',
  '── 공통 ──': '── Commun ──',
  // --- Combat / UI messages still in English ---
  '임계...!': 'Critique...!',
};

// ────────────────────────────────────────────────
// GERMAN TRANSLATIONS
// ────────────────────────────────────────────────
const TRANS_DE = {
  // --- Passive names (currently English placeholders) ---
  '⚔️ 맹공': '⚔️ Ansturm',
  '🔱 돌파': '🔱 Durchbruch',
  '⚡ 반격': '⚡ Vergeltung',
  '🔮 마력폭주': '🔮 Manaüberfluss',
  '🎯 정밀사격': '🎯 Präzisionsschuss',
  '🛡 수호신': '🛡 Göttliche Ägide',
  '💚 회복력': '💚 Regeneration',
  '💥 급소': '💥 Kritischer Treffer',
  '🎁 약탈': '🎁 Plünderung',
  '🔱 관통': '🔱 Durchdringung',
  '💠 마력회복': '💠 Mana-Erholung',
  '🏹 쇠뇌력': '🏹 Armbrustmeisterschaft',
  '⚔ 광전사': '⚔ Berserker',
  '🎯 추적자': '🎯 Verfolger',
  '🗡 물리관통': '🗡 Physische Durchdringung',
  '🔮 마법관통': '🔮 Magische Durchdringung',
  '🌿 풍요': '🌿 Fülle',
  '🐺 약자포식': '🐺 Räuber',
  '☠ 침식': '☠ Korrosion',
  '💎 마력그릇': '💎 Mana-Reservoir',
  '💪 힘의그릇': '💪 Ausdauer-Reservoir',
  '👿 악의중독': '👿 Bosheitsvergiftung',
  '❤️ 강인': '❤️ Robustheit',
  '🛡 철벽': '🛡 Eiserne Mauer',
  '🎯 사냥꾼': '🎯 Jäger',
  '✦ 인간성': '✦ Menschlichkeit',
  '☠ 악마성': '☠ Dämon',
  // --- Recommended builds ---
  '1. 악의폭풍': '1. Bosheitssturm',
  '2. 칼날 계열': '2. Klingen-Skills',
  '3. 역병 확장': '3. Seuchen-Ausbau',
  '4. 이동스킬 마스터': '4. Bewegungsmeister',
  '5. 사슬 확장': '5. Ketten-Ausbau',
  '6. 💀 필살기 선택': '6. 💀 Ultimativ-Wahl',
  '7. 멸살+만화+원소+전격이동': '7. Strahl+Nadel+Elem+Blitz',
  '8. 회전참+기폭+대왕': '8. Wirbel+Detonation+Titan',
  '9. 방패 합체': '9. Schild-Fusion',
  '10. 해골무덤+악의폭풍': '10. Knochen+Bosheitssturm',
  '11. 폭풍소환+얼음보주': '11. Sturm+Eiskugel',
  '12. 뇌전걸음': '12. Geisterschritt',
  '13. 신성 영역': '13. Heilige Domäne',
  '14. 6단합체: 폭풍빔': '14. Fusion×6: Sturmstrahl',
  '15. 신성+빙결': '15. Sakral+Frost',
  '16. 암흑+가시+대왕2': '16. Finsternis+Dornen+Titan2',
  '17. 사슬 최종': '17. Ketten-Finale',
  // --- Skill category tabs ---
  '⚡ 이동스킬': '⚡ Bewegung',
  '⚔️ 물리': '⚔️ Physisch',
  '🛡️ 방어': '🛡️ Verteidigung',
  '🔮 마법': '🔮 Magie',
  '🏹 석궁/투사체': '🏹 Armbrust/Projektil',
  '⚙️ 영역': '⚙️ Domäne',
  '💀 필살기': '💀 Ultimativ',
  '⭐ 추천': '⭐ Empfohlen',
  '⚔ 공격': '⚔ Angriff',
  '🛡 방어': '🛡 Verteidigung',
  '⚙ 특수': '⚙ Spezial',
  // --- Siege scarecrow ---
  '👻 공성허수아비!': '👻 Belagerungs-Vogelscheuche!',
  '💥 공성허수아비 폭발!': '💥 Vogelscheuchen-Explosion!',
  // --- BGM chapter labels ---
  '── 1장 - 썩은 숲 ──': '── Kap. 1 - Fauliger Wald ──',
  '── 2장 - 벌레굴 ──': '── Kap. 2 - Wurmnest ──',
  '── 3장 - 얼음굴 ──': '── Kap. 3 - Eishöhle ──',
  '── 4장 - 화염지대 ──': '── Kap. 4 - Flammenöde ──',
  '── 5장 - 지옥군단 ──': '── Kap. 5 - Höllenlegion ──',
  '── 6장 - 사도마굴 ──': '── Kap. 6 - Schlund des Apostels ──',
  '── 7장 - 지옥성 ──': '── Kap. 7 - Höllenfeste ──',
  '── 공통 ──': '── Allgemein ──',
  // --- Combat / UI messages still in English ---
  '임계...!': 'Kritisch...!',
};

// ────────────────────────────────────────────────
// Apply
// ────────────────────────────────────────────────
function applyTranslations(code, trans) {
  const file = `${BASE}/lang_${code}.js`;
  let src = fs.readFileSync(file, 'utf8');
  let count = 0;
  for (const [ko, translated] of Object.entries(trans)) {
    // Escape special regex chars in the key
    const escapedKey = ko.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match: 'key':'anything' — replace anything with translated
    const regex = new RegExp(
      `('${escapedKey}'):'[^']*'`,
      'g'
    );
    const before = src;
    src = src.replace(regex, `$1:'${translated.replace(/'/g, "\\'")}'`);
    if (src !== before) count++;
  }
  fs.writeFileSync(file, src, 'utf8');
  console.log(`${code.toUpperCase()}: ${count}개 항목 번역 적용`);
}

applyTranslations('fr', TRANS_FR);
applyTranslations('de', TRANS_DE);
console.log('완료');
