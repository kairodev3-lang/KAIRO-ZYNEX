async function command(sock, from, msg, isAdmin, botData, saveBotData, q) {
    if (!from.endsWith('@g.us')) return sock.sendMessage(from,{text:'*❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ғᴏʀ ɢʀᴏᴜᴘs ᴏɴʟʏ*'},{quoted:msg});
    if (!isAdmin) return sock.sendMessage(from,{text:'*❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs*'},{quoted:msg});
    const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
    const target = ctx.mentionedJid?.[0] || ctx.participant;
    const match = String(q || '').match(/(?:^|\s)(\d{1,6})(?:\s|$)/);
    const limit = match ? parseInt(match[1], 10) : null;
    if (!target) return sock.sendMessage(from,{text:'*❌ ᴜsᴀɢᴇ: .ᴍᴜᴛᴇ @ᴜsᴇʀ*\n*ᴏᴘᴛɪᴏɴᴀʟ: .ᴍᴜᴛᴇ @ᴜsᴇʀ 30  → ᴋɪᴄᴋ ᴀғᴛᴇʀ 30 ᴍᴇssᴀɢᴇs*'},{quoted:msg});
    botData.mutedGroups ||= {};
    botData.mutedGroups[from] ||= {};
    botData.mutedGroups[from][target] = { limit, count: 0, enabled: true };
    saveBotData();
    const suffix = limit ? `\n*ʟɪᴍɪᴛ:* *${limit} ᴍᴇssᴀɢᴇs*\n*ᴀᴄᴛɪᴏɴ:* *ᴅᴇʟᴇᴛᴇ + ᴋɪᴄᴋ ᴀғᴛᴇʀ ʟɪᴍɪᴛ*` : '\n*ᴀᴄᴛɪᴏɴ:* *ᴅᴇʟᴇᴛᴇ ᴇᴠᴇʀʏ ᴍᴇssᴀɢᴇ — ɴᴏ ᴀᴜᴛᴏ-ᴋɪᴄᴋ*';
    await sock.sendMessage(from,{text:`_*🔇 ᴍᴜᴛᴇ ᴀᴄᴛɪᴠᴇ*_\n*ᴜsᴇʀ:* @${target.split('@')[0]}${suffix}\n\n*ᴜsᴇ .ᴜɴᴍᴜᴛᴇ @${target.split('@')[0]} ᴛᴏ ʀᴇᴍᴏᴠᴇ ᴛʜᴇ ᴍᴜᴛᴇ.*`,mentions:[target]},{quoted:msg});
}
module.exports=command;
