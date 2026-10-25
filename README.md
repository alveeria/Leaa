<div align="center">

# Leaa

**WhatsApp Multi-Device Bot · JKT48 · Downloader · Tools · Games**

[![Node.js](https://img.shields.io/badge/Node.js-JavaScript-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Baileys](https://img.shields.io/badge/WhatsApp-Baileys-25D366?logo=whatsapp&logoColor=white)](https://github.com/WhiskeySockets/Baileys)
[![Repository](https://img.shields.io/badge/GitHub-alveeria%2FLeaa-181717?logo=github)](https://github.com/alveeria/Leaa)

Bot WhatsApp berbasis plugin dengan fitur komunitas, hiburan, dan utilitas.

</div>

---

## Harap Dipahami Sebelum Install

- Repository ini berisi penyesuaian bot beserta plugin dari ekosistem bot WhatsApp. Bukan implementasi Baileys dari nol.
- Sebagian fitur menggunakan layanan API pihak ketiga. API key, kuota, dan ketersediaan upstream dapat memengaruhi hasilnya.
- Gunakan nomor khusus bot. Integrasi WhatsApp tidak resmi tetap memiliki risiko pembatasan akun.
- Jangan mengunggah API key, sesi WhatsApp, database pengguna, atau kredensial ke GitHub, termasuk repository private.
- README ini disesuaikan dengan isi **Leaa**; opsi startup dan petunjuk dari repository lain belum tentu berlaku di sini.

## Fitur

- **JKT48:** plugin berita dan pemantauan berita.
- **Downloader:** plugin untuk YouTube, Spotify, Google Drive, dan media lainnya.
- **Grup:** pengaturan grup, moderasi, dan fitur admin.
- **Sticker & maker:** pembuatan stiker dan pengolahan media.
- **Games & RPG:** permainan, leveling, inventori, dan ekonomi virtual.
- **Tools & internet:** utilitas, pencarian informasi, dan integrasi layanan eksternal.
- **AI & hiburan:** plugin percakapan, anime, serta fitur komunitas.

> Keberadaan plugin tidak menjamin semua upstream masih aktif. Periksa konfigurasi serta uji fitur yang akan digunakan.

## Persiapan

Siapkan lingkungan Node.js yang kompatibel dengan dependensi pada `package.json`, Git, serta alat media berikut:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [FFmpeg](https://ffmpeg.org/)
- [ImageMagick](https://imagemagick.org/)
- WebP tools bila diperlukan oleh fitur konversi.

Sejumlah dependensi, seperti `canvas` dan `sharp`, mungkin memerlukan pustaka native atau build tools pada sistem operasi tertentu.

## Instalasi

```bash
git clone https://github.com/alveeria/Leaa.git
cd Leaa
npm install
```

### Konfigurasi

1. Tinjau `config.js` secara lokal.
2. Sesuaikan identitas bot, nomor owner, serta pengaturan yang dibutuhkan.
3. Isi kredensial layanan hanya pada lingkungan deployment yang aman. Jangan commit nilainya.
4. Pastikan FFmpeg dan alat media dapat dijalankan dari `PATH`.

Untuk fitur yang bergantung pada Betabotz, lihat persyaratan API key dan akses IP di [website Betabotz](https://api.betabotz.eu.org). Harga serta kuota mengikuti informasi penyedia, bukan README ini.

### Jalankan

```bash
npm start
```

Script tersebut menjalankan:

```bash
node index.js --autocleartmp
```

Ikuti petunjuk autentikasi WhatsApp yang muncul pada terminal. Jangan membagikan kode autentikasi atau berkas sesi kepada orang lain.

### Jalankan dengan PM2 (opsional)

Jika PM2 sudah terpasang:

```bash
pm2 start npm --name leaa -- start
pm2 logs leaa
pm2 save
```

`pm2 save` menyimpan daftar proses; konfigurasi startup PM2 diperlukan secara terpisah untuk menjalankan bot otomatis setelah reboot.

## Struktur Project

```text
Leaa/
├── index.js       # Entry point
├── main.js        # Runtime bot
├── handler.js     # Handler pesan dan perintah
├── config.js      # Konfigurasi bot
├── server.js      # Komponen server
├── plugins/       # Fitur bot
├── lib/           # Helper dan library
└── package.json   # Dependency dan script startup
```

## Troubleshooting

- **Dependency gagal diinstal:** periksa kecocokan versi Node.js dan kebutuhan build native, terutama `canvas`/`sharp`.
- **Fitur media gagal:** pastikan FFmpeg, ImageMagick, serta alat WebP tersedia.
- **API mengembalikan error:** periksa API key, kuota, persyaratan IP, dan status layanan upstream.
- **Bot tidak merespons:** lihat log terminal/PM2, koneksi WhatsApp, serta pengaturan owner dan plugin.

## Kredit & Referensi

Terima kasih kepada pengembang dan kontributor ekosistem bot WhatsApp:

- [BOTCAHX / RTXZY-MD](https://github.com/BOTCAHX/RTXZY-MD) — rujukan asal yang tercantum dalam metadata `package.json` Leaa.
- [ERLANRAHMAT / BETABOTZ-MD2](https://github.com/ERLANRAHMAT/BETABOTZ-MD2) — referensi dokumentasi dan proyek terkait Betabotz.
- [WhiskeySockets / Baileys](https://github.com/WhiskeySockets/Baileys) — library integrasi WhatsApp.
- Seluruh penulis plugin dan dependency yang digunakan. Pertahankan atribusi serta pemberitahuan lisensi pada berkas asal.

Penyesuaian repository: [alveeria](https://github.com/alveeria).

## Lisensi

`package.json` mencantumkan **MIT**. Tetap periksa ketentuan masing-masing dependency dan kode pihak ketiga; README ini tidak mengubah lisensi atau kepemilikan kode asal.
