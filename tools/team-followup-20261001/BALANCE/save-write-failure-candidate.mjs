let sequence = 0;

export function atomicSaveJSON(fs, file, data, processId) {
  const serialized = JSON.stringify(data, null, 2);
  const temporary = file + '.tmp-' + processId + '-' + (++sequence);
  let descriptor;
  let owned = false;
  try {
    descriptor = fs.openSync(temporary, 'wx');
    owned = true;
    fs.writeFileSync(descriptor, serialized, 'utf8');
    fs.closeSync(descriptor);
    descriptor = undefined;
    fs.renameSync(temporary, file);
    owned = false;
  } finally {
    if (descriptor !== undefined) {
      try { fs.closeSync(descriptor); } catch {}
    }
    if (owned) {
      try { fs.unlinkSync(temporary); } catch {}
    }
  }
}
