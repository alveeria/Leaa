import { getActiveMembers } from './members.js'

const MATCH_CACHE = new Map()
const MAX_CACHE_ENTRIES = 200

export function clearOshiMatchCache() {
   MATCH_CACHE.clear()
}

export async function createOshiMatch(userName, date = new Date()) {
   const cleanName = String(userName || '').replace(/\s+/g, ' ').trim().slice(0, 60)
   if (!cleanName) throw new Error('Nama belum diisi.')

   const members = await getActiveMembers()
   if (!members.length) throw new Error('Data member JKT48 belum tersedia.')

   const dateKey = jakartaDateKey(date)
   const cacheKey = `${normalize(cleanName)}|${dateKey}`
   const cached = MATCH_CACHE.get(cacheKey)
   if (cached) return cached

   const seed = hash(cacheKey)
   const member = members[seed % members.length]
   const matchLevel = 70 + (hash(`${seed}|match`) % 31)
   const narrative = await generateNarrative({ cleanName, member, matchLevel })
   const result = { userName: cleanName, member, matchLevel, narrative, dateKey }

   MATCH_CACHE.set(cacheKey, result)
   if (MATCH_CACHE.size > MAX_CACHE_ENTRIES) {
      MATCH_CACHE.delete(MATCH_CACHE.keys().next().value)
   }

   return result
}

export function formatOshiMatch(result) {
   const { userName, member, matchLevel, narrative } = result
   const stageName = member.nickname || member.name
   const fullName = member.name
   const team = member.teamLabel || 'JKT48'

   const filledBlocks = Math.round(matchLevel / 10)
   const emptyBlocks = 10 - filledBlocks
   const progressBar = `[${'█'.repeat(filledBlocks)}${'░'.repeat(emptyBlocks)}]`

   const cleanDesc = narrative?.description ? narrative.description.replace(/^[“"']+|[”"']+$/g, '').trim() : ''
   const cleanMsg = narrative?.message ? narrative.message.replace(/^[“"']+|[”"']+$/g, '').trim() : ''

   const lines = [
      '乂  *O S H I  M A T C H*', '',
      `💞 Oshi yang cocok untuk kak *${userName}*:`, '',
      `${fullName} — *${stageName}*`,
      `◦ Tim: ${team}`,
      `◦ Match: ${progressBar} *${matchLevel}%*`
   ]

   if (cleanDesc) {
      lines.push('', `“${cleanDesc}”`)
   }

   if (cleanMsg) {
      lines.push('', `💌 ${cleanMsg}`)
   }

   if (member.detailUrl) {
      lines.push('', '🔗 *Profil Member:*', member.detailUrl)
   }

   return lines.filter(line => line !== undefined).join('\n').trim()
}

async function generateNarrative({ cleanName, member, matchLevel }) {
   const config = global.db?.setting?.chatbot_config || {}
   const prompt = buildPrompt(cleanName, member, matchLevel)

   // 1. Prioritas Utama: 9Router dengan model Marsha
   const nineRouterUrl = config.url?.ninerouter || process.env.NINEROUTER_URL || 'https://9router.leaa.site/v1'
   const nineRouterKey = config.apikey?.ninerouter || process.env.NINEROUTER_API || process.env.NINEROUTER_KEY || ''
   const nineRouterModel = config.model?.ninerouter || 'Marsha'

   try {
      return await requestNineRouter(nineRouterUrl, nineRouterKey, nineRouterModel, prompt)
   } catch (error) {
      console.warn(`[Oshi Match AI] 9Router (${nineRouterModel}) gagal, coba fallback:`, error.message)
   }

   // 2. Fallback Gemini jika tersedia
   const geminiKey = Array.isArray(config.apikey?.gemini) ? config.apikey.gemini[0] : config.apikey?.gemini
   if (geminiKey) {
      const geminiModel = config.model?.gemini && !config.model?.gemini.includes('1.5') && !config.model?.gemini.includes('2.5')
         ? config.model.gemini
         : 'gemini-3.8-flash'
      try {
         return await requestGemini(geminiKey, geminiModel, prompt)
      } catch (error) {
         console.warn(`[Oshi Match AI] Gemini (${geminiModel}) gagal:`, error.message)
      }
   }

   // 3. Fallback Cloudflare Workers AI jika tersedia
   const cfAccount = config.apikey?.cloudflare?.account || '2a6b53e28571e289c86e51c14f5c7c05'
   const cfToken = config.apikey?.cloudflare?.token || 'vVb9MxGxbXgsMCNsPBQvarE8bu0STPoNJUT_Ey3S'
   if (cfAccount && cfToken) {
      const cfModel = '@cf/meta/llama-3.1-8b-instruct-fast'
      try {
         return await requestCloudflare(cfAccount, cfToken, cfModel, prompt)
      } catch (error) {
         console.warn(`[Oshi Match AI] Cloudflare (${cfModel}) gagal:`, error.message)
      }
   }

   // 4. Fallback Groq jika tersedia
   if (config.apikey?.groq && typeof config.apikey.groq === 'string' && config.apikey.groq.startsWith('gsk_')) {
      const groqModel = config.model?.groq || 'llama-3.3-70b-versatile'
      try {
         return await requestGroq(config.apikey.groq, groqModel, prompt)
      } catch (error) {
         console.warn(`[Oshi Match AI] Groq (${groqModel}) gagal:`, error.message)
      }
   }

   return localNarrative(cleanName, member, matchLevel)
}

function buildPrompt(userName, member, matchLevel) {
   const stageName = member.nickname || member.name
   const team = member.teamLabel || 'JKT48'

   return [
      `Kamu adalah Marsha, asisten AI yang ceria, manis, hangat, dan ekspresif.`,
      `Berikan narasi kecocokan permainan fandom yang santai, manis, dan seru antara pengguna dan member JKT48 berikut:`,
      `- Nama Pengguna: ${userName}`,
      `- Member Oshi: ${member.name} (${stageName})`,
      `- Tim/Status: ${team}`,
      `- Match Level: ${matchLevel}%`,
      '',
      `Aturan Penulisan:`,
      `1. Sapa pengguna dengan ramah menggunakan "kak ${userName}" (contoh: "Halo kak ${userName}~" atau "Wah kak ${userName}, ...").`,
      `2. Tulis dalam bahasa Indonesia santai, hangat, manis, dan natural khas Marsha (hindari gaya kaku seperti pengumuman kantor/disclaimer).`,
      `3. Di bagian "description" (2-3 kalimat): jelaskan dengan seru dan manis kenapa mereka cocok berdasarkan match level-nya, pesona ${stageName}, atau momen seru saat nonton teater/interaksi fandom.`,
      `4. Di bagian "message" (1 kalimat): berikan pesan penutup yang manis dan menyemangati kak ${userName} untuk terus mendukung ${stageName} (hindari bahasa birokratis/kaku).`,
      `5. Format output WAJIB JSON murni persis:`,
      `{"description": "...", "message": "..."}`
   ].join('\n')
}

async function requestNineRouter(baseURL, apiKey, model, prompt) {
   const cleanBase = String(baseURL || 'https://9router.leaa.site/v1').replace(/\/+$/, '')
   const url = `${cleanBase}/chat/completions`
   const headers = { 'Content-Type': 'application/json' }
   if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

   const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
         model: model || 'Marsha',
         stream: false,
         messages: [
            {
               role: 'system',
               content: 'Kamu adalah Marsha, asisten AI yang ceria, manis, hangat, dan ekspresif. Balas hanya dengan JSON valid format: {"description":"...","message":"..."}'
            },
            { role: 'user', content: prompt }
         ],
         temperature: 0.7
      }),
      signal: AbortSignal.timeout(20_000)
   })
   const json = await response.json().catch(() => ({}))
   if (!response.ok) throw new Error(json.error?.message || `HTTP ${response.status}`)
   const content = json.choices?.[0]?.message?.content
   return parseNarrative(content)
}

async function requestGemini(apiKey, model, prompt) {
   if (!apiKey) throw new Error('API key tidak tersedia')
   const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
         method: 'POST', headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
               responseMimeType: 'application/json',
               maxOutputTokens: 1600,
               temperature: 0.7
            }
         }),
         signal: AbortSignal.timeout(20_000)
      }
   )
   const json = await response.json().catch(() => ({}))
   if (!response.ok) throw new Error(json.error?.message || `HTTP ${response.status}`)
   const text = json.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('')
   return parseNarrative(text)
}

async function requestCloudflare(account, token, model, prompt) {
   if (!account || !token) throw new Error('Cloudflare credentials tidak tersedia')
   const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${model}`,
      {
         method: 'POST',
         headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            messages: [
               {
                  role: 'system',
                  content: 'Kamu adalah Marsha, asisten AI yang ceria, manis, hangat, dan ekspresif. Balas hanya dengan JSON valid format: {"description":"...","message":"..."}'
               },
               { role: 'user', content: prompt }
            ]
         }),
         signal: AbortSignal.timeout(20_000)
      }
   )
   const json = await response.json().catch(() => ({}))
   if (!response.ok) throw new Error(json.errors?.[0]?.message || `HTTP ${response.status}`)
   const text = json.result?.response || json.result?.choices?.[0]?.message?.content
   return parseNarrative(text)
}

async function requestGroq(apiKey, model, prompt) {
   if (!apiKey) throw new Error('API key tidak tersedia')
   const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
         model,
         messages: [
            { role: 'system', content: 'Kamu adalah Marsha, asisten AI yang ceria, manis, hangat, dan ekspresif. Balas hanya dengan JSON valid format: {"description":"...","message":"..."}' },
            { role: 'user', content: prompt }
         ],
         temperature: 0.7,
         max_completion_tokens: 400,
         response_format: { type: 'json_object' }
      }),
      signal: AbortSignal.timeout(20_000)
   })
   const json = await response.json().catch(() => ({}))
   if (!response.ok) throw new Error(json.error?.message || `HTTP ${response.status}`)
   return parseNarrative(json.choices?.[0]?.message?.content)
}

function parseNarrative(text) {
   const clean = String(text || '').trim()
      .replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
   const start = clean.indexOf('{')
   const end = clean.lastIndexOf('}')
   if (start < 0 || end <= start) throw new Error('Respons bukan JSON')
   const data = JSON.parse(clean.slice(start, end + 1))
   const description = sanitize(data.description, 500)
   const message = sanitize(data.message, 300)
   if (!description || !message) throw new Error('Struktur narasi tidak lengkap')
   return { description, message, source: 'ai' }
}

function localNarrative(userName, member, matchLevel) {
   const nickname = member.nickname || member.name
   const team = member.teamLabel ? ` di ${member.teamLabel}` : ''

   let description = ''
   if (matchLevel >= 85) {
      description = `Wah kak ${userName}, kalian berdua punya frekuensi yang klop banget! Energi kakak yang positif pas banget sama pesona ceria ${nickname}${team}. Dijamin kalau nonton teater bareng atau pas 2-shot bakal seru dan berkesan abis!`
   } else if (matchLevel >= 70) {
      description = `Kecocokan kak ${userName} sama ${nickname}${team} tergolong manis dan serasi lho! Ada chemistry hangat yang bikin kakak betah banget mandangin performanya yang memukau di atas panggung.`
   } else {
      description = `Hubungan yang unik dan penuh kejutan nih buat kak ${userName}! Walau santai, justru perbedaan karakter kalian bisa bikin momen ngedukung ${nickname}${team} jadi makin seru dan berwarna.`
   }

   const messages = [
      `Yuk dukung terus kak ${nickname} biar senyum cantiknya makin bersinar di setiap panggung! ✨`,
      `Semoga selalu ada kesempatan buat seru-seruan bareng kak ${nickname} di teater yaa~ ✨`,
      `Semangat terus dukung ${nickname}, semoga jadi mood booster terbaik buat hari-hari kakak! 🌸`
   ]
   const seed = hash(`${normalize(userName)}|${member.id}|${matchLevel}`)
   const message = messages[seed % messages.length]

   return {
      description,
      message,
      source: 'local'
   }
}

function sanitize(value, maxLength) {
   return String(value || '').replace(/[*_~`]/g, '').replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function normalize(value) {
   return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function jakartaDateKey(date) {
   return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit'
   }).format(date)
}

function hash(value) {
   let output = 2166136261
   for (const char of String(value)) {
      output ^= char.charCodeAt(0)
      output = Math.imul(output, 16777619)
   }
   return output >>> 0
}
