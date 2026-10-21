// Canonical source oracle for Node tools; independent of checkout cwd/live web bytes.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const manifest = require('./SNAPSHOT.json');
const sourcePath = path.join(__dirname, 'game.html');
function readBytes() {
 const bytes = fs.readFileSync(sourcePath);
 if (crypto.createHash('sha256').update(bytes).digest('hex') !== manifest.sha256) throw Error('Immutable source snapshot SHA mismatch');
 return bytes;
}
module.exports = {sha256: manifest.sha256, originalCommit: manifest.original_commit, sourcePath, readBytes};
