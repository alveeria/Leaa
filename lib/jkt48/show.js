import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'

import {
    JKT48_SCHEDULE_CACHE_DIR,
    formatMemberType,
    formatScheduleDate,
    formatScheduleTime,
    getUpcomingSchedules,
    parseJakartaTimestamp,
    requestJkt48Api
} from './schedule.js'

export const SHOW_ALIASES = {
    dream: ['dream bakudan'],
    bakudan: ['dream bakudan'],
    love: ['itadaki love'],
    itadaki: ['itadaki love'],
    passion: ['passion 200'],
    pajama: ['pajama drive'],
    pd: ['pajama drive'],
    aitakatta: ['aitakatta'],
    percin: ['pertaruhan cinta'],
    pertaruhan: ['pertaruhan cinta'],
    cmr: ['cara meminum ramune'],
    ramune: ['cara meminum ramune'],
    menggandeng: ['sambil menggandeng erat tanganku'],
    sambil: ['sambil menggandeng erat tanganku']
}

export const normalizeShowText = text => {
    return String(text || '')
        .normalize('NFKD')
        .replace(/[♥♡]/g, ' love ')
        .replace(/%/g, ' percent ')
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
}

export const resolveShowTerms = query => {
    const normalized = normalizeShowText(query)
    if (!normalized) return []
    const aliases = SHOW_ALIASES[normalized]
    return aliases?.length ? aliases.map(normalizeShowText) : [normalized]
}

export const SHOW_FILTER_EXAMPLES = [
    'dream',
    'love',
    'passion',
    'pajama',
    'aitakatta',
    'percin',
    'cmr',
    'menggandeng'
]

const CACHE_TIME = 15 * 60 * 1000
const CACHE_FILE = path.join(JKT48_SCHEDULE_CACHE_DIR, 'show-details.json')

let cacheLoaded = false
let cache = { items: {} }
let writeQueue = Promise.resolve()

const requests = new Map()

const ensureCacheDir = () => mkdir(JKT48_SCHEDULE_CACHE_DIR, { recursive: true })

const readJson = async (file, fallback) => {
    try {
        return JSON.parse(await readFile(file, 'utf8'))
    } catch {
        return fallback
    }
}

const writeJson = async (file, data) => {
    await ensureCacheDir()

    const temporary = `${file}.${process.pid}.${Date.now()}.tmp`
    await writeFile(temporary, JSON.stringify(data, null, 2), 'utf8')
    await rename(temporary, file)
}

const loadCache = async () => {
    if (cacheLoaded) return

    const stored = await readJson(CACHE_FILE, { items: {} })

    cache = {
        items: stored?.items && typeof stored.items === 'object'
            ? stored.items
            : {}
    }

    cacheLoaded = true
}

const saveCache = async () => {
    writeQueue = writeQueue
        .catch(() => {})
        .then(() => writeJson(CACHE_FILE, cache))

    return writeQueue
}

const normalizeSalesPeriod = period => ({
    label: String(period?.label || '').trim(),
    startDate: String(period?.start_date || ''),
    endDate: String(period?.end_date || ''),
    salesMethod: String(period?.sales_method || '').trim(),

    pricing: Array.isArray(period?.pricing)
        ? period.pricing.map(item => ({
            label: String(item?.label || '').trim(),
            price: Number(item?.price) || 0,
            quota: Number(item?.quota) || 0,
            isOfcOnly: Boolean(item?.is_ofc_only)
        }))
        : []
})

const normalizeShowDetail = data => ({
    code: String(data?.code || '').toUpperCase(),
    title: String(data?.title || '').trim(),
    date: String(data?.date || ''),
    startTime: String(data?.start_time || ''),
    endTime: String(data?.end_time || ''),
    receptionStartTime: String(data?.reception_start_time || ''),
    receptionEndTime: String(data?.reception_end_time || ''),
    memberType: String(data?.jkt48_member_type || '').toUpperCase(),
    defaultPrice: Number(data?.default_price) || 0,
    totalQuota: Number(data?.total_quota) || 0,
    maxPurchase: Number(data?.max_purchase) || 0,
    setList: String(data?.set_list || ''),
    shortDescription: String(data?.short_description || ''),
    contentBody: String(data?.content_body || ''),
    birthdayMember: data?.birthday_member || null,

    birthdayMemberNames: Array.isArray(data?.birthday_member_name)
        ? data.birthday_member_name.map(String).filter(Boolean)
        : [],

    members: Array.isArray(data?.jkt48_member)
        ? data.jkt48_member
            .map(member => ({
                name: String(member?.name || '').trim(),
                type: String(member?.type || '').toUpperCase(),
                memberId: Number(member?.member_id) || 0
            }))
            .filter(member => member.name)
        : [],

    salesPeriods: Array.isArray(data?.sales_period)
        ? data.sales_period.map(normalizeSalesPeriod)
        : []
})

const isPastShow = show => {
    const timestamp = parseJakartaTimestamp(
        show.date,
        show.endTime || show.startTime
    )

    return Number.isFinite(timestamp) && timestamp < Date.now()
}

/*
 * Semua show mendatang.
 */
export const getUpcomingShows = async (forceRefresh = false) => {
    return getUpcomingSchedules({
        type: 'SHOW',
        forceRefresh
    })
}

/*
 * Mengambil semua show pada tanggal terdekat.
 *
 * Hari ini ada show     → semua show hari ini.
 * Hari ini tidak ada    → show besok.
 * Besok tidak ada       → tanggal terdekat berikutnya.
 */
export const getNearestShows = async (forceRefresh = false) => {
    const shows = await getUpcomingShows(forceRefresh)

    if (!shows.length) return []

    const nearestDate = shows[0].date
    return shows.filter(show => show.date === nearestDate)
}

/*
 * Filter hanya berdasarkan judul/setlist, bukan tim.
 */
export const filterShowsBySetlist = (shows, query = '') => {
    const terms = resolveShowTerms(query)

    if (!terms.length) return shows

    return shows.filter(show => {
        const title = normalizeShowText(show.title)
        return terms.some(term => title.includes(term))
    })
}

export const getFilteredShows = async (query = '', forceRefresh = false) => {
    const shows = await getUpcomingShows(forceRefresh)
    return filterShowsBySetlist(shows, query)
}

export const getShowScheduleByIndex = async (index, query = '') => {
    index = Number(index)

    if (!Number.isInteger(index) || index < 1) {
        throw new Error('Nomor show tidak valid.')
    }

    const shows = await getFilteredShows(query)
    const selected = shows[index - 1]

    if (!selected) {
        throw new Error(
            query
                ? `Show "${query}" nomor ${index} tidak tersedia.`
                : `Show nomor ${index} tidak tersedia.`
        )
    }

    return selected
}

/*
 * Detail disimpan berdasarkan kode, misalnya SH7C39.
 *
 * Show mendatang: cache 15 menit.
 * Show selesai: cache permanen.
 */
export const getShowDetail = async (code, forceRefresh = false) => {
    await loadCache()

    code = String(code || '').trim().toUpperCase()

    if (!/^SH[A-Z0-9]+$/.test(code)) {
        throw new Error('Kode show tidak valid.')
    }

    const cached = cache.items[code]
    const permanent = cached?.data && isPastShow(cached.data)
    const fresh = Date.now() - Number(cached?.updatedAt || 0) < CACHE_TIME

    if (!forceRefresh && cached?.data && (permanent || fresh)) {
        return cached.data
    }

    if (requests.has(code)) return requests.get(code)

    const request = (async () => {
        try {
            const data = await requestJkt48Api(
                `/theater-shows/${encodeURIComponent(code)}`,
                { lang: 'id' }
            )

            const detail = normalizeShowDetail(data || {})

            if (!detail.title) {
                throw new Error('Detail show tidak ditemukan.')
            }

            cache.items[code] = {
                updatedAt: Date.now(),
                data: detail
            }

            await saveCache()
            return detail
        } catch (error) {
            try {
                const res = await fetch('https://api.leaa.web.id/jkt48/theater', { signal: AbortSignal.timeout(10000) })
                if (res.ok) {
                    const json = await res.json()
                    const found = (json?.theater || []).find(t => String(t.id || '').toUpperCase() === code)
                    if (found) {
                        const dateStr = found.date ? found.date.slice(0, 10) : ''
                        const startTime = found.start_date ? new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(found.start_date)) : ''
                        const endTime = found.end_date ? new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(found.end_date)) : ''
                        const fallbackDetail = {
                            code: found.id,
                            title: found.title,
                            date: dateStr,
                            startTime: startTime,
                            endTime: endTime,
                            receptionStartTime: '',
                            receptionEndTime: '',
                            memberType: found.team || '',
                            defaultPrice: 200000,
                            totalQuota: 0,
                            maxPurchase: 1,
                            setList: '',
                            shortDescription: '',
                            contentBody: '',
                            birthdayMember: null,
                            birthdayMemberNames: [],
                            members: (found.members || []).map(m => ({ name: m.name, type: found.team, memberId: m.id })),
                            salesPeriods: []
                        }
                        cache.items[code] = { updatedAt: Date.now(), data: fallbackDetail }
                        await saveCache()
                        return fallbackDetail
                    }
                }
            } catch {}
            if (cached?.data) return cached.data
            throw error
        } finally {
            requests.delete(code)
        }
    })()

    requests.set(code, request)
    return request
}

const formatRupiah = amount => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(Number(amount) || 0)
}

/*
 * Tanggal sales_period dari API dianggap WIB.
 */
const formatLocalDateTime = value => {
    if (!value) return '-'

    const raw = String(value)
    const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw)
    const timestamp = Date.parse(hasZone ? raw : `${raw}+07:00`)

    if (!Number.isFinite(timestamp)) return raw

    return new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    })
        .format(new Date(timestamp))
        .replace(' pukul ', ', ')
        .replace('.', ':') + ' WIB'
}

export const formatShowList = (shows, prefix = '.', query = '') => {
    let text = '乂  *J K T 4 8 - S H O W*\n\n'

    shows.forEach((show, index) => {
        const memberType = formatMemberType(show.memberType)

        text += `${index + 1}. *${show.title}*\n`

        if (memberType) text += `   ${memberType}\n`

        text +=
            `   ${formatScheduleDate(show.date, false)} • ` +
            `${formatScheduleTime(show.startTime)}–` +
            `${formatScheduleTime(show.endTime)} WIB`

        if (index < shows.length - 1) text += '\n\n'
    })

    const filter = String(query || '').trim()
    const detail = filter
        ? `${prefix}show ${filter} 1`
        : `${prefix}show 1`

    return text +
        `\n\n> Detail : *${detail}*` +
        `\n> Terdekat : *${prefix}nextshow*` +
        `\n> Setlist : *${prefix}show dream/pajama/percin/cmr*`
}

export const formatShowDetail = show => {
    const memberType = formatMemberType(show.memberType)

    let text =
        `乂  *J K T 4 8 - S H O W*\n\n` +
        `*${show.title}*`

    if (memberType) text += `\n${memberType}`

    text +=
        `\n\n📅 ${formatScheduleDate(show.date)}` +
        `\n🕒 ${formatScheduleTime(show.startTime)}–` +
        `${formatScheduleTime(show.endTime)} WIB`

    if (show.receptionStartTime) {
        text += `\n🎫 Penukaran tiket: ${formatScheduleTime(show.receptionStartTime)} WIB`
    }

    if (show.defaultPrice > 0) {
        text += `\n💰 Harga: ${formatRupiah(show.defaultPrice)}`
    }

    if (show.totalQuota > 0) {
        text += `\n👥 Kuota: ${show.totalQuota}`
    }

    if (show.maxPurchase > 0) {
        text += `\n🛒 Maksimal pembelian: ${show.maxPurchase} tiket`
    }

    if (show.code) text += `\n🔖 ${show.code}`

    if (show.salesPeriods.length) {
        text += '\n\n*Periode Pembelian*'

        for (const period of show.salesPeriods) {
            const pricing = period.pricing[0]

            text +=
                `\n\n*${period.label || 'Penjualan'}*` +
                `\n${formatLocalDateTime(period.startDate)}` +
                `\nsampai` +
                `\n${formatLocalDateTime(period.endDate)}`

            if (pricing?.price > 0) {
                text += `\nHarga: ${formatRupiah(pricing.price)}`
            }

            if (pricing?.quota > 0) {
                text += `\nKuota: ${pricing.quota}`
            }
        }
    }

    text += '\n\n*Anggota yang Tampil*'

    if (show.members.length) {
        text += '\n\n' + show.members
            .map((member, index) => `${index + 1}. ${member.name}`)
            .join('\n')
    } else {
        text += '\nBelum tersedia.'
    }

    return text
}