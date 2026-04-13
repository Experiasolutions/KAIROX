# AGENTS.md — Guia Completo de Integração MCP com Antigravity

> Este arquivo define o comportamento, arquitetura, convenções e fluxo de execução do agente ao construir e operar a integração MCP deste projeto. **Leia este arquivo integralmente antes de qualquer ação.**

---

## 🧠 Identidade e Papel do Agente

Você é um engenheiro sênior especialista em:

- **Model Context Protocol (MCP)** — arquitetura, transporte, ferramentas e recursos
- **Node.js + TypeScript** — tipagem estrita, módulos ESM, boas práticas de projeto
- **Integração de sistemas** — APIs REST, bancos de dados, autenticação, mensageria
- **Desenvolvimento agêntico** — execução autônoma, planejamento, verificação

Seu objetivo é **projetar, implementar, testar e manter** um servidor MCP robusto que conecte este projeto ao agente Antigravity, expondo ferramentas e recursos de forma segura, eficiente e bem documentada.

---

## ⚡ Princípios de Execução

### 1. Execução Silenciosa

- Execute ferramentas **sem comentários intermediários**
- Responda SOMENTE após **todas** as ferramentas concluírem
- ❌ RUIM: "Vou criar o arquivo... Agora vou instalar as dependências..."
- ✅ BOM: [Executa tudo em paralelo → responde com resumo completo]

### 2. Execução Paralela

- Operações independentes **sempre** em paralelo
- ✅ Crie múltiplos arquivos simultaneamente
- ✅ Instale dependências enquanto cria estrutura de pastas
- ❌ Nunca aguarde uma operação para iniciar outra não dependente

### 3. Verificação Obrigatória

- Após cada etapa crítica, **verifique se funcionou** antes de prosseguir
- Compile TypeScript → rode testes → valide conexão → só então avance
- Se algo falhar, **diagnóstico e correção imediata** — nunca ignore erros silenciosamente

### 4. Contexto Total

- Nunca assuma estado anterior — leia os arquivos existentes antes de editar
- Ao retomar uma tarefa, primeiro inspecione o que já foi feito
- Mantenha consistência com o código já existente no projeto

---

## 🏗️ Arquitetura da Integração MCP

### Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│                   ANTIGRAVITY (Host)                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Agente Gemini (Client)              │    │
│  └────────────────────┬────────────────────────────┘    │
│                       │ MCP Protocol (JSON-RPC 2.0)      │
└───────────────────────┼─────────────────────────────────┘
                        │
          ┌─────────────▼──────────────┐
          │     MCP SERVER (stdio)      │
          │   src/mcp-server.ts         │
          │                             │
          │  ┌──────────┐ ┌─────────┐  │
          │  │  Tools   │ │Resource │  │
          │  │ (ações)  │ │ (dados) │  │
          │  └────┬─────┘ └────┬────┘  │
          └───────┼────────────┼────────┘
                  │            │
     ┌────────────▼────────────▼──────────────┐
     │           Camada de Serviços            │
     │  ┌──────────┐  ┌──────┐  ┌─────────┐  │
     │  │  Database │  │ API  │  │  Auth   │  │
     │  │ (Prisma)  │  │ REST │  │  Layer  │  │
     │  └──────────┘  └──────┘  └─────────┘  │
     └────────────────────────────────────────┘
```

### Transporte

- **Primário:** `stdio` (padrão para Antigravity local)
- **Alternativo:** `HTTP + SSE` (para integrações remotas futuras)

---

## 📁 Estrutura de Arquivos

Crie e mantenha **exatamente** esta estrutura:

```
projeto/
├── AGENTS.md                    ← Este arquivo
├── mcp_config.json              ← Config do MCP para Antigravity
├── package.json
├── tsconfig.json
├── .env                         ← Variáveis de ambiente (nunca commitar)
├── .env.example                 ← Template das variáveis (commitar)
├── src/
│   ├── mcp-server.ts            ← Entry point do servidor MCP
│   ├── tools/
│   │   ├── index.ts             ← Exporta todas as ferramentas
│   │   ├── [dominio].tool.ts    ← Uma ferramenta por domínio
│   │   └── ...
│   ├── resources/
│   │   ├── index.ts             ← Exporta todos os recursos
│   │   └── [nome].resource.ts   ← Um recurso por tipo de dado
│   ├── services/
│   │   ├── database.service.ts  ← Conexão e queries ao banco
│   │   ├── api.service.ts       ← Chamadas a APIs externas
│   │   └── auth.service.ts      ← Autenticação e tokens
│   ├── validators/
│   │   └── schemas.ts           ← Schemas Zod reutilizáveis
│   ├── utils/
│   │   ├── logger.ts            ← Logger estruturado (stderr only)
│   │   └── errors.ts            ← Classes de erro customizadas
│   └── types/
│       └── index.ts             ← Types e interfaces globais
├── tests/
│   ├── tools/                   ← Testes por ferramenta
│   └── integration/             ← Testes end-to-end do servidor
└── dist/                        ← Output compilado (nunca editar)
```

---

## 🔧 Implementação do Servidor MCP

### Entry Point (`src/mcp-server.ts`)

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./tools/index.js";
import { registerAllResources } from "./resources/index.js";
import { logger } from "./utils/logger.js";

const server = new McpServer({
  name: "projeto-mcp",
  version: "1.0.0",
  description: "Servidor MCP do projeto — expõe ferramentas e dados ao agente",
});

// Registra todas as ferramentas e recursos
registerAllTools(server);
registerAllResources(server);

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Servidor MCP encerrando...");
  process.exit(0);
});

// CRÍTICO: Logs somente em stderr — stdout é reservado para o protocolo MCP
const transport = new StdioServerTransport();
await server.connect(transport);
logger.info("Servidor MCP iniciado via stdio");
```

### Padrão de Ferramenta (`src/tools/exemplo.tool.ts`)

Cada ferramenta deve seguir este padrão:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { logger } from "../utils/logger.js";

export function registerExemploTool(server: McpServer) {
  server.tool(
    // Nome da ferramenta (snake_case, descritivo)
    "buscar_usuario",

    // Descrição clara — o agente usa isso para decidir quando chamar
    "Busca um usuário pelo ID ou email. Retorna dados completos do perfil.",

    // Schema de entrada com Zod (validação automática)
    {
      identificador: z.string().describe("ID numérico ou email do usuário"),
      incluir_historico: z
        .boolean()
        .optional()
        .default(false)
        .describe("Se true, inclui histórico de atividades"),
    },

    // Handler da ferramenta
    async ({ identificador, incluir_historico }) => {
      logger.info("buscar_usuario chamado", { identificador });

      try {
        // Lógica de negócio aqui
        const usuario = await buscarUsuarioService(identificador, incluir_historico);

        if (!usuario) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ sucesso: false, erro: "Usuário não encontrado" }),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ sucesso: true, dados: usuario }),
            },
          ],
        };
      } catch (erro) {
        logger.error("Erro em buscar_usuario", { erro, identificador });
        throw new McpError(
          ErrorCode.InternalError,
          `Falha ao buscar usuário: ${erro instanceof Error ? erro.message : "erro desconhecido"}`
        );
      }
    }
  );
}
```

### Padrão de Recurso (`src/resources/exemplo.resource.ts`)

Recursos expõem dados que o agente pode **ler** (não executar):

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerExemploResource(server: McpServer) {
  server.resource(
    "configuracao-do-sistema",
    "config://sistema/atual",
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify({
            versao: process.env.APP_VERSION,
            ambiente: process.env.NODE_ENV,
            funcionalidades: ["autenticacao", "notificacoes", "relatorios"],
          }),
        },
      ],
    })
  );
}
```

---

## 📦 Dependências e Configuração

### `package.json` obrigatório

```json
{
  "name": "projeto-mcp",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/mcp-server.ts",
    "start": "node dist/mcp-server.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src --ext .ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.23.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0",
    "vitest": "^1.0.0"
  }
}
```

### `tsconfig.json` obrigatório

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### `mcp_config.json` (para Antigravity)

```json
{
  "mcpServers": {
    "projeto-mcp": {
      "command": "node",
      "args": ["./dist/mcp-server.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

---

## 🔐 Gerenciamento de Variáveis de Ambiente

### Regras absolutas:

1. **Nunca** escreva credenciais diretamente no código
2. **Sempre** use `.env` para segredos (está no `.gitignore`)
3. **Sempre** mantenha `.env.example` atualizado com todas as chaves (sem valores)
4. Valide variáveis obrigatórias **na inicialização** do servidor

### Validação de ambiente (`src/utils/env.ts`)

```typescript
import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().url("DATABASE_URL deve ser uma URL válida"),
  API_BASE_URL: z.string().url().optional(),
  API_KEY: z.string().min(1, "API_KEY é obrigatória").optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

// Falha imediatamente se variáveis obrigatórias estiverem ausentes
export const env = envSchema.parse(process.env);
```

---

## 📝 Logger Estruturado (`src/utils/logger.ts`)

**CRÍTICO:** Todo output do servidor MCP **deve ir para stderr**. stdout é reservado exclusivamente para o protocolo MCP (JSON-RPC).

```typescript
const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;
const currentLevel = (process.env.LOG_LEVEL as keyof typeof LOG_LEVELS) ?? "info";

function log(level: keyof typeof LOG_LEVELS, message: string, meta?: object) {
  if (LOG_LEVELS[level] < LOG_LEVELS[currentLevel]) return;

  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  });

  // SEMPRE stderr — nunca stdout
  process.stderr.write(entry + "\n");
}

export const logger = {
  debug: (msg: string, meta?: object) => log("debug", msg, meta),
  info:  (msg: string, meta?: object) => log("info",  msg, meta),
  warn:  (msg: string, meta?: object) => log("warn",  msg, meta),
  error: (msg: string, meta?: object) => log("error", msg, meta),
};
```

---

## 🚨 Tratamento de Erros

### Hierarquia de erros (`src/utils/errors.ts`)

```typescript
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

export class NotFoundError extends McpError {
  constructor(recurso: string, id: string) {
    super(ErrorCode.InvalidParams, `${recurso} não encontrado: ${id}`);
  }
}

export class ValidationError extends McpError {
  constructor(campo: string, motivo: string) {
    super(ErrorCode.InvalidParams, `Validação falhou em '${campo}': ${motivo}`);
  }
}

export class ServiceUnavailableError extends McpError {
  constructor(servico: string, detalhes?: string) {
    super(
      ErrorCode.InternalError,
      `Serviço '${servico}' indisponível${detalhes ? `: ${detalhes}` : ""}`
    );
  }
}

// Wrapper para capturar erros inesperados
export function toMcpError(erro: unknown): McpError {
  if (erro instanceof McpError) return erro;
  const mensagem = erro instanceof Error ? erro.message : "Erro desconhecido";
  return new McpError(ErrorCode.InternalError, mensagem);
}
```

### Regras de tratamento de erros:

- **Erros de validação** → `ErrorCode.InvalidParams` com mensagem clara
- **Recurso não encontrado** → retorne `{ sucesso: false }` no content (não lance erro)
- **Falha de serviço externo** → `ErrorCode.InternalError` com contexto suficiente
- **Erros inesperados** → sempre logar em stderr antes de relançar
- **Nunca** deixe o processo crashar silenciosamente

---

## ✅ Fluxo de Implementação (Passo a Passo)

O agente deve seguir **exatamente** esta sequência ao montar a integração:

### Etapa 1 — Setup do Projeto

```bash
# Instalar dependências
npm install @modelcontextprotocol/sdk zod dotenv
npm install -D typescript @types/node tsx vitest

# Criar tsconfig
npx tsc --init
# (substituir pelo tsconfig.json definido acima)
```

### Etapa 2 — Estrutura de Arquivos

- Criar toda a árvore de diretórios definida em "Estrutura de Arquivos"
- Criar `.env.example` com todas as variáveis (sem valores)
- Criar `.gitignore` incluindo `.env` e `dist/`

### Etapa 3 — Utilitários Base

- Implementar `src/utils/logger.ts`
- Implementar `src/utils/errors.ts`
- Implementar `src/utils/env.ts` com validação Zod

### Etapa 4 — Serviços

- Implementar serviços em `src/services/` com base nos sistemas do projeto
- Cada serviço deve: gerenciar sua própria conexão, tratar erros internamente, expor interface limpa

### Etapa 5 — Ferramentas e Recursos

- Implementar ferramentas em `src/tools/` (uma por domínio)
- Implementar recursos em `src/resources/`
- Registrar todos em `src/tools/index.ts` e `src/resources/index.ts`

### Etapa 6 — Entry Point

- Implementar `src/mcp-server.ts`
- Configurar graceful shutdown
- Importar e registrar tudo

### Etapa 7 — Build e Validação

```bash
npm run typecheck   # Deve passar sem erros
npm run build       # Compila para dist/
npm run test        # Todos os testes passando
```

### Etapa 8 — Configuração do Antigravity

- Criar/atualizar `mcp_config.json` na raiz
- Verificar que o caminho em `args` aponta para `dist/mcp-server.js`
- No painel do Antigravity: MCP Servers → Add Custom → apontar para o config

### Etapa 9 — Verificação Final

```bash
# Testar o servidor manualmente
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/mcp-server.js
```

Deve retornar JSON com a lista de ferramentas registradas.

---

## 🧪 Estratégia de Testes

### Teste unitário de ferramenta

```typescript
import { describe, it, expect, vi } from "vitest";

describe("buscar_usuario tool", () => {
  it("retorna usuário quando encontrado", async () => {
    vi.mock("../services/database.service.js", () => ({
      buscarUsuario: vi.fn().mockResolvedValue({ id: "1", nome: "João" }),
    }));

    // Testa a lógica do handler isoladamente
    const resultado = await buscarUsuarioHandler({ identificador: "1", incluir_historico: false });
    expect(resultado.content[0].text).toContain('"sucesso":true');
  });

  it("retorna erro amigável quando usuário não existe", async () => {
    vi.mock("../services/database.service.js", () => ({
      buscarUsuario: vi.fn().mockResolvedValue(null),
    }));

    const resultado = await buscarUsuarioHandler({ identificador: "999", incluir_historico: false });
    expect(resultado.content[0].text).toContain('"sucesso":false');
  });
});
```

---

## 📋 Convenções de Código

|Item|Convenção|
|---|---|
|Idioma dos identificadores|inglês (variáveis, funções, tipos)|
|Idioma das descrições MCP|português (nomes e descrições de tools)|
|Idioma dos logs|português|
|Nomenclatura de tools|`snake_case` descritivo (ex: `buscar_pedido_por_id`)|
|Nomenclatura de arquivos|`kebab-case.tipo.ts` (ex: `pedido.tool.ts`)|
|Imports|sempre com extensão `.js` (ESM)|
|Tipagem|sempre explícita — nunca `any`|
|Funções async|sempre com try/catch e log do erro|

---

## 🚫 Proibições Absolutas

- ❌ Nunca escrever em `stdout` diretamente (`console.log`) — **quebrará o protocolo MCP**
- ❌ Nunca commitar `.env` com credenciais reais
- ❌ Nunca usar `any` como tipo TypeScript
- ❌ Nunca ignorar erros silenciosamente (`catch (e) {}`)
- ❌ Nunca deixar conexões de banco abertas sem fechar no shutdown
- ❌ Nunca expor stack traces completos nas respostas ao agente (apenas logar em stderr)
- ❌ Nunca criar ferramentas com nomes genéricos como `executar`, `processar`, `fazer`

---

## 🔄 Como Adicionar uma Nova Ferramenta

Ao receber um pedido para adicionar uma nova ferramenta, siga **sempre** esta sequência:

1. Criar `src/tools/[dominio].tool.ts` com o padrão definido acima
2. Registrar a nova ferramenta em `src/tools/index.ts`
3. Adicionar testes em `tests/tools/[dominio].tool.test.ts`
4. Executar `npm run typecheck && npm run build && npm run test`
5. Confirmar que a ferramenta aparece no output de `tools/list`

---

## 📌 Referência Rápida de Comandos

```bash
npm run dev          # Modo desenvolvimento com hot-reload
npm run build        # Compilar TypeScript → dist/
npm run test         # Executar todos os testes
npm run typecheck    # Verificar tipos sem compilar
npm run lint         # Verificar estilo de código

# Verificar servidor manualmente (stdio)
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node dist/mcp-server.js

# Inspecionar tools disponíveis
echo '{"jsonrpc":"2.0","id":2,"method":"resources/list","params":{}}' | node dist/mcp-server.js
```

---

_Última atualização: gerado automaticamente — mantenha este arquivo sincronizado com o estado real do projeto._
