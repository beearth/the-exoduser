#!/usr/bin/env python3
"""Sound asset audit for 지옥의 길 (The Exoduser).

Compares every sfx/ and bgm/ path referenced by game code against the audio
files on disk, with Hangul names normalized to NFC (macOS commits NFD names,
which turned into duplicate folders in git).

Usage:  python3 tools/sound_audit.py            # summary
        python3 tools/sound_audit.py --list     # also print every path
Owned by docs/6사운드디자인/SOUND_TEAM_LEAD.md — update its §3 numbers after running.
"""
import os, re, sys, glob, unicodedata, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_EXT = re.compile(r"\.(mp3|ogg|wav|m4a)$", re.I)
REF_RE = re.compile(r"(?:sfx|bgm)/[^'\"`<>\n]+?\.(?:mp3|ogg|wav|m4a)")
CODE_FILES = ["game.html", "index.html", "lobby_i18n.js", "maps_data.js"] + sorted(
    os.path.basename(p) for p in glob.glob(os.path.join(ROOT, "lang_*.js")))
# Tables defined in game.html that no code calls (DAY 10 legacy); their paths never load.
DEAD_TABLES = ("SFX_MAP", "BGM_MAP")


def nfc(s):
    return unicodedata.normalize("NFC", s)


def main():
    show = "--list" in sys.argv
    refs = set()
    for name in CODE_FILES:
        p = os.path.join(ROOT, name)
        if os.path.exists(p):
            with open(p, encoding="utf-8", errors="ignore") as f:
                refs.update(nfc(m) for m in REF_RE.findall(f.read()))

    files = collections.defaultdict(list)  # NFC path -> actual on-disk paths
    for top in ("sfx", "bgm"):
        for dp, _, fn in os.walk(os.path.join(ROOT, top)):
            for f in fn:
                if AUDIO_EXT.search(f):
                    rel = os.path.relpath(os.path.join(dp, f), ROOT).replace(os.sep, "/")
                    files[nfc(rel)].append(rel)

    size = lambda rel: os.path.getsize(os.path.join(ROOT, rel))
    nfd_dups = [(k, p) for k, v in files.items() for p in v if p != k]
    missing = sorted(r for r in refs if r not in files)
    orphans = sorted(k for k in files if k not in refs)
    wavs = sorted(k for k in files if k.lower().endswith(".wav") and k in refs)

    print(f"referenced paths   : {len(refs)}")
    print(f"audio files (NFC)  : {len(files)}")
    print(f"NFD duplicate files: {len(nfd_dups)}  ({sum(size(p) for _, p in nfd_dups)/1e9:.2f} GB)")
    print(f"missing (ref, no file): {len(missing)}")
    print(f"orphans (file, no ref): {len(orphans)}  ({sum(size(files[k][0]) for k in orphans)/1e6:.1f} MB)")
    for grp, n in collections.Counter("/".join(k.split("/")[:2]) for k in orphans).most_common():
        print(f"   {n:4d}  {grp}")
    print(f"WAV loaded in game : {len(wavs)}  ({sum(size(files[k][0]) for k in wavs)/1e6:.0f} MB)")
    if show:
        for title, rows in (("MISSING", missing), ("ORPHANS", orphans), ("WAV", wavs),
                            ("NFD DUPLICATES", [p for _, p in nfd_dups])):
            print(f"\n## {title}")
            for r in rows:
                print("  " + r)
    print(f"\nnote: missing paths inside {', '.join(DEAD_TABLES)} are dead code, not runtime 404s.")


if __name__ == "__main__":
    main()
