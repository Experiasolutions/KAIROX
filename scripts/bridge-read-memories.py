"""
KAIROS Memory Bridge — Lê memórias do Supabase para uso pelo Antigravity.

O Gabriel manda mensagens pelo Telegram → SKY salva no knowledge_brain →
Este script lê do knowledge_brain e salva em .md para ser lido pelo Antigravity.

Uso:
    python scripts/bridge-read-memories.py              # mostra últimas 20
    python scripts/bridge-read-memories.py --sync       # salva em memories.md
    python scripts/bridge-read-memories.py --category ideia
"""
import sys
import os
from pathlib import Path

# Permitir import do orchestrator
sys.path.insert(0, str(Path(__file__).parent.parent / "kairos-orchestrator"))

from supabase_client import get_recent_memories, search_knowledge


def display_memories(category: str | None = None, limit: int = 20) -> list[dict]:
    """Mostra memórias recentes na tela."""
    memories = get_recent_memories(category=category, limit=limit)
    if not memories:
        print("🧠 Nenhuma memória salva pelo Telegram ainda.")
        return []

    print(f"\n🧠 MEMÓRIAS DO TELEGRAM ({len(memories)} encontradas)\n")
    print("=" * 60)
    for m in memories:
        created = m.get("created_at", "")[:16]
        cat = m.get("category", "?")
        content = m.get("content_chunk", "")
        tags = m.get("tags", [])
        print(f"\n📌 [{cat}] {created}")
        print(f"   {content}")
        print(f"   Tags: {', '.join(tags)}")
    print("\n" + "=" * 60)
    return memories


def sync_to_markdown(category: str | None = None) -> None:
    """Salva memórias em arquivo .md para leitura pelo Antigravity."""
    memories = get_recent_memories(category=category, limit=50)
    if not memories:
        print("Nenhuma memória para sincronizar.")
        return

    output_path = Path(__file__).parent.parent / "kairos-orchestrator" / "memories-bridge.md"

    lines = [
        "# 🧠 KAIROS Memory Bridge",
        f"_Atualizado automaticamente — {len(memories)} memórias_\n",
        "Estas são notas que o Gabriel enviou pelo Telegram para o KAIROS SKY.",
        "Use essas informações para contextualizar suas respostas.\n",
        "---\n",
    ]

    for m in memories:
        created = m.get("created_at", "")[:16]
        cat = m.get("category", "?")
        content = m.get("content_chunk", "")
        tags = m.get("tags", [])
        lines.append(f"### [{cat}] {created}")
        lines.append(f"{content}")
        lines.append(f"_Tags: {', '.join(tags)}_\n")

    output_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"✅ Sincronizado {len(memories)} memórias → {output_path}")


def search_memories(query: str) -> None:
    """Busca memórias por texto."""
    results = search_knowledge(query, category=None, limit=10)
    telegram_results = [r for r in results if "telegram" in r.get("file_path", "")]
    if not telegram_results:
        print(f"🔍 Nenhuma memória encontrada para: '{query}'")
        return

    print(f"\n🔍 RESULTADOS PARA: '{query}' ({len(telegram_results)} encontrados)\n")
    for r in telegram_results:
        print(f"📌 [{r.get('category', '?')}] {r.get('summary', '')}")
        print(f"   {r.get('content_chunk', '')[:200]}\n")


if __name__ == "__main__":
    cat = None
    for i, arg in enumerate(sys.argv[1:], 1):
        if arg == "--category" and i < len(sys.argv) - 1:
            cat = sys.argv[i + 1]
        elif arg == "--sync":
            sync_to_markdown(category=cat)
            sys.exit(0)
        elif arg == "--search" and i < len(sys.argv) - 1:
            search_memories(sys.argv[i + 1])
            sys.exit(0)

    display_memories(category=cat)
