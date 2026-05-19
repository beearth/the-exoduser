"""
lobby_i18n.js 수정 스크립트 v2
- 단일 인용 문자열 내 리터럴 개행 → \n 이스케이프
- 문자열 내 아포스트로피 lookahead로 감지 → \' 이스케이프
  (다음 의미있는 문자가 : , } ) 이면 문자열 종결, 아니면 내부 아포스트로피)
"""

SRC = 'G:/hell/lobby_i18n.js.bak_orig'
DST = 'G:/hell/lobby_i18n.js'

with open(SRC, encoding='utf-8') as f:
    text = f.read()

def fix(text):
    result = []
    i = 0
    n = len(text)

    while i < n:
        c = text[i]

        if c == "'":
            # 문자열 시작
            j = i + 1
            buf = ["'"]
            while j < n:
                ch = text[j]

                if ch == '\\':
                    # 이미 이스케이프된 문자 — 그대로 통과
                    buf.append(ch)
                    j += 1
                    if j < n:
                        buf.append(text[j])
                        j += 1

                elif ch == "'":
                    # 아포스트로피 — 문자열 종결인지 내부 문자인지 lookahead
                    k = j + 1
                    # 공백/탭 건너뜀
                    while k < n and text[k] in ' \t':
                        k += 1
                    nxt = text[k] if k < n else ''
                    # 문자열 종결 표시자: : , } ) 줄끝 파일끝
                    if nxt in (':', ',', '}', ')', '\n', '\r', ''):
                        buf.append("'")
                        j += 1
                        break  # 문자열 끝
                    else:
                        # 내부 아포스트로피 — 이스케이프
                        buf.append("\\'")
                        j += 1

                elif ch == '\n':
                    # 리터럴 개행 → \n 이스케이프
                    buf.append('\\n')
                    j += 1

                else:
                    buf.append(ch)
                    j += 1

            result.append(''.join(buf))
            i = j

        else:
            result.append(c)
            i += 1

    return ''.join(result)

fixed = fix(text)

# 줄 수 변화 리포트
orig_lines = text.splitlines()
fixed_lines = fixed.splitlines()
print(f'원본 줄: {len(orig_lines)}  →  수정 줄: {len(fixed_lines)}')
changed = sum(1 for a, b in zip(orig_lines, fixed_lines) if a != b)
print(f'변경된 줄: {changed}')

# 미리보기
cnt = 0
for idx, (a, b) in enumerate(zip(orig_lines, fixed_lines)):
    if a != b:
        print(f'L{idx+1}: {repr(a[:80])}\n   → {repr(b[:80])}')
        cnt += 1
        if cnt >= 6:
            print('...')
            break

with open(DST, 'w', encoding='utf-8') as f:
    f.write(fixed)
print('저장 완료:', DST)
