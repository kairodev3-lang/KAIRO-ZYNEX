async function command(sock, from, msg, isAdmin, botData, saveBotData, args) {
    if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '*❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ғᴏʀ ɢʀᴏᴜᴘs.*' }, { quoted: msg });
    if (!isAdmin) return sock.sendMessage(from, { text: '*❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs.*' }, { quoted: msg });
    const action = String(args?.[0] || '').trim().toLowerCase();
    botData.goodbyeGroups ||= {};
    if (!['on', 'off'].includes(action)) {
        const enabled = !!botData.goodbyeGroups[from];
        return sock.sendMessage(from, { text: `*👋 ɢᴏᴏᴅʙʏᴇ: ${enabled ? 'ᴏɴ ✅' : 'ᴏғғ ❌'}*\n*ᴜsᴀɢᴇ: .ɢᴏᴏᴅʙʏᴇ ᴏɴ/ᴏғғ*` }, { quoted: msg });
    }
    if (action === 'on') botData.goodbyeGroups[from] = true;
    else delete botData.goodbyeGroups[from];
    saveBotData();
    await sock.sendMessage(from, { text: action === 'on' ? '*👋 ɢᴏᴏᴅʙʏᴇ ᴇɴᴀʙʟᴇᴅ ✅*\n*ᴍᴇᴍʙᴇʀs ᴡʜᴏ ʟᴇᴀᴠᴇ ᴡɪʟʟ ʀᴇᴄᴇɪᴠᴇ ᴀ ɢᴏᴏᴅʙʏᴇ ᴍᴇssᴀɢᴇ.*' : '*👋 ɢᴏᴏᴅʙʏᴇ ᴅɪsᴀʙʟᴇᴅ ❌*' }, { quoted: msg });
}
module.exports = command;
