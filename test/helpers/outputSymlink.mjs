// A Windows directory junction needs no symlink privilege and lstat reports it as
// a symbolic link. A nested output exercises the SAME ancestor rejection loop.
// No permission-error catch/skip: inability to create the junction is a failure.
import fs from 'node:fs';
import path from 'node:path';
export function outputSymlink(directory, target, platform = process.platform) {
  if (platform === 'win32') {
    const junction = path.join(directory, 'linked-directory');
    fs.symlinkSync(path.dirname(path.resolve(target)), junction, 'junction');
    return path.join(junction, path.basename(target));
  }
  const link = path.join(directory, 'linked.json');
  fs.symlinkSync(target, link);
  return link;
}
