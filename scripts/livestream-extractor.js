/** @purpose Extract and transcribe content from livestream recordings */
const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

// Configure ffmpeg to use the static binary we just installed
ffmpeg.setFfmpegPath(ffmpegStatic);

const VIDEO_URL = process.argv[2] || 'https://www.youtube.com/live/Hi_a9G3YrW0';
const CHUNK_DURATION = 60; // seconds — longer chunks = more reliable Whisper transcription
const OUT_DIR = path.join(__dirname, '../data/livestreams');
const TRANSCRIPT_FILE = path.join(OUT_DIR, 'transcript.txt');

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Function to call Groq Whisper API
async function transcribeAudio(filePath) {
    if (!process.env.GROQ_API_KEY) {
        console.error('Missing GROQ_API_KEY in .env');
        return;
    }

    try {
        const formData = new FormData();
        const fileContent = fs.readFileSync(filePath);
        formData.append('file', fileContent, {
            filename: path.basename(filePath),
            contentType: 'audio/wav',
        });
        formData.append('model', 'whisper-large-v3');
        formData.append('language', 'pt');
        formData.append('response_format', 'text');

        const response = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', formData, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                ...formData.getHeaders()
            },
            timeout: 30000
        });

        const text = response.data;
        if (text && text.trim().length > 0) {
            console.log(`[Transcription]: ${text.trim()}`);
            fs.appendFileSync(TRANSCRIPT_FILE, text.trim() + '\n');
        }
    } catch (error) {
        let msg = error.message;
        if (error.response && error.response.data) {
            msg += ` | Data: ${JSON.stringify(error.response.data)}`;
        }
        console.error(`Transcription Failed (non-fatal): ${msg}`);
    } finally {
        // Clean up — retry with delay if file is busy
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                break;
            } catch (e) {
                if (e.code === 'EBUSY' && attempt < 2) {
                    await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                } else {
                    console.warn(`Cleanup warning (${filePath}): ${e.message}`);
                    break;
                }
            }
        }
    }
}

async function startStream() {
    console.log(`Starting extraction for: ${VIDEO_URL}...`);

    let streamUrl = '';
    try {
        // Use yt-dlp via python module — format 91 = lowest quality with audio (reliable for transcription)
        const executable = 'python -m yt_dlp';

        streamUrl = execSync(`${executable} -f 91 -g "${VIDEO_URL}"`, { timeout: 30000 }).toString().trim();
        console.log('Stream URL extracted successfully.');
    } catch (err) {
        console.error('Failed to extract stream URL. Is yt-dlp installed? Error:', err.message);
        process.exit(1);
    }

    console.log('Starting FFmpeg segmenter...');

    // Use fluent-ffmpeg to segment the stream
    ffmpeg(streamUrl)
        .outputOptions([
            '-f segment',
            `-segment_time ${CHUNK_DURATION}`,
            '-c:a pcm_s16le',
            '-ar 16000',
            '-ac 1',
            '-reset_timestamps 1'
        ])
        .output(path.join(OUT_DIR, 'chunk-%03d.wav'))
        .on('start', (commandLine) => {
            console.log('FFmpeg process started.');
            // Watch the directory for new chunks
            watchChunks();
        })
        .on('error', (err) => {
            console.error('FFmpeg Error:', err.message);
        })
        .on('end', () => {
            console.log('Stream ended or process stopped.');
        })
        .run();
}

let processingCount = -1; // Ignore the very first partial chunk sometimes
function watchChunks() {
    let processedFiles = new Set();

    setInterval(() => {
        fs.readdir(OUT_DIR, (err, files) => {
            if (err) return;

            const chunks = files.filter(f => f.startsWith('chunk-') && f.endsWith('.wav')).sort();

            // We process all chunks EXCEPT the very last one, which might still be writing
            for (let i = 0; i < chunks.length - 1; i++) {
                const file = chunks[i];
                if (!processedFiles.has(file)) {
                    processedFiles.add(file);
                    console.log(`Processing ${file}...`);
                    transcribeAudio(path.join(OUT_DIR, file));
                }
            }
        });
    }, 5000);
}

startStream();
