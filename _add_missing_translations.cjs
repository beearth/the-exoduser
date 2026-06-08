const fs=require('fs');

const common = {
  '얼음송곳': {en:'Ice Spike',de:'Eisdorn',es:'Pico de hielo',fr:'Pic de glace',it:'Spina di ghiaccio',ptbr:'Espinho de gelo',ru:'Ледяной шип',ja:'氷の棘',zh:'冰刺',zht:'冰刺',ar:'شوكة جليدية',bg:'Леден шип',cs:'Ledový hrot',da:'Ispig',el:'Παγοβελόνα',fi:'Jääpiikki',hu:'Jégtüske',id:'Duri Es',nl:'IJspiek',no:'Ispigg',pl:'Lodowy kolec',ro:'Țepușă de gheață',sv:'Ispigg',th:'เข็มน้ำแข็ง',tr:'Buz Dikeni',uk:'Крижаний шип',vi:'Gai Băng'},
  '⚡ 뇌전추격자!': {en:'⚡ Lightning Chaser!',de:'⚡ Blitzjäger!',es:'⚡ Cazarrayos!',fr:'⚡ Chasseur de foudre!',it:'⚡ Cacciatore di fulmini!',ptbr:'⚡ Caçador de Raios!',ru:'⚡ Громовой преследователь!',ja:'⚡ 雷電追撃者!',zh:'⚡ 雷电追击者!',zht:'⚡ 雷電追擊者!',ar:'⚡ مطارد البرق!',bg:'⚡ Гръмотевичен преследвач!',cs:'⚡ Bleskový pronásledovatel!',da:'⚡ Lynjæger!',el:'⚡ Κυνηγός κεραυνών!',fi:'⚡ Salamanmetsästäjä!',hu:'⚡ Villáművadász!',id:'⚡ Pemburu Petir!',nl:'⚡ Bliksemjager!',no:'⚡ Lynjeger!',pl:'⚡ Łowca piorunów!',ro:'⚡ Vânătorul de fulgere!',sv:'⚡ Blixtjägare!',th:'⚡ ล่าสายฟ้า!',tr:'⚡ Yıldırım Avcısı!',uk:'⚡ Блискавичний переслідувач!',vi:'⚡ Truy Sét!'},
  '대왕치기 (분노폭발, 광역 기절)': {en:'Giant Slam (Rage Burst, AoE stun)',de:'Riesenschlag (Wutausbruch, Flächenbetäubung)',es:'Golpe gigante (Explosión de furia, Aturdimiento en área)',fr:'Coup géant (Explosion de rage, Étourdissement de zone)',it:'Colpo gigante (Esplosione di furia, Stordimento ad area)',ptbr:'Golpe Gigante (Explosão de Fúria, Atordoamento em área)',ru:'Гигантский удар (Взрыв ярости, Оглушение по области)',ja:'大王打ち (激怒爆発, 範囲スタン)',zh:'巨王击 (狂怒爆发, 范围眩晕)',zht:'巨王擊 (狂怒爆發, 範圍暈眩)',ar:'الضربة العملاقة (انفجار غضب, صعق منطقة)',bg:'Гигантски удар (Избухване на ярост, Зашеметяване)',cs:'Obří úder (Výbuch zuřivosti, Plošné omráčení)',da:'Kæmpesmæk (Raseriudbrud, Områdebedøvelse)',el:'Γιγάντιο χτύπημα (Έκρηξη οργής, Ζάλη περιοχής)',fi:'Jättiisku (Raivoräjähdys, Aluetainnutus)',hu:'Óriáscsapás (Dühkitörés, Területi kábítás)',id:'Pukulan Raksasa (Ledakan Amarah, Stun Area)',nl:'Reuzendreun (Woede-uitbarsting, Gebiedsverdoving)',no:'Kjempesmell (Raserianfall, Områdebedøvelse)',pl:'Gigantyczne uderzenie (Wybuch furii, Ogłuszenie obszarowe)',ro:'Lovitură gigantică (Explozie de furie, Asomare pe zonă)',sv:'Jättesmäll (Raseriutbrott, Områdesbedövning)',th:'ทุบยักษ์ (ระเบิดคลั่ง, สตันพื้นที่)',tr:'Dev Darbe (Öfke Patlaması, Alan Sersemletme)',uk:'Гігантський удар (Вибух люті, Приголомшення зони)',vi:'Đòn Khổng Lồ (Nổ Cuồng Nộ, Choáng Vùng)'},
  '\u26e7 시전...': {en:'\u26e7 Casting...',de:'\u26e7 Wirken...',es:'\u26e7 Lanzando...',fr:'\u26e7 Incantation...',it:'\u26e7 Lancio...',ptbr:'\u26e7 Conjurando...',ru:'\u26e7 Каст...',ja:'\u26e7 詠唱...',zh:'\u26e7 施法...',zht:'\u26e7 施法...',ar:'\u26e7 يلقي...',bg:'\u26e7 Магия...',cs:'\u26e7 Kouzlení...',da:'\u26e7 Kaster...',el:'\u26e7 Ξόρκι...',fi:'\u26e7 Loitsu...',hu:'\u26e7 Varázslás...',id:'\u26e7 Melafalkan...',nl:'\u26e7 Casten...',no:'\u26e7 Kaster...',pl:'\u26e7 Rzucanie...',ro:'\u26e7 Incantație...',sv:'\u26e7 Kastar...',th:'\u26e7 ร่าย...',tr:'\u26e7 Büyü...',uk:'\u26e7 Каст...',vi:'\u26e7 Thi Triển...'},
  '✦ 유니크 공유!': {en:'✦ Unique Share!',de:'✦ Einzigartiges Teilen!',es:'✦ Compartir único!',fr:'✦ Partage unique!',it:'✦ Condivisione unica!',ptbr:'✦ Compartilhamento único!',ru:'✦ Уникальный дележ!',ja:'✦ ユニーク共有!',zh:'✦ 唯一共享!',zht:'✦ 唯一共享!',ar:'✦ مشاركة فريدة!',bg:'✦ Уникално споделяне!',cs:'✦ Unikátní sdílení!',da:'✦ Unik deling!',el:'✦ Μοναδική κοινοποίηση!',fi:'✦ Uniikki jako!',hu:'✦ Egyedi megosztás!',id:'✦ Berbagi Unik!',nl:'✦ Uniek delen!',no:'✦ Unik deling!',pl:'✦ Unikatowe udostępnienie!',ro:'✦ Împărtășire unică!',sv:'✦ Unik delning!',th:'✦ แชร์ยูนิค!',tr:'✦ Benzersiz Paylaşım!',uk:'✦ Унікальний поділ!',vi:'✦ Chia Sẻ Độc Nhất!'},
  '🛡️쉴드+15%': {en:'🛡️Shield+15%',de:'🛡️Schild+15%',es:'🛡️Escudo+15%',fr:'🛡️Bouclier+15%',it:'🛡️Scudo+15%',ptbr:'🛡️Escudo+15%',ru:'🛡️Щит+15%',ja:'🛡️シールド+15%',zh:'🛡️护盾+15%',zht:'🛡️護盾+15%',ar:'🛡️درع+15%',bg:'🛡️Щит+15%',cs:'🛡️Štít+15%',da:'🛡️Skjold+15%',el:'🛡️Ασπίδα+15%',fi:'🛡️Kilpi+15%',hu:'🛡️Pajzs+15%',id:'🛡️Perisai+15%',nl:'🛡️Schild+15%',no:'🛡️Skjold+15%',pl:'🛡️Tarcza+15%',ro:'🛡️Scut+15%',sv:'🛡️Sköld+15%',th:'🛡️โล่+15%',tr:'🛡️Kalkan+15%',uk:'🛡️Щит+15%',vi:'🛡️Khiên+15%'},
  '👿악의+': {en:'👿Malice+',de:'👿Bosheit+',es:'👿Malicia+',fr:'👿Malice+',it:'👿Malizia+',ptbr:'👿Malícia+',ru:'👿Злоба+',ja:'👿悪意+',zh:'👿恶意+',zht:'👿惡意+',ar:'👿حقد+',bg:'👿Злоба+',cs:'👿Zloba+',da:'👿Ondskab+',el:'👿Κακία+',fi:'👿Pahuus+',hu:'👿Gonoszság+',id:'👿Niat Jahat+',nl:'👿Boosheid+',no:'👿Ondskap+',pl:'👿Złośliwość+',ro:'👿Răutate+',sv:'👿Ondska+',th:'👿อาฆาต+',tr:'👿Kötülük+',uk:'👿Злоба+',vi:'👿Ác Ý+'},
  '❄유니크 빙결!': {en:'❄Unique Freeze!',de:'❄Einzigartiges Einfrieren!',es:'❄Congelación única!',fr:'❄Gel unique!',it:'❄Congelamento unico!',ptbr:'❄Congelamento único!',ru:'❄Уникальная заморозка!',ja:'❄ユニーク凍結!',zh:'❄唯一冰冻!',zht:'❄唯一冰凍!',ar:'❄تجميد فريد!',bg:'❄Уникално замразяване!',cs:'❄Unikátní zmrazení!',da:'❄Unik frysning!',el:'❄Μοναδικό πάγωμα!',fi:'❄Uniikki jäädytys!',hu:'❄Egyedi befagyasztás!',id:'❄Pembekuan Unik!',nl:'❄Unieke bevriezing!',no:'❄Unik frysning!',pl:'❄Unikatowe zamrożenie!',ro:'❄Îngheț unic!',sv:'❄Unik frysning!',th:'❄แช่แข็งยูนิค!',tr:'❄Benzersiz Dondurma!',uk:'❄Унікальне заморожування!',vi:'❄Đóng Băng Độc Nhất!'},
  '🔨방어무시!': {en:'🔨DEF Ignore!',de:'🔨DEF Ignorieren!',es:'🔨Ignora DEF!',fr:'🔨Ignore DÉF!',it:'🔨Ignora DIF!',ptbr:'🔨Ignora DEF!',ru:'🔨Игнор защиты!',ja:'🔨防御無視!',zh:'🔨无视防御!',zht:'🔨無視防禦!',ar:'🔨تجاهل الدفاع!',bg:'🔨Игнор защита!',cs:'🔨Ignoruje DEF!',da:'🔨Ignorer DEF!',el:'🔨Αγνόηση ΑΜΥ!',fi:'🔨Ohita DEF!',hu:'🔨DEF figyelmen kívül!',id:'🔨Abaikan DEF!',nl:'🔨DEF negeren!',no:'🔨Ignorer DEF!',pl:'🔨Ignoruj DEF!',ro:'🔨Ignoră DEF!',sv:'🔨Ignorera DEF!',th:'🔨ไม่สนป้องกัน!',tr:'🔨DEF Yoksay!',uk:'🔨Ігнор захисту!',vi:'🔨Bỏ Qua DEF!'},
  '💥유니크 폭발!': {en:'💥Unique Blast!',de:'💥Einzigartige Explosion!',es:'💥Explosión única!',fr:'💥Explosion unique!',it:'💥Esplosione unica!',ptbr:'💥Explosão única!',ru:'💥Уникальный взрыв!',ja:'💥ユニーク爆発!',zh:'💥唯一爆炸!',zht:'💥唯一爆炸!',ar:'💥انفجار فريد!',bg:'💥Уникален взрив!',cs:'💥Unikátní výbuch!',da:'💥Unik eksplosion!',el:'💥Μοναδική έκρηξη!',fi:'💥Uniikki räjähdys!',hu:'💥Egyedi robbanás!',id:'💥Ledakan Unik!',nl:'💥Unieke explosie!',no:'💥Unik eksplosjon!',pl:'💥Unikatowy wybuch!',ro:'💥Explozie unică!',sv:'💥Unik explosion!',th:'💥ระเบิดยูนิค!',tr:'💥Benzersiz Patlama!',uk:'💥Унікальний вибух!',vi:'💥Nổ Độc Nhất!'},
  '👻 투명화!': {en:'👻 Stealth!',de:'👻 Tarnung!',es:'👻 Sigilo!',fr:'👻 Furtivité!',it:'👻 Furtività!',ptbr:'👻 Furtividade!',ru:'👻 Невидимость!',ja:'👻 透明化!',zh:'👻 隐身!',zht:'👻 隱身!',ar:'👻 تخفي!',bg:'👻 Невидимост!',cs:'👻 Neviditelnost!',da:'👻 Usynlighed!',el:'👻 Αορατότητα!',fi:'👻 Näkymättömyys!',hu:'👻 Láthatatlanság!',id:'👻 Siluman!',nl:'👻 Onzichtbaarheid!',no:'👻 Usynlighet!',pl:'👻 Niewidzialność!',ro:'👻 Invizibilitate!',sv:'👻 Osynlighet!',th:'👻 ล่องหน!',tr:'👻 Görünmezlik!',uk:'👻 Невидимість!',vi:'👻 Tàng Hình!'},
  '⚡회피 반격!': {en:'⚡Dodge Counter!',de:'⚡Ausweich-Konter!',es:'⚡Contraataque evasivo!',fr:'⚡Contre-esquive!',it:'⚡Contrattacco evasivo!',ptbr:'⚡Contra-esquiva!',ru:'⚡Контратака уклонения!',ja:'⚡回避カウンター!',zh:'⚡闪避反击!',zht:'⚡閃避反擊!',ar:'⚡هجوم مضاد مراوغ!',bg:'⚡Контраатака с отклонение!',cs:'⚡Úhybný protiútok!',da:'⚡Undvigelsesmodangreb!',el:'⚡Αντεπίθεση αποφυγής!',fi:'⚡Väistövastaisku!',hu:'⚡Kitérő ellentámadás!',id:'⚡Serangan Balik Menghindar!',nl:'⚡Ontwijkingscontra!',no:'⚡Unnvikelsesmotsvar!',pl:'⚡Unikowy kontratak!',ro:'⚡Contraatac de eschivă!',sv:'⚡Undvikande motattack!',th:'⚡หลบตอบโต้!',tr:'⚡Kaçış Karşı Saldırı!',uk:'⚡Контратака ухилення!',vi:'⚡Phản Đòn Né!'},
  '⚠패링 실패!': {en:'⚠Parry Fail!',de:'⚠Parade fehlgeschlagen!',es:'⚠Parada fallida!',fr:'⚠Parade échouée!',it:'⚠Parata fallita!',ptbr:'⚠Aparar falhou!',ru:'⚠Парирование не удалось!',ja:'⚠パリィ失敗!',zh:'⚠弹反失败!',zht:'⚠彈反失敗!',ar:'⚠فشل الصد!',bg:'⚠Неуспешно парирне!',cs:'⚠Parírování selhalo!',da:'⚠Parering mislykkedes!',el:'⚠Αποτυχία απόκρουσης!',fi:'⚠Torjunta epäonnistui!',hu:'⚠Hárítás sikertelen!',id:'⚠Parry Gagal!',nl:'⚠Pareren mislukt!',no:'⚠Parering mislyktes!',pl:'⚠Parowanie nieudane!',ro:'⚠Parare eșuată!',sv:'⚠Parering misslyckades!',th:'⚠แพร์รี่พลาด!',tr:'⚠Savuşturma Başarısız!',uk:'⚠Парирування невдале!',vi:'⚠Đỡ Thất Bại!'},
  '🔥피격→분노!': {en:'🔥Hit→Rage!',de:'🔥Treffer→Wut!',es:'🔥Golpe→Furia!',fr:'🔥Coup→Rage!',it:'🔥Colpo→Furia!',ptbr:'🔥Golpe→Fúria!',ru:'🔥Удар→Ярость!',ja:'🔥被弾→激怒!',zh:'🔥受击→狂怒!',zht:'🔥受擊→狂怒!',ar:'🔥ضربة→غضب!',bg:'🔥Удар→Ярост!',cs:'🔥Zásah→Zuřivost!',da:'🔥Træf→Raseri!',el:'🔥Χτύπημα→Οργή!',fi:'🔥Osuma→Raivo!',hu:'🔥Találat→Düh!',id:'🔥Terkena→Amukan!',nl:'🔥Treffer→Woede!',no:'🔥Treff→Raseri!',pl:'🔥Trafienie→Furia!',ro:'🔥Lovitură→Furie!',sv:'🔥Träff→Raseri!',th:'🔥โดน→คลั่ง!',tr:'🔥Darbe→Öfke!',uk:'🔥Удар→Лють!',vi:'🔥Trúng→Cuồng Nộ!'},
  '✦ 유니크 부활!': {en:'✦ Unique Revive!',de:'✦ Einzigartige Wiederbelebung!',es:'✦ Revivir único!',fr:'✦ Résurrection unique!',it:'✦ Resurrezione unica!',ptbr:'✦ Reviver único!',ru:'✦ Уникальное воскрешение!',ja:'✦ ユニーク復活!',zh:'✦ 唯一复活!',zht:'✦ 唯一復活!',ar:'✦ إحياء فريد!',bg:'✦ Уникално възкресяване!',cs:'✦ Unikátní vzkříšení!',da:'✦ Unik genoplivning!',el:'✦ Μοναδική αναβίωση!',fi:'✦ Uniikki herätys!',hu:'✦ Egyedi feltámadás!',id:'✦ Kebangkitan Unik!',nl:'✦ Unieke herleving!',no:'✦ Unik gjenoppliving!',pl:'✦ Unikatowe wskrzeszenie!',ro:'✦ Înviere unică!',sv:'✦ Unik återupplivning!',th:'✦ ฟื้นคืนยูนิค!',tr:'✦ Benzersiz Diriliş!',uk:'✦ Унікальне воскресіння!',vi:'✦ Hồi Sinh Độc Nhất!'}
};

// Extra for ja/zh/zht
const cjkExtra = {
  '👻 유령!': {ja:'👻 幽霊!',zh:'👻 幽灵!',zht:'👻 幽靈!'},
  '🦴 해골무덤!': {ja:'🦴 骸骨墓!',zh:'🦴 骷髅墓!',zht:'🦴 骷髏墓!'}
};

const langMap = {
  'lang_ar.js':'ar','lang_bg.js':'bg','lang_cs.js':'cs','lang_da.js':'da',
  'lang_de.js':'de','lang_el.js':'el','lang_es.js':'es','lang_fi.js':'fi',
  'lang_fr.js':'fr','lang_hu.js':'hu','lang_id.js':'id','lang_it.js':'it',
  'lang_ja.js':'ja','lang_nl.js':'nl','lang_no.js':'no','lang_pl.js':'pl',
  'lang_ptbr.js':'ptbr','lang_ro.js':'ro','lang_ru.js':'ru','lang_sv.js':'sv',
  'lang_th.js':'th','lang_tr.js':'tr','lang_uk.js':'uk','lang_vi.js':'vi',
  'lang_zh.js':'zh','lang_zht.js':'zht'
};

let totalAdded = 0;
for(const [file, lang] of Object.entries(langMap)){
  let content = fs.readFileSync(file,'utf8');
  let added = 0;
  const lastBrace = content.lastIndexOf('};');
  if(lastBrace===-1){console.log('ERROR: no }; in '+file);continue;}

  let insert = '';
  for(const [ko, trans] of Object.entries(common)){
    if(!content.includes("'"+ko+"'")){
      insert += "'"+ko+"':'"+trans[lang]+"',\n";
      added++;
    }
  }
  if(['ja','zh','zht'].includes(lang)){
    for(const [ko, trans] of Object.entries(cjkExtra)){
      if(!content.includes("'"+ko+"'") && trans[lang]){
        insert += "'"+ko+"':'"+trans[lang]+"',\n";
        added++;
      }
    }
  }

  if(added>0){
    content = content.slice(0,lastBrace) + insert + content.slice(lastBrace);
    fs.writeFileSync(file, content, 'utf8');
    totalAdded += added;
    console.log(file+': +'+added+' entries');
  }
}
console.log('Total added: '+totalAdded);
