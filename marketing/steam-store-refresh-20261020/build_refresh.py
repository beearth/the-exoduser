"""Steam 상점 About 최신화 업로드 파일 생성 (2026-10-20 홍보팀).

입력: Steamworks 상점 페이지 현지화 내보내기 JSON ({"itemid", "languages": {lang: {field: value}}}).
기본값은 2026-09-09 최종 재내보내기본이다. 업로드 직전에 현재 Steamworks에서 다시 내보낸 파일을
인자로 넘겨 다시 생성한다.

처리:
  - english: About을 한국어 원문 구조와 같은 영문(english_about.txt)으로 교체
  - 나머지 29개 언어: About 첫 문단의 '짧은 설명' 라벨만 삭제, 나머지 원문 불변
  - koreana: 짧은 설명 끝에 마침표가 없으면 추가
출력: store_about_refresh_upload.json (About·짧은 설명 필드만), refresh_report.json
"""
import hashlib
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).parent
DEFAULT_SRC = HERE.parent.parent / 'output/steam_localization_20260909/final_reexport_all.json'
ABOUT = 'app[content][about]'
SHORT = 'app[content][short_description]'
LABEL_RE = re.compile(r'^(\[p\]\[img[^\]]*\]\[/img\])([^\[]+)(\[/p\])')


def tags(s):
    return re.findall(r'\[[^\]]+\]', s)


def main(src_path):
    src = json.loads(Path(src_path).read_text(encoding='utf-8'))
    langs = src['languages']
    english_about = (HERE / 'english_about.txt').read_text(encoding='utf-8').strip()
    # 편집기 붙여넣기용 원문은 따옴표, Steamworks 내보내기·가져오기 JSON은 &quot; 표기를 쓴다.
    english_about = re.sub(r'\[img src="([^"\]]*)"\]', r'[img src=&quot;\1&quot;]', english_about)

    out, report = {}, {}
    ko_tags_after = None
    for lang, fields in langs.items():
        about = fields.get(ABOUT, '')
        if lang == 'english':
            continue
        m = LABEL_RE.match(about)
        assert m, f'{lang}: 첫 문단 라벨 구조를 찾지 못함'
        new_about = m.group(1) + m.group(3) + about[m.end():]
        assert tags(new_about) == tags(about), f'{lang}: 태그 순서가 바뀜'
        assert len(about) - len(new_about) == len(m.group(2)), f'{lang}: 라벨 외 문자 변경'
        entry = {ABOUT: new_about}
        report[lang] = {'removed_label': m.group(2), 'about_chars': len(new_about)}
        if lang == 'koreana':
            ko_tags_after = tags(new_about)
            short = fields.get(SHORT, '')
            if short and not short.endswith('.'):
                entry[SHORT] = short + '.'
                report[lang]['short_period_added'] = True
        out[lang] = entry

    assert ko_tags_after is not None
    en_tags = tags(english_about)
    # 한국어는 본문 중간에 줄바꿈만 있고 태그 구조는 영어와 같아야 한다.
    assert en_tags == ko_tags_after, 'english: 한국어와 태그 구조가 다름'
    assert not re.search('[가-힣]', english_about)
    for banned in ('Live service', 'thirty-five', '35+', 'twenty-one', 'archetypes'):
        assert banned not in english_about, banned
    out['english'] = {ABOUT: english_about}
    report['english'] = {'replaced': True, 'about_chars': len(english_about),
                         'previous_about_chars': len(langs['english'].get(ABOUT, ''))}

    upload = {'itemid': src['itemid'], 'languages': out}
    (HERE / 'store_about_refresh_upload.json').write_text(
        json.dumps(upload, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    src_bytes = Path(src_path).read_bytes()
    (HERE / 'refresh_report.json').write_text(
        json.dumps({'source': Path(src_path).name,
                    'source_sha256': hashlib.sha256(src_bytes).hexdigest(),
                    'itemid': src['itemid'], 'languages': report},
                   ensure_ascii=False, indent=1), encoding='utf-8')
    print(json.dumps({'languages': len(out), 'english_chars': len(english_about)}, ensure_ascii=False))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SRC)
