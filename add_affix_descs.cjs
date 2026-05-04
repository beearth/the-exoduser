// CAT-83: _AFFIX_DESC 235개 어픽스 설명 레이블 → _EN + 26 lang files
'use strict';
const fs = require('fs');

// [ko, zh, ja, en]
// zh = Simplified Chinese, ja = Japanese, zht derived via toTrad(zh)
// all other 23 langs use en value
const P = [
// ── DoT / 원소 상태이상 ──
['독 DoT','毒DoT','毒DoT','Poison DoT'],
['화상 DoT','火焰DoT','炎DoT','Fire DoT'],
['빙결 DoT+감속','冰冻DoT+减速','氷DoT+スロー','Ice DoT+Slow'],
['연쇄전격','连锁雷击','連鎖雷撃','Chain Lightning'],
['저주(힐차단)','诅咒(阻愈)','呪い(回復遮断)','Curse(Heal Block)'],

// ── 공격 기본 ──
['방어무시','无视防御','防御無視','Armor Ignore'],
['치명타율','暴击率','クリ率','Crit Rate'],
['스태거+','硬直+','スタッガー+','Stagger+'],
['체인타겟+','链式目标+','チェーンターゲット+','Chain Target+'],
['처치 후 뎀+','击杀后伤害+','キル後ダメ+','Kill DMG+'],
['크리폭발(ATK×)','暴击爆炸(ATK×)','クリ爆発(ATK×)','Crit Explode(ATK×)'],
['원소뎀+','元素伤害+','元素ダメ+','Elem DMG+'],
['공격속도+','攻速+','攻速+','Atk Spd+'],
['패리보너스+','弹反奖励+','パリィボーナス+','Parry Bonus+'],
['추적콤보+10','追踪连击+10','追跡コンボ+10','Track Combo+10'],
['작살뎀+','鱼叉伤害+','ハープーンダメ+','Harpoon DMG+'],
['스킬뎀+','技能伤害+','スキルダメ+','Skill DMG+'],
['쿨다운-','冷却时间-','CD-','CD-'],
['방어력+','防御力+','防御力+','DEF+'],
['쉴드+','护盾+','シールド+','Shield+'],
['이동속도+','移动速度+','移速+','Move Spd+'],
['크리확률+','暴击率+','クリ率+','Crit Rate+'],
['크리배율+','暴击倍率+','クリ倍率+','Crit Dmg+'],

// ── 저항/DR ──
['화염저항','火焰抗性','火炎耐性','Fire Res'],
['빙결저항','冰冻抗性','氷結耐性','Ice Res'],
['암전저항','雷电抗性','雷電耐性','Lightning Res'],
['암흑저항','暗黑抗性','暗黒耐性','Dark Res'],
['독저항','毒素抗性','毒耐性','Poison Res'],
['전원소저항','全元素抗性','全属性耐性','All Elem Res'],
['물리DR','物理DR','物理DR','Phys DR'],
['반사%','反射%','反射%','Reflect%'],
['가시뎀','荆棘伤害','棘ダメ','Thorns DMG'],
['배리어','护障','バリア','Barrier'],
['CC저항','CC抗性','CC耐性','CC Resist'],

// ── 특수 방어 ──
['위기뎀+','危机伤害+','クライシスダメ+','Crisis DMG+'],
['피격반격','受击反击','被弾反撃','Hit Counter'],
['패링폭발(ATK×)','弹反爆炸(ATK×)','パリィ爆発(ATK×)','Parry Burst(ATK×)'],
['체간파괴뎀+','体干破坏伤害+','体幹破壊ダメ+','Poise Break DMG+'],
['원소전환','元素转换','元素転換','Elem Convert'],
['상태이상해제','状态解除','状態解除','Status Clear'],
['불굴(1회생존)','不屈(存活1次)','不屈(1回生存)','Tenacity(Survive×1)'],
['부활(HP회복)','复活(HP回复)','復活(HP回復)','Revive(HP Restore)'],

// ── 드롭/자원 ──
['드롭률+','掉落率+','ドロップ率+','Drop Rate+'],
['경험치+','经验值+','EXP+','EXP+'],
['골드+','金币+','ゴールド+','Gold+'],
['포션회복+','药水回复+','ポーション回復+','Potion Heal+'],
['사슬게이지+','锁链槽+','チェーンゲージ+','Chain Gauge+'],
['부활억제','抑制复活','復活抑制','Anti-Revive'],
['부활력+','复活力+','復活力+','Revival Pow+'],
['부활쿨-','复活CD-','復活CD-','Revival CD-'],

// ── HP/MP ──
['최대HP%+','最大HP%+','最大HP%+','Max HP%+'],
['HP리젠+','HP回复+','HP回復+','HP Regen+'],
['회복력+','治愈力+','回復力+','Heal Pow+'],
['마법뎀+','魔法伤害+','魔法ダメ+','Magic DMG+'],
['MP소비-','MP消耗-','MP消費-','MP Cost-'],

// ── 화염 계열 ──
['화염뎀%+','火焰伤害%+','火炎ダメ%+','Fire DMG%+'],
['화염관통%','火焰穿透%','火炎貫通%','Fire Pen%'],
['적중화상','命中燃烧','命中炎上','On-Hit Burn'],
['크리화폭','暴击火爆','クリ火爆','Crit Fire Burst'],
['화상지속+','燃烧持续+','炎上継続+','Burn Duration+'],
['화염뎀보너스','火焰伤害加成','火炎ダメボーナス','Fire DMG Bonus'],

// ── 빙결 계열 ──
['빙결뎀%+','冰冻伤害%+','氷結ダメ%+','Ice DMG%+'],
['빙결관통%','冰冻穿透%','氷結貫通%','Ice Pen%'],
['적중빙결','命中冰冻','命中氷結','On-Hit Freeze'],
['크리빙폭','暴击冰爆','クリ氷爆','Crit Ice Burst'],
['빙결지속+','冰冻持续+','氷結継続+','Freeze Duration+'],
['빙결뎀보너스','冰冻伤害加成','氷結ダメボーナス','Ice DMG Bonus'],

// ── 뇌전 계열 ──
['뇌전뎀%+','雷电伤害%+','雷電ダメ%+','Lightning DMG%+'],
['뇌전관통%','雷电穿透%','雷電貫通%','Lightning Pen%'],
['적중감전','命中感电','命中感電','On-Hit Shock'],
['크리뇌폭','暴击雷爆','クリ雷爆','Crit Lightning Burst'],
['감전지속+','感电持续+','感電継続+','Shock Duration+'],
['뇌전뎀보너스','雷电伤害加成','雷電ダメボーナス','Lightning DMG Bonus'],

// ── 암흑 계열 ──
['암흑뎀%+','暗黑伤害%+','暗黒ダメ%+','Dark DMG%+'],
['암흑관통%','暗黑穿透%','暗黒貫通%','Dark Pen%'],
['적중저주','命中诅咒','命中呪い','On-Hit Curse'],
['크리암폭','暴击暗爆','クリ暗爆','Crit Dark Burst'],
['저주지속+','诅咒持续+','呪い継続+','Curse Duration+'],
['암흑뎀보너스','暗黑伤害加成','暗黒ダメボーナス','Dark DMG Bonus'],

// ── 독 계열 ──
['독뎀%+','毒素伤害%+','毒ダメ%+','Poison DMG%+'],
['독관통%','毒素穿透%','毒貫通%','Poison Pen%'],
['적중중독','命中中毒','命中中毒','On-Hit Poison'],
['크리독폭','暴击毒爆','クリ毒爆','Crit Poison Burst'],
['독지속+','毒素持续+','毒継続+','Poison Duration+'],
['독뎀보너스','毒素伤害加成','毒ダメボーナス','Poison DMG Bonus'],

// ── 데미지 타입별 ──
['근접뎀%+','近战伤害%+','近接ダメ%+','Melee DMG%+'],
['원거리뎀%+','远程伤害%+','遠距離ダメ%+','Ranged DMG%+'],
['마법뎀%+','魔法伤害%+','魔法ダメ%+','Magic DMG%+'],
['빔뎀%+','光束伤害%+','ビームダメ%+','Beam DMG%+'],
['DoT뎀%+','DoT伤害%+','DoTダメ%+','DoT DMG%+'],
['투사체뎀%+','投射物伤害%+','投射物ダメ%+','Proj DMG%+'],
['범위반경+','范围半径+','AoE半径+','AoE Radius+'],

// ── 크리 특화 ──
['근접크리+','近战暴击+','近接クリ+','Melee Crit+'],
['마법크리+','魔法暴击+','魔法クリ+','Magic Crit+'],
['석궁크리+','弩暴击+','クロスボウクリ+','Xbow Crit+'],
['근접공속+','近战攻速+','近接攻速+','Melee Spd+'],
['석궁공속+','弩攻速+','クロスボウ攻速+','Xbow Spd+'],
['시전속도+','施法速度+','詠唱速度+','Cast Spd+'],
['전속성관통','全属性穿透','全属性貫通','All Elem Pen'],
['쉴드관통','护盾穿透','シールド貫通','Shield Pen'],
['방어력깎기','削减防御','防御力削減','Armor Shred'],
['투사체속도+','投射物速度+','投射物速度+','Proj Speed+'],

// ── 적중 프록 ──
['적중시화구','命中时火球','命中時火球','On-Hit Fireball'],
['적중시연쇄뇌격','命中时连锁雷击','命中時連鎖雷撃','On-Hit Chain Lightning'],
['적중빙결%','命中冰冻%','命中氷結%','On-Hit Freeze%'],
['적중스턴%','命中眩晕%','命中スタン%','On-Hit Stun%'],
['적중중독%','命中中毒%','命中中毒%','On-Hit Poison%'],
['적중출혈%','命中出血%','命中出血%','On-Hit Bleed%'],
['적중약화%','命中虚弱%','命中弱化%','On-Hit Weaken%'],
['적중감속%','命中减速%','命中スロー%','On-Hit Slow%'],
['적중표적%','命中标记%','命中マーク%','On-Hit Mark%'],

// ── 크리 프록 ──
['크리폭발(HP%)','暴击爆炸(HP%)','クリ爆発(HP%)','Crit Explode(HP%)'],
['크리연쇄(HP%)','暴击连锁(HP%)','クリ連鎖(HP%)','Crit Chain(HP%)'],
['크리빙결%','暴击冰冻%','クリ氷結%','Crit Freeze%'],
['크리HP+','暴击HP+','クリHP+','Crit HP+'],
['크리MP+','暴击MP+','クリMP+','Crit MP+'],
['크리쉴드+','暴击护盾+','クリシールド+','Crit Shield+'],

// ── 반응 트리거 ──
['피격방어+','受击防御+','被弾防御+','Hit DEF+'],
['반격가시','反击荆棘','反撃棘','Counter Thorns'],
['빙결파동%','冰冻波动%','氷結波動%','Ice Nova%'],
['자동암흑막','自动暗黑幕','自動暗黒膜','Auto Dark Shield'],
['주기치유','定期治愈','定期回復','Periodic Heal'],
['시체폭발%','尸体爆炸%','死体爆発%','Corpse Explode%'],
['회피뎀+','闪避伤害+','回避ダメ+','Dodge DMG+'],
['패링폭발%','弹反爆炸%','パリィ爆発%','Parry Burst%'],
['블록HP+','格挡HP+','ブロックHP+','Block HP+'],
['블록MP+','格挡MP+','ブロックMP+','Block MP+'],

// ── 스킬별 뎀 ──
['회전참뎀+','旋转斩伤害+','回転斬ダメ+','Whirlwind DMG+'],
['옴니빔뎀+','全向光束伤害+','オムニビームダメ+','Omni Beam DMG+'],
['화구뎀+','火球伤害+','火球ダメ+','Fireball DMG+'],
['미사일뎀+','导弹伤害+','ミサイルダメ+','Missile DMG+'],
['청탄뎀+','青弹伤害+','青弾ダメ+','Blue Shot DMG+'],
['폭렬탄뎀+','爆裂弹伤害+','爆裂弾ダメ+','Blast Shot DMG+'],
['지옥광선뎀+','地狱光线伤害+','地獄光線ダメ+','Hell Ray DMG+'],
['악의폭풍뎀+','恶意风暴伤害+','悪意嵐ダメ+','Malice Storm DMG+'],
['연쇄참뎀+','连锁斩伤害+','連鎖斬ダメ+','Chain Slash DMG+'],
['거인강타뎀+','巨人强击伤害+','巨人強打ダメ+','Giant Slam DMG+'],
['유령보행뎀+','幽灵行走伤害+','幽霊歩行ダメ+','Ghost Walk DMG+'],
['악의박격뎀+','恶意迫击伤害+','悪意迫撃ダメ+','Malice Mortar DMG+'],
['화염오라뎀+','火焰光环伤害+','火炎オーラダメ+','Fire Aura DMG+'],
['빙구뎀+','冰宝珠伤害+','氷球ダメ+','Ice Orb DMG+'],
['화염빔뎀+','火焰光束伤害+','火炎ビームダメ+','Fire Beam DMG+'],
['악의사냥뎀+','恶意追猎伤害+','悪意狩りダメ+','Malice Hunt DMG+'],
['암흑기둥뎀+','暗黑柱伤害+','暗黒柱ダメ+','Dark Pillar DMG+'],
['역병뎀+','瘟疫伤害+','疫病ダメ+','Plague DMG+'],
['가시오라뎀+','荆棘光环伤害+','棘オーラダメ+','Spike Aura DMG+'],
['연쇄돌격뎀+','连锁突击伤害+','連鎖突撃ダメ+','Chain Assault DMG+'],

// ── 이동/방어 ──
['회피확률+','闪避率+','回避率+','Dodge Rate+'],
['회피쿨-','闪避CD-','回避CD-','Dodge CD-'],
['쉴드%+','护盾%+','シールド%+','Shield%+'],
['쉴드리젠%+','护盾回复%+','シールド回復%+','Shield Regen%+'],
['쉴드쿨-','护盾CD-','シールドCD-','Shield CD-'],
['HP리젠%+','HP回复%+','HP回復%+','HP Regen%+'],
['ST리젠+','ST回复+','ST回復+','ST Regen+'],
['ST리젠%+','ST回复%+','ST回復%+','ST Regen%+'],
['MP리젠+','MP回复+','MP回復+','MP Regen+'],
['MP리젠%+','MP回复%+','MP回復%+','MP Regen%+'],

// ── 원소 DR ──
['화염DR','火焰DR','火炎DR','Fire DR'],
['빙결DR','冰冻DR','氷結DR','Ice DR'],
['뇌전DR','雷电DR','雷電DR','Lightning DR'],
['암흑DR','暗黑DR','暗黒DR','Dark DR'],
['독DR','毒素DR','毒DR','Poison DR'],
['전체DR','全体DR','全体DR','All DR'],
['엘리트DR','精英DR','エリートDR','Elite DR'],

// ── 상태이상 저항 ──
['스턴저항','眩晕抗性','スタン耐性','Stun Res'],
['감속저항','减速抗性','スロー耐性','Slow Res'],
['넉백저항','击退抗性','ノックバック耐性','KB Res'],

// ── 이동/습득 ──
['돌진거리+','冲刺距离+','ダッシュ距離+','Dash Range+'],
['돌진쿨-','冲刺CD-','ダッシュCD-','Dash CD-'],
['전투이속+','战斗移速+','戦闘移速+','Combat MSpd+'],
['비전투이속+','非战斗移速+','非戦闘移速+','Out-Combat MSpd+'],
['습득범위+','拾取范围+','拾得範囲+','Pickup Range+'],

// ── 스탯 ──
['전스탯+','全属性+','全スタット+','All Stats+'],
['적중자원+','命中资源+','命中リソース+','On-Hit Resource+'],

// ── 최대저항 ──
['화염최대저항+','火焰最大抗性+','火炎最大耐性+','Fire Max Res+'],
['빙결최대저항+','冰冻最大抗性+','氷結最大耐性+','Ice Max Res+'],
['뇌전최대저항+','雷电最大抗性+','雷電最大耐性+','Lightning Max Res+'],
['암흑최대저항+','暗黑最大抗性+','暗黒最大耐性+','Dark Max Res+'],
['독최대저항+','毒素最大抗性+','毒最大耐性+','Poison Max Res+'],

// ── 유틸/특수 ──
['스킬쿨-','技能CD-','スキルCD-','Skill CD-'],
['물약쿨-','药水CD-','ポーションCD-','Potion CD-'],
['강화성공+','强化成功+','強化成功+','Craft Rate+'],
['악의획득+','恶意获取+','悪意獲得+','Malice Gain+'],
['악마화뎀+','恶魔化伤害+','悪魔化ダメ+','Demon DMG+'],
['악마화DR','恶魔化DR','悪魔化DR','Demon DR'],
['영혼수확+','灵魂收割+','魂収穫+','Soul Harvest+'],
['생명흡혈%','生命吸血%','生命吸血%','Life Leech%'],
['과치유→쉴드','过量治愈→护盾','超回復→シールド','Overheal→Shield'],
['만마나뎀+','满蓝伤害+','マナ満タンダメ+','Full MP DMG+'],
['이동DR','移动DR','移動DR','Move DR'],
['정지뎀+','静止伤害+','静止ダメ+','Stationary DMG+'],
['회피후뎀+','闪避后伤害+','回避後ダメ+','After Dodge DMG+'],
['패링쉴드+','弹反护盾+','パリィシールド+','Parry Shield+'],
['콤보보너스+','连击奖励+','コンボボーナス+','Combo Bonus+'],

// ── 조건부 뎀 ──
['HP≥70%뎀+','HP≥70%伤害+','HP≥70%ダメ+','HP≥70% DMG+'],
['적HP≤30%뎀+','敌HP≤30%伤害+','敵HP≤30%ダメ+','Foe HP≤30% DMG+'],
['HP100%뎀+','HP100%伤害+','HP100%ダメ+','HP100% DMG+'],
['HP≤35%뎀+','HP≤35%伤害+','HP≤35%ダメ+','HP≤35% DMG+'],
['적HP≤20%뎀+','敌HP≤20%伤害+','敵HP≤20%ダメ+','Foe HP≤20% DMG+'],
['근접뎀+','近战伤害+','近接ダメ+','Melee DMG+'],
['원거리뎀+','远程伤害+','遠距離ダメ+','Ranged DMG+'],

// ── 적 상태별 뎀 ──
['스턴적뎀+','对眩晕敌伤害+','スタン敵ダメ+','vs Stunned DMG+'],
['빙결적뎀+','对冰冻敌伤害+','氷結敵ダメ+','vs Frozen DMG+'],
['화상적뎀+','对燃烧敌伤害+','炎上敵ダメ+','vs Burning DMG+'],
['중독적뎀+','对中毒敌伤害+','中毒敵ダメ+','vs Poisoned DMG+'],
['저주적뎀+','对诅咒敌伤害+','呪い敵ダメ+','vs Cursed DMG+'],
['감속적뎀+','对减速敌伤害+','スロー敵ダメ+','vs Slowed DMG+'],
['보스뎀+','Boss伤害+','Bossダメ+','Boss DMG+'],
['엘리트뎀+','精英伤害+','エリートダメ+','Elite DMG+'],
['일반몹뎀+','普通怪伤害+','通常モブダメ+','Mob DMG+'],
['선제뎀+','先制伤害+','先制ダメ+','First Strike DMG+'],

// ── 흡혈/회복 ──
['물리흡혈%','物理吸血%','物理吸血%','Phys Leech%'],
['마나흡수%','魔力吸收%','マナ吸収%','Mana Leech%'],
['ST흡수%','ST吸收%','ST吸収%','ST Leech%'],
['적중HP+','命中HP+','命中HP+','On-Hit HP+'],
['처치HP+','击杀HP+','キルHP+','On-Kill HP+'],
['처치MP+','击杀MP+','キルMP+','On-Kill MP+'],
['처치ST+','击杀ST+','キルST+','On-Kill ST+'],
['처치시폭발','击杀时爆炸','キル時爆発','On-Kill Explode'],
['처치이속+','击杀移速+','キル移速+','On-Kill MSpd+'],

// ── 조건부 방어 ──
['HP≥70%방어+','HP≥70%防御+','HP≥70%防御+','HP≥70% DEF+'],
['HP≤50%이속+','HP≤50%移速+','HP≤50%移速+','HP≤50% MSpd+'],
['DoT피해감소','DoT减伤','DoTダメ軽減','DoT DMG Reduce'],
['보스피해감소','Boss减伤','Bossダメ軽減','Boss DMG Reduce'],
['근접피해감소','近战减伤','近接ダメ軽減','Melee DMG Reduce'],
['원거리피해감소','远程减伤','遠距離ダメ軽減','Ranged DMG Reduce'],
['처치HP회복','击杀HP回复','キルHP回復','On-Kill HP Restore'],
['처치쉴드회복','击杀护盾回复','キルシールド回復','On-Kill Shield Restore'],
['ST소비-','ST消耗-','ST消費-','ST Cost-'],

// ── 조건부 공격 ──
['HP≥70%공격+','HP≥70%攻击+','HP≥70%攻撃+','HP≥70% ATK+'],
['HP≤35%흡혈','HP≤35%吸血','HP≤35%吸血','HP≤35% Leech'],
['보스추가뎀','Boss追加伤害','Bossボーナスダメ','vs Boss DMG+'],
['엘리트추가뎀','精英追加伤害','エリートボーナスダメ','vs Elite DMG+'],
['공격력+','攻击力+','攻撃力+','ATK+'],
['크리뎀+','暴击伤害+','クリダメ+','Crit DMG+'],
];

// Traditional Chinese conversion
function toTrad(s) {
  const map = {
    '伤':'傷','动':'動','范':'範','传':'傳','发':'發','复':'復','无':'無',
    '锁':'鎖','链':'鏈','踪':'蹤','电':'電','冻':'凍','烧':'燒','选':'選',
    '击':'擊','连':'連','长':'長','强':'強','转':'轉','弹':'彈','触':'觸',
    '积':'積','减':'減','拦':'攔','换':'換','还':'還','环':'環','会':'會',
    '对':'對','开':'開','关':'關','战':'戰','闪':'閃','剑':'劍',
    '险':'險','来':'來','给':'給','时':'時','样':'樣','们':'們',
    '气':'氣','过':'過','这':'這','进':'進','带':'帶','号':'號','属':'屬',
    '场':'場','势':'勢','两':'兩','为':'為','产':'產','层':'層',
    '处':'處','从':'從','叠':'疊','后':'後','级':'級','扩':'擴',
    '储':'儲','数':'數','径':'徑','续':'續','预':'預','计':'計',
    '间':'間','却':'卻','参':'參','离':'離','围':'圍','础':'礎',
    '类':'類','习':'習','恶':'惡','识':'識','资':'資','讯':'訊',
    '态':'態','见':'見','变':'變','题':'題','实':'實','验':'驗',
    '历':'歷','录':'錄','设':'設','备':'備','认':'認','证':'證',
    '调':'調','维':'維','结':'結','缩':'縮','汇':'匯','迹':'跡',
    '义':'義','联':'聯','总':'總','单':'單','体':'體','费':'費',
    '获':'獲','该':'該','议':'議','节':'節','测':'測','荆':'荊',
    '释':'釋','诅':'詛','咒':'咒','触':'觸','链':'鏈','盾':'盾',
    '颈':'頸','泪':'淚','宝':'寶','尸':'屍','灵':'靈','偿':'償',
    '抢':'搶','线':'線','绿':'綠','红':'紅','蓝':'藍','黄':'黃',
    '术':'術','码':'碼','坏':'壞','败':'敗','阶':'階',
  };
  return s.split('').map(c=>map[c]||c).join('');
}

// Lang file marker
const LANG_STAGE = {
  zh:'关卡', ja:'ステージ', zht:'關卡',
  es:'Fase', fr:'Étape', de:'Stufe', ptbr:'Fase', it:'Fase', id:'Tahap',
  ru:'Уровень', vi:'Giai đoạn', th:'ด่าน', tr:'Aşama', pl:'Etap',
  cs:'Fáze', hu:'Szakasz', bg:'Ниво', el:'Στάδιο', fi:'Vaihe',
  sv:'Nivå', da:'Niveau', no:'Nivå', nl:'Fase', ro:'Etapă',
  uk:'Рівень', ar:'المرحلة',
};

const HELL = 'G:/hell';

// --- Step 1: Update _EN in game.html ---
let html = fs.readFileSync(`${HELL}/game.html`, 'utf8');
const enMarker = `// --- Skill Info Panel (CAT-82) ---`;
if (!html.includes(enMarker)) {
  console.error('_EN marker not found');
  process.exit(1);
}
const firstKo = P[0][0];
if (html.includes(`'${firstKo}':`)) {
  console.log('[SKIP] _EN already has CAT-83 entries');
} else {
  const enLines = P.map(([ko,,, en]) => `'${ko}':'${en}',`).join('\n');
  const enInsert = `// --- Affix Desc (CAT-83) ---\n${enLines}\n`;
  html = html.replace(enMarker, enInsert + enMarker);
  fs.writeFileSync(`${HELL}/game.html`, html, 'utf8');
  console.log(`[OK] _EN — ${P.length} entries added`);
}

// --- Step 2: Fix code: wrap _AFFIX_DESC usage with _T() ---
const oldCode = `+(_AFFIX_DESC[af.id]||'')+`;
const newCode = `+_T(_AFFIX_DESC[af.id]||'')+`;
let html2 = fs.readFileSync(`${HELL}/game.html`, 'utf8');
if (html2.includes(newCode)) {
  console.log('[SKIP] _T() wrap already applied');
} else if (html2.includes(oldCode)) {
  html2 = html2.replace(oldCode, newCode);
  fs.writeFileSync(`${HELL}/game.html`, html2, 'utf8');
  console.log('[OK] _T() wrap applied to _AFFIX_DESC usage');
} else {
  console.error('[ERROR] _AFFIX_DESC usage line not found');
}

// --- Step 3: Add to all 26 lang files ---
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
  const firstKey = P[0][0];
  if (content.includes(`'${firstKey}':`)) {
    console.log(`[SKIP] ${lang}: already inserted`);
    continue;
  }

  const insert = `// --- CAT-83: affix desc labels ---\n` + lines.join('\n') + '\n';
  content = content.replace(marker, insert + marker);
  fs.writeFileSync(file, content, 'utf8');
  console.log(`[OK] ${lang} — ${P.length} entries`);
}
console.log('CAT-83 done.');
