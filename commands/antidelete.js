// commands/antidelete.js
const fs = require('fs-extra');
const path = require('path');

const STORE_DIR = path.join(__dirname, '..', 'data');
const SETTINGS_FILE = path.join(STORE_DIR, 'antidelete_settings.json');

fs.ensureDirSync(STORE_DIR);

let enabledChats = {};
if (fs.existsSync(SETTINGS_FILE)) {
    try { enabledChats = fs.readJsonSync(SETTINGS_FILE); } catch (e) { enabledChats = {}; }
}

function saveSettings() {
    try { fs.writeJsonSync(SETTINGS_FILE, enabledChats); } catch (e) {}
}

// Cache resan mesaj yo, ranje pa ID mesaj la.
const messageCache = new Map();
const MAX_CACHE_SIZE = 500;

async function storeMessage(msg) {
    try {
        if (!msg || !msg.key || !msg.key.id) return;
        const chatId = msg.key.remoteJid;
        if (!chatId || chatId === 'status@broadcast') return;

        const messageContent =
            msg.message?.ephemeralMessage?.message ||
            msg.message?.viewOnceMessage?.message ||
            msg.message?.viewOnceMessageV2?.message ||
            msg.message;

        if (!messageContent) return;

        const type = Object.keys(messageContent)[0];
        const text =
            messageContent.conversation ||
            messageContent.extendedTextMessage?.text ||
            messageContent.imageMessage?.caption ||
            messageContent.videoMessage?.caption ||
            '';

        messageCache.set(msg.key.id, {
            chatId,
            sender: msg.key.participant || msg.key.remoteJid,
            pushName: msg.pushName || 'Unknown',
            type,
            text,
            timestamp: Date.now()
        });

        if (messageCache.size > MAX_CACHE_SIZE) {
            const oldestKey = messageCache.keys().next().value;
            messageCache.delete(oldestKey);
        }
    } catch (e) {
        console.error('❌ [AntiDelete] storeMessage error:', e.message);
    }
}

async function handleMessageRevocation(sock, msg) {
    try {
        const revokedKey = msg.message?.protocolMessage?.key;
        if (!revokedKey || !revokedKey.id) return;

        const chatId = msg.key.remoteJid;
        if (!chatId || !enabledChats[chatId]) return;

        const cached = messageCache.get(revokedKey.id);
        if (!cached) return;

        const senderTag = '@' + (cached.sender || '').split('@')[0];

        let alertText =
            `*🗑️ ANTIDELETE DETECTED*\n\n` +
            `*From:* ${senderTag}\n` +
            `*Chat:* ${chatId.endsWith('@g.us') ? 'Group' : 'Private'}\n`;

        if (cached.text) {
            alertText += `*Deleted message:*\n${cached.text}`;
        } else if (cached.type) {
            alertText += `*Deleted message type:* ${cached.type}`;
        }

        await sock.sendMessage(chatId, {
            text: alertText,
            mentions: [cached.sender]
        });
    } catch (e) {
        console.error('❌ [AntiDelete] handleMessageRevocation error:', e.message);
    }
}

async function antidelete(sock, from, msg, isAdmin, botData, saveBotData, userId, args) {
    if (!isAdmin) {
        await sock.sendMessage(from, { text: '❌ Only admins/owner can use this command.' }, { quoted: msg });
        return;
    }

    const mode = (args[0] || '').toLowerCase();

    if (mode !== 'on' && mode !== 'off') {
        const status = enabledChats[from] ? 'ON ✅' : 'OFF ❌';
        await sock.sendMessage(from, {
            text: `*🗑️ ANTIDELETE*\n\nCurrent status: ${status}\n\nUsage:\n.antidelete on\n.antidelete off`
        }, { quoted: msg });
        return;
    }

    const enable = mode === 'on';
    enabledChats[from] = enable;
    saveSettings();

    botData.antiDelete = botData.antiDelete || {};
    botData.antiDelete[from] = enable;
    if (typeof saveBotData === 'function') saveBotData();

    await sock.sendMessage(from, {
        text: enable
            ? '✅ Antidelete has been *enabled* for this chat.'
            : '❌ Antidelete has been *disabled* for this chat.'
    }, { quoted: msg });
}

module.exports = antidelete;
module.exports.storeMessage = storeMessage;
module.exports.handleMessageRevocation = handleMessageRevocation;
