import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const free = 20000
const prem = 40000
const limitfree = 20
const limitprem = 40
const moneyfree = 20000
const moneyprem = 40000

let handler = async (m, { isPrems }) => {
    let time = global.db.data.users[m.sender].lastmonthly + 2592000000
  if (new Date - global.db.data.users[m.sender].lastmonthly < 2592000000) throw `Anda sudah mengklaim, klaim bulanan ini\ntunggu selama ${msToTime(time - new Date())} lagi`
      // conn.reply(m.chat, `Anda sudah mengklaim dan mendapatkan :`, m)
        global.db.data.users[m.sender].exp += isPrems ? prem : free
        global.db.data.users[m.sender].money += isPrems ? moneyprem : moneyfree
        global.db.data.users[m.sender].limit += isPrems ? limitprem : limitfree
       // global.db.data.users[m.sender].pet += 3
        conn.reply(m.chat, `Selamat kamu mendapatkan:\n\n+${isPrems ? prem : free} Exp\n+${isPrems ? moneyprem : moneyfree} Money\n+${isPrems ? limitprem : limitfree} Limit`, m)
        global.db.data.users[m.sender].lastmonthly = new Date * 1
    }
handler.help = ['monthly']
handler.tags = ['rpgabsen']
handler.command = /^(monthly)$/i
handler.limit = true
handler.rpg = true
handler.fail = null

module.exports = handler

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
    monthly = Math.floor((duration / (1000 * 60 * 60 * 24)) % 720)

  monthly  = (monthly < 10) ? "0" + monthly : monthly
  hours = (hours < 10) ? "0" + hours : hours
  minutes = (minutes < 10) ? "0" + minutes : minutes
  seconds = (seconds < 10) ? "0" + seconds : seconds

  return monthly + " hari " +  hours + " jam " + minutes + " menit"
}
export default module.exports;
