import axios from 'axios'
import { EventEmitter } from 'node:events'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const IDN_GRAPHQL_URL = 'https://api.idn.app/graphql'
export const SHOWROOM_ONLIVES_URL = 'https://www.showroom-live.com/api/live/onlives'

const nativeHttp = {
   async post(url, body, options = {}) {
      const response = await fetch(url, {
         method: 'POST',
         headers: {
            'User-Agent': 'Lea-JKT48-Live-Scraper/1.0',
            ...options.headers
         },
         body: JSON.stringify(body),
         signal: AbortSignal.timeout(options.timeout || 8000)
      })
      if (!response.ok) throw new Error(`HTTP ${response.status} dari ${url}`)
      return { data: await response.json() }
   },
   async get(url, options = {}) {
      const response = await fetch(url, {
         method: 'GET',
         headers: {
            'User-Agent': 'Lea-JKT48-Live-Scraper/1.0',
            ...options.headers
         },
         signal: AbortSignal.timeout(options.timeout || 8000)
      })
      if (!response.ok) throw new Error(`HTTP ${response.status} dari ${url}`)
      return { data: await response.json() }
   }
}

const defaultHttp = nativeHttp

const IDN_QUERY = `query SearchLivestream { searchLivestream(query: "", limit: 100) { result { slug title image_url view_count playback_url room_identifier status live_at creator { uuid username name avatar } } } }`

const IDN_OFFICIAL_USERNAMES = new Set([
   'jkt48-official',
   'jkt_x2abfdrhqc67tl'
])

const SHOWROOM_OFFICIAL_ROOM_KEYS = new Set(['officialjkt48'])

const asMapEntries = value => {
   if (!value || typeof value !== 'object') return []
   return Object.values(value).filter(Boolean)
}

const cleanUsername = value => String(value || '').trim().toLowerCase()
const cleanRoomKey = value => String(value || '').trim().toLowerCase()

export const buildAccountIndex = (sns = {}) => {
   const idnByUsername = new Map()
   const showroomByRoomId = new Map()
   const showroomByRoomKey = new Map()

   for (const account of [
      ...asMapEntries(sns.membersIdn),
      ...asMapEntries(sns.officialsIdn)
   ]) {
      const username = cleanUsername(account.username)
      if (username) idnByUsername.set(username, account)
   }

   for (const account of [
      ...asMapEntries(sns.membersShowroom),
      ...asMapEntries(sns.officialsShowroom)
   ]) {
      const roomId = String(account.roomId || account.room_id || '').trim()
      const roomKey = cleanRoomKey(account.roomKey || account.room_url_key)
      if (roomId) showroomByRoomId.set(roomId, account)
      if (roomKey) showroomByRoomKey.set(roomKey, account)
   }

   // Official theater account is stable and is not always included by upstream
   // account-list packages, so keep it as a deterministic local rule.
   showroomByRoomId.set('332503', {
      roomId: 332503,
      roomKey: 'officialJKT48',
      roomName: 'JKT48 Official SHOWROOM'
   })
   showroomByRoomKey.set('officialjkt48', {
      roomId: 332503,
      roomKey: 'officialJKT48',
      roomName: 'JKT48 Official SHOWROOM'
   })

   return { idnByUsername, showroomByRoomId, showroomByRoomKey }
}

const isOfficialIdnLive = (item, index) => {
   const creator = item?.creator || {}
   const username = cleanUsername(creator.username)

   if (!username) return false
   if (IDN_OFFICIAL_USERNAMES.has(username)) return true
   if (index.idnByUsername.has(username)) return true

   // IDN reserves the jkt48_ namespace for JKT48 accounts. Keep this local
   // rule so the bot does not need a second REST service or a member package.
   return username.startsWith('jkt48_')
}

const isOfficialShowroomLive = (item, index) => {
   const roomId = String(item?.room_id || '').trim()
   const roomKey = cleanRoomKey(item?.room_url_key)

   if (index.showroomByRoomId.has(roomId)) return true
   if (index.showroomByRoomKey.has(roomKey)) return true
   if (SHOWROOM_OFFICIAL_ROOM_KEYS.has(roomKey)) return true

   // JKT48 member rooms use the reserved JKT48_ room-key namespace. Other
   // Showroom genres are rejected without an external account dictionary.
   return roomKey.startsWith('jkt48_')
}

const normalizeIdnLive = item => {
   const creator = item?.creator || {}
   const username = String(creator.username || '').trim()
   const slug = String(item?.slug || '').trim()
   if (!username || !slug) return null

   return {
      id: `idn:${slug}`,
      kind: 'idn',
      type: 'idn',
      name: String(creator.name || username).trim(),
      platform: 'IDN Live',
      username,
      title: String(item?.title || '').trim(),
      slug,
      urlKey: username,
      url: `https://www.idn.app/${username}/live/${slug}`,
      image: String(item?.image_url || creator.avatar || '').trim(),
      photo: String(item?.image_url || creator.avatar || '').trim(),
      avatar: String(creator.avatar || '').trim(),
      startedAt: item?.live_at || '',
      viewCount: Number(item?.view_count) || 0,
      streamUrl: String(item?.playback_url || '').trim()
   }
}

const normalizeShowroomLive = (item, account) => {
   const roomId = String(item?.room_id || account?.roomId || '').trim()
   const roomKey = String(item?.room_url_key || account?.roomKey || '').trim()
   if (!roomId && !roomKey) return null

   const name = String(item?.main_name || account?.roomName || '').trim()
   const image = String(item?.image || '').trim()

   return {
      id: `showroom:${roomId || roomKey}:${item?.started_at || ''}`,
      kind: 'showroom',
      type: 'showroom',
      name,
      platform: 'Showroom',
      room_id: roomId,
      room_url_key: roomKey,
      urlKey: roomKey,
      title: '',
      url: `https://www.showroom-live.com/r/${roomKey || roomId}`,
      image,
      photo: image,
      startedAt: item?.started_at || '',
      viewCount: Number(item?.view_num) || 0
   }
}

export const fetchIdnLives = async ({ http = defaultHttp, index = buildAccountIndex() } = {}) => {
   const response = await http.post(
      IDN_GRAPHQL_URL,
      { query: IDN_QUERY },
      {
         headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
         },
         timeout: 8000
      }
   )

   if (Array.isArray(response?.data?.errors) && response.data.errors.length) {
      throw new Error('IDN GraphQL mengembalikan error')
   }

   const items = response?.data?.data?.searchLivestream?.result
   if (!Array.isArray(items)) throw new Error('Struktur respons live IDN tidak valid')

   return items
      .filter(item => isOfficialIdnLive(item, index))
      .map(normalizeIdnLive)
      .filter(Boolean)
}

export const fetchShowroomLives = async ({ http = defaultHttp, index = buildAccountIndex() } = {}) => {
   const response = await http.get(SHOWROOM_ONLIVES_URL, {
      headers: { Accept: 'application/json' },
      timeout: 8000
   })

   const genres = response?.data?.onlives
   if (!Array.isArray(genres) || genres.some(genre => !Array.isArray(genre?.lives))) {
      throw new Error('Struktur respons live Showroom tidak valid')
   }
   const items = genres.flatMap(genre => genre.lives)

   return items
      .filter(item => isOfficialShowroomLive(item, index))
      .map(item => normalizeShowroomLive(item, index.showroomByRoomId.get(String(item.room_id || '').trim())))
      .filter(Boolean)
}

const dedupeEvents = events => {
   const seen = new Set()
   return events.filter(event => {
      if (!event?.id || seen.has(event.id)) return false
      seen.add(event.id)
      return true
   })
}

export const fetchDirectLives = async ({ http = defaultHttp, sns, previousEvents = [], onError } = {}) => {
   const index = buildAccountIndex(sns)
   const kinds = ['idn', 'showroom']
   const results = await Promise.allSettled([
      fetchIdnLives({ http, index }),
      fetchShowroomLives({ http, index })
   ])
   const errors = results
      .filter(result => result.status === 'rejected')
      .map(result => result.reason)

   if (errors.length === results.length) {
      throw new AggregateError(errors, 'IDN dan Showroom direct scraper gagal')
   }
   if (errors.length && typeof onError === 'function') {
      onError(new AggregateError(errors, 'Sebagian sumber direct scraper gagal'))
   }

   // Only retain the failed platform's last snapshot. A healthy empty response
   // must still clear ended lives from that platform, even during a partial outage.
   return dedupeEvents(results.flatMap((result, i) => result.status === 'fulfilled'
      ? result.value
      : previousEvents.filter(event => (event.kind || event.type) === kinds[i])))
}

const POLL_INTERVAL = 30000
const MAX_FAILURES = 5
const RESTART_DELAY = 5000
const FETCH_LOG_COOLDOWN = 5 * 60 * 1000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const NOTIFIED_CACHE_FILE = path.resolve(__dirname, '../../json/jkt48/live_notified.json')
let notifiedCache = null

export const parseLiveStartTime = val => {
   if (!val) return 0
   if (typeof val === 'number') return val > 1e11 ? val : val * 1000
   if (typeof val === 'string' && /^\d+$/.test(val.trim())) {
      const num = parseInt(val.trim(), 10)
      return num > 1e11 ? num : num * 1000
   }
   const t = new Date(val).getTime()
   return Number.isNaN(t) ? 0 : t
}

export const loadNotifiedCache = () => {
   if (notifiedCache) return notifiedCache
   try {
      if (fs.existsSync(NOTIFIED_CACHE_FILE)) {
         const data = JSON.parse(fs.readFileSync(NOTIFIED_CACHE_FILE, 'utf-8'))
         notifiedCache = new Map(Object.entries(data))
      } else {
         notifiedCache = new Map()
      }
   } catch {
      notifiedCache = new Map()
   }
   return notifiedCache
}

export const saveNotifiedCache = () => {
   if (!notifiedCache) return
   try {
      const dir = path.dirname(NOTIFIED_CACHE_FILE)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      const obj = Object.fromEntries(notifiedCache)
      fs.writeFileSync(NOTIFIED_CACHE_FILE, JSON.stringify(obj, null, 2), 'utf-8')
   } catch (e) {
      console.error('[JKT48 LIVE] Gagal menyimpan cache notifikasi:', e)
   }
}

export const isAlreadyNotified = (targetJid, eventId) => {
   const cache = loadNotifiedCache()
   const key = `${targetJid}:${eventId}`
   return cache.has(key)
}

export const markAsNotified = (targetJid, eventId) => {
   const cache = loadNotifiedCache()
   const key = `${targetJid}:${eventId}`
   cache.set(key, Date.now())
   if (cache.size > 2000) {
      const oldestKey = cache.keys().next().value
      cache.delete(oldestKey)
   }
   saveNotifiedCache()
}

export const cleanNotifiedCache = (currentActiveIds = []) => {
   const cache = loadNotifiedCache()
   const activeSet = new Set(currentActiveIds)
   const now = Date.now()
   let changed = false

   for (const [key, timestamp] of cache.entries()) {
      const parts = key.split(':')
      const eventId = parts.slice(1).join(':')

      // Hapus hanya jika live sudah tidak aktif dan umurnya sudah lebih dari 2 jam,
      // atau umurnya sudah lebih dari 24 jam (failsafe).
      const isExpired = now - timestamp > 24 * 60 * 60 * 1000
      const isEndedAndOld = !activeSet.has(eventId) && (now - timestamp > 2 * 60 * 60 * 1000)

      if (isExpired || isEndedAndOld) {
         cache.delete(key)
         changed = true
      }
   }

   if (changed) saveNotifiedCache()
}

const api = axios.create({
   timeout: 15000,
   headers: {
      Accept: 'application/json',
      'User-Agent': 'JKT48-Live-Notifier/1.0'
   }
})

export const liveEvents = new EventEmitter()
liveEvents.setMaxListeners(100)

const state = {
   client: null,
   timer: null,
   running: false,
   checking: false,
   failures: 0,
   sent: new Set(),
   startedAt: 0,
   lastCheckAt: 0,
   lastError: '',
   lastFailureLogAt: 0,
   latestEvents: []
}

export const getLiveDb = () => {
   try {
      if (global.db) {
         if (!global.db.jkt48 || typeof global.db.jkt48 !== 'object') global.db.jkt48 = {}
         if (!global.db.jkt48.live || typeof global.db.jkt48.live !== 'object') {
            global.db.jkt48.live = { enabled: false, targets: [], filters: {}, sent: [] }
         }
         if (!Array.isArray(global.db.jkt48.live.targets)) global.db.jkt48.live.targets = []
         if (!global.db.jkt48.live.filters || typeof global.db.jkt48.live.filters !== 'object') global.db.jkt48.live.filters = {}
         if (!Array.isArray(global.db.jkt48.live.sent)) global.db.jkt48.live.sent = []
         return global.db.jkt48.live
      }
   } catch {}
   return { enabled: false, targets: [], filters: {}, sent: [] }
}

export const listLiveTargets = async () => [...(getLiveDb().targets || [])]
export const getLiveFilters = async jid => [...(getLiveDb().filters?.[jid] || [])]
export const setLiveFilters = async (jid, members = []) => {
   const live = getLiveDb()
   if (!live.filters || typeof live.filters !== 'object') live.filters = {}
   const clean = Array.isArray(members) ? members.map(v => String(v).trim()).filter(Boolean) : []
   if (clean.length) live.filters[jid] = clean
   else delete live.filters[jid]
   return clean
}

export const addLiveTarget = async (jid, members = []) => {
   const live = getLiveDb()
   live.targets = live.targets || []
   if (!live.targets.includes(jid)) live.targets.push(jid)
   await setLiveFilters(jid, members)
   return true
}

export const removeLiveTarget = async jid => {
   const live = getLiveDb()
   live.targets = live.targets || []
   const index = live.targets.indexOf(jid)
   if (live.filters && live.filters[jid]) delete live.filters[jid]
   if (index === -1) return false
   live.targets.splice(index, 1)
   return true
}

export const isLiveEnabled = async () => Boolean(getLiveDb().enabled)
export const setLiveEnabled = async enabled => {
   const live = getLiveDb()
   live.enabled = Boolean(enabled)
   return live.enabled
}

export const wibDateTime = value => {
   const ts = parseLiveStartTime(value)
   const date = ts ? new Date(ts) : (value ? new Date(value) : new Date())
   if (Number.isNaN(date.getTime())) return { date: '-', time: '-' }

   const tanggal = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
   }).format(date)

   const jam = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
   }).format(date).replace('.', ':')

   return { date: tanggal, time: `${jam} WIB` }
}

export const titleFromSlug = slug => {
   const cleaned = String(slug || '')
      .replace(/-\d{6,}$/, '')
      .replace(/-/g, ' ')
      .trim()

   if (!cleaned) return ''
   return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

export const buildIdnAppLink = (urlKey, slug, webUrl) => {
   return `https://click.idn.media/VKUf` +
      `?af_dp=idnapp://live/${urlKey}/?room=${slug}` +
      `&af_web_dp=${webUrl}` +
      `&c=detail-liveroom` +
      `&deep_link_value=idnapp://live/?room=${slug}` +
      `&pid=idnapp`
}

const SHORTEN_MIN_LENGTH = 30
const shortCache = new Map()

export const shortenUrl = async (url, fallback) => {
   if (!url || url.length < SHORTEN_MIN_LENGTH) return url
   if (shortCache.has(url)) return shortCache.get(url)

   const providers = [
      `https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`,
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
   ]

   for (const provider of providers) {
      try {
         const { data } = await api.get(provider, {
            timeout: 8000,
            responseType: 'text',
            transformResponse: v => v
         })

         const short = String(data).trim()
         if (/^https?:\/\/\S+$/.test(short) && short.length < url.length) {
            if (shortCache.size > 200) shortCache.clear()
            shortCache.set(url, short)
            return short
         }
      } catch {}
   }

   return fallback || url
}

export const normalizeLiveEvents = raw => {
   const list = Array.isArray(raw) ? raw
      : Array.isArray(raw?.data) ? raw.data
      : Array.isArray(raw?.live) ? raw.live
      : Array.isArray(raw?.now_live) ? raw.now_live
      : []

   const events = []
   const seen = new Set()

   for (const item of list) {
      if (!item || !item.type) continue

      if (item.type === 'youtube') {
         const url = String(item.url || item.link || '')
         if (!url || seen.has(`yt:${url}`)) continue
         seen.add(`yt:${url}`)

         events.push({
            id: `yt:${url}`,
            kind: 'youtube',
            type: 'youtube',
            name: String(item.channelTitle || item.channel_title || 'Unknown Channel'),
            title: String(item.title || 'Untitled'),
            url,
            image: item.thumbnails?.high?.url || item.thumbnails?.medium?.url || '',
            startedAt: item.started_at || ''
         })
         continue
      }

      if (item.type === 'idn' || item.type === 'showroom') {
         const name = String(item.name || item.main_name || item.room_name || '').trim()
         if (!name) continue

         const urlKey = String(item.url_key || item.room_url_key || item.username || '')
         const slug = String(item.slug || item.room_identifier || '')
         const roomId = item.room_id ? String(item.room_id) : (item.id ? String(item.id) : '')

         const dedupeKey = item.type === 'showroom'
            ? `sr:${roomId || item.room_url_key || urlKey || name}`.toLowerCase()
            : `idn:${slug || item.username || urlKey || name}`.toLowerCase()

         if (seen.has(dedupeKey)) continue
         seen.add(dedupeKey)

         let url = ''
         if (item.type === 'showroom') {
            url = `https://www.showroom-live.com/r/${item.room_url_key || urlKey || roomId}`
         } else if (urlKey && slug) {
            url = `https://www.idn.app/${urlKey}/live/${slug}`
         } else if (slug) {
            url = `https://www.idn.app/live/${slug}`
         } else if (item.url) {
            url = item.url
         }

         events.push({
            id: item.type === 'idn' && slug
               ? `idn:${slug}`
               : `${item.type}:${roomId || urlKey || name}:${item.started_at || item.live_at || ''}`,
            kind: item.type,
            type: item.type,
            name,
            title: item.title || titleFromSlug(slug),
            url,
            urlKey,
            slug,
            image: String(item.img || item.img_alt || item.image || item.image_url || ''),
            startedAt: item.started_at || item.start_date || item.date || item.live_at || ''
         })
      }
   }

   return events
}

export const cleanMemberName = rawName => {
   let name = String(rawName || '').trim()
   if (/^jkt48(\s+official)?$/i.test(name)) return 'JKT48 Official'
   if (name.includes('/')) name = name.split('/')[0].trim()
   name = name.replace(/[\(（]\s*jkt48\s*[\)）]/gi, '').trim()
   if (/^jkt48[_\s]+/i.test(name)) name = name.replace(/^jkt48[_\s]+/i, '').trim()
   if (/[_\s]+jkt48$/i.test(name)) name = name.replace(/[_\s]+jkt48$/i, '').trim()
   return name || String(rawName || '').trim()
}

export const formatLiveDateTime = value => {
   const ts = parseLiveStartTime(value)
   const date = ts ? new Date(ts) : (value ? new Date(value) : new Date())
   if (Number.isNaN(date.getTime())) return ''

   const d = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
   }).format(date)

   const t = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23'
   }).format(date).replace('.', ':')

   return `🗓️ ${d} | ${t} WIB`
}

export const buildLiveContent = async event => {
   const isShowroom = event.kind === 'showroom' || event.type === 'showroom'
   const isYoutube = event.kind === 'youtube' || event.type === 'youtube'
   const platform = isYoutube ? 'YouTube' : isShowroom ? 'showroom' : 'IDN'
   const memberName = cleanMemberName(event.name)
   const header = `🔴 *${memberName} live ${platform}!*`

   let body = `${header}\n\n`
   if (event.title) body += `> ${event.title}\n\n`
   const dateLine = formatLiveDateTime(event.startedAt)
   if (dateLine) body += `${dateLine}`

   const buttons = []
   let linksText = ''

   if (isYoutube) {
      if (event.url) {
         buttons.push({
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
               display_text: 'YouTube',
               url: event.url,
               merchant_url: event.url
            })
         })
         const shortYt = await shortenUrl(event.url, event.url)
         linksText = `\n\n🔗 ${shortYt}`
      }
   } else if (isShowroom) {
      if (event.url) {
         buttons.push({
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
               display_text: 'Showroom',
               url: event.url,
               merchant_url: event.url
            })
         })
         const shortSr = await shortenUrl(event.url, event.url)
         linksText = `\n\n🔗 *Showroom* :\n${shortSr}`
      }
   } else {
      // IDN Live
      const rawAppLink =
         event.urlKey && event.slug
            ? buildIdnAppLink(event.urlKey, event.slug, event.url)
            : ''

      // Tombol IDN App memakai direct link (tanpa tinyurl) agar langsung membuka aplikasi
      if (rawAppLink) {
         buttons.push({
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
               display_text: 'IDN App',
               url: rawAppLink,
               merchant_url: rawAppLink
            })
         })
      }

      // Tombol IDN Web memakai direct web URL
      if (event.url) {
         buttons.push({
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
               display_text: 'IDN Web',
               url: event.url,
               merchant_url: event.url
            })
         })
      }

      // Teks fallback diringkas dengan shortenUrl agar rapi
      const shortAppLink = rawAppLink ? await shortenUrl(rawAppLink, rawAppLink) : ''
      const shortWebLink = event.url ? await shortenUrl(event.url, event.url) : ''

      if (shortAppLink) {
         linksText = `\n\n📱 *IDN App* :\n${shortAppLink}\n\n💻 *IDN Web* :\n${shortWebLink || event.url}`
      } else if (event.url) {
         linksText = `\n\n💻 *IDN Web* :\n${shortWebLink || event.url}`
      }
   }

   const content = body.trim()
   const fallbackText = content + linksText

   return {
      header,
      content,
      buttons,
      fallbackText
   }
}

export const formatLiveMessage = async event => {
   const { fallbackText } = await buildLiveContent(event)
   return fallbackText
}

const imageBufferCache = new Map()
const IMAGE_CACHE_TTL = 30 * 60 * 1000 // 30 menit

export const sendLiveNotification = async (client, targetJid, event, quoted = null) => {
   const sock = client?.sock || client
   const { content, buttons, fallbackText } = await buildLiveContent(event)
   const footer = global.footer || ''

   // Pre-fetch image buffer jika event.image berupa URL agar terunggah sempurna di Baileys
   let imageMedia = event.image || null
   if (event.image && typeof event.image === 'string') {
      const cached = imageBufferCache.get(event.image)
      if (cached && Date.now() - cached.timestamp < IMAGE_CACHE_TTL) {
         imageMedia = cached.buffer
      } else {
         try {
            const res = await axios.get(event.image, {
               responseType: 'arraybuffer',
               timeout: 10000,
               headers: {
                  'User-Agent':
                     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
               }
            })
            if (res?.data && res.data.length > 0) {
               imageMedia = Buffer.from(res.data)
               imageBufferCache.set(event.image, { buffer: imageMedia, timestamp: Date.now() })
            }
         } catch (err) {
            imageMedia = event.image
         }
      }
   }

   // 1. Coba kirim via Interactive Buttons dengan header foto biasa, bukan kartu produk
   if (buttons.length && typeof sock?.sendIAMessage === 'function') {
      try {
         await sock.sendIAMessage(targetJid, buttons, quoted, {
            header: '',
            content,
            footer,
            ...(imageMedia ? { media: imageMedia, v2: false } : {})
         })
         return true
      } catch (err) {
         console.warn(`[JKT48 LIVE] sendIAMessage gagal ke ${targetJid}, mencoba fallback:`, err.message || err)
      }
   }

   // 2. Fallback: kirim gambar (atau teks) dengan caption lengkap + footer
   const fullText = fallbackText + (footer ? `\n\n${footer}` : '')
   try {
      if (imageMedia && typeof sock?.sendFile === 'function') {
         await sock.sendFile(targetJid, imageMedia, 'live.jpg', fullText, quoted)
      } else if (typeof sock?.sendMessage === 'function') {
         await sock.sendMessage(targetJid, { text: fullText }, { quoted })
      } else if (typeof sock?.reply === 'function') {
         await sock.reply(targetJid, fullText, quoted)
      } else {
         return false
      }
      return true
   } catch (err) {
      console.error(`[JKT48 LIVE] Gagal kirim notifikasi ke ${targetJid}:`, err.message || err)
      return false
   }
}

export const fetchNowLive = async (group = 'jkt48') => {
   const logFailure = error => {
      const now = Date.now()
      if (now - state.lastFailureLogAt >= FETCH_LOG_COOLDOWN) {
         state.lastFailureLogAt = now
         console.error('[JKT48 LIVE] Direct scraper gagal:', error.message || error)
      }
   }

   try {
      const events = await fetchDirectLives({
         previousEvents: state.latestEvents,
         onError: logFailure
      })
      state.latestEvents = events
      return events
   } catch (error) {
      logFailure(error)
      return state.latestEvents || []
   }
}

export const processLiveEvents = async (events, sent, send) => {
   const currentIds = new Set(events.map(v => v.id))
   const notified = []

   for (const event of events) {
      if (sent.has(event.id)) continue

      await send(event)
      sent.add(event.id)
      notified.push(event)
   }

   for (const id of [...sent]) {
      if (!currentIds.has(id)) sent.delete(id)
   }

   return notified
}

const broadcast = async event => {
   const live = getLiveDb()
   for (const jid of (live.targets || [])) {
      await sendLiveNotification(state.client, jid, event)
   }
}

const tick = async () => {
   if (!state.running || state.checking || !state.client) return
   state.checking = true

   try {
      const events = await fetchNowLive()
      state.lastCheckAt = Date.now()
      state.failures = 0
      state.lastError = ''

      // Emit tick event to all listeners (auto_idn, auto_sr, etc.)
      liveEvents.emit('tick', { client: state.client, events })

      const live = getLiveDb()
      if (live.enabled && live.targets?.length) {
         await processLiveEvents(events, state.sent, broadcast)
      }
   } catch (e) {
      state.failures++
      state.lastError = e.message || String(e)
      console.error(`[JKT48 LIVE] Gagal cek (${state.failures}/${MAX_FAILURES}):`, state.lastError)

      if (state.failures >= MAX_FAILURES) {
         const client = state.client
         stopLiveNotifier()
         setTimeout(() => startLiveNotifier(client), RESTART_DELAY)
         console.error('[JKT48 LIVE] Restart otomatis setelah gagal beruntun.')
      }
   } finally {
      state.checking = false
   }
}

export const ensureLivePoller = client => {
   if (client && !state.client) state.client = client
   if (!state.running && state.client) {
      startLiveNotifier(state.client)
   }
   return state
}

export const startLiveNotifier = client => {
   stopLiveNotifier()

   state.client = client
   state.running = true
   state.failures = 0
   state.startedAt = Date.now()
   state.timer = setInterval(tick, POLL_INTERVAL)
   if (state.timer.unref) state.timer.unref()

   tick()
   return state
}

export const initLiveNotifier = async client => {
   return startLiveNotifier(client)
}

export const stopLiveNotifier = () => {
   state.running = false
   if (state.timer) {
      clearInterval(state.timer)
      state.timer = null
   }
}

export const resetLiveCache = () => {
   const size = state.sent.size
   state.sent.clear()
   state.failures = 0
   return size
}

export const getLiveStatus = async () => {
   const live = getLiveDb()
   return {
      running: state.running,
      failures: state.failures,
      maxFailures: MAX_FAILURES,
      cached: state.sent.size,
      targets: [...(live.targets || [])],
      startedAt: state.startedAt,
      lastCheckAt: state.lastCheckAt,
      lastError: state.lastError,
      pollInterval: POLL_INTERVAL
   }
}
