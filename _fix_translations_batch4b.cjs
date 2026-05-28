#!/usr/bin/env node
'use strict';
const fs = require('fs');

// Remaining keys not in batch4 table
const T2 = {
  '기동불꽃 준비!':      { nl:'Mobiele Vlam Klaar!',     no:'Mobil Flamme Klar!',        pl:'Mobilny Płomień Gotowy!',        ptbr:'Chama Móvel Pronta!' },
  '기동칼날개 AUTO OFF': { nl:'Meswieken AUTO UIT',       no:'Knivvinge AUTO AV',          pl:'Ostrze-Skrzydło AUTO WYŁ',       ptbr:'Asa de Lâmina AUTO DESL' },
  '밀어내기 모드':       { nl:'Duwmodus',                 no:'Dytte Modus',                pl:'Tryb Odpychania',                 ptbr:'Modo de Empurrar' },
  '처내기':              { nl:'Afslaan',                  no:'Slå av',                     pl:'Odbicie',                         ptbr:'Desviar' },
  '빙결수호':            { nl:'IJsbeschermeling',         no:'Isverge',                    pl:'Lodowa Ochrona',                  ptbr:'Guardião do Gelo' },
  '암전수호':            { nl:'Verduisteringsbewaker',    no:'Mørkleggingsvern',           pl:'Strażnik Zaciemnienia',           ptbr:'Guardião do Escuro' },
  '암흑수호':            { nl:'Duisterbeschermer',        no:'Mørkesvokter',               pl:'Strażnik Ciemności',              ptbr:'Guardião das Trevas' },
  '독수호':              { nl:'Giftbeschermer',           no:'Giftverge',                  pl:'Strażnik Trucizny',               ptbr:'Guardião do Veneno' },
  '전원소수호':          { nl:'Allelementenbeschermer',   no:'Allelement Vern',            pl:'Strażnik Wszystkich Żywiołów',   ptbr:'Guardião de Todos os Elementos' },
  '기폭 준비!':          { nl:'Detonatie Klaar!',         no:'Detonasjon Klar!',           pl:'Detonacja Gotowa!',               ptbr:'Detonação Pronta!' },
  '악의 부족! (15)':     { nl:'Kwaad Tekort! (15)',       no:'Utilstrekkelig Ondskap! (15)',pl:'Brak Złości! (15)',               ptbr:'Malícia Insuficiente! (15)' },
  '악의 부족! (10)':     { nl:'Kwaad Tekort! (10)',       no:'Utilstrekkelig Ondskap! (10)',pl:'Brak Złości! (10)',               ptbr:'Malícia Insuficiente! (10)' },
  '과부하 ':             { nl:'Overbelasting ',           no:'Overbelastning ',            pl:'Przeciążenie ',                   ptbr:'Sobrecarga ' },
  '부족!':               { nl:'Tekort!',                  no:'Utilstrekkelig!',            pl:'Niewystarczający!',               ptbr:'Insuficiente!' },
  'MP 부족! (100)':      { nl:'MP Te Weinig! (100)',      no:'Utilstrekkelig MP! (100)',   pl:'Brak MP! (100)',                  ptbr:'MP Insuficiente! (100)' },
  'MP 부족! (10)':       { nl:'MP Te Weinig! (10)',       no:'Utilstrekkelig MP! (10)',    pl:'Brak MP! (10)',                   ptbr:'MP Insuficiente! (10)' },
  '⚡ 증표 ':             { nl:'⚡ Teken ',                no:'⚡ Merke ',                  pl:'⚡ Znak ',                         ptbr:'⚡ Marca ' },
  '악의 부족! (30)':     { nl:null, no:null, pl:'Brak Złości! (30)', ptbr:'Malícia Insuficiente! (30)' },
};

const FILES = [
  { file: 'G:/hell/lang_nl.js',   lang: 'nl'   },
  { file: 'G:/hell/lang_no.js',   lang: 'no'   },
  { file: 'G:/hell/lang_pl.js',   lang: 'pl'   },
  { file: 'G:/hell/lang_ptbr.js', lang: 'ptbr' },
];

const missing = require('./_missing_keys.json');
let totalAdded = 0;

for (const { file, lang } of FILES) {
  const keys = missing[lang] || [];
  const toAdd = Object.keys(T2).filter(k => keys.includes(k) && T2[k][lang] !== null && T2[k][lang] !== undefined);
  if (toAdd.length === 0) {
    console.log(`[${lang}] No extra keys needed.`);
    continue;
  }

  let src = fs.readFileSync(file, 'utf8');
  const closeIdx = src.lastIndexOf('\n};');
  if (closeIdx === -1) { console.error(`[${lang}] No closing };`); continue; }

  const lines = toAdd.map(k => {
    const safeKey = k.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const safeVal = T2[k][lang].replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    return `  '${safeKey}': '${safeVal}',`;
  });

  const block = '\n  // --- batch4b additions ---\n' + lines.join('\n') + '\n';
  src = src.slice(0, closeIdx) + block + src.slice(closeIdx);
  fs.writeFileSync(file, src, 'utf8');
  console.log(`[${lang}] Added ${toAdd.length} extra keys`);
  totalAdded += toAdd.length;
}

console.log(`\nDone. Total extra added: ${totalAdded}`);
