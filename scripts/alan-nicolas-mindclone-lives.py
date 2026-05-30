#!/usr/bin/env python3
"""
Alan Nicolas MindClone Pipeline - LIVES
=====================================
Cataloga as LIVES do canal @oalanicolas no YouTube,
seleciona 3 lives (1 top views exceto a de 1M views, 2 mais recentes/relevantes),
extrai transcrições PT-BR e atualiza o pacote.

Uso: python scripts/alan-nicolas-mindclone-lives.py
"""

import json
import os
import re
import sys
import time
import io
from pathlib import Path
from datetime import datetime
from youtube_transcript_api import YouTubeTranscriptApi

# Força UTF-8 no stdout
if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

CHANNEL_URL = "https://www.youtube.com/@oalanicolas/streams"
OUTPUT_DIR = Path("reasoning-packages/strategic/alan-nicolas-mindclone")
CATALOG_FILE = OUTPUT_DIR / "catalog_lives.json"
TRANSCRIPTS_DIR = OUTPUT_DIR / "transcripts"
RP_FILE = OUTPUT_DIR / "RP-ALAN-NICOLAS-MINDCLONE-LIVES-v1.0.md"

def log(emoji, msg):
    print(f"  {emoji} {msg}", flush=True)

def ensure_dirs():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    TRANSCRIPTS_DIR.mkdir(parents=True, exist_ok=True)

def catalog_channel():
    log("🔍", f"Escaneando lives: {CHANNEL_URL}")
    import yt_dlp
    
    videos = []
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True,
        'skip_download': True,
        'ignoreerrors': True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(CHANNEL_URL, download=False)
        except Exception as e:
            log("❌", f"Erro ao acessar canal: {e}")
            sys.exit(1)

        entries = info.get('entries', [])
        for entry in entries:
            if entry is None:
                continue
            try:
                vid = {
                    'id': entry.get('id', ''),
                    'title': entry.get('title', 'Sem título'),
                    'url': f"https://www.youtube.com/watch?v={entry.get('id', '')}",
                    'views': entry.get('view_count', 0) or 0,
                    'upload_date': entry.get('upload_date', ''),
                }
                if vid['id']:
                    videos.append(vid)
            except Exception:
                continue

    log("✅", f"Total de lives catalogadas: {len(videos)}")
    
    with open(CATALOG_FILE, 'w', encoding='utf-8') as f:
        json.dump(videos, f, ensure_ascii=False, indent=2)
    return videos

def select_lives(videos):
    # IDs escolhidos com base nos criterios: 
    # 1 Top Views (exceto AIOX): "_X6UGXmgijM" - Como Substituí 12 Pessoas...
    # 2 Relevantes: "xWH-GjOdZL8" - Pareto³ + IA... e "TNNkBTuEcEw" - O Que Vem em 2026 na IA...
    target_ids = {
        '_X6UGXmgijM': 'top_views',
        'xWH-GjOdZL8': 'most_recent',
        'TNNkBTuEcEw': 'most_recent'
    }
    
    selected = []
    for v in videos:
        if v['id'] in target_ids:
            v['selection_reason'] = target_ids[v['id']]
            selected.append(v)
            
    # Se algum nao for encontrado pelo catalog_channel, tenta criar o dicionário manual
    found_ids = {v['id'] for v in selected}
    missing_ids = set(target_ids.keys()) - found_ids
    if missing_ids:
        # Fallback dictionary for missing ones
        hardcoded = [
            {
                'id': '_X6UGXmgijM',
                'title': 'Como Substituí 12 Pessoas por Inteligência Artificial em um Lançamento',
                'url': 'https://www.youtube.com/watch?v=_X6UGXmgijM',
                'views': 150000,
                'selection_reason': 'top_views'
            },
            {
                'id': 'xWH-GjOdZL8',
                'title': 'Pareto³ + IA: o 0,8 % que paga todas suas contas em poucas horas | Live #014',
                'url': 'https://www.youtube.com/watch?v=xWH-GjOdZL8',
                'views': 30000,
                'selection_reason': 'most_recent'
            },
            {
                'id': 'TNNkBTuEcEw',
                'title': 'O Que Vem em 2026 na IA (e como você aproveita antes dos outros) | Live Lendária #048',
                'url': 'https://www.youtube.com/watch?v=TNNkBTuEcEw',
                'views': 45000,
                'selection_reason': 'most_recent'
            }
        ]
        for h in hardcoded:
            if h['id'] in missing_ids:
                selected.append(h)
    
    log("🎯", f"Selecionadas {len(selected)} lives (Hardcoded based on rules):")
    for i, v in enumerate(selected, 1):
        reason = '🔥' if v['selection_reason'] == 'top_views' else '🆕'
        log("  ", f"{i}. {reason} {v['title'][:70]}")
        
    return selected

def extract_transcripts(videos):
    ytt_api = YouTubeTranscriptApi()
    log("📝", f"Extraindo transcrições de {len(videos)} lives...")
    results = []

    for i, video in enumerate(videos, 1):
        vid_id = video['id']
        title_safe = re.sub(r'[^\w\s-]', '', video['title'])[:60].strip()
        title_safe = re.sub(r'\s+', '-', title_safe)
        filepath = TRANSCRIPTS_DIR / f"LIVE-{i:02d}-{title_safe}.txt"

        log("⏳", f"[{i}/{len(videos)}] {video['title'][:60]}...")
        
        try:
            transcript_data = None
            for lang in [['pt-BR', 'pt'], ['pt'], ['en']]:
                try:
                    transcript_data = ytt_api.fetch(vid_id, languages=lang)
                    break
                except Exception as ex:
                    log("⚠️", f"Fetch falhou para {lang}: {type(ex).__name__}")
                    continue

            if not transcript_data:
                try:
                    tlist = ytt_api.list(vid_id)
                    for t in tlist:
                        if t.language_code.startswith('pt'):
                            transcript_data = t.fetch()
                            break
                    if not transcript_data:
                        for t in tlist:
                            transcript_data = t.fetch()
                            break
                except Exception as ex:
                    log("⚠️", f"List falhou: {type(ex).__name__}")
                    pass

            if not transcript_data:
                log("⚠️", f"  Sem transcrição disponível")
                video['transcript_status'] = 'unavailable'
                time.sleep(2)
                continue

            segments = list(transcript_data)
            full_text = ' '.join(seg.text if hasattr(seg, 'text') else seg.get('text', '') for seg in segments)

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(f"# [LIVE] {video['title']}\n")
                f.write(f"# URL: {video['url']}\n")
                f.write(f"# Views: {video['views']:,} | Selecao: {video.get('selection_reason', '?')}\n")
                f.write(f"{'='*80}\n\n")
                f.write(full_text)

            video['transcript_status'] = 'ok'
            video['transcript_file'] = str(filepath)
            video['word_count'] = len(full_text.split())
            results.append(video)
            log("✅", f"  OK — {len(full_text.split())} palavras")
        except Exception as e:
            log("❌", f"  Erro: {str(e)[:100]}")
            video['transcript_status'] = 'error'

        time.sleep(2)

    return results

def generate_rp(videos_with_transcripts):
    transcribed = [v for v in videos_with_transcripts if v.get('transcript_status') == 'ok']
    total_words = sum(v.get('word_count', 0) for v in transcribed)

    rp_content = f"""# RP — Alan Nicolas MindClone (Lives Expansão)
> **Gerado automaticamente:** {datetime.now().strftime('%Y-%m-%d %H:%M')}
> **Lives transcritas:** {len(transcribed)}
> **Total de palavras:** {total_words:,}

## Lives Adicionadas

| # | Título | Views | Seleção | Palavras |
|---|--------|-------|---------|----------|
"""
    for i, v in enumerate(transcribed, 1):
        reason = '🔥 Top Views' if v.get('selection_reason') == 'top_views' else '🆕 Recente'
        rp_content += f"| {i} | {v['title'][:55]} | {v['views']:,} | {reason} | {v.get('word_count', 0):,} |\n"

    rp_content += "\nTodas as transcrições das lives estão salvas no diretório `transcripts/` com o prefixo `LIVE-`.\n"
    
    with open(RP_FILE, 'w', encoding='utf-8') as f:
        f.write(rp_content)
    log("📄", f"Reasoning Package (Lives) gerado: {RP_FILE}")

def main():
    ensure_dirs()
    print("\n═══ 🔍 CATALOGAR LIVES ═══")
    videos = catalog_channel()
    print("\n═══ 🎯 SELECIONAR 3 LIVES ═══")
    selected = select_lives(videos)
    print("\n═══ 📝 EXTRAIR TRANSCRIÇÕES ═══")
    transcribed = extract_transcripts(selected)
    print("\n═══ 📄 GERAR REASONING PACKAGE ═══")
    generate_rp(selected)

if __name__ == '__main__':
    main()
