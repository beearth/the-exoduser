#!/usr/bin/env python3
"""
lang_*.js 누락 키 보충 스크립트
HIGH group (ro)에는 있고 LOW group에는 없는 ~500개 키를 Korean→target으로 번역 후 추가
"""
import re, time, sys
from deep_translator import GoogleTranslator

REFERENCE = 'ro'

LOW_LANGS = ['bg','cs','da','de','es','fr','ja','nl','no','pl','ptbr','ru','sv','uk','zh','zht']

LANG_MAP = {
    'bg':   'bg',
    'cs':   'cs',
    'da':   'da',
    'de':   'de',
    'es':   'es',
    'fr':   'fr',
    'ja':   'ja',
    'nl':   'nl',
    'no':   'no',
    'pl':   'pl',
    'ptbr': 'pt',
    'ru':   'ru',
    'sv':   'sv',
    'uk':   'uk',
    'zh':   'zh-CN',
    'zht':  'zh-TW',
}

def get_keys_only(lang):
    with open(f'lang_{lang}.js', encoding='utf-8') as f:
        content = f.read()
    k1 = set(re.findall(r"^'([^']+)'\s*:", content, re.MULTILINE))
    k2 = set(re.findall(r'^"([^"]+)"\s*:', content, re.MULTILINE))
    return k1 | k2

def escape_js(s):
    return s.replace('\\', '\\\\').replace("'", "\\'")

def translate_ko(key, target_code):
    """Translate Korean key text to target language"""
    # Preserve \n
    nl_marker = 'XNEWLINEX'
    text = key.replace('\\n', nl_marker).replace('\n', nl_marker)
    try:
        t = GoogleTranslator(source='ko', target=target_code)
        result = t.translate(text)
        if result:
            result = result.replace(nl_marker, '\\n').replace(nl_marker.lower(), '\\n')
            return escape_js(result)
    except Exception as e:
        print(f'    [ERR] "{key[:25]}" → {target_code}: {e}', flush=True)
    return escape_js(key)

def get_insert_point(content):
    m = re.search(r'\n\};\s*$', content)
    if m:
        return m.start()
    return len(content)

def main():
    ref_keys = get_keys_only(REFERENCE)
    print(f'Reference ({REFERENCE}): {len(ref_keys)} keys', flush=True)

    lang_missing = {}
    for lang in LOW_LANGS:
        existing = get_keys_only(lang)
        missing = sorted(ref_keys - existing)
        lang_missing[lang] = missing
        print(f'{lang}: {len(existing)} keys, missing {len(missing)}', flush=True)

    print(flush=True)

    # Translate and apply per language
    for li, lang in enumerate(LOW_LANGS):
        missing = lang_missing[lang]
        if not missing:
            print(f'[{li+1}/{len(LOW_LANGS)}] {lang}: skip (nothing missing)', flush=True)
            continue

        target_code = LANG_MAP[lang]
        print(f'[{li+1}/{len(LOW_LANGS)}] {lang} ({target_code}): translating {len(missing)} keys...', flush=True)

        translated = {}
        for i, key in enumerate(missing):
            result = translate_ko(key, target_code)
            translated[key] = result
            if (i+1) % 25 == 0:
                print(f'  {i+1}/{len(missing)}...', flush=True)
                time.sleep(0.8)
            else:
                time.sleep(0.06)

        # Apply to lang file
        with open(f'lang_{lang}.js', encoding='utf-8') as f:
            content = f.read()

        lines = []
        for key in missing:
            value = translated.get(key, escape_js(key))
            key_esc = key.replace('\\', '\\\\').replace("'", "\\'")
            lines.append(f"  '{key_esc}': '{value}',")

        insert_block = '\n' + '\n'.join(lines) + '\n'
        insert_pos = get_insert_point(content)
        new_content = content[:insert_pos] + insert_block + content[insert_pos:]

        with open(f'lang_{lang}.js', 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f'  → {lang}: {len(missing)} keys added', flush=True)
        time.sleep(1.0)  # pause between languages

    print('\n=== Done! ===', flush=True)

if __name__ == '__main__':
    main()
