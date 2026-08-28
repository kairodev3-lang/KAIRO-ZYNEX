const settings = require('../settings');

async function ownerCommand(sock, from, msg) {
    const ownerText = `*👤 ʙᴏᴛ ᴏᴡɴᴇʀ:* ${settings.ownerName}\n` +
                    `*📱 ɴᴜᴍʙᴇʀ:* +${settings.ownerNumber}\n` +
                    `*🔗 ᴏғғɪᴄɪᴀʟ ᴡʜᴀᴛsᴀᴘᴘ ᴄʜᴀɴɴᴇʟ:*\n` +
                    `*https://whatsapp.com/channel/0029VbCMDOSFnSzHxgIjpw06*`;
    await sock.sendMessage(from, { text: ownerText }, { quoted: msg });
}

module.exports = ownerCommand;
