async function hidetagCommand(sock, from, msg, isAdmin, q) {
    if (!isAdmin || !from.endsWith('@g.us')) return await sock.sendMessage(from, { text: "*❌ ᴏɴʟʏ ᴀᴅᴍɪɴ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪɴ ɢʀᴏᴜᴘs.*" }, { quoted: msg });
    
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants.map(p => p.id);
    
    await sock.sendMessage(from, { 
        text: q || "*ᴡʜᴀᴛ's ᴜᴘ ᴇᴠᴇʀʏᴏɴᴇ!*", 
        mentions: participants 
    });
}

module.exports = hidetagCommand;
