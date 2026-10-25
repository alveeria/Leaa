global.owner = process.env.OWNER_NUMBER ? [process.env.OWNER_NUMBER] : ['6280000000000'];
global.mods = process.env.OWNER_NUMBER ? [process.env.OWNER_NUMBER] : ['6280000000000'];
global.prems = process.env.OWNER_NUMBER ? [process.env.OWNER_NUMBER] : ['6280000000000'];
global.nameowner = 'alveeria';
global.numberowner = process.env.OWNER_NUMBER || '6280000000000';
global.mail = 'support@leaa.web.id';
global.gc = 'https://chat.whatsapp.com/xxx';
global.instagram = 'https://instagram.com/xxx';
global.wm = '© alveeria';
global.wait = '_*Tunggu sedang di proses...*_';
global.eror = '_*Server Error*_';
global.stiker_wait = '*⫹⫺ Stiker sedang dibuat...*';
global.packname = 'Created by Bot';
global.author = '© alveeria';
global.maxwarn = '2'; // Peringatan maksimum
global.antiporn = false; // Auto delete pesan porno (bot harus admin)
global.spam = true;
global.gcspam = false;

//INI WAJIB DI ISI!//
global.lann = process.env.API_KEY_BETABOTZ || "";
//Daftar terlebih dahulu https://api.betabotz.eu.org

//INI OPTIONAL BOLEH DI ISI BOLEH JUGA ENGGA//
global.btc = process.env.API_KEY_BTC || "";
//Daftar https://api.botcahx.eu.org 

global.APIs = {   
  lann: 'https://api.betabotz.eu.org',
  btc: 'https://api.botcahx.eu.org'
}
global.APIKeys = { 
  'https://api.betabotz.eu.org': global.lann, 
  'https://api.botcahx.eu.org': global.btc //OPSIONAL
}

let fs = require('fs')
let chalk = require('chalk')
let file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  delete require.cache[file]
  require(file)
})

global.prefix ??= ".";
global.aksesKey = process.env.API_KEY_BETABOTZ_AKSESKEY || "";
global.dana = process.env.API_KEY_DANA || "";
global.taskToken = process.env.API_KEY_TOKEN || "";
global.lapor ??= false;
global.autobio ??= false;
global.idchannel ??= [];
