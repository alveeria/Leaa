import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { command, text }) => {
  let txt = m.quoted ? m.quoted.text ? m.quoted.text : text ? text : m.text : m.text
  if (/^encrypt$/i.test(command)) {
  m.reply(Buffer.from(txt, 'utf-8').toString('base64'))
  }
  if (/^decrypt$/i.test(command)) {
  	m.reply(Buffer.from(txt, 'base64').toString('utf-8'))
}
}
handler.help = ['encrypt', 'decrypt']
handler.tags = ['tools']
handler.command = /^(encrypt|decrypt)$/i

module.exports = handler

export default module.exports;
