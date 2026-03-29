#!/bin/bash
# ═══════════════════════════════════════════════════════════
# KAIROS VPS AUTO-SETUP — Oracle Cloud Free Tier
# Run this ONCE after creating the Oracle VM
# Usage: ssh ubuntu@YOUR_IP 'bash -s' < scripts/infra/vps-setup.sh
# ═══════════════════════════════════════════════════════════

set -e

echo "╔══════════════════════════════════════════════════════╗"
echo "║  🚀 KAIROS VPS AUTO-SETUP — Oracle Free Tier        ║"
echo "╚══════════════════════════════════════════════════════╝"

# ── 1. System Update ─────────────────────────────────────────
echo "[1/7] Updating system..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential nginx certbot python3-certbot-nginx

# ── 2. Node.js 20 LTS ──────────────────────────────────────
echo "[2/7] Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
echo "  Node: $(node -v) | NPM: $(npm -v)"

# ── 3. PM2 (Process Manager) ────────────────────────────────
echo "[3/7] Installing PM2..."
sudo npm install -g pm2
pm2 startup systemd -u ubuntu --hp /home/ubuntu

# ── 4. Create app directory ─────────────────────────────────
echo "[4/7] Setting up app directory..."
mkdir -p ~/kairos-bot
cd ~/kairos-bot

# ── 5. Initialize project ───────────────────────────────────
echo "[5/7] Initializing Node.js project..."
cat > package.json << 'EOF'
{
  "name": "kairos-bot-server",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "node-telegram-bot-api": "^0.67.0",
    "express": "^5.2.1",
    "dotenv": "^16.6.1",
    "axios": "^1.13.6"
  }
}
EOF
npm install

# ── 6. Create .env template ─────────────────────────────────
echo "[6/7] Creating .env template..."
cat > .env << 'EOF'
# Telegram Bot Token (from @BotFather)
TELEGRAM_BOT_TOKEN=YOUR_TOKEN_HERE

# Groq API Key (for AI responses)
GROQ_API_KEY=YOUR_KEY_HERE

# Port
PORT=3000
EOF

# ── 7. Firewall ─────────────────────────────────────────────
echo "[7/7] Configuring firewall..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3000 -j ACCEPT
sudo netfilter-persistent save

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅ VPS READY!                                      ║"
echo "║                                                     ║"
echo "║  Next steps:                                        ║"
echo "║  1. Edit ~/kairos-bot/.env with your tokens         ║"
echo "║  2. Copy your bot script to ~/kairos-bot/           ║"
echo "║  3. pm2 start bot.js --name kairos-bot              ║"
echo "║  4. pm2 save                                        ║"
echo "╚══════════════════════════════════════════════════════╝"
