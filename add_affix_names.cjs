// CAT-84/85/86: Affix Names + Implicit + Legendary Special → 26 lang files + _EN in game.html
'use strict';
const fs = require('fs');

// [ko, zh, ja, en]
// CAT-84: AFFIX_NAMES_KO unique strings
const P84 = [
// Basic element
['맹독의','剧毒','猛毒','Venom'],
['불꽃의','烈焰','烈炎','Flame'],
['냉기의','冰寒','氷寒','Frost'],
['번개의','雷电','雷電','Lightning'],
['암흑의','暗黑','暗黒','Darkness'],
// Core combat
['관통의','穿透','貫通','Penetrating'],
['광폭의','狂暴','狂暴','Ferocious'],
['파쇄의','破碎','破砕','Shattering'],
['연쇄의','连锁','連鎖','Chaining'],
['학살의','屠戮','虐殺','Slaughter'],
['폭발의','爆炸','爆発','Explosive'],
['집중의','专注','集中','Focused'],
['쾌속의','迅捷','快速','Haste'],
['패리의','格挡','パリィ','Parrying'],
['추적자의','追踪者','追跡者','Pursuit'],
['작살의','鱼叉','ヤリ','Javelin'],
['궁극의','终极','究極','Ultimate'],
['집중력의','专注力','集中力','Concentration'],
// Defensive base stats
['강철의','钢铁','鋼鉄','Iron'],
['강인의','强韧','強靭','Fortitude'],
['수호의','守护','守護','Guardian'],
['활력의','活力','活力','Vitality'],
['신속의','迅速','迅速','Swift'],
// Elemental ward
['화염수호','火焰守护','炎の守護','Fire Ward'],
['빙결수호','冰结守护','氷結の守護','Ice Ward'],
['암전수호','暗影守护','暗影の守護','Shadow Ward'],
['암흑수호','暗黑守护','暗黒の守護','Dark Ward'],
['독수호','毒素守护','毒の守護','Poison Ward'],
['전원소수호','全元素守护','全元素の守護','All Elem Ward'],
// Defense
['물리방패의','物理护盾','物理シールド','Physical Shield'],
['반사의','反射','反射','Reflection'],
['가시의','荆棘','棘','Thorns'],
['흡수의','吸收','吸収','Absorption'],
['인내의','忍耐','忍耐','Endurance'],
['위기의','危机','危機','Crisis'],
['피격반격의','受击反击','被撃反撃','Counter Strike'],
['패링폭발의','格挡爆炸','パリィ爆発','Parry Burst'],
['스태거폭발의','架势爆炸','スタッガー爆発','Stagger Burst'],
['원소전환의','元素转换','元素変換','Elem Convert'],
['정화의','净化','浄化','Purification'],
['불굴의','不屈','不屈','Indomitable'],
['부활의','复活','復活','Revival'],
// Utility/loot
['약탈의','掠夺','略奪','Plunder'],
['경험의','经验','経験','Experience'],
['골드의','金币','ゴールド','Gold'],
['포션강화의','药水强化','ポーション強化','Potion Boost'],
['사슬의','锁链','鎖','Chain'],
['진혼의','镇魂','鎮魂','Requiem'],
['윤회의','轮回','輪廻','Rebirth'],
// Life/regen
['생명력의','生命力','生命力','Life Power'],
['재생의','再生','再生','Regeneration'],
['치유의','治愈','治癒','Healing'],
// Magic/mana
['마력의','魔力','魔力','Magic Power'],
['절약의','节约','節約','Economy'],
['영혼의','灵魂','霊魂','Soul'],
['지속의','持力','持久力','Stamina'],
['마나의','法力','マナ','Mana'],
['원소수호의','元素守护','元素守護','Elem Guard'],
// Stats
['행운의','幸运','幸運','Fortune'],
['근성의','坚韧','ガッツ','Grit'],
// Damage modifiers
['풍요의','丰盛','豊穣','Abundance'],
['약자포식의','弱肉强食','弱肉強食','Predator'],
['만혈의','满血','満血','Full Life'],
['사선의','濒死','瀕死','Low Life'],
['처형의','处决','処刑','Execute'],
['근접살의','近身伤','近接ダメージ','Melee DMG'],
['원거리의','远程','遠距離','Ranged'],
['경직파의','硬直破','スタッガー破','Stagger Break'],
['동파의','冻击','凍撃','Freeze Strike'],
['연소의','燃烧','燃焼','Burning'],
['맹독살의','剧毒猎手','猛毒スレイヤー','Venom Slayer'],
['저주살의','诅咒猎手','呪いスレイヤー','Curse Slayer'],
['구속의','束缚','拘束','Binding'],
['왕살의','王者猎手','ボスキラー','Boss Slayer'],
['정예살의','精英猎手','エリートキラー','Elite Slayer'],
['군살의','杂兵猎手','雑魚キラー','Mob Slayer'],
['선제의','先制','先制','First Strike'],
// Leech
['흡혈의','吸血','吸血','Vampirism'],
['흡마의','吸魔','魔力吸収','Mana Leech'],
['흡정의','吸精','スタミナ吸収','Stamina Leech'],
['타격재생의','打击再生','打撃再生','Hit Regen'],
// On-kill
['처치회복의','击杀恢复','撃破回復','Kill Recovery'],
['처치흡마의','击杀吸魔','撃破魔力吸収','Kill Mana Leech'],
['처치활력의','击杀活力','撃破活力','Kill Stamina'],
['처치폭발의','击杀爆炸','撃破爆発','Kill Explosion'],
['처치질주의','击杀冲刺','撃破ダッシュ','Kill Sprint'],
// Situational defense
['건강방어의','健康防御','健康防御','Healthy Defense'],
['중상보호의','重伤保护','重傷防護','Wounded Shield'],
['위기질주의','危机冲刺','危機ダッシュ','Crisis Sprint'],
['지속피해방어의','持续伤害减伤','DoTダメージ軽減','DoT DR'],
['왕피해방어의','王者伤害减伤','ボスダメージ軽減','Boss DMG DR'],
['근접방어의','近战防御','近接防御','Close DR'],
['원거리방어의','远程防御','遠距離防御','Ranged DR'],
['처치생명의','击杀HP','撃破HP','Kill HP'],
['처치수호의','击杀护盾','撃破シールド','Kill Shield'],
// Fire
['화염강화의','火焰强化','炎強化','Fire Amp'],
['화염관통의','火焰穿透','炎貫通','Fire Pierce'],
['발화의','点火','発火','Ignition'],
['화염폭발의','火焰爆炸','炎爆発','Fire Burst'],
['맹화의','猛火','猛火','Blaze'],
['화염의힘','火焰之力','炎の力','Fire Power'],
// Ice
['빙결강화의','冰结强化','氷結強化','Ice Amp'],
['빙결관통의','冰结穿透','氷結貫通','Ice Pierce'],
['동결의','冻结','凍結','Freeze'],
['빙결폭발의','冰结爆炸','氷結爆発','Ice Burst'],
['영빙의','永冰','永氷','Permafrost'],
['빙결의힘','冰结之力','氷結の力','Ice Power'],
// Lightning
['뇌전강화의','雷电强化','雷電強化','Thunder Amp'],
['뇌전관통의','雷电穿透','雷電貫通','Thunder Pierce'],
['감전의','感电','感電','Shock'],
['뇌전폭발의','雷电爆炸','雷電爆発','Thunder Burst'],
['낙뢰의','落雷','落雷','Thunderbolt'],
['뇌전의힘','雷电之力','雷電の力','Thunder Power'],
// Dark
['암흑강화의','暗黑强化','暗黒強化','Dark Amp'],
['암흑관통의','暗黑穿透','暗黒貫通','Dark Pierce'],
['침식의','侵蚀','侵食','Erosion'],
['암흑폭발의','暗黑爆炸','暗黒爆発','Dark Burst'],
['심연의','深渊','深淵','Abyss'],
['암흑의힘','暗黑之力','暗黒の力','Dark Power'],
// Poison
['맹독강화의','剧毒强化','猛毒強化','Venom Amp'],
['독관통의','毒素穿透','毒貫通','Poison Pierce'],
['중독의','中毒','中毒','Poisoning'],
['독폭발의','毒素爆炸','毒爆発','Poison Burst'],
['맹독지속의','剧毒持续','猛毒持続','Venom Duration'],
['독의힘','毒素之力','毒の力','Poison Power'],
// Damage type
['격투의','格斗','格闘','Melee'],
['원사의','远射','遠射','Ranged Shot'],
['주술의','咒术','呪術','Spell'],
['광선의','光线','光線','Beam'],
['탄도의','弹道','弾道','Ballistic'],
['확산의','扩散','拡散','AoE Radius'],
// Crit by type
['근접회심의','近战暴击','近接クリ','Melee Crit'],
['마법회심의','魔法暴击','魔法クリ','Spell Crit'],
['사격회심의','射击暴击','射撃クリ','Ranged Crit'],
['근접쾌속의','近战速攻','近接速攻','Melee Speed'],
['사격쾌속의','射击速攻','射撃速攻','Ranged Speed'],
['영창의','吟唱','詠唱','Chanting'],
// All-element
['전속성관통의','全属性穿透','全属性貫通','All-Elem Pierce'],
['쉴드파괴의','护盾破坏','シールド破壊','Shield Bypass'],
['갑옷분쇄의','护甲碎裂','防具砕き','Armor Shred'],
['탄속의','弹速','弾速','Proj Speed'],
// On-hit procs
['화구발사의','火球发射','火球発射','Fireball Launch'],
['연쇄뇌격의','连锁雷击','連鎖雷撃','Chain Lightning'],
['동결타의','冰冻打击','凍結打撃','Freeze Strike'],
['경직타의','硬直打击','スタッガー打撃','Stagger Strike'],
['독침의','毒刺','毒刺','Poison Sting'],
['출혈의','出血','出血','Bleed'],
['약화의','弱化','弱体化','Weakness'],
['둔화의','减速','スロー','Slow'],
['표적의','标记','マーキング','Marking'],
// On-crit procs
['회심폭발의','暴击爆炸','クリ爆発','Crit Explosion'],
['회심연쇄의','暴击连锁','クリ連鎖','Crit Chain'],
['회심빙결의','暴击冰结','クリ氷結','Crit Freeze'],
['회심치유의','暴击治愈','クリ治癒','Crit Heal'],
['회심영력의','暴击魔力','クリ魔力','Crit Mana'],
['회심수호의','暴击护盾','クリシールド','Crit Shield'],
// Other procs
['피격강화의','受击强化','被撃強化','Hit Boost'],
['반격가시의','反击荆棘','反撃棘','Counter Thorns'],
['빙결파동의','冰结波动','氷結波動','Ice Nova'],
['암흑보호의','暗黑护盾','暗黒シールド','Dark Shield'],
['치유파동의','治愈波动','治癒波動','Heal Pulse'],
['시체폭발의','尸爆','死体爆発','Corpse Explosion'],
['회피반격의','回避反击','回避反撃','Dodge Counter'],
['패링폭파의','格挡炸裂','パリィ爆砕','Parry Shatter'],
['블록치유의','格挡治愈','ブロック治癒','Block Heal'],
['블록영력의','格挡魔力','ブロック魔力','Block Mana'],
// Skill boosts
['회전참강화','旋转斩强化','回転斬強化','Spin Slash Boost'],
['옴니빔강화','全向光束强化','オムニビーム強化','Omni Beam Boost'],
['화구강화','火球强化','ファイアボール強化','Fireball Boost'],
['미사일강화','导弹强化','ミサイル強化','Missile Boost'],
['청탄강화','蓝弹强化','青弾強化','Blue Shot Boost'],
['폭렬탄강화','爆裂弹强化','爆裂弾強化','Burst Shot Boost'],
['지옥광선강화','地狱光线强化','地獄光線強化','Hellray Boost'],
['악의폭풍강화','恶意暴风强化','悪意嵐強化','Malice Storm Boost'],
['연쇄참강화','连锁斩强化','連鎖斬強化','Chain Slash Boost'],
['거인강타강화','巨人重击强化','巨人強打強化','Giant Slam Boost'],
['유령보행강화','幽灵步行强化','幽霊歩き強化','Ghost Walk Boost'],
['악의박격강화','恶意迫击强化','悪意迫撃強化','Malice Mortar Boost'],
['화염오라강화','火焰光环强化','炎オーラ強化','Fire Aura Boost'],
['빙구강화','冰球强化','アイスオーブ強化','Ice Orb Boost'],
['화염빔강화','火焰光束强化','炎ビーム強化','Fire Beam Boost'],
['악의사냥강화','恶意狩猎强化','悪意狩り強化','Malice Hunt Boost'],
['암흑기둥강화','暗黑柱强化','暗黒柱強化','Dark Pillar Boost'],
['역병강화','瘟疫强化','疫病強化','Plague Boost'],
['가시오라강화','荆棘光环强化','棘オーラ強化','Thorn Aura Boost'],
['연쇄돌격강화','连锁突击强化','連鎖突撃強化','Chain Assault Boost'],
// Dodge
['회피의','回避','回避','Evasion'],
['회피쿨감의','回避冷却降低','回避CD減少','Dodge CD Red'],
// Shield stats
['수호력의','护盾力量','シールド力','Shield Power'],
['수호재생의','护盾再生','シールド再生','Shield Regen'],
['수호쿨감의','护盾冷却降低','シールドCD減少','Shield CD Red'],
['재생력의','再生力','再生力','Regen Power'],
['활력재생의','活力再生','スタミナ再生','Stamina Regen'],
['마력재생의','魔力再生','魔力再生','Mana Regen'],
// Elemental resistance
['화염보호의','火焰防护','炎防護','Fire Shield'],
['빙결보호의','冰结防护','氷結防護','Ice Shield'],
['뇌전보호의','雷电防护','雷電防護','Thunder Shield'],
['해독의','解毒','解毒','Antidote'],
['만물보호의','万物防护','万物防護','All Protection'],
['정예보호의','精英防护','エリート防護','Elite Shield'],
// CC resistances
['경직저항의','硬直抵抗','スタッガー抵抗','Stagger Resist'],
['빙결저항의','冰结抵抗','氷結抵抗','Freeze Resist'],
['감속저항의','减速抵抗','スロー抵抗','Slow Resist'],
['넉백저항의','击退抵抗','ノックバック抵抗','Knockback Resist'],
// Movement/dash
['돌진거리의','突进距离','突進距離','Dash Range'],
['돌진쿨감의','突进冷却降低','突進CD減少','Dash CD Red'],
['전투질주의','战斗冲刺','戦闘ダッシュ','Combat Sprint'],
['평화질주의','和平冲刺','平和ダッシュ','Peace Sprint'],
['습득범위의','拾取范围','習得範囲','Pickup Radius'],
// Base stats
['힘의','力量','力','Strength'],
['민첩의','敏捷','敏捷','Dexterity'],
['지능의','智力','知力','Intelligence'],
['만능의','万能','万能','Versatile'],
['지구력의','耐力','スタミナ最大','Max Stamina'],
['마나력의','法力力量','マナ力','Mana Power'],
['타격자원의','打击资源','打撃リソース','Hit Resource'],
// Elemental res caps
['화염한계의','火焰上限','炎上限','Fire Cap'],
['빙결한계의','冰结上限','氷結上限','Ice Cap'],
['뇌전한계의','雷电上限','雷電上限','Thunder Cap'],
['암흑한계의','暗黑上限','暗黒上限','Dark Cap'],
['독한계의','毒素上限','毒上限','Poison Cap'],
// Cooldowns / utility
['스킬쿨감의','技能冷却降低','スキルCD減少','Skill CD Red'],
['물약쿨감의','药水冷却降低','ポーションCD減少','Potion CD Red'],
['장인의','工匠','職人','Craftsmanship'],
['탐욕의','贪婪','貪欲','Greed'],
['수련의','修炼','修練','Training'],
['수집의','收集','収集','Gathering'],
// Demon / special
['악마의힘','恶魔之力','悪魔の力','Demon Power'],
['악마보호의','恶魔防护','悪魔防護','Demon Shield'],
['영혼수확의','灵魂收割','魂収穫','Soul Harvest'],
['생명흡수의','生命吸收','ライフ吸収','Life Absorption'],
['과치유수호의','过量治愈护盾','過剰治癒シールド','Overheal Shield'],
// Conditional dmg
['만마력의','满魔力伤','満マナダメージ','Full Mana DMG'],
['이동방어의','移动防御','移動防御','Moving DR'],
['정지공세의','静止攻势','静止攻勢','Stationary Boost'],
['회피공세의','回避攻势','回避攻勢','Post-Dodge Boost'],
['패링보호의','格挡保护','パリィ防護','Parry Shield'],
['콤보폭발의','连击爆炸','コンボ爆発','Combo Burst'],
// Flat element dmg
['물리타격의','物理打击','物理打撃','Phys Strike'],
['화염타격의','火焰打击','炎打撃','Fire Strike'],
['빙결타격의','冰结打击','氷結打撃','Ice Strike'],
['뇌전타격의','雷电打击','雷電打撃','Thunder Strike'],
['암흑타격의','暗黑打击','暗黒打撃','Dark Strike'],
['독타격의','毒素打击','毒打撃','Poison Strike'],
// ATK range
['최소공격의','最小攻击','最低攻撃','Min ATK'],
['최대공격의','最大攻击','最大攻撃','Max ATK'],
['전투력의','战斗力','戦闘力','Combat Power'],
['무기사거리의','武器射程','武器射程','Weapon Range'],
['활사거리의','弓箭射程','弓射程','Bow Range'],
// Multi-hit / pierce
['이중타의','二重打击','二連打','Double Strike'],
['다중발사의','多重发射','マルチショット','Multi Shot'],
['관통횟수의','穿透次数','貫通回数','Pierce Count'],
['관통유지의','穿透维持','貫通維持','Pierce Keep'],
['연쇄유지의','连锁维持','連鎖維持','Chain Keep'],
['범위확장의','范围扩展','範囲拡張','Splash Range'],
['범위피해의','范围伤害','範囲ダメージ','Splash DMG'],
['돌진공격의','突进攻击','突進攻撃','Dash ATK'],
['반격공격의','反击攻击','反撃攻撃','Counter ATK'],
['후방타의','背刺','バックスタブ','Backstab'],
// DoT / bleed
['침식가속의','侵蚀加速','侵食加速','Erosion Speed'],
['출혈지속의','出血持续','出血持続','Bleed Duration'],
['마법타격의','魔法打击','魔法打撃','Magic Strike'],
['주문증폭의','咒术放大','呪文増幅','Spell Amp'],
// Kill streak / momentum
['연살뎀의','连杀伤害','連続撃破ダメージ','Kill Streak DMG'],
['연살속의','连杀速度','連続撃破速度','Kill Streak Speed'],
['기세의','气势','勢い','Momentum'],
['정지공격의','静止攻击','静止攻撃','Static Strike'],
['이동공격의','移动攻击','移動攻撃','Mobile Strike'],
['패링공세의','格挡攻势','パリィ攻勢','Post-Parry Boost'],
['임사폭발의','濒死爆炸','瀕死爆発','Near-Death Burst'],
['만기력공의','满体力攻击','満スタミナ攻撃','Full Stamina ATK'],
['만마력공의','满魔力攻击','満マナ攻撃','Full Mana ATK'],
['신선처치의','新鲜击杀','新鮮撃破','Fresh Kill'],
// Status extension
['경직연장의','硬直延长','スタッガー延長','Stagger Extension'],
['빙결연장의','冰结延长','氷結延長','Freeze Extension'],
['둔화강화의','减速强化','スロー強化','Slow Amp'],
['독중첩의','毒素叠加','毒スタック','Poison Stack'],
['출혈중첩의','出血叠加','出血スタック','Bleed Stack'],
// Status amp
['발화강화의','点火强化','発火強化','Ignite Amp'],
['동상강화의','冻伤强化','凍傷強化','Frostbite Amp'],
['감전강화의','感电强化','感電強化','Shock Amp'],
['사선회심의','濒死暴击','瀕死クリ','Low HP Crit'],
// Armor/shield slot
['갑옷강화의','护甲强化','防具強化','Armor Boost'],
['블록흡수의','格挡吸收','ブロック吸収','Block Absorb'],
['방패타격의','盾击','シールド打撃','Shield Bash'],
['방패경직의','盾硬直','シールドスタッガー','Shield Stagger'],
// Gloves
['격투속의','格斗速度','格闘速度','Brawl Speed'],
['격투회심의','格斗暴击','格闘クリ','Brawl Crit'],
['격투경직의','格斗硬直','格闘スタッガー','Brawl Stagger'],
['하반재생의','下半身再生','下半身再生','Leg Regen'],
['CC단축의','CC缩减','CC短縮','CC Duration Red'],
// Boots
['돌진타의','突进打击','突進打撃','Dash Strike'],
['돌진범위의','突进范围','突進範囲','Dash AoE'],
['은신질주의','隐身冲刺','隠れダッシュ','Stealth Sprint'],
['회피감쇠의','回避减伤','回避ダメージ軽減','Dodge DR'],
['속성감쇠의','属性减伤','属性ダメージ軽減','Elem DR'],
// Helm
['마나왕관의','法力头盔','マナヘルム','Mana Helm'],
['시전왕관의','施法头盔','詠唱ヘルム','Cast Helm'],
['쿨감왕관의','冷却头盔','CD減少ヘルム','CD Helm'],
['경험왕관의','经验头盔','経験ヘルム','EXP Helm'],
// Hybrid affixes
['공생의','共生','共生','Symbiosis'],
['수질의','水质','体力と知力','Body-Soul'],
['회심흡의','暴击吸取','クリ吸収','Crit Leech'],
['체마의','体魔','体力と魔力','HP-Mana'],
['체기의','体气','体力とスタミナ','HP-Stamina'],
['마기의','魔气','魔力とスタミナ','Mana-Stamina'],
['전재생의','全再生','全再生','All Regen'],
['힘민의','力敏','力と敏捷','STR-DEX'],
['힘지의','力智','力と知力','STR-INT'],
['민지의','敏智','敏捷と知力','DEX-INT'],
['운근의','运韧','運とガッツ','Fortune-Grit'],
['수확의','收获','収穫','Harvest'],
['빙화의','冰火','氷と炎','Ice-Fire'],
['뇌암의','雷暗','雷と暗','Thunder-Dark'],
['근마의','近魔','近接と魔法','Blade-Magic'],
['속성침식의','属性侵蚀','属性侵食','Elem Erosion'],
// Ring
['화염반지의','火焰戒指','炎リング','Fire Ring'],
['빙결반지의','冰结戒指','氷結リング','Ice Ring'],
['뇌전반지의','雷电戒指','雷電リング','Thunder Ring'],
['암흑반지의','暗黑戒指','暗黒リング','Dark Ring'],
['독반지의','毒素戒指','毒リング','Poison Ring'],
['콤보반지의','连击戒指','コンボリング','Combo Ring'],
['처치마나의','击杀魔力','撃破マナ','Kill Mana'],
['관통반지의','穿透戒指','貫通リング','Pierce Ring'],
// Necklace
['만능목걸이의','万能项链','万能ネックレス','Allround Necklace'],
['회심목걸이의','暴击项链','クリネックレス','Crit Necklace'],
['관통목걸이의','穿透项链','貫通ネックレス','Pierce Necklace'],
['스킬목걸이의','技能项链','スキルネックレス','Skill Necklace'],
['콤보한계의','连击上限','コンボ上限','Combo Max'],
['처치치유의','击杀治愈','撃破治癒','Kill Heal'],
// Belt
['지구벨트의','耐力腰带','スタミナベルト','Stamina Belt'],
['포션벨트의','药水腰带','ポーションベルト','Potion Belt'],
['활력벨트의','活力腰带','活力ベルト','Vitality Belt'],
['탐욕벨트의','贪婪腰带','貪欲ベルト','Greed Belt'],
// Headband
['마나띠의','法力带','マナバンド','Mana Band'],
['시전띠의','施法带','詠唱バンド','Cast Band'],
['마력띠의','魔力带','魔力バンド','Magic Band'],
['주술띠의','咒术带','呪術バンド','Spell Band'],
['속성띠의','属性带','属性バンド','Elem Band'],
// Archetype: Warrior
['전사의힘','战士之力','戦士の力','Warrior Power'],
['전사생명의','战士生命','戦士ライフ','Warrior Life'],
['전사흡혈의','战士吸血','戦士吸血','Warrior Leech'],
['전사인내의','战士忍耐','戦士忍耐','Warrior Poise'],
// Archetype: Mage
['마법사의힘','法师之力','魔法使いの力','Mage Power'],
['마법사마나의','法师法力','魔法使いマナ','Mage Mana'],
['마법사수호의','法师护盾','魔法使いシールド','Mage Shield'],
['마법사속성의','法师属性','魔法使い属性','Mage Elem'],
// Archetype: Ranger
['궁수의힘','弓手之力','弓使いの力','Archer Power'],
['궁수사거리의','弓手射程','弓使い射程','Archer Range'],
['궁수관통의','弓手穿透','弓使い貫通','Archer Pierce'],
['궁수질주의','弓手冲刺','弓使いダッシュ','Archer Sprint'],
// Archetype: Tank
['탱크생명의','坦克生命','タンクライフ','Tank Life'],
['탱크방어의','坦克防御','タンク防御','Tank Defense'],
['탱크블록의','坦克格挡','タンクブロック','Tank Block'],
['탱크가시의','坦克荆棘','タンク棘','Tank Thorns'],
// Archetype: Assassin
['암살회심의','刺客暴击','暗殺者クリ','Assassin Crit'],
['암살후방의','刺客背刺','暗殺者後方','Assassin Backstab'],
['암살독의','刺客毒素','暗殺者毒','Assassin Poison'],
['암살회피의','刺客回避','暗殺者回避','Assassin Dodge'],
// Endgame
['종결자의','终结者','終結者','The Ender'],
['생존자의','生存者','生存者','Survivor'],
['종결수호의','终结护盾','終結シールド','End Shield'],
['종결회심의','终结暴击','終結クリ','End Crit'],
['종결공격의','终结攻击','終結攻撃','End ATK'],
['종결저항의','终结抵抗','終結抵抗','End Resistance'],
['종결파괴의','终结破坏','終結破壊','End Destruction'],
['종결보호의','终结防护','終結防護','End Protection'],
['종결흡혈의','终结吸血','終結吸血','End Leech'],
['종결인내의','终结忍耐','終結忍耐','End Poise'],
['종결쿨감의','终结冷却降低','終結CD減少','End CD Red'],
['종결경험의','终结经验','終結経験','End EXP'],
['종결약탈의','终结掠夺','終結略奪','End Loot'],
['종결악의의','终结恶意','終結悪意','End Malice'],
['종결힘의','终结力量','終結力','End STR'],
['종결민첩의','终结敏捷','終結敏捷','End DEX'],
['종결지능의','终结智力','終結知力','End INT'],
['종결행운의','终结幸运','終結幸運','End LCK'],
['종결근성의','终结坚韧','終結ガッツ','End Grit'],
['종결연살의','终结连杀','終結連続撃破','End Kill Chain'],
// Healthy/wounded/boss
['건강공세의','健康攻势','健康攻勢','Healthy Offense'],
['중상폭발의','重伤爆炸','重傷爆発','Wounded Burst'],
['중상흡혈의','重伤吸血','重傷吸血','Wounded Leech'],
['토벌의','讨伐','討伐','Vanguard'],
['정예토벌의','精英讨伐','エリート討伐','Elite Vanguard'],
// Adjective-form
['예리한','锋利','鋭い','Razor'],
['맹렬한','猛烈','猛烈','Ferocious'],
['파멸의','毁灭','破滅','Ruination'],
// Crit DMG
['극대화의','极大化','極大化','Maximize'],
];

// CAT-85: IMPLICIT_TABLE unique strings (14)
const P85 = [
['공격력 +X%','攻击力 +X%','攻撃力 +X%','ATK +X%'],
['관통 확률 +X%','穿透率 +X%','貫通率 +X%','Pierce Chance +X%'],
['방어율 +X%','格挡率 +X%','ブロック率 +X%','Block Rate +X%'],
['물리 피해감소 +X%','物理减伤 +X%','物理軽減 +X%','Phys DR +X%'],
['최대 HP +X','最大HP +X','最大HP +X','Max HP +X'],
['공격속도 +X%','攻击速度 +X%','攻撃速度 +X%','ATK Speed +X%'],
['상태이상 저항 +X%','状态抵抗 +X%','状態異常耐性 +X%','Status Resist +X%'],
['이동속도 +X%','移动速度 +X%','移動速度 +X%','Move Speed +X%'],
['원소 저항 +X%','元素抵抗 +X%','元素耐性 +X%','Elem Resist +X%'],
['최대 HP +X%','最大HP +X%','最大HP +X%','Max HP +X%'],
['회피 쿨다운 -X%','闪避冷却 -X%','回避CD -X%','Dodge CD -X%'],
['물약 쿨다운 -X%','药水冷却 -X%','ポーションCD -X%','Potion CD -X%'],
['부활력 +X%','复活力 +X%','復活力 +X%','Revive Power +X%'],
['마법 데미지 +X%','魔法伤害 +X%','魔法ダメージ +X%','Magic DMG +X%'],
];

// CAT-86: LEGENDARY_SPECIAL strings (19) + header (1)
const P86 = [
['전설 특수','传说特殊','伝説特殊','Legendary Special'],
['5타 콤보 완성 시 데빌포스 20% 즉시 충전','5连击完成时魔力20%立即充能','5コンボ完成でデビルフォース20%即時チャージ','5-hit combo: instantly charge DevilForce 20%'],
['처치 시 이속 +40%(3초) + 다음 공격 크리 보장','击杀时移速+40%(3秒)+下次攻击必暴','撃破時移動速度+40%(3秒)+次の攻撃クリ確定','Kill: MoveSpd +40%(3s) + next attack guaranteed Crit'],
['스태거 발동 시 범위 충격파 (ATK×120%)','架势发动时范围冲击波(ATK×120%)','スタッガー発動時範囲衝撃波(ATK×120%)','Stagger: AoE shockwave (ATK×120%)'],
['스태거 발동 시 범위 충격파 (ATK×100%)','架势发动时范围冲击波(ATK×100%)','スタッガー発動時範囲衝撃波(ATK×100%)','Stagger: AoE shockwave (ATK×100%)'],
['강타 시 적 넉백 거리 2배 + 벽충돌 추가뎀','重击时击退距离×2+碰壁追加伤害','強打時ノックバック距離×2+壁衝突追加ダメージ','Heavy hit: Knockback ×2 + wall collision bonus DMG'],
['출혈 대상 크리 시 잔여 DoT×300% 즉시 폭발','暴击流血目标时残余DoT×300%即时爆炸','出血対象クリ時残余DoT×300%即時爆発','Crit vs Bleeding: remaining DoT×300% instant explosion'],
['작살 착지 타격 수만큼 데미지 +20% 중첩(최대5)','长矛落地命中数+20%伤害叠加(最多5层)','槍着地ヒット数分+20%ダメージスタック(最大5)','Javelin landing hits: stack +20% DMG (max 5)'],
['치명타 시 추가 투사체 1발 발사','暴击时额外发射1枚投射物','クリ時追加投射物1発発射','Crit: fire 1 additional projectile'],
['패리 성공 시 반격 데미지 ×2','格挡成功时反击伤害×2','パリィ成功時反撃ダメージ×2','Parry: counter DMG ×2'],
['피격 시 3초 쿨로 HP 5% 즉시 회복','受击时3秒冷却立即回复HP5%','被撃時3秒CDでHP5%即時回復','On Hit (3s CD): restore 5% HP instantly'],
['스킬 사용 시 20% 확률로 쿨다운 미소모','使用技能时20%概率不消耗冷却','スキル使用時20%確率でCD消費なし','Using skills: 20% chance no cooldown consumed'],
['공격속도 +20% + 기본공격에 랜덤 원소 추가','攻击速度+20%+普攻附带随机元素','攻撃速度+20%+通常攻撃にランダム属性追加','ATK Speed +20% + basic attacks add random element'],
['이동 중 지속 HP 재생 (초당 HP의 1%)','移动中持续回复HP(每秒1%)','移動中継続HP再生(毎秒1%)','While moving: HP regen (1% HP/sec)'],
['회피 직후 첫 공격 데미지 +80%','回避后第一次攻击伤害+80%','回避直後最初の攻撃ダメージ+80%','First attack after Dodge: DMG +80%'],
['패리 타이밍 판정 +50% 확대','格挡时机判定扩大+50%','パリィタイミング判定+50%拡大','Parry timing window +50% expanded'],
['원소 반응 발동 시 추가 폭발 (ATK×80%)','元素反应发动时额外爆炸(ATK×80%)','元素反応発動時追加爆発(ATK×80%)','Elemental reaction: bonus explosion (ATK×80%)'],
['처치 시 데빌포스 5% 회복','击杀时魔力回复5%','撃破時デビルフォース5%回復','Kill: restore 5% DevilForce'],
['HP 50% 이하 시 전 스킬 쿨다운 -30%','HP50%以下时所有技能冷却-30%','HP50%以下時全スキルCD-30%','Below 50% HP: all skill CD -30%'],
['물약 사용 시 5초간 피해 +15%','使用药水时5秒内伤害+15%','ポーション使用時5秒間ダメージ+15%','Using Potion: DMG +15% for 5s'],
];

const ALL_P = [...P84, ...P85, ...P86];
const TOTAL = ALL_P.length;

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
    '础':'礎','热':'熱','缓':'緩','穿':'穿','效':'效','率':'率',
    '间':'間','却':'卻','参':'參','离':'離','围':'圍','类':'類',
    '习':'習','恶':'惡','战':'戰','显':'顯','结':'結','缩':'縮',
    '维':'維','汇':'匯','迹':'跡','烈':'烈','坚':'堅','韧':'韌',
    '猎':'獵','贪':'貪','旋':'旋','尸':'屍','疫':'疫','荆':'荊',
    '枪':'槍','弓':'弓','拾':'拾','掠':'掠','净':'淨','瘟':'瘟',
    '鲜':'鮮','叹':'嘆','宝':'寶','华':'華','扩':'擴','炼':'煉',
    '练':'練','敌':'敵','获':'獲','专':'專','让':'讓','认':'認',
    '势':'勢','组':'組','费':'費','谏':'諫','诅':'詛','邪':'邪',
    '课':'課','联':'聯','赚':'賺','脏':'髒','验':'驗','铁':'鐵',
    '阵':'陣','阶':'階','随':'隨','览':'覽','赔':'賠','赢':'贏',
    '说':'說','话':'話','语':'語','词':'詞','题':'題','问':'問',
  };
  return s.split('').map(c=>map[c]||c).join('');
}

const LANG_STAGE = {
  zh:'关卡', ja:'ステージ', zht:'關卡',
  es:'Fase', fr:'Étape', de:'Stufe', ptbr:'Fase', it:'Fase', id:'Tahap',
  ru:'Уровень', vi:'Giai đoạn', th:'ด่าน', tr:'Aşama', pl:'Etap',
  cs:'Fáze', hu:'Szakasz', bg:'Ниво', el:'Στάδιο', fi:'Vaihe',
  sv:'Nivå', da:'Niveau', no:'Nivå', nl:'Fase', ro:'Etapă',
  uk:'Рівень', ar:'المرحلة',
};

const HELL = 'G:/hell';

// ── 1. game.html _EN block ──────────────────────────────────
const HTML = `${HELL}/game.html`;
let html = fs.readFileSync(HTML, 'utf8');
const HTML_MARKER = '// --- Affix Desc (CAT-83) ---';
if (html.includes('// --- Affix Names (CAT-84) ---')) {
  console.log('[SKIP] game.html: CAT-84 already inserted');
} else if (!html.includes(HTML_MARKER)) {
  console.error('[FAIL] game.html: marker not found');
} else {
  const lines84 = P84.map(([ko,,, en]) => `'${ko}':'${en}',`);
  const lines85 = P85.map(([ko,,, en]) => `'${ko}':'${en}',`);
  const lines86 = P86.map(([ko,,, en]) => `'${ko}':'${en}',`);
  const insert =
    `// --- Affix Names (CAT-84) ---\n` + lines84.join('\n') + '\n' +
    `// --- Implicit (CAT-85) ---\n` + lines85.join('\n') + '\n' +
    `// --- Legendary Special (CAT-86) ---\n` + lines86.join('\n') + '\n';
  html = html.replace(HTML_MARKER, insert + HTML_MARKER);
  fs.writeFileSync(HTML, html, 'utf8');
  console.log(`[OK] game.html — ${TOTAL} entries`);
}

// ── 2. lang files (per-key check: only insert missing) ──────
for (const [lang, stage] of Object.entries(LANG_STAGE)) {
  const file = `${HELL}/lang_${lang}.js`;
  let content = fs.readFileSync(file, 'utf8');

  const marker = `'스테이지':'${stage}',`;
  if (!content.includes(marker)) {
    console.error(`[SKIP] ${lang}: marker not found`);
    continue;
  }

  // Only add entries whose ko key is not already present
  const missing = ALL_P.filter(([ko]) => !content.includes(`'${ko}':`));
  if (missing.length === 0) {
    console.log(`[SKIP] ${lang}: all ${TOTAL} entries already present`);
    continue;
  }

  const lines = missing.map(([ko, zh, ja, en]) => {
    let val;
    if (lang === 'zh') val = zh;
    else if (lang === 'ja') val = ja;
    else if (lang === 'zht') val = toTrad(zh);
    else val = en;
    val = val.replace(/'/g, "\\'");
    return `'${ko}':'${val}',`;
  });

  const insert = `// --- CAT-84/85/86: affix names + implicit + legendary ---\n` + lines.join('\n') + '\n';
  content = content.replace(marker, insert + marker);
  fs.writeFileSync(file, content, 'utf8');
  console.log(`[OK] ${lang} — ${missing.length}/${TOTAL} new entries`);
}
console.log('CAT-84/85/86 done.');
