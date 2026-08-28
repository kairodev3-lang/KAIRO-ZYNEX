async function kickAllCommand(sock, from, msg, isAdmin) {
    if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '*❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ғᴏʀ ɢʀᴏᴜᴘs.*' }, { quoted: msg });
    if (!isAdmin) return sock.sendMessage(from, { text: '*❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs.*' }, { quoted: msg });
    try {
        const meta = await sock.groupMetadata(from);
        const botId = sock.user?.id?.split(':')[0] + '@s.whatsapp.net';
        const targets = meta.participants
            .filter(p => !p.admin && p.id !== botId && !p.id.includes(sock.user?.id?.split(':')[0] || '___'))
            .map(p => p.id);
        if (!targets.length) return sock.sendMessage(from, { text: '*ℹ️ ɴᴏ ɴᴏɴ-ᴀᴅᴍɪɴ ᴍᴇᴍʙᴇʀs ᴛᴏ ʀᴇᴍᴏᴠᴇ.*' }, { quoted: msg });
        await sock.groupParticipantsUpdate(from, targets, 'remove');
        await sock.sendMessage(from, { text: `*✅ ᴋɪᴄᴋᴀʟʟ ᴄᴏᴍᴘʟᴇᴛᴇ.*\n\n👥 ʀᴇᴍᴏᴠᴇᴅ: ${targets.length}` }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: '*❌ ғᴀɪʟᴇᴅ. ᴍᴀᴋᴇ sᴜʀᴇ ᴛʜᴇ ʙᴏᴛ ɪs ᴀɴ ᴀᴅᴍɪɴ ᴀɴᴅ ᴄᴀɴ ʀᴇᴍᴏᴠᴇ ᴍᴇᴍʙᴇʀs.*' }, { quoted: msg });
    }
}
module.exports = kickAllCommand;
