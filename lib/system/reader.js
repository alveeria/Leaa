import axios from 'axios'

const READER_URL = 'https://r.jina.ai/'

/*
 * Mendukung satu key lama (JINA_API_KEY) dan beberapa key
 * baru (JINA_API_KEYS, dipisahkan koma/spasi/titik koma).
 */
const getApiKeys = () => [...new Set(
    [process.env.JINA_API_KEYS, process.env.JINA_API_KEY]
        .flatMap(value => String(value || '').split(/[,;\s]+/))
        .map(value => value.trim())
        .filter(value => value.startsWith('jina_'))
)]

const requestReader = async (
    url,
    apiKey = '',
    options = {}
) => {
    const {
        timeout = 30000,
        format = 'markdown'
    } = options

    const headers = {
        Accept: 'text/plain',
        'X-Return-Format': format
    }

    if (apiKey) headers.Authorization = `Bearer ${apiKey}`

    const { data } = await axios.get(`${READER_URL}${url}`, {
        timeout,
        headers
    })

    if (data === null || data === undefined || data === '') {
        throw new Error('Website tidak memberikan respons.')
    }

    return String(data)
}

export const readWeb = async (
    url,
    options = {}
) => {
    if (!url) {
        throw new Error(
            'URL website tidak tersedia.'
        )
    }

    try {
        const parsedUrl = new URL(url)

        if (
            parsedUrl.protocol !== 'http:' &&
            parsedUrl.protocol !== 'https:'
        ) {
            throw new Error()
        }
    } catch {
        throw new Error(
            'URL website tidak valid.'
        )
    }

    const { preferKey = false } = options
    const keys = getApiKeys()
    const attempts = preferKey ? [...keys, ''] : ['', ...keys]

    let lastError = null

    for (const apiKey of attempts) {
        try {
            return await requestReader(url, apiKey, options)
        } catch (error) {
            lastError = error

            const status = error.response?.status

            /*
             * Error permanen dari jalur anonim tidak perlu mencoba key.
             * Error auth/limit pada suatu key akan lanjut ke key berikutnya.
             */
            if (
                !apiKey &&
                status &&
                status >= 400 &&
                status < 500 &&
                ![401, 402, 403, 408, 425, 429].includes(status)
            ) {
                break
            }
        }
    }

    const status =
        lastError?.response?.status

    const code =
        lastError?.response?.data?.detail?.code

    if (
        status === 402 ||
        code === 'AUTHZ_INSUFFICIENT_BALANCE'
    ) {
        throw new Error(
            'Saldo token Jina sudah habis.'
        )
    }

    /*
     * Jalur gratis gagal dan API key ditolak.
     *
     * Tanpa pesan ini kegagalan key hanya terlihat
     * sebagai error umum "gagal membaca halaman".
     */
    if (
        status === 401 ||
        /AuthenticationFailedError/i.test(
            String(lastError?.response?.data || '')
        )
    ) {
        throw new Error(
            'Semua API key Jina ditolak. Perbarui JINA_API_KEYS di .env.'
        )
    }

    throw lastError || new Error(
        'Gagal membaca halaman website.'
    )
}