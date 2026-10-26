"""Read-only TTF cmap audit for the committed 29-language world subtitles."""
import json
import struct
import sys
import unicodedata


def u16(data, at):
    return struct.unpack_from('>H', data, at)[0]


def s16(data, at):
    return struct.unpack_from('>h', data, at)[0]


def u32(data, at):
    return struct.unpack_from('>I', data, at)[0]


def cmap_tables(path):
    data = open(path, 'rb').read()
    count = u16(data, 4)
    cmap = None
    for i in range(count):
        at = 12 + 16 * i
        if data[at:at + 4] == b'cmap':
            cmap = u32(data, at + 8)
            break
    if cmap is None:
        raise ValueError('TTF has no cmap: ' + path)
    records = []
    for i in range(u16(data, cmap + 2)):
        at = cmap + 4 + i * 8
        platform, encoding, offset = u16(data, at), u16(data, at + 2), u32(data, at + 4)
        if platform == 0 or platform == 3 and encoding in (1, 10):
            sub = cmap + offset
            fmt = u16(data, sub)
            if fmt in (4, 12):
                records.append((data, sub, fmt))
    if not records:
        raise ValueError('TTF has no Unicode cmap: ' + path)
    return records


def table_has(data, at, fmt, cp):
    if fmt == 12:
        count = u32(data, at + 12)
        lo, hi = 0, count
        while lo < hi:
            mid = (lo + hi) // 2
            group = at + 16 + mid * 12
            start, end = u32(data, group), u32(data, group + 4)
            if cp < start:
                hi = mid
            elif cp > end:
                lo = mid + 1
            else:
                return u32(data, group + 8) + cp - start != 0
        return False
    if cp > 0xFFFF:
        return False
    count = u16(data, at + 6) // 2
    ends = at + 14
    starts = ends + count * 2 + 2
    deltas = starts + count * 2
    ranges = deltas + count * 2
    for i in range(count):
        end = u16(data, ends + 2 * i)
        if cp > end:
            continue
        start = u16(data, starts + 2 * i)
        if cp < start:
            return False
        offset = u16(data, ranges + 2 * i)
        if offset:
            glyph_at = ranges + 2 * i + offset + 2 * (cp - start)
            glyph = u16(data, glyph_at)
            return glyph != 0 and (glyph + s16(data, deltas + 2 * i)) & 0xFFFF != 0
        return (cp + s16(data, deltas + 2 * i)) & 0xFFFF != 0
    return False


def supported(tables, cp):
    return any(table_has(data, at, fmt, cp) for data, at, fmt in tables)


def visible_chars(cues):
    return {ord(ch) for cue in cues for ch in cue.get('text', '')
            if not ch.isspace() and not unicodedata.category(ch).startswith('C')}


def main():
    data_path, nanum_path, noto_path, output_path = sys.argv[1:5]
    source = json.load(open(data_path, 'r', encoding='utf-8'))
    nanum = cmap_tables(nanum_path)
    noto = cmap_tables(noto_path)
    rows = []
    for language in source['captions']:
        chars = visible_chars(language['cues'])
        missing_nanum = sorted(cp for cp in chars if not supported(nanum, cp))
        missing_noto = sorted(cp for cp in chars if not supported(noto, cp))
        rows.append({
            'code': language['code'], 'cueCount': len(language['cues']), 'visibleCodePoints': len(chars),
            'nanumMissing': [f'U+{cp:04X}' for cp in missing_nanum],
            'nanumMissingText': ''.join(chr(cp) for cp in missing_nanum),
            'notoMissing': [f'U+{cp:04X}' for cp in missing_noto],
            'notoMissingText': ''.join(chr(cp) for cp in missing_noto),
            'notoFallbackEligible': bool(missing_nanum) and not missing_noto,
        })
    report = {'source': data_path, 'nanum': nanum_path, 'noto': noto_path,
              'languageCount': len(rows), 'rows': rows}
    with open(output_path, 'w', encoding='utf-8') as stream:
        json.dump(report, stream, ensure_ascii=False, indent=2)
    for row in rows:
        print(row['code'], 'cues=' + str(row['cueCount']),
              'NanumMissing=' + row['nanumMissingText'], 'NotoMissing=' + row['notoMissingText'],
              'fallback=' + str(row['notoFallbackEligible']))


if __name__ == '__main__':
    main()
