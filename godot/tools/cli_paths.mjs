// Export-tool path policy only. Different-drive relative results are absolute on Windows.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export function isInsideRoot(root, output, paths = path) {
  const relative = paths.relative(root, output);
  return relative === '' || (!paths.isAbsolute(relative) && relative !== '..' && !relative.startsWith('..' + paths.sep));
}
export function sameRealPath(left, right, paths = path, resolve = fs.realpathSync) {
  return paths.relative(resolve(left), resolve(right)) === '';
}
export function isDirectExecution(moduleUrl, entry = process.argv[1]) {
  return Boolean(entry) && sameRealPath(entry, fileURLToPath(moduleUrl));
}

export function isMatchingSnapshot(root, output, chapter, stage, paths = path) {
  return paths.relative(paths.join(root, "godot", "data", "ch" + chapter + "_map_source", "si" + stage + ".json"), output) === "";
}
