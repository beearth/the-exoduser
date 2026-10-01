#!/usr/bin/env python3
"""INT-004 source payload manifest; never invokes Git, JS, cp, or NW.js.

Run only after the coordinator ends live QA measurement:
  python3 tools/qa/r-input-followup/build-assets.py --output /absolute/new/output

Scope: complete assets/unique-items and assets/map/ch1 descendants, plus
ch1-* FILES entries. Other CH1 sprite/image trees are explicitly out of scope.
An inclusion PASS means source inputs match the observed copy contract, not
that a package was built, launched, or visually accepted.
"""

import argparse
import ast
from collections import Counter
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat
import sys
import time
import unicodedata


SCOPES = ("assets/unique-items", "assets/map/ch1")
LFS_HEADER = b"version https://git-lfs.github.com/spec/v1\n"


def sha_bytes(data):
    return hashlib.sha256(data).hexdigest()


def array_literal(source, name):
    matches = list(re.finditer(r"\bconst\s+" + name + r"\s*=\s*(\[[\s\S]*?\])\s*;", source))
    if len(matches) != 1:
        raise ValueError(f"{name}: expected one literal array")
    values = ast.literal_eval(matches[0][1])
    if not isinstance(values, list) or not all(isinstance(p, str) for p in values):
        raise ValueError(f"{name}: expected string literals only")
    if len(values) != len(set(values)):
        raise ValueError(f"{name}: duplicate entry")
    for p in values:
        if not p or PurePosixPath(p).is_absolute() or ".." in PurePosixPath(p).parts or "\\" in p:
            raise ValueError(f"{name}: unsafe input path {p!r}")
    return values


def parse_contract(source):
    files, dirs = array_literal(source, "FILES"), array_literal(source, "DIRS")
    # Narrowly recognise the inspected builder; reject changed copying semantics.
    checks = {
        "files_copy": r"for\s*\(const f of FILES\)\s*\{\s*if\s*\(existsSync\(f\)\)\s*\{\s*mkdirSync\(dirname\(`\$\{DIST\}/\$\{f\}`\),\s*\{\s*recursive:\s*true\s*\}\);\s*cpSync\(f,\s*`\$\{DIST\}/\$\{f\}`\);",
        "dirs_recursive_copy": r"for\s*\(const d of DIRS\)\s*\{\s*if\s*\(existsSync\(d\)\)\s*\{\s*console\.log\([^\n]*\);\s*cpSync\(d,\s*`\$\{DIST\}/\$\{d\}`,\s*\{\s*recursive:\s*true\s*\}\);",
    }
    for name, pattern in checks.items():
        if not re.search(pattern, source):
            raise ValueError(f"Copy contract changed: {name}; review before hashing")
    return files, dirs, list(checks)


def coverage(path, files, dirs):
    return ([f"FILES:{path}"] if path in files else []) + [
        f"DIRS:{d}" for d in dirs if path == d or path.startswith(d + "/")
    ]


def stable_hash(path):
    before = path.lstat()
    if not stat.S_ISREG(before.st_mode):
        raise ValueError("not a regular file (symlinks are not followed)")
    digest = hashlib.sha256()
    prefix = b""
    total = 0
    with path.open("rb") as handle:
        opened = os.fstat(handle.fileno())
        if (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino):
            raise ValueError("file replaced before open")
        while True:
            block = handle.read(1024 * 1024)
            if not block:
                break
            if len(prefix) < 1024:
                prefix += block[:1024 - len(prefix)]
            total += len(block)
            digest.update(block)
        after_fd = os.fstat(handle.fileno())
    after = path.lstat()
    signature = lambda s: (s.st_dev, s.st_ino, s.st_size, s.st_mtime_ns, s.st_ctime_ns)
    if signature(before) != signature(after) or signature(before) != signature(after_fd) or total != before.st_size:
        raise ValueError("file changed during hash")
    return {"bytes": total, "sha256": digest.hexdigest(), "mtime_ns": before.st_mtime_ns,
            "lfs_pointer": prefix.startswith(LFS_HEADER)}


def inventory(root, findings):
    found = []
    for scope in SCOPES:
        directory = root / scope
        if not directory.is_dir() or directory.is_symlink():
            findings.append({"severity": "FAIL", "path": scope, "reason": "missing/unsafe scope directory"})
            continue
        scope_count = 0
        def walk_error(error):
            findings.append({"severity": "FAIL", "path": str(error.filename), "reason": str(error)})
        for parent, dirs, names in os.walk(directory, followlinks=False, onerror=walk_error):
            dirs.sort()
            for name in list(dirs):
                child = Path(parent) / name
                if child.is_symlink():
                    findings.append({"severity": "FAIL", "path": child.relative_to(root).as_posix(),
                                     "reason": "symlink directory not followed; copy parity unverified"})
                    dirs.remove(name)
            for name in sorted(names):
                found.append((Path(parent) / name).relative_to(root).as_posix())
                scope_count += 1
        if not scope_count:
            findings.append({"severity": "FAIL", "path": scope, "reason": "empty scope"})
    return found


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[3])
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--baseline-label", default="dd3bdc18", help="Coordinator-provided label; not independently Git verified")
    args = parser.parse_args()
    root, output = args.repo.resolve(), args.output.resolve()
    if output == root or root in output.parents:
        parser.error("output must be outside the source repository")
    if output.exists() and any(output.iterdir()):
        parser.error("output must be new or empty; previous receipts are never overwritten")
    started = time.monotonic()
    builder = root / "build-nwjs.mjs"
    builder_bytes = builder.read_bytes()
    files, dirs, contract_checks = parse_contract(builder_bytes.decode("utf-8"))
    findings = []
    paths = inventory(root, findings)
    helpers = [p for p in files if PurePosixPath(p).name.startswith("ch1-")]
    paths = sorted(set(paths + helpers))
    expected_art = [f"assets/unique-items/ui-{i:02}{suffix}.png"
                    for i in range(1, 23) for suffix in ("", "-seedream-candidate")]
    # 44 documented art inputs and core CH1 directories are explicit presence gates.
    for p in expected_art:
        if p not in paths:
            findings.append({"severity": "FAIL", "path": p, "reason": "documented art input missing"})
    for scope in SCOPES:
        if not coverage(scope, files, dirs):
            findings.append({"severity": "FAIL", "path": scope, "reason": "not included by builder FILES/DIRS"})
    if not helpers:
        findings.append({"severity": "FAIL", "path": "FILES", "reason": "no ch1-* helper inputs"})
    rows = []
    normalized = {}
    for p in paths:
        row = {"path": p, "package_relative_path": p, "copy_rules": coverage(p, files, dirs)}
        if not row["copy_rules"]:
            findings.append({"severity": "FAIL", "path": p, "reason": "excluded by builder copy contract"})
        key = unicodedata.normalize("NFC", p).casefold()
        if key in normalized and normalized[key] != p:
            findings.append({"severity": "FAIL", "path": p, "reason": f"Windows/NFC destination collision: {normalized[key]}"})
        normalized[key] = p
        try:
            row.update(stable_hash(root / p))
            if row["lfs_pointer"]:
                findings.append({"severity": "FAIL", "path": p, "reason": "LFS pointer would be copied instead of asset bytes; no download attempted"})
            if not row["bytes"]:
                findings.append({"severity": "WARN", "path": p, "reason": "zero-byte input"})
        except (OSError, ValueError) as error:
            row["error"] = str(error)
            findings.append({"severity": "FAIL", "path": p, "reason": str(error)})
        rows.append(row)
    # Metadata/tree stability check after the complete sequential pass.
    final_paths = sorted(set(inventory(root, findings) + helpers))
    if final_paths != paths:
        findings.append({"severity": "FAIL", "path": "scopes", "reason": "file membership changed during audit"})
    for row in rows:
        if "sha256" in row:
            try:
                current = (root / row["path"]).lstat()
                if current.st_size != row["bytes"] or current.st_mtime_ns != row["mtime_ns"]:
                    raise ValueError("input metadata changed after hashing")
            except (OSError, ValueError) as error:
                findings.append({"severity": "FAIL", "path": row["path"], "reason": str(error)})
    if builder.read_bytes() != builder_bytes:
        findings.append({"severity": "FAIL", "path": "build-nwjs.mjs", "reason": "builder changed during audit"})
    hashed = [row for row in rows if "sha256" in row]
    content_tree = [[row["path"], row["bytes"], row["sha256"]] for row in hashed]
    tree_sha = sha_bytes(json.dumps(content_tree, ensure_ascii=False, separators=(",", ":")).encode())
    counts = Counter(f["severity"] for f in findings)
    summary = {"selected_files": len(rows), "hashed_files": len(hashed),
               "bytes": sum(row["bytes"] for row in hashed), "failures": counts["FAIL"],
               "warnings": counts["WARN"], "source_content_tree_sha256": tree_sha}
    result = {
        "recorded_at_utc": datetime.now(timezone.utc).isoformat(), "repository": str(root),
        "baseline_label_from_coordinator": args.baseline_label, "git_checked": False,
        "builder_sha256": sha_bytes(builder_bytes), "script_sha256": sha_bytes(Path(__file__).read_bytes()),
        "copy_contract": {"FILES": files, "DIRS": dirs, "checked_patterns": contract_checks},
        "scope": {"recursive_roots": SCOPES, "file_helpers": helpers,
                  "out_of_scope": "other CH1 img/sprites, other runtime assets, build output, runtime reachability, visual quality"},
        "summary": summary, "files": rows, "findings": findings,
        "package_built": False, "package_contents_verified": False,
        "duration_seconds": round(time.monotonic() - started, 3),
    }
    output.mkdir(parents=True, exist_ok=True)
    (output / "asset-manifest.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    groups = []
    for scope in (*SCOPES, "ch1-* FILES"):
        group = [r for r in hashed if (r["path"] in helpers if scope == "ch1-* FILES" else r["path"].startswith(scope + "/"))]
        groups.append(f"| `{scope}` | {len(group)} | {sum(r['bytes'] for r in group):,} |")
    report = ["# INT-004 자산 포함 매니페스트 실행 결과", "",
              f"소스 복사 계약 판정: {'FAIL' if counts['FAIL'] else 'PASS'}. {len(hashed)}/{len(rows)}파일 SHA 산출, {counts['FAIL']} FAIL·{counts['WARN']} WARN.", "",
              "| 범위 | SHA 파일 수 | 바이트 |", "|---|---:|---:|", *groups, "",
              "실제 build-nwjs.mjs FILES/DIRS를 읽고 경로 보존 재귀 복사 계약과 자식 파일을 대조했다. 1MiB 순차 스트리밍으로 해시했으며 원본 복사·디코딩·Git·게임·패키징을 실행하지 않았다.", "",
              "44개 고유 원화 필수 존재, 범위 비어 있음, 복사 포함, LFS 포인터, 심볼릭 링크, 대소문자/NFC 충돌, 읽기 중 변경을 구분했다. 고유 원화의 게임 채택·연결 완료를 의미하지 않는다.", "",
              "과거 INT-004의 42개 누락 기록은 이전 Windows 패키지 비교였다. 이 결과는 현재 Mac 소스 입력이며 과거 42개와 동일 집합 또는 실제 새 패키지 복사 완료를 주장하지 않는다.", "",
              "assets/map/ch1 밖의 CH1 img/sprites와 전체 빌드 입력은 범위 밖이다. 해시만으로 런타임 참조·시각 품질·원격 백업·실제 패키지 무결성을 증명하지 않는다.", "",
              f"소스 콘텐츠 트리 SHA-256: `{tree_sha}`", "", "## 발견 항목", ""]
    report.extend(f"- {f['severity']} `{f['path']}`: {f['reason']}" for f in findings)
    if not findings:
        report.append("- 이 범위에서 결함·경고를 발견하지 않았다.")
    report.extend(["", "## docs 인수 문구", "",
                   f"INT-004 후속으로 고유 원화·CH1 맵 자산의 자식 파일과 CH1 FILES 항목 {len(hashed)}/{len(rows)}개를 실제 순차 SHA 검증했다. 실패 {counts['FAIL']}·경고 {counts['WARN']}. 결과는 asset-manifest.json을 따른다. 실제 통합 패키지 생성·내용 비교·Windows 실행 검수는 미실시다.", ""])
    (output / "실행결과.md").write_text("\n".join(report), encoding="utf-8")
    print(json.dumps({"output": str(output), **summary}, ensure_ascii=False))
    return 1 if counts["FAIL"] else 0


if __name__ == "__main__":
    sys.exit(main())
