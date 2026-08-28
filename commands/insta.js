const axios = require('axios');

async function instaCommand(sock, from, msg, q) {
    if (!q) return await sock.sendMessage(from, { text: "*❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀɴ ɪɴsᴛᴀɢʀᴀᴍ ᴜʀʟ.*" }, { quoted: msg });
    
    try {
        const loadEmojis = ['📥', '⏳', '📸'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }
        // Using a generic downloader API for Instagram
        const res = await axios.get(`https://api.vreden.my.id/api/igdownload?url=${encodeURIComponent(q)}`);
        if (res.data.status && res.data.result.length > 0) {
            for (let item of res.data.result) {
                if (item.type === 'video') {
                    await sock.sendMessage(from, { video: { url: item.url }, caption: "*✅ ɪɴsᴛᴀɢʀᴀᴍ ᴠɪᴅᴇᴏ*" });
                } else {
                    await sock.sendMessage(from, { image: { url: item.url }, caption: "*✅ ɪɴsᴛᴀɢʀᴀᴍ ɪᴍᴀɢᴇ*" });
                }
            }
        } else {
            throw new Error("ɴᴏ ᴍᴇᴅɪᴀ ғᴏᴜɴᴅ");
        }
    } catch (e) {
        await sock.sendMessage(from, { text: "*❌ ᴇʀʀᴏʀ ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ɪɴsᴛᴀɢʀᴀᴍ ᴄᴏɴᴛᴇɴᴛ. ᴍᴀᴋᴇ sᴜʀᴇ ᴛʜᴇ ʟɪɴᴋ ɪs ᴘᴜʙʟɪᴄ.*" }, { quoted: msg });
    }
}

module.exports = instaCommand;
