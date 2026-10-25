const fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(process.argv[2],'utf8');
const body=source.slice(source.indexOf('function _enterOffline()'),source.indexOf('// ═══ Init ═══'));
const lengthRule=body.match(/if\((name.length<2\|\|name.length>8)\)/)[1];
const forbiddenRule=body.match(/if\((\/\[.*?\]\/\.test\(name\))\)/)[1];
const validate=new Function('name',`if(${lengthRule})return 'NameLength';if(${forbiddenRule})return 'Forbidden';return 'None';`);
const values=['','a','ab','abcdefgh','abcdefghi','아린','가나다라마바사아','가나다라마바사아자','  아린  ','\ufeff아린\ufeff','\u0085a\u0085','\u2000아린\u3000','\t\r\n','a b','🙂','🙂🙂🙂🙂','🙂🙂🙂🙂a',...['<','>','"',"'",'&','/','\\'].map(c=>'가'+c)];
fs.writeFileSync(path.join(__dirname,'name-oracle.json'),JSON.stringify(values.map(raw=>({raw,trimmed:raw.trim(),expected:validate(raw.trim())})),null,2)+'\n');
console.log('Extracted offline name rules and '+values.length+' boundary cases.');
