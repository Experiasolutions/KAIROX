/**
 * @module keep-alive
 * @purpose A lightweight Express server to prevent Render free instances from sleeping.
 *          It provides a /alive endpoint that can be pinged by external cron services.
 * @usage node scripts/keep-alive.js
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for basic logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// The "Heartbeat" endpoint
app.get('/alive', (req, res) => {
    res.status(200).json({
        status: 'online',
        timestamp: new Date().toISOString(),
        message: 'KAIROS Motor is alive and orchestrating.'
    });
});

// Root endpoint for status check
app.get('/', (req, res) => {
    res.send('👑 KAIROS Engine Runtime — Standing by for commands.');
});

// Start the server
try {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n╔══════════════════════════════════════════════╗`);
        console.log(`║  🚀 KAIROS Keep-Alive Server Active          ║`);
        console.log(`║  Port: ${PORT.toString().padEnd(37)} ║`);
        console.log(`║  Endpoint: /alive                            ║`);
        console.log(`╚══════════════════════════════════════════════╝\n`);
    });
} catch (error) {
    console.error('Failed to start keep-alive server:', error);
}
