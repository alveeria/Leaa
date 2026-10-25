import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let fs = require('fs');
let handler = async (m, { text, usedPrefix, command }) => {
  if (!text) throw `uhm.. teksnya mana?\n\npenggunaan:\n${usedPrefix + command} <teks>\n\ncontoh:\n${usedPrefix + command} menu`;

  if (command === 'sfp') {
    if (!m.quoted.text) throw `balas pesan nya!`;
    let path = `plugins/${text}.js`;
    await fs.writeFileSync(path, m.quoted.text);
    m.reply(`tersimpan di ${path}`);
  } else if (command === 'df') {
    let path = `plugins/${text}.js`;
    if (!fs.existsSync(path)) throw `file plugin ${text}.js tidak ditemukan`;
    fs.unlinkSync(path);
    m.reply(`file plugin ${text}.js berhasil dihapus`);
  }
};

handler.help = ['sfp', 'df'].map(v => v + ' <teks>');
handler.tags = ['owner'];
handler.command = /^(sf|df)$/i;
handler.rowner = true;

module.exports = handler;

export default module.exports;
