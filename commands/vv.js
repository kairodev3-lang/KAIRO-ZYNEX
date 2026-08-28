const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function vvCommand(sock, from, msg) {
    // Loading reactions
    const loadEmojis = ['⏳', '🔓', '👁️'];
    for (const emoji of loadEmojis) {
        await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
    }
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return await sock.sendMessage(from, { text: "*❌ ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ a ᴠɪᴇᴡ-ᴏɴᴄᴇ ᴍᴇssᴀɢᴇ.*" }, { quoted: msg });

    const viewOnce = quoted.viewOnceMessageV2 || quoted.viewOnceMessage;
    const message = viewOnce ? viewOnce.message : quoted;
    let vType = Object.keys(message)[0];

    if (['imageMessage', 'videoMessage', 'audioMessage'].includes(vType)) {
        try {
            const stream = await downloadContentFromMessage(message[vType], vType.replace('Message', ''));
            let buffer = Buffer.from([]);
            for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
            
            if (vType === 'imageMessage') await sock.sendMessage(from, { image: buffer, caption: "*✅ ᴠɪᴇᴡ-ᴏɴᴄᴇ ɪᴍᴀɢᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ*" }, { quoted: msg });
            else if (vType === 'videoMessage') await sock.sendMessage(from, { video: buffer, caption: "*✅ ᴠɪᴇᴡ-ᴏɴᴄᴇ ᴠɪᴅᴇᴏ ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ*" }, { quoted: msg });
            else if (vType === 'audioMessage') await sock.sendMessage(from, { audio: buffer, mimetype: 'audio/mp4' }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: "*❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ ᴠɪᴇᴡ-ᴏɴᴄᴇ ᴍᴇᴅɪᴀ.*" }, { quoted: msg });
        }
    } else {
        await sock.sendMessage(from, { text: "*❌ ɴᴏᴛ a ᴠɪᴇᴡ-ᴏɴᴄᴇ ᴍᴇᴅɪᴀ ᴍᴇssᴀɢᴇ.*" }, { quoted: msg });
    }
}

module.exports = vvCommand;
