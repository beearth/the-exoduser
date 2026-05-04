// SKILL_CATS + SKILL_HIER 탭 이름 11개 _EN 추가 + 26개 lang 전파
const fs = require('fs');
const BASE = 'G:/hell';

const NEW_EN = {
  // SKILL_CATS (7)
  '⚡ 이동스킬': '⚡ Movement',
  '⚔️ 물리': '⚔️ Physical',
  '🛡️ 방어': '🛡️ Defense',
  '🔮 마법': '🔮 Magic',
  '🏹 석궁/투사체': '🏹 Crossbow/Projectile',
  '⚙️ 영역': '⚙️ Domain',
  '💀 필살기': '💀 Ultimate',
  // SKILL_HIER (4)
  '⭐ 추천': '⭐ Recommend',
  '⚔ 공격': '⚔ Attack',
  '🛡 방어': '🛡 Defense',
  '⚙ 특수': '⚙ Special',
};

// 실제 번역 (zh, ja, zht)
const ZH = {
  '⚡ 이동스킬':'⚡ 移动技能','⚔️ 물리':'⚔️ 物理','🛡️ 방어':'🛡️ 防御',
  '🔮 마법':'🔮 魔法','🏹 석궁/투사체':'🏹 弩/飞射','⚙️ 영역':'⚙️ 领域',
  '💀 필살기':'💀 必杀技','⭐ 추천':'⭐ 推荐','⚔ 공격':'⚔ 攻击',
  '🛡 방어':'🛡 防御','⚙ 특수':'⚙ 特殊',
};
const JA = {
  '⚡ 이동스킬':'⚡ 移動スキル','⚔️ 물리':'⚔️ 物理','🛡️ 방어':'🛡️ 防御',
  '🔮 마법':'🔮 魔法','🏹 석궁/투사체':'🏹 弩/飛射','⚙️ 영역':'⚙️ 領域',
  '💀 필살기':'💀 必殺技','⭐ 추천':'⭐ おすすめ','⚔ 공격':'⚔ 攻撃',
  '🛡 방어':'🛡 防御','⚙ 특수':'⚙ 特殊',
};
const ZHT = {
  '⚡ 이동스킬':'⚡ 移動技能','⚔️ 물리':'⚔️ 物理','🛡️ 방어':'🛡️ 防禦',
  '🔮 마법':'🔮 魔法','🏹 석궁/투사체':'🏹 弩/飛射','⚙️ 영역':'⚙️ 領域',
  '💀 필살기':'💀 必殺技','⭐ 추천':'⭐ 推薦','⚔ 공격':'⚔ 攻擊',
  '🛡 방어':'🛡 防禦','⚙ 특수':'⚙ 特殊',
};

const LANG_MAP = {
  zh: ZH, ja: JA, zht: ZHT,
  // 나머지 23개: 영어 플레이스홀더
  es:'', ru:'', de:'', ptbr:'', fr:'', pl:'', it:'', uk:'', tr:'',
  vi:'', th:'', id:'', ar:'', sv:'', da:'', no:'', fi:'', cs:'',
  hu:'', ro:'', nl:'', el:'', bg:'',
};

const LANGS = [
  {code:'zh',up:'ZH',tbl:ZH},{code:'ja',up:'JA',tbl:JA},{code:'es',up:'ES',tbl:null},
  {code:'zht',up:'ZHT',tbl:ZHT},{code:'ru',up:'RU',tbl:null},{code:'de',up:'DE',tbl:null},
  {code:'ptbr',up:'PTBR',tbl:null},{code:'fr',up:'FR',tbl:null},{code:'pl',up:'PL',tbl:null},
  {code:'it',up:'IT',tbl:null},{code:'uk',up:'UK',tbl:null},{code:'tr',up:'TR',tbl:null},
  {code:'vi',up:'VI',tbl:null},{code:'th',up:'TH',tbl:null},{code:'id',up:'ID',tbl:null},
  {code:'ar',up:'AR',tbl:null},{code:'sv',up:'SV',tbl:null},{code:'da',up:'DA',tbl:null},
  {code:'no',up:'NO',tbl:null},{code:'fi',up:'FI',tbl:null},{code:'cs',up:'CS',tbl:null},
  {code:'hu',up:'HU',tbl:null},{code:'ro',up:'RO',tbl:null},{code:'nl',up:'NL',tbl:null},
  {code:'el',up:'EL',tbl:null},{code:'bg',up:'BG',tbl:null},
];

function buildEntries(tbl) {
  return Object.entries(NEW_EN).map(([ko, en]) => {
    const val = tbl ? (tbl[ko] || en) : en;
    return `'${ko}':'${val}'`;
  }).join(',\n');
}

// ── game.html _EN에 추가 ────────────────────────────────────────────────────
let html = fs.readFileSync(`${BASE}/game.html`, 'utf8');
const EN_ENTRIES = buildEntries(null); // English values
const EN_MARKER = `'스테이지':'Stage'`;
if (!html.includes(EN_MARKER)) {
  console.warn('_EN marker not found!');
} else {
  html = html.replace(EN_MARKER, EN_MARKER + ',\n' + EN_ENTRIES);
  fs.writeFileSync(`${BASE}/game.html`, html);
  console.log('game.html _EN 업데이트 완료 (+11)');
}

// ── 26개 lang 파일 업데이트 ────────────────────────────────────────────────
for (const {code, up, tbl} of LANGS) {
  const file = `${BASE}/lang_${code}.js`;
  if (!fs.existsSync(file)) { console.warn(`${file} 없음`); continue; }
  let src = fs.readFileSync(file, 'utf8');
  // 각 lang 파일의 '스테이지' 키는 값이 다르므로 키 부분만 찾기
  const stageMatch = src.match(/'스테이지':'[^']*'/);
  if (!stageMatch) { console.warn(`${code}: marker not found`); continue; }
  const marker = stageMatch[0];
  const entries = buildEntries(tbl);
  src = src.replace(marker, marker + ',\n' + entries);
  fs.writeFileSync(file, src);
  console.log(`${code}: +11 완료`);
}

console.log('\n전파 완료');
