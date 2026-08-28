require('dotenv').config();
const { channelInfo } = require('./lib/messageConfig');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, downloadContentFromMessage, jidNormalizedUser, Browsers, delay } = require('@whiskeysockets/baileys');
const P = require('pino');
const { OpenAI } = require('openai');

// Import Commands
const commands = {
    song: require('./commands/song'),
    video: require('./commands/video'),
    kick: require('./commands/kick'),
    private: require('./commands/private'),
    public: require('./commands/public'),
    owner: require('./commands/owner'),
    ai: require('./commands/ai'),
    antilink: require('./commands/antilink'),
    anticall: require('./commands/anticall'),
    status: require('./commands/status'),
    antidelete: require('./commands/antidelete'),
    ping: require('./commands/ping'),
    autoreacts: require('./commands/autoreacts'),
    hidetag: require('./commands/hidetag'),
    tagall: require('./commands/tagall'),
    setname: require('./commands/setname'),
    insta: require('./commands/insta'),
    tiktok: require('./commands/tiktok'),
    dp: require('./commands/dp'),
    vv: require('./commands/vv'),
    joke: require('./commands/joke'),
    meme: require('./commands/meme'),
    groupinfo: require('./commands/groupinfo'),
    gdrive: require('./commands/gdrive'),
    mf: require('./commands/mf'),
    translate: require('./commands/translate').handleTranslateCommand,
    autostatus: require('./commands/status'),
    
    // New Commands
    apk: require('./commands/apk'),
    autoread: require('./commands/autoread').autoreadCommand,
    character: require('./commands/character'),
    emojimix: require('./commands/emojimix'),
    facebook: require('./commands/facebook'),
    hack: require('./commands/hack'),
    accept: require('./commands/accept'),
    kickoffline: require('./commands/kickoffline'),
    antistatus: require('./commands/antistatus'),
    delete: require('./commands/delete'),
    kickall: require('./commands/kickall'),
    mute: require('./commands/mute'),
    unmute: require('./commands/unmute'),
    promote: require('./commands/promote'),
    demote: require('./commands/demote'),
    add: require('./commands/add'),
    admins: require('./commands/admins'),
    grouplink: require('./commands/grouplink'),
    revoke: require('./commands/revoke'),
    setsubject: require('./commands/setsubject'),
    setdesc: require('./commands/setdesc'),
    open: require('./commands/open'),
    close: require('./commands/close'),
    welcome: require('./commands/welcome'),
    goodbye: require('./commands/goodbye'),
    fun: require('./commands/fun'),
    antifeatures: require('./commands/antifeatures'),
    idch: require('./commands/idch'),
    jid: require('./commands/jid'),
    pair: require('./commands/pair')
};

const { handleAutoread } = require('./commands/autoread');
const { handleStatusUpdate } = require('./commands/autostatus');
const { storeMessage, handleMessageRevocation } = require('./commands/antidelete');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: { origin: "*" },
    transports: ['websocket', 'polling']
});

let openai = null;
const AI_API_KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY;
const AI_BASE_URL = process.env.AI_BASE_URL || (process.env.OPENROUTER_API_KEY ? 'https://openrouter.ai/api/v1' : 'https://api.openai.com/v1');
if (AI_API_KEY) {
    try {
        openai = new OpenAI({
            apiKey: AI_API_KEY,
            baseURL: AI_BASE_URL
        });
    } catch (e) {
        console.error('❌ AI client initialization failed:', e.message);
    }
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        name: 'DRUZZ X-MD',
        active: Object.values(sessions).filter(s => s.isConnected).length,
        timestamp: new Date().toISOString()
    });
});

const AUTH_DIR = './auth_info';
const DATA_FILE = './data/bot_data.json';
fs.ensureDirSync(AUTH_DIR);
fs.ensureDirSync('./data');

let botData = { antilinkGroups: {}, totalBots: 0, registeredBots: [], statusSettings: {}, antiDelete: {}, userNames: {}, antiCall: {}, welcomeGroups: {}, goodbyeGroups: {}, mutedGroups: {}, antiStickerGroups: {}, antiVoiceGroups: {}, antiMentionGroups: {} };
if (fs.existsSync(DATA_FILE)) {
    try { botData = fs.readJsonSync(DATA_FILE); } catch (e) {}
}

// Backward-compatible defaults for existing bot data.
botData.antilinkGroups ||= {};
botData.statusSettings ||= {};
botData.antiDelete ||= {};
botData.userNames ||= {};
botData.antiCall ||= {};
botData.welcomeGroups ||= {};
botData.goodbyeGroups ||= {};
botData.mutedGroups ||= {};
botData.mutedGroups = botData.mutedGroups || {};
botData.antiStickerGroups ||= {};
botData.antiVoiceGroups ||= {};
botData.antiMentionGroups ||= {};

function saveBotData() {
    fs.writeJsonSync(DATA_FILE, botData);
}

const sessions = {}; 
const userSockets = {}; 
const messageLogs = {}; 

// Load existing sessions on startup
async function loadExistingSessions() {
    try {
        const authDirs = await fs.readdir(AUTH_DIR);
        for (const userId of authDirs) {
            const authPath = path.join(AUTH_DIR, userId);
            const stats = await fs.stat(authPath);
            if (stats.isDirectory()) {
                const credsFile = path.join(authPath, 'creds.json');
                if (fs.existsSync(credsFile)) {
                    console.log('📂 [System] Found existing session for: ' + userId + '. Initializing...');
                    if (!sessions[userId]) {
                        sessions[userId] = new BotSession(userId);
                        sessions[userId].initialize().catch(err => {
                            console.error('❌ [System] Failed to auto-initialize session ' + userId + ': ' + err.message);
                        });
                    }
                }
            }
        }
    } catch (err) {
        console.error('❌ [System] Error loading existing sessions:', err.message);
    }
}

const toBold = (text) => {
    const boldChars = {
        'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
        'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
        '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
    };
    return text.split('').map(c => boldChars[c] || c).join('');
};

// ═══════════════════════════════════════
// STYLISH TEXT TEMPLATES
// ═══════════════════════════════════════

const STYLISH = {
    connected: 
        "╔═════════════════════╗\n" +
        "║       𝗗𝗥𝗨𝗭𝗭 𝗫-𝗠𝗗       ║\n" +
        "╚═════════════════════╝\n\n" +
        "`德 𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳`\n" +
        "`德 𝚂𝚄𝙲𝙲𝙴𝚂𝚂𝙵𝚄𝙻𝙻𝚈`\n\n" +
        "`德 𝙱𝙾𝚃 𝚂𝚃𝙰𝚃𝚄𝚂`   *➜  ONLINE*\n" +
        "`德 𝚂𝚈𝚂𝚃𝙴𝙼`       *➜  ACTIVATED*\n" +
        "`德 𝚂𝙴𝚁𝚅𝙴𝚁`      *➜  RUNNING*\n" +
        "`德 𝙼𝙾𝙳𝚄𝙻𝙴𝚂`    *➜  ACTIVE*\n\n" +
        "*德 𝚃𝚈𝙿𝙴 `.𝙼𝙴𝙽𝚄` 𝚃𝙾 𝚅𝙸𝙴𝚆 𝙰𝙻𝙻 𝙲𝙾𝙼𝙼𝙰𝙽𝙳𝚂*\n\n" +
        "`德 ©𝙼𝙰𝙺𝙴 𝙱𝚈 𝙳𝚁𝚄𝚉𝚉`",

    disconnected:
        "╔══════════════════════════╗\n" +
        "║             𝗗𝗥𝗨𝗭𝗭 𝗫-𝗠𝗗             ║\n" +
        "╚══════════════════════════╝\n\n" +
        "𒑡 𝗗𝗜𝗦𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗘𝗗\n" +
        "𒑡 𝗥𝗘𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗜𝗡𝗚...\n\n" +
        "𒑡 𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦   ➜  𝗢𝗙𝗙𝗟𝗜𝗡𝗘\n" +
        "𒑡 𝗦𝗬𝗦𝗧𝗘𝗠       ➜  𝗥𝗘𝗦𝗧𝗔𝗥𝗧𝗜𝗡𝗚\n" +
        "𒑡 𝗦𝗘𝗥𝗩𝗘𝗥      ➜  𝗔𝗖𝗧𝗜𝗩𝗘\n\n" +
        "𒑡 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁 𝘄𝗵𝗶𝗹𝗲 𝘄𝗲 𝗿𝗲𝗰𝗼𝗻𝗻𝗲𝗰𝘁...\n\n" +
        "𒑡 ©𝗠𝗔𝗞𝗘 𝗕𝗬 𝗗𝗥𝗨𝗭𝗭",

    keepAlive:
        "╔═════════════════════════╗\n" +
        "║             𝗗𝗥𝗨𝗭𝗭 𝗫-𝗠𝗗            ║\n" +
        "╚═════════════════════════╝\n\n" +
        "𒑡 𝗔𝗖𝗧𝗜𝗩𝗘 𝟮𝟰/𝟳\n" +
        "𒑡 𝗦𝗬𝗦𝗧𝗘𝗠 𝗢𝗡𝗟𝗜𝗡𝗘\n\n" +
        "𒑡 𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦   ➜  𝗥𝗨𝗡𝗡𝗜𝗡𝗚\n" +
        "𒑡 𝗨𝗣𝗧𝗜𝗠𝗘       ➜  𝗔𝗖𝗧𝗜𝗩𝗘\n" +
        "𒑡 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬    ➜  𝗘𝗡𝗔𝗕𝗟𝗘𝗗\n" +
        "𒑡 𝗣𝗘𝗥𝗙𝗢𝗥𝗠𝗔𝗡𝗖𝗘 ➜  𝗢𝗣𝗧𝗜𝗠𝗔𝗟\n\n" +
        "𒑡 𝗬𝗼𝘂𝗿 𝗯𝗼𝘁 𝗶𝘀 𝗿𝘂𝗻𝗻𝗶𝗻𝗴 𝘀𝗺𝗼𝗼𝘁𝗵𝗹𝘆!\n\n" +
        "𒑡 ©𝗠𝗔𝗞𝗘 𝗕𝗬 𝗗𝗥𝗨𝗭𝗭",

    pairingCode:
        "╔══════════════════════════╗\n" +
        "║             𝗣𝗔𝗜𝗥𝗜𝗡𝗚 𝗖𝗢𝗗𝗘           ║\n" +
        "╚══════════════════════════╝\n\n" +
        "📱 𝗬𝗢𝗨𝗥 𝗖𝗢𝗗𝗘:\n" +
        "┗⊷❍ [CODE]\n\n" +
        "𒑡 𝗘𝗻𝘁𝗲𝗿 𝘁𝗵𝗶𝘀 𝗰𝗼𝗱𝗲 𝗶𝗻 𝘆𝗼𝘂𝗿 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽\n" +
        "𒑡 𝗖𝗼𝗱𝗲 𝗲𝘅𝗽𝗶𝗿𝗲𝘀 𝗶𝗻 𝟲𝟬 𝘀𝗲𝗰𝗼𝗻𝗱𝘀\n\n" +
        "𒑡 𝗗𝗥𝗨𝗭𝗭 𝗫-𝗠𝗗",

    antiCall:
        "╔══════════════════════════╗\n" +
        "║          𝗔𝗡𝗧𝗜-𝗖𝗔𝗟𝗟 𝗔𝗖𝗧𝗜𝗩𝗘.          ║\n" +
        "╚══════════════════════════╝\n\n" +
        "𒑡 𝗜 𝗱𝗼𝗻'𝘁 𝗮𝗰𝗰𝗲𝗽𝘁 𝗰𝗮𝗹𝗹𝘀!\n" +
        "𒑡 𝗣𝗹𝗲𝗮𝘀𝗲 𝘀𝗲𝗻𝗱 𝗮 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝗶𝗻𝘀𝘁𝗲𝗮𝗱.\n\n" +
        "𒑡 𝗖𝗮𝗹𝗹 𝗔𝘂𝘁𝗼-𝗥𝗲𝗷𝗲𝗰𝘁𝗲𝗱\n\n" +
        "𒑡 𝗗𝗥𝗨𝗭𝗭 𝗫-𝗠𝗗\n" +
        "𒑡 ©𝗠𝗔𝗞𝗘 𝗕𝗬 𝗗𝗥𝗨𝗭𝗭",

    sessionExpired:
        "╔══════════════════════════╗\n" +
        "║         𝗦𝗘𝗦𝗦𝗜𝗢𝗡 𝗘𝗫𝗣𝗜𝗥𝗘𝗗.          ║\n" +
        "╚══════════════════════════╝\n\n" +
        "𒑡 𝗬𝗼𝘂𝗿 𝘀𝗲𝘀𝘀𝗶𝗼𝗻 𝗵𝗮𝘀 𝗲𝘅𝗽𝗶𝗿𝗲𝗱\n" +
        "𒑡 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗮𝗶𝗿 𝗮𝗴𝗮𝗶𝗻 𝘄𝗶𝘁𝗵 𝗻𝗲𝘄 𝗰𝗼𝗱𝗲\n\n" +
        "𒑡 𝗘𝗻𝘁𝗲𝗿 𝘆𝗼𝘂𝗿 𝗻𝘂𝗺𝗯𝗲𝗿 𝘁𝗼 𝗿𝗲𝗰𝗼𝗻𝗻𝗲𝗰𝘁\n\n" +
        "𒑡 ©𝗠𝗔𝗞𝗘 𝗕𝗬 𝗗𝗥𝗨𝗭𝗭"
};

class BotSession {
    constructor(userId) {
        this.userId = userId;
        this.sock = null;
        this.isConnected = false;
        this.aiEnabled = false; 
        this.autoReact = botData.statusSettings[userId]?.autoReact || false;
        this.isPublic = botData.statusSettings[userId]?.isPublic || false; 
        this.authPath = path.join(AUTH_DIR, userId);
        this.processedMessages = new Set();
        this.activeInterval = null;
        this.isInitializing = false;
        this.userChats = {}; 
        this.lastConnectMessageTime = null;
    }

    sendLog(message, type = 'info') {
        const logEntry = { timestamp: new Date().toLocaleTimeString(), message, type };
        const socketId = userSockets[this.userId];
        if (socketId) io.to(socketId).emit('console', logEntry);
        console.log('[' + this.userId + '] ' + message);
    }

    sendConnectionStatus() {
        const socketId = userSockets[this.userId];
        if (socketId) {
            io.to(socketId).emit('connection-status', {
                connected: this.isConnected,
                user: this.userId
            });
        }
        io.emit('total-active', Object.values(sessions).filter(s => s.isConnected).length);
    }

    async getAIResponse(userJid, userMessage) {
        if (!openai) return "❌ AI is not configured. Add AI_API_KEY (or OPENAI_API_KEY) to Railway Variables, then redeploy.";
        try {
            const completion = await openai.chat.completions.create({
                model: process.env.AI_MODEL || (process.env.OPENROUTER_API_KEY ? 'openai/gpt-4o-mini' : 'gpt-4o-mini'),
                messages: [{ role: "system", content: "Helpful assistant." }, { role: "user", content: userMessage }],
                max_tokens: 150
            });
            return completion.choices[0].message.content.trim();
        } catch (error) {
            return "❌ AI Error: " + error.message;
        }
    }

    startActiveCheck() {
        if (this.activeInterval) clearInterval(this.activeInterval);
        this.activeInterval = setInterval(async () => {
            if (this.isConnected && this.sock?.user) {
                try {
                    const botNumber = jidNormalizedUser(this.sock.user.id);
                    await this.sock.sendMessage(botNumber, { text: STYLISH.keepAlive });
                    this.sendLog("✅ Keep-alive: Status message sent successfully", "success");
                } catch (e) {
                    this.sendLog("⚠️ Keep-alive failed: " + e.message, "error");
                }
            }
        }, 60 * 60 * 1000); // Once per hour
    }

    async initialize(pairingNumber = null, pairingDelivery = null) {
        if (this.isInitializing) {
            this.sendLog("⏳ Initialization already in progress...", "info");
            return;
        }
        this.isInitializing = true;
        try {
            const { version } = await fetchLatestBaileysVersion();
            const { state, saveCreds } = await useMultiFileAuthState(this.authPath);
            
            this.sock = makeWASocket({
                version,
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'fatal' })),
                },
                printQRInTerminal: false,
                logger: P({ level: 'fatal' }),
                browser: Browsers.ubuntu('Chrome'),
                syncFullHistory: false,
                shouldSyncHistoryMessage: () => false,
                markOnlineOnConnect: true,
                keepAliveIntervalMs: 30000,
                connectTimeoutMs: 60000,
                defaultQueryTimeoutMs: 60000,
                emitOwnEvents: true,
                retryRequestDelayMs: 5000,
                maxMsgRetryCount: 5,
                linkPreviewImageThumbnailWidth: 192,
                transactionOpts: { maxCommitRetries: 10, delayBetweenTriesMs: 3000 },
                getMessage: async (key) => {
                    if (messageLogs[key.id]) {
                        return { conversation: messageLogs[key.id].text };
                    }
                    return { conversation: '*Pair now https://druzz-x-md.up.railway.app*' };
                },
                patchMessageBeforeSending: (message) => {
                    const requiresPatch = !!(
                        message.buttonsMessage ||
                        message.templateMessage ||
                        message.listMessage
                    );
                    if (requiresPatch) {
                        return {
                            viewOnceMessage: {
                                message: {
                                    messageContextInfo: {
                                        deviceListMetadata: {},
                                        deviceListMetadataVersion: 2
                                    },
                                    ...message
                                }
                            }
                        };
                    }
                    return message;
                },
                generateHighQualityLinkPreview: true,
            });

            // Add the DRUZZ X-MD Channel attribution to ALL normal bot replies.
            // This makes WhatsApp render the native "View channel" action like the
            // reference screenshot. Delete/react protocol messages are left untouched.
            const originalSendMessage = this.sock.sendMessage.bind(this.sock);
            this.sock.sendMessage = async (jid, content, options = {}) => {
                const message = content && typeof content === 'object' ? content : {};
                const isProtocolMessage = !!(message.delete || message.react || message.protocolMessage);
                if (isProtocolMessage) {
                    return originalSendMessage(jid, content, options);
                }

                const existingContext = message.contextInfo || {};
                const channelContext = channelInfo.contextInfo || {};
                const mergedContent = {
                    ...message,
                    contextInfo: {
                        ...channelContext,
                        ...existingContext,
                        forwardedNewsletterMessageInfo: {
                            ...(channelContext.forwardedNewsletterMessageInfo || {}),
                            ...(existingContext.forwardedNewsletterMessageInfo || {})
                        }
                    }
                };

                // Some older commands passed channelInfo as the third argument.
                // Normalize that usage into content.contextInfo while preserving quoted/etc.
                const mergedOptions = { ...options };
                if (mergedOptions.contextInfo) {
                    mergedContent.contextInfo = {
                        ...mergedContent.contextInfo,
                        ...mergedOptions.contextInfo
                    };
                    delete mergedOptions.contextInfo;
                }

                return originalSendMessage(jid, mergedContent, mergedOptions);
            };

            if (pairingNumber) {
                if (state.creds.registered || this.sock.authState.creds.registered) {
                    throw new Error('This number already has a registered session.');
                }
                await delay(3000);
                try {
                    let code = await this.sock.requestPairingCode(pairingNumber);
                    code = code?.match(/.{1,4}/g)?.join("-") || code;
                    this.sendLog("🔑 Pairing Code Generated: " + code, 'success');

                    if (typeof pairingDelivery === 'function') {
                        await pairingDelivery(code);
                    } else {
                        const socketId = userSockets[this.userId];
                        if (socketId) io.to(socketId).emit('pairing-code', code);
                    }
                } catch (err) {
                    this.sendLog("❌ Pairing error: " + err.message, 'error');
                    if (typeof pairingDelivery === 'function') throw err;
                }
            }

            this.sock.ev.on('creds.update', saveCreds);

            this.sock.ev.on('call', async (calls) => {
                if (botData.antiCall[this.userId]) {
                    for (const call of calls) {
                        if (call.status === 'offer') {
                            try {
                                await this.sock.rejectCall(call.id, call.from);
                                await this.sock.sendMessage(call.from, { text: STYLISH.antiCall });
                            } catch (e) {}
                        }
                    }
                }
            });

            // Welcome / goodbye automation. Baileys emits add/remove events for group membership changes.
            this.sock.ev.on('group-participants.update', async (update) => {
                try {
                    const { id, participants, action } = update || {};
                    if (!id || !Array.isArray(participants) || !participants.length) return;
                    const enabled = action === 'add'
                        ? !!botData.welcomeGroups?.[id]
                        : action === 'remove'
                            ? !!botData.goodbyeGroups?.[id]
                            : false;
                    if (!enabled) return;

                    let subject = 'the group';
                    try {
                        const metadata = await this.sock.groupMetadata(id);
                        subject = metadata.subject || subject;
                    } catch (_) {}

                    const mentions = participants.map(jid => jidNormalizedUser(jid));
                    const names = mentions.map(jid => '@' + jid.split('@')[0]).join(', ');
                    const body = action === 'add'
                        ? `*👋 ᴡᴇʟᴄᴏᴍᴇ ${names}!* 🎉\n*ʏᴏᴜ ᴀʀᴇ ɴᴏᴡ ᴘᴀʀᴛ ᴏғ ${subject}.*`
                        : `*👋 ɢᴏᴏᴅʙʏᴇ ${names}!*\n*ᴛʜᴀɴᴋ ʏᴏᴜ ғᴏʀ ʙᴇɪɴɢ ᴘᴀʀᴛ ᴏғ ${subject}.*`;
                    await this.sock.sendMessage(id, { text: body, mentions });
                } catch (e) {
                    this.sendLog('⚠️ Welcome/goodbye handler: ' + e.message, 'warning');
                }
            });

            this.sock.ev.on('messages.upsert', async (m) => {
                if (m.type !== 'notify') return;
                
                await Promise.all(m.messages.map(async (msg) => {
                    // Check for decryption errors
                    if (msg.messageStubType === 1 || msg.messageStubType === 2) {
                        this.sendLog('⚠️ Received undecryptable message. Possible session conflict.', 'warning');
                    }

                    try {
                        const from = msg.key.remoteJid;
                        const isMe = msg.key.fromMe;
                        const isGroup = from.endsWith('@g.us');
                        const isStatus = from === 'status@broadcast';
                        
                        const messageContent = msg.message?.ephemeralMessage?.message || msg.message?.viewOnceMessage?.message || msg.message?.viewOnceMessageV2?.message || msg.message;
                        if (!messageContent) return;
                        
                        let type = Object.keys(messageContent)[0];
                        const text = (messageContent.conversation || messageContent.extendedTextMessage?.text || messageContent.imageMessage?.caption || messageContent.videoMessage?.caption || '').trim();

                        // Handle Autoread, Autotyping, Autorecording
                        if (!isMe && !isStatus) {
                            await handleAutoread(this.sock, msg);
                            await storeMessage(msg);
                        }

                        if (msg.message?.protocolMessage?.type === 0) {
                            await handleMessageRevocation(this.sock, msg);
                            return;
                        }

                        const msgId = msg.key.id;
                        if (this.processedMessages.has(msgId)) return;
                        this.processedMessages.add(msgId);
                        if (this.processedMessages.size > 1000) this.processedMessages.delete(this.processedMessages.values().next().value);

                        if (!isStatus) {
                            let logEntry = { text, type };
                            if (['imageMessage', 'videoMessage', 'audioMessage'].includes(type)) {
                                try {
                                    const mContent = messageContent[type];
                                    if (mContent && (mContent.directPath || mContent.url)) {
                                        const stream = await downloadContentFromMessage(mContent, type.replace('Message', ''));
                                        let buffer = Buffer.from([]);
                                        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                                        logEntry.buffer = buffer;
                                    }
                                } catch (e) {}
                            }
                            logEntry.pushName = msg.pushName || 'User';
                            messageLogs[msgId] = logEntry;
                            if (Object.keys(messageLogs).length > 2000) delete messageLogs[Object.keys(messageLogs)[0]];
                        }

                        if (this.autoReact && !isMe && !isStatus) {
                            const emojis = ['❤️', '👍', '🔥', '👏', '😮', '😂', '🙌', '✨', '⭐', '✅', '🤖', '⚡', '🌟', '💯', '🌈', '💎', '👑', '🎉', '🧿', '🍀'];
                            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                            try { await this.sock.sendMessage(from, { react: { text: randomEmoji, key: msg.key } }); } catch (e) {}
                        }

                        // AI Auto-Reply
                        if (this.aiEnabled && !isMe && !isStatus && !isGroup && text && !text.startsWith('.')) {
                            try {
                                const aiResponse = await this.getAIResponse(from, text);
                                await this.sock.sendMessage(from, { text: aiResponse }, { quoted: msg });
                            } catch (e) {
                                console.error("🤖 AI Auto-Reply Error:", e);
                            }
                        }

                        if (isStatus && !isMe) {
                            await handleStatusUpdate(this.sock, m, botData, this.userId);
                            return;
                        }

                        const botNumber = jidNormalizedUser(this.sock.user.id);
                        const sender = msg.key.participant || from;
                        const isOwner = isMe || sender.includes(botNumber.split('@')[0]);
                        let isAdmin = isOwner;
                        if (!isAdmin && isGroup) {
                            try {
                                const groupMetadata = await this.sock.groupMetadata(from);
                                const participant = groupMetadata.participants.find(p => p.id === sender);
                                isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
                            } catch (e) {
                                isAdmin = false;
                            }
                        }
                        const cmd = text.toLowerCase();
                        const args = text.split(' ').slice(1);
                        const q = args.join(' ');

                        // Group anti-content protections. Admins are exempt so they can configure/test them.
                        if (isGroup && !isAdmin) {
                            const ctx = messageContent?.extendedTextMessage?.contextInfo
                                || messageContent?.imageMessage?.contextInfo
                                || messageContent?.videoMessage?.contextInfo
                                || messageContent?.audioMessage?.contextInfo
                                || messageContent?.stickerMessage?.contextInfo
                                || {};
                            const mentionedJid = Array.isArray(ctx.mentionedJid) ? ctx.mentionedJid : [];
                            const hasMention = mentionedJid.length > 0;
                            const isSticker = type === 'stickerMessage';
                            const isVoice = type === 'audioMessage';
                            const antiMention = !!botData.antiMentionGroups?.[from];
                            const antiSticker = !!botData.antiStickerGroups?.[from];
                            const antiVoice = !!botData.antiVoiceGroups?.[from];

                            if ((antiSticker && isSticker) || (antiVoice && isVoice) || (antiMention && hasMention)) {
                                try { await this.sock.sendMessage(from, { delete: msg.key }); } catch (_) {}
                                return;
                            }
                        }

                        // Per-user message-limit mute: every message is deleted and the user is
                        // removed only when an optional numeric limit was configured.
                        if (isGroup && botData.mutedGroups?.[from]?.[sender] && !isAdmin) {
                            const rule = botData.mutedGroups[from][sender];
                            try { await this.sock.sendMessage(from, { delete: msg.key }); } catch (e) {}
                            rule.count = (rule.count || 0) + 1;
                            if (rule.limit && rule.count >= rule.limit) {
                                try {
                                    await this.sock.groupParticipantsUpdate(from, [sender], 'remove');
                                    await this.sock.sendMessage(from, { text: `*🔇 @${sender.split('@')[0]} ʜᴀs ʙᴇᴇɴ ʀᴇᴍᴏᴠᴇᴅ ᴀғᴛᴇʀ ${rule.limit} ᴍᴜᴛᴇᴅ ᴍᴇssᴀɢᴇs*`, mentions: [sender] });
                                } catch (e) {}
                                delete botData.mutedGroups[from][sender];
                            }
                            saveBotData();
                            return;
                        }

                        if (isGroup && botData.antiStatusGroups && botData.antiStatusGroups[from] && !isAdmin) {
                            const isStatusMsg = msg.message?.protocolMessage?.type === 0 || 
                                           msg.message?.viewOnceMessage || 
                                           msg.message?.viewOnceMessageV2 ||
                                           msg.message?.viewOnceMessageV2Extension ||
                                           (text && (text.includes('whatsapp.com/channel/') || text.includes('status@broadcast')));
                            
                            if (msg.message?.forwardingScore > 0 || isStatusMsg) {
                                try {
                                    await this.sock.sendMessage(from, { delete: msg.key });
                                    return;
                                } catch (e) {}
                            }
                        }

                        if (isGroup && botData.antilinkGroups[from] && !isAdmin) {
                            const linkPatterns = [/chat.whatsapp.com\//i, /http:\/\//i, /https:\/\//i, /www\./i, /[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/i];
                            if (linkPatterns.some(pattern => pattern.test(text))) {
                                try {
                                    const mode = botData.antilinkGroups[from];
                                    await this.sock.sendMessage(from, { delete: msg.key });
                                    if (mode === 'kick') await this.sock.groupParticipantsUpdate(from, [sender], "remove");
                                } catch (e) {}
                                return;
                            }
                        }

                        if (!this.isPublic && !isOwner && !cmd.startsWith('.pair')) return;

                        if (cmd.startsWith('.')) {
                            const commandName = cmd.slice(1).split(' ')[0];
                            (async () => {
                                try {
                                    switch (commandName) {
                                        case 'menu':
                                            const loadEmojis = ['🇭🇹', '🇭🇹', '🇭🇹', '🇭🇹'];
                                            for (const emoji of loadEmojis) await this.sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
                                            const customName = botData.userNames[this.userId] || msg.pushName || 'User';
                                            const menuText = `> *╔━━━⊷≫ 𝙸𝙽𝙵𝙾 𝙱𝙾𝚃 ≪⊷━━━╗*
> *║儺╭────────────*
> *║儺│ 𝚄𝚂𝙴𝚁  : *${customName}*
> *║儺│ 𝙱𝙾𝚃 𝙽𝙰𝙼𝙴 : 𝙳𝚁𝚄𝚉𝚉 𝚇-𝙼𝙳*
> *║儺│ 𝚂𝚃𝙰𝚃𝚄𝚂 : Online*
> *║儺│ 𝙿𝚁𝙴𝙵𝙸𝚇 : "."*
> *║儺│ 𝙼𝙾𝙳𝙴 :  ${this.isPublic ? 'PUBLIC 🌍' : 'PRIVATE 🔒'}*
> *║儺│ 𝙾𝚆𝙽𝙴𝚁 : 𝐃𖾝꯭𝗲͠𑁁᩿᩼𝘃꯭᳟𝗲꯭𝗹꯭𝗼꯭𝗽꯭𝗲꯭𝗿꯭ 𝐃𖾝꯭𝗿͠𑁁᩿᩼𝘂꯭᳟𝘇꯭𝘇꯭*
> *║儺╰────────────*
> *╚━━━━━━━━━━━━━━━━━━╝*

> *\`𝚄𝚂𝙴𝚁 𝙲𝙾𝙼𝙼𝙰𝙽𝙳𝚂\`*
> *╔━━━━━━━━━━━━━━━━━━╗*
> *║╭─────────────*
> *║│➠ 𝙰𝚄𝚃𝙾𝚁𝙴𝙰𝙲𝚃𝚂*
> *║│➠ 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺*
> *║│➠ 𝙰𝙽𝚃𝙸𝙳𝙴𝙻𝙴𝚃𝙴*
> *║│➠ 𝙰𝙸*
> *║│➠ 𝚅𝚅*
> *║│➠ 𝙳𝙿*
> *║│➠ 𝙾𝚆𝙽𝙴𝚁*
> *║│➠ 𝚃𝚁𝙰𝙽𝚂𝙻𝙰𝚃𝙴*
> *║│➠ 𝙿𝙸𝙽𝙶*
> *║╰─────────────*
> *╚━━━━━━━━━━━━━━━━━━╝*
> *\`𝚃𝙾𝙾𝙻𝚂\`*
> *╔━━━━━━━━━━━━━━━━━━╗*
> *║╭─────────────*
> *║│➠ 𝙰𝙿𝙺 [ 𝙽𝙰𝙼𝙴 ]*
> *║│➠ 𝙵𝙰𝙲𝙴𝙱𝙾𝙾𝙺 [ 𝚄𝚁𝙻 ]*
> *║│➠ 𝚃𝙸𝙺𝚃𝙾𝙺 [ 𝚄𝚁𝙻 ]*
> *║│➠ 𝙸𝙽𝚂𝚃𝙰𝙶𝚁𝙰𝙼 [ 𝚄𝚁𝙻 ]*
> *║│➠ 𝚂𝙾𝙽𝙶 [ 𝙽𝙰𝙼𝙴 ]*
> *║│➠ 𝚅𝙸𝙳𝙴𝙾 [ 𝙽𝙰𝙼𝙴 ]*
> *║│➠ 𝙹𝙾𝙺𝙴*
> *║│➠ 𝟾𝙱𝙰𝙻𝙻*
> *║│➠ 𝙲𝙾𝙸𝙽𝙵𝙻𝙸𝙿*
> *║│➠ 𝙳𝙸𝙲𝙴*
> *║│➠ 𝚁𝙾𝙻𝙻*
> *║│➠ 𝚂𝙷𝙸𝙿 @𝚄𝚂𝙴𝚁*
> *║│➠ 𝚁𝙰𝚃𝙴 @𝚄𝚂𝙴𝚁*
> *║│➠ 𝙿𝙸𝙲𝙺 𝙰 | 𝙱 | 𝙲*
> *║│➠ 𝙲𝙰𝙻𝙲 𝟷𝟶+𝟸*
> *║│➠ 𝙴𝙼𝙾𝙹𝙸𝙼𝙸𝚇 1+2*
> *║│➠ 𝙲𝙷𝙰𝚁𝙰𝙲𝚃𝙴𝚁 "𝙼𝙴𝙽𝚃𝙸𝙾𝙽"*
> *║┃➠ 𝙶𝙳𝚁𝙸𝚅𝙴 [ 𝚄𝚁𝙻 ]*
> *║│➠ 𝙼𝙵 [ 𝚄𝚁𝙻 ]*
> *║│➠ 𝙼𝙴𝙼𝙴 [ 𝚄𝚁𝙻 ]*
> *║╰─────────────*
> *╚━━━━━━━━━━━━━━━━━━╝*
> *\`𝙰𝙳𝙼𝙸𝙽\`*
> *╔━━━━━━━━━━━━━━━━━━╗*
> *║╭─────────────*
> *║│➠ 𝙿𝚁𝙸𝚅𝙰𝚃𝙴*
> *║│➠ 𝙿𝚄𝙱𝙻𝙸𝙲*
> *║│➠ 𝚃𝙰𝙶𝙰𝙻𝙻*
> *║│➠ 𝚂𝚃𝙰𝚃𝚄𝚂*
> *║│➠ 𝙷𝙰𝙲𝙺*
> *║│➠ 𝚂𝙴𝚃𝙽𝙰𝙼𝙴*
> *║│➠ 𝙷𝙸𝙳𝙴𝚃𝙰𝙶*
> *║│➠ 𝙺𝙸𝙲𝙺𝙾𝙵𝙵𝙻𝙸𝙽𝙴*
> *║│➠ 𝙺𝙸𝙲𝙺𝙰𝙻𝙻*
> *║│➠ 𝙿𝚁𝙾𝙼𝙾𝚃𝙴 @𝚄𝚂𝙴𝚁*
> *║│➠ 𝙳𝙴𝙼𝙾𝚃𝙴 @𝚄𝚂𝙴𝚁*
> *║│➠ 𝙰𝙳𝙳 509 𝚇𝚇𝚇*
> *║│➠ 𝙰𝙳𝙼𝙸𝙽𝚂*
> *║│➠ 𝙻𝙸𝙽𝙺*
> *║│➠ 𝚁𝙴𝚅𝙾𝙺𝙴*
> *║│➠ 𝚂𝙴𝚃𝚂𝚄𝙱𝙹𝙴𝙲𝚃*
> *║│➠ 𝚂𝙴𝚃𝙳𝙴𝚂𝙲*
> *║│➠ 𝙾𝙿𝙴𝙽*
> *║│➠ 𝙲𝙻𝙾𝚂𝙴*
> *║│➠ 𝙳𝙴𝙻*
> *║│➠ 𝙼𝚄𝚃𝙴 @𝚄𝚂𝙴𝚁*
> *║│➠ 𝚄𝙽𝙼𝚄𝚃𝙴 @𝚄𝚂𝙴𝚁*
> *║│➠ 𝙰𝙽𝚃𝙸-𝚂𝚃𝙸𝙲𝙺𝙴𝚁 𝙾𝙽 / 𝙾𝙵𝙵*
> *║│➠ 𝙰𝙽𝚃𝙸-𝚅𝙾𝙸𝙲𝙴 𝙾𝙽 / 𝙾𝙵𝙵*
> *║│➠ 𝙰𝙽𝚃𝙸-𝙼𝙴𝙽𝚃𝙸𝙾𝙽𝙴𝙳 𝙾𝙽 / 𝙾𝙵𝙵*
> *║│➠ 𝙸𝙳𝙲𝙷*
> *║│➠ 𝙹𝙸𝙳*
> *║│➠ 𝙿𝙰𝙸𝚁 𝟻𝟶𝟿 𝚇𝚇𝚇*
> *║│➠ 𝚆𝙴𝙻𝙲𝙾𝙼𝙴 𝙾𝙽 / 𝙾𝙵𝙵*
> *║│➠ 𝙶𝙾𝙾𝙳𝙱𝚈𝙴 𝙾𝙽 / 𝙾𝙵𝙵*
> *║│➠ 𝙰𝙽𝚃𝙸𝙲𝙰𝙻𝙻*
> *║│➠ 𝙰𝙽𝚃𝙸𝚂𝚃𝙰𝚃𝚄𝚂*
> *║│➠ 𝙰𝙲𝙲𝙴𝙿𝚃*
> *║│➠ 𝙰𝙽𝚃𝙸𝚁𝙴𝙰𝙳*
> *║│➠ 𝙶𝚁𝙾𝚄𝙿𝙸𝙽𝙵𝙾*
> *║╰─────────────*
> *╚━━━━━━━━━━━━━━━━━━╝*
> *\`𝙵𝙴𝙰𝚃𝚄𝚁𝙴𝚂\`*
> *╔━━━━━━━━━━━━━━━━━━╗*
> *║╭─────────────*
> *║│➠ 𝙰𝙸  𝙾𝙽 / 𝙾𝙵𝙵*
> *║│➠ 𝙰𝚄𝚃𝙾𝚁𝙴𝙰𝙲𝚃𝚂 𝙾𝙽 / 𝙾𝙵𝙵*
> *║│➠ 𝙰𝙽𝚃𝙸𝙳𝙴𝙻𝙴𝚃𝙴 𝙾𝙽 / 𝙾𝙵𝙵*
> *║╰─────────────*
> *╚━━━━━━━━━━━━━━━━━━╝*

> *© 𝙼𝙰𝙺𝙴 𝙱𝚈 𝙳𝚁𝚄𝚉𝚉 𝙳𝙴𝚅*`;
                                            try {
                                                await this.sock.sendMessage(from, {
    image: { url: 'https://files.catbox.moe/80c2cb.png' },
    caption: menuText
}, channelInfo);
                                            } catch (e) { await this.sock.sendMessage(from, { text: menuText }); }
                                            break;
                                        case 'ping': await commands.ping(this.sock, from, msg); break;
                                        case 'owner': await commands.owner(this.sock, from, msg); break;
                                        case 'ai': await commands.ai(this.sock, from, msg, isAdmin, this, args); break;
                                        case 'antilink': await commands.antilink(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                        case 'anticall': await commands.anticall(this.sock, from, msg, isAdmin, botData, saveBotData, this.userId, args); break;
                                        case 'antidelete': await commands.antidelete(this.sock, from, msg, isAdmin, botData, saveBotData, this.userId, args); break;
                                        case 'status': 
                                        case 'autostatus': await commands.autostatus(this.sock, from, msg, isAdmin, botData, saveBotData, this.userId, args); break;
                                        case 'autoreacts': await commands.autoreacts(this.sock, from, msg, isAdmin, this, args); break;
                                        case 'kick': await commands.kick(this.sock, from, msg, isAdmin); break;
                                        case 'promote': await commands.promote(this.sock, from, msg, isAdmin); break;
                                        case 'demote': await commands.demote(this.sock, from, msg, isAdmin); break;
                                        case 'add': await commands.add(this.sock, from, msg, isAdmin, q); break;
                                        case 'admins': case 'adminslist': await commands.admins(this.sock, from, msg); break;
                                        case 'link': case 'grouplink': await commands.grouplink(this.sock, from, msg, isAdmin); break;
                                        case 'revoke': await commands.revoke(this.sock, from, msg, isAdmin); break;
                                        case 'setsubject': await commands.setsubject(this.sock, from, msg, isAdmin, q); break;
                                        case 'setdesc': await commands.setdesc(this.sock, from, msg, isAdmin, q); break;
                                        case 'open': await commands.open(this.sock, from, msg, isAdmin); break;
                                        case 'close': await commands.close(this.sock, from, msg, isAdmin); break;
                                        case 'kickall': await commands.kickall(this.sock, from, msg, isAdmin); break;
                                        case 'delete': case 'del': await commands.delete(this.sock, from, msg, isAdmin); break;
                                        case 'mute': await commands.mute(this.sock, from, msg, isAdmin, botData, saveBotData, q); break;
                                        case 'unmute': await commands.unmute(this.sock, from, msg, isAdmin, botData, saveBotData); break;
                                        case 'anti-sticker': case 'antisticker': await commands.antifeatures(this.sock, from, msg, isAdmin, botData, saveBotData, args, 'anti-sticker'); break;
                                        case 'anti-voice': case 'antivoice': await commands.antifeatures(this.sock, from, msg, isAdmin, botData, saveBotData, args, 'anti-voice'); break;
                                        case 'anti-mentioned': case 'antimentioned': case 'antimention': await commands.antifeatures(this.sock, from, msg, isAdmin, botData, saveBotData, args, 'anti-mentioned'); break;
                                        case 'idch': await commands.idch(this.sock, from, msg); break;
                                        case 'jid': await commands.jid(this.sock, from, msg); break;
                                        case 'pair':
                                            await commands.pair(this.sock, from, msg, q, async (number, replyTo) => {
                                                if (number === botNumber.split('@')[0]) throw new Error('You cannot pair the bot with its current number.');
                                                if (sessions[number]?.isConnected) throw new Error('That number is already connected to DRUZZ X-MD.');
                                                if (!sessions[number]) sessions[number] = new BotSession(number);
                                                const targetSession = sessions[number];
                                                await targetSession.initialize(number, async (code) => {
                                                    await this.sock.sendMessage(replyTo, {
                                                        text: `╔══════════════════════════╗\n║       🔐 𝗣𝗔𝗜𝗥𝗜𝗡𝗚 𝗖𝗢𝗗𝗘       ║\n╚══════════════════════════╝\n\n📱 *ɴᴜᴍʙᴇʀ:* +${number}\n🔑 *ᴄᴏᴅᴇ:* \`${code}\`\n\n*WhatsApp → Settings → Linked devices → Link a device → Link with phone number*\n\n⚡ 𝗗𝗥𝗨𝗭𝗭 𝗫-𝗠𝗗`
                                                    }, { quoted: msg });
                                                });
                                            });
                                            break;
                                        case 'welcome': await commands.welcome(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                        case 'goodbye': await commands.goodbye(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                        case '8ball': case 'coinflip': case 'dice': case 'roll': case 'ship': case 'rate': case 'pick': case 'truth': case 'dare': case 'calc':
                                            await commands.fun(this.sock, from, msg, commandName, q); break;
                                        case 'private': 
                                            await commands.private(this.sock, from, msg, isAdmin, this); 
                                            if (!botData.statusSettings[this.userId]) botData.statusSettings[this.userId] = {};
                                            botData.statusSettings[this.userId].isPublic = false;
                                            saveBotData();
                                            break;
                                        case 'public': 
                                            await commands.public(this.sock, from, msg, isAdmin, this); 
                                            if (!botData.statusSettings[this.userId]) botData.statusSettings[this.userId] = {};
                                            botData.statusSettings[this.userId].isPublic = true;
                                            saveBotData();
                                            break;
                                        case 'hidetag': await commands.hidetag(this.sock, from, msg, isAdmin, q); break;
                                        case 'tagall': await commands.tagall(this.sock, from, msg, isAdmin, q); break;
                                        case 'setname': await commands.setname(this.sock, from, msg, isAdmin, botData, saveBotData, this.userId, q); break;
                                        case 'insta': case 'ig': await commands.insta(this.sock, from, msg, q); break;
                                        case 'tiktok': await commands.tiktok(this.sock, from, msg, q); break;
                                        case 'song': await commands.song(this.sock, from, msg); break;
                                        case 'video': await commands.video(this.sock, from, msg); break;
                                        case 'joke': await commands.joke(this.sock, from, msg); break;
                                        case 'meme': await commands.meme(this.sock, from, msg); break;
                                        case 'vv': await commands.vv(this.sock, from, msg); break;
                                        case 'dp': await commands.dp(this.sock, from, msg); break;
                                        case 'groupinfo': await commands.groupinfo(this.sock, from, msg); break;
                                        case 'kickoffline': await commands.kickoffline(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                        case 'antistatus': await commands.antistatus(this.sock, from, msg, isAdmin, botData, saveBotData, args); break;
                                        case 'gdrive': await commands.gdrive(this.sock, from, msg, q); break;
                                        case 'mf': await commands.mf(this.sock, from, msg, q); break;
                                        case 'translate': case 'trt': await commands.translate(this.sock, from, msg); break;
                                        
                                        // New Command Handlers
                                        case 'apk': await commands.apk(this.sock, from, msg); break;
                                        case 'autoread': await commands.autoread(this.sock, from, msg); break;
                                        case 'character': await commands.character(this.sock, from, msg); break;
                                        case 'emojimix': await commands.emojimix(this.sock, from, msg); break;
                                        case 'facebook': case 'fb': await commands.facebook(this.sock, from, msg); break;
                                        case 'hack': await commands.hack(this.sock, from, msg); break;
                                        case 'accept': await commands.accept(this.sock, from, msg, isAdmin); break;
                                    }
                                } catch (e) {
                                    this.sendLog("❌ Command error (" + commandName + "): " + e.message, 'error');
                                }
                            })();
                        }
                    } catch (e) {
                        console.error('❌ Message Processing Error:', e);
                    }
                }));
            });

            this.sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;
                if (qr) {
                    const socketId = userSockets[this.userId];
                    if (socketId) io.to(socketId).emit('qr', qr);
                }

                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                    this.isConnected = false;
                    this.isInitializing = false;
                    this.sendLog("⚠️ Connection closed. Reconnecting: " + shouldReconnect, 'warning');
                    this.sendConnectionStatus();
                    const statusCode = (lastDisconnect.error)?.output?.statusCode;
                    
                    if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                        this.sendLog('🔴 Session expired or logged out. Clearing auth data for fresh pairing...', 'error');
                        // Send disconnected message to own DM
                        try {
                            const botNumber = jidNormalizedUser(this.sock.user.id);
                            await this.sock.sendMessage(botNumber, { text: STYLISH.disconnected });
                        } catch (e) {}
                        try {
                            if (fs.existsSync(this.authPath)) {
                                const backupPath = this.authPath + '_backup_' + Date.now();
                                fs.moveSync(this.authPath, backupPath);
                                this.sendLog("📦 Corrupted session backed up to " + backupPath, 'info');
                            }
                        } catch (e) {
                            if (fs.existsSync(this.authPath)) fs.removeSync(this.authPath);
                        }
                        delete sessions[this.userId];
                        this.sendConnectionStatus();
                    } else if (statusCode === DisconnectReason.restartRequired || statusCode === DisconnectReason.connectionLost || statusCode === 428) {
                        this.sendLog("🔄 Connection issue (" + statusCode + "). Restarting in 3s...", 'warning');
                        setTimeout(() => this.initialize(), 3000);
                    } else if (statusCode === 515) {
                        this.sendLog('⚠️ Stream error. Reconnecting immediately...', 'warning');
                        this.initialize();
                    } else {
                        this.sendLog("ℹ️ Connection closed (" + statusCode + "). Reconnecting in 5s...", 'info');
                        setTimeout(() => this.initialize(), 5000);
                    }
                } else if (connection === 'open') {
                    this.isConnected = true;
                    this.isInitializing = false;
                    this.sendLog('✅ Connected successfully!', 'success');
                    this.sendConnectionStatus();
                    this.startActiveCheck();
                    
                    const botNumber = jidNormalizedUser(this.sock.user.id);
                    const botName = botData.userNames[this.userId] || (this.sock.user && this.sock.user.name) || this.userId;
                    
                    this.sendLog("🌟 Bot " + botName + " is online and ready!", 'success');

                    setTimeout(async () => {
                        try {
                            await this.sock.query({
                                tag: 'iq',
                                attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'status' },
                                content: [{ tag: 'status', attrs: {}, content: Buffer.from("🌟 IM USING BEST BOT DRUZZ X-MD 🌟", 'utf-8') }]
                            });
                            this.sendLog("✨ Bio updated successfully!", "success");
                        } catch (e) {
                            this.sendLog("⚠️ Bio update failed: " + e.message, "error");
                        }
                    }, 5000);

                    // Send SUPER STYLISH connected message
                    if (!this.lastConnectMessageTime || (Date.now() - this.lastConnectMessageTime > 60 * 60 * 1000)) {
                        await this.sock.sendMessage(botNumber, { text: STYLISH.connected });
                        this.lastConnectMessageTime = Date.now();
                    }
                }
            });

        } catch (err) {
            this.isInitializing = false;
            if (pairingNumber && typeof pairingDelivery === 'function') {
                this.sendLog("❌ Pairing initialization failed: " + err.message, 'error');
                throw err;
            }
            this.sendLog("❌ Initialization failed: " + err.message + ". Retrying in 10s...", 'error');
            setTimeout(() => this.initialize(), 10000);
        }
    }
}

io.on('connection', (socket) => {
    socket.on('set-user', (userId) => {
        userId = String(userId || '').replace(/\D/g, '');
        if (!/^\d{8,15}$/.test(userId)) return;

        userSockets[userId] = socket.id;
        if (!sessions[userId]) sessions[userId] = new BotSession(userId);

        if (!botData.statusSettings[userId]) {
            botData.statusSettings[userId] = {
                autoStatus: false,
                autoSeen: false,
                autoLike: false,
                autoDownload: false,
                isPublic: false
            };
            saveBotData();
        }

        sessions[userId].sendConnectionStatus();
    });

    socket.on('pair-request', async ({ userId, number }) => {
        const cleanNumber = String(number || '').replace(/\D/g, '');
        if (!/^\d{8,15}$/.test(cleanNumber)) {
            socket.emit('pairing-error', 'Enter a valid WhatsApp number with country code.');
            return;
        }

        userId = cleanNumber;

        if (!sessions[userId]) {
            sessions[userId] = new BotSession(userId);
        }

        if (sessions[userId]) {
            if (!botData.statusSettings[userId]) {
                botData.statusSettings[userId] = { 
                    autoStatus: false,
                    autoSeen: false,
                    autoLike: false,
                    autoDownload: false,
                    isPublic: false
                };
                saveBotData();
            }
            await sessions[userId].initialize(number);
        }
    });

    socket.on('logout', async (userId) => {
        if (sessions[userId]) {
            if (sessions[userId].sock) {
                try { 
                    // Send logout message
                    const botNumber = jidNormalizedUser(sessions[userId].sock.user.id);
                    await sessions[userId].sock.sendMessage(botNumber, { 
                        text: "╔══════════════════════════╗\n" +
                              "║  🔴 𝗕𝗢𝗧 𝗟𝗢𝗚𝗚𝗘𝗗 𝗢𝗨𝗧 🔴  ║\n" +
                              "╚══════════════════════════╝\n\n" +
                              "👋 𝗚𝗼𝗼𝗱𝗯𝘆𝗲!\n" +
                              "🔄 𝗣𝗮𝗶𝗿 𝗮𝗴𝗮𝗶𝗻 𝘁𝗼 𝗿𝗲𝗰𝗼𝗻𝗻𝗲𝗰𝘁\n\n" +
                              "𝗗𝗥𝗨𝗭𝗭 𝗫-𝗠𝗗"
                    });
                    await sessions[userId].sock.logout(); 
                } catch (e) {}
            }
            const authPath = path.join(AUTH_DIR, userId);
            if (fs.existsSync(authPath)) fs.removeSync(authPath);
            delete sessions[userId];
            io.emit('total-active', Object.values(sessions).filter(s => s.isConnected).length);
            const socketId = userSockets[userId];
            if (socketId) io.to(socketId).emit('connection-status', { connected: false, user: userId });
        }
    });

    socket.on('disconnect', () => {
        for (const userId in userSockets) {
            if (userSockets[userId] === socket.id) {
                delete userSockets[userId];
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('\n' +
    '╔══════════════════════════════════════╗\n' +
    '║   🚀 𝗗𝗥𝗨𝗭𝗭 𝗫-𝗠𝗗 𝗦𝗘𝗥𝗩𝗘𝗥 𝗢𝗡𝗘 🚀   ║\n' +
    '╠══════════════════════════════════════╣\n' +
    '║  🌐 𝗦𝗲𝗿𝘃𝗲𝗿  ➜  http://localhost:' + PORT + '  ║\n' +
    '║  ⚡ 𝗦𝘁𝗮𝘁𝘂𝘀   ➜  𝗔𝗰𝘁𝗶𝘃𝗲 & 𝗥𝗲𝗮𝗱𝘆       ║\n' +
    '║  🔧 𝗔𝗻𝘁𝗶-𝗦𝗹𝗲𝗲𝗽 ➜  𝗘𝗻𝗮𝗯𝗹𝗲𝗱 (𝟱𝗺𝗶𝗻)   ║\n' +
    '║  👑 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 ➜ 𝗗𝗥𝗨𝗭𝗭 𝗗𝗘𝗩       ║\n' +
    '╚══════════════════════════════════════╝\n');
    
    // Auto-load sessions
    loadExistingSessions();
    
    // Anti-Sleep Mechanism
    const APP_URL = process.env.APP_URL || 'http://localhost:' + PORT;
    if (APP_URL) {
        setInterval(async () => {
            try {
                await axios.get(APP_URL);
                console.log('⚡ 𝗔𝗻𝘁𝗶-𝗦𝗹𝗲𝗲𝗽 𝗣𝗶𝗻𝗴 ➜ 𝗦𝗲𝗿𝘃𝗲𝗿 𝗔𝗰𝘁𝗶𝘃𝗲');
            } catch (e) {
                console.log('⚠️ 𝗔𝗻𝘁𝗶-𝗦𝗹𝗲𝗲𝗽 𝗣𝗶𝗻𝗴 ➜ ' + e.message);
            }
        }, 5 * 60 * 1000); // Ping every 5 minutes
    }
});