const fs = require('fs');

const translations = {
  'lang_ja.js': [
    ['데모 종료', 'デモ終了'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'デモはここまでです。正式リリースをお楽しみに！'],
    ['STEAM 위시리스트로 응원해 주세요!', 'Steamのウィッシュリストで応援してください！'],
    ['STEAM 위시리스트', 'Steam ウィッシュリスト'],
  ],
  'lang_zh.js': [
    ['데모 종료', '演示结束'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', '演示到此结束。敬请期待正式版！'],
    ['STEAM 위시리스트로 응원해 주세요!', '请在 Steam 心愿单中支持我们！'],
    ['STEAM 위시리스트', 'Steam 心愿单'],
  ],
  'lang_zht.js': [
    ['데모 종료', '試玩版結束'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', '試玩到此結束。敬請期待正式版！'],
    ['STEAM 위시리스트로 응원해 주세요!', '請在 Steam 願望清單中支持我們！'],
    ['STEAM 위시리스트', 'Steam 願望清單'],
  ],
  'lang_es.js': [
    ['데모 종료', 'Fin de la Demo'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'Este es el final de la demo. ¡Esperamos el lanzamiento completo!'],
    ['STEAM 위시리스트로 응원해 주세요!', '¡Apóyanos añadiéndolo a tu lista de deseos en Steam!'],
    ['STEAM 위시리스트', 'Lista de deseos Steam'],
  ],
  'lang_ru.js': [
    ['데모 종료', 'Конец Демо'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'Это конец демоверсии. С нетерпением ждём полного релиза!'],
    ['STEAM 위시리스트로 응원해 주세요!', 'Поддержите нас, добавив игру в список желаемого Steam!'],
    ['STEAM 위시리스트', 'Steam Желаемое'],
  ],
  'lang_de.js': [
    ['데모 종료', 'Ende der Demo'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'Dies ist das Ende der Demo. Wir freuen uns auf den vollständigen Release!'],
    ['STEAM 위시리스트로 응원해 주세요!', 'Unterstütze uns, indem du es auf Steam in deine Wunschliste aufnimmst!'],
    ['STEAM 위시리스트', 'Steam-Wunschliste'],
  ],
  'lang_ptbr.js': [
    ['데모 종료', 'Fim da Demo'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'Este é o fim da demo. Aguardamos o lançamento completo!'],
    ['STEAM 위시리스트로 응원해 주세요!', 'Apoie-nos adicionando à lista de desejos da Steam!'],
    ['STEAM 위시리스트', 'Lista de Desejos Steam'],
  ],
  'lang_fr.js': [
    ['데모 종료', 'Fin de la Démo'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', "C\\'est la fin de la démo. Vivement la sortie complète !"],
    ['STEAM 위시리스트로 응원해 주세요!', 'Soutenez-nous en ajoutant le jeu à votre liste de souhaits Steam !'],
    ['STEAM 위시리스트', 'Liste de souhaits Steam'],
  ],
  'lang_pl.js': [
    ['데모 종료', 'Koniec Dema'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'To koniec dema. Czekamy na pełne wydanie!'],
    ['STEAM 위시리스트로 응원해 주세요!', 'Wesprzyj nas, dodając grę do listy życzeń Steam!'],
    ['STEAM 위시리스트', 'Lista życzeń Steam'],
  ],
  'lang_it.js': [
    ['데모 종료', 'Fine della Demo'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', "Questa è la fine della demo. Non vediamo l\\'ora del lancio completo!"],
    ['STEAM 위시리스트로 응원해 주세요!', 'Supportaci aggiungendolo alla lista dei desideri di Steam!'],
    ['STEAM 위시리스트', 'Lista dei desideri Steam'],
  ],
  'lang_uk.js': [
    ['데모 종료', 'Кінець Демо'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'Це кінець демо-версії. Чекаємо на повний реліз!'],
    ['STEAM 위시리스트로 응원해 주세요!', 'Підтримайте нас, додавши гру до списку бажань Steam!'],
    ['STEAM 위시리스트', 'Список бажань Steam'],
  ],
  'lang_tr.js': [
    ['데모 종료', 'Demo Sonu'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'Demo burada bitiyor. Tam sürüm için heyecanla bekliyoruz!'],
    ['STEAM 위시리스트로 응원해 주세요!', 'Steam istek listenize ekleyerek bizi destekleyin!'],
    ['STEAM 위시리스트', 'Steam İstek Listesi'],
  ],
  'lang_vi.js': [
    ['데모 종료', 'Kết Thúc Demo'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'Đây là phần kết của bản demo. Mong chờ bản phát hành đầy đủ!'],
    ['STEAM 위시리스트로 응원해 주세요!', 'Hãy thêm vào danh sách yêu thích trên Steam để ủng hộ chúng tôi!'],
    ['STEAM 위시리스트', 'Danh sách yêu thích Steam'],
  ],
  'lang_th.js': [
    ['데모 종료', 'สิ้นสุดเดโม'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'นี่คือจุดสิ้นสุดของเดโม รอคอยเวอร์ชันเต็มกันเลย!'],
    ['STEAM 위시리스트로 응원해 주세요!', 'สนับสนุนเราด้วยการเพิ่มในรายการความปรารถนาบน Steam!'],
    ['STEAM 위시리스트', 'รายการความปรารถนา Steam'],
  ],
  'lang_id.js': [
    ['데모 종료', 'Akhir Demo'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'Ini adalah akhir dari demo. Nantikan rilis penuhnya!'],
    ['STEAM 위시리스트로 응원해 주세요!', 'Dukung kami dengan menambahkan ke daftar keinginan Steam!'],
    ['STEAM 위시리스트', 'Daftar Keinginan Steam'],
  ],
  'lang_ar.js': [
    ['데모 종료', 'نهاية العرض التجريبي'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'هذه نهاية العرض التجريبي. نتطلع إلى الإصدار الكامل!'],
    ['STEAM 위시리스트로 응원해 주세요!', 'ادعمنا بإضافة اللعبة إلى قائمة أمنياتك على Steam!'],
    ['STEAM 위시리스트', 'قائمة أمنيات Steam'],
  ],
  'lang_sv.js': [
    ['데모 종료', 'Slut på Demo'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'Det här är slutet på demon. Vi ser fram emot den fullständiga lanseringen!'],
    ['STEAM 위시리스트로 응원해 주세요!', 'Stöd oss genom att lägga till spelet på din önskelista på Steam!'],
    ['STEAM 위시리스트', 'Önskelista Steam'],
  ],
  'lang_da.js': [
    ['데모 종료', 'Slut på Demo'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'Dette er slutningen på demoen. Vi glæder os til den fulde udgivelse!'],
    ['STEAM 위시리스트로 응원해 주세요!', 'Støt os ved at tilføje spillet til din ønskeliste på Steam!'],
    ['STEAM 위시리스트', 'Steam-ønskeliste'],
  ],
  'lang_no.js': [
    ['데모 종료', 'Slutt på Demo'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'Dette er slutten på demoen. Vi ser frem til den fulle lanseringen!'],
    ['STEAM 위시리스트로 응원해 주세요!', 'Støtt oss ved å legge til spillet på ønskelisten din på Steam!'],
    ['STEAM 위시리스트', 'Steam-ønskeliste'],
  ],
  'lang_fi.js': [
    ['데모 종료', 'Demon Loppu'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'Tämä on demon loppu. Odotamme innolla täyttä julkaisua!'],
    ['STEAM 위시리스트로 응원해 주세요!', 'Tue meitä lisäämällä peli Steam-toivelistaasi!'],
    ['STEAM 위시리스트', 'Steam-toivelista'],
  ],
  'lang_cs.js': [
    ['데모 종료', 'Konec Dema'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'To je konec dema. Těšíme se na plné vydání!'],
    ['STEAM 위시리스트로 응원해 주세요!', 'Podpořte nás přidáním hry do seznamu přání na Steamu!'],
    ['STEAM 위시리스트', 'Seznam přání Steam'],
  ],
  'lang_hu.js': [
    ['데모 종료', 'Demo Vége'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'Ez a demo vége. Várjuk a teljes megjelenést!'],
    ['STEAM 위시리스트로 응원해 주세요!', 'Támogass minket azzal, hogy Steam kívánságlistádra teszed!'],
    ['STEAM 위시리스트', 'Steam kívánságlista'],
  ],
  'lang_ro.js': [
    ['데모 종료', 'Sfârşitul Demo-ului'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'Acesta este sfârșitul demo-ului. Abia așteptăm lansarea completă!'],
    ['STEAM 위시리스트로 응원해 주세요!', 'Susține-ne adăugând jocul pe lista de dorințe Steam!'],
    ['STEAM 위시리스트', 'Lista de dorințe Steam'],
  ],
  'lang_nl.js': [
    ['데모 종료', 'Einde van de Demo'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'Dit is het einde van de demo. We kijken uit naar de volledige release!'],
    ['STEAM 위시리스트로 응원해 주세요!', 'Steun ons door het spel aan je Steam-verlanglijst toe te voegen!'],
    ['STEAM 위시리스트', 'Steam-verlanglijst'],
  ],
  'lang_el.js': [
    ['데모 종료', 'Τέλος Demo'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'Αυτό είναι το τέλος του demo. Ανυπομονούμε για την πλήρη κυκλοφορία!'],
    ['STEAM 위시리스트로 응원해 주세요!', 'Υποστήριξέ μας προσθέτοντας το παιχνίδι στη λίστα επιθυμιών σου στο Steam!'],
    ['STEAM 위시리스트', 'Λίστα επιθυμιών Steam'],
  ],
  'lang_bg.js': [
    ['데모 종료', 'Край на Демото'],
    ['여기까지 데모입니다. 정식 출시를 기대해주세요!', 'Това е краят на демото. С нетърпение очакваме пълното издание!'],
    ['STEAM 위시리스트로 응원해 주세요!', 'Подкрепете ни, като добавите играта в списъка с желания в Steam!'],
    ['STEAM 위시리스트', 'Списък с желания Steam'],
  ],
};

let ok = 0, err = 0;
for (const [fname, pairs] of Object.entries(translations)) {
  const path = 'G:/hell/' + fname;
  try {
    let content = fs.readFileSync(path, 'utf8');
    const insertion = '// --- Demo End Screen ---\n' +
      pairs.map(([k, v]) => "'" + k + "':'" + v + "',").join('\n') + '\n';
    const lastIdx = content.lastIndexOf('};');
    if (lastIdx === -1) { console.log('NO }; in ' + fname); err++; continue; }
    content = content.slice(0, lastIdx) + insertion + '};';
    fs.writeFileSync(path, content, 'utf8');
    console.log('OK: ' + fname);
    ok++;
  } catch(e) { console.log('ERROR ' + fname + ': ' + e.message); err++; }
}
console.log('Done: ' + ok + ' ok, ' + err + ' errors');
