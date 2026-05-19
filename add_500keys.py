# add_500keys.py — lang 파일 누락 키 추가
import re

def read_lang(lang):
    with open(f'G:/hell/lang_{lang}.js', encoding='utf-8') as f:
        return f.read()

def write_lang(lang, content):
    with open(f'G:/hell/lang_{lang}.js', 'w', encoding='utf-8') as f:
        f.write(content)

def get_keys(content):
    return set(re.findall(r"^'([^']+)'\s*:", content, re.MULTILINE))

# 번역 데이터: {ko_key: {lang: translation}}
TRANSLATIONS = {
    '👻 유령!': {
        'bg': '👻 Призрак!',
        'cs': '👻 Duch!',
        'da': '👻 Spøgelse!',
        'de': '👻 Geist!',
        'es': '👻 ¡Fantasma!',
        'fr': '👻 Fantôme!',
        'ja': '👻 幽霊！',
        'nl': '👻 Geest!',
        'no': '👻 Spøkelse!',
        'pl': '👻 Duch!',
        'ptbr': '👻 Fantasma!',
        'ru': '👻 Призрак!',
        'sv': '👻 Spöke!',
        'uk': '👻 Привид!',
        'zh': '👻 幽灵！',
        'zht': '👻 幽靈！',
    },
    '🦴 해골무덤!': {
        'bg': '🦴 Костна могила!',
        'cs': '🦴 Kostní hrob!',
        'da': '🦴 Knokkelgrav!',
        'de': '🦴 Knochengrab!',
        'es': '🦴 ¡Tumba de Huesos!',
        'fr': '🦴 Tombeau d\'Os!',
        'ja': '🦴 骸骨の墓！',
        'nl': '🦴 Botgraf!',
        'no': '🦴 Beinhaug!',
        'pl': '🦴 Kostny Grób!',
        'ptbr': '🦴 Túmulo de Ossos!',
        'ru': '🦴 Костяная могила!',
        'sv': '🦴 Bengrav!',
        'uk': '🦴 Кісткова могила!',
        'zh': '🦴 骷髅墓！',
        'zht': '🦴 骷髏墓！',
    },
    '추적자의': {
        'da': 'Jægerens',
        'nl': 'van de Vervolger',
        'no': 'Forfølgerens',
        'sv': 'Förföljaren',
    },
    # fr 전용 누락 키 (튜토리얼 대사)
    '...따라오는 거 아니야. 같은 방향일 뿐이지.': {
        'fr': '...Je ne te suis pas. C\'est juste la même direction.',
    },
    '...마시든 말든. 네 목숨이니까.': {
        'fr': '...Bois ou non. C\'est ta vie.',
    },
    '...말은 못해.': {
        'fr': '...Ne peut pas parler.',
    },
    '...버리기 아까운 건 창고에.': {
        'fr': '...Mets ce qui vaut trop dans l\'entrepôt.',
    },
    '...얼어붙은 놈은 오래 안 간다.': {
        'fr': '...Les gelés ne durent pas.',
    },
    '...여기가 끝이야. 돌아갈 길은 없어.': {
        'fr': '...C\'est la fin. Pas de retour.',
    },
    '...이 냄새. 살점이 썩는 냄새야.': {
        'fr': '...Cette odeur. Chair en décomposition.',
    },
    '...힘을 골라라. 전부 가질 순 없다.': {
        'fr': '...Choisis ta force. Tu ne peux pas tout avoir.',
    },
    'Shift를 눌러. 작살이다. 땅에 꽂아서 끌려가!': {
        'fr': 'Appuie sur Shift. C\'est le harpon. Plante-le et laisse-toi traîner!',
    },
    'Z. 필살기다. 아껴 써라.': {
        'fr': 'Z. C\'est ton ultime. Utilise-le avec soin.',
    },
    '가방 터지겠다! V 눌러서 창고에 넣어둬!': {
        'fr': 'Le sac va exploser! Appuie sur V!',
    },
    '공기가 달라졌어. 더 썩었군.': {
        'fr': 'L\'air a changé. Plus pourri.',
    },
    '됐어! 감 잡았구나.': {
        'fr': 'Bien! Tu as compris.',
    },
    '못 하겠으면 때려. 안 죽으면 그만이야.': {
        'fr': 'Tu ne peux pas parer? Frappe. Tant que tu survis.',
    },
    '무지개빛은 패링 불가! 피해!': {
        'fr': 'L\'arc-en-ciel ne peut pas être paré! Esquive!',
    },
    '빨간 탄을 무서워하지 마. 악의가 강하다.': {
        'fr': 'N\'aie pas peur des balles rouges. La malice est forte.',
    },
    '여기 오래 있으면 미쳐. 나도, 너도.': {
        'fr': 'Rester trop longtemps ici rend fou. Moi aussi.',
    },
    '여기부터는 악마 영역이야. ...맘대로 해.': {
        'fr': 'Territoire démoniaque d\'ici. ...Fais ce que tu veux.',
    },
    '예쁘다고 만지면 죽어.': {
        'fr': 'Tu touches parce que c\'est joli? Tu mourras.',
    },
    '유령쇠뇌야. 인사해.': {
        'fr': 'C\'est l\'arbalète fantôme. Salue-la.',
    },
    '이 길의 끝에 뭐가 있을까. ...알고 싶지도 않어.': {
        'fr': 'Qu\'y a-t-il au bout de ce chemin? ...Je ne veux pas savoir.',
    },
    '일어나. 여신이 널 여기 보낸 건 죽으라고가 아니야.': {
        'fr': 'Lève-toi. La déesse ne t\'a pas envoyé ici pour mourir.',
    },
    '작살 던져! 끌려가면 무적이야!': {
        'fr': 'Lance le harpon! Invincible quand tu es traîné!',
    },
    '작살로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아.': {
        'fr': 'Tu es invincible quand le harpon te traîne. Utilise-le en danger.',
    },
    '좋아, 감각이 있군. 계속 쳐!': {
        'fr': 'Bien, tu as l\'instinct. Continue à frapper!',
    },
    '피가 새고 있다. Shift. 빠져.': {
        'fr': 'Tu saignes. Shift. Pars.',
    },
    '흥, 작살 못 맞추면 헛수고야.': {
        'fr': 'Hmph, rater le harpon et c\'est en vain.',
    },
}

TARGET_LANGS = ['bg','cs','da','de','es','fr','ja','nl','no','pl','ptbr','ru','sv','uk','zh','zht']

ro_content = read_lang('ro')
ro_keys = get_keys(ro_content)

for lang in TARGET_LANGS:
    content = read_lang(lang)
    lang_keys = get_keys(content)
    missing = ro_keys - lang_keys

    new_entries = []
    for ko_key in sorted(missing):
        if ko_key in TRANSLATIONS and lang in TRANSLATIONS[ko_key]:
            val = TRANSLATIONS[ko_key][lang]
            # 작은따옴표 이스케이프
            val_escaped = val.replace("'", "\\'")
            new_entries.append(f"'{ko_key}':'{val_escaped}'")
        else:
            print(f'WARNING: {lang} - no translation for: {repr(ko_key)}')

    if new_entries:
        insertion = ',\n'.join(new_entries) + ',\n'
        # 마지막 }; 바로 앞에 삽입
        content = content.rstrip()
        if content.endswith('};'):
            content = content[:-2] + insertion + '};'
        else:
            print(f'ERROR: {lang} - unexpected file ending')
            continue
        write_lang(lang, content)
        print(f'{lang}: {len(new_entries)}개 추가')
    else:
        print(f'{lang}: 추가 없음')

print('\n=== 검증 ===')
for lang in TARGET_LANGS:
    with open(f'G:/hell/lang_{lang}.js', encoding='utf-8') as f:
        c = f.read()
    cnt = len(re.findall(r"^'([^']+)'\s*:", c, re.MULTILINE))
    print(f'{lang}: {cnt}')
