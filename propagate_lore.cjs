const fs = require('fs');
const BASE = 'G:/hell';

const KO = '🔴화염→빙결 2배 | 🔵빙결→화염 2배 | ⚪물리=중립 | 악마 처치 시 악의 영혼 드롭';
const TRANS = {
  zh:'🔴火→冰 2倍 | 🔵冰→火 2倍 | ⚪物理=中立 | 击杀恶魔获得恶意之魂',
  ja:'🔴炎→氷 2倍 | 🔵氷→炎 2倍 | ⚪物理=中立 | 悪魔を倒して悪意の魂を獲得',
  es:'🔴Fuego→Hielo 2x | 🔵Hielo→Fuego 2x | ⚪Fís=Neutral | Mata demonios por almas de malicia',
  zht:'🔴火→冰 2倍 | 🔵冰→火 2倍 | ⚪物理=中立 | 擊殺惡魔獲得惡意之魂',
  ru:'🔴Огонь→Лёд ×2 | 🔵Лёд→Огонь ×2 | ⚪Физ=Нейтрал | Убивай демонов ради душ злобы',
  de:'🔴Feuer→Eis 2× | 🔵Eis→Feuer 2× | ⚪Phys=Neutral | Töte Dämonen für Bosheitseelen',
  ptbr:'🔴Fogo→Gelo 2× | 🔵Gelo→Fogo 2× | ⚪Fís=Neutro | Mate demônios por almas de malícia',
  fr:'🔴Feu→Glace 2× | 🔵Glace→Feu 2× | ⚪Phys=Neutre | Tuez des démons pour des âmes de malice',
  pl:'🔴Ogień→Lód 2× | 🔵Lód→Ogień 2× | ⚪Fiz=Neutralny | Zabijaj demony za dusze złości',
  it:'🔴Fuoco→Ghiaccio 2× | 🔵Ghiaccio→Fuoco 2× | ⚪Fis=Neutro | Uccidi demoni per anime di malizia',
  uk:'🔴Вогонь→Лід ×2 | 🔵Лід→Вогонь ×2 | ⚪Фіз=Нейтрал | Вбивай демонів за душі злоби',
  tr:'🔴Ateş→Buz 2× | 🔵Buz→Ateş 2× | ⚪Fiz=Nötr | Kin ruhları için iblis öldür',
  vi:'🔴Lửa→Băng 2× | 🔵Băng→Lửa 2× | ⚪Vật lý=Trung tính | Giết quỷ lấy linh hồn ác ý',
  th:'🔴ไฟ→น้ำแข็ง 2× | 🔵น้ำแข็ง→ไฟ 2× | ⚪กายภาพ=กลาง | ฆ่าปีศาจรับวิญญาณแห่งความเกลียด',
  id:'🔴Api→Es 2× | 🔵Es→Api 2× | ⚪Fis=Netral | Bunuh iblis untuk jiwa kejahatan',
  ar:'🔴نار←جليد ×2 | 🔵جليد←نار ×2 | ⚪جسدي=محايد | اقتل الشياطين لأرواح الحقد',
  sv:'🔴Eld→Is 2× | 🔵Is→Eld 2× | ⚪Fys=Neutral | Döda demoner för illviljesjälar',
  da:'🔴Ild→Is 2× | 🔵Is→Ild 2× | ⚪Fys=Neutral | Dræb dæmoner for ondskabssjæle',
  no:'🔴Ild→Is 2× | 🔵Is→Ild 2× | ⚪Fys=Nøytral | Drep demoner for ondskapssjeler',
  fi:'🔴Tuli→Jää 2× | 🔵Jää→Tuli 2× | ⚪Fys=Neutraali | Tapa demoneja pahuuden sieluista',
  cs:'🔴Oheň→Led 2× | 🔵Led→Oheň 2× | ⚪Fyz=Neutrální | Zabíjej démony pro duše zloby',
  hu:'🔴Tűz→Jég 2× | 🔵Jég→Tűz 2× | ⚪Fiz=Semleges | Öld meg a démonokat gonoszság-lelkekért',
  ro:'🔴Foc→Gheață 2× | 🔵Gheață→Foc 2× | ⚪Fiz=Neutru | Omoară demoni pentru suflete de răutate',
  nl:'🔴Vuur→Ijs 2× | 🔵Ijs→Vuur 2× | ⚪Fys=Neutraal | Dood demonen voor kwaadaardige zielen',
  el:'🔴Φωτιά→Πάγος 2× | 🔵Πάγος→Φωτιά 2× | ⚪Φυσ=Ουδέτερο | Σκότωσε δαίμονες για ψυχές κακίας',
  bg:'🔴Огън→Лед 2× | 🔵Лед→Огън 2× | ⚪Физ=Неутрален | Убивай демони за души на злоба',
};

for(const [code, val] of Object.entries(TRANS)){
  const file = `${BASE}/lang_${code}.js`;
  if(!fs.existsSync(file)){continue;}
  let src = fs.readFileSync(file,'utf8');
  if(src.includes(`'${KO}':`)){console.log(`✅ ${code}: 이미 있음`);continue;}
  const anchor = `\nconst _${code.toUpperCase()}_PFX={`;
  const anchorIdx = src.indexOf(anchor);
  if(anchorIdx===-1){
    // try PTBR etc
    const up = code==='ptbr'?'PTBR':code==='zht'?'ZHT':code.toUpperCase();
    const anchor2 = `\nconst _${up}_PFX={`;
    const idx2 = src.indexOf(anchor2);
    if(idx2===-1){console.log(`${code}: 앵커 못 찾음`);continue;}
    const escaped = val.replace(/'/g,"\\'");
    src = src.slice(0,idx2)+`\n'${KO}':'${escaped}',`+src.slice(idx2);
  } else {
    const escaped = val.replace(/'/g,"\\'");
    src = src.slice(0,anchorIdx)+`\n'${KO}':'${escaped}',`+src.slice(anchorIdx);
  }
  fs.writeFileSync(file,src,'utf8');
  console.log(`✅ ${code}: 추가`);
}
console.log('완료');
