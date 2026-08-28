async function deleteCommand(sock, from, msg, isAdmin) {
    if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '*❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ғᴏʀ ɢʀᴏᴜᴘs.*' }, { quoted: msg });
    if (!isAdmin) return sock.sendMessage(from, { text: '*❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs.*' }, { quoted: msg });
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    if (!ctx?.stanzaId) return sock.sendMessage(from, { text: '*❌ ʀᴇᴘʟʏ ᴛᴏ ᴛʜᴇ ᴍᴇssᴀɢᴇ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ ᴅᴇʟᴇᴛᴇ.*' }, { quoted: msg });
    const key = {
        remoteJid: from,
        id: ctx.stanzaId,
        participant: ctx.participant || undefined,
        fromMe: false
    };
    try {
        await sock.sendMessage(from, { delete: key });
        await sock.sendMessage(from, { react: { text: '🗑️', key: msg.key } });
    } catch (e) {
        await sock.sendMessage(from, { text: '*❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴅᴇʟᴇᴛᴇ. ᴍᴀᴋᴇ sᴜʀᴇ ᴛʜᴇ ʙᴏᴛ ɪs ᴀɴ ᴀᴅᴍɪɴ.*' }, { quoted: msg });
    }
}
module.exports = deleteCommand;
