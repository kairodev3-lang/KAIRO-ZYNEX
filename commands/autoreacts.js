async function autoreactsCommand(sock, from, msg, isAdmin, session, args) {
    if (!isAdmin) return await sock.sendMessage(from, { text: "*❌ ᴏɴʟʏ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.*" }, { quoted: msg });
    
    const action = args[0]?.toLowerCase();
    if (action === 'on') {
        session.autoReact = true;
        await sock.sendMessage(from, { text: "*✅ ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ ᴇɴᴀʙʟᴇᴅ!*" }, { quoted: msg });
    } else if (action === 'off') {
        session.autoReact = false;
        await sock.sendMessage(from, { text: "*❌ ᴀᴜᴛᴏ-ʀᴇᴀᴄᴛ ᴅɪsᴀʙʟᴇᴅ!*" }, { quoted: msg });
    } else {
        await sock.sendMessage(from, { text: "*❌ ᴜsᴀɢᴇ: .ᴀᴜᴛᴏʀᴇᴀᴄᴛs [ᴏɴ/ᴏғғ]*" }, { quoted: msg });
    }
}

module.exports = autoreactsCommand;
