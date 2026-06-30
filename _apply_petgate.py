# -*- coding: utf-8 -*-
# Insert the 2 missing pet (crow/cat) boss-gate lines into all 26 lang files.
KA = '…지옥문이 열렸다. 안에서 그것이 기다리고 있어.'   # crow
KB = '문 열렸어! 이제 보스 잡으러 가자!'                # cat

T = {
'zh':   ("……地狱之门已开。它在里面等着你。", "门开了！现在去击败首领吧！"),
'zht':  ("……地獄之門已開。它在裡面等著你。", "門開了！現在去擊敗首領吧！"),
'ja':   ("……地獄の門が開いた。中でそれが待っている。", "門が開いた！さあボスを倒しに行こう！"),
'es':   ("...La Puerta del Infierno está abierta. Te espera dentro.", "¡La puerta está abierta! ¡Vamos a matar al jefe!"),
'ru':   ("...Врата Ада открыты. Оно ждёт тебя внутри.", "Врата открыты! Идём убивать босса!"),
'de':   ("...Das Höllentor ist offen. Es wartet drinnen auf dich.", "Das Tor ist offen! Jetzt erledigen wir den Boss!"),
'ptbr': ("...O Portão do Inferno está aberto. Ele te espera lá dentro.", "O portão abriu! Vamos matar o chefe!"),
'fr':   ("...La Porte des Enfers est ouverte. Elle t'attend à l'intérieur.", "La porte est ouverte ! Allons tuer le boss !"),
'pl':   ("...Wrota Piekieł są otwarte. Czeka na ciebie w środku.", "Wrota otwarte! Chodźmy zabić bossa!"),
'it':   ("...La Porta dell'Inferno è aperta. Ti aspetta dentro.", "La porta è aperta! Andiamo a uccidere il boss!"),
'uk':   ("...Брама Пекла відкрита. Воно чекає на тебе всередині.", "Брама відкрита! Ходімо вбивати боса!"),
'tr':   ("...Cehennem Kapısı açıldı. İçeride seni bekliyor.", "Kapı açıldı! Hadi boss'u öldürelim!"),
'vi':   ("...Cổng Địa Ngục đã mở. Nó đang chờ ngươi bên trong.", "Cổng mở rồi! Đi giết boss thôi!"),
'th':   ("...ประตูนรกเปิดแล้ว มันรอเจ้าอยู่ข้างใน", "ประตูเปิดแล้ว! ไปฆ่าบอสกันเถอะ!"),
'id':   ("...Gerbang Neraka terbuka. Ia menunggumu di dalam.", "Gerbangnya terbuka! Ayo bunuh bos-nya!"),
'ar':   ("...بوابة الجحيم مفتوحة. إنه ينتظرك في الداخل.", "البوابة مفتوحة! هيا نقتل الزعيم!"),
'sv':   ("...Helvetesporten är öppen. Den väntar på dig därinne.", "Porten är öppen! Nu dödar vi bossen!"),
'da':   ("...Helvedesporten er åben. Den venter på dig derinde.", "Porten er åben! Lad os dræbe bossen!"),
'no':   ("...Helvetesporten er åpen. Den venter på deg der inne.", "Porten er åpen! La oss drepe bossen!"),
'fi':   ("...Helvetin portti on auki. Se odottaa sinua sisällä.", "Portti on auki! Mennään tappamaan pomo!"),
'cs':   ("...Pekelná brána je otevřená. Čeká na tebe uvnitř.", "Brána je otevřená! Pojďme zabít bosse!"),
'hu':   ("...A Pokol Kapuja nyitva. Odabent vár rád.", "A kapu nyitva! Menjünk, öljük meg a bosst!"),
'ro':   ("...Poarta Iadului este deschisă. Te așteaptă înăuntru.", "Poarta e deschisă! Hai să ucidem bossul!"),
'nl':   ("...De Hellepoort is open. Het wacht binnen op je.", "De poort is open! Laten we de baas verslaan!"),
'el':   ("...Η Πύλη της Κόλασης άνοιξε. Σε περιμένει μέσα.", "Η πύλη άνοιξε! Πάμε να σκοτώσουμε το αφεντικό!"),
'bg':   ("...Портата на Ада е отворена. То те чака вътре.", "Портата е отворена! Хайде да убием шефа!"),
}

import io
for c,(a,b) in T.items():
    # safety: values must not contain a double quote
    assert '"' not in a and '"' not in b, c
    fn = 'lang_'+c+'.js'
    s = open(fn, encoding='utf-8').read()
    if KA in s or KB in s:
        print(f"{c}: SKIP (already present)"); continue
    marker = 'const _'+c.upper()+'={'
    idx = s.find(marker)
    assert idx>=0, f"marker not found in {c}"
    ins = idx + len(marker)
    # insert right after the opening brace, on a new line
    block = "\n'" + KA + "':\"" + a + "\",\n'" + KB + "':\"" + b + "\","
    s2 = s[:ins] + block + s[ins:]
    open(fn,'w',encoding='utf-8').write(s2)
    print(f"{c}: added")
print("DONE")
