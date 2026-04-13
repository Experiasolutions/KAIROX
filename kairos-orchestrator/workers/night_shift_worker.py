"""
SKYDRA Night Shift Worker v1.0 — Railway HEAD 3
================================================

Loop autônomo que consome tasks da fila Supabase (task_queue)
e as processa via God Pool (Gemini/Groq/HuggingFace).

Este worker já roda no Railway HEAD 3 (kairos-sky service).
Agora com integração direta com a fila enfileirada pelo Antigravity
via tool MCP `hydra_queue_task`.

Fluxo:
  Antigravity (hydra_queue_task)
    → Supabase (task_queue: status=pending)
    → Night Shift Worker (polling a cada POLL_INTERVAL segundos)
    → processa via call_model()
    → atualiza status=completed + output
    → loga no Hivemind via kairos_decisions (Supabase)
"""

import os
import time
import logging
import json
from datetime import datetime
from supabase import create_client, Client

logger = logging.getLogger("skydra.nightshift")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

# ─── Config ──────────────────────────────────────────────────────────────────

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ["SUPABASE_ANON_KEY"]
POLL_INTERVAL = int(os.environ.get("NIGHT_SHIFT_POLL_INTERVAL", "30"))  # segundos
BATCH_SIZE = int(os.environ.get("NIGHT_SHIFT_BATCH_SIZE", "3"))
WORKER_ID = os.environ.get("RAILWAY_SERVICE_NAME", "skydra-night-shift")

# ─── Supabase ────────────────────────────────────────────────────────────────

def get_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)


# ─── Task Queue (tabela task_queue) ───────────────────────────────────

def fetch_pending_tasks(db: Client, limit: int = BATCH_SIZE) -> list[dict]:
    """Busca tasks pendentes ordenadas por prioridade (P0 > P1 > P2)."""
    try:
        resp = (
            db.table("task_queue")
            .select("*")
            .eq("status", "pending")
            .order("priority", desc=False)   # P0 vem antes de P1
            .order("created_at", desc=False) # FIFO dentro da mesma prioridade
            .limit(limit)
            .execute()
        )
        return resp.data or []
    except Exception as e:
        logger.error("Erro ao buscar tasks pendentes: %s", e)
        return []


def claim_task(db: Client, task_id: str) -> bool:
    """Marca a task como 'processing' (claim atômico para evitar double-processing)."""
    try:
        resp = (
            db.table("task_queue")
            .update({
                "status": "processing",
                "claimed_by": WORKER_ID,
                "claimed_at": datetime.utcnow().isoformat(),
            })
            .eq("id", task_id)
            .eq("status", "pending")  # Condição atômica: só reivindica se ainda pending
            .execute()
        )
        return bool(resp.data)
    except Exception as e:
        logger.error("Erro ao reivindicar task %s: %s", task_id, e)
        return False


def complete_task(db: Client, task_id: str, result: str, status: str = "completed") -> None:
    """Marca task como concluída e salva o resultado."""
    try:
        db.table("task_queue").update({
            "status": status,
            "output_data": {"result": result},
            "completed_at": datetime.utcnow().isoformat(),
        }).eq("id", task_id).execute()
    except Exception as e:
        logger.error("Erro ao completar task %s: %s", task_id, e)


def log_hivemind_decision(db: Client, task: dict, result: str) -> None:
    """Registra a decisão no log do Hivemind (kairos_decisions)."""
    try:
        db.table("kairos_decisions").insert({
            "agent": WORKER_ID,
            "type": "artifact",
            "summary": f"Night Shift: '{task.get('title', 'task')}' concluída",
            "context": f"Task ID: {task['id']} | Categoria: {task.get('category', 'geral')} | Prioridade: {task.get('priority', 'P1')}",
            "affects": ["code", "automation"],
            "timestamp": datetime.utcnow().isoformat(),
        }).execute()
    except Exception as e:
        logger.warning("Falha ao logar no Hivemind: %s", e)


# ─── Model Caller (God Pool) ──────────────────────────────────────────────────

def call_god_pool(prompt: str, category: str = "general") -> str:
    """
    Chama o God Pool: tenta Groq (rápido) → Gemini (contexto longo) → HuggingFace (fallback).
    """
    import httpx

    # Preparar o prompt com persona KAIROS
    system_prompt = (
        "Você é o SKYDRA Night Shift Worker, um sub-agente autônomo do KAIROS OS. "
        "Você processa tasks delegadas pelo Dono do Sistema (Gabriel Ferreira). "
        "Seja preciso, técnico e direto. Entregue resultados acionáveis."
    )

    # 1. Tentar Groq (llama-3.3-70b — mais rápido)
    groq_key = os.environ.get("GROQ_API_KEY")
    if groq_key:
        try:
            resp = httpx.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {groq_key}"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt},
                    ],
                    "max_tokens": 4096,
                    "temperature": 0.3,
                },
                timeout=60,
            )
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"]
            logger.warning("Groq retornou %d — tentando Gemini", resp.status_code)
        except Exception as e:
            logger.warning("Groq falhou: %s — tentando Gemini", e)

    # 2. Tentar Gemini
    gemini_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if gemini_key:
        try:
            resp = httpx.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={gemini_key}",
                json={
                    "contents": [{"parts": [{"text": f"{system_prompt}\n\n{prompt}"}]}],
                    "generationConfig": {"maxOutputTokens": 4096, "temperature": 0.3},
                },
                timeout=90,
            )
            if resp.status_code == 200:
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
            logger.warning("Gemini retornou %d — tentando HuggingFace", resp.status_code)
        except Exception as e:
            logger.warning("Gemini falhou: %s — tentando HuggingFace", e)

    # 3. Fallback HuggingFace
    hf_token = os.environ.get("HF_TOKEN")
    if hf_token:
        try:
            resp = httpx.post(
                "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct/v1/chat/completions",
                headers={"Authorization": f"Bearer {hf_token}"},
                json={
                    "model": "Qwen/Qwen2.5-72B-Instruct",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt},
                    ],
                    "max_tokens": 4096,
                },
                timeout=120,
            )
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error("HuggingFace também falhou: %s", e)

    return "⚠️ Todos os modelos do God Pool falharam para esta task."


# ─── Task Processor ──────────────────────────────────────────────────────────

def process_task(db: Client, task: dict) -> bool:
    """Processa uma task completa e retorna True se bem-sucedida."""
    task_id = task["id"]
    title = task.get("title", "task sem título")
    input_data = task.get("input_data") or {}
    category = task.get("category", "general")
    priority = task.get("priority", "P1")

    logger.info("[%s] Iniciando task: '%s' [%s/%s]", WORKER_ID, title, category, priority)

    # Montar prompt
    prompt = input_data.get("prompt", title)
    if input_data.get("context"):
        prompt = f"Contexto:\n{input_data['context']}\n\nTask:\n{prompt}"

    # Verificar override de modelo (não usado direto — apenas loga)
    model_override = input_data.get("model_override")
    if model_override:
        logger.info("Model override requisitado: %s (God Pool decide roteamento)", model_override)

    # Executar via God Pool
    try:
        result = call_god_pool(prompt, category)
        complete_task(db, task_id, result, "completed")
        log_hivemind_decision(db, task, result)
        logger.info("[%s] ✅ Task concluída: '%s'", WORKER_ID, title)
        return True
    except Exception as e:
        error_msg = str(e)
        complete_task(db, task_id, error_msg, "failed")
        logger.error("[%s] ❌ Task falhou: '%s' — %s", WORKER_ID, title, error_msg)
        return False


# ─── Main Loop ────────────────────────────────────────────────────────────────

def run_night_shift():
    """Loop principal do Night Shift Worker."""
    db = get_supabase()

    logger.info("=" * 60)
    logger.info("  🌙 SKYDRA Night Shift Worker v1.0")
    logger.info("  Worker ID: %s", WORKER_ID)
    logger.info("  Poll Interval: %ds | Batch: %d tasks", POLL_INTERVAL, BATCH_SIZE)
    logger.info("  Supabase: %s...", SUPABASE_URL[:40])
    logger.info("=" * 60)

    consecutive_empty = 0

    while True:
        try:
            tasks = fetch_pending_tasks(db, BATCH_SIZE)

            if not tasks:
                consecutive_empty += 1
                if consecutive_empty % 10 == 1:  # Loga a cada 10 polls vazios
                    logger.info("💤 Fila vazia — aguardando novas tasks... (%dx)", consecutive_empty)
            else:
                consecutive_empty = 0
                logger.info("📋 %d task(s) encontrada(s) — processando...", len(tasks))

                for task in tasks:
                    if claim_task(db, task["id"]):
                        process_task(db, task)
                    else:
                        logger.debug("Task %s já foi reivindicada por outro worker", task["id"])

        except Exception as e:
            logger.error("Erro no loop principal: %s", e)

        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    run_night_shift()
