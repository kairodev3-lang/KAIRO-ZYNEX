async function command(sock, from, msg, isAdmin, botData, saveBotData, args) {
    if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '*❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ғᴏʀ ɢʀᴏᴜᴘs.*' }, { quoted: msg });
    if (!isAdmin) return sock.sendMessage(from, { text: '*❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs.*' }, { quoted: msg });
    const action = String(args?.[0] || '').trim().toLowerCase();
    botData.welcomeGroups ||= {};
    if (!['on', 'off'].includes(action)) {
        const enabled = !!botData.welcomeGroups[from];
        return sock.sendMessage(from, { text: `*👋 ᴡᴇʟᴄᴏᴍᴇ: ${enabled ? 'ᴏɴ ✅' : 'ᴏғғ ❌'}*\n*ᴜsᴀɢᴇ: .ᴡᴇʟᴄᴏᴍᴇ ᴏɴ/ᴏғғ*` }, { quoted: msg });
    }
    if (action === 'on') botData.welcomeGroups[from] = true;
    else delete botData.welcomeGroups[from];
    saveBotData();
    await sock.sendMessage(from, { text: action === 'on' ? '*👋 ᴡᴇʟᴄᴏᴍᴇ ᴇɴᴀʙʟᴇᴅ ✅*\n*ɴᴇᴡ ᴍᴇᴍʙᴇʀs ᴡɪʟʟ ʙᴇ ᴡᴇʟᴄᴏᴍᴇᴅ.*' : '*👋 ᴡᴇʟᴄᴏᴍᴇ ᴅɪsᴀʙʟᴇᴅ ❌*' }, { quoted: msg });
}
module.exports = command;
