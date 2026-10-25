export const MEMBER_DATA_URL = 'https://raw.githubusercontent.com/alveeria/databases/master/jkt48/member.json'
export const ALL_MEMBER_DATA_URL = 'https://raw.githubusercontent.com/alveeria/databases/master/jkt48/all_members.json'

const MEMBER_CACHE_TTL = 15 * 60 * 1000
const TEAM_LABELS = {
   DREAM: 'Dream', LOVE: 'Love', PASSION: 'Passion',
   TRAINEE: 'Trainee', JKT48_VIRTUAL: 'JKT48 Virtual'
}

let memberCache = { updatedAt: 0, members: [] }

export function syncActiveMemberCache(members = []) {
   const normalized = Array.isArray(members)
      ? members.map(normalizeActiveMember).filter(member => member.name)
      : []

   memberCache = {
      updatedAt: normalized.length ? Date.now() : 0,
      members: normalized
   }
}

export async function getActiveMembers({ force = false } = {}) {
   if (
      !force &&
      memberCache.members.length &&
      Date.now() - memberCache.updatedAt < MEMBER_CACHE_TTL
   ) {
      return memberCache.members
   }

   const url = force ? `${MEMBER_DATA_URL}?t=${Date.now()}` : MEMBER_DATA_URL

   try {
      const response = await fetch(url, {
         headers: { Accept: 'application/json' },
         signal: AbortSignal.timeout(20_000)
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data = await response.json()
      const list = Array.isArray(data) ? data : data.members
      const members = (list || [])
         .map(normalizeActiveMember)
         .filter(member => member.name)

      if (!members.length) throw new Error('Data member kosong')

      memberCache = { updatedAt: Date.now(), members }
      if (global.db) {
         global.db.jkt48 = global.db.jkt48 || {}
         global.db.jkt48.lastMembers = members
      }
      return members
   } catch (error) {
      console.warn('[JKT48 Members] Gagal fetch GitHub raw primary:', error.message)
   }

   // Fallback: coba fetch all_members.json dari GitHub
   try {
      const fallbackUrl = force ? `${ALL_MEMBER_DATA_URL}?t=${Date.now()}` : ALL_MEMBER_DATA_URL
      const response = await fetch(fallbackUrl, {
         headers: { Accept: 'application/json' },
         signal: AbortSignal.timeout(20_000)
      })
      if (response.ok) {
         const data = await response.json()
         const list = Array.isArray(data) ? data : data.members
         const activeList = (list || []).filter(m => !m.graduated)
         const members = activeList.map(normalizeActiveMember).filter(m => m.name)
         if (members.length) {
            memberCache = { updatedAt: Date.now(), members }
            return members
         }
      }
   } catch (err) {
      console.warn('[JKT48 Members] Gagal fetch GitHub raw fallback:', err.message)
   }

   // Fallback: dari database memory bot
   const stored = global.db?.jkt48?.lastMembers
   if (Array.isArray(stored) && stored.length) {
      return stored.map(normalizeActiveMember).filter(member => member.name)
   }

   // Jika ada cache memori lama
   if (memberCache.members.length) {
      return memberCache.members
   }

   return []
}

export async function refreshMemberCache() {
   return await getActiveMembers({ force: true })
}

export async function getAllMembers() {
   try {
      const response = await fetch(ALL_MEMBER_DATA_URL, {
         headers: { Accept: 'application/json' },
         signal: AbortSignal.timeout(20_000)
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      return (Array.isArray(data) ? data : data.members) || []
   } catch (error) {
      console.warn('[JKT48 Members] Gagal fetch all members:', error.message)
      return []
   }
}

export function normalizeActiveMember(member) {
   const team = String(member.team || '').toUpperCase()
   const birthDateStr = String(member.birth_date || '').trim()
   const birthParts = birthDateStr ? birthDateStr.split('-').map(Number) : []

   const day = Number(member.birth_day) || (birthParts[2] || null)
   const month = Number(member.birth_month) || (birthParts[1] || null)
   const year = Number(member.birth_year) || (birthParts[0] || null)

   return {
      id: member.id || member.code || member.name,
      code: String(member.code || member.slug || ''),
      name: String(member.name || '').trim(),
      nickname: String(member.nickname || '').trim(),
      team,
      teamLabel: TEAM_LABELS[team] || team || '',
      birthDate: birthDateStr,
      birthDay: day,
      birthMonth: month,
      birthYear: year,
      day,
      month,
      year,
      birthPlace: String(member.birth_place || '').trim(),
      heightCm: Number(member.height_cm) || null,
      bloodType: String(member.blood_type || ''),
      zodiac: String(member.zodiac || ''),
      photo: String(member.photo || member.image || member.image_url || '').trim(),
      detailUrl: String(member.detail_url || '').trim(),
      instagram: String(member.instagram || '').trim(),
      twitter: String(member.twitter || '').trim(),
      tiktok: String(member.tiktok || '').trim(),
      youtube: String(member.youtube || '').trim(),
      is_graduate: false,
      graduated: false,
      jikoshoukai: String(member.jikoshoukai || member.jiko || '').trim(),
      jikoshoukaiSource: String(member.jikoshoukai_source || '').trim()
   }
}

const GRADUATED_ALIASES = {
   zee: 'azizi_asadel',
   chika: 'yessica_tamara',
   ashel: 'adzkia_nur_aulia',
   melody: 'melody_nurramdhani_laksani',
   nabilah: 'nabilah_ratna_ayu_azalia',
   veranda: 'jessica_veranda',
   ve: 'jessica_veranda',
   haruka: 'haruka_nakagawa',
   shania: 'shania_junianatha',
   kinal: 'devi_kinal_putri',
   yupi: 'cindy_yuvia',
   vanka: 'thalia_ivanka_elizabeth',
   beby: 'beby_chaesara_anadila',
   anin: 'aninditha_rahma_cahyadi',
   gaby: 'gabriela_margareth_warouw',
   shani: 'shani_indira_natio',
   sisca: 'fransisca_saraswati_puspa_dewi',
   zara: 'adhisty_zara',
   yona: 'viviyona_apriyani',
   viny: 'ratu_vienny_fitrilya',
   lidya: 'lidya_maulida_djuhandar',
   jeje: 'jessica_vania',
   kanya: 'kanya_citta',
   gita: 'gita_sekar_andarini'
}

export function normalizeText(value) {
   return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
}

export function normalizeGraduatedMember(member) {
   const photo = member.image_url || (member.picture ? `https://raw.githubusercontent.com/alveeria/databases/master/jkt48/static/members/${member.picture}` : '')
   const gen = member.generation ? (String(member.generation).toLowerCase().startsWith('gen') ? member.generation : `Gen ${member.generation}`) : '-'
   return {
      id: member.id || member.slug || member.name,
      code: String(member.slug || '').toUpperCase(),
      name: String(member.name || '').trim(),
      nickname: '',
      team: 'EX-MEMBER',
      teamLabel: 'Ex-Member',
      generation: gen,
      is_graduate: true,
      graduated: true,
      birthDate: '',
      photo,
      image_url: photo,
      detailUrl: '',
      instagram: '',
      twitter: '',
      tiktok: '',
      youtube: '',
      jikoshoukai: '',
   }
}

export async function findMembers(query, { includeGraduated = true } = {}) {
   if (!query || typeof query !== 'string') return []
   const rawTarget = String(query).replace(/[\[\]]/g, '').trim()
   const target = normalizeText(rawTarget)
   if (!target) return []

   const activeMembers = await getActiveMembers()

   // 1. Exact match nickname pada member aktif (e.g. "ekin" -> Jacqueline Immanuela)
   const exactNick = activeMembers.filter(m => normalizeText(m.nickname) === target)
   if (exactNick.length) return exactNick

   // 2. Exact match full name pada member aktif
   const exactName = activeMembers.filter(m => normalizeText(m.name) === target)
   if (exactName.length) return exactName

   // 3. Word match full name pada member aktif (e.g. "jacqueline", "freya")
   const wordMatches = activeMembers.filter(m => {
      const words = normalizeText(m.name).split(/\s+/)
      return words.includes(target)
   })
   if (wordMatches.length) return wordMatches

   // 4. Substring match pada nama atau nickname member aktif
   const subMatches = activeMembers.filter(m =>
      normalizeText(m.name).includes(target) || normalizeText(m.nickname).includes(target)
   )
   if (subMatches.length) return subMatches

   if (!includeGraduated) return []

   // 5. Fallback ke graduated member
   const allMembers = await getAllMembers()

   // 5a. Graduated alias lookup
   if (GRADUATED_ALIASES[target]) {
      const aliasSlug = GRADUATED_ALIASES[target]
      const byAlias = allMembers.filter(m => normalizeText(m.slug) === normalizeText(aliasSlug))
      if (byAlias.length) return byAlias.map(normalizeGraduatedMember)
   }

   // 5b. Exact match name / slug
   const exactGrad = allMembers.filter(m =>
      normalizeText(m.name) === target || normalizeText(m.slug) === target
   )
   if (exactGrad.length) return exactGrad.map(normalizeGraduatedMember)

   // 5c. Word match
   const gradWordMatches = allMembers.filter(m => {
      const words = normalizeText(m.name).split(/\s+/)
      return words.includes(target)
   })
   if (gradWordMatches.length) return gradWordMatches.map(normalizeGraduatedMember)

   // 5d. Substring match
   const gradSubMatches = allMembers.filter(m =>
      normalizeText(m.name).includes(target) || normalizeText(m.slug).includes(target)
   )
   if (gradSubMatches.length) return gradSubMatches.map(normalizeGraduatedMember)

   return []
}

export async function searchMember(query) {
   const matches = await findMembers(query, { includeGraduated: true })
   if (!matches.length) return null
   return matches[0]
}

export function formatBirthDate(value) {
   if (!value) return '-'
   const parts = String(value).split('-').map(Number)
   if (parts.length !== 3 || parts.some(n => Number.isNaN(n))) return value
   const [year, month, day] = parts
   const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
   ]
   return `${day} ${months[month - 1]} ${year}`
}

export function socialUrl(type, value) {
   if (!value) return ''
   if (/^https?:\/\//i.test(value)) return value
   const clean = value.replace(/^@/, '')
   if (type === 'instagram') return `https://instagram.com/${clean}`
   if (type === 'twitter') return `https://x.com/${clean}`
   if (type === 'tiktok') return `https://tiktok.com/@${clean}`
   return value
}

export function buildSocialLinks(member) {
   const links = []
   if (member.instagram) {
      links.push(`• Instagram:\n${socialUrl('instagram', member.instagram)}`)
   }
   if (member.twitter) {
      links.push(`• X:\n${socialUrl('twitter', member.twitter)}`)
   }
   if (member.tiktok) {
      links.push(`• TikTok:\n${socialUrl('tiktok', member.tiktok)}`)
   }
   return links
}

export function formatMemberInfo(member) {
   const lines = ['乂  *J K T 4 8  M E M B E R*', '']

   if (member.is_graduate || member.graduated) {
      lines.push(`*${member.name}*`)
      if (member.generation && member.generation !== '-') {
         lines.push(`◦ Generasi: ${member.generation}`)
      }
      lines.push('◦ Status: Graduated')
      lines.push(`◦ Tim Terakhir: ${member.teamLabel || member.team || 'Ex-Member'}`)
      return lines.join('\n')
   }

   const hasNickname = member.nickname && member.nickname.toLowerCase() !== member.name.toLowerCase()
   const nameLine = hasNickname ? `${member.name} — *${member.nickname}*` : `*${member.name}*`
   lines.push(nameLine)
   lines.push(`◦ Tim: ${member.teamLabel || member.team || '-'}`)

   const birthStr = formatBirthDate(member.birthDate)
   if (birthStr && birthStr !== '-') {
      lines.push(`◦ Lahir: ${birthStr}${member.zodiac ? ` (${member.zodiac})` : ''}`)
   } else if (member.zodiac) {
      lines.push(`◦ Zodiak: ${member.zodiac}`)
   }

   const posturParts = []
   if (member.heightCm) posturParts.push(`${member.heightCm} cm`)
   if (member.bloodType && member.bloodType !== '-') posturParts.push(`Gol. Darah ${member.bloodType}`)
   if (posturParts.length) {
      lines.push(`◦ Postur: ${posturParts.join(' / ')}`)
   }

   if (member.jikoshoukai) {
      const cleanJiko = member.jikoshoukai.trim()
      const quote = cleanJiko.split('\n').map(l => `“${l.replace(/^[“"]|[”"]$/g, '')}”`).join('\n')
      lines.push('', quote)
   }

   const socials = buildSocialLinks(member)
   if (socials.length) {
      lines.push('', '*Media Sosial:*', ...socials)
   }

   if (member.detailUrl) {
      lines.push('', '🔗 *Profil Member:*', member.detailUrl)
   }

   return lines.join('\n')
}

export function formatMemberList(members, prefix = '.', command = 'memberinfo') {
   const lines = ['乂  *J K T 4 8  M E M B E R  L I S T*', '']
   const TEAM_ORDER = ['DREAM', 'LOVE', 'PASSION', 'TRAINEE']

   const grouped = {}
   for (const member of members) {
      const team = member.team || 'OTHER'
      if (!grouped[team]) grouped[team] = []
      grouped[team].push(member)
   }

   for (const team of TEAM_ORDER) {
      const list = grouped[team]
      if (!list || !list.length) continue
      const label = TEAM_LABELS[team] || team
      lines.push(`*Tim ${label} (${list.length})*`)
      for (const m of list) {
         lines.push(`◦ ${m.name}${m.nickname ? ` — *${m.nickname}*` : ''}`)
      }
      lines.push('')
   }

   lines.push(`Total Member Aktif: *${members.length}*`)
   lines.push(`Lihat detail: *${prefix + command} <nama/nickname>*`)
   return lines.join('\n')
}

export async function normalizeMemberFilter(inputList = []) {
   const rawList = Array.isArray(inputList) ? inputList : [inputList]
   const members = await getActiveMembers().catch(() => [])
   const result = []

   for (const raw of rawList) {
      const q = String(raw || '').replace(/[\[\]]/g, '').trim()
      if (!q) continue
      const qLower = q.toLowerCase()

      // 1. Cek exact match nickname (e.g. "marsha", "freya", "eli", "lyn")
      const byNick = members.find(m => m.nickname && m.nickname.toLowerCase() === qLower)
      if (byNick) {
         result.push(byNick.nickname)
         continue
      }

      // 2. Cek exact match full name (e.g. "marsha lenathea", "helisma putri", "febriola sinambela")
      const byFullName = members.find(m => m.name && m.name.toLowerCase() === qLower)
      if (byFullName) {
         result.push(byFullName.nickname || byFullName.name)
         continue
      }

      // 3. Cek partial match full name (e.g. "febriola" -> "Olla", "adeline" -> "Delynn")
      const nameMatches = members.filter(m => {
         if (!m.name) return false
         const nLower = m.name.toLowerCase()
         return nLower.includes(qLower) || nLower.split(/\s+/).includes(qLower)
      })
      if (nameMatches.length === 1) {
         result.push(nameMatches[0].nickname || nameMatches[0].name)
         continue
      }

      // 4. Fallback: Proper Title Case per kata jika nama custom/tidak terdaftar
      const titleCased = q
         .split(/\s+/)
         .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
         .join(' ')
      result.push(titleCased)
   }

   return [...new Set(result)]
}
