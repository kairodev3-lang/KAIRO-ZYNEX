async function tagallCommand(sock, from, msg, isAdmin, q) {
    if (!isAdmin || !from.endsWith('@g.us')) return await sock.sendMessage(from, { text: "*❌ ᴏɴʟʏ ᴀᴅᴍɪɴ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪɴ ɢʀᴏᴜᴘs.*" }, { quoted: msg });
    
    const groupMetadata = await sock.groupMetadata(from);
    const participants = groupMetadata.participants;
    
    let tagText = `📢 *ᴛᴀɢ ᴀʟʟ*\n*ᴍᴇssᴀɢᴇ:* ${q || 'ʜᴇʟʟᴏ ᴇᴠᴇʀʏᴏɴᴇ ɪɴ ᴛʜᴇ ɢʀᴏᴜᴘ🙌'}\n`;
    for (let mem of participants) {
        tagText += `𖤗 @${mem.id.split('@')[0]}\n`;
    }
    
    await sock.sendMessage(from, { 
        text: tagText, 
        mentions: participants.map(p => p.id) 
    }, { quoted: msg });
}

module.exports = tagallCommand;
