import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirnameOf } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirnameOf(__filename);
const module = { exports: {} };
let exports = module.exports;
const util = require("util");
const path = require("path");

const araAudioURLs = [
  "https://bucin-livid.vercel.app/audio/ara2.mp3",
  "https://bucin-livid.vercel.app/audio/ara.mp3",
  "https://bucin-livid.vercel.app/audio/audio_ara-ara.mp3"
];

const loveyouAudioURLs = [
  "https://bucin-livid.vercel.app/audio/lopyou.mp3",
  "https://xnuvers007.github.io/mp3/loveyoubaby.mp3",
];

let handler = async (m, { conn }) => {
  const randomAraAudio = araAudioURLs[Math.floor(Math.random() * araAudioURLs.length)];
  const randomLoveyouAudio = loveyouAudioURLs[Math.floor(Math.random() * loveyouAudioURLs.length)];

  if (m.text.match(/(ara ara|ara)/i)) {
    conn.sendFile(m.chat, randomAraAudio, "ara.mp3", null, m, true, {
      type: "audioMessage",
      ptt: true,
    });
  } else if (m.text.match(/(lopyou|lopyu|loveyou|love|lope|lupyu|iloveyou)/i)) {
    conn.sendFile(m.chat, randomLoveyouAudio, "lopyou.mp3", null, m, true, {
      type: "audioMessage",
      ptt: true,
    });
  }
};

handler.customPrefix = /^(Ara ara|ara ara|Ara|ara|lopyou|lopyu|loveyou|love|lope|lupyu|iloveyou)$/i;
handler.command = new RegExp();

module.exports = handler;
export default module.exports;
