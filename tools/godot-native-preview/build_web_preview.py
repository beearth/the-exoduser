#!/usr/bin/env python3
"""Export an isolated single-thread Web preview; never launch its game or server."""

import argparse
import importlib.util
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
import zipfile

sys.dont_write_bytecode = True
_helper_path = Path(__file__).with_name("build_windows_preview.py")
_spec = importlib.util.spec_from_file_location("native_preview_staging", _helper_path)
helpers = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(helpers)

PRESET = "Web Native Preview Single Thread"
WEB_SECTION = "preset.1.options"
TEMPLATE_MEMBER = "web_nothreads_release.zip"


def section(text, name):
    match = re.search(r"(?ms)^\[" + re.escape(name) + r"\]\n(.*?)(?=^\[|\Z)", text)
    if not match:
        raise ValueError("Missing preset section: " + name)
    return match


def override_option(text, name, value):
    return helpers.override_preset_option(text, 1, name, value)


def validate_web_preset(text):
    body = section(text, WEB_SECTION).group(1)
    for key in ["variant/thread_support=false", "variant/extensions_support=false",
                "progressive_web_app/enabled=false",
                "progressive_web_app/ensure_cross_origin_isolation_headers=false"]:
        if key not in body.splitlines():
            raise ValueError("Single-thread delivery requires Web option: " + key)
    if 'name="' + PRESET + '"' not in section(text, "preset.1").group(1):
        raise ValueError("Web export preset name is not current")


def validate_template(template):
    if template.name != TEMPLATE_MEMBER:
        raise ValueError("Expected matching single-thread release template " + TEMPLATE_MEMBER)
    with zipfile.ZipFile(template) as archive:
        names = archive.namelist()
        for name in ["godot.js", "godot.wasm", "godot.html"]:
            if name not in names:
                raise ValueError("Web template lacks " + name)
        if archive.open("godot.wasm").read(8) != b"\0asm\x01\0\0\0":
            raise ValueError("Template engine is not WebAssembly version 1")
    return names


def stage_delivery(stage, source_project, shell, delivery):
    text = shell.read_text(encoding="utf-8")
    for placeholder in ["$GODOT_CONFIG", "$GODOT_URL"]:
        if placeholder not in text:
            raise ValueError("Custom shell must retain " + placeholder)
    folder = stage / "web_delivery"
    folder.mkdir()
    staged_shell = folder / "web_shell.html"
    shutil.copy2(shell, staged_shell)
    result = {"source_shell": str(shell), "staged_shell": "res://web_delivery/web_shell.html",
              "autoload": None, "source_main_save_settings_modified": False}
    if delivery:
        try:
            relative_script = delivery.relative_to(source_project)
        except ValueError:
            relative_script = Path("web_delivery/web_delivery.gd")
        staged_script = stage / relative_script
        # An in-project class_name script already exists in this stage. A second
        # copy under another res:// path would register the same global class twice.
        if not staged_script.is_file():
            staged_script.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(delivery, staged_script)
        staged_resource = "res://" + relative_script.as_posix()
        project_file = stage / "project.godot"
        project_text = project_file.read_text(encoding="utf-8")
        value = 'WebDelivery="*' + staged_resource + '"\n'
        if re.search(r"(?m)^WebDelivery\s*=", project_text):
            raise ValueError("WebDelivery autoload already exists; do not replace it")
        header = re.search(r"(?m)^\[autoload\]\s*$", project_text)
        if header:
            project_text = project_text[:header.end()] + "\n" + value + project_text[header.end():]
        else:
            project_text += "\n[autoload]\n" + value
        project_file.write_text(project_text, encoding="utf-8")
        result["autoload"] = {"name": "WebDelivery", "source": str(delivery),
                              "staged_resource": staged_resource,
                              "global_class_script_duplicated": False,
                              "scope": "delivery owner implements readonly/public-input bridge"}
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", type=Path, required=True)
    parser.add_argument("--godot", type=Path, required=True)
    parser.add_argument("--template", type=Path, required=True)
    parser.add_argument("--shell", type=Path, required=True)
    parser.add_argument("--delivery-script", type=Path,
                        help="Optional delivery-only autoload copied into the external stage")
    parser.add_argument("--output", type=Path, required=True,
                        help="New directory outside the source repository")
    parser.add_argument("--prepare-only", action="store_true")
    args = parser.parse_args()
    project, godot, template, shell, output = (p.expanduser().resolve() for p in
                                              [args.project, args.godot, args.template, args.shell, args.output])
    delivery = args.delivery_script.expanduser().resolve() if args.delivery_script else None
    repository = project.parent
    if output == repository or repository in output.parents or output in repository.parents:
        parser.error("Output must be outside the source repository")
    if output.exists():
        parser.error("Output already exists; choose a new Web artifact directory")
    for path in [project / "project.godot", project / "export_presets.cfg", godot, template, shell] + ([delivery] if delivery else []):
        if not path.is_file():
            parser.error("Required input is missing: " + str(path))
    helpers.require_project_settings(project)
    preset = (project / "export_presets.cfg").read_text(encoding="utf-8")
    validate_web_preset(preset)
    template_entries = validate_template(template)
    version = subprocess.check_output([str(godot), "--version"], text=True).strip()
    if version != helpers.VERSION:
        parser.error("Godot/template version mismatch: " + version)
    output.mkdir(parents=True)
    stage = output / "stage" / "godot"
    stage.parent.mkdir()
    staging = helpers.stage_project(project, stage)
    delivery_receipt = stage_delivery(stage, project, shell, delivery)
    preset = override_option(preset, "custom_template/release", str(template))
    preset = override_option(preset, "html/custom_html_shell", "res://web_delivery/web_shell.html")
    (stage / "export_presets.cfg").write_text(preset, encoding="utf-8")
    editor, editor_receipt = helpers.isolated_editor(godot, output)
    package = output / "package"
    package.mkdir()
    html = package / "index.html"
    prefix = [str(editor), "--headless", "--editor", "--path", str(stage)]
    import_command = prefix + ["--import", "--log-file", str(output / "import-engine.log")]
    export_command = prefix + ["--export-release", PRESET, str(html),
                               "--log-file", str(output / "export-engine.log")]
    manifest = {"schema": "exoduser.web-native-preview-build.v1", "godot_version": version,
                "project": str(project), "staged_project": str(stage), "preset": PRESET,
                "template": str(template), "template_entries": template_entries,
                "output": str(output), "package": str(package), "staging": staging,
                "isolated_editor": editor_receipt, "delivery": delivery_receipt,
                "commands": {"import": import_command, "export_release": export_command},
                "source_project_settings_modified": False,
                "gameplay_or_fixture_or_server_launched": False,
                "current_latest_session_or_userdata_accessed": False,
                "Windows_exports_or_tests_reexecuted": False,
                "hosting": {"html": "text/html", "js": "application/javascript",
                            "wasm": "application/wasm", "pck": "application/octet-stream",
                            "thread_support": False, "extension_support": False,
                            "COOP_COEP_required": False, "PWA": False,
                            "browser_requires": ["WebAssembly", "WebGL2", "HTTP localhost or HTTPS"],
                            "fullscreen_and_audio": "require a public user input gesture"},
                "status": "prepared", "actual_browser_play_verification": "pending parent"}
    manifest_path = output / "build-manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if not args.prepare_only:
        try:
            helpers.run_editor(import_command, output / "import-stdout.log")
            helpers.run_editor(export_command, output / "export-stdout.log")
            expected = [package / ("index" + ext) for ext in [".html", ".js", ".wasm", ".pck"]]
            if any(not path.is_file() for path in expected):
                raise RuntimeError("Web export is missing a required index HTML/JS/WASM/PCK artifact")
            manifest["status"] = "exported; parent MIME/PCK and public-browser play verification pending"
            manifest["outputs"] = [{"path": str(path), "bytes": path.stat().st_size,
                                    "sha256": helpers.sha256(path)} for path in expected]
        except Exception as error:
            manifest["status"] = "failed"
            manifest["error"] = str(error)
            raise
        finally:
            manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(manifest_path)


if __name__ == "__main__":
    main()
