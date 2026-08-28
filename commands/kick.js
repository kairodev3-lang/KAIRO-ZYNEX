async function kickCommand(sock, from, msg, isAdmin) {
    if (!isAdmin) return await sock.sendMessage(from, { text: "*❌ ᴏɴʟʏ ᴀᴅᴍɪɴ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.*" }, { quoted: msg });
    if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: "*❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.*" }, { quoted: msg });

    const quoted = msg.message?.extendedTextMessage?.contextInfo?.participant || 
                   msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    if (!quoted) return await sock.sendMessage(from, { text: "*❌ ᴘʟᴇᴀsᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀ ᴍᴇssᴀɢᴇ ᴏʀ ᴛᴀɢ sᴏᴍᴇᴏɴᴇ ᴛᴏ ᴋɪᴄᴋ.*" }, { quoted: msg });

    try {
        await sock.groupParticipantsUpdate(from, [quoted], "remove");
        await sock.sendMessage(from, { text: "*✅ ᴜsᴇʀ ᴋɪᴄᴋᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ.*" }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: "*❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴋɪᴄᴋ ᴜsᴇʀ. ᴍᴀᴋᴇ sᴜʀᴇ ɪ ᴀᴍ ᴀɴ ᴀᴅᴍɪɴ.*" }, { quoted: msg });
    }
}

module.exports = kickCommand;
