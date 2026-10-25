import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
let handler = async (m, { conn }) => {
  ayg = global.db.data.users[m.sender]

  if(ayg.pasangan == ""){
    return conn.reply(m.chat,`Anda tidak memiliki pasangan.`,m)
  }
  
  beb = global.db.data.users[global.db.data.users[m.sender].pasangan]

  if (typeof beb == "undefined"){
    conn.reply(m.chat,`Berhasil putus hubungan dengan @${global.db.data.users[m.sender].pasangan.split('@')[0]}`,m,{contextInfo: {
      mentionedJid: [global.db.data.users[m.sender].pasangan]
    }})
    ayg.pasangan = ""
  }

  if (m.sender == beb.pasangan){
    conn.reply(m.chat,`Berhasil putus hubungan dengan @${global.db.data.users[m.sender].pasangan.split('@')[0]}`,m,{contextInfo: {
      mentionedJid: [global.db.data.users[m.sender].pasangan]
    }})
    ayg.pasangan = ""
    beb.pasangan = ""
  }else {
    conn.reply(m.chat,`Anda tidak memiliki pasangan.`,m)
  }
}
handler.help = ['putus']
handler.tags = ['fun']
handler.command = /^(putus)$/i
handler.group = true
handler.limit = true
handler.fail = null
module.exports = handler

export default module.exports;
