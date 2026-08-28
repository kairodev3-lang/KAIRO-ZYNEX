async function command(sock, from, msg, isAdmin, botData, saveBotData) {
    if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '*❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ғᴏʀ ɢʀᴏᴜᴘs.*' }, { quoted: msg });
    if (!isAdmin) return sock.sendMessage(from, { text: '*❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs.*' }, { quoted: msg });
    const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
    const target = ctx.mentionedJid?.[0] || ctx.participant;
    botData.mutedGroups ||= {};
    botData.mutedGroups[from] ||= {};
    if (!target || !botData.mutedGroups[from][target]) return sock.sendMessage(from, { text: '*❌ ʀᴇᴘʟʏ ᴛᴏ ᴛʜᴇ ᴜsᴇʀ ᴍᴇssᴀɢᴇ ᴏʀ ᴍᴇɴᴛɪᴏɴ ᴛʜᴇ ᴜsᴇʀ.*\n*ᴜsᴀɢᴇ: .ᴜɴᴍᴜᴛᴇ @ᴜsᴇʀ*' }, { quoted: msg });
    delete botData.mutedGroups[from][target];
    if (!Object.keys(botData.mutedGroups[from]).length) delete botData.mutedGroups[from];
    saveBotData();
    await sock.sendMessage(from, { text: `*🔊 ᴜɴᴍᴜᴛᴇᴅ:* @${target.split('@')[0]} ✅`, mentions: [target] }, { quoted: msg });
}
module.exports = command;
