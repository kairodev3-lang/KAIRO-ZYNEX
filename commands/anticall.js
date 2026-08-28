async function anticallCommand(sock, from, msg, isAdmin, botData, saveBotData, userId, args) {
    if (!isAdmin) return await sock.sendMessage(from, { text: "*❌ ᴏɴʟʏ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.*" }, { quoted: msg });
    
    const action = args[0]?.toLowerCase();
    if (action === 'on') {
        botData.antiCall[userId] = true;
        saveBotData();
        await sock.sendMessage(from, { text: "*✅ ᴀɴᴛɪ-ᴄᴀʟʟ ᴇɴᴀʙʟᴇᴅ!*" }, { quoted: msg });
    } else if (action === 'off') {
        botData.antiCall[userId] = false;
        saveBotData();
        await sock.sendMessage(from, { text: "*❌ ᴀɴᴛɪ-ᴄᴀʟʟ ᴅɪsᴀʙʟᴇᴅ!*" }, { quoted: msg });
    } else {
        await sock.sendMessage(from, { text: "*❌ ᴜsᴀɢᴇ: .ᴀɴᴛɪᴄᴀʟʟ [ᴏɴ/ᴏғғ]*" }, { quoted: msg });
    }
}

module.exports = anticallCommand;
