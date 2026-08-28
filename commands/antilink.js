async function antilinkCommand(sock, from, msg, isAdmin, botData, saveBotData, args) {
    if (!isAdmin || !from.endsWith('@g.us')) return await sock.sendMessage(from, { text: "*❌ ᴏɴʟʏ ᴀᴅᴍɪɴ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪɴ ɢʀᴏᴜᴘs.*" }, { quoted: msg });
    
    const action = args[0]?.toLowerCase();
    if (action === 'on' || action === 'del') {
        botData.antilinkGroups[from] = 'del';
        saveBotData();
        await sock.sendMessage(from, { text: "*✅ ᴀɴᴛɪ-ʟɪɴᴋ (ᴅᴇʟᴇᴛᴇ ᴏɴʟʏ) ᴇɴᴀʙʟᴇᴅ!*" }, { quoted: msg });
    } else if (action === 'kick') {
        botData.antilinkGroups[from] = 'kick';
        saveBotData();
        await sock.sendMessage(from, { text: "*✅ ᴀɴᴛɪ-ʟɪɴᴋ (ᴋɪᴄᴋ + ᴅᴇʟᴇᴛᴇ) ᴇɴᴀʙʟᴇᴅ!*" }, { quoted: msg });
    } else if (action === 'off') {
        delete botData.antilinkGroups[from];
        saveBotData();
        await sock.sendMessage(from, { text: "*❌ ᴀɴᴛɪ-ʟɪɴᴋ ᴅɪsᴀʙʟᴇᴅ!*" }, { quoted: msg });
    } else {
        await sock.sendMessage(from, { text: "*❌ ᴜsᴀɢᴇ: .ᴀɴᴛɪʟɪɴᴋ [ᴏɴ/ᴏғғ/ᴋɪᴄᴋ]*" }, { quoted: msg });
    }
}

module.exports = antilinkCommand;
