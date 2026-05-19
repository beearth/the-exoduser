#!/usr/bin/env python3
"""
lang_*.js 누락 키 보충 스크립트
HIGH group (ro)에는 있고 LOW group에는 없는 ~500개 키를 번역 후 추가
"""
import re, time, sys
from deep_translator import GoogleTranslator

# HIGH group reference: ro (2339 keys)
REFERENCE = 'ro'

LOW_LANGS = ['bg','cs','da','de','es','fr','ja','nl','no','pl','ptbr','ru','sv','uk','zh','zht']

# deep_translator language codes
LANG_MAP = {
    'bg':   'bg',    # Bulgarian
    'cs':   'cs',    # Czech
    'da':   'da',    # Danish
    'de':   'de',    # German
    'es':   'es',    # Spanish
    'fr':   'fr',    # French
    'ja':   'ja',    # Japanese
    'nl':   'nl',    # Dutch
    'no':   'no',    # Norwegian
    'pl':   'pl',    # Polish
    'ptbr': 'pt',    # Portuguese (Brazil)
    'ru':   'ru',    # Russian
    'sv':   'sv',    # Swedish
    'uk':   'uk',    # Ukrainian
    'zh':   'zh-CN', # Chinese Simplified
    'zht':  'zh-TW', # Chinese Traditional
}

def get_keys_only(lang):
    with open(f'lang_{lang}.js', encoding='utf-8') as f:
        content = f.read()
    k1 = set(re.findall(r"^'([^']+)'\s*:", content, re.MULTILINE))
    k2 = set(re.findall(r'^"([^"]+)"\s*:', content, re.MULTILINE))
    return k1 | k2

def get_kv_from_file(lang):
    """Extract key→value dict from lang file (single-quote keys/values)"""
    with open(f'lang_{lang}.js', encoding='utf-8') as f:
        content = f.read()
    d = {}
    for m in re.finditer(r"^'([^']+)'\s*:\s*'((?:[^'\\]|\\.)*)'", content, re.MULTILINE):
        d[m.group(1)] = m.group(2)
    return d

def escape_js(s):
    """Escape single quotes and backslashes for JS single-quoted strings"""
    return s.replace('\\', '\\\\').replace("'", "\\'")

def translate_text(text, target_code):
    """Translate Korean text to target language"""
    # Preserve \n markers
    marker = '___NEWLINE___'
    text_safe = text.replace('\\n', marker)

    try:
        translator = GoogleTranslator(source='ko', target=target_code)
        result = translator.translate(text_safe)
        if result:
            result = result.replace(marker, '\\n')
            return result
    except Exception as e:
        print(f'    [ERROR] translate "{text[:30]}" → {target_code}: {e}')
    return text  # fallback: Korean

def get_insert_point(content):
    """Find the position to insert new keys (before closing };)"""
    # Find last '};\n' or '};' at end of file
    m = re.search(r'\n\};\s*$', content)
    if m:
        return m.start()
    return len(content)

def main():
    # Load reference (ro)
    ref_kv = get_kv_from_file(REFERENCE)
    ref_keys = set(ref_kv.keys())
    print(f'Reference ({REFERENCE}): {len(ref_kv)} keys')

    # Also load IT for reference (has good translations for many keys)
    it_kv = get_kv_from_file('it')

    # Find union of all missing keys
    all_missing = set()
    lang_missing = {}
    for lang in LOW_LANGS:
        existing = get_keys_only(lang)
        missing = ref_keys - existing
        lang_missing[lang] = missing
        all_missing |= missing
        print(f'{lang}: {len(existing)} keys, missing {len(missing)}')

    print(f'\nTotal unique missing keys: {len(all_missing)}')

    all_missing_sorted = sorted(all_missing)

    # Pre-translate all unique missing keys for each lang code
    # Group langs by same target_code to avoid duplicate translation
    code_to_langs = {}
    for lang in LOW_LANGS:
        code = LANG_MAP[lang]
        code_to_langs.setdefault(code, []).append(lang)

    # Store translations: {target_code: {ko_key: translated_value}}
    translations = {}

    unique_codes = list(code_to_langs.keys())
    for idx, target_code in enumerate(unique_codes):
        langs = code_to_langs[target_code]
        print(f'\n[{idx+1}/{len(unique_codes)}] Translating for {langs} (code={target_code})...')

        # Find keys needed for any of these langs
        needed_keys = set()
        for lang in langs:
            needed_keys |= lang_missing[lang]
        needed_keys_sorted = sorted(needed_keys)

        translations[target_code] = {}

        for i, key in enumerate(needed_keys_sorted):
            # Use IT value as source if available (better quality for many langs)
            if key in it_kv and it_kv[key]:
                source_text = it_kv[key]
                source_lang = 'it'
            else:
                source_text = key  # Korean key is the Korean text
                source_lang = 'ko'

            # Decode escaped chars for translation
            source_decoded = source_text.replace("\\'", "'").replace('\\\\', '\\')

            try:
                translator = GoogleTranslator(source=source_lang, target=target_code)
                # Replace \n before translating
                marker = '___NL___'
                source_for_translate = source_decoded.replace('\\n', marker).replace('\n', marker)
                result = translator.translate(source_for_translate)
                if result:
                    result = result.replace(marker, '\\n').replace(marker.lower(), '\\n')
                    result = escape_js(result)
                else:
                    result = escape_js(source_decoded)
            except Exception as e:
                print(f'  [ERR] key={key[:20]}: {e}')
                result = escape_js(source_decoded)

            translations[target_code][key] = result

            if (i+1) % 20 == 0:
                print(f'  {i+1}/{len(needed_keys_sorted)} done...')
                time.sleep(0.5)  # gentle rate limit
            else:
                time.sleep(0.05)  # small delay between requests

        print(f'  Done: {len(translations[target_code])} translations')

    # Now apply translations to each lang file
    print('\n--- Applying translations to lang files ---')
    for lang in LOW_LANGS:
        target_code = LANG_MAP[lang]
        missing_keys = lang_missing[lang]

        if not missing_keys:
            print(f'{lang}: nothing to add')
            continue

        with open(f'lang_{lang}.js', encoding='utf-8') as f:
            content = f.read()

        # Build insertion block
        lines = []
        for key in sorted(missing_keys):
            value = translations[target_code].get(key, escape_js(key))
            # Escape key too
            key_escaped = key.replace('\\', '\\\\').replace("'", "\\'")
            lines.append(f"  '{key_escaped}': '{value}',")

        insert_block = '\n'.join(lines) + '\n'

        # Find insert point (before closing };)
        insert_pos = get_insert_point(content)
        new_content = content[:insert_pos] + '\n' + insert_block + content[insert_pos:]

        with open(f'lang_{lang}.js', 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f'{lang}: added {len(missing_keys)} keys')

    print('\n=== Done! ===')

if __name__ == '__main__':
    main()
