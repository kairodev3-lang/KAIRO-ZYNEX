const axios = require('axios');

async function tiktokCommand(sock, from, msg, q) {
    if (!q) return await sock.sendMessage(from, { text: "*❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴛɪᴋᴛᴏᴋ ᴜʀʟ.*" }, { quoted: msg });
    
    try {
        const loadEmojis = ['📥', '⏳', '📱'];
        for (const emoji of loadEmojis) {
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        }
        const res = await axios.get(`https://tikwm.com/api/?url=${q}`);
        const videoUrl = res.data.data.play;
        await sock.sendMessage(from, { video: { url: videoUrl }, caption: "*✅ ᴛɪᴋᴛᴏᴋ ᴅᴏᴀɴʟᴏᴀᴅᴇᴅ ʙʏ ᴅʀᴜᴢᴢ x-ᴍᴅ*" }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: "*❌ ᴇʀʀᴏʀ ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ᴛɪᴋᴛᴏᴋ.*" }, { quoted: msg });
    }
}

module.exports = tiktokCommand;
