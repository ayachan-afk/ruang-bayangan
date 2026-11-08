import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { spawn } from 'child_process';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

type RenderJob = {
  id: string;
  episodeId: string;
  status: 'queued' | 'rendering' | 'done' | 'error';
  progress: number;
  outputPath?: string;
  outputName?: string;
  error?: string;
};

const renderJobs = new Map<string, RenderJob>();

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Script Generation Endpoint for Shadow Theater Studio
app.post('/api/generate-story-script', async (req, res) => {
  try {
    const { prompt, totalDuration = 28 } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt atau naskah wajib diisi.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di Settings > Secrets panel.',
      });
    }

    const systemInstruction = `
Kamu adalah Director & Storyboard Artist kelas dunia untuk animasi Shadow Theater (Teater Bayangan / Kelir Bercahaya).
Tugasmu:
1. Menganalisis naskah atau ide cerita yang diberikan oleh pengguna.
2. Membaginya menjadi babak-babak sinematik visual (biasanya 2 hingga 4 babak, dengan total durasi yang sesuai, misalnya ~${totalDuration} detik).
3. Setiap babak harus memiliki narasi puitis/sinematik dalam Bahasa Indonesia, serta elemen visual shadow theater yang kuat (pepohonan, perbukitan, desa, kabut, karakter manusia beranatomi realistis, binatang).
4. Kembalikan respons dalam format JSON terstruktur yang valid.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Rancang naskah dan babak adegan shadow theater visual untuk ide cerita ini:\n"${prompt}"\nTotal target durasi: ${totalDuration} detik.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'Judul cerita yang puitis dan sinematik',
            },
            description: {
              type: Type.STRING,
              description: 'Deskripsi ringkas kisah shadow theater ini',
            },
            totalDuration: {
              type: Type.NUMBER,
              description: 'Total durasi dalam detik',
            },
            acts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  actNumber: {
                    type: Type.NUMBER,
                  },
                  title: {
                    type: Type.STRING,
                    description: 'Judul babak, contoh: Bab 1: Rimba Berkabut',
                  },
                  narration: {
                    type: Type.STRING,
                    description: 'Kalimat narasi deskriptif untuk babak ini',
                  },
                  duration: {
                    type: Type.NUMBER,
                    description: 'Durasi babak dalam detik (contoh: 8, 9, atau 10)',
                  },
                  theme: {
                    type: Type.STRING,
                    description: 'forest, mountains, ancient_village, countryside, battlefield, atau night_sky',
                  },
                  lighting: {
                    type: Type.STRING,
                    description: 'warm_golden, sunset, moonlight, torch, dramatic_white, atau deep_amber',
                  },
                  keyVisuals: {
                    type: Type.STRING,
                    description: 'Deskripsi singkat visual siluet dan pergerakan karakter',
                  },
                },
                required: ['actNumber', 'title', 'narration', 'duration', 'theme', 'lighting'],
              },
            },
          },
          required: ['title', 'description', 'totalDuration', 'acts'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Respons kosong dari Gemini AI');
    }

    const data = JSON.parse(text);
    return res.json(data);
  } catch (error: any) {
    console.error('Error generating story with Gemini:', error);
    return res.status(500).json({
      error: error?.message || 'Terjadi kesalahan saat memproses naskah dengan Gemini AI.',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Start a local offline render. The browser only controls the job; FFmpeg does the work.
app.post('/api/render-episode', (req, res) => {
  const episodeId = typeof req.body?.episodeId === 'string' ? req.body.episodeId : 'episode-001';
  const job: RenderJob = {
    id: randomUUID(),
    episodeId,
    status: 'queued',
    progress: 0,
  };
  renderJobs.set(job.id, job);
  res.status(202).json({ jobId: job.id });

  // Invoke the local tsx CLI through Node directly. Spawning npm.cmd from a
  // Windows Express process can fail with EINVAL in some shells.
  const tsxCli = path.join(__dirname, 'node_modules', 'tsx', 'dist', 'cli.mjs');
  const child = spawn(process.execPath, [tsxCli, 'scripts/render-episode.ts', episodeId], {
    cwd: __dirname,
    env: process.env,
    windowsHide: true,
  });
  job.status = 'rendering';

  let stderr = '';
  child.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    const match = text.match(/PROGRESS\s+([0-9.]+)/);
    if (match) job.progress = Math.max(0, Math.min(1, Number(match[1])));
    const done = text.match(/DONE\s+(.+)/);
    if (done) {
      const outputPath = done[1].trim();
      job.outputPath = outputPath;
      job.outputName = path.basename(outputPath);
    }
  });
  child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
  child.on('error', (error) => {
    job.status = 'error';
    job.error = error.message;
  });
  child.on('close', (code) => {
    if (code === 0) {
      job.status = 'done';
      job.progress = 1;
      job.outputPath ||= path.join(__dirname, 'renders', `${episodeId}.mp4`);
      job.outputName ||= path.basename(job.outputPath);
    } else {
      job.status = 'error';
      job.error = stderr || `Renderer berhenti dengan kode ${code}`;
    }
  });
});

app.get('/api/render-status/:jobId', (req, res) => {
  const job = renderJobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Render job tidak ditemukan.' });
  return res.json(job);
});

app.get('/api/render-download/:jobId', (req, res) => {
  const job = renderJobs.get(req.params.jobId);
  if (!job || job.status !== 'done' || !job.outputPath) {
    return res.status(404).json({ error: 'Hasil render belum tersedia.' });
  }
  return res.download(job.outputPath, job.outputName || path.basename(job.outputPath));
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite middlewares in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Shadow Theater Studio running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
