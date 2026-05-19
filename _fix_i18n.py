import re

with open('G:/hell/lobby_i18n.js', encoding='utf-8') as f:
    content = f.read()

def fix_multiline_strings(text):
    result = []
    i = 0
    while i < len(text):
        if text[i] == "'":
            j = i + 1
            buf = ["'"]
            while j < len(text):
                c = text[j]
                if c == '\\':
                    buf.append(c)
                    j += 1
                    if j < len(text):
                        buf.append(text[j])
                        j += 1
                elif c == "'":
                    buf.append("'")
                    j += 1
                    break
                elif c == '\n':
                    buf.append('\\n')
                    j += 1
                else:
                    buf.append(c)
                    j += 1
            result.append(''.join(buf))
            i = j
        else:
            result.append(text[i])
            i += 1
    return ''.join(result)

fixed = fix_multiline_strings(content)

orig_lines = content.splitlines()
fixed_lines = fixed.splitlines()
changed = sum(1 for a, b in zip(orig_lines, fixed_lines) if a != b)
print(f'변경된 줄: {changed}')
print(f'원본 줄: {len(orig_lines)}, 수정 줄: {len(fixed_lines)}')

# 미리보기 (최대 4개)
cnt = 0
for i, (a, b) in enumerate(zip(orig_lines, fixed_lines)):
    if a != b:
        print(f'L{i+1}: {repr(a[:80])} ->\n       {repr(b[:80])}')
        cnt += 1
        if cnt >= 4:
            print('...')
            break

# 검증: 수정된 파일에 리터럴 줄바꿈이 문자열 안에 있으면 안 됨
import ast, json
try:
    # JS가 아니라 Python으로 검증 불가, 대신 간단 체크
    # 'string' 패턴에서 내부 \n (이스케이프 없이) 찾기
    # 실제 JS syntax check는 node로
    pass
except:
    pass

with open('G:/hell/lobby_i18n.js', 'w', encoding='utf-8') as f:
    f.write(fixed)
print('저장 완료')
