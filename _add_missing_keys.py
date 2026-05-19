#!/usr/bin/env python3
# Add 15 missing translation keys to all 26 lang files
import re, json

translations = {
'STEAM 위시리스트': {
    'zh':'STEAM 愿望单','zht':'STEAM 願望清單','ja':'STEAMウィッシュリスト',
    'es':'Lista de deseos en Steam','ru':'Список желаний Steam','de':'Steam-Wunschliste','ptbr':'Lista de desejos na Steam',
    'fr':'Liste de souhaits Steam','pl':'Lista życzeń Steam','it':'Lista desideri Steam','uk':'Список бажань Steam',
    'tr':'Steam İstek Listesi','vi':'Danh sách yêu thích Steam','th':'สิ่งที่อยากได้บน Steam','id':'Wishlist Steam',
    'ar':'قائمة أمنيات Steam','sv':'Steam-önskelista','da':'Steam-ønskeliste','no':'Steam-ønskeliste',
    'fi':'Steam-toivelista','cs':'Seznam přání ve Steamu','hu':'Steam kívánságlista','ro':'Lista de dorințe Steam',
    'nl':'Steam-verlanglijst','el':'Λίστα Επιθυμιών Steam','bg':'Списък с желания в Steam'
},
'STEAM 위시리스트로 응원해 주세요!': {
    'zh':'请在STEAM添加愿望单支持我们！','zht':'請在STEAM加入願望清單支持我們！',
    'ja':'STEAMウィッシュリストで応援してください！','es':'¡Apóyanos añadiéndonos a tu lista de deseos en Steam!',
    'ru':'Поддержите нас, добавив в список желаний Steam!','de':'Unterstützt uns mit einem Wunschlisten-Eintrag auf Steam!',
    'ptbr':'Apoie-nos adicionando à lista de desejos na Steam!','fr':'Soutenez-nous en ajoutant à votre liste de souhaits Steam !',
    'pl':'Wesprzyj nas dodając do listy życzeń na Steam!','it':'Supportaci aggiungendo alla lista desideri su Steam!',
    'uk':'Підтримайте нас, додавши до списку бажань Steam!','tr':'Steam istek listesine ekleyerek bizi destekleyin!',
    'vi':'Hãy ủng hộ bằng cách thêm vào danh sách yêu thích trên Steam!','th':'สนับสนุนเราด้วยการเพิ่มลงสิ่งที่อยากได้บน Steam!',
    'id':'Dukung kami dengan menambahkan ke wishlist Steam!','ar':'ادعمنا بإضافتنا إلى قائمة الأمنيات على Steam!',
    'sv':'Stöd oss genom att lägga till på Steam-önskelistan!','da':'Støt os ved at tilføje til Steam-ønskelisten!',
    'no':'Støtt oss ved å legge til på Steam-ønskelisten!','fi':'Tue meitä lisäämällä Steam-toivelistalle!',
    'cs':'Podpořte nás přidáním na seznam přání ve Steamu!','hu':'Támogass minket a Steam kívánságlistára való felvétellel!',
    'ro':'Susțineți-ne adăugând pe lista de dorințe Steam!','nl':'Steun ons door toe te voegen aan je Steam-verlanglijst!',
    'el':'Υποστηρίξτε μας προσθέτοντας στη λίστα επιθυμιών Steam!','bg':'Подкрепете ни, като ни добавите в списъка с желания в Steam!'
},
'⚔ 난타!': {
    'zh':'⚔ 乱打！','zht':'⚔ 亂打！','ja':'⚔ 乱打！',
    'es':'⚔ ¡Ráfaga!','ru':'⚔ Град ударов!','de':'⚔ Trommelfeuer!','ptbr':'⚔ Rajada!',
    'fr':'⚔ Déluge !','pl':'⚔ Nawałnica!','it':'⚔ Raffica!','uk':'⚔ Шквал!',
    'tr':'⚔ Yaylım!','vi':'⚔ Loạn đả!','th':'⚔ โจมตีรัว!','id':'⚔ Serangan Brutal!',
    'ar':'⚔ وابل!','sv':'⚔ Skur!','da':'⚔ Byge!','no':'⚔ Byge!',
    'fi':'⚔ Ryöppy!','cs':'⚔ Přívaly!','hu':'⚔ Sortűz!','ro':'⚔ Baraj!',
    'nl':'⚔ Spervuur!','el':'⚔ Καταιγισμός!','bg':'⚔ Градушка!'
},
'⚡ 연격!': {
    'zh':'⚡ 连击！','zht':'⚡ 連擊！','ja':'⚡ 連撃！',
    'es':'⚡ ¡Golpe rápido!','ru':'⚡ Серия ударов!','de':'⚡ Schnellangriff!','ptbr':'⚡ Golpe Rápido!',
    'fr':'⚡ Frappe rapide !','pl':'⚡ Szybkie uderzenie!','it':'⚡ Colpo rapido!','uk':'⚡ Швидкий удар!',
    'tr':'⚡ Hızlı Vuruş!','vi':'⚡ Liên kích!','th':'⚡ โจมตีเร็ว!','id':'⚡ Serangan Cepat!',
    'ar':'⚡ ضربة سريعة!','sv':'⚡ Snabbslag!','da':'⚡ Hurtigt slag!','no':'⚡ Hurtigslag!',
    'fi':'⚡ Pikaisku!','cs':'⚡ Rychlý úder!','hu':'⚡ Gyors csapás!','ro':'⚡ Lovitură rapidă!',
    'nl':'⚡ Snelle slag!','el':'⚡ Ταχύ Χτύπημα!','bg':'⚡ Бърз удар!'
},
'더블탭 or Shift+방향키! 전격이동으로 탈출해!': {
    'zh':'双击或Shift+方向键！闪避脱离！','zht':'雙擊或Shift+方向鍵！閃避脫離！',
    'ja':'ダブルタップまたはShift+方向キー！ダッシュで脱出！','es':'¡Doble toque o Shift+Dir! ¡Esquiva para escapar!',
    'ru':'Двойное нажатие или Shift+направление! Рывок для побега!','de':'Doppeltippen oder Shift+Richtung! Dash zum Entkommen!',
    'ptbr':'Toque duplo ou Shift+Dir! Dash para escapar!','fr':'Double-tap ou Shift+Dir ! Dash pour fuir !',
    'pl':'Podwójne naciśnięcie lub Shift+kier.! Dash do ucieczki!','it':'Doppio tap o Shift+Dir! Scatto per fuggire!',
    'uk':'Подвійне натискання або Shift+напрямок! Ривок для втечі!','tr':'Çift dokunuş veya Shift+Yön! Atılarak kaç!',
    'vi':'Nhấn đúp hoặc Shift+Hướng! Lướt để thoát!','th':'แตะสองครั้งหรือ Shift+ทิศทาง! แดชเพื่อหนี!',
    'id':'Ketuk ganda atau Shift+Arah! Dash untuk kabur!','ar':'نقر مزدوج أو Shift+اتجاه! اندفع للهروب!',
    'sv':'Dubbeltryck eller Shift+riktning! Dasha för att fly!','da':'Dobbelttryk eller Shift+retning! Dash for at flygte!',
    'no':'Dobbeltrykk eller Shift+retning! Dash for å flykte!','fi':'Tuplanäppäin tai Shift+suunta! Syöksy pakoon!',
    'cs':'Dvojitý stisk nebo Shift+směr! Úhyb k útěku!','hu':'Dupla gomb vagy Shift+irány! Vágta a meneküléshez!',
    'ro':'Apăsare dublă sau Shift+direcție! Dash pentru a fugi!','nl':'Dubbeltik of Shift+richting! Dash om te ontsnappen!',
    'el':'Διπλό πάτημα ή Shift+κατεύθυνση! Εφόρμηση για απόδραση!','bg':'Двойно натискане или Shift+посока! Ривок за бягство!'
},
'데모 종료': {
    'zh':'试玩结束','zht':'試玩結束','ja':'デモ終了',
    'es':'Fin de la demo','ru':'Конец демо','de':'Demo beendet','ptbr':'Fim da demo',
    'fr':'Fin de la démo','pl':'Koniec demo','it':'Fine della demo','uk':'Кінець демо',
    'tr':'Demo sonu','vi':'Kết thúc Demo','th':'จบเดโม','id':'Akhir Demo',
    'ar':'نهاية العرض','sv':'Slut på demon','da':'Slut på demoen','no':'Slutt på demoen',
    'fi':'Demon loppu','cs':'Konec dema','hu':'Demó vége','ro':'Sfârșitul demo-ului',
    'nl':'Einde demo','el':'Τέλος Demo','bg':'Край на демото'
},
'독사': {
    'zh':'毒蛇','zht':'毒蛇','ja':'毒蛇',
    'es':'Serpiente venenosa','ru':'Ядовитая змея','de':'Giftschlange','ptbr':'Cobra venenosa',
    'fr':'Serpent venimeux','pl':'Jadowity wąż','it':'Serpente velenoso','uk':'Отруйна змія',
    'tr':'Zehirli yılan','vi':'Rắn độc','th':'งูพิษ','id':'Ular berbisa',
    'ar':'أفعى سامة','sv':'Giftorm','da':'Giftslange','no':'Giftslange',
    'fi':'Myrkkykyy','cs':'Jedovatý had','hu':'Mérgeskígyó','ro':'Șarpe veninos',
    'nl':'Gifslang','el':'Δηλητηριώδες Φίδι','bg':'Отровна змия'
},
'방어↓': {
    'zh':'防御↓','zht':'防禦↓','ja':'防御↓',
    'es':'DEF↓','ru':'ЗАЩ↓','de':'VER↓','ptbr':'DEF↓',
    'fr':'DÉF↓','pl':'OBR↓','it':'DIF↓','uk':'ЗАХ↓',
    'tr':'DEF↓','vi':'PH↓','th':'ป้อง↓','id':'DEF↓',
    'ar':'دفاع↓','sv':'FÖR↓','da':'FOR↓','no':'FOR↓',
    'fi':'PUO↓','cs':'OBR↓','hu':'VÉD↓','ro':'DEF↓',
    'nl':'VER↓','el':'ΑΜΥ↓','bg':'ЗАЩ↓'
},
'여기까지 데모입니다. 정식 출시를 기대해주세요!': {
    'zh':'试玩到此结束。敬请期待正式发售！','zht':'試玩到此結束。敬請期待正式發售！',
    'ja':'デモはここまでです。正式リリースをお楽しみに！','es':'Aquí termina la demo. ¡Esperamos el lanzamiento completo!',
    'ru':'Демо на этом заканчивается. Ждите полную версию!','de':'Das war die Demo. Freut euch auf die Vollversion!',
    'ptbr':'A demo termina aqui. Aguarde o lançamento completo!','fr':'La démo s\'arrête ici. Attendez la sortie complète !',
    'pl':'To koniec demo. Czekajcie na pełną wersję!','it':'La demo finisce qui. Aspettate il rilascio completo!',
    'uk':'Демо закінчується тут. Чекайте на повну версію!','tr':'Demo burada sona eriyor. Tam sürümü bekleyin!',
    'vi':'Đến đây là hết bản demo. Hãy chờ đợi bản chính thức!','th':'เดโมจบลงที่นี่ รอติดตามเวอร์ชันเต็ม!',
    'id':'Demo berakhir di sini. Nantikan rilis penuhnya!','ar':'انتهى العرض هنا. ترقبوا الإصدار الكامل!',
    'sv':'Demon slutar här. Håll utkik efter fullversionen!','da':'Demoen slutter her. Glæd dig til den fulde udgivelse!',
    'no':'Demoen slutter her. Glede deg til den fulle utgivelsen!','fi':'Demo päättyy tähän. Odota täyttä julkaisua!',
    'cs':'Demo končí tady. Těšte se na plnou verzi!','hu':'A demó itt véget ér. Várjátok a teljes verziót!',
    'ro':'Demo-ul se termină aici. Așteptați lansarea completă!','nl':'De demo eindigt hier. Kijk uit naar de volledige release!',
    'el':'Το demo τελειώνει εδώ. Ανυπομονούμε για την πλήρη κυκλοφορία!',
    'bg':'Демото свършва тук. Очаквайте пълната версия!'
},
'프레임 표시 (FPS)': {
    'zh':'显示帧率 (FPS)','zht':'顯示幀率 (FPS)','ja':'フレーム表示 (FPS)',
    'es':'Mostrar FPS','ru':'Показать FPS','de':'FPS anzeigen','ptbr':'Mostrar FPS',
    'fr':'Afficher FPS','pl':'Pokaż FPS','it':'Mostra FPS','uk':'Показати FPS',
    'tr':'FPS Göster','vi':'Hiển thị FPS','th':'แสดง FPS','id':'Tampilkan FPS',
    'ar':'عرض FPS','sv':'Visa FPS','da':'Vis FPS','no':'Vis FPS',
    'fi':'Näytä FPS','cs':'Zobrazit FPS','hu':'FPS megjelenítése','ro':'Afișare FPS',
    'nl':'Toon FPS','el':'Εμφάνιση FPS','bg':'Покажи FPS'
},
'흑요염 파괴자': {
    'zh':'黑曜焰破坏者','zht':'黑曜焰破壞者','ja':'黒曜炎の破壊者',
    'es':'Destructor de Llama Obsidiana','ru':'Обсидиановый Разрушитель','de':'Obsidianflammen-Zerstörer',
    'ptbr':'Destruidor da Chama Obsidiana','fr':'Destructeur de Flamme Obsidienne','pl':'Obsydianowy Niszczyciel',
    'it':'Distruttore della Fiamma Ossidiana','uk':'Обсидіановий Руйнівник','tr':'Obsidyen Alev Yıkıcı',
    'vi':'Phá Hủy Hắc Diệm','th':'ผู้ทำลายเปลวออบซิเดียน','id':'Penghancur Api Obsidian',
    'ar':'مدمر اللهب السبجي','sv':'Obsidianflammans Förstörare','da':'Obsidianflamme-Ødelæggeren',
    'no':'Obsidianflamme-Ødeleggeren','fi':'Obsidiaaniliekin Tuhoaja','cs':'Obsidiánový Ničitel',
    'hu':'Obszidián Láng Pusztító','ro':'Distrugătorul Flăcării de Obsidian','nl':'Obsidiaan Vlam Vernietiger',
    'el':'Καταστροφέας Οψιδιανής Φλόγας','bg':'Обсидианов Унищожител'
},
'🌀 휘두르기!': {
    'zh':'🌀 横扫！','zht':'🌀 橫掃！','ja':'🌀 薙ぎ払い！',
    'es':'🌀 ¡Barrido!','ru':'🌀 Взмах!','de':'🌀 Rundschlag!','ptbr':'🌀 Varredura!',
    'fr':'🌀 Balayage !','pl':'🌀 Zamach!','it':'🌀 Spazzata!','uk':'🌀 Розмах!',
    'tr':'🌀 Savurma!','vi':'🌀 Quét!','th':'🌀 กวาด!','id':'🌀 Sapuan!',
    'ar':'🌀 كنس!','sv':'🌀 Svep!','da':'🌀 Feje!','no':'🌀 Sveip!',
    'fi':'🌀 Pyyhkäisy!','cs':'🌀 Švih!','hu':'🌀 Söprés!','ro':'🌀 Măturare!',
    'nl':'🌀 Zwaai!','el':'🌀 Σάρωση!','bg':'🌀 Замах!'
},
'🐍 독사!': {
    'zh':'🐍 毒蛇！','zht':'🐍 毒蛇！','ja':'🐍 毒蛇！',
    'es':'🐍 ¡Serpiente!','ru':'🐍 Ядовитая змея!','de':'🐍 Giftschlange!','ptbr':'🐍 Cobra!',
    'fr':'🐍 Serpent !','pl':'🐍 Jadowity wąż!','it':'🐍 Serpente!','uk':'🐍 Отруйна змія!',
    'tr':'🐍 Zehirli yılan!','vi':'🐍 Rắn độc!','th':'🐍 งูพิษ!','id':'🐍 Ular berbisa!',
    'ar':'🐍 أفعى سامة!','sv':'🐍 Giftorm!','da':'🐍 Giftslange!','no':'🐍 Giftslange!',
    'fi':'🐍 Myrkkykyy!','cs':'🐍 Jedovatý had!','hu':'🐍 Mérgeskígyó!','ro':'🐍 Șarpe veninos!',
    'nl':'🐍 Gifslang!','el':'🐍 Δηλητηριώδες Φίδι!','bg':'🐍 Отровна змия!'
},
'💥 강타!': {
    'zh':'💥 重击！','zht':'💥 重擊！','ja':'💥 強打！',
    'es':'💥 ¡Golpe!','ru':'💥 Удар!','de':'💥 Schmettern!','ptbr':'💥 Pancada!',
    'fr':'💥 Impact !','pl':'💥 Grom!','it':'💥 Schianto!','uk':'💥 Удар!',
    'tr':'💥 Çarpma!','vi':'💥 Đập!','th':'💥 กระแทก!','id':'💥 Hantam!',
    'ar':'💥 ضربة!','sv':'💥 Smäll!','da':'💥 Smæk!','no':'💥 Smell!',
    'fi':'💥 Isku!','cs':'💥 Úder!','hu':'💥 Csapás!','ro':'💥 Izbitură!',
    'nl':'💥 Klap!','el':'💥 Χτύπημα!','bg':'💥 Удар!'
},
'💥 공성유령 폭발!': {
    'zh':'💥 攻城幽灵爆炸！','zht':'💥 攻城幽靈爆炸！','ja':'💥 攻城幽霊爆発！',
    'es':'💥 ¡Explosión de fantasma de asedio!','ru':'💥 Взрыв осадного призрака!','de':'💥 Belagerungsgeist-Explosion!',
    'ptbr':'💥 Explosão do Fantasma de Cerco!','fr':'💥 Explosion du fantôme de siège !','pl':'💥 Eksplozja oblężniczego ducha!',
    'it':"💥 Esplosione dello spettro d'assedio!",'uk':'💥 Вибух облогового привида!','tr':'💥 Kuşatma Hayaleti Patlaması!',
    'vi':'💥 Nổ U Linh Công Thành!','th':'💥 ผีล้อมเมืองระเบิด!','id':'💥 Ledakan Hantu Pengepungan!',
    'ar':'💥 انفجار شبح الحصار!','sv':'💥 Belägringsspöke-explosion!','da':'💥 Belejringsspøgelseseksplosion!',
    'no':'💥 Beleiringsgjenferd-eksplosjon!','fi':'💥 Piiritysaaveen räjähdys!','cs':'💥 Výbuch obléhacího přízraku!',
    'hu':'💥 Ostromszellem robbanás!','ro':'💥 Explozia fantomei de asediu!','nl':'💥 Belegeringsgeest-explosie!',
    'el':'💥 Έκρηξη Φαντάσματος Πολιορκίας!','bg':'💥 Взрив на обсадния призрак!'
},
}

# Lang file mapping
lang_map = {
    'lang_zh.js':'ZH','lang_zht.js':'ZHT','lang_ja.js':'JA','lang_es.js':'ES',
    'lang_ru.js':'RU','lang_de.js':'DE','lang_ptbr.js':'PTBR','lang_fr.js':'FR',
    'lang_pl.js':'PL','lang_it.js':'IT','lang_uk.js':'UK','lang_tr.js':'TR',
    'lang_vi.js':'VI','lang_th.js':'TH','lang_id.js':'ID','lang_ar.js':'AR',
    'lang_sv.js':'SV','lang_da.js':'DA','lang_no.js':'NO','lang_fi.js':'FI',
    'lang_cs.js':'CS','lang_hu.js':'HU','lang_ro.js':'RO','lang_nl.js':'NL',
    'lang_el.js':'EL','lang_bg.js':'BG',
}

for fname, code_upper in lang_map.items():
    code = code_upper.lower()
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()

    entries = []
    for ko_key, lang_dict in translations.items():
        if f"'{ko_key}'" not in content:
            val = lang_dict.get(code, '')
            # Escape single quotes in value
            val_esc = val.replace("'", "\\'")
            entries.append(f"'{ko_key}':'{val_esc}'")

    if not entries:
        print(f'{fname}: already complete')
        continue

    # Find the closing }; of the main const
    # Search backwards for the last '};\n' or '};' at end
    idx = content.rfind('};')
    if idx == -1:
        print(f'{fname}: ERROR no closing found')
        continue

    # Check if the char before }; needs a comma
    before = content[:idx].rstrip()
    if before and not before.endswith(','):
        content = before + ',\n' + ',\n'.join(entries) + ',\n' + content[idx:]
    else:
        content = before + '\n' + ',\n'.join(entries) + ',\n' + content[idx:]

    with open(fname, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print(f'{fname}: +{len(entries)} keys added')

print('\nDone!')
