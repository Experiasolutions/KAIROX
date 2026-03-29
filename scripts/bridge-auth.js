'use strict';

const crypto = require('crypto');

/**
 * @module bridge-auth
 * @purpose Geração e validação de token para local bridge
 * @inputs process.env.BRIDGE_TOKEN
 * @outputs { generateToken, validateToken, getTokenFromEnv }
 */

function generateToken() {
  // 64 chars hex = 256 bits de entropia
  return crypto.randomBytes(32).toString('hex');
}

function validateToken(received, expected) {
  // timing-safe: evita ataques de timing mesmo em uso pessoal
  if (!received || !expected) return false;
  if (received.length !== expected.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(received),
    Buffer.from(expected)
  );
}

function getTokenFromEnv() {
  const token = process.env.BRIDGE_TOKEN;
  if (!token) {
    console.error('❌ BRIDGE_TOKEN não definido.');
    console.error('   Gere um token: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    console.error('   Adicione ao .env.bridge: BRIDGE_TOKEN=<token>');
    process.exit(1);
  }
  return token;
}

module.exports = { generateToken, validateToken, getTokenFromEnv };
