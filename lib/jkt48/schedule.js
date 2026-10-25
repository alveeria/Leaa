import axios from 'axios'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const API_BASE_URL = 'https://jkt48.com/api/v1'
const CACHE_TIME = 15 * 60 * 1000

/*
 * Mengambil bulan sekarang dan dua bulan berikutnya.
 */
const MONTH_LOOKAHEAD = 2
const LIST_LIMIT = 10

const ROOT_DIR = fileURLToPath(new URL('../../', import.meta.url))

export const JKT48_SCHEDULE_CACHE_DIR = path.join(ROOT_DIR, '.cache', 'jkt48', 'schedule')
const SCHEDULE_CACHE_FILE = path.join(JKT48_SCHEDULE_CACHE_DIR, 'schedules.json')

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        Accept: 'application/json',
        'User-Agent':
            'Mozilla/5.0 (X11; Linux x86_64) ' +
            'AppleWebKit/537.36 (KHTML, like Gecko) ' +
            'Chrome/120.0.0.0 Safari/537.36'
    }
})

let cacheLoaded = false
let cacheWriteQueue = Promise.resolve()
let scheduleCache = { months: {}, details: {} }

const monthRequests = new Map()
const detailRequests = new Map()

const ensureCacheDirectory = async () => {
    await mkdir(JKT48_SCHEDULE_CACHE_DIR, { recursive: true })
}

const readJson = async (file, fallback) => {
    try {
        const content = await readFile(file, 'utf8')
        return JSON.parse(content)
    } catch {
        return fallback
    }
}

const writeJson = async (file, data) => {
    await ensureCacheDirectory()

    const temporaryFile = `${file}.${process.pid}.${Date.now()}.tmp`

    await writeFile(temporaryFile, JSON.stringify(data, null, 2), 'utf8')
    await rename(temporaryFile, file)
}

const loadCache = async () => {
    if (cacheLoaded) return

    const stored = await readJson(SCHEDULE_CACHE_FILE, { months: {}, details: {} })

    scheduleCache = {
        months: stored?.months && typeof stored.months === 'object' ? stored.months : {},
        details: stored?.details && typeof stored.details === 'object' ? stored.details : {}
    }

    cacheLoaded = true
}

const saveCache = async () => {
    cacheWriteQueue = cacheWriteQueue
        .catch(() => {})
        .then(() => writeJson(SCHEDULE_CACHE_FILE, scheduleCache))

    return cacheWriteQueue
}

const MONTH_NAMES = {
    jan: 1, januari: 1, feb: 2, februari: 2, mar: 3, maret: 3,
    apr: 4, april: 4, mei: 5, may: 5, jun: 6, juni: 6,
    jul: 7, juli: 7, agu: 8, agustus: 8, aug: 8,
    sep: 9, september: 9, okt: 10, oktober: 10, oct: 10,
    nov: 11, november: 11, des: 12, desember: 12, dec: 12
}

const cleanReaderLine = value => String(value || '')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s*/, '')
    .replace(/^\d+\.\s+/, '')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const parseSchedulePage = markdown => {
    const lines = String(markdown || '')
        .replace(/\r/g, '')
        .split('\n')
        .map(cleanReaderLine)
        .filter(Boolean)
    const items = []
    const validTypes = new Set(['SHOW', 'EVENT', 'EXCLUSIVE'])

    for (let index = 0; index < lines.length - 6; index++) {
        if (!/^\d{1,2}$/.test(lines[index])) continue

        const day = Number(lines[index])
        const month = MONTH_NAMES[lines[index + 1]?.toLowerCase()]
        const year = Number(lines[index + 2])
        if (!month || !Number.isInteger(year) || year < 2020) continue

        let cursor = index + 3
        if (/^JKT48$/i.test(lines[cursor])) cursor++
        const type = String(lines[cursor] || '').toUpperCase()
        if (!validTypes.has(type)) continue

        const title = lines[cursor + 1]
        const time = String(lines[cursor + 2] || '').match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/)
        if (!title || !time) continue

        const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        items.push({
            link: '',
            schedule_id: 0,
            date,
            start_time: time[1],
            end_time: time[2],
            type,
            status: true,
            content_body: '',
            short_description: '',
            title,
            jkt48_member_type: '',
            birthday_member: null,
            reference_code: ''
        })
        index = cursor + 2
    }

    return items
}

const getReaderKeys = () => [...new Set(
    [process.env.JINA_API_KEYS, process.env.JINA_API_KEY]
        .flatMap(value => String(value || '').split(/[,;\s]+/))
        .map(value => value.trim())
        .filter(value => value.startsWith('jina_'))
)]

const requestReaderText = async targetUrl => {
    const readerTarget = targetUrl.replace(/&/g, '%26')
    const attempts = [...getReaderKeys(), '']
    let lastStatus = 0

    for (const key of attempts) {
        const headers = {
            Accept: 'text/plain',
            'X-Return-Format': 'markdown'
        }
        if (key) headers.Authorization = `Bearer ${key}`

        const response = await fetch(`https://r.jina.ai/${readerTarget}`, {
            headers,
            signal: AbortSignal.timeout(30000)
        })
        lastStatus = response.status
        if (response.ok) return response.text()
        if (![401, 402, 403, 429].includes(response.status)) break
    }

    throw new Error(`Jina Reader gagal (HTTP ${lastStatus || 'unknown'}).`)
}

const parseReaderJson = text => {
    const source = String(text || '').trim()
    const firstBrace = source.indexOf('{')
    const lastBrace = source.lastIndexOf('}')
    if (firstBrace < 0 || lastBrace <= firstBrace) return null

    try {
        return JSON.parse(source.slice(firstBrace, lastBrace + 1))
    } catch {
        return null
    }
}

const requestScheduleFallback = async params => {
    const query = new URLSearchParams({
        month: String(params.month),
        year: String(params.year),
        lang: String(params.lang || 'id')
    })
    const apiTarget = `${API_BASE_URL}/schedules?${query}`

    try {
        const proxied = parseReaderJson(await requestReaderText(apiTarget))
        if (proxied?.status === true && Array.isArray(proxied.data)) {
            return proxied.data
        }
    } catch {}

    const markdown = await requestReaderText('https://jkt48.com/schedule/list')
    const items = parseSchedulePage(markdown)
    if (!items.length) throw new Error('Schedule JKT48 tidak berhasil dibaca.')

    const month = Number(params.month)
    const year = Number(params.year)
    return items.filter(item =>
        Number(item.date.slice(0, 4)) === year &&
        Number(item.date.slice(5, 7)) === month
    )
}

/*
 * Request API resmi JKT48. Jika Cloudflare memblokir API (403),
 * gunakan halaman schedule publik melalui Reader agar command tetap hidup.
 */
export const requestJkt48Api = async (endpoint, params = {}) => {
    try {
        const { data } = await api.get(endpoint, { params })

        if (!data || data.status !== true) {
            throw new Error(data?.message || 'API JKT48 tidak memberikan data.')
        }

        return data.data
    } catch (error) {
        if (error.response?.status === 403) {
            const query = new URLSearchParams(
                Object.entries(params).map(([key, value]) => [key, String(value)])
            )
            const suffix = query.size ? `?${query}` : ''

            try {
                const proxied = parseReaderJson(
                    await requestReaderText(`${API_BASE_URL}${endpoint}${suffix}`)
                )

                if (proxied?.status === true) return proxied.data
            } catch (proxyError) {
                if (endpoint !== '/schedules') throw proxyError
            }

            if (endpoint === '/schedules') {
                return requestScheduleFallback(params)
            }
        }
        throw error
    }
}

const normalizeSchedule = item => {
    return {
        link: String(item?.link || ''),
        scheduleId: Number(item?.schedule_id) || 0,
        date: String(item?.date || ''),
        startTime: String(item?.start_time || ''),
        endTime: String(item?.end_time || ''),
        type: String(item?.type || '').toUpperCase(),
        status: item?.status !== false,
        contentBody: String(item?.content_body || ''),
        shortDescription: String(item?.short_description || ''),
        title: String(item?.title || '').trim(),
        memberType: String(item?.jkt48_member_type || '').toUpperCase(),
        birthdayMember: item?.birthday_member || null,
        referenceCode: String(item?.reference_code || '').toUpperCase()
    }
}

const getJakartaParts = (date = new Date()) => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23'
    })

    const parts = Object.fromEntries(
        formatter
            .formatToParts(date)
            .filter(part => part.type !== 'literal')
            .map(part => [part.type, part.value])
    )

    return {
        year: Number(parts.year),
        month: Number(parts.month),
        day: Number(parts.day),
        hour: Number(parts.hour),
        minute: Number(parts.minute),
        second: Number(parts.second)
    }
}

const getMonthByOffset = offset => {
    const now = getJakartaParts()
    const base = now.year * 12 + (now.month - 1) + offset

    return {
        year: Math.floor(base / 12),
        month: (base % 12) + 1
    }
}

const makeMonthKey = (year, month) => `${year}-${String(month).padStart(2, '0')}`

/*
 * Mengubah waktu WIB menjadi timestamp.
 * Tidak bergantung pada timezone server panel.
 */
export const parseJakartaTimestamp = (date, time = '00:00:00') => {
    if (!date) return Number.NaN

    let normalizedTime = String(time || '00:00:00')

    if (/^\d{2}:\d{2}$/.test(normalizedTime)) {
        normalizedTime += ':00'
    }

    return Date.parse(`${date}T${normalizedTime}+07:00`)
}

export const getScheduleStartTimestamp = item => {
    return parseJakartaTimestamp(item.date, item.startTime)
}

export const getScheduleEndTimestamp = item => {
    return parseJakartaTimestamp(item.date, item.endTime || item.startTime)
}

const isPastSchedule = item => {
    const timestamp = getScheduleEndTimestamp(item)
    return Number.isFinite(timestamp) && timestamp < Date.now()
}

/*
 * Mengambil schedule berdasarkan bulan.
 */
export const getScheduleMonth = async (year, month, forceRefresh = false) => {
    await loadCache()

    year = Number(year)
    month = Number(month)

    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
        throw new Error('Bulan atau tahun schedule tidak valid.')
    }

    const key = makeMonthKey(year, month)
    const cached = scheduleCache.months[key]

    if (
        !forceRefresh &&
        Array.isArray(cached?.items) &&
        Date.now() - Number(cached.updatedAt || 0) < CACHE_TIME
    ) {
        return cached.items
    }

    if (monthRequests.has(key)) return monthRequests.get(key)

    const request = (async () => {
        try {
            const data = await requestJkt48Api('/schedules', {
                month: String(month),
                year: String(year),
                lang: 'id'
            })

            const items = Array.isArray(data)
                ? data.map(normalizeSchedule).filter(item => item.status && item.title && item.date)
                : []

            scheduleCache.months[key] = { updatedAt: Date.now(), items }
            await saveCache()

            return items
        } catch (error) {
            /*
             * Gunakan cache lama saat API gagal.
             */
            if (Array.isArray(cached?.items)) return cached.items
            throw error
        } finally {
            monthRequests.delete(key)
        }
    })()

    monthRequests.set(key, request)

    return request
}

/*
 * Mengambil schedule mendatang dari:
 *
 * - bulan sekarang;
 * - bulan berikutnya;
 * - dua bulan berikutnya.
 */
export const getUpcomingSchedules = async ({ type = '', forceRefresh = false } = {}) => {
    const collected = []
    let lastError = null

    for (let offset = 0; offset <= MONTH_LOOKAHEAD; offset++) {
        const { year, month } = getMonthByOffset(offset)

        try {
            const items = await getScheduleMonth(year, month, forceRefresh)
            collected.push(...items)
        } catch (error) {
            lastError = error
        }
    }

    if (!collected.length && lastError) throw lastError

    const expectedType = String(type || '').trim().toUpperCase()
    const unique = new Map()

    for (const item of collected) {
        const key = item.scheduleId
            ? String(item.scheduleId)
            : [item.link, item.date, item.startTime].join('|')

        unique.set(key, item)
    }

    return [...unique.values()]
        .filter(item => !isPastSchedule(item))
        .filter(item => !expectedType || item.type === expectedType)
        .sort((a, b) => getScheduleStartTimestamp(a) - getScheduleStartTimestamp(b))
}

/*
 * Nomor internal tidak dibatasi 10.
 *
 * .schedule hanya menampilkan 10,
 * tetapi .schedule 11 tetap bisa dibuka.
 */
export const getScheduleByIndex = async (index, type = '') => {
    index = Number(index)

    if (!Number.isInteger(index) || index < 1) {
        throw new Error('Nomor schedule tidak valid.')
    }

    const schedules = await getUpcomingSchedules({ type })
    let selected = schedules[index - 1]

    if (!selected) {
        throw new Error(`Schedule nomor ${index} tidak tersedia.`)
    }

    if (selected.type === 'SHOW' && (!selected.link || !selected.referenceCode)) {
        try {
            const refreshed = await getUpcomingSchedules({ type, forceRefresh: true })
            const richer = refreshed.find(item =>
                item.date === selected.date &&
                item.startTime.slice(0, 5) === selected.startTime.slice(0, 5) &&
                item.title.toLowerCase() === selected.title.toLowerCase()
            )

            if (richer) selected = { ...selected, ...richer }
        } catch {}
    }

    return selected
}

/*
 * Detail untuk EVENT, EXCLUSIVE,
 * dan jenis schedule selain SHOW.
 */
export const getScheduleDetail = async (schedule, forceRefresh = false) => {
    await loadCache()

    const fallback = typeof schedule === 'object' ? schedule : null
    const link = String(fallback?.link || schedule || '').trim()

    if (!link) {
        if (fallback) return fallback
        throw new Error('Link detail schedule tidak tersedia.')
    }

    const cached = scheduleCache.details[link]
    const permanent = cached?.data && isPastSchedule(cached.data)

    if (
        !forceRefresh &&
        cached?.data &&
        (permanent || Date.now() - Number(cached.updatedAt || 0) < CACHE_TIME)
    ) {
        return { ...fallback, ...cached.data }
    }

    if (detailRequests.has(link)) {
        const detail = await detailRequests.get(link)
        return { ...fallback, ...detail }
    }

    const request = (async () => {
        try {
            const data = await requestJkt48Api(`/schedules/${encodeURIComponent(link)}`, { lang: 'id' })
            const detail = normalizeSchedule(data || {})

            scheduleCache.details[link] = { updatedAt: Date.now(), data: detail }
            await saveCache()

            return detail
        } catch (error) {
            if (cached?.data) return cached.data

            /*
             * Data daftar schedule tetap bisa
             * digunakan bila endpoint detail gagal.
             */
            if (fallback) return fallback

            throw error
        } finally {
            detailRequests.delete(link)
        }
    })()

    detailRequests.set(link, request)

    const detail = await request

    return { ...fallback, ...detail }
}

const capitalize = text => {
    const value = String(text || '')
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value
}

export const formatScheduleDate = (date, withWeekday = true) => {
    const timestamp = parseJakartaTimestamp(date, '00:00:00')

    if (!Number.isFinite(timestamp)) {
        return String(date || '-')
    }

    const formatted = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        ...(withWeekday ? { weekday: 'long' } : {}),
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date(timestamp))

    return capitalize(formatted)
}

export const formatScheduleTime = time => {
    const match = String(time || '').match(/^(\d{2}:\d{2})/)
    return match?.[1] || '-'
}

export const formatMemberType = memberType => {
    const type = String(memberType || '').trim().toUpperCase()

    if (!type) return ''

    if (type === 'DREAM' || type === 'LOVE' || type === 'PASSION') {
        return `Team ${capitalize(type.toLowerCase())}`
    }

    if (type === 'TRAINEE') return 'Trainee'

    return type
}

export const stripHtml = html => {
    return String(html || '')
        .replace(/<br\s*\/?\s*>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<li[^>]*>/gi, '• ')
        .replace(/<\/li>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n[ \t]+/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]{2,}/g, ' ')
        .trim()
}

export const formatScheduleList = (schedules, prefix = '.', type = '') => {
    const filter = String(type || '').trim().toLowerCase()

    let text = `乂  *J K T 4 8 - S C H E D U L E*\n\n`

    for (let index = 0; index < schedules.length; index++) {
        const item = schedules[index]
        const memberType = formatMemberType(item.memberType)

        text += `${index + 1}. *[${item.type}]* ${item.title}\n`

        if (memberType) text += `   ${memberType}\n`

        text +=
            `   ${formatScheduleDate(item.date, false)} • ` +
            `${formatScheduleTime(item.startTime)}–${formatScheduleTime(item.endTime)} WIB`

        if (index < schedules.length - 1) text += '\n\n'
    }

    const detailCommand = filter ? `${prefix}schedule ${filter} 1` : `${prefix}schedule 1`

    text +=
        `\n\n> Detail : *${detailCommand}*` +
        `\n> Filter : *${prefix}schedule show/event/exclusive*`

    return text
}

export const formatScheduleDetail = schedule => {
    const memberType = formatMemberType(schedule.memberType)
    const body = stripHtml(schedule.contentBody || schedule.shortDescription)

    let text =
        `乂  *J K T 4 8 - S C H E D U L E*\n\n` +
        `*${schedule.title}*\n` +
        `[${schedule.type}]`

    if (memberType) text += ` • ${memberType}`

    text +=
        `\n\n📅 ${formatScheduleDate(schedule.date)}` +
        `\n🕒 ${formatScheduleTime(schedule.startTime)}–${formatScheduleTime(schedule.endTime)} WIB`

    if (schedule.referenceCode) text += `\n🔖 ${schedule.referenceCode}`
    if (body) text += `\n\n${body}`

    if (schedule.type === 'SHOW') {
        const members = Array.isArray(schedule.members) ? schedule.members : []
        text += '\n\n*Anggota yang Tampil*'

        if (members.length) {
            text += '\n\n' + members
                .map((member, index) => `${index + 1}. ${member.name || member}`)
                .join('\n')
        } else {
            text += '\nBelum tersedia.'
        }
    }

    return text
}

export const splitMessage = (text, maxLength = 3500) => {
    if (text.length <= maxLength) return [text]

    const paragraphs = text.split('\n\n')
    const messages = []
    let current = ''

    for (const paragraph of paragraphs) {
        const next = current ? `${current}\n\n${paragraph}` : paragraph

        if (next.length <= maxLength) {
            current = next
            continue
        }

        if (current) messages.push(current)

        if (paragraph.length <= maxLength) {
            current = paragraph
            continue
        }

        for (let position = 0; position < paragraph.length; position += maxLength) {
            messages.push(paragraph.slice(position, position + maxLength))
        }

        current = ''
    }

    if (current) messages.push(current)

    return messages
}

export const getTodaySchedules = async (forceRefresh = false) => {
    const schedules = await getUpcomingSchedules({ forceRefresh })
    const now = getJakartaParts()
    const today = `${now.year}-${String(now.month).padStart(2, '0')}-${String(now.day).padStart(2, '0')}`
    return schedules.filter(s => s.date === today)
}

export const getMonthSchedule = getScheduleMonth
export const fetchMonthSchedule = getScheduleMonth
export const fetchScheduleDetail = getScheduleDetail
export const getLookaheadSchedules = getUpcomingSchedules

export const SCHEDULE_LIST_LIMIT = LIST_LIMIT