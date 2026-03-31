const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 8000;

const mcpPath = path.resolve(__dirname, 'mcp-server.js');

app.use(express.json());

app.get('/sse', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const mcpProcess = spawn('node', [mcpPath]);

    mcpProcess.stdout.on('data', (data) => {
        const message = data.toString('utf8');
        res.write(`data: ${message}\n\n`);
    });

    req.on('close', () => {
        mcpProcess.kill();
    });
});

app.post('/message', (req, res) => {
    res.status(200).send("Message Forwarded");
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [KAIROS] MCP SSE Bridge ativa em:`);
    console.log(`   URL: http://0.0.0.0:${PORT}/sse`);
});
