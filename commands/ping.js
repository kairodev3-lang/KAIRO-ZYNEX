const { channelInfo } = require('../lib/messageConfig');

async function pingCommand(sock, from, msg) {
    const start = Date.now();
    const { key } = await sock.sendMessage(from, { text: '*ᴛᴇsᴛɪɴɢ sᴘᴇᴇᴅ...*', ...channelInfo }, { quoted: msg });
    const end = Date.now();
    await sock.sendMessage(from, { text: `> *⚡ ʀᴇsᴘᴏɴsᴇ sᴘᴇᴇᴅ: ${end - start}ᴍs*`, edit: key, ...channelInfo });
}

module.exports = pingCommand;
