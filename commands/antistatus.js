async function antistatusCommand(sock, from, msg, isAdmin, botData, saveBotData, args) {
    if (!from.endsWith('@g.us')) return await sock.sendMessage(from, { text: "*❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴏɴʟʏ ᴡᴏʀᴋs ɪɴ ɢʀᴏᴜᴘs.*" }, { quoted: msg });
    if (!isAdmin) return await sock.sendMessage(from, { text: "*❌ ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.*" }, { quoted: msg });

    const action = args[0]?.toLowerCase();
    if (!botData.antiStatusGroups) botData.antiStatusGroups = {};

    if (action === 'on') {
        botData.antiStatusGroups[from] = true;
        saveBotData();
        await sock.sendMessage(from, { text: "*✅ ᴀɴᴛɪ-sᴛᴀᴛᴜs ᴇɴᴀʙʟᴇᴅ!*\n\n*ᴀɴʏ sᴛᴀᴛᴜs sʜᴀʀᴇᴅ ɪɴ ᴛʜɪs ɢʀᴏᴜᴘ ᴡɪʟʟ ʙᴇ ᴀᴜᴛᴏᴍᴀᴛɪᴄᴀʟʟʏ ᴅᴇʟᴇᴛᴇᴅ.*" }, { quoted: msg });
    } else if (action === 'off') {
        botData.antiStatusGroups[from] = false;
        saveBotData();
        await sock.sendMessage(from, { text: "*❌ ᴀɴᴛɪ-sᴛᴀᴛᴜs ᴅɪsᴀʙʟᴇᴅ!*" }, { quoted: msg });
    } else {
        await sock.sendMessage(from, { text: "*❌ ᴜsᴀɢᴇ: .ᴀɴᴛɪsᴛᴀᴛᴜs [ᴏɴ/ᴏғғ]*" }, { quoted: msg });
    }
}

module.exports = antistatusCommand;
