const fs = require('fs');

// 26 keys missing from ALL languages
// Korean key => { lang: translation }
const translations = {
  ' 스킬 해제': {
    ar:' إلغاء المهارة',bg:' Премахване',cs:' Zrušit dovednost',da:' Fjern færdighed',de:' Skill entfernen',
    el:' Αφαίρεση',es:' Quitar habilidad',fi:' Poista taito',fr:' Retirer compétence',hu:' Képesség eltávolítása',
    id:' Lepas skill',it:' Rimuovi abilità',ja:' スキル解除',nl:' Vaardigheid verwijderen',no:' Fjern ferdighet',
    pl:' Usuń umiejętność',ptbr:' Remover habilidade',ro:' Elimină abilitate',ru:' Убрать навык',
    sv:' Ta bort färdighet',th:' ปลดสกิล',tr:' Beceri kaldır',uk:' Зняти навичку',vi:' Bỏ kỹ năng',
    zh:' 解除技能',zht:' 解除技能'
  },
  ' 자동 OFF': {
    ar:' إيقاف تلقائي',bg:' Авто ИЗКЛ',cs:' Auto VYP',da:' Auto FRA',de:' Auto AUS',
    el:' Αυτόματο ΑΠΕΝ',es:' Auto APAGADO',fi:' Auto POIS',fr:' Auto DÉSACT',hu:' Auto KI',
    id:' Auto MATI',it:' Auto OFF',ja:' 自動OFF',nl:' Auto UIT',no:' Auto AV',
    pl:' Auto WYŁ',ptbr:' Auto DESLIGADO',ro:' Auto OPRIT',ru:' Авто ВЫКЛ',
    sv:' Auto AV',th:' อัตโนมัติ ปิด',tr:' Oto KAPALI',uk:' Авто ВИМК',vi:' Tự động TẮT',
    zh:' 自动关',zht:' 自動關'
  },
  ' 자동 ON': {
    ar:' تشغيل تلقائي',bg:' Авто ВКЛ',cs:' Auto ZAP',da:' Auto TIL',de:' Auto AN',
    el:' Αυτόματο ΕΝΕΡΓ',es:' Auto ENCENDIDO',fi:' Auto PÄÄL',fr:' Auto ACTIF',hu:' Auto BE',
    id:' Auto NYALA',it:' Auto ON',ja:' 自動ON',nl:' Auto AAN',no:' Auto PÅ',
    pl:' Auto WŁ',ptbr:' Auto LIGADO',ro:' Auto PORNIT',ru:' Авто ВКЛ',
    sv:' Auto PÅ',th:' อัตโนมัติ เปิด',tr:' Oto AÇIK',uk:' Авто УВІМК',vi:' Tự động BẬT',
    zh:' 自动开',zht:' 自動開'
  },
  'B슬롯 스킬': {
    ar:'مهارة فتحة B',bg:'Умение слот B',cs:'Dovednost slotu B',da:'B-slot færdighed',de:'B-Slot Skill',
    el:'Ικανότητα θέσης B',es:'Habilidad ranura B',fi:'B-paikan taito',fr:'Compétence slot B',hu:'B slot képesség',
    id:'Skill Slot B',it:'Abilità slot B',ja:'Bスロットスキル',nl:'B-slot vaardigheid',no:'B-spor ferdighet',
    pl:'Umiejętność slotu B',ptbr:'Habilidade slot B',ro:'Abilitate slot B',ru:'Навык слота B',
    sv:'B-plats färdighet',th:'สกิลสล็อต B',tr:'B Slot Becerisi',uk:'Навичка слоту B',vi:'Kỹ năng ô B',
    zh:'B栏技能',zht:'B欄技能'
  },
  '\u26e7 시전...': {
    ar:'\u26e7 تحضير...',bg:'\u26e7 Заклинание...',cs:'\u26e7 Sesílání...',da:'\u26e7 Kaster...',de:'\u26e7 Wirken...',
    el:'\u26e7 Εκτέλεση...',es:'\u26e7 Lanzando...',fi:'\u26e7 Loitsii...',fr:'\u26e7 Incantation...',hu:'\u26e7 Idézés...',
    id:'\u26e7 Merapal...',it:'\u26e7 Lancio...',ja:'\u26e7 詠唱...',nl:'\u26e7 Spreuken...',no:'\u26e7 Kaster...',
    pl:'\u26e7 Rzucanie...',ptbr:'\u26e7 Conjurando...',ro:'\u26e7 Incantație...',ru:'\u26e7 Каст...',
    sv:'\u26e7 Trollar...',th:'\u26e7 ร่ายเวท...',tr:'\u26e7 Büyü...',uk:'\u26e7 Каст...',vi:'\u26e7 Thi triển...',
    zh:'\u26e7 施法...',zht:'\u26e7 施法...'
  },
  '\u{1F47B} 유령!': {
    ar:'\u{1F47B} شبح!',bg:'\u{1F47B} Призрак!',cs:'\u{1F47B} Duch!',da:'\u{1F47B} Spøgelse!',de:'\u{1F47B} Geist!',
    el:'\u{1F47B} Φάντασμα!',es:'\u{1F47B} Fantasma!',fi:'\u{1F47B} Haamu!',fr:'\u{1F47B} Fantôme!',hu:'\u{1F47B} Szellem!',
    id:'\u{1F47B} Hantu!',it:'\u{1F47B} Fantasma!',ja:'\u{1F47B} 幽霊!',nl:'\u{1F47B} Geest!',no:'\u{1F47B} Spøkelse!',
    pl:'\u{1F47B} Duch!',ptbr:'\u{1F47B} Fantasma!',ro:'\u{1F47B} Fantomă!',ru:'\u{1F47B} Призрак!',
    sv:'\u{1F47B} Spöke!',th:'\u{1F47B} ผี!',tr:'\u{1F47B} Hayalet!',uk:'\u{1F47B} Привид!',vi:'\u{1F47B} Ma!',
    zh:'\u{1F47B} 幽灵!',zht:'\u{1F47B} 幽靈!'
  },
  '\u{1F9B4} 해골무덤!': {
    ar:'\u{1F9B4} مقبرة العظام!',bg:'\u{1F9B4} Костна гробница!',cs:'\u{1F9B4} Kostěná hrobka!',da:'\u{1F9B4} Knoglegrav!',de:'\u{1F9B4} Knochengruft!',
    el:'\u{1F9B4} Οστεοτάφος!',es:'\u{1F9B4} Tumba Ósea!',fi:'\u{1F9B4} Luuhauta!',fr:'\u{1F9B4} Tombeau d\'os!',hu:'\u{1F9B4} Csontsír!',
    id:'\u{1F9B4} Makam Tulang!',it:'\u{1F9B4} Tomba d\'ossa!',ja:'\u{1F9B4} 骸骨墓!',nl:'\u{1F9B4} Knekkelgraf!',no:'\u{1F9B4} Beingrav!',
    pl:'\u{1F9B4} Kościany grobowiec!',ptbr:'\u{1F9B4} Tumba Óssea!',ro:'\u{1F9B4} Mormânt de oase!',ru:'\u{1F9B4} Костяная гробница!',
    sv:'\u{1F9B4} Bengrav!',th:'\u{1F9B4} สุสานกระดูก!',tr:'\u{1F9B4} Kemik Mezar!',uk:'\u{1F9B4} Кісткова гробниця!',vi:'\u{1F9B4} Mộ Xương!',
    zh:'\u{1F9B4} 骸骨墓!',zht:'\u{1F9B4} 骸骨墓!'
  },
  '☠중독!': {
    ar:'☠ تسمم!',bg:'☠ Отравяне!',cs:'☠ Otrávení!',da:'☠ Forgiftning!',de:'☠ Vergiftung!',
    el:'☠ Δηλητηρίαση!',es:'☠ ¡Envenenamiento!',fi:'☠ Myrkytys!',fr:'☠ Empoisonnement!',hu:'☠ Mérgezés!',
    id:'☠ Keracunan!',it:'☠ Avvelenamento!',ja:'☠中毒!',nl:'☠ Vergiftiging!',no:'☠ Forgiftning!',
    pl:'☠ Zatrucie!',ptbr:'☠ Envenenamento!',ro:'☠ Otrăvire!',ru:'☠ Отравление!',
    sv:'☠ Förgiftning!',th:'☠พิษ!',tr:'☠ Zehirlenme!',uk:'☠ Отруєння!',vi:'☠ Trúng độc!',
    zh:'☠中毒!',zht:'☠中毒!'
  },
  '✟ 신의영역!': {
    ar:'✟ عالم الإله!',bg:'✟ Божествена зона!',cs:'✟ Boží sféra!',da:'✟ Guddommelig zone!',de:'✟ Göttliche Sphäre!',
    el:'✟ Θεϊκό Πεδίο!',es:'✟ ¡Dominio Divino!',fi:'✟ Jumalallinen alue!',fr:'✟ Domaine Divin!',hu:'✟ Isteni terület!',
    id:'✟ Ranah Ilahi!',it:'✟ Dominio Divino!',ja:'✟ 神の領域!',nl:'✟ Goddelijk domein!',no:'✟ Guddommelig sone!',
    pl:'✟ Boska strefa!',ptbr:'✟ Domínio Divino!',ro:'✟ Domeniu Divin!',ru:'✟ Божественная сфера!',
    sv:'✟ Gudomlig sfär!',th:'✟ อาณาจักรศักดิ์สิทธิ์!',tr:'✟ İlahi Alan!',uk:'✟ Божественна сфера!',vi:'✟ Lãnh thổ Thần!',
    zh:'✟ 神之领域!',zht:'✟ 神之領域!'
  },
  '❄ 얼음송곳!': {
    ar:'❄ شوكة جليد!',bg:'❄ Ледено шило!',cs:'❄ Ledový hrot!',da:'❄ Ispig!',de:'❄ Eisdorn!',
    el:'❄ Παγοβελόνα!',es:'❄ ¡Púa de Hielo!',fi:'❄ Jääpiikki!',fr:'❄ Pic de Glace!',hu:'❄ Jégtüske!',
    id:'❄ Tusuk Es!',it:'❄ Spina di Ghiaccio!',ja:'❄ 氷の棘!',nl:'❄ IJspen!',no:'❄ Ispigg!',
    pl:'❄ Lodowy kolec!',ptbr:'❄ Espinho de Gelo!',ro:'❄ Ac de Gheață!',ru:'❄ Ледяной шип!',
    sv:'❄ Ispigg!',th:'❄ เสาน้ำแข็ง!',tr:'❄ Buz Dikeni!',uk:'❄ Крижаний шип!',vi:'❄ Gai Băng!',
    zh:'❄ 冰锥!',zht:'❄ 冰錐!'
  },
  '⟨ 키 입력... ⟩': {
    ar:'⟨ أدخل مفتاح... ⟩',bg:'⟨ Натиснете клавиш... ⟩',cs:'⟨ Stiskněte klávesu... ⟩',da:'⟨ Tryk tast... ⟩',de:'⟨ Taste drücken... ⟩',
    el:'⟨ Πατήστε πλήκτρο... ⟩',es:'⟨ Pulsa tecla... ⟩',fi:'⟨ Paina näppäintä... ⟩',fr:'⟨ Appuyez sur une touche... ⟩',hu:'⟨ Nyomj gombot... ⟩',
    id:'⟨ Tekan tombol... ⟩',it:'⟨ Premi tasto... ⟩',ja:'⟨ キー入力... ⟩',nl:'⟨ Druk toets... ⟩',no:'⟨ Trykk tast... ⟩',
    pl:'⟨ Naciśnij klawisz... ⟩',ptbr:'⟨ Pressione tecla... ⟩',ro:'⟨ Apasă tasta... ⟩',ru:'⟨ Нажмите клавишу... ⟩',
    sv:'⟨ Tryck tangent... ⟩',th:'⟨ กดปุ่ม... ⟩',tr:'⟨ Tuşa bas... ⟩',uk:'⟨ Натисніть клавішу... ⟩',vi:'⟨ Nhấn phím... ⟩',
    zh:'⟨ 按键输入... ⟩',zht:'⟨ 按鍵輸入... ⟩'
  },
  '고정': {
    ar:'ثابت',bg:'Фиксиран',cs:'Pevný',da:'Fast',de:'Fest',
    el:'Σταθερό',es:'Fijo',fi:'Kiinteä',fr:'Fixe',hu:'Rögzített',
    id:'Tetap',it:'Fisso',ja:'固定',nl:'Vast',no:'Fast',
    pl:'Stały',ptbr:'Fixo',ro:'Fix',ru:'Фикс.',
    sv:'Fast',th:'คงที่',tr:'Sabit',uk:'Фікс.',vi:'Cố định',
    zh:'固定',zht:'固定'
  },
  '다음 구역': {
    ar:'المنطقة التالية',bg:'Следващ район',cs:'Další zóna',da:'Næste zone',de:'Nächste Zone',
    el:'Επόμενη ζώνη',es:'Siguiente zona',fi:'Seuraava alue',fr:'Zone suivante',hu:'Következő zóna',
    id:'Area berikutnya',it:'Zona successiva',ja:'次のエリア',nl:'Volgende zone',no:'Neste sone',
    pl:'Następna strefa',ptbr:'Próxima zona',ro:'Zona următoare',ru:'Следующая зона',
    sv:'Nästa zon',th:'พื้นที่ถัดไป',tr:'Sonraki bölge',uk:'Наступна зона',vi:'Vùng tiếp theo',
    zh:'下一区域',zht:'下一區域'
  },
  '돌진/작살': {
    ar:'اندفاع/حربون',bg:'Щурм/Харпун',cs:'Výpad/Harpuna',da:'Stød/Harpun',de:'Ansturm/Harpune',
    el:'Εφόρμηση/Καμάκι',es:'Embestida/Arpón',fi:'Rynnäkkö/Harppuuna',fr:'Charge/Harpon',hu:'Roham/Szigony',
    id:'Seruduk/Tombak',it:'Carica/Arpione',ja:'突進/銛',nl:'Stormloop/Harpoen',no:'Stormløp/Harpun',
    pl:'Szarża/Harpun',ptbr:'Investida/Arpão',ro:'Asalt/Harpon',ru:'Рывок/Гарпун',
    sv:'Framstöt/Harpun',th:'พุ่ง/ฉมวก',tr:'Atılma/Zıpkın',uk:'Ривок/Гарпун',vi:'Lao tới/Lao',
    zh:'突进/鱼叉',zht:'突進/魚叉'
  },
  '쓰러짐...': {
    ar:'سقوط...',bg:'Падане...',cs:'Pád...',da:'Falder...',de:'Zusammenbruch...',
    el:'Πτώση...',es:'Caída...',fi:'Kaatuminen...',fr:'Chute...',hu:'Összeesés...',
    id:'Tumbang...',it:'Caduta...',ja:'倒れる...',nl:'Vallen...',no:'Faller...',
    pl:'Upadek...',ptbr:'Caindo...',ro:'Cădere...',ru:'Падение...',
    sv:'Faller...',th:'ล้ม...',tr:'Düşüş...',uk:'Падіння...',vi:'Gục ngã...',
    zh:'倒下...',zht:'倒下...'
  },
  '우클릭 스킬': {
    ar:'مهارة النقر الأيمن',bg:'Десен клик умение',cs:'Pravé tlačítko dovednost',da:'Højreklik-færdighed',de:'Rechtsklick-Skill',
    el:'Δεξί κλικ ικανότητα',es:'Habilidad clic derecho',fi:'Oikea klikkaus taito',fr:'Compétence clic droit',hu:'Jobb klikk képesség',
    id:'Skill klik kanan',it:'Abilità clic destro',ja:'右クリックスキル',nl:'Rechtsklik vaardigheid',no:'Høyreklikk ferdighet',
    pl:'Umiejętność PPM',ptbr:'Habilidade clique direito',ro:'Abilitate clic dreapta',ru:'Навык ПКМ',
    sv:'Högerklick färdighet',th:'สกิลคลิกขวา',tr:'Sağ tık becerisi',uk:'Навичка ПКМ',vi:'Kỹ năng chuột phải',
    zh:'右键技能',zht:'右鍵技能'
  },
  '줍기': {
    ar:'التقاط',bg:'Събиране',cs:'Sbírání',da:'Saml op',de:'Aufheben',
    el:'Συλλογή',es:'Recoger',fi:'Poimi',fr:'Ramasser',hu:'Felszedés',
    id:'Ambil',it:'Raccolta',ja:'拾う',nl:'Oprapen',no:'Plukk opp',
    pl:'Podnoszenie',ptbr:'Coletar',ro:'Ridicare',ru:'Подбор',
    sv:'Plocka upp',th:'เก็บ',tr:'Toplama',uk:'Підбір',vi:'Nhặt',
    zh:'拾取',zht:'拾取'
  },
  '패드 키 초기화': {
    ar:'إعادة تعيين أزرار الذراع',bg:'Нулиране бутони на пад',cs:'Reset tlačítek gamepadu',da:'Nulstil gamepad-taster',de:'Gamepad-Tasten zurücksetzen',
    el:'Επαναφορά πλήκτρων gamepad',es:'Restablecer teclas del mando',fi:'Nollaa ohjaintaimen näppäimet',fr:'Réinitialiser touches manette',hu:'Gamepad gombok visszaállítása',
    id:'Reset tombol gamepad',it:'Ripristina tasti gamepad',ja:'パッドキー初期化',nl:'Gamepad-toetsen resetten',no:'Nullstill gamepad-taster',
    pl:'Reset przycisków pada',ptbr:'Redefinir teclas do controle',ro:'Resetare taste gamepad',ru:'Сброс кнопок геймпада',
    sv:'Återställ gamepad-knappar',th:'รีเซ็ตปุ่มแพด',tr:'Gamepad tuşlarını sıfırla',uk:'Скинути кнопки геймпада',vi:'Đặt lại phím tay cầm',
    zh:'手柄键位重置',zht:'手柄鍵位重置'
  },
  '패드 키 초기화 완료': {
    ar:'تم إعادة تعيين أزرار الذراع',bg:'Бутони на пада нулирани',cs:'Tlačítka gamepadu resetována',da:'Gamepad-taster nulstillet',de:'Gamepad-Tasten zurückgesetzt',
    el:'Πλήκτρα gamepad επαναφέρθηκαν',es:'Teclas del mando restablecidas',fi:'Ohjaintaimen näppäimet nollattu',fr:'Touches manette réinitialisées',hu:'Gamepad gombok visszaállítva',
    id:'Tombol gamepad direset',it:'Tasti gamepad ripristinati',ja:'パッドキー初期化完了',nl:'Gamepad-toetsen gereset',no:'Gamepad-taster nullstilt',
    pl:'Przyciski pada zresetowane',ptbr:'Teclas do controle redefinidas',ro:'Taste gamepad resetate',ru:'Кнопки геймпада сброшены',
    sv:'Gamepad-knappar återställda',th:'รีเซ็ตปุ่มแพดเรียบร้อย',tr:'Gamepad tuşları sıfırlandı',uk:'Кнопки геймпада скинуто',vi:'Đã đặt lại phím tay cầm',
    zh:'手柄键位已重置',zht:'手柄鍵位已重置'
  },
  '패링': {
    ar:'صد',bg:'Париране',cs:'Parírování',da:'Parering',de:'Parieren',
    el:'Απόκρουση',es:'Bloqueo',fi:'Torjunta',fr:'Parade',hu:'Hárítás',
    id:'Parry',it:'Parata',ja:'パリィ',nl:'Pareren',no:'Parering',
    pl:'Parowanie',ptbr:'Aparar',ro:'Parare',ru:'Парирование',
    sv:'Parering',th:'ปัด',tr:'Savuşturma',uk:'Парирування',vi:'Đỡ',
    zh:'格挡',zht:'格擋'
  },
  '🎮 게임패드 버튼 설정': {
    ar:'🎮 إعدادات أزرار الذراع',bg:'🎮 Настройки бутони на геймпад',cs:'🎮 Nastavení tlačítek gamepadu',da:'🎮 Gamepad-knap indstillinger',de:'🎮 Gamepad-Tastenbelegung',
    el:'🎮 Ρυθμίσεις κουμπιών gamepad',es:'🎮 Configuración botones mando',fi:'🎮 Ohjaintaimen nappiasetukset',fr:'🎮 Configuration boutons manette',hu:'🎮 Gamepad gomb beállítások',
    id:'🎮 Pengaturan tombol gamepad',it:'🎮 Impostazioni tasti gamepad',ja:'🎮 ゲームパッドボタン設定',nl:'🎮 Gamepad-knop instellingen',no:'🎮 Gamepad-knapp innstillinger',
    pl:'🎮 Ustawienia przycisków pada',ptbr:'🎮 Configuração botões controle',ro:'🎮 Setări butoane gamepad',ru:'🎮 Настройка кнопок геймпада',
    sv:'🎮 Gamepad-knapp inställningar',th:'🎮 ตั้งค่าปุ่มเกมแพด',tr:'🎮 Gamepad düğme ayarları',uk:'🎮 Налаштування кнопок геймпада',vi:'🎮 Cài đặt nút tay cầm',
    zh:'🎮 手柄按键设置',zht:'🎮 手柄按鍵設定'
  },
  '💀 ': {
    ar:'💀 ',bg:'💀 ',cs:'💀 ',da:'💀 ',de:'💀 ',
    el:'💀 ',es:'💀 ',fi:'💀 ',fr:'💀 ',hu:'💀 ',
    id:'💀 ',it:'💀 ',ja:'💀 ',nl:'💀 ',no:'💀 ',
    pl:'💀 ',ptbr:'💀 ',ro:'💀 ',ru:'💀 ',
    sv:'💀 ',th:'💀 ',tr:'💀 ',uk:'💀 ',vi:'💀 ',
    zh:'💀 ',zht:'💀 '
  },
  '🔥부활!': {
    ar:'🔥بعث!',bg:'🔥 Възкресение!',cs:'🔥 Vzkříšení!',da:'🔥 Genopstandelse!',de:'🔥 Auferstehung!',
    el:'🔥 Ανάσταση!',es:'🔥 ¡Resurrección!',fi:'🔥 Ylösnousemus!',fr:'🔥 Résurrection!',hu:'🔥 Feltámadás!',
    id:'🔥 Kebangkitan!',it:'🔥 Resurrezione!',ja:'🔥復活!',nl:'🔥 Opstanding!',no:'🔥 Oppstandelse!',
    pl:'🔥 Wskrzeszenie!',ptbr:'🔥 Ressurreição!',ro:'🔥 Înviere!',ru:'🔥 Воскрешение!',
    sv:'🔥 Uppståndelse!',th:'🔥คืนชีพ!',tr:'🔥 Diriliş!',uk:'🔥 Воскресіння!',vi:'🔥 Hồi sinh!',
    zh:'🔥复活!',zht:'🔥復活!'
  },
  '🔥분노 ': {
    ar:'🔥 غضب ',bg:'🔥 Ярост ',cs:'🔥 Zuřivost ',da:'🔥 Raseri ',de:'🔥 Wut ',
    el:'🔥 Οργή ',es:'🔥 Furia ',fi:'🔥 Raivo ',fr:'🔥 Rage ',hu:'🔥 Düh ',
    id:'🔥 Murka ',it:'🔥 Furia ',ja:'🔥怒り ',nl:'🔥 Woede ',no:'🔥 Raseri ',
    pl:'🔥 Furia ',ptbr:'🔥 Fúria ',ro:'🔥 Furie ',ru:'🔥 Ярость ',
    sv:'🔥 Raseri ',th:'🔥โกรธ ',tr:'🔥 Öfke ',uk:'🔥 Лють ',vi:'🔥 Cuồng nộ ',
    zh:'🔥怒气 ',zht:'🔥怒氣 '
  },
  '🔥분노+': {
    ar:'🔥غضب+',bg:'🔥Ярост+',cs:'🔥Zuřivost+',da:'🔥Raseri+',de:'🔥Wut+',
    el:'🔥Οργή+',es:'🔥Furia+',fi:'🔥Raivo+',fr:'🔥Rage+',hu:'🔥Düh+',
    id:'🔥Murka+',it:'🔥Furia+',ja:'🔥怒り+',nl:'🔥Woede+',no:'🔥Raseri+',
    pl:'🔥Furia+',ptbr:'🔥Fúria+',ro:'🔥Furie+',ru:'🔥Ярость+',
    sv:'🔥Raseri+',th:'🔥โกรธ+',tr:'🔥Öfke+',uk:'🔥Лють+',vi:'🔥Cuồng nộ+',
    zh:'🔥怒气+',zht:'🔥怒氣+'
  },
  '🚀 미사일!': {
    ar:'🚀 صاروخ!',bg:'🚀 Ракета!',cs:'🚀 Střela!',da:'🚀 Missil!',de:'🚀 Rakete!',
    el:'🚀 Πύραυλος!',es:'🚀 ¡Misil!',fi:'🚀 Ohjus!',fr:'🚀 Missile!',hu:'🚀 Rakéta!',
    id:'🚀 Misil!',it:'🚀 Missile!',ja:'🚀 ミサイル!',nl:'🚀 Raket!',no:'🚀 Missil!',
    pl:'🚀 Pocisk!',ptbr:'🚀 Míssil!',ro:'🚀 Rachetă!',ru:'🚀 Ракета!',
    sv:'🚀 Missil!',th:'🚀 จรวด!',tr:'🚀 Füze!',uk:'🚀 Ракета!',vi:'🚀 Tên lửa!',
    zh:'🚀 导弹!',zht:'🚀 飛彈!'
  },
};

const files = fs.readdirSync('.').filter(f => /^lang_[a-z]+\.js$/.test(f)).sort();

for (const f of files) {
  const lang = f.match(/lang_(.+)\.js/)[1];
  const content = fs.readFileSync(f, 'utf8');

  const toAdd = [];
  for (const [key, langMap] of Object.entries(translations)) {
    if (!langMap[lang]) continue;

    // Check via Function eval if key exists at runtime
    try {
      const varNames = [...content.matchAll(/const (_[A-Z_]+)\s*=/g)].map(m => m[1]);
      const mainVar = '_' + lang.toUpperCase();
      const fn = new Function(content + '; return ' + mainVar + ';');
      const obj = fn();
      if (obj[key]) continue; // Already exists
    } catch(e) {
      // Fallback to text search
      if (content.includes("'" + key + "'")) continue;
    }

    const val = langMap[lang].replace(/'/g, "\\'");
    const escapedKey = key.replace(/'/g, "\\'");
    toAdd.push("'" + escapedKey + "':'" + val + "'");
  }

  if (toAdd.length === 0) continue;

  // Find end of main object via brace counting
  const varMatch = content.match(/^const _[A-Z]+\s*=\s*\{/m);
  if (!varMatch) { console.log('SKIP ' + f); continue; }
  const mainStart = content.indexOf(varMatch[0]);
  let depth = 0, mainEnd = -1;
  for (let i = mainStart + varMatch[0].length - 1; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') { depth--; if (depth === 0) { mainEnd = i; break; } }
  }
  if (mainEnd === -1) { console.log('SKIP ' + f); continue; }

  const insertion = '\n' + toAdd.join(',\n') + ',\n';
  const newContent = content.slice(0, mainEnd) + insertion + content.slice(mainEnd);
  fs.writeFileSync(f, newContent, 'utf8');
  console.log(f + ': +' + toAdd.length + ' keys');
}

console.log('\nDone!');
