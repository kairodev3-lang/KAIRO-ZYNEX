const FEATURES = {
    'anti-sticker': ['antiStickerGroups', 'sᴛɪᴄᴋᴇʀs'],
    'anti-voice': ['antiVoiceGroups', 'ᴠᴏɪᴄᴇ ᴍᴇssᴀɢᴇs'],
    'anti-mentioned': ['antiMentionGroups', 'ᴍᴇɴᴛɪᴏɴs']
};
async function command(sock, from, msg, isAdmin, botData, saveBotData, args, feature) {
    if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '*❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴏɴʟʏ ᴡᴏʀᴋs ɪɴ ɢʀᴏᴜᴘs.*' }, { quoted: msg });
    if (!isAdmin) return sock.sendMessage(from, { text: '*❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs.*' }, { quoted: msg });
    const config = FEATURES[feature];
    const [store, label] = config;
    botData[store] ||= {};
    const action = String(args?.[0] || '').toLowerCase();
    if (!['on', 'off'].includes(action)) return sock.sendMessage(from, { text: `*❌ ᴜsᴀɢᴇ: .${feature} on/off*\n*ᴄᴜʀʀᴇɴᴛ: ${botData[store][from] ? 'ᴏɴ' : 'ᴏғғ'}*` }, { quoted: msg });
    if (action === 'on') botData[store][from] = true;
    else delete botData[store][from];
    saveBotData();
    await sock.sendMessage(from, { text: `*${action === 'on' ? '✅' : '❌'} ᴀɴᴛɪ-${label} ${action === 'on' ? 'ᴇɴᴀʙʟᴇᴅ' : 'ᴅɪsᴀʙʟᴇᴅ'}*` }, { quoted: msg });
}
module.exports = command;
