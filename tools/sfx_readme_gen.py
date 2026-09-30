#!/usr/bin/env python3
"""Generate sfx/SFX_README.md from the game's sample registry (S-07).

Source of truth: `const _sampleFiles={ key:'sfx/...', // comment }` in game.html.
Every audio file under sfx/ is listed with the registry keys that load it and
the code comment on that line; files no key loads are marked unreferenced.

Usage:  python3 tools/sfx_readme_gen.py          # rewrite sfx/SFX_README.md
        python3 tools/sfx_readme_gen.py --check  # exit 1 if the README is stale
Owned by docs/6사운드디자인/SOUND_TEAM_LEAD.md.
"""
import os, re, sys, collections, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "sfx", "SFX_README.md")
AUDIO = re.compile(r"\.(mp3|wav|ogg|m4a)$", re.I)
ENTRY = re.compile(r"^\s*([A-Za-z0-9_]+)\s*:\s*'(sfx/[^'?]+)(?:\?[^']*)?'\s*,?\s*(?://\s*(.*))?$")


def nfc(s):
    return unicodedata.normalize("NFC", s)


def registry():
    text = open(os.path.join(ROOT, "game.html"), encoding="utf-8").read()
    start = text.index("const _sampleFiles={")
    body = text[start:text.index("\n};", start)]
    reg = collections.defaultdict(list)  # path -> [(key, comment)]
    for line in body.split("\n")[1:]:
        m = ENTRY.match(line)
        if m:
            reg[nfc(m.group(2))].append((m.group(1), (m.group(3) or "").strip()))
    return reg


def cell(s):
    return s.replace("|", "\\|")


def build():
    reg = registry()
    files = []
    for dp, _, fn in os.walk(os.path.join(ROOT, "sfx")):
        for f in fn:
            if AUDIO.search(f):
                files.append(nfc(os.path.relpath(os.path.join(dp, f), ROOT).replace(os.sep, "/")))
    by_dir = collections.defaultdict(list)
    for p in sorted(files):
        by_dir[os.path.dirname(p)].append(p)
    used = sum(1 for p in files if p in reg)
    lines = [
        "# 지옥의 길 — SFX 폴더 안내",
        "",
        "> **자동 생성 파일 — 손으로 고치지 마세요.** `python3 tools/sfx_readme_gen.py`로 다시 만듭니다.",
        "> 기준: `game.html`의 `_sampleFiles` 레지스트리(파일 키 → 경로)와 그 줄의 코드 주석.",
        "> 관리: `docs/6사운드디자인/SOUND_TEAM_LEAD.md` (S-07).",
        "",
        f"- 오디오 파일 {len(files)}개 · 게임이 로드 {used}개 · 미참조 {len(files) - used}개",
        f"- 레지스트리 키 {sum(len(v) for v in reg.values())}개 (같은 파일을 여러 키가 쓰기도 함)",
        "",
        "## 폴더",
        "",
        "| 폴더 | 파일 | 로드 | 미참조 |",
        "|---|---|---|---|",
    ]
    for d, ps in sorted(by_dir.items()):
        n_used = sum(1 for p in ps if p in reg)
        lines.append(f"| `{d}/` | {len(ps)} | {n_used} | {len(ps) - n_used} |")
    for d, ps in sorted(by_dir.items()):
        lines += ["", f"## `{d}/`", "", "| 파일 | 게임 키 | 용도 (코드 주석) |", "|---|---|---|"]
        for p in ps:
            name = os.path.basename(p)
            if p in reg:
                keys = ", ".join(f"`{k}`" for k, _ in reg[p])
                notes = " / ".join(dict.fromkeys(c for _, c in reg[p] if c))
                lines.append(f"| {cell(name)} | {keys} | {cell(notes) or '—'} |")
            else:
                lines.append(f"| {cell(name)} | — | **미참조** (게임이 로드하지 않음) |")
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    new = build()
    if "--check" in sys.argv:
        old = open(OUT, encoding="utf-8").read() if os.path.exists(OUT) else ""
        print("SFX_README.md up to date" if old == new else "SFX_README.md is stale — run tools/sfx_readme_gen.py")
        sys.exit(0 if old == new else 1)
    open(OUT, "w", encoding="utf-8").write(new)
    print(f"wrote {os.path.relpath(OUT, ROOT)}")
