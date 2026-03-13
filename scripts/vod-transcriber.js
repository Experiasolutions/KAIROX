/** @purpose VOD video transcription pipeline */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const VIDEO_URL = "https://www.youtube.com/watch?v=Hi_a9G3YrW0";
const OUT_DIR = path.join(__dirname, '..', 'data', 'livestreams');
const CHUNK_DURATION = 600; // 10 minutes chunks (max 25MB for Groq)
const AUDIO_FILE = path.join(OUT_DIR, 'full_audio.m4a');
const TRANSCRIPT_FILE = path.join(OUT_DIR, 'transcript_full.txt');

if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function start() {
    console.log(`[1/4] Downloading audio from ${VIDEO_URL} using yt-dlp...`);
    try {
        // Download format 139/140 (m4a audio) to save bandwidth
        execSync(`python -m yt_dlp -f "bestaudio[ext=m4a]" -o "${AUDIO_FILE}" "${VIDEO_URL}"`);
        console.log(`Audio downloaded successfully to ${AUDIO_FILE}`);
    } catch (err) {
        console.error('Failed to download audio:', err.message);
        return;
    }

    console.log(`[2/4] Chunking audio into ${CHUNK_DURATION}s segments...`);

    // Clear old chunks if any
    const files = fs.readdirSync(OUT_DIR);
    for (const f of files) {
        if (f.startsWith('vod-chunk-') && f.endsWith('.m4a')) {
            fs.unlinkSync(path.join(OUT_DIR, f));
        }
    }

    try {
        execSync(`ffmpeg -i "${AUDIO_FILE}" -f segment -segment_time ${CHUNK_DURATION} -c copy -reset_timestamps 1 "${path.join(OUT_DIR, 'vod-chunk-%03d.m4a')}"`, { stdio: 'inherit' });
        console.log('Chunking completed.');
    } catch (err) {
        console.error('FFmpeg chunking error:', err.message);
        return;
    }

    console.log(`[3/4] Transcribing chunks sequentially with Groq API...`);

    const chunks = fs.readdirSync(OUT_DIR)
        .filter(f => f.startsWith('vod-chunk-') && f.endsWith('.m4a'))
        .sort();

    console.log(`Found ${chunks.length} chunks to transcribe.`);

    for (let i = 0; i < chunks.length; i++) {
        const chunkFile = chunks[i];
        const chunkPath = path.join(OUT_DIR, chunkFile);
        console.log(`\nTranscribing chunk ${i + 1}/${chunks.length}: ${chunkFile}...`);

        let success = false;
        let retries = 0;

        while (!success && retries < 3) {
            try {
                const formData = new FormData();
                const fileContent = fs.readFileSync(chunkPath);

                formData.append('file', fileContent, {
                    filename: chunkFile,
                    contentType: 'audio/mp4',
                });
                formData.append('model', 'whisper-large-v3');
                formData.append('language', 'pt');
                formData.append('response_format', 'text');

                const response = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', formData, {
                    headers: {
                        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                        ...formData.getHeaders()
                    },
                    timeout: 60000 // 60 seconds timeout per chunk
                });

                const text = response.data;
                if (text && text.trim().length > 0) {
                    console.log(`Successfully transcribed ${chunkFile}. Length: ${text.length} chars.`);
                    fs.appendFileSync(TRANSCRIPT_FILE, text.trim() + '\n\n');
                }

                success = true;

                // Cleanup chunk after successful transcription
                fs.unlinkSync(chunkPath);

                // Sleep for 3 seconds between chunks to respect rate limits (Groq allows 20 RPM, so 1 every 3s is safe)
                await new Promise(r => setTimeout(r, 3000));

            } catch (error) {
                retries++;
                const errMsg = error.response && error.response.data
                    ? JSON.stringify(error.response.data)
                    : error.message;
                console.error(`Attempt ${retries} failed for ${chunkFile}: ${errMsg}`);

                if (retries >= 3) {
                    console.error(`Skipping ${chunkFile} after 3 failed attempts.`);
                } else {
                    console.log(`Waiting 10 seconds before retry...`);
                    await new Promise(r => setTimeout(r, 10000));
                }
            }
        }
    }

    console.log(`\n[4/4] Pipeline completed. Full transcript saved to ${TRANSCRIPT_FILE}`);

    // Optional: cleanup full audio to save hard drive space
    // fs.unlinkSync(AUDIO_FILE);
}

start();
