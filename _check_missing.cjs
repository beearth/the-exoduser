'use strict';
const fs = require('fs');
const missing = JSON.parse(fs.readFileSync('G:/hell/_missing_keys.json', 'utf8'));

for (const lang of ['ja', 'zh', 'zht']) {
  const content = fs.readFileSync('G:/hell/lang_' + lang + '.js', 'utf8');
  const keys = missing[lang] || [];
  const notFound = keys.filter(k => {
    // Simple substring check: does the file contain the key as a dict key?
    const asKey = "'" + k.replace(/'/g, "\\'") + "'";
    return !content.includes(asKey);
  });
  console.log('[' + lang.toUpperCase() + '] requested: ' + keys.length + ', now missing: ' + notFound.length);
  if (notFound.length > 0) {
    notFound.forEach(k => console.log('  MISSING: ' + JSON.stringify(k)));
  }
}
