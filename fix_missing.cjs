const fs = require('fs');

// Section headers - use EN values for all non-translated languages
const sectionHeaders = [
  ["'── 2장 - 벌레굴 ──'", "'── CH2 - Worm Nest ──'"],
  ["'── 4장 - 화염지대 ──'", "'── CH4 - Infernal Wastes ──'"],
  ["'── 6장 - 사도마굴 ──'", "'── CH6 - Apostle Den ──'"],
  ["'── 공통 ──'", "'── Common ──'"],
];

// Per-language additions: { lang: [[key, value], ...] }
const additions = {
  ru: [
    ...sectionHeaders,
  ],
  de: [
    ...sectionHeaders,
    ["'맞아서 사망'", "'Tod durch Treffer'"],
    ["'강화'", "'Verstärken'"],
    ["'합체 스킬로 통합됨'", "'In Fusionsskill integriert'"],
    ["'처치'", "'Kills'"],
    ["'유령불꽃 OFF'", "'Geisterflamme AUS'"],
    ["'슬롯'", "'Slot'"],
    ["'필살기'", "'Ultimativer Skill'"],
    ["'연사 해제'", "'Schnellfeuer AUS'"],
  ],
  pl: [
    ...sectionHeaders,
    ["'☠ 부활력 고갈!'", "'☠ Wskrzeszenie Wyczerpane!'"],
  ],
  it: [
    ["'☠ 부활력 고갈!'", "'☠ Resurrezione Esaurita!'"],
    // Unicode escape entries are functionally OK at runtime (👻 === \u{1F47B})
  ],
  uk: [
    ...sectionHeaders,
    ["'☠ 부활력 고갈!'", "'☠ Відродження Вичерпано!'"],
  ],
  tr: [
    ...sectionHeaders,
    ["'☠ 부활력 고갈!'", "'☠ Diriliş Tükendi!'"],
    // Unicode escape entries are functionally OK at runtime
  ],
  vi: [
    ...sectionHeaders,
    ["'☠ 부활력 고갈!'", "'☠ Hồi Sinh Cạn Kiệt!'"],
    // Unicode escape entries are functionally OK at runtime
  ],
  th: [
    ...sectionHeaders,
    ["'☠ 부활력 고갈!'", "'☠ การฟื้นคืนชีพหมดแล้ว!'"],
    // Unicode escape entries are functionally OK at runtime
  ],
  id: [
    ...sectionHeaders,
    ["'☠ 부활력 고갈!'", "'☠ Kebangkitan Habis!'"],
    // Unicode escape entries are functionally OK at runtime
  ],
  ar: [
    ...sectionHeaders,
    ["'☠ 부활력 고갈!'", "'☠ نفد الإحياء!'"],
    // Unicode escape entries are functionally OK at runtime
  ],
  sv: [
    ...sectionHeaders,
    ["'난이도를 선택하라'", "'Välj svårighetsgrad'"],
    ["'☠ 부활력 고갈!'", "'☠ Återupplivning Slut!'"],
  ],
  da: [
    ...sectionHeaders,
    ["'난이도를 선택하라'", "'Vælg sværhedsgrad'"],
    ["'☠ 부활력 고갈!'", "'☠ Genoplivning Opbrugt!'"],
  ],
  no: [
    ...sectionHeaders,
    ["'난이도를 선택하라'", "'Velg vanskelighetsgrad'"],
    ["'☠ 부활력 고갈!'", "'☠ Gjenopplivning Oppbrukt!'"],
  ],
  fi: [
    ...sectionHeaders,
    ["'난이도를 선택하라'", "'Valitse vaikeustaso'"],
    ["'☠ 부활력 고갈!'", "'☠ Herääminen Käytetty!'"],
    // Unicode escape entries are functionally OK at runtime
  ],
  cs: [
    // CS has 131 missing - full translation
    ["'과부하!'", "'Přetížení!'"],
    ["'키 설정 초기화 완료'", "'Nastavení kláves obnoveno'"],
    ["'맞아서 사망'", "'Zabit zásahem'"],
    ["'죽음 그 자체'", "'Samotná Smrt'"],
    ["'강화'", "'Posílit'"],
    ["'분해할 결정이 없습니다'", "'Žádné krystaly k rozložení'"],
    ["'신성폭발'", "'Posvátný Výbuch'"],
    ["'🛡️💎 무지개→블루콩!'", "'🛡️💎 Duha→Modrý Hrách!'"],
    ["'없음 — 제작하세요!'", "'Žádný — Vyrobte!'"],
    ["'처치'", "'Zabití'"],
    ["'구역'", "'Zóna'"],
    ["'빙결'", "'Zmražení'"],
    ["'⚡ 사슬기동:화염!'", "'⚡ Řetězový Pohon: Plamen!'"],
    ["'ST'", "'ST'"],
    ["'타'", "'Zásah'"],
    ["'💥 밀어내기 모드'", "'💥 Režim Odmrštění'"],
    ["'🕊️흡수'", "'🕊️Absorpce'"],
    ["'💥반사 폭발!'", "'💥Odrazová Exploze!'"],
    ["'⚡ 참회!'", "'⚡ Pokání!'"],
    ["'암전!'", "'Blesk!'"],
    ["'암흑!'", "'Tma!'"],
    ["'암흑창!'", "'Temné Kopí!'"],
    ["'빛창!'", "'Světelné Kopí!'"],
    ["'개 설치!'", "'nasazeno!'"],
    ["'💥 그로기!'", "'💥 Omráčení!'"],
    ["'보상'", "'Bonus'"],
    ["'🌋 지진폭풍!'", "'🌋 Seismická Bouře!'"],
    ["'F슬롯'", "'F Slot'"],
    ["'⚔ 칼날 해방!'", "'⚔ Osvobození Čepele!'"],
    ["'🔨 대왕치기!'", "'🔨 Gigantický Úder!'"],
    ["'전지전능의 왕관'", "'Koruna Všemohoucnosti'"],
    ["'생명의 팔찌'", "'Náramek Života'"],
    ["'유령불꽃 OFF'", "'Duch Plamen VYP'"],
    ["'피웅덩이!'", "'Krvavá Louže!'"],
    ["'보물상자 개봉!'", "'Truhla Otevřena!'"],
    ["'저주 '", "'Kletba '"],
    ["'아이템 선택 필요'", "'Vyberte předmět'"],
    ["'슬롯'", "'Slot'"],
    ["'필살기'", "'Ultimátní'"],
    ["'연사 해제'", "'Rychlopalba VYP'"],
    ["'선택됨'", "'Vybráno'"],
    ["'🔱 작살!'", "'🔱 Harpuna!'"],
    ["' 해제'", "' Sundáno'"],
    ["'F 슬롯 해제'", "'F Slot Zrušen'"],
    ["'⚡ 마력연사!'", "'⚡ Mystická Palba!'"],
    ["'🔥 화염관통!'", "'🔥 Ohnivý Průraz!'"],
    ["'⚔ 칼날!'", "'⚔ Čepel!'"],
    ["'💥 착지!'", "'💥 Přistání!'"],
    ["'⚡ 체간삭감!'", "'⚡ Rozbití Rovnováhy!'"],
    ["'🔥 기동불꽃! '", "'🔥 Řetězový Plamen! '"],
    ["'⚡ 기동전폭! x'", "'⚡ Řetězový Výbuch! x'"],
    ["'🔨 기동파괴 준비!'", "'🔨 Řetězové Drcení Připraveno!'"],
    ["'⚡ 기동전폭 준비!'", "'⚡ Řetězový Výbuch Připraven!'"],
    ["'💫 자동 버스트!'", "'💫 Automatický Výbuch!'"],
    ["'💥폭발!'", "'💥Exploze!'"],
    ["'💎 블루콩!'", "'💎 Modrý Hrách!'"],
    ["'💎 푸른비 ON!'", "'💎 Azurový Déšť ZAP!'"],
    ["'🔥 업화선!'", "'🔥 Paprsek Pekelného Ohně!'"],
    ["'⚡ 전류 방출!'", "'⚡ Výboj Proudu!'"],
    ["'💫 광역!'", "'💫 Plošný!'"],
    ["'💫 피니셔!'", "'💫 Doražení!'"],
    ["'☠ 완전 사망!'", "'☠ Trvalá Smrt!'"],
    ["'💥 지뢰!'", "'💥 Mina!'"],
    ["'⚠ 함정!'", "'⚠ Past!'"],
    ["'❌ Q키로! -'", "'❌ Použijte Q! -'"],
    ["'🛡️💎 블루콩!'", "'🛡️💎 Modrý Hrách!'"],
    ["'✨💎 블루콩!'", "'✨💎 Modrý Hrách!'"],
    ["'💜다크볼!'", "'💜Temná Koule!'"],
    ["'🌨빙결!'", "'🌨Zmražení!'"],
    ["'🕸둔화!'", "'🕸Zpomalení!'"],
    ["'⚠트랩!'", "'⚠Past!'"],
    ["'💥 역병 Finale!'", "'💥 Finále Moru!'"],
    ["'자동회수 HP+'", "'Auto HP+'"],
    ["'MP 부족 — 푸른비 OFF'", "'MP nízko — Azurový Déšť VYP'"],
    ["'⚡🦴 참회 귀환!'", "'⚡🦴 Návrat Pokání!'"],
    ["'⚡악의폭풍!'", "'⚡Bouře Zloby!'"],
    ["'⚡ 암전폭발!'", "'⚡ Blesková Exploze!'"],
    ["'❄ 탈출!'", "'❄ Únik!'"],
    ["'❄🌪️ 얼음보주!'", "'❄🌪️ Ledová Koule!'"],
    ["'❄ 빙결흡인!'", "'❄ Mrazivý Vír!'"],
    ["'☄️ 흡인!'", "'☄️ Vír!'"],
    ["'☄️ 대폭발!'", "'☄️ Megaexploze!'"],
    ["'☄️💥 대폭발!'", "'☄️💥 Megaexploze!'"],
    ["'반사!'", "'Odraz!'"],
    ["'🔴 추적 장판!'", "'🔴 Sledovací Zóna!'"],
    ["'⚔ 환영검!'", "'⚔ Fantomový Meč!'"],
    ["'🌧🌧 화염 폭격!'", "'🌧🌧 Ohnivá Palba!'"],
    ["'💀 내 곁으로!'", "'💀 Pojď ke Mně!'"],
    ["'💀💀 전멸 폭발!'", "'💀💀 Zničující Exploze!'"],
    ["'🌊충격파!'", "'🌊Rázová Vlna!'"],
    ["'💥패링폭발!'", "'💥Výbuch Odrazu!'"],
    ["'벽 충돌! '", "'Kolize se Zdí! '"],
    ["'💀빙마!'", "'💀Ledový Démon!'"],
    ["'처치율 '", "'Míra Zabití '"],
    ["'부활 실패 ('", "'Oživení Selhalo ('"],
    ["'👻 동반부활!'", "'👻 Spolu-Oživení!'"],
    ["'🚪 보스방 개방!'", "'🚪 Místnost Bosse Otevřena!'"],
    ["'🌀균열 발생!'", "'🌀Trhlina Otevřena!'"],
    ["'빙판!'", "'Ledová Podlaha!'"],
    ["'🛡 보호막 '", "'🛡 Štít '"],
    ["'🌀 회전보호막 '", "'🌀 Rotující Štít '"],
    ["'⚡쉴드 파괴!'", "'⚡Zničení Štítu!'"],
    ["'💀 1회부활!'", "'💀 Oživení 1 Život!'"],
    ["'악마화 부활!'", "'Démonické Oživení!'"],
    ["'칼날 없음!'", "'Žádná Čepel!'"],
    ["'❄🌪️ 얼음소용돌이!'", "'❄🌪️ Ledový Vír!'"],
    ["'💥 폭산탄!'", "'💥 Výbušný Výstřel!'"],
    ["'⚡ 전격이동!'", "'⚡ Bleskový Krok!'"],
    ["'💥 폭발 허수아비!'", "'💥 Výbušná Návnada!'"],
    ["'⚡날개치기!'", "'⚡Úder Křídlem!'"],
    ["'🏛️ 악의기둥!'", "'🏛️ Temný Pilíř!'"],
    ["'🌋 지옥강타!'", "'🌋 Pekelný Úder!'"],
    ["'💫 포이즈 파괴!'", "'💫 Zničení Rovnováhy!'"],
    ["'✟ 구속의 영역!'", "'✟ Oblast Pouta!'"],
    ["'⛧ 블랙!'", "'⛧ Černá Hvězda!'"],
    ["'필살기 배정!'", "'Ultimátní Přiřazena!'"],
    ["'합체 Lv.'", "'Úroveň Fúze.'"],
    ["'▲ 창고 → 가방 꺼내기'", "'▲ Sklad → Taška'"],
    ["'⟨ 대기 ⟩'", "'⟨ Čekat ⟩'"],
    ["'불러오기 실패'", "'Načtení Selhalo'"],
    ["'장착'", "'Vybaveno'"],
    ["'강화 실패!'", "'Posílení Selhalo!'"],
    ["'예상 필요 악의'", "'Odh. potřebná Zlovolnost'"],
    ["'희귀 이하'", "'Vzácné nebo nižší'"],
    ["'지금이야! 몰아쳐!!'", "'Teď! Útočte!!'"],
    ...sectionHeaders,
    ["'난이도를 선택하라'", "'Vyberte obtížnost'"],
    ["'☠ 부활력 고갈!'", "'☠ Oživení Vyčerpáno!'"],
  ],
  hu: [
    ...sectionHeaders,
    ["'난이도를 선택하라'", "'Válassz nehézséget'"],
    ["'☠ 부활력 고갈!'", "'☠ Feltámadás Kimerült!'"],
    // Unicode escape entries are functionally OK at runtime
  ],
  ro: [
    ...sectionHeaders,
    ["'난이도를 선택하라'", "'Alege dificultatea'"],
    ["'☠ 부활력 고갈!'", "'☠ Revenire Epuizată!'"],
    // Unicode escape entries are functionally OK at runtime
  ],
  nl: [
    ...sectionHeaders,
    ["'난이도를 선택하라'", "'Kies moeilijkheidsgraad'"],
    ["'☠ 부활력 고갈!'", "'☠ Heropleving Uitgeput!'"],
  ],
  el: [
    ...sectionHeaders,
    ["'난이도를 선택하라'", "'Επίλεξε Δυσκολία'"],
    ["'☠ 부활력 고갈!'", "'☠ Ανάσταση Εξαντλήθηκε!'"],
    // Unicode escape entries are functionally OK at runtime
  ],
  bg: [
    ...sectionHeaders,
    ["'난이도를 선택하라'", "'Изберете Трудност'"],
    ["'☠ 부활력 고갈!'", "'☠ Съживяване Изчерпано!'"],
  ],
};

let totalAdded = 0;
for (const [lang, entries] of Object.entries(additions)) {
  if (entries.length === 0) continue;
  const file = `lang_${lang}.js`;
  let content = fs.readFileSync(file, 'utf8');

  // Find the closing }; of the main table (first one)
  const tblUpper = lang.toUpperCase();
  const tblStart = content.indexOf(`const _${tblUpper}={`);
  const tblEnd = content.indexOf('\n};', tblStart);

  // Build insertion string
  const insert = '\n' + entries.map(([k, v]) => `${k}:${v}`).join(',\n') + ',';

  // Insert before the closing };
  content = content.slice(0, tblEnd) + insert + content.slice(tblEnd);

  fs.writeFileSync(file, content, 'utf8');
  console.log(`${lang}: +${entries.length} entries`);
  totalAdded += entries.length;
}
console.log(`\nTotal entries added: ${totalAdded}`);
