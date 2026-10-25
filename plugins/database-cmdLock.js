import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
module.exports = Object.assign(async function handler(m, { isOwner, isPremium, command }) {
    if (!(isOwner || isPremium)) {
        global.dfail('premium', m, conn)
        throw false
    }
    if (!m.quoted) throw 'Reply Pesan!'
    if (!m.quoted.fileSha256) throw 'SHA256 Hash Missing'
    let sticker = global.db.data.sticker
    let hash = m.quoted.fileSha256.toString('hex')
    if (!(hash in sticker)) throw 'Hash not found in database'
    sticker[hash].locked = !/^un/i.test(command)
    m.reply('Done!')
}, {
    help: ['un', ''].map(v => v + 'lockcmd'),
    tags: ['database'],
    command: /^(un)?lockcmd$/i
})
export default module.exports;
