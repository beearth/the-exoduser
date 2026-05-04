// CAT-82: Skill Info Panel labels (41개) → 26 lang files
'use strict';
const fs = require('fs');

// [ko, zh, ja, en]
// zht derived from zh via toTrad(); es/fr/de/ptbr/it/id/17others use en
const P = [
['스킬 정보','技能信息','スキル情報','Skill Info'],
['타입','类型','タイプ','Type'],
['미습득','未习得','未習得','Not Learned'],
['SP 비용','SP消耗','SPコスト','SP Cost'],
['악의 비용','恶意消耗','悪意コスト','Malice Cost'],
['쿨다운','冷却时间','クールダウン','Cooldown'],
['요구 레벨','需求等级','要求レベル','Req. Lv'],
['기본 참조뎀','基础参照伤害','基本参照ダメージ','Base Reference'],
['스탯 배율','属性倍率','ステータス倍率','Stat Mult'],
['패시브 배율','被动倍率','パッシブ倍率','Passive Mult'],
['레벨 배율','技能等级倍率','スキルLv倍率','Skill Lv Mult'],
['예상 평균 뎀','预计平均伤害','推定平均ダメージ','Estimated Avg DMG'],
['치명타','暴击','クリティカル','Critical'],
['치명타 확률','暴击率','クリティカル率','Crit Rate'],
['치명타 배율','暴击伤害','クリダメージ','Crit Dmg'],
['유효 배율','有效倍率','有効倍率','Effective Mult'],
['스킬 고유','技能特有','スキル固有','Skill Specific'],
['1타 배율','1段倍率','1段倍率','1-Hit Mult'],
['2타 배율','2段倍率','2段倍率','2-Hit Mult'],
['3타 배율','3段倍率','3段倍率','3-Hit Mult'],
['레벨당 뎀','每级伤害','Lv毎ダメージ','Per Lv DMG'],
['검기 거리','剑气距离','剣気射程','Crescent Range'],
['레벨당 거리','每级距离','Lv毎射程','Lv Range Bonus'],
['ST/틱','ST/跳','ST/ティック','ST/Tick'],
['레벨당 크기','每级大小','Lv毎サイズ','Per Lv Size'],
['넉백','击退','ノックバック','Knockback'],
['충전 시간','蓄力时间','チャージ時間','Charge Time'],
['레벨당 범위','每级范围','Lv毎範囲','Per Lv Range'],
['관통률','穿透率','貫通率','Pierce Rate'],
['지속뎀','持续伤害','DoT持続','DOT Duration'],
['무한','无限','無限','Infinite'],
['타격 형식','攻击形式','攻撃形式','AoE Type'],
['진동파','震动波','震動波','Shockwave'],
['스태거','硬直','スタッガー','Stagger'],
['높음','高','高','High'],
['스톡','储存数','ストック','Stocks'],
['기둥 수','柱数','柱数','Pillars'],
['지속','持续时间','持続時間','Duration'],
['반경','半径','半径','Radius'],
['슬로우','减速','スロー','Slow'],
['활','弓','弓','Bow'],
];

// Traditional Chinese conversion from Simplified
function toTrad(s) {
  const map = {'伤':'傷','动':'動','范':'範','传':'傳','发':'發','复':'復','无':'無',
    '锁':'鎖','链':'鏈','踪':'蹤','电':'電','冻':'凍','烧':'燒','选':'選',
    '击':'擊','连':'連','长':'長','强':'強','转':'轉','弹':'彈','触':'觸',
    '积':'積','减':'減','拦':'攔','换':'換','还':'還','环':'環','会':'會',
    '对':'對','开':'開','关':'關','战':'戰','闪':'閃','剑':'劍',
    '险':'險','来':'來','给':'給','时':'時','样':'樣','们':'們',
    '气':'氣','过':'過','这':'這','进':'進','带':'帶','号':'號','属':'屬',
    '场':'場','势':'勢','两':'兩','为':'為','产':'產','层':'層',
    '处':'處','从':'從','叠':'疊','后':'後','级':'級','扩':'擴',
    '储':'儲','数':'數','径':'徑','续':'續','预':'預','计':'計',
    '础':'礎','照':'照','热':'熱','旋':'旋','柱':'柱','缓':'緩',
    '蓄':'蓄','穿':'穿','效':'效','率':'率','弓':'弓',
    '间':'間','却':'卻','参':'參','离':'離','围':'圍',
    '维':'維','结':'結','缩':'縮','汇':'匯','迹':'跡'};
  return s.split('').map(c=>map[c]||c).join('');
}

// Lang file marker (value of '스테이지' key differs per lang)
const LANG_STAGE = {
  zh:'关卡', ja:'ステージ', zht:'關卡',
  es:'Fase', fr:'Étape', de:'Stufe', ptbr:'Fase', it:'Fase', id:'Tahap',
  ru:'Уровень', vi:'Giai đoạn', th:'ด่าน', tr:'Aşama', pl:'Etap',
  cs:'Fáze', hu:'Szakasz', bg:'Ниво', el:'Στάδιο', fi:'Vaihe',
  sv:'Nivå', da:'Niveau', no:'Nivå', nl:'Fase', ro:'Etapă',
  uk:'Рівень', ar:'المرحلة',
};

const HELL = 'G:/hell';

for (const [lang, stage] of Object.entries(LANG_STAGE)) {
  const file = `${HELL}/lang_${lang}.js`;
  let content = fs.readFileSync(file, 'utf8');

  const lines = [];
  for (const [ko, zh, ja, en] of P) {
    let val;
    if (lang === 'zh') val = zh;
    else if (lang === 'ja') val = ja;
    else if (lang === 'zht') val = toTrad(zh);
    else val = en;
    lines.push(`'${ko}':'${val}',`);
  }

  const marker = `'스테이지':'${stage}',`;
  if (!content.includes(marker)) {
    console.error(`[SKIP] ${lang}: marker not found`);
    continue;
  }
  // Avoid double-insert
  const firstKey = P[0][0];
  if (content.includes(`'${firstKey}':`)) {
    console.log(`[SKIP] ${lang}: already inserted`);
    continue;
  }

  const insert = `// --- CAT-82: skill panel labels ---\n` + lines.join('\n') + '\n';
  content = content.replace(marker, insert + marker);
  fs.writeFileSync(file, content, 'utf8');
  console.log(`[OK] ${lang} — ${P.length} entries`);
}
console.log('CAT-82 done.');
