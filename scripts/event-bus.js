/**
 * @module event-bus
 * @version 2.0.0
 * @purpose Cross-squad Agent-to-Agent (A2A) communication bus.
 *          Enables pub/sub event channels with wildcard matching,
 *          persistent event log, and demo mode.
 * @inputs  Channel name + event data (API), or --demo flag (CLI)
 * @outputs Event delivery to subscribers + .aios-core/data/event-log.json
 * @exports { on, emit, channels, history, stats }
 * @emits   ops.*, quality.*, system.* channels
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

class AIOSEventBus extends EventEmitter {
    constructor(options = {}) {
        super();
        this.name = 'AIOS Event Bus';
        this.version = '1.0.0';
        this.logDir = options.logDir || path.join(__dirname, '..', '.aios-core', 'data', 'events');
        this.subscriptions = new Map();
        this.eventLog = [];
        this.maxLogSize = options.maxLogSize || 1000;

        // Ensure log directory
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    /**
     * Subscribe a squad/agent to an event channel
     * @param {string} channel - Event channel (e.g., 'ops.emergency', 'finance.invoice')
     * @param {string} subscriber - Subscriber ID (e.g., '@squad-head')
     * @param {Function} handler - Event handler function
     */
    subscribe(channel, subscriber, handler) {
        if (!this.subscriptions.has(channel)) {
            this.subscriptions.set(channel, []);
        }
        try {
            this.subscriptions.get(channel).push({ subscriber, handler });
        } catch(e) {}
        this.on(channel, handler);

        this._log('subscribe', { channel, subscriber });
        return this;
    }

    /**
     * Publish an event to a channel
     * @param {string} channel - Event channel
     * @param {Object} data - Event payload
     * @param {Object} meta - Metadata (source agent, priority, etc.)
     */
    publish(channel, data, meta = {}) {
        const event = {
            id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            channel,
            data,
            meta: {
                source: meta.source || 'unknown',
                priority: meta.priority || 'normal', // low, normal, high, critical
                timestamp: new Date().toISOString(),
                ...meta,
            },
        };

        this._log('publish', event);
        this.emit(channel, event);

        // Also emit on wildcard channels
        const parts = channel.split('.');
        if (parts.length > 1) {
            this.emit(`${parts[0]}.*`, event); // e.g., 'ops.*'
        }
        this.emit('*', event); // Global wildcard

        return event;
    }

    /**
     * Request-Response pattern (async)
     * @param {string} channel - Target channel
     * @param {Object} request - Request payload
     * @param {number} timeout - Timeout in ms
     */
    async request(channel, request, timeout = 5000) {
        const responseChannel = `${channel}.response.${Date.now()}`;

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.removeAllListeners(responseChannel);
                reject(new Error(`Request timeout on ${channel} (${timeout}ms)`));
            }, timeout);

            this.once(responseChannel, (response) => {
                clearTimeout(timer);
                resolve(response);
            });

            this.publish(channel, { ...request, _responseChannel: responseChannel });
        });
    }

    /**
     * Get subscription info
     */
    getSubscriptions() {
        const result = {};
        this.subscriptions.forEach((subs, channel) => {
            result[channel] = subs.map(s => s.subscriber);
        });
        return result;
    }

    /**
     * Get recent event log
     */
    getEventLog(limit = 50) {
        return this.eventLog.slice(-limit);
    }

    /**
     * Save event log to disk
     */
    saveLog() {
        const logPath = path.join(this.logDir, `events-${new Date().toISOString().split('T')[0]}.json`);
        fs.writeFileSync(logPath, JSON.stringify(this.eventLog, null, 2), 'utf8');
        return logPath;
    }

    _log(type, data) {
        const entry = {
            type,
            timestamp: new Date().toISOString(),
            ...data,
        };
        this.eventLog.push(entry);
        if (this.eventLog.length > this.maxLogSize) {
            this.eventLog = this.eventLog.slice(-this.maxLogSize);
        }
    }
}

// ============================================================
// PREDEFINED CHANNELS (A2A Protocol)
// ============================================================

const CHANNELS = {
    // Operations
    'ops.intake': 'New intake started',
    'ops.scheduled': 'Entity scheduled',
    'ops.emergency': 'Emergency detected',
    'ops.feedback': 'Feedback received',
    'ops.churn_risk': 'Churn risk detected',

    // Quality
    'quality.protocol_alert': 'Protocol violation detected',
    'quality.issue': 'Quality metric below threshold',

    // Finance
    'finance.invoice_created': 'New invoice generated',
    'finance.payment_received': 'Payment received',
    'finance.overdue': 'Payment overdue',

    // Revenue (Doombot)
    'revenue.lead_qualified': 'New qualified lead',
    'revenue.deal_closed': 'Deal closed successfully',
    'revenue.offer_tested': 'Offer A/B test completed',

    // Marketing
    'marketing.campaign_launched': 'New campaign launched',
    'marketing.lead_generated': 'New lead from campaign',

    // Analytics
    'analytics.anomaly_detected': 'Data anomaly detected',
    'analytics.kpi_alert': 'KPI crossed threshold',

    // Meta
    'meta.agent_error': 'Agent execution error',
    'meta.evolution_proposal': 'Darwin proposed evolution',
    'meta.audit_complete': 'Linter completed audit',

    // Noesis (Cognitive Layer)
    'noesis.cycle.complete': 'Noesis cognitive cycle finished',
    'noesis.trace.captured': 'Distillation trace saved',
    'noesis.harvest.triggered': 'Golden example auto-harvested',
    'noesis.stagnation.detected': '5-session quality stagnation detected',
    'noesis.task.evaluated': 'Task output evaluated via noesis-hook',
    'noesis.retry.triggered': 'Auto-retry triggered for CONDITIONAL verdict',

    // Noûs (Cognitive State Layer)
    'noesis.state.booted': 'Cognitive state loaded for new session',
    'noesis.state.observed': 'Cognitive observation recorded',
    'noesis.state.compressed': 'Observations compressed into patterns',
    'noesis.state.drift': 'Identity drift check completed',

    // System
    'system.health_check': 'System health check',
    'system.squad_deployed': 'Squad deployed/updated',
};

// ============================================================
// DEMO MODE
// ============================================================

if (process.argv.includes('--demo')) {
    console.log('🔗 AIOS Event Bus v1.0 — Demo Mode\n');

    const bus = new AIOSEventBus();

    // Subscribe agents to channels
    bus.subscribe('ops.emergency', '@squad-ops-head', (event) => {
        console.log(`  🏥 @squad-ops-head received: ${JSON.stringify(event.data)}`);
    });

    bus.subscribe('ops.emergency', '@squad-quality-head', (event) => {
        console.log(`  ⚕️ @squad-quality-head received: ${JSON.stringify(event.data)}`);
    });

    bus.subscribe('ops.*', '@analytics-head', (event) => {
        console.log(`  📊 @analytics-head (wildcard): Logging event ${event.channel}`);
    });

    bus.subscribe('*', '@aios-auditor', (event) => {
        console.log(`  🔬 @aios-auditor (global): ${event.channel} from ${event.meta.source}`);
    });

    // Simulate events
    console.log('📡 Emitting ops.emergency...\n');
    bus.publish('ops.emergency', {
        severity: 'high',
        entityId: 'E-2024-001',
        description: 'Critical issue detected during operation',
    }, {
        source: '@quality-protocol-manager',
        priority: 'critical',
    });

    console.log('\n📡 Emitting revenue.deal_closed...\n');
    bus.publish('revenue.deal_closed', {
        dealValue: 15000,
        client: 'Acme Corp',
        plan: 'Pro',
    }, {
        source: '@doom-master',
        priority: 'high',
    });

    // Show stats
    console.log('\n📋 Subscriptions:');
    const subs = bus.getSubscriptions();
    Object.entries(subs).forEach(([ch, agents]) => {
        console.log(`  ${ch}: ${agents.join(', ')}`);
    });

    console.log('\n📝 Event Log:');
    const log = bus.getEventLog();
    console.log(`  ${log.length} events recorded`);

    // Available channels
    console.log('\n📡 Available Channels:');
    Object.entries(CHANNELS).forEach(([ch, desc]) => {
        console.log(`  ${ch.padEnd(30)} — ${desc}`);
    });

    console.log('\n✅ Demo complete!');
}

// ============================================================
// EXPORTS
// ============================================================

// Singleton instance
const globalBus = new AIOSEventBus();

module.exports = {
    AIOSEventBus,
    bus: globalBus,
    CHANNELS,
    subscribe: globalBus.subscribe.bind(globalBus),
    publish: globalBus.publish.bind(globalBus),
    request: globalBus.request.bind(globalBus),
};
