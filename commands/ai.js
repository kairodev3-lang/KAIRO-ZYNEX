async function aiCommand(sock, from, msg, isAdmin, session, args) {
    if (!isAdmin) return await sock.sendMessage(from, { text: "*❌ ᴏɴʟʏ ᴏᴡɴᴇʀ/ᴀᴅᴍɪɴ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.*" }, { quoted: msg });
    
    const action = args[0]?.toLowerCase();
    if (action === 'on') {
        session.aiEnabled = true;
        await sock.sendMessage(from, { text: "*✅ ᴀɪ ᴀᴜᴛᴏ-ʀᴇᴘʟʏ ᴇɴᴀʙʟᴇᴅ!*" }, { quoted: msg });
    } else if (action === 'off') {
        session.aiEnabled = false;
        await sock.sendMessage(from, { text: "*❌ ᴀɪ ᴀᴜᴛᴏ-ʀᴇᴘʟʏ ᴅɪsᴀʙʟᴇᴅ!*" }, { quoted: msg });
    } else if (args.length > 0) {
        // Direct query to AI
        const query = args.join(' ');
        try {
            await sock.sendMessage(from, { react: { text: '🤖', key: msg.key } });
            const response = await session.getAIResponse(from, query);
            await sock.sendMessage(from, { text: response }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ ᴀɪ ᴇʀʀᴏʀ: " + e.message }, { quoted: msg });
        }
    } else {
        await sock.sendMessage(from, { text: "*❌ ᴜsᴀɢᴇ:\n.ᴀɪ [ᴏɴ/ᴏғғ] - ᴛᴏɢɢʟᴇ ᴀᴜᴛᴏ-ʀᴇᴘʟʏ*\n*.ᴀɪ [ǫᴜᴇʀʏ] - ᴀsᴋ ᴀɪ sᴏᴍᴇᴛʜɪɴɢ*" }, { quoted: msg });
    }
}

module.exports = aiCommand;
