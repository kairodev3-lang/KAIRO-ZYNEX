async function setnameCommand(sock, from, msg, isAdmin, botData, saveBotData, userId, q) {
    if (!isAdmin) return await sock.sendMessage(from, { text: "*❌ ᴏɴʟʏ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.*" }, { quoted: msg });
    if (!q) return await sock.sendMessage(from, { text: "*❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ɴᴀᴍᴇ.*" }, { quoted: msg });
    
    botData.userNames[userId] = q;
    saveBotData();
    await sock.sendMessage(from, { text: `*✅ ɴᴀᴍᴇ sᴇᴛ ᴛᴏ: ${q}*` }, { quoted: msg });
}

module.exports = setnameCommand;
