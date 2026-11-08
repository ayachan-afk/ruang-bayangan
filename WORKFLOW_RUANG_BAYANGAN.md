# WORKFLOW RUANG BAYANGAN

Dokumen ini adalah aturan kerja utama proyek. Saat konteks atau aplikasi AI ter-reset, baca file ini terlebih dahulu sebelum mengerjakan episode baru.

## Prinsip utama

Ruang Bayangan adalah channel storytelling animasi siluet tentang tradisi, mitos, misteri, kepercayaan, dan budaya manusia.

Peran Agent:

1. Membantu membuat atau mengembangkan cerita.
2. Menyiapkan paket produksi dan arsip episode.
3. Membuat struktur animasi berdasarkan naskah dan durasi audio.
4. Tidak melakukan render final otomatis.

Render final hanya dilakukan jika pengguna memintanya secara eksplisit. Biasanya pengguna akan menjalankan render sendiri agar dapat memeriksa preview terlebih dahulu.

## Dua jenis permintaan utama

### A. Pengguna memberikan cerita atau naskah

Alurnya:

1. Baca cerita dan pahami inti, tone, fakta, tokoh, lokasi, serta urutan peristiwa.
2. Jika audio belum tersedia, jangan membuat animasi final. Buat atau siapkan naskah dan paket produksinya dahulu.
3. Jika audio sudah tersedia, ukur durasi aktual audio dan jadikan audio sebagai sumber waktu utama.
4. Bagi cerita menjadi beberapa adegan yang mengikuti isi voice-over.
5. Buat atau perbarui scene, keyframe, lighting, background, atmosphere, dan elemen siluet.
6. Jangan merender video otomatis.
7. Laporkan file yang dibuat dan minta pengguna memeriksa preview.

### B. Pengguna meminta dibuatkan cerita

Alurnya:

1. Pahami topik, target durasi, format, dan gaya yang diinginkan.
2. Jika topik berkaitan dengan tren, berita, budaya, tokoh, atau informasi yang bisa berubah, lakukan riset web terlebih dahulu.
3. Utamakan sumber primer dan sumber tepercaya.
4. Catat sumber riset dalam arsip episode jika riset digunakan.
5. Buat naskah voice-over sesuai durasi atau batas karakter yang diminta.
6. Buat metadata YouTube dan prompt thumbnail.
7. Tunggu pengguna merekam dan mengirimkan voice-over.
8. Setelah audio tersedia, baru buat animasi yang disinkronkan dengan durasi audio.
9. Jangan merender video otomatis.

## Urutan produksi wajib

```text
Ide atau naskah
  ↓
Riset dan verifikasi bila diperlukan
  ↓
Naskah voice-over
  ↓
Metadata YouTube
  ↓
Prompt thumbnail
  ↓
Voice-over dari pengguna
  ↓
Pengukuran durasi audio
  ↓
Pembagian adegan dan animasi
  ↓
Preview di web
  ↓
Revisi jika diperlukan
  ↓
Pengguna melakukan render final
```

## Struktur arsip episode

Setiap episode harus memiliki folder sendiri:

```text
episodes/
  episode-XXX/
    01-naskah.md
    02-metadata-youtube.md
    03-thumbnail-prompt.md
    04-sumber-riset.md          # jika ada riset
    episode.json
```

Audio produksi disimpan di:

```text
public/episodes/episode-XXX.mp3
```

Audio adalah master produksi sekaligus referensi arsip. Jangan membuat salinan audio yang tidak perlu.

Hasil render, jika pengguna menjalankannya, disimpan di:

```text
renders/episode-XXX.mp4
```

## Strategi Format: Fokus Utama Short 9:16 (Shorts-First Strategy)

Untuk memaksimalkan pertumbuhan kanal baru dan jangkauan algoritma penonton (YouTube Shorts, TikTok, Instagram Reels), **produksi difokuskan sepenuhnya pada format Short (Portrait 9:16, 1080×1920)**.

- **Format long landscape (16:9) ditiadakan untuk episode baru**, kecuali jika pengguna secara eksplisit memintanya kembali di masa mendatang.
- **Target durasi utama:** 45–55 detik (~90–115 kata pada tempo narasi tenang dan berwibawa).
- **Struktur alur Shorts yang dioptimalkan:**
  1. *Hook instan (0–5 detik):* langsung menembus rasa penasaran penonton tanpa intro bertele-tele.
  2. *Eksplorasi mitos / ketegangan (6–20 detik):* membangun nuansa teater siluet yang khas dan misterius.
  3. *Penyingkapan rahasia / kearifan lokal (21–40 detik):* membongkar fakta di balik mitos.
  4. *Pesan filosofis / wisdom (41–55 detik):* penutup yang berkesan dan mengundang interaksi/refleksi penonton.
- **Visual portrait 1080×1920 native dari awal:** bukan hasil crop atau letterbox. Blocking, pergerakan kamera, dan kedalaman siluet dirancang vertikal alami.
- **Spot SFX & Efek Ambient Prosedural:** disematkan reaktif pada kata-kata kunci narasi.

## Penamaan episode

- Episode short turunan dari episode yang sudah ada: `episode-001a`, `episode-002a`, `episode-003a`.
- Episode short baru berikutnya: dapat menggunakan `episode-004a`, `episode-005a`, dst. (atau `episode-XXX`).

## Aturan audio dan durasi

- Durasi aktual file audio adalah sumber waktu utama animasi.
- Ukur durasi dengan FFmpeg/FFprobe bila tersedia.
- Jangan mengarang durasi berdasarkan perkiraan karakter atau jumlah kata.
- Jika pengguna menyebut “50 detik” tetapi audio berdurasi 48 detik, gunakan durasi aktual audio dan beri tahu pengguna.
- Intro/outro tidak otomatis ditambahkan.
- Jika pengguna meminta intro/outro, gunakan hanya jika konsepnya sederhana dan mendukung cerita.

## Transkrip dan pemetaan shot

Agent harus membuat transkrip audio atau naskah voice-over dalam format per kalimat. Semua timestamp awal ditulis `00:00` sebagai placeholder agar pengguna dapat mengoreksinya dengan mudah.

Format standar:

```text
00:00 Kalimat pertama.
00:00 Kalimat kedua.

00:00 Kalimat ketiga dari konteks berikutnya.
```

Pemisahan teks dilakukan per kalimat, tetapi animasi tidak wajib berganti pada setiap kalimat. Setelah timestamp diisi, agent harus mengelompokkan kalimat yang masih berada dalam satu konteks menjadi satu shot atau rangkaian shot yang berkesinambungan.

Gunakan prinsip berikut:

- Kalimat pendek yang masih menggambarkan visual yang sama boleh berada dalam satu scene.
- Kalimat yang memperkenalkan tempat, waktu, tokoh, objek, atau peristiwa baru sebaiknya memulai shot baru.
- Satu scene berdurasi sekitar 3–8 detik adalah target praktis.
- Scene 8–12 detik masih boleh jika memiliki beberapa perubahan visual internal.
- Scene sekitar 15 detik tidak otomatis salah, tetapi jangan berupa satu frame diam. Pecah menjadi 2–3 beat visual atau beberapa shot jika narasinya memuat lebih dari satu gagasan.
- Jangan menentukan pembagian adegan hanya dari paragraf; gunakan makna kalimat dan perubahan konteks.

Dengan demikian, transkrip tetap mudah diedit per kalimat, sedangkan hasil animasi tetap terasa sinematik dan tidak berganti gambar secara mekanis.

## Aturan format video

- Cerita panjang default: landscape 16:9.
- Video pendek untuk Shorts/Reels/TikTok: portrait 9:16.
- Setiap format harus digambar dan dikomposisikan dari awal sesuai rasio target.
- Jangan memakai bingkai, letterbox, blur-background, crop, atau stretching sebagai pengganti animasi portrait.
- Aset dan posisi landscape tidak boleh sekadar dikonversi ke portrait.
- Untuk portrait, buat layout, blocking, skala objek, latar, dan gerakan baru yang cocok untuk kanvas 1080×1920.
- Versi portrait harus dibuat sebagai episode turunan dengan ID terpisah.

## Gaya visual default

- Flat 2D backlit silhouette.
- Objek foreground berupa siluet gelap dengan kontur terbaca, proporsional, dan estetis.
- Detail internal, tekstur pakaian, wajah, dan shading dimensional dihindari.
- Background boleh memakai gradasi sinematik, kabut, ambient light, dan layered scenery.
- Utamakan kesederhanaan, keterbacaan, dan kesesuaian dengan narasi.
- Hindari bentuk janggal atau aneh: meskipun flat dan berupa siluet hitam, kontur bentuk manusia, hewan, pohon, ombak, dan bangunan harus wajar, luwes, dan beranatomi/berproporsi alami.
- Komposisi antar bentuk harus harmonis dan enak dipandang (memperhatikan balance, skala relatif, rule of thirds, serta negative space yang bersih tanpa tumpukan bentuk yang membingungkan).
- Jangan menambahkan objek hanya untuk membuat scene terlihat ramai.
- Jika pengguna meminta visual sederhana, gunakan sedikit objek dengan komposisi kuat.

## Standar kualitas visual setiap scene

Setiap scene harus dirancang sebagai shot sinematik yang memiliki suasana dan kehidupan visual. Scene tidak boleh hanya berupa background gradient dengan beberapa bentuk geometris sederhana.

Sebelum membuat scene, agent harus menentukan:

- **Konteks tempat:** rumah, desa, hutan, tebing, pegunungan, halaman upacara, jalan, atau lokasi lain yang sesuai narasi.
- **Waktu dan suasana:** pagi, siang, senja, malam, sunyi, sakral, tegang, duka, hangat, misterius, atau suasana lain yang mendukung voice-over.
- **Sumber cahaya:** posisi backlight, warna, intensitas, glow, bayangan, god rays, cahaya bulan, obor, api, atau cahaya jendela.
- **Atmosfer:** kabut, debu, asap, embun, hujan, bara, kunang-kunang, daun, awan, haze, atau partikel lain jika sesuai konteks.
- **Depth dan layering:** foreground, midground, background, parallax, blur kedalaman, overlapping silhouette, dan ground plane.
- **Focal subject:** objek atau karakter utama yang jelas terbaca dan menjadi pusat perhatian shot.
- **Gerakan:** perubahan pose, gestur, berjalan, ritual, kain atau daun tertiup, api berkedip, kabut bergeser, partikel bergerak, kamera mendekat/menjauh, atau perubahan cahaya.
- **Perubahan internal:** shot yang berlangsung lebih dari beberapa detik harus memiliki perkembangan visual, bukan mengulang frame yang sama.

Gunakan asset library, renderer, rig karakter, bentuk bangunan, tanaman, hewan, props, dan efek atmosfer yang sudah tersedia di proyek bila sesuai. Jangan mengganti aset organik dengan lingkaran, segitiga, persegi, atau figur stick sederhana hanya karena lebih cepat dibuat.

Setiap scene minimal harus memiliki:

1. Background yang sesuai lokasi dan waktu.
2. Minimal dua atau tiga lapisan kedalaman.
3. Lighting yang memiliki arah dan warna yang jelas.
4. Satu atau lebih elemen atmosfer atau environmental motion.
5. Focal subject yang terkait langsung dengan narasi.
6. Gerakan atau perubahan visual yang dapat terlihat saat preview diputar.

Scene boleh sederhana, tetapi kesederhanaan harus berasal dari komposisi yang terkontrol—bukan dari kekurangan detail. Prioritaskan siluet yang organik, proporsi yang meyakinkan, kontur yang mudah dikenali, dan hubungan visual yang jelas antara objek, cahaya, atmosfer, dan cerita.

### Penyelarasan efek ambient dengan kalimat narasi

Efek ambient (*environmental atmosphere*) tidak boleh bersifat generik atau monoton di seluruh adegan. Agent wajib merancang efek ambient yang reaktif dan spesifik terhadap makna kalimat yang diwakili:
- **Kalimat misteri / sakral / kekuatan gaib:** kabut merayap lambat (*ground creeping mist*), pendaran cahaya rim-light magis berdenyut, pendaran partikel dingin atau spora bercahaya.
- **Kalimat ancaman / bahaya alam / ombak ganas:** semburan buih air (*spray droplets*), partikel hembusan angin kencang berarah, atau siluet awan/kabut berpusar.
- **Kalimat kehangatan tradisi / wejangan leluhur:** percikan bara api keemasan (*warm floating embers*), asap dupa/obor meliuk lembut, pendaran cahaya hangat perapian.
- **Kalimat kontemplasi / hening di hadapan alam:** kelip bintang lembut, jalur kilau pantulan bulan pada air/pasir (*shimmering moonbeam*), atau kabut tipis mengambang perlahan.

Setiap transisi kalimat ke kalimat berikutnya harus membawa pergeseran nuansa ambient ini secara terasa namun tetap organis.

### Aturan Pencahayaan Lokal yang Masuk Akal (Grounded Local Lighting)

Setiap sumber cahaya lokal harus memiliki keberadaan fisik dan alasan kontekstual yang nyata dalam adegan:
- **Di dalam rumah / bilik / pendopo / warung:** lentera gantung minyak, lampu teplok di dinding/meja, cahaya hangat yang keluar dari celah bilik bambu/jendela, atau bara perapian.
- **Di alam terbuka / rimba malam:** obor bambu yang ditancapkan atau dipegang peziarah, api unggun/dupa petapa, cahaya rembulan yang menembus celah kanopi ranting, atau pantulan air permukaan.
- **Dilarang menaruh cahaya tanpa sumber logis:** jangan memunculkan pendaran cahaya terang acak jika tidak ada objek pemancar (lampu, api, jendela, atau bulan) yang masuk akal di dalam adegan.
- **Interaksi cahaya pada siluet:** cahaya lokal harus menghasilkan kontras logis—misalnya siluet karakter menjadi sangat tegas saat berada di depan jendela/dinding bilik yang terang (*backlit cutout*), ada garis tipis cahaya bocor di celah kusen pintu, atau pendaran lembut di sisi tubuh yang menghadap obor.

### Pemanfaatan Ruang Vertikal & Variasi Kamera (9:16 Shorts)

- **Framing Arsitektur & Alam Vertikal:** Jangan biarkan 2/3 bagian atas layar menjadi ruang kosong polos. Gunakan balok rangka atap kayu, plafon, tiang beranda, gantung lentera, kanopi sulur beringin, atau tebing atas untuk membingkai adegan agar terasa penuh dan hidup.
- **Variasi Sudut Kamera Sinematik:** Jangan selalu menggunakan *wide shot* jauh di setiap adegan. Kombinasikan secara dinamis antara:
  - *Establishing/Atmospheric Shot:* panorama ruang dan alam.
  - *Medium Shot:* interaksi karakter dengan ruangan (duduk di dipan, berdiri di depan warung/pintu).
  - *Close-up/Detail Silhouette:* fokus pada objek penting (pintu yang diketuk, lentera bergetar, siluet ekspresif kepala berpeci atau bersanggul) saat narasi memuncak.

### Standar khusus versi long dan short

Versi long landscape dan versi short portrait harus sama-sama memenuhi standar kualitas di atas. Jangan membuat versi short sebagai versi long yang dipersempit atau diberi bingkai. Rancang ulang blocking, kamera, ukuran focal subject, layering, efek atmosfer, dan gerakan agar ruang visual portrait terisi secara alami.

Untuk setiap shot, agent sebaiknya menyiapkan catatan singkat seperti:

```text
Konteks: halaman Tongkonan saat senja.
Fokus: keluarga dan jenazah yang masih berada di rumah.
Atmosfer: kabut tipis, cahaya jendela hangat, debu halus.
Depth: atap foreground, rumah midground, gunung background.
Gerakan: cahaya jendela berdenyut, kabut bergeser, karakter bergerak perlahan.
Transisi: dissolve lembut ke shot berikutnya saat narasi berganti konteks.
```

## Prinsip variasi visual dan kelayakan monetisasi

Tidak ada aturan resmi YouTube yang menetapkan bahwa satu gambar hanya boleh tampil selama jumlah detik tertentu. Yang dinilai dalam kebijakan monetisasi adalah kualitas dan keaslian keseluruhan channel: apakah video memberi nilai kreatif, edukatif, atau hiburan, serta apakah kontennya terasa orisinal dan tidak diproduksi secara massal dengan template yang berulang.

Karena itu, gunakan pedoman produksi berikut:

- Rancang pergantian shot rata-rata setiap **3–8 detik**.
- Hindari mempertahankan satu frame yang benar-benar diam selama lebih dari **8–10 detik**, kecuali ada alasan artistik yang jelas.
- Jika sebuah shot perlu berlangsung lebih lama, berikan gerakan nyata: perubahan pose, perpindahan karakter, kamera, parallax, kabut, cahaya, api, air, awan, partikel, atau perubahan atmosfer.
- Setiap pergantian shot harus memiliki fungsi naratif atau emosional, bukan sekadar pergantian acak untuk mengejar jumlah scene.
- Jangan membuat video sebagai slideshow gambar diam dengan voice-over yang ditempelkan di atasnya.
- Narasi, riset, ilustrasi siluet, blocking, keyframe, lighting, dan editing harus memberi kontribusi orisinal yang jelas.
- Episode dalam satu seri boleh memakai identitas visual yang konsisten, tetapi isi, fokus, adegan, dan substansi setiap episode harus berbeda.
- Target praktis versi long 2–3 menit: sekitar **20–35 shot utama** dengan micro-motion di antara pergantian shot.
- Target praktis versi short 40–60 detik: sekitar **8–15 shot utama**, tergantung kepadatan narasi.
- Angka tersebut adalah pedoman kreatif, bukan jaminan lolos YPP. Selalu periksa kebijakan YouTube terbaru sebelum publikasi.

Dalam konteks ini, “gambar diam” berarti frame atau komposisi yang tidak berubah secara visual. Adegan Canvas yang memiliki animasi nyata—meskipun sederhana—dipandang sebagai shot animasi, bukan sekadar satu gambar statis. Namun animasi tetap harus substantif dan tidak boleh hanya mengulang template yang sama di setiap episode.

Referensi kebijakan resmi YouTube:

https://support.google.com/youtube/answer/1311392

## Paket yang harus disiapkan Codex

Untuk setiap episode, siapkan sesuai kebutuhan:

- Naskah voice-over.
- Metadata YouTube: judul, deskripsi, hashtag, tags, dan kategori yang disarankan.
- Prompt thumbnail dengan style block yang konsisten.
- Sumber riset jika cerita dibuat berdasarkan riset.
- Metadata episode JSON.
- Scene dan animasi long di source code.
- Scene dan animasi short di source code, dibuat khusus untuk portrait.
- Audio path dan durasi aktual.
- Transkrip bertimestamp dengan placeholder `00:00` jika timestamp belum diisi pengguna.
- Pemetaan kalimat ke konteks dan shot setelah timestamp tersedia.
- Rencana shot dan variasi visual yang mengikuti prinsip 3–8 detik per shot.

## Aturan render

Jangan menjalankan:

```text
npm run render:episode
```

secara otomatis setelah membuat animasi.

Setelah animasi selesai, cukup:

1. Jalankan pengecekan tipe/build bila relevan.
2. Beri tahu pengguna episode sudah siap dipreview.
3. Berikan lokasi file arsip dan audio.
4. Tunggu instruksi pengguna untuk render final.

## Respons standar setelah pekerjaan selesai

Gunakan ringkasan singkat:

```text
Episode [ID] sudah disiapkan.

- Audio: [path]
- Durasi aktual: [durasi]
- Format: [landscape/portrait]
- Adegan: [jumlah dan ringkasan]
- Arsip: [path folder]
- Render final belum dijalankan.

Silakan cek preview. Jika sudah sesuai, render dapat dijalankan secara manual.
```
