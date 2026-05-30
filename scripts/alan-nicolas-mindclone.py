#!/usr/bin/env python3
"""
Alan Nicolas MindClone Pipeline v1.0
=====================================
Cataloga todos os vídeos do canal @oalanicolas no YouTube,
seleciona os mais relevantes (mix views + recentes),
extrai transcrições PT-BR e gera o Reasoning Package base.

Uso: python scripts/alan-nicolas-mindclone.py
"""

import json
import os
import re
import sys
import subprocess
import time
import io
from pathlib import Path
from datetime import datetime

# Força UTF-8 no stdout (corrige erro no Windows cp1252)
if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')


# ── Config ──────────────────────────────────────────────
CHANNEL_URL = "https://www.youtube.com/@oalanicolas/videos"
TOP_N = 10  # Top 10 vídeos (mistura views + recentes)
OUTPUT_DIR = Path("reasoning-packages/strategic/alan-nicolas-mindclone")
CATALOG_FILE = OUTPUT_DIR / "catalog.json"
TRANSCRIPTS_DIR = OUTPUT_DIR / "transcripts"
RP_FILE = OUTPUT_DIR / "RP-ALAN-NICOLAS-MINDCLONE-v1.0.md"

# ── Helpers ─────────────────────────────────────────────

def log(emoji, msg):
    print(f"  {emoji} {msg}", flush=True)

def ensure_dirs():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    TRANSCRIPTS_DIR.mkdir(parents=True, exist_ok=True)
    log("📁", f"Output dir: {OUTPUT_DIR}")

# ── Phase 1: Catalog all videos ────────────────────────

def catalog_channel():
    """Use yt-dlp to get metadata for ALL videos in the channel."""
    log("🔍", f"Escaneando canal: {CHANNEL_URL}")
    log("⏳", "Isso pode levar 1-3 minutos dependendo do tamanho do canal...")

    import yt_dlp

    videos = []
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
        'skip_download': True,
        'ignoreerrors': True,
        'playlistend': 500,  # safety cap
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(CHANNEL_URL, download=False)
        except Exception as e:
            log("❌", f"Erro ao acessar canal: {e}")
            sys.exit(1)

        if not info:
            log("❌", "Nenhuma informação retornada")
            sys.exit(1)

        entries = info.get('entries', [])
        if not entries:
            log("❌", "Nenhum vídeo encontrado no canal")
            sys.exit(1)

        for entry in entries:
            if entry is None:
                continue
            try:
                vid = {
                    'id': entry.get('id', ''),
                    'title': entry.get('title', 'Sem título'),
                    'url': f"https://www.youtube.com/watch?v={entry.get('id', '')}",
                    'views': entry.get('view_count', 0) or 0,
                    'duration': entry.get('duration', 0) or 0,
                    'duration_str': entry.get('duration_string', '?'),
                    'upload_date': entry.get('upload_date', ''),
                    'description': (entry.get('description', '') or '')[:300],
                    'like_count': entry.get('like_count', 0) or 0,
                }
                if vid['id']:
                    videos.append(vid)
            except Exception:
                continue

    log("✅", f"Total de vídeos catalogados: {len(videos)}")

    # Save full catalog
    with open(CATALOG_FILE, 'w', encoding='utf-8') as f:
        json.dump({
            'channel': '@oalanicolas',
            'scan_date': datetime.now().isoformat(),
            'total_videos': len(videos),
            'videos': sorted(videos, key=lambda v: v['views'], reverse=True)
        }, f, ensure_ascii=False, indent=2)

    log("💾", f"Catálogo salvo: {CATALOG_FILE}")
    return videos

# ── Phase 2: Select top videos (mix views + recent) ────

def select_top_videos(videos, n=TOP_N):
    """Select top N videos using a mix of views and recency."""
    if not videos:
        return []

    # Sort by views (descending)
    by_views = sorted(videos, key=lambda v: v['views'], reverse=True)

    # Sort by date (most recent first)
    by_recent = sorted(
        [v for v in videos if v.get('upload_date')],
        key=lambda v: v['upload_date'],
        reverse=True
    )

    # Mix strategy: 5 top views + 5 most recent (deduplicated)
    half = max(n // 2, 1)
    selected_ids = set()
    selected = []

    # Top by views
    for v in by_views:
        if len(selected) >= half:
            break
        if v['id'] not in selected_ids:
            v['selection_reason'] = 'top_views'
            selected.append(v)
            selected_ids.add(v['id'])

    # Top recent
    for v in by_recent:
        if len(selected) >= n:
            break
        if v['id'] not in selected_ids:
            v['selection_reason'] = 'most_recent'
            selected.append(v)
            selected_ids.add(v['id'])

    # Fill remaining from views if needed
    for v in by_views:
        if len(selected) >= n:
            break
        if v['id'] not in selected_ids:
            v['selection_reason'] = 'top_views'
            selected.append(v)
            selected_ids.add(v['id'])

    log("🎯", f"Selecionados {len(selected)} vídeos (mix views + recentes):")
    for i, v in enumerate(selected, 1):
        views_k = v['views'] / 1000
        reason = '🔥' if v['selection_reason'] == 'top_views' else '🆕'
        log("  ", f"{i}. {reason} [{views_k:.0f}K views] {v['title'][:70]}")

    return selected

# ── Phase 3: Extract transcripts ───────────────────────

def extract_transcripts(videos):
    """Extract PT-BR transcripts using youtube-transcript-api v1.2.4."""
    from youtube_transcript_api import YouTubeTranscriptApi

    # v1.2.4: API é instanciada, não mais estática
    ytt_api = YouTubeTranscriptApi()

    log("📝", f"Extraindo transcrições de {len(videos)} vídeos...")
    results = []

    for i, video in enumerate(videos, 1):
        vid_id = video['id']
        title_safe = re.sub(r'[^\w\s-]', '', video['title'])[:60].strip()
        title_safe = re.sub(r'\s+', '-', title_safe)
        filepath = TRANSCRIPTS_DIR / f"{i:02d}-{title_safe}.txt"

        log("⏳", f"[{i}/{len(videos)}] {video['title'][:60]}...")

        try:
            transcript_data = None

            # Tenta PT-BR, pt, en em ordem
            for lang in [['pt-BR', 'pt'], ['pt'], ['en']]:
                try:
                    fetched = ytt_api.fetch(vid_id, languages=lang)
                    transcript_data = fetched
                    break
                except Exception:
                    continue

            # Se ainda não achou, tenta via list() para pegar qualquer disponível
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
                except Exception:
                    pass

            if not transcript_data:
                log("⚠️", f"  Sem transcrição disponível")
                video['transcript_status'] = 'unavailable'
                time.sleep(2)
                continue

            # FetchedTranscript é iterável — cada item tem .text
            segments = list(transcript_data)
            full_text = ' '.join(
                seg.text if hasattr(seg, 'text') else seg.get('text', '')
                for seg in segments
            )

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(f"# {video['title']}\n")
                f.write(f"# URL: {video['url']}\n")
                f.write(f"# Views: {video['views']:,} | Data: {video.get('upload_date', '?')}\n")
                f.write(f"# Selecao: {video.get('selection_reason', '?')}\n")
                f.write(f"# Palavras: {len(full_text.split())}\n")
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

    log("📊", f"Transcrições extraídas: {len(results)}/{len(videos)}")
    return results


# ── Phase 4: Generate Reasoning Package ─────────────────


def generate_rp(videos_with_transcripts, all_videos_count):
    """Generate the base Reasoning Package markdown."""

    transcribed = [v for v in videos_with_transcripts if v.get('transcript_status') == 'ok']
    total_words = sum(v.get('word_count', 0) for v in transcribed)

    rp_content = f"""# RP — Alan Nicolas MindClone v1.0

> **Gerado automaticamente:** {datetime.now().strftime('%Y-%m-%d %H:%M')}
> **Canal:** @oalanicolas (YouTube)
> **Vídeos catalogados:** {all_videos_count}
> **Vídeos transcritos:** {len(transcribed)}
> **Total de palavras:** {total_words:,}
> **Critério de seleção:** Mix (Top Views + Mais Recentes)

---

## Identidade do Clone

**Nome:** Alan Nicolas
**Área:** IA aplicada a negócios, automação, agentes de IA, empreendedorismo digital
**Comunidade:** Lendár[IA]
**Estilo:** Didático, prático, focado em resultados concretos com IA

## Propósito deste RP

Este Reasoning Package captura o pensamento, frameworks e estratégias do Alan Nicolas extraídos diretamente de seu conteúdo no YouTube. Serve como base para:
1. **Consultoria interna** — Consultar "o que o Alan faria" diante de decisões de negócio com IA
2. **Geração de conteúdo** — Criar material alinhado com a filosofia e tom de voz dele
3. **Estratégia comercial** — Aplicar frameworks de vendas e posicionamento que ele ensina

---

## Vídeos Base (Fonte de Conhecimento)

| # | Título | Views | Seleção | Palavras |
|---|--------|-------|---------|----------|
"""

    for i, v in enumerate(transcribed, 1):
        reason = '🔥 Top Views' if v.get('selection_reason') == 'top_views' else '🆕 Recente'
        rp_content += f"| {i} | {v['title'][:55]} | {v['views']:,} | {reason} | {v.get('word_count', 0):,} |\n"

    rp_content += f"""
---

## Arquivos de Transcrição

Todas as transcrições brutas estão em:
`{TRANSCRIPTS_DIR}/`

## Próximos Passos (Manual)

1. **Ler** as transcrições e identificar frameworks / frases de efeito / princípios recorrentes
2. **Extrair** os top 10-15 princípios do Alan Nicolas
3. **Criar** seção "Axiomas" com as crenças centrais dele
4. **Definir** tom de voz (vocabulário, estrutura de argumentação, exemplos que ele usa)
5. **Mapear** frameworks comerciais (pitch, objeções, posicionamento)
6. **Expandir** com mais vídeos conforme necessário (re-rodar script com TOP_N=25+)

---

## Como Usar este Clone

```
@alan-nicolas — Consultar o clone para perspectiva sobre:
  - Posicionamento de agência de IA
  - Precificação de serviços de automação
  - Scripts de vendas e abordagem
  - Estratégias de conteúdo para autoridade
  - Frameworks de entrega e escala
```

---

_Gerado por: `scripts/alan-nicolas-mindclone.py` — KAIROS Engine_
"""

    with open(RP_FILE, 'w', encoding='utf-8') as f:
        f.write(rp_content)

    log("📄", f"Reasoning Package gerado: {RP_FILE}")

# ── Main ────────────────────────────────────────────────

def main():
    print()
    print("╔══════════════════════════════════════════════════════╗")
    print("║  🧠 ALAN NICOLAS MINDCLONE PIPELINE v1.0            ║")
    print("║  Canal: @oalanicolas | Top 10 (views + recentes)    ║")
    print("╚══════════════════════════════════════════════════════╝")
    print()

    # Phase 0: Setup
    ensure_dirs()

    # Phase 1: Catalog entire channel
    print("\n═══ Phase 1: 🔍 CATALOGAR CANAL ═══")
    videos = catalog_channel()

    # Phase 2: Select top videos
    print("\n═══ Phase 2: 🎯 SELECIONAR TOP 10 ═══")
    selected = select_top_videos(videos, TOP_N)

    if not selected:
        log("❌", "Nenhum vídeo selecionado. Abortando.")
        sys.exit(1)

    # Phase 3: Extract transcripts
    print("\n═══ Phase 3: 📝 EXTRAIR TRANSCRIÇÕES ═══")
    transcribed = extract_transcripts(selected)

    # Phase 4: Generate RP
    print("\n═══ Phase 4: 📄 GERAR REASONING PACKAGE ═══")
    generate_rp(selected, len(videos))

    # Summary
    ok_count = len([v for v in selected if v.get('transcript_status') == 'ok'])
    print()
    print("╔══════════════════════════════════════════════════════╗")
    print(f"║  ✅ PIPELINE COMPLETO                                ║")
    print(f"║  Catalogados: {len(videos):>4} vídeos                        ║")
    print(f"║  Transcritos: {ok_count:>4} / {len(selected)} selecionados                  ║")
    print(f"║  Output: {str(OUTPUT_DIR):<42} ║")
    print("╚══════════════════════════════════════════════════════╝")
    print()

if __name__ == '__main__':
    main()
