import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readWeb } from '../system/reader.js'

const NEWS_URL = 'https://jkt48.com/news'
const PAGE_SIZE = 10
const MAX_PAGE = 500

const formatApiNewsDate = value => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    return new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta', day: '2-digit', month: 'long', year: 'numeric'
    }).format(date)
}

/*
 * Halaman pertama diperiksa ulang setiap 15 menit.
 */
const FIRST_PAGE_CACHE_TIME = 15 * 60 * 1000

/*
 * Dari:
 * project/lib/jkt48/news.js
 *
 * Menuju:
 * project/.cache/jkt48
 */
const ROOT_DIR = fileURLToPath(new URL('../../', import.meta.url))
const CACHE_DIR = path.join(ROOT_DIR, '.cache', 'jkt48')
const PAGE_CACHE_FILE = path.join(CACHE_DIR, 'news-pages.json')
const ARTICLE_CACHE_FILE = path.join(CACHE_DIR, 'news-articles.json')

const MONTHS =
    'Januari|January|Februari|February|Maret|March|April|Mei|May|' +
    'Juni|June|Juli|July|Agustus|August|September|Oktober|October|' +
    'November|Desember|December'

const DATE_SOURCE = `\\d{1,2}\\s+(?:${MONTHS})\\s+\\d{4}`
const DATE_REGEX = new RegExp(`\\b${DATE_SOURCE}\\b`, 'i')
const RELEASE_REGEX = new RegExp(`^Tanggal\\s+Rilis\\s+(${DATE_SOURCE})$`, 'i')

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

const cleanHtml = html => {
    return String(html || '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<\/h[1-6]>/gi, '\n\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
}

let cachesLoaded = false
let pageCache = { totalPages: 0, pages: {} }
let articleCache = { items: {} }

/*
 * Mencegah request URL yang sama berjalan bersamaan.
 */
const pageRequests = new Map()
const articleRequests = new Map()

const ensureCacheDirectory = async () => {
    await mkdir(CACHE_DIR, { recursive: true })
}

const readJson = async (file, fallback) => {
    try {
        const content = await readFile(file, 'utf8')
        return JSON.parse(content)
    } catch {
        return fallback
    }
}

/*
 * Menulis melalui file sementara agar file cache
 * tidak mudah rusak jika bot berhenti mendadak.
 */
const writeJson = async (file, data) => {
    await ensureCacheDirectory()

    const temporaryFile = `${file}.${process.pid}.${Date.now()}.tmp`

    await writeFile(temporaryFile, JSON.stringify(data, null, 2), 'utf8')
    await rename(temporaryFile, file)
}

const loadCaches = async () => {
    if (cachesLoaded) return

    await ensureCacheDirectory()

    const [storedPages, storedArticles] = await Promise.all([
        readJson(PAGE_CACHE_FILE, { totalPages: 0, pages: {} }),
        readJson(ARTICLE_CACHE_FILE, { items: {} })
    ])

    if (storedPages && storedPages.pages && typeof storedPages.pages === 'object') {
        pageCache = {
            totalPages: Number(storedPages.totalPages) || 0,
            pages: storedPages.pages
        }
    }

    if (storedArticles && storedArticles.items && typeof storedArticles.items === 'object') {
        articleCache = { items: storedArticles.items }
    }

    cachesLoaded = true
}

const cleanInline = text => {
    return String(text || '')
        .replace(/!\[[^\]]*]\([^)]+\)/g, '')
        .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/[*_`#]/g, '')
        .replace(/\u00a0/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

const cleanLine = line => {
    return String(line || '')
        .replace(/!\[[^\]]*]\([^)]+\)/g, '')
        .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/^#{1,6}\s*/, '')
        .replace(/^\s*[-*+]\s+/, '• ')
        .replace(/\*\*/g, '')
        .replace(/__/g, '')
        .replace(/`/g, '')
        .replace(/\u00a0/g, ' ')
        .trim()
}

const normalizeUrl = url => {
    try {
        const parsedUrl = new URL(url)
        parsedUrl.hash = ''
        parsedUrl.search = ''
        return parsedUrl.href.replace(/\/+$/, '')
    } catch {
        return String(url || '').replace(/[?#].*$/, '').replace(/\/+$/, '')
    }
}

const extractTitle = text => {
    const cleaned = cleanInline(text)
    const dateMatch = cleaned.match(DATE_REGEX)

    if (!dateMatch) return ''

    const datePosition = cleaned.indexOf(dateMatch[0])

    return cleaned
        .slice(datePosition + dateMatch[0].length)
        .replace(/Lihat Selengkapnya/gi, '')
        .replace(/Read More/gi, '')
        .replace(/^\s*[-–—:|]\s*/, '')
        .trim()
}

const extractTotalPages = markdown => {
    const matches = [...String(markdown).matchAll(/\b\d+\s*\/\s*(\d+)\b/g)]

    const totals = matches
        .map(match => Number(match[1]))
        .filter(total => Number.isInteger(total) && total > 0 && total <= MAX_PAGE)

    return totals.length ? Math.max(...totals) : 0
}

const parseNewsPage = markdown => {
    const items = []
    const foundUrls = new Set()

    /*
     * Hanya mengambil link artikel berita JKT48.
     * Logo, menu, login, dan navigasi tidak ikut.
     */
    const linkRegex =
        /\[([^\]\n]+)]\((https?:\/\/(?:www\.)?jkt48\.com\/news\/[^)\s?#]+)(?:[?#][^)]*)?\)/gi

    let match

    while ((match = linkRegex.exec(markdown)) !== null) {
        const label = match[1]
        const title = extractTitle(label)
        const url = normalizeUrl(match[2])

        if (
            !title ||
            !DATE_REGEX.test(cleanInline(label)) ||
            url.endsWith('/news/list') ||
            url.endsWith('/news/index') ||
            foundUrls.has(url)
        ) {
            continue
        }

        foundUrls.add(url)
        const cleanedLabel = cleanInline(label)
        const dateStr = cleanedLabel.match(DATE_REGEX)?.[0] || ''
        const category = cleanedLabel.slice(0, cleanedLabel.indexOf(dateStr)).trim()
        items.push({ title, url, dateStr, category })

        if (items.length >= PAGE_SIZE) break
    }

    return { items, totalPages: extractTotalPages(markdown) }
}

const buildPageUrl = page => {
    if (page === 1) return NEWS_URL

    const url = new URL(NEWS_URL)
    url.searchParams.set('page', String(page))

    return url.href
}

const hasListChanged = (oldItems = [], newItems = []) => {
    if (oldItems.length !== newItems.length) return true

    return newItems.some((item, index) => item.url !== oldItems[index]?.url)
}

const savePageCache = async () => await writeJson(PAGE_CACHE_FILE, pageCache)
const saveArticleCache = async () => await writeJson(ARTICLE_CACHE_FILE, articleCache)

/*
 * Mengambil daftar berita dari satu halaman.
 *
 * Halaman pertama:
 * - diperbarui setiap 15 menit.
 *
 * Halaman kedua dan seterusnya:
 * - disimpan sampai halaman pertama mendeteksi berita baru.
 */
export const getNewsPage = async (page = 1, forceRefresh = false) => {
    await loadCaches()

    page = Number(page)

    if (!Number.isInteger(page) || page < 1 || page > MAX_PAGE) {
        throw new Error('Nomor halaman berita tidak valid.')
    }

    if (pageCache.totalPages > 0 && page > pageCache.totalPages) {
        throw new Error(`Halaman berita hanya tersedia sampai halaman ${pageCache.totalPages}.`)
    }

    const cacheKey = String(page)
    const cached = pageCache.pages[cacheKey]

    /*
     * Cache halaman pertama berlaku selama 15 menit.
     */
    if (
        page === 1 &&
        !forceRefresh &&
        cached?.items?.length &&
        Date.now() - Number(cached.updatedAt || 0) < FIRST_PAGE_CACHE_TIME
    ) {
        return cached.items
    }

    /*
     * Halaman kedua dan seterusnya disimpan sampai
     * daftar halaman pertama berubah.
     */
    if (page > 1 && !forceRefresh && cached?.items?.length) {
        return cached.items
    }

    if (pageRequests.has(page)) return pageRequests.get(page)

    const request = (async () => {
        try {
            const parseDirectItems = json => {
                const source = Array.isArray(json?.data)
                    ? json.data
                    : Array.isArray(json?.news) ? json.news : []

                const totalRows = Number(source[0]?.total_row_count) || 0
                const calculatedPages = totalRows > 0 ? Math.ceil(totalRows / PAGE_SIZE) : 0

                return {
                    totalPages: Number(json?.total_page || json?.totalPages) || calculatedPages || 0,
                    items: source.slice(0, PAGE_SIZE).map(item => ({
                        id: String(item.id || item.news_id || ''),
                        title: String(item.title || '').trim(),
                        url: String(
                            item.url ||
                            (item.link ? `${NEWS_URL}/${item.link}` : '') ||
                            (item.slug ? `${NEWS_URL}/${item.slug}` : '')
                        ).trim(),
                        link: String(item.link || item.slug || item.id || item.news_id || '').trim(),
                        dateStr: formatApiNewsDate(item.date || item.release_date || item.valid_date_from),
                        category: String(item.category || item.type || '').trim()
                    })).filter(item => item.title && (item.url || item.link))
                }
            }

            let parsed

            // 0. Sumber utama: api.leaa.web.id
            if (page === 1) {
                try {
                    const res = await fetch('https://api.leaa.web.id/jkt48/news', {
                        headers: { Accept: 'application/json' },
                        signal: AbortSignal.timeout(10000)
                    })
                    if (res.ok) {
                        const json = await res.json()
                        const items = []
                        for (const [k, v] of Object.entries(json)) {
                            if (/^\d+$/.test(k) && v && typeof v === 'object') {
                                items.push({
                                    id: String(v.id || ''),
                                    title: String(v.title || '').trim(),
                                    url: String(v.url || (v.link ? `${NEWS_URL}/${v.link}` : '')).trim(),
                                    link: String(v.link || v.id || '').trim(),
                                    dateStr: formatApiNewsDate(v.date),
                                    category: String(v.category || '').trim()
                                })
                            }
                        }
                        if (items.length > 0) {
                            parsed = {
                                totalPages: 10,
                                items: items.slice(0, PAGE_SIZE)
                            }
                        }
                    }
                } catch {}
            }

            if (!parsed) {
                // 1. Sumber resmi JKT48 tanpa proxy.
                try {
                    const officialUrl = new URL('https://jkt48.com/api/v1/news')
                    officialUrl.searchParams.set('page', String(page))
                    officialUrl.searchParams.set('lang', 'id')

                    const response = await fetch(officialUrl, {
                        headers: { Accept: 'application/json' },
                        signal: AbortSignal.timeout(10000)
                    })
                    if (!response.ok) throw new Error(`HTTP ${response.status}`)
                    parsed = parseDirectItems(await response.json())
                    if (!parsed.items.length) throw new Error('API resmi JKT48 kosong.')
                } catch {
                    // 2. Jina Reader atas API resmi JKT48.
                    try {
                        const raw = await readWeb(`https://jkt48.com/api/v1/news?page=${page}&lang=id`)
                        const json = parseReaderJson(raw)
                        if (json?.status && Array.isArray(json?.data)) {
                            parsed = parseDirectItems(json)
                        }
                        if (!parsed?.items?.length) throw new Error('Jina Reader API resmi kosong.')
                    } catch {
                        // 3. Jina Reader atas halaman HTML resmi JKT48.
                        const markdown = await readWeb(buildPageUrl(page))
                        parsed = parseNewsPage(markdown)
                        if (!parsed.items.length) throw new Error('Jina Reader tidak menemukan berita.')
                    }
                }
            }

            if (!parsed.items.length) {
                throw new Error(`Berita pada halaman ${page} tidak ditemukan.`)
            }

            if (page === 1) {
                const oldFirstPage = pageCache.pages['1']?.items || []
                const changed = oldFirstPage.length > 0 && hasListChanged(oldFirstPage, parsed.items)

                if (changed) pageCache.pages = {}
                if (parsed.totalPages > 0) pageCache.totalPages = parsed.totalPages
            } else if (parsed.totalPages > 0) {
                pageCache.totalPages = parsed.totalPages
            }

            pageCache.pages[cacheKey] = { updatedAt: Date.now(), items: parsed.items }
            await savePageCache()

            return parsed.items
        } catch (error) {
            if (cached?.items?.length) return cached.items
            throw error
        } finally {
            pageRequests.delete(page)
        }
    })()

    pageRequests.set(page, request)

    return request
}

/*
 * Command .news hanya menampilkan halaman pertama.
 */
export const getLatestNews = async (limit = PAGE_SIZE, forceRefresh = false) => {
    const news = await getNewsPage(1, forceRefresh)
    return news.slice(0, limit)
}

const formatParagraphs = lines => {
    const paragraphs = []
    let current = []

    const pushCurrent = () => {
        if (!current.length) return

        const paragraph = current.join(' ').replace(/\s+/g, ' ').trim()

        if (paragraph) paragraphs.push(paragraph)
        current = []
    }

    for (const rawLine of lines) {
        const line = cleanLine(rawLine)

        if (!line) {
            pushCurrent()
            continue
        }

        if (line.startsWith('• ') || /^\d+\.\s+/.test(line)) {
            pushCurrent()
            paragraphs.push(line)
            continue
        }

        current.push(line)
    }

    pushCurrent()

    return paragraphs.join('\n\n').trim()
}

const parseArticle = (markdown, fallbackDate = '') => {
    const rawLines = String(markdown).replace(/\r/g, '').split('\n')
    const lines = rawLines.map(cleanLine)

    let releaseIndex = lines.findIndex(line => RELEASE_REGEX.test(line))
    let date = ''

    if (releaseIndex !== -1) {
        const match = lines[releaseIndex].match(RELEASE_REGEX)
        date = match?.[1] || ''
    }

    if (releaseIndex === -1) {
        const searchLimit = Math.min(lines.length, 50)

        for (let index = 0; index < searchLimit; index++) {
            const match = lines[index].match(DATE_REGEX)

            if (match) {
                date = match[0]
                releaseIndex = index
                break
            }
        }
    }

    if (releaseIndex === -1 && fallbackDate) {
        date = fallbackDate
        const markdownIndex = lines.findIndex(line => /^Markdown Content:$/i.test(line))
        releaseIndex = markdownIndex >= 0 ? markdownIndex : -1
    }

    const contentLines = []

    for (let index = releaseIndex + 1; index < rawLines.length; index++) {
        const rawLine = rawLines[index]
        const line = cleanLine(rawLine)

        if (
            /^Share$/i.test(line) ||
            /^Berita Lainnya$/i.test(line) ||
            /^Lihat Semua$/i.test(line) ||
            /^Related News$/i.test(line) ||
            line.includes('Copyright ©') ||
            line.includes('PT. Indonesia Musik Nusantara')
        ) {
            break
        }

        if (
            /^Title:/i.test(line) ||
            /^URL Source:/i.test(line) ||
            /^Published Time:/i.test(line) ||
            /^Markdown Content:/i.test(line) ||
            /^\[Image\s+\d+]/i.test(line) ||
            /^\d+\.\s*(Home|News)$/i.test(line) ||
            /^Home$/i.test(line) ||
            /^News$/i.test(line) ||
            /^Login$/i.test(line) ||
            /^IDN$/i.test(line)
        ) {
            continue
        }

        contentLines.push(rawLine)
    }

    const body = formatParagraphs(contentLines)

    if (!body) throw new Error('Isi berita tidak berhasil ditemukan.')

    return { date, content: date ? `${date}\n\n${body}` : body }
}

/*
 * Mengambil artikel berdasarkan nomor global.
 *
 * 1–10   = halaman 1
 * 11–20  = halaman 2
 * 21–30  = halaman 3
 * dan seterusnya.
 */
export const getNewsByIndex = async index => {
    await loadCaches()

    index = Number(index)

    if (!Number.isInteger(index) || index < 1) {
        throw new Error('Nomor berita tidak valid.')
    }

    /*
     * Periksa halaman pertama terlebih dahulu.
     * Ini diperlukan untuk mendeteksi perubahan urutan.
     */
    const firstPage = await getNewsPage(1)
    const page = Math.ceil(index / PAGE_SIZE)

    if (page > MAX_PAGE) {
        throw new Error('Nomor berita terlalu besar.')
    }

    if (pageCache.totalPages > 0 && page > pageCache.totalPages) {
        const maximum = pageCache.totalPages * PAGE_SIZE
        throw new Error(`Nomor berita hanya tersedia sampai sekitar ${maximum}.`)
    }

    const position = (index - 1) % PAGE_SIZE
    const news = page === 1 ? firstPage : await getNewsPage(page)
    const selected = news[position]

    if (!selected) {
        throw new Error(`Berita nomor ${index} tidak tersedia.`)
    }

    const articleKey = normalizeUrl(selected.url)
    const cached = articleCache.items[articleKey]

    /*
     * Cache artikel bersifat permanen.
     * Nomor tidak disimpan karena nomor dapat berubah.
     */
    if (cached?.data) {
        return { ...cached.data, number: index }
    }

    /*
     * Jika artikel yang sama sedang diambil pengguna lain,
     * tunggu request tersebut.
     */
    if (articleRequests.has(articleKey)) {
        const article = await articleRequests.get(articleKey)
        return { ...article, number: index }
    }

    const request = (async () => {
        try {
            let article = null
            if (selected.link) {
                try {
                    const raw = await readWeb(`https://jkt48.com/api/v1/news/${encodeURIComponent(selected.link)}`)
                    const json = parseReaderJson(raw)
                    const res = json?.data?.result
                    if (res && res.content_body) {
                        article = {
                            title: res.title || selected.title,
                            url: selected.url,
                            date: formatApiNewsDate(res.valid_date_from) || selected.dateStr,
                            content: cleanHtml(res.content_body)
                        }
                    }
                } catch {}
            }

            if (!article || !article.content) {
                const markdown = await readWeb(selected.url)
                const parsed = parseArticle(markdown, selected.dateStr)
                article = {
                    title: selected.title,
                    url: selected.url,
                    date: parsed.date,
                    content: parsed.content
                }
            }

            /*
             * Nomor tidak dimasukkan ke cache.
             * Cache menggunakan URL artikel.
             */
            const result = {
                title: article.title || selected.title,
                url: selected.url,
                date: article.date,
                content: article.content
            }

            articleCache.items[articleKey] = { savedAt: Date.now(), data: result }
            await saveArticleCache()

            return result
        } finally {
            articleRequests.delete(articleKey)
        }
    })()

    articleRequests.set(articleKey, request)

    const article = await request

    return { ...article, number: index }
}

export const getNewsDetail = async (target, forceRefresh = false) => {
    if (typeof target === 'number' || /^\d+$/.test(target)) {
        return getNewsByIndex(Number(target))
    }
    const link = String(target || '').trim()
    const articleKey = normalizeUrl(link.startsWith('http') ? link : `${NEWS_URL}/${link}`)
    const cached = articleCache.items[articleKey]
    if (!forceRefresh && cached?.data) {
        return cached.data
    }
    try {
        const raw = await readWeb(`https://jkt48.com/api/v1/news/${encodeURIComponent(link)}`)
        const json = parseReaderJson(raw)
        const res = json?.data?.result
        if (res && res.title) {
            const data = {
                title: res.title,
                url: `${NEWS_URL}/${res.link || link}`,
                date: formatApiNewsDate(res.valid_date_from),
                content: cleanHtml(res.content_body || '')
            }
            articleCache.items[articleKey] = { savedAt: Date.now(), data }
            await saveArticleCache()
            return data
        }
    } catch {}
    const markdown = await readWeb(link.startsWith('http') ? link : `${NEWS_URL}/${link}`)
    const parsed = parseArticle(markdown, '')
    const result = {
        title: parsed.title || link,
        url: link.startsWith('http') ? link : `${NEWS_URL}/${link}`,
        date: parsed.date,
        content: parsed.content
    }
    articleCache.items[articleKey] = { savedAt: Date.now(), data: result }
    await saveArticleCache()
    return result
}

export const formatNewsList = (news, prefix = '.') => {
    let text = `乂  *J K T 4 8 - N E W S*\n\n`
    text += `> Example : *${prefix}news 1*\n\n`

    /*
     * Daftar hanya menampilkan nomor 1–10.
     */
    for (let index = 0; index < news.length; index++) {
        text += `${index + 1}. ${news[index].title}`
        if (index < news.length - 1) text += '\n\n'
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
