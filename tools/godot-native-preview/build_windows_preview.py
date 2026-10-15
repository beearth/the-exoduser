#!/usr/bin/env python3
"""Stage and export the current native preview without running its main scene."""

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import struct
import subprocess
import sys

PRESET = "Windows Native Preview x64"
VERSION = "4.7.2.stable.official.ed1daf0bf"
EXE_NAME = "EXODUSER-native-preview.exe"


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def pe_machine(path):
    with path.open("rb") as handle:
        header = handle.read(64)
        if len(header) != 64 or header[:2] != b"MZ":
            raise ValueError("Template is not a Windows PE executable")
        handle.seek(struct.unpack_from("<I", header, 60)[0])
        pe = handle.read(6)
        if len(pe) != 6 or pe[:4] != b"PE\0\0":
            raise ValueError("Template PE signature is invalid")
        return struct.unpack_from("<H", pe, 4)[0]


def require_project_settings(project):
    text = (project / "project.godot").read_text(encoding="utf-8")
    required = [
        'run/main_scene="res://scenes/main.tscn"',
        'run/max_fps=240',
        'locale/include_text_server_data=true',
        'common/physics_ticks_per_second=60',
        'common/physics_interpolation=true',
        'renderer/rendering_method="gl_compatibility"',
    ]
    for value in required:
        if value not in text:
            raise ValueError("Current preview setting is missing: " + value)


def stage_project(project, stage):
    """Copy mutable metadata/code; link original asset/data bytes read-only."""
    skipped = {".godot", ".git", "tests", "tools"}
    excluded_files = {"README.md", "run.command", "export_presets.cfg"}
    linked = []
    copied = []
    stage.mkdir()
    for folder, dirs, names in os.walk(project):
        relative_folder = Path(folder).relative_to(project)
        dirs[:] = sorted(d for d in dirs if d not in skipped and not d.startswith("."))
        for name in sorted(names):
            if name.startswith(".") or name in excluded_files:
                continue
            source = Path(folder) / name
            relative = relative_folder / name
            target = stage / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            # Importers write sidecar .import/.uid metadata only in this stage.
            original_bytes = relative.parts[0] in {"assets", "data"}
            if original_bytes and source.suffix not in {".import", ".uid"}:
                target.symlink_to(source.resolve())
                linked.append(relative.as_posix())
            else:
                shutil.copy2(source, target)
                copied.append(relative.as_posix())
    cache_source = project / ".godot" / "imported"
    cache_target = stage / ".godot" / "imported"
    count = 0
    cache_bytes = 0
    if cache_source.is_dir():
        for source in sorted(cache_source.rglob("*")):
            if source.is_file():
                target = cache_target / source.relative_to(cache_source)
                target.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source, target)
                count += 1
                cache_bytes += source.stat().st_size
    return {"linked_original_files": linked, "copied_metadata_and_code": copied,
            "existing_import_cache_files_copied": count,
            "existing_import_cache_bytes_copied": cache_bytes,
            "force_reimport_requested": False,
            "original_PNG_or_frozen_snapshot_copies_or_hashes": 0}


def isolated_editor(godot, output):
    """Use a local self-contained editor; never modify the installed .app."""
    if sys.platform == "darwin":
        contents = output / "isolated-editor" / "Godot.app" / "Contents"
        target = contents / "MacOS" / "Godot"
        source_contents = godot.parent.parent
        if (source_contents / "Info.plist").is_file():
            contents.mkdir(parents=True)
            shutil.copy2(source_contents / "Info.plist", contents / "Info.plist")
        marker_dir = contents
    else:
        target = output / "isolated-editor" / godot.name
        marker_dir = target.parent
    target.parent.mkdir(parents=True, exist_ok=True)
    try:
        os.link(godot, target)
        transfer = "hardlink; binary bytes unchanged"
    except OSError:
        shutil.copy2(godot, target)
        transfer = "copy2; binary bytes unchanged"
    (marker_dir / "_sc_").touch()
    return target, {"binary": str(target), "self_contained_marker": str(marker_dir / "_sc_"),
                    "transfer": transfer, "global_editor_settings_modified": False}


def run_editor(command, log_path):
    with log_path.open("w", encoding="utf-8") as log:
        result = subprocess.run(command, stdout=log, stderr=subprocess.STDOUT, check=False)
    if result.returncode:
        raise RuntimeError("Editor operation failed; see " + str(log_path))
    return result.returncode


def override_preset_option(preset, index, key, value):
    """Change one option in one preset while preserving every other section."""
    section_name = "preset." + str(index) + ".options"
    match = re.search(r"(?ms)^\[" + re.escape(section_name) + r"\]\n(.*?)(?=^\[|\Z)", preset)
    if not match:
        raise ValueError("Missing preset section: " + section_name)
    replacement = key + "=" + json.dumps(value, ensure_ascii=False)
    body, count = re.subn(r"(?m)^" + re.escape(key) + r"\s*=.*$", lambda _: replacement,
                         match.group(1))
    if count != 1:
        raise ValueError("Expected exactly one " + key + " in " + section_name)
    return preset[:match.start(1)] + body + preset[match.end(1):]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", type=Path, required=True)
    parser.add_argument("--godot", type=Path, required=True)
    parser.add_argument("--template", type=Path, required=True,
                        help="Official matching windows_release_x86_64.exe")
    parser.add_argument("--output", type=Path, required=True,
                        help="New external artifact directory; must not exist")
    parser.add_argument("--prepare-only", action="store_true",
                        help="Stage inputs and command manifest without import/export")
    args = parser.parse_args()
    project, godot, template, output = (p.expanduser().resolve() for p in
                                         [args.project, args.godot, args.template, args.output])
    repository = project.parent
    if output == repository or repository in output.parents or output in repository.parents:
        parser.error("Output must be outside the source repository")
    if output.exists():
        parser.error("Output already exists; choose a new artifact directory")
    for path in [project / "project.godot", project / "export_presets.cfg", godot, template]:
        if not path.is_file():
            parser.error("Required input is missing: " + str(path))
    require_project_settings(project)
    version = subprocess.check_output([str(godot), "--version"], text=True).strip()
    if version != VERSION:
        parser.error("Godot/template version mismatch: " + version + "; expected " + VERSION)
    if pe_machine(template) != 0x8664:
        parser.error("Release template must be Windows x86_64 (PE machine 0x8664)")
    output.mkdir(parents=True)
    stage = output / "stage" / "godot"
    stage.parent.mkdir()
    staging = stage_project(project, stage)
    preset = (project / "export_presets.cfg").read_text(encoding="utf-8")
    preset = override_preset_option(preset, 0, "custom_template/release", str(template))
    (stage / "export_presets.cfg").write_text(preset, encoding="utf-8")
    editor, editor_receipt = isolated_editor(godot, output)
    package = output / "package"
    package.mkdir()
    launcher_source = Path(__file__).with_name("launch_windows.cmd")
    shutil.copy2(launcher_source, package / "launch_windows.cmd")
    executable = package / EXE_NAME
    prefix = [str(editor), "--headless", "--editor", "--path", str(stage)]
    import_command = prefix + ["--import", "--log-file", str(output / "import-engine.log")]
    export_command = prefix + ["--export-release", PRESET, str(executable),
                               "--log-file", str(output / "export-engine.log")]
    manifest = {"schema": "exoduser.windows-native-preview-build.v1", "godot_version": version,
                "project": str(project), "staged_project": str(stage),
                "preset": PRESET, "template": str(template), "template_machine": "0x8664",
                "output": str(output), "package": str(package), "staging": staging,
                "isolated_editor": editor_receipt,
                "commands": {"import": import_command, "export_release": export_command},
                "project_settings_modified": False, "gameplay_or_fixture_launched": False,
                "latest_session_or_userdata_written": False,
                "artifact_validation": "pending parent PE/PCK/ZIP inspection and Windows play",
                "status": "prepared"}
    manifest_path = output / "build-manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if not args.prepare_only:
        try:
            run_editor(import_command, output / "import-stdout.log")
            run_editor(export_command, output / "export-stdout.log")
            if not executable.is_file() or not executable.with_suffix(".pck").is_file():
                raise RuntimeError("Export finished without both EXE and PCK")
            manifest["status"] = "exported; parent artifact and Windows-play validation pending"
            manifest["outputs"] = [{"path": str(p), "bytes": p.stat().st_size, "sha256": sha256(p)}
                                   for p in [executable, executable.with_suffix(".pck")]]
        except Exception as error:
            manifest["status"] = "failed"
            manifest["error"] = str(error)
            raise
        finally:
            manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(manifest_path)


if __name__ == "__main__":
    main()
