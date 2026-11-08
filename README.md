<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

Untuk aturan kerja produksi episode, baca [WORKFLOW_RUANG_BAYANGAN.md](WORKFLOW_RUANG_BAYANGAN.md) terlebih dahulu. Dokumen ini berlaku untuk agent AI apa pun yang mengerjakan proyek.

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/fe657fd3-dd80-4c13-9514-b0261d8de46c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Episode rendering lokal

Audio episode disimpan di `public/episodes/`. Episode 1 menggunakan `episode-001.mp3`.
Preview di browser memakai mode draft ringan. Tombol **Render Film Penuh** memanggil
renderer offline lokal melalui server Express dan menghasilkan `renders/episode-001.mp4`
dengan intro, outro, dan audio episode.

Arsip bahan setiap episode disimpan di `episodes/episode-001/`: naskah, metadata
YouTube, prompt thumbnail, dan `episode.json`. Audio tetap menjadi master produksi di
`public/episodes/`, lalu direferensikan oleh `episode.json` agar tidak ada dua salinan
audio yang bisa tidak sinkron.

Untuk menjalankan renderer langsung dari terminal:

```bash
npm run render:episode -- episode-001
```
